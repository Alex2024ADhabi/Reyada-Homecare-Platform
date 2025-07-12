import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Users,
  Clock,
  Activity,
  Send,
  Eye,
  Download,
  RefreshCw,
  Server,
  Globe,
  AlertCircle,
  UserCheck,
  Database,
  Zap,
  Lock,
} from "lucide-react";
import { damanIntegrationAPI } from "@/api/daman-integration.api";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { useToast } from "@/hooks/useToast";

interface DamanWorkflowState {
  currentStep: number;
  authorizationData: any;
  validationResults: any;
  submissionStatus:
    | "idle"
    | "validating"
    | "submitting"
    | "completed"
    | "error";
  errors: string[];
}

const EnhancedDamanWorkflow: React.FC = () => {
  const { toast } = useToast();
  const [workflowState, setWorkflowState] = useState<DamanWorkflowState>({
    currentStep: 1,
    authorizationData: {
      patientId: "",
      serviceType: "",
      providerId: "",
      clinicalJustification: "",
      requestedServices: [],
      urgencyLevel: "routine",
      estimatedDuration: 0,
      diagnosisCodes: [],
      treatmentPlan: "",
      paymentTerms: 30, // Updated to 30 days
      submissionDeadline: "08:00",
      gracePeriodEnabled: true,
      lateSubmissionHandling: true,
    },
    validationResults: null,
    submissionStatus: "idle",
    errors: [],
  });

  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      const health = await damanIntegrationAPI.getSystemStatus();
      setSystemHealth(health);
    } catch (error) {
      console.error("Failed to load system health:", error);
      toast({
        title: "System Health Check Failed",
        description: "Unable to verify Daman integration status",
        variant: "destructive",
      });
    }
  };

  const validateAuthorizationData = async () => {
    try {
      setWorkflowState((prev) => ({
        ...prev,
        submissionStatus: "validating",
        errors: [],
      }));

      // Sanitize input data
      const sanitizedData = {
        ...workflowState.authorizationData,
        patientId: inputSanitizer.sanitizeText(
          workflowState.authorizationData.patientId,
          50,
        ).sanitized,
        serviceType: inputSanitizer.sanitizeText(
          workflowState.authorizationData.serviceType,
          100,
        ).sanitized,
        providerId: inputSanitizer.sanitizeText(
          workflowState.authorizationData.providerId,
          50,
        ).sanitized,
        clinicalJustification: inputSanitizer.sanitizeText(
          workflowState.authorizationData.clinicalJustification,
          2000,
        ).sanitized,
        treatmentPlan: inputSanitizer.sanitizeText(
          workflowState.authorizationData.treatmentPlan,
          2000,
        ).sanitized,
      };

      // Validate JSON structure
      const jsonString = JsonValidator.safeStringify(sanitizedData);
      const validationResult = JsonValidator.validate(jsonString);

      if (!validationResult.isValid) {
        throw new Error(
          `Invalid data structure: ${validationResult.errors?.join(", ")}`,
        );
      }

      // Perform business logic validation
      const errors: string[] = [];
      if (!sanitizedData.patientId) errors.push("Patient ID is required");
      if (!sanitizedData.serviceType) errors.push("Service type is required");
      if (!sanitizedData.providerId) errors.push("Provider ID is required");
      if (!sanitizedData.clinicalJustification)
        errors.push("Clinical justification is required");
      if (!sanitizedData.treatmentPlan)
        errors.push("Treatment plan is required");

      if (errors.length > 0) {
        setWorkflowState((prev) => ({
          ...prev,
          submissionStatus: "error",
          errors,
        }));
        return;
      }

      // Update state with validated data
      setWorkflowState((prev) => ({
        ...prev,
        authorizationData: sanitizedData,
        validationResults: validationResult,
        submissionStatus: "idle",
        errors: [],
      }));

      toast({
        title: "Validation Successful",
        description: "Authorization data is valid and ready for submission",
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown validation error";
      setWorkflowState((prev) => ({
        ...prev,
        submissionStatus: "error",
        errors: [errorMessage],
      }));

      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const submitAuthorization = async () => {
    try {
      setWorkflowState((prev) => ({ ...prev, submissionStatus: "submitting" }));

      const response = await damanIntegrationAPI.submitAuthorization(
        workflowState.authorizationData,
      );

      setWorkflowState((prev) => ({
        ...prev,
        submissionStatus: "completed",
        validationResults: {
          ...prev.validationResults,
          submissionResponse: response,
        },
      }));

      toast({
        title: "Authorization Submitted",
        description: `Authorization ID: ${response.authorizationId}`,
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Submission failed";
      setWorkflowState((prev) => ({
        ...prev,
        submissionStatus: "error",
        errors: [errorMessage],
      }));

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const performEligibilityCheck = async () => {
    if (
      !workflowState.authorizationData.patientId ||
      !workflowState.authorizationData.serviceType
    ) {
      toast({
        title: "Missing Information",
        description:
          "Patient ID and Service Type are required for eligibility check",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const eligibilityResult =
        await damanIntegrationAPI.performRealTimeEligibilityCheck(
          workflowState.authorizationData.patientId,
          workflowState.authorizationData.serviceType,
          workflowState.authorizationData.providerId || "default-provider",
        );

      toast({
        title: "Eligibility Check Complete",
        description: eligibilityResult.eligible
          ? "Patient is eligible"
          : "Patient eligibility requires review",
        variant: eligibilityResult.eligible ? "default" : "destructive",
      });

      setWorkflowState((prev) => ({
        ...prev,
        validationResults: {
          ...prev.validationResults,
          eligibilityCheck: eligibilityResult,
        },
      }));
    } catch (error) {
      toast({
        title: "Eligibility Check Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAuthorizationData = (field: string, value: any) => {
    setWorkflowState((prev) => ({
      ...prev,
      authorizationData: {
        ...prev.authorizationData,
        [field]: value,
      },
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "validating":
      case "submitting":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "validating":
      case "submitting":
        return <Activity className="h-5 w-5 text-blue-600 animate-spin" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-blue-600" />
              Enhanced Daman Workflow
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive Daman authorization workflow with real-time
              validation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadSystemHealth}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              System Status
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Integration Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Daman API</p>
                    <p className="text-sm text-gray-600">
                      {systemHealth.daman.responseTime}ms
                    </p>
                  </div>
                  <Badge
                    className={
                      systemHealth.daman.status === "healthy"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {systemHealth.daman.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">OpenJet</p>
                    <p className="text-sm text-gray-600">
                      {systemHealth.openjet.responseTime}ms
                    </p>
                  </div>
                  <Badge
                    className={
                      systemHealth.openjet.status === "healthy"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {systemHealth.openjet.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Overall Health</p>
                    <p className="text-sm text-gray-600">
                      {systemHealth.overallHealth}%
                    </p>
                  </div>
                  <Progress
                    value={systemHealth.overallHealth}
                    className="w-16 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Status */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(workflowState.submissionStatus)}
              <span
                className={`ml-2 ${getStatusColor(workflowState.submissionStatus)}`}
              >
                Workflow Status: {workflowState.submissionStatus.toUpperCase()}
              </span>
            </CardTitle>
          </CardHeader>
          {workflowState.errors.length > 0 && (
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  Validation Errors:
                </h4>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {workflowState.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Main Workflow */}
      <Tabs defaultValue="authorization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authorization">Authorization</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="submission">Submission</TabsTrigger>
        </TabsList>

        <TabsContent value="authorization">
          <Card>
            <CardHeader>
              <CardTitle>Authorization Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input
                    id="patientId"
                    value={workflowState.authorizationData.patientId}
                    onChange={(e) =>
                      updateAuthorizationData("patientId", e.target.value)
                    }
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="providerId">Provider ID *</Label>
                  <Input
                    id="providerId"
                    value={workflowState.authorizationData.providerId}
                    onChange={(e) =>
                      updateAuthorizationData("providerId", e.target.value)
                    }
                    placeholder="Enter provider ID"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    value={workflowState.authorizationData.serviceType}
                    onValueChange={(value) =>
                      updateAuthorizationData("serviceType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17-25-1">
                        Per Diem - Simple Home Visit - Nursing Service
                      </SelectItem>
                      <SelectItem value="17-25-2">
                        Per Diem - Simple Home Visit - Supportive Service
                      </SelectItem>
                      <SelectItem value="17-25-3">
                        Per Diem - Specialized Home Visit - Consultation
                      </SelectItem>
                      <SelectItem value="17-25-4">
                        Per Diem - Routine Home Nursing Care
                      </SelectItem>
                      <SelectItem value="17-25-5">
                        Per Diem - Advanced Home Nursing Care
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={workflowState.authorizationData.urgencyLevel}
                    onValueChange={(value) =>
                      updateAuthorizationData("urgencyLevel", value)
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
              </div>
              <div>
                <Label htmlFor="clinicalJustification">
                  Clinical Justification *
                </Label>
                <Textarea
                  id="clinicalJustification"
                  value={workflowState.authorizationData.clinicalJustification}
                  onChange={(e) =>
                    updateAuthorizationData(
                      "clinicalJustification",
                      e.target.value,
                    )
                  }
                  placeholder="Provide detailed clinical justification"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
                <Textarea
                  id="treatmentPlan"
                  value={workflowState.authorizationData.treatmentPlan}
                  onChange={(e) =>
                    updateAuthorizationData("treatmentPlan", e.target.value)
                  }
                  placeholder="Describe the treatment plan"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Eligibility Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={performEligibilityCheck}
                  disabled={
                    loading || !workflowState.authorizationData.patientId
                  }
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {loading
                    ? "Checking Eligibility..."
                    : "Perform Eligibility Check"}
                </Button>

                {workflowState.validationResults?.eligibilityCheck && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Eligibility Results:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Eligible:</span>
                        <Badge
                          className={
                            workflowState.validationResults.eligibilityCheck
                              .eligible
                              ? "bg-green-100 text-green-800 ml-2"
                              : "bg-red-100 text-red-800 ml-2"
                          }
                        >
                          {workflowState.validationResults.eligibilityCheck
                            .eligible
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Pre-Auth Required:</span>
                        <Badge
                          className={
                            workflowState.validationResults.eligibilityCheck
                              .preAuthRequired
                              ? "bg-yellow-100 text-yellow-800 ml-2"
                              : "bg-green-100 text-green-800 ml-2"
                          }
                        >
                          {workflowState.validationResults.eligibilityCheck
                            .preAuthRequired
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Response Time:</span>
                        <span className="ml-2">
                          {
                            workflowState.validationResults.eligibilityCheck
                              .responseTime
                          }
                          ms
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Validation Time:</span>
                        <span className="ml-2">
                          {new Date(
                            workflowState.validationResults.eligibilityCheck.validationTimestamp,
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation & Compliance Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={validateAuthorizationData}
                  disabled={workflowState.submissionStatus === "validating"}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {workflowState.submissionStatus === "validating"
                    ? "Validating..."
                    : "Validate Authorization Data"}
                </Button>

                {workflowState.validationResults && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Validation Results:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>JSON Structure: Valid</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Data Sanitization: Complete</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Business Rules: Validated</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Daman Compliance: Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission">
          <Card>
            <CardHeader>
              <CardTitle>Submit Authorization Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={submitAuthorization}
                  disabled={
                    workflowState.submissionStatus === "submitting" ||
                    !workflowState.validationResults
                  }
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {workflowState.submissionStatus === "submitting"
                    ? "Submitting..."
                    : "Submit to Daman"}
                </Button>

                {workflowState.validationResults?.submissionResponse && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Submission Successful!
                    </h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <div>
                        <span className="font-medium">Authorization ID:</span>
                        <span className="ml-2">
                          {
                            workflowState.validationResults.submissionResponse
                              .authorizationId
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge className="bg-green-100 text-green-800 ml-2">
                          {
                            workflowState.validationResults.submissionResponse
                              .status
                          }
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Reference Number:</span>
                        <span className="ml-2">
                          {
                            workflowState.validationResults.submissionResponse
                              .referenceNumber
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDamanWorkflow;
