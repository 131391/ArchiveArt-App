import { LinkButton } from '@/components/ui/LinkButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b1020' : '#ffffff' }]}> 
      <View style={styles.headerRow}>
        <Image source={require('@/assets/images/logo.jpeg')} style={styles.brandLogo} />
        <Text style={[styles.brandText, { color: isDark ? '#E7E9EE' : '#101418' }]}>ArchivArt</Text>
      </View>

      <View style={styles.content}> 
        <Image source={require('@/assets/images/welcome-banner.png')} style={[styles.bannerImage, isDark && styles.bannerImageDark]} resizeMode="cover" />
        <Text style={[styles.title, { color: isDark ? '#F3F5F7' : '#0F1720' }]}>Scan & Discover</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9BA4AE' : '#6B7280' }]}>Instant Media</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Get Started" onPress={() => router.push('/scanner')} />
        <LinkButton title="Login / Sign Up" onPress={() => router.push('/auth/login')} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    marginTop: 18,
  },
  bannerImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 28,
  },
  bannerImageDark: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginBottom: 28,
  },
});


