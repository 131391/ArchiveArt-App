# Expo Build Troubleshooting Guide

This guide helps resolve common issues with Expo builds and app installation.

## 🔧 **Issues Fixed**

### **1. Icon Dimensions Issue**
- **Problem**: App icon was 1536x1024 (not square)
- **Solution**: Created square version (1024x1024) using ImageMagick
- **Files Updated**: 
  - `assets/images/ALogo-square.png` (new square icon)
  - `app.json` (updated all icon references)

### **2. Missing Peer Dependencies**
- **Problem**: `@expo/metro-runtime` was missing
- **Solution**: Installed with `npm install @expo/metro-runtime --legacy-peer-deps`

### **3. Package Version Mismatches**
- **Problem**: Several packages were out of date
- **Solution**: Updated to compatible versions:
  - `expo-router@~6.0.7`
  - `@types/react@~19.1.10`
  - `eslint-config-expo@~10.0.0`
  - `typescript@~5.9.2`

## 🚀 **Build Commands**

### **Development Build**
```bash
# For Android
npx eas build --platform android --profile development

# For iOS
npx eas build --platform ios --profile development

# For both platforms
npx eas build --platform all --profile development
```

### **Preview Build**
```bash
# For Android
npx eas build --platform android --profile preview

# For iOS
npx eas build --platform ios --profile preview
```

### **Production Build**
```bash
# For Android
npx eas build --platform android --profile production

# For iOS
npx eas build --platform ios --profile production
```

## 📱 **Installation Methods**

### **Android APK Installation**
1. Download APK from EAS build
2. Enable "Install from unknown sources" in Android settings
3. Install APK file

### **iOS Installation**
1. Download IPA from EAS build
2. Install via TestFlight or direct installation
3. Trust developer certificate in iOS settings

## 🔍 **Common Build Issues**

### **1. Icon Issues**
- **Error**: "image should be square"
- **Solution**: Ensure all icons are square (same width and height)
- **Check**: Run `file assets/images/your-icon.png` to verify dimensions

### **2. Dependency Conflicts**
- **Error**: "ERESOLVE could not resolve"
- **Solution**: Use `--legacy-peer-deps` flag
- **Command**: `npm install --legacy-peer-deps`

### **3. Missing Dependencies**
- **Error**: "Missing peer dependency"
- **Solution**: Install missing dependencies
- **Check**: Run `npx expo-doctor` to identify issues

### **4. Package Version Mismatches**
- **Error**: "Package version mismatch"
- **Solution**: Update packages to compatible versions
- **Command**: `npx expo install --check`

### **5. Build Configuration Issues**
- **Error**: "Build configuration invalid"
- **Solution**: Check `eas.json` and `app.json` configuration
- **Verify**: Ensure all required fields are present

## 🛠️ **Troubleshooting Steps**

### **Step 1: Check Project Health**
```bash
npx expo-doctor
```

### **Step 2: Verify Dependencies**
```bash
npx expo install --check
```

### **Step 3: Clear Cache**
```bash
npx expo start --clear
```

### **Step 4: Check Build Configuration**
```bash
# Verify EAS configuration
cat eas.json

# Verify app configuration
cat app.json
```

### **Step 5: Test Local Build**
```bash
# Test development build locally
npx expo run:android
npx expo run:ios
```

## 📋 **Build Configuration**

### **EAS Build Profiles**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### **App Configuration**
```json
{
  "expo": {
    "name": "ArchivArtApp",
    "slug": "ArchivArtApp",
    "version": "1.0.0",
    "icon": "./assets/images/ALogo-square.png",
    "android": {
      "package": "com.archivart.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/ALogo-square.png",
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "bundleIdentifier": "com.archivart.app"
    }
  }
}
```

## 🔒 **Security Considerations**

### **Google Services**
- Ensure `google-services.json` and `google-services-ios.plist` are properly configured
- Verify SHA1 fingerprint matches Google Console
- Check package name and bundle ID consistency

### **Permissions**
- Camera permissions for scanning functionality
- Photo library permissions for image uploads
- Network permissions for API calls

## 📊 **Build Status Check**

### **Check Build Status**
```bash
# List recent builds
npx eas build:list

# Get build details
npx eas build:view [BUILD_ID]
```

### **Download Build**
```bash
# Download build artifact
npx eas build:download [BUILD_ID]
```

## 🚨 **Emergency Fixes**

### **If Build Fails Completely**
1. Clear all caches: `npx expo start --clear`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall dependencies: `npm install --legacy-peer-deps`
4. Check configuration: `npx expo-doctor`

### **If App Won't Install**
1. Check device compatibility
2. Verify build profile (development vs production)
3. Check certificate validity (iOS)
4. Verify package name/bundle ID

## 📞 **Support Resources**

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Discord](https://chat.expo.dev/)
- [GitHub Issues](https://github.com/expo/expo/issues)

## ✅ **Verification Checklist**

- [ ] All icons are square (1024x1024)
- [ ] Dependencies are up to date
- [ ] No missing peer dependencies
- [ ] Build configuration is valid
- [ ] Google services are configured
- [ ] Permissions are properly set
- [ ] Package names match across platforms
- [ ] SHA1 fingerprint is correct
- [ ] App can be built successfully
- [ ] App can be installed on device
