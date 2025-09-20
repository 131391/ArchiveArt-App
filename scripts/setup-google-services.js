#!/usr/bin/env node

const fs = require('fs');
const path = require('path');



// Create google-services.json from environment variable
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
if (googleServicesJson) {
  const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
  fs.writeFileSync(googleServicesPath, googleServicesJson);

} else {

}

// Create google-services-ios.plist from environment variable
const googleServicesIosPlist = process.env.GOOGLE_SERVICES_IOS_PLIST;
if (googleServicesIosPlist) {
  const googleServicesIosPath = path.join(__dirname, '..', 'google-services-ios.plist');
  fs.writeFileSync(googleServicesIosPath, googleServicesIosPlist);

} else {

}


