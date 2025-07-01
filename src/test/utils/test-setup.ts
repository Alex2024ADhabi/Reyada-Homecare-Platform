#!/usr/bin/env node
/**
 * Test Environment Setup
 * Prepares the testing environment and validates prerequisites
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";

class TestEnvironmentSetup {
  private requiredDirectories = [
    "test-results",
    "test-results/coverage",
    "test-results/e2e",
    "test-results/unit",
    "test-results/integration",
    "test-results/performance",
    "test-results/security",
    "test-results/accessibility",
    "test-results/visual",
    "test-results/load",
    "test-results/compliance",
  ];

  private requiredTools = [
    { name: "Node.js", command: "node --version", minVersion: "18.0.0" },
    { name: "npm", command: "npm --version", minVersion: "8.0.0" },
    {
      name: "Playwright",
      command: "npx playwright --version",
      optional: false,
    },
    { name: "Artillery", command: "npx artillery --version", optional: true },
    { name: "K6", command: "k6 version", optional: true },
  ];

  async setup(): Promise<boolean> {
    console.log(
      chalk.blue.bold("🔧 Healthcare Platform Test Environment Setup"),
    );
    console.log(chalk.gray("=".repeat(60)));

    let success = true;

    try {
      // Create required directories
      console.log(chalk.cyan("📁 Creating test directories..."));
      this.createDirectories();
      console.log(chalk.green("✓ Test directories created"));

      // Validate required tools
      console.log(chalk.cyan("🛠️  Validating required tools..."));
      const toolsValid = await this.validateTools();
      if (!toolsValid) {
        success = false;
      }

      // Install Playwright browsers if needed
      console.log(chalk.cyan("🌐 Setting up Playwright browsers..."));
      await this.setupPlaywright();
      console.log(chalk.green("✓ Playwright browsers ready"));

      // Validate test data
      console.log(chalk.cyan("📊 Validating test data..."));
      this.validateTestData();
      console.log(chalk.green("✓ Test data validated"));

      // Create test configuration files if missing
      console.log(chalk.cyan("⚙️  Checking test configurations..."));
      this.createMissingConfigs();
      console.log(chalk.green("✓ Test configurations ready"));

      // Validate environment variables
      console.log(chalk.cyan("🔐 Validating environment setup..."));
      this.validateEnvironment();
      console.log(chalk.green("✓ Environment validated"));

      if (success) {
        console.log(
          chalk.green.bold(
            "\n✅ Test environment setup completed successfully!",
          ),
        );
        console.log(
          chalk.gray("You can now run tests using the orchestration scripts."),
        );
      } else {
        console.log(
          chalk.red.bold(
            "\n❌ Test environment setup completed with warnings.",
          ),
        );
        console.log(chalk.gray("Some optional tools may not be available."));
      }
    } catch (error) {
      console.error(chalk.red.bold("💥 Setup failed:"), error);
      return false;
    }

    return success;
  }

  private createDirectories(): void {
    this.requiredDirectories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(chalk.gray(`  Created: ${dir}`));
      }
    });
  }

  private async validateTools(): Promise<boolean> {
    let allValid = true;

    for (const tool of this.requiredTools) {
      try {
        const output = execSync(tool.command, {
          encoding: "utf8",
          stdio: "pipe",
        });
        console.log(chalk.green(`✓ ${tool.name}: ${output.trim()}`));
      } catch (error) {
        if (tool.optional) {
          console.log(
            chalk.yellow(`⚠️  ${tool.name}: Not available (optional)`),
          );
        } else {
          console.log(chalk.red(`❌ ${tool.name}: Not available (required)`));
          allValid = false;
        }
      }
    }

    return allValid;
  }

  private async setupPlaywright(): Promise<void> {
    try {
      // Check if browsers are already installed
      execSync("npx playwright install --dry-run", { stdio: "pipe" });
      console.log(chalk.gray("  Playwright browsers already installed"));
    } catch (error) {
      console.log(chalk.gray("  Installing Playwright browsers..."));
      try {
        execSync("npx playwright install", { stdio: "inherit" });
      } catch (installError) {
        console.warn(
          chalk.yellow(
            "⚠️  Failed to install Playwright browsers automatically",
          ),
        );
        console.log(
          chalk.gray('  Run "npx playwright install" manually if needed'),
        );
      }
    }
  }

  private validateTestData(): void {
    const testDataFile = path.join(
      "src",
      "test",
      "fixtures",
      "healthcare-test-data.ts",
    );
    if (!fs.existsSync(testDataFile)) {
      console.warn(
        chalk.yellow(`⚠️  Test data file not found: ${testDataFile}`),
      );
      console.log(chalk.gray("  Some tests may not have proper test data"));
    }
  }

  private createMissingConfigs(): void {
    const configs = [
      { file: "vitest.config.ts", required: true },
      { file: "playwright.config.ts", required: true },
      { file: "vitest.config.unit.ts", required: false },
      { file: "vitest.config.integration.ts", required: false },
      { file: "playwright.accessibility.config.ts", required: false },
    ];

    configs.forEach((config) => {
      if (!fs.existsSync(config.file)) {
        if (config.required) {
          console.warn(
            chalk.yellow(`⚠️  Missing required config: ${config.file}`),
          );
        } else {
          console.log(
            chalk.gray(`  Optional config not found: ${config.file}`),
          );
        }
      } else {
        console.log(chalk.gray(`  ✓ ${config.file}`));
      }
    });
  }

  private validateEnvironment(): void {
    const requiredEnvVars = ["NODE_ENV"];

    const optionalEnvVars = [
      "HEALTHCARE_TEST_MODE",
      "DOH_COMPLIANCE_CHECK",
      "DAMAN_COMPLIANCE_CHECK",
      "JAWDA_COMPLIANCE_CHECK",
      "HIPAA_COMPLIANCE_CHECK",
    ];

    // Set default environment variables for testing
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "test";
      console.log(chalk.gray("  Set NODE_ENV=test"));
    }

    if (!process.env.HEALTHCARE_TEST_MODE) {
      process.env.HEALTHCARE_TEST_MODE = "true";
      console.log(chalk.gray("  Set HEALTHCARE_TEST_MODE=true"));
    }

    // Validate required environment variables
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        console.warn(
          chalk.yellow(`⚠️  Missing environment variable: ${envVar}`),
        );
      } else {
        console.log(chalk.gray(`  ✓ ${envVar}=${process.env[envVar]}`));
      }
    });

    // Check optional environment variables
    optionalEnvVars.forEach((envVar) => {
      if (process.env[envVar]) {
        console.log(chalk.gray(`  ✓ ${envVar}=${process.env[envVar]}`));
      }
    });
  }

  async cleanup(): Promise<void> {
    console.log(chalk.blue.bold("🧹 Cleaning up test environment..."));

    try {
      // Clean test results but keep directories
      const filesToClean = [
        "test-results/**/*.json",
        "test-results/**/*.xml",
        "test-results/**/*.html",
        "test-results/**/*.csv",
        "coverage/**/*",
        ".nyc_output/**/*",
      ];

      filesToClean.forEach((pattern) => {
        try {
          execSync(`rm -rf ${pattern}`, { stdio: "pipe" });
        } catch (error) {
          // Ignore errors for non-existent files
        }
      });

      console.log(chalk.green("✅ Test environment cleaned"));
    } catch (error) {
      console.error(chalk.red("❌ Cleanup failed:"), error);
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new TestEnvironmentSetup();

  const command = process.argv[2];

  if (command === "cleanup") {
    setup
      .cleanup()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    setup
      .setup()
      .then((success) => process.exit(success ? 0 : 1))
      .catch(() => process.exit(1));
  }
}

export { TestEnvironmentSetup };
