#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { TestReportingService } = require("../src/test/utils/test-reporting.ts");

/**
 * Comprehensive Test Execution Script
 * Orchestrates all testing types for the healthcare platform
 */
class ComprehensiveTestRunner {
  constructor() {
    this.reportingService = TestReportingService.getInstance();
    this.testResults = [];
    this.startTime = Date.now();
    this.config = {
      parallel: process.env.CI ? false : true,
      timeout: 30 * 60 * 1000, // 30 minutes
      retries: process.env.CI ? 2 : 1,
      environment: process.env.NODE_ENV || "test",
      skipSlowTests: process.env.SKIP_SLOW_TESTS === "true",
      generateReports: process.env.GENERATE_REPORTS !== "false",
    };
  }

  async run() {
    console.log("🚀 Starting Comprehensive Healthcare Platform Testing");
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Parallel execution: ${this.config.parallel}`);
    console.log(`Generate reports: ${this.config.generateReports}`);
    console.log("=".repeat(60));

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run test suites based on configuration
      const testSuites = this.getTestSuites();

      if (this.config.parallel) {
        await this.runTestsInParallel(testSuites);
      } else {
        await this.runTestsSequentially(testSuites);
      }

      // Generate comprehensive reports
      if (this.config.generateReports) {
        await this.generateReports();
      }

      // Quality gate check
      await this.performQualityGateCheck();

      console.log("✅ All tests completed successfully!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Test execution failed:", error.message);
      await this.handleTestFailure(error);
      process.exit(1);
    }
  }

  getTestSuites() {
    const suites = [
      {
        name: "Unit Tests",
        command: "npm run test:unit",
        priority: 1,
        timeout: 5 * 60 * 1000,
        required: true,
      },
      {
        name: "Integration Tests",
        command: "npm run test:integration",
        priority: 2,
        timeout: 10 * 60 * 1000,
        required: true,
      },
      {
        name: "End-to-End Tests",
        command: "npm run test:e2e",
        priority: 3,
        timeout: 15 * 60 * 1000,
        required: true,
      },
      {
        name: "Accessibility Tests",
        command: "npm run test:accessibility",
        priority: 4,
        timeout: 10 * 60 * 1000,
        required: true,
      },
      {
        name: "Visual Regression Tests",
        command: "npm run test:visual",
        priority: 5,
        timeout: 15 * 60 * 1000,
        required: false,
      },
      {
        name: "Security Tests",
        command: "npm run test:security",
        priority: 6,
        timeout: 20 * 60 * 1000,
        required: true,
        skip: this.config.skipSlowTests,
      },
      {
        name: "Load Tests",
        command: "npm run test:load",
        priority: 7,
        timeout: 25 * 60 * 1000,
        required: false,
        skip: this.config.skipSlowTests,
      },
    ];

    return suites.filter((suite) => !suite.skip);
  }

  async setupTestEnvironment() {
    console.log("🔧 Setting up test environment...");

    // Ensure test results directory exists
    const testResultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Clean previous test results
    this.cleanPreviousResults();

    // Setup test database if needed
    await this.setupTestDatabase();

    // Start dev server for testing
    await this.startDevServer();

    console.log("✅ Test environment ready");
  }

  cleanPreviousResults() {
    const testResultsDir = path.join(process.cwd(), "test-results");
    const files = fs
      .readdirSync(testResultsDir)
      .filter(
        (file) =>
          file.endsWith(".json") ||
          file.endsWith(".xml") ||
          file.endsWith(".html"),
      );

    files.forEach((file) => {
      fs.unlinkSync(path.join(testResultsDir, file));
    });
  }

  async setupTestDatabase() {
    // Setup test database or mock data if needed
    console.log("📊 Setting up test data...");
    // Implementation would depend on your database setup
  }

  async startDevServer() {
    console.log("🌐 Starting development server...");
    // Check if server is already running
    try {
      const response = await fetch("http://localhost:3001");
      if (response.ok) {
        console.log("✅ Development server already running");
        return;
      }
    } catch (error) {
      // Server not running, start it
    }

    // Start server in background
    this.devServerProcess = spawn("npm", ["run", "dev"], {
      detached: true,
      stdio: "pipe",
    });

    // Wait for server to be ready
    await this.waitForServer("http://localhost:3001", 60000);
    console.log("✅ Development server started");
  }

  async waitForServer(url, timeout) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch (error) {
        // Server not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Server at ${url} did not start within ${timeout}ms`);
  }

  async runTestsInParallel(testSuites) {
    console.log("🔄 Running tests in parallel...");

    const promises = testSuites.map((suite) => this.runTestSuite(suite));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const suite = testSuites[index];
      if (result.status === "rejected") {
        console.error(`❌ ${suite.name} failed:`, result.reason);
        if (suite.required) {
          throw new Error(`Required test suite failed: ${suite.name}`);
        }
      } else {
        console.log(`✅ ${suite.name} completed`);
      }
    });
  }

  async runTestsSequentially(testSuites) {
    console.log("🔄 Running tests sequentially...");

    for (const suite of testSuites) {
      try {
        await this.runTestSuite(suite);
        console.log(`✅ ${suite.name} completed`);
      } catch (error) {
        console.error(`❌ ${suite.name} failed:`, error.message);
        if (suite.required) {
          throw error;
        }
      }
    }
  }

  async runTestSuite(suite) {
    console.log(`🧪 Running ${suite.name}...`);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${suite.name} timed out after ${suite.timeout}ms`));
      }, suite.timeout);

      const child = spawn("sh", ["-c", suite.command], {
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "test" },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on("close", (code) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;

        const result = {
          name: suite.name,
          command: suite.command,
          exitCode: code,
          duration,
          stdout,
          stderr,
          success: code === 0,
        };

        this.testResults.push(result);

        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`${suite.name} failed with exit code ${code}`));
        }
      });

      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async generateReports() {
    console.log("📊 Generating comprehensive test reports...");

    try {
      // Generate individual reports
      await this.generateJUnitReport();
      await this.generateCoverageReport();
      await this.generateHTMLReport();
      await this.generateSlackReport();

      console.log("✅ Reports generated successfully");
    } catch (error) {
      console.warn("⚠️  Report generation failed:", error.message);
    }
  }

  async generateJUnitReport() {
    const junitXml = this.createJUnitXML();
    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "comprehensive-junit.xml"),
      junitXml,
    );
  }

  createJUnitXML() {
    const totalTests = this.testResults.length;
    const failures = this.testResults.filter((r) => !r.success).length;
    const totalTime =
      this.testResults.reduce((sum, r) => sum + r.duration, 0) / 1000;

    const testCases = this.testResults
      .map((result) => {
        const failure = !result.success
          ? `<failure message="Test suite failed">${result.stderr}</failure>`
          : "";

        return `    <testcase classname="${result.name}" name="${result.command}" time="${result.duration / 1000}">${failure}</testcase>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Healthcare Platform Comprehensive Tests" tests="${totalTests}" failures="${failures}" time="${totalTime}">
${testCases}
</testsuite>`;
  }

  async generateCoverageReport() {
    // Aggregate coverage from different test types
    console.log("📈 Aggregating coverage reports...");
    // Implementation would merge coverage from unit, integration, and e2e tests
  }

  async generateHTMLReport() {
    const htmlContent = this.createHTMLReport();
    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "comprehensive-report.html"),
      htmlContent,
    );
  }

  createHTMLReport() {
    const totalDuration = Date.now() - this.startTime;
    const successRate =
      (this.testResults.filter((r) => r.success).length /
        this.testResults.length) *
      100;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Healthcare Platform Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric.success { border-left: 4px solid #28a745; }
        .metric.warning { border-left: 4px solid #ffc107; }
        .metric.danger { border-left: 4px solid #dc3545; }
        .test-results { margin: 20px 0; }
        .test-item { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .test-item.success { background: #d4edda; }
        .test-item.failure { background: #f8d7da; }
        .duration { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Healthcare Platform Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total Duration: ${Math.round(totalDuration / 1000)}s</p>
        </div>
        
        <div class="metrics">
            <div class="metric ${successRate >= 95 ? "success" : successRate >= 80 ? "warning" : "danger"}">
                <h3>${successRate.toFixed(1)}%</h3>
                <p>Success Rate</p>
            </div>
            <div class="metric">
                <h3>${this.testResults.length}</h3>
                <p>Test Suites</p>
            </div>
            <div class="metric ${this.testResults.filter((r) => r.success).length === this.testResults.length ? "success" : "danger"}">
                <h3>${this.testResults.filter((r) => r.success).length}</h3>
                <p>Passed</p>
            </div>
            <div class="metric ${this.testResults.filter((r) => !r.success).length === 0 ? "success" : "danger"}">
                <h3>${this.testResults.filter((r) => !r.success).length}</h3>
                <p>Failed</p>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Suite Results</h2>
            ${this.testResults
              .map(
                (result) => `
                <div class="test-item ${result.success ? "success" : "failure"}">
                    <strong>${result.name}</strong>
                    <span class="duration">(${Math.round(result.duration / 1000)}s)</span>
                    <br>
                    <code>${result.command}</code>
                    ${!result.success ? `<br><small style="color: #721c24;">${result.stderr.substring(0, 200)}...</small>` : ""}
                </div>
            `,
              )
              .join("")}
        </div>
    </div>
</body>
</html>`;
  }

  async generateSlackReport() {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const successRate =
      (this.testResults.filter((r) => r.success).length /
        this.testResults.length) *
      100;
    const emoji = successRate >= 95 ? "✅" : successRate >= 80 ? "⚠️" : "❌";

    const message = {
      text: `${emoji} Healthcare Platform Test Results`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Healthcare Platform Test Results*\n\n*Success Rate:* ${successRate.toFixed(1)}%\n*Total Suites:* ${this.testResults.length}\n*Passed:* ${this.testResults.filter((r) => r.success).length}\n*Failed:* ${this.testResults.filter((r) => !r.success).length}`,
          },
        },
      ],
    };

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.warn("Failed to send Slack notification:", error.message);
    }
  }

  async performQualityGateCheck() {
    console.log("🚪 Performing quality gate check...");

    const successRate =
      (this.testResults.filter((r) => r.success).length /
        this.testResults.length) *
      100;
    const requiredTests = this.testResults.filter(
      (r) =>
        r.name.includes("Unit") ||
        r.name.includes("Integration") ||
        r.name.includes("E2E"),
    );
    const requiredTestsPass = requiredTests.every((r) => r.success);

    const qualityGate = {
      passed: successRate >= 80 && requiredTestsPass,
      successRate,
      requiredTestsPass,
      criteria: {
        minSuccessRate: 80,
        requiredTestsMustPass: true,
      },
    };

    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "quality-gate.json"),
      JSON.stringify(qualityGate, null, 2),
    );

    if (!qualityGate.passed) {
      throw new Error(
        `Quality gate failed: Success rate ${successRate.toFixed(1)}% (required: 80%), Required tests pass: ${requiredTestsPass}`,
      );
    }

    console.log("✅ Quality gate passed");
  }

  async handleTestFailure(error) {
    console.error("🔥 Test execution failed, generating failure report...");

    const failureReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      testResults: this.testResults,
      environment: this.config.environment,
      duration: Date.now() - this.startTime,
    };

    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "failure-report.json"),
      JSON.stringify(failureReport, null, 2),
    );

    // Send failure notification
    await this.sendFailureNotification(failureReport);
  }

  async sendFailureNotification(report) {
    if (process.env.SLACK_WEBHOOK_URL) {
      const message = {
        text: "🚨 Healthcare Platform Tests Failed",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🚨 Test Execution Failed*\n\n*Error:* ${report.error}\n*Environment:* ${report.environment}\n*Duration:* ${Math.round(report.duration / 1000)}s`,
            },
          },
        ],
      };

      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.warn("Failed to send failure notification:", error.message);
      }
    }
  }

  cleanup() {
    if (this.devServerProcess) {
      this.devServerProcess.kill();
    }
  }
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Test execution interrupted");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Test execution terminated");
  process.exit(1);
});

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveTestRunner };
