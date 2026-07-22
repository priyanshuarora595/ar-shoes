'use client';

import { logoutAction } from './actions';

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => logoutAction()}
      className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
    >
      Log out
    </button>
  );
}
