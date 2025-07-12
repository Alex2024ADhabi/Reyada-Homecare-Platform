import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ElectronicSignature } from "@/components/ui/electronic-signature";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Gauge,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  FileCheck,
  History,
  BarChart3,
  Target,
} from "lucide-react";
import { VitalSignsAPI } from "@/api/clinical.api";
import DOHComplianceValidator from "@/components/validation/DOHComplianceValidator";

interface VitalSigns {
  patientId: string;
  episodeId: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: {
    value: number;
    unit: string;
  };
  temperature: {
    value: number;
    unit: "F" | "C";
  };
  respiratoryRate: {
    value: number;
    unit: string;
  };
  oxygenSaturation: {
    value: number;
    unit: string;
  };
  painLevel: {
    value: number;
    scale: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  height?: {
    value: number;
    unit: string;
  };
  notes?: string;
  alertFlags?: string[];
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

interface VitalSignsValidation {
  systolic: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  diastolic: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  heartRate: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  temperature: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  respiratoryRate: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  oxygenSaturation: {
    min: number;
    max: number;
    critical: { low: number; high: number };
  };
  painLevel: { min: number; max: number };
}

interface VitalSignsFormProps {
  patientId: string;
  episodeId: string;
  previousVitals?: VitalSigns;
  onSubmit?: (vitals: VitalSigns) => Promise<void>;
  validationRules?: VitalSignsValidation;
  className?: string;
  loading?: boolean;
  error?: string | null;
  recordedBy?: string;
  realTimeValidation?: boolean;
  showComplianceDashboard?: boolean;
}

export const VitalSignsForm: React.FC<VitalSignsFormProps> = ({
  patientId,
  episodeId,
  previousVitals,
  onSubmit,
  validationRules = {
    systolic: { min: 70, max: 250, critical: { low: 90, high: 180 } },
    diastolic: { min: 40, max: 150, critical: { low: 60, high: 110 } },
    heartRate: { min: 30, max: 200, critical: { low: 60, high: 100 } },
    temperature: { min: 95, max: 110, critical: { low: 96, high: 100.4 } },
    respiratoryRate: { min: 8, max: 40, critical: { low: 12, high: 20 } },
    oxygenSaturation: { min: 70, max: 100, critical: { low: 90, high: 100 } },
    painLevel: { min: 0, max: 10 },
  },
  className = "",
  loading = false,
  error = null,
  recordedBy = "current_user",
  realTimeValidation = true,
  showComplianceDashboard = true,
}) => {
  // Enhanced state management for comprehensive validation
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    complianceScore: 0,
    lastValidated: null as string | null,
  });
  const [formState, setFormState] = useState({
    completeness: 0,
    isSubmitting: false,
    hasChanges: false,
    lastSaved: null as string | null,
  });
  const [validationHistory, setValidationHistory] = useState<any[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<
    Array<{
      type: string;
      message: string;
      severity: "info" | "warning" | "critical";
    }>
  >([]);
  const [activeTab, setActiveTab] = useState("vitals");
  const [showDOHValidation, setShowDOHValidation] =
    useState(realTimeValidation);
  const [validationMode, setValidationMode] = useState<
    "basic" | "comprehensive"
  >("comprehensive");
  const [trends, setTrends] = useState<{
    [key: string]: "up" | "down" | "stable";
  }>({});
  const [vitalSignsData, setVitalSignsData] = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<any>({
    defaultValues: {
      systolic: previousVitals?.bloodPressure?.systolic || "",
      diastolic: previousVitals?.bloodPressure?.diastolic || "",
      heartRate: previousVitals?.heartRate?.value || "",
      temperature: previousVitals?.temperature?.value || "",
      respiratoryRate: previousVitals?.respiratoryRate?.value || "",
      oxygenSaturation: previousVitals?.oxygenSaturation?.value || "",
      weight: previousVitals?.weight?.value || "",
      height: previousVitals?.height?.value || "",
      painLevel: previousVitals?.painLevel?.value || "",
      notes: previousVitals?.notes || "",
    },
  });

  const watchedValues = watch();

  // Enhanced form completeness calculation with validation
  const calculateFormCompleteness = useCallback(() => {
    const requiredFields = [
      "systolic",
      "diastolic",
      "heartRate",
      "temperature",
      "respiratoryRate",
      "oxygenSaturation",
    ];
    const completedFields = requiredFields.filter(
      (field) => watchedValues[field] && watchedValues[field] !== "",
    );
    const completeness = (completedFields.length / requiredFields.length) * 100;

    setFormState((prev) => ({ ...prev, completeness, hasChanges: true }));

    // Generate clinical alerts based on values
    const alerts = generateClinicalAlerts(watchedValues);
    setClinicalAlerts(alerts);

    return completeness;
  }, [watchedValues]);

  useEffect(() => {
    calculateFormCompleteness();
  }, [calculateFormCompleteness]);

  // Enhanced DOH validation change handler
  const handleDOHValidationChange = useCallback(
    (isValid: boolean, errors: string[], warnings: string[]) => {
      setValidationState({
        isValid,
        errors,
        warnings,
        complianceScore: isValid
          ? 100
          : Math.max(0, 100 - errors.length * 20 - warnings.length * 5),
        lastValidated: new Date().toISOString(),
      });

      // Add to validation history
      setValidationHistory((prev) => [
        {
          timestamp: new Date().toISOString(),
          isValid,
          errors: errors.length,
          warnings: warnings.length,
          complianceScore: isValid
            ? 100
            : Math.max(0, 100 - errors.length * 20 - warnings.length * 5),
        },
        ...prev.slice(0, 9), // Keep last 10 validations
      ]);
    },
    [],
  );

  // Generate clinical alerts based on vital signs values
  const generateClinicalAlerts = (values: any) => {
    const alerts: Array<{
      type: string;
      message: string;
      severity: "info" | "warning" | "critical";
    }> = [];

    // Blood pressure alerts
    if (values.systolic && values.diastolic) {
      const systolic = parseFloat(values.systolic);
      const diastolic = parseFloat(values.diastolic);

      if (systolic > 180 || diastolic > 110) {
        alerts.push({
          type: "HYPERTENSIVE_CRISIS",
          message:
            "Hypertensive crisis detected - immediate medical attention required",
          severity: "critical",
        });
      } else if (systolic < 90 || diastolic < 60) {
        alerts.push({
          type: "HYPOTENSION",
          message: "Hypotension detected - monitor patient closely",
          severity: "warning",
        });
      }
    }

    // Heart rate alerts
    if (values.heartRate) {
      const hr = parseFloat(values.heartRate);
      if (hr < 60) {
        alerts.push({
          type: "BRADYCARDIA",
          message: "Bradycardia detected - assess for symptoms",
          severity: "warning",
        });
      } else if (hr > 100) {
        alerts.push({
          type: "TACHYCARDIA",
          message: "Tachycardia detected - assess for underlying causes",
          severity: "warning",
        });
      }
    }

    // Temperature alerts
    if (values.temperature) {
      const temp = parseFloat(values.temperature);
      if (temp > 100.4) {
        alerts.push({
          type: "FEVER",
          message: "Fever detected - monitor for infection",
          severity: "warning",
        });
      } else if (temp < 96) {
        alerts.push({
          type: "HYPOTHERMIA",
          message: "Hypothermia detected - warming measures may be needed",
          severity: "warning",
        });
      }
    }

    // Oxygen saturation alerts
    if (values.oxygenSaturation) {
      const spo2 = parseFloat(values.oxygenSaturation);
      if (spo2 < 90) {
        alerts.push({
          type: "HYPOXEMIA",
          message: "Hypoxemia detected - oxygen therapy may be required",
          severity: "critical",
        });
      }
    }

    return alerts;
  };

  // Enhanced form submission with comprehensive validation and API integration
  const handleFormSubmit = async (data: any) => {
    if (!validationState.isValid && validationState.errors.length > 0) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Transform form data to API format
      const vitalSignsData: Omit<VitalSigns, "id" | "createdAt" | "updatedAt"> =
        {
          patientId,
          episodeId,
          recordedAt: new Date().toISOString(),
          recordedBy,
          bloodPressure: {
            systolic: parseFloat(data.systolic),
            diastolic: parseFloat(data.diastolic),
          },
          heartRate: {
            value: parseFloat(data.heartRate),
            unit: "bpm",
          },
          temperature: {
            value: parseFloat(data.temperature),
            unit: "F",
          },
          respiratoryRate: {
            value: parseFloat(data.respiratoryRate),
            unit: "breaths/min",
          },
          oxygenSaturation: {
            value: parseFloat(data.oxygenSaturation),
            unit: "%",
          },
          painLevel: {
            value: data.painLevel ? parseFloat(data.painLevel) : 0,
            scale: "0-10",
          },
          weight: data.weight
            ? {
                value: parseFloat(data.weight),
                unit: "kg",
              }
            : undefined,
          height: data.height
            ? {
                value: parseFloat(data.height),
                unit: "cm",
              }
            : undefined,
          notes: data.notes || undefined,
        };

      // Store the data temporarily and show signature dialog
      setVitalSignsData(vitalSignsData);
      setShowSignatureDialog(true);
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    } catch (error) {
      console.error("Form submission failed:", error);
      setClinicalAlerts((prev) => [
        ...prev,
        {
          type: "SUBMISSION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to save vital signs",
          severity: "critical",
        },
      ]);
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle signature completion
  const handleSignatureComplete = async (signatureData: any) => {
    try {
      setFormState((prev) => ({ ...prev, isSubmitting: true }));

      // In a real implementation, we would attach the signature to the vital signs data
      const vitalSignsWithSignature = {
        ...vitalSignsData,
        signature: {
          signatureId: signatureData.id,
          signatureImage: signatureData.signatureImage,
          signedBy: signatureData.userFullName,
          signedAt: signatureData.timestamp,
          signatureType: "clinician",
        },
        validated: true,
        validatedBy: signatureData.userFullName,
        validatedAt: signatureData.timestamp,
      };

      // Submit via API
      const response = await VitalSignsAPI.recordVitalSigns(
        vitalSignsWithSignature,
      );

      if (response.success) {
        setVitalSignsData(response.data);
        setFormState((prev) => ({
          ...prev,
          lastSaved: new Date().toISOString(),
          hasChanges: false,
        }));
        setShowSignatureDialog(false);

        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit(response.data);
        }
      } else {
        throw new Error(
          response.error?.message || "Failed to save vital signs",
        );
      }
    } catch (error) {
      console.error("Signature submission failed:", error);
      setClinicalAlerts((prev) => [
        ...prev,
        {
          type: "SIGNATURE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process electronic signature",
          severity: "critical",
        },
      ]);
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-600" />
                Vital Signs Assessment
              </h2>
              <p className="text-gray-600 mt-1">
                Record and monitor patient vital signs with real-time DOH
                compliance validation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={validationState.isValid ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {validationState.isValid ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {validationState.complianceScore}% Compliant
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round(formState.completeness)}% Complete
              </Badge>
              {formState.hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4 mt-4">
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Vital Signs
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              DOH Validation
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="vitals" className="mt-0">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Form Progress and Clinical Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Form Completeness
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(formState.completeness)}%
                    </span>
                  </div>
                  <Progress value={formState.completeness} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Compliance Score
                    </span>
                    <span className="text-sm text-gray-500">
                      {validationState.complianceScore}%
                    </span>
                  </div>
                  <Progress
                    value={validationState.complianceScore}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Clinical Alerts */}
              {clinicalAlerts.length > 0 && (
                <div className="space-y-2">
                  {clinicalAlerts.map((alert, index) => (
                    <Alert
                      key={index}
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "default"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{alert.type}:</strong> {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Real-time DOH Validation */}
              {realTimeValidation && (
                <DOHComplianceValidator
                  formType="vital_signs"
                  formData={{
                    ...watchedValues,
                    patientId,
                    episodeId,
                    recordedBy,
                    recordedAt: new Date().toISOString(),
                  }}
                  patientId={patientId}
                  episodeId={episodeId}
                  onValidationChange={handleDOHValidationChange}
                  realTimeValidation={true}
                  embedded={true}
                  validationType="clinical_form"
                  validationScope={
                    validationMode === "comprehensive"
                      ? "episode_complete"
                      : "single_form"
                  }
                  className="mb-6"
                />
              )}

              {/* Validation Status Summary */}
              {(validationState.errors.length > 0 ||
                validationState.warnings.length > 0) && (
                <div className="space-y-2">
                  {validationState.errors.map((error, index) => (
                    <Alert key={`error-${index}`} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                  {validationState.warnings.map((warning, index) => (
                    <Alert key={`warning-${index}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                {/* Blood Pressure Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Blood Pressure</h3>
                    <Badge variant="outline" className="text-xs">
                      Critical Range: 90-180 / 60-110 mmHg
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label
                        htmlFor="systolic"
                        className="flex items-center gap-2"
                      >
                        Systolic BP (mmHg)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        {...register("systolic", {
                          required: "Systolic blood pressure is required",
                          min: {
                            value: validationRules.systolic.min,
                            message: `Minimum value is ${validationRules.systolic.min}`,
                          },
                          max: {
                            value: validationRules.systolic.max,
                            message: `Maximum value is ${validationRules.systolic.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.systolic ? "border-red-500" : ""} ${watchedValues.systolic && !errors.systolic ? "border-green-500" : ""}`}
                      />
                      {watchedValues.systolic && !errors.systolic && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                      {errors.systolic && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.systolic.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label
                        htmlFor="diastolic"
                        className="flex items-center gap-2"
                      >
                        Diastolic BP (mmHg)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        {...register("diastolic", {
                          required: "Diastolic blood pressure is required",
                          min: {
                            value: validationRules.diastolic.min,
                            message: `Minimum value is ${validationRules.diastolic.min}`,
                          },
                          max: {
                            value: validationRules.diastolic.max,
                            message: `Maximum value is ${validationRules.diastolic.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.diastolic ? "border-red-500" : ""} ${watchedValues.diastolic && !errors.diastolic ? "border-green-500" : ""}`}
                      />
                      {watchedValues.diastolic && !errors.diastolic && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                      {errors.diastolic && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.diastolic.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Heart Rate and Temperature Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold">Heart Rate</h3>
                      <Badge variant="outline" className="text-xs">
                        Normal: 60-100 bpm
                      </Badge>
                    </div>

                    <div className="relative">
                      <Label
                        htmlFor="heartRate"
                        className="flex items-center gap-2"
                      >
                        Heart Rate (bpm)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="heartRate"
                        type="number"
                        placeholder="72"
                        {...register("heartRate", {
                          required: "Heart rate is required",
                          min: {
                            value: validationRules.heartRate.min,
                            message: `Minimum value is ${validationRules.heartRate.min}`,
                          },
                          max: {
                            value: validationRules.heartRate.max,
                            message: `Maximum value is ${validationRules.heartRate.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.heartRate ? "border-red-500" : ""} ${watchedValues.heartRate && !errors.heartRate ? "border-green-500" : ""}`}
                      />
                      {watchedValues.heartRate && !errors.heartRate && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                      {errors.heartRate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.heartRate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-semibold">Temperature</h3>
                      <Badge variant="outline" className="text-xs">
                        Normal: 96-100.4°F
                      </Badge>
                    </div>

                    <div className="relative">
                      <Label
                        htmlFor="temperature"
                        className="flex items-center gap-2"
                      >
                        Temperature (°F)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        placeholder="98.6"
                        {...register("temperature", {
                          required: "Temperature is required",
                          min: {
                            value: validationRules.temperature.min,
                            message: `Minimum value is ${validationRules.temperature.min}`,
                          },
                          max: {
                            value: validationRules.temperature.max,
                            message: `Maximum value is ${validationRules.temperature.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.temperature ? "border-red-500" : ""} ${watchedValues.temperature && !errors.temperature ? "border-green-500" : ""}`}
                      />
                      {watchedValues.temperature && !errors.temperature && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                      {errors.temperature && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.temperature.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Respiratory Rate and Oxygen Saturation Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gauge className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">
                        Respiratory Rate
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Normal: 12-20/min
                      </Badge>
                    </div>

                    <div className="relative">
                      <Label
                        htmlFor="respiratoryRate"
                        className="flex items-center gap-2"
                      >
                        Respiratory Rate (breaths/min)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        placeholder="16"
                        {...register("respiratoryRate", {
                          required: "Respiratory rate is required",
                          min: {
                            value: validationRules.respiratoryRate.min,
                            message: `Minimum value is ${validationRules.respiratoryRate.min}`,
                          },
                          max: {
                            value: validationRules.respiratoryRate.max,
                            message: `Maximum value is ${validationRules.respiratoryRate.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.respiratoryRate ? "border-red-500" : ""} ${watchedValues.respiratoryRate && !errors.respiratoryRate ? "border-green-500" : ""}`}
                      />
                      {watchedValues.respiratoryRate &&
                        !errors.respiratoryRate && (
                          <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                        )}
                      {errors.respiratoryRate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.respiratoryRate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold">
                        Oxygen Saturation
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Normal: ≥95%
                      </Badge>
                    </div>

                    <div className="relative">
                      <Label
                        htmlFor="oxygenSaturation"
                        className="flex items-center gap-2"
                      >
                        Oxygen Saturation (%)
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        placeholder="98"
                        {...register("oxygenSaturation", {
                          required: "Oxygen saturation is required",
                          min: {
                            value: validationRules.oxygenSaturation.min,
                            message: `Minimum value is ${validationRules.oxygenSaturation.min}`,
                          },
                          max: {
                            value: validationRules.oxygenSaturation.max,
                            message: `Maximum value is ${validationRules.oxygenSaturation.max}`,
                          },
                          onChange: () => trigger(),
                        })}
                        className={`${errors.oxygenSaturation ? "border-red-500" : ""} ${watchedValues.oxygenSaturation && !errors.oxygenSaturation ? "border-green-500" : ""}`}
                      />
                      {watchedValues.oxygenSaturation &&
                        !errors.oxygenSaturation && (
                          <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                        )}
                      {errors.oxygenSaturation && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.oxygenSaturation.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Measurements Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold">
                      Additional Measurements
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="70.0"
                        {...register("weight")}
                        className={
                          watchedValues.weight ? "border-green-500" : ""
                        }
                      />
                      {watchedValues.weight && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        {...register("height")}
                        className={
                          watchedValues.height ? "border-green-500" : ""
                        }
                      />
                      {watchedValues.height && (
                        <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                      <Input
                        id="painLevel"
                        type="number"
                        min="0"
                        max="10"
                        placeholder="0"
                        {...register("painLevel", {
                          min: { value: 0, message: "Minimum value is 0" },
                          max: { value: 10, message: "Maximum value is 10" },
                        })}
                        className={`${errors.painLevel ? "border-red-500" : ""} ${watchedValues.painLevel !== undefined && watchedValues.painLevel !== "" ? "border-green-500" : ""}`}
                      />
                      {watchedValues.painLevel !== undefined &&
                        watchedValues.painLevel !== "" &&
                        !errors.painLevel && (
                          <CheckCircle className="absolute right-3 top-8 w-4 h-4 text-green-500" />
                        )}
                      {errors.painLevel && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.painLevel.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinical Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Clinical Notes</h3>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Observations</Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Enter any additional clinical observations, patient responses, or relevant notes..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-3">
                    {validationState.isValid ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        DOH Compliant ({validationState.complianceScore}%)
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Validation Issues ({validationState.errors.length}{" "}
                        errors)
                      </Badge>
                    )}

                    {formState.lastSaved && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Saved{" "}
                        {new Date(formState.lastSaved).toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setFormState((prev) => ({
                          ...prev,
                          hasChanges: false,
                        }));
                      }}
                      disabled={formState.isSubmitting}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        formState.isSubmitting ||
                        (!validationState.isValid &&
                          validationState.errors.length > 0) ||
                        formState.completeness < 85
                      }
                      className="min-w-[140px]"
                    >
                      {formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Vital Signs
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOH Validation Tab */}
        <TabsContent value="validation" className="mt-0">
          <DOHComplianceValidator
            formType="vital_signs"
            formData={{
              ...watchedValues,
              patientId,
              episodeId,
              recordedBy,
              recordedAt: new Date().toISOString(),
            }}
            patientId={patientId}
            episodeId={episodeId}
            onValidationChange={handleDOHValidationChange}
            realTimeValidation={false}
            embedded={false}
            validationType="clinical_form"
            validationScope={
              validationMode === "comprehensive"
                ? "episode_complete"
                : "single_form"
            }
            showComplianceOverview={true}
          />
        </TabsContent>

        {/* Validation History Tab */}
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Validation History
              </CardTitle>
              <CardDescription>
                Track validation performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationHistory.length > 0 ? (
                <div className="space-y-4">
                  {validationHistory.map((validation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {validation.isValid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {validation.isValid
                              ? "Validation Passed"
                              : "Validation Failed"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(validation.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {validation.complianceScore}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {validation.errors} errors, {validation.warnings}{" "}
                          warnings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No validation history available</p>
                  <p className="text-sm">
                    Complete the form to see validation results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Clinical Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends from vital signs data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Form Completeness</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(formState.completeness)}%
                  </div>
                  <Progress value={formState.completeness} className="mt-2" />
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Compliance Score</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {validationState.complianceScore}%
                  </div>
                  <Progress
                    value={validationState.complianceScore}
                    className="mt-2"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Clinical Alerts</h3>
                  <div className="text-2xl font-bold text-orange-600">
                    {clinicalAlerts.length}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Active alerts requiring attention
                  </p>
                </div>
              </div>

              {clinicalAlerts.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Active Clinical Alerts</h3>
                  <div className="space-y-2">
                    {clinicalAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            alert.severity === "critical"
                              ? "text-red-500"
                              : alert.severity === "warning"
                                ? "text-yellow-500"
                                : "text-blue-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{alert.type}</p>
                          <p className="text-sm text-gray-600">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Electronic Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Electronic Signature Required</DialogTitle>
          </DialogHeader>
          <ElectronicSignature
            documentId={`vital-signs-${patientId}-${new Date().getTime()}`}
            documentType="vital_signs"
            onSignatureComplete={handleSignatureComplete}
            onCancel={() => setShowSignatureDialog(false)}
            biometricEnabled={false}
            workflowEnabled={true}
            captureRequirements={{
              minStrokes: 10,
              minDuration: 1000,
              minComplexity: 20,
              touchRequired: false,
            }}
            formData={{
              patientId,
              episodeId,
              formType: "vital_signs",
              ...watchedValues,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { VitalSignsForm };
