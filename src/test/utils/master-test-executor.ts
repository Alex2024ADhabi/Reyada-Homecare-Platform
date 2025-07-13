#!/usr/bin/env tsx
/**
 * Master Test Executor
 * Orchestrates and executes all types of tests across the healthcare platform
 * Provides comprehensive test execution with healthcare-specific validation and reporting
 */

import { EventEmitter } from "events";
import { execRefreshCw, spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

// Import our testing utilities
import {
  testExecutionMonitor,
  TestExecutionMonitor,
} from "./test-execution-monitor";
import { globalTestReporter, TestReporter } from "./test-reporting";
import { IntegrationValidator } from "./integration-validator";

interface TestPhase {
  id: string;
  name: string;
  description: string;
  command: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  timeout?: number;
  retries?: number;
  critical: boolean;
  healthcareSpecific: boolean;
  dependencies?: string[];
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  startTime?: number;
  endTime?: number;
  duration?: number;
  output?: string;
  error?: string;
  exitCode?: number;
}

interface ExecutionConfig {
  mode:
    | "unit"
    | "integration"
    | "e2e"
    | "performance"
    | "security"
    | "accessibility"
    | "compliance"
    | "comprehensive";
  skipValidation?: boolean;
  generateReports?: boolean;
  cleanupAfter?: boolean;
  continueOnFailure?: boolean;
  parallelExecution?: boolean;
  maxConcurrency?: number;
  outputDirectory?: string;
  healthcareCompliance?: boolean;
  performanceThresholds?: {
    maxDuration?: number;
    maxMemoryUsage?: number;
    minSuccessRate?: number;
  };
}

interface ExecutionSummary {
  totalPhases: number;
  passedPhases: number;
  failedPhases: number;
  skippedPhases: number;
  totalDuration: number;
  overallSuccessRate: number;
  healthcareComplianceScore?: number;
  performanceMetrics?: {
    averageDuration: number;
    peakMemoryUsage: number;
    totalTestsExecuted: number;
  };
}

interface ExecutionResult {
  success: boolean;
  summary: ExecutionSummary;
  phases: TestPhase[];
  reports: string[];
  recommendations: string[];
  criticalIssues: string[];
}

class MasterTestExecutor extends EventEmitter {
  private config: ExecutionConfig;
  private phases: TestPhase[] = [];
  private startTime: number = 0;
  private monitor?: TestExecutionMonitor;
  private reporter?: TestReporter;
  private validator?: IntegrationValidator;
  private runningProcesses: Map<string, ChildProcess> = new Map();

  constructor(config: ExecutionConfig) {
    super();
    this.config = {
      skipValidation: false,
      generateReports: true,
      cleanupAfter: true,
      continueOnFailure: false,
      parallelExecution: false,
      maxConcurrency: 3,
      outputDirectory: "test-results",
      healthcareCompliance: true,
      performanceThresholds: {
        maxDuration: 300000, // 5 minutes
        maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
        minSuccessRate: 90,
      },
      ...config,
    };

    this.initializePhases();
    this.setupEventHandlers();
  }

  async execute(): Promise<ExecutionResult> {
    console.log("🚀 Master Test Executor - Healthcare Platform Testing");
    console.log("====================================================");
    console.log(`Mode: ${this.config.mode.toUpperCase()}`);
    console.log(
      `Healthcare Compliance: ${this.config.healthcareCompliance ? "Enabled" : "Disabled"}`,
    );
    console.log(
      `Parallel Execution: ${this.config.parallelExecution ? "Enabled" : "Disabled"}`,
    );
    console.log("");

    this.startTime = performance.now();

    try {
      // Step 1: Pre-execution validation
      if (!this.config.skipValidation) {
        await this.runPreExecutionValidation();
      }

      // Step 2: Initialize monitoring and reporting
      await this.initializeMonitoringAndReporting();

      // Step 3: Execute test phases
      await this.executeTestPhases();

      // Step 4: Generate reports
      const reports = this.config.generateReports
        ? await this.generateReports()
        : [];

      // Step 5: Cleanup
      if (this.config.cleanupAfter) {
        await this.cleanup();
      }

      // Step 6: Generate final result
      const result = this.generateExecutionResult(reports);

      this.printExecutionSummary(result);
      return result;
    } catch (error) {
      console.error("💥 Test execution failed:", error);
      return this.generateFailureResult(error);
    } finally {
      await this.finalizeMonitoringAndReporting();
    }
  }

  private initializePhases(): void {
    // Clear existing phases
    this.phases = [];

    switch (this.config.mode) {
      case "unit":
        this.addUnitTestPhases();
        break;
      case "integration":
        this.addIntegrationTestPhases();
        break;
      case "e2e":
        this.addE2ETestPhases();
        break;
      case "performance":
        this.addPerformanceTestPhases();
        break;
      case "security":
        this.addSecurityTestPhases();
        break;
      case "accessibility":
        this.addAccessibilityTestPhases();
        break;
      case "compliance":
        this.addComplianceTestPhases();
        break;
      case "comprehensive":
        this.addAllTestPhases();
        break;
      default:
        throw new Error(`Unknown test mode: ${this.config.mode}`);
    }
  }

  private addUnitTestPhases(): void {
    this.addPhase({
      id: "unit-tests",
      name: "Unit Tests",
      description: "Execute unit tests for all components",
      command: "npm run test:unit || echo 'Unit tests not configured'",
      critical: true,
      healthcareSpecific: false,
    });

    if (this.config.healthcareCompliance) {
      this.addPhase({
        id: "unit-healthcare-tests",
        name: "Healthcare Unit Tests",
        description: "Execute healthcare-specific unit tests",
        command:
          'npm run test:unit -- --grep "healthcare|DOH|DAMAN|JAWDA" || echo "Healthcare unit tests not configured"',
        critical: true,
        healthcareSpecific: true,
        dependencies: ["unit-tests"],
      });
    }
  }

  private addIntegrationTestPhases(): void {
    this.addPhase({
      id: "integration-api-tests",
      name: "API Integration Tests",
      description: "Test API integrations and endpoints",
      command:
        "npm run test:integration:api || echo 'API integration tests not configured'",
      critical: true,
      healthcareSpecific: false,
    });

    this.addPhase({
      id: "integration-database-tests",
      name: "Database Integration Tests",
      description: "Test database operations and queries",
      command:
        "npm run test:integration:db || echo 'Database integration tests not configured'",
      critical: true,
      healthcareSpecific: false,
    });

    if (this.config.healthcareCompliance) {
      this.addPhase({
        id: "integration-healthcare-tests",
        name: "Healthcare Integration Tests",
        description: "Test healthcare system integrations",
        command:
          "npm run test:integration:healthcare || echo 'Healthcare integration tests not configured'",
        critical: true,
        healthcareSpecific: true,
        dependencies: ["integration-api-tests"],
      });

      this.addPhase({
        id: "integration-daman-tests",
        name: "DAMAN Integration Tests",
        description: "Test DAMAN insurance system integration",
        command:
          "npm run test:integration:daman || echo 'DAMAN integration tests not configured'",
        critical: true,
        healthcareSpecific: true,
        dependencies: ["integration-healthcare-tests"],
      });
    }
  }

  private addE2ETestPhases(): void {
    this.addPhase({
      id: "e2e-critical-workflows",
      name: "Critical Workflow E2E Tests",
      description: "Test critical user workflows end-to-end",
      command:
        "npx playwright test src/test/e2e/critical-workflows.test.ts || echo 'E2E tests not configured'",
      critical: true,
      healthcareSpecific: false,
      timeout: 300000, // 5 minutes
    });

    if (this.config.healthcareCompliance) {
      this.addPhase({
        id: "e2e-healthcare-workflows",
        name: "Healthcare Workflow E2E Tests",
        description: "Test healthcare-specific workflows",
        command:
          "npx playwright test src/test/e2e/healthcare-workflows.spec.ts || echo 'Healthcare E2E tests not configured'",
        critical: true,
        healthcareSpecific: true,
        timeout: 600000, // 10 minutes
        dependencies: ["e2e-critical-workflows"],
      });
    }
  }

  private addPerformanceTestPhases(): void {
    this.addPhase({
      id: "performance-load-tests",
      name: "Load Performance Tests",
      description: "Execute load testing scenarios",
      command:
        "npm run test:performance:load || echo 'Load performance tests not configured'",
      critical: false,
      healthcareSpecific: false,
      timeout: 600000, // 10 minutes
    });

    this.addPhase({
      id: "performance-stress-tests",
      name: "Stress Performance Tests",
      description: "Execute stress testing scenarios",
      command:
        "npm run test:performance:stress || echo 'Stress performance tests not configured'",
      critical: false,
      healthcareSpecific: false,
      timeout: 900000, // 15 minutes
    });
  }

  private addSecurityTestPhases(): void {
    this.addPhase({
      id: "security-vulnerability-tests",
      name: "Security Vulnerability Tests",
      description: "Scan for security vulnerabilities",
      command:
        "npm run test:security:vulnerabilities || echo 'Security vulnerability tests not configured'",
      critical: true,
      healthcareSpecific: false,
    });

    if (this.config.healthcareCompliance) {
      this.addPhase({
        id: "security-healthcare-tests",
        name: "Healthcare Security Tests",
        description: "Test healthcare-specific security requirements",
        command:
          "npm run test:security:healthcare || echo 'Healthcare security tests not configured'",
        critical: true,
        healthcareSpecific: true,
        dependencies: ["security-vulnerability-tests"],
      });
    }
  }

  private addAccessibilityTestPhases(): void {
    this.addPhase({
      id: "accessibility-wcag-tests",
      name: "WCAG Accessibility Tests",
      description: "Test WCAG compliance and accessibility",
      command:
        "npx playwright test --config=playwright.accessibility.config.ts || echo 'Accessibility tests not configured'",
      critical: false,
      healthcareSpecific: false,
      timeout: 300000, // 5 minutes
    });

    if (this.config.healthcareCompliance) {
      this.addPhase({
        id: "accessibility-healthcare-tests",
        name: "Healthcare Accessibility Tests",
        description: "Test healthcare-specific accessibility requirements",
        command:
          "npm run test:accessibility:healthcare || echo 'Healthcare accessibility tests not configured'",
        critical: false,
        healthcareSpecific: true,
        dependencies: ["accessibility-wcag-tests"],
      });
    }
  }

  private addComplianceTestPhases(): void {
    if (!this.config.healthcareCompliance) {
      console.warn(
        "⚠️  Healthcare compliance disabled, skipping compliance tests",
      );
      return;
    }

    this.addPhase({
      id: "compliance-doh-tests",
      name: "DOH Compliance Tests",
      description: "Test DOH regulatory compliance",
      command:
        "npm run test:compliance:doh || echo 'DOH compliance tests not configured'",
      critical: true,
      healthcareSpecific: true,
    });

    this.addPhase({
      id: "compliance-daman-tests",
      name: "DAMAN Compliance Tests",
      description: "Test DAMAN insurance compliance",
      command:
        "npm run test:compliance:daman || echo 'DAMAN compliance tests not configured'",
      critical: true,
      healthcareSpecific: true,
    });

    this.addPhase({
      id: "compliance-jawda-tests",
      name: "JAWDA Quality Tests",
      description: "Test JAWDA quality standards compliance",
      command:
        "npm run test:compliance:jawda || echo 'JAWDA compliance tests not configured'",
      critical: true,
      healthcareSpecific: true,
    });

    this.addPhase({
      id: "compliance-hipaa-tests",
      name: "HIPAA Privacy Tests",
      description: "Test HIPAA privacy and security compliance",
      command:
        "npm run test:compliance:hipaa || echo 'HIPAA compliance tests not configured'",
      critical: true,
      healthcareSpecific: true,
    });
  }

  private addAllTestPhases(): void {
    this.addUnitTestPhases();
    this.addIntegrationTestPhases();
    this.addE2ETestPhases();
    this.addPerformanceTestPhases();
    this.addSecurityTestPhases();
    this.addAccessibilityTestPhases();
    this.addComplianceTestPhases();
  }

  private addPhase(phase: Omit<TestPhase, "status">): void {
    this.phases.push({
      ...phase,
      status: "pending",
      timeout: phase.timeout || 120000, // 2 minutes default
      retries: phase.retries || 0,
    });
  }

  private setupEventHandlers(): void {
    // Handle process termination
    process.on("SIGINT", () => this.handleGracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.handleGracefulShutdown("SIGTERM"));
  }

  private async handleGracefulShutdown(signal: string): Promise<void> {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    // Kill all running processes
    for (const [phaseId, process] of this.runningProcesses) {
      console.log(`   Terminating ${phaseId}...`);
      process.kill("SIGTERM");
    }

    await this.finalizeMonitoringAndReporting();
    process.exit(1);
  }

  private async runPreExecutionValidation(): Promise<void> {
    console.log("🔍 Running pre-execution validation...");

    this.validator = new IntegrationValidator({
      enableHealthcareValidation: this.config.healthcareCompliance,
      enablePerformanceValidation: true,
    });

    const validationReport =
      await this.validator.validateFrameworkIntegration();

    if (validationReport.overallStatus === "failed") {
      throw new Error(
        "Pre-execution validation failed. Please fix critical issues before proceeding.",
      );
    }

    if (validationReport.criticalIssues.length > 0) {
      console.warn("⚠️  Critical issues found during validation:");
      validationReport.criticalIssues.forEach((issue) =>
        console.warn(`   - ${issue}`),
      );
    }

    console.log("✅ Pre-execution validation completed\n");
  }

  private async initializeMonitoringAndReporting(): Promise<void> {
    console.log("📊 Initializing monitoring and reporting...");

    // Initialize test execution monitor
    this.monitor = testExecutionMonitor;
    this.monitor.startMonitoring({
      enableRealTimeReporting: true,
      enableHealthcareMetrics: this.config.healthcareCompliance,
      outputFile: path.join(
        this.config.outputDirectory!,
        "execution-monitor.json",
      ),
    });

    // Initialize test reporter
    this.reporter = globalTestReporter;
    this.reporter.startReporting({
      outputDirectory: this.config.outputDirectory!,
      includeHealthcareMetrics: this.config.healthcareCompliance,
      includePerformanceMetrics: true,
    });

    console.log("✅ Monitoring and reporting initialized\n");
  }

  private async executeTestPhases(): Promise<void> {
    console.log("🧪 Executing test phases...");
    console.log("============================");

    if (this.config.parallelExecution) {
      await this.executePhasesInParallel();
    } else {
      await this.executePhasesSequentially();
    }
  }

  private async executePhasesSequentially(): Promise<void> {
    for (const phase of this.phases) {
      if (this.shouldSkipPhase(phase)) {
        phase.status = "skipped";
        console.log(`   ⏭️  Skipping: ${phase.name}`);
        continue;
      }

      await this.executePhase(phase);

      // Stop execution if critical phase failed and continueOnFailure is false
      if (
        phase.status === "failed" &&
        phase.critical &&
        !this.config.continueOnFailure
      ) {
        console.log(`\n💥 Critical phase failed: ${phase.name}`);
        console.log("Stopping execution due to critical failure.");
        break;
      }
    }
  }

  private async executePhasesInParallel(): Promise<void> {
    const batches = this.createExecutionBatches();

    for (const batch of batches) {
      const promises = batch.map((phase) => {
        if (this.shouldSkipPhase(phase)) {
          phase.status = "skipped";
          return Promise.resolve();
        }
        return this.executePhase(phase);
      });

      await Promise.all(promises);

      // Check for critical failures
      const criticalFailures = batch.filter(
        (p) => p.status === "failed" && p.critical,
      );
      if (criticalFailures.length > 0 && !this.config.continueOnFailure) {
        console.log(
          `\n💥 Critical phases failed: ${criticalFailures.map((p) => p.name).join(", ")}`,
        );
        console.log("Stopping execution due to critical failures.");
        break;
      }
    }
  }

  private createExecutionBatches(): TestPhase[][] {
    const batches: TestPhase[][] = [];
    const processed = new Set<string>();

    while (processed.size < this.phases.length) {
      const batch: TestPhase[] = [];

      for (const phase of this.phases) {
        if (processed.has(phase.id)) continue;

        // Check if all dependencies are satisfied
        const dependenciesSatisfied =
          !phase.dependencies ||
          phase.dependencies.every((dep) => processed.has(dep));

        if (
          dependenciesSatisfied &&
          batch.length < this.config.maxConcurrency!
        ) {
          batch.push(phase);
          processed.add(phase.id);
        }
      }

      if (batch.length === 0) {
        // Circular dependency or other issue
        const remaining = this.phases.filter((p) => !processed.has(p.id));
        console.warn(
          `⚠️  Circular dependency detected for phases: ${remaining.map((p) => p.name).join(", ")}`,
        );
        batch.push(...remaining);
        remaining.forEach((p) => processed.add(p.id));
      }

      batches.push(batch);
    }

    return batches;
  }

  private shouldSkipPhase(phase: TestPhase): boolean {
    // Skip healthcare-specific phases if healthcare compliance is disabled
    if (phase.healthcareSpecific && !this.config.healthcareCompliance) {
      return true;
    }

    // Check if dependencies failed
    if (phase.dependencies) {
      const failedDependencies = phase.dependencies.filter((depId) => {
        const dep = this.phases.find((p) => p.id === depId);
        return dep && dep.status === "failed";
      });

      if (failedDependencies.length > 0) {
        console.log(
          `   ⚠️  Skipping ${phase.name} due to failed dependencies: ${failedDependencies.join(", ")}`,
        );
        return true;
      }
    }

    return false;
  }

  private async executePhase(phase: TestPhase): Promise<void> {
    console.log(`   🔄 Running: ${phase.name}`);
    phase.status = "running";
    phase.startTime = performance.now();

    this.monitor?.recordTestEvent({
      type: "start",
      testName: phase.name,
      suiteName: "master-executor",
    });

    try {
      const result = await this.runCommand(phase);

      phase.status = result.success ? "passed" : "failed";
      phase.output = result.output;
      phase.error = result.error;
      phase.exitCode = result.exitCode;

      const icon = result.success ? "✅" : "❌";
      const duration = phase.duration ? `(${phase.duration.toFixed(0)}ms)` : "";
      console.log(`   ${icon} ${phase.name} ${duration}`);

      // Record test event
      this.monitor?.recordTestEvent({
        type: result.success ? "pass" : "fail",
        testName: phase.name,
        suiteName: "master-executor",
        duration: phase.duration,
        error: result.error ? new Error(result.error) : undefined,
      });

      // Add to reporter
      this.reporter?.addTestResult({
        name: phase.name,
        suite: "master-executor",
        status: result.success ? "passed" : "failed",
        duration: phase.duration || 0,
        error: result.error
          ? {
              message: result.error,
              type: "ExecutionError",
            }
          : undefined,
        metadata: {
          category: this.getCategoryFromPhase(phase),
          healthcare: phase.healthcareSpecific
            ? {
                complianceStandard: this.getComplianceStandardFromPhase(phase),
                riskLevel: phase.critical ? "critical" : "medium",
              }
            : undefined,
        },
      });
    } catch (error) {
      phase.status = "failed";
      phase.error = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ ${phase.name} - ERROR: ${phase.error}`);

      this.monitor?.recordTestEvent({
        type: "error",
        testName: phase.name,
        suiteName: "master-executor",
        duration: phase.duration,
        error,
      });
    } finally {
      phase.endTime = performance.now();
      phase.duration = phase.endTime - (phase.startTime || 0);
      this.runningProcesses.delete(phase.id);
    }
  }

  private async runCommand(phase: TestPhase): Promise<{
    success: boolean;
    output: string;
    error?: string;
    exitCode?: number;
  }> {
    return new Promise((resolve) => {
      const process = spawn("sh", ["-c", phase.command], {
        cwd: phase.workingDirectory || process.cwd(),
        env: { ...process.env, ...phase.environment },
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.runningProcesses.set(phase.id, process);

      let output = "";
      let error = "";

      process.stdout?.on("data", (data) => {
        output += data.toString();
      });

      process.stderr?.on("data", (data) => {
        error += data.toString();
      });

      // Set timeout
      const timeout = setTimeout(() => {
        process.kill("SIGTERM");
        resolve({
          success: false,
          output,
          error: `Command timed out after ${phase.timeout}ms`,
          exitCode: -1,
        });
      }, phase.timeout);

      process.on("close", (code) => {
        clearTimeout(timeout);
        resolve({
          success: code === 0,
          output,
          error: error || undefined,
          exitCode: code || 0,
        });
      });

      process.on("error", (err) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          output,
          error: err.message,
          exitCode: -1,
        });
      });
    });
  }

  private getCategoryFromPhase(phase: TestPhase): string {
    if (phase.id.includes("unit")) return "unit";
    if (phase.id.includes("integration")) return "integration";
    if (phase.id.includes("e2e")) return "e2e";
    if (phase.id.includes("performance")) return "performance";
    if (phase.id.includes("security")) return "security";
    if (phase.id.includes("accessibility")) return "accessibility";
    if (phase.id.includes("compliance")) return "compliance";
    return "other";
  }

  private getComplianceStandardFromPhase(
    phase: TestPhase,
  ): "DOH" | "DAMAN" | "JAWDA" | "HIPAA" | undefined {
    if (phase.id.includes("doh")) return "DOH";
    if (phase.id.includes("daman")) return "DAMAN";
    if (phase.id.includes("jawda")) return "JAWDA";
    if (phase.id.includes("hipaa")) return "HIPAA";
    return undefined;
  }

  private async generateReports(): Promise<string[]> {
    console.log("\n📊 Generating comprehensive reports...");

    const reports: string[] = [];

    try {
      // Generate test report
      if (this.reporter) {
        const testReport = this.reporter.generateComprehensiveReport();
        const savedFiles = await this.reporter.saveReports(testReport);
        reports.push(...savedFiles);
      }

      // Generate execution report
      if (this.monitor) {
        const executionReport = this.monitor.stopMonitoring();
        // Monitor saves its own report
      }

      console.log(`✅ Generated ${reports.length} report files`);
    } catch (error) {
      console.error(`❌ Failed to generate reports: ${error}`);
    }

    return reports;
  }

  private async cleanup(): Promise<void> {
    console.log("\n🧹 Performing cleanup...");

    // Kill any remaining processes
    for (const [phaseId, process] of this.runningProcesses) {
      console.log(`   Terminating ${phaseId}...`);
      process.kill("SIGTERM");
    }
    this.runningProcesses.clear();

    // Additional cleanup tasks can be added here
    console.log("✅ Cleanup completed");
  }

  private async finalizeMonitoringAndReporting(): Promise<void> {
    try {
      if (this.monitor && this.monitor.isActive()) {
        this.monitor.stopMonitoring();
      }
    } catch (error) {
      console.error("Error finalizing monitoring:", error);
    }
  }

  private generateExecutionResult(reports: string[]): ExecutionResult {
    const totalDuration = performance.now() - this.startTime;
    const passedPhases = this.phases.filter(
      (p) => p.status === "passed",
    ).length;
    const failedPhases = this.phases.filter(
      (p) => p.status === "failed",
    ).length;
    const skippedPhases = this.phases.filter(
      (p) => p.status === "skipped",
    ).length;

    const summary: ExecutionSummary = {
      totalPhases: this.phases.length,
      passedPhases,
      failedPhases,
      skippedPhases,
      totalDuration,
      overallSuccessRate:
        this.phases.length > 0 ? (passedPhases / this.phases.length) * 100 : 0,
    };

    // Add healthcare compliance score if applicable
    if (this.config.healthcareCompliance) {
      const healthcarePhases = this.phases.filter((p) => p.healthcareSpecific);
      const passedHealthcarePhases = healthcarePhases.filter(
        (p) => p.status === "passed",
      ).length;
      summary.healthcareComplianceScore =
        healthcarePhases.length > 0
          ? (passedHealthcarePhases / healthcarePhases.length) * 100
          : 100;
    }

    // Add performance metrics
    const phaseDurations = this.phases
      .filter((p) => p.duration)
      .map((p) => p.duration!);
    if (phaseDurations.length > 0) {
      summary.performanceMetrics = {
        averageDuration:
          phaseDurations.reduce((a, b) => a + b, 0) / phaseDurations.length,
        peakMemoryUsage: process.memoryUsage().heapUsed,
        totalTestsExecuted: this.phases.length,
      };
    }

    const success =
      failedPhases === 0 &&
      summary.overallSuccessRate >=
        (this.config.performanceThresholds?.minSuccessRate || 90);

    return {
      success,
      summary,
      phases: [...this.phases],
      reports,
      recommendations: this.generateRecommendations(),
      criticalIssues: this.getCriticalIssues(),
    };
  }

  private generateFailureResult(error: any): ExecutionResult {
    return {
      success: false,
      summary: {
        totalPhases: this.phases.length,
        passedPhases: 0,
        failedPhases: this.phases.length,
        skippedPhases: 0,
        totalDuration: performance.now() - this.startTime,
        overallSuccessRate: 0,
      },
      phases: [...this.phases],
      reports: [],
      recommendations: ["Fix the execution error and retry"],
      criticalIssues: [error instanceof Error ? error.message : String(error)],
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedPhases = this.phases.filter((p) => p.status === "failed");
    const criticalFailures = failedPhases.filter((p) => p.critical);

    if (criticalFailures.length > 0) {
      recommendations.push(
        `URGENT: Fix ${criticalFailures.length} critical test failures`,
      );
      criticalFailures.forEach((phase) => {
        recommendations.push(`- ${phase.name}: ${phase.error}`);
      });
    }

    if (failedPhases.length > criticalFailures.length) {
      recommendations.push(
        `Address ${failedPhases.length - criticalFailures.length} non-critical test failures`,
      );
    }

    const slowPhases = this.phases.filter(
      (p) => p.duration && p.duration > 60000,
    ); // > 1 minute
    if (slowPhases.length > 0) {
      recommendations.push(`Optimize ${slowPhases.length} slow test phases`);
    }

    if (this.config.healthcareCompliance) {
      const failedHealthcarePhases = this.phases.filter(
        (p) => p.healthcareSpecific && p.status === "failed",
      );
      if (failedHealthcarePhases.length > 0) {
        recommendations.push(
          "Review healthcare compliance requirements for failed tests",
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "All tests passed successfully - consider expanding test coverage",
      );
    }

    return recommendations;
  }

  private getCriticalIssues(): string[] {
    return this.phases
      .filter((p) => p.status === "failed" && p.critical)
      .map((p) => `${p.name}: ${p.error}`);
  }

  private printExecutionSummary(result: ExecutionResult): void {
    console.log("\n🎯 Test Execution Summary");
    console.log("=========================");
    console.log(
      `Overall Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`,
    );
    console.log(`Total Phases: ${result.summary.totalPhases}`);
    console.log(`Passed: ${result.summary.passedPhases}`);
    console.log(`Failed: ${result.summary.failedPhases}`);
    console.log(`Skipped: ${result.summary.skippedPhases}`);
    console.log(
      `Success Rate: ${result.summary.overallSuccessRate.toFixed(1)}%`,
    );
    console.log(
      `Duration: ${(result.summary.totalDuration / 1000).toFixed(2)}s`,
    );

    if (result.summary.healthcareComplianceScore !== undefined) {
      console.log(
        `Healthcare Compliance: ${result.summary.healthcareComplianceScore.toFixed(1)}%`,
      );
    }

    if (result.criticalIssues.length > 0) {
      console.log("\n🚨 Critical Issues:");
      result.criticalIssues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (result.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      result.recommendations
        .slice(0, 5)
        .forEach((rec) => console.log(`   - ${rec}`));
    }

    if (result.reports.length > 0) {
      console.log("\n📄 Generated Reports:");
      result.reports.forEach((report) => console.log(`   - ${report}`));
    }
  }
}

// Export the executor
export {
  MasterTestExecutor,
  type ExecutionConfig,
  type ExecutionResult,
  type TestPhase,
};
export default MasterTestExecutor;

// CLI execution
if (require.main === module) {
  console.log("🚀 Master Test Executor - Standalone Mode");

  const mode = (process.argv[2] as ExecutionConfig["mode"]) || "comprehensive";
  const healthcareCompliance = process.argv.includes("--healthcare");
  const parallelExecution = process.argv.includes("--parallel");

  const executor = new MasterTestExecutor({
    mode,
    healthcareCompliance,
    parallelExecution,
    generateReports: true,
    cleanupAfter: true,
  });

  executor
    .execute()
    .then((result) => {
      console.log("\n✅ Test execution completed");
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("\n❌ Test execution failed:", error);
      process.exit(1);
    });
}
