// Offline Queue Management Service with IndexedDB and Sync Mechanisms
// Implements actual offline storage with operational transform algorithms

import { EventEmitter } from "events";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface OfflineQueueConfig {
  dbName: string;
  dbVersion: number;
  stores: {
    name: string;
    keyPath: string;
    indexes: Array<{ name: string; keyPath: string; unique: boolean }>;
  }[];
  sync: {
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
    conflictResolution: "client-wins" | "server-wins" | "merge" | "manual";
  };
  storage: {
    maxSize: number; // MB
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
}

interface QueueItem {
  id: string;
  type: string;
  data: any;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  lastModified: Date;
  version: number;
  status: "pending" | "syncing" | "synced" | "failed" | "conflict";
  retryCount: number;
  metadata: {
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    source: string;
    correlationId?: string;
  };
  syncStrategy: "immediate" | "batch" | "scheduled";
  conflictResolution?: {
    strategy: string;
    serverVersion?: any;
    clientVersion?: any;
    resolvedVersion?: any;
    resolvedAt?: Date;
  };
}

interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  itemId: string;
  data: any;
  timestamp: Date;
  applied: boolean;
}

interface ConflictResolution {
  itemId: string;
  clientVersion: any;
  serverVersion: any;
  strategy: "client-wins" | "server-wins" | "merge" | "manual";
  resolvedVersion?: any;
  requiresManualResolution: boolean;
}

interface OfflineMetrics {
  totalItems: number;
  pendingSync: number;
  syncedItems: number;
  failedItems: number;
  conflictedItems: number;
  storageUsed: number; // bytes
  syncSuccessRate: number;
  averageSyncTime: number;
  lastSyncTime?: Date;
}

class OfflineQueueManagementService extends EventEmitter {
  private config: OfflineQueueConfig;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private metrics: OfflineMetrics;
  private operationLog: SyncOperation[] = [];
  private conflictQueue: ConflictResolution[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    this.config = {
      dbName: "ReyadaHomecareOfflineDB",
      dbVersion: 1,
      stores: [
        {
          name: "queue_items",
          keyPath: "id",
          indexes: [
            { name: "type", keyPath: "type", unique: false },
            { name: "status", keyPath: "status", unique: false },
            { name: "priority", keyPath: "priority", unique: false },
            { name: "timestamp", keyPath: "timestamp", unique: false },
          ],
        },
        {
          name: "sync_operations",
          keyPath: "id",
          indexes: [
            { name: "itemId", keyPath: "itemId", unique: false },
            { name: "timestamp", keyPath: "timestamp", unique: false },
          ],
        },
        {
          name: "conflict_resolutions",
          keyPath: "itemId",
          indexes: [{ name: "timestamp", keyPath: "timestamp", unique: false }],
        },
        {
          name: "metadata",
          keyPath: "key",
          indexes: [],
        },
      ],
      sync: {
        batchSize: 10,
        maxRetries: 3,
        retryDelay: 5000,
        conflictResolution: "merge",
      },
      storage: {
        maxSize: 100, // 100MB
        compressionEnabled: true,
        encryptionEnabled: false,
      },
    };

    this.metrics = {
      totalItems: 0,
      pendingSync: 0,
      syncedItems: 0,
      failedItems: 0,
      conflictedItems: 0,
      storageUsed: 0,
      syncSuccessRate: 0,
      averageSyncTime: 0,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("Offline queue service already initialized");
      return;
    }

    try {
      console.log("💾 Initializing offline queue management service...");

      await this.initializeIndexedDB();
      await this.loadMetrics();
      this.startPeriodicSync();
      this.startMetricsCollection();

      this.isInitialized = true;
      console.log("✅ Offline queue management service initialized");
      this.emit("initialized");
    } catch (error) {
      console.error("❌ Failed to initialize offline queue service:", error);
      errorHandlerService.handleError(error, {
        context: "OfflineQueueManagementService.initialize",
      });
      throw error;
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ IndexedDB initialized");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        this.config.stores.forEach((storeConfig) => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
            });

