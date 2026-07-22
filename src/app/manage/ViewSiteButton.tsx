'use client';

import { ArrowLeft } from 'lucide-react';
import { logoutAndViewSiteAction } from './actions';

export default function ViewSiteButton() {
  return (
    <button
      type="button"
      onClick={() => logoutAndViewSiteAction()}
      className="hidden sm:inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      View Site
    </button>
  );
}
