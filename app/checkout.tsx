import React, { useState } from 'react';
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
import { ArrowLeft, CreditCard, MapPin, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp, getCartTotal } from '@/context/AppContext';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Payment Info
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function CheckoutScreen() {
  const { state, dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: state.user?.name?.split(' ')[0] || '',
    lastName: state.user?.name?.split(' ')[1] || '',
    email: state.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Shipping', icon: MapPin },
    { title: 'Payment', icon: CreditCard },
  ];

  const cartTotal = getCartTotal(state.cart);
  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 100 ? 0 : 9.99;
  const finalTotal = cartTotal + tax + shipping;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;

      case 1: // Shipping
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        break;

      case 2: // Payment
        if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
        else if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Invalid card number';
        if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
        else {
          // Validate MM/YY format
          const match = formData.expiryDate.match(/^(\d{2})\/(\d{2})$/);
          if (!match) {
            newErrors.expiryDate = 'Invalid format (MM/YY)';
          } else {
            const month = parseInt(match[1], 10);
            const year = parseInt(match[2], 10) + 2000; // assumes 20YY
            const now = new Date();
            const expiry = new Date(year, month - 1, 1);
            // Check month range
            if (month < 1 || month > 12) {
              newErrors.expiryDate = 'Invalid month';
            } else if (
              expiry.getFullYear() < now.getFullYear() ||
              (expiry.getFullYear() === now.getFullYear() && month < now.getMonth() + 1)
            ) {
              newErrors.expiryDate = 'Card expired';
            }
          }
        }
        if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        else if (formData.cvv.length < 3) newErrors.cvv = 'Invalid CVV';
        if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handlePlaceOrder();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : digits;
  };

  const formatExpiryDate = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 2) {
      return `${digits.substr(0, 2)}/${digits.substr(2, 2)}`;
    }
    return digits;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      const newOrder = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        total: finalTotal,
        status: 'pending' as const,
        items: [...state.cart],
      };

      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      dispatch({ type: 'CLEAR_CART' });
      
      setIsProcessing(false);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${newOrder.id} has been placed and will be processed shortly.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => {
              router.dismissAll();
              router.push('/(tabs)');
            },
          },
        ]
      );
    }, 2000);
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(text) => updateFormData('firstName', text)}
            placeholder="Enter first name"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>
        
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(text) => updateFormData('lastName', text)}
            placeholder="Enter last name"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={formData.phone}
          onChangeText={(text) => updateFormData('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </View>
  );

  const renderShipping = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Shipping Address</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          value={formData.address}
          onChangeText={(text) => updateFormData('address', text)}
          placeholder="Enter street address"
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          value={formData.city}
          onChangeText={(text) => updateFormData('city', text)}
          placeholder="Enter city"
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={[styles.input, errors.state && styles.inputError]}
            value={formData.state}
            onChangeText={(text) => updateFormData('state', text)}
            placeholder="State"
          />
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
        
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>ZIP Code</Text>
          <TextInput
            style={[styles.input, errors.zipCode && styles.inputError]}
            value={formData.zipCode}
            onChangeText={(text) => updateFormData('zipCode', text)}
            placeholder="ZIP"
            keyboardType="numeric"
          />
          {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
        </View>
      </View>
    </View>
  );

  const renderPayment = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={[styles.input, errors.cardNumber && styles.inputError]}
          value={formData.cardNumber}
          onChangeText={(text) => updateFormData('cardNumber', formatCardNumber(text))}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
        />
        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputError]}
            value={formData.expiryDate}
            onChangeText={(text) => updateFormData('expiryDate', formatExpiryDate(text))}
            placeholder="MM/YY"
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>
        
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv && styles.inputError]}
            value={formData.cvv}
            onChangeText={(text) => updateFormData('cvv', text.replace(/\D/g, ''))}
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={[styles.input, errors.cardName && styles.inputError]}
          value={formData.cardName}
          onChangeText={(text) => updateFormData('cardName', text)}
          placeholder="Name on card"
          autoCapitalize="words"
        />
        {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderShipping();
      case 2:
        return renderPayment();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Checkout"
        showBackButton
        onBackPress={handleBack}
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepIndicator}>
            <View style={[
              styles.stepCircle,
              index <= currentStep && styles.activeStepCircle
            ]}>
              {index < currentStep ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <step.icon 
                  size={16} 
                  color={index <= currentStep ? '#FFFFFF' : '#64748B'} 
                />
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              index <= currentStep && styles.activeStepLabel
            ]}>
              {step.title}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                index < currentStep && styles.activeStepConnector
              ]} />
            )}
          </View>
        ))}
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title={currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            onPress={handleNext}
            loading={isProcessing}
            fullWidth
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  activeStepLabel: {
    color: '#2563EB',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
  },
  activeStepConnector: {
    backgroundColor: '#2563EB',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 20,
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
    paddingVertical: 14,
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
  orderSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
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
  bottomActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});