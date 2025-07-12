#!/usr/bin/env tsx
/**
 * Test Reporting System
 * Comprehensive test reporting with healthcare-specific metrics and compliance tracking
 * Generates multiple report formats and integrates with monitoring systems
 */

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

interface TestResult {
  name: string;
  suite: string;
  status: "passed" | "failed" | "skipped" | "pending";
  duration: number;
  startTime?: number;
  endTime?: number;
  error?: {
    message: string;
    stack?: string;
    type: string;
  };
  metadata?: {
    category?:
      | "unit"
      | "integration"
      | "e2e"
      | "performance"
      | "security"
      | "accessibility"
      | "compliance";
    tags?: string[];
    coverage?: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
    performance?: {
      memory: number;
      cpu: number;
      responseTime: number;
    };
    healthcare?: {
      complianceStandard?: "DOH" | "DAMAN" | "JAWDA" | "HIPAA";
      riskLevel?: "low" | "medium" | "high" | "critical";
      patientDataInvolved?: boolean;
      clinicalValidation?: boolean;
    };
  };
}

interface SuiteReport {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    pending: number;
    duration: number;
    successRate: number;
  };
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface ComprehensiveReport {
  sessionId: string;
  timestamp: string;
  environment: {
    platform: string;
    node: string;
    os: string;
    ci: boolean;
  };
  summary: {
    totalTests: number;
    totalSuites: number;
    passed: number;
    failed: number;
    skipped: number;
    pending: number;
    duration: number;
    successRate: number;
    errorRate: number;
  };
  suites: SuiteReport[];
  healthcareMetrics?: {
    complianceScore: number;
    standardsCompliance: Record<
      string,
      { passed: number; failed: number; score: number }
    >;
    riskAssessment: {
      overallRisk: "low" | "medium" | "high" | "critical";
      patientDataRisk: boolean;
      clinicalRisk: boolean;
    };
    criticalIssues: string[];
    recommendations: string[];
  };
  performanceMetrics?: {
    averageTestDuration: number;
    slowestTest: { name: string; duration: number } | null;
    fastestTest: { name: string; duration: number } | null;
    memoryUsage: {
      peak: number;
      average: number;
    };
    testsPerSecond: number;
  };
  coverage?: {
    overall: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
    bySuite: Record<string, any>;
  };
  trends?: {
    previousRuns: any[];
    improvement: boolean;
    regressions: string[];
  };
}

interface ReportingConfig {
  outputDirectory: string;
  formats: ("json" | "html" | "csv" | "junit" | "markdown")[];
  includeHealthcareMetrics: boolean;
  includePerformanceMetrics: boolean;
  includeCoverage: boolean;
  includeTrends: boolean;
  realTimeUpdates: boolean;
  webhookUrl?: string;
  slackWebhook?: string;
  emailNotifications?: {
    enabled: boolean;
    recipients: string[];
    onFailure: boolean;
    onSuccess: boolean;
  };
}

class TestReporter extends EventEmitter {
  private static instance: TestReporter;
  private isReporting: boolean = false;
  private sessionId: string = "";
  private startTime: number = 0;
  private config: ReportingConfig;
  private testResults: TestResult[] = [];
  private suiteReports: Map<string, SuiteReport> = new Map();
  private currentSuite?: string;

  private constructor() {
    super();
    this.config = this.loadDefaultConfig();
  }

  static getInstance(): TestReporter {
    if (!TestReporter.instance) {
      TestReporter.instance = new TestReporter();
    }
    return TestReporter.instance;
  }

