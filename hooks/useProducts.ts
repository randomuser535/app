import { useState, useEffect, useCallback } from 'react';
import { productService, Product, ProductFilters } from '@/services/productService';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  totalProducts: number;
  currentPage: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  filterProducts: (filters: ProductFilters) => Promise<void>;
  clearError: () => void;
}

interface UseProductsOptions {
  initialFilters?: ProductFilters;
  pageSize?: number;
  enablePagination?: boolean;
  enableCache?: boolean;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const {
    initialFilters = {},
    pageSize = 20,
    enablePagination = true,
    enableCache = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(initialFilters);

  const fetchProducts = useCallback(async (
    filters: ProductFilters = {},
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const requestFilters: ProductFilters = {
        ...currentFilters,
        ...filters,
        page,
        limit: pageSize,
      };

      const response = await productService.getProducts(requestFilters);

      if (response.success && response.data?.products) {
        const newProducts = response.data.products;
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setTotalProducts(response.data.total || newProducts.length);
        setHasMore(newProducts.length === pageSize && (response.data.totalPages ? page < response.data.totalPages : true));
        setCurrentPage(page);

        // Cache products if enabled
        if (enableCache && !append && page === 1) {
          await productService.cacheProducts(newProducts);
        }
      } else {
        setError(response.message || 'Failed to fetch products');
        
        // Try to load cached products if network request fails
        if (enableCache && !append && page === 1) {
          const cachedProducts = await productService.getCachedProducts();
          if (cachedProducts.length > 0) {
            setProducts(cachedProducts);
            setError('Showing cached products. Pull to refresh for latest data.');
          }
        }
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setError('Network error. Please check your connection.');
      
      // Try to load cached products on error
      if (enableCache && !append && page === 1) {
        const cachedProducts = await productService.getCachedProducts();
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setError('Showing cached products. Pull to refresh for latest data.');
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentFilters, pageSize, enableCache]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await fetchProducts(currentFilters, 1, false);
  }, [fetchProducts, currentFilters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    
    const nextPage = currentPage + 1;
    await fetchProducts(currentFilters, nextPage, true);
  }, [hasMore, isLoading, isRefreshing, currentPage, fetchProducts, currentFilters]);

  const searchProducts = useCallback(async (query: string) => {
    const searchFilters = { ...currentFilters, search: query };
    setCurrentFilters(searchFilters);
    setCurrentPage(1);
    setHasMore(true);
    await fetchProducts(searchFilters, 1, false);
  }, [currentFilters, fetchProducts]);

  const filterProducts = useCallback(async (filters: ProductFilters) => {
    const newFilters = { ...currentFilters, ...filters };
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    await fetchProducts(newFilters, 1, false);
  }, [currentFilters, fetchProducts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(initialFilters, 1, false);
  }, []);

  return {
    products,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    totalProducts,
    currentPage,
    refresh,
    loadMore,
    searchProducts,
    filterProducts,
    clearError,
  };
}