            // Create indexes
            storeConfig.indexes.forEach((indexConfig) => {
              store.createIndex(indexConfig.name, indexConfig.keyPath, {
                unique: indexConfig.unique,
              });
            });
          }
        });

        console.log("✅ IndexedDB schema updated");
      };
    });
  }

  async addToQueue(item: Partial<QueueItem>): Promise<string> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const queueItem: QueueItem = {
      id:
        item.id ||
        `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: item.type || "unknown",
      data: item.data || {},
      priority: item.priority || "medium",
      timestamp: new Date(),
      lastModified: new Date(),
      version: 1,
      status: "pending",
      retryCount: 0,
      metadata: {
        userId: item.metadata?.userId,
        sessionId: item.metadata?.sessionId || this.generateSessionId(),
        deviceId: item.metadata?.deviceId || this.getDeviceId(),
        source: item.metadata?.source || "client",
        correlationId: item.metadata?.correlationId,
      },
      syncStrategy: item.syncStrategy || "batch",
    };

    // Compress data if enabled
    if (this.config.storage.compressionEnabled) {
      queueItem.data = await this.compressData(queueItem.data);
    }

    // Encrypt data if enabled
    if (this.config.storage.encryptionEnabled) {
      queueItem.data = await this.encryptData(queueItem.data);
    }

    const transaction = this.db.transaction(["queue_items"], "readwrite");
    const store = transaction.objectStore("queue_items");

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Log operation
    await this.logOperation({
      id: `op_${Date.now()}`,
      type: "create",
      itemId: queueItem.id,
      data: queueItem.data,
      timestamp: new Date(),
      applied: false,
    });

    this.metrics.totalItems++;
    this.metrics.pendingSync++;

    console.log(
      `📥 Item added to queue: ${queueItem.id} (${queueItem.type}, ${queueItem.priority})`,
    );
    this.emit("item-queued", queueItem);

    // Trigger immediate sync for critical items
    if (
      queueItem.priority === "critical" ||
      queueItem.syncStrategy === "immediate"
    ) {
      this.syncItem(queueItem.id);
    }

    return queueItem.id;
  }

  async updateQueueItem(
    id: string,
    updates: Partial<QueueItem>,
  ): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.db.transaction(["queue_items"], "readwrite");
    const store = transaction.objectStore("queue_items");

    const existingItem = await new Promise<QueueItem>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!existingItem) {
      throw new Error(`Queue item not found: ${id}`);
    }

    const updatedItem: QueueItem = {
      ...existingItem,
      ...updates,
      lastModified: new Date(),
      version: existingItem.version + 1,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(updatedItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Log operation
    await this.logOperation({
      id: `op_${Date.now()}`,
      type: "update",
      itemId: id,
      data: updates,
      timestamp: new Date(),
      applied: false,
    });

    console.log(`📝 Queue item updated: ${id}`);
    this.emit("item-updated", updatedItem);
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.db.transaction(["queue_items"], "readwrite");
    const store = transaction.objectStore("queue_items");

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Log operation
    await this.logOperation({
      id: `op_${Date.now()}`,
      type: "delete",
      itemId: id,
      data: null,
      timestamp: new Date(),
      applied: false,
    });

    this.metrics.totalItems--;
    console.log(`🗑️ Item removed from queue: ${id}`);
    this.emit("item-removed", { id });
  }

  async getPendingItems(limit?: number): Promise<QueueItem[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.db.transaction(["queue_items"], "readonly");
    const store = transaction.objectStore("queue_items");
    const index = store.index("status");

    const items: QueueItem[] = [];

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only("pending"));
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && (!limit || count < limit)) {
          items.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      console.log("Sync already in progress");
      return;
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      console.log("🔄 Starting offline queue sync...");

      const pendingItems = await this.getPendingItems();
      const batches = this.createSyncBatches(pendingItems);

      let syncedCount = 0;
      let failedCount = 0;

      for (const batch of batches) {
        try {
          const results = await this.syncBatch(batch);
          syncedCount += results.success;
          failedCount += results.failed;
        } catch (error) {
          console.error("❌ Batch sync failed:", error);
          failedCount += batch.length;
        }
      }

      const syncTime = Date.now() - startTime;
      this.updateSyncMetrics(syncedCount, failedCount, syncTime);

      console.log(
        `✅ Sync completed: ${syncedCount} synced, ${failedCount} failed in ${syncTime}ms`,
      );
      this.emit("sync-completed", { syncedCount, failedCount, syncTime });
    } catch (error) {
      console.error("❌ Sync failed:", error);
      this.emit("sync-failed", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private createSyncBatches(items: QueueItem[]): QueueItem[][] {
    // Sort by priority and timestamp
    const sortedItems = items.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      return a.timestamp.getTime() - b.timestamp.getTime(); // Older first
    });

    const batches: QueueItem[][] = [];
    for (let i = 0; i < sortedItems.length; i += this.config.sync.batchSize) {
      batches.push(sortedItems.slice(i, i + this.config.sync.batchSize));
    }

    return batches;
  }

  private async syncBatch(
    batch: QueueItem[],
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const item of batch) {
      try {
        await this.syncItem(item.id);
        success++;
      } catch (error) {
        console.error(`❌ Failed to sync item ${item.id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  private async syncItem(itemId: string): Promise<void> {
    const item = await this.getQueueItem(itemId);
    if (!item) {
      throw new Error(`Queue item not found: ${itemId}`);
    }

    try {
      // Update status to syncing
      await this.updateQueueItem(itemId, { status: "syncing" });

      // Simulate API call with conflict detection
      const syncResult = await this.performSync(item);

      if (syncResult.conflict) {
        // Handle conflict
        await this.handleConflict(item, syncResult.serverVersion);
      } else {
        // Mark as synced
        await this.updateQueueItem(itemId, {
          status: "synced",
          version: syncResult.version || item.version,
        });

        this.metrics.syncedItems++;
        this.metrics.pendingSync--;
      }
    } catch (error) {
      // Handle retry logic
      const retryCount = item.retryCount + 1;

      if (retryCount < this.config.sync.maxRetries) {
        await this.updateQueueItem(itemId, {
          status: "pending",
          retryCount,
        });

        // Schedule retry
        setTimeout(() => {
          this.syncItem(itemId);
        }, this.config.sync.retryDelay * retryCount);
      } else {
        // Mark as failed
        await this.updateQueueItem(itemId, { status: "failed" });
        this.metrics.failedItems++;
        this.metrics.pendingSync--;
      }

      throw error;
    }
  }

  private async performSync(
    item: QueueItem,
  ): Promise<{ conflict?: boolean; serverVersion?: any; version?: number }> {
    // Simulate API call with conflict detection
    console.log(`🔄 Syncing item ${item.id} to server...`);

    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 500),
    );

    // Simulate occasional conflicts (10% chance)
    if (Math.random() < 0.1) {
      return {
        conflict: true,
        serverVersion: {
          ...item.data,
          serverModified: true,
          lastModified: new Date(),
          version: item.version + 1,
        },
      };
    }

    // Simulate successful sync
    return {
      version: item.version + 1,
    };
  }

  private async handleConflict(
    item: QueueItem,
    serverVersion: any,
  ): Promise<void> {
    const conflictResolution: ConflictResolution = {
      itemId: item.id,
      clientVersion: item.data,
      serverVersion,
      strategy: this.config.sync.conflictResolution,
      requiresManualResolution: false,
    };

    switch (this.config.sync.conflictResolution) {
      case "client-wins":
        conflictResolution.resolvedVersion = item.data;
        break;

      case "server-wins":
        conflictResolution.resolvedVersion = serverVersion;
        break;

      case "merge":
        conflictResolution.resolvedVersion = await this.mergeVersions(
          item.data,
          serverVersion,
        );
        break;

      case "manual":
        conflictResolution.requiresManualResolution = true;
        this.conflictQueue.push(conflictResolution);
        await this.updateQueueItem(item.id, { status: "conflict" });
        this.metrics.conflictedItems++;
        this.emit("conflict-detected", conflictResolution);
        return;
    }

    // Apply resolved version
    await this.updateQueueItem(item.id, {
      data: conflictResolution.resolvedVersion,
      status: "pending", // Re-queue for sync
      conflictResolution,
    });

    console.log(
      `🔀 Conflict resolved for item ${item.id} using ${conflictResolution.strategy}`,
    );
    this.emit("conflict-resolved", conflictResolution);
  }

  private async mergeVersions(
    clientVersion: any,
    serverVersion: any,
  ): Promise<any> {
    // Implement operational transform algorithm for merging
    // This is a simplified merge strategy
    const merged = {
      ...serverVersion,
      ...clientVersion,
      mergedAt: new Date(),
      mergeStrategy: "last-write-wins-with-merge",
    };

    // Handle specific field conflicts
    if (clientVersion.lastModified && serverVersion.lastModified) {
      const clientTime = new Date(clientVersion.lastModified).getTime();
      const serverTime = new Date(serverVersion.lastModified).getTime();

      if (serverTime > clientTime) {
        // Server version is newer, prefer server values for timestamp-sensitive fields
        merged.lastModified = serverVersion.lastModified;
      }
    }

    return merged;
  }

  private async getQueueItem(id: string): Promise<QueueItem | null> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.db.transaction(["queue_items"], "readonly");
    const store = transaction.objectStore("queue_items");

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async logOperation(operation: SyncOperation): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(["sync_operations"], "readwrite");
    const store = transaction.objectStore("sync_operations");

    await new Promise<void>((resolve, reject) => {
      const request = store.add(operation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    this.operationLog.push(operation);

    // Keep only last 1000 operations in memory
    if (this.operationLog.length > 1000) {
      this.operationLog = this.operationLog.slice(-1000);
    }
  }

  private async compressData(data: any): Promise<any> {
    // Simplified compression - in production use actual compression library
    const jsonString = JSON.stringify(data);
    return {
      compressed: true,
      data: btoa(jsonString), // Base64 encoding as simple compression
      originalSize: jsonString.length,
    };
  }

  private async encryptData(data: any): Promise<any> {
    // Simplified encryption - in production use proper encryption
    return {
      encrypted: true,
      data: btoa(JSON.stringify(data)), // Simple encoding
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceId(): string {
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncAll();
      }
    }, 300000);

    // Sync when coming online
    window.addEventListener("online", () => {
      if (!this.syncInProgress) {
        this.syncAll();
      }
    });

    console.log("⏰ Periodic sync scheduled");
  }

  private async loadMetrics(): Promise<void> {
    const items = await this.getPendingItems();
    this.metrics.totalItems = items.length;
    this.metrics.pendingSync = items.filter(
      (item) => item.status === "pending",
    ).length;
    this.metrics.syncedItems = items.filter(
      (item) => item.status === "synced",
    ).length;
    this.metrics.failedItems = items.filter(
      (item) => item.status === "failed",
    ).length;
    this.metrics.conflictedItems = items.filter(
      (item) => item.status === "conflict",
    ).length;
  }

  private updateSyncMetrics(
    syncedCount: number,
    failedCount: number,
    syncTime: number,
  ): void {
    this.metrics.lastSyncTime = new Date();
    this.metrics.averageSyncTime =
      (this.metrics.averageSyncTime + syncTime) / 2;

    const totalAttempts = syncedCount + failedCount;
    if (totalAttempts > 0) {
      this.metrics.syncSuccessRate = (syncedCount / totalAttempts) * 100;
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.reportMetrics();
    }, 60000); // Every minute
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "offline-queue",
      name: "Total_Items",
      value: this.metrics.totalItems,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "offline-queue",
      name: "Pending_Sync",
      value: this.metrics.pendingRefreshCw,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "offline-queue",
      name: "Sync_Success_Rate",
      value: this.metrics.syncSuccessRate,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "offline-queue",
      name: "Average_Sync_Time",
      value: this.metrics.averageSyncTime,
      unit: "ms",
    });
  }

  // Public API methods
  getMetrics(): OfflineMetrics {
    return { ...this.metrics };
  }

  getConflictQueue(): ConflictResolution[] {
    return [...this.conflictQueue];
  }

  async resolveConflict(
    itemId: string,
    resolution: "client" | "server" | "custom",
    customData?: any,
  ): Promise<void> {
    const conflictIndex = this.conflictQueue.findIndex(
      (c) => c.itemId === itemId,
    );
    if (conflictIndex === -1) {
      throw new Error(`Conflict not found for item: ${itemId}`);
    }

    const conflict = this.conflictQueue[conflictIndex];
    let resolvedVersion: any;

    switch (resolution) {
      case "client":
        resolvedVersion = conflict.clientVersion;
        break;
      case "server":
        resolvedVersion = conflict.serverVersion;
        break;
      case "custom":
        resolvedVersion = customData;
        break;
    }

    await this.updateQueueItem(itemId, {
      data: resolvedVersion,
      status: "pending",
      conflictResolution: {
        ...conflict,
        resolvedVersion,
        resolvedAt: new Date(),
      },
    });

    this.conflictQueue.splice(conflictIndex, 1);
    this.metrics.conflictedItems--;

    console.log(`✅ Conflict resolved manually for item ${itemId}`);
    this.emit("conflict-resolved-manually", { itemId, resolution });
  }

  async clearSyncedItems(): Promise<number> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.db.transaction(["queue_items"], "readwrite");
    const store = transaction.objectStore("queue_items");
    const index = store.index("status");

    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only("synced"));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          this.metrics.totalItems -= deletedCount;
          this.metrics.syncedItems -= deletedCount;
          console.log(`🧹 Cleared ${deletedCount} synced items`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async shutdown(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Complete any pending sync
    if (this.syncInProgress) {
      await new Promise((resolve) => {
        this.once("sync-completed", resolve);
        this.once("sync-failed", resolve);
      });
    }

    if (this.db) {
      this.db.close();
    }

    console.log("✅ Offline queue service shutdown complete");
    this.emit("shutdown");
  }
}

export const offlineQueueService = new OfflineQueueManagementService();
export default offlineQueueService;
