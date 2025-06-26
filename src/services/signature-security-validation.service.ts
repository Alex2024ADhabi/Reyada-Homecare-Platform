/**
 * Signature Security Validation Service
 * Advanced security validation and threat detection for signature operations
 */

import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";

export interface SecurityValidationRule {
  id: string;
  name: string;
  description: string;
  category:
    | "authentication"
    | "authorization"
    | "integrity"
    | "compliance"
    | "behavioral";
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  validator: (context: SecurityContext) => Promise<ValidationResult>;
}

export interface SecurityContext {
  signatureData?: SignatureData;
  workflowInstance?: WorkflowInstance;
  userId: string;
  userRole: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  passed: boolean;
  riskScore: number; // 0-100
  violations: string[];
  warnings: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface SecurityThreat {
  id: string;
  type:
    | "spoofing"
    | "tampering"
    | "repudiation"
    | "disclosure"
    | "dos"
    | "elevation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  indicators: string[];
  mitigations: string[];
  timestamp: string;
  context: SecurityContext;
}

export interface SecurityProfile {
  userId: string;
  riskScore: number;
  behaviorPattern: {
    averageSigningTime: number;
    commonDevices: string[];
    commonLocations: { lat: number; lng: number; frequency: number }[];
    signingHours: number[];
    pressurePatterns: number[];
  };
  violations: {
    count: number;
    lastViolation: string;
    types: Record<string, number>;
  };
  trustLevel: "low" | "medium" | "high" | "verified";
  lastUpdated: string;
}

class SignatureSecurityValidationService {
  private validationRules: Map<string, SecurityValidationRule> = new Map();
  private securityProfiles: Map<string, SecurityProfile> = new Map();
  private threatHistory: SecurityThreat[] = [];
  private suspiciousActivities: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSecurityRules();
    this.startThreatMonitoring();
  }

  private initializeSecurityRules(): void {
    // Authentication Rules
    this.registerRule({
      id: "session_validation",
      name: "Session Validation",
      description: "Validates user session integrity and authenticity",
      category: "authentication",
      severity: "high",
      enabled: true,
      validator: async (context) => this.validateSession(context),
    });

    this.registerRule({
      id: "device_fingerprint",
      name: "Device Fingerprint Validation",
      description: "Validates device fingerprint consistency",
      category: "authentication",
      severity: "medium",
      enabled: true,
      validator: async (context) => this.validateDeviceFingerprint(context),
    });

    // Authorization Rules
    this.registerRule({
      id: "role_authorization",
      name: "Role-Based Authorization",
      description: "Validates user role permissions for signature operations",
      category: "authorization",
      severity: "critical",
      enabled: true,
      validator: async (context) => this.validateRoleAuthorization(context),
    });

    this.registerRule({
      id: "workflow_authorization",
      name: "Workflow Authorization",
      description: "Validates user authorization for specific workflow steps",
      category: "authorization",
      severity: "high",
      enabled: true,
      validator: async (context) => this.validateWorkflowAuthorization(context),
    });

    // Integrity Rules
    this.registerRule({
      id: "signature_integrity",
      name: "Signature Data Integrity",
      description: "Validates signature data integrity and authenticity",
      category: "integrity",
      severity: "critical",
      enabled: true,
      validator: async (context) => this.validateSignatureIntegrity(context),
    });

    this.registerRule({
      id: "timestamp_validation",
      name: "Timestamp Validation",
      description: "Validates signature timestamp accuracy and sequence",
      category: "integrity",
      severity: "medium",
      enabled: true,
      validator: async (context) => this.validateTimestamp(context),
    });

    // Behavioral Rules
    this.registerRule({
      id: "behavioral_analysis",
      name: "Behavioral Pattern Analysis",
      description: "Analyzes user behavior patterns for anomalies",
      category: "behavioral",
      severity: "medium",
      enabled: true,
      validator: async (context) => this.analyzeBehavioralPatterns(context),
    });

    this.registerRule({
      id: "velocity_check",
      name: "Signature Velocity Check",
      description: "Detects unusually fast signature creation patterns",
      category: "behavioral",
      severity: "high",
      enabled: true,
      validator: async (context) => this.checkSignatureVelocity(context),
    });

    // Compliance Rules
    this.registerRule({
      id: "doh_compliance",
      name: "DOH Compliance Validation",
      description: "Validates compliance with DOH requirements",
      category: "compliance",
      severity: "critical",
      enabled: true,
      validator: async (context) => this.validateDOHCompliance(context),
    });

    this.registerRule({
      id: "jawda_compliance",
      name: "JAWDA Compliance Validation",
      description: "Validates compliance with JAWDA standards",
      category: "compliance",
      severity: "high",
      enabled: true,
      validator: async (context) => this.validateJAWDACompliance(context),
    });
  }

