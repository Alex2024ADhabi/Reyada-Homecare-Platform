import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiService } from "@/services/api.service";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("ApiService Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Daman Authorization", () => {
    it("submits Daman authorization successfully", async () => {
      const mockResponse = {
        id: "auth-123",
        status: "submitted",
        referenceNumber: "REF-123",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      ApiService.post = mockPost;

      const authorizationData = {
        patientId: "patient-1",
        documents: [
          "auth-request-form",
          "medical-report",
          "face-to-face",
          "daman-consent",
          "doh-assessment",
        ],
        clinicalJustification:
          "Patient requires home nursing care due to chronic condition requiring daily monitoring and medication administration.",
        requestedServices: ["nursing", "physiotherapy"],
        requestedDuration: "30 days",
        digitalSignatures: {
          patientSignature: "patient-sig-data",
          providerSignature: "provider-sig-data",
        },
      };

      const result =
        await ApiService.submitDamanAuthorization(authorizationData);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/authorizations/daman/submit",
        authorizationData,
      );
    });

    it("validates required fields before submission", async () => {
      const incompleteData = {
        patientId: "patient-1",
        // Missing required fields
      };

      await expect(
        ApiService.submitDamanAuthorization(incompleteData),
      ).rejects.toThrow("Missing required fields");
    });

    it("validates required documents", async () => {
      const dataWithMissingDocs = {
        patientId: "patient-1",
        documents: ["auth-request-form"], // Missing required documents
        clinicalJustification: "Patient requires care",
        requestedServices: ["nursing"],
        requestedDuration: "30 days",
        digitalSignatures: {
          patientSignature: "patient-sig",
          providerSignature: "provider-sig",
        },
      };

      await expect(
        ApiService.submitDamanAuthorization(dataWithMissingDocs),
      ).rejects.toThrow("Missing required documents");
    });

    it("validates clinical justification length", async () => {
      const dataWithShortJustification = {
        patientId: "patient-1",
        documents: [
          "auth-request-form",
          "medical-report",
          "face-to-face",
          "daman-consent",
          "doh-assessment",
        ],
        clinicalJustification: "Short", // Too short
        requestedServices: ["nursing"],
        requestedDuration: "30 days",
        digitalSignatures: {
          patientSignature: "patient-sig",
          providerSignature: "provider-sig",
        },
      };

      await expect(
        ApiService.submitDamanAuthorization(dataWithShortJustification),
      ).rejects.toThrow(
        "Clinical justification must be at least 50 characters long",
      );
    });

    it("validates digital signatures", async () => {
      const dataWithMissingSignatures = {
        patientId: "patient-1",
        documents: [
          "auth-request-form",
          "medical-report",
          "face-to-face",
          "daman-consent",
          "doh-assessment",
        ],
        clinicalJustification:
          "Patient requires home nursing care due to chronic condition requiring daily monitoring.",
        requestedServices: ["nursing"],
        requestedDuration: "30 days",
        digitalSignatures: {
          patientSignature: "patient-sig",
          // Missing provider signature
        },
      };

      await expect(
        ApiService.submitDamanAuthorization(dataWithMissingSignatures),
      ).rejects.toThrow("Both patient and provider signatures are required");
    });

    it("gets authorization status", async () => {
      const mockResponse = {
        referenceNumber: "REF-123",
        status: "approved",
        approvalDate: "2024-01-01",
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      ApiService.get = mockGet;

      const result = await ApiService.getDamanAuthorizationStatus("REF-123");

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith(
        "/api/authorizations/daman/status/REF-123",
      );
    });

    it("gets authorization details", async () => {
      const mockResponse = {
        id: "auth-123",
        patientId: "patient-1",
        status: "approved",
        documents: ["doc1", "doc2"],
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      ApiService.get = mockGet;

      const result = await ApiService.getDamanAuthorizationDetails("auth-123");

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith(
        "/api/authorizations/daman/auth-123",
      );
    });
  });

  describe("Claims Processing", () => {
    it("submits claim successfully", async () => {
      const mockResponse = {
        id: "claim-123",
        claimNumber: "CLM-123",
        status: "submitted",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      ApiService.post = mockPost;

      const claimData = {
        patientId: "patient-1",
        serviceLines: [
          {
            serviceCode: "NURS001",
            serviceDescription: "Home Nursing Visit",
            quantity: 1,
            unitPrice: 150,
            dateOfService: "2024-01-01",
            providerId: "provider-1",
          },
        ],
        documents: ["claim-form", "service-log", "authorization-letter"],
        claimType: "professional",
        billingPeriod: "2024-01",
      };

      const result = await ApiService.submitClaim(claimData);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith("/api/claims/submit", claimData);
    });

    it("validates claim data before submission", async () => {
      const incompleteClaimData = {
        patientId: "patient-1",
        // Missing required fields
      };

      await expect(ApiService.submitClaim(incompleteClaimData)).rejects.toThrow(
        "Missing required fields",
      );
    });

    it("validates service lines", async () => {
      const claimDataWithInvalidServiceLines = {
        patientId: "patient-1",
        serviceLines: [
          {
            serviceCode: "NURS001",
            serviceDescription: "Home Nursing Visit",
            quantity: -1, // Invalid quantity
            unitPrice: 150,
            dateOfService: "2024-01-01",
            providerId: "provider-1",
          },
        ],
        documents: ["claim-form", "service-log", "authorization-letter"],
        claimType: "professional",
        billingPeriod: "2024-01",
      };

      await expect(
        ApiService.submitClaim(claimDataWithInvalidServiceLines),
      ).rejects.toThrow("invalid quantity or unit price");
    });

    it("gets claim status", async () => {
      const mockResponse = {
        claimNumber: "CLM-123",
        status: "processing",
        submissionDate: "2024-01-01",
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      ApiService.get = mockGet;

      const result = await ApiService.getClaimStatus("CLM-123");

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith("/api/claims/status/CLM-123");
    });

    it("records payment", async () => {
      const mockResponse = {
        id: "payment-123",
        claimId: "claim-123",
        amount: 150,
        status: "recorded",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      ApiService.post = mockPost;

      const paymentData = {
        claimId: "claim-123",
        amount: 150,
        paymentDate: "2024-01-01",
        paymentMethod: "bank_transfer",
      };

      const result = await ApiService.recordPayment(paymentData);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/payments/record",
        paymentData,
      );
    });

    it("reconciles payment", async () => {
      const mockResponse = {
        id: "reconciliation-123",
        status: "reconciled",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      ApiService.post = mockPost;

      const reconciliationData = {
        claimId: "claim-123",
        paymentId: "payment-123",
        reconciledAmount: 150,
      };

      const result = await ApiService.reconcilePayment(reconciliationData);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/reconciliation/reconcile",
        reconciliationData,
      );
    });
  });

  describe("Revenue Analytics", () => {
    it("generates revenue report", async () => {
      const mockResponse = {
        id: "report-123",
        reportType: "monthly",
        data: {
          totalRevenue: 10000,
          claimsSubmitted: 50,
          claimsPaid: 45,
        },
      };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      ApiService.post = mockPost;

      const reportParams = {
        reportType: "monthly",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      const result = await ApiService.generateRevenueReport(reportParams);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith(
        "/api/revenue/reports/generate",
        reportParams,
      );
    });

    it("gets accounts receivable aging", async () => {
      const mockResponse = {
        aging: {
          "0-30": 5000,
          "31-60": 3000,
          "61-90": 1500,
          "90+": 500,
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      ApiService.get = mockGet;

      const result = await ApiService.getAccountsReceivableAging();

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith("/api/revenue/aging", undefined);
    });

    it("gets revenue analytics", async () => {
      const mockResponse = {
        totalRevenue: 50000,
        monthlyGrowth: 5.2,
        topServices: ["nursing", "physiotherapy"],
        payerMix: {
          daman: 60,
          private: 40,
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      ApiService.get = mockGet;

      const result = await ApiService.getRevenueAnalytics();

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith("/api/revenue/analytics", undefined);
    });
  });

  describe("Error Handling", () => {
    it("handles network errors", async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error("Network Error"));
      ApiService.get = mockGet;

      await expect(ApiService.getClaimStatus("CLM-123")).rejects.toThrow(
        "Network Error",
      );
    });

    it("handles API errors with status codes", async () => {
      const apiError = {
        response: {
          status: 404,
          data: {
            message: "Claim not found",
          },
        },
      };

      const mockGet = vi.fn().mockRejectedValue(apiError);
      ApiService.get = mockGet;

      await expect(ApiService.getClaimStatus("INVALID-CLAIM")).rejects.toEqual(
        apiError,
      );
    });
  });
});
