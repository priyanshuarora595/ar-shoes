'use client';

import { useActionState } from 'react';
import { loginAction, ActionState } from '../actions';

const initialState: ActionState = { error: null };

export default function ManagerLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50"
            />
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