  startReporting(config?: Partial<ReportingConfig>): string {
    if (this.isReporting) {
      console.warn("⚠️  Test reporting is already active");
      return this.sessionId;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.isReporting = true;
    this.testResults = [];
    this.suiteReports.clear();

    // Ensure output directory exists
    this.ensureOutputDirectory();

    console.log("📊 Test Reporter started");
    console.log(`   Session ID: ${this.sessionId}`);
    console.log(`   Output Directory: ${this.config.outputDirectory}`);
    console.log(`   Formats: ${this.config.formats.join(", ")}`);
    console.log(
      `   Healthcare Metrics: ${this.config.includeHealthcareMetrics}`,
    );
    console.log(
      `   Performance Metrics: ${this.config.includePerformanceMetrics}`,
    );

    this.emit("reporting-started", {
      sessionId: this.sessionId,
      timestamp: Date.now(),
    });

    return this.sessionId;
  }

  stopReporting(): ComprehensiveReport {
    if (!this.isReporting) {
      console.warn("⚠️  Test reporting is not active");
      return this.generateEmptyReport();
    }

    this.isReporting = false;
    const report = this.generateComprehensiveReport();

    console.log("🎯 Test Reporter stopped");
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`   Duration: ${(report.summary.duration / 1000).toFixed(2)}s`);

    if (report.healthcareMetrics) {
      console.log(
        `   Healthcare Compliance: ${report.healthcareMetrics.complianceScore.toFixed(1)}%`,
      );
      console.log(
        `   Risk Level: ${report.healthcareMetrics.riskAssessment.overallRisk.toUpperCase()}`,
      );
    }

    this.emit("reporting-stopped", { report, timestamp: Date.now() });

    return report;
  }

