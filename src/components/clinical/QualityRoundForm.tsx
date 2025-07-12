import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
} from "lucide-react";

interface QualityRoundFormProps {
  patientId: string;
  episodeId: string;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const QualityRoundForm: React.FC<QualityRoundFormProps> = ({
  patientId,
  episodeId,
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    // Patient Assessment
    vital_signs_documented: false,
    medication_management: "",
    care_plan_adherence: "",

    // Documentation Quality
    progress_notes_quality: "",
    assessment_completeness: {
      subjective_assessment: false,
      objective_findings: false,
      assessment_conclusions: false,
      plan_updated: false,
    },

    // Patient & Family Satisfaction
    communication_effectiveness: "",
    service_timeliness: "",

    // Safety Measures
    fall_risk_assessment: false,
    emergency_contacts_updated: false,

    // Additional fields
    findings: "",
    recommendations: "",
    actionItems: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium",
  });

  const requiredFields = [
    "vital_signs_documented",
    "medication_management",
    "care_plan_adherence",
  ];

  const ratingFields = [
    "medication_management",
    "progress_notes_quality",
    "communication_effectiveness",
    "service_timeliness",
  ];

  const checklistFields = {
    assessment_completeness: [
      {
        key: "subjective_assessment",
        label: "Subjective assessment documented",
      },
      { key: "objective_findings", label: "Objective findings recorded" },
      { key: "assessment_conclusions", label: "Assessment conclusions stated" },
      { key: "plan_updated", label: "Plan of care updated" },
    ],
  };

  const calculateProgress = () => {
    let completedCount = 0;
    let totalCount = 0;

    // Boolean fields
    const booleanFields = [
      "vital_signs_documented",
      "fall_risk_assessment",
      "emergency_contacts_updated",
    ];
    booleanFields.forEach((field) => {
      totalCount++;
      if (formData[field as keyof typeof formData]) completedCount++;
    });

    // Rating fields
    ratingFields.forEach((field) => {
      totalCount++;
      if (
        formData[field as keyof typeof formData] &&
        formData[field as keyof typeof formData] !== ""
      )
        completedCount++;
    });

    // Percentage field
    totalCount++;
    if (formData.care_plan_adherence && formData.care_plan_adherence !== "")
      completedCount++;

    // Checklist fields
    Object.values(checklistFields).forEach((checklist) => {
      checklist.forEach(() => {
        totalCount++;
      });
    });

    const checklistCompleted = Object.values(
      formData.assessment_completeness,
    ).filter(Boolean).length;
    completedCount += checklistCompleted;

    const hasFindings = formData.findings.length > 10;
    const hasRecommendations = formData.recommendations.length > 10;

    return Math.round(
      (completedCount / totalCount) * 70 +
        (hasFindings ? 15 : 0) +
        (hasRecommendations ? 15 : 0),
    );
  };

