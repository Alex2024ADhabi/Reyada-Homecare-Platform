/**
 * Memory Leak Detection and Prevention Service
 * Monitors and prevents common memory leaks in React applications
 */

interface MemoryLeakDetector {
  trackComponent(componentName: string): void;
  untrackComponent(componentName: string): void;
  detectLeaks(): MemoryLeakReport[];
  cleanup(): void;
}

interface MemoryLeakReport {
  componentName: string;
  leakType: "event-listener" | "timer" | "subscription" | "dom-reference";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

class MemoryLeakDetectorService implements MemoryLeakDetector {
  private static instance: MemoryLeakDetectorService;
  private trackedComponents = new Map<string, ComponentTracker>();
  private globalEventListeners = new Set<EventListenerTracker>();
  private activeTimers = new Set<TimerTracker>();
  private activeSubscriptions = new Set<SubscriptionTracker>();

  private constructor() {
    this.setupGlobalMonitoring();
  }

  public static getInstance(): MemoryLeakDetectorService {
    if (!MemoryLeakDetectorService.instance) {
      MemoryLeakDetectorService.instance = new MemoryLeakDetectorService();
    }
    return MemoryLeakDetectorService.instance;
  }

  private setupGlobalMonitoring(): void {
    // Monitor global event listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener =
      EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      const tracker: EventListenerTracker = {
        target: this,
        type,
        listener,
        options,
        timestamp: Date.now(),
        stackTrace: new Error().stack || "",
      };

      MemoryLeakDetectorService.getInstance().globalEventListeners.add(tracker);
      return originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      const detector = MemoryLeakDetectorService.getInstance();
      const tracker = Array.from(detector.globalEventListeners).find(
        (t) => t.target === this && t.type === type && t.listener === listener,
      );

      if (tracker) {
        detector.globalEventListeners.delete(tracker);
      }

      return originalRemoveEventListener.call(this, type, listener, options);
    };

    // Monitor timers
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;

    window.setTimeout = function (callback, delay, ...args) {
      const id = originalSetTimeout.call(window, callback, delay, ...args);

      MemoryLeakDetectorService.getInstance().activeTimers.add({
        id,
        type: "timeout",
        callback,
        delay,
        timestamp: Date.now(),
        stackTrace: new Error().stack || "",
      });

      return id;
    };

    window.setInterval = function (callback, delay, ...args) {
      const id = originalSetInterval.call(window, callback, delay, ...args);

      MemoryLeakDetectorService.getInstance().activeTimers.add({
        id,
        type: "interval",
        callback,
        delay,
        timestamp: Date.now(),
        stackTrace: new Error().stack || "",
      });

      return id;
    };

    window.clearTimeout = function (id) {
      const detector = MemoryLeakDetectorService.getInstance();
      const timer = Array.from(detector.activeTimers).find((t) => t.id === id);

      if (timer) {
        detector.activeTimers.delete(timer);
      }

      return originalClearTimeout.call(window, id);
    };

    window.clearInterval = function (id) {
      const detector = MemoryLeakDetectorService.getInstance();
      const timer = Array.from(detector.activeTimers).find((t) => t.id === id);

      if (timer) {
        detector.activeTimers.delete(timer);
      }

      return originalClearInterval.call(window, id);
    };
  }

  public trackComponent(componentName: string): void {
    if (!this.trackedComponents.has(componentName)) {
      this.trackedComponents.set(componentName, {
        name: componentName,
        mountTime: Date.now(),
        eventListeners: new Set(),
        timers: new Set(),
        subscriptions: new Set(),
        domReferences: new Set(),
      });
    }
  }

  public untrackComponent(componentName: string): void {
    const component = this.trackedComponents.get(componentName);
    if (component) {
      // Check for potential leaks before cleanup
      this.checkComponentLeaks(component);
      this.trackedComponents.delete(componentName);
    }
  }

  private checkComponentLeaks(component: ComponentTracker): void {
    const now = Date.now();
    const componentLifetime = now - component.mountTime;

    // Check for long-lived event listeners
    if (component.eventListeners.size > 0 && componentLifetime > 300000) {
      // 5 minutes
      console.warn(
        `Potential memory leak: Component ${component.name} has ${component.eventListeners.size} active event listeners after ${componentLifetime}ms`,
      );
    }

    // Check for active timers
    if (component.timers.size > 0) {
      console.warn(
        `Potential memory leak: Component ${component.name} has ${component.timers.size} active timers`,
      );
    }

    // Check for active subscriptions
    if (component.subscriptions.size > 0) {
      console.warn(
        `Potential memory leak: Component ${component.name} has ${component.subscriptions.size} active subscriptions`,
      );
    }
  }

