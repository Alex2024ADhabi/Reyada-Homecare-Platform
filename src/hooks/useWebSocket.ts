import { useEffect, useRef, useState, useCallback } from "react";
import websocketService from "@/services/websocket.service";

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (event: any) => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

interface WebSocketHookReturn {
  isConnected: boolean;
  connectionState: string;
  send: (type: string, data: any, options?: any) => boolean;
  sendWithAck: (type: string, data: any, options?: any) => Promise<any>;
  subscribe: (eventType: string, callback: Function) => () => void;
  metrics: any;
  queueStatus: any;
  reconnect: () => void;
  disconnect: () => void;
  clearQueues: () => void;
}

export const useWebSocket = (
  options: UseWebSocketOptions = {},
): WebSocketHookReturn => {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onMessage,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [metrics, setMetrics] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);

  const subscriptionsRef = useRef<(() => void)[]>([]);

  // Update connection state
  useEffect(() => {
    const updateConnectionState = () => {
      const connected = websocketService.isConnected();
      const state = websocketService.getConnectionState();

      setIsConnected(connected);
      setConnectionState(state);
    };

    // Initial state
    updateConnectionState();

    // Listen for connection events
    const unsubscribeConnect = websocketService.on("connected", (data) => {
      updateConnectionState();
      onConnect?.();
    });

    const unsubscribeDisconnect = websocketService.on(
      "disconnected",
      (data) => {
        updateConnectionState();
        onDisconnect?.(data);
      },
    );

    const unsubscribeError = websocketService.on("error", (data) => {
      onError?.(data);
    });

    const unsubscribeMessage = websocketService.on("message", (data) => {
      onMessage?.(data);
    });

    // Store unsubscribe functions
    subscriptionsRef.current.push(
      unsubscribeConnect,
      unsubscribeDisconnect,
      unsubscribeError,
      unsubscribeMessage,
    );

    return () => {
      subscriptionsRef.current.forEach((unsub) => unsub());
      subscriptionsRef.current = [];
    };
  }, [onConnect, onDisconnect, onMessage, onError]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      try {
        const connectionMetrics = websocketService.getConnectionMetrics();
        const queueInfo = websocketService.getQueueStatus();

        setMetrics(connectionMetrics);
        setQueueStatus(queueInfo);
      } catch (error) {
        console.warn("Failed to get WebSocket metrics:", error);
      }
    };

    // Initial update
    updateMetrics();

    // Update every 10 seconds
    const interval = setInterval(updateMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (
      autoConnect &&
      !websocketService.isConnected() &&
      !websocketService.isConnecting()
    ) {
      websocketService.connect();
    }
  }, [autoConnect]);

  // Memoized functions
  const send = useCallback((type: string, data: any, options?: any) => {
    return websocketService.send(type, data, options);
  }, []);

  const sendWithAck = useCallback((type: string, data: any, options?: any) => {
    return websocketService.sendWithAck(type, data, options);
  }, []);

  const subscribe = useCallback((eventType: string, callback: Function) => {
    const unsubscribe = websocketService.on(eventType, callback);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const reconnect = useCallback(() => {
    websocketService.forceReconnect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const clearQueues = useCallback(() => {
    websocketService.clearQueues();
  }, []);

  return {
    isConnected,
    connectionState,
    send,
    sendWithAck,
    subscribe,
    metrics,
    queueStatus,
    reconnect,
    disconnect,
    clearQueues,
  };
};

export default useWebSocket;
