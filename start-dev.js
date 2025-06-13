const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Enhanced process management with robust cleanup
class DevServerManager {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.pidFile = path.join(os.tmpdir(), "reyada-dev-server.pid");
    this.setupSignalHandlers();
  }

  // Robust process cleanup without pkill
  async cleanupExistingProcesses() {
    console.log("🧹 Cleaning up existing processes...");

    try {
      // Check for existing PID file
      if (fs.existsSync(this.pidFile)) {
        const pidData = fs.readFileSync(this.pidFile, "utf8");
        const pids = pidData.split("\n").filter((pid) => pid.trim());

        for (const pid of pids) {
          try {
            process.kill(parseInt(pid), "SIGTERM");
            console.log(`✅ Terminated process ${pid}`);
          } catch (error) {
            // Process already dead or doesn't exist
            console.log(`⚠️ Process ${pid} not found or already terminated`);
          }
        }

        // Wait for graceful shutdown
        await this.sleep(2000);

        // Force kill if still running
        for (const pid of pids) {
          try {
            process.kill(parseInt(pid), "SIGKILL");
          } catch (error) {
            // Process already dead
          }
        }

        fs.unlinkSync(this.pidFile);
      }

      // Alternative cleanup using Node.js process management
      await this.cleanupNodeProcesses();

      console.log("✅ Process cleanup complete");
    } catch (error) {
      console.warn("⚠️ Cleanup warning:", error.message);
      // Continue anyway - don't let cleanup failures block startup
    }
  }

  // Alternative to pkill using Node.js process management
  async cleanupNodeProcesses() {
    return new Promise((resolve) => {
      // Use Node.js built-in process management instead of shell commands
      const command =
        process.platform === "win32"
          ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr webpack'
          : "ps aux | grep webpack | grep -v grep";

      exec(command, { timeout: 5000 }, (error, stdout) => {
        if (stdout && stdout.trim()) {
          console.log(
            "🔍 Found existing webpack processes, attempting cleanup...",
          );

          if (process.platform === "win32") {
            exec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq webpack*"', () =>
              resolve(),
            );
          } else {
            // Use more targeted approach instead of pkill
            exec(
              "ps aux | grep webpack | grep -v grep | awk '{print $2}' | xargs -r kill -TERM",
              () => {
                setTimeout(() => {
                  exec(
                    "ps aux | grep webpack | grep -v grep | awk '{print $2}' | xargs -r kill -KILL",
                    () => resolve(),
                  );
                }, 2000);
              },
            );
          }
        } else {
          resolve();
        }
      });
    });
  }

  // Create PID tracking file
  trackProcess(name, process) {
    this.processes.set(name, process);

    const pids = Array.from(this.processes.values())
      .filter((p) => p && p.pid)
      .map((p) => p.pid.toString());

    try {
      fs.writeFileSync(this.pidFile, pids.join("\n"));
    } catch (error) {
      console.warn("⚠️ Could not write PID file:", error.message);
    }
  }

  // Enhanced process spawning with better error handling
  spawnProcess(name, command, args, options = {}) {
    console.log(`🚀 Starting ${name}...`);

    const defaultOptions = {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "development",
        FORCE_COLOR: "1",
      },
      detached: false,
      ...options,
    };

    const childProcess = spawn(command, args, defaultOptions);

    childProcess.on("error", (error) => {
      console.error(`❌ ${name} failed to start:`, error.message);
      this.handleProcessError(name, error);
    });

    childProcess.on("close", (code, signal) => {
      console.log(`📊 ${name} exited with code ${code} and signal ${signal}`);
      this.processes.delete(name);

      if (!this.isShuttingDown && code !== 0) {
        console.log(`🔄 Attempting to restart ${name}...`);
        setTimeout(() => this.restartProcess(name), 3000);
      }
    });

    this.trackProcess(name, childProcess);
    return childProcess;
  }

  // Process restart logic
  restartProcess(name) {
    if (this.isShuttingDown) return;

    console.log(`🔄 Restarting ${name}...`);

    if (name === "frontend") {
      this.startFrontend();
    } else if (name === "api") {
      this.startAPI();
    }
  }

  // Handle process errors gracefully
  handleProcessError(name, error) {
    console.error(`🚨 ${name} error:`, error.message);

    // Common error recovery strategies
    if (error.code === "EADDRINUSE") {
      console.log("🔧 Port already in use, attempting cleanup...");
      setTimeout(
        () =>
          this.cleanupExistingProcesses().then(() => this.restartProcess(name)),
        1000,
      );
    } else if (error.code === "ENOENT") {
      console.log("🔧 Command not found, checking dependencies...");
      this.checkDependencies();
    }
  }

  // Check if required dependencies are installed
  async checkDependencies() {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const requiredDeps = ["webpack", "webpack-dev-server", "webpack-cli"];

      for (const dep of requiredDeps) {
        if (
          !packageJson.dependencies?.[dep] &&
          !packageJson.devDependencies?.[dep]
        ) {
          console.log(`⚠️ Missing dependency: ${dep}`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not check dependencies:", error.message);
    }
  }

  // Start frontend development server
  startFrontend() {
    // Use webpack-dev-server directly instead of npm script to avoid shell issues
    const webpackDevServer = path.join(
      process.cwd(),
      "node_modules",
      ".bin",
      "webpack",
    );
    const args = [
      "serve",
      "--mode",
      "development",
      "--config",
      "webpack.config.cjs",
      "--port",
      "3001",
    ];

    return this.spawnProcess("frontend", "node", [webpackDevServer, ...args], {
      cwd: process.cwd(),
    });
  }

  // Start API server
  startAPI() {
    const args = ["--loader", "ts-node/esm", "src/api/index.ts"];

    return this.spawnProcess("api", "node", args, {
      cwd: process.cwd(),
    });
  }

  // Setup signal handlers for graceful shutdown
  setupSignalHandlers() {
    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

    signals.forEach((signal) => {
      process.on(signal, () => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        this.shutdown();
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("🚨 Uncaught Exception:", error);
      this.shutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
      this.shutdown(1);
    });
  }

  // Graceful shutdown
  async shutdown(exitCode = 0) {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    console.log("🔄 Shutting down all processes...");

    // Terminate all tracked processes
    for (const [name, process] of this.processes) {
      if (process && process.pid) {
        console.log(`🛑 Terminating ${name} (PID: ${process.pid})`);
        try {
          process.kill("SIGTERM");
        } catch (error) {
          console.warn(`⚠️ Could not terminate ${name}:`, error.message);
        }
      }
    }

    // Wait for graceful shutdown
    await this.sleep(3000);

    // Force kill if necessary
    for (const [name, process] of this.processes) {
      if (process && process.pid) {
        try {
          process.kill("SIGKILL");
        } catch (error) {
          // Process already terminated
        }
      }
    }

    // Clean up PID file
    try {
      if (fs.existsSync(this.pidFile)) {
        fs.unlinkSync(this.pidFile);
      }
    } catch (error) {
      console.warn("⚠️ Could not clean up PID file:", error.message);
    }

    console.log("✅ Shutdown complete");
    process.exit(exitCode);
  }

  // Utility sleep function
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Main startup sequence
  async start() {
    try {
      console.log("🚀 Starting Reyada Homecare Platform Development Server...");
      console.log("📍 Working directory:", process.cwd());
      console.log("🌍 Node version:", process.version);
      console.log("💻 Platform:", process.platform);

      // Clean up any existing processes
      await this.cleanupExistingProcesses();

      // Check dependencies
      await this.checkDependencies();

      // Start API server
      console.log("\n🔧 Starting API server...");
      const apiServer = this.startAPI();

      // Wait a moment for API to initialize
      await this.sleep(2000);

      // Start frontend server
      console.log("\n🎨 Starting frontend development server...");
      const frontendServer = this.startFrontend();

      console.log("\n✅ Development servers started successfully!");
      console.log("🌐 Frontend: http://localhost:3001");
      console.log("🔌 API: http://localhost:8000");
      console.log("\n📝 Press Ctrl+C to stop all servers");
    } catch (error) {
      console.error("❌ Failed to start development servers:", error);
      await this.shutdown(1);
    }
  }
}

// Create and start the development server manager
const devServer = new DevServerManager();
devServer.start().catch((error) => {
  console.error("💥 Critical startup error:", error);
  process.exit(1);
});
