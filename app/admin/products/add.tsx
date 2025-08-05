import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Image,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import Button from '@/components/Button';
import { productService } from '@/services/productService';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  sku: string;
  category: string;
  brand: string;
  inventoryCount: string;
  inStock: boolean;
  images: string[];
}

export default function AddProductScreen() {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '',
    brand: '',
    inventoryCount: '',
    inStock: true,
    images: [],
  });
  const [errors, setErrors] = useState<Partial<ProductForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');

  const categories = ['Smartphones', 'Laptops', 'Wearables', 'Headphones', 'Accessories'];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductForm> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.inventoryCount.trim()) {
      newErrors.inventoryCount = 'Inventory count is required';
    } else if (isNaN(Number(formData.inventoryCount)) || Number(formData.inventoryCount) < 0) {
      newErrors.inventoryCount = 'Please enter a valid inventory count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) {
      setImageUrlError('Image URL is required');
      return false;
    }

    try {
      new URL(url);
      // Check if URL ends with common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const hasImageExtension = imageExtensions.some(ext => 
        url.toLowerCase().indexOf(ext) !== -1
      );
      
      // Also allow URLs that don't have extensions but are from common image hosting services
      const imageHosts = ['images.pexels.com', 'unsplash.com', 'imgur.com', 'cloudinary.com', 'amazonaws.com'];
      const isFromImageHost = imageHosts.some(host => url.indexOf(host) !== -1);

      if (!hasImageExtension && !isFromImageHost) {
        setImageUrlError('Please enter a valid image URL');
        return false;
      }

      setImageUrlError('');
      return true;
    } catch {
      setImageUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleAddImageUrl = () => {
    if (!validateImageUrl(currentImageUrl)) return;

    // Check if URL is already added
    if (formData.images.indexOf(currentImageUrl) !== -1) {
      setImageUrlError('This image URL has already been added');
      return;
    }

    setFormData((prev: ProductForm) => ({
      ...prev,
      images: [...prev.images, currentImageUrl],
    }));
    setCurrentImageUrl('');
    setImageUrlError('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev: ProductForm) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        brand: formData.brand,
        sku: formData.sku,
        inventoryCount: Number(formData.inventoryCount),
        inStock: formData.inStock && Number(formData.inventoryCount) > 0,
        image: formData.images[0] || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: formData.images.length > 0 ? formData.images : ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400'],
      };

      const response = await productService.createProduct(productData);
      
      if (response.success) {
        // Add product to local state
        const newProduct = {
          id: response.data?.product?.id || Date.now().toString(),
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          brand: formData.brand,
          sku: formData.sku,
          inventoryCount: Number(formData.inventoryCount),
          inStock: formData.inStock && Number(formData.inventoryCount) > 0,
          rating: 0,
          reviews: 0,
          image: formData.images[0] || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
          images: formData.images.length > 0 ? formData.images : ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400'],
        };

        dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
        
        Alert.alert(
          'Success',
          'Product added successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Handle API errors
        if (response.errors && response.errors.length > 0) {
          const fieldErrors: Partial<ProductForm> = {};
          response.errors.forEach(error => {
            if (error.field === 'name') fieldErrors.name = error.message;
            if (error.field === 'description') fieldErrors.description = error.message;
            if (error.field === 'price') fieldErrors.price = error.message;
            if (error.field === 'sku') fieldErrors.sku = error.message;
            if (error.field === 'category') fieldErrors.category = error.message;
            if (error.field === 'brand') fieldErrors.brand = error.message;
            if (error.field === 'inventoryCount') fieldErrors.inventoryCount = error.message;
          });
          setErrors(fieldErrors);
        } else {
          Alert.alert('Error', response.message || 'Failed to create product. Please try again.');
        }
      }
    } catch (error) {
      console.error('Product creation error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof ProductForm, value: string | boolean) => {
    setFormData((prev: ProductForm) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<ProductForm>) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Product Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Images</Text>
            
            {/* Image URL Input */}
            <View style={styles.imageUrlContainer}>
              <View style={styles.imageUrlInputContainer}>
                <TextInput
                  style={[styles.imageUrlInput, imageUrlError && styles.inputError]}
                  value={currentImageUrl}
                  onChangeText={(text: string) => {
                    setCurrentImageUrl(text);
                    if (imageUrlError) setImageUrlError('');
                  }}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.addUrlButton, !currentImageUrl.trim() && styles.addUrlButtonDisabled]}
                  onPress={handleAddImageUrl}
                  disabled={!currentImageUrl.trim()}
                >
                  <Plus size={20} color={currentImageUrl.trim() ? "#FFFFFF" : "#94A3B8"} />
                </TouchableOpacity>
              </View>
              {imageUrlError && <Text style={styles.errorText}>{imageUrlError}</Text>}
              <Text style={styles.helperText}>
                Supported formats: JPG, PNG, GIF, WebP. Maximum 5 images.
              </Text>
            </View>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <View style={styles.imagesContainer}>
                {formData.images.map((image: string, index: number) => (
                  <View key={index} style={styles.imageItem}>
                    <Image 
                      source={{ uri: image }} 
                      style={styles.productImage}
                      onError={() => {
                        Alert.alert('Image Error', 'Failed to load image. Please check the URL.');
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text: string) => updateFormData('name', text)}
                placeholder="Enter product name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                value={formData.description}
                onChangeText={(text: string) => updateFormData('description', text)}
                placeholder="Enter product description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={formData.price}
                  onChangeText={(text: string) => updateFormData('price', text)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>SKU *</Text>
                <TextInput
                  style={[styles.input, errors.sku && styles.inputError]}
                  value={formData.sku}
                  onChangeText={(text: string) => updateFormData('sku', text)}
                  placeholder="Enter SKU"
                />
                {errors.sku && <Text style={styles.errorText}>{errors.sku}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={[styles.input, errors.brand && styles.inputError]}
                value={formData.brand}
                onChangeText={(text: string) => updateFormData('brand', text)}
                placeholder="Enter brand name"
              />
              {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategory
                  ]}
                  onPress={() => updateFormData('category', category)}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Inventory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Inventory Count *</Text>
              <TextInput
                style={[styles.input, errors.inventoryCount && styles.inputError]}
                value={formData.inventoryCount}
                onChangeText={(text: string) => updateFormData('inventoryCount', text)}
                placeholder="Enter inventory count"
                keyboardType="numeric"
              />
              {errors.inventoryCount && <Text style={styles.errorText}>{errors.inventoryCount}</Text>}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>In Stock</Text>
              <Switch
                value={formData.inStock}
                onValueChange={(value: boolean) => updateFormData('inStock', value)}
                trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.submitContainer}>
            <Button
              title="Add Product"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              size="large"
            />
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageItem: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  primaryText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  addImageText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    height: 100,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  submitContainer: {
    marginTop: 2,
  },
  imageUrlContainer: {
    marginBottom: 16,
  },
  imageUrlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageUrlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  addUrlButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});