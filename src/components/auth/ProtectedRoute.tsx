import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { LoadingCard } from "@/components/ui/loading-states";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = "/login",
}) => {
  const { user, userProfile, loading, isRole, hasPermission, validateSession } =
    useSupabaseAuth();
  const location = useLocation();
  const [sessionValid, setSessionValid] = React.useState<boolean | null>(null);
  const [securityCheck, setSecurityCheck] = React.useState<boolean>(false);

  // Enhanced session validation on route access
  React.useEffect(() => {
    const performSecurityChecks = async () => {
      if (user && userProfile) {
        try {
          // Validate session integrity
          const isValid = await validateSession();
          setSessionValid(isValid);

          // Additional security checks
          const securityPassed = await performAdditionalSecurityChecks();
          setSecurityCheck(securityPassed);
        } catch (error) {
          console.error("Security validation failed:", error);
          setSessionValid(false);
          setSecurityCheck(false);
        }
      }
    };

    performSecurityChecks();
  }, [user, userProfile, validateSession, location.pathname]);

  // Perform additional security checks
  const performAdditionalSecurityChecks = async (): Promise<boolean> => {
    try {
      // Check for session hijacking indicators
      const storedFingerprint = localStorage.getItem("device_fingerprint");
      const currentFingerprint = await generateDeviceFingerprint();

      if (storedFingerprint && storedFingerprint !== currentFingerprint) {
        console.warn("Device fingerprint mismatch detected");
        return false;
      }

      // Check for concurrent session violations
      const sessionCount = parseInt(
        localStorage.getItem("active_session_count") || "0",
      );
      if (sessionCount > 3) {
        // Max concurrent sessions
        console.warn("Too many concurrent sessions");
        return false;
      }

      // Check for time-based access violations
      const lastActivity = localStorage.getItem("last_activity_timestamp");
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > 1800000) {
          // 30 minutes
          console.warn("Session timeout due to inactivity");
          return false;
        }
      }

      // Update last activity
      localStorage.setItem("last_activity_timestamp", Date.now().toString());

      return true;
    } catch (error) {
      console.error("Additional security checks failed:", error);
      return false;
    }
  };

  // Generate device fingerprint for security
  const generateDeviceFingerprint = async (): Promise<string> => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
    };
    return btoa(JSON.stringify(fingerprint)).substring(0, 32);
  };

  if (loading || sessionValid === null) {
    return (
      <LoadingCard
        title="Authenticating..."
        description="Please wait while we verify your credentials and perform security checks"
      />
    );
  }

  // Enhanced authentication check
  if (!user || !sessionValid || !securityCheck) {
    // Log security violation
    console.warn("Access denied due to authentication or security failure", {
      hasUser: !!user,
      sessionValid,
      securityCheck,
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });

    // Clear potentially compromised session
    localStorage.removeItem("auth_session");
    localStorage.removeItem("device_fingerprint");

    // Redirect to login with return path
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Enhanced role validation
  if (requiredRole && !isRole(requiredRole)) {
    // Log unauthorized access attempt
    console.warn("Unauthorized access attempt", {
      userId: user.id,
      userRole: userProfile?.role,
      requiredRole,
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have the required role ({requiredRole}) to access this
            page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: {userProfile?.role || "Unknown"}
          </p>
          <p className="text-xs text-gray-400">
            This incident has been logged for security purposes.
          </p>
        </div>
      </div>
    );
  }

  // Enhanced permission validation
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Log unauthorized access attempt
    console.warn("Insufficient permissions for access", {
      userId: user.id,
      userRole: userProfile?.role,
      requiredPermission,
      userPermissions: userProfile?.permissions,
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Insufficient Permissions
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permission ({requiredPermission}) to
            access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please contact your administrator for access.
          </p>
          <p className="text-xs text-gray-400">
            This incident has been logged for security purposes.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
