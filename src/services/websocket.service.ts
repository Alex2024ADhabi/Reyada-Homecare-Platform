// WebSocket Service for real-time communication
import {
  WEBSOCKET_CONFIG,
  PUBSUB_CHANNELS,
  CONNECTION_MANAGEMENT,
  NOTIFICATION_CONFIG,
} from "@/config/messaging.config";
import offlineService from "./offline.service";

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Event) => void;

interface QueuedMessage {
  type: string;
  data: any;
  timestamp: number;
  retries?: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts =
    CONNECTION_MANAGEMENT?.reconnectStrategy?.maxAttempts || 10;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: {
    onConnect: Set<ConnectionHandler>;
    onDisconnect: Set<ConnectionHandler>;
    onError: Set<ErrorHandler>;
  } = {
    onConnect: new Set(),
    onDisconnect: new Set(),
    onError: new Set(),
  };
  private pingInterval: number | null = null;
  private messageQueue: QueuedMessage[] = [];
  private userId: string | null = null;
  private connectionId: string | null = null;
  private lastActivity: number = Date.now();
  private connectionStartTime: number = 0;
  private messagesSent: number = 0;
  private messagesReceived: number = 0;
  private connectionStatus:
    | "CONNECTING"
    | "CONNECTED"
    | "DISCONNECTED"
    | "RECONNECTING" = "DISCONNECTED";
  private rateLimitCounter: Map<string, number> = new Map();
  private rateLimitInterval: number | null = null;

  constructor() {
    // Initialize rate limiting
    this.rateLimitInterval = window.setInterval(() => {
      this.rateLimitCounter.clear();
    }, 60000); // Reset counters every minute

    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Listen for visibility change to handle background/foreground transitions
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  // Initialize WebSocket connection
  connect(userId?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.userId = userId || localStorage.getItem("user_id") || null;
    this.connectionStatus = "CONNECTING";
    this.connectionStartTime = Date.now();

    try {
      const token = localStorage.getItem("auth_token");
      let url = `${WEBSOCKET_CONFIG.server}${WEBSOCKET_CONFIG.path}?token=${token}`;

      // Add user ID if available
      if (this.userId) {
        url += `&userId=${this.userId}`;
      }

      // Add client info
      url += `&client=web&version=1.0.0&timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`;

      this.socket = new WebSocket(url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);

      // Set a connection timeout
      setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          console.warn("WebSocket connection timeout");
          this.socket?.close();
        }
      }, WEBSOCKET_CONFIG.security?.authTimeout || 10000);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.connectionStatus = "DISCONNECTED";
      this.attemptReconnect();
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    this.connectionStatus = "DISCONNECTED";

    if (this.socket) {
      // Send a clean disconnect message if possible
      if (this.socket.readyState === WebSocket.OPEN) {
        try {
          this.send("disconnect", { reason: "user_initiated" });
        } catch (e) {
          // Ignore errors during disconnect
        }
      }

      this.socket.close();
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.rateLimitInterval) {
      clearInterval(this.rateLimitInterval);
      this.rateLimitInterval = null;
    }

