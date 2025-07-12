// Zero Trust Security Architecture Service
// Comprehensive Zero Trust implementation for Reyada Homecare Platform
// Implements "Never Trust, Always Verify" security model

import { errorHandlerService } from "./error-handler.service";
import { validationService } from "./validation.service";
import { securityService } from "./security.service";
import { enhancedAuthService } from "./enhanced-auth.service";

interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  resourceType: string;
  conditions: {
    userAttributes?: Record<string, any>;
    deviceAttributes?: Record<string, any>;
    networkAttributes?: Record<string, any>;
    timeConstraints?: {
      allowedHours?: { start: number; end: number }[];
      allowedDays?: number[];
      timezone?: string;
    };
    locationConstraints?: {
      allowedCountries?: string[];
      allowedRegions?: string[];
      blockedIPs?: string[];
      allowedIPs?: string[];
    };
    riskThreshold?: number;
  };
  actions: {
    allow: boolean;
    requireMFA?: boolean;
    requireReauth?: boolean;
    logLevel: "info" | "warn" | "error" | "critical";
    notifications?: string[];
  };
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MicroSegment {
  id: string;
  name: string;
  description: string;
  resources: string[];
  allowedUsers: string[];
  allowedRoles: string[];
  networkPolicies: {
    inbound: NetworkRule[];
    outbound: NetworkRule[];
  };
  encryptionRequired: boolean;
  monitoringLevel: "basic" | "enhanced" | "comprehensive";
  isActive: boolean;
}

interface NetworkRule {
  id: string;
  protocol: "TCP" | "UDP" | "HTTP" | "HTTPS" | "ALL";
  ports: number[];
  sources: string[];
  destinations: string[];
  action: "ALLOW" | "DENY" | "LOG";
  priority: number;
}

interface ThreatIntelligence {
  id: string;
  type:
    | "malware"
    | "phishing"
    | "brute_force"
    | "data_exfiltration"
    | "anomaly";
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  indicators: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    patterns?: string[];
  };
  description: string;
  mitigation: string;
  timestamp: string;
  expiresAt?: string;
  isActive: boolean;
}

interface SecurityContext {
  userId: string;
  sessionId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  deviceTrust: {
    score: number;
    factors: {
      isManaged: boolean;
      hasAntivirus: boolean;
      isEncrypted: boolean;
      lastScan?: string;
      complianceStatus: "compliant" | "non_compliant" | "unknown";
    };
  };
  networkTrust: {
    score: number;
    factors: {
      isVPN: boolean;
      isCorporateNetwork: boolean;
      threatLevel: "low" | "medium" | "high";
      reputation: number;
    };
  };
  behaviorTrust: {
    score: number;
    factors: {
      typicalAccessTime: boolean;
      typicalLocation: boolean;
      typicalDevice: boolean;
      accessPattern: "normal" | "suspicious" | "anomalous";
    };
  };
  overallTrustScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

interface ContinuousAuthEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType:
    | "login"
    | "resource_access"
    | "privilege_escalation"
    | "data_access";
  resource: string;
  action: string;
  context: SecurityContext;
  decision: "allow" | "deny" | "challenge";
  policyMatches: string[];
  riskScore: number;
  timestamp: string;
  responseTime: number;
}

export class ZeroTrustSecurityService {
  private static instance: ZeroTrustSecurityService;
  private policies: Map<string, ZeroTrustPolicy> = new Map();
  private microSegments: Map<string, MicroSegment> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private securityContexts: Map<string, SecurityContext> = new Map();
  private authEvents: ContinuousAuthEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly TRUST_THRESHOLD = 70;
  private readonly REAUTH_THRESHOLD = 50;
  private readonly CHALLENGE_THRESHOLD = 60;

  private constructor() {
    this.initializeDefaultPolicies();
    this.initializeMicroSegments();
    this.startContinuousMonitoring();
    this.loadThreatIntelligence();
  }

  public static getInstance(): ZeroTrustSecurityService {
    if (!ZeroTrustSecurityService.instance) {
      ZeroTrustSecurityService.instance = new ZeroTrustSecurityService();
    }
    return ZeroTrustSecurityService.instance;
  }

