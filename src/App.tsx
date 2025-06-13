import React, { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { realTimeSyncService } from "@/services/real-time-sync.service";
import { offlineService } from "@/services/offline.service";
import { emiratesIdVerificationService } from "@/services/emirates-id-verification.service";
import { communicationService } from "@/services/communication.service";
import websocketService from "@/services/websocket.service";
import { SecurityService } from "@/services/security.service";
import NotificationCenter from "@/components/ui/notification-center";

// Network Error Component
const NetworkErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setHasNetworkError(false);
      setIsRetrying(false);
    };

    const handleOffline = () => {
      setHasNetworkError(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setHasNetworkError(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (hasNetworkError) {
    return (
      <div className="min-h-screen bg-reyada-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-reyada-error/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-reyada-error"
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
            <h2 className="text-xl font-semibold text-reyada-neutral-900 mb-2">
              Network Error
            </h2>
            <p className="text-reyada-neutral-600 mb-6">
              Unable to connect to the server. Please check your internet
              connection and try again.
            </p>
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-reyada-primary hover:bg-reyada-primary-dark disabled:bg-reyada-primary/50 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isRetrying ? "Retrying..." : "Retry Connection"}
          </button>
          <p className="text-sm text-reyada-neutral-500 mt-4">
            Status: {navigator.onLine ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Simplified Tempo routes loading
let routes: any[] = [];
try {
  if (process.env.TEMPO === "true" || process.env.NODE_ENV === "development") {
    const tempoRoutes = require("tempo-routes");
    routes = Array.isArray(tempoRoutes?.default)
      ? tempoRoutes.default
      : Array.isArray(tempoRoutes)
        ? tempoRoutes
        : [];
  }
} catch (error) {
  console.warn("Failed to load tempo routes:", error.message);
  routes = [];
}

// Lazy load components
const Home = lazy(() => import("./components/home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Brand Loading Component
const BrandedLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-reyada-neutral-50 to-reyada-primary/10 flex items-center justify-center">
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div
          className="text-3xl font-bold text-reyada-primary animate-pulse font-arabic"
          style={{
            fontWeight: 700,
          }}
        >
          ريادة
        </div>
        <div className="w-px h-8 bg-reyada-neutral-300" />
        <div
          className="text-3xl font-bold text-reyada-primary animate-pulse font-english"
          style={{
            fontWeight: 600,
          }}
        >
          Reyada
        </div>
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-reyada-primary mx-auto mb-4"></div>
      <p className="text-reyada-neutral-600 font-medium font-english">
        Loading Homecare Platform...
      </p>
      <p className="text-xs text-reyada-neutral-500 mt-2 font-english">
        Reyada Home Health Care Services L.L.C.
      </p>
      <p className="text-xs text-reyada-neutral-400 mt-1 font-english">
        © 2024 All Rights Reserved
      </p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize all core services
    const initializeServices = async () => {
      try {
        // Initialize security service first
        const securityService = SecurityService.getInstance();
        await securityService.initialize();

        // Initialize offline service
        await offlineService.init();

        // Initialize real-time sync service
        await realTimeSyncService.connect();

        // Initialize WebSocket service for real-time notifications
        websocketService.connect();

        // Initialize communication service
        communicationService.setupUserNotificationChannels("current-user", [
          {
            type: "push",
            enabled: true,
            priority: "high",
            settings: {
              push: {
                deviceTokens: [],
                sound: true,
                vibration: true,
              },
            },
          },
          {
            type: "email",
            enabled: true,
            priority: "medium",
            settings: {
              email: {
                address: "user@example.com",
              },
            },
          },
        ]);

        console.log("All core services initialized successfully");
      } catch (error) {
        console.error("Failed to initialize services:", error);
      }
    };

    initializeServices();

    return () => {
      realTimeSyncService.disconnect();
      websocketService.disconnect();
    };
  }, []);

  return (
    <NetworkErrorBoundary>
      <div className="min-h-screen bg-reyada-neutral-50">
        <Suspense fallback={<BrandedLoadingFallback />}>
          {/* Tempo routes */}
          {(process.env.TEMPO === "true" ||
            process.env.NODE_ENV === "development") &&
            routes.length > 0 &&
            useRoutes(routes)}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Tempo route placeholder */}
            {(process.env.TEMPO === "true" ||
              process.env.NODE_ENV === "development") && (
              <Route path="/tempobook/*" element={<div>Tempo Route</div>} />
            )}

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster />

        {/* Real-time Notification Center */}
        <div className="fixed top-4 right-4 z-50">
          <NotificationCenter />
        </div>

        {/* Copyright Footer */}
        <footer className="fixed bottom-0 right-0 p-2 text-xs text-reyada-neutral-400 bg-white/80 backdrop-blur-sm rounded-tl-md">
          © 2024 Reyada Home Health Care Services L.L.C.
        </footer>
      </div>
    </NetworkErrorBoundary>
  );
}

export default App;
