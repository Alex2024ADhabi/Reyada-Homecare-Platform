/**
 * Multi-Level Caching Service
 * Implements L1 (Memory), L2 (Redis), and L3 (Database) caching with intelligent cache management
 */

import { errorHandlerService } from "./error-handler.service";
import { redisIntegrationService } from "./redis-integration.service";
import { advancedCachingService } from "./advanced-caching.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface CacheLevel {
  name: string;
  priority: number;
  maxSize: number;
  ttl: number;
  hitRatio: number;
  enabled: boolean;
}

interface CacheEntry {
  key: string;
  value: any;
  level: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
  ttl: number;
  metadata: Record<string, any>;
}

interface CacheStrategy {
  name: string;
  description: string;
  evictionPolicy: "LRU" | "LFU" | "FIFO" | "TTL";
  promotionThreshold: number;
  demotionThreshold: number;
  healthcareOptimized: boolean;
}

interface CacheMetrics {
  l1: {
    hits: number;
    misses: number;
    hitRatio: number;
    size: number;
    maxSize: number;
    evictions: number;
  };
  l2: {
    hits: number;
    misses: number;
    hitRatio: number;
    size: number;
    evictions: number;
  };
  l3: {
    hits: number;
    misses: number;
    hitRatio: number;
    queries: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    overallHitRatio: number;
    averageLatency: number;
    dataFreshness: number;
  };
}

interface CacheConfiguration {
  l1: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
    evictionPolicy: string;
  };
  l2: {
    enabled: boolean;
    ttl: number;
    compressionEnabled: boolean;
  };
  l3: {
    enabled: boolean;
    queryTimeout: number;
    connectionPoolSize: number;
  };
  strategies: {
    patientData: CacheStrategy;
    clinicalForms: CacheStrategy;
    complianceData: CacheStrategy;
    sessionData: CacheStrategy;
  };
}

class MultiLevelCachingService {
  private l1Cache: Map<string, CacheEntry> = new Map(); // Memory cache
  private l2Cache = redisIntegrationService; // Redis cache
  private l3Cache = advancedCachingService; // Database cache

  private cacheLevels: CacheLevel[] = [
    {
      name: "L1_Memory",
      priority: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      ttl: 300, // 5 minutes
      hitRatio: 0,
      enabled: true,
    },
    {
      name: "L2_Redis",
      priority: 2,
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 3600, // 1 hour
      hitRatio: 0,
      enabled: true,
    },
    {
      name: "L3_Database",
      priority: 3,
      maxSize: -1, // Unlimited
      ttl: -1, // No TTL
      hitRatio: 0,
      enabled: true,
    },
  ];

  private metrics: CacheMetrics = {
    l1: {
      hits: 0,
      misses: 0,
      hitRatio: 0,
      size: 0,
      maxSize: 10 * 1024 * 1024,
      evictions: 0,
    },
    l2: { hits: 0, misses: 0, hitRatio: 0, size: 0, evictions: 0 },
    l3: { hits: 0, misses: 0, hitRatio: 0, queries: 0 },
    overall: {
      totalHits: 0,
      totalMisses: 0,
      overallHitRatio: 0,
      averageLatency: 0,
      dataFreshness: 95,
    },
  };

  private configuration: CacheConfiguration;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.configuration = {
      l1: {
        enabled: true,
        maxSize: 10 * 1024 * 1024,
        ttl: 300,
        evictionPolicy: "LRU",
      },
      l2: {
        enabled: true,
        ttl: 3600,
        compressionEnabled: true,
      },
      l3: {
        enabled: true,
        queryTimeout: 5000,
        connectionPoolSize: 10,
      },
      strategies: {
        patientData: {
          name: "Patient Data Strategy",
          description:
            "Optimized for patient data with high security requirements",
          evictionPolicy: "LRU",
          promotionThreshold: 3,
          demotionThreshold: 1,
          healthcareOptimized: true,
        },
        clinicalForms: {
          name: "Clinical Forms Strategy",
          description: "Optimized for clinical form templates and data",
          evictionPolicy: "LFU",
          promotionThreshold: 5,
          demotionThreshold: 2,
          healthcareOptimized: true,
        },
        complianceData: {
          name: "Compliance Data Strategy",
          description: "Optimized for DOH compliance and regulatory data",
          evictionPolicy: "TTL",
          promotionThreshold: 2,
          demotionThreshold: 1,
          healthcareOptimized: true,
        },
        sessionData: {
          name: "Session Data Strategy",
          description: "Optimized for user session and authentication data",
          evictionPolicy: "FIFO",
          promotionThreshold: 1,
          demotionThreshold: 1,
          healthcareOptimized: false,
        },
      },
    };

