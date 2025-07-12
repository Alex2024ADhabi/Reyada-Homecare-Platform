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
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Star,
  Target,
  Brain,
  Zap,
  RefreshCw,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { DOHStaffCredentials } from "@/types/doh-compliance";
import { Settings, Shield } from "lucide-react";

interface StaffMember {
  _id?: string;
  employee_id: string;
  personal_info: {
    first_name: string;
    last_name: string;
    emirates_id: string;
    nationality: string;
    date_of_birth: string;
    gender: "male" | "female";
    phone: string;
    email: string;
  };
  employment_info: {
    position: string;
    department: string;
    employment_type: "full-time" | "part-time" | "contract";
    start_date: string;
    end_date?: string;
    salary: number;
    status: "active" | "inactive" | "terminated" | "on_leave";
  };
  doh_license: {
    license_number: string;
    license_type: string;
    issue_date: string;
    expiry_date: string;
    status: "active" | "expired" | "suspended";
  };
  qualifications: {
    degree: string;
    institution: string;
    graduation_year: number;
    certifications: {
      name: string;
      issuing_body: string;
      issue_date: string;
      expiry_date?: string;
      certificate_number: string;
    }[];
  };
  competencies: {
    [skill: string]: {
      level: number;
      last_assessed: string;
      target_level: number;
    };
  };
  performance_metrics: {
    overall_rating: number;
    last_evaluation_date: string;
    goals: {
      description: string;
      target_date: string;
      status: "pending" | "in_progress" | "completed";
      achievement_score?: number;
    }[];
  };
  training_records: {
    course_name: string;
    provider: string;
    completion_date: string;
    hours: number;
    certificate_number: string;
    expiry_date?: string;
  }[];
  wellness_metrics: {
    satisfaction_score: number;
    stress_level: "low" | "medium" | "high";
    work_life_balance: number;
    last_survey_date: string;
  };
  background_check: {
    status: "pending" | "in_progress" | "completed" | "failed";
    completed_date?: string;
    verification_level: "basic" | "enhanced" | "dbs";
    expiry_date?: string;
    notes?: string;
  };
  mobile_access: {
    device_registered: boolean;
    last_login?: string;
    app_version?: string;
    biometric_enabled: boolean;
  };
  self_service_portal: {
    account_active: boolean;
    last_access?: string;
    pending_requests: number;
    completed_trainings: number;
  };
  created_at: string;
  updated_at: string;
}

interface StaffLifecycleManagerProps {
  userId?: string;
  userRole?: string;
}

