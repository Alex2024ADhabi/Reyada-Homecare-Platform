/**
 * Storyboard Recovery System
 * Provides comprehensive recovery mechanisms for failed storyboards
 */
import React from "react";
export class StoryboardRecovery {
    /**
     * Attempt to recover a failed storyboard with multiple strategies
     */
    static async recoverStoryboard(storyboardPath, storyboardName, options = {}) {
        const opts = { ...this.defaultOptions, ...options };
        let lastError = null;
        let attempts = 0;
        // Strategy 1: Direct import with retry
        for (let i = 0; i < opts.maxRetries; i++) {
            attempts++;
            try {
                const module = await import(/* @vite-ignore */ storyboardPath);
                const component = module.default || module;
                if (component && typeof component === "function") {
                    if (opts.logErrors) {
                        console.log(`✅ Storyboard recovered on attempt ${attempts}: ${storyboardName}`);
                    }
                    return { success: true, component, attempts };
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (opts.logErrors) {
                    console.warn(`Attempt ${attempts} failed for ${storyboardName}:`, error);
                }
                if (i < opts.maxRetries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
                }
            }
        }
        // Strategy 2: Alternative import paths
        const alternativePaths = [
            storyboardPath.replace("/home/peter/tempo-api/projects/4a0b90f3-3ca6-44b8-bc86-22f3300d4770/", "./"),
            storyboardPath.replace("src/", "./src/"),
            `.${storyboardPath}`,
            storyboardPath.replace(".tsx", ""),
        ];
        for (const altPath of alternativePaths) {
            attempts++;
            try {
                const module = await import(/* @vite-ignore */ altPath);
                const component = module.default || module;
                if (component && typeof component === "function") {
                    if (opts.logErrors) {
                        console.log(`✅ Storyboard recovered with alternative path: ${altPath}`);
                    }
                    return { success: true, component, attempts };
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                continue;
            }
        }
        // Strategy 3: Return fallback component if enabled
        if (opts.fallbackComponent) {
            const fallbackComponent = this.createFallbackComponent(storyboardName, lastError);
            return {
                success: false,
                component: fallbackComponent,
                error: lastError,
                attempts,
            };
        }
        return { success: false, error: lastError, attempts };
    }
    /**
     * Create a fallback component for failed storyboards
     */
    static createFallbackComponent(storyboardName, error) {
        return function StoryboardFallback() {
            return React.createElement("div", {
                className: "p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center",
            }, [
                React.createElement("h3", {
                    key: "title",
                    className: "text-lg font-semibold text-yellow-800 mb-2",
                }, `${storyboardName} (Fallback Mode)`),
                React.createElement("p", {
                    key: "message",
                    className: "text-yellow-700 mb-4",
                }, "This storyboard is temporarily unavailable. Please try refreshing the page."),
                error &&
                    React.createElement("details", {
                        key: "error",
                        className: "text-left mt-4",
                    }, [
                        React.createElement("summary", {
                            key: "summary",
                            className: "cursor-pointer text-yellow-600",
                        }, "Error Details"),
                        React.createElement("pre", {
                            key: "details",
                            className: "mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto",
                        }, error.message),
                    ]),
                React.createElement("button", {
                    key: "reload",
                    className: "mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700",
                    onClick: () => window.location.reload(),
                }, "Reload Page"),
            ]);
        };
    }
}
Object.defineProperty(StoryboardRecovery, "defaultOptions", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        maxRetries: 3,
        retryDelay: 1000,
        fallbackComponent: true,
        logErrors: true,
    }
});
export default StoryboardRecovery;
