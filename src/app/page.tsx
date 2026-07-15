import React from 'react';
import { Sparkles, Orbit } from 'lucide-react';
import { ProductService } from '../services/ProductService';
import ProductGrid from '../components/ProductGrid';

export const metadata = {
  title: 'Aura AR - Augmented Reality Shoe Try-On',
  description: 'Virtually try on your favorite shoes in real time. Experience premium designs and interactive foot tracking on our catalog of mock sneakers.',
};

export default async function Home() {
  const products = await ProductService.getProducts();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-50 relative overflow-hidden flex flex-col">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-full max-w-7xl bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(249,115,22,0.07),rgba(0,0,0,0))]" />
      <div className="absolute top-1/4 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-orange-600/3 blur-[120px]" />
      <div className="absolute bottom-10 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/2 blur-[150px]" />

      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-[#0A0A0A]/70 backdrop-blur-md">
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
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                AR Engine: Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Gen Augmented Reality Try-On
          </div>
          <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
            Step Into the Future of <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent font-semibold">
              Shoe Shopping
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
            Virtually wear sneakers instantly. Select a pair, open your device camera, and see high-fidelity 3D models project perfectly on your foot in real time.
          </p>
        </section>

        {/* Catalog Explorer */}
        <section>
          <div className="border-t border-zinc-900 pt-10">
            <h2 className="font-outfit text-2xl font-semibold text-white mb-2">
              Browse Sneaker Catalog
            </h2>
            <p className="text-sm text-zinc-500 mb-8">
              Explore 50 hand-crafted sneaker configurations. Select a colorway and start try-on.
            </p>
            
            <ProductGrid products={products} />
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © 2026 Aura Systems. All rights reserved. AR Shoe Try-On Proof of Concept.
          </p>
          <p className="text-xs text-zinc-500 mt-2 sm:mt-0">
            Made with DeepAR and Next.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
