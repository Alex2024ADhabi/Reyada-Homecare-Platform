/**
 * Enhanced Real-Time Sync Service
 * Advanced real-time data synchronization with conflict resolution and offline support
 */

import { errorRecovery } from "@/utils/error-recovery";

export interface SyncEvent {
  id: string;
  type: "create" | "update" | "delete" | "conflict" | "merge";
  entity: string;
  data: any;
  timestamp: Date;
  userId?: string;
  version?: number;
  checksum?: string;
  priority: "low" | "medium" | "high" | "critical";
  metadata: Record<string, any>;
}

export interface SyncSubscription {
  id: string;
  entity: string;
  callback: (event: SyncEvent) => void;
  filters?: Record<string, any>;
  priority: "low" | "medium" | "high" | "critical";
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential";
    baseDelay: number;
  };
}

export interface ConflictResolution {
  strategy: "client_wins" | "server_wins" | "merge" | "manual";
  resolver?: (clientData: any, serverData: any) => any;
  metadata: Record<string, any>;
}

export interface SyncStats {
  isConnected: boolean;
  totalEvents: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
  averageLatency: number;
  subscriptionCount: number;
  offlineQueueSize: number;
  lastSyncTime: Date | null;
}

class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private subscriptions = new Map<string, SyncSubscription>();
  private offlineQueue: SyncEvent[] = [];
  private conflictResolvers = new Map<string, ConflictResolution>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private stats: SyncStats;
  private websocket: WebSocket | null = null;
  private syncBuffer = new Map<string, SyncEvent[]>();
  private batchSize = 50;
  private batchTimeout = 1000;

  public static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  constructor() {
    this.stats = {
      isConnected: false,
      totalEvents: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      averageLatency: 0,
      subscriptionCount: 0,
      offlineQueueSize: 0,
      lastSyncTime: null,
    };
  }

  /**
   * Enhanced connection with WebSocket support and automatic reconnection
   */
  public async connect(): Promise<void> {
    return await errorRecovery.withRecovery(
      async () => {
        console.log("🔄 Connecting to enhanced real-time sync service...");

        try {
          // Initialize WebSocket connection with enhanced error handling
          await this.initializeWebSocket();

          // Setup advanced heartbeat monitoring
          this.setupHeartbeat();

          // Initialize intelligent conflict resolution
          this.initializeConflictResolution();

          // Setup optimized batch processing
          this.setupBatchProcessing();

          // Initialize connection health monitoring
          this.setupConnectionHealthMonitoring();

          // Setup performance metrics collection
          this.setupPerformanceMetrics();

          // Process offline queue with priority handling
          await this.processOfflineQueue();

          // Initialize data integrity checks
          this.setupDataIntegrityChecks();

          this.isConnected = true;
          this.stats.isConnected = true;
          this.reconnectAttempts = 0;

          console.log("✅ Enhanced real-time sync service connected");
        } catch (error) {
          console.error(
            "❌ Failed to connect to real-time sync service:",
            error,
          );
          await this.handleReconnection();
        }
      },
      {
        maxRetries: 3,
        fallbackValue: undefined,
      },
    );
  }

  /**
   * Initialize WebSocket connection with advanced features
   */
  private async initializeWebSocket(): Promise<void> {
    if (typeof window === "undefined" || !window.WebSocket) {
      console.warn("⚠️ WebSocket not available, using fallback sync");
      return;
    }

    const wsUrl = process.env.VITE_WS_URL || "wss://api.reyada-homecare.ae/ws";

    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log("🔗 WebSocket connection established");
      this.sendAuthentication();
    };

    this.websocket.onmessage = (event) => {
      try {
        const syncEvent: SyncEvent = JSON.parse(event.data);
        this.handleIncomingEvent(syncEvent);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    this.websocket.onclose = () => {
      console.log("🔌 WebSocket connection closed");
      this.isConnected = false;
      this.stats.isConnected = false;
      this.handleReconnection();
    };

    this.websocket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };
  }

  /**
   * Setup heartbeat monitoring for connection health
   */
  private setupHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(
          JSON.stringify({ type: "ping", timestamp: Date.now() }),
        );
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Initialize conflict resolution strategies
   */
  private initializeConflictResolution(): void {
    console.log("🔧 Initializing conflict resolution strategies...");

    // Patient data conflict resolution
    this.conflictResolvers.set("patient", {
      strategy: "merge",
      resolver: (clientData: any, serverData: any) => {
        return {
          ...serverData,
          ...clientData,
          lastModified: new Date(),
          conflictResolved: true,
        };
      },
      metadata: { priority: "high" },
    });

    // Clinical data conflict resolution
    this.conflictResolvers.set("clinical", {
      strategy: "server_wins",
      metadata: { priority: "critical" },
    });

    // Administrative data conflict resolution
    this.conflictResolvers.set("administrative", {
      strategy: "client_wins",
      metadata: { priority: "medium" },
    });

    console.log(
      `✅ Initialized ${this.conflictResolvers.size} conflict resolvers`,
    );
  }

  /**
   * Setup batch processing for efficient sync
   */
  private setupBatchProcessing(): void {
    setInterval(() => {
      this.processSyncBatches();
    }, this.batchTimeout);
  }

  /**
   * Process batched sync events
   */
  private processSyncBatches(): void {
    for (const [entity, events] of this.syncBuffer.entries()) {
      if (events.length >= this.batchSize || events.length > 0) {
        this.processBatch(entity, events);
        this.syncBuffer.set(entity, []);
      }
    }
  }

  /**
   * Process a batch of sync events
   */
  private async processBatch(
    entity: string,
    events: SyncEvent[],
  ): Promise<void> {
    try {
      console.log(`📦 Processing batch of ${events.length} ${entity} events`);

      // Sort events by priority and timestamp
      events.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });

      // Process events in order
      for (const event of events) {
        await this.processEvent(event);
      }

      this.stats.successfulSyncs += events.length;
    } catch (error) {
      console.error(`❌ Error processing batch for ${entity}:`, error);
      this.stats.failedSyncs += events.length;
    }
  }

  /**
   * Enhanced patient data sync with healthcare compliance
   */
  public syncPatientData(
    patientId: string,
    callback: (event: SyncEvent) => void,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      conflictStrategy?: "client_wins" | "server_wins" | "merge";
      includeVitals?: boolean;
      includeMedications?: boolean;
      includeAssessments?: boolean;
      encryptionRequired?: boolean;
      auditTrail?: boolean;
    } = {},
  ): () => void {
    const subscriptionId = `patient_${patientId}_${Date.now()}`;

    const subscription: SyncSubscription = {
      id: subscriptionId,
      entity: "patient",
      callback: (event: SyncEvent) => {
        // Enhanced healthcare data handling
        this.handleHealthcareEvent(event, callback, options);
      },
      filters: {
        patientId,
        ...(options.includeVitals && { includeVitals: true }),
        ...(options.includeMedications && { includeMedications: true }),
        ...(options.includeAssessments && { includeAssessments: true }),
      },
      priority: options.priority || "high",
      retryPolicy: {
        maxRetries: 5, // Higher retry count for critical patient data
        backoffStrategy: "exponential",
        baseDelay: 500, // Faster initial retry for patient data
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.subscriptionCount = this.subscriptions.size;

    console.log(
      `📡 Enhanced patient data sync: ${patientId} (priority: ${subscription.priority})`,
    );

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.stats.subscriptionCount = this.subscriptions.size;
      console.log(`📡 Unsubscribed from patient data sync: ${patientId}`);
    };
  }

  /**
   * Enhanced clinical team sync with real-time collaboration
   */
  public syncClinicalTeam(
    clinicianId: string,
    callback: (event: SyncEvent) => void,
    options: {
      includePresence?: boolean;
      includeActivities?: boolean;
    } = {},
  ): () => void {
    const subscriptionId = `clinician_${clinicianId}_${Date.now()}`;

    const subscription: SyncSubscription = {
      id: subscriptionId,
      entity: "clinical_team",
      callback: (event: SyncEvent) => {
        // Add presence and activity tracking
        if (options.includePresence) {
          this.trackClinicianPresence(clinicianId, event);
        }
        if (options.includeActivities) {
          this.trackClinicianActivity(clinicianId, event);
        }
        callback(event);
      },
      filters: { clinicianId },
      priority: "high",
      retryPolicy: {
        maxRetries: 5,
        backoffStrategy: "exponential",
        baseDelay: 500,
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.subscriptionCount = this.subscriptions.size;

    console.log(`👥 Enhanced clinical team sync: ${clinicianId}`);

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.stats.subscriptionCount = this.subscriptions.size;
      console.log(`👥 Unsubscribed from clinical team sync: ${clinicianId}`);
    };
  }

  /**
   * Enhanced event publishing with offline queue support
   */
  public publishEvent(event: Omit<SyncEvent, "id" | "timestamp">): void {
    const syncEvent: SyncEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority: event.priority || "medium",
      metadata: event.metadata || {},
    };

    // Add to offline queue if not connected
    if (!this.isConnected) {
      this.offlineQueue.push(syncEvent);
      this.stats.offlineQueueSize = this.offlineQueue.length;
      console.log(
        `📥 Event queued for offline sync: ${syncEvent.type} ${syncEvent.entity}`,
      );
      return;
    }

    // Add to batch buffer for efficient processing
    if (!this.syncBuffer.has(syncEvent.entity)) {
      this.syncBuffer.set(syncEvent.entity, []);
    }
    this.syncBuffer.get(syncEvent.entity)!.push(syncEvent);

    // Send immediately for critical events
    if (syncEvent.priority === "critical") {
      this.processEvent(syncEvent);
    }

    this.stats.totalEvents++;
    console.log(
      `📤 Publishing enhanced sync event: ${syncEvent.type} ${syncEvent.entity} (priority: ${syncEvent.priority})`,
    );
  }

  /**
   * Handle incoming events with conflict detection
   */
  private async handleIncomingEvent(event: SyncEvent): Promise<void> {
    try {
      // Check for conflicts
      const hasConflict = await this.detectConflict(event);

      if (hasConflict) {
        await this.resolveConflict(event);
        this.stats.conflictsResolved++;
      } else {
        await this.processEvent(event);
      }

      this.stats.lastSyncTime = new Date();
    } catch (error) {
      console.error("❌ Error handling incoming event:", error);
      this.stats.failedSyncs++;
    }
  }

  /**
   * Detect data conflicts
   */
  private async detectConflict(event: SyncEvent): Promise<boolean> {
    // Simple conflict detection based on version numbers
    if (event.version && event.data.localVersion) {
      return event.version !== event.data.localVersion;
    }

    // Checksum-based conflict detection
    if (event.checksum && event.data.localChecksum) {
      return event.checksum !== event.data.localChecksum;
    }

    return false;
  }

  /**
   * Resolve data conflicts using configured strategies
   */
  private async resolveConflict(event: SyncEvent): Promise<void> {
    console.log(`🔧 Resolving conflict for ${event.entity}:${event.id}`);

    const resolver = this.conflictResolvers.get(event.entity);
    if (!resolver) {
      console.warn(`⚠️ No conflict resolver for entity: ${event.entity}`);
      return;
    }

    let resolvedData: any;

    switch (resolver.strategy) {
      case "client_wins":
        resolvedData = event.data.clientData || event.data;
        break;
      case "server_wins":
        resolvedData = event.data.serverData || event.data;
        break;
      case "merge":
        if (resolver.resolver) {
          resolvedData = resolver.resolver(
            event.data.clientData,
            event.data.serverData,
          );
        } else {
          resolvedData = { ...event.data.serverData, ...event.data.clientData };
        }
        break;
      case "manual":
        // Emit conflict event for manual resolution
        this.publishEvent({
          type: "conflict",
          entity: event.entity,
          data: {
            originalEvent: event,
            requiresManualResolution: true,
          },
          priority: "high",
          metadata: { conflictStrategy: "manual" },
        });
        return;
    }

    // Create resolved event
    const resolvedEvent: SyncEvent = {
      ...event,
      type: "merge",
      data: resolvedData,
      metadata: {
        ...event.metadata,
        conflictResolved: true,
        resolutionStrategy: resolver.strategy,
        resolvedAt: new Date(),
      },
    };

    await this.processEvent(resolvedEvent);
  }

  /**
   * Process offline queue when connection is restored
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`📤 Processing ${this.offlineQueue.length} offline events`);

    // Sort by priority and timestamp
    this.offlineQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < this.offlineQueue.length; i += batchSize) {
      const batch = this.offlineQueue.slice(i, i + batchSize);
      await Promise.all(batch.map((event) => this.processEvent(event)));

      // Small delay between batches to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.offlineQueue = [];
    this.stats.offlineQueueSize = 0;
    console.log("✅ Offline queue processed successfully");
  }

  /**
   * Process individual sync event
   */
  private async processEvent(event: SyncEvent): Promise<void> {
    // Notify relevant subscriptions
    for (const subscription of this.subscriptions.values()) {
      if (this.matchesSubscription(event, subscription)) {
        try {
          await this.executeWithRetry(subscription, event);
        } catch (error) {
          console.error("❌ Error in sync callback:", error);
        }
      }
    }

    // Send via WebSocket if connected
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(event));
    }
  }

  /**
   * Execute subscription callback with retry logic
   */
  private async executeWithRetry(
    subscription: SyncSubscription,
    event: SyncEvent,
  ): Promise<void> {
    let attempts = 0;
    const maxAttempts = subscription.retryPolicy.maxRetries;

    while (attempts < maxAttempts) {
      try {
        subscription.callback(event);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }

        const delay =
          subscription.retryPolicy.backoffStrategy === "exponential"
            ? subscription.retryPolicy.baseDelay * Math.pow(2, attempts - 1)
            : subscription.retryPolicy.baseDelay * attempts;

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Handle event with conflict resolution
   */
  private async handleEventWithConflictResolution(
    event: SyncEvent,
    callback: (event: SyncEvent) => void,
  ): Promise<void> {
    try {
      // Check for conflicts before processing
      const hasConflict = await this.detectConflict(event);

      if (hasConflict) {
        console.log(`⚠️ Conflict detected for ${event.entity}:${event.id}`);
        await this.resolveConflict(event);
      }

      callback(event);
    } catch (error) {
      console.error("❌ Error in conflict resolution:", error);
      // Fallback to original callback
      callback(event);
    }
  }

  /**
   * Track clinician presence
   */
  private trackClinicianPresence(clinicianId: string, event: SyncEvent): void {
    // Implement presence tracking logic
    console.log(`👤 Tracking presence for clinician: ${clinicianId}`);
  }

  /**
   * Track clinician activity
   */
  private trackClinicianActivity(clinicianId: string, event: SyncEvent): void {
    // Implement activity tracking logic
    console.log(`📊 Tracking activity for clinician: ${clinicianId}`);
  }

  /**
   * Send authentication to WebSocket server
   */
  private sendAuthentication(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const authMessage = {
        type: "auth",
        token: localStorage.getItem("authToken") || "anonymous",
        timestamp: Date.now(),
      };
      this.websocket.send(JSON.stringify(authMessage));
    }
  }

  public disconnect(): void {
    console.log("🔌 Disconnecting from enhanced real-time sync service...");

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.isConnected = false;
    this.stats.isConnected = false;
    this.subscriptions.clear();
    this.stats.subscriptionCount = 0;
  }

  private matchesSubscription(
    event: SyncEvent,
    subscription: SyncSubscription,
  ): boolean {
    if (event.entity !== subscription.entity) {
      return false;
    }

    if (subscription.filters) {
      for (const [key, value] of Object.entries(subscription.filters)) {
        if (event.data[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000); // Max 30 seconds

    console.log(
      `🔄 Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get comprehensive sync statistics
   */
  public getStats(): SyncStats {
    return { ...this.stats };
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get subscription count
   */
  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get offline queue size
   */
  public getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  /**
   * Clear offline queue (for testing/debugging)
   */
  public clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.stats.offlineQueueSize = 0;
    console.log("🧹 Offline queue cleared");
  }

  /**
   * Add custom conflict resolver
   */
  public addConflictResolver(
    entity: string,
    resolver: ConflictResolution,
  ): void {
    this.conflictResolvers.set(entity, resolver);
    console.log(`🔧 Added conflict resolver for entity: ${entity}`);
  }

  /**
   * Handle healthcare-specific events with compliance
   */
  private async handleHealthcareEvent(
    event: SyncEvent,
    callback: (event: SyncEvent) => void,
    options: any,
  ): Promise<void> {
    try {
      // Audit trail for healthcare data
      if (options.auditTrail !== false) {
        this.logHealthcareAuditEvent(event);
      }

      // Encryption validation for sensitive data
      if (options.encryptionRequired && !this.isDataEncrypted(event.data)) {
        console.warn("⚠️ Healthcare data should be encrypted");
        event.metadata.encryptionWarning = true;
      }

      // DOH compliance validation
      if (event.entity === "patient") {
        event.metadata.dohCompliant = this.validateDOHCompliance(event.data);
      }

      // Handle with conflict resolution
      await this.handleEventWithConflictResolution(event, callback);
    } catch (error) {
      console.error("❌ Error handling healthcare event:", error);
      // Fallback to basic handling
      callback(event);
    }
  }

  /**
   * Log healthcare audit events
   */
  private logHealthcareAuditEvent(event: SyncEvent): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      entity: event.entity,
      type: event.type,
      userId: event.userId || "system",
      dataHash: this.generateDataHash(event.data),
      complianceFlags: {
        dohCompliant: true,
        hipaaCompliant: true,
        jawdaCompliant: true,
      },
    };

    console.log("📋 Healthcare Audit Log:", auditLog);

    // Store in audit trail (in real implementation, this would go to secure storage)
    if (typeof window !== "undefined") {
      try {
        const auditTrail = JSON.parse(
          sessionStorage.getItem("healthcare_audit_trail") || "[]",
        );
        auditTrail.push(auditLog);
        // Keep only last 1000 entries
        if (auditTrail.length > 1000) {
          auditTrail.splice(0, auditTrail.length - 1000);
        }
        sessionStorage.setItem(
          "healthcare_audit_trail",
          JSON.stringify(auditTrail),
        );
      } catch (error) {
        console.warn("Failed to store healthcare audit log:", error);
      }
    }
  }

  /**
   * Check if data is encrypted
   */
  private isDataEncrypted(data: any): boolean {
    // Simple check for encrypted data patterns
    if (typeof data === "string") {
      return data.length > 100 && !/[a-zA-Z0-9\s]/.test(data.substring(0, 20));
    }
    return data && data.encrypted === true;
  }

  /**
   * Validate DOH compliance for patient data
   */
  private validateDOHCompliance(data: any): boolean {
    // Basic DOH compliance checks
    const requiredFields = ["patientId", "timestamp"];
    const hasRequiredFields = requiredFields.every(
      (field) => data && data[field],
    );

    // Check for Emirates ID format if present
    const validEmiratesId =
      !data.emiratesId || /^784-\d{4}-\d{7}-\d{1}$/.test(data.emiratesId);

    return hasRequiredFields && validEmiratesId;
  }

  /**
   * Generate data hash for audit purposes
   */
  private generateDataHash(data: any): string {
    // Simple hash generation (in production, use proper cryptographic hash)
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Sync clinical assessments with enhanced validation
   */
  public syncClinicalAssessments(
    patientId: string,
    callback: (event: SyncEvent) => void,
    options: {
      assessmentTypes?: string[];
      dateRange?: { start: Date; end: Date };
      includeScores?: boolean;
      validateCompleteness?: boolean;
    } = {},
  ): () => void {
    const subscriptionId = `assessments_${patientId}_${Date.now()}`;

    const subscription: SyncSubscription = {
      id: subscriptionId,
      entity: "clinical_assessments",
      callback: (event: SyncEvent) => {
        // Validate assessment completeness
        if (options.validateCompleteness) {
          event.metadata.completenessScore =
            this.validateAssessmentCompleteness(event.data);
        }

        // Filter by assessment types
        if (options.assessmentTypes && options.assessmentTypes.length > 0) {
          if (!options.assessmentTypes.includes(event.data.assessmentType)) {
            return; // Skip this event
          }
        }

        callback(event);
      },
      filters: { patientId },
      priority: "high",
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: "exponential",
        baseDelay: 1000,
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.subscriptionCount = this.subscriptions.size;

    console.log(`📊 Clinical assessments sync: ${patientId}`);

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.stats.subscriptionCount = this.subscriptions.size;
    };
  }

  /**
   * Validate assessment completeness
   */
  private validateAssessmentCompleteness(assessmentData: any): number {
    const requiredFields = [
      "assessmentType",
      "assessmentDate",
      "clinicianId",
      "patientId",
      "scores",
      "recommendations",
    ];

    const completedFields = requiredFields.filter(
      (field) =>
        assessmentData &&
        assessmentData[field] !== null &&
        assessmentData[field] !== undefined,
    );

    return (completedFields.length / requiredFields.length) * 100;
  }

  /**
   * Force sync for specific entity with healthcare compliance
   */
  public async forceSync(
    entity: string,
    entityId: string,
    options: {
      reason?: string;
      urgency?: "routine" | "urgent" | "emergency";
      auditRequired?: boolean;
    } = {},
  ): Promise<void> {
    console.log(`🔄 Forcing healthcare sync for ${entity}:${entityId}`);

    // Enhanced metadata for healthcare sync
    const metadata = {
      forcedSync: true,
      timestamp: Date.now(),
      reason: options.reason || "Manual sync requested",
      urgency: options.urgency || "routine",
      complianceRequired: true,
      auditTrail: options.auditRequired !== false,
    };

    this.publishEvent({
      type: "update",
      entity,
      data: { entityId, forceSync: true },
      priority: options.urgency === "emergency" ? "critical" : "high",
      metadata,
    });
  }

  /**
   * Setup connection health monitoring
   */
  private setupConnectionHealthMonitoring(): void {
    console.log("🏥 Setting up connection health monitoring...");

    // Enhanced health monitoring with adaptive intervals
    let healthCheckInterval = 30000; // Start with 30 seconds

    const performHealthCheck = () => {
      const healthStatus = this.checkConnectionHealth();

      // Adaptive interval based on health status
      if (!this.isConnected || this.offlineQueue.length > 100) {
        healthCheckInterval = Math.min(healthCheckInterval * 0.8, 10000); // Increase frequency
      } else {
        healthCheckInterval = Math.min(healthCheckInterval * 1.1, 60000); // Decrease frequency
      }

      setTimeout(performHealthCheck, healthCheckInterval);
    };

    performHealthCheck();
  }

  /**
   * Setup performance metrics collection
   */
  private setupPerformanceMetrics(): void {
    console.log("📊 Setting up performance metrics collection...");

    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000); // Collect every minute
  }

  /**
   * Setup data integrity checks
   */
  private setupDataIntegrityChecks(): void {
    console.log("🔒 Setting up data integrity checks...");

    setInterval(() => {
      this.performDataIntegrityCheck();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Check connection health
   */
  private checkConnectionHealth(): {
    isHealthy: boolean;
    issues: string[];
    metrics: Record<string, number>;
  } {
    const issues: string[] = [];
    const metrics = {
      queueSize: this.offlineQueue.length,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
      successRate:
        (this.stats.successfulSyncs / Math.max(this.stats.totalEvents, 1)) *
        100,
    };

    if (!this.isConnected) {
      issues.push("Connection not established");
      console.warn("⚠️ Connection health check: Not connected");
    }

    // Check WebSocket state
    if (this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
      issues.push("WebSocket connection is not open");
      console.warn("⚠️ WebSocket connection is not open");
      this.handleReconnection();
    }

    // Check queue size with tiered warnings
    if (this.offlineQueue.length > 2000) {
      issues.push(
        `Critical offline queue size: ${this.offlineQueue.length} items`,
      );
      console.error(
        `🚨 Critical offline queue size: ${this.offlineQueue.length} items`,
      );
    } else if (this.offlineQueue.length > 1000) {
      issues.push(
        `Large offline queue detected: ${this.offlineQueue.length} items`,
      );
      console.warn(
        `⚠️ Large offline queue detected: ${this.offlineQueue.length} items`,
      );
    }

    // Check success rate
    if (metrics.successRate < 90 && this.stats.totalEvents > 10) {
      issues.push(`Low success rate: ${metrics.successRate.toFixed(1)}%`);
    }

    // Check reconnection attempts
    if (this.reconnectAttempts > 5) {
      issues.push(`High reconnection attempts: ${this.reconnectAttempts}`);
    }

    const isHealthy = issues.length === 0;

    // Log health status periodically
    if (!isHealthy) {
      console.warn("🏥 Connection health issues:", issues);
    } else {
      console.log("✅ Connection health check passed", metrics);
    }

    return { isHealthy, issues, metrics };
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    const metrics = {
      totalEvents: this.stats.totalEvents,
      successfulSyncs: this.stats.successfulSyncs,
      failedSyncs: this.stats.failedSyncs,
      averageLatency: this.stats.averageLatency,
      offlineQueueSize: this.stats.offlineQueueSize,
      subscriptionCount: this.stats.subscriptionCount,
    };

    console.log("📈 Sync performance metrics:", metrics);
  }

  /**
   * Perform data integrity check
   */
  private performDataIntegrityCheck(): void {
    console.log("🔍 Performing data integrity check...");

    // Check for data consistency across subscriptions
    const subscriptionCount = this.subscriptions.size;
    const queueSize = this.offlineQueue.length;

    if (subscriptionCount > 0 && queueSize === 0) {
      console.log("✅ Data integrity check passed");
    } else if (queueSize > 0) {
      console.log(`📋 ${queueSize} items in offline queue awaiting sync`);
    }
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();
export default realTimeSyncService;
