'use client';

import { useState } from 'react';
import { deleteProductAction } from '@/app/manage/actions';

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (pending) return;
    if (!confirm(`Delete "${productName}" and all of its variants? This can't be undone.`)) return;
    setPending(true);
    await deleteProductAction(productId);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-xl border border-red-900/50 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete Product'}
    </button>
  );
}
