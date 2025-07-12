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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Calendar,
  User,
  Shield,
  Home,
  Activity,
  MapPin,
  Phone,
  Mail,
  Settings,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface HomecareAllocationProps {
  patientId?: string;
  onAllocationComplete?: (allocationId: string) => void;
  className?: string;
}

interface HomecareAllocation {
  // Patient Information
  patientId: string;
  patientName: string;
  emiratesId: string;
  damanInsuranceNumber: string;
  contactNumber: string;
  address: string;

  // Service Requirements
  serviceType: string;
  serviceCodes: string[];
  requestedDuration: number;
  frequency: string;
  urgencyLevel: "routine" | "urgent" | "emergency";

  // OpenJet Integration (Effective Feb 24, 2025)
  openJetRequestId: string;
  faceToFaceAssessmentCompleted: boolean;
  faceToFaceAssessmentDate: string;
  assessmentOutcome: string;
  periodicAssessmentRequired: boolean;
  nextAssessmentDate: string;

  // Provider Allocation
  preferredProvider: string;
  allocatedProvider: string;
  providerContactInfo: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
  };

  // Scheduling
  preferredSchedule: {
    startDate: string;
    endDate: string;
    timeSlots: string[];
    specialRequirements: string;
  };

  // Documentation
  requiredDocuments: string[];
  uploadedDocuments: string[];
  clinicalJustification: string;

  // Compliance & Tracking
  allocationStatus:
    | "pending"
    | "allocated"
    | "confirmed"
    | "active"
    | "completed";
  complianceChecks: {
    damanApproval: boolean;
    providerCredentials: boolean;
    serviceAuthorization: boolean;
    documentationComplete: boolean;
  };

  // Automation Features
  automatedRouting: boolean;
  routingCriteria: {
    location: boolean;
    specialization: boolean;
    availability: boolean;
    patientPreference: boolean;
  };

  // Quality Assurance
  qualityMetrics: {
    responseTime: number;
    allocationAccuracy: number;
    patientSatisfaction: number;
    providerCompliance: number;
  };

  // Timestamps
  requestDate: string;
  allocationDate: string;
  confirmationDate: string;
  lastUpdated: string;
}

const HOMECARE_SERVICES = [
  {
    code: "17-25-1",
    name: "Per Diem Simple Home Visit - Nursing",
    rate: 300,
    description: "Basic nursing care at home",
  },
  {
    code: "17-25-2",
    name: "Per Diem Simple Home Visit - Physiotherapy",
    rate: 300,
    description: "Basic physiotherapy services at home",
  },
  {
    code: "17-25-3",
    name: "Per Diem Specialized Home Visit - OT Consultation",
    rate: 800,
    description: "Occupational therapy consultation",
  },
  {
    code: "17-25-4",
    name: "Per Diem Routine Home Nursing Care",
    rate: 900,
    description: "Routine nursing care with monitoring",
  },
  {
    code: "17-25-5",
    name: "Per Diem Advanced Home Nursing Care",
    rate: 1800,
    description: "Advanced nursing care with specialized equipment",
  },
];

const REQUIRED_DOCUMENTS = [
  "Face-to-Face Assessment Form (OpenJet)",
  "Medical Report",
  "Treatment Plan",
  "Physician Referral",
  "Insurance Authorization",
  "Patient Consent Form",
  "Homecare Service Agreement",
  "Provider Credentials Verification",
  "Emergency Contact Information",
  "Medication List",
  "Care Plan Documentation",
  "Quality Assurance Checklist",
];

