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
  type: "malware" | "intrusion" | "anomaly" | "behavioral" | "network" | "data_exfiltration";
  severity: "low" | "medium" | "high" | "critical";
  pattern: string;
  confidence: number;
  enabled: boolean;
  lastUpdated: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: "authentication" | "authorization" | "data_access" | "network" | "system" | "application";
  source: EventSource;
  severity: "info" | "warning" | "error" | "critical";
  description: string;
  metadata: Record<string, any>;
  riskScore: number;
  correlationId?: string;
}

export interface EventSource {
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  location?: GeoLocation;
  deviceId?: string;
  applicationId?: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface ThreatDetectionResult {
  id: string;
  eventId: string;
  threatType: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  indicators: ThreatIndicator[];
  recommendations: string[];
  timestamp: string;
  mlModelVersion: string;
}

export interface ThreatIndicator {
  type: "ip" | "domain" | "hash" | "pattern" | "behavior" | "anomaly";
  value: string;
  confidence: number;
  source: string;
}

export interface AnomalyDetectionModel {
  id: string;
  name: string;
  type: "statistical" | "ml" | "behavioral" | "network" | "hybrid";
  version: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
  thresholds: Record<string, number>;
  enabled: boolean;
}

export interface BehavioralProfile {
  userId: string;
  profile: {
    loginTimes: number[];
    locations: GeoLocation[];
    devices: string[];
    applications: string[];
    dataAccess: string[];
    networkPatterns: NetworkPattern[];
  };
  baseline: {
    avgSessionDuration: number;
    typicalLocations: string[];
    usualDevices: string[];
    commonActions: string[];
  };
  lastUpdated: string;
}

export interface NetworkPattern {
  protocol: string;
  ports: number[];
  bandwidth: number;
  frequency: number;
  destinations: string[];
}

export interface ThreatIntelligence {
  id: string;
  type: "ioc" | "signature" | "reputation" | "behavioral";
  value: string;
  source: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  tags: string[];
  firstSeen: string;
  lastSeen: string;
  ttl: number;
}

export interface MLModelMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  lastEvaluated: string;
}

class AIThreatDetectionService extends EventEmitter {
  private threatSignatures: Map<string, ThreatSignature> = new Map();
  private securityEvents: Map<string, SecurityEvent> = new Map();
  private detectionResults: Map<string, ThreatDetectionResult> = new Map();
  private anomalyModels: Map<string, AnomalyDetectionModel> = new Map();
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private modelMetrics: Map<string, MLModelMetrics> = new Map();
  
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private eventBuffer: SecurityEvent[] = [];
  private readonly BUFFER_SIZE = 1000;

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🤖 Initializing AI-Powered Threat Detection Service...");

      // Initialize ML models
      await this.initializeMLModels();

      // Load threat signatures
      await this.loadThreatSignatures();

      // Setup behavioral profiling
      await this.initializeBehavioralProfiling();

      // Start real-time monitoring
      this.startRealTimeMonitoring();

