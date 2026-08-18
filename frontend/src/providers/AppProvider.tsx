'use client';

import React from 'react';
import AntdProvider from './AntdProvider';
import QueryProvider from './QueryProvider';

// ============================================================
// Root Application Provider
// Composes all providers in the correct order
// ============================================================

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <AntdProvider>
        {children}
      </AntdProvider>
    </QueryProvider>
  );
}
