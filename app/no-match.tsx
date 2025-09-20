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
} from 'react-native';

export default function NoMatchScreen() {
  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/scanner')}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <View style={styles.cubeIcon}>
              <View style={styles.cubeFace} />
            </View>
            <View style={styles.xIcon}>
              <View style={styles.xLine1} />
              <View style={styles.xLine2} />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>No Match Found</Text>
          <Text style={styles.subtitle}>
            We couldn't find any matching media for your scan. This could be because:
          </Text>
          
          <View style={styles.reasonsList}>
            <View style={styles.reasonItem}>
              <Ionicons name="camera-outline" size={20} color="#666666" />
              <Text style={styles.reasonText}>Low light or blur</Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="search-outline" size={20} color="#666666" />
              <Text style={styles.reasonText}>Object not recognized</Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="wifi-outline" size={20} color="#666666" />
              <Text style={styles.reasonText}>No internet connection</Text>
            </View>
          </View>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationDot} />
          <View style={[styles.paginationDot, styles.paginationDotInactive]} />
          <View style={[styles.paginationDot, styles.paginationDotInactive]} />
          <View style={[styles.paginationDot, styles.paginationDotInactive]} />
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => router.replace('/scanner')}
          >
            <LinearGradient
              colors={['#4A90E2', '#7B68EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanAgainGradient}
            >
              <Text style={styles.scanAgainText}>Scan Again</Text>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cubeIcon: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  cubeFace: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#4A90E2',
    opacity: 0.8,
    borderRadius: 6,
    top: 5,
    left: 5,
  },
  xIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: 35,
    height: 4,
    backgroundColor: '#FF4444',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 35,
    height: 4,
    backgroundColor: '#FF4444',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  reasonsList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginHorizontal: 3,
  },
  paginationDotInactive: {
    backgroundColor: '#D1D5DB',
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scanAgainButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 20,
  },
  scanAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.3,
  },
});


