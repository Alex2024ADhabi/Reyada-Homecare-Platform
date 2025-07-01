#!/usr/bin/env tsx
/**
 * Healthcare Testing Framework - Main Validation and Execution Script
 * Comprehensive orchestration script that validates, initializes, and runs the entire testing framework
 * Ensures all components work together properly and provides detailed reporting
 */

import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

// Import framework components
import { frameworkSetup } from "./framework-setup";
import { errorRecoverySystem } from "./error-recovery-system";
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import {
  HealthcareTestOrchestrator,
  COMPREHENSIVE_HEALTHCARE_PLAN,
} from "./healthcare-test-orchestrator";
import { ComprehensiveTestRunner } from "./comprehensive-test-runner";
import IntegrationValidator from "./integration-validator";
import { frameworkHealthMonitor } from "./framework-health-monitor";
import { testEnvironmentManager } from "./test-environment-manager";

interface ValidationConfig {
  skipSetup: boolean;
  skipHealthChecks: boolean;
  skipIntegrationTests: boolean;
  skipPerformanceTests: boolean;
  enableVerboseLogging: boolean;
  outputDirectory: string;
  timeoutMs: number;
  maxRetries: number;
}

interface ValidationResult {
  success: boolean;
  message: string;
  duration: number;
  phases: {
    setup: { success: boolean; duration: number; details?: any };
    validation: { success: boolean; duration: number; details?: any };
    healthChecks: { success: boolean; duration: number; details?: any };
    integrationTests: { success: boolean; duration: number; details?: any };
    performanceTests: { success: boolean; duration: number; details?: any };
    cleanup: { success: boolean; duration: number; details?: any };
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
  reports: {
    setupReport?: any;
    validationReport?: any;
    testReport?: any;
    healthReport?: any;
    errorReport?: any;
  };
}

class FrameworkValidator extends EventEmitter {
  private config: ValidationConfig;
  private startTime: number = 0;
  private validator: IntegrationValidator;

  constructor(config?: Partial<ValidationConfig>) {
    super();
    this.config = {
      skipSetup: false,
      skipHealthChecks: false,
      skipIntegrationTests: false,
      skipPerformanceTests: false,
      enableVerboseLogging: true,
      outputDirectory: "test-results",
      timeoutMs: 300000, // 5 minutes
      maxRetries: 3,
      ...config,
    };

    this.validator = new IntegrationValidator({
      enableHealthcareValidation: true,
      enablePerformanceValidation: true,
      enableSecurityValidation: true,
      timeoutMs: this.config.timeoutMs,
    });
  }

  async validateAndRun(): Promise<ValidationResult> {
    this.startTime = performance.now();
    console.log("🚀 Healthcare Testing Framework - Comprehensive Validation");
    console.log("==========================================================\n");

    const result: ValidationResult = {
      success: false,
      message: "",
      duration: 0,
      phases: {
        setup: { success: false, duration: 0 },
        validation: { success: false, duration: 0 },
        healthChecks: { success: false, duration: 0 },
        integrationTests: { success: false, duration: 0 },
        performanceTests: { success: false, duration: 0 },
        cleanup: { success: false, duration: 0 },
      },
      errors: [],
      warnings: [],
      recommendations: [],
      reports: {},
    };

    try {
      // Phase 1: Framework Setup and Initialization
      if (!this.config.skipSetup) {
        const setupResult = await this.runSetupPhase();
        result.phases.setup = setupResult;
        result.reports.setupReport = setupResult.details;

        if (!setupResult.success) {
          result.errors.push("Framework setup failed");
          return this.finalizeResult(result);
        }
      }

      // Phase 2: Framework Validation
      const validationResult = await this.runValidationPhase();
      result.phases.validation = validationResult;
      result.reports.validationReport = validationResult.details;

      if (!validationResult.success) {
        result.errors.push("Framework validation failed");
        return this.finalizeResult(result);
      }

      // Phase 3: Health Checks
      if (!this.config.skipHealthChecks) {
        const healthResult = await this.runHealthCheckPhase();
        result.phases.healthChecks = healthResult;
        result.reports.healthReport = healthResult.details;

        if (!healthResult.success) {
          result.warnings.push("Some health checks failed");
        }
      }

      // Phase 4: Integration Tests
      if (!this.config.skipIntegrationTests) {
        const integrationResult = await this.runIntegrationTestPhase();
        result.phases.integrationTests = integrationResult;

        if (!integrationResult.success) {
          result.errors.push("Integration tests failed");
        }
      }

      // Phase 5: Performance Tests
      if (!this.config.skipPerformanceTests) {
        const performanceResult = await this.runPerformanceTestPhase();
        result.phases.performanceTests = performanceResult;

        if (!performanceResult.success) {
          result.warnings.push("Performance tests had issues");
        }
      }

      // Phase 6: Cleanup
      const cleanupResult = await this.runCleanupPhase();
      result.phases.cleanup = cleanupResult;

      // Determine overall success
      result.success = result.errors.length === 0;
      result.message = result.success
        ? "Framework validation completed successfully"
        : `Framework validation failed with ${result.errors.length} error(s)`;

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);
    } catch (error) {
      result.success = false;
      result.message = `Framework validation crashed: ${error}`;
      result.errors.push(error.toString());
    }

