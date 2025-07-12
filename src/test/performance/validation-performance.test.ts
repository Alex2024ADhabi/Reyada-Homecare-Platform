import { describe, it, expect, beforeEach, vi } from "vitest";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { performanceMonitor } from "@/services/performance-monitor.service";

describe("Validation Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("JSON Validation Performance", () => {
    it("should validate small JSON objects quickly", () => {
      const testData = {
        patientId: "patient-123",
        name: "Ahmed Al Mansouri",
        emiratesId: "784-1990-1234567-8",
      };

      const startTime = performance.now();
      const result = JsonValidator.validate(JSON.stringify(testData));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(10); // Should complete in under 10ms
    });

    it("should handle large JSON objects within acceptable time", () => {
      // Create a large test object
      const largeData = {
        patients: Array.from({ length: 1000 }, (_, i) => ({
          id: `patient-${i}`,
          name: `Patient ${i}`,
          emiratesId: `784-1990-${String(i).padStart(7, "0")}-1`,
          assessments: Array.from({ length: 10 }, (_, j) => ({
            id: `assessment-${i}-${j}`,
            date: new Date().toISOString(),
            score: Math.floor(Math.random() * 40) + 10,
          })),
        })),
      };

      const startTime = performance.now();
      const result = JsonValidator.validate(JSON.stringify(largeData));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should validate DOH compliance data efficiently", () => {
      const dohData = {
        patientId: "patient-123",
        emiratesId: "784-1990-1234567-8",
        serviceType: "homecare",
        providerLicense: "DOH-12345",
        clinicalJustification: "Patient requires nursing care",
        serviceDate: new Date().toISOString(),
        priorAuthorizationNumber: "AUTH-123456",
        membershipNumber: "MEM-789012",
        serviceCode: "17-25-1",
        diagnosisCode: "Z51.11",
        providerSignature: "Dr. Sarah Ahmed",
        patientSignature: "Ahmed Al Mansouri",
        letterOfAppointment: "LOA-2024-001",
        contactPersonDetails: {
          name: "Fatima Al Zahra",
          email: "fatima@provider.ae",
          phone: "+971501234567",
        },
        faceToFaceAssessment: {
          completed: true,
          date: new Date().toISOString(),
          assessor: "Dr. Sarah Ahmed",
        },
      };

      const startTime = performance.now();
      const result = JsonValidator.validateDOHComplianceData(dohData);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(result.complianceScore).toBeGreaterThan(80);
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should handle malformed JSON gracefully", () => {
      const malformedJson = '{"name": "test", "value": invalid}';

      const startTime = performance.now();
      const result = JsonValidator.validate(malformedJson);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(duration).toBeLessThan(20); // Should fail fast
    });
  });

  describe("Input Sanitization Performance", () => {
    it("should sanitize text input quickly", () => {
      const testInput =
        "<script>alert('xss')</script>Hello World! This is a test input.";

      const startTime = performance.now();
      const result = inputSanitizer.sanitizeText(testInput, 1000);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(result.sanitized).not.toContain("<script>");
      expect(duration).toBeLessThan(5); // Should complete in under 5ms
    });

    it("should handle large text inputs efficiently", () => {
      const largeInput =
        "A".repeat(10000) + '<script>alert("xss")</script>' + "B".repeat(10000);

      const startTime = performance.now();
      const result = inputSanitizer.sanitizeText(largeInput, 50000);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(result.sanitized).not.toContain("<script>");
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should validate form data with multiple fields efficiently", () => {
      const formData = {
        patientName: "Ahmed Al Mansouri",
        emiratesId: "784-1990-1234567-8",
        phone: "+971501234567",
        email: "ahmed@example.ae",
        address: "123 Sheikh Zayed Road, Dubai",
        clinicalNotes:
          "Patient requires comprehensive nursing care for diabetes management.",
        serviceType: "homecare",
        urgencyLevel: "routine",
      };

      const validationRules = {
        patientName: [
          { type: "required" as const, message: "Name is required" },
        ],
        emiratesId: [
          {
            type: "pattern" as const,
            value: /^784-\d{4}-\d{7}-\d{1}$/,
            message: "Invalid Emirates ID",
          },
        ],
        phone: [{ type: "phone" as const, message: "Invalid phone number" }],
        email: [{ type: "email" as const, message: "Invalid email" }],
        serviceType: [
          { type: "required" as const, message: "Service type is required" },
        ],
      };

      const startTime = performance.now();
      const result = inputSanitizer.validateFormData(formData, validationRules);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(20); // Should complete in under 20ms
    });

    it("should handle DOH 2025 compliance validation efficiently", () => {
      const complianceData = {
        mscPlanExtension: true,
        requestedDuration: 60, // Within 90-day limit
        wheelchairRequest: false,
        homecareAllocation: true,
        documents: ["Face-to-Face Assessment (OpenJet)", "Medical Report"],
        openJetIntegration: true,
      };

      const validationRules = {
        complianceData: [
          {
            type: "doh2025Compliance" as const,
            message: "DOH 2025 compliance failed",
          },
        ],
      };

      const startTime = performance.now();
      const result = inputSanitizer.validateFormData(
        { complianceData },
        validationRules,
      );
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(30); // Should complete in under 30ms
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should record validation metrics efficiently", () => {
      const startTime = performance.now();

      // Record multiple validation metrics
      for (let i = 0; i < 100; i++) {
        performanceMonitor.recordComplianceValidation(
          `test-validation-${i}`,
          Math.random() * 100,
          Math.random() > 0.1, // 90% success rate
          { testData: `data-${i}` },
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should generate performance reports quickly", () => {
      // Record some test metrics first
      performanceMonitor.recordComplianceValidation(
        "doh-validation",
        150,
        true,
      );
      performanceMonitor.recordComplianceValidation(
        "daman-validation",
        200,
        true,
      );
      performanceMonitor.recordComplianceAPICall(
        "authorization",
        300,
        true,
        "DAMAN_MSC",
      );

      const startTime = performance.now();
      const report = performanceMonitor.getCompliancePerformanceReport();
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(report).toHaveProperty("validationPerformance");
      expect(report).toHaveProperty("apiPerformance");
      expect(report).toHaveProperty("systemHealth");
      expect(duration).toBeLessThan(10); // Should complete in under 10ms
    });

    it("should handle concurrent validation requests", async () => {
      const validationPromises = [];

      // Create 50 concurrent validation requests
      for (let i = 0; i < 50; i++) {
        const promise = new Promise<void>((resolve) => {
          const testData = {
            id: `test-${i}`,
            value: `value-${i}`,
          };

          const startTime = performance.now();
          const result = JsonValidator.validate(JSON.stringify(testData));
          const endTime = performance.now();

          performanceMonitor.recordComplianceValidation(
            `concurrent-test-${i}`,
            endTime - startTime,
            result.isValid,
          );

          resolve();
        });

        validationPromises.push(promise);
      }

      const startTime = performance.now();
      await Promise.all(validationPromises);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(1000); // Should complete all in under 1 second
    });
  });

  describe("Memory Usage and Cleanup", () => {
    it("should not cause memory leaks during validation", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many validation operations
      for (let i = 0; i < 1000; i++) {
        const testData = {
          id: `test-${i}`,
          data: Array.from({ length: 100 }, (_, j) => `item-${j}`),
        };

        JsonValidator.validate(JSON.stringify(testData));
        inputSanitizer.sanitizeText(`Test input ${i}`, 1000);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it("should clean up performance metrics automatically", () => {
      const initialMetricsCount = performanceMonitor.getMetrics().length;

      // Add many metrics
      for (let i = 0; i < 2000; i++) {
        performanceMonitor.recordComplianceValidation(
          `cleanup-test-${i}`,
          Math.random() * 100,
          true,
        );
      }

      const afterAddingMetricsCount = performanceMonitor.getMetrics().length;

      // Should have added metrics but with automatic cleanup
      expect(afterAddingMetricsCount).toBeGreaterThan(initialMetricsCount);
      expect(afterAddingMetricsCount).toBeLessThan(2000); // Should be cleaned up
    });
  });

  describe("Stress Testing", () => {
    it("should handle validation stress test", () => {
      const stressTestData = {
        largeArray: Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `Description for item ${i}`.repeat(10),
          metadata: {
            created: new Date().toISOString(),
            tags: [`tag-${i}`, `category-${i % 10}`],
          },
        })),
      };

      const startTime = performance.now();
      const result = JsonValidator.validate(JSON.stringify(stressTestData));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });

    it("should handle sanitization stress test", () => {
      const stressInput = Array.from(
        { length: 1000 },
        (_, i) =>
          `<script>alert('xss-${i}')</script>Content ${i} with <b>HTML</b> tags.`,
      ).join(" ");

      const startTime = performance.now();
      const result = inputSanitizer.sanitizeText(stressInput, 100000);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(result.sanitized).not.toContain("<script>");
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });
  });

  describe("Benchmark Comparisons", () => {
    it("should meet performance benchmarks for typical use cases", () => {
      const benchmarks = {
        smallJsonValidation: 5, // ms
        mediumJsonValidation: 20, // ms
        textSanitization: 3, // ms
        formValidation: 15, // ms
        complianceValidation: 25, // ms
      };

      // Small JSON validation
      const smallData = { id: 1, name: "test" };
      let startTime = performance.now();
      JsonValidator.validate(JSON.stringify(smallData));
      let duration = performance.now() - startTime;
      expect(duration).toBeLessThan(benchmarks.smallJsonValidation);

      // Medium JSON validation
      const mediumData = {
        patients: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Patient ${i}`,
        })),
      };
      startTime = performance.now();
      JsonValidator.validate(JSON.stringify(mediumData));
      duration = performance.now() - startTime;
      expect(duration).toBeLessThan(benchmarks.mediumJsonValidation);

      // Text sanitization
      startTime = performance.now();
      inputSanitizer.sanitizeText(
        "<script>alert('test')</script>Hello World",
        1000,
      );
      duration = performance.now() - startTime;
      expect(duration).toBeLessThan(benchmarks.textSanitization);

      // Form validation
      const formData = {
        name: "Ahmed",
        email: "ahmed@example.ae",
        phone: "+971501234567",
      };
      const rules = {
        name: [{ type: "required" as const, message: "Required" }],
        email: [{ type: "email" as const, message: "Invalid email" }],
        phone: [{ type: "phone" as const, message: "Invalid phone" }],
      };
      startTime = performance.now();
      inputSanitizer.validateFormData(formData, rules);
      duration = performance.now() - startTime;
      expect(duration).toBeLessThan(benchmarks.formValidation);

      // DOH compliance validation
      const complianceData = {
        patientId: "patient-123",
        serviceCode: "17-25-1",
        emiratesId: "784-1990-1234567-8",
      };
      startTime = performance.now();
      JsonValidator.validateDOHComplianceData(complianceData);
      duration = performance.now() - startTime;
      expect(duration).toBeLessThan(benchmarks.complianceValidation);
    });
  });
});
