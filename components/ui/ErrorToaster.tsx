import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorToasterProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'success';
  duration?: number;
}

export function ErrorToaster({ 
  visible, 
  message, 
  onClose, 
  type = 'error',
  duration = 4000 
}: ErrorToasterProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

      // Pulse animation for the icon
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToaster();
      }, duration);

      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
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

  if (!visible) {
    return null;
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          colors: ['#EF4444', '#DC2626', '#B91C1C'],
          icon: 'close-circle',
          bgGradient: ['#FEF2F2', '#FEE2E2'],
          borderColor: '#FECACA',
          textColor: '#991B1B',
          titleColor: '#DC2626',
        };
      case 'warning':
        return {
          colors: ['#F59E0B', '#D97706', '#B45309'],
          icon: 'warning',
          bgGradient: ['#FFFBEB', '#FEF3C7'],
          borderColor: '#FED7AA',
          textColor: '#92400E',
          titleColor: '#D97706',
        };
      case 'success':
        return {
          colors: ['#10B981', '#059669', '#047857'],
          icon: 'checkmark-circle',
          bgGradient: ['#F0FDF4', '#DCFCE7'],
          borderColor: '#BBF7D0',
          textColor: '#065F46',
          titleColor: '#059669',
        };
      default:
        return {
          colors: ['#EF4444', '#DC2626', '#B91C1C'],
          icon: 'close-circle',
          bgGradient: ['#FEF2F2', '#FEE2E2'],
          borderColor: '#FECACA',
          textColor: '#991B1B',
          titleColor: '#DC2626',
        };
    }
  };

  const config = getTypeConfig();

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
        colors={config.bgGradient}
        style={[styles.toaster, { borderColor: config.borderColor }]}
      >
        {/* Icon with pulse animation */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={config.colors}
            style={styles.iconGradient}
          >
            <Ionicons name={config.icon as any} size={28} color="#fff" />
          </LinearGradient>
        </Animated.View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: config.titleColor }]}>
            {type === 'error' ? 'Authentication Failed' : 
             type === 'warning' ? 'Warning' : 'Success'}
          </Text>
          <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity onPress={hideToaster} style={styles.closeButton}>
          <View style={[styles.closeButtonBg, { backgroundColor: config.borderColor }]}>
            <Ionicons name="close" size={16} color={config.textColor} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
      
      {/* Shadow effect */}
      <View style={[styles.shadow, { backgroundColor: config.colors[0] + '20' }]} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
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
    opacity: 0.3,
    zIndex: -1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});