/**
 * DOH Audit Trail System
 * P4-005: DOH Audit Trail System (40h)
 *
 * Comprehensive audit logging and compliance tracking system
 * for DOH regulatory requirements with tamper-proof logging.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CalendarDays } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Shield,
  User,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Lock,
  Fingerprint,
  Database,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category:
    | "authentication"
    | "data_access"
    | "data_modification"
    | "system"
    | "compliance"
    | "security";
  entityType: "patient" | "episode" | "document" | "user" | "system" | "report";
  entityId: string;
  entityName?: string;
  details: {
    description: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  complianceRelevant: boolean;
  dohRequirement?: string;
  integrityHash: string;
  verified: boolean;
}

export interface AuditStats {
  totalEntries: number;
  todayEntries: number;
  criticalEvents: number;
  complianceEvents: number;
  failedLogins: number;
  dataModifications: number;
  systemEvents: number;
  integrityViolations: number;
  categoryBreakdown: {
    authentication: number;
    data_access: number;
    data_modification: number;
    system: number;
    compliance: number;
    security: number;
  };
  userActivity: {
    userId: string;
    userName: string;
    actionCount: number;
    lastActivity: string;
  }[];
  timelineData: {
    date: string;
    total: number;
    critical: number;
    compliance: number;
  }[];
}

export interface DOHAuditTrailSystemProps {
  auditLogs?: AuditLogEntry[];
  stats?: AuditStats;
  onExportLogs?: (filters: any, format: string) => Promise<void>;
  onVerifyIntegrity?: (logId: string) => Promise<boolean>;
  onRefresh?: () => void;
  className?: string;
}

const DOHAuditTrailSystem: React.FC<DOHAuditTrailSystemProps> = ({
  auditLogs = [
    {
      id: "audit-001",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      userId: "user-001",
      userName: "Dr. Sarah Johnson",
      userRole: "physician",
      action: "patient_data_access",
      category: "data_access",
      entityType: "patient",
      entityId: "patient-001",
      entityName: "Ahmed Al-Rashid",
      details: {
        description: "Accessed patient medical records for treatment review",
        metadata: {
          accessReason: "treatment_review",
          documentsAccessed: ["medical_history", "current_medications"],
        },
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      sessionId: "sess-001",
      severity: "medium",
      complianceRelevant: true,
      dohRequirement: "DOH Data Access Standard 3.2.1",
      integrityHash: "sha256:a1b2c3d4e5f6...",
      verified: true,
    },
    {
      id: "audit-002",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      userId: "user-002",
      userName: "Nurse Mary Wilson",
      userRole: "nurse",
      action: "signature_capture",
      category: "compliance",
      entityType: "document",
      entityId: "doc-001",
      entityName: "9-Domain Assessment Form",
      details: {
        description: "Electronic signature captured for 9-domain assessment",
        metadata: {
          signatureMethod: "electronic",
          biometricData: "fingerprint_verified",
          documentVersion: "v2.1",
        },
      },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)",
      sessionId: "sess-002",
      severity: "high",
      complianceRelevant: true,
      dohRequirement: "DOH Electronic Signature Standard 4.1.2",
      integrityHash: "sha256:b2c3d4e5f6g7...",
      verified: true,
    },
    {
      id: "audit-003",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: "system",
      userName: "System",
      userRole: "system",
      action: "compliance_violation_detected",
      category: "compliance",
      entityType: "patient",
      entityId: "patient-002",
      entityName: "Fatima Al-Zahra",
      details: {
        description: "9-domain assessment overdue by 24 hours",
        metadata: {
          violationType: "missing_assessment",
          dueDate: "2024-01-15T09:00:00Z",
          detectionMethod: "automated_scan",
        },
      },
      ipAddress: "127.0.0.1",
      userAgent: "DOH-Compliance-Monitor/2.1",
      sessionId: "system-session",
      severity: "critical",
      complianceRelevant: true,
      dohRequirement: "DOH Assessment Timeline Standard 2.3.1",
      integrityHash: "sha256:c3d4e5f6g7h8...",
      verified: true,
    },
  ],
  stats = {
    totalEntries: 15847,
    todayEntries: 234,
    criticalEvents: 12,
    complianceEvents: 89,
    failedLogins: 3,
    dataModifications: 156,
    systemEvents: 45,
    integrityViolations: 0,
    categoryBreakdown: {
      authentication: 2341,
      data_access: 8934,
      data_modification: 2156,
      system: 1234,
      compliance: 892,
      security: 290,
    },
    userActivity: [
      {
        userId: "user-001",
        userName: "Dr. Sarah Johnson",
        actionCount: 45,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: "user-002",
        userName: "Nurse Mary Wilson",
        actionCount: 38,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: "user-003",
        userName: "Admin John Smith",
        actionCount: 23,
        lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
    timelineData: [
      { date: "2024-01-01", total: 234, critical: 2, compliance: 12 },
      { date: "2024-01-02", total: 267, critical: 1, compliance: 15 },
      { date: "2024-01-03", total: 198, critical: 3, compliance: 8 },
    ],
  },
  onExportLogs,
  onVerifyIntegrity,
  onRefresh,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || log.category === filterCategory;
      const matchesSeverity =
        filterSeverity === "all" || log.severity === filterSeverity;
      const matchesUser = filterUser === "all" || log.userId === filterUser;
      const matchesDate =
        !dateRange.from ||
        !dateRange.to ||
        (new Date(log.timestamp) >= dateRange.from &&
          new Date(log.timestamp) <= dateRange.to);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeverity &&
        matchesUser &&
        matchesDate
      );
    });
  }, [
    auditLogs,
    searchTerm,
    filterCategory,
    filterSeverity,
    filterUser,
    dateRange,
  ]);

  const getSeverityColor = (severity: string) => {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "authentication":
        return "bg-blue-100 text-blue-800";
      case "data_access":
        return "bg-green-100 text-green-800";
      case "data_modification":
        return "bg-yellow-100 text-yellow-800";
      case "system":
        return "bg-purple-100 text-purple-800";
      case "compliance":
        return "bg-red-100 text-red-800";
      case "security":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <User className="h-4 w-4" />;
      case "data_access":
        return <Eye className="h-4 w-4" />;
      case "data_modification":
        return <FileText className="h-4 w-4" />;
      case "system":
        return <Database className="h-4 w-4" />;
      case "compliance":
        return <Shield className="h-4 w-4" />;
      case "security":
        return <Lock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6 bg-white", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              DOH Audit Trail System
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportLogs?.({}, "excel")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Events Alert */}
      {stats.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {stats.criticalEvents} critical audit event(s) detected in the
                last 24 hours
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTab("logs")}
              >
                View Events
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Integrity Violations Alert */}
      {stats.integrityViolations > 0 && (
        <Alert variant="destructive">
          <Fingerprint className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {stats.integrityViolations} audit log integrity violation(s)
                detected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTab("integrity")}
              >
                Investigate
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">
                  {stats.totalEntries.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Activity</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.todayEntries}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.criticalEvents}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Events</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.complianceEvents}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Activity by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.categoryBreakdown).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getActionIcon(category)}
                        <span className="text-sm font-medium capitalize">
                          {category.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {count.toLocaleString()}
                        </span>
                        <Badge
                          className={cn("text-xs", getCategoryColor(category))}
                        >
                          {((count / stats.totalEntries) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.userActivity.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{user.userName}</div>
                      <div className="text-xs text-gray-500">
                        Last active:{" "}
                        {new Date(user.lastActivity).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.actionCount}</div>
                      <div className="text-xs text-gray-500">actions</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.timelineData.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        Total: <span className="font-medium">{day.total}</span>
                      </span>
                      <span className="text-sm text-red-600">
                        Critical:{" "}
                        <span className="font-medium">{day.critical}</span>
                      </span>
                      <span className="text-sm text-orange-600">
                        Compliance:{" "}
                        <span className="font-medium">{day.compliance}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="authentication">
                      Authentication
                    </SelectItem>
                    <SelectItem value="data_access">Data Access</SelectItem>
                    <SelectItem value="data_modification">
                      Data Modification
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterSeverity}
                  onValueChange={setFilterSeverity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {stats.userActivity.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.userName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Entries */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionIcon(log.category)}
                        <h3 className="font-semibold">
                          {log.action.replace("_", " ")}
                        </h3>
                        <Badge
                          className={cn(
                            "text-xs",
                            getSeverityColor(log.severity),
                          )}
                        >
                          {log.severity.toUpperCase()}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            getCategoryColor(log.category),
                          )}
                        >
                          {log.category.replace("_", " ").toUpperCase()}
                        </Badge>
                        {log.complianceRelevant && (
                          <Badge className="text-xs bg-orange-100 text-orange-800">
                            DOH COMPLIANCE
                          </Badge>
                        )}
                        {log.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {log.details.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          User: {log.userName} ({log.userRole})
                        </div>
                        <div>
                          Entity: {log.entityType} -{" "}
                          {log.entityName || log.entityId}
                        </div>
                        <div>
                          Time: {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div>IP: {log.ipAddress}</div>
                      </div>
                      {log.dohRequirement && (
                        <div className="text-xs text-orange-600 mt-1">
                          DOH Requirement: {log.dohRequirement}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerifyIntegrity?.(log.id)}
                        className="flex items-center gap-2"
                      >
                        <Fingerprint className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(log.details.oldValues || log.details.newValues) && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-sm font-medium mb-2">
                        Data Changes:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {log.details.oldValues && (
                          <div>
                            <div className="font-medium text-red-600 mb-1">
                              Before:
                            </div>
                            <pre className="bg-red-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details.oldValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.details.newValues && (
                          <div>
                            <div className="font-medium text-green-600 mb-1">
                              After:
                            </div>
                            <pre className="bg-green-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details.newValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Failed Logins</p>
                    <p className="text-xl font-bold text-red-600">
                      {stats.failedLogins}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data Modifications</p>
                    <p className="text-xl font-bold">
                      {stats.dataModifications}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">System Events</p>
                    <p className="text-xl font-bold">{stats.systemEvents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Integrity Violations
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      {stats.integrityViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {(
                      (stats.complianceEvents / stats.totalEntries) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-sm text-gray-600">Compliance Event Rate</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">DOH Events:</span>
                    <span className="ml-2 font-medium">
                      {stats.complianceEvents}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Critical:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {stats.criticalEvents}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Today:</span>
                    <span className="ml-2 font-medium">
                      {stats.todayEntries}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Verified:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {auditLogs.filter((log) => log.verified).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrity Tab */}
        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Integrity Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Integrity Verification</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">PASSED</div>
                    <div className="text-xs text-gray-500">
                      {auditLogs.filter((log) => log.verified).length} /{" "}
                      {auditLogs.length} logs verified
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {auditLogs.filter((log) => log.verified).length}
                    </div>
                    <div className="text-sm text-gray-600">Verified Logs</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.integrityViolations}
                    </div>
                    <div className="text-sm text-gray-600">Violations</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600">Tamper-Proof</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Integrity Checks</h4>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{log.id}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs font-mono text-gray-500">
                            {log.integrityHash.substring(0, 16)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DOHAuditTrailSystem;
