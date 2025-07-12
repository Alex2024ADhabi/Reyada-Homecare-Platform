import { errorHandlerService } from "./error-handler.service";
import { validationService } from "./validation.service";

interface BiometricTemplate {
  id: string;
  userId: string;
  type: "fingerprint" | "face" | "voice" | "iris";
  template: string; // Encrypted biometric template
  quality: number;
  createdAt: string;
  lastUsed?: string;
  deviceId: string;
  isActive: boolean;
}

interface AuthenticationAttempt {
  id: string;
  userId: string;
  method: "password" | "biometric" | "mfa" | "sso";
  success: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  riskScore: number;
  failureReason?: string;
}

interface SecurityEvent {
  id: string;
  type:
    | "login_attempt"
    | "suspicious_activity"
    | "data_access"
    | "permission_change"
    | "security_violation";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  actionTaken?: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class SecurityService {
  private biometricTemplates: Map<string, BiometricTemplate[]> = new Map();
  private authAttempts: Map<string, AuthenticationAttempt[]> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private encryptionKey: string;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.startSecurityMonitoring();
    this.setupSecurityHeaders();
  }

  private generateEncryptionKey(): string {
    // In production, this should be loaded from secure environment variables
    return process.env.ENCRYPTION_KEY || "default-key-change-in-production";
  }

  private setupSecurityHeaders(): void {
    // Set security headers for the application
    if (typeof document !== "undefined") {
      const meta = document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content =
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
      document.head.appendChild(meta);
    }
  }

  // Biometric Authentication
  async registerBiometric(
    userId: string,
    biometricData: {
      type: "fingerprint" | "face" | "voice" | "iris";
      rawTemplate: string;
      quality: number;
      deviceId: string;
    },
  ): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      // Validate biometric data
      const validation = validationService.validateBiometricData({
        template: biometricData.rawTemplate,
        score: biometricData.quality,
        method: biometricData.type,
        deviceId: biometricData.deviceId,
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: `Biometric validation failed: ${validation.errors.join(", ")}`,
        };
      }

      // Encrypt the biometric template
      const encryptedTemplate = await this.encryptBiometricTemplate(
        biometricData.rawTemplate,
      );

