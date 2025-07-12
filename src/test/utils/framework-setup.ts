#!/usr/bin/env tsx
/**
 * Healthcare Testing Framework Setup and Initialization
 * Comprehensive setup, validation, and initialization system for the healthcare testing framework
 * Ensures all components are properly configured and ready for use
 */

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

// Import framework components
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import { healthcareTestData } from "../fixtures/healthcare-test-data";
import {
  HealthcareTestDataGenerator,
  ComplianceTestHelper,
  PerformanceTestHelper,
  TestEnvironmentHelper,
} from "./test-helpers";
import IntegrationValidator from "./integration-validator";

interface SetupConfig {
  validateDependencies: boolean;
  initializeComponents: boolean;
  runHealthChecks: boolean;
  createDirectories: boolean;
  validateEnvironment: boolean;
  enableLogging: boolean;
  outputDirectory: string;
  logLevel: "debug" | "info" | "warn" | "error";
  timeoutMs: number;
}

interface SetupResult {
  success: boolean;
  message: string;
  details: {
    dependencies: { [key: string]: boolean };
    components: { [key: string]: boolean };
    directories: { [key: string]: boolean };
    environment: { [key: string]: any };
    healthChecks: { [key: string]: boolean };
  };
  warnings: string[];
  errors: string[];
  recommendations: string[];
  duration: number;
}

interface FrameworkStatus {
  initialized: boolean;
  healthy: boolean;
  version: string;
  components: {
    monitor: boolean;
    reporter: boolean;
    validator: boolean;
    testData: boolean;
    helpers: boolean;
  };
  lastHealthCheck: string;
  issues: string[];
}

class FrameworkSetup extends EventEmitter {
  private static instance: FrameworkSetup;
  private config: SetupConfig;
  private setupResult?: SetupResult;
  private frameworkStatus: FrameworkStatus;
  private logFile: string;

  private constructor() {
    super();
    this.config = this.loadDefaultConfig();
    this.frameworkStatus = this.initializeStatus();
    this.logFile = path.join(
      this.config.outputDirectory,
      "framework-setup.log",
    );
  }

  static getInstance(): FrameworkSetup {
    if (!FrameworkSetup.instance) {
      FrameworkSetup.instance = new FrameworkSetup();
    }
    return FrameworkSetup.instance;
  }

  async initializeFramework(
    config?: Partial<SetupConfig>,
  ): Promise<SetupResult> {
    const startTime = performance.now();

    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log("🚀 Healthcare Testing Framework Initialization");
    console.log("===============================================");
    console.log("");

    this.emit("setup-started", { timestamp: Date.now() });

    const result: SetupResult = {
      success: false,
      message: "",
      details: {
        dependencies: {},
        components: {},
        directories: {},
        environment: {},
        healthChecks: {},
      },
      warnings: [],
      errors: [],
      recommendations: [],
      duration: 0,
    };

    try {
      // Step 1: Validate dependencies
      if (this.config.validateDependencies) {
        console.log("📦 Validating dependencies...");
        const depResult = await this.validateDependencies();
        result.details.dependencies = depResult;
        if (!Object.values(depResult).every(Boolean)) {
          result.errors.push("Some dependencies are missing or invalid");
        }
      }

      // Step 2: Create required directories
      if (this.config.createDirectories) {
        console.log("📁 Creating required directories...");
        const dirResult = await this.createRequiredDirectories();
        result.details.directories = dirResult;
      }

      // Step 3: Validate environment
      if (this.config.validateEnvironment) {
        console.log("🌍 Validating environment...");
        const envResult = await this.validateEnvironment();
        result.details.environment = envResult;
      }

      // Step 4: Initialize components
      if (this.config.initializeComponents) {
        console.log("⚙️  Initializing framework components...");
        const compResult = await this.initializeComponents();
        result.details.components = compResult;
        if (!Object.values(compResult).every(Boolean)) {
          result.errors.push("Some components failed to initialize");
        }
      }

      // Step 5: Run health checks
      if (this.config.runHealthChecks) {
        console.log("🏥 Running health checks...");
        const healthResult = await this.runHealthChecks();
        result.details.healthChecks = healthResult;
        if (!Object.values(healthResult).every(Boolean)) {
          result.warnings.push("Some health checks failed");
        }
      }

      // Determine overall success
      result.success = result.errors.length === 0;
      result.message = result.success
        ? "Framework initialized successfully"
        : `Framework initialization failed with ${result.errors.length} error(s)`;

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);
    } catch (error) {
      result.success = false;
      result.message = `Framework initialization crashed: ${error}`;
      result.errors.push(error.toString());
    }

