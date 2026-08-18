// ============================================================
// Authentication Types
// Only non-sensitive user information stored on the frontend
// ============================================================

/**
 * Backend user roles.
 * Used for frontend UI filtering only — backend enforces real authorization.
 */
export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  USER = 'user',
}

/**
 * User profile returned by GET /auth/me.
 * NEVER includes password, passwordHash, refreshToken, or JWT secrets.
 */
export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  position?: string;
  role: UserRole;
  permissions?: string[];
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response from the backend.
 * The access token may be returned in the response body.
 * The refresh token should be set as an HttpOnly cookie by the backend.
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
}

/**
 * Change password request.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication state managed by the frontend.
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
