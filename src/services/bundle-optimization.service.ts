/**
 * Bundle Optimization Service
 * Monitors and optimizes application bundle size and performance
 */

import React from "react";

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  recommendations: OptimizationRecommendation[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
  loadTime?: number;
}

interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  usage: "used" | "unused" | "partial";
  alternatives?: string[];
}

interface OptimizationRecommendation {
  type:
    | "code-splitting"
    | "tree-shaking"
    | "dependency"
    | "compression"
    | "caching";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  impact: string;
  implementation: string;
  estimatedSavings: number;
}

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

class BundleOptimizationService {
  private static instance: BundleOptimizationService;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics = {
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
  };

  private constructor() {
    this.initializePerformanceMonitoring();
  }

  public static getInstance(): BundleOptimizationService {
    if (!BundleOptimizationService.instance) {
      BundleOptimizationService.instance = new BundleOptimizationService();
    }
    return BundleOptimizationService.instance;
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      // Monitor Core Web Vitals
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case "paint":
              if (entry.name === "first-contentful-paint") {
                this.metrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case "largest-contentful-paint":
              this.metrics.largestContentfulPaint = entry.startTime;
              break;
            case "first-input":
              this.metrics.firstInputDelay =
                (entry as any).processingStart - entry.startTime;
              break;
            case "layout-shift":
              if (!(entry as any).hadRecentInput) {
                this.metrics.cumulativeLayoutShift += (entry as any).value;
              }
              break;
          }
        });
      });

      try {
        this.performanceObserver.observe({
          entryTypes: [
            "paint",
            "largest-contentful-paint",
            "first-input",
            "layout-shift",
          ],
        });
      } catch (error) {
        console.warn("Performance monitoring not fully supported:", error);
      }
    }
  }

  /**
   * Analyze current bundle and provide optimization recommendations
   */
  public async analyzeBundleSize(): Promise<BundleAnalysis> {
    const chunks = await this.getChunkInfo();
    const dependencies = await this.analyzeDependencies();
    const recommendations = this.generateRecommendations(chunks, dependencies);

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunks.reduce(
      (sum, chunk) => sum + chunk.gzippedSize,
      0,
    );

    return {
      totalSize,
      gzippedSize,
      chunks,
      dependencies,
      recommendations,
    };
  }

  private async getChunkInfo(): Promise<ChunkInfo[]> {
    // In a real implementation, this would analyze webpack stats or use bundler APIs
    // For now, we'll simulate chunk analysis
    const chunks: ChunkInfo[] = [
      {
        name: "main",
        size: 250000, // 250KB
        gzippedSize: 75000, // 75KB
        modules: ["src/App.tsx", "src/main.tsx", "src/components/**"],
        isAsync: false,
        loadTime: 150,
      },
      {
        name: "vendor",
        size: 800000, // 800KB
        gzippedSize: 200000, // 200KB
        modules: ["react", "react-dom", "axios", "lucide-react"],
        isAsync: false,
        loadTime: 300,
      },
      {
        name: "clinical",
        size: 150000, // 150KB
        gzippedSize: 45000, // 45KB
        modules: ["src/components/clinical/**"],
        isAsync: true,
        loadTime: 100,
      },
      {
        name: "revenue",
        size: 120000, // 120KB
        gzippedSize: 36000, // 36KB
        modules: ["src/components/revenue/**"],
        isAsync: true,
        loadTime: 80,
      },
    ];

    return chunks;
  }

  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    // In a real implementation, this would analyze package.json and usage
    const dependencies: DependencyInfo[] = [
      {
        name: "react",
        version: "18.2.0",
        size: 42000,
        usage: "used",
      },
      {
        name: "react-dom",
        version: "18.2.0",
        size: 130000,
        usage: "used",
      },
      {
        name: "axios",
        version: "1.9.0",
        size: 45000,
        usage: "used",
      },
      {
        name: "lucide-react",
        version: "0.394.0",
        size: 180000,
        usage: "partial",
        alternatives: ["react-icons (smaller)", "heroicons"],
      },
      {
        name: "framer-motion",
        version: "11.18.0",
        size: 250000,
        usage: "partial",
        alternatives: ["react-spring (lighter)", "CSS animations"],
      },
      {
        name: "date-fns",
        version: "3.6.0",
        size: 200000,
        usage: "partial",
        alternatives: ["dayjs (smaller)", "native Date methods"],
      },
    ];

    return dependencies;
  }

  private generateRecommendations(
    chunks: ChunkInfo[],
    dependencies: DependencyInfo[],
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze chunk sizes
    const largeChunks = chunks.filter((chunk) => chunk.size > 200000);
    largeChunks.forEach((chunk) => {
      recommendations.push({
        type: "code-splitting",
        priority: chunk.size > 500000 ? "critical" : "high",
        description: `Chunk '${chunk.name}' is ${Math.round(chunk.size / 1000)}KB, consider splitting`,
        impact: `Reduce initial bundle size by ~${Math.round((chunk.size * 0.3) / 1000)}KB`,
        implementation:
          "Use React.lazy() and dynamic imports for route-based code splitting",
        estimatedSavings: Math.round(chunk.size * 0.3),
      });
    });

    // Analyze dependencies
    const partialDependencies = dependencies.filter(
      (dep) => dep.usage === "partial",
    );
    partialDependencies.forEach((dep) => {
      recommendations.push({
        type: "tree-shaking",
        priority: dep.size > 100000 ? "high" : "medium",
        description: `${dep.name} is only partially used (${Math.round(dep.size / 1000)}KB)`,
        impact: `Potential savings of ~${Math.round((dep.size * 0.5) / 1000)}KB through tree-shaking`,
        implementation:
          "Import only specific functions/components instead of entire library",
        estimatedSavings: Math.round(dep.size * 0.5),
      });

      if (dep.alternatives && dep.alternatives.length > 0) {
        recommendations.push({
          type: "dependency",
          priority: "medium",
          description: `Consider replacing ${dep.name} with lighter alternatives`,
          impact: `Potential savings of ~${Math.round((dep.size * 0.6) / 1000)}KB`,
          implementation: `Replace with: ${dep.alternatives.join(" or ")}`,
          estimatedSavings: Math.round(dep.size * 0.6),
        });
      }
    });

    // Compression recommendations
    const totalUncompressed = chunks.reduce(
      (sum, chunk) => sum + chunk.size,
      0,
    );
    const totalCompressed = chunks.reduce(
      (sum, chunk) => sum + chunk.gzippedSize,
      0,
    );
    const compressionRatio = totalCompressed / totalUncompressed;

    if (compressionRatio > 0.4) {
      recommendations.push({
        type: "compression",
        priority: "medium",
        description: "Bundle compression ratio could be improved",
        impact: `Potential savings of ~${Math.round((totalCompressed - totalUncompressed * 0.3) / 1000)}KB`,
        implementation:
          "Enable Brotli compression, optimize asset formats, minify CSS/JS",
        estimatedSavings: Math.round(totalCompressed - totalUncompressed * 0.3),
      });
    }

    // Caching recommendations
    recommendations.push({
      type: "caching",
      priority: "high",
      description: "Implement aggressive caching strategy",
      impact: "Improve repeat visit performance by 60-80%",
      implementation:
        "Use service workers, implement proper cache headers, version assets",
      estimatedSavings: 0, // Performance improvement rather than size
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    // Update TTI and TBT if available
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.timeToInteractive =
          navigation.domInteractive - navigation.fetchStart;
      }
    }

    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): {
    metrics: PerformanceMetrics;
    scores: Record<
      string,
      { score: number; rating: "good" | "needs-improvement" | "poor" }
    >;
    recommendations: string[];
  } {
    const metrics = this.getPerformanceMetrics();
    const scores = {
      fcp: {
        score: metrics.firstContentfulPaint,
        rating:
          metrics.firstContentfulPaint < 1800
            ? "good"
            : metrics.firstContentfulPaint < 3000
              ? "needs-improvement"
              : "poor",
      },
      lcp: {
        score: metrics.largestContentfulPaint,
        rating:
          metrics.largestContentfulPaint < 2500
            ? "good"
            : metrics.largestContentfulPaint < 4000
              ? "needs-improvement"
              : "poor",
      },
      fid: {
        score: metrics.firstInputDelay,
        rating:
          metrics.firstInputDelay < 100
            ? "good"
            : metrics.firstInputDelay < 300
              ? "needs-improvement"
              : "poor",
      },
      cls: {
        score: metrics.cumulativeLayoutShift,
        rating:
          metrics.cumulativeLayoutShift < 0.1
            ? "good"
            : metrics.cumulativeLayoutShift < 0.25
              ? "needs-improvement"
              : "poor",
      },
    };

    const recommendations: string[] = [];

    if (scores.fcp.rating !== "good") {
      recommendations.push(
        "Optimize First Contentful Paint by reducing render-blocking resources",
      );
    }
    if (scores.lcp.rating !== "good") {
      recommendations.push(
        "Improve Largest Contentful Paint by optimizing images and critical resources",
      );
    }
    if (scores.fid.rating !== "good") {
      recommendations.push(
        "Reduce First Input Delay by minimizing JavaScript execution time",
      );
    }
    if (scores.cls.rating !== "good") {
      recommendations.push(
        "Fix Cumulative Layout Shift by setting dimensions for images and ads",
      );
    }

    return { metrics, scores, recommendations };
  }

  /**
   * Implement lazy loading for images
   */
  public implementLazyLoading(): void {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const images = document.querySelectorAll("img[data-src]");
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || "";
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }

  /**
   * Preload critical resources
   */
  public preloadCriticalResources(resources: string[]): void {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;

      if (resource.endsWith(".js")) {
        link.as = "script";
      } else if (resource.endsWith(".css")) {
        link.as = "style";
      } else if (resource.match(/\.(woff2?|ttf|otf)$/)) {
        link.as = "font";
        link.crossOrigin = "anonymous";
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = "image";
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// React Hook for Bundle Optimization
export const useBundleOptimization = () => {
  const optimizer = BundleOptimizationService.getInstance();

  const analyzeBundleSize = React.useCallback(async () => {
    return await optimizer.analyzeBundleSize();
  }, [optimizer]);

  const getPerformanceMetrics = React.useCallback(() => {
    return optimizer.getPerformanceMetrics();
  }, [optimizer]);

  const generatePerformanceReport = React.useCallback(() => {
    return optimizer.generatePerformanceReport();
  }, [optimizer]);

  React.useEffect(() => {
    // Implement lazy loading on mount
    optimizer.implementLazyLoading();

    return () => {
      optimizer.cleanup();
    };
  }, [optimizer]);

  return {
    analyzeBundleSize,
    getPerformanceMetrics,
    generatePerformanceReport,
  };
};

export const bundleOptimizer = BundleOptimizationService.getInstance();
export default BundleOptimizationService;
