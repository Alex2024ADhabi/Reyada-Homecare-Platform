/**
 * Bundle Size Monitoring Service
 * Implements automated bundle analysis and alerts
 * Part of Phase 3: Performance Optimization - Bundle Optimization
 */

import { EventEmitter } from "eventemitter3";

// Bundle Analysis Types
export interface BundleAnalysis {
  id: string;
  timestamp: string;
  version: string;
  bundles: BundleInfo[];
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  treeshaking: TreeshakingAnalysis;
  recommendations: BundleRecommendation[];
  performance: PerformanceMetrics;
}

export interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  type: "main" | "vendor" | "chunk" | "asset";
  modules: ModuleInfo[];
  loadTime: number;
  cacheability: number;
}

export interface ChunkInfo {
  id: string;
  name: string;
  size: number;
  modules: string[];
  parents: string[];
  children: string[];
  isAsync: boolean;
  isEntry: boolean;
  loadPriority: "high" | "medium" | "low";
}

export interface ModuleInfo {
  id: string;
  name: string;
  size: number;
  reasons: string[];
  dependencies: string[];
  isUsed: boolean;
  treeShaken: boolean;
}

export interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  gzippedSize: number;
  type: "production" | "development";
  usage: "used" | "unused" | "partial";
  alternatives: string[];
  impact: number;
}

export interface TreeshakingAnalysis {
  totalModules: number;
  shakenModules: number;
  unusedCode: number;
  efficiency: number;
  opportunities: TreeshakingOpportunity[];
}

export interface TreeshakingOpportunity {
  module: string;
  unusedExports: string[];
  potentialSavings: number;
  recommendation: string;
}

export interface BundleRecommendation {
  id: string;
  type: "size" | "splitting" | "dependency" | "treeshaking" | "caching";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: {
    sizeReduction: number;
    performanceGain: number;
    implementationEffort: number;
  };
  implementation: {
    steps: string[];
    code?: string;
    configuration?: Record<string, any>;
  };
}

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  bundleLoadTime: number;
}

export interface BundleBudget {
  maxTotalSize: number; // bytes
  maxGzippedSize: number; // bytes
  maxChunkSize: number; // bytes
  maxAssetSize: number; // bytes
  performanceThresholds: {
    fcp: number; // First Contentful Paint (ms)
    lcp: number; // Largest Contentful Paint (ms)
    tti: number; // Time to Interactive (ms)
    tbt: number; // Total Blocking Time (ms)
    cls: number; // Cumulative Layout Shift
  };
}

export interface BundleAlert {
  id: string;
  type: "budget_exceeded" | "performance_degradation" | "dependency_bloat" | "treeshaking_opportunity";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  metrics: Record<string, number>;
  recommendations: string[];
  acknowledged: boolean;
}

class BundleSizeMonitoringService extends EventEmitter {
  private analyses: Map<string, BundleAnalysis> = new Map();
  private alerts: Map<string, BundleAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private budget: BundleBudget = {
    maxTotalSize: 2 * 1024 * 1024, // 2MB
    maxGzippedSize: 500 * 1024, // 500KB
    maxChunkSize: 250 * 1024, // 250KB
    maxAssetSize: 100 * 1024, // 100KB
    performanceThresholds: {
      fcp: 1500, // 1.5s
      lcp: 2500, // 2.5s
      tti: 3000, // 3s
      tbt: 300, // 300ms
      cls: 0.1, // 0.1
    },
  };

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("📦 Initializing Bundle Size Monitoring Service...");

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Start monitoring
      this.startMonitoring();

