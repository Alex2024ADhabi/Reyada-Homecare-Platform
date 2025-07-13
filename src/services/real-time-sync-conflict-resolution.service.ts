// Real-Time Sync Conflict Resolution Service
// Implements operational transform algorithms for conflict resolution

import { EventEmitter } from "events";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { productionWebSocketService } from "./production-websocket.service";

interface ConflictResolutionConfig {
  algorithms: {
    operationalTransform: boolean;
    lastWriteWins: boolean;
    vectorClock: boolean;
    threeWayMerge: boolean;
  };
  priorities: {
    patientSafety: number;
    clinicalData: number;
    administrativeData: number;
    systemData: number;
  };
  timeouts: {
    resolutionTimeout: number;
    lockTimeout: number;
    syncTimeout: number;
  };
  healthcare: {
    criticalFields: string[];
    auditRequired: boolean;
    complianceValidation: boolean;
  };
}

interface SyncConflict {
  id: string;
  resourceId: string;
  resourceType: string;
  conflictType:
    | "concurrent-edit"
    | "version-mismatch"
    | "schema-conflict"
    | "permission-conflict";
  clientVersion: {
    data: any;
    timestamp: Date;
    userId: string;
    version: number;
    checksum: string;
  };
  serverVersion: {
    data: any;
    timestamp: Date;
    userId: string;
    version: number;
    checksum: string;
  };
  baseVersion?: {
    data: any;
    timestamp: Date;
    version: number;
    checksum: string;
  };
  priority: "low" | "medium" | "high" | "critical";
  healthcareContext?: {
    patientId?: string;
    clinicalSignificance: "none" | "low" | "medium" | "high" | "critical";
    patientSafetyImpact: boolean;
    regulatoryImplications: boolean;
  };
  status: "pending" | "resolving" | "resolved" | "failed" | "escalated";
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: ConflictResolution;
}

interface ConflictResolution {
  strategy:
    | "client-wins"
    | "server-wins"
    | "merge"
    | "three-way-merge"
    | "operational-transform"
    | "manual";
  resolvedData: any;
  operations: Operation[];
  confidence: number;
  requiresValidation: boolean;
  auditTrail: {
    resolvedBy: string;
    algorithm: string;
    timestamp: Date;
    reasoning: string;
  };
}

interface Operation {
  type: "insert" | "delete" | "update" | "move";
  path: string;
  value?: any;
  oldValue?: any;
  position?: number;
  timestamp: Date;
  userId: string;
}

interface VectorClock {
  [userId: string]: number;
}

interface ConflictMetrics {
  totalConflicts: number;
  resolvedConflicts: number;
  failedResolutions: number;
  averageResolutionTime: number;
  resolutionsByStrategy: Record<string, number>;
  healthcareConflicts: number;
  patientSafetyConflicts: number;
  escalatedConflicts: number;
}

class RealTimeSyncConflictResolutionService extends EventEmitter {
  private config: ConflictResolutionConfig;
  private activeConflicts: Map<string, RefreshCwConflict> = new Map();
  private resourceLocks: Map<
    string,
    { userId: string; timestamp: Date; expires: Date }
  > = new Map();
  private vectorClocks: Map<string, VectorClock> = new Map();
  private metrics: ConflictMetrics;
  private operationHistory: Map<string, Operation[]> = new Map();
  private isInitialized = false;

