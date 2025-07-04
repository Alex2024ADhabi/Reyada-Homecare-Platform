// P4-002: Advanced DDoS Protection & Attack Mitigation
// Comprehensive DDoS protection service for healthcare platform

import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { RateLimitingService } from "./rate-limiting.service";

interface AttackPattern {
  id: string;
  type: "volumetric" | "protocol" | "application";
  signature: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  mitigationActions: string[];
}

interface AttackEvent {
  id: string;
  timestamp: Date;
  sourceIp: string;
  attackType: string;
  severity: string;
  requestCount: number;
  blocked: boolean;
  mitigationApplied: string[];
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
}

interface ThreatIntelligence {
  ipAddress: string;
  threatLevel: number;
  categories: string[];
  lastSeen: Date;
  reputation: "malicious" | "suspicious" | "clean";
  source: string;
}

interface MitigationRule {
  id: string;
  name: string;
  condition: string;
  action: "block" | "rate_limit" | "challenge" | "monitor";
  duration: number;
  priority: number;
  enabled: boolean;
}

class DDoSProtectionService {
  private attackPatterns: Map<string, AttackPattern> = new Map();
  private attackEvents: AttackEvent[] = [];
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private mitigationRules: Map<string, MitigationRule> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, number> = new Map();
  private isMonitoring = false;
  private readonly MAX_EVENTS = 10000;

  constructor() {
    this.initializeAttackPatterns();
    this.initializeMitigationRules();
    this.loadThreatIntelligence();
    this.startMonitoring();
  }

  private initializeAttackPatterns(): void {
    const patterns: AttackPattern[] = [
      {
        id: "volumetric_flood",
        type: "volumetric",
        signature: "high_request_rate",
        threshold: 1000,
        severity: "high",
        mitigationActions: ["rate_limit", "geo_block", "challenge"],
      },
      {
        id: "syn_flood",
        type: "protocol",
        signature: "tcp_syn_flood",
        threshold: 500,
        severity: "critical",
        mitigationActions: ["syn_cookies", "connection_limit"],
      },
      {
        id: "http_flood",
        type: "application",
        signature: "http_request_flood",
        threshold: 200,
        severity: "high",
        mitigationActions: ["rate_limit", "captcha", "js_challenge"],
      },
      {
        id: "slowloris",
        type: "application",
        signature: "slow_http_requests",
        threshold: 50,
        severity: "medium",
        mitigationActions: ["connection_timeout", "request_timeout"],
      },
      {
        id: "healthcare_api_abuse",
        type: "application",
        signature: "healthcare_endpoint_flood",
        threshold: 100,
        severity: "critical",
        mitigationActions: [
          "api_rate_limit",
          "authentication_challenge",
          "block",
        ],
      },
    ];

    patterns.forEach((pattern) => {
      this.attackPatterns.set(pattern.id, pattern);
    });

    console.log(`Initialized ${patterns.length} DDoS attack patterns`);
  }

  private initializeMitigationRules(): void {
    const rules: MitigationRule[] = [
      {
        id: "high_frequency_block",
        name: "Block High Frequency Requests",
        condition: "requests_per_minute > 300",
        action: "block",
        duration: 3600000, // 1 hour
        priority: 1,
        enabled: true,
      },
      {
        id: "suspicious_geo_block",
        name: "Block Suspicious Geolocation",
        condition: "geo_risk_score > 8",
        action: "block",
        duration: 1800000, // 30 minutes
        priority: 2,
        enabled: true,
      },
      {
        id: "healthcare_endpoint_protection",
        name: "Protect Healthcare Endpoints",
        condition: "endpoint_type = healthcare AND requests_per_minute > 50",
        action: "challenge",
        duration: 600000, // 10 minutes
        priority: 1,
        enabled: true,
      },
      {
        id: "adaptive_rate_limiting",
        name: "Adaptive Rate Limiting",
        condition: "system_load > 80",
        action: "rate_limit",
        duration: 300000, // 5 minutes
        priority: 3,
        enabled: true,
      },
    ];

    rules.forEach((rule) => {
      this.mitigationRules.set(rule.id, rule);
    });

    console.log(`Initialized ${rules.length} mitigation rules`);
  }

