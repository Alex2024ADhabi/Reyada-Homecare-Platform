import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import axios, { AxiosInstance } from "axios";

/**
 * Comprehensive API Testing Suite
 * Tests all healthcare platform API endpoints
 * Ensures API reliability, security, and compliance
 */

interface TestContext {
  apiClient: AxiosInstance;
  authToken: string;
  testPatientId: string;
  testAssessmentId: string;
}

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api";

describe("Healthcare Platform API Tests", () => {
  let context: TestContext;

  beforeAll(async () => {
    // Initialize API client
    const apiClient = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    context = {
      apiClient,
      authToken: "",
      testPatientId: "",
      testAssessmentId: "",
    };

    // Authenticate for tests
    try {
      const authResponse = await apiClient.post("/auth/login", {
        email: "test@reyada.com",
        password: "testpassword123",
      });

      context.authToken = authResponse.data.token;

      // Set default authorization header
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${context.authToken}`;
    } catch (error) {
      console.warn("Authentication failed, some tests may be skipped");
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (context.testPatientId) {
      try {
        await context.apiClient.delete(`/patients/${context.testPatientId}`);
      } catch (error) {
        console.warn("Failed to cleanup test patient");
      }
    }
  });

  describe("Authentication API", () => {
    it("should authenticate with valid credentials", async () => {
      const response = await context.apiClient.post("/auth/login", {
        email: "test@reyada.com",
        password: "testpassword123",
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");
      expect(response.data.user).toHaveProperty("email");
    });

    it("should reject invalid credentials", async () => {
      try {
        await context.apiClient.post("/auth/login", {
          email: "invalid@example.com",
          password: "wrongpassword",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should validate token expiration", async () => {
      // Test with expired token
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      try {
        await axios.get(`${BASE_URL}/patients`, {
          headers: { Authorization: `Bearer ${expiredToken}` },
        });
        expect.fail("Should have rejected expired token");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should handle logout properly", async () => {
      const response = await context.apiClient.post("/auth/logout");
      expect(response.status).toBe(200);
    });
  });

  describe("Patient Management API", () => {
    it("should create a new patient", async () => {
      const patientData = {
        name: "Test Patient API",
        emiratesId: "784-1990-1234567-8",
        phone: "+971501234567",
        email: "testpatient@example.com",
        address: {
          street: "123 Test Street",
          city: "Dubai",
          emirate: "Dubai",
          country: "UAE",
        },
        insurance: {
          provider: "DAMAN",
          policyNumber: "DAM123456789",
          expiryDate: "2025-12-31",
        },
      };

      const response = await context.apiClient.post("/patients", patientData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data.name).toBe(patientData.name);
      expect(response.data.emiratesId).toBe(patientData.emiratesId);

      context.testPatientId = response.data.id;
    });

    it("should validate Emirates ID format", async () => {
      const invalidPatientData = {
        name: "Invalid Patient",
        emiratesId: "invalid-id",
        phone: "+971501234567",
        email: "invalid@example.com",
      };

      try {
        await context.apiClient.post("/patients", invalidPatientData);
        expect.fail("Should have rejected invalid Emirates ID");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain(
          "Invalid Emirates ID format",
        );
      }
    });

    it("should retrieve patient by ID", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const response = await context.apiClient.get(
        `/patients/${context.testPatientId}`,
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(context.testPatientId);
      expect(response.data).toHaveProperty("name");
      expect(response.data).toHaveProperty("emiratesId");
    });

    it("should search patients by name", async () => {
      const response = await context.apiClient.get("/patients/search?q=Test");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.results)).toBe(true);
      expect(response.data).toHaveProperty("pagination");
    });

    it("should update patient information", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const updateData = {
        phone: "+971509876543",
        email: "updated@example.com",
      };

      const response = await context.apiClient.patch(
        `/patients/${context.testPatientId}`,
        updateData,
      );

      expect(response.status).toBe(200);
      expect(response.data.phone).toBe(updateData.phone);
      expect(response.data.email).toBe(updateData.email);
    });

    it("should handle patient not found", async () => {
      try {
        await context.apiClient.get("/patients/nonexistent-id");
        expect.fail("Should have returned 404");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe("Clinical Documentation API", () => {
    it("should create clinical assessment", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const assessmentData = {
        patientId: context.testPatientId,
        assessmentType: "initial-assessment",
        assessmentDate: new Date().toISOString(),
        clinicianId: "test-clinician-id",
        domains: {
          domain1: { score: 4, notes: "Good mobility" },
          domain2: { score: 3, notes: "Moderate cognitive function" },
          domain3: { score: 5, notes: "Excellent communication" },
          domain4: { score: 2, notes: "Needs assistance with ADLs" },
          domain5: { score: 4, notes: "Good medication compliance" },
          domain6: { score: 3, notes: "Moderate pain management" },
          domain7: { score: 5, notes: "Strong family support" },
          domain8: { score: 4, notes: "Safe home environment" },
          domain9: { score: 3, notes: "Regular follow-up needed" },
        },
        clinicalNotes: "Comprehensive initial assessment completed",
        signature: {
          clinicianName: "Dr. Test Clinician",
          timestamp: new Date().toISOString(),
          digitalSignature: "base64-encoded-signature",
        },
      };

      const response = await context.apiClient.post(
        "/clinical/assessments",
        assessmentData,
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data.patientId).toBe(context.testPatientId);
      expect(response.data.domains).toHaveProperty("domain1");
      expect(response.data.complianceStatus).toBe("DOH_COMPLIANT");

      context.testAssessmentId = response.data.id;
    });

    it("should validate 9-domain assessment completeness", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const incompleteAssessment = {
        patientId: context.testPatientId,
        assessmentType: "initial-assessment",
        domains: {
          domain1: { score: 4, notes: "Good mobility" },
          // Missing domains 2-9
        },
      };

      try {
        await context.apiClient.post(
          "/clinical/assessments",
          incompleteAssessment,
        );
        expect.fail("Should have rejected incomplete assessment");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain(
          "All 9 domains must be assessed",
        );
      }
    });

    it("should retrieve assessments for patient", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const response = await context.apiClient.get(
        `/clinical/assessments?patientId=${context.testPatientId}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.assessments)).toBe(true);
      expect(response.data.assessments.length).toBeGreaterThan(0);
    });

    it("should validate digital signature", async () => {
      if (!context.testAssessmentId) {
        expect.skip();
        return;
      }

      const response = await context.apiClient.get(
        `/clinical/assessments/${context.testAssessmentId}/signature/validate`,
      );

      expect(response.status).toBe(200);
      expect(response.data.isValid).toBe(true);
      expect(response.data).toHaveProperty("signatureDetails");
    });
  });

  describe("Revenue Management API", () => {
    it("should create DAMAN authorization request", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const authorizationData = {
        patientId: context.testPatientId,
        serviceType: "nursing-care",
        requestedDuration: "30-days",
        clinicalJustification:
          "Patient requires skilled nursing care for wound management",
        requestedServices: [
          {
            serviceCode: "NURSE-001",
            description: "Skilled Nursing Visit",
            frequency: "daily",
            duration: "30-days",
          },
        ],
        documents: [
          {
            type: "medical-report",
            filename: "medical-report.pdf",
            base64Content: "base64-encoded-pdf",
          },
        ],
      };

      const response = await context.apiClient.post(
        "/revenue/daman/authorizations",
        authorizationData,
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("referenceNumber");
      expect(response.data.referenceNumber).toMatch(/DAM-\d{4}-\d{3}/);
      expect(response.data.status).toBe("submitted");
    });

    it("should validate DOH 2025 compliance rules", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      // Test MSC plan extension limit (should not exceed 90 days)
      const invalidMSCRequest = {
        patientId: context.testPatientId,
        serviceType: "msc-plan-extension",
        requestedDuration: "120-days", // Exceeds 90-day limit
        clinicalJustification: "Extended care needed",
      };

      try {
        await context.apiClient.post(
          "/revenue/daman/authorizations",
          invalidMSCRequest,
        );
        expect.fail("Should have rejected MSC request exceeding 90 days");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain(
          "MSC duration cannot exceed 90 days",
        );
      }
    });

    it("should create and submit claims", async () => {
      if (!context.testPatientId) {
        expect.skip();
        return;
      }

      const claimData = {
        patientId: context.testPatientId,
        claimType: "homecare",
        serviceLines: [
          {
            serviceCode: "NURSE-001",
            serviceDescription: "Skilled Nursing Care",
            dateOfService: new Date().toISOString().split("T")[0],
            quantity: 1,
            unitPrice: 150.0,
            totalAmount: 150.0,
          },
        ],
        billingPeriod: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
        totalAmount: 150.0,
      };

      const response = await context.apiClient.post(
        "/revenue/claims",
        claimData,
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("claimNumber");
      expect(response.data.claimNumber).toMatch(/CLM-\d{4}-\d{3}/);
      expect(response.data.status).toBe("submitted");
    });

    it("should validate service code pricing", async () => {
      const invalidClaimData = {
        patientId: context.testPatientId,
        claimType: "homecare",
        serviceLines: [
          {
            serviceCode: "NURSE-001",
            serviceDescription: "Skilled Nursing Care",
            dateOfService: new Date().toISOString().split("T")[0],
            quantity: 1,
            unitPrice: 999.0, // Invalid price for this service code
            totalAmount: 999.0,
          },
        ],
      };

      try {
        await context.apiClient.post("/revenue/claims", invalidClaimData);
        expect.fail("Should have rejected invalid pricing");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain(
          "Invalid pricing for service code NURSE-001",
        );
      }
    });
  });

  describe("Compliance API", () => {
    it("should generate DOH compliance report", async () => {
      const response = await context.apiClient.get(
        "/compliance/doh/reports?month=2024-01",
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("reportId");
      expect(response.data).toHaveProperty("complianceScore");
      expect(response.data.complianceScore).toBeGreaterThanOrEqual(0);
      expect(response.data.complianceScore).toBeLessThanOrEqual(100);
    });

    it("should validate JAWDA KPI metrics", async () => {
      const response = await context.apiClient.get("/compliance/jawda/kpis");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("kpis");
      expect(Array.isArray(response.data.kpis)).toBe(true);

      // Validate required JAWDA KPIs
      const requiredKPIs = [
        "patient-satisfaction",
        "clinical-outcomes",
        "safety-incidents",
        "staff-competency",
        "documentation-quality",
      ];

      const kpiNames = response.data.kpis.map((kpi: any) => kpi.name);
      requiredKPIs.forEach((requiredKPI) => {
        expect(kpiNames).toContain(requiredKPI);
      });
    });

    it("should track audit trail", async () => {
      const response = await context.apiClient.get(
        "/compliance/audit-trail?limit=10",
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.entries)).toBe(true);

      if (response.data.entries.length > 0) {
        const entry = response.data.entries[0];
        expect(entry).toHaveProperty("timestamp");
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("action");
        expect(entry).toHaveProperty("resourceType");
        expect(entry).toHaveProperty("resourceId");
      }
    });
  });

  describe("API Performance and Reliability", () => {
    it("should handle concurrent requests", async () => {
      const concurrentRequests = Array(10)
        .fill(null)
        .map(() => context.apiClient.get("/patients"));

      const responses = await Promise.all(concurrentRequests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it("should implement rate limiting", async () => {
      const rapidRequests = [];

      // Make 20 rapid requests
      for (let i = 0; i < 20; i++) {
        rapidRequests.push(
          context.apiClient.get("/patients").catch((error) => error.response),
        );
      }

      const responses = await Promise.all(rapidRequests);

      // Should have some rate-limited responses (429)
      const rateLimitedResponses = responses.filter(
        (response) => response && response.status === 429,
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it("should validate response times", async () => {
      const startTime = Date.now();

      await context.apiClient.get("/patients");

      const responseTime = Date.now() - startTime;

      // API should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it("should handle malformed requests gracefully", async () => {
      try {
        await context.apiClient.post("/patients", {
          invalidField: "invalid data",
          anotherInvalidField: 12345,
        });
        expect.fail("Should have rejected malformed request");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty("errors");
      }
    });
  });

  describe("API Security", () => {
    it("should require authentication for protected endpoints", async () => {
      const unauthenticatedClient = axios.create({
        baseURL: BASE_URL,
        timeout: 5000,
      });

      const protectedEndpoints = [
        "/patients",
        "/clinical/assessments",
        "/revenue/claims",
        "/compliance/doh/reports",
      ];

      for (const endpoint of protectedEndpoints) {
        try {
          await unauthenticatedClient.get(endpoint);
          expect.fail(`Endpoint ${endpoint} should require authentication`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      }
    });

    it("should sanitize input data", async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        emiratesId: "784-1990-1234567-8",
        phone: "+971501234567",
        email: "test@example.com",
      };

      try {
        const response = await context.apiClient.post(
          "/patients",
          maliciousData,
        );

        // Should either reject the request or sanitize the input
        if (response.status === 201) {
          expect(response.data.name).not.toContain("<script>");
        }
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should not expose sensitive information in error messages", async () => {
      try {
        await context.apiClient.get(
          "/patients/sql-injection-test'; DROP TABLE patients; --",
        );
      } catch (error: any) {
        const errorMessage =
          error.response.data.message || error.response.data.error;

        // Should not expose database details
        expect(errorMessage).not.toContain("database");
        expect(errorMessage).not.toContain("table");
        expect(errorMessage).not.toContain("SQL");
        expect(errorMessage).not.toContain("query");
      }
    });
  });
});
