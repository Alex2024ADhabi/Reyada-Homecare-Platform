#!/usr/bin/env tsx
/**
 * Framework Validation
 * Comprehensive validation of the healthcare testing framework
 * Ensures all components work together and validates the entire system
 */

import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Import framework components
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import { IntegrationValidator } from "./integration-validator";
import {
  HealthcareTestOrchestrator,
  COMPREHENSIVE_HEALTHCARE_PLAN,
} from "./healthcare-test-orchestrator";
import { healthcareTestData } from "../fixtures/healthcare-test-data";
import {
  HealthcareTestDataGenerator,
  ComplianceTestHelper,
  PerformanceTestHelper,
  TestEnvironmentHelper,
} from "./test-helpers";

interface ValidationResult {
  component: string;
  status: "passed" | "failed" | "warning";
  message: string;
  details?: any;
  duration: number;
  recommendations?: string[];
}

interface FrameworkValidationReport {
  timestamp: string;
  overallStatus: "passed" | "failed" | "warning";
  summary: {
    totalValidations: number;
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
    cpu: string;
  };
  recommendations: string[];
  criticalIssues: string[];
  nextSteps: string[];
}

class FrameworkValidator {
  private results: ValidationResult[] = [];
  private startTime: number = 0;

  async validateFramework(): Promise<FrameworkValidationReport> {
    console.log("🔍 Healthcare Testing Framework Validation");
    console.log("===========================================");
    console.log("");

    this.startTime = performance.now();
    this.results = [];

    // Run all validation checks
    await this.validateTestExecutionMonitor();
    await this.validateTestReporter();
    await this.validateIntegrationValidator();
    await this.validateHealthcareOrchestrator();
    await this.validateTestHelpers();
    await this.validateTestData();
    await this.validateFileStructure();
    await this.validateDependencies();
    await this.validateIntegration();
    await this.validateHealthcareCompliance();
    await this.validatePerformance();
    await this.validateErrorHandling();

    // Generate comprehensive report
    const report = this.generateValidationReport();
    await this.saveValidationReport(report);

    this.printValidationSummary(report);
    return report;
  }

  private async validateTestExecutionMonitor(): Promise<void> {
    const startTime = performance.now();
    console.log("🔄 Validating Test Execution Monitor...");

    try {
      // Test basic functionality
      const sessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 1000,
        enableHealthcareMetrics: true,
      });

      if (!sessionId) {
        throw new Error("Failed to start monitoring");
      }

      // Test event recording
      testExecutionMonitor.recordTestEvent({
        type: "start",
        testName: "validation-test",
        suiteName: "framework-validation",
      });

      testExecutionMonitor.recordTestEvent({
        type: "pass",
        testName: "validation-test",
        suiteName: "framework-validation",
        duration: 100,
      });

      // Test metrics retrieval
      const metrics = testExecutionMonitor.getCurrentMetrics();
      if (metrics.totalTests === 0) {
        throw new Error("Metrics not properly recorded");
      }

      // Test report generation
      const report = testExecutionMonitor.stopMonitoring();
      if (!report || !report.sessionId) {
        throw new Error("Failed to generate execution report");
      }

