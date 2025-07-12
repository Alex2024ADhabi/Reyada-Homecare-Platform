import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface ServiceDeliveryRecord {
  id: string;
  patient_id: number;
  patient_name: string;
  service_month: number;
  service_year: number;
  claim_number: string;
  primary_clinician: string;
  authorized_services: string;
  authorized_quantity: number;

  // Daily service tracking (31 days)
  daily_services: { [key: string]: string }; // service_day_01 to service_day_31
  daily_documentation: { [key: string]: string }; // doc_day_01 to doc_day_31

  total_services_provided: number;
  total_authorized_services: number;
  service_utilization_rate: number;
  documentation_compliance_rate: number;

  service_provision_status: string;
  last_service_date: string;
  next_scheduled_service: string;

  created_at: string;
  updated_at: string;
}

interface MonthlyServiceDeliveryTrackerProps {
  isOffline?: boolean;
}

const MonthlyServiceDeliveryTracker = ({
  isOffline = false,
}: MonthlyServiceDeliveryTrackerProps) => {
  const { isOnline } = useOfflineSync();
  const [activeTab, setActiveTab] = useState("calendar-view");
  const [serviceRecords, setServiceRecords] = useState<ServiceDeliveryRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<ServiceDeliveryRecord | null>(null);

  // Dashboard statistics
  const [monthlyStats, setMonthlyStats] = useState({
    totalPatients: 0,
    totalServicesProvided: 0,
    totalServicesAuthorized: 0,
    averageUtilizationRate: 0,
    documentationComplianceRate: 0,
    activeServiceProvisions: 0,
    completedServiceDays: 0,
    pendingDocumentation: 0,
  });

  // Mock data for service delivery tracking
  const mockServiceRecords: ServiceDeliveryRecord[] = [
    {
      id: "1",
      patient_id: 12345,
      patient_name: "Mohammed Al Mansoori",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0001",
      primary_clinician: "Sarah Ahmed",
      authorized_services: "Home Nursing, Physiotherapy",
      authorized_quantity: 30,
      daily_services: {
        service_day_01: "Home Nursing",
        service_day_02: "Physiotherapy",
        service_day_03: "Home Nursing",
        service_day_04: "No Service",
        service_day_05: "Home Nursing",
        service_day_06: "Physiotherapy",
        service_day_07: "Home Nursing",
        service_day_08: "Physiotherapy",
        service_day_09: "Home Nursing",
        service_day_10: "No Service",
      },
      daily_documentation: {
        doc_day_01: "Complete",
        doc_day_02: "Complete",
        doc_day_03: "Complete",
        doc_day_04: "N/A",
        doc_day_05: "Pending",
        doc_day_06: "Complete",
        doc_day_07: "Complete",
        doc_day_08: "Complete",
        doc_day_09: "Pending",
        doc_day_10: "N/A",
      },
      total_services_provided: 8,
      total_authorized_services: 10,
      service_utilization_rate: 80.0,
      documentation_compliance_rate: 87.5,
      service_provision_status: "Active",
      last_service_date: "2024-02-09",
      next_scheduled_service: "2024-02-11",
      created_at: "2024-02-01T08:00:00Z",
      updated_at: "2024-02-09T16:30:00Z",
    },
    {
      id: "2",
      patient_id: 12346,
      patient_name: "Fatima Al Zaabi",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0002",
      primary_clinician: "Ali Hassan",
      authorized_services: "Physical Therapy",
      authorized_quantity: 12,
      daily_services: {
        service_day_01: "Physical Therapy",
        service_day_02: "No Service",
        service_day_03: "Physical Therapy",
        service_day_04: "Physical Therapy",
        service_day_05: "No Service",
        service_day_06: "Physical Therapy",
        service_day_07: "No Service",
        service_day_08: "Physical Therapy",
        service_day_09: "Physical Therapy",
        service_day_10: "No Service",
      },
      daily_documentation: {
        doc_day_01: "Complete",
        doc_day_02: "N/A",
        doc_day_03: "Complete",
        doc_day_04: "Incomplete",
        doc_day_05: "N/A",
        doc_day_06: "Complete",
        doc_day_07: "N/A",
        doc_day_08: "Complete",
        doc_day_09: "Complete",
        doc_day_10: "N/A",
      },
      total_services_provided: 6,
      total_authorized_services: 6,
      service_utilization_rate: 100.0,
      documentation_compliance_rate: 83.3,
      service_provision_status: "Active",
      last_service_date: "2024-02-09",
      next_scheduled_service: "2024-02-11",
      created_at: "2024-02-01T09:15:00Z",
      updated_at: "2024-02-09T17:45:00Z",
    },
  ];

  // Load service records on component mount
  useEffect(() => {
    const fetchServiceRecords = async () => {
      try {
        // In a real implementation, this would be an API call
        setServiceRecords(mockServiceRecords);

        // Calculate monthly statistics
        const stats = {
          totalPatients: mockServiceRecords.length,
          totalServicesProvided: mockServiceRecords.reduce(
            (sum, record) => sum + record.total_services_provided,
            0,
          ),
          totalServicesAuthorized: mockServiceRecords.reduce(
            (sum, record) => sum + record.total_authorized_services,
            0,
          ),
          averageUtilizationRate:
            mockServiceRecords.reduce(
              (sum, record) => sum + record.service_utilization_rate,
              0,
            ) / mockServiceRecords.length,
          documentationComplianceRate:
            mockServiceRecords.reduce(
              (sum, record) => sum + record.documentation_compliance_rate,
              0,
            ) / mockServiceRecords.length,
          activeServiceProvisions: mockServiceRecords.filter(
            (record) => record.service_provision_status === "Active",
          ).length,
          completedServiceDays: mockServiceRecords.reduce((sum, record) => {
            return (
              sum +
              Object.values(record.daily_services).filter(
                (service) => service !== "No Service",
              ).length
            );
          }, 0),
          pendingDocumentation: mockServiceRecords.reduce((sum, record) => {
            return (
              sum +
              Object.values(record.daily_documentation).filter(
                (doc) => doc === "Pending" || doc === "Incomplete",
              ).length
            );
          }, 0),
        };

        setMonthlyStats(stats);
      } catch (error) {
        console.error("Error fetching service records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRecords();
  }, [selectedMonth, selectedYear]);

  // Filter service records based on search query
  const filteredRecords = serviceRecords.filter((record) => {
    const matchesSearch =
      record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.primary_clinician
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Get service status for a specific day
  const getServiceStatus = (record: ServiceDeliveryRecord, day: number) => {
    const serviceKey = `service_day_${day.toString().padStart(2, "0")}`;
    const docKey = `doc_day_${day.toString().padStart(2, "0")}`;

    const service = record.daily_services[serviceKey];
    const documentation = record.daily_documentation[docKey];

    if (!service || service === "No Service") {
      return {
        status: "no-service",
        service: "No Service",
        documentation: "N/A",
      };
    }

    if (documentation === "Complete") {
      return { status: "complete", service, documentation };
    } else if (documentation === "Pending" || documentation === "Incomplete") {
      return { status: "pending", service, documentation };
    }

    return {
      status: "unknown",
      service,
      documentation: documentation || "Unknown",
    };
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "complete":
        return "success";
      case "pending":
        return "warning";
      case "no-service":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Monthly Service Delivery Tracker
          </h1>
          <p className="text-muted-foreground">
            Track daily service delivery and documentation compliance across
            monthly calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem key={2022 + i} value={(2022 + i).toString()}>
                  {2022 + i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active service recipients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Services Provided
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalServicesProvided}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {monthlyStats.totalServicesAuthorized} authorized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {monthlyStats.averageUtilizationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {monthlyStats.documentationComplianceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar-view">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="patient-summary">
            <Users className="h-4 w-4 mr-2" />
            Patient Summary
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Calendar View Tab */}
        <TabsContent value="calendar-view" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    Service Delivery Calendar -{" "}
                    {new Date(0, selectedMonth - 1).toLocaleString("default", {
                      month: "long",
                    })}{" "}
                    {selectedYear}
                  </CardTitle>
                  <CardDescription>
                    Daily service tracking and documentation status
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {record.patient_name}
                          </CardTitle>
                          <CardDescription>
                            {record.claim_number} • {record.primary_clinician}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {record.total_services_provided}/
                            {record.total_authorized_services} services
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.service_utilization_rate.toFixed(1)}%
                            utilization
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="text-center text-xs font-medium text-muted-foreground p-2"
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {generateCalendarDays().map((day) => {
                          const serviceStatus = getServiceStatus(record, day);
                          return (
                            <div
                              key={day}
                              className="aspect-square border rounded-md p-1 text-xs flex flex-col items-center justify-center hover:bg-muted/50 cursor-pointer"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <div className="font-medium">{day}</div>
                              <Badge
                                variant={getStatusBadgeVariant(
                                  serviceStatus.status,
                                )}
                                className="text-[10px] px-1 py-0 mt-1"
                              >
                                {serviceStatus.status === "no-service"
                                  ? "—"
                                  : serviceStatus.status === "complete"
                                    ? "✓"
                                    : serviceStatus.status === "pending"
                                      ? "!"
                                      : "?"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Summary Tab */}
        <TabsContent value="patient-summary" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Patient Service Summary</CardTitle>
                  <CardDescription>
                    Detailed service delivery and documentation tracking
                  </CardDescription>
                </div>
                <div className="relative w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Clinician</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Documentation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Service</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No service records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{record.patient_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {record.claim_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{record.primary_clinician}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {record.total_services_provided}/
                              {record.total_authorized_services}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.authorized_services}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.service_utilization_rate >= 90
                                  ? "success"
                                  : record.service_utilization_rate >= 70
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {record.service_utilization_rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.documentation_compliance_rate >= 95
                                  ? "success"
                                  : record.documentation_compliance_rate >= 80
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {record.documentation_compliance_rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.service_provision_status === "Active"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {record.service_provision_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(
                                record.last_service_date,
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Next:{" "}
                              {new Date(
                                record.next_scheduled_service,
                              ).toLocaleDateString()}
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Delivery Performance</CardTitle>
                <CardDescription>
                  Key metrics for service delivery efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Service Days:
                    </span>
                    <span className="text-lg font-bold">
                      {monthlyStats.completedServiceDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Average Utilization:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {monthlyStats.averageUtilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Documentation Compliance:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {monthlyStats.documentationComplianceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Pending Documentation:
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {monthlyStats.pendingDocumentation}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Provision Status</CardTitle>
                <CardDescription>
                  Current status of service delivery activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Active Provisions:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {monthlyStats.activeServiceProvisions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Services This Month:
                    </span>
                    <span className="text-lg font-bold">
                      {monthlyStats.totalServicesProvided}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Authorized Services:
                    </span>
                    <span className="text-lg font-bold">
                      {monthlyStats.totalServicesAuthorized}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Overall Efficiency:
                    </span>
                    <span className="text-lg font-bold">
                      {monthlyStats.totalServicesAuthorized > 0
                        ? Math.round(
                            (monthlyStats.totalServicesProvided /
                              monthlyStats.totalServicesAuthorized) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonthlyServiceDeliveryTracker;
