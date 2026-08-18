import { redirect } from 'next/navigation';

// ============================================================
// Root Page — Redirects to Dashboard
// ============================================================

export default function HomePage() {
  redirect('/dashboard');
}
