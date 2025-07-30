import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Camera, CreditCard as MapPin, Phone, Mail, Lock, Save, X, SquarePen } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authService } from '@/services/authService';
import { addressService, Address } from '@/services/addressesService';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}


export default function UserProfileScreen() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: state.user?.name || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    avatar: state.user?.avatar,
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [errors, setErrors] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await addressService.getAddresses();
      
      if (response.success && response.data?.addresses) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Partial<UserProfile> = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profile.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(profile.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (profile.phone && profile.phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);

    try {
      const updateData: { name?: string; phone?: string } = {};
      
      // Only include fields that have changed
      if (profile.name.trim() !== state.user?.name) {
        updateData.name = profile.name.trim();
      }
      
      if (profile.phone.trim() !== (state.user?.phone || '')) {
        updateData.phone = profile.phone.trim();
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await authService.updateProfile(updateData);
        
        if (response.success && response.data) {
          // Update user in context
          dispatch({
            type: 'SET_USER',
            payload: response.data.user,
          });
          
          Alert.alert('Success', 'Profile updated successfully!');
        } else {
          Alert.alert('Error', response.message || 'Failed to update profile');
          setIsSaving(false);
          return;
        }
      } else {
        Alert.alert('No Changes', 'No changes were made to your profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile({
      name: state.user?.name || '',
      email: state.user?.email || '',
      phone: state.user?.phone || '',
      avatar: state.user?.avatar,
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleAddAddress = () => {
    router.push('/manage-addresses');
  };


  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera') },
        { text: 'Gallery', onPress: () => console.log('Gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Profile"
        showBackButton
        onBackPress={() => router.back()}
        rightAction={
          isEditing ? (
            <TouchableOpacity onPress={handleCancel}>
              <X size={24} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <SquarePen size={24} color="#64748B" />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton} onPress={handleChangeAvatar}>
                <Camera size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
          {state.user?.isEmailVerified !== undefined && (
            <View style={styles.verificationStatus}>
              <View style={[
                styles.verificationDot,
                { backgroundColor: state.user.isEmailVerified ? '#10B981' : '#F59E0B' }
              ]} />
              <Text style={[
                styles.verificationText,
                { color: state.user.isEmailVerified ? '#10B981' : '#F59E0B' }
              ]}>
                {state.user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
              </Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={profile.name}
              onChangeText={(text) => {
                setProfile(prev => ({ ...prev, name: text }));
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your full name"
              editable={isEditing}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={profile.email}
              onChangeText={(text) => {
                setProfile(prev => ({ ...prev, email: text }));
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            {!isEditing && (
              <Text style={styles.fieldNote}>Email cannot be changed for security reasons</Text>
            )}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={profile.phone}
              onChangeText={(text) => {
                setProfile(prev => ({ ...prev, phone: text }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={isEditing}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/* Delivery Addresses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Addresses</Text>
            <TouchableOpacity onPress={() => router.push('/manage-addresses')}>
              <Text style={styles.addButton}>Add New</Text>
            </TouchableOpacity>
          </View>

          {isLoadingAddresses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressesContainer}>
              <Text style={styles.noAddressesText}>No delivery addresses saved</Text>
              <TouchableOpacity onPress={() => router.push('/manage-addresses')}>
                <Text style={styles.addFirstAddressText}>Add your first address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.slice(0, 2).map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[styles.addressCard, address.isDefault && styles.defaultAddress]}
              onPress={() => router.push('/manage-addresses')}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressLabelContainer}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => router.push('/manage-addresses')}>
                  <SquarePen size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addressText}>
                {address.address}, {address.city}, {address.state} {address.zipCode}
              </Text>
            </TouchableOpacity>
            ))
          )}
          
          {addresses.length > 2 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/manage-addresses')}
            >
              <Text style={styles.viewAllText}>
                View all {addresses.length} addresses
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.securityItem} onPress={handleChangePassword}>
            <View style={styles.securityItemContent}>
              <Lock size={20} color="#64748B" />
              <TouchableOpacity onPress={() => router.push('/change-password')}>
                <Text style={styles.securityItemText}>Change Password</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/change-password')}>
              <Text style={styles.securityItemAction}>Update</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveSection}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isSaving}
              fullWidth
              size="large"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  verificationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  addButton: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  fieldNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  defaultAddress: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  noAddressesContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noAddressesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  addFirstAddressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  securityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 12,
  },
  securityItemAction: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  saveSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});