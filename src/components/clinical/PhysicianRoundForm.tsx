import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  FileText,
  Users,
  Calendar,
  Clipboard,
} from "lucide-react";

interface PhysicianRoundFormProps {
  patientId: string;
  episodeId: string;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const PhysicianRoundForm: React.FC<PhysicianRoundFormProps> = ({
  patientId,
  episodeId,
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    // Physician Assessment Checklist
    medical_history_reviewed: false,
    medications_evaluated: false,
    diagnostic_results_analyzed: false,
    treatment_plan_updated: false,
    prognosis_assessment: false,
    specialist_referrals: false,
    family_conference: false,
    discharge_planning: false,
    orders_updated: false,
    care_team_coordination: false,
    quality_outcomes: false,

    // Medical Assessment (SOAP Format)
    medical_assessment: {
      chief_complaint: "",
      history_present_illness: "",
      physical_examination: "",
      assessment_diagnosis: "",
      treatment_plan: "",
    },

    // Orders and Prescriptions
    medication_changes: "",
    diagnostic_orders: "",
    specialist_referrals_notes: "",
    prognosis_notes: "",

    // Discharge Planning
    discharge_plan: "",

    // Additional fields
    findings: "",
    recommendations: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium",
  });

  const checklistItems = [
    {
      key: "medical_history_reviewed",
      label: "Medical history comprehensively reviewed",
      critical: true,
    },
    {
      key: "medications_evaluated",
      label: "Current medications evaluated for efficacy and safety",
      critical: true,
    },
    {
      key: "diagnostic_results_analyzed",
      label: "Diagnostic results analyzed and interpreted",
      critical: true,
    },
    {
      key: "treatment_plan_updated",
      label: "Treatment plan updated based on current status",
      critical: true,
    },
    {
      key: "prognosis_assessment",
      label: "Prognosis assessment completed",
      critical: true,
    },
    {
      key: "specialist_referrals",
      label: "Specialist referrals considered and arranged if needed",
      critical: false,
    },
    {
      key: "family_conference",
      label: "Family conference conducted if appropriate",
      critical: false,
    },
    {
      key: "discharge_planning",
      label: "Discharge planning reviewed and updated",
      critical: false,
    },
    {
      key: "orders_updated",
      label: "Medical orders updated and electronically signed",
      critical: true,
    },
    {
      key: "care_team_coordination",
      label: "Care team coordination and communication completed",
      critical: true,
    },
    {
      key: "quality_outcomes",
      label: "Quality outcomes and metrics reviewed",
      critical: false,
    },
  ];

  const calculateProgress = () => {
    const completedItems = checklistItems.filter(
      (item) => formData[item.key as keyof typeof formData],
    ).length;
    const hasFindings = formData.findings.length > 20;
    const hasRecommendations = formData.recommendations.length > 20;
    const hasTreatmentPlan =
      formData.medical_assessment.treatment_plan.length > 20;
    const hasAssessment =
      formData.medical_assessment.assessment_diagnosis.length > 10;

    return (
      (completedItems / checklistItems.length) * 50 +
      (hasFindings ? 15 : 0) +
      (hasRecommendations ? 15 : 0) +
      (hasTreatmentPlan ? 10 : 0) +
      (hasAssessment ? 10 : 0)
    );
  };

  const getCriticalItemsCompleted = () => {
    return checklistItems.filter(
      (item) => item.critical && formData[item.key as keyof typeof formData],
    ).length;
  };

  const getTotalCriticalItems = () => {
    return checklistItems.filter((item) => item.critical).length;
  };

