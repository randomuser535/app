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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  promoCode?: string;
}

// Mock order data - in real app, this would come from API
const mockOrderDetails: { [key: string]: Order } = {
  'ORD-001': {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 1299.99,
    subtotal: 1298.00,
    tax: 103.84,
    shipping: 0,
    discount: 101.85,
    promoCode: 'WELCOME20',
    items: [
      {
        id: '1',
        name: 'iPhone 16 Pro Max',
        price: 1199,
        quantity: 1,
        image: 'https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/tile/Apple-iPhone-16-Pro-hero-240909-lp.jpg.news_app_ed.jpg',
        brand: 'Apple',
      },
      {
        id: '3',
        name: 'Fitbit Inspire 3',
        price: 99,
        quantity: 1,
        image: 'https://thegadgetflow.com/wp-content/uploads/2025/03/Fitbit-Inspire-3-health-and-fitness-smartwatch-04-1024x576.jpeg',
        brand: 'Fitbit',
      },
    ],
    trackingNumber: 'TRK123456789',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'Credit Card ending in 4242',
  },
  'ORD-002': {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'shipped',
    total: 849.99,
    subtotal: 799.00,
    tax: 63.92,
    shipping: 9.99,
    items: [
      {
        id: '2',
        name: 'Samsung Galaxy S25',
        price: 799,
        quantity: 1,
        image: 'https://diamu.com.bd/wp-content/uploads/2025/01/Samsung-Galaxy-S25.jpg',
        brand: 'Samsung',
      },
    ],
    trackingNumber: 'TRK987654321',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'PayPal',
  },
  'ORD-003': {
    id: 'ORD-003',
    date: '2024-01-05',
    status: 'processing',
    total: 2299.99,
    subtotal: 2298.00,
    tax: 183.84,
    shipping: 0,
    items: [
      {
        id: '5',
        name: 'ASUS ROG Strix G16',
        price: 1999,
        quantity: 1,
        image: 'https://computermania.com.bd/wp-content/uploads/2025/01/ASUS-ROG-5-2.jpg',
        brand: 'ASUS',
      },
      {
        id: '4',
        name: 'Galaxy Watch7',
        price: 299,
        quantity: 1,
        image: 'https://dazzle.sgp1.cdn.digitaloceanspaces.com/30756/Galaxy-Watch-7-green.png',
        brand: 'Samsung',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'Credit Card ending in 1234',
  },
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { dispatch } = useApp();
  const [order] = useState<Order | null>(mockOrderDetails[id as string] || null);

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
    if (order?.trackingNumber) {
      // In a real app, this would copy to clipboard
      Alert.alert('Copied', 'Tracking number copied to clipboard');
    }
  };

  const handleReorder = () => {
    if (!order) return;

    order.items.forEach(item => {
      // Add each item to cart
      const product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        brand: item.brand,
        category: 'Electronics', // Mock category
        description: `${item.brand} ${item.name}`,
        rating: 4.5,
        reviews: 100,
        inStock: true,
        images: [item.image],
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

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Order Details"
          showBackButton
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
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
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderDate}>
              Ordered on {new Date(order.date).toLocaleDateString('en-US', {
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
        {order.trackingNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Information</Text>
            <View style={styles.trackingCard}>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
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
              <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
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
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
                </View>
                <Text style={styles.itemTotal}>
                  Total: ${(item.price * item.quantity).toFixed(2)}
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
              <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            
            {order.discount && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>
                  Discount {order.promoCode && `(${order.promoCode})`}
                </Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -${order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
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
  },
});