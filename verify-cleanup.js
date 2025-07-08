#!/usr/bin/env node

// Simple cleanup verification script
const fs = require("fs");
const path = require("path");

function verifyCleanup() {
  console.log("🔍 Verifying cleanup results...");

  const results = {
    success: true,
    issues: [],
  };

  // Check storyboards count
  const storyboardsDir = "src/tempobook/storyboards";
  if (fs.existsSync(storyboardsDir)) {
    try {
      const count = fs.readdirSync(storyboardsDir).length;
      console.log(`📊 Storyboards remaining: ${count}`);

      if (count > 20) {
        results.issues.push(`Too many storyboards remaining: ${count}`);
        results.success = false;
      } else {
        console.log("✅ Storyboard count is acceptable");
      }

      // List remaining storyboards
      if (count > 0 && count <= 20) {
        console.log("📋 Remaining storyboards:");
        fs.readdirSync(storyboardsDir).forEach((dir) => {
          console.log(`   - ${dir}`);
        });
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
      if (
        content.includes("import React") &&
        content.includes("export default routes")
      ) {
        console.log("✅ Routes file is valid");
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

  // Check essential config files
  const configFiles = ["vite.config.ts", "tsconfig.json", "package.json"];
  configFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      results.issues.push(`Missing config file: ${file}`);
      results.success = false;
    }
  });

  // Summary
  console.log("\n📈 Verification Summary:");
  if (results.success) {
    console.log("🎉 All checks passed! Cleanup was successful.");
  } else {
    console.log(`❌ Found ${results.issues.length} issues:`);
    results.issues.forEach((issue) => console.log(`   - ${issue}`));
  }

  return results;
}

// Run verification
if (require.main === module) {
  try {
    const result = verifyCleanup();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

module.exports = { verifyCleanup };
