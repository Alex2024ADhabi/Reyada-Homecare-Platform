// Service Worker Management Service
export class ServiceWorkerService {
    constructor() {
        Object.defineProperty(this, "registration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        Object.defineProperty(this, "syncTasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "cacheStrategies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                {
                    name: "static-assets",
                    pattern: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                    strategy: "cache-first",
                    maxAge: 86400000, // 24 hours
                    maxEntries: 100,
                },
                {
                    name: "api-calls",
                    pattern: /\/api\//,
                    strategy: "network-first",
                    maxAge: 300000, // 5 minutes
                    maxEntries: 50,
                },
                {
                    name: "patient-data",
                    pattern: /\/api\/patients/,
                    strategy: "stale-while-revalidate",
                    maxAge: 600000, // 10 minutes
                    maxEntries: 200,
                },
                {
                    name: "clinical-forms",
                    pattern: /\/api\/clinical/,
                    strategy: "network-first",
                    maxAge: 180000, // 3 minutes
                    maxEntries: 100,
                },
                {
                    name: "documents",
                    pattern: /\.(pdf|doc|docx)$/,
                    strategy: "cache-first",
                    maxAge: 3600000, // 1 hour
                    maxEntries: 50,
                },
            ]
        });
        this.setupEventListeners();
        this.loadSyncTasks();
    }
    static getInstance() {
        if (!ServiceWorkerService.instance) {
            ServiceWorkerService.instance = new ServiceWorkerService();
        }
        return ServiceWorkerService.instance;
    }
    /**
     * Register service worker with enhanced error handling and retry logic
     */
    async register() {
        if (!ServiceWorkerService.isSupported()) {
            console.warn("Service Worker not supported");
            return;
        }
        let retryCount = 0;
        const maxRetries = 3;
        const attemptRegistration = async () => {
            try {
                this.registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                    updateViaCache: "none", // Always check for updates
                });
                console.log("Service Worker registered successfully");
                // Enhanced update handling
                this.registration.addEventListener("updatefound", () => {
                    const newWorker = this.registration?.installing;
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" &&
                                navigator.serviceWorker.controller) {
                                this.notifyUpdate();
                            }
                        });
                    }
                });
                // Enhanced message handling
                navigator.serviceWorker.addEventListener("message", this.handleMessage.bind(this));
                // Wait for service worker to be ready
                await navigator.serviceWorker.ready;
                // Initialize caching strategies
                await this.initializeCaching();
                // Start background sync if online
                if (this.isOnline) {
                    await this.startBackgroundSync();
                }
                // Set up periodic sync check
                this.setupPeriodicSync();
            }
            catch (error) {
                console.error(`Service Worker registration failed (attempt ${retryCount + 1}):`, error);
                if (retryCount < maxRetries) {
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    console.log(`Retrying service worker registration in ${delay}ms...`);
                    setTimeout(attemptRegistration, delay);
                }
                else {
                    console.error("Service Worker registration failed after all retries");
                    throw error;
                }
            }
        };
        await attemptRegistration();
    }
    /**
     * Unregister service worker
     */
    async unregister() {
        if (this.registration) {
            await this.registration.unregister();
            this.registration = null;
            console.log("Service Worker unregistered");
        }
    }
    /**
     * Update service worker
     */
    async update() {
        if (this.registration) {
            await this.registration.update();
        }
    }
    /**
     * Skip waiting and activate new service worker
     */
    async skipWaiting() {
        if (this.registration?.waiting) {
            this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
    }
    /**
     * Initialize caching strategies
     */
    async initializeCaching() {
        if (!this.registration?.active)
            return;
        // Send caching strategies to service worker
        this.registration.active.postMessage({
            type: "INIT_CACHE_STRATEGIES",
            strategies: this.cacheStrategies,
        });
        // Pre-cache critical resources
        await this.preCacheResources();
    }
    /**
     * Pre-cache critical resources
     */
    async preCacheResources() {
        const criticalResources = [
            "/",
            "/manifest.json",
            "/offline.html",
            // Add other critical resources
        ];
        if (this.registration?.active) {
            this.registration.active.postMessage({
                type: "PRE_CACHE",
                resources: criticalResources,
            });
        }
    }
    /**
     * Add task for background sync
     */
    addSyncTask(task) {
        const syncTask = {
            ...task,
            id: this.generateTaskId(),
            timestamp: Date.now(),
            retryCount: 0,
        };
        this.syncTasks.push(syncTask);
        this.saveSyncTasks();
        // If online, try to sync immediately
        if (this.isOnline) {
            this.processSyncTask(syncTask);
        }
        return syncTask.id;
    }
    /**
     * Remove sync task
     */
    removeSyncTask(taskId) {
        this.syncTasks = this.syncTasks.filter((task) => task.id !== taskId);
        this.saveSyncTasks();
    }
    /**
     * Get pending sync tasks
     */
    getPendingSyncTasks() {
        return [...this.syncTasks];
    }
    /**
     * Clear all sync tasks
     */
    clearSyncTasks() {
        this.syncTasks = [];
        this.saveSyncTasks();
    }
    /**
     * Start background sync with enhanced error handling
     */
    async startBackgroundSync() {
        if (!this.registration?.sync) {
            console.warn("Background Sync not supported, falling back to manual sync");
            this.setupManualSync();
            return;
        }
        try {
            await this.registration.sync.register("background-sync");
            await this.registration.sync.register("periodic-sync");
            console.log("Background sync registered successfully");
        }
        catch (error) {
            console.error("Background sync registration failed:", error);
            this.setupManualSync();
        }
    }
    /**
     * Setup manual sync as fallback
     */
    setupManualSync() {
        // Fallback to manual sync when background sync is not available
        setInterval(() => {
            if (this.isOnline && this.syncTasks.length > 0) {
                this.processAllSyncTasks();
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Setup periodic sync for maintenance tasks
     */
    setupPeriodicSync() {
        // Clean up old sync tasks periodically
        setInterval(() => {
            this.cleanupOldSyncTasks();
        }, 300000); // Every 5 minutes
        // Health check for service worker
        setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Every minute
    }
    /**
     * Clean up old sync tasks
     */
    cleanupOldSyncTasks() {
        const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
        const initialCount = this.syncTasks.length;
        this.syncTasks = this.syncTasks.filter((task) => {
            // Remove old completed or failed tasks
            return task.timestamp > cutoffTime || task.retryCount < task.maxRetries;
        });
        if (this.syncTasks.length < initialCount) {
            console.log(`Cleaned up ${initialCount - this.syncTasks.length} old sync tasks`);
            this.saveSyncTasks();
        }
    }
    /**
     * Perform health check on service worker
     */
    async performHealthCheck() {
        try {
            if (this.registration?.active) {
                this.registration.active.postMessage({
                    type: "HEALTH_CHECK",
                    timestamp: Date.now(),
                });
            }
        }
        catch (error) {
            console.error("Service worker health check failed:", error);
        }
    }
    /**
     * Process sync task
     */
    async processSyncTask(task) {
        try {
            const response = await fetch(task.url, {
                method: task.method,
                headers: {
                    "Content-Type": "application/json",
                    ...task.headers,
                },
                body: task.method !== "GET" ? JSON.stringify(task.data) : undefined,
            });
            if (response.ok) {
                // Task completed successfully
                this.removeSyncTask(task.id);
                console.log(`Sync task ${task.id} completed successfully`);
            }
            else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error(`Sync task ${task.id} failed:`, error);
            // Increment retry count
            task.retryCount++;
            if (task.retryCount >= task.maxRetries) {
                // Max retries reached, remove task
                this.removeSyncTask(task.id);
                console.error(`Sync task ${task.id} failed permanently after ${task.maxRetries} retries`);
            }
            else {
                // Schedule retry with exponential backoff
                const delay = Math.pow(2, task.retryCount) * 1000;
                setTimeout(() => {
                    if (this.isOnline) {
                        this.processSyncTask(task);
                    }
                }, delay);
            }
        }
    }
    /**
     * Process all pending sync tasks
     */
    async processAllSyncTasks() {
        if (!this.isOnline)
            return;
        // Sort tasks by priority and timestamp
        const sortedTasks = [...this.syncTasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            if (aPriority !== bPriority) {
                return bPriority - aPriority; // Higher priority first
            }
            return a.timestamp - b.timestamp; // Older tasks first
        });
        // Process tasks with rate limiting
        for (let i = 0; i < sortedTasks.length; i++) {
            const task = sortedTasks[i];
            await this.processSyncTask(task);
            // Add delay between tasks to avoid overwhelming the server
            if (i < sortedTasks.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
    }
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline events
        window.addEventListener("online", () => {
            this.isOnline = true;
            console.log("App is online");
            this.processAllSyncTasks();
        });
        window.addEventListener("offline", () => {
            this.isOnline = false;
            console.log("App is offline");
        });
        // Visibility change (for background sync)
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && this.isOnline) {
                this.processAllSyncTasks();
            }
        });
        // Before unload (save pending tasks)
        window.addEventListener("beforeunload", () => {
            this.saveSyncTasks();
        });
    }
    /**
     * Handle messages from service worker
     */
    handleMessage(event) {
        const { type, data } = event.data;
        switch (type) {
            case "CACHE_UPDATED":
                console.log("Cache updated:", data);
                break;
            case "SYNC_COMPLETED":
                console.log("Background sync completed:", data);
                break;
            case "SYNC_FAILED":
                console.error("Background sync failed:", data);
                break;
            default:
                console.log("Unknown message from service worker:", event.data);
        }
    }
    /**
     * Notify about service worker update
     */
    notifyUpdate() {
        // Create a custom event for the app to handle
        const event = new CustomEvent("sw-update-available", {
            detail: {
                registration: this.registration,
                skipWaiting: () => this.skipWaiting(),
            },
        });
        window.dispatchEvent(event);
    }
    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Save sync tasks to localStorage
     */
    saveSyncTasks() {
        try {
            localStorage.setItem("sw_sync_tasks", JSON.stringify(this.syncTasks));
        }
        catch (error) {
            console.error("Failed to save sync tasks:", error);
        }
    }
    /**
     * Load sync tasks from localStorage
     */
    loadSyncTasks() {
        try {
            const saved = localStorage.getItem("sw_sync_tasks");
            if (saved) {
                this.syncTasks = JSON.parse(saved);
            }
        }
        catch (error) {
            console.error("Failed to load sync tasks:", error);
            this.syncTasks = [];
        }
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const cacheNames = await caches.keys();
        const cacheStats = [];
        let totalSize = 0;
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            let cacheSize = 0;
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    cacheSize += blob.size;
                }
            }
            cacheStats.push({
                name: cacheName,
                size: cacheSize,
                entries: keys.length,
            });
            totalSize += cacheSize;
        }
        return {
            caches: cacheStats,
            totalSize,
        };
    }
    /**
     * Clear specific cache
     */
    async clearCache(cacheName) {
        await caches.delete(cacheName);
        console.log(`Cache ${cacheName} cleared`);
    }
    /**
     * Clear all caches
     */
    async clearAllCaches() {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("All caches cleared");
    }
    /**
     * Check if service worker is supported
     */
    static isSupported() {
        try {
            return typeof navigator !== "undefined" && "serviceWorker" in navigator;
        }
        catch (error) {
            console.warn("Error checking service worker support:", error);
            return false;
        }
    }
    /**
     * Get service worker status
     */
    getStatus() {
        return {
            supported: ServiceWorkerService.isSupported(),
            registered: !!this.registration,
            active: !!this.registration?.active,
            waiting: !!this.registration?.waiting,
            installing: !!this.registration?.installing,
            online: this.isOnline,
            pendingTasks: this.syncTasks.length,
        };
    }
}
// Export singleton instance
export const serviceWorkerService = ServiceWorkerService.getInstance();
