import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./test-results/coverage",
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
        // Healthcare-specific components require higher coverage
        "src/components/clinical/**/*": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/components/patient/**/*": {
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
      ["junit", { outputFile: "./test-results/junit.xml" }],
    ],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/report.html",
    },
    testTimeout: 10000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    // Healthcare compliance testing
    env: {
      NODE_ENV: "test",
      HEALTHCARE_TEST_MODE: "comprehensive",
      DOH_COMPLIANCE_CHECK: "true",
      HIPAA_VALIDATION: "true",
      DAMAN_INTEGRATION_TEST: "mock",
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
    __TEST_MODE__: true,
    __HEALTHCARE_COMPLIANCE__: true,
    __DOH_VALIDATION__: true,
    __DAMAN_INTEGRATION__: false,
  },
});
