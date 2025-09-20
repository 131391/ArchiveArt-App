import { getProfileImageUrl } from '@/constants/Api';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarProps } from '@/utils/avatarUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, isLoading, user } = useAuth();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Get avatar props using utility function
  const avatarProps = user ? getAvatarProps(user) : null;

  // No automatic redirect - show profile when authenticated, login when not

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
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Profile Image for Authenticated Users */}
          {isAuthenticated && avatarProps && (
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                {avatarProps.hasProfilePicture && !imageLoadError ? (
                  <Image 
                    source={{ uri: getProfileImageUrl(avatarProps.profilePictureUrl!) || '' }}
                    style={styles.profileImage}
                    onError={() => {
                      setImageLoadError(true);
                    }}
                  />
                ) : (
                  <Image 
                    source={avatarProps.defaultAvatarUrl}
                    style={styles.profileImage}
                  />
                )}
                <View style={styles.profileImageBorder} />
              </View>
            </View>
          )}
          
          <Text style={styles.title}>
            {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Unlock New Worlds'}
          </Text>
          <Text style={styles.titleAccent}>
            {isAuthenticated ? 'Ready to explore new realities?' : 'with ArchivART'}
          </Text>
          
          {/* AR Illustration */}
          <View style={styles.arIllustration}>
            <View style={styles.handContainer}>
              <View style={styles.hand} />
              <View style={styles.phone}>
                <View style={styles.phoneScreen}>
                  <View style={styles.arStructure}>
                    <View style={[styles.cube, styles.cube1]} />
                    <View style={[styles.cube, styles.cube2]} />
                    <View style={[styles.cube, styles.cube3]} />
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.floatingCube, styles.floatingCube1]} />
            <View style={[styles.floatingCube, styles.floatingCube2]} />
            <View style={[styles.floatingCube, styles.floatingCube3]} />
          </View>

                 <Text style={styles.subtitle}>
                   {isAuthenticated
                     ? 'Continue your journey of discovering amazing art content with AI-powered scanning technology.'
                     : 'Step into a new dimension where digital art blends seamlessly in your surroundings.'
                   }
                 </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isAuthenticated ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/scanner')}
            >
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.buttonGradient}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.buttonText}>Start AR Experience</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/auth/login')}
            >
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {!isAuthenticated && (
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Button */}
        {isAuthenticated && (
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  profileImageContainer: {
    marginBottom: 12,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  profileImageBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 8,
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#3B82F6',
    marginBottom: 40,
  },
  arIllustration: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  handContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hand: {
    width: 60,
    height: 80,
    backgroundColor: '#8B5CF6',
    borderRadius: 30,
    position: 'absolute',
    zIndex: 1,
  },
  phone: {
    width: 80,
    height: 120,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    zIndex: 2,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arStructure: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cube: {
    position: 'absolute',
  },
  cube1: {
    width: 20,
    height: 20,
    backgroundColor: '#3B82F6',
    top: 10,
  },
  cube2: {
    width: 16,
    height: 16,
    backgroundColor: '#8B5CF6',
    top: 20,
    left: 10,
  },
  cube3: {
    width: 12,
    height: 12,
    backgroundColor: '#F59E0B',
    top: 30,
    right: 5,
  },
  floatingCube: {
    position: 'absolute',
    borderRadius: 4,
  },
  floatingCube1: {
    width: 12,
    height: 12,
    backgroundColor: '#3B82F6',
    top: 20,
    right: 20,
  },
  floatingCube2: {
    width: 8,
    height: 8,
    backgroundColor: '#8B5CF6',
    bottom: 40,
    left: 10,
  },
  floatingCube3: {
    width: 10,
    height: 10,
    backgroundColor: '#F59E0B',
    top: 60,
    left: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
});


