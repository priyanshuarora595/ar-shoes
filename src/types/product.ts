export interface ProductVariant {
  id: string;
  color: string;
  colorHex?: string;
  modelUrl: string;
  thumbnail: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  thumbnail: string;
  variants: ProductVariant[];
}

export interface FootPose {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  detected: boolean;
}
