import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Product } from './productService';

// Use localhost for web, IP address for mobile
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5020/api' 
  : 'http://192.168.0.174:5020/api';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  priceAtAdd: number;
  totalPrice: number;
  addedAt: string;
  variant?: {
    size?: string;
    color?: string;
    model?: string;
  };
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  cartCount: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: {
    cart?: CartItem[];
    cartItem?: CartItem;
    summary?: CartSummary;
    count?: number;
    itemsCount?: number;
  };
  count?: number;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export interface AddToCartData {
  productId: string;
  quantity?: number;
  variant?: {
    size?: string;
    color?: string;
    model?: string;
  };
}

class CartService {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'credentials': 'include', // Include session cookies
    };
  }

  /**
   * Get user's cart with summary
   */
  async getCart(): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data: CartResponse = await response.json();
      
      // Cache cart for offline access
      if (data.success && data.data?.cart) {
        await this.cacheCart(data.data.cart, data.data.summary);
      }
      
      return data;
    } catch (error) {
      console.error('Get cart error:', error);
      
      // Try to return cached cart on network error
      const cachedData = await this.getCachedCart();
      if (cachedData.cart.length > 0) {
        return {
          success: true,
          message: 'Showing cached cart',
          data: cachedData
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Add product to cart
   */
  async addToCart(data: AddToCartData): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result: CartResponse = await response.json();
      
      // Update cache on successful add
      if (result.success) {
        await this.refreshCache();
      }
      
      return result;
    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });

      const result: CartResponse = await response.json();
      
      // Update cache on successful update
      if (result.success) {
        await this.refreshCache();
      }
      
      return result;
    } catch (error) {
      console.error('Update cart item error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Remove product from cart
   */
  async removeFromCart(productId: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result: CartResponse = await response.json();
      
      // Update cache on successful removal
      if (result.success) {
        await this.refreshCache();
      }
      
      return result;
    } catch (error) {
      console.error('Remove from cart error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result: CartResponse = await response.json();
      
      // Clear cache on successful clear
      if (result.success) {
        await this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Clear cart error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Get cart summary (totals and counts)
   */
  async getCartSummary(): Promise<{ success: boolean; data?: { summary: CartSummary }; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get cart summary error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Get cart count
   */
  async getCartCount(): Promise<{ success: boolean; data?: { count: number; itemsCount: number }; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/count`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get cart count error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Move item from wishlist to cart
   */
  async moveFromWishlistToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/from-wishlist/${productId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });

      const result: CartResponse = await response.json();
      
      // Update both caches on successful move
      if (result.success) {
        await this.refreshCache();
        // Also refresh wishlist cache since item was removed
        await this.refreshWishlistCache();
      }
      
      return result;
    } catch (error) {
      console.error('Move from wishlist to cart error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Cache management for offline support
  private async cacheCart(cart: CartItem[], summary?: CartSummary): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedCart', JSON.stringify(cart));
      if (summary) {
        await AsyncStorage.setItem('cachedCartSummary', JSON.stringify(summary));
      }
      await AsyncStorage.setItem('cartCacheTime', Date.now().toString());
    } catch (error) {
      console.error('Error caching cart:', error);
    }
  }

  private async getCachedCart(): Promise<{ cart: CartItem[]; summary?: CartSummary }> {
    try {
      const cachedCart = await AsyncStorage.getItem('cachedCart');
      const cachedSummary = await AsyncStorage.getItem('cachedCartSummary');
      const cacheTime = await AsyncStorage.getItem('cartCacheTime');
      
      if (cachedCart && cacheTime) {
        const timeDiff = Date.now() - parseInt(cacheTime);
        const oneHour = 60 * 60 * 1000;
        
        // Return cached data if less than 1 hour old
        if (timeDiff < oneHour) {
          return {
            cart: JSON.parse(cachedCart),
            summary: cachedSummary ? JSON.parse(cachedSummary) : undefined
          };
        }
      }
      
      return { cart: [] };
    } catch (error) {
      console.error('Error getting cached cart:', error);
      return { cart: [] };
    }
  }

  private async refreshCache(): Promise<void> {
    try {
      const response = await this.getCart();
      if (response.success && response.data?.cart) {
        await this.cacheCart(response.data.cart, response.data.summary);
      }
    } catch (error) {
      console.error('Error refreshing cart cache:', error);
    }
  }

  private async refreshWishlistCache(): Promise<void> {
    try {
      // Import wishlistService to refresh its cache
      const { wishlistService } = await import('./wishlistService');
      await wishlistService.getWishlist(); // This will refresh the cache
    } catch (error) {
      console.error('Error refreshing wishlist cache:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cachedCart');
      await AsyncStorage.removeItem('cachedCartSummary');
      await AsyncStorage.removeItem('cartCacheTime');
    } catch (error) {
      console.error('Error clearing cart cache:', error);
    }
  }
}

export const cartService = new CartService();