    this.initialize();
  }

  /**
   * Initialize multi-level caching service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🏗️ Initializing Multi-Level Caching Service...");

      // Initialize L2 cache (Redis)
      if (this.configuration.l2.enabled) {
        await this.l2Cache.initialize?.();
      }

      // Initialize L3 cache (Advanced caching)
      if (this.configuration.l3.enabled) {
        await this.l3Cache.initialize?.({
          healthcareMode: true,
          dohComplianceMode: true,
          patientDataEncryption: true,
          maxMemorySize: this.configuration.l1.maxSize,
        });
      }

      // Start monitoring and optimization
      this.startCacheMonitoring();
      this.startCacheOptimization();
      this.startHealthcareSpecificOptimizations();

      this.isInitialized = true;
      console.log("✅ Multi-Level Caching Service initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Multi-Level Caching Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "MultiLevelCachingService.initialize",
      });
      throw error;
    }
  }

  /**
   * Get value with multi-level cache lookup
   */
  async get<T>(
    key: string,
    options?: {
      strategy?: keyof CacheConfiguration["strategies"];
      skipLevels?: number[];
      refreshThreshold?: number;
    },
  ): Promise<T | null> {
    const startTime = Date.now();
    const strategy = options?.strategy || "patientData";
    const skipLevels = options?.skipLevels || [];

    try {
      // L1 Cache (Memory) - Fastest
      if (this.configuration.l1.enabled && !skipLevels.includes(1)) {
        const l1Result = await this.getFromL1<T>(key);
        if (l1Result !== null) {
          this.metrics.l1.hits++;
          this.metrics.overall.totalHits++;
          this.recordLatency(Date.now() - startTime);
          return l1Result;
        }
        this.metrics.l1.misses++;
      }

      // L2 Cache (Redis) - Fast
      if (this.configuration.l2.enabled && !skipLevels.includes(2)) {
        const l2Result = await this.getFromL2<T>(key);
        if (l2Result !== null) {
          this.metrics.l2.hits++;
          this.metrics.overall.totalHits++;

          // Promote to L1 if strategy allows
          if (this.shouldPromoteToL1(key, strategy)) {
            await this.setToL1(key, l2Result, this.configuration.l1.ttl);
          }

          this.recordLatency(Date.now() - startTime);
          return l2Result;
        }
        this.metrics.l2.misses++;
      }

      // L3 Cache (Database) - Slowest but most comprehensive
      if (this.configuration.l3.enabled && !skipLevels.includes(3)) {
        const l3Result = await this.getFromL3<T>(key);
        if (l3Result !== null) {
          this.metrics.l3.hits++;
          this.metrics.overall.totalHits++;

          // Promote to higher levels based on strategy
          if (this.shouldPromoteToL2(key, strategy)) {
            await this.setToL2(key, l3Result, this.configuration.l2.ttl);
          }

          if (this.shouldPromoteToL1(key, strategy)) {
            await this.setToL1(key, l3Result, this.configuration.l1.ttl);
          }

          this.recordLatency(Date.now() - startTime);
          return l3Result;
        }
        this.metrics.l3.misses++;
      }

      // Cache miss at all levels
      this.metrics.overall.totalMisses++;
      this.recordLatency(Date.now() - startTime);
      return null;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MultiLevelCachingService.get",
        key: key.substring(0, 50),
        strategy,
      });
      return null;
    }
  }

  /**
   * Set value across appropriate cache levels
   */
  async set<T>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      strategy?: keyof CacheConfiguration["strategies"];
      levels?: number[];
      priority?: "low" | "medium" | "high" | "critical";
    },
  ): Promise<boolean> {
    const strategy = options?.strategy || "patientData";
    const levels = options?.levels || [1, 2, 3];
    const ttl = options?.ttl || this.getDefaultTTL(strategy);
    const priority = options?.priority || "medium";

    try {
      const results: boolean[] = [];

      // Set to L1 (Memory)
      if (levels.includes(1) && this.configuration.l1.enabled) {
        const l1Result = await this.setToL1(key, value, ttl);
        results.push(l1Result);
      }

      // Set to L2 (Redis)
      if (levels.includes(2) && this.configuration.l2.enabled) {
        const l2Result = await this.setToL2(key, value, ttl);
        results.push(l2Result);
      }

      // Set to L3 (Database) - Only for persistent data
      if (
        levels.includes(3) &&
        this.configuration.l3.enabled &&
        this.shouldPersistToL3(strategy, priority)
      ) {
        const l3Result = await this.setToL3(key, value);
        results.push(l3Result);
      }

      return results.some((result) => result);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MultiLevelCachingService.set",
        key: key.substring(0, 50),
        strategy,
      });
      return false;
    }
  }

  /**
   * Invalidate key across all cache levels
   */
  async invalidate(
    key: string,
    options?: {
      levels?: number[];
      pattern?: boolean;
    },
  ): Promise<boolean> {
    const levels = options?.levels || [1, 2, 3];
    const isPattern = options?.pattern || false;

    try {
      const results: boolean[] = [];

      // Invalidate L1
      if (levels.includes(1)) {
        const l1Result = isPattern
          ? await this.invalidateL1Pattern(key)
          : await this.invalidateL1(key);
        results.push(l1Result);
      }

      // Invalidate L2
      if (levels.includes(2)) {
        const l2Result = isPattern
          ? await this.invalidateL2Pattern(key)
          : await this.invalidateL2(key);
        results.push(l2Result);
      }

      // Invalidate L3
      if (levels.includes(3)) {
        const l3Result = isPattern
          ? await this.invalidateL3Pattern(key)
          : await this.invalidateL3(key);
        results.push(l3Result);
      }

      return results.some((result) => result);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MultiLevelCachingService.invalidate",
        key: key.substring(0, 50),
      });
      return false;
    }
  }

  // L1 Cache Operations (Memory)
  private async getFromL1<T>(key: string): Promise<T | null> {
    const entry = this.l1Cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (
      entry.ttl > 0 &&
      Date.now() - entry.createdAt.getTime() > entry.ttl * 1000
    ) {
      this.l1Cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = new Date();
    entry.accessCount++;

    return entry.value as T;
  }

  private async setToL1<T>(
    key: string,
    value: T,
    ttl: number,
  ): Promise<boolean> {
    try {
      // Check if we need to evict entries
      await this.evictL1IfNeeded();

      const entry: CacheEntry = {
        key,
        value,
        level: 1,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        size: this.calculateSize(value),
        ttl,
        metadata: {},
      };

      this.l1Cache.set(key, entry);
      this.updateL1Metrics();
      return true;
    } catch (error) {
      console.error("Error setting L1 cache:", error);
      return false;
    }
  }

  private async invalidateL1(key: string): Promise<boolean> {
    const deleted = this.l1Cache.delete(key);
    this.updateL1Metrics();
    return deleted;
  }

  private async invalidateL1Pattern(pattern: string): Promise<boolean> {
    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));

    for (const key of this.l1Cache.keys()) {
      if (regex.test(key)) {
        this.l1Cache.delete(key);
        deletedCount++;
      }
    }

    this.updateL1Metrics();
    return deletedCount > 0;
  }

  // L2 Cache Operations (Redis)
  private async getFromL2<T>(key: string): Promise<T | null> {
    try {
      const result = await this.l2Cache.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error("Error getting from L2 cache:", error);
      return null;
    }
  }

  private async setToL2<T>(
    key: string,
    value: T,
    ttl: number,
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      return await this.l2Cache.set(key, serialized, ttl);
    } catch (error) {
      console.error("Error setting L2 cache:", error);
      return false;
    }
  }

  private async invalidateL2(key: string): Promise<boolean> {
    try {
      const result = await this.l2Cache.del(key);
      return result > 0;
    } catch (error) {
      console.error("Error invalidating L2 cache:", error);
      return false;
    }
  }

  private async invalidateL2Pattern(pattern: string): Promise<boolean> {
    try {
      // This would use Redis SCAN in production
      return true;
    } catch (error) {
      console.error("Error invalidating L2 cache pattern:", error);
      return false;
    }
  }

  // L3 Cache Operations (Database)
  private async getFromL3<T>(key: string): Promise<T | null> {
    try {
      return await this.l3Cache.get<T>(key);
    } catch (error) {
      console.error("Error getting from L3 cache:", error);
      return null;
    }
  }

  private async setToL3<T>(key: string, value: T): Promise<boolean> {
    try {
      return await this.l3Cache.set(key, value);
    } catch (error) {
      console.error("Error setting L3 cache:", error);
      return false;
    }
  }

  private async invalidateL3(key: string): Promise<boolean> {
    try {
      return await this.l3Cache.invalidate(key);
    } catch (error) {
      console.error("Error invalidating L3 cache:", error);
      return false;
    }
  }

  private async invalidateL3Pattern(pattern: string): Promise<boolean> {
    try {
      const result = await this.l3Cache.invalidatePattern(pattern);
      return result > 0;
    } catch (error) {
      console.error("Error invalidating L3 cache pattern:", error);
      return false;
    }
  }

  // Cache Strategy Methods
  private shouldPromoteToL1(
    key: string,
    strategy: keyof CacheConfiguration["strategies"],
  ): boolean {
    const strategyConfig = this.configuration.strategies[strategy];
    const entry = this.l1Cache.get(key);

    if (!entry) return true; // Always promote if not in L1

    return entry.accessCount >= strategyConfig.promotionThreshold;
  }

  private shouldPromoteToL2(
    key: string,
    strategy: keyof CacheConfiguration["strategies"],
  ): boolean {
    const strategyConfig = this.configuration.strategies[strategy];
    return strategyConfig.healthcareOptimized; // Healthcare data should be promoted
  }

  private shouldPersistToL3(
    strategy: keyof CacheConfiguration["strategies"],
    priority: string,
  ): boolean {
    const strategyConfig = this.configuration.strategies[strategy];
    return (
      strategyConfig.healthcareOptimized &&
      (priority === "high" || priority === "critical")
    );
  }

  private getDefaultTTL(
    strategy: keyof CacheConfiguration["strategies"],
  ): number {
    switch (strategy) {
      case "patientData":
        return 1800; // 30 minutes
      case "clinicalForms":
        return 3600; // 1 hour
      case "complianceData":
        return 7200; // 2 hours
      case "sessionData":
        return 900; // 15 minutes
      default:
        return 1800;
    }
  }

  // Cache Eviction and Optimization
  private async evictL1IfNeeded(): Promise<void> {
    const currentSize = this.calculateL1Size();
    const maxSize = this.configuration.l1.maxSize;

    if (currentSize >= maxSize * 0.9) {
      // Evict when 90% full
      const evictionCount = Math.ceil(this.l1Cache.size * 0.2); // Evict 20%
      await this.evictL1Entries(evictionCount);
    }
  }

  private async evictL1Entries(count: number): Promise<void> {
    const entries = Array.from(this.l1Cache.entries());

    // Sort by eviction policy (LRU by default)
    entries.sort(([, a], [, b]) => {
      switch (this.configuration.l1.evictionPolicy) {
        case "LRU":
          return a.lastAccessed.getTime() - b.lastAccessed.getTime();
        case "LFU":
          return a.accessCount - b.accessCount;
        case "FIFO":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "TTL":
          return (
            a.createdAt.getTime() +
            a.ttl * 1000 -
            (b.createdAt.getTime() + b.ttl * 1000)
          );
        default:
          return a.lastAccessed.getTime() - b.lastAccessed.getTime();
      }
    });

    // Evict oldest entries
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      const [key] = entries[i];
      this.l1Cache.delete(key);
      this.metrics.l1.evictions++;
    }
  }

  // Healthcare-Specific Optimizations
  private startHealthcareSpecificOptimizations(): void {
    setInterval(() => {
      this.optimizePatientDataCaching();
      this.optimizeComplianceDataCaching();
      this.optimizeClinicalFormCaching();
    }, 300000); // Every 5 minutes
  }

  private async optimizePatientDataCaching(): Promise<void> {
    // Preload frequently accessed patient data
    const frequentPatients = await this.getFrequentlyAccessedPatients();

    for (const patientId of frequentPatients) {
      const key = `patient:${patientId}`;
      const cached = await this.get(key, { strategy: "patientData" });

      if (!cached) {
        // Preload patient data
        const patientData = await this.loadPatientData(patientId);
        if (patientData) {
          await this.set(key, patientData, {
            strategy: "patientData",
            priority: "high",
            levels: [1, 2],
          });
        }
      }
    }
  }

  private async optimizeComplianceDataCaching(): Promise<void> {
    // Cache DOH compliance templates and schemas
    const complianceKeys = [
      "doh:schemas:patient_assessment",
      "doh:schemas:clinical_documentation",
      "doh:schemas:nine_domains",
      "jawda:templates:quality_indicators",
    ];

    for (const key of complianceKeys) {
      const cached = await this.get(key, { strategy: "complianceData" });
      if (!cached) {
        const data = await this.loadComplianceData(key);
        if (data) {
          await this.set(key, data, {
            strategy: "complianceData",
            priority: "critical",
            levels: [1, 2, 3],
          });
        }
      }
    }
  }

  private async optimizeClinicalFormCaching(): Promise<void> {
    // Cache clinical form templates
    const formTemplates = [
      "forms:initial_assessment",
      "forms:vital_signs",
      "forms:medication_reconciliation",
      "forms:wound_assessment",
      "forms:pain_assessment",
    ];

    for (const template of formTemplates) {
      const cached = await this.get(template, { strategy: "clinicalForms" });
      if (!cached) {
        const data = await this.loadClinicalFormTemplate(template);
        if (data) {
          await this.set(template, data, {
            strategy: "clinicalForms",
            priority: "high",
            levels: [1, 2],
          });
        }
      }
    }
  }

  // Monitoring and Metrics
  private startCacheMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.reportMetrics();
      this.checkCacheHealth();
    }, 60000); // Every minute
  }

  private startCacheOptimization(): void {
    setInterval(() => {
      this.optimizeCacheDistribution();
      this.cleanupExpiredEntries();
      this.rebalanceCacheLevels();
    }, 300000); // Every 5 minutes
  }

  private updateMetrics(): void {
    // Update L1 metrics
    this.updateL1Metrics();

    // Update overall metrics
    const totalHits =
      this.metrics.l1.hits + this.metrics.l2.hits + this.metrics.l3.hits;
    const totalMisses =
      this.metrics.l1.misses + this.metrics.l2.misses + this.metrics.l3.misses;
    const totalRequests = totalHits + totalMisses;

    this.metrics.overall.totalHits = totalHits;
    this.metrics.overall.totalMisses = totalMisses;
    this.metrics.overall.overallHitRatio =
      totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    // Update individual hit ratios
    this.metrics.l1.hitRatio =
      this.metrics.l1.hits + this.metrics.l1.misses > 0
        ? (this.metrics.l1.hits /
            (this.metrics.l1.hits + this.metrics.l1.misses)) *
          100
        : 0;

    this.metrics.l2.hitRatio =
      this.metrics.l2.hits + this.metrics.l2.misses > 0
        ? (this.metrics.l2.hits /
            (this.metrics.l2.hits + this.metrics.l2.misses)) *
          100
        : 0;

    this.metrics.l3.hitRatio =
      this.metrics.l3.hits + this.metrics.l3.misses > 0
        ? (this.metrics.l3.hits /
            (this.metrics.l3.hits + this.metrics.l3.misses)) *
          100
        : 0;
  }

  private updateL1Metrics(): void {
    this.metrics.l1.size = this.calculateL1Size();
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Multi_Level_Cache_Hit_Ratio",
      value: this.metrics.overall.overallHitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "L1_Cache_Hit_Ratio",
      value: this.metrics.l1.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "L2_Cache_Hit_Ratio",
      value: this.metrics.l2.hitRatio,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Average_Cache_Latency",
      value: this.metrics.overall.averageLatency,
      unit: "ms",
    });
  }

  private checkCacheHealth(): void {
    const overallHitRatio = this.metrics.overall.overallHitRatio;
    const averageLatency = this.metrics.overall.averageLatency;

    if (overallHitRatio < 70) {
      console.warn(`⚠️ Low cache hit ratio: ${overallHitRatio.toFixed(1)}%`);
    }

    if (averageLatency > 100) {
      console.warn(`⚠️ High cache latency: ${averageLatency.toFixed(1)}ms`);
    }
  }

  // Utility Methods
  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate
  }

  private calculateL1Size(): number {
    let totalSize = 0;
    for (const entry of this.l1Cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private recordLatency(latency: number): void {
    // Simple moving average
    this.metrics.overall.averageLatency =
      this.metrics.overall.averageLatency * 0.9 + latency * 0.1;
  }

  private async optimizeCacheDistribution(): Promise<void> {
    // Analyze access patterns and optimize cache distribution
    const l1Entries = Array.from(this.l1Cache.values());
    const hotEntries = l1Entries.filter((entry) => entry.accessCount > 10);
    const coldEntries = l1Entries.filter((entry) => entry.accessCount <= 2);

    // Promote hot entries to stay in L1
    for (const entry of hotEntries) {
      entry.ttl = Math.max(entry.ttl, 1800); // Extend TTL for hot entries
    }

    // Consider demoting cold entries
    for (const entry of coldEntries) {
      if (
        entry.accessCount === 1 &&
        Date.now() - entry.lastAccessed.getTime() > 300000
      ) {
        // Move to L2 if not accessed in 5 minutes
        await this.setToL2(entry.key, entry.value, 3600);
        this.l1Cache.delete(entry.key);
      }
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.ttl > 0 && now - entry.createdAt.getTime() > entry.ttl * 1000) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.l1Cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(
        `🧹 Cleaned up ${expiredKeys.length} expired L1 cache entries`,
      );
    }
  }

  private async rebalanceCacheLevels(): Promise<void> {
    // Rebalance cache levels based on performance metrics
    if (this.metrics.l1.hitRatio < 50 && this.metrics.l2.hitRatio > 80) {
      // L2 is performing better, increase L1 size
      this.configuration.l1.maxSize = Math.min(
        this.configuration.l1.maxSize * 1.2,
        50 * 1024 * 1024, // Max 50MB
      );
    }
  }

  // Mock data loading methods (replace with actual implementations)
  private async getFrequentlyAccessedPatients(): Promise<string[]> {
    // Mock implementation - in production, analyze access logs
    return ["patient_123", "patient_456", "patient_789"];
  }

  private async loadPatientData(patientId: string): Promise<any> {
    // Mock implementation - in production, load from database
    return {
      id: patientId,
      name: "Ahmed Al Mansouri",
      emiratesId: "784-1990-1234567-8",
      lastUpdated: new Date(),
    };
  }

  private async loadComplianceData(key: string): Promise<any> {
    // Mock implementation - in production, load from compliance service
    return {
      key,
      schema: "DOH_COMPLIANCE_SCHEMA_V2024",
      lastUpdated: new Date(),
    };
  }

  private async loadClinicalFormTemplate(template: string): Promise<any> {
    // Mock implementation - in production, load from forms service
    return {
      template,
      fields: ["field1", "field2"],
      validations: ["required", "format"],
      lastUpdated: new Date(),
    };
  }

  // Public API Methods
  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public getConfiguration(): CacheConfiguration {
    return { ...this.configuration };
  }

  public getCacheLevels(): CacheLevel[] {
    return [...this.cacheLevels];
  }

  public async flushAllLevels(): Promise<boolean> {
    try {
      // Flush L1
      this.l1Cache.clear();

      // Flush L2
      await this.l2Cache.flushAll?.();

      // Flush L3
      await this.l3Cache.flushCache?.();

      // Reset metrics
      this.metrics = {
        l1: {
          hits: 0,
          misses: 0,
          hitRatio: 0,
          size: 0,
          maxSize: this.configuration.l1.maxSize,
          evictions: 0,
        },
        l2: { hits: 0, misses: 0, hitRatio: 0, size: 0, evictions: 0 },
        l3: { hits: 0, misses: 0, hitRatio: 0, queries: 0 },
        overall: {
          totalHits: 0,
          totalMisses: 0,
          overallHitRatio: 0,
          averageLatency: 0,
          dataFreshness: 95,
        },
      };

      console.log("🧹 All cache levels flushed");
      return true;
    } catch (error) {
      console.error("Error flushing cache levels:", error);
      return false;
    }
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.l1Cache.clear();
    await this.l2Cache.cleanup?.();

    console.log("🧹 Multi-Level Caching Service cleaned up");
  }
}

export const multiLevelCachingService = new MultiLevelCachingService();
export {
  CacheLevel,
  CacheEntry,
  CacheStrategy,
  CacheMetrics,
  CacheConfiguration,
};
export default multiLevelCachingService;
