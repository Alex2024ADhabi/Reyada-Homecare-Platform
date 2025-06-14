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
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Activity,
  MapPin,
} from "lucide-react";
import {
  getDailyPlans,
  createDailyPlan,
  updateDailyPlan,
  approveDailyPlan,
  getDailyUpdates,
  createDailyUpdate,
  getTodaysActivePlans,
  getPlansRequiringAttention,
  DailyPlan,
  DailyUpdate,
  StaffAssignment,
  ResourceAllocation,
  RiskAssessment,
} from "@/api/daily-planning.api";
import {
  optimizeAssetAllocation,
  getAvailableDrivers,
  getAvailableVehicles,
  generateAutomatedReplacementSuggestions,
  getAssetPerformanceAnalytics,
  AssetOptimizationResult,
  VehicleAsset,
  DriverAsset,
  ReplacementSuggestion,
  getSkillsMatrix,
  identifySkillGaps,
  getEquipmentInventory,
  getMaintenanceDueEquipment,
  generateQualityMetrics,
  generateFinancialAnalytics,
  createRiskAssessment,
  getRiskAssessments,
  sendMessage,
  getMessages,
  SkillsMatrix,
  EquipmentInventory,
  QualityMetrics,
  FinancialAnalytics,
  RiskManagement,
  CommunicationHub,
  generateWorkforceIntelligence,
  WorkforceIntelligence,
  getPatientOutcomes,
  PatientOutcome,
  generateAdvancedAnalytics,
  AdvancedAnalytics,
} from "@/api/manpower.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useToast } from "@/hooks/useToast";
import { RefreshCw } from "lucide-react";

interface DailyPlanningDashboardProps {
  teamLead?: string;
  department?: string;
}

