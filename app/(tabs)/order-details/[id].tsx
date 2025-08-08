import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Package, Truck, CircleCheck as CheckCircle, Clock, MapPin, CreditCard, Copy } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { orderService, Order } from '@/services/orderService';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { dispatch } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await orderService.getOrder(id as string);
      
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
      } else {
        setError(response.message || 'Order not found');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Network error. Please check your connection.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'processing':
        return <Package size={20} color="#2563EB" />;
      case 'shipped':
        return <Truck size={20} color="#8B5CF6" />;
      case 'delivered':
        return <CheckCircle size={20} color="#10B981" />;
      default:
        return <Package size={20} color="#64748B" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#2563EB';
      case 'shipped':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const handleCopyTracking = () => {
    if (order?.tracking?.trackingNumber) {
      // In a real app, this would copy to clipboard
      Alert.alert('Copied', 'Tracking number copied to clipboard');
    }
  };

  const handleReorder = () => {
    if (!order) return;

    order.items.forEach(item => {
      // Add each item to cart
      const product = {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
        brand: 'Unknown',
        category: 'Electronics', // Mock category
        description: `${item.brand} ${item.name}`,
        rating: 4.5,
        reviews: 100,
        inStock: true,
        images: [item.image || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400'],
      };

      for (let i = 0; i < item.quantity; i++) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    });

    Alert.alert(
      'Items Added to Cart',
      `${order.items.length} item${order.items.length > 1 ? 's' : ''} from this order have been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { 
          text: 'View Cart', 
          onPress: () => router.push('/(tabs)/cart')
        },
      ]
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Order Details"
          showBackButton
          onBackPress={() => router.back()}
        />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Order Details"
          showBackButton
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <View style={styles.errorActions}>
            <Button title="Try Again" onPress={loadOrder} variant="outline" />
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Order Details"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
            {getStatusIcon(order.status)}
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Tracking Information */}
        {order.tracking?.trackingNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Information</Text>
            <View style={styles.trackingCard}>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <Text style={styles.trackingNumber}>{order.tracking.trackingNumber}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyTracking}>
                <Copy size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <MapPin size={20} color="#64748B" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <CreditCard size={20} color="#64748B" />
            <Text style={styles.paymentText}>
              {order.paymentInfo.method.replace('_', ' ').toUpperCase()}
              {order.paymentInfo.lastFour && ` ending in ${order.paymentInfo.lastFour}`}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <Image source={{ uri: item.image || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBrand}>{'Unknown'}</Text>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
                </View>
                <Text style={styles.itemTotal}>
                  Total: ${item.totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.pricing.subtotal.toFixed(2)}</Text>
            </View>
            
            {order.pricing.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>
                  Discount {order.promoCode && `(${order.promoCode})`}
                </Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -${order.pricing.discount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${order.pricing.tax.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {order.pricing.shipping === 0 ? 'Free' : `$${order.pricing.shipping.toFixed(2)}`}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.pricing.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {order.status === 'delivered' && (
            <Button
              title="Reorder Items"
              onPress={handleReorder}
              fullWidth
              size="large"
            />
          )}
          
          <Button
            title="Contact Support"
            onPress={() => router.push('/help-support')}
            variant="outline"
            fullWidth
            size="large"
          />
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
  orderHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  trackingInfo: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
  },
  copyButton: {
    padding: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 12,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  itemTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  discountLabel: {
    color: '#10B981',
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
});