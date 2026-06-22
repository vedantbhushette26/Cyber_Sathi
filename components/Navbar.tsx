'use client';

import { useRouter } from 'next/navigation';

export default function ClientNavbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      if (res.ok) {
        router.refresh();
        router.push('/');
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-ink text-canvas px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink hover:bg-canvas hover:text-ink transition-colors duration-200 cursor-pointer"
    >
      Sign Out
    </button>
  );
}
