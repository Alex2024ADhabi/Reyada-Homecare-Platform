/**
 * Production Multi-Level Caching Architecture
 * L1/L2/L3 cache hierarchy with intelligent routing
 */

interface CacheLevel {
  name: string;
  type: 'memory' | 'redis' | 'cdn' | 'database';
  capacity: number;
  ttl: number;
  priority: number;
  hitRate: number;
  enabled: boolean;
}

interface CacheItem {
  key: string;
  value: any;
  level: number;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

interface CacheStrategy {
  readThrough: boolean;
  writeThrough: boolean;
  writeBehind: boolean;
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  promotionThreshold: number;
  demotionThreshold: number;
}

interface CacheMetrics {
  level: number;
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  promotions: number;
  demotions: number;
  hitRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  keyCount: number;
}

class MultiLevelCacheArchitecture {
  private levels: Map<number, CacheLevel> = new Map();
  private caches: Map<number, any> = new Map();
  private strategy: CacheStrategy;
  private metrics: Map<number, CacheMetrics> = new Map();
  private evictionQueues: Map<number, CacheItem[]> = new Map();
  private promotionCandidates: Map<string, CacheItem> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.strategy = {
      readThrough: true,
      writeThrough: true,
      writeBehind: false,
      evictionPolicy: 'LRU',
      promotionThreshold: 5, // Access count threshold for promotion
      demotionThreshold: 2   // Access count threshold for demotion
    };

    this.initializeCacheLevels();
    this.startMetricsCollection();
  }

  /**
   * Initialize cache hierarchy levels
   */
  private initializeCacheLevels(): void {
    // L1 Cache - In-Memory (Fastest, Smallest)
    this.levels.set(1, {
      name: 'L1-Memory',
      type: 'memory',
      capacity: 1000, // 1000 items
      ttl: 300, // 5 minutes
      priority: 1,
      hitRate: 0,
      enabled: true
    });

    // L2 Cache - Redis (Fast, Medium)
    this.levels.set(2, {
      name: 'L2-Redis',
      type: 'redis',
      capacity: 10000, // 10k items
      ttl: 1800, // 30 minutes
      priority: 2,
      hitRate: 0,
      enabled: true
    });

    // L3 Cache - CDN/Distributed (Slower, Largest)
    this.levels.set(3, {
      name: 'L3-Distributed',
      type: 'cdn',
      capacity: 100000, // 100k items
      ttl: 3600, // 1 hour
      priority: 3,
      hitRate: 0,
      enabled: true
    });

    // Initialize cache instances
    this.initializeCacheInstances();
    this.initializeMetrics();
  }

  /**
   * Initialize cache instances for each level
   */
  private async initializeCacheInstances(): Promise<void> {
    // L1 - In-Memory Cache
    this.caches.set(1, new Map<string, CacheItem>());

    // L2 - Redis Cache
    try {
      const redisService = await import('./redis.service').then(m => m.default);
      this.caches.set(2, redisService);
    } catch (error) {
      console.warn('⚠️ Redis not available for L2 cache, using memory fallback');
      this.caches.set(2, new Map<string, CacheItem>());
    }

    // L3 - Distributed Cache (simulated)
    this.caches.set(3, new Map<string, CacheItem>());

    console.log('✅ Multi-level cache architecture initialized');
  }

  /**
   * Initialize metrics for each level
   */
  private initializeMetrics(): void {
    for (const level of this.levels.keys()) {
      this.metrics.set(level, {
        level,
        hits: 0,
        misses: 0,
        sets: 0,
        evictions: 0,
        promotions: 0,
        demotions: 0,
        hitRate: 0,
        avgResponseTime: 0,
        memoryUsage: 0,
        keyCount: 0
      });
      this.evictionQueues.set(level, []);
    }
  }

  /**
   * Get value from cache hierarchy
   */
  async get(key: string): Promise<any> {
    const startTime = Date.now();
    let result = null;
    let hitLevel = 0;

    // Try each cache level in order
    for (const [level, cacheLevel] of this.levels.entries()) {
      if (!cacheLevel.enabled) continue;

      try {
        result = await this.getFromLevel(key, level);
        
        if (result !== null) {
          hitLevel = level;
          this.recordHit(level, Date.now() - startTime);
          
          // Promote to higher levels if accessed frequently
          await this.considerPromotion(key, result, level);
          
          break;
        } else {
          this.recordMiss(level);
        }
      } catch (error) {
        console.error(`❌ Error accessing L${level} cache:`, error);
        this.recordMiss(level);
      }
    }

    // If found in lower level, populate higher levels (read-through)
    if (result && hitLevel > 1 && this.strategy.readThrough) {
      await this.populateHigherLevels(key, result, hitLevel);
    }

    // If not found anywhere, try data source
    if (result === null) {
      result = await this.fetchFromDataSource(key);
      if (result !== null) {
        await this.set(key, result);
      }
    }

    console.log(`🎯 Cache ${result ? 'HIT' : 'MISS'}: ${key} (L${hitLevel || 'DS'})`);
    return result;
  }

