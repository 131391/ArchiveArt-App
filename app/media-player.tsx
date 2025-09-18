import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MediaPlayerScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const params = useLocalSearchParams<{ url?: string; type?: string }>();
  const url = typeof params.url === 'string' ? params.url : '';
  const type = (typeof params.type === 'string' ? params.type : '').toLowerCase();
  // Check both the type parameter and file extension for audio detection
  const isAudio = type.includes('audio') || url.toLowerCase().match(/\.(mp3|wav|aac|m4a|ogg|flac)$/);

  // Audio visualizer animations
  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.5)).current;
  const bar3Anim = useRef(new Animated.Value(0.4)).current;
  const bar4Anim = useRef(new Animated.Value(0.6)).current;
  const bar5Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    console.log('🎬 Media Player - Received params:', params);
    console.log('🎬 Media Player - URL:', url);
    console.log('🎬 Media Player - Type:', type);
    console.log('🎬 Media Player - Is Audio:', isAudio);
    console.log('🎬 Media Player - URL length:', url.length);
    console.log('🎬 Media Player - URL valid:', !!url && url.length > 0);
  }, [params, url, type, isAudio]);

  useEffect(() => {
    if (isAudio) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
  }, [isAudio]);

  // Audio visualizer animation
  useEffect(() => {
    if (isAudio && isPlaying) {
      const createAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 800 + delay * 100,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2,
              duration: 800 + delay * 100,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const animations = [
        createAnimation(bar1Anim, 0),
        createAnimation(bar2Anim, 200),
        createAnimation(bar3Anim, 400),
        createAnimation(bar4Anim, 600),
        createAnimation(bar5Anim, 800),
      ];

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      // Reset bars when not playing
      bar1Anim.setValue(0.3);
      bar2Anim.setValue(0.5);
      bar3Anim.setValue(0.4);
      bar4Anim.setValue(0.6);
      bar5Anim.setValue(0.3);
    }
  }, [isAudio, isPlaying, bar1Anim, bar2Anim, bar3Anim, bar4Anim, bar5Anim]);

  // Load audio when URL changes
  useEffect(() => {
    if (isAudio && url) {
      loadAudio();
    }
    
    return () => {
      // Cleanup audio when component unmounts
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, [isAudio, url]);

  const loadAudio = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: isPlaying, isLooping: true }
      );
      
      audioRef.current = sound;
      console.log('✅ Audio loaded successfully');
    } catch (error) {
      console.log('❌ Audio loading error:', error);
    }
  };

  const AudioVisualizer = () => (
    <View style={styles.visualizerContainer}>
      <Animated.View 
        style={[
          styles.visualizerBar, 
          { 
            height: bar1Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 80],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.visualizerBar, 
          { 
            height: bar2Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 100],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.visualizerBar, 
          { 
            height: bar3Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 90],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.visualizerBar, 
          { 
            height: bar4Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 110],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.visualizerBar, 
          { 
            height: bar5Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 70],
            })
          }
        ]} 
      />
    </View>
  );

  const handlePlayPause = async () => {
    const next = !isPlaying;
    setIsPlaying(next);
    
    if (isAudio) {
      if (audioRef.current) {
        if (next) {
          await audioRef.current.playAsync();
        } else {
          await audioRef.current.pauseAsync();
        }
      }
    } else {
      const status = await videoRef.current?.getStatusAsync();
      if (next) {
        if (status && !status.isLoaded) return;
        await videoRef.current?.playAsync();
      } else {
        await videoRef.current?.pauseAsync();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {isAudio ? (
        <View style={styles.audioContainer}>
          <View style={styles.audioArtwork}>
            <Image source={require('@/assets/images/ALogo.png')} style={styles.audioImage} />
            <View style={styles.audioOverlay}>
              <Ionicons name="musical-notes" size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.audioTitle}>Now Playing</Text>
          <Text style={styles.audioSubtitle}>Audio Track</Text>
          <AudioVisualizer />
        </View>
      ) : (
        <View style={styles.videoContainer}>
          {url ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: url }}
              resizeMode="contain"
              shouldPlay={isPlaying}
              useNativeControls={false}
              isLooping
              onError={(error) => {
                console.log('❌ Video Error:', error);
                console.log('❌ Video URL that failed:', url);
              }}
              onLoad={(status) => {
                console.log('✅ Video Loaded:', status);
                console.log('✅ Video URL loaded:', url);
              }}
              onLoadStart={() => {
                console.log('🔄 Video loading started for URL:', url);
              }}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons name="videocam-off" size={64} color="#666" />
              <Text style={styles.noVideoText}>No video URL provided</Text>
              <Text style={styles.noVideoSubtext}>Please try scanning again</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause} style={styles.controlBtn}>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  videoContainer: { 
    width: '100%', 
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: { width: '100%', height: '100%' },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  noVideoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noVideoSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
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
  audioContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  audioArtwork: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    position: 'relative',
  },
  audioImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  audioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  audioSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 40,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 120,
    gap: 8,
  },
  visualizerBar: {
    width: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    minHeight: 20,
  },
});


