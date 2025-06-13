/**
 * Storyboard Dependency Resolver
 * Resolves dependency issues that prevent storyboards from loading
 */
import React from "react";
// Enhanced dependency resolution for storyboards
export class StoryboardDependencyResolver {
    /**
     * Pre-resolve common dependencies to prevent runtime failures
     */
    static async preResolveDependencies() {
        const commonDependencies = [
            "react",
            "react-dom",
            "lucide-react",
            "@/components/ui/card",
            "@/components/ui/button",
            "@/components/ui/badge",
            "@/components/ui/alert",
            "@/components/ui/progress",
            "@/components/ui/tabs",
            "@/components/ui/input",
            "@/components/ui/textarea",
            "@/components/ui/select",
            "@/components/ui/checkbox",
            "@/components/ui/label",
            "@/components/ui/avatar",
            "@/components/ui/separator",
            "@/components/ui/accordion",
            "@/components/ui/scroll-area",
            "@/components/ui/dialog",
            "@/components/ui/dropdown-menu",
            "@/components/ui/toast",
            "@/components/ui/alert-dialog",
        ];
        console.log("🔧 Pre-resolving storyboard dependencies...");
        for (const dep of commonDependencies) {
            try {
                let resolvedDep = null;
                if (dep === "react") {
                    resolvedDep = React;
                }
                else if (dep === "react-dom") {
                    resolvedDep = await import("react-dom");
                }
                else if (dep === "lucide-react") {
                    resolvedDep = await import("lucide-react");
                }
                else {
                    // Try to import UI components
                    try {
                        resolvedDep = await import(/* @vite-ignore */ dep);
                    }
                    catch (importError) {
                        // Try alternative import paths
                        const altPaths = [
                            dep.replace("@/", "./src/"),
                            dep.replace("@/components/", "./src/components/"),
                            `./src/${dep.replace("@/", "")}`,
                        ];
                        for (const altPath of altPaths) {
                            try {
                                resolvedDep = await import(/* @vite-ignore */ altPath);
                                break;
                            }
                            catch (altError) {
                                continue;
                            }
                        }
                    }
                }
                if (resolvedDep) {
                    this.resolvedDependencies.set(dep, resolvedDep);
                    console.log(`✅ Resolved dependency: ${dep}`);
                }
                else {
                    this.failedDependencies.add(dep);
                    console.warn(`⚠️ Failed to resolve dependency: ${dep}`);
                }
            }
            catch (error) {
                this.failedDependencies.add(dep);
                console.warn(`❌ Error resolving dependency ${dep}:`, error);
            }
        }
        console.log(`🎯 Dependency resolution complete: ${this.resolvedDependencies.size} resolved, ${this.failedDependencies.size} failed`);
    }
    /**
     * Get a resolved dependency
     */
    static getResolvedDependency(depName) {
        return this.resolvedDependencies.get(depName);
    }
    /**
     * Check if a dependency failed to resolve
     */
    static isDependencyFailed(depName) {
        return this.failedDependencies.has(depName);
    }
    /**
     * Create a dependency-safe storyboard wrapper
     */
    static createSafeStoryboardWrapper(storyboardComponent, storyboardName) {
        return function SafeStoryboardWrapper(props) {
            try {
                // Ensure React is available
                if (!React || !React.createElement) {
                    throw new Error("React is not available");
                }
                // Try to render the storyboard component
                if (typeof storyboardComponent === "function") {
                    return React.createElement(storyboardComponent, props);
                }
                else if (storyboardComponent &&
                    typeof storyboardComponent.default === "function") {
                    return React.createElement(storyboardComponent.default, props);
                }
                else {
                    throw new Error("Invalid storyboard component");
                }
            }
            catch (error) {
                console.error(`Error rendering storyboard ${storyboardName}:`, error);
                // Return error fallback
                return React.createElement("div", {
                    className: "p-8 bg-red-50 border border-red-200 rounded-lg text-center",
                }, [
                    React.createElement("h3", {
                        key: "title",
                        className: "text-lg font-semibold text-red-800 mb-2",
                    }, `Storyboard Error: ${storyboardName}`),
                    React.createElement("p", {
                        key: "message",
                        className: "text-red-700 mb-4",
                    }, `Failed to render storyboard due to dependency issues.`),
                    React.createElement("details", {
                        key: "details",
                        className: "text-left",
                    }, [
                        React.createElement("summary", {
                            key: "summary",
                            className: "cursor-pointer text-red-600 hover:text-red-800",
                        }, "Error Details"),
                        React.createElement("pre", {
                            key: "error",
                            className: "mt-2 p-2 bg-red-100 rounded text-xs overflow-auto",
                        }, error.toString()),
                    ]),
                    React.createElement("button", {
                        key: "reload",
                        className: "mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",
                        onClick: () => {
                            // Try to reload dependencies and refresh
                            this.preResolveDependencies().then(() => {
                                window.location.reload();
                            });
                        },
                    }, "Reload with Dependency Fix"),
                ]);
            }
        };
    }
    /**
     * Enhanced storyboard loading with dependency resolution
     */
    static async loadStoryboardWithDependencies(storyboardPath, storyboardName) {
        try {
            // Ensure dependencies are pre-resolved
            if (this.resolvedDependencies.size === 0) {
                await this.preResolveDependencies();
            }
            // Load the storyboard
            const storyboardModule = await import(/* @vite-ignore */ storyboardPath);
            const storyboardComponent = storyboardModule.default || storyboardModule;
            if (!storyboardComponent) {
                throw new Error("No component found in storyboard module");
            }
            // Wrap in safety wrapper
            return this.createSafeStoryboardWrapper(storyboardComponent, storyboardName);
        }
        catch (error) {
            console.error(`Failed to load storyboard ${storyboardName} from ${storyboardPath}:`, error);
            // Return error component
            return function StoryboardLoadError() {
                return React.createElement("div", {
                    className: "p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center",
                }, [
                    React.createElement("h3", {
                        key: "title",
                        className: "text-lg font-semibold text-yellow-800 mb-2",
                    }, `Loading Error: ${storyboardName}`),
                    React.createElement("p", {
                        key: "message",
                        className: "text-yellow-700",
                    }, `Could not load storyboard from: ${storyboardPath}`),
                ]);
            };
        }
    }
    /**
     * Get dependency resolution status
     */
    static getDependencyStatus() {
        return {
            resolved: this.resolvedDependencies.size,
            failed: this.failedDependencies.size,
            resolvedDeps: Array.from(this.resolvedDependencies.keys()),
            failedDeps: Array.from(this.failedDependencies),
        };
    }
}
Object.defineProperty(StoryboardDependencyResolver, "resolvedDependencies", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
Object.defineProperty(StoryboardDependencyResolver, "failedDependencies", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Set()
});
// Initialize dependency resolution on module load
StoryboardDependencyResolver.preResolveDependencies().catch((error) => {
    console.error("Failed to pre-resolve dependencies:", error);
});
export default StoryboardDependencyResolver;
