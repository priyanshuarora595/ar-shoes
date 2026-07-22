import { redirect } from 'next/navigation';
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
      <h1 className="font-outfit text-xl font-semibold text-white mb-6">New Product</h1>
      <ProductForm action={createProductAction} submitLabel="Create Product" />
    </div>
  );
}
