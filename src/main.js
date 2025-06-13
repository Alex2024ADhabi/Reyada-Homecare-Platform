import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast-provider";
// Enhanced error recovery system with comprehensive logging and recovery
class ErrorRecovery {
    constructor() {
        Object.defineProperty(this, "errorCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "errorLog", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "recoveryAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxRecoveryAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        });
    }
    static getInstance() {
        if (!ErrorRecovery.instance) {
            ErrorRecovery.instance = new ErrorRecovery();
        }
        return ErrorRecovery.instance;
    }
    handleError(error, source) {
        this.errorCount++;
        const timestamp = Date.now();
        const stack = error?.stack || new Error().stack;
        // Enhanced error logging with context
        this.errorLog.push({ error, source, timestamp, stack });
        console.group(`🚨 [${source}] Error #${this.errorCount}`);
        console.error("Error:", error);
        console.error("Stack:", stack);
        console.error("Timestamp:", new Date(timestamp).toISOString());
        console.groupEnd();
        // Maintain error log size
        if (this.errorLog.length > 20) {
            this.errorLog = this.errorLog.slice(-20);
        }
        // Check if recovery is needed
        if (this.errorCount >= this.maxErrors &&
            this.recoveryAttempts < this.maxRecoveryAttempts) {
            console.error("🔄 Maximum errors reached - initiating recovery");
            this.initiateRecovery();
            return true;
        }
        else if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.error("💀 Maximum recovery attempts reached - showing critical error");
            this.showCriticalError();
            return true;
        }
        return false;
    }
    initiateRecovery() {
        this.recoveryAttempts++;
        // Show recovery UI
        const errorContainer = document.createElement("div");
        errorContainer.id = "error-recovery-container";
        errorContainer.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 600;">Application Recovery</h2>
          <p style="margin-bottom: 1.5rem; color: #6b7280; line-height: 1.5;">The application encountered errors and is attempting to recover. This may take a few moments.</p>
          <div style="margin-bottom: 1.5rem;">
            <div style="
              width: 48px;
              height: 48px;
              border: 4px solid #f3f4f6;
              border-top: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            "></div>
          </div>
          <p style="font-size: 0.875rem; color: #9ca3af;">Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}</p>
          <div style="margin-top: 1rem;">
            <button onclick="window.location.reload()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.875rem;
              margin-right: 0.5rem;
            ">Force Refresh</button>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.875rem;
            ">Dismiss</button>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
        // Remove existing error containers
        const existing = document.getElementById("error-recovery-container");
        if (existing) {
            existing.remove();
        }
        document.body.appendChild(errorContainer);
        // Auto-recovery after delay
        setTimeout(() => {
            console.log("🔄 Attempting automatic recovery...");
            this.reset();
            errorContainer.remove();
            // Try to re-initialize the app
            try {
                const rootElement = document.getElementById("root");
                if (rootElement && rootElement.innerHTML === "") {
                    initializeApp();
                }
            }
            catch (reinitError) {
                console.error("❌ Re-initialization failed:", reinitError);
                window.location.reload();
            }
        }, 3000);
    }
    showCriticalError() {
        const errorContainer = document.createElement("div");
        errorContainer.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        ">
          <div style="
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            background: #dc2626;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.75rem; font-weight: 700;">Critical Application Error</h1>
          <p style="margin-bottom: 1.5rem; color: #374151; line-height: 1.6;">The application has encountered multiple critical errors and cannot recover automatically. Please refresh the page or contact support if the problem persists.</p>
          <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
            <h3 style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Error Summary:</h3>
            <p style="font-size: 0.75rem; color: #6b7280;">Errors: ${this.errorCount}, Recovery attempts: ${this.recoveryAttempts}</p>
            <p style="font-size: 0.75rem; color: #6b7280;">Last error: ${this.errorLog[this.errorLog.length - 1]?.error?.message || "Unknown"}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; justify-content: center;">
            <button onclick="window.location.reload()" style="
              background: #dc2626;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">Refresh Application</button>
            <button onclick="window.location.href = '/'" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">Go to Home</button>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(errorContainer);
    }
    reset() {
        this.errorCount = 0;
        this.errorLog = [];
        console.log("✅ Error recovery system reset");
    }
    getErrorSummary() {
        return `Errors: ${this.errorCount}/${this.maxErrors}, Recovery: ${this.recoveryAttempts}/${this.maxRecoveryAttempts}, Recent: ${this.errorLog.length}`;
    }
    getDetailedReport() {
        return {
            errorCount: this.errorCount,
            maxErrors: this.maxErrors,
            recoveryAttempts: this.recoveryAttempts,
            maxRecoveryAttempts: this.maxRecoveryAttempts,
            recentErrors: this.errorLog.slice(-5),
            timestamp: Date.now(),
        };
    }
}
const errorRecovery = ErrorRecovery.getInstance();
// Enhanced global error handlers with better categorization
window.addEventListener("error", (event) => {
    const error = event.error || event.message;
    const source = event.filename
        ? `${event.filename}:${event.lineno}`
        : "Global Error";
    errorRecovery.handleError(error, source);
});
window.addEventListener("unhandledrejection", (event) => {
    errorRecovery.handleError(event.reason, "Promise Rejection");
    event.preventDefault();
});
// Initialize Tempo Devtools with enhanced error handling and multiple strategies
const initTempoDevtools = async () => {
    if (process.env.TEMPO !== "true" && process.env.NODE_ENV !== "development") {
        console.log("⏭️ Tempo devtools skipped (not in development mode)");
        return;
    }
    try {
        // Prevent double initialization
        if (window.__TEMPO_DEVTOOLS_INITIALIZED__) {
            console.log("✅ Tempo devtools already initialized");
            return;
        }
        console.log("🚀 Initializing Tempo devtools...");
        // Enhanced import strategies with timeout
        const importWithTimeout = (importFn, timeout = 5000) => {
            return Promise.race([
                importFn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Import timeout")), timeout)),
            ]);
        };
        let TempoDevtools;
        const importStrategies = [
            () => importWithTimeout(() => import("tempo-devtools")),
            () => Promise.resolve(require("tempo-devtools")),
            () => importWithTimeout(() => import("tempo-devtools/dist/index")),
        ];
        let importSuccess = false;
        for (const [index, strategy] of importStrategies.entries()) {
            try {
                console.log(`📦 Trying import strategy ${index + 1}...`);
                TempoDevtools = await strategy();
                if (TempoDevtools) {
                    importSuccess = true;
                    console.log(`✅ Import strategy ${index + 1} succeeded`);
                    break;
                }
            }
            catch (importError) {
                console.warn(`⚠️ Import strategy ${index + 1} failed:`, importError.message);
                continue;
            }
        }
        if (!importSuccess) {
            throw new Error("All import strategies failed");
        }
        // Enhanced initialization with multiple method attempts
        const initMethods = [
            () => TempoDevtools?.TempoDevtools?.init?.(),
            () => TempoDevtools?.init?.(),
            () => TempoDevtools?.default?.init?.(),
            () => TempoDevtools?.default?.TempoDevtools?.init?.(),
        ];
        let initSuccess = false;
        for (const [index, method] of initMethods.entries()) {
            try {
                if (typeof method === "function") {
                    console.log(`🔧 Trying init method ${index + 1}...`);
                    await method();
                    initSuccess = true;
                    console.log(`✅ Init method ${index + 1} succeeded`);
                    break;
                }
            }
            catch (methodError) {
                console.warn(`⚠️ Init method ${index + 1} failed:`, methodError.message);
                continue;
            }
        }
        if (!initSuccess) {
            throw new Error("All initialization methods failed");
        }
        window.__TEMPO_DEVTOOLS_INITIALIZED__ = true;
        console.log("✅ Tempo devtools initialized successfully");
        errorRecovery.reset();
    }
    catch (error) {
        console.warn("⚠️ Tempo devtools initialization failed:", error.message);
        // Don't treat this as a critical error for the main app
    }
};
// Enhanced error boundary component with better UX
class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            errorInfo: null,
            errorId: Math.random().toString(36).substr(2, 9),
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.group("🚨 React Error Boundary");
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
        console.error("Component Stack:", errorInfo.componentStack);
        console.groupEnd();
        this.setState({ errorInfo });
        errorRecovery.handleError(error, "React Error Boundary");
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4", children: _jsxs("div", { className: "text-center p-8 bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200", children: [_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg", children: _jsx("svg", { className: "w-10 h-10 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-3", children: "Application Error" }), _jsx("p", { className: "text-gray-600 mb-4 leading-relaxed", children: "Something went wrong in the application. Our error recovery system is working to resolve this." }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "text-sm text-gray-700 space-y-1", children: [_jsxs("div", { children: [_jsx("strong", { children: "Error ID:" }), " ", this.state.errorId] }), _jsxs("div", { children: [_jsx("strong", { children: "Status:" }), " ", errorRecovery.getErrorSummary()] }), _jsxs("div", { children: [_jsx("strong", { children: "Time:" }), " ", new Date().toLocaleTimeString()] })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: () => window.location.reload(), className: "w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md", children: "Refresh Application" }), _jsx("button", { onClick: () => this.setState({ hasError: false, errorInfo: null }), className: "w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium", children: "Try Again" }), _jsx("button", { onClick: () => (window.location.href = "/"), className: "w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium", children: "Go to Home" })] })] }) }));
        }
        return this.props.children;
    }
}
// Enhanced application initialization with comprehensive error handling
const initializeApp = async () => {
    try {
        console.log("🚀 Starting application initialization...");
        console.log("📊 Environment:", {
            NODE_ENV: process.env.NODE_ENV,
            TEMPO: process.env.TEMPO,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });
        // Initialize Tempo devtools first
        await initTempoDevtools();
        // Verify root element exists with enhanced checks
        const rootElement = document.getElementById("root");
        if (!rootElement) {
            throw new Error("Root element not found in DOM");
        }
        // Check if root element is already populated
        if (rootElement.innerHTML.trim() !== "") {
            console.log("⚠️ Root element already has content, clearing...");
            rootElement.innerHTML = "";
        }
        console.log("✅ Root element verified, creating React root...");
        const root = ReactDOM.createRoot(rootElement);
        // Enhanced render with comprehensive error boundary
        root.render(_jsx(React.StrictMode, { children: _jsx(AppErrorBoundary, { children: _jsx(BrowserRouter, { children: _jsx(ToastProvider, { children: _jsx(App, {}) }) }) }) }));
        console.log("✅ Application rendered successfully");
        // Enhanced performance monitoring
        if (typeof window !== "undefined" && "performance" in window) {
            setTimeout(() => {
                try {
                    const perfData = performance.getEntriesByType("navigation")[0];
                    if (perfData) {
                        const loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart);
                        const domContentLoaded = Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart);
                        console.log(`📊 Performance metrics:`);
                        console.log(`   - Total load time: ${loadTime}ms`);
                        console.log(`   - DOM content loaded: ${domContentLoaded}ms`);
                        console.log(`   - DNS lookup: ${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms`);
                        console.log(`   - Connection: ${Math.round(perfData.connectEnd - perfData.connectStart)}ms`);
                    }
                }
                catch (perfError) {
                    console.warn("⚠️ Performance monitoring failed:", perfError.message);
                }
            }, 1000);
        }
        // Set up health check
        setTimeout(() => {
            const healthCheck = document.getElementById("root");
            if (healthCheck && healthCheck.children.length === 0) {
                console.warn("⚠️ Health check failed - root element is empty");
                errorRecovery.handleError(new Error("Application health check failed"), "Health Check");
            }
            else {
                console.log("✅ Application health check passed");
            }
        }, 2000);
    }
    catch (error) {
        console.error("❌ Application initialization failed:", error);
        errorRecovery.handleError(error, "App Initialization");
        // Enhanced fallback UI for critical failures
        const rootElement = document.getElementById("root");
        if (rootElement) {
            rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="text-align: center; padding: 3rem; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 500px; margin: 1rem;">
            <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 style="color: #1f2937; margin-bottom: 1rem; font-size: 2rem; font-weight: 700;">Initialization Failed</h1>
            <p style="margin-bottom: 2rem; color: #6b7280; line-height: 1.6; font-size: 1.1rem;">The application failed to start properly. This might be due to a network issue or a temporary problem.</p>
            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
              <h3 style="font-size: 1rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Error Details:</h3>
              <p style="font-size: 0.875rem; color: #6b7280; font-family: monospace;">${error.message || "Unknown error"}</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                Refresh Page
              </button>
              <button onclick="window.location.href = '/'" style="background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
                Go Home
              </button>
            </div>
            <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #9ca3af;">If this problem persists, please contact support.</p>
          </div>
        </div>
      `;
        }
    }
};
// Enhanced DOM ready detection
const startApplication = () => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeApp);
    }
    else {
        // DOM is already ready
        initializeApp();
    }
};
// Start the application
startApplication();
// Export for debugging and development
if (process.env.NODE_ENV === "development") {
    window.__ERROR_RECOVERY__ = errorRecovery;
    window.__APP_DEBUG__ = {
        errorRecovery,
        initializeApp,
        version: "2.0.0",
        buildTime: new Date().toISOString(),
    };
}
// Service worker registration for offline support
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
            console.log("✅ SW registered: ", registration);
        })
            .catch((registrationError) => {
            console.log("⚠️ SW registration failed: ", registrationError);
        });
    });
}
