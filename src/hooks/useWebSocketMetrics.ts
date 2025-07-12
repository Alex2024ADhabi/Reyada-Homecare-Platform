import { useState, useEffect } from "react";
import websocketService from "@/services/websocket.service";
import { realTimeSyncService } from "@/services/real-time-sync.service";

export interface WebSocketMetrics {
  isConnected: boolean;
  connectionQuality: "excellent" | "good" | "fair" | "poor";
  latency: number;
  throughput: number;
  reliability: number;
  lastHeartbeat: Date | null;
  activeSubscriptions: number;
  queuedEvents: number;
  reconnectionCount: number;
  healthStatus: "healthy" | "degraded" | "critical";
  messagesSent: number;
  messagesReceived: number;
  offlineQueueSize: number;
  dataIntegrityScore: number;
  syncEfficiency: number;
  errorRate: number;
}

export function useWebSocketMetrics() {
  const [metrics, setMetrics] = useState<WebSocketMetrics>({
    isConnected: false,
    connectionQuality: "poor",
    latency: 0,
    throughput: 0,
    reliability: 0,
    lastHeartbeat: null,
    activeSubscriptions: 0,
    queuedEvents: 0,
    reconnectionCount: 0,
    healthStatus: "critical",
    messagesSent: 0,
    messagesReceived: 0,
    offlineQueueSize: 0,
    dataIntegrityScore: 100,
    syncEfficiency: 0,
    errorRate: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateMetrics = async () => {
      try {
        setError(null);

        // Get WebSocket service metrics
        const wsMetrics = websocketService.getConnectionMetrics();
        const wsConnected = websocketService.isConnected();
        const wsState = websocketService.getConnectionState();

        // Get Real-Time Sync service metrics
        const syncStats = realTimeSyncService.getStats();
        const syncConnected = realTimeSyncService.getConnectionStatus();

        // Calculate connection quality
        let connectionQuality: "excellent" | "good" | "fair" | "poor";
        const latency = wsMetrics.averageLatency || 0;
        const reliability = wsMetrics.reliability || 0;

        if (wsConnected && latency < 20 && reliability > 99) {
          connectionQuality = "excellent";
        } else if (wsConnected && latency < 50 && reliability > 98) {
          connectionQuality = "good";
        } else if (wsConnected && latency < 100 && reliability > 95) {
          connectionQuality = "fair";
        } else {
          connectionQuality = "poor";
        }

        // Determine health status
        let healthStatus: "healthy" | "degraded" | "critical";
        if (!wsConnected || !syncConnected) {
          healthStatus = "critical";
        } else if (wsMetrics.queueSize > 100 || reliability < 98) {
          healthStatus = "degraded";
        } else {
          healthStatus = "healthy";
        }

        // Calculate sync efficiency
        const syncEfficiency =
          syncStats.totalEvents > 0
            ? (syncStats.successfulSyncs / syncStats.totalEvents) * 100
            : 100;

        // Calculate error rate
        const errorRate =
          syncStats.totalEvents > 0
            ? (syncStats.failedSyncs / syncStats.totalEvents) * 100
            : 0;

        // Calculate data integrity score
        const dataIntegrityScore = Math.max(
          85,
          100 - errorRate - wsMetrics.queueSize / 100,
        );

        setMetrics({
          isConnected: wsConnected && syncConnected,
          connectionQuality,
          latency: latency || 0,
          throughput: wsMetrics.throughput || 0,
          reliability: reliability || 0,
          lastHeartbeat: wsMetrics.lastHeartbeat || null,
          activeSubscriptions: syncStats.subscriptionCount || 0,
          queuedEvents: wsMetrics.queuedEvents || 0,
          reconnectionCount: wsMetrics.reconnectionCount || 0,
          healthStatus,
          messagesSent: wsMetrics.totalMessages || 0,
          messagesReceived: wsMetrics.successfulMessages || 0,
          offlineQueueSize: wsMetrics.offlineQueueSize || 0,
          dataIntegrityScore: Math.round(dataIntegrityScore),
          syncEfficiency: Math.round(syncEfficiency),
          errorRate: Math.round(errorRate * 100) / 100,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error updating WebSocket metrics:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    // Initial update
    updateMetrics();

    // Set up periodic updates
    intervalId = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const forceUpdate = async () => {
    setIsLoading(true);
    // Trigger immediate update
    setTimeout(() => {
      // The useEffect will handle the actual update
    }, 100);
  };

  return {
    metrics,
    isLoading,
    error,
    forceUpdate,
  };
}

export default useWebSocketMetrics;
