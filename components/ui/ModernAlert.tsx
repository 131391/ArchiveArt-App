import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModernAlertProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const ModernAlert: React.FC<ModernAlertProps> = ({
  visible,
  message,
  type,
  onClose,
  duration = 4000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideAlert();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideAlert();
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#10ac84',
          backgroundColor: '#d1f2eb',
          borderColor: '#10ac84',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#ff4757',
          backgroundColor: '#ffe6e6',
          borderColor: '#ff4757',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: '#ffa502',
          backgroundColor: '#fff3cd',
          borderColor: '#ffa502',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          color: '#3742fa',
          backgroundColor: '#e3f2fd',
          borderColor: '#3742fa',
        };
      default:
        return {
          icon: 'information-circle' as const,
          color: '#3742fa',
          backgroundColor: '#e3f2fd',
          borderColor: '#3742fa',
        };
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.alertContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon} size={24} color={config.color} />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: config.color }]}>
                {type === 'success' && 'Success!'}
                {type === 'error' && 'Error!'}
                {type === 'warning' && 'Warning!'}
                {type === 'info' && 'Info'}
              </Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideAlert}
            >
              <Ionicons name="close" size={20} color={config.color} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  alertContainer: {
    width: width - 32,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
