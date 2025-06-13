import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
// Network Error Component
const NetworkErrorBoundary = ({ children }) => {
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
        // Check initial network status
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
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Network Error" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Unable to connect to the server. Please check your internet connection and try again." })] }), _jsx("button", { onClick: handleRetry, disabled: isRetrying, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors", children: isRetrying ? "Retrying..." : "Retry Connection" }), _jsxs("p", { className: "text-sm text-gray-500 mt-4", children: ["Status: ", navigator.onLine ? "Online" : "Offline"] })] }) }));
    }
    return _jsx(_Fragment, { children: children });
};
// Enhanced Tempo routes loading with robust error handling
let routes = [];
if (process.env.TEMPO === "true" || process.env.NODE_ENV === "development") {
    try {
        // Enhanced tempo routes loading with multiple fallback strategies
        let tempoRoutes;
        const loadStrategies = [
            // Strategy 1: Direct require
            () => require("tempo-routes"),
            // Strategy 2: Dynamic import fallback
            () => import("tempo-routes").then((m) => m.default || m),
            // Strategy 3: Local routes file
            () => require("./tempobook/routes.js"),
            // Strategy 4: Absolute path fallback
            () => require("@/tempobook/routes.js"),
        ];
        let loadSuccess = false;
        for (const strategy of loadStrategies) {
            try {
                tempoRoutes = strategy();
                if (tempoRoutes) {
                    loadSuccess = true;
                    console.log("✅ Tempo routes loaded successfully");
                    break;
                }
            }
            catch (strategyError) {
                console.warn("Tempo route strategy failed:", strategyError.message);
                continue;
            }
        }
        if (!loadSuccess) {
            console.warn("All tempo route strategies failed, using empty routes");
            tempoRoutes = { default: [] };
        }
        // Enhanced route validation
        routes = tempoRoutes?.default || tempoRoutes || [];
        // Ensure routes is always an array with validation
        if (!Array.isArray(routes)) {
            console.warn("Tempo routes is not an array, converting to array");
            routes = routes ? [routes] : [];
        }
        // Validate route structure
        routes = routes.filter((route) => {
            if (!route || typeof route !== "object") {
                console.warn("Invalid route object filtered out:", route);
                return false;
            }
            return true;
        });
        console.log(`✅ Tempo routes validated: ${routes.length} routes`);
    }
    catch (e) {
        console.error("Critical tempo routes loading error:", e?.message || "Unknown error");
        routes = [];
    }
}
// Lazy load components for better performance and code splitting
const Home = lazy(() => import("./components/home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
// Lazy load other major components
const PatientManagement = lazy(() => import("./components/patient/PatientManagement"));
const ClinicalDocumentation = lazy(() => import("./components/clinical/ClinicalDocumentation"));
function App() {
    const LoadingFallback = () => (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }));
    return (_jsx(NetworkErrorBoundary, { children: _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs(Suspense, { fallback: _jsx(LoadingFallback, {}), children: [(process.env.TEMPO === "true" ||
                            process.env.NODE_ENV === "development") &&
                            useRoutes(routes), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/patients", element: _jsx(PatientManagement, {}) }), _jsx(Route, { path: "/clinical", element: _jsx(ClinicalDocumentation, {}) }), (process.env.TEMPO === "true" ||
                                    process.env.NODE_ENV === "development") && (_jsx(Route, { path: "/tempobook/*" })), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }), _jsx(Toaster, {})] }) }));
}
export default App;
