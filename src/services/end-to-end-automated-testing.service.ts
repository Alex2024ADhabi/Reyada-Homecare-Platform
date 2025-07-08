/**
 * End-to-End Automated Testing Service
 * Provides comprehensive automated testing capabilities for healthcare workflows
 * with DOH compliance validation and patient safety testing
 */

import { errorHandlerService } from "./error-handler.service";
import { realTimeNotificationService } from "./real-time-notification.service";
import { redisIntegrationService } from "./redis-integration.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { patientSafetyIncidentReportingService } from "./patient-safety-incident-reporting.service";

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category:
    | "healthcare"
    | "compliance"
    | "performance"
    | "security"
    | "integration";
  priority: "low" | "medium" | "high" | "critical";
  dohCompliant: boolean;
  patientSafety: boolean;
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  timeout: number;
  retryCount: number;
  prerequisites: string[];
  tags: string[];
}

interface TestStep {
  id: string;
  name: string;
  action: string;
  parameters: Record<string, any>;
  expectedDuration: number;
  criticalStep: boolean;
  validations: Validation[];
}

interface Validation {
  type: "response" | "database" | "notification" | "cache" | "compliance";
  field: string;
  operator:
    | "equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "exists"
    | "matches";
  expectedValue: any;
  required: boolean;
}

interface ExpectedResult {
  type: "success" | "error" | "warning" | "info";
  message: string;
  data?: any;
  complianceCheck?: boolean;
  safetyCheck?: boolean;
}

interface TestExecution {
  id: string;
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  status: "running" | "passed" | "failed" | "skipped" | "timeout";
  duration: number;
  results: TestResult[];
  errors: TestError[];
  metrics: TestMetrics;
  screenshots: string[];
  logs: string[];
}

interface TestResult {
  stepId: string;
  stepName: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  actualResult: any;
  expectedResult: any;
  validationResults: ValidationResult[];
  errorMessage?: string;
  screenshot?: string;
}

interface ValidationResult {
  validationType: string;
  field: string;
  expected: any;
  actual: any;
  passed: boolean;
  message: string;
}

interface TestError {
  stepId: string;
  errorType: string;
  message: string;
  stack?: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  patientSafetyImpact: boolean;
  dohComplianceImpact: boolean;
}

interface TestMetrics {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  averageDuration: number;
  successRate: number;
  performanceScore: number;
  complianceScore: number;
  safetyScore: number;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  scenarios: TestScenario[];
  schedule?: TestSchedule;
  configuration: TestConfiguration;
  lastExecution?: Date;
  nextExecution?: Date;
}

interface TestSchedule {
  enabled: boolean;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time?: string;
  days?: string[];
  timezone: string;
}

interface TestConfiguration {
  environment: "development" | "staging" | "production";
  baseUrl: string;
  timeout: number;
  retryCount: number;
  parallelExecution: boolean;
  maxConcurrency: number;
  screenshotOnFailure: boolean;
  detailedLogging: boolean;
  dohComplianceMode: boolean;
  patientSafetyMode: boolean;
}

interface TestReport {
  id: string;
  suiteId: string;
  executionDate: Date;
  duration: number;
  summary: TestMetrics;
  scenarios: TestExecution[];
  recommendations: string[];
  complianceIssues: ComplianceIssue[];
  safetyIssues: SafetyIssue[];
  performanceIssues: PerformanceIssue[];
}

interface ComplianceIssue {
  scenarioId: string;
  stepId: string;
  issueType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  dohStandard: string;
  recommendation: string;
}

interface SafetyIssue {
  scenarioId: string;
  stepId: string;
  issueType: string;
  description: string;
  patientImpact: "none" | "low" | "medium" | "high" | "critical";
  recommendation: string;
  escalationRequired: boolean;
}

interface PerformanceIssue {
  scenarioId: string;
  stepId: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  impact: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

class EndToEndAutomatedTestingService {
  private testSuites: Map<string, TestSuite> = new Map();
  private activeExecutions: Map<string, TestExecution> = new Map();
  private testReports: TestReport[] = [];
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private testData: Map<string, any> = new Map();
  private mockServices: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultTestSuites();
  }

