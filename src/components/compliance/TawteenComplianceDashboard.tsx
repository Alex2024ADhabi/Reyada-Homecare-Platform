import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Building,
  UserCheck,
  AlertCircle,
  Info,
  FileText,
  Settings,
} from "lucide-react";
import { ApiService } from "@/services/api.service";
import { ValidationUtils } from "@/components/ui/form-validation";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface TawteenComplianceDashboardProps {
  facilityId?: string;
  region?: string;
  userId?: string;
  userRole?: string;
}

interface WorkforceData {
  totalEmployees: number;
  uaeNationals: number;
  emiratizationRate: number;
  targetRate: number;
  complianceStatus: "compliant" | "non_compliant" | "at_risk";
  gapToTarget: number;
  trend: "improving" | "declining" | "stable";
  lastUpdated: string;
}

interface CategoryBreakdown {
  [key: string]: {
    total: number;
    emirati: number;
    percentage: number;
    target: number;
    status: "above_target" | "below_target" | "at_target";
  };
}

interface RecruitmentPipeline {
  uaeNationalCandidates: number;
  activeRecruitment: number;
  plannedHires: number;
  expectedHireDate: string;
  recruitmentChannels: string[];
  challenges: string[];
}

interface TawteenReport {
  id: string;
  reportingPeriod: string;
  submissionDate: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  complianceScore: number;
  penalties: number;
  incentives: number;
}

interface PenaltyRisk {
  currentRisk: "low" | "medium" | "high" | "critical";
  estimatedPenalty: number;
  riskFactors: string[];
  mitigationActions: string[];
  timeToCompliance: string;
}

