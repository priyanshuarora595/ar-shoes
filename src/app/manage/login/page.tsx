'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { loginAction, ActionState } from '../actions';

const initialState: ActionState = { error: null };

export default function ManagerLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to website
        </Link>

        <h1 className="font-outfit text-xl font-semibold text-white mb-1">Manager Login</h1>
        <p className="text-sm text-zinc-500 mb-8">Sign in to manage the product catalog.</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-orange-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
