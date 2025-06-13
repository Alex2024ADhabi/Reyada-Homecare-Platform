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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Shield,
  User,
  Calendar,
  Search,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Database,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "export"
    | "import";
  resource: string;
  resourceId?: string;
  resourceType:
    | "patient"
    | "clinical-form"
    | "authorization"
    | "claim"
    | "user"
    | "system"
    | "report";
  description: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

interface AuditTrailProps {
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  resourceId?: string;
  resourceType?: string;
  onEntryClick?: (entry: AuditLogEntry) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  className,
  maxHeight = "600px",
  showFilters = true,
  resourceId,
  resourceType,
  onEntryClick,
}) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7d");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(
    null,
  );

  useEffect(() => {
    loadAuditEntries();
  }, [resourceId, resourceType, dateRange]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, actionFilter, resourceTypeFilter, severityFilter]);

  const loadAuditEntries = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your audit API
      const mockEntries = generateMockAuditEntries();
      setEntries(mockEntries);
    } catch (error) {
      console.error("Failed to load audit entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditEntries = (): AuditLogEntry[] => {
    const now = new Date();
    const users = [
      { id: "user1", name: "Dr. Sarah Ahmed", role: "Physician" },
      { id: "user2", name: "Nurse John Smith", role: "Nurse" },
      { id: "user3", name: "Admin Alice Johnson", role: "Administrator" },
      { id: "user4", name: "Therapist Mike Brown", role: "Therapist" },
    ];

    const mockEntries: AuditLogEntry[] = [];

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const actions: AuditLogEntry["action"][] = [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "export",
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resourceTypes: AuditLogEntry["resourceType"][] = [
        "patient",
        "clinical-form",
        "authorization",
        "claim",
        "user",
        "system",
        "report",
      ];
      const resType =
        resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const severities: AuditLogEntry["severity"][] = [
        "low",
        "medium",
        "high",
        "critical",
      ];
      const severity =
        severities[Math.floor(Math.random() * severities.length)];

      const timestamp = new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ); // Last 7 days

      mockEntries.push({
        id: `audit-${i + 1}`,
        timestamp,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        resource: `${resType}-${Math.floor(Math.random() * 1000)}`,
        resourceId: `${resType}-${Math.floor(Math.random() * 1000)}`,
        resourceType: resType,
        description: generateActionDescription(action, resType, user.name),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        severity,
        metadata: {
          module: resType,
          duration: Math.floor(Math.random() * 300), // seconds
        },
        changes: action === "update" ? generateMockChanges() : undefined,
      });
    }

    return mockEntries.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  };

  const generateActionDescription = (
    action: string,
    resourceType: string,
    userName: string,
  ): string => {
    const descriptions = {
      create: `${userName} created a new ${resourceType}`,
      read: `${userName} viewed ${resourceType} details`,
      update: `${userName} updated ${resourceType} information`,
      delete: `${userName} deleted a ${resourceType}`,
      login: `${userName} logged into the system`,
      logout: `${userName} logged out of the system`,
      export: `${userName} exported ${resourceType} data`,
      import: `${userName} imported ${resourceType} data`,
    };
    return (
      descriptions[action as keyof typeof descriptions] ||
      `${userName} performed ${action} on ${resourceType}`
    );
  };

  const generateMockChanges = () => {
    const fields = ["status", "priority", "assignee", "notes", "date"];
    const numChanges = Math.floor(Math.random() * 3) + 1;
    const changes = [];

    for (let i = 0; i < numChanges; i++) {
      const field = fields[Math.floor(Math.random() * fields.length)];
      changes.push({
        field,
        oldValue: `old-${field}-value`,
        newValue: `new-${field}-value`,
      });
    }

    return changes;
  };

  const filterEntries = () => {
    let filtered = entries;

    // Filter by resource if specified
    if (resourceId && resourceType) {
      filtered = filtered.filter(
        (entry) =>
          entry.resourceId === resourceId &&
          entry.resourceType === resourceType,
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.resource.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((entry) => entry.action === actionFilter);
    }

    // Resource type filter
    if (resourceTypeFilter !== "all") {
      filtered = filtered.filter(
        (entry) => entry.resourceType === resourceTypeFilter,
      );
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((entry) => entry.severity === severityFilter);
    }

    setFilteredEntries(filtered);
  };

  const getActionIcon = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "read":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "login":
      case "logout":
        return <User className="h-4 w-4 text-purple-500" />;
      case "export":
      case "import":
        return <Download className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: AuditLogEntry["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const exportAuditLog = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: {
        searchTerm,
        actionFilter,
        resourceTypeFilter,
        severityFilter,
        dateRange,
      },
      entries: filteredEntries,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEntryClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    if (onEntryClick) {
      onEntryClick(entry);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Comprehensive log of all system activities and changes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredEntries.length} entries</Badge>
              <Button variant="outline" size="sm" onClick={exportAuditLog}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={resourceTypeFilter}
                onValueChange={setResourceTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="clinical-form">Clinical Form</SelectItem>
                  <SelectItem value="authorization">Authorization</SelectItem>
                  <SelectItem value="claim">Claim</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}

        <CardContent className="p-0">
          <ScrollArea style={{ height: maxHeight }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading audit entries...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getActionIcon(entry.action)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {entry.userName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.userRole}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getSeverityColor(entry.severity),
                            )}
                          >
                            {entry.severity}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          {entry.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(entry.timestamp, "PPpp")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            <span>{entry.resource}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            <span>{entry.action}</span>
                          </div>
                        </div>

                        {entry.changes && entry.changes.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Changes:</strong>
                            <ul className="mt-1 space-y-1">
                              {entry.changes.map((change, index) => (
                                <li key={index}>
                                  <span className="font-medium">
                                    {change.field}:
                                  </span>
                                  <span className="text-red-600 line-through ml-1">
                                    {change.oldValue}
                                  </span>
                                  <span className="mx-1">→</span>
                                  <span className="text-green-600">
                                    {change.newValue}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getActionIcon(selectedEntry.action)}
                Audit Entry Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedEntry.userName}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedEntry.userRole}
                  </p>
                  <p>
                    <strong>User ID:</strong> {selectedEntry.userId}
                  </p>
                  <p>
                    <strong>Session ID:</strong> {selectedEntry.sessionId}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Action Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Action:</strong> {selectedEntry.action}
                  </p>
                  <p>
                    <strong>Resource:</strong> {selectedEntry.resource}
                  </p>
                  <p>
                    <strong>Resource Type:</strong> {selectedEntry.resourceType}
                  </p>
                  <p>
                    <strong>Severity:</strong> {selectedEntry.severity}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Technical Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>IP Address:</strong> {selectedEntry.ipAddress}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {format(selectedEntry.timestamp, "PPpp")}
                  </p>
                  <p>
                    <strong>User Agent:</strong> {selectedEntry.userAgent}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="space-y-1 text-sm">
                  {selectedEntry.metadata &&
                    Object.entries(selectedEntry.metadata).map(
                      ([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </p>
                      ),
                    )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm bg-gray-50 p-3 rounded">
                {selectedEntry.description}
              </p>
            </div>

            {selectedEntry.changes && selectedEntry.changes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Changes Made</h4>
                <div className="space-y-2">
                  {selectedEntry.changes.map((change, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-sm mb-1">
                        {change.field}
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">
                          From: {JSON.stringify(change.oldValue)}
                        </span>
                        <br />
                        <span className="text-green-600">
                          To: {JSON.stringify(change.newValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrail;
