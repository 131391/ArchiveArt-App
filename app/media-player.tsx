import { getMediaUrl } from '@/constants/Api';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MediaPlayerScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-hide controls
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const params = useLocalSearchParams<{ 
    url?: string; 
    type?: string; 
    mediaData?: string;
    imageUri?: string;
  }>();
  
  // Enhanced URL extraction to handle audio from scanning responses
  const getMediaUrlFromParams = () => {
    const baseUrl = typeof params.url === 'string' ? params.url : '';
    const mediaData = params.mediaData ? JSON.parse(params.mediaData) : null;
    
    // Check for audio URL in mediaData first (from scanning response)
    if (mediaData?.audio_url) {
      return getMediaUrl(mediaData.audio_url) || '';
    }
    if (mediaData?.match?.audio_url) {
      return getMediaUrl(mediaData.match.audio_url) || '';
    }
    
    // Fallback to base URL
    return baseUrl;
  };

  const url = getMediaUrlFromParams();
  const type = (typeof params.type === 'string' ? params.type : '').toLowerCase();
  const mediaData = params.mediaData ? JSON.parse(params.mediaData) : null;
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : '';
  
  // Initialize video and audio players
  const videoPlayer = useVideoPlayer(url);
  const audioPlayer = useAudioPlayer(url);
  
  // Configure player properties
  useEffect(() => {
    if (videoPlayer) {
      videoPlayer.loop = true;
      videoPlayer.muted = isMuted;
    }
  }, [videoPlayer, isMuted]);
  
  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.loop = true;
      audioPlayer.muted = isMuted;
    }
  }, [audioPlayer, isMuted]);

  // Clear loading state when players are ready
  useEffect(() => {
    if (url && (videoPlayer || audioPlayer)) {
      // Small delay to ensure players are properly initialized
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasError(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [url, videoPlayer, audioPlayer]);
  
  // Enhanced audio detection - check type, URL, and mediaData for audio content
  const isAudio = type.includes('audio') || 
                  url.toLowerCase().match(/\.(mp3|wav|aac|m4a|ogg|flac|mpeg|wma)$/) ||
                  (mediaData && (
                    mediaData.audio_url || 
                    mediaData.match?.audio_url || 
                    mediaData.type === 'audio' ||
                    mediaData.match?.type === 'audio'
                  ));

  // Enhanced audio visualizer animations - more bars for better effect
  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.5)).current;
  const bar3Anim = useRef(new Animated.Value(0.4)).current;
  const bar4Anim = useRef(new Animated.Value(0.6)).current;
  const bar5Anim = useRef(new Animated.Value(0.3)).current;
  const bar6Anim = useRef(new Animated.Value(0.7)).current;
  const bar7Anim = useRef(new Animated.Value(0.4)).current;
  const bar8Anim = useRef(new Animated.Value(0.5)).current;
  const bar9Anim = useRef(new Animated.Value(0.6)).current;
  const bar10Anim = useRef(new Animated.Value(0.3)).current;
  const bar11Anim = useRef(new Animated.Value(0.8)).current;
  const bar12Anim = useRef(new Animated.Value(0.4)).current;
  
  // Additional visual effects
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  
  // Spectrum analyzer bars (smaller, more bars)
  const spectrumBar1 = useRef(new Animated.Value(0.2)).current;
  const spectrumBar2 = useRef(new Animated.Value(0.3)).current;
  const spectrumBar3 = useRef(new Animated.Value(0.4)).current;
  const spectrumBar4 = useRef(new Animated.Value(0.5)).current;
  const spectrumBar5 = useRef(new Animated.Value(0.3)).current;
  const spectrumBar6 = useRef(new Animated.Value(0.6)).current;
  const spectrumBar7 = useRef(new Animated.Value(0.4)).current;
  const spectrumBar8 = useRef(new Animated.Value(0.7)).current;
  const spectrumBar9 = useRef(new Animated.Value(0.5)).current;
  const spectrumBar10 = useRef(new Animated.Value(0.3)).current;
  const spectrumBar11 = useRef(new Animated.Value(0.8)).current;
  const spectrumBar12 = useRef(new Animated.Value(0.4)).current;
  const spectrumBar13 = useRef(new Animated.Value(0.6)).current;
  const spectrumBar14 = useRef(new Animated.Value(0.3)).current;
  const spectrumBar15 = useRef(new Animated.Value(0.5)).current;
  const spectrumBar16 = useRef(new Animated.Value(0.7)).current;

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

  const toggleControls = () => {
    if (showControls) {
      // Hide controls immediately
      setShowControls(false);
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    } else {
      // Show controls and start auto-hide timer
      showControlsWithDelay();
    }
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
          
          // The audio player is already initialized with the URL
          // Just need to play
          
          // Clear loading timeout since audio loaded successfully
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          // Audio player is ready
          
          setIsLoading(false);
          setHasError(false);
          setIsLoadingAudio(false);
          
          // Auto-play audio
          await audioPlayer.play();
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
          
          // The audio player is already initialized with the URL
          
          // Clear loading timeout since audio loaded successfully
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          setIsLoading(false);
          setHasError(false);
          setIsLoadingAudio(false);
          await audioPlayer.play();
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
    if (url && !isAudio) {
      videoPlayer.play();
    } else if (url && isAudio) {
      // Load audio if detected as audio OR if no video ref (fallback)
      loadAudio();
    } else if (!url && isAudio) {
      // If no URL but detected as audio, show error state
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }

    // Controls start hidden, will be shown on tap

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

  // Audio mode is handled automatically by expo-audio

  // Cleanup audio when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      // Clean up is handled automatically by the players
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
        // Screen is losing focus - just set playing state to false
        // The players will handle cleanup automatically
        setIsPlaying(false);
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

  // Enhanced audio visualizer animation with more bars and effects
  useEffect(() => {
    if (isAudio && isPlaying) {
      const createBarAnimation = (animValue: Animated.Value, delay: number, baseDuration: number = 800) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 0.9 + Math.random() * 0.1, // Randomize peak height slightly
              duration: baseDuration + delay * 50 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2 + Math.random() * 0.2, // Randomize low height
              duration: baseDuration + delay * 50 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      };

      // Create animations for all main bars
      const barAnimations = [
        createBarAnimation(bar1Anim, 0, 600),
        createBarAnimation(bar2Anim, 1, 700),
        createBarAnimation(bar3Anim, 2, 800),
        createBarAnimation(bar4Anim, 3, 650),
        createBarAnimation(bar5Anim, 4, 750),
        createBarAnimation(bar6Anim, 5, 600),
        createBarAnimation(bar7Anim, 6, 700),
        createBarAnimation(bar8Anim, 7, 800),
        createBarAnimation(bar9Anim, 8, 650),
        createBarAnimation(bar10Anim, 9, 750),
        createBarAnimation(bar11Anim, 10, 600),
        createBarAnimation(bar12Anim, 11, 700),
      ];

      // Create faster animations for spectrum analyzer bars
      const spectrumAnimations = [
        createBarAnimation(spectrumBar1, 0, 300),
        createBarAnimation(spectrumBar2, 1, 350),
        createBarAnimation(spectrumBar3, 2, 400),
        createBarAnimation(spectrumBar4, 3, 325),
        createBarAnimation(spectrumBar5, 4, 375),
        createBarAnimation(spectrumBar6, 5, 300),
        createBarAnimation(spectrumBar7, 6, 350),
        createBarAnimation(spectrumBar8, 7, 400),
        createBarAnimation(spectrumBar9, 8, 325),
        createBarAnimation(spectrumBar10, 9, 375),
        createBarAnimation(spectrumBar11, 10, 300),
        createBarAnimation(spectrumBar12, 11, 350),
        createBarAnimation(spectrumBar13, 12, 400),
        createBarAnimation(spectrumBar14, 13, 325),
        createBarAnimation(spectrumBar15, 14, 375),
        createBarAnimation(spectrumBar16, 15, 300),
      ];

      // Pulse animation for album art
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation for album art
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 20000, // 20 seconds for full rotation
          useNativeDriver: true,
        })
      );

      // Glow animation for visualizer
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );

      // Start all animations
      barAnimations.forEach(anim => anim.start());
      spectrumAnimations.forEach(anim => anim.start());
      pulseAnimation.start();
      rotationAnimation.start();
      glowAnimation.start();

      return () => {
        barAnimations.forEach(anim => anim.stop());
        spectrumAnimations.forEach(anim => anim.stop());
        pulseAnimation.stop();
        rotationAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      // Reset animations when not playing
      pulseAnim.setValue(1);
      rotationAnim.setValue(0);
      glowAnim.setValue(0.5);
    }
  }, [isAudio, isPlaying, bar1Anim, bar2Anim, bar3Anim, bar4Anim, bar5Anim, bar6Anim, bar7Anim, bar8Anim, bar9Anim, bar10Anim, bar11Anim, bar12Anim, spectrumBar1, spectrumBar2, spectrumBar3, spectrumBar4, spectrumBar5, spectrumBar6, spectrumBar7, spectrumBar8, spectrumBar9, spectrumBar10, spectrumBar11, spectrumBar12, spectrumBar13, spectrumBar14, spectrumBar15, spectrumBar16, pulseAnim, rotationAnim, glowAnim]);

  const togglePlayPause = async () => {
    try {
      if (isAudio) {
        if (isPlaying) {
          audioPlayer.pause();
          setIsPlaying(false);
        } else {
          audioPlayer.play();
          setIsPlaying(true);
        }
      } else if (!isAudio) {
        if (isPlaying) {
          videoPlayer.pause();
          setIsPlaying(false);
        } else {
          videoPlayer.play();
          setIsPlaying(true);
        }
      } else {
        // If no audio/video ref available, just toggle the state
        setIsPlaying(!isPlaying);
      }
      // Show controls when toggling play/pause
      if (!showControls) {
        showControlsWithDelay();
      }
    } catch (error) {
      // Handle play/pause error - try to reset state
      setIsPlaying(false);
    }
  };

  const toggleMute = async () => {
    try {
      if (isAudio) {
        audioPlayer.muted = !isMuted;
        setIsMuted(!isMuted);
      } else if (!isAudio) {
        videoPlayer.muted = !isMuted;
        setIsMuted(!isMuted);
      } else {
        setIsMuted(!isMuted);
      }
      if (!showControls) {
        showControlsWithDelay();
      }
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
    // Stop playback by setting state - players will handle cleanup
    setIsPlaying(false);

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
      const displayData = {
        title: match.title || match.name || match.actual_title || (isAudio ? "Audio Match" : "Matched Content"),
        collection: match.collection || (isAudio ? "Audio Collection" : "ArchivART Collection"),
        description: match.description || '',
        environment: match.environment || (isAudio ? "Audio Archive" : "Digital Archive"),
        estimatedTime: match.estimatedTime || (isAudio ? "Audio Track" : "Variable"),
        rating: `${match.similarity?.score ? (match.similarity.score * 5).toFixed(1) : '4.8'}/5`,
        image: getMediaUrl(match.scanning_image_url) || 
               getMediaUrl(match.scanning_image) || 
               getMediaUrl(match.audio_thumbnail) ||
               getMediaUrl(match.image) || 
               "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop"
      };
      
      return displayData;
    }

    // Second priority: Check for direct mediaData properties
    if (mediaData) {
      return {
        title: mediaData.title || mediaData.name || mediaData.actual_title || (isAudio ? "Audio Content" : "Media Content"),
        collection: mediaData.collection || (isAudio ? "Audio Collection" : "ArchivART Collection"),
        description: mediaData.description,
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

  // Helper functions for text expansion
  const shouldTruncateTitle = displayData.title.length > 50;
  const shouldTruncateDescription = displayData.description.length > 100;

  const toggleTitleExpansion = () => {
    setIsTitleExpanded(!isTitleExpanded);
  };

  const toggleDescriptionExpansion = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

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
    
    // Always use full screen dimensions for proper display
    return {
      width: screenWidth,
      height: screenHeight,
      backgroundColor: '#000000',
    };
  };

  const getVideoResizeMode = () => {
    // For fullscreen or landscape mode, use cover to fill the screen
    if (isFullscreen || isLandscape()) {
      return 'cover';
    }
    // For portrait mode, use contain to maintain aspect ratio
    return 'contain';
  };

  return (
    <View style={styles.reelsContainer}>
      <StatusBar hidden />
      
      {/* Full Screen Video Player */}
      {url && !isAudio ? (
        <View style={styles.videoContainer}>
          <VideoView
            player={videoPlayer}
            style={getVideoStyle()}
            nativeControls={false}
            contentFit={getVideoResizeMode()}
          />
          
          {/* Tap Area for Controls - Toggle on tap */}
          <Pressable 
            style={styles.tapArea}
            onPress={toggleControls}
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
                    // Video player will automatically reload with the URL
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
                <TouchableOpacity 
                  onPress={shouldTruncateTitle ? toggleTitleExpansion : undefined}
                  activeOpacity={shouldTruncateTitle ? 0.7 : 1}
                  disabled={!shouldTruncateTitle}
                >
                  <Text style={[styles.reelsTitle, isLandscape() && styles.reelsTitleLandscape]} 
                        numberOfLines={shouldTruncateTitle && !isTitleExpanded ? 2 : undefined}>
                    {displayData.title}
                    {shouldTruncateTitle && !isTitleExpanded && (
                      <Text style={styles.expandIndicator}>...</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={shouldTruncateDescription ? toggleDescriptionExpansion : undefined}
                  activeOpacity={shouldTruncateDescription ? 0.7 : 1}
                  disabled={!shouldTruncateDescription}
                >
                  <Text style={[styles.reelsDescription, isLandscape() && styles.reelsDescriptionLandscape]} 
                        numberOfLines={shouldTruncateDescription && !isDescriptionExpanded ? 3 : undefined}>
                    {displayData.description}
                    {shouldTruncateDescription && !isDescriptionExpanded && (
                      <Text style={styles.expandIndicator}>...</Text>
                    )}
                  </Text>
                </TouchableOpacity>
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
          {/* Background Image for Audio */}
          {isAudio && displayData.image && (
            <Image 
              source={{ uri: displayData.image }} 
              style={styles.audioBackgroundImage}
              resizeMode="cover"
            />
          )}
          
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
                      setIsLoading(false);
                      setHasError(false);
                      setIsLoadingAudio(false);
                      await audioPlayer.play();
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
            colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f1419', '#000000']}
            style={styles.audioGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Animated Background Pattern */}
            <Animated.View style={[styles.backgroundPattern, { opacity: glowAnim }]}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
              <View style={styles.patternCircle3} />
              <View style={styles.patternCircle4} />
            </Animated.View>
            
            {/* Tap Area for Controls - Toggle on tap */}
            <Pressable 
              style={styles.tapArea}
              onPress={toggleControls}
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

            {/* Modern Audio Player Layout */}
            <View style={styles.modernAudioContainer}>
              {/* Modern Album Art Section */}
              <View style={styles.modernAlbumSection}>
                <Animated.View 
                  style={[
                    styles.modernAlbumArt,
                    {
                      transform: [
                        { scale: pulseAnim },
                        {
                          rotate: rotationAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {displayData.image ? (
                    <Image 
                      source={{ uri: displayData.image }} 
                      style={styles.modernAlbumImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
                      style={styles.modernAlbumPlaceholder}
                    >
                      <Ionicons name="musical-notes" size={40} color="white" />
                    </LinearGradient>
                  )}
                  
                  {/* Modern glow ring */}
                  <Animated.View 
                    style={[
                      styles.modernGlowRing,
                      { opacity: glowAnim }
                    ]} 
                  />
                </Animated.View>
              </View>

              {/* Unique Particle Visualizer */}
              <View style={styles.particleVisualizerContainer}>
                <Animated.View style={[styles.particleVisualizer, { opacity: glowAnim }]}>
                  {/* Floating particles around the album art */}
                  <Animated.View style={[styles.floatingParticle, styles.particle1, { 
                    transform: [{ scale: bar1Anim }],
                    opacity: bar1Anim 
                  }]} />
                  <Animated.View style={[styles.floatingParticle, styles.particle2, { 
                    transform: [{ scale: bar2Anim }],
                    opacity: bar2Anim 
                  }]} />
                  <Animated.View style={[styles.floatingParticle, styles.particle3, { 
                    transform: [{ scale: bar3Anim }],
                    opacity: bar3Anim 
                  }]} />
                  <Animated.View style={[styles.floatingParticle, styles.particle4, { 
                    transform: [{ scale: bar4Anim }],
                    opacity: bar4Anim 
                  }]} />
                  <Animated.View style={[styles.floatingParticle, styles.particle5, { 
                    transform: [{ scale: bar5Anim }],
                    opacity: bar5Anim 
                  }]} />
                  <Animated.View style={[styles.floatingParticle, styles.particle6, { 
                    transform: [{ scale: bar6Anim }],
                    opacity: bar6Anim 
                  }]} />
                </Animated.View>
              </View>

              {/* Unique Waveform Visualizer */}
              <View style={styles.waveformContainer}>
                <Animated.View style={[styles.waveformVisualizer, { opacity: glowAnim }]}>
                  {/* Top waveform */}
                  <View style={styles.waveformTop}>
                    <Animated.View style={[styles.waveformBar, styles.waveformBar1, { height: bar7Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar2, { height: bar8Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar3, { height: bar9Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar4, { height: bar10Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar5, { height: bar11Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar6, { height: bar12Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar7, { height: bar1Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar8, { height: bar2Anim }]} />
                  </View>
                  
                  {/* Bottom waveform (inverted) */}
                  <View style={styles.waveformBottom}>
                    <Animated.View style={[styles.waveformBar, styles.waveformBar9, { height: bar3Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar10, { height: bar4Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar11, { height: bar5Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar12, { height: bar6Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar13, { height: bar7Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar14, { height: bar8Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar15, { height: bar9Anim }]} />
                    <Animated.View style={[styles.waveformBar, styles.waveformBar16, { height: bar10Anim }]} />
                  </View>
                </Animated.View>
              </View>
            </View>


            {/* Modern Bottom Content */}
            <Animated.View style={[
              styles.modernBottomContainer, 
              { opacity: controlsOpacity }
            ]}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={styles.modernBottomGradient}
              />

            <View style={styles.bottomContent}>
              {/* Title and Description */}
              <View style={[styles.contentInfo, isLandscape() && styles.contentInfoLandscape]}>
                <TouchableOpacity 
                  onPress={shouldTruncateTitle ? toggleTitleExpansion : undefined}
                  activeOpacity={shouldTruncateTitle ? 0.7 : 1}
                  disabled={!shouldTruncateTitle}
                >
                  <Text style={[styles.reelsTitle, isLandscape() && styles.reelsTitleLandscape]} 
                        numberOfLines={shouldTruncateTitle && !isTitleExpanded ? 2 : undefined}>
                    {displayData.title}
                    {shouldTruncateTitle && !isTitleExpanded && (
                      <Text style={styles.expandIndicator}>...</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={shouldTruncateDescription ? toggleDescriptionExpansion : undefined}
                  activeOpacity={shouldTruncateDescription ? 0.7 : 1}
                  disabled={!shouldTruncateDescription}
                >
                  <Text style={[styles.reelsDescription, isLandscape() && styles.reelsDescriptionLandscape]} 
                        numberOfLines={shouldTruncateDescription && !isDescriptionExpanded ? 3 : undefined}>
                    {displayData.description}
                    {shouldTruncateDescription && !isDescriptionExpanded && (
                      <Text style={styles.expandIndicator}>...</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>

                {/* Modern Action Buttons */}
                <View style={styles.modernActionsContainer}>
                  <TouchableOpacity 
                    style={styles.modernActionButton}
                    onPress={toggleMute}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isMuted ? ['#ff6b6b', '#ee5a52'] : ['#667eea', '#764ba2']}
                      style={styles.modernActionGradient}
                    >
                      <Ionicons 
                        name={isMuted ? "volume-mute" : "volume-high"} 
                        size={20} 
                        color="white" 
                      />
                    </LinearGradient>
                    <Text style={styles.modernActionText}>
                      {isMuted ? "Unmute" : "Mute"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modernActionButton}
                    onPress={() => setIsLiked(!isLiked)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isLiked ? ['#ff6b6b', '#ee5a52'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.modernActionGradient}
                    >
                      <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isLiked ? "white" : "rgba(255,255,255,0.8)"} 
                      />
                    </LinearGradient>
                    <Text style={styles.modernActionText}>
                      {isLiked ? "Liked" : "Like"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modernActionButton}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.modernActionGradient}
                    >
                      <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.8)" />
                    </LinearGradient>
                    <Text style={styles.modernActionText}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // Higher z-index to ensure it's above other elements
    backgroundColor: 'transparent', // Ensure it's transparent but clickable
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
    marginRight: 120, // Space for absolutely positioned action buttons
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
  expandIndicator: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rightActions: {
    alignItems: 'center',
    gap: 18,
    position: 'absolute',
    right: 20,
    top: '0%',
    transform: [{ translateY: -70 }],
    zIndex: 20,
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
  
  // Landscape-specific styles
  topControlsLandscape: {
    height: 80,
  },
  bottomContainerLandscape: {
    height: 140,
  },
  contentInfoLandscape: {
    maxWidth: 400,
    marginRight: 100, // Space for absolutely positioned action buttons in landscape
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
    gap: 14,
    position: 'absolute',
    right: 20,
    top: '-50%',
    transform: [{ translateY: -50 }],
    zIndex: 20,
  },
  actionTextLandscape: {
    fontSize: 10,
  },
  
  // Modern Audio Player Styles
  audioContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  audioBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    zIndex: 0,
  },
  audioGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // Modern Audio Container
  modernAudioContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  // Modern Album Section
  modernAlbumSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modernAlbumArt: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  modernAlbumImage: {
    width: '100%',
    height: '100%',
  },
  modernAlbumPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernGlowRing: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 115,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  // Unique Particle Visualizer
  particleVisualizerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  particleVisualizer: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  floatingParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  particle1: {
    top: '10%',
    left: '20%',
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
  },
  particle2: {
    top: '20%',
    right: '15%',
    backgroundColor: '#764ba2',
    shadowColor: '#764ba2',
  },
  particle3: {
    bottom: '25%',
    left: '10%',
    backgroundColor: '#f093fb',
    shadowColor: '#f093fb',
  },
  particle4: {
    bottom: '15%',
    right: '20%',
    backgroundColor: '#f5576c',
    shadowColor: '#f5576c',
  },
  particle5: {
    top: '50%',
    left: '5%',
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
  },
  particle6: {
    top: '60%',
    right: '5%',
    backgroundColor: '#00f2fe',
    shadowColor: '#00f2fe',
  },
  // Unique Waveform Visualizer
  waveformContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  waveformVisualizer: {
    width: 280,
    height: 80,
    position: 'relative',
  },
  waveformTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  waveformBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  waveformBar1: { backgroundColor: '#667eea', shadowColor: '#667eea' },
  waveformBar2: { backgroundColor: '#764ba2', shadowColor: '#764ba2' },
  waveformBar3: { backgroundColor: '#f093fb', shadowColor: '#f093fb' },
  waveformBar4: { backgroundColor: '#f5576c', shadowColor: '#f5576c' },
  waveformBar5: { backgroundColor: '#4facfe', shadowColor: '#4facfe' },
  waveformBar6: { backgroundColor: '#00f2fe', shadowColor: '#00f2fe' },
  waveformBar7: { backgroundColor: '#43e97b', shadowColor: '#43e97b' },
  waveformBar8: { backgroundColor: '#38f9d7', shadowColor: '#38f9d7' },
  waveformBar9: { backgroundColor: '#ff6b6b', shadowColor: '#ff6b6b' },
  waveformBar10: { backgroundColor: '#4ecdc4', shadowColor: '#4ecdc4' },
  waveformBar11: { backgroundColor: '#45b7d1', shadowColor: '#45b7d1' },
  waveformBar12: { backgroundColor: '#96ceb4', shadowColor: '#96ceb4' },
  waveformBar13: { backgroundColor: '#feca57', shadowColor: '#feca57' },
  waveformBar14: { backgroundColor: '#ff9ff3', shadowColor: '#ff9ff3' },
  waveformBar15: { backgroundColor: '#ff0080', shadowColor: '#ff0080' },
  waveformBar16: { backgroundColor: '#00ff80', shadowColor: '#00ff80' },
  // Background pattern styles
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  patternCircle2: {
    position: 'absolute',
    top: '60%',
    right: '15%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  patternCircle3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(78, 205, 196, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.1)',
  },
  patternCircle4: {
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(69, 183, 209, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(69, 183, 209, 0.1)',
  },
  // Modern Bottom Content Styles
  modernBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 10,
  },
  modernBottomGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  // Modern Action Buttons
  modernActionsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  modernActionButton: {
    alignItems: 'center',
    gap: 6,
  },
  modernActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernActionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
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