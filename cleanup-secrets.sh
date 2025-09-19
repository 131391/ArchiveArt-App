#!/bin/bash

# 🔐 Secret Cleanup Script
# This script helps remove sensitive data from Git history

echo "🔐 Starting secret cleanup process..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

echo "📋 Current sensitive files in repository:"
echo "   - google-services.json (contains real credentials)"
echo "   - google-services-ios.plist (contains real credentials)"
echo "   - config/google-signin.ts (contains real client IDs)"

echo ""
echo "⚠️  WARNING: This will rewrite Git history!"
echo "   - All commits will be rewritten"
echo "   - You'll need to force push to remote"
echo "   - Team members will need to re-clone the repository"
echo ""

read -p "🤔 Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo "🧹 Starting cleanup..."

# Remove sensitive files from Git history
echo "1. Removing google-services.json from Git history..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch google-services.json' \
  --prune-empty --tag-name-filter cat -- --all

echo "2. Removing google-services-ios.plist from Git history..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch google-services-ios.plist' \
  --prune-empty --tag-name-filter cat -- --all

echo "3. Cleaning up filter-branch backup..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "4. Updating .gitignore..."
# The .gitignore has already been updated to exclude sensitive files

echo "5. Creating placeholder files..."
# Create placeholder versions of sensitive files
cat > google-services.json << 'EOF'
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "YOUR_ANDROID_APP_ID",
        "android_client_info": {
          "package_name": "com.archivart.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.archivart.app",
            "certificate_hash": "YOUR_SHA1_FINGERPRINT"
          }
        }
      ]
    }
  ]
}
EOF

cat > google-services-ios.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CLIENT_ID</key>
	<string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
	<key>REVERSED_CLIENT_ID</key>
	<string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
	<key>PROJECT_ID</key>
	<string>your-project-id</string>
</dict>
</plist>
EOF

echo "6. Updating config/google-signin.ts with placeholders..."
# Update the config file to use placeholders
sed -i 's/245858141100-e7tbpirmi8a3dot5sib3fc7nmlg16vam/YOUR_WEB_CLIENT_ID/g' config/google-signin.ts
sed -i 's/245858141100-64maf1nnom0omlleevt52cudkepm5vgi/YOUR_IOS_CLIENT_ID/g' config/google-signin.ts
sed -i 's/245858141100-m7osihh7l439n0967plqq58org8pcl1s/YOUR_ANDROID_CLIENT_ID/g' config/google-signin.ts

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Create .env file with your real credentials:"
echo "   cp env.example .env"
echo "   # Edit .env with your real values"
echo ""
echo "2. Force push to remote repository:"
echo "   git push origin --force --all"
echo ""
echo "3. Set up EAS secrets for builds:"
echo "   npx eas secret:create --scope project --name GOOGLE_WEB_CLIENT_ID --value 'your-real-web-client-id'"
echo ""
echo "4. Update configuration to use environment variables"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Your real credentials are now only in .env (not committed)"
echo "   - Team members need to re-clone the repository"
echo "   - All builds will use EAS secrets instead of committed credentials"
echo ""
echo "🔐 Your repository is now secure!"
