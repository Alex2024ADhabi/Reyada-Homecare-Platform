import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast-provider";
import { errorHandler } from "@/utils/comprehensive-error-handler";

// Initialize error handling
console.log("🛡️ Initializing comprehensive error handling...");

// Initialize Tempo Devtools with error handling
try {
  const { TempoDevtools } = await import("tempo-devtools");
  await TempoDevtools.init();
  console.log("✅ Tempo Devtools initialized");
} catch (error) {
  console.warn("⚠️ Tempo Devtools initialization failed:", error);
  errorHandler.handleError(
    error as Error,
    { component: "tempo-devtools", action: "initialization" },
    "medium",
  );
}

// Enhanced Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize Platform
async function initializePlatform() {
  try {
    console.log("🚀 Initializing Reyada Homecare Platform...");

    // Initialize production services
    try {
      console.log("🚀 Initializing production services...");

      // Initialize production WebSocket service
      const { productionWebSocketService } = await import(
        "@/services/production-websocket.service"
      );
      await productionWebSocketService.start();
      console.log("✅ Production WebSocket service started");

      // Initialize production Redis service
      const { productionRedisService } = await import(
        "@/services/production-redis.service"
      );
      console.log("✅ Production Redis service initialized");

      // Initialize healthcare error patterns service
      const { healthcareErrorPatternsService } = await import(
        "@/services/healthcare-error-patterns.service"
      );
      console.log("✅ Healthcare error patterns service initialized");

      // Initialize production notification service
      const { productionNotificationService } = await import(
        "@/services/production-notification.service"
      );
      console.log("✅ Production notification service initialized");

      // Initialize end-to-end automated testing service
      const { endToEndAutomatedTestingService } = await import(
        "@/services/end-to-end-automated-testing.service"
      );
      console.log("✅ End-to-end automated testing service initialized");

      // Initialize performance regression testing service
      const { performanceRegressionTestingService } = await import(
        "@/services/performance-regression-testing.service"
      );
      console.log("✅ Performance regression testing service initialized");

      // Initialize offline queue management
      const { offlineQueueService } = await import(
        "@/services/offline-queue-management.service"
      );
      await offlineQueueService.initialize();
      console.log("✅ Offline queue management service initialized");

      // Initialize real-time sync conflict resolution service
      const { realTimeSyncConflictResolutionService } = await import(
        "@/services/real-time-sync-conflict-resolution.service"
      );
      console.log("✅ Real-time sync conflict resolution service initialized");

      // Initialize patient safety error escalation service
      const { patientSafetyErrorEscalationService } = await import(
        "@/services/patient-safety-error-escalation.service"
      );
      console.log("✅ Patient safety error escalation service initialized");

      // Initialize DOH compliance error reporting service
      const { dohComplianceErrorReportingService } = await import(
        "@/services/doh-compliance-error-reporting.service"
      );
      console.log("✅ DOH compliance error reporting service initialized");

      // Initialize security penetration testing service
      const { securityPenetrationTestingService } = await import(
        "@/services/security-penetration-testing.service"
      );
      await securityPenetrationTestingService.initialize();
      console.log("✅ Security penetration testing service initialized");

      // Initialize intelligent cache invalidation service
      const { intelligentCacheInvalidationService } = await import(
        "@/services/intelligent-cache-invalidation.service"
      );
      console.log("✅ Intelligent cache invalidation service initialized");

      // Initialize multi-level caching service
      const { multiLevelCachingService } = await import(
        "@/services/multi-level-caching.service"
      );
      console.log("✅ Multi-level caching service initialized");

      console.log(
        "✅ All Phase 1 Core Infrastructure services initialized successfully",
      );
      console.log("🎯 Phase 1: Core Infrastructure Implementation - COMPLETED");
    } catch (error) {
      console.error("❌ Failed to initialize production services:", error);
      // Continue with fallback services
    }
  } catch (error) {
    console.error("❌ Platform initialization failed:", error);
  }
}

// Start the application
const startApp = async () => {
  try {
    // Initialize platform first
    await initializePlatform();

    // Render the app
    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement,
    );

    root.render(
      <React.StrictMode>
        <AppErrorBoundary>
          <BrowserRouter>
            <ToastProvider>
              <App />
            </ToastProvider>
          </BrowserRouter>
        </AppErrorBoundary>
      </React.StrictMode>,
    );

    console.log("✅ Application started successfully");
  } catch (error) {
    console.error("❌ Failed to start application:", error);

    // Fallback rendering
    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement,
    );

    root.render(
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Application Failed to Start
          </h1>
          <p className="text-gray-600 mb-4">
            Please check the console for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>,
    );
  }
};

// Start the application
startApp();