  constructor() {
    super();

    this.config = {
      algorithms: {
        operationalTransform: true,
        lastWriteWins: true,
        vectorClock: true,
        threeWayMerge: true,
      },
      priorities: {
        patientSafety: 10,
        clinicalData: 8,
        administrativeData: 5,
        systemData: 3,
      },
      timeouts: {
        resolutionTimeout: 30000, // 30 seconds
        lockTimeout: 60000, // 1 minute
        syncTimeout: 10000, // 10 seconds
      },
      healthcare: {
        criticalFields: [
          "patientId",
          "medications",
          "allergies",
          "vitalSigns",
          "diagnosis",
          "treatmentPlan",
          "emergencyContacts",
        ],
        auditRequired: true,
        complianceValidation: true,
      },
    };

    this.metrics = {
      totalConflicts: 0,
      resolvedConflicts: 0,
      failedResolutions: 0,
      averageResolutionTime: 0,
      resolutionsByStrategy: {},
      healthcareConflicts: 0,
      patientSafetyConflicts: 0,
      escalatedConflicts: 0,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log(
        "🔄 Initializing Real-Time Sync Conflict Resolution Service...",
      );

      // Setup WebSocket listeners for real-time sync
      this.setupWebSocketListeners();

      // Start conflict monitoring
      this.startConflictMonitoring();

      // Start metrics collection
      this.startMetricsCollection();

      // Start cleanup processes
      this.startCleanupProcesses();

      this.isInitialized = true;
      console.log("✅ Real-Time Sync Conflict Resolution Service initialized");
      this.emit("service-initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize conflict resolution service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "RealTimeSyncConflictResolutionService.initialize",
      });
      throw error;
    }
  }

  private setupWebSocketListeners(): void {
    productionWebSocketService.on("message-received", (event) => {
      if (event.message.type === "sync-request") {
        this.handleSyncRequest(event.connectionId, event.message.data);
      } else if (event.message.type === "conflict-resolution") {
        this.handleConflictResolutionRequest(
          event.connectionId,
          event.message.data,
        );
      }
    });

    productionWebSocketService.on("connection-established", (event) => {
      // Initialize vector clock for new connection
      this.initializeVectorClock(event.connectionId);
    });
  }

  async detectConflict(
    resourceId: string,
    resourceType: string,
    clientData: any,
    clientVersion: number,
    userId: string,
  ): Promise<RefreshCwConflict | null> {
    try {
      // Simulate server data retrieval
      const serverData = await this.getServerData(resourceId);

      if (!serverData) {
        // No conflict - resource doesn't exist on server
        return null;
      }

      // Check for version conflicts
      if (serverData.version !== clientVersion) {
        const conflict: SyncConflict = {
          id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resourceId,
          resourceType,
          conflictType: "version-mismatch",
          clientVersion: {
            data: clientData,
            timestamp: new Date(),
            userId,
            version: clientVersion,
            checksum: this.calculateChecksum(clientData),
          },
          serverVersion: {
            data: serverData.data,
            timestamp: serverData.lastModified,
            userId: serverData.lastModifiedBy,
            version: serverData.version,
            checksum: this.calculateChecksum(serverData.data),
          },
          priority: this.determinePriority(resourceType, clientData),
          healthcareContext: this.analyzeHealthcareContext(clientData),
          status: "pending",
          createdAt: new Date(),
        };

        this.activeConflicts.set(conflict.id, conflict);
        this.metrics.totalConflicts++;

        if (conflict.healthcareContext?.patientSafetyImpact) {
          this.metrics.patientSafetyConflicts++;
        }

        console.log(
          `⚠️ Conflict detected: ${conflict.id} for resource ${resourceId}`,
        );
        this.emit("conflict-detected", conflict);

        return conflict;
      }

      return null;
    } catch (error) {
      console.error(
        `❌ Error detecting conflict for resource ${resourceId}:`,
        error,
      );
      errorHandlerService.handleError(error, {
        context: "RealTimeSyncConflictResolutionService.detectConflict",
        resourceId,
      });
      return null;
    }
  }

  async resolveConflict(
    conflictId: string,
  ): Promise<ConflictResolution | null> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const startTime = Date.now();
    conflict.status = "resolving";

    try {
      console.log(
        `🔄 Resolving conflict: ${conflictId} using strategy selection`,
      );

      // Select resolution strategy based on conflict characteristics
      const strategy = this.selectResolutionStrategy(conflict);
      let resolution: ConflictResolution;

      switch (strategy) {
        case "operational-transform":
          resolution = await this.applyOperationalTransform(conflict);
          break;
        case "three-way-merge":
          resolution = await this.applyThreeWayMerge(conflict);
          break;
        case "client-wins":
          resolution = this.applyClientWins(conflict);
          break;
        case "server-wins":
          resolution = this.applyServerWins(conflict);
          break;
        case "merge":
          resolution = await this.applySmartMerge(conflict);
          break;
        default:
          resolution = await this.escalateToManualResolution(conflict);
      }

      // Validate resolution for healthcare compliance
      if (this.config.healthcare.complianceValidation) {
        const validationResult = await this.validateHealthcareCompliance(
          resolution,
          conflict,
        );
        if (!validationResult.valid) {
          console.warn(
            `⚠️ Healthcare compliance validation failed for conflict ${conflictId}`,
          );
          resolution = await this.escalateToManualResolution(conflict);
        }
      }

      // Apply resolution
      conflict.resolution = resolution;
      conflict.status = "resolved";
      conflict.resolvedAt = new Date();

      const resolutionTime = Date.now() - startTime;
      this.updateMetrics(strategy, resolutionTime);

      console.log(
        `✅ Conflict resolved: ${conflictId} using ${strategy} in ${resolutionTime}ms`,
      );
      this.emit("conflict-resolved", { conflict, resolution });

      // Broadcast resolution to all connected clients
      this.broadcastResolution(conflict);

      return resolution;
    } catch (error) {
      console.error(`❌ Failed to resolve conflict ${conflictId}:`, error);
      conflict.status = "failed";
      this.metrics.failedResolutions++;

      errorHandlerService.handleError(error, {
        context: "RealTimeSyncConflictResolutionService.resolveConflict",
        conflictId,
      });

      return null;
    }
  }

  private selectResolutionStrategy(conflict: SyncConflict): string {
    // Healthcare-specific strategy selection
    if (conflict.healthcareContext?.patientSafetyImpact) {
      return "manual"; // Always escalate patient safety conflicts
    }

    if (conflict.healthcareContext?.clinicalSignificance === "critical") {
      return "three-way-merge"; // Use sophisticated merge for critical clinical data
    }

    // Check if operational transform is applicable
    if (this.canApplyOperationalTransform(conflict)) {
      return "operational-transform";
    }

    // Check conflict complexity
    const complexity = this.analyzeConflictComplexity(conflict);
    if (complexity > 0.8) {
      return "manual";
    }

    // Default to smart merge
    return "merge";
  }

  private async applyOperationalTransform(
    conflict: SyncConflict,
  ): Promise<ConflictResolution> {
    console.log(
      `🔄 Applying operational transform for conflict ${conflict.id}`,
    );

    // Get operation history for the resource
    const operations = this.operationHistory.get(conflict.resourceId) || [];

    // Transform operations based on concurrent changes
    const transformedOperations = this.transformOperations(
      operations,
      conflict.clientVersion.data,
      conflict.serverVersion.data,
    );

    // Apply transformed operations
    const resolvedData = this.applyOperations(
      conflict.serverVersion.data,
      transformedOperations,
    );

    return {
      strategy: "operational-transform",
      resolvedData,
      operations: transformedOperations,
      confidence: 0.9,
      requiresValidation: true,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "operational-transform",
        timestamp: new Date(),
        reasoning: "Applied operational transform to merge concurrent changes",
      },
    };
  }

  private async applyThreeWayMerge(
    conflict: SyncConflict,
  ): Promise<ConflictResolution> {
    console.log(`🔄 Applying three-way merge for conflict ${conflict.id}`);

    // Get base version (common ancestor)
    const baseVersion =
      conflict.baseVersion || (await this.getBaseVersion(conflict.resourceId));

    if (!baseVersion) {
      // Fallback to smart merge if no base version available
      return this.applySmartMerge(conflict);
    }

    // Perform three-way merge
    const resolvedData = this.performThreeWayMerge(
      baseVersion.data,
      conflict.clientVersion.data,
      conflict.serverVersion.data,
    );

    return {
      strategy: "three-way-merge",
      resolvedData,
      operations: [],
      confidence: 0.85,
      requiresValidation: true,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "three-way-merge",
        timestamp: new Date(),
        reasoning: "Applied three-way merge using common ancestor",
      },
    };
  }

  private applyClientWins(conflict: SyncConflict): ConflictResolution {
    return {
      strategy: "client-wins",
      resolvedData: conflict.clientVersion.data,
      operations: [],
      confidence: 0.7,
      requiresValidation: false,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "client-wins",
        timestamp: new Date(),
        reasoning: "Client version selected as resolution",
      },
    };
  }

  private applyServerWins(conflict: SyncConflict): ConflictResolution {
    return {
      strategy: "server-wins",
      resolvedData: conflict.serverVersion.data,
      operations: [],
      confidence: 0.7,
      requiresValidation: false,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "server-wins",
        timestamp: new Date(),
        reasoning: "Server version selected as resolution",
      },
    };
  }

  private async applySmartMerge(
    conflict: SyncConflict,
  ): Promise<ConflictResolution> {
    console.log(`🔄 Applying smart merge for conflict ${conflict.id}`);

    const clientData = conflict.clientVersion.data;
    const serverData = conflict.serverVersion.data;
    const resolvedData = { ...serverData };

    // Merge non-conflicting fields
    for (const [key, value] of Object.entries(clientData)) {
      if (!serverData.hasOwnProperty(key)) {
        // New field from client
        resolvedData[key] = value;
      } else if (JSON.stringify(serverData[key]) !== JSON.stringify(value)) {
        // Conflicting field - apply field-specific resolution
        resolvedData[key] = this.resolveFieldConflict(
          key,
          value,
          serverData[key],
          conflict,
        );
      }
    }

    return {
      strategy: "merge",
      resolvedData,
      operations: [],
      confidence: 0.8,
      requiresValidation: true,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "smart-merge",
        timestamp: new Date(),
        reasoning:
          "Applied smart merge with field-specific conflict resolution",
      },
    };
  }

  private async escalateToManualResolution(
    conflict: SyncConflict,
  ): Promise<ConflictResolution> {
    console.log(`⬆️ Escalating conflict ${conflict.id} to manual resolution`);

    conflict.status = "escalated";
    this.metrics.escalatedConflicts++;

    this.emit("conflict-escalated", conflict);

    return {
      strategy: "manual",
      resolvedData: conflict.serverVersion.data, // Temporary - keep server version
      operations: [],
      confidence: 0.0,
      requiresValidation: true,
      auditTrail: {
        resolvedBy: "system",
        algorithm: "escalation",
        timestamp: new Date(),
        reasoning:
          "Conflict escalated to manual resolution due to complexity or safety concerns",
      },
    };
  }

  private resolveFieldConflict(
    fieldName: string,
    clientValue: any,
    serverValue: any,
    conflict: SyncConflict,
  ): any {
    // Healthcare-specific field resolution
    if (this.config.healthcare.criticalFields.includes(fieldName)) {
      // For critical healthcare fields, prefer the most recent timestamp
      if (conflict.clientVersion.timestamp > conflict.serverVersion.timestamp) {
        return clientValue;
      } else {
        return serverValue;
      }
    }

    // For timestamps, prefer the most recent
    if (
      fieldName.includes("timestamp") ||
      fieldName.includes("date") ||
      fieldName.includes("time")
    ) {
      const clientTime = new Date(clientValue).getTime();
      const serverTime = new Date(serverValue).getTime();
      return clientTime > serverTime ? clientValue : serverValue;
    }

    // For arrays, merge unique values
    if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
      return [...new Set([...serverValue, ...clientValue])];
    }

    // For objects, merge recursively
    if (typeof clientValue === "object" && typeof serverValue === "object") {
      return { ...serverValue, ...clientValue };
    }

    // Default: prefer server value
    return serverValue;
  }

  private canApplyOperationalTransform(conflict: SyncConflict): boolean {
    // Check if we have operation history for this resource
    const operations = this.operationHistory.get(conflict.resourceId);
    return operations && operations.length > 0;
  }

  private analyzeConflictComplexity(conflict: SyncConflict): number {
    let complexity = 0;

    // Count number of conflicting fields
    const clientKeys = Object.keys(conflict.clientVersion.data);
    const serverKeys = Object.keys(conflict.serverVersion.data);
    const conflictingFields = clientKeys.filter(
      (key) =>
        serverKeys.includes(key) &&
        JSON.stringify(conflict.clientVersion.data[key]) !==
          JSON.stringify(conflict.serverVersion.data[key]),
    );

    complexity += conflictingFields.length * 0.1;

    // Healthcare context increases complexity
    if (conflict.healthcareContext?.patientSafetyImpact) {
      complexity += 0.5;
    }

    if (conflict.healthcareContext?.regulatoryImplications) {
      complexity += 0.3;
    }

    return Math.min(complexity, 1.0);
  }

  private transformOperations(
    operations: Operation[],
    clientData: any,
    serverData: any,
  ): Operation[] {
    // Simplified operational transform - in production, use a proper OT library
    return operations.map((op) => ({
      ...op,
      timestamp: new Date(),
    }));
  }

  private applyOperations(baseData: any, operations: Operation[]): any {
    let result = JSON.parse(JSON.stringify(baseData));

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case "update":
            this.setNestedValue(result, operation.path, operation.value);
            break;
          case "insert":
            this.insertValue(
              result,
              operation.path,
              operation.value,
              operation.position,
            );
            break;
          case "delete":
            this.deleteValue(result, operation.path);
            break;
        }
      } catch (error) {
        console.error(`❌ Failed to apply operation:`, operation, error);
      }
    }

    return result;
  }

  private performThreeWayMerge(base: any, client: any, server: any): any {
    // Simplified three-way merge implementation
    const result = JSON.parse(JSON.stringify(server));

    // Find changes from base to client that don't conflict with server changes
    for (const [key, clientValue] of Object.entries(client)) {
      const baseValue = base[key];
      const serverValue = server[key];

      // If client changed from base and server didn't change from base
      if (
        JSON.stringify(clientValue) !== JSON.stringify(baseValue) &&
        JSON.stringify(serverValue) === JSON.stringify(baseValue)
      ) {
        result[key] = clientValue;
      }
    }

    return result;
  }

  private async validateHealthcareCompliance(
    resolution: ConflictResolution,
    conflict: SyncConflict,
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Validate critical healthcare fields are present
    for (const field of this.config.healthcare.criticalFields) {
      if (
        conflict.healthcareContext &&
        !resolution.resolvedData.hasOwnProperty(field)
      ) {
        issues.push(`Missing critical healthcare field: ${field}`);
      }
    }

    // Validate patient safety implications
    if (
      conflict.healthcareContext?.patientSafetyImpact &&
      resolution.confidence < 0.9
    ) {
      issues.push("Low confidence resolution for patient safety critical data");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  private broadcastResolution(conflict: SyncConflict): void {
    const message = {
      id: `resolution_${Date.now()}`,
      type: "conflict-resolved",
      data: {
        conflictId: conflict.id,
        resourceId: conflict.resourceId,
        resolution: conflict.resolution,
      },
      timestamp: new Date().toISOString(),
      priority: "high" as const,
    };

    productionWebSocketService.broadcast(message);
  }

  private handleSyncRequest(connectionId: string, data: any): void {
    // Handle real-time sync requests
    console.log(`🔄 Handling sync request from ${connectionId}`);
    this.emit("sync-request", { connectionId, data });
  }

  private handleConflictResolutionRequest(
    connectionId: string,
    data: any,
  ): void {
    // Handle manual conflict resolution requests
    console.log(`🔄 Handling conflict resolution request from ${connectionId}`);
    if (data.conflictId && data.resolution) {
      this.resolveConflictManually(
        data.conflictId,
        data.resolution,
        connectionId,
      );
    }
  }

  private async resolveConflictManually(
    conflictId: string,
    resolution: any,
    userId: string,
  ): Promise<void> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      console.error(
        `❌ Conflict not found for manual resolution: ${conflictId}`,
      );
      return;
    }

    conflict.resolution = {
      strategy: "manual",
      resolvedData: resolution.data,
      operations: [],
      confidence: 1.0,
      requiresValidation: false,
      auditTrail: {
        resolvedBy: userId,
        algorithm: "manual",
        timestamp: new Date(),
        reasoning: resolution.reasoning || "Manual resolution by user",
      },
    };

    conflict.status = "resolved";
    conflict.resolvedAt = new Date();

    this.metrics.resolvedConflicts++;
    this.metrics.resolutionsByStrategy["manual"] =
      (this.metrics.resolutionsByStrategy["manual"] || 0) + 1;

    console.log(`✅ Conflict resolved manually: ${conflictId} by ${userId}`);
    this.emit("conflict-resolved-manually", { conflict, userId });

    this.broadcastResolution(conflict);
  }

  private initializeVectorClock(userId: string): void {
    if (!this.vectorClocks.has(userId)) {
      this.vectorClocks.set(userId, { [userId]: 0 });
    }
  }

  private updateVectorClock(userId: string, operation: Operation): void {
    const clock = this.vectorClocks.get(userId) || { [userId]: 0 };
    clock[userId] = (clock[userId] || 0) + 1;
    this.vectorClocks.set(userId, clock);
  }

  private async getServerData(resourceId: string): Promise<any> {
    // Simulate server data retrieval
    return {
      data: {
        id: resourceId,
        lastModified: new Date(),
        content: "server data",
      },
      version: Math.floor(Math.random() * 10) + 1,
      lastModified: new Date(),
      lastModifiedBy: "server",
    };
  }

  private async getBaseVersion(resourceId: string): Promise<any> {
    // Simulate base version retrieval
    return {
      data: { id: resourceId, content: "base data" },
      version: 1,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    };
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private determinePriority(
    resourceType: string,
    data: any,
  ): SyncConflict["priority"] {
    if (resourceType.includes("patient") || resourceType.includes("clinical")) {
      return "critical";
    }
    if (
      resourceType.includes("medication") ||
      resourceType.includes("allergy")
    ) {
      return "high";
    }
    if (resourceType.includes("administrative")) {
      return "medium";
    }
    return "low";
  }

  private analyzeHealthcareContext(
    data: any,
  ): SyncConflict["healthcareContext"] {
    const hasPatientData = data.patientId || data.patient;
    const hasClinicalData =
      data.medications || data.diagnosis || data.vitalSigns;
    const hasEmergencyData = data.emergency || data.urgent;

    return {
      patientId: data.patientId,
      clinicalSignificance: hasEmergencyData
        ? "critical"
        : hasClinicalData
          ? "high"
          : hasPatientData
            ? "medium"
            : "none",
      patientSafetyImpact:
        hasEmergencyData || (hasClinicalData && data.critical),
      regulatoryImplications: hasPatientData || hasClinicalData,
    };
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  private insertValue(
    obj: any,
    path: string,
    value: any,
    position?: number,
  ): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    const targetArray = current[keys[keys.length - 1]];
    if (Array.isArray(targetArray)) {
      const pos = position !== undefined ? position : targetArray.length;
      targetArray.splice(pos, 0, value);
    }
  }

  private deleteValue(obj: any, path: string): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    delete current[keys[keys.length - 1]];
  }

  private startConflictMonitoring(): void {
    setInterval(() => {
      this.monitorActiveConflicts();
    }, 30000); // Every 30 seconds
  }

  private monitorActiveConflicts(): void {
    const now = Date.now();

    for (const [conflictId, conflict] of this.activeConflicts.entries()) {
      const age = now - conflict.createdAt.getTime();

      // Auto-resolve old conflicts
      if (
        age > this.config.timeouts.resolutionTimeout &&
        conflict.status === "pending"
      ) {
        console.log(`⏰ Auto-resolving expired conflict: ${conflictId}`);
        this.resolveConflict(conflictId);
      }

      // Clean up resolved conflicts
      if (conflict.status === "resolved" && age > 300000) {
        // 5 minutes
        this.activeConflicts.delete(conflictId);
      }
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.reportMetrics();
    }, 60000); // Every minute
  }

  private startCleanupProcesses(): void {
    setInterval(() => {
      this.cleanupResourceLocks();
      this.cleanupOperationHistory();
    }, 300000); // Every 5 minutes
  }

  private cleanupResourceLocks(): void {
    const now = Date.now();

    for (const [resourceId, lock] of this.resourceLocks.entries()) {
      if (now > lock.expires.getTime()) {
        this.resourceLocks.delete(resourceId);
        console.log(`🧹 Cleaned up expired lock for resource: ${resourceId}`);
      }
    }
  }

  private cleanupOperationHistory(): void {
    // Keep only last 1000 operations per resource
    for (const [resourceId, operations] of this.operationHistory.entries()) {
      if (operations.length > 1000) {
        this.operationHistory.set(resourceId, operations.slice(-1000));
      }
    }
  }

  private updateMetrics(strategy: string, resolutionTime: number): void {
    this.metrics.resolvedConflicts++;
    this.metrics.resolutionsByStrategy[strategy] =
      (this.metrics.resolutionsByStrategy[strategy] || 0) + 1;
    this.metrics.averageResolutionTime =
      (this.metrics.averageResolutionTime + resolutionTime) / 2;
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "conflict-resolution",
      name: "Total_Conflicts",
      value: this.metrics.totalConflicts,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "conflict-resolution",
      name: "Resolved_Conflicts",
      value: this.metrics.resolvedConflicts,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "conflict-resolution",
      name: "Average_Resolution_Time",
      value: this.metrics.averageResolutionTime,
      unit: "ms",
    });

    performanceMonitoringService.recordMetric({
      type: "conflict-resolution",
      name: "Patient_Safety_Conflicts",
      value: this.metrics.patientSafetyConflicts,
      unit: "count",
    });
  }

  // Public API methods
  getMetrics(): ConflictMetrics {
    return { ...this.metrics };
  }

  getActiveConflicts(): SyncConflict[] {
    return Array.from(this.activeConflicts.values());
  }

  async lockResource(
    resourceId: string,
    userId: string,
    duration: number = 60000,
  ): Promise<boolean> {
    const existingLock = this.resourceLocks.get(resourceId);

    if (existingLock && existingLock.expires.getTime() > Date.now()) {
      return false; // Resource is locked
    }

    this.resourceLocks.set(resourceId, {
      userId,
      timestamp: new Date(),
      expires: new Date(Date.now() + duration),
    });

    console.log(`🔒 Resource locked: ${resourceId} by ${userId}`);
    return true;
  }

  unlockResource(resourceId: string, userId: string): boolean {
    const lock = this.resourceLocks.get(resourceId);

    if (!lock || lock.userId !== userId) {
      return false;
    }

    this.resourceLocks.delete(resourceId);
    console.log(`🔓 Resource unlocked: ${resourceId} by ${userId}`);
    return true;
  }

  recordOperation(resourceId: string, operation: Operation): void {
    const operations = this.operationHistory.get(resourceId) || [];
    operations.push(operation);
    this.operationHistory.set(resourceId, operations);

    this.updateVectorClock(operation.userId, operation);
  }

  async shutdown(): Promise<void> {
    console.log("🛑 Shutting down conflict resolution service...");

    // Resolve any pending critical conflicts
    const criticalConflicts = Array.from(this.activeConflicts.values()).filter(
      (c) => c.priority === "critical" && c.status === "pending",
    );

    for (const conflict of criticalConflicts) {
      await this.resolveConflict(conflict.id);
    }

    console.log("✅ Conflict resolution service shutdown complete");
    this.emit("service-shutdown");
  }
}

export const realTimeSyncConflictResolutionService =
  new RealTimeSyncConflictResolutionService();
export default realTimeSyncConflictResolutionService;
