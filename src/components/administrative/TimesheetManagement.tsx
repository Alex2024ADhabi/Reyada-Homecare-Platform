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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  getTimesheetSummaries,
  generateTimesheetSummary,
  approveTimesheet,
  TimesheetSummary,
} from "@/api/attendance.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { toast } from "@/components/ui/use-toast";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  Shield,
  BarChart3,
} from "lucide-react";

interface TimesheetManagementProps {
  employeeId?: string;
  isManager?: boolean;
}

export default function TimesheetManagement({
  employeeId,
  isManager = true,
}: TimesheetManagementProps) {
  const [timesheets, setTimesheets] = useState<TimesheetSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });
  const [filters, setFilters] = useState({
    employee_id: employeeId || "",
    department: "",
    pay_period_start: selectedPeriod.start,
    pay_period_end: selectedPeriod.end,
  });
  const [overtimeAnalysis, setOvertimeAnalysis] = useState({
    totalOvertimeHours: 245,
    overtimeCost: 18375,
    averageOvertimePerEmployee: 5.4,
    overtimeTrend: "increasing",
    topOvertimeEmployees: [
      { name: "Sarah Johnson", hours: 18.5, cost: 1387.5 },
      { name: "Ahmed Al Mansouri", hours: 16.2, cost: 1215 },
      { name: "Maria Garcia", hours: 14.8, cost: 1110 },
    ],
  });
  const [laborCostAnalysis, setLaborCostAnalysis] = useState({
    totalLaborCost: 156750,
    regularPayCost: 138375,
    overtimeCost: 18375,
    benefitsCost: 23512.5,
    costPerHour: 45.2,
    budgetVariance: -2.3, // percentage
    projectedMonthlyCost: 162450,
  });
  const [payrollIntegration, setPayrollIntegration] = useState({
    systemConnected: true,
    lastSync: new Date().toISOString(),
    pendingTransactions: 3,
    autoProcessingEnabled: true,
    complianceStatus: "compliant",
  });
  const [workforceMetrics, setWorkforceMetrics] = useState({
    totalActiveEmployees: 45,
    mobileAppUsers: 38,
    averageProductivity: 87.5,
    attendanceRate: 94.2,
    overtimeUtilization: 12.8,
  });
  const [mobileTimeTracking, setMobileTimeTracking] = useState({
    activeUsers: 38,
    todayCheckIns: 42,
    gpsVerifiedEntries: 156,
    biometricAuthentications: 142,
    offlineEntriesPending: 8,
    averageAccuracy: 98.5,
    batteryOptimizationEnabled: true,
    geofencingActive: true,
  });
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadTimesheets();
  }, [filters]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await getTimesheetSummaries(filters);
      setTimesheets(data);
      toast({
        title: "Timesheets loaded",
        description: `Found ${data.length} timesheet records`,
      });
    } catch (error) {
      console.error("Error loading timesheets:", error);
      toast({
        title: "Error loading timesheets",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load timesheet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimesheet = async (employeeId?: string) => {
    if (!employeeId && !filters.employee_id) {
      toast({
        title: "Employee ID required",
        description: "Please specify an employee ID to generate timesheet",
        variant: "destructive",
      });
      return;
    }

    const targetEmployeeId = employeeId || filters.employee_id;

    // Validate date range
    if (!selectedPeriod.start || !selectedPeriod.end) {
      toast({
        title: "Invalid date range",
        description: "Please select valid start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await generateTimesheetSummary(
        targetEmployeeId,
        selectedPeriod.start,
        selectedPeriod.end,
      );
      toast({
        title: "Timesheet generated",
        description: `Timesheet generated successfully for employee ${targetEmployeeId}`,
      });
      await loadTimesheets();
    } catch (error) {
      console.error("Error generating timesheet:", error);
      toast({
        title: "Error generating timesheet",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate timesheet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTimesheet = async (id: string, employeeName: string) => {
    if (!isOnline) {
      toast({
        title: "Offline mode",
        description: "Timesheet approval requires internet connection",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await approveTimesheet(id, "Dr. Sarah Ahmed");
      toast({
        title: "Timesheet approved",
        description: `Timesheet for ${employeeName} has been approved successfully`,
      });
      await loadTimesheets();
    } catch (error) {
      console.error("Error approving timesheet:", error);
      toast({
        title: "Error approving timesheet",
        description:
          error instanceof Error
            ? error.message
            : "Failed to approve timesheet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getApprovalBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      approved: "default",
      submitted: "secondary",
      draft: "outline",
      rejected: "destructive",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3" />,
      submitted: <Clock className="w-3 h-3" />,
      draft: <FileText className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const calculateTotals = () => {
    return timesheets.reduce(
      (acc, timesheet) => {
        acc.totalHours += timesheet.total_worked_hours;
        acc.totalOvertimeHours += timesheet.total_overtime_hours;
        acc.totalPay += timesheet.total_pay;
        acc.totalNetPay += timesheet.net_pay;
        return acc;
      },
      {
        totalHours: 0,
        totalOvertimeHours: 0,
        totalPay: 0,
        totalNetPay: 0,
      },
    );
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Timesheet Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee timesheets and payroll processing
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline Mode - Limited Functionality
              </Badge>
            )}
            <Button disabled={!isOnline || loading}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Payroll Integration Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Payroll System Integration
            </CardTitle>
            <CardDescription>
              Real-time payroll processing and compliance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-green-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                </div>
                <div className="text-sm text-gray-600">System Status</div>
                <div className="text-xs text-green-600 mt-1">
                  {payrollIntegration.systemConnected
                    ? "Connected"
                    : "Disconnected"}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-700">
                  {payrollIntegration.pendingTransactions}
                </div>
                <div className="text-sm text-gray-600">
                  Pending Transactions
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Awaiting processing
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-purple-700">
                  {new Date(payrollIntegration.lastSync).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Sync</div>
                <div className="text-xs text-gray-500 mt-1">Real-time sync</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-lg font-bold">
                  <Badge
                    variant={
                      payrollIntegration.autoProcessingEnabled
                        ? "default"
                        : "secondary"
                    }
                  >
                    {payrollIntegration.autoProcessingEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Auto Processing
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-lg font-bold">
                  <Badge
                    variant={
                      payrollIntegration.complianceStatus === "compliant"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {payrollIntegration.complianceStatus === "compliant"
                      ? "Compliant"
                      : "Non-Compliant"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">Compliance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workforce Analytics Overview */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Workforce Analytics & Metrics
            </CardTitle>
            <CardDescription>
              Real-time workforce performance and productivity insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-700">
                  {workforceMetrics.totalActiveEmployees}
                </div>
                <div className="text-sm text-gray-600">Active Employees</div>
                <div className="text-xs text-blue-600 mt-1">Full workforce</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-green-700">
                  {workforceMetrics.mobileAppUsers}
                </div>
                <div className="text-sm text-gray-600">Mobile Users</div>
                <div className="text-xs text-green-600 mt-1">
                  {Math.round(
                    (workforceMetrics.mobileAppUsers /
                      workforceMetrics.totalActiveEmployees) *
                      100,
                  )}
                  % adoption
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-purple-700">
                  {workforceMetrics.averageProductivity}%
                </div>
                <div className="text-sm text-gray-600">Avg Productivity</div>
                <div className="text-xs text-purple-600 mt-1">Above target</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-orange-700">
                  {workforceMetrics.attendanceRate}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
                <div className="text-xs text-orange-600 mt-1">Excellent</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-red-700">
                  {workforceMetrics.overtimeUtilization}%
                </div>
                <div className="text-sm text-gray-600">Overtime Usage</div>
                <div className="text-xs text-red-600 mt-1">Within limits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="timesheets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Tracking</TabsTrigger>
            <TabsTrigger value="overtime">Overtime Management</TabsTrigger>
            <TabsTrigger value="labor-costs">Labor Cost Analysis</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Integration</TabsTrigger>
            <TabsTrigger value="analytics">Workforce Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Timesheets Tab */}
          <TabsContent value="timesheets" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Timesheets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                    <Input
                      id="payPeriodStart"
                      type="date"
                      value={filters.pay_period_start || ""}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFilters({ ...filters, pay_period_start: newStart });
                        setSelectedPeriod({
                          ...selectedPeriod,
                          start: newStart,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                    <Input
                      id="payPeriodEnd"
                      type="date"
                      value={filters.pay_period_end || ""}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        setFilters({ ...filters, pay_period_end: newEnd });
                        setSelectedPeriod({ ...selectedPeriod, end: newEnd });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={filters.department || ""}
                      onValueChange={(value) =>
                        setFilters({ ...filters, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        <SelectItem value="Nursing">Nursing</SelectItem>
                        <SelectItem value="Therapy">Therapy</SelectItem>
                        <SelectItem value="Administration">
                          Administration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <Input
                      id="employee"
                      placeholder="Employee ID"
                      value={filters.employee_id || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, employee_id: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleGenerateTimesheet()}
                    disabled={loading || !isOnline}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Generating..." : "Generate Timesheet"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadTimesheets}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timesheets Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Timesheets</CardTitle>
                <CardDescription>
                  {timesheets.length} timesheets found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Worked Hours</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Regular Pay</TableHead>
                        <TableHead>Total Pay</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Loading timesheets...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : timesheets.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-gray-500"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <FileText className="w-8 h-8 text-gray-400" />
                              <span>No timesheets found</span>
                              <span className="text-sm">
                                Try adjusting your filters or generate new
                                timesheets
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        timesheets.map((timesheet) => (
                          <TableRow key={timesheet._id?.toString()}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {timesheet.employee_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {timesheet.role} - {timesheet.department}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {timesheet.pay_period_start} to{" "}
                                {timesheet.pay_period_end}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {timesheet.total_worked_hours}h
                                </div>
                                <div className="text-xs text-gray-500">
                                  of {timesheet.total_scheduled_hours}h
                                  scheduled
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {timesheet.total_overtime_hours}h
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                AED {timesheet.regular_pay.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                AED {timesheet.total_pay.toFixed(2)}
                              </div>
                              {timesheet.overtime_pay > 0 && (
                                <div className="text-xs text-green-600">
                                  +AED {timesheet.overtime_pay.toFixed(2)} OT
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                AED {timesheet.net_pay.toFixed(2)}
                              </div>
                              {timesheet.deductions > 0 && (
                                <div className="text-xs text-red-600">
                                  -AED {timesheet.deductions.toFixed(2)}{" "}
                                  deductions
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getApprovalBadge(timesheet.approval_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {timesheet.approval_status === "submitted" &&
                                  isManager && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveTimesheet(
                                          timesheet._id!.toString(),
                                          timesheet.employee_name,
                                        )
                                      }
                                      disabled={loading || !isOnline}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {loading ? "Approving..." : "Approve"}
                                    </Button>
                                  )}
                                <Button size="sm" variant="outline">
                                  View
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
          </TabsContent>

          {/* Mobile Tracking Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Mobile Time Tracking & Attendance Management
                </h3>
                <p className="text-sm text-gray-600">
                  Real-time mobile attendance tracking with GPS and biometric
                  verification
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile App Settings
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download App
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Active Mobile Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {workforceMetrics.mobileAppUsers}
                  </div>
                  <p className="text-xs text-green-600">
                    {Math.round(
                      (workforceMetrics.mobileAppUsers /
                        workforceMetrics.totalActiveEmployees) *
                        100,
                    )}
                    % of workforce
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    GPS Verified Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">156</div>
                  <p className="text-xs text-blue-600">Today</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Biometric Authentications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">142</div>
                  <p className="text-xs text-purple-600">Secure logins today</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    Offline Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">8</div>
                  <p className="text-xs text-orange-600">Pending sync</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mobile App Features & Usage</CardTitle>
                <CardDescription>
                  Comprehensive mobile time tracking capabilities with advanced
                  features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Core Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">GPS Location Tracking</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            Biometric Authentication
                          </span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Offline Mode Support</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Photo Verification</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Geofencing</span>
                        </div>
                        <Badge
                          variant={
                            mobileTimeTracking.geofencingActive
                              ? "default"
                              : "secondary"
                          }
                        >
                          {mobileTimeTracking.geofencingActive
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Battery Optimization</span>
                        </div>
                        <Badge
                          variant={
                            mobileTimeTracking.batteryOptimizationEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {mobileTimeTracking.batteryOptimizationEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Usage Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Active Users:</span>
                        <span className="font-medium">
                          {mobileTimeTracking.activeUsers}/
                          {workforceMetrics.totalActiveEmployees}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Today's Check-ins:</span>
                        <span className="font-medium text-green-600">
                          {mobileTimeTracking.todayCheckIns}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPS Accuracy Rate:</span>
                        <span className="font-medium text-green-600">
                          {mobileTimeTracking.averageAccuracy}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Biometric Success Rate:</span>
                        <span className="font-medium text-green-600">
                          96.2%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Offline Entries Pending:
                        </span>
                        <span className="font-medium text-orange-600">
                          {mobileTimeTracking.offlineEntriesPending}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPS Verified Entries:</span>
                        <span className="font-medium text-blue-600">
                          {mobileTimeTracking.gpsVerifiedEntries}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Mobile Activity</CardTitle>
                <CardDescription>
                  Latest mobile check-ins and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Sarah Johnson - Check In
                        </div>
                        <div className="text-xs text-gray-600">
                          Patient Home - Al Wasl Road • GPS Verified
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2 min ago</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Ahmed Al Mansouri - Break End
                        </div>
                        <div className="text-xs text-gray-600">
                          Clinic Location • Biometric Verified
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">15 min ago</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Maria Garcia - Offline Sync
                        </div>
                        <div className="text-xs text-gray-600">
                          3 entries synced successfully
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">1 hour ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overtime Tab */}
          <TabsContent value="overtime" className="space-y-6">
            {/* Overtime Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Total Overtime Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {overtimeAnalysis.totalOvertimeHours}h
                  </div>
                  <p className="text-xs text-orange-600">
                    Avg {overtimeAnalysis.averageOvertimePerEmployee}h per
                    employee
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Overtime Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    AED {overtimeAnalysis.overtimeCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600">
                    {overtimeAnalysis.overtimeTrend === "increasing"
                      ? "↗"
                      : "↘"}{" "}
                    {overtimeAnalysis.overtimeTrend}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Cost per Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    AED{" "}
                    {Math.round(
                      overtimeAnalysis.overtimeCost /
                        overtimeAnalysis.totalOvertimeHours,
                    )}
                  </div>
                  <p className="text-xs text-purple-600">1.5x regular rate</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    High OT Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {overtimeAnalysis.topOvertimeEmployees.length}
                  </div>
                  <p className="text-xs text-blue-600">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Overtime Employees */}
            <Card>
              <CardHeader>
                <CardTitle>Top Overtime Employees</CardTitle>
                <CardDescription>
                  Employees with highest overtime hours this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overtimeAnalysis.topOvertimeEmployees.map(
                    (employee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">
                              {employee.hours}h overtime
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-600">
                            AED {employee.cost.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Overtime cost
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overtime Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Overtime Management Actions</CardTitle>
                <CardDescription>
                  Tools to manage and reduce overtime costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <span>Set OT Alerts</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>Schedule Optimization</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6 text-green-600" />
                    <span>OT Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labor Costs Tab */}
          <TabsContent value="labor-costs" className="space-y-6">
            {/* Labor Cost Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Labor Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    AED {laborCostAnalysis.totalLaborCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">This pay period</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Regular Pay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    AED {laborCostAnalysis.regularPayCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600">
                    {Math.round(
                      (laborCostAnalysis.regularPayCost /
                        laborCostAnalysis.totalLaborCost) *
                        100,
                    )}
                    % of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Benefits Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    AED {laborCostAnalysis.benefitsCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600">15% of gross pay</p>
                </CardContent>
              </Card>

              <Card
                className={`border-2 ${laborCostAnalysis.budgetVariance < 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle
                    className={`text-sm font-medium flex items-center gap-2 ${laborCostAnalysis.budgetVariance < 0 ? "text-red-800" : "text-green-800"}`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Budget Variance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${laborCostAnalysis.budgetVariance < 0 ? "text-red-900" : "text-green-900"}`}
                  >
                    {laborCostAnalysis.budgetVariance > 0 ? "+" : ""}
                    {laborCostAnalysis.budgetVariance}%
                  </div>
                  <p
                    className={`text-xs ${laborCostAnalysis.budgetVariance < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {laborCostAnalysis.budgetVariance < 0
                      ? "Over budget"
                      : "Under budget"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Labor Cost Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of labor costs by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="font-medium">Regular Pay</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        AED {laborCostAnalysis.regularPayCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (laborCostAnalysis.regularPayCost /
                            laborCostAnalysis.totalLaborCost) *
                            100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="font-medium">Overtime Pay</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        AED {laborCostAnalysis.overtimeCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (laborCostAnalysis.overtimeCost /
                            laborCostAnalysis.totalLaborCost) *
                            100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="font-medium">Benefits & Insurance</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        AED {laborCostAnalysis.benefitsCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (laborCostAnalysis.benefitsCost /
                            laborCostAnalysis.totalLaborCost) *
                            100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost per Hour Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for labor cost management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      AED {laborCostAnalysis.costPerHour}
                    </div>
                    <div className="text-sm text-gray-600">Cost per Hour</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Including benefits
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      AED{" "}
                      {laborCostAnalysis.projectedMonthlyCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Projected Monthly
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Based on current trend
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div
                      className={`text-2xl font-bold ${laborCostAnalysis.budgetVariance < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {laborCostAnalysis.budgetVariance > 0 ? "+" : ""}
                      {laborCostAnalysis.budgetVariance}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Budget Performance
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      vs. planned budget
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Management Tools</CardTitle>
                <CardDescription>
                  Actions to optimize labor costs and improve efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <span>Cost Forecast</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <span>Budget Alerts</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6 text-green-600" />
                    <span>Cost Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span>Optimize Schedule</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Integration Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Payroll System Integration Capabilities
                </h3>
                <p className="text-sm text-gray-600">
                  Seamless integration with payroll systems and automated
                  processing
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Integration Settings
                </Button>
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Connected</div>
                    <div className="text-xs text-green-600">Real-time sync</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Processed Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">127</div>
                  <p className="text-xs text-blue-600">Payroll entries</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Pending Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {payrollIntegration.pendingTransactions}
                  </div>
                  <p className="text-xs text-orange-600">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    99.8%
                  </div>
                  <p className="text-xs text-purple-600">Processing accuracy</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Features</CardTitle>
                  <CardDescription>
                    Available payroll system capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          Automated Time Calculation
                        </span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          Overtime Rate Calculation
                        </span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          Tax Deduction Processing
                        </span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Benefits Integration</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Compliance Reporting</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Statistics</CardTitle>
                  <CardDescription>
                    Payroll processing performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Processing Time:</span>
                      <span className="font-medium">2.3 seconds</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Transaction Volume:</span>
                      <span className="font-medium">127 entries</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate:</span>
                      <span className="font-medium text-green-600">0.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Uptime:</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Maintenance:</span>
                      <span className="font-medium">3 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Transactions</CardTitle>
                <CardDescription>
                  Latest payroll processing activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">
                          Batch Processing Completed
                        </div>
                        <div className="text-xs text-gray-600">
                          45 employee records processed successfully
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">5 min ago</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">
                          Overtime Calculations Updated
                        </div>
                        <div className="text-xs text-gray-600">
                          Weekly overtime rates recalculated
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">1 hour ago</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium text-sm">
                          Tax Deductions Processed
                        </div>
                        <div className="text-xs text-gray-600">
                          Monthly tax calculations completed
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workforce Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Reporting and Analytics for Workforce Metrics
                </h3>
                <p className="text-sm text-gray-600">
                  Comprehensive workforce analytics and performance insights
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Custom Reports
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Productivity Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {workforceMetrics.averageProductivity}%
                  </div>
                  <Progress
                    value={workforceMetrics.averageProductivity}
                    className="h-1 mt-2"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Above target (85%)
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Attendance Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {workforceMetrics.attendanceRate}%
                  </div>
                  <Progress
                    value={workforceMetrics.attendanceRate}
                    className="h-1 mt-2"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Excellent performance
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Overtime Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {workforceMetrics.overtimeUtilization}%
                  </div>
                  <Progress
                    value={workforceMetrics.overtimeUtilization}
                    className="h-1 mt-2"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    Within limits (15%)
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Mobile Adoption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(
                      (workforceMetrics.mobileAppUsers /
                        workforceMetrics.totalActiveEmployees) *
                        100,
                    )}
                    %
                  </div>
                  <Progress
                    value={
                      (workforceMetrics.mobileAppUsers /
                        workforceMetrics.totalActiveEmployees) *
                      100
                    }
                    className="h-1 mt-2"
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    High adoption rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Key workforce performance indicators over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly Productivity</span>
                        <span className="font-medium text-green-600">
                          +2.3%
                        </span>
                      </div>
                      <Progress value={87.5} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Attendance</span>
                        <span className="font-medium text-green-600">
                          +1.1%
                        </span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overtime Efficiency</span>
                        <span className="font-medium text-blue-600">-0.8%</span>
                      </div>
                      <Progress value={88.7} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Staff Satisfaction</span>
                        <span className="font-medium text-green-600">
                          +3.2%
                        </span>
                      </div>
                      <Progress value={91.4} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>
                    Performance breakdown by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">
                          Clinical Services
                        </div>
                        <div className="text-xs text-gray-600">
                          25 employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          92.3%
                        </div>
                        <div className="text-xs text-gray-500">Performance</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">
                          Rehabilitation
                        </div>
                        <div className="text-xs text-gray-600">
                          12 employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          89.7%
                        </div>
                        <div className="text-xs text-gray-500">Performance</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">
                          Administration
                        </div>
                        <div className="text-xs text-gray-600">8 employees</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600">
                          85.1%
                        </div>
                        <div className="text-xs text-gray-500">Performance</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Hours
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(totals.totalHours * 10) / 10}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.round(totals.totalOvertimeHours * 10) / 10}h overtime
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Payroll
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    AED {Math.round(totals.totalPay * 100) / 100}
                  </div>
                  <p className="text-xs text-muted-foreground">Gross amount</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Payroll
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    AED {Math.round(totals.totalNetPay * 100) / 100}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Timesheets
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timesheets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {
                      timesheets.filter((t) => t.approval_status === "approved")
                        .length
                    }{" "}
                    approved
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown by department and employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timesheets.map((timesheet) => (
                    <div
                      key={timesheet._id?.toString()}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {timesheet.employee_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {timesheet.department} - {timesheet.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          AED {timesheet.net_pay.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {timesheet.total_worked_hours}h worked
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Generate payroll and timesheet reports for management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Payroll Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <span>Attendance Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>Cost Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
