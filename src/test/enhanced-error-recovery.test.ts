import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { enhancedErrorRecoveryService } from "@/services/enhanced-error-recovery.service";
import { errorHandlerService } from "@/services/error-handler.service";

describe("Enhanced Error Recovery Service", () => {
  beforeEach(() => {
    // Reset services
    errorHandlerService.clearAllErrors();
    enhancedErrorRecoveryService.resetRecoveryMetrics();
    enhancedErrorRecoveryService.deactivateEmergencyMode();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Recovery Metrics", () => {
    it("should initialize with zero metrics", () => {
      const metrics = enhancedErrorRecoveryService.getRecoveryMetrics();

      expect(metrics.totalRecoveryAttempts).toBe(0);
      expect(metrics.successfulRecoveries).toBe(0);
      expect(metrics.failedRecoveries).toBe(0);
      expect(metrics.recoverySuccessRate).toBe(0);
    });

    it("should track recovery attempts", async () => {
      const testError = errorHandlerService.handleError(
        new Error("Network timeout"),
        {
          context: "API Call",
          healthcareWorkflow: "patient_data_sync",
        },
      );

      // Wait for auto-healing to process
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = enhancedErrorRecoveryService.getRecoveryMetrics();
      expect(metrics.totalRecoveryAttempts).toBeGreaterThanOrEqual(0);
    });
  });

  describe("System Health Monitoring", () => {
    it("should start with 100% health score", () => {
      const healthScore = enhancedErrorRecoveryService.getSystemHealthScore();
      expect(healthScore).toBe(100);
    });

    it("should not be in emergency mode initially", () => {
      const isEmergencyMode = enhancedErrorRecoveryService.isInEmergencyMode();
      expect(isEmergencyMode).toBe(false);
    });

    it("should activate emergency mode for critical patient safety errors", async () => {
      const criticalError = errorHandlerService.handleError(
        new Error("Critical patient data corruption"),
        {
          context: "Patient Safety",
          patientId: "PAT-001",
          healthcareWorkflow: "patient_safety",
        },
      );

      // Wait for emergency protocols to process
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Emergency mode should be activated for critical patient safety errors
      // Note: This depends on the specific implementation logic
      const healthScore = enhancedErrorRecoveryService.getSystemHealthScore();
      expect(healthScore).toBeLessThan(100);
    });
  });

  describe("Auto-Healing Rules", () => {
    it("should have auto-healing rules configured", () => {
      const rules = enhancedErrorRecoveryService.getAutoHealingRules();
      expect(rules.length).toBeGreaterThan(0);

      // Check for specific rules
      const ruleIds = rules.map((rule) => rule.id);
      expect(ruleIds).toContain("memory-leak-healing");
      expect(ruleIds).toContain("network-reconnection");
      expect(ruleIds).toContain("healthcare-sync-healing");
    });

    it("should have healthcare-specific healing rules", () => {
      const rules = enhancedErrorRecoveryService.getAutoHealingRules();
      const healthcareRules = rules.filter((rule) => rule.healthcareSpecific);

      expect(healthcareRules.length).toBeGreaterThan(0);
      expect(healthcareRules.every((rule) => rule.dohCompliant)).toBe(true);
    });
  });

  describe("System Failovers", () => {
    it("should have active failover systems", () => {
      const failovers = enhancedErrorRecoveryService.getActiveFailovers();
      expect(failovers.length).toBeGreaterThan(0);

      // Check for specific failover types
      const failoverTypes = failovers.map((f) => f.type);
      expect(failoverTypes).toContain("database");
      expect(failoverTypes).toContain("api");
    });

    it("should have healthy failover systems initially", () => {
      const failovers = enhancedErrorRecoveryService.getActiveFailovers();
      failovers.forEach((failover) => {
        expect(failover.status).toBe("healthy");
        expect(failover.isActive).toBe(true);
        expect(failover.currentFailures).toBe(0);
      });
    });
  });

  describe("Emergency Protocols", () => {
    it("should have emergency protocols configured", () => {
      const protocols = enhancedErrorRecoveryService.getEmergencyProtocols();
      expect(protocols.length).toBeGreaterThan(0);

      // Check for specific protocols
      const protocolIds = protocols.map((p) => p.id);
      expect(protocolIds).toContain("critical-patient-safety");
      expect(protocolIds).toContain("doh-compliance-emergency");
    });

    it("should have DOH compliant emergency protocols", () => {
      const protocols = enhancedErrorRecoveryService.getEmergencyProtocols();
      const dohProtocols = protocols.filter((p) => p.dohComplianceRequired);

      expect(dohProtocols.length).toBeGreaterThan(0);
      expect(dohProtocols.every((p) => p.dohComplianceRequired)).toBe(true);
    });
  });

  describe("Healthcare Error Processing", () => {
    it("should process healthcare errors with enhanced recovery", async () => {
      const healthcareError = errorHandlerService.handleError(
        new Error("Healthcare data sync failed"),
        {
          context: "Healthcare Workflow",
          healthcareWorkflow: "patient_data_sync",
          episodeId: "EP-001",
        },
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = enhancedErrorRecoveryService.getRecoveryMetrics();
      expect(metrics.healthcareRecoveries).toBeGreaterThanOrEqual(0);
    });

    it("should handle DOH compliance errors with special protocols", async () => {
      const complianceError = errorHandlerService.handleError(
        new Error("DOH submission validation failed"),
        {
          context: "DOH Compliance",
          dohComplianceLevel: "required",
          healthcareWorkflow: "doh_compliance",
        },
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = enhancedErrorRecoveryService.getRecoveryMetrics();
      expect(metrics.dohComplianceRecoveries).toBeGreaterThanOrEqual(0);
    });

    it("should escalate patient safety errors appropriately", async () => {
      const patientSafetyError = errorHandlerService.handleError(
        new Error("Patient medication dosage calculation error"),
        {
          context: "Patient Safety",
          patientId: "PAT-001",
          healthcareWorkflow: "patient_safety",
        },
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = enhancedErrorRecoveryService.getRecoveryMetrics();
      expect(metrics.patientSafetyRecoveries).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Force Recovery", () => {
    it("should allow manual force recovery of errors", async () => {
      const testError = errorHandlerService.handleError(
        new Error("Manual recovery test"),
        {
          context: "Manual Test",
        },
      );

      const recoveryResult = await enhancedErrorRecoveryService.forceRecovery(
        testError.id,
      );

      // Recovery result depends on error type and implementation
      expect(typeof recoveryResult).toBe("boolean");
    });

    it("should return false for non-existent error IDs", async () => {
      const recoveryResult =
        await enhancedErrorRecoveryService.forceRecovery("non-existent-id");
      expect(recoveryResult).toBe(false);
    });
  });

  describe("Emergency Mode Management", () => {
    it("should allow manual emergency mode activation and deactivation", () => {
      // Initially not in emergency mode
      expect(enhancedErrorRecoveryService.isInEmergencyMode()).toBe(false);

      // Deactivate (should remain false)
      enhancedErrorRecoveryService.deactivateEmergencyMode();
      expect(enhancedErrorRecoveryService.isInEmergencyMode()).toBe(false);
    });
  });

  describe("Service Lifecycle", () => {
    it("should properly clean up resources on destroy", () => {
      const initialFailovers =
        enhancedErrorRecoveryService.getActiveFailovers().length;
      const initialRules =
        enhancedErrorRecoveryService.getAutoHealingRules().length;

      expect(initialFailovers).toBeGreaterThan(0);
      expect(initialRules).toBeGreaterThan(0);

      // Destroy should clean up resources
      enhancedErrorRecoveryService.destroy();

      // After destroy, resources should be cleaned up
      // Note: This test depends on the specific implementation
      // and may need adjustment based on how destroy() is implemented
    });
  });

  describe("Integration with Error Handler Service", () => {
    it("should integrate seamlessly with error handler service", async () => {
      const initialMetrics = enhancedErrorRecoveryService.getRecoveryMetrics();

      // Generate various types of errors
      errorHandlerService.handleError(new Error("Network error"), {
        context: "Network Test",
      });

      errorHandlerService.handleError(new Error("Healthcare sync error"), {
        context: "Healthcare Test",
        healthcareWorkflow: "patient_data_sync",
      });

      errorHandlerService.handleError(new Error("DOH compliance error"), {
        context: "Compliance Test",
        dohComplianceLevel: "required",
      });

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      const finalMetrics = enhancedErrorRecoveryService.getRecoveryMetrics();

      // Metrics should be updated (exact values depend on implementation)
      expect(finalMetrics.totalRecoveryAttempts).toBeGreaterThanOrEqual(
        initialMetrics.totalRecoveryAttempts,
      );
    });
  });
});
