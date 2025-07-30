import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.174:5020/api';

export interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data?: {
    address?: Address;
    addresses?: Address[];
  };
  count?: number;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export interface CreateAddressData {
  label: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

class AddressService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getAddresses(): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        headers,
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get addresses error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async getAddress(id: string): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'GET',
        headers,
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async createAddress(addressData: CreateAddressData): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(addressData),
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Create address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async updateAddress(id: string, addressData: Partial<CreateAddressData>): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(addressData),
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Update address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async setDefaultAddress(id: string): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
        method: 'PUT',
        headers,
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Set default address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async deleteAddress(id: string): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Delete address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async getDefaultAddress(): Promise<AddressResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}/addresses/default`, {
        method: 'GET',
        headers,
      });

      const data: AddressResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get default address error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const addressService = new AddressService();