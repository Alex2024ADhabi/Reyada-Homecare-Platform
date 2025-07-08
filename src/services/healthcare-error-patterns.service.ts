/**
 * Healthcare-Specific Error Patterns Service
 * Specialized error handling for healthcare operations with DOH compliance
 */

import {
  errorHandlerService,
  ErrorReport,
  ErrorContext,
} from "./error-handler.service";

export interface HealthcareErrorPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp | string;
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "patient_safety"
    | "doh_compliance"
    | "clinical_workflow"
    | "data_integrity"
    | "system_availability";
  healthcareImpact: "none" | "low" | "medium" | "high" | "critical";
  dohCompliant: boolean;
  patientSafetyRisk: boolean;
  escalationRequired: boolean;
  recoveryStrategy: string;
  preventionMeasures: string[];
  complianceActions: string[];
}

export interface PatientSafetyError {
  errorId: string;
  patientId?: string;
  episodeId?: string;
  safetyLevel: "low" | "medium" | "high" | "critical";
  clinicalImpact: string;
  immediateActions: string[];
  followUpRequired: boolean;
  reportingRequired: boolean;
  dohNotificationRequired: boolean;
}

export interface DOHComplianceError {
  errorId: string;
  complianceStandard: "doh_nine_domains" | "jawda" | "hipaa" | "general";
  violationType:
    | "documentation"
    | "privacy"
    | "security"
    | "quality"
    | "safety";
  riskLevel: "low" | "medium" | "high" | "critical";
  regulatoryActions: string[];
  auditTrailRequired: boolean;
  reportingDeadline?: string;
  remediationSteps: string[];
}

class HealthcareErrorPatternsService {
  private static instance: HealthcareErrorPatternsService;
  private errorPatterns: Map<string, HealthcareErrorPattern> = new Map();
  private patientSafetyErrors: Map<string, PatientSafetyError> = new Map();
  private dohComplianceErrors: Map<string, DOHComplianceError> = new Map();
  private isInitialized = false;

  public static getInstance(): HealthcareErrorPatternsService {
    if (!HealthcareErrorPatternsService.instance) {
      HealthcareErrorPatternsService.instance =
        new HealthcareErrorPatternsService();
    }
    return HealthcareErrorPatternsService.instance;
  }

  constructor() {
    this.initializeHealthcareErrorPatterns();
    this.setupErrorHandlerIntegration();
  }

