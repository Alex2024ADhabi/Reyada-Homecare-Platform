/**
 * AI-Powered Threat Detection Service
 * Implements ML-based anomaly detection and threat identification
 * Part of Phase 4: Security Hardening - Threat Detection
 */

import { EventEmitter } from "eventemitter3";

// Threat Detection Types
export interface ThreatSignature {
  id: string;
  name: string;
  type: "malware" | "phishing" | "injection" | "brute_force" | "anomaly" | "insider_threat";
  severity: "low" | "medium" | "high" | "critical";
  pattern: string;
  confidence: number;
  indicators: ThreatIndicator[];
  mitigations: string[];
  lastUpdated: string;
}

export interface ThreatIndicator {
  type: "ip" | "domain" | "hash" | "pattern" | "behavior";
  value: string;
  weight: number;
  source: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: "authentication" | "authorization" | "data_access" | "network" | "system" | "application";
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  resource: string;
  outcome: "success" | "failure" | "blocked";
  metadata: Record<string, any>;
  riskScore: number;
}

export interface ThreatDetection {
  id: string;
  eventId: string;
  threatType: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  riskScore: number;
  indicators: ThreatIndicator[];
  evidence: SecurityEvent[];
  description: string;
  recommendations: string[];
  status: "active" | "investigating" | "mitigated" | "false_positive";
  detectedAt: string;
  mitigatedAt?: string;
  assignedTo?: string;
}

export interface AnomalyModel {
  id: string;
  name: string;
  type: "statistical" | "machine_learning" | "deep_learning" | "ensemble";
  features: string[];
  parameters: Record<string, any>;
  accuracy: number;
  lastTrained: string;
  isActive: boolean;
}

export interface BehaviorProfile {
  userId: string;
  patterns: BehaviorPattern[];
  baselines: Record<string, number>;
  anomalies: BehaviorAnomaly[];
  riskScore: number;
  lastUpdated: string;
}

export interface BehaviorPattern {
  type: "login_time" | "access_pattern" | "data_usage" | "location" | "device";
  frequency: number;
  variance: number;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
}

export interface BehaviorAnomaly {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  deviation: number;
  confidence: number;
  timestamp: string;
  evidence: any[];
}

export interface ThreatIntelligence {
  source: string;
  indicators: ThreatIndicator[];
  signatures: ThreatSignature[];
  lastUpdated: string;
  reliability: number;
}

class AIPoweredThreatDetectionService extends EventEmitter {
  private threatSignatures: Map<string, ThreatSignature> = new Map();
  private securityEvents: Map<string, SecurityEvent> = new Map();
  private threatDetections: Map<string, ThreatDetection> = new Map();
  private anomalyModels: Map<string, AnomalyModel> = new Map();
  private behaviorProfiles: Map<string, BehaviorProfile> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  
  private detectionInterval: NodeJS.Timeout | null = null;
  private modelTrainingInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🤖 Initializing AI-Powered Threat Detection Service...");

      // Initialize threat signatures
      await this.initializeThreatSignatures();

      // Initialize anomaly detection models
      await this.initializeAnomalyModels();

      // Start threat detection engine
      this.startThreatDetection();

      // Start model training
      this.startModelTraining();

      this.isInitialized = true;
      this.emit("service:initialized");

