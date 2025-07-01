import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y, getViolations } from "axe-playwright";

/**
 * Healthcare Accessibility Testing Suite
 * Ensures WCAG 2.1 AA compliance for healthcare applications
 * Tests critical healthcare workflows for accessibility
 */

test.describe("Healthcare Platform Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test("Homepage meets WCAG 2.1 AA standards", async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
    });
  });

  test("Patient Management interface is accessible", async ({ page }) => {
    await page.goto("/patients");
    await page.waitForLoadState("networkidle");

    // Check for critical accessibility violations
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
      rules: {
        // Healthcare-specific accessibility rules
        "color-contrast": { enabled: true },
        "keyboard-navigation": { enabled: true },
        "focus-management": { enabled: true },
        "aria-labels": { enabled: true },
        "form-labels": { enabled: true },
      },
    });
  });

  test("Clinical Documentation forms are accessible", async ({ page }) => {
    await page.goto("/clinical/documentation");
    await page.waitForLoadState("networkidle");

    // Test form accessibility
    await checkA11y(page, "form", {
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
      rules: {
        label: { enabled: true },
        "label-title-only": { enabled: true },
        "form-field-multiple-labels": { enabled: true },
        "required-attr": { enabled: true },
        "aria-required-attr": { enabled: true },
      },
    });
  });

  test("Navigation is keyboard accessible", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test skip links
    await page.keyboard.press("Tab");
    const skipLink = page.locator('[href="#main-content"]');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeFocused();
    }
  });

  test("Error messages are accessible", async ({ page }) => {
    // Navigate to a form and trigger validation errors
    await page.goto("/patients/new");
    await page.click('button[type="submit"]');

    // Check that error messages are properly associated
    const errorMessages = page.locator('[role="alert"], .error-message');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      await checkA11y(page, '[role="alert"], .error-message', {
        tags: ["wcag2a", "wcag2aa"],
        rules: {
          "aria-live-region": { enabled: true },
          "color-contrast": { enabled: true },
        },
      });
    }
  });

  test("Data tables are accessible", async ({ page }) => {
    await page.goto("/patients");
    await page.waitForSelector("table", { timeout: 10000 });

    // Check table accessibility
    await checkA11y(page, "table", {
      tags: ["wcag2a", "wcag2aa"],
      rules: {
        "table-headers": { enabled: true },
        "th-has-data-cells": { enabled: true },
        "td-headers-attr": { enabled: true },
        "table-caption": { enabled: true },
      },
    });
  });

  test("Modal dialogs are accessible", async ({ page }) => {
    // Look for buttons that open modals
    const modalTriggers = page.locator(
      'button[data-testid*="modal"], button[aria-haspopup="dialog"]',
    );

    const triggerCount = await modalTriggers.count();
    if (triggerCount > 0) {
      await modalTriggers.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Check modal accessibility
      await checkA11y(page, '[role="dialog"]', {
        tags: ["wcag2a", "wcag2aa"],
        rules: {
          "focus-trap": { enabled: true },
          "aria-modal": { enabled: true },
          "dialog-name": { enabled: true },
        },
      });
    }
  });

  test("Color contrast meets healthcare standards", async ({ page }) => {
    // Test color contrast across the application
    const violations = await getViolations(page, null, {
      tags: ["wcag2aa"],
      rules: {
        "color-contrast": { enabled: true },
        "color-contrast-enhanced": { enabled: true },
      },
    });

    // Healthcare applications should have zero color contrast violations
    expect(violations.filter((v) => v.id === "color-contrast")).toHaveLength(0);
  });

  test("Screen reader compatibility", async ({ page }) => {
    // Test ARIA landmarks and labels
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa"],
      rules: {
        "landmark-one-main": { enabled: true },
        "landmark-complementary-is-top-level": { enabled: true },
        "landmark-no-duplicate-banner": { enabled: true },
        "landmark-no-duplicate-contentinfo": { enabled: true },
        "aria-allowed-attr": { enabled: true },
        "aria-required-attr": { enabled: true },
        "aria-valid-attr-value": { enabled: true },
        "aria-valid-attr": { enabled: true },
      },
    });
  });

  test("Mobile accessibility", async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Test touch targets
    const touchTargets = page.locator("button, a, input, select, textarea");
    const targetCount = await touchTargets.count();

    for (let i = 0; i < Math.min(targetCount, 10); i++) {
      const target = touchTargets.nth(i);
      const boundingBox = await target.boundingBox();

      if (boundingBox) {
        // WCAG 2.1 AA requires touch targets to be at least 44x44 pixels
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Check mobile-specific accessibility
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
      rules: {
        "target-size": { enabled: true },
        "focus-order-semantics": { enabled: true },
      },
    });
  });

  test("Healthcare form validation accessibility", async ({ page }) => {
    await page.goto("/clinical/assessment/new");

    // Test form validation accessibility
    await page.fill('input[name="patientId"]', "invalid-id");
    await page.click('button[type="submit"]');

    // Wait for validation messages
    await page.waitForSelector('[aria-invalid="true"]', { timeout: 5000 });

    // Check validation message accessibility
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa"],
      rules: {
        "aria-invalid-value": { enabled: true },
        "aria-describedby": { enabled: true },
        "form-field-multiple-labels": { enabled: true },
      },
    });
  });

  test("Emergency alert accessibility", async ({ page }) => {
    // Test emergency notifications and alerts
    const alertTriggers = page.locator(
      'button[data-testid*="emergency"], button[data-testid*="alert"]',
    );

    const triggerCount = await alertTriggers.count();
    if (triggerCount > 0) {
      await alertTriggers.first().click();
      await page.waitForSelector('[role="alert"]', { timeout: 5000 });

      // Emergency alerts must be immediately announced to screen readers
      await checkA11y(page, '[role="alert"]', {
        tags: ["wcag2a", "wcag2aa"],
        rules: {
          "aria-live-region": { enabled: true },
          "color-contrast": { enabled: true },
        },
      });
    }
  });

  test("Healthcare data visualization accessibility", async ({ page }) => {
    // Test charts and graphs accessibility
    await page.goto("/analytics");
    await page.waitForLoadState("networkidle");

    const charts = page.locator('[role="img"], .chart, .graph, svg');
    const chartCount = await charts.count();

    if (chartCount > 0) {
      // Charts should have proper ARIA labels and descriptions
      await checkA11y(page, '[role="img"], .chart, .graph, svg', {
        tags: ["wcag2a", "wcag2aa"],
        rules: {
          "image-alt": { enabled: true },
          "svg-img-alt": { enabled: true },
          "aria-label": { enabled: true },
        },
      });
    }
  });
});

