import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    name: "comprehensive",
    environment: "happy-dom",
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "node_modules/**/*",
      "dist/**/*",
      "src/test/e2e/**/*", // E2E tests run separately with Playwright
    ],
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "clover"],
      reportsDirectory: "test-results/coverage/comprehensive",
      include: ["src/**/*"],
      exclude: [
        "src/test/**/*",
        "src/**/*.d.ts",
        "src/**/*.config.*",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/tempobook/**/*",
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        // Healthcare-critical modules require higher coverage
        "src/services/healthcare-*.ts": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/components/clinical/**/*": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        "src/services/compliance/**/*": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        "src/api/daman/**/*": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      watermarks: {
        statements: [70, 85],
        functions: [70, 85],
        branches: [70, 85],
        lines: [70, 85],
      },
    },
    testTimeout: 60000, // Longer timeout for comprehensive tests
    hookTimeout: 30000,
    teardownTimeout: 15000,
    isolate: true,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 6,
        minThreads: 2,
      },
    },
    reporter: [
      "default",
      "verbose",
      "json",
      "html",
      "junit",
      "hanging-process",
    ],
    outputFile: {
      json: "test-results/comprehensive/results.json",
      html: "test-results/comprehensive/report.html",
      junit: "test-results/comprehensive/junit.xml",
    },
    // Comprehensive test environment
    env: {
      VITE_TEST_MODE: "comprehensive",
      VITE_API_BASE_URL: "http://localhost:3001",
      VITE_HEALTHCARE_COMPLIANCE: "true",
      VITE_DOH_VALIDATION: "true",
      VITE_DAMAN_INTEGRATION: "test",
      VITE_JAWDA_METRICS: "true",
      VITE_HIPAA_COMPLIANCE: "true",
      VITE_PERFORMANCE_MONITORING: "true",
      VITE_SECURITY_TESTING: "true",
      VITE_ACCESSIBILITY_TESTING: "true",
      VITE_DATABASE_URL:
        "postgresql://test:test@localhost:5432/healthcare_test",
      VITE_REDIS_URL: "redis://localhost:6379/1",
      VITE_VERBOSE_TESTS: "true",
    },
    // Global setup and teardown
    globalSetup: ["src/test/comprehensive/global-setup.ts"],
    globalTeardown: ["src/test/comprehensive/global-teardown.ts"],

    // Retry configuration for flaky tests
    retry: 2,

    // Benchmark configuration
    benchmark: {
      include: [
        "src/test/benchmarks/**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      ],
      exclude: ["node_modules/**/*"],
      reporter: ["default", "json"],
      outputFile: {
        json: "test-results/comprehensive/benchmarks.json",
      },
    },

    // Watch mode configuration
    watch: false, // Disabled for comprehensive tests

    // Sequence configuration
    sequence: {
      concurrent: true,
      shuffle: false,
      hooks: "parallel",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/test": resolve(__dirname, "./src/test"),
      "@/fixtures": resolve(__dirname, "./src/test/fixtures"),
    },
  },
  define: {
    __TEST_ENV__: '"comprehensive"',
    __HEALTHCARE_MODE__: "true",
    __COMPLIANCE_TESTING__: "true",
    __PERFORMANCE_TESTING__: "true",
    __SECURITY_TESTING__: "true",
  },

  // Optimization for comprehensive testing
  esbuild: {
    target: "node14",
  },

  // Plugin configuration for healthcare testing
  plugins: [],
});
