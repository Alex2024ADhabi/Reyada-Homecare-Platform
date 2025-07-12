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
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Smartphone,
  Fingerprint,
  Camera,
  Wifi,
  WifiOff,
  Navigation,
  Car,
  Truck,
  Route,
  Fuel,
  Settings,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  getAttendanceRecords,
  clockIn,
  clockOut,
  getAttendanceAnalytics,
  StaffAttendance,
  AttendanceFilters,
} from "@/api/attendance.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface AttendanceTrackerProps {
  employeeId?: string;
  isManager?: boolean;
}

export default function AttendanceTracker({
  employeeId = "EMP001",
  isManager = true,
}: AttendanceTrackerProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendance[]>(
    [],
  );
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [clockInLocation, setClockInLocation] = useState("");
  const [clockInNotes, setClockInNotes] = useState("");
  const [filters, setFilters] = useState<AttendanceFilters>({
    date_from: new Date().toISOString().split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
  });
  const [todaysRecord, setTodaysRecord] = useState<StaffAttendance | null>(
    null,
  );
  const [emergencyStaffing, setEmergencyStaffing] = useState({
    onCallStaff: 8,
    availableForEmergency: 12,
    currentEmergencies: 2,
    averageResponseTime: 15, // minutes
    emergencyProtocols: [
      {
        level: 1,
        description: "Critical - Life threatening",
        responseTime: 15,
      },
      { level: 2, description: "Urgent - Serious condition", responseTime: 30 },
      { level: 3, description: "Standard - Non-urgent", responseTime: 120 },
    ],
    recentEmergencies: [
      {
        id: "EMR-001",
        type: "Respiratory Distress",
        level: 1,
        patient: "John Doe",
        responder: "Sarah Johnson",
        responseTime: 12,
        status: "Resolved",
      },
    ],
  });
  const [trueInFeatures, setTrueInFeatures] = useState({
    biometricEnabled: true,
    gpsTracking: true,
    realTimeSync: true,
    offlineCapable: true,
    faceRecognition: false,
    voiceRecognition: false,
    geofencing: true,
    smartScheduling: true,
  });
  const [locationData, setLocationData] = useState({
    currentLocation: "Dubai Healthcare City",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    accuracy: "High (±3m)",
    altitude: 12.5,
    speed: 0,
    heading: 0,
    lastUpdate: new Date().toLocaleTimeString(),
    isInsideGeofence: true,
    nearbyStaff: 5,
    geofenceRadius: 100, // meters
    locationHistory: [],
    batteryOptimized: true,
    highAccuracyMode: true,
  });
  const [biometricData, setBiometricData] = useState({
    fingerprintEnabled: true,
    faceIdEnabled: true,
    voiceRecognitionEnabled: false,
    irisRecognitionEnabled: false,
    lastBiometricAuth: new Date().toLocaleTimeString(),
    authenticationScore: 98.5,
    failedAttempts: 0,
    biometricTemplate: "encrypted_template_hash",
    multiFactorEnabled: true,
    livelinessDetection: true,
    antiSpoofingEnabled: true,
  });
  const [schedulingOptimization, setSchedulingOptimization] = useState({
    optimizedShifts: 24,
    constraintViolations: 2,
    efficiencyGain: 18,
    costSavings: 12500,
    aiRecommendations: [
      "Reduce travel time by 23% with optimized routing",
      "Balance workload across team members",
      "Minimize overtime costs through better planning",
    ],
    predictiveInsights: {
      demandForecast: "High demand expected next week",
      staffingGaps: 3,
      recommendedHires: 2,
    },
  });
  const { isOnline, saveFormData } = useOfflineSync();

  useEffect(() => {
    loadAttendanceData();
    loadAnalytics();
    checkTodaysRecord();
  }, [filters]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const records = await getAttendanceRecords(filters);
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getAttendanceAnalytics({
        department: filters.department,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const checkTodaysRecord = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const records = await getAttendanceRecords({
        employee_id: employeeId,
        date_from: today,
        date_to: today,
      });
      setTodaysRecord(records.length > 0 ? records[0] : null);
    } catch (error) {
      console.error("Error checking today's record:", error);
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const record = await clockIn(employeeId, clockInLocation, clockInNotes);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("attendance", {
          type: "clock_in",
          employee_id: employeeId,
          location: clockInLocation,
          notes: clockInNotes,
          timestamp: new Date().toISOString(),
        });
      }

      setTodaysRecord(record);
      setClockInLocation("");
      setClockInNotes("");
      await loadAttendanceData();
    } catch (error) {
      console.error("Error clocking in:", error);
      alert(error instanceof Error ? error.message : "Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const record = await clockOut(employeeId, clockInNotes);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("attendance", {
          type: "clock_out",
          employee_id: employeeId,
          notes: clockInNotes,
          timestamp: new Date().toISOString(),
        });
      }

      setTodaysRecord(record);
      setClockInNotes("");
      await loadAttendanceData();
    } catch (error) {
      console.error("Error clocking out:", error);
      alert(error instanceof Error ? error.message : "Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      half_day: "outline",
      sick_leave: "secondary",
      vacation: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getApprovalBadge = (approval: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[approval] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[approval as keyof typeof icons]}
        {approval}
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
              Attendance Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage staff attendance with real-time monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline Mode
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="clock" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
            <TabsTrigger value="truein">TrueIn Features</TabsTrigger>
            <TabsTrigger value="cartrack">CarTrack Fleet</TabsTrigger>
            <TabsTrigger value="scheduling">Smart Scheduling</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Staffing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Clock In/Out Tab */}
          <TabsContent value="clock" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clock In/Out Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Clock
                  </CardTitle>
                  <CardDescription>
                    Clock in and out for your shift
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {!todaysRecord?.actual_start ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={clockInLocation}
                          onChange={(e) => setClockInLocation(e.target.value)}
                          placeholder="Enter your location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          value={clockInNotes}
                          onChange={(e) => setClockInNotes(e.target.value)}
                          placeholder="Any additional notes"
                        />
                      </div>
                      <Button
                        onClick={handleClockIn}
                        disabled={loading || !clockInLocation}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? "Clocking In..." : "Clock In"}
                      </Button>
                    </div>
                  ) : !todaysRecord?.actual_end ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          Clocked in at {todaysRecord.actual_start}
                        </div>
                        <div className="text-xs text-green-600">
                          Location: {todaysRecord.location}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="clockOutNotes">Notes (Optional)</Label>
                        <Input
                          id="clockOutNotes"
                          value={clockInNotes}
                          onChange={(e) => setClockInNotes(e.target.value)}
                          placeholder="Any additional notes"
                        />
                      </div>
                      <Button
                        onClick={handleClockOut}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                        variant="destructive"
                      >
                        {loading ? "Clocking Out..." : "Clock Out"}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Shift Complete
                      </div>
                      <div className="text-xs text-blue-600">
                        {todaysRecord.actual_start} - {todaysRecord.actual_end}
                      </div>
                      <div className="text-xs text-blue-600">
                        Total Hours: {todaysRecord.total_hours}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysRecord ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        {getStatusBadge(todaysRecord.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Shift:</span>
                        <span className="font-medium">
                          {todaysRecord.shift}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Scheduled:
                        </span>
                        <span className="font-medium">
                          {todaysRecord.scheduled_start} -{" "}
                          {todaysRecord.scheduled_end}
                        </span>
                      </div>
                      {todaysRecord.actual_start && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Actual:</span>
                          <span className="font-medium">
                            {todaysRecord.actual_start}
                            {todaysRecord.actual_end &&
                              ` - ${todaysRecord.actual_end}`}
                          </span>
                        </div>
                      )}
                      {todaysRecord.late_arrival && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Late by:
                          </span>
                          <Badge variant="secondary">
                            {todaysRecord.late_minutes} minutes
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Approval:</span>
                        {getApprovalBadge(todaysRecord.supervisor_approval)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No attendance record for today
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Records Tab */}
          <TabsContent value="records" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">From Date</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.date_from || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, date_from: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">To Date</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.date_to || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, date_to: e.target.value })
                      }
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status || ""}
                      onValueChange={(value) =>
                        setFilters({ ...filters, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="sick_leave">Sick Leave</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  {attendanceRecords.length} records found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approval</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-4 text-gray-500"
                          >
                            No records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((record) => (
                          <TableRow key={record._id?.toString()}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {record.employee_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.role}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.shift}</TableCell>
                            <TableCell>
                              {record.scheduled_start} - {record.scheduled_end}
                            </TableCell>
                            <TableCell>
                              {record.actual_start || "--"}
                              {record.actual_end && ` - ${record.actual_end}`}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{record.total_hours}h</div>
                                {record.overtime_hours > 0 && (
                                  <div className="text-xs text-orange-600">
                                    +{record.overtime_hours}h OT
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status)}
                            </TableCell>
                            <TableCell>
                              {getApprovalBadge(record.supervisor_approval)}
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

          {/* TrueIn Features Tab */}
          <TabsContent value="truein" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  TrueIn Advanced Attendance Features
                </CardTitle>
                <CardDescription>
                  Biometric authentication, GPS tracking, and real-time
                  synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        Biometric Auth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {biometricData.authenticationScore}%
                      </div>
                      <p className="text-xs text-green-600">Success Rate</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        GPS Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">
                        {locationData.accuracy}
                      </div>
                      <p className="text-xs text-blue-600">Location Accuracy</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                        {isOnline ? (
                          <Wifi className="w-4 h-4" />
                        ) : (
                          <WifiOff className="w-4 h-4" />
                        )}
                        Real-Time Sync
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        {isOnline ? "Online" : "Offline"}
                      </div>
                      <p className="text-xs text-purple-600">
                        Connection Status
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Nearby Staff
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">
                        {locationData.nearbyStaff}
                      </div>
                      <p className="text-xs text-orange-600">Within 1km</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Fingerprint className="w-5 h-5" />
                        Biometric Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fingerprint Scanner:</span>
                        <Badge
                          variant={
                            biometricData.fingerprintEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {biometricData.fingerprintEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Face Recognition:</span>
                        <Badge
                          variant={
                            biometricData.faceIdEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {biometricData.faceIdEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Voice Recognition:</span>
                        <Badge
                          variant={
                            biometricData.voiceRecognitionEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {biometricData.voiceRecognitionEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Anti-Spoofing:</span>
                        <Badge
                          variant={
                            biometricData.antiSpoofingEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {biometricData.antiSpoofingEnabled
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Multi-Factor Auth:</span>
                        <Badge
                          variant={
                            biometricData.multiFactorEnabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {biometricData.multiFactorEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Test Biometric Auth
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Location & Geofencing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Current Location:</span>
                        <span className="text-sm font-medium">
                          {locationData.currentLocation}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GPS Accuracy:</span>
                        <Badge variant="default">{locationData.accuracy}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inside Geofence:</span>
                        <Badge
                          variant={
                            locationData.isInsideGeofence
                              ? "default"
                              : "destructive"
                          }
                        >
                          {locationData.isInsideGeofence ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Update:</span>
                        <span className="text-sm font-medium">
                          {locationData.lastUpdate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Coordinates:</span>
                        <span className="text-xs font-mono">
                          {locationData.coordinates.lat.toFixed(4)},{" "}
                          {locationData.coordinates.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Altitude:</span>
                        <span className="text-sm font-medium">
                          {locationData.altitude}m
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Geofence Radius:</span>
                        <span className="text-sm font-medium">
                          {locationData.geofenceRadius}m
                        </span>
                      </div>
                      <Button className="w-full" variant="outline">
                        <MapPin className="w-4 h-4 mr-2" />
                        Update Location
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>TrueIn Feature Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="biometric"
                          checked={trueInFeatures.biometricEnabled}
                          onChange={(e) =>
                            setTrueInFeatures({
                              ...trueInFeatures,
                              biometricEnabled: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="biometric" className="text-sm">
                          Biometric Auth
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="gps"
                          checked={trueInFeatures.gpsTracking}
                          onChange={(e) =>
                            setTrueInFeatures({
                              ...trueInFeatures,
                              gpsTracking: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="gps" className="text-sm">
                          GPS Tracking
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="realtime"
                          checked={trueInFeatures.realTimeSync}
                          onChange={(e) =>
                            setTrueInFeatures({
                              ...trueInFeatures,
                              realTimeSync: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="realtime" className="text-sm">
                          Real-Time Sync
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="geofencing"
                          checked={trueInFeatures.geofencing}
                          onChange={(e) =>
                            setTrueInFeatures({
                              ...trueInFeatures,
                              geofencing: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="geofencing" className="text-sm">
                          Geofencing
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CarTrack Fleet Management Tab */}
          <TabsContent value="cartrack" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  CarTrack Fleet Management & Asset Tracking
                </CardTitle>
                <CardDescription>
                  Real-time vehicle tracking, route optimization, and asset
                  management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Active Vehicles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">12</div>
                      <p className="text-xs text-blue-600">Out of 15 total</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <Route className="w-4 h-4" />
                        Routes Optimized
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">8</div>
                      <p className="text-xs text-green-600">Today</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                        <Fuel className="w-4 h-4" />
                        Fuel Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">
                        8.5L
                      </div>
                      <p className="text-xs text-orange-600">Per 100km avg</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Maintenance Due
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        3
                      </div>
                      <p className="text-xs text-purple-600">Vehicles</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Vehicle Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">Vehicle HC-001</div>
                              <div className="text-sm text-gray-600">
                                Driver: Ahmed Al Mansouri
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">En Route</Badge>
                            <div className="text-xs text-gray-600 mt-1">
                              ETA: 15 min
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium">Vehicle HC-002</div>
                              <div className="text-sm text-gray-600">
                                Driver: Sarah Johnson
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">Parked</Badge>
                            <div className="text-xs text-gray-600 mt-1">
                              Dubai Mall
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="font-medium">Vehicle HC-003</div>
                              <div className="text-sm text-gray-600">
                                Driver: Maria Garcia
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">Maintenance</Badge>
                            <div className="text-xs text-gray-600 mt-1">
                              Service Center
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Fleet Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Distance Today:</span>
                          <span className="font-medium">1,247 km</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Speed:</span>
                          <span className="font-medium">45 km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fuel Consumption:</span>
                          <span className="font-medium">106 L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Driver Score:</span>
                          <Badge variant="default">92/100</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Route Efficiency:</span>
                          <span className="font-medium text-green-600">
                            +12%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cost Savings:</span>
                          <span className="font-medium text-green-600">
                            AED 2,340
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Vehicle Management Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                      >
                        <Route className="w-6 h-6" />
                        <span className="text-sm">Optimize Routes</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                      >
                        <Settings className="w-6 h-6" />
                        <span className="text-sm">Schedule Maintenance</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                      >
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-sm">View Reports</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                      >
                        <Shield className="w-6 h-6" />
                        <span className="text-sm">Security Alerts</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Staff Scheduling Optimization with Constraint Management
                </CardTitle>
                <CardDescription>
                  AI-powered scheduling with constraint management and
                  optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">
                        Optimized Shifts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">
                        {schedulingOptimization.optimizedShifts}
                      </div>
                      <p className="text-xs text-blue-600">This week</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">
                        Efficiency Gain
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {schedulingOptimization.efficiencyGain}%
                      </div>
                      <p className="text-xs text-green-600">
                        vs manual scheduling
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-800">
                        Constraint Violations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">
                        {schedulingOptimization.constraintViolations}
                      </div>
                      <p className="text-xs text-orange-600">
                        Require attention
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Cost Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        AED{" "}
                        {schedulingOptimization.costSavings.toLocaleString()}
                      </div>
                      <p className="text-xs text-purple-600">Monthly savings</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Scheduling Constraints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Maximum consecutive days:
                            </span>
                            <Badge variant="outline">7 days</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Minimum rest between shifts:
                            </span>
                            <Badge variant="outline">12 hours</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Maximum overtime per week:
                            </span>
                            <Badge variant="outline">16 hours</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Skill-based matching:
                            </span>
                            <Badge variant="default">Enabled</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Geographic optimization:
                            </span>
                            <Badge variant="default">Enabled</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Optimization Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Travel time reduction:
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              -23%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Overtime reduction:</span>
                            <span className="text-sm font-medium text-green-600">
                              -18%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Staff satisfaction:</span>
                            <span className="text-sm font-medium text-blue-600">
                              +15%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Patient coverage:</span>
                            <span className="text-sm font-medium text-blue-600">
                              98.5%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Skill match accuracy:
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              94.2%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Schedule Optimization</CardTitle>
                      <CardDescription>
                        AI-generated optimal schedule for next week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Staff Member</TableHead>
                              <TableHead>Monday</TableHead>
                              <TableHead>Tuesday</TableHead>
                              <TableHead>Wednesday</TableHead>
                              <TableHead>Thursday</TableHead>
                              <TableHead>Friday</TableHead>
                              <TableHead>Saturday</TableHead>
                              <TableHead>Sunday</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                Sarah Johnson
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Off</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">Evening</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Off</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Ahmed Al Mansouri
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">Evening</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Off</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">Evening</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Morning</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Off</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-optimize
                        </Button>
                        <Button>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Staffing Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency Staffing Protocols & On-Call Management
                </CardTitle>
                <CardDescription>
                  Manage emergency staffing and on-call schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-800">
                        Current Emergencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-900">
                        {emergencyStaffing.currentEmergencies}
                      </div>
                      <p className="text-xs text-red-600">Active cases</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">
                        On-Call Staff
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">
                        {emergencyStaffing.onCallStaff}
                      </div>
                      <p className="text-xs text-blue-600">Available now</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">
                        Emergency Available
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {emergencyStaffing.availableForEmergency}
                      </div>
                      <p className="text-xs text-green-600">Can be called in</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Avg Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        {emergencyStaffing.averageResponseTime}m
                      </div>
                      <p className="text-xs text-purple-600">Last 30 days</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>On-Call Schedule</CardTitle>
                      <CardDescription>
                        Current on-call staff assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Staff Member</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>On-Call Period</TableHead>
                              <TableHead>Specialization</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                Dr. Sarah Ahmed
                              </TableCell>
                              <TableCell>Senior Nurse</TableCell>
                              <TableCell>
                                Today 18:00 - Tomorrow 08:00
                              </TableCell>
                              <TableCell>Critical Care</TableCell>
                              <TableCell>+971-50-123-4567</TableCell>
                              <TableCell>
                                <Badge variant="default">Available</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Ahmed Al Mansouri
                              </TableCell>
                              <TableCell>Physical Therapist</TableCell>
                              <TableCell>Tomorrow 08:00 - 18:00</TableCell>
                              <TableCell>Rehabilitation</TableCell>
                              <TableCell>+971-50-987-6543</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Scheduled</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Maria Garcia
                              </TableCell>
                              <TableCell>Occupational Therapist</TableCell>
                              <TableCell>Weekend Coverage</TableCell>
                              <TableCell>Pediatric Care</TableCell>
                              <TableCell>+971-50-555-0123</TableCell>
                              <TableCell>
                                <Badge variant="outline">Backup</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Emergency Response Protocols</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-1">
                              Level 1 - Critical
                            </div>
                            <div className="text-xs text-gray-600">
                              Life-threatening situations requiring immediate
                              response
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Response time: &lt; 15 minutes
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-1">
                              Level 2 - Urgent
                            </div>
                            <div className="text-xs text-gray-600">
                              Serious conditions requiring prompt attention
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Response time: &lt; 30 minutes
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-1">
                              Level 3 - Standard
                            </div>
                            <div className="text-xs text-gray-600">
                              Non-urgent situations requiring same-day response
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Response time: &lt; 2 hours
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Emergency Calls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-sm">
                                Critical - Respiratory Distress
                              </div>
                              <Badge variant="destructive">Level 1</Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              Patient: John Doe • Responded by: Sarah Johnson
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Response time: 12 minutes • Status: Resolved
                            </div>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-sm">
                                Urgent - Medication Issue
                              </div>
                              <Badge variant="secondary">Level 2</Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              Patient: Jane Smith • Responded by: Ahmed Al
                              Mansouri
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Response time: 25 minutes • Status: Resolved
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-sm">
                                Standard - Equipment Request
                              </div>
                              <Badge variant="outline">Level 3</Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              Patient: Bob Wilson • Responded by: Maria Garcia
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Response time: 1.5 hours • Status: Completed
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Records
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_records}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Attendance Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.attendance_rate)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Punctuality Rate
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.punctuality_rate)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Hours
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.average_hours * 10) / 10}h
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Generate attendance reports for payroll and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <span>Daily Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>Weekly Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Users className="w-6 h-6" />
                    <span>Monthly Report</span>
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
