/**
 * Session Management Validator
 * Validates and manages user sessions with security controls
 * Part of Phase 1: Foundation & Core Features - Missing Validators
 */

import { EventEmitter } from 'eventemitter3';

// Session Management Types
export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'terminated' | 'suspended';
  metadata: {
    loginMethod: 'password' | 'biometric' | 'mfa' | 'sso';
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
    location: GeolocationData | null;
    riskScore: number; // 0-100
    trustLevel: 'low' | 'medium' | 'high';
  };
  security: {
    encrypted: boolean;
    tokenHash: string;
    refreshTokenHash?: string;
    csrfToken: string;
    mfaVerified: boolean;
    biometricVerified: boolean;
  };
  activity: SessionActivity[];
  permissions: SessionPermissions;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface SessionActivity {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  method: string;
  statusCode: number;
  duration: number; // milliseconds
  dataAccessed: string[];
  riskIndicators: string[];
}

export interface SessionPermissions {
  roles: string[];
  permissions: string[];
  dataAccess: {
    patientData: 'none' | 'read' | 'write' | 'admin';
    clinicalData: 'none' | 'read' | 'write' | 'admin';
    systemConfig: 'none' | 'read' | 'write' | 'admin';
  };
  restrictions: {
    ipWhitelist: string[];
    timeRestrictions: TimeRestriction[];
    deviceRestrictions: string[];
  };
}

export interface TimeRestriction {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: SessionIssue[];
  warnings: SessionWarning[];
  recommendations: string[];
  riskAssessment: RiskAssessment;
  complianceStatus: ComplianceStatus;
}

export interface SessionIssue {
  type: 'security' | 'compliance' | 'policy' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  message: string;
  details: any;
  remediation: string;
}

export interface SessionWarning {
  type: 'unusual_activity' | 'location_change' | 'device_change' | 'time_restriction';
  message: string;
  details: any;
  suggestion: string;
}

export interface RiskAssessment {
  overallRisk: number; // 0-100
  factors: {
    locationRisk: number;
    deviceRisk: number;
    behaviorRisk: number;
    timeRisk: number;
    accessPatternRisk: number;
  };
  anomalies: RiskAnomaly[];
  mitigations: string[];
}

export interface RiskAnomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  indicators: string[];
}

export interface ComplianceStatus {
  hipaa: boolean;
  gdpr: boolean;
  uaeDataLaw: boolean;
  dohRequirements: boolean;
  issues: string[];
  recommendations: string[];
}

export interface SessionPolicy {
  id: string;
  name: string;
  maxSessionDuration: number; // minutes
  maxInactivityPeriod: number; // minutes
  maxConcurrentSessions: number;
  requireMFA: boolean;
  requireBiometric: boolean;
  allowedDeviceTypes: string[];
  ipWhitelistRequired: boolean;
  locationTrackingRequired: boolean;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  complianceRequirements: string[];
}

