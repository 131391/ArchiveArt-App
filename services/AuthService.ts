import { API_CONFIG, API_ENDPOINTS, buildUrl } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as GoogleSignIn from '../config/google-signin';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile?: string;
  role: string;
  is_verified: boolean;
  profile_picture?: string; // Optional profile picture URL from API
  created_at?: string; // Optional creation date from API
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
  mobile: string;
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
      
    }
  }

  private async getStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return { accessToken, refreshToken };
    } catch (error) {
      
      return { accessToken: null, refreshToken: null };
    }
  }

  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    } catch (error) {
      
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
    const headers: any = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    // Only set Content-Type for non-FormData requests
    // For FormData (file uploads), let the browser set the multipart boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH), {
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
      
      return null;
    }
  }

  // Public methods
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    
    
    
    
    // Check if we're in mock mode
    if (API_CONFIG.MOCK_MODE) {
      
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - accept any email/password for demo
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter both email and password');
      }
      
      // Mock successful login for demo purposes
      const mockUser: User = {
        id: 1,
        name: 'Demo User',
        username: 'demo_user',
        email: credentials.email,
        mobile: '+1234567890',
        role: 'user',
        is_verified: true,
      };
      
      const mockResponse: AuthResponse = {
        message: 'Login successful (Mock Mode)',
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
        user: mockUser,
      };
      
      // Store tokens securely
      await this.storeTokens(mockResponse.accessToken, mockResponse.refreshToken);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      
      return mockResponse;
    }
    
    // Real API call (when mock mode is disabled)
        
        const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        
        // Handle rate limiting specifically
        if (errorData.error && errorData.error.includes('Too many authentication attempts')) {
          const retryAfter = errorData.retryAfter || 900;
          const minutes = Math.ceil(retryAfter / 60);
          errorMessage = `Too many login attempts. Please wait ${minutes} minutes before trying again.`;
        } else {
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (parseError) {
        
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      
      throw new Error('Invalid response from server');
    }
    
    // Validate response data
    if (!data.accessToken || !data.refreshToken || !data.user) {
      
      throw new Error('Invalid response data from server');
    }
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    // Store user data
    
    
    
    
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    
    
    
    
    
    if (API_CONFIG.MOCK_MODE) {
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse: AuthResponse = {
        user: {
          id: Date.now(),
          name: userData.name,
          username: userData.username,
          email: userData.email,
          mobile: userData.mobile,
          role: 'user',
          is_verified: false,
        },
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        message: 'Registration successful (Mock Mode)',
        expiresIn: 3600,
      };
      
      await this.storeTokens(mockResponse.accessToken, mockResponse.refreshToken);
      
      return mockResponse;
    }
    
    const registerUrl = buildUrl(API_ENDPOINTS.AUTH.REGISTER);
    
    
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    
    

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      let errorDetails = '';
      try {
        const errorData = await response.json();
        
        
        // Handle rate limiting specifically
        if (errorData.error && errorData.error.includes('Too many authentication attempts')) {
          const retryAfter = errorData.retryAfter || 900;
          const minutes = Math.ceil(retryAfter / 60);
          errorMessage = `Too many registration attempts. Please wait ${minutes} minutes before trying again.`;
        } else {
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          errorDetails = errorData.details || errorData.errors || '';
        }
      } catch (parseError) {
        
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      const fullErrorMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage;
      throw new Error(fullErrorMessage);
    }

    const data: AuthResponse = await response.json();
    
    // Check if the response contains an error even with 200 status
    if (data && typeof data === 'object' && 'error' in data) {
      
      const errorMessage = typeof data.error === 'string' ? data.error : 'Registration failed';
      throw new Error(errorMessage);
    }
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    
    return data;
  }

  public async googleLogin(googleData?: GoogleAuthData): Promise<AuthResponse> {
    
    
    try {
      // Debug: Check if the function is available
      
      
      if (typeof GoogleSignIn.completeGoogleAuthFlow !== 'function') {
        throw new Error('completeGoogleAuthFlow function is not available');
      }
      
      // Step 1: Complete Google Sign-In flow
      const authFlowResult = await GoogleSignIn.completeGoogleAuthFlow();
      
      if (!authFlowResult.success) {
        // Handle Google Sign-In errors
        if (authFlowResult.error === 'USER_CANCELLED') {
          throw new Error('Sign in was cancelled by user');
        } else if (authFlowResult.error === 'NETWORK_ERROR') {
          throw new Error('Network error. Please check your internet connection');
        } else if (authFlowResult.error === 'PLAY_SERVICES_ERROR') {
          throw new Error('Google Play Services not available');
        } else if (authFlowResult.error === 'GOOGLE_SIGNIN_NOT_AVAILABLE') {
          throw new Error('Google Sign-In is not available in this environment. Please use a development build or production build.');
        } else if (authFlowResult.error === 'DEVELOPER_ERROR') {
          throw new Error('DEVELOPER_ERROR: Google Sign-In configuration issue. Please check your Google OAuth setup and ensure the SHA-1 fingerprint matches your production build.');
        } else {
          throw new Error(authFlowResult.message || 'Google Sign-In failed');
        }
      }
      
      const googleResult = authFlowResult.googleData!;
      
      // Check if we're in mock mode
      if (API_CONFIG.MOCK_MODE) {
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: parseInt(googleResult.user.id) || Date.now(),
          name: googleResult.user.name,
          username: googleResult.user.email.split('@')[0],
          email: googleResult.user.email,
          mobile: '+1234567890', // Default mobile for Google users
          role: 'user',
          is_verified: true,
        };
        
        const mockResponse: AuthResponse = {
          message: 'Google authentication successful (Mock Mode)',
          accessToken: 'mock_google_access_token_' + Date.now(),
          refreshToken: 'mock_google_refresh_token_' + Date.now(),
          expiresIn: 3600,
          user: mockUser,
        };
        
        await this.storeTokens(mockResponse.accessToken, mockResponse.refreshToken);
        
        return mockResponse;
      }
      
      // Step 2: Send Google data to backend for user verification/creation
      const backendData = {
        provider: 'google',
        providerId: googleResult.user.id,
        name: googleResult.user.name,
        email: googleResult.user.email,
        profilePicture: googleResult.user.photo,
        mobile: '+1234567890', // Default mobile for Google users
      };
      
      
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.SOCIAL_LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      
      

      if (!response.ok) {
        let errorMessage = 'Google authentication failed';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          
          
          // Handle specific error cases
          if (errorData.error && errorData.error.includes('Too many authentication attempts')) {
            const retryAfter = errorData.retryAfter || 900;
            const minutes = Math.ceil(retryAfter / 60);
            errorMessage = `Too many authentication attempts. Please wait ${minutes} minutes before trying again.`;
          } else if (errorData.error && errorData.error.includes('Invalid Google token')) {
            errorMessage = 'Invalid Google authentication. Please try again.';
          } else if (errorData.error && errorData.error.includes('User already exists')) {
            errorMessage = 'An account with this email already exists. Please use regular login.';
          } else if (errorData.error && errorData.error.includes('Email not verified')) {
            errorMessage = 'Please verify your Google email address and try again.';
          } else if (errorData.error && errorData.error.includes('Account disabled')) {
            errorMessage = 'Your account has been disabled. Please contact support.';
          } else {
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            errorDetails = errorData.details || errorData.errors || '';
          }
        } catch (parseError) {
          
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        const fullErrorMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage;
        throw new Error(fullErrorMessage);
      }

      const data: AuthResponse = await response.json();
      
      // Check if the response contains an error even with 200 status
      if (data && typeof data === 'object' && 'error' in data) {
        
        const errorMessage = typeof data.error === 'string' ? data.error : 'Google authentication failed';
        throw new Error(errorMessage);
      }
      
      // Store tokens securely
      await this.storeTokens(data.accessToken, data.refreshToken);
      
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      
      return data;
    } catch (error) {
      
      
      // Re-throw the error with proper context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during Google authentication');
      }
    }
  }

  public async logout(): Promise<void> {
    
    
    
    
    try {
      const { refreshToken } = await this.getStoredTokens();
      
      
      if (refreshToken) {
        const logoutUrl = buildUrl(API_ENDPOINTS.AUTH.LOGOUT);
        
        
        const response = await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        
        
        if (!response.ok) {
          let errorMessage = 'Logout API call failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            
          } catch (parseError) {
            
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
        } else {
          
        }
      } else {
        
      }
    } catch (error) {
      
    } finally {
      // Sign out from Google
      try {
        await GoogleSignIn.signOutFromGoogle();
        
      } catch (error) {
        
        // Continue with local logout even if Google sign-out fails
      }
      
      // Always clear local storage
      
      await this.clearStoredTokens();
      
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      
      return null;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const { accessToken, refreshToken } = await this.getStoredTokens();
    
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
    const response = await this.authenticatedRequest(API_ENDPOINTS.AUTH.PROFILE);
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    
    
    
    
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data.user;
  }

  // Update user profile
  public async updateUserProfile(profileData: {
    name?: string;
    mobile?: string;
    profile_picture?: string | File;
  }): Promise<User> {
    
    
    const formData = new FormData();
    
    // Add text fields
    if (profileData.name) {
      formData.append('name', profileData.name);
    }
    if (profileData.mobile) {
      formData.append('mobile', profileData.mobile);
    }
    
    // Add profile picture if provided
    if (profileData.profile_picture) {
      if (typeof profileData.profile_picture === 'string') {
        // It's a URI from image picker
        formData.append('profile_picture', {
          uri: profileData.profile_picture,
          type: 'image/jpeg',
          name: 'profile-picture.jpg',
        } as any);
      } else {
        // It's a File object
        formData.append('profile_picture', profileData.profile_picture);
      }
    }
    
    const response = await this.makeAuthenticatedRequest(
      buildUrl(API_ENDPOINTS.AUTH.UPDATE_PROFILE),
      {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary for FormData
      }
    );
    
    
    
    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
      } catch (parseError) {
        
      }
      throw new Error(errorMessage);
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
      
      return true;
    }
  }
}

export default AuthService.getInstance();
