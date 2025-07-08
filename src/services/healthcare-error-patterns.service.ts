// Healthcare-Specific Error Patterns Service
// Implements medical error classification system with patient safety focus

import { EventEmitter } from "events";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface HealthcareError {
  id: string;
  type: HealthcareErrorType;
  severity: "low" | "medium" | "high" | "critical" | "catastrophic";
  category: HealthcareErrorCategory;
  patientId?: string;
  facilityId?: string;
  userId?: string;
  timestamp: Date;
  description: string;
  context: HealthcareErrorContext;
  patientSafetyImpact: PatientSafetyImpact;
  dohClassification?: DOHErrorClassification;
  rootCause?: string;
  contributingFactors: string[];
  preventionMeasures: string[];
  status: "new" | "investigating" | "resolved" | "escalated";
  escalationLevel: number;
  reportedToAuthorities: boolean;
}

type HealthcareErrorType = 
  | "medication-error"
  | "diagnostic-error"
  | "treatment-error"
  | "communication-error"
  | "documentation-error"
  | "system-error"
  | "workflow-error"
  | "compliance-error"
  | "data-integrity-error"
  | "security-breach";

type HealthcareErrorCategory = 
  | "patient-safety"
  | "clinical-quality"
  | "operational"
  | "regulatory-compliance"
  | "data-privacy"
  | "system-reliability";

interface HealthcareErrorContext {
  module: string;
  function: string;
  userRole?: string;
  patientContext?: {
    age?: number;
    condition?: string;
    riskLevel?: "low" | "medium" | "high";
    allergies?: string[];
  };
  clinicalContext?: {
    formType?: string;
    assessmentType?: string;
    treatmentPhase?: string;
    urgency?: "routine" | "urgent" | "emergency";
  };
  systemContext?: {
    version: string;
    environment: "development" | "staging" | "production";
    loadLevel?: "low" | "medium" | "high";
  };
}

interface PatientSafetyImpact {
  level: "none" | "minimal" | "moderate" | "significant" | "severe";
  description: string;
  potentialHarm: string[];
  actualHarm?: string;
  preventedHarm?: string;
  requiresImmediateAction: boolean;
  requiresPatientNotification: boolean;
}

interface DOHErrorClassification {
  category: string;
  subcategory: string;
  reportingRequired: boolean;
  timelineForReporting: number; // hours
  regulatoryImpact: "low" | "medium" | "high";
}

interface ErrorPattern {
  id: string;
  name: string;
  description: string;
  conditions: ErrorPatternCondition[];
  actions: ErrorPatternAction[];
  priority: number;
  enabled: boolean;
}

interface ErrorPatternCondition {
  field: string;
  operator: "equals" | "contains" | "matches" | "greater_than" | "less_than";
  value: any;
  weight: number;
}

interface ErrorPatternAction {
  type: "escalate" | "notify" | "log" | "report" | "block" | "retry";
  parameters: Record<string, any>;
  delay?: number;
}

interface HealthcareErrorMetrics {
  totalErrors: number;
  errorsByType: Record<HealthcareErrorType, number>;
  errorsByCategory: Record<HealthcareErrorCategory, number>;
  errorsBySeverity: Record<string, number>;
  patientSafetyEvents: number;
  regulatoryReports: number;
  averageResolutionTime: number;
  preventedIncidents: number;
  trendAnalysis: {
    increasing: HealthcareErrorType[];
    decreasing: HealthcareErrorType[];
    stable: HealthcareErrorType[];
  };
}

class HealthcareErrorPatternsService extends EventEmitter {
  private errorHistory: HealthcareError[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private metrics: HealthcareErrorMetrics;
  private patternMatchingEnabled = true;
  private realTimeMonitoring = true;

  constructor() {
    super();
    
    this.metrics = {
      totalErrors: 0,
      errorsByType: {} as Record<HealthcareErrorType, number>,
      errorsByCategory: {} as Record<HealthcareErrorCategory, number>,
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
        catastrophic: 0,
      },
      patientSafetyEvents: 0,
      regulatoryReports: 0,
      averageResolutionTime: 0,
      preventedIncidents: 0,
      trendAnalysis: {
        increasing: [],
        decreasing: [],
        stable: [],
      },
    };

    this.initializeDefaultPatterns();
    this.startMetricsCollection();
    this.startTrendAnalysis();
    
    console.log("✅ Healthcare Error Patterns Service initialized");
  }

