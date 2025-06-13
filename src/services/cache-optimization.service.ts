// Cache Optimization Service for Enhanced Performance

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionEnabled?: boolean;
}

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
  entryCount: number;
}

class CacheOptimizationService {
  private static instance: CacheOptimizationService;
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    cleanupInterval: 60000, // 1 minute
    compressionEnabled: true,
  };
  private stats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    memoryUsage: 0,
    entryCount: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupTimer();
    this.setupMemoryPressureHandling();
  }

  public static getInstance(): CacheOptimizationService {
    if (!CacheOptimizationService.instance) {
      CacheOptimizationService.instance = new CacheOptimizationService();
    }
    return CacheOptimizationService.instance;
  }

  /**
   * Update cache configuration
   */
  public updateConfig(newConfig: Partial<CacheConfig>): void {
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
  public set(key: string, value: any, ttl?: number): void {
    const entry: CacheEntry = {
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
  public get(key: string): any {
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
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  public delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    return result;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Intelligent cache eviction using LRU + LFU hybrid
   */
  private evictEntries(): void {
    const entries = Array.from(this.cache.entries());

    // Sort by access frequency and recency
    entries.sort((a, b) => {
      const [, entryA] = a;
      const [, entryB] = b;

      // Combine access count and recency for scoring
      const scoreA =
        entryA.accessCount * 0.7 + (Date.now() - entryA.lastAccessed) * 0.3;
      const scoreB =
        entryB.accessCount * 0.7 + (Date.now() - entryB.lastAccessed) * 0.3;

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
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
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
  private setupMemoryPressureHandling(): void {
    // Monitor memory usage if available
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usageRatio > 0.8) {
          console.warn(
            "High memory usage detected, performing aggressive cache cleanup",
          );
          this.aggressiveCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Aggressive cleanup for memory pressure
   */
  private aggressiveCleanup(): void {
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
  private compress(value: any): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn("Failed to compress cache value:", error);
      return value;
    }
  }

  /**
   * Simple decompression for cache values
   */
  private decompress(value: string): any {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Failed to decompress cache value:", error);
      return value;
    }
  }

  /**
   * Calculate approximate size of value
   */
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.entryCount = this.cache.size;
    this.stats.memoryUsage = Array.from(this.cache.values()).reduce(
      (total, entry) => total + entry.size,
      0,
    );
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.totalHits / this.stats.totalRequests;
      this.stats.missRate = this.stats.totalMisses / this.stats.totalRequests;
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
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
  public getEntries(): Array<[string, CacheEntry]> {
    return Array.from(this.cache.entries());
  }

  /**
   * Dispose of the service
   */
  public dispose(): void {
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
  const set = (key: string, value: any, ttl?: number) => {
    cacheOptimization.set(key, value, ttl);
  };

  const get = (key: string) => {
    return cacheOptimization.get(key);
  };

  const has = (key: string) => {
    return cacheOptimization.has(key);
  };

  const remove = (key: string) => {
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
