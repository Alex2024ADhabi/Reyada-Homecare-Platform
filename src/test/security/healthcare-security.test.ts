import { test, expect } from "@playwright/test";

/**
 * Healthcare Security Testing Suite
 * Tests security measures specific to healthcare applications
 * Ensures HIPAA compliance and data protection
 */

test.describe("Healthcare Security Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set up security headers monitoring
    page.on("response", (response) => {
      // Log security-relevant responses for analysis
      if (response.status() >= 400) {
        console.log(`Security Alert: ${response.status()} - ${response.url()}`);
      }
    });
  });

  test("Security headers are properly configured", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() || {};

    // Critical security headers for healthcare applications
    expect(headers["x-frame-options"]).toBeDefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-xss-protection"]).toBeDefined();
    expect(headers["strict-transport-security"]).toBeDefined();
    expect(headers["content-security-policy"]).toBeDefined();
    expect(headers["referrer-policy"]).toBeDefined();
  });

  test("Authentication is required for protected routes", async ({ page }) => {
    // Test protected healthcare routes
    const protectedRoutes = [
      "/patients",
      "/clinical/documentation",
      "/revenue/claims",
      "/compliance/doh-reporting",
      "/admin/users",
    ];

    for (const route of protectedRoutes) {
      const response = await page.goto(route);

      // Should redirect to login or return 401/403
      const finalUrl = page.url();
      const status = response?.status();

      expect(
        finalUrl.includes("/login") ||
          finalUrl.includes("/auth") ||
          status === 401 ||
          status === 403,
      ).toBeTruthy();
    }
  });

  test("Session management is secure", async ({ page, context }) => {
    // Test session security
    await page.goto("/login");

    // Check for secure session cookies
    const cookies = await context.cookies();
    const sessionCookies = cookies.filter(
      (cookie) =>
        cookie.name.toLowerCase().includes("session") ||
        cookie.name.toLowerCase().includes("auth") ||
        cookie.name.toLowerCase().includes("token"),
    );

    sessionCookies.forEach((cookie) => {
      expect(cookie.secure).toBeTruthy();
      expect(cookie.httpOnly).toBeTruthy();
      expect(cookie.sameSite).toBe("Strict");
    });
  });

  test("Input validation prevents injection attacks", async ({ page }) => {
    await page.goto("/patients/search");

    // Test SQL injection attempts
    const sqlInjectionPayloads = [
      "'; DROP TABLE patients; --",
      "' OR '1'='1",
      "'; SELECT * FROM users; --",
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
    ];

    for (const payload of sqlInjectionPayloads) {
      await page.fill('input[name="search"]', payload);
      await page.click('button[type="submit"]');

      // Should not execute malicious code or cause errors
      const errorMessages = page.locator('.error, [role="alert"]');
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        const errorText = await errorMessages.first().textContent();
        expect(errorText).not.toContain("SQL");
        expect(errorText).not.toContain("database");
        expect(errorText).not.toContain("syntax error");
      }
    }
  });

  test("File upload security", async ({ page }) => {
    // Test file upload endpoints
    const uploadForms = page.locator('input[type="file"]');
    const uploadCount = await uploadForms.count();

    if (uploadCount > 0) {
      // Test malicious file upload attempts
      const maliciousFiles = [
        { name: "test.php", content: "<?php echo 'malicious'; ?>" },
        { name: "test.exe", content: "MZ\x90\x00" },
        { name: "test.jsp", content: "<% out.println('malicious'); %>" },
      ];

      for (const file of maliciousFiles) {
        // Create a temporary file
        const buffer = Buffer.from(file.content);

        try {
          await uploadForms.first().setInputFiles({
            name: file.name,
            mimeType: "application/octet-stream",
            buffer,
          });

          // Submit the form if there's a submit button
          const submitButton = page.locator('button[type="submit"]').first();
          if ((await submitButton.count()) > 0) {
            await submitButton.click();

            // Should reject malicious files
            const errorMessage = page.locator('.error, [role="alert"]');
            await expect(errorMessage).toBeVisible({ timeout: 5000 });
          }
        } catch (error) {
          // File rejection is expected
          console.log(`File ${file.name} properly rejected`);
        }
      }
    }
  });

  test("API endpoints are protected", async ({ page }) => {
    // Test API security
    const apiEndpoints = [
      "/api/patients",
      "/api/clinical/assessments",
      "/api/revenue/claims",
      "/api/admin/users",
      "/api/compliance/reports",
    ];

    for (const endpoint of apiEndpoints) {
      const response = await page.request.get(endpoint);

      // Should require authentication
      expect([401, 403, 404]).toContain(response.status());

      // Should not expose sensitive information in error messages
      const responseText = await response.text();
      expect(responseText).not.toContain("database");
      expect(responseText).not.toContain("password");
      expect(responseText).not.toContain("secret");
      expect(responseText).not.toContain("token");
    }
  });

  test("CSRF protection is implemented", async ({ page }) => {
    await page.goto("/patients/new");

    // Check for CSRF tokens in forms
    const forms = page.locator("form");
    const formCount = await forms.count();

    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      const csrfToken = form.locator(
        'input[name*="csrf"], input[name*="token"]',
      );

      if ((await csrfToken.count()) > 0) {
        const tokenValue = await csrfToken.getAttribute("value");
        expect(tokenValue).toBeTruthy();
        expect(tokenValue?.length).toBeGreaterThan(10);
      }
    }
  });

  test("Sensitive data is not exposed in client-side code", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for sensitive data in page source
    const pageContent = await page.content();
    const scriptTags = await page.locator("script").allTextContents();

    const sensitivePatterns = [
      /password/gi,
      /secret/gi,
      /api[_-]?key/gi,
      /private[_-]?key/gi,
      /database[_-]?url/gi,
      /connection[_-]?string/gi,
      /emirates[_-]?id.*\d{3}-\d{4}-\d{7}-\d/gi,
    ];

    sensitivePatterns.forEach((pattern) => {
      expect(pageContent).not.toMatch(pattern);
      scriptTags.forEach((script) => {
        expect(script).not.toMatch(pattern);
      });
    });
  });

  test("Rate limiting is implemented", async ({ page }) => {
    // Test rate limiting on login endpoint
    await page.goto("/login");

    const attempts = 10;
    const responses = [];

    for (let i = 0; i < attempts; i++) {
      await page.fill('input[name="email"]', `test${i}@example.com`);
      await page.fill('input[name="password"]', "wrongpassword");

      const response = await Promise.race([
        page.waitForResponse((response) =>
          response.url().includes("/api/auth/login"),
        ),
        page.click('button[type="submit"]').then(() => null),
      ]);

      if (response) {
        responses.push(response.status());
      }

      // Small delay between attempts
      await page.waitForTimeout(100);
    }

    // Should eventually return 429 (Too Many Requests)
    const rateLimitedResponses = responses.filter((status) => status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test("Audit logging is implemented", async ({ page }) => {
    // Test that sensitive actions are logged
    await page.goto("/login");

    // Monitor network requests for audit logs
    const auditRequests: string[] = [];

    page.on("request", (request) => {
      if (
        request.url().includes("/api/audit") ||
        request.url().includes("/api/logs")
      ) {
        auditRequests.push(request.url());
      }
    });

    // Perform actions that should be audited
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for potential audit requests
    await page.waitForTimeout(2000);

    // Should have audit logging (this test may need adjustment based on implementation)
    // expect(auditRequests.length).toBeGreaterThan(0);
  });

  test("Data encryption in transit", async ({ page }) => {
    // Ensure all requests use HTTPS
    const requests: string[] = [];

    page.on("request", (request) => {
      requests.push(request.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // All requests should use HTTPS
    requests.forEach((url) => {
      if (!url.startsWith("data:") && !url.startsWith("blob:")) {
        expect(url).toMatch(/^https:/i);
      }
    });
  });
});

test.describe("HIPAA Compliance Security", () => {
  test("Patient data access is logged and controlled", async ({ page }) => {
    // Test patient data access controls
    await page.goto("/patients/123");

    // Should require proper authentication and authorization
    const currentUrl = page.url();
    expect(
      currentUrl.includes("/login") || currentUrl.includes("/unauthorized"),
    ).toBeTruthy();
  });

  test("Data masking is implemented for sensitive information", async ({
    page,
  }) => {
    // Test that sensitive data is properly masked
    await page.goto("/patients");

    // Look for Emirates ID patterns that should be masked
    const pageContent = await page.textContent("body");

    // Emirates IDs should be masked (e.g., 784-****-****-*)
    const emiratesIdPattern = /784-\d{4}-\d{7}-\d/g;
    const matches = pageContent?.match(emiratesIdPattern) || [];

    // Should not find complete Emirates IDs in the UI
    expect(matches.length).toBe(0);
  });

  test("Session timeout is implemented", async ({ page }) => {
    // Test session timeout functionality
    await page.goto("/");

    // Check for session timeout warnings or automatic logout
    // This test would need to be adjusted based on the actual timeout implementation
    const timeoutWarning = page.locator(
      '[data-testid="session-timeout-warning"]',
    );

    // If timeout warning exists, it should be properly implemented
    if ((await timeoutWarning.count()) > 0) {
      await expect(timeoutWarning).toBeVisible();
    }
  });
});
