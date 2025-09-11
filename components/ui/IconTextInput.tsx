import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconTextInputProps = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
};

export function IconTextInput({ icon, style, ...rest }: IconTextInputProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color="#9BA1A6" style={styles.icon} />
      <TextInput placeholderTextColor="#9BA1A6" style={[styles.input, style]} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E3E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
  },
});


