import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: "compliance" | "audit" | "performance" | "regulatory";
  framework: string;
  status: "draft" | "pending" | "completed" | "submitted";
  createdAt: string;
  dueDate?: string;
  submittedAt?: string;
  createdBy: string;
  description: string;
  fileSize?: number;
  downloadCount: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  framework: string;
  description: string;
  frequency: "monthly" | "quarterly" | "annually" | "on-demand";
  isActive: boolean;
  lastGenerated?: string;
}

const RegulatoryReporting: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    try {
      setIsLoading(true);

      // Mock data - in real implementation, this would fetch from API
      const mockReports: Report[] = [
        {
          id: "rpt-001",
          name: "DOH Quarterly Compliance Report Q1 2024",
          type: "compliance",
          framework: "DOH",
          status: "completed",
          createdAt: "2024-01-15T10:00:00Z",
          dueDate: "2024-01-31T17:00:00Z",
          submittedAt: "2024-01-28T14:30:00Z",
          createdBy: "Compliance Manager",
          description:
            "Quarterly compliance assessment report for DOH standards",
          fileSize: 2048576,
          downloadCount: 12,
        },
        {
          id: "rpt-002",
          name: "JAWDA Accreditation Audit Report",
          type: "audit",
          framework: "JAWDA",
          status: "pending",
          createdAt: "2024-01-20T09:15:00Z",
          dueDate: "2024-02-15T17:00:00Z",
          createdBy: "Quality Assurance Lead",
          description:
            "Annual JAWDA accreditation audit findings and recommendations",
          downloadCount: 5,
        },
        {
          id: "rpt-003",
          name: "Daman Insurance Compliance Summary",
          type: "regulatory",
          framework: "Daman",
          status: "draft",
          createdAt: "2024-01-22T11:30:00Z",
          dueDate: "2024-02-05T17:00:00Z",
          createdBy: "Insurance Coordinator",
          description:
            "Monthly compliance summary for Daman insurance requirements",
          downloadCount: 2,
        },
      ];

      const mockTemplates: ReportTemplate[] = [
        {
          id: "tpl-001",
          name: "DOH Compliance Report Template",
          type: "compliance",
          framework: "DOH",
          description:
            "Standard template for DOH quarterly compliance reporting",
          frequency: "quarterly",
          isActive: true,
          lastGenerated: "2024-01-15T10:00:00Z",
        },
        {
          id: "tpl-002",
          name: "JAWDA Audit Report Template",
          type: "audit",
          framework: "JAWDA",
          description: "Template for JAWDA accreditation audit reports",
          frequency: "annually",
          isActive: true,
          lastGenerated: "2024-01-20T09:15:00Z",
        },
        {
          id: "tpl-003",
          name: "Monthly Performance Dashboard",
          type: "performance",
          framework: "Internal",
          description: "Monthly performance metrics and KPI dashboard",
          frequency: "monthly",
          isActive: true,
          lastGenerated: "2024-01-01T08:00:00Z",
        },
      ];

      setReports(mockReports);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Error loading reporting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Report["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "submitted":
        return <Send className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "compliance":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "audit":
        return <Search className="h-4 w-4 text-purple-600" />;
      case "performance":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "regulatory":
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regulatory reporting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Regulatory Reporting
            </h1>
            <p className="text-gray-600 mt-2">
              Generate, manage, and submit regulatory compliance reports
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadReportingData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog
              open={showTemplateDialog}
              onOpenChange={setShowTemplateDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate New Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Report Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Report Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Period</SelectItem>
                        <SelectItem value="previous">
                          Previous Period
                        </SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setShowTemplateDialog(false)}>
                    Generate Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter((r) => r.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-purple-600">
                  {templates.length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="audit">Audit</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Reports ({filteredReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {report.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              by {report.createdBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(report.type)}
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.framework}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(report.status)}
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.dueDate ? (
                            <div className="text-sm">
                              {formatDate(report.dueDate)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(report.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.fileSize && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {report.status === "completed" && (
                              <Button variant="ghost" size="sm">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge
                      className={
                        template.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Framework:</span>
                        <span>{template.framework}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="capitalize">{template.frequency}</span>
                      </div>
                      {template.lastGenerated && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Generated:</span>
                          <span>{formatDate(template.lastGenerated)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Report Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Report distribution chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Submission Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Submission trends chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Report Details
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {selectedReport.name}
                </h3>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-700">Type</Label>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedReport.type)}
                    <Badge variant="outline" className="capitalize">
                      {selectedReport.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Framework</Label>
                  <Badge variant="secondary">{selectedReport.framework}</Badge>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedReport.status)}
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">
                    Created By
                  </Label>
                  <p>{selectedReport.createdBy}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Created</Label>
                  <p>{formatDate(selectedReport.createdAt)}</p>
                </div>
                {selectedReport.dueDate && (
                  <div>
                    <Label className="font-medium text-gray-700">
                      Due Date
                    </Label>
                    <p>{formatDate(selectedReport.dueDate)}</p>
                  </div>
                )}
                {selectedReport.submittedAt && (
                  <div>
                    <Label className="font-medium text-gray-700">
                      Submitted
                    </Label>
                    <p>{formatDate(selectedReport.submittedAt)}</p>
                  </div>
                )}
                {selectedReport.fileSize && (
                  <div>
                    <Label className="font-medium text-gray-700">
                      File Size
                    </Label>
                    <p>{formatFileSize(selectedReport.fileSize)}</p>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Downloads:</strong> {selectedReport.downloadCount}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Close
            </Button>
            {selectedReport?.fileSize && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {selectedReport?.status === "completed" && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegulatoryReporting;
