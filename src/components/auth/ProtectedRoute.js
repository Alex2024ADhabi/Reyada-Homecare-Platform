import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { LoadingCard } from "@/components/ui/loading-states";
const ProtectedRoute = ({ children, requiredRole, requiredPermission, fallbackPath = "/login", }) => {
    const { user, userProfile, loading, isRole, hasPermission } = useSupabaseAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx(LoadingCard, { title: "Authenticating...", description: "Please wait while we verify your credentials" }));
    }
    if (!user) {
        // Redirect to login with return path
        return _jsx(Navigate, { to: fallbackPath, state: { from: location }, replace: true });
    }
    if (requiredRole && !isRole(requiredRole)) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Access Denied" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["You don't have the required role (", requiredRole, ") to access this page."] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Your current role: ", userProfile?.role || "Unknown"] })] }) }));
    }
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Insufficient Permissions" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["You don't have the required permission (", requiredPermission, ") to access this page."] }), _jsx("p", { className: "text-sm text-gray-500", children: "Please contact your administrator for access." })] }) }));
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
