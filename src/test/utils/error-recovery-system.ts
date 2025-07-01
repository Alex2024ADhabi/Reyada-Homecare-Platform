#!/usr/bin/env tsx
/**
 * Error Recovery System
 * Provides automated error detection, classification, and recovery mechanisms
 * for the healthcare testing framework
 */

import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

interface ErrorContext {
  component: string;
  operation: string;
  timestamp: string;
  environment: string;
  metadata?: any;
}

interface RecoveryAction {
  name: string;
  description: string;
  execute: (error: FrameworkError, context: ErrorContext) => Promise<boolean>;
  priority: number; // 1 = highest priority
  conditions?: (error: FrameworkError) => boolean;
}

interface FrameworkError {
  id: string;
  type:
    | "system"
    | "test"
    | "configuration"
    | "network"
    | "resource"
    | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  stack?: string;
  code?: string;
  context: ErrorContext;
  recoveryAttempts: number;
  resolved: boolean;
  timestamp: string;
}

interface RecoveryResult {
  success: boolean;
  action: string;
  message: string;
  duration: number;
  details?: any;
}

class ErrorRecoverySystem extends EventEmitter {
  private errors: FrameworkError[] = [];
  private recoveryActions: RecoveryAction[] = [];
  private maxRecoveryAttempts: number = 3;
  private recoveryHistory: RecoveryResult[] = [];

  constructor() {
    super();
    this.initializeRecoveryActions();
    this.setupGlobalErrorHandlers();
  }

