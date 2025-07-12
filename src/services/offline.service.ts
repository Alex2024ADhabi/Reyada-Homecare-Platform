import { errorHandlerService } from "./error-handler.service";

interface OfflineQueueItem {
  id: string;
  type: "sync" | "api_call" | "file_upload" | "notification";
  operation: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "processing" | "completed" | "failed";
}

interface OfflineStorage {
  queue: OfflineQueueItem[];
  cache: Record<string, any>;
  metadata: {
    lastSync: string;
    version: string;
    deviceId: string;
  };
}

class OfflineService {
  private readonly STORAGE_KEY = "reyada_offline_data";
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private storage: OfflineStorage;
  private isOnline: boolean = navigator.onLine;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.storage = this.loadFromStorage();
    this.setupNetworkListeners();
    this.startPeriodicCleanup();
  }

  private loadFromStorage(): OfflineStorage {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.loadFromStorage",
      });
    }

    return {
      queue: [],
      cache: {},
      metadata: {
        lastSync: new Date().toISOString(),
        version: "1.0.0",
        deviceId: this.generateDeviceId(),
      },
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.storage));
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.saveToStorage",
      });
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.emit("network-status-changed", { isOnline: true });
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.emit("network-status-changed", { isOnline: false });
    });
  }

  async addToQueue(
    item: Omit<OfflineQueueItem, "id" | "retryCount" | "status">,
  ): Promise<string> {
    try {
      const queueItem: OfflineQueueItem = {
        ...item,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        retryCount: 0,
        status: "pending",
      };

      // Remove oldest items if queue is full
      if (this.storage.queue.length >= this.MAX_QUEUE_SIZE) {
        this.storage.queue = this.storage.queue
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, this.MAX_QUEUE_SIZE - 1);
      }

      this.storage.queue.push(queueItem);
      this.saveToStorage();

      this.emit("item-queued", queueItem);

      // Try to process immediately if online
      if (this.isOnline) {
        await this.processQueueItem(queueItem);
      }

      return queueItem.id;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.addToQueue",
        item,
      });
      throw new Error("Failed to add item to offline queue");
    }
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const pendingItems = this.storage.queue
        .filter((item) => item.status === "pending" || item.status === "failed")
        .sort((a, b) => {
          // Sort by priority and timestamp
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];

          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }

          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

      for (const item of pendingItems) {
        await this.processQueueItem(item);

        // Add delay between processing to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.processQueue",
      });
    }
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    try {
      item.status = "processing";
      this.saveToStorage();

      let success = false;

      switch (item.type) {
        case "sync":
          success = await this.processSyncOperation(item.operation);
          break;
        case "api_call":
          success = await this.processApiCall(item.operation);
          break;
        case "file_upload":
          success = await this.processFileUpload(item.operation);
          break;
        case "notification":
          success = await this.processNotification(item.operation);
          break;
        default:
          console.warn(`Unknown queue item type: ${item.type}`);
          success = false;
      }

      if (success) {
        item.status = "completed";
        this.emit("item-processed", item);
      } else {
        throw new Error(`Failed to process ${item.type} operation`);
      }
    } catch (error) {
      item.retryCount++;

      if (item.retryCount >= item.maxRetries) {
        item.status = "failed";
        this.emit("item-failed", item);
      } else {
        item.status = "pending";
        // Exponential backoff for retries
        const delay = Math.pow(2, item.retryCount) * 1000;
        setTimeout(() => {
          this.processQueueItem(item);
        }, delay);
      }

      errorHandlerService.handleError(error, {
        context: "OfflineService.processQueueItem",
        itemId: item.id,
        itemType: item.type,
      });
    } finally {
      this.saveToStorage();
    }
  }

  private async processSyncOperation(operation: any): Promise<boolean> {
    // This would integrate with the real-time sync service
    console.log("Processing sync operation:", operation);
    return true;
  }

  private async processApiCall(operation: any): Promise<boolean> {
    try {
      const response = await fetch(operation.url, {
        method: operation.method || "GET",
        headers: operation.headers || {},
        body: operation.body ? JSON.stringify(operation.body) : undefined,
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async processFileUpload(operation: any): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append("file", operation.file);

      const response = await fetch(operation.uploadUrl, {
        method: "POST",
        body: formData,
        headers: operation.headers || {},
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async processNotification(operation: any): Promise<boolean> {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(operation.title, {
          body: operation.body,
          icon: operation.icon,
          tag: operation.tag,
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Cache management
  setCache(key: string, data: any, ttl?: number): void {
    try {
      const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.CACHE_EXPIRY;

      this.storage.cache[key] = {
        data,
        expiresAt,
        timestamp: Date.now(),
      };

      this.saveToStorage();
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.setCache",
        key,
      });
    }
  }

  getCache(key: string): any | null {
    try {
      const cached = this.storage.cache[key];

      if (!cached) {
        return null;
      }

      if (Date.now() > cached.expiresAt) {
        delete this.storage.cache[key];
        this.saveToStorage();
        return null;
      }

      return cached.data;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.getCache",
        key,
      });
      return null;
    }
  }

  clearCache(pattern?: string): void {
    try {
      if (pattern) {
        const regex = new RegExp(pattern);
        Object.keys(this.storage.cache).forEach((key) => {
          if (regex.test(key)) {
            delete this.storage.cache[key];
          }
        });
      } else {
        this.storage.cache = {};
      }

      this.saveToStorage();
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.clearCache",
        pattern,
      });
    }
  }

  // Queue management
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const queue = this.storage.queue;

    return {
      total: queue.length,
      pending: queue.filter((item) => item.status === "pending").length,
      processing: queue.filter((item) => item.status === "processing").length,
      completed: queue.filter((item) => item.status === "completed").length,
      failed: queue.filter((item) => item.status === "failed").length,
    };
  }

  clearCompletedItems(): void {
    try {
      this.storage.queue = this.storage.queue.filter(
        (item) => item.status !== "completed",
      );
      this.saveToStorage();
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.clearCompletedItems",
      });
    }
  }

  retryFailedItems(): void {
    try {
      this.storage.queue.forEach((item) => {
        if (item.status === "failed" && item.retryCount < item.maxRetries) {
          item.status = "pending";
          item.retryCount = 0;
        }
      });

      this.saveToStorage();

      if (this.isOnline) {
        this.processQueue();
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "OfflineService.retryFailedItems",
      });
    }
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      try {
        // Remove expired cache items
        const now = Date.now();
        Object.keys(this.storage.cache).forEach((key) => {
          const cached = this.storage.cache[key];
          if (cached && now > cached.expiresAt) {
            delete this.storage.cache[key];
          }
        });

        // Remove old completed items (older than 7 days)
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        this.storage.queue = this.storage.queue.filter((item) => {
          if (item.status === "completed") {
            return new Date(item.timestamp).getTime() > weekAgo;
          }
          return true;
        });

        this.saveToStorage();
      } catch (error) {
        errorHandlerService.handleError(error, {
          context: "OfflineService.startPeriodicCleanup",
        });
      }
    }, 60000); // Run every minute
  }

  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in offline service event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Public getters
  get isNetworkOnline(): boolean {
    return this.isOnline;
  }

  get deviceId(): string {
    return this.storage.metadata.deviceId;
  }

  get lastSyncTime(): string {
    return this.storage.metadata.lastSync;
  }

  updateLastSyncTime(): void {
    this.storage.metadata.lastSync = new Date().toISOString();
    this.saveToStorage();
  }

  // Cleanup
  destroy(): void {
    this.eventListeners.clear();
  }
}

export const offlineService = new OfflineService();
export default offlineService;