  /**
   * Validate security context
   */
  public async validateSecurity(context: SecurityContext): Promise<{
    overallResult: ValidationResult;
    ruleResults: Map<string, ValidationResult>;
    threats: SecurityThreat[];
    recommendations: string[];
  }> {
    const ruleResults = new Map<string, ValidationResult>();
    const threats: SecurityThreat[] = [];
    const allViolations: string[] = [];
    const allWarnings: string[] = [];
    const allRecommendations: string[] = [];
    let totalRiskScore = 0;
    let ruleCount = 0;

    // Execute all enabled validation rules
    for (const rule of this.validationRules.values()) {
      if (!rule.enabled) continue;

      try {
        const result = await rule.validator(context);
        ruleResults.set(rule.id, result);

        totalRiskScore += result.riskScore;
        ruleCount++;

        allViolations.push(...result.violations);
        allWarnings.push(...result.warnings);
        allRecommendations.push(...result.recommendations);

        // Check for threats
        if (result.riskScore > 70 || result.violations.length > 0) {
          const threat = this.createThreatFromValidation(rule, result, context);
          threats.push(threat);
        }
      } catch (error) {
        console.error(`Security rule ${rule.id} failed:`, error);
        allWarnings.push(
          `Security validation rule ${rule.name} encountered an error`,
        );
      }
    }

    const averageRiskScore = ruleCount > 0 ? totalRiskScore / ruleCount : 0;
    const overallPassed = allViolations.length === 0 && averageRiskScore < 50;

    const overallResult: ValidationResult = {
      passed: overallPassed,
      riskScore: averageRiskScore,
      violations: [...new Set(allViolations)],
      warnings: [...new Set(allWarnings)],
      recommendations: [...new Set(allRecommendations)],
      metadata: {
        rulesExecuted: ruleCount,
        threatsDetected: threats.length,
      },
    };

    // Update security profile
    await this.updateSecurityProfile(context, overallResult);

    // Store threats
    threats.forEach((threat) => this.threatHistory.push(threat));

    return {
      overallResult,
      ruleResults,
      threats,
      recommendations: this.generateSecurityRecommendations(
        overallResult,
        threats,
      ),
    };
  }

  /**
   * Register custom security rule
   */
  public registerRule(rule: SecurityValidationRule): void {
    this.validationRules.set(rule.id, rule);
  }

  /**
   * Get security profile for user
   */
  public getSecurityProfile(userId: string): SecurityProfile | undefined {
    return this.securityProfiles.get(userId);
  }

