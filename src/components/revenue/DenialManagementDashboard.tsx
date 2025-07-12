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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface DenialManagementDashboardProps {
  isOffline?: boolean;
}

interface DenialRecord {
  id: string;
  claimId: string;
  patientName: string;
  denialDate: string;
  denialReason: string;
  denialCode: string;
  denialAmount: number;
  appealStatus:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "denied";
  appealDeadline?: string;
  appealSubmissionDate?: string;
  supportingDocuments: string[];
  notes?: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  lastUpdated: string;
}

const DenialManagementDashboard = ({
  isOffline = false,
}: DenialManagementDashboardProps) => {
  const { isOnline } = useOfflineSync();
  const {
    isLoading,
    error,
    recordDenial,
    submitAppeal,
    denialAnalytics,
    fetchDenialAnalytics,
  } = useRevenueManagement();

  const [activeTab, setActiveTab] = useState("denials");
  const [denialData, setDenialData] = useState<DenialRecord[]>([]);
  const [selectedDenial, setSelectedDenial] = useState<DenialRecord | null>(
    null,
  );
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [showDenialDialog, setShowDenialDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [appealReason, setAppealReason] = useState("");
  const [appealDocuments, setAppealDocuments] = useState<string[]>([]);
  const [appealNotes, setAppealNotes] = useState("");

  // Mock data for demonstration
  const mockDenialData: DenialRecord[] = [
    {
      id: "1",
      claimId: "CL-2024-0001",
      patientName: "Mohammed Al Mansoori",
      denialDate: "2024-02-10",
      denialReason: "Insufficient clinical documentation",
      denialCode: "D001",
      denialAmount: 7500.0,
      appealStatus: "not_started",
      appealDeadline: "2024-03-12",
      supportingDocuments: ["medical-report.pdf", "authorization-form.pdf"],
      priority: "high",
      assignedTo: "Dr. Sarah Ahmed",
      lastUpdated: "2024-02-10T10:30:00Z",
    },
    {
      id: "2",
      claimId: "CL-2024-0002",
      patientName: "Fatima Al Zaabi",
      denialDate: "2024-02-08",
      denialReason: "Service not covered under policy",
      denialCode: "D002",
      denialAmount: 3600.0,
      appealStatus: "in_progress",
      appealDeadline: "2024-03-10",
      appealSubmissionDate: "2024-02-15",
      supportingDocuments: [
        "policy-coverage.pdf",
        "clinical-notes.pdf",
        "appeal-letter.pdf",
      ],
      priority: "medium",
      assignedTo: "Dr. Ahmed Hassan",
      lastUpdated: "2024-02-15T14:20:00Z",
    },
    {
      id: "3",
      claimId: "CL-2024-0003",
      patientName: "Ahmed Al Shamsi",
      denialDate: "2024-02-05",
      denialReason: "Duplicate claim submission",
      denialCode: "D003",
      denialAmount: 4200.0,
      appealStatus: "approved",
      appealDeadline: "2024-03-07",
      appealSubmissionDate: "2024-02-12",
      supportingDocuments: ["original-claim.pdf", "duplicate-analysis.pdf"],
      priority: "low",
      assignedTo: "Dr. Mariam Ali",
      lastUpdated: "2024-02-20T09:15:00Z",
    },
    {
      id: "4",
      claimId: "CL-2024-0004",
      patientName: "Mariam Al Nuaimi",
      denialDate: "2024-02-12",
      denialReason: "Pre-authorization required",
      denialCode: "D004",
      denialAmount: 6750.0,
      appealStatus: "submitted",
      appealDeadline: "2024-03-14",
      appealSubmissionDate: "2024-02-18",
      supportingDocuments: ["pre-auth-request.pdf", "medical-necessity.pdf"],
      priority: "urgent",
      assignedTo: "Dr. Omar Khalil",
      lastUpdated: "2024-02-18T16:45:00Z",
    },
  ];

  useEffect(() => {
    loadDenialData();
    if (isOnline && !isOffline) {
      fetchDenialAnalytics();
    }
  }, []);

  const loadDenialData = async () => {
    try {
      if (isOnline && !isOffline) {
        // In a real implementation, this would fetch from API
        setDenialData(mockDenialData);
      } else {
        setDenialData(mockDenialData);
      }
    } catch (error) {
      console.error("Error loading denial data:", error);
      setDenialData(mockDenialData);
    }
  };

  const handleSubmitAppeal = async (denial: DenialRecord) => {
    try {
      const appealData = {
        claimId: denial.claimId,
        denialId: denial.id,
        appealReason,
        supportingDocuments: appealDocuments,
        additionalInformation: appealNotes,
        submissionDate: new Date().toISOString(),
      };

      if (isOnline && !isOffline) {
        await submitAppeal(appealData);
      }

      // Update local state
      setDenialData((prev) =>
        prev.map((item) =>
          item.id === denial.id
            ? {
                ...item,
                appealStatus: "submitted" as const,
                appealSubmissionDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      );

      setShowAppealDialog(false);
      setSelectedDenial(null);
      setAppealReason("");
      setAppealDocuments([]);
      setAppealNotes("");
    } catch (error) {
      console.error("Error submitting appeal:", error);
    }
  };

  const handleRecordDenial = async (denialFormData: any) => {
    try {
      if (isOnline && !isOffline) {
        await recordDenial(denialFormData);
      }

      // Add to local state
      const newDenial: DenialRecord = {
        id: `denial-${Date.now()}`,
        claimId: denialFormData.claimId,
        patientName: denialFormData.patientName,
        denialDate: denialFormData.denialDate || new Date().toISOString(),
        denialReason: denialFormData.reason,
        denialCode: denialFormData.code,
        denialAmount: denialFormData.amount,
        appealStatus: "not_started",
        appealDeadline: denialFormData.appealDeadline,
        supportingDocuments: denialFormData.supportingDocuments || [],
        priority: denialFormData.priority || "medium",
        assignedTo: denialFormData.assignedTo,
        lastUpdated: new Date().toISOString(),
      };

      setDenialData((prev) => [newDenial, ...prev]);
      setShowDenialDialog(false);
    } catch (error) {
      console.error("Error recording denial:", error);
    }
  };

  const filteredData = denialData.filter((denial) => {
    const matchesSearch =
      denial.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      denial.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      denial.denialReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      denial.denialCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || denial.appealStatus === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || denial.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      not_started: "destructive",
      in_progress: "secondary",
      submitted: "outline",
      approved: "default",
      denied: "destructive",
    } as const;

    const icons = {
      not_started: <XCircle className="w-3 h-3" />,
      in_progress: <Clock className="w-3 h-3" />,
      submitted: <FileText className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      denied: <XCircle className="w-3 h-3" />,
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.replace("_", " ").charAt(0).toUpperCase() +
          status.replace("_", " ").slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount);
  };

  const calculateSummaryStats = () => {
    const totalDenials = denialData.length;
    const totalDenialAmount = denialData.reduce(
      (sum, denial) => sum + denial.denialAmount,
      0,
    );
    const notStartedCount = denialData.filter(
      (denial) => denial.appealStatus === "not_started",
    ).length;
    const inProgressCount = denialData.filter(
      (denial) => denial.appealStatus === "in_progress",
    ).length;
    const submittedCount = denialData.filter(
      (denial) => denial.appealStatus === "submitted",
    ).length;
    const approvedCount = denialData.filter(
      (denial) => denial.appealStatus === "approved",
    ).length;
    const urgentCount = denialData.filter(
      (denial) => denial.priority === "urgent",
    ).length;

    return {
      totalDenials,
      totalDenialAmount,
      notStartedCount,
      inProgressCount,
      submittedCount,
      approvedCount,
      urgentCount,
      appealSuccessRate:
        submittedCount + approvedCount > 0
          ? (approvedCount / (submittedCount + approvedCount)) * 100
          : 0,
    };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Denial Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage claim denials, track appeals, and monitor success rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button
            onClick={() => setShowDenialDialog(true)}
            className="bg-primary"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Record Denial
          </Button>
          <Button onClick={loadDenialData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Total Denials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDenials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.urgentCount} urgent cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Denial Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDenialAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total denied revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending Appeals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.notStartedCount + stats.inProgressCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.notStartedCount} not started, {stats.inProgressCount} in
              progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.appealSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.approvedCount} of{" "}
              {stats.submittedCount + stats.approvedCount} appeals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="denials">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Denials
          </TabsTrigger>
          <TabsTrigger value="appeals">
            <FileText className="h-4 w-4 mr-2" />
            Appeals
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Denials Tab */}
        <TabsContent value="denials" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Claim Denials</CardTitle>
                  <CardDescription>
                    Track and manage all claim denials and their appeal status
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Denials
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient, claim ID, or reason..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Denial Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Appeal Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No denial records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((denial) => (
                        <TableRow key={denial.id}>
                          <TableCell className="font-medium">
                            {denial.claimId}
                          </TableCell>
                          <TableCell>{denial.patientName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {denial.denialReason}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Code: {denial.denialCode}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(denial.denialAmount)}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(denial.priority)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(denial.appealStatus)}
                          </TableCell>
                          <TableCell>
                            {denial.appealDeadline ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  denial.appealDeadline,
                                ).toLocaleDateString()}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {denial.appealStatus === "not_started" ||
                              denial.appealStatus === "in_progress" ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDenial(denial);
                                    setShowAppealDialog(true);
                                  }}
                                >
                                  Submit Appeal
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              )}
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

        {/* Appeals Tab */}
        <TabsContent value="appeals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appeal Tracking</CardTitle>
              <CardDescription>
                Monitor the progress of submitted appeals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData
                  .filter(
                    (denial) =>
                      denial.appealStatus === "in_progress" ||
                      denial.appealStatus === "submitted" ||
                      denial.appealStatus === "approved" ||
                      denial.appealStatus === "denied",
                  )
                  .map((denial) => (
                    <Card
                      key={denial.id}
                      className={`border-l-4 ${
                        denial.appealStatus === "approved"
                          ? "border-l-green-500"
                          : denial.appealStatus === "denied"
                            ? "border-l-red-500"
                            : denial.appealStatus === "submitted"
                              ? "border-l-blue-500"
                              : "border-l-amber-500"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {denial.claimId} - {denial.patientName}
                            </CardTitle>
                            <CardDescription>
                              Denial Reason: {denial.denialReason}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(denial.appealStatus)}
                            {getPriorityBadge(denial.priority)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Denial Amount:</span>
                            <p>{formatCurrency(denial.denialAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Denial Date:</span>
                            <p>
                              {new Date(denial.denialDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Appeal Deadline:
                            </span>
                            <p>
                              {denial.appealDeadline
                                ? new Date(
                                    denial.appealDeadline,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Assigned To:</span>
                            <p>{denial.assignedTo || "Unassigned"}</p>
                          </div>
                        </div>
                        {denial.supportingDocuments.length > 0 && (
                          <div className="mt-4">
                            <span className="font-medium text-sm">
                              Supporting Documents:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {denial.supportingDocuments.map((doc, index) => (
                                <Badge key={index} variant="outline">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-primary" />
                  Denial Trends
                </CardTitle>
                <CardDescription>
                  Analysis of denial patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Monthly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Track denial rates and common reasons
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Appeal Success Rate
                </CardTitle>
                <CardDescription>
                  Monitor appeal outcomes and success factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Weekly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Analyze successful appeal strategies
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Revenue Recovery
                </CardTitle>
                <CardDescription>
                  Track recovered revenue from successful appeals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Quarterly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Measure financial impact of appeal process
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit Appeal Dialog */}
      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
            <DialogDescription>
              Submit an appeal for claim {selectedDenial?.claimId}
            </DialogDescription>
          </DialogHeader>
          {selectedDenial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Claim ID</Label>
                  <Input value={selectedDenial.claimId} readOnly />
                </div>
                <div>
                  <Label>Patient Name</Label>
                  <Input value={selectedDenial.patientName} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Denial Amount</Label>
                  <Input
                    value={formatCurrency(selectedDenial.denialAmount)}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Appeal Deadline</Label>
                  <Input
                    value={
                      selectedDenial.appealDeadline
                        ? new Date(
                            selectedDenial.appealDeadline,
                          ).toLocaleDateString()
                        : ""
                    }
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label>Denial Reason</Label>
                <Input value={selectedDenial.denialReason} readOnly />
              </div>
              <div>
                <Label htmlFor="appeal-reason">Appeal Reason *</Label>
                <Textarea
                  id="appeal-reason"
                  placeholder="Provide detailed reason for the appeal..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appeal-notes">Additional Notes</Label>
                <Textarea
                  id="appeal-notes"
                  placeholder="Add any additional information or context..."
                  value={appealNotes}
                  onChange={(e) => setAppealNotes(e.target.value)}
                />
              </div>
              <div>
                <Label>Supporting Documents</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDenial.supportingDocuments.map((doc, index) => (
                    <Badge key={index} variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      {doc}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Additional Documents
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAppealDialog(false);
                setSelectedDenial(null);
                setAppealReason("");
                setAppealNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedDenial && handleSubmitAppeal(selectedDenial)
              }
              disabled={isLoading || !appealReason.trim()}
            >
              {isLoading ? "Submitting..." : "Submit Appeal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Denial Dialog */}
      <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Denial</DialogTitle>
            <DialogDescription>
              Record a new claim denial in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="claim-id">Claim ID *</Label>
                <Input id="claim-id" placeholder="Enter claim ID" required />
              </div>
              <div>
                <Label htmlFor="patient-name">Patient Name *</Label>
                <Input
                  id="patient-name"
                  placeholder="Enter patient name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="denial-code">Denial Code *</Label>
                <Input
                  id="denial-code"
                  placeholder="Enter denial code"
                  required
                />
              </div>
              <div>
                <Label htmlFor="denial-amount">Denial Amount *</Label>
                <Input
                  id="denial-amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="denial-reason">Denial Reason *</Label>
              <Textarea
                id="denial-reason"
                placeholder="Enter detailed denial reason..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Input id="assigned-to" placeholder="Enter assignee name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDenialDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => handleRecordDenial({})} disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Denial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DenialManagementDashboard;