  /**
   * Set value in cache hierarchy
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const item: CacheItem = {
      key,
      value,
      level: 1, // Start at L1
      timestamp: Date.now(),
      ttl: ttl || this.levels.get(1)!.ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      size: this.estimateSize(value),
      tags: this.extractTags(key)
    };

    let success = false;

    // Write to all levels based on strategy
    if (this.strategy.writeThrough) {
      // Write to all levels immediately
      for (const [level, cacheLevel] of this.levels.entries()) {
        if (!cacheLevel.enabled) continue;
        
        try {
          await this.setToLevel(key, { ...item, level }, level);
          this.recordSet(level);
          success = true;
        } catch (error) {
          console.error(`❌ Error writing to L${level} cache:`, error);
        }
      }
    } else {
      // Write to L1 only, propagate later
      try {
        await this.setToLevel(key, item, 1);
        this.recordSet(1);
        success = true;
      } catch (error) {
        console.error('❌ Error writing to L1 cache:', error);
      }
    }

    // Handle eviction if cache is full
    await this.handleEviction();

    console.log(`💾 Cache SET: ${key} (${this.strategy.writeThrough ? 'all levels' : 'L1 only'})`);
    return success;
  }

  /**
   * Delete from all cache levels
   */
  async delete(key: string): Promise<boolean> {
    let success = true;

    for (const [level, cacheLevel] of this.levels.entries()) {
      if (!cacheLevel.enabled) continue;
      
      try {
        await this.deleteFromLevel(key, level);
      } catch (error) {
        console.error(`❌ Error deleting from L${level} cache:`, error);
        success = false;
      }
    }

    // Remove from promotion candidates
    this.promotionCandidates.delete(key);

    console.log(`🗑️ Cache DELETE: ${key}`);
    return success;
  }

  /**
   * Get from specific cache level
   */
  private async getFromLevel(key: string, level: number): Promise<any> {
    const cache = this.caches.get(level);
    if (!cache) return null;

    if (cache instanceof Map) {
      // In-memory cache
      const item = cache.get(key);
      if (item && this.isItemValid(item)) {
        item.accessCount++;
        item.lastAccessed = Date.now();
        return item.value;
      } else if (item) {
        // Item expired
        cache.delete(key);
      }
      return null;
    } else if (cache.get) {
      // Redis cache
      const result = await cache.get(key);
      return result;
    }

    return null;
  }

  /**
   * Set to specific cache level
   */
  private async setToLevel(key: string, item: CacheItem, level: number): Promise<void> {
    const cache = this.caches.get(level);
    const cacheLevel = this.levels.get(level);
    if (!cache || !cacheLevel) return;

    if (cache instanceof Map) {
      // In-memory cache
      cache.set(key, item);
      
      // Handle capacity limits
      if (cache.size > cacheLevel.capacity) {
        await this.evictFromLevel(level);
      }
    } else if (cache.set) {
      // Redis cache
      await cache.set(key, item.value, item.ttl);
    }
  }

  /**
   * Delete from specific cache level
   */
  private async deleteFromLevel(key: string, level: number): Promise<void> {
    const cache = this.caches.get(level);
    if (!cache) return;

    if (cache instanceof Map) {
      cache.delete(key);
    } else if (cache.del) {
      await cache.del(key);
    }
  }

  /**
   * Check if cache item is valid
   */
  private isItemValid(item: CacheItem): boolean {
    if (item.ttl <= 0) return true; // No expiration
    return (Date.now() - item.timestamp) < (item.ttl * 1000);
  }

  /**
   * Populate higher cache levels
   */
  private async populateHigherLevels(key: string, value: any, fromLevel: number): Promise<void> {
    for (let level = 1; level < fromLevel; level++) {
      if (!this.levels.get(level)?.enabled) continue;
      
      const item: CacheItem = {
        key,
        value,
        level,
        timestamp: Date.now(),
        ttl: this.levels.get(level)!.ttl,
        accessCount: 1,
        lastAccessed: Date.now(),
        size: this.estimateSize(value),
        tags: this.extractTags(key)
      };

      await this.setToLevel(key, item, level);
    }
  }

