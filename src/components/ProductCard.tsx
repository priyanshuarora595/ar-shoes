'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, ArrowRight } from 'lucide-react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);

  // The public API excludes products with no active variant, but stay
  // defensive rather than crash if one ever slips through.
  if (!activeVariant) {
    return null;
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
      {/* Glow Effect Backdrop */}
      <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl transition-opacity duration-300 group-hover:bg-orange-500/10" />

      <div>
        {/* Brand */}
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-500/90">
          {product.brand}
        </span>

        {/* Product Name */}
        <h3 className="mt-1 font-outfit text-lg font-medium text-white transition-colors duration-200 group-hover:text-orange-500">
          {product.name}
        </h3>

        {/* Product Image Container */}
        <Link href={`/products/${product.id}`} className="relative mt-4 block aspect-square w-full overflow-hidden rounded-xl bg-zinc-900/60 p-4">
          <img
            src={activeVariant.thumbnail}
            alt={`${product.brand} ${product.name}`}
            className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Variant Swatches (Mini Visual Preview) */}
        <div className="mt-4 flex items-center gap-1.5">
          {product.variants.map((variant) => {
            const isSelected = variant.id === activeVariant.id;
            return (
              <button
                key={variant.id}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveVariant(variant);
                }}
                className={`h-4.5 w-4.5 rounded-full border transition-all duration-200 ${
                  isSelected ? 'border-orange-500 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: variant.colorHex || '#555' }}
                title={variant.color}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          href={`/products/${product.id}`}
          className="flex items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 text-xs font-medium text-zinc-300 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {/* Plain <a>, not next/link: DeepAR's WASM/tfjs registries don't
            survive a shutdown+reinitialize cycle within the same JS heap,
            so entering this page must always be a full browser reload. */}
        <a
          href={`/try-on-deepar/${product.id}?variant=${activeVariant.id}`}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:bg-orange-500 hover:shadow-orange-500/25 active:scale-95"
        >
          <Camera className="h-3.5 w-3.5" />
          Try On
        </a>
      </div>
    </div>
  );
}
