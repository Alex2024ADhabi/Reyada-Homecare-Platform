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
  Shield,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  Droplets,
} from "lucide-react";

interface InfectionControlRoundFormProps {
  patientId: string;
  episodeId: string;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const InfectionControlRoundForm: React.FC<InfectionControlRoundFormProps> = ({
  patientId,
  episodeId,
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    // Hand Hygiene Compliance
    hand_sanitizer_available: false,
    staff_hand_hygiene_observed: "",

    // Personal Protective Equipment
    appropriate_ppe_used: {
      gloves_when_indicated: false,
      masks_when_required: false,
      gowns_for_contact: false,
      eye_protection: false,
    },
    ppe_disposal: "",

    // Environmental Cleanliness
    patient_environment_clean: "",
    equipment_disinfection: false,

    // Isolation Precautions
    isolation_signs_posted: false,
    isolation_protocols_followed: "",

    // Additional fields
    findings: "",
    recommendations: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium",
  });

  const requiredFields = ["hand_sanitizer_available"];

  const ratingFields = [
    "staff_hand_hygiene_observed",
    "ppe_disposal",
    "patient_environment_clean",
    "isolation_protocols_followed",
  ];

  const checklistFields = {
    appropriate_ppe_used: [
      { key: "gloves_when_indicated", label: "Gloves when indicated" },
      { key: "masks_when_required", label: "Masks when required" },
      { key: "gowns_for_contact", label: "Gowns for contact precautions" },
      { key: "eye_protection", label: "Eye protection when needed" },
    ],
  };

  const calculateProgress = () => {
    let completedCount = 0;
    let totalCount = 0;

    // Boolean fields
    const booleanFields = [
      "hand_sanitizer_available",
      "equipment_disinfection",
      "isolation_signs_posted",
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

    // Checklist fields
    Object.values(checklistFields).forEach((checklist) => {
      checklist.forEach(() => {
        totalCount++;
      });
    });

    const checklistCompleted = Object.values(
      formData.appropriate_ppe_used,
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

  const handleInputChange = (key: string, value: any) => {
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
      type: "infection-control",
      patientId,
      episodeId,
      sections: {
        hand_hygiene: {
          hand_sanitizer_available: formData.hand_sanitizer_available,
          staff_hand_hygiene_observed:
            parseInt(formData.staff_hand_hygiene_observed) || 0,
        },
        ppe_usage: {
          appropriate_ppe_used: formData.appropriate_ppe_used,
          ppe_disposal: parseInt(formData.ppe_disposal) || 0,
        },
        environmental_cleanliness: {
          patient_environment_clean:
            parseInt(formData.patient_environment_clean) || 0,
          equipment_disinfection: formData.equipment_disinfection,
        },
        isolation_precautions: {
          isolation_signs_posted: formData.isolation_signs_posted,
          isolation_protocols_followed:
            parseInt(formData.isolation_protocols_followed) || 0,
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
  const requiredCompleted = getRequiredFieldsCompleted();
  const totalRequired = requiredFields.length;

  return (
    <div className="w-full bg-white">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Infection Control Round Assessment
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
          {/* Hand Hygiene Compliance Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Hand Hygiene Compliance
            </Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="hand_sanitizer_available"
                  checked={formData.hand_sanitizer_available}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "hand_sanitizer_available",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="hand_sanitizer_available"
                  className="flex-1 text-sm"
                >
                  Hand sanitizer available and accessible
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Required
                  </Badge>
                </Label>
                {formData.hand_sanitizer_available && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="staff_hand_hygiene_observed"
                  className="text-sm font-medium"
                >
                  Staff hand hygiene compliance observed (1-5 scale)
                </Label>
                <Select
                  value={formData.staff_hand_hygiene_observed}
                  onValueChange={(value) =>
                    handleInputChange("staff_hand_hygiene_observed", value)
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

          {/* Personal Protective Equipment Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Personal Protective Equipment
            </Label>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Appropriate PPE used
                </Label>
                <div className="space-y-2">
                  {checklistFields.appropriate_ppe_used.map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={
                          formData.appropriate_ppe_used[
                            item.key as keyof typeof formData.appropriate_ppe_used
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleChecklistChange(
                            "appropriate_ppe_used",
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

              <div>
                <Label htmlFor="ppe_disposal" className="text-sm font-medium">
                  Proper PPE disposal observed (1-5 scale)
                </Label>
                <Select
                  value={formData.ppe_disposal}
                  onValueChange={(value) =>
                    handleInputChange("ppe_disposal", value)
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

          {/* Environmental Cleanliness Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Environmental Cleanliness
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="patient_environment_clean"
                  className="text-sm font-medium"
                >
                  Patient environment cleanliness (1-5 scale)
                </Label>
                <Select
                  value={formData.patient_environment_clean}
                  onValueChange={(value) =>
                    handleInputChange("patient_environment_clean", value)
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

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="equipment_disinfection"
                  checked={formData.equipment_disinfection}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "equipment_disinfection",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="equipment_disinfection"
                  className="flex-1 text-sm"
                >
                  Equipment properly disinfected
                </Label>
                {formData.equipment_disinfection && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Isolation Precautions Section */}
          <div>
            <Label className="text-lg font-medium mb-4 block">
              Isolation Precautions
            </Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="isolation_signs_posted"
                  checked={formData.isolation_signs_posted}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "isolation_signs_posted",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor="isolation_signs_posted"
                  className="flex-1 text-sm"
                >
                  Isolation signs properly posted
                </Label>
                {formData.isolation_signs_posted && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="isolation_protocols_followed"
                  className="text-sm font-medium"
                >
                  Isolation protocols followed (1-5 scale)
                </Label>
                <Select
                  value={formData.isolation_protocols_followed}
                  onValueChange={(value) =>
                    handleInputChange("isolation_protocols_followed", value)
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

          {/* Clinical Findings */}
          <div>
            <Label htmlFor="findings" className="text-lg font-medium">
              Infection Control Findings & Observations
            </Label>
            <Textarea
              id="findings"
              placeholder="Document infection control compliance, any breaches observed, environmental conditions, and risk factors identified during the bedside visit..."
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
              Infection Control Recommendations
            </Label>
            <Textarea
              id="recommendations"
              placeholder="Provide specific recommendations for infection prevention, control measures to implement, and corrective actions needed..."
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
                Follow-up Infection Control Round Required
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
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Required Fields Incomplete:</strong> Please complete all
                required fields before submitting the infection control round.
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
                disabled={progress < 50 || requiredCompleted < totalRequired}
                className="bg-red-600 hover:bg-red-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Complete Infection Control Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfectionControlRoundForm;
