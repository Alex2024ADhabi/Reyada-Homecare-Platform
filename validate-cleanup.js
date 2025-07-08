#!/usr/bin/env node

// Comprehensive Cleanup Validation Script
// Checks the health of the codebase after cleanup

const fs = require("fs");
const path = require("path");

function validateCleanup() {
  console.log("🔍 Validating cleanup results...");

  const results = {
    routes: false,
    storyboards: false,
    components: false,
    config: false,
    errors: [],
  };

  // Check routes file
  try {
    const routesPath = "src/tempobook/routes.js";
    if (fs.existsSync(routesPath)) {
      const routesContent = fs.readFileSync(routesPath, "utf8");
      if (
        routesContent.includes("import React") &&
        routesContent.includes("export default routes")
      ) {
        results.routes = true;
        console.log("✅ Routes file is valid");
      } else {
        results.errors.push("Routes file missing essential imports/exports");
      }
    } else {
      results.errors.push("Routes file not found");
    }
  } catch (error) {
    results.errors.push(`Routes validation error: ${error.message}`);
  }

  // Check storyboards directory
  try {
    const storyboardsDir = "src/tempobook/storyboards";
    if (fs.existsSync(storyboardsDir)) {
      const storyboardCount = fs.readdirSync(storyboardsDir).length;
      console.log(`📊 Storyboards remaining: ${storyboardCount}`);
      results.storyboards = storyboardCount < 20; // Should be much less now
      if (results.storyboards) {
        console.log("✅ Storyboards directory cleaned successfully");
      } else {
        results.errors.push(
          `Too many storyboards remaining: ${storyboardCount}`,
        );
      }

      // List remaining storyboards for verification
      if (storyboardCount > 0 && storyboardCount < 30) {
        console.log("📋 Remaining storyboards:");
        const remaining = fs.readdirSync(storyboardsDir);
        remaining.forEach((dir) => console.log(`   - ${dir}`));
      }
    } else {
      results.errors.push("Storyboards directory not found");
    }
  } catch (error) {
    results.errors.push(`Storyboards validation error: ${error.message}`);
  }

  // Check essential storyboards exist
  try {
    const essentialStoryboards = [
      "src/storyboards/AdvancedRobustnessValidationStoryboard.tsx",
      "src/storyboards/PredictiveRiskAssessmentStoryboard.tsx",
    ];

    let foundCount = 0;
    essentialStoryboards.forEach((storyboard) => {
      if (fs.existsSync(storyboard)) {
        foundCount++;
        console.log(
          `✅ Found essential storyboard: ${path.basename(storyboard)}`,
        );
      } else {
        results.errors.push(`Missing essential storyboard: ${storyboard}`);
      }
    });

    results.components = foundCount === essentialStoryboards.length;
  } catch (error) {
    results.errors.push(`Components validation error: ${error.message}`);
  }

  // Check config files
  try {
    const configFiles = ["vite.config.ts", "tsconfig.json", "package.json"];
    let validConfigs = 0;

    configFiles.forEach((configFile) => {
      if (fs.existsSync(configFile)) {
        validConfigs++;
        console.log(`✅ Config file exists: ${configFile}`);
      } else {
        results.errors.push(`Missing config file: ${configFile}`);
      }
    });

    results.config = validConfigs === configFiles.length;
  } catch (error) {
    results.errors.push(`Config validation error: ${error.message}`);
  }

  // Summary
  console.log("\n📈 Validation Summary:");
  console.log(`   - Routes: ${results.routes ? "✅" : "❌"}`);
  console.log(`   - Storyboards: ${results.storyboards ? "✅" : "❌"}`);
  console.log(`   - Components: ${results.components ? "✅" : "❌"}`);
  console.log(`   - Config: ${results.config ? "✅" : "❌"}`);

  if (results.errors.length > 0) {
    console.log("\n❌ Errors found:");
    results.errors.forEach((error) => console.log(`   - ${error}`));
  } else {
    console.log("\n🎉 All validations passed!");
  }

  return results;
}

// Run validation with error handling
try {
  const result = validateCleanup();
  if (result.errors.length === 0) {
    console.log("\n🎉 All validations passed! Cleanup was successful.");
    process.exit(0);
  } else {
    console.log(`\n⚠️  Found ${result.errors.length} validation issues.`);
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Validation failed:", error.message);
  process.exit(1);
}
