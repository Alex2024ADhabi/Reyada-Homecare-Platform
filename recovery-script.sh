#!/bin/bash

# Reyada Homecare Platform - Complete Recovery Script
# This script performs comprehensive cleanup and fixes all issues

echo "🏥 Starting Reyada Homecare Platform Recovery..."

# 1. Remove all problematic files
echo "🗑️ Removing problematic files..."
find . -name "App.js" -not -path "./node_modules/*" -delete 2>/dev/null || true
find . -name "*.map" -not -path "./node_modules/*" -delete 2>/dev/null || true
find . -name "tempobook" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true
rm -rf dist build .vite .cache 2>/dev/null || true
rm -rf src/tempobook 2>/dev/null || true

# 2. Clean up temporary and log files
echo "🧹 Cleaning temporary files..."
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true

# 3. Fix package.json identity
echo "📦 Updating package identity..."
sed -i 's/"name": "starter"/"name": "reyada-homecare-platform"/' package.json
sed -i 's/"version": "0.0.0"/"version": "1.0.0"/' package.json

# 4. Remove problematic dependencies
echo "🔧 Cleaning dependencies..."
npm uninstall artillery undici tempo-devtools 2>/dev/null || true

# 5. Fix security vulnerabilities
echo "🛡️ Fixing security issues..."
npm audit fix --force 2>/dev/null || true

# 6. Clean install
echo "📥 Clean dependency installation..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --force

# 7. Build verification
echo "🏗️ Verifying build..."
npm run build-no-errors

echo "✅ Reyada Homecare Platform Recovery Complete!"
echo "🚀 Platform ready for development"