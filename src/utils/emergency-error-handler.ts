// Emergency Error Handler for Canvas Issues
// Provides immediate error recovery and stability

export class EmergencyErrorHandler {
  private static instance: EmergencyErrorHandler;
  private errorCount = 0;
  private maxErrors = 10;
  private isEmergencyMode = false;

  static getInstance(): EmergencyErrorHandler {
    if (!EmergencyErrorHandler.instance) {
      EmergencyErrorHandler.instance = new EmergencyErrorHandler();
    }
    return EmergencyErrorHandler.instance;
  }

  handleError(error: Error, context?: string): void {
    this.errorCount++;
    console.error(
      `🚨 Emergency Error [${this.errorCount}/${this.maxErrors}]:`,
      error.message,
    );

    if (context) {
      console.error(`📍 Context: ${context}`);
    }

    // Activate emergency mode if too many errors
    if (this.errorCount >= this.maxErrors && !this.isEmergencyMode) {
      this.activateEmergencyMode();
    }

    // Try to recover
    this.attemptRecovery(error, context);
  }

  private activateEmergencyMode(): void {
    this.isEmergencyMode = true;
    console.warn("🚨 EMERGENCY MODE ACTIVATED - System in safe mode");

    // Clear problematic data
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("tempo-routes");
        localStorage.removeItem("tempo-storyboards");
        sessionStorage.clear();
      } catch (e) {
        console.warn("Could not clear storage:", e);
      }
    }
  }

  private attemptRecovery(error: Error, context?: string): void {
    // Memory cleanup
    if (error.message.includes("memory") || error.message.includes("heap")) {
      this.performMemoryCleanup();
    }

    // Route recovery
    if (context?.includes("route") || context?.includes("storyboard")) {
      this.performRouteRecovery();
    }

    // Canvas recovery
    if (context?.includes("canvas") || error.message.includes("canvas")) {
      this.performCanvasRecovery();
    }
  }

  private performMemoryCleanup(): void {
    console.log("🧹 Performing emergency memory cleanup");

    if (typeof window !== "undefined") {
      // Force garbage collection if available
      if ("gc" in window) {
        (window as any).gc();
      }

      // Clear caches
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    }
  }

  private performRouteRecovery(): void {
    console.log("🔄 Performing route recovery");

    if (typeof window !== "undefined") {
      // Reset route state
      window.location.hash = "";

      // Clear route cache
      if (window.__TEMPO_ROUTES_LOADED__) {
        delete window.__TEMPO_ROUTES_LOADED__;
      }
    }
  }

  private performCanvasRecovery(): void {
    console.log("🎨 EMERGENCY: Performing aggressive canvas recovery");

    // Immediate aggressive cleanup
    if (typeof window !== "undefined") {
      try {
        // Clear ALL storage to prevent conflicts
        localStorage.clear();
        sessionStorage.clear();

        // Clear all caches
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }

        // Set emergency flags
        window.__TEMPO_EMERGENCY_MODE__ = true;
        window.__TEMPO_SAFE_MODE__ = true;

        console.log("🚨 EMERGENCY MODE ACTIVATED - All caches cleared");
      } catch (e) {
        console.warn("Emergency cleanup failed:", e);
      }
    }

    // Immediate page reload with emergency parameters
    if (this.errorCount >= this.maxErrors - 3) {
      console.warn("🚨 CRITICAL: Emergency page reload NOW");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("emergency", "true");
        url.searchParams.set("safe", "true");
        url.searchParams.set("timestamp", Date.now().toString());
        window.location.href = url.toString();
      }
    }
  }

  isInEmergencyMode(): boolean {
    return this.isEmergencyMode;
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  reset(): void {
    this.errorCount = 0;
    this.isEmergencyMode = false;
    console.log("✅ Emergency error handler reset");
  }
}

// Global error handlers
if (typeof window !== "undefined") {
  const handler = EmergencyErrorHandler.getInstance();

  window.addEventListener("error", (event) => {
    handler.handleError(new Error(event.message), "global-error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    handler.handleError(new Error(event.reason), "unhandled-promise");
  });
}

export const emergencyErrorHandler = EmergencyErrorHandler.getInstance();
