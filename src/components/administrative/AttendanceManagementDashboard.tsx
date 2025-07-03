import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  Fingerprint,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import AttendanceManagement from "./AttendanceManagement";
import { attendanceManagementService } from "@/services/attendance-management.service";

interface AttendanceAnalytics {
  dailyAttendance: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
  weeklyTrends: {
    week: string;
    averageHours: number;
    overtime: number;
    efficiency: number;
  }[];
  departmentBreakdown: {
    department: string;
    totalStaff: number;
    activeStaff: number;
    attendanceRate: number;
  }[];
  biometricStats: {
    totalAuthentications: number;
    successRate: number;
    failureReasons: {
      reason: string;
      count: number;
    }[];
  };
}

interface AttendanceManagementDashboardProps {
  organizationId?: string;
}

export default function AttendanceManagementDashboard({
  organizationId = "RHHCS",
}: AttendanceManagementDashboardProps) {
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>({
    dailyAttendance: [
      { date: "2024-01-15", present: 22, absent: 2, late: 1 },
      { date: "2024-01-16", present: 23, absent: 1, late: 0 },
      { date: "2024-01-17", present: 21, absent: 3, late: 2 },
      { date: "2024-01-18", present: 24, absent: 0, late: 1 },
      { date: "2024-01-19", present: 22, absent: 2, late: 0 },
    ],
    weeklyTrends: [
      { week: "Week 1", averageHours: 8.2, overtime: 2.1, efficiency: 94.5 },
      { week: "Week 2", averageHours: 8.4, overtime: 2.8, efficiency: 96.2 },
      { week: "Week 3", averageHours: 8.1, overtime: 1.9, efficiency: 93.8 },
      { week: "Week 4", averageHours: 8.3, overtime: 2.4, efficiency: 95.1 },
    ],
    departmentBreakdown: [
      {
        department: "Nursing",
        totalStaff: 12,
        activeStaff: 10,
        attendanceRate: 95.2,
      },
      {
        department: "Therapy",
        totalStaff: 8,
        activeStaff: 7,
        attendanceRate: 92.8,
      },
      {
        department: "Administration",
        totalStaff: 4,
        activeStaff: 4,
        attendanceRate: 98.5,
      },
    ],
    biometricStats: {
      totalAuthentications: 1247,
      successRate: 98.2,
      failureReasons: [
        { reason: "Poor fingerprint quality", count: 12 },
        { reason: "Device malfunction", count: 8 },
        { reason: "Network timeout", count: 5 },
      ],
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [organizationId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await attendanceManagementService.getAttendanceAnalytics({
        organizationId,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
      });
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Attendance Management Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive attendance tracking and workforce analytics
            </p>
          </div>
        </div>

        <Tabs defaultValue="live-attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="live-attendance">Live Attendance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="biometric-auth">Biometric Auth</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Live Attendance Tab */}
          <TabsContent value="live-attendance">
            <AttendanceManagement organizationId={organizationId} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Attendance Trends
                  </CardTitle>
                  <CardDescription>
                    Attendance patterns over the last 5 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.dailyAttendance.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{day.date}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            Present: {day.present}
                          </span>
                          <span className="text-red-600">
                            Absent: {day.absent}
                          </span>
                          <span className="text-yellow-600">
                            Late: {day.late}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Work hours and efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.weeklyTrends.map((week, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{week.week}</span>
                          <span className="text-sm text-gray-500">
                            Efficiency: {week.efficiency}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Avg Hours:</span>
                            <span className="ml-2 font-medium">
                              {week.averageHours}h
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Overtime:</span>
                            <span className="ml-2 font-medium">
                              {week.overtime}h
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Department Attendance Breakdown
                </CardTitle>
                <CardDescription>
                  Attendance rates by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.departmentBreakdown.map((dept, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{dept.department}</span>
                        <span className="text-sm text-green-600">
                          {dept.attendanceRate}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {dept.activeStaff}/{dept.totalStaff} staff active
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Biometric Authentication Tab */}
          <TabsContent value="biometric-auth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5" />
                    Biometric Authentication Stats
                  </CardTitle>
                  <CardDescription>
                    Authentication performance and reliability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.biometricStats.totalAuthentications}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Authentications
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.biometricStats.successRate}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Authentication Failure Analysis
                  </CardTitle>
                  <CardDescription>
                    Common reasons for authentication failures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.biometricStats.failureReasons.map(
                      (reason, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="text-sm">{reason.reason}</span>
                          <span className="font-medium text-red-600">
                            {reason.count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Management
                </CardTitle>
                <CardDescription>
                  Staff scheduling and shift management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Advanced scheduling features</p>
                  <p className="text-sm">
                    Shift planning, time-off management, and schedule
                    optimization
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compliance Monitoring
                </CardTitle>
                <CardDescription>
                  DOH compliance and regulatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Compliance tracking and reporting</p>
                  <p className="text-sm">
                    DOH standards, audit trails, and regulatory compliance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Attendance Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive attendance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Comprehensive reporting suite</p>
                  <p className="text-sm">
                    Custom reports, data export, and analytics dashboards
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
