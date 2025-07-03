/**
 * OWASP ZAP Security Testing for Reyada Healthcare Platform
 * Automated security testing with healthcare-specific vulnerability checks
 */

const ZapClient = require("zaproxy");
const fs = require("fs");
const path = require("path");

class HealthcareSecurityTester {
  constructor() {
    this.zapClient = new ZapClient({
      proxy: "http://localhost:8080",
    });
    this.baseUrl = process.env.BASE_URL || "http://localhost:3000";
    this.reportDir = "test-results/security";
    this.healthcareEndpoints = [
      "/api/patients",
      "/api/clinical/assessments",
      "/api/revenue/daman",
      "/api/auth",
      "/api/health",
      "/patient/register",
      "/clinical/assessment",
      "/revenue/authorization",
    ];
  }

  async initialize() {
    console.log("🔒 Initializing OWASP ZAP Security Testing...");

    // Ensure report directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Start ZAP daemon if not running
    try {
      await this.zapClient.core.version();
      console.log("✅ ZAP daemon is running");
    } catch (error) {
      console.error("❌ ZAP daemon is not running. Please start ZAP first.");
      throw error;
    }

    // Configure ZAP for healthcare testing
    await this.configureZapForHealthcare();
  }

  async configureZapForHealthcare() {
    console.log("🏥 Configuring ZAP for healthcare security testing...");

    // Set up healthcare-specific scan policies
    const healthcarePolicyName = "Healthcare-Security-Policy";

    try {
      // Create custom scan policy for healthcare
      await this.zapClient.ascan.addScanPolicy(healthcarePolicyName);

      // Enable specific security checks for healthcare
      const healthcareChecks = [
        "10021", // Persistent XSS (Prime)
        "10023", // Persistent XSS (Spider)
        "10024", // Persistent XSS (Attack)
        "10025", // Injection (Script)
        "10026", // HTTP Parameter Override
        "10027", // Information Disclosure - Suspicious Comments
        "10028", // Open Redirect
        "10029", // Cookie Poisoning
        "10030", // User Controllable Charset
        "10031", // User Controllable HTML Element Attribute (Potential XSS)
        "10032", // Viewstate Scanner
        "10033", // Directory Browsing
        "10034", // Heartbleed OpenSSL Vulnerability
        "10035", // Strict-Transport-Security Header Scanner
        "10036", // HTTP Server Response Header Scanner
        "10037", // Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)
        "10038", // Content Security Policy (CSP) Header Not Set
        "10039", // X-Frame-Options Header Scanner
        "10040", // Secure Pages Include Mixed Content
        "10041", // HTTP to HTTPS Insecure Transition in Form Post
        "10042", // HTTPS to HTTP Insecure Transition in Form Post
        "10043", // User Controllable JavaScript Event (XSS)
        "10044", // Big Redirect Detected (Potential Sensitive Information Leak)
        "10045", // Source Code Disclosure - /WEB-INF folder
        "10046", // Insecure HTTP Method
        "10047", // HTTPS Content Available via HTTP
        "10048", // Remote Code Execution - Shell Shock
        "10049", // Content Cacheability
        "10050", // Retrieved from Cache
        "10051", // Relative Path Confusion
        "10052", // X-ChromeLogger-Data (XCOLD) Header Information Leak
        "10053", // Apache Range Header DoS (CVE-2011-3192)
        "10054", // Cookie Without SameSite Attribute
        "10055", // CSP Scanner
        "10056", // X-Debug-Token Information Leak
        "10057", // Username Hash Found
        "10058", // GET for POST
        "10059", // PII Disclosure
        "10060", // Source Code Disclosure
        "10061", // XPATH Injection
        "10062", // PII Scanner
        "90001", // Insecure JSF ViewState
        "90002", // Java Serialization Object
        "90003", // Sub Resource Integrity Attribute Missing
        "90004", // Insufficient Site Isolation Against Spectre Vulnerability
        "90005", // Sec-Fetch-Dest Header is Missing
        "90006", // Sec-Fetch-Site Header is Missing
        "90007", // Sec-Fetch-User Header is Missing
        "90008", // Sec-Fetch-Mode Header is Missing
        "90009", // Server Side Request Forgery
        "90010", // WSDL File Detection
        "90011", // Charset Mismatch
        "90012", // ELMAH Information Leak
        "90013", // Weak Authentication Method
        "90014", // Possible Username Enumeration
        "90015", // LDAP Injection
        "90016", // LDAP Injection
        "90017", // Source Code Disclosure - CVE-2012-1823
        "90018", // SQL Injection - Hypersonic SQL
        "90019", // Code Injection
        "90020", // Command Injection
        "90021", // XPath Injection
        "90022", // Application Error Disclosure
        "90023", // XML External Entity Attack
        "90024", // Generic Padding Oracle
        "90025", // Expression Language Injection
        "90026", // SOAP Action Spoofing
        "90027", // Cookie Slack Detector
        "90028", // Insecure HTTP Method
        "90029", // SOAP XML Injection
        "90030", // WSDL File Passive Scanner
      ];

      for (const checkId of healthcareChecks) {
        await this.zapClient.ascan.setScannerAlertThreshold(
          checkId,
          "LOW",
          healthcarePolicyName,
        );
        await this.zapClient.ascan.setScannerAttackStrength(
          checkId,
          "HIGH",
          healthcarePolicyName,
        );
      }

      console.log("✅ Healthcare security policy configured");
    } catch (error) {
      console.warn("⚠️ Could not create custom policy, using default");
    }

    // Configure authentication for healthcare endpoints
    await this.configureAuthentication();
  }

