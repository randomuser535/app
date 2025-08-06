import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Share2, Grid3x3 as Grid3X3, List, Import as SortAsc, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { wishlistService, WishlistItem } from '@/services/wishlistService';
import { cartService } from '@/services/cartService';

export default function WishlistTabScreen() {
  const { state } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'dateAdded'>('dateAdded');

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlist();
      
      if (response.success && response.data?.wishlist) {
        setWishlistItems(response.data.wishlist);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWishlist();
    setIsRefreshing(false);
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.product.price - b.product.price;
      case 'rating':
        return b.product.rating - a.product.rating;
      case 'name':
        return a.product.name.localeCompare(b.product.name);
      case 'dateAdded':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  const handleAddAllToCart = async () => {
    const inStockItems = sortedItems.filter(item => item.product.inStock);
    if (inStockItems.length === 0) {
      Alert.alert('No Items', 'No items in your wishlist are currently in stock.');
      return;
    }

    Alert.alert(
      'Add All to Cart',
      `Add all ${inStockItems.length} item${inStockItems.length > 1 ? 's' : ''} from your wishlist to cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: async () => {
            try {
              // Add all items to cart via API
              const addPromises = inStockItems.map(item => 
                cartService.moveFromWishlistToCart(item.product.id, 1)
              );
              
              await Promise.all(addPromises);
              
              // Refresh wishlist
              await loadWishlist();
              
              // Show success message
              Alert.alert(
                'Transfer Complete!', 
                `${inStockItems.length} item${inStockItems.length > 1 ? 's have' : ' has'} been moved from your wishlist to cart.`,
                [
                  { text: 'Continue Shopping', style: 'cancel' },
                  { 
                    text: 'View Cart', 
                    onPress: () => router.push('/(tabs)/cart')
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to move items to cart');
            }
          },
        },
      ]
    );
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await wishlistService.clearWishlist();
              
              if (response.success) {
                setWishlistItems([]);
              } else {
                Alert.alert('Error', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  const handleShareWishlist = async () => {
    const shareContent = {
      title: 'My Wishlist - One Tech',
      message: `Check out my wishlist from One Tech:\n\n${sortedItems.map(item => `• ${item.name} - $${item.price}`).join('\n')}\n\nShop at One Tech for the best tech deals!`,
      url: 'https://onetech.com/wishlist', // Replace with your actual domain
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
          copyToClipboard(shareContent.message);
        }
      } else {
        // Fallback: copy to clipboard
        copyToClipboard(shareContent.message);
      }
    } else {
      // React Native Share (would need expo-sharing for mobile)
      Alert.alert('Share Wishlist', shareContent.message);
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text).then(() => {
        Alert.alert('Copied', 'Wishlist copied to clipboard!');
      }).catch(() => {
        Alert.alert('Error', 'Failed to copy to clipboard');
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
      <View style={styles.productContainer}>
        <ProductCard 
          product={item.product} 
          layout={viewMode} 
          showWishlistButton={true}
          showShareButton={false}
        />

      {/* Stock Status */}
        {!item.product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        {wishlistItems.length > 0 && (
          <TouchableOpacity onPress={handleShareWishlist}>
            <Share2 size={24} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save items you love to your wishlist and shop them later
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push('/(tabs)/search')}
            size="large"
          />
        </View>
      ) : (
        <>
          {/* Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.leftControls}>
              <Text style={styles.itemCount}>
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
              </Text>
              
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => {
                  const sortOptions: Array<'name' | 'price' | 'rating' | 'dateAdded'> = ['dateAdded', 'name', 'price', 'rating'];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                <SortAsc size={16} color="#64748B" />
                <Text style={styles.sortText}>
                  Sort: {sortBy === 'dateAdded' ? 'Recent' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rightControls}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearWishlist}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>

              <View style={styles.viewControls}>
                <TouchableOpacity
                  style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
                  onPress={() => setViewMode('grid')}
                >
                  <Grid3X3 size={20} color={viewMode === 'grid' ? '#2563EB' : '#64748B'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={20} color={viewMode === 'list' ? '#2563EB' : '#64748B'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Wishlist Items */}
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderWishlistItem}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            contentContainerStyle={styles.wishlistContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#2563EB']}
                tintColor="#2563EB"
              />
            }
            columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
          />

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <Button
              title={`Add All to Cart (${sortedItems.filter(item => item.product.inStock).length})`}
              onPress={handleAddAllToCart}
              fullWidth
              size="large"
              disabled={sortedItems.filter(item => item.product.inStock).length === 0}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginRight: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeViewButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  wishlistContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  listItem: {
    width: '100%',
    marginBottom: 16,
  },
  productContainer: {
    position: 'relative',
  },
  wishlistActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledCartButton: {
    backgroundColor: '#CBD5E1',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  outOfStockText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceAlertBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceAlertText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});