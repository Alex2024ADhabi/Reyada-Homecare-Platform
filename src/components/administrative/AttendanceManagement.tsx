import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Fingerprint,
  Navigation,
  Activity,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  attendanceManagementService,
  type StaffMember,
  type AttendanceMetrics,
} from "@/services/attendance-management.service";
import { websocketService } from "@/services/websocket.service";
import { errorHandlerService } from "@/services/error-handler.service";

interface AttendanceManagementProps {
  organizationId?: string;
  onStaffSelect?: (staff: StaffMember) => void;
  className?: string;
}

export default function AttendanceManagement({
  organizationId = "default-org",
  onStaffSelect,
  className = "",
}: AttendanceManagementProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [metrics, setMetrics] = useState<AttendanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState<
    string | null
  >(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load attendance data
  const loadAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (roleFilter !== "all") filters.role = roleFilter;

      const data = await attendanceManagementService.getStaffAttendanceData({
        organizationId,
        filters,
      });

      setStaffMembers(data.staffMembers);
      setMetrics(data.metrics);
      setLastUpdate(new Date());
    } catch (err) {
      const error = errorHandlerService.handleError(err, {
        context: "AttendanceManagement.loadAttendanceData",
        organizationId,
        filters: { statusFilter, roleFilter },
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, statusFilter, roleFilter]);

  // Handle staff authentication
  const handleAuthentication = async (staffId: string) => {
    try {
      setIsAuthenticating(staffId);
      setError(null);

      const result =
        await attendanceManagementService.authenticateStaff(staffId);

      if (result.success) {
        // Update staff member in the list
        setStaffMembers((prev) =>
          prev.map((staff) =>
            staff.id === staffId
              ? {
                  ...staff,
                  biometricAuth: {
                    lastAuth: result.timestamp,
                    authScore: result.authScore,
                    method: result.method,
                  },
                }
              : staff,
          ),
        );
      }

      // Show result message
      setError(result.success ? null : result.message);
    } catch (err) {
      errorHandlerService.handleError(err, {
        context: "AttendanceManagement.handleAuthentication",
        staffId,
      });
      setError("Authentication failed");
    } finally {
      setIsAuthenticating(null);
    }
  };

  // Handle location validation
  const handleLocationValidation = async (staffId: string) => {
    try {
      setIsValidatingLocation(staffId);
      setError(null);

      const result =
        await attendanceManagementService.validateStaffLocation(staffId);

      // Update staff member location validation status
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff.id === staffId
            ? {
                ...staff,
                location: {
                  ...staff.location,
                  validated: result.isValid,
                  compliance: result.compliance,
                },
              }
            : staff,
        ),
      );

      if (!result.isValid) {
        setError(result.message);
      }
    } catch (err) {
      errorHandlerService.handleError(err, {
        context: "AttendanceManagement.handleLocationValidation",
        staffId,
      });
      setError("Location validation failed");
    } finally {
      setIsValidatingLocation(null);
    }
  };

  // Filter staff members
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: React.ReactNode }> = {
      on_duty: {
        variant: "default",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      off_duty: { variant: "secondary", icon: <XCircle className="w-3 h-3" /> },
      break: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
      emergency: {
        variant: "destructive",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      traveling: {
        variant: "outline",
        icon: <Navigation className="w-3 h-3" />,
      },
    };

    const config = variants[status] || variants.off_duty;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  // WebSocket event handlers
  useEffect(() => {
    const handleAttendanceUpdate = (data: any) => {
      setStaffMembers(data.staffMembers);
      setMetrics(data.metrics);
      setLastUpdate(new Date());
    };

    const handleLocationUpdate = (data: any) => {
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff.id === data.staffId
            ? { ...staff, location: { ...staff.location, ...data.location } }
            : staff,
        ),
      );
    };

    const handleBiometricResult = (data: any) => {
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff.id === data.staffId
            ? { ...staff, biometricAuth: data.result }
            : staff,
        ),
      );
    };

    websocketService.on("attendance-data-update", handleAttendanceUpdate);
    websocketService.on("location-validation", handleLocationUpdate);
    websocketService.on("biometric-auth-result", handleBiometricResult);

    return () => {
      websocketService.off("attendance-data-update", handleAttendanceUpdate);
      websocketService.off("location-validation", handleLocationUpdate);
      websocketService.off("biometric-auth-result", handleBiometricResult);
    };
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    loadAttendanceData();

    // Set up periodic refresh
    const interval = setInterval(loadAttendanceData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [loadAttendanceData]);

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h2>
          <p className="text-gray-600">
            Real-time staff attendance and location tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            onClick={loadAttendanceData}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold">{metrics.totalStaff}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.activeStaff}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On-Time Arrivals</p>
                  <p className="text-2xl font-bold">
                    {metrics.onTimeArrivals}%
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Biometric Compliance</p>
                  <p className="text-2xl font-bold">
                    {metrics.biometricCompliance}%
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search staff by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_duty">On Duty</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
                <SelectItem value="break">On Break</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="traveling">Traveling</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No staff members found matching your criteria
            </p>
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <Card
              key={staff.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStaff?.id === staff.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => {
                setSelectedStaff(staff);
                onStaffSelect?.(staff);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{staff.name}</CardTitle>
                  {getStatusBadge(staff.status)}
                </div>
                <p className="text-sm text-gray-600 capitalize">{staff.role}</p>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{staff.location.address}</span>
                  <Badge
                    variant={
                      staff.location.validated ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {staff.location.validated ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                {/* Biometric Auth */}
                <div className="flex items-center gap-2 text-sm">
                  <Fingerprint className="w-4 h-4 text-gray-400" />
                  <span>Auth Score: {staff.biometricAuth.authScore}%</span>
                  <Badge variant="outline" className="text-xs">
                    {staff.biometricAuth.method}
                  </Badge>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{staff.schedule.shift}</span>
                </div>

                {/* Current Patient */}
                {staff.currentPatient && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <p className="font-medium">Current Visit:</p>
                    <p className="text-gray-600">{staff.currentPatient.name}</p>
                    <p className="text-xs text-gray-500">
                      ETA: {staff.currentPatient.eta}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuthentication(staff.id);
                    }}
                    disabled={isAuthenticating === staff.id}
                  >
                    {isAuthenticating === staff.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Fingerprint className="w-3 h-3" />
                    )}
                    Auth
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationValidation(staff.id);
                    }}
                    disabled={isValidatingLocation === staff.id}
                  >
                    {isValidatingLocation === staff.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    Validate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
