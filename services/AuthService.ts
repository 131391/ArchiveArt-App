import { API_CONFIG, API_ENDPOINTS, buildUrl } from '@/constants/Api';
import { signInWithGoogle, signOutFromGoogle, completeGoogleAuthFlow } from '@/config/google-signin';
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

    console.log('🔐 Making authenticated request to:', url);
    console.log('🔐 Request headers:', JSON.stringify(headers, null, 2));
    console.log('🔐 Request method:', options.method || 'GET');
    console.log('🔐 Request body type:', options.body ? (options.body instanceof FormData ? 'FormData' : typeof options.body) : 'none');

    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log('🔐 Response received - Status:', response.status, response.statusText);
    console.log('🔐 Response URL:', response.url);

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
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Public methods
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 AuthService.login called with email:', credentials.email);
    console.log('🔐 MOCK_MODE:', API_CONFIG.MOCK_MODE);
    console.log('🔐 BASE_URL:', API_CONFIG.BASE_URL);
    
    // Check if we're in mock mode
    if (API_CONFIG.MOCK_MODE) {
      console.log('🔐 Using mock authentication for development');
      
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
      
      console.log('🔐 Mock login successful for user:', mockUser.email);
      return mockResponse;
    }
    
    // Real API call (when mock mode is disabled)
        console.log('🔐 Making real API call to:', buildUrl(API_ENDPOINTS.AUTH.LOGIN));
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
        console.error('Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse login response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    // Validate response data
    if (!data.accessToken || !data.refreshToken || !data.user) {
      console.error('Invalid login response data:', data);
      throw new Error('Invalid response data from server');
    }
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('🔐 AuthService.register called');
    console.log('🔐 MOCK_MODE:', API_CONFIG.MOCK_MODE);
    console.log('🔐 BASE_URL:', API_CONFIG.BASE_URL);
    console.log('🔐 Register data:', JSON.stringify(userData, null, 2));
    
    if (API_CONFIG.MOCK_MODE) {
      console.log('🔐 Using mock registration');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse: AuthResponse = {
        user: {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'user',
        },
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };
      
      await this.storeTokens(mockResponse.accessToken, mockResponse.refreshToken);
      console.log('🔐 Mock registration successful');
      return mockResponse;
    }
    
    const registerUrl = buildUrl(API_ENDPOINTS.AUTH.REGISTER);
    console.log('🔐 Making registration API call to:', registerUrl);
    
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('🔐 Registration API response status:', response.status);
    console.log('🔐 Registration API response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.log('🔐 Registration API error response:', errorData);
        
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
        console.error('🔐 Failed to parse registration error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      const fullErrorMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage;
      throw new Error(fullErrorMessage);
    }

    const data: AuthResponse = await response.json();
    console.log('🔐 Registration API success response:', {
      user: data.user,
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
    });
    
    // Check if the response contains an error even with 200 status
    if (data && typeof data === 'object' && 'error' in data) {
      console.log('🔐 Registration API returned error in response body:', data.error);
      throw new Error(data.error || 'Registration failed');
    }
    
    // Store tokens securely
    await this.storeTokens(data.accessToken, data.refreshToken);
    console.log('🔐 Registration tokens stored successfully');
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    console.log('🔐 Registration user data stored successfully');
    
    return data;
  }

  public async googleLogin(googleData?: GoogleAuthData): Promise<AuthResponse> {
    console.log('🔐 Starting Google authentication flow');
    
    try {
      // Step 1: Complete Google Sign-In flow
      const authFlowResult = await completeGoogleAuthFlow();
      
      if (!authFlowResult.success) {
        // Handle Google Sign-In errors
        if (authFlowResult.error === 'USER_CANCELLED') {
          throw new Error('Sign in was cancelled by user');
        } else if (authFlowResult.error === 'NETWORK_ERROR') {
          throw new Error('Network error. Please check your internet connection');
        } else if (authFlowResult.error === 'PLAY_SERVICES_ERROR') {
          throw new Error('Google Play Services not available');
        } else {
          throw new Error(authFlowResult.message || 'Google Sign-In failed');
        }
      }
      
      const googleResult = authFlowResult.googleData!;
      console.log('🔐 Google Sign-In successful, processing with backend:', {
        id: googleResult.user.id,
        email: googleResult.user.email,
        name: googleResult.user.name,
      });
      
      // Check if we're in mock mode
      if (API_CONFIG.MOCK_MODE) {
        console.log('🔐 Using mock Google authentication with real Google data');
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
        console.log('🔐 Mock Google authentication successful');
        return mockResponse;
      }
      
      // Step 2: Send Google data to backend for user verification/creation
      const backendData = {
        provider: 'google',
        providerId: googleResult.user.id,
        name: googleResult.user.name,
        email: googleResult.user.email,
        profilePicture: googleResult.user.photo,
        idToken: googleResult.idToken,
        // Additional data for user creation if needed
        givenName: googleResult.user.givenName,
        familyName: googleResult.user.familyName,
      };
      
      console.log('🔐 Making Google authentication API call to:', buildUrl(API_ENDPOINTS.AUTH.SOCIAL_LOGIN));
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.SOCIAL_LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      console.log('🔐 Google auth API response status:', response.status);
      console.log('🔐 Google auth API response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Google authentication failed';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.log('🔐 Google auth API error response:', errorData);
          
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
          console.error('🔐 Failed to parse Google auth error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        const fullErrorMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage;
        throw new Error(fullErrorMessage);
      }

      const data: AuthResponse = await response.json();
      console.log('🔐 Google auth API success response:', {
        user: data.user,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        message: data.message,
      });
      
      // Check if the response contains an error even with 200 status
      if (data && typeof data === 'object' && 'error' in data) {
        console.log('🔐 Google auth API returned error in response body:', data.error);
        throw new Error(data.error || 'Google authentication failed');
      }
      
      // Store tokens securely
      await this.storeTokens(data.accessToken, data.refreshToken);
      console.log('🔐 Google auth tokens stored successfully');
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      console.log('🔐 Google auth user data stored successfully');
      
      return data;
    } catch (error) {
      console.error('🔐 Google authentication error:', error);
      
      // Re-throw the error with proper context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during Google authentication');
      }
    }
  }

  public async logout(): Promise<void> {
    console.log('🔐 AuthService.logout called');
    console.log('🔐 MOCK_MODE:', API_CONFIG.MOCK_MODE);
    console.log('🔐 BASE_URL:', API_CONFIG.BASE_URL);
    
    try {
      const { refreshToken } = await this.getStoredTokens();
      console.log('🔐 Refresh token exists:', !!refreshToken);
      
      if (refreshToken) {
        const logoutUrl = buildUrl(API_ENDPOINTS.AUTH.LOGOUT);
        console.log('🔐 Making logout API call to:', logoutUrl);
        
        const response = await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        console.log('🔐 Logout API response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'Logout API call failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            console.error('🔐 Logout API error response:', errorData);
          } catch (parseError) {
            console.error('🔐 Failed to parse logout error response:', parseError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          console.error('🔐 Logout API failed:', errorMessage);
        } else {
          console.log('🔐 Logout API call successful');
        }
      } else {
        console.log('🔐 No refresh token found, skipping API call');
      }
    } catch (error) {
      console.error('🔐 Logout API call failed with error:', error);
    } finally {
      // Sign out from Google
      try {
        await signOutFromGoogle();
        console.log('🔐 Google Sign-Out successful');
      } catch (error) {
        console.error('🔐 Google Sign-Out error:', error);
        // Continue with local logout even if Google sign-out fails
      }
      
      // Always clear local storage
      console.log('🔐 Clearing stored tokens and user data');
      await this.clearStoredTokens();
      console.log('🔐 Logout completed');
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
    const { accessToken, refreshToken } = await this.getStoredTokens();
    console.log('🔐 Checking authentication - accessToken exists:', !!accessToken, 'refreshToken exists:', !!refreshToken);
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
