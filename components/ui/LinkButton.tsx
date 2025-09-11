import React from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type LinkButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export function LinkButton({ title, onPress, style }: LinkButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#2575fc',
    fontWeight: '600',
    fontSize: 15,
  },
});


