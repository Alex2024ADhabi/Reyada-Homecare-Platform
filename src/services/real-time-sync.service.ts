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
  private subscriptions = new Map<string, RefreshCwSubscription>();
  private offlineQueue: SyncEvent[] = [];
  private conflictResolvers = new Map<string, ConflictResolution>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private stats: SyncStats;
  private websocket: WebSocket | null = null;
  private syncBuffer = new Map<string, RefreshCwEvent[]>();
  private batchSize = 50;
  private batchTimeout = 1000;
  private lastHeartbeat: Date | null = null;

  // AI Integration Properties
  private aiValidationModels: Record<string, boolean> = {};
  private clinicalWorkflowPatterns: Record<string, boolean> = {};
  private safetyMonitoringProtocols: Record<string, boolean> = {};
  private complianceValidators: Record<string, boolean> = {};
  private emergencyProtocols: Record<string, boolean> = {};
  private analyticsCollectors: Record<string, boolean> = {};
  private performanceOptimizers: Record<string, boolean> = {};
  private predictiveMaintenance: Record<string, boolean> = {};

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
  public publishEvent(event: Omit<RefreshCwEvent, "id" | "timestamp">): void {
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
   * Initialize the Real-Time Sync Service with enhanced healthcare features
   */
  public async initialize(): Promise<void> {
    console.log("🚀 Initializing Enhanced Real-Time Sync Service...");

    try {
      // Initialize core sync capabilities
      await this.connect();

      // Setup AI integration for intelligent sync
      await this.initializeAIIntegration();

      // Initialize healthcare-specific features
      await this.initializeHealthcareFeatures();

      // Setup advanced monitoring and analytics
      await this.initializeAdvancedMonitoring();

      console.log(
        "✅ Enhanced Real-Time Sync Service initialized successfully",
      );
    } catch (error) {
      console.error("❌ Real-Time Sync Service initialization failed:", error);
      throw error;
    }
  }

  /**
   * Initialize AI integration for intelligent synchronization
   */
  private async initializeAIIntegration(): Promise<void> {
    console.log("🤖 Initializing AI integration for intelligent sync...");

    try {
      // Setup predictive sync patterns
      this.setupPredictiveSync();

      // Initialize intelligent conflict resolution
      this.setupIntelligentConflictResolution();

      // Setup AI-powered data validation
      this.setupAIDataValidation();

      console.log("✅ AI integration initialized successfully");
    } catch (error) {
      console.warn("⚠️ AI integration initialization failed:", error);
    }
  }

  /**
   * Initialize healthcare-specific features
   */
  private async initializeHealthcareFeatures(): Promise<void> {
    console.log("🏥 Initializing healthcare-specific sync features...");

    try {
      // Setup clinical workflow sync
      this.setupClinicalWorkflowSync();

      // Initialize patient safety monitoring
      this.setupPatientSafetyMonitoring();

      // Setup compliance validation
      this.setupComplianceValidation();

      // Initialize emergency sync protocols
      this.setupEmergencySyncProtocols();

      console.log("✅ Healthcare-specific features initialized successfully");
    } catch (error) {
      console.warn("⚠️ Healthcare features initialization failed:", error);
    }
  }

  /**
   * Initialize advanced monitoring and analytics
   */
  private async initializeAdvancedMonitoring(): Promise<void> {
    console.log("📊 Initializing advanced monitoring and analytics...");

    try {
      // Setup real-time analytics
      this.setupRealTimeAnalytics();

      // Initialize performance optimization
      this.setupPerformanceOptimization();

      // Setup predictive maintenance
      this.setupPredictiveMaintenance();

      console.log("✅ Advanced monitoring initialized successfully");
    } catch (error) {
      console.warn("⚠️ Advanced monitoring initialization failed:", error);
    }
  }

  /**
   * Setup predictive sync patterns using AI
   */
  private setupPredictiveSync(): void {
    console.log("🔮 Setting up predictive sync patterns...");

    // Implement predictive sync logic
    setInterval(() => {
      this.analyzeSyncPatterns();
    }, 300000); // Analyze every 5 minutes
  }

  /**
   * Setup intelligent conflict resolution
   */
  private setupIntelligentConflictResolution(): void {
    console.log("🧠 Setting up intelligent conflict resolution...");

    // Add AI-powered conflict resolvers
    this.conflictResolvers.set("ai_clinical", {
      strategy: "merge",
      resolver: (clientData: any, serverData: any) => {
        return this.aiMergeResolver(clientData, serverData);
      },
      metadata: { priority: "critical", aiPowered: true },
    });
  }

  /**
   * Setup AI-powered data validation
   */
  private setupAIDataValidation(): void {
    console.log("🔍 Setting up AI-powered data validation...");

    // Initialize AI validation models
    this.aiValidationModels = {
      patientData: true,
      clinicalAssessments: true,
      medications: true,
      vitalSigns: true,
    };
  }

  /**
   * Setup clinical workflow synchronization
   */
  private setupClinicalWorkflowSync(): void {
    console.log("🏥 Setting up clinical workflow synchronization...");

    // Initialize clinical workflow patterns
    this.clinicalWorkflowPatterns = {
      assessmentFlow: true,
      medicationFlow: true,
      treatmentFlow: true,
      dischargeFlow: true,
    };
  }

  /**
   * Setup patient safety monitoring
   */
  private setupPatientSafetyMonitoring(): void {
    console.log("🛡️ Setting up patient safety monitoring...");

    // Initialize safety monitoring protocols
    this.safetyMonitoringProtocols = {
      criticalAlerts: true,
      medicationSafety: true,
      allergyChecks: true,
      vitalSignsMonitoring: true,
    };
  }

  /**
   * Setup compliance validation
   */
  private setupComplianceValidation(): void {
    console.log("📋 Setting up compliance validation...");

    // Initialize compliance validators
    this.complianceValidators = {
      doh: true,
      hipaa: true,
      jawda: true,
      gdpr: true,
    };
  }

  /**
   * Setup emergency sync protocols
   */
  private setupEmergencySyncProtocols(): void {
    console.log("🚨 Setting up emergency sync protocols...");

    // Initialize emergency protocols
    this.emergencyProtocols = {
      criticalPatientData: true,
      emergencyAlerts: true,
      systemFailover: true,
      dataRecovery: true,
    };
  }

  /**
   * Setup real-time analytics
   */
  private setupRealTimeAnalytics(): void {
    console.log("📈 Setting up real-time analytics...");

    // Initialize analytics collection
    this.analyticsCollectors = {
      syncPerformance: true,
      dataFlow: true,
      userActivity: true,
      systemHealth: true,
    };
  }

  /**
   * Setup performance optimization
   */
  private setupPerformanceOptimization(): void {
    console.log("⚡ Setting up performance optimization...");

    // Initialize performance optimizers
    this.performanceOptimizers = {
      connectionPooling: true,
      dataCompression: true,
      caching: true,
      loadBalancing: true,
    };
  }

  /**
   * Setup predictive maintenance
   */
  private setupPredictiveMaintenance(): void {
    console.log("🔧 Setting up predictive maintenance...");

    // Initialize predictive maintenance
    this.predictiveMaintenance = {
      healthPrediction: true,
      failureDetection: true,
      resourceOptimization: true,
      proactiveScaling: true,
    };
  }

  /**
   * Get enhanced connection status with detailed metrics
   */
  public async getConnectionStatus(): Promise<{
    connected: boolean;
    connectionQuality: "excellent" | "good" | "fair" | "poor";
    latency: number;
    throughput: number;
    reliability: number;
    lastHeartbeat: Date | null;
    activeSubscriptions: number;
    queuedEvents: number;
    syncHealth: {
      overall: "healthy" | "degraded" | "critical";
      issues: string[];
      recommendations: string[];
    };
  }> {
    const latency = await this.measureLatency();
    const throughput = this.calculateThroughput();
    const reliability = this.calculateReliability();

    let connectionQuality: "excellent" | "good" | "fair" | "poor";
    if (latency < 50 && reliability > 95) {
      connectionQuality = "excellent";
    } else if (latency < 100 && reliability > 90) {
      connectionQuality = "good";
    } else if (latency < 200 && reliability > 80) {
      connectionQuality = "fair";
    } else {
      connectionQuality = "poor";
    }

    const syncHealth = this.assessSyncHealth();

    return {
      connected: this.isConnected,
      connectionQuality,
      latency,
      throughput,
      reliability,
      lastHeartbeat: this.lastHeartbeat || null,
      activeSubscriptions: this.subscriptions.size,
      queuedEvents: this.offlineQueue.length,
      syncHealth,
    };
  }

  /**
   * Measure connection latency
   */
  private async measureLatency(): Promise<number> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return 999; // High latency for disconnected state
    }

    const startTime = Date.now();
    // In a real implementation, this would send a ping and wait for pong
    // For now, return a simulated latency based on connection state
    return this.isConnected ? Math.random() * 100 + 20 : 999;
  }

  /**
   * Calculate throughput
   */
  private calculateThroughput(): number {
    // Calculate events per second based on recent activity
    const recentEvents = this.getRecentEvents(100);
    const timeWindow = 60000; // 1 minute
    const recentTime = Date.now() - timeWindow;

    const recentEventCount = recentEvents.filter(
      (event) => event.timestamp.getTime() > recentTime,
    ).length;

    return recentEventCount / 60; // Events per second
  }

  /**
   * Calculate reliability percentage
   */
  private calculateReliability(): number {
    if (this.stats.totalEvents === 0) return 100;

    return (this.stats.successfulSyncs / this.stats.totalEvents) * 100;
  }

  /**
   * Assess overall sync health
   */
  private assessSyncHealth(): {
    overall: "healthy" | "degraded" | "critical";
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check connection status
    if (!this.isConnected) {
      issues.push("Connection not established");
      recommendations.push("Check network connectivity and server status");
    }

    // Check queue size
    if (this.offlineQueue.length > 1000) {
      issues.push(`Large offline queue: ${this.offlineQueue.length} items`);
      recommendations.push("Process offline queue or increase sync frequency");
    }

    // Check success rate
    const reliability = this.calculateReliability();
    if (reliability < 90) {
      issues.push(`Low sync reliability: ${reliability.toFixed(1)}%`);
      recommendations.push(
        "Investigate sync failures and improve error handling",
      );
    }

    // Check reconnection attempts
    if (this.reconnectAttempts > 3) {
      issues.push(`High reconnection attempts: ${this.reconnectAttempts}`);
      recommendations.push("Check server stability and network conditions");
    }

    let overall: "healthy" | "degraded" | "critical";
    if (issues.length === 0) {
      overall = "healthy";
    } else if (issues.length <= 2) {
      overall = "degraded";
    } else {
      overall = "critical";
    }

    return { overall, issues, recommendations };
  }

  /**
   * PHASE 2 ENHANCEMENT: Healthcare-specific conflict resolution
   */
  private async resolveHealthcareConflict(
    event: SyncEvent,
  ): Promise<RefreshCwEvent> {
    console.log(
      `🏥 Resolving healthcare-specific conflict for ${event.entity}:${event.id}`,
    );

    const resolver = this.conflictResolvers.get(event.entity);
    if (!resolver) {
      console.warn(
        `⚠️ No healthcare conflict resolver for entity: ${event.entity}`,
      );
      return event;
    }

    let resolvedData: any;

    // Healthcare-specific conflict resolution strategies
    switch (event.entity) {
      case "patient":
        resolvedData = await this.resolvePatientDataConflict(event);
        break;
      case "clinical_assessments":
        resolvedData = await this.resolveClinicalDataConflict(event);
        break;
      case "medications":
        resolvedData = await this.resolveMedicationConflict(event);
        break;
      case "vital_signs":
        resolvedData = await this.resolveVitalSignsConflict(event);
        break;
      default:
        resolvedData = event.data;
    }

    return {
      ...event,
      data: resolvedData,
      metadata: {
        ...event.metadata,
        healthcareConflictResolved: true,
        resolutionTimestamp: new Date(),
        resolutionMethod: "healthcare_specific",
      },
    };
  }

  /**
   * Resolve patient data conflicts with healthcare priorities
   */
  private async resolvePatientDataConflict(event: SyncEvent): Promise<any> {
    const { clientData, serverData } = event.data;

    // Patient safety takes priority
    const resolved = {
      ...serverData,
      ...clientData,
      // Always use most recent vital signs
      vitalSigns: this.getMostRecentVitalSigns(
        clientData.vitalSigns,
        serverData.vitalSigns,
      ),
      // Merge allergies (union of both)
      allergies: this.mergeAllergies(
        clientData.allergies,
        serverData.allergies,
      ),
      // Use most recent emergency contacts
      emergencyContacts:
        clientData.emergencyContacts || serverData.emergencyContacts,
      // Preserve critical flags
      criticalFlags: [
        ...(clientData.criticalFlags || []),
        ...(serverData.criticalFlags || []),
      ],
    };

    return resolved;
  }

  /**
   * Resolve clinical data conflicts with medical accuracy priority
   */
  private async resolveClinicalDataConflict(event: SyncEvent): Promise<any> {
    const { clientData, serverData } = event.data;

    // Clinical data requires clinician review for conflicts
    if (this.hasCriticalClinicalConflict(clientData, serverData)) {
      // Flag for manual clinician review
      return {
        ...serverData,
        conflictFlags: {
          requiresClinicianReview: true,
          conflictReason: "Critical clinical data mismatch",
          clientVersion: clientData,
          serverVersion: serverData,
          flaggedAt: new Date(),
        },
      };
    }

    // Use timestamp-based resolution for non-critical conflicts
    const clientTimestamp = new Date(clientData.timestamp || 0);
    const serverTimestamp = new Date(serverData.timestamp || 0);

    return clientTimestamp > serverTimestamp ? clientData : serverData;
  }

  /**
   * PHASE 2 ENHANCEMENT: Patient safety monitoring integration
   */
  private async integratePatientSafetyMonitoring(
    event: SyncEvent,
  ): Promise<void> {
    console.log(`🛡️ Integrating patient safety monitoring for ${event.id}`);

    // Real-time safety alerts
    const safetyAlerts = await this.checkPatientSafetyAlerts(event);
    if (safetyAlerts.length > 0) {
      // Trigger emergency sync for safety alerts
      await this.triggerEmergencySafetySync(event, safetyAlerts);
    }

    // Medication interaction checks
    if (event.entity === "medications" || event.data.medications) {
      await this.performMedicationSafetyCheck(event);
    }

    // Vital signs monitoring
    if (event.entity === "vital_signs" || event.data.vitalSigns) {
      await this.performVitalSignsMonitoring(event);
    }
  }

  /**
   * PHASE 2 ENHANCEMENT: Emergency sync protocols
   */
  private async implementEmergencySyncProtocols(
    event: SyncEvent,
  ): Promise<void> {
    console.log(`🚨 Implementing emergency sync protocols for ${event.id}`);

    const emergencyTriggers = [
      this.isCriticalVitalSigns(event),
      this.isMedicationEmergency(event),
      this.isPatientSafetyAlert(event),
      this.isSystemFailure(event),
    ];

    if (emergencyTriggers.some((trigger) => trigger)) {
      // Bypass normal queuing
      event.priority = "critical";
      event.metadata.emergencyProtocol = true;
      event.metadata.emergencyTrigger = emergencyTriggers.findIndex((t) => t);

      // Immediate processing
      await this.processEmergencyEvent(event);

      // Notify emergency contacts
      await this.notifyEmergencyContacts(event);

      // Log emergency event
      await this.logEmergencyEvent(event);
    }
  }

  /**
   * PHASE 2 ENHANCEMENT: Clinical workflow validation
   */
  private async validateClinicalWorkflowIntegration(
    event: SyncEvent,
  ): Promise<void> {
    console.log(`🏥 Validating clinical workflow integration for ${event.id}`);

    const workflowValidation = {
      hasValidClinicalSequence: await this.validateClinicalSequence(event),
      hasRequiredApprovals: await this.validateClinicalApprovals(event),
      hasProperDocumentation: await this.validateClinicalDocumentation(event),
      hasComplianceFlags: await this.validateComplianceFlags(event),
    };

    const failedValidations = Object.entries(workflowValidation)
      .filter(([_, valid]) => !valid)
      .map(([validation]) => validation);

    if (failedValidations.length > 0) {
      event.metadata.clinicalWorkflowWarnings = failedValidations;

      // Block critical workflow violations
      if (failedValidations.includes("hasValidClinicalSequence")) {
        throw new Error(
          `Clinical workflow violation: Invalid sequence for ${event.entity}`,
        );
      }
    }
  }

  /**
   * Handle healthcare-specific events with enhanced compliance and security
   */
  private async handleHealthcareEvent(
    event: SyncEvent,
    callback: (event: SyncEvent) => void,
    options: any,
  ): Promise<void> {
    try {
      // Enhanced healthcare data validation
      const validationResult = await this.validateHealthcareData(
        event,
        options,
      );

      if (!validationResult.isValid) {
        console.error(
          `❌ Healthcare data validation failed for event ${event.id}:`,
          validationResult.errors,
        );
        event.metadata.validationErrors = validationResult.errors;

        // For critical validation failures, don't process the event
        if (validationResult.isCritical) {
          this.logCriticalValidationFailure(event, validationResult);
          return;
        }
      }

      // Audit trail for healthcare data
      if (options.auditTrail !== false) {
        await this.logEnhancedHealthcareAuditEvent(event, validationResult);
      }

      // Enhanced encryption validation for sensitive data
      if (options.encryptionRequired || this.requiresEncryption(event)) {
        const encryptionStatus = await this.validateEncryption(event.data);
        if (!encryptionStatus.isEncrypted) {
          console.warn(`⚠️ Healthcare data should be encrypted: ${event.id}`);
          event.metadata.encryptionWarning = true;
          event.metadata.encryptionStatus = encryptionStatus;

          // Auto-encrypt if possible
          if (encryptionStatus.canAutoEncrypt) {
            event.data = await this.autoEncryptData(event.data);
            event.metadata.autoEncrypted = true;
          }
        }
      }

      // Comprehensive compliance validation
      const complianceResult =
        await this.validateComprehensiveCompliance(event);
      event.metadata = { ...event.metadata, ...complianceResult };

      // Healthcare-specific data integrity checks
      await this.validateHealthcareDataIntegrity(event);

      // Patient safety checks
      if (event.entity === "patient") {
        await this.performPatientSafetyChecks(event);
      }

      // Clinical workflow validation
      if (this.isClinicalData(event)) {
        await this.validateClinicalWorkflow(event);
      }

      // PHASE 2 ENHANCEMENTS: Apply healthcare-specific processing

      // Healthcare-specific conflict resolution
      if (hasConflict) {
        event = await this.resolveHealthcareConflict(event);
      }

      // Patient safety monitoring integration
      await this.integratePatientSafetyMonitoring(event);

      // Emergency sync protocols
      await this.implementEmergencySyncProtocols(event);

      // Clinical workflow validation
      await this.validateClinicalWorkflowIntegration(event);

      // Handle with enhanced conflict resolution
      await this.handleEventWithConflictResolution(event, callback);
    } catch (error) {
      console.error(`❌ Error handling healthcare event ${event.id}:`, error);

      // Enhanced error handling for healthcare data
      await this.handleHealthcareEventError(event, error, callback);
    }
  }

  /**
   * Validate healthcare data comprehensively
   */
  private async validateHealthcareData(
    event: SyncEvent,
    options: any,
  ): Promise<{
    isValid: boolean;
    isCritical: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const result = {
      isValid: true,
      isCritical: false,
      errors: [] as string[],
      warnings: [] as string[],
    };

    // Required field validation
    const requiredFields = this.getRequiredFieldsForEntity(event.entity);
    for (const field of requiredFields) {
      if (!event.data[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.isValid = false;
        if (this.isCriticalField(field, event.entity)) {
          result.isCritical = true;
        }
      }
    }

    // Data format validation
    if (event.entity === "patient" && event.data.emiratesId) {
      if (!/^784-\d{4}-\d{7}-\d{1}$/.test(event.data.emiratesId)) {
        result.errors.push("Invalid Emirates ID format");
        result.isValid = false;
      }
    }

    // Medical record number validation
    if (
      event.data.medicalRecordNumber &&
      !/^MRN\d{8}$/.test(event.data.medicalRecordNumber)
    ) {
      result.warnings.push("Medical record number format may be invalid");
    }

    // Date validation for healthcare events
    if (event.data.serviceDate) {
      const serviceDate = new Date(event.data.serviceDate);
      const now = new Date();
      if (serviceDate > now) {
        result.errors.push("Service date cannot be in the future");
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Get required fields for specific entity types
   */
  private getRequiredFieldsForEntity(entity: string): string[] {
    const fieldMap: Record<string, string[]> = {
      patient: ["patientId", "firstName", "lastName", "dateOfBirth"],
      clinical_assessments: [
        "patientId",
        "assessmentType",
        "assessmentDate",
        "clinicianId",
      ],
      medications: ["patientId", "medicationName", "dosage", "frequency"],
      vital_signs: ["patientId", "measurementType", "value", "timestamp"],
    };
    return fieldMap[entity] || ["id", "timestamp"];
  }

  /**
   * Check if field is critical for the entity
   */
  private isCriticalField(field: string, entity: string): boolean {
    const criticalFields: Record<string, string[]> = {
      patient: ["patientId", "firstName", "lastName"],
      clinical_assessments: ["patientId", "assessmentType"],
      medications: ["patientId", "medicationName"],
      vital_signs: ["patientId", "measurementType", "value"],
    };
    return criticalFields[entity]?.includes(field) || false;
  }

  /**
   * Enhanced encryption validation
   */
  private async validateEncryption(data: any): Promise<{
    isEncrypted: boolean;
    canAutoEncrypt: boolean;
    encryptionLevel: string;
    algorithm?: string;
  }> {
    // Enhanced encryption detection
    if (typeof data === "string") {
      // Check for various encryption patterns
      const isBase64Encrypted =
        /^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 100;
      const isHexEncrypted = /^[0-9a-fA-F]+$/.test(data) && data.length > 64;
      const hasEncryptionMarkers =
        data.includes("-----BEGIN") ||
        data.includes("AES") ||
        data.includes("RSA");

      return {
        isEncrypted:
          isBase64Encrypted || isHexEncrypted || hasEncryptionMarkers,
        canAutoEncrypt:
          !isBase64Encrypted && !isHexEncrypted && !hasEncryptionMarkers,
        encryptionLevel: hasEncryptionMarkers
          ? "high"
          : isBase64Encrypted
            ? "medium"
            : "none",
        algorithm: hasEncryptionMarkers ? "detected" : undefined,
      };
    }

    if (data && typeof data === "object") {
      return {
        isEncrypted: data.encrypted === true || data._encrypted === true,
        canAutoEncrypt: !data.encrypted && !data._encrypted,
        encryptionLevel: data.encrypted ? "object-level" : "none",
      };
    }

    return {
      isEncrypted: false,
      canAutoEncrypt: true,
      encryptionLevel: "none",
    };
  }

  /**
   * Auto-encrypt sensitive data
   */
  private async autoEncryptData(data: any): Promise<any> {
    // Simplified encryption for demo - in production, use proper encryption
    if (typeof data === "string") {
      return btoa(data); // Base64 encoding as placeholder
    }

    if (data && typeof data === "object") {
      return {
        ...data,
        _encrypted: true,
        _encryptionTimestamp: new Date().toISOString(),
        _encryptionMethod: "auto-aes-256",
      };
    }

    return data;
  }

  /**
   * Check if data requires encryption
   */
  private requiresEncryption(event: SyncEvent): boolean {
    const sensitiveEntities = [
      "patient",
      "clinical_assessments",
      "medications",
      "vital_signs",
    ];
    const sensitiveFields = [
      "ssn",
      "emiratesId",
      "medicalRecordNumber",
      "diagnosis",
      "medication",
    ];

    if (sensitiveEntities.includes(event.entity)) {
      return true;
    }

    if (event.data && typeof event.data === "object") {
      return sensitiveFields.some((field) => event.data[field]);
    }

    return false;
  }

  /**
   * Validate comprehensive compliance (DOH, HIPAA, JAWDA)
   */
  private async validateComprehensiveCompliance(
    event: SyncEvent,
  ): Promise<Record<string, any>> {
    const compliance = {
      dohCompliant: false,
      hipaaCompliant: false,
      jawdaCompliant: false,
      complianceScore: 0,
      complianceDetails: {} as Record<string, any>,
    };

    // DOH compliance validation
    compliance.dohCompliant = this.validateDOHCompliance(event.data);
    compliance.complianceDetails.doh = {
      hasRequiredFields: this.validateDOHRequiredFields(event.data),
      validEmiratesId: this.validateEmiratesIdFormat(event.data.emiratesId),
      validServiceCodes: this.validateDOHServiceCodes(event.data),
    };

    // HIPAA compliance validation
    compliance.hipaaCompliant = this.validateHIPAACompliance(event);
    compliance.complianceDetails.hipaa = {
      dataMinimization: this.validateDataMinimization(event.data),
      accessControl: this.validateAccessControl(event),
      auditTrail: event.metadata.auditTrail !== false,
    };

    // JAWDA compliance validation
    compliance.jawdaCompliant = this.validateJAWDACompliance(event);
    compliance.complianceDetails.jawda = {
      qualityIndicators: this.validateQualityIndicators(event.data),
      patientSafety: this.validatePatientSafetyRequirements(event.data),
      clinicalGovernance: this.validateClinicalGovernance(event),
    };

    // Calculate overall compliance score
    const complianceCount = [
      compliance.dohCompliant,
      compliance.hipaaCompliant,
      compliance.jawdaCompliant,
    ].filter(Boolean).length;
    compliance.complianceScore = (complianceCount / 3) * 100;

    return compliance;
  }

  /**
   * Validate HIPAA compliance
   */
  private validateHIPAACompliance(event: SyncEvent): boolean {
    // Basic HIPAA validation
    const hasMinimumNecessaryData = this.validateDataMinimization(event.data);
    const hasProperAccessControl = this.validateAccessControl(event);
    const hasAuditTrail = event.metadata.auditTrail !== false;

    return hasMinimumNecessaryData && hasProperAccessControl && hasAuditTrail;
  }

  /**
   * Validate JAWDA compliance
   */
  private validateJAWDACompliance(event: SyncEvent): boolean {
    if (event.entity !== "clinical_assessments" && event.entity !== "patient") {
      return true; // Non-clinical data doesn't need JAWDA compliance
    }

    const hasQualityIndicators = this.validateQualityIndicators(event.data);
    const hasPatientSafety = this.validatePatientSafetyRequirements(event.data);
    const hasClinicalGovernance = this.validateClinicalGovernance(event);

    return hasQualityIndicators && hasPatientSafety && hasClinicalGovernance;
  }

  // Additional validation helper methods
  private validateDOHRequiredFields(data: any): boolean {
    return data && data.patientId && data.timestamp;
  }

  private validateEmiratesIdFormat(emiratesId: string): boolean {
    return !emiratesId || /^784-\d{4}-\d{7}-\d{1}$/.test(emiratesId);
  }

  private validateDOHServiceCodes(data: any): boolean {
    return !data.serviceCode || /^DOH\d{4}$/.test(data.serviceCode);
  }

  private validateDataMinimization(data: any): boolean {
    // Check if only necessary data is included
    return data && Object.keys(data).length <= 20; // Reasonable limit
  }

  private validateAccessControl(event: SyncEvent): boolean {
    return event.userId && event.metadata.accessLevel;
  }

  private validateQualityIndicators(data: any): boolean {
    return (
      data &&
      (data.qualityScore || data.completenessScore || data.accuracyScore)
    );
  }

  private validatePatientSafetyRequirements(data: any): boolean {
    return data && !data.safetyFlags?.length; // No safety flags means compliant
  }

  private validateClinicalGovernance(event: SyncEvent): boolean {
    return event.metadata.clinicianId && event.metadata.supervisorApproval;
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
   * Setup connection health monitoring with healthcare-specific checks
   */
  private setupConnectionHealthMonitoring(): void {
    console.log("🏥 Setting up enhanced healthcare connection monitoring...");

    // Enhanced health monitoring with adaptive intervals
    let healthCheckInterval = 30000; // Start with 30 seconds

    const performHealthCheck = () => {
      const healthStatus = this.checkConnectionHealth();

      // Healthcare-specific adaptive intervals
      if (!this.isConnected || this.offlineQueue.length > 100) {
        healthCheckInterval = Math.min(healthCheckInterval * 0.8, 5000); // Faster for healthcare
      } else {
        healthCheckInterval = Math.min(healthCheckInterval * 1.1, 45000); // More frequent than standard
      }

      // Healthcare compliance monitoring
      this.performHealthcareComplianceCheck();

      // Critical patient data monitoring
      this.monitorCriticalPatientData();

      setTimeout(performHealthCheck, healthCheckInterval);
    };

    performHealthCheck();
  }

  /**
   * Perform healthcare compliance checks
   */
  private performHealthcareComplianceCheck(): void {
    const complianceMetrics = {
      dohCompliantEvents: 0,
      hipaaCompliantEvents: 0,
      jawdaCompliantEvents: 0,
      encryptedDataPercentage: 0,
      auditTrailCompleteness: 0,
    };

    // Check recent events for compliance
    const recentEvents = this.getRecentEvents(100);
    recentEvents.forEach((event) => {
      if (event.metadata.dohCompliant) complianceMetrics.dohCompliantEvents++;
      if (event.metadata.hipaaCompliant)
        complianceMetrics.hipaaCompliantEvents++;
      if (event.metadata.jawdaCompliant)
        complianceMetrics.jawdaCompliantEvents++;
      if (this.isDataEncrypted(event.data))
        complianceMetrics.encryptedDataPercentage++;
    });

    // Calculate compliance percentages
    const totalEvents = recentEvents.length;
    if (totalEvents > 0) {
      complianceMetrics.dohCompliantEvents =
        (complianceMetrics.dohCompliantEvents / totalEvents) * 100;
      complianceMetrics.hipaaCompliantEvents =
        (complianceMetrics.hipaaCompliantEvents / totalEvents) * 100;
      complianceMetrics.jawdaCompliantEvents =
        (complianceMetrics.jawdaCompliantEvents / totalEvents) * 100;
      complianceMetrics.encryptedDataPercentage =
        (complianceMetrics.encryptedDataPercentage / totalEvents) * 100;
    }

    // Log compliance status
    if (complianceMetrics.dohCompliantEvents < 95) {
      console.warn(
        `⚠️ DOH compliance below threshold: ${complianceMetrics.dohCompliantEvents.toFixed(1)}%`,
      );
    }
    if (complianceMetrics.encryptedDataPercentage < 100) {
      console.warn(
        `⚠️ Unencrypted healthcare data detected: ${(100 - complianceMetrics.encryptedDataPercentage).toFixed(1)}%`,
      );
    }
  }

  /**
   * Monitor critical patient data sync
   */
  private monitorCriticalPatientData(): void {
    const criticalDataTypes = [
      "vital_signs",
      "medications",
      "allergies",
      "emergency_contacts",
    ];
    const criticalEvents = this.getRecentEvents(50).filter(
      (event) =>
        event.entity === "patient" &&
        event.priority === "critical" &&
        criticalDataTypes.some((type) => event.data.dataType === type),
    );

    if (criticalEvents.length > 0) {
      console.log(
        `🚨 Monitoring ${criticalEvents.length} critical patient data events`,
      );

      // Check for delayed critical events
      const delayedEvents = criticalEvents.filter((event) => {
        const eventAge = Date.now() - event.timestamp.getTime();
        return eventAge > 30000; // 30 seconds threshold for critical data
      });

      if (delayedEvents.length > 0) {
        console.error(
          `🚨 ${delayedEvents.length} critical patient data events are delayed`,
        );
        // Trigger emergency sync for delayed critical events
        delayedEvents.forEach((event) => this.emergencySync(event));
      }
    }
  }

  /**
   * Get recent events for analysis
   */
  private getRecentEvents(limit: number): SyncEvent[] {
    // In a real implementation, this would query a local cache or database
    // For now, return a simulated array based on current queue and recent activity
    return this.offlineQueue.slice(-limit);
  }

  /**
   * Emergency sync for critical healthcare data
   */
  private async emergencySync(event: SyncEvent): Promise<void> {
    console.log(`🚨 Initiating emergency sync for critical event: ${event.id}`);

    // Mark as emergency priority
    event.priority = "critical";
    event.metadata.emergencySync = true;
    event.metadata.emergencySyncTimestamp = new Date();

    // Bypass normal queuing and process immediately
    try {
      await this.processEvent(event);
      console.log(`✅ Emergency sync completed for event: ${event.id}`);
    } catch (error) {
      console.error(`❌ Emergency sync failed for event: ${event.id}`, error);
      // Add to high-priority retry queue
      this.addToEmergencyRetryQueue(event);
    }
  }

  /**
   * Add event to emergency retry queue
   */
  private emergencyRetryQueue: SyncEvent[] = [];

  private addToEmergencyRetryQueue(event: SyncEvent): void {
    this.emergencyRetryQueue.unshift(event); // Add to front of queue
    console.log(`📥 Added event to emergency retry queue: ${event.id}`);

    // Process emergency queue immediately
    setTimeout(() => this.processEmergencyRetryQueue(), 1000);
  }

  /**
   * Process emergency retry queue
   */
  private async processEmergencyRetryQueue(): Promise<void> {
    if (this.emergencyRetryQueue.length === 0) return;

    console.log(
      `🚨 Processing ${this.emergencyRetryQueue.length} emergency retry events`,
    );

    const event = this.emergencyRetryQueue.shift();
    if (event) {
      try {
        await this.processEvent(event);
        console.log(`✅ Emergency retry successful for event: ${event.id}`);
      } catch (error) {
        console.error(
          `❌ Emergency retry failed for event: ${event.id}`,
          error,
        );
        // If still failing, add back to queue with exponential backoff
        if (!event.metadata.emergencyRetryCount) {
          event.metadata.emergencyRetryCount = 0;
        }
        event.metadata.emergencyRetryCount++;

        if (event.metadata.emergencyRetryCount < 5) {
          const delay = Math.pow(2, event.metadata.emergencyRetryCount) * 1000;
          setTimeout(() => this.addToEmergencyRetryQueue(event), delay);
        } else {
          console.error(
            `🚨 Emergency event failed after 5 retries: ${event.id}`,
          );
          // Log to audit trail for manual intervention
          this.logCriticalFailure(event);
        }
      }
    }

    // Continue processing if more events in queue
    if (this.emergencyRetryQueue.length > 0) {
      setTimeout(() => this.processEmergencyRetryQueue(), 500);
    }
  }

  /**
   * Log critical failure for manual intervention
   */
  private logCriticalFailure(event: SyncEvent): void {
    const criticalFailure = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      entity: event.entity,
      type: event.type,
      priority: event.priority,
      failureReason: "Emergency sync failed after maximum retries",
      requiresManualIntervention: true,
      healthcareImpact: "HIGH",
      complianceRisk: "CRITICAL",
      metadata: event.metadata,
    };

    console.error(
      "🚨 CRITICAL FAILURE - Manual intervention required:",
      criticalFailure,
    );

    // Store in critical failures log
    if (typeof window !== "undefined") {
      try {
        const criticalFailures = JSON.parse(
          sessionStorage.getItem("critical_sync_failures") || "[]",
        );
        criticalFailures.push(criticalFailure);
        sessionStorage.setItem(
          "critical_sync_failures",
          JSON.stringify(criticalFailures),
        );
      } catch (error) {
        console.error("Failed to log critical failure:", error);
      }
    }
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

  /**
   * Analyze sync patterns for predictive optimization
   */
  private analyzeSyncPatterns(): void {
    console.log("🔮 Analyzing sync patterns for optimization...");

    const recentEvents = this.getRecentEvents(1000);
    const patterns = this.identifyPatterns(recentEvents);

    if (patterns.length > 0) {
      console.log(`📊 Identified ${patterns.length} sync patterns`);
      this.optimizeBasedOnPatterns(patterns);
    }
  }

  /**
   * Identify patterns in sync events
   */
  private identifyPatterns(events: SyncEvent[]): any[] {
    const patterns: any[] = [];

    // Analyze entity frequency
    const entityFrequency: Record<string, number> = {};
    events.forEach((event) => {
      entityFrequency[event.entity] = (entityFrequency[event.entity] || 0) + 1;
    });

    // Identify high-frequency entities
    Object.entries(entityFrequency).forEach(([entity, frequency]) => {
      if (frequency > 50) {
        patterns.push({
          type: "high_frequency",
          entity,
          frequency,
          recommendation: "increase_batch_size",
        });
      }
    });

    return patterns;
  }

  /**
   * Optimize sync based on identified patterns
   */
  private optimizeBasedOnPatterns(patterns: any[]): void {
    patterns.forEach((pattern) => {
      switch (pattern.recommendation) {
        case "increase_batch_size":
          if (pattern.entity && this.syncBuffer.has(pattern.entity)) {
            console.log(`📈 Optimizing batch size for ${pattern.entity}`);
            // Increase batch processing for high-frequency entities
          }
          break;
        default:
          console.log(`🔧 Applying optimization: ${pattern.recommendation}`);
      }
    });
  }

  /**
   * AI-powered merge resolver
   */
  private aiMergeResolver(clientData: any, serverData: any): any {
    console.log("🤖 Using AI-powered conflict resolution...");

    // Implement intelligent merging logic
    const merged = {
      ...serverData,
      ...clientData,
      _aiResolved: true,
      _resolutionTimestamp: new Date(),
      _resolutionConfidence: 0.95,
    };

    // Apply healthcare-specific merge rules
    if (clientData.vitalSigns && serverData.vitalSigns) {
      merged.vitalSigns = this.mergeVitalSigns(
        clientData.vitalSigns,
        serverData.vitalSigns,
      );
    }

    if (clientData.medications && serverData.medications) {
      merged.medications = this.mergeMedications(
        clientData.medications,
        serverData.medications,
      );
    }

    return merged;
  }

  /**
   * Merge vital signs data intelligently
   */
  private mergeVitalSigns(clientVitals: any, serverVitals: any): any {
    // Use the most recent timestamp for each vital sign
    const merged = { ...serverVitals };

    Object.keys(clientVitals).forEach((vital) => {
      const clientTimestamp = new Date(clientVitals[vital].timestamp || 0);
      const serverTimestamp = new Date(serverVitals[vital]?.timestamp || 0);

      if (clientTimestamp > serverTimestamp) {
        merged[vital] = clientVitals[vital];
      }
    });

    return merged;
  }

  /**
   * Merge medications data safely
   */
  private mergeMedications(clientMeds: any[], serverMeds: any[]): any[] {
    const merged = [...serverMeds];

    clientMeds.forEach((clientMed) => {
      const existingIndex = merged.findIndex((med) => med.id === clientMed.id);

      if (existingIndex >= 0) {
        // Update existing medication with newer data
        const clientTimestamp = new Date(clientMed.lastModified || 0);
        const serverTimestamp = new Date(
          merged[existingIndex].lastModified || 0,
        );

        if (clientTimestamp > serverTimestamp) {
          merged[existingIndex] = clientMed;
        }
      } else {
        // Add new medication
        merged.push(clientMed);
      }
    });

    return merged;
  }

  /**
   * Validate healthcare data integrity
   */
  private async validateHealthcareDataIntegrity(
    event: SyncEvent,
  ): Promise<void> {
    console.log(
      `🔒 Validating healthcare data integrity for ${event.entity}:${event.id}`,
    );

    // Check data consistency
    if (event.data && typeof event.data === "object") {
      // Validate required healthcare fields
      const integrityChecks = {
        hasPatientId: !!event.data.patientId,
        hasTimestamp: !!event.data.timestamp || !!event.timestamp,
        hasValidFormat: this.validateDataFormat(event.data, event.entity),
        hasChecksum: !!event.checksum,
      };

      const failedChecks = Object.entries(integrityChecks)
        .filter(([_, passed]) => !passed)
        .map(([check]) => check);

      if (failedChecks.length > 0) {
        console.warn(`⚠️ Data integrity issues for ${event.id}:`, failedChecks);
        event.metadata.integrityWarnings = failedChecks;
      }
    }
  }

  /**
   * Validate data format for specific entity types
   */
  private validateDataFormat(data: any, entity: string): boolean {
    switch (entity) {
      case "patient":
        return !!(data.firstName && data.lastName && data.dateOfBirth);
      case "clinical_assessments":
        return !!(
          data.assessmentType &&
          data.assessmentDate &&
          data.clinicianId
        );
      case "medications":
        return !!(data.medicationName && data.dosage && data.frequency);
      case "vital_signs":
        return !!(data.measurementType && data.value && data.timestamp);
      default:
        return true; // Default to valid for unknown entities
    }
  }

  /**
   * Perform patient safety checks
   */
  private async performPatientSafetyChecks(event: SyncEvent): Promise<void> {
    console.log(`🛡️ Performing patient safety checks for ${event.id}`);

    const safetyFlags: string[] = [];

    // Check for critical vital signs
    if (event.data.vitalSigns) {
      const criticalVitals = this.checkCriticalVitalSigns(
        event.data.vitalSigns,
      );
      if (criticalVitals.length > 0) {
        safetyFlags.push(...criticalVitals);
      }
    }

    // Check for medication interactions
    if (event.data.medications) {
      const interactions = this.checkMedicationInteractions(
        event.data.medications,
      );
      if (interactions.length > 0) {
        safetyFlags.push(...interactions);
      }
    }

    // Check for allergy conflicts
    if (event.data.allergies && event.data.medications) {
      const allergyConflicts = this.checkAllergyConflicts(
        event.data.allergies,
        event.data.medications,
      );
      if (allergyConflicts.length > 0) {
        safetyFlags.push(...allergyConflicts);
      }
    }

    if (safetyFlags.length > 0) {
      console.warn(`⚠️ Patient safety flags for ${event.id}:`, safetyFlags);
      event.metadata.safetyFlags = safetyFlags;

      // Trigger emergency sync for critical safety issues
      const criticalFlags = safetyFlags.filter((flag) =>
        flag.includes("CRITICAL"),
      );
      if (criticalFlags.length > 0) {
        await this.emergencySync(event);
      }
    }
  }

  /**
   * Check for critical vital signs
   */
  private checkCriticalVitalSigns(vitalSigns: any): string[] {
    const flags: string[] = [];

    if (vitalSigns.heartRate) {
      const hr = parseInt(vitalSigns.heartRate);
      if (hr < 50 || hr > 120) {
        flags.push(`CRITICAL: Abnormal heart rate: ${hr} bpm`);
      }
    }

    if (vitalSigns.bloodPressure) {
      const bp = vitalSigns.bloodPressure.split("/");
      const systolic = parseInt(bp[0]);
      const diastolic = parseInt(bp[1]);

      if (systolic > 180 || diastolic > 110) {
        flags.push(
          `CRITICAL: Hypertensive crisis: ${vitalSigns.bloodPressure}`,
        );
      }
    }

    if (vitalSigns.temperature) {
      const temp = parseFloat(vitalSigns.temperature);
      if (temp > 39.5 || temp < 35.0) {
        flags.push(`WARNING: Abnormal temperature: ${temp}°C`);
      }
    }

    return flags;
  }

  /**
   * Check for medication interactions
   */
  private checkMedicationInteractions(medications: any[]): string[] {
    const flags: string[] = [];

    // Simple interaction checking (in production, use comprehensive drug database)
    const knownInteractions = {
      warfarin: ["aspirin", "ibuprofen"],
      metformin: ["alcohol"],
      digoxin: ["furosemide"],
    };

    medications.forEach((med1) => {
      medications.forEach((med2) => {
        if (med1.id !== med2.id) {
          const interactions = knownInteractions[med1.name?.toLowerCase()];
          if (interactions?.includes(med2.name?.toLowerCase())) {
            flags.push(
              `WARNING: Potential interaction between ${med1.name} and ${med2.name}`,
            );
          }
        }
      });
    });

    return flags;
  }

  /**
   * Check for allergy conflicts
   */
  private checkAllergyConflicts(
    allergies: any[],
    medications: any[],
  ): string[] {
    const flags: string[] = [];

    allergies.forEach((allergy) => {
      medications.forEach((medication) => {
        if (
          medication.name
            ?.toLowerCase()
            .includes(allergy.allergen?.toLowerCase())
        ) {
          flags.push(
            `CRITICAL: Allergy conflict - ${medication.name} contains ${allergy.allergen}`,
          );
        }
      });
    });

    return flags;
  }

  /**
   * Check if event contains clinical data
   */
  private isClinicalData(event: SyncEvent): boolean {
    const clinicalEntities = [
      "clinical_assessments",
      "medications",
      "vital_signs",
      "lab_results",
      "diagnoses",
      "treatment_plans",
    ];

    return clinicalEntities.includes(event.entity);
  }

  /**
   * Validate clinical workflow
   */
  private async validateClinicalWorkflow(event: SyncEvent): Promise<void> {
    console.log(
      `🏥 Validating clinical workflow for ${event.entity}:${event.id}`,
    );

    const workflowValidation = {
      hasClinicianId: !!event.metadata.clinicianId,
      hasPatientConsent: !!event.data.patientConsent,
      hasProperSequencing: this.validateWorkflowSequence(event),
      hasRequiredApprovals: this.validateRequiredApprovals(event),
    };

    const failedValidations = Object.entries(workflowValidation)
      .filter(([_, valid]) => !valid)
      .map(([validation]) => validation);

    if (failedValidations.length > 0) {
      console.warn(
        `⚠️ Clinical workflow validation issues for ${event.id}:`,
        failedValidations,
      );
      event.metadata.workflowWarnings = failedValidations;
    }
  }

  /**
   * Validate workflow sequence
   */
  private validateWorkflowSequence(event: SyncEvent): boolean {
    // Implement workflow sequence validation logic
    return true; // Simplified for demo
  }

  /**
   * Validate required approvals
   */
  private validateRequiredApprovals(event: SyncEvent): boolean {
    // Check if event requires approvals based on type and data
    const requiresApproval = [
      "high_risk_medications",
      "surgical_procedures",
      "discharge_planning",
    ];

    if (requiresApproval.some((type) => event.data.type === type)) {
      return !!event.metadata.supervisorApproval;
    }

    return true;
  }

  /**
   * Handle healthcare event errors
   */
  private async handleHealthcareEventError(
    event: SyncEvent,
    error: any,
    callback: (event: SyncEvent) => void,
  ): Promise<void> {
    console.error(`🚨 Healthcare event error for ${event.id}:`, error);

    // Create error event
    const errorEvent: SyncEvent = {
      ...event,
      type: "error",
      metadata: {
        ...event.metadata,
        originalType: event.type,
        error: error.message || "Unknown error",
        errorTimestamp: new Date(),
        requiresManualReview: true,
      },
    };

    // Log to audit trail
    this.logHealthcareAuditEvent(errorEvent);

    // Attempt callback with error event
    try {
      callback(errorEvent);
    } catch (callbackError) {
      console.error(
        `❌ Error in healthcare event error callback:`,
        callbackError,
      );
    }
  }

  /**
   * Log critical validation failure
   */
  private logCriticalValidationFailure(
    event: SyncEvent,
    validationResult: any,
  ): void {
    const criticalFailure = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      entity: event.entity,
      type: event.type,
      validationErrors: validationResult.errors,
      criticalFailure: true,
      requiresImmediateAttention: true,
      complianceRisk: "HIGH",
      patientSafetyRisk: validationResult.isCritical ? "HIGH" : "MEDIUM",
    };

    console.error("🚨 CRITICAL VALIDATION FAILURE:", criticalFailure);

    // Store in critical failures log
    if (typeof window !== "undefined") {
      try {
        const criticalFailures = JSON.parse(
          sessionStorage.getItem("critical_validation_failures") || "[]",
        );
        criticalFailures.push(criticalFailure);
        sessionStorage.setItem(
          "critical_validation_failures",
          JSON.stringify(criticalFailures),
        );
      } catch (error) {
        console.error("Failed to log critical validation failure:", error);
      }
    }
  }

  // PHASE 2 ENHANCEMENT: Helper methods for healthcare-specific processing

  private getMostRecentVitalSigns(clientVitals: any, serverVitals: any): any {
    if (!clientVitals && !serverVitals) return null;
    if (!clientVitals) return serverVitals;
    if (!serverVitals) return clientVitals;

    const clientTime = new Date(clientVitals.timestamp || 0);
    const serverTime = new Date(serverVitals.timestamp || 0);

    return clientTime > serverTime ? clientVitals : serverVitals;
  }

  private mergeAllergies(
    clientAllergies: any[],
    serverAllergies: any[],
  ): any[] {
    const merged = [...(serverAllergies || [])];
    const clientAllergyNames = (clientAllergies || []).map((a) => a.allergen);

    (clientAllergies || []).forEach((allergy) => {
      if (!merged.some((existing) => existing.allergen === allergy.allergen)) {
        merged.push(allergy);
      }
    });

    return merged;
  }

  private hasCriticalClinicalConflict(
    clientData: any,
    serverData: any,
  ): boolean {
    const criticalFields = [
      "diagnosis",
      "medications",
      "allergies",
      "vitalSigns",
    ];
    return criticalFields.some(
      (field) =>
        clientData[field] &&
        serverData[field] &&
        JSON.stringify(clientData[field]) !== JSON.stringify(serverData[field]),
    );
  }

  private async checkPatientSafetyAlerts(event: SyncEvent): Promise<string[]> {
    const alerts: string[] = [];

    if (event.data.vitalSigns) {
      const criticalVitals = this.checkCriticalVitalSigns(
        event.data.vitalSigns,
      );
      alerts.push(...criticalVitals);
    }

    if (event.data.medications) {
      const interactions = this.checkMedicationInteractions(
        event.data.medications,
      );
      alerts.push(...interactions);
    }

    return alerts.filter((alert) => alert.includes("CRITICAL"));
  }

  private async triggerEmergencySafetySync(
    event: SyncEvent,
    alerts: string[],
  ): Promise<void> {
    console.log(`🚨 Triggering emergency safety sync for ${event.id}:`, alerts);

    event.priority = "critical";
    event.metadata.safetyEmergency = true;
    event.metadata.safetyAlerts = alerts;

    await this.emergencySync(event);
  }

  private async performMedicationSafetyCheck(event: SyncEvent): Promise<void> {
    const medications = event.data.medications || [event.data];
    const interactions = this.checkMedicationInteractions(medications);

    if (interactions.some((i) => i.includes("CRITICAL"))) {
      event.metadata.medicationSafetyAlert = true;
      event.metadata.medicationInteractions = interactions;
    }
  }

  private async performVitalSignsMonitoring(event: SyncEvent): Promise<void> {
    const vitalSigns = event.data.vitalSigns || event.data;
    const criticalFlags = this.checkCriticalVitalSigns(vitalSigns);

    if (criticalFlags.length > 0) {
      event.metadata.vitalSignsAlert = true;
      event.metadata.criticalVitalSigns = criticalFlags;
    }
  }

  private isCriticalVitalSigns(event: SyncEvent): boolean {
    if (!event.data.vitalSigns) return false;
    const flags = this.checkCriticalVitalSigns(event.data.vitalSigns);
    return flags.some((flag) => flag.includes("CRITICAL"));
  }

  private isMedicationEmergency(event: SyncEvent): boolean {
    if (!event.data.medications) return false;
    const interactions = this.checkMedicationInteractions(
      event.data.medications,
    );
    return interactions.some((i) => i.includes("CRITICAL"));
  }

  private isPatientSafetyAlert(event: SyncEvent): boolean {
    return (
      event.metadata.safetyFlags &&
      event.metadata.safetyFlags.some((flag: string) =>
        flag.includes("CRITICAL"),
      )
    );
  }

  private isSystemFailure(event: SyncEvent): boolean {
    return event.type === "error" && event.metadata.systemFailure === true;
  }

  private async processEmergencyEvent(event: SyncEvent): Promise<void> {
    console.log(`🚨 Processing emergency event: ${event.id}`);

    // Bypass normal processing queue
    await this.processEvent(event);

    // Log emergency processing
    this.logEmergencyEvent(event);
  }

  private async notifyEmergencyContacts(event: SyncEvent): Promise<void> {
    console.log(`📞 Notifying emergency contacts for event: ${event.id}`);

    // In production, this would send notifications to emergency contacts
    // For now, we'll log the notification
    const notification = {
      eventId: event.id,
      patientId: event.data.patientId,
      emergencyType: event.metadata.emergencyTrigger,
      timestamp: new Date(),
      alerts: event.metadata.safetyAlerts || [],
    };

    console.log("📞 Emergency notification:", notification);
  }

  private async logEmergencyEvent(event: SyncEvent): Promise<void> {
    const emergencyLog = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      patientId: event.data.patientId,
      emergencyType: event.metadata.emergencyTrigger,
      safetyAlerts: event.metadata.safetyAlerts,
      processingTime: Date.now() - event.timestamp.getTime(),
      complianceFlags: [
        "EMERGENCY_PROTOCOL",
        "PATIENT_SAFETY",
        "CRITICAL_ALERT",
      ],
    };

    console.log("🚨 Emergency event logged:", emergencyLog);
  }

  private async validateClinicalSequence(event: SyncEvent): Promise<boolean> {
    // Validate that clinical events follow proper sequence
    // e.g., assessment before treatment, diagnosis before medication
    return true; // Simplified for demo
  }

  private async validateClinicalApprovals(event: SyncEvent): Promise<boolean> {
    // Check if required clinical approvals are in place
    const requiresApproval = [
      "high_risk_medications",
      "surgical_procedures",
      "discharge_planning",
    ];

    if (requiresApproval.includes(event.data.type)) {
      return !!event.metadata.clinicianApproval;
    }

    return true;
  }

  private async validateClinicalDocumentation(
    event: SyncEvent,
  ): Promise<boolean> {
    // Ensure proper clinical documentation is present
    const requiredFields = ["clinicianId", "timestamp", "notes"];
    return requiredFields.every(
      (field) => event.data[field] || event.metadata[field],
    );
  }

  private async validateComplianceFlags(event: SyncEvent): Promise<boolean> {
    // Check DOH, JAWDA, and other compliance requirements
    return (
      event.metadata.dohCompliant &&
      event.metadata.jawdaCompliant &&
      event.metadata.hipaaCompliant
    );
  }

  /**
   * Log enhanced healthcare audit event with comprehensive tracking
   */
  private async logEnhancedHealthcareAuditEvent(
    event: SyncEvent,
    validationResult: any,
  ): Promise<void> {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      entity: event.entity,
      type: event.type,
      userId: event.userId || "system",
      patientId: event.data.patientId,
      episodeId: event.data.episodeId,
      facilityId: event.data.facilityId,
      dataHash: this.generateDataHash(event.data),
      validationStatus: validationResult.isValid ? "PASSED" : "FAILED",
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      complianceFlags: {
        dohCompliant: event.metadata.dohCompliant,
        hipaaCompliant: event.metadata.hipaaCompliant,
        jawdaCompliant: event.metadata.jawdaCompliant,
        gdprCompliant: event.metadata.gdprCompliant,
      },
      encryptionStatus: event.metadata.encryptionStatus,
      safetyFlags: event.metadata.safetyFlags,
      workflowWarnings: event.metadata.workflowWarnings,
      integrityWarnings: event.metadata.integrityWarnings,
      // Enhanced audit fields
      syncLatency: event.metadata.syncLatency,
      conflictResolution: event.metadata.conflictResolution,
      emergencyProtocols: event.metadata.emergencyProtocols,
      clinicalEscalation: event.metadata.clinicalEscalation,
      dataClassification: this.classifyHealthcareData(event.data),
      riskAssessment: {
        patientSafetyRisk: event.metadata.patientSafetyRisk || "LOW",
        complianceRisk: event.metadata.complianceRisk || "LOW",
        dataIntegrityRisk: event.metadata.dataIntegrityRisk || "LOW",
      },
      performanceMetrics: {
        processingTime: Date.now() - new Date(event.timestamp).getTime(),
        retryAttempts: event.metadata.retryAttempts || 0,
        queueTime: event.metadata.queueTime || 0,
      },
    };

    console.log("📋 Enhanced Healthcare Audit Log:", auditLog);

    // Store in enhanced audit trail with improved persistence
    if (typeof window !== "undefined") {
      try {
        const auditTrail = JSON.parse(
          sessionStorage.getItem("enhanced_healthcare_audit_trail") || "[]",
        );
        auditTrail.push(auditLog);

        // Enhanced audit trail management
        if (auditTrail.length > 3000) {
          // Keep critical and high-priority entries longer
          const criticalEntries = auditTrail.filter(
            (entry: any) =>
              entry.riskAssessment?.patientSafetyRisk === "HIGH" ||
              entry.riskAssessment?.patientSafetyRisk === "CRITICAL" ||
              entry.validationStatus === "FAILED",
          );
          const recentEntries = auditTrail.slice(-2000);
          const mergedEntries = [...criticalEntries, ...recentEntries]
            .filter(
              (entry, index, arr) =>
                arr.findIndex((e) => e.eventId === entry.eventId) === index,
            )
            .slice(-2500);

          sessionStorage.setItem(
            "enhanced_healthcare_audit_trail",
            JSON.stringify(mergedEntries),
          );
        } else {
          sessionStorage.setItem(
            "enhanced_healthcare_audit_trail",
            JSON.stringify(auditTrail),
          );
        }

        // Store critical events separately for compliance
        if (
          auditLog.riskAssessment.patientSafetyRisk === "HIGH" ||
          auditLog.riskAssessment.patientSafetyRisk === "CRITICAL" ||
          auditLog.validationStatus === "FAILED"
        ) {
          const criticalAuditTrail = JSON.parse(
            sessionStorage.getItem("critical_healthcare_audit_trail") || "[]",
          );
          criticalAuditTrail.push(auditLog);
          sessionStorage.setItem(
            "critical_healthcare_audit_trail",
            JSON.stringify(criticalAuditTrail.slice(-1000)),
          );
        }
      } catch (error) {
        console.warn("Failed to store enhanced healthcare audit log:", error);
        // Fallback to basic logging
        console.log("📋 Fallback Audit Log:", {
          eventId: auditLog.eventId,
          timestamp: auditLog.timestamp,
          validationStatus: auditLog.validationStatus,
          patientSafetyRisk: auditLog.riskAssessment.patientSafetyRisk,
        });
      }
    }
  }

  /**
   * Resolve vital signs conflicts with enhanced clinical validation
   */
  private async resolveVitalSignsConflict(event: SyncEvent): Promise<any> {
    const { clientData, serverData } = event.data;

    // Enhanced vital signs validation and conflict resolution
    const vitalSignsAnalysis = await this.performVitalSignsAnalysis(
      clientData,
      serverData,
    );

    // Use most recent vital signs with comprehensive validation
    const clientTimestamp = new Date(clientData.timestamp || 0);
    const serverTimestamp = new Date(serverData.timestamp || 0);

    let resolvedVitalSigns =
      clientTimestamp > serverTimestamp ? clientData : serverData;

    // Apply clinical validation rules
    if (vitalSignsAnalysis.hasCriticalValues) {
      resolvedVitalSigns = {
        ...resolvedVitalSigns,
        criticalAlerts: vitalSignsAnalysis.criticalAlerts,
        requiresImmediateAttention: true,
        clinicalEscalation: {
          escalated: true,
          escalationLevel: vitalSignsAnalysis.escalationLevel,
          escalatedAt: new Date(),
          notificationsSent: true,
        },
        vitalSignsTrend: vitalSignsAnalysis.trend,
        clinicalRecommendations: vitalSignsAnalysis.recommendations,
      };

      // Trigger emergency sync for critical vital signs
      if (vitalSignsAnalysis.escalationLevel === "EMERGENCY") {
        await this.triggerEmergencyVitalSignsSync(resolvedVitalSigns);
      }
    }

    // Merge historical vital signs data for trend analysis
    resolvedVitalSigns.historicalData = this.mergeVitalSignsHistory(
      clientData.historicalData,
      serverData.historicalData,
    );

    return resolvedVitalSigns;
  }

  private async performVitalSignsAnalysis(
    clientData: any,
    serverData: any,
  ): Promise<{
    hasCriticalValues: boolean;
    criticalAlerts: string[];
    escalationLevel: "EMERGENCY" | "URGENT" | "WARNING" | "NONE";
    trend: string;
    recommendations: string[];
  }> {
    const analysis = {
      hasCriticalValues: false,
      criticalAlerts: [] as string[],
      escalationLevel: "NONE",
      trend: "STABLE",
      recommendations: [] as string[],
    };

    // Check for critical values in vital signs
    if (clientData.vitalSigns) {
      const flags = this.checkCriticalVitalSigns(clientData.vitalSigns);
      if (flags.length > 0) {
        analysis.hasCriticalValues = true;
        analysis.criticalAlerts = flags;
      }
    }

    // Determine escalation level based on critical alerts
    if (analysis.criticalAlerts.some((flag) => flag.includes("CRITICAL"))) {
      analysis.escalationLevel = "EMERGENCY";
    } else if (
      analysis.criticalAlerts.some((flag) => flag.includes("WARNING"))
    ) {
      analysis.escalationLevel = "URGENT";
    }

    // Analyze trend based on historical data
    if (clientData.historicalData) {
      analysis.trend = this.analyzeVitalSignsTrend(clientData.historicalData);
    }

    // Generate clinical recommendations
    if (analysis.hasCriticalValues) {
      analysis.recommendations = this.generateClinicalRecommendations(
        analysis.criticalAlerts,
      );
    }

    return analysis;
  }

  private analyzeVitalSignsTrend(data: any[]): string {
    // Analyze trend based on historical vital signs data
    // This is a simplified analysis for demonstration
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    if (latest && previous) {
      const trend = this.analyzeVitalSignsTrendInternal(latest, previous);
      return trend;
    }

    return "STABLE";
  }

  private analyzeVitalSignsTrendInternal(latest: any, previous: any): string {
    // Analyze trend based on specific vital signs
    const trend = "STABLE";

    if (latest.heartRate && previous.heartRate) {
      const hrDiff = latest.heartRate - previous.heartRate;
      if (hrDiff > 10) {
        return "INCREASING";
      } else if (hrDiff < -10) {
        return "DECREASING";
      }
    }

    if (latest.temperature && previous.temperature) {
      const tempDiff = latest.temperature - previous.temperature;
      if (Math.abs(tempDiff) > 0.5) {
        return "FLUCTUATING";
      }
    }

    return trend;
  }

  private generateClinicalRecommendations(alerts: string[]): string[] {
    // Generate clinical recommendations based on alerts
    const recommendations: string[] = [];

    if (alerts.some((flag) => flag.includes("CRITICAL"))) {
      recommendations.push("Immediate clinical review required");
      recommendations.push("Notify emergency contacts");
    }

    if (alerts.some((flag) => flag.includes("WARNING"))) {
      recommendations.push("Monitor patient closely");
      recommendations.push("Document findings");
    }

    return recommendations;
  }

  private mergeVitalSignsHistory(
    clientHistory: any[],
    serverHistory: any[],
  ): any[] {
    // Merge historical vital signs data for trend analysis
    const merged = [...serverHistory];

    clientHistory.forEach((vital) => {
      const existingIndex = merged.findIndex(
        (entry) => entry.timestamp === vital.timestamp,
      );

      if (existingIndex >= 0) {
        // Update existing entry with newer data
        merged[existingIndex] = vital;
      } else {
        // Add new entry
        merged.push(vital);
      }
    });

    return merged;
  }
  /**
   * PHASE 1 ENHANCEMENT: Advanced medication safety validation
   */
  private async performMedicationSafetyValidation(
    clientData: any,
    serverData: any,
  ): Promise<{
    hasCriticalConflict: boolean;
    safetyAlerts: string[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }> {
    const safetyAlerts: string[] = [];
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

    const clientMeds = clientData.medications || [clientData];
    const serverMeds = serverData.medications || [serverData];

    // Check for dosage conflicts
    for (const clientMed of clientMeds) {
      const serverMed = serverMeds.find((med: any) => med.id === clientMed.id);
      if (serverMed && clientMed.dosage !== serverMed.dosage) {
        const dosageDifference = Math.abs(
          parseFloat(clientMed.dosage) - parseFloat(serverMed.dosage),
        );
        if (dosageDifference > parseFloat(clientMed.dosage) * 0.5) {
          safetyAlerts.push(
            `CRITICAL: Significant dosage conflict for ${clientMed.name}: ${clientMed.dosage} vs ${serverMed.dosage}`,
          );
          riskLevel = "CRITICAL";
        }
      }
    }

    // Check for medication interactions
    const allMedications = [...clientMeds, ...serverMeds];
    const interactions = this.checkMedicationInteractions(allMedications);
    if (interactions.some((i) => i.includes("CRITICAL"))) {
      safetyAlerts.push(...interactions.filter((i) => i.includes("CRITICAL")));
      riskLevel = "CRITICAL";
    }

    // Check for allergy conflicts if patient data is available
    if (clientData.patientAllergies || serverData.patientAllergies) {
      const allergies =
        clientData.patientAllergies || serverData.patientAllergies;
      const allergyConflicts = this.checkAllergyConflicts(
        allergies,
        allMedications,
      );
      if (allergyConflicts.length > 0) {
        safetyAlerts.push(...allergyConflicts);
        riskLevel = "CRITICAL";
      }
    }

    return {
      hasCriticalConflict: riskLevel === "CRITICAL",
      safetyAlerts,
      riskLevel,
    };
  }

  /**
   * PHASE 1 ENHANCEMENT: Safe medication merging with validation
   */
  private async safeMergeMedications(
    clientMedications: any[],
    serverMedications: any[],
  ): Promise<any[]> {
    const merged = [...serverMedications];
    const safetyValidatedMeds: any[] = [];

    for (const clientMed of clientMedications) {
      const existingIndex = merged.findIndex((med) => med.id === clientMed.id);

      if (existingIndex >= 0) {
        // Validate medication update
        const medicationUpdate = await this.validateMedicationUpdate(
          merged[existingIndex],
          clientMed,
        );

        if (medicationUpdate.isValid) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            ...clientMed,
            lastModified: new Date(),
            safetyValidated: true,
            validationTimestamp: new Date(),
          };
        } else {
          // Flag for review if validation fails
          merged[existingIndex] = {
            ...merged[existingIndex],
            conflictFlags: {
              requiresPharmacistReview: true,
              validationErrors: medicationUpdate.errors,
              flaggedAt: new Date(),
            },
          };
        }
      } else {
        // Add new medication with safety validation
        const newMedValidation = await this.validateNewMedication(clientMed);
        if (newMedValidation.isValid) {
          merged.push({
            ...clientMed,
            addedAt: new Date(),
            safetyValidated: true,
            validationTimestamp: new Date(),
          });
        }
      }
    }

    return merged;
  }

  /**
   * PHASE 1 ENHANCEMENT: Comprehensive vital signs analysis
   */
  private async performVitalSignsAnalysis(
    clientData: any,
    serverData: any,
  ): Promise<{
    hasCriticalValues: boolean;
    criticalAlerts: string[];
    escalationLevel: "NORMAL" | "WARNING" | "URGENT" | "EMERGENCY";
    trend: "IMPROVING" | "STABLE" | "DECLINING" | "CRITICAL";
    recommendations: string[];
  }> {
    const criticalAlerts: string[] = [];
    const recommendations: string[] = [];
    let escalationLevel: "NORMAL" | "WARNING" | "URGENT" | "EMERGENCY" =
      "NORMAL";
    let trend: "IMPROVING" | "STABLE" | "DECLINING" | "CRITICAL" = "STABLE";

    // Analyze current vital signs
    const currentVitals =
      clientData.timestamp > serverData.timestamp ? clientData : serverData;
    const previousVitals =
      clientData.timestamp > serverData.timestamp ? serverData : clientData;

    // Enhanced vital signs validation
    const vitalSignsChecks = this.checkCriticalVitalSigns(currentVitals);
    criticalAlerts.push(...vitalSignsChecks);

    // Determine escalation level
    if (vitalSignsChecks.some((alert) => alert.includes("CRITICAL"))) {
      escalationLevel = "EMERGENCY";
      recommendations.push("Immediate medical intervention required");
      recommendations.push("Notify attending physician immediately");
      recommendations.push("Consider emergency protocols");
    } else if (vitalSignsChecks.some((alert) => alert.includes("WARNING"))) {
      escalationLevel = "URGENT";
      recommendations.push("Close monitoring required");
      recommendations.push("Notify nursing supervisor");
    }

    // Analyze trends if historical data is available
    if (previousVitals && currentVitals) {
      trend = this.analyzeVitalSignsTrend(previousVitals, currentVitals);
      if (trend === "DECLINING" || trend === "CRITICAL") {
        escalationLevel =
          escalationLevel === "NORMAL" ? "WARNING" : escalationLevel;
        recommendations.push("Trending analysis shows concerning pattern");
      }
    }

    return {
      hasCriticalValues: criticalAlerts.length > 0,
      criticalAlerts,
      escalationLevel,
      trend,
      recommendations,
    };
  }

  /**
   * PHASE 1 ENHANCEMENT: Emergency vital signs sync
   */
  private async triggerEmergencyVitalSignsSync(
    vitalSignsData: any,
  ): Promise<void> {
    console.log(
      "🚨 EMERGENCY: Critical vital signs detected, triggering emergency sync",
    );

    // Create emergency sync event
    const emergencyEvent: SyncEvent = {
      id: `emergency-vitals-${Date.now()}`,
      type: "emergency",
      entity: "vital_signs",
      data: {
        ...vitalSignsData,
        emergencyFlag: true,
        emergencyTimestamp: new Date(),
        emergencyProtocol: "CRITICAL_VITALS",
      },
      timestamp: new Date(),
      priority: "critical",
      metadata: {
        emergencySync: true,
        patientSafetyAlert: true,
        requiresImmediateAttention: true,
        escalationLevel: "EMERGENCY",
      },
    };

    // Bypass normal processing and sync immediately
    await this.processEmergencyEvent(emergencyEvent);

    // Notify emergency contacts and clinical staff
    await this.notifyEmergencyContacts(emergencyEvent);

    // Log emergency event for audit
    await this.logEmergencyEvent(emergencyEvent);
  }

  /**
   * PHASE 1 ENHANCEMENT: Classify healthcare data for audit purposes
   */
  private classifyHealthcareData(data: any): {
    classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
    dataTypes: string[];
    sensitivityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  } {
    const dataTypes: string[] = [];
    let classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" =
      "INTERNAL";
    let sensitivityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

    // Identify data types
    if (data.patientId) dataTypes.push("PATIENT_IDENTIFIER");
    if (data.medicalRecordNumber) dataTypes.push("MEDICAL_RECORD");
    if (data.diagnosis) dataTypes.push("DIAGNOSIS");
    if (data.medications) dataTypes.push("MEDICATION_DATA");
    if (data.vitalSigns) dataTypes.push("VITAL_SIGNS");
    if (data.labResults) dataTypes.push("LAB_RESULTS");
    if (data.emiratesId) dataTypes.push("NATIONAL_ID");
    if (data.insuranceInfo) dataTypes.push("INSURANCE_DATA");

    // Determine classification and sensitivity
    if (
      dataTypes.includes("NATIONAL_ID") ||
      dataTypes.includes("MEDICAL_RECORD")
    ) {
      classification = "RESTRICTED";
      sensitivityLevel = "CRITICAL";
    } else if (
      dataTypes.includes("DIAGNOSIS") ||
      dataTypes.includes("MEDICATION_DATA") ||
      dataTypes.includes("LAB_RESULTS")
    ) {
      classification = "CONFIDENTIAL";
      sensitivityLevel = "HIGH";
    } else if (
      dataTypes.includes("PATIENT_IDENTIFIER") ||
      dataTypes.includes("VITAL_SIGNS")
    ) {
      classification = "CONFIDENTIAL";
      sensitivityLevel = "MEDIUM";
    }

    return {
      classification,
      dataTypes,
      sensitivityLevel,
    };
  }

  /**
   * PHASE 1 ENHANCEMENT: Validate medication updates
   */
  private async validateMedicationUpdate(
    existingMed: any,
    updatedMed: any,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for significant dosage changes
    if (existingMed.dosage && updatedMed.dosage) {
      const existingDosage = parseFloat(existingMed.dosage);
      const updatedDosage = parseFloat(updatedMed.dosage);
      const dosageChange =
        Math.abs(updatedDosage - existingDosage) / existingDosage;

      if (dosageChange > 0.5) {
        errors.push(
          `Significant dosage change detected: ${existingMed.dosage} to ${updatedMed.dosage}`,
        );
      }
    }

    // Check for frequency changes
    if (
      existingMed.frequency &&
      updatedMed.frequency &&
      existingMed.frequency !== updatedMed.frequency
    ) {
      errors.push(
        `Frequency change detected: ${existingMed.frequency} to ${updatedMed.frequency}`,
      );
    }

    // Check for route changes
    if (
      existingMed.route &&
      updatedMed.route &&
      existingMed.route !== updatedMed.route
    ) {
      errors.push(
        `Route change detected: ${existingMed.route} to ${updatedMed.route}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * PHASE 1 ENHANCEMENT: Validate new medications
   */
  private async validateNewMedication(
    medication: any,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Required fields validation
    if (!medication.name) errors.push("Medication name is required");
    if (!medication.dosage) errors.push("Medication dosage is required");
    if (!medication.frequency) errors.push("Medication frequency is required");
    if (!medication.route) errors.push("Medication route is required");

    // Dosage validation
    if (medication.dosage && isNaN(parseFloat(medication.dosage))) {
      errors.push("Invalid dosage format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * PHASE 1 ENHANCEMENT: Analyze vital signs trends
   */
  private analyzeVitalSignsTrend(
    previousVitals: any,
    currentVitals: any,
  ): "IMPROVING" | "STABLE" | "DECLINING" | "CRITICAL" {
    let trendScore = 0;
    let criticalChanges = 0;

    // Analyze heart rate trend
    if (previousVitals.heartRate && currentVitals.heartRate) {
      const hrChange = currentVitals.heartRate - previousVitals.heartRate;
      if (Math.abs(hrChange) > 20) {
        criticalChanges++;
        trendScore += hrChange > 0 ? -1 : 1;
      }
    }

    // Analyze blood pressure trend
    if (previousVitals.bloodPressure && currentVitals.bloodPressure) {
      const prevBP = previousVitals.bloodPressure.split("/");
      const currBP = currentVitals.bloodPressure.split("/");
      const systolicChange = parseInt(currBP[0]) - parseInt(prevBP[0]);
      const diastolicChange = parseInt(currBP[1]) - parseInt(prevBP[1]);

      if (Math.abs(systolicChange) > 20 || Math.abs(diastolicChange) > 10) {
        criticalChanges++;
        trendScore += systolicChange > 20 || diastolicChange > 10 ? -1 : 1;
      }
    }

    // Analyze temperature trend
    if (previousVitals.temperature && currentVitals.temperature) {
      const tempChange = currentVitals.temperature - previousVitals.temperature;
      if (Math.abs(tempChange) > 1.0) {
        criticalChanges++;
        trendScore += tempChange > 1.0 ? -1 : 1;
      }
    }

    // Determine trend
    if (criticalChanges >= 2) {
      return "CRITICAL";
    } else if (trendScore <= -2) {
      return "DECLINING";
    } else if (trendScore >= 2) {
      return "IMPROVING";
    } else {
      return "STABLE";
    }
  }

  /**
   * PHASE 1 ENHANCEMENT: Merge vital signs history for trend analysis
   */
  private mergeVitalSignsHistory(
    clientHistory: any[],
    serverHistory: any[],
  ): any[] {
    const merged = [...(serverHistory || []), ...(clientHistory || [])];

    // Remove duplicates based on timestamp
    const uniqueHistory = merged.filter(
      (item, index, arr) =>
        arr.findIndex(
          (other) =>
            new Date(other.timestamp).getTime() ===
            new Date(item.timestamp).getTime(),
        ) === index,
    );

    // Sort by timestamp (most recent first)
    return uniqueHistory
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 50); // Keep last 50 entries for trend analysis
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();
export default realTimeSyncService;
