/**
 * Audit Trail Service
 * Comprehensive audit trail system for healthcare compliance
 */

import { errorRecovery } from "@/utils/error-recovery";
import { performanceMonitor } from "@/services/performance-monitor.service";

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  outcome: "success" | "failure" | "warning";
  riskLevel: "low" | "medium" | "high" | "critical";
  complianceFlags: string[];
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  outcome?: "success" | "failure" | "warning";
  riskLevel?: "low" | "medium" | "high" | "critical";
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  totalEvents: number;
  timeRange: { start: Date; end: Date };
  summary: {
    successRate: number;
    failureRate: number;
    warningRate: number;
    riskDistribution: Record<string, number>;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
    complianceScore: number;
  };
  events: AuditEvent[];
  recommendations: string[];
}

export interface ComplianceMetrics {
  hipaaCompliance: {
    score: number;
    violations: number;
    lastAudit: Date;
    recommendations: string[];
  };
  dohCompliance: {
    score: number;
    violations: number;
    lastAudit: Date;
    recommendations: string[];
  };
  jawdaCompliance: {
    score: number;
    violations: number;
    lastAudit: Date;
    recommendations: string[];
  };
  overallScore: number;
  criticalIssues: string[];
}

class AuditTrailService {
  private static instance: AuditTrailService;
  private events: Map<string, AuditEvent> = new Map();
  private eventQueue: AuditEvent[] = [];
  private isProcessing = false;
  private retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds
  private complianceRules: Map<string, Function> = new Map();
  private alertThresholds = {
    failureRate: 5, // 5% failure rate threshold
    suspiciousActivity: 10, // 10 failed attempts in 5 minutes
    dataAccess: 100, // 100 patient records accessed per hour
    privilegedActions: 20, // 20 privileged actions per hour
    criticalEvents: 1, // Any critical event triggers immediate alert
    complianceViolations: 3, // 3 compliance violations in 1 hour
    bulkDataExport: 5, // 5 bulk data exports per day
    afterHoursAccess: 10, // 10 after-hours access attempts
  };

