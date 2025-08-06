import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wishlistService } from '@/services/wishlistService';

interface WishlistBadgeProps {
  style?: any;
}

export default function WishlistBadge({ style }: WishlistBadgeProps) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWishlistCount();
    
    // Set up interval to refresh count periodically
    const interval = setInterval(loadWishlistCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadWishlistCount = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlistCount();
      
      if (response.success && response.data) {
        setCount(response.data.count);
      }
    } catch (error) {
      console.error('Error loading wishlist count:', error);
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