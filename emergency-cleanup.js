#!/usr/bin/env node

// EMERGENCY DEEP CLEANUP SCRIPT
// This script performs aggressive cleanup to resolve all platform issues

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const STORYBOARDS_DIR = "src/tempobook/storyboards";
const DYNAMIC_DIR = "src/tempobook/dynamic";

// ONLY keep these 5 essential storyboards
const ESSENTIAL_STORYBOARDS = [
  "AdvancedRobustnessValidationStoryboard",
  "MasterHealthDashboardStoryboard",
  "UnifiedAnalyticsDashboardStoryboard",
  "BusinessIntelligenceDashboardStoryboard",
  "PredictiveRiskAssessmentStoryboard",
];

function emergencyCleanup() {
  console.log("🚨 STARTING EMERGENCY DEEP CLEANUP...");
  console.log("⚠️  This will remove 95% of storyboards and reset the platform");

  let totalRemoved = 0;
  let totalKept = 0;
  let errors = [];

  // Phase 1: Clean storyboards directory
  if (fs.existsSync(STORYBOARDS_DIR)) {
    try {
      const storyboardDirs = fs
        .readdirSync(STORYBOARDS_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      console.log(`📊 Found ${storyboardDirs.length} storyboard directories`);

      for (const dirName of storyboardDirs) {
        const dirPath = path.join(STORYBOARDS_DIR, dirName);

        // Check if this is an essential storyboard
        const isEssential = ESSENTIAL_STORYBOARDS.some(
          (essential) =>
            dirName.includes(essential) || essential.includes(dirName),
        );

        if (!isEssential) {
          try {
            // Force remove directory
            if (process.platform === "win32") {
              execSync(`rmdir /s /q "${dirPath}"`, { stdio: "ignore" });
            } else {
              execSync(`rm -rf "${dirPath}"`, { stdio: "ignore" });
            }
            totalRemoved++;

            if (totalRemoved % 50 === 0) {
              console.log(`🗑️  Removed ${totalRemoved} storyboards...`);
            }
          } catch (error) {
            errors.push(`Failed to remove ${dirName}: ${error.message}`);
          }
        } else {
          console.log(`✅ Keeping essential: ${dirName}`);
          totalKept++;
        }
      }
    } catch (error) {
      errors.push(`Error reading storyboards directory: ${error.message}`);
    }
  }

  // Phase 2: Clean dynamic directory
  if (fs.existsSync(DYNAMIC_DIR)) {
    try {
      execSync(`rm -rf "${DYNAMIC_DIR}"`, { stdio: "ignore" });
      console.log(`🗑️  Removed dynamic directory`);
    } catch (error) {
      errors.push(`Failed to remove dynamic directory: ${error.message}`);
    }
  }

  // Phase 3: Clear node_modules cache
  try {
    console.log("🧹 Clearing build caches...");

    // Clear Vite cache
    if (fs.existsSync("node_modules/.vite")) {
      execSync("rm -rf node_modules/.vite", { stdio: "ignore" });
    }

    // Clear dist
    if (fs.existsSync("dist")) {
      execSync("rm -rf dist", { stdio: "ignore" });
    }

    console.log("✅ Build caches cleared");
  } catch (error) {
    errors.push(`Cache cleanup error: ${error.message}`);
  }

  // Phase 4: Verify cleanup
  let remainingCount = 0;
  if (fs.existsSync(STORYBOARDS_DIR)) {
    try {
      remainingCount = fs.readdirSync(STORYBOARDS_DIR).length;
    } catch (error) {
      errors.push(`Error counting remaining storyboards: ${error.message}`);
    }
  }

  // Summary
  console.log("\n📈 EMERGENCY CLEANUP SUMMARY:");
  console.log(`   🗑️  Removed: ${totalRemoved} storyboards`);
  console.log(`   ✅ Kept: ${totalKept} essential storyboards`);
  console.log(`   📊 Remaining: ${remainingCount} storyboards`);
  console.log(`   ❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    errors.slice(0, 10).forEach((error) => console.log(`   - ${error}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  if (remainingCount <= 10) {
    console.log("\n🎉 EMERGENCY CLEANUP SUCCESSFUL!");
    console.log("✨ Platform should now be stable for development");
    return true;
  } else {
    console.log("\n⚠️  Cleanup incomplete - manual intervention may be needed");
    return false;
  }
}

// Execute emergency cleanup
if (require.main === module) {
  try {
    const success = emergencyCleanup();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("💥 EMERGENCY CLEANUP FAILED:", error.message);
    process.exit(1);
  }
}

module.exports = { emergencyCleanup };
