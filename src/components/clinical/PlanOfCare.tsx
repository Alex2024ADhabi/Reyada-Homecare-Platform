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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePlanOfCare } from "@/hooks/usePlanOfCare";
import { PlanOfCareData } from "@/services/planOfCare.service";
import {
  FileText,
  ClipboardCheck,
  Users,
  MessageSquare,
  Play,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  UserCheck,
  Target,
  Briefcase,
  Shield,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface PlanOfCareProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
}

// Using PlanOfCareData from the service instead of defining it here

const PlanOfCare: React.FC<PlanOfCareProps> = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline = false,
}) => {
  const [activeProcess, setActiveProcess] = useState("initial-development");
  const [planProgress, setPlanProgress] = useState(15);
  const [planId, setPlanId] = useState<string | undefined>(undefined);

  // Use the usePlanOfCare hook to manage plan data
  const {
    plan,
    plans,
    isLoading,
    error,
    isOnline,
    fetchPlan,
    fetchPatientPlans,
    createPlan,
    updatePlan,
    updatePlanStatus,
    markNursingInputCompleted,
    markPhysicianReviewCompleted,
    savePlanOfCare,
  } = usePlanOfCare({ patientId, planId });

  // Mock data for staff
  const clinicalStaff = [
    { id: "S001", name: "Dr. Khalid Al Mazrouei", role: "Physician" },
    { id: "S002", name: "Dr. Layla Al Shamsi", role: "Nurse Supervisor" },
    { id: "S003", name: "Ahmed Al Mansoori", role: "Physical Therapist" },
    { id: "S004", name: "Fatima Al Zaabi", role: "Occupational Therapist" },
    { id: "S005", name: "Mohammed Al Hashimi", role: "Speech Therapist" },
    { id: "S006", name: "Aisha Al Dhaheri", role: "Respiratory Therapist" },
    { id: "S007", name: "Noura Al Kaabi", role: "Social Worker" },
  ];

  // Local state for the plan of care
  const [planOfCare, setPlanOfCare] = useState<PlanOfCareData>({
    patientId: patientId,
    planType: "Initial",
    planVersion: 1,
    effectiveDate: "",
    reviewDate: "",
    expirationDate: "",
    developmentInitiatedDate: new Date().toISOString().split("T")[0],
    developmentInitiatedBy: "S002",

    nursingInputCompleted: false,

    ptInputRequired: false,
    ptInputCompleted: false,

    otInputRequired: false,
    otInputCompleted: false,

    stInputRequired: false,
    stInputCompleted: false,

    rtInputRequired: false,
    rtInputCompleted: false,

    socialWorkInputRequired: false,
    socialWorkInputCompleted: false,

    submittedForPhysicianReview: false,
    physicianReviewCompleted: false,

    prescriptionOrdersCompleted: false,
    treatmentOrdersCompleted: false,
    diagnosticOrdersCompleted: false,

    familyEducationScheduled: false,
    familyEducationCompleted: false,
    familyConsentObtained: false,
    familyQuestionsAddressed: false,

    staffCommunicationCompleted: false,
    staffTrainingRequired: false,
    staffTrainingCompleted: false,
    communicationProtocolsEstablished: false,

    implementationStarted: false,
    monitoringProtocolsActive: false,

    planStatus: "Developing",
  });

  // Load existing plan or fetch patient plans on component mount
  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    } else if (patientId) {
      fetchPatientPlans(patientId);
    }
  }, [planId, patientId, fetchPlan, fetchPatientPlans]);

  // Update local state when plan data is loaded
  useEffect(() => {
    if (plan) {
      setPlanOfCare(plan);
      setPlanProgress(calculateCompletionPercentage(plan));
    }
  }, [plan]);

  const calculateCompletionPercentage = (plan: PlanOfCareData) => {
    let totalFields = 0;
    let completedFields = 0;

    // Process 1: Initial Plan Development
    if (plan.nursingInputCompleted) completedFields++;
    totalFields++;

    if (plan.ptInputRequired) {
      totalFields++;
      if (plan.ptInputCompleted) completedFields++;
    }

    if (plan.otInputRequired) {
      totalFields++;
      if (plan.otInputCompleted) completedFields++;
    }

    if (plan.stInputRequired) {
      totalFields++;
      if (plan.stInputCompleted) completedFields++;
    }

    if (plan.rtInputRequired) {
      totalFields++;
      if (plan.rtInputCompleted) completedFields++;
    }

    if (plan.socialWorkInputRequired) {
      totalFields++;
      if (plan.socialWorkInputCompleted) completedFields++;
    }

    // Process 2: Physician Review and Approval
    if (plan.submittedForPhysicianReview) completedFields++;
    totalFields++;

    if (plan.physicianReviewCompleted) completedFields++;
    totalFields++;

    if (plan.prescriptionOrdersCompleted) completedFields++;
    if (plan.treatmentOrdersCompleted) completedFields++;
    if (plan.diagnosticOrdersCompleted) completedFields++;
    totalFields += 3;

    // Process 3: Family Education and Consent
    if (plan.familyEducationScheduled) completedFields++;
    totalFields++;

    if (plan.familyEducationCompleted) completedFields++;
    totalFields++;

    if (plan.familyConsentObtained) completedFields++;
    totalFields++;

    if (plan.familyQuestionsAddressed) completedFields++;
    totalFields++;

    // Process 4: Staff Communication and Training
    if (plan.staffCommunicationCompleted) completedFields++;
    totalFields++;

    if (plan.staffTrainingRequired) {
      totalFields++;
      if (plan.staffTrainingCompleted) completedFields++;
    }

    if (plan.communicationProtocolsEstablished) completedFields++;
    totalFields++;

    // Process 5: Implementation and Monitoring
    if (plan.implementationStarted) completedFields++;
    totalFields++;

    if (plan.monitoringProtocolsActive) completedFields++;
    totalFields++;

    // Goals, resources, and other fields
    if (plan.shortTermGoals) completedFields++;
    if (plan.longTermGoals) completedFields++;
    if (plan.measurableOutcomes) completedFields++;
    if (plan.goalTargetDates) completedFields++;
    totalFields += 4;

    if (plan.equipmentRequirements) completedFields++;
    if (plan.supplyRequirements) completedFields++;
    if (plan.staffingRequirements) completedFields++;
    if (plan.familyCaregiverRequirements) completedFields++;
    totalFields += 4;

    if (plan.safetyConsiderations) completedFields++;
    if (plan.riskMitigationStrategies) completedFields++;
    if (plan.qualityIndicators) completedFields++;
    totalFields += 3;

    return Math.round((completedFields / totalFields) * 100);
  };

  const handleSave = async () => {
    try {
      // Save the plan of care using the hook
      const savedPlan = await savePlanOfCare(planOfCare);

      if (savedPlan) {
        // If this is a new plan, update the planId
        if (savedPlan.id && !planId) {
          setPlanId(savedPlan.id);
        }

        // Update the progress
        setPlanProgress(calculateCompletionPercentage(savedPlan));

        if (!isOnline) {
          alert(
            "Plan of Care saved locally. Will sync when online connection is restored.",
          );
        } else {
          alert("Plan of Care saved successfully.");
        }
      }
    } catch (err) {
      console.error("Error saving plan of care:", err);
      alert("Failed to save Plan of Care. Please try again.");
    }
  };

  const handleToggleField = (
    field: keyof PlanOfCareData,
    value: boolean | string,
  ) => {
    setPlanOfCare((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlanStatusChange = async (
    status: PlanOfCareData["planStatus"],
  ) => {
    // Update local state
    setPlanOfCare((prev) => ({
      ...prev,
      planStatus: status,
    }));

    // If we have a plan ID, update the status through the service
    if (planId) {
      try {
        const updatedPlan = await updatePlanStatus(planId, status);
        if (updatedPlan) {
          setPlanProgress(calculateCompletionPercentage(updatedPlan));
        }
      } catch (err) {
        console.error("Error updating plan status:", err);
      }
    } else {
      // For new plans, just update the progress locally
      setPlanProgress(
        calculateCompletionPercentage({
          ...planOfCare,
          planStatus: status,
        }),
      );
    }
  };

  // Handle marking nursing input as completed
  const handleMarkNursingInputCompleted = async () => {
    if (planId) {
      try {
        const updatedPlan = await markNursingInputCompleted(
          planId,
          planOfCare.developmentInitiatedBy,
        );
        if (updatedPlan) {
          setPlanOfCare(updatedPlan);
          setPlanProgress(calculateCompletionPercentage(updatedPlan));
        }
      } catch (err) {
        console.error("Error marking nursing input as completed:", err);
      }
    } else {
      // For new plans, just update the local state
      handleToggleField("nursingInputCompleted", true);
      handleToggleField("nursingInputDate", new Date().toISOString());
      handleToggleField("nursingInputBy", planOfCare.developmentInitiatedBy);
    }
  };

  // Handle marking physician review as completed
  const handleMarkPhysicianReviewCompleted = async (
    physicianId: string,
    approvalStatus: PlanOfCareData["physicianApprovalStatus"],
    comments?: string,
  ) => {
    if (planId) {
      try {
        const updatedPlan = await markPhysicianReviewCompleted(
          planId,
          physicianId,
          approvalStatus,
          comments,
        );
        if (updatedPlan) {
          setPlanOfCare(updatedPlan);
          setPlanProgress(calculateCompletionPercentage(updatedPlan));
        }
      } catch (err) {
        console.error("Error marking physician review as completed:", err);
      }
    } else {
      // For new plans, just update the local state
      handleToggleField("physicianReviewCompleted", true);
      handleToggleField("physicianReviewDate", new Date().toISOString());
      handleToggleField("physicianReviewer", physicianId);
      handleToggleField("physicianApprovalStatus", approvalStatus);
      if (comments) handleToggleField("physicianComments", comments);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-background p-4 md:p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading Plan of Care...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full bg-background p-4 md:p-6 flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Error Loading Plan of Care</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() =>
            planId ? fetchPlan(planId) : fetchPatientPlans(patientId)
          }
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Header with Plan Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Plan of Care</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">Episode: {episodeId}</Badge>
            <Badge variant="outline">Patient ID: {patientId}</Badge>
            <Badge variant="outline">Version: {planOfCare.planVersion}</Badge>
            <Badge
              className={`${
                planOfCare.planStatus === "Active"
                  ? "bg-green-100 text-green-800"
                  : planOfCare.planStatus === "Approved"
                    ? "bg-blue-100 text-blue-800"
                    : planOfCare.planStatus === "Under Review"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {planOfCare.planStatus}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={planOfCare.planStatus}
            onValueChange={(value) =>
              handlePlanStatusChange(value as PlanOfCareData["planStatus"])
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plan Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Developing">Developing</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Revised">Revised</SelectItem>
              <SelectItem value="Discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant={!isOnline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {!isOnline ? "Offline Mode" : "Online"}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Plan of Care Completion
              </span>
              <span className="text-sm font-medium">{planProgress}%</span>
            </div>
            <Progress value={planProgress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground mt-2">
              <div
                className={`flex items-center gap-1 ${planProgress >= 20 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${planProgress >= 20 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Development</span>
              </div>
              <div
                className={`flex items-center gap-1 ${planProgress >= 40 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${planProgress >= 40 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Physician Review</span>
              </div>
              <div
                className={`flex items-center gap-1 ${planProgress >= 60 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${planProgress >= 60 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Family Consent</span>
              </div>
              <div
                className={`flex items-center gap-1 ${planProgress >= 80 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${planProgress >= 80 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Staff Training</span>
              </div>
              <div
                className={`flex items-center gap-1 ${planProgress >= 100 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${planProgress >= 100 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Implementation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Tabs */}
      <Tabs
        value={activeProcess}
        onValueChange={setActiveProcess}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="initial-development">
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Initial Development</span>
          </TabsTrigger>
          <TabsTrigger value="physician-review">
            <ClipboardCheck className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Physician Review</span>
          </TabsTrigger>
          <TabsTrigger value="family-education">
            <MessageSquare className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Family Education</span>
          </TabsTrigger>
          <TabsTrigger value="staff-communication">
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Staff Communication</span>
          </TabsTrigger>
          <TabsTrigger value="implementation">
            <Play className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Implementation</span>
          </TabsTrigger>
        </TabsList>

        {/* Process 1: Initial Plan Development */}
        <TabsContent value="initial-development" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Initial Plan Development
              </CardTitle>
              <CardDescription>
                Develop comprehensive initial plan of care based on assessment
                findings, physician orders, and patient/family goals. Coordinate
                input from all relevant disciplines including nursing, therapy
                services, and social services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-type">Plan Type</Label>
                      <Select
                        value={planOfCare.planType}
                        onValueChange={(value) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            planType: value as
                              | "Initial"
                              | "Revised"
                              | "Updated",
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        <SelectTrigger id="plan-type">
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Initial">Initial</SelectItem>
                          <SelectItem value="Revised">Revised</SelectItem>
                          <SelectItem value="Updated">Updated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="plan-version">Version</Label>
                      <Input
                        id="plan-version"
                        type="number"
                        value={planOfCare.planVersion}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            planVersion: parseInt(e.target.value),
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="effective-date">Effective Date</Label>
                      <Input
                        id="effective-date"
                        type="date"
                        value={planOfCare.effectiveDate}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            effectiveDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-date">Review Date</Label>
                      <Input
                        id="review-date"
                        type="date"
                        value={planOfCare.reviewDate}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            reviewDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiration-date">Expiration Date</Label>
                    <Input
                      id="expiration-date"
                      type="date"
                      value={planOfCare.expirationDate}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          expirationDate: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="initiated-date">
                        Development Initiated Date
                      </Label>
                      <Input
                        id="initiated-date"
                        type="date"
                        value={planOfCare.developmentInitiatedDate}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            developmentInitiatedDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="initiated-by">Initiated By</Label>
                      <Select
                        value={planOfCare.developmentInitiatedBy}
                        onValueChange={(value) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            developmentInitiatedBy: value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        <SelectTrigger id="initiated-by">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinicalStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Multi-Disciplinary Input
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nursing-input"
                            checked={planOfCare.nursingInputCompleted}
                            onCheckedChange={(checked) => {
                              if (checked === true) {
                                handleMarkNursingInputCompleted();
                              } else {
                                handleToggleField(
                                  "nursingInputCompleted",
                                  false,
                                );
                              }
                            }}
                          />
                          <Label htmlFor="nursing-input">Nursing Input</Label>
                        </div>
                        {planOfCare.nursingInputCompleted && (
                          <Badge variant="outline" className="ml-2">
                            Completed
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pt-required"
                            checked={planOfCare.ptInputRequired}
                            onCheckedChange={(checked) =>
                              handleToggleField(
                                "ptInputRequired",
                                checked === true,
                              )
                            }
                          />
                          <Label htmlFor="pt-required">
                            Physical Therapy Input
                          </Label>
                        </div>
                        {planOfCare.ptInputRequired && (
                          <Badge
                            variant={
                              planOfCare.ptInputCompleted
                                ? "outline"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {planOfCare.ptInputCompleted
                              ? "Completed"
                              : "Required"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ot-required"
                            checked={planOfCare.otInputRequired}
                            onCheckedChange={(checked) =>
                              handleToggleField(
                                "otInputRequired",
                                checked === true,
                              )
                            }
                          />
                          <Label htmlFor="ot-required">
                            Occupational Therapy Input
                          </Label>
                        </div>
                        {planOfCare.otInputRequired && (
                          <Badge
                            variant={
                              planOfCare.otInputCompleted
                                ? "outline"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {planOfCare.otInputCompleted
                              ? "Completed"
                              : "Required"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="st-required"
                            checked={planOfCare.stInputRequired}
                            onCheckedChange={(checked) =>
                              handleToggleField(
                                "stInputRequired",
                                checked === true,
                              )
                            }
                          />
                          <Label htmlFor="st-required">
                            Speech Therapy Input
                          </Label>
                        </div>
                        {planOfCare.stInputRequired && (
                          <Badge
                            variant={
                              planOfCare.stInputCompleted
                                ? "outline"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {planOfCare.stInputCompleted
                              ? "Completed"
                              : "Required"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rt-required"
                            checked={planOfCare.rtInputRequired}
                            onCheckedChange={(checked) =>
                              handleToggleField(
                                "rtInputRequired",
                                checked === true,
                              )
                            }
                          />
                          <Label htmlFor="rt-required">
                            Respiratory Therapy Input
                          </Label>
                        </div>
                        {planOfCare.rtInputRequired && (
                          <Badge
                            variant={
                              planOfCare.rtInputCompleted
                                ? "outline"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {planOfCare.rtInputCompleted
                              ? "Completed"
                              : "Required"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="social-work-required"
                            checked={planOfCare.socialWorkInputRequired}
                            onCheckedChange={(checked) =>
                              handleToggleField(
                                "socialWorkInputRequired",
                                checked === true,
                              )
                            }
                          />
                          <Label htmlFor="social-work-required">
                            Social Work Input
                          </Label>
                        </div>
                        {planOfCare.socialWorkInputRequired && (
                          <Badge
                            variant={
                              planOfCare.socialWorkInputCompleted
                                ? "outline"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {planOfCare.socialWorkInputCompleted
                              ? "Completed"
                              : "Required"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short-term-goals">Short-Term Goals</Label>
                    <Textarea
                      id="short-term-goals"
                      placeholder="Enter short-term goals"
                      value={planOfCare.shortTermGoals || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          shortTermGoals: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long-term-goals">Long-Term Goals</Label>
                    <Textarea
                      id="long-term-goals"
                      placeholder="Enter long-term goals"
                      value={planOfCare.longTermGoals || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          longTermGoals: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Measurable Outcomes</h4>
                  <Textarea
                    id="measurable-outcomes"
                    placeholder="Enter measurable outcomes"
                    value={planOfCare.measurableOutcomes || ""}
                    onChange={(e) =>
                      setPlanOfCare((prev) => ({
                        ...prev,
                        measurableOutcomes: e.target.value,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Goal Target Dates</h4>
                  <Textarea
                    id="goal-target-dates"
                    placeholder="Enter goal target dates"
                    value={planOfCare.goalTargetDates || ""}
                    onChange={(e) =>
                      setPlanOfCare((prev) => ({
                        ...prev,
                        goalTargetDates: e.target.value,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 2: Physician Review and Approval */}
        <TabsContent value="physician-review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Physician Review and Approval
              </CardTitle>
              <CardDescription>
                Submit completed plan of care to attending physician for medical
                review, approval, and prescription orders. Ensure all medical
                interventions are properly ordered and documented.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submitted-for-review"
                      checked={planOfCare.submittedForPhysicianReview}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "submittedForPhysicianReview",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="submitted-for-review"
                      className="font-medium"
                    >
                      Submitted for Physician Review
                    </Label>
                  </div>

                  {planOfCare.submittedForPhysicianReview && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="submission-date">
                            Submission Date
                          </Label>
                          <Input
                            id="submission-date"
                            type="date"
                            value={planOfCare.submissionDate || ""}
                            onChange={(e) =>
                              setPlanOfCare((prev) => ({
                                ...prev,
                                submissionDate: e.target.value,
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="physician-reviewer">
                            Physician Reviewer
                          </Label>
                          <Select
                            value={planOfCare.physicianReviewer || ""}
                            onValueChange={(value) =>
                              setPlanOfCare((prev) => ({
                                ...prev,
                                physicianReviewer: value,
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          >
                            <SelectTrigger id="physician-reviewer">
                              <SelectValue placeholder="Select physician" />
                            </SelectTrigger>
                            <SelectContent>
                              {clinicalStaff
                                .filter((staff) => staff.role === "Physician")
                                .map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="physician-review-completed"
                          checked={planOfCare.physicianReviewCompleted}
                          onCheckedChange={(checked) => {
                            if (
                              checked === true &&
                              planOfCare.physicianReviewer
                            ) {
                              handleMarkPhysicianReviewCompleted(
                                planOfCare.physicianReviewer,
                                planOfCare.physicianApprovalStatus ||
                                  "Approved",
                              );
                            } else {
                              handleToggleField(
                                "physicianReviewCompleted",
                                checked === true,
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor="physician-review-completed"
                          className="font-medium"
                        >
                          Physician Review Completed
                        </Label>
                      </div>

                      {planOfCare.physicianReviewCompleted && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="physician-review-date">
                                Review Date
                              </Label>
                              <Input
                                id="physician-review-date"
                                type="date"
                                value={planOfCare.physicianReviewDate || ""}
                                onChange={(e) =>
                                  setPlanOfCare((prev) => ({
                                    ...prev,
                                    physicianReviewDate: e.target.value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="approval-status">
                                Approval Status
                              </Label>
                              <Select
                                value={planOfCare.physicianApprovalStatus || ""}
                                onValueChange={(value) =>
                                  setPlanOfCare((prev) => ({
                                    ...prev,
                                    physicianApprovalStatus: value as
                                      | "Approved"
                                      | "Modifications Required"
                                      | "Rejected",
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              >
                                <SelectTrigger id="approval-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Approved">
                                    Approved
                                  </SelectItem>
                                  <SelectItem value="Modifications Required">
                                    Modifications Required
                                  </SelectItem>
                                  <SelectItem value="Rejected">
                                    Rejected
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="physician-comments">
                              Physician Comments
                            </Label>
                            <Textarea
                              id="physician-comments"
                              placeholder="Enter physician comments"
                              value={planOfCare.physicianComments || ""}
                              onChange={(e) =>
                                setPlanOfCare((prev) => ({
                                  ...prev,
                                  physicianComments: e.target.value,
                                  updatedAt: new Date().toISOString(),
                                }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Medical Orders</h4>
                  <div className="bg-muted/50 p-4 rounded-md space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prescription-orders"
                        checked={planOfCare.prescriptionOrdersCompleted}
                        onCheckedChange={(checked) =>
                          handleToggleField(
                            "prescriptionOrdersCompleted",
                            checked === true,
                          )
                        }
                      />
                      <Label htmlFor="prescription-orders">
                        Prescription Orders Completed
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="treatment-orders"
                        checked={planOfCare.treatmentOrdersCompleted}
                        onCheckedChange={(checked) =>
                          handleToggleField(
                            "treatmentOrdersCompleted",
                            checked === true,
                          )
                        }
                      />
                      <Label htmlFor="treatment-orders">
                        Treatment Orders Completed
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="diagnostic-orders"
                        checked={planOfCare.diagnosticOrdersCompleted}
                        onCheckedChange={(checked) =>
                          handleToggleField(
                            "diagnosticOrdersCompleted",
                            checked === true,
                          )
                        }
                      />
                      <Label htmlFor="diagnostic-orders">
                        Diagnostic Orders Completed
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="safety-considerations">
                      Safety Considerations
                    </Label>
                    <Textarea
                      id="safety-considerations"
                      placeholder="Enter safety considerations"
                      value={planOfCare.safetyConsiderations || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          safetyConsiderations: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk-mitigation">
                      Risk Mitigation Strategies
                    </Label>
                    <Textarea
                      id="risk-mitigation"
                      placeholder="Enter risk mitigation strategies"
                      value={planOfCare.riskMitigationStrategies || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          riskMitigationStrategies: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 3: Family Education and Consent */}
        <TabsContent value="family-education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Family Education and Consent
              </CardTitle>
              <CardDescription>
                Conduct comprehensive family education regarding plan of care,
                obtain informed consent, and establish family participation
                expectations and responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="family-education-scheduled"
                      checked={planOfCare.familyEducationScheduled}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "familyEducationScheduled",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="family-education-scheduled"
                      className="font-medium"
                    >
                      Family Education Session Scheduled
                    </Label>
                  </div>

                  {planOfCare.familyEducationScheduled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="family-education-date">
                          Education Date
                        </Label>
                        <Input
                          id="family-education-date"
                          type="date"
                          value={planOfCare.familyEducationDate || ""}
                          onChange={(e) =>
                            setPlanOfCare((prev) => ({
                              ...prev,
                              familyEducationDate: e.target.value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="family-education-by">
                          Conducted By
                        </Label>
                        <Select
                          value={planOfCare.familyEducationBy || ""}
                          onValueChange={(value) =>
                            setPlanOfCare((prev) => ({
                              ...prev,
                              familyEducationBy: value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="family-education-by">
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {clinicalStaff.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name} ({staff.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="family-education-completed"
                      checked={planOfCare.familyEducationCompleted}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "familyEducationCompleted",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="family-education-completed"
                      className="font-medium"
                    >
                      Family Education Completed
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="family-consent-obtained"
                      checked={planOfCare.familyConsentObtained}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "familyConsentObtained",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="family-consent-obtained"
                      className="font-medium"
                    >
                      Family Consent Obtained
                    </Label>
                  </div>

                  {planOfCare.familyConsentObtained && (
                    <div>
                      <Label htmlFor="family-consent-date">Consent Date</Label>
                      <Input
                        id="family-consent-date"
                        type="date"
                        value={planOfCare.familyConsentDate || ""}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            familyConsentDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="family-questions-addressed"
                      checked={planOfCare.familyQuestionsAddressed}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "familyQuestionsAddressed",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="family-questions-addressed"
                      className="font-medium"
                    >
                      Family Questions Addressed
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="family-caregiver-requirements">
                      Family/Caregiver Requirements
                    </Label>
                    <Textarea
                      id="family-caregiver-requirements"
                      placeholder="Enter family/caregiver requirements"
                      value={planOfCare.familyCaregiverRequirements || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          familyCaregiverRequirements: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Education Topics Covered
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-care-plan" />
                        <Label htmlFor="topic-care-plan" className="text-sm">
                          Care Plan Overview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-medication" />
                        <Label htmlFor="topic-medication" className="text-sm">
                          Medication Management
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-equipment" />
                        <Label htmlFor="topic-equipment" className="text-sm">
                          Equipment Usage
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-emergency" />
                        <Label htmlFor="topic-emergency" className="text-sm">
                          Emergency Procedures
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-responsibilities" />
                        <Label
                          htmlFor="topic-responsibilities"
                          className="text-sm"
                        >
                          Family Responsibilities
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-communication" />
                        <Label
                          htmlFor="topic-communication"
                          className="text-sm"
                        >
                          Communication Protocols
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education-notes">
                      Education Session Notes
                    </Label>
                    <Textarea
                      id="education-notes"
                      placeholder="Enter education session notes"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 4: Staff Communication and Training */}
        <TabsContent value="staff-communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Communication and Training
              </CardTitle>
              <CardDescription>
                Disseminate approved plan of care to all involved staff members,
                provide necessary training on specific interventions, and
                establish monitoring and communication protocols.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="staff-communication-completed"
                      checked={planOfCare.staffCommunicationCompleted}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "staffCommunicationCompleted",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="staff-communication-completed"
                      className="font-medium"
                    >
                      Staff Communication Completed
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="staff-training-required"
                      checked={planOfCare.staffTrainingRequired}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "staffTrainingRequired",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="staff-training-required"
                      className="font-medium"
                    >
                      Staff Training Required
                    </Label>
                  </div>

                  {planOfCare.staffTrainingRequired && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="staff-training-completed"
                        checked={planOfCare.staffTrainingCompleted}
                        onCheckedChange={(checked) =>
                          handleToggleField(
                            "staffTrainingCompleted",
                            checked === true,
                          )
                        }
                      />
                      <Label
                        htmlFor="staff-training-completed"
                        className="font-medium"
                      >
                        Staff Training Completed
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="communication-protocols-established"
                      checked={planOfCare.communicationProtocolsEstablished}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "communicationProtocolsEstablished",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="communication-protocols-established"
                      className="font-medium"
                    >
                      Communication Protocols Established
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffing-requirements">
                      Staffing Requirements
                    </Label>
                    <Textarea
                      id="staffing-requirements"
                      placeholder="Enter staffing requirements"
                      value={planOfCare.staffingRequirements || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          staffingRequirements: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Staff Assignment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="assign-primary-nurse" defaultChecked />
                        <Label
                          htmlFor="assign-primary-nurse"
                          className="text-sm"
                        >
                          Primary Nurse Assigned
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="assign-backup-nurse" defaultChecked />
                        <Label
                          htmlFor="assign-backup-nurse"
                          className="text-sm"
                        >
                          Backup Nurse Assigned
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="assign-therapists" />
                        <Label htmlFor="assign-therapists" className="text-sm">
                          Therapists Assigned
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="assign-social-worker" />
                        <Label
                          htmlFor="assign-social-worker"
                          className="text-sm"
                        >
                          Social Worker Assigned
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality-indicators">
                      Quality Indicators
                    </Label>
                    <Textarea
                      id="quality-indicators"
                      placeholder="Enter quality indicators"
                      value={planOfCare.qualityIndicators || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          qualityIndicators: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communication-notes">
                      Communication Notes
                    </Label>
                    <Textarea
                      id="communication-notes"
                      placeholder="Enter communication notes"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 5: Implementation and Monitoring */}
        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Implementation and Monitoring
              </CardTitle>
              <CardDescription>
                Implement approved plan of care with continuous monitoring,
                regular review, and modification as needed based on patient
                response and changing needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="implementation-started"
                      checked={planOfCare.implementationStarted}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "implementationStarted",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="implementation-started"
                      className="font-medium"
                    >
                      Implementation Started
                    </Label>
                  </div>

                  {planOfCare.implementationStarted && (
                    <div>
                      <Label htmlFor="implementation-start-date">
                        Implementation Start Date
                      </Label>
                      <Input
                        id="implementation-start-date"
                        type="date"
                        value={planOfCare.implementationStartDate || ""}
                        onChange={(e) =>
                          setPlanOfCare((prev) => ({
                            ...prev,
                            implementationStartDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monitoring-protocols-active"
                      checked={planOfCare.monitoringProtocolsActive}
                      onCheckedChange={(checked) =>
                        handleToggleField(
                          "monitoringProtocolsActive",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="monitoring-protocols-active"
                      className="font-medium"
                    >
                      Monitoring Protocols Active
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment-requirements">
                      Equipment Requirements
                    </Label>
                    <Textarea
                      id="equipment-requirements"
                      placeholder="Enter equipment requirements"
                      value={planOfCare.equipmentRequirements || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          equipmentRequirements: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supply-requirements">
                      Supply Requirements
                    </Label>
                    <Textarea
                      id="supply-requirements"
                      placeholder="Enter supply requirements"
                      value={planOfCare.supplyRequirements || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          supplyRequirements: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Monitoring Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="daily-monitoring" defaultChecked />
                        <Label htmlFor="daily-monitoring" className="text-sm">
                          Daily Monitoring
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekly-review" defaultChecked />
                        <Label htmlFor="weekly-review" className="text-sm">
                          Weekly Progress Review
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="monthly-assessment" />
                        <Label htmlFor="monthly-assessment" className="text-sm">
                          Monthly Comprehensive Assessment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quarterly-plan-update" />
                        <Label
                          htmlFor="quarterly-plan-update"
                          className="text-sm"
                        >
                          Quarterly Plan Update
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-notes">Status Notes</Label>
                    <Textarea
                      id="status-notes"
                      placeholder="Enter status notes"
                      value={planOfCare.statusNotes || ""}
                      onChange={(e) =>
                        setPlanOfCare((prev) => ({
                          ...prev,
                          statusNotes: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Implementation Checklist
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="initial-visit" />
                        <Label htmlFor="initial-visit" className="text-sm">
                          Initial Visit Completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="baseline-established" />
                        <Label
                          htmlFor="baseline-established"
                          className="text-sm"
                        >
                          Baseline Measurements Established
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="documentation-system" />
                        <Label
                          htmlFor="documentation-system"
                          className="text-sm"
                        >
                          Documentation System Setup
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="emergency-protocols" />
                        <Label
                          htmlFor="emergency-protocols"
                          className="text-sm"
                        >
                          Emergency Protocols Tested
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Save Draft
                </Button>
                <Button
                  onClick={async () => {
                    await handlePlanStatusChange("Active");
                    await handleSave();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" /> Activate Plan
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Multi-Disciplinary Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Nursing</span>
                {planOfCare.nursingInputCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              {planOfCare.ptInputRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Physical Therapy</span>
                  {planOfCare.ptInputCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
              {planOfCare.otInputRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Occupational Therapy</span>
                  {planOfCare.otInputCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
              {planOfCare.stInputRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Speech Therapy</span>
                  {planOfCare.stInputCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
              {planOfCare.rtInputRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Respiratory Therapy</span>
                  {planOfCare.rtInputCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
              {planOfCare.socialWorkInputRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Social Work</span>
                  {planOfCare.socialWorkInputCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" /> Goals & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Effective: {planOfCare.effectiveDate || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Review: {planOfCare.reviewDate || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Expiration: {planOfCare.expirationDate || "Not set"}
                </span>
              </div>
              <Separator className="my-2" />
              <div>
                <span className="text-sm font-medium">Short-term Goals:</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {planOfCare.shortTermGoals
                    ? planOfCare.shortTermGoals.substring(0, 100) + "..."
                    : "Not defined"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Approvals & Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Physician Review</span>
                {planOfCare.physicianReviewCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Family Consent</span>
                {planOfCare.familyConsentObtained ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff Training</span>
                {planOfCare.staffTrainingRequired ? (
                  planOfCare.staffTrainingCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Not Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Implementation</span>
                {planOfCare.implementationStarted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanOfCare;
