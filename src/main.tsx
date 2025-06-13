import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast-provider";

// Simplified Tempo Devtools initialization
const initTempoDevtools = async () => {
  if (process.env.NODE_ENV === "production" && process.env.TEMPO !== "true") {
    return;
  }

  try {
    const tempoModule = await import("tempo-devtools");
    const TempoDevtools = tempoModule?.TempoDevtools || tempoModule?.default;
    if (TempoDevtools && typeof TempoDevtools.init === "function") {
      await TempoDevtools.init();
    }
  } catch (error) {
    console.warn("Tempo devtools initialization failed:", error.message);
  }
};

// Enhanced Error Boundary
class AppErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("🚨 Application Error:", error);
    console.error("📍 Error Info:", errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-2xl w-full">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application Error
              </h1>
              <p className="text-gray-600 mb-6">
                The Reyada Homecare Platform encountered an unexpected error.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

// PWA Installation and Service Worker Registration
const initializePWA = async () => {
  try {
    // Register service worker
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      console.log("✅ Service Worker registered successfully");

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Show update available notification
              console.log("🔄 New version available");
              if (confirm("A new version is available. Reload to update?")) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, data } = event.data;

        switch (type) {
          case "CACHE_UPDATED":
            console.log("📦 Cache updated:", data);
            break;
          case "SYNC_COMPLETED":
            console.log("🔄 Background sync completed:", data);
            break;
          case "SYNC_FAILED":
            console.error("❌ Background sync failed:", data);
            break;
        }
      });
    }

    // Handle PWA installation prompt
    let deferredPrompt: any;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show custom install button or banner
      const installBanner = document.createElement("div");
      installBanner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span>Install Reyada for better offline experience</span>
          <button id="install-btn" style="
            background: white;
            color: #3b82f6;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
          ">Install</button>
          <button id="dismiss-btn" style="
            background: transparent;
            color: white;
            border: none;
            padding: 8px;
            cursor: pointer;
            margin-left: 8px;
          ">✕</button>
        </div>
      `;

      document.body.appendChild(installBanner);

      document
        .getElementById("install-btn")
        ?.addEventListener("click", async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`PWA install outcome: ${outcome}`);
            deferredPrompt = null;
            installBanner.remove();
          }
        });

      document.getElementById("dismiss-btn")?.addEventListener("click", () => {
        installBanner.remove();
      });
    });

    // Handle successful installation
    window.addEventListener("appinstalled", () => {
      console.log("🎉 PWA installed successfully");
      deferredPrompt = null;
    });
  } catch (error) {
    console.error("❌ PWA initialization failed:", error);
  }
};

// Push Notifications Setup
const initializePushNotifications = async () => {
  try {
    if ("Notification" in window && "serviceWorker" in navigator) {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("✅ Push notifications enabled");

        // Register for push notifications
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications (would need VAPID keys in production)
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: null, // Would use VAPID public key in production
          });

          console.log("📱 Push subscription created");

          // Send subscription to server (would implement in production)
          // await fetch('/api/push/subscribe', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(subscription)
          // });
        } catch (subscriptionError) {
          console.warn("Push subscription failed:", subscriptionError);
        }
      } else {
        console.log("📱 Push notifications denied or not supported");
      }
    }
  } catch (error) {
    console.error("❌ Push notifications setup failed:", error);
  }
};

// Application initialization
const initializeApp = async () => {
  try {
    console.log("🚀 Starting Reyada Homecare Platform...");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔧 Tempo Mode:", process.env.TEMPO);

    // Initialize PWA features
    await initializePWA();

    // Initialize push notifications
    await initializePushNotifications();

    // Initialize Tempo devtools with error handling
    try {
      await initTempoDevtools();
    } catch (tempoError) {
      console.warn(
        "Tempo devtools failed to initialize, continuing without it:",
        tempoError,
      );
    }

    // Verify root element exists
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found in DOM");
    }

    console.log("📦 Creating React root...");
    const root = ReactDOM.createRoot(rootElement);

    console.log("🎨 Rendering application...");
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

    console.log("✅ Reyada Homecare Platform initialized successfully");
  } catch (error: any) {
    console.error("❌ Critical application initialization failure:", error);

    // Fallback error display
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          font-family: system-ui, -apple-system, sans-serif;
          background: #f9fafb;
          padding: 1rem;
        ">
          <div style="
            text-align: center; 
            padding: 2rem; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
          ">
            <h1 style="color: #111827; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 600;">
              Reyada Homecare Platform - Initialization Failed
            </h1>
            <p style="margin-bottom: 1.5rem; color: #6b7280; line-height: 1.5;">
              The platform encountered an error during startup. Please refresh the page or contact support.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 0.75rem 1.5rem; 
                border-radius: 8px; 
                cursor: pointer;
                font-weight: 500;
              "
            >
              Refresh Application
            </button>
            <div style="margin-top: 1.5rem; font-size: 0.875rem; color: #9ca3af;">
              Error: ${error.message}<br>
              Time: ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Global error handlers
window.addEventListener("error", (event) => {
  console.error("🚨 Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Unhandled promise rejection:", event.reason);
});