  public static getInstance(): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService();
    }
    return AuditTrailService.instance;
  }

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize audit trail service
   */
  private async initializeService(): Promise<void> {
    try {
      console.log("📋 Initializing Audit Trail Service...");

      // Initialize compliance rules
      await this.initializeComplianceRules();

      // Start event processor
      this.startEventProcessor();

      // Setup monitoring
      this.setupMonitoring();

      // Initialize retention policy
      this.setupRetentionPolicy();

      console.log("✅ Audit Trail Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Audit Trail Service:", error);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  public async logEvent(
    event: Omit<AuditEvent, "id" | "timestamp">,
  ): Promise<string> {
    return await errorRecovery.withRecovery(
      async () => {
        const auditEvent: AuditEvent = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...event,
        };

        // Validate event
        this.validateAuditEvent(auditEvent);

        // Assess risk level if not provided
        if (!auditEvent.riskLevel) {
          auditEvent.riskLevel = this.assessRiskLevel(auditEvent);
        }

        // Check compliance
        auditEvent.complianceFlags = this.checkCompliance(auditEvent);

        // Add to queue for processing
        this.eventQueue.push(auditEvent);

        // Record performance metric
        performanceMonitor.recordMetric({
          name: "audit_event_logged",
          value: 1,
          type: "custom",
          metadata: {
            action: auditEvent.action,
            resource: auditEvent.resource,
            outcome: auditEvent.outcome,
            riskLevel: auditEvent.riskLevel,
          },
        });

        // Process immediately if high risk
        if (
          auditEvent.riskLevel === "critical" ||
          auditEvent.riskLevel === "high"
        ) {
          await this.processEvent(auditEvent);
        }

        console.log(
          `📝 Audit event logged: ${auditEvent.action} by ${auditEvent.userId}`,
        );
        return auditEvent.id;
      },
      {
        maxRetries: 3,
        fallbackValue: "",
      },
    );
  }

  /**
   * Query audit events
   */
  public async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    return await errorRecovery.withRecovery(
      async () => {
        let events = Array.from(this.events.values());

        // Apply filters
        if (query.startDate) {
          events = events.filter((e) => e.timestamp >= query.startDate!);
        }
        if (query.endDate) {
          events = events.filter((e) => e.timestamp <= query.endDate!);
        }
        if (query.userId) {
          events = events.filter((e) => e.userId === query.userId);
        }
        if (query.action) {
          events = events.filter((e) => e.action.includes(query.action!));
        }
        if (query.resource) {
          events = events.filter((e) => e.resource === query.resource);
        }
        if (query.outcome) {
          events = events.filter((e) => e.outcome === query.outcome);
        }
        if (query.riskLevel) {
          events = events.filter((e) => e.riskLevel === query.riskLevel);
        }

        // Sort by timestamp (newest first)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 100;
        events = events.slice(offset, offset + limit);

        return events;
      },
      {
        maxRetries: 2,
        fallbackValue: [],
      },
    );
  }

  /**
   * Generate audit report
   */
  public async generateReport(query: AuditQuery): Promise<AuditReport> {
    return await errorRecovery.withRecovery(
      async () => {
        const events = await this.queryEvents({
          ...query,
          limit: undefined,
          offset: undefined,
        });
        const totalEvents = events.length;

        if (totalEvents === 0) {
          return {
            totalEvents: 0,
            timeRange: { start: new Date(), end: new Date() },
            summary: {
              successRate: 0,
              failureRate: 0,
              warningRate: 0,
              riskDistribution: {},
              topActions: [],
              topUsers: [],
              complianceScore: 100,
            },
            events: [],
            recommendations: [],
          };
        }

        // Calculate summary statistics
        const successCount = events.filter(
          (e) => e.outcome === "success",
        ).length;
        const failureCount = events.filter(
          (e) => e.outcome === "failure",
        ).length;
        const warningCount = events.filter(
          (e) => e.outcome === "warning",
        ).length;

        const successRate = (successCount / totalEvents) * 100;
        const failureRate = (failureCount / totalEvents) * 100;
        const warningRate = (warningCount / totalEvents) * 100;

        // Risk distribution
        const riskDistribution: Record<string, number> = {};
        events.forEach((event) => {
          riskDistribution[event.riskLevel] =
            (riskDistribution[event.riskLevel] || 0) + 1;
        });

        // Top actions
        const actionCounts: Record<string, number> = {};
        events.forEach((event) => {
          actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
        });
        const topActions = Object.entries(actionCounts)
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Top users
        const userCounts: Record<string, number> = {};
        events.forEach((event) => {
          userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
        });
        const topUsers = Object.entries(userCounts)
          .map(([userId, count]) => ({ userId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Compliance score
        const complianceViolations = events.filter(
          (e) => e.complianceFlags.length > 0,
        ).length;
        const complianceScore = Math.max(
          0,
          100 - (complianceViolations / totalEvents) * 100,
        );

        // Generate recommendations
        const recommendations = this.generateRecommendations(events);

        const timeRange = {
          start: events[events.length - 1]?.timestamp || new Date(),
          end: events[0]?.timestamp || new Date(),
        };

        return {
          totalEvents,
          timeRange,
          summary: {
            successRate,
            failureRate,
            warningRate,
            riskDistribution,
            topActions,
            topUsers,
            complianceScore,
          },
          events: events.slice(0, query.limit || 100),
          recommendations,
        };
      },
      {
        maxRetries: 2,
        fallbackValue: {
          totalEvents: 0,
          timeRange: { start: new Date(), end: new Date() },
          summary: {
            successRate: 0,
            failureRate: 0,
            warningRate: 0,
            riskDistribution: {},
            topActions: [],
            topUsers: [],
            complianceScore: 0,
          },
          events: [],
          recommendations: [],
        },
      },
    );
  }

  /**
   * Get compliance metrics
   */
  public async getComplianceMetrics(): Promise<ComplianceMetrics> {
    return await errorRecovery.withRecovery(
      async () => {
        const events = Array.from(this.events.values());
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentEvents = events.filter((e) => e.timestamp >= last30Days);

        // HIPAA Compliance
        const hipaaViolations = recentEvents.filter((e) =>
          e.complianceFlags.includes("HIPAA_VIOLATION"),
        ).length;
        const hipaaScore = Math.max(
          0,
          100 - (hipaaViolations / recentEvents.length) * 100,
        );

        // DOH Compliance
        const dohViolations = recentEvents.filter((e) =>
          e.complianceFlags.includes("DOH_VIOLATION"),
        ).length;
        const dohScore = Math.max(
          0,
          100 - (dohViolations / recentEvents.length) * 100,
        );

        // JAWDA Compliance
        const jawdaViolations = recentEvents.filter((e) =>
          e.complianceFlags.includes("JAWDA_VIOLATION"),
        ).length;
        const jawdaScore = Math.max(
          0,
          100 - (jawdaViolations / recentEvents.length) * 100,
        );

        const overallScore = (hipaaScore + dohScore + jawdaScore) / 3;

        // Critical issues
        const criticalIssues = recentEvents
          .filter((e) => e.riskLevel === "critical")
          .map(
            (e) =>
              `${e.action} - ${e.details.description || "Critical security event"}`,
          )
          .slice(0, 10);

        return {
          hipaaCompliance: {
            score: hipaaScore,
            violations: hipaaViolations,
            lastAudit: new Date(),
            recommendations: this.getHIPAARecommendations(recentEvents),
          },
          dohCompliance: {
            score: dohScore,
            violations: dohViolations,
            lastAudit: new Date(),
            recommendations: this.getDOHRecommendations(recentEvents),
          },
          jawdaCompliance: {
            score: jawdaScore,
            violations: jawdaViolations,
            lastAudit: new Date(),
            recommendations: this.getJAWDARecommendations(recentEvents),
          },
          overallScore,
          criticalIssues,
        };
      },
      {
        maxRetries: 2,
        fallbackValue: {
          hipaaCompliance: {
            score: 0,
            violations: 0,
            lastAudit: new Date(),
            recommendations: [],
          },
          dohCompliance: {
            score: 0,
            violations: 0,
            lastAudit: new Date(),
            recommendations: [],
          },
          jawdaCompliance: {
            score: 0,
            violations: 0,
            lastAudit: new Date(),
            recommendations: [],
          },
          overallScore: 0,
          criticalIssues: [],
        },
      },
    );
  }

  // Private methods
  private validateAuditEvent(event: AuditEvent): void {
    if (!event.userId || !event.action || !event.resource) {
      throw new Error("Invalid audit event: missing required fields");
    }

    if (!event.ipAddress || !event.userAgent || !event.sessionId) {
      throw new Error("Invalid audit event: missing security context");
    }
  }

  private assessRiskLevel(
    event: AuditEvent,
  ): "low" | "medium" | "high" | "critical" {
    // High-risk actions
    const highRiskActions = [
      "DELETE_PATIENT",
      "EXPORT_DATA",
      "ADMIN_ACCESS",
      "PRIVILEGE_ESCALATION",
      "BULK_DATA_ACCESS",
    ];

    // Critical actions
    const criticalActions = [
      "SYSTEM_COMPROMISE",
      "DATA_BREACH",
      "UNAUTHORIZED_ACCESS",
      "SECURITY_VIOLATION",
    ];

    if (criticalActions.some((action) => event.action.includes(action))) {
      return "critical";
    }

    if (highRiskActions.some((action) => event.action.includes(action))) {
      return "high";
    }

    if (event.outcome === "failure") {
      return "medium";
    }

    return "low";
  }

  private checkCompliance(event: AuditEvent): string[] {
    const flags: string[] = [];

    // HIPAA compliance checks
    if (this.isHIPAAViolation(event)) {
      flags.push("HIPAA_VIOLATION");
    }

    // DOH compliance checks
    if (this.isDOHViolation(event)) {
      flags.push("DOH_VIOLATION");
    }

    // JAWDA compliance checks
    if (this.isJAWDAViolation(event)) {
      flags.push("JAWDA_VIOLATION");
    }

    return flags;
  }

  private isHIPAAViolation(event: AuditEvent): boolean {
    // Check for HIPAA violations
    const violations = [
      event.resource === "PATIENT_DATA" && event.outcome === "failure",
      event.action.includes("UNAUTHORIZED"),
      event.riskLevel === "critical",
    ];

    return violations.some((v) => v);
  }

  private isDOHViolation(event: AuditEvent): boolean {
    // Check for DOH violations
    const violations = [
      event.resource === "CLINICAL_DATA" && !event.details.authorized,
      event.action.includes("NON_COMPLIANT"),
    ];

    return violations.some((v) => v);
  }

  private isJAWDAViolation(event: AuditEvent): boolean {
    // Check for JAWDA violations
    const violations = [
      event.resource === "QUALITY_DATA" && event.outcome === "failure",
      event.action.includes("QUALITY_VIOLATION"),
    ];

    return violations.some((v) => v);
  }

  private async processEvent(event: AuditEvent): Promise<void> {
    // Store event
    this.events.set(event.id, event);

    // Check for alerts
    await this.checkAlerts(event);

    // Apply retention policy
    this.applyRetentionPolicy();
  }

  private async checkAlerts(event: AuditEvent): Promise<void> {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Check for suspicious activity patterns
    const recentEvents = Array.from(this.events.values()).filter(
      (e) =>
        e.userId === event.userId && e.timestamp.getTime() >= fiveMinutesAgo,
    );

    const failedAttempts = recentEvents.filter(
      (e) => e.outcome === "failure",
    ).length;

    if (failedAttempts >= this.alertThresholds.suspiciousActivity) {
      await this.triggerAlert({
        type: "SUSPICIOUS_ACTIVITY",
        severity: "high",
        message: `Suspicious activity detected: ${failedAttempts} failed attempts by user ${event.userId} in 5 minutes`,
        event,
      });
    }

    // Check for high-risk events
    if (event.riskLevel === "critical") {
      await this.triggerAlert({
        type: "CRITICAL_EVENT",
        severity: "critical",
        message: `Critical security event: ${event.action} by ${event.userId}`,
        event,
      });
    }

    // Check for compliance violations
    const hourlyComplianceViolations = Array.from(this.events.values()).filter(
      (e) =>
        e.timestamp.getTime() >= oneHourAgo && e.complianceFlags.length > 0,
    ).length;

    if (
      hourlyComplianceViolations >= this.alertThresholds.complianceViolations
    ) {
      await this.triggerAlert({
        type: "COMPLIANCE_VIOLATIONS",
        severity: "high",
        message: `High compliance violation rate: ${hourlyComplianceViolations} violations in the last hour`,
        event,
      });
    }

    // Check for bulk data access patterns
    const hourlyDataAccess = Array.from(this.events.values()).filter(
      (e) =>
        e.userId === event.userId &&
        e.timestamp.getTime() >= oneHourAgo &&
        (e.resource === "PATIENT_DATA" || e.action.includes("BULK_ACCESS")),
    ).length;

    if (hourlyDataAccess >= this.alertThresholds.dataAccess) {
      await this.triggerAlert({
        type: "EXCESSIVE_DATA_ACCESS",
        severity: "medium",
        message: `Excessive data access: ${hourlyDataAccess} patient records accessed by ${event.userId} in 1 hour`,
        event,
      });
    }

    // Check for after-hours access (assuming business hours are 8 AM - 6 PM)
    const eventHour = event.timestamp.getHours();
    const isAfterHours = eventHour < 8 || eventHour > 18;

    if (isAfterHours && event.resource === "PATIENT_DATA") {
      const afterHoursEvents = Array.from(this.events.values()).filter(
        (e) =>
          e.userId === event.userId &&
          e.timestamp.getTime() >= oneDayAgo &&
          (e.timestamp.getHours() < 8 || e.timestamp.getHours() > 18) &&
          e.resource === "PATIENT_DATA",
      ).length;

      if (afterHoursEvents >= this.alertThresholds.afterHoursAccess) {
        await this.triggerAlert({
          type: "AFTER_HOURS_ACCESS",
          severity: "medium",
          message: `Frequent after-hours access: ${afterHoursEvents} patient data access events by ${event.userId} outside business hours`,
          event,
        });
      }
    }

    // Check for privileged actions
    const privilegedActions = [
      "DELETE",
      "EXPORT",
      "ADMIN",
      "MODIFY_PERMISSIONS",
      "BULK_UPDATE",
    ];
    if (privilegedActions.some((action) => event.action.includes(action))) {
      const hourlyPrivilegedActions = Array.from(this.events.values()).filter(
        (e) =>
          e.userId === event.userId &&
          e.timestamp.getTime() >= oneHourAgo &&
          privilegedActions.some((action) => e.action.includes(action)),
      ).length;

      if (hourlyPrivilegedActions >= this.alertThresholds.privilegedActions) {
        await this.triggerAlert({
          type: "EXCESSIVE_PRIVILEGED_ACTIONS",
          severity: "high",
          message: `Excessive privileged actions: ${hourlyPrivilegedActions} privileged operations by ${event.userId} in 1 hour`,
          event,
        });
      }
    }

    // Check for data export patterns
    if (event.action.includes("EXPORT") || event.action.includes("DOWNLOAD")) {
      const dailyExports = Array.from(this.events.values()).filter(
        (e) =>
          e.userId === event.userId &&
          e.timestamp.getTime() >= oneDayAgo &&
          (e.action.includes("EXPORT") || e.action.includes("DOWNLOAD")),
      ).length;

      if (dailyExports >= this.alertThresholds.bulkDataExport) {
        await this.triggerAlert({
          type: "EXCESSIVE_DATA_EXPORT",
          severity: "high",
          message: `Excessive data export activity: ${dailyExports} export operations by ${event.userId} in 24 hours`,
          event,
        });
      }
    }
  }

  private async triggerAlert(alert: {
    type: string;
    severity: string;
    message: string;
    event: AuditEvent;
  }): Promise<void> {
    console.warn(
      `🚨 AUDIT ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`,
    );

    // Record alert as performance metric
    performanceMonitor.addAlert({
      type: alert.type,
      message: alert.message,
      timestamp: Date.now(),
      severity: alert.severity as any,
      metadata: {
        auditEventId: alert.event.id,
        userId: alert.event.userId,
        action: alert.event.action,
      },
    });
  }

  private generateRecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];

    const failureRate =
      events.filter((e) => e.outcome === "failure").length / events.length;
    if (failureRate > 0.1) {
      recommendations.push(
        "High failure rate detected. Review system stability and user training.",
      );
    }

    const criticalEvents = events.filter(
      (e) => e.riskLevel === "critical",
    ).length;
    if (criticalEvents > 0) {
      recommendations.push(
        `${criticalEvents} critical security events detected. Immediate investigation required.`,
      );
    }

    const complianceViolations = events.filter(
      (e) => e.complianceFlags.length > 0,
    ).length;
    if (complianceViolations > events.length * 0.05) {
      recommendations.push(
        "Compliance violations exceed 5% threshold. Review policies and procedures.",
      );
    }

    return recommendations;
  }

  private getHIPAARecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];
    const hipaaViolations = events.filter((e) =>
      e.complianceFlags.includes("HIPAA_VIOLATION"),
    );

    if (hipaaViolations.length > 0) {
      recommendations.push("Implement additional HIPAA training for staff");
      recommendations.push("Review access controls for patient data");
      recommendations.push("Enhance monitoring of PHI access");
    }

    return recommendations;
  }

  private getDOHRecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];
    const dohViolations = events.filter((e) =>
      e.complianceFlags.includes("DOH_VIOLATION"),
    );

    if (dohViolations.length > 0) {
      recommendations.push("Review DOH compliance procedures");
      recommendations.push("Update clinical documentation standards");
      recommendations.push("Implement DOH-specific audit controls");
    }

    return recommendations;
  }

  private getJAWDARecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];
    const jawdaViolations = events.filter((e) =>
      e.complianceFlags.includes("JAWDA_VIOLATION"),
    );

    if (jawdaViolations.length > 0) {
      recommendations.push("Enhance quality assurance processes");
      recommendations.push("Implement JAWDA quality standards");
      recommendations.push("Review quality metrics and reporting");
    }

    return recommendations;
  }

  private async initializeComplianceRules(): Promise<void> {
    // Initialize compliance checking rules
    console.log("📋 Initializing compliance rules...");
    console.log("✅ Compliance rules initialized");
  }

  private startEventProcessor(): void {
    setInterval(async () => {
      if (this.eventQueue.length > 0 && !this.isProcessing) {
        this.isProcessing = true;

        try {
          const eventsToProcess = this.eventQueue.splice(0, 100); // Process in batches

          for (const event of eventsToProcess) {
            await this.processEvent(event);
          }
        } catch (error) {
          console.error("❌ Error processing audit events:", error);
        } finally {
          this.isProcessing = false;
        }
      }
    }, 1000); // Process every second
  }

  private setupMonitoring(): void {
    setInterval(() => {
      const queueSize = this.eventQueue.length;
      const totalEvents = this.events.size;

      performanceMonitor.recordMetric({
        name: "audit_queue_size",
        value: queueSize,
        type: "custom",
      });

      performanceMonitor.recordMetric({
        name: "audit_total_events",
        value: totalEvents,
        type: "custom",
      });

      if (queueSize > 1000) {
        console.warn(`⚠️ Audit queue size is high: ${queueSize}`);
      }
    }, 30000); // Monitor every 30 seconds
  }

  private setupRetentionPolicy(): void {
    setInterval(
      () => {
        this.applyRetentionPolicy();
      },
      24 * 60 * 60 * 1000,
    ); // Run daily
  }

  private applyRetentionPolicy(): void {
    const cutoffDate = new Date(Date.now() - this.retentionPeriod);
    let removedCount = 0;

    this.events.forEach((event, id) => {
      if (event.timestamp < cutoffDate) {
        this.events.delete(id);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(`🗑️ Removed ${removedCount} expired audit events`);
    }
  }

  // Public utility methods
  public getEventCount(): number {
    return this.events.size;
  }

  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  public async exportEvents(
    query: AuditQuery,
    format: "json" | "csv" = "json",
  ): Promise<string> {
    const events = await this.queryEvents(query);

    if (format === "csv") {
      const headers = [
        "ID",
        "Timestamp",
        "User ID",
        "Action",
        "Resource",
        "Outcome",
        "Risk Level",
      ];
      const rows = events.map((e) => [
        e.id,
        e.timestamp.toISOString(),
        e.userId,
        e.action,
        e.resource,
        e.outcome,
        e.riskLevel,
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(events, null, 2);
  }

  public clearEvents(): void {
    this.events.clear();
    this.eventQueue = [];
    console.log("🧹 Audit events cleared");
  }
}

export const auditTrailService = AuditTrailService.getInstance();
export default auditTrailService;