  /**
   * Get threat history
   */
  public getThreatHistory(filters?: {
    userId?: string;
    severity?: string;
    type?: string;
    since?: string;
  }): SecurityThreat[] {
    let threats = this.threatHistory;

    if (filters) {
      if (filters.userId) {
        threats = threats.filter((t) => t.context.userId === filters.userId);
      }
      if (filters.severity) {
        threats = threats.filter((t) => t.severity === filters.severity);
      }
      if (filters.type) {
        threats = threats.filter((t) => t.type === filters.type);
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        threats = threats.filter((t) => new Date(t.timestamp) >= sinceDate);
      }
    }

    return threats.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  // Validation Rule Implementations
  private async validateSession(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Check session validity
    if (!context.sessionId || context.sessionId.length < 10) {
      violations.push("Invalid or missing session ID");
      riskScore += 30;
    }

    // Check session age (assuming session ID contains timestamp)
    try {
      const sessionTime = parseInt(context.sessionId.split("_")[1] || "0");
      const sessionAge = Date.now() - sessionTime;
      const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours

      if (sessionAge > maxSessionAge) {
        violations.push("Session has expired");
        riskScore += 40;
      } else if (sessionAge > maxSessionAge * 0.8) {
        warnings.push("Session is nearing expiration");
        riskScore += 10;
      }
    } catch (error) {
      warnings.push("Unable to validate session age");
      riskScore += 5;
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0
          ? ["Please log in again to refresh your session"]
          : [],
    };
  }

  private async validateDeviceFingerprint(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    if (!context.deviceFingerprint) {
      warnings.push("Device fingerprint not available");
      riskScore += 10;
      return {
        passed: true,
        riskScore,
        violations,
        warnings,
        recommendations: [],
      };
    }

    // Check against user's known devices
    const profile = this.securityProfiles.get(context.userId);
    if (profile) {
      const isKnownDevice = profile.behaviorPattern.commonDevices.includes(
        context.deviceFingerprint,
      );
      if (!isKnownDevice) {
        warnings.push("Signature from unrecognized device");
        riskScore += 20;
      }
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        riskScore > 15
          ? ["Consider adding this device to your trusted devices"]
          : [],
    };
  }

  private async validateRoleAuthorization(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Define role hierarchy and permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ["*"],
      medical_director: ["approve_critical", "review_all", "sign_medical"],
      physician: ["sign_medical", "review_clinical"],
      nurse: ["sign_nursing", "witness_signatures"],
      patient: ["sign_consent", "acknowledge_treatment"],
      family: ["sign_consent", "acknowledge_treatment"],
    };

    const userPermissions = rolePermissions[context.userRole] || [];

    // Check if user has wildcard permission
    if (!userPermissions.includes("*")) {
      // Validate specific permissions based on context
      if (context.workflowInstance) {
        const requiredPermission = this.getRequiredPermission(
          context.workflowInstance,
        );
        if (
          requiredPermission &&
          !userPermissions.includes(requiredPermission)
        ) {
          violations.push(
            `User role '${context.userRole}' not authorized for this operation`,
          );
          riskScore += 50;
        }
      }
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0
          ? ["Contact administrator for proper role assignment"]
          : [],
    };
  }

  private async validateWorkflowAuthorization(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    if (!context.workflowInstance) {
      return {
        passed: true,
        riskScore: 0,
        violations,
        warnings,
        recommendations: [],
      };
    }

    const workflow = context.workflowInstance;

    // Check if user is assigned to this workflow
    if (workflow.signatures) {
      const userAssigned = workflow.signatures.some(
        (sig) =>
          sig.signerUserId === context.userId ||
          sig.signerRole === context.userRole,
      );

      if (!userAssigned && context.userRole !== "admin") {
        violations.push("User not assigned to this workflow");
        riskScore += 40;
      }
    }

    // Check workflow status
    if (workflow.status === "completed") {
      violations.push("Cannot modify completed workflow");
      riskScore += 30;
    } else if (workflow.status === "cancelled") {
      violations.push("Cannot modify cancelled workflow");
      riskScore += 25;
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0 ? ["Verify workflow assignment and status"] : [],
    };
  }

  private async validateSignatureIntegrity(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    if (!context.signatureData) {
      return {
        passed: true,
        riskScore: 0,
        violations,
        warnings,
        recommendations: [],
      };
    }

    const signature = context.signatureData;

    // Validate signature data structure
    if (!signature.strokes || signature.strokes.length === 0) {
      violations.push("Signature contains no stroke data");
      riskScore += 40;
    }

    // Validate metadata
    if (!signature.metadata) {
      violations.push("Signature metadata missing");
      riskScore += 30;
    } else {
      // Check for suspicious patterns
      if (signature.metadata.totalTime < 500) {
        warnings.push("Signature created unusually quickly");
        riskScore += 15;
      }

      if (signature.metadata.strokeCount < 3) {
        warnings.push("Signature has very few strokes");
        riskScore += 10;
      }
    }

    // Validate image data
    if (
      !signature.imageData ||
      !signature.imageData.startsWith("data:image/")
    ) {
      violations.push("Invalid signature image data");
      riskScore += 25;
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0
          ? ["Recapture signature with proper validation"]
          : [],
    };
  }

  private async validateTimestamp(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    const now = new Date();
    const contextTime = new Date(context.timestamp);
    const timeDiff = Math.abs(now.getTime() - contextTime.getTime());

    // Allow 5 minutes of clock skew
    const maxSkew = 5 * 60 * 1000;

    if (timeDiff > maxSkew) {
      if (contextTime > now) {
        violations.push("Signature timestamp is in the future");
        riskScore += 35;
      } else {
        warnings.push("Signature timestamp is significantly in the past");
        riskScore += 15;
      }
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0 ? ["Check system clock synchronization"] : [],
    };
  }

