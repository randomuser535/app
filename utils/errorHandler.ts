import { Alert } from 'react-native';

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  statusCode?: number;
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  public errors: Array<{ field: string; message: string; value: any }>;
  
  constructor(message: string, errors: Array<{ field: string; message: string; value: any }> = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof NetworkError) {
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
  
  if (error instanceof AuthenticationError) {
    return {
      success: false,
      message: 'Authentication failed. Please login again.',
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: error.message,
      errors: error.errors,
    };
  }
  
  // Default error
  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };
};

export const showErrorAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const showNetworkErrorAlert = () => {
  showErrorAlert(
    'Connection Error',
    'Unable to connect to the server. Please check your internet connection and try again.'
  );
};

export const showValidationErrorAlert = (errors: Array<{ field: string; message: string }>) => {
  const errorMessages = errors.map(error => `• ${error.message}`).join('\n');
  showErrorAlert('Validation Error', errorMessages);
};