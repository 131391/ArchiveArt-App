import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MediaPlayerScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const params = useLocalSearchParams<{ 
    url?: string; 
    type?: string; 
    mediaData?: string;
    imageUri?: string;
  }>();
  
  const url = typeof params.url === 'string' ? params.url : '';
  const type = (typeof params.type === 'string' ? params.type : '').toLowerCase();
  const mediaData = params.mediaData ? JSON.parse(params.mediaData) : null;
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : '';
  
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
    console.log('🎬 Media Player - Media Data:', mediaData);
  }, [params, url, type, isAudio, mediaData]);

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
              toValue: 0.3,
              duration: 800 + delay * 100,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const animations = [
        createAnimation(bar1Anim, 0),
        createAnimation(bar2Anim, 1),
        createAnimation(bar3Anim, 2),
        createAnimation(bar4Anim, 3),
        createAnimation(bar5Anim, 4),
      ];

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    }
  }, [isAudio, isPlaying, bar1Anim, bar2Anim, bar3Anim, bar4Anim, bar5Anim]);

  const togglePlayPause = async () => {
    try {
      if (isAudio && audioRef.current) {
        if (isPlaying) {
          await audioRef.current.pauseAsync();
        } else {
          await audioRef.current.playAsync();
        }
      } else if (!isAudio && videoRef.current) {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Toggle play/pause error:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Mock data for demonstration
  const mockData = {
    title: "Space Explorer X-5",
    collection: "Sci-Fi Vehicle Collection",
    description: "A highly advanced interstellar vehicle designed for deep-space exploration. Features modular systems and a panoramic viewing cockpit.",
    environment: "Space",
    estimatedTime: "3 min",
    rating: "4.8/5",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
  };

  const displayData = mediaData || mockData;

  return (
    <View style={styles.container}>
      {/* Cosmic Background */}
      <View style={styles.cosmicBackground}>
        <View style={[styles.planet, styles.planet1]} />
        <View style={[styles.planet, styles.planet2]} />
        <View style={[styles.planet, styles.planet3]} />
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Found</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Media Image */}
          <View style={styles.mediaContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.mediaImage} />
            ) : (
              <Image source={{ uri: displayData.image }} style={styles.mediaImage} />
            )}
          </View>

          {/* Media Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="planet" size={16} color="#8B5CF6" />
                <Text style={styles.detailText}>{displayData.environment}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#8B5CF6" />
                <Text style={styles.detailText}>{displayData.estimatedTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="star" size={16} color="#8B5CF6" />
                <Text style={styles.detailText}>{displayData.rating}</Text>
              </View>
            </View>

            <Text style={styles.title}>Found: {displayData.title}</Text>
            <Text style={styles.collection}>{displayData.collection}</Text>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{displayData.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart" size={20} color="#8B5CF6" />
              <Text style={styles.favoriteButtonText}>Add to Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.arButton}>
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.arButtonGradient}
              >
                <Text style={styles.arButtonText}>Place in AR</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Media Player */}
          {url && (
            <View style={styles.playerContainer}>
              {isAudio ? (
                <View style={styles.audioPlayer}>
                  <View style={styles.audioVisualizer}>
                    <Animated.View style={[styles.audioBar, { height: bar1Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 40] }) }]} />
                    <Animated.View style={[styles.audioBar, { height: bar2Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 40] }) }]} />
                    <Animated.View style={[styles.audioBar, { height: bar3Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 40] }) }]} />
                    <Animated.View style={[styles.audioBar, { height: bar4Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 40] }) }]} />
                    <Animated.View style={[styles.audioBar, { height: bar5Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 40] }) }]} />
                  </View>
                  <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                  </TouchableOpacity>
                  <Audio.Sound
                    ref={audioRef}
                    source={{ uri: url }}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                      }
                    }}
                  />
                </View>
              ) : (
                <View style={styles.videoPlayer}>
                  <Video
                    ref={videoRef}
                    source={{ uri: url }}
                    style={styles.video}
                    useNativeControls={false}
                    resizeMode="contain"
                    onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                      }
                    }}
                  />
                  <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cosmicBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  planet: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.6,
  },
  planet1: {
    width: 120,
    height: 120,
    backgroundColor: '#3B82F6',
    top: 100,
    right: -60,
  },
  planet2: {
    width: 80,
    height: 80,
    backgroundColor: '#8B5CF6',
    bottom: 200,
    left: -40,
  },
  planet3: {
    width: 60,
    height: 60,
    backgroundColor: '#F59E0B',
    top: Dimensions.get('window').height * 0.4,
    right: 50,
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    opacity: 0.3,
  },
  ring1: {
    width: 160,
    height: 160,
    borderColor: '#3B82F6',
    top: 80,
    right: -80,
  },
  ring2: {
    width: 100,
    height: 100,
    borderColor: '#8B5CF6',
    bottom: 180,
    left: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  collection: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  arButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  arButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerContainer: {
    marginTop: 20,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  audioVisualizer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'end',
    height: 40,
    gap: 4,
  },
  audioBar: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    minHeight: 10,
  },
  videoPlayer: {
    position: 'relative',
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
