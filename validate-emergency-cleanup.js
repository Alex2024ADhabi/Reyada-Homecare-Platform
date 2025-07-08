#!/usr/bin/env node

// EMERGENCY CLEANUP VALIDATION SCRIPT
// Validates that the emergency cleanup was successful

const fs = require("fs");
const path = require("path");

function validateEmergencyCleanup() {
  console.log("🔍 Validating emergency cleanup results...");

  const results = {
    success: true,
    issues: [],
    summary: {
      storyboards: 0,
      routes: 0,
      cacheCleared: false,
      configValid: false,
    },
  };

  // Check storyboards directory
  const storyboardsDir = "src/tempobook/storyboards";
  if (fs.existsSync(storyboardsDir)) {
    try {
      const storyboardCount = fs.readdirSync(storyboardsDir).length;
      results.summary.storyboards = storyboardCount;

      console.log(`📊 Storyboards remaining: ${storyboardCount}`);

      if (storyboardCount <= 10) {
        console.log("✅ Storyboard count is optimal (≤10)");
      } else if (storyboardCount <= 50) {
        console.log("⚠️ Storyboard count is acceptable (≤50)");
        results.issues.push(
          `Storyboard count could be lower: ${storyboardCount}`,
        );
      } else {
        console.log(`❌ Too many storyboards remaining: ${storyboardCount}`);
        results.issues.push(`Excessive storyboards: ${storyboardCount}`);
        results.success = false;
      }

      // List remaining storyboards
      if (storyboardCount > 0 && storyboardCount <= 20) {
        console.log("📋 Remaining storyboards:");
        const remaining = fs.readdirSync(storyboardsDir);
        remaining.forEach((dir) => console.log(`   - ${dir}`));
      }
    } catch (error) {
      results.issues.push(`Error reading storyboards: ${error.message}`);
      results.success = false;
    }
  } else {
    results.issues.push("Storyboards directory not found");
    results.success = false;
  }

  // Check routes file
  const routesFile = "src/tempobook/routes.js";
  if (fs.existsSync(routesFile)) {
    try {
      const content = fs.readFileSync(routesFile, "utf8");

      // Count routes in file
      const routeMatches = content.match(/path:\s*"/g);
      const routeCount = routeMatches ? routeMatches.length : 0;
      results.summary.routes = routeCount;

      console.log(`📋 Routes configured: ${routeCount}`);

      if (routeCount <= 5) {
        console.log("✅ Route count is optimal (≤5)");
      } else if (routeCount <= 10) {
        console.log("⚠️ Route count is acceptable (≤10)");
      } else {
        console.log(`❌ Too many routes: ${routeCount}`);
        results.issues.push(`Excessive routes: ${routeCount}`);
        results.success = false;
      }

      // Check for essential imports
      if (
        content.includes("import React") &&
        content.includes("export default")
      ) {
        console.log("✅ Routes file structure is valid");
      } else {
        results.issues.push("Routes file missing essential imports/exports");
        results.success = false;
      }
    } catch (error) {
      results.issues.push(`Error reading routes file: ${error.message}`);
      results.success = false;
    }
  } else {
    results.issues.push("Routes file not found");
    results.success = false;
  }

  // Check cache cleanup
  const cacheDirectories = [
    "node_modules/.vite",
    "dist",
    "src/tempobook/dynamic",
  ];

  let cachesCleaned = 0;
  cacheDirectories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      cachesCleaned++;
    }
  });

  results.summary.cacheCleared = cachesCleaned === cacheDirectories.length;
  if (results.summary.cacheCleared) {
    console.log("✅ Build caches cleared successfully");
  } else {
    console.log(
      `⚠️ Some caches may still exist (${cachesCleaned}/${cacheDirectories.length} cleared)`,
    );
  }

  // Check essential config files
  const configFiles = [
    "vite.config.ts",
    "tsconfig.json",
    "package.json",
    "src/App.tsx",
  ];
  let validConfigs = 0;

  configFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      validConfigs++;
      console.log(`✅ ${file} exists`);
    } else {
      results.issues.push(`Missing config file: ${file}`);
      results.success = false;
    }
  });

  results.summary.configValid = validConfigs === configFiles.length;

  // Final summary
  console.log("\n📈 EMERGENCY CLEANUP VALIDATION SUMMARY:");
  console.log(`   📊 Storyboards: ${results.summary.storyboards}`);
  console.log(`   📋 Routes: ${results.summary.routes}`);
  console.log(
    `   🧹 Caches cleared: ${results.summary.cacheCleared ? "Yes" : "No"}`,
  );
  console.log(
    `   ⚙️ Config valid: ${results.summary.configValid ? "Yes" : "No"}`,
  );
  console.log(`   ❌ Issues: ${results.issues.length}`);

  if (results.issues.length > 0) {
    console.log("\n❌ Issues found:");
    results.issues.forEach((issue) => console.log(`   - ${issue}`));
  }

  if (results.success) {
    console.log("\n🎉 EMERGENCY CLEANUP VALIDATION PASSED!");
    console.log("✨ Platform is ready for stable development");
  } else {
    console.log("\n⚠️ VALIDATION ISSUES DETECTED");
    console.log("🔧 Additional cleanup may be needed");
  }

  return results;
}

// Run validation
if (require.main === module) {
  try {
    const result = validateEmergencyCleanup();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

module.exports = { validateEmergencyCleanup };
