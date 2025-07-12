import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Save,
  RefreshCw,
} from "lucide-react";

interface HomeboundAssessmentProps {
  patientId: string;
  patientName: string;
  onBack: () => void;
}

interface HomeboundCriteria {
  confinedToHome: boolean;
  considerableEffortToLeave: boolean;
  medicallyJustified: boolean;
  physicianOrders: boolean;
}

interface AssessmentData {
  status:
    | "qualified"
    | "not_qualified"
    | "pending_assessment"
    | "reassessment_required";
  assessmentDate: string;
  assessedBy: string;
  clinicalJustification: string;
  nextReassessmentDate: string;
  criteria: HomeboundCriteria;
  supportingDocumentation: string[];
  riskFactors: string[];
  functionalLimitations: string[];
  medicalConditions: string[];
}

const HomeboundAssessment: React.FC<HomeboundAssessmentProps> = ({
  patientId,
  patientName,
  onBack,
}) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    status: "pending_assessment",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessedBy: "",
    clinicalJustification: "",
    nextReassessmentDate: "",
    criteria: {
      confinedToHome: false,
      considerableEffortToLeave: false,
      medicallyJustified: false,
      physicianOrders: false,
    },
    supportingDocumentation: [],
    riskFactors: [],
    functionalLimitations: [],
    medicalConditions: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // DOH Homebound Criteria
  const dohCriteria = [
    {
      key: "confinedToHome",
      title: "Confined to Home",
      description:
        "Patient is confined to the home or institution due to medical condition",
      required: true,
    },
    {
      key: "considerableEffortToLeave",
      title: "Considerable Effort to Leave",
      description: "Leaving home requires considerable and taxing effort",
      required: true,
    },
    {
      key: "medicallyJustified",
      title: "Medically Justified",
      description: "Homebound status is medically justified and documented",
      required: true,
    },
    {
      key: "physicianOrders",
      title: "Physician Orders",
      description: "Physician has ordered homecare services",
      required: true,
    },
  ];

  const calculateComplianceScore = () => {
    const criteriaCount = Object.values(assessmentData.criteria).filter(
      Boolean,
    ).length;
    return Math.round((criteriaCount / 4) * 100);
  };

  const determineStatus = () => {
    const allCriteriaMet = Object.values(assessmentData.criteria).every(
      Boolean,
    );
    return allCriteriaMet ? "qualified" : "not_qualified";
  };

  const handleCriteriaChange = (
    key: keyof HomeboundCriteria,
    value: boolean,
  ) => {
    setAssessmentData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: value,
      },
      status: determineStatus(),
    }));
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would save to the database
      const finalStatus = determineStatus();
      setAssessmentData((prev) => ({ ...prev, status: finalStatus }));

      // Calculate next reassessment date (typically 60 days)
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 60);
      setAssessmentData((prev) => ({
        ...prev,
        nextReassessmentDate: nextDate.toISOString().split("T")[0],
      }));

      alert(`Homebound assessment completed. Status: ${finalStatus}`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Error submitting assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "not_qualified":
        return "bg-red-100 text-red-800";
      case "pending_assessment":
        return "bg-yellow-100 text-yellow-800";
      case "reassessment_required":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Homebound Status Assessment</h2>
            <p className="text-muted-foreground">
              {patientName} - ID: {patientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={getStatusColor(assessmentData.status)}
          >
            {assessmentData.status.replace("_", " ").charAt(0).toUpperCase() +
              assessmentData.status.replace("_", " ").slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* DOH Criteria Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                DOH Homebound Criteria Assessment
              </CardTitle>
              <CardDescription>
                Complete assessment based on DOH homecare eligibility
                requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dohCriteria.map((criterion) => (
                  <div key={criterion.key} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={criterion.key}
                            checked={
                              assessmentData.criteria[
                                criterion.key as keyof HomeboundCriteria
                              ]
                            }
                            onCheckedChange={(checked) =>
                              handleCriteriaChange(
                                criterion.key as keyof HomeboundCriteria,
                                checked === true,
                              )
                            }
                          />
                          <Label
                            htmlFor={criterion.key}
                            className="font-medium"
                          >
                            {criterion.title}
                            {criterion.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          {criterion.description}
                        </p>
                      </div>
                      {assessmentData.criteria[
                        criterion.key as keyof HomeboundCriteria
                      ] ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
                      )}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Justification */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Justification</CardTitle>
              <CardDescription>
                Provide detailed clinical justification for homebound status
                determination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinical-justification">
                    Clinical Justification
                  </Label>
                  <Textarea
                    id="clinical-justification"
                    placeholder="Provide detailed clinical justification for homebound status..."
                    value={assessmentData.clinicalJustification}
                    onChange={(e) =>
                      setAssessmentData((prev) => ({
                        ...prev,
                        clinicalJustification: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medical-conditions">
                      Primary Medical Conditions
                    </Label>
                    <Textarea
                      id="medical-conditions"
                      placeholder="List primary medical conditions affecting mobility..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="functional-limitations">
                      Functional Limitations
                    </Label>
                    <Textarea
                      id="functional-limitations"
                      placeholder="Describe functional limitations and mobility restrictions..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-factors">Risk Factors</Label>
                  <Textarea
                    id="risk-factors"
                    placeholder="Identify risk factors that support homebound status..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documentation</CardTitle>
              <CardDescription>
                Required documentation to support homebound status determination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="physician-orders" />
                      <Label htmlFor="physician-orders">
                        Physician Orders Available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="medical-records" />
                      <Label htmlFor="medical-records">
                        Recent Medical Records
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="assessment-forms" />
                      <Label htmlFor="assessment-forms">
                        Assessment Forms Completed
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="insurance-auth" />
                      <Label htmlFor="insurance-auth">
                        Insurance Authorization
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="discharge-summary" />
                      <Label htmlFor="discharge-summary">
                        Hospital Discharge Summary
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="specialist-notes" />
                      <Label htmlFor="specialist-notes">
                        Specialist Consultation Notes
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Summary */}
        <div className="space-y-6">
          {/* Compliance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">DOH Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Criteria Met</span>
                  <span className="text-sm font-medium">
                    {calculateComplianceScore()}%
                  </span>
                </div>
                <Progress value={calculateComplianceScore()} className="h-2" />

                <div className="space-y-2">
                  {dohCriteria.map((criterion) => (
                    <div
                      key={criterion.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{criterion.title}</span>
                      {assessmentData.criteria[
                        criterion.key as keyof HomeboundCriteria
                      ] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-date">Assessment Date</Label>
                    <Input
                      id="assessment-date"
                      type="date"
                      value={assessmentData.assessmentDate}
                      onChange={(e) =>
                        setAssessmentData((prev) => ({
                          ...prev,
                          assessmentDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessed-by">Assessed By</Label>
                    <Select
                      value={assessmentData.assessedBy}
                      onValueChange={(value) =>
                        setAssessmentData((prev) => ({
                          ...prev,
                          assessedBy: value,
                        }))
                      }
                    >
                      <SelectTrigger id="assessed-by">
                        <SelectValue placeholder="Select assessor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse-supervisor">
                          Nurse Supervisor
                        </SelectItem>
                        <SelectItem value="case-manager">
                          Case Manager
                        </SelectItem>
                        <SelectItem value="clinical-coordinator">
                          Clinical Coordinator
                        </SelectItem>
                        <SelectItem value="physician">Physician</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next-reassessment">
                      Next Reassessment Date
                    </Label>
                    <Input
                      id="next-reassessment"
                      type="date"
                      value={assessmentData.nextReassessmentDate}
                      onChange={(e) =>
                        setAssessmentData((prev) => ({
                          ...prev,
                          nextReassessmentDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Complete Assessment
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reassessment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">Initial Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      Jan 15, 2024
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Qualified
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">60-Day Review</p>
                    <p className="text-xs text-muted-foreground">
                      Mar 15, 2024
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Qualified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeboundAssessment;
