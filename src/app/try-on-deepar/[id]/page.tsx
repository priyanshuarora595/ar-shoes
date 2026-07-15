import React from 'react';
import { notFound } from 'next/navigation';
import { ProductService } from '../../../services/ProductService';
import TryOnDeepARClient from './TryOnDeepARClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  if (!product) {
    return {
      title: 'AR Try-On (DeepAR POC) - Not Found',
    };
  }

  return {
    title: `DeepAR Try-On POC: ${product.brand} ${product.name} - Aura AR`,
    description: `POC: virtually try on the ${product.brand} ${product.name} using DeepAR's dedicated foot-tracking model.`,
  };
}

export default async function TryOnDeepARPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { variant } = await searchParams;
  const product = await ProductService.getProductById(id);

  if (!product) {
    notFound();
  }

  return <TryOnDeepARClient product={product} initialVariantId={variant || null} />;
}
