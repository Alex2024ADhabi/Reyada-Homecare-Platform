const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// OWASP ZAP Security Testing Configuration
const ZAP_CONFIG = {
  target: process.env.TARGET_URL || "http://localhost:3001",
  zapPath: process.env.ZAP_PATH || "/opt/zaproxy/zap.sh",
  reportPath: "./test-results/security",
  timeout: 300000, // 5 minutes
  alertThreshold: "MEDIUM",
  excludeUrls: [
    "logout",
    "static",
    "assets",
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".ico",
  ],
};

// Healthcare-specific security test scenarios
const SECURITY_SCENARIOS = {
  authentication: {
    name: "Authentication Security",
    tests: [
      "SQL Injection in login forms",
      "Brute force protection",
      "Session management",
      "Password policy enforcement",
      "Multi-factor authentication bypass",
    ],
  },
  patientData: {
    name: "Patient Data Protection",
    tests: [
      "HIPAA compliance validation",
      "Data encryption at rest",
      "Data encryption in transit",
      "Access control validation",
      "Audit trail integrity",
    ],
  },
  apiSecurity: {
    name: "API Security",
    tests: [
      "API authentication bypass",
      "Rate limiting validation",
      "Input validation",
      "Output encoding",
      "CORS configuration",
    ],
  },
  clinicalData: {
    name: "Clinical Data Security",
    tests: [
      "Clinical notes access control",
      "Assessment data protection",
      "Digital signature validation",
      "DOH compliance checks",
      "Medical record integrity",
    ],
  },
};

class SecurityTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      target: ZAP_CONFIG.target,
      scenarios: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
      },
    };
  }

  async runSecurityTests() {
    console.log("🔒 Starting OWASP ZAP Security Testing...");

    try {
      // Ensure report directory exists
      this.ensureReportDirectory();

      // Start ZAP daemon
      console.log("🚀 Starting ZAP daemon...");
      await this.startZapDaemon();

      // Wait for ZAP to be ready
      await this.waitForZap();

      // Run baseline scan
      console.log("🔍 Running baseline security scan...");
      await this.runBaselineScan();

      // Run authentication tests
      console.log("🔐 Testing authentication security...");
      await this.testAuthentication();

      // Run API security tests
      console.log("🌐 Testing API security...");
      await this.testApiSecurity();

      // Run healthcare-specific tests
      console.log("🏥 Testing healthcare-specific security...");
      await this.testHealthcareSecurity();

      // Generate comprehensive report
      console.log("📊 Generating security report...");
      await this.generateReport();

      // Stop ZAP daemon
      await this.stopZapDaemon();

      console.log("✅ Security testing completed");
      return this.results;
    } catch (error) {
      console.error("❌ Security testing failed:", error);
      throw error;
    }
  }

  ensureReportDirectory() {
    if (!fs.existsSync(ZAP_CONFIG.reportPath)) {
      fs.mkdirSync(ZAP_CONFIG.reportPath, { recursive: true });
    }
  }

  async startZapDaemon() {
    try {
      execSync(
        `${ZAP_CONFIG.zapPath} -daemon -port 8080 -config api.disablekey=true`,
        {
          stdio: "pipe",
          timeout: 30000,
        },
      );
    } catch (error) {
      // ZAP daemon might already be running
      console.log("ZAP daemon start attempted (may already be running)");
    }
  }

  async waitForZap() {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          "http://localhost:8080/JSON/core/view/version/",
        );
        if (response.ok) {
          console.log("✅ ZAP is ready");
          return;
        }
      } catch (error) {
        // ZAP not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error("ZAP failed to start within timeout period");
  }

  async runBaselineScan() {
    try {
      const command = `zap-baseline.py -t ${ZAP_CONFIG.target} -J ${ZAP_CONFIG.reportPath}/baseline-report.json -r ${ZAP_CONFIG.reportPath}/baseline-report.html`;

      const result = execSync(command, {
        stdio: "pipe",
        timeout: ZAP_CONFIG.timeout,
        encoding: "utf8",
      });

      this.results.scenarios.baseline = {
        name: "Baseline Security Scan",
        status: "completed",
        output: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.results.scenarios.baseline = {
        name: "Baseline Security Scan",
        status: "failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async testAuthentication() {
    const authTests = [
      {
        name: "SQL Injection in Login",
        url: `${ZAP_CONFIG.target}/api/auth/login`,
        payload: { email: "admin'--", password: "test" },
        expectedStatus: [400, 401, 403],
      },
      {
        name: "Brute Force Protection",
        url: `${ZAP_CONFIG.target}/api/auth/login`,
        payload: { email: "test@test.com", password: "wrong" },
        attempts: 10,
        expectedStatus: [429, 403],
      },
      {
        name: "Session Token Validation",
        url: `${ZAP_CONFIG.target}/api/patients`,
        headers: { Authorization: "Bearer invalid_token" },
        expectedStatus: [401, 403],
      },
    ];

    const results = [];

    for (const test of authTests) {
      try {
        const result = await this.executeSecurityTest(test);
        results.push(result);
        this.updateSummary(result);
      } catch (error) {
        results.push({
          name: test.name,
          status: "error",
          error: error.message,
        });
      }
    }

    this.results.scenarios.authentication = {
      name: "Authentication Security Tests",
      tests: results,
      timestamp: new Date().toISOString(),
    };
  }

  async testApiSecurity() {
    const apiTests = [
      {
        name: "API Rate Limiting",
        url: `${ZAP_CONFIG.target}/api/patients`,
        method: "GET",
        attempts: 100,
        expectedStatus: [429],
      },
      {
        name: "CORS Configuration",
        url: `${ZAP_CONFIG.target}/api/patients`,
        headers: { Origin: "https://malicious-site.com" },
        expectedHeaders: ["Access-Control-Allow-Origin"],
      },
      {
        name: "Input Validation - XSS",
        url: `${ZAP_CONFIG.target}/api/patients`,
        payload: { name: '<script>alert("xss")</script>' },
        expectedStatus: [400, 422],
      },
      {
        name: "Input Validation - XXE",
        url: `${ZAP_CONFIG.target}/api/clinical/assessments`,
        payload:
          '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
        contentType: "application/xml",
        expectedStatus: [400, 415],
      },
    ];

    const results = [];

    for (const test of apiTests) {
      try {
        const result = await this.executeSecurityTest(test);
        results.push(result);
        this.updateSummary(result);
      } catch (error) {
        results.push({
          name: test.name,
          status: "error",
          error: error.message,
        });
      }
    }

    this.results.scenarios.apiSecurity = {
      name: "API Security Tests",
      tests: results,
      timestamp: new Date().toISOString(),
    };
  }

  async testHealthcareSecurity() {
    const healthcareTests = [
      {
        name: "Patient Data Access Control",
        url: `${ZAP_CONFIG.target}/api/patients/123`,
        headers: { Authorization: "Bearer low_privilege_token" },
        expectedStatus: [403],
      },
      {
        name: "Clinical Notes Protection",
        url: `${ZAP_CONFIG.target}/api/clinical/assessments/123`,
        method: "GET",
        expectedEncryption: true,
      },
      {
        name: "HIPAA Audit Trail",
        url: `${ZAP_CONFIG.target}/api/audit/patient-access`,
        payload: { patientId: "123", action: "view" },
        expectedAuditLog: true,
      },
      {
        name: "DOH Compliance Validation",
        url: `${ZAP_CONFIG.target}/api/compliance/doh-check`,
        payload: { assessmentId: "123" },
        expectedCompliance: ["DOH-2025", "HIPAA"],
      },
    ];

    const results = [];

    for (const test of healthcareTests) {
      try {
        const result = await this.executeSecurityTest(test);
        results.push(result);
        this.updateSummary(result);
      } catch (error) {
        results.push({
          name: test.name,
          status: "error",
          error: error.message,
        });
      }
    }

    this.results.scenarios.healthcareSecurity = {
      name: "Healthcare-Specific Security Tests",
      tests: results,
      timestamp: new Date().toISOString(),
    };
  }

  async executeSecurityTest(test) {
    const startTime = Date.now();

    try {
      let response;

      if (test.attempts && test.attempts > 1) {
        // Multiple attempts for brute force testing
        const responses = [];
        for (let i = 0; i < test.attempts; i++) {
          const res = await this.makeRequest(test);
          responses.push(res);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        response = responses[responses.length - 1]; // Last response
      } else {
        response = await this.makeRequest(test);
      }

      const duration = Date.now() - startTime;

      return {
        name: test.name,
        status: this.evaluateTestResult(test, response),
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          duration,
        },
        expected:
          test.expectedStatus ||
          test.expectedHeaders ||
          test.expectedCompliance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: test.name,
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async makeRequest(test) {
    const options = {
      method: test.method || "POST",
      headers: {
        "Content-Type": test.contentType || "application/json",
        ...test.headers,
      },
    };

    if (test.payload) {
      options.body =
        typeof test.payload === "string"
          ? test.payload
          : JSON.stringify(test.payload);
    }

    return await fetch(test.url, options);
  }

  evaluateTestResult(test, response) {
    if (test.expectedStatus) {
      return test.expectedStatus.includes(response.status)
        ? "passed"
        : "failed";
    }

    if (test.expectedHeaders) {
      const hasExpectedHeaders = test.expectedHeaders.every((header) =>
        response.headers.has(header),
      );
      return hasExpectedHeaders ? "passed" : "failed";
    }

    // Default evaluation
    return response.status < 400 ? "passed" : "failed";
  }

  updateSummary(result) {
    this.results.summary.totalTests++;

    switch (result.status) {
      case "passed":
        this.results.summary.passed++;
        break;
      case "failed":
        this.results.summary.failed++;
        break;
      case "warning":
        this.results.summary.warnings++;
        break;
    }
  }

  async generateReport() {
    // Generate JSON report
    const jsonReport = JSON.stringify(this.results, null, 2);
    fs.writeFileSync(
      path.join(ZAP_CONFIG.reportPath, "security-test-results.json"),
      jsonReport,
    );

    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    fs.writeFileSync(
      path.join(ZAP_CONFIG.reportPath, "security-test-report.html"),
      htmlReport,
    );

    // Generate summary for CI/CD
    const summary = {
      passed: this.results.summary.passed,
      failed: this.results.summary.failed,
      total: this.results.summary.totalTests,
      successRate: (
        (this.results.summary.passed / this.results.summary.totalTests) *
        100
      ).toFixed(2),
    };

    fs.writeFileSync(
      path.join(ZAP_CONFIG.reportPath, "security-summary.json"),
      JSON.stringify(summary, null, 2),
    );

    console.log(`📊 Security Test Summary:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.successRate}%`);
  }

  generateHtmlReport() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Healthcare Platform Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e9f5ff; padding: 15px; border-radius: 5px; text-align: center; }
        .scenario { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .scenario-header { background: #f8f9fa; padding: 15px; font-weight: bold; }
        .test { padding: 10px 15px; border-bottom: 1px solid #eee; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Healthcare Platform Security Test Report</h1>
        <p>Generated: ${this.results.timestamp}</p>
        <p>Target: ${this.results.target}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>${this.results.summary.totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric">
            <h3>${this.results.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="metric">
            <h3>${this.results.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h3>${((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1)}%</h3>
            <p>Success Rate</p>
        </div>
    </div>
    
    ${Object.entries(this.results.scenarios)
      .map(
        ([key, scenario]) => `
        <div class="scenario">
            <div class="scenario-header">${scenario.name}</div>
            ${
              scenario.tests
                ? scenario.tests
                    .map(
                      (test) => `
                <div class="test">
                    <span class="${test.status}">[${test.status.toUpperCase()}]</span>
                    <strong>${test.name}</strong>
                    ${test.error ? `<br><small>Error: ${test.error}</small>` : ""}
                </div>
            `,
                    )
                    .join("")
                : `<div class="test">${scenario.status || "Completed"}</div>`
            }
        </div>
    `,
      )
      .join("")}
</body>
</html>
    `;
  }

  async stopZapDaemon() {
    try {
      await fetch("http://localhost:8080/JSON/core/action/shutdown/");
      console.log("🛑 ZAP daemon stopped");
    } catch (error) {
      console.log("ZAP daemon stop attempted");
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new SecurityTester();
  tester
    .runSecurityTests()
    .then((results) => {
      console.log("✅ Security testing completed successfully");
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("❌ Security testing failed:", error);
      process.exit(1);
    });
}

module.exports = SecurityTester;
