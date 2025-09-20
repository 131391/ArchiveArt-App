import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface AutoDismissNotificationProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function AutoDismissNotification({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onDismiss
}: AutoDismissNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
      iconScaleAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
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
      ]).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        dismissNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: '#10B981',
          iconName: 'checkmark-circle' as const,
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          iconColor: '#EF4444',
          iconName: 'close-circle' as const,
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      default:
        return {
          iconColor: '#10B981',
          iconName: 'checkmark-circle' as const,
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
    }
  };

  const config = getTypeConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: iconScaleAnim }] }
        ]}
      >
        <Ionicons 
          name={config.iconName} 
          size={24} 
          color={config.iconColor} 
        />
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20,
  },
});
