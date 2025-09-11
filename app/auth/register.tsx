import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';
import { IconTextInput } from '@/components/ui/IconTextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LinkButton } from '@/components/ui/LinkButton';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.form}>
        <IconTextInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={{ height: 12 }} />
        <IconTextInput icon="lock-closed" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <View style={{ height: 16 }} />
        <PrimaryButton title="Register" onPress={() => router.replace('/(tabs)')} />
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
        <PrimaryButton title="Continue with Google" onPress={() => {}} />
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