      const template: BiometricTemplate = {
        id: `bio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: biometricData.type,
        template: encryptedTemplate,
        quality: biometricData.quality,
        createdAt: new Date().toISOString(),
        deviceId: biometricData.deviceId,
        isActive: true,
      };

      // Store the template
      const userTemplates = this.biometricTemplates.get(userId) || [];
      userTemplates.push(template);
      this.biometricTemplates.set(userId, userTemplates);

      // Log security event
      this.logSecurityEvent({
        type: "permission_change",
        severity: "medium",
        userId,
        description: `Biometric template registered: ${biometricData.type}`,
        metadata: {
          templateId: template.id,
          biometricType: biometricData.type,
          quality: biometricData.quality,
          deviceId: biometricData.deviceId,
        },
      });

      return { success: true, templateId: template.id };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityService.registerBiometric",
        userId,
        biometricType: biometricData.type,
      });
      return { success: false, error: "Failed to register biometric template" };
    }
  }

  async authenticateBiometric(
    userId: string,
    biometricData: {
      type: "fingerprint" | "face" | "voice" | "iris";
      template: string;
      deviceId: string;
    },
  ): Promise<{ success: boolean; confidence?: number; error?: string }> {
    try {
      const userTemplates = this.biometricTemplates.get(userId) || [];
      const matchingTemplates = userTemplates.filter(
        (t) =>
          t.type === biometricData.type &&
          t.deviceId === biometricData.deviceId &&
          t.isActive,
      );

      if (matchingTemplates.length === 0) {
        this.logAuthenticationAttempt(userId, "biometric", false, {
          failureReason: "No matching biometric template found",
          biometricType: biometricData.type,
          deviceId: biometricData.deviceId,
        });
        return {
          success: false,
          error: "No matching biometric template found",
        };
      }

      // Compare with stored templates
      let bestMatch = 0;
      for (const template of matchingTemplates) {
        const decryptedTemplate = await this.decryptBiometricTemplate(
          template.template,
        );
        const confidence = await this.compareBiometricTemplates(
          decryptedTemplate,
          biometricData.template,
        );
        bestMatch = Math.max(bestMatch, confidence);
      }

      const threshold = 85; // Minimum 85% confidence
      const success = bestMatch >= threshold;

      this.logAuthenticationAttempt(userId, "biometric", success, {
        biometricType: biometricData.type,
        confidence: bestMatch,
        deviceId: biometricData.deviceId,
        failureReason: success
          ? undefined
          : "Biometric match confidence too low",
      });

      if (success) {
        // Update last used timestamp
        matchingTemplates.forEach((template) => {
          template.lastUsed = new Date().toISOString();
        });
      }

      return { success, confidence: bestMatch };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityService.authenticateBiometric",
        userId,
        biometricType: biometricData.type,
      });
      return { success: false, error: "Biometric authentication failed" };
    }
  }

  private async encryptBiometricTemplate(template: string): Promise<string> {
    // In production, use proper encryption (AES-256)
    // This is a simplified example
    const encoder = new TextEncoder();
    const data = encoder.encode(template);
    const key = encoder.encode(this.encryptionKey.padEnd(32, "0").slice(0, 32));

    // Simple XOR encryption (use proper crypto in production)
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ key[i % key.length];
    }

    return btoa(String.fromCharCode(...encrypted));
  }

  private async decryptBiometricTemplate(
    encryptedTemplate: string,
  ): Promise<string> {
    // Reverse of encryption process
    const encrypted = new Uint8Array(
      atob(encryptedTemplate)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    const encoder = new TextEncoder();
    const key = encoder.encode(this.encryptionKey.padEnd(32, "0").slice(0, 32));

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }

    return new TextDecoder().decode(decrypted);
  }

  private async compareBiometricTemplates(
    template1: string,
    template2: string,
  ): Promise<number> {
    // Simplified biometric comparison
    // In production, use proper biometric matching algorithms
    const similarity = this.calculateStringSimilarity(template1, template2);
    return Math.round(similarity * 100);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Rate Limiting
  async checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const now = Date.now();
      const entry = this.rateLimits.get(identifier);

      if (!entry) {
        // First request
        this.rateLimits.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
          blocked: false,
        });
        return {
          allowed: true,
          remaining: maxAttempts - 1,
          resetTime: now + windowMs,
        };
      }

      // Check if window has expired
      if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + windowMs;
        entry.blocked = false;
        entry.blockUntil = undefined;
        return {
          allowed: true,
          remaining: maxAttempts - 1,
          resetTime: entry.resetTime,
        };
      }

      // Check if currently blocked
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        return { allowed: false, remaining: 0, resetTime: entry.blockUntil };
      }

      // Increment count
      entry.count++;

      if (entry.count > maxAttempts) {
        entry.blocked = true;
        entry.blockUntil = now + windowMs * 2; // Block for double the window time

        this.logSecurityEvent({
          type: "suspicious_activity",
          severity: "high",
          description: `Rate limit exceeded for identifier: ${identifier}`,
          metadata: {
            identifier,
            attempts: entry.count,
            maxAttempts,
            windowMs,
          },
        });

        return { allowed: false, remaining: 0, resetTime: entry.blockUntil };
      }

      return {
        allowed: true,
        remaining: maxAttempts - entry.count,
        resetTime: entry.resetTime,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityService.checkRateLimit",
        identifier,
        maxAttempts,
        windowMs,
      });
      // Fail secure - deny access on error
      return { allowed: false, remaining: 0, resetTime: Date.now() + windowMs };
    }
  }

  // Authentication Logging
  private logAuthenticationAttempt(
    userId: string,
    method: "password" | "biometric" | "mfa" | "sso",
    success: boolean,
    metadata: Record<string, any> = {},
  ): void {
    const attempt: AuthenticationAttempt = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      method,
      success,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      deviceId: metadata.deviceId || "unknown",
      riskScore: this.calculateRiskScore(userId, metadata),
      failureReason: metadata.failureReason,
    };

    const userAttempts = this.authAttempts.get(userId) || [];
    userAttempts.push(attempt);

    // Keep only recent attempts (last 100)
    if (userAttempts.length > 100) {
      userAttempts.splice(0, userAttempts.length - 100);
    }

    this.authAttempts.set(userId, userAttempts);

    // Check for suspicious patterns
    this.analyzeAuthenticationPatterns(userId, attempt);
  }

  private calculateRiskScore(
    userId: string,
    metadata: Record<string, any>,
  ): number {
    let riskScore = 0;

    // Check recent failed attempts
    const userAttempts = this.authAttempts.get(userId) || [];
    const recentFailures = userAttempts.filter(
      (attempt) =>
        !attempt.success &&
        Date.now() - new Date(attempt.timestamp).getTime() < 60 * 60 * 1000, // Last hour
    ).length;

    riskScore += recentFailures * 20;

    // Check for new device
    const knownDevices = new Set(
      userAttempts.map((attempt) => attempt.deviceId),
    );
    if (metadata.deviceId && !knownDevices.has(metadata.deviceId)) {
      riskScore += 30;
    }

    // Check for unusual time
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 10;
    }

    return Math.min(100, riskScore);
  }

  private analyzeAuthenticationPatterns(
    userId: string,
    attempt: AuthenticationAttempt,
  ): void {
    const userAttempts = this.authAttempts.get(userId) || [];
    const recentAttempts = userAttempts.filter(
      (a) => Date.now() - new Date(a.timestamp).getTime() < 60 * 60 * 1000, // Last hour
    );

    // Check for brute force attempts
    const failedAttempts = recentAttempts.filter((a) => !a.success);
    if (failedAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      this.logSecurityEvent({
        type: "suspicious_activity",
        severity: "high",
        userId,
        description: "Multiple failed authentication attempts detected",
        metadata: {
          failedAttempts: failedAttempts.length,
          timeWindow: "1 hour",
          lastAttempt: attempt,
        },
      });
    }

    // Check for high-risk login
    if (attempt.riskScore > 70) {
      this.logSecurityEvent({
        type: "suspicious_activity",
        severity: "medium",
        userId,
        description: "High-risk authentication attempt",
        metadata: {
          riskScore: attempt.riskScore,
          attempt,
        },
      });
    }
  }

  // Security Event Logging
  private logSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">,
  ): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events (last 1000)
    if (this.securityEvents.length > 1000) {
      this.securityEvents.splice(0, this.securityEvents.length - 1000);
    }

    // Handle critical events immediately
    if (event.severity === "critical") {
      this.handleCriticalSecurityEvent(securityEvent);
    }
  }

  private handleCriticalSecurityEvent(event: SecurityEvent): void {
    console.error("CRITICAL SECURITY EVENT:", event);

    // In production, you would:
    // - Send immediate alerts to security team
    // - Trigger automated response procedures
    // - Log to external security monitoring system
    // - Potentially lock affected accounts
  }

  // Utility Methods
  private getClientIP(): string {
    // In a real application, this would be provided by the server
    return "127.0.0.1";
  }

  private startSecurityMonitoring(): void {
    setInterval(
      () => {
        this.performSecurityChecks();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  private performSecurityChecks(): void {
    // Clean up old rate limit entries
    const now = Date.now();
    for (const [key, entry] of this.rateLimits.entries()) {
      if (
        now > entry.resetTime &&
        (!entry.blockUntil || now > entry.blockUntil)
      ) {
        this.rateLimits.delete(key);
      }
    }

    // Check for patterns in security events
    this.analyzeSecurityTrends();
  }

  private analyzeSecurityTrends(): void {
    const recentEvents = this.securityEvents.filter(
      (event) =>
        Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000, // Last 24 hours
    );

    const criticalEvents = recentEvents.filter(
      (event) => event.severity === "critical",
    );
    const highSeverityEvents = recentEvents.filter(
      (event) => event.severity === "high",
    );

    if (criticalEvents.length > 5) {
      this.logSecurityEvent({
        type: "security_violation",
        severity: "critical",
        description: "High number of critical security events detected",
        metadata: {
          criticalEventCount: criticalEvents.length,
          timeWindow: "24 hours",
        },
      });
    }
  }

  // Public API
  getSecurityEvents(severity?: string, limit: number = 50): SecurityEvent[] {
    let events = this.securityEvents;

    if (severity) {
      events = events.filter((event) => event.severity === severity);
    }

    return events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  getAuthenticationHistory(
    userId: string,
    limit: number = 20,
  ): AuthenticationAttempt[] {
    const userAttempts = this.authAttempts.get(userId) || [];
    return userAttempts
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  getBiometricTemplates(userId: string): Omit<BiometricTemplate, "template">[] {
    const templates = this.biometricTemplates.get(userId) || [];
    return templates.map(({ template, ...rest }) => rest);
  }

  revokeBiometricTemplate(userId: string, templateId: string): boolean {
    const templates = this.biometricTemplates.get(userId) || [];
    const templateIndex = templates.findIndex((t) => t.id === templateId);

    if (templateIndex !== -1) {
      templates[templateIndex].isActive = false;
      this.logSecurityEvent({
        type: "permission_change",
        severity: "medium",
        userId,
        description: "Biometric template revoked",
        metadata: { templateId },
      });
      return true;
    }

    return false;
  }

  getSecurityMetrics(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    recentAuthAttempts: number;
    failedAuthAttempts: number;
    activeBiometricTemplates: number;
    blockedIPs: number;
  } {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recentEvents = this.securityEvents.filter(
      (event) => new Date(event.timestamp).getTime() > last24Hours,
    );

    const eventsBySeverity: Record<string, number> = {};
    recentEvents.forEach((event) => {
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;
    });

    let totalAuthAttempts = 0;
    let failedAuthAttempts = 0;
    let activeBiometricTemplates = 0;

    for (const attempts of this.authAttempts.values()) {
      const recentAttempts = attempts.filter(
        (attempt) => new Date(attempt.timestamp).getTime() > last24Hours,
      );
      totalAuthAttempts += recentAttempts.length;
      failedAuthAttempts += recentAttempts.filter(
        (attempt) => !attempt.success,
      ).length;
    }

    for (const templates of this.biometricTemplates.values()) {
      activeBiometricTemplates += templates.filter(
        (template) => template.isActive,
      ).length;
    }

    const blockedIPs = Array.from(this.rateLimits.values()).filter(
      (entry) => entry.blocked,
    ).length;

    return {
      totalEvents: recentEvents.length,
      eventsBySeverity,
      recentAuthAttempts: totalAuthAttempts,
      failedAuthAttempts,
      activeBiometricTemplates,
      blockedIPs,
    };
  }

  // Cleanup
  destroy(): void {
    this.biometricTemplates.clear();
    this.authAttempts.clear();
    this.securityEvents = [];
    this.rateLimits.clear();
  }
}

export const securityService = new SecurityService();
export {
  BiometricTemplate,
  AuthenticationAttempt,
  SecurityEvent,
  RateLimitConfig,
};
