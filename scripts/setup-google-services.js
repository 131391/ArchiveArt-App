#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Google Services files...');

// Create google-services.json from environment variable
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
if (googleServicesJson) {
  const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
  fs.writeFileSync(googleServicesPath, googleServicesJson);
  console.log('✅ Created google-services.json from environment variable');
} else {
  console.warn('⚠️ GOOGLE_SERVICES_JSON environment variable not found');
}

// Create google-services-ios.plist from environment variable
const googleServicesIosPlist = process.env.GOOGLE_SERVICES_IOS_PLIST;
if (googleServicesIosPlist) {
  const googleServicesIosPath = path.join(__dirname, '..', 'google-services-ios.plist');
  fs.writeFileSync(googleServicesIosPath, googleServicesIosPlist);
  console.log('✅ Created google-services-ios.plist from environment variable');
} else {
  console.warn('⚠️ GOOGLE_SERVICES_IOS_PLIST environment variable not found');
}

console.log('🎉 Google Services setup complete!');
