import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    supportFile: "src/test/cypress/support/e2e.ts",
    specPattern: "src/test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    fixturesFolder: "src/test/cypress/fixtures",
    screenshotsFolder: "test-results/cypress/screenshots",
    videosFolder: "test-results/cypress/videos",
    downloadsFolder: "test-results/cypress/downloads",
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    experimentalStudio: true,
    experimentalWebKitSupport: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      // Code coverage
      require("@cypress/code-coverage/task")(on, config);

      // Accessibility testing
      on("task", {
        "axe-core:run": require("./src/test/cypress/plugins/axe-task"),
      });

      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "src/test/cypress/support/component.ts",
  },

  env: {
    coverage: true,
    codeCoverage: {
      exclude: "cypress/**/*.*",
    },
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },

  watchForFileChanges: false,
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  blockHosts: ["*.google-analytics.com", "*.googletagmanager.com"],
});
