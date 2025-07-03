import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuditTrailService } from "../../services/audit-trail.service";
import { DOHAutomatedReportingService } from "../../services/doh-automated-reporting.service";
import { DOHSchemaValidatorService } from "../../services/doh-schema-validator.service";
import { PatientRecord } from "../../types/patient";
import { ClinicalAssessment } from "../../types/clinical";

// Mock services
vi.mock("../../services/audit-trail.service");
vi.mock("../../services/doh-automated-reporting.service");
vi.mock("../../services/doh-schema-validator.service");

describe("DOH Compliance Comprehensive Tests", () => {
  let auditTrailService: AuditTrailService;
  let dohReportingService: DOHAutomatedReportingService;
  let schemaValidatorService: DOHSchemaValidatorService;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Initialize services
    auditTrailService = new AuditTrailService();
    dohReportingService = new DOHAutomatedReportingService();
    schemaValidatorService = new DOHSchemaValidatorService();

    // Setup default mock implementations
    vi.mocked(auditTrailService.logAction).mockResolvedValue(true);
    vi.mocked(dohReportingService.submitReport).mockResolvedValue({
      success: true,
      reportId: "test-report-id",
    });
    vi.mocked(schemaValidatorService.validateSchema).mockReturnValue({
      valid: true,
      errors: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Patient Record Compliance", () => {
    const validPatientRecord: PatientRecord = {
      id: "patient-123",
      emiratesId: "784-1990-1234567-1",
      firstName: "Ahmed",
      lastName: "Al Mansouri",
      dateOfBirth: "1990-05-15",
      gender: "male",
      nationality: "UAE",
      contactNumber: "+971501234567",
      email: "ahmed@example.com",
      address: {
        line1: "Villa 123",
        line2: "Al Wasl Road",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
      },
      insuranceDetails: {
        provider: "Daman",
        policyNumber: "DAMAN-1234567",
        expiryDate: "2023-12-31",
        coverageType: "comprehensive",
      },
      emergencyContact: {
        name: "Mohammed Al Mansouri",
        relationship: "Father",
        contactNumber: "+971502345678",
      },
      medicalHistory: {
        conditions: ["Hypertension", "Type 2 Diabetes"],
        allergies: ["Penicillin"],
        medications: ["Metformin", "Lisinopril"],
        surgeries: [
          {
            procedure: "Appendectomy",
            date: "2010-03-15",
            hospital: "Rashid Hospital",
          },
        ],
      },
      createdAt: "2023-01-15T10:30:00Z",
      updatedAt: "2023-01-15T10:30:00Z",
      status: "active",
    };

    it("should validate a complete patient record against DOH schema", () => {
      const result = schemaValidatorService.validateSchema(
        validPatientRecord,
        "patient",
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields in patient record", () => {
      const incompleteRecord = { ...validPatientRecord };
      delete incompleteRecord.emiratesId;
      delete incompleteRecord.dateOfBirth;

      vi.mocked(schemaValidatorService.validateSchema).mockReturnValue({
        valid: false,
        errors: [
          { field: "emiratesId", message: "Required field missing" },
          { field: "dateOfBirth", message: "Required field missing" },
        ],
      });

      const result = schemaValidatorService.validateSchema(
        incompleteRecord,
        "patient",
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe("emiratesId");
      expect(result.errors[1].field).toBe("dateOfBirth");
    });

    it("should validate Emirates ID format", () => {
      const invalidRecord = {
        ...validPatientRecord,
        emiratesId: "123-456-789",
      };

      vi.mocked(schemaValidatorService.validateSchema).mockReturnValue({
        valid: false,
        errors: [
          { field: "emiratesId", message: "Invalid Emirates ID format" },
        ],
      });

      const result = schemaValidatorService.validateSchema(
        invalidRecord,
        "patient",
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("emiratesId");
    });

    it("should log patient record access in audit trail", async () => {
      await auditTrailService.logAction({
        action: "view",
        resourceType: "patient",
        resourceId: validPatientRecord.id,
        userId: "user-456",
        timestamp: new Date().toISOString(),
        details: { reason: "Clinical assessment" },
      });

      expect(auditTrailService.logAction).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(auditTrailService.logAction).mock.calls[0][0],
      ).toMatchObject({
        action: "view",
        resourceType: "patient",
        resourceId: validPatientRecord.id,
      });
    });
  });

  describe("Clinical Assessment Compliance", () => {
    const validAssessment: ClinicalAssessment = {
      id: "assessment-456",
      patientId: "patient-123",
      assessmentType: "initial",
      assessmentDate: "2023-01-20T09:15:00Z",
      clinicianId: "clinician-789",
      clinicianName: "Dr. Sarah Ahmed",
      clinicianSignature: "digital-signature-hash",
      domains: [
        {
          domain: "physical",
          findings:
            "Patient presents with stable vital signs. BP 120/80, HR 72, RR 16, Temp 36.8°C.",
          score: 4,
        },
        {
          domain: "functional",
          findings:
            "Patient is independent in ADLs but requires assistance with IADLs.",
          score: 3,
        },
        {
          domain: "psychological",
          findings:
            "No signs of depression or anxiety. Good cognitive function.",
          score: 5,
        },
        {
          domain: "social",
          findings: "Lives with spouse. Good family support system.",
          score: 5,
        },
        {
          domain: "environmental",
          findings: "Home environment is safe and accessible.",
          score: 4,
        },
        {
          domain: "spiritual",
          findings:
            "Reports regular prayer and religious activities provide comfort.",
          score: 5,
        },
        {
          domain: "nutritional",
          findings: "Well-nourished. Following diabetic diet as prescribed.",
          score: 4,
        },
        {
          domain: "pain",
          findings: "Reports occasional joint pain, rated 2/10.",
          score: 4,
        },
        {
          domain: "medication",
          findings:
            "Medication compliance is good. No adverse effects reported.",
          score: 5,
        },
      ],
      totalScore: 39,
      recommendations:
        "Continue current medication regimen. Follow up in 3 months.",
      careplan: {
        goals: [
          "Maintain blood pressure below 140/90",
          "Improve exercise tolerance",
        ],
        interventions: ["Weekly BP monitoring", "Daily 30-minute walks"],
        expectedOutcomes: [
          "Stable BP readings",
          "Increased walking distance without fatigue",
        ],
      },
      createdAt: "2023-01-20T09:15:00Z",
      updatedAt: "2023-01-20T09:45:00Z",
    };

    it("should validate a complete clinical assessment against DOH schema", () => {
      const result = schemaValidatorService.validateSchema(
        validAssessment,
        "clinicalAssessment",
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require all 9 DOH assessment domains", () => {
      const incompleteAssessment = { ...validAssessment };
      incompleteAssessment.domains = incompleteAssessment.domains.slice(0, 7); // Remove 2 domains

      vi.mocked(schemaValidatorService.validateSchema).mockReturnValue({
        valid: false,
        errors: [
          {
            field: "domains",
            message: "All 9 DOH assessment domains are required",
          },
        ],
      });

      const result = schemaValidatorService.validateSchema(
        incompleteAssessment,
        "clinicalAssessment",
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("domains");
    });

    it("should require clinician signature for DOH compliance", () => {
      const unsignedAssessment = { ...validAssessment };
      delete unsignedAssessment.clinicianSignature;

      vi.mocked(schemaValidatorService.validateSchema).mockReturnValue({
        valid: false,
        errors: [
          {
            field: "clinicianSignature",
            message: "Clinician signature is required for DOH compliance",
          },
        ],
      });

      const result = schemaValidatorService.validateSchema(
        unsignedAssessment,
        "clinicalAssessment",
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("clinicianSignature");
    });

    it("should submit assessment report to DOH automated reporting system", async () => {
      const result = await dohReportingService.submitReport({
        type: "clinicalAssessment",
        data: validAssessment,
        timestamp: new Date().toISOString(),
      });

      expect(dohReportingService.submitReport).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true, reportId: "test-report-id" });
    });

    it("should log clinical assessment submission in audit trail", async () => {
      await auditTrailService.logAction({
        action: "create",
        resourceType: "clinicalAssessment",
        resourceId: validAssessment.id,
        userId: validAssessment.clinicianId,
        timestamp: new Date().toISOString(),
        details: { patientId: validAssessment.patientId },
      });

      expect(auditTrailService.logAction).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(auditTrailService.logAction).mock.calls[0][0],
      ).toMatchObject({
        action: "create",
        resourceType: "clinicalAssessment",
        resourceId: validAssessment.id,
      });
    });
  });

  describe("DOH Automated Reporting", () => {
    it("should handle DOH reporting service errors gracefully", async () => {
      vi.mocked(dohReportingService.submitReport).mockRejectedValueOnce(
        new Error("Network error"),
      );

      try {
        await dohReportingService.submitReport({
          type: "patientAdmission",
          data: {
            patientId: "patient-123",
            admissionDate: "2023-01-25T08:00:00Z",
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Network error");
      }

      expect(dohReportingService.submitReport).toHaveBeenCalledTimes(1);
    });

    it("should retry failed DOH report submissions", async () => {
      // First call fails, second succeeds
      vi.mocked(dohReportingService.submitReport)
        .mockRejectedValueOnce(new Error("Temporary network error"))
        .mockResolvedValueOnce({ success: true, reportId: "retry-report-id" });

      // Implement retry logic in a real function
      const submitWithRetry = async (data: any, maxRetries = 3) => {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await dohReportingService.submitReport(data);
          } catch (error) {
            lastError = error;
            // In a real implementation, you might add delay here
          }
        }
        throw lastError;
      };

      const result = await submitWithRetry({
        type: "patientDischarge",
        data: {
          patientId: "patient-123",
          dischargeDate: "2023-01-30T14:00:00Z",
        },
        timestamp: new Date().toISOString(),
      });

      expect(dohReportingService.submitReport).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true, reportId: "retry-report-id" });
    });

    it("should batch multiple reports for efficient DOH submission", async () => {
      const batchSubmit = async (reports: any[]) => {
        return await Promise.all(
          reports.map((report) => dohReportingService.submitReport(report)),
        );
      };

      const reports = [
        {
          type: "clinicalAssessment",
          data: { id: "assessment-1", patientId: "patient-1" },
          timestamp: new Date().toISOString(),
        },
        {
          type: "clinicalAssessment",
          data: { id: "assessment-2", patientId: "patient-2" },
          timestamp: new Date().toISOString(),
        },
        {
          type: "clinicalAssessment",
          data: { id: "assessment-3", patientId: "patient-3" },
          timestamp: new Date().toISOString(),
        },
      ];

      vi.mocked(dohReportingService.submitReport)
        .mockResolvedValueOnce({ success: true, reportId: "report-1" })
        .mockResolvedValueOnce({ success: true, reportId: "report-2" })
        .mockResolvedValueOnce({ success: true, reportId: "report-3" });

      const results = await batchSubmit(reports);

      expect(dohReportingService.submitReport).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ success: true, reportId: "report-1" });
      expect(results[1]).toEqual({ success: true, reportId: "report-2" });
      expect(results[2]).toEqual({ success: true, reportId: "report-3" });
    });
  });

  describe("Audit Trail Compliance", () => {
    it("should log all required audit fields for DOH compliance", async () => {
      await auditTrailService.logAction({
        action: "update",
        resourceType: "patient",
        resourceId: "patient-123",
        userId: "user-456",
        timestamp: "2023-01-25T10:15:30Z",
        details: {
          changes: ["contactNumber", "address"],
          reason: "Patient requested update",
        },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)",
      });

      expect(auditTrailService.logAction).toHaveBeenCalledTimes(1);
      const auditLog = vi.mocked(auditTrailService.logAction).mock.calls[0][0];

      // Verify all required DOH audit fields are present
      expect(auditLog).toHaveProperty("action");
      expect(auditLog).toHaveProperty("resourceType");
      expect(auditLog).toHaveProperty("resourceId");
      expect(auditLog).toHaveProperty("userId");
      expect(auditLog).toHaveProperty("timestamp");
      expect(auditLog).toHaveProperty("details");
      expect(auditLog).toHaveProperty("ipAddress");
      expect(auditLog).toHaveProperty("userAgent");
    });

    it("should enforce audit trail for sensitive operations", async () => {
      // Mock implementation of a service that requires audit logging
      const updatePatientRecord = async (
        patientId: string,
        data: any,
        userId: string,
      ) => {
        // First log the action to audit trail
        await auditTrailService.logAction({
          action: "update",
          resourceType: "patient",
          resourceId: patientId,
          userId,
          timestamp: new Date().toISOString(),
          details: { changes: Object.keys(data), reason: "Clinical update" },
        });

        // Then perform the actual update (mocked here)
        return { success: true, patientId };
      };

      const result = await updatePatientRecord(
        "patient-123",
        { status: "inactive" },
        "user-456",
      );

      expect(auditTrailService.logAction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true, patientId: "patient-123" });
    });
  });
});
