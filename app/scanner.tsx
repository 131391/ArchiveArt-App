import { AuthGuard } from '@/components/AuthGuard';
import { API_CONFIG, API_ENDPOINTS, buildUrl } from '@/constants/Api';
import AuthService from '@/services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAutoCaptured, setHasAutoCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoCaptureTimer, setAutoCaptureTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const cameraRef = useRef<any>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [isReinitializing, setIsReinitializing] = useState(false);
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerPulseAnim = useRef(new Animated.Value(1)).current;
  const focusDotAnim = useRef(new Animated.Value(1)).current;
  const captureButtonAnim = useRef(new Animated.Value(1)).current;
  const gridOpacityAnim = useRef(new Animated.Value(0.3)).current;

  // Animation effects
  useEffect(() => {
    // Scanning line animation
    const scanLineAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Corner pulse animation
    const cornerPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cornerPulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Focus dot breathing animation
    const focusDotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(focusDotAnim, {
          toValue: 1.5,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(focusDotAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Grid opacity animation
    const gridAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(gridOpacityAnim, {
          toValue: 0.1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(gridOpacityAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    scanLineAnimation.start();
    cornerPulseAnimation.start();
    focusDotAnimation.start();
    gridAnimation.start();

    return () => {
      scanLineAnimation.stop();
      cornerPulseAnimation.stop();
      focusDotAnimation.stop();
      gridAnimation.stop();
    };
  }, [scanLineAnim, cornerPulseAnim, focusDotAnim, gridOpacityAnim]);

  // Handle back button and reset scanner when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset scanner state when screen comes into focus (e.g., when navigating back from media player)
      if (isProcessing || showWarning || progress > 0) {
        console.log('🔄 Resetting scanner state on focus');
        resetToFreshScanner();
      }

      const onBackPress = () => {
        if (isProcessing) {
          return true; // Prevent back navigation during processing
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isProcessing, showWarning, progress])
  );

  // Camera initialization
  useEffect(() => {
    if (permission?.granted) {
      setIsReady(true);
      setCameraInitialized(true);
      // Start scanning automatically when camera is ready
      setIsScanning(true);
    }
  }, [permission]);

  // Auto-capture logic with countdown
  useEffect(() => {
    if (isScanning && !hasAutoCaptured && !isProcessing && isReady) {
      // Start countdown from 5 seconds for better focus
      setCountdown(5);
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto-capture timer
      const timer = setTimeout(() => {
        if (isScanning && !hasAutoCaptured && !isProcessing && isReady) {
          console.log('📸 Auto-capturing image...');
          handleCapture();
        }
        clearInterval(countdownInterval);
      }, 5000); // Auto-capture after 5 seconds for better focus
      
      setAutoCaptureTimer(timer);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    } else {
      setCountdown(0);
    }
  }, [isScanning, hasAutoCaptured, isProcessing, isReady]);

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing || hasAutoCaptured) return;

    try {
      // Capture button press animation
      Animated.sequence([
        Animated.timing(captureButtonAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(captureButtonAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setIsProcessing(true);
      setHasAutoCaptured(true);
      
      if (autoCaptureTimer) {
        clearTimeout(autoCaptureTimer);
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
        skipProcessing: true,
        exif: false,
        additionalExif: {},
      });

      console.log('📸 Photo captured:', {
        uri: photo?.uri,
        width: photo?.width,
        height: photo?.height,
        exists: !!photo?.uri
      });

      if (photo?.uri) {
        await processImage(photo.uri);
      } else {
        throw new Error('Failed to capture photo');
      }
    } catch (error) {
      console.error('Capture error:', error);
      setIsProcessing(false);
      setHasAutoCaptured(false);
    }
  };

  const processImage = async (imageUri: string) => {
    let progressInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setProgress(0);
      
      // Simulate processing progress with better handling
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            return 80; // Stop at 80% until API call completes
          }
          return prev + 4;
        });
      }, 200);

      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔍 Processing image:', imageUri);
      console.log('🔍 API endpoint:', buildUrl(API_ENDPOINTS.MEDIA.MATCH));
      console.log('🔍 Token exists:', !!token);

      // Clear progress interval before API call
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      setProgress(85); // Set to 85% when starting API call

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'scan.jpg',
        fileName: 'scan.jpg',
      } as any);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.log('🔍 Request timeout - aborting');
        controller.abort();
      }, 15000); // Reduced to 15 second timeout

      console.log('🔍 Starting API request...');
      setProgress(90); // Set to 90% when request is sent

      // First, test if the server is reachable with a simple GET request
      try {
        console.log('🔍 Testing server connectivity...');
        const testResponse = await fetch(buildUrl('/api/health'), {
          method: 'GET',
          signal: controller.signal,
        });
        console.log('🔍 Health check response:', testResponse.status);
      } catch (healthError) {
        console.log('🔍 Health check failed, proceeding with main request:', healthError);
      }

      const response = await fetch(buildUrl(API_ENDPOINTS.MEDIA.MATCH), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it with boundary
        },
        body: formData,
        signal: controller.signal,
      });

      // Clear timeout since request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      console.log('🔍 API response received - Status:', response.status);
      console.log('🔍 API response ok:', response.ok);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      setProgress(95); // Set to 95% when API call completes

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 API response data:', result);
        
        setProgress(100); // Complete the progress
        
        // Check if match was found
        if (result.success && result.match) {
          // Match found - navigate to media player
          console.log('🔍 Match found, navigating to media player');
          console.log('🔍 Match data:', result.match);
          
          // Extract video URL from the match
          const match = result.match;
          const videoUrl = match.file_path ? `${API_CONFIG.BASE_URL}/uploads/media/${match.file_path}` : '';
          const mediaType = match.media_type || 'video';
          
          console.log('🔍 Video URL:', videoUrl);
          console.log('🔍 Media Type:', mediaType);
          console.log('🔍 Full URL:', videoUrl);
          
          setTimeout(() => {
            router.push({
              pathname: '/media-player',
              params: { 
                mediaData: JSON.stringify(result),
                imageUri: imageUri,
                url: videoUrl,
                type: mediaType
              }
            });
          }, 500);
        } else {
          // No matches found - show warning (no auto-redirect)
          console.log('🔍 No matches found, showing warning');
          setErrorMessage(result.message || 'No matching media found');
          setShowWarning(true);
          setIsProcessing(false);
          setHasAutoCaptured(false);
          setProgress(0);
          // No automatic timeout - user must manually tap "Try Again"
        }
      } else {
        // Get error details from response
        let errorMessage = 'Failed to process image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('🔍 API error response:', errorData);
        } catch (parseError) {
          console.error('🔍 Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('🔍 Processing error:', error);
      
      // Clear all intervals and timeouts
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle specific error types
      let errorMsg = 'An error occurred while processing the image';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = 'Request timed out after 15 seconds. The server may be slow or unavailable.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMsg = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('token') || error.message.includes('auth')) {
          errorMsg = 'Authentication error. Please login again.';
        } else if (error.message.includes('Failed to process image')) {
          errorMsg = 'Server error. Please try again or contact support.';
        } else {
          errorMsg = error.message;
        }
      }
      
      console.log('🔍 Setting error message:', errorMsg);
      setErrorMessage(errorMsg);
      setShowWarning(true);
      setIsProcessing(false);
      setHasAutoCaptured(false);
      setProgress(0);
      // No automatic timeout - user must manually tap "Try Again"
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery pick error:', error);
    }
  };

  const toggleTorch = () => {
    setIsTorchOn(!isTorchOn);
  };

  const resetScanner = () => {
    setIsScanning(false);
    setHasAutoCaptured(false);
    setIsProcessing(false);
    setProgress(0);
    setRetryCount(0);
    setCountdown(0);
    setShowWarning(false);
    setErrorMessage('');
    
    // Restart scanning after a short delay
    setTimeout(() => {
      setIsScanning(true);
    }, 1000);
  };

  const resetToFreshScanner = () => {
    console.log('🔄 Resetting to fresh scanner state');
    setIsScanning(false);
    setHasAutoCaptured(false);
    setIsProcessing(false);
    setProgress(0);
    setRetryCount(0);
    setCountdown(0);
    setShowWarning(false);
    setErrorMessage('');
    setIsReady(false);
    
    // Restart everything fresh
    setTimeout(() => {
      setIsReady(true);
      setIsScanning(true);
    }, 500);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required to scan images</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AuthGuard>
      <View style={styles.container}>
        {/* AR Camera View */}
        <CameraView
          key={cameraKey}
          style={styles.camera}
          facing="back"
          ref={cameraRef}
          onCameraReady={() => {
            console.log('📸 Camera ready');
            setIsReady(true);
          }}
          enableTorch={isTorchOn}
          autofocus="on"
          focusable={true}
        >
          {/* AR Overlay */}
          <View style={styles.overlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <View style={styles.closeButtonCircle}>
                  <Ionicons name="close" size={20} color="white" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.topRightButtons}>
                <TouchableOpacity 
                  style={styles.topButton}
                  onPress={toggleTorch}
                >
                  <View style={styles.topButtonCircle}>
                    <Ionicons 
                      name={isTorchOn ? "flash" : "flash-off"} 
                      size={20} 
                      color="white" 
                    />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.topButton}>
                  <View style={styles.topButtonCircle}>
                    <Ionicons name="help-circle" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Professional Scanner Overlay */}
            <View style={styles.scanningArea}>
              {/* Dark Overlay with Cutout */}
              <View style={styles.darkOverlay}>
                <View style={styles.cutoutArea} />
              </View>

              {/* Scanner Frame */}
              <View style={styles.scanFrame}>
                {/* Professional Corner Brackets */}
                <Animated.View style={[styles.cornerBracket, styles.topLeft, { transform: [{ scale: cornerPulseAnim }] }]} />
                <Animated.View style={[styles.cornerBracket, styles.topRight, { transform: [{ scale: cornerPulseAnim }] }]} />
                <Animated.View style={[styles.cornerBracket, styles.bottomLeft, { transform: [{ scale: cornerPulseAnim }] }]} />
                <Animated.View style={[styles.cornerBracket, styles.bottomRight, { transform: [{ scale: cornerPulseAnim }] }]} />
                
                {/* Professional Scanning Line */}
                <Animated.View
                  style={[
                    styles.scanningLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-120, 120],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                
                {/* Center Focus Indicator */}
                <Animated.View 
                  style={[
                    styles.centerFocus,
                    {
                      transform: [{ scale: focusDotAnim }],
                    }
                  ]} 
                />

                {/* Auto-capture Countdown */}
                {countdown > 0 && (
                  <View style={styles.countdownContainer}>
                    <Animated.View style={[styles.countdownCircle, { transform: [{ scale: focusDotAnim }] }]}>
                      <Text style={styles.countdownText}>{countdown}</Text>
                    </Animated.View>
                  </View>
                )}
              </View>

              {/* Status Indicator */}
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isReady ? '#10B981' : '#F59E0B' }]} />
                <Text style={styles.statusText}>
                  {isReady ? 'Ready to Scan' : 'Focusing...'}
                </Text>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={resetScanner}
              >
                <View style={styles.retakeIconContainer}>
                  <Ionicons name="sparkles" size={20} color="white" />
                </View>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={isProcessing}
              >
                <Animated.View 
                  style={[
                    styles.captureButtonCircle,
                    {
                      transform: [{ scale: captureButtonAnim }],
                    }
                  ]}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.galleryButton}
                onPress={handleGalleryPick}
              >
                <View style={styles.galleryIconContainer}>
                  <Ionicons name="images" size={20} color="white" />
                </View>
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Processing Overlay */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingCard}>
                  <View style={styles.processingIconContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                  </View>
                  <Text style={styles.processingText}>
                    {progress >= 90 ? 'Analyzing artwork...' : 'Processing image...'}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>
                  {progress >= 90 && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setIsProcessing(false);
                        setHasAutoCaptured(false);
                        setProgress(0);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Warning Overlay */}
            {showWarning && (
              <View style={styles.warningOverlay}>
                <View style={styles.warningCard}>
                  {/* Close Button */}
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => {
                      setShowWarning(false);
                      setErrorMessage('');
                    }}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                  
                  <Ionicons 
                    name={errorMessage.includes('No matching media found') || errorMessage.includes('No matches found') 
                      ? "search" 
                      : "warning"
                    } 
                    size={48} 
                    color={errorMessage.includes('No matching media found') || errorMessage.includes('No matches found') 
                      ? "#8B5CF6" 
                      : "#F59E0B"
                    } 
                  />
                  <Text style={styles.warningText}>
                    {errorMessage.includes('No matching media found') || errorMessage.includes('No matches found') 
                      ? 'No matches found' 
                      : 'Processing Error'
                    }
                  </Text>
                  <Text style={styles.warningSubtext}>
                    {errorMessage.includes('No matching media found') || errorMessage.includes('No matches found')
                      ? 'Try scanning a different image or artwork' 
                      : errorMessage || 'An error occurred while processing the image'
                    }
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={resetScanner}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#8B5CF6']}
                      style={styles.retryButtonGradient}
                    >
                      <Ionicons 
                        name={errorMessage.includes('No matching media found') || errorMessage.includes('No matches found') 
                          ? "camera" 
                          : "refresh"
                        } 
                        size={20} 
                        color="white" 
                      />
                      <Text style={styles.retryButtonText}>
                        {errorMessage.includes('No matching media found') || errorMessage.includes('No matches found') 
                          ? 'Scan Again' 
                          : 'Try Again'
                        }
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </CameraView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    zIndex: 1,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    zIndex: 1,
  },
  topButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cutoutArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 220,
    marginTop: -110,
    marginLeft: -150,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanFrame: {
    width: 300,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#8B5CF6',
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanningLine: {
    position: 'absolute',
    width: 300,
    height: 3,
    backgroundColor: '#8B5CF6',
    opacity: 0.9,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  centerFocus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  countdownCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  instructionContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  instructionSubtext: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },
  countdownContainer: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
    paddingTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  retakeButton: {
    alignItems: 'center',
    flex: 1,
  },
  retakeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  captureButton: {
    alignItems: 'center',
    flex: 1,
  },
  captureButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  galleryButton: {
    alignItems: 'center',
    flex: 1,
  },
  galleryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 25,
    padding: 35,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  processingIconContainer: {
    marginBottom: 20,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 25,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  warningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  warningText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
