import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Heart } from 'lucide-react-native';
import { wishlistService } from '@/services/wishlistService';
import { Product } from '@/services/productService';

interface WishlistButtonProps {
  product: Product;
  size?: number;
  style?: any;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistButton({ 
  product, 
  size = 20, 
  style,
  onToggle 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistService.checkWishlistStatus(product.id);
      if (response.success && response.data) {
        setIsInWishlist(response.data.isInWishlist || false);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isInWishlist) {
        const response = await wishlistService.removeFromWishlist(product.id);
        
        if (response.success) {
          setIsInWishlist(false);
          onToggle?.(false);
          Alert.alert('Removed', 'Product removed from wishlist');
        } else {
          Alert.alert('Error', response.message);
        }
      } else {
        const response = await wishlistService.addToWishlist({
          productId: product.id,
          priority: 'medium'
        });
        
        if (response.success) {
          setIsInWishlist(true);
          onToggle?.(true);
          Alert.alert('Added', 'Product added to wishlist!');
        } else {
          if (response.message.includes('already in wishlist') || response.message.includes('already in your wishlist')) {
            setIsInWishlist(true);
            onToggle?.(true);
            Alert.alert('Already Added', 'Product is already in your wishlist');
          } else {
            Alert.alert('Error', response.message);
          }
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
      await checkWishlistStatus();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isInWishlist && styles.activeButton, style]}
      onPress={handleToggle}
      disabled={isLoading}
    >
      <Heart
        size={size}
        color={isInWishlist ? '#EF4444' : '#64748B'}
        fill={isInWishlist ? '#EF4444' : 'none'}
      />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});