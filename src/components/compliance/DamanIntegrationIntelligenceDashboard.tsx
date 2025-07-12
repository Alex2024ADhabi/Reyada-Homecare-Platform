import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";

interface SystemHealth {
  systemId: string;
  systemName: string;
  status: "healthy" | "degraded" | "critical" | "offline";
  responseTime: number;
  uptime: number;
  errorRate: number;
  lastHealthCheck: string;
  complianceScore?: number;
}

interface IntegrationMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "excellent" | "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  target?: number;
}

interface PredictedIssue {
  id: string;
  systemId: string;
  type:
    | "performance_degradation"
    | "capacity_limit"
    | "integration_failure"
    | "security_risk";
  severity: "low" | "medium" | "high" | "critical";
  probability: number;
  timeToOccurrence: number;
  description: string;
  preventiveActions: string[];
}

interface OptimizationOpportunity {
  id: string;
  systemId: string;
  type: "performance" | "cost" | "reliability" | "scalability";
  description: string;
  expectedBenefit: string;
  implementationEffort: "low" | "medium" | "high";
  estimatedROI: number;
}

const DamanIntegrationIntelligenceDashboard: React.FC = () => {
  const [systemsHealth, setSystemsHealth] = useState<SystemHealth[]>([]);
  const [integrationMetrics, setIntegrationMetrics] = useState<
    IntegrationMetric[]
  >([]);
  const [predictedIssues, setPredictedIssues] = useState<PredictedIssue[]>([]);
  const [optimizationOpportunities, setOptimizationOpportunities] = useState<
    OptimizationOpportunity[]
  >([]);
  const [overallHealthScore, setOverallHealthScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadIntegrationData();
    const interval = setInterval(loadIntegrationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIntegrationData = async () => {
    try {
      setLoading(true);

      // Mock data with proper sanitization
      const mockSystemsHealth: SystemHealth[] = [
        {
          systemId: "daman",
          systemName: "Daman Authorization API",
          status: "healthy",
          responseTime: 245,
          uptime: 99.8,
          errorRate: 1.2,
          lastHealthCheck: new Date().toISOString(),
          complianceScore: 94.2,
        },
        {
          systemId: "openjet",
          systemName: "OpenJet Provider Portal",
          status: "healthy",
          responseTime: 180,
          uptime: 99.9,
          errorRate: 0.5,
          lastHealthCheck: new Date().toISOString(),
          complianceScore: 96.8,
        },
        {
          systemId: "malaffi",
          systemName: "Malaffi EMR Integration",
          status: "degraded",
          responseTime: 680,
          uptime: 98.5,
          errorRate: 3.2,
          lastHealthCheck: new Date().toISOString(),
          complianceScore: 89.3,
        },
        {
          systemId: "doh",
          systemName: "DOH Compliance System",
          status: "healthy",
          responseTime: 320,
          uptime: 99.5,
          errorRate: 1.8,
          lastHealthCheck: new Date().toISOString(),
          complianceScore: 92.1,
        },
      ];

      const mockIntegrationMetrics: IntegrationMetric[] = [
        {
          id: "total_requests",
          name: "Total API Requests",
          value: 12847,
          unit: "requests",
          status: "excellent",
          trend: "up",
        },
        {
          id: "success_rate",
          name: "Success Rate",
          value: 96.2,
          unit: "%",
          status: "good",
          trend: "stable",
          target: 95,
        },
        {
          id: "avg_response_time",
          name: "Average Response Time",
          value: 285,
          unit: "ms",
          status: "good",
          trend: "down",
          target: 300,
        },
        {
          id: "throughput",
          name: "Throughput",
          value: 145.8,
          unit: "req/min",
          status: "excellent",
          trend: "up",
        },
      ];

      const mockPredictedIssues: PredictedIssue[] = [
        {
          id: "1",
          systemId: "malaffi",
          type: "performance_degradation",
          severity: "medium",
          probability: 0.75,
          timeToOccurrence: 4,
          description:
            "Response time trending upward, potential performance degradation expected",
          preventiveActions: [
            "Scale resources",
            "Optimize database queries",
            "Review system load",
          ],
        },
        {
          id: "2",
          systemId: "daman",
          type: "capacity_limit",
          severity: "low",
          probability: 0.35,
          timeToOccurrence: 12,
          description: "API rate limits may be reached during peak hours",
          preventiveActions: [
            "Request rate limit increase",
            "Implement request queuing",
            "Load balancing",
          ],
        },
      ];

      const mockOptimizationOpportunities: OptimizationOpportunity[] = [
        {
          id: "1",
          systemId: "daman",
          type: "performance",
          description:
            "Implement response caching for frequently accessed authorization data",
          expectedBenefit: "25% reduction in response time",
          implementationEffort: "medium",
          estimatedROI: 2.8,
        },
        {
          id: "2",
          systemId: "openjet",
          type: "cost",
          description:
            "Optimize API call patterns to reduce unnecessary requests",
          expectedBenefit: "15% cost reduction",
          implementationEffort: "low",
          estimatedROI: 3.2,
        },
      ];

      // Sanitize data
      const sanitizedSystems = mockSystemsHealth.map((system) => ({
        ...system,
        systemName: inputSanitizer.sanitizeText(system.systemName, 100)
          .sanitized,
        lastHealthCheck: inputSanitizer.sanitizeText(system.lastHealthCheck, 50)
          .sanitized,
      }));

      const sanitizedMetrics = mockIntegrationMetrics.map((metric) => ({
        ...metric,
        name: inputSanitizer.sanitizeText(metric.name, 100).sanitized,
        unit: inputSanitizer.sanitizeText(metric.unit, 20).sanitized,
      }));

      const sanitizedIssues = mockPredictedIssues.map((issue) => ({
        ...issue,
        description: inputSanitizer.sanitizeText(issue.description, 500)
          .sanitized,
        preventiveActions: issue.preventiveActions.map(
          (action) => inputSanitizer.sanitizeText(action, 200).sanitized,
        ),
      }));

      const sanitizedOpportunities = mockOptimizationOpportunities.map(
        (opp) => ({
          ...opp,
          description: inputSanitizer.sanitizeText(opp.description, 500)
            .sanitized,
          expectedBenefit: inputSanitizer.sanitizeText(opp.expectedBenefit, 200)
            .sanitized,
        }),
      );

      setSystemsHealth(sanitizedSystems);
      setIntegrationMetrics(sanitizedMetrics);
      setPredictedIssues(sanitizedIssues);
      setOptimizationOpportunities(sanitizedOpportunities);

      // Calculate overall health score
      const avgHealth =
        sanitizedSystems.reduce((sum, system) => {
          let score = 100;
          if (system.status === "degraded") score = 75;
          else if (system.status === "critical") score = 50;
          else if (system.status === "offline") score = 0;
          return sum + score;
        }, 0) / sanitizedSystems.length;

      setOverallHealthScore(Math.round(avgHealth));
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error loading integration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "offline":
        return <WifiOff className="h-5 w-5 text-gray-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      case "offline":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const generateIntelligenceReport = async () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        overallHealthScore,
        systemsHealth,
        integrationMetrics,
        predictedIssues: predictedIssues.filter(
          (issue) => issue.severity === "high" || issue.severity === "critical",
        ),
        optimizationOpportunities: optimizationOpportunities.filter(
          (opp) => opp.estimatedROI > 2,
        ),
        summary: {
          totalSystems: systemsHealth.length,
          healthySystems: systemsHealth.filter((s) => s.status === "healthy")
            .length,
          criticalIssues: predictedIssues.filter(
            (i) => i.severity === "critical",
          ).length,
          highROIOpportunities: optimizationOpportunities.filter(
            (o) => o.estimatedROI > 3,
          ).length,
        },
      };

      const jsonString = JsonValidator.safeStringify(reportData, 2);
      const validation = JsonValidator.validate(jsonString);

      if (!validation.isValid) {
        throw new Error(
          `Report generation failed: ${validation.errors?.join(", ")}`,
        );
      }

      console.log("Integration intelligence report generated:", reportData);
    } catch (error) {
      console.error("Error generating intelligence report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading integration intelligence...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Integration Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights for Daman and OpenJet integrations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={loadIntegrationData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateIntelligenceReport}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Overall Integration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-blue-600">
              {overallHealthScore}%
            </div>
            <div className="flex-1">
              <Progress value={overallHealthScore} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0%</span>
                <span>Target: 95%</span>
                <span>100%</span>
              </div>
            </div>
            <Badge
              variant={
                overallHealthScore >= 95
                  ? "default"
                  : overallHealthScore >= 85
                    ? "secondary"
                    : "destructive"
              }
            >
              {overallHealthScore >= 95
                ? "Excellent"
                : overallHealthScore >= 85
                  ? "Good"
                  : "Needs Attention"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {predictedIssues.filter(
        (issue) => issue.severity === "critical" || issue.severity === "high",
      ).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Predicted Issues Detected</AlertTitle>
          <AlertDescription>
            {
              predictedIssues.filter(
                (issue) =>
                  issue.severity === "critical" || issue.severity === "high",
              ).length
            }{" "}
            high-priority issues predicted. Review the Intelligence tab for
            details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">System Health</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemsHealth.map((system) => (
              <Card key={system.systemId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(system.status)}
                      <span className="ml-2">{system.systemName}</span>
                    </div>
                    <Badge className={getStatusColor(system.status)}>
                      {system.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Response Time</div>
                        <div className="font-semibold">
                          {system.responseTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Uptime</div>
                        <div className="font-semibold">{system.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Error Rate</div>
                        <div className="font-semibold">{system.errorRate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Compliance</div>
                        <div className="font-semibold">
                          {system.complianceScore}%
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last check:{" "}
                      {new Date(system.lastHealthCheck).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {metric.unit}
                      </span>
                    </div>
                    {metric.target && (
                      <Progress
                        value={(metric.value / metric.target) * 100}
                        className="h-2"
                      />
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <Badge
                        variant={
                          metric.status === "excellent"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {metric.status}
                      </Badge>
                      <div className="flex items-center">
                        {metric.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        {metric.trend === "down" && (
                          <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                        )}
                        {metric.trend === "stable" && (
                          <Activity className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Predicted Issues
                </CardTitle>
                <CardDescription>
                  AI-powered predictions of potential system issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {predictedIssues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {issue.probability * 100}% probability
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {issue.description}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Expected in {issue.timeToOccurrence} hours | System:{" "}
                          {issue.systemId}
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-gray-700 mb-1">
                            Preventive Actions:
                          </div>
                          <ul className="list-disc list-inside text-gray-600">
                            {issue.preventiveActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Optimization Opportunities
                </CardTitle>
                <CardDescription>
                  Identified opportunities for system improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {optimizationOpportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{opportunity.type}</Badge>
                          <span className="text-xs font-medium text-green-600">
                            ROI: {opportunity.estimatedROI}x
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {opportunity.description}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          Expected benefit: {opportunity.expectedBenefit}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            System: {opportunity.systemId}
                          </span>
                          <Badge
                            variant={
                              opportunity.implementationEffort === "low"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {opportunity.implementationEffort} effort
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time Improvement</span>
                    <span className="font-bold text-green-600">-25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Throughput Increase</span>
                    <span className="font-bold text-green-600">+40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate Reduction</span>
                    <span className="font-bold text-green-600">-50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Infrastructure Savings</span>
                    <span className="font-bold text-green-600">$2,500/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Call Optimization</span>
                    <span className="font-bold text-green-600">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resource Utilization</span>
                    <span className="font-bold text-blue-600">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Reliability Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime Target</span>
                    <span className="font-bold text-blue-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MTBF Improvement</span>
                    <span className="font-bold text-green-600">+200%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recovery Time</span>
                    <span className="font-bold text-green-600">-60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DamanIntegrationIntelligenceDashboard;