export default function HomecareAllocationManager({
  patientId = "",
  onAllocationComplete,
  className,
}: HomecareAllocationProps) {
  const [allocation, setAllocation] = useState<HomecareAllocation>({
    patientId,
    patientName: "",
    emiratesId: "",
    damanInsuranceNumber: "",
    contactNumber: "",
    address: "",
    serviceType: "",
    serviceCodes: [],
    requestedDuration: 30,
    frequency: "daily",
    urgencyLevel: "routine",
    openJetRequestId: "",
    faceToFaceAssessmentCompleted: false,
    faceToFaceAssessmentDate: "",
    assessmentOutcome: "",
    periodicAssessmentRequired: false,
    nextAssessmentDate: "",
    preferredProvider: "",
    allocatedProvider: "",
    providerContactInfo: {
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
    },
    preferredSchedule: {
      startDate: "",
      endDate: "",
      timeSlots: [],
      specialRequirements: "",
    },
    requiredDocuments: [],
    uploadedDocuments: [],
    clinicalJustification: "",
    allocationStatus: "pending",
    complianceChecks: {
      damanApproval: false,
      providerCredentials: false,
      serviceAuthorization: false,
      documentationComplete: false,
    },
    automatedRouting: true,
    routingCriteria: {
      location: true,
      specialization: true,
      availability: true,
      patientPreference: true,
    },
    qualityMetrics: {
      responseTime: 0,
      allocationAccuracy: 0,
      patientSatisfaction: 0,
      providerCompliance: 0,
    },
    requestDate: new Date().toISOString(),
    allocationDate: "",
    confirmationDate: "",
    lastUpdated: new Date().toISOString(),
  });

  const [activeTab, setActiveTab] = useState("patient");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Enhanced validation with OpenJet integration requirements
  const validateAllocation = (): string[] => {
    const errors: string[] = [];
    const openJetEffectiveDate = new Date("2025-02-24");
    const currentDate = new Date();
    const isOpenJetActive = currentDate >= openJetEffectiveDate;

    // Patient Information Validation
    if (!allocation.patientId) errors.push("Patient ID is required");
    if (!allocation.patientName) errors.push("Patient name is required");
    if (!allocation.emiratesId) errors.push("Emirates ID is required");
    if (!allocation.damanInsuranceNumber)
      errors.push("Daman insurance number is required");
    if (!allocation.contactNumber) errors.push("Contact number is required");
    if (!allocation.address) errors.push("Patient address is required");

    // Service Requirements Validation
    if (!allocation.serviceType) errors.push("Service type must be selected");
    if (allocation.serviceCodes.length === 0)
      errors.push("At least one service code must be selected");
    if (allocation.requestedDuration <= 0)
      errors.push("Requested duration must be greater than 0");

    // OpenJet Integration Validation (Effective Feb 24, 2025)
    if (isOpenJetActive) {
      if (!allocation.openJetRequestId)
        errors.push("OpenJet request ID is required from Feb 24, 2025");
      if (!allocation.faceToFaceAssessmentCompleted)
        errors.push(
          "Face-to-face assessment must be completed for homecare allocation",
        );
      if (!allocation.faceToFaceAssessmentDate)
        errors.push("Face-to-face assessment date is required");
      if (!allocation.assessmentOutcome)
        errors.push("Assessment outcome must be documented");

      // Periodic assessment requirements
      if (
        allocation.periodicAssessmentRequired &&
        !allocation.nextAssessmentDate
      ) {
        errors.push(
          "Next assessment date is required for periodic assessments",
        );
      }
    }

    // Provider Allocation Validation
    if (allocation.allocationStatus !== "pending") {
      if (!allocation.allocatedProvider)
        errors.push("Provider must be allocated");
      if (!allocation.providerContactInfo.name)
        errors.push("Provider contact information is required");
      if (!allocation.providerContactInfo.licenseNumber)
        errors.push("Provider license number is required");
    }

    // Scheduling Validation
    if (!allocation.preferredSchedule.startDate)
      errors.push("Service start date is required");
    if (!allocation.preferredSchedule.endDate)
      errors.push("Service end date is required");
    if (allocation.preferredSchedule.timeSlots.length === 0)
      errors.push("At least one time slot must be selected");

    // Documentation Validation
    if (allocation.requiredDocuments.length === 0)
      errors.push("Required documents must be specified");
    if (
      !allocation.clinicalJustification ||
      allocation.clinicalJustification.length < 50
    ) {
      errors.push("Clinical justification must be at least 50 characters long");
    }

    // OpenJet specific document requirements
    if (isOpenJetActive) {
      if (
        !allocation.requiredDocuments.includes(
          "Face-to-Face Assessment Form (OpenJet)",
        )
      ) {
        errors.push(
          "Face-to-Face Assessment Form (OpenJet) is mandatory from Feb 24, 2025",
        );
      }
    }

    // Compliance Checks Validation
    if (allocation.allocationStatus === "confirmed") {
      if (!allocation.complianceChecks.damanApproval)
        errors.push("Daman approval is required before confirmation");
      if (!allocation.complianceChecks.providerCredentials)
        errors.push("Provider credentials must be verified");
      if (!allocation.complianceChecks.serviceAuthorization)
        errors.push("Service authorization must be confirmed");
      if (!allocation.complianceChecks.documentationComplete)
        errors.push("All documentation must be complete");
    }

    return errors;
  };

  const handleSubmitAllocation = async () => {
    const errors = validateAllocation();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Errors",
        description: `${errors.length} issues found. Please review and fix.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Validate allocation data structure before processing
      const sanitizedAllocation = JSON.parse(JSON.stringify(allocation));
      if (!sanitizedAllocation || typeof sanitizedAllocation !== "object") {
        throw new Error("Invalid allocation data structure");
      }

      // Simulate OpenJet integration and automated routing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const allocationId = `HCA-${Date.now()}`;
      const openJetRequestId = `OJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Create validated update object with proper structure
      const updatedAllocation: HomecareAllocation = {
        ...sanitizedAllocation,
        openJetRequestId,
        allocationStatus: "allocated",
        allocationDate: new Date().toISOString(),
        allocatedProvider: "Reyada Home Healthcare Services",
        providerContactInfo: {
          name: "Nurse Sarah Al-Zahra",
          phone: "+971-50-123-4567",
          email: "sarah.alzahra@reyada.ae",
          licenseNumber: "RN-UAE-2024-001",
        },
        qualityMetrics: {
          responseTime: 15,
          allocationAccuracy: 98,
          patientSatisfaction: 95,
          providerCompliance: 97,
        },
        lastUpdated: new Date().toISOString(),
      };

      // Validate the updated allocation before setting state
      const validatedAllocation = JSON.parse(JSON.stringify(updatedAllocation));
      setAllocation(validatedAllocation);

      toast({
        title: "Homecare Allocation Successful",
        description: `Allocation ${allocationId} created with OpenJet integration. Provider allocated automatically.`,
      });

      if (onAllocationComplete && typeof onAllocationComplete === "function") {
        onAllocationComplete(allocationId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Allocation processing error:", errorMessage);

      toast({
        title: "Allocation Failed",
        description: "Failed to process homecare allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addDocument = (documentType: string) => {
    try {
      if (!documentType || typeof documentType !== "string") {
        console.warn("Invalid document type provided");
        return;
      }

      if (!allocation.requiredDocuments.includes(documentType)) {
        setAllocation((prev) => {
          const updatedAllocation = {
            ...prev,
            requiredDocuments: [...prev.requiredDocuments, documentType],
          };
          // Validate the update before applying
          JSON.parse(JSON.stringify(updatedAllocation));
          return updatedAllocation;
        });
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const removeDocument = (documentType: string) => {
    try {
      if (!documentType || typeof documentType !== "string") {
        console.warn("Invalid document type provided");
        return;
      }

      setAllocation((prev) => {
        const updatedAllocation = {
          ...prev,
          requiredDocuments: prev.requiredDocuments.filter(
            (doc) => doc !== documentType,
          ),
        };
        // Validate the update before applying
        JSON.parse(JSON.stringify(updatedAllocation));
        return updatedAllocation;
      });
    } catch (error) {
      console.error("Error removing document:", error);
    }
  };

  const addTimeSlot = (timeSlot: string) => {
    try {
      if (!timeSlot || typeof timeSlot !== "string") {
        console.warn("Invalid time slot provided");
        return;
      }

      if (!allocation.preferredSchedule.timeSlots.includes(timeSlot)) {
        setAllocation((prev) => {
          const updatedAllocation = {
            ...prev,
            preferredSchedule: {
              ...prev.preferredSchedule,
              timeSlots: [...prev.preferredSchedule.timeSlots, timeSlot],
            },
          };
          // Validate the update before applying
          JSON.parse(JSON.stringify(updatedAllocation));
          return updatedAllocation;
        });
      }
    } catch (error) {
      console.error("Error adding time slot:", error);
    }
  };

  const removeTimeSlot = (timeSlot: string) => {
    try {
      if (!timeSlot || typeof timeSlot !== "string") {
        console.warn("Invalid time slot provided");
        return;
      }

      setAllocation((prev) => {
        const updatedAllocation = {
          ...prev,
          preferredSchedule: {
            ...prev.preferredSchedule,
            timeSlots: prev.preferredSchedule.timeSlots.filter(
              (slot) => slot !== timeSlot,
            ),
          },
        };
        // Validate the update before applying
        JSON.parse(JSON.stringify(updatedAllocation));
        return updatedAllocation;
      });
    } catch (error) {
      console.error("Error removing time slot:", error);
    }
  };

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Home className="w-6 h-6 mr-2 text-blue-600" />
            Homecare Allocation Manager
          </h2>
          <p className="text-gray-600 mt-1">
            OpenJet integrated homecare allocation with automated routing
            (Effective Feb 24, 2025)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            OpenJet Integration Active
          </Badge>
          <Badge
            className={
              allocation.allocationStatus === "allocated"
                ? "text-green-600 bg-green-100"
                : "text-yellow-600 bg-yellow-100"
            }
          >
            {allocation.allocationStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* OpenJet Integration Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">
          OpenJet Homecare Allocation Automation (Effective Feb 24, 2025)
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Automated provider routing and tracking</li>
            <li>Face-to-face assessment form mandatory</li>
            <li>Real-time service request status synchronization</li>
            <li>Unified provider portal experience</li>
            <li>Enhanced quality metrics and compliance monitoring</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="patient">Patient Info</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Patient Information Tab */}
        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
              <CardDescription>
                Complete patient demographics and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={allocation.patientId}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        patientId: e.target.value,
                      }))
                    }
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={allocation.patientName}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        patientName: e.target.value,
                      }))
                    }
                    placeholder="Enter patient full name"
                  />
                </div>
                <div>
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input
                    id="emiratesId"
                    value={allocation.emiratesId}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        emiratesId: e.target.value,
                      }))
                    }
                    placeholder="xxx-xxxx-xxxxxxx-x"
                  />
                </div>
                <div>
                  <Label htmlFor="damanInsuranceNumber">
                    Daman Insurance Number
                  </Label>
                  <Input
                    id="damanInsuranceNumber"
                    value={allocation.damanInsuranceNumber}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        damanInsuranceNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter Daman insurance number"
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={allocation.contactNumber}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    placeholder="+971-xx-xxx-xxxx"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Home Address</Label>
                <Textarea
                  id="address"
                  value={allocation.address}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter complete home address for service delivery"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Homecare Services
              </CardTitle>
              <CardDescription>
                Select required homecare services with updated codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Primary Service Type</Label>
                  <Select
                    value={allocation.serviceType}
                    onValueChange={(value) =>
                      setAllocation((prev) => ({ ...prev, serviceType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nursing_care">Nursing Care</SelectItem>
                      <SelectItem value="physiotherapy">
                        Physiotherapy
                      </SelectItem>
                      <SelectItem value="occupational_therapy">
                        Occupational Therapy
                      </SelectItem>
                      <SelectItem value="routine_nursing">
                        Routine Nursing
                      </SelectItem>
                      <SelectItem value="advanced_nursing">
                        Advanced Nursing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={allocation.urgencyLevel}
                    onValueChange={(value) =>
                      setAllocation((prev) => ({
                        ...prev,
                        urgencyLevel: value as
                          | "routine"
                          | "urgent"
                          | "emergency",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="requestedDuration">Duration (Days)</Label>
                  <Input
                    id="requestedDuration"
                    type="number"
                    value={allocation.requestedDuration}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        requestedDuration: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Service Frequency</Label>
                  <Select
                    value={allocation.frequency}
                    onValueChange={(value) =>
                      setAllocation((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_weekly">
                        3 Times Weekly
                      </SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service Codes Selection */}
              <div>
                <Label>Available Service Codes (2025)</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {HOMECARE_SERVICES.map((service) => (
                    <div
                      key={service.code}
                      className="p-4 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={service.code}
                            checked={allocation.serviceCodes.includes(
                              service.code,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAllocation((prev) => ({
                                  ...prev,
                                  serviceCodes: [
                                    ...prev.serviceCodes,
                                    service.code,
                                  ],
                                }));
                              } else {
                                setAllocation((prev) => ({
                                  ...prev,
                                  serviceCodes: prev.serviceCodes.filter(
                                    (code) => code !== service.code,
                                  ),
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <Label
                              htmlFor={service.code}
                              className="font-medium"
                            >
                              {service.code} - {service.name}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <Badge className="text-green-600 bg-green-100">
                          AED {service.rate}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Justification */}
              <div>
                <Label htmlFor="clinicalJustification">
                  Clinical Justification (Minimum 50 characters)
                </Label>
                <Textarea
                  id="clinicalJustification"
                  value={allocation.clinicalJustification}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      clinicalJustification: e.target.value,
                    }))
                  }
                  placeholder="Provide detailed clinical justification for homecare services..."
                  rows={4}
                  className="mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {allocation.clinicalJustification.length}/50 characters
                  minimum
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Face-to-Face Assessment (OpenJet Requirement)
              </CardTitle>
              <CardDescription>
                Complete face-to-face assessment as per OpenJet integration
                requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openJetRequestId">OpenJet Request ID</Label>
                  <Input
                    id="openJetRequestId"
                    value={allocation.openJetRequestId}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        openJetRequestId: e.target.value,
                      }))
                    }
                    placeholder="Auto-generated on submission"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="faceToFaceAssessmentDate">
                    Assessment Date
                  </Label>
                  <Input
                    id="faceToFaceAssessmentDate"
                    type="date"
                    value={allocation.faceToFaceAssessmentDate}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        faceToFaceAssessmentDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="faceToFaceAssessmentCompleted"
                  checked={allocation.faceToFaceAssessmentCompleted}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      faceToFaceAssessmentCompleted: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="faceToFaceAssessmentCompleted">
                  Face-to-Face Assessment Completed (Required for OpenJet)
                </Label>
              </div>

              <div>
                <Label htmlFor="assessmentOutcome">Assessment Outcome</Label>
                <Textarea
                  id="assessmentOutcome"
                  value={allocation.assessmentOutcome}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      assessmentOutcome: e.target.value,
                    }))
                  }
                  placeholder="Document the outcome of the face-to-face assessment..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="periodicAssessmentRequired"
                  checked={allocation.periodicAssessmentRequired}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      periodicAssessmentRequired: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="periodicAssessmentRequired">
                  Periodic Assessment Required
                </Label>
              </div>

              {allocation.periodicAssessmentRequired && (
                <div>
                  <Label htmlFor="nextAssessmentDate">
                    Next Assessment Date
                  </Label>
                  <Input
                    id="nextAssessmentDate"
                    type="date"
                    value={allocation.nextAssessmentDate}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        nextAssessmentDate: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provider Tab */}
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Provider Allocation
              </CardTitle>
              <CardDescription>
                Automated provider routing and allocation management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="automatedRouting"
                  checked={allocation.automatedRouting}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      automatedRouting: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="automatedRouting">
                  Enable Automated Provider Routing (OpenJet)
                </Label>
              </div>

              {allocation.automatedRouting && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">
                    Routing Criteria
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="locationCriteria"
                        checked={allocation.routingCriteria.location}
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            routingCriteria: {
                              ...prev.routingCriteria,
                              location: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="locationCriteria">Location-based</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="specializationCriteria"
                        checked={allocation.routingCriteria.specialization}
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            routingCriteria: {
                              ...prev.routingCriteria,
                              specialization: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="specializationCriteria">
                        Specialization Match
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="availabilityCriteria"
                        checked={allocation.routingCriteria.availability}
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            routingCriteria: {
                              ...prev.routingCriteria,
                              availability: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="availabilityCriteria">
                        Real-time Availability
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="patientPreferenceCriteria"
                        checked={allocation.routingCriteria.patientPreference}
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            routingCriteria: {
                              ...prev.routingCriteria,
                              patientPreference: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="patientPreferenceCriteria">
                        Patient Preference
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="preferredProvider">Preferred Provider</Label>
                <Input
                  id="preferredProvider"
                  value={allocation.preferredProvider}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      preferredProvider: e.target.value,
                    }))
                  }
                  placeholder="Enter preferred provider name (optional)"
                />
              </div>

              {allocation.allocationStatus !== "pending" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-3">
                    Allocated Provider Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Provider Name</Label>
                      <p className="text-sm font-medium">
                        {allocation.providerContactInfo.name}
                      </p>
                    </div>
                    <div>
                      <Label>License Number</Label>
                      <p className="text-sm font-medium">
                        {allocation.providerContactInfo.licenseNumber}
                      </p>
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <p className="text-sm font-medium">
                        {allocation.providerContactInfo.phone}
                      </p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm font-medium">
                        {allocation.providerContactInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Service Schedule
              </CardTitle>
              <CardDescription>
                Configure preferred schedule and timing for homecare services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Service Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={allocation.preferredSchedule.startDate}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        preferredSchedule: {
                          ...prev.preferredSchedule,
                          startDate: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Service End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={allocation.preferredSchedule.endDate}
                    onChange={(e) =>
                      setAllocation((prev) => ({
                        ...prev,
                        preferredSchedule: {
                          ...prev.preferredSchedule,
                          endDate: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Preferred Time Slots</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    "08:00-10:00",
                    "10:00-12:00",
                    "12:00-14:00",
                    "14:00-16:00",
                    "16:00-18:00",
                    "18:00-20:00",
                  ].map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant={
                        allocation.preferredSchedule.timeSlots.includes(
                          timeSlot,
                        )
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (
                          allocation.preferredSchedule.timeSlots.includes(
                            timeSlot,
                          )
                        ) {
                          removeTimeSlot(timeSlot);
                        } else {
                          addTimeSlot(timeSlot);
                        }
                      }}
                      className="justify-center"
                    >
                      {allocation.preferredSchedule.timeSlots.includes(
                        timeSlot,
                      ) ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequirements">
                  Special Requirements
                </Label>
                <Textarea
                  id="specialRequirements"
                  value={allocation.preferredSchedule.specialRequirements}
                  onChange={(e) =>
                    setAllocation((prev) => ({
                      ...prev,
                      preferredSchedule: {
                        ...prev.preferredSchedule,
                        specialRequirements: e.target.value,
                      },
                    }))
                  }
                  placeholder="Any special scheduling requirements or preferences..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Compliance & Documentation
              </CardTitle>
              <CardDescription>
                Ensure all compliance requirements and documentation are
                complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Required Documents */}
              <div>
                <Label>Required Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {REQUIRED_DOCUMENTS.map((docType) => {
                    const isSelected =
                      allocation.requiredDocuments.includes(docType);
                    const isOpenJetDoc = docType.includes("OpenJet");

                    return (
                      <Button
                        key={docType}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            removeDocument(docType);
                          } else {
                            addDocument(docType);
                          }
                        }}
                        className="justify-start h-auto p-3"
                      >
                        <div className="flex items-start space-x-2 w-full">
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                          ) : (
                            <Upload className="w-4 h-4 mt-0.5" />
                          )}
                          <div className="text-left flex-1">
                            <div className="font-medium text-sm">{docType}</div>
                            {isOpenJetDoc && (
                              <div className="text-xs text-blue-600 mt-1">
                                OpenJet Requirement
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Compliance Checks */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  Compliance Checklist
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="damanApproval"
                        checked={allocation.complianceChecks.damanApproval}
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            complianceChecks: {
                              ...prev.complianceChecks,
                              damanApproval: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="damanApproval">Daman Approval</Label>
                    </div>
                    <Badge
                      className={
                        allocation.complianceChecks.damanApproval
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }
                    >
                      {allocation.complianceChecks.damanApproval
                        ? "Complete"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="providerCredentials"
                        checked={
                          allocation.complianceChecks.providerCredentials
                        }
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            complianceChecks: {
                              ...prev.complianceChecks,
                              providerCredentials: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="providerCredentials">
                        Provider Credentials
                      </Label>
                    </div>
                    <Badge
                      className={
                        allocation.complianceChecks.providerCredentials
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }
                    >
                      {allocation.complianceChecks.providerCredentials
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="serviceAuthorization"
                        checked={
                          allocation.complianceChecks.serviceAuthorization
                        }
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            complianceChecks: {
                              ...prev.complianceChecks,
                              serviceAuthorization: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="serviceAuthorization">
                        Service Authorization
                      </Label>
                    </div>
                    <Badge
                      className={
                        allocation.complianceChecks.serviceAuthorization
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }
                    >
                      {allocation.complianceChecks.serviceAuthorization
                        ? "Authorized"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="documentationComplete"
                        checked={
                          allocation.complianceChecks.documentationComplete
                        }
                        onChange={(e) =>
                          setAllocation((prev) => ({
                            ...prev,
                            complianceChecks: {
                              ...prev.complianceChecks,
                              documentationComplete: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="documentationComplete">
                        Documentation Complete
                      </Label>
                    </div>
                    <Badge
                      className={
                        allocation.complianceChecks.documentationComplete
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }
                    >
                      {allocation.complianceChecks.documentationComplete
                        ? "Complete"
                        : "Incomplete"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              {allocation.allocationStatus !== "pending" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">
                    Quality Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {allocation.qualityMetrics.responseTime}m
                      </div>
                      <div className="text-sm text-gray-600">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {allocation.qualityMetrics.allocationAccuracy}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Allocation Accuracy
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {allocation.qualityMetrics.patientSatisfaction}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Patient Satisfaction
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {allocation.qualityMetrics.providerCompliance}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Provider Compliance
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Validation Errors ({validationErrors.length})
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            const errors = validateAllocation();
            setValidationErrors(errors);
            if (errors.length === 0) {
              toast({
                title: "Validation Successful",
                description: "All requirements met. Ready for allocation.",
              });
            }
          }}
        >
          Validate Allocation
        </Button>
        <Button
          onClick={handleSubmitAllocation}
          disabled={isProcessing}
          className="flex items-center"
        >
          {isProcessing ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Allocation Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
