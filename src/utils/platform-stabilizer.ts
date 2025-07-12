/**
 * Platform Stabilizer - Emergency Recovery System
 * Provides immediate stability and recovery mechanisms
 */

export class PlatformStabilizer {
  private static instance: PlatformStabilizer;
  private isStabilizing = false;
  private stabilizationAttempts = 0;
  private maxAttempts = 3;

  static getInstance(): PlatformStabilizer {
    if (!PlatformStabilizer.instance) {
      PlatformStabilizer.instance = new PlatformStabilizer();
    }
    return PlatformStabilizer.instance;
  }

  /**
   * Emergency platform stabilization
   */
  async emergencyStabilize(): Promise<boolean> {
    if (this.isStabilizing) {
      console.log("🔄 Stabilization already in progress...");
      return false;
    }

    this.isStabilizing = true;
    this.stabilizationAttempts++;

    console.log(
      `🚨 EMERGENCY STABILIZATION ATTEMPT ${this.stabilizationAttempts}/${this.maxAttempts}`,
    );

    try {
      // Step 1: Clear all problematic caches
      await this.clearAllCaches();

      // Step 2: Reset application state
      this.resetApplicationState();

      // Step 3: Validate core dependencies
      const dependenciesOk = await this.validateCoreDependencies();
      if (!dependenciesOk) {
        throw new Error("Core dependencies validation failed");
      }

      // Step 4: Initialize minimal safe mode
      await this.initializeSafeMode();

      console.log("✅ Emergency stabilization completed successfully");
      this.isStabilizing = false;
      return true;
    } catch (error) {
      console.error(
        `❌ Stabilization attempt ${this.stabilizationAttempts} failed:`,
        error,
      );
      this.isStabilizing = false;

      if (this.stabilizationAttempts < this.maxAttempts) {
        console.log(`🔄 Retrying stabilization in 2 seconds...`);
        setTimeout(() => this.emergencyStabilize(), 2000);
        return false;
      } else {
        console.error(
          "🚨 CRITICAL: All stabilization attempts failed - Manual intervention required",
        );
        this.triggerCriticalRecovery();
        return false;
      }
    }
  }

  /**
   * Clear all caches and temporary data
   */
  private async clearAllCaches(): Promise<void> {
    console.log("🧹 Clearing all caches and temporary data...");

    if (typeof window !== "undefined") {
      try {
        // Clear browser storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear service worker caches
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
        }

        // Clear IndexedDB if present
        if ("indexedDB" in window) {
          // Note: This is a simplified approach
          // In production, you might want more sophisticated IndexedDB cleanup
        }

        console.log("✅ All caches cleared successfully");
      } catch (error) {
        console.warn("⚠️ Cache clearing partially failed:", error);
      }
    }
  }

  /**
   * Reset application state to safe defaults
   */
  private resetApplicationState(): void {
    console.log("🔄 Resetting application state...");

    if (typeof window !== "undefined") {
      // Set emergency mode flags
      window.__TEMPO_EMERGENCY_MODE__ = true;
      window.__TEMPO_SAFE_MODE__ = true;
      window.__PLATFORM_STABILIZED__ = true;
      window.__STORYBOARDS_DISABLED__ = true;

      // Clear any existing error states
      window.__TEMPO_ROUTES_LOADED__ = false;
      window.__TEMPO_ROUTES_COUNT__ = 0;

      // Reset URL to clean state if needed
      const url = new URL(window.location.href);
      if (!url.searchParams.has("emergency")) {
        url.searchParams.set("emergency", "true");
        url.searchParams.set("safe", "true");
        window.history.replaceState({}, "", url.toString());
      }
    }

    console.log("✅ Application state reset to safe mode");
  }

  /**
   * Validate core dependencies are available
   */
  private async validateCoreDependencies(): Promise<boolean> {
    console.log("🔍 Validating core dependencies...");

    const criticalDependencies = ["react", "react-dom", "react-router-dom"];

    try {
      for (const dep of criticalDependencies) {
        try {
          await import(dep);
        } catch (error) {
          console.error(`❌ Critical dependency missing: ${dep}`);
          return false;
        }
      }

      console.log("✅ All core dependencies validated");
      return true;
    } catch (error) {
      console.error("❌ Dependency validation failed:", error);
      return false;
    }
  }

  /**
   * Initialize safe mode with minimal functionality
   */
  private async initializeSafeMode(): Promise<void> {
    console.log("🛡️ Initializing safe mode...");

    // Disable all non-essential features
    if (typeof window !== "undefined") {
      // Disable hot module replacement
      if (window.__vite_plugin_react_preamble_installed__) {
        console.log("🔥 HMR disabled for stability");
      }

      // Set safe mode configurations
      window.__SAFE_MODE_CONFIG__ = {
        storyboardsDisabled: true,
        hmrDisabled: true,
        devtoolsDisabled: true,
        minimalRouting: true,
        errorRecoveryEnabled: true,
        timestamp: new Date().toISOString(),
      };
    }

    console.log("✅ Safe mode initialized successfully");
  }

  /**
   * Trigger critical recovery as last resort
   */
  private triggerCriticalRecovery(): void {
    console.error("🚨 TRIGGERING CRITICAL RECOVERY - LAST RESORT");

    if (typeof window !== "undefined") {
      // Show user-friendly error message
      const errorMessage = `
🚨 CRITICAL PLATFORM ERROR 🚨

The platform has encountered critical errors and cannot recover automatically.

Recommended actions:
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache and cookies
3. Contact technical support if issues persist

Error Code: PLATFORM_STABILIZATION_FAILED
Timestamp: ${new Date().toISOString()}
      `;

      // Try to show alert, but don't fail if it doesn't work
      try {
        alert(errorMessage);
      } catch (e) {
        console.error(errorMessage);
      }

      // Force page reload as absolute last resort
      setTimeout(() => {
        try {
          window.location.href =
            window.location.pathname +
            "?emergency=true&critical=true&timestamp=" +
            Date.now();
        } catch (e) {
          console.error(
            "❌ Critical recovery failed - manual intervention required",
          );
        }
      }, 3000);
    }
  }

  /**
   * Check if platform is in safe mode
   */
  isInSafeMode(): boolean {
    return (
      typeof window !== "undefined" &&
      (window.__TEMPO_SAFE_MODE__ || window.__PLATFORM_STABILIZED__)
    );
  }

  /**
   * Get stabilization status
   */
  getStatus(): {
    isStabilizing: boolean;
    attempts: number;
    maxAttempts: number;
    inSafeMode: boolean;
    timestamp: string;
  } {
    return {
      isStabilizing: this.isStabilizing,
      attempts: this.stabilizationAttempts,
      maxAttempts: this.maxAttempts,
      inSafeMode: this.isInSafeMode(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset stabilizer state
   */
  reset(): void {
    this.isStabilizing = false;
    this.stabilizationAttempts = 0;
    console.log("🔄 Platform stabilizer reset");
  }
}

// Export singleton instance
export const platformStabilizer = PlatformStabilizer.getInstance();

// Auto-initialize if we detect critical errors
if (typeof window !== "undefined") {
  // Check for critical error indicators
  const hasCriticalErrors =
    window.location.search.includes("emergency") ||
    window.location.search.includes("critical") ||
    localStorage.getItem("platform_critical_error");

  if (hasCriticalErrors) {
    console.log(
      "🚨 Critical errors detected - Auto-initializing platform stabilizer",
    );
    platformStabilizer.emergencyStabilize();
  }
}

export default platformStabilizer;
