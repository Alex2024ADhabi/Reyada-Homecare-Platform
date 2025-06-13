/**
 * Government Reporting Service
 * Handles automated reporting to DOH and other UAE government agencies
 */

import { AuditLogger } from "./security.service";
import { DOH_API_CONFIG } from "@/config/api.config";

export interface DOHReport {
  reportId: string;
  reportType: "monthly" | "quarterly" | "annual" | "incident" | "quality";
  facilityId: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  data: any;
  submissionDate?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  dohReference?: string;
}

export interface IncidentReport {
  incidentId: string;
  facilityId: string;
  incidentDate: string;
  incidentType:
    | "medication_error"
    | "fall"
    | "infection"
    | "equipment_failure"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  patientsAffected: number;
  immediateActions: string;
  rootCause?: string;
  preventiveMeasures: string;
  reportedBy: string;
  reportingDate: string;
}

export interface QualityMetricsReport {
  reportId: string;
  facilityId: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    patientSatisfactionScore: number;
    clinicalOutcomes: {
      [metric: string]: number;
    };
    safetyIncidents: number;
    staffTurnoverRate: number;
    complianceScore: number;
  };
  jawdaKPIs: {
    [kpi: string]: {
      target: number;
      actual: number;
      variance: number;
    };
  };
}

class GovernmentReportingService {
  private readonly dohApiUrl: string;
  private readonly dohApiKey: string;
  private readonly facilityLicense: string;

  constructor() {
    this.dohApiUrl = DOH_API_CONFIG.baseUrl;
    this.dohApiKey = process.env.DOH_API_KEY || "";
    this.facilityLicense = process.env.FACILITY_LICENSE_NUMBER || "";
  }

  async submitMonthlyReport(reportData: any): Promise<DOHReport> {
    try {
      const report: DOHReport = {
        reportId: this.generateReportId("monthly"),
        reportType: "monthly",
        facilityId: this.facilityLicense,
        reportingPeriod: {
          startDate: reportData.startDate,
          endDate: reportData.endDate,
        },
        data: await this.compileMonthlyData(reportData),
        status: "draft",
      };

      this.validateReportData(report);

      const response = await fetch(`${this.dohApiUrl}/reports/monthly`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.dohApiKey}`,
          "Content-Type": "application/json",
          "X-Facility-License": this.facilityLicense,
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`DOH report submission failed: ${response.statusText}`);
      }

      const submittedReport = await response.json();
      report.submissionDate = new Date().toISOString();
      report.status = "submitted";
      report.dohReference = submittedReport.referenceNumber;

      AuditLogger.logSecurityEvent({
        type: "government_report_submitted",
        details: {
          reportId: report.reportId,
          reportType: report.reportType,
          dohReference: report.dohReference,
          facilityId: this.facilityLicense,
        },
        severity: "low",
        complianceImpact: true,
      });

      return report;
    } catch (error) {
      console.error("Monthly report submission error:", error);
      throw error;
    }
  }

  async submitIncidentReport(incidentData: IncidentReport): Promise<DOHReport> {
    try {
      this.validateIncidentData(incidentData);

      const report: DOHReport = {
        reportId: this.generateReportId("incident"),
        reportType: "incident",
        facilityId: this.facilityLicense,
        reportingPeriod: {
          startDate: incidentData.incidentDate,
          endDate: incidentData.incidentDate,
        },
        data: incidentData,
        status: "draft",
      };

      const response = await fetch(`${this.dohApiUrl}/reports/incidents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.dohApiKey}`,
          "Content-Type": "application/json",
          "X-Facility-License": this.facilityLicense,
          "X-Incident-Severity": incidentData.severity,
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(
          `Incident report submission failed: ${response.statusText}`,
        );
      }

      const submittedReport = await response.json();
      report.submissionDate = new Date().toISOString();
      report.status = "submitted";
      report.dohReference = submittedReport.referenceNumber;

      AuditLogger.logSecurityEvent({
        type: "incident_report_submitted",
        details: {
          incidentId: incidentData.incidentId,
          severity: incidentData.severity,
          dohReference: report.dohReference,
          reportingDelay: this.calculateReportingDelay(
            incidentData.incidentDate,
          ),
        },
        severity: incidentData.severity === "critical" ? "high" : "medium",
        complianceImpact: true,
      });

      return report;
    } catch (error) {
      console.error("Incident report submission error:", error);
      throw error;
    }
  }

  async getReportStatus(dohReference: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.dohApiUrl}/reports/status/${dohReference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.dohApiKey}`,
            "X-Facility-License": this.facilityLicense,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get report status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting report status:", error);
      throw error;
    }
  }

  private generateReportId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type.toUpperCase()}-${timestamp}-${random}`;
  }

  private validateReportData(report: DOHReport): void {
    if (!report.facilityId) {
      throw new Error("Facility ID is required");
    }
    if (!report.reportingPeriod.startDate || !report.reportingPeriod.endDate) {
      throw new Error("Reporting period is required");
    }
    if (!report.data) {
      throw new Error("Report data is required");
    }
  }

  private validateIncidentData(incident: IncidentReport): void {
    const requiredFields = [
      "incidentId",
      "facilityId",
      "incidentDate",
      "incidentType",
      "severity",
      "description",
      "immediateActions",
      "reportedBy",
    ];

    for (const field of requiredFields) {
      if (!incident[field as keyof IncidentReport]) {
        throw new Error(`${field} is required for incident report`);
      }
    }
  }

  private async compileMonthlyData(reportData: any): Promise<any> {
    return {
      patientStatistics: {
        totalPatients: reportData.totalPatients || 0,
        newAdmissions: reportData.newAdmissions || 0,
        discharges: reportData.discharges || 0,
        averageLengthOfStay: reportData.averageLengthOfStay || 0,
      },
      serviceStatistics: {
        totalVisits: reportData.totalVisits || 0,
        nursingVisits: reportData.nursingVisits || 0,
        therapyVisits: reportData.therapyVisits || 0,
        consultationVisits: reportData.consultationVisits || 0,
      },
      qualityMetrics: {
        patientSatisfactionScore: reportData.patientSatisfactionScore || 0,
        clinicalOutcomes: reportData.clinicalOutcomes || {},
        safetyIncidents: reportData.safetyIncidents || 0,
        complianceScore: reportData.complianceScore || 0,
      },
    };
  }

  private calculateReportingDelay(incidentDate: string): number {
    const incident = new Date(incidentDate);
    const now = new Date();
    return Math.floor((now.getTime() - incident.getTime()) / (1000 * 60 * 60));
  }
}

export const governmentReportingService = new GovernmentReportingService();
export default GovernmentReportingService;
