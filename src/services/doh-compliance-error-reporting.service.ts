/**
 * DOH Compliance Error Reporting Service
 * Automated error reporting and compliance violation tracking for DOH standards
 */

import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { healthcareErrorPatternsService } from "./healthcare-error-patterns.service";
import { patientSafetyErrorEscalationService } from "./patient-safety-error-escalation.service";
import { smsEmailNotificationService } from "./sms-email-notification.service";
import websocketService from "./websocket.service";

interface DOHComplianceError {
  id: string;
  timestamp: Date;
  errorType:
    | "documentation"
    | "patient_safety"
    | "quality"
    | "regulatory"
    | "data_integrity"
    | "workflow";
  severity: "low" | "medium" | "high" | "critical";
  complianceStandard:
    | "DOH_NINE_DOMAINS"
    | "JAWDA"
    | "ADHICS"
    | "TAWTEEN"
    | "PATIENT_SAFETY";
  domain?:
    | "patient_safety"
    | "quality_management"
    | "infection_control"
    | "medication_management"
    | "clinical_governance"
    | "risk_management"
    | "patient_rights"
    | "information_management"
    | "facility_management";
  description: string;
  affectedPatients?: string[];
  affectedStaff?: string[];
  facilityId: string;
  departmentId?: string;
  sourceSystem: string;
  errorCode: string;
  stackTrace?: string;
  contextData: Record<string, any>;
  patientSafetyImpact: boolean;
  complianceViolation: boolean;
  reportingRequired: boolean;
  escalationLevel: "none" | "supervisor" | "management" | "doh" | "emergency";
  status: "detected" | "reported" | "investigating" | "resolved" | "escalated";
  resolutionRequired: boolean;
  dueDate?: Date;
  assignedTo?: string;
  tags: string[];
}

interface DOHReportingRule {
  id: string;
  name: string;
  description: string;
  errorPattern: RegExp | string;
  complianceStandard: string;
  domain?: string;
  severity: "low" | "medium" | "high" | "critical";
  reportingThreshold: number;
  timeWindow: number; // minutes
  autoReport: boolean;
  escalationRequired: boolean;
  notificationRecipients: string[];
  reportTemplate: string;
  patientSafetyFlag: boolean;
  enabled: boolean;
}

interface ComplianceReport {
  id: string;
  timestamp: Date;
  reportType: "incident" | "violation" | "trend" | "summary" | "emergency";
  complianceStandard: string;
  domain?: string;
  errors: DOHComplianceError[];
  summary: {
    totalErrors: number;
    criticalErrors: number;
    patientSafetyImpacts: number;
    complianceViolations: number;
    affectedPatients: number;
    affectedDepartments: string[];
  };
  recommendations: string[];
  actionItems: {
    id: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    assignedTo?: string;
    dueDate?: Date;
    status: "pending" | "in_progress" | "completed";
  }[];
  reportedToDOH: boolean;
  reportedAt?: Date;
  reportingOfficer?: string;
  followUpRequired: boolean;
  nextReviewDate?: Date;
}

interface DOHReportingMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByStandard: Record<string, number>;
  errorsByDomain: Record<string, number>;
  patientSafetyErrors: number;
  complianceViolations: number;
  reportsGenerated: number;
  reportsToDOH: number;
  averageResolutionTime: number;
  escalationRate: number;
  trendsAnalysis: {
    errorTrend: "increasing" | "stable" | "decreasing";
    severityTrend: "improving" | "stable" | "worsening";
    complianceTrend: "improving" | "stable" | "declining";
  };
}

class DOHComplianceErrorReportingService {
  private complianceErrors: Map<string, DOHComplianceError> = new Map();
  private reportingRules: Map<string, DOHReportingRule> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();
  private metrics: DOHReportingMetrics;
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private reportingInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private readonly ERROR_RETENTION_DAYS = 365; // Keep errors for 1 year
  private readonly REPORT_RETENTION_DAYS = 2555; // Keep reports for 7 years (DOH requirement)

