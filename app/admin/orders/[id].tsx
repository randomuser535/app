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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
}

const mockOrder: Order = {
  id: 'ORD-001',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+1 (555) 123-4567',
  date: '2024-01-15',
  status: 'processing',
  total: 1299.99,
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
  shippingAddress: {
    street: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  },
  paymentMethod: 'Credit Card ending in 4242',
  trackingNumber: 'TRK123456789',
  notes: 'Please handle with care - fragile items',
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order>(mockOrder);

  const statusOptions: Array<{ key: Order['status']; label: string; color: string; icon: any }> = [
    { key: 'new', label: 'New', color: '#F59E0B', icon: Clock },
    { key: 'processing', label: 'Processing', color: '#2563EB', icon: Package },
    { key: 'shipped', label: 'Shipped', color: '#8B5CF6', icon: Truck },
    { key: 'delivered', label: 'Delivered', color: '#10B981', icon: CheckCircle },
  ];

  const handleStatusUpdate = (newStatus: Order['status']) => {
    Alert.alert(
      'Update Order Status',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            setOrder(prev => ({ ...prev, status: newStatus }));
            Alert.alert('Success', `Order status updated to ${newStatus}`);
          },
        },
      ]
    );
  };

  const getStatusInfo = (status: Order['status']) => {
    return statusOptions.find(option => option.key === status) || statusOptions[0];
  };

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
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.date).toLocaleDateString('en-US', {
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
          
          <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
          {order.trackingNumber && (
            <Text style={styles.trackingNumber}>
              Tracking: {order.trackingNumber}
            </Text>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <User size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Mail size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={20} color="#64748B" />
              <Text style={styles.infoText}>{order.customerPhone}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <MapPin size={20} color="#64748B" />
            <View style={styles.addressText}>
              <Text style={styles.addressLine}>{order.shippingAddress.street}</Text>
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
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>${item.price} × {item.quantity}</Text>
                  <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
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
                  order.status === statusOption.key && styles.currentStatusButton,
                ]}
                onPress={() => handleStatusUpdate(statusOption.key)}
                disabled={order.status === statusOption.key}
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="Send Email Update"
              onPress={() => Alert.alert('Email Sent', 'Customer has been notified of the status update')}
              variant="outline"
              fullWidth
            />
            <Button
              title="Print Order"
              onPress={() => Alert.alert('Print', 'Order details would be printed')}
              variant="outline"
              fullWidth
            />
            <Button
              title="Refund Order"
              onPress={() => Alert.alert('Refund', 'Refund process would be initiated')}
              variant="outline"
              fullWidth
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
});