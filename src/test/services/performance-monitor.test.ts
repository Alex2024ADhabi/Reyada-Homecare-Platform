import { describe, it, expect, vi, beforeEach } from "vitest";
import { performanceMonitor } from "@/services/performance-monitor.service";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => 1000),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
};

Object.defineProperty(window, "performance", {
  value: mockPerformance,
});

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("recordMetric", () => {
    it("should record a performance metric", () => {
      const metric = {
        name: "test-metric",
        value: 100,
        timestamp: Date.now(),
        category: "load" as const,
      };

      performanceMonitor.recordMetric(metric);

      // Verify the metric was stored
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("should handle different metric categories", () => {
      const categories = ["load", "render", "api", "user"] as const;

      categories.forEach((category) => {
        const metric = {
          name: `test-${category}`,
          value: 100,
          timestamp: Date.now(),
          category,
        };

        expect(() => performanceMonitor.recordMetric(metric)).not.toThrow();
      });
    });

    it("should include additional metadata when provided", () => {
      const metric = {
        name: "test-metric",
        value: 100,
        timestamp: Date.now(),
        category: "load" as const,
        metadata: {
          userId: "user123",
          route: "/dashboard",
        },
      };

      performanceMonitor.recordMetric(metric);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("startTimer", () => {
    it("should start a performance timer", () => {
      const timerName = "test-timer";

      performanceMonitor.startTimer(timerName);

      expect(mockPerformance.mark).toHaveBeenCalledWith(`${timerName}-start`);
    });
  });

  describe("endTimer", () => {
    it("should end a performance timer and record metric", () => {
      const timerName = "test-timer";

      // Mock performance.measure to return a duration
      mockPerformance.getEntriesByName.mockReturnValue([{ duration: 150 }]);

      performanceMonitor.startTimer(timerName);
      const duration = performanceMonitor.endTimer(timerName);

      expect(mockPerformance.mark).toHaveBeenCalledWith(`${timerName}-end`);
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        timerName,
        `${timerName}-start`,
        `${timerName}-end`,
      );
      expect(duration).toBe(150);
    });

    it("should return 0 if timer was not started", () => {
      const duration = performanceMonitor.endTimer("non-existent-timer");
      expect(duration).toBe(0);
    });
  });

  describe("getMetrics", () => {
    it("should return stored metrics", () => {
      const mockMetrics = [
        {
          name: "test-metric",
          value: 100,
          timestamp: Date.now(),
          category: "load",
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toEqual(mockMetrics);
    });

    it("should return empty array if no metrics stored", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toEqual([]);
    });

    it("should filter metrics by category", () => {
      const mockMetrics = [
        {
          name: "load-metric",
          category: "load",
          value: 100,
          timestamp: Date.now(),
        },
        {
          name: "api-metric",
          category: "api",
          value: 200,
          timestamp: Date.now(),
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const loadMetrics = performanceMonitor.getMetrics("load");
      expect(loadMetrics).toHaveLength(1);
      expect(loadMetrics[0].category).toBe("load");
    });
  });

  describe("getAverageMetric", () => {
    it("should calculate average for a metric", () => {
      const mockMetrics = [
        {
          name: "test-metric",
          value: 100,
          timestamp: Date.now(),
          category: "load",
        },
        {
          name: "test-metric",
          value: 200,
          timestamp: Date.now(),
          category: "load",
        },
        {
          name: "test-metric",
          value: 300,
          timestamp: Date.now(),
          category: "load",
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const average = performanceMonitor.getAverageMetric("test-metric");
      expect(average).toBe(200);
    });

    it("should return 0 if no metrics found", () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      const average = performanceMonitor.getAverageMetric("non-existent");
      expect(average).toBe(0);
    });
  });

  describe("clearMetrics", () => {
    it("should clear all stored metrics", () => {
      performanceMonitor.clearMetrics();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "performance_metrics",
      );
    });
  });

  describe("generateReport", () => {
    it("should generate a performance report", () => {
      const mockMetrics = [
        {
          name: "load-time",
          value: 1000,
          timestamp: Date.now(),
          category: "load",
        },
        {
          name: "api-call",
          value: 500,
          timestamp: Date.now(),
          category: "api",
        },
        {
          name: "render-time",
          value: 100,
          timestamp: Date.now(),
          category: "render",
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const report = performanceMonitor.generateReport();

      expect(report).toHaveProperty("totalMetrics");
      expect(report).toHaveProperty("categories");
      expect(report).toHaveProperty("averages");
      expect(report).toHaveProperty("generatedAt");
      expect(report.totalMetrics).toBe(3);
    });
  });

  describe("monitorPageLoad", () => {
    it("should monitor page load performance", () => {
      // Mock navigation timing
      const mockTiming = {
        navigationStart: 1000,
        loadEventEnd: 2000,
        domContentLoadedEventEnd: 1500,
        responseEnd: 1200,
      };

      Object.defineProperty(window.performance, "timing", {
        value: mockTiming,
      });

      performanceMonitor.monitorPageLoad();

      // Should record multiple metrics
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("monitorApiCall", () => {
    it("should monitor API call performance", async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: "test" });

      const result = await performanceMonitor.monitorApiCall(
        "test-api",
        mockApiCall,
      );

      expect(mockApiCall).toHaveBeenCalled();
      expect(result).toEqual({ data: "test" });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("should handle API call errors", async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error("API Error"));

      await expect(
        performanceMonitor.monitorApiCall("test-api", mockApiCall),
      ).rejects.toThrow("API Error");

      // Should still record the metric even on error
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("monitorComponentRender", () => {
    it("should monitor component render performance", () => {
      const componentName = "TestComponent";
      const renderFn = vi.fn();

      performanceMonitor.monitorComponentRender(componentName, renderFn);

      expect(renderFn).toHaveBeenCalled();
      expect(mockPerformance.mark).toHaveBeenCalledWith(
        `${componentName}-render-start`,
      );
      expect(mockPerformance.mark).toHaveBeenCalledWith(
        `${componentName}-render-end`,
      );
    });
  });

  describe("getPerformanceInsights", () => {
    it("should provide performance insights", () => {
      const mockMetrics = [
        {
          name: "page-load",
          value: 3000,
          timestamp: Date.now(),
          category: "load",
        },
        {
          name: "api-call",
          value: 2000,
          timestamp: Date.now(),
          category: "api",
        },
        {
          name: "render-time",
          value: 500,
          timestamp: Date.now(),
          category: "render",
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const insights = performanceMonitor.getPerformanceInsights();

      expect(insights).toHaveProperty("slowestOperations");
      expect(insights).toHaveProperty("recommendations");
      expect(insights).toHaveProperty("summary");
      expect(Array.isArray(insights.recommendations)).toBe(true);
    });
  });
});
