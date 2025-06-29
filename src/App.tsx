import React from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast-provider";
import { initializePlatform } from "@/utils/platform-initialization";
import { useToast } from "@/components/ui/toast-provider";

// Import pages with error handling
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").catch(() => ({
    default: () => (
      <div className="p-8 text-center">Dashboard component failed to load</div>
    ),
  })),
);

const PatientPortal = React.lazy(() =>
  import("./pages/PatientPortal").catch(() => ({
    default: () => (
      <div className="p-8 text-center">
        Patient Portal component failed to load
      </div>
    ),
  })),
);

// Safe tempo routes import - moved to component level to avoid top-level await
const loadTempoRoutes = async () => {
  try {
    const routesModule = await import("tempo-routes");
    return Array.isArray(routesModule.default) ? routesModule.default : [];
  } catch (error) {
    console.warn("⚠️ Tempo routes failed to load:", error);
    return [];
  }
};

// Fallback components for missing pages
const FallbackDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Reyada Homecare Platform
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to the Reyada Homecare Platform. The system is initializing...
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Patient Management</h3>
            <p className="text-blue-700 text-sm">
              Manage patient records and care plans
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">
              Clinical Documentation
            </h3>
            <p className="text-green-700 text-sm">
              Electronic health records and assessments
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900">AI Analytics</h3>
            <p className="text-purple-700 text-sm">
              Intelligent insights and predictions
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FallbackPatientPortal = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Portal</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Access</h2>
        <p className="text-gray-600">
          Secure patient portal for accessing health information and services.
        </p>
      </div>
    </div>
  </div>
);

// Main App Component with Platform Initialization
function AppContent() {
  const [tempoRoutes, setTempoRoutes] = React.useState<any[]>([]);
  const [routesLoaded, setRoutesLoaded] = React.useState(false);
  const [platformInitialized, setPlatformInitialized] = React.useState(false);
  const { success, error, warning } = useToast();

  // Initialize platform and routes
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize platform first
        console.log("🚀 Starting platform initialization...");
        const initResult = await initializePlatform();

        if (initResult.success) {
          success("Platform Initialized", "Reyada Homecare Platform is ready");
        } else {
          error("Platform Issues", `${initResult.errors.length} errors found`);
        }

        if (initResult.warnings.length > 0) {
          warning(
            "Platform Warnings",
            `${initResult.warnings.length} warnings`,
          );
        }

        setPlatformInitialized(true);

        // Load tempo routes
        const routes = await loadTempoRoutes();
        if (
          import.meta.env.VITE_TEMPO &&
          Array.isArray(routes) &&
          routes.length > 0
        ) {
          setTempoRoutes(routes);
        }
      } catch (error) {
        console.error("❌ App initialization failed:", error);
        error("Initialization Failed", "Failed to initialize the platform");
      } finally {
        setRoutesLoaded(true);
      }
    };

    initializeApp();
  }, [success, error, warning]);

  // Render tempo routes using useRoutes hook
  const tempoRoutesElement = useRoutes(
    import.meta.env.VITE_TEMPO && tempoRoutes.length > 0 ? tempoRoutes : [],
  );

  // Show loading state during initialization
  if (!routesLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing Reyada Homecare Platform
          </h2>
          <p className="text-gray-600">
            {platformInitialized
              ? "Loading application..."
              : "Starting services..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tempo routes for storyboards */}
      {tempoRoutesElement}

      {/* Main application routes */}
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<FallbackDashboard />}>
              <Dashboard />
            </React.Suspense>
          }
        />
        <Route
          path="/patient-portal"
          element={
            <React.Suspense fallback={<FallbackPatientPortal />}>
              <PatientPortal />
            </React.Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <React.Suspense fallback={<FallbackDashboard />}>
              <Dashboard />
            </React.Suspense>
          }
        />
        {/* Fallback route */}
        <Route path="*" element={<FallbackDashboard />} />
      </Routes>
    </div>
  );
}

// Main App wrapper with providers
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
