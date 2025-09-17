import { buildUrl } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile?: string;
  role: string;
  is_verified: boolean;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface GoogleAuthData {
  provider: string;
  providerId: string;
  name: string;
  email: string;
  profilePicture?: string;
  mobile?: string;
}

class AuthService {
  private static instance: AuthService;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Secure token storage using AsyncStorage (simplified for now)
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private async getStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // API request with automatic token refresh
  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const { accessToken, refreshToken } = await this.getStoredTokens();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    // Add refresh token header for automatic refresh
    if (refreshToken) {
      (headers as any)['X-Refresh-Token'] = refreshToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if we got a new access token in response headers
    const newAccessToken = response.headers.get('X-New-Access-Token');
    if (newAccessToken && refreshToken) {
      await this.storeTokens(newAccessToken, refreshToken);
    }

    // Handle token expiration
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.code === 'TOKEN_EXPIRED' && refreshToken) {
        try {
          const newTokens = await this.refreshAccessToken(refreshToken);
          if (newTokens) {
            // Retry the original request with new token
            const retryHeaders = {
              ...options.headers,
              'Authorization': `Bearer ${newTokens.accessToken}`,
              'Content-Type': 'application/json',
            };
            
            return fetch(url, {
              ...options,
              headers: retryHeaders,
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }
    }

    return response;
  }

  // Refresh access token
  private async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise as Promise<{ accessToken: string; refreshToken: string } | null>;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const response = await fetch(buildUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store new tokens
      await this.storeTokens(data.accessToken, data.refreshToken);
      
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Public methods
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(buildUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(buildUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  public async googleLogin(googleData: GoogleAuthData): Promise<AuthResponse> {
    const response = await fetch(buildUrl('/api/auth/social-login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Google login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  public async logout(): Promise<void> {
    try {
      const { refreshToken } = await this.getStoredTokens();
      
      if (refreshToken) {
        await fetch(buildUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      await this.clearStoredTokens();
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const { accessToken } = await this.getStoredTokens();
    return !!accessToken;
  }

  public async getAccessToken(): Promise<string | null> {
    const { accessToken } = await this.getStoredTokens();
    return accessToken;
  }

  // Make authenticated API requests
  public async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeAuthenticatedRequest(buildUrl(url), options);
  }

  // Get user profile
  public async getUserProfile(): Promise<User> {
    const response = await this.authenticatedRequest('/api/auth/profile');
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data.user;
  }

  // Check if token is expired
  public async isTokenExpired(): Promise<boolean> {
    const { accessToken } = await this.getStoredTokens();
    
    if (!accessToken) {
      return true;
    }

    try {
      // Decode JWT token (simple decode without verification)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

export default AuthService.getInstance();
