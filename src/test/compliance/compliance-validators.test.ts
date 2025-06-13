import { describe, it, expect, beforeEach, vi } from "vitest";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { SecurityService, AuditLogger } from "@/services/security.service";
import { performanceMonitor } from "@/services/performance-monitor.service";

describe("Compliance Validators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DOH 2025 Standards Validation", () => {
    it("should validate Emirates ID format correctly", () => {
      const validEmiratesId = "784-2024-1234567-1";
      const invalidEmiratesId = "123-invalid-format";

      expect(validateEmiratesId(validEmiratesId)).toBe(true);
      expect(validateEmiratesId(invalidEmiratesId)).toBe(false);
    });

    it("should validate DOH service codes", () => {
      const validServiceCodes = [
        "17-25-1",
        "17-25-2",
        "17-25-3",
        "17-25-4",
        "17-25-5",
      ];
      const invalidServiceCodes = ["17-26-1", "17-26-2", "invalid-code"];

      validServiceCodes.forEach((code) => {
        expect(validateDOHServiceCode(code)).toBe(true);
      });

      invalidServiceCodes.forEach((code) => {
        expect(validateDOHServiceCode(code)).toBe(false);
      });
    });

    it("should validate submission timeline compliance", () => {
      const validSubmissionTime = new Date();
      validSubmissionTime.setHours(7, 30, 0, 0); // 7:30 AM UAE time

      const lateSubmissionTime = new Date();
      lateSubmissionTime.setHours(9, 0, 0, 0); // 9:00 AM UAE time (past 8 AM deadline)

      expect(validateSubmissionTimeline(validSubmissionTime)).toBe(true);
      expect(validateSubmissionTimeline(lateSubmissionTime)).toBe(false);
    });

    it("should validate required documents completeness", () => {
      const completeDocuments = [
        "auth-request-form",
        "medical-report",
        "face-to-face-assessment",
        "daman-consent",
        "doh-assessment",
      ];

      const incompleteDocuments = ["auth-request-form", "medical-report"];

      expect(validateDocumentCompleteness(completeDocuments)).toBe(true);
      expect(validateDocumentCompleteness(incompleteDocuments)).toBe(false);
    });
  });

  describe("Daman MSC Compliance Validation", () => {
    it("should validate MSC authorization data", () => {
      const validMSCData = {
        policyType: "MSC",
        initialVisitDate: new Date().toISOString(),
        atcEffectiveDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        treatmentPeriod: 60,
        monthlyBillingConfirmed: true,
        serviceConfirmation: { patientSignature: true },
        dailySchedule: { signed: true },
      };

      expect(validateMSCCompliance(validMSCData)).toBe(true);
    });

    it("should reject MSC data with invalid treatment period", () => {
      const invalidMSCData = {
        policyType: "MSC",
        treatmentPeriod: 120, // Exceeds 90-day limit
        monthlyBillingConfirmed: true,
      };

      expect(validateMSCCompliance(invalidMSCData)).toBe(false);
    });

    it("should validate 90-day rule compliance", () => {
      const validData = {
        initialVisitDate: new Date().toISOString(),
        atcEffectiveDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      const invalidData = {
        initialVisitDate: new Date().toISOString(),
        atcEffectiveDate: new Date(
          Date.now() - 120 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      expect(validate90DayRule(validData)).toBe(true);
      expect(validate90DayRule(invalidData)).toBe(false);
    });
  });

  describe("Data Integrity Validation", () => {
    it("should validate JSON structure integrity", () => {
      const validJSON = { name: "test", value: 123, nested: { prop: "value" } };
      const invalidJSON = { name: "test", circular: null };
      invalidJSON.circular = invalidJSON; // Create circular reference

      const validResult = JsonValidator.validate(JSON.stringify(validJSON));
      expect(validResult.isValid).toBe(true);

      // Circular reference should be handled
      expect(() => JSON.stringify(invalidJSON)).toThrow();
    });

    it("should sanitize input data properly", () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = inputSanitizer.sanitizeText(maliciousInput, 100);

      expect(sanitized.sanitized).not.toContain("<script>");
      expect(sanitized.sanitized).toContain("Hello World");
    });

    it("should validate phone number formats", () => {
      const validPhones = ["+971501234567", "971501234567", "0501234567"];
      const invalidPhones = ["123456", "+1234567890", "invalid"];

      validPhones.forEach((phone) => {
        expect(validatePhoneNumber(phone)).toBe(true);
      });

      invalidPhones.forEach((phone) => {
        expect(validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe("Security Compliance Validation", () => {
    it("should validate encryption requirements", () => {
      const sensitiveData = {
        emirates_id: "784-2024-1234567-1",
        medical_record_number: "MRN123456",
        phone: "+971501234567",
      };

      const encrypted = encryptSensitiveData(sensitiveData);
      expect(encrypted.emirates_id).not.toBe(sensitiveData.emirates_id);
      expect(encrypted._encrypted).toBe(true);
    });

    it("should log compliance violations properly", () => {
      const violation = {
        type: "missing_signature",
        description: "Patient signature missing from authorization form",
        standard: "DOH_2025" as const,
        severity: "high" as const,
      };

      AuditLogger.logComplianceViolation(violation);
      const violations = AuditLogger.getComplianceViolations(10);

      expect(violations.length).toBeGreaterThan(0);
      expect(violations[violations.length - 1].details.violationType).toBe(
        "missing_signature",
      );
    });
  });

  describe("Performance Validation", () => {
    it("should validate API response times", async () => {
      const startTime = Date.now();
      await simulateAPICall(100); // 100ms delay
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // Should be under 2 seconds
      expect(validateResponseTime(responseTime)).toBe(true);

      // Record performance metric
      performanceMonitor.recordComplianceAPICall(
        "test-endpoint",
        responseTime,
        true,
        "DOH_2025",
      );
    });

    it("should detect performance degradation", () => {
      const responseTimes = [100, 150, 200, 1500, 2000, 2500]; // Increasing response times
      const degradation = detectPerformanceDegradation(responseTimes);

      expect(degradation.detected).toBe(true);
      expect(degradation.severity).toBe("high");
    });

    it("should validate compliance validation performance", () => {
      const validationStartTime = Date.now();

      // Simulate validation process
      const testData = {
        patientId: "patient-123",
        serviceType: "homecare",
        clinicalJustification: "Patient requires nursing care",
      };

      const isValid = validateMSCCompliance(testData);
      const validationTime = Date.now() - validationStartTime;

      // Record validation metric
      performanceMonitor.recordComplianceValidation(
        "msc-compliance",
        validationTime,
        isValid,
        { testData },
      );

      expect(validationTime).toBeLessThan(1000); // Should complete within 1 second
      expect(isValid).toBe(true);
    });

    it("should generate compliance performance report", () => {
      // Record some test metrics
      performanceMonitor.recordComplianceValidation(
        "doh-compliance",
        250,
        true,
      );
      performanceMonitor.recordComplianceValidation(
        "daman-validation",
        180,
        true,
      );
      performanceMonitor.recordComplianceAPICall(
        "authorization",
        450,
        true,
        "DAMAN_MSC",
      );

      const report = performanceMonitor.getCompliancePerformanceReport();

      expect(report).toHaveProperty("validationPerformance");
      expect(report).toHaveProperty("apiPerformance");
      expect(report).toHaveProperty("systemHealth");
      expect(report.systemHealth.overallScore).toBeGreaterThan(0);
      expect(Array.isArray(report.systemHealth.recommendations)).toBe(true);
    });
  });
});

// Helper functions for testing
function validateEmiratesId(emiratesId: string): boolean {
  const pattern = /^784-\d{4}-\d{7}-\d{1}$/;
  return pattern.test(emiratesId);
}

function validateDOHServiceCode(code: string): boolean {
  const validCodes = ["17-25-1", "17-25-2", "17-25-3", "17-25-4", "17-25-5"];
  return validCodes.includes(code);
}

function validateSubmissionTimeline(submissionTime: Date): boolean {
  const deadlineHour = 8; // 8 AM UAE time
  return submissionTime.getHours() < deadlineHour;
}

function validateDocumentCompleteness(documents: string[]): boolean {
  const requiredDocs = [
    "auth-request-form",
    "medical-report",
    "face-to-face-assessment",
    "daman-consent",
    "doh-assessment",
  ];

  return requiredDocs.every((doc) => documents.includes(doc));
}

function validateMSCCompliance(data: any): boolean {
  if (data.policyType !== "MSC") return true;

  if (data.treatmentPeriod && data.treatmentPeriod > 90) return false;
  if (!data.monthlyBillingConfirmed) return false;
  if (data.serviceConfirmation && !data.serviceConfirmation.patientSignature)
    return false;
  if (data.dailySchedule && !data.dailySchedule.signed) return false;

  return true;
}

function validate90DayRule(data: any): boolean {
  if (!data.initialVisitDate || !data.atcEffectiveDate) return false;

  const initialVisit = new Date(data.initialVisitDate);
  const atcEffective = new Date(data.atcEffectiveDate);
  const daysDifference = Math.abs(
    (initialVisit.getTime() - atcEffective.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysDifference <= 90;
}

function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  if (cleanPhone.startsWith("+971")) {
    return cleanPhone.length === 13;
  } else if (cleanPhone.startsWith("971")) {
    return cleanPhone.length === 12;
  } else if (cleanPhone.startsWith("05") || cleanPhone.startsWith("04")) {
    return cleanPhone.length === 10;
  }

  return false;
}

function encryptSensitiveData(data: any): any {
  const encrypted = { ...data };
  const sensitiveFields = ["emirates_id", "medical_record_number", "phone"];

  sensitiveFields.forEach((field) => {
    if (encrypted[field]) {
      encrypted[field] = btoa(encrypted[field]); // Simple base64 encoding for testing
    }
  });

  encrypted._encrypted = true;
  return encrypted;
}

function simulateAPICall(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function validateResponseTime(responseTime: number): boolean {
  return responseTime < 2000; // 2 second threshold
}

function detectPerformanceDegradation(responseTimes: number[]): {
  detected: boolean;
  severity: string;
} {
  if (responseTimes.length < 3) return { detected: false, severity: "none" };

  const recent = responseTimes.slice(-3);
  const average = recent.reduce((sum, time) => sum + time, 0) / recent.length;

  if (average > 2000) {
    return { detected: true, severity: "high" };
  } else if (average > 1000) {
    return { detected: true, severity: "medium" };
  }

  return { detected: false, severity: "none" };
}
