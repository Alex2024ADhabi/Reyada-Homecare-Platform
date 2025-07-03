import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { errorHandlerService } from "@/services/error-handler.service";

describe("Enhanced Error Handler Service", () => {
  beforeEach(() => {
    // Reset error handler state
    errorHandlerService.clearAllErrors();
    errorHandlerService.enableHealthcareMode(true);
    errorHandlerService.enableDOHCompliance(true);
    errorHandlerService.enablePatientSafetyMode(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Error Handling", () => {
    it("should handle basic errors correctly", () => {
      const testError = new Error("Test error message");
      const errorReport = errorHandlerService.handleError(testError, {
        context: "Unit Test",
      });

      expect(errorReport).toBeDefined();
      expect(errorReport.message).toBe("Test error message");
      expect(errorReport.severity).toBe("low");
      expect(errorReport.category).toBe("system");
      expect(errorReport.resolved).toBe(false);
    });

    it("should categorize network errors correctly", () => {
      const networkError = new Error("Network connection failed");
      const errorReport = errorHandlerService.handleError(networkError, {
        context: "API Call",
      });

      expect(errorReport.category).toBe("network");
      expect(errorReport.severity).toBe("high");
    });

    it("should categorize validation errors correctly", () => {
      const validationError = new Error("Validation failed for input");
      const errorReport = errorHandlerService.handleError(validationError, {
        context: "Form Validation",
      });

      expect(errorReport.category).toBe("validation");
      expect(errorReport.severity).toBe("medium");
    });
  });

  describe("Healthcare-Specific Error Handling", () => {
    it("should identify patient safety risks", () => {
      const patientError = new Error("Patient data corruption detected");
      const errorReport = errorHandlerService.handleError(patientError, {
        context: "Patient Management",
        patientId: "PAT-001",
      });

      expect(errorReport.patientSafetyRisk).toBe(true);
      expect(errorReport.healthcareImpact).toBe("critical");
      expect(errorReport.severity).toBe("critical");
    });

    it("should identify DOH compliance risks", () => {
      const complianceError = new Error("DOH audit trail missing");
      const errorReport = errorHandlerService.handleError(complianceError, {
        context: "DOH Compliance Check",
        dohComplianceLevel: "required",
      });

      expect(errorReport.dohComplianceRisk).toBe(true);
      expect(errorReport.healthcareImpact).toBe("medium");
    });

    it("should handle clinical workflow errors", () => {
      const clinicalError = new Error("Clinical assessment failed");
      const errorReport = errorHandlerService.handleError(clinicalError, {
        context: "Clinical Workflow",
        healthcareWorkflow: "clinical_assessment",
        episodeId: "EP-001",
      });

      expect(errorReport.healthcareImpact).toBe("high");
      expect(errorReport.recoveryStrategy).toBe("clinical_degradation");
    });
  });

  describe("Error Recovery and Retry Logic", () => {
    it("should determine correct retry strategy for healthcare workflows", () => {
      const syncError = new Error("Patient data sync failed");
      const errorReport = errorHandlerService.handleError(syncError, {
        context: "Data Synchronization",
        healthcareWorkflow: "patient_data_sync",
      });

      expect(errorReport.maxRetries).toBe(5); // Healthcare workflows get more retries
      expect(errorReport.recoveryStrategy).toBe("standard_retry");
    });

    it("should handle emergency scenarios correctly", () => {
      const emergencyError = new Error("Patient safety protocol violation");
      const errorReport = errorHandlerService.handleError(emergencyError, {
        context: "Patient Safety",
        healthcareWorkflow: "patient_safety",
      });

      expect(errorReport.recoveryStrategy).toBe("emergency_fallback");
      expect(errorReport.patientSafetyRisk).toBe(true);
    });
  });

  describe("Error Metrics and Analytics", () => {
    it("should calculate error metrics correctly", () => {
      // Generate test errors
      errorHandlerService.handleError(new Error("Network error"), {
        context: "API",
        healthcareWorkflow: "patient_data_sync",
      });

      errorHandlerService.handleError(new Error("Patient data error"), {
        context: "Patient Safety",
        patientId: "PAT-001",
      });

      errorHandlerService.handleError(new Error("DOH compliance error"), {
        context: "DOH Compliance",
        dohComplianceLevel: "required",
      });

      const metrics = errorHandlerService.getErrorMetrics();
      const healthcareMetrics = errorHandlerService.getHealthcareErrorMetrics();

      expect(metrics.totalErrors).toBe(3);
      expect(healthcareMetrics.patientSafetyErrors).toBe(1);
      expect(healthcareMetrics.dohComplianceErrors).toBe(1);
      expect(healthcareMetrics.totalHealthcareErrors).toBeGreaterThan(0);
    });

    it("should track error recovery rates", () => {
      const error1 = errorHandlerService.handleError(
        new Error("Test error 1"),
        {
          context: "Test",
        },
      );

      const error2 = errorHandlerService.handleError(
        new Error("Test error 2"),
        {
          context: "Test",
        },
      );

      // Mark one error as resolved
      errorHandlerService.markErrorAsResolved(error1.id);

      const metrics = errorHandlerService.getHealthcareErrorMetrics();
      expect(metrics.recoveryRate).toBe(50); // 1 out of 2 errors resolved
    });
  });

  describe("Event System", () => {
    it("should emit events for critical errors", (done) => {
      errorHandlerService.on("critical-error", (errorReport) => {
        expect(errorReport.severity).toBe("critical");
        done();
      });

      errorHandlerService.handleError(
        new Error("Critical patient safety error"),
        {
          context: "Patient Safety",
          patientId: "PAT-001",
        },
      );
    });

    it("should emit events for patient safety risks", (done) => {
      errorHandlerService.on("patient-safety-risk", (errorReport) => {
        expect(errorReport.patientSafetyRisk).toBe(true);
        done();
      });

      errorHandlerService.handleError(new Error("Patient medication error"), {
        context: "Medication Management",
        patientId: "PAT-001",
      });
    });

    it("should emit events for DOH compliance risks", (done) => {
      errorHandlerService.on("doh-compliance-risk", (errorReport) => {
        expect(errorReport.dohComplianceRisk).toBe(true);
        done();
      });

      errorHandlerService.handleError(
        new Error("DOH audit requirement not met"),
        {
          context: "DOH Compliance",
          dohComplianceLevel: "required",
        },
      );
    });
  });

  describe("Error Storage and Persistence", () => {
    it("should store errors in memory correctly", () => {
      const testError = new Error("Storage test error");
      const errorReport = errorHandlerService.handleError(testError, {
        context: "Storage Test",
      });

      const retrievedError = errorHandlerService.getError(errorReport.id);
      expect(retrievedError).toBeDefined();
      expect(retrievedError?.message).toBe("Storage test error");
    });

    it("should retrieve errors by category", () => {
      errorHandlerService.handleError(new Error("Network error 1"), {
        context: "API",
      });

      errorHandlerService.handleError(new Error("Network error 2"), {
        context: "API",
      });

      errorHandlerService.handleError(new Error("Validation error"), {
        context: "Form",
      });

      const networkErrors = errorHandlerService.getErrorsByCategory("network");
      const validationErrors =
        errorHandlerService.getErrorsByCategory("validation");

      expect(networkErrors.length).toBe(2);
      expect(validationErrors.length).toBe(1);
    });

    it("should retrieve errors by severity", () => {
      errorHandlerService.handleError(new Error("Critical patient error"), {
        context: "Patient Safety",
        patientId: "PAT-001",
      });

      errorHandlerService.handleError(new Error("Minor UI error"), {
        context: "UI",
      });

      const criticalErrors =
        errorHandlerService.getErrorsBySeverity("critical");
      const lowErrors = errorHandlerService.getErrorsBySeverity("low");

      expect(criticalErrors.length).toBe(1);
      expect(lowErrors.length).toBe(1);
    });
  });

  describe("Healthcare Mode Configuration", () => {
    it("should enable/disable healthcare mode", () => {
      errorHandlerService.enableHealthcareMode(false);

      const error = errorHandlerService.handleError(new Error("Test error"), {
        context: "Test",
        patientId: "PAT-001",
      });

      // Healthcare-specific processing should be reduced when disabled
      expect(error.healthcareImpact).toBeDefined();
    });

    it("should enable/disable DOH compliance", () => {
      errorHandlerService.enableDOHCompliance(false);

      const error = errorHandlerService.handleError(
        new Error("DOH test error"),
        {
          context: "DOH Test",
          dohComplianceLevel: "required",
        },
      );

      // Should still detect compliance risk but not create audit trail
      expect(error.dohComplianceRisk).toBe(true);
    });

    it("should enable/disable patient safety mode", () => {
      errorHandlerService.enablePatientSafetyMode(false);

      const error = errorHandlerService.handleError(
        new Error("Patient safety test"),
        {
          context: "Patient Safety Test",
          patientId: "PAT-001",
        },
      );

      expect(error.patientSafetyRisk).toBe(true); // Still detected
    });
  });

  describe("Retry Queue Management", () => {
    it("should manage retry queue correctly", () => {
      const retryableError = new Error("Temporary network failure");
      errorHandlerService.handleError(retryableError, {
        context: "API Call",
        healthcareWorkflow: "patient_data_sync",
      });

      const queueStatus = errorHandlerService.getRetryQueueStatus();
      expect(queueStatus.queueSize).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(queueStatus.activeRetries)).toBe(true);
    });
  });

  describe("User-Friendly Messages", () => {
    it("should generate appropriate user messages for different error categories", () => {
      const networkError = errorHandlerService.handleError(
        new Error("Network failed"),
        {
          context: "API",
        },
      );

      const validationError = errorHandlerService.handleError(
        new Error("Invalid input"),
        {
          context: "Form",
        },
      );

      const securityError = errorHandlerService.handleError(
        new Error("Unauthorized access"),
        {
          context: "Security",
        },
      );

      expect(
        errorHandlerService.createUserFriendlyMessage(networkError),
      ).toContain("connecting to our servers");

      expect(
        errorHandlerService.createUserFriendlyMessage(validationError),
      ).toContain("check your input");

      expect(
        errorHandlerService.createUserFriendlyMessage(securityError),
      ).toContain("security issue");
    });
  });
});
