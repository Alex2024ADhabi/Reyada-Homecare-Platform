/**
 * Signature Performance Optimizer Service
 * P5-002.1.1: Advanced Performance Optimization
 *
 * Comprehensive performance optimization utilities for the signature system,
 * including caching, lazy loading, memory management, and performance monitoring.
 */

import { SignatureData } from "@/components/ui/signature-capture";

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  componentLoadTime: number;
  apiResponseTime: number;
  bundleSize: number;
  frameRate: number;
  networkLatency: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface OptimizationConfig {
  caching: {
    enabled: boolean;
    maxSize: number;
    defaultTTL: number;
    compressionEnabled: boolean;
  };
  lazyLoading: {
    enabled: boolean;
    threshold: number;
    preloadCount: number;
  };
  memoryManagement: {
    enabled: boolean;
    maxMemoryUsage: number;
    cleanupInterval: number;
    garbageCollectionThreshold: number;
  };
  performance: {
    monitoringEnabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      renderTime: number;
      memoryUsage: number;
      frameRate: number;
    };
  };
}

export interface ComponentLoadStrategy {
  component: string;
  priority: "high" | "medium" | "low";
  preload: boolean;
  chunkName?: string;
  dependencies?: string[];
}

class SignaturePerformanceOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private performanceMetrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    componentLoadTime: 0,
    apiResponseTime: 0,
    bundleSize: 0,
    frameRate: 0,
    networkLatency: 0,
  };
  private config: OptimizationConfig;
  private observers = new Map<string, PerformanceObserver>();
  private memoryMonitorInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private loadStrategies = new Map<string, ComponentLoadStrategy>();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      caching: {
        enabled: true,
        maxSize: 1000,
        defaultTTL: 300000, // 5 minutes
        compressionEnabled: true,
        ...config.caching,
      },
      lazyLoading: {
        enabled: true,
        threshold: 0.1,
        preloadCount: 3,
        ...config.lazyLoading,
      },
      memoryManagement: {
        enabled: true,
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        cleanupInterval: 60000, // 1 minute
        garbageCollectionThreshold: 0.8,
        ...config.memoryManagement,
      },
      performance: {
        monitoringEnabled: true,
        metricsInterval: 5000, // 5 seconds
        alertThresholds: {
          renderTime: 100,
          memoryUsage: 80 * 1024 * 1024, // 80MB
          frameRate: 30,
        },
        ...config.performance,
      },
    };

    this.initialize();
  }

  private initialize(): void {
    if (typeof window === "undefined") return;

    // Initialize performance monitoring
    if (this.config.performance.monitoringEnabled) {
      this.startPerformanceMonitoring();
    }

    // Initialize memory management
    if (this.config.memoryManagement.enabled) {
      this.startMemoryManagement();
    }

    // Initialize component load strategies
    this.initializeLoadStrategies();

    // Setup performance observers
    this.setupPerformanceObservers();
  }

  private initializeLoadStrategies(): void {
    const strategies: ComponentLoadStrategy[] = [
      {
        component: "SignatureCapture",
        priority: "high",
        preload: true,
        chunkName: "signature-capture",
      },
      {
        component: "SignatureAnalyticsDashboard",
        priority: "medium",
        preload: false,
        chunkName: "signature-analytics",
        dependencies: ["SignatureCapture"],
      },
      {
        component: "SignatureWorkflowDashboard",
        priority: "medium",
        preload: false,
        chunkName: "signature-workflow",
      },
      {
        component: "SignatureSystemMonitor",
        priority: "low",
        preload: false,
        chunkName: "signature-monitor",
      },
    ];

    strategies.forEach((strategy) => {
      this.loadStrategies.set(strategy.component, strategy);
    });
  }

  private setupPerformanceObservers(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    // Measure component render times
    const renderObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes("signature")) {
          this.performanceMetrics.renderTime = entry.duration;
        }
      });
    });

    try {
      renderObserver.observe({ entryTypes: ["measure"] });
      this.observers.set("render", renderObserver);
    } catch (error) {
      console.warn("Performance observer not supported:", error);
    }

    // Measure navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          this.performanceMetrics.componentLoadTime =
            navEntry.loadEventEnd - navEntry.loadEventStart;
        }
      });
    });

    try {
      navigationObserver.observe({ entryTypes: ["navigation"] });
      this.observers.set("navigation", navigationObserver);
    } catch (error) {
      console.warn("Navigation observer not supported:", error);
    }
  }

  private startPerformanceMonitoring(): void {
    this.metricsInterval = setInterval(() => {
      this.updatePerformanceMetrics();
      this.checkPerformanceThresholds();
    }, this.config.performance.metricsInterval);
  }

  private startMemoryManagement(): void {
    this.memoryMonitorInterval = setInterval(() => {
      this.performMemoryCleanup();
      this.monitorMemoryUsage();
    }, this.config.memoryManagement.cleanupInterval);
  }

  private updatePerformanceMetrics(): void {
    if (typeof window === "undefined") return;

    // Update memory usage
    if ((performance as any).memory) {
      this.performanceMetrics.memoryUsage = (
        performance as any
      ).memory.usedJSHeapSize;
    }

    // Update cache hit rate
    const totalRequests = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0,
    );
    const cacheHits = Array.from(this.cache.values()).filter(
      (entry) => entry.accessCount > 0,
    ).length;
    this.performanceMetrics.cacheHitRate =
      totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    // Update frame rate (simplified)
    this.performanceMetrics.frameRate = this.calculateFrameRate();
  }

  private calculateFrameRate(): number {
    // Simplified frame rate calculation
    // In a real implementation, you'd measure actual frame times
    return this.performanceMetrics.renderTime < 16.67 ? 60 : 30;
  }

  private checkPerformanceThresholds(): void {
    const { alertThresholds } = this.config.performance;

    if (this.performanceMetrics.renderTime > alertThresholds.renderTime) {
      this.emitPerformanceAlert("render-time", {
        current: this.performanceMetrics.renderTime,
        threshold: alertThresholds.renderTime,
      });
    }

    if (this.performanceMetrics.memoryUsage > alertThresholds.memoryUsage) {
      this.emitPerformanceAlert("memory-usage", {
        current: this.performanceMetrics.memoryUsage,
        threshold: alertThresholds.memoryUsage,
      });
    }

    if (this.performanceMetrics.frameRate < alertThresholds.frameRate) {
      this.emitPerformanceAlert("frame-rate", {
        current: this.performanceMetrics.frameRate,
        threshold: alertThresholds.frameRate,
      });
    }
  }

  private emitPerformanceAlert(type: string, data: any): void {
    console.warn(`Performance Alert [${type}]:`, data);
    // In a real implementation, you'd emit this to a monitoring system
  }

  private performMemoryCleanup(): void {
    // Clean expired cache entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Limit cache size
    if (this.cache.size > this.config.caching.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toDelete = entries.slice(
        0,
        entries.length - this.config.caching.maxSize,
      );
      toDelete.forEach(([key]) => this.cache.delete(key));
    }

    // Force garbage collection if available and threshold exceeded
    if (
      (window as any).gc &&
      this.performanceMetrics.memoryUsage >
        this.config.memoryManagement.maxMemoryUsage *
          this.config.memoryManagement.garbageCollectionThreshold
    ) {
      (window as any).gc();
    }
  }

  private monitorMemoryUsage(): void {
    if (typeof window === "undefined" || !(performance as any).memory) return;

    const memoryInfo = (performance as any).memory;
    this.performanceMetrics.memoryUsage = memoryInfo.usedJSHeapSize;

    if (
      memoryInfo.usedJSHeapSize > this.config.memoryManagement.maxMemoryUsage
    ) {
      console.warn("Memory usage threshold exceeded:", {
        current: memoryInfo.usedJSHeapSize,
        limit: this.config.memoryManagement.maxMemoryUsage,
      });
    }
  }

  // Public API Methods

  /**
   * Cache data with automatic expiration and compression
   */
  public cache<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.caching.enabled) return;

    const entry: CacheEntry<T> = {
      data: this.config.caching.compressionEnabled
        ? this.compressData(data)
        : data,
      timestamp: Date.now(),
      ttl: ttl || this.config.caching.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Retrieve cached data
   */
  public getCached<T>(key: string): T | null {
    if (!this.config.caching.enabled) return null;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = now;

    return this.config.caching.compressionEnabled
      ? this.decompressData(entry.data)
      : entry.data;
  }

  /**
   * Optimize signature data for storage and transmission
   */
  public optimizeSignatureData(signature: SignatureData): SignatureData {
    const optimized = { ...signature };

    // Compress stroke data
    if (optimized.strokes.length > 100) {
      optimized.strokes = this.compressStrokes(optimized.strokes);
    }

    // Optimize image data
    if (optimized.imageData) {
      optimized.imageData = this.optimizeImageData(optimized.imageData);
    }

    return optimized;
  }

  /**
   * Lazy load component with priority-based loading
   */
  public async lazyLoadComponent(
    componentName: string,
  ): Promise<React.ComponentType<any> | null> {
    if (!this.config.lazyLoading.enabled) return null;

    const strategy = this.loadStrategies.get(componentName);
    if (!strategy) return null;

    const startTime = performance.now();

    try {
      // Check if component is already cached
      const cached = this.getCached<React.ComponentType<any>>(
        `component-${componentName}`,
      );
      if (cached) return cached;

      // Dynamic import based on component name
      let component: React.ComponentType<any>;
      switch (componentName) {
        case "SignatureCapture":
          const { default: SignatureCapture } = await import(
            "@/components/ui/signature-capture"
          );
          component = SignatureCapture;
          break;
        case "SignatureAnalyticsDashboard":
          const { default: SignatureAnalyticsDashboard } = await import(
            "@/components/ui/signature-analytics-dashboard"
          );
          component = SignatureAnalyticsDashboard;
          break;
        case "SignatureWorkflowDashboard":
          const { default: SignatureWorkflowDashboard } = await import(
            "@/components/ui/signature-workflow-dashboard"
          );
          component = SignatureWorkflowDashboard;
          break;
        case "SignatureSystemMonitor":
          const { default: SignatureSystemMonitor } = await import(
            "@/components/ui/signature-system-monitor"
          );
          component = SignatureSystemMonitor;
          break;
        default:
          return null;
      }

      const loadTime = performance.now() - startTime;
      this.performanceMetrics.componentLoadTime = loadTime;

      // Cache the loaded component
      this.cache(component, `component-${componentName}`);

      return component;
    } catch (error) {
      console.error(`Failed to lazy load component ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Preload components based on priority
   */
  public async preloadComponents(): Promise<void> {
    const highPriorityComponents = Array.from(this.loadStrategies.entries())
      .filter(
        ([, strategy]) => strategy.priority === "high" && strategy.preload,
      )
      .map(([name]) => name);

    await Promise.all(
      highPriorityComponents.map((name) => this.lazyLoadComponent(name)),
    );
  }

  /**
   * Optimize API requests with caching and batching
   */
  public async optimizedApiRequest<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
  ): Promise<T> {
    const key = cacheKey || `api-${url}-${JSON.stringify(options)}`;
    const cached = this.getCached<T>(key);
    if (cached) return cached;

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = performance.now() - startTime;
      this.performanceMetrics.apiResponseTime = responseTime;

      // Cache successful responses
      this.cache(data, key);

      return data;
    } catch (error) {
      console.error("Optimized API request failed:", error);
      throw error;
    }
  }

  /**
   * Batch multiple API requests
   */
  public async batchApiRequests<T>(
    requests: Array<{ url: string; options?: RequestInit; cacheKey?: string }>,
  ): Promise<T[]> {
    return Promise.all(
      requests.map((req) =>
        this.optimizedApiRequest<T>(req.url, req.options, req.cacheKey),
      ),
    );
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update optimization configuration
   */
  public updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      caching: { ...this.config.caching, ...newConfig.caching },
      lazyLoading: { ...this.config.lazyLoading, ...newConfig.lazyLoading },
      memoryManagement: {
        ...this.config.memoryManagement,
        ...newConfig.memoryManagement,
      },
      performance: { ...this.config.performance, ...newConfig.performance },
    };
  }

  /**
   * Cleanup and dispose of resources
   */
  public dispose(): void {
    // Clear intervals
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Clear cache
    this.cache.clear();
  }

  // Private helper methods

  private compressData<T>(data: T): T {
    // Simplified compression - in a real implementation,
    // you'd use a proper compression library
    if (typeof data === "string") {
      return data as T;
    }
    return data;
  }

  private decompressData<T>(data: T): T {
    // Simplified decompression
    return data;
  }

  private compressStrokes(strokes: any[]): any[] {
    // Remove redundant points and optimize stroke data
    return strokes.filter((stroke, index) => {
      if (index === 0) return true;
      const prevStroke = strokes[index - 1];
      const distance = Math.sqrt(
        Math.pow(stroke.x - prevStroke.x, 2) +
          Math.pow(stroke.y - prevStroke.y, 2),
      );
      return distance > 2; // Remove points too close together
    });
  }

  private optimizeImageData(imageData: string): string {
    // In a real implementation, you'd optimize image compression
    // For now, just return the original data
    return imageData;
  }
}

// Export singleton instance
export const signaturePerformanceOptimizer =
  new SignaturePerformanceOptimizer();

export default SignaturePerformanceOptimizer;
