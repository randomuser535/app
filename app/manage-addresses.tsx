import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Plus, SquarePen, Trash2, Star, Chrome as Home, Briefcase } from 'lucide-react-native';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { addressService, Address, CreateAddressData } from '@/services/addressesService';


export default function ManageAddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<CreateAddressData>({
    label: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    type: 'home',
  });

  const [errors, setErrors] = useState<Partial<CreateAddressData>>({});

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await addressService.getAddresses();
      
      if (response.success && response.data?.addresses) {
        setAddresses(response.data.addresses);
      } else {
        Alert.alert('Error', response.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAddressData> = {};

    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // Validate ZIP code format (basic US format)
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }

    // Validate phone format (basic US format)
    if (formData.phone && !/^\+?1?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
    if (editingAddress) {
        // Update existing address
        const response = await addressService.updateAddress(editingAddress.id, formData);
        
        if (response.success) {
          Alert.alert('Success', 'Address updated successfully!');
          await loadAddresses(); // Reload addresses
          resetForm();
        } 
    } else {
        // Create new address
        const addressData: CreateAddressData = {
          ...formData,
          isDefault: addresses.length === 0, // First address is default
        };
        
        const response = await addressService.createAddress(addressData);
        
        if (response.success) {
          Alert.alert('Success', 'Address added successfully!');
          await loadAddresses(); // Reload addresses
          resetForm();
        } 
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      type: 'home',
    });
    setErrors({});
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      label: address.label,
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address?.isDefault && addresses.length > 1) {
      Alert.alert(
        'Cannot Delete',
        'You cannot delete your default address. Please set another address as default first.'
      );
      return;
    }

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressService.deleteAddress(addressId);
              
              if (response.success) {
                Alert.alert('Success', 'Address deleted successfully');
                await loadAddresses(); // Reload addresses
              } else {
                Alert.alert('Error', response.message || 'Failed to delete address');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      
      if (response.success) {
        Alert.alert('Success', 'Default address updated!');
        await loadAddresses(); // Reload addresses
      } else {
        Alert.alert('Error', response.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={16} color="#64748B" />;
      case 'work':
        return <Briefcase size={16} color="#64748B" />;
      default:
        return <MapPin size={16} color="#64748B" />;
    }
  };

  const renderAddressCard = (address: Address) => (
    <View key={address.id} style={[styles.addressCard, address.isDefault && styles.defaultAddress]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          {getAddressTypeIcon(address.type)}
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <SquarePen size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.addressName}>{address.name}</Text>
      <Text style={styles.addressPhone}>{address.phone}</Text>
      <Text style={styles.addressText}>
        {address.address}
      </Text>
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.zipCode}
      </Text>
      <Text style={styles.addressText}>{address.country}</Text>

      {!address.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddressForm = () => (
    <KeyboardAvoidingView 
      style={styles.formContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Text>

          {/* Address Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Type</Text>
            <View style={styles.typeSelector}>
              {[
                { key: 'home', label: 'Home', icon: Home },
                { key: 'work', label: 'Work', icon: Briefcase },
                { key: 'other', label: 'Other', icon: MapPin },
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeOption,
                    formData.type === key && styles.selectedType,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: key as any }))}
                >
                  <Icon size={16} color={formData.type === key ? '#FFFFFF' : '#64748B'} />
                  <Text style={[
                    styles.typeText,
                    formData.type === key && styles.selectedTypeText,
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Label</Text>
            <TextInput
              style={[styles.input, errors.label && styles.inputError]}
              value={formData.label}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, label: text }));
                if (errors.label) setErrors(prev => ({ ...prev, label: undefined }));
              }}
              placeholder="e.g., Home, Work, Mom's House"
            />
            {errors.label && <Text style={styles.errorText}>{errors.label}</Text>}
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter recipient's full name"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, phone: text }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
              }}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, address: text }));
                if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
              }}
              placeholder="Street address, apartment, suite, etc."
              multiline
              numberOfLines={2}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* City, State, ZIP */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={formData.city}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, city: text }));
                  if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
                }}
                placeholder="City"
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                value={formData.state}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, state: text }));
                  if (errors.state) setErrors(prev => ({ ...prev, state: undefined }));
                }}
                placeholder="NY"
                maxLength={2}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>ZIP</Text>
              <TextInput
                style={[styles.input, errors.zipCode && styles.inputError]}
                value={formData.zipCode}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, zipCode: text }));
                  if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: undefined }));
                }}
                placeholder="10001"
                keyboardType="numeric"
              />
              {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>
          </View>

          {/* Country */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
              placeholder="United States"
            />
          </View>

          <View style={styles.formActions}>
            <Button
              title="Cancel"
              onPress={resetForm}
              variant="outline"
            />
            <Button
              title={editingAddress ? 'Update Address' : 'Save Address'}
              onPress={handleSaveAddress}
              loading={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={editingAddress ? 'Edit Address' : 'Add Address'}
          showBackButton
          onBackPress={resetForm}
        />
        {renderAddressForm()}
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Delivery Addresses"
          showBackButton
          onBackPress={() => router.back()}
        />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Delivery Addresses"
        showBackButton
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => setShowAddForm(true)}>
            <Plus size={24} color="#2563EB" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MapPin size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptySubtitle}>
                Add your delivery addresses to make checkout faster
              </Text>
              <Button
                title="Add First Address"
                onPress={() => setShowAddForm(true)}
                size="large"
              />
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
              </Text>
              {addresses.map(renderAddressCard)}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(true)} 
              >
                <Plus size={20} color="#2563EB" />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </>
          )}
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
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  defaultAddress: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 2,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  setDefaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
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
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedType: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 8,
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
});