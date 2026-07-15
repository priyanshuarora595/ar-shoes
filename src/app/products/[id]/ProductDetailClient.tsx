'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, ChevronLeft, Star, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product } from '../../../types/product';
import VariantSelector from '../../../components/VariantSelector';

interface ProductDetailClientProps {
  product: Product;
}

const STATIC_SIZES = ['7', '8', '9', '10', '11', '12'];

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState('9');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white mb-8 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Column: Glassmorphic Image Preview */}
        <div className="flex items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-8 backdrop-blur-md relative overflow-hidden aspect-square">
          <div className="absolute -left-20 -bottom-20 -z-10 h-60 w-60 rounded-full bg-orange-600/5 blur-3xl" />
          
          <img
            src={selectedVariant.thumbnail}
            alt={`${product.brand} ${product.name}`}
            className="h-full w-full object-contain max-h-[450px] transition-all duration-500 ease-out hover:scale-105"
          />
        </div>

        {/* Right Column: Details & Variant configuration */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Brand & Stars */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500/20" />
                <span className="text-xs text-zinc-400 ml-1.5">(4.0 rating)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-outfit text-3xl sm:text-4xl font-semibold text-white mt-2">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-zinc-400 mt-6 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mt-8 border-t border-zinc-900 pt-8">
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onChange={setSelectedVariant}
              />
            </div>

            {/* Size Selector */}
            <div className="mt-8 border-t border-zinc-900 pt-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Select Size (US Men)
              </span>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {STATIC_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 w-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/20 border border-transparent'
                          : 'border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-10 border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Plain <a>, not next/link: DeepAR's WASM/tfjs registries don't
                survive a shutdown+reinitialize cycle within the same JS
                heap, so entering this page must always be a full browser
                reload rather than a client-side SPA transition (which would
                reuse the heap from any previously-visited try-on-deepar page). */}
            <a
              href={`/try-on-deepar/${product.id}?variant=${selectedVariant.id}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-xl shadow-orange-950/10 transition-all duration-200 hover:bg-orange-500 hover:shadow-orange-500/25 active:scale-98"
            >
              <Camera className="h-4.5 w-4.5" />
              Start AR Try-On
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-4 mt-8 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/5 text-orange-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-zinc-400">Authentic Product</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/5 text-orange-500">
                <RefreshCw className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-zinc-400">Scalable Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
