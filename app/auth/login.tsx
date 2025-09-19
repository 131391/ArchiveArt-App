import { ModernAlert } from '@/components/ui/ModernAlert';
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
    StatusBar,
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
  const [alert, setAlert] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'warning' | 'info' });
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

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setAlert({ visible: true, message, type });
  };

  const hideAlert = () => {
    setAlert({ visible: false, message: '', type: 'error' });
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
    hideAlert();

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
        
        showAlert(errorMessage, 'error');
      } else {
        showAlert('Login successful! Welcome back!', 'success');
        // Small delay to show success message
        setTimeout(() => {
          router.replace('/welcome');
        }, 1500);
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    hideAlert();
    
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
          showAlert('error', 'Connection Error', 'Please check your internet connection and try again.');
        } else if (error.message.includes('Google Play Services')) {
          showAlert('error', 'Google Services Error', 'Google Play Services is not available. Please update or install Google Play Services.');
        } else if (error.message.includes('Too many authentication attempts')) {
          showAlert('error', 'Too Many Attempts', error.message);
        } else if (error.message.includes('Invalid Google token')) {
          showAlert('error', 'Authentication Error', 'Invalid Google authentication. Please try again.');
        } else if (error.message.includes('User already exists')) {
          showAlert('error', 'Account Exists', 'An account with this email already exists. Please use regular login instead.');
        } else if (error.message.includes('Email not verified')) {
          showAlert('error', 'Email Verification Required', 'Please verify your Google email address and try again.');
        } else if (error.message.includes('Account disabled')) {
          showAlert('error', 'Account Disabled', 'Your account has been disabled. Please contact support.');
        } else {
          showAlert('error', 'Google Login Failed', error.message);
        }
      } else {
        // Success case
        showAlert('success', 'Welcome Back!', 'You have been successfully logged in.');
        setTimeout(() => {
          router.replace('/welcome');
        }, 1500);
      }
    } catch (error) {
      console.error('🔐 Unexpected Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during Google login';
      showAlert('error', 'Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="camera" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <ModernTextInput
                icon="mail"
                placeholder="Email address"
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
                  colors={isLoading ? ['#a8a8a8', '#888888'] : ['#667eea', '#764ba2']}
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
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
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
                <Text style={[styles.socialButtonText, isLoading && styles.socialButtonTextDisabled]}>
                  {isLoading ? 'Signing in...' : 'Google'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => {}}
                disabled={isLoading}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
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
      </LinearGradient>

      {/* Modern Alert */}
      <ModernAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#6C757D',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    letterSpacing: 0.3,
  },
  socialButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  socialButtonTextDisabled: {
    color: '#6C757D',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpLink: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