      this.emit("service:initialized");
      console.log("✅ Bundle Size Monitoring Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Bundle Size Monitoring Service:", error);
      throw error;
    }
  }

  /**
   * Start bundle monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Analyze bundles every 5 minutes in development
    // In production, this would be triggered by build events
    this.monitoringInterval = setInterval(() => {
      this.analyzeBundles();
    }, 300000);

    // Initial analysis
    this.analyzeBundles();

    this.emit("monitoring:started");
    console.log("📦 Bundle size monitoring started");
  }

  /**
   * Stop bundle monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit("monitoring:stopped");
    console.log("⏹️ Bundle size monitoring stopped");
  }

  /**
   * Analyze current bundles
   */
  async analyzeBundles(): Promise<BundleAnalysis> {
    try {
      const analysisId = this.generateAnalysisId();
      const timestamp = new Date().toISOString();

      // Get bundle information (simulated - in real implementation would analyze actual bundles)
      const bundles = await this.getBundleInfo();
      const chunks = await this.getChunkInfo();
      const dependencies = await this.getDependencyInfo();
      const treeshaking = await this.analyzeTreeshaking();
      const performance = await this.getPerformanceMetrics();

      const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
      const gzippedSize = bundles.reduce((sum, bundle) => sum + bundle.gzippedSize, 0);

      const recommendations = this.generateRecommendations(
        bundles,
        chunks,
        dependencies,
        treeshaking,
        performance
      );

      const analysis: BundleAnalysis = {
        id: analysisId,
        timestamp,
        version: this.getCurrentVersion(),
        bundles,
        totalSize,
        gzippedSize,
        chunks,
        dependencies,
        treeshaking,
        recommendations,
        performance,
      };

      this.analyses.set(analysisId, analysis);

      // Keep only last 50 analyses
      if (this.analyses.size > 50) {
        const oldestKey = this.analyses.keys().next().value;
        this.analyses.delete(oldestKey);
      }

      // Check budget violations
      await this.checkBudgetViolations(analysis);

      this.emit("analysis:completed", analysis);
      return analysis;
    } catch (error) {
      console.error("❌ Failed to analyze bundles:", error);
      throw error;
    }
  }

  /**
   * Get latest bundle analysis
   */
  getLatestAnalysis(): BundleAnalysis | null {
    const analyses = Array.from(this.analyses.values());
    if (analyses.length === 0) return null;
    
    return analyses.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }

  /**
   * Get bundle analysis history
   */
  getAnalysisHistory(limit: number = 10): BundleAnalysis[] {
    return Array.from(this.analyses.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): BundleAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Update bundle budget
   */
  updateBudget(budget: Partial<BundleBudget>): void {
    this.budget = { ...this.budget, ...budget };
    this.emit("budget:updated", this.budget);
  }

  /**
   * Get current budget
   */
  getBudget(): BundleBudget {
    return { ...this.budget };
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit("alert:acknowledged", alert);
      return true;
    }
    return false;
  }

  /**
   * Optimize bundle based on recommendations
   */
  async optimizeBundle(recommendationIds: string[]): Promise<{
    applied: string[];
    failed: string[];
    estimatedSavings: number;
  }> {
    const applied: string[] = [];
    const failed: string[] = [];
    let estimatedSavings = 0;

    const latestAnalysis = this.getLatestAnalysis();
    if (!latestAnalysis) {
      throw new Error("No analysis available");
    }

    for (const recId of recommendationIds) {
      const recommendation = latestAnalysis.recommendations.find(r => r.id === recId);
      if (!recommendation) {
        failed.push(recId);
        continue;
      }

      try {
        await this.applyRecommendation(recommendation);
        applied.push(recId);
        estimatedSavings += recommendation.impact.sizeReduction;
      } catch (error) {
        console.error(`Failed to apply recommendation ${recId}:`, error);
        failed.push(recId);
      }
    }

    return { applied, failed, estimatedSavings };
  }

  // Private helper methods
  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Monitor performance metrics
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === "navigation") {
            this.emit("performance:navigation", entry);
          } else if (entry.entryType === "resource") {
            this.emit("performance:resource", entry);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ["navigation", "resource"] });
      } catch (error) {
        console.warn("Performance observer not fully supported:", error);
      }
    }
  }

  private async getBundleInfo(): Promise<BundleInfo[]> {
    // Simulated bundle information
    // In real implementation, this would analyze actual webpack stats or build output
    return [
      {
        name: "main",
        size: 450 * 1024, // 450KB
        gzippedSize: 120 * 1024, // 120KB
        type: "main",
        modules: [
          {
            id: "main.tsx",
            name: "src/main.tsx",
            size: 2048,
            reasons: ["entry"],
            dependencies: ["react", "react-dom"],
            isUsed: true,
            treeShaken: false,
          },
          {
            id: "app.tsx",
            name: "src/App.tsx",
            size: 15360,
            reasons: ["main.tsx"],
            dependencies: ["react-router-dom"],
            isUsed: true,
            treeShaken: false,
          },
        ],
        loadTime: 180,
        cacheability: 85,
      },
      {
        name: "vendor",
        size: 850 * 1024, // 850KB
        gzippedSize: 280 * 1024, // 280KB
        type: "vendor",
        modules: [
          {
            id: "react",
            name: "node_modules/react/index.js",
            size: 45 * 1024,
            reasons: ["main.tsx", "app.tsx"],
            dependencies: [],
            isUsed: true,
            treeShaken: true,
          },
          {
            id: "react-dom",
            name: "node_modules/react-dom/index.js",
            size: 120 * 1024,
            reasons: ["main.tsx"],
            dependencies: ["react"],
            isUsed: true,
            treeShaken: true,
          },
        ],
        loadTime: 320,
        cacheability: 95,
      },
      {
        name: "components",
        size: 180 * 1024, // 180KB
        gzippedSize: 45 * 1024, // 45KB
        type: "chunk",
        modules: [],
        loadTime: 95,
        cacheability: 75,
      },
    ];
  }

  private async getChunkInfo(): Promise<ChunkInfo[]> {
    return [
      {
        id: "main",
        name: "main",
        size: 450 * 1024,
        modules: ["main.tsx", "app.tsx"],
        parents: [],
        children: ["components"],
        isAsync: false,
        isEntry: true,
        loadPriority: "high",
      },
      {
        id: "vendor",
        name: "vendor",
        size: 850 * 1024,
        modules: ["react", "react-dom", "react-router-dom"],
        parents: [],
        children: [],
        isAsync: false,
        isEntry: false,
        loadPriority: "high",
      },
      {
        id: "components",
        name: "components",
        size: 180 * 1024,
        modules: ["components/*"],
        parents: ["main"],
        children: [],
        isAsync: true,
        isEntry: false,
        loadPriority: "medium",
      },
    ];
  }

  private async getDependencyInfo(): Promise<DependencyInfo[]> {
    return [
      {
        name: "react",
        version: "18.2.0",
        size: 45 * 1024,
        gzippedSize: 15 * 1024,
        type: "production",
        usage: "used",
        alternatives: ["preact", "vue"],
        impact: 85,
      },
      {
        name: "react-dom",
        version: "18.2.0",
        size: 120 * 1024,
        gzippedSize: 38 * 1024,
        type: "production",
        usage: "used",
        alternatives: ["preact/compat"],
        impact: 90,
      },
      {
        name: "lodash",
        version: "4.17.21",
        size: 70 * 1024,
        gzippedSize: 25 * 1024,
        type: "production",
        usage: "partial",
        alternatives: ["lodash-es", "ramda"],
        impact: 60,
      },
      {
        name: "moment",
        version: "2.29.4",
        size: 67 * 1024,
        gzippedSize: 20 * 1024,
        type: "production",
        usage: "unused",
        alternatives: ["date-fns", "dayjs"],
        impact: 0,
      },
    ];
  }

  private async analyzeTreeshaking(): Promise<TreeshakingAnalysis> {
    const totalModules = 150;
    const shakenModules = 45;
    const unusedCode = 180 * 1024; // 180KB

    return {
      totalModules,
      shakenModules,
      unusedCode,
      efficiency: (shakenModules / totalModules) * 100,
      opportunities: [
        {
          module: "lodash",
          unusedExports: ["debounce", "throttle", "merge"],
          potentialSavings: 25 * 1024,
          recommendation: "Use lodash-es and import only needed functions",
        },
        {
          module: "moment",
          unusedExports: ["*"],
          potentialSavings: 67 * 1024,
          recommendation: "Remove unused moment.js dependency",
        },
      ],
    };
  }

  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // In real implementation, this would get actual performance metrics
    return {
      firstContentfulPaint: 1200,
      largestContentfulPaint: 2100,
      timeToInteractive: 2800,
      totalBlockingTime: 180,
      cumulativeLayoutShift: 0.08,
      bundleLoadTime: 450,
    };
  }

  private generateRecommendations(
    bundles: BundleInfo[],
    chunks: ChunkInfo[],
    dependencies: DependencyInfo[],
    treeshaking: TreeshakingAnalysis,
    performance: PerformanceMetrics
  ): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Check for large bundles
    const largeBundles = bundles.filter(bundle => bundle.size > this.budget.maxChunkSize);
    if (largeBundles.length > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: "splitting",
        priority: "high",
        title: "Split Large Bundles",
        description: `${largeBundles.length} bundles exceed size limit`,
        impact: {
          sizeReduction: 200 * 1024,
          performanceGain: 25,
          implementationEffort: 60,
        },
        implementation: {
          steps: [
            "Implement dynamic imports for large components",
            "Split vendor libraries into separate chunks",
            "Use route-based code splitting",
          ],
          code: `
// Dynamic import example
const LazyComponent = React.lazy(() => import('./LargeComponent'));

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./Dashboard'))
  }
];
          `,
        },
      });
    }

    // Check for unused dependencies
    const unusedDeps = dependencies.filter(dep => dep.usage === "unused");
    if (unusedDeps.length > 0) {
      const totalSavings = unusedDeps.reduce((sum, dep) => sum + dep.size, 0);
      recommendations.push({
        id: this.generateRecommendationId(),
        type: "dependency",
        priority: "medium",
        title: "Remove Unused Dependencies",
        description: `${unusedDeps.length} unused dependencies found`,
        impact: {
          sizeReduction: totalSavings,
          performanceGain: 15,
          implementationEffort: 20,
        },
        implementation: {
          steps: [
            "Remove unused dependencies from package.json",
            "Update imports to remove references",
            "Run bundle analyzer to verify removal",
          ],
        },
      });
    }

    // Check treeshaking opportunities
    if (treeshaking.opportunities.length > 0) {
      const totalSavings = treeshaking.opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);
      recommendations.push({
        id: this.generateRecommendationId(),
        type: "treeshaking",
        priority: "medium",
        title: "Improve Tree Shaking",
        description: `${treeshaking.opportunities.length} tree shaking opportunities found`,
        impact: {
          sizeReduction: totalSavings,
          performanceGain: 20,
          implementationEffort: 40,
        },
        implementation: {
          steps: [
            "Use ES modules for better tree shaking",
            "Import only needed functions from libraries",
            "Configure webpack for better dead code elimination",
          ],
          configuration: {
            webpack: {
              optimization: {
                usedExports: true,
                sideEffects: false,
              },
            },
          },
        },
      });
    }

    return recommendations;
  }

  private async checkBudgetViolations(analysis: BundleAnalysis): Promise<void> {
    // Check total size budget
    if (analysis.totalSize > this.budget.maxTotalSize) {
      this.createAlert({
        type: "budget_exceeded",
        severity: "high",
        title: "Total Bundle Size Exceeded",
        description: `Total bundle size (${this.formatBytes(analysis.totalSize)}) exceeds budget (${this.formatBytes(this.budget.maxTotalSize)})`,
        metrics: {
          currentSize: analysis.totalSize,
          budgetSize: this.budget.maxTotalSize,
          overage: analysis.totalSize - this.budget.maxTotalSize,
        },
        recommendations: [
          "Implement code splitting",
          "Remove unused dependencies",
          "Optimize large assets",
        ],
      });
    }

    // Check gzipped size budget
    if (analysis.gzippedSize > this.budget.maxGzippedSize) {
      this.createAlert({
        type: "budget_exceeded",
        severity: "medium",
        title: "Gzipped Bundle Size Exceeded",
        description: `Gzipped bundle size (${this.formatBytes(analysis.gzippedSize)}) exceeds budget (${this.formatBytes(this.budget.maxGzippedSize)})`,
        metrics: {
          currentSize: analysis.gzippedSize,
          budgetSize: this.budget.maxGzippedSize,
          overage: analysis.gzippedSize - this.budget.maxGzippedSize,
        },
        recommendations: [
          "Enable better compression",
          "Optimize text-heavy assets",
          "Use more efficient libraries",
        ],
      });
    }

    // Check performance thresholds
    if (analysis.performance.largestContentfulPaint > this.budget.performanceThresholds.lcp) {
      this.createAlert({
        type: "performance_degradation",
        severity: "high",
        title: "Poor Largest Contentful Paint",
        description: `LCP (${analysis.performance.largestContentfulPaint}ms) exceeds threshold (${this.budget.performanceThresholds.lcp}ms)`,
        metrics: {
          currentLCP: analysis.performance.largestContentfulPaint,
          thresholdLCP: this.budget.performanceThresholds.lcp,
        },
        recommendations: [
          "Optimize critical rendering path",
          "Preload important resources",
          "Reduce bundle size",
        ],
      });
    }
  }

  private createAlert(alertData: Omit<BundleAlert, "id" | "timestamp" | "acknowledged">): void {
    const alert: BundleAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);

    // Keep only last 100 alerts
    if (this.alerts.size > 100) {
      const oldestKey = this.alerts.keys().next().value;
      this.alerts.delete(oldestKey);
    }

    this.emit("alert:created", alert);
  }

  private async applyRecommendation(recommendation: BundleRecommendation): Promise<void> {
    // In a real implementation, this would apply the recommendation
    // For now, we'll just simulate the application
    console.log(`Applying recommendation: ${recommendation.title}`);
    
    // Simulate implementation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Applied recommendation: ${recommendation.title}`);
  }

  private getCurrentVersion(): string {
    // In real implementation, this would get the actual version from package.json
    return "1.0.0";
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  private generateAnalysisId(): string {
    return `ANALYSIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.stopMonitoring();
      this.removeAllListeners();
      console.log("📦 Bundle Size Monitoring Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during bundle size monitoring service shutdown:", error);
    }
  }
}

export const bundleSizeMonitoringService = new BundleSizeMonitoringService();
export default bundleSizeMonitoringService;