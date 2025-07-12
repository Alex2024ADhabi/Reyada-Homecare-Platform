/**
 * Advanced Memory Leak Detection Service
 * Implements automated memory leak detection and monitoring
 * Part of Phase 3: Performance Optimization - Memory Management
 */

import { EventEmitter } from "eventemitter3";

// Memory Leak Detection Types
export interface MemorySnapshot {
  id: string;
  timestamp: string;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  objects: ObjectSnapshot[];
  listeners: ListenerSnapshot[];
  timers: TimerSnapshot[];
  domNodes?: number;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

export interface ObjectSnapshot {
  type: string;
  count: number;
  size: number;
  retainedSize: number;
  instances: ObjectInstance[];
}

export interface ObjectInstance {
  id: string;
  constructor: string;
  size: number;
  retainers: string[];
  location?: string;
}

export interface ListenerSnapshot {
  event: string;
  count: number;
  elements: string[];
  handlers: string[];
}

export interface TimerSnapshot {
  type: "timeout" | "interval";
  count: number;
  ids: number[];
  callbacks: string[];
}

export interface MemoryLeak {
  id: string;
  type: "object" | "listener" | "timer" | "dom" | "closure";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: string;
  growthRate: number; // bytes per second
  affectedObjects: string[];
  stackTrace?: string[];
  recommendations: string[];
  estimatedImpact: {
    memoryUsage: number;
    performanceImpact: number;
    stabilityRisk: number;
  };
}

export interface MemoryAnalysis {
  totalLeaks: number;
  criticalLeaks: number;
  memoryGrowthRate: number;
  heapFragmentation: number;
  gcEfficiency: number;
  recommendations: string[];
  trends: {
    timestamp: string;
    heapUsed: number;
    objectCount: number;
    leakCount: number;
  }[];
}

export interface MemoryThresholds {
  heapUsageWarning: number; // MB
  heapUsageCritical: number; // MB
  objectCountWarning: number;
  objectCountCritical: number;
  growthRateWarning: number; // MB/min
  growthRateCritical: number; // MB/min
  gcFrequencyWarning: number; // per minute
}

class AdvancedMemoryLeakDetectionService extends EventEmitter {
  private snapshots: Map<string, MemorySnapshot> = new Map();
  private detectedLeaks: Map<string, MemoryLeak> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private performanceObserver: PerformanceObserver | null = null;
  
  private thresholds: MemoryThresholds = {
    heapUsageWarning: 100, // 100MB
    heapUsageCritical: 500, // 500MB
    objectCountWarning: 10000,
    objectCountCritical: 50000,
    growthRateWarning: 10, // 10MB/min
    growthRateCritical: 50, // 50MB/min
    gcFrequencyWarning: 10, // 10 GC events per minute
  };

  private objectTracking: Map<string, number> = new Map();
  private listenerTracking: Map<string, Set<EventTarget>> = new Map();
  private timerTracking: Set<number> = new Set();
  private domObserver: MutationObserver | null = null;

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🔍 Initializing Advanced Memory Leak Detection Service...");

      // Setup memory monitoring
      this.setupMemoryMonitoring();

      // Setup DOM monitoring
      this.setupDOMMonitoring();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Start monitoring
      this.startMonitoring();

