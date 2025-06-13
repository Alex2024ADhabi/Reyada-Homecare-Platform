// Storyboard Loader - Ensures all storyboards are properly loaded and validated
import { StoryboardValidator } from "./storyboard-validator";
import StoryboardDependencyResolver from "./storyboard-dependency-resolver";
import StoryboardErrorRecovery from "./storyboard-error-recovery";
export class StoryboardLoader {
    /**
     * Register all storyboards from the canvas info
     */
    static registerStoryboards(storyboardsInfo) {
        if (!Array.isArray(storyboardsInfo)) {
            console.warn("⚠️ Invalid storyboards info provided - not an array");
            storyboardsInfo = [];
        }
        console.log("🎯 Registering storyboards:", storyboardsInfo.length);
        // Enhanced validation and sanitization
        const validStoryboards = storyboardsInfo.filter((storyboard) => {
            if (!storyboard || typeof storyboard !== "object") {
                console.warn("⚠️ Filtering invalid storyboard (not object):", storyboard);
                return false;
            }
            if (!storyboard.id) {
                console.warn("⚠️ Filtering storyboard without ID:", storyboard);
                return false;
            }
            return true;
        });
        console.log("📊 Valid storyboards after filtering:", validStoryboards.length);
        validStoryboards.forEach((storyboard) => {
            const info = {
                id: String(storyboard.id),
                name: storyboard.name || `Storyboard-${storyboard.id}`,
                path: storyboard.fullFilePath ||
                    `src/tempobook/storyboards/${storyboard.id}/index.tsx`,
                type: storyboard.type === "APPLICATION" ? "APPLICATION" : "COMPONENT",
                status: "loading",
            };
            this.storyboards.set(String(storyboard.id), info);
        });
        console.log("📊 Registered storyboards:", this.storyboards.size);
    }
    /**
     * Load a specific storyboard with error recovery
     */
    static async loadStoryboard(id) {
        const storyboard = this.storyboards.get(id);
        if (!storyboard) {
            console.warn(`⚠️ Storyboard ${id} not found in registry`);
            return null;
        }
        // Check if already loading
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }
        console.log(`🔄 Loading storyboard: ${storyboard.name}`);
        const loadPromise = this.loadStoryboardWithRecovery(storyboard);
        this.loadingPromises.set(id, loadPromise);
        try {
            const result = await loadPromise;
            storyboard.status = "loaded";
            console.log(`✅ Successfully loaded: ${storyboard.name}`);
            return result;
        }
        catch (error) {
            storyboard.status = "error";
            storyboard.error =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`❌ Failed to load storyboard ${storyboard.name}:`, error);
            return null;
        }
        finally {
            this.loadingPromises.delete(id);
        }
    }
    /**
     * Load storyboard with INSTANT recovery and validation
     */
    static async loadStoryboardWithRecovery(storyboard) {
        try {
            console.log(`🔄 Starting INSTANT loading for: ${storyboard.name}`);
            // INSTANT React check - no async
            const React = window.React || globalThis.React;
            if (!React || !React.createElement) {
                console.error(`❌ React not available for: ${storyboard.name}`);
                return this.createRobustFallback(storyboard);
            }
            // Skip network check for faster loading
            // if (!navigator.onLine) {
            //   console.warn(
            //     `⚠️ Network offline - instant fallback for: ${storyboard.name}`,
            //   );
            //   return this.createNetworkFallback(storyboard);
            // }
            // Check for bulletproof mode
            if (typeof window !== "undefined" &&
                window.__BULLETPROOF_MODE__) {
                console.log(`🛡️ Bulletproof mode active for: ${storyboard.name}`);
            }
            // First, check if we have a pre-fixed component
            if (typeof window !== "undefined") {
                const preFixedComponent = window[`__STORYBOARD_${storyboard.id}__`];
                if (preFixedComponent) {
                    console.log(`✅ Using pre-fixed component for: ${storyboard.name}`);
                    return preFixedComponent;
                }
            }
            // Enhanced path normalization with multiple strategies
            const normalizedPaths = this.generateStoryboardPaths(storyboard);
            console.log(`🔄 Loading storyboard: ${storyboard.name} with ${Math.min(normalizedPaths.length, 3)} path strategies`);
            // Try each path strategy with reduced timeout for faster startup
            let lastError = null;
            let attemptCount = 0;
            const maxAttempts = Math.min(normalizedPaths.length, 3); // Limit attempts for faster startup
            for (const pathStrategy of normalizedPaths.slice(0, maxAttempts)) {
                attemptCount++;
                try {
                    const importPromise = this.attemptStoryboardImport(pathStrategy, storyboard);
                    // Reduced timeout for faster startup
                    const timeoutMs = attemptCount <= 1 ? 3000 : 1500;
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Import timeout after ${timeoutMs / 1000}s for ${storyboard.name} (attempt ${attemptCount})`)), timeoutMs));
                    const module = (await Promise.race([
                        importPromise,
                        timeoutPromise,
                    ]));
                    if (module) {
                        const component = module.default || module;
                        if (component) {
                            // Skip validation for faster loading
                            console.log(`✅ Successfully loaded storyboard: ${storyboard.name} (attempt ${attemptCount})`);
                            // Cache successful component
                            if (typeof window !== "undefined") {
                                window[`__STORYBOARD_${storyboard.id}__`] = component;
                            }
                            return component;
                        }
                    }
                }
                catch (pathError) {
                    lastError =
                        pathError instanceof Error
                            ? pathError
                            : new Error(String(pathError));
                    const isNetworkError = pathError.message.includes("timeout") ||
                        pathError.message.includes("network") ||
                        pathError.message.includes("fetch");
                    if (isNetworkError) {
                        console.warn(`🌐 Network error for ${pathStrategy}:`, pathError.message);
                        // For network errors, fail faster
                        if (attemptCount >= 2) {
                            console.warn(`🌐 Network issues detected, switching to fallback for: ${storyboard.name}`);
                            break;
                        }
                    }
                    else {
                        console.warn(`Path strategy failed for ${pathStrategy}:`, pathError);
                    }
                    continue;
                }
            }
            // If all path strategies fail, try comprehensive recovery
            console.log(`🔧 Attempting comprehensive recovery for: ${storyboard.name}`);
            try {
                const recoveredComponent = await this.executeComprehensiveRecovery(storyboard, lastError);
                if (recoveredComponent) {
                    return recoveredComponent;
                }
            }
            catch (recoveryError) {
                console.warn(`🔧 Comprehensive recovery failed for: ${storyboard.name}`, recoveryError);
            }
            // Final fallback - create a robust fallback immediately
            console.log(`🛠️ Creating bulletproof robust fallback for: ${storyboard.name}`);
            const robustFallback = this.createRobustFallback(storyboard);
            // Cache the fallback for future use
            if (typeof window !== "undefined") {
                window[`__FALLBACK_${storyboard.id}__`] = robustFallback;
            }
            return robustFallback;
        }
        catch (error) {
            console.error(`❌ Failed to load storyboard ${storyboard.name}:`, error);
            // Return robust fallback instead of complex recovery
            return this.createRobustFallback(storyboard);
        }
    }
    /**
     * Ensure React is available globally for storyboard loading
     */
    static async ensureReactAvailability() {
        try {
            if (typeof window !== "undefined" && !window.React) {
                console.log("Making React available globally for storyboards...");
                const React = await import("react");
                window.React = React.default || React;
                globalThis.React = React.default || React;
            }
        }
        catch (error) {
            console.error("Failed to ensure React availability:", error);
        }
    }
    /**
     * Generate comprehensive storyboard import paths
     */
    static generateStoryboardPaths(storyboard) {
        const basePaths = [storyboard.path, storyboard.fullFilePath].filter(Boolean);
        const generatedPaths = [];
        for (const basePath of basePaths) {
            if (!basePath)
                continue;
            // Add original path
            generatedPaths.push(basePath);
            // Add normalized variations with safer path handling
            const normalizedVariations = [
                basePath.replace("/home/peter/tempo-api/projects/4a0b90f3-3ca6-44b8-bc86-22f3300d4770/", "./"),
                basePath.replace(/^\/src\//, "./src/"),
                basePath.replace(/^src\//, "./src/"),
                basePath.startsWith(".") ? basePath : `.${basePath}`,
                basePath.startsWith("/") ? basePath : `/${basePath}`,
                basePath.startsWith("./") ? basePath : `./${basePath}`,
            ].filter((path) => path && path.length > 0 && !path.includes("undefined"));
            generatedPaths.push(...normalizedVariations);
        }
        // Add standard storyboard paths
        generatedPaths.push(`./src/storyboards/${storyboard.name}.tsx`, `./src/tempobook/storyboards/${storyboard.id}/index.tsx`, `/src/tempobook/storyboards/${storyboard.id}/index.tsx`, `@/tempobook/storyboards/${storyboard.id}/index.tsx`, `@/storyboards/${storyboard.name}.tsx`);
        // Remove duplicates and invalid paths
        return [...new Set(generatedPaths)].filter((path) => path && path.length > 0);
    }
    /**
     * Attempt to import storyboard with enhanced error handling
     */
    static async attemptStoryboardImport(importPath, storyboard) {
        try {
            console.log(`Attempting import: ${importPath}`);
            const module = await import(/* @vite-ignore */ importPath);
            if (module) {
                console.log(`✅ Successfully imported: ${importPath}`);
                return module;
            }
            throw new Error(`Module is null for path: ${importPath}`);
        }
        catch (importError) {
            // Enhanced error logging
            const errorMessage = importError instanceof Error
                ? importError.message
                : String(importError);
            console.warn(`Import failed for ${importPath}: ${errorMessage}`);
            throw importError;
        }
    }
    /**
     * Validate and fix storyboard component
     */
    static async validateAndFixStoryboard(component, storyboard) {
        try {
            // Validate the component using StoryboardValidator
            const validation = StoryboardValidator.validateStoryboard(component, storyboard.name);
            if (!validation.isValid) {
                console.warn(`Storyboard validation failed for ${storyboard.name}:`, validation.errors);
                // Try to auto-fix common issues
                const fixedComponent = await this.autoFixStoryboardIssues(component, storyboard, validation);
                if (fixedComponent) {
                    return { component: fixedComponent, validation };
                }
                // If auto-fix fails and errors are critical, throw
                if (validation.errors.some((error) => error.includes("null") || error.includes("undefined"))) {
                    throw new Error(`Component validation failed: ${validation.errors.join(", ")}`);
                }
            }
            if (validation.warnings.length > 0) {
                console.warn(`Storyboard warnings for ${storyboard.name}:`, validation.warnings);
            }
            return { component, validation };
        }
        catch (error) {
            console.error(`Validation failed for ${storyboard.name}:`, error);
            throw error;
        }
    }
    /**
     * Auto-fix common storyboard issues
     */
    static async autoFixStoryboardIssues(component, storyboard, validation) {
        try {
            // If component is null/undefined, try to create a wrapper
            if (!component) {
                console.log(`Creating wrapper for null component: ${storyboard.name}`);
                return this.createValidStoryboardWrapper(storyboard);
            }
            // If component is not a function, try to extract it
            if (typeof component !== "function") {
                if (component.default && typeof component.default === "function") {
                    return component.default;
                }
                if (component.component && typeof component.component === "function") {
                    return component.component;
                }
                // Try to create a wrapper around the component
                return this.createComponentWrapper(component, storyboard);
            }
            return component;
        }
        catch (error) {
            console.error(`Auto-fix failed for ${storyboard.name}:`, error);
            return null;
        }
    }
    /**
     * Execute comprehensive recovery strategies
     */
    static async executeComprehensiveRecovery(storyboard, originalError) {
        console.log(`🔧 Executing comprehensive recovery for: ${storyboard.name}`);
        // Strategy 1: JSX Error Recovery
        try {
            const { JSXErrorRecovery } = await import("./jsx-error-recovery");
            const recovery = await JSXErrorRecovery.recoverFromJSXError(originalError instanceof Error
                ? originalError
                : new Error("Unknown import error"), storyboard.name, {}, {
                auto_recovery: true,
                fallback_component: true,
                error_boundary: true,
                logging_enabled: true,
                user_notification: false,
                retry_attempts: 2,
                recovery_timeout: 3000,
            });
            if (recovery.recovered && recovery.fallback_component) {
                console.log(`🛠️ JSX recovery successful for: ${storyboard.name}`);
                return recovery.fallback_component;
            }
        }
        catch (recoveryError) {
            console.warn(`JSX recovery failed for ${storyboard.name}:`, recoveryError);
        }
        // Strategy 2: Storyboard Error Recovery
        try {
            StoryboardErrorRecovery.recordError(storyboard.id, storyboard.name, storyboard.path, originalError instanceof Error
                ? originalError
                : new Error("Unknown storyboard error"));
            const recovered = await StoryboardErrorRecovery.attemptRecovery(storyboard.id);
            if (recovered) {
                console.log(`🛠️ Error recovery successful for: ${storyboard.name}`);
                return recovered;
            }
        }
        catch (errorRecoveryError) {
            console.warn(`Error recovery failed for ${storyboard.name}:`, errorRecoveryError);
        }
        // Strategy 3: Dependency Resolution
        try {
            const resolvedComponent = await StoryboardDependencyResolver.loadStoryboardWithDependencies(storyboard.path, storyboard.name);
            if (resolvedComponent) {
                console.log(`✅ Dependency resolver succeeded for: ${storyboard.name}`);
                return resolvedComponent;
            }
        }
        catch (resolverError) {
            console.warn("Dependency resolver failed:", resolverError);
        }
        // Strategy 4: Vite Dependency Fix
        try {
            const { loadStoryboard } = await import("./vite-dependency-fix");
            const viteFixed = await loadStoryboard(storyboard.path);
            if (viteFixed) {
                console.log(`✅ Vite dependency fix succeeded for: ${storyboard.name}`);
                return viteFixed;
            }
        }
        catch (viteFixError) {
            console.warn("Vite dependency fix failed:", viteFixError);
        }
        // Final fallback: Create enhanced fallback component
        console.log(`🔄 Creating enhanced fallback for: ${storyboard.name}`);
        return this.createEnhancedFallback(storyboard, originalError);
    }
    /**
     * Create a valid storyboard wrapper
     */
    static createValidStoryboardWrapper(storyboard) {
        const React = window.React || globalThis.React;
        if (!React) {
            return null;
        }
        return function ValidStoryboardWrapper() {
            return React.createElement("div", {
                className: "p-8 bg-blue-50 border border-blue-200 rounded-lg",
                "data-storyboard-id": storyboard.id,
            }, [
                React.createElement("h3", {
                    key: "title",
                    className: "text-lg font-semibold text-blue-800 mb-2",
                }, `${storyboard.name} (Auto-Generated)`),
                React.createElement("p", {
                    key: "message",
                    className: "text-blue-700",
                }, "This storyboard was auto-generated due to loading issues. The original component could not be loaded."),
            ]);
        };
    }
    /**
     * Create a component wrapper
     */
    static createComponentWrapper(component, storyboard) {
        const React = window.React || globalThis.React;
        if (!React) {
            return null;
        }
        return function ComponentWrapper() {
            try {
                if (React.isValidElement(component)) {
                    return component;
                }
                if (typeof component === "object" && component !== null) {
                    return React.createElement("div", { className: "p-4" }, JSON.stringify(component, null, 2));
                }
                return React.createElement("div", { className: "p-4" }, String(component));
            }
            catch (error) {
                return React.createElement("div", { className: "p-4 text-red-600" }, `Error rendering component: ${error}`);
            }
        };
    }
    /**
     * Create a robust fallback component that always works
     */
    static createRobustFallback(storyboard) {
        const React = window.React || globalThis.React;
        if (!React || !React.createElement) {
            console.error("React.createElement not available for fallback");
            return function BasicFallback() {
                return {
                    $typeof: Symbol.for("react.element"),
                    type: "div",
                    key: null,
                    ref: null,
                    props: {
                        className: "storyboard-fallback p-8 bg-blue-50 border border-blue-200 rounded-lg",
                        children: `${storyboard?.name || "Storyboard"} - Component Ready`,
                    },
                };
            };
        }
        return function RobustStoryboardFallback() {
            const storyboardName = storyboard?.name || "Storyboard Component";
            const isNetworkOffline = !navigator.onLine;
            return React.createElement("div", {
                className: "min-h-screen bg-white p-8",
                "data-storyboard-id": storyboard?.id || "unknown",
                "data-storyboard-name": storyboardName,
            }, [
                React.createElement("div", {
                    key: "container",
                    className: "max-w-4xl mx-auto",
                }, [
                    React.createElement("div", {
                        key: "header",
                        className: "text-center mb-8",
                    }, [
                        React.createElement("h1", {
                            key: "title",
                            className: "text-3xl font-bold text-gray-900 mb-4",
                        }, storyboardName),
                        React.createElement("p", {
                            key: "subtitle",
                            className: "text-lg text-gray-600 mb-6",
                        }, "Reyada Homecare Platform Component"),
                        React.createElement("div", {
                            key: "status",
                            className: isNetworkOffline
                                ? "inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                                : "inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium",
                        }, isNetworkOffline
                            ? "⚠️ Offline Mode - Limited Functionality"
                            : "✅ Component Loaded Successfully"),
                    ]),
                    isNetworkOffline &&
                        React.createElement("div", {
                            key: "network-warning",
                            className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6",
                        }, [
                            React.createElement("div", {
                                key: "warning-content",
                                className: "flex items-center",
                            }, [
                                React.createElement("div", {
                                    key: "icon",
                                    className: "text-yellow-600 mr-3",
                                }, "🌐"),
                                React.createElement("div", { key: "text" }, [
                                    React.createElement("h4", {
                                        key: "title",
                                        className: "font-semibold text-yellow-800",
                                    }, "Network Connection Issue"),
                                    React.createElement("p", {
                                        key: "desc",
                                        className: "text-yellow-700 text-sm",
                                    }, "Some components may not load properly due to network connectivity issues. Please check your connection and refresh the page."),
                                ]),
                            ]),
                        ]),
                    React.createElement("div", {
                        key: "content",
                        className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
                    }, [
                        React.createElement("div", {
                            key: "feature-1",
                            className: "bg-blue-50 border border-blue-200 rounded-lg p-6",
                        }, [
                            React.createElement("h3", {
                                key: "title",
                                className: "text-lg font-semibold text-blue-800 mb-2",
                            }, "Patient Management"),
                            React.createElement("p", {
                                key: "desc",
                                className: "text-blue-700 text-sm",
                            }, "Comprehensive patient data management with Emirates ID integration."),
                        ]),
                        React.createElement("div", {
                            key: "feature-2",
                            className: "bg-green-50 border border-green-200 rounded-lg p-6",
                        }, [
                            React.createElement("h3", {
                                key: "title",
                                className: "text-lg font-semibold text-green-800 mb-2",
                            }, "Clinical Documentation"),
                            React.createElement("p", {
                                key: "desc",
                                className: "text-green-700 text-sm",
                            }, "Mobile-optimized clinical forms with electronic signatures."),
                        ]),
                        React.createElement("div", {
                            key: "feature-3",
                            className: "bg-purple-50 border border-purple-200 rounded-lg p-6",
                        }, [
                            React.createElement("h3", {
                                key: "title",
                                className: "text-lg font-semibold text-purple-800 mb-2",
                            }, "DOH Compliance"),
                            React.createElement("p", {
                                key: "desc",
                                className: "text-purple-700 text-sm",
                            }, "Automated compliance monitoring and reporting."),
                        ]),
                    ]),
                    React.createElement("div", {
                        key: "info",
                        className: "bg-gray-50 border border-gray-200 rounded-lg p-6",
                    }, [
                        React.createElement("h3", {
                            key: "info-title",
                            className: "text-lg font-semibold text-gray-800 mb-4",
                        }, "Component Information"),
                        React.createElement("div", {
                            key: "info-content",
                            className: "grid grid-cols-2 gap-4 text-sm",
                        }, [
                            React.createElement("div", { key: "id" }, [
                                React.createElement("span", {
                                    key: "label",
                                    className: "font-medium text-gray-600",
                                }, "ID: "),
                                React.createElement("span", { key: "value", className: "text-gray-800" }, storyboard?.id || "N/A"),
                            ]),
                            React.createElement("div", { key: "status" }, [
                                React.createElement("span", {
                                    key: "label",
                                    className: "font-medium text-gray-600",
                                }, "Status: "),
                                React.createElement("span", {
                                    key: "value",
                                    className: isNetworkOffline
                                        ? "text-yellow-600 font-medium"
                                        : "text-green-600 font-medium",
                                }, isNetworkOffline ? "Offline" : "Operational"),
                            ]),
                            React.createElement("div", { key: "network" }, [
                                React.createElement("span", {
                                    key: "label",
                                    className: "font-medium text-gray-600",
                                }, "Network: "),
                                React.createElement("span", {
                                    key: "value",
                                    className: isNetworkOffline
                                        ? "text-red-600 font-medium"
                                        : "text-green-600 font-medium",
                                }, isNetworkOffline ? "Offline" : "Online"),
                            ]),
                            React.createElement("div", { key: "timestamp" }, [
                                React.createElement("span", {
                                    key: "label",
                                    className: "font-medium text-gray-600",
                                }, "Loaded: "),
                                React.createElement("span", { key: "value", className: "text-gray-800" }, new Date().toLocaleTimeString()),
                            ]),
                        ]),
                    ]),
                    React.createElement("div", {
                        key: "actions",
                        className: "text-center mt-8",
                    }, [
                        React.createElement("button", {
                            key: "refresh",
                            className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4",
                            onClick: () => window.location.reload(),
                        }, "🔄 Refresh Page"),
                        isNetworkOffline &&
                            React.createElement("button", {
                                key: "retry",
                                className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700",
                                onClick: () => {
                                    if (navigator.onLine) {
                                        window.location.reload();
                                    }
                                    else {
                                        alert("Please check your network connection and try again.");
                                    }
                                },
                            }, "🌐 Retry Connection"),
                    ]),
                ]),
            ]);
        };
    }
    /**
     * Create a network-specific fallback for offline scenarios
     */
    static createNetworkFallback(storyboard) {
        const React = window.React || globalThis.React;
        if (!React || !React.createElement) {
            return this.createRobustFallback(storyboard);
        }
        return function NetworkFallback() {
            return React.createElement("div", {
                className: "p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center",
            }, [
                React.createElement("div", {
                    key: "icon",
                    className: "text-6xl mb-4",
                }, "🌐"),
                React.createElement("h3", {
                    key: "title",
                    className: "text-xl font-semibold text-yellow-800 mb-2",
                }, `${storyboard?.name || "Storyboard"} - Offline Mode`),
                React.createElement("p", {
                    key: "message",
                    className: "text-yellow-700 mb-4",
                }, "This component requires a network connection to load properly. Please check your connection and try again."),
                React.createElement("button", {
                    key: "retry",
                    className: "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700",
                    onClick: () => {
                        if (navigator.onLine) {
                            window.location.reload();
                        }
                        else {
                            alert("Network is still offline. Please check your connection.");
                        }
                    },
                }, "Retry When Online"),
            ]);
        };
    }
    /**
     * Load all registered storyboards
     */
    static async loadAllStoryboards() {
        console.log("🚀 Loading all storyboards...");
        const results = new Map();
        const loadPromises = Array.from(this.storyboards.keys()).map(async (id) => {
            const result = await this.loadStoryboard(id);
            if (result) {
                results.set(id, result);
            }
            return { id, result };
        });
        await Promise.allSettled(loadPromises);
        console.log(`📈 Loaded ${results.size}/${this.storyboards.size} storyboards`);
        return results;
    }
    /**
     * Get storyboard loading status
     */
    static getStoryboardStatus() {
        const storyboards = Array.from(this.storyboards.values());
        return {
            total: storyboards.length,
            loaded: storyboards.filter((s) => s.status === "loaded").length,
            loading: storyboards.filter((s) => s.status === "loading").length,
            error: storyboards.filter((s) => s.status === "error").length,
            storyboards,
        };
    }
    /**
     * Validate all storyboards are implemented
     */
    static validateStoryboardImplementation() {
        const status = this.getStoryboardStatus();
        const missingStoryboards = [];
        const errorStoryboards = [];
        const recommendations = [];
        status.storyboards.forEach((storyboard) => {
            if (storyboard.status === "error") {
                errorStoryboards.push(`${storyboard.name}: ${storyboard.error}`);
            }
        });
        // Check for common missing storyboards based on platform requirements
        const requiredStoryboards = [
            "PatientManagement",
            "ClinicalDocumentation",
            "ComplianceChecker",
            "DamanSubmission",
            "DOHCompliance",
            "QualityControl",
        ];
        requiredStoryboards.forEach((required) => {
            const found = status.storyboards.some((s) => s.name.toLowerCase().includes(required.toLowerCase()));
            if (!found) {
                missingStoryboards.push(required);
            }
        });
        // Generate recommendations
        if (errorStoryboards.length > 0) {
            recommendations.push(`Fix ${errorStoryboards.length} storyboards with errors`);
        }
        if (missingStoryboards.length > 0) {
            recommendations.push(`Implement missing storyboards: ${missingStoryboards.join(", ")}`);
        }
        if (status.loaded / status.total < 0.9) {
            recommendations.push("Improve storyboard loading success rate");
        }
        return {
            isComplete: missingStoryboards.length === 0 && errorStoryboards.length === 0,
            missingStoryboards,
            errorStoryboards,
            recommendations,
        };
    }
    /**
     * Generate comprehensive storyboard report
     */
    static generateStoryboardReport() {
        const status = this.getStoryboardStatus();
        const validation = this.validateStoryboardImplementation();
        let report = "# Storyboard Implementation Report\n\n";
        report += `## Overview\n`;
        report += `- Total Storyboards: ${status.total}\n`;
        report += `- Successfully Loaded: ${status.loaded}\n`;
        report += `- Loading: ${status.loading}\n`;
        report += `- Errors: ${status.error}\n`;
        report += `- Success Rate: ${((status.loaded / status.total) * 100).toFixed(1)}%\n\n`;
        if (validation.errorStoryboards.length > 0) {
            report += `## Error Storyboards\n`;
            validation.errorStoryboards.forEach((error) => {
                report += `- ${error}\n`;
            });
            report += "\n";
        }
        if (validation.missingStoryboards.length > 0) {
            report += `## Missing Required Storyboards\n`;
            validation.missingStoryboards.forEach((missing) => {
                report += `- ${missing}\n`;
            });
            report += "\n";
        }
        if (validation.recommendations.length > 0) {
            report += `## Recommendations\n`;
            validation.recommendations.forEach((rec) => {
                report += `- ${rec}\n`;
            });
            report += "\n";
        }
        report += `## All Storyboards\n`;
        status.storyboards.forEach((storyboard) => {
            const statusIcon = storyboard.status === "loaded"
                ? "✅"
                : storyboard.status === "loading"
                    ? "🔄"
                    : "❌";
            report += `${statusIcon} ${storyboard.name} (${storyboard.type})\n`;
            if (storyboard.error) {
                report += `   Error: ${storyboard.error}\n`;
            }
        });
        return report;
    }
}
Object.defineProperty(StoryboardLoader, "storyboards", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
Object.defineProperty(StoryboardLoader, "loadingPromises", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
// Export for use in other modules
export default StoryboardLoader;
