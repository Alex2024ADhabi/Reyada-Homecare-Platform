import { test, expect, Page, BrowserContext } from "@playwright/test";
import { HealthcareTestData } from "../fixtures/healthcare-test-data";

/**
 * Comprehensive End-to-End Healthcare Workflow Tests
 * Covers critical patient management, clinical documentation, and compliance workflows
 */

class HealthcareWorkflowPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto("/login");
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForSelector('[data-testid="dashboard"]', {
      timeout: 10000,
    });
  }

  async navigateToPatients() {
    await this.page.click('[data-testid="nav-patients"]');
    await this.page.waitForSelector('[data-testid="patient-management"]');
  }

  async createPatient(patientData: any) {
    await this.page.click('[data-testid="new-patient-button"]');
    await this.page.waitForSelector('[data-testid="patient-form"]');

    // Fill patient demographics
    await this.page.fill(
      '[data-testid="patient-name"]',
      `${patientData.name.first} ${patientData.name.last}`,
    );
    await this.page.fill('[data-testid="emirates-id"]', patientData.emiratesId);
    await this.page.fill('[data-testid="phone"]', patientData.contact.phone);
    await this.page.fill('[data-testid="email"]', patientData.contact.email);
    await this.page.fill(
      '[data-testid="address"]',
      patientData.contact.address.street,
    );

    // Submit form
    await this.page.click('[data-testid="submit-patient"]');
    await this.page.waitForSelector('[data-testid="patient-success-message"]');
  }

  async navigateToClinical() {
    await this.page.click('[data-testid="nav-clinical"]');
    await this.page.waitForSelector('[data-testid="clinical-dashboard"]');
  }

  async createClinicalAssessment(assessmentData: any) {
    await this.page.click('[data-testid="new-assessment-button"]');
    await this.page.waitForSelector('[data-testid="assessment-form"]');

    // Fill 9-domain assessment
    for (let i = 1; i <= 9; i++) {
      const domainKey = `domain${i}`;
      if (assessmentData.domains[domainKey]) {
        await this.page.selectOption(
          `[data-testid="domain-${i}-score"]`,
          assessmentData.domains[domainKey].score.toString(),
        );
      }
    }

    await this.page.fill(
      '[data-testid="clinical-notes"]',
      assessmentData.clinicalNotes,
    );

    // Add digital signature
    const signatureCanvas = this.page.locator(
      '[data-testid="signature-canvas"]',
    );
    if ((await signatureCanvas.count()) > 0) {
      await signatureCanvas.click({ position: { x: 50, y: 50 } });
      await signatureCanvas.dragTo(signatureCanvas, {
        sourcePosition: { x: 50, y: 50 },
        targetPosition: { x: 150, y: 100 },
      });
    }

    await this.page.click('[data-testid="submit-assessment"]');
    await this.page.waitForSelector(
      '[data-testid="assessment-success-message"]',
    );
  }

  async navigateToDaman() {
    await this.page.click('[data-testid="nav-revenue"]');
    await this.page.click('[data-testid="nav-daman"]');
    await this.page.waitForSelector('[data-testid="daman-dashboard"]');
  }

  async submitDamanAuthorization(authData: any) {
    await this.page.click('[data-testid="new-authorization-button"]');
    await this.page.waitForSelector('[data-testid="daman-form"]');

    await this.page.fill('[data-testid="patient-id"]', authData.patientId);
    await this.page.selectOption(
      '[data-testid="service-type"]',
      authData.serviceType,
    );
    await this.page.fill(
      '[data-testid="duration"]',
      authData.requestedDuration.replace("-days", ""),
    );
    await this.page.fill(
      '[data-testid="clinical-justification"]',
      authData.clinicalJustification,
    );

    // Upload required documents
    const documents = [
      "auth-request-form",
      "medical-report",
      "face-to-face-assessment",
    ];
    for (const doc of documents) {
      const fileInput = this.page.locator(`[data-testid="upload-${doc}"]`);
      if ((await fileInput.count()) > 0) {
        await fileInput.setInputFiles({
          name: `${doc}.pdf`,
          mimeType: "application/pdf",
          buffer: Buffer.from("Mock PDF content"),
        });
      }
    }

    await this.page.click('[data-testid="submit-authorization"]');
    await this.page.waitForSelector(
      '[data-testid="submission-success-message"]',
    );
  }
}

