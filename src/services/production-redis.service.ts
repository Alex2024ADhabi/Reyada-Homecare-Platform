// Production Redis Service with Clustering and Multi-Level Caching
// Implements actual Redis cluster with L1/L2/L3 cache hierarchy

import Redis, { Cluster } from "ioredis";
import { EventEmitter } from "events";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface RedisConfig {
  cluster: {
    nodes: Array<{ host: string; port: number }>;
    options: {
      enableReadyCheck: boolean;
      redisOptions: {
        password?: string;
        db: number;
      };
      maxRetriesPerRequest: number;
      retryDelayOnFailover: number;
      enableOfflineQueue: boolean;
      lazyConnect: boolean;
    };
  };
  keyPrefix: string;
  defaultTTL: number;
  compression: {
    enabled: boolean;
    threshold: number;
    algorithm: "gzip" | "lz4" | "snappy";
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    slowLogThreshold: number;
  };
}

interface CacheLevel {
  name: string;
  storage: Map<string, any> | Redis | Cluster;
  maxSize: number;
  ttl: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
}

interface CacheMetrics {
  l1: { hits: number; misses: number; size: number; hitRatio: number };
  l2: { hits: number; misses: number; size: number; hitRatio: number };
  l3: { hits: number; misses: number; size: number; hitRatio: number };
  overall: {
    hits: number;
    misses: number;
    hitRatio: number;
    avgResponseTime: number;
  };
  redis: {
    connectedClients: number;
    usedMemory: number;
    keyspaceHits: number;
    keyspaceMisses: number;
    evictedKeys: number;
    expiredKeys: number;
  };
}

interface InvalidationEvent {
  pattern: string;
  trigger: string;
  timestamp: Date;
  affectedKeys: string[];
  source: "manual" | "automatic" | "event-driven";
}