  private initializeDefaultPatterns(): void {
    const defaultPatterns: ErrorPattern[] = [
      {
        id: "medication-dosage-error",
        name: "Medication Dosage Error",
        description: "Detects potential medication dosage errors",
        conditions: [
          { field: "type", operator: "equals", value: "medication-error", weight: 1.0 },
          { field: "description", operator: "contains", value: "dosage", weight: 0.8 },
        ],
        actions: [
          { type: "escalate", parameters: { level: 3, immediate: true } },
          { type: "notify", parameters: { roles: ["pharmacist", "physician"], urgent: true } },
          { type: "block", parameters: { action: "medication-administration" } },
        ],
        priority: 1,
        enabled: true,
      },
      {
        id: "patient-identification-error",
        name: "Patient Identification Error",
        description: "Detects patient identification mismatches",
        conditions: [
          { field: "type", operator: "equals", value: "system-error", weight: 0.7 },
          { field: "description", operator: "contains", value: "patient ID", weight: 0.9 },
        ],
        actions: [
          { type: "escalate", parameters: { level: 2, immediate: true } },
          { type: "log", parameters: { level: "critical", audit: true } },
          { type: "notify", parameters: { roles: ["nurse-manager", "it-support"] } },
        ],
        priority: 2,
        enabled: true,
      },
      {
        id: "documentation-compliance-error",
        name: "Documentation Compliance Error",
        description: "Detects DOH compliance documentation issues",
        conditions: [
          { field: "type", operator: "equals", value: "compliance-error", weight: 1.0 },
          { field: "category", operator: "equals", value: "regulatory-compliance", weight: 0.8 },
        ],
        actions: [
          { type: "report", parameters: { authority: "DOH", timeline: 24 } },
          { type: "notify", parameters: { roles: ["compliance-officer", "quality-manager"] } },
          { type: "log", parameters: { level: "high", regulatory: true } },
        ],
        priority: 3,
        enabled: true,
      },
      {
        id: "critical-system-failure",
        name: "Critical System Failure",
        description: "Detects critical system failures affecting patient care",
        conditions: [
          { field: "severity", operator: "equals", value: "critical", weight: 1.0 },
          { field: "category", operator: "equals", value: "system-reliability", weight: 0.9 },
        ],
        actions: [
          { type: "escalate", parameters: { level: 4, immediate: true } },
          { type: "notify", parameters: { roles: ["it-director", "cio", "medical-director"], urgent: true } },
          { type: "log", parameters: { level: "catastrophic", immediate: true } },
        ],
        priority: 1,
        enabled: true,
      },
      {
        id: "data-privacy-breach",
        name: "Data Privacy Breach",
        description: "Detects potential patient data privacy breaches",
        conditions: [
          { field: "type", operator: "equals", value: "security-breach", weight: 1.0 },
          { field: "category", operator: "equals", value: "data-privacy", weight: 1.0 },
        ],
        actions: [
          { type: "escalate", parameters: { level: 4, immediate: true } },
          { type: "report", parameters: { authority: "DHA", timeline: 2 } },
          { type: "notify", parameters: { roles: ["privacy-officer", "legal", "ciso"], urgent: true } },
          { type: "block", parameters: { action: "data-access", scope: "affected-records" } },
        ],
        priority: 1,
        enabled: true,
      },
    ];

    defaultPatterns.forEach(pattern => {
      this.errorPatterns.set(pattern.id, pattern);
    });

    console.log(`✅ Loaded ${defaultPatterns.length} default error patterns`);
  }

  async classifyAndProcessError(error: any, context: HealthcareErrorContext): Promise<HealthcareError> {
    const healthcareError = await this.classifyError(error, context);
    
    // Store error
    this.errorHistory.push(healthcareError);
    
    // Update metrics
    this.updateMetrics(healthcareError);
    
    // Apply pattern matching
    if (this.patternMatchingEnabled) {
      await this.applyPatternMatching(healthcareError);
    }
    
    // Real-time monitoring
    if (this.realTimeMonitoring) {
      this.performRealTimeAnalysis(healthcareError);
    }
    
    console.log(`🏥 Healthcare error classified: ${healthcareError.id} (${healthcareError.type})`);
    this.emit("error-classified", healthcareError);
    
    return healthcareError;
  }

