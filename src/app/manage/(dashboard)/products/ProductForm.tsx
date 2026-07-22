'use client';

import { useActionState } from 'react';
import { ActionState } from '@/app/manage/actions';
import { ManagerProduct } from '@/types/managerProduct';

const initialState: ActionState = { error: null };

interface ProductFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  product?: ManagerProduct;
  submitLabel: string;
}

export default function ProductForm({ action, product, submitLabel }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <div>
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
        />
      </div>

      <div>
        <label htmlFor="brand" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Brand
        </label>
        <input
          id="brand"
          name="brand"
          type="text"
          required
          defaultValue={product?.brand}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
        />
      </div>

      <div>
        <label htmlFor="thumbnail" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Thumbnail
        </label>
        {product?.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail} alt="" className="h-20 w-20 rounded-lg object-cover mb-2 bg-zinc-900" />
        )}
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/*"
          required={!product}
          className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
      </div>

      <div>
        <label htmlFor="sizes" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
          Sizes
        </label>
        <input
          id="sizes"
          name="sizes"
          type="text"
          placeholder="7,8,9,10,11"
          defaultValue={product?.sizes ?? '7,8,9,10,11'}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
        />
        <p className="mt-1 text-xs text-zinc-500">Comma-separated sizes available for this product.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={product?.is_active ?? true}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-orange-600"
        />
        Active (visible on the storefront)
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
      >
        {pending ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
