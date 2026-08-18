import { create } from 'zustand';
import type { LoginCredentials, User } from '@/types/auth';
import { UserRole } from '@/types/auth';
import * as authService from '@/services/auth.service';
import { setAccessToken } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
}

let initializationPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: UserRole.USER,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const session = await authService.login(credentials);
      set({
        user: session.user,
        role: session.user.role,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      throw error;
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
      set({ isLoading: true });
      try {
        const session = await authService.refreshToken();
        set({
          user: session.user,
          role: session.user.role,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch {
        setAccessToken(null);
        set({
          user: null,
          role: UserRole.USER,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      } finally {
        initializationPromise = null;
      }
    })();
    return initializationPromise;
  },

  setUser: (user) => set({ user, role: user.role, isAuthenticated: true }),

  clearSession: () => {
    setAccessToken(null);
    set({ user: null, role: UserRole.USER, isAuthenticated: false, isLoading: false });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      get().clearSession();
    }
  },
}));
