import Link from 'next/link';
import { managerFetch, getCurrentManager } from '@/lib/managerApi';
import { ManagerProduct, PaginatedResponse } from '@/types/managerProduct';

async function getProducts(): Promise<ManagerProduct[]> {
  const res = await managerFetch('/api/admin/products/');
  if (!res.ok) {
    throw new Error(`Failed to load products (${res.status})`);
  }
  const data: PaginatedResponse<ManagerProduct> = await res.json();
  return data.results;
}

export default async function ManagerProductListPage() {
  const [products, manager] = await Promise.all([getProducts(), getCurrentManager()]);
  const isManager = manager?.isManager ?? false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-outfit text-xl font-semibold text-white">Products</h1>
        {isManager && (
          <Link
            href="/manage/products/new"
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            + New Product
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-950/40">
                <td className="px-4 py-3 text-white">{product.name}</td>
                <td className="px-4 py-3 text-zinc-400">{product.brand}</td>
                <td className="px-4 py-3 text-zinc-400">{product.variants.length}</td>
                <td className="px-4 py-3">
                  <span className={`h-2 w-2 rounded-full inline-block ${product.is_active ? 'bg-green-500' : 'bg-zinc-700'}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/manage/products/${product.id}/edit`} className="text-orange-500 hover:text-orange-400 text-xs font-semibold">
                    {isManager ? 'Edit' : 'Manage variants'}
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