    // Clear connection ID
    this.connectionId = null;
  }

  // Subscribe to a channel
  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(channel)) {
      this.messageHandlers.set(channel, new Set());

      // Send subscribe message to server if connected
      if (this.isConnected()) {
        this.send("subscribe", { channel });
      }
    }

    this.messageHandlers.get(channel)?.add(handler);

    // Return unsubscribe function
    return () => this.unsubscribe(channel, handler);
  }

  // Subscribe to a user-specific channel
  subscribeToUser(handler: MessageHandler): () => void {
    if (!this.userId) {
      console.warn("Cannot subscribe to user channel: No user ID available");
      return () => {};
    }

    const userChannel = NOTIFICATION_CONFIG.channels.user.replace(
      "{userId}",
      this.userId,
    );
    return this.subscribe(userChannel, handler);
  }

  // Subscribe to a role-specific channel
  subscribeToRole(roleId: string, handler: MessageHandler): () => void {
    const roleChannel = NOTIFICATION_CONFIG.channels.role.replace(
      "{roleId}",
      roleId,
    );
    return this.subscribe(roleChannel, handler);
  }

  // Subscribe to broadcast channel
  subscribeToBroadcast(handler: MessageHandler): () => void {
    return this.subscribe(NOTIFICATION_CONFIG.channels.broadcast, handler);
  }

  // Unsubscribe from a channel
  unsubscribe(channel: string, handler?: MessageHandler): void {
    if (!this.messageHandlers.has(channel)) return;

    if (handler) {
      this.messageHandlers.get(channel)?.delete(handler);

      // If no handlers left, unsubscribe from channel
      if (this.messageHandlers.get(channel)?.size === 0) {
        this.messageHandlers.delete(channel);

        // Send unsubscribe message to server if connected
        if (this.isConnected()) {
          this.send("unsubscribe", { channel });
        }
      }
    } else {
      // Remove all handlers for this channel
      this.messageHandlers.delete(channel);

      // Send unsubscribe message to server if connected
      if (this.isConnected()) {
        this.send("unsubscribe", { channel });
      }
    }
  }

  // Send a message to the server
  send(type: string, data: any): void {
    this.lastActivity = Date.now();

    // Check rate limiting
    if (!this.checkRateLimit(type)) {
      console.warn("Rate limit exceeded for message type:", type);
      return;
    }

    if (!this.isConnected()) {
      // Queue message for later if it's important
      if (["publish", "subscribe", "unsubscribe"].includes(type)) {
        this.queueMessage(type, data);
      }

      console.warn("WebSocket not connected. Message not sent:", {
        type,
        data,
      });
      return;
    }

    try {
      const message = JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        connectionId: this.connectionId,
      });

      this.socket?.send(message);
      this.messagesSent++;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  }

  // Queue a message for later sending
  private queueMessage(type: string, data: any): void {
    // Don't queue too many messages
    if (this.messageQueue.length >= 100) {
      this.messageQueue.shift(); // Remove oldest message
    }

    this.messageQueue.push({
      type,
      data,
      timestamp: Date.now(),
    });

    // If offline, store in offline service
    if (!navigator.onLine) {
      offlineService.addToQueue({
        type: "websocket",
        messageType: type,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Process queued messages
  private processQueue(): void {
    if (!this.isConnected() || this.messageQueue.length === 0) return;

    // Process queue with a small delay between messages
    const processNext = () => {
      if (this.messageQueue.length === 0 || !this.isConnected()) return;

      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.type, message.data);
      }

      // Process next message with a small delay
      if (this.messageQueue.length > 0) {
        setTimeout(processNext, 100);
      }
    };

    processNext();
  }

  // Check rate limiting
  private checkRateLimit(type: string): boolean {
    if (!WEBSOCKET_CONFIG.security?.rateLimiting?.enabled) return true;

    const count = this.rateLimitCounter.get(type) || 0;
    const maxPerMinute =
      WEBSOCKET_CONFIG.security?.rateLimiting?.maxMessagesPerMinute || 200;

    if (count >= maxPerMinute) {
      return false;
    }

    this.rateLimitCounter.set(type, count + 1);
    return true;
  }

  // Publish a message to a channel
  publish(channel: string, data: any): void {
    this.send("publish", { channel, data });
  }

  // Register connection event handlers
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onConnect.add(handler);

    // If already connected, call handler immediately
    if (this.isConnected()) {
      handler();
    }

    // Return unregister function
    return () => {
      this.connectionHandlers.onConnect.delete(handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onDisconnect.add(handler);

    // Return unregister function
    return () => {
      this.connectionHandlers.onDisconnect.delete(handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.connectionHandlers.onError.add(handler);

    // Return unregister function
    return () => {
      this.connectionHandlers.onError.delete(handler);
    };
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Get connection status
  getStatus(): {
    status: string;
    uptime: number;
    messagesSent: number;
    messagesReceived: number;
    lastActivity: number;
    reconnectAttempts: number;
  } {
    const uptime =
      this.connectionStartTime > 0 ? Date.now() - this.connectionStartTime : 0;

    return {
      status: this.connectionStatus,
      uptime,
      messagesSent: this.messagesSent,
      messagesReceived: this.messagesReceived,
      lastActivity: this.lastActivity,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Handle online event
  private handleOnline(): void {
    console.log("Network online, reconnecting WebSocket...");
    if (!this.isConnected()) {
      this.reconnectAttempts = 0; // Reset reconnect attempts
      this.connect();
    }
  }

  // Handle offline event
  private handleOffline(): void {
    console.log("Network offline, WebSocket will reconnect when online");
    // We don't disconnect here, as the socket will close automatically
    // and we'll try to reconnect when back online
  }

  // Handle visibility change
  private handleVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      // App came to foreground
      if (!this.isConnected()) {
        console.log("App in foreground, reconnecting WebSocket...");
        this.connect();
      }
    } else {
      // App went to background
      // Optionally disconnect to save battery, or keep connection open
      // this.disconnect();
    }
  }

  // Handle WebSocket open event
  private handleOpen(event: Event): void {
    console.log("WebSocket connected");
    this.connectionStatus = "CONNECTED";
    this.reconnectAttempts = 0;
    this.connectionStartTime = Date.now();

    // Setup ping interval to keep connection alive
    this.pingInterval = window.setInterval(() => {
      this.send("ping", { timestamp: Date.now() });
    }, WEBSOCKET_CONFIG.pingInterval);

    // Subscribe to all channels
    this.messageHandlers.forEach((_, channel) => {
      this.send("subscribe", { channel });
    });

    // Process any queued messages
    this.processQueue();

    // Notify connection handlers
    this.connectionHandlers.onConnect.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error("Error in connect handler:", error);
      }
    });
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    this.connectionStatus = "DISCONNECTED";
    console.log("WebSocket disconnected:", event.code, event.reason);

    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Notify disconnect handlers
    this.connectionHandlers.onDisconnect.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error("Error in disconnect handler:", error);
      }
    });

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  // Handle WebSocket error event
  private handleError(event: Event): void {
    console.error("WebSocket error:", event);

    // Notify error handlers
    this.connectionHandlers.onError.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in error handler:", error);
      }
    });
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent): void {
    this.lastActivity = Date.now();
    this.messagesReceived++;

    try {
      const message = JSON.parse(event.data);

      // Handle system messages
      if (message.type === "pong") {
        // Ping-pong for connection health check
        return;
      }

      // Handle connection ID assignment
      if (message.type === "connection_established") {
        this.connectionId = message.data?.connectionId;
        console.log(
          "WebSocket connection established with ID:",
          this.connectionId,
        );
        return;
      }

      // Handle channel messages
      if (message.channel && message.data) {
        const handlers = this.messageHandlers.get(message.channel);
        handlers?.forEach((handler) => {
          try {
            handler(message.data);
          } catch (error) {
            console.error(
              `Error in message handler for channel ${message.channel}:`,
              error,
            );
          }
        });
      }

      // Handle direct messages
      if (message.type === "direct" && message.data) {
        // Process direct messages that aren't tied to a channel
        console.log("Received direct message:", message.data);
      }

      // Handle chat messages specifically
      if (message.type === "chat_message" && message.data) {
        const chatChannel = `chat_group_${message.data.group_id}`;
        const handlers = this.messageHandlers.get(chatChannel);
        handlers?.forEach((handler) => {
          try {
            handler(message.data);
          } catch (error) {
            console.error(
              `Error in chat message handler for group ${message.data.group_id}:`,
              error,
            );
          }
        });
      }

      // Handle email notifications
      if (message.type === "email_notification" && message.data) {
        const emailChannel = "email_notifications";
        const handlers = this.messageHandlers.get(emailChannel);
        handlers?.forEach((handler) => {
          try {
            handler(message.data);
          } catch (error) {
            console.error("Error in email notification handler:", error);
          }
        });
      }

      // Handle committee notifications
      if (message.type === "committee_notification" && message.data) {
        const committeeChannel = `committee_${message.data.committee_id}`;
        const handlers = this.messageHandlers.get(committeeChannel);
        handlers?.forEach((handler) => {
          try {
            handler(message.data);
          } catch (error) {
            console.error(
              `Error in committee notification handler for ${message.data.committee_id}:`,
              error,
            );
          }
        });
      }

      // Handle error messages
      if (message.type === "error") {
        console.error("WebSocket server error:", message.data);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Maximum reconnection attempts reached");
      return;
    }

    this.connectionStatus = "RECONNECTING";

    // Calculate delay with exponential backoff and jitter
    const baseDelay = Math.min(
      CONNECTION_MANAGEMENT?.reconnectStrategy?.initialDelay ||
        1000 *
          Math.pow(
            CONNECTION_MANAGEMENT?.reconnectStrategy?.factor || 2,
            this.reconnectAttempts,
          ),
      CONNECTION_MANAGEMENT?.reconnectStrategy?.maxDelay || 30000,
    );

    // Add jitter to prevent all clients reconnecting simultaneously
    const jitter = CONNECTION_MANAGEMENT?.reconnectStrategy?.jitter
      ? Math.random() * 0.5 * baseDelay
      : 0;

    const delay = baseDelay + jitter;

    console.log(
      `Attempting to reconnect in ${Math.round(delay / 1000)}s... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
    );

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Export predefined channels and service
export { PUBSUB_CHANNELS };
export default websocketService;
