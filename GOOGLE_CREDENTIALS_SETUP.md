# Google OAuth Credentials Setup

This file explains how to set up your Google OAuth credentials for the ArchivArtApp.

## 🔑 **Required Credentials**

To use Google Sign-In, you need to replace the placeholder values in the following files with your actual Google OAuth credentials:

### **1. config/google-signin.ts**
Replace these placeholder values:
- `YOUR_WEB_CLIENT_ID` → Your Web Client ID
- `YOUR_WEB_SECRET_KEY` → Your Web Client Secret
- `YOUR_IOS_CLIENT_ID` → Your iOS Client ID
- `YOUR_ANDROID_CLIENT_ID` → Your Android Client ID

### **2. google-services.json**
Replace these placeholder values:
- `YOUR_PROJECT_NUMBER` → Your Google Cloud Project Number
- `YOUR_PROJECT_ID` → Your Google Cloud Project ID
- `YOUR_ANDROID_CLIENT_ID` → Your Android Client ID
- `YOUR_WEB_CLIENT_ID` → Your Web Client ID
- `YOUR_SHA1_FINGERPRINT` → Your Android SHA1 Fingerprint
- `YOUR_ANDROID_API_KEY` → Your Android API Key

### **3. google-services-ios.plist**
Replace these placeholder values:
- `YOUR_IOS_CLIENT_ID` → Your iOS Client ID
- `YOUR_PROJECT_NUMBER` → Your Google Cloud Project Number
- `YOUR_PROJECT_ID` → Your Google Cloud Project ID
- `YOUR_IOS_API_KEY` → Your iOS API Key
- `YOUR_IOS_APP_ID` → Your iOS App ID

### **4. app.json**
Replace these placeholder values:
- `YOUR_IOS_CLIENT_ID` → Your iOS Client ID (in two places)

## 📋 **How to Get Your Credentials**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google Sign-In API**
4. **Create OAuth 2.0 credentials**:
   - Web application (for server-side)
   - iOS application
   - Android application
5. **Download the configuration files**:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS (rename to `google-services-ios.plist`)

## ⚠️ **Security Notes**

- **Never commit real credentials** to version control
- **Use environment variables** in production
- **Keep your client secrets secure**
- **Regularly rotate your credentials**

## 🚀 **After Setup**

Once you've replaced all placeholder values with your actual credentials:

1. **Test in development build** (Google Sign-In doesn't work in Expo Go)
2. **Build and test on device**:
   ```bash
   npx eas build --platform android --profile development
   ```
3. **Verify Google Sign-In works** in your app

## 📞 **Support**

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all credentials are correctly replaced
3. Ensure your Google Cloud project has the correct APIs enabled
4. Test with a development build (not Expo Go)
