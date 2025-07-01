import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Healthcare Platform E2E Testing
 * Comprehensive end-to-end testing with healthcare-specific scenarios
 */
export default defineConfig({
  testDir: "./src/test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "test-results/playwright-report" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
    ["junit", { outputFile: "test-results/e2e-junit.xml" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 30000,
    headless: process.env.CI ? true : false,
    ignoreHTTPSErrors: true,
    locale: "en-US",
    timezoneId: "Asia/Dubai",
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/*.spec.ts",
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: "**/*.spec.ts",
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: "**/*.spec.ts",
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: "**/*mobile*.spec.ts",
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
      testMatch: "**/*mobile*.spec.ts",
    },
    {
      name: "healthcare-workflows",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/*healthcare*.spec.ts",
      timeout: 60000,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      mode: "css",
      animations: "disabled",
    },
  },
  globalSetup: "./src/test/e2e/global-setup.ts",
  globalTeardown: "./src/test/e2e/global-teardown.ts",
});
