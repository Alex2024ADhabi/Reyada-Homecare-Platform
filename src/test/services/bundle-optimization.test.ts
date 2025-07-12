import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bundleOptimizer } from "@/services/bundle-optimization.service";

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

Object.defineProperty(global, "PerformanceObserver", {
  writable: true,
  value: mockPerformanceObserver,
});

// Mock performance API
Object.defineProperty(global, "performance", {
  writable: true,
  value: {
    getEntriesByType: vi.fn(() => [
      {
        entryType: "navigation",
        fetchStart: 100,
        domInteractive: 500,
      },
    ]),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
});

describe("BundleOptimizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    bundleOptimizer.cleanup();
  });

  describe("Bundle Analysis", () => {
    it("should analyze bundle size and provide recommendations", async () => {
      const analysis = await bundleOptimizer.analyzeBundleSize();

      expect(analysis).toHaveProperty("totalSize");
      expect(analysis).toHaveProperty("gzippedSize");
      expect(analysis).toHaveProperty("chunks");
      expect(analysis).toHaveProperty("dependencies");
      expect(analysis).toHaveProperty("recommendations");

      expect(typeof analysis.totalSize).toBe("number");
      expect(typeof analysis.gzippedSize).toBe("number");
      expect(Array.isArray(analysis.chunks)).toBe(true);
      expect(Array.isArray(analysis.dependencies)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it("should identify large chunks for code splitting", async () => {
      const analysis = await bundleOptimizer.analyzeBundleSize();

      const codeSplittingRecommendations = analysis.recommendations.filter(
        (rec) => rec.type === "code-splitting",
      );

      expect(codeSplittingRecommendations.length).toBeGreaterThan(0);

      codeSplittingRecommendations.forEach((rec) => {
        expect(rec.description).toContain("KB");
        expect(rec.implementation).toContain("React.lazy");
        expect(rec.estimatedSavings).toBeGreaterThan(0);
      });
    });

    it("should identify tree-shaking opportunities", async () => {
      const analysis = await bundleOptimizer.analyzeBundleSize();

      const treeShakingRecommendations = analysis.recommendations.filter(
        (rec) => rec.type === "tree-shaking",
      );

      expect(treeShakingRecommendations.length).toBeGreaterThan(0);

      treeShakingRecommendations.forEach((rec) => {
        expect(rec.description).toContain("partially used");
        expect(rec.implementation).toContain("Import only specific");
      });
    });

    it("should suggest dependency alternatives", async () => {
      const analysis = await bundleOptimizer.analyzeBundleSize();

      const dependencyRecommendations = analysis.recommendations.filter(
        (rec) => rec.type === "dependency",
      );

      expect(dependencyRecommendations.length).toBeGreaterThan(0);

      dependencyRecommendations.forEach((rec) => {
        expect(rec.description).toContain("alternatives");
        expect(rec.implementation).toContain("Replace with");
      });
    });

    it("should prioritize recommendations correctly", async () => {
      const analysis = await bundleOptimizer.analyzeBundleSize();

      const priorities = analysis.recommendations.map((rec) => rec.priority);
      const priorityOrder = ["critical", "high", "medium", "low"];

      // Check that recommendations are sorted by priority
      for (let i = 0; i < priorities.length - 1; i++) {
        const currentIndex = priorityOrder.indexOf(priorities[i]);
        const nextIndex = priorityOrder.indexOf(priorities[i + 1]);
        expect(currentIndex).toBeLessThanOrEqual(nextIndex);
      }
    });
  });

  describe("Performance Metrics", () => {
    it("should collect performance metrics", () => {
      const metrics = bundleOptimizer.getPerformanceMetrics();

      expect(metrics).toHaveProperty("firstContentfulPaint");
      expect(metrics).toHaveProperty("largestContentfulPaint");
      expect(metrics).toHaveProperty("firstInputDelay");
      expect(metrics).toHaveProperty("cumulativeLayoutShift");
      expect(metrics).toHaveProperty("timeToInteractive");
      expect(metrics).toHaveProperty("totalBlockingTime");

      Object.values(metrics).forEach((value) => {
        expect(typeof value).toBe("number");
      });
    });

    it("should generate performance report with scores", () => {
      const report = bundleOptimizer.generatePerformanceReport();

      expect(report).toHaveProperty("metrics");
      expect(report).toHaveProperty("scores");
      expect(report).toHaveProperty("recommendations");

      expect(report.scores).toHaveProperty("fcp");
      expect(report.scores).toHaveProperty("lcp");
      expect(report.scores).toHaveProperty("fid");
      expect(report.scores).toHaveProperty("cls");

      Object.values(report.scores).forEach((score) => {
        expect(score).toHaveProperty("score");
        expect(score).toHaveProperty("rating");
        expect(["good", "needs-improvement", "poor"]).toContain(score.rating);
      });

      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it("should provide appropriate recommendations based on scores", () => {
      const report = bundleOptimizer.generatePerformanceReport();

      // Mock poor performance scores
      const mockReport = {
        ...report,
        scores: {
          fcp: { score: 4000, rating: "poor" as const },
          lcp: { score: 5000, rating: "poor" as const },
          fid: { score: 400, rating: "poor" as const },
          cls: { score: 0.3, rating: "poor" as const },
        },
      };

      // Should have recommendations for each poor score
      expect(report.recommendations.length).toBeGreaterThan(0);

      report.recommendations.forEach((rec) => {
        expect(typeof rec).toBe("string");
        expect(rec.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Lazy Loading", () => {
    it("should implement lazy loading for images", () => {
      // Create mock images with data-src attribute
      const img1 = document.createElement("img");
      img1.setAttribute("data-src", "image1.jpg");
      document.body.appendChild(img1);

      const img2 = document.createElement("img");
      img2.setAttribute("data-src", "image2.jpg");
      document.body.appendChild(img2);

      // Mock IntersectionObserver
      const mockIntersectionObserver = vi.fn();
      const mockObserve = vi.fn();
      const mockUnobserve = vi.fn();

      mockIntersectionObserver.mockImplementation((callback) => ({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      }));

      Object.defineProperty(global, "IntersectionObserver", {
        writable: true,
        value: mockIntersectionObserver,
      });

      bundleOptimizer.implementLazyLoading();

      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledTimes(2);

      // Cleanup
      document.body.removeChild(img1);
      document.body.removeChild(img2);
    });
  });

  describe("Resource Preloading", () => {
    it("should preload critical resources", () => {
      const resources = [
        "critical.js",
        "styles.css",
        "font.woff2",
        "hero-image.jpg",
      ];

      bundleOptimizer.preloadCriticalResources(resources);

      // Check that link elements were added to head
      const linkElements = document.head.querySelectorAll(
        'link[rel="preload"]',
      );
      expect(linkElements.length).toBe(resources.length);

      // Check that appropriate 'as' attributes are set
      const jsLink = Array.from(linkElements).find((link) =>
        link.getAttribute("href")?.endsWith(".js"),
      );
      expect(jsLink?.getAttribute("as")).toBe("script");

      const cssLink = Array.from(linkElements).find((link) =>
        link.getAttribute("href")?.endsWith(".css"),
      );
      expect(cssLink?.getAttribute("as")).toBe("style");

      const fontLink = Array.from(linkElements).find((link) =>
        link.getAttribute("href")?.endsWith(".woff2"),
      );
      expect(fontLink?.getAttribute("as")).toBe("font");
      expect(fontLink?.getAttribute("crossorigin")).toBe("anonymous");

      const imageLink = Array.from(linkElements).find((link) =>
        link.getAttribute("href")?.endsWith(".jpg"),
      );
      expect(imageLink?.getAttribute("as")).toBe("image");

      // Cleanup
      linkElements.forEach((link) => link.remove());
    });
  });

  describe("Cleanup", () => {
    it("should cleanup performance observer", () => {
      bundleOptimizer.cleanup();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing performance API gracefully", () => {
      const originalPerformance = global.performance;
      delete (global as any).performance;

      const metrics = bundleOptimizer.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.timeToInteractive).toBe("number");

      // Restore performance API
      global.performance = originalPerformance;
    });

    it("should handle missing IntersectionObserver gracefully", () => {
      const originalIntersectionObserver = global.IntersectionObserver;
      delete (global as any).IntersectionObserver;

      // Should not throw error
      expect(() => {
        bundleOptimizer.implementLazyLoading();
      }).not.toThrow();

      // Restore IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver;
    });

    it("should handle empty resource arrays", () => {
      expect(() => {
        bundleOptimizer.preloadCriticalResources([]);
      }).not.toThrow();
    });
  });
});
