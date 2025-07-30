import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  brand: string;
  images: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  avatar?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: CartItem[];
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: Product[];
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_WISHLIST'; payload: Product[] }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: Product };

const initialState: AppState = {
  user: null,
  cart: [],
  wishlist: [],
  products: [],
  orders: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'ADD_TO_WISHLIST':
      const isAlreadyInWishlist = state.wishlist.some(item => item.id === action.payload.id);
      if (isAlreadyInWishlist) {
        return state;
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_WISHLIST':
      return { ...state, wishlist: [] };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from storage on app start
  useEffect(() => {
    loadCart();
    loadWishlist();
    loadProducts();
    loadUser();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [state.cart]);

  // Save wishlist to storage whenever it changes
  useEffect(() => {
    saveWishlist();
  }, [state.wishlist]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        dispatch({ type: 'SET_CART', payload: JSON.parse(cartData) });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(state.cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        dispatch({ type: 'SET_WISHLIST', payload: JSON.parse(wishlistData) });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const saveWishlist = async () => {
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const loadUser = async () => {
    try {
      // First try to get user from AsyncStorage (for offline access)
      const cachedUserData = await AsyncStorage.getItem('user');
      if (cachedUserData) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(cachedUserData) });
      }

      // Then try to get fresh user data from API if authenticated
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          dispatch({ type: 'SET_USER', payload: currentUser });
        } else {
          // Token might be expired, clear user data
          await AsyncStorage.removeItem('user');
          dispatch({ type: 'SET_USER', payload: null });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProducts = () => {
    // Mock products
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'iPhone 16 Pro Max',
        price: 1199,
        image: 'https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/tile/Apple-iPhone-16-Pro-hero-240909-lp.jpg.news_app_ed.jpg',
        category: 'Smartphones',
        description: 'The iPhone 16 Pro Max redefines flagship performance with the all-new A18 Pro chip, a stunning 6.9" Super Retina XDR display, and a titanium body built for durability. Capture life in cinematic detail with the upgraded triple-lens camera system featuring 5x telephoto zoom and next-gen AI photography. Experience iOS like never before — faster, smarter, and more immersive.',
        rating: 4.5,
        reviews: 324,
        inStock: true,
        brand: 'Apple',
        images: [
          'https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/tile/Apple-iPhone-16-Pro-hero-240909-lp.jpg.news_app_ed.jpg',
        ]
      },
      {
        id: '2',
        name: 'Samsung Galaxy S25',
        price: 799,
        image: 'https://diamu.com.bd/wp-content/uploads/2025/01/Samsung-Galaxy-S25.jpg',
        category: 'Smartphones',
        description: 'Meet the Galaxy S25 — Samsung\'s sleekest and smartest phone yet. Boasting a 6.8" AMOLED 2X display, Snapdragon Gen 4 processor, and an advanced quad-camera system with 200MP main sensor, it\'s designed for creators and power users alike. Plus, its all-day battery and eco-friendly design make it a win for performance and sustainability.',
        rating: 4.2,
        reviews: 550,
        inStock: true,
        brand: 'Samsung',
        images: [
          'https://diamu.com.bd/wp-content/uploads/2025/01/Samsung-Galaxy-S25.jpg'
        ]
      },
      {
        id: '3',
        name: 'Fitbit Inspire 3',
        price: 99,
        image: 'https://thegadgetflow.com/wp-content/uploads/2025/03/Fitbit-Inspire-3-health-and-fitness-smartwatch-04-1024x576.jpeg',
        category: 'Wearables',
        description: 'Track your activity, sleep, heart rate, and stress with the slim and stylish Fitbit Inspire 3. With up to 10 days of battery life, guided breathing sessions, and customizable clock faces, this fitness tracker makes wellness easy — and wearable.',
        rating: 4.7,
        reviews: 892,
        inStock: true,
        brand: 'Fitbit',
        images: [
          'https://thegadgetflow.com/wp-content/uploads/2025/03/Fitbit-Inspire-3-health-and-fitness-smartwatch-04-1024x576.jpeg'
        ]
      },
      {
        id: '4',
        name: 'Galaxy Watch7 ',
        price: 299,
        image: 'https://dazzle.sgp1.cdn.digitaloceanspaces.com/30756/Galaxy-Watch-7-green.png',
        category: 'Wearables',
        description: 'Stay connected and in control with the Galaxy Watch7. Featuring advanced health monitoring, fitness tracking, and seamless integration with your Galaxy devices, it\'s your perfect everyday companion. With a vibrant AMOLED display and customizable watch faces, it\'s where fashion meets function.',
        rating: 4.3,
        reviews: 267,
        inStock: true,
        brand: 'Samsung',
        images: [
          'https://dazzle.sgp1.cdn.digitaloceanspaces.com/30756/Galaxy-Watch-7-green.png'
        ]
      },
      {
        id: '5',
        name: 'ASUS ROG Strix G16',
        price: 1999,
        image: 'https://computermania.com.bd/wp-content/uploads/2025/01/ASUS-ROG-5-2.jpg',
        category: 'Laptops',
        description: 'Power up your gameplay with the ASUS ROG Strix G16 — a 16" gaming beast equipped with the latest Intel Core i9 processor and NVIDIA GeForce RTX 4070 GPU. Enjoy ultra-smooth visuals on a 165Hz FHD+ display, advanced cooling, and RGB lighting that makes your setup shine. This is where serious gaming begins.',
        rating: 4.8,
        reviews: 445,
        inStock: true,
        brand: 'ASUS',
        images: [
          'https://computermania.com.bd/wp-content/uploads/2025/01/ASUS-ROG-5-2.jpg'
        ]
      },
      {
        id: '6',
        name: 'MacBook Pro',
        price: 2499,
        image: 'https://www.custommacbd.com/cdn/shop/files/mbp16-space-black-Custom-Mac-BD.jpg?v=1700117634',
        category: 'Laptops',
        description: 'The MacBook Pro with M3 chip delivers unrivaled performance and battery life for professionals and creatives. Its Liquid Retina XDR display brings images to life, while ProMotion technology ensures fluid graphics. Whether editing 8K videos or building complex apps, this laptop doesn\'t break a sweat — and neither will you.',
        rating: 4.6,
        reviews: 178,
        inStock: true,
        brand: 'Apple',
        images: [
          'https://www.custommacbd.com/cdn/shop/files/mbp16-space-black-Custom-Mac-BD.jpg?v=1700117634'
        ]
      },
      {
        id: '7',
        name: 'Sony WH-1000XM6',
        price: 449,
        image: 'https://cdn.mos.cms.futurecdn.net/a8rpypBTkEiL3qUF6uyG4P.jpg',
        category: 'Headphones',
        description: 'Immerse yourself in pure audio bliss with the Sony WH-1000XM6. Featuring industry-leading noise cancellation, adaptive sound control, and next-gen comfort, these headphones are engineered for uninterrupted listening. Enjoy studio-quality sound and up to 40 hours of battery on a single charge.',
        rating: 4.4,
        reviews: 328,
        inStock: true,
        brand: 'Sony',
        images: [
          'https://cdn.mos.cms.futurecdn.net/a8rpypBTkEiL3qUF6uyG4P.jpg'
        ]
      },
      {
        id: '8',
        name: 'Apple AirPods Max',
        price: 549,
        image: 'https://hips.hearstapps.com/hmg-prod/images/apple-airpods-max-review-64959f6226b6d.jpg?crop=0.5xw:1xh;center,top&resize=640:*',
        category: 'Headphones',
        description: 'Apple AirPods Max combine high-fidelity audio with premium design. With spatial audio, dynamic head tracking, and Active Noise Cancellation, every note feels immersive. The breathable mesh headband and memory foam ear cushions make long listening sessions effortlessly comfortable.',
        rating: 4.6,
        reviews: 118,
        inStock: true,
        brand: 'Apple',
        images: [
          'https://hips.hearstapps.com/hmg-prod/images/apple-airpods-max-review-64959f6226b6d.jpg?crop=0.5xw:1xh;center,top&resize=640:*'
        ]
      }

    ];
    
    dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Helper functions
export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemsCount = (cart: CartItem[]) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const isInWishlist = (wishlist: Product[], productId: string) => {
  return wishlist.some(item => item.id === productId);
};

export const getWishlistItemsCount = (wishlist: Product[]) => {
  return wishlist.length;
};