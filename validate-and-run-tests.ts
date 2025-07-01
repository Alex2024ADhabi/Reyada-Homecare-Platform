#!/usr/bin/env tsx
/**
 * Comprehensive Healthcare Testing Framework Validation and Execution
 * This script validates the framework integration and runs comprehensive tests
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface ValidationResult {
  component: string;
  status: "passed" | "failed" | "warning";
  message: string;
  details?: any;
}

class FrameworkValidator {
  private results: ValidationResult[] = [];

  async validateAndExecute(): Promise<boolean> {
    console.log(
      "🏥 Healthcare Platform Testing Framework - Comprehensive Validation & Execution",
    );
    console.log(
      "===============================================================================",
    );
    console.log("");

    try {
      // Step 1: Validate Framework Components
      console.log("🔍 Step 1: Framework Component Validation");
      console.log("=========================================");
      await this.validateFrameworkComponents();

      // Step 2: Validate Dependencies
      console.log("\n📦 Step 2: Dependency Validation");
      console.log("=================================");
      await this.validateDependencies();

      // Step 3: Validate Configuration
      console.log("\n⚙️  Step 3: Configuration Validation");
      console.log("====================================");
      await this.validateConfiguration();

      // Step 4: Run Integration Validation
      console.log("\n🔗 Step 4: Integration Validation");
      console.log("==================================");
      await this.runIntegrationValidation();

      // Step 5: Execute Comprehensive Tests
      console.log("\n🧪 Step 5: Execute Comprehensive Tests");
      console.log("======================================");
      await this.executeComprehensiveTests();

      // Step 6: Generate Final Report
      console.log("\n📊 Step 6: Generate Final Report");
      console.log("=================================");
      await this.generateFinalReport();

      return this.evaluateOverallSuccess();
    } catch (error) {
      console.error("💥 Validation and execution failed:", error);
      return false;
    }
  }

  private async validateFrameworkComponents(): Promise<void> {
    const requiredFiles = [
      "src/test/utils/test-environment-manager.ts",
      "src/test/utils/test-execution-monitor.ts",
      "src/test/utils/test-reporting.ts",
      "src/test/utils/test-helpers.ts",
      "src/test/utils/healthcare-test-orchestrator.ts",
      "src/test/utils/integration-validator.ts",
      "src/test/utils/master-test-executor.ts",
      "src/test/fixtures/healthcare-test-data.ts",
      "scripts/quality-gate-check.js",
      "scripts/generate-comprehensive-report.js",
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.addResult({
          component: path.basename(file),
          status: "passed",
          message: `File exists: ${file}`,
        });
        console.log(`   ✅ ${file}`);
      } else {
        this.addResult({
          component: path.basename(file),
          status: "failed",
          message: `Missing required file: ${file}`,
        });
        console.log(`   ❌ ${file} - MISSING`);
      }
    }
  }

  private async validateDependencies(): Promise<void> {
    const requiredDependencies = [
      "@playwright/test",
      "vitest",
      "tsx",
      "chalk",
      "commander",
      "fs-extra",
      "winston",
    ];

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const dep of requiredDependencies) {
      if (allDeps[dep]) {
        this.addResult({
          component: `dependency-${dep}`,
          status: "passed",
          message: `Dependency available: ${dep}@${allDeps[dep]}`,
        });
        console.log(`   ✅ ${dep}@${allDeps[dep]}`);
      } else {
        this.addResult({
          component: `dependency-${dep}`,
          status: "failed",
          message: `Missing dependency: ${dep}`,
        });
        console.log(`   ❌ ${dep} - MISSING`);
      }
    }
  }

  private async validateConfiguration(): Promise<void> {
    const configFiles = [
      "vitest.config.ts",
      "vitest.config.unit.ts",
      "vitest.config.integration.ts",
      "vitest.config.comprehensive.ts",
      "playwright.config.ts",
      "playwright.accessibility.config.ts",
      "tsconfig.json",
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        this.addResult({
          component: `config-${file}`,
          status: "passed",
          message: `Configuration file exists: ${file}`,
        });
        console.log(`   ✅ ${file}`);
      } else {
        this.addResult({
          component: `config-${file}`,
          status: "warning",
          message: `Configuration file missing: ${file}`,
        });
        console.log(`   ⚠️  ${file} - MISSING (optional)`);
      }
    }
  }

  private async runIntegrationValidation(): Promise<void> {
    try {
      console.log("   Running integration validator...");

      // Import and run the integration validator
      const { IntegrationValidator } = await import(
        "./src/test/utils/integration-validator"
      );
      const validator = new IntegrationValidator();
      const report = await validator.validateFrameworkIntegration();

      this.addResult({
        component: "integration-validation",
        status: report.overallStatus === "failed" ? "failed" : "passed",
        message: `Integration validation: ${report.overallStatus}`,
        details: {
          totalChecks: report.summary.totalChecks,
          passed: report.summary.passed,
          failed: report.summary.failed,
          warnings: report.summary.warnings,
        },
      });

      console.log(
        `   ${report.overallStatus === "failed" ? "❌" : "✅"} Integration validation: ${report.overallStatus}`,
      );
      console.log(`      Total checks: ${report.summary.totalChecks}`);
      console.log(`      Passed: ${report.summary.passed}`);
      console.log(`      Failed: ${report.summary.failed}`);
      console.log(`      Warnings: ${report.summary.warnings}`);
    } catch (error) {
      this.addResult({
        component: "integration-validation",
        status: "failed",
        message: `Integration validation failed: ${error}`,
        details: { error },
      });
      console.log(`   ❌ Integration validation failed: ${error}`);
    }
  }

  private async executeComprehensiveTests(): Promise<void> {
    try {
      console.log("   Running comprehensive test suite...");

      // Run the master test executor in comprehensive mode
      const { MasterTestExecutor } = await import(
        "./src/test/utils/master-test-executor"
      );
      const executor = new MasterTestExecutor({
        mode: "comprehensive",
        skipValidation: true, // We already validated above
        generateReports: true,
        cleanupAfter: true,
      });

      const results = await executor.execute();

      this.addResult({
        component: "comprehensive-tests",
        status: results.success ? "passed" : "failed",
        message: `Comprehensive tests: ${results.success ? "passed" : "failed"}`,
        details: {
          totalPhases: results.summary.totalPhases,
          passedPhases: results.summary.passedPhases,
          failedPhases: results.summary.failedPhases,
          totalDuration: results.summary.totalDuration,
        },
      });

      console.log(
        `   ${results.success ? "✅" : "❌"} Comprehensive tests: ${results.success ? "passed" : "failed"}`,
      );
      console.log(`      Total phases: ${results.summary.totalPhases}`);
      console.log(`      Passed phases: ${results.summary.passedPhases}`);
      console.log(`      Failed phases: ${results.summary.failedPhases}`);
      console.log(
        `      Duration: ${(results.summary.totalDuration / 1000).toFixed(2)}s`,
      );
    } catch (error) {
      this.addResult({
        component: "comprehensive-tests",
        status: "failed",
        message: `Comprehensive tests failed: ${error}`,
        details: { error },
      });
      console.log(`   ❌ Comprehensive tests failed: ${error}`);
    }
  }

  private async generateFinalReport(): Promise<void> {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        overallStatus: this.evaluateOverallSuccess() ? "passed" : "failed",
        summary: {
          totalChecks: this.results.length,
          passed: this.results.filter((r) => r.status === "passed").length,
          failed: this.results.filter((r) => r.status === "failed").length,
          warnings: this.results.filter((r) => r.status === "warning").length,
        },
        results: this.results,
        recommendations: this.generateRecommendations(),
      };

      // Ensure test-results directory exists
      if (!fs.existsSync("test-results")) {
        fs.mkdirSync("test-results", { recursive: true });
      }

      fs.writeFileSync(
        "test-results/framework-validation-report.json",
        JSON.stringify(report, null, 2),
      );

      console.log(
        "   ✅ Final validation report saved to test-results/framework-validation-report.json",
      );
    } catch (error) {
      console.log(`   ❌ Failed to generate final report: ${error}`);
    }
  }

  private addResult(result: Omit<ValidationResult, "timestamp">): void {
    this.results.push({
      ...result,
      timestamp: new Date().toISOString(),
    } as ValidationResult);
  }

  private evaluateOverallSuccess(): boolean {
    const failed = this.results.filter((r) => r.status === "failed").length;
    return failed === 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failed = this.results.filter((r) => r.status === "failed");
    const warnings = this.results.filter((r) => r.status === "warning");

    if (failed.length > 0) {
      recommendations.push(
        `Address ${failed.length} failed validation(s) before proceeding to production`,
      );
      failed.forEach((f) => {
        recommendations.push(`Fix: ${f.message}`);
      });
    }

    if (warnings.length > 0) {
      recommendations.push(
        `Review ${warnings.length} warning(s) for potential improvements`,
      );
    }

    if (failed.length === 0 && warnings.length === 0) {
      recommendations.push(
        "All validations passed - framework is ready for production use",
      );
      recommendations.push(
        "Consider setting up CI/CD pipeline with automated testing",
      );
      recommendations.push("Schedule regular healthcare compliance audits");
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  const validator = new FrameworkValidator();

  try {
    const success = await validator.validateAndExecute();

    console.log("\n🎯 Final Summary");
    console.log("================");
    console.log(`Overall Status: ${success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(
      "Healthcare Platform Testing Framework validation and execution completed.",
    );
    console.log("");

    if (success) {
      console.log(
        "🎉 Congratulations! Your healthcare testing framework is successfully implemented and ready for use.",
      );
      console.log("📋 Next steps:");
      console.log("   1. Review the generated reports in test-results/");
      console.log("   2. Set up CI/CD pipeline integration");
      console.log("   3. Schedule regular compliance audits");
      console.log("   4. Train team members on the testing framework");
    } else {
      console.log(
        "⚠️  Some issues were found. Please review the validation report and address the failed items.",
      );
      console.log(
        "📋 Check test-results/framework-validation-report.json for detailed information.",
      );
    }

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("💥 Validation crashed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { FrameworkValidator };
