import { useState, useEffect, useCallback } from 'react';
import { orderService, Order, OrderFilters } from '@/services/orderService';

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  totalOrders: number;
  currentPage: number;
  orderStats: any;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchOrders: (query: string) => Promise<void>;
  filterOrders: (filters: OrderFilters) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  clearError: () => void;
}

interface UseOrdersOptions {
  initialFilters?: OrderFilters;
  pageSize?: number;
  enablePagination?: boolean;
  autoRefresh?: boolean;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const {
    initialFilters = {},
    pageSize = 20,
    enablePagination = true,
    autoRefresh = false,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<OrderFilters>(initialFilters);
  const [orderStats, setOrderStats] = useState<any>(null);

  const fetchOrders = useCallback(async (
    filters: OrderFilters = {},
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const requestFilters: OrderFilters = {
        ...currentFilters,
        ...filters,
        page,
        limit: pageSize,
      };

      const response = await orderService.getOrders(requestFilters);

      if (response.success && response.data?.orders) {
        const newOrders = response.data.orders;
        
        if (append) {
          setOrders(prev => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
        }

        setTotalOrders(response.data.total || newOrders.length);
        setHasMore(newOrders.length === pageSize && (response.data.totalPages ? page < response.data.totalPages : true));
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentFilters, pageSize]);

  const fetchOrderStats = useCallback(async () => {
    try {
      const response = await orderService.getOrderStats();
      if (response.success && response.data) {
        setOrderStats(response.data);
      }
    } catch (error) {
      console.error('Fetch order stats error:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await Promise.all([
      fetchOrders(currentFilters, 1, false),
      fetchOrderStats()
    ]);
  }, [fetchOrders, fetchOrderStats, currentFilters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    
    const nextPage = currentPage + 1;
    await fetchOrders(currentFilters, nextPage, true);
  }, [hasMore, isLoading, isRefreshing, currentPage, fetchOrders, currentFilters]);

  const searchOrders = useCallback(async (query: string) => {
    const searchFilters = { ...currentFilters, search: query };
    setCurrentFilters(searchFilters);
    setCurrentPage(1);
    setHasMore(true);
    await fetchOrders(searchFilters, 1, false);
  }, [currentFilters, fetchOrders]);

  const filterOrders = useCallback(async (filters: OrderFilters) => {
    const newFilters = { ...currentFilters, ...filters };
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    await fetchOrders(newFilters, 1, false);
  }, [currentFilters, fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (error) {
      console.error('Update order status error:', error);
      setError('Failed to update order status');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders(initialFilters, 1, false);
    fetchOrderStats();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refresh]);

  return {
    orders,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    totalOrders,
    currentPage,
    orderStats,
    refresh,
    loadMore,
    searchOrders,
    filterOrders,
    updateOrderStatus,
    clearError,
  };
}