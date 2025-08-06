import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, Text, View } from 'react-native';
import { ShoppingCart, Plus, Minus } from 'lucide-react-native';
import { cartService } from '@/services/cartService'
import { Product } from '@/services/productService';

interface CartButtonProps {
  product: Product;
  size?: number;
  style?: any;
  showQuantity?: boolean;
  onAddToCart?: () => void;
  disabled?: boolean;
}

export default function CartButton({ 
  product, 
  size = 20, 
  style,
  showQuantity = false,
  onAddToCart,
  disabled = false
}: CartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (isLoading || disabled || !product.inStock) return;

    setIsLoading(true);

    try {
      const response = await cartService.addToCart({
        productId: product.id,
        quantity: showQuantity ? quantity : 1,
      });

      if (response.success) {
        onAddToCart?.();
        Alert.alert(
          'Added to Cart',
          `${showQuantity ? quantity : 1} ${product.name}${(showQuantity ? quantity : 1) > 1 ? 's' : ''} added to cart!`
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(99, newQuantity)));
  };

  if (showQuantity) {
    return (
      <View style={[styles.quantityContainer, style]}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus size={16} color={quantity <= 1 ? '#CBD5E1' : '#64748B'} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(quantity + 1)}
            disabled={quantity >= 99}
          >
            <Plus size={16} color={quantity >= 99 ? '#CBD5E1' : '#64748B'} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, (disabled || !product.inStock) && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={disabled || !product.inStock || isLoading}
        >
          <ShoppingCart size={size} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        (disabled || !product.inStock) && styles.disabledButton,
        style
      ]}
      onPress={handleAddToCart}
      disabled={disabled || !product.inStock || isLoading}
    >
      <ShoppingCart size={size} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});