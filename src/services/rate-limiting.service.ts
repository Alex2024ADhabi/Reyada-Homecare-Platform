// P4-004: Enhanced Rate Limiting Service
// Advanced rate limiting service for healthcare platform API protection
// Enhanced from P1-006 with Phase 4 performance and security optimizations

import { RATE_LIMITING_CONFIG } from "@/config/auth.config";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { advancedCachingService } from "./advanced-caching.service";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  firstRequest?: number;
  lastRequest?: number;
  violations?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
  ruleId?: string;
}

interface EnhancedRateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any) => void;
  enabled: boolean;
  priority: number;
  healthcareSpecific?: boolean;
}

interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  averageRequestsPerSecond: number;
  peakRequestsPerSecond: number;
  activeRules: number;
  topBlockedEndpoints: Array<{ endpoint: string; count: number }>;
  violationsByType: Map<string, number>;
}

interface AdaptiveConfig {
  enabled: boolean;
  systemLoadThreshold: number;
  responseTimeThreshold: number;
  errorRateThreshold: number;
  adaptationFactor: number;
}

export class RateLimitingService {
  private static store = new Map<string, RateLimitEntry>();
  private static blockedIPs = new Set<string>();
  private static enhancedRules = new Map<string, EnhancedRateLimitRule>();
  private static metrics: RateLimitMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    blockRate: 0,
    averageRequestsPerSecond: 0,
    peakRequestsPerSecond: 0,
    activeRules: 0,
    topBlockedEndpoints: [],
    violationsByType: new Map(),
  };
  private static adaptiveConfig: AdaptiveConfig = {
    enabled: true,
    systemLoadThreshold: 80,
    responseTimeThreshold: 2000,
    errorRateThreshold: 5,
    adaptationFactor: 0.5,
  };
  private static isMonitoring = false;

  // Enhanced initialization with healthcare-specific rules
  static initialize() {
    // Initialize enhanced healthcare-specific rules
    this.initializeHealthcareRules();

    // Start monitoring
    this.startEnhancedMonitoring();

    // Original cleanup interval
    setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );

    console.log(
      "Enhanced Rate Limiting Service initialized with healthcare rules",
    );
  }

  private static initializeHealthcareRules(): void {
    const healthcareRules: EnhancedRateLimitRule[] = [
      {
        id: "patient_data_access",
        name: "Patient Data Access Limit",
        endpoint: "/api/patients/*",
        method: "GET",
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        enabled: true,
        priority: 2,
        healthcareSpecific: true,
      },
      {
        id: "clinical_form_submission",
        name: "Clinical Form Submission Limit",
        endpoint: "/api/clinical-forms",
        method: "POST",
        windowMs: 300000, // 5 minutes
        maxRequests: 50,
        enabled: true,
        priority: 2,
        healthcareSpecific: true,
      },
      {
        id: "doh_compliance_check",
        name: "DOH Compliance Check Limit",
        endpoint: "/api/doh/validate",
        method: "POST",
        windowMs: 60000,
        maxRequests: 20,
        enabled: true,
        priority: 3,
        healthcareSpecific: true,
      },
      {
        id: "daman_authorization",
        name: "Daman Authorization Limit",
        endpoint: "/api/daman/authorize",
        method: "POST",
        windowMs: 300000,
        maxRequests: 30,
        enabled: true,
        priority: 3,
        healthcareSpecific: true,
      },
      {
        id: "authentication_attempts",
        name: "Authentication Attempts Limit",
        endpoint: "/api/auth/login",
        method: "POST",
        windowMs: 900000, // 15 minutes
        maxRequests: 5,
        enabled: true,
        priority: 4,
        healthcareSpecific: false,
      },
      {
        id: "file_upload_healthcare",
        name: "Healthcare File Upload Limit",
        endpoint: "/api/upload",
        method: "POST",
        windowMs: 300000,
        maxRequests: 10,
        enabled: true,
        priority: 3,
        healthcareSpecific: true,
      },
    ];

    healthcareRules.forEach((rule) => {
      this.enhancedRules.set(rule.id, rule);
    });

    this.metrics.activeRules = this.enhancedRules.size;
  }

  // Enhanced rate limit check with healthcare-specific logic
  static checkRateLimit(
    identifier: string,
    endpoint: string,
    userRole?: string,
    options?: {
      method?: string;
      skipCache?: boolean;
      customKey?: string;
    },
  ): RateLimitResult {
    try {
      this.metrics.totalRequests++;

      // Bypass rate limiting for admin roles
      if (userRole && RATE_LIMITING_CONFIG.bypassRoles.includes(userRole)) {
        return {
          allowed: true,
          remaining: Infinity,
          resetTime: Date.now() + 60000,
          reason: "Admin bypass",
        };
      }

      // Check if IP is blocked
      if (this.blockedIPs.has(identifier)) {
        this.metrics.blockedRequests++;
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + 3600000, // 1 hour
          retryAfter: 3600,
          reason: "IP blocked due to violations",
        };
      }

      // Check enhanced healthcare-specific rules first
      const enhancedResult = this.checkEnhancedRules(
        identifier,
        endpoint,
        options?.method || "GET",
        options?.customKey,
      );

      if (enhancedResult) {
        if (!enhancedResult.allowed) {
          this.metrics.blockedRequests++;
          this.updateBlockedEndpointStats(endpoint);
          this.recordViolation(enhancedResult.ruleId || "unknown");
        }
        return enhancedResult;
      }

      // Fall back to original rate limiting logic
      const config =
        RATE_LIMITING_CONFIG.endpoints[endpoint] || RATE_LIMITING_CONFIG.global;
      const key = options?.customKey || `${identifier}:${endpoint}`;
      const now = Date.now();

      let entry = this.store.get(key);

      // Clean up expired entries
      if (entry && entry.resetTime < now) {
        this.store.delete(key);
        entry = undefined;
      }

      if (!entry) {
        entry = {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false,
          firstRequest: now,
          lastRequest: now,
          violations: 0,
        };
        this.store.set(key, entry);

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: entry.resetTime,
        };
      }

      entry.count++;
      entry.lastRequest = now;

      if (entry.count > config.maxRequests) {
        entry.blocked = true;
        entry.violations = (entry.violations || 0) + 1;
        this.metrics.blockedRequests++;

        // Block IP after multiple violations
        if (entry.count > config.maxRequests * 2) {
          this.blockedIPs.add(identifier);
          // Auto-unblock after 1 hour
          setTimeout(() => {
            this.blockedIPs.delete(identifier);
          }, 3600000);
        }

        // Record security event
        performanceMonitoringService.recordMetric({
          type: "security",
          name: "Rate_Limit_Exceeded",
          value: 1,
          unit: "count",
          metadata: {
            endpoint,
            identifier: identifier.substring(0, 20),
            violations: entry.violations,
          },
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          reason: "Rate limit exceeded",
        };
      }

      // Apply adaptive rate limiting if enabled
      if (this.adaptiveConfig.enabled) {
        const adaptiveResult = this.applyAdaptiveRateLimit({
          allowed: true,
          remaining: config.maxRequests - entry.count,
          resetTime: entry.resetTime,
        });

        if (!adaptiveResult.allowed) {
          this.metrics.blockedRequests++;
          return adaptiveResult;
        }
      }

      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "RateLimitingService.checkRateLimit",
        identifier: identifier.substring(0, 20),
        endpoint,
      });

      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: 1000,
        resetTime: Date.now() + 60000,
        reason: "Rate limiting service error",
      };
    }
  }

  private static checkEnhancedRules(
    identifier: string,
    endpoint: string,
    method: string,
    customKey?: string,
  ): RateLimitResult | null {
    const applicableRules = this.findApplicableRules(endpoint, method);

    if (applicableRules.length === 0) {
      return null;
    }

    // Check each rule (most restrictive wins)
    for (const rule of applicableRules) {
      const result = this.checkRule(rule, identifier, customKey);

      if (!result.allowed) {
        return {
          ...result,
          ruleId: rule.id,
          reason: `Rate limit exceeded for ${rule.name}`,
        };
      }
    }

    return null;
  }

  private static findApplicableRules(
    endpoint: string,
    method: string,
  ): EnhancedRateLimitRule[] {
    const applicableRules: EnhancedRateLimitRule[] = [];

    for (const rule of this.enhancedRules.values()) {
      if (!rule.enabled) continue;

      // Check method match
      if (
        rule.method !== "*" &&
        rule.method.toLowerCase() !== method.toLowerCase()
      ) {
        continue;
      }

      // Check endpoint match (support wildcards)
      if (this.matchesEndpoint(endpoint, rule.endpoint)) {
        applicableRules.push(rule);
      }
    }

    // Sort by priority (higher priority first)
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  private static matchesEndpoint(endpoint: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern === endpoint) return true;

    // Handle wildcard patterns
    if (pattern.includes("*")) {
      const regexPattern = pattern.replace(/\*/g, ".*").replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(endpoint);
    }

    return false;
  }

  private static checkRule(
    rule: EnhancedRateLimitRule,
    identifier: string,
    customKey?: string,
  ): RateLimitResult {
    const key =
      customKey ||
      rule.keyGenerator?.(identifier) ||
      `${rule.id}:${identifier}`;
    const now = Date.now();

    let entry = this.store.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.store.delete(key);
      entry = undefined;
    }

    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + rule.windowMs,
        blocked: false,
        firstRequest: now,
        lastRequest: now,
        violations: 0,
      };
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: rule.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    entry.lastRequest = now;

    if (entry.count > rule.maxRequests) {
      entry.blocked = true;
      entry.violations = (entry.violations || 0) + 1;

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: rule.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private static applyAdaptiveRateLimit(
    result: RateLimitResult,
  ): RateLimitResult {
    // Mock system metrics - in production, get from actual monitoring
    const systemLoad = Math.random() * 100;
    const averageResponseTime = Math.random() * 3000;
    const errorRate = Math.random() * 10;

    let shouldAdapt = false;
    let adaptationReason = "";

    if (systemLoad > this.adaptiveConfig.systemLoadThreshold) {
      shouldAdapt = true;
      adaptationReason = "High system load";
    } else if (
      averageResponseTime > this.adaptiveConfig.responseTimeThreshold
    ) {
      shouldAdapt = true;
      adaptationReason = "High response time";
    } else if (errorRate > this.adaptiveConfig.errorRateThreshold) {
      shouldAdapt = true;
      adaptationReason = "High error rate";
    }

    if (shouldAdapt && result.remaining !== undefined) {
      const adaptedRemaining = Math.floor(
        result.remaining * this.adaptiveConfig.adaptationFactor,
      );

      if (adaptedRemaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: result.resetTime,
          retryAfter: 60, // 1 minute
          reason: `Adaptive rate limiting: ${adaptationReason}`,
        };
      }
    }

    return result;
  }

  // Healthcare-specific rate limiting methods
  static checkPatientDataAccess(
    userId: string,
    patientId: string,
  ): RateLimitResult {
    return this.checkRateLimit(
      userId,
      `/api/patients/${patientId}`,
      undefined,
      {
        method: "GET",
        customKey: `patient_access:${userId}:${patientId}`,
      },
    );
  }

  static checkClinicalFormSubmission(
    userId: string,
    formType: string,
  ): RateLimitResult {
    return this.checkRateLimit(userId, "/api/clinical-forms", undefined, {
      method: "POST",
      customKey: `form_submission:${userId}:${formType}`,
    });
  }

  static checkDOHValidation(userId: string): RateLimitResult {
    return this.checkRateLimit(userId, "/api/doh/validate", undefined, {
      method: "POST",
    });
  }

  static checkDamanAuthorization(userId: string): RateLimitResult {
    return this.checkRateLimit(userId, "/api/daman/authorize", undefined, {
      method: "POST",
    });
  }

  // Enhanced monitoring and metrics
  private static startEnhancedMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);

    console.log("Enhanced rate limiting monitoring started");
  }

  private static updateMetrics(): void {
    // Calculate block rate
    this.metrics.blockRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.blockedRequests / this.metrics.totalRequests) * 100
        : 0;

    // Calculate requests per second (mock calculation)
    this.metrics.averageRequestsPerSecond = this.metrics.totalRequests / 60;
    this.metrics.peakRequestsPerSecond = Math.max(
      this.metrics.peakRequestsPerSecond,
      this.metrics.averageRequestsPerSecond,
    );

    // Report metrics
    performanceMonitoringService.recordMetric({
      type: "security",
      name: "Rate_Limit_Block_Rate",
      value: this.metrics.blockRate,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "security",
      name: "Requests_Per_Second",
      value: this.metrics.averageRequestsPerSecond,
      unit: "rps",
    });
  }

  private static updateBlockedEndpointStats(endpoint: string): void {
    const existing = this.metrics.topBlockedEndpoints.find(
      (e) => e.endpoint === endpoint,
    );
    if (existing) {
      existing.count++;
    } else {
      this.metrics.topBlockedEndpoints.push({ endpoint, count: 1 });
    }

    // Keep only top 10
    this.metrics.topBlockedEndpoints.sort((a, b) => b.count - a.count);
    this.metrics.topBlockedEndpoints = this.metrics.topBlockedEndpoints.slice(
      0,
      10,
    );
  }

  private static recordViolation(ruleId: string): void {
    const current = this.metrics.violationsByType.get(ruleId) || 0;
    this.metrics.violationsByType.set(ruleId, current + 1);
  }

  // Record successful request (for endpoints that skip successful requests)
  static recordSuccess(identifier: string, endpoint: string) {
    const config = RATE_LIMITING_CONFIG.endpoints[endpoint];
    if (config?.skipSuccessfulRequests) {
      const key = `${identifier}:${endpoint}`;
      const entry = this.store.get(key);
      if (entry && entry.count > 0) {
        entry.count--;
      }
    }
  }

  // Get current rate limit status
  static getRateLimitStatus(identifier: string, endpoint: string) {
    const config =
      RATE_LIMITING_CONFIG.endpoints[endpoint] || RATE_LIMITING_CONFIG.global;
    const key = `${identifier}:${endpoint}`;
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || entry.resetTime < now) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked,
      violations: entry.violations || 0,
      firstRequest: entry.firstRequest,
      lastRequest: entry.lastRequest,
    };
  }

  // Enhanced public API methods
  static getMetrics(): RateLimitMetrics {
    return { ...this.metrics };
  }

  static getHealthcareRules(): EnhancedRateLimitRule[] {
    return Array.from(this.enhancedRules.values()).filter(
      (rule) => rule.healthcareSpecific,
    );
  }

  static getRule(ruleId: string): EnhancedRateLimitRule | undefined {
    return this.enhancedRules.get(ruleId);
  }

  static addRule(rule: EnhancedRateLimitRule): boolean {
    try {
      this.enhancedRules.set(rule.id, rule);
      this.metrics.activeRules = this.enhancedRules.size;
      console.log(`Added enhanced rate limiting rule: ${rule.name}`);
      return true;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "RateLimitingService.addRule",
        ruleId: rule.id,
      });
      return false;
    }
  }

  static updateRule(
    ruleId: string,
    updates: Partial<EnhancedRateLimitRule>,
  ): boolean {
    try {
      const existingRule = this.enhancedRules.get(ruleId);
      if (!existingRule) {
        console.warn(`Rule not found: ${ruleId}`);
        return false;
      }

      const updatedRule = { ...existingRule, ...updates };
      this.enhancedRules.set(ruleId, updatedRule);
      console.log(`Updated rate limiting rule: ${ruleId}`);
      return true;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "RateLimitingService.updateRule",
        ruleId,
      });
      return false;
    }
  }

  // Clear rate limit for identifier (admin function)
  static clearRateLimit(identifier: string, endpoint?: string) {
    if (endpoint) {
      const key = `${identifier}:${endpoint}`;
      this.store.delete(key);
    } else {
      // Clear all entries for identifier
      for (const key of this.store.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.store.delete(key);
        }
      }
    }

    // Remove from blocked IPs
    this.blockedIPs.delete(identifier);
  }

  // Get blocked IPs (admin function)
  static getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // Cleanup expired entries (should be called periodically)
  static cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  static getHealthStatus(): any {
    return {
      status: this.isMonitoring ? "healthy" : "inactive",
      activeRules: this.metrics.activeRules,
      enhancedRules: this.enhancedRules.size,
      totalRequests: this.metrics.totalRequests,
      blockRate: this.metrics.blockRate,
      blockedIPs: this.blockedIPs.size,
      adaptiveEnabled: this.adaptiveConfig.enabled,
      lastCheck: new Date(),
    };
  }
}

