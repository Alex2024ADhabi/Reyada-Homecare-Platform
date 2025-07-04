import { errorHandlerService } from "./error-handler.service";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id: string;
  priority?: "low" | "medium" | "high" | "critical";
  retryCount?: number;
  maxRetries?: number;
}

interface ConnectionConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
  enableCompression?: boolean;
  enableBinaryMessages?: boolean;
}

interface ConnectionMetrics {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  averageLatency: number;
  connectionUptime: number;
  lastHeartbeat: Date | null;
  reconnectionCount: number;
}

interface OfflineQueueItem {
  message: WebSocketMessage;
  timestamp: Date;
  attempts: number;
  lastAttempt: Date | null;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private offlineQueue: OfflineQueueItem[] = [];
  private config: ConnectionConfig;
  private metrics: ConnectionMetrics;
  private connectionStartTime: Date | null = null;
  private pendingMessages: Map<
    string,
    { resolve: Function; reject: Function; timestamp: Date }
  > = new Map();
  private readonly MAX_QUEUE_SIZE = 10000;
  private readonly MAX_OFFLINE_QUEUE_SIZE = 5000;
  private healthCheckInterval: number | null = null;

  constructor() {
    this.config = {
      url: this.getWebSocketUrl(),
      reconnectInterval: 5000,
      maxReconnectAttempts: 15,
      heartbeatInterval: 30000,
      timeout: 10000,
      enableCompression: true,
      enableBinaryMessages: false,
    };

    this.metrics = {
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      averageLatency: 0,
      connectionUptime: 0,
      lastHeartbeat: null,
      reconnectionCount: 0,
    };

    this.connect();
    this.setupNetworkListeners();
    this.setupHealthMonitoring();
    this.setupOfflineQueueProcessor();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      if (!this.isConnected()) {
        this.connect();
      }
    });

    window.addEventListener("offline", () => {
      this.disconnect();
    });
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    try {
      this.isConnecting = true;
      this.ws = new WebSocket(this.config.url, this.config.protocols);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Set connection timeout
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.handleConnectionTimeout();
        }
      }, this.config.timeout);
    } catch (error) {
      this.isConnecting = false;
      errorHandlerService.handleError(error, {
        context: "WebSocketService.connect",
      });
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log("🔗 WebSocket connected successfully");
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connectionStartTime = new Date();

    this.startHeartbeat();
    this.processMessageQueue();
    this.processOfflineQueue();
    this.emit("connected", {
      timestamp: new Date().toISOString(),
      reconnectionCount: this.metrics.reconnectionCount,
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      const now = new Date();

      // Handle system messages
      if (message.type === "heartbeat") {
        this.metrics.lastHeartbeat = now;
        this.send("heartbeat-response", {
          timestamp: now.toISOString(),
        });
        return;
      }

      if (message.type === "heartbeat-response" || message.type === "pong") {
        this.metrics.lastHeartbeat = now;
        return; // Heartbeat acknowledged
      }

      // Handle acknowledgments
      if (message.type === "ack" && message.data?.messageId) {
        const pending = this.pendingMessages.get(message.data.messageId);
        if (pending) {
          pending.resolve(message.data);
          this.pendingMessages.delete(message.data.messageId);
        }
        return;
      }

      // Handle error responses
      if (message.type === "error" && message.data?.messageId) {
        const pending = this.pendingMessages.get(message.data.messageId);
        if (pending) {
          pending.reject(new Error(message.data.error || "Unknown error"));
          this.pendingMessages.delete(message.data.messageId);
        }
        this.emit("message-error", message.data);
        return;
      }

      // Calculate latency if timestamp is available
      if (message.timestamp) {
        const messageTime = new Date(message.timestamp);
        const latency = now.getTime() - messageTime.getTime();

        // Update average latency
        this.metrics.averageLatency =
          this.metrics.averageLatency * 0.9 + latency * 0.1;
      }

      // Emit the message to listeners
      this.emit(message.type, message.data);
      this.emit("message", message);

      // Send acknowledgment for non-system messages
      if (
        !message.type.startsWith("heartbeat") &&
        !message.type.startsWith("ping")
      ) {
        this.send("ack", { messageId: message.id }, { priority: "high" });
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
      errorHandlerService.handleError(error, {
        context: "WebSocketService.handleMessage",
        rawMessage: event.data,
      });

      // Send error response if possible
      try {
        this.send(
          "error",
          {
            error: "Message parsing failed",
            originalMessage: event.data.substring(0, 100), // First 100 chars for debugging
          },
          { priority: "high" },
        );
      } catch (sendError) {
        console.error("❌ Failed to send error response:", sendError);
      }
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log("🔌 WebSocket disconnected:", event.code, event.reason);

    // Update connection uptime
    if (this.connectionStartTime) {
      this.metrics.connectionUptime +=
        Date.now() - this.connectionStartTime.getTime();
      this.connectionStartTime = null;
    }

    this.cleanup();
    this.emit("disconnected", {
      code: event.code,
      reason: event.reason,
      timestamp: new Date().toISOString(),
      wasClean: event.code === 1000,
      uptime: this.metrics.connectionUptime,
    });

    // Attempt to reconnect unless it was a clean close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
    errorHandlerService.handleError(new Error("WebSocket connection error"), {
      context: "WebSocketService.handleError",
      event,
    });
    this.emit("error", { event, timestamp: new Date().toISOString() });
  }

  private handleConnectionTimeout(): void {
    console.warn("WebSocket connection timeout");
    this.isConnecting = false;
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      this.emit("max-reconnect-attempts", {
        attempts: this.reconnectAttempts,
        timestamp: new Date().toISOString(),
        queuedMessages: this.messageQueue.length,
        offlineQueueSize: this.offlineQueue.length,
      });
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Enhanced exponential backoff with jitter
    const baseDelay = this.config.reconnectInterval;
    const exponentialDelay =
      baseDelay * Math.pow(2, Math.min(this.reconnectAttempts, 6));
    const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
    const delay = Math.min(exponentialDelay + jitter, 60000); // Cap at 1 minute

    console.log(
      `🔄 Scheduling reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`,
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.metrics.reconnectionCount++;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected()) {
        this.send("heartbeat", { timestamp: new Date().toISOString() });
      }
    }, this.config.heartbeatInterval);
  }

  private cleanup(): void {
    this.isConnecting = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private sendMessage(message: WebSocketMessage): boolean {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const messageString = JSON.stringify(message);

      // Check message size (WebSocket has limits)
      if (messageString.length > 1024 * 1024) {
        // 1MB limit
        console.error(`❌ Message too large: ${messageString.length} bytes`);
        this.emit("message-error", {
          messageId: message.id,
          error: "Message size exceeds limit",
          size: messageString.length,
        });
        return false;
      }

      this.ws!.send(messageString);

      // Track message for acknowledgment if needed
      if (message.type !== "heartbeat" && message.type !== "ping") {
        this.pendingMessages.set(message.id, {
          resolve: () => {},
          reject: () => {},
          timestamp: new Date(),
        });

        // Clean up pending messages after timeout
        setTimeout(() => {
          if (this.pendingMessages.has(message.id)) {
            this.pendingMessages.delete(message.id);
          }
        }, 30000); // 30 second timeout
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to send message ${message.id}:`, error);
      errorHandlerService.handleError(error, {
        context: "WebSocketService.sendMessage",
        message,
      });
      return false;
    }
  }

  // Enhanced send with Promise support for acknowledgments
  sendWithAck(
    type: string,
    data: any,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      timeout?: number;
      maxRetries?: number;
    } = {},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        priority: options.priority || "medium",
        maxRetries: options.maxRetries || 3,
        retryCount: 0,
      };

      const timeout = options.timeout || 10000; // 10 second default timeout

      // Store promise handlers
      this.pendingMessages.set(message.id, {
        resolve,
        reject,
        timestamp: new Date(),
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (this.pendingMessages.has(message.id)) {
          this.pendingMessages.delete(message.id);
          reject(new Error(`Message acknowledgment timeout: ${message.id}`));
        }
      }, timeout);

      // Send message
      const success = this.send(type, data, options);

      if (!success && !this.isConnected()) {
        // If offline, resolve immediately as message is queued
        clearTimeout(timeoutId);
        this.pendingMessages.delete(message.id);
        resolve({ queued: true, messageId: message.id });
      }
    });
  }

  // Enhanced offline queue processing
  private setupOfflineQueueProcessor(): void {
    setInterval(() => {
      this.processOfflineQueue();
    }, 10000); // Process every 10 seconds
  }

  private async processOfflineQueue(): Promise<void> {
    if (!this.isConnected() || this.offlineQueue.length === 0) {
      return;
    }

    console.log(`📤 Processing ${this.offlineQueue.length} offline messages`);

    // Sort by priority and timestamp
    this.offlineQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.message.priority || "medium"];
      const bPriority = priorityOrder[b.message.priority || "medium"];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    // Process in batches to avoid overwhelming the connection
    const batchSize = 10;
    const batch = this.offlineQueue.splice(0, batchSize);

    for (const item of batch) {
      try {
        const success = this.sendMessage(item.message);
        if (success) {
          console.log(`✅ Offline message sent: ${item.message.id}`);
        } else {
          // Re-queue if failed
          item.attempts++;
          item.lastAttempt = new Date();

          if (item.attempts < (item.message.maxRetries || 3)) {
            this.offlineQueue.unshift(item);
          } else {
            console.error(
              `❌ Offline message failed after max retries: ${item.message.id}`,
            );
            this.emit("message-failed", {
              message: item.message,
              reason: "max-retries-exceeded",
            });
          }
        }
      } catch (error) {
        console.error(
          `❌ Error processing offline message: ${item.message.id}`,
          error,
        );
      }

      // Small delay between messages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private setupHealthMonitoring(): void {
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  private performHealthCheck(): void {
    const now = new Date();
    const health = {
      isConnected: this.isConnected(),
      queueSize: this.messageQueue.length,
      offlineQueueSize: this.offlineQueue.length,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.metrics.lastHeartbeat,
      connectionUptime: this.connectionStartTime
        ? now.getTime() - this.connectionStartTime.getTime()
        : 0,
      metrics: this.metrics,
    };

    // Emit health status
    this.emit("health-check", health);

    // Log warnings for concerning states
    if (this.messageQueue.length > 1000) {
      console.warn(
        `⚠️ Large message queue: ${this.messageQueue.length} messages`,
      );
    }

    if (this.offlineQueue.length > 500) {
      console.warn(
        `⚠️ Large offline queue: ${this.offlineQueue.length} messages`,
      );
    }

    if (this.reconnectAttempts > 5) {
      console.warn(`⚠️ High reconnection attempts: ${this.reconnectAttempts}`);
    }
  }

  // Public methods
  send(
    type: string,
    data: any,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      maxRetries?: number;
    } = {},
  ): boolean {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      priority: options.priority || "medium",
      maxRetries: options.maxRetries || 3,
      retryCount: 0,
    };

    this.metrics.totalMessages++;

    if (this.isConnected()) {
      const success = this.sendMessage(message);
      if (success) {
        this.metrics.successfulMessages++;
      } else {
        this.metrics.failedMessages++;
        this.addToOfflineQueue(message);
      }
      return success;
    } else {
      // Add to offline queue for later delivery
      this.addToOfflineQueue(message);
      return false;
    }
  }

  private addToOfflineQueue(message: WebSocketMessage): void {
    // Prevent queue from growing too large
    if (this.offlineQueue.length >= this.MAX_OFFLINE_QUEUE_SIZE) {
      // Remove oldest low-priority messages first
      const lowPriorityIndex = this.offlineQueue.findIndex(
        (item) =>
          item.message.priority === "low" || item.message.priority === "medium",
      );

      if (lowPriorityIndex >= 0) {
        this.offlineQueue.splice(lowPriorityIndex, 1);
        console.warn(
          "⚠️ Removed low-priority message from offline queue due to size limit",
        );
      } else {
        // If no low-priority messages, remove oldest
        this.offlineQueue.shift();
        console.warn(
          "⚠️ Removed oldest message from offline queue due to size limit",
        );
      }
    }

    this.offlineQueue.push({
      message,
      timestamp: new Date(),
      attempts: 0,
      lastAttempt: null,
    });

    console.log(
      `📥 Message queued for offline delivery: ${message.type} (priority: ${message.priority})`,
    );
  }

  broadcast(type: string, data: any): boolean {
    return this.send(`broadcast:${type}`, data);
  }

  subscribe(channel: string): boolean {
    return this.send("subscribe", { channel });
  }

  unsubscribe(channel: string): boolean {
    return this.send("unsubscribe", { channel });
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  isConnecting(): boolean {
    return (
      this.isConnecting ||
      (this.ws !== null && this.ws.readyState === WebSocket.CONNECTING)
    );
  }

  getConnectionState(): string {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
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
            `Error in WebSocket event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Configuration
  updateConfig(newConfig: Partial<ConnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Manual control
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
    }
    this.cleanup();
  }

  forceReconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }

  // Enhanced utility methods
  getConnectionMetrics(): ConnectionMetrics & {
    queueSize: number;
    offlineQueueSize: number;
    pendingMessages: number;
    healthStatus: "healthy" | "degraded" | "critical";
  } {
    const healthStatus = this.assessHealthStatus();

    return {
      ...this.metrics,
      queueSize: this.messageQueue.length,
      offlineQueueSize: this.offlineQueue.length,
      pendingMessages: this.pendingMessages.size,
      healthStatus,
    };
  }

  private assessHealthStatus(): "healthy" | "degraded" | "critical" {
    if (!this.isConnected()) {
      return "critical";
    }

    if (
      this.messageQueue.length > 1000 ||
      this.offlineQueue.length > 500 ||
      this.reconnectAttempts > 5
    ) {
      return "degraded";
    }

    return "healthy";
  }

  // Clear queues (useful for testing or emergency situations)
  clearQueues(): void {
    const queueSize = this.messageQueue.length;
    const offlineSize = this.offlineQueue.length;

    this.messageQueue = [];
    this.offlineQueue = [];

    console.log(
      `🧹 Cleared message queues: ${queueSize} queued, ${offlineSize} offline`,
    );
    this.emit("queues-cleared", { queueSize, offlineSize });
  }

  // Get queue status
  getQueueStatus(): {
    messageQueue: number;
    offlineQueue: number;
    pendingMessages: number;
    oldestQueuedMessage?: Date;
    oldestOfflineMessage?: Date;
  } {
    const oldestQueued =
      this.messageQueue.length > 0
        ? new Date(this.messageQueue[0].timestamp)
        : undefined;

    const oldestOffline =
      this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : undefined;

    return {
      messageQueue: this.messageQueue.length,
      offlineQueue: this.offlineQueue.length,
      pendingMessages: this.pendingMessages.size,
      oldestQueuedMessage: oldestQueued,
      oldestOfflineMessage: oldestOffline,
    };
  }

  // Enhanced cleanup
  destroy(): void {
    console.log("🧹 Destroying WebSocket service...");

    // Clear all timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Reject all pending messages
    this.pendingMessages.forEach((pending, messageId) => {
      pending.reject(new Error("WebSocket service destroyed"));
    });

    // Clean up
    this.disconnect();
    this.eventListeners.clear();
    this.messageQueue = [];
    this.offlineQueue = [];
    this.pendingMessages.clear();

    console.log("✅ WebSocket service destroyed");
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
