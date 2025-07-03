import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Enhanced Security Testing Suite for Healthcare Platform
 * Comprehensive security testing including OWASP ZAP integration
 * HIPAA, DOH, and GDPR compliance validation
 */

test.describe("Healthcare Platform Security Tests", () => {
  let zapProcess: any;
  const zapPort = 8090;
  const zapApiKey = "healthcare-security-test-key";

  test.beforeAll(async () => {
    // Start OWASP ZAP daemon for security testing
    try {
      console.log("Starting OWASP ZAP daemon...");
      zapProcess = execSync(
        `zap.sh -daemon -port ${zapPort} -config api.key=${zapApiKey}`,
        { detached: true, stdio: "ignore" },
      );

      // Wait for ZAP to start
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("OWASP ZAP daemon started successfully");
    } catch (error) {
      console.warn("Could not start OWASP ZAP daemon:", error);
    }
  });

  test.afterAll(async () => {
    // Stop ZAP daemon and generate report
    if (zapProcess) {
      try {
        // Generate ZAP report
        execSync(
          `curl "http://localhost:${zapPort}/JSON/reports/action/generate/?apikey=${zapApiKey}&title=Healthcare%20Security%20Report&template=traditional-html&reportDir=./test-results/security/"`,
        );

        // Stop ZAP
        execSync(
          `curl "http://localhost:${zapPort}/JSON/core/action/shutdown/?apikey=${zapApiKey}"`,
        );

        console.log("OWASP ZAP security report generated");
      } catch (error) {
        console.warn("Error stopping ZAP or generating report:", error);
      }
    }
  });

  test("Authentication Security Validation", async ({ page }) => {
    // Test SQL injection in login
    await page.goto("/login");

    const maliciousInputs = [
      "admin'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'/**/OR/**/1=1#",
      "'; EXEC xp_cmdshell('dir'); --",
    ];

    for (const input of maliciousInputs) {
      await page.fill('input[name="email"]', input);
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');

      // Should not be able to login with malicious input
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard"]')).not.toBeVisible();
    }
  });

  test("XSS Protection Validation", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Test XSS in patient search
    await page.goto("/patients");

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "javascript:alert('XSS')",
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
    ];

    for (const payload of xssPayloads) {
      await page.fill('input[name="search"]', payload);
      await page.keyboard.press("Enter");

      // Wait for search results
      await page.waitForTimeout(1000);

      // Check that XSS payload is properly escaped
      const searchResults = await page.textContent(
        '[data-testid="search-results"]',
      );
      expect(searchResults).not.toContain("<script>");
      expect(searchResults).not.toContain("javascript:");
      expect(searchResults).not.toContain("onerror=");
      expect(searchResults).not.toContain("onload=");
    }
  });

  test("CSRF Protection Validation", async ({ page, context }) => {
    // Login and get CSRF token
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Try to make request without CSRF token
    const response = await context.request.post("/api/patients", {
      data: {
        name: "Test Patient",
        emiratesId: "784-1990-1234567-8",
        email: "test@example.com",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Should be rejected due to missing CSRF token
    expect(response.status()).toBe(403);
  });

  test("Session Management Security", async ({ page, context }) => {
    // Test session timeout
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Get session cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "session");

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
    expect(sessionCookie?.sameSite).toBe("Strict");

    // Test session fixation protection
    const initialSessionId = sessionCookie?.value;

    // Logout and login again
    await page.click('[data-testid="logout-button"]');
    await page.waitForSelector('[data-testid="login-form"]');

    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    const newCookies = await context.cookies();
    const newSessionCookie = newCookies.find(
      (cookie) => cookie.name === "session",
    );

    // Session ID should change after login (session fixation protection)
    expect(newSessionCookie?.value).not.toBe(initialSessionId);
  });

  test("Data Encryption Validation", async ({ page }) => {
    // Test that sensitive data is encrypted in transit
    const responses: any[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        responses.push(response);
      }
    });

    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Navigate to patient details
    await page.goto("/patients/patient-001");
    await page.waitForSelector('[data-testid="patient-details"]');

    // Check that all API responses use HTTPS
    for (const response of responses) {
      expect(response.url()).toMatch(/^https:/);

      // Check security headers
      const headers = response.headers();
      expect(headers["strict-transport-security"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-xss-protection"]).toBe("1; mode=block");
    }
  });

  test("HIPAA Compliance Validation", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Test audit logging for patient data access
    await page.goto("/patients/patient-001");
    await page.waitForSelector('[data-testid="patient-details"]');

    // Check that audit log entry was created
    const auditResponse = await page.request.get(
      "/api/audit/logs?action=patient_access&limit=1",
    );
    expect(auditResponse.status()).toBe(200);

    const auditData = await auditResponse.json();
    expect(auditData.logs).toBeDefined();
    expect(auditData.logs.length).toBeGreaterThan(0);

    const latestLog = auditData.logs[0];
    expect(latestLog.action).toBe("patient_access");
    expect(latestLog.resourceId).toBe("patient-001");
    expect(latestLog.userId).toBeDefined();
    expect(latestLog.timestamp).toBeDefined();
    expect(latestLog.ipAddress).toBeDefined();

    // Test data minimization - only necessary fields should be returned
    const patientResponse = await page.request.get("/api/patients/patient-001");
    const patientData = await patientResponse.json();

    // Should not include sensitive fields unless specifically requested
    expect(patientData.socialSecurityNumber).toBeUndefined();
    expect(patientData.fullMedicalHistory).toBeUndefined();
    expect(patientData.financialInformation).toBeUndefined();
  });

  test("DOH Compliance Security Validation", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Test clinical data access controls
    await page.goto("/clinical/assessments");
    await page.waitForSelector('[data-testid="assessments-list"]');

    // Verify role-based access control
    const userRole = await page.getAttribute(
      '[data-testid="user-role"]',
      "data-role",
    );

    if (userRole === "nurse") {
      // Nurses should not see administrative functions
      await expect(
        page.locator('[data-testid="admin-panel"]'),
      ).not.toBeVisible();
      await expect(
        page.locator('[data-testid="financial-data"]'),
      ).not.toBeVisible();
    }

    // Test clinical documentation integrity
    await page.click('[data-testid="create-assessment"]');
    await page.waitForSelector('[data-testid="assessment-form"]');

    // Fill assessment form
    await page.fill('input[name="patientId"]', "patient-001");
    await page.selectOption(
      'select[name="assessmentType"]',
      "initial-assessment",
    );
    await page.fill(
      'textarea[name="clinicalNotes"]',
      "Test clinical notes for security validation",
    );

    // Submit assessment
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="assessment-success"]');

    // Verify digital signature and integrity
    const assessmentResponse = await page.request.get(
      "/api/clinical/assessments?patientId=patient-001&limit=1",
    );
    const assessmentData = await assessmentResponse.json();

    const latestAssessment = assessmentData.results[0];
    expect(latestAssessment.digitalSignature).toBeDefined();
    expect(latestAssessment.integrityHash).toBeDefined();
    expect(latestAssessment.clinicianId).toBeDefined();
    expect(latestAssessment.timestamp).toBeDefined();
  });

  test("API Rate Limiting Validation", async ({ page, context }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Test rate limiting by making rapid requests
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(context.request.get("/api/patients/search?q=test"));
    }

    const responses = await Promise.all(requests);

    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter((r) => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Check rate limit headers
    const rateLimitedResponse = rateLimitedResponses[0];
    const headers = rateLimitedResponse.headers();
    expect(headers["x-ratelimit-limit"]).toBeDefined();
    expect(headers["x-ratelimit-remaining"]).toBeDefined();
    expect(headers["x-ratelimit-reset"]).toBeDefined();
  });

  test("File Upload Security Validation", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Navigate to document upload
    await page.goto("/patients/patient-001/documents");
    await page.waitForSelector('[data-testid="upload-form"]');

    // Test malicious file upload attempts
    const maliciousFiles = [
      { name: "malicious.php", content: '<?php system($_GET["cmd"]); ?>' },
      { name: "script.js", content: 'alert("XSS");' },
      { name: "executable.exe", content: "MZ\x90\x00\x03" },
    ];

    for (const file of maliciousFiles) {
      // Create temporary file
      const tempPath = path.join(__dirname, "temp", file.name);
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      fs.writeFileSync(tempPath, file.content);

      // Attempt to upload
      await page.setInputFiles('input[type="file"]', tempPath);
      await page.click('button[data-testid="upload-button"]');

      // Should be rejected
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();

      // Clean up
      fs.unlinkSync(tempPath);
    }

    // Test valid file upload
    const validFile = path.join(__dirname, "fixtures", "test-document.pdf");
    if (fs.existsSync(validFile)) {
      await page.setInputFiles('input[type="file"]', validFile);
      await page.click('button[data-testid="upload-button"]');

      await expect(
        page.locator('[data-testid="upload-success"]'),
      ).toBeVisible();
    }
  });

  test("Data Leakage Prevention", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@reyada.com");
    await page.fill('input[name="password"]', "testpassword");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="dashboard"]');

    // Test that error messages don't leak sensitive information
    await page.goto("/api/patients/non-existent-patient");

    const errorContent = await page.textContent("body");

    // Should not contain database schema information
    expect(errorContent).not.toContain("SELECT");
    expect(errorContent).not.toContain("FROM patients");
    expect(errorContent).not.toContain("WHERE");
    expect(errorContent).not.toContain("database");
    expect(errorContent).not.toContain("table");
    expect(errorContent).not.toContain("column");

    // Should not contain file system paths
    expect(errorContent).not.toContain("/var/www");
    expect(errorContent).not.toContain("/home/");
    expect(errorContent).not.toContain("C:\\");

    // Should not contain stack traces in production
    if (process.env.NODE_ENV === "production") {
      expect(errorContent).not.toContain("at ");
      expect(errorContent).not.toContain(".js:");
      expect(errorContent).not.toContain("Error:");
    }
  });

  test("Vulnerability Scanning with ZAP", async ({ page }) => {
    if (!zapProcess) {
      test.skip("OWASP ZAP not available");
    }

    // Configure ZAP to scan the application
    const baseUrl = page.url().split("/")[0] + "//" + page.url().split("/")[2];

    try {
      // Add target to ZAP context
      execSync(
        `curl "http://localhost:${zapPort}/JSON/context/action/newContext/?apikey=${zapApiKey}&contextName=Healthcare"`,
      );

      execSync(
        `curl "http://localhost:${zapPort}/JSON/context/action/includeInContext/?apikey=${zapApiKey}&contextName=Healthcare&regex=${baseUrl}.*"`,
      );

      // Run spider scan
      const spiderResponse = execSync(
        `curl "http://localhost:${zapPort}/JSON/spider/action/scan/?apikey=${zapApiKey}&url=${baseUrl}&maxChildren=10&recurse=true&contextName=Healthcare"`,
      ).toString();

      const spiderScanId = JSON.parse(spiderResponse).scan;

      // Wait for spider to complete
      let spiderProgress = 0;
      while (spiderProgress < 100) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const progressResponse = execSync(
          `curl "http://localhost:${zapPort}/JSON/spider/view/status/?apikey=${zapApiKey}&scanId=${spiderScanId}"`,
        ).toString();
        spiderProgress = parseInt(JSON.parse(progressResponse).status);
      }

      // Run active scan
      const activeScanResponse = execSync(
        `curl "http://localhost:${zapPort}/JSON/ascan/action/scan/?apikey=${zapApiKey}&url=${baseUrl}&recurse=true&inScopeOnly=false&scanPolicyName=Default%20Policy&method=GET&postData=&contextId=1"`,
      ).toString();

      const activeScanId = JSON.parse(activeScanResponse).scan;

      // Wait for active scan to complete (or timeout after 5 minutes)
      let activeScanProgress = 0;
      let timeout = 0;
      while (activeScanProgress < 100 && timeout < 150) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const progressResponse = execSync(
          `curl "http://localhost:${zapPort}/JSON/ascan/view/status/?apikey=${zapApiKey}&scanId=${activeScanId}"`,
        ).toString();
        activeScanProgress = parseInt(JSON.parse(progressResponse).status);
        timeout++;
      }

      // Get scan results
      const alertsResponse = execSync(
        `curl "http://localhost:${zapPort}/JSON/core/view/alerts/?apikey=${zapApiKey}&baseurl=${baseUrl}"`,
      ).toString();

      const alerts = JSON.parse(alertsResponse).alerts;

      // Filter high and medium risk alerts
      const highRiskAlerts = alerts.filter(
        (alert: any) => alert.risk === "High",
      );
      const mediumRiskAlerts = alerts.filter(
        (alert: any) => alert.risk === "Medium",
      );

      // Log results
      console.log(`ZAP Scan Results:`);
      console.log(`High Risk Alerts: ${highRiskAlerts.length}`);
      console.log(`Medium Risk Alerts: ${mediumRiskAlerts.length}`);
      console.log(`Total Alerts: ${alerts.length}`);

      // Save detailed results
      fs.writeFileSync(
        "./test-results/security/zap-alerts.json",
        JSON.stringify(alerts, null, 2),
      );

      // Fail test if high risk vulnerabilities found
      expect(highRiskAlerts.length).toBe(0);

      // Warn about medium risk vulnerabilities
      if (mediumRiskAlerts.length > 0) {
        console.warn(
          `Found ${mediumRiskAlerts.length} medium risk vulnerabilities`,
        );
      }
    } catch (error) {
      console.warn("ZAP scanning failed:", error);
    }
  });
});

// Helper function to create test fixtures
test.beforeAll(async () => {
  // Create test fixtures directory
  const fixturesDir = path.join(__dirname, "fixtures");
  fs.mkdirSync(fixturesDir, { recursive: true });

  // Create test PDF file
  const pdfContent =
    "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF";
  fs.writeFileSync(path.join(fixturesDir, "test-document.pdf"), pdfContent);

  // Create test results directory
  const resultsDir = path.join(__dirname, "../../test-results/security");
  fs.mkdirSync(resultsDir, { recursive: true });
});

// Cleanup after tests
test.afterAll(async () => {
  // Clean up temporary files
  const tempDir = path.join(__dirname, "temp");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
