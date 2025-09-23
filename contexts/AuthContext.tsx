import AuthService, { GoogleAuthData, LoginCredentials, RegisterData, User } from '@/services/AuthService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as GoogleSignIn from '../config/google-signin';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<Error | null>;
  register: (userData: RegisterData) => Promise<Error | null>;
  googleLogin: (googleData?: GoogleAuthData) => Promise<Error | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: {
    name?: string;
    mobile?: string;
    profile_picture?: string | File;
  }) => Promise<Error | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Configure Google Sign-In
      GoogleSignIn.configureGoogleSignIn();
      
      // Check if user is authenticated
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        // Get current user data
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        // Skip server profile refresh during initialization to avoid API errors
        // The user profile can be refreshed later when needed
      } else {
        setUser(null);
      }
    } catch (error) {
      // Handle auth initialization error
      // Clear any invalid auth state
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<Error | null> => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.login(credentials);
      setUser(authResponse.user);
      return null; // Success, no error
    } catch (error) {
      return error instanceof Error ? error : new Error('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<Error | null> => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.register(userData);
      setUser(authResponse.user);
      return null; // Success, no error
    } catch (error) {
      // Handle registration error
      return error instanceof Error ? error : new Error('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleData?: GoogleAuthData): Promise<Error | null> => {
    try {
      setIsLoading(true);
      
      const authResponse = await AuthService.googleLogin(googleData);
      
      setUser(authResponse.user);
      return null; // Success, no error
    } catch (error) {
      // Handle Google login error
      
      return error instanceof Error ? error : new Error('An unexpected error occurred during Google authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      // Handle logout error
      // Still clear local state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await AuthService.getUserProfile();
      setUser(freshUser);
    } catch (error) {
      // Handle user refresh error
      throw error;
    }
  };

  const updateProfile = async (profileData: {
    name?: string;
    mobile?: string;
    profile_picture?: string | File;
  }): Promise<Error | null> => {
    try {
      setIsLoading(true);
      const updatedUser = await AuthService.updateUserProfile(profileData);
      setUser(updatedUser);
      return null; // Success, no error
    } catch (error) {
      // Handle profile update error
      return error instanceof Error ? error : new Error('An unexpected error occurred during profile update.');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
