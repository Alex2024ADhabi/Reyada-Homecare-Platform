import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  RefreshCw,
  Eye,
  Download,
  Settings,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  score: number;
  status: "compliant" | "warning" | "non_compliant";
  lastChecked: string;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  trend: "up" | "down" | "stable";
}

interface ComplianceIssue {
  id: string;
  framework: string;
  rule: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedDocuments: string[];
  detectedAt: string;
  status: "open" | "in_progress" | "resolved";
  assignedTo?: string;
  dueDate?: string;
}

interface ComplianceMetrics {
  overallScore: number;
  totalDocuments: number;
  compliantDocuments: number;
  issuesCount: number;
  criticalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
}

const ComplianceMonitor: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [selectedFramework, setSelectedFramework] =
    useState<ComplianceFramework | null>(null);
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);

      // Mock data - in real implementation, this would fetch from API
      const mockFrameworks: ComplianceFramework[] = [
        {
          id: "doh",
          name: "DOH Standards",
          description: "UAE Department of Health regulatory compliance",
          score: 94,
          status: "compliant",
          lastChecked: "2024-01-20T15:30:00Z",
          totalRules: 156,
          passedRules: 147,
          failedRules: 3,
          warningRules: 6,
          trend: "up",
        },
        {
          id: "jawda",
          name: "JAWDA Accreditation",
          description: "Healthcare quality and patient safety standards",
          score: 89,
          status: "warning",
          lastChecked: "2024-01-20T14:15:00Z",
          totalRules: 203,
          passedRules: 181,
          failedRules: 8,
          warningRules: 14,
          trend: "stable",
        },
        {
          id: "daman",
          name: "Daman Insurance",
          description: "Insurance provider compliance requirements",
          score: 96,
          status: "compliant",
          lastChecked: "2024-01-20T13:45:00Z",
          totalRules: 89,
          passedRules: 85,
          failedRules: 1,
          warningRules: 3,
          trend: "up",
        },
        {
          id: "malaffi",
          name: "Malaffi Integration",
          description: "Health information exchange compliance",
          score: 87,
          status: "warning",
          lastChecked: "2024-01-20T12:30:00Z",
          totalRules: 67,
          passedRules: 58,
          failedRules: 4,
          warningRules: 5,
          trend: "down",
        },
      ];

      const mockIssues: ComplianceIssue[] = [
        {
          id: "issue-001",
          framework: "DOH Standards",
          rule: "Patient Safety Documentation",
          severity: "high",
          description:
            "Missing required patient safety incident documentation for 3 cases",
          affectedDocuments: ["doc-001", "doc-045", "doc-089"],
          detectedAt: "2024-01-20T10:15:00Z",
          status: "open",
          assignedTo: "Quality Manager",
          dueDate: "2024-01-25T17:00:00Z",
        },
        {
          id: "issue-002",
          framework: "JAWDA Accreditation",
          rule: "Staff Training Records",
          severity: "medium",
          description: "Incomplete training documentation for 12 staff members",
          affectedDocuments: ["doc-023", "doc-067"],
          detectedAt: "2024-01-19T16:30:00Z",
          status: "in_progress",
          assignedTo: "HR Manager",
          dueDate: "2024-01-30T17:00:00Z",
        },
        {
          id: "issue-003",
          framework: "Malaffi Integration",
          rule: "Data Privacy Compliance",
          severity: "critical",
          description:
            "Patient data sharing agreement requires updated consent forms",
          affectedDocuments: ["doc-012", "doc-034", "doc-056", "doc-078"],
          detectedAt: "2024-01-18T14:20:00Z",
          status: "open",
          assignedTo: "Privacy Officer",
          dueDate: "2024-01-22T17:00:00Z",
        },
      ];

      const mockMetrics: ComplianceMetrics = {
        overallScore: 91,
        totalDocuments: 156,
        compliantDocuments: 142,
        issuesCount: 15,
        criticalIssues: 1,
        resolvedIssues: 23,
        averageResolutionTime: 3.2,
      };

      setFrameworks(mockFrameworks);
      setIssues(mockIssues);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error loading compliance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ComplianceFramework["status"]) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "non_compliant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ComplianceFramework["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "non_compliant":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: ComplianceIssue["severity"]) => {
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

  const getTrendIcon = (trend: ComplianceFramework["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              Compliance Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time compliance monitoring across all regulatory frameworks
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadComplianceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics.overallScore}%
                  </p>
                  <Progress value={metrics.overallScore} className="mt-2 h-2" />
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Compliant Documents
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {metrics.compliantDocuments}/{metrics.totalDocuments}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round(
                      (metrics.compliantDocuments / metrics.totalDocuments) *
                        100,
                    )}
                    % compliant
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Issues
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {metrics.issuesCount}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {metrics.criticalIssues} critical
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Resolution
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {metrics.averageResolutionTime}d
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {metrics.resolvedIssues} resolved
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Framework Overview</TabsTrigger>
          <TabsTrigger value="issues">Active Issues</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        {/* Framework Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {frameworks.map((framework) => (
              <Card
                key={framework.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {getStatusIcon(framework.status)}
                        <span className="ml-2">{framework.name}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {framework.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {framework.score}%
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(framework.trend)}
                        <Badge className={getStatusColor(framework.status)}>
                          {framework.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={framework.score} className="h-3" />

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {framework.passedRules}
                        </div>
                        <div className="text-xs text-gray-600">Passed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">
                          {framework.warningRules}
                        </div>
                        <div className="text-xs text-gray-600">Warnings</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">
                          {framework.failedRules}
                        </div>
                        <div className="text-xs text-gray-600">Failed</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Last checked: {formatDate(framework.lastChecked)}
                      </span>
                      <span>{framework.totalRules} total rules</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFramework(framework);
                          setShowFrameworkDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Issues Tab */}
        <TabsContent value="issues">
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {issue.rule}
                        </h3>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">{issue.framework}</Badge>
                      </div>

                      <p className="text-gray-600 mb-4">{issue.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Affected Documents:
                          </span>
                          <p className="text-gray-600">
                            {issue.affectedDocuments.length} documents
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Assigned To:
                          </span>
                          <p className="text-gray-600">
                            {issue.assignedTo || "Unassigned"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Due Date:
                          </span>
                          <p className="text-gray-600">
                            {issue.dueDate
                              ? formatDate(issue.dueDate)
                              : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <span>Detected: {formatDate(issue.detectedAt)}</span>
                        <Badge
                          className={
                            issue.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : issue.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {issue.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {issue.status === "open" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Compliance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Compliance trend chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Compliance Summary Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Framework Detailed Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Issues Tracking Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Audit Trail Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Framework Details Dialog */}
      <Dialog open={showFrameworkDialog} onOpenChange={setShowFrameworkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Framework Details
            </DialogTitle>
          </DialogHeader>
          {selectedFramework && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedFramework.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedFramework.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {selectedFramework.score}%
                  </div>
                  <Badge className={getStatusColor(selectedFramework.status)}>
                    {selectedFramework.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <Progress value={selectedFramework.score} className="h-4" />

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedFramework.totalRules}
                  </div>
                  <div className="text-xs text-gray-600">Total Rules</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {selectedFramework.passedRules}
                  </div>
                  <div className="text-xs text-green-700">Passed</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">
                    {selectedFramework.warningRules}
                  </div>
                  <div className="text-xs text-yellow-700">Warnings</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">
                    {selectedFramework.failedRules}
                  </div>
                  <div className="text-xs text-red-700">Failed</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Last Checked:</strong>{" "}
                  {formatDate(selectedFramework.lastChecked)}
                </p>
                <p>
                  <strong>Trend:</strong> {selectedFramework.trend}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceMonitor;