  constructor() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByStandard: {},
      errorsByDomain: {},
      patientSafetyErrors: 0,
      complianceViolations: 0,
      reportsGenerated: 0,
      reportsToDOH: 0,
      averageResolutionTime: 0,
      escalationRate: 0,
      trendsAnalysis: {
        errorTrend: "stable",
        severityTrend: "stable",
        complianceTrend: "stable",
      },
    };
  }

  /**
   * Initialize DOH compliance error reporting service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("📋 Initializing DOH Compliance Error Reporting Service...");

      // Initialize DOH reporting rules
      await this.initializeDOHReportingRules();
      await this.initializeComplianceStandards();
      await this.initializeErrorPatterns();

      // Set up error monitoring
      this.setupErrorMonitoring();
      this.setupAutomaticReporting();
      this.setupTrendAnalysis();

      // Integrate with existing services
      this.integrateWithErrorHandler();
      this.integrateWithPatientSafety();
      this.integrateWithNotifications();

      this.isInitialized = true;
      console.log(
        `✅ DOH Compliance Error Reporting Service initialized with ${this.reportingRules.size} reporting rules`,
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize DOH Compliance Error Reporting Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "DOHComplianceErrorReportingService.initialize",
      });
      throw error;
    }
  }

  private async initializeDOHReportingRules(): Promise<void> {
    const rules: DOHReportingRule[] = [
      {
        id: "patient_safety_incident",
        name: "Patient Safety Incident Reporting",
        description: "Automatic reporting of patient safety incidents to DOH",
        errorPattern: /patient.*(safety|incident|harm|injury|adverse)/i,
        complianceStandard: "DOH_NINE_DOMAINS",
        domain: "patient_safety",
        severity: "critical",
        reportingThreshold: 1, // Report immediately
        timeWindow: 0, // No time window - immediate
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "patient.safety@facility.com",
          "doh.compliance@facility.com",
          "medical.director@facility.com",
        ],
        reportTemplate: "patient_safety_incident_report",
        patientSafetyFlag: true,
        enabled: true,
      },
      {
        id: "medication_error_reporting",
        name: "Medication Error Reporting",
        description: "Automatic reporting of medication errors and near misses",
        errorPattern: /medication.*(error|wrong|incorrect|missed|overdose)/i,
        complianceStandard: "DOH_NINE_DOMAINS",
        domain: "medication_management",
        severity: "high",
        reportingThreshold: 1,
        timeWindow: 15, // 15 minutes
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "pharmacy@facility.com",
          "patient.safety@facility.com",
          "nursing.supervisor@facility.com",
        ],
        reportTemplate: "medication_error_report",
        patientSafetyFlag: true,
        enabled: true,
      },
      {
        id: "infection_control_breach",
        name: "Infection Control Breach Reporting",
        description: "Reporting of infection control protocol violations",
        errorPattern:
          /infection.*(control|prevention|breach|violation|contamination)/i,
        complianceStandard: "DOH_NINE_DOMAINS",
        domain: "infection_control",
        severity: "high",
        reportingThreshold: 1,
        timeWindow: 30, // 30 minutes
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "infection.control@facility.com",
          "quality@facility.com",
          "doh.compliance@facility.com",
        ],
        reportTemplate: "infection_control_report",
        patientSafetyFlag: true,
        enabled: true,
      },
      {
        id: "quality_metric_violation",
        name: "Quality Metric Violation Reporting",
        description: "Reporting when quality metrics fall below DOH standards",
        errorPattern: /quality.*(metric|indicator|threshold|violation|below)/i,
        complianceStandard: "JAWDA",
        domain: "quality_management",
        severity: "medium",
        reportingThreshold: 3, // Report after 3 violations
        timeWindow: 60, // 1 hour
        autoReport: true,
        escalationRequired: false,
        notificationRecipients: [
          "quality@facility.com",
          "medical.director@facility.com",
        ],
        reportTemplate: "quality_violation_report",
        patientSafetyFlag: false,
        enabled: true,
      },
      {
        id: "documentation_compliance_error",
        name: "Documentation Compliance Error",
        description: "Reporting of documentation compliance violations",
        errorPattern: /documentation.*(missing|incomplete|late|non.compliant)/i,
        complianceStandard: "DOH_NINE_DOMAINS",
        domain: "information_management",
        severity: "medium",
        reportingThreshold: 5, // Report after 5 violations
        timeWindow: 240, // 4 hours
        autoReport: true,
        escalationRequired: false,
        notificationRecipients: [
          "compliance@facility.com",
          "medical.records@facility.com",
        ],
        reportTemplate: "documentation_compliance_report",
        patientSafetyFlag: false,
        enabled: true,
      },
      {
        id: "clinical_governance_violation",
        name: "Clinical Governance Violation",
        description: "Reporting of clinical governance protocol violations",
        errorPattern:
          /clinical.*(governance|protocol|guideline|violation|non.compliance)/i,
        complianceStandard: "DOH_NINE_DOMAINS",
        domain: "clinical_governance",
        severity: "high",
        reportingThreshold: 2,
        timeWindow: 120, // 2 hours
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "clinical.governance@facility.com",
          "medical.director@facility.com",
          "doh.compliance@facility.com",
        ],
        reportTemplate: "clinical_governance_report",
        patientSafetyFlag: true,
        enabled: true,
      },
    ];

    rules.forEach((rule) => {
      this.reportingRules.set(rule.id, rule);
    });

    console.log(`📋 Initialized ${rules.length} DOH reporting rules`);
  }

  private async initializeComplianceStandards(): Promise<void> {
    // Initialize compliance standard mappings and requirements
    const standards = {
      DOH_NINE_DOMAINS: {
        domains: [
          "patient_safety",
          "quality_management",
          "infection_control",
          "medication_management",
          "clinical_governance",
          "risk_management",
          "patient_rights",
          "information_management",
          "facility_management",
        ],
        reportingRequirements: {
          immediate: ["patient_safety", "medication_management"],
          within_24h: ["infection_control", "clinical_governance"],
          weekly: ["quality_management", "risk_management"],
          monthly: [
            "patient_rights",
            "information_management",
            "facility_management",
          ],
        },
      },
      JAWDA: {
        kpis: [
          "patient_satisfaction",
          "clinical_outcomes",
          "safety_indicators",
          "efficiency_metrics",
        ],
        reportingFrequency: "monthly",
      },
      ADHICS: {
        requirements: [
          "accreditation_standards",
          "quality_improvement",
          "patient_safety_culture",
        ],
        auditFrequency: "annual",
      },
    };

    console.log("📋 Initialized compliance standards and requirements");
  }

  private async initializeErrorPatterns(): Promise<void> {
    // Initialize healthcare-specific error patterns for DOH compliance
    const patterns = [
      {
        pattern: /critical.*(patient|safety|emergency)/i,
        severity: "critical",
        domain: "patient_safety",
        immediateReporting: true,
      },
      {
        pattern: /medication.*(error|adverse|reaction)/i,
        severity: "high",
        domain: "medication_management",
        immediateReporting: true,
      },
      {
        pattern: /infection.*(outbreak|control|prevention)/i,
        severity: "high",
        domain: "infection_control",
        immediateReporting: true,
      },
      {
        pattern: /quality.*(indicator|metric|threshold)/i,
        severity: "medium",
        domain: "quality_management",
        immediateReporting: false,
      },
    ];

    console.log(
      `📋 Initialized ${patterns.length} error patterns for DOH compliance`,
    );
  }

  /**
   * Report a DOH compliance error
   */
  async reportComplianceError(errorData: {
    errorType: DOHComplianceError["errorType"];
    severity: DOHComplianceError["severity"];
    complianceStandard: DOHComplianceError["complianceStandard"];
    domain?: DOHComplianceError["domain"];
    description: string;
    sourceSystem: string;
    errorCode: string;
    contextData: Record<string, any>;
    affectedPatients?: string[];
    affectedStaff?: string[];
    facilityId?: string;
    departmentId?: string;
    stackTrace?: string;
  }): Promise<string> {
    try {
      const complianceError: DOHComplianceError = {
        id: this.generateErrorId(),
        timestamp: new Date(),
        errorType: errorData.errorType,
        severity: errorData.severity,
        complianceStandard: errorData.complianceStandard,
        domain: errorData.domain,
        description: errorData.description,
        affectedPatients: errorData.affectedPatients || [],
        affectedStaff: errorData.affectedStaff || [],
        facilityId: errorData.facilityId || "RHHCS-001",
        departmentId: errorData.departmentId,
        sourceSystem: errorData.sourceSystem,
        errorCode: errorData.errorCode,
        stackTrace: errorData.stackTrace,
        contextData: errorData.contextData,
        patientSafetyImpact: this.assessPatientSafetyImpact(errorData),
        complianceViolation: this.assessComplianceViolation(errorData),
        reportingRequired: this.assessReportingRequirement(errorData),
        escalationLevel: this.determineEscalationLevel(errorData),
        status: "detected",
        resolutionRequired: this.assessResolutionRequirement(errorData),
        dueDate: this.calculateDueDate(errorData),
        tags: this.generateTags(errorData),
      };

      // Store the error
      this.complianceErrors.set(complianceError.id, complianceError);

      // Update metrics
      this.updateMetrics(complianceError);

      // Check reporting rules and trigger automatic reporting
      await this.processReportingRules(complianceError);

      // Escalate if required
      if (complianceError.escalationLevel !== "none") {
        await this.escalateError(complianceError);
      }

      // Emit event
      this.emit("compliance-error-reported", complianceError);

      console.log(
        `📋 DOH compliance error reported: ${complianceError.id} (${complianceError.severity})`,
      );

      return complianceError.id;
    } catch (error) {
      console.error("❌ Failed to report compliance error:", error);
      errorHandlerService.handleError(error, {
        context: "DOHComplianceErrorReportingService.reportComplianceError",
        errorData,
      });
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(options: {
    reportType: ComplianceReport["reportType"];
    complianceStandard?: string;
    domain?: string;
    startDate?: Date;
    endDate?: Date;
    includeResolved?: boolean;
  }): Promise<string> {
    try {
      const reportId = this.generateReportId();
      const now = new Date();
      const startDate =
        options.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = options.endDate || now;

      // Filter errors based on criteria
      const filteredErrors = Array.from(this.complianceErrors.values()).filter(
        (error) => {
          if (error.timestamp < startDate || error.timestamp > endDate)
            return false;
          if (
            options.complianceStandard &&
            error.complianceStandard !== options.complianceStandard
          )
            return false;
          if (options.domain && error.domain !== options.domain) return false;
          if (!options.includeResolved && error.status === "resolved")
            return false;
          return true;
        },
      );

      // Generate summary
      const summary = {
        totalErrors: filteredErrors.length,
        criticalErrors: filteredErrors.filter((e) => e.severity === "critical")
          .length,
        patientSafetyImpacts: filteredErrors.filter(
          (e) => e.patientSafetyImpact,
        ).length,
        complianceViolations: filteredErrors.filter(
          (e) => e.complianceViolation,
        ).length,
        affectedPatients: new Set(
          filteredErrors.flatMap((e) => e.affectedPatients || []),
        ).size,
        affectedDepartments: Array.from(
          new Set(filteredErrors.map((e) => e.departmentId).filter(Boolean)),
        ),
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations(filteredErrors);

      // Generate action items
      const actionItems = this.generateActionItems(filteredErrors);

      const report: ComplianceReport = {
        id: reportId,
        timestamp: now,
        reportType: options.reportType,
        complianceStandard: options.complianceStandard || "ALL",
        domain: options.domain,
        errors: filteredErrors,
        summary,
        recommendations,
        actionItems,
        reportedToDOH: false,
        followUpRequired:
          summary.criticalErrors > 0 || summary.patientSafetyImpacts > 0,
        nextReviewDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      // Store the report
      this.complianceReports.set(reportId, report);

      // Auto-submit to DOH if required
      if (this.shouldReportToDOH(report)) {
        await this.submitReportToDOH(report);
      }

      // Update metrics
      this.metrics.reportsGenerated++;

      // Emit event
      this.emit("compliance-report-generated", report);

      console.log(
        `📋 DOH compliance report generated: ${reportId} (${summary.totalErrors} errors)`,
      );

      return reportId;
    } catch (error) {
      console.error("❌ Failed to generate compliance report:", error);
      errorHandlerService.handleError(error, {
        context: "DOHComplianceErrorReportingService.generateComplianceReport",
        options,
      });
      throw error;
    }
  }

  /**
   * Submit report to DOH
   */
  private async submitReportToDOH(report: ComplianceReport): Promise<void> {
    try {
      console.log(`📋 Submitting report to DOH: ${report.id}`);

      // In a real implementation, this would integrate with DOH reporting systems
      // For now, we'll simulate the submission process

      // Prepare DOH submission data
      const dohSubmission = {
        facilityId: "RHHCS-001",
        reportId: report.id,
        reportType: report.reportType,
        submissionDate: new Date().toISOString(),
        complianceStandard: report.complianceStandard,
        summary: report.summary,
        criticalIncidents: report.errors.filter(
          (e) => e.severity === "critical",
        ),
        patientSafetyIncidents: report.errors.filter(
          (e) => e.patientSafetyImpact,
        ),
        actionPlan: report.actionItems,
        contactPerson: {
          name: "DOH Compliance Officer",
          email: "doh.compliance@facility.com",
          phone: "+971-XX-XXXXXXX",
        },
      };

      // Simulate DOH API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update report status
      report.reportedToDOH = true;
      report.reportedAt = new Date();
      report.reportingOfficer = "System Automated";

      // Update metrics
      this.metrics.reportsToDOH++;

      // Send notification to compliance team
      await smsEmailNotificationService.sendEmail(
        "doh-compliance-reminder-email",
        ["doh.compliance@facility.com", "medical.director@facility.com"],
        {
          reportId: report.id,
          reportType: report.reportType,
          submissionDate: new Date().toISOString(),
          criticalErrors: report.summary.criticalErrors,
          patientSafetyImpacts: report.summary.patientSafetyImpacts,
          portalLink: `https://compliance.facility.com/reports/${report.id}`,
        },
        {
          priority: "high",
          healthcareContext: {
            complianceType: "DOH",
            urgencyLevel: "urgent",
            facilityId: "RHHCS-001",
          },
        },
      );

      console.log(`✅ Report submitted to DOH successfully: ${report.id}`);
    } catch (error) {
      console.error(`❌ Failed to submit report to DOH: ${report.id}`, error);
      throw error;
    }
  }

  /**
   * Set up error monitoring
   */
  private setupErrorMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.monitorComplianceErrors();
      this.analyzeErrorTrends();
      this.checkOverdueActions();
    }, 300000); // Every 5 minutes
  }

  /**
   * Set up automatic reporting
   */
  private setupAutomaticReporting(): void {
    this.reportingInterval = setInterval(async () => {
      await this.generateScheduledReports();
      await this.cleanupOldData();
    }, 3600000); // Every hour
  }

  /**
   * Set up trend analysis
   */
  private setupTrendAnalysis(): void {
    setInterval(() => {
      this.analyzeTrends();
      this.updateTrendMetrics();
    }, 1800000); // Every 30 minutes
  }

  /**
   * Integrate with error handler service
   */
  private integrateWithErrorHandler(): void {
    // Listen for healthcare errors from the error handler
    errorHandlerService.on?.("healthcare-error", async (errorData: any) => {
      if (this.shouldReportError(errorData)) {
        await this.reportComplianceError({
          errorType: this.mapErrorType(errorData.type),
          severity: this.mapSeverity(errorData.severity),
          complianceStandard: this.determineComplianceStandard(errorData),
          domain: this.mapDomain(errorData),
          description: errorData.message || errorData.description,
          sourceSystem: errorData.context?.service || "unknown",
          errorCode: errorData.code || "UNKNOWN",
          contextData: errorData.context || {},
          stackTrace: errorData.stack,
        });
      }
    });
  }

  /**
   * Integrate with patient safety service
   */
  private integrateWithPatientSafety(): void {
    // Listen for patient safety incidents
    patientSafetyErrorEscalationService.on?.(
      "patient-safety-incident",
      async (incident: any) => {
        await this.reportComplianceError({
          errorType: "patient_safety",
          severity: "critical",
          complianceStandard: "DOH_NINE_DOMAINS",
          domain: "patient_safety",
          description: `Patient safety incident: ${incident.description}`,
          sourceSystem: "PatientSafetyService",
          errorCode: incident.incidentCode || "PS_INCIDENT",
          contextData: incident,
          affectedPatients: incident.patientIds || [],
          affectedStaff: incident.staffIds || [],
        });
      },
    );
  }

  /**
   * Integrate with notifications service
   */
  private integrateWithNotifications(): void {
    // Set up real-time notifications for critical compliance errors
    this.on("compliance-error-reported", async (error: DOHComplianceError) => {
      if (error.severity === "critical" || error.patientSafetyImpact) {
        // Send immediate SMS alert
        await smsEmailNotificationService.sendSMS(
          "patient-safety-alert-sms",
          ["+971XXXXXXXXX"], // DOH compliance officer
          {
            patientName: error.affectedPatients?.[0] || "Multiple Patients",
            patientId: error.affectedPatients?.[0] || "MULTIPLE",
            location: error.departmentId || error.facilityId,
            safetyIssue: error.description,
          },
          {
            priority: "critical",
            healthcareContext: {
              complianceType: "DOH",
              urgencyLevel: "emergency",
              facilityId: error.facilityId,
            },
          },
        );

        // Send WebSocket notification
        websocketService.sendHealthcareMessage(
          "doh-compliance-alert",
          {
            errorId: error.id,
            severity: error.severity,
            complianceStandard: error.complianceStandard,
            domain: error.domain,
            description: error.description,
            patientSafetyImpact: error.patientSafetyImpact,
            escalationLevel: error.escalationLevel,
          },
          {
            priority: "critical",
            emergency: true,
            dohCompliance: true,
          },
        );
      }
    });
  }

  // Helper methods
  private generateErrorId(): string {
    return `doh_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `doh_rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private assessPatientSafetyImpact(errorData: any): boolean {
    return (
      errorData.errorType === "patient_safety" ||
      errorData.domain === "patient_safety" ||
      errorData.domain === "medication_management" ||
      errorData.affectedPatients?.length > 0 ||
      /patient.*(safety|harm|injury|adverse)/i.test(errorData.description)
    );
  }

  private assessComplianceViolation(errorData: any): boolean {
    return (
      errorData.complianceStandard !== undefined ||
      errorData.domain !== undefined ||
      /compliance|violation|standard|regulation/i.test(errorData.description)
    );
  }

  private assessReportingRequirement(errorData: any): boolean {
    return (
      errorData.severity === "critical" ||
      errorData.errorType === "patient_safety" ||
      this.assessPatientSafetyImpact(errorData)
    );
  }

  private determineEscalationLevel(
    errorData: any,
  ): DOHComplianceError["escalationLevel"] {
    if (
      errorData.severity === "critical" ||
      errorData.errorType === "patient_safety"
    ) {
      return "doh";
    } else if (errorData.severity === "high") {
      return "management";
    } else if (errorData.severity === "medium") {
      return "supervisor";
    }
    return "none";
  }

  private assessResolutionRequirement(errorData: any): boolean {
    return errorData.severity !== "low";
  }

  private calculateDueDate(errorData: any): Date | undefined {
    if (!this.assessResolutionRequirement(errorData)) return undefined;

    const now = new Date();
    switch (errorData.severity) {
      case "critical":
        return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case "high":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case "medium":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }

  private generateTags(errorData: any): string[] {
    const tags: string[] = [];
    tags.push(errorData.errorType);
    tags.push(errorData.severity);
    tags.push(errorData.complianceStandard);
    if (errorData.domain) tags.push(errorData.domain);
    if (errorData.patientSafetyImpact) tags.push("patient_safety");
    if (errorData.complianceViolation) tags.push("compliance_violation");
    return tags;
  }

  private updateMetrics(error: DOHComplianceError): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.errorType] =
      (this.metrics.errorsByType[error.errorType] || 0) + 1;
    this.metrics.errorsBySeverity[error.severity] =
      (this.metrics.errorsBySeverity[error.severity] || 0) + 1;
    this.metrics.errorsByStandard[error.complianceStandard] =
      (this.metrics.errorsByStandard[error.complianceStandard] || 0) + 1;
    if (error.domain) {
      this.metrics.errorsByDomain[error.domain] =
        (this.metrics.errorsByDomain[error.domain] || 0) + 1;
    }
    if (error.patientSafetyImpact) {
      this.metrics.patientSafetyErrors++;
    }
    if (error.complianceViolation) {
      this.metrics.complianceViolations++;
    }
    if (error.escalationLevel !== "none") {
      this.metrics.escalationRate++;
    }
  }

  // Event system
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in DOH compliance event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Public API methods
  public getMetrics(): DOHReportingMetrics {
    return { ...this.metrics };
  }

  public getComplianceErrors(filters?: {
    severity?: string;
    complianceStandard?: string;
    domain?: string;
    status?: string;
  }): DOHComplianceError[] {
    let errors = Array.from(this.complianceErrors.values());

    if (filters) {
      if (filters.severity) {
        errors = errors.filter((e) => e.severity === filters.severity);
      }
      if (filters.complianceStandard) {
        errors = errors.filter(
          (e) => e.complianceStandard === filters.complianceStandard,
        );
      }
      if (filters.domain) {
        errors = errors.filter((e) => e.domain === filters.domain);
      }
      if (filters.status) {
        errors = errors.filter((e) => e.status === filters.status);
      }
    }

    return errors;
  }

  public getComplianceReports(): ComplianceReport[] {
    return Array.from(this.complianceReports.values());
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }

    this.eventListeners.clear();

    console.log("🧹 DOH Compliance Error Reporting Service cleaned up");
  }

  // Additional helper methods (simplified for brevity)
  private async processReportingRules(
    error: DOHComplianceError,
  ): Promise<void> {
    // Process reporting rules logic
  }

  private async escalateError(error: DOHComplianceError): Promise<void> {
    // Error escalation logic
  }

  private generateRecommendations(errors: DOHComplianceError[]): string[] {
    return [
      "Review and update compliance procedures",
      "Enhance staff training",
      "Implement additional monitoring",
    ];
  }

  private generateActionItems(
    errors: DOHComplianceError[],
  ): ComplianceReport["actionItems"] {
    return [
      {
        id: "action_1",
        description: "Review compliance procedures",
        priority: "high",
        status: "pending",
      },
    ];
  }

  private shouldReportToDOH(report: ComplianceReport): boolean {
    return (
      report.summary.criticalErrors > 0 ||
      report.summary.patientSafetyImpacts > 0
    );
  }

  private monitorComplianceErrors(): void {
    // Monitoring logic
  }

  private analyzeErrorTrends(): void {
    // Trend analysis logic
  }

  private checkOverdueActions(): void {
    // Overdue action checking logic
  }

  private async generateScheduledReports(): Promise<void> {
    // Scheduled report generation logic
  }

  private async cleanupOldData(): Promise<void> {
    // Data cleanup logic
  }

  private analyzeTrends(): void {
    // Trend analysis logic
  }

  private updateTrendMetrics(): void {
    // Trend metrics update logic
  }

  private shouldReportError(errorData: any): boolean {
    return (
      errorData.healthcare || errorData.compliance || errorData.patientSafety
    );
  }

  private mapErrorType(type: string): DOHComplianceError["errorType"] {
    if (type.includes("patient") || type.includes("safety"))
      return "patient_safety";
    if (type.includes("quality")) return "quality";
    if (type.includes("documentation")) return "documentation";
    if (type.includes("regulatory")) return "regulatory";
    if (type.includes("data")) return "data_integrity";
    return "workflow";
  }

  private mapSeverity(severity: string): DOHComplianceError["severity"] {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      default:
        return "low";
    }
  }

  private determineComplianceStandard(
    errorData: any,
  ): DOHComplianceError["complianceStandard"] {
    if (errorData.jawda) return "JAWDA";
    if (errorData.adhics) return "ADHICS";
    if (errorData.tawteen) return "TAWTEEN";
    if (errorData.patientSafety) return "PATIENT_SAFETY";
    return "DOH_NINE_DOMAINS";
  }

  private mapDomain(errorData: any): DOHComplianceError["domain"] | undefined {
    if (errorData.domain) return errorData.domain;
    if (errorData.type?.includes("medication")) return "medication_management";
    if (errorData.type?.includes("infection")) return "infection_control";
    if (errorData.type?.includes("quality")) return "quality_management";
    if (errorData.type?.includes("safety")) return "patient_safety";
    return undefined;
  }
}

export const dohComplianceErrorReportingService =
  new DOHComplianceErrorReportingService();
export {
  DOHComplianceError,
  DOHReportingRule,
  ComplianceReport,
  DOHReportingMetrics,
};
export default dohComplianceErrorReportingService;
