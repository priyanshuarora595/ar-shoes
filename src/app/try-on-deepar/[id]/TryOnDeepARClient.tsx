'use client';

import React, { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import type { FootData } from '../../../ar/DeepARTryOn';
import { Product } from '../../../types/product';

const DeepARTryOn = dynamic(() => import('../../../ar/DeepARTryOn'), {
  ssr: false,
});

interface TryOnDeepARClientProps {
  product: Product;
  initialVariantId: string | null;
}

export default function TryOnDeepARClient({ product, initialVariantId }: TryOnDeepARClientProps) {
  const initialVariant = useMemo(() => {
    return (
      product.variants.find((v) => v.id === initialVariantId) ||
      product.variants[0]
    );
  }, [product, initialVariantId]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [leftFoot, setLeftFoot] = useState<FootData | null>(null);
  const [rightFoot, setRightFoot] = useState<FootData | null>(null);

  const handleFeetTracked = useCallback((left: FootData, right: FootData) => {
    setLeftFoot(left);
    setRightFoot(right);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      {/* No key: switching variants must not remount this (see DeepARTryOn -
          tfjs/WASM registries don't survive a shutdown+reinitialize cycle
          within the same page session). effectUrl null is handled inside. */}
      <DeepARTryOn
        effectUrl={selectedVariant.deeparEffectUrl ?? null}
        onFeetTracked={handleFeetTracked}
      />

      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar */}
        <div className="w-full flex items-start justify-between pointer-events-auto">
          {/* Plain <a>, not next/link: leaving via a full reload keeps any
              DeepAR WASM/tfjs state from lingering into whatever page comes next. */}
          <a
            href={`/products/${product.id}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 text-white backdrop-blur-md transition-all hover:bg-zinc-900 active:scale-95 shadow-lg"
            title="Exit AR Try-On"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>

          <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl w-72 backdrop-blur-md flex flex-col gap-2 font-mono text-[10px] text-zinc-300">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              DeepAR POC &middot; {product.brand} {product.name}
            </span>
            <div className="flex justify-between">
              <span>Left foot:</span>
              <span className={leftFoot?.detected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {leftFoot?.detected ? 'DETECTED' : 'NOT DETECTED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Right foot:</span>
              <span className={rightFoot?.detected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {rightFoot?.detected ? 'DETECTED' : 'NOT DETECTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Variant Switcher - reads deeparEffectUrl straight from product data */}
        <div className="w-full max-w-md mx-auto pointer-events-auto bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              {product.brand}
            </span>
            <h4 className="font-outfit text-sm font-semibold text-white truncate">
              {product.name}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Active: <span className="text-zinc-200 font-medium capitalize">{selectedVariant.color}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`relative h-8 w-8 rounded-full border transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-500 scale-110 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                      : 'border-zinc-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: variant.colorHex || '#555' }}
                  title={variant.deeparEffectUrl ? variant.color : `${variant.color} (no AR effect yet)`}
                >
                  {!variant.deeparEffectUrl && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-zinc-300">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