test.describe("Healthcare Workflow E2E Tests", () => {
  let healthcarePage: HealthcareWorkflowPage;
  let testData: HealthcareTestData;

  test.beforeEach(async ({ page }) => {
    healthcarePage = new HealthcareWorkflowPage(page);
    testData = new HealthcareTestData();
  });

  test.describe("Patient Management Workflows", () => {
    test("should complete full patient registration workflow", async ({
      page,
    }) => {
      const patientData = testData.getPatientData();

      await healthcarePage.login("testuser@reyada.com", "testpassword");
      await healthcarePage.navigateToPatients();
      await healthcarePage.createPatient(patientData);

      // Verify patient appears in list
      await expect(page.locator('[data-testid="patient-list"]')).toContainText(
        patientData.name.first,
      );
    });

    test("should validate Emirates ID format", async ({ page }) => {
      const scenarios = testData.getEmiratesIdValidationScenarios();

      await healthcarePage.login("testuser@reyada.com", "testpassword");
      await healthcarePage.navigateToPatients();

      for (const scenario of scenarios) {
        if (!scenario.valid) {
          await page.click('[data-testid="new-patient-button"]');
          await page.fill('[data-testid="patient-name"]', "Test Patient");
          await page.fill('[data-testid="emirates-id"]', scenario.id);
          await page.click('[data-testid="submit-patient"]');

          if (scenario.id !== "") {
            await expect(
              page.locator('[data-testid="emirates-id-error"]'),
            ).toContainText("Invalid Emirates ID format");
          }

          // Close form for next iteration
          const cancelButton = page.locator('[data-testid="cancel-patient"]');
          if ((await cancelButton.count()) > 0) {
            await cancelButton.click();
          }
        }
      }
    });

    test("should handle patient search functionality", async ({ page }) => {
      await healthcarePage.login("testuser@reyada.com", "testpassword");
      await healthcarePage.navigateToPatients();

      const searchTerm = "Ahmed";
      const searchInput = page.locator('[data-testid="patient-search"]');
      if ((await searchInput.count()) > 0) {
        await searchInput.fill(searchTerm);
        await searchInput.press("Enter");

        await expect(
          page.locator('[data-testid="search-results"]'),
        ).toBeVisible();
      }
    });
  });

  test.describe("Clinical Documentation Workflows", () => {
    test("should complete 9-domain clinical assessment", async ({ page }) => {
      const assessmentData = testData.getClinicalAssessmentData();

      await healthcarePage.login("clinician@reyada.com", "testpassword");
      await healthcarePage.navigateToClinical();
      await healthcarePage.createClinicalAssessment(assessmentData);

      // Verify DOH compliance validation
      await expect(
        page.locator('[data-testid="compliance-status-passed"]'),
      ).toBeVisible();
    });

    test("should handle offline clinical documentation", async ({
      page,
      context,
    }) => {
      await healthcarePage.login("clinician@reyada.com", "testpassword");
      await healthcarePage.navigateToClinical();

      // Simulate offline mode
      await context.setOffline(true);

      await page.click('[data-testid="new-assessment-button"]');
      await page.fill(
        '[data-testid="clinical-notes"]',
        "Offline assessment notes",
      );
      await page.click('[data-testid="submit-assessment"]');

      await expect(
        page.locator('[data-testid="offline-save-message"]'),
      ).toBeVisible();

      // Simulate coming back online
      await context.setOffline(false);
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible({
        timeout: 10000,
      });
    });

    test("should validate mandatory clinical fields", async ({ page }) => {
      await healthcarePage.login("clinician@reyada.com", "testpassword");
      await healthcarePage.navigateToClinical();

      await page.click('[data-testid="new-assessment-button"]');
      await page.click('[data-testid="submit-assessment"]');

      // Should show validation errors for required fields
      await expect(
        page.locator('[data-testid="validation-errors"]'),
      ).toBeVisible();
    });
  });

  test.describe("Daman Authorization Workflows", () => {
    test("should complete Daman authorization submission", async ({ page }) => {
      const authData = testData.getDamanAuthorizationData();

      await healthcarePage.login("admin@reyada.com", "testpassword");
      await healthcarePage.navigateToDaman();
      await healthcarePage.submitDamanAuthorization(authData);

      // Verify reference number is generated
      const referenceNumber = await page
        .locator('[data-testid="reference-number"]')
        .textContent();
      expect(referenceNumber).toMatch(/DAM-\d{4}-\d{3}/);
    });

    test("should validate DOH 2025 compliance requirements", async ({
      page,
    }) => {
      const scenarios = testData.getDOH2025ComplianceScenarios();

      await healthcarePage.login("admin@reyada.com", "testpassword");
      await healthcarePage.navigateToDaman();

      for (const scenario of scenarios) {
        if (!scenario.valid) {
          await page.click('[data-testid="new-authorization-button"]');

          if (scenario.scenario === "MSC Plan Extension") {
            await page.selectOption(
              '[data-testid="service-type"]',
              "msc-plan-extension",
            );
            await page.fill(
              '[data-testid="requested-duration"]',
              scenario.duration.toString(),
            );
            await page.click('[data-testid="submit-authorization"]');

            await expect(
              page.locator('[data-testid="msc-duration-error"]'),
            ).toContainText("MSC duration exceeds 90-day limit");
          }

          if (scenario.scenario === "Wheelchair Request Post May 2025") {
            await page.selectOption(
              '[data-testid="service-type"]',
              "wheelchair-request",
            );
            await page.fill(
              '[data-testid="request-date"]',
              scenario.requestDate,
            );
            await page.click('[data-testid="submit-authorization"]');

            await expect(
              page.locator('[data-testid="wheelchair-preapproval-error"]'),
            ).toContainText("Wheelchair pre-approval form is mandatory");
          }

          // Reset form for next iteration
          const cancelButton = page.locator(
            '[data-testid="cancel-authorization"]',
          );
          if ((await cancelButton.count()) > 0) {
            await cancelButton.click();
          }
        }
      }
    });
  });

  test.describe("Revenue Management Workflows", () => {
    test("should complete claim submission workflow", async ({ page }) => {
      const claimData = testData.getClaimData();

      await healthcarePage.login("billing@reyada.com", "testpassword");
      await page.click('[data-testid="nav-revenue"]');
      await page.click('[data-testid="nav-claims"]');
      await page.waitForSelector('[data-testid="claims-dashboard"]');

      await page.click('[data-testid="new-claim-button"]');
      await page.fill('[data-testid="patient-id"]', claimData.patientId);
      await page.selectOption(
        '[data-testid="claim-type"]',
        claimData.claimType,
      );
      await page.fill(
        '[data-testid="billing-period"]',
        claimData.billingPeriod,
      );

      // Add service line
      await page.click('[data-testid="add-service-line"]');
      await page.fill('[data-testid="service-code"]', claimData.serviceCode);
      await page.fill('[data-testid="unit-price"]', claimData.unitPrice);

      await page.click('[data-testid="submit-claim"]');
      await expect(
        page.locator('[data-testid="claim-success-message"]'),
      ).toBeVisible();

      const claimNumber = await page
        .locator('[data-testid="claim-number"]')
        .textContent();
      expect(claimNumber).toMatch(/CLM-\d{4}-\d{3}/);
    });

    test("should validate service code pricing compliance", async ({
      page,
    }) => {
      const scenarios = testData.getServiceCodePricingScenarios();

      await healthcarePage.login("billing@reyada.com", "testpassword");
      await page.click('[data-testid="nav-revenue"]');
      await page.click('[data-testid="nav-claims"]');

      for (const scenario of scenarios) {
        if (!scenario.valid) {
          await page.click('[data-testid="new-claim-button"]');
          await page.click('[data-testid="add-service-line"]');
          await page.fill('[data-testid="service-code"]', scenario.code);
          await page.fill(
            '[data-testid="unit-price"]',
            scenario.testPrice.toString(),
          );
          await page.click('[data-testid="submit-claim"]');

          await expect(
            page.locator('[data-testid="pricing-error"]'),
          ).toContainText(`Incorrect pricing for ${scenario.code}`);

          // Reset form
          const cancelButton = page.locator('[data-testid="cancel-claim"]');
          if ((await cancelButton.count()) > 0) {
            await cancelButton.click();
          }
        }
      }
    });
  });

  test.describe("Error Handling and Recovery", () => {
    test("should handle network errors gracefully", async ({
      page,
      context,
    }) => {
      await healthcarePage.login("testuser@reyada.com", "testpassword");

      // Simulate network failure
      await context.route("**/api/**", (route) => route.abort());

      await healthcarePage.navigateToPatients();
      await page.click('[data-testid="new-patient-button"]');
      await page.fill('[data-testid="patient-name"]', "Test Patient");
      await page.click('[data-testid="submit-patient"]');

      await expect(
        page.locator('[data-testid="network-error-message"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test("should handle session expiration", async ({ page, context }) => {
      await healthcarePage.login("testuser@reyada.com", "testpassword");

      // Clear authentication tokens
      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/patients");
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="session-expired-message"]'),
      ).toContainText("session has expired");
    });
  });

  test.describe("Performance and Accessibility", () => {
    test("should meet performance benchmarks", async ({ page }) => {
      await healthcarePage.login("testuser@reyada.com", "testpassword");

      const startTime = Date.now();
      await healthcarePage.navigateToPatients();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should be accessible to screen readers", async ({ page }) => {
      await page.goto("/login");

      // Check for proper ARIA labels
      await expect(page.locator('[aria-label="Email address"]')).toBeVisible();
      await expect(page.locator('[aria-label="Password"]')).toBeVisible();

      // Check for proper heading structure
      await expect(page.locator("h1")).toBeVisible();
    });
  });

  test.describe("Healthcare Compliance Integration", () => {
    test("should validate real-time compliance monitoring", async ({
      page,
    }) => {
      await healthcarePage.login("compliance@reyada.com", "testpassword");

      // Navigate to compliance dashboard
      await page.click('[data-testid="nav-compliance"]');
      await page.waitForSelector('[data-testid="compliance-dashboard"]');

      // Check overall compliance score
      const complianceScore = await page
        .locator('[data-testid="overall-compliance-score"]')
        .textContent();
      expect(parseInt(complianceScore || "0")).toBeGreaterThan(85);

      // Verify DOH 2025 compliance tracking
      const dohScore = await page
        .locator('[data-testid="doh-compliance-score"]')
        .textContent();
      expect(parseInt(dohScore || "0")).toBeGreaterThan(90);
    });

    test("should validate automated quality assurance checks", async ({
      page,
    }) => {
      await healthcarePage.login("qa@reyada.com", "testpassword");

      // Navigate to quality control dashboard
      await page.click('[data-testid="nav-quality"]');
      await page.waitForSelector('[data-testid="quality-control-dashboard"]');

      // Verify automated QA checks are running
      const qaChecks = await page.$$eval(
        '[data-testid^="qa-check-"]',
        (elements) =>
          elements.map((el) => ({
            id: el.getAttribute("data-testid"),
            status: el.getAttribute("data-status"),
            coverage: el.getAttribute("data-coverage"),
          })),
      );

      expect(qaChecks.length).toBeGreaterThan(5);

      // Verify coverage metrics
      const avgCoverage =
        qaChecks.reduce(
          (sum, check) => sum + parseFloat(check.coverage || "0"),
          0,
        ) / qaChecks.length;
      expect(avgCoverage).toBeGreaterThan(85);
    });

    test("should validate comprehensive audit trail functionality", async ({
      page,
    }) => {
      await healthcarePage.login("auditor@reyada.com", "testpassword");

      // Navigate to audit trail
      await page.click('[data-testid="nav-compliance"]');
      await page.click('[data-testid="nav-audit"]');
      await page.waitForSelector('[data-testid="audit-trail"]');

      // Verify audit entries are being logged
      const auditEntries = await page.$$eval(
        '[data-testid^="audit-entry-"]',
        (elements) => elements.length,
      );
      expect(auditEntries).toBeGreaterThan(0);

      // Test audit trail filtering and search
      await page.fill('[data-testid="audit-search"]', "daman");
      await page.waitForTimeout(1000);

      const filteredEntries = await page.$$eval(
        '[data-testid^="audit-entry-"]:not([style*="display: none"])',
        (elements) => elements.length,
      );
      expect(filteredEntries).toBeLessThanOrEqual(auditEntries);

      // Test audit export functionality
      await page.click('[data-testid="export-audit"]');
      await page.waitForTimeout(2000);

      const exportStatus = await page
        .locator('[data-testid="export-status"]')
        .textContent();
      expect(exportStatus).toContain("Export completed");
    });
  });
});
