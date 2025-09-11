import React from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type PrimaryButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, style, disabled }: PrimaryButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={[style, disabled && { opacity: 0.6 }]}> 
      <LinearGradient colors={["#6a11cb", "#2575fc"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


