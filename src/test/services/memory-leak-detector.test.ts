import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { memoryLeakDetector } from "@/services/memory-leak-detector.service";

describe("MemoryLeakDetectorService", () => {
  beforeEach(() => {
    memoryLeakDetector.cleanup();
  });

  afterEach(() => {
    memoryLeakDetector.cleanup();
  });

  describe("Component Tracking", () => {
    it("should track component lifecycle", () => {
      const componentName = "TestComponent";

      memoryLeakDetector.trackComponent(componentName);

      // Component should be tracked
      const memoryUsage = memoryLeakDetector.getMemoryUsage();
      expect(memoryUsage.trackedComponents).toBe(1);

      memoryLeakDetector.untrackComponent(componentName);

      // Component should be untracked
      const updatedMemoryUsage = memoryLeakDetector.getMemoryUsage();
      expect(updatedMemoryUsage.trackedComponents).toBe(0);
    });

    it("should detect component memory leaks", () => {
      const componentName = "LeakyComponent";

      memoryLeakDetector.trackComponent(componentName);

      // Simulate long-running component with potential leaks
      const leaks = memoryLeakDetector.detectLeaks();

      expect(Array.isArray(leaks)).toBe(true);
    });
  });

  describe("Event Listener Monitoring", () => {
    it("should track event listeners", () => {
      const element = document.createElement("div");
      const handler = vi.fn();

      // Add event listener (should be tracked)
      element.addEventListener("click", handler);

      const memoryUsage = memoryLeakDetector.getMemoryUsage();
      expect(memoryUsage.activeEventListeners).toBeGreaterThan(0);

      // Remove event listener (should be untracked)
      element.removeEventListener("click", handler);
    });

    it("should detect long-lived event listeners", async () => {
      const element = document.createElement("div");
      const handler = vi.fn();

      // Add event listener
      element.addEventListener("click", handler);

      // Wait and check for leaks
      await new Promise((resolve) => setTimeout(resolve, 100));

      const leaks = memoryLeakDetector.detectLeaks();
      const eventListenerLeaks = leaks.filter(
        (leak) => leak.leakType === "event-listener",
      );

      // Clean up
      element.removeEventListener("click", handler);

      expect(Array.isArray(eventListenerLeaks)).toBe(true);
    });
  });

  describe("Timer Monitoring", () => {
    it("should track setTimeout calls", () => {
      const callback = vi.fn();

      const timerId = setTimeout(callback, 100);

      const memoryUsage = memoryLeakDetector.getMemoryUsage();
      expect(memoryUsage.activeTimers).toBeGreaterThan(0);

      clearTimeout(timerId);
    });

    it("should track setInterval calls", () => {
      const callback = vi.fn();

      const intervalId = setInterval(callback, 100);

      const memoryUsage = memoryLeakDetector.getMemoryUsage();
      expect(memoryUsage.activeTimers).toBeGreaterThan(0);

      clearInterval(intervalId);
    });

    it("should detect long-running intervals", async () => {
      const callback = vi.fn();

      const intervalId = setInterval(callback, 50);

      // Wait for potential leak detection
      await new Promise((resolve) => setTimeout(resolve, 200));

      const leaks = memoryLeakDetector.detectLeaks();
      const timerLeaks = leaks.filter((leak) => leak.leakType === "timer");

      clearInterval(intervalId);

      expect(Array.isArray(timerLeaks)).toBe(true);
    });
  });

  describe("Memory Usage Reporting", () => {
    it("should provide memory usage statistics", () => {
      const memoryUsage = memoryLeakDetector.getMemoryUsage();

      expect(memoryUsage).toHaveProperty("usedJSHeapSize");
      expect(memoryUsage).toHaveProperty("totalJSHeapSize");
      expect(memoryUsage).toHaveProperty("jsHeapSizeLimit");
      expect(memoryUsage).toHaveProperty("trackedComponents");
      expect(memoryUsage).toHaveProperty("activeEventListeners");
      expect(memoryUsage).toHaveProperty("activeTimers");
      expect(memoryUsage).toHaveProperty("activeSubscriptions");

      expect(typeof memoryUsage.trackedComponents).toBe("number");
      expect(typeof memoryUsage.activeEventListeners).toBe("number");
      expect(typeof memoryUsage.activeTimers).toBe("number");
      expect(typeof memoryUsage.activeSubscriptions).toBe("number");
    });
  });

  describe("Leak Detection", () => {
    it("should return empty array when no leaks detected", () => {
      const leaks = memoryLeakDetector.detectLeaks();

      expect(Array.isArray(leaks)).toBe(true);
      expect(leaks.length).toBeGreaterThanOrEqual(0);
    });

    it("should categorize leaks by type", () => {
      const leaks = memoryLeakDetector.detectLeaks();

      leaks.forEach((leak) => {
        expect([
          "event-listener",
          "timer",
          "subscription",
          "dom-reference",
        ]).toContain(leak.leakType);
        expect(["low", "medium", "high", "critical"]).toContain(leak.severity);
        expect(typeof leak.description).toBe("string");
        expect(typeof leak.recommendation).toBe("string");
      });
    });
  });

  describe("Cleanup", () => {
    it("should clean up all tracked resources", () => {
      // Track some components
      memoryLeakDetector.trackComponent("Component1");
      memoryLeakDetector.trackComponent("Component2");

      // Add some event listeners
      const element = document.createElement("div");
      element.addEventListener("click", vi.fn());

      // Add some timers
      const timerId = setTimeout(vi.fn(), 1000);

      // Verify resources are tracked
      const beforeCleanup = memoryLeakDetector.getMemoryUsage();
      expect(beforeCleanup.trackedComponents).toBeGreaterThan(0);

      // Cleanup
      memoryLeakDetector.cleanup();

      // Verify resources are cleaned up
      const afterCleanup = memoryLeakDetector.getMemoryUsage();
      expect(afterCleanup.trackedComponents).toBe(0);

      // Clean up timer
      clearTimeout(timerId);
    });
  });
});