export default function TawteenComplianceDashboard({
  facilityId = "facility-001",
  region = "abu-dhabi",
  userId = "admin",
  userRole = "hr_manager",
}: TawteenComplianceDashboardProps) {
  // State Management
  const [workforceData, setWorkforceData] = useState<WorkforceData | null>(
    null,
  );
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown>(
    {},
  );
  const [recruitmentPipeline, setRecruitmentPipeline] =
    useState<RecruitmentPipeline | null>(null);
  const [tawteenReports, setTawteenReports] = useState<TawteenReport[]>([]);
  const [penaltyRisk, setPenaltyRisk] = useState<PenaltyRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [regionalTargets, setRegionalTargets] = useState<any>(null);
  const { isOnline, saveFormData } = useOfflineSync();

  useEffect(() => {
    loadTawteenData();
  }, [facilityId, region]);

  const loadTawteenData = async () => {
    try {
      setLoading(true);
      const [complianceStatus, targets] = await Promise.all([
        ApiService.get(
          `/api/tawteen/compliance-status?facilityId=${facilityId}&region=${region}`,
        ),
        ApiService.get(`/api/tawteen/targets/${region}`),
      ]);

      setWorkforceData({
        totalEmployees: complianceStatus.emiratizationMetrics.totalPositions,
        uaeNationals: complianceStatus.emiratizationMetrics.emiratiEmployees,
        emiratizationRate:
          complianceStatus.emiratizationMetrics.currentPercentage,
        targetRate: complianceStatus.emiratizationMetrics.targetPercentage,
        complianceStatus:
          complianceStatus.emiratizationMetrics.complianceStatus ===
          "below-target"
            ? "non_compliant"
            : "compliant",
        gapToTarget: complianceStatus.emiratizationMetrics.gap,
        trend: complianceStatus.emiratizationMetrics.trend,
        lastUpdated: new Date().toISOString(),
      });

      setCategoryBreakdown(complianceStatus.categoryBreakdown);
      setRegionalTargets(targets);

      // Load additional data
      loadRecruitmentPipeline();
      loadTawteenReports();
      loadPenaltyRisk();
    } catch (error) {
      console.error("Error loading Tawteen data:", error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setWorkforceData({
      totalEmployees: 45,
      uaeNationals: 4,
      emiratizationRate: 8.9,
      targetRate: 10.0,
      complianceStatus: "non_compliant",
      gapToTarget: 1,
      trend: "improving",
      lastUpdated: new Date().toISOString(),
    });

    setCategoryBreakdown({
      healthcare: {
        total: 25,
        emirati: 2,
        percentage: 8.0,
        target: 12.0,
        status: "below_target",
      },
      administrative: {
        total: 15,
        emirati: 2,
        percentage: 13.3,
        target: 10.0,
        status: "above_target",
      },
      support: {
        total: 5,
        emirati: 0,
        percentage: 0.0,
        target: 5.0,
        status: "below_target",
      },
    });
  };

  const loadRecruitmentPipeline = () => {
    setRecruitmentPipeline({
      uaeNationalCandidates: 12,
      activeRecruitment: 3,
      plannedHires: 2,
      expectedHireDate: "2025-03-15",
      recruitmentChannels: [
        "TAMM Portal",
        "UAE University Partnerships",
        "Professional Networks",
      ],
      challenges: [
        "Limited qualified candidates",
        "Salary expectations",
        "Location preferences",
      ],
    });
  };

  const loadTawteenReports = () => {
    setTawteenReports([
      {
        id: "TWN-2024-Q4",
        reportingPeriod: "Q4 2024",
        submissionDate: "2024-12-31",
        status: "submitted",
        complianceScore: 8.9,
        penalties: 5000,
        incentives: 0,
      },
      {
        id: "TWN-2024-Q3",
        reportingPeriod: "Q3 2024",
        submissionDate: "2024-09-30",
        status: "approved",
        complianceScore: 8.5,
        penalties: 7500,
        incentives: 0,
      },
    ]);
  };

  const loadPenaltyRisk = () => {
    setPenaltyRisk({
      currentRisk: "high",
      estimatedPenalty: 15000,
      riskFactors: [
        "Below 10% Emiratization target",
        "Declining trend in Q4",
        "Limited recruitment pipeline",
      ],
      mitigationActions: [
        "Accelerate UAE national recruitment",
        "Partner with local universities",
        "Implement retention programs",
        "Review compensation packages",
      ],
      timeToCompliance: "6-9 months",
    });
  };

  const submitTawteenReport = async (reportData: any) => {
    try {
      setLoading(true);
      const response = await ApiService.post("/api/tawteen/submit-report", {
        facilityId,
        reportingPeriod: reportData.period,
        emiratizationData: workforceData,
        categoryBreakdown,
        submittedBy: userId,
      });

      // Validate Emirates ID format for Emirati employees
      if (reportData.emiratiEmployees) {
        for (const employee of reportData.emiratiEmployees) {
          if (
            employee.emiratesId &&
            !ValidationUtils.validateEmiratesId(employee.emiratesId)
          ) {
            return {
              success: false,
              error: `Invalid Emirates ID format for employee: ${employee.name}`,
              field: "emiratesId",
            };
          }
        }
      }

      // Update reports list
      const newReport: TawteenReport = {
        id: response.reportId,
        reportingPeriod: reportData.period,
        submissionDate: response.submissionDate,
        status: "submitted",
        complianceScore: response.emiratizationPercentage,
        penalties: 0,
        incentives: 0,
      };

      setTawteenReports((prev) => [newReport, ...prev]);
      setShowReportDialog(false);
    } catch (error) {
      console.error("Error submitting Tawteen report:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkforceData = async (employeeData: any) => {
    try {
      setLoading(true);
      const response = await ApiService.put(
        "/api/tawteen/update-workforce-data",
        {
          facilityId,
          employees: employeeData,
          updatedBy: userId,
        },
      );

      // Update local state
      setWorkforceData((prev) =>
        prev
          ? {
              ...prev,
              totalEmployees: response.metrics.totalEmployees,
              uaeNationals: response.metrics.emiratiEmployees,
              emiratizationRate: response.metrics.emiratizationPercentage,
              lastUpdated: new Date().toISOString(),
            }
          : null,
      );

      setCategoryBreakdown(response.metrics.categoryBreakdown);
    } catch (error) {
      console.error("Error updating workforce data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    const variants = {
      compliant: "default",
      non_compliant: "destructive",
      at_risk: "secondary",
    };
    const colors = {
      compliant: "text-green-700 bg-green-100",
      non_compliant: "text-red-700 bg-red-100",
      at_risk: "text-yellow-700 bg-yellow-100",
    };
    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={colors[status as keyof typeof colors]}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "text-green-700 bg-green-100",
      medium: "text-yellow-700 bg-yellow-100",
      high: "text-orange-700 bg-orange-100",
      critical: "text-red-700 bg-red-100",
    };
    return (
      <Badge className={colors[risk as keyof typeof colors]}>
        {risk.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tawteen Initiative Compliance Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              UAE National Employment tracking and compliance for {region}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline Mode
              </Badge>
            )}
            <Button
              onClick={loadTawteenData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Workforce Overview Cards */}
        {workforceData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {workforceData.totalEmployees}
                </div>
                <p className="text-xs text-blue-600">Active workforce</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  UAE Nationals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {workforceData.uaeNationals}
                </div>
                <p className="text-xs text-green-600">
                  {workforceData.emiratizationRate.toFixed(1)}% of workforce
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {workforceData.emiratizationRate.toFixed(1)}%
                </div>
                <Progress
                  value={
                    (workforceData.emiratizationRate /
                      workforceData.targetRate) *
                    100
                  }
                  className="h-2 mt-2"
                />
                <p className="text-xs text-purple-600 mt-1">
                  Target: {workforceData.targetRate}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {getComplianceStatusBadge(workforceData.complianceStatus)}
                  {getTrendIcon(workforceData.trend)}
                </div>
                <p className="text-xs text-orange-600">
                  Gap: {workforceData.gapToTarget} employees
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="penalties">Risk & Penalties</TabsTrigger>
            <TabsTrigger value="targets">Regional Targets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>
                    Emiratization by job category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(categoryBreakdown).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize font-medium">
                          {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {data.emirati}/{data.total}
                          </span>
                          <Badge
                            variant={
                              data.status === "above_target"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {data.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={(data.percentage / data.target) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Target: {data.target}% | Status:{" "}
                        {data.status.replace("_", " ")}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {penaltyRisk && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Penalty Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Current Risk Level:
                      </span>
                      {getRiskBadge(penaltyRisk.currentRisk)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Estimated Penalty:
                      </span>
                      <span className="font-semibold text-red-600">
                        AED {penaltyRisk.estimatedPenalty.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Time to Compliance:
                      </span>
                      <span className="font-medium">
                        {penaltyRisk.timeToCompliance}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <h4 className="font-medium text-sm mb-2">
                        Risk Factors:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                        {penaltyRisk.riskFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Workforce Tab */}
          <TabsContent value="workforce" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workforce Management</CardTitle>
                <CardDescription>
                  Manage employee data and Emiratization tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="administrative">
                          Administrative
                        </SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog
                    open={showEmployeeDialog}
                    onOpenChange={setShowEmployeeDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Employee
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Employee Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add and manage employee records for Tawteen compliance
                    tracking
                  </p>
                  <Button onClick={() => setShowEmployeeDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment" className="space-y-6">
            {recruitmentPipeline && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recruitment Pipeline</CardTitle>
                    <CardDescription>
                      UAE National recruitment progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                          {recruitmentPipeline.uaeNationalCandidates}
                        </div>
                        <div className="text-xs text-blue-600">Candidates</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                          {recruitmentPipeline.activeRecruitment}
                        </div>
                        <div className="text-xs text-green-600">Active</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">
                          {recruitmentPipeline.plannedHires}
                        </div>
                        <div className="text-xs text-purple-600">Planned</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          Expected Hire Date:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            recruitmentPipeline.expectedHireDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recruitment Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recruitmentPipeline.recruitmentChannels.map(
                      (channel, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{channel}</span>
                        </div>
                      ),
                    )}
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Channel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tawteen Reports</CardTitle>
                <CardDescription>
                  Quarterly compliance reports and submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Compliance Score</TableHead>
                        <TableHead>Penalties</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tawteenReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.id}
                          </TableCell>
                          <TableCell>{report.reportingPeriod}</TableCell>
                          <TableCell>
                            {new Date(
                              report.submissionDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.complianceScore.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-red-600">
                            AED {report.penalties.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk & Penalties Tab */}
          <TabsContent value="penalties" className="space-y-6">
            {penaltyRisk && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">
                      Penalty Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-800">
                          Current Risk Level
                        </span>
                        {getRiskBadge(penaltyRisk.currentRisk)}
                      </div>
                      <div className="text-2xl font-bold text-red-900 mb-1">
                        AED {penaltyRisk.estimatedPenalty.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-600">
                        Estimated quarterly penalty
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Risk Factors:</h4>
                      <ul className="space-y-2">
                        {penaltyRisk.riskFactors.map((factor, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">
                      Mitigation Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 mb-1">
                        Time to Compliance
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {penaltyRisk.timeToCompliance}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <ul className="space-y-2">
                        {penaltyRisk.mitigationActions.map((action, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Create Action Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Regional Targets Tab */}
          <TabsContent value="targets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Targets - {region}</CardTitle>
                <CardDescription>
                  Emiratization targets and requirements for your region
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regionalTargets ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                          {regionalTargets.emiratizationTarget}%
                        </div>
                        <div className="text-sm text-blue-600">
                          Overall Target
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                          {regionalTargets.reportingFrequency}
                        </div>
                        <div className="text-sm text-green-600">Reporting</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">
                          {new Date(
                            regionalTargets.nextDeadline,
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-purple-600">
                          Next Deadline
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Category Targets:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(regionalTargets.categoryTargets).map(
                          ([category, target]) => (
                            <div
                              key={category}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <span className="capitalize font-medium">
                                  {category.replace("_", " ")}
                                </span>
                                <span className="text-lg font-bold">
                                  {target}%
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Loading regional targets...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Submission Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Tawteen Report</DialogTitle>
              <DialogDescription>
                Submit quarterly Tawteen compliance report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporting-period">Reporting Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1-2030">Q1 2030</SelectItem>
                      <SelectItem value="Q4-2029">Q4 2029</SelectItem>
                      <SelectItem value="Q3-2029">Q3 2029</SelectItem>
                      <SelectItem value="Q2-2029">Q2 2029</SelectItem>
                      <SelectItem value="Q1-2029">Q1 2029</SelectItem>
                      <SelectItem value="Q4-2028">Q4 2028</SelectItem>
                      <SelectItem value="Q3-2028">Q3 2028</SelectItem>
                      <SelectItem value="Q2-2028">Q2 2028</SelectItem>
                      <SelectItem value="Q1-2028">Q1 2028</SelectItem>
                      <SelectItem value="Q4-2027">Q4 2027</SelectItem>
                      <SelectItem value="Q3-2027">Q3 2027</SelectItem>
                      <SelectItem value="Q2-2027">Q2 2027</SelectItem>
                      <SelectItem value="Q1-2027">Q1 2027</SelectItem>
                      <SelectItem value="Q4-2026">Q4 2026</SelectItem>
                      <SelectItem value="Q3-2026">Q3 2026</SelectItem>
                      <SelectItem value="Q2-2026">Q2 2026</SelectItem>
                      <SelectItem value="Q1-2026">Q1 2026</SelectItem>
                      <SelectItem value="Q4-2025">Q4 2025</SelectItem>
                      <SelectItem value="Q3-2025">Q3 2025</SelectItem>
                      <SelectItem value="Q2-2025">Q2 2025</SelectItem>
                      <SelectItem value="Q1-2025">Q1 2025</SelectItem>
                      <SelectItem value="Q4-2024">Q4 2024</SelectItem>
                      <SelectItem value="Q3-2024">Q3 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submission-type">Submission Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Report</SelectItem>
                      <SelectItem value="amended">Amended Report</SelectItem>
                      <SelectItem value="final">Final Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Add any additional comments or explanations..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Cancel
              </Button>
              <Button disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Employee Dialog */}
        <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>
                Add new employee for Tawteen tracking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Full Name</Label>
                  <Input id="employee-name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input id="employee-id" placeholder="Enter employee ID" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UAE">UAE</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Job Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="administrative">
                        Administrative
                      </SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter job position" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmployeeDialog(false)}
              >
                Cancel
              </Button>
              <Button disabled={loading}>
                {loading ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
