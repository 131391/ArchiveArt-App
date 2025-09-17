import { ErrorToaster } from '@/components/ui/ErrorToaster';
import { IconTextInput } from '@/components/ui/IconTextInput';
import { LinkButton } from '@/components/ui/LinkButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SuccessToaster } from '@/components/ui/SuccessToaster';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorToaster, setErrorToaster] = useState({ visible: false, message: '' });
  const [successToaster, setSuccessToaster] = useState({ visible: false, message: '' });
  const { login, googleLogin } = useAuth();

  const showError = (message: string) => {
    setErrorToaster({ visible: true, message });
  };

  const hideError = () => {
    setErrorToaster({ visible: false, message: '' });
  };

  const showSuccess = (message: string) => {
    setSuccessToaster({ visible: true, message });
  };

  const hideSuccess = () => {
    setSuccessToaster({ visible: false, message: '' });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please fill in all fields to continue');
      return;
    }

    setIsLoading(true);
    
    const error = await login({ email, password });
    
    if (error) {
      const errorMessage = error.message;
      showError(errorMessage.includes('Invalid credentials') ? 
        'Invalid email or password. Please check your credentials and try again.' : 
        errorMessage
      );
    } else {
      router.replace('/welcome');
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // For now, we'll use mock data. In a real app, you'd integrate with Google Sign-In
    const mockGoogleData = {
      provider: 'google',
      providerId: 'google_123456789',
      name: 'John Doe',
      email: 'john@gmail.com',
      profilePicture: 'https://example.com/avatar.jpg',
    };
    
    const error = await googleLogin(mockGoogleData);
    
    if (error) {
      const errorMessage = error.message;
      showError(`Google login failed: ${errorMessage}`);
    } else {
      router.replace('/welcome');
    }
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <ErrorToaster
        visible={errorToaster.visible}
        message={errorToaster.message}
        onClose={hideError}
        type="error"
      />
      
      <SuccessToaster
        visible={successToaster.visible}
        message={successToaster.message}
        onClose={hideSuccess}
      />
      
      <Text style={styles.title}>Login</Text>
      <View style={styles.form}>
        <IconTextInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="lock-closed" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <View style={{ height: 16 }} />
        <PrimaryButton 
          title={isLoading ? "Logging in..." : "Login"} 
          onPress={handleLogin}
          disabled={isLoading}
        />
        <View style={styles.row}>
          <LinkButton title="Forgot Password?" onPress={() => router.push('/auth/forgot')} />
          <LinkButton title="Sign Up" onPress={() => router.push('/auth/register')} />
        </View>
      </View>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        {/* Google Login Button */}
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </View>
          <Text style={styles.googleButtonText}>
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>
        
        <View style={{ height: 12 }} />
        
        {/* Facebook Login Button */}
        <TouchableOpacity 
          style={styles.facebookButton}
          onPress={() => {}}
          disabled={isLoading}
        >
          <View style={styles.facebookIconContainer}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </View>
          <Text style={styles.facebookButtonText}>
            Continue with Facebook
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 24,
  },
  form: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E3E6',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#687076',
    fontWeight: '700',
  },
  socialRow: {},
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
    flex: 1,
    textAlign: 'center',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  facebookIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
});


