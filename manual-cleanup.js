#!/usr/bin/env node

// Manual Storyboard Cleanup - Alternative approach
// This script provides a more robust cleanup with better error handling

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const STORYBOARDS_DIR = "src/tempobook/storyboards";

// Essential storyboards to keep
const ESSENTIAL_PATTERNS = [
  "AdvancedRobustnessValidation",
  "MasterImplementation",
  "RealTimeExecution",
  "MasterHealth",
  "ComprehensiveValidation",
  "ComprehensiveOrchestration",
  "Phase5AdvancedAnalytics",
  "DOHRealTimeCompliance",
  "UnifiedAnalytics",
];

function safeRemoveDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      // Use system rm command for better reliability
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: "ignore" });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: "ignore" });
      }
      return true;
    }
  } catch (error) {
    console.warn(
      `⚠️  Failed to remove ${path.basename(dirPath)}: ${error.message}`,
    );
    return false;
  }
  return false;
}

function isEssentialStoryboard(dirName) {
  return ESSENTIAL_PATTERNS.some(
    (pattern) =>
      dirName.toLowerCase().includes(pattern.toLowerCase()) ||
      pattern.toLowerCase().includes(dirName.toLowerCase()),
  );
}

function manualCleanup() {
  console.log("🧹 Starting manual storyboard cleanup...");

  if (!fs.existsSync(STORYBOARDS_DIR)) {
    console.log("❌ Storyboards directory not found");
    return;
  }

  let storyboardDirs;
  try {
    storyboardDirs = fs
      .readdirSync(STORYBOARDS_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (error) {
    console.error("❌ Error reading storyboards directory:", error.message);
    return;
  }

  console.log(`📊 Found ${storyboardDirs.length} storyboard directories`);

  let removedCount = 0;
  let keptCount = 0;
  let errorCount = 0;

  // Sort directories to process smaller ones first
  storyboardDirs.sort();

  for (const dirName of storyboardDirs) {
    const dirPath = path.join(STORYBOARDS_DIR, dirName);

    if (isEssentialStoryboard(dirName)) {
      console.log(`✅ Keeping essential: ${dirName}`);
      keptCount++;
    } else {
      if (safeRemoveDirectory(dirPath)) {
        console.log(`🗑️  Removed: ${dirName}`);
        removedCount++;
      } else {
        errorCount++;
      }
    }

    // Progress indicator for large numbers
    if ((removedCount + keptCount + errorCount) % 50 === 0) {
      console.log(
        `📦 Progress: ${removedCount + keptCount + errorCount}/${storyboardDirs.length}`,
      );
    }
  }

  console.log("\n📈 Manual Cleanup Summary:");
  console.log(`   - Removed: ${removedCount} storyboards`);
  console.log(`   - Kept: ${keptCount} essential storyboards`);
  console.log(`   - Errors: ${errorCount} failed removals`);
  console.log(`   - Total processed: ${storyboardDirs.length}`);

  // Verify cleanup
  try {
    const remainingCount = fs.readdirSync(STORYBOARDS_DIR).length;
    console.log(`\n🔍 Verification: ${remainingCount} storyboards remaining`);

    if (remainingCount <= 15) {
      console.log("🎉 Cleanup successful! Storyboard count is now manageable.");
    } else {
      console.log(
        "⚠️  Still many storyboards remaining. May need additional cleanup.",
      );
    }
  } catch (error) {
    console.error("❌ Error verifying cleanup:", error.message);
  }
}

// Execute cleanup
if (require.main === module) {
  try {
    manualCleanup();
  } catch (error) {
    console.error("❌ Manual cleanup failed:", error.message);
    process.exit(1);
  }
}

module.exports = { manualCleanup, isEssentialStoryboard };