export default function StaffLifecycleManager({
  userId = "HR001",
  userRole = "hr_manager",
}: StaffLifecycleManagerProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTerminationDialog, setShowTerminationDialog] = useState(false);
  const [showBackgroundCheckDialog, setShowBackgroundCheckDialog] =
    useState(false);
  const [showMobileSetupDialog, setShowMobileSetupDialog] = useState(false);
  const [showStaffPortalDialog, setShowStaffPortalDialog] = useState(false);
  const [selectedStaffForPortal, setSelectedStaffForPortal] =
    useState<StaffMember | null>(null);
  const [dohIntegrationStatus, setDohIntegrationStatus] = useState({
    connected: true,
    lastSync: new Date().toISOString(),
    pendingVerifications: 2,
    autoRenewalEnabled: true,
  });
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    license_status: "",
    search: "",
  });
  const { isOnline, saveFormData } = useOfflineSync();

  // Mock data for demonstration
  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      // Mock staff data
      const mockStaff: StaffMember[] = [
        {
          _id: "STAFF001",
          employee_id: "EMP001",
          personal_info: {
            first_name: "Sarah",
            last_name: "Johnson",
            emirates_id: "784-1990-1234567-8",
            nationality: "American",
            date_of_birth: "1990-05-15",
            gender: "female",
            phone: "+971-50-123-4567",
            email: "sarah.johnson@reyada.ae",
          },
          employment_info: {
            position: "Registered Nurse",
            department: "Clinical Services",
            employment_type: "full-time",
            start_date: "2022-01-15",
            salary: 12000,
            status: "active",
          },
          doh_license: {
            license_number: "DOH-RN-2022-001234",
            license_type: "Registered Nurse",
            issue_date: "2022-01-01",
            expiry_date: "2025-01-01",
            status: "active",
          },
          qualifications: {
            degree: "Bachelor of Science in Nursing",
            institution: "University of California",
            graduation_year: 2015,
            certifications: [
              {
                name: "Advanced Cardiac Life Support",
                issuing_body: "American Heart Association",
                issue_date: "2023-01-15",
                expiry_date: "2025-01-15",
                certificate_number: "ACLS-2023-001",
              },
            ],
          },
          competencies: {
            "Clinical Assessment": {
              level: 85,
              last_assessed: "2024-01-15",
              target_level: 90,
            },
            "Patient Communication": {
              level: 92,
              last_assessed: "2024-01-15",
              target_level: 95,
            },
            "Wound Care": {
              level: 78,
              last_assessed: "2024-01-15",
              target_level: 85,
            },
          },
          performance_metrics: {
            overall_rating: 4.2,
            last_evaluation_date: "2024-01-15",
            goals: [
              {
                description: "Complete Advanced Wound Care Certification",
                target_date: "2024-06-30",
                status: "in_progress",
                achievement_score: 65,
              },
            ],
          },
          training_records: [
            {
              course_name: "Infection Control in Home Care",
              provider: "DOH Training Institute",
              completion_date: "2024-01-20",
              hours: 8,
              certificate_number: "IC-2024-001",
              expiry_date: "2026-01-20",
            },
          ],
          wellness_metrics: {
            satisfaction_score: 8.5,
            stress_level: "medium",
            work_life_balance: 7.8,
            last_survey_date: "2024-01-01",
          },
          background_check: {
            status: "completed",
            completed_date: "2022-01-10",
            verification_level: "enhanced",
            expiry_date: "2025-01-10",
            notes: "All checks passed successfully",
          },
          mobile_access: {
            device_registered: true,
            last_login: "2024-01-15T09:30:00Z",
            app_version: "2.1.0",
            biometric_enabled: true,
          },
          self_service_portal: {
            account_active: true,
            last_access: "2024-01-15T08:45:00Z",
            pending_requests: 1,
            completed_trainings: 12,
          },
          created_at: "2022-01-15T08:00:00Z",
          updated_at: "2024-01-15T10:30:00Z",
        },
        {
          _id: "STAFF002",
          employee_id: "EMP002",
          personal_info: {
            first_name: "Ahmed",
            last_name: "Al Mansouri",
            emirates_id: "784-1985-7654321-2",
            nationality: "Emirati",
            date_of_birth: "1985-08-22",
            gender: "male",
            phone: "+971-50-987-6543",
            email: "ahmed.almansouri@reyada.ae",
          },
          employment_info: {
            position: "Physical Therapist",
            department: "Rehabilitation Services",
            employment_type: "full-time",
            start_date: "2021-03-01",
            salary: 14000,
            status: "active",
          },
          doh_license: {
            license_number: "DOH-PT-2021-005678",
            license_type: "Physical Therapist",
            issue_date: "2021-02-15",
            expiry_date: "2024-02-15",
            status: "expired",
          },
          qualifications: {
            degree: "Doctor of Physical Therapy",
            institution: "UAE University",
            graduation_year: 2010,
            certifications: [
              {
                name: "Orthopedic Manual Therapy",
                issuing_body:
                  "International Federation of Orthopaedic Manipulative Physical Therapists",
                issue_date: "2022-06-01",
                expiry_date: "2025-06-01",
                certificate_number: "IFOMPT-2022-078",
              },
            ],
          },
          competencies: {
            "Manual Therapy": {
              level: 95,
              last_assessed: "2024-01-10",
              target_level: 95,
            },
            "Exercise Prescription": {
              level: 88,
              last_assessed: "2024-01-10",
              target_level: 90,
            },
            "Patient Education": {
              level: 82,
              last_assessed: "2024-01-10",
              target_level: 85,
            },
          },
          performance_metrics: {
            overall_rating: 4.6,
            last_evaluation_date: "2024-01-10",
            goals: [
              {
                description: "Renew DOH License",
                target_date: "2024-03-01",
                status: "pending",
              },
            ],
          },
          training_records: [
            {
              course_name: "Geriatric Rehabilitation",
              provider: "Emirates Health Academy",
              completion_date: "2023-11-15",
              hours: 16,
              certificate_number: "GR-2023-045",
            },
          ],
          wellness_metrics: {
            satisfaction_score: 9.2,
            stress_level: "low",
            work_life_balance: 8.8,
            last_survey_date: "2024-01-01",
          },
          background_check: {
            status: "completed",
            completed_date: "2021-02-25",
            verification_level: "enhanced",
            expiry_date: "2024-02-25",
            notes: "Renewal required soon",
          },
          mobile_access: {
            device_registered: true,
            last_login: "2024-01-10T14:15:00Z",
            app_version: "2.0.8",
            biometric_enabled: false,
          },
          self_service_portal: {
            account_active: true,
            last_access: "2024-01-10T13:20:00Z",
            pending_requests: 0,
            completed_trainings: 18,
          },
          created_at: "2021-03-01T09:00:00Z",
          updated_at: "2024-01-10T14:20:00Z",
        },
      ];
      setStaffMembers(mockStaff);
    } catch (error) {
      console.error("Error loading staff data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      inactive: "secondary",
      terminated: "destructive",
      on_leave: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getLicenseStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      expired: "destructive",
      suspended: "secondary",
    };
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      expired: <XCircle className="w-3 h-3" />,
      suspended: <AlertTriangle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCompetencyColor = (level: number, target: number) => {
    if (level >= target) return "text-green-600";
    if (level >= target * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredStaff = staffMembers.filter((staff) => {
    if (
      filters.department &&
      staff.employment_info.department !== filters.department
    )
      return false;
    if (filters.status && staff.employment_info.status !== filters.status)
      return false;
    if (
      filters.license_status &&
      staff.doh_license.status !== filters.license_status
    )
      return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName =
        `${staff.personal_info.first_name} ${staff.personal_info.last_name}`.toLowerCase();
      if (
        !fullName.includes(searchLower) &&
        !staff.employee_id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const calculateOverallStats = () => {
    const total = staffMembers.length;
    const active = staffMembers.filter(
      (s) => s.employment_info.status === "active",
    ).length;
    const expiredLicenses = staffMembers.filter(
      (s) => s.doh_license.status === "expired",
    ).length;
    const avgPerformance =
      staffMembers.reduce(
        (sum, s) => sum + s.performance_metrics.overall_rating,
        0,
      ) / total;
    const avgSatisfaction =
      staffMembers.reduce(
        (sum, s) => sum + s.wellness_metrics.satisfaction_score,
        0,
      ) / total;

    return {
      total,
      active,
      expiredLicenses,
      avgPerformance: Math.round(avgPerformance * 10) / 10,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Lifecycle Management
            </h1>
            <p className="text-gray-600 mt-1">
              Complete staff management from recruitment to termination
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Offline Mode
              </Badge>
            )}
            <Button onClick={loadStaffData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Active Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.active}
              </div>
              <p className="text-xs text-green-600">
                {Math.round((stats.active / stats.total) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Expired Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {stats.expiredLicenses}
              </div>
              <p className="text-xs text-red-600">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Avg Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stats.avgPerformance}/5
              </div>
              <Progress
                value={(stats.avgPerformance / 5) * 100}
                className="h-1 mt-2"
              />
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {stats.avgSatisfaction}/10
              </div>
              <Progress
                value={(stats.avgSatisfaction / 10) * 100}
                className="h-1 mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* DOH Integration Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              DOH Licensing System Integration
            </CardTitle>
            <CardDescription>
              Real-time license verification and automated renewal tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-green-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                </div>
                <div className="text-sm text-gray-600">System Status</div>
                <div className="text-xs text-green-600 mt-1">
                  {dohIntegrationStatus.connected
                    ? "Connected"
                    : "Disconnected"}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-700">
                  {dohIntegrationStatus.pendingVerifications}
                </div>
                <div className="text-sm text-gray-600">
                  Pending Verifications
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Require attention
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-purple-700">
                  {new Date(dohIntegrationStatus.lastSync).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Sync</div>
                <div className="text-xs text-gray-500 mt-1">
                  Automatic sync enabled
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-lg font-bold">
                  <Badge
                    variant={
                      dohIntegrationStatus.autoRenewalEnabled
                        ? "default"
                        : "secondary"
                    }
                  >
                    {dohIntegrationStatus.autoRenewalEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">Auto Renewal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="licenses">DOH Licenses</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="background">Background Checks</TabsTrigger>
            <TabsTrigger value="mobile">Mobile & Portal</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or ID"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-8"
                    />
                  </div>
                  <Select
                    value={filters.department}
                    onValueChange={(value) =>
                      setFilters({ ...filters, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      <SelectItem value="Clinical Services">
                        Clinical Services
                      </SelectItem>
                      <SelectItem value="Rehabilitation Services">
                        Rehabilitation Services
                      </SelectItem>
                      <SelectItem value="Administration">
                        Administration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.license_status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, license_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="License Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Licenses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  {filteredStaff.length} staff members found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Employment Status</TableHead>
                        <TableHead>DOH License</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Loading staff data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredStaff.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            No staff members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStaff.map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {staff.personal_info.first_name}{" "}
                                  {staff.personal_info.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {staff.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {staff.employment_info.position}
                            </TableCell>
                            <TableCell>
                              {staff.employment_info.department}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(staff.employment_info.status)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {getLicenseStatusBadge(
                                  staff.doh_license.status,
                                )}
                                <div className="text-xs text-gray-500">
                                  Expires: {staff.doh_license.expiry_date}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium">
                                  {staff.performance_metrics.overall_rating}/5
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i <
                                        Math.floor(
                                          staff.performance_metrics
                                            .overall_rating,
                                        )
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedStaff(staff)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
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

          {/* DOH Licenses Tab */}
          <TabsContent value="licenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  DOH License Verification & Tracking
                </CardTitle>
                <CardDescription>
                  Monitor license status and expiration dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {staff.personal_info.first_name}{" "}
                            {staff.personal_info.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {staff.employment_info.position}
                          </p>
                        </div>
                        {getLicenseStatusBadge(staff.doh_license.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">License Number:</span>
                          <p>{staff.doh_license.license_number}</p>
                        </div>
                        <div>
                          <span className="font-medium">License Type:</span>
                          <p>{staff.doh_license.license_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Expiry Date:</span>
                          <p
                            className={
                              staff.doh_license.status === "expired"
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {staff.doh_license.expiry_date}
                          </p>
                        </div>
                      </div>
                      {staff.doh_license.status === "expired" && (
                        <Alert className="mt-3 bg-red-50 border-red-200">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="text-red-800">
                            License Expired
                          </AlertTitle>
                          <AlertDescription className="text-red-700">
                            This staff member's DOH license has expired and
                            requires immediate renewal.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Competency Assessment & Skill Gap Analysis
                </CardTitle>
                <CardDescription>
                  Track skill levels and identify training needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-medium">
                          {staff.personal_info.first_name}{" "}
                          {staff.personal_info.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {staff.employment_info.position}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(staff.competencies).map(
                          ([skill, data]) => (
                            <div key={skill} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  {skill}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-sm ${getCompetencyColor(data.level, data.target_level)}`}
                                  >
                                    {data.level}%
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Target: {data.target_level}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Progress
                                  value={data.level}
                                  className="flex-1 h-2"
                                />
                                <div
                                  className="w-1 bg-gray-300 rounded"
                                  style={{
                                    marginLeft: `${data.target_level}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Last assessed: {data.last_assessed}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Performance Evaluation & Rating Systems
                </CardTitle>
                <CardDescription>
                  Track performance metrics and goal achievement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">
                            {staff.personal_info.first_name}{" "}
                            {staff.personal_info.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {staff.employment_info.position}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {staff.performance_metrics.overall_rating}/5
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i <
                                  Math.floor(
                                    staff.performance_metrics.overall_rating,
                                  )
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">Last Evaluation:</span>
                          <span className="ml-2">
                            {staff.performance_metrics.last_evaluation_date}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Current Goals:</h5>
                          <div className="space-y-2">
                            {staff.performance_metrics.goals.map(
                              (goal, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-3 rounded"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {goal.description}
                                    </span>
                                    <Badge
                                      variant={
                                        goal.status === "completed"
                                          ? "default"
                                          : goal.status === "in_progress"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {goal.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Target Date: {goal.target_date}
                                  </div>
                                  {goal.achievement_score && (
                                    <div className="mt-2">
                                      <Progress
                                        value={goal.achievement_score}
                                        className="h-1"
                                      />
                                      <div className="text-xs text-gray-500 mt-1">
                                        Progress: {goal.achievement_score}%
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Training Program Management & Certification Tracking
                </CardTitle>
                <CardDescription>
                  Monitor training completion and certification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-medium">
                          {staff.personal_info.first_name}{" "}
                          {staff.personal_info.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {staff.employment_info.position}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Recent Training:</h5>
                          <div className="space-y-2">
                            {staff.training_records.map((training, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm">
                                      {training.course_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {training.provider} • {training.hours}{" "}
                                      hours
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm">
                                      {training.completion_date}
                                    </div>
                                    {training.expiry_date && (
                                      <div className="text-xs text-gray-500">
                                        Expires: {training.expiry_date}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Certifications:</h5>
                          <div className="space-y-2">
                            {staff.qualifications.certifications.map(
                              (cert, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-50 p-3 rounded border border-blue-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-sm">
                                        {cert.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {cert.issuing_body} •{" "}
                                        {cert.certificate_number}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm">
                                        {cert.issue_date}
                                      </div>
                                      {cert.expiry_date && (
                                        <div className="text-xs text-gray-500">
                                          Expires: {cert.expiry_date}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-6">
            {/* Wellness Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    High Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {
                      staffMembers.filter(
                        (s) => s.wellness_metrics.satisfaction_score >= 8,
                      ).length
                    }
                  </div>
                  <p className="text-xs text-green-600">Score ≥ 8/10</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    At Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">
                    {
                      staffMembers.filter(
                        (s) =>
                          s.wellness_metrics.satisfaction_score < 6 ||
                          s.wellness_metrics.stress_level === "high",
                      ).length
                    }
                  </div>
                  <p className="text-xs text-yellow-600">Need attention</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Work-Life Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {Math.round(
                      (staffMembers.reduce(
                        (sum, s) => sum + s.wellness_metrics.work_life_balance,
                        0,
                      ) /
                        staffMembers.length) *
                        10,
                    ) / 10}
                    /10
                  </div>
                  <p className="text-xs text-blue-600">Average score</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    High Stress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {
                      staffMembers.filter(
                        (s) => s.wellness_metrics.stress_level === "high",
                      ).length
                    }
                  </div>
                  <p className="text-xs text-red-600">Require support</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Staff Wellness & Satisfaction Monitoring
                </CardTitle>
                <CardDescription>
                  Track employee wellbeing and job satisfaction with actionable
                  insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-medium">
                          {staff.personal_info.first_name}{" "}
                          {staff.personal_info.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {staff.employment_info.position}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded border border-green-200">
                          <div className="text-2xl font-bold text-green-700">
                            {staff.wellness_metrics.satisfaction_score}/10
                          </div>
                          <div className="text-sm text-green-600">
                            Job Satisfaction
                          </div>
                          <Progress
                            value={
                              (staff.wellness_metrics.satisfaction_score / 10) *
                              100
                            }
                            className="h-2 mt-2"
                          />
                          {staff.wellness_metrics.satisfaction_score < 6 && (
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              ⚠ Requires attention
                            </div>
                          )}
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
                          <div className="text-2xl font-bold text-blue-700">
                            {staff.wellness_metrics.work_life_balance}/10
                          </div>
                          <div className="text-sm text-blue-600">
                            Work-Life Balance
                          </div>
                          <Progress
                            value={
                              (staff.wellness_metrics.work_life_balance / 10) *
                              100
                            }
                            className="h-2 mt-2"
                          />
                          {staff.wellness_metrics.work_life_balance < 6 && (
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              ⚠ Needs improvement
                            </div>
                          )}
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded border border-orange-200">
                          <Badge
                            variant={
                              staff.wellness_metrics.stress_level === "low"
                                ? "default"
                                : staff.wellness_metrics.stress_level ===
                                    "medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="mb-2"
                          >
                            {staff.wellness_metrics.stress_level.toUpperCase()}
                          </Badge>
                          <div className="text-sm text-orange-600">
                            Stress Level
                          </div>
                          {staff.wellness_metrics.stress_level === "high" && (
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              🚨 Immediate support needed
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        Last survey: {staff.wellness_metrics.last_survey_date}
                      </div>
                      {/* Wellness Action Items */}
                      <div className="mt-4 p-3 bg-gray-50 rounded border">
                        <h6 className="font-medium text-sm mb-2">
                          Wellness Action Items:
                        </h6>
                        <div className="space-y-1 text-xs">
                          {staff.wellness_metrics.satisfaction_score < 7 && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              Schedule one-on-one meeting to discuss job
                              satisfaction
                            </div>
                          )}
                          {staff.wellness_metrics.work_life_balance < 7 && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Clock className="w-3 h-3" />
                              Review workload and schedule flexibility options
                            </div>
                          )}
                          {staff.wellness_metrics.stress_level === "high" && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              Provide stress management resources and support
                            </div>
                          )}
                          {staff.wellness_metrics.satisfaction_score >= 8 &&
                            staff.wellness_metrics.work_life_balance >= 8 &&
                            staff.wellness_metrics.stress_level === "low" && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                Employee wellness is excellent - consider for
                                mentoring role
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Last survey: {staff.wellness_metrics.last_survey_date}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            Send Survey
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            Schedule Check-in
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Checks Tab */}
          <TabsContent value="background" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Automated Background Check & Verification Workflows
                </h3>
                <p className="text-sm text-gray-600">
                  Comprehensive background verification and compliance tracking
                </p>
              </div>
              <Button onClick={() => setShowBackgroundCheckDialog(true)}>
                <UserCheck className="w-4 h-4 mr-2" />
                Initiate Background Check
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Completed Checks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {
                      staffMembers.filter(
                        (s) => s.background_check?.status === "completed",
                      ).length
                    }
                  </div>
                  <p className="text-xs text-green-600">
                    All verifications passed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">
                    {
                      staffMembers.filter(
                        (s) => s.background_check?.status === "in_progress",
                      ).length
                    }
                  </div>
                  <p className="text-xs text-yellow-600">Awaiting results</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {
                      staffMembers.filter(
                        (s) => s.background_check?.status === "pending",
                      ).length
                    }
                  </div>
                  <p className="text-xs text-orange-600">
                    Need to be initiated
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">1</div>
                  <p className="text-xs text-red-600">Require renewal</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Background Check Status</CardTitle>
                <CardDescription>
                  Comprehensive verification workflow tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {staff.personal_info.first_name}{" "}
                            {staff.personal_info.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {staff.employment_info.position}
                          </p>
                        </div>
                        <Badge
                          variant={
                            staff.background_check?.status === "completed"
                              ? "default"
                              : staff.background_check?.status === "in_progress"
                                ? "secondary"
                                : staff.background_check?.status === "failed"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {staff.background_check?.status || "Not Started"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">
                            Verification Level:
                          </span>
                          <p>
                            {staff.background_check?.verification_level ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Completed Date:</span>
                          <p>
                            {staff.background_check?.completed_date || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Expiry Date:</span>
                          <p
                            className={
                              staff.background_check?.expiry_date &&
                              new Date(staff.background_check.expiry_date) <
                                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {staff.background_check?.expiry_date || "N/A"}
                          </p>
                        </div>
                      </div>

                      {staff.background_check?.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Notes:</span>{" "}
                          {staff.background_check.notes}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStaffForPortal(staff);
                            setShowStaffPortalDialog(true);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Configure Access
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset Password
                        </Button>
                        {staff.self_service_portal?.pending_requests &&
                          staff.self_service_portal.pending_requests > 0 && (
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View Requests (
                              {staff.self_service_portal.pending_requests})
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile & Portal Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Mobile Time Tracking & Staff Portal
                </h3>
                <p className="text-sm text-gray-600">
                  Mobile app functionality and self-service portal management
                </p>
              </div>
              <Button onClick={() => setShowMobileSetupDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Setup Mobile Access
              </Button>
              <Button
                onClick={() => setShowStaffPortalDialog(true)}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Staff Portal Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Mobile Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {
                      staffMembers.filter(
                        (s) => s.mobile_access?.device_registered,
                      ).length
                    }
                  </div>
                  <p className="text-xs text-blue-600">Devices registered</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Active Portals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {
                      staffMembers.filter(
                        (s) => s.self_service_portal?.account_active,
                      ).length
                    }
                  </div>
                  <p className="text-xs text-green-600">
                    Self-service accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Biometric Enabled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {
                      staffMembers.filter(
                        (s) => s.mobile_access?.biometric_enabled,
                      ).length
                    }
                  </div>
                  <p className="text-xs text-purple-600">Enhanced security</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Pending Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {staffMembers.reduce(
                      (sum, s) =>
                        sum + (s.self_service_portal?.pending_requests || 0),
                      0,
                    )}
                  </div>
                  <p className="text-xs text-orange-600">Require attention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mobile & Portal Access Status</CardTitle>
                <CardDescription>
                  Staff mobile app and self-service portal management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {staff.personal_info.first_name}{" "}
                            {staff.personal_info.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {staff.employment_info.position}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              staff.mobile_access?.device_registered
                                ? "default"
                                : "secondary"
                            }
                          >
                            {staff.mobile_access?.device_registered
                              ? "Mobile Active"
                              : "No Mobile"}
                          </Badge>
                          <Badge
                            variant={
                              staff.self_service_portal?.account_active
                                ? "default"
                                : "secondary"
                            }
                          >
                            {staff.self_service_portal?.account_active
                              ? "Portal Active"
                              : "No Portal"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">Mobile Access</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Device Registered:</span>
                              <span
                                className={
                                  staff.mobile_access?.device_registered
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }
                              >
                                {staff.mobile_access?.device_registered
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Login:</span>
                              <span>
                                {staff.mobile_access?.last_login
                                  ? new Date(
                                      staff.mobile_access.last_login,
                                    ).toLocaleDateString()
                                  : "Never"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>App Version:</span>
                              <span>
                                {staff.mobile_access?.app_version || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Biometric:</span>
                              <span
                                className={
                                  staff.mobile_access?.biometric_enabled
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }
                              >
                                {staff.mobile_access?.biometric_enabled
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">
                            Self-Service Portal
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Account Status:</span>
                              <span
                                className={
                                  staff.self_service_portal?.account_active
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }
                              >
                                {staff.self_service_portal?.account_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Access:</span>
                              <span>
                                {staff.self_service_portal?.last_access
                                  ? new Date(
                                      staff.self_service_portal.last_access,
                                    ).toLocaleDateString()
                                  : "Never"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pending Requests:</span>
                              <span
                                className={
                                  staff.self_service_portal?.pending_requests
                                    ? "text-orange-600"
                                    : "text-gray-500"
                                }
                              >
                                {staff.self_service_portal?.pending_requests ||
                                  0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed Trainings:</span>
                              <span className="text-blue-600">
                                {staff.self_service_portal
                                  ?.completed_trainings || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure Access
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset Password
                        </Button>
                        {staff.self_service_portal?.pending_requests &&
                          staff.self_service_portal.pending_requests > 0 && (
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View Requests (
                              {staff.self_service_portal.pending_requests})
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Staff Detail Dialog */}
        {selectedStaff && (
          <Dialog
            open={!!selectedStaff}
            onOpenChange={() => setSelectedStaff(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedStaff.personal_info.first_name}{" "}
                  {selectedStaff.personal_info.last_name}
                </DialogTitle>
                <DialogDescription>
                  {selectedStaff.employment_info.position} -{" "}
                  {selectedStaff.employee_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-medium mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Emirates ID:</span>
                      <p>{selectedStaff.personal_info.emirates_id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Nationality:</span>
                      <p>{selectedStaff.personal_info.nationality}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <p>{selectedStaff.personal_info.date_of_birth}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span>
                      <p>{selectedStaff.personal_info.gender}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{selectedStaff.personal_info.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p>{selectedStaff.personal_info.email}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h4 className="font-medium mb-3">Employment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p>{selectedStaff.employment_info.start_date}</p>
                    </div>
                    <div>
                      <span className="font-medium">Employment Type:</span>
                      <p>{selectedStaff.employment_info.employment_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span>
                      <p>
                        AED{" "}
                        {selectedStaff.employment_info.salary.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div>
                        {getStatusBadge(selectedStaff.employment_info.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h4 className="font-medium mb-3">Qualifications</h4>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium">Degree:</span>
                      <p>{selectedStaff.qualifications.degree}</p>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Institution:</span>
                      <p>{selectedStaff.qualifications.institution}</p>
                    </div>
                    <div>
                      <span className="font-medium">Graduation Year:</span>
                      <p>{selectedStaff.qualifications.graduation_year}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStaff(null)}
                >
                  Close
                </Button>
                <Button>Edit Staff Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Staff Portal Configuration Dialog */}
        <Dialog
          open={showStaffPortalDialog}
          onOpenChange={setShowStaffPortalDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Staff Portal Configuration
              </DialogTitle>
              <DialogDescription>
                {selectedStaffForPortal
                  ? `Configure portal access for ${selectedStaffForPortal.personal_info.first_name} ${selectedStaffForPortal.personal_info.last_name}`
                  : "Configure staff portal settings and permissions"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Portal Features */}
              <div>
                <h4 className="font-medium mb-3">Available Portal Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Personal Information Management
                      </span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Timesheet Submission</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Leave Request Management</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Training Course Access</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Performance Dashboard</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Document Repository Access
                      </span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div>
                <h4 className="font-medium mb-3">Security & Access Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Two-Factor Authentication</span>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Session Timeout</span>
                    </div>
                    <Badge variant="outline">30 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Audit Logging</span>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </div>

              {/* Portal Usage Statistics */}
              {selectedStaffForPortal && (
                <div>
                  <h4 className="font-medium mb-3">Usage Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedStaffForPortal.self_service_portal
                          ?.completed_trainings || 0}
                      </div>
                      <div className="text-xs text-gray-600">
                        Completed Trainings
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-orange-600">
                        {selectedStaffForPortal.self_service_portal
                          ?.pending_requests || 0}
                      </div>
                      <div className="text-xs text-gray-600">
                        Pending Requests
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowStaffPortalDialog(false);
                  setSelectedStaffForPortal(null);
                }}
              >
                Close
              </Button>
              <Button>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
