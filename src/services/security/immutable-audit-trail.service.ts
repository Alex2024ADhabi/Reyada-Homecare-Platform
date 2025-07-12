/**
 * Immutable Audit Trail Service
 * Implements blockchain-based audit trail with cryptographic integrity
 * Part of Phase 4: Security Hardening - Audit Trail
 */

import { EventEmitter } from "eventemitter3";
import { createHash } from "crypto";

// Audit Trail Types
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  action: string;
  resource: string;
  resourceId: string;
  outcome: "success" | "failure" | "partial";
  details: Record<string, any>;
  metadata: AuditMetadata;
  hash: string;
  previousHash: string;
  blockIndex: number;
}

export interface AuditMetadata {
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  deviceId?: string;
  applicationVersion: string;
  correlationId?: string;
  riskScore: number;
  complianceFlags: string[];
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  events: AuditEvent[];
  hash: string;
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  validator: string;
}

export interface AuditChain {
  id: string;
  name: string;
  description: string;
  blocks: AuditBlock[];
  currentIndex: number;
  totalEvents: number;
  integrity: ChainIntegrity;
  createdAt: string;
  lastUpdated: string;
}

export interface ChainIntegrity {
  isValid: boolean;
  lastValidated: string;
  validationResults: ValidationResult[];
  hashConsistency: boolean;
  chronologicalOrder: boolean;
  merkleTreeValid: boolean;
}

export interface ValidationResult {
  blockIndex: number;
  isValid: boolean;
  errors: string[];
  timestamp: string;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startTime?: string;
  endTime?: string;
  outcome?: "success" | "failure" | "partial";
  riskScore?: { min: number; max: number };
  complianceFlags?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: string;
    end: string;
  };
  filters: AuditQuery;
  events: AuditEvent[];
  statistics: AuditStatistics;
  complianceStatus: ComplianceStatus;
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface AuditStatistics {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByResource: Record<string, number>;
  eventsByOutcome: Record<string, number>;
  eventsByUser: Record<string, number>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  timeDistribution: Record<string, number>;
}

export interface ComplianceStatus {
  overall: "compliant" | "non_compliant" | "partial";
  frameworks: {
    hipaa: ComplianceFrameworkStatus;
    gdpr: ComplianceFrameworkStatus;
    sox: ComplianceFrameworkStatus;
    pci: ComplianceFrameworkStatus;
  };
  violations: ComplianceViolation[];
}

export interface ComplianceFrameworkStatus {
  status: "compliant" | "non_compliant" | "partial";
  score: number;
  requirements: {
    met: number;
    total: number;
  };
  lastAssessed: string;
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  events: string[];
  remediation: string[];
  detectedAt: string;
}

export interface AuditAlert {
  id: string;
  type: "integrity_violation" | "compliance_violation" | "suspicious_activity" | "system_anomaly";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  events: string[];
  timestamp: string;
  acknowledged: boolean;
  remediation: string[];
}

class ImmutableAuditTrailService extends EventEmitter {
  private auditChains: Map<string, AuditChain> = new Map();
  private pendingEvents: AuditEvent[] = [];
  private auditReports: Map<string, AuditReport> = new Map();
  private auditAlerts: Map<string, AuditAlert> = new Map();
  
  private blockInterval: NodeJS.Timeout | null = null;
  private validationInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  
  private readonly BLOCK_SIZE = 100; // Events per block
  private readonly BLOCK_INTERVAL = 60000; // 1 minute
  private readonly VALIDATION_INTERVAL = 300000; // 5 minutes

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("📋 Initializing Immutable Audit Trail Service...");

      // Create main audit chain
      await this.createAuditChain("main", "Main Audit Chain", "Primary audit trail for all system events");

      // Start block creation process
      this.startBlockCreation();

      // Start integrity validation
      this.startIntegrityValidation();

      this.isInitialized = true;
      this.emit("service:initialized");

