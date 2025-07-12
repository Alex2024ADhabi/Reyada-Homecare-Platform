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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Zap,
  Database,
} from "lucide-react";

interface JAWDAMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: "up" | "down" | "stable";
  status: "excellent" | "good" | "needs_attention";
  lastUpdated: string;
}

interface JAWDAEnhancement {
  id: string;
  title: string;
  description: string;
  category: "automation" | "reporting" | "training" | "monitoring";
  status: "completed" | "in_progress" | "planned";
  impact: "high" | "medium" | "low";
  completionDate: string;
  benefits: string[];
}

export default function JAWDAEnhancementDashboard() {
  const [metrics, setMetrics] = useState<JAWDAMetric[]>([]);
  const [enhancements, setEnhancements] = useState<JAWDAEnhancement[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadJAWDAData();
  }, []);

  const loadJAWDAData = async () => {
    try {
      setLoading(true);

      // Mock JAWDA metrics data
      const mockMetrics: JAWDAMetric[] = [
        {
          id: "kpi-collection",
          name: "KPI Data Collection Automation",
          value: 98,
          target: 95,
          trend: "up",
          status: "excellent",
          lastUpdated: "2024-12-18T10:00:00Z",
        },
        {
          id: "training-compliance",
          name: "Training Compliance Rate",
          value: 100,
          target: 90,
          trend: "up",
          status: "excellent",
          lastUpdated: "2024-12-18T09:30:00Z",
        },
        {
          id: "audit-readiness",
          name: "Audit Readiness Score",
          value: 96,
          target: 85,
          trend: "up",
          status: "excellent",
          lastUpdated: "2024-12-18T11:15:00Z",
        },
        {
          id: "incident-classification",
          name: "Incident Classification Accuracy",
          value: 94,
          target: 90,
          trend: "stable",
          status: "excellent",
          lastUpdated: "2024-12-18T08:45:00Z",
        },
        {
          id: "quality-metrics",
          name: "Quality Metrics Reporting",
          value: 97,
          target: 92,
          trend: "up",
          status: "excellent",
          lastUpdated: "2024-12-18T12:00:00Z",
        },
        {
          id: "risk-management",
          name: "Risk Management Effectiveness",
          value: 93,
          target: 88,
          trend: "up",
          status: "excellent",
          lastUpdated: "2024-12-18T10:30:00Z",
        },
      ];

      // Mock JAWDA enhancements data
      const mockEnhancements: JAWDAEnhancement[] = [
        {
          id: "auto-kpi-collection",
          title: "Automated KPI Data Collection System",
          description:
            "Real-time automated collection and validation of JAWDA KPI data with error handling and alerts",
          category: "automation",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-15",
          benefits: [
            "Eliminated manual data entry errors",
            "Reduced data collection time by 85%",
            "Real-time validation and alerts",
            "Comprehensive audit trail",
          ],
        },
        {
          id: "training-management",
          title: "Enhanced Training Management System",
          description:
            "Digital training tracking with automated reminders, compliance verification, and reporting",
          category: "training",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-10",
          benefits: [
            "100% training compliance tracking",
            "Automated reminder system",
            "Digital signature validation",
            "Comprehensive training analytics",
          ],
        },
        {
          id: "quality-reporting",
          title: "Automated Quality Metrics Reporting",
          description:
            "Automated generation of monthly and quarterly quality reports with trend analysis",
          category: "reporting",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-12",
          benefits: [
            "Automated report generation",
            "Real-time trend analysis",
            "Predictive quality indicators",
            "Stakeholder dashboard integration",
          ],
        },
        {
          id: "emr-audit-enhancement",
          title: "EMR Audit Log System Enhancement",
          description:
            "Comprehensive EMR audit logging with real-time monitoring and automated compliance checks",
          category: "monitoring",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-08",
          benefits: [
            "Real-time audit log monitoring",
            "Automated compliance verification",
            "Enhanced security tracking",
            "Performance optimization",
          ],
        },
        {
          id: "risk-assessment-framework",
          title: "Risk Assessment and Mitigation Framework",
          description:
            "Comprehensive risk assessment with automated mitigation tracking and reporting",
          category: "monitoring",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-14",
          benefits: [
            "Proactive risk identification",
            "Automated mitigation tracking",
            "Risk trend analysis",
            "Compliance risk scoring",
          ],
        },
        {
          id: "incident-management-enhancement",
          title: "Patient Safety Incident Management Enhancement",
          description:
            "Enhanced incident classification with automated DOH taxonomy compliance",
          category: "automation",
          status: "completed",
          impact: "high",
          completionDate: "2024-12-11",
          benefits: [
            "Automated DOH taxonomy classification",
            "Real-time incident tracking",
            "Enhanced reporting capabilities",
            "Compliance verification",
          ],
        },
      ];

      setMetrics(mockMetrics);
      setEnhancements(mockEnhancements);
    } catch (error) {
      console.error("Error loading JAWDA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      needs_attention: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getEnhancementStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      planned: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={variants[impact as keyof typeof variants]}>
        {impact.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "automation":
        return <Zap className="w-4 h-4" />;
      case "reporting":
        return <BarChart3 className="w-4 h-4" />;
      case "training":
        return <Users className="w-4 h-4" />;
      case "monitoring":
        return <Activity className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length,
  );

  const completedEnhancements = enhancements.filter(
    (e) => e.status === "completed",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              JAWDA Enhancement Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive JAWDA implementation with automated KPI management
              and compliance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Implementation Complete
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overall JAWDA Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {overallScore}%
              </div>
              <Progress value={overallScore} className="h-2 mt-2" />
              <p className="text-xs text-green-600 mt-1">
                Excellent compliance level
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {completedEnhancements}/{enhancements.length}
              </div>
              <p className="text-xs text-blue-600">
                All critical enhancements deployed
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Automated KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {metrics.length}
              </div>
              <p className="text-xs text-purple-600">
                Real-time monitoring active
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">+24%</div>
              <p className="text-xs text-orange-600">
                Since JAWDA implementation
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">KPI Metrics</TabsTrigger>
            <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JAWDA Implementation Status</CardTitle>
                  <CardDescription>
                    Current status of all JAWDA enhancement initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enhancements.slice(0, 3).map((enhancement) => (
                      <div
                        key={enhancement.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(enhancement.category)}
                          <div>
                            <h4 className="font-medium">{enhancement.title}</h4>
                            <p className="text-sm text-gray-600">
                              {enhancement.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getEnhancementStatusBadge(enhancement.status)}
                          {getImpactBadge(enhancement.impact)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>
                    Real-time JAWDA compliance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.slice(0, 3).map((metric) => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {metric.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {metric.value}%
                          </span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JAWDA KPI Metrics</CardTitle>
                <CardDescription>
                  Comprehensive view of all JAWDA key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell className="font-medium">
                            {metric.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={metric.value}
                                className="h-2 w-16"
                              />
                              <span className="text-sm font-medium">
                                {metric.value}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{metric.target}%</TableCell>
                          <TableCell>{getStatusBadge(metric.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {metric.trend === "up" && (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              )}
                              {metric.trend === "down" && (
                                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                              )}
                              {metric.trend === "stable" && (
                                <div className="w-4 h-4 bg-gray-400 rounded-full" />
                              )}
                              <span className="text-sm capitalize">
                                {metric.trend}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(metric.lastUpdated).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhancements Tab */}
          <TabsContent value="enhancements" className="space-y-6">
            <div className="space-y-4">
              {enhancements.map((enhancement) => (
                <Card
                  key={enhancement.id}
                  className="border-l-4 border-l-green-400"
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(enhancement.category)}
                          <h4 className="font-semibold text-lg">
                            {enhancement.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {enhancement.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Category: {enhancement.category}</span>
                          <span>Completed: {enhancement.completionDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getEnhancementStatusBadge(enhancement.status)}
                        {getImpactBadge(enhancement.impact)}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Key Benefits:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {enhancement.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operational Benefits</CardTitle>
                  <CardDescription>
                    Improvements in day-to-day operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        85% reduction in manual data entry
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        100% training compliance tracking
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Real-time audit readiness monitoring
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Automated compliance verification
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Improvements</CardTitle>
                  <CardDescription>
                    Enhanced quality metrics and outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        24% improvement in overall compliance
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">98% KPI data accuracy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Proactive risk identification
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Enhanced incident management
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
