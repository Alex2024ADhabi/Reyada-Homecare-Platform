/**
 * Production WebSocket Service with Connection Pooling
 * Handles real-time communication for healthcare platform
 */

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  messageId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ConnectionPool {
  [key: string]: WebSocket;
}

interface WebSocketConfig {
  maxConnections: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  messageQueueSize: number;
}

class WebSocketService {
  private connections: ConnectionPool = {};
  private messageQueue: WebSocketMessage[] = [];
  private reconnectTimers: { [key: string]: NodeJS.Timeout } = {};
  private heartbeatTimers: { [key: string]: NodeJS.Timeout } = {};
  private config: WebSocketConfig;
  private eventListeners: { [event: string]: Function[] } = {};

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      maxConnections: 100,
      reconnectInterval: 5000,
      heartbeatInterval: 30000,
      messageQueueSize: 1000,
      ...config
    };
  }

  /**
   * Create new WebSocket connection with pooling
   */
  async connect(endpoint: string, connectionId: string): Promise<WebSocket> {
    if (this.connections[connectionId]) {
      console.log(`Connection ${connectionId} already exists`);
      return this.connections[connectionId];
    }

    if (Object.keys(this.connections).length >= this.config.maxConnections) {
      throw new Error('Maximum connection pool size reached');
    }

    try {
      const ws = new WebSocket(endpoint);
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${connectionId}`);
        this.connections[connectionId] = ws;
        this.startHeartbeat(connectionId);
        this.emit('connected', { connectionId, endpoint });
        this.processQueuedMessages(connectionId);
      };

      ws.onmessage = (event) => {
        this.handleMessage(connectionId, event.data);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${connectionId}`, event.code, event.reason);
        this.handleDisconnection(connectionId);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error: ${connectionId}`, error);
        this.emit('error', { connectionId, error });
      };

      return ws;
    } catch (error) {
      console.error(`Failed to create WebSocket connection: ${connectionId}`, error);
      throw error;
    }
  }

  /**
   * Send message with priority queuing
   */
  async sendMessage(connectionId: string, message: Omit<WebSocketMessage, 'timestamp' | 'messageId'>): Promise<boolean> {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };

    const connection = this.connections[connectionId];
    
    if (!connection || connection.readyState !== WebSocket.OPEN) {
      // Queue message for later delivery
      this.queueMessage(fullMessage);
      console.warn(`Connection ${connectionId} not available, message queued`);
      return false;
    }

    try {
      connection.send(JSON.stringify(fullMessage));
      this.emit('messageSent', { connectionId, message: fullMessage });
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${connectionId}`, error);
      this.queueMessage(fullMessage);
      return false;
    }
  }

  /**
   * Broadcast message to all connections
   */
  async broadcast(message: Omit<WebSocketMessage, 'timestamp' | 'messageId'>): Promise<number> {
    let successCount = 0;
    const connections = Object.keys(this.connections);

    for (const connectionId of connections) {
      const success = await this.sendMessage(connectionId, message);
      if (success) successCount++;
    }

    return successCount;
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(connectionId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Handle heartbeat responses
      if (message.type === 'pong') {
        this.emit('heartbeat', { connectionId });
        return;
      }

      // Handle healthcare-specific messages
      if (message.type === 'patient_update') {
        this.emit('patientUpdate', { connectionId, data: message.payload });
      } else if (message.type === 'emergency_alert') {
        this.emit('emergencyAlert', { connectionId, data: message.payload });
      } else if (message.type === 'clinical_note') {
        this.emit('clinicalNote', { connectionId, data: message.payload });
      }

      this.emit('message', { connectionId, message });
    } catch (error) {
      console.error(`Failed to parse message from ${connectionId}`, error);
    }
  }

  /**
   * Handle connection disconnection and reconnection
   */
  private handleDisconnection(connectionId: string): void {
    delete this.connections[connectionId];
    this.stopHeartbeat(connectionId);
    
    // Schedule reconnection
    this.reconnectTimers[connectionId] = setTimeout(() => {
      this.emit('reconnecting', { connectionId });
    }, this.config.reconnectInterval);

    this.emit('disconnected', { connectionId });
  }

  /**
   * Start heartbeat for connection health monitoring
   */
  private startHeartbeat(connectionId: string): void {
    this.heartbeatTimers[connectionId] = setInterval(() => {
      const connection = this.connections[connectionId];
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(connectionId: string): void {
    if (this.heartbeatTimers[connectionId]) {
      clearInterval(this.heartbeatTimers[connectionId]);
      delete this.heartbeatTimers[connectionId];
    }
  }

  /**
   * Queue message for later delivery
   */
  private queueMessage(message: WebSocketMessage): void {
    // Sort by priority and timestamp
    this.messageQueue.push(message);
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });

    // Limit queue size
    if (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue = this.messageQueue.slice(0, this.config.messageQueueSize);
    }
  }

  /**
   * Process queued messages when connection is restored
   */
  private async processQueuedMessages(connectionId: string): Promise<void> {
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToProcess) {
      await this.sendMessage(connectionId, message);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Event system for WebSocket events
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  private emit(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Close specific connection
   */
  disconnect(connectionId: string): void {
    const connection = this.connections[connectionId];
    if (connection) {
      connection.close();
      delete this.connections[connectionId];
      this.stopHeartbeat(connectionId);
      
      if (this.reconnectTimers[connectionId]) {
        clearTimeout(this.reconnectTimers[connectionId]);
        delete this.reconnectTimers[connectionId];
      }
    }
  }

  /**
   * Close all connections and cleanup
   */
  disconnectAll(): void {
    Object.keys(this.connections).forEach(connectionId => {
      this.disconnect(connectionId);
    });
    
    Object.values(this.reconnectTimers).forEach(timer => clearTimeout(timer));
    Object.values(this.heartbeatTimers).forEach(timer => clearInterval(timer));
    
    this.connections = {};
    this.reconnectTimers = {};
    this.heartbeatTimers = {};
    this.messageQueue = [];
  }

  /**
   * Get connection pool status
   */
  getStatus() {
    return {
      activeConnections: Object.keys(this.connections).length,
      maxConnections: this.config.maxConnections,
      queuedMessages: this.messageQueue.length,
      connectionIds: Object.keys(this.connections)
    };
  }
}

// Singleton instance for healthcare platform
const webSocketService = new WebSocketService({
  maxConnections: 200,
  reconnectInterval: 3000,
  heartbeatInterval: 25000,
  messageQueueSize: 2000
});

export default webSocketService;
export { WebSocketService, WebSocketMessage };