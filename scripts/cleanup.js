#!/usr/bin/env node

/**
 * Cleanup Script for Reyada Homecare Platform
 * Handles resource cleanup and process management
 */

const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

class CleanupManager {
  constructor() {
    this.isWindows = process.platform === "win32";
    this.projectRoot = process.cwd();
  }

  /**
   * Main cleanup function
   */
  async cleanup(options = {}) {
    const {
      killProcesses = true,
      clearCache = true,
      clearDist = true,
      clearNodeModules = false,
      force = false,
    } = options;

    console.log("🧹 Starting Reyada Platform cleanup...");
    console.log(`📁 Project root: ${this.projectRoot}`);

    const tasks = [];

    if (killProcesses) {
      tasks.push(this.killProcesses());
    }

    if (clearCache) {
      tasks.push(this.clearCache());
    }

    if (clearDist) {
      tasks.push(this.clearDist());
    }

    if (clearNodeModules) {
      tasks.push(this.clearNodeModules(force));
    }

    try {
      await Promise.allSettled(tasks);
      console.log("✅ Cleanup completed successfully");
    } catch (error) {
      console.error("❌ Cleanup failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Kill webpack and related processes
   */
  async killProcesses() {
    console.log("🔪 Killing webpack processes...");

    const processNames = [
      "webpack",
      "webpack-dev-server",
      "webpack-cli",
      "ts-loader",
      "babel-loader",
      "node",
    ];

    for (const processName of processNames) {
      try {
        if (this.isWindows) {
          await execAsync(`taskkill /F /IM ${processName}.exe /T`);
        } else {
          await execAsync(`pkill -f ${processName}`);
        }
        console.log(`✅ Killed ${processName} processes`);
      } catch (error) {
        // Process might not be running, which is fine
        if (
          !error.message.includes("No such process") &&
          !error.message.includes("not found")
        ) {
          console.warn(`⚠️ Could not kill ${processName}:`, error.message);
        }
      }
    }

    // Wait a moment for processes to fully terminate
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  /**
   * Clear webpack and build cache
   */
  async clearCache() {
    console.log("🗑️ Clearing cache directories...");

    const cacheDirectories = [
      ".webpack-cache",
      "node_modules/.cache",
      ".cache",
      "temp",
      ".tmp",
    ];

    for (const dir of cacheDirectories) {
      const fullPath = path.resolve(this.projectRoot, dir);
      try {
        if (fs.existsSync(fullPath)) {
          await this.removeDirectory(fullPath);
          console.log(`✅ Removed ${dir}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not remove ${dir}:`, error.message);
      }
    }
  }

  /**
   * Clear build output directories
   */
  async clearDist() {
    console.log("🗑️ Clearing build directories...");

    const buildDirectories = ["dist", "build", "out"];

    for (const dir of buildDirectories) {
      const fullPath = path.resolve(this.projectRoot, dir);
      try {
        if (fs.existsSync(fullPath)) {
          await this.removeDirectory(fullPath);
          console.log(`✅ Removed ${dir}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not remove ${dir}:`, error.message);
      }
    }
  }

  /**
   * Clear node_modules (use with caution)
   */
  async clearNodeModules(force = false) {
    if (!force) {
      console.log("⚠️ Skipping node_modules cleanup (use --force to enable)");
      return;
    }

    console.log("🗑️ Clearing node_modules...");

    const nodeModulesPath = path.resolve(this.projectRoot, "node_modules");

    try {
      if (fs.existsSync(nodeModulesPath)) {
        // Try multiple approaches to remove node_modules
        await this.forceRemoveNodeModules(nodeModulesPath);
        console.log("✅ Removed node_modules");
      }
    } catch (error) {
      console.error("❌ Could not remove node_modules:", error.message);
      console.log("💡 Try running: npm run force-cleanup");
    }
  }

  /**
   * Force remove node_modules with multiple strategies
   */
  async forceRemoveNodeModules(nodeModulesPath) {
    const strategies = [
      // Strategy 1: Standard fs.rmSync
      () => fs.rmSync(nodeModulesPath, { recursive: true, force: true }),

      // Strategy 2: Command line removal
      () => {
        if (this.isWindows) {
          return execAsync(`rmdir /s /q "${nodeModulesPath}"`);
        } else {
          return execAsync(`rm -rf "${nodeModulesPath}"`);
        }
      },

      // Strategy 3: Rename and remove
      async () => {
        const tempName = `${nodeModulesPath}_temp_${Date.now()}`;
        fs.renameSync(nodeModulesPath, tempName);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        fs.rmSync(tempName, { recursive: true, force: true });
      },
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        await strategies[i]();
        return; // Success, exit
      } catch (error) {
        console.warn(`⚠️ Strategy ${i + 1} failed:`, error.message);
        if (i === strategies.length - 1) {
          throw error; // Last strategy failed, re-throw
        }
      }
    }
  }

  /**
   * Remove directory with retry logic
   */
  async removeDirectory(dirPath, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
        return;
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.warn(`⚠️ Retry ${i + 1}/${retries} for ${dirPath}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    console.log("🏥 Running health check...");

    const checks = [
      {
        name: "Node.js",
        check: () => execAsync("node --version"),
      },
      {
        name: "NPM",
        check: () => execAsync("npm --version"),
      },
      {
        name: "Webpack",
        check: () => execAsync("npx webpack --version"),
      },
      {
        name: "TypeScript",
        check: () => execAsync("npx tsc --version"),
      },
    ];

    for (const { name, check } of checks) {
      try {
        const { stdout } = await check();
        console.log(`✅ ${name}: ${stdout.trim()}`);
      } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    killProcesses: !args.includes("--no-kill"),
    clearCache: !args.includes("--no-cache"),
    clearDist: !args.includes("--no-dist"),
    clearNodeModules: args.includes("--node-modules"),
    force: args.includes("--force"),
  };

  const cleanup = new CleanupManager();

  if (args.includes("--health")) {
    cleanup.healthCheck();
  } else {
    cleanup.cleanup(options);
  }
}

module.exports = CleanupManager;
