import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter, Package, Truck, CircleCheck as CheckCircle, Circle as XCircle, Clock, Calendar, DollarSign } from 'lucide-react-native';
import { orderService, Order, OrderFilters } from '@/services/orderService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  React.useEffect(() => {
    loadOrders();
    loadOrderStats();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const filters: OrderFilters = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50
      };
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      const response = await orderService.getOrders(filters);
      
      if (response.success && response.data?.orders) {
        setOrders(response.data.orders);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const response = await orderService.getOrderStats();
      if (response.success && response.data) {
        setOrderStats(response.data);
      }
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    await loadOrderStats();
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOrders();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'processing':
        return <Package size={16} color="#2563EB" />;
      case 'shipped':
        return <Truck size={16} color="#8B5CF6" />;
      case 'delivered':
        return <CheckCircle size={16} color="#10B981" />;
      case 'cancelled':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#64748B" />;
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
      case 'cancelled':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    Alert.alert('Success', `Order ${orderId} status updated to ${newStatus}`);
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        await loadOrders(); // Refresh orders
        Alert.alert('Success', `Order status updated to ${newStatus}`);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: Order['status']) => {
    if (selectedOrders.length === 0) return;

    Alert.alert(
      'Update Status',
      `Update ${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            orderService.bulkUpdateStatus(selectedOrders, newStatus)
              .then(response => {
                if (response.success) {
                  setSelectedOrders([]);
                  loadOrders(); // Refresh orders
                  Alert.alert('Success', 'Orders updated successfully');
                } else {
                  Alert.alert('Error', response.message);
                }
              })
              .catch(error => {
                Alert.alert('Error', 'Failed to update orders');
              });
          },
        },
      ]
    );
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[
        styles.orderCard,
        selectedOrders.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => router.push(`/admin/orders/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedOrders.includes(item.id) && styles.checkedBox
          ]}
          onPress={() => handleSelectOrder(item.id)}
        >
          {selectedOrders.includes(item.id) && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerInfo.name}</Text>
          <Text style={styles.customerEmail}>{item.customerInfo.email}</Text>
        </View>
        
        <View style={styles.orderMeta}>
          <Text style={styles.itemCount}>{item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
          <Text style={styles.orderTotal}>${item.pricing.total.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#2563EB20' }]}
            onPress={() => handleQuickStatusUpdate(item.id, 'processing')}
          >
            <Package size={14} color="#2563EB" />
          </TouchableOpacity>
        )}
        {item.status === 'processing' && (
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#8B5CF620' }]}
            onPress={() => handleQuickStatusUpdate(item.id, 'shipped')}
          >
            <Truck size={14} color="#8B5CF6" />
          </TouchableOpacity>
        )}
        {item.status === 'shipped' && (
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#10B98120' }]}
            onPress={() => handleQuickStatusUpdate(item.id, 'delivered')}
          >
            <CheckCircle size={14} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Orders</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Order Statistics */}
      {orderStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={20} color="#2563EB" />
            <Text style={styles.statNumber}>{orderStats.overview?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color="#10B981" />
            <Text style={styles.statNumber}>{orderStats.overview?.recentOrders || 0}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#F59E0B" />
            <Text style={styles.statNumber}>
              ${(orderStats.overview?.totalRevenue || 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      )}

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={statusOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  selectedStatus === item && styles.activeStatusChip
                ]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text style={[
                  styles.statusChipText,
                  selectedStatus === item && styles.activeStatusChipText
                ]}>
                  {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.statusList}
          />
        </View>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <View style={styles.bulkActions}>
          <Text style={styles.selectedCount}>
            {selectedOrders.length} selected
          </Text>
          <View style={styles.bulkButtons}>
            <TouchableOpacity 
              style={[styles.bulkButton, { backgroundColor: '#2563EB' }]}
              onPress={() => handleBulkStatusUpdate('processing')}
            >
              <Text style={styles.bulkButtonText}>Process</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => handleBulkStatusUpdate('shipped')}
            >
              <Text style={styles.bulkButtonText}>Ship</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleBulkStatusUpdate('delivered')}
            >
              <Text style={styles.bulkButtonText}>Deliver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers make purchases'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Package size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers make purchases'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    height: 48,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  activeStatusChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeStatusChipText: {
    color: '#FFFFFF',
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCard: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});