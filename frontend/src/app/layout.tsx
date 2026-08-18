import type { Metadata } from 'next';
import AppProvider from '@/providers/AppProvider';
import './globals.css';

// ============================================================
// Root Layout
// Wraps the entire application with providers
// ============================================================

export const metadata: Metadata = {
  title: 'My Style — Clothing Sales Management System',
  description:
    'My Style - Professional clothing sales management system with inventory tracking, POS, and reporting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
