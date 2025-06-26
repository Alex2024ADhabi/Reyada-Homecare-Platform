/**
 * Signature Audit Service
 * P3-002.3.3: Audit and Reporting
 *
 * Comprehensive signature activity logging, compliance reporting,
 * and audit trail management with advanced analytics capabilities.
 */

import {
  DigitalSignature,
  WorkflowInstance,
  WorkflowSignature,
} from "@/services/digital-signature.service";
import { SignatureData } from "@/components/ui/signature-capture";

export interface SignatureAuditEntry {
  id: string;
  timestamp: string;
  eventType:
    | "signature_created"
    | "signature_verified"
    | "signature_accessed"
    | "signature_exported"
    | "workflow_started"
    | "workflow_completed"
    | "step_completed"
    | "compliance_check"
    | "security_violation"
    | "system_event";
  signatureId?: string;
  workflowId?: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  details: {
    action: string;
    description: string;
    metadata?: any;
    complianceFlags?: string[];
    securityLevel?: string;
    riskScore?: number;
  };
  complianceStatus: "compliant" | "non_compliant" | "pending" | "warning";
  severity: "low" | "medium" | "high" | "critical";
  tags?: string[];
  relatedEntries?: string[]; // IDs of related audit entries
}

export interface ComplianceReport {
  id: string;
  reportType:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "annual"
    | "custom";
  generatedAt: string;
  generatedBy: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSignatures: number;
    compliantSignatures: number;
    nonCompliantSignatures: number;
    pendingSignatures: number;
    complianceRate: number;
    averageProcessingTime: number;
    totalWorkflows: number;
    completedWorkflows: number;
  };
  complianceBreakdown: {
    dohCompliant: number;
    hipaaCompliant: number;
    jawdaCompliant: number;
    adhicsCompliant: number;
  };
  riskAnalysis: {
    highRiskSignatures: number;
    mediumRiskSignatures: number;
    lowRiskSignatures: number;
    securityViolations: number;
    anomaliesDetected: number;
  };
  userActivity: {
    userId: string;
    userName: string;
    userRole: string;
    signaturesCreated: number;
    complianceRate: number;
    averageTime: number;
    violations: number;
  }[];
  documentTypes: {
    type: string;
    count: number;
    complianceRate: number;
    averageTime: number;
  }[];
  trends: {
    date: string;
    signatures: number;
    compliance: number;
    violations: number;
  }[];
  recommendations: string[];
  actionItems: {
    priority: "high" | "medium" | "low";
    description: string;
    assignedTo?: string;
    dueDate?: string;
  }[];
}

export interface SignatureAnalytics {
  totalSignatures: number;
  signaturesThisPeriod: number;
  complianceRate: number;
  averageSigningTime: number;
  mostActiveUsers: {
    userId: string;
    userName: string;
    count: number;
    complianceRate: number;
  }[];
  documentTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  complianceBreakdown: {
    standard: "DOH" | "HIPAA" | "JAWDA" | "ADHICS";
    compliant: number;
    nonCompliant: number;
    rate: number;
  }[];
  timeSeriesData: {
    date: string;
    signatures: number;
    compliance: number;
    violations: number;
    averageTime: number;
  }[];
  riskMetrics: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    securityIncidents: number;
  };
  performanceMetrics: {
    averageWorkflowTime: number;
    bottleneckSteps: string[];
    escalationRate: number;
    completionRate: number;
  };
}

export interface AuditExportOptions {
  format: "json" | "csv" | "pdf" | "excel";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    eventTypes?: string[];
    userIds?: string[];
    documentTypes?: string[];
    complianceStatus?: string[];
    severity?: string[];
  };
  includeDetails?: boolean;
  includeMetadata?: boolean;
  groupBy?: "date" | "user" | "document" | "event";
  sortBy?: "timestamp" | "severity" | "compliance";
  sortOrder?: "asc" | "desc";
}

