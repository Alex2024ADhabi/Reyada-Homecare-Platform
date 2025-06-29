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
          // Initialize WebSocket connection
          await this.initializeWebSocket();

          // Setup heartbeat monitoring
          this.setupHeartbeat();

          // Initialize conflict resolution
          this.initializeConflictResolution();

          // Setup batch processing
          this.setupBatchProcessing();

          // Process offline queue
          await this.processOfflineQueue();

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
   * Enhanced patient data sync with conflict resolution
   */
  public syncPatientData(
    patientId: string,
    callback: (event: SyncEvent) => void,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      conflictStrategy?: "client_wins" | "server_wins" | "merge";
    } = {},
  ): () => void {
    const subscriptionId = `patient_${patientId}_${Date.now()}`;

    const subscription: SyncSubscription = {
      id: subscriptionId,
      entity: "patient",
      callback: (event: SyncEvent) => {
        this.handleEventWithConflictResolution(event, callback);
      },
      filters: { patientId },
      priority: options.priority || "high",
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: "exponential",
        baseDelay: 1000,
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
   * Force sync for specific entity
   */
  public async forceSync(entity: string, entityId: string): Promise<void> {
    console.log(`🔄 Forcing sync for ${entity}:${entityId}`);

    this.publishEvent({
      type: "update",
      entity,
      data: { entityId, forceSync: true },
      priority: "high",
      metadata: { forcedSync: true, timestamp: Date.now() },
    });
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();
export default realTimeSyncService;
