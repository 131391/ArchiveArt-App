import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LoginSuccessModalProps {
  visible: boolean;
  onContinue: () => void;
}

export function LoginSuccessModal({
  visible,
  onContinue
}: LoginSuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      iconScaleAnim.setValue(0);

      Animated.sequence([
        // First animate the overlay
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Then animate the modal with staggered animations
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(iconScaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 6,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(iconScaleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onContinue}
      statusBarTranslucent
    >
      <Pressable 
        style={styles.overlay}
        onPress={onContinue}
      >
        <Animated.View 
          style={[
            styles.overlayContent,
            { opacity: opacityAnim }
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.modal,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                  ]
                }
              ]}
            >
              {/* Content */}
              <View style={styles.content}>
                {/* Green Success Icon */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: iconScaleAnim }] }
                  ]}
                >
                  <View style={styles.greenIcon}>
                    <Ionicons name="checkmark" size={32} color="#fff" />
                  </View>
                </Animated.View>

                {/* Title */}
                <Text style={styles.title}>Login Successful</Text>

                {/* Message */}
                <Text style={styles.message}>Welcome back! You are now logged in.</Text>

                {/* Continue Button */}
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={onContinue}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6']}
                    style={styles.continueButtonGradient}
                  >
                    <Text style={styles.continueButtonText}>Continue to App</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: width - 40,
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  greenIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
