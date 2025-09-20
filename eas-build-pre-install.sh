#!/bin/bash

# EAS Build Pre-install Hook
# This script runs before npm install during EAS builds

echo "🔧 Setting up Google Services files from environment variables..."

# Create google-services.json from environment variable
if [ ! -z "$GOOGLE_SERVICES_JSON" ]; then
  echo "📱 Creating google-services.json..."
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
  echo "✅ google-services.json created successfully"
else
  echo "❌ GOOGLE_SERVICES_JSON environment variable not found"
  exit 1
fi

# Create google-services-ios.plist from environment variable
if [ ! -z "$GOOGLE_SERVICES_IOS_PLIST" ]; then
  echo "🍎 Creating google-services-ios.plist..."
  echo "$GOOGLE_SERVICES_IOS_PLIST" > google-services-ios.plist
  echo "✅ google-services-ios.plist created successfully"
else
  echo "❌ GOOGLE_SERVICES_IOS_PLIST environment variable not found"
  exit 1
fi

echo "🎉 Google Services files setup complete!"
