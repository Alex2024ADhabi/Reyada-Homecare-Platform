import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    name: "unit",
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/test/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "src/test/integration/**/*",
      "src/test/e2e/**/*",
      "src/test/performance/**/*",
      "src/test/security/**/*",
      "src/test/accessibility/**/*",
      "src/test/compliance/**/*",
      "node_modules/**/*",
      "dist/**/*",
      ".next/**/*",
      "coverage/**/*",
    ],
    environment: "jsdom",
    setupFiles: ["./src/test/setup/unit-test-setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./test-results/coverage/unit",
      include: ["src/**/*.{js,ts,jsx,tsx}"],
      exclude: [
        "src/test/**/*",
        "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
        "src/**/*.d.ts",
        "src/tempobook/**/*",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Healthcare-specific components should have higher coverage
        "src/components/clinical/**/*": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/components/revenue/**/*": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        "src/services/**/*": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    reporters: [
      "default",
      "json",
      "html",
      ["junit", { outputFile: "./test-results/unit/junit.xml" }],
    ],
    outputFile: {
      json: "./test-results/unit/results.json",
      html: "./test-results/unit/report.html",
    },
    testTimeout: 10000, // 10 seconds
    hookTimeout: 5000, // 5 seconds
    teardownTimeout: 5000,
    isolate: true,
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },
    // Healthcare-specific test configuration
    env: {
      NODE_ENV: "test",
      HEALTHCARE_TEST_MODE: "unit",
      DOH_COMPLIANCE_CHECK: "true",
      DAMAN_INTEGRATION_TEST: "false",
      PATIENT_DATA_ENCRYPTION: "true",
    },
    // Mock configuration for unit tests
    deps: {
      inline: [
        // Inline dependencies that need to be transformed
        "@testing-library/jest-dom",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/test": path.resolve(__dirname, "./src/test"),
    },
  },
  define: {
    // Define global constants for testing
    __TEST_MODE__: true,
    __HEALTHCARE_COMPLIANCE__: true,
    __DOH_VALIDATION__: true,
    __DAMAN_INTEGRATION__: false,
  },
});
