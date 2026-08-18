'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { canAccessRoute } from '@/lib/auth/permissions';
import ForbiddenPage from '@/app/403/page';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isAuthenticated, isLoading, isInitialized, initialize, clearSession } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      router.replace('/login');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [clearSession, router]);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading || !isAuthenticated) return <LoadingScreen />;
  if (!canAccessRoute(role, pathname)) return <ForbiddenPage />;
  return <>{children}</>;
}