// Enhanced middleware function for Express.js
export const rateLimitMiddleware = (
  endpoint: string,
  options?: { method?: string },
) => {
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const userRole = req.user?.role;
    const method = options?.method || req.method;

    const result = RateLimitingService.checkRateLimit(
      identifier,
      endpoint,
      userRole,
      { method },
    );

    // Set rate limit headers
    const limit =
      RATE_LIMITING_CONFIG.endpoints[endpoint]?.maxRequests ||
      RATE_LIMITING_CONFIG.global.maxRequests;

    res.set({
      "X-RateLimit-Limit": limit,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    });

    if (result.ruleId) {
      res.set("X-RateLimit-Rule", result.ruleId);
    }

    if (!result.allowed) {
      if (result.retryAfter) {
        res.set("Retry-After", result.retryAfter.toString());
      }

      return res.status(429).json({
        error: "Too Many Requests",
        message:
          result.reason ||
          RATE_LIMITING_CONFIG.endpoints[endpoint]?.message ||
          RATE_LIMITING_CONFIG.global.message,
        retryAfter: result.retryAfter,
        ruleId: result.ruleId,
      });
    }

    // Record successful request on response
    res.on("finish", () => {
      if (res.statusCode < 400) {
        RateLimitingService.recordSuccess(identifier, endpoint);
      }
    });

    next();
  };
};

export default RateLimitingService;