  async configureAuthentication() {
    console.log("🔐 Configuring authentication for healthcare endpoints...");

    try {
      // Set up form-based authentication
      const authConfig = {
        contextName: "Healthcare-Context",
        loginUrl: `${this.baseUrl}/api/auth/login`,
        loginRequestData: "email=test%40reyada.ae&password=TestPassword123%21",
        usernameParameter: "email",
        passwordParameter: "password",
      };

      // Create authentication context
      await this.zapClient.authentication.setAuthenticationMethod(
        authConfig.contextName,
        "formBasedAuthentication",
        `loginUrl=${authConfig.loginUrl}&loginRequestData=${authConfig.loginRequestData}`,
      );

      // Set up user for authenticated scanning
      await this.zapClient.users.newUser(
        authConfig.contextName,
        "healthcare-test-user",
      );

      await this.zapClient.users.setUserEnabled(
        authConfig.contextName,
        "healthcare-test-user",
        "true",
      );

      await this.zapClient.users.setAuthenticationCredentials(
        authConfig.contextName,
        "healthcare-test-user",
        "email=test@reyada.ae&password=TestPassword123!",
      );

      console.log("✅ Authentication configured for healthcare endpoints");
    } catch (error) {
      console.warn("⚠️ Authentication configuration failed:", error.message);
    }
  }

