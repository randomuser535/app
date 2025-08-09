// API Configuration
export const API_CONFIG = {
  // Development
  DEV_BASE_URL: 'http://192.168.0.174:5020/api',
  
  PROD_BASE_URL: 'https://your-api-domain.com/api',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Get the appropriate base URL based on environment
export const getBaseURL = (): string => {
  // In a real app, you might use environment variables or build configurations
  // For now, we'll use development URL
  return __DEV__ ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;
};

// Common headers
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Auth headers
export const getAuthHeaders = (token: string) => ({
  ...getDefaultHeaders(),
  'Authorization': `Bearer ${token}`,
});