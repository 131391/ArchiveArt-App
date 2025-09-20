import { API_CONFIG } from '@/constants/Api';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MediaPlayerScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9);
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
    
    // Auto-play video when URL is available
    if (url && !isAudio && videoRef.current) {
      console.log('🎬 Auto-playing video:', url);
      videoRef.current.playAsync().catch(error => {
        console.error('🎬 Video play error:', error);
        setIsPlaying(false);
      });
    } else if (url && isAudio && audioRef.current) {
      console.log('🎬 Auto-playing audio:', url);
      audioRef.current.playAsync().catch(error => {
        console.error('🎬 Audio play error:', error);
        setIsPlaying(false);
      });
    }
  }, [params, url, type, isAudio, mediaData]);

  useEffect(() => {
    if (isAudio) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
  }, [isAudio]);

  // Handle orientation changes
  useEffect(() => {
    const getOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync();
        setOrientation(currentOrientation);
        setIsLandscapeMode(
          currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
          currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
        );
      } catch (error) {
        console.log('ScreenOrientation not available, using fallback');
        // Fallback: use dimensions to determine orientation
        const { width, height } = Dimensions.get('window');
        setIsLandscapeMode(width > height);
      }
    };

    const handleOrientationChange = (event: ScreenOrientation.OrientationChangeEvent) => {
      setOrientation(event.orientationInfo.orientation);
      setIsLandscapeMode(
        event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
        event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
      setScreenData(Dimensions.get('window'));
    };

    const handleDimensionChange = ({ window }: { window: any }) => {
      setScreenData(window);
      // Fallback orientation detection
      setIsLandscapeMode(window.width > window.height);
    };

    getOrientation();
    
    let orientationSubscription: any;
    try {
      orientationSubscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);
    } catch (error) {
      console.log('ScreenOrientation listener not available, using fallback');
    }
    
    const dimensionSubscription = Dimensions.addEventListener('change', handleDimensionChange);

    return () => {
      orientationSubscription?.remove();
      dimensionSubscription?.remove();
    };
  }, []);

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
    // Navigate to fresh scanner screen instead of going back to previous state
    router.replace('/scanner');
  };

  // Extract data from API response or use mock data
  const getDisplayData = () => {
    if (mediaData && mediaData.match) {
      const match = mediaData.match;
      return {
        title: match.title || "Matched Content",
        collection: "ArchivART Collection",
        description: `Similarity: ${match.similarity?.description || 'Unknown'} (Score: ${match.similarity?.score || 'N/A'})`,
        environment: "Digital Archive",
        estimatedTime: "Variable",
        rating: `${match.similarity?.score ? (match.similarity.score * 5).toFixed(1) : 'N/A'}/5`,
        image: match.scanning_image ? `${API_CONFIG.BASE_URL}/uploads/media/${match.scanning_image}` : "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
      };
    }
    
    // Mock data for demonstration
    return {
      title: "Space Explorer X-5",
      collection: "Sci-Fi Vehicle Collection",
      description: "A highly advanced interstellar vehicle designed for deep-space exploration. Features modular systems and a panoramic viewing cockpit.",
      environment: "Space",
      estimatedTime: "3 min",
      rating: "4.8/5",
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
    };
  };

  const displayData = getDisplayData();

  // Helper functions for orientation
  const isLandscape = () => {
    return isLandscapeMode;
  };

  const isPortrait = () => {
    return !isLandscapeMode;
  };

  const getVideoStyle = () => {
    const screenWidth = screenData.width;
    const screenHeight = screenData.height;
    const screenAspectRatio = screenWidth / screenHeight;
    
    let videoWidth, videoHeight;
    
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      // Use actual video dimensions
      const videoAspect = videoDimensions.width / videoDimensions.height;
      
      if (isLandscape()) {
        // Landscape mode: fit video to screen width, maintain aspect ratio
        if (videoAspect > screenAspectRatio) {
          // Video is wider than screen
          videoWidth = screenWidth;
          videoHeight = screenWidth / videoAspect;
        } else {
          // Video is taller than screen
          videoHeight = screenHeight;
          videoWidth = screenHeight * videoAspect;
        }
      } else {
        // Portrait mode: fit video to screen height, maintain aspect ratio
        if (videoAspect > screenAspectRatio) {
          // Video is wider than screen
          videoWidth = screenWidth;
          videoHeight = screenWidth / videoAspect;
        } else {
          // Video is taller than screen
          videoHeight = screenHeight;
          videoWidth = screenHeight * videoAspect;
        }
      }
    } else {
      // Fallback: use screen dimensions
      videoWidth = screenWidth;
      videoHeight = screenHeight;
    }
    
    return {
      width: videoWidth,
      height: videoHeight,
      backgroundColor: '#000000',
      alignSelf: 'center',
    };
  };

  const getVideoResizeMode = () => {
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      return 'contain'; // Always use contain when we have video dimensions
    }
    return isLandscape() ? 'contain' : 'cover';
  };

  return (
    <View style={styles.reelsContainer}>
      <StatusBar hidden />
      
      {/* Full Screen Video Player */}
      {url && !isAudio ? (
        <View style={[styles.videoContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Video
            ref={videoRef}
            source={{ uri: url }}
            style={getVideoStyle()}
            useNativeControls={false}
            resizeMode={getVideoResizeMode()}
            shouldPlay={isPlaying}
            isLooping={true}
            isMuted={isMuted}
            onLoadStart={() => {
              console.log('🎬 Video loading started');
              setIsLoading(true);
              setHasError(false);
            }}
            onLoad={(status) => {
              console.log('🎬 Video loaded successfully');
              console.log('🎬 Video status:', status);
              
              if (status.isLoaded && status.durationMillis) {
                // Get video dimensions from status
                const videoWidth = status.naturalSize?.width || 0;
                const videoHeight = status.naturalSize?.height || 0;
                
                if (videoWidth > 0 && videoHeight > 0) {
                  setVideoDimensions({ width: videoWidth, height: videoHeight });
                  setVideoAspectRatio(videoWidth / videoHeight);
                  console.log('🎬 Video dimensions:', { width: videoWidth, height: videoHeight });
                  console.log('🎬 Video aspect ratio:', videoWidth / videoHeight);
                }
              }
              
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(error) => {
              console.error('🎬 Video load error:', error);
              console.error('🎬 Video URL that failed:', url);
              setIsLoading(false);
              setHasError(true);
            }}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
              }
            }}
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Ionicons name="hourglass" size={48} color="white" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          
          {/* Error Overlay */}
          {hasError && (
            <View style={styles.errorOverlay}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Failed to load video</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.loadAsync({ uri: url });
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Tap to Play/Pause */}
          <TouchableOpacity 
            style={styles.tapArea}
            onPress={() => {
              setShowControls(!showControls);
              setTimeout(() => setShowControls(false), 3000);
            }}
            activeOpacity={1}
          />
          
          {/* Top Controls */}
          <View style={[styles.topControls, isLandscape() && styles.topControlsLandscape]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.topRightControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bottom Info Panel */}
          <View style={[styles.bottomInfo, isLandscape() && styles.bottomInfoLandscape]}>
            <View style={[styles.infoContent, isLandscape() && styles.infoContentLandscape]}>
              <Text style={[styles.reelsTitle, isLandscape() && styles.reelsTitleLandscape]}>{displayData.title}</Text>
              <Text style={[styles.reelsDescription, isLandscape() && styles.reelsDescriptionLandscape]}>{displayData.description}</Text>
              <View style={styles.reelsMeta}>
                <Text style={styles.reelsMetaText}>Similarity: {displayData.rating}</Text>
                <Text style={styles.reelsMetaText}>•</Text>
                <Text style={styles.reelsMetaText}>{displayData.environment}</Text>
              </View>
            </View>
          </View>
          
          {/* Right Side Actions */}
          <View style={[styles.rightActions, isLandscape() && styles.rightActionsLandscape]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsLiked(!isLiked)}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={isLandscape() ? 28 : 32} 
                color={isLiked ? "#FF3040" : "white"} 
              />
              <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={isLandscape() ? 24 : 28} color="white" />
              <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>Comment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={isLandscape() ? 24 : 28} color="white" />
              <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={isLandscape() ? 24 : 28} color="white" />
              <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          {/* Center Play/Pause Button */}
          {!isPlaying && (
            <View style={styles.centerPlayButton}>
              <TouchableOpacity onPress={togglePlayPause}>
                <Ionicons name="play" size={64} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Debug Info (can be removed in production) */}
          {__DEV__ && videoDimensions.width > 0 && (
            <View style={styles.debugOverlay}>
              <Text style={styles.debugText}>
                Video: {videoDimensions.width}x{videoDimensions.height}
              </Text>
              <Text style={styles.debugText}>
                Screen: {screenData.width}x{screenData.height}
              </Text>
              <Text style={styles.debugText}>
                Aspect: {videoAspectRatio.toFixed(2)}
              </Text>
              <Text style={styles.debugText}>
                Mode: {isLandscape() ? 'Landscape' : 'Portrait'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* Fallback for Audio or No Media */
        <View style={styles.fallbackContainer}>
          <View style={styles.fallbackContent}>
            <Ionicons name="musical-notes" size={64} color="#8B5CF6" />
            <Text style={styles.fallbackTitle}>Audio Content</Text>
            <Text style={styles.fallbackSubtitle}>Audio playback not available in reels mode</Text>
            <TouchableOpacity style={styles.backToScannerButton} onPress={handleBack}>
              <Text style={styles.backToScannerText}>Back to Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reelsContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
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
  noMediaContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    marginTop: 20,
  },
  noMediaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noMediaSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  fullScreenVideo: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 80,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  infoContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  reelsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  reelsDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  reelsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reelsMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  rightActions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToScannerButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  backToScannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Landscape-specific styles
  topControlsLandscape: {
    top: 20,
    paddingHorizontal: 30,
  },
  bottomInfoLandscape: {
    bottom: 20,
    left: 20,
    right: 100,
  },
  infoContentLandscape: {
    padding: 12,
    maxWidth: 300,
  },
  reelsTitleLandscape: {
    fontSize: 16,
    marginBottom: 6,
  },
  reelsDescriptionLandscape: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  rightActionsLandscape: {
    right: 30,
    bottom: 40,
    gap: 20,
  },
  actionTextLandscape: {
    fontSize: 10,
  },
  debugOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
    zIndex: 20,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
