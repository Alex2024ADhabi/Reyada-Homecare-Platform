/**
 * Signature Real-time Synchronization Service
 * Advanced real-time sync with conflict resolution and offline capabilities
 */

import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";

export interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  entityType: "signature" | "workflow" | "document";
  entityId: string;
  data: any;
  timestamp: string;
  userId: string;
  version: number;
  checksum: string;
  dependencies?: string[];
}

export interface SyncConflict {
  id: string;
  operationId: string;
  conflictType: "version" | "concurrent" | "dependency" | "data";
  localOperation: SyncOperation;
  remoteOperation: SyncOperation;
  resolution?: "local" | "remote" | "merge" | "manual";
  resolvedData?: any;
  timestamp: string;
}

export interface SyncState {
  entityId: string;
  entityType: string;
  version: number;
  lastSync: string;
  checksum: string;
  pendingOperations: string[];
  conflicts: string[];
  status: "synced" | "pending" | "conflict" | "error";
}

export interface OfflineQueueItem {
  id: string;
  operation: SyncOperation;
  retryCount: number;
  lastAttempt: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "syncing" | "failed" | "completed";
}

export interface SyncConfiguration {
  syncInterval: number;
  maxRetries: number;
  conflictResolutionStrategy: "auto" | "manual" | "last-write-wins";
  offlineQueueSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

class SignatureRealtimeSyncService {
  private syncStates: Map<string, SyncState> = new Map();
  private pendingOperations: Map<string, SyncOperation> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private offlineQueue: Map<string, OfflineQueueItem> = new Map();
  private websocket: WebSocket | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncTimer: NodeJS.Timeout | null = null;
  private configuration: SyncConfiguration = {
    syncInterval: 5000, // 5 seconds
    maxRetries: 3,
    conflictResolutionStrategy: "auto",
    offlineQueueSize: 1000,
    compressionEnabled: true,
    encryptionEnabled: true,
  };

  constructor() {
    this.initializeSync();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private initializeSync(): void {
    // Initialize IndexedDB for offline storage
    this.initializeOfflineStorage();

    // Load pending operations from storage
    this.loadOfflineQueue();

    // Connect to real-time sync server
    this.connectWebSocket();
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.onConnectionRestored();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.onConnectionLost();
    });

