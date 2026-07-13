import React from 'react';
import { notFound } from 'next/navigation';
import { ProductService } from '../../../services/ProductService';
import TryOnClient from './TryOnClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  if (!product) {
    return {
      title: 'AR Try-On - Not Found',
    };
  }

  return {
    title: `AR Try-On: ${product.brand} ${product.name} - Aura AR`,
    description: `Virtually try on the ${product.brand} ${product.name} using real-time foot tracking.`,
  };
}

export default async function TryOnPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { variant } = await searchParams;

  const product = await ProductService.getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <TryOnClient
      product={product}
      initialVariantId={variant || null}
    />
  );
}
