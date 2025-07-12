/**
 * DOH Real-Time Compliance Monitor
 * P4-002: Real-time Compliance Monitoring (56h)
 *
 * Provides real-time monitoring of DOH compliance requirements
 * with automated alerts and corrective action recommendations.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  XCircle,
  Eye,
  RefreshCw,
  Bell,
  FileText,
  Users,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DOHComplianceRule {
  id: string;
  name: string;
  description: string;
  category:
    | "documentation"
    | "patient_safety"
    | "quality"
    | "reporting"
    | "licensing";
  severity: "low" | "medium" | "high" | "critical";
  requirement: string;
  validationCriteria: {
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than"
      | "exists"
      | "not_exists";
    value: any;
    message: string;
  }[];
  correctiveActions: string[];
  regulatoryReference: string;
  lastUpdated: string;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedEntity: {
    type: "patient" | "episode" | "document" | "user" | "facility";
    id: string;
    name: string;
  };
  detectedAt: string;
  status:
    | "open"
    | "acknowledged"
    | "in_progress"
    | "resolved"
    | "false_positive";
  assignedTo?: string;
  dueDate?: string;
  correctiveActions: {
    action: string;
    status: "pending" | "in_progress" | "completed";
    assignedTo?: string;
    completedAt?: string;
    notes?: string;
  }[];
  auditTrail: {
    timestamp: string;
    action: string;
    userId: string;
    userName: string;
    details: any;
  }[];
}

export interface ComplianceMetrics {
  overallScore: number;
  categoryScores: {
    documentation: number;
    patient_safety: number;
    quality: number;
    reporting: number;
    licensing: number;
  };
  totalViolations: number;
  criticalViolations: number;
  resolvedViolations: number;
  averageResolutionTime: number;
  complianceTrend: {
    date: string;
    score: number;
    violations: number;
  }[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface DOHRealTimeComplianceMonitorProps {
  rules?: DOHComplianceRule[];
  violations?: ComplianceViolation[];
  metrics?: ComplianceMetrics;
  onRefresh?: () => void;
  onAcknowledgeViolation?: (violationId: string) => void;
  onResolveViolation?: (violationId: string, resolution: string) => void;
  onAssignViolation?: (violationId: string, userId: string) => void;
  onUpdateRule?: (rule: DOHComplianceRule) => void;
  refreshInterval?: number;
  className?: string;
}

const DOHRealTimeComplianceMonitor: React.FC<
  DOHRealTimeComplianceMonitorProps
> = ({
  rules = [
    {
      id: "doh-001",
      name: "9-Domain Assessment Completion",
      description:
        "All patients must have completed 9-domain assessments within 48 hours of admission",
      category: "documentation",
      severity: "critical",
      requirement: "DOH Standard 4.2.1",
      validationCriteria: [
        {
          field: "nineDomainsCompleted",
          operator: "equals",
          value: true,
          message: "9-domain assessment must be completed",
        },
        {
          field: "assessmentCompletedWithin48Hours",
          operator: "equals",
          value: true,
          message: "Assessment must be completed within 48 hours",
        },
      ],
      correctiveActions: [
        "Complete missing 9-domain assessment immediately",
        "Review patient admission process",
        "Notify clinical supervisor",
      ],
      regulatoryReference: "DOH Circular 2024-001",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "doh-002",
      name: "Patient Safety Taxonomy Compliance",
      description:
        "All incidents must be classified using DOH Patient Safety Taxonomy",
      category: "patient_safety",
      severity: "high",
      requirement: "DOH Standard 5.1.3",
      validationCriteria: [
        {
          field: "incidentTaxonomyClassified",
          operator: "equals",
          value: true,
          message: "Incident must be classified using DOH taxonomy",
        },
      ],
      correctiveActions: [
        "Classify incident using DOH Patient Safety Taxonomy",
        "Review incident reporting process",
        "Provide staff training on taxonomy usage",
      ],
      regulatoryReference: "DOH Patient Safety Guidelines 2024",
      lastUpdated: new Date().toISOString(),
    },
  ],
  violations = [
    {
      id: "viol-001",
      ruleId: "doh-001",
      ruleName: "9-Domain Assessment Completion",
      severity: "critical",
      description:
        "Patient admission 72 hours ago without completed 9-domain assessment",
      affectedEntity: {
        type: "patient",
        id: "pat-001",
        name: "Ahmed Al-Rashid",
      },
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "open",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      correctiveActions: [
        {
          action: "Complete 9-domain assessment",
          status: "pending",
          assignedTo: "nurse-001",
        },
        {
          action: "Review admission process",
          status: "pending",
          assignedTo: "supervisor-001",
        },
      ],
      auditTrail: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: "violation_detected",
          userId: "system",
          userName: "System",
          details: { automated: true },
        },
      ],
    },
  ],
  metrics = {
    overallScore: 87.5,
    categoryScores: {
      documentation: 92.0,
      patient_safety: 88.5,
      quality: 85.0,
      reporting: 90.0,
      licensing: 82.0,
    },
    totalViolations: 12,
    criticalViolations: 2,
    resolvedViolations: 45,
    averageResolutionTime: 18.5,
    complianceTrend: [
      { date: "2024-01-01", score: 85.0, violations: 15 },
      { date: "2024-01-02", score: 86.5, violations: 13 },
      { date: "2024-01-03", score: 87.5, violations: 12 },
    ],
    riskLevel: "medium",
  },
  onRefresh,
  onAcknowledgeViolation,
  onResolveViolation,
  onAssignViolation,
  onUpdateRule,
  refreshInterval = 30000,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Calculate violation statistics
  const violationStats = useMemo(() => {
    const openViolations = violations.filter((v) => v.status === "open").length;
    const criticalOpen = violations.filter(
      (v) => v.status === "open" && v.severity === "critical",
    ).length;
    const overdue = violations.filter((v) => {
      if (!v.dueDate || v.status !== "open") return false;
      return new Date(v.dueDate) < new Date();
    }).length;

    return { openViolations, criticalOpen, overdue };
  }, [violations]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "open":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
    setLastRefresh(new Date());
  };

  return (
    <div className={cn("space-y-6 bg-white", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              DOH Real-Time Compliance Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Auto
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Alerts */}
      {violationStats.criticalOpen > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {violationStats.criticalOpen} critical compliance violation(s)
                require immediate attention
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTab("violations")}
              >
                View Violations
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Compliance</p>
                <p className="text-2xl font-bold">{metrics.overallScore}%</p>
              </div>
              <div
                className={cn(
                  "text-2xl font-bold",
                  getRiskLevelColor(metrics.riskLevel),
                )}
              >
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <Progress value={metrics.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {violationStats.openViolations}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {violationStats.criticalOpen}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {metrics.averageResolutionTime}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics.categoryScores).map(
                  ([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.replace("_", " ")}
                        </span>
                        <span className="text-sm font-bold">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={cn(
                      "text-4xl font-bold mb-2",
                      getRiskLevelColor(metrics.riskLevel),
                    )}
                  >
                    {metrics.riskLevel.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600">Current Risk Level</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Violations:</span>
                    <span className="ml-2 font-medium">
                      {metrics.totalViolations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Resolved:</span>
                    <span className="ml-2 font-medium">
                      {metrics.resolvedViolations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Critical:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {metrics.criticalViolations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Overdue:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {violationStats.overdue}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Violations</CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No active violations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {violation.ruleName}
                            </h3>
                            <Badge
                              className={cn(
                                "text-xs",
                                getSeverityColor(violation.severity),
                              )}
                            >
                              {violation.severity.toUpperCase()}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(violation.status),
                              )}
                            >
                              {violation.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {violation.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            Affected: {violation.affectedEntity.type} -{" "}
                            {violation.affectedEntity.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Detected:{" "}
                            {new Date(violation.detectedAt).toLocaleString()}
                          </div>
                          {violation.dueDate && (
                            <div className="text-xs text-gray-500">
                              Due:{" "}
                              {new Date(violation.dueDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {violation.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onAcknowledgeViolation?.(violation.id)
                              }
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onResolveViolation?.(
                                violation.id,
                                "Manual resolution",
                              )
                            }
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>

                      {/* Corrective Actions */}
                      {violation.correctiveActions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="text-sm font-medium mb-2">
                            Corrective Actions:
                          </h4>
                          <div className="space-y-2">
                            {violation.correctiveActions.map(
                              (action, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>{action.action}</span>
                                  <Badge
                                    className={cn(
                                      "text-xs",
                                      action.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : action.status === "in_progress"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800",
                                    )}
                                  >
                                    {action.status.toUpperCase()}
                                  </Badge>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              getSeverityColor(rule.severity),
                            )}
                          >
                            {rule.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rule.category.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {rule.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Requirement: {rule.requirement}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reference: {rule.regulatoryReference}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateRule?.(rule)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    {/* Validation Criteria */}
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-sm font-medium mb-2">
                        Validation Criteria:
                      </h4>
                      <div className="space-y-1">
                        {rule.validationCriteria.map((criteria, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            • {criteria.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.complianceTrend.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {trend.score}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {trend.violations} violations
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                    <p className="text-xl font-bold">
                      {(
                        (metrics.resolvedViolations /
                          (metrics.totalViolations +
                            metrics.resolvedViolations)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Resolution Time</p>
                    <p className="text-xl font-bold">
                      {metrics.averageResolutionTime}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p
                      className={cn(
                        "text-xl font-bold",
                        getRiskLevelColor(metrics.riskLevel),
                      )}
                    >
                      {metrics.riskLevel.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Rules</p>
                    <p className="text-xl font-bold">{rules.length}</p>
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

export default DOHRealTimeComplianceMonitor;
