import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { managerFetch, getCurrentManager } from '@/lib/managerApi';
import { ManagerProduct } from '@/types/managerProduct';
import ProductForm from '../../ProductForm';
import VariantRow from '../VariantRow';
import AddVariantForm from '../AddVariantForm';
import DeleteProductButton from '../DeleteProductButton';
import { updateProductAction } from '@/app/manage/actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<ManagerProduct | null> {
  const res = await managerFetch(`/api/admin/products/${id}/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  return res.json();
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, manager] = await Promise.all([getProduct(id), getCurrentManager()]);

  if (!product) {
    notFound();
  }

  const isManager = manager?.isManager ?? false;
  const boundUpdate = updateProductAction.bind(null, id);

  return (
    <div>
      <Link
        href="/manage/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Products
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-outfit text-xl font-semibold text-white">Edit Product</h1>
        {isManager && <DeleteProductButton productId={id} productName={product.name} />}
      </div>

      {isManager ? (
        <ProductForm action={boundUpdate} product={product} submitLabel="Save Changes" />
      ) : (
        <div className="max-w-xl rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
          <span className="text-white font-medium">{product.brand} {product.name}</span> - only Managers can edit
          product details. You can still manage this product&apos;s color variants below.
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-outfit text-lg font-semibold text-white mb-4">Color Variants</h2>
        <div className="flex flex-col gap-4">
          {product.variants.map((variant) => (
            <VariantRow key={variant.id} variant={variant} productId={id} canDelete={isManager} />
          ))}
          <AddVariantForm productId={id} />
        </div>
      </div>
    </div>
  );
}
