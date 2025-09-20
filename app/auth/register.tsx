import { AutoDismissNotification } from '@/components/ui/AutoDismissNotification';
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
  
  // Notification state
  const [notification, setNotification] = useState({ 
    visible: false, 
    type: 'success' as 'success' | 'error', 
    title: '', 
    message: '' 
  });
  
  const { register, googleLogin } = useAuth();
  
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

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError('');
  };

  const handleUsernameChange = async (text: string) => {
    setUsername(text);
    setUsernameError('');
    setUsernameValidation(null);

    if (text.trim().length >= 3) {
      setIsCheckingUsername(true);
      try {
        const result = await checkUsernameAvailability(text.trim());
        setUsernameValidation(result);
        
        // Always show the message from the API response
        if (!result.available) {
          setUsernameError(result.message);
        }
      } catch (error) {
        // Handle username check error
        // Set a fallback error message if the API call fails
        setUsernameError('Unable to verify username availability. Please try again.');
      } finally {
        setIsCheckingUsername(false);
      }
    } else if (text.trim().length > 0 && text.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
    
    if (text.trim() && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handleMobileChange = (text: string) => {
    // Clean the input - remove all non-digit characters
    const cleanedText = text.replace(/\D/g, '');
    
    // Limit to 10 digits for Indian mobile numbers
    const limitedText = cleanedText.slice(0, 10);
    
    setMobile(limitedText);
    setMobileError('');
    
    if (limitedText.length > 0 && !validateIndianMobile(limitedText)) {
      setMobileError('Please enter a valid 10-digit mobile number');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    
    // Check password requirements
    const validation = validatePasswordDetailed(text);
    setPasswordRequirements(validation.requirements);
    
    if (text.length > 0 && !validation.isValid) {
      const basicValidation = validatePassword(text);
      if (!basicValidation.isValid) {
        setPasswordError(basicValidation.errors[0]);
      }
    }
  };

  const handleRegister = async () => {
    
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
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setPasswordError(validation.errors[0]);
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
      return;
    }

    setIsLoading(true);
    hideNotification();
    
    try {
      // Prepare mobile number with +91 prefix
      const mobileWithCountryCode = `+91${mobile}`;
      
      const error = await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        mobile: mobileWithCountryCode,
      });
      
      if (error) {
        // Handle registration error
        showNotification('Registration Failed', error.message, 'error');
      } else {
        showNotification('Registration Successful', 'Account created successfully! Welcome to ArchivART!', 'success');
        setTimeout(() => {
          router.replace('/welcome');
        }, 2000);
      }
    } catch (err) {
      // Handle unexpected registration error
      showNotification('Registration Failed', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    hideNotification();
    
    try {
      
      const error = await googleLogin();
      
      if (error) {
        // Handle Google login error
        
        if (error.message.includes('cancelled')) {
          return;
        } else if (error.message.includes('Google Sign-In is not available')) {
          showNotification('Google Sign-In Not Available', 'Google Sign-In is not available in Expo Go. Please use a development build or production build to test Google authentication.', 'error');
        } else {
          showNotification('Google Login Failed', error.message, 'error');
        }
      } else {
        showNotification('Login Successful', 'Welcome to ArchivART!', 'success');
        setTimeout(() => {
          router.replace('/welcome');
        }, 2000);
      }
    } catch (error) {
      // Handle unexpected Google login error
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during Google login';
      showNotification('Login Failed', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text style={styles.welcomeText}>Sign Up</Text>
              <Text style={styles.subtitleText}>Join ArchivART</Text>
              <Text style={styles.descriptionText}>Create your account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ModernTextInput
                icon="person"
                placeholder="Full Name"
                value={name}
                onChangeText={handleNameChange}
                error={nameError}
              />
              
              <ModernTextInput
                icon="at"
                placeholder="Username"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                error={usernameError}
              />
              
              {/* Username validation status */}
              {isCheckingUsername && (
                <View style={styles.usernameChecking}>
                  <Text style={styles.checkingText}>Checking username availability...</Text>
                </View>
              )}
              
              {usernameValidation && usernameValidation.available && !isCheckingUsername && (
                <View style={styles.usernameAvailable}>
                  <Text style={styles.availableText}>✓ Username is available</Text>
                </View>
              )}

              {/* Username Suggestions - positioned right after username input */}
              {usernameValidation && !usernameValidation.available && usernameValidation.suggestions && usernameValidation.suggestions.length > 0 && (
                <View style={styles.usernameSuggestions}>
                  <Text style={styles.suggestionsTitle}>💡 Suggested usernames:</Text>
                  <View style={styles.suggestionsContainer}>
                    {usernameValidation?.suggestions?.slice(0, 3).map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setUsername(suggestion);
                          setUsernameError('');
                          setUsernameValidation(null);
                          // Trigger validation for the new username
                          handleUsernameChange(suggestion);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
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
                icon="call"
                placeholder="Phone Number"
                value={mobile}
                onChangeText={handleMobileChange}
                keyboardType="phone-pad"
                prefix="+91"
                error={mobileError}
              />
              
              <ModernTextInput
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                error={passwordError}
              />

              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.minLength ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.minLength ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.minLength ? "#10B981" : "#EF4444" }]}>
                      Minimum 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasUppercase ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasUppercase ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.hasUppercase ? "#10B981" : "#EF4444" }]}>
                      At least 1 uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasLowercase ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasLowercase ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.hasLowercase ? "#10B981" : "#EF4444" }]}>
                      At least 1 lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasNumber ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasNumber ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.hasNumber ? "#10B981" : "#EF4444" }]}>
                      At least 1 number
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.hasSpecialChar ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.hasSpecialChar ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.hasSpecialChar ? "#10B981" : "#EF4444" }]}>
                      At least 1 special character (@$!%*?&)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={passwordRequirements.notCommon ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={passwordRequirements.notCommon ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.requirementText, { color: passwordRequirements.notCommon ? "#10B981" : "#EF4444" }]}>
                      Not a common password
                    </Text>
                  </View>
                </View>
              )}


              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#8B5CF6']}
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

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.signInLink}>Log In</Text>
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
    paddingHorizontal: 28, // Further increase horizontal padding to prevent border cutoff
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
    paddingHorizontal: 4, // Add padding to form container to prevent border cutoff
  },
  passwordRequirements: {
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  usernameSuggestions: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  usernameChecking: {
    marginTop: 8,
    marginBottom: 8,
  },
  checkingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontStyle: 'italic',
  },
  usernameAvailable: {
    marginTop: 8,
    marginBottom: 8,
  },
  availableText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signInLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});
