// Conditional import for Google Sign-In (only available in development builds)
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
  console.warn('Google Sign-In module not available in this environment (Expo Go)');
}

// Google Sign-In Configuration
// NOTE: Replace these placeholder values with your actual Google OAuth credentials
// See GOOGLE_CREDENTIALS_SETUP.md for detailed setup instructions

export const GOOGLE_CONFIG = {
  // Web Client ID (from Google Cloud Console)
  webClientId: '245858141100-e7tbpirmi8a3dot5sib3fc7nmlg16vam.apps.googleusercontent.com',
  
  // iOS Client ID (from Google Cloud Console)
  iosClientId: '245858141100-64maf1nnom0omlleevt52cudkepm5vgi.apps.googleusercontent.com',
  
  // Android Client ID (from Google Cloud Console)
  androidClientId: '245858141100-m7osihh7l439n0967plqq58org8pcl1s.apps.googleusercontent.com',
  
  // iOS URL Scheme (for deep linking)
  iosUrlScheme: 'com.googleusercontent.apps.245858141100-64maf1nnom0omlleevt52cudkepm5vgi',
};

// Check if Google Sign-In native module is available
export const isGoogleSignInAvailable = (): boolean => {
  return GoogleSignin !== null && GoogleSignin !== undefined && GoogleSignin.configure !== undefined;
};

// Configure Google Sign-In
export const configureGoogleSignIn = (): void => {
  if (!isGoogleSignInAvailable()) {
    console.warn('Google Sign-In not available in this environment');
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_CONFIG.webClientId,
      iosClientId: GOOGLE_CONFIG.iosClientId,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
    console.log('Google Sign-In configured successfully');
  } catch (error) {
    console.error('Failed to configure Google Sign-In:', error);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!isGoogleSignInAvailable()) {
    throw new Error('Google Sign-In is not available in this environment. Please use a development build or production build.');
  }

  try {
    // Check if user has already signed in
    await GoogleSignin.hasPreviousSignIn();
    await GoogleSignin.signIn();
    
    // Get the user's ID token
    const tokens = await GoogleSignin.getTokens();
    const userInfo = await GoogleSignin.getCurrentUser();
    
    if (!userInfo || !userInfo.user || !tokens.idToken) {
      throw new Error('Failed to get user information from Google');
    }

    return {
      success: true,
      user: {
        id: userInfo.user.id,
        name: userInfo.user.name,
        email: userInfo.user.email,
        photo: userInfo.user.photo,
      },
      idToken: tokens.idToken,
    };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    
    if (statusCodes) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in was cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        throw new Error('Sign in required');
      }
    }
    
    throw new Error(error.message || 'Google Sign-In failed');
  }
};

// Sign out from Google
export const signOutFromGoogle = async (): Promise<void> => {
  if (!isGoogleSignInAvailable()) {
    console.warn('Google Sign-In not available, skipping sign out');
    return;
  }

  try {
    await GoogleSignin.signOut();
    console.log('Google Sign-Out successful');
  } catch (error) {
    console.error('Google Sign-Out error:', error);
    throw error;
  }
};

// Complete Google authentication flow (login or register)
export const completeGoogleAuthFlow = async () => {
  try {
    console.log('🔐 Starting Google authentication flow...');
    
    if (!isGoogleSignInAvailable()) {
      return {
        success: false,
        error: 'GOOGLE_SIGNIN_NOT_AVAILABLE',
        message: 'Google Sign-In is not available in this environment. Please use a development build or production build.',
      };
    }

    // Step 1: Sign in with Google
    const googleResult = await signInWithGoogle();
    
    if (!googleResult.success) {
      return {
        success: false,
        error: 'GOOGLE_SIGNIN_FAILED',
        message: 'Google Sign-In failed',
      };
    }

    console.log('🔐 Google Sign-In successful:', {
      id: googleResult.user.id,
      email: googleResult.user.email,
      name: googleResult.user.name,
    });

    // Step 2: Prepare data for backend
    const googleData = {
      user: googleResult.user,
      idToken: googleResult.idToken,
    };

    return {
      success: true,
      googleData,
      message: 'Google authentication successful',
    };

  } catch (error: any) {
    console.error('🔐 Google authentication flow error:', error);
    
    // Handle specific error cases
    if (error.message === 'Sign in was cancelled by user') {
      return {
        success: false,
        error: 'USER_CANCELLED',
        message: 'Sign in was cancelled by user',
      };
    } else if (error.message === 'Google Play Services not available') {
      return {
        success: false,
        error: 'PLAY_SERVICES_ERROR',
        message: 'Google Play Services not available',
      };
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection',
      };
    } else if (error.message.includes('not available in this environment')) {
      return {
        success: false,
        error: 'GOOGLE_SIGNIN_NOT_AVAILABLE',
        message: error.message,
      };
    } else {
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred during Google authentication',
      };
    }
  }
};

// Check if user is signed in to Google
export const isSignedInToGoogle = async (): Promise<boolean> => {
  if (!isGoogleSignInAvailable()) {
    return false;
  }

  try {
    return await GoogleSignin.hasPreviousSignIn();
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

// Get current Google user
export const getCurrentGoogleUser = async () => {
  if (!isGoogleSignInAvailable()) {
    return null;
  }

  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo?.user || null;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};
