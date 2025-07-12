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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  User,
  Calendar,
  MapPin,
  Stethoscope,
  Home,
  Shield,
  Activity,
  Heart,
  Brain,
  Users,
  Building,
  Pill,
  ClipboardList,
  UserCheck,
  Plus,
} from "lucide-react";
import { ApiService } from "@/services/api.service";
import { ValidationUtils } from "@/components/ui/form-validation";
import { toast } from "@/components/ui/use-toast";

interface HomecareReferralFormProps {
  patientId?: string;
  onSubmit?: (referralData: any) => void;
  onCancel?: () => void;
}

interface DomainsOfCare {
  medical_history: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  physical_examination: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  functional_assessment: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  cognitive_assessment: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  psychosocial_assessment: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  environmental_assessment: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  medication_review: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  care_coordination: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
  discharge_planning: {
    completed: boolean;
    findings: string;
    assessed_by: string;
    assessment_date: string;
  };
}

interface ReferralData {
  patient_id: string;
  referring_facility_license: string;
  face_to_face_encounter_date: string;
  face_to_face_clinical_reason: string;
  homebound_justification: string;
  domains_of_care: DomainsOfCare;
  required_services: Array<{
    service_code: string;
    service_name: string;
    frequency: string;
    duration: string;
    justification: string;
  }>;
  discharge_planning: {
    estimated_duration: string;
    discharge_criteria: string;
    follow_up_plan: string;
    family_education: string;
  };
}

