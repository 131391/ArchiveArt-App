import { API_CONFIG, buildUrl } from '@/constants/Api';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [hasAutoCaptured, setHasAutoCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoCaptureTimer, setAutoCaptureTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const cameraRef = useRef<any>(null);

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
    }
  }, [permission]);

  useEffect(() => {
    const onBackPress = () => {
      try {
        router.canGoBack() ? router.back() : router.replace('/welcome');
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
    if (isReady && !isScanning && !hasAutoCaptured) {
      // Give camera more time to stabilize on iOS
      const timer = setTimeout(() => {
        console.log('⏰ Auto-capture timer triggered');
        handleAutoCapture();
      }, 3000); // Increased from 2000ms to 3000ms for iOS stability

      setAutoCaptureTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isReady, isScanning, hasAutoCaptured]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCaptureTimer) {
        clearTimeout(autoCaptureTimer);
      }
    };
  }, [autoCaptureTimer]);

  const handleAutoCapture = async () => {
    if (isScanning) return;

    console.log('🤖 Auto-capturing image...');
    setHasAutoCaptured(true);
    await captureAndProcessImage();
  };

  const captureAndProcessImage = async () => {
    if (isScanning) return;
    if (!permission?.granted || !isReady) {
      console.log('⏳ Camera not ready or permission not granted');
      return;
    }

    console.log('🔍 Starting scan process...');
    setIsScanning(true);
    setIsProcessing(true);
    setProgress(0);
    const progTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p));
    }, 200);

    try {
      // Capture image then send as multipart/form-data
      console.log('📸 Capturing image...');
      const photo = await (async () => {
        const cam = cameraRef.current;
        if (!cam) {
          console.log('❌ Camera ref is null');
          return null;
        }
        
        try {
          // Use the correct CameraView API for expo-camera v16+
          const result = await cam.takePicture({ 
            quality: 0.8, // Higher quality for better recognition
            skipProcessing: false, // Allow processing for better results
            base64: false,
            exif: false
          });
          console.log('✅ Camera capture successful:', result);
          return result;
        } catch (error) {
          console.log('❌ Camera capture error:', error);
          return null;
        }
      })();

      if (!photo || !('uri' in photo) || !photo.uri) {
        console.log('❌ Failed to capture image - photo object:', photo);
        console.log('❌ Camera state - isReady:', isReady, 'permission granted:', permission?.granted);
        // Show centering warning only for camera capture issues
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return;
      }

      console.log('✅ Image captured successfully:', photo.uri);

      // Use captured image directly; keep quality low to reduce size
      const uploadUri = (photo as any).uri as string;

      const form = new FormData();
      form.append('threshold', '5');
      // React Native FormData file object - using 'image' field name as per API
      const file: any = { uri: uploadUri, name: 'scan.jpg', type: 'image/jpeg' };
      // @ts-ignore - RN FormData supports { uri, name, type }
      form.append('image', file);

      const apiUrl = buildUrl(API_CONFIG.MATCH_ENDPOINT);
      console.log('🌐 Hitting API:', apiUrl);
      console.log('📤 Request payload:', { threshold: '5', image: 'file object' });

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          // Let fetch set proper multipart boundary
          Accept: 'application/json',
        },
        body: form as any,
      });

      console.log('📡 API Response Status:', res.status, res.statusText);
      try {
        const headersObj: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        console.log('📡 API Response Headers:', headersObj);
      } catch {}

      const json = await res.json().catch((parseError) => {
        console.log('❌ Failed to parse JSON response:', parseError);
        return null;
      });

      console.log('📥 API Response Body:', JSON.stringify(json, null, 2));

      if (!res.ok || !json?.success) {
        console.log('❌ API request failed or returned error');
        // Navigate to no-match on backend errors
        router.push('/no-match');
        return;
      }

      const match = Array.isArray(json.matches) && json.matches.length > 0 ? json.matches[0] : null;
      if (!match) {
        console.log('❌ No matches found in response');
        router.push('/no-match');
        return;
      }

      console.log('✅ Match found:', match);
      const mediaType = (match.media_type || '').toLowerCase();
      // Build full media URL - API returns file_path like "/uploads/media/filename.mp4"
      const mediaUrl = match.file_path
        ? (match.file_path.startsWith('http')
            ? match.file_path
            : `${API_CONFIG.BASE_URL}/uploads/media/${match.file_path}`)
        : '';
      console.log('🎬 Navigating to media player with:', { url: mediaUrl, type: mediaType });

      router.push({ pathname: '/media-player', params: { url: mediaUrl, type: mediaType } });
    } catch (e) {
      console.log('❌ Scan process error:', e);
      router.push('/no-match');
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
      setProgress(100);
      clearInterval(progTimer);
      console.log('🏁 Scan process completed');
    }
  };

  const processSelectedImage = async (imageUri: string) => {
    if (isScanning) return;

    console.log('🔍 Starting API call with selected image...');
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

      const apiUrl = buildUrl(API_CONFIG.MATCH_ENDPOINT);
      console.log('🌐 Hitting API with selected image:', apiUrl);
      console.log('📤 Request payload:', { threshold: '5', image: 'file object' });

      setIsProcessing(true);
      setProgress(0);
      const progTimer = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 5 : p));
      }, 200);

      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          // Let fetch set proper multipart boundary
          Accept: 'application/json',
        },
        body: form as any,
      });

      console.log('📡 API Response Status:', apiRes.status, apiRes.statusText);
      try {
        const headersObj2: Record<string, string> = {};
        apiRes.headers.forEach((value, key) => {
          headersObj2[key] = value;
        });
        console.log('📡 API Response Headers:', headersObj2);
      } catch {}

      const json = await apiRes.json().catch((parseError) => {
        console.log('❌ Failed to parse JSON response:', parseError);
        return null;
      });

      console.log('📥 API Response Body:', JSON.stringify(json, null, 2));

      if (!apiRes.ok || !json?.success) {
        console.log('❌ API request failed or returned error');
        router.push('/no-match');
        return;
      }

      const match = Array.isArray(json.matches) && json.matches.length > 0 ? json.matches[0] : null;
      if (!match) {
        console.log('❌ No matches found in response');
        router.push('/no-match');
        return;
      }

      console.log('✅ Match found:', match);
      const mediaType = (match.media_type || '').toLowerCase();
      // Build full media URL - API returns file_path like "/uploads/media/filename.mp4"
      const mediaUrl = match.file_path
        ? (match.file_path.startsWith('http')
            ? match.file_path
            : `${API_CONFIG.BASE_URL}/uploads/media/${match.file_path}`)
        : '';
      console.log('🎬 Navigating to media player with:', { url: mediaUrl, type: mediaType });

      router.push({ pathname: '/media-player', params: { url: mediaUrl, type: mediaType } });
    } catch (e) {
      console.log('❌ API call error with selected image:', e);
      router.push('/no-match');
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
      setProgress(100);
      // Clear any possible timer from above block
      // We defensively clear multiple times; safe if undefined
      try { /* noop */ } finally {}
      console.log('🏁 Image picker API call completed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appName}>ArchivArt</Text>
        <View style={styles.topBtn} />
      </View>
      {permission?.granted ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            onCameraReady={() => {
              console.log('📷 Camera is ready');
              setIsReady(true);
            }}
            onMountError={(error) => {
              console.log('❌ Camera mount error:', error);
              setShowWarning(true);
              setTimeout(() => setShowWarning(false), 3000);
            }}
            autofocus="on"
            enableTorch={isTorchOn}
            facing="back"
            mode="picture"
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
            {showWarning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Camera issue detected. Please try again or use the gallery option.
                </Text>
              </View>
            )}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[styles.circleBtn, isScanning && { opacity: 0.6 }]}
                disabled={isScanning}
                onPress={captureAndProcessImage}
              >
                <Ionicons name="scan" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, isScanning && { opacity: 0.6 }]}
                disabled={isScanning}
                onPress={async () => {
                  if (isScanning) return;

                  console.log('📁 Opening image picker...');

                  // Request permissions first
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    console.log('❌ Media library permission denied');
                    return;
                  }

                  console.log('✅ Media library permission granted');
                  const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                  });

                  if (!res.canceled && res.assets?.[0]?.uri) {
                    const selectedImage = res.assets[0];
                    console.log('📁 Image selected from library:', selectedImage.uri);

                    // Process selected image using the same function
                    await processSelectedImage(selectedImage.uri);
                  } else {
                    console.log('📁 Image picker canceled or no image selected');
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
            </View>
          </View>
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.permissionView]}>
          <Text style={{ color: '#fff' }}>Camera permission is required.</Text>
        </View>
      )}
    </View>
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
  warningContainer: {
    position: 'absolute',
    top: frameSize + 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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