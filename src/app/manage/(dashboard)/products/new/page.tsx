import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCurrentManager } from '@/lib/managerApi';
import ProductForm from '../ProductForm';
import { createProductAction } from '@/app/manage/actions';

export default async function NewProductPage() {
  const manager = await getCurrentManager();
  if (!manager?.isManager) {
    redirect('/manage/products');
  }

  return (
    <div>
      <Link
        href="/manage/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Products
      </Link>

      <h1 className="font-outfit text-xl font-semibold text-white mb-6">New Product</h1>
      <ProductForm action={createProductAction} submitLabel="Create Product" />
    </div>
  );
}
