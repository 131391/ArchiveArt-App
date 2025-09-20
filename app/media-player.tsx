import { API_CONFIG } from '@/constants/Api';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MediaPlayerScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9);
  
  // Auto-hide controls
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Auto-hide controls function
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setShowControls(false);
    }, 4000);
  };

  const showControlsWithDelay = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    hideControlsAfterDelay();
  };

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

    // Start auto-hide timer
    hideControlsAfterDelay();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
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
        <View style={styles.videoContainer}>
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
          
          {/* Tap Area for Controls */}
          <Pressable 
            style={styles.tapArea}
            onPress={showControlsWithDelay}
            activeOpacity={1}
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <Ionicons name="hourglass" size={48} color="white" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            </View>
          )}
          
          {/* Error Overlay */}
          {hasError && (
            <View style={styles.errorOverlay}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>Unable to load video</Text>
                <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
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
            </View>
          )}
          
          {/* Top Controls - Animated */}
          <Animated.View style={[
            styles.topControls, 
            isLandscape() && styles.topControlsLandscape,
            { opacity: controlsOpacity }
          ]}>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
              style={styles.gradientOverlay}
            />
            <View style={styles.topControlsContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>
              
              <View style={styles.topRightControls}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => setIsMuted(!isMuted)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Center Play/Pause Button - Only when paused */}
          {!isPlaying && (
            <Animated.View style={[styles.centerPlayButton, { opacity: controlsOpacity }]}>
              <TouchableOpacity 
                style={styles.playButtonContainer}
                onPress={togglePlayPause}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.playButtonGradient}
                >
                  <Ionicons name="play" size={32} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom Content - Title, Description & Actions */}
          <Animated.View style={[
            styles.bottomContainer, 
            isLandscape() && styles.bottomContainerLandscape,
            { opacity: controlsOpacity }
          ]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={styles.bottomGradient}
            />
            
            <View style={styles.bottomContent}>
              {/* Title and Description */}
              <View style={[styles.contentInfo, isLandscape() && styles.contentInfoLandscape]}>
                <Text style={[styles.reelsTitle, isLandscape() && styles.reelsTitleLandscape]} numberOfLines={2}>
                  {displayData.title}
                </Text>
                <Text style={[styles.reelsDescription, isLandscape() && styles.reelsDescriptionLandscape]} numberOfLines={3}>
                  {displayData.description}
                </Text>
                <View style={styles.reelsMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.reelsMetaText}>{displayData.rating}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.reelsMetaText}>{displayData.environment}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={12} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.reelsMetaText}>{displayData.estimatedTime}</Text>
                  </View>
                </View>
              </View>

              {/* Right Side Actions */}
              <View style={[styles.rightActions, isLandscape() && styles.rightActionsLandscape]}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setIsLiked(!isLiked)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIcon, isLiked && styles.actionIconLiked]}>
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={isLandscape() ? 20 : 24} 
                      color={isLiked ? "#FF6B6B" : "white"} 
                    />
                  </View>
                  <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>
                    {isLiked ? 'Liked' : 'Like'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="chatbubble-outline" size={isLandscape() ? 18 : 22} color="white" />
                  </View>
                  <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>
                    Comment
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="share-outline" size={isLandscape() ? 18 : 22} color="white" />
                  </View>
                  <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>
                    Share
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="bookmark-outline" size={isLandscape() ? 18 : 22} color="white" />
                  </View>
                  <Text style={[styles.actionText, isLandscape() && styles.actionTextLandscape]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

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
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.fallbackGradient}
          >
            <View style={styles.fallbackContent}>
              <View style={styles.audioIcon}>
                <Ionicons name="musical-notes" size={64} color="#8B5CF6" />
              </View>
              <Text style={styles.fallbackTitle}>Audio Content</Text>
              <Text style={styles.fallbackSubtitle}>
                Audio playback is not available in this view.{'\n'}
                Please use the standard media player for audio content.
              </Text>
              <TouchableOpacity 
                style={styles.backToScannerButton} 
                onPress={handleBack}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="scan" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.backToScannerText}>Back to Scanner</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
  videoContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    opacity: 0.9,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    borderRadius: 20,
    margin: 20,
    backdropFilter: 'blur(10px)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  topControlsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    height: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  centerPlayButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playButtonContainer: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  bottomGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
    height: '100%',
  },
  contentInfo: {
    flex: 1,
    marginRight: 20,
  },
  reelsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadow: '0px 1px 3px rgba(0,0,0,0.8)',
  },
  reelsDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    marginBottom: 12,
    textShadow: '0px 1px 2px rgba(0,0,0,0.6)',
  },
  reelsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
  reelsMetaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  rightActions: {
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  actionIconLiked: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    textShadow: '0px 1px 2px rgba(0,0,0,0.6)',
  },
  fallbackContainer: {
    flex: 1,
  },
  fallbackGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 320,
  },
  audioIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  fallbackTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToScannerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  backToScannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  debugOverlay: {
    position: 'absolute',
    top: 130,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    zIndex: 20,
  },
  debugText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  
  // Landscape-specific styles
  topControlsLandscape: {
    height: 80,
  },
  bottomContainerLandscape: {
    height: 140,
  },
  contentInfoLandscape: {
    maxWidth: 400,
  },
  reelsTitleLandscape: {
    fontSize: 18,
    marginBottom: 6,
  },
  reelsDescriptionLandscape: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  rightActionsLandscape: {
    gap: 16,
  },
  actionTextLandscape: {
    fontSize: 10,
  },
});