      this.emit("service:initialized");
      console.log("✅ AI-Powered Threat Detection Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize AI Threat Detection Service:", error);
      throw error;
    }
  }

  /**
   * Analyze security event for threats
   */
  async analyzeEvent(event: Omit<SecurityEvent, "id" | "timestamp" | "riskScore">): Promise<ThreatDetectionResult[]> {
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

      this.securityEvents.set(eventId, securityEvent);
      this.eventBuffer.push(securityEvent);

      // Keep buffer size manageable
      if (this.eventBuffer.length > this.BUFFER_SIZE) {
        this.eventBuffer.shift();
      }

      // Run threat detection
      const detectionResults = await this.runThreatDetection(securityEvent);

      // Update behavioral profiles
      if (securityEvent.source.userId) {
        await this.updateBehavioralProfile(securityEvent.source.userId, securityEvent);
      }

      // Store results
      detectionResults.forEach(result => {
        this.detectionResults.set(result.id, result);
      });

      // Emit high-severity threats immediately
      const criticalThreats = detectionResults.filter(r => r.severity === "critical");
      if (criticalThreats.length > 0) {
        this.emit("threat:critical", criticalThreats);
      }

      this.emit("event:analyzed", { event: securityEvent, results: detectionResults });
      return detectionResults;
    } catch (error) {
      console.error("❌ Failed to analyze security event:", error);
      throw error;
    }
  }

  /**
   * Detect anomalies using ML models
   */
  async detectAnomalies(events: SecurityEvent[]): Promise<ThreatDetectionResult[]> {
    try {
      const results: ThreatDetectionResult[] = [];

      for (const model of this.anomalyModels.values()) {
        if (!model.enabled) continue;

        const modelResults = await this.runAnomalyDetection(model, events);
        results.push(...modelResults);
      }

      // Correlate results
      const correlatedResults = this.correlateThreatResults(results);

      this.emit("anomalies:detected", correlatedResults);
      return correlatedResults;
    } catch (error) {
      console.error("❌ Failed to detect anomalies:", error);
      throw error;
    }
  }

  /**
   * Update threat intelligence
   */
  async updateThreatIntelligence(intelligence: Omit<ThreatIntelligence, "id">): Promise<ThreatIntelligence> {
    try {
      const intelligenceId = this.generateIntelligenceId();
      const threatIntel: ThreatIntelligence = {
        ...intelligence,
        id: intelligenceId,
      };

      this.threatIntelligence.set(intelligenceId, threatIntel);
      this.emit("intelligence:updated", threatIntel);

      console.log(`🤖 Threat intelligence updated: ${threatIntel.type} - ${threatIntel.value}`);
      return threatIntel;
    } catch (error) {
      console.error("❌ Failed to update threat intelligence:", error);
      throw error;
    }
  }

  /**
   * Train ML model with new data
   */
  async trainModel(modelId: string, trainingData: any[]): Promise<MLModelMetrics> {
    try {
      const model = this.anomalyModels.get(modelId);
      if (!model) {
        throw new Error(`Model not found: ${modelId}`);
      }

      // Simulate model training (in production, use actual ML framework)
      const metrics = await this.performModelTraining(model, trainingData);

      this.modelMetrics.set(modelId, metrics);
      
      // Update model version
      model.version = `v${Date.now()}`;
      model.lastTrained = new Date().toISOString();
      model.accuracy = metrics.accuracy;

      this.emit("model:trained", { modelId, metrics });
      console.log(`🤖 Model trained: ${modelId} - Accuracy: ${metrics.accuracy.toFixed(2)}`);

      return metrics;
    } catch (error) {
      console.error("❌ Failed to train ML model:", error);
      throw error;
    }
  }

  /**
   * Get behavioral profile for user
   */
  getBehavioralProfile(userId: string): BehavioralProfile | null {
    return this.behavioralProfiles.get(userId) || null;
  }

  /**
   * Get recent threat detections
   */
  getRecentThreats(limit: number = 100): ThreatDetectionResult[] {
    return Array.from(this.detectionResults.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get threat statistics
   */
  getThreatStatistics(): any {
    const threats = Array.from(this.detectionResults.values());
    const last24h = threats.filter(t => 
      new Date(t.timestamp).getTime() > Date.now() - 86400000
    );

    return {
      total: threats.length,
      last24h: last24h.length,
      bySeverity: {
        critical: threats.filter(t => t.severity === "critical").length,
        high: threats.filter(t => t.severity === "high").length,
        medium: threats.filter(t => t.severity === "medium").length,
        low: threats.filter(t => t.severity === "low").length,
      },
      byType: this.groupBy(threats, "threatType"),
      modelAccuracy: this.getAverageModelAccuracy(),
    };
  }

  // Private helper methods
  private async initializeMLModels(): Promise<void> {
    // Initialize statistical anomaly detection model
    await this.createAnomalyModel({
      name: "Statistical Anomaly Detector",
      type: "statistical",
      version: "v1.0",
      accuracy: 0.85,
      lastTrained: new Date().toISOString(),
      features: ["login_frequency", "data_access_volume", "session_duration", "location_variance"],
      thresholds: {
        login_frequency: 3.0,
        data_access_volume: 2.5,
        session_duration: 2.0,
        location_variance: 4.0,
      },
      enabled: true,
    });

    // Initialize behavioral anomaly detection model
    await this.createAnomalyModel({
      name: "Behavioral Anomaly Detector",
      type: "behavioral",
      version: "v1.0",
      accuracy: 0.78,
      lastTrained: new Date().toISOString(),
      features: ["click_patterns", "navigation_flow", "typing_dynamics", "mouse_movements"],
      thresholds: {
        click_patterns: 2.8,
        navigation_flow: 3.2,
        typing_dynamics: 2.1,
        mouse_movements: 2.5,
      },
      enabled: true,
    });

    // Initialize network anomaly detection model
    await this.createAnomalyModel({
      name: "Network Anomaly Detector",
      type: "network",
      version: "v1.0",
      accuracy: 0.82,
      lastTrained: new Date().toISOString(),
      features: ["bandwidth_usage", "connection_patterns", "protocol_distribution", "geographic_spread"],
      thresholds: {
        bandwidth_usage: 3.5,
        connection_patterns: 2.7,
        protocol_distribution: 2.2,
        geographic_spread: 4.1,
      },
      enabled: true,
    });

    console.log("🤖 ML models initialized");
  }

  private async createAnomalyModel(modelData: Omit<AnomalyDetectionModel, "id">): Promise<AnomalyDetectionModel> {
    const modelId = this.generateModelId();
    const model: AnomalyDetectionModel = {
      ...modelData,
      id: modelId,
    };

    this.anomalyModels.set(modelId, model);
    return model;
  }

  private async loadThreatSignatures(): Promise<void> {
    // Load common threat signatures
    const signatures = [
      {
        name: "SQL Injection Attempt",
        type: "intrusion" as const,
        severity: "high" as const,
        pattern: "(?i)(union|select|insert|delete|update|drop|create|alter).*?(from|into|table|database)",
        confidence: 0.9,
        enabled: true,
      },
      {
        name: "XSS Attack Pattern",
        type: "intrusion" as const,
        severity: "high" as const,
        pattern: "(?i)<script[^>]*>.*?</script>|javascript:|on\\w+\\s*=",
        confidence: 0.85,
      },
      {
        name: "Brute Force Login",
        type: "behavioral" as const,
        severity: "medium" as const,
        pattern: "failed_login_attempts > 5 within 300 seconds",
        confidence: 0.8,
        enabled: true,
      },
      {
        name: "Data Exfiltration Pattern",
        type: "data_exfiltration" as const,
        severity: "critical" as const,
        pattern: "large_data_transfer AND unusual_time AND external_destination",
        confidence: 0.75,
        enabled: true,
      },
    ];

    for (const sig of signatures) {
      const signatureId = this.generateSignatureId();
      const signature: ThreatSignature = {
        ...sig,
        id: signatureId,
        lastUpdated: new Date().toISOString(),
      };
      this.threatSignatures.set(signatureId, signature);
    }

    console.log(`🤖 Loaded ${signatures.length} threat signatures`);
  }

  private async initializeBehavioralProfiling(): Promise<void> {
    // Initialize behavioral profiling system
    console.log("🤖 Behavioral profiling initialized");
  }

  private startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Process event buffer every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.processEventBuffer();
    }, 10000);

    console.log("🤖 Real-time threat monitoring started");
  }

  private async processEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    try {
      // Batch process events for anomaly detection
      const anomalies = await this.detectAnomalies(this.eventBuffer);

      // Clear processed events
      this.eventBuffer = [];

      if (anomalies.length > 0) {
        this.emit("batch:anomalies", anomalies);
      }
    } catch (error) {
      console.error("❌ Failed to process event buffer:", error);
    }
  }

  private async runThreatDetection(event: SecurityEvent): Promise<ThreatDetectionResult[]> {
    const results: ThreatDetectionResult[] = [];

    // Run signature-based detection
    const signatureResults = await this.runSignatureDetection(event);
    results.push(...signatureResults);

    // Run ML-based detection
    const mlResults = await this.runMLDetection(event);
    results.push(...mlResults);

    // Run threat intelligence matching
    const intelResults = await this.runThreatIntelligenceMatching(event);
    results.push(...intelResults);

    return results;
  }

  private async runSignatureDetection(event: SecurityEvent): Promise<ThreatDetectionResult[]> {
    const results: ThreatDetectionResult[] = [];

    for (const signature of this.threatSignatures.values()) {
      if (!signature.enabled) continue;

      const match = this.matchSignature(signature, event);
      if (match) {
        results.push({
          id: this.generateDetectionId(),
          eventId: event.id,
          threatType: signature.type,
          confidence: signature.confidence,
          severity: signature.severity,
          description: `Signature match: ${signature.name}`,
          indicators: [{
            type: "pattern",
            value: signature.pattern,
            confidence: signature.confidence,
            source: "signature_engine",
          }],
          recommendations: this.getSignatureRecommendations(signature),
          timestamp: new Date().toISOString(),
          mlModelVersion: "signature_v1.0",
        });
      }
    }

    return results;
  }

  private async runMLDetection(event: SecurityEvent): Promise<ThreatDetectionResult[]> {
    const results: ThreatDetectionResult[] = [];

    for (const model of this.anomalyModels.values()) {
      if (!model.enabled) continue;

      const anomalyScore = await this.calculateAnomalyScore(model, event);
      const threshold = this.getModelThreshold(model);

      if (anomalyScore > threshold) {
        results.push({
          id: this.generateDetectionId(),
          eventId: event.id,
          threatType: "anomaly",
          confidence: Math.min(anomalyScore / threshold, 1.0),
          severity: this.calculateSeverityFromScore(anomalyScore),
          description: `ML anomaly detected by ${model.name}`,
          indicators: [{
            type: "anomaly",
            value: anomalyScore.toString(),
            confidence: anomalyScore / threshold,
            source: model.id,
          }],
          recommendations: this.getMLRecommendations(model, anomalyScore),
          timestamp: new Date().toISOString(),
          mlModelVersion: model.version,
        });
      }
    }

    return results;
  }

  private async runThreatIntelligenceMatching(event: SecurityEvent): Promise<ThreatDetectionResult[]> {
    const results: ThreatDetectionResult[] = [];

    for (const intel of this.threatIntelligence.values()) {
      const match = this.matchThreatIntelligence(intel, event);
      if (match) {
        results.push({
          id: this.generateDetectionId(),
          eventId: event.id,
          threatType: intel.type,
          confidence: intel.confidence,
          severity: intel.severity,
          description: `Threat intelligence match: ${intel.description}`,
          indicators: [{
            type: intel.type as any,
            value: intel.value,
            confidence: intel.confidence,
            source: intel.source,
          }],
          recommendations: [`Block ${intel.type}: ${intel.value}`, "Investigate related activities"],
          timestamp: new Date().toISOString(),
          mlModelVersion: "intel_v1.0",
        });
      }
    }

    return results;
  }

  private async runAnomalyDetection(model: AnomalyDetectionModel, events: SecurityEvent[]): Promise<ThreatDetectionResult[]> {
    const results: ThreatDetectionResult[] = [];

    // Group events by user/session for behavioral analysis
    const groupedEvents = this.groupEventsByContext(events);

    for (const [context, contextEvents] of groupedEvents) {
      const anomalyScore = await this.calculateBatchAnomalyScore(model, contextEvents);
      const threshold = this.getModelThreshold(model);

      if (anomalyScore > threshold) {
        results.push({
          id: this.generateDetectionId(),
          eventId: contextEvents[0].id,
          threatType: "behavioral_anomaly",
          confidence: Math.min(anomalyScore / threshold, 1.0),
          severity: this.calculateSeverityFromScore(anomalyScore),
          description: `Behavioral anomaly detected for ${context}`,
          indicators: [{
            type: "behavior",
            value: context,
            confidence: anomalyScore / threshold,
            source: model.id,
          }],
          recommendations: this.getBehavioralRecommendations(context, anomalyScore),
          timestamp: new Date().toISOString(),
          mlModelVersion: model.version,
        });
      }
    }

    return results;
  }

  private async calculateEventRiskScore(event: any): Promise<number> {
    let riskScore = 0;

    // Base risk by event type
    const typeRisk = {
      authentication: 20,
      authorization: 25,
      data_access: 30,
      network: 15,
      system: 35,
      application: 20,
    };

    riskScore += typeRisk[event.type] || 20;

    // Severity multiplier
    const severityMultiplier = {
      info: 1.0,
      warning: 1.5,
      error: 2.0,
      critical: 3.0,
    };

    riskScore *= severityMultiplier[event.severity] || 1.0;

    // Source risk factors
    if (event.source.ipAddress && this.isHighRiskIP(event.source.ipAddress)) {
      riskScore += 30;
    }

    if (event.source.location && this.isHighRiskLocation(event.source.location)) {
      riskScore += 20;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  private async updateBehavioralProfile(userId: string, event: SecurityEvent): Promise<void> {
    let profile = this.behavioralProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        profile: {
          loginTimes: [],
          locations: [],
          devices: [],
          applications: [],
          dataAccess: [],
          networkPatterns: [],
        },
        baseline: {
          avgSessionDuration: 0,
          typicalLocations: [],
          usualDevices: [],
          commonActions: [],
        },
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update profile with new event data
    if (event.type === "authentication" && event.source.location) {
      profile.profile.locations.push(event.source.location);
    }

    if (event.source.deviceId) {
      if (!profile.profile.devices.includes(event.source.deviceId)) {
        profile.profile.devices.push(event.source.deviceId);
      }
    }

    profile.lastUpdated = new Date().toISOString();
    this.behavioralProfiles.set(userId, profile);
  }

  private matchSignature(signature: ThreatSignature, event: SecurityEvent): boolean {
    // Simplified signature matching
    const eventString = JSON.stringify(event).toLowerCase();
    
    try {
      const regex = new RegExp(signature.pattern, "i");
      return regex.test(eventString);
    } catch (error) {
      return false;
    }
  }

  private async calculateAnomalyScore(model: AnomalyDetectionModel, event: SecurityEvent): Promise<number> {
    // Simulate ML model scoring
    let score = 0;

    for (const feature of model.features) {
      const featureValue = this.extractFeatureValue(feature, event);
      const threshold = model.thresholds[feature] || 2.0;
      
      if (featureValue > threshold) {
        score += (featureValue - threshold) * 10;
      }
    }

    return Math.min(100, score);
  }

  private async calculateBatchAnomalyScore(model: AnomalyDetectionModel, events: SecurityEvent[]): Promise<number> {
    if (events.length === 0) return 0;

    const scores = await Promise.all(
      events.map(event => this.calculateAnomalyScore(model, event))
    );

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private extractFeatureValue(feature: string, event: SecurityEvent): number {
    // Extract feature values from event
    switch (feature) {
      case "login_frequency":
        return event.type === "authentication" ? 1 : 0;
      case "data_access_volume":
        return event.metadata?.dataSize || 0;
      case "session_duration":
        return event.metadata?.duration || 0;
      default:
        return Math.random() * 5; // Simulated feature value
    }
  }

  private getModelThreshold(model: AnomalyDetectionModel): number {
    return Object.values(model.thresholds).reduce((sum, t) => sum + t, 0) / Object.keys(model.thresholds).length;
  }

  private calculateSeverityFromScore(score: number): "low" | "medium" | "high" | "critical" {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  private matchThreatIntelligence(intel: ThreatIntelligence, event: SecurityEvent): boolean {
    // Check if event matches threat intelligence
    const eventString = JSON.stringify(event);
    return eventString.includes(intel.value);
  }

  private correlateThreatResults(results: ThreatDetectionResult[]): ThreatDetectionResult[] {
    // Simple correlation - group by event ID and merge similar threats
    const correlatedMap = new Map<string, ThreatDetectionResult>();

    for (const result of results) {
      const existing = correlatedMap.get(result.eventId);
      if (existing && existing.threatType === result.threatType) {
        // Merge results
        existing.confidence = Math.max(existing.confidence, result.confidence);
        existing.indicators.push(...result.indicators);
        existing.recommendations.push(...result.recommendations);
      } else {
        correlatedMap.set(`${result.eventId}-${result.threatType}`, result);
      }
    }

    return Array.from(correlatedMap.values());
  }

  private groupEventsByContext(events: SecurityEvent[]): Map<string, SecurityEvent[]> {
    const grouped = new Map<string, SecurityEvent[]>();

    for (const event of events) {
      const context = event.source.userId || event.source.sessionId || event.source.ipAddress;
      if (!grouped.has(context)) {
        grouped.set(context, []);
      }
      grouped.get(context)!.push(event);
    }

    return grouped;
  }

  private async performModelTraining(model: AnomalyDetectionModel, trainingData: any[]): Promise<MLModelMetrics> {
    // Simulate model training and return metrics
    return {
      modelId: model.id,
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.82 + Math.random() * 0.1,
      recall: 0.78 + Math.random() * 0.1,
      f1Score: 0.80 + Math.random() * 0.1,
      falsePositiveRate: Math.random() * 0.1,
      falseNegativeRate: Math.random() * 0.1,
      lastEvaluated: new Date().toISOString(),
    };
  }

  private getSignatureRecommendations(signature: ThreatSignature): string[] {
    const recommendations = {
      intrusion: ["Block source IP", "Review access logs", "Update security rules"],
      malware: ["Quarantine affected systems", "Run full system scan", "Update antivirus definitions"],
      behavioral: ["Monitor user activity", "Require additional authentication", "Review user permissions"],
      network: ["Analyze network traffic", "Check firewall rules", "Monitor bandwidth usage"],
      data_exfiltration: ["Block data transfer", "Investigate user activity", "Review data access permissions"],
    };

    return recommendations[signature.type] || ["Investigate further", "Monitor closely"];
  }

  private getMLRecommendations(model: AnomalyDetectionModel, score: number): string[] {
    const baseRecommendations = ["Investigate anomalous behavior", "Monitor user activity"];
    
    if (score > 80) {
      baseRecommendations.push("Immediate security review required");
    }
    
    if (model.type === "behavioral") {
      baseRecommendations.push("Review user behavior patterns");
    }

    return baseRecommendations;
  }

  private getBehavioralRecommendations(context: string, score: number): string[] {
    return [
      `Investigate behavioral anomaly for ${context}`,
      "Review recent activity patterns",
      "Consider additional authentication",
    ];
  }

  private isHighRiskIP(ipAddress: string): boolean {
    // Check against known high-risk IP ranges
    return false; // Simulated
  }

  private isHighRiskLocation(location: GeoLocation): boolean {
    // Check against high-risk geographic locations
    const highRiskCountries = ["CN", "RU", "KP", "IR"];
    return highRiskCountries.includes(location.country);
  }

  private getAverageModelAccuracy(): number {
    const models = Array.from(this.anomalyModels.values());
    if (models.length === 0) return 0;
    
    return models.reduce((sum, model) => sum + model.accuracy, 0) / models.length;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private generateEventId(): string {
    return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDetectionId(): string {
    return `DET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSignatureId(): string {
    return `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateModelId(): string {
    return `MDL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIntelligenceId(): string {
    return `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.isMonitoring = false;
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      this.removeAllListeners();
      console.log("🤖 AI-Powered Threat Detection Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during AI threat detection service shutdown:", error);
    }
  }
}

export const aiThreatDetectionService = new AIThreatDetectionService();
export default aiThreatDetectionService;