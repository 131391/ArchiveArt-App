import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WarningModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export function WarningModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}: WarningModalProps) {
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

  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: 'warning',
          bgColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
      case 'danger':
        return {
          colors: ['#EF4444', '#DC2626'],
          icon: 'alert-circle',
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'info':
        return {
          colors: ['#3B82F6', '#2563EB'],
          icon: 'information-circle',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      default:
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: 'warning',
          bgColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable 
        style={styles.overlay}
        onPress={onCancel}
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
                  ],
                  backgroundColor: config.bgColor,
                  borderColor: config.borderColor,
                }
              ]}
            >
              {/* Header with enhanced design */}
              <View style={styles.header}>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: iconScaleAnim }] }
                  ]}
                >
                  <LinearGradient
                    colors={config.colors}
                    style={styles.iconGradient}
                  >
                    <Ionicons name={config.icon as any} size={28} color="#fff" />
                  </LinearGradient>
                  {/* Glow effect */}
                  <View style={[styles.iconGlow, { backgroundColor: config.colors[0] + '20' }]} />
                </Animated.View>
                <Text style={styles.title}>{title}</Text>
              </View>

              {/* Content with better typography */}
              <View style={styles.content}>
                <Text style={styles.message}>{message}</Text>
              </View>

              {/* Enhanced Actions */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color="#6B7280" style={styles.buttonIcon} />
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={config.colors}
                    style={styles.confirmButtonGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 44,
    opacity: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  message: {
    fontSize: 17,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 16,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  confirmButton: {
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 4,
  },
});
