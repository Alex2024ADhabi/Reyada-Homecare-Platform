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
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  Database,
  Shield,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JAWDAKPIIndicator {
  id: string;
  code: string;
  name: string;
  description: string;
  calculation: string;
  target: string;
  reporting_frequency: string;
  current_value: number;
  target_value: number;
  status: "excellent" | "good" | "needs_attention" | "critical";
  last_updated: string;
  data_source: string;
  collection_method: "automated" | "manual" | "hybrid";
  doh_compliance: boolean;
}

interface JAWDAImplementationItem {
  id: string;
  category:
    | "kpi_tracking"
    | "data_collection"
    | "reporting"
    | "training"
    | "compliance";
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  priority: "critical" | "high" | "medium" | "low";
  completion_percentage: number;
  responsible_person: string;
  due_date: string;
  implementation_notes: string;
  benefits: string[];
}

interface JAWDAImplementationTrackerProps {
  facilityId?: string;
  showHeader?: boolean;
}

export default function JAWDAImplementationTracker({
  facilityId = "RHHCS-001",
  showHeader = true,
}: JAWDAImplementationTrackerProps) {
  const [kpiIndicators, setKpiIndicators] = useState<JAWDAKPIIndicator[]>([]);
  const [implementationItems, setImplementationItems] = useState<
    JAWDAImplementationItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadJAWDAImplementationData();
  }, [facilityId]);

  const loadJAWDAImplementationData = async () => {
    try {
      setLoading(true);

      // JAWDA KPI Indicators based on Version 8.3 guidelines
      const mockKPIIndicators: JAWDAKPIIndicator[] = [
        {
          id: "HC001",
          code: "HC001",
          name: "All-cause Emergency Department / Urgent Care Visit without Hospitalization",
          description:
            "Percentage of homecare patient days in which patients used the emergency department or urgent care but were not admitted to the hospital",
          calculation:
            "(Number of unplanned ED/UC visits / Total homecare patient days) × 100",
          target: "Lower is better",
          reporting_frequency: "Quarterly",
          current_value: 2.1,
          target_value: 3.0,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "EMR System",
          collection_method: "automated",
          doh_compliance: true,
        },
        {
          id: "HC002",
          code: "HC002",
          name: "All-cause Unplanned Acute Care Hospitalization",
          description:
            "Percentage of days in which homecare patients were admitted to an acute care hospital",
          calculation:
            "(Number of unplanned hospital days / Total homecare patient days) × 100",
          target: "Lower is better",
          reporting_frequency: "Quarterly",
          current_value: 1.8,
          target_value: 2.5,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "EMR System",
          collection_method: "automated",
          doh_compliance: true,
        },
        {
          id: "HC003",
          code: "HC003",
          name: "Managing daily activities – Improvement in Ambulation for patients who received physiotherapy",
          description:
            "Percentage of home health care patients during which the patient improved in ability to ambulate",
          calculation:
            "(Number of patients with ambulation improvement / Total patients receiving physiotherapy) × 100",
          target: "Higher is better",
          reporting_frequency: "Quarterly",
          current_value: 87.5,
          target_value: 80.0,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "Clinical Assessment Records",
          collection_method: "automated",
          doh_compliance: true,
        },
        {
          id: "HC004",
          code: "HC004",
          name: "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
          description:
            "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
          calculation:
            "(Number of pressure injuries Stage 2+ / Total homecare patient days) × 1000",
          target: "Lower is better",
          reporting_frequency: "Quarterly",
          current_value: 0.8,
          target_value: 1.2,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "Wound Assessment Records",
          collection_method: "automated",
          doh_compliance: true,
        },
        {
          id: "HC005",
          code: "HC005",
          name: "Rate of homecare patient falls resulting in any injury per 1000 homecare patient days",
          description:
            "Homecare patients falls resulting in any injury per 1000 home care patient days",
          calculation:
            "(Number of patient falls with injury / Total homecare patient days) × 1000",
          target: "Lower is better",
          reporting_frequency: "Quarterly",
          current_value: 0.5,
          target_value: 1.0,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "Incident Reports",
          collection_method: "automated",
          doh_compliance: true,
        },
        {
          id: "HC006",
          code: "HC006",
          name: "Discharge to Community",
          description:
            "Percentage of days in which homecare patients were discharged to the community",
          calculation:
            "(Number of patients discharged to community / Total homecare patient days) × 100",
          target: "Higher is better",
          reporting_frequency: "Quarterly",
          current_value: 92.3,
          target_value: 85.0,
          status: "excellent",
          last_updated: "2024-12-18T10:00:00Z",
          data_source: "Discharge Records",
          collection_method: "automated",
          doh_compliance: true,
        },
      ];

      // JAWDA Implementation Items
      const mockImplementationItems: JAWDAImplementationItem[] = [
        {
          id: "IMPL-001",
          category: "kpi_tracking",
          title: "Automated KPI Data Collection System",
          description:
            "Real-time automated collection and validation of all 6 JAWDA KPI indicators with error handling and alerts",
          status: "completed",
          priority: "critical",
          completion_percentage: 100,
          responsible_person: "IT Team, Quality Department",
          due_date: "2024-12-15",
          implementation_notes:
            "System fully operational with real-time monitoring and automated validation",
          benefits: [
            "Eliminated manual data entry errors",
            "Real-time KPI monitoring",
            "Automated compliance validation",
            "Comprehensive audit trail",
          ],
        },
        {
          id: "IMPL-002",
          category: "data_collection",
          title: "Patient Demographics Integration",
          description:
            "Enhanced patient demographics tracking with JAWDA/Non-JAWDA classification for accurate reporting",
          status: "completed",
          priority: "high",
          completion_percentage: 100,
          responsible_person: "Mohammed Shafi",
          due_date: "2024-12-10",
          implementation_notes:
            "Demographics integration completed with automated classification",
          benefits: [
            "Accurate patient classification",
            "Improved data quality",
            "Automated demographic tracking",
            "Enhanced reporting accuracy",
          ],
        },
        {
          id: "IMPL-003",
          category: "reporting",
          title: "Quarterly JAWDA Submission Automation",
          description:
            "Automated quarterly data submission to DOH with validation and compliance checks",
          status: "completed",
          priority: "critical",
          completion_percentage: 100,
          responsible_person: "Quality Team",
          due_date: "2024-12-12",
          implementation_notes:
            "Automated submission system with pre-validation and compliance verification",
          benefits: [
            "Timely quarterly submissions",
            "Automated compliance validation",
            "Reduced manual effort",
            "Improved data accuracy",
          ],
        },
        {
          id: "IMPL-004",
          category: "training",
          title: "JAWDA KPI Training Program",
          description:
            "Comprehensive training program for all staff on JAWDA KPI requirements and data collection",
          status: "completed",
          priority: "high",
          completion_percentage: 100,
          responsible_person: "Ghiwa Nasr, Training Team",
          due_date: "2024-12-08",
          implementation_notes:
            "All staff trained with digital certificates and automated tracking",
          benefits: [
            "100% staff compliance",
            "Standardized data collection",
            "Improved data quality",
            "Continuous competency monitoring",
          ],
        },
        {
          id: "IMPL-005",
          category: "compliance",
          title: "DOH Compliance Monitoring Dashboard",
          description:
            "Real-time dashboard for monitoring DOH compliance across all JAWDA requirements",
          status: "completed",
          priority: "high",
          completion_percentage: 100,
          responsible_person: "Development Team",
          due_date: "2024-12-14",
          implementation_notes:
            "Interactive dashboard with real-time alerts and compliance scoring",
          benefits: [
            "Real-time compliance monitoring",
            "Proactive issue identification",
            "Executive visibility",
            "Automated reporting",
          ],
        },
        {
          id: "IMPL-006",
          category: "data_collection",
          title: "Service Code Mapping Implementation",
          description:
            "Implementation of new 2024-2025 service codes (17-25-1 to 17-25-5) with automated mapping",
          status: "completed",
          priority: "critical",
          completion_percentage: 100,
          responsible_person: "Coding Team, IT Department",
          due_date: "2024-12-01",
          implementation_notes:
            "All new service codes implemented with automated legacy code mapping",
          benefits: [
            "Compliance with new coding standards",
            "Automated code mapping",
            "Improved billing accuracy",
            "Seamless transition from legacy codes",
          ],
        },
      ];

      setKpiIndicators(mockKPIIndicators);
      setImplementationItems(mockImplementationItems);
    } catch (error) {
      console.error("Error loading JAWDA implementation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      needs_attention: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: "bg-red-200 text-red-900 border-red-300",
      high: "bg-orange-200 text-orange-900 border-orange-300",
      medium: "bg-yellow-200 text-yellow-900 border-yellow-300",
      low: "bg-green-200 text-green-900 border-green-300",
    };
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "kpi_tracking":
        return <BarChart3 className="w-4 h-4" />;
      case "data_collection":
        return <Database className="w-4 h-4" />;
      case "reporting":
        return <FileText className="w-4 h-4" />;
      case "training":
        return <Users className="w-4 h-4" />;
      case "compliance":
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const overallImplementationProgress = Math.round(
    implementationItems.reduce(
      (sum, item) => sum + item.completion_percentage,
      0,
    ) / implementationItems.length,
  );

  const completedItems = implementationItems.filter(
    (item) => item.status === "completed",
  ).length;
  const kpiCompliance = Math.round(
    (kpiIndicators.filter(
      (kpi) => kpi.status === "excellent" || kpi.status === "good",
    ).length /
      kpiIndicators.length) *
      100,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                JAWDA Implementation Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive JAWDA Guidelines Version 8.3 Implementation Status
                - {facilityId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Version 8.3 Compliant
              </Badge>
              <Button
                onClick={loadJAWDAImplementationData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Implementation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {overallImplementationProgress}%
              </div>
              <Progress
                value={overallImplementationProgress}
                className="h-2 mt-2"
              />
              <p className="text-xs text-green-600 mt-1">
                All critical items completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {completedItems}/{implementationItems.length}
              </div>
              <p className="text-xs text-blue-600">
                Implementation items completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                KPI Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {kpiCompliance}%
              </div>
              <p className="text-xs text-purple-600">
                {kpiIndicators.length} KPIs monitored
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                DOH Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">98%</div>
              <p className="text-xs text-orange-600">
                Excellent compliance level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            JAWDA Implementation Complete
          </AlertTitle>
          <AlertDescription className="text-green-700">
            All critical JAWDA requirements have been successfully implemented
            with automated KPI tracking, real-time compliance monitoring, and
            comprehensive reporting capabilities.
          </AlertDescription>
        </Alert>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis">KPI Indicators</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JAWDA KPI Performance</CardTitle>
                  <CardDescription>
                    Current performance across all 6 JAWDA KPI indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kpiIndicators.slice(0, 3).map((kpi) => (
                      <div key={kpi.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {kpi.code}
                          </span>
                          <span className="text-sm text-gray-600">
                            {kpi.current_value}{" "}
                            {kpi.target === "Higher is better" ? "↑" : "↓"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{kpi.name}</div>
                        {getStatusBadge(kpi.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Status</CardTitle>
                  <CardDescription>
                    Status of key JAWDA implementation components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {implementationItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(item.category)}
                          <div>
                            <h4 className="font-medium text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {item.category.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          <span className="text-sm font-medium">
                            {item.completion_percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* KPIs Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JAWDA KPI Indicators (Version 8.3)</CardTitle>
                <CardDescription>
                  All 6 mandatory JAWDA KPI indicators with real-time monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Indicator Name</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Collection Method</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpiIndicators.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell className="font-medium">
                            {kpi.code}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">
                                {kpi.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {kpi.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {kpi.current_value}
                          </TableCell>
                          <TableCell>{kpi.target}</TableCell>
                          <TableCell>{getStatusBadge(kpi.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {kpi.collection_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(kpi.last_updated).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Implementation Tab */}
          <TabsContent value="implementation" className="space-y-6">
            <div className="space-y-4">
              {implementationItems.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-green-400">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(item.category)}
                          <h4 className="font-semibold text-lg">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            Category: {item.category.replace("_", " ")}
                          </span>
                          <span>Responsible: {item.responsible_person}</span>
                          <span>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                        <span className="text-sm font-medium">
                          {item.completion_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">
                        Implementation Benefits:
                      </h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {item.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {item.implementation_notes}
                      </p>
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
                    Improvements achieved through JAWDA implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        100% automated KPI data collection
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Real-time compliance monitoring
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Automated quarterly submissions
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Comprehensive audit trail</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Eliminated manual data entry errors
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
                        98% data accuracy improvement
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        95% reduction in reporting time
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        100% staff training compliance
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Enhanced patient safety outcomes
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Proactive risk identification
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
