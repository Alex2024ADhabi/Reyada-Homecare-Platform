import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Upload,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  Shield,
  TrendingUp,
  Activity,
  Settings,
  Plus,
  Eye,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search,
  Zap,
  Target,
  Award,
  Globe,
} from "lucide-react";
// Import components with error handling
let DocumentUpload: React.ComponentType<any>;
let DocumentManagement: React.ComponentType<any>;
let StaffLibraryAccess: React.ComponentType<any>;
let ComplianceMonitor: React.ComponentType<any>;
let RegulatoryReporting: React.ComponentType<any>;

try {
  DocumentUpload = require("./DocumentUpload").default;
} catch (error) {
  DocumentUpload = () => (
    <div className="p-4 text-center text-gray-500">
      Document Upload component not available
    </div>
  );
}

try {
  DocumentManagement = require("./DocumentManagement").default;
} catch (error) {
  DocumentManagement = () => (
    <div className="p-4 text-center text-gray-500">
      Document Management component not available
    </div>
  );
}

try {
  StaffLibraryAccess = require("./StaffLibraryAccess").default;
} catch (error) {
  StaffLibraryAccess = () => (
    <div className="p-4 text-center text-gray-500">
      Staff Library Access component not available
    </div>
  );
}

try {
  ComplianceMonitor = require("./ComplianceMonitor").default;
} catch (error) {
  ComplianceMonitor = () => (
    <div className="p-4 text-center text-gray-500">
      Compliance Monitor component not available
    </div>
  );
}

try {
  RegulatoryReporting = require("./RegulatoryReporting").default;
} catch (error) {
  RegulatoryReporting = () => (
    <div className="p-4 text-center text-gray-500">
      Regulatory Reporting component not available
    </div>
  );
}

interface DashboardStats {
  totalDocuments: number;
  publishedDocuments: number;
  pendingApproval: number;
  staffNotified: number;
  acknowledgmentRate: number;
  complianceScore: number;
  recentUploads: number;
  expiringDocuments: number;
}

interface RecentActivity {
  id: string;
  type: "upload" | "publish" | "acknowledge" | "access" | "compliance";
  description: string;
  user: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

interface NotificationItem {
  id: string;
  type: "new_document" | "expiring" | "compliance" | "acknowledgment";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: string;
  read: boolean;
}

const GovernanceLibraryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole] = useState<"admin" | "staff">("admin"); // This would come from auth context
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 156,
    publishedDocuments: 142,
    pendingApproval: 8,
    staffNotified: 1247,
    acknowledgmentRate: 87,
    complianceScore: 94,
    recentUploads: 12,
    expiringDocuments: 5,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "upload",
      description: "Patient Safety Policy v3.2 uploaded and published",
      user: "Dr. Sarah Ahmed",
      timestamp: "2024-01-20T15:30:00Z",
      status: "success",
    },
    {
      id: "2",
      type: "acknowledge",
      description:
        "Infection Control Procedures acknowledged by 45 staff members",
      user: "System",
      timestamp: "2024-01-20T14:15:00Z",
      status: "success",
    },
    {
      id: "3",
      type: "compliance",
      description: "DOH compliance check completed - 2 issues found",
      user: "Compliance Engine",
      timestamp: "2024-01-20T13:00:00Z",
      status: "warning",
    },
    {
      id: "4",
      type: "publish",
      description: "Emergency Response Guidelines published to all departments",
      user: "Admin",
      timestamp: "2024-01-20T11:45:00Z",
      status: "success",
    },
    {
      id: "5",
      type: "access",
      description: "Quality Assurance Manual accessed 23 times today",
      user: "System",
      timestamp: "2024-01-20T10:30:00Z",
      status: "success",
    },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      type: "new_document",
      title: "New Policy Published",
      message:
        "Patient Safety Policy v3.2 has been published and requires acknowledgment",
      priority: "high",
      timestamp: "2024-01-20T15:30:00Z",
      read: false,
    },
    {
      id: "2",
      type: "expiring",
      title: "Documents Expiring Soon",
      message: "5 documents will expire within the next 30 days",
      priority: "medium",
      timestamp: "2024-01-20T09:00:00Z",
      read: false,
    },
    {
      id: "3",
      type: "compliance",
      title: "Compliance Check Alert",
      message: "DOH compliance score dropped to 92% - review required",
      priority: "urgent",
      timestamp: "2024-01-19T16:20:00Z",
      read: true,
    },
  ]);

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4 text-blue-600" />;
      case "publish":
        return <Globe className="h-4 w-4 text-green-600" />;
      case "acknowledge":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "access":
        return <Eye className="h-4 w-4 text-purple-600" />;
      case "compliance":
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityStatusColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: NotificationItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
              Governance & Regulations Library
            </h1>
            <p className="text-gray-600 mt-2">
              Centralized document management with automated compliance and
              staff notifications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              {userRole === "admin" ? "Administrator" : "Staff Member"}
            </Badge>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDocuments}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats.recentUploads} this month
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.publishedDocuments}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.pendingApproval} pending
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Staff Notified
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.staffNotified}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.acknowledgmentRate}% acknowledged
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.complianceScore}%
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.expiringDocuments} expiring soon
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {userRole === "admin" && (
            <TabsTrigger value="upload">Upload</TabsTrigger>
          )}
          {userRole === "admin" && (
            <TabsTrigger value="manage">Manage</TabsTrigger>
          )}
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-600">
                              by {activity.user}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-600">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-xs font-medium ${getActivityStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications & Alerts */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notifications
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-lg ${
                          notification.read ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p
                                className={`text-sm font-medium ${
                                  notification.read
                                    ? "text-gray-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <Badge
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {userRole === "admin" && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("upload")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("manage")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Library
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("compliance")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Check Compliance
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("reports")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Upload Tab - Admin Only */}
        {userRole === "admin" && (
          <TabsContent value="upload">
            <DocumentUpload />
          </TabsContent>
        )}

        {/* Manage Tab - Admin Only */}
        {userRole === "admin" && (
          <TabsContent value="manage">
            <DocumentManagement />
          </TabsContent>
        )}

        {/* Library Tab */}
        <TabsContent value="library">
          <StaffLibraryAccess />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <ComplianceMonitor />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <RegulatoryReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernanceLibraryDashboard;
