import { test, expect, Page } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

// Visual regression testing configuration
const VISUAL_TEST_CONFIG = {
  threshold: 0.2, // 20% difference threshold
  animations: "disabled" as const,
  clip: { x: 0, y: 0, width: 1280, height: 720 },
};

// Healthcare components to test visually
const HEALTHCARE_COMPONENTS = [
  {
    name: "Patient Management Dashboard",
    url: "/patients",
    selector: '[data-testid="patient-management"]',
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "Clinical Documentation Form",
    url: "/clinical",
    selector: '[data-testid="clinical-dashboard"]',
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "DOH Assessment Form",
    url: "/clinical/assessment",
    selector: '[data-testid="assessment-form"]',
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "Daman Authorization Form",
    url: "/revenue/daman",
    selector: '[data-testid="daman-form"]',
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "Mobile Patient Card",
    url: "/patients",
    selector: '[data-testid="patient-card"]',
    viewport: { width: 375, height: 667 },
  },
  {
    name: "Quality Dashboard",
    url: "/quality",
    selector: '[data-testid="quality-dashboard"]',
    viewport: { width: 1280, height: 720 },
  },
];

class VisualTestHelper {
  constructor(private page: Page) {}

  async login(userType: "clinician" | "admin" | "qa" = "clinician") {
    const users = {
      clinician: { email: "clinician@reyada.com", password: "testpassword" },
      admin: { email: "admin@reyada.com", password: "testpassword" },
      qa: { email: "qa@reyada.com", password: "testpassword" },
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

  async setupTestData() {
    // Create test patient data for consistent visual tests
    await this.page.evaluate(() => {
      localStorage.setItem(
        "test-patient-data",
        JSON.stringify({
          id: "visual-test-patient",
          name: "Ahmed Al Mansouri",
          emiratesId: "784-1990-1234567-8",
          age: 45,
          gender: "Male",
          status: "Active",
        }),
      );
    });
  }

  async waitForStableContent() {
    // Wait for animations and loading states to complete
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000); // Additional buffer for animations
  }

  async hideVolatileElements() {
    // Hide elements that change frequently (timestamps, IDs, etc.)
    await this.page.addStyleTag({
      content: `
        [data-testid*="timestamp"],
        [data-testid*="id"],
        .timestamp,
        .dynamic-id,
        .loading-spinner {
          visibility: hidden !important;
        }
      `,
    });
  }
}

test.describe("Visual Regression Testing", () => {
  let visualHelper: VisualTestHelper;

  test.beforeEach(async ({ page }) => {
    visualHelper = new VisualTestHelper(page);
    await visualHelper.login();
    await visualHelper.setupTestData();
  });

  test.describe("Healthcare Component Screenshots", () => {
    for (const component of HEALTHCARE_COMPONENTS) {
      test(`should match ${component.name} visual baseline`, async ({
        page,
      }) => {
        // Set viewport for component
        await page.setViewportSize(component.viewport);

        // Navigate to component
        await page.goto(component.url);
        await visualHelper.waitForStableContent();
        await visualHelper.hideVolatileElements();

        // Wait for specific component to be visible
        await page.waitForSelector(component.selector, { timeout: 10000 });

        // Take screenshot and compare
        await expect(page.locator(component.selector)).toHaveScreenshot(
          `${component.name.toLowerCase().replace(/\s+/g, "-")}.png`,
          {
            threshold: VISUAL_TEST_CONFIG.threshold,
            animations: VISUAL_TEST_CONFIG.animations,
          },
        );
      });
    }
  });

  test.describe("Responsive Design Testing", () => {
    const viewports = [
      { name: "Mobile", width: 375, height: 667 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Desktop", width: 1280, height: 720 },
      { name: "Large Desktop", width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        const testPages = ["/dashboard", "/patients", "/clinical"];

        for (const testPage of testPages) {
          await page.goto(testPage);
          await visualHelper.waitForStableContent();
          await visualHelper.hideVolatileElements();

          await expect(page).toHaveScreenshot(
            `${testPage.replace("/", "") || "home"}-${viewport.name.toLowerCase()}.png`,
            {
              threshold: VISUAL_TEST_CONFIG.threshold,
              animations: VISUAL_TEST_CONFIG.animations,
              fullPage: true,
            },
          );
        }
      });
    }
  });

  test.describe("Theme and Accessibility Visual Tests", () => {
    test("should render correctly in dark mode", async ({ page }) => {
      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      });

      await page.goto("/dashboard");
      await visualHelper.waitForStableContent();
      await visualHelper.hideVolatileElements();

      await expect(page).toHaveScreenshot("dashboard-dark-mode.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
        fullPage: true,
      });
    });

    test("should render correctly with high contrast", async ({ page }) => {
      // Enable high contrast mode
      await page.addStyleTag({
        content: `
          * {
            filter: contrast(150%) !important;
          }
        `,
      });

      await page.goto("/patients");
      await visualHelper.waitForStableContent();
      await visualHelper.hideVolatileElements();

      await expect(page).toHaveScreenshot("patients-high-contrast.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
        fullPage: true,
      });
    });

    test("should render correctly with large fonts", async ({ page }) => {
      // Increase font size for accessibility
      await page.addStyleTag({
        content: `
          html {
            font-size: 120% !important;
          }
        `,
      });

      await page.goto("/clinical");
      await visualHelper.waitForStableContent();
      await visualHelper.hideVolatileElements();

      await expect(page).toHaveScreenshot("clinical-large-fonts.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
        fullPage: true,
      });
    });
  });

  test.describe("Form State Visual Testing", () => {
    test("should capture form validation states", async ({ page }) => {
      await page.goto("/patients");
      await page.click('[data-testid="new-patient-button"]');
      await page.waitForSelector('[data-testid="patient-form"]');

      // Test empty form state
      await expect(
        page.locator('[data-testid="patient-form"]'),
      ).toHaveScreenshot("patient-form-empty.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });

      // Test form with validation errors
      await page.click('[data-testid="submit-patient"]');
      await page.waitForSelector('[data-testid="validation-error"]');

      await expect(
        page.locator('[data-testid="patient-form"]'),
      ).toHaveScreenshot("patient-form-validation-errors.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });

      // Test form with valid data
      await page.fill('[data-testid="patient-name"]', "Ahmed Al Mansouri");
      await page.fill('[data-testid="emirates-id"]', "784-1990-1234567-8");
      await page.fill('[data-testid="phone"]', "+971501234567");

      await expect(
        page.locator('[data-testid="patient-form"]'),
      ).toHaveScreenshot("patient-form-valid-data.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });
    });

    test("should capture clinical assessment form states", async ({ page }) => {
      await page.goto("/clinical");
      await page.click('[data-testid="new-assessment-button"]');
      await page.waitForSelector('[data-testid="assessment-form"]');

      // Test 9-domain assessment form
      const domains = Array.from({ length: 9 }, (_, i) => i + 1);
      for (const domain of domains.slice(0, 5)) {
        await page.selectOption(`[data-testid="domain-${domain}-score"]`, "3");
      }

      await expect(
        page.locator('[data-testid="assessment-form"]'),
      ).toHaveScreenshot("assessment-form-partial.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });

      // Complete all domains
      for (const domain of domains.slice(5)) {
        await page.selectOption(`[data-testid="domain-${domain}-score"]`, "4");
      }

      await expect(
        page.locator('[data-testid="assessment-form"]'),
      ).toHaveScreenshot("assessment-form-complete.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });
    });
  });

  test.describe("Loading and Error State Visual Tests", () => {
    test("should capture loading states", async ({ page }) => {
      // Intercept API calls to simulate loading
      await page.route("**/api/patients", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.goto("/patients");

      // Capture loading state
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).toBeVisible();
      await expect(page).toHaveScreenshot("patients-loading-state.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });
    });

    test("should capture error states", async ({ page }) => {
      // Simulate API error
      await page.route("**/api/patients", (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        }),
      );

      await page.goto("/patients");
      await page.waitForSelector('[data-testid="error-message"]');

      await expect(page).toHaveScreenshot("patients-error-state.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });
    });

    test("should capture offline state", async ({ page, context }) => {
      await page.goto("/patients");
      await visualHelper.waitForStableContent();

      // Go offline
      await context.setOffline(true);
      await page.reload();

      await page.waitForSelector('[data-testid="offline-banner"]');

      await expect(page).toHaveScreenshot("patients-offline-state.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
      });
    });
  });

  test.describe("Cross-Browser Visual Consistency", () => {
    const browsers = ["chromium", "firefox", "webkit"];

    for (const browserName of browsers) {
      test(`should render consistently in ${browserName}`, async ({ page }) => {
        // This test would be run with different browser contexts
        await page.goto("/dashboard");
        await visualHelper.waitForStableContent();
        await visualHelper.hideVolatileElements();

        await expect(page).toHaveScreenshot(`dashboard-${browserName}.png`, {
          threshold: VISUAL_TEST_CONFIG.threshold,
          animations: VISUAL_TEST_CONFIG.animations,
        });
      });
    }
  });

  test.describe("Print Styles Visual Testing", () => {
    test("should render correctly for printing", async ({ page }) => {
      await page.goto("/patients/patient-123/medical-record");
      await visualHelper.waitForStableContent();

      // Emulate print media
      await page.emulateMedia({ media: "print" });

      await expect(page).toHaveScreenshot("medical-record-print.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
        fullPage: true,
      });
    });

    test("should render reports correctly for printing", async ({ page }) => {
      await page.goto("/reports/quality-metrics");
      await visualHelper.waitForStableContent();
      await visualHelper.hideVolatileElements();

      await page.emulateMedia({ media: "print" });

      await expect(page).toHaveScreenshot("quality-report-print.png", {
        threshold: VISUAL_TEST_CONFIG.threshold,
        animations: VISUAL_TEST_CONFIG.animations,
        fullPage: true,
      });
    });
  });
});
