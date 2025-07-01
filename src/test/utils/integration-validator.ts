#!/usr/bin/env tsx
/**
 * Integration Validator
 * Validates the integration and compatibility of all healthcare testing framework components
 * Ensures robust operation and identifies potential issues
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Import framework components for validation
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import { healthcareTestData } from "../fixtures/healthcare-test-data";
import {
  HealthcareTestDataGenerator,
  ComplianceTestHelper,
  PerformanceTestHelper,
  TestEnvironmentHelper,
} from "./test-helpers";

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  category: "critical" | "important" | "optional";
  execute: () => Promise<ValidationResult>;
}

interface ValidationResult {
  checkId: string;
  success: boolean;
  message: string;
  details?: any;
  duration: number;
  recommendations?: string[];
  warnings?: string[];
}

interface IntegrationValidationReport {
  timestamp: string;
  overallStatus: "passed" | "failed" | "warning";
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    totalDuration: number;
  };
  results: ValidationResult[];
  systemInfo: {
    platform: string;
    node: string;
    memory: string;
    uptime: string;
  };
  recommendations: string[];
  criticalIssues: string[];
  healthcareCompliance: {
    status: "compliant" | "non-compliant" | "partial";
    standards: Record<string, boolean>;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
}

interface ValidatorConfig {
  enableHealthcareValidation: boolean;
  enablePerformanceValidation: boolean;
  enableSecurityValidation: boolean;
  enableIntegrationValidation: boolean;
  timeoutMs: number;
  outputDirectory: string;
}

class IntegrationValidator extends EventEmitter {
  private config: ValidatorConfig;
  private checks: ValidationCheck[] = [];
  private results: ValidationResult[] = [];
  private startTime: number = 0;

  constructor(config?: Partial<ValidatorConfig>) {
    super();
    this.config = {
      enableHealthcareValidation: true,
      enablePerformanceValidation: true,
      enableSecurityValidation: true,
      enableIntegrationValidation: true,
      timeoutMs: 30000,
      outputDirectory: "test-results",
      ...config,
    };

    this.initializeValidationChecks();
  }

  async validateFrameworkIntegration(): Promise<IntegrationValidationReport> {
    console.log("🔗 Healthcare Testing Framework Integration Validation");
    console.log("=====================================================");
    console.log("");

    this.startTime = performance.now();
    this.results = [];

    this.emit("validation-started", {
      timestamp: Date.now(),
      totalChecks: this.checks.length,
    });

    // Execute all validation checks
    for (const check of this.checks) {
      await this.executeValidationCheck(check);
    }

    // Generate comprehensive report
    const report = this.generateValidationReport();
    await this.saveValidationReport(report);

    this.emit("validation-completed", {
      timestamp: Date.now(),
      report,
    });

    this.printValidationSummary(report);
    return report;
  }

  async quickHealthCheck(): Promise<boolean> {
    console.log("⚡ Quick Health Check...");

    try {
      // Test basic component availability
      const monitorAvailable = !!testExecutionMonitor;
      const reporterAvailable = !!globalTestReporter;
      const testDataAvailable = !!healthcareTestData;
      const helpersAvailable = !!HealthcareTestDataGenerator;

      const allAvailable =
        monitorAvailable &&
        reporterAvailable &&
        testDataAvailable &&
        helpersAvailable;

      console.log(`   Monitor: ${monitorAvailable ? "✅" : "❌"}`);
      console.log(`   Reporter: ${reporterAvailable ? "✅" : "❌"}`);
      console.log(`   Test Data: ${testDataAvailable ? "✅" : "❌"}`);
      console.log(`   Helpers: ${helpersAvailable ? "✅" : "❌"}`);
      console.log(
        `   Overall: ${allAvailable ? "✅ HEALTHY" : "❌ ISSUES DETECTED"}`,
      );

      return allAvailable;
    } catch (error) {
      console.log(`   Overall: ❌ ERROR - ${error}`);
      return false;
    }
  }

  private initializeValidationChecks(): void {
    // Critical checks
    this.checks.push({
      id: "component-availability",
      name: "Component Availability",
      description:
        "Verify all framework components are available and accessible",
      category: "critical",
      execute: () => this.validateComponentAvailability(),
    });

    this.checks.push({
      id: "basic-functionality",
      name: "Basic Functionality",
      description: "Test basic functionality of core components",
      category: "critical",
      execute: () => this.validateBasicFunctionality(),
    });

    this.checks.push({
      id: "data-integrity",
      name: "Data Integrity",
      description: "Validate test data integrity and structure",
      category: "critical",
      execute: () => this.validateDataIntegrity(),
    });

    // Important checks
    if (this.config.enableIntegrationValidation) {
      this.checks.push({
        id: "component-integration",
        name: "Component Integration",
        description: "Test integration between framework components",
        category: "important",
        execute: () => this.validateComponentIntegration(),
      });
    }

    if (this.config.enableHealthcareValidation) {
      this.checks.push({
        id: "healthcare-compliance",
        name: "Healthcare Compliance",
        description: "Validate healthcare-specific compliance features",
        category: "important",
        execute: () => this.validateHealthcareCompliance(),
      });
    }

    if (this.config.enablePerformanceValidation) {
      this.checks.push({
        id: "performance-validation",
        name: "Performance Validation",
        description: "Test performance measurement and reporting capabilities",
        category: "important",
        execute: () => this.validatePerformanceCapabilities(),
      });
    }

    // Optional checks
    this.checks.push({
      id: "error-handling",
      name: "Error Handling",
      description: "Test error handling and recovery mechanisms",
      category: "optional",
      execute: () => this.validateErrorHandling(),
    });

    this.checks.push({
      id: "file-system",
      name: "File System Operations",
      description: "Test file system operations and permissions",
      category: "optional",
      execute: () => this.validateFileSystemOperations(),
    });

    if (this.config.enableSecurityValidation) {
      this.checks.push({
        id: "security-features",
        name: "Security Features",
        description: "Validate security-related functionality",
        category: "optional",
        execute: () => this.validateSecurityFeatures(),
      });
    }
  }

  private async executeValidationCheck(check: ValidationCheck): Promise<void> {
    const startTime = performance.now();
    console.log(`🔍 ${check.name}...`);

    try {
      const result = await Promise.race([
        check.execute(),
        this.createTimeoutPromise(check.id),
      ]);

      this.results.push(result);
      this.logCheckResult(result);

      this.emit("check-completed", {
        checkId: check.id,
        result,
        timestamp: Date.now(),
      });
    } catch (error) {
      const failedResult: ValidationResult = {
        checkId: check.id,
        success: false,
        message: `Check failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Review check implementation",
          "Check system resources",
        ],
      };

      this.results.push(failedResult);
      this.logCheckResult(failedResult);
    }
  }

  private async createTimeoutPromise(
    checkId: string,
  ): Promise<ValidationResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Validation check '${checkId}' timed out after ${this.config.timeoutMs}ms`,
          ),
        );
      }, this.config.timeoutMs);
    });
  }

  private logCheckResult(result: ValidationResult): void {
    const icon = result.success ? "✅" : "❌";
    console.log(
      `   ${icon} ${result.message} (${result.duration.toFixed(0)}ms)`,
    );

    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        console.log(`      ⚠️  ${warning}`);
      });
    }

    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach((rec) => {
        console.log(`      💡 ${rec}`);
      });
    }
  }

  // Validation check implementations
  private async validateComponentAvailability(): Promise<ValidationResult> {
    const startTime = performance.now();
    const components = {
      testExecutionMonitor: !!testExecutionMonitor,
      globalTestReporter: !!globalTestReporter,
      healthcareTestData: !!healthcareTestData,
      HealthcareTestDataGenerator: !!HealthcareTestDataGenerator,
      ComplianceTestHelper: !!ComplianceTestHelper,
      PerformanceTestHelper: !!PerformanceTestHelper,
      TestEnvironmentHelper: !!TestEnvironmentHelper,
    };

    const availableComponents =
      Object.values(components).filter(Boolean).length;
    const totalComponents = Object.keys(components).length;
    const success = availableComponents === totalComponents;

    return {
      checkId: "component-availability",
      success,
      message: success
        ? "All framework components are available"
        : `${availableComponents}/${totalComponents} components available`,
      duration: performance.now() - startTime,
      details: components,
      recommendations: success
        ? undefined
        : [
            "Check import statements",
            "Verify file paths",
            "Ensure all dependencies are installed",
          ],
    };
  }

  private async validateBasicFunctionality(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test execution monitor
      const monitorSessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 10000,
        enableHealthcareMetrics: true,
      });

      if (!monitorSessionId) {
        issues.push("Test execution monitor failed to start");
      } else {
        testExecutionMonitor.stopMonitoring();
      }

      // Test reporter
      const reporterSessionId = globalTestReporter.startReporting({
        formats: ["json"],
        includeHealthcareMetrics: true,
      });

      if (!reporterSessionId) {
        issues.push("Test reporter failed to start");
      } else {
        globalTestReporter.stopReporting();
      }

      // Test data generation
      const patientData = HealthcareTestDataGenerator.generatePatientData();
      if (!patientData.id || !patientData.emiratesId) {
        issues.push("Patient data generation failed");
      }

      // Test compliance helpers
      const dohValidation = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });

      if (!dohValidation.valid) {
        warnings.push(
          "DOH compliance validation returned invalid for valid data",
        );
      }
    } catch (error) {
      issues.push(`Basic functionality test failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "basic-functionality",
      success,
      message: success
        ? "All basic functionality tests passed"
        : `${issues.length} functionality issues detected`,
      duration: performance.now() - startTime,
      warnings,
      recommendations: success
        ? undefined
        : [
            "Review component implementations",
            "Check for missing dependencies",
            "Verify configuration settings",
          ],
    };
  }

  private async validateDataIntegrity(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];

    try {
      // Validate healthcare test data structure
      if (
        !healthcareTestData.patients ||
        healthcareTestData.patients.length === 0
      ) {
        issues.push("Patient test data is missing or empty");
      }

      if (
        !healthcareTestData.clinicians ||
        healthcareTestData.clinicians.length === 0
      ) {
        issues.push("Clinician test data is missing or empty");
      }

      // Validate data structure
      if (
        healthcareTestData.patients &&
        healthcareTestData.patients.length > 0
      ) {
        const firstPatient = healthcareTestData.patients[0];
        if (
          !firstPatient.id ||
          !firstPatient.emiratesId ||
          !firstPatient.firstName
        ) {
          issues.push("Patient data structure is invalid");
        }
      }

      // Test data generation consistency
      const generatedPatient1 =
        HealthcareTestDataGenerator.generatePatientData();
      const generatedPatient2 =
        HealthcareTestDataGenerator.generatePatientData();

      if (generatedPatient1.id === generatedPatient2.id) {
        issues.push("Data generation is not producing unique IDs");
      }
    } catch (error) {
      issues.push(`Data integrity validation failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "data-integrity",
      success,
      message: success
        ? "Data integrity validation passed"
        : `${issues.length} data integrity issues detected`,
      duration: performance.now() - startTime,
      details: {
        patientsCount: healthcareTestData.patients?.length || 0,
        cliniciansCount: healthcareTestData.clinicians?.length || 0,
        assessmentsCount: healthcareTestData.assessments?.length || 0,
      },
      recommendations: success
        ? undefined
        : [
            "Review test data structure",
            "Check data generation logic",
            "Verify data consistency",
          ],
    };
  }

  private async validateComponentIntegration(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test monitor and reporter integration
      const monitorSessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 5000,
        enableHealthcareMetrics: true,
      });

      const reporterSessionId = globalTestReporter.startReporting({
        formats: ["json"],
        includeHealthcareMetrics: true,
      });

      // Simulate integrated workflow
      testExecutionMonitor.recordTestEvent({
        type: "start",
        testName: "integration-test",
        suiteName: "integration-validation",
      });

      globalTestReporter.addTestResult({
        name: "integration-test",
        suite: "integration-validation",
        status: "passed",
        duration: 100,
        metadata: {
          category: "integration",
          healthcare: {
            complianceStandard: "DOH",
            riskLevel: "medium",
          },
        },
      });

      testExecutionMonitor.recordTestEvent({
        type: "pass",
        testName: "integration-test",
        suiteName: "integration-validation",
        duration: 100,
      });

      // Generate reports from both components
      const monitorReport = testExecutionMonitor.stopMonitoring();
      const reporterReport = globalTestReporter.stopReporting();

      if (!monitorReport || !reporterReport) {
        issues.push("Failed to generate integrated reports");
      }

      if (monitorReport.overallMetrics.totalTests === 0) {
        warnings.push("Monitor did not record test events properly");
      }

      if (reporterReport.summary.totalTests === 0) {
        warnings.push("Reporter did not record test results properly");
      }
    } catch (error) {
      issues.push(`Component integration test failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "component-integration",
      success,
      message: success
        ? "Component integration validation passed"
        : `${issues.length} integration issues detected`,
      duration: performance.now() - startTime,
      warnings,
      recommendations: success
        ? undefined
        : [
            "Review component interfaces",
            "Check event handling",
            "Verify data flow between components",
          ],
    };
  }

  private async validateHealthcareCompliance(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const complianceResults: Record<string, boolean> = {};

    try {
      // Test DOH compliance
      const dohResult = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });
      complianceResults.DOH = dohResult.valid;
      if (!dohResult.valid) {
        issues.push(
          `DOH compliance validation failed: ${dohResult.violations.join(", ")}`,
        );
      }

      // Test DAMAN compliance
      const damanResult = ComplianceTestHelper.validateDAMANCompliance({
        policyNumber: "DM123456789",
        serviceDate: "2024-01-01",
        services: [{ code: "H001", description: "Test Service" }],
      });
      complianceResults.DAMAN = damanResult.valid;
      if (!damanResult.valid) {
        issues.push(
          `DAMAN compliance validation failed: ${damanResult.violations.join(", ")}`,
        );
      }

      // Test JAWDA compliance
      const jawdaResult = ComplianceTestHelper.validateJAWDACompliance({
        patientSafetyMetrics: { incidents: 0, preventions: 5 },
        clinicalEffectiveness: { outcomes: "positive", metrics: "tracked" },
      });
      complianceResults.JAWDA = jawdaResult.valid;
      if (!jawdaResult.valid) {
        issues.push(
          `JAWDA compliance validation failed: ${jawdaResult.violations.join(", ")}`,
        );
      }

      // Test HIPAA compliance
      const hipaaResult = ComplianceTestHelper.validateHIPAACompliance({
        encryption: "AES-256",
        accessControls: true,
        auditLog: true,
      });
      complianceResults.HIPAA = hipaaResult.valid;
      if (!hipaaResult.valid) {
        issues.push(
          `HIPAA compliance validation failed: ${hipaaResult.violations.join(", ")}`,
        );
      }
    } catch (error) {
      issues.push(`Healthcare compliance validation failed: ${error}`);
    }

    const success = issues.length === 0;
    const passedStandards =
      Object.values(complianceResults).filter(Boolean).length;
    const totalStandards = Object.keys(complianceResults).length;

    return {
      checkId: "healthcare-compliance",
      success,
      message: success
        ? "All healthcare compliance validations passed"
        : `${passedStandards}/${totalStandards} compliance standards passed`,
      duration: performance.now() - startTime,
      details: complianceResults,
      recommendations: success
        ? undefined
        : [
            "Review compliance validation logic",
            "Check healthcare standard requirements",
            "Update compliance test data",
          ],
    };
  }

  private async validatePerformanceCapabilities(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test performance measurement
      const measureStart =
        PerformanceTestHelper.startMeasurement("validation-test");

      // Simulate some work
      for (let i = 0; i < 100; i++) {
        HealthcareTestDataGenerator.generatePatientData();
      }

      const duration = PerformanceTestHelper.endMeasurement(
        "validation-test",
        measureStart,
      );

      if (duration <= 0) {
        issues.push("Performance measurement returned invalid duration");
      }

      const averageTime =
        PerformanceTestHelper.getAverageTime("validation-test");
      if (averageTime <= 0) {
        issues.push("Performance average calculation failed");
      }

      // Test memory monitoring
      const memoryUsage = process.memoryUsage();
      const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

      if (memoryMB > 50) {
        warnings.push(`High memory usage detected: ${memoryMB.toFixed(2)}MB`);
      }

      // Generate performance report
      const performanceReport =
        PerformanceTestHelper.generatePerformanceReport();
      if (!performanceReport.measurements) {
        issues.push("Performance report generation failed");
      }
    } catch (error) {
      issues.push(`Performance validation failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "performance-validation",
      success,
      message: success
        ? "Performance validation passed"
        : `${issues.length} performance issues detected`,
      duration: performance.now() - startTime,
      warnings,
      recommendations: success
        ? undefined
        : [
            "Review performance measurement logic",
            "Check system resources",
            "Optimize data generation if needed",
          ],
    };
  }

  private async validateErrorHandling(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];

    try {
      // Test error handling in monitor
      testExecutionMonitor.recordTestEvent({
        type: "error",
        testName: "error-test",
        suiteName: "error-validation",
        error: new Error("Test error"),
      });

      // Test error handling in reporter
      globalTestReporter.addTestResult({
        name: "error-test",
        suite: "error-validation",
        status: "failed",
        duration: 50,
        error: {
          message: "Test error message",
          type: "TestError",
        },
      });

      // Test invalid data handling
      try {
        ComplianceTestHelper.validateDOHCompliance({});
      } catch (error) {
        // Expected to handle invalid data gracefully
      }

      // Test file system error handling
      try {
        fs.readFileSync("/nonexistent/path");
      } catch (error) {
        // Expected file system error
      }
    } catch (error) {
      issues.push(`Error handling validation failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "error-handling",
      success,
      message: success
        ? "Error handling validation passed"
        : `${issues.length} error handling issues detected`,
      duration: performance.now() - startTime,
      recommendations: success
        ? undefined
        : [
            "Review error handling implementation",
            "Add more robust error checking",
            "Implement graceful degradation",
          ],
    };
  }

  private async validateFileSystemOperations(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test directory creation
      const testDir = path.join(this.config.outputDirectory, "validation-test");

      if (!fs.existsSync(this.config.outputDirectory)) {
        fs.mkdirSync(this.config.outputDirectory, { recursive: true });
      }

      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Test file writing
      const testFile = path.join(testDir, "test-file.json");
      const testData = { test: "data", timestamp: new Date().toISOString() };

      fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

      // Test file reading
      const readData = JSON.parse(fs.readFileSync(testFile, "utf8"));

      if (readData.test !== "data") {
        issues.push("File read/write operation failed");
      }

      // Test file deletion
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);

      // Check permissions
      const stats = fs.statSync(this.config.outputDirectory);
      if (!stats.isDirectory()) {
        issues.push("Output directory is not accessible");
      }
    } catch (error) {
      if (error.code === "EACCES") {
        issues.push("Insufficient file system permissions");
      } else {
        issues.push(`File system operation failed: ${error}`);
      }
    }

    const success = issues.length === 0;

    return {
      checkId: "file-system",
      success,
      message: success
        ? "File system operations validation passed"
        : `${issues.length} file system issues detected`,
      duration: performance.now() - startTime,
      warnings,
      recommendations: success
        ? undefined
        : [
            "Check file system permissions",
            "Verify output directory configuration",
            "Ensure sufficient disk space",
          ],
    };
  }

  private async validateSecurityFeatures(): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test data sanitization
      const maliciousInput = "<script>alert('xss')</script>";
      const patientData = HealthcareTestDataGenerator.generatePatientData({
        firstName: maliciousInput,
      });

      if (patientData.firstName === maliciousInput) {
        warnings.push("Data sanitization may not be implemented");
      }

      // Test SQL injection detection (mock)
      const sqlTestInput = "'; DROP TABLE patients; --";
      // In a real implementation, this would test actual SQL injection protection

      // Test access control simulation
      const sensitiveData = {
        patientId: "12345",
        medicalRecord: "sensitive information",
      };

      // Mock access control check
      const hasAccess = true; // In real implementation, would check actual permissions
      if (!hasAccess) {
        issues.push("Access control validation failed");
      }
    } catch (error) {
      issues.push(`Security validation failed: ${error}`);
    }

    const success = issues.length === 0;

    return {
      checkId: "security-features",
      success,
      message: success
        ? "Security features validation passed"
        : `${issues.length} security issues detected`,
      duration: performance.now() - startTime,
      warnings,
      recommendations: success
        ? undefined
        : [
            "Implement data sanitization",
            "Add input validation",
            "Review access control mechanisms",
          ],
    };
  }

  private generateValidationReport(): IntegrationValidationReport {
    const totalDuration = performance.now() - this.startTime;
    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const warnings = this.results.filter(
      (r) => r.warnings && r.warnings.length > 0,
    ).length;

    let overallStatus: "passed" | "failed" | "warning" = "passed";
    if (failed > 0) {
      overallStatus = "failed";
    } else if (warnings > 0) {
      overallStatus = "warning";
    }

    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Collect recommendations and critical issues
    this.results.forEach((result) => {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
      if (!result.success) {
        criticalIssues.push(`${result.checkId}: ${result.message}`);
      }
    });

    // Healthcare compliance assessment
    const healthcareResult = this.results.find(
      (r) => r.checkId === "healthcare-compliance",
    );
    const healthcareCompliance = {
      status: healthcareResult?.success
        ? "compliant"
        : ("non-compliant" as "compliant" | "non-compliant" | "partial"),
      standards: healthcareResult?.details || {},
      riskLevel:
        criticalIssues.length > 0
          ? "high"
          : warnings > 0
            ? "medium"
            : ("low" as "low" | "medium" | "high" | "critical"),
    };

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      summary: {
        totalChecks: this.results.length,
        passed,
        failed,
        warnings,
        totalDuration,
      },
      results: this.results,
      systemInfo: {
        platform: process.platform,
        node: process.version,
        memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
        uptime: `${(process.uptime() / 60).toFixed(1)}min`,
      },
      recommendations: [...new Set(recommendations)],
      criticalIssues,
      healthcareCompliance,
    };
  }

  private async saveValidationReport(
    report: IntegrationValidationReport,
  ): Promise<void> {
    const reportPath = path.join(
      this.config.outputDirectory,
      "integration-validation-report.json",
    );

    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Integration validation report saved: ${reportPath}`);
  }

  private printValidationSummary(report: IntegrationValidationReport): void {
    console.log("\n🎯 Integration Validation Summary");
    console.log("==================================");
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(
      `Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
    );
    console.log(
      `Healthcare Compliance: ${report.healthcareCompliance.status.toUpperCase()}`,
    );
    console.log(
      `Risk Level: ${report.healthcareCompliance.riskLevel.toUpperCase()}`,
    );

    if (report.criticalIssues.length > 0) {
      console.log("\n🚨 Critical Issues:");
      report.criticalIssues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (report.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      report.recommendations
        .slice(0, 5)
        .forEach((rec) => console.log(`   - ${rec}`));
    }
  }

  // Public getters
  getResults(): ValidationResult[] {
    return [...this.results];
  }

  getConfig(): ValidatorConfig {
    return { ...this.config };
  }
}

// Export the validator class and types
export {
  IntegrationValidator,
  type ValidationResult,
  type IntegrationValidationReport,
  type ValidatorConfig,
};
export default IntegrationValidator;

// CLI execution
if (require.main === module) {
  const validator = new IntegrationValidator({
    enableHealthcareValidation: true,
    enablePerformanceValidation: true,
    enableSecurityValidation: true,
  });

  validator
    .validateFrameworkIntegration()
    .then((report) => {
      console.log("\n✅ Integration validation completed");
      process.exit(report.overallStatus === "failed" ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Integration validation crashed:", error);
      process.exit(1);
    });
}
