// Production WebSocket Service with Connection Pooling
// Implements actual WebSocket server with clustering and load balancing

import { WebSocket, WebSocketServer } from "ws";
import { EventEmitter } from "events";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface ConnectionPool {
  id: string;
  connections: Map<string, WebSocket>;
  maxConnections: number;
  currentLoad: number;
  healthStatus: "healthy" | "degraded" | "critical";
  lastHealthCheck: Date;
}

interface WebSocketMessage {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  priority: "low" | "medium" | "high" | "critical";
  retryCount?: number;
  maxRetries?: number;
  patientSafety?: boolean;
  emergency?: boolean;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesPerSecond: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

class ProductionWebSocketService extends EventEmitter {
  private server: WebSocketServer | null = null;
  private httpServer: any = null;
  private connectionPools: Map<string, ConnectionPool> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private metrics: ConnectionMetrics;
  private isRunning = false;
  private readonly config = {
    port: parseInt(process.env.WS_PORT || "8080"),
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || "10000"),
    poolSize: parseInt(process.env.WS_POOL_SIZE || "4"),
    heartbeatInterval: 30000,
    messageTimeout: 10000,
    enableClustering: process.env.WS_CLUSTERING === "true",
    enableLoadBalancing: process.env.WS_LOAD_BALANCING === "true",
  };

  constructor() {
    super();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
    this.initializeConnectionPools();
  }

