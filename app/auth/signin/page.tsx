'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(oauthError === 'oauth_failed' ? 'Google authentication failed. Please try again.' : '');
  const [success, setSuccess] = useState(registered === 'true' ? 'Account created successfully. Please sign in.' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
      } else {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-canvas-soft flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-md">
        {/* Security stickers above form */}
        <motion.div
          className="flex justify-center gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { icon: ShieldCheck, label: 'SECURED' },
            { icon: Lock, label: 'ENCRYPTED' },
            { icon: Fingerprint, label: 'VERIFIED' },
          ].map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              className="flex items-center gap-1.5 border border-hairline bg-canvas px-2 py-1"
              whileHover={{ scale: 1.05, borderColor: 'var(--color-link)' }}
            >
              <Icon size={10} className="text-link" strokeWidth={2} />
              <span className="text-[8px] font-sans font-bold tracking-widest text-body uppercase">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-canvas border border-ink p-8 shadow-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-hairline pb-4 mb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-body font-sans block mb-1">
              Verification Protocol
            </span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Access Portal
            </h2>
          </div>

          {error && (
            <motion.div
              className="bg-red-50 text-red-700 border border-red-200 p-4 text-xs font-sans mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <strong>ERROR:</strong> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="bg-green-50 text-green-700 border border-green-200 p-4 text-xs font-sans mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <strong>SUCCESS:</strong> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. employee@yourcompany.com"
                className="w-full bg-canvas text-ink border border-hairline hover:border-ink focus:border-ink outline-none px-4 py-3 rounded-none transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-canvas text-ink border border-hairline hover:border-ink focus:border-ink outline-none px-4 py-3 pr-10 rounded-none transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-4 py-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors duration-200 cursor-pointer disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? 'Authenticating...' : 'Sign In with Email'}
            </motion.button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-hairline"></div>
            <span className="flex-shrink mx-4 text-xs text-body font-bold font-sans uppercase">Or</span>
            <div className="flex-grow border-t border-hairline"></div>
          </div>

          <Link
            href="/api/auth/google"
            className="w-full block text-center bg-canvas text-ink hover:bg-ink hover:text-canvas border border-ink px-4 py-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors duration-200 cursor-pointer"
          >
            Sign In with Google
          </Link>

          <div className="mt-6 border-t border-hairline pt-4 text-center">
            <p className="text-xs text-body font-sans">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-link font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Security notice */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] text-body font-sans flex items-center justify-center gap-1.5">
            <Lock size={10} />
            Protected by 256-bit SSL encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-ink border-t-transparent animate-spin"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
