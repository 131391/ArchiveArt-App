import { ModernAlert } from '@/components/ui/ModernAlert';
import { ModernTextInput } from '@/components/ui/ModernTextInput';
import { checkUsernameAvailability, UsernameCheckResponse, validateEmail, validateIndianMobile, validatePassword, validatePasswordDetailed } from '@/constants/Api';
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
  
  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    notCommon: false,
  });
  
  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState<UsernameCheckResponse | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
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

  const handleUsernameChange = async (text: string) => {
    setUsername(text);
    setUsernameValidation(null);
    
    // Basic validation first
    if (text.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(text)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    // Clear basic errors
    setUsernameError('');
    
    // Check username availability with API (debounced)
    if (text.trim().length >= 3) {
      setIsCheckingUsername(true);
      try {
        const validation = await checkUsernameAvailability(text.trim());
        console.log('🔐 Username validation result:', validation);
        setUsernameValidation(validation);
        
        if (!validation.available) {
          setUsernameError(validation.message);
        } else {
          setUsernameError('');
        }
      } catch (error) {
        console.error('🔐 Username validation error:', error);
        setUsernameError('Failed to check username availability');
      } finally {
        setIsCheckingUsername(false);
      }
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
    
    if (text) {
      const validation = validatePasswordDetailed(text);
      setPasswordRequirements(validation.requirements);
      
      if (!validation.isValid) {
        const passwordValidation = validatePassword(text);
        setPasswordError(passwordValidation.errors.join(', '));
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        notCommon: false,
      });
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
    } else if (usernameValidation && !usernameValidation.available) {
      setUsernameError(usernameValidation.message);
      hasErrors = true;
    } else if (isCheckingUsername) {
      setUsernameError('Please wait while we check username availability');
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
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.errors.join(', '));
        hasErrors = true;
      }
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
      
      const error = await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        mobile: `+91${mobile.trim()}`,
      }) as Error | null;
      
      console.log('🔐 Registration page received error:', error);
      console.log('🔐 Registration page error is truthy:', !!error);
      
      if (error) {
        // Registration failed with error
        console.error('🔐 Registration error:', error);
        console.error('🔐 Registration error type:', typeof error);
        console.error('🔐 Registration error message:', error.message);
        showAlert('error', 'Registration Failed', error.message);
      } else {
        // Registration successful
        showAlert('success', 'Registration Successful', 'Your account has been created successfully!');
        // Only navigate to welcome page on successful registration
        setTimeout(() => {
      router.replace('/welcome');
        }, 1500);
      }
    } catch (error) {
      console.error('🔐 Unexpected registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during registration';
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
      
      const error = await googleLogin(mockGoogleData) as Error | null;
      
      if (error) {
        // Google login failed with error
        console.error('🔐 Google login error:', error);
        showAlert('error', 'Google Login Failed', error.message);
      } else {
        // Google login successful
        showAlert('success', 'Login Successful', 'Welcome back!');
        setTimeout(() => {
      router.replace('/welcome');
        }, 1500);
      }
    } catch (error) {
      console.error('🔐 Unexpected Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during Google login';
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
        message={alert.title ? `${alert.title}\n\n${alert.message}` : alert.message}
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
                error={username && username.trim().length >= 3 ? '' : usernameError}
                autoCapitalize="none"
              />
              
              {/* Username Validation and Suggestions */}
              {username && username.trim().length >= 3 && (() => {
                console.log('🔐 Rendering username validation:', usernameValidation);
                return (
                <View style={styles.usernameValidationContainer}>
                  {isCheckingUsername ? (
                    <View style={styles.usernameCheckingContainer}>
                      <Ionicons name="hourglass" size={16} color="#FFA500" />
                      <Text style={styles.usernameCheckingText}>Checking availability...</Text>
                    </View>
                  ) : usernameValidation ? (
                    <View>
                      <View style={styles.usernameStatusContainer}>
                        <Ionicons 
                          name={usernameValidation.available ? "checkmark-circle" : "close-circle"} 
                          size={16} 
                          color={usernameValidation.available ? "#4CAF50" : "#F44336"} 
                        />
                        <Text style={[
                          styles.usernameStatusText,
                          { color: usernameValidation.available ? "#4CAF50" : "#F44336" }
                        ]}>
                          {usernameValidation.message}
                        </Text>
                      </View>
                      
                      {/* Username Suggestions */}
                      {!usernameValidation.available && usernameValidation.suggestions && usernameValidation.suggestions.length > 0 && (
                        <View style={styles.usernameSuggestionsContainer}>
                          <Text style={styles.usernameSuggestionsTitle}>Suggested usernames:</Text>
                          <View style={styles.usernameSuggestionsList}>
                            {usernameValidation.suggestions.map((suggestion, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.usernameSuggestionItem}
                                onPress={() => {
                                  setUsername(suggestion);
                                  handleUsernameChange(suggestion);
                                }}
                              >
                                <Text style={styles.usernameSuggestionText}>{suggestion}</Text>
                                <Ionicons name="arrow-forward" size={14} color="#667eea" />
                              </TouchableOpacity>
                            ))}
        </View>
      </View>
                      )}
                    </View>
                  ) : null}
                </View>
                );
              })()}
              
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
                placeholder="Mobile Number"
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
              
              {/* Password Requirements */}
              {password && (
                <View style={styles.passwordRequirementsContainer}>
                  <Text style={styles.passwordRequirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.minLength ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.minLength ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.minLength ? "#4CAF50" : "#F44336" }
                    ]}>
                      Minimum 8 characters ({password.length >= 8 ? "✅" : "❌"} "{password}" has {password.length})
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasUppercase ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasUppercase ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasUppercase ? "#4CAF50" : "#F44336" }
                    ]}>
                      At least 1 uppercase letter ({passwordRequirements.hasUppercase ? "✅" : "❌"} missing)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasLowercase ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasLowercase ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasLowercase ? "#4CAF50" : "#F44336" }
                    ]}>
                      At least 1 lowercase letter ({passwordRequirements.hasLowercase ? "✅" : "❌"} has lowercase)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasNumber ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasNumber ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasNumber ? "#4CAF50" : "#F44336" }
                    ]}>
                      At least 1 number ({passwordRequirements.hasNumber ? "✅" : "❌"} missing)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasSpecialChar ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasSpecialChar ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasSpecialChar ? "#4CAF50" : "#F44336" }
                    ]}>
                      At least 1 special character from @$!%*?& ({passwordRequirements.hasSpecialChar ? "✅" : "❌"} missing)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.notCommon ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.notCommon ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.notCommon ? "#4CAF50" : "#F44336" }
                    ]}>
                      Not a common password ({passwordRequirements.notCommon ? "✅" : "❌"} "{password}" is blocked)
                    </Text>
                  </View>
      </View>
              )}

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
  passwordRequirementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  usernameValidationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  usernameCheckingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameCheckingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFA500',
    marginLeft: 8,
  },
  usernameStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usernameStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  usernameSuggestionsContainer: {
    marginTop: 8,
  },
  usernameSuggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  usernameSuggestionsList: {
    gap: 6,
  },
  usernameSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  usernameSuggestionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});


