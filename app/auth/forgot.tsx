import { IconTextInput } from '@/components/ui/IconTextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/ALogo.png')} style={{ width: 80, height: 80 }} />
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
      </View>
      <IconTextInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <View style={{ height: 12 }} />
      <PrimaryButton title="Send Reset Link" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    color: '#687076',
    marginTop: 6,
    textAlign: 'center',
  },
});


