import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "src/tempobook/**",
        "src/storyboards/**",
        "**/*.stories.{js,jsx,ts,tsx}",
        "**/mock*.{js,jsx,ts,tsx}",
        "**/__mocks__/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        "src/components/": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        "src/services/": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/utils/": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "src/tempobook/**",
      "src/storyboards/**",
    ],
    benchmark: {
      include: ["src/test/performance/**/*.{test,spec}.{js,ts}"],
      exclude: ["node_modules", "dist"],
    },
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
    maxConcurrency: 5,
    minThreads: 1,
    maxThreads: 4,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    reporters: ["verbose", "junit"],
    outputFile: {
      junit: "./coverage/junit.xml",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
