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

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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

  // Animated scan line
  const scanAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  useEffect(() => {

    if (!permission || !permission.granted) {

      requestPermission();
    } else {

    }
  }, [permission]);

  useEffect(() => {
    const onBackPress = () => {
      try {
        router.replace('/welcome');
      } catch {
        router.replace('/welcome');
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  // Auto-capture timer effect (run once when ready)
  useEffect(() => {
    if (isReady && cameraInitialized && !isScanning && !hasAutoCaptured && !hasNavigatedAway) {
      // Give camera more time to stabilize on iOS - increased delay for production builds
      const timer = setTimeout(() => {

        handleAutoCapture();
      }, 3000); // Reduced to 3000ms but ensure camera is initialized
      
      setAutoCaptureTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isReady, cameraInitialized, isScanning, hasAutoCaptured, hasNavigatedAway]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCaptureTimer) {
        clearTimeout(autoCaptureTimer);
      }
    };
  }, [autoCaptureTimer]);

  // Reset camera state when screen comes into focus (e.g., returning from video player)
  useFocusEffect(
    useCallback(() => {


      // Only reset if we actually navigated away and came back
      if (hasNavigatedAway) {


        // Reset all camera-related states
        setIsReady(false);
        setCameraInitialized(false);
        setIsScanning(false);
        setIsProcessing(false);
        setProgress(0);
        setHasAutoCaptured(false);
        setRetryCount(0);

        // Clear any existing timer
        if (autoCaptureTimer) {
          clearTimeout(autoCaptureTimer);
          setAutoCaptureTimer(null);
        }

        // Set reinitializing state
        setIsReinitializing(true);

        // Force camera remount by changing key
        setCameraKey(prev => prev + 1);

        // Small delay to ensure camera can reinitialize properly
        const resetTimer = setTimeout(() => {
          setHasNavigatedAway(false); // Reset the flag

        }, 200);

        return () => {
          clearTimeout(resetTimer);
        };
      } else {
        // First time loading or already on this screen

      }
    }, [autoCaptureTimer, hasNavigatedAway])
  );

  const handleAutoCapture = async () => {
    if (isScanning) return;


    setHasAutoCaptured(true);
    await captureAndProcessImage();
  };

  const captureAndProcessImage = async () => {
    if (isScanning) return;
    if (!permission?.granted || !isReady || !cameraInitialized) {

      return;
    }


    setIsScanning(true);
    setIsProcessing(true);
    setProgress(0);
    const progTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p));
    }, 200);

    try {
      // Capture image then send as multipart/form-data

      const photo = await (async () => {
        const cam = cameraRef.current;
        if (!cam) {

          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryCam = cameraRef.current;
          if (!retryCam) {

            return null;
          }
          return retryCam;
        }

        try {
          // For Expo Camera v16+, we need to use the correct API
          let result = null;

          // Debug: Log what methods are available on the camera ref




          // Try different method names that might be available
          const possibleMethods = ['takePictureAsync', 'takePicture', 'captureAsync', 'capture'];

          for (const methodName of possibleMethods) {
            if (typeof cam[methodName] === 'function') {

              try {
                result = await cam[methodName]({
        quality: 0.8,
        base64: false,
                  exif: false
                });

                break;
              } catch (methodError) {

                continue;
              }
            }
          }

          if (!result) {

            return null;
          }

          return result;
        } catch (error) {

          return null;
        }
      })();

      if (!photo || !('uri' in photo) || !photo.uri) {




        // Retry logic with better state management
        if (retryCount < maxRetries) {

          setRetryCount(prev => prev + 1);
          // Reset scanning state before retry
          setIsScanning(false);
          setIsProcessing(false);
          clearInterval(progTimer);
          setTimeout(() => {
            captureAndProcessImage();
          }, 2000);
          return;
        }

        // Show centering warning only for camera capture issues

        return;
      }



      // Use captured image directly; keep quality low to reduce size
      const uploadUri = (photo as any).uri as string;

      const form = new FormData();
      form.append('threshold', '5');
      // React Native FormData file object - using 'image' field name as per API
      const file: any = { uri: uploadUri, name: 'scan.jpg', type: 'image/jpeg' };
      // @ts-ignore - RN FormData supports { uri, name, type }
      form.append('image', file);

      const apiUrl = buildUrl(API_ENDPOINTS.MEDIA.MATCH);




      
      // Log FormData contents


      const res = await AuthService.authenticatedRequest(API_ENDPOINTS.MEDIA.MATCH, {
        method: 'POST',
        headers: {
          // Let fetch set proper multipart boundary
          Accept: 'application/json',
        },
        body: form as any,
      });





      
      try {
        const headersObj: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          headersObj[key] = value;
        });

      } catch (headerError) {

      }

      // Try to get response text first to see raw response
      let responseText = '';
      try {
        responseText = await res.clone().text();

      } catch (textError) {

      }

      const json = await res.json().catch((parseError) => {


        return null;
      });





      if (!res.ok || !json?.success) {

        setHasNavigatedAway(true);
        try {
          router.push('/no-match');

        } catch (navError) {

          router.replace('/no-match');
        }
        return;
      }

      const match = json.match || (Array.isArray(json.matches) && json.matches.length > 0 ? json.matches[0] : null);
      if (!match) {

        setHasNavigatedAway(true);
        try {
          router.push('/no-match');

        } catch (navError) {

          router.replace('/no-match');
        }
        return;
      }


      const mediaType = (match.media_type || '').toLowerCase();

      // Build full media URL - API returns file_path like "filename.mp4" or "/uploads/media/filename.mp4"
      const mediaUrl = match.file_path
        ? (match.file_path.startsWith('http')
            ? match.file_path
            : match.file_path.startsWith('/uploads/media/')
            ? `${API_CONFIG.BASE_URL}${match.file_path}`
            : `${API_CONFIG.BASE_URL}/uploads/media/${match.file_path}`)
        : '';




      
      // Validate URL construction
      try {
        new URL(mediaUrl);

      } catch (urlError) {




      }

      // Set flag to indicate we're navigating away
      setHasNavigatedAway(true);
      try {
        router.push({ pathname: '/media-player', params: { url: mediaUrl, type: mediaType } });

      } catch (navError) {

        // Fallback navigation
        router.replace({ pathname: '/media-player', params: { url: mediaUrl, type: mediaType } });
      }
    } catch (e) {

      setHasNavigatedAway(true);
      router.push('/no-match');
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
      setProgress(100);
      clearInterval(progTimer);

    }
  };

  const processSelectedImage = async (imageUri: string) => {
    if (isScanning) return;


    setIsScanning(true);

    try {
      const form = new FormData();
      form.append('threshold', '5');
      // React Native FormData file object - using 'image' field name as per API
      const file: any = {
        uri: imageUri,
        name: 'selected.jpg',
        type: 'image/jpeg'
      };
      // @ts-ignore - RN FormData supports { uri, name, type }
      form.append('image', file);

      const galleryApiUrl = buildUrl(API_ENDPOINTS.MEDIA.MATCH);



      setIsProcessing(true);
      setProgress(0);
      const progTimer = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 5 : p));
      }, 200);

      const selectedImageApiUrl = buildUrl(API_ENDPOINTS.MEDIA.MATCH);



      
      // Log FormData contents for selected image


      const apiRes = await AuthService.authenticatedRequest(API_ENDPOINTS.MEDIA.MATCH, {
        method: 'POST',
        headers: {
          // Let fetch set proper multipart boundary
          Accept: 'application/json',
        },
        body: form as any,
      });





      
      try {
        const headersObj2: Record<string, string> = {};
        apiRes.headers.forEach((value, key) => {
          headersObj2[key] = value;
        });

      } catch (headerError) {

      }

      // Try to get response text first to see raw response
      let responseText2 = '';
      try {
        responseText2 = await apiRes.clone().text();

      } catch (textError) {

      }

      const json = await apiRes.json().catch((parseError) => {


        return null;
      });





      if (!apiRes.ok || !json?.success) {

        setHasNavigatedAway(true);
        try {
          router.push('/no-match');

        } catch (navError) {

          router.replace('/no-match');
        }
        return;
      }

      const match = json.match || (Array.isArray(json.matches) && json.matches.length > 0 ? json.matches[0] : null);
      if (!match) {

        setHasNavigatedAway(true);
        try {
          router.push('/no-match');

        } catch (navError) {

          router.replace('/no-match');
        }
        return;
      }


      const mediaType = (match.media_type || '').toLowerCase();

      // Build full media URL - API returns file_path like "filename.mp4" or "/uploads/media/filename.mp4"
      const mediaUrl = match.file_path
        ? (match.file_path.startsWith('http')
            ? match.file_path
            : match.file_path.startsWith('/uploads/media/')
            ? `${API_CONFIG.BASE_URL}${match.file_path}`
            : `${API_CONFIG.BASE_URL}/uploads/media/${match.file_path}`)
        : '';




      
      // Validate URL construction
      try {
        new URL(mediaUrl);

      } catch (urlError) {




      }

      // Set flag to indicate we're navigating away
      setHasNavigatedAway(true);
      router.push({ pathname: '/media-player', params: { url: mediaUrl, type: mediaType } });
    } catch (e) {

      setHasNavigatedAway(true);
      router.push('/no-match');
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
      setProgress(100);
      // Clear any possible timer from above block
      // We defensively clear multiple times; safe if undefined
      try { /* noop */ } finally {}

    }
  };



  return (
    <AuthGuard>
      <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/welcome')} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appName}>ArchivArt</Text>
        <View style={styles.topBtn} />
      </View>
      {permission?.granted ? (
        <>
        <CameraView
          key={cameraKey}
            style={StyleSheet.absoluteFill}
            onCameraReady={() => {

              // Minimal delay for better user experience
              setTimeout(() => {
                setIsReady(true);
                setCameraInitialized(true);
                setIsReinitializing(false);

              }, 300);
            }}
            onMountError={(error) => {

              setCameraInitialized(false);

            }}
            autofocus="on"
            enableTorch={isTorchOn}
          facing="back"
            mode="picture"
            pictureSize="1920x1080"
          ref={cameraRef}
          />
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.frame} pointerEvents="none">
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanAnim.interpolate({
                            inputRange: [0, 1],
                          outputRange: [frameSize * 0.1, frameSize * 0.85],
                          }),
                        },
                      ],
                    opacity: isScanning ? 1 : 0.6,
                  },
                ]}
              >
                <LinearGradient colors={["transparent", "rgba(37,117,252,0.9)", "transparent"]} style={{ flex: 1 }} />
              </Animated.View>
            </View>
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={[styles.circleBtn, isScanning && { opacity: 0.6 }]}
                disabled={isScanning || !cameraInitialized}
                onPress={() => {

                  setHasAutoCaptured(true); // Prevent auto-capture from interfering
                  captureAndProcessImage();
                }}
              >
                <Ionicons name="scan" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, isScanning && { opacity: 0.6 }]}
                disabled={isScanning}
                onPress={async () => {
                  if (isScanning) return;



                  // Request permissions first
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {

                    return;
                  }


                  const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                  });

                  if (!res.canceled && res.assets?.[0]?.uri) {
                    const selectedImage = res.assets[0];


                    // Process selected image using the same function
                    await processSelectedImage(selectedImage.uri);
                  } else {

                  }
                }}
              >
                <Ionicons name="image" size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, { left: 24, right: undefined }]}
                onPress={() => setIsTorchOn((v: boolean) => !v)}
                accessibilityLabel="Toggle flash"
              >
                <Ionicons name={isTorchOn ? 'flash' : 'flash-off'} size={26} color="#fff" />
              </TouchableOpacity>
            {isProcessing && (
                <View style={styles.processingBox}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.processingText}>Processing… {progress}%</Text>
              </View>
            )}
              {(!cameraInitialized || isReinitializing) && !isProcessing && (
                <View style={styles.processingBox}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.processingText}>
                    {isReinitializing ? 'Reinitializing camera...' : 'Initializing camera...'}
                  </Text>
                </View>
              )}
              </View>
          </View>
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.permissionView]}>
          <Text style={{ color: '#fff' }}>Camera permission is required.</Text>
        </View>
      )}
      </View>
    </AuthGuard>
  );
}

const { width } = Dimensions.get('window');
const frameSize = width * 0.8;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    paddingTop: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  appName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: frameSize,
    height: frameSize,
    borderColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, top: frameSize * 0.15 },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  circleBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: { position: 'absolute', right: 24, bottom: 12 },
  permissionView: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  processingBox: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  processingText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
});