  const handleChecklistChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedInputChange = (
    section: string,
    key: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const roundData = {
      type: "physician",
      patientId,
      episodeId,
      sections: {
        physician_assessment: {
          medical_history_reviewed: formData.medical_history_reviewed,
          medications_evaluated: formData.medications_evaluated,
          diagnostic_results_analyzed: formData.diagnostic_results_analyzed,
          treatment_plan_updated: formData.treatment_plan_updated,
          prognosis_assessment: formData.prognosis_assessment,
          specialist_referrals: formData.specialist_referrals,
          family_conference: formData.family_conference,
          discharge_planning: formData.discharge_planning,
          orders_updated: formData.orders_updated,
          care_team_coordination: formData.care_team_coordination,
          quality_outcomes: formData.quality_outcomes,
        },
        medical_assessment: formData.medical_assessment,
        orders_prescriptions: {
          medication_changes: formData.medication_changes,
          diagnostic_orders: formData.diagnostic_orders,
          specialist_referrals_notes: formData.specialist_referrals_notes,
          prognosis_notes: formData.prognosis_notes,
        },
        discharge_planning: {
          discharge_plan: formData.discharge_plan,
        },
      },
      findings: formData.findings,
      recommendations: formData.recommendations,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate,
      priority: formData.priority,
      completedAt: new Date().toISOString(),
      progress: calculateProgress(),
    };

    onComplete(roundData);
  };

  const progress = calculateProgress();
  const criticalCompleted = getCriticalItemsCompleted();
  const totalCritical = getTotalCriticalItems();

