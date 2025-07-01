/**
 * Framework Integration Tests
 * Comprehensive integration tests for the healthcare testing framework
 * Tests component interactions, data flow, and end-to-end workflows
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { performance } from "perf_hooks";

// Import framework components
import { testExecutionMonitor } from "../utils/test-execution-monitor";
import { globalTestReporter } from "../utils/test-reporting";
import { healthcareTestData } from "../fixtures/healthcare-test-data";
import {
  HealthcareTestDataGenerator,
  ComplianceTestHelper,
  PerformanceTestHelper,
  TestEnvironmentHelper,
} from "../utils/test-helpers";
import IntegrationValidator from "../utils/integration-validator";
import { frameworkSetup } from "../utils/framework-setup";

describe("Healthcare Testing Framework Integration", () => {
  let setupResult: any;
  let validator: IntegrationValidator;

  beforeAll(async () => {
    // Initialize framework
    setupResult = await frameworkSetup.initializeFramework({
      validateDependencies: true,
      initializeComponents: true,
      runHealthChecks: true,
      createDirectories: true,
    });

    validator = new IntegrationValidator({
      enableHealthcareValidation: true,
      enablePerformanceValidation: true,
      enableSecurityValidation: true,
      timeoutMs: 15000,
    });

    expect(setupResult.success).toBe(true);
  });

  afterAll(async () => {
    // Cleanup any active sessions
    if (testExecutionMonitor.isActive()) {
      testExecutionMonitor.stopMonitoring();
    }
    if (globalTestReporter.isActive()) {
      globalTestReporter.stopReporting();
    }
  });

  describe("Framework Setup and Initialization", () => {
    it("should initialize framework successfully", () => {
      expect(setupResult).toBeDefined();
      expect(setupResult.success).toBe(true);
      expect(setupResult.errors).toHaveLength(0);
    });

    it("should validate all dependencies", () => {
      expect(setupResult.details.dependencies).toBeDefined();
      const deps = Object.values(setupResult.details.dependencies);
      expect(deps.every(Boolean)).toBe(true);
    });

    it("should initialize all components", () => {
      expect(setupResult.details.components).toBeDefined();
      const components = Object.values(setupResult.details.components);
      expect(components.every(Boolean)).toBe(true);
    });

    it("should pass all health checks", () => {
      expect(setupResult.details.healthChecks).toBeDefined();
      const healthChecks = Object.values(setupResult.details.healthChecks);
      expect(healthChecks.every(Boolean)).toBe(true);
    });
  });

  describe("Component Integration", () => {
    let monitorSessionId: string;
    let reporterSessionId: string;

    beforeEach(() => {
      monitorSessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 10000,
        enableHealthcareMetrics: true,
      });
      reporterSessionId = globalTestReporter.startReporting({
        formats: ["json"],
        includeHealthcareMetrics: true,
      });
    });

    afterEach(() => {
      if (testExecutionMonitor.isActive()) {
        testExecutionMonitor.stopMonitoring();
      }
      if (globalTestReporter.isActive()) {
        globalTestReporter.stopReporting();
      }
    });

    it("should integrate monitor and reporter", () => {
      expect(monitorSessionId).toBeDefined();
      expect(reporterSessionId).toBeDefined();
      expect(testExecutionMonitor.isActive()).toBe(true);
      expect(globalTestReporter.isActive()).toBe(true);
    });

    it("should handle test events across components", () => {
      // Record test event in monitor
      testExecutionMonitor.recordTestEvent({
        type: "start",
        testName: "integration-test",
        suiteName: "integration-suite",
      });

      // Add test result to reporter
      globalTestReporter.addTestResult({
        name: "integration-test",
        suite: "integration-suite",
        status: "passed",
        duration: 150,
        metadata: {
          category: "integration",
          healthcare: {
            complianceStandard: "DOH",
            riskLevel: "medium",
          },
        },
      });

      // Record completion in monitor
      testExecutionMonitor.recordTestEvent({
        type: "pass",
        testName: "integration-test",
        suiteName: "integration-suite",
        duration: 150,
      });

      // Verify data in both components
      const monitorMetrics = testExecutionMonitor.getCurrentMetrics();
      const reporterResults = globalTestReporter.getTestResults();

      expect(monitorMetrics.totalTests).toBe(1);
      expect(monitorMetrics.passedTests).toBe(1);
      expect(reporterResults).toHaveLength(1);
      expect(reporterResults[0].status).toBe("passed");
    });

    it("should generate consistent reports", () => {
      // Add multiple test results
      const testResults = [
        {
          name: "test-1",
          suite: "suite-1",
          status: "passed" as const,
          duration: 100,
        },
        {
          name: "test-2",
          suite: "suite-1",
          status: "failed" as const,
          duration: 200,
          error: { message: "Test failed", type: "TestError" },
        },
        {
          name: "test-3",
          suite: "suite-2",
          status: "passed" as const,
          duration: 150,
        },
      ];

      testResults.forEach((result) => {
        testExecutionMonitor.recordTestEvent({
          type: "start",
          testName: result.name,
          suiteName: result.suite,
        });

        globalTestReporter.addTestResult(result);

        testExecutionMonitor.recordTestEvent({
          type: result.status === "passed" ? "pass" : "fail",
          testName: result.name,
          suiteName: result.suite,
          duration: result.duration,
          error: result.error,
        });
      });

      const monitorReport = testExecutionMonitor.stopMonitoring();
      const reporterReport = globalTestReporter.stopReporting();

      expect(monitorReport.overallMetrics.totalTests).toBe(3);
      expect(monitorReport.overallMetrics.passedTests).toBe(2);
      expect(monitorReport.overallMetrics.failedTests).toBe(1);

      expect(reporterReport.summary.totalTests).toBe(3);
      expect(reporterReport.summary.passed).toBe(2);
      expect(reporterReport.summary.failed).toBe(1);
    });
  });

  describe("Healthcare Data Integration", () => {
    it("should generate consistent healthcare test data", () => {
      const patient1 = HealthcareTestDataGenerator.generatePatientData();
      const patient2 = HealthcareTestDataGenerator.generatePatientData();

      expect(patient1).toBeDefined();
      expect(patient2).toBeDefined();
      expect(patient1.id).not.toBe(patient2.id);
      expect(patient1.emiratesId).not.toBe(patient2.emiratesId);
    });

    it("should validate healthcare test data structure", () => {
      expect(healthcareTestData).toBeDefined();
      expect(healthcareTestData.patients).toBeDefined();
      expect(Array.isArray(healthcareTestData.patients)).toBe(true);
      expect(healthcareTestData.patients.length).toBeGreaterThan(0);

      const firstPatient = healthcareTestData.patients[0];
      expect(firstPatient.id).toBeDefined();
      expect(firstPatient.emiratesId).toBeDefined();
      expect(firstPatient.firstName).toBeDefined();
    });

    it("should integrate with compliance helpers", () => {
      const dohResult = ComplianceTestHelper.validateDOHCompliance({
        patientConsent: true,
        clinicianSignature: true,
        timestamp: new Date().toISOString(),
      });

      expect(dohResult).toBeDefined();
      expect(typeof dohResult.valid).toBe("boolean");
      expect(Array.isArray(dohResult.violations)).toBe(true);
    });
  });

  describe("Performance Integration", () => {
    it("should measure performance across components", () => {
      const measurementId = "integration-performance-test";
      const startTime = PerformanceTestHelper.startMeasurement(measurementId);

      // Simulate work across components
      const sessionId = testExecutionMonitor.startMonitoring();
      const reporterId = globalTestReporter.startReporting();

      for (let i = 0; i < 10; i++) {
        const patient = HealthcareTestDataGenerator.generatePatientData();
        testExecutionMonitor.recordTestEvent({
          type: "pass",
          testName: `perf-test-${i}`,
          suiteName: "performance-suite",
          duration: 50,
        });
        globalTestReporter.addTestResult({
          name: `perf-test-${i}`,
          suite: "performance-suite",
          status: "passed",
          duration: 50,
        });
      }

      testExecutionMonitor.stopMonitoring();
      globalTestReporter.stopReporting();

      const duration = PerformanceTestHelper.endMeasurement(
        measurementId,
        startTime,
      );
      expect(duration).toBeGreaterThan(0);

      const averageTime = PerformanceTestHelper.getAverageTime(measurementId);
      expect(averageTime).toBeGreaterThan(0);
    });

    it("should generate performance reports", () => {
      const report = PerformanceTestHelper.generatePerformanceReport();
      expect(report).toBeDefined();
      expect(report.measurements).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle errors gracefully across components", () => {
      const sessionId = testExecutionMonitor.startMonitoring();
      const reporterId = globalTestReporter.startReporting();

      // Test error handling
      testExecutionMonitor.recordTestEvent({
        type: "error",
        testName: "error-test",
        suiteName: "error-suite",
        error: new Error("Test error"),
      });

      globalTestReporter.addTestResult({
        name: "error-test",
        suite: "error-suite",
        status: "failed",
        duration: 100,
        error: {
          message: "Test error",
          type: "TestError",
        },
      });

      const monitorReport = testExecutionMonitor.stopMonitoring();
      const reporterReport = globalTestReporter.stopReporting();

      expect(monitorReport.overallMetrics.failedTests).toBe(1);
      expect(reporterReport.summary.failed).toBe(1);
    });

    it("should recover from component failures", async () => {
      // Test framework repair functionality
      const repairResult = await frameworkSetup.repairFramework();
      expect(repairResult).toBe(true);

      const status = frameworkSetup.getFrameworkStatus();
      expect(status.healthy).toBe(true);
    });
  });

  describe("End-to-End Workflow", () => {
    it("should execute complete testing workflow", async () => {
      // Start monitoring and reporting
      const monitorId = testExecutionMonitor.startMonitoring({
        enableHealthcareMetrics: true,
        reportInterval: 5000,
      });
      const reporterId = globalTestReporter.startReporting({
        formats: ["json", "html"],
        includeHealthcareMetrics: true,
      });

      // Generate test data
      const patients = Array.from({ length: 5 }, () =>
        HealthcareTestDataGenerator.generatePatientData(),
      );

      // Execute simulated tests
      const testSuites = ["unit", "integration", "compliance"];
      const testResults: any[] = [];

      for (const suite of testSuites) {
        for (let i = 0; i < 3; i++) {
          const testName = `${suite}-test-${i}`;
          const isHealthcare = suite === "compliance";
          const shouldPass = Math.random() > 0.2; // 80% pass rate

          testExecutionMonitor.recordTestEvent({
            type: "start",
            testName,
            suiteName: suite,
          });

          const result = {
            name: testName,
            suite,
            status: shouldPass ? ("passed" as const) : ("failed" as const),
            duration: Math.floor(Math.random() * 200) + 50,
            error: shouldPass
              ? undefined
              : {
                  message: "Test failed",
                  type: "TestError",
                },
            metadata: isHealthcare
              ? {
                  category: "compliance" as const,
                  healthcare: {
                    complianceStandard: "DOH" as const,
                    riskLevel: "medium" as const,
                    patientDataInvolved: true,
                  },
                }
              : undefined,
          };

          globalTestReporter.addTestResult(result);
          testResults.push(result);

          testExecutionMonitor.recordTestEvent({
            type: shouldPass ? "pass" : "fail",
            testName,
            suiteName: suite,
            duration: result.duration,
            error: result.error,
          });
        }
      }

      // Generate reports
      const monitorReport = testExecutionMonitor.stopMonitoring();
      const reporterReport = globalTestReporter.stopReporting();

      // Validate workflow results
      expect(monitorReport.overallMetrics.totalTests).toBe(testResults.length);
      expect(reporterReport.summary.totalTests).toBe(testResults.length);
      expect(reporterReport.healthcareMetrics).toBeDefined();
      expect(
        reporterReport.healthcareMetrics?.complianceScore,
      ).toBeGreaterThanOrEqual(0);

      // Save reports
      const savedFiles = await globalTestReporter.saveReports(reporterReport);
      expect(savedFiles.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Validation", () => {
    it("should pass comprehensive integration validation", async () => {
      const validationReport = await validator.validateFrameworkIntegration();

      expect(validationReport).toBeDefined();
      expect(validationReport.overallStatus).toBe("passed");
      expect(validationReport.summary.failed).toBe(0);
      expect(validationReport.healthcareCompliance.status).toBe("compliant");
    });

    it("should perform quick health checks", async () => {
      const healthCheck = await validator.quickHealthCheck();
      expect(healthCheck).toBe(true);
    });
  });

  describe("Framework Status and Monitoring", () => {
    it("should maintain accurate framework status", () => {
      const status = frameworkSetup.getFrameworkStatus();

      expect(status).toBeDefined();
      expect(status.initialized).toBe(true);
      expect(status.healthy).toBe(true);
      expect(status.components.monitor).toBe(true);
      expect(status.components.reporter).toBe(true);
      expect(status.components.validator).toBe(true);
      expect(status.components.testData).toBe(true);
      expect(status.components.helpers).toBe(true);
    });

    it("should validate framework health continuously", async () => {
      const healthCheck = await frameworkSetup.validateFrameworkHealth();
      expect(healthCheck).toBe(true);

      const status = frameworkSetup.getFrameworkStatus();
      expect(status.lastHealthCheck).toBeDefined();
      expect(status.issues).toHaveLength(0);
    });
  });
});