  /**
   * Consider promoting item to higher cache level
   */
  private async considerPromotion(key: string, item: any, currentLevel: number): Promise<void> {
    if (currentLevel === 1) return; // Already at highest level

    const candidate = this.promotionCandidates.get(key);
    if (candidate) {
      candidate.accessCount++;
      
      if (candidate.accessCount >= this.strategy.promotionThreshold) {
        await this.promoteItem(key, candidate, currentLevel - 1);
        this.promotionCandidates.delete(key);
        this.recordPromotion(currentLevel - 1);
      }
    } else {
      this.promotionCandidates.set(key, {
        key,
        value: item,
        level: currentLevel,
        timestamp: Date.now(),
        ttl: 0,
        accessCount: 1,
        lastAccessed: Date.now(),
        size: this.estimateSize(item),
        tags: this.extractTags(key)
      });
    }
  }

  /**
   * Promote item to higher cache level
   */
  private async promoteItem(key: string, item: CacheItem, targetLevel: number): Promise<void> {
    const promotedItem = {
      ...item,
      level: targetLevel,
      timestamp: Date.now(),
      ttl: this.levels.get(targetLevel)!.ttl
    };

    await this.setToLevel(key, promotedItem, targetLevel);
    console.log(`⬆️ Cache promotion: ${key} to L${targetLevel}`);
  }

  /**
   * Handle cache eviction
   */
  private async handleEviction(): Promise<void> {
    for (const [level, cacheLevel] of this.levels.entries()) {
      const cache = this.caches.get(level);
      if (!cache || !(cache instanceof Map)) continue;

      if (cache.size > cacheLevel.capacity) {
        await this.evictFromLevel(level);
      }
    }
  }

  /**
   * Evict items from specific cache level
   */
  private async evictFromLevel(level: number): Promise<void> {
    const cache = this.caches.get(level);
    const cacheLevel = this.levels.get(level);
    if (!cache || !(cache instanceof Map) || !cacheLevel) return;

    const items = Array.from(cache.entries()).map(([key, item]) => ({ key, ...item }));
    const itemsToEvict = this.selectItemsForEviction(items, Math.ceil(cacheLevel.capacity * 0.1));

    for (const item of itemsToEvict) {
      cache.delete(item.key);
      
      // Consider demotion to lower level
      if (level < 3 && item.accessCount >= this.strategy.demotionThreshold) {
        await this.demoteItem(item, level + 1);
        this.recordDemotion(level + 1);
      }
    }

    this.recordEvictions(level, itemsToEvict.length);
    console.log(`🗑️ Evicted ${itemsToEvict.length} items from L${level} cache`);
  }