export default function HomecareReferralForm({
  patientId = "",
  onSubmit,
  onCancel,
}: HomecareReferralFormProps) {
  const [referralData, setReferralData] = useState<ReferralData>({
    patient_id: patientId,
    referring_facility_license: "",
    face_to_face_encounter_date: "",
    face_to_face_clinical_reason: "",
    homebound_justification: "",
    domains_of_care: {
      medical_history: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      physical_examination: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      functional_assessment: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      cognitive_assessment: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      psychosocial_assessment: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      environmental_assessment: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      medication_review: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      care_coordination: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
      discharge_planning: {
        completed: false,
        findings: "",
        assessed_by: "",
        assessment_date: "",
      },
    },
    required_services: [],
    discharge_planning: {
      estimated_duration: "",
      discharge_criteria: "",
      follow_up_plan: "",
      family_education: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [serviceCodes, setServiceCodes] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadServiceCodes();
  }, []);

  const loadServiceCodes = async () => {
    try {
      const response = await ApiService.get("/api/homecare/service-codes-2024");
      setServiceCodes(response);
    } catch (error) {
      console.error("Error loading service codes:", error);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Basic validation
    if (!referralData.patient_id) errors.push("Patient ID is required");
    if (!referralData.referring_facility_license)
      errors.push("Referring facility license is required");
    if (!referralData.face_to_face_encounter_date)
      errors.push("Face-to-face encounter date is required");
    if (!referralData.face_to_face_clinical_reason)
      errors.push("Face-to-face clinical reason is required");
    if (!referralData.homebound_justification)
      errors.push("Homebound justification is required");

    // Validate face-to-face encounter date (must be within last 30 days)
    if (referralData.face_to_face_encounter_date) {
      const encounterDate = new Date(referralData.face_to_face_encounter_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (encounterDate < thirtyDaysAgo) {
        errors.push("Face-to-face encounter must be within the last 30 days");
      }
    }

    // Validate 9 domains of care
    const domainNames = Object.keys(referralData.domains_of_care);
    const incompleteDomains = domainNames.filter(
      (domain) =>
        !referralData.domains_of_care[domain as keyof DomainsOfCare].completed,
    );

    if (incompleteDomains.length > 0) {
      errors.push(
        `All 9 domains of care must be completed. Missing: ${incompleteDomains.join(", ")}`,
      );
    }

    // Validate required services
    if (referralData.required_services.length === 0) {
      errors.push("At least one required service must be specified");
    }

    // Validate discharge planning
    if (!referralData.discharge_planning.estimated_duration)
      errors.push("Estimated duration is required");
    if (!referralData.discharge_planning.discharge_criteria)
      errors.push("Discharge criteria is required");

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.post(
        "/api/homecare/referrals",
        referralData,
      );

      toast({
        title: "Referral submitted",
        description: `Referral ID: ${response.referral_id}`,
      });

      if (onSubmit) {
        onSubmit(response);
      }
    } catch (error) {
      console.error("Error submitting referral:", error);
      toast({
        title: "Error submitting referral",
        description:
          error instanceof Error ? error.message : "Failed to submit referral",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDomainOfCare = (
    domain: keyof DomainsOfCare,
    field: string,
    value: any,
  ) => {
    setReferralData({
      ...referralData,
      domains_of_care: {
        ...referralData.domains_of_care,
        [domain]: {
          ...referralData.domains_of_care[domain],
          [field]: value,
        },
      },
    });
  };

  const addRequiredService = () => {
    setReferralData({
      ...referralData,
      required_services: [
        ...referralData.required_services,
        {
          service_code: "",
          service_name: "",
          frequency: "",
          duration: "",
          justification: "",
        },
      ],
    });
  };

  const updateRequiredService = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedServices = [...referralData.required_services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    setReferralData({
      ...referralData,
      required_services: updatedServices,
    });
  };

  const removeRequiredService = (index: number) => {
    const updatedServices = referralData.required_services.filter(
      (_, i) => i !== index,
    );
    setReferralData({
      ...referralData,
      required_services: updatedServices,
    });
  };

  const getCompletionPercentage = () => {
    const totalDomains = Object.keys(referralData.domains_of_care).length;
    const completedDomains = Object.values(referralData.domains_of_care).filter(
      (domain) => domain.completed,
    ).length;
    return Math.round((completedDomains / totalDomains) * 100);
  };

  const getDomainIcon = (domainKey: string) => {
    const icons: Record<string, React.ReactNode> = {
      medical_history: <FileText className="w-4 h-4" />,
      physical_examination: <Stethoscope className="w-4 h-4" />,
      functional_assessment: <Activity className="w-4 h-4" />,
      cognitive_assessment: <Brain className="w-4 h-4" />,
      psychosocial_assessment: <Heart className="w-4 h-4" />,
      environmental_assessment: <Home className="w-4 h-4" />,
      medication_review: <Pill className="w-4 h-4" />,
      care_coordination: <Users className="w-4 h-4" />,
      discharge_planning: <ClipboardList className="w-4 h-4" />,
    };
    return icons[domainKey] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Home Healthcare Referral Form
            </h1>
            <p className="text-gray-600 mt-1">
              DOH-compliant homecare referral with 9-domain assessment
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Referral"}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                9-Domain Assessment Progress
              </span>
              <span className="text-sm text-gray-600">
                {getCompletionPercentage()}% Complete
              </span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2" />
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="encounter">F2F Encounter</TabsTrigger>
            <TabsTrigger value="domains">9 Domains</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="discharge">Discharge Plan</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Patient and facility information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-id">Patient ID</Label>
                    <Input
                      id="patient-id"
                      value={referralData.patient_id}
                      onChange={(e) =>
                        setReferralData({
                          ...referralData,
                          patient_id: e.target.value,
                        })
                      }
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facility-license">
                      Referring Facility License
                    </Label>
                    <Input
                      id="facility-license"
                      value={referralData.referring_facility_license}
                      onChange={(e) =>
                        setReferralData({
                          ...referralData,
                          referring_facility_license: e.target.value,
                        })
                      }
                      placeholder="DOH facility license number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homebound-justification">
                    Homebound Justification
                  </Label>
                  <Textarea
                    id="homebound-justification"
                    value={referralData.homebound_justification}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        homebound_justification: e.target.value,
                      })
                    }
                    placeholder="Explain why the patient is homebound and unable to leave home without considerable effort"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Face-to-Face Encounter Tab */}
          <TabsContent value="encounter" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Face-to-Face Encounter
                </CardTitle>
                <CardDescription>
                  Required face-to-face encounter documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>DOH Requirement</AlertTitle>
                  <AlertDescription>
                    Face-to-face encounter must have occurred within the last 30
                    days and be documented by a qualified healthcare provider.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="encounter-date">Encounter Date</Label>
                  <Input
                    id="encounter-date"
                    type="date"
                    value={referralData.face_to_face_encounter_date}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        face_to_face_encounter_date: e.target.value,
                      })
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinical-reason">Clinical Reason</Label>
                  <Textarea
                    id="clinical-reason"
                    value={referralData.face_to_face_clinical_reason}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        face_to_face_clinical_reason: e.target.value,
                      })
                    }
                    placeholder="Describe the clinical reason for the face-to-face encounter and how it relates to the need for homecare services"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9 Domains of Care Tab */}
          <TabsContent value="domains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />9 Domains of Care
                  Assessment
                </CardTitle>
                <CardDescription>
                  Complete all 9 domains as required by DOH standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(referralData.domains_of_care).map(
                    ([domainKey, domainData]) => (
                      <Card
                        key={domainKey}
                        className={`border-2 ${
                          domainData.completed
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center">
                              {getDomainIcon(domainKey)}
                              <span className="ml-2 capitalize">
                                {domainKey.replace("_", " ")}
                              </span>
                            </div>
                            {domainData.completed && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${domainKey}-completed`}
                              checked={domainData.completed}
                              onCheckedChange={(checked) =>
                                updateDomainOfCare(
                                  domainKey as keyof DomainsOfCare,
                                  "completed",
                                  checked,
                                )
                              }
                            />
                            <Label
                              htmlFor={`${domainKey}-completed`}
                              className="text-sm"
                            >
                              Assessment completed
                            </Label>
                          </div>
                          {domainData.completed && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs">Findings</Label>
                                <Textarea
                                  value={domainData.findings}
                                  onChange={(e) =>
                                    updateDomainOfCare(
                                      domainKey as keyof DomainsOfCare,
                                      "findings",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Assessment findings"
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Assessed by</Label>
                                  <Input
                                    value={domainData.assessed_by}
                                    onChange={(e) =>
                                      updateDomainOfCare(
                                        domainKey as keyof DomainsOfCare,
                                        "assessed_by",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Assessor name"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Date</Label>
                                  <Input
                                    type="date"
                                    value={domainData.assessment_date}
                                    onChange={(e) =>
                                      updateDomainOfCare(
                                        domainKey as keyof DomainsOfCare,
                                        "assessment_date",
                                        e.target.value,
                                      )
                                    }
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Required Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Required Services
                  </div>
                  <Button onClick={addRequiredService} size="sm">
                    Add Service
                  </Button>
                </CardTitle>
                <CardDescription>
                  Specify the homecare services required for this patient
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {referralData.required_services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No services added yet</p>
                    <p className="text-sm">
                      Click "Add Service" to get started
                    </p>
                  </div>
                ) : (
                  referralData.required_services.map((service, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="serviceName">Service Name</Label>
                            <Input
                              id="serviceName"
                              value={service.service_name}
                              onChange={(e) =>
                                updateRequiredService(
                                  index,
                                  "service_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter service name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="serviceCode">Service Code</Label>
                            <Input
                              id="serviceCode"
                              value={service.service_code}
                              onChange={(e) =>
                                updateRequiredService(
                                  index,
                                  "service_code",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter service code"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Input
                              id="frequency"
                              value={service.frequency}
                              onChange={(e) =>
                                updateRequiredService(
                                  index,
                                  "frequency",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Daily, Weekly"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={service.duration}
                              onChange={(e) =>
                                updateRequiredService(
                                  index,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., 30 minutes"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="justification">Justification</Label>
                          <Textarea
                            id="justification"
                            value={service.justification}
                            onChange={(e) =>
                              updateRequiredService(
                                index,
                                "justification",
                                e.target.value,
                              )
                            }
                            placeholder="Provide clinical justification for this service"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeRequiredService(index)}
                          >
                            Remove Service
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                <div className="flex justify-end mt-4">
                  <Button onClick={addRequiredService}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discharge Planning Tab */}
          <TabsContent value="discharge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Discharge Planning
                </CardTitle>
                <CardDescription>
                  Plan for patient discharge and follow-up care
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input
                    id="estimatedDuration"
                    value={referralData.discharge_planning.estimated_duration}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        discharge_planning: {
                          ...referralData.discharge_planning,
                          estimated_duration: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., 6-8 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dischargeCriteria">Discharge Criteria</Label>
                  <Textarea
                    id="dischargeCriteria"
                    value={referralData.discharge_planning.discharge_criteria}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        discharge_planning: {
                          ...referralData.discharge_planning,
                          discharge_criteria: e.target.value,
                        },
                      })
                    }
                    placeholder="Define criteria for successful discharge"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpPlan">Follow-up Plan</Label>
                  <Textarea
                    id="followUpPlan"
                    value={referralData.discharge_planning.follow_up_plan}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        discharge_planning: {
                          ...referralData.discharge_planning,
                          follow_up_plan: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe follow-up care plan"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyEducation">Family Education</Label>
                  <Textarea
                    id="familyEducation"
                    value={referralData.discharge_planning.family_education}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        discharge_planning: {
                          ...referralData.discharge_planning,
                          family_education: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe family education and training provided"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Referral"}
          </Button>
        </div>
      </div>
    </div>
  );
}