    result.duration = performance.now() - startTime;
    this.setupResult = result;
    this.updateFrameworkStatus(result);

    // Log results
    if (this.config.enableLogging) {
      await this.logSetupResult(result);
    }

    this.emit("setup-completed", { result, timestamp: Date.now() });
    this.printSetupSummary(result);

    return result;
  }

  async validateFrameworkHealth(): Promise<boolean> {
    console.log("🔍 Validating framework health...");

    try {
      const validator = new IntegrationValidator({
        enableHealthcareValidation: true,
        enablePerformanceValidation: true,
        enableSecurityValidation: true,
        timeoutMs: 15000,
      });

      const healthCheck = await validator.quickHealthCheck();

      if (healthCheck) {
        console.log("✅ Framework health check passed");
        this.frameworkStatus.healthy = true;
        this.frameworkStatus.lastHealthCheck = new Date().toISOString();
        this.frameworkStatus.issues = [];
      } else {
        console.log("❌ Framework health check failed");
        this.frameworkStatus.healthy = false;
        this.frameworkStatus.issues.push("Health check validation failed");
      }

      return healthCheck;
    } catch (error) {
      console.error(`❌ Health check error: ${error}`);
      this.frameworkStatus.healthy = false;
      this.frameworkStatus.issues.push(`Health check error: ${error}`);
      return false;
    }
  }

  async repairFramework(): Promise<boolean> {
    console.log("🔧 Attempting framework repair...");

    try {
      // Re-initialize with repair mode
      const repairResult = await this.initializeFramework({
        validateDependencies: true,
        initializeComponents: true,
        runHealthChecks: true,
        createDirectories: true,
      });

      if (repairResult.success) {
        console.log("✅ Framework repair completed successfully");
        return true;
      } else {
        console.log("❌ Framework repair failed");
        console.log("Errors:", repairResult.errors);
        return false;
      }
    } catch (error) {
      console.error(`❌ Framework repair error: ${error}`);
      return false;
    }
  }

  getFrameworkStatus(): FrameworkStatus {
    return { ...this.frameworkStatus };
  }

  getSetupResult(): SetupResult | undefined {
    return this.setupResult ? { ...this.setupResult } : undefined;
  }

  private async validateDependencies(): Promise<{ [key: string]: boolean }> {
    const dependencies = {
      "Node.js": this.validateNodeVersion(),
      "File System": this.validateFileSystemAccess(),
      "Performance API": this.validatePerformanceAPI(),
      "Event Emitter": this.validateEventEmitter(),
      "Path Module": this.validatePathModule(),
    };

    // Log dependency status
    Object.entries(dependencies).forEach(([dep, status]) => {
      console.log(`   ${status ? "✅" : "❌"} ${dep}`);
    });

    return dependencies;
  }

  private async createRequiredDirectories(): Promise<{
    [key: string]: boolean;
  }> {
    const directories = [
      "test-results",
      "test-results/reports",
      "test-results/logs",
      "test-results/coverage",
      "test-results/artifacts",
    ];

    const result: { [key: string]: boolean } = {};

    for (const dir of directories) {
      try {
        const fullPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        result[dir] = fs.existsSync(fullPath);
        console.log(`   ${result[dir] ? "✅" : "❌"} ${dir}`);
      } catch (error) {
        result[dir] = false;
        console.log(`   ❌ ${dir} - Error: ${error}`);
      }
    }

    return result;
  }

  private async validateEnvironment(): Promise<{ [key: string]: any }> {
    const environment = {
      platform: process.platform,
      nodeVersion: process.version,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
        CI: !!process.env.CI,
      },
    };

    console.log(`   Platform: ${environment.platform}`);
    console.log(`   Node.js: ${environment.nodeVersion}`);
    console.log(`   Architecture: ${environment.architecture}`);
    console.log(
      `   Memory: ${(environment.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    );
    console.log(`   Environment: ${environment.env.NODE_ENV}`);
    console.log(`   CI Mode: ${environment.env.CI}`);

    return environment;
  }

  private async initializeComponents(): Promise<{ [key: string]: boolean }> {
    const components = {
      "Test Execution Monitor": this.initializeMonitor(),
      "Test Reporter": this.initializeReporter(),
      "Healthcare Test Data": this.initializeTestData(),
      "Test Helpers": this.initializeHelpers(),
      "Integration Validator": this.initializeValidator(),
    };

    // Log component status
    Object.entries(components).forEach(([comp, status]) => {
      console.log(`   ${status ? "✅" : "❌"} ${comp}`);
    });

    return components;
  }

  private async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const healthChecks = {
      "Monitor Health": this.checkMonitorHealth(),
      "Reporter Health": this.checkReporterHealth(),
      "Data Generation": this.checkDataGeneration(),
      "Compliance Helpers": this.checkComplianceHelpers(),
      "File Operations": this.checkFileOperations(),
    };

    // Log health check status
    Object.entries(healthChecks).forEach(([check, status]) => {
      console.log(`   ${status ? "✅" : "❌"} ${check}`);
    });

    return healthChecks;
  }

  // Validation helper methods
  private validateNodeVersion(): boolean {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split(".")[0]);
    return majorVersion >= 16; // Require Node.js 16+
  }

  private validateFileSystemAccess(): boolean {
    try {
      const testPath = path.join(process.cwd(), "test-fs-access");
      fs.writeFileSync(testPath, "test");
      const content = fs.readFileSync(testPath, "utf8");
      fs.unlinkSync(testPath);
      return content === "test";
    } catch {
      return false;
    }
  }

  private validatePerformanceAPI(): boolean {
    try {
      const start = performance.now();
      const end = performance.now();
      return (
        typeof start === "number" && typeof end === "number" && end >= start
      );
    } catch {
      return false;
    }
  }

  private validateEventEmitter(): boolean {
    try {
      const emitter = new EventEmitter();
      let eventFired = false;
      emitter.on("test", () => {
        eventFired = true;
      });
      emitter.emit("test");
      return eventFired;
    } catch {
      return false;
    }
  }

  private validatePathModule(): boolean {
    try {
      const testPath = path.join("test", "path");
      return testPath.includes("test") && testPath.includes("path");
    } catch {
      return false;
    }
  }

  // Component initialization methods
  private initializeMonitor(): boolean {
    try {
      return (
        !!testExecutionMonitor &&
        typeof testExecutionMonitor.startMonitoring === "function"
      );
    } catch {
      return false;
    }
  }

  private initializeReporter(): boolean {
    try {
      return (
        !!globalTestReporter &&
        typeof globalTestReporter.startReporting === "function"
      );
    } catch {
      return false;
    }
  }

  private initializeTestData(): boolean {
    try {
      return !!healthcareTestData && Array.isArray(healthcareTestData.patients);
    } catch {
      return false;
    }
  }

  private initializeHelpers(): boolean {
    try {
      return (
        !!HealthcareTestDataGenerator &&
        !!ComplianceTestHelper &&
        !!PerformanceTestHelper &&
        !!TestEnvironmentHelper
      );
    } catch {
      return false;
    }
  }

  private initializeValidator(): boolean {
    try {
      const validator = new IntegrationValidator();
      return (
        !!validator &&
        typeof validator.validateFrameworkIntegration === "function"
      );
    } catch {
      return false;
    }
  }

  // Health check methods
  private checkMonitorHealth(): boolean {
    try {
      const sessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 10000,
      });
      const isActive = testExecutionMonitor.isActive();
      testExecutionMonitor.stopMonitoring();
      return !!sessionId && isActive;
    } catch {
      return false;
    }
  }

  private checkReporterHealth(): boolean {
    try {
      const sessionId = globalTestReporter.startReporting({
        formats: ["json"],
      });
      const isActive = globalTestReporter.isActive();
      globalTestReporter.stopReporting();
      return !!sessionId && isActive;
    } catch {
      return false;
    }
  }

  private checkDataGeneration(): boolean {
    try {
      const patient = HealthcareTestDataGenerator.generatePatientData();
      return !!patient && !!patient.id && !!patient.emiratesId;
    } catch {
      return false;
    }
  }

  private checkComplianceHelpers(): boolean {
    try {
      const result = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });
      return !!result && typeof result.valid === "boolean";
    } catch {
      return false;
    }
  }

  private checkFileOperations(): boolean {
    try {
      const testDir = path.join(this.config.outputDirectory, "health-check");
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      const testFile = path.join(testDir, "test.json");
      fs.writeFileSync(testFile, JSON.stringify({ test: true }));
      const data = JSON.parse(fs.readFileSync(testFile, "utf8"));
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
      return data.test === true;
    } catch {
      return false;
    }
  }

  private generateRecommendations(result: SetupResult): string[] {
    const recommendations: string[] = [];

    if (result.errors.length > 0) {
      recommendations.push("Address all critical errors before proceeding");
    }

    if (result.warnings.length > 0) {
      recommendations.push(
        "Review and resolve warnings for optimal performance",
      );
    }

    if (!Object.values(result.details.dependencies).every(Boolean)) {
      recommendations.push("Update or install missing dependencies");
    }

    if (!Object.values(result.details.components).every(Boolean)) {
      recommendations.push("Reinitialize failed components");
    }

    if (!Object.values(result.details.healthChecks).every(Boolean)) {
      recommendations.push("Run framework repair to fix health check issues");
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Framework is ready for use - consider running integration tests",
      );
    }

    return recommendations;
  }

  private updateFrameworkStatus(result: SetupResult): void {
    this.frameworkStatus.initialized = result.success;
    this.frameworkStatus.healthy =
      result.success && result.warnings.length === 0;
    this.frameworkStatus.components = {
      monitor: result.details.components["Test Execution Monitor"] || false,
      reporter: result.details.components["Test Reporter"] || false,
      validator: result.details.components["Integration Validator"] || false,
      testData: result.details.components["Healthcare Test Data"] || false,
      helpers: result.details.components["Test Helpers"] || false,
    };
    this.frameworkStatus.lastHealthCheck = new Date().toISOString();
    this.frameworkStatus.issues = [...result.errors, ...result.warnings];
  }

  private async logSetupResult(result: SetupResult): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: result.success ? "info" : "error",
        message: "Framework setup completed",
        result,
      };

      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.warn(`Failed to write setup log: ${error}`);
    }
  }

  private printSetupSummary(result: SetupResult): void {
    console.log("\n🎯 Framework Setup Summary");
    console.log("===========================");
    console.log(`Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);

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

    console.log("");
  }

  private loadDefaultConfig(): SetupConfig {
    return {
      validateDependencies: true,
      initializeComponents: true,
      runHealthChecks: true,
      createDirectories: true,
      validateEnvironment: true,
      enableLogging: true,
      outputDirectory: "test-results",
      logLevel: "info",
      timeoutMs: 30000,
    };
  }

  private initializeStatus(): FrameworkStatus {
    return {
      initialized: false,
      healthy: false,
      version: "1.0.0",
      components: {
        monitor: false,
        reporter: false,
        validator: false,
        testData: false,
        helpers: false,
      },
      lastHealthCheck: "",
      issues: [],
    };
  }
}

