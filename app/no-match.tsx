import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export default function NoMatchScreen() {
  const { width, height } = Dimensions.get('window');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#0F172A' : '#F8FAFC'} />
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/scanner')}
        >
          <Ionicons name="chevron-back" size={28} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>Scan Result</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Modern Illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={isDark ? ['#1E293B', '#334155'] : ['#E0F2FE', '#BAE6FD']}
            style={styles.illustrationBackground}
          >
            <View style={styles.scanIconContainer}>
              <Ionicons name="scan-outline" size={60} color={isDark ? '#3B82F6' : '#0284C7'} />
            </View>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search-outline" size={40} color={isDark ? '#EF4444' : '#DC2626'} />
            </View>
            <View style={styles.questionMarkContainer}>
              <Text style={[styles.questionMark, { color: isDark ? '#64748B' : '#94A3B8' }]}>?</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
            No Match Found
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            We couldn't find any matching media in our database. Don't worry, this happens sometimes!
          </Text>
          
          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
              Try these tips for better results:
            </Text>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                  <Ionicons name="sunny-outline" size={20} color={isDark ? '#F59E0B' : '#D97706'} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                    Good Lighting
                  </Text>
                  <Text style={[styles.tipDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Ensure your subject is well-lit and avoid shadows
                  </Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                  <Ionicons name="camera-outline" size={20} color={isDark ? '#3B82F6' : '#0284C7'} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                    Steady Focus
                  </Text>
                  <Text style={[styles.tipDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Hold your device steady and wait for auto-focus
                  </Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                  <Ionicons name="expand-outline" size={20} color={isDark ? '#10B981' : '#059669'} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                    Clear View
                  </Text>
                  <Text style={[styles.tipDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Make sure the object fills most of the frame
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => router.replace('/scanner')}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanAgainGradient}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            onPress={() => router.replace('/welcome')}
          >
            <Ionicons name="home-outline" size={20} color={isDark ? '#F1F5F9' : '#64748B'} />
            <Text style={[styles.homeButtonText, { color: isDark ? '#F1F5F9' : '#64748B' }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  
  // Modern Illustration Styles
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  illustrationBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scanIconContainer: {
    position: 'absolute',
    top: 30,
    left: 30,
  },
  searchIconContainer: {
    position: 'absolute',
    top: 60,
    right: 40,
  },
  questionMarkContainer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
  },
  questionMark: {
    fontSize: 32,
    fontWeight: '800',
  },
  
  // Text Content Styles
  textContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  
  // Tips Section Styles
  tipsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  
  // Action Button Styles
  actionContainer: {
    width: '100%',
    paddingBottom: 30,
    flexDirection: 'row',
    gap: 12,
  },
  scanAgainButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 6,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});


