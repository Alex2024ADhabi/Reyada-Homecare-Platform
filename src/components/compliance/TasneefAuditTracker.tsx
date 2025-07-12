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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ApiService } from "@/services/api.service";

interface TasneefAuditItem {
  id: string;
  itemNumber: string;
  description: string;
  category: "claims" | "policies" | "kpi";
  responsiblePerson: string;
  dueDate: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  remarks: string;
  qaValidation: string;
  priority: "critical" | "high" | "medium" | "low";
  completionPercentage: number;
}

interface TasneefAuditTrackerProps {
  facilityId?: string;
  auditDate?: string;
}

export default function TasneefAuditTracker({
  facilityId = "RHHCS-001",
  auditDate = "2024-12-18",
}: TasneefAuditTrackerProps) {
  const [auditItems, setAuditItems] = useState<TasneefAuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTasneefAuditItems();
  }, [facilityId]);

  const loadTasneefAuditItems = async () => {
    try {
      setLoading(true);
      // Enhanced data based on RH Tasneef Audit Checklist JDC 2024 with robust JAWDA implementation
      const mockItems: TasneefAuditItem[] = [
        // Claims Management Domain
        {
          id: "CLAIMS-001",
          itemNumber: "1",
          description:
            "Preparation of All the evidence for the Received claims",
          category: "claims",
          responsiblePerson: "Maria Lyn Ureta, Mohammed Shafi, Ghiwa",
          dueDate: "2024-12-17",
          status: "in_progress",
          remarks:
            "Clinical documentation (POC, Homecare Ref, Internal Physician Evaluation) planned for 2024-12-17",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 75,
        },
        {
          id: "CLAIMS-002",
          itemNumber: "2",
          description: "24 hours EMR lock",
          category: "claims",
          responsiblePerson: "Mohammed Shafi, Mohamed Ashik",
          dueDate: "2024-12-17",
          status: "in_progress",
          remarks:
            "This will enable From IT on 12/12/2024 Will be validating on 17/12/2024",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 60,
        },
        {
          id: "CLAIMS-003",
          itemNumber: "3",
          description: "3 rooms required during audit day",
          category: "claims",
          responsiblePerson: "Office Manager",
          dueDate: "2024-12-15",
          status: "pending",
          remarks:
            "Room-1: External Meeting Room, Room-2: Structure Office, Room-3: Will Confirm with Office Manager by 14/12/2024",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 40,
        },
        {
          id: "CLAIMS-004",
          itemNumber: "4",
          description: "4 computers/laptop during audit day",
          category: "claims",
          responsiblePerson: "Ashik & Ajin",
          dueDate: "2024-12-15",
          status: "pending",
          remarks:
            "IT Team will setup Computers in designated room Will Confirm with IT Manager by 14/12/2024",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 30,
        },
        {
          id: "CLAIMS-005",
          itemNumber: "5",
          description: "Food/Refreshments",
          category: "claims",
          responsiblePerson: "Office Manager",
          dueDate: "2024-12-17",
          status: "pending",
          remarks:
            "Office Manager has to make arrangement Will Confirm with Office Manager by 17/12/2024",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 20,
        },
        // Policies & Procedures Domain
        {
          id: "POLICY-006",
          itemNumber: "6",
          description: "Clinical Coding + Claims management policy",
          category: "policies",
          responsiblePerson: "Maria Lyn Ureta, Cecil, Abinaya",
          dueDate: "2024-10-31",
          status: "completed",
          remarks: "Updated Policy -Verified Needs Revision",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 85,
        },
        {
          id: "POLICY-007",
          itemNumber: "7",
          description: "Clinician and Coder Query Policy",
          category: "policies",
          responsiblePerson: "Maria Lyn Ureta, Abinaya Selvaraj",
          dueDate: "2024-10-31",
          status: "overdue",
          remarks:
            "Policy not Complying with the Process of incorporating the Forms in Patient Medical Records, Changes -Required.",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 40,
        },
        {
          id: "POLICY-008",
          itemNumber: "8",
          description: "Code of ethics policy",
          category: "policies",
          responsiblePerson: "Cecil Canasa, Gretchen Cahoy, Abinaya Selvaraj",
          dueDate: "2024-10-31",
          status: "completed",
          remarks:
            "Updated Policy -Verified Verified Flow Chart To check with Implementation -HR",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 90,
        },
        {
          id: "POLICY-009",
          itemNumber: "9",
          description: "Coding books",
          category: "policies",
          responsiblePerson: "Maria Lyn Ureta",
          dueDate: "2024-10-31",
          status: "completed",
          remarks:
            "Insurance Department has Coding Book ICD 10 2021 -Hard Copy Available at Insurance Office",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 100,
        },
        {
          id: "POLICY-010",
          itemNumber: "10",
          description: "Coding Certificates + CEU",
          category: "policies",
          responsiblePerson: "Maria Lyn Ureta",
          dueDate: "2024-11-27",
          status: "completed",
          remarks:
            "Lyn - Completed, Rubeena - Completed, Priya - Completed and shared in Dropbox",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 100,
        },
        // KPI Management Domain
        {
          id: "KPI-001",
          itemNumber: "15",
          description: "JAWDA KPI awareness training policy",
          category: "kpi",
          responsiblePerson: "Ghiwa Nasr",
          dueDate: "2024-10-31",
          status: "in_progress",
          remarks: "Uploaded Should Incorporate the changes as per",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 70,
        },
        {
          id: "KPI-002",
          itemNumber: "16",
          description: "JAWDA KPI Internal training attendance form - signed",
          category: "kpi",
          responsiblePerson: "Ghiwa Nasr",
          dueDate: "2024-12-12",
          status: "completed",
          remarks:
            "All staff training attendance forms completed and digitally signed with automated validation",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 100,
        },
        {
          id: "KPI-005",
          itemNumber: "EMR-LOG",
          description: "EMR Audit log",
          category: "kpi",
          responsiblePerson: "Ashik & Ajin, Vision Technology",
          dueDate: "2024-11-22",
          status: "completed",
          remarks:
            "EMR audit log system fully stabilized with automated logging, real-time monitoring, and comprehensive audit trail functionality",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 100,
        },
        {
          id: "KPI-011",
          itemNumber: "KPI-STATS",
          description: "KPI statistics report generated from Tracker",
          category: "kpi",
          responsiblePerson: "Mohammed Shafi",
          dueDate: "2024-11-27",
          status: "completed",
          remarks:
            "Comprehensive KPI statistics with automated patient demographics tracking, JAWDA/Non-JAWDA classification, and real-time dashboard integration",
          qaValidation: "Dr Abinaya",
          priority: "medium",
          completionPercentage: 100,
        },
      ];

      // Add new JAWDA enhancement items
      const jawdaEnhancementItems: TasneefAuditItem[] = [
        {
          id: "JAWDA-001",
          itemNumber: "J1",
          description: "Automated JAWDA KPI Data Collection System",
          category: "kpi",
          responsiblePerson: "IT Team, Quality Department",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Real-time automated data collection with validation and error handling",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 100,
        },
        {
          id: "JAWDA-002",
          itemNumber: "J2",
          description: "JAWDA Compliance Dashboard Integration",
          category: "kpi",
          responsiblePerson: "Development Team",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Interactive dashboard with real-time KPI monitoring and alerts",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 100,
        },
        {
          id: "JAWDA-003",
          itemNumber: "J3",
          description: "Enhanced Training Management System",
          category: "policies",
          responsiblePerson: "HR Department, Gretchen Cahoy",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Digital training tracking with automated reminders and compliance verification",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 100,
        },
        {
          id: "JAWDA-004",
          itemNumber: "J4",
          description: "Automated Quality Metrics Reporting",
          category: "kpi",
          responsiblePerson: "Quality Team, Mohammed Shafi",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Automated generation of monthly and quarterly quality reports with trend analysis",
          qaValidation: "Dr Abinaya",
          priority: "high",
          completionPercentage: 100,
        },
        {
          id: "JAWDA-005",
          itemNumber: "J5",
          description: "Risk Assessment and Mitigation Framework",
          category: "kpi",
          responsiblePerson: "Risk Management Team",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Comprehensive risk assessment with automated mitigation tracking and reporting",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 100,
        },
        {
          id: "JAWDA-006",
          itemNumber: "J6",
          description: "Patient Safety Incident Management Enhancement",
          category: "policies",
          responsiblePerson: "Patient Safety Team",
          dueDate: "2024-12-31",
          status: "completed",
          remarks:
            "Enhanced incident classification with automated DOH taxonomy compliance",
          qaValidation: "Dr Abinaya",
          priority: "critical",
          completionPercentage: 100,
        },
      ];

      setAuditItems([...mockItems, ...jawdaEnhancementItems]);
    } catch (error) {
      console.error("Error loading Tasneef audit items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: "bg-red-200 text-red-900 border-red-300",
      high: "bg-orange-200 text-orange-900 border-orange-300",
      medium: "bg-yellow-200 text-yellow-900 border-yellow-300",
      low: "bg-green-200 text-green-900 border-green-300",
    };
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "claims":
        return <FileText className="w-4 h-4" />;
      case "policies":
        return <Users className="w-4 h-4" />;
      case "kpi":
        return <Target className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredItems = auditItems.filter((item) => {
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const overallProgress =
    auditItems.length > 0
      ? Math.round(
          auditItems.reduce((sum, item) => sum + item.completionPercentage, 0) /
            auditItems.length,
        )
      : 0;

  const statusCounts = auditItems.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categoryCounts = auditItems.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              RH Tasneef Audit Checklist JDC 2024
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive tracking for DOH Tasneef Audit preparation -{" "}
              {facilityId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Audit Date: {auditDate}
            </Badge>
            <Button
              onClick={loadTasneefAuditItems}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {overallProgress}%
              </div>
              <Progress value={overallProgress} className="h-2 mt-2" />
              <p className="text-xs text-blue-600 mt-1">
                {auditItems.length} total items
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {statusCounts.completed || 0}
              </div>
              <p className="text-xs text-green-600">Items fully completed</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {statusCounts.in_progress || 0}
              </div>
              <p className="text-xs text-yellow-600">Items being worked on</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {statusCounts.overdue || 0}
              </div>
              <p className="text-xs text-red-600">Items past due date</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="kpi">KPI</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Checklist Items</CardTitle>
                <CardDescription>
                  Complete tracking of all RH Tasneef Audit Checklist items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item #</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Responsible</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.itemNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <div>
                                <div className="font-medium text-sm">
                                  {item.description}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.remarks}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.category.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.responsiblePerson}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {getPriorityBadge(item.priority)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.completionPercentage}
                                className="h-2 w-16"
                              />
                              <span className="text-sm font-medium">
                                {item.completionPercentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims Management Domain</CardTitle>
                <CardDescription>
                  Evidence preparation and audit day logistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditItems
                    .filter((item) => item.category === "claims")
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-blue-400"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                Item {item.itemNumber}: {item.description}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.remarks}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>
                                  Responsible: {item.responsiblePerson}
                                </span>
                                <span>
                                  Due:{" "}
                                  {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(item.status)}
                              {getPriorityBadge(item.priority)}
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                Progress:
                              </span>
                              <span className="text-sm">
                                {item.completionPercentage}%
                              </span>
                            </div>
                            <Progress
                              value={item.completionPercentage}
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policies & Procedures Domain</CardTitle>
                <CardDescription>
                  Policy documentation and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditItems
                    .filter((item) => item.category === "policies")
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-green-400"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                Item {item.itemNumber}: {item.description}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.remarks}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>
                                  Responsible: {item.responsiblePerson}
                                </span>
                                <span>
                                  Due:{" "}
                                  {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(item.status)}
                              {getPriorityBadge(item.priority)}
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                Progress:
                              </span>
                              <span className="text-sm">
                                {item.completionPercentage}%
                              </span>
                            </div>
                            <Progress
                              value={item.completionPercentage}
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPI Tab */}
          <TabsContent value="kpi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI Management Domain</CardTitle>
                <CardDescription>
                  JAWDA KPI tracking and reporting requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditItems
                    .filter((item) => item.category === "kpi")
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-purple-400"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                Item {item.itemNumber}: {item.description}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.remarks}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>
                                  Responsible: {item.responsiblePerson}
                                </span>
                                <span>
                                  Due:{" "}
                                  {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(item.status)}
                              {getPriorityBadge(item.priority)}
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                Progress:
                              </span>
                              <span className="text-sm">
                                {item.completionPercentage}%
                              </span>
                            </div>
                            <Progress
                              value={item.completionPercentage}
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
