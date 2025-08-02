import { useState, useEffect, useCallback } from 'react';
import { productService, Product } from '@/services/productService';

interface UseProductResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useProduct(productId: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.getProduct(productId);

      if (response.success && response.data?.product) {
        setProduct(response.data.product);
      } else {
        setError(response.message || 'Product not found');
        setProduct(null);
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      setError('Network error. Please check your connection.');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const refresh = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refresh,
    clearError,
  };
}