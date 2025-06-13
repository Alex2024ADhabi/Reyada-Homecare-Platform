import { EventEmitter } from "events";
import * as React from "react";
export class RealTimeSyncService extends EventEmitter {
    constructor() {
        super();
        Object.defineProperty(this, "websocket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "subscriptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "pendingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    static getInstance() {
        if (!RealTimeSyncService.instance) {
            RealTimeSyncService.instance = new RealTimeSyncService();
        }
        return RealTimeSyncService.instance;
    }
    async connect(wsUrl) {
        const url = wsUrl || `ws://${window.location.host}/ws`;
        try {
            this.websocket = new WebSocket(url);
            this.websocket.onopen = () => {
                console.log("Real-time sync connected");
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit("connected");
                // Send any pending events
                this.processPendingEvents();
            };
            this.websocket.onmessage = (event) => {
                try {
                    const syncEvent = JSON.parse(event.data);
                    this.handleSyncEvent(syncEvent);
                }
                catch (error) {
                    console.error("Failed to parse sync event:", error);
                }
            };
            this.websocket.onclose = () => {
                console.log("Real-time sync disconnected");
                this.isConnected = false;
                this.emit("disconnected");
                this.attemptReconnect();
            };
            this.websocket.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.emit("error", error);
            };
        }
        catch (error) {
            console.error("Failed to connect to real-time sync:", error);
            throw error;
        }
    }
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.isConnected = false;
    }
    subscribe(entity, callback) {
        const subscription = { entity, callback };
        if (!this.subscriptions.has(entity)) {
            this.subscriptions.set(entity, []);
        }
        this.subscriptions.get(entity).push(subscription);
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
    publishEvent(event) {
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
        const syncEvent = {
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
        if (this.isConnected && this.websocket) {
            try {
                this.websocket.send(JSON.stringify(syncEvent));
            }
            catch (error) {
                console.error("Failed to send sync event:", error);
                this.pendingEvents.push(syncEvent);
            }
        }
        else {
            // Queue event for when connection is restored
            this.pendingEvents.push(syncEvent);
        }
        // Quality control: Limit pending events queue
        if (this.pendingEvents.length > 1000) {
            console.warn("Pending events queue is full, removing oldest events");
            this.pendingEvents = this.pendingEvents.slice(-1000);
        }
    }
    handleSyncEvent(event) {
        // Enhanced conflict resolution
        const resolvedEvent = this.resolveConflicts(event);
        const subscriptions = this.subscriptions.get(resolvedEvent.entity);
        if (subscriptions) {
            subscriptions.forEach((subscription) => {
                try {
                    subscription.callback(resolvedEvent);
                }
                catch (error) {
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
    resolveConflicts(event) {
        // Simple last-write-wins strategy
        // In production, implement more sophisticated conflict resolution
        const existingEvents = this.getStoredEvents(event.entity, event.id);
        if (existingEvents.length > 0) {
            const latestEvent = existingEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
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
    mergeEvents(latest, incoming) {
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
    storeEventForConflictResolution(event) {
        try {
            const key = `sync_events_${event.entity}_${event.id}`;
            const existingEvents = JSON.parse(localStorage.getItem(key) || "[]");
            existingEvents.push(event);
            // Keep only last 10 events per entity/id
            const recentEvents = existingEvents.slice(-10);
            localStorage.setItem(key, JSON.stringify(recentEvents));
        }
        catch (error) {
            console.error("Failed to store event for conflict resolution:", error);
        }
    }
    /**
     * Get stored events for conflict resolution
     */
    getStoredEvents(entity, id) {
        try {
            const key = `sync_events_${entity}_${id}`;
            return JSON.parse(localStorage.getItem(key) || "[]");
        }
        catch (error) {
            console.error("Failed to get stored events:", error);
            return [];
        }
    }
    /**
     * Log sync errors for debugging
     */
    logSyncError(error, event) {
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
            const existingLogs = JSON.parse(localStorage.getItem("sync_error_logs") || "[]");
            existingLogs.push(errorLog);
            // Keep only last 100 error logs
            const recentLogs = existingLogs.slice(-100);
            localStorage.setItem("sync_error_logs", JSON.stringify(recentLogs));
        }
        catch (e) {
            console.error("Failed to log sync error:", e);
        }
    }
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
            this.emit("max-reconnect-attempts");
            // Implement exponential backoff with jitter for final attempts
            setTimeout(() => {
                this.reconnectAttempts = 0; // Reset after extended delay
                this.attemptReconnect();
            }, 300000 + Math.random() * 60000); // 5-6 minutes
            return;
        }
        this.reconnectAttempts++;
        // Enhanced exponential backoff with jitter
        const baseDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        const jitter = Math.random() * 1000; // Add up to 1 second of jitter
        const delay = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
        console.log(`Attempting to reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
            // Check if we're still offline before attempting reconnection
            if (!navigator.onLine) {
                console.log("Still offline, delaying reconnection attempt");
                this.attemptReconnect();
                return;
            }
            this.connect().catch((error) => {
                console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
                this.attemptReconnect();
            });
        }, delay);
    }
    processPendingEvents() {
        if (this.pendingEvents.length > 0) {
            console.log(`Processing ${this.pendingEvents.length} pending sync events`);
            this.pendingEvents.forEach((event) => {
                if (this.websocket && this.isConnected) {
                    try {
                        this.websocket.send(JSON.stringify(event));
                    }
                    catch (error) {
                        console.error("Failed to send pending sync event:", error);
                    }
                }
            });
            this.pendingEvents = [];
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    getPendingEventsCount() {
        return this.pendingEvents.length;
    }
}
export const realTimeSyncService = RealTimeSyncService.getInstance();
// React hook for using real-time sync
export const useRealTimeSync = (entity) => {
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
    const subscribe = React.useCallback((callback) => {
        return realTimeSyncService.subscribe(entity, callback);
    }, [entity]);
    const publish = React.useCallback((event) => {
        realTimeSyncService.publishEvent({ ...event, entity });
    }, [entity]);
    return {
        isConnected,
        pendingEvents,
        subscribe,
        publish,
    };
};
