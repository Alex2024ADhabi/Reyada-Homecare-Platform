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
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Brain,
} from "lucide-react";

interface ClinicalRoundFormProps {
  patientId: string;
  episodeId: string;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const ClinicalRoundForm: React.FC<ClinicalRoundFormProps> = ({
  patientId,
  episodeId,
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    // Clinical Assessment
    nursing_assessment_quality: "",
    symptom_management: "",

    // Skilled Services Delivery
    wound_care_technique: "",
    medication_administration: {
      right_patient_verified: false,
      right_medication_verified: false,
      right_dose_administered: false,
      right_route_used: false,
      right_time_followed: false,
    },

    // Therapy Services
    pt_exercises_appropriate: false,
    ot_goals_progressing: "",

    // Vital Signs
    vitalSigns: {
      bloodPressure: {
        systolic: "",
        diastolic: "",
      },
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      painLevel: "",
    },

    // Clinical Assessment by System
    clinicalAssessment: {
      cardiovascular: "",
      respiratory: "",
      neurological: "",
      integumentary: "",
    },

    // Mobility and Safety
    mobilityAndSafety: {
      ambulation: "",
      fallRisk: "",
    },

    // Cognitive Assessment
    cognitive: {
      orientation: "",
      communication: "",
    },

    // Additional fields
    findings: "",
    recommendations: "",
    actionItems: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium",
  });

  const ratingFields = [
    "nursing_assessment_quality",
    "symptom_management",
    "wound_care_technique",
    "ot_goals_progressing",
  ];

  const checklistFields = {
    medication_administration: [
      { key: "right_patient_verified", label: "Right patient verified" },
      { key: "right_medication_verified", label: "Right medication verified" },
      { key: "right_dose_administered", label: "Right dose administered" },
      { key: "right_route_used", label: "Right route used" },
      { key: "right_time_followed", label: "Right time followed" },
    ],
  };

