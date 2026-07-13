'use client';

import React from 'react';
import { ProductVariant } from '../types/product';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onChange: (variant: ProductVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onChange,
}: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Color Variant: <span className="text-white font-medium capitalize">{selectedVariant.color}</span>
      </span>
      <div className="flex items-center gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariant.id;
          return (
            <button
              key={variant.id}
              onClick={() => onChange(variant)}
              type="button"
              className={`group relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-orange-500 scale-110 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'border-zinc-800 hover:border-zinc-600 hover:scale-105'
              }`}
              title={variant.color}
            >
              {/* Inner Color Circle */}
              <span
                className="h-7 w-7 rounded-full shadow-inner transition-transform duration-300 group-hover:scale-95"
                style={{
                  backgroundColor: variant.colorHex || '#555',
                }}
              />
              {/* Tooltip */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap shadow-lg border border-zinc-800">
                {variant.color}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
