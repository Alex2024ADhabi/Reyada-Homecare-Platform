/**
 * Error Recovery Utility
 * Comprehensive error recovery and resilience mechanisms
 */

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  fallbackValue?: any;
  onRetry?: (attempt: number, error: Error) => void;
  onFallback?: (error: Error) => void;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  recoveryMethod?: string;
}

export class ErrorRecovery {
  private static instance: ErrorRecovery;
  private recoveryStrategies: Map<string, Function> = new Map();
  private errorHistory: Array<{
    timestamp: Date;
    error: Error;
    context: string;
    recovered: boolean;
  }> = [];

  public static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery();
    }
    return ErrorRecovery.instance;
  }

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Execute function with automatic retry and recovery
   */
  public async withRecovery<T>(
    fn: () => Promise<T> | T,
    options: ErrorRecoveryOptions = {},
  ): Promise<RecoveryResult<T>> {
    const opts = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      ...options,
    };

    let lastError: Error;
    let attempts = 0;

    while (attempts <= opts.maxRetries) {
      try {
        const result = await fn();
        return {
          success: true,
          data: result,
          attempts: attempts + 1,
        };
      } catch (error) {
        lastError = error as Error;
        attempts++;

        // Log error for analysis
        this.logError(lastError, "withRecovery", false);

        if (attempts <= opts.maxRetries) {
          // Call retry callback
          if (opts.onRetry) {
            opts.onRetry(attempts, lastError);
          }

          // Calculate delay
          const delay = opts.exponentialBackoff
            ? opts.retryDelay * Math.pow(2, attempts - 1)
            : opts.retryDelay;

          // Wait before retry
          await this.delay(delay);
        }
      }
    }

    // All retries failed, try fallback
    if (opts.fallbackValue !== undefined) {
      if (opts.onFallback) {
        opts.onFallback(lastError);
      }

      this.logError(lastError, "withRecovery", true);

      return {
        success: true,
        data: opts.fallbackValue,
        attempts,
        recoveryMethod: "fallback",
      };
    }

    return {
      success: false,
      error: lastError,
      attempts,
    };
  }

  /**
   * Register custom recovery strategy
   */
  public registerStrategy(name: string, strategy: Function): void {
    this.recoveryStrategies.set(name, strategy);
  }

  /**
   * Apply recovery strategy by name
   */
  public async applyStrategy<T>(
    strategyName: string,
    error: Error,
    context?: any,
  ): Promise<RecoveryResult<T>> {
    const strategy = this.recoveryStrategies.get(strategyName);

    if (!strategy) {
      return {
        success: false,
        error: new Error(`Recovery strategy '${strategyName}' not found`),
        attempts: 0,
      };
    }

    try {
      const result = await strategy(error, context);
      this.logError(error, strategyName, true);

      return {
        success: true,
        data: result,
        attempts: 1,
        recoveryMethod: strategyName,
      };
    } catch (recoveryError) {
      return {
        success: false,
        error: recoveryError as Error,
        attempts: 1,
      };
    }
  }

  /**
   * Circuit breaker pattern implementation
   */
  public createCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {},
  ) {
    const opts = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 10000,
      ...options,
    };

    let state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
    let failureCount = 0;
    let lastFailureTime = 0;
    let successCount = 0;

    return async (): Promise<T> => {
      const now = Date.now();

      // Check if circuit should be reset
      if (state === "OPEN" && now - lastFailureTime >= opts.resetTimeout) {
        state = "HALF_OPEN";
        successCount = 0;
      }

      // Reject if circuit is open
      if (state === "OPEN") {
        throw new Error("Circuit breaker is OPEN");
      }

      try {
        const result = await fn();

        // Success - reset failure count
        if (state === "HALF_OPEN") {
          successCount++;
          if (successCount >= 3) {
            state = "CLOSED";
            failureCount = 0;
          }
        } else {
          failureCount = 0;
        }

        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = now;

        // Open circuit if threshold reached
        if (failureCount >= opts.failureThreshold) {
          state = "OPEN";
        }

        throw error;
      }
    };
  }

  /**
   * Bulkhead pattern - isolate failures
   */
  public createBulkhead<T>(
    fn: () => Promise<T>,
    options: {
      maxConcurrent?: number;
      queueSize?: number;
      timeout?: number;
    } = {},
  ) {
    const opts = {
      maxConcurrent: 10,
      queueSize: 100,
      timeout: 30000,
      ...options,
    };

    let running = 0;
    const queue: Array<{
      resolve: (value: T) => void;
      reject: (error: Error) => void;
      fn: () => Promise<T>;
    }> = [];

    const processQueue = async () => {
      if (queue.length === 0 || running >= opts.maxConcurrent) {
        return;
      }

      const item = queue.shift()!;
      running++;

      try {
        const result = await Promise.race([
          item.fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Bulkhead timeout")),
              opts.timeout,
            ),
          ),
        ]);
        item.resolve(result);
      } catch (error) {
        item.reject(error as Error);
      } finally {
        running--;
        processQueue();
      }
    };

    return (): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (queue.length >= opts.queueSize) {
          reject(new Error("Bulkhead queue full"));
          return;
        }

        queue.push({ resolve, reject, fn });
        processQueue();
      });
    };
  }

  /**
   * Get error recovery statistics
   */
  public getStatistics(): {
    totalErrors: number;
    recoveredErrors: number;
    recoveryRate: number;
    commonErrors: Array<{ error: string; count: number }>;
    recentErrors: Array<{ timestamp: Date; error: string; recovered: boolean }>;
  } {
    const totalErrors = this.errorHistory.length;
    const recoveredErrors = this.errorHistory.filter((e) => e.recovered).length;
    const recoveryRate =
      totalErrors > 0 ? (recoveredErrors / totalErrors) * 100 : 0;

    // Count common errors
    const errorCounts = new Map<string, number>();
    this.errorHistory.forEach((entry) => {
      const errorKey = entry.error.message;
      errorCounts.set(errorKey, (errorCounts.get(errorKey) || 0) + 1);
    });

    const commonErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recentErrors = this.errorHistory.slice(-20).map((entry) => ({
      timestamp: entry.timestamp,
      error: entry.error.message,
      recovered: entry.recovered,
    }));

    return {
      totalErrors,
      recoveredErrors,
      recoveryRate,
      commonErrors,
      recentErrors,
    };
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory = [];
  }

  // Private methods
  private initializeDefaultStrategies(): void {
    // Network error recovery
    this.registerStrategy("network", async (error: Error) => {
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        // Wait and retry with exponential backoff
        await this.delay(2000);
        return null; // Return fallback value
      }
      throw error;
    });

    // JSON parsing error recovery
    this.registerStrategy("json", async (error: Error, context: any) => {
      if (error.message.includes("JSON")) {
        // Try to sanitize and re-parse
        if (context && typeof context === "string") {
          try {
            const sanitized = context.replace(/'/g, '"').replace(/,\s*}/g, "}");
            return JSON.parse(sanitized);
          } catch {
            return {}; // Return empty object as fallback
          }
        }
      }
      throw error;
    });

    // Component rendering error recovery
    this.registerStrategy("component", async (error: Error, context: any) => {
      if (error.message.includes("render") || error.message.includes("JSX")) {
        // Return error boundary component
        return {
          type: "error-boundary",
          message: "Component failed to render",
          originalError: error.message,
        };
      }
      throw error;
    });

    // Database connection recovery
    this.registerStrategy("database", async (error: Error) => {
      if (
        error.message.includes("connection") ||
        error.message.includes("timeout")
      ) {
        // Implement connection retry logic
        await this.delay(5000);
        return { status: "offline", cached: true };
      }
      throw error;
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logError(error: Error, context: string, recovered: boolean): void {
    this.errorHistory.push({
      timestamp: new Date(),
      error,
      context,
      recovered,
    });

    // Keep only last 1000 errors
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000);
    }
  }
}

// Export singleton instance
export const errorRecovery = ErrorRecovery.getInstance();

// Export convenience functions
export const withRetry = <T>(
  fn: () => Promise<T> | T,
  options?: ErrorRecoveryOptions,
) => errorRecovery.withRecovery(fn, options);

export const createCircuitBreaker = <T>(
  fn: () => Promise<T>,
  options?: {
    failureThreshold?: number;
    resetTimeout?: number;
    monitoringPeriod?: number;
  },
) => errorRecovery.createCircuitBreaker(fn, options);

export const createBulkhead = <T>(
  fn: () => Promise<T>,
  options?: { maxConcurrent?: number; queueSize?: number; timeout?: number },
) => errorRecovery.createBulkhead(fn, options);
