import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { router } from 'expo-router';

export default function NoMatchScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image source={require('@/assets/images/favicon.png')} style={{ width: 72, height: 72 }} />
        <Text style={styles.title}>No Match Found</Text>
        <Text style={styles.subtext}>We couldn’t find media… Try again.</Text>
      </View>
      <PrimaryButton title="Retry Scan" onPress={() => router.replace('/scanner')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between', backgroundColor: '#fff' },
  center: { alignItems: 'center', marginTop: 80 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtext: { color: '#687076', marginTop: 8, textAlign: 'center' },
});


