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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Plus,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Award,
  FileText,
} from "lucide-react";
import {
  getJAWDAKPIRecords,
  createJAWDAKPIRecord,
  JAWDAKPITracking,
} from "@/api/quality-management.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface JAWDAKPITrackerProps {
  userId?: string;
  userRole?: string;
  showHeader?: boolean;
}

export default function JAWDAKPITracker({
  userId = "Dr. Sarah Ahmed",
  userRole = "quality_manager",
  showHeader = true,
}: JAWDAKPITrackerProps) {
  const [kpiRecords, setKpiRecords] = useState<JAWDAKPITracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKPIDialog, setShowKPIDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newKPIRecord, setNewKPIRecord] = useState({
    kpi_name: "",
    kpi_category: "patient_safety" as const,
    kpi_description: "",
    measurement_period: new Date().toISOString().split("T")[0],
    target_value: 0,
    actual_value: 0,
    data_source: "",
    collection_method: "manual" as const,
    responsible_department: "",
    responsible_person: "",
    reporting_frequency: "monthly" as const,
  });
  const { isOnline, saveFormData } = useOfflineSync();

  useEffect(() => {
    loadKPIData();
  }, [selectedCategory]);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      const records = await getJAWDAKPIRecords();

      // Filter by category if selected
      const filteredRecords =
        selectedCategory === "all"
          ? records
          : records.filter(
              (record) => record.kpi_category === selectedCategory,
            );

      setKpiRecords(filteredRecords);
    } catch (error) {
      console.error("Error loading KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKPIRecord = async () => {
    try {
      setLoading(true);
      const kpiId = `KPI-${Date.now()}`;
      const variance = newKPIRecord.actual_value - newKPIRecord.target_value;
      const variancePercentage =
        newKPIRecord.target_value !== 0
          ? (variance / newKPIRecord.target_value) * 100
          : 0;

      let performanceStatus: "exceeds" | "meets" | "below" | "critical";
      if (variancePercentage >= 10) performanceStatus = "exceeds";
      else if (variancePercentage >= 0) performanceStatus = "meets";
      else if (variancePercentage >= -10) performanceStatus = "below";
      else performanceStatus = "critical";

      await createJAWDAKPIRecord({
        ...newKPIRecord,
        kpi_id: kpiId,
        variance,
        variance_percentage: variancePercentage,
        performance_status: performanceStatus,
        last_updated: new Date().toISOString(),
        next_update_due: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        trend_analysis: {
          previous_period_value: 0,
          trend_direction: "stable" as const,
          trend_percentage: 0,
        },
        action_required:
          performanceStatus === "below" || performanceStatus === "critical",
        improvement_actions: [],
        regulatory_requirement: {
          regulation: "JAWDA",
          requirement_code: "JAWDA-KPI-001",
          mandatory: true,
        },
        benchmarking: {},
      });

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("jawda_kpi", {
          ...newKPIRecord,
          kpi_id: kpiId,
          timestamp: new Date().toISOString(),
        });
      }

      setShowKPIDialog(false);
      resetKPIForm();
      await loadKPIData();
    } catch (error) {
      console.error("Error creating KPI record:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create KPI record",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetKPIForm = () => {
    setNewKPIRecord({
      kpi_name: "",
      kpi_category: "patient_safety",
      kpi_description: "",
      measurement_period: new Date().toISOString().split("T")[0],
      target_value: 0,
      actual_value: 0,
      data_source: "",
      collection_method: "manual",
      responsible_department: "",
      responsible_person: "",
      reporting_frequency: "monthly",
    });
  };

  const getPerformanceBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      exceeds: "default",
      meets: "secondary",
      below: "destructive",
      critical: "destructive",
    };
    const icons = {
      exceeds: <TrendingUp className="w-3 h-3" />,
      meets: <Target className="w-3 h-3" />,
      below: <TrendingDown className="w-3 h-3" />,
      critical: <AlertTriangle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTrendBadge = (direction: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      improving: "default",
      stable: "secondary",
      declining: "destructive",
    };
    const icons = {
      improving: <TrendingUp className="w-3 h-3" />,
      stable: <Target className="w-3 h-3" />,
      declining: <TrendingDown className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[direction] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[direction as keyof typeof icons]}
        {direction.toUpperCase()}
      </Badge>
    );
  };

  const categories = [
    "all",
    "patient_safety",
    "clinical_effectiveness",
    "patient_experience",
    "operational_efficiency",
    "staff_satisfaction",
  ];

  // Calculate summary statistics
  const totalKPIs = kpiRecords.length;
  const meetingTargets = kpiRecords.filter(
    (kpi) =>
      kpi.performance_status === "meets" ||
      kpi.performance_status === "exceeds",
  ).length;
  const belowTargets = kpiRecords.filter(
    (kpi) =>
      kpi.performance_status === "below" ||
      kpi.performance_status === "critical",
  ).length;
  const averagePerformance =
    totalKPIs > 0 ? Math.round((meetingTargets / totalKPIs) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                JAWDA KPI Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                UAE Quality Framework Key Performance Indicators Monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Offline Mode
                </Badge>
              )}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <Button onClick={loadKPIData} disabled={loading}>
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Dialog open={showKPIDialog} onOpenChange={setShowKPIDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add KPI
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add JAWDA KPI</DialogTitle>
                    <DialogDescription>
                      Add a new Key Performance Indicator for UAE Quality
                      Framework tracking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kpiName">KPI Name</Label>
                        <Input
                          id="kpiName"
                          value={newKPIRecord.kpi_name}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              kpi_name: e.target.value,
                            })
                          }
                          placeholder="Enter KPI name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kpiCategory">Category</Label>
                        <Select
                          value={newKPIRecord.kpi_category}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              kpi_category: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient_safety">
                              Patient Safety
                            </SelectItem>
                            <SelectItem value="clinical_effectiveness">
                              Clinical Effectiveness
                            </SelectItem>
                            <SelectItem value="patient_experience">
                              Patient Experience
                            </SelectItem>
                            <SelectItem value="operational_efficiency">
                              Operational Efficiency
                            </SelectItem>
                            <SelectItem value="staff_satisfaction">
                              Staff Satisfaction
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="kpiDescription">Description</Label>
                      <Textarea
                        id="kpiDescription"
                        value={newKPIRecord.kpi_description}
                        onChange={(e) =>
                          setNewKPIRecord({
                            ...newKPIRecord,
                            kpi_description: e.target.value,
                          })
                        }
                        placeholder="Describe the KPI and its measurement criteria"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="targetValue">Target Value</Label>
                        <Input
                          id="targetValue"
                          type="number"
                          value={newKPIRecord.target_value}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              target_value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter target value"
                        />
                      </div>
                      <div>
                        <Label htmlFor="actualValue">Actual Value</Label>
                        <Input
                          id="actualValue"
                          type="number"
                          value={newKPIRecord.actual_value}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              actual_value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter actual value"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataSource">Data Source</Label>
                        <Input
                          id="dataSource"
                          value={newKPIRecord.data_source}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              data_source: e.target.value,
                            })
                          }
                          placeholder="Enter data source"
                        />
                      </div>
                      <div>
                        <Label htmlFor="collectionMethod">
                          Collection Method
                        </Label>
                        <Select
                          value={newKPIRecord.collection_method}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              collection_method: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automated">Automated</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="responsibleDepartment">
                          Responsible Department
                        </Label>
                        <Input
                          id="responsibleDepartment"
                          value={newKPIRecord.responsible_department}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              responsible_department: e.target.value,
                            })
                          }
                          placeholder="Enter responsible department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsiblePerson">
                          Responsible Person
                        </Label>
                        <Input
                          id="responsiblePerson"
                          value={newKPIRecord.responsible_person}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              responsible_person: e.target.value,
                            })
                          }
                          placeholder="Enter responsible person"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowKPIDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKPIRecord} disabled={loading}>
                      Add KPI
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {totalKPIs}
              </div>
              <p className="text-xs text-blue-600">Active indicators</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Meeting Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {meetingTargets}
              </div>
              <p className="text-xs text-green-600">of {totalKPIs} KPIs</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Below Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {belowTargets}
              </div>
              <p className="text-xs text-red-600">Require attention</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {averagePerformance}%
              </div>
              <Progress value={averagePerformance} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Critical KPIs Alert */}
        {belowTargets > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Critical KPI Performance
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {belowTargets} KPI{belowTargets > 1 ? "s are" : " is"} performing
              below target. Review and implement improvement actions to maintain
              quality standards.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Table */}
        <Card>
          <CardHeader>
            <CardTitle>JAWDA KPI Performance Dashboard</CardTitle>
            <CardDescription>
              Monitor and track UAE Quality Framework Key Performance Indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KPI Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        Loading KPI data...
                      </TableCell>
                    </TableRow>
                  ) : kpiRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-4 text-gray-500"
                      >
                        No KPI records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    kpiRecords.map((kpi) => (
                      <TableRow key={kpi._id?.toString()}>
                        <TableCell className="font-medium">
                          {kpi.kpi_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {kpi.kpi_category
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>{kpi.target_value}</TableCell>
                        <TableCell>{kpi.actual_value}</TableCell>
                        <TableCell>
                          <span
                            className={
                              kpi.variance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {kpi.variance > 0 ? "+" : ""}
                            {kpi.variance.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getPerformanceBadge(kpi.performance_status)}
                        </TableCell>
                        <TableCell>
                          {getTrendBadge(kpi.trend_analysis.trend_direction)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(kpi.last_updated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* KPI Categories Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.slice(1).map((category) => {
            const categoryKPIs = kpiRecords.filter(
              (kpi) => kpi.kpi_category === category,
            );
            const categoryMeeting = categoryKPIs.filter(
              (kpi) =>
                kpi.performance_status === "meets" ||
                kpi.performance_status === "exceeds",
            ).length;
            const categoryPerformance =
              categoryKPIs.length > 0
                ? Math.round((categoryMeeting / categoryKPIs.length) * 100)
                : 0;

            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {category
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total KPIs:</span>
                      <span className="font-medium">{categoryKPIs.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Meeting Targets:</span>
                      <span className="font-medium">{categoryMeeting}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Performance:</span>
                      <span className="font-medium">
                        {categoryPerformance}%
                      </span>
                    </div>
                    <Progress
                      value={categoryPerformance}
                      className="h-2 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
