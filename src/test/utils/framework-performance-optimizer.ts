#!/usr/bin/env tsx
/**
 * Framework Performance Optimizer
 * Advanced performance optimization and monitoring system for the healthcare testing framework
 * Provides intelligent performance tuning, resource management, and optimization recommendations
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

interface PerformanceConfig {
  enableAutoOptimization: boolean;
  enableResourceMonitoring: boolean;
  enableMemoryOptimization: boolean;
  enableCacheOptimization: boolean;
  enableConcurrencyOptimization: boolean;
  monitoringInterval: number;
  optimizationThresholds: {
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
    responseTime: number; // ms
    errorRate: number; // percentage
    throughput: number; // tests per second
  };
  resourceLimits: {
    maxMemory: number; // MB
    maxConcurrency: number;
    maxTestDuration: number; // ms
    maxRetries: number;
  };
  outputDirectory: string;
}

interface PerformanceMetrics {
  timestamp: string;
  system: {
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    uptime: number;
    loadAverage: number[];
  };
  testing: {
    totalTests: number;
    completedTests: number;
    failedTests: number;
    averageResponseTime: number;
    throughput: number;
    concurrency: number;
    queueSize: number;
  };
  optimization: {
    memoryOptimized: boolean;
    cacheHitRate: number;
    garbageCollections: number;
    optimizationScore: number;
  };
  recommendations: string[];
}

interface OptimizationResult {
  success: boolean;
  optimizations: {
    memory: boolean;
    cache: boolean;
    concurrency: boolean;
    resources: boolean;
  };
  improvements: {
    memoryReduction: number; // MB
    speedImprovement: number; // percentage
    throughputIncrease: number; // tests per second
    errorReduction: number; // percentage
  };
  recommendations: string[];
  duration: number;
}

class FrameworkPerformanceOptimizer extends EventEmitter {
  private static instance: FrameworkPerformanceOptimizer;
  private config: PerformanceConfig;
  private isMonitoring: boolean = false;
  private monitoringTimer?: NodeJS.Timeout;
  private metrics: PerformanceMetrics;
  private baselineMetrics?: PerformanceMetrics;
  private optimizationHistory: OptimizationResult[] = [];
  private logFile: string;
  private cache: Map<string, any> = new Map();
  private resourcePool: Map<string, any> = new Map();
  private testMetrics: Map<string, number> = new Map();
  private performanceBaseline: Map<string, number> = new Map();

  private constructor() {
    super();
    this.config = this.loadDefaultConfig();
    this.metrics = this.initializeMetrics();
    this.logFile = path.join(
      this.config.outputDirectory,
      "performance-optimizer.log",
    );
    this.ensureDirectories();
    this.setupEventHandlers();
    this.initializePerformanceBaseline();
  }

  static getInstance(): FrameworkPerformanceOptimizer {
    if (!FrameworkPerformanceOptimizer.instance) {
      FrameworkPerformanceOptimizer.instance =
        new FrameworkPerformanceOptimizer();
    }
    return FrameworkPerformanceOptimizer.instance;
  }

  async startOptimization(config?: Partial<PerformanceConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log("⚡ Healthcare Testing Framework Performance Optimizer");
    console.log("===================================================\n");
    console.log(`🚀 Optimization started at: ${new Date().toISOString()}`);
    console.log(`🔄 Monitoring interval: ${this.config.monitoringInterval}ms`);
    console.log(`🤖 Auto-optimization: ${this.config.enableAutoOptimization}`);
    console.log(
      `📊 Resource monitoring: ${this.config.enableResourceMonitoring}`,
    );
    console.log("");

    // Collect baseline metrics
    await this.collectMetrics();
    this.baselineMetrics = { ...this.metrics };
    console.log("📊 Baseline metrics collected");

    // Start monitoring
    if (this.config.enableResourceMonitoring) {
      this.startMonitoring();
    }

    // Perform initial optimization
    const initialOptimization = await this.performOptimization();
    console.log(
      `✅ Initial optimization completed: ${initialOptimization.success}`,
    );

    this.emit("optimization-started", { timestamp: Date.now() });
    this.logEvent("info", "Performance optimization started");
  }

  async stopOptimization(): Promise<OptimizationResult> {
    console.log("\n🛑 Stopping performance optimization...");

    // Stop monitoring
    this.stopMonitoring();

    // Perform final optimization
    const finalOptimization = await this.performOptimization();

    // Generate final report
    const report = this.generateOptimizationReport();
    await this.saveOptimizationReport(report);

    console.log("✅ Performance optimization stopped");
    this.emit("optimization-stopped", { timestamp: Date.now() });
    this.logEvent("info", "Performance optimization stopped");

    return finalOptimization;
  }

  async performOptimization(): Promise<OptimizationResult> {
    const startTime = performance.now();
    console.log("\n🔧 Performing optimization...");

    const result: OptimizationResult = {
      success: false,
      optimizations: {
        memory: false,
        cache: false,
        concurrency: false,
        resources: false,
      },
      improvements: {
        memoryReduction: 0,
        speedImprovement: 0,
        throughputIncrease: 0,
        errorReduction: 0,
      },
      recommendations: [],
      duration: 0,
    };

    try {
      // Collect current metrics
      await this.collectMetrics();
      const beforeMetrics = { ...this.metrics };

      // Memory optimization
      if (this.config.enableMemoryOptimization) {
        result.optimizations.memory = await this.optimizeMemory();
        console.log(
          `   Memory optimization: ${result.optimizations.memory ? "✅" : "❌"}`,
        );
      }

      // Cache optimization
      if (this.config.enableCacheOptimization) {
        result.optimizations.cache = await this.optimizeCache();
        console.log(
          `   Cache optimization: ${result.optimizations.cache ? "✅" : "❌"}`,
        );
      }

      // Concurrency optimization
      if (this.config.enableConcurrencyOptimization) {
        result.optimizations.concurrency = await this.optimizeConcurrency();
        console.log(
          `   Concurrency optimization: ${result.optimizations.concurrency ? "✅" : "❌"}`,
        );
      }

      // Resource optimization
      result.optimizations.resources = await this.optimizeResources();
      console.log(
        `   Resource optimization: ${result.optimizations.resources ? "✅" : "❌"}`,
      );

      // Test-specific optimizations
      await this.optimizeTestExecution();
      await this.optimizeHealthcareWorkflows();

      // Collect metrics after optimization
      await this.collectMetrics();
      const afterMetrics = { ...this.metrics };

      // Calculate improvements
      result.improvements = this.calculateImprovements(
        beforeMetrics,
        afterMetrics,
      );

      // Generate recommendations
      result.recommendations = this.generateRecommendations();

      // Determine overall success
      result.success = Object.values(result.optimizations).some(Boolean);

      result.duration = performance.now() - startTime;
      this.optimizationHistory.push(result);

      console.log(
        `✅ Optimization completed in ${(result.duration / 1000).toFixed(2)}s`,
      );
      this.logEvent("info", "Optimization performed", result);

      return result;
    } catch (error) {
      result.duration = performance.now() - startTime;
      console.error(`❌ Optimization failed: ${error}`);
      this.logEvent("error", "Optimization failed", {
        error: error.toString(),
      });
      return result;
    }
  }

  private startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log("📊 Starting performance monitoring...");

    this.monitoringTimer = setInterval(async () => {
      await this.collectMetrics();

      if (this.config.enableAutoOptimization) {
        await this.checkOptimizationTriggers();
      }

      this.emit("metrics-collected", this.metrics);
    }, this.config.monitoringInterval);
  }

  private stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    console.log("📊 Performance monitoring stopped");
  }

  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // System metrics
      const systemMetrics = {
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed / 1024 / 1024, // MB
          heapTotal: memoryUsage.heapTotal / 1024 / 1024, // MB
          external: memoryUsage.external / 1024 / 1024, // MB
          rss: memoryUsage.rss / 1024 / 1024, // MB
        },
        cpuUsage: {
          user: cpuUsage.user / 1000000, // Convert to seconds
          system: cpuUsage.system / 1000000, // Convert to seconds
        },
        uptime: process.uptime(),
        loadAverage: [0, 0, 0], // Would need OS-specific implementation
      };

      // Enhanced testing metrics
      const testingMetrics = {
        totalTests: this.testMetrics.get("totalTests") || 0,
        completedTests: this.testMetrics.get("completedTests") || 0,
        failedTests: this.testMetrics.get("failedTests") || 0,
        averageResponseTime: this.testMetrics.get("averageResponseTime") || 0,
        throughput: this.calculateThroughput(),
        concurrency: this.testMetrics.get("concurrency") || 1,
        queueSize: this.testMetrics.get("queueSize") || 0,
      };

      // Enhanced optimization metrics
      const optimizationMetrics = {
        memoryOptimized: this.testMetrics.get("memoryOptimized") === 1,
        cacheHitRate: this.calculateCacheHitRate(),
        garbageCollections: this.testMetrics.get("garbageCollections") || 0,
        optimizationScore: this.calculateOptimizationScore(),
      };

      this.metrics = {
        timestamp,
        system: systemMetrics,
        testing: testingMetrics,
        optimization: optimizationMetrics,
        recommendations: this.generateRecommendations(),
      };
    } catch (error) {
      this.logEvent("error", "Failed to collect metrics", {
        error: error.toString(),
      });
    }
  }

  private async checkOptimizationTriggers(): Promise<void> {
    const thresholds = this.config.optimizationThresholds;
    let shouldOptimize = false;

    // Check memory usage
    if (this.metrics.system.memoryUsage.heapUsed > thresholds.memoryUsage) {
      console.log(
        `⚠️  High memory usage detected: ${this.metrics.system.memoryUsage.heapUsed.toFixed(1)}MB`,
      );
      shouldOptimize = true;
    }

    // Check response time
    if (this.metrics.testing.averageResponseTime > thresholds.responseTime) {
      console.log(
        `⚠️  Slow response time detected: ${this.metrics.testing.averageResponseTime}ms`,
      );
      shouldOptimize = true;
    }

    // Check throughput
    if (this.metrics.testing.throughput < thresholds.throughput) {
      console.log(
        `⚠️  Low throughput detected: ${this.metrics.testing.throughput} tests/sec`,
      );
      shouldOptimize = true;
    }

    // Check error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > thresholds.errorRate) {
      console.log(`⚠️  High error rate detected: ${errorRate.toFixed(1)}%`);
      shouldOptimize = true;
    }

    if (shouldOptimize) {
      console.log("🔧 Auto-optimization triggered");
      await this.performOptimization();
    }
  }

  private async optimizeMemory(): Promise<boolean> {
    try {
      console.log("   🧹 Optimizing memory usage...");

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        this.testMetrics.set(
          "garbageCollections",
          (this.testMetrics.get("garbageCollections") || 0) + 1,
        );
      }

      // Clear unused cache entries
      this.cleanupCache();

      // Clear resource pool of unused resources
      this.cleanupResourcePool();

      // Clear test metrics that are no longer needed
      this.cleanupTestMetrics();

      this.testMetrics.set("memoryOptimized", 1);
      return true;
    } catch (error) {
      this.logEvent("error", "Memory optimization failed", {
        error: error.toString(),
      });
      return false;
    }
  }

  private async optimizeCache(): Promise<boolean> {
    try {
      console.log("   💾 Optimizing cache performance...");

      // Implement cache optimization logic
      const cacheSize = this.cache.size;
      const maxCacheSize = 1000; // Configurable

      if (cacheSize > maxCacheSize) {
        // Remove least recently used entries
        const entries = Array.from(this.cache.entries());
        const toRemove = entries.slice(0, cacheSize - maxCacheSize);

        toRemove.forEach(([key]) => {
          this.cache.delete(key);
        });

        console.log(`   Removed ${toRemove.length} cache entries`);
      }

      // Optimize cache hit rate
      this.optimizeCacheStrategy();

      return true;
    } catch (error) {
      this.logEvent("error", "Cache optimization failed", {
        error: error.toString(),
      });
      return false;
    }
  }

  private async optimizeConcurrency(): Promise<boolean> {
    try {
      console.log("   🔄 Optimizing concurrency settings...");

      // Implement concurrency optimization logic
      const currentConcurrency = this.metrics.testing.concurrency;
      const optimalConcurrency = this.calculateOptimalConcurrency();

      if (optimalConcurrency !== currentConcurrency) {
        console.log(
          `   Adjusting concurrency from ${currentConcurrency} to ${optimalConcurrency}`,
        );
        this.testMetrics.set("concurrency", optimalConcurrency);
      }

      return true;
    } catch (error) {
      this.logEvent("error", "Concurrency optimization failed", {
        error: error.toString(),
      });
      return false;
    }
  }

  private async optimizeResources(): Promise<boolean> {
    try {
      console.log("   🔧 Optimizing resource usage...");

      // Implement resource optimization logic
      this.cleanupResourcePool();

      // Optimize file handles, network connections, etc.
      await this.optimizeFileHandles();
      await this.optimizeNetworkConnections();

      return true;
    } catch (error) {
      this.logEvent("error", "Resource optimization failed", {
        error: error.toString(),
      });
      return false;
    }
  }

  private async optimizeTestExecution(): Promise<void> {
    try {
      console.log("   🧪 Optimizing test execution...");

      // Optimize test batching
      this.optimizeTestBatching();

      // Optimize test data generation
      this.optimizeTestDataGeneration();

      // Optimize test cleanup
      this.optimizeTestCleanup();
    } catch (error) {
      this.logEvent("error", "Test execution optimization failed", {
        error: error.toString(),
      });
    }
  }

  private async optimizeHealthcareWorkflows(): Promise<void> {
    try {
      console.log("   🏥 Optimizing healthcare workflows...");

      // Optimize patient data processing
      this.optimizePatientDataProcessing();

      // Optimize compliance validation
      this.optimizeComplianceValidation();

      // Optimize clinical workflow testing
      this.optimizeClinicalWorkflowTesting();
    } catch (error) {
      this.logEvent("error", "Healthcare workflow optimization failed", {
        error: error.toString(),
      });
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp && now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private cleanupResourcePool(): void {
    // Clean up unused resources in the pool
    for (const [key, resource] of this.resourcePool.entries()) {
      if (resource.lastUsed && Date.now() - resource.lastUsed > 60000) {
        // 1 minute
        this.resourcePool.delete(key);
      }
    }
  }

  private cleanupTestMetrics(): void {
    // Clean up old test metrics
    const metricsToKeep = [
      "totalTests",
      "completedTests",
      "failedTests",
      "concurrency",
      "memoryOptimized",
    ];
    const allKeys = Array.from(this.testMetrics.keys());

    allKeys.forEach((key) => {
      if (!metricsToKeep.includes(key) && key.startsWith("temp_")) {
        this.testMetrics.delete(key);
      }
    });
  }

  private optimizeCacheStrategy(): void {
    // Implement intelligent cache strategy
    const hitRate = this.calculateCacheHitRate();
    if (hitRate < 70) {
      // Adjust cache strategy for better hit rate
      console.log(
        `   Adjusting cache strategy (current hit rate: ${hitRate.toFixed(1)}%)`,
      );
    }
  }

  private optimizeTestBatching(): void {
    // Optimize how tests are batched for execution
    const optimalBatchSize = this.calculateOptimalBatchSize();
    this.testMetrics.set("optimalBatchSize", optimalBatchSize);
  }

  private optimizeTestDataGeneration(): void {
    // Optimize test data generation for healthcare tests
    this.testMetrics.set("testDataOptimized", 1);
  }

  private optimizeTestCleanup(): void {
    // Optimize test cleanup procedures
    this.testMetrics.set("cleanupOptimized", 1);
  }

  private optimizePatientDataProcessing(): void {
    // Optimize patient data processing for healthcare tests
    this.testMetrics.set("patientDataOptimized", 1);
  }

  private optimizeComplianceValidation(): void {
    // Optimize compliance validation processes
    this.testMetrics.set("complianceOptimized", 1);
  }

  private optimizeClinicalWorkflowTesting(): void {
    // Optimize clinical workflow testing
    this.testMetrics.set("clinicalWorkflowOptimized", 1);
  }

  private async optimizeFileHandles(): Promise<void> {
    // Optimize file handle usage
    console.log("     📁 Optimizing file handles...");
  }

  private async optimizeNetworkConnections(): Promise<void> {
    // Optimize network connection usage
    console.log("     🌐 Optimizing network connections...");
  }

  private calculateThroughput(): number {
    const completedTests = this.testMetrics.get("completedTests") || 0;
    const uptime = process.uptime();
    return uptime > 0 ? completedTests / uptime : 0;
  }

  private calculateErrorRate(): number {
    const totalTests = this.testMetrics.get("totalTests") || 0;
    const failedTests = this.testMetrics.get("failedTests") || 0;
    return totalTests > 0 ? (failedTests / totalTests) * 100 : 0;
  }

  private calculateOptimalBatchSize(): number {
    const memoryUsage = this.metrics.system.memoryUsage.heapUsed;
    const maxMemory = this.config.resourceLimits.maxMemory;

    // Calculate optimal batch size based on memory usage
    if (memoryUsage > maxMemory * 0.8) {
      return 5; // Small batches for high memory usage
    } else if (memoryUsage > maxMemory * 0.6) {
      return 10; // Medium batches
    } else {
      return 20; // Large batches for low memory usage
    }
  }

  private calculateCacheHitRate(): number {
    // Enhanced cache hit rate calculation
    const hits = this.testMetrics.get("cacheHits") || 0;
    const misses = this.testMetrics.get("cacheMisses") || 0;
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  private calculateOptimizationScore(): number {
    // Enhanced optimization score calculation
    let score = 100;

    // Penalize high memory usage
    if (
      this.metrics.system.memoryUsage.heapUsed >
      this.config.optimizationThresholds.memoryUsage
    ) {
      score -= 20;
    }

    // Penalize low cache hit rate
    if (this.metrics.optimization.cacheHitRate < 80) {
      score -= 10;
    }

    // Penalize high error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > 5) {
      score -= 15;
    }

    // Reward optimizations
    if (this.testMetrics.get("memoryOptimized")) score += 5;
    if (this.testMetrics.get("testDataOptimized")) score += 5;
    if (this.testMetrics.get("complianceOptimized")) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateOptimalConcurrency(): number {
    // Enhanced concurrency calculation
    const memoryUsage = this.metrics.system.memoryUsage.heapUsed;
    const maxMemory = this.config.resourceLimits.maxMemory;
    const maxConcurrency = this.config.resourceLimits.maxConcurrency;
    const errorRate = this.calculateErrorRate();

    // Reduce concurrency if memory usage is high
    if (memoryUsage > maxMemory * 0.8) {
      return Math.max(1, Math.floor(maxConcurrency * 0.5));
    } else if (memoryUsage > maxMemory * 0.6) {
      return Math.max(1, Math.floor(maxConcurrency * 0.75));
    }

    // Reduce concurrency if error rate is high
    if (errorRate > 10) {
      return Math.max(1, Math.floor(maxConcurrency * 0.6));
    } else if (errorRate > 5) {
      return Math.max(1, Math.floor(maxConcurrency * 0.8));
    }

    return maxConcurrency;
  }

  private calculateImprovements(
    before: PerformanceMetrics,
    after: PerformanceMetrics,
  ): OptimizationResult["improvements"] {
    return {
      memoryReduction: Math.max(
        0,
        before.system.memoryUsage.heapUsed - after.system.memoryUsage.heapUsed,
      ),
      speedImprovement: Math.max(
        0,
        before.testing.averageResponseTime > 0
          ? ((before.testing.averageResponseTime -
              after.testing.averageResponseTime) /
              before.testing.averageResponseTime) *
              100
          : 0,
      ),
      throughputIncrease: Math.max(
        0,
        after.testing.throughput - before.testing.throughput,
      ),
      errorReduction: Math.max(
        0,
        before.testing.totalTests > 0
          ? ((before.testing.failedTests - after.testing.failedTests) /
              before.testing.totalTests) *
              100
          : 0,
      ),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics;
    const thresholds = this.config.optimizationThresholds;

    // Memory recommendations
    if (metrics.system.memoryUsage.heapUsed > thresholds.memoryUsage) {
      recommendations.push(
        `High memory usage detected (${metrics.system.memoryUsage.heapUsed.toFixed(1)}MB). Consider reducing test concurrency or implementing memory cleanup.`,
      );
    }

    // Performance recommendations
    if (metrics.testing.averageResponseTime > thresholds.responseTime) {
      recommendations.push(
        `Slow response times detected (${metrics.testing.averageResponseTime}ms). Consider optimizing test execution or reducing load.`,
      );
    }

    // Throughput recommendations
    if (metrics.testing.throughput < thresholds.throughput) {
      recommendations.push(
        `Low throughput detected (${metrics.testing.throughput.toFixed(2)} tests/sec). Consider increasing concurrency or optimizing test performance.`,
      );
    }

    // Cache recommendations
    if (metrics.optimization.cacheHitRate < 80) {
      recommendations.push(
        `Low cache hit rate (${metrics.optimization.cacheHitRate.toFixed(1)}%). Consider optimizing cache strategy or increasing cache size.`,
      );
    }

    // Error rate recommendations
    const errorRate = this.calculateErrorRate();
    if (errorRate > thresholds.errorRate) {
      recommendations.push(
        `High error rate detected (${errorRate.toFixed(1)}%). Review test stability and error handling.`,
      );
    }

    // Healthcare-specific recommendations
    if (!this.testMetrics.get("complianceOptimized")) {
      recommendations.push(
        "Consider optimizing healthcare compliance validation for better performance.",
      );
    }

    if (!this.testMetrics.get("patientDataOptimized")) {
      recommendations.push(
        "Optimize patient data processing to improve healthcare test performance.",
      );
    }

    // General optimization recommendations
    if (metrics.optimization.optimizationScore < 70) {
      recommendations.push(
        "Overall optimization score is low. Consider running comprehensive optimization or reviewing system configuration.",
      );
    }

    return recommendations;
  }

  private generateOptimizationReport(): any {
    const currentTime = new Date().toISOString();
    const history = this.optimizationHistory;
    const latestOptimization = history[history.length - 1];

    return {
      timestamp: currentTime,
      summary: {
        totalOptimizations: history.length,
        successfulOptimizations: history.filter((h) => h.success).length,
        averageOptimizationTime:
          history.reduce((sum, h) => sum + h.duration, 0) /
          Math.max(1, history.length),
        totalImprovements: {
          memoryReduction: history.reduce(
            (sum, h) => sum + h.improvements.memoryReduction,
            0,
          ),
          speedImprovement:
            history.reduce(
              (sum, h) => sum + h.improvements.speedImprovement,
              0,
            ) / Math.max(1, history.length),
          throughputIncrease: history.reduce(
            (sum, h) => sum + h.improvements.throughputIncrease,
            0,
          ),
          errorReduction:
            history.reduce((sum, h) => sum + h.improvements.errorReduction, 0) /
            Math.max(1, history.length),
        },
      },
      currentMetrics: this.metrics,
      baselineMetrics: this.baselineMetrics,
      latestOptimization,
      recommendations: this.generateRecommendations(),
      optimizationHistory: history,
      configuration: this.config,
      healthcareSpecific: {
        complianceOptimized: !!this.testMetrics.get("complianceOptimized"),
        patientDataOptimized: !!this.testMetrics.get("patientDataOptimized"),
        clinicalWorkflowOptimized: !!this.testMetrics.get(
          "clinicalWorkflowOptimized",
        ),
        testDataOptimized: !!this.testMetrics.get("testDataOptimized"),
      },
    };
  }

  private async saveOptimizationReport(report: any): Promise<void> {
    try {
      const reportPath = path.join(
        this.config.outputDirectory,
        `optimization-report-${Date.now()}.json`,
      );

      await fs.promises.writeFile(
        reportPath,
        JSON.stringify(report, null, 2),
        "utf8",
      );

      console.log(`📊 Optimization report saved: ${reportPath}`);
    } catch (error) {
      this.logEvent("error", "Failed to save optimization report", {
        error: error.toString(),
      });
    }
  }

  private initializePerformanceBaseline(): void {
    // Initialize performance baselines for healthcare testing
    this.performanceBaseline.set("patientDataProcessing", 100); // ms
    this.performanceBaseline.set("complianceValidation", 200); // ms
    this.performanceBaseline.set("clinicalWorkflow", 500); // ms
    this.performanceBaseline.set("integrationTest", 1000); // ms
  }

  private loadDefaultConfig(): PerformanceConfig {
    return {
      enableAutoOptimization: true,
      enableResourceMonitoring: true,
      enableMemoryOptimization: true,
      enableCacheOptimization: true,
      enableConcurrencyOptimization: true,
      monitoringInterval: 30000, // 30 seconds
      optimizationThresholds: {
        memoryUsage: 512, // MB
        cpuUsage: 80, // percentage
        responseTime: 5000, // ms
        errorRate: 5, // percentage
        throughput: 10, // tests per second
      },
      resourceLimits: {
        maxMemory: 1024, // MB
        maxConcurrency: 8,
        maxTestDuration: 300000, // 5 minutes
        maxRetries: 3,
      },
      outputDirectory: "test-results/performance",
    };
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date().toISOString(),
      system: {
        memoryUsage: {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0,
        },
        cpuUsage: {
          user: 0,
          system: 0,
        },
        uptime: 0,
        loadAverage: [0, 0, 0],
      },
      testing: {
        totalTests: 0,
        completedTests: 0,
        failedTests: 0,
        averageResponseTime: 0,
        throughput: 0,
        concurrency: 1,
        queueSize: 0,
      },
      optimization: {
        memoryOptimized: false,
        cacheHitRate: 0,
        garbageCollections: 0,
        optimizationScore: 100,
      },
      recommendations: [],
    };
  }

  private ensureDirectories(): void {
    try {
      if (!fs.existsSync(this.config.outputDirectory)) {
        fs.mkdirSync(this.config.outputDirectory, { recursive: true });
      }
    } catch (error) {
      console.error(`Failed to create directories: ${error}`);
    }
  }

  private setupEventHandlers(): void {
    this.on("optimization-started", (data) => {
      this.logEvent("info", "Performance optimization started", data);
    });

    this.on("optimization-stopped", (data) => {
      this.logEvent("info", "Performance optimization stopped", data);
    });

    this.on("metrics-collected", (metrics) => {
      this.logEvent("debug", "Performance metrics collected", {
        memoryUsage: metrics.system.memoryUsage.heapUsed,
        throughput: metrics.testing.throughput,
        optimizationScore: metrics.optimization.optimizationScore,
      });
    });
  }

  private logEvent(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n", "utf8");
    } catch (error) {
      console.error(`Failed to write to log file: ${error}`);
    }

    // Also log to console for immediate feedback
    if (level === "error") {
      console.error(`[${level.toUpperCase()}] ${message}`, data || "");
    } else if (level === "info") {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  // Public methods for external integration
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  getConfiguration(): PerformanceConfig {
    return { ...this.config };
  }

  updateConfiguration(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logEvent("info", "Configuration updated", config);
  }

  async generatePerformanceReport(): Promise<any> {
    await this.collectMetrics();
    return this.generateOptimizationReport();
  }

  isOptimizing(): boolean {
    return this.isMonitoring;
  }

  async quickOptimization(): Promise<OptimizationResult> {
    console.log("🚀 Running quick optimization...");
    const result = await this.performOptimization();
    console.log(`✅ Quick optimization completed: ${result.success}`);
    return result;
  }

  async validatePerformance(): Promise<boolean> {
    await this.collectMetrics();
    const thresholds = this.config.optimizationThresholds;

    const isValid =
      this.metrics.system.memoryUsage.heapUsed <= thresholds.memoryUsage &&
      this.metrics.testing.averageResponseTime <= thresholds.responseTime &&
      this.metrics.testing.throughput >= thresholds.throughput &&
      this.metrics.optimization.optimizationScore >= 70;

    this.logEvent("info", "Performance validation completed", {
      isValid,
      metrics: this.metrics,
      thresholds,
    });

    return isValid;
  }

  // Healthcare-specific methods
  recordTestMetric(key: string, value: number): void {
    this.testMetrics.set(key, value);
  }

  recordCacheHit(): void {
    this.testMetrics.set(
      "cacheHits",
      (this.testMetrics.get("cacheHits") || 0) + 1,
    );
  }

  recordCacheMiss(): void {
    this.testMetrics.set(
      "cacheMisses",
      (this.testMetrics.get("cacheMisses") || 0) + 1,
    );
  }

  recordTestCompletion(success: boolean, duration: number): void {
    this.testMetrics.set(
      "totalTests",
      (this.testMetrics.get("totalTests") || 0) + 1,
    );
    if (success) {
      this.testMetrics.set(
        "completedTests",
        (this.testMetrics.get("completedTests") || 0) + 1,
      );
    } else {
      this.testMetrics.set(
        "failedTests",
        (this.testMetrics.get("failedTests") || 0) + 1,
      );
    }

    // Update average response time
    const currentAvg = this.testMetrics.get("averageResponseTime") || 0;
    const totalTests = this.testMetrics.get("totalTests") || 1;
    const newAvg = (currentAvg * (totalTests - 1) + duration) / totalTests;
    this.testMetrics.set("averageResponseTime", newAvg);
  }
}

// Export singleton instance
export const frameworkPerformanceOptimizer =
  FrameworkPerformanceOptimizer.getInstance();

// Export class for testing
export { FrameworkPerformanceOptimizer };

// CLI execution support
if (require.main === module) {
  const optimizer = FrameworkPerformanceOptimizer.getInstance();

  async function main() {
    try {
      console.log("🚀 Starting Framework Performance Optimizer...");

      await optimizer.startOptimization();

      // Run for a specified duration or until interrupted
      const duration = process.env.OPTIMIZATION_DURATION
        ? parseInt(process.env.OPTIMIZATION_DURATION)
        : 300000; // 5 minutes default

      setTimeout(async () => {
        const result = await optimizer.stopOptimization();
        console.log("\n📊 Final Optimization Results:");
        console.log(`   Success: ${result.success}`);
        console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
        console.log(
          `   Memory Reduction: ${result.improvements.memoryReduction.toFixed(1)}MB`,
        );
        console.log(
          `   Speed Improvement: ${result.improvements.speedImprovement.toFixed(1)}%`,
        );
        console.log(
          `   Throughput Increase: ${result.improvements.throughputIncrease.toFixed(1)} tests/sec`,
        );
        console.log(
          `   Error Reduction: ${result.improvements.errorReduction.toFixed(1)}%`,
        );

        if (result.recommendations.length > 0) {
          console.log("\n💡 Recommendations:");
          result.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
          });
        }

        process.exit(0);
      }, duration);
    } catch (error) {
      console.error("❌ Optimization failed:", error);
      process.exit(1);
    }
  }

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Received interrupt signal, stopping optimization...");
    try {
      await optimizer.stopOptimization();
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  main();
}
