import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Product } from './productService';

// Use localhost for web, IP address for mobile
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5020/api' 
  : 'http://192.168.0.174:5020/api';

export interface WishlistItem {
  price: any;
  name: any;
  id: string;
  product: Product;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data?: {
    wishlist?: WishlistItem[];
    wishlistItem?: WishlistItem;
    count?: number;
    isInWishlist?: boolean;
  };
  count?: number;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export interface AddToWishlistData {
  productId: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

class WishlistService {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'credentials': 'include', // Include session cookies
    };
  }

  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data: WishlistResponse = await response.json();
      
      // Cache wishlist for offline access
      if (data.success && data.data?.wishlist) {
        await this.cacheWishlist(data.data.wishlist);
      }
      
      return data;
    } catch (error) {
      console.error('Get wishlist error:', error);
      
      // Try to return cached wishlist on network error
      const cachedWishlist = await this.getCachedWishlist();
      if (cachedWishlist.length > 0) {
        return {
          success: true,
          message: 'Showing cached wishlist',
          data: { wishlist: cachedWishlist }
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(data: AddToWishlistData): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result: WishlistResponse = await response.json();
      
      // Update cache on successful add
      if (result.success) {
        await this.refreshCache();
      }
      
      return result;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result: WishlistResponse = await response.json();
      
      // Update cache on successful removal
      if (result.success) {
        await this.refreshCache();
      }
      
      return result;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result: WishlistResponse = await response.json();
      
      // Clear cache on successful clear
      if (result.success) {
        await this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Clear wishlist error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount(): Promise<{ success: boolean; data?: { count: number }; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/count`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wishlist count error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Check if product is in wishlist
   */
  async checkWishlistStatus(productId: string): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data: WishlistResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Check wishlist status error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Cache management for offline support
  private async cacheWishlist(wishlist: WishlistItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedWishlist', JSON.stringify(wishlist));
      await AsyncStorage.setItem('wishlistCacheTime', Date.now().toString());
    } catch (error) {
      console.error('Error caching wishlist:', error);
    }
  }

  private async getCachedWishlist(): Promise<WishlistItem[]> {
    try {
      const cachedWishlist = await AsyncStorage.getItem('cachedWishlist');
      const cacheTime = await AsyncStorage.getItem('wishlistCacheTime');
      
      if (cachedWishlist && cacheTime) {
        const timeDiff = Date.now() - parseInt(cacheTime);
        const oneHour = 60 * 60 * 1000;
        
        // Return cached data if less than 1 hour old
        if (timeDiff < oneHour) {
          return JSON.parse(cachedWishlist);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error getting cached wishlist:', error);
      return [];
    }
  }

  private async refreshCache(): Promise<void> {
    try {
      const response = await this.getWishlist();
      if (response.success && response.data?.wishlist) {
        await this.cacheWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error('Error refreshing wishlist cache:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cachedWishlist');
      await AsyncStorage.removeItem('wishlistCacheTime');
    } catch (error) {
      console.error('Error clearing wishlist cache:', error);
    }
  }
}

export const wishlistService = new WishlistService();