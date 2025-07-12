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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  FileText,
  Save,
} from "lucide-react";
import { ValidationUtils } from "@/components/ui/form-validation";
import { dohComplianceValidatorService } from "@/services/doh-compliance-validator.service";

interface PatientSafetyTaxonomyFormProps {
  incidentId?: string;
  incidentType: string;
  incidentDescription: string;
  severity: "low" | "medium" | "high" | "critical";
  onSave?: (taxonomyData: any) => void;
  onValidationComplete?: (isValid: boolean, errors: string[]) => void;
  readOnly?: boolean;
}

const PatientSafetyTaxonomyForm: React.FC<PatientSafetyTaxonomyFormProps> = ({
  incidentId,
  incidentType,
  incidentDescription,
  severity,
  onSave,
  onValidationComplete,
  readOnly = false,
}) => {
  const [taxonomyData, setTaxonomyData] = useState({
    level_1: "",
    level_2: "",
    level_3: "",
    level_4: "",
    level_5: "",
    classification_confidence: 0,
    auto_classified: false,
    manual_review_required: false,
    taxonomy_version: "CN_19_2025",
    classification_timestamp: new Date().toISOString(),
    classified_by: "manual_entry",
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoClassificationSuggestion, setAutoClassificationSuggestion] =
    useState<any>(null);

  // DOH CN_19_2025 Level 1 Categories
  const level1Categories = [
    "Patient Care",
    "Medication/IV Fluids",
    "Medical Device/Equipment",
    "Patient Protection",
    "Care Management",
    "Clinical Process/Procedure",
    "Documentation",
    "Infection Control",
    "Blood/Blood Products",
    "Nutrition",
    "Oxygen/Gas/Vapour",
    "Healthcare-associated Infection",
    "Surgery/Anaesthesia/Sedation",
    "Diagnostic/Screening/Prevention",
    "Rehabilitation/Therapy",
    "Discharge/Transfer",
  ];

  // Level 2 subcategories based on Level 1 selection
  const getLevel2Options = (level1: string) => {
    const subcategories: Record<string, string[]> = {
      "Patient Care": [
        "General Patient Care",
        "Patient Assessment",
        "Patient Monitoring",
        "Patient Education",
        "Discharge Planning",
      ],
      "Medication/IV Fluids": [
        "Medication Administration",
        "Medication Reconciliation",
        "IV Therapy",
        "Medication Storage",
        "Pharmacy Services",
      ],
      "Medical Device/Equipment": [
        "Equipment Malfunction",
        "Equipment Maintenance",
        "Device Usage",
        "Equipment Safety",
        "Technology Issues",
      ],
      "Patient Protection": [
        "Falls Prevention",
        "Restraint Use",
        "Patient Identification",
        "Security Issues",
        "Environmental Safety",
      ],
      "Clinical Process/Procedure": [
        "Clinical Assessment",
        "Diagnosis/Assessment",
        "Treatment Planning",
        "Procedure Performance",
        "Clinical Decision Making",
      ],
      Documentation: [
        "Clinical Documentation",
        "Administrative Documentation",
        "Legal Documentation",
        "Electronic Records",
        "Information Management",
      ],
      "Healthcare-associated Infection": [
        "Infection Prevention",
        "Infection Control",
        "Surveillance",
        "Outbreak Management",
        "Antimicrobial Stewardship",
      ],
      "Care Management": [
        "Care Coordination",
        "Communication",
        "Handoff/Transfer",
        "Multidisciplinary Care",
        "Continuity of Care",
      ],
    };
    return subcategories[level1] || [];
  };

  // Auto-classify incident on component mount
  useEffect(() => {
    if (incidentType && incidentDescription && severity) {
      performAutoClassification();
    }
  }, [incidentType, incidentDescription, severity]);

  // Validate taxonomy whenever data changes
  useEffect(() => {
    validateTaxonomy();
  }, [taxonomyData]);

  const performAutoClassification = async () => {
    try {
      setIsLoading(true);
      const suggestion =
        await dohComplianceValidatorService.classifyIncidentWithDOHTaxonomy(
          incidentType,
          incidentDescription,
          severity,
        );
      setAutoClassificationSuggestion(suggestion);
    } catch (error) {
      console.error("Auto-classification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAutoClassification = () => {
    if (autoClassificationSuggestion) {
      setTaxonomyData({
        ...taxonomyData,
        ...autoClassificationSuggestion,
        auto_classified: true,
        classified_by: "system_auto_classifier",
      });
    }
  };

  const validateTaxonomy = () => {
    const result = ValidationUtils.validatePatientSafetyTaxonomy(taxonomyData);
    setValidationResult(result);
    if (onValidationComplete) {
      onValidationComplete(result.isValid, result.errors);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setTaxonomyData((prev) => ({
      ...prev,
      [field]: value,
      classification_timestamp: new Date().toISOString(),
      auto_classified: false,
      classified_by: "manual_entry",
    }));

    // Reset dependent fields when parent level changes
    if (field === "level_1") {
      setTaxonomyData((prev) => ({
        ...prev,
        level_2: "",
        level_3: "",
        level_4: "",
        level_5: "",
      }));
    }
  };

  const handleSave = () => {
    if (onSave && validationResult?.isValid) {
      onSave(taxonomyData);
    }
  };

  const getComplianceLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-700 bg-green-100";
      case "good":
        return "text-blue-700 bg-blue-100";
      case "acceptable":
        return "text-yellow-700 bg-yellow-100";
      case "needs_improvement":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            DOH Patient Safety Taxonomy Classification (CN_19_2025)
          </CardTitle>
          <CardDescription>
            Classify patient safety incidents according to DOH standards for
            regulatory compliance and learning opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Incident Type
              </Label>
              <p className="font-medium">{incidentType}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Severity
              </Label>
              <Badge
                variant={
                  severity === "critical" || severity === "high"
                    ? "destructive"
                    : "secondary"
                }
              >
                {severity.toUpperCase()}
              </Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Taxonomy Version
              </Label>
              <p className="font-medium">{taxonomyData.taxonomy_version}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Classification Suggestion */}
      {autoClassificationSuggestion && !taxonomyData.auto_classified && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Auto-classification suggestion available (Confidence:{" "}
                {autoClassificationSuggestion.classification_confidence}%)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={applyAutoClassification}
                disabled={readOnly}
              >
                Apply Suggestion
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Taxonomy Classification Form */}
      <Card>
        <CardHeader>
          <CardTitle>5-Level Taxonomy Classification</CardTitle>
          <CardDescription>
            Complete all five levels for comprehensive incident classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level 1 - Primary Category */}
          <div className="space-y-2">
            <Label htmlFor="level_1" className="text-sm font-medium">
              Level 1: Primary Category *
            </Label>
            <Select
              value={taxonomyData.level_1}
              onValueChange={(value) => handleFieldChange("level_1", value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary category" />
              </SelectTrigger>
              <SelectContent>
                {level1Categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level 2 - Subcategory */}
          <div className="space-y-2">
            <Label htmlFor="level_2" className="text-sm font-medium">
              Level 2: Subcategory *
            </Label>
            <Select
              value={taxonomyData.level_2}
              onValueChange={(value) => handleFieldChange("level_2", value)}
              disabled={readOnly || !taxonomyData.level_1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {getLevel2Options(taxonomyData.level_1).map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level 3 - Specific Type */}
          <div className="space-y-2">
            <Label htmlFor="level_3" className="text-sm font-medium">
              Level 3: Specific Type *
            </Label>
            <Input
              id="level_3"
              value={taxonomyData.level_3}
              onChange={(e) => handleFieldChange("level_3", e.target.value)}
              placeholder="Describe the specific type of incident (min 5 characters)"
              disabled={readOnly}
            />
          </div>

          {/* Level 4 - Contributing Factors */}
          <div className="space-y-2">
            <Label htmlFor="level_4" className="text-sm font-medium">
              Level 4: Contributing Factors *
            </Label>
            <Textarea
              id="level_4"
              value={taxonomyData.level_4}
              onChange={(e) => handleFieldChange("level_4", e.target.value)}
              placeholder="Identify contributing factors (communication, training, protocols, equipment, etc.)"
              className="h-20"
              disabled={readOnly}
            />
          </div>

          {/* Level 5 - Root Cause Analysis */}
          <div className="space-y-2">
            <Label htmlFor="level_5" className="text-sm font-medium">
              Level 5: Root Cause Analysis *
            </Label>
            <Textarea
              id="level_5"
              value={taxonomyData.level_5}
              onChange={(e) => handleFieldChange("level_5", e.target.value)}
              placeholder="Provide comprehensive root cause analysis (min 10 characters)"
              className="h-24"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              Classification Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completeness</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={validationResult.completeness}
                  className="w-24 h-2"
                />
                <span className="text-sm font-medium">
                  {validationResult.completeness}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Compliance Level:</span>
              <Badge
                className={getComplianceLevelColor(
                  validationResult.complianceLevel,
                )}
              >
                {validationResult.complianceLevel
                  .replace("_", " ")
                  .toUpperCase()}
              </Badge>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600">
                  Validation Errors:
                </Label>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.errors.map(
                    (error: string, index: number) => (
                      <li key={index} className="text-sm text-red-600">
                        {error}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {validationResult.recommendations?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-600">
                  Recommendations:
                </Label>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index} className="text-sm text-blue-600">
                        {rec}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={performAutoClassification}
            disabled={isLoading}
          >
            <Shield className="w-4 h-4 mr-2" />
            {isLoading ? "Classifying..." : "Auto-Classify"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!validationResult?.isValid || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Classification
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientSafetyTaxonomyForm;
