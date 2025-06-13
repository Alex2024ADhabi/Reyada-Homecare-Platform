/**
 * Storyboard Error Recovery System
 * Provides comprehensive error recovery for failed storyboards
 */

import React from "react";

export interface StoryboardError {
  id: string;
  name: string;
  path: string;
  error: Error;
  timestamp: Date;
  recoveryAttempts: number;
}

export class StoryboardErrorRecovery {
  private static errors = new Map<string, StoryboardError>();
  private static maxRecoveryAttempts = 3;
  private static recoveryStrategies = [
    "reload-dependencies",
    "alternative-import",
    "fallback-component",
  ];

  /**
   * Record a storyboard error
   */
  static recordError(
    storyboardId: string,
    storyboardName: string,
    storyboardPath: string,
    error: Error,
  ): void {
    const existingError = this.errors.get(storyboardId);

    const storyboardError: StoryboardError = {
      id: storyboardId,
      name: storyboardName,
      path: storyboardPath,
      error,
      timestamp: new Date(),
      recoveryAttempts: existingError ? existingError.recoveryAttempts + 1 : 1,
    };

    this.errors.set(storyboardId, storyboardError);

    console.error(`Storyboard Error Recorded [${storyboardId}]:`, {
      name: storyboardName,
      path: storyboardPath,
      error: error.message,
      attempts: storyboardError.recoveryAttempts,
    });
  }

  /**
   * Attempt to recover a failed storyboard
   */
  static async attemptRecovery(
    storyboardId: string,
  ): Promise<React.ComponentType | null> {
    const errorInfo = this.errors.get(storyboardId);
    if (!errorInfo) {
      console.warn(`No error info found for storyboard ${storyboardId}`);
      return null;
    }

    if (errorInfo.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.warn(
        `Max recovery attempts reached for storyboard ${storyboardId}`,
      );
      return this.createPermanentFallback(errorInfo);
    }

    console.log(
      `Attempting recovery for storyboard ${storyboardId} (attempt ${errorInfo.recoveryAttempts})`,
    );

    // Try different recovery strategies
    for (const strategy of this.recoveryStrategies) {
      try {
        const recovered = await this.executeRecoveryStrategy(
          strategy,
          errorInfo,
        );
        if (recovered) {
          console.log(
            `✅ Recovery successful for ${storyboardId} using strategy: ${strategy}`,
          );
          // Remove from error list on successful recovery
          this.errors.delete(storyboardId);
          return recovered;
        }
      } catch (recoveryError) {
        console.warn(
          `Recovery strategy ${strategy} failed for ${storyboardId}:`,
          recoveryError,
        );
        continue;
      }
    }

    // If all strategies fail, increment attempts and return fallback
    errorInfo.recoveryAttempts++;
    this.errors.set(storyboardId, errorInfo);

    return this.createTemporaryFallback(errorInfo);
  }

  /**
   * Execute a specific recovery strategy
   */
  private static async executeRecoveryStrategy(
    strategy: string,
    errorInfo: StoryboardError,
  ): Promise<React.ComponentType | null> {
    switch (strategy) {
      case "reload-dependencies":
        return await this.reloadDependenciesStrategy(errorInfo);

      case "alternative-import":
        return await this.alternativeImportStrategy(errorInfo);

      case "fallback-component":
        return this.createTemporaryFallback(errorInfo);

      default:
        return null;
    }
  }

  /**
   * Strategy 1: Reload dependencies and retry import
   */
  private static async reloadDependenciesStrategy(
    errorInfo: StoryboardError,
  ): Promise<React.ComponentType | null> {
    try {
      // Clear module cache if possible
      if ("webpackChunkName" in window || "webpackJsonp" in window) {
        // Webpack environment - try to clear cache
        console.log("Attempting to clear webpack module cache...");
      }

      // Re-import with fresh context
      const module = await import(
        /* @vite-ignore */ `${errorInfo.path}?t=${Date.now()}`
      );
      const component = module.default || module;

      if (component && typeof component === "function") {
        return component;
      }

      return null;
    } catch (error) {
      console.warn("Reload dependencies strategy failed:", error);
      return null;
    }
  }

  /**
   * Strategy 2: Try alternative import paths
   */
  private static async alternativeImportStrategy(
    errorInfo: StoryboardError,
  ): Promise<React.ComponentType | null> {
    const alternativePaths = [
      errorInfo.path.replace(
        "/home/peter/tempo-api/projects/4a0b90f3-3ca6-44b8-bc86-22f3300d4770/",
        "./",
      ),
      errorInfo.path.replace("src/", "./src/"),
      `./src/tempobook/storyboards/${errorInfo.id}/index.tsx`,
      `@/tempobook/storyboards/${errorInfo.id}/index.tsx`,
      errorInfo.path.replace(".tsx", ""),
      errorInfo.path.replace(".ts", ""),
    ];

    for (const altPath of alternativePaths) {
      try {
        console.log(`Trying alternative path: ${altPath}`);
        const module = await import(/* @vite-ignore */ altPath);
        const component = module.default || module;

        if (component && typeof component === "function") {
          console.log(
            `✅ Successfully loaded from alternative path: ${altPath}`,
          );
          return component;
        }
      } catch (altError) {
        continue;
      }
    }

    return null;
  }

