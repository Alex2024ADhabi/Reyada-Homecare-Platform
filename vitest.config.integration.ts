import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    name: "integration",
    environment: "happy-dom",
    include: [
      "src/test/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "src/test/unit/**/*",
      "src/test/e2e/**/*",
      "node_modules/**/*",
      "dist/**/*",
    ],
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "test-results/coverage/integration",
      include: [
        "src/services/**/*",
        "src/api/**/*",
        "src/utils/**/*",
        "src/lib/**/*",
      ],
      exclude: ["src/test/**/*", "src/**/*.d.ts", "src/**/*.config.*"],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Healthcare integration modules
        "src/services/healthcare-integration.service.ts": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        "src/api/daman/**/*": {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 30000,
    hookTimeout: 15000,
    teardownTimeout: 10000,
    isolate: false, // Allow shared state for integration tests
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Sequential execution for integration tests
        maxThreads: 1,
        minThreads: 1,
      },
    },
    reporter: ["default", "json", "html", "junit"],
    outputFile: {
      json: "test-results/integration/results.json",
      html: "test-results/integration/report.html",
      junit: "test-results/integration/junit.xml",
    },
    // Integration test specific environment
    env: {
      VITE_TEST_MODE: "integration",
      VITE_API_BASE_URL: "http://localhost:3001",
      VITE_HEALTHCARE_COMPLIANCE: "true",
      VITE_DOH_VALIDATION: "true",
      VITE_DAMAN_INTEGRATION: "test",
      VITE_JAWDA_METRICS: "true",
      VITE_HIPAA_COMPLIANCE: "true",
      VITE_DATABASE_URL:
        "postgresql://test:test@localhost:5432/healthcare_test",
      VITE_REDIS_URL: "redis://localhost:6379/1",
    },
    // Setup and teardown for integration tests
    globalSetup: ["src/test/integration/global-setup.ts"],
    globalTeardown: ["src/test/integration/global-teardown.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/test": resolve(__dirname, "./src/test"),
    },
  },
  define: {
    __TEST_ENV__: '"integration"',
    __HEALTHCARE_MODE__: "true",
    __API_MOCKING__: "false",
  },
});