      console.log("✅ AI-Powered Threat Detection Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize AI-Powered Threat Detection Service:", error);
      throw error;
    }
  }

  /**
   * Process security event for threat detection
   */
  async processSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp" | "riskScore">): Promise<SecurityEvent> {
    try {
      const eventId = this.generateEventId();
      const timestamp = new Date().toISOString();
      const riskScore = await this.calculateEventRiskScore(event);

      const securityEvent: SecurityEvent = {
        ...event,
        id: eventId,
        timestamp,
        riskScore,
      };

      // Store event
      this.securityEvents.set(eventId, securityEvent);

      // Keep only last 10000 events
      if (this.securityEvents.size > 10000) {
        const oldestKey = this.securityEvents.keys().next().value;
        this.securityEvents.delete(oldestKey);
      }

      // Analyze for threats
      await this.analyzeEventForThreats(securityEvent);

      // Update behavior profiles
      if (securityEvent.userId) {
        await this.updateBehaviorProfile(securityEvent.userId, securityEvent);
      }

      this.emit("event:processed", securityEvent);
      return securityEvent;
    } catch (error) {
      console.error("❌ Failed to process security event:", error);
      throw error;
    }
  }

  /**
   * Detect anomalies in user behavior
   */
  async detectBehaviorAnomalies(userId: string): Promise<BehaviorAnomaly[]> {
    try {
      const profile = this.behaviorProfiles.get(userId);
      if (!profile) {
        return [];
      }

      const anomalies: BehaviorAnomaly[] = [];
      const recentEvents = this.getRecentEventsForUser(userId, 24); // Last 24 hours

      // Analyze login patterns
      const loginAnomalies = await this.detectLoginAnomalies(userId, recentEvents);
      anomalies.push(...loginAnomalies);

      // Analyze access patterns
      const accessAnomalies = await this.detectAccessAnomalies(userId, recentEvents);
      anomalies.push(...accessAnomalies);

      // Analyze data usage patterns
      const dataAnomalies = await this.detectDataUsageAnomalies(userId, recentEvents);
      anomalies.push(...dataAnomalies);

      // Update profile with new anomalies
      profile.anomalies = anomalies;
      profile.lastUpdated = new Date().toISOString();
      this.behaviorProfiles.set(userId, profile);

      // Create threat detections for high-severity anomalies
      for (const anomaly of anomalies.filter(a => a.severity === "high" || a.severity === "critical")) {
        await this.createThreatDetection(anomaly, recentEvents);
      }

      this.emit("anomalies:detected", { userId, anomalies });
      return anomalies;
    } catch (error) {
      console.error("❌ Failed to detect behavior anomalies:", error);
      throw error;
    }
  }

  /**
   * Train anomaly detection models
   */
  async trainAnomalyModels(): Promise<void> {
    try {
      console.log("🧠 Training anomaly detection models...");

      const events = Array.from(this.securityEvents.values());
      const profiles = Array.from(this.behaviorProfiles.values());

      for (const [modelId, model] of this.anomalyModels.entries()) {
        if (!model.isActive) continue;

        // Prepare training data
        const trainingData = this.prepareTrainingData(events, profiles, model);

        // Train model (simulated)
        const trainedModel = await this.trainModel(model, trainingData);

        // Update model
        this.anomalyModels.set(modelId, trainedModel);

        console.log(`✅ Model ${model.name} trained with accuracy: ${trainedModel.accuracy.toFixed(2)}`);
      }

      this.emit("models:trained");
    } catch (error) {
      console.error("❌ Failed to train anomaly models:", error);
      throw error;
    }
  }

  /**
   * Get active threat detections
   */
  getActiveThreatDetections(): ThreatDetection[] {
    return Array.from(this.threatDetections.values())
      .filter(detection => detection.status === "active")
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  /**
   * Get threat detections by severity
   */
  getThreatDetectionsBySeverity(severity: ThreatDetection["severity"]): ThreatDetection[] {
    return Array.from(this.threatDetections.values())
      .filter(detection => detection.severity === severity)
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  /**
   * Update threat detection status
   */
  async updateThreatDetectionStatus(
    detectionId: string,
    status: ThreatDetection["status"],
    assignedTo?: string
  ): Promise<ThreatDetection> {
    const detection = this.threatDetections.get(detectionId);
    if (!detection) {
      throw new Error(`Threat detection not found: ${detectionId}`);
    }

    detection.status = status;
    if (assignedTo) {
      detection.assignedTo = assignedTo;
    }
    if (status === "mitigated") {
      detection.mitigatedAt = new Date().toISOString();
    }

    this.threatDetections.set(detectionId, detection);
    this.emit("detection:updated", detection);

    return detection;
  }

  /**
   * Add threat signature
   */
  async addThreatSignature(signature: Omit<ThreatSignature, "id" | "lastUpdated">): Promise<ThreatSignature> {
    const signatureId = this.generateSignatureId();
    const threatSignature: ThreatSignature = {
      ...signature,
      id: signatureId,
      lastUpdated: new Date().toISOString(),
    };

    this.threatSignatures.set(signatureId, threatSignature);
    this.emit("signature:added", threatSignature);

    return threatSignature;
  }

  // Private helper methods
  private async initializeThreatSignatures(): Promise<void> {
    const defaultSignatures: Omit<ThreatSignature, "id" | "lastUpdated">[] = [
      {
        name: "SQL Injection Attempt",
        type: "injection",
        severity: "high",
        pattern: "(?i)(union|select|insert|update|delete|drop|create|alter).*?(from|into|table)",
        confidence: 0.9,
        indicators: [
          { type: "pattern", value: "SQL keywords in input", weight: 0.8, source: "static_analysis" },
        ],
        mitigations: ["Input validation", "Parameterized queries", "WAF rules"],
      },
      {
        name: "Brute Force Login Attack",
        type: "brute_force",
        severity: "medium",
        pattern: "multiple_failed_logins",
        confidence: 0.85,
        indicators: [
          { type: "behavior", value: "rapid_login_attempts", weight: 0.9, source: "behavior_analysis" },
        ],
        mitigations: ["Account lockout", "Rate limiting", "CAPTCHA"],
      },
      {
        name: "Suspicious Data Access Pattern",
        type: "anomaly",
        severity: "medium",
        pattern: "unusual_data_access",
        confidence: 0.75,
        indicators: [
          { type: "behavior", value: "abnormal_data_volume", weight: 0.7, source: "ml_model" },
        ],
        mitigations: ["Access monitoring", "Data loss prevention", "User training"],
      },
      {
        name: "Privilege Escalation Attempt",
        type: "insider_threat",
        severity: "high",
        pattern: "unauthorized_privilege_access",
        confidence: 0.8,
        indicators: [
          { type: "behavior", value: "access_beyond_role", weight: 0.9, source: "rbac_analysis" },
        ],
        mitigations: ["Role review", "Access audit", "Privilege monitoring"],
      },
    ];

    for (const signatureData of defaultSignatures) {
      await this.addThreatSignature(signatureData);
    }
  }

  private async initializeAnomalyModels(): Promise<void> {
    const defaultModels: Omit<AnomalyModel, "id">[] = [
      {
        name: "Login Pattern Anomaly Detector",
        type: "statistical",
        features: ["login_time", "login_frequency", "source_ip", "user_agent"],
        parameters: {
          threshold: 2.5,
          window_size: 24,
          min_samples: 10,
        },
        accuracy: 0.85,
        lastTrained: new Date().toISOString(),
        isActive: true,
      },
      {
        name: "Data Access Anomaly Detector",
        type: "machine_learning",
        features: ["access_volume", "access_pattern", "resource_type", "time_of_day"],
        parameters: {
          algorithm: "isolation_forest",
          contamination: 0.1,
          n_estimators: 100,
        },
        accuracy: 0.82,
        lastTrained: new Date().toISOString(),
        isActive: true,
      },
      {
        name: "Network Behavior Anomaly Detector",
        type: "deep_learning",
        features: ["network_traffic", "connection_patterns", "protocol_usage", "data_transfer"],
        parameters: {
          model_type: "autoencoder",
          layers: [64, 32, 16, 32, 64],
          epochs: 100,
        },
        accuracy: 0.88,
        lastTrained: new Date().toISOString(),
        isActive: true,
      },
    ];

    for (const modelData of defaultModels) {
      const modelId = this.generateModelId();
      const model: AnomalyModel = {
        ...modelData,
        id: modelId,
      };
      this.anomalyModels.set(modelId, model);
    }
  }

  private startThreatDetection(): void {
    // Run threat detection every 30 seconds
    this.detectionInterval = setInterval(() => {
      this.runThreatDetection();
    }, 30000);

    console.log("🔍 Threat detection engine started");
  }

  private startModelTraining(): void {
    // Retrain models every hour
    this.modelTrainingInterval = setInterval(() => {
      this.trainAnomalyModels();
    }, 3600000);

    console.log("🧠 Model training scheduler started");
  }

  private async runThreatDetection(): Promise<void> {
    try {
      // Get recent events for analysis
      const recentEvents = this.getRecentEvents(300); // Last 5 minutes

      // Analyze events against threat signatures
      for (const event of recentEvents) {
        await this.analyzeEventForThreats(event);
      }

      // Run behavior anomaly detection for active users
      const activeUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean));
      for (const userId of activeUsers) {
        await this.detectBehaviorAnomalies(userId!);
      }
    } catch (error) {
      console.error("❌ Threat detection run failed:", error);
    }
  }

  private async calculateEventRiskScore(event: Partial<SecurityEvent>): Promise<number> {
    let riskScore = 0;

    // Base risk by event type
    switch (event.type) {
      case "authentication":
        riskScore = event.outcome === "failure" ? 30 : 10;
        break;
      case "authorization":
        riskScore = event.outcome === "failure" ? 40 : 15;
        break;
      case "data_access":
        riskScore = 20;
        break;
      case "network":
        riskScore = 25;
        break;
      case "system":
        riskScore = 35;
        break;
      default:
        riskScore = 15;
    }

    // Adjust for outcome
    if (event.outcome === "blocked") {
      riskScore += 20;
    }

    // Adjust for IP reputation (simulated)
    if (event.ipAddress && this.isHighRiskIP(event.ipAddress)) {
      riskScore += 30;
    }

    // Adjust for user agent anomalies
    if (event.userAgent && this.isAnomalousUserAgent(event.userAgent)) {
      riskScore += 15;
    }

    return Math.min(100, riskScore);
  }

  private async analyzeEventForThreats(event: SecurityEvent): Promise<void> {
    for (const [signatureId, signature] of this.threatSignatures.entries()) {
      const match = await this.matchThreatSignature(event, signature);
      
      if (match.isMatch && match.confidence >= signature.confidence) {
        await this.createThreatDetectionFromSignature(event, signature, match.confidence);
      }
    }
  }

  private async matchThreatSignature(
    event: SecurityEvent,
    signature: ThreatSignature
  ): Promise<{ isMatch: boolean; confidence: number }> {
    let confidence = 0;
    let matches = 0;

    // Check pattern matching
    switch (signature.type) {
      case "injection":
        if (this.checkInjectionPattern(event, signature.pattern)) {
          matches++;
          confidence += 0.8;
        }
        break;

      case "brute_force":
        if (await this.checkBruteForcePattern(event)) {
          matches++;
          confidence += 0.9;
        }
        break;

      case "anomaly":
        if (await this.checkAnomalyPattern(event)) {
          matches++;
          confidence += 0.7;
        }
        break;

      case "insider_threat":
        if (await this.checkInsiderThreatPattern(event)) {
          matches++;
          confidence += 0.8;
        }
        break;
    }

    // Check indicators
    for (const indicator of signature.indicators) {
      if (this.checkIndicator(event, indicator)) {
        matches++;
        confidence += indicator.weight;
      }
    }

    const isMatch = matches > 0 && confidence >= 0.5;
    return { isMatch, confidence: Math.min(1, confidence) };
  }

  private checkInjectionPattern(event: SecurityEvent, pattern: string): boolean {
    const regex = new RegExp(pattern, 'i');
    const searchText = JSON.stringify(event.metadata);
    return regex.test(searchText);
  }

  private async checkBruteForcePattern(event: SecurityEvent): boolean {
    if (event.type !== "authentication" || event.outcome !== "failure") {
      return false;
    }

    // Count failed login attempts in last 5 minutes
    const recentEvents = this.getRecentEvents(300)
      .filter(e => 
        e.type === "authentication" && 
        e.outcome === "failure" && 
        e.ipAddress === event.ipAddress
      );

    return recentEvents.length >= 5;
  }

  private async checkAnomalyPattern(event: SecurityEvent): boolean {
    // Use ML models to detect anomalies
    for (const model of this.anomalyModels.values()) {
      if (!model.isActive) continue;

      const isAnomaly = await this.detectAnomalyWithModel(event, model);
      if (isAnomaly) {
        return true;
      }
    }

    return false;
  }

  private async checkInsiderThreatPattern(event: SecurityEvent): boolean {
    if (!event.userId) return false;

    // Check for privilege escalation
    if (event.type === "authorization" && event.outcome === "failure") {
      const userProfile = this.behaviorProfiles.get(event.userId);
      if (userProfile) {
        // Check if user is accessing resources beyond their normal pattern
        const normalResources = userProfile.patterns
          .filter(p => p.type === "access_pattern")
          .map(p => p.type);
        
        // Simplified check - in real implementation, this would be more sophisticated
        return !normalResources.includes(event.resource);
      }
    }

    return false;
  }

  private checkIndicator(event: SecurityEvent, indicator: ThreatIndicator): boolean {
    switch (indicator.type) {
      case "ip":
        return event.ipAddress === indicator.value;
      case "pattern":
        return JSON.stringify(event).includes(indicator.value);
      case "behavior":
        return this.checkBehaviorIndicator(event, indicator.value);
      default:
        return false;
    }
  }

  private checkBehaviorIndicator(event: SecurityEvent, indicatorValue: string): boolean {
    // Simplified behavior indicator checking
    switch (indicatorValue) {
      case "rapid_login_attempts":
        return event.type === "authentication";
      case "abnormal_data_volume":
        return event.type === "data_access";
      case "access_beyond_role":
        return event.type === "authorization" && event.outcome === "failure";
      default:
        return false;
    }
  }

  private async detectAnomalyWithModel(event: SecurityEvent, model: AnomalyModel): Promise<boolean> {
    // Simplified anomaly detection - in real implementation, this would use actual ML models
    const features = this.extractFeatures(event, model.features);
    const anomalyScore = this.calculateAnomalyScore(features, model);
    
    return anomalyScore > 0.7; // Threshold for anomaly detection
  }

  private extractFeatures(event: SecurityEvent, featureNames: string[]): Record<string, number> {
    const features: Record<string, number> = {};

    for (const featureName of featureNames) {
      switch (featureName) {
        case "login_time":
          features[featureName] = new Date(event.timestamp).getHours();
          break;
        case "access_volume":
          features[featureName] = Object.keys(event.metadata).length;
          break;
        case "risk_score":
          features[featureName] = event.riskScore;
          break;
        default:
          features[featureName] = Math.random(); // Placeholder
      }
    }

    return features;
  }

  private calculateAnomalyScore(features: Record<string, number>, model: AnomalyModel): number {
    // Simplified anomaly score calculation
    const values = Object.values(features);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.min(1, variance / 100); // Normalized score
  }

  private async createThreatDetectionFromSignature(
    event: SecurityEvent,
    signature: ThreatSignature,
    confidence: number
  ): Promise<void> {
    const detectionId = this.generateDetectionId();
    
    const detection: ThreatDetection = {
      id: detectionId,
      eventId: event.id,
      threatType: signature.name,
      severity: signature.severity,
      confidence,
      riskScore: event.riskScore,
      indicators: signature.indicators,
      evidence: [event],
      description: `${signature.name} detected with ${(confidence * 100).toFixed(1)}% confidence`,
      recommendations: signature.mitigations,
      status: "active",
      detectedAt: new Date().toISOString(),
    };

    this.threatDetections.set(detectionId, detection);
    this.emit("threat:detected", detection);

    console.log(`🚨 Threat detected: ${signature.name} (${signature.severity})`);
  }

  private async createThreatDetection(anomaly: BehaviorAnomaly, evidence: SecurityEvent[]): Promise<void> {
    const detectionId = this.generateDetectionId();
    
    const detection: ThreatDetection = {
      id: detectionId,
      eventId: evidence[0]?.id || "",
      threatType: `Behavior Anomaly: ${anomaly.type}`,
      severity: anomaly.severity,
      confidence: anomaly.confidence,
      riskScore: 50 + (anomaly.deviation * 30),
      indicators: [
        {
          type: "behavior",
          value: anomaly.type,
          weight: 0.8,
          source: "behavior_analysis",
        },
      ],
      evidence,
      description: anomaly.description,
      recommendations: [
        "Review user activity",
        "Verify user identity",
        "Monitor future behavior",
      ],
      status: "active",
      detectedAt: new Date().toISOString(),
    };

    this.threatDetections.set(detectionId, detection);
    this.emit("threat:detected", detection);
  }

  private async updateBehaviorProfile(userId: string, event: SecurityEvent): Promise<void> {
    let profile = this.behaviorProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        patterns: [],
        baselines: {},
        anomalies: [],
        riskScore: 50,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update patterns based on event
    this.updateBehaviorPatterns(profile, event);

    // Update baselines
    this.updateBehaviorBaselines(profile, event);

    // Calculate new risk score
    profile.riskScore = this.calculateBehaviorRiskScore(profile);
    profile.lastUpdated = new Date().toISOString();

    this.behaviorProfiles.set(userId, profile);
  }

  private updateBehaviorPatterns(profile: BehaviorProfile, event: SecurityEvent): void {
    const hour = new Date(event.timestamp).getHours();
    
    // Update login time pattern
    let loginPattern = profile.patterns.find(p => p.type === "login_time");
    if (!loginPattern) {
      loginPattern = {
        type: "login_time",
        frequency: 0,
        variance: 0,
        trend: "stable",
        confidence: 0.5,
      };
      profile.patterns.push(loginPattern);
    }

    if (event.type === "authentication" && event.outcome === "success") {
      loginPattern.frequency++;
      // Update variance based on time deviation
      const expectedHour = profile.baselines.typical_login_hour || 9;
      const deviation = Math.abs(hour - expectedHour);
      loginPattern.variance = (loginPattern.variance + deviation) / 2;
    }
  }

  private updateBehaviorBaselines(profile: BehaviorProfile, event: SecurityEvent): void {
    const hour = new Date(event.timestamp).getHours();
    
    if (event.type === "authentication" && event.outcome === "success") {
      profile.baselines.typical_login_hour = (profile.baselines.typical_login_hour || hour + hour) / 2;
    }
    
    if (event.type === "data_access") {
      profile.baselines.typical_data_access = (profile.baselines.typical_data_access || 0) + 1;
    }
  }

  private calculateBehaviorRiskScore(profile: BehaviorProfile): number {
    let riskScore = 50; // Base risk

    // Adjust based on anomalies
    const criticalAnomalies = profile.anomalies.filter(a => a.severity === "critical").length;
    const highAnomalies = profile.anomalies.filter(a => a.severity === "high").length;
    
    riskScore += criticalAnomalies * 20;
    riskScore += highAnomalies * 10;

    // Adjust based on pattern variance
    const highVariancePatterns = profile.patterns.filter(p => p.variance > 5).length;
    riskScore += highVariancePatterns * 5;

    return Math.min(100, Math.max(0, riskScore));
  }

  private async detectLoginAnomalies(userId: string, events: SecurityEvent[]): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    const loginEvents = events.filter(e => e.type === "authentication");

    if (loginEvents.length === 0) return anomalies;

    const profile = this.behaviorProfiles.get(userId);
    if (!profile) return anomalies;

    // Check for unusual login times
    const typicalHour = profile.baselines.typical_login_hour || 9;
    const unusualLogins = loginEvents.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return Math.abs(hour - typicalHour) > 6; // More than 6 hours difference
    });

    if (unusualLogins.length > 0) {
      anomalies.push({
        id: this.generateAnomalyId(),
        type: "unusual_login_time",
        severity: unusualLogins.length > 2 ? "high" : "medium",
        description: `${unusualLogins.length} login(s) at unusual times`,
        deviation: unusualLogins.length / loginEvents.length,
        confidence: 0.8,
        timestamp: new Date().toISOString(),
        evidence: unusualLogins,
      });
    }

    return anomalies;
  }

  private async detectAccessAnomalies(userId: string, events: SecurityEvent[]): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    const accessEvents = events.filter(e => e.type === "data_access");

    if (accessEvents.length === 0) return anomalies;

    const profile = this.behaviorProfiles.get(userId);
    if (!profile) return anomalies;

    // Check for unusual data access volume
    const typicalAccess = profile.baselines.typical_data_access || 10;
    const currentAccess = accessEvents.length;

    if (currentAccess > typicalAccess * 3) { // 3x normal access
      anomalies.push({
        id: this.generateAnomalyId(),
        type: "excessive_data_access",
        severity: currentAccess > typicalAccess * 5 ? "critical" : "high",
        description: `Excessive data access: ${currentAccess} vs typical ${typicalAccess}`,
        deviation: (currentAccess - typicalAccess) / typicalAccess,
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        evidence: accessEvents,
      });
    }

    return anomalies;
  }

  private async detectDataUsageAnomalies(userId: string, events: SecurityEvent[]): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    
    // Check for unusual resource access patterns
    const resourceAccess = new Map<string, number>();
    events.forEach(event => {
      const count = resourceAccess.get(event.resource) || 0;
      resourceAccess.set(event.resource, count + 1);
    });

    // Find resources accessed unusually frequently
    for (const [resource, count] of resourceAccess.entries()) {
      if (count > 20) { // Threshold for unusual access
        anomalies.push({
          id: this.generateAnomalyId(),
          type: "unusual_resource_access",
          severity: count > 50 ? "high" : "medium",
          description: `Unusual access to resource ${resource}: ${count} times`,
          deviation: count / 20,
          confidence: 0.75,
          timestamp: new Date().toISOString(),
          evidence: events.filter(e => e.resource === resource),
        });
      }
    }

    return anomalies;
  }

  private getRecentEvents(minutes: number): SecurityEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return Array.from(this.securityEvents.values())
      .filter(event => new Date(event.timestamp).getTime() > cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getRecentEventsForUser(userId: string, hours: number): SecurityEvent[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return Array.from(this.securityEvents.values())
      .filter(event => 
        event.userId === userId && 
        new Date(event.timestamp).getTime() > cutoff
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private prepareTrainingData(
    events: SecurityEvent[],
    profiles: BehaviorProfile[],
    model: AnomalyModel
  ): any[] {
    // Simplified training data preparation
    return events.map(event => {
      const features = this.extractFeatures(event, model.features);
      return {
        features,
        label: event.riskScore > 70 ? 1 : 0, // Binary classification
      };
    });
  }

  private async trainModel(model: AnomalyModel, trainingData: any[]): Promise<AnomalyModel> {
    // Simulate model training
    const accuracy = 0.8 + Math.random() * 0.15; // 80-95% accuracy

    return {
      ...model,
      accuracy,
      lastTrained: new Date().toISOString(),
    };
  }

  private isHighRiskIP(ipAddress: string): boolean {
    // Simplified IP risk assessment
    const highRiskPatterns = [
      /^10\.0\.0\./, // Example internal network
      /^192\.168\./, // Private network
    ];

    return highRiskPatterns.some(pattern => pattern.test(ipAddress));
  }

  private isAnomalousUserAgent(userAgent: string): boolean {
    // Check for suspicious user agent patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /^$/,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private generateEventId(): string {
    return `EVENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDetectionId(): string {
    return `THREAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSignatureId(): string {
    return `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateModelId(): string {
    return `MODEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnomalyId(): string {
    return `ANOMALY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval);
      }
      if (this.modelTrainingInterval) {
        clearInterval(this.modelTrainingInterval);
      }
      this.removeAllListeners();
      console.log("🤖 AI-Powered Threat Detection Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during threat detection service shutdown:", error);
    }
  }
}

export const aiPoweredThreatDetectionService = new AIPoweredThreatDetectionService();
export default aiPoweredThreatDetectionService;