class SignatureAuditService {
  private auditEntries: Map<string, SignatureAuditEntry> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();
  private analytics: SignatureAnalytics | null = null;
  private lastAnalyticsUpdate: number = 0;
  private readonly ANALYTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeAuditSystem();
  }

  private initializeAuditSystem(): void {
    // Start periodic cleanup and analytics update
    setInterval(
      () => {
        this.cleanupOldEntries();
        this.updateAnalytics();
      },
      60 * 60 * 1000,
    ); // Every hour

    // Initialize with some sample data for demonstration
    this.createSampleAuditData();
  }

  private createSampleAuditData(): void {
    const sampleEntries: Partial<SignatureAuditEntry>[] = [
      {
        eventType: "signature_created",
        documentId: "doc_001",
        userId: "user_001",
        userName: "Dr. Sarah Johnson",
        userRole: "physician",
        details: {
          action: "Digital signature created",
          description: "Patient consent form signed",
          securityLevel: "doh-compliant",
          riskScore: 5,
        },
        complianceStatus: "compliant",
        severity: "low",
      },
      {
        eventType: "workflow_completed",
        documentId: "doc_002",
        userId: "user_002",
        userName: "Nurse Mary Smith",
        userRole: "registered_nurse",
        details: {
          action: "Workflow completed",
          description: "Emergency preparedness workflow finished",
          securityLevel: "enhanced",
          riskScore: 10,
        },
        complianceStatus: "compliant",
        severity: "low",
      },
      {
        eventType: "compliance_check",
        documentId: "doc_003",
        userId: "system",
        userName: "System",
        userRole: "system",
        details: {
          action: "Compliance validation",
          description: "DOH compliance check failed",
          complianceFlags: ["missing_witness", "invalid_certificate"],
          riskScore: 75,
        },
        complianceStatus: "non_compliant",
        severity: "high",
      },
    ];

    sampleEntries.forEach((entry) => {
      this.logAuditEvent(entry as SignatureAuditEntry);
    });
  }

  /**
   * Log a signature audit event
   */
  public logAuditEvent(entry: Partial<SignatureAuditEntry>): string {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const auditEntry: SignatureAuditEntry = {
      id: auditId,
      timestamp,
      eventType: entry.eventType || "system_event",
      signatureId: entry.signatureId,
      workflowId: entry.workflowId,
      documentId: entry.documentId || "unknown",
      userId: entry.userId || "system",
      userName: entry.userName || "System",
      userRole: entry.userRole || "system",
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      deviceInfo: entry.deviceInfo,
      location: entry.location,
      details: {
        action: entry.details?.action || "Unknown action",
        description: entry.details?.description || "No description",
        metadata: entry.details?.metadata,
        complianceFlags: entry.details?.complianceFlags || [],
        securityLevel: entry.details?.securityLevel || "standard",
        riskScore: entry.details?.riskScore || 0,
      },
      complianceStatus: entry.complianceStatus || "pending",
      severity: entry.severity || "low",
      tags: entry.tags || [],
      relatedEntries: entry.relatedEntries || [],
    };

    this.auditEntries.set(auditId, auditEntry);

    // Trigger analytics update if this is a significant event
    if (this.isSignificantEvent(auditEntry)) {
      this.invalidateAnalyticsCache();
    }

    return auditId;
  }

  /**
   * Log signature creation event
   */
  public logSignatureCreated(
    signature: DigitalSignature,
    userInfo: { userId: string; userName: string; userRole: string },
    deviceInfo?: any,
  ): string {
    return this.logAuditEvent({
      eventType: "signature_created",
      signatureId: signature.id,
      documentId: signature.documentId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      userRole: userInfo.userRole,
      deviceInfo,
      details: {
        action: "Digital signature created",
        description: `${signature.signatureType} signature created for document ${signature.documentId}`,
        securityLevel: signature.securityLevel,
        metadata: {
          signatureType: signature.signatureType,
          certificateId: signature.certificateId,
          algorithmSuite: signature.algorithmSuite,
        },
        riskScore: this.calculateRiskScore(signature),
      },
      complianceStatus: this.determineComplianceStatus(signature),
      severity: "low",
    });
  }

  /**
   * Log workflow completion event
   */
  public logWorkflowCompleted(
    workflowInstance: WorkflowInstance,
    userInfo: { userId: string; userName: string; userRole: string },
  ): string {
    return this.logAuditEvent({
      eventType: "workflow_completed",
      workflowId: workflowInstance.id,
      documentId: workflowInstance.documentId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      userRole: userInfo.userRole,
      details: {
        action: "Workflow completed",
        description: `Workflow ${workflowInstance.workflowId} completed for document ${workflowInstance.documentId}`,
        metadata: {
          workflowType: workflowInstance.metadata.formType,
          totalSteps: workflowInstance.signatures.length,
          duration: workflowInstance.completedAt
            ? new Date(workflowInstance.completedAt).getTime() -
              new Date(workflowInstance.createdAt).getTime()
            : 0,
        },
        riskScore: this.calculateWorkflowRiskScore(workflowInstance),
      },
      complianceStatus: "compliant",
      severity: "low",
    });
  }

  /**
   * Log compliance check event
   */
  public logComplianceCheck(
    documentId: string,
    checkResults: {
      passed: boolean;
      violations: string[];
      warnings: string[];
      standard: string;
    },
    userInfo?: { userId: string; userName: string; userRole: string },
  ): string {
    return this.logAuditEvent({
      eventType: "compliance_check",
      documentId,
      userId: userInfo?.userId || "system",
      userName: userInfo?.userName || "System",
      userRole: userInfo?.userRole || "system",
      details: {
        action: "Compliance validation",
        description: `${checkResults.standard} compliance check ${checkResults.passed ? "passed" : "failed"}`,
        complianceFlags: checkResults.violations,
        metadata: {
          standard: checkResults.standard,
          violations: checkResults.violations,
          warnings: checkResults.warnings,
        },
        riskScore: checkResults.violations.length * 25,
      },
      complianceStatus: checkResults.passed ? "compliant" : "non_compliant",
      severity: checkResults.violations.length > 0 ? "high" : "low",
    });
  }

  /**
   * Get audit entries with filtering and pagination
   */
  public getAuditEntries(
    options: {
      startDate?: string;
      endDate?: string;
      eventTypes?: string[];
      userIds?: string[];
      documentIds?: string[];
      complianceStatus?: string[];
      severity?: string[];
      limit?: number;
      offset?: number;
      sortBy?: "timestamp" | "severity" | "compliance";
      sortOrder?: "asc" | "desc";
    } = {},
  ): {
    entries: SignatureAuditEntry[];
    total: number;
    filtered: number;
  } {
    let entries = Array.from(this.auditEntries.values());

    // Apply filters
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      entries = entries.filter(
        (entry) => new Date(entry.timestamp) >= startDate,
      );
    }

    if (options.endDate) {
      const endDate = new Date(options.endDate);
      entries = entries.filter((entry) => new Date(entry.timestamp) <= endDate);
    }

    if (options.eventTypes && options.eventTypes.length > 0) {
      entries = entries.filter((entry) =>
        options.eventTypes!.includes(entry.eventType),
      );
    }

    if (options.userIds && options.userIds.length > 0) {
      entries = entries.filter((entry) =>
        options.userIds!.includes(entry.userId),
      );
    }

    if (options.documentIds && options.documentIds.length > 0) {
      entries = entries.filter((entry) =>
        options.documentIds!.includes(entry.documentId),
      );
    }

    if (options.complianceStatus && options.complianceStatus.length > 0) {
      entries = entries.filter((entry) =>
        options.complianceStatus!.includes(entry.complianceStatus),
      );
    }

    if (options.severity && options.severity.length > 0) {
      entries = entries.filter((entry) =>
        options.severity!.includes(entry.severity),
      );
    }

    const filtered = entries.length;

    // Apply sorting
    const sortBy = options.sortBy || "timestamp";
    const sortOrder = options.sortOrder || "desc";

    entries.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "severity":
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case "compliance":
          const complianceOrder = {
            compliant: 1,
            warning: 2,
            pending: 3,
            non_compliant: 4,
          };
          aValue = complianceOrder[a.complianceStatus];
          bValue = complianceOrder[b.complianceStatus];
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    const paginatedEntries = entries.slice(offset, offset + limit);

    return {
      entries: paginatedEntries,
      total: this.auditEntries.size,
      filtered,
    };
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    reportType: ComplianceReport["reportType"],
    period: { startDate: string; endDate: string },
    generatedBy: string,
  ): Promise<ComplianceReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedAt = new Date().toISOString();

    // Get audit entries for the period
    const { entries } = this.getAuditEntries({
      startDate: period.startDate,
      endDate: period.endDate,
    });

    // Calculate summary statistics
    const signatureEntries = entries.filter(
      (e) => e.eventType === "signature_created",
    );
    const workflowEntries = entries.filter(
      (e) => e.eventType === "workflow_completed",
    );
    const complianceEntries = entries.filter(
      (e) => e.eventType === "compliance_check",
    );

    const summary = {
      totalSignatures: signatureEntries.length,
      compliantSignatures: signatureEntries.filter(
        (e) => e.complianceStatus === "compliant",
      ).length,
      nonCompliantSignatures: signatureEntries.filter(
        (e) => e.complianceStatus === "non_compliant",
      ).length,
      pendingSignatures: signatureEntries.filter(
        (e) => e.complianceStatus === "pending",
      ).length,
      complianceRate:
        signatureEntries.length > 0
          ? (signatureEntries.filter((e) => e.complianceStatus === "compliant")
              .length /
              signatureEntries.length) *
            100
          : 0,
      averageProcessingTime: this.calculateAverageProcessingTime(entries),
      totalWorkflows: workflowEntries.length,
      completedWorkflows: workflowEntries.filter(
        (e) => e.complianceStatus === "compliant",
      ).length,
    };

    // Calculate compliance breakdown
    const complianceBreakdown = {
      dohCompliant: complianceEntries.filter(
        (e) =>
          e.details.metadata?.standard === "DOH" &&
          e.complianceStatus === "compliant",
      ).length,
      hipaaCompliant: complianceEntries.filter(
        (e) =>
          e.details.metadata?.standard === "HIPAA" &&
          e.complianceStatus === "compliant",
      ).length,
      jawdaCompliant: complianceEntries.filter(
        (e) =>
          e.details.metadata?.standard === "JAWDA" &&
          e.complianceStatus === "compliant",
      ).length,
      adhicsCompliant: complianceEntries.filter(
        (e) =>
          e.details.metadata?.standard === "ADHICS" &&
          e.complianceStatus === "compliant",
      ).length,
    };

    // Calculate risk analysis
    const riskAnalysis = {
      highRiskSignatures: entries.filter(
        (e) => (e.details.riskScore || 0) >= 70,
      ).length,
      mediumRiskSignatures: entries.filter(
        (e) =>
          (e.details.riskScore || 0) >= 30 && (e.details.riskScore || 0) < 70,
      ).length,
      lowRiskSignatures: entries.filter((e) => (e.details.riskScore || 0) < 30)
        .length,
      securityViolations: entries.filter(
        (e) => e.eventType === "security_violation",
      ).length,
      anomaliesDetected: entries.filter(
        (e) => e.severity === "high" || e.severity === "critical",
      ).length,
    };

    // Calculate user activity
    const userActivity = this.calculateUserActivity(entries);

    // Calculate document type distribution
    const documentTypes = this.calculateDocumentTypeDistribution(entries);

    // Generate trends data
    const trends = this.generateTrendsData(entries, period);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      summary,
      riskAnalysis,
      complianceBreakdown,
    );

    // Generate action items
    const actionItems = this.generateActionItems(entries, riskAnalysis);

    const report: ComplianceReport = {
      id: reportId,
      reportType,
      generatedAt,
      generatedBy,
      period,
      summary,
      complianceBreakdown,
      riskAnalysis,
      userActivity,
      documentTypes,
      trends,
      recommendations,
      actionItems,
    };

    this.complianceReports.set(reportId, report);
    return report;
  }

  /**
   * Get signature analytics
   */
  public getSignatureAnalytics(
    forceRefresh: boolean = false,
  ): SignatureAnalytics {
    const now = Date.now();

    if (
      !this.analytics ||
      forceRefresh ||
      now - this.lastAnalyticsUpdate > this.ANALYTICS_CACHE_DURATION
    ) {
      this.updateAnalytics();
    }

    return this.analytics!;
  }

  /**
   * Export audit data
   */
  public async exportAuditData(options: AuditExportOptions): Promise<{
    data: string | Buffer;
    filename: string;
    mimeType: string;
  }> {
    const { entries } = this.getAuditEntries({
      startDate: options.dateRange.startDate,
      endDate: options.dateRange.endDate,
      eventTypes: options.filters?.eventTypes,
      userIds: options.filters?.userIds,
      complianceStatus: options.filters?.complianceStatus,
      severity: options.filters?.severity,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    });

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `signature_audit_${timestamp}.${options.format}`;

    switch (options.format) {
      case "json":
        return {
          data: JSON.stringify(entries, null, 2),
          filename,
          mimeType: "application/json",
        };

      case "csv":
        return {
          data: this.convertToCSV(entries, options),
          filename,
          mimeType: "text/csv",
        };

      case "pdf":
        return {
          data: await this.generatePDFReport(entries, options),
          filename,
          mimeType: "application/pdf",
        };

      case "excel":
        return {
          data: await this.generateExcelReport(entries, options),
          filename: filename.replace(".excel", ".xlsx"),
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Private helper methods

  private isSignificantEvent(entry: SignatureAuditEntry): boolean {
    return (
      [
        "signature_created",
        "workflow_completed",
        "compliance_check",
        "security_violation",
      ].includes(entry.eventType) ||
      entry.severity === "high" ||
      entry.severity === "critical"
    );
  }

  private invalidateAnalyticsCache(): void {
    this.lastAnalyticsUpdate = 0;
  }

  private calculateRiskScore(signature: DigitalSignature): number {
    let riskScore = 0;

    // Base risk based on security level
    switch (signature.securityLevel) {
      case "doh-compliant":
        riskScore += 5;
        break;
      case "enhanced":
        riskScore += 15;
        break;
      case "standard":
        riskScore += 25;
        break;
    }

    // Add risk for missing certificate
    if (!signature.certificateId) {
      riskScore += 30;
    }

    // Add risk for weak algorithms
    if (signature.algorithmSuite?.signature !== "RSA-PSS") {
      riskScore += 20;
    }

    return Math.min(riskScore, 100);
  }

  private determineComplianceStatus(
    signature: DigitalSignature,
  ): SignatureAuditEntry["complianceStatus"] {
    if (
      signature.securityLevel === "doh-compliant" &&
      signature.certificateId
    ) {
      return "compliant";
    }
    if (signature.securityLevel === "enhanced") {
      return "warning";
    }
    return "non_compliant";
  }

  private calculateWorkflowRiskScore(workflow: WorkflowInstance): number {
    let riskScore = 0;

    // Risk based on completion time
    if (workflow.completedAt) {
      const duration =
        new Date(workflow.completedAt).getTime() -
        new Date(workflow.createdAt).getTime();
      const hours = duration / (1000 * 60 * 60);
      if (hours > 48) riskScore += 20;
      else if (hours > 24) riskScore += 10;
    }

    // Risk based on escalations
    if (workflow.status === "escalated") {
      riskScore += 30;
    }

    // Risk based on missing signatures
    const expectedSignatures = workflow.signatures.length;
    if (expectedSignatures < 2) {
      riskScore += 25;
    }

    return Math.min(riskScore, 100);
  }

  private calculateAverageProcessingTime(
    entries: SignatureAuditEntry[],
  ): number {
    const workflowEntries = entries.filter(
      (e) => e.eventType === "workflow_completed",
    );
    if (workflowEntries.length === 0) return 0;

    const totalTime = workflowEntries.reduce((sum, entry) => {
      return sum + (entry.details.metadata?.duration || 0);
    }, 0);

    return totalTime / workflowEntries.length;
  }

  private calculateUserActivity(
    entries: SignatureAuditEntry[],
  ): ComplianceReport["userActivity"] {
    const userMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userRole: string;
        signaturesCreated: number;
        compliantSignatures: number;
        totalTime: number;
        violations: number;
      }
    >();

    entries.forEach((entry) => {
      if (!userMap.has(entry.userId)) {
        userMap.set(entry.userId, {
          userId: entry.userId,
          userName: entry.userName,
          userRole: entry.userRole,
          signaturesCreated: 0,
          compliantSignatures: 0,
          totalTime: 0,
          violations: 0,
        });
      }

      const user = userMap.get(entry.userId)!;

      if (entry.eventType === "signature_created") {
        user.signaturesCreated++;
        if (entry.complianceStatus === "compliant") {
          user.compliantSignatures++;
        }
      }

      if (entry.complianceStatus === "non_compliant") {
        user.violations++;
      }

      user.totalTime += entry.details.metadata?.duration || 0;
    });

    return Array.from(userMap.values()).map((user) => ({
      userId: user.userId,
      userName: user.userName,
      userRole: user.userRole,
      signaturesCreated: user.signaturesCreated,
      complianceRate:
        user.signaturesCreated > 0
          ? (user.compliantSignatures / user.signaturesCreated) * 100
          : 0,
      averageTime:
        user.signaturesCreated > 0
          ? user.totalTime / user.signaturesCreated
          : 0,
      violations: user.violations,
    }));
  }

  private calculateDocumentTypeDistribution(
    entries: SignatureAuditEntry[],
  ): ComplianceReport["documentTypes"] {
    const typeMap = new Map<
      string,
      {
        count: number;
        compliant: number;
        totalTime: number;
      }
    >();

    entries.forEach((entry) => {
      const docType = entry.details.metadata?.documentType || "unknown";

      if (!typeMap.has(docType)) {
        typeMap.set(docType, { count: 0, compliant: 0, totalTime: 0 });
      }

      const type = typeMap.get(docType)!;
      type.count++;

      if (entry.complianceStatus === "compliant") {
        type.compliant++;
      }

      type.totalTime += entry.details.metadata?.duration || 0;
    });

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      complianceRate: data.count > 0 ? (data.compliant / data.count) * 100 : 0,
      averageTime: data.count > 0 ? data.totalTime / data.count : 0,
    }));
  }

  private generateTrendsData(
    entries: SignatureAuditEntry[],
    period: { startDate: string; endDate: string },
  ): ComplianceReport["trends"] {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const trends: ComplianceReport["trends"] = [];

    // Generate daily trends
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];
      const dayEntries = entries.filter((entry) =>
        entry.timestamp.startsWith(dateStr),
      );

      const signatures = dayEntries.filter(
        (e) => e.eventType === "signature_created",
      ).length;
      const compliant = dayEntries.filter(
        (e) => e.complianceStatus === "compliant",
      ).length;
      const violations = dayEntries.filter(
        (e) => e.complianceStatus === "non_compliant",
      ).length;

      trends.push({
        date: dateStr,
        signatures,
        compliance: signatures > 0 ? (compliant / signatures) * 100 : 0,
        violations,
      });
    }

    return trends;
  }

  private generateRecommendations(
    summary: ComplianceReport["summary"],
    riskAnalysis: ComplianceReport["riskAnalysis"],
    complianceBreakdown: ComplianceReport["complianceBreakdown"],
  ): string[] {
    const recommendations: string[] = [];

    if (summary.complianceRate < 90) {
      recommendations.push(
        "Improve overall compliance rate through additional training and process improvements",
      );
    }

    if (riskAnalysis.highRiskSignatures > 0) {
      recommendations.push(
        "Review and address high-risk signatures to improve security posture",
      );
    }

    if (complianceBreakdown.dohCompliant < summary.totalSignatures * 0.8) {
      recommendations.push(
        "Increase DOH compliance by implementing certified digital certificates",
      );
    }

    if (summary.averageProcessingTime > 24 * 60 * 60 * 1000) {
      recommendations.push(
        "Optimize workflow processes to reduce average processing time",
      );
    }

    if (riskAnalysis.securityViolations > 0) {
      recommendations.push(
        "Investigate and remediate security violations to prevent future incidents",
      );
    }

    return recommendations;
  }

  private generateActionItems(
    entries: SignatureAuditEntry[],
    riskAnalysis: ComplianceReport["riskAnalysis"],
  ): ComplianceReport["actionItems"] {
    const actionItems: ComplianceReport["actionItems"] = [];

    if (riskAnalysis.securityViolations > 0) {
      actionItems.push({
        priority: "high",
        description: "Investigate and resolve security violations",
        assignedTo: "Security Team",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (riskAnalysis.highRiskSignatures > 5) {
      actionItems.push({
        priority: "medium",
        description:
          "Review high-risk signatures and implement additional controls",
        assignedTo: "Compliance Team",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const nonCompliantEntries = entries.filter(
      (e) => e.complianceStatus === "non_compliant",
    );
    if (nonCompliantEntries.length > 0) {
      actionItems.push({
        priority: "medium",
        description: "Address non-compliant signatures and update processes",
        assignedTo: "Quality Team",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return actionItems;
  }

  private updateAnalytics(): void {
    const entries = Array.from(this.auditEntries.values());
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter entries for the last 30 days
    const recentEntries = entries.filter(
      (entry) => new Date(entry.timestamp).getTime() >= thirtyDaysAgo,
    );

    const signatureEntries = entries.filter(
      (e) => e.eventType === "signature_created",
    );
    const recentSignatureEntries = recentEntries.filter(
      (e) => e.eventType === "signature_created",
    );

    // Calculate basic metrics
    const totalSignatures = signatureEntries.length;
    const signaturesThisPeriod = recentSignatureEntries.length;
    const compliantSignatures = signatureEntries.filter(
      (e) => e.complianceStatus === "compliant",
    ).length;
    const complianceRate =
      totalSignatures > 0 ? (compliantSignatures / totalSignatures) * 100 : 0;

    // Calculate average signing time
    const workflowEntries = entries.filter(
      (e) => e.eventType === "workflow_completed",
    );
    const averageSigningTime =
      workflowEntries.length > 0
        ? workflowEntries.reduce(
            (sum, e) => sum + (e.details.metadata?.duration || 0),
            0,
          ) / workflowEntries.length
        : 0;

    // Calculate most active users
    const userActivity = this.calculateUserActivity(recentEntries);
    const mostActiveUsers = userActivity
      .sort((a, b) => b.signaturesCreated - a.signaturesCreated)
      .slice(0, 5)
      .map((user) => ({
        userId: user.userId,
        userName: user.userName,
        count: user.signaturesCreated,
        complianceRate: user.complianceRate,
      }));

    // Calculate document type distribution
    const documentTypes = this.calculateDocumentTypeDistribution(recentEntries);
    const totalDocs = documentTypes.reduce((sum, type) => sum + type.count, 0);
    const documentTypeDistribution = documentTypes.map((type) => ({
      type: type.type,
      count: type.count,
      percentage: totalDocs > 0 ? (type.count / totalDocs) * 100 : 0,
    }));

    // Calculate compliance breakdown
    const complianceBreakdown = [
      {
        standard: "DOH" as const,
        compliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "DOH" &&
            e.complianceStatus === "compliant",
        ).length,
        nonCompliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "DOH" &&
            e.complianceStatus === "non_compliant",
        ).length,
        rate: 0,
      },
      {
        standard: "HIPAA" as const,
        compliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "HIPAA" &&
            e.complianceStatus === "compliant",
        ).length,
        nonCompliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "HIPAA" &&
            e.complianceStatus === "non_compliant",
        ).length,
        rate: 0,
      },
      {
        standard: "JAWDA" as const,
        compliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "JAWDA" &&
            e.complianceStatus === "compliant",
        ).length,
        nonCompliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "JAWDA" &&
            e.complianceStatus === "non_compliant",
        ).length,
        rate: 0,
      },
      {
        standard: "ADHICS" as const,
        compliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "ADHICS" &&
            e.complianceStatus === "compliant",
        ).length,
        nonCompliant: entries.filter(
          (e) =>
            e.details.metadata?.standard === "ADHICS" &&
            e.complianceStatus === "non_compliant",
        ).length,
        rate: 0,
      },
    ];

    // Calculate rates
    complianceBreakdown.forEach((breakdown) => {
      const total = breakdown.compliant + breakdown.nonCompliant;
      breakdown.rate = total > 0 ? (breakdown.compliant / total) * 100 : 0;
    });

    // Generate time series data (last 30 days)
    const timeSeriesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayEntries = entries.filter((entry) =>
        entry.timestamp.startsWith(dateStr),
      );

      const signatures = dayEntries.filter(
        (e) => e.eventType === "signature_created",
      ).length;
      const compliant = dayEntries.filter(
        (e) => e.complianceStatus === "compliant",
      ).length;
      const violations = dayEntries.filter(
        (e) => e.complianceStatus === "non_compliant",
      ).length;
      const avgTime =
        dayEntries.length > 0
          ? dayEntries.reduce(
              (sum, e) => sum + (e.details.metadata?.duration || 0),
              0,
            ) / dayEntries.length
          : 0;

      timeSeriesData.push({
        date: dateStr,
        signatures,
        compliance: signatures > 0 ? (compliant / signatures) * 100 : 0,
        violations,
        averageTime: avgTime,
      });
    }

    // Calculate risk metrics
    const riskMetrics = {
      highRisk: entries.filter((e) => (e.details.riskScore || 0) >= 70).length,
      mediumRisk: entries.filter(
        (e) =>
          (e.details.riskScore || 0) >= 30 && (e.details.riskScore || 0) < 70,
      ).length,
      lowRisk: entries.filter((e) => (e.details.riskScore || 0) < 30).length,
      securityIncidents: entries.filter(
        (e) => e.eventType === "security_violation",
      ).length,
    };

    // Calculate performance metrics
    const performanceMetrics = {
      averageWorkflowTime: averageSigningTime,
      bottleneckSteps: [], // This would be calculated from workflow data
      escalationRate:
        workflowEntries.length > 0
          ? (entries.filter(
              (e) =>
                e.eventType === "workflow_completed" &&
                e.details.metadata?.escalated,
            ).length /
              workflowEntries.length) *
            100
          : 0,
      completionRate:
        workflowEntries.length > 0
          ? (workflowEntries.filter((e) => e.complianceStatus === "compliant")
              .length /
              workflowEntries.length) *
            100
          : 0,
    };

    this.analytics = {
      totalSignatures,
      signaturesThisPeriod,
      complianceRate,
      averageSigningTime,
      mostActiveUsers,
      documentTypeDistribution,
      complianceBreakdown,
      timeSeriesData,
      riskMetrics,
      performanceMetrics,
    };

    this.lastAnalyticsUpdate = now;
  }

  private convertToCSV(
    entries: SignatureAuditEntry[],
    options: AuditExportOptions,
  ): string {
    const headers = [
      "ID",
      "Timestamp",
      "Event Type",
      "Document ID",
      "User ID",
      "User Name",
      "User Role",
      "Action",
      "Description",
      "Compliance Status",
      "Severity",
      "Risk Score",
    ];

    if (options.includeDetails) {
      headers.push("IP Address", "User Agent", "Device Info");
    }

    if (options.includeMetadata) {
      headers.push("Metadata", "Compliance Flags", "Security Level");
    }

    const csvRows = [headers.join(",")];

    entries.forEach((entry) => {
      const row = [
        entry.id,
        entry.timestamp,
        entry.eventType,
        entry.documentId,
        entry.userId,
        `"${entry.userName}"`,
        entry.userRole,
        `"${entry.details.action}"`,
        `"${entry.details.description}"`,
        entry.complianceStatus,
        entry.severity,
        entry.details.riskScore || 0,
      ];

      if (options.includeDetails) {
        row.push(
          entry.ipAddress || "",
          `"${entry.userAgent || ""}"`,
          `"${JSON.stringify(entry.deviceInfo || {})}"`,
        );
      }

      if (options.includeMetadata) {
        row.push(
          `"${JSON.stringify(entry.details.metadata || {})}"`,
          `"${(entry.details.complianceFlags || []).join("; ")}"`,
          entry.details.securityLevel || "",
        );
      }

      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  private async generatePDFReport(
    entries: SignatureAuditEntry[],
    options: AuditExportOptions,
  ): Promise<Buffer> {
    // This would use a PDF generation library like jsPDF or PDFKit
    // For now, return a simple text representation as Buffer
    const content = `Signature Audit Report\n\nGenerated: ${new Date().toISOString()}\n\nTotal Entries: ${entries.length}\n\n${entries
      .map(
        (entry) =>
          `${entry.timestamp} - ${entry.eventType} - ${entry.userName} - ${entry.details.action}`,
      )
      .join("\n")}`;

    return Buffer.from(content, "utf-8");
  }

  private async generateExcelReport(
    entries: SignatureAuditEntry[],
    options: AuditExportOptions,
  ): Promise<Buffer> {
    // This would use a library like ExcelJS to generate proper Excel files
    // For now, return CSV content as Buffer
    const csvContent = this.convertToCSV(entries, options);
    return Buffer.from(csvContent, "utf-8");
  }

  private cleanupOldEntries(): void {
    const cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

    for (const [id, entry] of this.auditEntries) {
      if (new Date(entry.timestamp) < cutoffDate) {
        this.auditEntries.delete(id);
      }
    }
  }
}

export const signatureAuditService = new SignatureAuditService();
export default signatureAuditService;
