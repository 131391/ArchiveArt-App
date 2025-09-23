import { AuthGuard } from '@/components/AuthGuard';
import { WarningModal } from '@/components/ui/WarningModal';
import { getProfileImageUrl } from '@/constants/Api';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarProps } from '@/utils/avatarUtils';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Refresh user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(error => {
      });
    }, [refreshUser])
  );
  // Get avatar props using utility function
  const avatarProps = user ? getAvatarProps(user) : null;

  // Show loading if user data is not available yet
  if (!user) {
    return (
      <AuthGuard>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      // Handle logout error silently
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#3B82F6" />
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.profileImageWrapper}>
                {avatarProps?.hasProfilePicture && !imageLoadError ? (
                  <Image 
                    source={{ uri: getProfileImageUrl(avatarProps.profilePictureUrl!) || '' }}
                    style={styles.profileImage}
                    onError={() => {
                      setImageLoadError(true);
                    }}
                  />
                ) : (
                  <Image 
                    source={avatarProps?.defaultAvatarUrl}
                    style={styles.profileImage}
                  />
                )}
                <View style={styles.profileImageBorder} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>
                {user?.name || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </Text>
              
              {/* Edit Profile Button */}
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => router.push('/profile-update')}
              >
                <Ionicons name="create-outline" size={16} color="#3B82F6" />
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="scan" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="time" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="heart" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          {/* Settings & More */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings & More</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                Alert.alert('Coming Soon', 'App Settings feature will be available soon!');
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="settings" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>App Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                Alert.alert('Coming Soon', 'Help & Support feature will be available soon!');
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="help-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <WarningModal
        visible={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to enter your credentials next time."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="warning"
      />
    </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    zIndex: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  floatingEditButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
});
