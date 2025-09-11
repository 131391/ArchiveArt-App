import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MediaPlayerScreen() {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const params = useLocalSearchParams<{ url?: string; type?: string }>();
  const url = typeof params.url === 'string' ? params.url : '';
  const type = (typeof params.type === 'string' ? params.type : '').toLowerCase();
  const isAudio = type.includes('audio');

  useEffect(() => {
    if (isAudio) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
  }, [isAudio]);

  return (
    <View style={styles.container}>
      {isAudio ? (
        <View style={styles.audioContainer}>
          <Image source={require('@/assets/images/react-logo.png')} style={{ width: 220, height: 220 }} />
          <Text style={{ color: '#fff', marginTop: 16 }}>Album Art / Waveform</Text>
        </View>
      ) : (
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: url || 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          resizeMode="contain"
          shouldPlay={isPlaying}
          useNativeControls={false}
          isLooping
        />
      )}
      <View style={styles.controls}>
        <TouchableOpacity onPress={async () => {
          const next = !isPlaying;
          setIsPlaying(next);
          const status = await videoRef.current?.getStatusAsync();
          if (next) {
            if (status && !status.isLoaded) return;
            await videoRef.current?.playAsync();
          } else {
            await videoRef.current?.pauseAsync();
          }
        }} style={styles.controlBtn}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="volume-high" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="scan" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="expand" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', height: '70%' },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioContainer: { alignItems: 'center' },
});


