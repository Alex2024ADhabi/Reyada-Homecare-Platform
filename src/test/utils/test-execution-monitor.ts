#!/usr/bin/env tsx
/**
 * Test Execution Monitor
 * Real-time monitoring and tracking of test execution across the healthcare platform
 * Provides comprehensive metrics, performance tracking, and execution insights
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

interface TestEvent {
  type: "start" | "pass" | "fail" | "skip" | "timeout" | "error";
  testName: string;
  suiteName: string;
  timestamp?: number;
  duration?: number;
  error?: any;
  metadata?: Record<string, any>;
}

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  timeoutTests: number;
  totalDuration: number;
  averageDuration: number;
  slowestTest: { name: string; duration: number } | null;
  fastestTest: { name: string; duration: number } | null;
  errorRate: number;
  successRate: number;
  testsPerSecond: number;
}

interface SuiteMetrics {
  name: string;
  tests: TestMetrics;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "running" | "completed" | "failed";
}

interface ExecutionReport {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  overallMetrics: TestMetrics;
  suiteMetrics: SuiteMetrics[];
  healthcareMetrics?: {
    complianceTests: number;
    securityTests: number;
    performanceTests: number;
    accessibilityTests: number;
  };
  recommendations: string[];
  alerts: string[];
}

interface MonitorConfig {
  reportInterval: number;
  enableRealTimeReporting: boolean;
  enableHealthcareMetrics: boolean;
  slowTestThreshold: number;
  errorRateThreshold: number;
  outputFile?: string;
}

class TestExecutionMonitor extends EventEmitter {
  private static instance: TestExecutionMonitor;
  private isMonitoring: boolean = false;
  private sessionId: string = "";
  private startTime: number = 0;
  private config: MonitorConfig;
  private testEvents: TestEvent[] = [];
  private suiteMetrics: Map<string, SuiteMetrics> = new Map();
  private reportingInterval?: NodeJS.Timeout;
  private logFile: string;

  private constructor() {
    super();
    this.config = this.loadDefaultConfig();
    this.logFile = path.join(
      process.cwd(),
      "test-results",
      "execution-monitor.log",
    );
    this.ensureLogDirectory();
  }

  static getInstance(): TestExecutionMonitor {
    if (!TestExecutionMonitor.instance) {
      TestExecutionMonitor.instance = new TestExecutionMonitor();
    }
    return TestExecutionMonitor.instance;
  }

  startMonitoring(config?: Partial<MonitorConfig>): string {
    if (this.isMonitoring) {
      console.warn("⚠️  Test execution monitoring is already active");
      return this.sessionId;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.isMonitoring = true;
    this.testEvents = [];
    this.suiteMetrics.clear();

    console.log("🔍 Test Execution Monitor started");
    console.log(`   Session ID: ${this.sessionId}`);
    console.log(`   Report interval: ${this.config.reportInterval}ms`);
    console.log(
      `   Real-time reporting: ${this.config.enableRealTimeReporting}`,
    );
    console.log(
      `   Healthcare metrics: ${this.config.enableHealthcareMetrics}`,
    );

    // Start real-time reporting if enabled
    if (this.config.enableRealTimeReporting) {
      this.startRealTimeReporting();
    }

    this.emit("monitoring-started", {
      sessionId: this.sessionId,
      timestamp: Date.now(),
    });
    this.logEvent("info", "Test execution monitoring started", {
      sessionId: this.sessionId,
    });

    return this.sessionId;
  }

  stopMonitoring(): ExecutionReport {
    if (!this.isMonitoring) {
      console.warn("⚠️  Test execution monitoring is not active");
      return this.generateEmptyReport();
    }

    this.isMonitoring = false;
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;

    // Stop real-time reporting
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = undefined;
    }

    // Generate final report
    const report = this.generateExecutionReport(endTime, totalDuration);

    console.log("🎯 Test Execution Monitor stopped");
    console.log(`   Session duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Total tests: ${report.overallMetrics.totalTests}`);
    console.log(
      `   Success rate: ${report.overallMetrics.successRate.toFixed(1)}%`,
    );
    console.log(
      `   Error rate: ${report.overallMetrics.errorRate.toFixed(1)}%`,
    );

    this.emit("monitoring-stopped", { report, timestamp: Date.now() });
    this.logEvent("info", "Test execution monitoring stopped", {
      sessionId: this.sessionId,
      duration: totalDuration,
      totalTests: report.overallMetrics.totalTests,
    });

    // Save report to file if configured
    if (this.config.outputFile) {
      this.saveReportToFile(report);
    }

    return report;
  }

  recordTestEvent(event: Omit<TestEvent, "timestamp">): void {
    if (!this.isMonitoring) {
      return;
    }

    const fullEvent: TestEvent = {
      ...event,
      timestamp: performance.now(),
    };

    this.testEvents.push(fullEvent);
    this.updateSuiteMetrics(fullEvent);
    this.emit("test-event", fullEvent);

    // Log significant events
    if (
      event.type === "fail" ||
      event.type === "error" ||
      event.type === "timeout"
    ) {
      this.logEvent("warn", `Test ${event.type}: ${event.testName}`, {
        suite: event.suiteName,
        error: event.error,
        duration: event.duration,
      });
    }

    // Check for alerts
    this.checkForAlerts(fullEvent);
  }

  getCurrentMetrics(): TestMetrics {
    return this.calculateOverallMetrics();
  }

  getSuiteMetrics(suiteName?: string): SuiteMetrics | SuiteMetrics[] {
    if (suiteName) {
      return (
        this.suiteMetrics.get(suiteName) ||
        this.createEmptySuiteMetrics(suiteName)
      );
    }
    return Array.from(this.suiteMetrics.values());
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isActive(): boolean {
    return this.isMonitoring;
  }

  private startRealTimeReporting(): void {
    this.reportingInterval = setInterval(() => {
      if (this.isMonitoring) {
        const metrics = this.getCurrentMetrics();
        this.emit("real-time-report", {
          sessionId: this.sessionId,
          timestamp: Date.now(),
          metrics,
          suites: Array.from(this.suiteMetrics.values()),
        });

        // Console output for real-time monitoring
        if (metrics.totalTests > 0) {
          console.log(
            `📊 [${new Date().toLocaleTimeString()}] Tests: ${metrics.totalTests} | Passed: ${metrics.passedTests} | Failed: ${metrics.failedTests} | Rate: ${metrics.testsPerSecond.toFixed(1)}/s`,
          );
        }
      }
    }, this.config.reportInterval);
  }

  private updateSuiteMetrics(event: TestEvent): void {
    let suite = this.suiteMetrics.get(event.suiteName);

    if (!suite) {
      suite = this.createEmptySuiteMetrics(event.suiteName);
      this.suiteMetrics.set(event.suiteName, suite);
    }

    // Update suite metrics based on event type
    switch (event.type) {
      case "start":
        if (suite.tests.totalTests === 0) {
          suite.startTime = event.timestamp!;
          suite.status = "running";
        }
        break;
      case "pass":
        suite.tests.passedTests++;
        suite.tests.totalTests++;
        if (event.duration) {
          this.updateDurationMetrics(
            suite.tests,
            event.testName,
            event.duration,
          );
        }
        break;
      case "fail":
        suite.tests.failedTests++;
        suite.tests.totalTests++;
        if (event.duration) {
          this.updateDurationMetrics(
            suite.tests,
            event.testName,
            event.duration,
          );
        }
        break;
      case "skip":
        suite.tests.skippedTests++;
        suite.tests.totalTests++;
        break;
      case "timeout":
        suite.tests.timeoutTests++;
        suite.tests.failedTests++;
        suite.tests.totalTests++;
        break;
      case "error":
        suite.tests.failedTests++;
        suite.tests.totalTests++;
        break;
    }

    // Recalculate suite metrics
    this.recalculateSuiteMetrics(suite);
  }

  private updateDurationMetrics(
    metrics: TestMetrics,
    testName: string,
    duration: number,
  ): void {
    metrics.totalDuration += duration;
    metrics.averageDuration =
      metrics.totalDuration / (metrics.passedTests + metrics.failedTests);

    // Update slowest test
    if (!metrics.slowestTest || duration > metrics.slowestTest.duration) {
      metrics.slowestTest = { name: testName, duration };
    }

    // Update fastest test
    if (!metrics.fastestTest || duration < metrics.fastestTest.duration) {
      metrics.fastestTest = { name: testName, duration };
    }
  }

  private recalculateSuiteMetrics(suite: SuiteMetrics): void {
    const tests = suite.tests;

    if (tests.totalTests > 0) {
      tests.errorRate = (tests.failedTests / tests.totalTests) * 100;
      tests.successRate = (tests.passedTests / tests.totalTests) * 100;

      const currentTime = performance.now();
      const elapsedSeconds = (currentTime - suite.startTime) / 1000;
      tests.testsPerSecond =
        elapsedSeconds > 0 ? tests.totalTests / elapsedSeconds : 0;
    }
  }

  private calculateOverallMetrics(): TestMetrics {
    const metrics: TestMetrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      timeoutTests: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowestTest: null,
      fastestTest: null,
      errorRate: 0,
      successRate: 0,
      testsPerSecond: 0,
    };

    // Aggregate metrics from all suites
    for (const suite of this.suiteMetrics.values()) {
      const suiteTests = suite.tests;
      metrics.totalTests += suiteTests.totalTests;
      metrics.passedTests += suiteTests.passedTests;
      metrics.failedTests += suiteTests.failedTests;
      metrics.skippedTests += suiteTests.skippedTests;
      metrics.timeoutTests += suiteTests.timeoutTests;
      metrics.totalDuration += suiteTests.totalDuration;

      // Update slowest test
      if (
        suiteTests.slowestTest &&
        (!metrics.slowestTest ||
          suiteTests.slowestTest.duration > metrics.slowestTest.duration)
      ) {
        metrics.slowestTest = suiteTests.slowestTest;
      }

      // Update fastest test
      if (
        suiteTests.fastestTest &&
        (!metrics.fastestTest ||
          suiteTests.fastestTest.duration < metrics.fastestTest.duration)
      ) {
        metrics.fastestTest = suiteTests.fastestTest;
      }
    }

    // Calculate derived metrics
    if (metrics.totalTests > 0) {
      metrics.errorRate = (metrics.failedTests / metrics.totalTests) * 100;
      metrics.successRate = (metrics.passedTests / metrics.totalTests) * 100;
      metrics.averageDuration =
        metrics.totalDuration / (metrics.passedTests + metrics.failedTests);

      const elapsedSeconds = (performance.now() - this.startTime) / 1000;
      metrics.testsPerSecond =
        elapsedSeconds > 0 ? metrics.totalTests / elapsedSeconds : 0;
    }

    return metrics;
  }

  private checkForAlerts(event: TestEvent): void {
    const metrics = this.getCurrentMetrics();

    // Check error rate threshold
    if (
      metrics.totalTests >= 10 &&
      metrics.errorRate > this.config.errorRateThreshold
    ) {
      this.emit("alert", {
        type: "high-error-rate",
        message: `Error rate (${metrics.errorRate.toFixed(1)}%) exceeds threshold (${this.config.errorRateThreshold}%)`,
        severity: "warning",
        timestamp: Date.now(),
      });
    }

    // Check for slow tests
    if (event.duration && event.duration > this.config.slowTestThreshold) {
      this.emit("alert", {
        type: "slow-test",
        message: `Test '${event.testName}' took ${event.duration.toFixed(0)}ms (threshold: ${this.config.slowTestThreshold}ms)`,
        severity: "info",
        timestamp: Date.now(),
      });
    }

    // Check for consecutive failures
    const recentEvents = this.testEvents.slice(-5);
    const recentFailures = recentEvents.filter(
      (e) => e.type === "fail" || e.type === "error",
    ).length;
    if (recentFailures >= 3) {
      this.emit("alert", {
        type: "consecutive-failures",
        message: `${recentFailures} consecutive test failures detected`,
        severity: "error",
        timestamp: Date.now(),
      });
    }
  }

  private generateExecutionReport(
    endTime: number,
    totalDuration: number,
  ): ExecutionReport {
    const overallMetrics = this.calculateOverallMetrics();
    const suiteMetrics = Array.from(this.suiteMetrics.values());

    // Mark all suites as completed
    suiteMetrics.forEach((suite) => {
      if (suite.status === "running") {
        suite.status = suite.tests.failedTests > 0 ? "failed" : "completed";
        suite.endTime = endTime;
        suite.duration = endTime - suite.startTime;
      }
    });

    const report: ExecutionReport = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime,
      totalDuration,
      overallMetrics,
      suiteMetrics,
      recommendations: this.generateRecommendations(
        overallMetrics,
        suiteMetrics,
      ),
      alerts: this.generateAlerts(overallMetrics),
    };

    // Add healthcare-specific metrics if enabled
    if (this.config.enableHealthcareMetrics) {
      report.healthcareMetrics = this.calculateHealthcareMetrics(suiteMetrics);
    }

    return report;
  }

  private calculateHealthcareMetrics(suiteMetrics: SuiteMetrics[]) {
    return {
      complianceTests: suiteMetrics
        .filter((s) => s.name.toLowerCase().includes("compliance"))
        .reduce((sum, s) => sum + s.tests.totalTests, 0),
      securityTests: suiteMetrics
        .filter((s) => s.name.toLowerCase().includes("security"))
        .reduce((sum, s) => sum + s.tests.totalTests, 0),
      performanceTests: suiteMetrics
        .filter((s) => s.name.toLowerCase().includes("performance"))
        .reduce((sum, s) => sum + s.tests.totalTests, 0),
      accessibilityTests: suiteMetrics
        .filter((s) => s.name.toLowerCase().includes("accessibility"))
        .reduce((sum, s) => sum + s.tests.totalTests, 0),
    };
  }

  private generateRecommendations(
    metrics: TestMetrics,
    suites: SuiteMetrics[],
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.errorRate > 10) {
      recommendations.push(
        "High error rate detected - review failing tests and fix underlying issues",
      );
    }

    if (
      metrics.slowestTest &&
      metrics.slowestTest.duration > this.config.slowTestThreshold * 2
    ) {
      recommendations.push(
        `Optimize slow test: ${metrics.slowestTest.name} (${metrics.slowestTest.duration.toFixed(0)}ms)`,
      );
    }

    if (metrics.testsPerSecond < 1) {
      recommendations.push(
        "Low test execution rate - consider optimizing test setup and teardown",
      );
    }

    const failedSuites = suites.filter((s) => s.status === "failed");
    if (failedSuites.length > 0) {
      recommendations.push(
        `Review failed test suites: ${failedSuites.map((s) => s.name).join(", ")}`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "All tests executed successfully - consider adding more comprehensive test coverage",
      );
    }

    return recommendations;
  }

  private generateAlerts(metrics: TestMetrics): string[] {
    const alerts: string[] = [];

    if (metrics.errorRate > this.config.errorRateThreshold) {
      alerts.push(
        `Error rate (${metrics.errorRate.toFixed(1)}%) exceeds threshold`,
      );
    }

    if (metrics.timeoutTests > 0) {
      alerts.push(`${metrics.timeoutTests} test(s) timed out`);
    }

    return alerts;
  }

  private createEmptySuiteMetrics(name: string): SuiteMetrics {
    return {
      name,
      tests: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        timeoutTests: 0,
        totalDuration: 0,
        averageDuration: 0,
        slowestTest: null,
        fastestTest: null,
        errorRate: 0,
        successRate: 0,
        testsPerSecond: 0,
      },
      startTime: performance.now(),
      status: "running",
    };
  }

  private generateEmptyReport(): ExecutionReport {
    return {
      sessionId: "no-session",
      startTime: 0,
      overallMetrics: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        timeoutTests: 0,
        totalDuration: 0,
        averageDuration: 0,
        slowestTest: null,
        fastestTest: null,
        errorRate: 0,
        successRate: 0,
        testsPerSecond: 0,
      },
      suiteMetrics: [],
      recommendations: [],
      alerts: [],
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private loadDefaultConfig(): MonitorConfig {
    return {
      reportInterval: 5000, // 5 seconds
      enableRealTimeReporting: true,
      enableHealthcareMetrics: true,
      slowTestThreshold: 5000, // 5 seconds
      errorRateThreshold: 15, // 15%
    };
  }

  private logEvent(level: string, message: string, metadata?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      sessionId: this.sessionId,
      ...metadata,
    };

    const logLine = JSON.stringify(logEntry) + "\n";
    fs.appendFileSync(this.logFile, logLine);
  }

  private saveReportToFile(report: ExecutionReport): void {
    try {
      const reportPath =
        this.config.outputFile ||
        path.join(
          process.cwd(),
          "test-results",
          `execution-report-${this.sessionId}.json`,
        );
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Execution report saved: ${reportPath}`);
    } catch (error) {
      console.error(`Failed to save execution report: ${error}`);
    }
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
}

// Export singleton instance
export const testExecutionMonitor = TestExecutionMonitor.getInstance();
export default testExecutionMonitor;

// Export types
export {
  TestExecutionMonitor,
  type TestEvent,
  type TestMetrics,
  type SuiteMetrics,
  type ExecutionReport,
  type MonitorConfig,
};

// CLI execution for testing
if (require.main === module) {
  console.log("🔍 Test Execution Monitor - Test Mode");

  const monitor = testExecutionMonitor;
  const sessionId = monitor.startMonitoring({
    reportInterval: 2000,
    enableRealTimeReporting: true,
  });

  // Simulate some test events
  setTimeout(() => {
    monitor.recordTestEvent({
      type: "start",
      testName: "test1",
      suiteName: "unit",
    });
    monitor.recordTestEvent({
      type: "pass",
      testName: "test1",
      suiteName: "unit",
      duration: 150,
    });
    monitor.recordTestEvent({
      type: "start",
      testName: "test2",
      suiteName: "unit",
    });
    monitor.recordTestEvent({
      type: "fail",
      testName: "test2",
      suiteName: "unit",
      duration: 300,
      error: new Error("Test failed"),
    });
  }, 1000);

  // Stop monitoring after 10 seconds
  setTimeout(() => {
    const report = monitor.stopMonitoring();
    console.log("\n🎯 Final Report:");
    console.log(`Session: ${report.sessionId}`);
    console.log(`Total Tests: ${report.overallMetrics.totalTests}`);
    console.log(
      `Success Rate: ${report.overallMetrics.successRate.toFixed(1)}%`,
    );
  }, 10000);
}
