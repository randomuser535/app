import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Star, Heart, Share } from 'lucide-react-native';
import { Product, useApp, isInWishlist } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  showWishlistButton?: boolean;
  showShareButton?: boolean;
  onPress?: (productId: string) => void;
}

export default function ProductCard({ 
  product, 
  layout = 'grid', 
  showWishlistButton = true,
  showShareButton = false,
  onPress
}: ProductCardProps) {
  const { state, dispatch } = useApp();
  const inWishlist = isInWishlist(state.wishlist, product.id);

  const handleAddToCart = (e?: any) => {
    e?.stopPropagation();
    if (!product.inStock) return;
    
    dispatch({ type: 'ADD_TO_CART', payload: product });
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleWishlistToggle = (e?: any) => {
    e?.stopPropagation();
    
    if (inWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
      Alert.alert('Removed', 'Product removed from wishlist');
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      Alert.alert('Added', 'Product added to wishlist!');
    }
  };

  const handleShare = async (e?: any) => {
    e?.stopPropagation();
    
    const shareContent = {
      title: product.name,
      message: `Check out this amazing ${product.name} for $${product.price}! Available at One Tech.`,
      url: `https://onetech.com/product/${product.id}`, // Replace with your actual domain
    };

    if (Platform.OS === 'web') {
      // Web sharing using Web Share API or fallback
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareContent.title,
            text: shareContent.message,
            url: shareContent.url,
          });
        } catch (error) {
          // Fallback for web
          copyToClipboard(shareContent.message + ' ' + shareContent.url);
        }
      } else {
        // Fallback: copy to clipboard
        copyToClipboard(shareContent.message + ' ' + shareContent.url);
      }
    } else {
      // React Native Share (would need expo-sharing for mobile)
      Alert.alert('Share', shareContent.message);
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text).then(() => {
        Alert.alert('Copied', 'Product link copied to clipboard!');
      }).catch(() => {
        Alert.alert('Error', 'Failed to copy to clipboard');
      });
    }
  };

  const handleProductPress = () => {
    if (onPress) {
      onPress(product.id);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  if (layout === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={handleProductPress}>
        <Image
          source={{ uri: product.image }}
          style={styles.listImage}
        />
        <View style={styles.listContent}>
          <View style={styles.listInfo}>
            <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.brand}>{product.brand}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFC107" fill="#FFC107" />
              <Text style={styles.rating}>{product.rating}</Text>
              <Text style={styles.reviews}>({product.reviews})</Text>
            </View>
          </View>
          <View style={styles.listActions}>
            <Text style={styles.price}>${product.price}</Text>
            <View style={styles.actionButtons}>
              {showWishlistButton && (
                <TouchableOpacity 
                  style={[styles.iconButton, styles.wishlistButton]} 
                  onPress={handleWishlistToggle}
                >
                  <Heart 
                    size={16} 
                    color={inWishlist ? "#EF4444" : "#64748B"} 
                    fill={inWishlist ? "#EF4444" : "none"}
                  />
                </TouchableOpacity>
              )}
              {showShareButton && (
                <TouchableOpacity 
                  style={[styles.iconButton, styles.shareButton]} 
                  onPress={handleShare}
                >
                  <Share size={16} color="#64748B" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.addButton, !product.inStock && styles.disabledButton]} 
                onPress={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={handleProductPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.gridImage}
        />
        {!product.inStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        
        {/* Floating Action Buttons */}
        <View style={styles.floatingActions}>
          {showWishlistButton && (
            <TouchableOpacity 
              style={[styles.floatingButton, inWishlist && styles.activeWishlist]} 
              onPress={handleWishlistToggle}
            >
              <Heart 
                size={16} 
                color={inWishlist ? "#FFFFFF" : "#64748B"} 
                fill={inWishlist ? "#FFFFFF" : "none"}
              />
            </TouchableOpacity>
          )}
          {showShareButton && (
            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={handleShare}
            >
              <Share size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.gridContent}>
        <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <View style={styles.ratingContainer}>
          <Star size={14} color="#FFC107" fill="#FFC107" />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>
        <View style={styles.gridActions}>
          <Text style={styles.price}>${product.price}</Text>
          <TouchableOpacity 
            style={[styles.addButton, !product.inStock && styles.disabledButton]} 
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid layout styles
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 300,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  gridContent: {
    paddingTop: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  gridName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  gridActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  // List layout styles
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  listActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  // Common styles
  brand: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 2,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  outOfStockText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // Floating action buttons
  floatingActions: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    gap: 8,
  },
  floatingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeWishlist: {
    backgroundColor: '#EF4444',
  },

  // Action buttons for list view
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wishlistButton: {
    // Additional styles for wishlist button if needed
  },
  shareButton: {
    // Additional styles for share button if needed
  },
});