    return this.finalizeResult(result);
  }

  private async runSetupPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("📦 Phase 1: Framework Setup and Initialization");

    try {
      // Initialize test environment
      const environmentId = await testEnvironmentManager.initialize({
        testType: "integration",
        healthcare: {
          enableDOHValidation: true,
          enableDAMANIntegration: true,
          enableJAWDACompliance: true,
          enableHIPAAValidation: true,
          mockPatientData: true,
          mockClinicalData: true,
          mockInsuranceData: true,
          complianceLevel: "strict",
        },
      });

      console.log(`✅ Test environment initialized: ${environmentId}`);

      const setupResult = await frameworkSetup.initializeFramework({
        validateDependencies: true,
        initializeComponents: true,
        runHealthChecks: true,
        createDirectories: true,
        validateEnvironment: true,
        enableLogging: true,
      });

      const duration = performance.now() - startTime;
      console.log(`✅ Setup completed in ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: setupResult.success,
        duration,
        details: { ...setupResult, environmentId },
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Setup failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private async runValidationPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("🔍 Phase 2: Framework Validation");

    try {
      const validationReport =
        await this.validator.validateFrameworkIntegration();
      const duration = performance.now() - startTime;

      const success = validationReport.overallStatus === "passed";
      console.log(
        `${success ? "✅" : "❌"} Validation completed in ${(duration / 1000).toFixed(2)}s\n`,
      );

      return {
        success,
        duration,
        details: validationReport,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Validation failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private async runHealthCheckPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("🏥 Phase 3: Health Checks");

    try {
      // Start health monitoring
      frameworkHealthMonitor.startMonitoring({
        checkInterval: 5000,
        enableAutoRecovery: true,
      });

      // Wait for initial health check
      await new Promise((resolve) => setTimeout(resolve, 6000));

      const healthReport = frameworkHealthMonitor.getCurrentHealth();
      const frameworkHealthCheck =
        await frameworkSetup.validateFrameworkHealth();

      frameworkHealthMonitor.stopMonitoring();

      const duration = performance.now() - startTime;
      const success = frameworkHealthCheck && healthReport.overall !== "failed";

      console.log(
        `${success ? "✅" : "⚠️"} Health checks completed in ${(duration / 1000).toFixed(2)}s\n`,
      );

      return {
        success,
        duration,
        details: {
          frameworkHealth: frameworkHealthCheck,
          systemHealth: healthReport,
        },
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Health checks failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private async runIntegrationTestPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("🔗 Phase 4: Integration Tests");

    try {
      // Run healthcare test orchestrator
      const orchestrator = new HealthcareTestOrchestrator(
        COMPREHENSIVE_HEALTHCARE_PLAN,
      );
      const orchestrationResult = await orchestrator.execute();

      const duration = performance.now() - startTime;
      const success = orchestrationResult.success;

      console.log(
        `${success ? "✅" : "❌"} Integration tests completed in ${(duration / 1000).toFixed(2)}s`,
      );
      console.log(
        `   Tests: ${orchestrationResult.summary.totalTests}, Passed: ${orchestrationResult.summary.passedTests}, Failed: ${orchestrationResult.summary.failedTests}\n`,
      );

      return {
        success,
        duration,
        details: orchestrationResult,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Integration tests failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private async runPerformanceTestPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("⚡ Phase 5: Performance Tests");

    try {
      // Run comprehensive test runner with performance focus
      const testRunner = new ComprehensiveTestRunner({
        healthcareCompliance: true,
        performanceMetrics: true,
        securityValidation: true,
        integrationValidation: false, // Already done
        parallel: true,
        maxWorkers: 2,
        timeout: 30000,
      });

      const performanceResult = await testRunner.runTests();

      const duration = performance.now() - startTime;
      const success = performanceResult.success;

      console.log(
        `${success ? "✅" : "⚠️"} Performance tests completed in ${(duration / 1000).toFixed(2)}s\n`,
      );

      return {
        success,
        duration,
        details: performanceResult,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Performance tests failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private async runCleanupPhase(): Promise<{
    success: boolean;
    duration: number;
    details?: any;
  }> {
    const startTime = performance.now();
    console.log("🧹 Phase 6: Cleanup");

    try {
      // Stop any active monitoring sessions
      if (testExecutionMonitor.isActive()) {
        testExecutionMonitor.stopMonitoring();
      }

      if (globalTestReporter.isActive()) {
        globalTestReporter.stopReporting();
      }

      if (
        frameworkHealthMonitor.isActive &&
        frameworkHealthMonitor.isActive()
      ) {
        frameworkHealthMonitor.stopMonitoring();
      }

      // Cleanup test environment
      await testEnvironmentManager.cleanup();

      // Generate final error report
      const errorReport = errorRecoverySystem.generateRecoveryReport();

      const duration = performance.now() - startTime;
      console.log(`✅ Cleanup completed in ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        duration,
        details: { errorReport },
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Cleanup failed: ${error}\n`);

      return {
        success: false,
        duration,
        details: { error: error.toString() },
      };
    }
  }

  private generateRecommendations(result: ValidationResult): string[] {
    const recommendations: string[] = [];

    if (result.errors.length > 0) {
      recommendations.push(
        "Address all critical errors before using the framework in production",
      );
    }

    if (result.warnings.length > 0) {
      recommendations.push(
        "Review and resolve warnings for optimal performance",
      );
    }

    if (!result.phases.setup.success) {
      recommendations.push(
        "Fix framework setup issues - check dependencies and configuration",
      );
    }

    if (!result.phases.validation.success) {
      recommendations.push(
        "Resolve framework validation failures - check component integration",
      );
    }

    if (!result.phases.healthChecks.success) {
      recommendations.push(
        "Address health check failures - run framework repair if needed",
      );
    }

    if (!result.phases.integrationTests.success) {
      recommendations.push(
        "Fix integration test failures - check component interactions",
      );
    }

    if (!result.phases.performanceTests.success) {
      recommendations.push(
        "Optimize performance issues - check resource usage and bottlenecks",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Framework is ready for production use");
      recommendations.push("Consider setting up continuous monitoring");
      recommendations.push("Review documentation for best practices");
    }

    return recommendations;
  }

  private finalizeResult(result: ValidationResult): ValidationResult {
    result.duration = performance.now() - this.startTime;

    // Save comprehensive report
    this.saveValidationReport(result);

    // Print summary
    this.printValidationSummary(result);

    return result;
  }

  private async saveValidationReport(result: ValidationResult): Promise<void> {
    try {
      const reportDir = path.join(this.config.outputDirectory, "validation");
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const reportPath = path.join(
        reportDir,
        `framework-validation-${timestamp}.json`,
      );

      const report = {
        timestamp: new Date().toISOString(),
        config: this.config,
        result,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch,
          memoryUsage: process.memoryUsage(),
        },
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Validation report saved: ${reportPath}`);
    } catch (error) {
      console.warn(`Failed to save validation report: ${error}`);
    }
  }

  private printValidationSummary(result: ValidationResult): void {
    console.log("\n🎯 Framework Validation Summary");
    console.log("===============================");
    console.log(`Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}\n`);

    // Phase summary
    console.log("📊 Phase Results:");
    Object.entries(result.phases).forEach(([phase, phaseResult]) => {
      const status = phaseResult.success ? "✅" : "❌";
      const duration = (phaseResult.duration / 1000).toFixed(2);
      console.log(`   ${status} ${phase}: ${duration}s`);
    });
    console.log("");

    if (result.errors.length > 0) {
      console.log("🚨 Errors:");
      result.errors.forEach((error) => console.log(`   - ${error}`));
      console.log("");
    }

    if (result.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      result.warnings.forEach((warning) => console.log(`   - ${warning}`));
      console.log("");
    }

    if (result.recommendations.length > 0) {
      console.log("💡 Recommendations:");
      result.recommendations.forEach((rec) => console.log(`   - ${rec}`));
      console.log("");
    }

    if (result.success) {
      console.log("🎉 Healthcare Testing Framework is ready for use!");
    } else {
      console.log(
        "🔧 Please address the issues above before using the framework.",
      );
    }
    console.log("");
  }
}

// Export for programmatic use
export { FrameworkValidator, type ValidationConfig, type ValidationResult };

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: Partial<ValidationConfig> = {};

  // Parse command line arguments
  args.forEach((arg) => {
    switch (arg) {
      case "--skip-setup":
        config.skipSetup = true;
        break;
      case "--skip-health-checks":
        config.skipHealthChecks = true;
        break;
      case "--skip-integration-tests":
        config.skipIntegrationTests = true;
        break;
      case "--skip-performance-tests":
        config.skipPerformanceTests = true;
        break;
      case "--verbose":
        config.enableVerboseLogging = true;
        break;
      case "--quiet":
        config.enableVerboseLogging = false;
        break;
    }
  });

  const validator = new FrameworkValidator(config);

  validator
    .validateAndRun()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("\n💥 Framework validation crashed:", error);
      process.exit(1);
    });
}