class ProductionRedisService extends EventEmitter {
  private redisCluster: Cluster | null = null;
  private l1Cache: Map<
    string,
    { value: any; expiry: number; accessCount: number }
  > = new Map();
  private l2Cache: Map<
    string,
    { value: any; expiry: number; accessCount: number }
  > = new Map();
  private cacheLevels: CacheLevel[] = [];
  private metrics: CacheMetrics;
  private invalidationEvents: InvalidationEvent[] = [];
  private isConnected = false;
  private readonly config: RedisConfig;
  private compressionEnabled = true;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    this.config = {
      cluster: {
        nodes: this.parseRedisNodes(),
        options: {
          enableReadyCheck: true,
          redisOptions: {
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || "0"),
          },
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          enableOfflineQueue: true,
          lazyConnect: true,
        },
      },
      keyPrefix: process.env.REDIS_KEY_PREFIX || "reyada:healthcare:",
      defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || "3600"),
      compression: {
        enabled: process.env.REDIS_COMPRESSION !== "false",
        threshold: parseInt(process.env.REDIS_COMPRESSION_THRESHOLD || "1024"),
        algorithm: (process.env.REDIS_COMPRESSION_ALGORITHM as any) || "gzip",
      },
      monitoring: {
        enabled: process.env.REDIS_MONITORING !== "false",
        interval: parseInt(process.env.REDIS_MONITORING_INTERVAL || "30000"),
        slowLogThreshold: parseInt(
          process.env.REDIS_SLOW_LOG_THRESHOLD || "100",
        ),
      },
    };

    this.metrics = {
      l1: { hits: 0, misses: 0, size: 0, hitRatio: 0 },
      l2: { hits: 0, misses: 0, size: 0, hitRatio: 0 },
      l3: { hits: 0, misses: 0, size: 0, hitRatio: 0 },
      overall: { hits: 0, misses: 0, hitRatio: 0, avgResponseTime: 0 },
      redis: {
        connectedClients: 0,
        usedMemory: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        evictedKeys: 0,
        expiredKeys: 0,
      },
    };

    this.initializeCacheLevels();
    this.connect();
  }

  private parseRedisNodes(): Array<{ host: string; port: number }> {
    const nodesEnv = process.env.REDIS_CLUSTER_NODES;
    if (nodesEnv) {
      return nodesEnv.split(",").map((node) => {
        const [host, port] = node.trim().split(":");
        return { host, port: parseInt(port) || 6379 };
      });
    }

    // Default single node configuration
    return [
      {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    ];
  }

  private initializeCacheLevels(): void {
    // L1 Cache: In-memory, fastest, smallest
    this.cacheLevels.push({
      name: "L1",
      storage: this.l1Cache,
      maxSize: parseInt(process.env.L1_CACHE_SIZE || "1000"),
      ttl: parseInt(process.env.L1_CACHE_TTL || "300"), // 5 minutes
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
    });

    // L2 Cache: In-memory, larger, longer TTL
    this.cacheLevels.push({
      name: "L2",
      storage: this.l2Cache,
      maxSize: parseInt(process.env.L2_CACHE_SIZE || "10000"),
      ttl: parseInt(process.env.L2_CACHE_TTL || "1800"), // 30 minutes
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
    });

    console.log("✅ Initialized multi-level cache hierarchy");
  }

  private async connect(): Promise<void> {
    try {
      console.log("🔗 Connecting to Redis cluster...");

      if (this.config.cluster.nodes.length === 1) {
        // Single node Redis
        const node = this.config.cluster.nodes[0];
        this.redisCluster = new Redis({
          host: node.host,
          port: node.port,
          ...this.config.cluster.options.redisOptions,
          lazyConnect: true,
          maxRetriesPerRequest:
            this.config.cluster.options.maxRetriesPerRequest,
          retryDelayOnFailover:
            this.config.cluster.options.retryDelayOnFailover,
        }) as any;
      } else {
        // Redis Cluster
        this.redisCluster = new Redis.Cluster(
          this.config.cluster.nodes,
          this.config.cluster.options,
        );
      }

      // Setup event handlers
      this.redisCluster.on("connect", this.handleConnect.bind(this));
      this.redisCluster.on("ready", this.handleReady.bind(this));
      this.redisCluster.on("error", this.handleError.bind(this));
      this.redisCluster.on("close", this.handleClose.bind(this));
      this.redisCluster.on("reconnecting", this.handleReconnecting.bind(this));

      // Connect to Redis
      await this.redisCluster.connect();

      // L3 Cache: Redis cluster
      this.cacheLevels.push({
        name: "L3",
        storage: this.redisCluster,
        maxSize: -1, // Unlimited (managed by Redis)
        ttl: this.config.defaultTTL,
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
      });

      console.log("✅ Connected to Redis cluster");
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error);
      errorHandlerService.handleError(error, {
        context: "ProductionRedisService.connect",
      });
      throw error;
    }
  }

  private handleConnect(): void {
    console.log("🔗 Redis connection established");
    this.emit("redis-connect");
  }

  private handleReady(): void {
    console.log("✅ Redis cluster ready");
    this.isConnected = true;
    this.startMonitoring();
    this.startCacheCleanup();
    this.emit("redis-ready");
  }

  private handleError(error: Error): void {
    console.error("❌ Redis error:", error);
    errorHandlerService.handleError(error, {
      context: "ProductionRedisService.handleError",
    });
    this.emit("redis-error", error);
  }

  private handleClose(): void {
    console.log("🔌 Redis connection closed");
    this.isConnected = false;
    this.emit("redis-close");
  }

  private handleReconnecting(): void {
    console.log("🔄 Redis reconnecting...");
    this.emit("redis-reconnecting");
  }

  private startMonitoring(): void {
    if (!this.config.monitoring.enabled) return;

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      this.reportMetrics();
      this.performHealthCheck();
    }, this.config.monitoring.interval);

    console.log("📊 Redis monitoring started");
  }

  private async collectMetrics(): Promise<void> {
    if (!this.isConnected || !this.redisCluster) return;

    try {
      const info = await this.redisCluster.info("stats");
      const lines = info.split("\r\n");

      for (const line of lines) {
        const [key, value] = line.split(":");
        switch (key) {
          case "connected_clients":
            this.metrics.redis.connectedClients = parseInt(value) || 0;
            break;
          case "used_memory":
            this.metrics.redis.usedMemory = parseInt(value) || 0;
            break;
          case "keyspace_hits":
            this.metrics.redis.keyspaceHits = parseInt(value) || 0;
            break;
          case "keyspace_misses":
            this.metrics.redis.keyspaceMisses = parseInt(value) || 0;
            break;
          case "evicted_keys":
            this.metrics.redis.evictedKeys = parseInt(value) || 0;
            break;
          case "expired_keys":
            this.metrics.redis.expiredKeys = parseInt(value) || 0;
            break;
        }
      }

      // Update L1 and L2 metrics
      this.metrics.l1.size = this.l1Cache.size;
      this.metrics.l2.size = this.l2Cache.size;

      // Calculate hit ratios
      this.updateHitRatios();
    } catch (error) {
      console.error("❌ Failed to collect Redis metrics:", error);
    }
  }

  private updateHitRatios(): void {
    // L1 hit ratio
    const l1Total = this.metrics.l1.hits + this.metrics.l1.misses;
    this.metrics.l1.hitRatio =
      l1Total > 0 ? (this.metrics.l1.hits / l1Total) * 100 : 0;

    // L2 hit ratio
    const l2Total = this.metrics.l2.hits + this.metrics.l2.misses;
    this.metrics.l2.hitRatio =
      l2Total > 0 ? (this.metrics.l2.hits / l2Total) * 100 : 0;

    // L3 hit ratio (Redis)
    const l3Total =
      this.metrics.redis.keyspaceHits + this.metrics.redis.keyspaceMisses;
    this.metrics.l3.hitRatio =
      l3Total > 0 ? (this.metrics.redis.keyspaceHits / l3Total) * 100 : 0;

    // Overall hit ratio
    const overallHits =
      this.metrics.l1.hits +
      this.metrics.l2.hits +
      this.metrics.redis.keyspaceHits;
    const overallMisses =
      this.metrics.l1.misses +
      this.metrics.l2.misses +
      this.metrics.redis.keyspaceMisses;
    const overallTotal = overallHits + overallMisses;
    this.metrics.overall.hitRatio =
      overallTotal > 0 ? (overallHits / overallTotal) * 100 : 0;
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "L1_Hit_Ratio",
      value: this.metrics.l1.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "L2_Hit_Ratio",
      value: this.metrics.l2.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "L3_Hit_Ratio",
      value: this.metrics.l3.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Overall_Hit_Ratio",
      value: this.metrics.overall.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Redis_Memory_Usage",
      value: this.metrics.redis.usedMemory,
      unit: "bytes",
    });
  }

  private performHealthCheck(): void {
    const health = {
      connected: this.isConnected,
      l1CacheSize: this.l1Cache.size,
      l2CacheSize: this.l2Cache.size,
      redisConnectedClients: this.metrics.redis.connectedClients,
      redisMemoryUsage: this.metrics.redis.usedMemory,
      overallHitRatio: this.metrics.overall.hitRatio,
    };

    this.emit("health-check", health);

    // Alert on low hit ratios
    if (this.metrics.overall.hitRatio < 70) {
      console.warn(
        `⚠️ Low cache hit ratio: ${this.metrics.overall.hitRatio.toFixed(2)}%`,
      );
      this.emit("low-hit-ratio", this.metrics.overall.hitRatio);
    }

    // Alert on high memory usage
    if (this.metrics.redis.usedMemory > 1024 * 1024 * 1024) {
      // 1GB
      console.warn(
        `⚠️ High Redis memory usage: ${(this.metrics.redis.usedMemory / 1024 / 1024).toFixed(2)}MB`,
      );
      this.emit("high-memory-usage", this.metrics.redis.usedMemory);
    }
  }

  private startCacheCleanup(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 300000);

    console.log("🧹 Cache cleanup scheduler started");
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedL1 = 0;
    let cleanedL2 = 0;

    // Clean L1 cache
    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.expiry < now) {
        this.l1Cache.delete(key);
        cleanedL1++;
      }
    }

    // Clean L2 cache
    for (const [key, entry] of this.l2Cache.entries()) {
      if (entry.expiry < now) {
        this.l2Cache.delete(key);
        cleanedL2++;
      }
    }

    if (cleanedL1 > 0 || cleanedL2 > 0) {
      console.log(
        `🧹 Cleaned up ${cleanedL1} L1 and ${cleanedL2} L2 expired entries`,
      );
    }
  }

  // Multi-level cache operations
  async get<T>(
    key: string,
    options?: { skipL1?: boolean; skipL2?: boolean },
  ): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.config.keyPrefix + key;

    try {
      // Try L1 cache first
      if (!options?.skipL1) {
        const l1Result = this.getFromL1<T>(fullKey);
        if (l1Result !== null) {
          this.metrics.l1.hits++;
          this.updateResponseTime(Date.now() - startTime);
          return l1Result;
        }
        this.metrics.l1.misses++;
      }

      // Try L2 cache
      if (!options?.skipL2) {
        const l2Result = this.getFromL2<T>(fullKey);
        if (l2Result !== null) {
          this.metrics.l2.hits++;
          // Promote to L1
          this.setToL1(fullKey, l2Result);
          this.updateResponseTime(Date.now() - startTime);
          return l2Result;
        }
        this.metrics.l2.misses++;
      }

      // Try L3 cache (Redis)
      if (this.isConnected && this.redisCluster) {
        const l3Result = await this.getFromL3<T>(fullKey);
        if (l3Result !== null) {
          this.metrics.l3.hits++;
          // Promote to L2 and L1
          this.setToL2(fullKey, l3Result);
          this.setToL1(fullKey, l3Result);
          this.updateResponseTime(Date.now() - startTime);
          return l3Result;
        }
        this.metrics.l3.misses++;
      }

      this.updateResponseTime(Date.now() - startTime);
      return null;
    } catch (error) {
      console.error(`❌ Error getting key ${key}:`, error);
      errorHandlerService.handleError(error, {
        context: "ProductionRedisService.get",
        key,
      });
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; skipL1?: boolean; skipL2?: boolean },
  ): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key;
    const ttl = options?.ttl || this.config.defaultTTL;

    try {
      // Set in all cache levels
      if (!options?.skipL1) {
        this.setToL1(fullKey, value, ttl);
      }

      if (!options?.skipL2) {
        this.setToL2(fullKey, value, ttl);
      }

      // Set in Redis (L3)
      if (this.isConnected && this.redisCluster) {
        await this.setToL3(fullKey, value, ttl);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error setting key ${key}:`, error);
      errorHandlerService.handleError(error, {
        context: "ProductionRedisService.set",
        key,
      });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key;

    try {
      // Delete from all cache levels
      this.l1Cache.delete(fullKey);
      this.l2Cache.delete(fullKey);

      if (this.isConnected && this.redisCluster) {
        await this.redisCluster.del(fullKey);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error deleting key ${key}:`, error);
      errorHandlerService.handleError(error, {
        context: "ProductionRedisService.delete",
        key,
      });
      return false;
    }
  }

  // L1 Cache operations (in-memory)
  private getFromL1<T>(key: string): T | null {
    const entry = this.l1Cache.get(key);
    if (!entry) return null;

    if (entry.expiry < Date.now()) {
      this.l1Cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.value;
  }

  private setToL1<T>(key: string, value: T, ttl?: number): void {
    const level = this.cacheLevels[0]; // L1

    // Evict if at capacity
    if (this.l1Cache.size >= level.maxSize) {
      this.evictLRU(this.l1Cache);
      level.evictionCount++;
    }

    this.l1Cache.set(key, {
      value,
      expiry: Date.now() + (ttl || level.ttl) * 1000,
      accessCount: 1,
    });
  }

  // L2 Cache operations (in-memory)
  private getFromL2<T>(key: string): T | null {
    const entry = this.l2Cache.get(key);
    if (!entry) return null;

    if (entry.expiry < Date.now()) {
      this.l2Cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.value;
  }

  private setToL2<T>(key: string, value: T, ttl?: number): void {
    const level = this.cacheLevels[1]; // L2

    // Evict if at capacity
    if (this.l2Cache.size >= level.maxSize) {
      this.evictLRU(this.l2Cache);
      level.evictionCount++;
    }

    this.l2Cache.set(key, {
      value,
      expiry: Date.now() + (ttl || level.ttl) * 1000,
      accessCount: 1,
    });
  }

  // L3 Cache operations (Redis)
  private async getFromL3<T>(key: string): Promise<T | null> {
    if (!this.redisCluster) return null;

    const result = await this.redisCluster.get(key);
    if (!result) return null;

    try {
      const parsed = JSON.parse(result);
      return this.compressionEnabled && parsed.compressed
        ? this.decompress(parsed.data)
        : parsed;
    } catch (error) {
      console.error(`❌ Error parsing Redis value for key ${key}:`, error);
      return null;
    }
  }

  private async setToL3<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.redisCluster) return;

    const serialized = JSON.stringify(value);
    const shouldCompress =
      this.compressionEnabled &&
      serialized.length > this.config.compression.threshold;

    const dataToStore = shouldCompress
      ? JSON.stringify({ compressed: true, data: this.compress(serialized) })
      : serialized;

    await this.redisCluster.setex(key, ttl, dataToStore);
  }

  // LRU eviction
  private evictLRU(cache: Map<string, any>): void {
    let lruKey = "";
    let lruAccessCount = Infinity;

    for (const [key, entry] of cache.entries()) {
      if (entry.accessCount < lruAccessCount) {
        lruAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      cache.delete(lruKey);
    }
  }

  // Compression utilities
  private compress(data: string): string {
    // Simplified compression - in production use actual compression library
    return Buffer.from(data).toString("base64");
  }

  private decompress(data: string): any {
    // Simplified decompression
    const decompressed = Buffer.from(data, "base64").toString();
    return JSON.parse(decompressed);
  }

  private updateResponseTime(time: number): void {
    this.metrics.overall.avgResponseTime =
      this.metrics.overall.avgResponseTime * 0.9 + time * 0.1;
  }

  // Event-driven cache invalidation
  async invalidatePattern(
    pattern: string,
    trigger: string = "manual",
  ): Promise<number> {
    const startTime = Date.now();
    let invalidatedCount = 0;
    const affectedKeys: string[] = [];

    try {
      const fullPattern = this.config.keyPrefix + pattern;

      // Invalidate from L1 cache
      for (const key of this.l1Cache.keys()) {
        if (this.matchesPattern(key, fullPattern)) {
          this.l1Cache.delete(key);
          affectedKeys.push(key);
          invalidatedCount++;
        }
      }

      // Invalidate from L2 cache
      for (const key of this.l2Cache.keys()) {
        if (this.matchesPattern(key, fullPattern)) {
          this.l2Cache.delete(key);
          if (!affectedKeys.includes(key)) {
            affectedKeys.push(key);
            invalidatedCount++;
          }
        }
      }

      // Invalidate from Redis
      if (this.isConnected && this.redisCluster) {
        const keys = await this.redisCluster.keys(fullPattern);
        if (keys.length > 0) {
          await this.redisCluster.del(...keys);
          keys.forEach((key) => {
            if (!affectedKeys.includes(key)) {
              affectedKeys.push(key);
              invalidatedCount++;
            }
          });
        }
      }

      // Record invalidation event
      const event: InvalidationEvent = {
        pattern,
        trigger,
        timestamp: new Date(),
        affectedKeys,
        source: "event-driven",
      };

      this.invalidationEvents.push(event);

      // Keep only last 1000 events
      if (this.invalidationEvents.length > 1000) {
        this.invalidationEvents = this.invalidationEvents.slice(-1000);
      }

      console.log(
        `🗑️ Invalidated ${invalidatedCount} keys matching pattern: ${pattern}`,
      );
      this.emit("pattern-invalidated", event);

      return invalidatedCount;
    } catch (error) {
      console.error(`❌ Error invalidating pattern ${pattern}:`, error);
      errorHandlerService.handleError(error, {
        context: "ProductionRedisService.invalidatePattern",
        pattern,
      });
      return 0;
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    // Simple pattern matching - in production use more sophisticated matching
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return regex.test(key);
  }

  // Healthcare-specific cache methods
  async cachePatientData(
    patientId: string,
    data: any,
    ttl: number = 1800,
  ): Promise<boolean> {
    return this.set(`patient:${patientId}`, data, { ttl });
  }

  async getPatientData(patientId: string): Promise<any> {
    return this.get(`patient:${patientId}`);
  }

  async invalidatePatientData(patientId: string): Promise<void> {
    await this.invalidatePattern(`patient:${patientId}*`, "patient-update");
  }

  async cacheClinicalForm(
    formId: string,
    data: any,
    ttl: number = 3600,
  ): Promise<boolean> {
    return this.set(`clinical_form:${formId}`, data, { ttl });
  }

  async getClinicalForm(formId: string): Promise<any> {
    return this.get(`clinical_form:${formId}`);
  }

  // Public API methods
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  getInvalidationEvents(): InvalidationEvent[] {
    return [...this.invalidationEvents];
  }

  isHealthy(): boolean {
    return this.isConnected && this.metrics.overall.hitRatio > 50;
  }

  async flushAll(): Promise<void> {
    this.l1Cache.clear();
    this.l2Cache.clear();

    if (this.isConnected && this.redisCluster) {
      await this.redisCluster.flushall();
    }

    console.log("🧹 All cache levels flushed");
    this.emit("cache-flushed");
  }

  async disconnect(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.redisCluster) {
      await this.redisCluster.disconnect();
    }

    this.isConnected = false;
    console.log("✅ Redis service disconnected");
    this.emit("disconnected");
  }
}

export const productionRedisService = new ProductionRedisService();
export default productionRedisService;
