import { defineConfig, devices } from "@playwright/test";

/**
 * Enhanced Playwright Configuration for Reyada Homecare Platform
 * Includes healthcare-specific testing projects and compliance validation
 */
export default defineConfig({
  testDir: "./src/test/e2e",

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
    ["html", { outputFolder: "test-results/playwright-report" }],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["junit", { outputFile: "test-results/playwright-junit.xml" }],
    ["github"],
    ["list"],
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Healthcare-specific headers */
    extraHTTPHeaders: {
      "X-Healthcare-Test": "true",
      "X-DOH-Compliance": "enabled",
      "X-HIPAA-Mode": "test",
    },

    /* Timeout settings */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Global test timeout */
  timeout: 60000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers and healthcare-specific scenarios */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },

    {
      name: "cleanup",
      testMatch: /.*\.cleanup\.ts/,
    },

    /* Healthcare Workflow Testing */
    {
      name: "healthcare",
      testMatch: "**/healthcare-workflows.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          "X-Healthcare-Test": "true",
          "X-DOH-Compliance": "enabled",
          "X-HIPAA-Mode": "test",
          "X-Test-Suite": "healthcare-workflows",
        },
      },
      dependencies: ["setup"],
    },

    /* DOH Compliance Testing */
    {
      name: "doh-compliance",
      testMatch: "**/doh-compliance.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-DOH-Compliance": "strict",
          "X-Audit-Mode": "enabled",
          "X-Test-Suite": "doh-compliance",
        },
      },
      dependencies: ["setup"],
    },

    /* HIPAA Compliance Testing */
    {
      name: "hipaa-compliance",
      testMatch: "**/hipaa-compliance.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-HIPAA-Mode": "strict",
          "X-Privacy-Test": "enabled",
          "X-Test-Suite": "hipaa-compliance",
        },
      },
      dependencies: ["setup"],
    },

    /* DAMAN Integration Testing */
    {
      name: "daman-integration",
      testMatch: "**/daman-integration.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-DAMAN-Test": "enabled",
          "X-Insurance-Mode": "test",
          "X-Test-Suite": "daman-integration",
        },
      },
      dependencies: ["setup"],
    },

    /* Mobile Testing */
    {
      name: "mobile-healthcare",
      testMatch: "**/mobile-*.spec.ts",
      use: {
        ...devices["iPhone 13"],
        extraHTTPHeaders: {
          "X-Mobile-Test": "true",
          "X-Device-Type": "mobile",
          "X-Test-Suite": "mobile-healthcare",
        },
      },
      dependencies: ["setup"],
    },

    /* Tablet Testing */
    {
      name: "tablet-healthcare",
      testMatch: "**/tablet-*.spec.ts",
      use: {
        ...devices["iPad Pro"],
        extraHTTPHeaders: {
          "X-Mobile-Test": "true",
          "X-Device-Type": "tablet",
          "X-Test-Suite": "tablet-healthcare",
        },
      },
      dependencies: ["setup"],
    },

    /* Accessibility Testing */
    {
      name: "accessibility",
      testMatch: "**/accessibility.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Accessibility-Test": "true",
          "X-WCAG-Level": "AA",
          "X-Test-Suite": "accessibility",
        },
      },
      dependencies: ["setup"],
    },

    /* Performance Testing */
    {
      name: "performance",
      testMatch: "**/performance-regression.test.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Performance-Test": "true",
          "X-Metrics-Collection": "enabled",
          "X-Test-Suite": "performance",
        },
      },
      dependencies: ["setup"],
    },

    /* Cross-browser Testing */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/performance-regression.test.ts"],
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["**/performance-regression.test.ts"],
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: ["**/performance-regression.test.ts"],
      dependencies: ["setup"],
    },

    /* Smoke Testing */
    {
      name: "smoke",
      testMatch: "**/smoke.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Smoke-Test": "true",
          "X-Test-Suite": "smoke",
        },
      },
      dependencies: ["setup"],
    },

    /* Critical Path Testing */
    {
      name: "critical",
      testMatch: "**/*.spec.ts",
      grep: /@critical/,
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Critical-Test": "true",
          "X-Test-Suite": "critical-path",
        },
      },
      dependencies: ["setup"],
    },

    /* Compliance Testing */
    {
      name: "compliance",
      testMatch: "**/compliance-*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Compliance-Test": "comprehensive",
          "X-DOH-Compliance": "strict",
          "X-HIPAA-Mode": "strict",
          "X-Test-Suite": "compliance",
        },
      },
      dependencies: ["setup"],
    },

    /* API Testing */
    {
      name: "api",
      testMatch: "**/api-*.spec.ts",
      use: {
        baseURL: process.env.API_BASE_URL || "http://localhost:3000/api",
        extraHTTPHeaders: {
          "X-API-Test": "true",
          "X-Test-Suite": "api",
        },
      },
      dependencies: ["setup"],
    },

    /* Load Testing Integration */
    {
      name: "load-test-validation",
      testMatch: "**/load-test-validation.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: {
          "X-Load-Test": "validation",
          "X-Test-Suite": "load-validation",
        },
      },
      dependencies: ["setup"],
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve("./src/test/global-setup.ts"),
  globalTeardown: require.resolve("./src/test/global-teardown.ts"),

  /* Web server configuration for local testing */
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: "test",
          HEALTHCARE_MODE: "true",
          DOH_COMPLIANCE: "enabled",
          HIPAA_MODE: "test",
        },
      },

  /* Output directory */
  outputDir: "test-results/playwright-artifacts",

  /* Test metadata */
  metadata: {
    platform: "Healthcare Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "test",
    compliance: {
      doh: "enabled",
      hipaa: "enabled",
      gdpr: "enabled",
    },
  },
});