  /**
   * Initialize default Zero Trust policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: ZeroTrustPolicy[] = [
      {
        id: "healthcare-data-access",
        name: "Healthcare Data Access Policy",
        description: "Strict access control for patient health information",
        resourceType: "patient_data",
        conditions: {
          userAttributes: { role: ["physician", "nurse", "admin"] },
          riskThreshold: 80,
          timeConstraints: {
            allowedHours: [{ start: 6, end: 22 }],
            allowedDays: [1, 2, 3, 4, 5, 6, 7],
          },
        },
        actions: {
          allow: true,
          requireMFA: true,
          requireReauth: false,
          logLevel: "info",
          notifications: ["security-team@reyada.ae"],
        },
        priority: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "admin-access-policy",
        name: "Administrative Access Policy",
        description: "Enhanced security for administrative functions",
        resourceType: "admin_functions",
        conditions: {
          userAttributes: { role: ["admin", "super_admin"] },
          riskThreshold: 90,
          locationConstraints: {
            allowedCountries: ["AE"],
            allowedRegions: ["Dubai", "Abu Dhabi"],
          },
        },
        actions: {
          allow: true,
          requireMFA: true,
          requireReauth: true,
          logLevel: "warn",
          notifications: ["admin-team@reyada.ae", "security-team@reyada.ae"],
        },
        priority: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "high-risk-block-policy",
        name: "High Risk Access Block",
        description: "Block access for high-risk contexts",
        resourceType: "*",
        conditions: {
          riskThreshold: 30,
        },
        actions: {
          allow: false,
          requireMFA: false,
          requireReauth: false,
          logLevel: "critical",
          notifications: [
            "security-team@reyada.ae",
            "incident-response@reyada.ae",
          ],
        },
        priority: -1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultPolicies.forEach((policy) => {
      this.policies.set(policy.id, policy);
    });

    console.log("🛡️ Zero Trust policies initialized");
  }

  /**
   * Initialize micro-segmentation
   */
  private initializeMicroSegments(): void {
    const segments: MicroSegment[] = [
      {
        id: "patient-data-segment",
        name: "Patient Data Segment",
        description: "Isolated segment for patient health records",
        resources: ["patient_records", "medical_images", "lab_results"],
        allowedUsers: [],
        allowedRoles: ["physician", "nurse", "medical_assistant"],
        networkPolicies: {
          inbound: [
            {
              id: "allow-https",
              protocol: "HTTPS",
              ports: [443],
              sources: ["corporate_network"],
              destinations: ["patient_data_servers"],
              action: "ALLOW",
              priority: 1,
            },
          ],
          outbound: [
            {
              id: "deny-internet",
              protocol: "ALL",
              ports: [],
              sources: ["patient_data_servers"],
              destinations: ["internet"],
              action: "DENY",
              priority: 1,
            },
          ],
        },
        encryptionRequired: true,
        monitoringLevel: "comprehensive",
        isActive: true,
      },
      {
        id: "admin-segment",
        name: "Administrative Segment",
        description: "Highly secured segment for administrative functions",
        resources: ["user_management", "system_config", "audit_logs"],
        allowedUsers: [],
        allowedRoles: ["admin", "super_admin"],
        networkPolicies: {
          inbound: [
            {
              id: "admin-access",
              protocol: "HTTPS",
              ports: [443],
              sources: ["admin_workstations"],
              destinations: ["admin_servers"],
              action: "ALLOW",
              priority: 1,
            },
          ],
          outbound: [
            {
              id: "log-all",
              protocol: "ALL",
              ports: [],
              sources: ["admin_servers"],
              destinations: ["*"],
              action: "LOG",
              priority: 0,
            },
          ],
        },
        encryptionRequired: true,
        monitoringLevel: "comprehensive",
        isActive: true,
      },
    ];

    segments.forEach((segment) => {
      this.microSegments.set(segment.id, segment);
    });

    console.log("🔒 Micro-segmentation initialized");
  }