  /**
   * Initialize healthcare-specific error patterns
   */
  private initializeHealthcareErrorPatterns(): void {
    // Patient Safety Error Patterns
    this.errorPatterns.set("patient_data_corruption", {
      id: "patient_data_corruption",
      name: "Patient Data Corruption",
      description: "Critical error affecting patient data integrity",
      pattern: /patient.*data.*(corrupt|invalid|missing|lost)/i,
      severity: "critical",
      category: "patient_safety",
      healthcareImpact: "critical",
      dohCompliant: true,
      patientSafetyRisk: true,
      escalationRequired: true,
      recoveryStrategy: "immediate_data_recovery",
      preventionMeasures: [
        "Implement data validation checks",
        "Enable real-time data backup",
        "Add data integrity monitoring",
        "Implement checksums for patient data",
      ],
      complianceActions: [
        "Create patient safety incident report",
        "Notify DOH within 24 hours",
        "Document data recovery actions",
        "Review data handling procedures",
      ],
    });

    this.errorPatterns.set("medication_error", {
      id: "medication_error",
      name: "Medication Administration Error",
      description: "Error in medication management or administration",
      pattern:
        /medication.*(error|wrong|incorrect|missing|overdose|underdose)/i,
      severity: "critical",
      category: "patient_safety",
      healthcareImpact: "critical",
      dohCompliant: true,
      patientSafetyRisk: true,
      escalationRequired: true,
      recoveryStrategy: "medication_safety_protocol",
      preventionMeasures: [
        "Implement medication verification system",
        "Add double-check protocols",
        "Enable medication alerts",
        "Implement barcode scanning",
      ],
      complianceActions: [
        "Immediate clinical review",
        "Patient safety officer notification",
        "Medication error report",
        "DOH incident notification",
      ],
    });

    this.errorPatterns.set("clinical_assessment_failure", {
      id: "clinical_assessment_failure",
      name: "Clinical Assessment Failure",
      description: "Failure in clinical assessment or documentation",
      pattern:
        /clinical.*(assessment|evaluation).*(fail|error|incomplete|missing)/i,
      severity: "high",
      category: "clinical_workflow",
      healthcareImpact: "high",
      dohCompliant: true,
      patientSafetyRisk: true,
      escalationRequired: true,
      recoveryStrategy: "clinical_workflow_recovery",
      preventionMeasures: [
        "Implement assessment validation",
        "Add clinical decision support",
        "Enable assessment reminders",
        "Implement peer review process",
      ],
      complianceActions: [
        "Clinical supervisor review",
        "Assessment completion tracking",
        "Quality assurance review",
        "DOH nine domains compliance check",
      ],
    });

    // DOH Compliance Error Patterns
    this.errorPatterns.set("doh_documentation_violation", {
      id: "doh_documentation_violation",
      name: "DOH Documentation Violation",
      description: "Violation of DOH documentation standards",
      pattern:
        /doh.*(documentation|standard).*(violation|non.?compliant|missing|incomplete)/i,
      severity: "high",
      category: "doh_compliance",
      healthcareImpact: "medium",
      dohCompliant: false,
      patientSafetyRisk: false,
      escalationRequired: true,
      recoveryStrategy: "doh_compliance_recovery",
      preventionMeasures: [
        "Implement DOH standard validation",
        "Add compliance checking",
        "Enable documentation templates",
        "Implement audit trails",
      ],
      complianceActions: [
        "DOH compliance officer notification",
        "Documentation review and correction",
        "Compliance audit scheduling",
        "Staff training on DOH standards",
      ],
    });

    this.errorPatterns.set("jawda_quality_violation", {
      id: "jawda_quality_violation",
      name: "JAWDA Quality Standards Violation",
      description: "Violation of JAWDA quality standards",
      pattern: /jawda.*(quality|standard).*(violation|non.?compliant|fail)/i,
      severity: "high",
      category: "doh_compliance",
      healthcareImpact: "medium",
      dohCompliant: false,
      patientSafetyRisk: false,
      escalationRequired: true,
      recoveryStrategy: "jawda_compliance_recovery",
      preventionMeasures: [
        "Implement JAWDA KPI monitoring",
        "Add quality metrics tracking",
        "Enable performance dashboards",
        "Implement continuous improvement",
      ],
      complianceActions: [
        "Quality assurance review",
        "JAWDA compliance assessment",
        "Performance improvement plan",
        "Quality metrics reporting",
      ],
    });

    // Data Integrity Error Patterns
    this.errorPatterns.set("hipaa_privacy_violation", {
      id: "hipaa_privacy_violation",
      name: "HIPAA Privacy Violation",
      description: "Violation of HIPAA privacy requirements",
      pattern:
        /hipaa.*(privacy|security).*(violation|breach|unauthorized|access)/i,
      severity: "critical",
      category: "data_integrity",
      healthcareImpact: "high",
      dohCompliant: false,
      patientSafetyRisk: false,
      escalationRequired: true,
      recoveryStrategy: "privacy_breach_response",
      preventionMeasures: [
        "Implement access controls",
        "Add audit logging",
        "Enable encryption",
        "Implement user training",
      ],
      complianceActions: [
        "Privacy officer notification",
        "Breach assessment",
        "Patient notification if required",
        "Regulatory reporting",
      ],
    });

    // System Availability Error Patterns
    this.errorPatterns.set("clinical_system_downtime", {
      id: "clinical_system_downtime",
      name: "Clinical System Downtime",
      description: "Critical clinical system unavailability",
      pattern:
        /clinical.*(system|service).*(down|unavailable|offline|timeout)/i,
      severity: "critical",
      category: "system_availability",
      healthcareImpact: "critical",
      dohCompliant: true,
      patientSafetyRisk: true,
      escalationRequired: true,
      recoveryStrategy: "system_recovery_protocol",
      preventionMeasures: [
        "Implement system redundancy",
        "Add health monitoring",
        "Enable automatic failover",
        "Implement backup systems",
      ],
      complianceActions: [
        "Activate emergency protocols",
        "Switch to manual processes",
        "Notify clinical staff",
        "Document downtime impact",
      ],
    });

    this.errorPatterns.set("emergency_system_failure", {
      id: "emergency_system_failure",
      name: "Emergency System Failure",
      description: "Failure of emergency or life-critical systems",
      pattern: /emergency.*(system|protocol).*(fail|error|down|critical)/i,
      severity: "critical",
      category: "patient_safety",
      healthcareImpact: "critical",
      dohCompliant: true,
      patientSafetyRisk: true,
      escalationRequired: true,
      recoveryStrategy: "emergency_response_protocol",
      preventionMeasures: [
        "Implement emergency system redundancy",
        "Add real-time monitoring",
        "Enable immediate alerts",
        "Implement manual backup procedures",
      ],
      complianceActions: [
        "Activate emergency response team",
        "Switch to manual emergency protocols",
        "Notify all clinical staff immediately",
        "Document emergency response actions",
      ],
    });

    console.log(
      `🏥 Initialized ${this.errorPatterns.size} healthcare error patterns`,
    );
    this.isInitialized = true;
  }