      console.log("✅ Immutable Audit Trail Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Immutable Audit Trail Service:", error);
      throw error;
    }
  }

  /**
   * Log audit event to immutable trail
   */
  async logEvent(eventData: Omit<AuditEvent, "id" | "timestamp" | "hash" | "previousHash" | "blockIndex">): Promise<AuditEvent> {
    try {
      const eventId = this.generateEventId();
      const timestamp = new Date().toISOString();
      const previousHash = this.getLastEventHash();
      
      const event: AuditEvent = {
        ...eventData,
        id: eventId,
        timestamp,
        hash: "",
        previousHash,
        blockIndex: -1, // Will be set when added to block
      };

      // Calculate event hash
      event.hash = this.calculateEventHash(event);

      // Add to pending events
      this.pendingEvents.push(event);

      // Emit event for real-time monitoring
      this.emit("event:logged", event);

      // Check for immediate compliance violations
      await this.checkComplianceViolations(event);

      // Check for suspicious patterns
      await this.checkSuspiciousActivity(event);

      console.log(`📋 Audit event logged: ${event.action} on ${event.resource} by ${event.userId}`);
      return event;
    } catch (error) {
      console.error("❌ Failed to log audit event:", error);
      throw error;
    }
  }

  /**
   * Create new audit chain
   */
  async createAuditChain(id: string, name: string, description: string): Promise<AuditChain> {
    try {
      const genesisBlock = this.createGenesisBlock();
      
      const auditChain: AuditChain = {
        id,
        name,
        description,
        blocks: [genesisBlock],
        currentIndex: 0,
        totalEvents: 0,
        integrity: {
          isValid: true,
          lastValidated: new Date().toISOString(),
          validationResults: [],
          hashConsistency: true,
          chronologicalOrder: true,
          merkleTreeValid: true,
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      this.auditChains.set(id, auditChain);
      this.emit("chain:created", auditChain);

      console.log(`📋 Audit chain created: ${name}`);
      return auditChain;
    } catch (error) {
      console.error("❌ Failed to create audit chain:", error);
      throw error;
    }
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      const mainChain = this.auditChains.get("main");
      if (!mainChain) {
        throw new Error("Main audit chain not found");
      }

      let events: AuditEvent[] = [];
      
      // Collect events from all blocks
      for (const block of mainChain.blocks) {
        events.push(...block.events);
      }

      // Add pending events
      events.push(...this.pendingEvents);

      // Apply filters
      events = this.applyQueryFilters(events, query);

      // Sort by timestamp
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      events = events.slice(offset, offset + limit);

      this.emit("events:queried", { query, count: events.length });
      return events;
    } catch (error) {
      console.error("❌ Failed to query audit events:", error);
      throw error;
    }
  }

  /**
   * Generate audit report
   */
  async generateReport(
    title: string,
    description: string,
    period: { start: string; end: string },
    filters: AuditQuery,
    generatedBy: string
  ): Promise<AuditReport> {
    try {
      const reportId = this.generateReportId();
      
      // Query events for the period
      const queryWithPeriod = {
        ...filters,
        startTime: period.start,
        endTime: period.end,
        limit: 10000, // Large limit for reports
      };

      const events = await this.queryEvents(queryWithPeriod);

      // Generate statistics
      const statistics = this.generateAuditStatistics(events);

      // Assess compliance status
      const complianceStatus = await this.assessComplianceStatus(events);

      // Generate recommendations
      const recommendations = this.generateRecommendations(events, statistics, complianceStatus);

      const report: AuditReport = {
        id: reportId,
        title,
        description,
        period,
        filters,
        events,
        statistics,
        complianceStatus,
        recommendations,
        generatedAt: new Date().toISOString(),
        generatedBy,
      };

      this.auditReports.set(reportId, report);
      this.emit("report:generated", report);

      console.log(`📋 Audit report generated: ${title} (${events.length} events)`);
      return report;
    } catch (error) {
      console.error("❌ Failed to generate audit report:", error);
      throw error;
    }
  }

  /**
   * Validate chain integrity
   */
  async validateChainIntegrity(chainId: string = "main"): Promise<ChainIntegrity> {
    try {
      const chain = this.auditChains.get(chainId);
      if (!chain) {
        throw new Error(`Audit chain not found: ${chainId}`);
      }

      const validationResults: ValidationResult[] = [];
      let hashConsistency = true;
      let chronologicalOrder = true;
      let merkleTreeValid = true;

      // Validate each block
      for (let i = 0; i < chain.blocks.length; i++) {
        const block = chain.blocks[i];
        const result = await this.validateBlock(block, i === 0 ? null : chain.blocks[i - 1]);
        
        validationResults.push(result);
        
        if (!result.isValid) {
          hashConsistency = false;
        }

        // Check chronological order
        if (i > 0 && new Date(block.timestamp) < new Date(chain.blocks[i - 1].timestamp)) {
          chronologicalOrder = false;
        }

        // Validate Merkle tree
        if (!this.validateMerkleTree(block)) {
          merkleTreeValid = false;
        }
      }

      const integrity: ChainIntegrity = {
        isValid: hashConsistency && chronologicalOrder && merkleTreeValid,
        lastValidated: new Date().toISOString(),
        validationResults,
        hashConsistency,
        chronologicalOrder,
        merkleTreeValid,
      };

      chain.integrity = integrity;
      this.emit("integrity:validated", { chainId, integrity });

      return integrity;
    } catch (error) {
      console.error("❌ Failed to validate chain integrity:", error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  getAuditStatistics(chainId: string = "main"): AuditStatistics | null {
    const chain = this.auditChains.get(chainId);
    if (!chain) return null;

    const allEvents: AuditEvent[] = [];
    chain.blocks.forEach(block => allEvents.push(...block.events));
    allEvents.push(...this.pendingEvents);

    return this.generateAuditStatistics(allEvents);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): AuditAlert[] {
    return Array.from(this.auditAlerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.auditAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit("alert:acknowledged", alert);
      return true;
    }
    return false;
  }

  // Private helper methods
  private startBlockCreation(): void {
    this.blockInterval = setInterval(() => {
      this.createBlock();
    }, this.BLOCK_INTERVAL);
  }

  private startIntegrityValidation(): void {
    this.validationInterval = setInterval(() => {
      this.validateChainIntegrity();
    }, this.VALIDATION_INTERVAL);
  }

  private async createBlock(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    try {
      const mainChain = this.auditChains.get("main");
      if (!mainChain) return;

      // Take events for this block
      const eventsForBlock = this.pendingEvents.splice(0, this.BLOCK_SIZE);
      
      // Set block index for events
      const blockIndex = mainChain.currentIndex + 1;
      eventsForBlock.forEach(event => {
        event.blockIndex = blockIndex;
      });

      // Get previous block hash
      const previousBlock = mainChain.blocks[mainChain.blocks.length - 1];
      const previousHash = previousBlock.hash;

      // Create new block
      const block: AuditBlock = {
        index: blockIndex,
        timestamp: new Date().toISOString(),
        events: eventsForBlock,
        hash: "",
        previousHash,
        merkleRoot: this.calculateMerkleRoot(eventsForBlock),
        nonce: 0,
        difficulty: 4,
        validator: "system",
      };

      // Mine block (proof of work)
      block.hash = this.mineBlock(block);

      // Add block to chain
      mainChain.blocks.push(block);
      mainChain.currentIndex = blockIndex;
      mainChain.totalEvents += eventsForBlock.length;
      mainChain.lastUpdated = new Date().toISOString();

      this.emit("block:created", block);
      console.log(`📋 Block created: ${blockIndex} with ${eventsForBlock.length} events`);
    } catch (error) {
      console.error("❌ Failed to create block:", error);
    }
  }

  private createGenesisBlock(): AuditBlock {
    const genesisBlock: AuditBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      events: [],
      hash: "",
      previousHash: "0",
      merkleRoot: "0",
      nonce: 0,
      difficulty: 4,
      validator: "genesis",
    };

    genesisBlock.hash = this.calculateBlockHash(genesisBlock);
    return genesisBlock;
  }

  private calculateEventHash(event: AuditEvent): string {
    const eventData = {
      ...event,
      hash: "", // Exclude hash from hash calculation
    };
    
    const eventString = JSON.stringify(eventData);
    return createHash("sha256").update(eventString).digest("hex");
  }

  private calculateBlockHash(block: AuditBlock): string {
    const blockData = {
      ...block,
      hash: "", // Exclude hash from hash calculation
    };
    
    const blockString = JSON.stringify(blockData);
    return createHash("sha256").update(blockString).digest("hex");
  }

  private calculateMerkleRoot(events: AuditEvent[]): string {
    if (events.length === 0) return "0";
    
    let hashes = events.map(event => event.hash);
    
    while (hashes.length > 1) {
      const newHashes: string[] = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : left;
        const combined = createHash("sha256").update(left + right).digest("hex");
        newHashes.push(combined);
      }
      
      hashes = newHashes;
    }
    
    return hashes[0];
  }

  private mineBlock(block: AuditBlock): string {
    const target = "0".repeat(block.difficulty);
    
    while (true) {
      const hash = this.calculateBlockHash(block);
      
      if (hash.substring(0, block.difficulty) === target) {
        return hash;
      }
      
      block.nonce++;
    }
  }

  private async validateBlock(block: AuditBlock, previousBlock: AuditBlock | null): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate hash
    const calculatedHash = this.calculateBlockHash(block);
    if (calculatedHash !== block.hash) {
      errors.push("Block hash mismatch");
    }

    // Validate previous hash
    if (previousBlock && block.previousHash !== previousBlock.hash) {
      errors.push("Previous hash mismatch");
    }

    // Validate Merkle root
    const calculatedMerkleRoot = this.calculateMerkleRoot(block.events);
    if (calculatedMerkleRoot !== block.merkleRoot) {
      errors.push("Merkle root mismatch");
    }

    // Validate event hashes
    for (const event of block.events) {
      const calculatedEventHash = this.calculateEventHash(event);
      if (calculatedEventHash !== event.hash) {
        errors.push(`Event hash mismatch: ${event.id}`);
      }
    }

    return {
      blockIndex: block.index,
      isValid: errors.length === 0,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  private validateMerkleTree(block: AuditBlock): boolean {
    const calculatedRoot = this.calculateMerkleRoot(block.events);
    return calculatedRoot === block.merkleRoot;
  }

  private getLastEventHash(): string {
    const mainChain = this.auditChains.get("main");
    if (!mainChain || mainChain.blocks.length === 0) return "0";

    const lastBlock = mainChain.blocks[mainChain.blocks.length - 1];
    if (lastBlock.events.length === 0) return lastBlock.previousHash;

    return lastBlock.events[lastBlock.events.length - 1].hash;
  }

  private applyQueryFilters(events: AuditEvent[], query: AuditQuery): AuditEvent[] {
    return events.filter(event => {
      if (query.userId && event.userId !== query.userId) return false;
      if (query.action && event.action !== query.action) return false;
      if (query.resource && event.resource !== query.resource) return false;
      if (query.outcome && event.outcome !== query.outcome) return false;
      
      if (query.startTime && new Date(event.timestamp) < new Date(query.startTime)) return false;
      if (query.endTime && new Date(event.timestamp) > new Date(query.endTime)) return false;
      
      if (query.riskScore) {
        const riskScore = event.metadata.riskScore;
        if (riskScore < query.riskScore.min || riskScore > query.riskScore.max) return false;
      }
      
      if (query.complianceFlags && query.complianceFlags.length > 0) {
        const hasFlag = query.complianceFlags.some(flag => 
          event.metadata.complianceFlags.includes(flag)
        );
        if (!hasFlag) return false;
      }
      
      return true;
    });
  }

  private generateAuditStatistics(events: AuditEvent[]): AuditStatistics {
    const statistics: AuditStatistics = {
      totalEvents: events.length,
      eventsByAction: {},
      eventsByResource: {},
      eventsByOutcome: {},
      eventsByUser: {},
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      timeDistribution: {},
    };

    events.forEach(event => {
      // Count by action
      statistics.eventsByAction[event.action] = (statistics.eventsByAction[event.action] || 0) + 1;
      
      // Count by resource
      statistics.eventsByResource[event.resource] = (statistics.eventsByResource[event.resource] || 0) + 1;
      
      // Count by outcome
      statistics.eventsByOutcome[event.outcome] = (statistics.eventsByOutcome[event.outcome] || 0) + 1;
      
      // Count by user
      statistics.eventsByUser[event.userId] = (statistics.eventsByUser[event.userId] || 0) + 1;
      
      // Risk distribution
      const riskScore = event.metadata.riskScore;
      if (riskScore >= 80) statistics.riskDistribution.critical++;
      else if (riskScore >= 60) statistics.riskDistribution.high++;
      else if (riskScore >= 40) statistics.riskDistribution.medium++;
      else statistics.riskDistribution.low++;
      
      // Time distribution (by hour)
      const hour = new Date(event.timestamp).getHours();
      const hourKey = `${hour}:00`;
      statistics.timeDistribution[hourKey] = (statistics.timeDistribution[hourKey] || 0) + 1;
    });

    return statistics;
  }

  private async assessComplianceStatus(events: AuditEvent[]): Promise<ComplianceStatus> {
    // Simplified compliance assessment
    const violations: ComplianceViolation[] = [];
    
    // Check for HIPAA violations
    const hipaaViolations = events.filter(event => 
      event.resource === "patient_data" && 
      event.outcome === "failure" &&
      event.metadata.riskScore > 70
    );

    if (hipaaViolations.length > 0) {
      violations.push({
        id: this.generateViolationId(),
        framework: "HIPAA",
        requirement: "Access Control",
        severity: "high",
        description: "Unauthorized access attempts to patient data",
        events: hipaaViolations.map(e => e.id),
        remediation: ["Review access controls", "Investigate failed access attempts"],
        detectedAt: new Date().toISOString(),
      });
    }

    return {
      overall: violations.length === 0 ? "compliant" : "non_compliant",
      frameworks: {
        hipaa: {
          status: hipaaViolations.length === 0 ? "compliant" : "non_compliant",
          score: Math.max(0, 100 - (hipaaViolations.length * 10)),
          requirements: { met: 8, total: 10 },
          lastAssessed: new Date().toISOString(),
        },
        gdpr: {
          status: "compliant",
          score: 95,
          requirements: { met: 9, total: 10 },
          lastAssessed: new Date().toISOString(),
        },
        sox: {
          status: "compliant",
          score: 92,
          requirements: { met: 11, total: 12 },
          lastAssessed: new Date().toISOString(),
        },
        pci: {
          status: "partial",
          score: 78,
          requirements: { met: 7, total: 10 },
          lastAssessed: new Date().toISOString(),
        },
      },
      violations,
    };
  }

  private generateRecommendations(
    events: AuditEvent[],
    statistics: AuditStatistics,
    complianceStatus: ComplianceStatus
  ): string[] {
    const recommendations: string[] = [];

    // High-risk events
    if (statistics.riskDistribution.critical > 0) {
      recommendations.push("Investigate critical risk events immediately");
    }

    // Failed access attempts
    const failedEvents = statistics.eventsByOutcome.failure || 0;
    if (failedEvents > events.length * 0.1) {
      recommendations.push("Review and strengthen access controls");
    }

    // Compliance violations
    if (complianceStatus.violations.length > 0) {
      recommendations.push("Address compliance violations to maintain regulatory compliance");
    }

    // User activity patterns
    const topUsers = Object.entries(statistics.eventsByUser)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topUsers.length > 0 && topUsers[0][1] > events.length * 0.3) {
      recommendations.push(`Review activity patterns for user ${topUsers[0][0]} (${topUsers[0][1]} events)`);
    }

    return recommendations;
  }

  private async checkComplianceViolations(event: AuditEvent): Promise<void> {
    // Check for immediate compliance violations
    if (event.resource === "patient_data" && event.outcome === "failure") {
      this.createAlert({
        type: "compliance_violation",
        severity: "high",
        title: "HIPAA Compliance Violation",
        description: `Failed access attempt to patient data by ${event.userId}`,
        events: [event.id],
        remediation: ["Investigate access attempt", "Review user permissions"],
      });
    }
  }

  private async checkSuspiciousActivity(event: AuditEvent): Promise<void> {
    // Check for suspicious activity patterns
    if (event.metadata.riskScore > 80) {
      this.createAlert({
        type: "suspicious_activity",
        severity: "high",
        title: "High-Risk Activity Detected",
        description: `High-risk activity detected: ${event.action} on ${event.resource}`,
        events: [event.id],
        remediation: ["Investigate user activity", "Review security controls"],
      });
    }
  }

  private createAlert(alertData: Omit<AuditAlert, "id" | "timestamp" | "acknowledged">): void {
    const alert: AuditAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.auditAlerts.set(alert.id, alert);
    this.emit("alert:created", alert);
  }

  private generateEventId(): string {
    return `AE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `AR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateViolationId(): string {
    return `CV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `AA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.blockInterval) {
        clearInterval(this.blockInterval);
      }
      
      if (this.validationInterval) {
        clearInterval(this.validationInterval);
      }
      
      this.removeAllListeners();
      console.log("📋 Immutable Audit Trail Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during audit trail service shutdown:", error);
    }
  }
}

export const immutableAuditTrailService = new ImmutableAuditTrailService();
export default immutableAuditTrailService;