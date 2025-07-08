#!/bin/bash

# Comprehensive Cleanup Script
# Handles all cleanup tasks with proper error handling

echo "🧹 Starting comprehensive cleanup..."

# Function to count files safely
count_storyboards() {
    if [ -d "src/tempobook/storyboards" ]; then
        find src/tempobook/storyboards -maxdepth 1 -type d | wc -l
    else
        echo "0"
    fi
}

# Function to list storyboards safely
list_storyboards() {
    if [ -d "src/tempobook/storyboards" ]; then
        echo "📋 Current storyboards:"
        find src/tempobook/storyboards -maxdepth 1 -type d -name "*-*" | head -20 | while read dir; do
            echo "   - $(basename "$dir")"
        done
    fi
}

# Initial count
echo "📊 Initial storyboard count: $(count_storyboards)"

# Try Node.js cleanup first
echo "\n🔧 Attempting Node.js cleanup..."
if command -v node >/dev/null 2>&1; then
    if [ -f "manual-cleanup.js" ]; then
        echo "Running manual-cleanup.js..."
        node manual-cleanup.js
    elif [ -f "cleanup-storyboards.js" ]; then
        echo "Running cleanup-storyboards.js..."
        node cleanup-storyboards.js
    else
        echo "⚠️  No cleanup scripts found"
    fi
else
    echo "⚠️  Node.js not found, using shell commands"
fi

# Fallback: Direct shell cleanup
echo "\n🔧 Fallback shell cleanup..."
if [ -d "src/tempobook/storyboards" ]; then
    # Keep only essential storyboards
    ESSENTIAL_PATTERNS=("AdvancedRobustness" "MasterImplementation" "RealTimeExecution" "MasterHealth" "ComprehensiveValidation")
    
    find src/tempobook/storyboards -maxdepth 1 -type d -name "*-*" | while read dir; do
        dirname=$(basename "$dir")
        keep=false
        
        for pattern in "${ESSENTIAL_PATTERNS[@]}"; do
            if [[ "$dirname" == *"$pattern"* ]]; then
                keep=true
                break
            fi
        done
        
        if [ "$keep" = false ]; then
            echo "🗑️  Removing: $dirname"
            rm -rf "$dir" 2>/dev/null || echo "⚠️  Failed to remove $dirname"
        else
            echo "✅ Keeping: $dirname"
        fi
    done
fi

# Final verification
echo "\n📊 Final storyboard count: $(count_storyboards)"
list_storyboards

# Validate routes file
echo "\n🔍 Validating routes file..."
if [ -f "src/tempobook/routes.js" ]; then
    if grep -q "import React" src/tempobook/routes.js && grep -q "export default routes" src/tempobook/routes.js; then
        echo "✅ Routes file is valid"
    else
        echo "⚠️  Routes file may need updates"
    fi
else
    echo "❌ Routes file not found"
fi

# Check essential files
echo "\n🔍 Checking essential files..."
for file in "vite.config.ts" "tsconfig.json" "package.json"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo "\n🎉 Comprehensive cleanup completed!"
