import { API_CONFIG } from '@/constants/Api';
import { Ionicons } from '@expo/vector-icons';
import { Audio, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MediaPlayerScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-hide controls
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const params = useLocalSearchParams<{ 
    url?: string; 
    type?: string; 
    mediaData?: string;
    imageUri?: string;
  }>();
  
  // Enhanced URL extraction to handle audio from scanning responses
  const getMediaUrl = () => {
    const baseUrl = typeof params.url === 'string' ? params.url : '';
    const mediaData = params.mediaData ? JSON.parse(params.mediaData) : null;
    
    // Check for audio URL in mediaData first (from scanning response)
    if (mediaData?.audio_url) {
      return mediaData.audio_url.startsWith('http') ? mediaData.audio_url : `${API_CONFIG.BASE_URL}${mediaData.audio_url}`;
    }
    if (mediaData?.match?.audio_url) {
      return mediaData.match.audio_url.startsWith('http') ? mediaData.match.audio_url : `${API_CONFIG.BASE_URL}${mediaData.match.audio_url}`;
    }
    
    // Fallback to base URL
    return baseUrl;
  };

  const url = getMediaUrl();
  const type = (typeof params.type === 'string' ? params.type : '').toLowerCase();
  const mediaData = params.mediaData ? JSON.parse(params.mediaData) : null;
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : '';
  
  // Enhanced audio detection - check type, URL, and mediaData for audio content
  const isAudio = type.includes('audio') || 
                  url.toLowerCase().match(/\.(mp3|wav|aac|m4a|ogg|flac|mpeg|wma)$/) ||
                  (mediaData && (
                    mediaData.audio_url || 
                    mediaData.match?.audio_url || 
                    mediaData.type === 'audio' ||
                    mediaData.match?.type === 'audio'
                  ));

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
    // Only proceed if we have a URL or this is an audio type
    if (!url && !isAudio) {
      setIsLoading(false);
      setIsLoadingAudio(false);
      return;
    }

    // Load and prepare audio when URL is available
    const loadAudio = async () => {
      if (url && isAudio && !isLoadingAudio) {
        try {
          setIsLoadingAudio(true);
          setIsLoading(true);
          setHasError(false);
          
          // Set a timeout for loading (10 seconds)
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setHasError(true);
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }, 10000);
          
          // Create new audio instance
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false, isLooping: true, isMuted: isMuted },
            (status) => {
              // Handle playback status updates
              if (status.isLoaded) {
                if (status.didJustFinish) {
                  setIsPlaying(false);
                }
                // Sync playing state with actual audio status
                if (status.isPlaying !== undefined) {
                  setIsPlaying(status.isPlaying);
                }
              }
            }
          );
          
          // Clear loading timeout since audio loaded successfully
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          // Set the audio reference
          if (audioRef.current) {
            await audioRef.current.unloadAsync();
          }
          audioRef.current = sound;
          
          setIsLoading(false);
          setHasError(false);
          setIsLoadingAudio(false);
          
          // Auto-play audio
          await sound.playAsync();
          setIsPlaying(true);
        } catch (error) {
          // Clear loading timeout on error
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          // Handle audio load error
          setIsLoading(false);
          setHasError(true);
          setIsPlaying(false);
          setIsLoadingAudio(false);
        }
      } else if (url && !isAudio && !isLoadingAudio) {
        // If URL exists but not detected as audio, try to load it anyway
        // This handles cases where audio detection might fail
        try {
          setIsLoadingAudio(true);
          setIsLoading(true);
          setHasError(false);
          
          // Set a timeout for loading (10 seconds)
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setHasError(true);
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }, 10000);
          
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false, isLooping: true, isMuted: isMuted },
            (status) => {
              if (status.isLoaded) {
                if (status.didJustFinish) {
                  setIsPlaying(false);
                }
                // Sync playing state with actual audio status
                if (status.isPlaying !== undefined) {
                  setIsPlaying(status.isPlaying);
                }
              }
            }
          );
          
          // Clear loading timeout since audio loaded successfully
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          if (audioRef.current) {
            await audioRef.current.unloadAsync();
          }
          audioRef.current = sound;
          
          setIsLoading(false);
          setHasError(false);
          setIsLoadingAudio(false);
          await sound.playAsync();
          setIsPlaying(true);
        } catch (error) {
          // Clear loading timeout on error
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          // If audio loading fails, it's probably not audio
          setIsLoading(false);
          setHasError(false);
          setIsLoadingAudio(false);
        }
      }
    };

    // Auto-play video when URL is available
    if (url && !isAudio && videoRef.current) {
      videoRef.current.playAsync().catch(error => {
        // Handle video play error
        setIsPlaying(false);
      });
    } else if (url && (isAudio || !videoRef.current)) {
      // Load audio if detected as audio OR if no video ref (fallback)
      loadAudio();
    } else if (!url && isAudio) {
      // If no URL but detected as audio, show error state
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }

    // Start auto-hide timer
    hideControlsAfterDelay();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      setIsLoadingAudio(false);
    };
  }, [url, isAudio]);

  useEffect(() => {
    if (isAudio) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
  }, [isAudio]);

  // Cleanup audio when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      // Clean up audio when component unmounts
      if (audioRef.current) {
        audioRef.current.unloadAsync().catch(() => {
          // Ignore errors during cleanup
        });
      }
      // Reset orientation if in fullscreen
      if (isFullscreen) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
          // Ignore orientation reset error
        });
      }
      // Clear all timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  // Handle screen focus changes - stop audio when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - audio can play
      return () => {
        // Screen is losing focus - stop audio
        if (audioRef.current) {
          audioRef.current.stopAsync().catch(() => {
            // Ignore errors during cleanup
          });
        }
        if (videoRef.current) {
          videoRef.current.stopAsync().catch(() => {
            // Ignore errors during cleanup
          });
        }
      };
    }, [])
  );

  // Handle hardware back button on Android
  useEffect(() => {
    const backAction = () => {
      // Stop audio and navigate back
      handleBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

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
          setIsPlaying(false);
        } else {
          await audioRef.current.playAsync();
          setIsPlaying(true);
        }
      } else if (!isAudio && videoRef.current) {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        // If no audio/video ref available, just toggle the state
        setIsPlaying(!isPlaying);
      }
      // Show controls when toggling play/pause
      showControlsWithDelay();
    } catch (error) {
      // Handle play/pause error - try to reset state
      setIsPlaying(false);
    }
  };

  const toggleMute = async () => {
    try {
      if (isAudio && audioRef.current) {
        await audioRef.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      } else if (!isAudio && videoRef.current) {
        await videoRef.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      } else {
        setIsMuted(!isMuted);
      }
      showControlsWithDelay();
    } catch (error) {
      // Handle mute error
      setIsMuted(!isMuted);
    }
  };


  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        // Exit fullscreen - lock to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        // Enter fullscreen - lock to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (error) {
      // Handle orientation lock error
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleBack = async () => {
    // Stop and cleanup audio before navigating away
    if (audioRef.current) {
      try {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    
    // Stop video if playing
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    // Reset orientation if in fullscreen
    if (isFullscreen) {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        // Ignore orientation reset error
      }
    }
    
    // Navigate to fresh scanner screen instead of going back to previous state
    router.replace('/scanner');
  };

  // Extract data from API response or use dynamic data
  const getDisplayData = () => {
    // First priority: Check for actual title and description from API response
    if (mediaData && mediaData.match) {
      const match = mediaData.match;
      return {
        title: match.title || match.name || match.actual_title || (isAudio ? "Audio Match" : "Matched Content"),
        collection: match.collection || (isAudio ? "Audio Collection" : "ArchivART Collection"),
        description: match.description || match.actual_description || match.similarity?.description || 
                   (isAudio ? `Audio similarity: ${match.similarity?.score ? (match.similarity.score * 100).toFixed(1) + '%' : 'N/A'}` : 
                    `Similarity Score: ${match.similarity?.score ? (match.similarity.score * 100).toFixed(1) + '%' : 'N/A'}`),
        environment: match.environment || (isAudio ? "Audio Archive" : "Digital Archive"),
        estimatedTime: match.estimatedTime || (isAudio ? "Audio Track" : "Variable"),
        rating: `${match.similarity?.score ? (match.similarity.score * 5).toFixed(1) : '4.8'}/5`,
        image: match.scanning_image ? `${API_CONFIG.BASE_URL}/uploads/media/${match.scanning_image}` : 
               match.audio_thumbnail ? `${API_CONFIG.BASE_URL}/uploads/media/${match.audio_thumbnail}` :
               match.image || "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
      };
    }

    // Second priority: Check for direct mediaData properties
    if (mediaData) {
      return {
        title: mediaData.title || mediaData.name || mediaData.actual_title || (isAudio ? "Audio Content" : "Media Content"),
        collection: mediaData.collection || (isAudio ? "Audio Collection" : "ArchivART Collection"),
        description: mediaData.description || mediaData.actual_description || 
                   (isAudio ? "High-quality audio content from our digital archive" : "Immersive digital experience from our collection"),
        environment: mediaData.environment || (isAudio ? "Audio Archive" : "Digital Archive"),
        estimatedTime: mediaData.estimatedTime || (isAudio ? "Audio Track" : "Variable"),
        rating: "4.8/5",
        image: mediaData.image || mediaData.thumbnail || imageUri || "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
      };
    }

    // Dynamic fallback data based on URL, type, or content
    const isSpaceContent = url.toLowerCase().includes('space') || url.toLowerCase().includes('galaxy');
    const isNatureContent = url.toLowerCase().includes('nature') || url.toLowerCase().includes('forest');
    const isMusicContent = url.toLowerCase().includes('music') || url.toLowerCase().includes('song') || url.toLowerCase().includes('audio');
    
    if (isAudio || isMusicContent) {
      return {
        title: "Audio Experience",
        collection: "Audio Archive Collection",
        description: "An immersive audio experience featuring high-quality sound design and musical composition from our digital archive.",
        environment: "Audio Studio",
        estimatedTime: "Audio Track",
        rating: "4.8/5",
        image: imageUri || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
      };
    } else if (isSpaceContent) {
    return {
      title: "Space Explorer X-5",
      collection: "Sci-Fi Vehicle Collection",
      description: "A highly advanced interstellar vehicle designed for deep-space exploration. Features modular systems and a panoramic viewing cockpit.",
      environment: "Space",
      estimatedTime: "3 min",
      rating: "4.8/5",
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
    };
    } else if (isNatureContent) {
      return {
        title: "Forest Sanctuary",
        collection: "Nature Collection",
        description: "A serene forest environment with ancient trees and natural wildlife. Experience the calming sounds of nature.",
        environment: "Forest",
        estimatedTime: "5 min",
        rating: "4.9/5",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"
      };
    }

    // Default dynamic content
    return {
      title: "ArchivART Experience",
      collection: "Digital Archive Collection",
      description: "An immersive digital experience showcasing cutting-edge technology and artistic expression through augmented reality.",
      environment: "Digital",
      estimatedTime: "4 min",
      rating: "4.7/5",
      image: imageUri || "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
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
    
    // For fullscreen videos, always use screen dimensions
    if (isFullscreen || isLandscape()) {
      return {
        width: screenWidth,
        height: screenHeight,
        backgroundColor: '#000000',
        alignSelf: 'center' as const,
      };
    }
    
    // For portrait mode, maintain aspect ratio but fill screen
    let videoWidth, videoHeight;
    
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      // Use actual video dimensions to maintain aspect ratio
      const videoAspect = videoDimensions.width / videoDimensions.height;
      const screenAspectRatio = screenWidth / screenHeight;
      
        if (videoAspect > screenAspectRatio) {
        // Video is wider than screen - fit to width
          videoWidth = screenWidth;
          videoHeight = screenWidth / videoAspect;
        } else {
        // Video is taller than screen - fit to height
          videoHeight = screenHeight;
          videoWidth = screenHeight * videoAspect;
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
      alignSelf: 'center' as const,
    };
  };

  const getVideoResizeMode = () => {
    // For fullscreen or landscape mode, use COVER to fill the screen
    if (isFullscreen || isLandscape()) {
      return ResizeMode.COVER;
    }
    // For portrait mode, use CONTAIN to maintain aspect ratio
    return ResizeMode.CONTAIN;
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
              setIsLoading(true);
              setHasError(false);
            }}
            onLoad={(status) => {
              setIsLoading(false);
              setHasError(false);
              
              if (status.isLoaded && status.durationMillis) {
                // Get video dimensions from status
                const videoWidth = (status as any).naturalSize?.width || 0;
                const videoHeight = (status as any).naturalSize?.height || 0;
                
                if (videoWidth > 0 && videoHeight > 0) {
                  setVideoDimensions({ width: videoWidth, height: videoHeight });
                  setVideoAspectRatio(videoWidth / videoHeight);
                }
              }
              
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(error) => {
              // Handle video load error
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
                  onPress={toggleFullscreen}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={toggleMute}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Center Play/Pause Button - Always visible and centered */}
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
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

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
              </View>
            </View>
          </Animated.View>
        </View>
      ) : (
        /* Enhanced Audio Player with Visual Elements */
        <View style={styles.audioContainer}>
          {/* Loading Overlay for Audio */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <Ionicons name="musical-notes" size={48} color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading Audio...</Text>
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={() => {
                    // Skip loading and show error state
                    if (loadingTimeoutRef.current) {
                      clearTimeout(loadingTimeoutRef.current);
                      loadingTimeoutRef.current = null;
                    }
                    setIsLoading(false);
                    setHasError(true);
                    setIsPlaying(false);
                    setIsLoadingAudio(false);
                  }}
                  disabled={false}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Error Overlay for Audio */}
          {hasError && (
            <View style={styles.errorOverlay}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>Unable to load audio</Text>
                <Text style={styles.errorSubtext}>
                  {!url ? 'No audio URL provided' : 'Please check your connection and try again'}
              </Text>
                <TouchableOpacity 
                  style={[styles.retryButton, !url && { opacity: 0.5 }]}
                  onPress={async () => {
                    if (!url) return; // Don't retry if no URL
                    
                    setHasError(false);
                    setIsLoading(true);
                    setIsLoadingAudio(false);
                    
                    // Retry loading audio
                    try {
                      const { sound } = await Audio.Sound.createAsync(
                        { uri: url },
                        { shouldPlay: false, isLooping: true, isMuted: isMuted },
                        (status) => {
                          if (status.isLoaded) {
                            if (status.didJustFinish) {
                              setIsPlaying(false);
                            }
                            // Sync playing state with actual audio status
                            if (status.isPlaying !== undefined) {
                              setIsPlaying(status.isPlaying);
                            }
                          }
                        }
                      );
                      
                      if (audioRef.current) {
                        await audioRef.current.unloadAsync();
                      }
                      audioRef.current = sound;
                      
                      setIsLoading(false);
                      setHasError(false);
                      setIsLoadingAudio(false);
                      await sound.playAsync();
                      setIsPlaying(true);
                    } catch (error) {
                      setIsLoading(false);
                      setHasError(true);
                      setIsLoadingAudio(false);
                    }
                  }}
                  disabled={!url}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.audioGradient}
          >
            {/* Tap Area for Controls */}
            <Pressable 
              style={styles.tapArea}
              onPress={showControlsWithDelay}
            />
            {/* Top Controls for Audio */}
            <Animated.View style={[
              styles.topControls, 
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
                  {/* No controls needed for audio top right - mute is in action buttons */}
        </View>
              </View>
            </Animated.View>

            {/* Center Play/Pause Button for Audio - Always visible and centered */}
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
                  <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Audio Visualizer */}
            <View style={styles.audioVisualizer}>
              <View style={styles.visualizerContainer}>
                <Animated.View style={[styles.audioBar, { height: bar1Anim }]} />
                <Animated.View style={[styles.audioBar, { height: bar2Anim }]} />
                <Animated.View style={[styles.audioBar, { height: bar3Anim }]} />
                <Animated.View style={[styles.audioBar, { height: bar4Anim }]} />
                <Animated.View style={[styles.audioBar, { height: bar5Anim }]} />
              </View>
              
              {/* Album Art / Image */}
              <View style={styles.albumArtContainer}>
                <View style={styles.albumArt}>
                  {displayData.image ? (
                    <Image 
                      source={{ uri: displayData.image }} 
                      style={styles.albumArtImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                      style={styles.albumArtPlaceholder}
                    >
                      <Ionicons name="musical-notes" size={48} color="white" />
                    </LinearGradient>
                  )}
                </View>
              </View>
            </View>


            {/* Bottom Content for Audio - Title, Description & Actions */}
            <Animated.View style={[
              styles.bottomContainer, 
              { opacity: controlsOpacity }
            ]}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
              />
              
              <View style={styles.bottomContent}>
                {/* Title and Description */}
                <View style={styles.contentInfo}>
                  <Text style={styles.reelsTitle} numberOfLines={2}>
                    {displayData.title}
                  </Text>
                  <Text style={styles.reelsDescription} numberOfLines={3}>
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
                <View style={styles.rightActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={toggleMute}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons 
                        name={isMuted ? "volume-mute" : "volume-high"} 
                        size={22} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.actionText}>
                      {isMuted ? "Unmute" : "Mute"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setIsLiked(!isLiked)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={22} 
                        color={isLiked ? "#FF6B6B" : "white"} 
                      />
                    </View>
                    <Text style={styles.actionText}>
                      {isLiked ? "Liked" : "Like"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name="share-outline" size={22} color="white" />
                    </View>
                    <Text style={styles.actionText}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
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
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
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
    position: 'relative',
  },
  contentInfo: {
    flex: 1,
    marginRight: 100, // Space for absolutely positioned action buttons
  },
  reelsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  reelsDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    marginBottom: 12,
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
    gap: 24,
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -100 }],
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
    marginRight: 80, // Space for absolutely positioned action buttons in landscape
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
    gap: 20,
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -80 }],
  },
  actionTextLandscape: {
    fontSize: 10,
  },
  
  // Audio Player Styles
  audioContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  audioGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioVisualizer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 40,
  },
  audioBar: {
    width: 8,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 4,
    borderRadius: 4,
    minHeight: 20,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  albumArtImage: {
    width: '100%',
    height: '100%',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  audioPlayButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 20,
  },
  audioControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
});