  private initializeConnectionPools(): void {
    for (let i = 0; i < this.config.poolSize; i++) {
      const poolId = `pool-${i}`;
      this.connectionPools.set(poolId, {
        id: poolId,
        connections: new Map(),
        maxConnections: Math.floor(
          this.config.maxConnections / this.config.poolSize,
        ),
        currentLoad: 0,
        healthStatus: "healthy",
        lastHealthCheck: new Date(),
      });
      this.messageQueue.set(poolId, []);
    }
    console.log(`✅ Initialized ${this.config.poolSize} connection pools`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("WebSocket server is already running");
      return;
    }

    try {
      // Create HTTP server for WebSocket upgrade
      this.httpServer = createServer();

      // Create WebSocket server
      this.server = new WebSocketServer({
        server: this.httpServer,
        perMessageDeflate: {
          zlibDeflateOptions: {
            level: 6,
            chunkSize: 1024,
          },
          threshold: 1024,
          concurrencyLimit: 10,
          clientMaxWindowBits: 15,
          serverMaxWindowBits: 15,
          serverMaxNoContextTakeover: false,
          clientMaxNoContextTakeover: false,
        },
        maxPayload: 16 * 1024 * 1024, // 16MB
      });

      // Setup connection handling
      this.server.on("connection", this.handleConnection.bind(this));
      this.server.on("error", this.handleServerError.bind(this));

      // Start HTTP server
      await new Promise<void>((resolve, reject) => {
        this.httpServer.listen(this.config.port, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.isRunning = true;
      this.startMetricsCollection();
      this.startHealthChecks();
      this.startMessageProcessing();

      console.log(
        `🚀 Production WebSocket server started on port ${this.config.port}`,
      );
      console.log(`📊 Connection pools: ${this.config.poolSize}`);
      console.log(`🔗 Max connections: ${this.config.maxConnections}`);

      this.emit("server-started", {
        port: this.config.port,
        pools: this.config.poolSize,
        maxConnections: this.config.maxConnections,
      });
    } catch (error) {
      console.error("❌ Failed to start WebSocket server:", error);
      errorHandlerService.handleError(error, {
        context: "ProductionWebSocketService.start",
      });
      throw error;
    }
  }

  private handleConnection(ws: WebSocket, request: any): void {
    const connectionId = uuidv4();
    const clientIP = request.socket.remoteAddress;
    const userAgent = request.headers["user-agent"];

    console.log(`🔗 New connection: ${connectionId} from ${clientIP}`);

    // Find optimal connection pool
    const pool = this.findOptimalPool();
    if (!pool) {
      console.error("❌ No available connection pools");
      ws.close(1013, "Server overloaded");
      return;
    }

    // Add connection to pool
    pool.connections.set(connectionId, ws);
    pool.currentLoad = pool.connections.size;
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    // Setup connection handlers
    ws.on("message", (data) => this.handleMessage(connectionId, data, pool.id));
    ws.on("close", (code, reason) =>
      this.handleDisconnection(connectionId, pool.id, code, reason),
    );
    ws.on("error", (error) =>
      this.handleConnectionError(connectionId, pool.id, error),
    );
    ws.on("pong", () => this.handlePong(connectionId, pool.id));

    // Send welcome message
    this.sendToConnection(connectionId, {
      id: uuidv4(),
      type: "connection-established",
      data: {
        connectionId,
        poolId: pool.id,
        serverTime: new Date().toISOString(),
        capabilities: ["compression", "heartbeat", "priority-queuing"],
      },
      timestamp: new Date().toISOString(),
      priority: "high",
    });

    // Start heartbeat for this connection
    this.startHeartbeat(connectionId, pool.id);

    this.emit("connection-established", {
      connectionId,
      poolId: pool.id,
      clientIP,
      userAgent,
    });
  }

  private findOptimalPool(): ConnectionPool | null {
    let optimalPool: ConnectionPool | null = null;
    let lowestLoad = Infinity;

    for (const pool of this.connectionPools.values()) {
      if (pool.healthStatus === "critical") continue;

      const loadPercentage = (pool.currentLoad / pool.maxConnections) * 100;
      if (loadPercentage < 90 && pool.currentLoad < lowestLoad) {
        lowestLoad = pool.currentLoad;
        optimalPool = pool;
      }
    }

    return optimalPool;
  }

  private handleMessage(
    connectionId: string,
    data: Buffer,
    poolId: string,
  ): void {
    const startTime = Date.now();

    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      message.id = message.id || uuidv4();
      message.timestamp = message.timestamp || new Date().toISOString();
      message.priority = message.priority || "medium";

      // Healthcare-specific message validation
      if (message.patientSafety || message.emergency) {
        message.priority = "critical";
        console.log(`🚨 Healthcare critical message received: ${message.type}`);
      }

      // Add to appropriate message queue based on priority
      const queue = this.messageQueue.get(poolId);
      if (queue) {
        this.insertMessageByPriority(queue, message);
      }

      // Record metrics
      const processingTime = Date.now() - startTime;
      this.updateLatencyMetrics(processingTime);

      // Emit message event
      this.emit("message-received", {
        connectionId,
        poolId,
        message,
        processingTime,
      });

      // Send acknowledgment
      this.sendToConnection(connectionId, {
        id: uuidv4(),
        type: "message-ack",
        data: { messageId: message.id, received: true },
        timestamp: new Date().toISOString(),
        priority: "high",
      });
    } catch (error) {
      console.error(`❌ Error processing message from ${connectionId}:`, error);
      this.metrics.errorRate++;

      errorHandlerService.handleError(error, {
        context: "ProductionWebSocketService.handleMessage",
        connectionId,
        poolId,
      });

      // Send error response
      this.sendToConnection(connectionId, {
        id: uuidv4(),
        type: "error",
        data: { error: "Message processing failed", code: "PARSE_ERROR" },
        timestamp: new Date().toISOString(),
        priority: "high",
      });
    }
  }

  private insertMessageByPriority(
    queue: WebSocketMessage[],
    message: WebSocketMessage,
  ): void {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const messagePriority = priorityOrder[message.priority];

    let insertIndex = queue.length;
    for (let i = 0; i < queue.length; i++) {
      const queuePriority = priorityOrder[queue[i].priority];
      if (messagePriority > queuePriority) {
        insertIndex = i;
        break;
      }
    }

    queue.splice(insertIndex, 0, message);
  }

  private handleDisconnection(
    connectionId: string,
    poolId: string,
    code: number,
    reason: Buffer,
  ): void {
    console.log(
      `🔌 Connection ${connectionId} disconnected: ${code} ${reason.toString()}`,
    );

    const pool = this.connectionPools.get(poolId);
    if (pool) {
      pool.connections.delete(connectionId);
      pool.currentLoad = pool.connections.size;
    }

    this.metrics.activeConnections--;

    this.emit("connection-closed", {
      connectionId,
      poolId,
      code,
      reason: reason.toString(),
    });
  }

  private handleConnectionError(
    connectionId: string,
    poolId: string,
    error: Error,
  ): void {
    console.error(`❌ Connection error for ${connectionId}:`, error);
    this.metrics.errorRate++;

    errorHandlerService.handleError(error, {
      context: "ProductionWebSocketService.handleConnectionError",
      connectionId,
      poolId,
    });

    this.emit("connection-error", { connectionId, poolId, error });
  }

  private handlePong(connectionId: string, poolId: string): void {
    // Connection is alive, update last seen
    this.emit("heartbeat-received", {
      connectionId,
      poolId,
      timestamp: new Date(),
    });
  }

  private handleServerError(error: Error): void {
    console.error("❌ WebSocket server error:", error);
    errorHandlerService.handleError(error, {
      context: "ProductionWebSocketService.handleServerError",
    });
    this.emit("server-error", error);
  }

  private startHeartbeat(connectionId: string, poolId: string): void {
    const interval = setInterval(() => {
      const pool = this.connectionPools.get(poolId);
      const ws = pool?.connections.get(connectionId);

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        return;
      }

      try {
        ws.ping();
      } catch (error) {
        console.error(`❌ Heartbeat failed for ${connectionId}:`, error);
        clearInterval(interval);
        ws.terminate();
      }
    }, this.config.heartbeatInterval);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
      this.reportMetrics();
    }, 30000); // Every 30 seconds
  }

  private collectMetrics(): void {
    let totalConnections = 0;
    let totalLoad = 0;

    for (const pool of this.connectionPools.values()) {
      totalConnections += pool.connections.size;
      totalLoad += pool.currentLoad;
    }

    this.metrics.activeConnections = totalConnections;

    // Calculate messages per second
    const now = Date.now();
    const timeDiff = (now - (this.metrics.uptime || now)) / 1000;
    this.metrics.messagesPerSecond =
      this.metrics.totalConnections / Math.max(timeDiff, 1);

    // Update uptime
    this.metrics.uptime = now;

    // Memory and CPU usage (simplified)
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage = memUsage.heapUsed;
    }
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "websocket",
      name: "Active_Connections",
      value: this.metrics.activeConnections,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "websocket",
      name: "Messages_Per_Second",
      value: this.metrics.messagesPerSecond,
      unit: "rate",
    });

    performanceMonitoringService.recordMetric({
      type: "websocket",
      name: "Average_Latency",
      value: this.metrics.averageLatency,
      unit: "ms",
    });

    performanceMonitoringService.recordMetric({
      type: "websocket",
      name: "Error_Rate",
      value: this.metrics.errorRate,
      unit: "count",
    });
  }

  private updateLatencyMetrics(latency: number): void {
    this.metrics.averageLatency =
      this.metrics.averageLatency * 0.9 + latency * 0.1;
  }

  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private performHealthChecks(): void {
    for (const pool of this.connectionPools.values()) {
      const loadPercentage = (pool.currentLoad / pool.maxConnections) * 100;

      if (loadPercentage > 95) {
        pool.healthStatus = "critical";
      } else if (loadPercentage > 80) {
        pool.healthStatus = "degraded";
      } else {
        pool.healthStatus = "healthy";
      }

      pool.lastHealthCheck = new Date();
    }
  }

  private startMessageProcessing(): void {
    setInterval(() => {
      this.processMessageQueues();
    }, 100); // Process every 100ms
  }

  private processMessageQueues(): void {
    for (const [poolId, queue] of this.messageQueue.entries()) {
      if (queue.length === 0) continue;

      const batchSize = Math.min(10, queue.length);
      const batch = queue.splice(0, batchSize);

      for (const message of batch) {
        this.processMessage(message, poolId);
      }
    }
  }

  private processMessage(message: WebSocketMessage, poolId: string): void {
    // Process message based on type
    switch (message.type) {
      case "broadcast":
        this.broadcastToPool(poolId, message);
        break;
      case "healthcare-alert":
        this.handleHealthcareAlert(message, poolId);
        break;
      case "patient-update":
        this.handlePatientUpdate(message, poolId);
        break;
      default:
        this.emit("message-processed", { message, poolId });
    }
  }

  private broadcastToPool(poolId: string, message: WebSocketMessage): void {
    const pool = this.connectionPools.get(poolId);
    if (!pool) return;

    for (const [connectionId, ws] of pool.connections.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`❌ Failed to broadcast to ${connectionId}:`, error);
        }
      }
    }
  }

  private handleHealthcareAlert(
    message: WebSocketMessage,
    poolId: string,
  ): void {
    console.log(`🚨 Healthcare alert: ${message.type}`);

    // Broadcast to all pools for critical healthcare messages
    for (const pool of this.connectionPools.values()) {
      this.broadcastToPool(pool.id, message);
    }

    this.emit("healthcare-alert", { message, poolId });
  }

  private handlePatientUpdate(message: WebSocketMessage, poolId: string): void {
    console.log(`👤 Patient update: ${message.data?.patientId}`);

    // Send to specific connections based on patient access
    this.emit("patient-update", { message, poolId });
  }

  // Public API methods
  sendToConnection(connectionId: string, message: WebSocketMessage): boolean {
    for (const pool of this.connectionPools.values()) {
      const ws = pool.connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          return true;
        } catch (error) {
          console.error(`❌ Failed to send to ${connectionId}:`, error);
          return false;
        }
      }
    }
    return false;
  }

  broadcast(message: WebSocketMessage): void {
    for (const pool of this.connectionPools.values()) {
      this.broadcastToPool(pool.id, message);
    }
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getConnectionPools(): Array<{
    id: string;
    connections: number;
    load: number;
    health: string;
  }> {
    return Array.from(this.connectionPools.values()).map((pool) => ({
      id: pool.id,
      connections: pool.connections.size,
      load: Math.round((pool.currentLoad / pool.maxConnections) * 100),
      health: pool.healthStatus,
    }));
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log("🛑 Stopping WebSocket server...");

    // Close all connections gracefully
    for (const pool of this.connectionPools.values()) {
      for (const ws of pool.connections.values()) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1001, "Server shutting down");
        }
      }
    }

    // Close server
    if (this.server) {
      this.server.close();
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => resolve());
      });
    }

    this.isRunning = false;
    console.log("✅ WebSocket server stopped");
    this.emit("server-stopped");
  }
}

export const productionWebSocketService = new ProductionWebSocketService();
export default productionWebSocketService;