  const calculateProgress = () => {
    let completedCount = 0;
    let totalCount = 0;

    // Boolean fields
    const booleanFields = ["pt_exercises_appropriate"];
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

    // Checklist fields
    Object.values(checklistFields).forEach((checklist) => {
      checklist.forEach(() => {
        totalCount++;
      });
    });

    const checklistCompleted = Object.values(
      formData.medication_administration,
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

  const handleBooleanChange = (key: string, checked: boolean) => {
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
      type: "clinical",
      patientId,
      episodeId,
      sections: {
        skilled_services: {
          wound_care_technique: parseInt(formData.wound_care_technique) || 0,
          medication_administration: formData.medication_administration,
        },
        therapy_services: {
          pt_exercises_appropriate: formData.pt_exercises_appropriate,
          ot_goals_progressing: parseInt(formData.ot_goals_progressing) || 0,
        },
        vital_signs: formData.vitalSigns,
        clinical_assessment: formData.clinicalAssessment,
        mobility_and_safety: formData.mobilityAndSafety,
        cognitive: formData.cognitive,
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
  const criticalCompleted = Object.values(
    formData.medication_administration,
  ).filter(Boolean).length;
  const totalCritical = Object.keys(formData.medication_administration).length;

  return (
    <div className="w-full bg-white">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Clinical Round Assessment
            </CardTitle>
            <div className="flex items-center gap-4">
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
          {/* Clinical Assessment Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Clinical Assessment
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="nursing_assessment_quality"
                  className="text-sm font-medium"
                >
                  Nursing assessment quality (1-5 scale)
                </Label>
                <Select
                  value={formData.nursing_assessment_quality}
                  onValueChange={(value) =>
                    handleInputChange("nursing_assessment_quality", value)
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
                  htmlFor="symptom_management"
                  className="text-sm font-medium"
                >
                  Symptom management effectiveness (1-5 scale)
                </Label>
                <Select
                  value={formData.symptom_management}
                  onValueChange={(value) =>
                    handleInputChange("symptom_management", value)
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

          {/* Skilled Services Delivery Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Skilled Services Delivery
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="wound_care_technique"
                  className="text-sm font-medium"
                >
                  Wound care technique (1-5 scale)
                </Label>
                <Select
                  value={formData.wound_care_technique}
                  onValueChange={(value) =>
                    handleInputChange("wound_care_technique", value)
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
                  Medication administration
                </Label>
                <div className="space-y-2">
                  {checklistFields.medication_administration.map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={
                          formData.medication_administration[
                            item.key as keyof typeof formData.medication_administration
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            "medication_administration",
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

          {/* Therapy Services Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Therapy Services
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="pt_exercises_appropriate"
                  checked={formData.pt_exercises_appropriate}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "pt_exercises_appropriate",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="pt_exercises_appropriate"
                  className="flex-1 text-sm"
                >
                  PT exercises appropriate for patient condition
                </Label>
                {formData.pt_exercises_appropriate && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="ot_goals_progressing"
                  className="text-sm font-medium"
                >
                  OT goals progression (1-5 scale)
                </Label>
                <Select
                  value={formData.ot_goals_progressing}
                  onValueChange={(value) =>
                    handleInputChange("ot_goals_progressing", value)
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

          {/* Vital Signs Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Vital Signs Assessment
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bloodPressure" className="text-sm font-medium">
                  Blood Pressure (mmHg)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Systolic"
                    value={formData.vitalSigns.bloodPressure.systolic}
                    onChange={(e) =>
                      handleNestedInputChange("vitalSigns", "bloodPressure", {
                        ...formData.vitalSigns.bloodPressure,
                        systolic: e.target.value,
                      })
                    }
                  />
                  <span className="self-center">/</span>
                  <Input
                    placeholder="Diastolic"
                    value={formData.vitalSigns.bloodPressure.diastolic}
                    onChange={(e) =>
                      handleNestedInputChange("vitalSigns", "bloodPressure", {
                        ...formData.vitalSigns.bloodPressure,
                        diastolic: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="heartRate" className="text-sm font-medium">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="72"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "vitalSigns",
                      "heartRate",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="temperature" className="text-sm font-medium">
                  <Thermometer className="h-4 w-4 inline mr-1" />
                  Temperature (°F)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "vitalSigns",
                      "temperature",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="respiratoryRate"
                  className="text-sm font-medium"
                >
                  <Wind className="h-4 w-4 inline mr-1" />
                  Respiratory Rate (breaths/min)
                </Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  placeholder="16"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "vitalSigns",
                      "respiratoryRate",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="oxygenSaturation"
                  className="text-sm font-medium"
                >
                  O2 Saturation (%)
                </Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  placeholder="98"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "vitalSigns",
                      "oxygenSaturation",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="painLevel" className="text-sm font-medium">
                  Pain Level (0-10)
                </Label>
                <Select
                  value={formData.vitalSigns.painLevel}
                  onValueChange={(value) =>
                    handleNestedInputChange("vitalSigns", "painLevel", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select pain level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} -{" "}
                        {i === 0
                          ? "No Pain"
                          : i <= 3
                            ? "Mild"
                            : i <= 6
                              ? "Moderate"
                              : "Severe"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Clinical Assessment by System
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardiovascular" className="text-sm font-medium">
                  Cardiovascular System
                </Label>
                <Textarea
                  id="cardiovascular"
                  placeholder="Heart sounds, rhythm, peripheral pulses, edema..."
                  value={formData.clinicalAssessment.cardiovascular}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "clinicalAssessment",
                      "cardiovascular",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="respiratory" className="text-sm font-medium">
                  Respiratory System
                </Label>
                <Textarea
                  id="respiratory"
                  placeholder="Breath sounds, respiratory effort, cough, sputum..."
                  value={formData.clinicalAssessment.respiratory}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "clinicalAssessment",
                      "respiratory",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="neurological" className="text-sm font-medium">
                  <Brain className="h-4 w-4 inline mr-1" />
                  Neurological System
                </Label>
                <Textarea
                  id="neurological"
                  placeholder="Mental status, reflexes, motor function, sensory..."
                  value={formData.clinicalAssessment.neurological}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "clinicalAssessment",
                      "neurological",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="integumentary" className="text-sm font-medium">
                  Skin & Integumentary
                </Label>
                <Textarea
                  id="integumentary"
                  placeholder="Skin condition, wounds, pressure areas, color..."
                  value={formData.clinicalAssessment.integumentary}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "clinicalAssessment",
                      "integumentary",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Mobility and Safety Assessment */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Mobility and Safety Assessment
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ambulation" className="text-sm font-medium">
                  Ambulation Status
                </Label>
                <Select
                  value={formData.mobilityAndSafety.ambulation}
                  onValueChange={(value) =>
                    handleNestedInputChange(
                      "mobilityAndSafety",
                      "ambulation",
                      value,
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select ambulation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="assistance">
                      Requires Assistance
                    </SelectItem>
                    <SelectItem value="device">
                      Uses Assistive Device
                    </SelectItem>
                    <SelectItem value="bedbound">Bedbound</SelectItem>
                    <SelectItem value="wheelchair">
                      Wheelchair Dependent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fallRisk" className="text-sm font-medium">
                  Fall Risk Assessment
                </Label>
                <Select
                  value={formData.mobilityAndSafety.fallRisk}
                  onValueChange={(value) =>
                    handleNestedInputChange(
                      "mobilityAndSafety",
                      "fallRisk",
                      value,
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select fall risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Cognitive Assessment */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Cognitive Assessment
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orientation" className="text-sm font-medium">
                  Orientation (Person, Place, Time)
                </Label>
                <Textarea
                  id="orientation"
                  placeholder="Document patient's orientation to person, place, and time..."
                  value={formData.cognitive.orientation}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "cognitive",
                      "orientation",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="communication" className="text-sm font-medium">
                  Communication Assessment
                </Label>
                <Textarea
                  id="communication"
                  placeholder="Speech clarity, comprehension, language barriers..."
                  value={formData.cognitive.communication}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "cognitive",
                      "communication",
                      e.target.value,
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Clinical Findings */}
          <div>
            <Label htmlFor="findings" className="text-lg font-medium">
              Clinical Findings & Assessment Summary
            </Label>
            <Textarea
              id="findings"
              placeholder="Document comprehensive clinical findings, patient condition changes, and overall assessment..."
              value={formData.findings}
              onChange={(e) => handleInputChange("findings", e.target.value)}
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.findings.length}/1000 characters (minimum 10 required)
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <Label htmlFor="recommendations" className="text-lg font-medium">
              Clinical Recommendations & Care Plan Updates
            </Label>
            <Textarea
              id="recommendations"
              placeholder="Provide clinical recommendations, care plan modifications, and treatment adjustments..."
              value={formData.recommendations}
              onChange={(e) =>
                handleInputChange("recommendations", e.target.value)
              }
              className="mt-2 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.recommendations.length}/1000 characters (minimum 10
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
              placeholder="List specific action items, referrals needed, and follow-up tasks..."
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
                  handleInputChange("followUpRequired", checked)
                }
              />
              <Label htmlFor="followUpRequired" className="text-sm font-medium">
                Follow-up Clinical Round Required
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
                critical clinical assessment items before submitting the round.
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
                disabled={progress < 50 || criticalCompleted < totalCritical}
                className="bg-green-600 hover:bg-green-700"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Complete Clinical Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalRoundForm;
