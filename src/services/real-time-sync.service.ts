import { EventEmitter } from "events";
import * as React from "react";
import { supabase } from "@/api/supabase.api";
import { RealtimeChannel } from "@supabase/supabase-js";

interface SyncEvent {
  type: "create" | "update" | "delete";
  entity: string;
  id: string;
  data?: any;
  timestamp: string;
  userId?: string;
}

interface SyncSubscription {
  entity: string;
  callback: (event: SyncEvent) => void;
}

interface RealtimeEvent {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: any;
  old?: any;
  timestamp: string;
}

export class RealTimeSyncService extends EventEmitter {
  private static instance: RealTimeSyncService;
  private websocket: WebSocket | null = null;
  private subscriptions: Map<string, SyncSubscription[]> = new Map();
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private pendingEvents: SyncEvent[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  public async connect(wsUrl?: string): Promise<void> {
    // For Supabase, we don't need a separate WebSocket connection
    // Real-time functionality is handled through Supabase channels
    this.isConnected = true;
    this.emit("connected");
    console.log("Real-time sync service connected via Supabase");
  }

  public disconnect(): void {
    // Unsubscribe from all Supabase channels
    this.realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.realtimeChannels.clear();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.emit("disconnected");
  }

  // Subscribe to real-time changes for a specific table
  public subscribeToTable(
    tableName: string,
    callback: (event: RealtimeEvent) => void,
    filter?: { column: string; value: any },
  ): () => void {
    const channelName = filter
      ? `${tableName}_${filter.column}_${filter.value}`
      : tableName;

    if (this.realtimeChannels.has(channelName)) {
      console.log(`Already subscribed to ${channelName}`);
      return () => this.unsubscribeFromTable(channelName);
    }

    let channel = supabase.channel(channelName);

    if (filter) {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => this.handleRealtimeEvent(payload, callback),
      );
    } else {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload) => this.handleRealtimeEvent(payload, callback),
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to ${channelName}`);
      }
    });

    this.realtimeChannels.set(channelName, channel);

    return () => this.unsubscribeFromTable(channelName);
  }

  private handleRealtimeEvent(
    payload: any,
    callback: (event: RealtimeEvent) => void,
  ) {
    const event: RealtimeEvent = {
      table: payload.table,
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
      timestamp: new Date().toISOString(),
    };

    try {
      callback(event);
    } catch (error) {
      console.error("Error in realtime event handler:", error);
    }
  }

  private unsubscribeFromTable(channelName: string) {
    const channel = this.realtimeChannels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  public subscribe(
    entity: string,
    callback: (event: SyncEvent) => void,
  ): () => void {
    const subscription: SyncSubscription = { entity, callback };

    if (!this.subscriptions.has(entity)) {
      this.subscriptions.set(entity, []);
    }

    this.subscriptions.get(entity)!.push(subscription);

    // Return unsubscribe function
    return () => {
      const subscriptions = this.subscriptions.get(entity);
      if (subscriptions) {
        const index = subscriptions.indexOf(subscription);
        if (index > -1) {
          subscriptions.splice(index, 1);
        }

        if (subscriptions.length === 0) {
          this.subscriptions.delete(entity);
        }
      }
    };
  }

  public publishEvent(event: Omit<SyncEvent, "timestamp">): void {
    // Quality control: Validate event data
    if (!event.type || !event.entity || !event.id) {
      console.error("Invalid sync event: missing required fields", event);
      return;
    }

    // Quality control: Validate event type
    const validTypes = ["create", "update", "delete"];
    if (!validTypes.includes(event.type)) {
      console.error("Invalid sync event type:", event.type);
      return;
    }

    const syncEvent: SyncEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Quality control: Check payload size
    const eventSize = JSON.stringify(syncEvent).length;
    if (eventSize > 1024 * 1024) {
      // 1MB limit
      console.error("Sync event payload too large:", eventSize, "bytes");
      return;
    }

    // Handle the sync event locally
    this.handleSyncEvent(syncEvent);

    // Broadcast to other clients via Supabase
    this.broadcastEvent("sync_events", "sync_event", syncEvent);
  }

  private handleSyncEvent(event: SyncEvent): void {
    // Enhanced conflict resolution
    const resolvedEvent = this.resolveConflicts(event);

    const subscriptions = this.subscriptions.get(resolvedEvent.entity);
    if (subscriptions) {
      subscriptions.forEach((subscription) => {
        try {
          subscription.callback(resolvedEvent);
        } catch (error) {
          console.error("Error in sync event callback:", error);
          // Log error for debugging
          this.logSyncError(error, resolvedEvent);
        }
      });
    }

    // Store event for conflict resolution
    this.storeEventForConflictResolution(resolvedEvent);

    // Emit global event
    this.emit("sync-event", resolvedEvent);
  }

  /**
   * Resolve conflicts in sync events
   */
  private resolveConflicts(event: SyncEvent): SyncEvent {
    // Simple last-write-wins strategy
    // In production, implement more sophisticated conflict resolution
    const existingEvents = this.getStoredEvents(event.entity, event.id);

    if (existingEvents.length > 0) {
      const latestEvent = existingEvents.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0];

      // If incoming event is older, merge with latest
      if (new Date(event.timestamp) < new Date(latestEvent.timestamp)) {
        return this.mergeEvents(latestEvent, event);
      }
    }

    return event;
  }

  /**
   * Merge conflicting events
   */
  private mergeEvents(latest: SyncEvent, incoming: SyncEvent): SyncEvent {
    // Simple merge strategy - in production, implement field-level merging
    return {
      ...latest,
      data: {
        ...latest.data,
        ...incoming.data,
        _conflictResolved: true,
        _mergedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Store event for conflict resolution
   */
  private storeEventForConflictResolution(event: SyncEvent): void {
    try {
      const key = `sync_events_${event.entity}_${event.id}`;
      const existingEvents = JSON.parse(localStorage.getItem(key) || "[]");
      existingEvents.push(event);

      // Keep only last 10 events per entity/id
      const recentEvents = existingEvents.slice(-10);
      localStorage.setItem(key, JSON.stringify(recentEvents));
    } catch (error) {
      console.error("Failed to store event for conflict resolution:", error);
    }
  }

  /**
   * Get stored events for conflict resolution
   */
  private getStoredEvents(entity: string, id: string): SyncEvent[] {
    try {
      const key = `sync_events_${entity}_${id}`;
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
      console.error("Failed to get stored events:", error);
      return [];
    }
  }

  /**
   * Log sync errors for debugging
   */
  private logSyncError(error: any, event: SyncEvent): void {
    const errorLog = {
      error: error.message || error.toString(),
      event: {
        type: event.type,
        entity: event.entity,
        id: event.id,
        timestamp: event.timestamp,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const existingLogs = JSON.parse(
        localStorage.getItem("sync_error_logs") || "[]",
      );
      existingLogs.push(errorLog);

      // Keep only last 100 error logs
      const recentLogs = existingLogs.slice(-100);
      localStorage.setItem("sync_error_logs", JSON.stringify(recentLogs));
    } catch (e) {
      console.error("Failed to log sync error:", e);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.emit("max-reconnect-attempts");

      // Implement exponential backoff with jitter for final attempts
      setTimeout(
        () => {
          this.reconnectAttempts = 0; // Reset after extended delay
          this.attemptReconnect();
        },
        300000 + Math.random() * 60000,
      ); // 5-6 minutes
      return;
    }

    this.reconnectAttempts++;

    // Enhanced exponential backoff with jitter
    const baseDelay =
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds

    console.log(
      `Attempting to reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      // Check if we're still offline before attempting reconnection
      if (!navigator.onLine) {
        console.log("Still offline, delaying reconnection attempt");
        this.attemptReconnect();
        return;
      }

      this.connect().catch((error) => {
        console.error(
          `Reconnection attempt ${this.reconnectAttempts} failed:`,
          error,
        );
        this.attemptReconnect();
      });
    }, delay);
  }

  private processPendingEvents(): void {
    if (this.pendingEvents.length > 0) {
      console.log(
        `Processing ${this.pendingEvents.length} pending sync events`,
      );

      this.pendingEvents.forEach((event) => {
        this.handleSyncEvent(event);
      });

      this.pendingEvents = [];
    }
  }

  // Broadcast custom events via Supabase
  public async broadcastEvent(
    channel: string,
    event: string,
    payload: any,
  ): Promise<void> {
    try {
      const broadcastChannel = supabase.channel(channel);
      await broadcastChannel.send({
        type: "broadcast",
        event,
        payload,
      });
    } catch (error) {
      console.error("Failed to broadcast event:", error);
    }
  }

  // Listen for custom broadcasts
  public listenToBroadcast(
    channel: string,
    event: string,
    callback: (payload: any) => void,
  ): () => void {
    const channelName = `broadcast_${channel}_${event}`;

    if (this.realtimeChannels.has(channelName)) {
      console.log(`Already listening to broadcast ${channelName}`);
      return () => this.unsubscribeFromTable(channelName);
    }

    const broadcastChannel = supabase
      .channel(channel)
      .on("broadcast", { event }, callback)
      .subscribe();

    this.realtimeChannels.set(channelName, broadcastChannel);

    return () => this.unsubscribeFromTable(channelName);
  }

  // Sync patient data in real-time
  public syncPatientData(
    patientId: string,
    callback: (event: RealtimeEvent) => void,
  ): () => void {
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to patient updates
    unsubscribeFunctions.push(
      this.subscribeToTable("patients", callback, {
        column: "id",
        value: patientId,
      }),
    );

    // Subscribe to patient episodes
    unsubscribeFunctions.push(
      this.subscribeToTable("patient_episodes", callback, {
        column: "patient_id",
        value: patientId,
      }),
    );

    // Subscribe to clinical forms
    unsubscribeFunctions.push(
      this.subscribeToTable("clinical_forms", callback, {
        column: "patient_id",
        value: patientId,
      }),
    );

    // Subscribe to claims
    unsubscribeFunctions.push(
      this.subscribeToTable("daman_claims", callback, {
        column: "patient_id",
        value: patientId,
      }),
    );

    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }

  // Sync clinical team updates
  public syncClinicalTeam(
    clinicianId: string,
    callback: (event: RealtimeEvent) => void,
  ): () => void {
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to assigned episodes
    unsubscribeFunctions.push(
      this.subscribeToTable("patient_episodes", callback, {
        column: "assigned_clinician",
        value: clinicianId,
      }),
    );

    // Subscribe to clinical forms by clinician
    unsubscribeFunctions.push(
      this.subscribeToTable("clinical_forms", callback, {
        column: "clinician_id",
        value: clinicianId,
      }),
    );

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getPendingEventsCount(): number {
    return this.pendingEvents.length;
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();

// React hook for using real-time sync
export const useRealTimeSync = (entity: string) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [pendingEvents, setPendingEvents] = React.useState(0);

  React.useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(realTimeSyncService.getConnectionStatus());
      setPendingEvents(realTimeSyncService.getPendingEventsCount());
    };

    realTimeSyncService.on("connected", updateConnectionStatus);
    realTimeSyncService.on("disconnected", updateConnectionStatus);
    realTimeSyncService.on("sync-event", updateConnectionStatus);

    updateConnectionStatus();

    return () => {
      realTimeSyncService.off("connected", updateConnectionStatus);
      realTimeSyncService.off("disconnected", updateConnectionStatus);
      realTimeSyncService.off("sync-event", updateConnectionStatus);
    };
  }, []);

  const subscribe = React.useCallback(
    (callback: (event: SyncEvent) => void) => {
      return realTimeSyncService.subscribe(entity, callback);
    },
    [entity],
  );

  const publish = React.useCallback(
    (event: Omit<SyncEvent, "timestamp" | "entity">) => {
      realTimeSyncService.publishEvent({ ...event, entity });
    },
    [entity],
  );

  return {
    isConnected,
    pendingEvents,
    subscribe,
    publish,
  };
};