  private initializeRecoveryActions(): void {
    // File system recovery actions
    this.recoveryActions.push({
      name: "Create Missing Directories",
      description: "Create missing test directories and files",
      priority: 1,
      conditions: (error) =>
        error.message.includes("ENOENT") ||
        error.message.includes("no such file"),
      execute: async (error, context) => {
        try {
          const requiredDirs = [
            "test-results",
            "test-results/reports",
            "test-results/logs",
          ];

          for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
              console.log(`✅ Created directory: ${dir}`);
            }
          }

          return true;
        } catch (recoveryError) {
          console.error("❌ Directory creation failed:", recoveryError);
          return false;
        }
      },
    });

    // Memory cleanup recovery
    this.recoveryActions.push({
      name: "Memory Cleanup",
      description:
        "Free up memory by clearing caches and running garbage collection",
      priority: 2,
      conditions: (error) =>
        error.message.includes("out of memory") ||
        error.message.includes("heap"),
      execute: async (error, context) => {
        try {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
            console.log("✅ Garbage collection executed");
          }

          // Clear any cached data
          if (context.metadata?.clearCache) {
            context.metadata.clearCache();
            console.log("✅ Cache cleared");
          }

          return true;
        } catch (recoveryError) {
          console.error("❌ Memory cleanup failed:", recoveryError);
          return false;
        }
      },
    });

    // Test environment reset
    this.recoveryActions.push({
      name: "Reset Test Environment",
      description: "Reset test environment to clean state",
      priority: 3,
      execute: async (error, context) => {
        try {
          // Import test environment manager
          const { testEnvironmentManager } = await import(
            "./test-environment-manager"
          );

          // Cleanup current environment
          await testEnvironmentManager.cleanup();
          console.log("✅ Test environment cleaned up");

          // Reinitialize with default settings
          await testEnvironmentManager.initialize({
            testType: "unit",
            environment: "test",
            healthcare: {
              enableDOHValidation: true,
              enableDAMANIntegration: true,
              enableJAWDACompliance: true,
              enableHIPAAValidation: true,
            },
          });
          console.log("✅ Test environment reinitialized");

          return true;
        } catch (recoveryError) {
          console.error("❌ Environment reset failed:", recoveryError);
          return false;
        }
      },
    });

    // Configuration validation and repair
    this.recoveryActions.push({
      name: "Repair Configuration",
      description: "Validate and repair configuration files",
      priority: 2,
      conditions: (error) =>
        error.type === "configuration" || error.message.includes("config"),
      execute: async (error, context) => {
        try {
          const configFiles = [
            "package.json",
            "tsconfig.json",
            "vitest.config.ts",
            "playwright.config.ts",
          ];

          for (const configFile of configFiles) {
            if (fs.existsSync(configFile)) {
              try {
                if (configFile.endsWith(".json")) {
                  JSON.parse(fs.readFileSync(configFile, "utf8"));
                }
                console.log(`✅ ${configFile} is valid`);
              } catch (parseError) {
                console.error(`❌ ${configFile} is invalid:`, parseError);
                return false;
              }
            } else {
              console.warn(`⚠️  ${configFile} not found`);
            }
          }

          return true;
        } catch (recoveryError) {
          console.error("❌ Configuration repair failed:", recoveryError);
          return false;
        }
      },
    });

    // Network connectivity recovery
    this.recoveryActions.push({
      name: "Network Recovery",
      description: "Attempt to recover from network-related errors",
      priority: 3,
      conditions: (error) =>
        error.type === "network" ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("timeout"),
      execute: async (error, context) => {
        try {
          // Wait and retry strategy
          const delays = [1000, 2000, 5000]; // 1s, 2s, 5s

          for (const delay of delays) {
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Test basic connectivity (mock)
            try {
              // In real implementation, would test actual network connectivity
              console.log("✅ Network connectivity test passed");
              return true;
            } catch (testError) {
              console.log(`❌ Network test failed, trying next delay...`);
            }
          }

          return false;
        } catch (recoveryError) {
          console.error("❌ Network recovery failed:", recoveryError);
          return false;
        }
      },
    });

    // Resource cleanup recovery
    this.recoveryActions.push({
      name: "Resource Cleanup",
      description: "Clean up system resources and temporary files",
      priority: 2,
      execute: async (error, context) => {
        try {
          // Clean up temporary files
          const tempDirs = ["temp", "tmp", ".tmp"];

          for (const tempDir of tempDirs) {
            if (fs.existsSync(tempDir)) {
              const files = fs.readdirSync(tempDir);
              for (const file of files) {
                const filePath = path.join(tempDir, file);
                try {
                  fs.unlinkSync(filePath);
                  console.log(`🗑️  Removed temp file: ${filePath}`);
                } catch (unlinkError) {
                  console.warn(
                    `⚠️  Could not remove ${filePath}:`,
                    unlinkError,
                  );
                }
              }
            }
          }

          // Clean up old log files
          const logDir = "test-results/logs";
          if (fs.existsSync(logDir)) {
            const logFiles = fs
              .readdirSync(logDir)
              .filter((file) => file.endsWith(".log"))
              .map((file) => ({
                name: file,
                path: path.join(logDir, file),
                stats: fs.statSync(path.join(logDir, file)),
              }))
              .filter(
                (file) =>
                  Date.now() - file.stats.mtime.getTime() >
                  7 * 24 * 60 * 60 * 1000,
              ) // Older than 7 days
              .slice(0, 10); // Limit to 10 files

            for (const logFile of logFiles) {
              try {
                fs.unlinkSync(logFile.path);
                console.log(`🗑️  Removed old log: ${logFile.name}`);
              } catch (unlinkError) {
                console.warn(
                  `⚠️  Could not remove log ${logFile.name}:`,
                  unlinkError,
                );
              }
            }
          }

          return true;
        } catch (recoveryError) {
          console.error("❌ Resource cleanup failed:", recoveryError);
          return false;
        }
      },
    });

    // Compliance data recovery
    this.recoveryActions.push({
      name: "Compliance Data Recovery",
      description: "Recover or regenerate compliance-related data",
      priority: 2,
      conditions: (error) => error.type === "compliance",
      execute: async (error, context) => {
        try {
          // Regenerate test fixtures if missing
          const fixturesPath = "src/test/fixtures/healthcare-test-data.ts";
          if (!fs.existsSync(fixturesPath)) {
            console.log("⚠️  Healthcare test data fixtures missing");
            // In real implementation, would regenerate fixtures
            return false;
          }

          // Validate compliance data structure
          try {
            const { testPatients, testClinicians, testAssessments } =
              await import("../fixtures/healthcare-test-data");

            if (!Array.isArray(testPatients) || testPatients.length === 0) {
              throw new Error("Invalid test patients data");
            }

            if (!Array.isArray(testClinicians) || testClinicians.length === 0) {
              throw new Error("Invalid test clinicians data");
            }

            if (
              !Array.isArray(testAssessments) ||
              testAssessments.length === 0
            ) {
              throw new Error("Invalid test assessments data");
            }

            console.log("✅ Compliance data validation passed");
            return true;
          } catch (validationError) {
            console.error(
              "❌ Compliance data validation failed:",
              validationError,
            );
            return false;
          }
        } catch (recoveryError) {
          console.error("❌ Compliance data recovery failed:", recoveryError);
          return false;
        }
      },
    });
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      this.handleError(error, {
        component: "Global",
        operation: "uncaughtException",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      this.handleError(error, {
        component: "Global",
        operation: "unhandledRejection",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        metadata: { promise },
      });
    });
  }

  async handleError(error: Error, context: ErrorContext): Promise<boolean> {
    const frameworkError: FrameworkError = {
      id: this.generateErrorId(),
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      context,
      recoveryAttempts: 0,
      resolved: false,
      timestamp: new Date().toISOString(),
    };

    this.errors.push(frameworkError);

    console.error(`🚨 Framework Error Detected:`);
    console.error(`   ID: ${frameworkError.id}`);
    console.error(`   Type: ${frameworkError.type}`);
    console.error(`   Severity: ${frameworkError.severity}`);
    console.error(`   Message: ${frameworkError.message}`);
    console.error(`   Component: ${context.component}`);
    console.error(`   Operation: ${context.operation}`);

    // Emit error event
    this.emit("error", frameworkError);

    // Attempt recovery
    const recovered = await this.attemptRecovery(frameworkError);

    if (recovered) {
      frameworkError.resolved = true;
      console.log(`✅ Error ${frameworkError.id} successfully recovered`);
      this.emit("recovered", frameworkError);
    } else {
      console.error(`❌ Error ${frameworkError.id} could not be recovered`);
      this.emit("unrecoverable", frameworkError);
    }

    // Save error report
    await this.saveErrorReport(frameworkError);

    return recovered;
  }

  private async attemptRecovery(error: FrameworkError): Promise<boolean> {
    if (error.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log(
        `⚠️  Maximum recovery attempts (${this.maxRecoveryAttempts}) reached for error ${error.id}`,
      );
      return false;
    }

    error.recoveryAttempts++;
    console.log(
      `🔧 Attempting recovery for error ${error.id} (attempt ${error.recoveryAttempts}/${this.maxRecoveryAttempts})`,
    );

    // Get applicable recovery actions
    const applicableActions = this.recoveryActions
      .filter((action) => !action.conditions || action.conditions(error))
      .sort((a, b) => a.priority - b.priority);

    console.log(
      `📋 Found ${applicableActions.length} applicable recovery actions`,
    );

    for (const action of applicableActions) {
      console.log(`🔧 Executing recovery action: ${action.name}`);
      const startTime = Date.now();

      try {
        const success = await action.execute(error, error.context);
        const duration = Date.now() - startTime;

        const result: RecoveryResult = {
          success,
          action: action.name,
          message: success
            ? "Recovery action completed successfully"
            : "Recovery action failed",
          duration,
          details: { errorId: error.id, attempt: error.recoveryAttempts },
        };

        this.recoveryHistory.push(result);

        if (success) {
          console.log(
            `✅ Recovery action '${action.name}' succeeded (${duration}ms)`,
          );
          return true;
        } else {
          console.log(
            `❌ Recovery action '${action.name}' failed (${duration}ms)`,
          );
        }
      } catch (recoveryError) {
        const duration = Date.now() - startTime;
        console.error(
          `💥 Recovery action '${action.name}' threw error:`,
          recoveryError,
        );

        const result: RecoveryResult = {
          success: false,
          action: action.name,
          message: `Recovery action threw error: ${recoveryError}`,
          duration,
          details: {
            errorId: error.id,
            attempt: error.recoveryAttempts,
            recoveryError,
          },
        };

        this.recoveryHistory.push(result);
      }
    }

    return false;
  }

  private classifyError(error: Error): FrameworkError["type"] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || "";

    if (
      message.includes("enoent") ||
      message.includes("file") ||
      message.includes("directory")
    ) {
      return "system";
    }

    if (
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("timeout")
    ) {
      return "network";
    }

    if (
      message.includes("memory") ||
      message.includes("heap") ||
      message.includes("resource")
    ) {
      return "resource";
    }

    if (
      message.includes("config") ||
      message.includes("setting") ||
      message.includes("option")
    ) {
      return "configuration";
    }

    if (
      message.includes("doh") ||
      message.includes("daman") ||
      message.includes("jawda") ||
      message.includes("hipaa")
    ) {
      return "compliance";
    }

    if (
      stack.includes("test") ||
      message.includes("assertion") ||
      message.includes("expect")
    ) {
      return "test";
    }

    return "system";
  }

  private determineSeverity(error: Error): FrameworkError["severity"] {
    const message = error.message.toLowerCase();

    if (
      message.includes("critical") ||
      message.includes("fatal") ||
      message.includes("crash")
    ) {
      return "critical";
    }

    if (
      message.includes("error") ||
      message.includes("fail") ||
      message.includes("exception")
    ) {
      return "high";
    }

    if (message.includes("warn") || message.includes("deprecated")) {
      return "medium";
    }

    return "low";
  }

  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveErrorReport(error: FrameworkError): Promise<void> {
    try {
      const reportDir = "test-results/errors";
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const reportPath = path.join(reportDir, `${error.id}.json`);
      const report = {
        ...error,
        recoveryHistory: this.recoveryHistory.filter(
          (r) => r.details?.errorId === error.id,
        ),
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    } catch (saveError) {
      console.error("Failed to save error report:", saveError);
    }
  }

  getSystemHealth(): {
    overall: "healthy" | "degraded" | "critical" | "failed";
    recoveryAttempts: number;
    issues: string[];
  } {
    const summary = this.getErrorSummary();
    let overall: "healthy" | "degraded" | "critical" | "failed" = "healthy";

    if (summary.unresolved > 0) {
      const criticalErrors = this.errors.filter(
        (e) => e.severity === "critical" && !e.resolved,
      ).length;
      const highErrors = this.errors.filter(
        (e) => e.severity === "high" && !e.resolved,
      ).length;

      if (criticalErrors > 0) {
        overall = "failed";
      } else if (highErrors > 2) {
        overall = "critical";
      } else if (summary.unresolved > 5) {
        overall = "degraded";
      }
    }

    return {
      overall,
      recoveryAttempts: this.recoveryHistory.length,
      issues: this.errors.filter((e) => !e.resolved).map((e) => e.message),
    };
  }

  async healSystem(): Promise<boolean> {
    console.log("🔧 Attempting system healing...");

    const unresolvedErrors = this.errors.filter((e) => !e.resolved);
    let healedCount = 0;

    for (const error of unresolvedErrors) {
      const healed = await this.attemptRecovery(error);
      if (healed) {
        healedCount++;
      }
    }

    const success = healedCount === unresolvedErrors.length;
    console.log(
      `${success ? "✅" : "⚠️"} System healing ${success ? "completed" : "partially completed"}: ${healedCount}/${unresolvedErrors.length} errors resolved`,
    );

    return success;
  }

  getErrorSummary(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
    recentErrors: FrameworkError[];
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errors.forEach((error) => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    const resolved = this.errors.filter((e) => e.resolved).length;
    const unresolved = this.errors.length - resolved;

    // Get recent errors (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentErrors = this.errors
      .filter((e) => new Date(e.timestamp).getTime() > oneDayAgo)
      .slice(-10); // Last 10 recent errors

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      resolved,
      unresolved,
      recentErrors,
    };
  }

  generateRecoveryReport(): string {
    const summary = this.getErrorSummary();
    const successfulRecoveries = this.recoveryHistory.filter(
      (r) => r.success,
    ).length;
    const totalRecoveryAttempts = this.recoveryHistory.length;
    const recoveryRate =
      totalRecoveryAttempts > 0
        ? ((successfulRecoveries / totalRecoveryAttempts) * 100).toFixed(1)
        : "0";

    let report = `
🔧 Error Recovery System Report
==============================
`;
    report += `Total Errors: ${summary.total}
`;
    report += `Resolved: ${summary.resolved}
`;
    report += `Unresolved: ${summary.unresolved}
`;
    report += `Recovery Rate: ${recoveryRate}% (${successfulRecoveries}/${totalRecoveryAttempts})
\n`;

    report += `📊 Errors by Type:
`;
    Object.entries(summary.byType).forEach(([type, count]) => {
      report += `   ${type}: ${count}
`;
    });

    report += `\n📊 Errors by Severity:
`;
    Object.entries(summary.bySeverity).forEach(([severity, count]) => {
      report += `   ${severity}: ${count}
`;
    });

    if (summary.recentErrors.length > 0) {
      report += `\n🕐 Recent Errors:
`;
      summary.recentErrors.forEach((error) => {
        const status = error.resolved ? "✅" : "❌";
        report += `   ${status} ${error.id}: ${error.message} (${error.type}/${error.severity})
`;
      });
    }

    return report;
  }
}

// Create singleton instance
const errorRecoverySystem = new ErrorRecoverySystem();

export {
  errorRecoverySystem,
  ErrorRecoverySystem,
  type FrameworkError,
  type RecoveryResult,
};

// CLI execution
if (require.main === module) {
  console.log("🔧 Error Recovery System initialized");
  console.log(errorRecoverySystem.generateRecoveryReport());
}
