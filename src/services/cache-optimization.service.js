// Cache Optimization Service for Enhanced Performance
class CacheOptimizationService {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                maxSize: 1000,
                defaultTTL: 300000, // 5 minutes
                cleanupInterval: 60000, // 1 minute
                compressionEnabled: true,
            }
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hitRate: 0,
                missRate: 0,
                totalRequests: 0,
                totalHits: 0,
                totalMisses: 0,
                memoryUsage: 0,
                entryCount: 0,
            }
        });
        Object.defineProperty(this, "cleanupTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.startCleanupTimer();
        this.setupMemoryPressureHandling();
    }
    static getInstance() {
        if (!CacheOptimizationService.instance) {
            CacheOptimizationService.instance = new CacheOptimizationService();
        }
        return CacheOptimizationService.instance;
    }
    /**
     * Update cache configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Restart cleanup timer if interval changed
        if (newConfig.cleanupInterval && this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.startCleanupTimer();
        }
    }
    /**
     * Set cache entry with intelligent eviction
     */
    set(key, value, ttl) {
        const entry = {
            key,
            value: this.config.compressionEnabled ? this.compress(value) : value,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultTTL,
            accessCount: 0,
            lastAccessed: Date.now(),
            size: this.calculateSize(value),
        };
        // Check if we need to evict entries
        if (this.cache.size >= this.config.maxSize) {
            this.evictEntries();
        }
        this.cache.set(key, entry);
        this.updateStats();
    }
    /**
     * Get cache entry with access tracking
     */
    get(key) {
        this.stats.totalRequests++;
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.totalMisses++;
            this.updateHitRate();
            return null;
        }
        // Check if entry has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.stats.totalMisses++;
            this.updateHitRate();
            return null;
        }
        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.stats.totalHits++;
        this.updateHitRate();
        return this.config.compressionEnabled
            ? this.decompress(entry.value)
            : entry.value;
    }
    /**
     * Check if key exists and is not expired
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete cache entry
     */
    delete(key) {
        const result = this.cache.delete(key);
        this.updateStats();
        return result;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.resetStats();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Intelligent cache eviction using LRU + LFU hybrid
     */
    evictEntries() {
        const entries = Array.from(this.cache.entries());
        // Sort by access frequency and recency
        entries.sort((a, b) => {
            const [, entryA] = a;
            const [, entryB] = b;
            // Combine access count and recency for scoring
            const scoreA = entryA.accessCount * 0.7 + (Date.now() - entryA.lastAccessed) * 0.3;
            const scoreB = entryB.accessCount * 0.7 + (Date.now() - entryB.lastAccessed) * 0.3;
            return scoreA - scoreB;
        });
        // Remove least valuable entries (25% of cache)
        const evictCount = Math.floor(this.config.maxSize * 0.25);
        for (let i = 0; i < evictCount && i < entries.length; i++) {
            this.cache.delete(entries[i][0]);
        }
        console.log(`Evicted ${evictCount} cache entries`);
    }
    /**
     * Start automatic cleanup timer
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired cache entries`);
            this.updateStats();
        }
    }
    /**
     * Setup memory pressure handling
     */
    setupMemoryPressureHandling() {
        // Monitor memory usage if available
        if ("memory" in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                if (usageRatio > 0.8) {
                    console.warn("High memory usage detected, performing aggressive cache cleanup");
                    this.aggressiveCleanup();
                }
            }, 30000); // Check every 30 seconds
        }
    }
    /**
     * Aggressive cleanup for memory pressure
     */
    aggressiveCleanup() {
        const entries = Array.from(this.cache.entries());
        // Remove 50% of entries, keeping most frequently accessed
        entries.sort((a, b) => b[1].accessCount - a[1].accessCount);
        const keepCount = Math.floor(entries.length * 0.5);
        const toRemove = entries.slice(keepCount);
        toRemove.forEach(([key]) => this.cache.delete(key));
        console.log(`Aggressive cleanup: removed ${toRemove.length} cache entries`);
        this.updateStats();
    }
    /**
     * Simple compression for cache values
     */
    compress(value) {
        try {
            return JSON.stringify(value);
        }
        catch (error) {
            console.warn("Failed to compress cache value:", error);
            return value;
        }
    }
    /**
     * Simple decompression for cache values
     */
    decompress(value) {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            console.warn("Failed to decompress cache value:", error);
            return value;
        }
    }
    /**
     * Calculate approximate size of value
     */
    calculateSize(value) {
        try {
            return JSON.stringify(value).length;
        }
        catch {
            return 0;
        }
    }
    /**
     * Update cache statistics
     */
    updateStats() {
        this.stats.entryCount = this.cache.size;
        this.stats.memoryUsage = Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
    }
    /**
     * Update hit rate statistics
     */
    updateHitRate() {
        if (this.stats.totalRequests > 0) {
            this.stats.hitRate = this.stats.totalHits / this.stats.totalRequests;
            this.stats.missRate = this.stats.totalMisses / this.stats.totalRequests;
        }
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            hitRate: 0,
            missRate: 0,
            totalRequests: 0,
            totalHits: 0,
            totalMisses: 0,
            memoryUsage: 0,
            entryCount: 0,
        };
    }
    /**
     * Get cache entries for debugging
     */
    getEntries() {
        return Array.from(this.cache.entries());
    }
    /**
     * Dispose of the service
     */
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
        this.resetStats();
    }
}
export const cacheOptimization = CacheOptimizationService.getInstance();
// React hook for cache optimization
export const useCacheOptimization = () => {
    const set = (key, value, ttl) => {
        cacheOptimization.set(key, value, ttl);
    };
    const get = (key) => {
        return cacheOptimization.get(key);
    };
    const has = (key) => {
        return cacheOptimization.has(key);
    };
    const remove = (key) => {
        return cacheOptimization.delete(key);
    };
    const clear = () => {
        cacheOptimization.clear();
    };
    const getStats = () => {
        return cacheOptimization.getStats();
    };
    return {
        set,
        get,
        has,
        remove,
        clear,
        getStats,
    };
};
export default cacheOptimization;
