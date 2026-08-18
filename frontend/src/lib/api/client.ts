import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiErrorResponse } from '@/types/api';

// ============================================================
// Centralized Axios API Client
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

/**
 * In-memory access token storage.
 * NOT in localStorage, NOT in sessionStorage, NOT in IndexedDB.
 * This is cleared on page reload, which is the intended security behavior.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Centralized Axios instance.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // Send HttpOnly cookies for refresh token
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor ----
// Attach access token from memory to every outgoing request

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
// Handle 401 → attempt token refresh → retry or logout
// Uses a refresh lock to prevent concurrent refresh storms

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown | null): void {
  failedQueue.forEach(async (promise) => {
    if (error) {
      promise.reject(error);
    } else {
      try {
        const response = await apiClient(promise.config);
        promise.resolve(response);
      } catch (err) {
        promise.reject(err);
      }
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestUrl = originalRequest?.url || '';
    const isAuthBootstrapRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    // Only attempt refresh for protected requests, and only once per request.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthBootstrapRequest) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — the refresh token is in the HttpOnly cookie
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
        }

        isRefreshing = false;
        processQueue(null);

        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Refresh failed — clear auth state and redirect to login
        setAccessToken(null);

        // Only redirect if we're in the browser
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:expired'));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
