import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.174:5020/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: User;
  };
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      this.token = token;
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private getHeaders(includeAuth: boolean = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      console.log('Signup response status:', response.status);

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        await this.saveToken(data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        await this.saveToken(data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(true),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeToken();
      await AsyncStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.token) return null;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await response.json();

      if (data.success && data.data) {
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data.user;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(profileData: { name?: string; phone?: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(profileData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(passwordData),
      });

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();