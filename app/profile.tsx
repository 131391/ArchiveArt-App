import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function SettingsCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/ALogo.png')} style={styles.avatar} />
        <Text style={styles.name}>Alex Doe</Text>
        <Text style={styles.email}>alex@example.com</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: 12 }}>
        <SettingsCard title="Privacy" subtitle="Permissions and security" />
        <SettingsCard title="Language" subtitle="English" />
        <SettingsCard title="Help" subtitle="FAQs and support" />
        <SettingsCard title="About" subtitle="Version 1.0.0" />
      </View>
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'space-between' },
  header: { alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  email: { color: '#687076', marginTop: 4 },
  editBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F1F3F5' },
  editText: { fontWeight: '700' },
  card: { padding: 16, borderRadius: 14, backgroundColor: '#F8F9FA' },
  cardTitle: { fontWeight: '700', fontSize: 16 },
  cardSubtitle: { color: '#687076', marginTop: 4 },
  logoutBtn: { alignSelf: 'center', marginBottom: 12 },
  logoutText: { color: '#F04438', fontWeight: '800' },
});


