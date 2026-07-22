'use client';

import { useActionState, useState } from 'react';
import { updateVariantAction, deleteVariantAction, ActionState } from '@/app/manage/actions';
import { ManagerVariant } from '@/types/managerProduct';

const initialState: ActionState = { error: null };

interface VariantRowProps {
  variant: ManagerVariant;
  productId: string;
  canDelete: boolean;
}

export default function VariantRow({ variant, productId, canDelete }: VariantRowProps) {
  const boundUpdate = updateVariantAction.bind(null, String(variant.id), productId);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirm(`Delete the "${variant.color}" variant? This can't be undone.`)) return;
    setDeleting(true);
    await deleteVariantAction(String(variant.id), productId);
  };

  return (
    <form action={formAction} className="rounded-xl border border-zinc-800 p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Color</label>
          <input
            name="color"
            type="text"
            required
            defaultValue={variant.color}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Color Hex</label>
          <input
            name="color_hex"
            type="text"
            defaultValue={variant.color_hex}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Thumbnail</label>
          {variant.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variant.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover mb-1.5 bg-zinc-900" />
          )}
          <input
            name="thumbnail"
            type="file"
            accept="image/*"
            className="w-full text-xs text-zinc-300 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">DeepAR Effect</label>
          {variant.deepar_effect ? (
            <p className="text-xs text-green-400 mb-1.5 truncate">✓ uploaded</p>
          ) : (
            <p className="text-xs text-zinc-600 mb-1.5">none yet</p>
          )}
          <input
            name="deepar_effect"
            type="file"
            accept=".deepar"
            className="w-full text-xs text-zinc-300 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={variant.is_active}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-orange-600"
          />
          Active
        </label>

        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {pending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
