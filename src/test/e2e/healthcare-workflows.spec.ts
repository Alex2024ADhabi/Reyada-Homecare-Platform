import { test, expect, Page } from "@playwright/test";
import { testHelpers } from "../utils/test-helpers";

/**
 * Healthcare Platform E2E Tests
 * Comprehensive end-to-end testing for healthcare workflows
 */

test.describe("Healthcare Platform - Core Workflows", () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // Navigate to the application
    await page.goto("/");

    // Wait for the application to load
    await page.waitForLoadState("networkidle");

    // Mock authentication for testing
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "test-token-123");
      localStorage.setItem("user_role", "clinician");
      localStorage.setItem(
        "user_permissions",
        JSON.stringify([
          "read:patients",
          "write:clinical",
          "read:revenue",
          "write:daman",
        ]),
      );
    });
  });

  test.describe("Patient Management Workflow", () => {
    test("should complete patient registration workflow", async () => {
      // Navigate to patient registration
      await page.click('[data-testid="patient-registration-btn"]');
      await expect(page).toHaveURL(/.*\/patients\/new/);

      // Fill patient basic information
      const patientData = testHelpers.generators.generateRandomPatient();

      await page.fill(
        '[data-testid="emirates-id-input"]',
        patientData.emiratesId,
      );
      await page.fill(
        '[data-testid="first-name-input"]',
        patientData.name.first,
      );
      await page.fill(
        '[data-testid="middle-name-input"]',
        patientData.name.middle,
      );
      await page.fill('[data-testid="last-name-input"]', patientData.name.last);
      await page.fill(
        '[data-testid="date-of-birth-input"]',
        patientData.dateOfBirth,
      );
      await page.selectOption(
        '[data-testid="gender-select"]',
        patientData.gender,
      );
      await page.selectOption(
        '[data-testid="nationality-select"]',
        patientData.nationality,
      );

      // Fill contact information
      await page.fill('[data-testid="phone-input"]', patientData.contact.phone);
      await page.fill('[data-testid="email-input"]', patientData.contact.email);
      await page.fill(
        '[data-testid="street-input"]',
        patientData.contact.address.street,
      );
      await page.fill(
        '[data-testid="city-input"]',
        patientData.contact.address.city,
      );
      await page.selectOption(
        '[data-testid="emirate-select"]',
        patientData.contact.address.emirate,
      );
      await page.fill(
        '[data-testid="postal-code-input"]',
        patientData.contact.address.postalCode,
      );

      // Fill insurance information
      await page.selectOption(
        '[data-testid="insurance-provider-select"]',
        patientData.insurance.provider,
      );
      await page.fill(
        '[data-testid="policy-number-input"]',
        patientData.insurance.policyNumber,
      );
      await page.fill(
        '[data-testid="expiry-date-input"]',
        patientData.insurance.expiryDate,
      );
      await page.selectOption(
        '[data-testid="membership-type-select"]',
        patientData.insurance.membershipType,
      );

      // Submit the form
      await page.click('[data-testid="submit-patient-btn"]');

      // Verify success message
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toContainText("Patient registered successfully");

      // Verify redirect to patient profile
      await expect(page).toHaveURL(/.*\/patients\/[a-zA-Z0-9-]+/);

      // Verify patient data is displayed correctly
      await expect(page.locator('[data-testid="patient-name"]')).toContainText(
        `${patientData.name.first} ${patientData.name.last}`,
      );
      await expect(
        page.locator('[data-testid="patient-emirates-id"]'),
      ).toContainText(patientData.emiratesId);
    });

    test("should validate Emirates ID format", async () => {
      await page.click('[data-testid="patient-registration-btn"]');

      // Test invalid Emirates ID formats
      const invalidEmiratesIds = [
        "123-456-789",
        "784-1990-123456-7",
        "784-1990-12345678-9",
        "invalid-id",
        "",
      ];

      for (const invalidId of invalidEmiratesIds) {
        await page.fill('[data-testid="emirates-id-input"]', invalidId);
        await page.blur('[data-testid="emirates-id-input"]');

        await expect(
          page.locator('[data-testid="emirates-id-error"]'),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="emirates-id-error"]'),
        ).toContainText("Invalid Emirates ID format");
      }

      // Test valid Emirates ID
      await page.fill(
        '[data-testid="emirates-id-input"]',
        "784-1990-1234567-8",
      );
      await page.blur('[data-testid="emirates-id-input"]');

      await expect(
        page.locator('[data-testid="emirates-id-error"]'),
      ).not.toBeVisible();
    });

    test("should search and filter patients", async () => {
      // Navigate to patient list
      await page.click('[data-testid="patients-list-btn"]');
      await expect(page).toHaveURL(/.*\/patients/);

      // Wait for patient list to load
      await page.waitForSelector('[data-testid="patient-list"]');

      // Test search functionality
      await page.fill('[data-testid="patient-search-input"]', "Ahmed");
      await page.click('[data-testid="search-btn"]');

      // Verify search results
      await expect(
        page.locator('[data-testid="patient-list-item"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('[data-testid="patient-list-item"]').first(),
      ).toContainText("Ahmed");

      // Test filter by insurance provider
      await page.selectOption('[data-testid="insurance-filter"]', "Daman");
      await page.click('[data-testid="apply-filters-btn"]');

      // Verify filtered results
      const patientItems = page.locator('[data-testid="patient-list-item"]');
      const count = await patientItems.count();

      for (let i = 0; i < count; i++) {
        await expect(
          patientItems.nth(i).locator('[data-testid="insurance-provider"]'),
        ).toContainText("Daman");
      }
    });
  });

  test.describe("Clinical Assessment Workflow", () => {
    test("should complete DOH 9-domain assessment", async () => {
      // Navigate to clinical assessments
      await page.click('[data-testid="clinical-assessments-btn"]');
      await page.click('[data-testid="new-assessment-btn"]');

      // Select patient
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]');

      // Select assessment type
      await page.selectOption(
        '[data-testid="assessment-type-select"]',
        "initial",
      );

      // Fill 9 domains as per DOH requirements
      const domains = [
        "Integumentary",
        "Respiratory",
        "Cardiovascular",
        "Neurological",
        "Musculoskeletal",
        "Genitourinary",
        "Gastrointestinal",
        "Psychosocial",
        "Environmental",
      ];

      for (let i = 0; i < domains.length; i++) {
        const domainIndex = i + 1;

        // Select score (1-4 scale)
        const score = Math.floor(Math.random() * 4) + 1;
        await page.selectOption(
          `[data-testid="domain-${domainIndex}-score"]`,
          score.toString(),
        );

        // Add clinical notes
        await page.fill(
          `[data-testid="domain-${domainIndex}-notes"]`,
          `Clinical assessment notes for ${domains[i]} domain - comprehensive evaluation completed.`,
        );
      }

      // Add overall clinical notes
      await page.fill(
        '[data-testid="clinical-notes-textarea"]',
        "Comprehensive clinical assessment completed. Patient requires skilled nursing care and monitoring. All domains assessed according to DOH standards.",
      );

      // Add recommendations
      await page.fill(
        '[data-testid="recommendations-textarea"]',
        "Recommend daily nursing visits for medication management and wound care. Follow-up assessment in 30 days.",
      );

      // Submit assessment
      await page.click('[data-testid="submit-assessment-btn"]');

      // Verify success and DOH compliance
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="doh-compliance-indicator"]'),
      ).toContainText("DOH Compliant");

      // Verify calculated risk level
      await expect(page.locator('[data-testid="risk-level"]')).toBeVisible();
      await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();
    });

    test("should validate assessment score calculations", async () => {
      await page.click('[data-testid="clinical-assessments-btn"]');
      await page.click('[data-testid="new-assessment-btn"]');

      // Select patient and assessment type
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]');
      await page.selectOption(
        '[data-testid="assessment-type-select"]',
        "initial",
      );

      // Set specific scores to test calculation
      const testScores = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // Total: 9 (High Risk)

      for (let i = 0; i < testScores.length; i++) {
        await page.selectOption(
          `[data-testid="domain-${i + 1}-score"]`,
          testScores[i].toString(),
        );
      }

      // Verify real-time calculation
      await expect(
        page.locator('[data-testid="overall-score-preview"]'),
      ).toContainText("9");
      await expect(
        page.locator('[data-testid="risk-level-preview"]'),
      ).toContainText("High");

      // Test moderate risk calculation
      await page.selectOption('[data-testid="domain-1-score"]', "3");
      await page.selectOption('[data-testid="domain-2-score"]', "3");
      await page.selectOption('[data-testid="domain-3-score"]', "3");

      // Total should now be 21 (Moderate Risk)
      await expect(
        page.locator('[data-testid="overall-score-preview"]'),
      ).toContainText("21");
      await expect(
        page.locator('[data-testid="risk-level-preview"]'),
      ).toContainText("Moderate");
    });
  });

  test.describe("DAMAN Authorization Workflow", () => {
    test("should submit DAMAN authorization request", async () => {
      // Navigate to revenue management
      await page.click('[data-testid="revenue-management-btn"]');
      await page.click('[data-testid="daman-authorizations-btn"]');
      await page.click('[data-testid="new-authorization-btn"]');

      // Select patient
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]');

      // Fill authorization details
      await page.selectOption(
        '[data-testid="service-type-select"]',
        "nursing-care",
      );
      await page.selectOption('[data-testid="duration-select"]', "30-days");
      await page.fill('[data-testid="estimated-cost-input"]', "15000");

      // Add clinical justification (minimum 50 characters as per DAMAN requirements)
      await page.fill(
        '[data-testid="clinical-justification-textarea"]',
        "Patient requires skilled nursing care for post-surgical wound management and medication administration. Clinical assessment indicates high-risk status requiring daily monitoring and specialized care interventions.",
      );

      // Add requested services
      await page.click('[data-testid="add-service-btn"]');
      await page.selectOption(
        '[data-testid="service-code-select-0"]',
        "17-25-1",
      );
      await page.fill(
        '[data-testid="service-description-input-0"]',
        "Skilled Nursing Visit - Wound Care",
      );
      await page.selectOption('[data-testid="frequency-select-0"]', "daily");
      await page.fill('[data-testid="unit-price-input-0"]', "300");

      // Digital signature
      await page.click('[data-testid="digital-signature-checkbox"]');

      // Submit authorization
      await page.click('[data-testid="submit-authorization-btn"]');

      // Verify submission success
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="reference-number"]'),
      ).toBeVisible();

      // Verify DAMAN compliance indicators
      await expect(
        page.locator('[data-testid="daman-compliance-status"]'),
      ).toContainText("Compliant");
    });

    test("should validate service codes and pricing", async () => {
      await page.click('[data-testid="revenue-management-btn"]');
      await page.click('[data-testid="daman-authorizations-btn"]');
      await page.click('[data-testid="new-authorization-btn"]');

      // Select patient
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]');

      // Add service with invalid pricing
      await page.click('[data-testid="add-service-btn"]');
      await page.selectOption(
        '[data-testid="service-code-select-0"]',
        "17-25-1",
      );
      await page.fill('[data-testid="unit-price-input-0"]', "999"); // Invalid price for this service code

      // Verify validation error
      await page.blur('[data-testid="unit-price-input-0"]');
      await expect(
        page.locator('[data-testid="pricing-error-0"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="pricing-error-0"]'),
      ).toContainText("Invalid pricing for service code");

      // Correct the pricing
      await page.fill('[data-testid="unit-price-input-0"]', "300"); // Correct price
      await page.blur('[data-testid="unit-price-input-0"]');

      // Verify error is cleared
      await expect(
        page.locator('[data-testid="pricing-error-0"]'),
      ).not.toBeVisible();
    });
  });

  test.describe("Claims Processing Workflow", () => {
    test("should create and submit insurance claim", async () => {
      // Navigate to claims
      await page.click('[data-testid="revenue-management-btn"]');
      await page.click('[data-testid="claims-btn"]');
      await page.click('[data-testid="new-claim-btn"]');

      // Select patient
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]');

      // Set billing period
      await page.fill('[data-testid="billing-start-date"]', "2024-01-01");
      await page.fill('[data-testid="billing-end-date"]', "2024-01-31");

      // Add service lines
      await page.click('[data-testid="add-service-line-btn"]');
      await page.selectOption(
        '[data-testid="service-code-select-0"]',
        "17-25-1",
      );
      await page.fill(
        '[data-testid="service-description-input-0"]',
        "Simple Home Visit - Nursing Service",
      );
      await page.fill('[data-testid="service-date-input-0"]', "2024-01-15");
      await page.fill('[data-testid="quantity-input-0"]', "1");
      await page.fill('[data-testid="unit-price-input-0"]', "300");

      // Verify total calculation
      await expect(page.locator('[data-testid="line-total-0"]')).toContainText(
        "300.00",
      );
      await expect(page.locator('[data-testid="claim-total"]')).toContainText(
        "300.00",
      );

      // Add authorization number
      await page.fill(
        '[data-testid="authorization-number-input"]',
        "DAM-2024-001",
      );

      // Submit claim
      await page.click('[data-testid="submit-claim-btn"]');

      // Verify submission
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="claim-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="claim-status"]')).toContainText(
        "Submitted",
      );
    });
  });

  test.describe("Dashboard and Analytics", () => {
    test("should display healthcare analytics dashboard", async () => {
      // Navigate to dashboard
      await page.click('[data-testid="dashboard-btn"]');

      // Verify key metrics are displayed
      await expect(
        page.locator('[data-testid="total-patients-metric"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="active-assessments-metric"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="pending-authorizations-metric"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="revenue-metrics"]'),
      ).toBeVisible();

      // Verify DOH compliance dashboard
      await expect(
        page.locator('[data-testid="doh-compliance-score"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="doh-compliance-chart"]'),
      ).toBeVisible();

      // Verify DAMAN integration status
      await expect(
        page.locator('[data-testid="daman-integration-status"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="daman-approval-rate"]'),
      ).toBeVisible();

      // Test date range filtering
      await page.click('[data-testid="date-range-picker"]');
      await page.click('[data-testid="last-30-days-option"]');

      // Verify dashboard updates
      await page.waitForLoadState("networkidle");
      await expect(
        page.locator('[data-testid="dashboard-loading"]'),
      ).not.toBeVisible();
    });

    test("should export healthcare reports", async () => {
      await page.click('[data-testid="dashboard-btn"]');
      await page.click('[data-testid="reports-btn"]');

      // Test DOH compliance report export
      await page.click('[data-testid="doh-report-btn"]');

      // Set report parameters
      await page.fill('[data-testid="report-start-date"]', "2024-01-01");
      await page.fill('[data-testid="report-end-date"]', "2024-01-31");
      await page.selectOption('[data-testid="report-format-select"]', "pdf");

      // Generate report
      const downloadPromise = page.waitForEvent("download");
      await page.click('[data-testid="generate-report-btn"]');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain("doh-compliance-report");
      expect(download.suggestedFilename()).toContain(".pdf");
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should work on mobile devices", async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-btn"]');
      await expect(
        page.locator('[data-testid="mobile-nav-menu"]'),
      ).toBeVisible();

      // Test patient registration on mobile
      await page.click('[data-testid="mobile-patients-btn"]');
      await page.click('[data-testid="mobile-new-patient-btn"]');

      // Verify form is mobile-optimized
      await expect(page.locator('[data-testid="patient-form"]')).toHaveCSS(
        "display",
        "flex",
      );
      await expect(page.locator('[data-testid="patient-form"]')).toHaveCSS(
        "flex-direction",
        "column",
      );

      // Test mobile-specific features
      await expect(
        page.locator('[data-testid="mobile-camera-btn"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="mobile-voice-input-btn"]'),
      ).toBeVisible();
    });
  });

  test.describe("Offline Functionality", () => {
    test("should handle offline scenarios", async () => {
      // Go offline
      await page.context().setOffline(true);

      // Try to access patient data
      await page.click('[data-testid="patients-list-btn"]');

      // Verify offline indicator
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="offline-message"]'),
      ).toContainText("You are currently offline");

      // Verify cached data is still accessible
      await expect(
        page.locator('[data-testid="cached-patients-list"]'),
      ).toBeVisible();

      // Go back online
      await page.context().setOffline(false);

      // Verify sync indicator
      await expect(
        page.locator('[data-testid="sync-indicator"]'),
      ).toBeVisible();
      await page.waitForSelector('[data-testid="sync-complete"]', {
        timeout: 10000,
      });
    });
  });
});

// Performance and accessibility tests
test.describe("Performance and Accessibility", () => {
  test("should meet performance benchmarks", async ({ page }) => {
    // Start performance monitoring
    await page.goto("/", { waitUntil: "networkidle" });

    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint:
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime || 0,
      };
    });

    // Verify performance thresholds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(performanceMetrics.loadComplete).toBeLessThan(3000); // 3 seconds
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
  });

  test("should be accessible to screen readers", async ({ page }) => {
    await page.goto("/");

    // Check for proper ARIA labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const textContent = await button.textContent();

      // Each button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }

    // Check for proper heading structure
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // Verify main landmark
    await expect(page.locator("main")).toBeVisible();

    // Check for skip links
    await expect(page.locator('[data-testid="skip-to-main"]')).toBeVisible();
  });
});
