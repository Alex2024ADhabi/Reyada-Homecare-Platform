#!/usr/bin/env tsx
/**
 * Healthcare Test Orchestration Runner
 * Executes comprehensive testing workflows for the healthcare platform
 */

import {
  HealthcareTestOrchestrator,
  COMPREHENSIVE_HEALTHCARE_PLAN,
  CI_HEALTHCARE_PLAN,
} from "./healthcare-test-orchestrator";
import { globalTestReporter } from "./test-reporting";

// Parse command line arguments
const args = process.argv.slice(2);
const planType = args.includes("--plan")
  ? args[args.indexOf("--plan") + 1]
  : "comprehensive";
const verbose = args.includes("--verbose");
const failFast = args.includes("--fail-fast");

// Set environment variables for verbose output
if (verbose) {
  process.env.VERBOSE_TESTS = "true";
}

async function runOrchestration() {
  console.log("🚀 Healthcare Platform Test Orchestration Runner");
  console.log("================================================");
  console.log(`Plan Type: ${planType}`);
  console.log(`Verbose Mode: ${verbose ? "ON" : "OFF"}`);
  console.log(`Fail Fast: ${failFast ? "ON" : "OFF"}`);
  console.log("");

  try {
    // Select test plan based on argument
    let testPlan;
    switch (planType.toLowerCase()) {
      case "ci":
      case "continuous-integration":
        testPlan = { ...CI_HEALTHCARE_PLAN, failFast };
        break;
      case "comprehensive":
      case "full":
      default:
        testPlan = { ...COMPREHENSIVE_HEALTHCARE_PLAN, failFast };
        break;
    }

    console.log(`📋 Selected Plan: ${planType.toUpperCase()}`);
    console.log(`   Phases: ${testPlan.phases.length}`);
    console.log(`   Global Timeout: ${testPlan.globalTimeout / 1000}s`);
    console.log(
      `   Healthcare Validation: ${testPlan.healthcareValidation ? "ENABLED" : "DISABLED"}`,
    );
    console.log("");

    // Create and execute orchestrator
    const orchestrator = new HealthcareTestOrchestrator(testPlan);
    const success = await orchestrator.executeTestPlan();

    // Generate final report
    console.log("\n📊 Generating Final Report...");
    const finalReport = globalTestReporter.generateComprehensiveReport();

    console.log("\n🎯 Final Results Summary:");
    console.log("========================");
    console.log(`Overall Success: ${success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Total Tests: ${finalReport.summary.totalTests}`);
    console.log(`Success Rate: ${finalReport.summary.successRate.toFixed(1)}%`);
    console.log(`Coverage: ${finalReport.coverage.overall.lines}% lines`);
    console.log(
      `Performance Score: ${finalReport.performance.performanceScore}`,
    );
    console.log(`Security Score: ${finalReport.security.securityScore}`);
    console.log(
      `Accessibility Score: ${finalReport.accessibility.accessibilityScore}`,
    );

    if (finalReport.recommendations.length > 0) {
      console.log("\n💡 Key Recommendations:");
      finalReport.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log("\n📁 Reports Generated:");
    console.log("   - test-results/comprehensive-test-report.json");
    console.log("   - test-results/test-report.html");
    console.log("   - test-results/junit-report.xml");
    console.log("   - test-results/orchestration-results.json");

    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("💥 Orchestration failed:", error);
    process.exit(1);
  }
}

// Handle process signals
process.on("SIGINT", () => {
  console.log("\n⚠️  Received SIGINT, shutting down gracefully...");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Received SIGTERM, shutting down gracefully...");
  process.exit(1);
});

// Run orchestration
runOrchestration().catch((error) => {
  console.error("💥 Unhandled error:", error);
  process.exit(1);
});
