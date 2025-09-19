import { ModernAlert } from '@/components/ui/ModernAlert';
import { ModernTextInput } from '@/components/ui/ModernTextInput';
import { validateEmail, validateIndianMobile, validatePassword } from '@/constants/Api';
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

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mobileError, setMobileError] = useState('');
  
  // Alert state
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });
  
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  
  const { register, googleLogin } = useAuth();
  
  // Animate spinner
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading, spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Alert functions
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlert({ visible: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  // Validation functions
  const handleNameChange = (text: string) => {
    setName(text);
    if (text.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
    } else {
      setNameError('');
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (text.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(text)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text && !validatePassword(text)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    } else {
      setPasswordError('');
    }
  };

  const handleMobileChange = (text: string) => {
    // Remove +91 prefix if user types it, and remove any non-digit characters
    let cleanedText = text.replace(/^\+91/, '').replace(/[^\d]/g, '');
    
    // Limit to 10 digits
    if (cleanedText.length > 10) {
      cleanedText = cleanedText.substring(0, 10);
    }
    
    setMobile(cleanedText);
    
    if (cleanedText && !validateIndianMobile(cleanedText)) {
      setMobileError('Please enter a valid 10-digit mobile number');
    } else {
      setMobileError('');
    }
  };

  const handleRegister = async () => {
    console.log('🔐 Register button clicked');
    
    // Clear previous errors
    setNameError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setMobileError('');

    // Validate all fields
    let hasErrors = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasErrors = true;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
      hasErrors = true;
    }

    if (!username.trim()) {
      setUsernameError('Username is required');
      hasErrors = true;
    } else if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      hasErrors = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      hasErrors = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      hasErrors = true;
    }

    if (!mobile.trim()) {
      setMobileError('Mobile number is required');
      hasErrors = true;
    } else if (!validateIndianMobile(mobile)) {
      setMobileError('Please enter a valid 10-digit mobile number');
      hasErrors = true;
    }

    if (hasErrors) {
      showAlert('error', 'Validation Error', 'Please fix the errors above');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Starting registration process');
      
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        mobile: `+91${mobile.trim()}`,
      });
      
      showAlert('success', 'Registration Successful', 'Your account has been created successfully!');
      setTimeout(() => {
        router.replace('/welcome');
      }, 1500);
    } catch (error) {
      console.error('🔐 Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      showAlert('error', 'Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Google login button clicked');
      
      // For now, we'll use mock data. In a real app, you'd integrate with Google Sign-In
      const mockGoogleData = {
        provider: 'google',
        providerId: 'google_123456789',
        name: 'John Doe',
        email: 'john@gmail.com',
        profilePicture: 'https://example.com/avatar.jpg',
      };
      
      await googleLogin(mockGoogleData);
      showAlert('success', 'Login Successful', 'Welcome back!');
      setTimeout(() => {
        router.replace('/welcome');
      }, 1500);
    } catch (error) {
      console.error('🔐 Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Google login';
      showAlert('error', 'Google Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ModernAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Join ArchivArt</Text>
              <Text style={styles.welcomeSubtitle}>
                Create your account to start exploring amazing art
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ModernTextInput
                icon="person"
                placeholder="Full Name"
                value={name}
                onChangeText={handleNameChange}
                error={nameError}
                autoCapitalize="words"
              />
              
              <ModernTextInput
                icon="at"
                placeholder="Username"
                value={username}
                onChangeText={handleUsernameChange}
                error={usernameError}
                autoCapitalize="none"
              />
              
              <ModernTextInput
                icon="mail"
                placeholder="Email Address"
                value={email}
                onChangeText={handleEmailChange}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <ModernTextInput
                icon="call"
                placeholder="Mobile Number (e.g., 9876543210)"
                value={mobile}
                onChangeText={handleMobileChange}
                error={mobileError}
                keyboardType="phone-pad"
                prefix="+91"
              />
              
              <ModernTextInput
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                error={passwordError}
                secureTextEntry
              />

              {/* Register Button */}
              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#a8a8a8', '#888888'] : ['#667eea', '#764ba2']}
                  style={styles.registerButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.registerButtonText}>Creating Account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLinkButton}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.socialLoadingContainer}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh" size={20} color="#DB4437" />
                    </Animated.View>
                    <Text style={styles.socialButtonText}>Connecting...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  socialContainer: {
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
    marginLeft: 12,
  },
  socialLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