  /**
   * Create a temporary fallback component
   */
  private static createTemporaryFallback(
    errorInfo: StoryboardError,
  ): React.ComponentType {
    return function TemporaryStoryboardFallback() {
      return React.createElement(
        "div",
        {
          className: "p-6 bg-orange-50 border border-orange-200 rounded-lg",
        },
        [
          React.createElement(
            "div",
            {
              key: "header",
              className: "flex items-center mb-4",
            },
            [
              React.createElement(
                "div",
                {
                  key: "icon",
                  className:
                    "w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3",
                },
                "⚠️",
              ),
              React.createElement(
                "div",
                {
                  key: "title",
                },
                [
                  React.createElement(
                    "h3",
                    {
                      key: "name",
                      className: "font-semibold text-orange-800",
                    },
                    `${errorInfo.name} (Recovery Mode)`,
                  ),
                  React.createElement(
                    "p",
                    {
                      key: "subtitle",
                      className: "text-sm text-orange-600",
                    },
                    `Attempt ${errorInfo.recoveryAttempts} of ${this.maxRecoveryAttempts}`,
                  ),
                ],
              ),
            ],
          ),
          React.createElement(
            "div",
            {
              key: "content",
              className: "space-y-3",
            },
            [
              React.createElement(
                "p",
                {
                  key: "message",
                  className: "text-orange-700",
                },
                "This storyboard is temporarily unavailable. Recovery is in progress.",
              ),
              React.createElement(
                "div",
                {
                  key: "details",
                  className:
                    "text-xs text-orange-600 bg-orange-100 p-2 rounded",
                },
                [
                  React.createElement(
                    "div",
                    { key: "path" },
                    `Path: ${errorInfo.path}`,
                  ),
                  React.createElement(
                    "div",
                    { key: "error" },
                    `Error: ${errorInfo.error.message}`,
                  ),
                  React.createElement(
                    "div",
                    { key: "time" },
                    `Time: ${errorInfo.timestamp.toLocaleString()}`,
                  ),
                ],
              ),
              React.createElement(
                "div",
                {
                  key: "actions",
                  className: "flex gap-2",
                },
                [
                  React.createElement(
                    "button",
                    {
                      key: "retry",
                      className:
                        "px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700",
                      onClick: async () => {
                        const recovered =
                          await StoryboardErrorRecovery.attemptRecovery(
                            errorInfo.id,
                          );
                        if (recovered) {
                          window.location.reload();
                        }
                      },
                    },
                    "Retry Recovery",
                  ),
                  React.createElement(
                    "button",
                    {
                      key: "reload",
                      className:
                        "px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700",
                      onClick: () => window.location.reload(),
                    },
                    "Reload Page",
                  ),
                ],
              ),
            ],
          ),
        ],
      );
    };
  }

  /**
   * Create a permanent fallback component for max attempts reached
   */
  private static createPermanentFallback(
    errorInfo: StoryboardError,
  ): React.ComponentType {
    return function PermanentStoryboardFallback() {
      return React.createElement(
        "div",
        {
          className: "p-6 bg-red-50 border border-red-200 rounded-lg",
        },
        [
          React.createElement(
            "div",
            {
              key: "header",
              className: "flex items-center mb-4",
            },
            [
              React.createElement(
                "div",
                {
                  key: "icon",
                  className:
                    "w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3",
                },
                "❌",
              ),
              React.createElement(
                "div",
                {
                  key: "title",
                },
                [
                  React.createElement(
                    "h3",
                    {
                      key: "name",
                      className: "font-semibold text-red-800",
                    },
                    `${errorInfo.name} (Unavailable)`,
                  ),
                  React.createElement(
                    "p",
                    {
                      key: "subtitle",
                      className: "text-sm text-red-600",
                    },
                    "Maximum recovery attempts exceeded",
                  ),
                ],
              ),
            ],
          ),
          React.createElement(
            "div",
            {
              key: "content",
              className: "space-y-3",
            },
            [
              React.createElement(
                "p",
                {
                  key: "message",
                  className: "text-red-700",
                },
                "This storyboard could not be loaded after multiple recovery attempts. Please contact support or try refreshing the page.",
              ),
              React.createElement(
                "div",
                {
                  key: "details",
                  className: "text-xs text-red-600 bg-red-100 p-2 rounded",
                },
                [
                  React.createElement(
                    "div",
                    { key: "id" },
                    `ID: ${errorInfo.id}`,
                  ),
                  React.createElement(
                    "div",
                    { key: "path" },
                    `Path: ${errorInfo.path}`,
                  ),
                  React.createElement(
                    "div",
                    { key: "attempts" },
                    `Recovery Attempts: ${errorInfo.recoveryAttempts}`,
                  ),
                  React.createElement(
                    "div",
                    { key: "error" },
                    `Last Error: ${errorInfo.error.message}`,
                  ),
                ],
              ),
              React.createElement(
                "button",
                {
                  key: "reload",
                  className:
                    "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",
                  onClick: () => {
                    // Clear error and reload
                    this.errors.delete(errorInfo.id);
                    window.location.reload();
                  },
                },
                "Clear Error & Reload Page",
              ),
            ],
          ),
        ],
      );
    };
  }

  /**
   * Get all recorded errors
   */
  static getAllErrors(): StoryboardError[] {
    return Array.from(this.errors.values());
  }

  /**
   * Clear all errors
   */
  static clearAllErrors(): void {
    this.errors.clear();
    console.log("All storyboard errors cleared");
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    totalErrors: number;
    recoverable: number;
    permanent: number;
    recentErrors: number;
  } {
    const errors = Array.from(this.errors.values());
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      totalErrors: errors.length,
      recoverable: errors.filter(
        (e) => e.recoveryAttempts < this.maxRecoveryAttempts,
      ).length,
      permanent: errors.filter(
        (e) => e.recoveryAttempts >= this.maxRecoveryAttempts,
      ).length,
      recentErrors: errors.filter((e) => e.timestamp > oneHourAgo).length,
    };
  }
}

export default StoryboardErrorRecovery;
