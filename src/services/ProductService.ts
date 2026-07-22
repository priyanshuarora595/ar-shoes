import { Product } from '../types/product';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export class ProductService {
  /**
   * Fetches the full product catalog. Not paginated server-side -
   * the catalog is small (~50 products at MVP scale) and the frontend
   * paginates client-side after its own search/brand filtering.
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

    return res.json();
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
