import { WarningModal } from '@/components/ui/WarningModal';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const profileOptions = [
    {
      id: 'scanner',
      title: 'Start Scanning',
      subtitle: 'Scan images to discover media',
      icon: 'scan',
      onPress: () => router.push('/scanner'),
      color: '#3B82F6',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and configuration',
      icon: 'settings-outline',
      onPress: () => {
        // TODO: Implement settings screen
        Alert.alert('Coming Soon', 'Settings feature will be available soon!');
      },
      color: '#10B981',
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => {
        // TODO: Implement help screen
        Alert.alert('Coming Soon', 'Help & Support feature will be available soon!');
      },
      color: '#F59E0B',
    },
  ];

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
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#F1F5F9' : '#0F172A'} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={[styles.editButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
          <Ionicons name="create-outline" size={20} color={isDark ? '#3B82F6' : '#2563EB'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Profile Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.pageTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
            Profile
          </Text>
          
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
              style={styles.profileImageGradient}
            >
              <Ionicons name="person" size={50} color="#fff" />
            </LinearGradient>
            <View style={[styles.onlineIndicator, { backgroundColor: '#10B981' }]} />
          </View>
          
          <Text style={[styles.userName, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
            {user?.name || 'John Smith'}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {user?.email || 'john.smith@example.com'}
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.statusText}>Verified Account</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.statIconGradient}
            >
              <Ionicons name="scan" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Scans</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statIconGradient}
            >
              <Ionicons name="time" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Hours</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.statIconGradient}
            >
              <Ionicons name="star" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Favorites</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              onPress={() => router.push('/scanner')}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="scan" size={28} color="#fff" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                Scan
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              onPress={() => Alert.alert('Coming Soon', 'History feature will be available soon!')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="time" size={28} color="#fff" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                History
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              onPress={() => Alert.alert('Coming Soon', 'Favorites feature will be available soon!')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="heart" size={28} color="#fff" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                Favorites
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              onPress={() => Alert.alert('Coming Soon', 'Share feature will be available soon!')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="share" size={28} color="#fff" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
            Settings & More
          </Text>
          
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              onPress={option.onPress}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  {option.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
        >
          <View style={[styles.logoutIcon, { backgroundColor: '#EF4444' + '20' }]}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </View>
          <View style={styles.logoutContent}>
            <Text style={[styles.logoutTitle, { color: '#EF4444' }]}>
              Logout
            </Text>
            <Text style={[styles.logoutSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Sign out of your account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <WarningModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="warning"
      />
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#10B981',
    bottom: 200,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B',
    top: height * 0.3,
    right: -50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
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
  headerSpacer: {
    flex: 1,
  },
  editButton: {
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoutContent: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  logoutSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});