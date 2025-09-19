#!/bin/bash

# Android SHA1 Key Generator Script
# This script generates and displays the SHA1 key for Android development

echo "🔑 Android SHA1 Key Generator"
echo "=============================="
echo ""

# Check if debug keystore exists
if [ ! -f ~/.android/debug.keystore ]; then
    echo "⚠️  Debug keystore not found. Creating one..."
    mkdir -p ~/.android
    keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    echo "✅ Debug keystore created successfully!"
    echo ""
fi

echo "📋 SHA1 and SHA256 Fingerprints:"
echo "================================"
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -E "(SHA1|SHA256)"

echo ""
echo "📁 Keystore Location: ~/.android/debug.keystore"
echo "🔐 Store Password: android"
echo "🔑 Key Password: android"
echo "🏷️  Alias: androiddebugkey"
echo ""
echo "💡 Usage:"
echo "   - Use SHA1 for Google Services (Firebase, Google Sign-In)"
echo "   - Use SHA256 for newer Google services"
echo "   - This is for development only"
echo "   - Generate release keystore for production"
