import { errorHandlerService } from "./error-handler.service";
import { offlineService } from "./offline.service";
import websocketService from "./websocket.service";

interface PerformanceMetrics {
  id: string;
  timestamp: string;
  type: "api" | "render" | "navigation" | "resource" | "memory" | "network";
  name: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

interface CoreWebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface SystemMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  networkLatency: number;
  activeConnections: number;
  cacheHitRate: number;
}

interface PerformanceAlert {
  id: string;
  type: "warning" | "critical";
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
  message: string;
}

class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();
  private isMonitoring = false;
  private readonly MAX_METRICS_PER_TYPE = 1000;
  private readonly ALERT_THRESHOLDS = {
    api_response_time: { warning: 1000, critical: 3000 }, // ms
    memory_usage: { warning: 80, critical: 95 }, // percentage
    error_rate: { warning: 5, critical: 10 }, // percentage
    network_latency: { warning: 500, critical: 1000 }, // ms
    lcp: { warning: 2500, critical: 4000 }, // ms
    fid: { warning: 100, critical: 300 }, // ms
    cls: { warning: 0.1, critical: 0.25 }, // score
  };

  constructor() {
    this.setupPerformanceObservers();
    this.startSystemMonitoring();
    this.setupNetworkMonitoring();
  }

  private setupPerformanceObservers(): void {
    try {
      // Core Web Vitals Observer
      if ("PerformanceObserver" in window) {
        const vitalsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordWebVital(entry);
          }
        });
        vitalsObserver.observe({
          entryTypes: [
            "paint",
            "largest-contentful-paint",
            "first-input",
            "layout-shift",
          ],
        });
        this.observers.set("vitals", vitalsObserver);

        // Navigation Observer
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordNavigationMetric(entry as PerformanceNavigationTiming);
          }
        });
        navigationObserver.observe({ entryTypes: ["navigation"] });
        this.observers.set("navigation", navigationObserver);

        // Resource Observer
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceMetric(entry as PerformanceResourceTiming);
          }
        });
        resourceObserver.observe({ entryTypes: ["resource"] });
        this.observers.set("resource", resourceObserver);
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "PerformanceMonitoringService.setupPerformanceObservers",
      });
    }
  }

  private recordWebVital(entry: PerformanceEntry): void {
    let metricName = "";
    let value = 0;
    let unit = "ms";

    switch (entry.entryType) {
      case "paint":
        if (entry.name === "first-contentful-paint") {
          metricName = "FCP";
          value = entry.startTime;
        }
        break;
      case "largest-contentful-paint":
        metricName = "LCP";
        value = entry.startTime;
        break;
      case "first-input":
        metricName = "FID";
        value = (entry as any).processingStart - entry.startTime;
        break;
      case "layout-shift":
        metricName = "CLS";
        value = (entry as any).value;
        unit = "score";
        break;
    }

    if (metricName) {
      this.recordMetric({
        type: "render",
        name: metricName,
        value,
        unit,
        metadata: {
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
        },
      });

      this.checkThreshold(metricName.toLowerCase(), value);
    }
  }

  private recordNavigationMetric(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: "DNS_Lookup",
        value: entry.domainLookupEnd - entry.domainLookupStart,
      },
      { name: "TCP_Connection", value: entry.connectEnd - entry.connectStart },
      {
        name: "TLS_Handshake",
        value:
          entry.secureConnectionStart > 0
            ? entry.connectEnd - entry.secureConnectionStart
            : 0,
      },
      { name: "TTFB", value: entry.responseStart - entry.requestStart },
      { name: "Response_Time", value: entry.responseEnd - entry.responseStart },
      { name: "DOM_Processing", value: entry.domComplete - entry.domLoading },
      { name: "Page_Load", value: entry.loadEventEnd - entry.navigationStart },
    ];

    metrics.forEach((metric) => {
      if (metric.value > 0) {
        this.recordMetric({
          type: "navigation",
          name: metric.name,
          value: metric.value,
          unit: "ms",
          metadata: {
            url: entry.name,
            type: entry.type,
          },
        });
      }
    });
  }

  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = (entry as any).transferSize || 0;

    this.recordMetric({
      type: "resource",
      name: "Resource_Load",
      value: duration,
      unit: "ms",
      metadata: {
        url: entry.name,
        type: entry.initiatorType,
        size,
        cached: (entry as any).transferSize === 0,
      },
    });
  }

  private startSystemMonitoring(): void {
    setInterval(() => {
      this.recordSystemMetrics();
    }, 5000); // Every 5 seconds
  }

  private recordSystemMetrics(): void {
    try {
      // Memory usage
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const memoryUsage =
          (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;

        this.recordMetric({
          type: "memory",
          name: "Memory_Usage",
          value: memoryUsage,
          unit: "%",
          metadata: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          },
        });

        this.checkThreshold("memory_usage", memoryUsage);
      }

      // Connection status
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        this.recordMetric({
          type: "network",
          name: "Network_Speed",
          value: connection.downlink || 0,
          unit: "Mbps",
          metadata: {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
          },
        });
      }

      // Error rate
      const errorMetrics = errorHandlerService.getErrorMetrics();
      const recentErrors = errorMetrics.recentErrors.filter(
        (error) => Date.now() - new Date(error.timestamp).getTime() < 60000, // Last minute
      );
      const errorRate = (recentErrors.length / 60) * 100; // Errors per minute as percentage

      this.recordMetric({
        type: "api",
        name: "Error_Rate",
        value: errorRate,
        unit: "%",
        metadata: {
          totalErrors: errorMetrics.totalErrors,
          recentErrors: recentErrors.length,
        },
      });

      this.checkThreshold("error_rate", errorRate);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "PerformanceMonitoringService.recordSystemMetrics",
      });
    }
  }

  private setupNetworkMonitoring(): void {
    // Monitor WebSocket performance
    websocketService.on("connected", () => {
      this.recordMetric({
        type: "network",
        name: "WebSocket_Connection",
        value: 1,
        unit: "status",
        metadata: { status: "connected" },
      });
    });

    websocketService.on("disconnected", () => {
      this.recordMetric({
        type: "network",
        name: "WebSocket_Connection",
        value: 0,
        unit: "status",
        metadata: { status: "disconnected" },
      });
    });

    // Monitor offline service performance
    offlineService.on("network-status-changed", (data) => {
      this.recordMetric({
        type: "network",
        name: "Network_Status",
        value: data.isOnline ? 1 : 0,
        unit: "status",
        metadata: data,
      });
    });
  }

  // Public methods
  recordMetric(metric: Omit<PerformanceMetrics, "id" | "timestamp">): void {
    try {
      const fullMetric: PerformanceMetrics = {
        ...metric,
        id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      if (!this.metrics.has(metric.type)) {
        this.metrics.set(metric.type, []);
      }

      const typeMetrics = this.metrics.get(metric.type)!;
      typeMetrics.push(fullMetric);

      // Limit stored metrics
      if (typeMetrics.length > this.MAX_METRICS_PER_TYPE) {
        typeMetrics.shift();
      }

      this.emit("metric-recorded", fullMetric);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "PerformanceMonitoringService.recordMetric",
        metric,
      });
    }
  }

  recordApiCall(
    url: string,
    method: string,
    duration: number,
    status: number,
  ): void {
    this.recordMetric({
      type: "api",
      name: "API_Response_Time",
      value: duration,
      unit: "ms",
      metadata: {
        url,
        method,
        status,
        success: status >= 200 && status < 300,
      },
    });

    this.checkThreshold("api_response_time", duration);
  }

  private checkThreshold(metricName: string, value: number): void {
    const thresholds =
      this.ALERT_THRESHOLDS[metricName as keyof typeof this.ALERT_THRESHOLDS];
    if (!thresholds) return;

    let alertType: "warning" | "critical" | null = null;
    let threshold = 0;

    if (value >= thresholds.critical) {
      alertType = "critical";
      threshold = thresholds.critical;
    } else if (value >= thresholds.warning) {
      alertType = "warning";
      threshold = thresholds.warning;
    }

    if (alertType) {
      this.createAlert({
        type: alertType,
        metric: metricName,
        threshold,
        currentValue: value,
        message: `${metricName} exceeded ${alertType} threshold: ${value} >= ${threshold}`,
      });
    }
  }

  private createAlert(
    alert: Omit<PerformanceAlert, "id" | "timestamp" | "resolved">,
  ): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.alerts.push(fullAlert);

    // Limit stored alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    this.emit("alert-created", fullAlert);

    // Send critical alerts to error handler
    if (alert.type === "critical") {
      errorHandlerService.handleError(new Error(alert.message), {
        context: "PerformanceMonitoringService.criticalAlert",
        alert: fullAlert,
      });
    }
  }

  // Getters
  getMetrics(type?: string, limit?: number): PerformanceMetrics[] {
    if (type) {
      const typeMetrics = this.metrics.get(type) || [];
      return limit ? typeMetrics.slice(-limit) : typeMetrics;
    }

    const allMetrics: PerformanceMetrics[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    const sortedMetrics = allMetrics.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return limit ? sortedMetrics.slice(0, limit) : sortedMetrics;
  }

  getAlerts(resolved?: boolean): PerformanceAlert[] {
    if (resolved !== undefined) {
      return this.alerts.filter((alert) => alert.resolved === resolved);
    }
    return [...this.alerts];
  }

  getCoreWebVitals(): CoreWebVitals {
    const getLatestMetric = (name: string) => {
      const metrics = this.getMetrics("render").filter((m) => m.name === name);
      return metrics.length > 0 ? metrics[metrics.length - 1].value : 0;
    };

    return {
      fcp: getLatestMetric("FCP"),
      lcp: getLatestMetric("LCP"),
      fid: getLatestMetric("FID"),
      cls: getLatestMetric("CLS"),
      ttfb: getLatestMetric("TTFB"),
    };
  }

  getSystemMetrics(): SystemMetrics {
    const getLatestMetric = (type: string, name: string) => {
      const metrics = this.getMetrics(type).filter((m) => m.name === name);
      return metrics.length > 0 ? metrics[metrics.length - 1] : null;
    };

    const memoryMetric = getLatestMetric("memory", "Memory_Usage");
    const networkMetric = getLatestMetric("network", "Network_Speed");
    const errorMetric = getLatestMetric("api", "Error_Rate");

    return {
      memoryUsage: {
        used: memoryMetric?.metadata?.used || 0,
        total: memoryMetric?.metadata?.total || 0,
        percentage: memoryMetric?.value || 0,
      },
      cpuUsage: 0, // Browser doesn't expose CPU usage
      networkLatency: networkMetric?.metadata?.rtt || 0,
      activeConnections: websocketService.isConnected() ? 1 : 0,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  private calculateCacheHitRate(): number {
    const resourceMetrics = this.getMetrics("resource", 100);
    if (resourceMetrics.length === 0) return 0;

    const cachedRequests = resourceMetrics.filter(
      (m) => m.metadata?.cached,
    ).length;
    return (cachedRequests / resourceMetrics.length) * 100;
  }

  getPerformanceSummary(): {
    totalMetrics: number;
    activeAlerts: number;
    averageResponseTime: number;
    errorRate: number;
    coreWebVitals: CoreWebVitals;
    systemHealth: "good" | "warning" | "critical";
  } {
    const totalMetrics = this.getMetrics().length;
    const activeAlerts = this.getAlerts(false).length;

    const apiMetrics = this.getMetrics("api", 100);
    const responseTimeMetrics = apiMetrics.filter(
      (m) => m.name === "API_Response_Time",
    );
    const averageResponseTime =
      responseTimeMetrics.length > 0
        ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) /
          responseTimeMetrics.length
        : 0;

    const errorRateMetrics = apiMetrics.filter((m) => m.name === "Error_Rate");
    const errorRate =
      errorRateMetrics.length > 0
        ? errorRateMetrics[errorRateMetrics.length - 1].value
        : 0;

    const coreWebVitals = this.getCoreWebVitals();

    // Determine system health
    let systemHealth: "good" | "warning" | "critical" = "good";
    const criticalAlerts = this.getAlerts(false).filter(
      (a) => a.type === "critical",
    );
    const warningAlerts = this.getAlerts(false).filter(
      (a) => a.type === "warning",
    );

    if (criticalAlerts.length > 0) {
      systemHealth = "critical";
    } else if (warningAlerts.length > 0) {
      systemHealth = "warning";
    }

    return {
      totalMetrics,
      activeAlerts,
      averageResponseTime,
      errorRate,
      coreWebVitals,
      systemHealth,
    };
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit("alert-resolved", alert);
      return true;
    }
    return false;
  }

  clearMetrics(type?: string): void {
    if (type) {
      this.metrics.delete(type);
    } else {
      this.metrics.clear();
    }
    this.emit("metrics-cleared", { type });
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in performance monitoring event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.eventListeners.clear();
    this.metrics.clear();
    this.alerts = [];
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
export { PerformanceMetrics, CoreWebVitals, SystemMetrics, PerformanceAlert };
export default performanceMonitoringService;