  addTestResult(result: TestResult): void {
    if (!this.isReporting) {
      return;
    }

    // Add timestamps if not provided
    if (!result.startTime) {
      result.startTime = performance.now() - result.duration;
    }
    if (!result.endTime) {
      result.endTime = result.startTime + result.duration;
    }

    this.testResults.push(result);
    this.updateSuiteReport(result);
    this.emit("test-result-added", result);

    // Real-time updates if enabled
    if (this.config.realTimeUpdates) {
      this.emitRealTimeUpdate(result);
    }

    // Log significant events
    if (result.status === "failed") {
      console.log(`❌ Test failed: ${result.suite}/${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error.message}`);
      }
    } else if (
      result.status === "passed" &&
      result.metadata?.healthcare?.riskLevel === "critical"
    ) {
      console.log(
        `✅ Critical healthcare test passed: ${result.suite}/${result.name}`,
      );
    }
  }

  addSuiteStart(suiteName: string): void {
    this.currentSuite = suiteName;
    if (!this.suiteReports.has(suiteName)) {
      this.suiteReports.set(suiteName, {
        name: suiteName,
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          pending: 0,
          duration: 0,
          successRate: 0,
        },
        startTime: performance.now(),
      });
    }
  }

  addSuiteEnd(suiteName: string): void {
    const suite = this.suiteReports.get(suiteName);
    if (suite) {
      suite.endTime = performance.now();
      suite.duration = suite.endTime - suite.startTime;
      this.recalculateSuiteSummary(suite);
    }
  }

  generateComprehensiveReport(): ComprehensiveReport {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;

    // Calculate overall summary
    const summary = {
      totalTests: this.testResults.length,
      totalSuites: this.suiteReports.size,
      passed: this.testResults.filter((t) => t.status === "passed").length,
      failed: this.testResults.filter((t) => t.status === "failed").length,
      skipped: this.testResults.filter((t) => t.status === "skipped").length,
      pending: this.testResults.filter((t) => t.status === "pending").length,
      duration: totalDuration,
      successRate: 0,
      errorRate: 0,
    };

    if (summary.totalTests > 0) {
      summary.successRate = (summary.passed / summary.totalTests) * 100;
      summary.errorRate = (summary.failed / summary.totalTests) * 100;
    }

    const report: ComprehensiveReport = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      summary,
      suites: Array.from(this.suiteReports.values()),
    };

    // Add healthcare metrics if enabled
    if (this.config.includeHealthcareMetrics) {
      report.healthcareMetrics = this.generateHealthcareMetrics();
    }

    // Add performance metrics if enabled
    if (this.config.includePerformanceMetrics) {
      report.performanceMetrics = this.generatePerformanceMetrics();
    }

    // Add coverage if enabled
    if (this.config.includeCoverage) {
      report.coverage = this.generateCoverageReport();
    }

    // Add trends if enabled
    if (this.config.includeTrends) {
      report.trends = this.generateTrendsReport();
    }

    return report;
  }

  async saveReports(report: ComprehensiveReport): Promise<string[]> {
    const savedFiles: string[] = [];

    for (const format of this.config.formats) {
      try {
        const filePath = await this.saveReportInFormat(report, format);
        savedFiles.push(filePath);
        console.log(`📄 Report saved: ${filePath}`);
      } catch (error) {
        console.error(`Failed to save ${format} report: ${error}`);
      }
    }

    // Send notifications if configured
    if (this.config.webhookUrl) {
      await this.sendWebhookNotification(report);
    }

    if (this.config.slackWebhook) {
      await this.sendSlackNotification(report);
    }

    if (this.config.emailNotifications?.enabled) {
      await this.sendEmailNotification(report);
    }

    return savedFiles;
  }

  private updateSuiteReport(result: TestResult): void {
    let suite = this.suiteReports.get(result.suite);
    if (!suite) {
      suite = {
        name: result.suite,
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          pending: 0,
          duration: 0,
          successRate: 0,
        },
        startTime: performance.now(),
      };
      this.suiteReports.set(result.suite, suite);
    }

    suite.tests.push(result);
    this.recalculateSuiteSummary(suite);
  }

  private recalculateSuiteSummary(suite: SuiteReport): void {
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(
      (t) => t.status === "passed",
    ).length;
    suite.summary.failed = suite.tests.filter(
      (t) => t.status === "failed",
    ).length;
    suite.summary.skipped = suite.tests.filter(
      (t) => t.status === "skipped",
    ).length;
    suite.summary.pending = suite.tests.filter(
      (t) => t.status === "pending",
    ).length;
    suite.summary.duration = suite.tests.reduce(
      (sum, t) => sum + t.duration,
      0,
    );
    suite.summary.successRate =
      suite.summary.total > 0
        ? (suite.summary.passed / suite.summary.total) * 100
        : 0;
  }

  private generateHealthcareMetrics() {
    const healthcareTests = this.testResults.filter(
      (t) => t.metadata?.healthcare,
    );
    const complianceStandards = ["DOH", "DAMAN", "JAWDA", "HIPAA"] as const;
    const standardsCompliance: Record<
      string,
      { passed: number; failed: number; score: number }
    > = {};

    // Calculate compliance by standard
    for (const standard of complianceStandards) {
      const standardTests = healthcareTests.filter(
        (t) => t.metadata?.healthcare?.complianceStandard === standard,
      );
      const passed = standardTests.filter((t) => t.status === "passed").length;
      const failed = standardTests.filter((t) => t.status === "failed").length;
      const total = passed + failed;

      standardsCompliance[standard] = {
        passed,
        failed,
        score: total > 0 ? (passed / total) * 100 : 100,
      };
    }

    // Calculate overall compliance score
    const allStandardScores = Object.values(standardsCompliance).map(
      (s) => s.score,
    );
    const complianceScore =
      allStandardScores.length > 0
        ? allStandardScores.reduce((sum, score) => sum + score, 0) /
          allStandardScores.length
        : 100;

    // Risk assessment
    const criticalFailures = healthcareTests.filter(
      (t) =>
        t.status === "failed" &&
        t.metadata?.healthcare?.riskLevel === "critical",
    );
    const highRiskFailures = healthcareTests.filter(
      (t) =>
        t.status === "failed" && t.metadata?.healthcare?.riskLevel === "high",
    );
    const patientDataTests = healthcareTests.filter(
      (t) => t.metadata?.healthcare?.patientDataInvolved,
    );
    const patientDataFailures = patientDataTests.filter(
      (t) => t.status === "failed",
    );

    let overallRisk: "low" | "medium" | "high" | "critical" = "low";
    if (criticalFailures.length > 0) {
      overallRisk = "critical";
    } else if (patientDataFailures.length > 0) {
      overallRisk = "high";
    } else if (highRiskFailures.length > 0) {
      overallRisk = "medium";
    }

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    if (criticalFailures.length > 0) {
      criticalIssues.push(
        `${criticalFailures.length} critical healthcare tests failed`,
      );
      recommendations.push(
        "Immediately address critical healthcare test failures before production",
      );
    }

    if (patientDataFailures.length > 0) {
      criticalIssues.push(
        `${patientDataFailures.length} patient data tests failed`,
      );
      recommendations.push(
        "Review patient data handling and security measures",
      );
    }

    if (complianceScore < 95) {
      recommendations.push(
        "Improve healthcare compliance test coverage and fix failing tests",
      );
    }

    return {
      complianceScore,
      standardsCompliance,
      riskAssessment: {
        overallRisk,
        patientDataRisk: patientDataFailures.length > 0,
        clinicalRisk: criticalFailures.length > 0,
      },
      criticalIssues,
      recommendations,
    };
  }

  private generatePerformanceMetrics() {
    const durations = this.testResults.map((t) => t.duration);
    const memoryUsages = this.testResults
      .map((t) => t.metadata?.performance?.memory)
      .filter(Boolean) as number[];

    const slowestTest = this.testResults.reduce(
      (slowest, test) =>
        !slowest || test.duration > slowest.duration ? test : slowest,
      null as TestResult | null,
    );

    const fastestTest = this.testResults.reduce(
      (fastest, test) =>
        !fastest || test.duration < fastest.duration ? test : fastest,
      null as TestResult | null,
    );

    const totalDuration = performance.now() - this.startTime;
    const testsPerSecond = this.testResults.length / (totalDuration / 1000);

    return {
      averageTestDuration:
        durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : 0,
      slowestTest: slowestTest
        ? {
            name: `${slowestTest.suite}/${slowestTest.name}`,
            duration: slowestTest.duration,
          }
        : null,
      fastestTest: fastestTest
        ? {
            name: `${fastestTest.suite}/${fastestTest.name}`,
            duration: fastestTest.duration,
          }
        : null,
      memoryUsage: {
        peak: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
        average:
          memoryUsages.length > 0
            ? memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length
            : 0,
      },
      testsPerSecond,
    };
  }

  private generateCoverageReport() {
    const coverageData = this.testResults
      .map((t) => t.metadata?.coverage)
      .filter(Boolean);

    if (coverageData.length === 0) {
      return {
        overall: { lines: 0, functions: 0, branches: 0, statements: 0 },
        bySuite: {},
      };
    }

    // Calculate overall coverage
    const overall = {
      lines:
        coverageData.reduce((sum, c) => sum + (c?.lines || 0), 0) /
        coverageData.length,
      functions:
        coverageData.reduce((sum, c) => sum + (c?.functions || 0), 0) /
        coverageData.length,
      branches:
        coverageData.reduce((sum, c) => sum + (c?.branches || 0), 0) /
        coverageData.length,
      statements:
        coverageData.reduce((sum, c) => sum + (c?.statements || 0), 0) /
        coverageData.length,
    };

    // Calculate coverage by suite
    const bySuite: Record<string, any> = {};
    for (const suite of this.suiteReports.values()) {
      const suiteCoverage = suite.tests
        .map((t) => t.metadata?.coverage)
        .filter(Boolean);

      if (suiteCoverage.length > 0) {
        bySuite[suite.name] = {
          lines:
            suiteCoverage.reduce((sum, c) => sum + (c?.lines || 0), 0) /
            suiteCoverage.length,
          functions:
            suiteCoverage.reduce((sum, c) => sum + (c?.functions || 0), 0) /
            suiteCoverage.length,
          branches:
            suiteCoverage.reduce((sum, c) => sum + (c?.branches || 0), 0) /
            suiteCoverage.length,
          statements:
            suiteCoverage.reduce((sum, c) => sum + (c?.statements || 0), 0) /
            suiteCoverage.length,
        };
      }
    }

    return { overall, bySuite };
  }

  private generateTrendsReport() {
    // Mock trends data - in real implementation, would load from previous runs
    return {
      previousRuns: [],
      improvement: true,
      regressions: [],
    };
  }

  private getEnvironmentInfo() {
    return {
      platform: process.platform,
      node: process.version,
      os: `${process.platform} ${process.arch}`,
      ci: !!process.env.CI,
    };
  }

  private async saveReportInFormat(
    report: ComprehensiveReport,
    format: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `test-report-${timestamp}.${format}`;
    const filePath = path.join(this.config.outputDirectory, fileName);

    switch (format) {
      case "json":
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
        break;
      case "html":
        fs.writeFileSync(filePath, this.generateHTMLReport(report));
        break;
      case "csv":
        fs.writeFileSync(filePath, this.generateCSVReport(report));
        break;
      case "junit":
        fs.writeFileSync(filePath, this.generateJUnitReport(report));
        break;
      case "markdown":
        fs.writeFileSync(filePath, this.generateMarkdownReport(report));
        break;
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }

    return filePath;
  }

  private generateHTMLReport(report: ComprehensiveReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Healthcare Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #f8f9fa; padding: 10px; font-weight: bold; }
        .test { padding: 10px; border-bottom: 1px solid #eee; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .healthcare { background: #e8f5e8; }
        .critical { background: #ffe6e6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Healthcare Platform Test Report</h1>
        <p><strong>Session:</strong> ${report.sessionId}</p>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Environment:</strong> ${report.environment.platform} ${report.environment.node}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>${report.summary.totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric">
            <h3>${report.summary.successRate.toFixed(1)}%</h3>
            <p>Success Rate</p>
        </div>
        <div class="metric">
            <h3>${(report.summary.duration / 1000).toFixed(2)}s</h3>
            <p>Duration</p>
        </div>
        ${
          report.healthcareMetrics
            ? `
        <div class="metric healthcare">
            <h3>${report.healthcareMetrics.complianceScore.toFixed(1)}%</h3>
            <p>Healthcare Compliance</p>
        </div>
        <div class="metric ${report.healthcareMetrics.riskAssessment.overallRisk === "critical" ? "critical" : ""}">
            <h3>${report.healthcareMetrics.riskAssessment.overallRisk.toUpperCase()}</h3>
            <p>Risk Level</p>
        </div>
        `
            : ""
        }
    </div>
    
    ${report.suites
      .map(
        (suite) => `
    <div class="suite">
        <div class="suite-header">
            ${suite.name} (${suite.summary.passed}/${suite.summary.total} passed)
        </div>
        ${suite.tests
          .map(
            (test) => `
        <div class="test ${test.status} ${test.metadata?.healthcare ? "healthcare" : ""}">
            <strong>${test.name}</strong> 
            <span class="${test.status}">${test.status.toUpperCase()}</span>
            <span>(${test.duration.toFixed(0)}ms)</span>
            ${test.error ? `<br><small>Error: ${test.error.message}</small>` : ""}
            ${test.metadata?.healthcare ? `<br><small>🏥 Healthcare: ${test.metadata.healthcare.complianceStandard || "General"} | Risk: ${test.metadata.healthcare.riskLevel || "low"}</small>` : ""}
        </div>
        `,
          )
          .join("")}
    </div>
    `,
      )
      .join("")}
    
    ${
      report.healthcareMetrics?.criticalIssues.length
        ? `
    <div class="critical">
        <h3>🚨 Critical Issues</h3>
        <ul>
            ${report.healthcareMetrics.criticalIssues.map((issue) => `<li>${issue}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }
    
    ${
      report.healthcareMetrics?.recommendations.length
        ? `
    <div>
        <h3>💡 Recommendations</h3>
        <ul>
            ${report.healthcareMetrics.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }
</body>
</html>
    `.trim();
  }

  private generateCSVReport(report: ComprehensiveReport): string {
    const headers = [
      "Suite",
      "Test",
      "Status",
      "Duration",
      "Error",
      "Healthcare",
      "Compliance Standard",
      "Risk Level",
    ];

    const rows = report.suites.flatMap((suite) =>
      suite.tests.map((test) => [
        suite.name,
        test.name,
        test.status,
        test.duration.toString(),
        test.error?.message || "",
        test.metadata?.healthcare ? "Yes" : "No",
        test.metadata?.healthcare?.complianceStandard || "",
        test.metadata?.healthcare?.riskLevel || "",
      ]),
    );

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  private generateJUnitReport(report: ComprehensiveReport): string {
    const testsuites = report.suites
      .map((suite) => {
        const tests = suite.tests
          .map((test) => {
            const testcase = `<testcase name="${test.name}" classname="${suite.name}" time="${(test.duration / 1000).toFixed(3)}"`;

            if (test.status === "failed") {
              return `${testcase}>
      <failure message="${test.error?.message || "Test failed"}">${test.error?.stack || ""}</failure>
    </testcase>`;
            } else if (test.status === "skipped") {
              return `${testcase}>
      <skipped/>
    </testcase>`;
            } else {
              return `${testcase}/>`;
            }
          })
          .join("\n    ");

        return `  <testsuite name="${suite.name}" tests="${suite.summary.total}" failures="${suite.summary.failed}" skipped="${suite.summary.skipped}" time="${(suite.summary.duration / 1000).toFixed(3)}">
    ${tests}
  </testsuite>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Healthcare Platform Tests" tests="${report.summary.totalTests}" failures="${report.summary.failed}" time="${(report.summary.duration / 1000).toFixed(3)}">
${testsuites}
</testsuites>`;
  }

  private generateMarkdownReport(report: ComprehensiveReport): string {
    return `
# 🏥 Healthcare Platform Test Report

**Session:** ${report.sessionId}  
**Generated:** ${report.timestamp}  
**Environment:** ${report.environment.platform} ${report.environment.node}  

## 📊 Summary

| Metric | Value |
|-----------|-------|
| Total Tests | ${report.summary.totalTests} |
| Success Rate | ${report.summary.successRate.toFixed(1)}% |
| Duration | ${(report.summary.duration / 1000).toFixed(2)}s |
${
  report.healthcareMetrics
    ? `| Healthcare Compliance | ${report.healthcareMetrics.complianceScore.toFixed(1)}% |
| Risk Level | ${report.healthcareMetrics.riskAssessment.overallRisk.toUpperCase()} |`
    : ""
}

## 🧪 Test Suites

${report.suites
  .map(
    (suite) => `
### ${suite.name}

**Summary:** ${suite.summary.passed}/${suite.summary.total} passed (${suite.summary.successRate.toFixed(1)}%)

${suite.tests
  .map(
    (test) => `
- ${test.status === "passed" ? "✅" : test.status === "failed" ? "❌" : "⏭️"} **${test.name}** (${test.duration.toFixed(0)}ms)${test.metadata?.healthcare ? ` 🏥 ${test.metadata.healthcare.complianceStandard || "Healthcare"}` : ""}${test.error ? `\n  - Error: ${test.error.message}` : ""}
`,
  )
  .join("")}
`,
  )
  .join("")}

${
  report.healthcareMetrics?.criticalIssues.length
    ? `
## 🚨 Critical Issues

${report.healthcareMetrics.criticalIssues.map((issue) => `- ${issue}`).join("\n")}
`
    : ""
}

${
  report.healthcareMetrics?.recommendations.length
    ? `
## 💡 Recommendations

${report.healthcareMetrics.recommendations.map((rec) => `- ${rec}`).join("\n")}
`
    : ""
}
    `.trim();
  }

  private emitRealTimeUpdate(result: TestResult): void {
    this.emit("real-time-update", {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      result,
      currentStats: {
        total: this.testResults.length,
        passed: this.testResults.filter((t) => t.status === "passed").length,
        failed: this.testResults.filter((t) => t.status === "failed").length,
      },
    });
  }

  private async sendWebhookNotification(
    report: ComprehensiveReport,
  ): Promise<void> {
    // Mock webhook notification
    console.log(`🔗 Webhook notification sent to: ${this.config.webhookUrl}`);
  }

  private async sendSlackNotification(
    report: ComprehensiveReport,
  ): Promise<void> {
    // Mock Slack notification
    console.log(`💬 Slack notification sent`);
  }

  private async sendEmailNotification(
    report: ComprehensiveReport,
  ): Promise<void> {
    // Mock email notification
    console.log(`📧 Email notification sent`);
  }

  private generateEmptyReport(): ComprehensiveReport {
    return {
      sessionId: "no-session",
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      summary: {
        totalTests: 0,
        totalSuites: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
        duration: 0,
        successRate: 0,
        errorRate: 0,
      },
      suites: [],
    };
  }

  private generateSessionId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private loadDefaultConfig(): ReportingConfig {
    return {
      outputDirectory: "test-results",
      formats: ["json", "html", "junit"],
      includeHealthcareMetrics: true,
      includePerformanceMetrics: true,
      includeCoverage: false,
      includeTrends: false,
      realTimeUpdates: true,
    };
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.config.outputDirectory)) {
      fs.mkdirSync(this.config.outputDirectory, { recursive: true });
    }
  }

  // Public getters
  getSessionId(): string {
    return this.sessionId;
  }

  isActive(): boolean {
    return this.isReporting;
  }

  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  getSuiteReports(): SuiteReport[] {
    return Array.from(this.suiteReports.values());
  }
}

// Export singleton instance
export const globalTestReporter = TestReporter.getInstance();
export default globalTestReporter;

// Export types and classes
export {
  TestReporter,
  type TestResult,
  type SuiteReport,
  type ComprehensiveReport,
  type ReportingConfig,
};

// CLI execution for testing
if (require.main === module) {
  console.log("📊 Test Reporter - Test Mode");

  const reporter = globalTestReporter;
  const sessionId = reporter.startReporting({
    formats: ["json", "html", "markdown"],
    includeHealthcareMetrics: true,
  });

  // Simulate some test results
  setTimeout(() => {
    reporter.addTestResult({
      name: "Patient Data Validation",
      suite: "Healthcare Unit Tests",
      status: "passed",
      duration: 150,
      metadata: {
        category: "unit",
        healthcare: {
          complianceStandard: "DOH",
          riskLevel: "high",
          patientDataInvolved: true,
        },
      },
    });

    reporter.addTestResult({
      name: "DAMAN Claims Processing",
      suite: "Integration Tests",
      status: "passed",
      duration: 300,
      metadata: {
        category: "integration",
        healthcare: {
          complianceStandard: "DAMAN",
          riskLevel: "critical",
          patientDataInvolved: false,
        },
      },
    });

    reporter.addTestResult({
      name: "Security Validation",
      suite: "Security Tests",
      status: "failed",
      duration: 200,
      error: {
        message: "Encryption validation failed",
        type: "SecurityError",
      },
      metadata: {
        category: "security",
        healthcare: {
          complianceStandard: "HIPAA",
          riskLevel: "critical",
          patientDataInvolved: true,
        },
      },
    });
  }, 1000);

  // Generate report after 5 seconds
  setTimeout(async () => {
    const report = reporter.stopReporting();
    const savedFiles = await reporter.saveReports(report);

    console.log("\n🎯 Test Report Generated:");
    console.log(`Session: ${report.sessionId}`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    if (report.healthcareMetrics) {
      console.log(
        `Healthcare Compliance: ${report.healthcareMetrics.complianceScore.toFixed(1)}%`,
      );
      console.log(
        `Risk Level: ${report.healthcareMetrics.riskAssessment.overallRisk}`,
      );
    }
    console.log(`\nSaved Files:`);
    savedFiles.forEach((file) => console.log(`  - ${file}`));
  }, 5000);
}
