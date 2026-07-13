import { Product } from '../types/product';
import productsData from '../data/products.json';

// Type assertion to verify layout conforms to Product[]
const products: Product[] = productsData as Product[];

export class ProductService {
  /**
   * Fetches all products.
   * Simulates an async API call.
   */
  static async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      // Simulate slight network latency (e.g. 100ms) for realistic feel
      setTimeout(() => {
        resolve(products);
      }, 100);
    });
  }

  /**
   * Fetches a single product by its unique ID.
   * Simulates an async API call.
   */
  static async getProductById(id: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.find((p) => p.id === id);
        resolve(product || null);
      }, 50);
    });
  }
}
