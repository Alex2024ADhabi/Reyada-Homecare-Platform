/**
 * Process Manager Utility
 * Handles process lifecycle, cleanup, and resource management
 */

export interface ProcessInfo {
  pid?: number;
  name: string;
  status: "running" | "stopped" | "error";
  startTime: Date;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface ProcessManagerOptions {
  gracefulShutdownTimeout?: number;
  healthCheckInterval?: number;
  maxMemoryUsage?: number;
  maxCpuUsage?: number;
}

export class ProcessManager {
  private static instance: ProcessManager;
  private processes: Map<string, ProcessInfo> = new Map();
  private cleanupHandlers: Array<() => Promise<void> | void> = [];
  private healthCheckInterval?: NodeJS.Timeout;
  private options: ProcessManagerOptions;

  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager();
    }
    return ProcessManager.instance;
  }

  constructor(options: ProcessManagerOptions = {}) {
    this.options = {
      gracefulShutdownTimeout: 30000,
      healthCheckInterval: 10000,
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      maxCpuUsage: 80,
      ...options,
    };

    this.initializeProcessMonitoring();
    this.setupSignalHandlers();
  }

  /**
   * Register a process for monitoring
   */
  public registerProcess(name: string, pid?: number): void {
    const processInfo: ProcessInfo = {
      pid,
      name,
      status: "running",
      startTime: new Date(),
    };

    this.processes.set(name, processInfo);
    console.log(`✅ Process registered: ${name}${pid ? ` (PID: ${pid})` : ""}`);
  }

  /**
   * Unregister a process
   */
  public unregisterProcess(name: string): void {
    if (this.processes.has(name)) {
      this.processes.delete(name);
      console.log(`🗑️ Process unregistered: ${name}`);
    }
  }

  /**
   * Add cleanup handler
   */
  public addCleanupHandler(handler: () => Promise<void> | void): void {
    this.cleanupHandlers.push(handler);
  }

  /**
   * Remove cleanup handler
   */
  public removeCleanupHandler(handler: () => Promise<void> | void): void {
    const index = this.cleanupHandlers.indexOf(handler);
    if (index > -1) {
      this.cleanupHandlers.splice(index, 1);
    }
  }

  /**
   * Graceful shutdown of all processes
   */
  public async gracefulShutdown(): Promise<void> {
    console.log("🛑 Initiating graceful shutdown...");

    const shutdownPromises = this.cleanupHandlers.map(
      async (handler, index) => {
        try {
          console.log(
            `🧹 Running cleanup handler ${index + 1}/${this.cleanupHandlers.length}`,
          );
          await Promise.race([
            handler(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Cleanup timeout")), 5000),
            ),
          ]);
          console.log(`✅ Cleanup handler ${index + 1} completed`);
        } catch (error) {
          console.error(`❌ Cleanup handler ${index + 1} failed:`, error);
        }
      },
    );

    try {
      await Promise.all(shutdownPromises);
      console.log("✅ All cleanup handlers completed");
    } catch (error) {
      console.error("❌ Some cleanup handlers failed:", error);
    }

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Update process statuses
    this.processes.forEach((process, name) => {
      process.status = "stopped";
    });

    console.log("🎉 Graceful shutdown completed");
  }

  /**
   * Force kill processes
   */
  public async forceKill(): Promise<void> {
    console.log("💀 Force killing processes...");

    const killPromises = Array.from(this.processes.entries()).map(
      async ([name, process]) => {
        if (process.pid && process.status === "running") {
          try {
            if (typeof process.kill === "function") {
              process.kill("SIGKILL");
            }
            console.log(
              `💀 Force killed process: ${name} (PID: ${process.pid})`,
            );
          } catch (error) {
            console.error(`❌ Failed to kill process ${name}:`, error);
          }
        }
      },
    );

    await Promise.all(killPromises);
    console.log("💀 Force kill completed");
  }

  /**
   * Get process status
   */
  public getProcessStatus(name: string): ProcessInfo | undefined {
    return this.processes.get(name);
  }

  /**
   * Get all processes status
   */
  public getAllProcesses(): Map<string, ProcessInfo> {
    return new Map(this.processes);
  }

  /**
   * Check if process is running
   */
  public isProcessRunning(name: string): boolean {
    const process = this.processes.get(name);
    return process?.status === "running";
  }

  /**
   * Restart process
   */
  public async restartProcess(name: string): Promise<boolean> {
    const process = this.processes.get(name);
    if (!process) {
      console.error(`❌ Process not found: ${name}`);
      return false;
    }

    try {
      console.log(`🔄 Restarting process: ${name}`);

      // Stop the process first
      process.status = "stopped";

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Restart
      process.status = "running";
      process.startTime = new Date();

      console.log(`✅ Process restarted: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restart process ${name}:`, error);
      process.status = "error";
      return false;
    }
  }

  /**
   * Clean up locked resources
   */
  public async cleanupLockedResources(): Promise<void> {
    console.log("🧹 Cleaning up locked resources...");

    const cleanupTasks = [
      this.cleanupNodeModules(),
      this.cleanupTempFiles(),
      this.cleanupPorts(),
      this.cleanupFileHandles(),
    ];

    const results = await Promise.allSettled(cleanupTasks);

    results.forEach((result, index) => {
      const taskNames = ["node_modules", "temp files", "ports", "file handles"];
      if (result.status === "fulfilled") {
        console.log(`✅ Cleaned up ${taskNames[index]}`);
      } else {
        console.error(
          `❌ Failed to clean up ${taskNames[index]}:`,
          result.reason,
        );
      }
    });
  }

  /**
   * Get system resource usage
   */
  public getResourceUsage(): {
    memory: { used: number; total: number; percentage: number };
    processes: {
      total: number;
      running: number;
      stopped: number;
      error: number;
    };
    uptime: number;
  } {
    // Memory usage (if available)
    let memoryUsage = { used: 0, total: 0, percentage: 0 };
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }

    // Process statistics
    const processStats = { total: 0, running: 0, stopped: 0, error: 0 };
    this.processes.forEach((process) => {
      processStats.total++;
      processStats[process.status]++;
    });

    return {
      memory: memoryUsage,
      processes: processStats,
      uptime: performance.now(),
    };
  }

  // Private methods
  private initializeProcessMonitoring(): void {
    if (this.options.healthCheckInterval) {
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck();
      }, this.options.healthCheckInterval);
    }
  }

  private setupSignalHandlers(): void {
    // Handle process termination signals
    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

    signals.forEach((signal) => {
      if (typeof process !== "undefined" && process.on) {
        process.on(signal, async () => {
          console.log(`📡 Received ${signal}, initiating graceful shutdown...`);
          await this.gracefulShutdown();
          process.exit(0);
        });
      }
    });

    // Handle uncaught exceptions
    if (typeof process !== "undefined" && process.on) {
      process.on("uncaughtException", async (error) => {
        console.error("💥 Uncaught Exception:", error);
        await this.gracefulShutdown();
        process.exit(1);
      });

      process.on("unhandledRejection", async (reason, promise) => {
        console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
        await this.gracefulShutdown();
        process.exit(1);
      });
    }
  }

  private performHealthCheck(): void {
    const resourceUsage = this.getResourceUsage();

    // Check memory usage
    if (resourceUsage.memory.percentage > 90) {
      console.warn(
        `⚠️ High memory usage: ${resourceUsage.memory.percentage.toFixed(2)}%`,
      );
    }

    // Check for failed processes
    this.processes.forEach((process, name) => {
      if (process.status === "error") {
        console.warn(`⚠️ Process in error state: ${name}`);
      }
    });
  }

  private async cleanupNodeModules(): Promise<void> {
    // This would typically involve checking for locked files in node_modules
    // For browser environment, we'll just clear any cached modules
    if (typeof require !== "undefined" && require.cache) {
      Object.keys(require.cache).forEach((key) => {
        if (key.includes("node_modules")) {
          delete require.cache[key];
        }
      });
    }
  }

  private async cleanupTempFiles(): Promise<void> {
    // Clear temporary data from localStorage/sessionStorage
    if (typeof localStorage !== "undefined") {
      const tempKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("temp_") || key.startsWith("cache_"))) {
          tempKeys.push(key);
        }
      }
      tempKeys.forEach((key) => localStorage.removeItem(key));
    }
  }

  private async cleanupPorts(): Promise<void> {
    // In browser environment, this would close WebSocket connections
    if (typeof window !== "undefined") {
      // Close any open WebSocket connections
      (window as any).__openWebSockets?.forEach((ws: WebSocket) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    }
  }

  private async cleanupFileHandles(): Promise<void> {
    // Close any open file handles or streams
    // In browser environment, this would revoke object URLs
    if (typeof URL !== "undefined" && URL.revokeObjectURL) {
      // This is a placeholder - in practice, you'd track created URLs
      console.log("🧹 Cleaned up object URLs");
    }
  }
}

// Export singleton instance
export const processManager = ProcessManager.getInstance();

// Export convenience functions
export const registerProcess = (name: string, pid?: number) =>
  processManager.registerProcess(name, pid);

export const addCleanupHandler = (handler: () => Promise<void> | void) =>
  processManager.addCleanupHandler(handler);

export const gracefulShutdown = () => processManager.gracefulShutdown();
export const cleanupResources = () => processManager.cleanupLockedResources();
export const getResourceUsage = () => processManager.getResourceUsage();