  private async analyzeBehavioralPatterns(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    const profile = this.securityProfiles.get(context.userId);
    if (!profile) {
      // No behavioral data yet
      return {
        passed: true,
        riskScore: 5,
        violations,
        warnings,
        recommendations: [],
      };
    }

    // Analyze signing time patterns
    const currentHour = new Date().getHours();
    const isUnusualTime =
      !profile.behaviorPattern.signingHours.includes(currentHour);

    if (isUnusualTime) {
      warnings.push("Signature created at unusual time");
      riskScore += 10;
    }

    // Analyze location patterns if available
    if (
      context.locationData &&
      profile.behaviorPattern.commonLocations.length > 0
    ) {
      const isUnusualLocation = !profile.behaviorPattern.commonLocations.some(
        (loc) => {
          const distance = this.calculateDistance(
            context.locationData!.latitude,
            context.locationData!.longitude,
            loc.lat,
            loc.lng,
          );
          return distance < 1000; // Within 1km
        },
      );

      if (isUnusualLocation) {
        warnings.push("Signature from unusual location");
        riskScore += 15;
      }
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        riskScore > 20 ? ["Verify user identity due to unusual patterns"] : [],
    };
  }

  private async checkSignatureVelocity(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Check recent signature activity
    const recentActivity = this.suspiciousActivities.get(context.userId) || [];
    const now = Date.now();
    const recentSignatures = recentActivity.filter(
      (activity) => now - activity.timestamp < 60000, // Last minute
    );

    if (recentSignatures.length > 5) {
      violations.push("Excessive signature creation rate detected");
      riskScore += 60;
    } else if (recentSignatures.length > 3) {
      warnings.push("High signature creation rate");
      riskScore += 25;
    }

    // Update activity tracking
    recentActivity.push({ timestamp: now, context });
    this.suspiciousActivities.set(context.userId, recentActivity.slice(-10)); // Keep last 10

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0 ? ["Slow down signature creation rate"] : [],
    };
  }

  private async validateDOHCompliance(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // DOH compliance checks
    if (context.signatureData) {
      const signature = context.signatureData;

      // Check for required metadata
      if (!signature.metadata?.deviceType) {
        violations.push("Device type not recorded (DOH requirement)");
        riskScore += 20;
      }

      if (!signature.metadata?.captureMethod) {
        violations.push("Capture method not recorded (DOH requirement)");
        riskScore += 20;
      }

      // Check signature quality
      if (
        signature.metadata?.signatureComplexity &&
        signature.metadata.signatureComplexity < 10
      ) {
        warnings.push("Signature complexity below DOH recommendations");
        riskScore += 10;
      }
    }

    // Check user authentication level
    if (!context.deviceFingerprint) {
      warnings.push("Device fingerprinting not available (DOH recommendation)");
      riskScore += 5;
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0
          ? ["Ensure DOH compliance requirements are met"]
          : [],
    };
  }

  private async validateJAWDACompliance(
    context: SecurityContext,
  ): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // JAWDA compliance checks
    if (context.workflowInstance) {
      const workflow = context.workflowInstance;

      // Check audit trail
      if (!workflow.auditTrail || workflow.auditTrail.length === 0) {
        violations.push("Audit trail missing (JAWDA requirement)");
        riskScore += 30;
      }

      // Check metadata completeness
      if (!workflow.metadata?.formType) {
        violations.push("Form type not specified (JAWDA requirement)");
        riskScore += 15;
      }
    }

    return {
      passed: violations.length === 0,
      riskScore,
      violations,
      warnings,
      recommendations:
        violations.length > 0
          ? ["Ensure JAWDA compliance standards are met"]
          : [],
    };
  }

  // Helper methods
  private getRequiredPermission(workflow: WorkflowInstance): string {
    // Determine required permission based on workflow type
    switch (workflow.metadata.formType) {
      case "emergency_preparedness":
        return "sign_medical";
      case "documentation_review":
        return "review_clinical";
      case "quality_assurance":
        return "approve_critical";
      default:
        return "sign_general";
    }
  }

  private createThreatFromValidation(
    rule: SecurityValidationRule,
    result: ValidationResult,
    context: SecurityContext,
  ): SecurityThreat {
    return {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapCategoryToThreatType(rule.category),
      severity: rule.severity,
      description: `Security rule '${rule.name}' detected violations: ${result.violations.join(", ")}`,
      indicators: result.violations,
      mitigations: result.recommendations,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private mapCategoryToThreatType(category: string): SecurityThreat["type"] {
    switch (category) {
      case "authentication":
        return "spoofing";
      case "authorization":
        return "elevation";
      case "integrity":
        return "tampering";
      case "behavioral":
        return "repudiation";
      default:
        return "disclosure";
    }
  }

  private async updateSecurityProfile(
    context: SecurityContext,
    result: ValidationResult,
  ): Promise<void> {
    let profile = this.securityProfiles.get(context.userId);

    if (!profile) {
      profile = {
        userId: context.userId,
        riskScore: result.riskScore,
        behaviorPattern: {
          averageSigningTime: 0,
          commonDevices: [],
          commonLocations: [],
          signingHours: [],
          pressurePatterns: [],
        },
        violations: {
          count: 0,
          lastViolation: "",
          types: {},
        },
        trustLevel: "medium",
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update risk score (weighted average)
    profile.riskScore = profile.riskScore * 0.8 + result.riskScore * 0.2;

    // Update violations
    if (result.violations.length > 0) {
      profile.violations.count++;
      profile.violations.lastViolation = new Date().toISOString();
      result.violations.forEach((violation) => {
        profile!.violations.types[violation] =
          (profile!.violations.types[violation] || 0) + 1;
      });
    }

    // Update behavioral patterns
    if (context.signatureData) {
      const sigTime = context.signatureData.metadata?.totalTime || 0;
      profile.behaviorPattern.averageSigningTime =
        profile.behaviorPattern.averageSigningTime * 0.9 + sigTime * 0.1;
    }

    if (
      context.deviceFingerprint &&
      !profile.behaviorPattern.commonDevices.includes(context.deviceFingerprint)
    ) {
      profile.behaviorPattern.commonDevices.push(context.deviceFingerprint);
      if (profile.behaviorPattern.commonDevices.length > 5) {
        profile.behaviorPattern.commonDevices =
          profile.behaviorPattern.commonDevices.slice(-5);
      }
    }

    const currentHour = new Date().getHours();
    if (!profile.behaviorPattern.signingHours.includes(currentHour)) {
      profile.behaviorPattern.signingHours.push(currentHour);
    }

    // Update trust level
    if (profile.riskScore < 20 && profile.violations.count === 0) {
      profile.trustLevel = "high";
    } else if (profile.riskScore < 40 && profile.violations.count < 3) {
      profile.trustLevel = "medium";
    } else {
      profile.trustLevel = "low";
    }

    profile.lastUpdated = new Date().toISOString();
    this.securityProfiles.set(context.userId, profile);
  }

  private generateSecurityRecommendations(
    result: ValidationResult,
    threats: SecurityThreat[],
  ): string[] {
    const recommendations: string[] = [...result.recommendations];

    if (result.riskScore > 70) {
      recommendations.push(
        "Consider implementing additional authentication factors",
      );
    }

    if (threats.some((t) => t.severity === "critical")) {
      recommendations.push("Immediate security review required");
    }

    if (threats.some((t) => t.type === "spoofing")) {
      recommendations.push("Verify user identity through alternative means");
    }

    return [...new Set(recommendations)];
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private startThreatMonitoring(): void {
    // Clean up old threats periodically
    setInterval(
      () => {
        const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
        this.threatHistory = this.threatHistory.filter(
          (threat) => new Date(threat.timestamp).getTime() > cutoffTime,
        );
      },
      60 * 60 * 1000,
    ); // Every hour
  }

  /**
   * Get security statistics
   */
  public getSecurityStatistics(): {
    totalThreats: number;
    threatsBySeverity: Record<string, number>;
    threatsByType: Record<string, number>;
    averageRiskScore: number;
    highRiskUsers: number;
  } {
    const totalThreats = this.threatHistory.length;
    const threatsBySeverity: Record<string, number> = {};
    const threatsByType: Record<string, number> = {};

    this.threatHistory.forEach((threat) => {
      threatsBySeverity[threat.severity] =
        (threatsBySeverity[threat.severity] || 0) + 1;
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1;
    });

    const profiles = Array.from(this.securityProfiles.values());
    const averageRiskScore =
      profiles.length > 0
        ? profiles.reduce((sum, p) => sum + p.riskScore, 0) / profiles.length
        : 0;

    const highRiskUsers = profiles.filter(
      (p) => p.riskScore > 70 || p.trustLevel === "low",
    ).length;

    return {
      totalThreats,
      threatsBySeverity,
      threatsByType,
      averageRiskScore,
      highRiskUsers,
    };
  }
}

export const signatureSecurityValidationService =
  new SignatureSecurityValidationService();
export default signatureSecurityValidationService;
