import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SuccessToasterProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessToaster({ 
  visible, 
  message, 
  onClose, 
  duration = 3000 
}: SuccessToasterProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation with spring effect
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate checkmark
      setTimeout(() => {
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Sparkle animation
      const sparkleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      sparkleAnimation.start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToaster();
      }, duration);

      return () => {
        clearTimeout(timer);
        sparkleAnimation.stop();
      };
    } else {
      hideToaster();
    }
  }, [visible]);

  const hideToaster = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
        }
      ]}
    >
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7', '#BBF7D0']}
        style={styles.toaster}
      >
        {/* Success icon with animation */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={styles.iconGradient}
          >
            <Animated.View
              style={{
                transform: [{ scale: checkmarkAnim }]
              }}
            >
              <Ionicons name="checkmark" size={32} color="#fff" />
            </Animated.View>
          </LinearGradient>
          
          {/* Sparkle effects */}
          <Animated.View
            style={[
              styles.sparkle,
              styles.sparkle1,
              {
                opacity: sparkleAnim,
                transform: [
                  { scale: sparkleAnim },
                  { rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}
                ]
              }
            ]}
          >
            <Ionicons name="sparkles" size={16} color="#10B981" />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.sparkle,
              styles.sparkle2,
              {
                opacity: sparkleAnim,
                transform: [
                  { scale: sparkleAnim },
                  { rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['360deg', '0deg']
                  })}
                ]
              }
            ]}
          >
            <Ionicons name="sparkles" size={12} color="#059669" />
          </Animated.View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity onPress={hideToaster} style={styles.closeButton}>
          <View style={styles.closeButtonBg}>
            <Ionicons name="close" size={16} color="#065F46" />
          </View>
        </TouchableOpacity>
      </LinearGradient>
      
      {/* Shadow effect */}
      <View style={styles.shadow} />
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toaster: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  shadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: -8,
    borderRadius: 20,
    backgroundColor: '#10B98120',
    opacity: 0.3,
    zIndex: -1,
  },
  iconContainer: {
    marginRight: 16,
    position: 'relative',
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -8,
    right: -8,
  },
  sparkle2: {
    bottom: -6,
    left: -6,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: '#047857',
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  closeButton: {
    marginLeft: 12,
  },
  closeButtonBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});
