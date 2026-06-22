'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  name: string | null;
  email: string;
  role: string;
}

export default function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <nav className="flex items-center gap-6 text-sm font-bold tracking-wider uppercase font-sans">
        <Link href="/" className="hover:text-link transition-colors">Home</Link>
      </nav>
    );
  }

  return (
    <>
      {/* Left Nav */}
      <nav className="flex items-center gap-6 text-sm font-bold tracking-wider uppercase font-sans">
        <Link href="/" className="hover:text-link transition-colors">Home</Link>
        {user && (
          <>
            <Link href="/dashboard" className="hover:text-link transition-colors">Dashboard</Link>
            <Link href="/training" className="hover:text-link transition-colors">Training</Link>
            <Link href="/suraksha-sakhi" className="hover:text-link transition-colors text-link">Suraksha Sakhi</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="hover:text-link transition-colors text-red-600">Admin</Link>
        )}
      </nav>

      {/* Right Controls */}
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-body hidden md:inline">
            {user.name} ({user.role === 'ADMIN' ? 'Admin' : 'User'})
          </span>
          <button
            onClick={handleSignOut}
            className="bg-ink text-canvas px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink hover:bg-canvas hover:text-ink transition-colors duration-200 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 font-bold uppercase tracking-wider">
          <Link
            href="/auth/signin"
            className="border border-ink px-4 py-2 hover:bg-ink hover:text-canvas transition-colors duration-200 text-xs"
          >
            Sign In
          </Link>
        </div>
      )}
    </>
  );
}