    // Page visibility for sync optimization
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.triggerSync();
      }
    });

    // Before unload - save pending operations
    window.addEventListener("beforeunload", () => {
      this.saveOfflineQueue();
    });
  }

  /**
   * Queue operation for synchronization
   */
  public async queueOperation(
    type: SyncOperation["type"],
    entityType: SyncOperation["entityType"],
    entityId: string,
    data: any,
    userId: string,
    priority: OfflineQueueItem["priority"] = "medium",
  ): Promise<string> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Get current version
    const currentState = this.syncStates.get(entityId);
    const version = currentState ? currentState.version + 1 : 1;

    // Calculate checksum
    const checksum = await this.calculateChecksum(data);

    const operation: SyncOperation = {
      id: operationId,
      type,
      entityType,
      entityId,
      data,
      timestamp,
      userId,
      version,
      checksum,
    };

    // Add to pending operations
    this.pendingOperations.set(operationId, operation);

    // Add to offline queue
    const queueItem: OfflineQueueItem = {
      id: operationId,
      operation,
      retryCount: 0,
      lastAttempt: timestamp,
      priority,
      status: "pending",
    };

    this.offlineQueue.set(operationId, queueItem);

    // Update sync state
    this.updateSyncState(entityId, entityType, version, checksum);

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncOperation(operationId);
    }

    return operationId;
  }

  /**
   * Sync specific operation
   */
  private async syncOperation(operationId: string): Promise<boolean> {
    const queueItem = this.offlineQueue.get(operationId);
    if (!queueItem || queueItem.status === "completed") {
      return true;
    }

    queueItem.status = "syncing";
    queueItem.lastAttempt = new Date().toISOString();

    try {
      const result = await this.sendToServer(queueItem.operation);

      if (result.success) {
        queueItem.status = "completed";
        this.pendingOperations.delete(operationId);
        this.offlineQueue.delete(operationId);

        // Update sync state
        const state = this.syncStates.get(queueItem.operation.entityId);
        if (state) {
          state.status = "synced";
          state.lastSync = new Date().toISOString();
          state.pendingOperations = state.pendingOperations.filter(
            (id) => id !== operationId,
          );
        }

        return true;
      } else if (result.conflict) {
        // Handle conflict
        await this.handleConflict(queueItem.operation, result.conflictData);
        return false;
      } else {
        throw new Error(result.error || "Sync failed");
      }
    } catch (error) {
      queueItem.status = "failed";
      queueItem.retryCount++;

      if (queueItem.retryCount >= this.configuration.maxRetries) {
        console.error(
          `Operation ${operationId} failed after ${this.configuration.maxRetries} retries:`,
          error,
        );
        // Move to failed operations for manual review
        this.handleFailedOperation(queueItem);
      } else {
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, queueItem.retryCount) * 1000;
        setTimeout(() => this.syncOperation(operationId), delay);
      }

      return false;
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(
    localOperation: SyncOperation,
    remoteOperation: SyncOperation,
  ): Promise<void> {
    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const conflict: SyncConflict = {
      id: conflictId,
      operationId: localOperation.id,
      conflictType: this.determineConflictType(localOperation, remoteOperation),
      localOperation,
      remoteOperation,
      timestamp: new Date().toISOString(),
    };

    this.conflicts.set(conflictId, conflict);

    // Update sync state
    const state = this.syncStates.get(localOperation.entityId);
    if (state) {
      state.status = "conflict";
      state.conflicts.push(conflictId);
    }

    // Attempt automatic resolution
    if (this.configuration.conflictResolutionStrategy === "auto") {
      const resolved = await this.autoResolveConflict(conflict);
      if (resolved) {
        return;
      }
    }

    // Emit conflict event for manual resolution
    this.emitConflictEvent(conflict);
  }

  /**
   * Auto-resolve conflicts when possible
   */
  private async autoResolveConflict(conflict: SyncConflict): Promise<boolean> {
    try {
      let resolution: SyncConflict["resolution"];
      let resolvedData: any;

      switch (conflict.conflictType) {
        case "version":
          // Use last-write-wins for version conflicts
          if (
            new Date(conflict.localOperation.timestamp) >
            new Date(conflict.remoteOperation.timestamp)
          ) {
            resolution = "local";
            resolvedData = conflict.localOperation.data;
          } else {
            resolution = "remote";
            resolvedData = conflict.remoteOperation.data;
          }
          break;

        case "concurrent":
          // Attempt to merge concurrent changes
          resolvedData = await this.mergeOperations(
            conflict.localOperation,
            conflict.remoteOperation,
          );
          if (resolvedData) {
            resolution = "merge";
          } else {
            return false; // Cannot auto-resolve
          }
          break;

        case "data":
          // Use checksum to determine which data is more recent
          if (
            conflict.localOperation.checksum !==
            conflict.remoteOperation.checksum
          ) {
            resolution = "remote"; // Prefer server data for data conflicts
            resolvedData = conflict.remoteOperation.data;
          } else {
            resolution = "local";
            resolvedData = conflict.localOperation.data;
          }
          break;

        default:
          return false; // Cannot auto-resolve
      }

      // Apply resolution
      conflict.resolution = resolution;
      conflict.resolvedData = resolvedData;

      await this.applyConflictResolution(conflict);
      return true;
    } catch (error) {
      console.error("Auto-resolution failed:", error);
      return false;
    }
  }

  /**
   * Merge two operations when possible
   */
  private async mergeOperations(
    localOp: SyncOperation,
    remoteOp: SyncOperation,
  ): Promise<any | null> {
    if (
      localOp.entityType === "signature" &&
      remoteOp.entityType === "signature"
    ) {
      // For signatures, we generally cannot merge - they are atomic
      return null;
    }

    if (
      localOp.entityType === "workflow" &&
      remoteOp.entityType === "workflow"
    ) {
      // For workflows, we can merge non-conflicting changes
      const localData = localOp.data as WorkflowInstance;
      const remoteData = remoteOp.data as WorkflowInstance;

      // Merge signatures arrays
      const mergedSignatures = [...localData.signatures];
      remoteData.signatures.forEach((remoteSig) => {
        if (
          !mergedSignatures.find(
            (localSig) => localSig.signatureId === remoteSig.signatureId,
          )
        ) {
          mergedSignatures.push(remoteSig);
        }
      });

      // Merge audit trails
      const mergedAuditTrail = [
        ...localData.auditTrail,
        ...remoteData.auditTrail,
      ].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Use the most recent status and metadata
      const useLocal =
        new Date(localData.updatedAt) > new Date(remoteData.updatedAt);

      return {
        ...remoteData,
        ...(useLocal
          ? {
              status: localData.status,
              currentStep: localData.currentStep,
              completedSteps: localData.completedSteps,
              pendingSteps: localData.pendingSteps,
              metadata: localData.metadata,
            }
          : {}),
        signatures: mergedSignatures,
        auditTrail: mergedAuditTrail,
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(conflict: SyncConflict): Promise<void> {
    const { resolution, resolvedData } = conflict;
    if (!resolution || !resolvedData) return;

    // Update local data
    await this.updateLocalData(conflict.localOperation.entityId, resolvedData);

    // Create new operation with resolved data
    const resolvedOperation: SyncOperation = {
      ...conflict.localOperation,
      id: `resolved_${conflict.localOperation.id}`,
      data: resolvedData,
      timestamp: new Date().toISOString(),
      version:
        Math.max(
          conflict.localOperation.version,
          conflict.remoteOperation.version,
        ) + 1,
      checksum: await this.calculateChecksum(resolvedData),
    };

    // Queue resolved operation
    this.pendingOperations.set(resolvedOperation.id, resolvedOperation);

    // Update sync state
    const state = this.syncStates.get(conflict.localOperation.entityId);
    if (state) {
      state.status = "synced";
      state.conflicts = state.conflicts.filter((id) => id !== conflict.id);
      state.version = resolvedOperation.version;
      state.checksum = resolvedOperation.checksum;
    }

    // Remove original conflict
    this.conflicts.delete(conflict.id);

    // Emit resolution event
    this.emitResolutionEvent(conflict);
  }

  /**
   * Manual conflict resolution
   */
  public async resolveConflict(
    conflictId: string,
    resolution: "local" | "remote" | "custom",
    customData?: any,
  ): Promise<boolean> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;

    let resolvedData: any;

    switch (resolution) {
      case "local":
        resolvedData = conflict.localOperation.data;
        break;
      case "remote":
        resolvedData = conflict.remoteOperation.data;
        break;
      case "custom":
        if (!customData) return false;
        resolvedData = customData;
        break;
    }

    conflict.resolution = resolution;
    conflict.resolvedData = resolvedData;

    await this.applyConflictResolution(conflict);
    return true;
  }

  /**
   * Get pending conflicts
   */
  public getPendingConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values())
      .filter((conflict) => !conflict.resolution)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get sync status for entity
   */
  public getSyncStatus(entityId: string): SyncState | undefined {
    return this.syncStates.get(entityId);
  }

  /**
   * Force sync for specific entity
   */
  public async forceSyncEntity(entityId: string): Promise<boolean> {
    const state = this.syncStates.get(entityId);
    if (!state) return false;

    const pendingOps = state.pendingOperations
      .map((id) => this.offlineQueue.get(id))
      .filter(Boolean);

    for (const queueItem of pendingOps) {
      if (queueItem) {
        await this.syncOperation(queueItem.id);
      }
    }

    return state.status === "synced";
  }

  /**
   * Get sync statistics
   */
  public getSyncStatistics(): {
    totalOperations: number;
    pendingOperations: number;
    completedOperations: number;
    failedOperations: number;
    conflicts: number;
    offlineQueueSize: number;
    syncRate: number;
  } {
    const totalOps = this.offlineQueue.size;
    const pendingOps = Array.from(this.offlineQueue.values()).filter(
      (item) => item.status === "pending",
    ).length;
    const completedOps = Array.from(this.offlineQueue.values()).filter(
      (item) => item.status === "completed",
    ).length;
    const failedOps = Array.from(this.offlineQueue.values()).filter(
      (item) => item.status === "failed",
    ).length;
    const conflicts = this.conflicts.size;

    return {
      totalOperations: totalOps,
      pendingOperations: pendingOps,
      completedOperations: completedOps,
      failedOperations: failedOps,
      conflicts,
      offlineQueueSize: this.offlineQueue.size,
      syncRate: totalOps > 0 ? (completedOps / totalOps) * 100 : 0,
    };
  }

  // Private helper methods
  private updateSyncState(
    entityId: string,
    entityType: string,
    version: number,
    checksum: string,
  ): void {
    let state = this.syncStates.get(entityId);

    if (!state) {
      state = {
        entityId,
        entityType,
        version,
        lastSync: new Date().toISOString(),
        checksum,
        pendingOperations: [],
        conflicts: [],
        status: "pending",
      };
    } else {
      state.version = version;
      state.checksum = checksum;
      state.status = "pending";
    }

    this.syncStates.set(entityId, state);
  }

  private determineConflictType(
    localOp: SyncOperation,
    remoteOp: SyncOperation,
  ): SyncConflict["conflictType"] {
    if (localOp.version !== remoteOp.version) {
      return "version";
    }

    if (
      Math.abs(
        new Date(localOp.timestamp).getTime() -
          new Date(remoteOp.timestamp).getTime(),
      ) < 1000
    ) {
      return "concurrent";
    }

    if (localOp.checksum !== remoteOp.checksum) {
      return "data";
    }

    return "dependency";
  }

  private async calculateChecksum(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async sendToServer(operation: SyncOperation): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: SyncOperation;
    error?: string;
  }> {
    try {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        // Send via WebSocket for real-time sync
        return new Promise((resolve) => {
          const messageId = `msg_${Date.now()}`;
          const message = {
            id: messageId,
            type: "sync_operation",
            operation,
          };

          const timeout = setTimeout(() => {
            resolve({ success: false, error: "Timeout" });
          }, 10000);

          const handleResponse = (event: MessageEvent) => {
            const response = JSON.parse(event.data);
            if (response.id === messageId) {
              clearTimeout(timeout);
              this.websocket?.removeEventListener("message", handleResponse);
              resolve(response);
            }
          };

          this.websocket?.addEventListener("message", handleResponse);
          this.websocket?.send(JSON.stringify(message));
        });
      } else {
        // Fallback to HTTP API
        const response = await fetch("/api/sync/operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(operation),
        });

        if (response.ok) {
          const result = await response.json();
          return { success: true, ...result };
        } else {
          return { success: false, error: `HTTP ${response.status}` };
        }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private connectWebSocket(): void {
    if (!this.isOnline) return;

    try {
      const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/sync`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log("WebSocket connected for real-time sync");
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onclose = () => {
        console.log("WebSocket disconnected");
        // Attempt reconnection after delay
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "sync_notification":
          // Handle incoming sync notifications
          this.handleIncomingSync(message.operation);
          break;
        case "conflict_notification":
          // Handle conflict notifications
          this.handleConflict(message.localOperation, message.remoteOperation);
          break;
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  private async handleIncomingSync(operation: SyncOperation): Promise<void> {
    // Update local data with incoming changes
    await this.updateLocalData(operation.entityId, operation.data);

    // Update sync state
    const state = this.syncStates.get(operation.entityId);
    if (state) {
      state.version = operation.version;
      state.checksum = operation.checksum;
      state.lastSync = new Date().toISOString();
      state.status = "synced";
    }

    // Emit sync event
    this.emitSyncEvent(operation);
  }

  private async updateLocalData(entityId: string, data: any): Promise<void> {
    // This would update the local data store
    // Implementation depends on the specific data storage mechanism
    console.log(`Updating local data for ${entityId}:`, data);
  }

  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, this.configuration.syncInterval);
  }

  private async triggerSync(): Promise<void> {
    const pendingItems = Array.from(this.offlineQueue.values())
      .filter((item) => item.status === "pending" || item.status === "failed")
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const item of pendingItems.slice(0, 10)) {
      // Sync up to 10 items at once
      await this.syncOperation(item.id);
    }
  }

  private onConnectionRestored(): void {
    console.log("Connection restored, resuming sync...");
    this.connectWebSocket();
    this.triggerSync();
  }

  private onConnectionLost(): void {
    console.log("Connection lost, entering offline mode...");
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private handleFailedOperation(queueItem: OfflineQueueItem): void {
    // Move to failed operations for manual review
    console.error(`Operation ${queueItem.id} failed permanently`);

    // Emit failure event
    window.dispatchEvent(
      new CustomEvent("syncOperationFailed", {
        detail: { operation: queueItem.operation },
      }),
    );
  }

  private emitConflictEvent(conflict: SyncConflict): void {
    window.dispatchEvent(
      new CustomEvent("syncConflict", {
        detail: { conflict },
      }),
    );
  }

  private emitResolutionEvent(conflict: SyncConflict): void {
    window.dispatchEvent(
      new CustomEvent("syncConflictResolved", {
        detail: { conflict },
      }),
    );
  }

  private emitSyncEvent(operation: SyncOperation): void {
    window.dispatchEvent(
      new CustomEvent("syncUpdate", {
        detail: { operation },
      }),
    );
  }

  private async initializeOfflineStorage(): Promise<void> {
    // Initialize IndexedDB for offline storage
    // This is a simplified implementation
    try {
      const request = indexedDB.open("SignatureSyncDB", 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;

        if (!db.objectStoreNames.contains("operations")) {
          db.createObjectStore("operations", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("conflicts")) {
          db.createObjectStore("conflicts", { keyPath: "id" });
        }
      };
    } catch (error) {
      console.error("Failed to initialize offline storage:", error);
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    // Load pending operations from IndexedDB
    // Implementation would restore the offline queue from persistent storage
  }

  private async saveOfflineQueue(): Promise<void> {
    // Save pending operations to IndexedDB
    // Implementation would persist the offline queue to storage
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.saveOfflineQueue();
  }
}

export const signatureRealtimeSyncService = new SignatureRealtimeSyncService();
export default signatureRealtimeSyncService;
