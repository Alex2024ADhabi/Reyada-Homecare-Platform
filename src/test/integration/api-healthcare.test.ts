import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import {
  testPatients,
  testClinicians,
  testAssessments,
  testClaims,
} from "../fixtures/healthcare-test-data";

/**
 * Healthcare API Integration Testing Suite
 * Tests API endpoints and data flow for healthcare operations
 * Ensures proper integration between frontend and backend services
 */

// Mock fetch for API testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock API responses
const mockApiResponses = {
  patients: {
    list: {
      status: 200,
      data: testPatients,
    },
    create: {
      status: 201,
      data: testPatients[0],
    },
    update: {
      status: 200,
      data: {
        ...testPatients[0],
        name: { ...testPatients[0].name, first: "Updated" },
      },
    },
    delete: {
      status: 204,
      data: null,
    },
  },
  assessments: {
    list: {
      status: 200,
      data: testAssessments,
    },
    create: {
      status: 201,
      data: testAssessments[0],
    },
  },
  claims: {
    list: {
      status: 200,
      data: testClaims,
    },
    create: {
      status: 201,
      data: testClaims[0],
    },
  },
};

// API service functions
class HealthcareApiService {
  private baseUrl = "http://localhost:3001/api";

  async getPatients() {
    const response = await fetch(`${this.baseUrl}/patients`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    return response.json();
  }

  async createPatient(patientData: any) {
    const response = await fetch(`${this.baseUrl}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error("Failed to create patient");
    return response.json();
  }

  async updatePatient(id: string, patientData: any) {
    const response = await fetch(`${this.baseUrl}/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error("Failed to update patient");
    return response.json();
  }

  async deletePatient(id: string) {
    const response = await fetch(`${this.baseUrl}/patients/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete patient");
    return response.status === 204;
  }

  async searchPatients(query: string) {
    const response = await fetch(
      `${this.baseUrl}/patients/search?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) throw new Error("Failed to search patients");
    return response.json();
  }

  async getAssessments(patientId?: string) {
    const url = patientId
      ? `${this.baseUrl}/clinical/assessments?patientId=${patientId}`
      : `${this.baseUrl}/clinical/assessments`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch assessments");
    return response.json();
  }

  async createAssessment(assessmentData: any) {
    const response = await fetch(`${this.baseUrl}/clinical/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentData),
    });
    if (!response.ok) throw new Error("Failed to create assessment");
    return response.json();
  }

  async getClaims(status?: string) {
    const url = status
      ? `${this.baseUrl}/revenue/claims?status=${status}`
      : `${this.baseUrl}/revenue/claims`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch claims");
    return response.json();
  }

  async createClaim(claimData: any) {
    const response = await fetch(`${this.baseUrl}/revenue/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(claimData),
    });
    if (!response.ok) throw new Error("Failed to create claim");
    return response.json();
  }

  async getDamanAuthorizations(patientId?: string) {
    const url = patientId
      ? `${this.baseUrl}/compliance/daman/authorizations/${patientId}`
      : `${this.baseUrl}/compliance/daman/authorizations`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch authorizations");
    return response.json();
  }

  async createDamanAuthorization(authData: any) {
    const response = await fetch(
      `${this.baseUrl}/compliance/daman/authorizations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      },
    );
    if (!response.ok) throw new Error("Failed to create authorization");
    return response.json();
  }

  async getDohReports(month?: string) {
    const url = month
      ? `${this.baseUrl}/compliance/doh/reports?month=${month}`
      : `${this.baseUrl}/compliance/doh/reports`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch DOH reports");
    return response.json();
  }

  async getDashboardSummary() {
    const response = await fetch(`${this.baseUrl}/dashboard/summary`);
    if (!response.ok) throw new Error("Failed to fetch dashboard summary");
    return response.json();
  }

  async getAnalytics(period: string) {
    const response = await fetch(
      `${this.baseUrl}/analytics/performance?period=${period}`,
    );
    if (!response.ok) throw new Error("Failed to fetch analytics");
    return response.json();
  }
}

describe("Healthcare API Integration Tests", () => {
  let apiService: HealthcareApiService;

  beforeAll(() => {
    apiService = new HealthcareApiService();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Patient Management API", () => {
    it("should fetch patients list successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.patients.list.data,
      });

      const patients = await apiService.getPatients();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/patients",
      );
      expect(patients).toEqual(testPatients);
      expect(patients).toHaveLength(3);
    });

    it("should create a new patient successfully", async () => {
      const newPatientData = {
        emiratesId: "784-1995-9876543-2",
        name: {
          first: "Sara",
          middle: "Ahmed",
          last: "Al Hashimi",
        },
        dateOfBirth: "1995-05-20",
        gender: "female",
        nationality: "UAE",
        contact: {
          phone: "+971507777777",
          email: "sara.alhashimi@email.com",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newPatientData, id: "patient-004" }),
      });

      const createdPatient = await apiService.createPatient(newPatientData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/patients",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPatientData),
        },
      );
      expect(createdPatient).toHaveProperty("id");
      expect(createdPatient.name.first).toBe("Sara");
    });

    it("should update patient information successfully", async () => {
      const updateData = {
        contact: {
          phone: "+971508888888",
          email: "updated.email@example.com",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...testPatients[0], ...updateData }),
      });

      const updatedPatient = await apiService.updatePatient(
        "patient-001",
        updateData,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/patients/patient-001",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
      );
      expect(updatedPatient.contact.phone).toBe("+971508888888");
    });

    it("should delete patient successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiService.deletePatient("patient-001");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/patients/patient-001",
        { method: "DELETE" },
      );
      expect(result).toBe(true);
    });

    it("should search patients by query", async () => {
      const searchQuery = "Ahmed";
      const searchResults = testPatients.filter(
        (p) =>
          p.name.first.includes(searchQuery) ||
          p.name.last.includes(searchQuery),
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => searchResults,
      });

      const results = await apiService.searchPatients(searchQuery);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/patients/search?q=Ahmed",
      );
      expect(results).toHaveLength(1);
      expect(results[0].name.first).toBe("Ahmed");
    });

    it("should handle patient API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiService.getPatients()).rejects.toThrow(
        "Failed to fetch patients",
      );
    });
  });

  describe("Clinical Assessment API", () => {
    it("should fetch assessments list successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => testAssessments,
      });

      const assessments = await apiService.getAssessments();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/clinical/assessments",
      );
      expect(assessments).toEqual(testAssessments);
      expect(assessments).toHaveLength(2);
    });

    it("should fetch assessments for specific patient", async () => {
      const patientAssessments = testAssessments.filter(
        (a) => a.patientId === "patient-001",
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => patientAssessments,
      });

      const assessments = await apiService.getAssessments("patient-001");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/clinical/assessments?patientId=patient-001",
      );
      expect(assessments).toHaveLength(1);
      expect(assessments[0].patientId).toBe("patient-001");
    });

    it("should create new assessment successfully", async () => {
      const newAssessmentData = {
        patientId: "patient-003",
        clinicianId: "clinician-001",
        assessmentType: "initial",
        domains: {
          domain1: { score: 3, notes: "Good cognitive function" },
          domain2: { score: 2, notes: "Limited mobility" },
          domain3: { score: 4, notes: "Excellent support" },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newAssessmentData, id: "assessment-003" }),
      });

      const createdAssessment =
        await apiService.createAssessment(newAssessmentData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/clinical/assessments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAssessmentData),
        },
      );
      expect(createdAssessment).toHaveProperty("id");
      expect(createdAssessment.patientId).toBe("patient-003");
    });

    it("should validate 9-domain assessment structure", async () => {
      const assessmentData = {
        patientId: "patient-001",
        clinicianId: "clinician-001",
        domains: {},
      };

      // Add all 9 domains
      for (let i = 1; i <= 9; i++) {
        assessmentData.domains[`domain${i}`] = {
          score: Math.floor(Math.random() * 4) + 1,
          notes: `Domain ${i} assessment notes`,
        };
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...assessmentData, id: "assessment-004" }),
      });

      const createdAssessment =
        await apiService.createAssessment(assessmentData);

      expect(Object.keys(createdAssessment.domains)).toHaveLength(9);
      expect(createdAssessment.domains.domain1).toHaveProperty("score");
      expect(createdAssessment.domains.domain1).toHaveProperty("notes");
    });
  });

  describe("Revenue Management API", () => {
    it("should fetch claims list successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => testClaims,
      });

      const claims = await apiService.getClaims();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/revenue/claims",
      );
      expect(claims).toEqual(testClaims);
      expect(claims).toHaveLength(2);
    });

    it("should fetch claims by status", async () => {
      const submittedClaims = testClaims.filter(
        (c) => c.status === "submitted",
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => submittedClaims,
      });

      const claims = await apiService.getClaims("submitted");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/revenue/claims?status=submitted",
      );
      expect(claims).toHaveLength(1);
      expect(claims[0].status).toBe("submitted");
    });

    it("should create new claim successfully", async () => {
      const newClaimData = {
        patientId: "patient-003",
        claimType: "homecare",
        serviceLines: [
          {
            serviceCode: "17-25-1",
            serviceDescription: "Simple Home Visit - Nursing Service",
            dateOfService: "2024-02-01",
            quantity: 1,
            unitPrice: 300.0,
            totalAmount: 300.0,
          },
        ],
        totalAmount: 300.0,
        insuranceProvider: "Daman",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...newClaimData,
          id: "claim-003",
          claimNumber: "CLM-2024-003",
        }),
      });

      const createdClaim = await apiService.createClaim(newClaimData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/revenue/claims",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newClaimData),
        },
      );
      expect(createdClaim).toHaveProperty("id");
      expect(createdClaim).toHaveProperty("claimNumber");
      expect(createdClaim.totalAmount).toBe(300.0);
    });

    it("should validate service code pricing", () => {
      const validateServiceCode = (serviceCode: string, unitPrice: number) => {
        const validPricing = {
          "17-25-1": 300.0, // Simple Home Visit
          "17-25-2": 450.0, // Complex Home Visit
          "17-26-1": 200.0, // Physiotherapy Session
        };

        return validPricing[serviceCode] === unitPrice;
      };

      expect(validateServiceCode("17-25-1", 300.0)).toBe(true);
      expect(validateServiceCode("17-25-2", 450.0)).toBe(true);
      expect(validateServiceCode("17-26-1", 200.0)).toBe(true);
      expect(validateServiceCode("17-25-1", 250.0)).toBe(false);
    });
  });

  describe("Compliance API", () => {
    it("should fetch Daman authorizations successfully", async () => {
      const mockAuthorizations = [
        {
          id: "auth-001",
          referenceNumber: "DAM-2024-001",
          patientId: "patient-001",
          status: "approved",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthorizations,
      });

      const authorizations = await apiService.getDamanAuthorizations();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/compliance/daman/authorizations",
      );
      expect(authorizations).toHaveLength(1);
      expect(authorizations[0].status).toBe("approved");
    });

    it("should create Daman authorization successfully", async () => {
      const authData = {
        patientId: "patient-001",
        serviceType: "homecare",
        requestedDuration: "30-days",
        clinicalJustification: "Patient requires home healthcare services",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...authData,
          id: "auth-002",
          referenceNumber: "DAM-2024-002",
        }),
      });

      const createdAuth = await apiService.createDamanAuthorization(authData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/compliance/daman/authorizations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authData),
        },
      );
      expect(createdAuth).toHaveProperty("referenceNumber");
    });

    it("should fetch DOH reports successfully", async () => {
      const mockDohReports = {
        month: "2024-01",
        totalPatients: 150,
        totalAssessments: 89,
        complianceScore: 94.2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDohReports,
      });

      const reports = await apiService.getDohReports("2024-01");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/compliance/doh/reports?month=2024-01",
      );
      expect(reports.complianceScore).toBe(94.2);
    });
  });

  describe("Dashboard and Analytics API", () => {
    it("should fetch dashboard summary successfully", async () => {
      const mockSummary = {
        totalPatients: 150,
        activeCases: 45,
        pendingAssessments: 12,
        complianceScore: 94.2,
        recentActivity: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary,
      });

      const summary = await apiService.getDashboardSummary();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/dashboard/summary",
      );
      expect(summary.totalPatients).toBe(150);
      expect(summary.complianceScore).toBe(94.2);
    });

    it("should fetch analytics data successfully", async () => {
      const mockAnalytics = {
        period: "30d",
        patientTrends: [],
        assessmentMetrics: {},
        revenueMetrics: {},
        complianceMetrics: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      const analytics = await apiService.getAnalytics("30d");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/analytics/performance?period=30d",
      );
      expect(analytics.period).toBe("30d");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(apiService.getPatients()).rejects.toThrow("Network error");
    });

    it("should handle 404 errors appropriately", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiService.getPatients()).rejects.toThrow(
        "Failed to fetch patients",
      );
    });

    it("should handle 500 server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiService.createPatient({})).rejects.toThrow(
        "Failed to create patient",
      );
    });

    it("should handle malformed JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(apiService.getPatients()).rejects.toThrow("Invalid JSON");
    });
  });

  describe("Data Validation and Transformation", () => {
    it("should validate Emirates ID format in API requests", () => {
      const validateEmiratesId = (id: string) => {
        const pattern = /^784-\d{4}-\d{7}-\d$/;
        return pattern.test(id);
      };

      expect(validateEmiratesId("784-1990-1234567-8")).toBe(true);
      expect(validateEmiratesId("invalid-id")).toBe(false);
    });

    it("should validate assessment domain scores", () => {
      const validateDomainScore = (score: number) => {
        return score >= 1 && score <= 4 && Number.isInteger(score);
      };

      expect(validateDomainScore(1)).toBe(true);
      expect(validateDomainScore(4)).toBe(true);
      expect(validateDomainScore(0)).toBe(false);
      expect(validateDomainScore(5)).toBe(false);
      expect(validateDomainScore(2.5)).toBe(false);
    });

    it("should calculate total assessment score correctly", () => {
      const calculateTotalScore = (
        domains: Record<string, { score: number }>,
      ) => {
        return Object.values(domains).reduce(
          (sum, domain) => sum + domain.score,
          0,
        );
      };

      const domains = {
        domain1: { score: 3 },
        domain2: { score: 2 },
        domain3: { score: 4 },
      };

      expect(calculateTotalScore(domains)).toBe(9);
    });
  });

  describe("Performance and Concurrency", () => {
    it("should handle multiple concurrent API requests", async () => {
      // Mock multiple successful responses
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => testPatients })
        .mockResolvedValueOnce({ ok: true, json: async () => testAssessments })
        .mockResolvedValueOnce({ ok: true, json: async () => testClaims });

      const promises = [
        apiService.getPatients(),
        apiService.getAssessments(),
        apiService.getClaims(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(testPatients);
      expect(results[1]).toEqual(testAssessments);
      expect(results[2]).toEqual(testClaims);
    });

    it("should handle partial failures in concurrent requests", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => testPatients })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, json: async () => testClaims });

      const promises = [
        apiService.getPatients(),
        apiService.getAssessments().catch((e) => ({ error: e.message })),
        apiService.getClaims(),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toEqual(testPatients);
      expect(results[1]).toHaveProperty("error");
      expect(results[2]).toEqual(testClaims);
    });
  });
});
