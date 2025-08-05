import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react-native';
import { useApp, useProducts } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { ProductFilters } from '@/services/productService';
import ProductList from '@/components/ProductList';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name A-Z', value: 'name_asc' },
];

const priceRanges = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: Infinity },
];

export default function SearchScreen() {
  const { categories: apiCategories, brands: apiBrands } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);

  // Build filters for ProductList
  const getFilters = (): ProductFilters => {
    const filters: ProductFilters = {};
    
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }
    
    if (selectedCategories.length > 0) {
      filters.category = selectedCategories[0]; // API typically supports single category
    }
    
    if (selectedPriceRange !== null) {
      filters.minPrice = priceRanges[selectedPriceRange].min;
      if (priceRanges[selectedPriceRange].max !== Infinity) {
        filters.maxPrice = priceRanges[selectedPriceRange].max;
      }
    }
    
    // Convert sort selection to API format
    switch (selectedSort) {
      case 'price_asc':
        filters.sortBy = 'price';
        filters.sortOrder = 'asc';
        break;
      case 'price_desc':
        filters.sortBy = 'price';
        filters.sortOrder = 'desc';
        break;
      case 'rating':
        filters.sortBy = 'rating';
        filters.sortOrder = 'desc';
        break;
      case 'name_asc':
        filters.sortBy = 'name';
        filters.sortOrder = 'asc';
        break;
      default:
        // Featured - use default API sorting
        break;
    }
    
    return filters;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setMinRating(0);
    setSelectedSort('featured');
  };

  const activeFiltersCount = selectedCategories.length + 
    selectedBrands.length +
    (selectedPriceRange !== null ? 1 : 0) + 
    (minRating > 0 ? 1 : 0);

  const renderSortOption = ({ item }: { item: { label: string; value: string } }) => (
    <TouchableOpacity
      style={[styles.filterOption, selectedSort === item.value && styles.selectedOption]}
      onPress={() => setSelectedSort(item.value)}
    >
      <Text style={[styles.filterOptionText, selectedSort === item.value && styles.selectedOptionText]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterChip = ({ item, isSelected, onToggle }: { 
    item: string; 
    isSelected: boolean; 
    onToggle: (item: string) => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterOption, isSelected && styles.selectedOption]}
      onPress={() => onToggle(item)}
    >
      <Text style={[styles.filterOptionText, isSelected && styles.selectedOptionText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPriceRange = ({
    item,
    index,
  }: {
    item: { label: string; min: number; max: number };
    index: number;
  }) => (
    <TouchableOpacity
      style={[styles.filterOption, selectedPriceRange === index && styles.selectedOption]}
      onPress={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
    >
      <Text style={[styles.filterOptionText, selectedPriceRange === index && styles.selectedOptionText]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={activeFiltersCount > 0 ? '#FFFFFF' : '#64748B'} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Search Results</Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Sort */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort by</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {sortOptions.map((option) => renderSortOption({ item: option }))}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {apiCategories.map((category) => 
                renderFilterChip({ 
                  item: category, 
                  isSelected: selectedCategories.includes(category),
                  onToggle: toggleCategory
                })
              )}
            </ScrollView>
          </View>

          {/* Brands */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Brands</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {apiBrands.map((brand) => 
                renderFilterChip({ 
                  item: brand, 
                  isSelected: selectedBrands.includes(brand),
                  onToggle: toggleBrand
                })
              )}
            </ScrollView>
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {priceRanges.map((range, index) => renderPriceRange({ item: range, index }))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Products List */}
      <ProductList
        filters={getFilters()}
        layout="list"
        numColumns={1}
        showLoadMore={true}
        contentContainerStyle={styles.productsContainer}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 1,
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  resultsContainer: {
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
  clearFiltersText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterOptions: {
    paddingRight: 16,
  },
  filterOption: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flex: 1,
  },
});