  /**
   * Initialize the End-to-End Automated Testing Service
   */
  async initialize(): Promise<void> {
    try {
      console.log("🔄 Initializing End-to-End Automated Testing Service...");

      // Initialize test data
      await this.initializeTestData();

      // Setup mock services for testing
      await this.setupMockServices();

      // Initialize default test suites
      await this.initializeDefaultTestSuites();

      // Setup event listeners
      this.setupEventListeners();

      // Start scheduled test execution
      this.startScheduledExecution();

      this.isInitialized = true;
      console.log(
        "✅ End-to-End Automated Testing Service initialized successfully",
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize End-to-End Automated Testing Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "EndToEndAutomatedTestingService.initialize",
      });
      throw error;
    }
  }

  private async initializeTestData(): Promise<void> {
    // Healthcare test data
    this.testData.set("patients", [
      {
        id: "P001",
        emiratesId: "784-1234-5678901-2",
        name: "Ahmed Al Mansouri",
        dateOfBirth: "1985-03-15",
        gender: "Male",
        nationality: "UAE",
        phone: "+971501234567",
        email: "ahmed.almansouri@email.com",
        address: "Dubai, UAE",
        insuranceProvider: "Daman",
        insuranceNumber: "DM123456789",
        medicalConditions: ["Diabetes Type 2", "Hypertension"],
      },
      {
        id: "P002",
        emiratesId: "784-2345-6789012-3",
        name: "Fatima Al Zahra",
        dateOfBirth: "1990-07-22",
        gender: "Female",
        nationality: "UAE",
        phone: "+971502345678",
        email: "fatima.alzahra@email.com",
        address: "Abu Dhabi, UAE",
        insuranceProvider: "ADNIC",
        insuranceNumber: "AD987654321",
        medicalConditions: ["Asthma", "Allergies"],
      },
    ]);

    // Clinical test data
    this.testData.set("clinicians", [
      {
        id: "C001",
        name: "Dr. Sarah Johnson",
        specialization: "Family Medicine",
        licenseNumber: "DOH-FM-2023-001",
        phone: "+971503456789",
        email: "dr.sarah@healthcare.ae",
      },
      {
        id: "C002",
        name: "Nurse Maria Santos",
        specialization: "Home Care Nursing",
        licenseNumber: "DOH-RN-2023-002",
        phone: "+971504567890",
        email: "maria.santos@healthcare.ae",
      },
    ]);

    // Service codes for Daman
    this.testData.set("serviceCodes", [
      {
        code: "HC001",
        description: "Initial Assessment",
        category: "Assessment",
        price: 250.0,
        dohApproved: true,
      },
      {
        code: "HC002",
        description: "Wound Care",
        category: "Treatment",
        price: 180.0,
        dohApproved: true,
      },
      {
        code: "HC003",
        description: "Medication Administration",
        category: "Treatment",
        price: 120.0,
        dohApproved: true,
      },
    ]);

    console.log("📊 Test data initialized successfully");
  }

  private async setupMockServices(): Promise<void> {
    // Mock external services for testing
    this.mockServices.set("damanAPI", {
      submitClaim: async (claimData: any) => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
        return {
          claimId: `CLM-${Date.now()}`,
          status: "submitted",
          referenceNumber: `REF-${Math.random().toString(36).substr(2, 9)}`,
          submissionDate: new Date().toISOString(),
        };
      },
      checkClaimStatus: async (claimId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          claimId,
          status: Math.random() > 0.8 ? "approved" : "pending",
          lastUpdated: new Date().toISOString(),
        };
      },
    });

    this.mockServices.set("dohAPI", {
      validateCompliance: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          compliant: Math.random() > 0.1, // 90% compliance rate
          issues:
            Math.random() > 0.7
              ? []
              : ["Missing required field: patient consent"],
          validationDate: new Date().toISOString(),
        };
      },
      submitReport: async (reportData: any) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          reportId: `RPT-${Date.now()}`,
          status: "submitted",
          submissionDate: new Date().toISOString(),
        };
      },
    });

    console.log("🔧 Mock services setup completed");
  }

  private async initializeDefaultTestSuites(): Promise<void> {
    // Healthcare Workflow Test Suite
    const healthcareWorkflowSuite: TestSuite = {
      id: "healthcare-workflow",
      name: "Healthcare Workflow Test Suite",
      description:
        "Comprehensive testing of healthcare workflows including patient management, clinical documentation, and compliance",
      scenarios: [
        {
          id: "patient-registration",
          name: "Patient Registration Workflow",
          description:
            "Test complete patient registration process with Emirates ID validation",
          category: "healthcare",
          priority: "critical",
          dohCompliant: true,
          patientSafety: true,
          timeout: 30000,
          retryCount: 2,
          prerequisites: [
            "Emirates ID service available",
            "Database accessible",
          ],
          tags: ["patient", "registration", "emirates-id", "doh-compliance"],
          steps: [
            {
              id: "validate-emirates-id",
              name: "Validate Emirates ID",
              action: "validateEmiratesId",
              parameters: { emiratesId: "784-1234-5678901-2" },
              expectedDuration: 2000,
              criticalStep: true,
              validations: [
                {
                  type: "response",
                  field: "valid",
                  operator: "equals",
                  expectedValue: true,
                  required: true,
                },
                {
                  type: "response",
                  field: "personalInfo.name",
                  operator: "exists",
                  expectedValue: null,
                  required: true,
                },
              ],
            },
            {
              id: "create-patient-record",
              name: "Create Patient Record",
              action: "createPatientRecord",
              parameters: { patientData: "patients[0]" },
              expectedDuration: 1500,
              criticalStep: true,
              validations: [
                {
                  type: "database",
                  field: "patient.id",
                  operator: "exists",
                  expectedValue: null,
                  required: true,
                },
                {
                  type: "compliance",
                  field: "dohCompliance",
                  operator: "equals",
                  expectedValue: true,
                  required: true,
                },
              ],
            },
            {
              id: "send-registration-notification",
              name: "Send Registration Notification",
              action: "sendNotification",
              parameters: { type: "patient-registered", patientId: "P001" },
              expectedDuration: 1000,
              criticalStep: false,
              validations: [
                {
                  type: "notification",
                  field: "delivered",
                  operator: "equals",
                  expectedValue: true,
                  required: true,
                },
              ],
            },
          ],
          expectedResults: [
            {
              type: "success",
              message: "Patient registered successfully",
              complianceCheck: true,
              safetyCheck: true,
            },
          ],
        },
        {
          id: "clinical-documentation",
          name: "Clinical Documentation Workflow",
          description:
            "Test clinical documentation process with DOH 9-domain compliance",
          category: "compliance",
          priority: "critical",
          dohCompliant: true,
          patientSafety: true,
          timeout: 45000,
          retryCount: 2,
          prerequisites: ["Patient exists", "Clinician authenticated"],
          tags: ["clinical", "documentation", "9-domains", "doh-compliance"],
          steps: [
            {
              id: "create-clinical-assessment",
              name: "Create Clinical Assessment",
              action: "createClinicalAssessment",
              parameters: {
                patientId: "P001",
                clinicianId: "C001",
                assessmentType: "initial",
              },
              expectedDuration: 3000,
              criticalStep: true,
              validations: [
                {
                  type: "compliance",
                  field: "nineDomainsCompliant",
                  operator: "equals",
                  expectedValue: true,
                  required: true,
                },
                {
                  type: "response",
                  field: "assessmentId",
                  operator: "exists",
                  expectedValue: null,
                  required: true,
                },
              ],
            },
            {
              id: "validate-clinical-data",
              name: "Validate Clinical Data",
              action: "validateClinicalData",
              parameters: { assessmentId: "generated" },
              expectedDuration: 2000,
              criticalStep: true,
              validations: [
                {
                  type: "compliance",
                  field: "dohCompliant",
                  operator: "equals",
                  expectedValue: true,
                  required: true,
                },
                {
                  type: "response",
                  field: "validationErrors",
                  operator: "equals",
                  expectedValue: [],
                  required: true,
                },
              ],
            },
          ],
          expectedResults: [
            {
              type: "success",
              message: "Clinical documentation completed successfully",
              complianceCheck: true,
              safetyCheck: true,
            },
          ],
        },
      ],
      configuration: {
        environment: "development",
        baseUrl: "http://localhost:3001",
        timeout: 30000,
        retryCount: 2,
        parallelExecution: false,
        maxConcurrency: 3,
        screenshotOnFailure: true,
        detailedLogging: true,
        dohComplianceMode: true,
        patientSafetyMode: true,
      },
    };

    // Performance Test Suite
    const performanceTestSuite: TestSuite = {
      id: "performance-testing",
      name: "Performance Test Suite",
      description:
        "Performance and load testing for healthcare system components",
      scenarios: [
        {
          id: "redis-cache-performance",
          name: "Redis Cache Performance Test",
          description: "Test Redis caching performance under load",
          category: "performance",
          priority: "high",
          dohCompliant: false,
          patientSafety: false,
          timeout: 60000,
          retryCount: 1,
          prerequisites: ["Redis service running"],
          tags: ["performance", "redis", "cache"],
          steps: [
            {
              id: "cache-patient-data",
              name: "Cache Patient Data",
              action: "cachePatientData",
              parameters: { patientCount: 100 },
              expectedDuration: 5000,
              criticalStep: true,
              validations: [
                {
                  type: "response",
                  field: "duration",
                  operator: "less_than",
                  expectedValue: 5000,
                  required: true,
                },
                {
                  type: "cache",
                  field: "hitRate",
                  operator: "greater_than",
                  expectedValue: 95,
                  required: true,
                },
              ],
            },
          ],
          expectedResults: [
            {
              type: "success",
              message: "Cache performance within acceptable limits",
            },
          ],
        },
      ],
      configuration: {
        environment: "development",
        baseUrl: "http://localhost:3001",
        timeout: 60000,
        retryCount: 1,
        parallelExecution: true,
        maxConcurrency: 5,
        screenshotOnFailure: false,
        detailedLogging: true,
        dohComplianceMode: false,
        patientSafetyMode: false,
      },
    };

    // Integration Test Suite
    const integrationTestSuite: TestSuite = {
      id: "integration-testing",
      name: "Integration Test Suite",
      description: "Integration testing for external services and APIs",
      scenarios: [
        {
          id: "daman-integration",
          name: "Daman API Integration Test",
          description: "Test integration with Daman insurance API",
          category: "integration",
          priority: "high",
          dohCompliant: true,
          patientSafety: false,
          timeout: 30000,
          retryCount: 3,
          prerequisites: ["Daman API accessible", "Valid credentials"],
          tags: ["integration", "daman", "insurance"],
          steps: [
            {
              id: "submit-claim-to-daman",
              name: "Submit Claim to Daman",
              action: "submitDamanClaim",
              parameters: {
                patientId: "P001",
                serviceCode: "HC001",
                amount: 250.0,
              },
              expectedDuration: 3000,
              criticalStep: true,
              validations: [
                {
                  type: "response",
                  field: "claimId",
                  operator: "exists",
                  expectedValue: null,
                  required: true,
                },
                {
                  type: "response",
                  field: "status",
                  operator: "equals",
                  expectedValue: "submitted",
                  required: true,
                },
              ],
            },
          ],
          expectedResults: [
            {
              type: "success",
              message: "Daman integration working correctly",
            },
          ],
        },
      ],
      configuration: {
        environment: "development",
        baseUrl: "http://localhost:3001",
        timeout: 30000,
        retryCount: 3,
        parallelExecution: false,
        maxConcurrency: 2,
        screenshotOnFailure: true,
        detailedLogging: true,
        dohComplianceMode: true,
        patientSafetyMode: false,
      },
    };

    // Add test suites
    this.testSuites.set(healthcareWorkflowSuite.id, healthcareWorkflowSuite);
    this.testSuites.set(performanceTestSuite.id, performanceTestSuite);
    this.testSuites.set(integrationTestSuite.id, integrationTestSuite);

    console.log(`📋 Initialized ${this.testSuites.size} default test suites`);
  }

  /**
   * Execute a test suite
   */
  async executeTestSuite(suiteId: string): Promise<TestReport> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite '${suiteId}' not found`);
    }

    console.log(`🚀 Executing test suite: ${suite.name}`);
    const startTime = Date.now();
    const reportId = `report-${suiteId}-${startTime}`;

    const executions: TestExecution[] = [];
    const complianceIssues: ComplianceIssue[] = [];
    const safetyIssues: SafetyIssue[] = [];
    const performanceIssues: PerformanceIssue[] = [];

    // Execute scenarios
    for (const scenario of suite.scenarios) {
      try {
        const execution = await this.executeScenario(
          scenario,
          suite.configuration,
        );
        executions.push(execution);

        // Analyze results for issues
        this.analyzeExecutionForIssues(
          execution,
          complianceIssues,
          safetyIssues,
          performanceIssues,
        );
      } catch (error) {
        console.error(
          `❌ Failed to execute scenario '${scenario.name}':`,
          error,
        );

        // Create failed execution record
        const failedExecution: TestExecution = {
          id: `exec-${scenario.id}-${Date.now()}`,
          scenarioId: scenario.id,
          startTime: new Date(),
          endTime: new Date(),
          status: "failed",
          duration: 0,
          results: [],
          errors: [
            {
              stepId: "initialization",
              errorType: "ExecutionError",
              message: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date(),
              severity: "critical",
              patientSafetyImpact: scenario.patientSafety,
              dohComplianceImpact: scenario.dohCompliant,
            },
          ],
          metrics: {
            totalScenarios: 1,
            passedScenarios: 0,
            failedScenarios: 1,
            skippedScenarios: 0,
            totalSteps: scenario.steps.length,
            passedSteps: 0,
            failedSteps: scenario.steps.length,
            averageDuration: 0,
            successRate: 0,
            performanceScore: 0,
            complianceScore: 0,
            safetyScore: 0,
          },
          screenshots: [],
          logs: [],
        };
        executions.push(failedExecution);
      }
    }

    // Calculate overall metrics
    const metrics = this.calculateOverallMetrics(executions);
    const duration = Date.now() - startTime;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      executions,
      complianceIssues,
      safetyIssues,
      performanceIssues,
    );

    const report: TestReport = {
      id: reportId,
      suiteId,
      executionDate: new Date(),
      duration,
      summary: metrics,
      scenarios: executions,
      recommendations,
      complianceIssues,
      safetyIssues,
      performanceIssues,
    };

    // Store report
    this.testReports.push(report);

    // Keep only last 50 reports
    if (this.testReports.length > 50) {
      this.testReports = this.testReports.slice(-50);
    }

    // Update suite last execution
    suite.lastExecution = new Date();

    // Emit events
    this.emit("test-suite-completed", { suiteId, report });

    // Send notifications for critical issues
    await this.handleCriticalIssues(report);

    console.log(`✅ Test suite '${suite.name}' completed in ${duration}ms`);
    console.log(
      `📊 Results: ${metrics.passedScenarios}/${metrics.totalScenarios} scenarios passed`,
    );

    return report;
  }

  /**
   * Execute a single test scenario
   */
  private async executeScenario(
    scenario: TestScenario,
    config: TestConfiguration,
  ): Promise<TestExecution> {
    const executionId = `exec-${scenario.id}-${Date.now()}`;
    const startTime = new Date();

    console.log(`🔄 Executing scenario: ${scenario.name}`);

    const execution: TestExecution = {
      id: executionId,
      scenarioId: scenario.id,
      startTime,
      status: "running",
      duration: 0,
      results: [],
      errors: [],
      metrics: {
        totalScenarios: 1,
        passedScenarios: 0,
        failedScenarios: 0,
        skippedScenarios: 0,
        totalSteps: scenario.steps.length,
        passedSteps: 0,
        failedSteps: 0,
        averageDuration: 0,
        successRate: 0,
        performanceScore: 0,
        complianceScore: 0,
        safetyScore: 0,
      },
      screenshots: [],
      logs: [],
    };

    this.activeExecutions.set(executionId, execution);

    try {
      // Check prerequisites
      await this.checkPrerequisites(scenario.prerequisites);

      // Execute steps
      for (const step of scenario.steps) {
        const stepResult = await this.executeStep(step, scenario, config);
        execution.results.push(stepResult);

        if (stepResult.status === "failed" && step.criticalStep) {
          execution.status = "failed";
          break;
        }
      }

      // Determine final status
      if (execution.status === "running") {
        const failedSteps = execution.results.filter(
          (r) => r.status === "failed",
        ).length;
        execution.status = failedSteps === 0 ? "passed" : "failed";
      }

      // Calculate metrics
      execution.metrics.passedSteps = execution.results.filter(
        (r) => r.status === "passed",
      ).length;
      execution.metrics.failedSteps = execution.results.filter(
        (r) => r.status === "failed",
      ).length;
      execution.metrics.successRate =
        (execution.metrics.passedSteps / execution.metrics.totalSteps) * 100;

      if (execution.status === "passed") {
        execution.metrics.passedScenarios = 1;
      } else {
        execution.metrics.failedScenarios = 1;
      }

      // Calculate compliance and safety scores
      if (scenario.dohCompliant) {
        execution.metrics.complianceScore =
          execution.status === "passed" ? 100 : 0;
      }
      if (scenario.patientSafety) {
        execution.metrics.safetyScore = execution.status === "passed" ? 100 : 0;
      }
    } catch (error) {
      execution.status = "failed";
      execution.errors.push({
        stepId: "scenario",
        errorType: "ScenarioError",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
        severity: "high",
        patientSafetyImpact: scenario.patientSafety,
        dohComplianceImpact: scenario.dohCompliant,
      });
    } finally {
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - startTime.getTime();
      execution.metrics.averageDuration =
        execution.duration / scenario.steps.length;

      this.activeExecutions.delete(executionId);
    }

    return execution;
  }

  /**
   * Execute a single test step
   */
  private async executeStep(
    step: TestStep,
    scenario: TestScenario,
    config: TestConfiguration,
  ): Promise<TestResult> {
    const stepStartTime = Date.now();

    console.log(`  🔄 Executing step: ${step.name}`);

    const result: TestResult = {
      stepId: step.id,
      stepName: step.name,
      status: "passed",
      duration: 0,
      actualResult: null,
      expectedResult: null,
      validationResults: [],
    };

    try {
      // Execute the step action
      result.actualResult = await this.executeStepAction(step, config);

      // Perform validations
      for (const validation of step.validations) {
        const validationResult = await this.performValidation(
          validation,
          result.actualResult,
          step,
          scenario,
        );
        result.validationResults.push(validationResult);

        if (!validationResult.passed && validation.required) {
          result.status = "failed";
          result.errorMessage = validationResult.message;
        }
      }

      // Check step timeout
      const stepDuration = Date.now() - stepStartTime;
      if (stepDuration > step.expectedDuration * 2) {
        result.validationResults.push({
          validationType: "performance",
          field: "duration",
          expected: step.expectedDuration,
          actual: stepDuration,
          passed: false,
          message: `Step took ${stepDuration}ms, expected ${step.expectedDuration}ms`,
        });
      }
    } catch (error) {
      result.status = "failed";
      result.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`  ❌ Step '${step.name}' failed:`, error);
    } finally {
      result.duration = Date.now() - stepStartTime;
    }

    return result;
  }

  /**
   * Execute step action based on action type
   */
  private async executeStepAction(
    step: TestStep,
    config: TestConfiguration,
  ): Promise<any> {
    const { action, parameters } = step;

    // Resolve parameter references to test data
    const resolvedParams = this.resolveParameters(parameters);

    switch (action) {
      case "validateEmiratesId":
        return await this.mockValidateEmiratesId(resolvedParams.emiratesId);

      case "createPatientRecord":
        return await this.mockCreatePatientRecord(resolvedParams.patientData);

      case "sendNotification":
        return await this.mockSendNotification(resolvedParams);

      case "createClinicalAssessment":
        return await this.mockCreateClinicalAssessment(resolvedParams);

      case "validateClinicalData":
        return await this.mockValidateClinicalData(resolvedParams);

      case "cachePatientData":
        return await this.mockCachePatientData(resolvedParams);

      case "submitDamanClaim":
        return await this.mockSubmitDamanClaim(resolvedParams);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Resolve parameter references to actual test data
   */
  private resolveParameters(
    parameters: Record<string, any>,
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === "string" && value.includes("[")) {
        // Handle array references like "patients[0]"
        const match = value.match(/^(\w+)\[(\d+)\]$/);
        if (match) {
          const [, arrayName, index] = match;
          const array = this.testData.get(arrayName);
          if (array && array[parseInt(index)]) {
            resolved[key] = array[parseInt(index)];
          } else {
            resolved[key] = value;
          }
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  // Mock action implementations
  private async mockValidateEmiratesId(emiratesId: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

    const patients = this.testData.get("patients") || [];
    const patient = patients.find((p: any) => p.emiratesId === emiratesId);

    if (patient) {
      return {
        valid: true,
        personalInfo: {
          name: patient.name,
          dateOfBirth: patient.dateOfBirth,
          nationality: patient.nationality,
        },
      };
    } else {
      return {
        valid: false,
        error: "Emirates ID not found",
      };
    }
  }

  private async mockCreatePatientRecord(patientData: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate DOH compliance check
    const dohCompliant = Math.random() > 0.1; // 90% compliance rate

    return {
      patientId: patientData.id,
      status: "created",
      dohCompliance: dohCompliant,
      createdAt: new Date().toISOString(),
    };
  }

  private async mockSendNotification(params: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Use real-time notification service if available
    try {
      await realTimeNotificationService.sendNotification({
        type: params.type,
        recipientId: params.patientId,
        title: "Patient Registration",
        message: "Patient has been successfully registered",
        priority: "medium",
        channels: ["email", "sms"],
      });

      return { delivered: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        delivered: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async mockCreateClinicalAssessment(params: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulate 9-domain compliance check
    const nineDomainsCompliant = Math.random() > 0.05; // 95% compliance rate

    return {
      assessmentId: `ASSESS-${Date.now()}`,
      patientId: params.patientId,
      clinicianId: params.clinicianId,
      type: params.assessmentType,
      nineDomainsCompliant,
      createdAt: new Date().toISOString(),
    };
  }

  private async mockValidateClinicalData(params: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const dohCompliant = Math.random() > 0.1; // 90% compliance rate
    const validationErrors: string[] = [];

    if (!dohCompliant) {
      validationErrors.push("Missing required clinical documentation");
    }

    return {
      assessmentId: params.assessmentId,
      dohCompliant,
      validationErrors,
      validatedAt: new Date().toISOString(),
    };
  }

  private async mockCachePatientData(params: any): Promise<any> {
    const startTime = Date.now();

    // Use Redis service if available
    try {
      const patients = this.testData.get("patients") || [];
      const patientCount = Math.min(params.patientCount, patients.length);

      for (let i = 0; i < patientCount; i++) {
        await redisIntegrationService.cachePatientData(
          patients[i].id,
          patients[i],
          3600,
        );
      }

      const duration = Date.now() - startTime;
      const metrics = redisIntegrationService.getMetrics();

      return {
        patientsCached: patientCount,
        duration,
        hitRate: metrics.hitRate,
        averageResponseTime: metrics.averageResponseTime,
      };
    } catch (error) {
      return {
        patientsCached: 0,
        duration: Date.now() - startTime,
        hitRate: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async mockSubmitDamanClaim(params: any): Promise<any> {
    const mockDamanAPI = this.mockServices.get("damanAPI");

    if (mockDamanAPI) {
      return await mockDamanAPI.submitClaim({
        patientId: params.patientId,
        serviceCode: params.serviceCode,
        amount: params.amount,
        submissionDate: new Date().toISOString(),
      });
    } else {
      throw new Error("Daman API service not available");
    }
  }

  /**
   * Perform validation on step result
   */
  private async performValidation(
    validation: Validation,
    actualResult: any,
    step: TestStep,
    scenario: TestScenario,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      validationType: validation.type,
      field: validation.field,
      expected: validation.expectedValue,
      actual: null,
      passed: false,
      message: "",
    };

    try {
      // Extract actual value from result
      result.actual = this.extractFieldValue(actualResult, validation.field);

      // Perform comparison based on operator
      switch (validation.operator) {
        case "equals":
          result.passed = result.actual === validation.expectedValue;
          result.message = result.passed
            ? "Values match"
            : `Expected '${validation.expectedValue}', got '${result.actual}'`;
          break;

        case "contains":
          result.passed = String(result.actual).includes(
            String(validation.expectedValue),
          );
          result.message = result.passed
            ? "Value contains expected substring"
            : `'${result.actual}' does not contain '${validation.expectedValue}'`;
          break;

        case "greater_than":
          result.passed =
            Number(result.actual) > Number(validation.expectedValue);
          result.message = result.passed
            ? "Value is greater than expected"
            : `${result.actual} is not greater than ${validation.expectedValue}`;
          break;

        case "less_than":
          result.passed =
            Number(result.actual) < Number(validation.expectedValue);
          result.message = result.passed
            ? "Value is less than expected"
            : `${result.actual} is not less than ${validation.expectedValue}`;
          break;

        case "exists":
          result.passed = result.actual !== null && result.actual !== undefined;
          result.message = result.passed
            ? "Field exists"
            : `Field '${validation.field}' does not exist`;
          break;

        case "matches":
          const regex = new RegExp(String(validation.expectedValue));
          result.passed = regex.test(String(result.actual));
          result.message = result.passed
            ? "Value matches pattern"
            : `'${result.actual}' does not match pattern '${validation.expectedValue}'`;
          break;

        default:
          result.passed = false;
          result.message = `Unknown validation operator: ${validation.operator}`;
      }

      // Special handling for compliance validations
      if (validation.type === "compliance" && scenario.dohCompliant) {
        if (!result.passed) {
          result.message += " (DOH Compliance Issue)";
        }
      }
    } catch (error) {
      result.passed = false;
      result.message = `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    return result;
  }

  /**
   * Extract field value from nested object using dot notation
   */
  private extractFieldValue(obj: any, fieldPath: string): any {
    if (!obj || !fieldPath) return null;

    const parts = fieldPath.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return null;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Check test prerequisites
   */
  private async checkPrerequisites(prerequisites: string[]): Promise<void> {
    for (const prerequisite of prerequisites) {
      console.log(`  🔍 Checking prerequisite: ${prerequisite}`);

      // Simulate prerequisite checks
      switch (prerequisite) {
        case "Emirates ID service available":
          // Check if Emirates ID service is accessible
          break;
        case "Database accessible":
          // Check database connectivity
          break;
        case "Patient exists":
          // Check if test patient exists
          break;
        case "Clinician authenticated":
          // Check clinician authentication
          break;
        case "Redis service running":
          // Check Redis connectivity
          if (!redisIntegrationService.isHealthy()) {
            throw new Error("Redis service is not healthy");
          }
          break;
        case "Daman API accessible":
          // Check Daman API connectivity
          break;
        case "Valid credentials":
          // Check API credentials
          break;
        default:
          console.warn(`  ⚠️ Unknown prerequisite: ${prerequisite}`);
      }
    }
  }

  /**
   * Analyze execution for compliance, safety, and performance issues
   */
  private analyzeExecutionForIssues(
    execution: TestExecution,
    complianceIssues: ComplianceIssue[],
    safetyIssues: SafetyIssue[],
    performanceIssues: PerformanceIssue[],
  ): void {
    for (const result of execution.results) {
      for (const validation of result.validationResults) {
        if (!validation.passed) {
          // Check for compliance issues
          if (validation.validationType === "compliance") {
            complianceIssues.push({
              scenarioId: execution.scenarioId,
              stepId: result.stepId,
              issueType: "ValidationFailure",
              description: validation.message,
              severity: "high",
              dohStandard: "General Compliance",
              recommendation: "Review and fix compliance validation logic",
            });
          }

          // Check for performance issues
          if (validation.validationType === "performance") {
            performanceIssues.push({
              scenarioId: execution.scenarioId,
              stepId: result.stepId,
              metric: validation.field,
              actualValue: Number(validation.actual),
              expectedValue: Number(validation.expected),
              impact: "medium",
              recommendation: "Optimize performance for this operation",
            });
          }
        }
      }

      // Check for safety issues based on errors
      for (const error of execution.errors) {
        if (error.patientSafetyImpact) {
          safetyIssues.push({
            scenarioId: execution.scenarioId,
            stepId: error.stepId,
            issueType: error.errorType,
            description: error.message,
            patientImpact: error.severity === "critical" ? "high" : "medium",
            recommendation:
              "Investigate and resolve patient safety related error",
            escalationRequired: error.severity === "critical",
          });
        }
      }
    }
  }

  /**
   * Calculate overall metrics from executions
   */
  private calculateOverallMetrics(executions: TestExecution[]): TestMetrics {
    const totalScenarios = executions.length;
    const passedScenarios = executions.filter(
      (e) => e.status === "passed",
    ).length;
    const failedScenarios = executions.filter(
      (e) => e.status === "failed",
    ).length;
    const skippedScenarios = executions.filter(
      (e) => e.status === "skipped",
    ).length;

    const totalSteps = executions.reduce((sum, e) => sum + e.results.length, 0);
    const passedSteps = executions.reduce(
      (sum, e) => sum + e.results.filter((r) => r.status === "passed").length,
      0,
    );
    const failedSteps = executions.reduce(
      (sum, e) => sum + e.results.filter((r) => r.status === "failed").length,
      0,
    );

    const averageDuration =
      totalScenarios > 0
        ? executions.reduce((sum, e) => sum + e.duration, 0) / totalScenarios
        : 0;

    const successRate =
      totalScenarios > 0 ? (passedScenarios / totalScenarios) * 100 : 0;

    // Calculate compliance score
    const complianceExecutions = executions.filter(
      (e) => e.metrics.complianceScore > 0,
    );
    const complianceScore =
      complianceExecutions.length > 0
        ? complianceExecutions.reduce(
            (sum, e) => sum + e.metrics.complianceScore,
            0,
          ) / complianceExecutions.length
        : 100;

    // Calculate safety score
    const safetyExecutions = executions.filter(
      (e) => e.metrics.safetyScore > 0,
    );
    const safetyScore =
      safetyExecutions.length > 0
        ? safetyExecutions.reduce((sum, e) => sum + e.metrics.safetyScore, 0) /
          safetyExecutions.length
        : 100;

    // Calculate performance score based on step durations
    const performanceScore =
      totalSteps > 0
        ? Math.max(0, 100 - (failedSteps / totalSteps) * 100)
        : 100;

    return {
      totalScenarios,
      passedScenarios,
      failedScenarios,
      skippedScenarios,
      totalSteps,
      passedSteps,
      failedSteps,
      averageDuration,
      successRate,
      performanceScore,
      complianceScore,
      safetyScore,
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    executions: TestExecution[],
    complianceIssues: ComplianceIssue[],
    safetyIssues: SafetyIssue[],
    performanceIssues: PerformanceIssue[],
  ): string[] {
    const recommendations: string[] = [];

    // General recommendations
    const failedExecutions = executions.filter((e) => e.status === "failed");
    if (failedExecutions.length > 0) {
      recommendations.push(
        `${failedExecutions.length} test scenarios failed. Review and fix failing tests to improve system reliability.`,
      );
    }

    // Compliance recommendations
    if (complianceIssues.length > 0) {
      recommendations.push(
        `${complianceIssues.length} DOH compliance issues detected. Address these issues to ensure regulatory compliance.`,
      );

      const criticalComplianceIssues = complianceIssues.filter(
        (i) => i.severity === "critical",
      );
      if (criticalComplianceIssues.length > 0) {
        recommendations.push(
          `${criticalComplianceIssues.length} critical compliance issues require immediate attention.`,
        );
      }
    }

    // Safety recommendations
    if (safetyIssues.length > 0) {
      recommendations.push(
        `${safetyIssues.length} patient safety issues identified. These should be prioritized for resolution.`,
      );

      const escalationRequired = safetyIssues.filter(
        (i) => i.escalationRequired,
      );
      if (escalationRequired.length > 0) {
        recommendations.push(
          `${escalationRequired.length} safety issues require immediate escalation to clinical leadership.`,
        );
      }
    }

    // Performance recommendations
    if (performanceIssues.length > 0) {
      recommendations.push(
        `${performanceIssues.length} performance issues detected. Consider optimization to improve user experience.`,
      );

      const criticalPerformanceIssues = performanceIssues.filter(
        (i) => i.impact === "critical",
      );
      if (criticalPerformanceIssues.length > 0) {
        recommendations.push(
          `${criticalPerformanceIssues.length} critical performance issues may impact system usability.`,
        );
      }
    }

    // Success recommendations
    const successRate =
      (executions.filter((e) => e.status === "passed").length /
        executions.length) *
      100;
    if (successRate >= 95) {
      recommendations.push(
        "Excellent test results! Consider adding more comprehensive test scenarios.",
      );
    } else if (successRate >= 80) {
      recommendations.push(
        "Good test results. Focus on resolving remaining issues for better reliability.",
      );
    } else {
      recommendations.push(
        "Test success rate is below acceptable threshold. Immediate attention required.",
      );
    }

    return recommendations;
  }

  /**
   * Handle critical issues by sending notifications
   */
  private async handleCriticalIssues(report: TestReport): Promise<void> {
    const criticalIssues = [
      ...report.complianceIssues.filter((i) => i.severity === "critical"),
      ...report.safetyIssues.filter((i) => i.escalationRequired),
      ...report.performanceIssues.filter((i) => i.impact === "critical"),
    ];

    if (criticalIssues.length > 0) {
      try {
        await realTimeNotificationService.sendNotification({
          type: "critical-test-issues",
          recipientId: "system-admin",
          title: "Critical Test Issues Detected",
          message: `${criticalIssues.length} critical issues found in test execution. Immediate attention required.`,
          priority: "critical",
          channels: ["email", "sms", "push"],
          data: {
            reportId: report.id,
            issueCount: criticalIssues.length,
            suiteId: report.suiteId,
          },
        });
      } catch (error) {
        console.error("Failed to send critical issue notification:", error);
      }
    }
  }

  /**
   * Setup event listeners for integration with other services
   */
  private setupEventListeners(): void {
    // Listen for error handler events
    this.on("test-suite-completed", async (data) => {
      const { report } = data;

      // Record metrics
      performanceMonitoringService.recordMetric({
        type: "testing",
        name: "Test_Success_Rate",
        value: report.summary.successRate,
        unit: "percentage",
      });

      performanceMonitoringService.recordMetric({
        type: "testing",
        name: "Test_Execution_Duration",
        value: report.duration,
        unit: "milliseconds",
      });

      performanceMonitoringService.recordMetric({
        type: "compliance",
        name: "DOH_Compliance_Score",
        value: report.summary.complianceScore,
        unit: "percentage",
      });

      performanceMonitoringService.recordMetric({
        type: "safety",
        name: "Patient_Safety_Score",
        value: report.summary.safetyScore,
        unit: "percentage",
      });
    });
  }

  /**
   * Start scheduled test execution
   */
  private startScheduledExecution(): void {
    for (const [suiteId, suite] of this.testSuites.entries()) {
      if (suite.schedule?.enabled) {
        const interval = this.getScheduleInterval(suite.schedule);

        const job = setInterval(async () => {
          try {
            console.log(`⏰ Executing scheduled test suite: ${suite.name}`);
            await this.executeTestSuite(suiteId);
          } catch (error) {
            console.error(
              `❌ Scheduled test execution failed for suite '${suite.name}':`,
              error,
            );
          }
        }, interval);

        this.scheduledJobs.set(suiteId, job);
      }
    }
  }

  /**
   * Get schedule interval in milliseconds
   */
  private getScheduleInterval(schedule: TestSchedule): number {
    switch (schedule.frequency) {
      case "hourly":
        return 60 * 60 * 1000; // 1 hour
      case "daily":
        return 24 * 60 * 60 * 1000; // 24 hours
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 24 * 60 * 60 * 1000; // Default to daily
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in test service event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Public API methods
  getTestSuites(): TestSuite[] {
    return Array.from(this.testSuites.values());
  }

  getTestSuite(suiteId: string): TestSuite | undefined {
    return this.testSuites.get(suiteId);
  }

  getTestReports(): TestReport[] {
    return [...this.testReports];
  }

  getLatestReport(suiteId?: string): TestReport | undefined {
    if (suiteId) {
      return this.testReports
        .filter((r) => r.suiteId === suiteId)
        .sort(
          (a, b) => b.executionDate.getTime() - a.executionDate.getTime(),
        )[0];
    } else {
      return this.testReports.sort(
        (a, b) => b.executionDate.getTime() - a.executionDate.getTime(),
      )[0];
    }
  }

  getActiveExecutions(): TestExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  async addTestSuite(suite: TestSuite): Promise<void> {
    this.testSuites.set(suite.id, suite);

    // Start scheduled execution if enabled
    if (suite.schedule?.enabled) {
      const interval = this.getScheduleInterval(suite.schedule);
      const job = setInterval(async () => {
        try {
          await this.executeTestSuite(suite.id);
        } catch (error) {
          console.error(
            `❌ Scheduled test execution failed for suite '${suite.name}':`,
            error,
          );
        }
      }, interval);

      this.scheduledJobs.set(suite.id, job);
    }

    console.log(`➕ Added test suite: ${suite.name}`);
  }

  async removeTestSuite(suiteId: string): Promise<boolean> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      return false;
    }

    // Stop scheduled job if exists
    const job = this.scheduledJobs.get(suiteId);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(suiteId);
    }

    this.testSuites.delete(suiteId);
    console.log(`➖ Removed test suite: ${suite.name}`);
    return true;
  }

  isHealthy(): boolean {
    return this.isInitialized && this.testSuites.size > 0;
  }

  async cleanup(): Promise<void> {
    // Stop all scheduled jobs
    for (const [suiteId, job] of this.scheduledJobs.entries()) {
      clearInterval(job);
    }
    this.scheduledJobs.clear();

    // Clear active executions
    this.activeExecutions.clear();

    // Clear event listeners
    this.eventListeners.clear();

    // Clear test data
    this.testData.clear();
    this.mockServices.clear();

    this.isInitialized = false;
    console.log("🧹 End-to-End Automated Testing Service cleaned up");
  }
}

export const endToEndAutomatedTestingService =
  new EndToEndAutomatedTestingService();
export {
  TestScenario,
  TestStep,
  TestExecution,
  TestResult,
  TestSuite,
  TestReport,
  TestMetrics,
  ComplianceIssue,
  SafetyIssue,
  PerformanceIssue,
};
export default endToEndAutomatedTestingService;