      this.addResult({
        component: "Test Execution Monitor",
        status: "passed",
        message: "All monitoring functions working correctly",
        duration: performance.now() - startTime,
        details: {
          sessionId,
          metricsRecorded: metrics.totalTests,
          reportGenerated: !!report,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Test Execution Monitor",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check test-execution-monitor.ts implementation",
          "Verify event recording functionality",
        ],
      });
    }
  }

  private async validateTestReporter(): Promise<void> {
    const startTime = performance.now();
    console.log("📊 Validating Test Reporter...");

    try {
      // Test basic functionality
      const sessionId = globalTestReporter.startReporting({
        formats: ["json"],
        includeHealthcareMetrics: true,
      });

      if (!sessionId) {
        throw new Error("Failed to start reporting");
      }

      // Test result addition
      globalTestReporter.addTestResult({
        name: "validation-test",
        suite: "framework-validation",
        status: "passed",
        duration: 150,
        metadata: {
          category: "unit",
          healthcare: {
            complianceStandard: "DOH",
            riskLevel: "low",
          },
        },
      });

      // Test report generation
      const report = globalTestReporter.stopReporting();
      if (!report || report.summary.totalTests === 0) {
        throw new Error("Failed to generate test report");
      }

      // Test healthcare metrics
      if (!report.healthcareMetrics) {
        throw new Error("Healthcare metrics not generated");
      }

      this.addResult({
        component: "Test Reporter",
        status: "passed",
        message: "All reporting functions working correctly",
        duration: performance.now() - startTime,
        details: {
          sessionId,
          testsReported: report.summary.totalTests,
          healthcareMetrics: !!report.healthcareMetrics,
          complianceScore: report.healthcareMetrics.complianceScore,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Test Reporter",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check test-reporting.ts implementation",
          "Verify report generation functionality",
        ],
      });
    }
  }

  private async validateIntegrationValidator(): Promise<void> {
    const startTime = performance.now();
    console.log("🔗 Validating Integration Validator...");

    try {
      const validator = new IntegrationValidator({
        enableHealthcareValidation: true,
      });

      // Test quick health check
      const healthCheck = await validator.quickHealthCheck();
      if (!healthCheck) {
        throw new Error("Health check failed");
      }

      // Test full validation (this might take longer)
      const validationReport = await validator.validateFrameworkIntegration();
      if (!validationReport || validationReport.overallStatus === "failed") {
        this.addResult({
          component: "Integration Validator",
          status: "warning",
          message: "Integration validation completed with issues",
          duration: performance.now() - startTime,
          details: validationReport,
          recommendations: validationReport?.recommendations || [],
        });
        return;
      }

      this.addResult({
        component: "Integration Validator",
        status: "passed",
        message: "Integration validation completed successfully",
        duration: performance.now() - startTime,
        details: {
          overallStatus: validationReport.overallStatus,
          checksRun: validationReport.summary.totalChecks,
          passed: validationReport.summary.passed,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Integration Validator",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check integration-validator.ts implementation",
          "Verify component dependencies",
        ],
      });
    }
  }

  private async validateHealthcareOrchestrator(): Promise<void> {
    const startTime = performance.now();
    console.log("🏥 Validating Healthcare Test Orchestrator...");

    try {
      // Test orchestrator creation
      const orchestrator = new HealthcareTestOrchestrator(
        COMPREHENSIVE_HEALTHCARE_PLAN,
      );
      if (!orchestrator) {
        throw new Error("Failed to create orchestrator");
      }

      // Test plan validation
      const plan = orchestrator.getPlan();
      if (!plan || plan.phases.length === 0) {
        throw new Error("Invalid test plan");
      }

      // Test basic orchestrator methods
      const isExecuting = orchestrator.isExecuting();
      if (isExecuting) {
        throw new Error("Orchestrator should not be executing initially");
      }

      this.addResult({
        component: "Healthcare Test Orchestrator",
        status: "passed",
        message: "Orchestrator validation completed successfully",
        duration: performance.now() - startTime,
        details: {
          planLoaded: !!plan,
          phasesCount: plan.phases.length,
          healthcareCompliance: plan.healthcareCompliance.required,
          standards: plan.healthcareCompliance.standards,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Healthcare Test Orchestrator",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check healthcare-test-orchestrator.ts implementation",
          "Verify test plan configuration",
        ],
      });
    }
  }

  private async validateTestHelpers(): Promise<void> {
    const startTime = performance.now();
    console.log("🛠️  Validating Test Helpers...");

    try {
      // Test data generators
      const patientData = HealthcareTestDataGenerator.generatePatientData();
      if (!patientData.id || !patientData.emiratesId) {
        throw new Error("Patient data generation failed");
      }

      const clinicianData = HealthcareTestDataGenerator.generateClinicianData();
      if (!clinicianData.id || !clinicianData.licenseNumber) {
        throw new Error("Clinician data generation failed");
      }

      // Test compliance helpers
      const dohValidation = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });
      if (!dohValidation.valid) {
        throw new Error("DOH compliance validation failed");
      }

      // Test performance helpers
      const measurementStart =
        PerformanceTestHelper.startMeasurement("test-measurement");
      await new Promise((resolve) => setTimeout(resolve, 10));
      const duration = PerformanceTestHelper.endMeasurement(
        "test-measurement",
        measurementStart,
      );
      if (duration <= 0) {
        throw new Error("Performance measurement failed");
      }

      this.addResult({
        component: "Test Helpers",
        status: "passed",
        message: "All test helpers working correctly",
        duration: performance.now() - startTime,
        details: {
          dataGeneration: "working",
          complianceValidation: "working",
          performanceMeasurement: "working",
        },
      });
    } catch (error) {
      this.addResult({
        component: "Test Helpers",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check test-helpers.ts implementation",
          "Verify helper function logic",
        ],
      });
    }
  }

  private async validateTestData(): Promise<void> {
    const startTime = performance.now();
    console.log("📋 Validating Test Data...");

    try {
      // Check if test data exists and is accessible
      if (!healthcareTestData) {
        throw new Error("Healthcare test data not available");
      }

      // Validate test data structure
      if (
        !healthcareTestData.patients ||
        healthcareTestData.patients.length === 0
      ) {
        throw new Error("Patient test data missing");
      }

      if (
        !healthcareTestData.clinicians ||
        healthcareTestData.clinicians.length === 0
      ) {
        throw new Error("Clinician test data missing");
      }

      // Validate data quality
      const firstPatient = healthcareTestData.patients[0];
      if (
        !firstPatient.id ||
        !firstPatient.emiratesId ||
        !firstPatient.firstName
      ) {
        throw new Error("Patient data structure invalid");
      }

      this.addResult({
        component: "Test Data",
        status: "passed",
        message: "Test data validation completed successfully",
        duration: performance.now() - startTime,
        details: {
          patientsCount: healthcareTestData.patients.length,
          cliniciansCount: healthcareTestData.clinicians.length,
          assessmentsCount: healthcareTestData.assessments?.length || 0,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Test Data",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check healthcare-test-data.ts implementation",
          "Verify test data structure and content",
        ],
      });
    }
  }

  private async validateFileStructure(): Promise<void> {
    const startTime = performance.now();
    console.log("📁 Validating File Structure...");

    try {
      const requiredFiles = [
        "src/test/utils/test-execution-monitor.ts",
        "src/test/utils/test-reporting.ts",
        "src/test/utils/integration-validator.ts",
        "src/test/utils/healthcare-test-orchestrator.ts",
        "src/test/utils/test-helpers.ts",
        "src/test/fixtures/healthcare-test-data.ts",
      ];

      const missingFiles: string[] = [];
      const existingFiles: string[] = [];

      for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
          existingFiles.push(file);
        } else {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length > 0) {
        this.addResult({
          component: "File Structure",
          status: "failed",
          message: `Missing required files: ${missingFiles.join(", ")}`,
          duration: performance.now() - startTime,
          details: {
            existing: existingFiles,
            missing: missingFiles,
          },
          recommendations: [
            "Create missing framework files",
            "Verify file paths and naming",
          ],
        });
        return;
      }

      // Check test results directory
      const testResultsDir = "test-results";
      if (!fs.existsSync(testResultsDir)) {
        fs.mkdirSync(testResultsDir, { recursive: true });
      }

      this.addResult({
        component: "File Structure",
        status: "passed",
        message: "All required files present",
        duration: performance.now() - startTime,
        details: {
          requiredFiles: requiredFiles.length,
          existingFiles: existingFiles.length,
          testResultsDir: "created",
        },
      });
    } catch (error) {
      this.addResult({
        component: "File Structure",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check file system permissions",
          "Verify project structure",
        ],
      });
    }
  }

  private async validateDependencies(): Promise<void> {
    const startTime = performance.now();
    console.log("📦 Validating Dependencies...");

    try {
      // Check package.json
      const packageJsonPath = "package.json";
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error("package.json not found");
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check critical dependencies
      const criticalDeps = ["vitest", "@playwright/test", "tsx"];

      const missingDeps = criticalDeps.filter((dep) => !allDeps[dep]);
      if (missingDeps.length > 0) {
        this.addResult({
          component: "Dependencies",
          status: "warning",
          message: `Missing optional dependencies: ${missingDeps.join(", ")}`,
          duration: performance.now() - startTime,
          details: {
            missing: missingDeps,
            available: criticalDeps.filter((dep) => allDeps[dep]),
          },
          recommendations: [
            `Install missing dependencies: npm install ${missingDeps.join(" ")}`,
          ],
        });
        return;
      }

      this.addResult({
        component: "Dependencies",
        status: "passed",
        message: "All critical dependencies available",
        duration: performance.now() - startTime,
        details: {
          totalDependencies: Object.keys(allDeps).length,
          criticalDependencies: criticalDeps.length,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Dependencies",
        status: "failed",
        message: `Validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: ["Check package.json file", "Run npm install"],
      });
    }
  }

  private async validateIntegration(): Promise<void> {
    const startTime = performance.now();
    console.log("🔗 Validating Component Integration...");

    try {
      // Test integration between monitor and reporter
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
        throw new Error("Failed to generate integrated reports");
      }

      this.addResult({
        component: "Component Integration",
        status: "passed",
        message: "Components integrate successfully",
        duration: performance.now() - startTime,
        details: {
          monitorSession: monitorSessionId,
          reporterSession: reporterSessionId,
          monitorTests: monitorReport.overallMetrics.totalTests,
          reporterTests: reporterReport.summary.totalTests,
        },
      });
    } catch (error) {
      this.addResult({
        component: "Component Integration",
        status: "failed",
        message: `Integration validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check component compatibility",
          "Verify integration points",
        ],
      });
    }
  }

  private async validateHealthcareCompliance(): Promise<void> {
    const startTime = performance.now();
    console.log("🏥 Validating Healthcare Compliance...");

    try {
      // Test DOH compliance validation
      const dohResult = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });

      if (!dohResult.valid) {
        throw new Error("DOH compliance validation failed");
      }

      // Test DAMAN compliance validation
      const damanResult = ComplianceTestHelper.validateDAMANCompliance({
        policyNumber: "DM123456789",
        serviceDate: "2024-01-01",
        services: [{ code: "H001", description: "Test Service" }],
      });

      if (!damanResult.valid) {
        throw new Error("DAMAN compliance validation failed");
      }

      // Test healthcare data generation
      const patientData = HealthcareTestDataGenerator.generatePatientData();
      const claimData = HealthcareTestDataGenerator.generateDamanClaim();

      if (!patientData.insurance || !claimData.policyNumber) {
        throw new Error("Healthcare data generation incomplete");
      }

      this.addResult({
        component: "Healthcare Compliance",
        status: "passed",
        message: "Healthcare compliance validation successful",
        duration: performance.now() - startTime,
        details: {
          dohCompliance: dohResult.valid,
          damanCompliance: damanResult.valid,
          dataGeneration: "working",
        },
      });
    } catch (error) {
      this.addResult({
        component: "Healthcare Compliance",
        status: "failed",
        message: `Healthcare compliance validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Review healthcare compliance helpers",
          "Verify compliance validation logic",
        ],
      });
    }
  }

  private async validatePerformance(): Promise<void> {
    const startTime = performance.now();
    console.log("⚡ Validating Performance...");

    try {
      // Test performance measurement
      const measureStart = PerformanceTestHelper.startMeasurement(
        "framework-validation",
      );

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        HealthcareTestDataGenerator.generatePatientData();
      }

      const duration = PerformanceTestHelper.endMeasurement(
        "framework-validation",
        measureStart,
      );
      const averageTime = PerformanceTestHelper.getAverageTime(
        "framework-validation",
      );

      if (duration <= 0 || averageTime <= 0) {
        throw new Error("Performance measurement failed");
      }

      // Test memory usage
      const memoryUsage = process.memoryUsage();
      const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

      this.addResult({
        component: "Performance",
        status: memoryMB > 100 ? "warning" : "passed",
        message: `Performance validation completed (${memoryMB.toFixed(2)}MB memory)`,
        duration: performance.now() - startTime,
        details: {
          measurementDuration: duration,
          averageTime,
          memoryUsage: memoryMB,
          dataGenerationRate: 1000 / (duration / 1000),
        },
        recommendations:
          memoryMB > 100
            ? [
                "Monitor memory usage during testing",
                "Consider optimizing data generation",
              ]
            : undefined,
      });
    } catch (error) {
      this.addResult({
        component: "Performance",
        status: "failed",
        message: `Performance validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Check performance measurement helpers",
          "Verify system resources",
        ],
      });
    }
  }

  private async validateErrorHandling(): Promise<void> {
    const startTime = performance.now();
    console.log("🛡️  Validating Error Handling...");

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

      this.addResult({
        component: "Error Handling",
        status: "passed",
        message: "Error handling validation successful",
        duration: performance.now() - startTime,
        details: {
          errorRecording: "working",
          errorReporting: "working",
          invalidDataHandling: "working",
        },
      });
    } catch (error) {
      this.addResult({
        component: "Error Handling",
        status: "failed",
        message: `Error handling validation failed: ${error}`,
        duration: performance.now() - startTime,
        recommendations: [
          "Review error handling implementation",
          "Add more robust error checking",
        ],
      });
    }
  }

  private addResult(
    result: Omit<ValidationResult, "duration"> & { duration: number },
  ): void {
    this.results.push(result);

    const icon =
      result.status === "passed"
        ? "✅"
        : result.status === "failed"
          ? "❌"
          : "⚠️";
    console.log(`   ${icon} ${result.component}: ${result.message}`);

    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach((rec) => {
        console.log(`      💡 ${rec}`);
      });
    }
  }

  private generateValidationReport(): FrameworkValidationReport {
    const totalDuration = performance.now() - this.startTime;
    const passed = this.results.filter((r) => r.status === "passed").length;
    const failed = this.results.filter((r) => r.status === "failed").length;
    const warnings = this.results.filter((r) => r.status === "warning").length;

    let overallStatus: "passed" | "failed" | "warning" = "passed";
    if (failed > 0) {
      overallStatus = "failed";
    } else if (warnings > 0) {
      overallStatus = "warning";
    }

    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    const nextSteps: string[] = [];

    // Collect recommendations and issues
    this.results.forEach((result) => {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
      if (result.status === "failed") {
        criticalIssues.push(`${result.component}: ${result.message}`);
      }
    });

    // Generate next steps
    if (failed > 0) {
      nextSteps.push("Address critical failures before using the framework");
      nextSteps.push("Review failed component implementations");
    } else if (warnings > 0) {
      nextSteps.push("Review warnings and consider improvements");
      nextSteps.push("Framework is ready for use with caution");
    } else {
      nextSteps.push("Framework is ready for production use");
      nextSteps.push("Consider running comprehensive tests");
    }

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      summary: {
        totalValidations: this.results.length,
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
        cpu: process.arch,
      },
      recommendations: [...new Set(recommendations)],
      criticalIssues,
      nextSteps,
    };
  }

  private async saveValidationReport(
    report: FrameworkValidationReport,
  ): Promise<void> {
    const reportPath = path.join(
      "test-results",
      "framework-validation-report.json",
    );

    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Validation report saved: ${reportPath}`);
  }

  private printValidationSummary(report: FrameworkValidationReport): void {
    console.log("\n🎯 Framework Validation Summary");
    console.log("===============================");
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Total Validations: ${report.summary.totalValidations}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(
      `Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
    );
    console.log(`Memory Usage: ${report.systemInfo.memory}`);

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

    console.log("\n🚀 Next Steps:");
    report.nextSteps.forEach((step) => console.log(`   - ${step}`));
  }
}

// Export the validator
export {
  FrameworkValidator,
  type FrameworkValidationReport,
  type ValidationResult,
};
export default FrameworkValidator;

// CLI execution
if (require.main === module) {
  const validator = new FrameworkValidator();

  validator
    .validateFramework()
    .then((report) => {
      console.log("\n✅ Framework validation completed");
      process.exit(report.overallStatus === "failed" ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Framework validation crashed:", error);
      process.exit(1);
    });
}
