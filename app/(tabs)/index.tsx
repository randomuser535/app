import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Grid3x3 as Grid3X3, List, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = ['All', 'Smartphones', 'Laptops', 'Wearables', 'Headphones'];

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = state.products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
      Alert.alert('Success', 'Product added to cart!');
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  type Product = typeof state.products[number];

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
      <ProductCard 
        product={item} 
        layout={viewMode} 
        showWishlistButton={true}
        showShareButton={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>One Tech</Text>
          <Text style={styles.title}>Find your perfect product</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
          <Bell size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} products found
        </Text>
        <View style={styles.viewButtons}>
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

      {/* Products Grid/List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
      />
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    height: 48,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  categoriesContainer: {
    backgroundColor: 'transparent',
    height: 60,
    flexShrink: 0,
    flexGrow: 0,
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 40,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  viewButtons: {
    flexDirection: 'row',
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeViewButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  listItem: {
    width: '100%',
  },
});