  /**
   * Load threat intelligence data
   */
  private async loadThreatIntelligence(): Promise<void> {
    try {
      // In production, this would load from threat intelligence feeds
      const threats: ThreatIntelligence[] = [
        {
          id: "malware-hash-001",
          type: "malware",
          severity: "high",
          source: "internal_detection",
          indicators: {
            hashes: ["d41d8cd98f00b204e9800998ecf8427e"],
            patterns: ["suspicious_file_access"],
          },
          description: "Known malware signature detected",
          mitigation: "Block file execution and quarantine",
          timestamp: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          isActive: true,
        },
        {
          id: "brute-force-pattern",
          type: "brute_force",
          severity: "medium",
          source: "behavioral_analysis",
          indicators: {
            patterns: ["rapid_login_attempts", "multiple_failed_auth"],
          },
          description: "Brute force attack pattern detected",
          mitigation: "Implement progressive delays and account lockout",
          timestamp: new Date().toISOString(),
          isActive: true,
        },
      ];

      threats.forEach((threat) => {
        this.threatIntelligence.set(threat.id, threat);
      });

      console.log("🔍 Threat intelligence loaded");
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "ZeroTrustSecurityService.loadThreatIntelligence",
      });
    }
  }

  /**
   * Evaluate access request using Zero Trust principles
   */
  public async evaluateAccess(
    userId: string,
    resource: string,
    action: string,
    context: Partial<SecurityContext>,
  ): Promise<{
    decision: "allow" | "deny" | "challenge";
    reason: string;
    trustScore: number;
    requiredActions: string[];
    policyMatches: string[];
  }> {
    try {
      console.log(
        `🔍 Evaluating Zero Trust access for user ${userId} to ${resource}`,
      );

      // Build complete security context
      const securityContext = await this.buildSecurityContext(userId, context);

      // Calculate trust score
      const trustScore = this.calculateTrustScore(securityContext);

      // Check threat intelligence
      const threatCheck = await this.checkThreatIntelligence(securityContext);
      if (threatCheck.isBlocked) {
        return {
          decision: "deny",
          reason: `Threat detected: ${threatCheck.reason}`,
          trustScore: 0,
          requiredActions: ["security_review"],
          policyMatches: [],
        };
      }

      // Evaluate policies
      const policyEvaluation = await this.evaluatePolicies(
        userId,
        resource,
        action,
        securityContext,
      );

      // Make access decision
      let decision: "allow" | "deny" | "challenge";
      let requiredActions: string[] = [];

      if (trustScore < this.REAUTH_THRESHOLD) {
        decision = "deny";
        requiredActions.push("reauthenticate");
      } else if (trustScore < this.CHALLENGE_THRESHOLD) {
        decision = "challenge";
        requiredActions.push("mfa_verification");
      } else if (trustScore >= this.TRUST_THRESHOLD && policyEvaluation.allow) {
        decision = "allow";
        if (policyEvaluation.requireMFA) {
          requiredActions.push("mfa_verification");
        }
        if (policyEvaluation.requireReauth) {
          requiredActions.push("reauthenticate");
        }
      } else {
        decision = "deny";
        requiredActions.push("policy_violation_review");
      }

      // Log the access evaluation
      const authEvent: ContinuousAuthEvent = {
        id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        sessionId: securityContext.sessionId,
        eventType: "resource_access",
        resource,
        action,
        context: securityContext,
        decision,
        policyMatches: policyEvaluation.matchedPolicies,
        riskScore: 100 - trustScore,
        timestamp: new Date().toISOString(),
        responseTime:
          Date.now() - new Date(securityContext.timestamp).getTime(),
      };

      this.authEvents.push(authEvent);
      this.limitAuthEvents();

      // Store security context
      this.securityContexts.set(
        `${userId}_${securityContext.sessionId}`,
        securityContext,
      );

      console.log(
        `✅ Access evaluation completed: ${decision} (trust: ${trustScore})`,
      );

      return {
        decision,
        reason: policyEvaluation.reason || `Trust score: ${trustScore}`,
        trustScore,
        requiredActions,
        policyMatches: policyEvaluation.matchedPolicies,
      };
    } catch (error: any) {
      errorHandlerService.handleError(error, {
        context: "ZeroTrustSecurityService.evaluateAccess",
        userId,
        resource,
        action,
      });

      return {
        decision: "deny",
        reason: "System error during access evaluation",
        trustScore: 0,
        requiredActions: ["system_review"],
        policyMatches: [],
      };
    }
  }

  /**
   * Build comprehensive security context
   */
  private async buildSecurityContext(
    userId: string,
    partialContext: Partial<SecurityContext>,
  ): Promise<SecurityContext> {
    const currentUser = enhancedAuthService.getCurrentUser();
    const currentSession = enhancedAuthService.getCurrentSession();

    // Get device trust score
    const deviceTrust = await this.evaluateDeviceTrust(
      partialContext.deviceId || "unknown",
      partialContext.userAgent || "",
    );

    // Get network trust score
    const networkTrust = await this.evaluateNetworkTrust(
      partialContext.ipAddress || "127.0.0.1",
    );

    // Get behavioral trust score
    const behaviorTrust = await this.evaluateBehavioralTrust(
      userId,
      partialContext,
    );

    // Calculate overall trust score
    const overallTrustScore = Math.round(
      deviceTrust.score * 0.3 +
        networkTrust.score * 0.3 +
        behaviorTrust.score * 0.4,
    );

    const riskLevel = this.calculateRiskLevel(overallTrustScore);

    return {
      userId,
      sessionId: currentSession?.id || "unknown",
      deviceId: partialContext.deviceId || "unknown",
      ipAddress: partialContext.ipAddress || "127.0.0.1",
      userAgent: partialContext.userAgent || navigator.userAgent,
      location: partialContext.location,
      deviceTrust,
      networkTrust,
      behaviorTrust,
      overallTrustScore,
      riskLevel,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate trust score based on multiple factors
   */
  private calculateTrustScore(context: SecurityContext): number {
    return context.overallTrustScore;
  }

  /**
   * Evaluate device trust
   */
  private async evaluateDeviceTrust(
    deviceId: string,
    userAgent: string,
  ): Promise<SecurityContext["deviceTrust"]> {
    // In production, this would check device management systems
    let score = 70; // Base score

    const factors = {
      isManaged: false,
      hasAntivirus: false,
      isEncrypted: false,
      complianceStatus: "unknown" as const,
    };

    // Check if device is known/managed
    if (deviceId !== "unknown" && deviceId.length > 10) {
      factors.isManaged = true;
      score += 15;
    }

    // Check user agent for security indicators
    if (userAgent.includes("Chrome") || userAgent.includes("Firefox")) {
      score += 5;
    }

    // Simulate compliance check
    if (Math.random() > 0.3) {
      factors.complianceStatus = "compliant";
      score += 10;
    }

    return {
      score: Math.min(100, score),
      factors,
    };
  }

  /**
   * Evaluate network trust
   */
  private async evaluateNetworkTrust(
    ipAddress: string,
  ): Promise<SecurityContext["networkTrust"]> {
    let score = 60; // Base score

    const factors = {
      isVPN: false,
      isCorporateNetwork: false,
      threatLevel: "low" as const,
      reputation: 50,
    };

    // Check if IP is from corporate network
    if (ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.")) {
      factors.isCorporateNetwork = true;
      score += 20;
    }

    // Check IP reputation (simplified)
    if (ipAddress === "127.0.0.1") {
      factors.reputation = 100;
      score += 20;
    }

    return {
      score: Math.min(100, score),
      factors,
    };
  }

  /**
   * Evaluate behavioral trust
   */
  private async evaluateBehavioralTrust(
    userId: string,
    context: Partial<SecurityContext>,
  ): Promise<SecurityContext["behaviorTrust"]> {
    let score = 70; // Base score

    const factors = {
      typicalAccessTime: true,
      typicalLocation: true,
      typicalDevice: true,
      accessPattern: "normal" as const,
    };

    // Check access time patterns
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour <= 22) {
      factors.typicalAccessTime = true;
      score += 10;
    } else {
      factors.typicalAccessTime = false;
      score -= 10;
    }

    // Check for recent suspicious activity
    const recentEvents = this.authEvents.filter(
      (event) =>
        event.userId === userId &&
        Date.now() - new Date(event.timestamp).getTime() < 60 * 60 * 1000,
    );

    if (recentEvents.length > 10) {
      factors.accessPattern = "suspicious";
      score -= 20;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
    };
  }

  /**
   * Calculate risk level based on trust score
   */
  private calculateRiskLevel(
    trustScore: number,
  ): "low" | "medium" | "high" | "critical" {
    if (trustScore >= 80) return "low";
    if (trustScore >= 60) return "medium";
    if (trustScore >= 40) return "high";
    return "critical";
  }

  /**
   * Check against threat intelligence
   */
  private async checkThreatIntelligence(
    context: SecurityContext,
  ): Promise<{ isBlocked: boolean; reason?: string }> {
    for (const [_, threat] of this.threatIntelligence) {
      if (!threat.isActive) continue;

      // Check IP indicators
      if (threat.indicators.ips?.includes(context.ipAddress)) {
        return {
          isBlocked: true,
          reason: `IP ${context.ipAddress} found in threat intelligence: ${threat.description}`,
        };
      }

      // Check pattern indicators
      if (threat.indicators.patterns) {
        // This would be more sophisticated in production
        const recentEvents = this.authEvents.filter(
          (event) =>
            event.userId === context.userId &&
            Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000,
        );

        if (recentEvents.length > 5 && threat.type === "brute_force") {
          return {
            isBlocked: true,
            reason: "Brute force attack pattern detected",
          };
        }
      }
    }

    return { isBlocked: false };
  }

  /**
   * Evaluate policies against access request
   */
  private async evaluatePolicies(
    userId: string,
    resource: string,
    action: string,
    context: SecurityContext,
  ): Promise<{
    allow: boolean;
    requireMFA: boolean;
    requireReauth: boolean;
    reason?: string;
    matchedPolicies: string[];
  }> {
    const currentUser = enhancedAuthService.getCurrentUser();
    const matchedPolicies: string[] = [];
    let allow = false;
    let requireMFA = false;
    let requireReauth = false;
    let reason = "No matching policy found";

    // Sort policies by priority (lower number = higher priority)
    const sortedPolicies = Array.from(this.policies.values())
      .filter((policy) => policy.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const policy of sortedPolicies) {
      if (this.policyMatches(policy, resource, currentUser, context)) {
        matchedPolicies.push(policy.id);

        allow = policy.actions.allow;
        requireMFA = policy.actions.requireMFA || requireMFA;
        requireReauth = policy.actions.requireReauth || requireReauth;
        reason = `Policy ${policy.name} applied`;

        // First matching policy wins (highest priority)
        break;
      }
    }

    return {
      allow,
      requireMFA,
      requireReauth,
      reason,
      matchedPolicies,
    };
  }

  /**
   * Check if policy matches the current context
   */
  private policyMatches(
    policy: ZeroTrustPolicy,
    resource: string,
    user: any,
    context: SecurityContext,
  ): boolean {
    // Check resource type
    if (
      policy.resourceType !== "*" &&
      !resource.includes(policy.resourceType)
    ) {
      return false;
    }

    // Check user attributes
    if (policy.conditions.userAttributes) {
      const userRole = user?.role;
      if (
        policy.conditions.userAttributes.role &&
        !policy.conditions.userAttributes.role.includes(userRole)
      ) {
        return false;
      }
    }

    // Check risk threshold
    if (policy.conditions.riskThreshold !== undefined) {
      const riskScore = 100 - context.overallTrustScore;
      if (riskScore > policy.conditions.riskThreshold) {
        return false;
      }
    }

    // Check time constraints
    if (policy.conditions.timeConstraints) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();

      if (policy.conditions.timeConstraints.allowedHours) {
        const isAllowedTime =
          policy.conditions.timeConstraints.allowedHours.some(
            (timeRange) =>
              currentHour >= timeRange.start && currentHour <= timeRange.end,
          );
        if (!isAllowedTime) return false;
      }

      if (policy.conditions.timeConstraints.allowedDays) {
        if (
          !policy.conditions.timeConstraints.allowedDays.includes(currentDay)
        ) {
          return false;
        }
      }
    }

    // Check location constraints
    if (policy.conditions.locationConstraints && context.location) {
      if (policy.conditions.locationConstraints.allowedCountries) {
        if (
          !policy.conditions.locationConstraints.allowedCountries.includes(
            context.location.country,
          )
        ) {
          return false;
        }
      }

      if (policy.conditions.locationConstraints.blockedIPs) {
        if (
          policy.conditions.locationConstraints.blockedIPs.includes(
            context.ipAddress,
          )
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Start continuous monitoring
   */
  private startContinuousMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performContinuousAssessment();
    }, 30000); // Every 30 seconds

    console.log("🔄 Continuous Zero Trust monitoring started");
  }

  /**
   * Perform continuous security assessment
   */
  private async performContinuousAssessment(): Promise<void> {
    try {
      // Re-evaluate active sessions
      for (const [contextKey, context] of this.securityContexts) {
        const trustScore = this.calculateTrustScore(context);

        if (trustScore < this.REAUTH_THRESHOLD) {
          console.warn(
            `🚨 Trust score dropped for session ${context.sessionId}: ${trustScore}`,
          );

          // Trigger re-authentication
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("zero-trust:reauth-required", {
                detail: { sessionId: context.sessionId, trustScore },
              }),
            );
          }
        }
      }

      // Clean up old contexts and events
      this.cleanupOldData();

      // Update threat intelligence
      await this.updateThreatIntelligence();
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "ZeroTrustSecurityService.performContinuousAssessment",
      });
    }
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old security contexts
    for (const [key, context] of this.securityContexts) {
      if (now - new Date(context.timestamp).getTime() > maxAge) {
        this.securityContexts.delete(key);
      }
    }

    // Clean up old auth events
    this.authEvents = this.authEvents.filter(
      (event) => now - new Date(event.timestamp).getTime() < maxAge,
    );
  }

  /**
   * Update threat intelligence
   */
  private async updateThreatIntelligence(): Promise<void> {
    // In production, this would fetch from external threat feeds
    // For now, we'll just clean up expired threats
    const now = new Date();

    for (const [id, threat] of this.threatIntelligence) {
      if (threat.expiresAt && new Date(threat.expiresAt) < now) {
        this.threatIntelligence.delete(id);
      }
    }
  }

  /**
   * Limit auth events to prevent memory issues
   */
  private limitAuthEvents(): void {
    if (this.authEvents.length > 10000) {
      this.authEvents = this.authEvents.slice(-5000);
    }
  }

  /**
   * Get security metrics
   */
  public getSecurityMetrics(): {
    totalPolicies: number;
    activePolicies: number;
    microSegments: number;
    threatIndicators: number;
    recentAuthEvents: number;
    averageTrustScore: number;
    highRiskSessions: number;
  } {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recentEvents = this.authEvents.filter(
      (event) => new Date(event.timestamp).getTime() > last24Hours,
    );

    const activeSessions = Array.from(this.securityContexts.values());
    const averageTrustScore =
      activeSessions.length > 0
        ? activeSessions.reduce((sum, ctx) => sum + ctx.overallTrustScore, 0) /
          activeSessions.length
        : 0;

    const highRiskSessions = activeSessions.filter(
      (ctx) => ctx.riskLevel === "high" || ctx.riskLevel === "critical",
    ).length;

    return {
      totalPolicies: this.policies.size,
      activePolicies: Array.from(this.policies.values()).filter(
        (p) => p.isActive,
      ).length,
      microSegments: this.microSegments.size,
      threatIndicators: this.threatIntelligence.size,
      recentAuthEvents: recentEvents.length,
      averageTrustScore: Math.round(averageTrustScore),
      highRiskSessions,
    };
  }

  /**
   * Get recent security events
   */
  public getRecentSecurityEvents(limit: number = 50): ContinuousAuthEvent[] {
    return this.authEvents
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Add custom policy
   */
  public addPolicy(
    policy: Omit<ZeroTrustPolicy, "id" | "createdAt" | "updatedAt">,
  ): string {
    const id = `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullPolicy: ZeroTrustPolicy = {
      ...policy,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(id, fullPolicy);
    console.log(`📋 New Zero Trust policy added: ${policy.name}`);

    return id;
  }

  /**
   * Update policy
   */
  public updatePolicy(id: string, updates: Partial<ZeroTrustPolicy>): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;

    const updatedPolicy = {
      ...policy,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(id, updatedPolicy);
    console.log(`📝 Zero Trust policy updated: ${id}`);

    return true;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.policies.clear();
    this.microSegments.clear();
    this.threatIntelligence.clear();
    this.securityContexts.clear();
    this.authEvents = [];

    console.log("🧹 Zero Trust Security Service destroyed");
  }
}

// Export singleton instance
export const zeroTrustSecurityService = ZeroTrustSecurityService.getInstance();
export default zeroTrustSecurityService;
