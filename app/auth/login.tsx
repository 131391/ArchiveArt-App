import { IconTextInput } from '@/components/ui/IconTextInput';
import { LinkButton } from '@/components/ui/LinkButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
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
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Google Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        <PrimaryButton 
          title={isLoading ? "Connecting..." : "Continue with Google"} 
          onPress={handleGoogleLogin}
          disabled={isLoading}
        />
        <View style={{ height: 12 }} />
        <PrimaryButton title="Continue with Facebook" onPress={() => {}} />
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
});


