# ArchivArt Production Build Guide

This guide will help you create a production build of the ArchivArt app with full Google authentication integration.

## Prerequisites

1. **EAS CLI installed**: `npm install -g @expo/eas-cli`
2. **Expo account**: Logged in with `eas login`
3. **Google OAuth credentials**: Properly configured (already done)

## Build Configuration

The app is configured with:
- **Entry Point**: `app/index.tsx` → redirects to `/welcome`
- **Initial Route**: `welcome` screen (not Expo default template)
- **Google Auth**: Fully integrated with production credentials
- **API**: Connected to production server at `https://archivart.onrender.com`

## Production Build Commands

### Android Production Build (AAB for Play Store)
```bash
npm run build:android
# or
eas build --platform android --profile production
```

### iOS Production Build
```bash
npm run build:ios
# or
eas build --platform ios --profile production
```

### Both Platforms
```bash
npm run build:all
# or
eas build --platform all --profile production
```

### Preview Build (for testing)
```bash
npm run build:preview
# or
eas build --platform all --profile preview
```

## Key Features in Production Build

### ✅ Google Authentication
- **Web Client ID**: `245858141100-e7tbpirmi8a3dot5sib3fc7nmlg16vam.apps.googleusercontent.com`
- **iOS Client ID**: `245858141100-64maf1nnom0omlleevt52cudkepm5vgi.apps.googleusercontent.com`
- **Android Client ID**: `245858141100-m7osihh7l439n0967plqq58org8pcl1s.apps.googleusercontent.com`
- **Deep Linking**: Properly configured for both platforms

### ✅ App Flow
1. **Welcome Screen** → Main entry point (not Expo template)
2. **Authentication** → Google Sign-In or manual login
3. **Scanner** → Professional camera interface with visual effects
4. **Media Player** → Reels-style video player
5. **Profile** → User management

### ✅ Production Environment
- **API Base URL**: `https://archivart.onrender.com`
- **Mock Mode**: Disabled
- **Environment**: Production
- **Build Type**: AAB (Android) / IPA (iOS)

## Troubleshooting

### If app shows Expo default template:
1. Ensure `app/index.tsx` exists and redirects to `/welcome`
2. Check `app/_layout.tsx` has `initialRouteName="welcome"`
3. Verify `app.json` has proper scheme configuration

### If Google Auth doesn't work:
1. Verify Google Services files are present:
   - `google-services.json` (Android)
   - `google-services-ios.plist` (iOS)
2. Check environment variables in `eas.json`
3. Ensure proper bundle identifiers match Google Console

### Build Issues:
1. Clear cache: `eas build --clear-cache`
2. Check EAS status: `eas build:list`
3. View build logs: `eas build:view [BUILD_ID]`

## File Structure
```
app/
├── index.tsx          # Entry point → redirects to welcome
├── _layout.tsx        # Root layout with initial route
├── welcome.tsx        # Main welcome screen
├── auth/              # Authentication screens
├── scanner.tsx        # Camera scanner
├── media-player.tsx   # Video player
└── profile.tsx        # User profile
```

## Environment Variables (Production)
```env
NODE_ENV=production
API_BASE_URL=https://archivart.onrender.com
API_MOCK_MODE=false
GOOGLE_WEB_CLIENT_ID=245858141100-e7tbpirmi8a3dot5sib3fc7nmlg16vam.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=245858141100-64maf1nnom0omlleevt52cudkepm5vgi.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=245858141100-m7osihh7l439n0967plqq58org8pcl1s.apps.googleusercontent.com
GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.245858141100-64maf1nnom0omlleevt52cudkepm5vgi
```

## Next Steps After Build

1. **Download build**: Use EAS dashboard or CLI
2. **Test thoroughly**: Install on device and test all features
3. **Submit to stores**: 
   - Android: Upload AAB to Google Play Console
   - iOS: Upload IPA to App Store Connect
4. **Monitor**: Check crash reports and user feedback

The production build will start with the welcome screen and include full Google authentication integration!
