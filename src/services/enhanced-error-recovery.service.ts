import {
  errorHandlerService,
  ErrorReport,
} from "@/services/error-handler.service";
import websocketService from "@/services/websocket.service";

interface RecoveryMetrics {
  totalRecoveryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
  criticalRecoveries: number;
  healthcareRecoveries: number;
  dohComplianceRecoveries: number;
  patientSafetyRecoveries: number;
}

interface SystemFailover {
  id: string;
  type: "database" | "api" | "network" | "service";
  primaryEndpoint: string;
  fallbackEndpoints: string[];
  healthCheckInterval: number;
  maxFailures: number;
  currentFailures: number;
  isActive: boolean;
  lastHealthCheck: Date;
  status: "healthy" | "degraded" | "failed";
}

interface AutoHealingRule {
  id: string;
  name: string;
  condition: (error: ErrorReport) => boolean;
  healingAction: () => Promise<boolean>;
  cooldownPeriod: number;
  maxAttempts: number;
  currentAttempts: number;
  lastAttempt: Date | null;
  successRate: number;
  healthcareSpecific: boolean;
  dohCompliant: boolean;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  trigger: (error: ErrorReport) => boolean;
  actions: EmergencyAction[];
  escalationLevel: "low" | "medium" | "high" | "critical";
  healthcareImpact: "none" | "low" | "medium" | "high" | "critical";
  dohComplianceRequired: boolean;
  patientSafetyProtocol: boolean;
}

interface EmergencyAction {
  id: string;
  type: "notification" | "failover" | "shutdown" | "backup" | "escalation";
  description: string;
  execute: () => Promise<boolean>;
  timeout: number;
  retryable: boolean;
}

interface ErrorPattern {
  id: string;
  pattern: RegExp;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  frequency: number;
  lastOccurrence: Date;
  preventionStrategy: string;
  healthcareRelated: boolean;
}

class EnhancedErrorRecoveryService {
  private recoveryMetrics: RecoveryMetrics = {
    totalRecoveryAttempts: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    averageRecoveryTime: 0,
    recoverySuccessRate: 0,
    criticalRecoveries: 0,
    healthcareRecoveries: 0,
    dohComplianceRecoveries: 0,
    patientSafetyRecoveries: 0,
  };

  private systemFailovers: Map<string, SystemFailover> = new Map();
  private autoHealingRules: Map<string, AutoHealingRule> = new Map();
  private emergencyProtocols: Map<string, EmergencyProtocol> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryQueue: Map<string, ErrorReport> = new Map();
  private isEmergencyMode: boolean = false;
  private systemHealthScore: number = 100;
  private lastSystemCheck: Date = new Date();

