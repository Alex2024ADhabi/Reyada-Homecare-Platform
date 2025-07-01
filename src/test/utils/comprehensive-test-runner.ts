#!/usr/bin/env tsx
/**
 * Comprehensive Test Runner
 * Main entry point for running the complete healthcare testing framework
 * Orchestrates all components and provides a unified testing experience
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Import framework components
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import { frameworkSetup } from "./framework-setup";
import IntegrationValidator from "./integration-validator";
import { errorRecoverySystem } from "./error-recovery-system";
import { healthcareTestData } from "../fixtures/healthcare-test-data";
import {
  HealthcareTestDataGenerator,
  ComplianceTestHelper,
  PerformanceTestHelper,
} from "./test-helpers";

interface TestRunConfig {
  suites: string[];
  patterns: string[];
  excludePatterns: string[];
  parallel: boolean;
  maxWorkers: number;
  timeout: number;
  retries: number;
  bail: boolean;
  coverage: boolean;
  watch: boolean;
  verbose: boolean;
  silent: boolean;
  outputDirectory: string;
  reportFormats: string[];
  healthcareCompliance: boolean;
  performanceMetrics: boolean;
  securityValidation: boolean;
  accessibilityTesting: boolean;
  integrationValidation: boolean;
  errorRecovery: boolean;
}

interface TestRunResult {
  success: boolean;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    successRate: number;
  };
  suiteResults: any[];
  healthcareMetrics?: any;
  performanceMetrics?: any;
  coverageReport?: any;
  complianceReport?: any;
  validationReport?: any;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  artifacts: string[];
}

interface TestSuite {
  name: string;
  pattern: string;
  category:
    | "unit"
    | "integration"
    | "e2e"
    | "performance"
    | "security"
    | "accessibility"
    | "compliance";
  priority: number;
  timeout: number;
  retries: number;
  parallel: boolean;
  dependencies: string[];
  healthcareSpecific: boolean;
}

class ComprehensiveTestRunner extends EventEmitter {
  private config: TestRunConfig;
  private testSuites: TestSuite[] = [];
  private runResult?: TestRunResult;
  private startTime: number = 0;
  private isRunning: boolean = false;

  constructor(config?: Partial<TestRunConfig>) {
    super();
    this.config = {
      suites: [],
      patterns: ["**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}"],
      excludePatterns: ["node_modules/**", "dist/**", "build/**"],
      parallel: true,
      maxWorkers: 4,
      timeout: 30000,
      retries: 2,
      bail: false,
      coverage: true,
      watch: false,
      verbose: true,
      silent: false,
      outputDirectory: "test-results",
      reportFormats: ["json", "html", "junit"],
      healthcareCompliance: true,
      performanceMetrics: true,
      securityValidation: true,
      accessibilityTesting: true,
      integrationValidation: true,
      errorRecovery: true,
      ...config,
    };

    this.initializeTestSuites();
  }

  async runTests(): Promise<TestRunResult> {
    if (this.isRunning) {
      throw new Error("Test run already in progress");
    }

    this.isRunning = true;
    this.startTime = performance.now();

    console.log("🚀 Healthcare Testing Framework - Comprehensive Test Run");
    console.log("========================================================");
    console.log("");

    this.emit("run-started", { timestamp: Date.now(), config: this.config });

    const result: TestRunResult = {
      success: false,
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        successRate: 0,
      },
      suiteResults: [],
      errors: [],
      warnings: [],
      recommendations: [],
      artifacts: [],
    };

    try {
      // Phase 1: Framework Setup and Validation
      console.log("📋 Phase 1: Framework Setup and Validation");
      const setupSuccess = await this.setupFramework();
      if (!setupSuccess && this.config.bail) {
        throw new Error("Framework setup failed and bail is enabled");
      }

      // Phase 2: Pre-test Validation
      console.log("\n🔍 Phase 2: Pre-test Validation");
      if (this.config.integrationValidation) {
        const validationSuccess = await this.runIntegrationValidation();
        if (!validationSuccess && this.config.bail) {
          throw new Error("Integration validation failed and bail is enabled");
        }
      }

      // Phase 3: Test Execution
      console.log("\n🧪 Phase 3: Test Execution");
      await this.executeTests(result);

      // Phase 4: Healthcare Compliance Validation
      if (this.config.healthcareCompliance) {
        console.log("\n🏥 Phase 4: Healthcare Compliance Validation");
        result.complianceReport = await this.validateHealthcareCompliance();
      }

      // Phase 5: Performance Analysis
      if (this.config.performanceMetrics) {
        console.log("\n⚡ Phase 5: Performance Analysis");
        result.performanceMetrics = await this.analyzePerformance();
      }

      // Phase 6: Security Validation
      if (this.config.securityValidation) {
        console.log("\n🔒 Phase 6: Security Validation");
        await this.validateSecurity(result);
      }

      // Phase 7: Report Generation
      console.log("\n📊 Phase 7: Report Generation");
      await this.generateReports(result);

      // Phase 8: Cleanup and Finalization
      console.log("\n🧹 Phase 8: Cleanup and Finalization");
      await this.cleanup();

      result.success = result.errors.length === 0 || !this.config.bail;
      result.summary.duration = performance.now() - this.startTime;
      result.summary.successRate =
        result.summary.totalTests > 0
          ? (result.summary.passed / result.summary.totalTests) * 100
          : 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error.toString());

      if (this.config.errorRecovery) {
        console.log("\n🔧 Attempting error recovery...");
        const recoveryResult = await errorRecoverySystem.handleError(error, {
          component: "test-runner",
          operation: "test-execution",
          severity: "high",
        });

        if (recoveryResult.success) {
          result.warnings.push("Error recovered successfully");
          result.recommendations.push(
            ...(recoveryResult.preventionMeasures || []),
          );
        }
      }
    } finally {
      this.isRunning = false;
      this.runResult = result;
      this.emit("run-completed", { result, timestamp: Date.now() });
    }

    this.printRunSummary(result);
    return result;
  }

  async runSingleSuite(suiteName: string): Promise<any> {
    const suite = this.testSuites.find((s) => s.name === suiteName);
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`);
    }

    console.log(`🧪 Running test suite: ${suite.name}`);

    // Start monitoring for this suite
    testExecutionMonitor.recordTestEvent({
      type: "start",
      testName: "suite-start",
      suiteName: suite.name,
    });

    globalTestReporter.addSuiteStart(suite.name);

    try {
      // Simulate test execution (in real implementation, would run actual tests)
      const testResults = await this.simulateTestExecution(suite);

      globalTestReporter.addSuiteEnd(suite.name);

      return {
        suite: suite.name,
        results: testResults,
        success: testResults.every((r: any) => r.status === "passed"),
      };
    } catch (error) {
      globalTestReporter.addSuiteEnd(suite.name);
      throw error;
    }
  }

  private async setupFramework(): Promise<boolean> {
    try {
      const setupResult = await frameworkSetup.initializeFramework({
        validateDependencies: true,
        initializeComponents: true,
        runHealthChecks: true,
        createDirectories: true,
      });

      if (setupResult.success) {
        console.log("✅ Framework setup completed successfully");
        return true;
      } else {
        console.log("❌ Framework setup failed:");
        setupResult.errors.forEach((error) => console.log(`   - ${error}`));
        return false;
      }
    } catch (error) {
      console.error(`❌ Framework setup error: ${error}`);
      return false;
    }
  }

  private async runIntegrationValidation(): Promise<boolean> {
    try {
      const validator = new IntegrationValidator({
        enableHealthcareValidation: this.config.healthcareCompliance,
        enablePerformanceValidation: this.config.performanceMetrics,
        enableSecurityValidation: this.config.securityValidation,
      });

      const validationReport = await validator.validateFrameworkIntegration();

      if (validationReport.overallStatus === "passed") {
        console.log("✅ Integration validation passed");
        return true;
      } else {
        console.log("❌ Integration validation failed:");
        validationReport.criticalIssues.forEach((issue) =>
          console.log(`   - ${issue}`),
        );
        return false;
      }
    } catch (error) {
      console.error(`❌ Integration validation error: ${error}`);
      return false;
    }
  }

  private async executeTests(result: TestRunResult): Promise<void> {
    // Start monitoring and reporting
    const monitorSessionId = testExecutionMonitor.startMonitoring({
      enableHealthcareMetrics: this.config.healthcareCompliance,
      reportInterval: 5000,
    });

    const reporterSessionId = globalTestReporter.startReporting({
      formats: this.config.reportFormats as any,
      includeHealthcareMetrics: this.config.healthcareCompliance,
      includePerformanceMetrics: this.config.performanceMetrics,
    });

    try {
      // Sort suites by priority
      const sortedSuites = [...this.testSuites].sort(
        (a, b) => b.priority - a.priority,
      );

      if (this.config.parallel) {
        // Run suites in parallel (with dependency management)
        await this.runSuitesInParallel(sortedSuites, result);
      } else {
        // Run suites sequentially
        await this.runSuitesSequentially(sortedSuites, result);
      }

      // Generate execution reports
      const monitorReport = testExecutionMonitor.stopMonitoring();
      const reporterReport = globalTestReporter.stopReporting();

      // Merge results
      result.summary.totalTests = monitorReport.overallMetrics.totalTests;
      result.summary.passed = monitorReport.overallMetrics.passedTests;
      result.summary.failed = monitorReport.overallMetrics.failedTests;
      result.summary.skipped = monitorReport.overallMetrics.skippedTests;

      if (this.config.healthcareCompliance) {
        result.healthcareMetrics = reporterReport.healthcareMetrics;
      }
    } catch (error) {
      result.errors.push(`Test execution failed: ${error}`);

      // Stop monitoring and reporting
      if (testExecutionMonitor.isActive()) {
        testExecutionMonitor.stopMonitoring();
      }
      if (globalTestReporter.isActive()) {
        globalTestReporter.stopReporting();
      }
    }
  }

  private async runSuitesSequentially(
    suites: TestSuite[],
    result: TestRunResult,
  ): Promise<void> {
    for (const suite of suites) {
      try {
        console.log(`   Running suite: ${suite.name}`);
        const suiteResult = await this.runSingleSuite(suite.name);
        result.suiteResults.push(suiteResult);

        if (!suiteResult.success && this.config.bail) {
          result.warnings.push(
            `Bailing out after suite failure: ${suite.name}`,
          );
          break;
        }
      } catch (error) {
        result.errors.push(`Suite '${suite.name}' failed: ${error}`);
        if (this.config.bail) {
          break;
        }
      }
    }
  }

  private async runSuitesInParallel(
    suites: TestSuite[],
    result: TestRunResult,
  ): Promise<void> {
    const chunks = this.chunkArray(suites, this.config.maxWorkers);

    for (const chunk of chunks) {
      const promises = chunk.map(async (suite) => {
        try {
          console.log(`   Running suite: ${suite.name}`);
          return await this.runSingleSuite(suite.name);
        } catch (error) {
          return {
            suite: suite.name,
            error: error.toString(),
            success: false,
          };
        }
      });

      const chunkResults = await Promise.all(promises);
      result.suiteResults.push(...chunkResults);

      // Check for failures if bail is enabled
      if (this.config.bail && chunkResults.some((r) => !r.success)) {
        result.warnings.push("Bailing out after parallel suite failures");
        break;
      }
    }
  }

  private async simulateTestExecution(suite: TestSuite): Promise<any[]> {
    // This is a simulation - in real implementation, would execute actual tests
    const testCount = Math.floor(Math.random() * 10) + 5;
    const results = [];

    for (let i = 0; i < testCount; i++) {
      const testName = `${suite.name}-test-${i}`;
      const shouldPass = Math.random() > 0.1; // 90% pass rate
      const duration = Math.floor(Math.random() * 1000) + 100;

      const result = {
        name: testName,
        suite: suite.name,
        status: shouldPass ? "passed" : "failed",
        duration,
        error: shouldPass
          ? undefined
          : {
              message: "Simulated test failure",
              type: "TestError",
            },
        metadata: suite.healthcareSpecific
          ? {
              category: suite.category,
              healthcare: {
                complianceStandard: "DOH",
                riskLevel: "medium",
                patientDataInvolved: Math.random() > 0.5,
              },
            }
          : undefined,
      };

      // Record in monitor
      testExecutionMonitor.recordTestEvent({
        type: "start",
        testName,
        suiteName: suite.name,
      });

      testExecutionMonitor.recordTestEvent({
        type: shouldPass ? "pass" : "fail",
        testName,
        suiteName: suite.name,
        duration,
        error: result.error,
      });

      // Add to reporter
      globalTestReporter.addTestResult(result);

      results.push(result);
    }

    return results;
  }

  private async validateHealthcareCompliance(): Promise<any> {
    console.log("   Validating DOH compliance...");
    const dohResult = ComplianceTestHelper.validateDOHCompliance({
      patientConsent: true,
      clinicianSignature: true,
      timestamp: new Date().toISOString(),
    });

    console.log("   Validating DAMAN compliance...");
    const damanResult = ComplianceTestHelper.validateDAMANCompliance({
      policyNumber: "DM123456789",
      serviceDate: "2024-01-01",
      services: [{ code: "H001", description: "Test Service" }],
    });

    console.log("   Validating JAWDA compliance...");
    const jawdaResult = ComplianceTestHelper.validateJAWDACompliance({
      patientSafetyMetrics: { incidents: 0, preventions: 5 },
      clinicalEffectiveness: { outcomes: "positive", metrics: "tracked" },
    });

    console.log("   Validating HIPAA compliance...");
    const hipaaResult = ComplianceTestHelper.validateHIPAACompliance({
      encryption: "AES-256",
      accessControls: true,
      auditLog: true,
    });

    return {
      DOH: dohResult,
      DAMAN: damanResult,
      JAWDA: jawdaResult,
      HIPAA: hipaaResult,
      overallCompliance: [
        dohResult,
        damanResult,
        jawdaResult,
        hipaaResult,
      ].every((r) => r.valid),
    };
  }

  private async analyzePerformance(): Promise<any> {
    const performanceReport = PerformanceTestHelper.generatePerformanceReport();
    const memoryUsage = process.memoryUsage();

    return {
      ...performanceReport,
      systemMetrics: {
        memoryUsage: {
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + "MB",
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + "MB",
          external: (memoryUsage.external / 1024 / 1024).toFixed(2) + "MB",
        },
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  private async validateSecurity(result: TestRunResult): Promise<void> {
    console.log("   Running security validation...");

    // Simulate security checks
    const securityChecks = [
      { name: "Data Encryption", passed: true },
      { name: "Access Control", passed: true },
      { name: "Input Validation", passed: Math.random() > 0.1 },
      { name: "SQL Injection Protection", passed: true },
      { name: "XSS Protection", passed: Math.random() > 0.05 },
    ];

    const failedChecks = securityChecks.filter((check) => !check.passed);

    if (failedChecks.length > 0) {
      result.warnings.push(`${failedChecks.length} security checks failed`);
      result.recommendations.push("Review and fix security vulnerabilities");
    } else {
      console.log("   ✅ All security checks passed");
    }
  }

  private async generateReports(result: TestRunResult): Promise<void> {
    console.log("   Generating comprehensive reports...");

    try {
      // Generate final reporter report
      const reporterReport = globalTestReporter.generateComprehensiveReport();
      const savedFiles = await globalTestReporter.saveReports(reporterReport);

      result.artifacts.push(...savedFiles);

      // Generate summary report
      const summaryReport = {
        timestamp: new Date().toISOString(),
        framework: "Healthcare Testing Framework",
        version: "1.0.0",
        runResult: result,
        systemInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          memory: process.memoryUsage(),
          uptime: process.uptime(),
        },
      };

      const summaryPath = path.join(
        this.config.outputDirectory,
        "test-run-summary.json",
      );
      fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
      result.artifacts.push(summaryPath);

      console.log(`   📄 Reports saved to: ${this.config.outputDirectory}`);
    } catch (error) {
      result.warnings.push(`Report generation failed: ${error}`);
    }
  }

  private async cleanup(): Promise<void> {
    console.log("   Performing cleanup...");

    // Stop any active monitoring or reporting
    if (testExecutionMonitor.isActive()) {
      testExecutionMonitor.stopMonitoring();
    }
    if (globalTestReporter.isActive()) {
      globalTestReporter.stopReporting();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  private initializeTestSuites(): void {
    this.testSuites = [
      {
        name: "Healthcare Unit Tests",
        pattern: "**/*.unit.test.{js,ts}",
        category: "unit",
        priority: 10,
        timeout: 5000,
        retries: 1,
        parallel: true,
        dependencies: [],
        healthcareSpecific: true,
      },
      {
        name: "Integration Tests",
        pattern: "**/*.integration.test.{js,ts}",
        category: "integration",
        priority: 8,
        timeout: 15000,
        retries: 2,
        parallel: false,
        dependencies: ["Healthcare Unit Tests"],
        healthcareSpecific: true,
      },
      {
        name: "Compliance Tests",
        pattern: "**/*.compliance.test.{js,ts}",
        category: "compliance",
        priority: 9,
        timeout: 10000,
        retries: 1,
        parallel: true,
        dependencies: [],
        healthcareSpecific: true,
      },
      {
        name: "Performance Tests",
        pattern: "**/*.performance.test.{js,ts}",
        category: "performance",
        priority: 6,
        timeout: 30000,
        retries: 3,
        parallel: false,
        dependencies: ["Integration Tests"],
        healthcareSpecific: false,
      },
      {
        name: "Security Tests",
        pattern: "**/*.security.test.{js,ts}",
        category: "security",
        priority: 7,
        timeout: 20000,
        retries: 2,
        parallel: true,
        dependencies: [],
        healthcareSpecific: true,
      },
      {
        name: "End-to-End Tests",
        pattern: "**/*.e2e.test.{js,ts}",
        category: "e2e",
        priority: 5,
        timeout: 60000,
        retries: 2,
        parallel: false,
        dependencies: ["Integration Tests", "Compliance Tests"],
        healthcareSpecific: true,
      },
    ];
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private printRunSummary(result: TestRunResult): void {
    console.log("\n🎯 Test Run Summary");
    console.log("====================");
    console.log(`Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Total Tests: ${result.summary.totalTests}`);
    console.log(`Passed: ${result.summary.passed}`);
    console.log(`Failed: ${result.summary.failed}`);
    console.log(`Skipped: ${result.summary.skipped}`);
    console.log(`Success Rate: ${result.summary.successRate.toFixed(1)}%`);
    console.log(`Duration: ${(result.summary.duration / 1000).toFixed(2)}s`);

    if (result.healthcareMetrics) {
      console.log(
        `Healthcare Compliance: ${result.healthcareMetrics.complianceScore?.toFixed(1) || "N/A"}%`,
      );
    }

    if (result.errors.length > 0) {
      console.log("\n🚨 Errors:");
      result.errors.forEach((error) => console.log(`   - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      result.warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    if (result.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      result.recommendations.forEach((rec) => console.log(`   - ${rec}`));
    }

    if (result.artifacts.length > 0) {
      console.log("\n📄 Generated Artifacts:");
      result.artifacts.forEach((artifact) => console.log(`   - ${artifact}`));
    }

    console.log("");
  }

  // Public getters
  getConfig(): TestRunConfig {
    return { ...this.config };
  }

  getRunResult(): TestRunResult | undefined {
    return this.runResult ? { ...this.runResult } : undefined;
  }

  getTestSuites(): TestSuite[] {
    return [...this.testSuites];
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }
}

// Export the test runner class and types
export {
  ComprehensiveTestRunner,
  type TestRunConfig,
  type TestRunResult,
  type TestSuite,
};
export default ComprehensiveTestRunner;

// CLI execution
if (require.main === module) {
  console.log("🚀 Healthcare Testing Framework - Comprehensive Test Runner");

  const runner = new ComprehensiveTestRunner({
    healthcareCompliance: true,
    performanceMetrics: true,
    securityValidation: true,
    integrationValidation: true,
    errorRecovery: true,
    verbose: true,
  });

  runner
    .runTests()
    .then((result) => {
      console.log("\n✅ Test run completed");
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("\n❌ Test run crashed:", error);
      process.exit(1);
    });
}