// Export singleton instance
export const frameworkSetup = FrameworkSetup.getInstance();
export default frameworkSetup;

// Export types
export {
  FrameworkSetup,
  type SetupConfig,
  type SetupResult,
  type FrameworkStatus,
};

// CLI execution
if (require.main === module) {
  console.log("🚀 Healthcare Testing Framework Setup");

  frameworkSetup
    .initializeFramework({
      validateDependencies: true,
      initializeComponents: true,
      runHealthChecks: true,
      createDirectories: true,
      validateEnvironment: true,
      enableLogging: true,
    })
    .then(async (result) => {
      if (result.success) {
        console.log("\n✅ Framework setup completed successfully");

        // Run additional health check
        const healthCheck = await frameworkSetup.validateFrameworkHealth();
        if (healthCheck) {
          console.log("✅ Framework is healthy and ready for use");
          process.exit(0);
        } else {
          console.log("⚠️  Framework setup completed but health check failed");
          console.log("🔧 Attempting repair...");
          const repairResult = await frameworkSetup.repairFramework();
          process.exit(repairResult ? 0 : 1);
        }
      } else {
        console.log("\n❌ Framework setup failed");
        console.log("🔧 Attempting repair...");
        const repairResult = await frameworkSetup.repairFramework();
        process.exit(repairResult ? 0 : 1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Framework setup crashed:", error);
      process.exit(1);
    });
}
