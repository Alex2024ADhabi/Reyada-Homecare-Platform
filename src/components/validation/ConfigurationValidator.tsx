import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Settings,
  Shield,
  Zap,
  Target,
  Wrench,
  AlertCircle,
  TrendingUp,
  Clock,
  FileCheck,
  Database,
  Network,
} from "lucide-react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useToast } from "@/hooks/useToast";

interface ConfigurationIssue {
  severity: "info" | "warning" | "error" | "critical";
  category: "validation" | "performance" | "security" | "compliance";
  message: string;
  field: string;
  recommendation: string;
  autoFixAvailable: boolean;
}

interface ConfigurationHealth {
  status: "healthy" | "degraded" | "critical";
  score: number;
  issues: ConfigurationIssue[];
  lastValidated: string;
  validationDuration: number;
}

const ConfigurationValidator: React.FC = () => {
  const { toast } = useToast();
  const {
    isInitialized,
    isLoading,
    error,
    config,
    environment,
    refresh,
    validateConfiguration,
  } = useConfiguration();

  const [validationResults, setValidationResults] =
    useState<ConfigurationHealth | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [autoFixInProgress, setAutoFixInProgress] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      // Simulate comprehensive configuration validation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResults: ConfigurationHealth = {
        status: "healthy",
        score: 92,
        issues: [
          {
            severity: "warning",
            category: "performance",
            message: "API response time threshold could be optimized",
            field: "EMR_MONITORING_CONFIG.alertThresholds.responseTime",
            recommendation:
              "Reduce response time threshold to under 800ms for better performance",
            autoFixAvailable: true,
          },
          {
            severity: "info",
            category: "security",
            message: "Consider enabling additional security features",
            field: "SECURITY_CONFIG.zeroTrust.enabled",
            recommendation:
              "Enable zero-trust architecture for enhanced security",
            autoFixAvailable: true,
          },
          {
            severity: "error",
            category: "compliance",
            message: "DOH compliance score below optimal threshold",
            field: "EMR_MONITORING_CONFIG.alertThresholds.complianceScore",
            recommendation:
              "Increase compliance score threshold to 95% for excellence",
            autoFixAvailable: true,
          },
        ],
        lastValidated: new Date().toISOString(),
        validationDuration: 2000,
      };

      setValidationResults(mockResults);

      toast({
        title: "Configuration Validation Complete",
        description: `Health Score: ${mockResults.score}% - ${mockResults.issues.length} issues found`,
        variant: mockResults.status === "healthy" ? "success" : "warning",
      });
    } catch (err) {
      toast({
        title: "Validation Failed",
        description: "Failed to validate configuration",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const handleAutoFix = async (issue: ConfigurationIssue) => {
    if (!issue.autoFixAvailable) return;

    setAutoFixInProgress((prev) => new Set(prev).add(issue.field));

    try {
      // Simulate auto-fix process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Remove the fixed issue from results
      setValidationResults((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          issues: prev.issues.filter((i) => i.field !== issue.field),
          score: Math.min(100, prev.score + 5),
        };
      });

      toast({
        title: "Auto-Fix Applied",
        description: `Fixed: ${issue.message}`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Auto-Fix Failed",
        description: `Failed to fix: ${issue.field}`,
        variant: "destructive",
      });
    } finally {
      setAutoFixInProgress((prev) => {
        const newSet = new Set(prev);
        newSet.delete(issue.field);
        return newSet;
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "error":
        return "bg-orange-100 text-orange-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance":
        return <Zap className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "compliance":
        return <FileCheck className="h-4 w-4" />;
      case "validation":
        return <Settings className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredIssues =
    validationResults?.issues.filter(
      (issue) =>
        selectedCategory === "all" || issue.category === selectedCategory,
    ) || [];

  const categoryStats =
    validationResults?.issues.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  useEffect(() => {
    if (isInitialized && !validationResults) {
      runValidation();
    }
  }, [isInitialized, validationResults, runValidation]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">
          Initializing configuration validator...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Configuration Validator
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive validation and optimization of platform configuration
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>
              Environment: <Badge variant="outline">{environment}</Badge>
            </span>
            {validationResults && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last validated:{" "}
                {new Date(validationResults.lastValidated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={runValidation}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
            {isValidating ? "Validating..." : "Run Validation"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validationResults && (
        <>
          {/* Health Score Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Configuration Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`text-4xl font-bold ${getHealthColor(validationResults.status)}`}
                  >
                    {validationResults.score}%
                  </div>
                  <div>
                    <Badge
                      className={getSeverityColor(validationResults.status)}
                    >
                      {validationResults.status.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {validationResults.issues.length} issues detected
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">
                    Issue Distribution
                  </div>
                  <div className="flex gap-4">
                    {Object.entries(categoryStats).map(([category, count]) => (
                      <div key={category} className="text-center">
                        <div className="text-lg font-semibold">{count}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Progress value={validationResults.score} className="h-3" />
            </CardContent>
          </Card>

          {/* Issues and Recommendations */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All Issues ({validationResults.issues.length})
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="h-4 w-4 mr-1" />
                Performance ({categoryStats.performance || 0})
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-1" />
                Security ({categoryStats.security || 0})
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <FileCheck className="h-4 w-4 mr-1" />
                Compliance ({categoryStats.compliance || 0})
              </TabsTrigger>
              <TabsTrigger value="validation">
                <Settings className="h-4 w-4 mr-1" />
                Validation ({categoryStats.validation || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Issues & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>No issues found in this category</p>
                        <p className="text-sm mt-2">
                          Configuration is optimized for this area
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredIssues.map((issue, index) => (
                          <div
                            key={`${issue.field}-${index}`}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(issue.category)}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      className={getSeverityColor(
                                        issue.severity,
                                      )}
                                    >
                                      {issue.severity.toUpperCase()}
                                    </Badge>
                                    <span className="font-medium">
                                      {issue.message}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Field:{" "}
                                    <code className="bg-gray-100 px-1 rounded">
                                      {issue.field}
                                    </code>
                                  </div>
                                </div>
                              </div>
                              {issue.autoFixAvailable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAutoFix(issue)}
                                  disabled={autoFixInProgress.has(issue.field)}
                                  className="flex items-center gap-1"
                                >
                                  {autoFixInProgress.has(issue.field) ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Wrench className="h-3 w-3" />
                                  )}
                                  {autoFixInProgress.has(issue.field)
                                    ? "Fixing..."
                                    : "Auto Fix"}
                                </Button>
                              )}
                            </div>
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="text-sm font-medium text-blue-800 mb-1">
                                Recommendation:
                              </div>
                              <div className="text-sm text-blue-700">
                                {issue.recommendation}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ConfigurationValidator;