  const getRequiredFieldsCompleted = () => {
    return requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return (
        value !== false && value !== "" && value !== null && value !== undefined
      );
    }).length;
  };

  const handleBooleanChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleChecklistChange = (
    section: string,
    key: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: checked,
      },
    }));
  };

  const handleSubmit = () => {
    const roundData = {
      type: "quality",
      patientId,
      episodeId,
      sections: {
        patient_assessment: {
          vital_signs_documented: formData.vital_signs_documented,
          medication_management: parseInt(formData.medication_management) || 0,
          care_plan_adherence: parseInt(formData.care_plan_adherence) || 0,
        },
        documentation_quality: {
          progress_notes_quality:
            parseInt(formData.progress_notes_quality) || 0,
          assessment_completeness: formData.assessment_completeness,
        },
        patient_satisfaction: {
          communication_effectiveness:
            parseInt(formData.communication_effectiveness) || 0,
          service_timeliness: parseInt(formData.service_timeliness) || 0,
        },
        safety_measures: {
          fall_risk_assessment: formData.fall_risk_assessment,
          emergency_contacts_updated: formData.emergency_contacts_updated,
        },
      },
      findings: formData.findings,
      recommendations: formData.recommendations,
      actionItems: formData.actionItems,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate,
      priority: formData.priority,
      completedAt: new Date().toISOString(),
      progress: calculateProgress(),
    };

    onComplete(roundData);
  };

  const progress = calculateProgress();
  const requiredCompleted = getRequiredFieldsCompleted();
  const totalRequired = requiredFields.length;

  return (
    <div className="w-full bg-white">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Quality Round Assessment
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  requiredCompleted === totalRequired
                    ? "default"
                    : "destructive"
                }
              >
                Required: {requiredCompleted}/{totalRequired}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Progress: {progress}%
                </span>
                <Progress value={progress} className="w-24" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Assessment Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Patient Assessment
            </Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="vital_signs_documented"
                  checked={formData.vital_signs_documented}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "vital_signs_documented",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="vital_signs_documented"
                  className="flex-1 text-sm"
                >
                  Vital signs properly documented
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Required
                  </Badge>
                </Label>
                {formData.vital_signs_documented && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="medication_management"
                  className="text-sm font-medium"
                >
                  Medication management compliance (1-5 scale)
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Required
                  </Badge>
                </Label>
                <Select
                  value={formData.medication_management}
                  onValueChange={(value) =>
                    handleInputChange("medication_management", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="care_plan_adherence"
                  className="text-sm font-medium"
                >
                  Care plan adherence rate (%)
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Required
                  </Badge>
                </Label>
                <Input
                  id="care_plan_adherence"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter percentage (0-100)"
                  value={formData.care_plan_adherence}
                  onChange={(e) =>
                    handleInputChange("care_plan_adherence", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Documentation Quality Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Documentation Quality
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="progress_notes_quality"
                  className="text-sm font-medium"
                >
                  Progress notes quality (1-5 scale)
                </Label>
                <Select
                  value={formData.progress_notes_quality}
                  onValueChange={(value) =>
                    handleInputChange("progress_notes_quality", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Assessment completeness
                </Label>
                <div className="space-y-2">
                  {checklistFields.assessment_completeness.map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={
                          formData.assessment_completeness[
                            item.key as keyof typeof formData.assessment_completeness
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            "assessment_completeness",
                            item.key,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={item.key} className="text-sm">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Family Satisfaction Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Patient & Family Satisfaction
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="communication_effectiveness"
                  className="text-sm font-medium"
                >
                  Communication effectiveness (1-5 scale)
                </Label>
                <Select
                  value={formData.communication_effectiveness}
                  onValueChange={(value) =>
                    handleInputChange("communication_effectiveness", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="service_timeliness"
                  className="text-sm font-medium"
                >
                  Service timeliness (1-5 scale)
                </Label>
                <Select
                  value={formData.service_timeliness}
                  onValueChange={(value) =>
                    handleInputChange("service_timeliness", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Safety Measures Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Safety Measures
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="fall_risk_assessment"
                  checked={formData.fall_risk_assessment}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "fall_risk_assessment",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="fall_risk_assessment"
                  className="flex-1 text-sm"
                >
                  Fall risk assessment completed
                </Label>
                {formData.fall_risk_assessment && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="emergency_contacts_updated"
                  checked={formData.emergency_contacts_updated}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "emergency_contacts_updated",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="emergency_contacts_updated"
                  className="flex-1 text-sm"
                >
                  Emergency contacts updated
                </Label>
                {formData.emergency_contacts_updated && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Clinical Findings */}
          <div>
            <Label htmlFor="findings" className="text-lg font-medium">
              Clinical Findings & Observations
            </Label>
            <Textarea
              id="findings"
              placeholder="Document your quality assessment findings, patient condition observations, and any concerns identified during the bedside visit..."
              value={formData.findings}
              onChange={(e) => handleInputChange("findings", e.target.value)}
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.findings.length}/500 characters (minimum 10 required)
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <Label htmlFor="recommendations" className="text-lg font-medium">
              Recommendations & Care Plan Updates
            </Label>
            <Textarea
              id="recommendations"
              placeholder="Provide recommendations for care plan modifications, interventions needed, and quality improvements..."
              value={formData.recommendations}
              onChange={(e) =>
                handleInputChange("recommendations", e.target.value)
              }
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.recommendations.length}/500 characters (minimum 10
              required)
            </p>
          </div>

          {/* Action Items */}
          <div>
            <Label htmlFor="actionItems" className="text-lg font-medium">
              Action Items & Follow-up Tasks
            </Label>
            <Textarea
              id="actionItems"
              placeholder="List specific action items, tasks to be completed, and responsible parties..."
              value={formData.actionItems}
              onChange={(e) => handleInputChange("actionItems", e.target.value)}
              className="mt-2 min-h-24"
            />
          </div>

          {/* Follow-up Requirements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) =>
                  handleInputChange("followUpRequired", checked as boolean)
                }
              />
              <Label htmlFor="followUpRequired" className="text-sm font-medium">
                Follow-up Quality Round Required
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
          {requiredCompleted < totalRequired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Required Fields Incomplete</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Please complete all required fields before submitting the
                quality round.
              </p>
            </div>
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
                disabled={progress < 50 || requiredCompleted < totalRequired}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Quality Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityRoundForm;
