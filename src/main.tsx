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

    // Initialize platform services with error handling
    try {
      const { initializePlatform } = await import(
        "@/utils/platform-initialization"
      );
      const result = await initializePlatform();

      if (result.success) {
        console.log("✅ Platform initialized successfully");
      } else {
        console.warn("⚠️ Platform initialized with warnings:", result.warnings);
      }
    } catch (importError) {
      console.warn(
        "⚠️ Platform initialization module not available:",
        importError,
      );
      // Continue without platform initialization
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
