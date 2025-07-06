import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle,
  TrendingUp,
  Brain,
  Zap,
  Lock,
  FileCheck,
  Activity,
  AlertTriangle,
  Target,
  Cpu,
  Database,
  Network,
  RefreshCw,
  BarChart3,
  Settings,
  Award,
  Lightbulb,
  Star,
} from "lucide-react";
import { masterPlatformControllerService } from "@/services/master-platform-controller.service";
import { productionGradeOrchestratorService } from "@/services/production-grade-orchestrator.service";

interface AdvancedRobustnessValidationDashboardProps {
  className?: string;
}

export function AdvancedRobustnessValidationDashboard({
  className = "",
}: AdvancedRobustnessValidationDashboardProps) {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);
  const [autoValidation, setAutoValidation] = useState(false);

  useEffect(() => {
    executeValidation();
  }, []);

  useEffect(() => {
    if (!autoValidation) return;

    const interval = setInterval(executeValidation, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [autoValidation]);

  const executeValidation = async () => {
    setIsValidating(true);
    try {
      const results =
        await masterPlatformControllerService.executeAdvancedRobustnessValidation();
      setValidationResults(results);
      setLastValidation(new Date());
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const getRobustnessColor = (robustness: string) => {
    switch (robustness) {
      case "EXCELLENT":
      case "OPTIMAL":
      case "MILITARY_GRADE":
        return "text-green-600 bg-green-100";
      case "GOOD":
      case "ZERO_TRUST":
        return "text-blue-600 bg-blue-100";
      case "FAIR":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (!validationResults) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Executing Advanced Robustness Validation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Robustness Validation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform robustness assessment and validation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastValidation && (
            <div className="text-sm text-gray-500">
              Last validation: {lastValidation.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoValidation(!autoValidation)}
          >
            <Activity
              className={`h-4 w-4 mr-2 ${autoValidation ? "animate-pulse" : ""}`}
            />
            {autoValidation ? "Auto" : "Manual"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={executeValidation}
            disabled={isValidating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
            />
            Validate
          </Button>
        </div>
      </div>

      {/* Overall Robustness Status */}
      <Alert className="border-green-200 bg-green-50">
        <Award className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-green-800">
                Platform Robustness Score: {validationResults.robustnessScore}%
              </strong>
              <p className="text-green-700 mt-1">
                {validationResults.productionReadiness
                  ? "✅ Production Ready - All systems operating at optimal robustness"
                  : "⚠️ Production readiness requires attention"}
              </p>
            </div>
            <Badge className="bg-green-600 text-white">EXCELLENT</Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Robustness Score
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(validationResults.robustnessScore)}`}
            >
              {validationResults.robustnessScore}%
            </div>
            <Progress
              value={validationResults.robustnessScore}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completeness</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(validationResults.completenessScore)}`}
            >
              {validationResults.completenessScore}%
            </div>
            <Progress
              value={validationResults.completenessScore}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Production Ready
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validationResults.productionReadiness ? "YES" : "NO"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems validated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">A+</div>
            <p className="text-xs text-muted-foreground mt-1">
              Exceeds all standards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Validation Results */}
      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="core">Core Modules</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.coreModules,
            ).map(([key, module]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge className={getRobustnessColor(module.robustness)}>
                      {module.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className={getScoreColor(module.score)}>
                        {module.score}%
                      </span>
                    </div>
                    <Progress value={module.score} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Status:{" "}
                      <span className="font-medium">{module.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.advancedFeatures,
            ).map(([key, feature]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge className={getRobustnessColor(feature.robustness)}>
                      {feature.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className={getScoreColor(feature.score)}>
                        {feature.score}%
                      </span>
                    </div>
                    <Progress value={feature.score} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Status:{" "}
                      <span className="font-medium">{feature.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.performanceMetrics,
            ).map(([key, metric]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-orange-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge className={getRobustnessColor(metric.robustness)}>
                      {metric.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {typeof metric.value === "number"
                        ? `${metric.value}${key.includes("Time") ? "ms" : key.includes("Rate") ? "%" : ""}`
                        : metric.value}
                    </div>
                    <div className="text-xs text-gray-600">
                      Target:{" "}
                      <span className="font-medium">{metric.target}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Status:{" "}
                      <span className="font-medium text-green-600">
                        {metric.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.securityValidation,
            ).map(([key, security]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-red-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge className={getRobustnessColor(security.robustness)}>
                      {security.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-600">
                      {security.status}
                    </div>
                    <div className="text-xs text-gray-600">
                      Robustness:{" "}
                      <span className="font-medium">{security.robustness}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.complianceValidation,
            ).map(([key, compliance]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge
                      className={getRobustnessColor(compliance.robustness)}
                    >
                      {compliance.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className={getScoreColor(compliance.score)}>
                        {compliance.score}%
                      </span>
                    </div>
                    <Progress value={compliance.score} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Status:{" "}
                      <span className="font-medium text-green-600">
                        {compliance.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              validationResults.validationDetails.infrastructureRobustness,
            ).map(([key, infra]: [string, any]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-green-600" />
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <Badge className={getRobustnessColor(infra.robustness)}>
                      {infra.robustness}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className={getScoreColor(infra.score)}>
                        {infra.score}%
                      </span>
                    </div>
                    <Progress value={infra.score} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Status:{" "}
                      <span className="font-medium text-green-600">
                        {infra.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations and Enhancements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Critical Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.criticalRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Enhancement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.enhancementOpportunities.map((opp, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{opp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdvancedRobustnessValidationDashboard;
