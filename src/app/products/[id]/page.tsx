import React from 'react';
import { notFound } from 'next/navigation';
import { Orbit } from 'lucide-react';
import { ProductService } from '../../../services/ProductService';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found - Aura AR',
    };
  }

  return {
    title: `${product.brand} ${product.name} - Aura AR`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-50 relative overflow-hidden flex flex-col">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-orange-600/3 blur-[130px]" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/2 blur-[150px]" />

      {/* Header */}
      <header className="border-b border-zinc-900 bg-[#0A0A0A]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Orbit className="h-5.5 w-5.5 text-white" />
              </div>
              <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                AURA
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              AR Active
            </span>
          </div>
        </div>
      </header>

      {/* Detail Content */}
      <main className="flex-grow flex items-center">
        <ProductDetailClient product={product} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-600">
          Aura AR Try-On Platform POC. Strictly for visual prototyping.
        </div>
      </footer>
    </div>
  );
}