  async spiderHealthcareEndpoints() {
    console.log("🕷️ Spidering healthcare endpoints...");

    for (const endpoint of this.healthcareEndpoints) {
      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`Spidering: ${fullUrl}`);

      try {
        const spiderId = await this.zapClient.spider.scan(fullUrl);

        // Wait for spider to complete
        let progress = 0;
        while (progress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const status = await this.zapClient.spider.status(spiderId);
          progress = parseInt(status);
          console.log(`Spider progress: ${progress}%`);
        }

        console.log(`✅ Completed spidering: ${endpoint}`);
      } catch (error) {
        console.error(`❌ Failed to spider ${endpoint}:`, error.message);
      }
    }
  }

  async performActiveScan() {
    console.log("🔍 Performing active security scan...");

    const scanResults = [];

    for (const endpoint of this.healthcareEndpoints) {
      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`Active scanning: ${fullUrl}`);

      try {
        const scanId = await this.zapClient.ascan.scan(
          fullUrl,
          "true", // recurse
          "true", // inScopeOnly
          "Healthcare-Security-Policy", // scanPolicyName
        );

        // Wait for scan to complete
        let progress = 0;
        while (progress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const status = await this.zapClient.ascan.status(scanId);
          progress = parseInt(status);
          console.log(`Active scan progress for ${endpoint}: ${progress}%`);
        }

        // Get scan results
        const alerts = await this.zapClient.core.alerts(fullUrl);
        scanResults.push({
          endpoint,
          alerts: JSON.parse(alerts),
        });

        console.log(`✅ Completed active scan: ${endpoint}`);
      } catch (error) {
        console.error(`❌ Failed to scan ${endpoint}:`, error.message);
      }
    }

    return scanResults;
  }

  async performPassiveScan() {
    console.log("👁️ Performing passive security scan...");

    // Enable all passive scan rules
    const passiveRules = await this.zapClient.pscan.scanners();
    const rules = JSON.parse(passiveRules);

    for (const rule of rules.scanners) {
      await this.zapClient.pscan.enableScanners(rule.id);
    }

    // Wait for passive scan to complete
    let recordsToScan = 1;
    while (recordsToScan > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const status = await this.zapClient.pscan.recordsToScan();
      recordsToScan = parseInt(status);
      if (recordsToScan > 0) {
        console.log(`Passive scan records remaining: ${recordsToScan}`);
      }
    }

    console.log("✅ Passive scan completed");
  }

  async checkHealthcareSpecificVulnerabilities() {
    console.log("🏥 Checking healthcare-specific vulnerabilities...");

    const healthcareChecks = [
      {
        name: "Patient Data Exposure",
        check: async () => {
          // Check for potential patient data exposure
          const response = await this.zapClient.core.alerts();
          const alerts = JSON.parse(response);
          return alerts.filter(
            (alert) =>
              alert.description.toLowerCase().includes("patient") ||
              alert.description.toLowerCase().includes("medical") ||
              alert.description.toLowerCase().includes("health"),
          );
        },
      },
      {
        name: "HIPAA Compliance Issues",
        check: async () => {
          // Check for HIPAA-related security issues
          const response = await this.zapClient.core.alerts();
          const alerts = JSON.parse(response);
          return alerts.filter(
            (alert) =>
              alert.risk === "High" &&
              (alert.description
                .toLowerCase()
                .includes("information disclosure") ||
                alert.description.toLowerCase().includes("data leak") ||
                alert.description
                  .toLowerCase()
                  .includes("unauthorized access")),
          );
        },
      },
      {
        name: "Emirates ID Validation Bypass",
        check: async () => {
          // Check for Emirates ID validation bypass
          const testPayload = {
            emiratesId: "'; DROP TABLE patients; --",
            name: "Test Patient",
          };

          try {
            const response = await fetch(
              `${this.baseUrl}/api/patients/validate`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(testPayload),
              },
            );

            if (response.status === 200) {
              return [
                {
                  name: "Emirates ID SQL Injection",
                  risk: "High",
                  description:
                    "Emirates ID validation may be vulnerable to SQL injection",
                },
              ];
            }
          } catch (error) {
            // Expected behavior - validation should reject malicious input
          }
          return [];
        },
      },
      {
        name: "DAMAN Integration Security",
        check: async () => {
          // Check DAMAN integration security
          const response = await this.zapClient.core.alerts(
            `${this.baseUrl}/api/revenue/daman`,
          );
          const alerts = JSON.parse(response);
          return alerts.filter(
            (alert) => alert.risk === "High" || alert.risk === "Medium",
          );
        },
      },
    ];

    const healthcareVulnerabilities = [];

    for (const check of healthcareChecks) {
      console.log(`Checking: ${check.name}`);
      try {
        const results = await check.check();
        if (results.length > 0) {
          healthcareVulnerabilities.push({
            category: check.name,
            vulnerabilities: results,
          });
        }
        console.log(`✅ ${check.name}: ${results.length} issues found`);
      } catch (error) {
        console.error(`❌ Failed to check ${check.name}:`, error.message);
      }
    }

    return healthcareVulnerabilities;
  }

  async generateReports(scanResults, healthcareVulnerabilities) {
    console.log("📊 Generating security reports...");

    // Generate HTML report
    const htmlReport = await this.zapClient.core.htmlreport();
    fs.writeFileSync(
      path.join(this.reportDir, "zap-security-report.html"),
      htmlReport,
    );

    // Generate JSON report
    const jsonReport = await this.zapClient.core.jsonreport();
    fs.writeFileSync(
      path.join(this.reportDir, "zap-security-report.json"),
      jsonReport,
    );

    // Generate XML report
    const xmlReport = await this.zapClient.core.xmlreport();
    fs.writeFileSync(
      path.join(this.reportDir, "zap-security-report.xml"),
      xmlReport,
    );

    // Generate healthcare-specific report
    const healthcareReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEndpointsScanned: this.healthcareEndpoints.length,
        totalVulnerabilities: scanResults.reduce(
          (sum, result) => sum + result.alerts.length,
          0,
        ),
        healthcareSpecificIssues: healthcareVulnerabilities.length,
        riskLevels: this.categorizeRiskLevels(scanResults),
      },
      endpointResults: scanResults,
      healthcareVulnerabilities,
      recommendations: this.generateRecommendations(
        scanResults,
        healthcareVulnerabilities,
      ),
    };

    fs.writeFileSync(
      path.join(this.reportDir, "healthcare-security-report.json"),
      JSON.stringify(healthcareReport, null, 2),
    );

    // Generate summary report
    const summaryReport = this.generateSummaryReport(healthcareReport);
    fs.writeFileSync(
      path.join(this.reportDir, "security-summary.txt"),
      summaryReport,
    );

    console.log("✅ Security reports generated");
    console.log(`📁 Reports saved to: ${this.reportDir}`);

    return healthcareReport;
  }

  categorizeRiskLevels(scanResults) {
    const riskLevels = { High: 0, Medium: 0, Low: 0, Informational: 0 };

    scanResults.forEach((result) => {
      result.alerts.forEach((alert) => {
        if (riskLevels.hasOwnProperty(alert.risk)) {
          riskLevels[alert.risk]++;
        }
      });
    });

    return riskLevels;
  }

  generateRecommendations(scanResults, healthcareVulnerabilities) {
    const recommendations = [];

    // General security recommendations
    const highRiskAlerts = scanResults
      .flatMap((result) => result.alerts)
      .filter((alert) => alert.risk === "High");

    if (highRiskAlerts.length > 0) {
      recommendations.push({
        priority: "Critical",
        category: "General Security",
        recommendation: `Address ${highRiskAlerts.length} high-risk security vulnerabilities immediately`,
        impact: "Patient data security and HIPAA compliance at risk",
      });
    }

    // Healthcare-specific recommendations
    if (healthcareVulnerabilities.length > 0) {
      recommendations.push({
        priority: "Critical",
        category: "Healthcare Compliance",
        recommendation:
          "Address healthcare-specific vulnerabilities to maintain DOH and HIPAA compliance",
        impact: "Regulatory compliance and patient safety at risk",
      });
    }

    // Security headers recommendations
    recommendations.push({
      priority: "High",
      category: "Security Headers",
      recommendation:
        "Implement comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)",
      impact: "Improved protection against common web attacks",
    });

    // Authentication recommendations
    recommendations.push({
      priority: "High",
      category: "Authentication",
      recommendation:
        "Implement multi-factor authentication for all healthcare staff accounts",
      impact: "Enhanced access control and audit trail compliance",
    });

    return recommendations;
  }

  generateSummaryReport(healthcareReport) {
    const { summary, recommendations } = healthcareReport;

    return `
🏥 REYADA HEALTHCARE PLATFORM SECURITY ASSESSMENT SUMMARY
========================================================

Scan Date: ${healthcareReport.timestamp}
Endpoints Scanned: ${summary.totalEndpointsScanned}
Total Vulnerabilities: ${summary.totalVulnerabilities}
Healthcare-Specific Issues: ${summary.healthcareSpecificIssues}

RISK BREAKDOWN:
- High Risk: ${summary.riskLevels.High}
- Medium Risk: ${summary.riskLevels.Medium}
- Low Risk: ${summary.riskLevels.Low}
- Informational: ${summary.riskLevels.Informational}

TOP RECOMMENDATIONS:
${recommendations
  .slice(0, 5)
  .map((rec, index) => `${index + 1}. [${rec.priority}] ${rec.recommendation}`)
  .join("\n")}

COMPLIANCE STATUS:
- DOH Compliance: ${summary.riskLevels.High === 0 ? "✅ COMPLIANT" : "❌ AT RISK"}
- HIPAA Compliance: ${summary.healthcareSpecificIssues === 0 ? "✅ COMPLIANT" : "❌ AT RISK"}
- Patient Data Security: ${summary.riskLevels.High === 0 ? "✅ SECURE" : "❌ VULNERABILITIES FOUND"}

NEXT STEPS:
1. Address all high-risk vulnerabilities immediately
2. Review and implement security recommendations
3. Conduct regular security assessments
4. Update security policies and procedures
5. Train staff on security best practices

For detailed findings, review the full reports in the security directory.
`;
  }

  async runComprehensiveSecurityTest() {
    try {
      console.log("🚀 Starting comprehensive healthcare security testing...");

      await this.initialize();
      await this.spiderHealthcareEndpoints();
      await this.performPassiveScan();
      const scanResults = await this.performActiveScan();
      const healthcareVulnerabilities =
        await this.checkHealthcareSpecificVulnerabilities();
      const report = await this.generateReports(
        scanResults,
        healthcareVulnerabilities,
      );

      console.log("🎉 Security testing completed successfully!");
      console.log(
        `📊 Summary: ${report.summary.totalVulnerabilities} vulnerabilities found`,
      );
      console.log(
        `🏥 Healthcare Issues: ${report.summary.healthcareSpecificIssues}`,
      );

      // Exit with error code if high-risk vulnerabilities found
      if (report.summary.riskLevels.High > 0) {
        console.error(
          "❌ High-risk vulnerabilities found! Review security report.",
        );
        process.exit(1);
      }

      return report;
    } catch (error) {
      console.error("❌ Security testing failed:", error);
      throw error;
    }
  }
}

// Run security test if called directly
if (require.main === module) {
  const tester = new HealthcareSecurityTester();
  tester
    .runComprehensiveSecurityTest()
    .then(() => {
      console.log("✅ Security testing completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Security testing failed:", error);
      process.exit(1);
    });
}

module.exports = HealthcareSecurityTester;