  /**
   * Select items for eviction based on policy
   */
  private selectItemsForEviction(items: CacheItem[], count: number): CacheItem[] {
    switch (this.strategy.evictionPolicy) {
      case 'LRU':
        return items
          .sort((a, b) => a.lastAccessed - b.lastAccessed)
          .slice(0, count);

      case 'LFU':
        return items
          .sort((a, b) => a.accessCount - b.accessCount)
          .slice(0, count);

      case 'FIFO':
        return items
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, count);

      case 'TTL':
        return items
          .filter(item => !this.isItemValid(item))
          .slice(0, count);

      default:
        return items.slice(0, count);
    }
  }

  /**
   * Demote item to lower cache level
   */
  private async demoteItem(item: CacheItem, targetLevel: number): Promise<void> {
    if (targetLevel > 3) return; // No level below L3

    const demotedItem = {
      ...item,
      level: targetLevel,
      timestamp: Date.now(),
      ttl: this.levels.get(targetLevel)!.ttl
    };

    await this.setToLevel(item.key, demotedItem, targetLevel);
    console.log(`⬇️ Cache demotion: ${item.key} to L${targetLevel}`);
  }

  /**
   * Fetch from data source (simulated)
   */
  private async fetchFromDataSource(key: string): Promise<any> {
    // Simulate data source fetch
    console.log(`📡 Fetching from data source: ${key}`);
    
    // In a real implementation, this would query the database
    // For simulation, return null to indicate not found
    return null;
  }

  /**
   * Healthcare-specific cache methods
   */
  async getPatientData(patientId: string): Promise<any> {
    return await this.get(`patient:${patientId}`);
  }

  async setPatientData(patientId: string, data: any): Promise<boolean> {
    return await this.set(`patient:${patientId}`, data, 1800); // 30 minutes
  }

  async getVitalSigns(patientId: string, timestamp?: number): Promise<any> {
    const key = timestamp ? `vitals:${patientId}:${timestamp}` : `vitals:${patientId}:latest`;
    return await this.get(key);
  }

  async setVitalSigns(patientId: string, vitalSigns: any, timestamp?: number): Promise<boolean> {
    const key = timestamp ? `vitals:${patientId}:${timestamp}` : `vitals:${patientId}:latest`;
    return await this.set(key, vitalSigns, 900); // 15 minutes
  }

  async getClinicalNote(noteId: string): Promise<any> {
    return await this.get(`clinical_note:${noteId}`);
  }

  async setClinicalNote(noteId: string, note: any): Promise<boolean> {
    return await this.set(`clinical_note:${noteId}`, note, 3600); // 1 hour
  }

  /**
   * Utility methods
   */
  private estimateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate
  }

  private extractTags(key: string): string[] {
    const parts = key.split(':');
    return parts.slice(0, -1); // All parts except the last one
  }

  /**
   * Metrics recording methods
   */
  private recordHit(level: number, responseTime: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.hits++;
      metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
      this.updateHitRate(level);
    }
  }

  private recordMiss(level: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.misses++;
      this.updateHitRate(level);
    }
  }

  private recordSet(level: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.sets++;
    }
  }

  private recordEvictions(level: number, count: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.evictions += count;
    }
  }

  private recordPromotion(level: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.promotions++;
    }
  }

  private recordDemotion(level: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      metrics.demotions++;
    }
  }

  private updateHitRate(level: number): void {
    const metrics = this.metrics.get(level);
    if (metrics) {
      const total = metrics.hits + metrics.misses;
      metrics.hitRate = total > 0 ? (metrics.hits / total) * 100 : 0;
      
      // Update cache level hit rate
      const cacheLevel = this.levels.get(level);
      if (cacheLevel) {
        cacheLevel.hitRate = metrics.hitRate;
      }
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMemoryUsage();
      this.updateKeyCount();
    }, 30000); // Update every 30 seconds
  }

  private updateMemoryUsage(): void {
    for (const [level, cache] of this.caches.entries()) {
      const metrics = this.metrics.get(level);
      if (!metrics) continue;

      if (cache instanceof Map) {
        let totalSize = 0;
        cache.forEach((item: CacheItem) => {
          totalSize += item.size;
        });
        metrics.memoryUsage = totalSize;
        metrics.keyCount = cache.size;
      }
    }
  }

  private updateKeyCount(): void {
    for (const [level, cache] of this.caches.entries()) {
      const metrics = this.metrics.get(level);
      if (!metrics) continue;

      if (cache instanceof Map) {
        metrics.keyCount = cache.size;
      }
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats() {
    const levelStats = Array.from(this.metrics.entries()).map(([level, metrics]) => ({
      level,
      name: this.levels.get(level)?.name || `L${level}`,
      ...metrics
    }));

    const totalHits = levelStats.reduce((sum, stats) => sum + stats.hits, 0);
    const totalMisses = levelStats.reduce((sum, stats) => sum + stats.misses, 0);
    const overallHitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

    return {
      levels: levelStats,
      overall: {
        hitRate: overallHitRate,
        totalHits,
        totalMisses,
        promotionCandidates: this.promotionCandidates.size,
        strategy: this.strategy
      }
    };
  }

  /**
   * Configure cache strategy
   */
  setStrategy(strategy: Partial<CacheStrategy>): void {
    this.strategy = { ...this.strategy, ...strategy };
    console.log('✅ Cache strategy updated:', this.strategy);
  }

  /**
   * Enable/disable cache level
   */
  setCacheLevelEnabled(level: number, enabled: boolean): void {
    const cacheLevel = this.levels.get(level);
    if (cacheLevel) {
      cacheLevel.enabled = enabled;
      console.log(`${enabled ? '✅' : '❌'} Cache L${level} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.caches.clear();
    this.metrics.clear();
    this.evictionQueues.clear();
    this.promotionCandidates.clear();
  }
}

// Singleton instance
const multiLevelCache = new MultiLevelCacheArchitecture();

export default multiLevelCache;
export { MultiLevelCacheArchitecture, CacheLevel, CacheItem, CacheStrategy, CacheMetrics };