  return (
    <div className="w-full bg-white">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Physician Round Assessment
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  criticalCompleted === totalCritical
                    ? "default"
                    : "destructive"
                }
              >
                Critical: {criticalCompleted}/{totalCritical}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Progress: {Math.round(progress)}%
                </span>
                <Progress value={progress} className="w-24" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Physician Assessment Checklist */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Physician Assessment Checklist
            </Label>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    id={item.key}
                    checked={
                      formData[item.key as keyof typeof formData] as boolean
                    }
                    onCheckedChange={(checked) =>
                      handleChecklistChange(item.key, checked as boolean)
                    }
                  />
                  <Label htmlFor={item.key} className="flex-1 text-sm">
                    {item.label}
                    {item.critical && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Critical
                      </Badge>
                    )}
                  </Label>
                  {formData[item.key as keyof typeof formData] && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medical Assessment (SOAP Format) */}
          <div>
            <Label className="text-lg font-medium mb-4 block flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-blue-500" />
              Medical Assessment (SOAP Format)
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="chief_complaint"
                  className="text-sm font-medium"
                >
                  Chief Complaint
                </Label>
                <Textarea
                  id="chief_complaint"
                  placeholder="Patient's primary concern or reason for visit..."
                  value={formData.medical_assessment.chief_complaint}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "medical_assessment",
                      "chief_complaint",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="history_present_illness"
                  className="text-sm font-medium"
                >
                  History of Present Illness
                </Label>
                <Textarea
                  id="history_present_illness"
                  placeholder="Detailed history of current medical condition..."
                  value={formData.medical_assessment.history_present_illness}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "medical_assessment",
                      "history_present_illness",
                      e.target.value,
                    )
                  }
                  className="mt-1 min-h-24"
                />
              </div>
              <div>
                <Label
                  htmlFor="physical_examination"
                  className="text-sm font-medium"
                >
                  Physical Examination
                </Label>
                <Textarea
                  id="physical_examination"
                  placeholder="Comprehensive physical examination findings..."
                  value={formData.medical_assessment.physical_examination}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "medical_assessment",
                      "physical_examination",
                      e.target.value,
                    )
                  }
                  className="mt-1 min-h-24"
                />
              </div>
              <div>
                <Label
                  htmlFor="assessment_diagnosis"
                  className="text-sm font-medium"
                >
                  Assessment (Diagnosis)
                </Label>
                <Textarea
                  id="assessment_diagnosis"
                  placeholder="Clinical assessment and differential diagnosis..."
                  value={formData.medical_assessment.assessment_diagnosis}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "medical_assessment",
                      "assessment_diagnosis",
                      e.target.value,
                    )
                  }
                  className="mt-1 min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="treatment_plan" className="text-sm font-medium">
                  Plan (Treatment Plan)
                </Label>
                <Textarea
                  id="treatment_plan"
                  placeholder="Comprehensive treatment plan and interventions..."
                  value={formData.medical_assessment.treatment_plan}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "medical_assessment",
                      "treatment_plan",
                      e.target.value,
                    )
                  }
                  className="mt-1 min-h-24"
                />
              </div>
            </div>
          </div>

          {/* Orders and Prescriptions */}
          <div>
            <Label className="text-lg font-medium mb-4 block flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Medical Orders & Prescriptions
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="medication_changes"
                  className="text-sm font-medium"
                >
                  Medication Changes
                </Label>
                <Textarea
                  id="medication_changes"
                  placeholder="New prescriptions, dosage changes, discontinuations..."
                  value={formData.medication_changes}
                  onChange={(e) =>
                    handleInputChange("medication_changes", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="diagnostic_orders"
                  className="text-sm font-medium"
                >
                  Diagnostic Orders
                </Label>
                <Textarea
                  id="diagnostic_orders"
                  placeholder="Laboratory tests, imaging studies, procedures..."
                  value={formData.diagnostic_orders}
                  onChange={(e) =>
                    handleInputChange("diagnostic_orders", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="specialist_referrals_notes"
                  className="text-sm font-medium"
                >
                  Specialist Referrals
                </Label>
                <Textarea
                  id="specialist_referrals_notes"
                  placeholder="Specialist consultations and referrals needed..."
                  value={formData.specialist_referrals_notes}
                  onChange={(e) =>
                    handleInputChange(
                      "specialist_referrals_notes",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="prognosis_notes"
                  className="text-sm font-medium"
                >
                  Prognosis Assessment
                </Label>
                <Textarea
                  id="prognosis_notes"
                  placeholder="Expected course and outcome of condition..."
                  value={formData.prognosis_notes}
                  onChange={(e) =>
                    handleInputChange("prognosis_notes", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Discharge Planning */}
          <div>
            <Label htmlFor="discharge_plan" className="text-lg font-medium">
              <Calendar className="h-5 w-5 inline mr-2" />
              Discharge Planning & Transition of Care
            </Label>
            <Textarea
              id="discharge_plan"
              placeholder="Discharge planning, home care needs, follow-up arrangements..."
              value={formData.discharge_plan}
              onChange={(e) =>
                handleInputChange("discharge_plan", e.target.value)
              }
              className="mt-2 min-h-24"
            />
          </div>

          {/* Clinical Findings */}
          <div>
            <Label htmlFor="findings" className="text-lg font-medium">
              Clinical Findings & Physician Notes
            </Label>
            <Textarea
              id="findings"
              placeholder="Comprehensive physician findings, clinical observations, and detailed notes..."
              value={formData.findings}
              onChange={(e) => handleInputChange("findings", e.target.value)}
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.findings.length}/1500 characters (minimum 20 required)
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <Label htmlFor="recommendations" className="text-lg font-medium">
              Physician Recommendations & Care Directives
            </Label>
            <Textarea
              id="recommendations"
              placeholder="Detailed physician recommendations, care directives, and clinical guidance..."
              value={formData.recommendations}
              onChange={(e) =>
                handleInputChange("recommendations", e.target.value)
              }
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.recommendations.length}/1500 characters (minimum 20
              required)
            </p>
          </div>

          {/* Follow-up Requirements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) =>
                  handleInputChange("followUpRequired", checked)
                }
              />
              <Label htmlFor="followUpRequired" className="text-sm font-medium">
                Follow-up Physician Round Required
              </Label>
            </div>

            {formData.followUpRequired && (
              <div>
                <Label htmlFor="followUpDate" className="text-sm font-medium">
                  Follow-up Date & Time
                </Label>
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) =>
                    handleInputChange("followUpDate", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Priority Level
            </Label>
            <div className="flex gap-2">
              {["low", "medium", "high", "critical"].map((level) => (
                <Button
                  key={level}
                  variant={formData.priority === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("priority", level)}
                  className={
                    level === "critical" ? "bg-red-600 hover:bg-red-700" : ""
                  }
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Validation Warnings */}
          {criticalCompleted < totalCritical && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical Items Incomplete:</strong> Please complete all
                critical physician assessment items before submitting the round.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <Button variant="outline">
                <Mic className="h-4 w-4 mr-2" />
                Voice Note
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={progress < 60 || criticalCompleted < totalCritical}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Complete Physician Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicianRoundForm;
