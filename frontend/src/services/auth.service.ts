import apiClient, { setAccessToken } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { User, LoginCredentials, LoginResponse, ChangePasswordRequest } from '@/types/auth';

// ============================================================
// Authentication Service
// All auth API calls go through the centralized Axios client
// ============================================================

const AUTH_BASE = '/auth';

/**
 * Login with username and password.
 * Backend returns access token in response body and sets refresh token as HttpOnly cookie.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    `${AUTH_BASE}/login`,
    credentials
  );

  const { accessToken, user } = response.data.data;

  // Store access token in memory only
  setAccessToken(accessToken);

  return { accessToken, user };
}

/**
 * Logout.
 * Backend clears the HttpOnly refresh token cookie.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(`${AUTH_BASE}/logout`);
  } finally {
    // Always clear client-side state, even if the API call fails
    setAccessToken(null);
  }
}

/**
 * Get current authenticated user.
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(`${AUTH_BASE}/me`);
  return response.data.data;
}

/**
 * Refresh access token.
 * The refresh token is sent automatically via HttpOnly cookie.
 */
export async function refreshToken(): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    `${AUTH_BASE}/refresh`
  );

  const session = response.data.data;
  setAccessToken(session.accessToken);

  return session;
}

/**
 * Change password.
 * Password values are sent over HTTPS and never stored in the browser.
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/change-password`, data);
}

export async function updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'gender' | 'position' | 'avatar'>>): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(`${AUTH_BASE}/me`, data);
  return response.data.data;
}