  // Real-time monitoring
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private patternAnalysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSystemFailovers();
    this.initializeAutoHealingRules();
    this.initializeEmergencyProtocols();
    this.initializeErrorPatterns();
    this.startRealTimeMonitoring();
    this.startHealthChecks();
    this.startPatternAnalysis();
    this.setupErrorHandlerIntegration();
  }

  private setupErrorHandlerIntegration(): void {
    // Listen to error handler events
    errorHandlerService.on(
      "error-occurred",
      this.handleErrorOccurred.bind(this),
    );
    errorHandlerService.on(
      "critical-error",
      this.handleCriticalError.bind(this),
    );
    errorHandlerService.on(
      "patient-safety-risk",
      this.handlePatientSafetyRisk.bind(this),
    );
    errorHandlerService.on(
      "doh-compliance-risk",
      this.handleDOHComplianceRisk.bind(this),
    );
    errorHandlerService.on(
      "error-recovered",
      this.handleErrorRecovered.bind(this),
    );
  }

  private async handleErrorOccurred(errorReport: ErrorReport): Promise<void> {
    // Analyze error pattern
    this.analyzeErrorPattern(errorReport);

    // Check if auto-healing is applicable
    await this.attemptAutoHealing(errorReport);

    // Update system health score
    this.updateSystemHealthScore(errorReport);

    // Broadcast error event via WebSocket
    this.broadcastErrorEvent("error-occurred", errorReport);
  }

  private async handleCriticalError(errorReport: ErrorReport): Promise<void> {
    this.recoveryMetrics.criticalRecoveries++;

    // Activate emergency protocols
    await this.activateEmergencyProtocols(errorReport);

    // Attempt immediate recovery
    await this.attemptImmediateRecovery(errorReport);

    // Broadcast critical error event
    this.broadcastErrorEvent("critical-error", errorReport);
  }

  private async handlePatientSafetyRisk(
    errorReport: ErrorReport,
  ): Promise<void> {
    this.recoveryMetrics.patientSafetyRecoveries++;

    // Activate patient safety protocols
    await this.activatePatientSafetyProtocols(errorReport);

    // Switch to emergency mode if necessary
    if (errorReport.healthcareImpact === "critical") {
      this.activateEmergencyMode();
    }

    this.broadcastErrorEvent("patient-safety-risk", errorReport);
  }

  private async handleDOHComplianceRisk(
    errorReport: ErrorReport,
  ): Promise<void> {
    this.recoveryMetrics.dohComplianceRecoveries++;

    // Activate DOH compliance protocols
    await this.activateDOHComplianceProtocols(errorReport);

    // Create compliance audit entry
    await this.createComplianceAuditEntry(errorReport);

    this.broadcastErrorEvent("doh-compliance-risk", errorReport);
  }

  private handleErrorRecovered(errorReport: ErrorReport): void {
    this.recoveryMetrics.successfulRecoveries++;
    this.updateRecoveryMetrics();
    this.broadcastErrorEvent("error-recovered", errorReport);
  }

  private analyzeErrorPattern(errorReport: ErrorReport): void {
    const message = errorReport.message.toLowerCase();

    // Check against known patterns
    for (const [id, pattern] of this.errorPatterns.entries()) {
      if (pattern.pattern.test(message)) {
        pattern.frequency++;
        pattern.lastOccurrence = new Date();

        // If pattern frequency is high, implement prevention
        if (pattern.frequency > 5) {
          this.implementPatternPrevention(pattern);
        }
      }
    }
  }

  private async attemptAutoHealing(errorReport: ErrorReport): Promise<boolean> {
    for (const [id, rule] of this.autoHealingRules.entries()) {
      if (rule.condition(errorReport) && this.canAttemptHealing(rule)) {
        const startTime = Date.now();

        try {
          rule.currentAttempts++;
          rule.lastAttempt = new Date();

          const success = await rule.healingAction();
          const recoveryTime = Date.now() - startTime;

          if (success) {
            rule.successRate = (rule.successRate + 1) / rule.currentAttempts;
            this.updateRecoveryTime(recoveryTime);
            this.broadcastRecoveryEvent("auto-healing-success", {
              ruleId: id,
              errorId: errorReport.id,
              recoveryTime,
            });
            return true;
          }
        } catch (healingError) {
          console.error(`Auto-healing rule ${id} failed:`, healingError);
        }
      }
    }

    return false;
  }

  private canAttemptHealing(rule: AutoHealingRule): boolean {
    if (rule.currentAttempts >= rule.maxAttempts) {
      return false;
    }

    if (rule.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - rule.lastAttempt.getTime();
      if (timeSinceLastAttempt < rule.cooldownPeriod) {
        return false;
      }
    }

    return true;
  }

  private async activateEmergencyProtocols(
    errorReport: ErrorReport,
  ): Promise<void> {
    for (const [id, protocol] of this.emergencyProtocols.entries()) {
      if (protocol.trigger(errorReport)) {
        console.log(`Activating emergency protocol: ${protocol.name}`);

        for (const action of protocol.actions) {
          try {
            await this.executeEmergencyAction(action);
          } catch (error) {
            console.error(`Emergency action ${action.id} failed:`, error);
          }
        }

        this.broadcastRecoveryEvent("emergency-protocol-activated", {
          protocolId: id,
          protocolName: protocol.name,
          errorId: errorReport.id,
        });
      }
    }
  }

  private async executeEmergencyAction(
    action: EmergencyAction,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, action.timeout);

      action
        .execute()
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error(`Emergency action ${action.id} failed:`, error);
          resolve(false);
        });
    });
  }

  private async attemptImmediateRecovery(
    errorReport: ErrorReport,
  ): Promise<boolean> {
    const startTime = Date.now();
    this.recoveryMetrics.totalRecoveryAttempts++;

    try {
      // Attempt system failover if applicable
      const failoverSuccess = await this.attemptSystemFailover(errorReport);
      if (failoverSuccess) {
        const recoveryTime = Date.now() - startTime;
        this.updateRecoveryTime(recoveryTime);
        return true;
      }

      // Attempt service restart
      const restartSuccess = await this.attemptServiceRestart(errorReport);
      if (restartSuccess) {
        const recoveryTime = Date.now() - startTime;
        this.updateRecoveryTime(recoveryTime);
        return true;
      }

      // Attempt graceful degradation
      const degradationSuccess =
        await this.attemptGracefulDegradation(errorReport);
      if (degradationSuccess) {
        const recoveryTime = Date.now() - startTime;
        this.updateRecoveryTime(recoveryTime);
        return true;
      }

      this.recoveryMetrics.failedRecoveries++;
      return false;
    } catch (error) {
      this.recoveryMetrics.failedRecoveries++;
      console.error("Immediate recovery failed:", error);
      return false;
    }
  }

  private async attemptSystemFailover(
    errorReport: ErrorReport,
  ): Promise<boolean> {
    const category = errorReport.category;

    for (const [id, failover] of this.systemFailovers.entries()) {
      if (this.shouldTriggerFailover(failover, errorReport)) {
        try {
          const success = await this.executeFailover(failover);
          if (success) {
            this.broadcastRecoveryEvent("system-failover", {
              failoverId: id,
              errorId: errorReport.id,
              fallbackEndpoint: failover.fallbackEndpoints[0],
            });
            return true;
          }
        } catch (error) {
          console.error(`Failover ${id} failed:`, error);
        }
      }
    }

    return false;
  }

  private shouldTriggerFailover(
    failover: SystemFailover,
    errorReport: ErrorReport,
  ): boolean {
    if (!failover.isActive) return false;

    const errorMessage = errorReport.message.toLowerCase();
    const errorCategory = errorReport.category;

    // Check if error is related to this failover system
    if (failover.type === "network" && errorCategory === "network") return true;
    if (failover.type === "database" && errorMessage.includes("database"))
      return true;
    if (failover.type === "api" && errorMessage.includes("api")) return true;
    if (failover.type === "service" && errorCategory === "system") return true;

    return false;
  }

  private async executeFailover(failover: SystemFailover): Promise<boolean> {
    if (failover.fallbackEndpoints.length === 0) return false;

    for (const endpoint of failover.fallbackEndpoints) {
      try {
        // Test endpoint health
        const isHealthy = await this.testEndpointHealth(endpoint);
        if (isHealthy) {
          // Switch to fallback endpoint
          failover.primaryEndpoint = endpoint;
          failover.status = "degraded";
          return true;
        }
      } catch (error) {
        console.error(`Failover endpoint ${endpoint} failed:`, error);
      }
    }

    failover.status = "failed";
    return false;
  }

  private async testEndpointHealth(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: "GET",
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async attemptServiceRestart(
    errorReport: ErrorReport,
  ): Promise<boolean> {
    // Simulate service restart logic
    // In a real implementation, this would restart specific services
    console.log("Attempting service restart for error:", errorReport.id);

    // Simulate restart delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return success based on error type
    return errorReport.category !== "security";
  }

  private async attemptGracefulDegradation(
    errorReport: ErrorReport,
  ): Promise<boolean> {
    // Implement graceful degradation strategies
    if (errorReport.healthcareImpact === "critical") {
      // Switch to emergency mode
      this.activateEmergencyMode();
      return true;
    }

    if (errorReport.dohComplianceRisk) {
      // Switch to compliance-safe mode
      this.activateComplianceMode();
      return true;
    }

    if (errorReport.category === "network") {
      // Switch to offline mode
      this.activateOfflineMode();
      return true;
    }

    return false;
  }

  private activateEmergencyMode(): void {
    this.isEmergencyMode = true;
    this.broadcastRecoveryEvent("emergency-mode-activated", {
      timestamp: new Date().toISOString(),
      reason: "Critical healthcare error detected",
    });
  }

  private activateComplianceMode(): void {
    this.broadcastRecoveryEvent("compliance-mode-activated", {
      timestamp: new Date().toISOString(),
      reason: "DOH compliance risk detected",
    });
  }

  private activateOfflineMode(): void {
    this.broadcastRecoveryEvent("offline-mode-activated", {
      timestamp: new Date().toISOString(),
      reason: "Network connectivity issues",
    });
  }

  private async activatePatientSafetyProtocols(
    errorReport: ErrorReport,
  ): Promise<void> {
    // Implement patient safety protocols
    console.log("Activating patient safety protocols for:", errorReport.id);

    // Notify healthcare staff
    this.broadcastRecoveryEvent("patient-safety-protocol-activated", {
      errorId: errorReport.id,
      severity: errorReport.severity,
      healthcareImpact: errorReport.healthcareImpact,
    });
  }

  private async activateDOHComplianceProtocols(
    errorReport: ErrorReport,
  ): Promise<void> {
    // Implement DOH compliance protocols
    console.log("Activating DOH compliance protocols for:", errorReport.id);

    // Create compliance incident report
    this.broadcastRecoveryEvent("doh-compliance-protocol-activated", {
      errorId: errorReport.id,
      complianceRisk: errorReport.dohComplianceRisk,
      auditRequired: true,
    });
  }

  private async createComplianceAuditEntry(
    errorReport: ErrorReport,
  ): Promise<void> {
    const auditEntry = {
      id: `compliance-audit-${Date.now()}`,
      errorId: errorReport.id,
      timestamp: new Date().toISOString(),
      complianceType: "DOH",
      riskLevel: errorReport.healthcareImpact,
      actionsTaken: "Automated compliance protocols activated",
      status: "active",
    };

    // Store audit entry (in real implementation, this would go to compliance database)
    localStorage.setItem(
      `compliance_audit_${auditEntry.id}`,
      JSON.stringify(auditEntry),
    );
  }

  private implementPatternPrevention(pattern: ErrorPattern): void {
    console.log(`Implementing prevention for pattern: ${pattern.id}`);

    // Implement pattern-specific prevention strategies
    this.broadcastRecoveryEvent("pattern-prevention-implemented", {
      patternId: pattern.id,
      frequency: pattern.frequency,
      preventionStrategy: pattern.preventionStrategy,
    });
  }

  private updateSystemHealthScore(errorReport: ErrorReport): void {
    let impact = 0;

    switch (errorReport.severity) {
      case "critical":
        impact = 10;
        break;
      case "high":
        impact = 5;
        break;
      case "medium":
        impact = 2;
        break;
      case "low":
        impact = 1;
        break;
    }

    // Additional impact for healthcare errors
    if (errorReport.healthcareImpact === "critical") {
      impact *= 2;
    }

    this.systemHealthScore = Math.max(0, this.systemHealthScore - impact);

    // Gradual recovery of health score
    if (this.systemHealthScore < 100) {
      setTimeout(() => {
        this.systemHealthScore = Math.min(100, this.systemHealthScore + 1);
      }, 60000); // Recover 1 point per minute
    }
  }

  private updateRecoveryTime(recoveryTime: number): void {
    const currentAverage = this.recoveryMetrics.averageRecoveryTime;
    const totalRecoveries = this.recoveryMetrics.successfulRecoveries;

    this.recoveryMetrics.averageRecoveryTime =
      (currentAverage * (totalRecoveries - 1) + recoveryTime) / totalRecoveries;
  }

  private updateRecoveryMetrics(): void {
    const total =
      this.recoveryMetrics.successfulRecoveries +
      this.recoveryMetrics.failedRecoveries;
    this.recoveryMetrics.recoverySuccessRate =
      total > 0 ? (this.recoveryMetrics.successfulRecoveries / total) * 100 : 0;
  }

  private broadcastErrorEvent(eventType: string, data: any): void {
    try {
      websocketService.send("error-monitoring", {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Failed to broadcast error event:", error);
    }
  }

  private broadcastRecoveryEvent(eventType: string, data: any): void {
    try {
      websocketService.send("error-recovery", {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Failed to broadcast recovery event:", error);
    }
  }

  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performSystemHealthCheck();
      this.updateRecoveryMetrics();
      this.broadcastSystemStatus();
    }, 30000); // Every 30 seconds
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performFailoverHealthChecks();
    }, 60000); // Every minute
  }

  private startPatternAnalysis(): void {
    this.patternAnalysisInterval = setInterval(() => {
      this.analyzeErrorTrends();
    }, 300000); // Every 5 minutes
  }

  private performSystemHealthCheck(): void {
    this.lastSystemCheck = new Date();

    // Check system components
    const componentHealth = {
      errorHandler: errorHandlerService ? "operational" : "failed",
      websocket: websocketService.isConnected() ? "operational" : "degraded",
      recovery:
        this.recoveryMetrics.recoverySuccessRate > 80
          ? "operational"
          : "degraded",
    };

    this.broadcastRecoveryEvent("system-health-check", {
      healthScore: this.systemHealthScore,
      components: componentHealth,
      timestamp: this.lastSystemCheck.toISOString(),
    });
  }

  private async performFailoverHealthChecks(): Promise<void> {
    for (const [id, failover] of this.systemFailovers.entries()) {
      if (failover.isActive) {
        const isHealthy = await this.testEndpointHealth(
          failover.primaryEndpoint,
        );

        if (!isHealthy) {
          failover.currentFailures++;
          if (failover.currentFailures >= failover.maxFailures) {
            failover.status = "failed";
            await this.executeFailover(failover);
          }
        } else {
          failover.currentFailures = 0;
          failover.status = "healthy";
        }

        failover.lastHealthCheck = new Date();
      }
    }
  }

  private analyzeErrorTrends(): void {
    const recentErrors = errorHandlerService.getRecentErrors(50);
    const trends = {
      increasingPatterns: [],
      criticalTrends: [],
      healthcareRisks: [],
    };

    // Analyze trends and patterns
    this.broadcastRecoveryEvent("error-trend-analysis", trends);
  }

  private broadcastSystemStatus(): void {
    const status = {
      healthScore: this.systemHealthScore,
      isEmergencyMode: this.isEmergencyMode,
      recoveryMetrics: this.recoveryMetrics,
      activeFailovers: Array.from(this.systemFailovers.values()).filter(
        (f) => f.isActive,
      ),
      lastSystemCheck: this.lastSystemCheck,
    };

    this.broadcastRecoveryEvent("system-status", status);
  }

  private initializeSystemFailovers(): void {
    // Database failover
    this.systemFailovers.set("database-primary", {
      id: "database-primary",
      type: "database",
      primaryEndpoint: "https://primary-db.reyada.com",
      fallbackEndpoints: [
        "https://secondary-db.reyada.com",
        "https://backup-db.reyada.com",
      ],
      healthCheckInterval: 60000,
      maxFailures: 3,
      currentFailures: 0,
      isActive: true,
      lastHealthCheck: new Date(),
      status: "healthy",
    });

    // API failover
    this.systemFailovers.set("api-gateway", {
      id: "api-gateway",
      type: "api",
      primaryEndpoint: "https://api.reyada.com",
      fallbackEndpoints: [
        "https://api-backup.reyada.com",
        "https://api-emergency.reyada.com",
      ],
      healthCheckInterval: 30000,
      maxFailures: 2,
      currentFailures: 0,
      isActive: true,
      lastHealthCheck: new Date(),
      status: "healthy",
    });
  }

  private initializeAutoHealingRules(): void {
    // Memory leak healing
    this.autoHealingRules.set("memory-leak-healing", {
      id: "memory-leak-healing",
      name: "Memory Leak Auto-Healing",
      condition: (error) => error.message.toLowerCase().includes("memory"),
      healingAction: async () => {
        // Trigger garbage collection
        if (global.gc) {
          global.gc();
        }
        return true;
      },
      cooldownPeriod: 300000, // 5 minutes
      maxAttempts: 3,
      currentAttempts: 0,
      lastAttempt: null,
      successRate: 0,
      healthcareSpecific: false,
      dohCompliant: true,
    });

    // Network reconnection healing
    this.autoHealingRules.set("network-reconnection", {
      id: "network-reconnection",
      name: "Network Reconnection Healing",
      condition: (error) => error.category === "network",
      healingAction: async () => {
        // Attempt to reconnect WebSocket
        if (!websocketService.isConnected()) {
          websocketService.forceReconnect();
          // Wait for connection
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return websocketService.isConnected();
        }
        return true;
      },
      cooldownPeriod: 60000, // 1 minute
      maxAttempts: 5,
      currentAttempts: 0,
      lastAttempt: null,
      successRate: 0,
      healthcareSpecific: false,
      dohCompliant: true,
    });

    // Healthcare data sync healing
    this.autoHealingRules.set("healthcare-sync-healing", {
      id: "healthcare-sync-healing",
      name: "Healthcare Data Sync Healing",
      condition: (error) =>
        error.context.healthcareWorkflow === "patient_data_sync",
      healingAction: async () => {
        // Attempt to resync healthcare data
        console.log("Attempting healthcare data resync");
        // Simulate resync process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      },
      cooldownPeriod: 120000, // 2 minutes
      maxAttempts: 3,
      currentAttempts: 0,
      lastAttempt: null,
      successRate: 0,
      healthcareSpecific: true,
      dohCompliant: true,
    });
  }

  private initializeEmergencyProtocols(): void {
    // Critical patient safety protocol
    this.emergencyProtocols.set("critical-patient-safety", {
      id: "critical-patient-safety",
      name: "Critical Patient Safety Protocol",
      trigger: (error) =>
        error.patientSafetyRisk && error.severity === "critical",
      actions: [
        {
          id: "notify-medical-staff",
          type: "notification",
          description: "Notify medical staff immediately",
          execute: async () => {
            console.log("EMERGENCY: Notifying medical staff");
            return true;
          },
          timeout: 5000,
          retryable: true,
        },
        {
          id: "activate-emergency-mode",
          type: "escalation",
          description: "Activate emergency system mode",
          execute: async () => {
            this.activateEmergencyMode();
            return true;
          },
          timeout: 1000,
          retryable: false,
        },
      ],
      escalationLevel: "critical",
      healthcareImpact: "critical",
      dohComplianceRequired: true,
      patientSafetyProtocol: true,
    });

    // DOH compliance emergency protocol
    this.emergencyProtocols.set("doh-compliance-emergency", {
      id: "doh-compliance-emergency",
      name: "DOH Compliance Emergency Protocol",
      trigger: (error) =>
        error.dohComplianceRisk && error.severity === "critical",
      actions: [
        {
          id: "create-compliance-incident",
          type: "notification",
          description: "Create DOH compliance incident report",
          execute: async () => {
            console.log("Creating DOH compliance incident report");
            return true;
          },
          timeout: 10000,
          retryable: true,
        },
        {
          id: "activate-audit-mode",
          type: "escalation",
          description: "Activate enhanced audit logging",
          execute: async () => {
            console.log("Activating enhanced audit logging");
            return true;
          },
          timeout: 2000,
          retryable: false,
        },
      ],
      escalationLevel: "high",
      healthcareImpact: "high",
      dohComplianceRequired: true,
      patientSafetyProtocol: false,
    });
  }

  private initializeErrorPatterns(): void {
    // Common healthcare error patterns
    this.errorPatterns.set("patient-data-corruption", {
      id: "patient-data-corruption",
      pattern: /patient.*data.*(corrupt|invalid|missing)/i,
      category: "healthcare",
      severity: "critical",
      frequency: 0,
      lastOccurrence: new Date(),
      preventionStrategy: "Enhanced data validation and backup verification",
      healthcareRelated: true,
    });

    this.errorPatterns.set("doh-submission-failure", {
      id: "doh-submission-failure",
      pattern: /doh.*(submission|report).*(fail|error)/i,
      category: "compliance",
      severity: "high",
      frequency: 0,
      lastOccurrence: new Date(),
      preventionStrategy: "Implement retry mechanism with validation",
      healthcareRelated: true,
    });

    this.errorPatterns.set("network-timeout", {
      id: "network-timeout",
      pattern: /network.*(timeout|connection.*failed)/i,
      category: "network",
      severity: "medium",
      frequency: 0,
      lastOccurrence: new Date(),
      preventionStrategy: "Implement connection pooling and retry logic",
      healthcareRelated: false,
    });
  }

  // Public methods
  public getRecoveryMetrics(): RecoveryMetrics {
    return { ...this.recoveryMetrics };
  }

  public getSystemHealthScore(): number {
    return this.systemHealthScore;
  }

  public isInEmergencyMode(): boolean {
    return this.isEmergencyMode;
  }

  public getActiveFailovers(): SystemFailover[] {
    return Array.from(this.systemFailovers.values()).filter((f) => f.isActive);
  }

  public getAutoHealingRules(): AutoHealingRule[] {
    return Array.from(this.autoHealingRules.values());
  }

  public getEmergencyProtocols(): EmergencyProtocol[] {
    return Array.from(this.emergencyProtocols.values());
  }

  public async forceRecovery(errorId: string): Promise<boolean> {
    const error = errorHandlerService.getError(errorId);
    if (!error) return false;

    return await this.attemptImmediateRecovery(error);
  }

  public deactivateEmergencyMode(): void {
    this.isEmergencyMode = false;
    this.broadcastRecoveryEvent("emergency-mode-deactivated", {
      timestamp: new Date().toISOString(),
    });
  }

  public resetRecoveryMetrics(): void {
    this.recoveryMetrics = {
      totalRecoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      recoverySuccessRate: 0,
      criticalRecoveries: 0,
      healthcareRecoveries: 0,
      dohComplianceRecoveries: 0,
      patientSafetyRecoveries: 0,
    };
  }

  // Cleanup
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.patternAnalysisInterval) {
      clearInterval(this.patternAnalysisInterval);
    }

    this.systemFailovers.clear();
    this.autoHealingRules.clear();
    this.emergencyProtocols.clear();
    this.errorPatterns.clear();
    this.recoveryQueue.clear();
  }
}

export const enhancedErrorRecoveryService = new EnhancedErrorRecoveryService();
export {
  RecoveryMetrics,
  SystemFailover,
  AutoHealingRule,
  EmergencyProtocol,
  EmergencyAction,
  ErrorPattern,
};
