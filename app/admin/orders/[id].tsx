import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Truck, CircleCheck as CheckCircle, Clock, User, MapPin, CreditCard, Phone, Mail } from 'lucide-react-native';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { orderService, Order } from '@/services/orderService';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(id as string);
      
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions: Array<{ key: Order['status']; label: string; color: string; icon: any }> = [
    { key: 'pending', label: 'Pending', color: '#F59E0B', icon: Clock },
    { key: 'processing', label: 'Processing', color: '#2563EB', icon: Package },
    { key: 'shipped', label: 'Shipped', color: '#8B5CF6', icon: Truck },
    { key: 'delivered', label: 'Delivered', color: '#10B981', icon: CheckCircle },
  ];

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    Alert.alert(
      'Update Order Status',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            setIsUpdating(true);
            orderService.updateOrderStatus(order!.id, newStatus)
              .then(response => {
                if (response.success) {
                  loadOrder(); // Refresh order data
                  Alert.alert('Success', `Order status updated to ${newStatus}`);
                } else {
                  Alert.alert('Error', response.message);
                }
              })
              .finally(() => setIsUpdating(false));
          },
        },
      ]
    );
  };

  const getStatusInfo = (status: Order['status']) => {
    return statusOptions.find(option => option.key === status) || statusOptions[0];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusInfo = getStatusInfo(order.status);

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
        <Text style={styles.title}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${currentStatusInfo.color}20` }]}>
              <currentStatusInfo.icon size={16} color={currentStatusInfo.color} />
              <Text style={[styles.statusText, { color: currentStatusInfo.color }]}>
                {currentStatusInfo.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.orderTotal}>${order.pricing.total.toFixed(2)}</Text>
          {order.tracking?.trackingNumber && (
            <Text style={styles.trackingNumber}>
              Tracking: {order.tracking.trackingNumber}
            </Text>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <User size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerInfo.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Mail size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerInfo.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerInfo.phone}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <MapPin size={20} color="#64748B" />
            <View style={styles.addressText}>
              <Text style={styles.addressLine}>{order.shippingAddress.address}</Text>
              <Text style={styles.addressLine}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressLine}>{order.shippingAddress.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
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
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image || 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBrand}>{'Unknown'}</Text>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} × {item.quantity}</Text>
                  <Text style={styles.itemTotal}>${item.totalPrice.toFixed(2)}</Text>
                </View>
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

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Status Update Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          <View style={styles.statusActions}>
            {statusOptions.map((statusOption) => (
              <TouchableOpacity
                key={statusOption.key}
                style={[
                  styles.statusButton,
                  { backgroundColor: `${statusOption.color}20` },
                  order.status === statusOption.key && styles.currentStatusButton
                ]}
                onPress={() => handleStatusUpdate(statusOption.key)}
                disabled={order.status === statusOption.key || isUpdating}
              >
                <statusOption.icon size={20} color={statusOption.color} />
                <Text style={[styles.statusButtonText, { color: statusOption.color }]}>
                  {statusOption.label}
                </Text>
                {order.status === statusOption.key && (
                  <Text style={styles.currentLabel}>Current</Text>
                )}
              </TouchableOpacity>
            ))}
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
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  orderTotal: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  trackingNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  customerInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    marginLeft: 12,
    flex: 1,
  },
  addressLine: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
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
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
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
    alignItems: 'center',
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
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
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
  discountLabel: {
    color: '#10B981',
  },
  discountValue: {
    color: '#10B981',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
  },
  statusActions: {
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentStatusButton: {
    borderColor: '#2563EB',
  },
  statusButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  currentLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  quickActions: {
    gap: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});