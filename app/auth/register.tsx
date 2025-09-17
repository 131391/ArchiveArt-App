import { IconTextInput } from '@/components/ui/IconTextInput';
import { LinkButton } from '@/components/ui/LinkButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, googleLogin } = useAuth();

  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name,
        username,
        email,
        password,
        mobile: mobile || undefined,
      });
      router.replace('/welcome');
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // For now, we'll use mock data. In a real app, you'd integrate with Google Sign-In
      const mockGoogleData = {
        provider: 'google',
        providerId: 'google_123456789',
        name: 'John Doe',
        email: 'john@gmail.com',
        profilePicture: 'https://example.com/avatar.jpg',
      };
      
      await googleLogin(mockGoogleData);
      router.replace('/welcome');
    } catch (error) {
      Alert.alert('Google Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.form}>
        <IconTextInput icon="person" placeholder="Full Name" value={name} onChangeText={setName} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="at" placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="call" placeholder="Mobile (Optional)" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="lock-closed" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <View style={{ height: 16 }} />
        <PrimaryButton 
          title={isLoading ? "Creating Account..." : "Register"} 
          onPress={handleRegister}
          disabled={isLoading}
        />
        <View style={styles.row}>
          <Text style={{ color: '#687076' }}>Already have an account?</Text>
          <LinkButton title="Login" onPress={() => router.replace('/auth/login')} />
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


