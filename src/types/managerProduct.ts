export interface ManagerVariant {
  id: number;
  product: number;
  slug: string;
  color: string;
  color_hex: string;
  thumbnail: string;
  deepar_effect: string | null;
  is_active: boolean;
}

export interface ManagerProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  description: string;
  thumbnail: string;
  sizes: string;
  is_active: boolean;
  variants: ManagerVariant[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
