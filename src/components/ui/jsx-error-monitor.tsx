import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Code,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import { jsxErrorHandler } from "@/services/jsx-error-handler.service";

interface JSXErrorMonitorProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
}

export const JSXErrorMonitor: React.FC<JSXErrorMonitorProps> = ({
  className = "",
  showDetails = true,
  autoRefresh = true,
}) => {
  const [healthReport, setHealthReport] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const report = jsxErrorHandler.generateHealthReport();
      const stats = jsxErrorHandler.getErrorStats();
      const errors = jsxErrorHandler.getRecentErrors(5);

      setHealthReport(report);
      setErrorStats(stats);
      setRecentErrors(errors);
    } catch (error) {
      console.error("Failed to refresh JSX error data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!healthReport || !errorStats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading JSX health data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Health Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(healthReport.status)}
              <CardTitle>JSX Health Monitor</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(healthReport.status)}>
                {healthReport.status.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time monitoring of JSX parsing and component health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Score */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Health Score</span>
              <span className="font-medium">{healthReport.score}/100</span>
            </div>
            <Progress
              value={healthReport.score}
              className={`h-3 ${healthReport.score >= 80 ? "bg-green-100" : healthReport.score >= 60 ? "bg-yellow-100" : "bg-red-100"}`}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {errorStats.totalErrors}
              </div>
              <div className="text-sm text-gray-600">Total Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {errorStats.recentErrors}
              </div>
              <div className="text-sm text-gray-600">Recent (1h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {errorStats.fixedErrors}
              </div>
              <div className="text-sm text-gray-600">Fixed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(errorStats.commonErrors).length}
              </div>
              <div className="text-sm text-gray-600">Error Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Issues and Recommendations */}
          {(healthReport.issues.length > 0 ||
            healthReport.recommendations.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Issues */}
              {healthReport.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Current Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {healthReport.issues.map(
                        (issue: string, index: number) => (
                          <Alert key={index} variant="destructive">
                            <AlertDescription>{issue}</AlertDescription>
                          </Alert>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {healthReport.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {healthReport.recommendations.map(
                        (rec: string, index: number) => (
                          <Alert key={index}>
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Common Error Types */}
          {Object.keys(errorStats.commonErrors).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Error Distribution
                </CardTitle>
                <CardDescription>Most common JSX error types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(errorStats.commonErrors)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([errorType, count]) => (
                      <div
                        key={errorType}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {errorType}
                          </span>
                        </div>
                        <Badge variant="outline">{count} occurrences</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Errors
                </CardTitle>
                <CardDescription>Latest JSX parsing issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentErrors.map((error, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-600">
                            {error.error}
                          </div>
                          {error.component && (
                            <div className="text-xs text-gray-500 mt-1">
                              Component: {error.component}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {error.fixed && (
                            <Badge className="text-green-600 bg-green-100">
                              Fixed
                            </Badge>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default JSXErrorMonitor;
