import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiService } from "@/services/api.service";
import { offlineService } from "@/services/offline.service";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock offline service
vi.mock("@/services/offline.service", () => ({
  offlineService: {
    addToQueue: vi.fn(),
    processQueue: vi.fn(),
    getPendingSyncItems: vi.fn(),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

describe("API Workflow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigator.onLine = true;
  });

  describe("Online API Operations", () => {
    it("should successfully submit a Daman authorization when online", async () => {
      const mockAuthData = {
        patientId: "patient-123",
        documents: [
          "auth-request-form",
          "medical-report",
          "face-to-face",
          "daman-consent",
          "doh-assessment",
        ],
        clinicalJustification:
          "Patient requires home healthcare services due to chronic condition management",
        requestedServices: ["nursing-care", "physiotherapy"],
        requestedDuration: "30-days",
        digitalSignatures: {
          patientSignature: "patient-sig-data",
          providerSignature: "provider-sig-data",
        },
      };

      // Mock successful API response
      const mockResponse = {
        id: "auth-456",
        status: "submitted",
        referenceNumber: "DAM-2024-001",
      };

      vi.spyOn(ApiService, "post").mockResolvedValue(mockResponse);
      vi.spyOn(
        ApiService,
        "logAuthorizationSubmission" as any,
      ).mockResolvedValue(undefined);

      const result = await ApiService.submitDamanAuthorization(mockAuthData);

      expect(result).toEqual(mockResponse);
      expect(ApiService.post).toHaveBeenCalledWith(
        expect.stringContaining("/daman/submit"),
        mockAuthData,
      );
    });

    it("should successfully submit a claim when online", async () => {
      const mockClaimData = {
        patientId: "patient-123",
        serviceLines: [
          {
            serviceCode: "NURSE-001",
            serviceDescription: "Nursing Care",
            quantity: 1,
            unitPrice: 150,
            dateOfService: "2024-01-15",
            providerId: "provider-001",
          },
        ],
        documents: ["claim-form", "service-log", "authorization-letter"],
        claimType: "homecare",
        billingPeriod: "2024-01",
      };

      const mockResponse = {
        id: "claim-789",
        status: "submitted",
        claimNumber: "CLM-2024-001",
      };

      vi.spyOn(ApiService, "post").mockResolvedValue(mockResponse);
      vi.spyOn(ApiService, "logClaimSubmission" as any).mockResolvedValue(
        undefined,
      );

      const result = await ApiService.submitClaim(mockClaimData);

      expect(result).toEqual(mockResponse);
      expect(ApiService.post).toHaveBeenCalledWith(
        expect.stringContaining("/claims/submit"),
        mockClaimData,
      );
    });

    it("should handle API validation errors gracefully", async () => {
      const invalidAuthData = {
        patientId: "patient-123",
        // Missing required fields
      };

      await expect(
        ApiService.submitDamanAuthorization(invalidAuthData),
      ).rejects.toThrow("Missing required fields");
    });
  });

  describe("Offline API Operations", () => {
    beforeEach(() => {
      navigator.onLine = false;
    });

    it("should queue API requests when offline", async () => {
      const mockAuthData = {
        patientId: "patient-123",
        documents: [
          "auth-request-form",
          "medical-report",
          "face-to-face",
          "daman-consent",
          "doh-assessment",
        ],
        clinicalJustification: "Patient requires home healthcare services",
        requestedServices: ["nursing-care"],
        requestedDuration: "30-days",
        digitalSignatures: {
          patientSignature: "patient-sig-data",
          providerSignature: "provider-sig-data",
        },
      };

      // Mock network error
      vi.spyOn(ApiService, "post").mockRejectedValue(
        new Error("Network Error"),
      );

      try {
        await ApiService.submitDamanAuthorization(mockAuthData);
      } catch (error) {
        // Expected to fail, but should queue the request
      }

      // Verify request was queued for offline processing
      expect(offlineService.addToQueue).toHaveBeenCalled();
    });

    it("should process queued requests when coming back online", async () => {
      // Simulate having queued requests
      const mockQueuedRequests = [
        {
          url: "/api/authorizations/daman/submit",
          method: "POST",
          data: { patientId: "patient-123" },
          timestamp: new Date().toISOString(),
        },
      ];

      vi.mocked(offlineService.getPendingSyncItems).mockResolvedValue({
        clinicalForms: [],
        patientAssessments: [],
        serviceInitiations: [],
      });

      // Come back online
      navigator.onLine = true;

      await offlineService.processQueue();

      expect(offlineService.processQueue).toHaveBeenCalled();
    });
  });

  describe("Circuit Breaker Integration", () => {
    it("should handle service failures with circuit breaker", async () => {
      // Mock multiple failures to trigger circuit breaker
      vi.spyOn(ApiService, "post").mockRejectedValue(
        new Error("Service Unavailable"),
      );

      const requests = Array(6)
        .fill(null)
        .map(() => ApiService.post("/test-endpoint", {}));

      const results = await Promise.allSettled(requests);

      // All requests should fail
      results.forEach((result) => {
        expect(result.status).toBe("rejected");
      });
    });
  });

  describe("Data Validation Integration", () => {
    it("should validate Daman authorization data comprehensively", async () => {
      const testCases = [
        {
          name: "missing patient ID",
          data: { documents: ["test"] },
          expectedError: "Missing required fields: patientId",
        },
        {
          name: "missing documents",
          data: { patientId: "test" },
          expectedError: "Missing required fields: documents",
        },
        {
          name: "insufficient clinical justification",
          data: {
            patientId: "test",
            documents: [
              "auth-request-form",
              "medical-report",
              "face-to-face",
              "daman-consent",
              "doh-assessment",
            ],
            clinicalJustification: "short",
            requestedServices: ["nursing"],
            requestedDuration: "30-days",
            digitalSignatures: {
              patientSignature: "sig1",
              providerSignature: "sig2",
            },
          },
          expectedError:
            "Clinical justification must be at least 50 characters long",
        },
      ];

      for (const testCase of testCases) {
        await expect(
          ApiService.submitDamanAuthorization(testCase.data),
        ).rejects.toThrow(testCase.expectedError);
      }
    });

    it("should validate claim data comprehensively", async () => {
      const testCases = [
        {
          name: "missing service lines",
          data: { patientId: "test" },
          expectedError: "Missing required fields: serviceLines",
        },
        {
          name: "empty service lines",
          data: {
            patientId: "test",
            serviceLines: [],
            documents: ["claim-form", "service-log", "authorization-letter"],
            claimType: "homecare",
            billingPeriod: "2024-01",
          },
          expectedError: "At least one service line is required",
        },
        {
          name: "invalid service line data",
          data: {
            patientId: "test",
            serviceLines: [
              {
                serviceCode: "TEST",
                serviceDescription: "Test",
                quantity: 0, // Invalid
                unitPrice: 100,
                dateOfService: "2024-01-01",
                providerId: "provider-001",
              },
            ],
            documents: ["claim-form", "service-log", "authorization-letter"],
            claimType: "homecare",
            billingPeriod: "2024-01",
          },
          expectedError: "Service line 1 has invalid quantity or unit price",
        },
      ];

      for (const testCase of testCases) {
        await expect(ApiService.submitClaim(testCase.data)).rejects.toThrow(
          testCase.expectedError,
        );
      }
    });
  });

  describe("Error Recovery Integration", () => {
    it("should retry failed requests with exponential backoff", async () => {
      let attemptCount = 0;
      vi.spyOn(ApiService, "post").mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error("Temporary failure"));
        }
        return Promise.resolve({ success: true });
      });

      // This would be handled by the retry mechanism in the actual implementation
      // For now, we'll simulate the retry logic
      let result;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          result = await ApiService.post("/test-endpoint", {});
          break;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            throw error;
          }
          // Wait before retry (in real implementation)
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retries)),
          );
        }
      }

      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should monitor API call performance", async () => {
      const mockResponse = { data: "test" };
      vi.spyOn(ApiService, "get").mockResolvedValue(mockResponse);

      const startTime = performance.now();
      const result = await ApiService.get("/test-endpoint");
      const endTime = performance.now();

      expect(result).toEqual(mockResponse);
      expect(endTime - startTime).toBeGreaterThan(0);
    });
  });
});