  /**
   * Setup integration with main error handler
   */
  private setupErrorHandlerIntegration(): void {
    errorHandlerService.on("error-occurred", (errorReport: ErrorReport) => {
      this.analyzeHealthcareError(errorReport);
    });
  }

  /**
   * Analyze error against healthcare patterns
   */
  private analyzeHealthcareError(errorReport: ErrorReport): void {
    const matchedPatterns: HealthcareErrorPattern[] = [];

    // Check error message against all patterns
    for (const pattern of this.errorPatterns.values()) {
      if (this.matchesPattern(errorReport.message, pattern.pattern)) {
        matchedPatterns.push(pattern);
      }
    }

    // Process matched patterns
    for (const pattern of matchedPatterns) {
      this.processHealthcareErrorPattern(errorReport, pattern);
    }

    // If no specific patterns matched but it's healthcare-related
    if (matchedPatterns.length === 0 && this.isHealthcareRelated(errorReport)) {
      this.processGenericHealthcareError(errorReport);
    }
  }

  /**
   * Check if error message matches pattern
   */
  private matchesPattern(message: string, pattern: RegExp | string): boolean {
    if (pattern instanceof RegExp) {
      return pattern.test(message);
    } else {
      return message.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  /**
   * Check if error is healthcare-related
   */
  private isHealthcareRelated(errorReport: ErrorReport): boolean {
    const message = errorReport.message.toLowerCase();
    const context = errorReport.context.context.toLowerCase();

    const healthcareKeywords = [
      "patient",
      "clinical",
      "medical",
      "healthcare",
      "episode",
      "assessment",
      "care",
      "treatment",
      "diagnosis",
      "medication",
      "doh",
      "jawda",
      "hipaa",
      "compliance",
      "audit",
    ];

    return (
      healthcareKeywords.some(
        (keyword) => message.includes(keyword) || context.includes(keyword),
      ) ||
      !!errorReport.context.patientId ||
      !!errorReport.context.episodeId
    );
  }

  /**
   * Process healthcare error pattern
   */
  private processHealthcareErrorPattern(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): void {
    console.log(`🏥 Processing healthcare error pattern: ${pattern.name}`);

    // Create patient safety error if applicable
    if (pattern.patientSafetyRisk) {
      this.createPatientSafetyError(errorReport, pattern);
    }

    // Create DOH compliance error if applicable
    if (!pattern.dohCompliant) {
      this.createDOHComplianceError(errorReport, pattern);
    }

    // Execute compliance actions
    this.executeComplianceActions(errorReport, pattern);

    // Apply recovery strategy
    this.applyRecoveryStrategy(errorReport, pattern);
  }

  /**
   * Create patient safety error record
   */
  private createPatientSafetyError(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): void {
    const patientSafetyError: PatientSafetyError = {
      errorId: errorReport.id,
      patientId: errorReport.context.patientId,
      episodeId: errorReport.context.episodeId,
      safetyLevel: pattern.severity as any,
      clinicalImpact: this.assessClinicalImpact(errorReport, pattern),
      immediateActions: this.getImmediateActions(pattern),
      followUpRequired:
        pattern.severity === "critical" || pattern.severity === "high",
      reportingRequired: true,
      dohNotificationRequired: pattern.severity === "critical",
    };

    this.patientSafetyErrors.set(errorReport.id, patientSafetyError);

    // Emit patient safety event
    errorHandlerService.emit("patient-safety-error-created", {
      errorReport,
      patientSafetyError,
      pattern,
    });

    console.log(`🚨 Patient safety error created: ${pattern.name}`);
  }

  /**
   * Create DOH compliance error record
   */
  private createDOHComplianceError(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): void {
    const dohComplianceError: DOHComplianceError = {
      errorId: errorReport.id,
      complianceStandard: this.determineComplianceStandard(pattern),
      violationType: this.determineViolationType(pattern),
      riskLevel: pattern.severity as any,
      regulatoryActions: this.getRegulatoryActions(pattern),
      auditTrailRequired: true,
      reportingDeadline: this.calculateReportingDeadline(pattern),
      remediationSteps: pattern.preventionMeasures,
    };

    this.dohComplianceErrors.set(errorReport.id, dohComplianceError);

    // Emit DOH compliance event
    errorHandlerService.emit("doh-compliance-error-created", {
      errorReport,
      dohComplianceError,
      pattern,
    });

    console.log(`🏛️ DOH compliance error created: ${pattern.name}`);
  }

  /**
   * Execute compliance actions
   */
  private executeComplianceActions(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): void {
    console.log(`📋 Executing compliance actions for: ${pattern.name}`);

    const complianceExecution = {
      timestamp: new Date().toISOString(),
      errorId: errorReport.id,
      patternId: pattern.id,
      actions: pattern.complianceActions,
      executionStatus: "initiated",
      healthcareImpact: pattern.healthcareImpact,
      escalationRequired: pattern.escalationRequired,
    };

    // Store compliance execution for audit
    if (typeof window !== "undefined") {
      const existingExecutions = JSON.parse(
        sessionStorage.getItem("compliance_executions") || "[]",
      );
      existingExecutions.push(complianceExecution);
      sessionStorage.setItem(
        "compliance_executions",
        JSON.stringify(existingExecutions),
      );
    }

    // Emit compliance execution event
    errorHandlerService.emit(
      "compliance-actions-executed",
      complianceExecution,
    );
  }

  /**
   * Apply recovery strategy
   */
  private applyRecoveryStrategy(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): void {
    console.log(`🔧 Applying recovery strategy: ${pattern.recoveryStrategy}`);

    const recoveryExecution = {
      timestamp: new Date().toISOString(),
      errorId: errorReport.id,
      strategy: pattern.recoveryStrategy,
      preventionMeasures: pattern.preventionMeasures,
      executionStatus: "initiated",
      expectedOutcome: this.getExpectedRecoveryOutcome(pattern),
    };

    // Store recovery execution for tracking
    if (typeof window !== "undefined") {
      const existingRecoveries = JSON.parse(
        sessionStorage.getItem("recovery_executions") || "[]",
      );
      existingRecoveries.push(recoveryExecution);
      sessionStorage.setItem(
        "recovery_executions",
        JSON.stringify(existingRecoveries),
      );
    }

    // Emit recovery execution event
    errorHandlerService.emit("recovery-strategy-applied", recoveryExecution);
  }

  /**
   * Process generic healthcare error
   */
  private processGenericHealthcareError(errorReport: ErrorReport): void {
    console.log(`🏥 Processing generic healthcare error: ${errorReport.id}`);

    const genericHealthcareError = {
      timestamp: new Date().toISOString(),
      errorId: errorReport.id,
      category: "generic_healthcare",
      healthcareImpact: errorReport.healthcareImpact || "low",
      patientSafetyRisk: !!errorReport.context.patientId,
      dohComplianceRisk: this.assessDOHComplianceRisk(errorReport),
      recommendedActions: this.getGenericHealthcareActions(errorReport),
    };

    // Emit generic healthcare error event
    errorHandlerService.emit(
      "generic-healthcare-error-processed",
      genericHealthcareError,
    );
  }

  // Helper methods
  private assessClinicalImpact(
    errorReport: ErrorReport,
    pattern: HealthcareErrorPattern,
  ): string {
    if (pattern.category === "patient_safety") {
      return "Direct impact on patient safety and care quality";
    } else if (pattern.category === "clinical_workflow") {
      return "Impact on clinical workflow and care delivery";
    } else if (pattern.category === "doh_compliance") {
      return "Impact on regulatory compliance and quality standards";
    } else {
      return "General impact on healthcare operations";
    }
  }

  private getImmediateActions(pattern: HealthcareErrorPattern): string[] {
    const baseActions = [
      "Assess immediate patient safety impact",
      "Notify clinical supervisor",
      "Document incident details",
    ];

    if (pattern.patientSafetyRisk) {
      baseActions.unshift(
        "Ensure patient safety",
        "Activate patient safety protocols",
      );
    }

    if (pattern.escalationRequired) {
      baseActions.push(
        "Escalate to appropriate authorities",
        "Initiate emergency response if needed",
      );
    }

    return baseActions;
  }

  private determineComplianceStandard(
    pattern: HealthcareErrorPattern,
  ): DOHComplianceError["complianceStandard"] {
    if (pattern.id.includes("doh")) return "doh_nine_domains";
    if (pattern.id.includes("jawda")) return "jawda";
    if (pattern.id.includes("hipaa")) return "hipaa";
    return "general";
  }

  private determineViolationType(
    pattern: HealthcareErrorPattern,
  ): DOHComplianceError["violationType"] {
    if (pattern.category === "patient_safety") return "safety";
    if (pattern.category === "data_integrity") return "privacy";
    if (pattern.category === "doh_compliance") return "quality";
    return "documentation";
  }

  private getRegulatoryActions(pattern: HealthcareErrorPattern): string[] {
    const actions = [...pattern.complianceActions];

    if (pattern.severity === "critical") {
      actions.unshift("Immediate regulatory notification");
    }

    return actions;
  }

  private calculateReportingDeadline(pattern: HealthcareErrorPattern): string {
    const now = new Date();
    let deadlineHours = 72; // Default 72 hours

    if (pattern.severity === "critical") {
      deadlineHours = 24; // 24 hours for critical
    } else if (pattern.severity === "high") {
      deadlineHours = 48; // 48 hours for high
    }

    const deadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  private getExpectedRecoveryOutcome(pattern: HealthcareErrorPattern): string {
    switch (pattern.recoveryStrategy) {
      case "immediate_data_recovery":
        return "Patient data integrity restored with full audit trail";
      case "medication_safety_protocol":
        return "Medication safety verified and protocols reinforced";
      case "clinical_workflow_recovery":
        return "Clinical workflow restored with enhanced validation";
      case "doh_compliance_recovery":
        return "DOH compliance restored with corrective measures";
      case "jawda_compliance_recovery":
        return "JAWDA quality standards compliance restored";
      case "privacy_breach_response":
        return "Privacy breach contained and security measures enhanced";
      case "system_recovery_protocol":
        return "System availability restored with redundancy measures";
      case "emergency_response_protocol":
        return "Emergency protocols activated and patient safety ensured";
      default:
        return "Error resolved with appropriate healthcare safeguards";
    }
  }

  private assessDOHComplianceRisk(errorReport: ErrorReport): boolean {
    const message = errorReport.message.toLowerCase();
    const context = errorReport.context.context.toLowerCase();

    const complianceKeywords = [
      "doh",
      "compliance",
      "audit",
      "regulation",
      "standard",
      "jawda",
      "quality",
      "documentation",
      "reporting",
    ];

    return complianceKeywords.some(
      (keyword) => message.includes(keyword) || context.includes(keyword),
    );
  }

  private getGenericHealthcareActions(errorReport: ErrorReport): string[] {
    const actions = [
      "Review error context for healthcare impact",
      "Assess patient safety implications",
      "Document error for quality review",
    ];

    if (errorReport.context.patientId) {
      actions.push(
        "Review patient-specific impact",
        "Ensure patient data integrity",
      );
    }

    if (errorReport.context.episodeId) {
      actions.push("Review episode-specific impact", "Ensure care continuity");
    }

    return actions;
  }

  // Public methods
  getHealthcareErrorPatterns(): HealthcareErrorPattern[] {
    return Array.from(this.errorPatterns.values());
  }

  getPatientSafetyErrors(): PatientSafetyError[] {
    return Array.from(this.patientSafetyErrors.values());
  }

  getDOHComplianceErrors(): DOHComplianceError[] {
    return Array.from(this.dohComplianceErrors.values());
  }

  getHealthcareErrorStats(): {
    totalPatterns: number;
    patientSafetyErrors: number;
    dohComplianceErrors: number;
    criticalErrors: number;
    escalationRequired: number;
  } {
    const criticalErrors = Array.from(this.errorPatterns.values()).filter(
      (pattern) => pattern.severity === "critical",
    ).length;

    const escalationRequired = Array.from(this.errorPatterns.values()).filter(
      (pattern) => pattern.escalationRequired,
    ).length;

    return {
      totalPatterns: this.errorPatterns.size,
      patientSafetyErrors: this.patientSafetyErrors.size,
      dohComplianceErrors: this.dohComplianceErrors.size,
      criticalErrors,
      escalationRequired,
    };
  }
}

// Export singleton instance
export const healthcareErrorPatternsService =
  HealthcareErrorPatternsService.getInstance();
export default healthcareErrorPatternsService;
