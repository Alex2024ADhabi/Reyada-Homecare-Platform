import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for accessibility testing
 * Focuses on WCAG compliance and healthcare accessibility requirements
 */
export default defineConfig({
  testDir: "./src/test/accessibility",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { outputFolder: "test-results/accessibility/html-report" }],
    ["json", { outputFile: "test-results/accessibility/results.json" }],
    ["junit", { outputFile: "test-results/accessibility/junit.xml" }],
    ["list"],
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3001",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Accessibility testing specific settings */
    colorScheme: "light", // Test both light and dark modes

    /* Reduce motion for accessibility testing */
    reducedMotion: "reduce",

    /* Force prefers-reduced-motion */
    forcedColors: "none",

    /* Timeout for each action */
    actionTimeout: 10000,

    /* Timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium-accessibility",
      use: {
        ...devices["Desktop Chrome"],
        // High contrast mode testing
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },

    {
      name: "firefox-accessibility",
      use: {
        ...devices["Desktop Firefox"],
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },

    {
      name: "webkit-accessibility",
      use: {
        ...devices["Desktop Safari"],
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },

    /* Mobile accessibility testing */
    {
      name: "mobile-chrome-accessibility",
      use: {
        ...devices["Pixel 5"],
        colorScheme: "light",
      },
    },

    {
      name: "mobile-safari-accessibility",
      use: {
        ...devices["iPhone 12"],
        colorScheme: "light",
      },
    },

    /* High contrast mode testing */
    {
      name: "high-contrast",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
        forcedColors: "active",
      },
    },

    /* Screen reader simulation */
    {
      name: "screen-reader-simulation",
      use: {
        ...devices["Desktop Chrome"],
        // Simulate screen reader behavior
        hasTouch: false,
        isMobile: false,
        // Custom user agent to simulate screen reader
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 NVDA/2021.1",
      },
    },

    /* Keyboard navigation only */
    {
      name: "keyboard-only",
      use: {
        ...devices["Desktop Chrome"],
        // Disable mouse to force keyboard navigation
        hasTouch: false,
      },
    },
  ],

  /* Global setup for accessibility testing */
  globalSetup: require.resolve("./src/test/accessibility/global-setup.ts"),

  /* Global teardown */
  globalTeardown: require.resolve(
    "./src/test/accessibility/global-teardown.ts",
  ),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Test timeout */
  timeout: 60000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
    // Custom accessibility matchers
    toHaveAccessibleName: { timeout: 5000 },
    toHaveAccessibleDescription: { timeout: 5000 },
  },

  /* Output directory */
  outputDir: "test-results/accessibility/artifacts",

  /* Metadata for healthcare accessibility compliance */
  metadata: {
    testType: "accessibility",
    wcagLevel: "AA",
    healthcareCompliance: true,
    standards: [
      "WCAG 2.1 Level AA",
      "Section 508",
      "UAE Accessibility Standards",
      "Healthcare Accessibility Guidelines",
    ],
    testScope: [
      "Keyboard Navigation",
      "Screen Reader Compatibility",
      "Color Contrast",
      "Focus Management",
      "ARIA Implementation",
      "Form Accessibility",
      "Healthcare-specific Accessibility",
    ],
  },
});
