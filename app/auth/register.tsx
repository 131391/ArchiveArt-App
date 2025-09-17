import { IconTextInput } from '@/components/ui/IconTextInput';
import { LinkButton } from '@/components/ui/LinkButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

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
      router.replace('/(tabs)');
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
      router.replace('/(tabs)');
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