  private async classifyError(error: any, context: HealthcareErrorContext): Promise<HealthcareError> {
    const errorType = this.determineErrorType(error, context);
    const severity = this.determineSeverity(error, context, errorType);
    const category = this.determineCategory(errorType);
    const patientSafetyImpact = this.assessPatientSafetyImpact(error, context, severity);
    const dohClassification = this.getDOHClassification(errorType, severity);
    
    const healthcareError: HealthcareError = {
      id: `he-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: errorType,
      severity,
      category,
      patientId: context.patientContext ? this.extractPatientId(context) : undefined,
      facilityId: "RHHCS-001", // Default facility ID
      userId: this.extractUserId(context),
      timestamp: new Date(),
      description: this.generateErrorDescription(error, context),
      context,
      patientSafetyImpact,
      dohClassification,
      rootCause: await this.analyzeRootCause(error, context),
      contributingFactors: this.identifyContributingFactors(error, context),
      preventionMeasures: this.suggestPreventionMeasures(errorType, context),
      status: "new",
      escalationLevel: this.determineEscalationLevel(severity, patientSafetyImpact),
      reportedToAuthorities: false,
    };
    
    return healthcareError;
  }

  private determineErrorType(error: any, context: HealthcareErrorContext): HealthcareErrorType {
    const message = error.message?.toLowerCase() || "";
    const module = context.module?.toLowerCase() || "";
    
    // Medication-related errors
    if (message.includes("medication") || message.includes("drug") || message.includes("dosage") || 
        module.includes("medication") || module.includes("pharmacy")) {
      return "medication-error";
    }
    
    // Documentation errors
    if (message.includes("form") || message.includes("document") || message.includes("signature") ||
        module.includes("clinical") || module.includes("assessment")) {
      return "documentation-error";
    }
    
    // Communication errors
    if (message.includes("notification") || message.includes("message") || message.includes("alert") ||
        module.includes("communication") || module.includes("notification")) {
      return "communication-error";
    }
    
    // Compliance errors
    if (message.includes("compliance") || message.includes("regulation") || message.includes("doh") ||
        module.includes("compliance") || module.includes("audit")) {
      return "compliance-error";
    }
    
    // Security breaches
    if (message.includes("unauthorized") || message.includes("breach") || message.includes("security") ||
        module.includes("security") || module.includes("auth")) {
      return "security-breach";
    }
    
    // Data integrity errors
    if (message.includes("data") || message.includes("database") || message.includes("sync") ||
        module.includes("data") || module.includes("sync")) {
      return "data-integrity-error";
    }
    
    // Default to system error
    return "system-error";
  }

  private determineSeverity(error: any, context: HealthcareErrorContext, type: HealthcareErrorType): HealthcareError["severity"] {
    // Critical types always get high severity
    if (type === "medication-error" || type === "security-breach") {
      return "critical";
    }
    
    // Emergency context increases severity
    if (context.clinicalContext?.urgency === "emergency") {
      return "critical";
    }
    
    // High-risk patients increase severity
    if (context.patientContext?.riskLevel === "high") {
      return "high";
    }
    
    // Production environment increases severity
    if (context.systemContext?.environment === "production") {
      return "high";
    }
    
    // Default based on error characteristics
    if (error.stack?.includes("TypeError") || error.stack?.includes("ReferenceError")) {
      return "medium";
    }
    
    return "low";
  }

  private determineCategory(type: HealthcareErrorType): HealthcareErrorCategory {
    switch (type) {
      case "medication-error":
      case "diagnostic-error":
      case "treatment-error":
        return "patient-safety";
      case "documentation-error":
        return "clinical-quality";
      case "compliance-error":
        return "regulatory-compliance";
      case "security-breach":
        return "data-privacy";
      case "system-error":
      case "workflow-error":
        return "system-reliability";
      default:
        return "operational";
    }
  }

  private assessPatientSafetyImpact(error: any, context: HealthcareErrorContext, severity: HealthcareError["severity"]): PatientSafetyImpact {
    let level: PatientSafetyImpact["level"] = "none";
    let potentialHarm: string[] = [];
    let requiresImmediateAction = false;
    let requiresPatientNotification = false;
    
    if (severity === "critical" || severity === "catastrophic") {
      level = "severe";
      requiresImmediateAction = true;
      requiresPatientNotification = true;
      potentialHarm = ["Serious injury", "Life-threatening situation", "Permanent disability"];
    } else if (severity === "high") {
      level = "significant";
      requiresImmediateAction = true;
      potentialHarm = ["Temporary harm", "Delayed treatment", "Increased risk"];
    } else if (severity === "medium") {
      level = "moderate";
      potentialHarm = ["Minor inconvenience", "Delayed care"];
    } else {
      level = "minimal";
      potentialHarm = ["No direct patient impact"];
    }
    
    return {
      level,
      description: `Patient safety impact assessed as ${level} based on error severity and context`,
      potentialHarm,
      requiresImmediateAction,
      requiresPatientNotification,
    };
  }

  private getDOHClassification(type: HealthcareErrorType, severity: HealthcareError["severity"]): DOHErrorClassification {
    const requiresReporting = severity === "critical" || severity === "catastrophic" || 
                             type === "medication-error" || type === "security-breach";
    
    return {
      category: this.mapToDOHCategory(type),
      subcategory: this.mapToDOHSubcategory(type),
      reportingRequired: requiresReporting,
      timelineForReporting: requiresReporting ? (severity === "catastrophic" ? 2 : 24) : 0,
      regulatoryImpact: severity === "critical" || severity === "catastrophic" ? "high" : "medium",
    };
  }

  private mapToDOHCategory(type: HealthcareErrorType): string {
    switch (type) {
      case "medication-error":
        return "Medication Safety";
      case "diagnostic-error":
        return "Diagnostic Safety";
      case "treatment-error":
        return "Treatment Safety";
      case "documentation-error":
        return "Documentation Quality";
      case "compliance-error":
        return "Regulatory Compliance";
      case "security-breach":
        return "Data Security";
      default:
        return "System Quality";
    }
  }

  private mapToDOHSubcategory(type: HealthcareErrorType): string {
    switch (type) {
      case "medication-error":
        return "Prescription/Administration Error";
      case "diagnostic-error":
        return "Misdiagnosis/Delayed Diagnosis";
      case "treatment-error":
        return "Treatment Protocol Deviation";
      case "documentation-error":
        return "Incomplete/Inaccurate Documentation";
      case "compliance-error":
        return "Regulatory Non-compliance";
      case "security-breach":
        return "Patient Data Breach";
      default:
        return "System Malfunction";
    }
  }

  private async analyzeRootCause(error: any, context: HealthcareErrorContext): Promise<string> {
    // Simplified root cause analysis
    const factors = [];
    
    if (error.stack?.includes("TypeError")) {
      factors.push("Data type mismatch");
    }
    
    if (error.stack?.includes("ReferenceError")) {
      factors.push("Missing reference or undefined variable");
    }
    
    if (context.systemContext?.loadLevel === "high") {
      factors.push("High system load");
    }
    
    if (context.userRole === "new-user") {
      factors.push("User training/experience factor");
    }
    
    return factors.length > 0 ? factors.join("; ") : "Root cause analysis pending";
  }

  private identifyContributingFactors(error: any, context: HealthcareErrorContext): string[] {
    const factors = [];
    
    if (context.systemContext?.environment === "production") {
      factors.push("Production environment stress");
    }
    
    if (context.clinicalContext?.urgency === "emergency") {
      factors.push("Emergency situation pressure");
    }
    
    if (context.patientContext?.riskLevel === "high") {
      factors.push("High-risk patient complexity");
    }
    
    return factors;
  }

  private suggestPreventionMeasures(type: HealthcareErrorType, context: HealthcareErrorContext): string[] {
    const measures = [];
    
    switch (type) {
      case "medication-error":
        measures.push("Implement double-check verification");
        measures.push("Use barcode scanning for medication administration");
        measures.push("Provide additional pharmacology training");
        break;
      case "documentation-error":
        measures.push("Implement mandatory field validation");
        measures.push("Provide documentation training");
        measures.push("Use structured templates");
        break;
      case "system-error":
        measures.push("Implement better error handling");
        measures.push("Add system monitoring");
        measures.push("Provide user training on system recovery");
        break;
    }
    
    return measures;
  }

  private extractPatientId(context: HealthcareErrorContext): string | undefined {
    // Extract patient ID from context or error data
    return undefined; // Placeholder
  }

  private extractUserId(context: HealthcareErrorContext): string | undefined {
    // Extract user ID from context
    return undefined; // Placeholder
  }

  private generateErrorDescription(error: any, context: HealthcareErrorContext): string {
    return `${error.message || "Unknown error"} in ${context.module}.${context.function}`;
  }

  private determineEscalationLevel(severity: HealthcareError["severity"], impact: PatientSafetyImpact): number {
    if (severity === "catastrophic" || impact.level === "severe") {
      return 4; // Executive level
    } else if (severity === "critical" || impact.level === "significant") {
      return 3; // Department head level
    } else if (severity === "high" || impact.level === "moderate") {
      return 2; // Supervisor level
    } else {
      return 1; // Team lead level
    }
  }

  private async applyPatternMatching(error: HealthcareError): Promise<void> {
    for (const pattern of this.errorPatterns.values()) {
      if (!pattern.enabled) continue;
      
      const matchScore = this.calculatePatternMatch(error, pattern);
      
      if (matchScore >= 0.7) { // 70% match threshold
        console.log(`🎯 Pattern matched: ${pattern.name} (score: ${matchScore.toFixed(2)})`);
        await this.executePatternActions(error, pattern);
        this.emit("pattern-matched", { error, pattern, score: matchScore });
      }
    }
  }

  private calculatePatternMatch(error: HealthcareError, pattern: ErrorPattern): number {
    let totalWeight = 0;
    let matchedWeight = 0;
    
    for (const condition of pattern.conditions) {
      totalWeight += condition.weight;
      
      if (this.evaluateCondition(error, condition)) {
        matchedWeight += condition.weight;
      }
    }
    
    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  private evaluateCondition(error: HealthcareError, condition: ErrorPatternCondition): boolean {
    const fieldValue = this.getFieldValue(error, condition.field);
    
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case "matches":
        return new RegExp(condition.value).test(String(fieldValue));
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  private getFieldValue(error: HealthcareError, field: string): any {
    const parts = field.split(".");
    let value: any = error;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private async executePatternActions(error: HealthcareError, pattern: ErrorPattern): Promise<void> {
    for (const action of pattern.actions) {
      try {
        if (action.delay) {
          setTimeout(() => this.executeAction(error, action), action.delay);
        } else {
          await this.executeAction(error, action);
        }
      } catch (actionError) {
        console.error(`❌ Failed to execute pattern action:`, actionError);
      }
    }
  }

  private async executeAction(error: HealthcareError, action: ErrorPatternAction): Promise<void> {
    switch (action.type) {
      case "escalate":
        await this.escalateError(error, action.parameters);
        break;
      case "notify":
        await this.notifyStakeholders(error, action.parameters);
        break;
      case "log":
        await this.logError(error, action.parameters);
        break;
      case "report":
        await this.reportToAuthorities(error, action.parameters);
        break;
      case "block":
        await this.blockAction(error, action.parameters);
        break;
      case "retry":
        await this.retryOperation(error, action.parameters);
        break;
    }
  }

  private async escalateError(error: HealthcareError, parameters: any): Promise<void> {
    error.escalationLevel = Math.max(error.escalationLevel, parameters.level || 1);
    error.status = "escalated";
    
    console.log(`⬆️ Error escalated to level ${error.escalationLevel}: ${error.id}`);
    this.emit("error-escalated", { error, level: error.escalationLevel });
  }

  private async notifyStakeholders(error: HealthcareError, parameters: any): Promise<void> {
    const roles = parameters.roles || [];
    const urgent = parameters.urgent || false;
    
    console.log(`📢 Notifying stakeholders: ${roles.join(", ")} for error ${error.id}`);
    this.emit("stakeholder-notification", { error, roles, urgent });
  }

  private async logError(error: HealthcareError, parameters: any): Promise<void> {
    const level = parameters.level || "info";
    const audit = parameters.audit || false;
    
    console.log(`📝 Logging error ${error.id} at level ${level}`);
    
    if (audit) {
      this.emit("audit-log", error);
    }
  }

  private async reportToAuthorities(error: HealthcareError, parameters: any): Promise<void> {
    const authority = parameters.authority;
    const timeline = parameters.timeline;
    
    error.reportedToAuthorities = true;
    this.metrics.regulatoryReports++;
    
    console.log(`📋 Reporting error ${error.id} to ${authority} within ${timeline} hours`);
    this.emit("regulatory-report", { error, authority, timeline });
  }

  private async blockAction(error: HealthcareError, parameters: any): Promise<void> {
    const action = parameters.action;
    const scope = parameters.scope;
    
    console.log(`🚫 Blocking action ${action} for error ${error.id}`);
    this.emit("action-blocked", { error, action, scope });
  }

  private async retryOperation(error: HealthcareError, parameters: any): Promise<void> {
    const maxRetries = parameters.maxRetries || 3;
    const delay = parameters.delay || 1000;
    
    console.log(`🔄 Retrying operation for error ${error.id}`);
    this.emit("operation-retry", { error, maxRetries, delay });
  }

  private performRealTimeAnalysis(error: HealthcareError): void {
    // Check for error clustering
    const recentErrors = this.errorHistory.filter(
      e => e.timestamp.getTime() > Date.now() - 300000 // Last 5 minutes
    );
    
    if (recentErrors.length > 10) {
      console.log(`⚠️ Error clustering detected: ${recentErrors.length} errors in 5 minutes`);
      this.emit("error-clustering", { count: recentErrors.length, errors: recentErrors });
    }
    
    // Check for critical error patterns
    const criticalErrors = recentErrors.filter(e => e.severity === "critical" || e.severity === "catastrophic");
    
    if (criticalErrors.length > 2) {
      console.log(`🚨 Multiple critical errors detected: ${criticalErrors.length}`);
      this.emit("critical-error-pattern", { count: criticalErrors.length, errors: criticalErrors });
    }
  }

  private updateMetrics(error: HealthcareError): void {
    this.metrics.totalErrors++;
    
    // Update by type
    this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1;
    
    // Update by category
    this.metrics.errorsByCategory[error.category] = (this.metrics.errorsByCategory[error.category] || 0) + 1;
    
    // Update by severity
    this.metrics.errorsBySeverity[error.severity]++;
    
    // Update patient safety events
    if (error.patientSafetyImpact.level !== "none" && error.patientSafetyImpact.level !== "minimal") {
      this.metrics.patientSafetyEvents++;
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.reportMetrics();
    }, 300000); // Every 5 minutes
  }

  private startTrendAnalysis(): void {
    setInterval(() => {
      this.performTrendAnalysis();
    }, 3600000); // Every hour
  }

  private performTrendAnalysis(): void {
    // Analyze trends over the last 24 hours vs previous 24 hours
    const now = Date.now();
    const last24h = this.errorHistory.filter(e => e.timestamp.getTime() > now - 86400000);
    const previous24h = this.errorHistory.filter(
      e => e.timestamp.getTime() > now - 172800000 && e.timestamp.getTime() <= now - 86400000
    );
    
    const currentCounts = this.countErrorsByType(last24h);
    const previousCounts = this.countErrorsByType(previous24h);
    
    this.metrics.trendAnalysis = {
      increasing: [],
      decreasing: [],
      stable: [],
    };
    
    for (const type of Object.keys(currentCounts) as HealthcareErrorType[]) {
      const current = currentCounts[type] || 0;
      const previous = previousCounts[type] || 0;
      
      if (current > previous * 1.2) {
        this.metrics.trendAnalysis.increasing.push(type);
      } else if (current < previous * 0.8) {
        this.metrics.trendAnalysis.decreasing.push(type);
      } else {
        this.metrics.trendAnalysis.stable.push(type);
      }
    }
    
    if (this.metrics.trendAnalysis.increasing.length > 0) {
      console.log(`📈 Increasing error trends: ${this.metrics.trendAnalysis.increasing.join(", ")}`);
      this.emit("trend-analysis", this.metrics.trendAnalysis);
    }
  }

  private countErrorsByType(errors: HealthcareError[]): Record<HealthcareErrorType, number> {
    const counts = {} as Record<HealthcareErrorType, number>;
    
    for (const error of errors) {
      counts[error.type] = (counts[error.type] || 0) + 1;
    }
    
    return counts;
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