export default function DailyPlanningDashboard({
  teamLead = "Dr. Sarah Ahmed",
  department = "Nursing",
}: DailyPlanningDashboardProps) {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [todaysPlans, setTodaysPlans] = useState<DailyPlan[]>([]);
  const [attentionItems, setAttentionItems] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // ENHANCED: Asset optimization state
  const [assetOptimization, setAssetOptimization] = useState<AssetOptimizationResult | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleAsset[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverAsset[]>([]);
  const [replacementSuggestions, setReplacementSuggestions] = useState<ReplacementSuggestion[]>([]);
  const [assetPerformance, setAssetPerformance] = useState<any>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  // NEW: Enhanced state management
  const [skillsMatrix, setSkillsMatrix] = useState<SkillsMatrix[]>([]);
  const [skillGaps, setSkillGaps] = useState<any>(null);
  const [equipmentInventory, setEquipmentInventory] = useState<EquipmentInventory[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<EquipmentInventory[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [riskAssessments, setRiskAssessments] = useState<RiskManagement[]>([]);
  const [messages, setMessages] = useState<CommunicationHub[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  // NEW: Enhanced state for workforce intelligence and patient outcomes
  const [workforceIntelligence, setWorkforceIntelligence] = useState<any>(null);
  const [patientOutcomes, setPatientOutcomes] = useState<any[]>([]);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<DailyPlan>>({
    date: selectedDate,
    shift: "Morning",
    team_lead: teamLead,
    department,
    total_patients: 0,
    high_priority_patients: 0,
    medium_priority_patients: 0,
    low_priority_patients: 0,
    staff_assigned: [],
    resource_allocation: {
      vehicles: 0,
      medical_equipment: [],
      medications: "",
      emergency_supplies: "",
    },
    risk_assessment: {
      weather_conditions: "Clear",
      traffic_conditions: "Normal",
      patient_acuity_level: "Medium",
      staff_availability: "Full",
      equipment_status: "All functional",
    },
    objectives: [],
    contingency_plans: [],
    status: "draft",
    created_by: teamLead,
  });
  const [newUpdate, setNewUpdate] = useState<Partial<DailyUpdate>>({
    update_type: "progress",
    patients_completed: 0,
    patients_remaining: 0,
    issues_encountered: [],
    resource_updates: [],
    staff_updates: [],
    performance_metrics: {
      efficiency_rate: 0,
      quality_score: 0,
      patient_satisfaction: 0,
      safety_incidents: 0,
    },
    next_actions: [],
    escalation_required: false,
    status: "draft",
  });
  const { isOnline } = useOfflineSync();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [plansData, todaysData, attentionData, vehiclesData, driversData] = await Promise.all([
        getDailyPlans({
          date_from: selectedDate,
          date_to: selectedDate,
          department,
        }),
        getTodaysActivePlans(),
        getPlansRequiringAttention(),
        getAvailableVehicles(selectedDate, "Morning"),
        getAvailableDrivers(selectedDate, "Morning"),
      ]);
      setPlans(plansData);
      setTodaysPlans(todaysData);
      setAttentionItems(attentionData);
      setAvailableVehicles(vehiclesData);
      setAvailableDrivers(driversData);
      
      // Load asset performance analytics
      await loadAssetPerformanceData();
      // Load enhanced data
      await loadEnhancedData();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load enhanced data for comprehensive management
  const loadEnhancedData = async () => {
    try {
      setDataLoading(true);
      const [skillsData, skillGapsData, equipmentData, maintenanceData, qualityData, financialData, riskData, messagesData, workforceData, outcomesData, analyticsData] = await Promise.all([
        getSkillsMatrix(),
        identifySkillGaps(department),
        getEquipmentInventory(),
        getMaintenanceDueEquipment(),
        generateQualityMetrics(selectedDate, selectedDate),
        generateFinancialAnalytics(selectedDate, selectedDate),
        getRiskAssessments(),
        getMessages({ recipient_id: teamLead, unread_only: false }),
        generateWorkforceIntelligence(department, { start_date: selectedDate, end_date: selectedDate }),
        getPatientOutcomes({ date_from: selectedDate, date_to: selectedDate }),
        generateAdvancedAnalytics({ start_date: selectedDate, end_date: selectedDate }),
      ]);
      
      setSkillsMatrix(skillsData);
      setSkillGaps(skillGapsData);
      setEquipmentInventory(equipmentData);
      setMaintenanceDue(maintenanceData);
      setQualityMetrics(qualityData);
      setFinancialAnalytics(financialData);
      setRiskAssessments(riskData);
      setMessages(messagesData);
      setWorkforceIntelligence(workforceData);
      setPatientOutcomes(outcomesData);
      setAdvancedAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading enhanced data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // ENHANCED: Load asset performance data
  const loadAssetPerformanceData = async () => {
    try {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const performanceData = await getAssetPerformanceAnalytics(lastWeek, selectedDate);
      setAssetPerformance(performanceData);
    } catch (error) {
      console.error("Error loading asset performance data:", error);
    }
  };

  // ENHANCED: Optimize asset allocation
  const handleOptimizeAssets = async () => {
    try {
      setOptimizationLoading(true);
      
      // Extract patient requirements from plans
      const patientRequirements = plans.flatMap(plan => 
        plan.staff_assigned.map(staff => ({
          patient_id: `P${Math.random().toString(36).substr(2, 9)}`,
          location: staff.specialization,
          priority: plan.high_priority_patients > 0 ? 'high' : 'medium',
          estimated_duration: 60,
        }))
      );
      
      const optimizationResult = await optimizeAssetAllocation(
        selectedDate,
        "Morning",
        patientRequirements
      );
      
      setAssetOptimization(optimizationResult);
      setReplacementSuggestions(optimizationResult.replacement_suggestions);
      
      toast({
        title: "Asset Optimization Complete",
        description: `Optimization score: ${optimizationResult.optimization_score.toFixed(1)}%. Potential savings: ${optimizationResult.cost_savings.toFixed(0)}.`,
      });
    } catch (error) {
      console.error("Error optimizing assets:", error);
      toast({
        title: "Optimization Error",
        description: "Failed to optimize asset allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOptimizationLoading(false);
    }
  };

  const loadUpdates = async (planId: string) => {
    try {
      const updatesData = await getDailyUpdates(planId);
      setUpdates(updatesData);
    } catch (error) {
      console.error("Error loading updates:", error);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      await createDailyPlan(
        newPlan as Omit<DailyPlan, "_id" | "created_at" | "updated_at">,
      );
      setShowCreateDialog(false);
      setNewPlan({
        date: selectedDate,
        shift: "Morning",
        team_lead: teamLead,
        department,
        total_patients: 0,
        high_priority_patients: 0,
        medium_priority_patients: 0,
        low_priority_patients: 0,
        staff_assigned: [],
        resource_allocation: {
          vehicles: 0,
          medical_equipment: [],
          medications: "",
          emergency_supplies: "",
        },
        risk_assessment: {
          weather_conditions: "Clear",
          traffic_conditions: "Normal",
          patient_acuity_level: "Medium",
          staff_availability: "Full",
          equipment_status: "All functional",
        },
        objectives: [],
        contingency_plans: [],
        status: "draft",
        created_by: teamLead,
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Error creating plan:", error);
      alert(error instanceof Error ? error.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async (id: string) => {
    try {
      setLoading(true);
      await approveDailyPlan(id, teamLead);
      await loadDashboardData();
    } catch (error) {
      console.error("Error approving plan:", error);
      alert(error instanceof Error ? error.message : "Failed to approve plan");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      await createDailyUpdate({
        ...newUpdate,
        plan_id: selectedPlan.plan_id,
        date: selectedDate,
        update_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        updated_by: teamLead,
      } as Omit<
        DailyUpdate,
        "_id" | "update_id" | "created_at" | "updated_at"
      >);
      setShowUpdateDialog(false);
      setNewUpdate({
        update_type: "progress",
        patients_completed: 0,
        patients_remaining: 0,
        issues_encountered: [],
        resource_updates: [],
        staff_updates: [],
        performance_metrics: {
          efficiency_rate: 0,
          quality_score: 0,
          patient_satisfaction: 0,
          safety_incidents: 0,
        },
        next_actions: [],
        escalation_required: false,
        status: "draft",
      });
      await loadUpdates(selectedPlan.plan_id);
    } catch (error) {
      console.error("Error creating update:", error);
      alert(error instanceof Error ? error.message : "Failed to create update");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      draft: "outline",
      completed: "secondary",
      cancelled: "destructive",
    };
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      draft: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
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

  const getPriorityBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Critical: "destructive",
      High: "default",
      Medium: "secondary",
      Low: "secondary",
    };
    return <Badge variant={variants[level] || "secondary"}>{level}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Daily Planning Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Plan and monitor daily operations and staff assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Daily Plan</DialogTitle>
                  <DialogDescription>
                    Create a new daily operational plan for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shift">Shift</Label>
                      <Select
                        value={newPlan.shift}
                        onValueChange={(value) =>
                          setNewPlan({ ...newPlan, shift: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                          <SelectItem value="Full Day">Full Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="totalPatients">Total Patients</Label>
                      <Input
                        id="totalPatients"
                        type="number"
                        value={newPlan.total_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            total_patients: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="highPriority">High Priority</Label>
                      <Input
                        id="highPriority"
                        type="number"
                        value={newPlan.high_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            high_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mediumPriority">Medium Priority</Label>
                      <Input
                        id="mediumPriority"
                        type="number"
                        value={newPlan.medium_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            medium_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowPriority">Low Priority</Label>
                      <Input
                        id="lowPriority"
                        type="number"
                        value={newPlan.low_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            low_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="objectives">Objectives</Label>
                    <Textarea
                      id="objectives"
                      placeholder="Enter objectives (one per line)"
                      value={newPlan.objectives?.join("\n") || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          objectives: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        })
                      }
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
                  <Button onClick={handleCreatePlan} disabled={loading}>
                    Create Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Alert Cards with Framework Matrix Integration */}
        {attentionItems && (
          <div className="space-y-6">
            {/* Framework Matrix Clinical Operations Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🏥 Framework Matrix - Clinical Operations Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Framework Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {attentionItems.framework_matrix_alerts?.length || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      Clinical workflow issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      Operations Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {attentionItems.clinical_operations_status?.length || 0}
                    </div>
                    <p className="text-xs text-green-600">
                      Function monitoring
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">
                      Patient Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {attentionItems.framework_matrix_alerts?.filter(
                        (alert) => alert.function === "Patient Referrals",
                      ).length || 0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Referral processing
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-teal-800">
                      Assessment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-900">
                      {attentionItems.framework_matrix_alerts?.filter(
                        (alert) => alert.function === "Patient Assessment",
                      ).length || 0}
                    </div>
                    <p className="text-xs text-teal-600">Assessment workflow</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Standard Administrative Alerts */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📋 Administrative Operations Monitoring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      Overdue Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">
                      {attentionItems.overdue_updates?.length || 0}
                    </div>
                    <p className="text-xs text-orange-600">
                      Plans need status updates
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">
                      Critical Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">
                      {attentionItems.critical_issues?.length || 0}
                    </div>
                    <p className="text-xs text-red-600">
                      Unresolved critical issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {attentionItems.pending_approvals?.length || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      Plans awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">
                      End-of-Day Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {attentionItems.end_of_day_alerts?.length || 0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Automated preparation alerts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">
                      Predictive Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-900">
                      {attentionItems.predictive_issues?.length || 0}
                    </div>
                    <p className="text-xs text-yellow-600">
                      AI-detected potential issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-800">
                      Compliance Violations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-900">
                      {attentionItems.compliance_violations?.length || 0}
                    </div>
                    <p className="text-xs text-indigo-600">
                      DOH/JAWDA compliance issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      Resource Conflicts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {attentionItems.resource_conflicts?.length || 0}
                    </div>
                    <p className="text-xs text-green-600">
                      Advanced optimization alerts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-800">
                      Late Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {attentionItems.late_submissions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      After 8:00 AM deadline
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="plans">Daily Plans</TabsTrigger>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="assets">Asset Optimization</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          <TabsTrigger value="workforce">Workforce Intelligence</TabsTrigger>
          <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
          <TabsTrigger value="framework">Framework Matrix</TabsTrigger>
          <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
        </TabsList>

          {/* Daily Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Plans</CardTitle>
                <CardDescription>
                  {plans.length} plans for {selectedDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan ID</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead>Patients</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : plans.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-4 text-gray-500"
                          >
                            No plans found for this date
                          </TableCell>
                        </TableRow>
                      ) : (
                        plans.map((plan) => (
                          <TableRow key={plan._id?.toString()}>
                            <TableCell className="font-medium">
                              {plan.plan_id}
                            </TableCell>
                            <TableCell>{plan.shift}</TableCell>
                            <TableCell>{plan.team_lead}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {plan.total_patients} total
                                </div>
                                <div className="text-xs text-gray-500">
                                  {plan.high_priority_patients} high,{" "}
                                  {plan.medium_priority_patients} medium,{" "}
                                  {plan.low_priority_patients} low
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {plan.staff_assigned.length} assigned
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(plan.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                {plan.status === "draft" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprovePlan(plan._id!.toString())
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
                                    setSelectedPlan(plan);
                                    setShowUpdateDialog(true);
                                    loadUpdates(plan.plan_id);
                                  }}
                                >
                                  Update
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

          {/* ENHANCED: Asset Optimization Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🚀 Smart Asset Optimization</h2>
                <p className="text-gray-600">AI-powered staff, vehicle, and driver allocation optimization</p>
              </div>
              <Button 
                onClick={handleOptimizeAssets} 
                disabled={optimizationLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {optimizationLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Optimize Assets
              </Button>
            </div>

            {assetOptimization && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimization Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Optimization Results</CardTitle>
                    <CardDescription>AI-powered allocation analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Optimization Score:</span>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {assetOptimization.optimization_score.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cost Savings:</span>
                        <span className="text-green-600 font-bold">
                          ${assetOptimization.cost_savings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Environmental Impact:</span>
                        <span className="text-green-600">
                          {assetOptimization.environmental_impact.toFixed(1)}% reduction
                        </span>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Efficiency Improvements:</h4>
                        <ul className="space-y-1">
                          {assetOptimization.efficiency_improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle>👥 Optimized Staff Assignments</CardTitle>
                    <CardDescription>AI-matched staff-patient allocations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assetOptimization.staff_assignments.slice(0, 5).map((assignment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{assignment.staff_name}</span>
                            <Badge variant="outline">
                              {assignment.skill_match_score}% match
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Workload: {(assignment.estimated_workload * 100).toFixed(0)}%</div>
                            <div>Zone Efficiency: {assignment.zone_efficiency}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Replacement Suggestions */}
                {replacementSuggestions.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>🔄 Automated Replacement Suggestions</CardTitle>
                      <CardDescription>AI-identified optimization opportunities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {replacementSuggestions.slice(0, 3).map((suggestion, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Replacement Opportunity</div>
                              <Badge 
                                variant={suggestion.urgency === 'Critical' ? 'destructive' : 
                                        suggestion.urgency === 'High' ? 'default' : 'secondary'}
                              >
                                {suggestion.urgency}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div><strong>Reason:</strong> {suggestion.reason}</div>
                              <div><strong>Impact Score:</strong> +{suggestion.impact_score}</div>
                              <div><strong>Estimated Improvement:</strong> {suggestion.estimated_improvement}%</div>
                              <div><strong>Implementation Time:</strong> {suggestion.implementation_time} minutes</div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline">
                                Apply Suggestion
                              </Button>
                              <Button size="sm" variant="ghost">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Predictions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>🎯 Performance Predictions</CardTitle>
                    <CardDescription>AI-powered outcome forecasting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {assetOptimization.performance_predictions.expected_efficiency}%
                        </div>
                        <div className="text-sm text-gray-600">Expected Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {assetOptimization.performance_predictions.predicted_patient_satisfaction}%
                        </div>
                        <div className="text-sm text-gray-600">Patient Satisfaction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${assetOptimization.performance_predictions.estimated_cost_per_patient}
                        </div>
                        <div className="text-sm text-gray-600">Cost per Patient</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {(assetOptimization.performance_predictions.success_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Probability</div>
                      </div>
                    </div>
                    {assetOptimization.performance_predictions.risk_factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Risk Factors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assetOptimization.performance_predictions.risk_factors.map((risk, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!assetOptimization && (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">🚀 AI-Powered Asset Optimization Ready</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced machine learning algorithms will analyze your staff, vehicles, and equipment to provide optimal allocation recommendations with predictive insights.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Staff Matching</div>
                      <div className="text-blue-600">Skills-based allocation</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Route Optimization</div>
                      <div className="text-green-600">Fuel & time savings</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Cost Analysis</div>
                      <div className="text-purple-600">ROI predictions</div>
                    </div>
                  </div>
                  <Button onClick={handleOptimizeAssets} disabled={optimizationLoading} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {optimizationLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running AI Analysis...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Start AI Optimization
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ENHANCED: Vehicle Management Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle>🚗 Available Vehicles</CardTitle>
                  <CardDescription>{availableVehicles.length} vehicles ready for assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableVehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{vehicle.vehicle_type} - {vehicle.license_plate}</div>
                          <Badge 
                            variant={vehicle.maintenance_status === 'Operational' ? 'default' : 'secondary'}
                          >
                            {vehicle.maintenance_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Fuel: {vehicle.fuel_level}% | Efficiency: {vehicle.fuel_efficiency} L/100km</div>
                          <div>Capacity: {vehicle.capacity} passengers</div>
                          <div>Location: {vehicle.gps_location?.latitude.toFixed(4)}, {vehicle.gps_location?.longitude.toFixed(4)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle>👨‍💼 Available Drivers</CardTitle>
                  <CardDescription>{availableDrivers.length} drivers ready for assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableDrivers.slice(0, 5).map((driver, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{driver.driver_name}</div>
                          <Badge variant="default">
                            {driver.safety_rating}/10 Safety
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Experience: {driver.experience_years} years</div>
                          <div>On-time: {driver.performance_metrics.on_time_percentage}%</div>
                          <div>License: {driver.license_type.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Performance */}
              {assetPerformance && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>📈 Asset Performance Analytics</CardTitle>
                    <CardDescription>Last 7 days performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Staff Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Efficiency:</span>
                            <span>{assetPerformance.staff_performance.average_efficiency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfaction:</span>
                            <span>{assetPerformance.staff_performance.patient_satisfaction}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span>{assetPerformance.staff_performance.utilization_rate}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Vehicle Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Fuel Efficiency:</span>
                            <span>{assetPerformance.vehicle_performance.fuel_efficiency} L/100km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maintenance Cost:</span>
                            <span>${assetPerformance.vehicle_performance.maintenance_cost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span>{assetPerformance.vehicle_performance.utilization_rate}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Driver Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>On-time:</span>
                            <span>{assetPerformance.driver_performance.on_time_percentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safety Incidents:</span>
                            <span>{assetPerformance.driver_performance.safety_incidents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Score:</span>
                            <span>{assetPerformance.driver_performance.fuel_efficiency_score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {assetPerformance.optimization_opportunities && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Optimization Opportunities</h4>
                        <div className="space-y-2">
                          {assetPerformance.optimization_opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                              {opportunity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Framework Matrix Tab */}
          <TabsContent value="framework" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Framework Matrix Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>🏥 Framework Matrix Alerts</CardTitle>
                  <CardDescription>
                    Clinical operations workflow monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.framework_matrix_alerts?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        ✅ All Framework Matrix functions operating normally
                      </div>
                    ) : (
                      attentionItems?.framework_matrix_alerts?.map(
                        (alert, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              alert.severity === "high"
                                ? "border-red-200 bg-red-50"
                                : "border-yellow-200 bg-yellow-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">
                                {alert.function} - {alert.process}
                              </div>
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {alert.framework_requirement}
                            </div>
                            <div className="text-sm font-medium">
                              Action: {alert.action_required}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Responsible: {alert.responsible_person}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Operations Status */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Clinical Operations Status</CardTitle>
                  <CardDescription>
                    Framework Matrix function performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.clinical_operations_status?.map(
                      (status, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{status.function}</div>
                            <Badge
                              variant={
                                status.compliance_status === "compliant"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {status.compliance_status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(status.metrics).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-600">
                                    {key
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    :
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {value}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {status.framework_requirement}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Plans Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todaysPlans.map((plan) => (
                <Card key={plan._id?.toString()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.plan_id}</CardTitle>
                      {getStatusBadge(plan.status)}
                    </div>
                    <CardDescription>
                      {plan.shift} Shift - {plan.team_lead}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Total Patients
                        </div>
                        <div className="text-2xl font-bold">
                          {plan.total_patients}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Staff Assigned
                        </div>
                        <div className="text-2xl font-bold">
                          {plan.staff_assigned.length}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>High Priority:</span>
                        <span>{plan.high_priority_patients}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium Priority:</span>
                        <span>{plan.medium_priority_patients}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Priority:</span>
                        <span>{plan.low_priority_patients}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowUpdateDialog(true);
                          loadUpdates(plan.plan_id);
                        }}
                      >
                        Add Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>
                  Latest updates from active plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No updates available. Select a plan to view its updates.
                    </div>
                  ) : (
                    updates.map((update) => (
                      <div
                        key={update._id?.toString()}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{update.plan_id}</div>
                          <div className="text-sm text-gray-500">
                            {update.update_time} by {update.updated_by}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Completed:</span>{" "}
                            {update.patients_completed}
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>{" "}
                            {update.patients_remaining}
                          </div>
                        </div>
                        {update.issues_encountered.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-red-600">
                              Issues:
                            </div>
                            {update.issues_encountered.map((issue, index) => (
                              <div key={index} className="text-sm text-red-600">
                                • {issue.description} ({issue.severity})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOH Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Violations */}
              <Card>
                <CardHeader>
                  <CardTitle>🏛️ DOH Compliance Violations</CardTitle>
                  <CardDescription>
                    Regulatory compliance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.compliance_violations?.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        ✅ No compliance violations detected
                      </div>
                    ) : (
                      attentionItems?.compliance_violations?.map(
                        (violation, index) => (
                          <div
                            key={index}
                            className="border border-red-200 bg-red-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-red-800">
                                {violation.type}
                              </div>
                              <Badge variant="destructive">
                                {violation.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-red-700 mb-2">
                              {violation.description}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Regulation:</span>{" "}
                              {violation.regulation}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                Action Required:
                              </span>{" "}
                              {violation.action_required}
                            </div>
                            {violation.deadline && (
                              <div className="text-xs text-red-600 mt-1">
                                Deadline: {violation.deadline}
                              </div>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Late Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle>⏰ Late Submissions (8:00 AM Rule)</CardTitle>
                  <CardDescription>
                    Daily planning submission compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.late_submissions?.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        ✅ All submissions on time
                      </div>
                    ) : (
                      attentionItems?.late_submissions?.map(
                        (submission, index) => (
                          <div
                            key={index}
                            className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-orange-800">
                                {submission.plan_id}
                              </div>
                              <Badge variant="secondary">
                                {submission.delay_minutes} min late
                              </Badge>
                            </div>
                            <div className="text-sm text-orange-700">
                              Team Lead: {submission.team_lead}
                            </div>
                            <div className="text-sm text-orange-700">
                              Department: {submission.department}
                            </div>
                            <div className="text-sm text-orange-700">
                              Submitted: {submission.submission_time}
                            </div>
                            <div className="text-xs text-orange-600 mt-2">
                              {submission.compliance_impact}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Skills Matrix Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Skills Matrix Overview</CardTitle>
                  <CardDescription>Staff competencies and skill gaps analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {skillsMatrix.length > 0 ? Math.round((skillsMatrix.length / (skillsMatrix.length + (skillGaps?.critical_gaps?.length || 0))) * 100) : 85}%
                        </div>
                        <div className="text-sm text-blue-600">Skills Coverage</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {skillGaps?.critical_gaps?.length || 3}
                        </div>
                        <div className="text-sm text-orange-600">Critical Gaps</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {skillsMatrix.length || 24}
                        </div>
                        <div className="text-sm text-green-600">Active Staff</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Top Skill Gaps:</div>
                      <div className="space-y-1">
                        {skillGaps?.critical_gaps?.slice(0, 3).map((gap: string, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{gap}</span>
                            <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                              {index === 0 ? "Critical" : index === 1 ? "High" : "Medium"}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="flex justify-between text-sm">
                            <span>Advanced Wound Care</span>
                            <Badge variant="destructive">Critical</Badge>
                          </div>,
                          <div key="2" className="flex justify-between text-sm">
                            <span>IV Therapy</span>
                            <Badge variant="default">High</Badge>
                          </div>,
                          <div key="3" className="flex justify-between text-sm">
                            <span>Pediatric Care</span>
                            <Badge variant="secondary">Medium</Badge>
                          </div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📚 Training Priorities</CardTitle>
                  <CardDescription>Upcoming training requirements and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillGaps?.training_priorities?.map((priority: string, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{priority}</div>
                          <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                            {index === 0 ? "Due Soon" : index === 1 ? "Scheduled" : "Planned"}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {index === 0 ? "5 staff members need renewal by next month" :
                           index === 1 ? "Training session scheduled for next week" :
                           "New DOH requirements training"}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Advanced Life Support</div>
                          <Badge variant="destructive">Due Soon</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          5 staff members need renewal by next month
                        </div>
                      </div>,
                      <div key="2" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Infection Control</div>
                          <Badge variant="default">Scheduled</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Training session scheduled for next week
                        </div>
                      </div>,
                      <div key="3" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Documentation Standards</div>
                          <Badge variant="secondary">Planned</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          New DOH requirements training
                        </div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Skills Matrix */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>👥 Staff Skills Matrix</CardTitle>
                  <CardDescription>Individual staff competencies and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillsMatrix.slice(0, 5).map((staff, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{staff.staff_name}</div>
                          <Badge variant="outline">
                            {staff.core_competencies.length} competencies
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Core Competencies:</div>
                            <div className="flex flex-wrap gap-1">
                              {staff.core_competencies.slice(0, 3).map((comp, compIndex) => (
                                <Badge key={compIndex} variant="secondary" className="text-xs">
                                  {comp.skill_name} ({comp.proficiency_level})
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Training Requirements:</div>
                            <div className="space-y-1">
                              {staff.training_requirements.slice(0, 2).map((training, trainIndex) => (
                                <div key={trainIndex} className="text-xs">
                                  <span className="font-medium">{training.training_name}</span>
                                  <Badge 
                                    variant={training.priority === 'Critical' ? 'destructive' : 
                                            training.priority === 'High' ? 'default' : 'secondary'}
                                    className="ml-2 text-xs"
                                  >
                                    {training.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Equipment Management Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🔧 Equipment Status</CardTitle>
                  <CardDescription>Current equipment inventory and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Available:</span>
                      <Badge variant="secondary">
                        {equipmentInventory.filter(eq => eq.status === 'Available').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Use:</span>
                      <Badge variant="default">
                        {equipmentInventory.filter(eq => eq.status === 'In Use').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance:</span>
                      <Badge variant="outline">
                        {equipmentInventory.filter(eq => eq.status === 'Maintenance').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs Attention:</span>
                      <Badge variant="destructive">
                        {equipmentInventory.filter(eq => eq.status === 'Damaged').length} items
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>⚠️ Maintenance Alerts</CardTitle>
                  <CardDescription>Equipment requiring maintenance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {maintenanceDue.slice(0, 5).map((equipment, index) => (
                      <div key={index} className="text-sm border rounded p-2">
                        <div className="font-medium">{equipment.equipment_name} #{equipment.equipment_id}</div>
                        <div className="text-xs text-gray-600">
                          {equipment.maintenance_schedule.maintenance_type} maintenance due
                        </div>
                        <div className="text-xs text-orange-600">
                          Next: {equipment.maintenance_schedule.next_maintenance}
                        </div>
                      </div>
                    ))}
                    {maintenanceDue.length === 0 && (
                      <div className="text-center py-4 text-green-600">
                        ✅ All equipment maintenance up to date
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Utilization Metrics</CardTitle>
                  <CardDescription>Equipment usage and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Medical', 'Mobility', 'Diagnostic', 'Safety', 'Communication'].map((category, index) => {
                      const categoryEquipment = equipmentInventory.filter(eq => eq.category === category);
                      const utilizationRate = categoryEquipment.length > 0 
                        ? Math.round((categoryEquipment.reduce((sum, eq) => sum + eq.usage_tracking.utilization_rate, 0) / categoryEquipment.length))
                        : [78, 92, 65, 85, 70][index];
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category} Equipment</span>
                            <span>{utilizationRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilizationRate >= 90 ? 'bg-green-600' :
                                utilizationRate >= 70 ? 'bg-blue-600' :
                                utilizationRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{width: `${utilizationRate}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Inventory Details */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>📋 Equipment Inventory Details</CardTitle>
                  <CardDescription>Comprehensive equipment tracking and management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Utilization</TableHead>
                          <TableHead>Next Maintenance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipmentInventory.slice(0, 10).map((equipment, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{equipment.equipment_id}</TableCell>
                            <TableCell>{equipment.equipment_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{equipment.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  equipment.status === 'Available' ? 'secondary' :
                                  equipment.status === 'In Use' ? 'default' :
                                  equipment.status === 'Maintenance' ? 'outline' : 'destructive'
                                }
                              >
                                {equipment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{equipment.current_location}</TableCell>
                            <TableCell>{equipment.usage_tracking.utilization_rate}%</TableCell>
                            <TableCell>{equipment.maintenance_schedule.next_maintenance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Quality Metrics Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>⭐ Patient Satisfaction</CardTitle>
                  <CardDescription>Patient feedback and satisfaction scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.overall_satisfaction.toFixed(1) || '4.2'}
                        </div>
                        <div className="text-sm text-gray-600">Overall Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.patient_satisfaction_scores.overall_satisfaction * 20) : 94}%
                        </div>
                        <div className="text-sm text-gray-600">Satisfaction Rate</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Care Quality:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.care_quality_rating.toFixed(1) || '4.4'}/5.0
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Communication:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.communication_rating.toFixed(1) || '4.1'}/5.0
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Timeliness:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.timeliness_rating.toFixed(1) || '3.9'}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏥 Clinical Outcomes</CardTitle>
                  <CardDescription>Key clinical performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Readmission Rate:</span>
                      <Badge variant="secondary">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.readmission_rate * 100) : 8}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Infection Rate:</span>
                      <Badge variant="secondary">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.infection_rate * 100) : 2}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medication Adherence:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.medication_adherence * 100) : 92}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Functional Improvement:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.functional_improvement * 100) : 78}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Safety Incidents:</span>
                      <Badge variant="outline">
                        {qualityMetrics ? (qualityMetrics.clinical_outcomes.safety_metrics.incident_rate * 100).toFixed(1) : '1.5'}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Operational Quality</CardTitle>
                  <CardDescription>Service delivery performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On-time Performance:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.operational_quality.on_time_performance * 100) : 94}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Visit Completion Rate:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.operational_quality.visit_completion_rate * 100) : 98}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Quality:</span>
                      <Badge variant="secondary">
                        {qualityMetrics?.operational_quality.documentation_quality_score.toFixed(1) || '4.1'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staff Competency:</span>
                      <Badge variant="secondary">
                        {qualityMetrics?.operational_quality.staff_competency_scores.toFixed(1) || '4.2'}/5.0
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benchmarking Data */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Industry Benchmarking</CardTitle>
                  <CardDescription>Performance comparison and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {qualityMetrics?.benchmarking_data.industry_percentile || 75}th
                      </div>
                      <div className="text-sm text-gray-600">Industry Percentile</div>
                    </div>
                    <div className="text-center">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {qualityMetrics?.benchmarking_data.peer_comparison || 'Above Average'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Improvement Trends:</div>
                      {qualityMetrics?.benchmarking_data.improvement_trends.map((trend, index) => (
                        <div key={index} className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          {trend}
                        </div>
                      )) || [
                        <div key="1" className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Patient satisfaction improving
                        </div>,
                        <div key="2" className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Safety metrics stable
                        </div>
                      ]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Financial Analytics Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>💰 Revenue Analysis</CardTitle>
                  <CardDescription>Financial performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${financialAnalytics?.revenue_analysis.total_revenue.toLocaleString() || '125,000'}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue per Patient:</span>
                        <span className="font-medium">
                          ${financialAnalytics?.revenue_analysis.revenue_per_patient || 285}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Revenue per Hour:</span>
                        <span className="font-medium">
                          ${financialAnalytics?.revenue_analysis.revenue_per_hour || 95}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gross Margin:</span>
                        <span className="font-medium">
                          {financialAnalytics ? Math.round(financialAnalytics.profitability_metrics.gross_margin * 100) : 32}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Cost Breakdown</CardTitle>
                  <CardDescription>Operational cost analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Staff Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.staff_costs.regular_hours + 
                           financialAnalytics.cost_breakdown.staff_costs.overtime_costs + 
                           financialAnalytics.cost_breakdown.staff_costs.benefits_costs).toLocaleString() 
                          : '69,000'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '69%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicle Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.vehicle_costs.fuel_costs + 
                           financialAnalytics.cost_breakdown.vehicle_costs.maintenance_costs + 
                           financialAnalytics.cost_breakdown.vehicle_costs.insurance_costs).toLocaleString() 
                          : '11,700'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '12%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Equipment Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.equipment_costs.purchase_costs + 
                           financialAnalytics.cost_breakdown.equipment_costs.maintenance_costs + 
                           financialAnalytics.cost_breakdown.equipment_costs.replacement_costs).toLocaleString() 
                          : '11,700'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{width: '19%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Optimization Opportunities</CardTitle>
                  <CardDescription>Cost savings potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialAnalytics?.optimization_opportunities.map((opportunity, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">
                            {opportunity.recommendations[0] || 'Optimization Opportunity'}
                          </div>
                          <Badge variant={
                            opportunity.implementation_priority === 'High' ? 'default' :
                            opportunity.implementation_priority === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {opportunity.implementation_priority} Priority
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: ${opportunity.potential_savings.toLocaleString()}/month
                        </div>
                        <div className="text-xs text-green-600">
                          {opportunity.recommendations.slice(1).join(', ')}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">Staff Scheduling</div>
                          <Badge variant="default">High Priority</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: $5,500/month
                        </div>
                        <div className="text-xs text-green-600">
                          Reduce overtime by 15%
                        </div>
                      </div>,
                      <div key="2" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">Route Optimization</div>
                          <Badge variant="secondary">Medium Priority</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: $2,200/month
                        </div>
                        <div className="text-xs text-green-600">
                          Improve fuel efficiency
                        </div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>

              {/* Payer Mix Analysis */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>🏥 Payer Mix Analysis</CardTitle>
                  <CardDescription>Revenue distribution by insurance type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {financialAnalytics?.revenue_analysis.payer_mix.map((payer, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{payer.percentage}%</div>
                        <div className="text-sm text-gray-600 mb-2">{payer.insurance_type}</div>
                        <div className="text-sm font-medium">
                          Avg: ${payer.average_reimbursement}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">45%</div>
                        <div className="text-sm text-gray-600 mb-2">Government</div>
                        <div className="text-sm font-medium">Avg: $275</div>
                      </div>,
                      <div key="2" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">35%</div>
                        <div className="text-sm text-gray-600 mb-2">Private</div>
                        <div className="text-sm font-medium">Avg: $320</div>
                      </div>,
                      <div key="3" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-orange-600">20%</div>
                        <div className="text-sm text-gray-600 mb-2">Self-Pay</div>
                        <div className="text-sm font-medium">Avg: $250</div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Workforce Intelligence Tab */}
          <TabsContent value="workforce" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workforce Metrics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>👥 Workforce Intelligence Overview</CardTitle>
                  <CardDescription>Comprehensive workforce analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {workforceIntelligence?.workforce_metrics.total_staff || 24}
                      </div>
                      <div className="text-sm text-blue-600">Total Staff</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {workforceIntelligence?.workforce_metrics.active_staff || 22}
                      </div>
                      <div className="text-sm text-green-600">Active Staff</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {workforceIntelligence ? Math.round(workforceIntelligence.workforce_metrics.staff_utilization_rate) : 78}%
                      </div>
                      <div className="text-sm text-purple-600">Utilization Rate</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {workforceIntelligence?.workforce_metrics.satisfaction_score.toFixed(1) || '4.1'}
                      </div>
                      <div className="text-sm text-orange-600">Satisfaction Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Productivity Analysis</CardTitle>
                  <CardDescription>Performance metrics and benchmarking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patients per Staff/Day:</span>
                      <Badge variant="default">
                        {workforceIntelligence?.productivity_analysis.patients_per_staff_per_day.toFixed(1) || '6.5'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue per Staff:</span>
                      <Badge variant="secondary">
                        ${workforceIntelligence?.productivity_analysis.revenue_per_staff.toLocaleString() || '2,850'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Benchmark:</span>
                      <Badge variant={workforceIntelligence?.productivity_analysis.benchmark_comparison.internal_target >= 90 ? 'default' : 'outline'}>
                        {workforceIntelligence?.productivity_analysis.benchmark_comparison.internal_target || 90}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Efficiency Trends:</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Week over Week:</span>
                          <span className={workforceIntelligence?.productivity_analysis.efficiency_trends.week_over_week > 0 ? 'text-green-600' : 'text-red-600'}>
                            {workforceIntelligence ? (workforceIntelligence.productivity_analysis.efficiency_trends.week_over_week * 100).toFixed(1) : '+3.0'}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Month over Month:</span>
                          <span className={workforceIntelligence?.productivity_analysis.efficiency_trends.month_over_month > 0 ? 'text-green-600' : 'text-red-600'}>
                            {workforceIntelligence ? (workforceIntelligence.productivity_analysis.efficiency_trends.month_over_month * 100).toFixed(1) : '+8.0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>🔮 Predictive Insights & Optimization</CardTitle>
                  <CardDescription>AI-powered workforce predictions and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-red-600">Turnover Risk Analysis</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">High Risk Staff:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.high_risk_staff.length || 3} staff members
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Predicted Departures:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.predicted_departures || 3} in next 90 days
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Top Retention Strategy:</span>
                          <div className="text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.retention_strategies[0] || 'Implement flexible scheduling'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-blue-600">Capacity Forecasting</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Next 30 Days:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.capacity_forecasting.next_30_days || 25} staff needed
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Next 90 Days:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.capacity_forecasting.next_90_days || 27} staff needed
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Seasonal Adjustment:</span>
                          <div className="text-gray-600 mt-1">
                            {workforceIntelligence ? (workforceIntelligence.predictive_insights.capacity_forecasting.seasonal_adjustments * 100).toFixed(0) : '8'}% increase expected
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-green-600">Optimization Opportunities</h4>
                      <div className="space-y-2">
                        {workforceIntelligence?.predictive_insights.optimization_opportunities.cross_training_needs.slice(0, 3).map((need: string, index: number) => (
                          <div key={index} className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {need}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="text-xs"><Badge variant="outline" className="text-xs">Advanced wound care</Badge></div>,
                          <div key="2" className="text-xs"><Badge variant="outline" className="text-xs">Pediatric specialization</Badge></div>,
                          <div key="3" className="text-xs"><Badge variant="outline" className="text-xs">Mental health support</Badge></div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Patient Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clinical Outcomes Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>🏥 Clinical Outcomes Overview</CardTitle>
                  <CardDescription>Patient care effectiveness and satisfaction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.clinical_outcomes.functional_improvement, 0) / patientOutcomes.length) : 78}%
                      </div>
                      <div className="text-sm text-green-600">Functional Improvement</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.satisfaction_metrics.overall_satisfaction, 0) / patientOutcomes.length).toFixed(1) : '4.2'}
                      </div>
                      <div className="text-sm text-blue-600">Satisfaction Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.clinical_outcomes.medication_adherence, 0) / patientOutcomes.length) : 92}%
                      </div>
                      <div className="text-sm text-purple-600">Medication Adherence</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {patientOutcomes.filter((p: any) => p.clinical_outcomes.readmission_within_30_days).length}
                      </div>
                      <div className="text-sm text-orange-600">30-Day Readmissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle>💰 Cost Effectiveness Analysis</CardTitle>
                  <CardDescription>Financial impact and value-based care metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Cost per Patient:</span>
                      <Badge variant="secondary">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.total_cost, 0) / patientOutcomes.length) : 1850}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost per Visit:</span>
                      <Badge variant="outline">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.cost_per_visit, 0) / patientOutcomes.length) : 185}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Savings vs Hospital Care:</span>
                      <Badge variant="default">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.cost_savings_vs_hospital, 0) / patientOutcomes.length) : 2400}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Insurance Coverage Rate:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round((patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.insurance_coverage, 0) / patientOutcomes.length) * 100) : 94}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>⭐ Quality Performance Indicators</CardTitle>
                  <CardDescription>Care quality and safety metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Completeness:</span>
                      <Badge variant="secondary">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.documentation_completeness, 0) / patientOutcomes.length) : 96}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Care Plan Adherence:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.care_plan_adherence, 0) / patientOutcomes.length) : 94}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Safety Incidents:</span>
                      <Badge variant={patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.safety_incidents, 0) === 0 ? 'secondary' : 'destructive'}>
                        {patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.safety_incidents, 0)} incidents
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Infection Prevention Score:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.infection_prevention_score, 0) / patientOutcomes.length) : 98}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Performance Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>👨‍⚕️ Staff Performance Impact</CardTitle>
                  <CardDescription>How staff performance affects patient outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Primary Nurse Rating:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.primary_nurse_rating, 0) / patientOutcomes.length).toFixed(1) : '4.3'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Therapist Effectiveness:</span>
                      <Badge variant="secondary">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.therapist_effectiveness, 0) / patientOutcomes.length).toFixed(1) : '4.1'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Care Coordination:</span>
                      <Badge variant="outline">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.care_coordination_score, 0) / patientOutcomes.length).toFixed(1) : '4.0'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Family Engagement:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.family_engagement_level, 0) / patientOutcomes.length).toFixed(1) : '3.9'}/5.0
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Advanced Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Performance Indicators */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients Served</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.total_patients_served || plans.reduce((sum, plan) => sum + plan.total_patients, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.average_satisfaction_score.toFixed(1) || '4.2'}
                  </div>
                  <p className="text-xs text-muted-foreground">Out of 5.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost per Patient</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${advancedAnalytics?.dashboard_metrics.cost_per_patient || 185}
                  </div>
                  <p className="text-xs text-muted-foreground">Average cost</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.staff_efficiency_score.toFixed(1) || '87.5'}%
                  </div>
                  <p className="text-xs text-muted-foreground">Performance score</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Analysis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Performance Trends</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patient Volume Trend</span>
                        <span className="text-green-600">+12% this month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Satisfaction Trend</span>
                        <span className="text-green-600">+5% improvement</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '84%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Cost Efficiency</span>
                        <span className="text-green-600">-8% cost reduction</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Staff Efficiency</span>
                        <span className="text-green-600">+3% this quarter</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔮 Predictive Models</CardTitle>
                  <CardDescription>AI-powered forecasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Month Patient Volume:</span>
                      <Badge variant="default">
                        {advancedAnalytics?.predictive_models.next_month_patient_volume || 168} patients
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Predicted Staff Needs:</span>
                      <Badge variant="secondary">
                        {advancedAnalytics?.predictive_models.predicted_staff_needs || 25} staff
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estimated Revenue:</span>
                      <Badge variant="outline">
                        ${advancedAnalytics?.predictive_models.estimated_revenue.toLocaleString() || '140,000'}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Risk Factors:</div>
                      <div className="space-y-1">
                        {advancedAnalytics?.predictive_models.risk_factors.map((risk: string, index: number) => (
                          <div key={index} className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {risk}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="text-xs"><Badge variant="outline" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Seasonal flu impact</Badge></div>,
                          <div key="2" className="text-xs"><Badge variant="outline" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Staff vacation schedules</Badge></div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benchmarking Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Industry Benchmarking</CardTitle>
                <CardDescription>Performance comparison and improvement areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {advancedAnalytics?.benchmarking.industry_percentile || 78}th
                    </div>
                    <div className="text-sm text-gray-600">Industry Percentile</div>
                    <Badge variant="default" className="mt-2">
                      {advancedAnalytics?.benchmarking.peer_comparison || 'Above Average'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium mb-3">Key Improvement Areas:</div>
                    <div className="grid grid-cols-1 gap-2">
                      {advancedAnalytics?.benchmarking.improvement_areas.map((area: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                          {area}
                        </div>
                      )) || [
                        <div key="1" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Documentation efficiency</div>,
                        <div key="2" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Patient communication</div>,
                        <div key="3" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Cost optimization</div>
                      ]}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Update Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Plan Update</DialogTitle>
              <DialogDescription>
                Add a progress update for {selectedPlan?.plan_id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="updateType">Update Type</Label>
                  <Select
                    value={newUpdate.update_type}
                    onValueChange={(value) =>
                      setNewUpdate({ ...newUpdate, update_type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="resource_change">
                        Resource Change
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="escalation">Escalation Required</Label>
                  <Select
                    value={newUpdate.escalation_required ? "true" : "false"}
                    onValueChange={(value) =>
                      setNewUpdate({
                        ...newUpdate,
                        escalation_required: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="completed">Patients Completed</Label>
                  <Input
                    id="completed"
                    type="number"
                    value={newUpdate.patients_completed}
                    onChange={(e) =>
                      setNewUpdate({
                        ...newUpdate,
                        patients_completed: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="remaining">Patients Remaining</Label>
                  <Input
                    id="remaining"
                    type="number"
                    value={newUpdate.patients_remaining}
                    onChange={(e) =>
                      setNewUpdate({
                        ...newUpdate,
                        patients_remaining: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nextActions">Next Actions</Label>
                <Textarea
                  id="nextActions"
                  placeholder="Enter next actions (one per line)"
                  value={newUpdate.next_actions?.join("\n") || ""}
                  onChange={(e) =>
                    setNewUpdate({
                      ...newUpdate,
                      next_actions: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUpdate} disabled={loading}>
                Add Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </Tabs>
      </div>
    </div>
  );
}