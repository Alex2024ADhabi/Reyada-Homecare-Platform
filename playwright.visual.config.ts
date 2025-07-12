import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for visual regression testing
 * Ensures UI consistency across healthcare platform
 */
export default defineConfig({
  testDir: "./src/test/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // Sequential for consistent screenshots
  reporter: [
    ["html", { outputFolder: "test-results/visual/html-report" }],
    ["json", { outputFile: "test-results/visual/results.json" }],
  ],
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000,
    navigationTimeout: 30000,
    // Visual testing specific configuration
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // Ensure consistent rendering for screenshots
    launchOptions: {
      args: [
        "--disable-web-security",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--disable-background-timer-throttling",
        "--force-color-profile=srgb",
      ],
    },
  },
  projects: [
    {
      name: "visual-desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "visual-desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "visual-mobile",
      use: {
        ...devices["iPhone 12"],
      },
    },
    {
      name: "visual-tablet",
      use: {
        ...devices["iPad Pro"],
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  outputDir: "test-results/visual/",
  timeout: 60000,
  expect: {
    timeout: 10000,
    // Visual comparison thresholds
    toHaveScreenshot: {
      threshold: 0.2,
      mode: "strict",
      animations: "disabled",
    },
    toMatchSnapshot: {
      threshold: 0.2,
      mode: "strict",
    },
  },
  // Healthcare-specific visual testing configuration
  metadata: {
    platform: process.platform,
    testType: "visual-regression",
    uiConsistency: "healthcare-platform",
  },
});
