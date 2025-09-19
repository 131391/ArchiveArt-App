# 🔐 Secure Configuration Setup Guide

## Overview
This guide shows how to securely manage social login credentials and other sensitive configuration data.

## 🚨 Current Issue
We currently have real Google OAuth credentials committed to Git, which is a security risk.

## ✅ Recommended Approach

### 1. Environment Variables
Use environment variables to store sensitive data:

```bash
# Create .env file (DO NOT commit this)
cp env.example .env

# Edit .env with your real credentials
nano .env
```

### 2. Update Configuration Files
Modify `config/google-signin.ts` to use environment variables:

```typescript
import Constants from 'expo-constants';

export const GOOGLE_CONFIG = {
  webClientId: Constants.expoConfig?.extra?.googleWebClientId || 'fallback-id',
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId || 'fallback-id',
  androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId || 'fallback-id',
  iosUrlScheme: Constants.expoConfig?.extra?.googleIosUrlScheme || 'fallback-scheme',
};
```

### 3. Update app.json
Add environment variable references:

```json
{
  "expo": {
    "extra": {
      "googleWebClientId": process.env.GOOGLE_WEB_CLIENT_ID,
      "googleIosClientId": process.env.GOOGLE_IOS_CLIENT_ID,
      "googleAndroidClientId": process.env.GOOGLE_ANDROID_CLIENT_ID,
      "googleIosUrlScheme": process.env.GOOGLE_IOS_URL_SCHEME
    }
  }
}
```

## 🔧 EAS Build Configuration

### 1. Set Environment Variables in EAS
```bash
# Set production environment variables
npx eas secret:create --scope project --name GOOGLE_WEB_CLIENT_ID --value "your-web-client-id"

# Set for specific build profiles
npx eas secret:create --scope project --name GOOGLE_IOS_CLIENT_ID --value "your-ios-client-id"
```

### 2. Update eas.json
```json
{
  "build": {
    "development": {
      "env": {
        "GOOGLE_WEB_CLIENT_ID": "your-web-client-id",
        "GOOGLE_IOS_CLIENT_ID": "your-ios-client-id"
      }
    }
  }
}
```

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Data
- ✅ Use `.env` files (in .gitignore)
- ✅ Use EAS secrets for builds
- ✅ Use placeholder values in code
- ❌ Never commit real credentials

### 2. Use Different Credentials
- **Development**: Use test/sandbox credentials
- **Production**: Use production credentials
- **Staging**: Use staging credentials

### 3. Rotate Credentials Regularly
- Change OAuth client secrets monthly
- Update API keys quarterly
- Monitor for unauthorized usage

## 🚀 Implementation Steps

### Step 1: Clean Current Repository
```bash
# Remove sensitive files from Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch google-services.json google-services-ios.plist' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to clean history
git push origin --force --all
```

### Step 2: Set Up Environment Variables
```bash
# Create .env file
cp env.example .env

# Add your real credentials to .env
# (This file is in .gitignore and won't be committed)
```

### Step 3: Update Configuration
- Modify `config/google-signin.ts` to use environment variables
- Update `app.json` to reference environment variables
- Test locally with `.env` file

### Step 4: Configure EAS Builds
```bash
# Set secrets for EAS builds
npx eas secret:create --scope project --name GOOGLE_WEB_CLIENT_ID --value "your-real-web-client-id"
npx eas secret:create --scope project --name GOOGLE_IOS_CLIENT_ID --value "your-real-ios-client-id"
npx eas secret:create --scope project --name GOOGLE_ANDROID_CLIENT_ID --value "your-real-android-client-id"
```

## 📋 Checklist

- [ ] Create `.env` file with real credentials
- [ ] Update `.gitignore` to exclude sensitive files
- [ ] Modify configuration files to use environment variables
- [ ] Set EAS secrets for builds
- [ ] Test locally with environment variables
- [ ] Build and test with EAS secrets
- [ ] Document the setup for team members

## 🔍 Monitoring

### Check for Exposed Credentials
```bash
# Search for potential secrets in code
grep -r "245858141100" . --exclude-dir=node_modules
grep -r "googleusercontent" . --exclude-dir=node_modules
```

### GitHub Security Features
- Enable secret scanning
- Use Dependabot for security updates
- Set up branch protection rules

## 📞 Support

If you need help implementing this secure setup:
1. Review this guide
2. Check EAS documentation for secrets
3. Test with development credentials first
4. Gradually move to production credentials
