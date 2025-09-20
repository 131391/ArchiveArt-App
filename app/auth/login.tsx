import { AutoDismissNotification } from '@/components/ui/AutoDismissNotification';
import { ModernTextInput } from '@/components/ui/ModernTextInput';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState({ 
    visible: false, 
    type: 'success' as 'success' | 'error', 
    title: '', 
    message: '' 
  });
  const { login, googleLogin } = useAuth();
  
  // Animated spinner for loading state
  const spinValue = useRef(new Animated.Value(0)).current;

  // Spinner animation effect
  useEffect(() => {
    if (isLoading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showNotification = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ visible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification({ visible: false, type: 'success', title: '', message: '' });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
    
    if (text.trim() && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
  };

  const handleLogin = async () => {
    console.log('🔐 Login button clicked');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
    // Clear any previous errors
    setEmailError('');
    setPasswordError('');
    hideNotification();

    let hasError = false;

    // Email validation
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) {
      console.log('❌ Validation errors found, not proceeding with login');
      return;
    }

    console.log('✅ Validation passed, starting login process');
    setIsLoading(true);
    
    try {
      const error = await login({ email: email.trim(), password });
      
      if (error) {
        // Handle different types of errors with user-friendly messages
        let errorMessage = error.message;
        
        if (errorMessage.includes('Invalid credentials') || errorMessage.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (errorMessage.includes('Too many')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        }
        
        showNotification('Login Failed', errorMessage, 'error');
      } else {
        showNotification('Login Successful', 'Welcome back! You are now logged in.', 'success');
        // Small delay to show success message
        setTimeout(() => {
          router.replace('/welcome');
        }, 2000);
      }
    } catch (err) {
      showNotification('Login Failed', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    hideNotification();
    
    try {
      console.log('🔐 Google login button clicked');
      
      const error = await googleLogin();
      
      if (error) {
        console.error('🔐 Google login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('cancelled')) {
          // User cancelled - don't show error message
          console.log('🔐 User cancelled Google login');
          return;
        } else if (error.message.includes('Network error')) {
          showNotification('Connection Error', 'Please check your internet connection and try again.', 'error');
        } else if (error.message.includes('Google Play Services')) {
          showNotification('Google Services Error', 'Google Play Services is not available. Please update or install Google Play Services.', 'error');
        } else if (error.message.includes('Too many authentication attempts')) {
          showNotification('Too Many Attempts', error.message, 'error');
        } else if (error.message.includes('Invalid Google token')) {
          showNotification('Authentication Error', 'Invalid Google authentication. Please try again.', 'error');
        } else if (error.message.includes('User already exists')) {
          showNotification('Account Exists', 'An account with this email already exists. Please use regular login instead.', 'error');
        } else if (error.message.includes('Email not verified')) {
          showNotification('Email Verification Required', 'Please verify your Google email address and try again.', 'error');
        } else if (error.message.includes('Account disabled')) {
          showNotification('Account Disabled', 'Your account has been disabled. Please contact support.', 'error');
        } else if (error.message.includes('Google Sign-In is not available')) {
          showNotification('Google Sign-In Not Available', 'Google Sign-In is not available in Expo Go. Please use a development build or production build to test Google authentication.', 'error');
        } else if (error.message.includes('DEVELOPER_ERROR')) {
          showNotification('Google Login Failed', 'DEVELOPER_ERROR: Google Sign-In configuration issue. Please check your Google OAuth setup and ensure the SHA-1 fingerprint matches your production build.', 'error');
        } else {
          showNotification('Google Login Failed', error.message, 'error');
        }
      } else {
        // Success case
        showNotification('Login Successful', 'Welcome back! You are now logged in.', 'success');
        setTimeout(() => {
          router.replace('/welcome');
        }, 2000);
      }
    } catch (error) {
      console.error('🔐 Unexpected Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during Google login';
      showNotification('Login Failed', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContent}>

            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Log in to ArchivART</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ModernTextInput
                icon="mail"
                placeholder="Email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
              
              <ModernTextInput
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                error={passwordError}
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => router.push('/auth/forgot')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#8B5CF6']}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.loginButtonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Social Login */}
            <View style={styles.socialSection}>
              <Text style={styles.socialText}>Or you log in with</Text>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh" size={20} color="#DB4437" />
                    </Animated.View>
                  ) : (
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => {}}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Auto Dismiss Notification */}
      <AutoDismissNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={3000}
        onDismiss={hideNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});


