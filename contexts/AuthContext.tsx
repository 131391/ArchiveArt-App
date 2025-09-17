import AuthService, { GoogleAuthData, LoginCredentials, RegisterData, User } from '@/services/AuthService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  googleLogin: (googleData: GoogleAuthData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      console.log('🔐 Initializing authentication...');
      setIsLoading(true);
      
      // Check if user is authenticated
      const isAuth = await AuthService.isAuthenticated();
      console.log('🔐 Is authenticated:', isAuth);
      
      if (isAuth) {
        // Get current user data
        const currentUser = await AuthService.getCurrentUser();
        console.log('🔐 Current user:', currentUser);
        setUser(currentUser);
        
        // Skip server profile refresh during initialization to avoid API errors
        // The user profile can be refreshed later when needed
        console.log('🔐 Using cached user data for initialization');
      } else {
        console.log('🔐 User is not authenticated');
      }
    } catch (error) {
      console.error('🔐 Auth initialization error:', error);
      // Clear any invalid auth state
      await AuthService.logout();
      setUser(null);
    } finally {
      console.log('🔐 Auth initialization completed');
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
      return error instanceof Error ? error : new Error('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleData: GoogleAuthData): Promise<Error | null> => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.googleLogin(googleData);
      setUser(authResponse.user);
      return null; // Success, no error
    } catch (error) {
      return error instanceof Error ? error : new Error('An unexpected error occurred during Google login.');
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
      console.error('Logout error:', error);
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
      console.error('Error refreshing user:', error);
      throw error;
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
