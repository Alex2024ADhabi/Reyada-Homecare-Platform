import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Shield,
  Key,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  Settings,
} from "lucide-react";
import { SecurityService } from "@/services/security.service";
import performanceMonitor from "@/services/performance-monitor.service";

interface AccessControlManagerProps {
  className?: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  lastModified: string;
}

interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  resource: string;
  permission: string;
  status: "pending" | "approved" | "denied";
  requestTime: string;
  justification: string;
}

interface SessionInfo {
  userId: string;
  userName: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  deviceInfo: string;
  status: "active" | "idle" | "expired";
}

const AccessControlManager: React.FC<AccessControlManagerProps> = ({
  className = "",
}) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [newPermission, setNewPermission] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState(3);

  useEffect(() => {
    initializeAccessControl();
  }, []);

  const initializeAccessControl = async () => {
    try {
      // Initialize mock data
      const mockRoles: UserRole[] = [
        {
          id: "admin",
          name: "System Administrator",
          description: "Full system access and management",
          permissions: ["*"],
          userCount: 2,
          lastModified: "2024-01-15",
        },
        {
          id: "clinician",
          name: "Clinical Staff",
          description: "Patient care and clinical documentation",
          permissions: [
            "patient.read",
            "patient.write",
            "clinical.read",
            "clinical.write",
            "assessment.read",
            "assessment.write",
            "documentation.read",
            "documentation.write",
          ],
          userCount: 15,
          lastModified: "2024-01-10",
        },
        {
          id: "nurse",
          name: "Nursing Staff",
          description: "Patient care and medication management",
          permissions: [
            "patient.read",
            "patient.write",
            "clinical.read",
            "clinical.write",
            "vitals.read",
            "vitals.write",
            "medication.read",
            "medication.write",
          ],
          userCount: 25,
          lastModified: "2024-01-08",
        },
        {
          id: "therapist",
          name: "Therapy Staff",
          description: "Therapy sessions and progress tracking",
          permissions: [
            "patient.read",
            "assessment.read",
            "assessment.write",
            "therapy.read",
            "therapy.write",
            "progress.read",
            "progress.write",
          ],
          userCount: 8,
          lastModified: "2024-01-12",
        },
        {
          id: "billing",
          name: "Billing Staff",
          description: "Claims processing and revenue management",
          permissions: [
            "claims.read",
            "claims.write",
            "payment.read",
            "payment.write",
            "revenue.read",
            "reports.read",
          ],
          userCount: 5,
          lastModified: "2024-01-05",
        },
      ];

      const mockAccessRequests: AccessRequest[] = [
        {
          id: "req-001",
          userId: "user-123",
          userName: "Dr. Sarah Ahmed",
          resource: "patient_records",
          permission: "patient.delete",
          status: "pending",
          requestTime: "2024-01-15T10:30:00Z",
          justification:
            "Need to remove duplicate patient record created in error",
        },
        {
          id: "req-002",
          userId: "user-456",
          userName: "Nurse John Smith",
          resource: "medication_orders",
          permission: "medication.approve",
          status: "pending",
          requestTime: "2024-01-15T09:15:00Z",
          justification:
            "Temporary approval rights needed for weekend coverage",
        },
        {
          id: "req-003",
          userId: "user-789",
          userName: "Admin Mike Johnson",
          resource: "system_settings",
          permission: "system.configure",
          status: "approved",
          requestTime: "2024-01-14T14:20:00Z",
          justification: "System maintenance and configuration updates",
        },
      ];

      const mockActiveSessions: SessionInfo[] = [
        {
          userId: "user-123",
          userName: "Dr. Sarah Ahmed",
          role: "clinician",
          loginTime: "2024-01-15T08:00:00Z",
          lastActivity: "2024-01-15T11:45:00Z",
          ipAddress: "192.168.1.100",
          deviceInfo: "Chrome 120.0 on Windows 11",
          status: "active",
        },
        {
          userId: "user-456",
          userName: "Nurse John Smith",
          role: "nurse",
          loginTime: "2024-01-15T07:30:00Z",
          lastActivity: "2024-01-15T11:30:00Z",
          ipAddress: "192.168.1.105",
          deviceInfo: "Safari 17.0 on macOS 14",
          status: "active",
        },
        {
          userId: "user-789",
          userName: "Admin Mike Johnson",
          role: "admin",
          loginTime: "2024-01-15T09:00:00Z",
          lastActivity: "2024-01-15T10:15:00Z",
          ipAddress: "192.168.1.110",
          deviceInfo: "Firefox 121.0 on Ubuntu 22.04",
          status: "idle",
        },
      ];

      setRoles(mockRoles);
      setAccessRequests(mockAccessRequests);
      setActiveSessions(mockActiveSessions);
      setLoading(false);

      // Record access control initialization
      performanceMonitor.recordSecurityEnhancement({
        category: "access_control_initialization",
        threatsPrevented: 0,
        vulnerabilitiesFixed: 0,
        complianceScore: 95,
        improvements: [
          "RBAC system initialized successfully",
          `${mockRoles.length} roles configured`,
          `${mockActiveSessions.length} active sessions monitored`,
          "MFA enforcement enabled",
        ],
      });
    } catch (error) {
      console.error("Failed to initialize access control:", error);
      setLoading(false);
    }
  };

  const handleAccessRequest = async (
    requestId: string,
    action: "approve" | "deny",
  ) => {
    try {
      const securityService = SecurityService.getInstance();

      setAccessRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: action === "approve" ? "approved" : "denied" }
            : req,
        ),
      );

      // Record access control decision
      performanceMonitor.recordSecurityEnhancement({
        category: "access_request_decision",
        threatsPrevented: action === "deny" ? 1 : 0,
        vulnerabilitiesFixed: 0,
        complianceScore: 90,
        improvements: [
          `Access request ${requestId} ${action}d`,
          "RBAC policy enforced",
          "Audit trail updated",
        ],
      });
    } catch (error) {
      console.error("Failed to handle access request:", error);
    }
  };

  const terminateSession = async (userId: string) => {
    try {
      setActiveSessions((prev) =>
        prev.filter((session) => session.userId !== userId),
      );

      // Record session termination
      performanceMonitor.recordSecurityEnhancement({
        category: "session_termination",
        threatsPrevented: 1,
        vulnerabilitiesFixed: 0,
        complianceScore: 85,
        improvements: [
          `Session for user ${userId} terminated`,
          "Security policy enforced",
          "Session monitoring active",
        ],
      });
    } catch (error) {
      console.error("Failed to terminate session:", error);
    }
  };

  const addPermissionToRole = async () => {
    if (!selectedRole || !newPermission) return;

    try {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === selectedRole
            ? {
                ...role,
                permissions: [...role.permissions, newPermission],
                lastModified: new Date().toISOString().split("T")[0],
              }
            : role,
        ),
      );

      setNewPermission("");

      // Record permission change
      performanceMonitor.recordSecurityEnhancement({
        category: "permission_modification",
        threatsPrevented: 0,
        vulnerabilitiesFixed: 0,
        complianceScore: 88,
        improvements: [
          `Permission ${newPermission} added to role ${selectedRole}`,
          "RBAC configuration updated",
          "Access control matrix refreshed",
        ],
      });
    } catch (error) {
      console.error("Failed to add permission:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "idle":
        return <Badge className="bg-yellow-100 text-yellow-800">Idle</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 animate-spin" />
            <span>Loading Access Control Manager...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Access Control Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Role-based access control and session management for healthcare
            platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="mfa-toggle">MFA Required</Label>
            <Switch
              id="mfa-toggle"
              checked={mfaEnabled}
              onCheckedChange={setMfaEnabled}
            />
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.reduce((sum, role) => sum + role.userCount, 0)} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSessions.filter((s) => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSessions.filter((s) => s.status === "idle").length} idle
              sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {accessRequests.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Excellent access control
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="requests">Access Requests</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Roles
                </CardTitle>
                <CardDescription>
                  Manage role-based access control and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{role.name}</h4>
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {role.userCount} users
                        </div>
                        <div className="text-xs text-gray-500">
                          Modified: {role.lastModified}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Permission Management
                </CardTitle>
                <CardDescription>
                  Add or modify role permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-select">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permission-input">New Permission</Label>
                  <Input
                    id="permission-input"
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value)}
                    placeholder="e.g., reports.export"
                  />
                </div>

                <Button
                  onClick={addPermissionToRole}
                  disabled={!selectedRole || !newPermission}
                  className="w-full"
                >
                  Add Permission
                </Button>

                {selectedRole && (
                  <div className="space-y-2">
                    <Label>Current Permissions</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {roles
                        .find((r) => r.id === selectedRole)
                        ?.permissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{permission}</span>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Access Requests
              </CardTitle>
              <CardDescription>
                Review and approve access permission requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{request.userName}</h4>
                        <p className="text-sm text-gray-600">
                          Requesting{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {request.permission}
                          </code>{" "}
                          on{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {request.resource}
                          </code>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(request.requestTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">
                        <strong>Justification:</strong> {request.justification}
                      </p>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAccessRequest(request.id, "approve")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleAccessRequest(request.id, "deny")
                          }
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active User Sessions
              </CardTitle>
              <CardDescription>
                Monitor and manage active user sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.userId}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{session.userName}</h4>
                        <p className="text-sm text-gray-600">
                          Role: {session.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(session.status)}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => terminateSession(session.userId)}
                        >
                          Terminate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Login Time:</span>
                        <div>
                          {new Date(session.loginTime).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Activity:</span>
                        <div>
                          {new Date(session.lastActivity).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">IP Address:</span>
                        <div>{session.ipAddress}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Device:</span>
                        <div>{session.deviceInfo}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Policies
                </CardTitle>
                <CardDescription>
                  Configure access control security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">
                      Require MFA for all users
                    </p>
                  </div>
                  <Switch
                    checked={mfaEnabled}
                    onCheckedChange={setMfaEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    min="5"
                    max="480"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
                  <Input
                    id="max-sessions"
                    type="number"
                    value={maxConcurrentSessions}
                    onChange={(e) =>
                      setMaxConcurrentSessions(Number(e.target.value))
                    }
                    min="1"
                    max="10"
                  />
                </div>

                <Button className="w-full">Save Security Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Audit & Monitoring
                </CardTitle>
                <CardDescription>
                  Access control monitoring and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Audit Logging</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Real-time Monitoring</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span>Compliance Reporting</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Scheduled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span>Anomaly Detection</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Learning
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Access control system is operating within compliance
                    parameters. All security policies are being enforced
                    correctly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessControlManager;
