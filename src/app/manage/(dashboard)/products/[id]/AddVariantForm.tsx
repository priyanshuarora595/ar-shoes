'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createVariantAction, ActionState } from '@/app/manage/actions';

const initialState: ActionState = { error: null };

export default function AddVariantForm({ productId }: { productId: string }) {
  const boundCreate = createVariantAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundCreate, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  // Reset the form after a successful submit. Deliberately not wrapping
  // formAction in a plain closure to do this inline - Next.js couldn't
  // resolve that as a real Server Action reference and silently fell back
  // to a plain form POST that never actually called createVariantAction.
  useEffect(() => {
    if (pending) {
      hasSubmitted.current = true;
      return;
    }
    if (hasSubmitted.current && !state.error) {
      formRef.current?.reset();
      hasSubmitted.current = false;
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-dashed border-zinc-700 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Add a new color variant</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Color</label>
          <input
            name="color"
            type="text"
            required
            placeholder="e.g. Triple White"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Color Hex</label>
          <input
            name="color_hex"
            type="text"
            placeholder="#F5F5F5"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Thumbnail</label>
          <input
            name="thumbnail"
            type="file"
            accept="image/*"
            required
            className="w-full text-xs text-zinc-300 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">DeepAR Effect</label>
          <input
            name="deepar_effect"
            type="file"
            accept=".deepar"
            className="w-full text-xs text-zinc-300 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {pending ? 'Adding...' : '+ Add Variant'}
      </button>
    </form>
  );
}