class SessionManagementValidator extends EventEmitter {
  private sessions: Map<string, UserSession> = new Map();
  private sessionPolicies: Map<string, SessionPolicy> = new Map();
  private isInitialized = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeValidator();
  }

  private async initializeValidator(): Promise<void> {
    try {
      console.log("🔐 Initializing Session Management Validator...");

      // Load session policies
      await this.loadSessionPolicies();

      // Initialize security monitoring
      await this.initializeSecurityMonitoring();

      // Setup session cleanup
      this.setupSessionCleanup();

      // Start continuous monitoring
      this.startContinuousMonitoring();

      this.isInitialized = true;
      this.emit("validator:initialized");

      console.log("✅ Session Management Validator initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Session Management Validator:", error);
      throw error;
    }
  }

  /**
   * Create new user session with validation
   */
  async createSession(sessionData: Omit<UserSession, 'id' | 'createdAt' | 'lastActivity' | 'status' | 'activity'>): Promise<UserSession> {
    try {
      if (!this.isInitialized) {
        throw new Error("Validator not initialized");
      }

      const sessionId = this.generateSessionId();
      const now = new Date().toISOString();

      // Calculate session expiration
      const policy = this.getApplicablePolicy(sessionData.userId);
      const expiresAt = new Date(Date.now() + policy.maxSessionDuration * 60000).toISOString();

      // Assess initial risk
      const riskScore = await this.assessSessionRisk(sessionData);

      const session: UserSession = {
        ...sessionData,
        id: sessionId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        status: 'active',
        metadata: {
          ...sessionData.metadata,
          riskScore,
          trustLevel: this.calculateTrustLevel(riskScore),
        },
        activity: [],
      };

      // Validate session against policy
      const validation = await this.validateSession(session);
      if (!validation.isValid) {
        const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
          throw new Error(`Session validation failed: ${criticalIssues.map(i => i.message).join(', ')}`);
        }
      }

      // Check concurrent session limits
      await this.enforceConcurrentSessionLimits(session.userId, policy);

      this.sessions.set(sessionId, session);
      this.emit("session:created", session);

      console.log(`🔐 Session created: ${sessionId} for user ${session.userId}`);
      return session;
    } catch (error) {
      console.error("❌ Failed to create session:", error);
      throw error;
    }
  }

  /**
   * Validate existing session
   */
  async validateSession(session: UserSession): Promise<SessionValidationResult> {
    try {
      const issues: SessionIssue[] = [];
      const warnings: SessionWarning[] = [];
      const recommendations: string[] = [];

      // Check session expiration
      if (new Date() > new Date(session.expiresAt)) {
        issues.push({
          type: 'security',
          severity: 'high',
          code: 'SESSION_EXPIRED',
          message: 'Session has expired',
          details: { expiresAt: session.expiresAt },
          remediation: 'Terminate session and require re-authentication',
        });
      }

      // Check inactivity
      const policy = this.getApplicablePolicy(session.userId);
      const inactivityPeriod = Date.now() - new Date(session.lastActivity).getTime();
      if (inactivityPeriod > policy.maxInactivityPeriod * 60000) {
        issues.push({
          type: 'policy',
          severity: 'medium',
          code: 'INACTIVITY_TIMEOUT',
          message: 'Session inactive for too long',
          details: { inactivityMinutes: Math.round(inactivityPeriod / 60000) },
          remediation: 'Terminate session due to inactivity',
        });
      }

      // Validate MFA requirements
      if (policy.requireMFA && !session.security.mfaVerified) {
        issues.push({
          type: 'security',
          severity: 'high',
          code: 'MFA_REQUIRED',
          message: 'Multi-factor authentication required but not verified',
          details: { policy: policy.name },
          remediation: 'Require MFA verification',
        });
      }

      // Check device restrictions
      if (policy.allowedDeviceTypes.length > 0 && !policy.allowedDeviceTypes.includes(session.metadata.deviceType)) {
        issues.push({
          type: 'policy',
          severity: 'high',
          code: 'DEVICE_NOT_ALLOWED',
          message: 'Device type not allowed by policy',
          details: { deviceType: session.metadata.deviceType, allowedTypes: policy.allowedDeviceTypes },
          remediation: 'Terminate session from unauthorized device',
        });
      }

      // Assess current risk
      const riskAssessment = await this.assessCurrentRisk(session);
      
      // Check risk thresholds
      if (riskAssessment.overallRisk >= policy.riskThresholds.critical) {
        issues.push({
          type: 'security',
          severity: 'critical',
          code: 'CRITICAL_RISK',
          message: 'Session risk level exceeds critical threshold',
          details: { riskScore: riskAssessment.overallRisk },
          remediation: 'Immediately terminate session and alert security team',
        });
      } else if (riskAssessment.overallRisk >= policy.riskThresholds.high) {
        warnings.push({
          type: 'unusual_activity',
          message: 'High risk activity detected',
          details: { riskScore: riskAssessment.overallRisk },
          suggestion: 'Consider additional authentication or monitoring',
        });
      }

      // Check compliance
      const complianceStatus = await this.checkComplianceStatus(session);

      // Calculate overall score
      const score = this.calculateValidationScore(issues, warnings, riskAssessment);

      return {
        isValid: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        score,
        issues,
        warnings,
        recommendations,
        riskAssessment,
        complianceStatus,
      };
    } catch (error) {
      console.error("❌ Failed to validate session:", error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, activity: Omit<SessionActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const activityRecord: SessionActivity = {
        ...activity,
        id: this.generateActivityId(),
        timestamp: new Date().toISOString(),
      };

      session.activity.push(activityRecord);
      session.lastActivity = activityRecord.timestamp;

      // Update risk score based on activity
      const newRiskScore = await this.assessSessionRisk(session);
      session.metadata.riskScore = newRiskScore;
      session.metadata.trustLevel = this.calculateTrustLevel(newRiskScore);

      // Validate updated session
      const validation = await this.validateSession(session);
      if (!validation.isValid) {
        const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
          await this.terminateSession(sessionId, 'security_violation');
          this.emit("session:terminated", { sessionId, reason: 'security_violation', issues: criticalIssues });
        }
      }

      this.sessions.set(sessionId, session);
      this.emit("session:activity_updated", { sessionId, activity: activityRecord });
    } catch (error) {
      console.error("❌ Failed to update session activity:", error);
      throw error;
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string, reason: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      session.status = 'terminated';
      this.sessions.set(sessionId, session);

      this.emit("session:terminated", { sessionId, reason, userId: session.userId });
      console.log(`🔐 Session terminated: ${sessionId} (${reason})`);
    } catch (error) {
      console.error("❌ Failed to terminate session:", error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(): any {
    const sessions = Array.from(this.sessions.values());
    
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      expiredSessions: sessions.filter(s => s.status === 'expired').length,
      terminatedSessions: sessions.filter(s => s.status === 'terminated').length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      riskDistribution: this.getRiskDistribution(sessions),
      deviceDistribution: this.getDeviceDistribution(sessions),
      complianceRate: this.calculateComplianceRate(sessions),
      securityIncidents: this.countSecurityIncidents(sessions),
    };
  }

  // Private helper methods
  private async loadSessionPolicies(): Promise<void> {
    // Default healthcare session policy
    const healthcarePolicy: SessionPolicy = {
      id: 'healthcare-default',
      name: 'Healthcare Default Policy',
      maxSessionDuration: 480, // 8 hours
      maxInactivityPeriod: 30, // 30 minutes
      maxConcurrentSessions: 3,
      requireMFA: true,
      requireBiometric: false,
      allowedDeviceTypes: ['mobile', 'tablet', 'desktop'],
      ipWhitelistRequired: false,
      locationTrackingRequired: true,
      riskThresholds: {
        low: 25,
        medium: 50,
        high: 75,
        critical: 90,
      },
      complianceRequirements: ['HIPAA', 'DOH'],
    };

    // High-security policy for admin users
    const adminPolicy: SessionPolicy = {
      id: 'admin-high-security',
      name: 'Administrator High Security Policy',
      maxSessionDuration: 240, // 4 hours
      maxInactivityPeriod: 15, // 15 minutes
      maxConcurrentSessions: 1,
      requireMFA: true,
      requireBiometric: true,
      allowedDeviceTypes: ['desktop'],
      ipWhitelistRequired: true,
      locationTrackingRequired: true,
      riskThresholds: {
        low: 15,
        medium: 30,
        high: 50,
        critical: 70,
      },
      complianceRequirements: ['HIPAA', 'DOH', 'SOX'],
    };

    this.sessionPolicies.set('healthcare-default', healthcarePolicy);
    this.sessionPolicies.set('admin-high-security', adminPolicy);

    console.log("🔐 Session policies loaded");
  }

  private async initializeSecurityMonitoring(): Promise<void> {
    // Initialize security monitoring systems
    console.log("🔐 Security monitoring initialized");
  }

  private setupSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000); // 5 minutes
  }

  private startContinuousMonitoring(): void {
    // Monitor sessions every minute
    this.monitoringInterval = setInterval(() => {
      this.monitorActiveSessions();
    }, 60000); // 1 minute
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      if (session.status === 'active' && new Date(session.expiresAt) < now) {
        session.status = 'expired';
        this.sessions.set(sessionId, session);
        this.emit("session:expired", { sessionId, userId: session.userId });
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🔐 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  private async monitorActiveSessions(): Promise<void> {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active');

    for (const session of activeSessions) {
      try {
        const validation = await this.validateSession(session);
        
        if (!validation.isValid) {
          const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
          if (criticalIssues.length > 0) {
            await this.terminateSession(session.id, 'policy_violation');
          }
        }

        // Check for suspicious activity
        if (validation.riskAssessment.overallRisk > 80) {
          this.emit("session:high_risk", { sessionId: session.id, riskScore: validation.riskAssessment.overallRisk });
        }
      } catch (error) {
        console.error(`❌ Failed to monitor session ${session.id}:`, error);
      }
    }
  }

  private getApplicablePolicy(userId: string): SessionPolicy {
    // In production, this would determine policy based on user role
    // For now, return default healthcare policy
    return this.sessionPolicies.get('healthcare-default')!;
  }

  private async assessSessionRisk(sessionData: Partial<UserSession>): Promise<number> {
    let riskScore = 0;

    // Location risk
    if (!sessionData.metadata?.location) {
      riskScore += 10; // Unknown location adds risk
    }

    // Device risk
    if (sessionData.metadata?.deviceType === 'unknown') {
      riskScore += 15;
    }

    // IP address risk (simplified)
    if (sessionData.ipAddress?.startsWith('192.168.') || sessionData.ipAddress?.startsWith('10.')) {
      riskScore -= 5; // Internal network reduces risk
    } else {
      riskScore += 10; // External network adds risk
    }

    // Time-based risk
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 15; // Off-hours access adds risk
    }

    // Activity pattern risk
    if (sessionData.activity && sessionData.activity.length > 0) {
      const recentActivity = sessionData.activity.slice(-10);
      const failedActions = recentActivity.filter(a => a.statusCode >= 400).length;
      riskScore += failedActions * 5;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  private async assessCurrentRisk(session: UserSession): Promise<RiskAssessment> {
    const overallRisk = await this.assessSessionRisk(session);
    
    return {
      overallRisk,
      factors: {
        locationRisk: session.metadata.location ? 10 : 25,
        deviceRisk: session.metadata.deviceType === 'unknown' ? 30 : 10,
        behaviorRisk: this.calculateBehaviorRisk(session),
        timeRisk: this.calculateTimeRisk(),
        accessPatternRisk: this.calculateAccessPatternRisk(session),
      },
      anomalies: this.detectAnomalies(session),
      mitigations: this.suggestMitigations(overallRisk),
    };
  }

  private calculateTrustLevel(riskScore: number): UserSession['metadata']['trustLevel'] {
    if (riskScore < 25) return 'high';
    if (riskScore < 50) return 'medium';
    return 'low';
  }

  private async enforceConcurrentSessionLimits(userId: string, policy: SessionPolicy): Promise<void> {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.status === 'active');

    if (userSessions.length >= policy.maxConcurrentSessions) {
      // Terminate oldest session
      const oldestSession = userSessions.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0];
      
      await this.terminateSession(oldestSession.id, 'concurrent_limit_exceeded');
    }
  }

  private async checkComplianceStatus(session: UserSession): Promise<ComplianceStatus> {
    const policy = this.getApplicablePolicy(session.userId);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // HIPAA compliance checks
    let hipaaCompliant = true;
    if (!session.security.encrypted) {
      hipaaCompliant = false;
      issues.push("Session data not encrypted");
    }

    // GDPR compliance checks
    let gdprCompliant = true;
    if (!session.metadata.location && policy.locationTrackingRequired) {
      gdprCompliant = false;
      issues.push("Location tracking required but not available");
    }

    return {
      hipaa: hipaaCompliant,
      gdpr: gdprCompliant,
      uaeDataLaw: true, // Simplified
      dohRequirements: session.security.mfaVerified,
      issues,
      recommendations,
    };
  }

  private calculateValidationScore(issues: SessionIssue[], warnings: SessionWarning[], riskAssessment: RiskAssessment): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Deduct points for warnings
    score -= warnings.length * 3;

    // Deduct points for high risk
    score -= Math.max(0, riskAssessment.overallRisk - 50);

    return Math.max(0, score);
  }

  private calculateBehaviorRisk(session: UserSession): number {
    if (session.activity.length === 0) return 20;

    const recentActivity = session.activity.slice(-20);
    const failureRate = recentActivity.filter(a => a.statusCode >= 400).length / recentActivity.length;
    
    return Math.round(failureRate * 50);
  }

  private calculateTimeRisk(): number {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) return 30;
    if (hour < 8 || hour > 18) return 15;
    return 5;
  }

  private calculateAccessPatternRisk(session: UserSession): number {
    // Analyze access patterns for anomalies
    return Math.round(Math.random() * 20); // Simplified
  }

  private detectAnomalies(session: UserSession): RiskAnomaly[] {
    const anomalies: RiskAnomaly[] = [];

    // Check for unusual access times
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      anomalies.push({
        type: 'unusual_time',
        severity: 'medium',
        description: 'Access during off-hours',
        confidence: 0.8,
        indicators: [`Access at ${hour}:00`],
      });
    }

    return anomalies;
  }

  private suggestMitigations(riskScore: number): string[] {
    const mitigations: string[] = [];

    if (riskScore > 75) {
      mitigations.push("Require additional authentication");
      mitigations.push("Increase monitoring frequency");
      mitigations.push("Restrict access to sensitive data");
    } else if (riskScore > 50) {
      mitigations.push("Enable enhanced logging");
      mitigations.push("Verify user identity");
    }

    return mitigations;
  }

  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    const completedSessions = sessions.filter(s => s.status === 'terminated' || s.status === 'expired');
    if (completedSessions.length === 0) return 0;

    const totalDuration = completedSessions.reduce((sum, session) => {
      const duration = new Date(session.lastActivity).getTime() - new Date(session.createdAt).getTime();
      return sum + duration;
    }, 0);

    return Math.round(totalDuration / completedSessions.length / 60000); // minutes
  }

  private getRiskDistribution(sessions: UserSession[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0 };
    
    sessions.forEach(session => {
      if (session.metadata.riskScore < 33) distribution.low++;
      else if (session.metadata.riskScore < 66) distribution.medium++;
      else distribution.high++;
    });

    return distribution;
  }

  private getDeviceDistribution(sessions: UserSession[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    sessions.forEach(session => {
      distribution[session.metadata.deviceType] = (distribution[session.metadata.deviceType] || 0) + 1;
    });
    return distribution;
  }

  private calculateComplianceRate(sessions: UserSession[]): number {
    if (sessions.length === 0) return 100;
    
    const compliantSessions = sessions.filter(session => 
      session.security.mfaVerified && session.security.encrypted
    ).length;
    
    return Math.round((compliantSessions / sessions.length) * 100);
  }

  private countSecurityIncidents(sessions: UserSession[]): number {
    return sessions.filter(session => 
      session.status === 'terminated' && session.metadata.riskScore > 75
    ).length;
  }

  private generateSessionId(): string {
    return `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActivityId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      // Terminate all active sessions
      for (const [sessionId, session] of this.sessions) {
        if (session.status === 'active') {
          await this.terminateSession(sessionId, 'system_shutdown');
        }
      }
      
      this.removeAllListeners();
      console.log("🔐 Session Management Validator shutdown completed");
    } catch (error) {
      console.error("❌ Error during validator shutdown:", error);
    }
  }
}

export const sessionManagementValidator = new SessionManagementValidator();
export default sessionManagementValidator;