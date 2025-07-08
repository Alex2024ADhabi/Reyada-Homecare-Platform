#!/usr/bin/env node

// Comprehensive Storyboard Cleanup Script
// Removes duplicate and unused storyboard files

const fs = require("fs");
const path = require("path");

const STORYBOARDS_DIR = "src/tempobook/storyboards";
const ESSENTIAL_STORYBOARDS = [
  "AdvancedRobustnessValidationStoryboard",
  "MasterImplementationDashboard",
  "RealTimeExecutionMonitor",
  "MasterHealthDashboard",
  "ComprehensiveValidation",
  "MasterImplementationController",
  "ComprehensiveOrchestrationDashboard",
  "Phase5AdvancedAnalyticsOrchestrator",
  "DOHRealTimeComplianceDashboard",
  "UnifiedAnalyticsDashboard",
];

function cleanupStoryboards() {
  console.log("🧹 Starting storyboard cleanup...");

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

  // Process in batches to avoid overwhelming the system
  const batchSize = 50;
  for (let i = 0; i < storyboardDirs.length; i += batchSize) {
    const batch = storyboardDirs.slice(i, i + batchSize);

    batch.forEach((dirName) => {
      const dirPath = path.join(STORYBOARDS_DIR, dirName);

      // Check if this is an essential storyboard
      const isEssential = ESSENTIAL_STORYBOARDS.some(
        (essential) =>
          dirName.includes(essential) || essential.includes(dirName),
      );

      if (!isEssential) {
        try {
          if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`🗑️  Removed: ${dirName}`);
            removedCount++;
          }
        } catch (error) {
          console.warn(`⚠️  Failed to remove ${dirName}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`✅ Kept essential: ${dirName}`);
        keptCount++;
      }
    });

    // Small delay between batches
    if (i + batchSize < storyboardDirs.length) {
      console.log(
        `📦 Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(storyboardDirs.length / batchSize)}`,
      );
    }
  }

  console.log(`\n📈 Cleanup Summary:`);
  console.log(`   - Removed: ${removedCount} storyboards`);
  console.log(`   - Kept: ${keptCount} essential storyboards`);
  console.log(`   - Errors: ${errorCount} failed removals`);
  console.log(`   - Total processed: ${storyboardDirs.length}`);

  return { removedCount, keptCount, errorCount, total: storyboardDirs.length };
}

// Run cleanup with error handling
try {
  const result = cleanupStoryboards();
  if (result && result.removedCount > 0) {
    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`✨ Removed ${result.removedCount} unnecessary storyboards`);
  }
} catch (error) {
  console.error("❌ Cleanup failed:", error.message);
  process.exit(1);
}
