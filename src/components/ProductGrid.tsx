'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Extract all unique brands
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map((p) => p.brand));
    return ['All', ...Array.from(uniqueBrands)];
  }, [products]);

  // Filter products based on search and brand
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand =
        selectedBrand === 'All' || product.brand === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [products, searchQuery, selectedBrand]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedBrand('All');
  };

  return (
    <div className="w-full">
      {/* Search and Filters Bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products, brands, styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none backdrop-blur-md transition-all duration-300 focus:border-orange-500/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.05)]"
          />
        </div>

        {/* Brand Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="mr-2 h-4 w-4 text-zinc-500 hidden sm:block" />
          {brands.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/20'
                    : 'border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Results */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 py-20 text-center">
          <p className="text-base text-zinc-400">No products match your current search criteria.</p>
          <button
            onClick={handleReset}
            className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-zinc-850"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