  public detectLeaks(): MemoryLeakReport[] {
    const reports: MemoryLeakReport[] = [];
    const now = Date.now();

    // Check global event listeners
    this.globalEventListeners.forEach((listener) => {
      const age = now - listener.timestamp;
      if (age > 600000) {
        // 10 minutes
        reports.push({
          componentName: "Global",
          leakType: "event-listener",
          severity: age > 1800000 ? "critical" : "high", // 30 minutes
          description: `Long-lived event listener: ${listener.type}`,
          recommendation:
            "Ensure event listeners are properly removed in cleanup functions",
        });
      }
    });

    // Check active timers
    this.activeTimers.forEach((timer) => {
      const age = now - timer.timestamp;
      if (timer.type === "interval" && age > 300000) {
        // 5 minutes for intervals
        reports.push({
          componentName: "Global",
          leakType: "timer",
          severity: age > 900000 ? "critical" : "high", // 15 minutes
          description: `Long-running interval timer (${age}ms)`,
          recommendation:
            "Clear intervals in component cleanup or useEffect cleanup",
        });
      }
    });

    // Check component-specific leaks
    this.trackedComponents.forEach((component) => {
      const componentAge = now - component.mountTime;

      if (componentAge > 1800000) {
        // 30 minutes
        if (component.eventListeners.size > 5) {
          reports.push({
            componentName: component.name,
            leakType: "event-listener",
            severity: "medium",
            description: `Component has ${component.eventListeners.size} event listeners`,
            recommendation:
              "Review event listener cleanup in useEffect dependencies",
          });
        }

        if (component.timers.size > 0) {
          reports.push({
            componentName: component.name,
            leakType: "timer",
            severity: "high",
            description: `Component has ${component.timers.size} active timers`,
            recommendation: "Clear timers in useEffect cleanup function",
          });
        }

        if (component.subscriptions.size > 0) {
          reports.push({
            componentName: component.name,
            leakType: "subscription",
            severity: "high",
            description: `Component has ${component.subscriptions.size} active subscriptions`,
            recommendation:
              "Unsubscribe from all subscriptions in useEffect cleanup",
          });
        }
      }
    });

    return reports;
  }

  public cleanup(): void {
    this.trackedComponents.clear();
    this.globalEventListeners.clear();
    this.activeTimers.clear();
    this.activeSubscriptions.clear();
  }

  public getMemoryUsage(): MemoryUsageReport {
    const performance = (window as any).performance;
    const memory = performance?.memory;

    return {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
      trackedComponents: this.trackedComponents.size,
      activeEventListeners: this.globalEventListeners.size,
      activeTimers: this.activeTimers.size,
      activeSubscriptions: this.activeSubscriptions.size,
    };
  }
}

// Interfaces
interface ComponentTracker {
  name: string;
  mountTime: number;
  eventListeners: Set<EventListenerTracker>;
  timers: Set<TimerTracker>;
  subscriptions: Set<SubscriptionTracker>;
  domReferences: Set<Element>;
}

interface EventListenerTracker {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
  timestamp: number;
  stackTrace: string;
}

interface TimerTracker {
  id: number;
  type: "timeout" | "interval";
  callback: Function;
  delay: number;
  timestamp: number;
  stackTrace: string;
}

interface SubscriptionTracker {
  id: string;
  type: string;
  unsubscribe: () => void;
  timestamp: number;
  stackTrace: string;
}

interface MemoryUsageReport {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  trackedComponents: number;
  activeEventListeners: number;
  activeTimers: number;
  activeSubscriptions: number;
}

// React Hook for Memory Leak Detection
import React from "react";

export const useMemoryLeakDetection = (componentName: string) => {
  const detector = MemoryLeakDetectorService.getInstance();

  React.useEffect(() => {
    detector.trackComponent(componentName);

    return () => {
      detector.untrackComponent(componentName);
    };
  }, [componentName, detector]);

  const checkLeaks = React.useCallback(() => {
    return detector.detectLeaks();
  }, [detector]);

  const getMemoryUsage = React.useCallback(() => {
    return detector.getMemoryUsage();
  }, [detector]);

  return { checkLeaks, getMemoryUsage };
};

export const memoryLeakDetector = MemoryLeakDetectorService.getInstance();
export default MemoryLeakDetectorService;
