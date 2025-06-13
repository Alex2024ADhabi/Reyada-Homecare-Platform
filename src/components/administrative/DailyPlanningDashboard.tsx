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
import { useOfflineSync } from "@/hooks/useOfflineSync";

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

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [plansData, todaysData, attentionData] = await Promise.all([
        getDailyPlans({
          date_from: selectedDate,
          date_to: selectedDate,
          department,
        }),
        getTodaysActivePlans(),
        getPlansRequiringAttention(),
      ]);
      setPlans(plansData);
      setTodaysPlans(todaysData);
      setAttentionItems(attentionData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="plans">Daily Plans</TabsTrigger>
            <TabsTrigger value="active">Active Plans</TabsTrigger>
            <TabsTrigger value="framework">Framework Matrix</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Plans
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    For selected date
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Plans
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysPlans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {plans.reduce((sum, plan) => sum + plan.total_patients, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all plans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Staff Assigned
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {plans.reduce(
                      (sum, plan) => sum + plan.staff_assigned.length,
                      0,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total assignments
                  </p>
                </CardContent>
              </Card>
            </div>
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
      </div>
    </div>
  );
}
