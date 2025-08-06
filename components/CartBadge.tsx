import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cartService } from '@/services/cartService';

interface CartBadgeProps {
  style?: any;
  showItemCount?: boolean; // Show total items vs unique products
}

export default function CartBadge({ style, showItemCount = true }: CartBadgeProps) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCartCount();
    
    // Set up interval to refresh count periodically
    const interval = setInterval(loadCartCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadCartCount = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCartCount();
      
      if (response.success && response.data) {
        // Use itemsCount for total quantity, count for unique products
        setCount(showItemCount ? response.data.itemsCount : response.data.count);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show badge if count is 0
  if (count === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});