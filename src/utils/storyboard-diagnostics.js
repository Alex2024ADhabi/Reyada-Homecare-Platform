/**
 * Storyboard Diagnostics System
 * Provides comprehensive diagnostics for storyboard loading issues
 */
export class StoryboardDiagnostics {
    /**
     * Run INSTANT diagnostics on the storyboard system
     */
    static async runDiagnostics() {
        const results = [];
        const recommendations = [];
        console.log("🔍 Running INSTANT storyboard diagnostics...");
        // INSTANT checks - no delays
        results.push(this.checkReactAvailability());
        results.push(this.checkDynamicImportSupport());
        results.push(this.checkViteEnvironment());
        results.push(this.checkMemoryUsage());
        results.push(this.checkNetworkConnectivity());
        results.push(this.checkModuleResolution());
        // Generate recommendations based on results
        const failedChecks = results.filter(r => r.status === 'fail');
        const warningChecks = results.filter(r => r.status === 'warn');
        if (failedChecks.length > 0) {
            recommendations.push('Critical issues detected - restart development server');
            failedChecks.forEach(check => {
                recommendations.push(`Fix ${check.category}: ${check.message}`);
            });
        }
        if (warningChecks.length > 0) {
            warningChecks.forEach(check => {
                recommendations.push(`Address warning in ${check.category}: ${check.message}`);
            });
        }
        const overall = failedChecks.length > 0 ? 'critical' :
            warningChecks.length > 0 ? 'warning' : 'healthy';
        return { overall, results, recommendations };
    }
    static checkReactAvailability() {
        try {
            const React = window.React || globalThis.React;
            if (!React) {
                return {
                    category: 'React Runtime',
                    status: 'fail',
                    message: 'React is not available globally',
                    details: { windowReact: !!window.React, globalReact: !!globalThis.React }
                };
            }
            if (!React.createElement) {
                return {
                    category: 'React Runtime',
                    status: 'fail',
                    message: 'React.createElement is not available',
                };
            }
            return {
                category: 'React Runtime',
                status: 'pass',
                message: 'React is properly initialized',
                details: { version: React.version }
            };
        }
        catch (error) {
            return {
                category: 'React Runtime',
                status: 'fail',
                message: `React check failed: ${error}`,
            };
        }
    }
    static checkDynamicImportSupport() {
        try {
            if (typeof )
                ;
             !== 'function';
            {
                return {
                    category: 'Dynamic Imports',
                    status: 'fail',
                    message: 'Dynamic import is not supported',
                };
            }
            return {
                category: 'Dynamic Imports',
                status: 'pass',
                message: 'Dynamic import is supported',
            };
        }
        catch (error) {
            return {
                category: 'Dynamic Imports',
                status: 'fail',
                message: `Dynamic import check failed: ${error}`,
            };
        }
    }
    static checkViteEnvironment() {
        try {
            const viteEnv = import.meta.env;
            if (!viteEnv) {
                return {
                    category: 'Vite Environment',
                    status: 'fail',
                    message: 'Vite environment not detected',
                };
            }
            const isDev = viteEnv.DEV;
            const isTempo = viteEnv.VITE_TEMPO;
            if (!isDev) {
                return {
                    category: 'Vite Environment',
                    status: 'warn',
                    message: 'Not running in development mode',
                    details: { mode: viteEnv.MODE }
                };
            }
            return {
                category: 'Vite Environment',
                status: 'pass',
                message: 'Vite environment is properly configured',
                details: { dev: isDev, tempo: isTempo, mode: viteEnv.MODE }
            };
        }
        catch (error) {
            return {
                category: 'Vite Environment',
                status: 'fail',
                message: `Vite environment check failed: ${error}`,
            };
        }
    }
    static checkMemoryUsage() {
        try {
            if (typeof performance === 'undefined' || !performance.memory) {
                return {
                    category: 'Memory Usage',
                    status: 'warn',
                    message: 'Memory usage information not available',
                };
            }
            const memory = performance.memory;
            const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usedPercent > 90) {
                return {
                    category: 'Memory Usage',
                    status: 'fail',
                    message: 'Very high memory usage detected',
                    details: { usedPercent: usedPercent.toFixed(1) }
                };
            }
            if (usedPercent > 70) {
                return {
                    category: 'Memory Usage',
                    status: 'warn',
                    message: 'High memory usage detected',
                    details: { usedPercent: usedPercent.toFixed(1) }
                };
            }
            return {
                category: 'Memory Usage',
                status: 'pass',
                message: 'Memory usage is within normal limits',
                details: { usedPercent: usedPercent.toFixed(1) }
            };
        }
        catch (error) {
            return {
                category: 'Memory Usage',
                status: 'warn',
                message: `Memory usage check failed: ${error}`,
            };
        }
    }
    static checkNetworkConnectivity() {
        try {
            if (!navigator.onLine) {
                return {
                    category: 'Network Connectivity',
                    status: 'warn',
                    message: 'Browser reports offline status',
                };
            }
            return {
                category: 'Network Connectivity',
                status: 'pass',
                message: 'Network connectivity is available',
            };
        }
        catch (error) {
            return {
                category: 'Network Connectivity',
                status: 'warn',
                message: `Network connectivity check failed: ${error}`,
            };
        }
    }
    static checkModuleResolution() {
        try {
            // Check if React is already available (instant check)
            const React = window.React || globalThis.React;
            if (!React) {
                return {
                    category: 'Module Resolution',
                    status: 'fail',
                    message: 'React module not available in global scope',
                };
            }
            return {
                category: 'Module Resolution',
                status: 'pass',
                message: 'Module resolution is working',
            };
        }
        catch (error) {
            return {
                category: 'Module Resolution',
                status: 'fail',
                message: `Module resolution failed: ${error}`,
            };
        }
    }
    /**
     * Generate a diagnostic report as a formatted string
     */
    static formatDiagnosticReport(diagnostics) {
        let report = `# Storyboard System Diagnostics\n\n`;
        report += `**Overall Status:** ${diagnostics.overall.toUpperCase()}\n\n`;
        report += `## Test Results\n\n`;
        diagnostics.results.forEach(result => {
            const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
            report += `${icon} **${result.category}:** ${result.message}\n`;
            if (result.details) {
                report += `   Details: ${JSON.stringify(result.details)}\n`;
            }
            report += `\n`;
        });
        if (diagnostics.recommendations.length > 0) {
            report += `## Recommendations\n\n`;
            diagnostics.recommendations.forEach(rec => {
                report += `- ${rec}\n`;
            });
        }
        return report;
    }
}
export default StoryboardDiagnostics;
