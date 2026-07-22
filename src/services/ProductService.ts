import { Product } from '../types/product';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ProductService {
  /**
   * Fetches all products from the catalog API.
   */
  static async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/api/products/`, {
      // Product catalog changes via the manager portal, not via a deploy,
      // so avoid Next.js's static-fetch caching here.
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to load products (${res.status})`);
    }

    const data: PaginatedResponse<Product> = await res.json();
    return data.results;
  }

  /**
   * Fetches a single product by its unique ID (slug).
   * Returns null only when the product genuinely doesn't exist (404) —
   * any other failure throws, so the route's error boundary can handle it.
   */
  static async getProductById(id: string): Promise<Product | null> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
      cache: 'no-store',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to load product "${id}" (${res.status})`);
    }

    return res.json();
  }
}