// Healthcare-specific accessibility test suite
test.describe("DOH Compliance Accessibility", () => {
  test("DOH reporting forms meet accessibility standards", async ({ page }) => {
    await page.goto("/compliance/doh-reporting");
    await page.waitForLoadState("networkidle");

    // DOH forms must be fully accessible
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
      disableRules: [], // No rules disabled for DOH compliance
    });
  });

  test("DAMAN submission interface accessibility", async ({ page }) => {
    await page.goto("/revenue/daman-submission");
    await page.waitForLoadState("networkidle");

    // DAMAN interfaces must be accessible to all users
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa", "wcag21aa"],
      rules: {
        "form-field-multiple-labels": { enabled: true },
        "label-title-only": { enabled: true },
        "required-attr": { enabled: true },
      },
    });
  });

  test("Clinical documentation accessibility", async ({ page }) => {
    await page.goto("/clinical/documentation");
    await page.waitForLoadState("networkidle");

    // Clinical forms must be accessible for all healthcare providers
    await checkA11y(page, null, {
      tags: ["wcag2a", "wcag2aa", "wcag21aa", "section508"],
      rules: {
        "color-contrast": { enabled: true },
        "keyboard-navigation": { enabled: true },
        "focus-management": { enabled: true },
      },
    });
  });
});