      this.emit("service:initialized");
      console.log("✅ Advanced Memory Leak Detection Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Memory Leak Detection Service:", error);
      throw error;
    }
  }

  /**
   * Start memory leak monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Take snapshots every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.takeMemorySnapshot();
    }, 30000);

    // Analyze for leaks every 2 minutes
    this.analysisInterval = setInterval(() => {
      this.analyzeMemoryLeaks();
    }, 120000);

    // Take initial snapshot
    this.takeMemorySnapshot();

    this.emit("monitoring:started");
    console.log("🔍 Memory leak monitoring started");
  }

  /**
   * Stop memory leak monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.domObserver) {
      this.domObserver.disconnect();
    }

    this.emit("monitoring:stopped");
    console.log("⏹️ Memory leak monitoring stopped");
  }

  /**
   * Take memory snapshot
   */
  async takeMemorySnapshot(): Promise<MemorySnapshot> {
    try {
      const snapshotId = this.generateSnapshotId();
      const timestamp = new Date().toISOString();

      // Get memory usage
      const memoryUsage = this.getMemoryUsage();
      
      // Get object snapshots
      const objects = this.getObjectSnapshots();
      
      // Get listener snapshots
      const listeners = this.getListenerSnapshots();
      
      // Get timer snapshots
      const timers = this.getTimerSnapshots();

      const snapshot: MemorySnapshot = {
        id: snapshotId,
        timestamp,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
        rss: memoryUsage.rss,
        objects,
        listeners,
        timers,
        domNodes: this.getDOMNodeCount(),
        jsHeapSizeLimit: memoryUsage.jsHeapSizeLimit,
        totalJSHeapSize: memoryUsage.totalJSHeapSize,
        usedJSHeapSize: memoryUsage.usedJSHeapSize,
      };

      this.snapshots.set(snapshotId, snapshot);

      // Keep only last 50 snapshots
      if (this.snapshots.size > 50) {
        const oldestKey = this.snapshots.keys().next().value;
        this.snapshots.delete(oldestKey);
      }

      this.emit("snapshot:taken", snapshot);
      return snapshot;
    } catch (error) {
      console.error("❌ Failed to take memory snapshot:", error);
      throw error;
    }
  }

  /**
   * Analyze memory leaks
   */
  async analyzeMemoryLeaks(): Promise<MemoryAnalysis> {
    try {
      const snapshots = Array.from(this.snapshots.values()).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      if (snapshots.length < 2) {
        return this.createEmptyAnalysis();
      }

      const leaks: MemoryLeak[] = [];

      // Analyze object growth
      const objectLeaks = this.analyzeObjectGrowth(snapshots);
      leaks.push(...objectLeaks);

      // Analyze listener accumulation
      const listenerLeaks = this.analyzeListenerAccumulation(snapshots);
      leaks.push(...listenerLeaks);

      // Analyze timer accumulation
      const timerLeaks = this.analyzeTimerAccumulation(snapshots);
      leaks.push(...timerLeaks);

      // Analyze DOM node growth
      const domLeaks = this.analyzeDOMGrowth(snapshots);
      leaks.push(...domLeaks);

      // Store detected leaks
      leaks.forEach(leak => {
        this.detectedLeaks.set(leak.id, leak);
      });

      const analysis = this.createMemoryAnalysis(snapshots, leaks);

      // Emit alerts for critical leaks
      const criticalLeaks = leaks.filter(leak => leak.severity === "critical");
      if (criticalLeaks.length > 0) {
        this.emit("leaks:critical", criticalLeaks);
      }

      this.emit("analysis:completed", analysis);
      return analysis;
    } catch (error) {
      console.error("❌ Failed to analyze memory leaks:", error);
      throw error;
    }
  }

  /**
   * Get current memory analysis
   */
  getMemoryAnalysis(): MemoryAnalysis {
    const snapshots = Array.from(this.snapshots.values());
    const leaks = Array.from(this.detectedLeaks.values());
    return this.createMemoryAnalysis(snapshots, leaks);
  }

  /**
   * Get detected memory leaks
   */
  getDetectedLeaks(): MemoryLeak[] {
    return Array.from(this.detectedLeaks.values()).sort(
      (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): boolean {
    try {
      if (typeof window !== "undefined" && (window as any).gc) {
        (window as any).gc();
        this.emit("gc:forced");
        return true;
      }
      
      if (typeof global !== "undefined" && (global as any).gc) {
        (global as any).gc();
        this.emit("gc:forced");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Failed to force garbage collection:", error);
      return false;
    }
  }

  // Private helper methods
  private setupMemoryMonitoring(): void {
    // Track object creation and destruction
    this.setupObjectTracking();
    
    // Track event listeners
    this.setupListenerTracking();
    
    // Track timers
    this.setupTimerTracking();
  }

  private setupDOMMonitoring(): void {
    if (typeof window === "undefined") return;

    this.domObserver = new MutationObserver((mutations) => {
      let addedNodes = 0;
      let removedNodes = 0;

      mutations.forEach(mutation => {
        addedNodes += mutation.addedNodes.length;
        removedNodes += mutation.removedNodes.length;
      });

      if (addedNodes > removedNodes + 100) {
        this.emit("dom:growth_detected", { added: addedNodes, removed: removedNodes });
      }
    });

    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === "measure" && entry.name.includes("gc")) {
          this.emit("gc:detected", entry);
        }
      });
    });

    try {
      this.performanceObserver.observe({ entryTypes: ["measure", "navigation"] });
    } catch (error) {
      console.warn("Performance observer not fully supported:", error);
    }
  }

  private setupObjectTracking(): void {
    // Override common object creation methods to track allocations
    if (typeof window !== "undefined") {
      const originalCreateElement = document.createElement;
      document.createElement = (tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement.call(document, tagName, options);
        this.trackObject("HTMLElement", element);
        return element;
      };
    }
  }

  private setupListenerTracking(): void {
    if (typeof window === "undefined") return;

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      // Track listener
      const eventKey = `${type}:${this.constructor.name}`;
      if (!this.listenerTracking.has(eventKey)) {
        this.listenerTracking.set(eventKey, new Set());
      }
      this.listenerTracking.get(eventKey)!.add(this);

      return originalAddEventListener.call(this, type, listener, options);
    }.bind(this);

    EventTarget.prototype.removeEventListener = function(type: string, listener: any, options?: any) {
      // Untrack listener
      const eventKey = `${type}:${this.constructor.name}`;
      const listeners = this.listenerTracking.get(eventKey);
      if (listeners) {
        listeners.delete(this);
        if (listeners.size === 0) {
          this.listenerTracking.delete(eventKey);
        }
      }

      return originalRemoveEventListener.call(this, type, listener, options);
    }.bind(this);
  }

  private setupTimerTracking(): void {
    if (typeof window === "undefined") return;

    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;

    window.setTimeout = (callback: any, delay?: number, ...args: any[]) => {
      const id = originalSetTimeout(callback, delay, ...args);
      this.timerTracking.add(id);
      return id;
    };

    window.setInterval = (callback: any, delay?: number, ...args: any[]) => {
      const id = originalSetInterval(callback, delay, ...args);
      this.timerTracking.add(id);
      return id;
    };

    window.clearTimeout = (id?: number) => {
      if (id !== undefined) {
        this.timerTracking.delete(id);
      }
      return originalClearTimeout(id);
    };

    window.clearInterval = (id?: number) => {
      if (id !== undefined) {
        this.timerTracking.delete(id);
      }
      return originalClearInterval(id);
    };
  }

  private trackObject(type: string, object: any): void {
    const count = this.objectTracking.get(type) || 0;
    this.objectTracking.set(type, count + 1);
  }

  private getMemoryUsage(): any {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      return {
        heapUsed: memory.usedJSHeapSize / 1024 / 1024, // MB
        heapTotal: memory.totalJSHeapSize / 1024 / 1024, // MB
        external: 0,
        arrayBuffers: 0,
        rss: 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
        totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024, // MB
        usedJSHeapSize: memory.usedJSHeapSize / 1024 / 1024, // MB
      };
    }

    // Fallback for Node.js environment
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed / 1024 / 1024, // MB
        heapTotal: usage.heapTotal / 1024 / 1024, // MB
        external: usage.external / 1024 / 1024, // MB
        arrayBuffers: usage.arrayBuffers / 1024 / 1024, // MB
        rss: usage.rss / 1024 / 1024, // MB
      };
    }

    // Fallback values
    return {
      heapUsed: 50,
      heapTotal: 100,
      external: 5,
      arrayBuffers: 2,
      rss: 80,
    };
  }

  private getObjectSnapshots(): ObjectSnapshot[] {
    const snapshots: ObjectSnapshot[] = [];

    this.objectTracking.forEach((count, type) => {
      snapshots.push({
        type,
        count,
        size: count * 1024, // Estimated size
        retainedSize: count * 512, // Estimated retained size
        instances: [], // Would be populated with actual instances in production
      });
    });

    return snapshots;
  }

  private getListenerSnapshots(): ListenerSnapshot[] {
    const snapshots: ListenerSnapshot[] = [];

    this.listenerTracking.forEach((targets, event) => {
      snapshots.push({
        event,
        count: targets.size,
        elements: Array.from(targets).map(t => t.constructor.name),
        handlers: [], // Would be populated with handler info in production
      });
    });

    return snapshots;
  }

  private getTimerSnapshots(): TimerSnapshot[] {
    return [
      {
        type: "timeout",
        count: this.timerTracking.size,
        ids: Array.from(this.timerTracking),
        callbacks: [], // Would be populated with callback info in production
      },
    ];
  }

  private getDOMNodeCount(): number {
    if (typeof document === "undefined") return 0;
    return document.querySelectorAll("*").length;
  }

  private analyzeObjectGrowth(snapshots: MemorySnapshot[]): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (snapshots.length < 3) return leaks;

    const recent = snapshots.slice(-3);
    const objectGrowth: Map<string, number[]> = new Map();

    // Track object count growth
    recent.forEach(snapshot => {
      snapshot.objects.forEach(obj => {
        if (!objectGrowth.has(obj.type)) {
          objectGrowth.set(obj.type, []);
        }
        objectGrowth.get(obj.type)!.push(obj.count);
      });
    });

    // Detect consistent growth
    objectGrowth.forEach((counts, type) => {
      if (counts.length >= 3) {
        const isGrowing = counts[1] > counts[0] && counts[2] > counts[1];
        const growthRate = (counts[2] - counts[0]) / 2;

        if (isGrowing && growthRate > 100) {
          leaks.push({
            id: this.generateLeakId(),
            type: "object",
            severity: growthRate > 1000 ? "critical" : growthRate > 500 ? "high" : "medium",
            description: `${type} objects growing consistently: ${growthRate.toFixed(0)} objects/snapshot`,
            detectedAt: new Date().toISOString(),
            growthRate: growthRate * 1024, // Estimated bytes
            affectedObjects: [type],
            recommendations: [
              `Review ${type} object lifecycle management`,
              "Check for proper cleanup in component unmounting",
              "Verify event listener removal",
            ],
            estimatedImpact: {
              memoryUsage: growthRate * 1024,
              performanceImpact: Math.min(growthRate / 100, 100),
              stabilityRisk: Math.min(growthRate / 50, 100),
            },
          });
        }
      }
    });

    return leaks;
  }

  private analyzeListenerAccumulation(snapshots: MemorySnapshot[]): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (snapshots.length < 2) return leaks;

    const [previous, current] = snapshots.slice(-2);
    
    current.listeners.forEach(currentListener => {
      const previousListener = previous.listeners.find(l => l.event === currentListener.event);
      
      if (previousListener && currentListener.count > previousListener.count + 10) {
        const growth = currentListener.count - previousListener.count;
        
        leaks.push({
          id: this.generateLeakId(),
          type: "listener",
          severity: growth > 100 ? "high" : growth > 50 ? "medium" : "low",
          description: `Event listeners accumulating for ${currentListener.event}: +${growth} listeners`,
          detectedAt: new Date().toISOString(),
          growthRate: growth * 100, // Estimated bytes per listener
          affectedObjects: [currentListener.event],
          recommendations: [
            "Review event listener cleanup",
            "Use AbortController for automatic cleanup",
            "Check component unmounting logic",
          ],
          estimatedImpact: {
            memoryUsage: growth * 100,
            performanceImpact: growth / 10,
            stabilityRisk: growth / 5,
          },
        });
      }
    });

    return leaks;
  }

  private analyzeTimerAccumulation(snapshots: MemorySnapshot[]): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (snapshots.length < 2) return leaks;

    const [previous, current] = snapshots.slice(-2);
    
    current.timers.forEach(currentTimer => {
      const previousTimer = previous.timers.find(t => t.type === currentTimer.type);
      
      if (previousTimer && currentTimer.count > previousTimer.count + 5) {
        const growth = currentTimer.count - previousTimer.count;
        
        leaks.push({
          id: this.generateLeakId(),
          type: "timer",
          severity: growth > 20 ? "high" : growth > 10 ? "medium" : "low",
          description: `${currentTimer.type} timers accumulating: +${growth} timers`,
          detectedAt: new Date().toISOString(),
          growthRate: growth * 200, // Estimated bytes per timer
          affectedObjects: [currentTimer.type],
          recommendations: [
            "Review timer cleanup logic",
            "Clear timers in component cleanup",
            "Use useEffect cleanup functions",
          ],
          estimatedImpact: {
            memoryUsage: growth * 200,
            performanceImpact: growth * 2,
            stabilityRisk: growth * 3,
          },
        });
      }
    });

    return leaks;
  }

  private analyzeDOMGrowth(snapshots: MemorySnapshot[]): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (snapshots.length < 3) return leaks;

    const recent = snapshots.slice(-3);
    const domCounts = recent.map(s => s.domNodes || 0);

    if (domCounts.every((count, i) => i === 0 || count > domCounts[i - 1])) {
      const growth = domCounts[2] - domCounts[0];
      
      if (growth > 100) {
        leaks.push({
          id: this.generateLeakId(),
          type: "dom",
          severity: growth > 1000 ? "critical" : growth > 500 ? "high" : "medium",
          description: `DOM nodes growing consistently: +${growth} nodes`,
          detectedAt: new Date().toISOString(),
          growthRate: growth * 50, // Estimated bytes per DOM node
          affectedObjects: ["DOM"],
          recommendations: [
            "Review DOM manipulation logic",
            "Check for proper element cleanup",
            "Verify component unmounting removes DOM nodes",
          ],
          estimatedImpact: {
            memoryUsage: growth * 50,
            performanceImpact: growth / 20,
            stabilityRisk: growth / 10,
          },
        });
      }
    }

    return leaks;
  }

  private createMemoryAnalysis(snapshots: MemorySnapshot[], leaks: MemoryLeak[]): MemoryAnalysis {
    const criticalLeaks = leaks.filter(leak => leak.severity === "critical").length;
    const totalGrowthRate = leaks.reduce((sum, leak) => sum + leak.growthRate, 0);

    return {
      totalLeaks: leaks.length,
      criticalLeaks,
      memoryGrowthRate: totalGrowthRate / 1024 / 1024, // MB/s
      heapFragmentation: this.calculateHeapFragmentation(snapshots),
      gcEfficiency: this.calculateGCEfficiency(snapshots),
      recommendations: this.generateRecommendations(leaks),
      trends: snapshots.slice(-10).map(snapshot => ({
        timestamp: snapshot.timestamp,
        heapUsed: snapshot.heapUsed,
        objectCount: snapshot.objects.reduce((sum, obj) => sum + obj.count, 0),
        leakCount: leaks.filter(leak => 
          new Date(leak.detectedAt) <= new Date(snapshot.timestamp)
        ).length,
      })),
    };
  }

  private createEmptyAnalysis(): MemoryAnalysis {
    return {
      totalLeaks: 0,
      criticalLeaks: 0,
      memoryGrowthRate: 0,
      heapFragmentation: 0,
      gcEfficiency: 100,
      recommendations: [],
      trends: [],
    };
  }

  private calculateHeapFragmentation(snapshots: MemorySnapshot[]): number {
    if (snapshots.length === 0) return 0;
    
    const latest = snapshots[snapshots.length - 1];
    const fragmentation = ((latest.heapTotal - latest.heapUsed) / latest.heapTotal) * 100;
    return Math.max(0, Math.min(100, fragmentation));
  }

  private calculateGCEfficiency(snapshots: MemorySnapshot[]): number {
    // Simplified GC efficiency calculation
    if (snapshots.length < 2) return 100;
    
    const recent = snapshots.slice(-5);
    let gcEvents = 0;
    
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsed < recent[i - 1].heapUsed) {
        gcEvents++;
      }
    }
    
    return Math.min(100, (gcEvents / (recent.length - 1)) * 100);
  }

  private generateRecommendations(leaks: MemoryLeak[]): string[] {
    const recommendations = new Set<string>();
    
    leaks.forEach(leak => {
      leak.recommendations.forEach(rec => recommendations.add(rec));
    });
    
    if (leaks.length > 5) {
      recommendations.add("Consider implementing automated memory cleanup");
    }
    
    if (leaks.some(leak => leak.severity === "critical")) {
      recommendations.add("Immediate action required for critical memory leaks");
    }
    
    return Array.from(recommendations);
  }

  private generateSnapshotId(): string {
    return `SNAPSHOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLeakId(): string {
    return `LEAK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.stopMonitoring();
      this.removeAllListeners();
      console.log("🔍 Advanced Memory Leak Detection Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during memory leak detection service shutdown:", error);
    }
  }
}

export const advancedMemoryLeakDetectionService = new AdvancedMemoryLeakDetectionService();
export default advancedMemoryLeakDetectionService;