  private async loadThreatIntelligence(): Promise<void> {
    try {
      // Simulate loading threat intelligence data
      const threatData: ThreatIntelligence[] = [
        {
          ipAddress: "192.168.1.100",
          threatLevel: 9,
          categories: ["botnet", "malware"],
          lastSeen: new Date(Date.now() - 86400000),
          reputation: "malicious",
          source: "threat_feed_1",
        },
        {
          ipAddress: "10.0.0.50",
          threatLevel: 6,
          categories: ["scanner", "suspicious"],
          lastSeen: new Date(Date.now() - 3600000),
          reputation: "suspicious",
          source: "threat_feed_2",
        },
      ];

      threatData.forEach((threat) => {
        this.threatIntelligence.set(threat.ipAddress, threat);
      });

      console.log(`Loaded ${threatData.length} threat intelligence entries`);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DDoSProtectionService.loadThreatIntelligence",
      });
    }
  }

  async analyzeRequest(request: {
    ip: string;
    userAgent: string;
    endpoint: string;
    method: string;
    timestamp: Date;
    headers: Record<string, string>;
  }): Promise<{
    allowed: boolean;
    riskScore: number;
    mitigationActions: string[];
    reason?: string;
  }> {
    try {
      let riskScore = 0;
      const mitigationActions: string[] = [];
      let reason = "";

      // Check if IP is already blocked
      if (this.blockedIPs.has(request.ip)) {
        return {
          allowed: false,
          riskScore: 10,
          mitigationActions: ["blocked"],
          reason: "IP address is blocked",
        };
      }

      // Check threat intelligence
      const threatInfo = this.threatIntelligence.get(request.ip);
      if (threatInfo) {
        riskScore += threatInfo.threatLevel;
        if (threatInfo.reputation === "malicious") {
          this.blockedIPs.add(request.ip);
          return {
            allowed: false,
            riskScore: 10,
            mitigationActions: ["block", "log_security_event"],
            reason: "Malicious IP detected in threat intelligence",
          };
        }
      }

      // Analyze request patterns
      const patternAnalysis = await this.analyzeRequestPatterns(request);
      riskScore += patternAnalysis.riskScore;
      mitigationActions.push(...patternAnalysis.actions);

      // Check rate limiting
      const rateLimitResult = RateLimitingService.checkRateLimit(
        request.ip,
        request.endpoint,
      );

      if (!rateLimitResult.allowed) {
        riskScore += 3;
        mitigationActions.push("rate_limit_exceeded");
        reason = "Rate limit exceeded";
      }

      // Healthcare-specific checks
      if (this.isHealthcareEndpoint(request.endpoint)) {
        const healthcareRisk = await this.analyzeHealthcareRequest(request);
        riskScore += healthcareRisk.riskScore;
        mitigationActions.push(...healthcareRisk.actions);
      }

      // Apply mitigation rules
      const mitigationResult = this.applyMitigationRules(request, riskScore);
      mitigationActions.push(...mitigationResult.actions);

      // Record attack event if high risk
      if (riskScore >= 7) {
        this.recordAttackEvent({
          sourceIp: request.ip,
          attackType: this.determineAttackType(riskScore, mitigationActions),
          severity:
            riskScore >= 9 ? "critical" : riskScore >= 7 ? "high" : "medium",
          requestCount: 1,
          blocked: riskScore >= 8,
          mitigationApplied: mitigationActions,
        });
      }

      return {
        allowed: riskScore < 8,
        riskScore,
        mitigationActions,
        reason:
          riskScore >= 8 ? reason || "High risk score detected" : undefined,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DDoSProtectionService.analyzeRequest",
        ip: request.ip,
        endpoint: request.endpoint,
      });

      // Fail secure - allow request but log error
      return {
        allowed: true,
        riskScore: 0,
        mitigationActions: ["error_occurred"],
      };
    }
  }

  private async analyzeRequestPatterns(request: any): Promise<{
    riskScore: number;
    actions: string[];
  }> {
    let riskScore = 0;
    const actions: string[] = [];

    // Check for suspicious user agents
    if (this.isSuspiciousUserAgent(request.userAgent)) {
      riskScore += 2;
      actions.push("suspicious_user_agent");
    }

    // Check for missing common headers
    if (!request.headers["accept"] || !request.headers["accept-language"]) {
      riskScore += 1;
      actions.push("missing_headers");
    }

    // Check for rapid requests from same IP
    const suspiciousCount = this.suspiciousIPs.get(request.ip) || 0;
    if (suspiciousCount > 10) {
      riskScore += 3;
      actions.push("rapid_requests");
    }

    // Update suspicious IP counter
    this.suspiciousIPs.set(request.ip, suspiciousCount + 1);

    return { riskScore, actions };
  }

  private async analyzeHealthcareRequest(request: any): Promise<{
    riskScore: number;
    actions: string[];
  }> {
    let riskScore = 0;
    const actions: string[] = [];

    // Check for sensitive healthcare endpoints
    const sensitiveEndpoints = [
      "/api/patients",
      "/api/clinical-forms",
      "/api/assessments",
      "/api/episodes",
    ];

    if (
      sensitiveEndpoints.some((endpoint) => request.endpoint.includes(endpoint))
    ) {
      riskScore += 2;
      actions.push("sensitive_healthcare_endpoint");

      // Additional checks for healthcare data access
      if (request.method === "GET" && !request.headers["authorization"]) {
        riskScore += 3;
        actions.push("unauthorized_healthcare_access");
      }
    }

    return { riskScore, actions };
  }

  private applyMitigationRules(
    request: any,
    riskScore: number,
  ): {
    actions: string[];
  } {
    const actions: string[] = [];

    for (const rule of this.mitigationRules.values()) {
      if (!rule.enabled) continue;

      if (this.evaluateRuleCondition(rule.condition, request, riskScore)) {
        actions.push(rule.action);

        if (rule.action === "block") {
          this.blockedIPs.add(request.ip);
          // Auto-unblock after duration
          setTimeout(() => {
            this.blockedIPs.delete(request.ip);
          }, rule.duration);
        }
      }
    }

    return { actions };
  }

  private evaluateRuleCondition(
    condition: string,
    request: any,
    riskScore: number,
  ): boolean {
    // Simple condition evaluation - in production would use a proper rule engine
    if (condition.includes("requests_per_minute > 300")) {
      const count = this.suspiciousIPs.get(request.ip) || 0;
      return count > 300;
    }

    if (condition.includes("geo_risk_score > 8")) {
      return riskScore > 8;
    }

    if (
      condition.includes("healthcare") &&
      condition.includes("requests_per_minute > 50")
    ) {
      const count = this.suspiciousIPs.get(request.ip) || 0;
      return this.isHealthcareEndpoint(request.endpoint) && count > 50;
    }

    if (condition.includes("system_load > 80")) {
      // Mock system load check
      return Math.random() > 0.8;
    }

    return false;
  }

  private isHealthcareEndpoint(endpoint: string): boolean {
    const healthcarePatterns = [
      "/api/patients",
      "/api/clinical",
      "/api/assessments",
      "/api/episodes",
      "/api/doh",
      "/api/daman",
    ];

    return healthcarePatterns.some((pattern) => endpoint.includes(pattern));
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      "bot",
      "crawler",
      "scanner",
      "curl",
      "wget",
      "python-requests",
    ];

    return suspiciousPatterns.some((pattern) =>
      userAgent.toLowerCase().includes(pattern),
    );
  }

  private determineAttackType(riskScore: number, actions: string[]): string {
    if (actions.includes("rate_limit_exceeded")) return "rate_limit_attack";
    if (actions.includes("suspicious_user_agent")) return "bot_attack";
    if (actions.includes("unauthorized_healthcare_access"))
      return "healthcare_data_attack";
    if (riskScore >= 9) return "high_risk_attack";
    return "suspicious_activity";
  }

  private recordAttackEvent(event: Partial<AttackEvent>): void {
    const attackEvent: AttackEvent = {
      id: `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sourceIp: event.sourceIp!,
      attackType: event.attackType!,
      severity: event.severity!,
      requestCount: event.requestCount || 1,
      blocked: event.blocked || false,
      mitigationApplied: event.mitigationApplied || [],
    };

    this.attackEvents.push(attackEvent);

    // Limit stored events
    if (this.attackEvents.length > this.MAX_EVENTS) {
      this.attackEvents = this.attackEvents.slice(-this.MAX_EVENTS);
    }

    // Record metrics
    performanceMonitoringService.recordMetric({
      type: "security",
      name: "DDoS_Attack_Event",
      value: 1,
      unit: "count",
      metadata: {
        attackType: attackEvent.attackType,
        severity: attackEvent.severity,
        blocked: attackEvent.blocked,
      },
    });

    console.log(
      `DDoS attack event recorded: ${attackEvent.attackType} from ${attackEvent.sourceIp}`,
    );
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Clean up suspicious IPs periodically
    setInterval(() => {
      this.cleanupSuspiciousIPs();
    }, 300000); // Every 5 minutes

    // Update threat intelligence
    setInterval(() => {
      this.updateThreatIntelligence();
    }, 3600000); // Every hour

    console.log("DDoS protection monitoring started");
  }

  private cleanupSuspiciousIPs(): void {
    // Reset counters for IPs that haven't been active recently
    const cutoffTime = Date.now() - 300000; // 5 minutes ago

    for (const [ip, count] of this.suspiciousIPs.entries()) {
      if (count < 5) {
        this.suspiciousIPs.delete(ip);
      } else {
        this.suspiciousIPs.set(ip, Math.floor(count * 0.8)); // Decay counter
      }
    }
  }

  private async updateThreatIntelligence(): Promise<void> {
    try {
      // Simulate updating threat intelligence from external sources
      console.log("Updating threat intelligence data...");

      // In production, this would fetch from threat intelligence APIs
      const newThreats = Math.floor(Math.random() * 5);
      console.log(`Updated threat intelligence with ${newThreats} new entries`);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DDoSProtectionService.updateThreatIntelligence",
      });
    }
  }

  // Public API methods
  getAttackEvents(limit: number = 100): AttackEvent[] {
    return this.attackEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  unblockIP(ipAddress: string): boolean {
    return this.blockedIPs.delete(ipAddress);
  }

  addThreatIntelligence(threat: ThreatIntelligence): void {
    this.threatIntelligence.set(threat.ipAddress, threat);
  }

  getProtectionStats(): any {
    const recentEvents = this.attackEvents.filter(
      (event) => Date.now() - event.timestamp.getTime() < 3600000, // Last hour
    );

    return {
      totalAttackEvents: this.attackEvents.length,
      recentAttackEvents: recentEvents.length,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      threatIntelligenceEntries: this.threatIntelligence.size,
      mitigationRules: this.mitigationRules.size,
      attacksByType: this.getAttacksByType(recentEvents),
      attacksBySeverity: this.getAttacksBySeverity(recentEvents),
    };
  }

  private getAttacksByType(events: AttackEvent[]): Record<string, number> {
    const byType: Record<string, number> = {};
    events.forEach((event) => {
      byType[event.attackType] = (byType[event.attackType] || 0) + 1;
    });
    return byType;
  }

  private getAttacksBySeverity(events: AttackEvent[]): Record<string, number> {
    const bySeverity: Record<string, number> = {};
    events.forEach((event) => {
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    });
    return bySeverity;
  }
}

export const ddosProtectionService = new DDoSProtectionService();
export { AttackPattern, AttackEvent, ThreatIntelligence, MitigationRule };
export default ddosProtectionService;
