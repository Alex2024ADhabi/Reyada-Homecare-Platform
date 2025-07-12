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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  getComplianceMonitoringRecords,
  getComplianceDashboardData,
  ComplianceMonitoring,
} from "@/api/quality-management.api";

interface ComplianceMonitorProps {
  regulationType?: string;
  showHeader?: boolean;
}

export default function ComplianceMonitor({
  regulationType,
  showHeader = true,
}: ComplianceMonitorProps) {
  const [complianceRecords, setComplianceRecords] = useState<
    ComplianceMonitoring[]
  >([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<string>(
    regulationType || "all",
  );

  useEffect(() => {
    loadComplianceData();
  }, [selectedRegulation]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const [records, dashboard] = await Promise.all([
        getComplianceMonitoringRecords(),
        getComplianceDashboardData(),
      ]);

      // Filter records if specific regulation type is selected
      const filteredRecords =
        selectedRegulation === "all"
          ? records
          : records.filter(
              (record) => record.regulation_type === selectedRegulation,
            );

      setComplianceRecords(filteredRecords);
      setDashboardData(dashboard);
    } catch (error) {
      console.error("Error loading compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      compliant: "default",
      partially_compliant: "secondary",
      non_compliant: "destructive",
      under_review: "outline",
      not_applicable: "outline",
    };

    const icons = {
      compliant: <CheckCircle className="w-3 h-3" />,
      partially_compliant: <Clock className="w-3 h-3" />,
      non_compliant: <XCircle className="w-3 h-3" />,
      under_review: <RefreshCw className="w-3 h-3" />,
      not_applicable: <FileText className="w-3 h-3" />,
    };

    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      mandatory: "destructive",
      recommended: "secondary",
      best_practice: "default",
    };

    return (
      <Badge variant={variants[category] || "secondary"}>
        {category.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const regulationTypes = [
    "all",
    "DOH",
    "TASNEEF",
    "ACHC",
    "JAWDA",
    "ISO",
    "HAAD",
    "DHA",
  ];

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Compliance Monitor
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time regulatory compliance monitoring and tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedRegulation}
              onChange={(e) => setSelectedRegulation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {regulationTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Regulations" : type}
                </option>
              ))}
            </select>
            <Button onClick={loadComplianceData} disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Compliance Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Overall Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {dashboardData.total_compliance_score}%
              </div>
              <Progress
                value={dashboardData.total_compliance_score}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Upcoming Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {dashboardData.upcoming_audits.length}
              </div>
              <p className="text-xs text-blue-600">Next 30 days</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Overdue Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {dashboardData.overdue_compliance.length}
              </div>
              <p className="text-xs text-orange-600">Require attention</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Active Regulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {Object.keys(dashboardData.compliance_by_regulation).length}
              </div>
              <p className="text-xs text-purple-600">Being monitored</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts for Critical Issues */}
      {dashboardData && dashboardData.overdue_compliance.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Compliance Issues
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {dashboardData.overdue_compliance.length} compliance requirements
            are overdue for assessment. Immediate action is required to maintain
            regulatory compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance by Regulation Type */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance by Regulation Type</CardTitle>
            <CardDescription>
              Overview of compliance status across different regulatory
              frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dashboardData.compliance_by_regulation).map(
                ([regulation, data]: [string, any]) => (
                  <Card key={regulation} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {regulation}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Requirements:</span>
                          <span className="font-medium">{data.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Compliant:</span>
                          <span className="font-medium">
                            {data.compliant || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Non-Compliant:</span>
                          <span className="font-medium">
                            {data.non_compliant || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-600">Partial:</span>
                          <span className="font-medium">
                            {data.partially_compliant || 0}
                          </span>
                        </div>
                        <Progress
                          value={
                            data.total > 0
                              ? ((data.compliant || 0) / data.total) * 100
                              : 0
                          }
                          className="h-2 mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>
            Detailed view of all compliance requirements and their current
            status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regulation</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance %</TableHead>
                  <TableHead>Last Assessment</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Loading compliance data...
                    </TableCell>
                  </TableRow>
                ) : complianceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-4 text-gray-500"
                    >
                      No compliance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  complianceRecords.map((record) => (
                    <TableRow key={record._id?.toString()}>
                      <TableCell>
                        <Badge variant="outline">
                          {record.regulation_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.regulation_code}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {record.regulation_title}
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(record.compliance_category)}
                      </TableCell>
                      <TableCell>
                        {getComplianceStatusBadge(record.current_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${getComplianceColor(record.compliance_percentage)}`}
                          >
                            {record.compliance_percentage}%
                          </span>
                          <Progress
                            value={record.compliance_percentage}
                            className="h-1 w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(
                          record.last_assessment_date,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span
                          className={
                            new Date(record.next_assessment_due) < new Date()
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {new Date(
                            record.next_assessment_due,
                          ).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
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

      {/* Upcoming Audits */}
      {dashboardData && dashboardData.upcoming_audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Audits</CardTitle>
            <CardDescription>
              Scheduled audits in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.upcoming_audits.map(
                (audit: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{audit.audit_title}</div>
                      <div className="text-sm text-gray-600">
                        {audit.audit_type} audit by {audit.auditing_body}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(audit.scheduled_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {audit.departments_audited?.join(", ")}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
