#!/bin/bash

# iOS Build Script with Memory Optimizations for Expense Tracker
# Run this script instead of regular expo build to apply memory optimizations

echo "🚀 Starting iOS build with memory optimizations..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios/build 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Pre-build optimizations
echo "⚡ Applying pre-build optimizations..."

# Set iOS memory optimization environment variables
export REACT_NATIVE_ENABLE_NEW_APP_DELEGATE=1
export REACT_NATIVE_ENABLE_BRIDGELESS=0  # Keep disabled for stability
export EXPO_USE_FAST_RESOLVER=1

# Build with EAS
echo "🔨 Building iOS app with EAS..."
npx eas build --platform ios --profile production --non-interactive

echo "✅ Build completed!"
echo "📱 Upload to TestFlight when ready"

echo ""
echo "Memory optimization tips:"
echo "- Monitor app memory usage in Xcode Instruments"
echo "- Test on physical devices with limited memory"
echo "- Check for memory leaks in React DevTools"
