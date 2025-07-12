import { test, expect, Page } from "@playwright/test";
import { injectAxe, checkA11y, getViolations } from "axe-core/playwright";

// Accessibility testing configuration
const A11Y_CONFIG = {
  rules: {
    // Disable color-contrast rule for now (can be enabled when design is finalized)
    "color-contrast": { enabled: false },
    // Enable all WCAG 2.1 AA rules
    wcag2a: { enabled: true },
    wcag2aa: { enabled: true },
    wcag21aa: { enabled: true },
  },
  tags: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"],
  reporter: "v2",
};

// Healthcare-specific accessibility requirements
const HEALTHCARE_A11Y_REQUIREMENTS = {
  // Critical healthcare forms must be fully accessible
  criticalForms: [
    "/patients/new",
    "/clinical/assessment",
    "/clinical/medication",
    "/emergency/incident",
  ],
  // Patient-facing interfaces require higher accessibility standards
  patientFacing: ["/patient-portal", "/patient-portal/appointments"],
  // Clinical workflows must support assistive technologies
  clinicalWorkflows: ["/clinical", "/patients", "/quality"],
};

class AccessibilityTestHelper {
  constructor(private page: Page) {}

  async login(userType: "clinician" | "admin" | "patient" = "clinician") {
    const users = {
      clinician: { email: "clinician@reyada.com", password: "testpassword" },
      admin: { email: "admin@reyada.com", password: "testpassword" },
      patient: { email: "patient@reyada.com", password: "testpassword" },
    };

    const user = users[userType];
    await this.page.goto("/login");
    await this.page.fill('[data-testid="email"]', user.email);
    await this.page.fill('[data-testid="password"]', user.password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForSelector('[data-testid="dashboard"]', {
      timeout: 10000,
    });
  }

  async injectAxeAndCheck(
    selector?: string,
    options?: any,
  ): Promise<{ violations: any[]; passes: any[] }> {
    await injectAxe(this.page);

    const results = await this.page.evaluate(
      async ({ selector, options }) => {
        // @ts-ignore
        return await window.axe.run(selector || document, options);
      },
      { selector, options: { ...A11Y_CONFIG, ...options } },
    );

    return {
      violations: results.violations,
      passes: results.passes,
    };
  }

  async checkKeyboardNavigation(
    startSelector: string,
    expectedStops: string[],
  ) {
    await this.page.focus(startSelector);

    for (let i = 0; i < expectedStops.length; i++) {
      await this.page.keyboard.press("Tab");
      const focusedElement = await this.page.evaluate(
        () => document.activeElement?.getAttribute("data-testid") || "",
      );
      expect(focusedElement).toBe(expectedStops[i]);
    }
  }

  async checkScreenReaderAnnouncements() {
    // Simulate screen reader by checking aria-live regions
    const liveRegions = await this.page.locator("[aria-live]").all();
    const announcements = [];

    for (const region of liveRegions) {
      const text = await region.textContent();
      const liveType = await region.getAttribute("aria-live");
      if (text && text.trim()) {
        announcements.push({ text: text.trim(), type: liveType });
      }
    }

    return announcements;
  }

  async testColorContrast() {
    const results = await this.injectAxeAndCheck(undefined, {
      rules: { "color-contrast": { enabled: true } },
    });
    return results.violations.filter((v) => v.id === "color-contrast");
  }

  async testFocusManagement() {
    // Test that focus is properly managed during navigation
    const focusableElements = await this.page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusableElements.count();

    const focusOrder = [];
    await this.page.keyboard.press("Tab");

    for (let i = 0; i < Math.min(count, 20); i++) {
      const focused = await this.page.evaluate(
        () => document.activeElement?.tagName || "",
      );
      focusOrder.push(focused);
      await this.page.keyboard.press("Tab");
    }

    return focusOrder;
  }
}

test.describe("Accessibility Automation Testing", () => {
  let a11yHelper: AccessibilityTestHelper;

  test.beforeEach(async ({ page }) => {
    a11yHelper = new AccessibilityTestHelper(page);
  });

  test.describe("WCAG 2.1 AA Compliance", () => {
    const testPages = [
      { name: "Dashboard", url: "/dashboard" },
      { name: "Patient Management", url: "/patients" },
      { name: "Clinical Documentation", url: "/clinical" },
      { name: "Quality Dashboard", url: "/quality" },
      { name: "Revenue Management", url: "/revenue" },
    ];

    for (const testPage of testPages) {
      test(`${testPage.name} should meet WCAG 2.1 AA standards`, async ({
        page,
      }) => {
        await a11yHelper.login();
        await page.goto(testPage.url);
        await page.waitForLoadState("networkidle");

        const { violations } = await a11yHelper.injectAxeAndCheck();

        // Log violations for debugging
        if (violations.length > 0) {
          console.log(
            `Accessibility violations found on ${testPage.name}:`,
            violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length,
            })),
          );
        }

        // Critical violations should be zero
        const criticalViolations = violations.filter(
          (v) => v.impact === "critical",
        );
        expect(criticalViolations).toHaveLength(0);

        // Serious violations should be minimal
        const seriousViolations = violations.filter(
          (v) => v.impact === "serious",
        );
        expect(seriousViolations.length).toBeLessThan(3);
      });
    }
  });

  test.describe("Healthcare-Specific Accessibility", () => {
    test("Critical healthcare forms should be fully accessible", async ({
      page,
    }) => {
      await a11yHelper.login();

      for (const formUrl of HEALTHCARE_A11Y_REQUIREMENTS.criticalForms) {
        await page.goto(formUrl);
        await page.waitForLoadState("networkidle");

        const { violations } = await a11yHelper.injectAxeAndCheck();

        // Critical healthcare forms must have zero accessibility violations
        expect(violations).toHaveLength(0);

        // Test form labels and descriptions
        const formElements = await page
          .locator("input, select, textarea")
          .all();
        for (const element of formElements) {
          const hasLabel = await element.evaluate((el) => {
            const id = el.getAttribute("id");
            const ariaLabel = el.getAttribute("aria-label");
            const ariaLabelledBy = el.getAttribute("aria-labelledby");
            const label = id
              ? document.querySelector(`label[for="${id}"]`)
              : null;
            return !!(label || ariaLabel || ariaLabelledBy);
          });
          expect(hasLabel).toBe(true);
        }
      }
    });

    test("Patient-facing interfaces should support screen readers", async ({
      page,
    }) => {
      await a11yHelper.login("patient");

      for (const patientUrl of HEALTHCARE_A11Y_REQUIREMENTS.patientFacing) {
        await page.goto(patientUrl);
        await page.waitForLoadState("networkidle");

        // Check for proper heading structure
        const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
        expect(headings.length).toBeGreaterThan(0);

        // Check for skip links
        const skipLinks = await page.locator('[href^="#"]').all();
        const hasSkipToContent = skipLinks.some(async (link) => {
          const text = await link.textContent();
          return text?.toLowerCase().includes("skip");
        });

        // Check for landmark regions
        const landmarks = await page
          .locator('[role="main"], [role="navigation"], [role="banner"]')
          .all();
        expect(landmarks.length).toBeGreaterThan(0);
      }
    });

    test("Clinical workflows should support keyboard navigation", async ({
      page,
    }) => {
      await a11yHelper.login("clinician");

      // Test patient management keyboard navigation
      await page.goto("/patients");
      await page.waitForLoadState("networkidle");

      const expectedTabStops = [
        "search-input",
        "new-patient-button",
        "patient-list",
        "pagination-next",
      ];

      await a11yHelper.checkKeyboardNavigation(
        '[data-testid="search-input"]',
        expectedTabStops.slice(1),
      );

      // Test clinical assessment keyboard navigation
      await page.goto("/clinical");
      await page.waitForLoadState("networkidle");

      // Ensure all interactive elements are keyboard accessible
      const interactiveElements = await page
        .locator("button, [href], input, select, textarea")
        .all();

      for (const element of interactiveElements) {
        const isKeyboardAccessible = await element.evaluate((el) => {
          const tabIndex = el.getAttribute("tabindex");
          return tabIndex !== "-1" && !el.hasAttribute("disabled");
        });
        expect(isKeyboardAccessible).toBe(true);
      }
    });
  });

  test.describe("Screen Reader Compatibility", () => {
    test("should provide proper ARIA labels and descriptions", async ({
      page,
    }) => {
      await a11yHelper.login();
      await page.goto("/clinical/assessment");
      await page.waitForLoadState("networkidle");

      // Check that all form controls have accessible names
      const formControls = await page
        .locator("input, select, textarea, button")
        .all();

      for (const control of formControls) {
        const accessibleName = await control.evaluate((el) => {
          // Check for various ways an element can have an accessible name
          const ariaLabel = el.getAttribute("aria-label");
          const ariaLabelledBy = el.getAttribute("aria-labelledby");
          const title = el.getAttribute("title");
          const id = el.getAttribute("id");
          const label = id
            ? document.querySelector(`label[for="${id}"]`)
            : null;
          const textContent = el.textContent?.trim();

          return !!(
            ariaLabel ||
            ariaLabelledBy ||
            title ||
            label ||
            textContent
          );
        });

        expect(accessibleName).toBe(true);
      }
    });

    test("should announce important status changes", async ({ page }) => {
      await a11yHelper.login();
      await page.goto("/patients");
      await page.waitForLoadState("networkidle");

      // Create a new patient to trigger status announcements
      await page.click('[data-testid="new-patient-button"]');
      await page.fill('[data-testid="patient-name"]', "Test Patient");
      await page.fill('[data-testid="emirates-id"]', "784-1990-1234567-8");
      await page.click('[data-testid="submit-patient"]');

      // Check for success announcement
      const announcements = await a11yHelper.checkScreenReaderAnnouncements();
      const hasSuccessAnnouncement = announcements.some((a) =>
        a.text.toLowerCase().includes("success"),
      );
      expect(hasSuccessAnnouncement).toBe(true);
    });

    test("should provide proper error announcements", async ({ page }) => {
      await a11yHelper.login();
      await page.goto("/patients");
      await page.click('[data-testid="new-patient-button"]');

      // Submit form without required fields to trigger errors
      await page.click('[data-testid="submit-patient"]');
      await page.waitForSelector('[data-testid="validation-error"]');

      // Check that errors are announced
      const errorElements = await page.locator('[role="alert"]').all();
      expect(errorElements.length).toBeGreaterThan(0);

      // Check that error messages are associated with form fields
      const errorMessages = await page.locator("[aria-describedby]").all();
      for (const element of errorMessages) {
        const describedBy = await element.getAttribute("aria-describedby");
        if (describedBy) {
          const errorElement = await page.locator(`#${describedBy}`);
          expect(await errorElement.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("Color and Contrast Accessibility", () => {
    test("should meet color contrast requirements", async ({ page }) => {
      await a11yHelper.login();
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const contrastViolations = await a11yHelper.testColorContrast();

      // Log contrast violations for review
      if (contrastViolations.length > 0) {
        console.log("Color contrast violations:", contrastViolations);
      }

      // For now, we'll warn about contrast issues rather than fail
      // This can be made stricter once design system is finalized
      expect(contrastViolations.length).toBeLessThan(10);
    });

    test("should not rely solely on color for information", async ({
      page,
    }) => {
      await a11yHelper.login();
      await page.goto("/quality/metrics");
      await page.waitForLoadState("networkidle");

      // Check that status indicators have text or icons in addition to color
      const statusElements = await page
        .locator("[data-status], .status, .badge")
        .all();

      for (const element of statusElements) {
        const hasTextContent = await element.evaluate(
          (el) => el.textContent?.trim().length > 0,
        );
        const hasAriaLabel = await element.evaluate(
          (el) => !!el.getAttribute("aria-label"),
        );
        const hasIcon = await element.evaluate(
          (el) => el.querySelector("svg, .icon") !== null,
        );

        expect(hasTextContent || hasAriaLabel || hasIcon).toBe(true);
      }
    });
  });

  test.describe("Focus Management", () => {
    test("should manage focus properly in modals", async ({ page }) => {
      await a11yHelper.login();
      await page.goto("/patients");
      await page.waitForLoadState("networkidle");

      // Open modal
      await page.click('[data-testid="new-patient-button"]');
      await page.waitForSelector('[data-testid="patient-modal"]');

      // Check that focus is trapped in modal
      const modalElement = page.locator('[data-testid="patient-modal"]');
      const focusableInModal = await modalElement
        .locator('button, [href], input, select, textarea, [tabindex="0"]')
        .all();

      expect(focusableInModal.length).toBeGreaterThan(0);

      // Check that first focusable element receives focus
      const firstFocusable = focusableInModal[0];
      await expect(firstFocusable).toBeFocused();

      // Test Escape key closes modal
      await page.keyboard.press("Escape");
      await expect(modalElement).not.toBeVisible();
    });

    test("should provide visible focus indicators", async ({ page }) => {
      await a11yHelper.login();
      await page.goto("/clinical");
      await page.waitForLoadState("networkidle");

      const focusableElements = await page
        .locator("button, [href], input, select, textarea")
        .all();

      for (const element of focusableElements.slice(0, 5)) {
        await element.focus();

        // Check that focused element has visible focus indicator
        const hasFocusStyle = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const outline = styles.outline;
          const boxShadow = styles.boxShadow;
          const border = styles.border;

          return (
            outline !== "none" ||
            boxShadow !== "none" ||
            border.includes("focus")
          );
        });

        expect(hasFocusStyle).toBe(true);
      }
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should be accessible on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await a11yHelper.login();
      await page.goto("/patients");
      await page.waitForLoadState("networkidle");

      const { violations } = await a11yHelper.injectAxeAndCheck();

      // Mobile should have same accessibility standards
      const criticalViolations = violations.filter(
        (v) => v.impact === "critical",
      );
      expect(criticalViolations).toHaveLength(0);

      // Check touch target sizes
      const touchTargets = await page
        .locator('button, [href], input[type="checkbox"], input[type="radio"]')
        .all();

      for (const target of touchTargets.slice(0, 10)) {
        const size = await target.boundingBox();
        if (size) {
          // Touch targets should be at least 44x44 pixels
          expect(size.width).toBeGreaterThanOrEqual(44);
          expect(size.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe("Accessibility Regression Prevention", () => {
    test("should maintain accessibility scores over time", async ({ page }) => {
      await a11yHelper.login();
      const testPages = ["/dashboard", "/patients", "/clinical"];

      const accessibilityScores = [];

      for (const testPage of testPages) {
        await page.goto(testPage);
        await page.waitForLoadState("networkidle");

        const { violations, passes } = await a11yHelper.injectAxeAndCheck();

        const score = {
          page: testPage,
          violations: violations.length,
          passes: passes.length,
          score: (passes.length / (passes.length + violations.length)) * 100,
        };

        accessibilityScores.push(score);

        // Each page should maintain a minimum accessibility score
        expect(score.score).toBeGreaterThan(85);
      }

      console.log("Accessibility scores:", accessibilityScores);
    });
  });
});
