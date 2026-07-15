export interface ProductVariant {
  id: string;
  color: string;
  colorHex?: string;
  modelUrl: string;
  thumbnail: string;
  // DeepAR Studio-exported effect for this variant. Optional: only variants
  // that have actually been authored/converted in Studio will have one.
  deeparEffectUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  thumbnail: string;
  variants: ProductVariant[];
}
