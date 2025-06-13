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
import { Textarea } from "@/components/ui/textarea";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getIncidentReports,
  createIncidentReport,
  updateIncidentReport,
  approveIncidentReport,
  addCorrectiveAction,
  updateCorrectiveActionStatus,
  getIncidentAnalytics,
  getOverdueCorrectiveActions,
  getIncidentsRequiringNotification,
  IncidentReport,
  IncidentFilters,
} from "@/api/incident-management.api";
import {
  getADHICSComplianceOverview,
  createADHICSSecurityIncident,
  ADHICSSecurityIncident,
  ClinicalIncidentManagementEngine,
  ClinicalIncident,
  sampleNGTIncident,
  IncidentProcessingResult,
} from "@/api/administrative-integration.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { toast } from "@/components/ui/use-toast";

interface IncidentReportingDashboardProps {
  userId?: string;
  userRole?: string;
  showADHICSCompliance?: boolean;
  facilityId?: string;
}

interface ADHICSComplianceData {
  governance_compliance: any;
  control_implementation: any;
  asset_management: any;
  incident_management: any;
  overall_adhics_score: number;
  compliance_gaps: string[];
  recommendations: string[];
  compliance_level?: string;
  implementation_status?: string;
}

export default function IncidentReportingDashboard({
  userId = "Dr. Sarah Ahmed",
  userRole = "supervisor",
  showADHICSCompliance = true,
  facilityId = "facility-001",
}: IncidentReportingDashboardProps) {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [overdueActions, setOverdueActions] = useState<any[]>([]);
  const [notificationRequired, setNotificationRequired] = useState<
    IncidentReport[]
  >([]);
  const [adhicsCompliance, setAdhicsCompliance] =
    useState<ADHICSComplianceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);
  const [showClinicalIncidentDialog, setShowClinicalIncidentDialog] =
    useState(false);
  const [clinicalIncidentEngine] = useState(
    new ClinicalIncidentManagementEngine(),
  );
  const [processedIncidents, setProcessedIncidents] = useState<
    IncidentProcessingResult[]
  >([]);
  const [showSampleIncident, setShowSampleIncident] = useState(false);
  const [filters, setFilters] = useState<IncidentFilters>({
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
  });
  const [newIncident, setNewIncident] = useState<Partial<IncidentReport>>({
    incident_type: "safety",
    severity: "medium",
    status: "reported",
    reported_by: userId,
    reported_date: new Date().toISOString().split("T")[0],
    incident_date: new Date().toISOString().split("T")[0],
    incident_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    location: "",
    description: "",
    immediate_actions: "",
    witnesses: [],
    photos: [],
    documents: [],
    investigation: {},
    corrective_actions: [],
    regulatory_notification: { required: false },
    approval: { status: "pending" },
    // DOH Patient Safety Taxonomy (Circular 19/2025)
    doh_taxonomy: {
      level_1: "", // Primary category
      level_2: "", // Subcategory
      level_3: "", // Specific type
      level_4: "", // Contributing factors
      level_5: "", // Root cause analysis
    },
    doh_reportable: false,
    whistleblowing_eligible: false,
    // Enhanced documentation standards (CN_48/2025)
    documentation_compliance: {
      loinc_codes_validated: false,
      required_loinc_codes: [],
      documentation_quality_score: 0,
      coding_standards_met: false,
      quality_metrics: {
        completeness_score: 0,
        accuracy_score: 0,
        timeliness_score: 0,
      },
    },
  });
  const [newAction, setNewAction] = useState({
    description: "",
    assigned_to: "",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending" as const,
  });
  const [incidentClassification, setIncidentClassification] = useState({
    primary_category: "",
    sub_category: "",
    risk_score: 0,
    severity_matrix: {
      impact: 1,
      probability: 1,
      detectability: 1,
    },
    automated_severity: "medium",
  });
  const [predictiveAnalytics, setPredictiveAnalytics] = useState({
    risk_prediction: 0,
    similar_incidents: [],
    trend_analysis: null,
    prevention_recommendations: [],
  });
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState({
    fishbone_categories: {
      people: [],
      process: [],
      environment: [],
      equipment: [],
      materials: [],
      methods: [],
    },
    five_whys: ["", "", "", "", ""],
    contributing_factors: [],
    root_causes: [],
  });
  const { isOnline, saveFormData } = useOfflineSync();

  // Process sample NGT incident on component mount
  useEffect(() => {
    const processSampleIncident = async () => {
      try {
        const result =
          await clinicalIncidentEngine.processClinicalIncident(
            sampleNGTIncident,
          );
        setProcessedIncidents((prev) => [...prev, result]);
      } catch (error) {
        console.error("Error processing sample incident:", error);
      }
    };

    processSampleIncident();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const promises = [
        getIncidentReports(filters),
        getIncidentAnalytics({
          date_from: filters.date_from,
          date_to: filters.date_to,
          location: filters.location,
        }),
        getOverdueCorrectiveActions(),
        getIncidentsRequiringNotification(),
      ];

      if (showADHICSCompliance) {
        promises.push(getADHICSComplianceOverview(facilityId));
      }

      const results = await Promise.all(promises);
      const [
        incidentsData,
        analyticsData,
        overdueData,
        notificationData,
        adhicsData,
      ] = results;

      setIncidents(incidentsData);
      setAnalytics(analyticsData);
      setOverdueActions(overdueData);
      setNotificationRequired(notificationData);

      if (showADHICSCompliance && adhicsData) {
        setAdhicsCompliance(adhicsData as ADHICSComplianceData);
      }

      if (isOnline) {
        toast({
          title: "Dashboard loaded",
          description: `Found ${incidentsData.length} incidents`,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      if (isOnline) {
        toast({
          title: "Error loading dashboard",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      setLoading(true);
      const incidentId = `INC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${String(incidents.length + 1).padStart(3, "0")}`;

      await createIncidentReport({
        ...newIncident,
        incident_id: incidentId,
      } as Omit<IncidentReport, "_id" | "created_at" | "updated_at">);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("incident_report", {
          ...newIncident,
          incident_id: incidentId,
          timestamp: new Date().toISOString(),
        });
      }

      setShowCreateDialog(false);
      setNewIncident({
        incident_type: "safety",
        severity: "medium",
        status: "reported",
        reported_by: userId,
        reported_date: new Date().toISOString().split("T")[0],
        incident_date: new Date().toISOString().split("T")[0],
        incident_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        location: "",
        description: "",
        immediate_actions: "",
        witnesses: [],
        photos: [],
        documents: [],
        investigation: {},
        corrective_actions: [],
        regulatory_notification: { required: false },
        approval: { status: "pending" },
      });
      await loadDashboardData();

      if (isOnline) {
        toast({
          title: "Incident created",
          description: `Incident ${incidentId} has been reported successfully`,
        });
      }
    } catch (error) {
      console.error("Error creating incident:", error);
      if (isOnline) {
        toast({
          title: "Error creating incident",
          description:
            error instanceof Error
              ? error.message
              : "Failed to create incident",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Incident saved offline",
          description: "Incident will be submitted when connection is restored",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveIncident = async (id: string) => {
    try {
      setLoading(true);
      await approveIncidentReport(id, userId, "Incident approved after review");
      await loadDashboardData();

      toast({
        title: "Incident approved",
        description: `Incident has been approved successfully`,
      });
    } catch (error) {
      console.error("Error approving incident:", error);
      toast({
        title: "Error approving incident",
        description:
          error instanceof Error ? error.message : "Failed to approve incident",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCorrectiveAction = async () => {
    if (!selectedIncident) return;

    try {
      setLoading(true);
      await addCorrectiveAction(selectedIncident._id!.toString(), newAction);
      setShowActionDialog(false);
      setNewAction({
        description: "",
        assigned_to: "",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "pending",
      });
      await loadDashboardData();

      toast({
        title: "Corrective action added",
        description: `Action has been added to incident ${selectedIncident.incident_id}`,
      });
    } catch (error) {
      console.error("Error adding corrective action:", error);
      toast({
        title: "Error adding corrective action",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add corrective action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClinicalIncident = async (incident: ClinicalIncident) => {
    try {
      setLoading(true);
      const result =
        await clinicalIncidentEngine.processClinicalIncident(incident);
      setProcessedIncidents((prev) => [...prev, result]);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("clinical_incident", {
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      toast({
        title: "Clinical Incident Processed",
        description: `Incident ${incident.referenceNo} has been processed successfully`,
      });
    } catch (error) {
      console.error("Error processing clinical incident:", error);
      toast({
        title: "Error processing incident",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process clinical incident",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowSampleIncident = () => {
    setShowSampleIncident(true);
  };

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.incident_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reported_by.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[severity] || "secondary"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      reported: "outline",
      investigating: "secondary",
      resolved: "default",
      closed: "secondary",
    };
    const icons = {
      reported: <AlertTriangle className="w-3 h-3" />,
      investigating: <Clock className="w-3 h-3" />,
      resolved: <CheckCircle className="w-3 h-3" />,
      closed: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getApprovalBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Incident Reporting Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage incident reports, investigations, and corrective actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline Mode - Limited Functionality
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={handleShowSampleIncident}
              disabled={loading}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Sample NGT Case
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Report Incident"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report New Incident</DialogTitle>
                  <DialogDescription>
                    Report a new incident for investigation and follow-up
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="incidentType">Incident Type</Label>
                      <Select
                        value={newIncident.incident_type}
                        onValueChange={(value) =>
                          setNewIncident({
                            ...newIncident,
                            incident_type: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="patient_fall">
                            Patient Fall
                          </SelectItem>
                          <SelectItem value="infection">Infection</SelectItem>
                          <SelectItem value="clinical_care">
                            Clinical Care
                          </SelectItem>
                          <SelectItem value="documentation">
                            Documentation
                          </SelectItem>
                          <SelectItem value="communication">
                            Communication
                          </SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={newIncident.severity}
                        onValueChange={(value) =>
                          setNewIncident({
                            ...newIncident,
                            severity: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="incidentDate">Incident Date</Label>
                      <Input
                        id="incidentDate"
                        type="date"
                        value={newIncident.incident_date}
                        onChange={(e) =>
                          setNewIncident({
                            ...newIncident,
                            incident_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="incidentTime">Incident Time</Label>
                      <Input
                        id="incidentTime"
                        type="time"
                        value={newIncident.incident_time}
                        onChange={(e) =>
                          setNewIncident({
                            ...newIncident,
                            incident_time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newIncident.location}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          location: e.target.value,
                        })
                      }
                      placeholder="Enter incident location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newIncident.description}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what happened in detail"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="immediateActions">
                      Immediate Actions Taken
                    </Label>
                    <Textarea
                      id="immediateActions"
                      value={newIncident.immediate_actions}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          immediate_actions: e.target.value,
                        })
                      }
                      placeholder="Describe immediate actions taken"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateIncident}
                    disabled={
                      loading || (!isOnline && !newIncident.description)
                    }
                  >
                    {loading ? "Reporting..." : "Report Incident"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Critical Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {analytics?.critical_incidents || 0}
              </div>
              <p className="text-xs text-red-600">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Overdue Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {overdueActions.length}
              </div>
              <p className="text-xs text-orange-600">
                Corrective actions overdue
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                DoH Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {notificationRequired.length}
              </div>
              <p className="text-xs text-blue-600">Pending notifications</p>
            </CardContent>
          </Card>

          {showADHICSCompliance && adhicsCompliance && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">
                  ADHICS Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(adhicsCompliance.overall_adhics_score)}%
                </div>
                <p className="text-xs text-purple-600">
                  {adhicsCompliance.compliance_level?.toUpperCase()} Level
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Incidents</TabsTrigger>
            <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search by incident ID, description, location, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>
                  {searchTerm
                    ? `${filteredIncidents.length} of ${incidents.length} incidents found`
                    : `${incidents.length} incidents found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incident ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : filteredIncidents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-4 text-gray-500"
                          >
                            {searchTerm
                              ? `No incidents found matching "${searchTerm}"`
                              : "No incidents found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredIncidents.map((incident) => (
                          <TableRow key={incident._id?.toString()}>
                            <TableCell className="font-medium">
                              {incident.incident_id}
                            </TableCell>
                            <TableCell>
                              {incident.incident_type.replace("_", " ")}
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(incident.severity)}
                            </TableCell>
                            <TableCell>{incident.incident_date}</TableCell>
                            <TableCell>{incident.location}</TableCell>
                            <TableCell>{incident.reported_by}</TableCell>
                            <TableCell>
                              {getStatusBadge(incident.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                {incident.approval.status === "pending" &&
                                  userRole === "supervisor" && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveIncident(
                                          incident._id!.toString(),
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setShowActionDialog(true);
                                  }}
                                >
                                  Add Action
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

          {/* Clinical Incidents Tab */}
          <TabsContent value="clinical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Incident Management</CardTitle>
                <CardDescription>
                  Real-world clinical incident processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {processedIncidents.map((processed, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Incident {processed.incidentId}
                            </h3>
                            <Badge variant="outline">
                              {processed.processingComplete
                                ? "Complete"
                                : "In Progress"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                processed.complianceStatus?.dohCompliant
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              DOH:{" "}
                              {processed.complianceStatus?.dohCompliant
                                ? "Compliant"
                                : "Non-Compliant"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Patient:</strong>{" "}
                            {processed.incidentData.patientDetails.patientName}
                          </p>
                          <p>
                            <strong>Category:</strong>{" "}
                            {
                              processed.incidentData.incidentClassification
                                .category.primaryCategory
                            }
                          </p>
                          <p>
                            <strong>Summary:</strong>{" "}
                            {processed.incidentData.incidentAnalysis.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Clinical Incidents Processed
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Clinical incidents will be processed and displayed here.
                    </p>
                    <Button
                      onClick={() =>
                        handleProcessClinicalIncident(sampleNGTIncident)
                      }
                    >
                      Process Sample NGT Incident
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corrective Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Corrective Actions</CardTitle>
                <CardDescription>
                  Track and manage corrective actions for incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueActions.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Overdue Actions</AlertTitle>
                      <AlertDescription>
                        {overdueActions.length} corrective actions are overdue
                        and require immediate attention.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4">
                    {overdueActions.map((action, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-red-50 border-red-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {action.description}
                            </div>
                            <div className="text-sm text-gray-600">
                              Incident: {action.incident_id} | Assigned to:{" "}
                              {action.assigned_to}
                            </div>
                            <div className="text-sm text-red-600">
                              Due: {action.due_date} | Status: {action.status}
                            </div>
                          </div>
                          <Button size="sm" variant="destructive">
                            Update Status
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <PatientComplaintManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Incidents
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_incidents}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Open Incidents
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.open_incidents}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overdue Actions
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.overdue_actions}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Regulatory Notifications
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.regulatory_notifications}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <PredictiveAnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Add Corrective Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Corrective Action</DialogTitle>
              <DialogDescription>
                Add a corrective action for incident{" "}
                {selectedIncident?.incident_id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="actionDescription">Description</Label>
                <Textarea
                  id="actionDescription"
                  value={newAction.description}
                  onChange={(e) =>
                    setNewAction({ ...newAction, description: e.target.value })
                  }
                  placeholder="Describe the corrective action"
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={newAction.assigned_to}
                  onChange={(e) =>
                    setNewAction({ ...newAction, assigned_to: e.target.value })
                  }
                  placeholder="Enter assignee name"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newAction.due_date}
                  onChange={(e) =>
                    setNewAction({ ...newAction, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowActionDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCorrectiveAction} disabled={loading}>
                Add Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sample NGT Incident Details Dialog */}
        <Dialog open={showSampleIncident} onOpenChange={setShowSampleIncident}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sample NGT Incident Case (IR2863)</DialogTitle>
              <DialogDescription>
                Real-world clinical incident based on actual patient case
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Patient:</span>
                  <div>
                    {sampleNGTIncident.patientDetails?.patientName ||
                      "Ahmed Al Yaqoubi"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">MRN:</span>
                  <div>
                    {sampleNGTIncident.patientDetails?.mrn || "MRN123456"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Age/Gender:</span>
                  <div>76 years, Male</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Reference:</span>
                  <div>{sampleNGTIncident.referenceNo}</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Incident Summary</h4>
                <p className="text-sm text-gray-700">
                  NGT blockage incident requiring immediate intervention and
                  replacement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Key Actions Taken</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      NGT replacement performed
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Patient monitoring increased
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Documentation completed
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Outcome</h4>
                  <p className="text-sm text-gray-700">
                    Patient stable, NGT functioning properly, no complications
                    observed.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSampleIncident(false)}>
                Close
              </Button>
              <Button
                onClick={() => handleProcessClinicalIncident(sampleNGTIncident)}
              >
                Process This Incident
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Patient Complaint Management Component
function PatientComplaintManagement() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintAnalytics, setComplaintAnalytics] = useState<any>(null);
  const [showCreateComplaint, setShowCreateComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    complaint_type: "service_quality",
    severity: "medium",
    priority: "routine",
    patient_name: "",
    patient_contact: {
      phone: "",
      email: "",
      preferred_method: "email",
    },
    description: "",
    specific_concerns: [],
    affected_services: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComplaintData();
  }, []);

  const loadComplaintData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, this would call the actual API
      const mockComplaints = [
        {
          complaint_id: "COMP-2025-001",
          complaint_type: "service_quality",
          severity: "medium",
          status: "investigating",
          patient_name: "Ahmed Al Mansouri",
          complaint_date: "2025-01-15",
          description: "Delayed appointment scheduling",
          sla_tracking: { acknowledgment_met: true, resolution_met: false },
        },
        {
          complaint_id: "COMP-2025-002",
          complaint_type: "staff_behavior",
          severity: "high",
          status: "resolved",
          patient_name: "Fatima Al Zahra",
          complaint_date: "2025-01-14",
          description: "Unprofessional behavior from nursing staff",
          sla_tracking: { acknowledgment_met: true, resolution_met: true },
          patient_satisfaction_survey: { satisfaction_score: 4 },
        },
      ];

      const mockAnalytics = {
        total_complaints: 2,
        complaints_by_type: { service_quality: 1, staff_behavior: 1 },
        complaints_by_severity: { medium: 1, high: 1 },
        complaints_by_status: { investigating: 1, resolved: 1 },
        average_resolution_time: 24,
        sla_compliance_rate: 75,
        patient_satisfaction_average: 4.0,
        trending_issues: ["service_quality", "staff_behavior"],
      };

      setComplaints(mockComplaints);
      setComplaintAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error loading complaint data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    try {
      setLoading(true);
      const complaintId = `COMP-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(3, "0")}`;

      const complaintData = {
        ...newComplaint,
        complaint_id: complaintId,
        patient_id: `PAT-${Date.now()}`,
        complaint_date: new Date().toISOString().split("T")[0],
        complaint_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        received_by: "System",
        received_date: new Date().toISOString().split("T")[0],
        status: "received",
        initial_response: {
          acknowledgment_sent: true,
          acknowledgment_date: new Date().toISOString().split("T")[0],
          acknowledgment_method: newComplaint.patient_contact.preferred_method,
          expected_resolution_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0],
        },
        sla_tracking: {
          acknowledgment_sla: 2,
          resolution_sla: 48,
          acknowledgment_met: true,
          resolution_met: false,
        },
      };

      setComplaints([...complaints, complaintData]);
      setShowCreateComplaint(false);
      setNewComplaint({
        complaint_type: "service_quality",
        severity: "medium",
        priority: "routine",
        patient_name: "",
        patient_contact: {
          phone: "",
          email: "",
          preferred_method: "email",
        },
        description: "",
        specific_concerns: [],
        affected_services: [],
      });

      toast({
        title: "Complaint Created",
        description: `Complaint ${complaintId} has been created and acknowledgment sent to patient`,
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      toast({
        title: "Error",
        description: "Failed to create complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[severity] || "secondary"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      received: "outline",
      acknowledged: "secondary",
      investigating: "default",
      resolved: "default",
      closed: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Complaint Analytics Cards */}
      {complaintAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {complaintAnalytics.total_complaints}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {complaintAnalytics.sla_compliance_rate}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Avg Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {complaintAnalytics.average_resolution_time}h
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">
                Patient Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {complaintAnalytics.patient_satisfaction_average}/5
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Complaint Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Patient Complaints</h2>
        <Dialog
          open={showCreateComplaint}
          onOpenChange={setShowCreateComplaint}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Patient Complaint</DialogTitle>
              <DialogDescription>
                Register a new patient complaint for investigation and
                resolution
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="complaintType">Complaint Type</Label>
                  <Select
                    value={newComplaint.complaint_type}
                    onValueChange={(value) =>
                      setNewComplaint({
                        ...newComplaint,
                        complaint_type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_quality">
                        Service Quality
                      </SelectItem>
                      <SelectItem value="staff_behavior">
                        Staff Behavior
                      </SelectItem>
                      <SelectItem value="billing_issues">
                        Billing Issues
                      </SelectItem>
                      <SelectItem value="appointment_scheduling">
                        Appointment Scheduling
                      </SelectItem>
                      <SelectItem value="communication">
                        Communication
                      </SelectItem>
                      <SelectItem value="facility_issues">
                        Facility Issues
                      </SelectItem>
                      <SelectItem value="treatment_concerns">
                        Treatment Concerns
                      </SelectItem>
                      <SelectItem value="privacy_breach">
                        Privacy Breach
                      </SelectItem>
                      <SelectItem value="accessibility">
                        Accessibility
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={newComplaint.severity}
                    onValueChange={(value) =>
                      setNewComplaint({ ...newComplaint, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={newComplaint.patient_name}
                  onChange={(e) =>
                    setNewComplaint({
                      ...newComplaint,
                      patient_name: e.target.value,
                    })
                  }
                  placeholder="Enter patient name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientPhone">Patient Phone</Label>
                  <Input
                    id="patientPhone"
                    value={newComplaint.patient_contact.phone}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        patient_contact: {
                          ...newComplaint.patient_contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="patientEmail">Patient Email</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={newComplaint.patient_contact.email}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        patient_contact: {
                          ...newComplaint.patient_contact,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Complaint Description</Label>
                <Textarea
                  id="description"
                  value={newComplaint.description}
                  onChange={(e) =>
                    setNewComplaint({
                      ...newComplaint,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the complaint in detail"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateComplaint(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateComplaint} disabled={loading}>
                {loading ? "Creating..." : "Create Complaint"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Complaints</CardTitle>
          <CardDescription>
            {complaints.length} complaints found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-4 text-gray-500"
                    >
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint.complaint_id}>
                      <TableCell className="font-medium">
                        {complaint.complaint_id}
                      </TableCell>
                      <TableCell>
                        {complaint.complaint_type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(complaint.severity)}
                      </TableCell>
                      <TableCell>{complaint.patient_name}</TableCell>
                      <TableCell>{complaint.complaint_date}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge
                            variant={
                              complaint.sla_tracking?.acknowledgment_met
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            ACK
                          </Badge>
                          <Badge
                            variant={
                              complaint.sla_tracking?.resolution_met
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            RES
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
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
    </div>
  );
}

// Predictive Analytics Dashboard Component
function PredictiveAnalyticsDashboard() {
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      // Mock predictive analytics data
      const mockData = {
        risk_predictions: {
          high_risk_areas: [
            {
              area: "Emergency Department",
              risk_score: 0.85,
              trend: "increasing",
            },
            { area: "ICU", risk_score: 0.72, trend: "stable" },
            { area: "Surgical Ward", risk_score: 0.68, trend: "decreasing" },
          ],
          incident_probability: {
            next_7_days: 0.23,
            next_30_days: 0.67,
            seasonal_patterns: {
              winter: 0.8,
              spring: 0.6,
              summer: 0.5,
              autumn: 0.7,
            },
          },
        },
        trend_analysis: {
          incident_trends: {
            medication_errors: { trend: "increasing", change: "+15%" },
            patient_falls: { trend: "decreasing", change: "-8%" },
            equipment_failures: { trend: "stable", change: "+2%" },
          },
          complaint_trends: {
            service_quality: { trend: "increasing", change: "+12%" },
            staff_behavior: { trend: "decreasing", change: "-5%" },
            communication: { trend: "stable", change: "+1%" },
          },
        },
        prevention_recommendations: [
          {
            category: "Staff Training",
            priority: "high",
            recommendation: "Implement monthly medication safety training",
            expected_impact: "25% reduction in medication errors",
          },
          {
            category: "Process Improvement",
            priority: "medium",
            recommendation: "Standardize patient handoff procedures",
            expected_impact: "15% improvement in communication",
          },
          {
            category: "Technology",
            priority: "high",
            recommendation: "Deploy AI-powered fall risk assessment",
            expected_impact: "30% reduction in patient falls",
          },
        ],
        similar_incidents: [
          {
            incident_id: "INC-2024-089",
            similarity_score: 0.92,
            outcome: "resolved",
            resolution_time: 48,
            lessons_learned: "Early intervention prevented escalation",
          },
          {
            incident_id: "INC-2024-067",
            similarity_score: 0.87,
            outcome: "resolved",
            resolution_time: 72,
            lessons_learned: "Root cause analysis revealed system issue",
          },
        ],
      };

      setPredictiveData(mockData);
    } catch (error) {
      console.error("Error loading predictive data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  if (!predictiveData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No predictive data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
            Risk Predictions
          </CardTitle>
          <CardDescription>
            AI-powered risk assessment and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictiveData.risk_predictions.high_risk_areas.map(
              (area: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{area.area}</h4>
                    <Badge
                      variant={
                        area.risk_score > 0.8
                          ? "destructive"
                          : area.risk_score > 0.6
                            ? "default"
                            : "secondary"
                      }
                    >
                      {Math.round(area.risk_score * 100)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Trend:{" "}
                    <span
                      className={
                        area.trend === "increasing"
                          ? "text-red-600"
                          : area.trend === "decreasing"
                            ? "text-green-600"
                            : "text-gray-600"
                      }
                    >
                      {area.trend}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                predictiveData.trend_analysis.incident_trends,
              ).map(([key, trend]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium">{key.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        trend.trend === "increasing"
                          ? "text-red-600"
                          : trend.trend === "decreasing"
                            ? "text-green-600"
                            : "text-gray-600"
                      }
                    >
                      {trend.change}
                    </span>
                    <Badge variant="outline">{trend.trend}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complaint Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                predictiveData.trend_analysis.complaint_trends,
              ).map(([key, trend]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium">{key.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        trend.trend === "increasing"
                          ? "text-red-600"
                          : trend.trend === "decreasing"
                            ? "text-green-600"
                            : "text-gray-600"
                      }
                    >
                      {trend.change}
                    </span>
                    <Badge variant="outline">{trend.trend}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prevention Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Prevention Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated recommendations to prevent future incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveData.prevention_recommendations.map(
              (rec: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rec.category}</h4>
                      <Badge
                        variant={
                          rec.priority === "high" ? "destructive" : "default"
                        }
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {rec.recommendation}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Expected Impact: {rec.expected_impact}
                  </p>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Similar Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Similar Historical Incidents</CardTitle>
          <CardDescription>
            Learn from similar past incidents and their resolutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveData.similar_incidents.map(
              (incident: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{incident.incident_id}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {Math.round(incident.similarity_score * 100)}% similar
                      </Badge>
                      <Badge variant="default">{incident.outcome}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Resolution Time: {incident.resolution_time} hours
                  </div>
                  <div className="text-sm text-blue-600">
                    Lessons Learned: {incident.lessons_learned}
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
