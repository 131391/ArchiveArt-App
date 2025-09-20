import { WarningModal } from '@/components/ui/WarningModal';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarProps, getInitialsBackgroundColor } from '@/utils/avatarUtils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Get avatar props using utility function
  const avatarProps = user ? getAvatarProps(user) : null;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {avatarProps?.hasProfilePicture && !imageLoadError ? (
                <Image 
                  source={{ uri: avatarProps.profilePictureUrl! }}
                  style={styles.profileImage}
                  onError={() => {
                    console.log('Profile image failed to load, showing initials');
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <View style={[
                  styles.avatarGradient,
                  { backgroundColor: getInitialsBackgroundColor(user?.id || 0) }
                ]}>
                  <Text style={styles.avatarInitials}>
                    {avatarProps?.initials || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.userName}>
              {user?.name || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="scan" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>125</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="time" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="heart" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          {/* Settings & More */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings & More</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => router.push('/profile-update')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => router.push('/scanner')}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
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
});
