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
  quantity?: number; // Add this prop
  onQuantityChange?: (quantity: number) => void; // Add this prop
}

export default function CartButton({
  product,
  size = 20,
  style,
  showQuantity = false,
  onAddToCart,
  disabled = false,
  quantity: externalQuantity, // Use external quantity
  onQuantityChange
}: CartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [internalQuantity, setInternalQuantity] = useState(1);
  
  // Use external quantity if provided, otherwise use internal
  const currentQuantity = externalQuantity !== undefined ? externalQuantity : internalQuantity;

  const handleAddToCart = async () => {
    if (isLoading || disabled || !product.inStock) return;
    
    setIsLoading(true);
    try {
      const response = await cartService.addToCart({
        productId: product.id,
        quantity: currentQuantity, // Use currentQuantity instead of hardcoded values
      });
      
      if (response.success) {
        onAddToCart?.();
        // Don't show alert here if onAddToCart is provided - let parent handle it
        if (!onAddToCart) {
          Alert.alert(
            'Added to Cart',
            `${currentQuantity} ${product.name}${currentQuantity > 1 ? 's' : ''} added to cart!`
          );
        }
      } else {
        console.error('Cart error details:', response);
        const errorMessage = response.message || 'Failed to add item to cart. Please try again.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(99, newQuantity));
    
    if (onQuantityChange) {
      // If external quantity control, notify parent
      onQuantityChange(validQuantity);
    } else {
      // If internal quantity control, update internal state
      setInternalQuantity(validQuantity);
    }
  };

  if (showQuantity) {
    return (
      <View style={[styles.quantityContainer, style]}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(currentQuantity - 1)}
            disabled={currentQuantity <= 1}
          >
            <Minus size={16} color={currentQuantity <= 1 ? '#CBD5E1' : '#64748B'} />
          </TouchableOpacity>
         
          <Text style={styles.quantityText}>{currentQuantity}</Text>
         
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(currentQuantity + 1)}
            disabled={currentQuantity >= 99}
          >
            <Plus size={16} color={currentQuantity >= 99 ? '#CBD5E1' : '#64748B'} />
          </TouchableOpacity>
        </View>
       
        <TouchableOpacity
          style={[styles.addButton, (disabled || !product.inStock) && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={disabled || !product.inStock || isLoading}
        >
          <ShoppingCart size={size} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            ${(product.price * currentQuantity).toFixed(2)}
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
      {/* Show quantity in button text when not showing quantity controls */}
      {currentQuantity > 1 && (
        <Text style={styles.buttonText}>Add {currentQuantity}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});