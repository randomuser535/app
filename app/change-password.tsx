import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react-native';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { authService } from '@/services/authService';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    let color = '#EF4444'; // Red
    if (score >= 4) color = '#10B981'; // Green
    else if (score >= 3) color = '#F59E0B'; // Yellow

    return { score, feedback, color };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordStrength.score < 4) {
      newErrors.newPassword = 'Password does not meet requirements';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setIsLoading(false);

      if (response.success) {
        Alert.alert(
          'Password Changed',
          'Your password has been successfully updated.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Handle API errors
        if (response.errors && response.errors.length > 0) {
          const fieldErrors: typeof errors = {};
          response.errors.forEach(error => {
            if (error.field === 'currentPassword') fieldErrors.currentPassword = error.message;
            if (error.field === 'newPassword') fieldErrors.newPassword = error.message;
          });
          setErrors(fieldErrors);
        } else {
          Alert.alert('Error', response.message || 'Failed to change password');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Change password error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderPasswordRequirement = (met: boolean, text: string) => (
    <View style={styles.requirement}>
      {met ? (
        <Check size={16} color="#10B981" />
      ) : (
        <X size={16} color="#EF4444" />
      )}
      <Text style={[styles.requirementText, { color: met ? '#10B981' : '#64748B' }]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <Header
        title="Change Password"
        showBackButton
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.form}>
          <Text style={styles.description}>
            For your security, please enter your current password and create a new strong password.
          </Text>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.currentPassword && styles.inputError]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  clearError('currentPassword');
                }}
                placeholder="Enter your current password"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.newPassword && styles.inputError]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  clearError('newPassword');
                }}
                placeholder="Enter your new password"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.score < 3 ? 'Weak' : passwordStrength.score < 4 ? 'Medium' : 'Strong'}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                {renderPasswordRequirement(newPassword.length >= 8, 'At least 8 characters')}
                {renderPasswordRequirement(/[A-Z]/.test(newPassword), 'One uppercase letter')}
                {renderPasswordRequirement(/[a-z]/.test(newPassword), 'One lowercase letter')}
                {renderPasswordRequirement(/\d/.test(newPassword), 'One number')}
                {renderPasswordRequirement(/[@$!%*?&]/.test(newPassword), 'One special character (@$!%*?&)')}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={isLoading}
            fullWidth
            size="large"
          />

          {/* Security Tips */}
          <View style={styles.securityTips}>
            <Lock size={20} color="#64748B" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Security Tips</Text>
              <Text style={styles.tipsText}>
                • Use a unique password you don't use elsewhere{'\n'}
                • Consider using a password manager{'\n'}
                • Change your password regularly
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
  requirements: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  securityTips: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 18,
  },
});