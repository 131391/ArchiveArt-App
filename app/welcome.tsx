import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, isLoading, user } = useAuth();

  // No automatic redirect - show profile when authenticated, login when not
  useEffect(() => {
    console.log('🏠 Welcome screen - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user?.name);
  }, [isAuthenticated, isLoading, user]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B', '#334155'] : ['#F8FAFC', '#E2E8F0', '#CBD5E1']}
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={isDark ? '#3B82F6' : '#2563EB'} />
        <Text style={[styles.loadingText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
          Loading...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ['#0F172A', '#1E293B', '#334155'] : ['#F8FAFC', '#E2E8F0', '#CBD5E1']}
      style={styles.container}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('@/assets/images/ALogo.png')} style={styles.brandLogo} />
          </View>
          <Text style={[styles.brandText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>ArchivArt</Text>
        </View>
        <Text style={[styles.tagline, { color: isDark ? '#94A3B8' : '#64748B' }]}>AI-Powered Media Discovery</Text>
        
        {/* Profile Button in Top Right */}
        {isAuthenticated && (
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={[styles.profileTopButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
          >
            <Ionicons name="person-circle-outline" size={24} color={isDark ? '#3B82F6' : '#2563EB'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
            <Ionicons name="scan" size={60} color={isDark ? '#3B82F6' : '#2563EB'} />
          </View>
          <Text style={[styles.title, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
            {isAuthenticated ? 'Welcome Back!' : 'Discover Hidden'}
          </Text>
          <Text style={[styles.titleAccent, { color: isDark ? '#3B82F6' : '#2563EB' }]}>
            {isAuthenticated ? 'Ready to Scan?' : 'Media Treasures'}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {isAuthenticated 
              ? 'Continue your journey of discovering amazing media content with AI-powered scanning technology.'
              : 'Point your camera at any image and instantly discover related videos, audio, and multimedia content using advanced AI technology.'
            }
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="flash" size={24} color={isDark ? '#3B82F6' : '#2563EB'} />
            </View>
            <Text style={[styles.featureText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Instant Recognition</Text>
          </View>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="musical-notes" size={24} color={isDark ? '#3B82F6' : '#2563EB'} />
            </View>
            <Text style={[styles.featureText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Rich Media</Text>
          </View>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="shield-checkmark" size={24} color={isDark ? '#3B82F6' : '#2563EB'} />
            </View>
            <Text style={[styles.featureText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Secure & Private</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isAuthenticated ? (
          // Authenticated User - Only Start Scanning Button
          <PrimaryButton 
            title="Start Scanning" 
            onPress={() => router.push('/scanner')}
            style={styles.primaryButton}
          />
        ) : (
          // Non-authenticated User Actions - Only Sign In Button
          <PrimaryButton 
            title="Sign In / Create Account" 
            onPress={() => router.push('/auth/login')} 
            style={styles.primaryButton}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#3B82F6',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#8B5CF6',
    bottom: 200,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#06B6D4',
    top: height * 0.3,
    right: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileTopButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  titleAccent: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});


