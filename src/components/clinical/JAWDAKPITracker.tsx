import React, { useState, useEffect, useCallback } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Award,
  FileText,
  Download,
  Upload,
  Calendar,
  Clock,
  Shield,
  Database,
  Activity,
  Users,
  Settings,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  getJAWDAKPIRecords,
  createJAWDAKPIRecord,
  JAWDAKPITracking,
} from "@/api/quality-management.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface JAWDAKPITrackerProps {
  userId?: string;
  userRole?: string;
  showHeader?: boolean;
  facilityId?: string;
  reportingPeriod?: string;
}

interface KPIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  inclusionCriteriaMet: boolean;
  exclusionCriteriaViolated: boolean;
}

interface JAWDAComplianceReport {
  reportId: string;
  generatedAt: string;
  reportingPeriod: string;
  facilityInfo: {
    name: string;
    license: string;
    jawdaId: string;
  };
  kpiSummary: {
    totalKPIs: number;
    compliantKPIs: number;
    nonCompliantKPIs: number;
    overallComplianceRate: number;
  };
  detailedResults: any[];
  recommendations: string[];
  auditTrail: any[];
}

export default function JAWDAKPITracker({
  userId = "Dr. Sarah Ahmed",
  userRole = "quality_manager",
  showHeader = true,
  facilityId = "RH-001",
  reportingPeriod = "Q4-2024",
}: JAWDAKPITrackerProps) {
  const [kpiRecords, setKpiRecords] = useState<JAWDAKPITracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKPIDialog, setShowKPIDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [validationResults, setValidationResults] = useState<
    Record<string, KPIValidationResult>
  >({});
  const [complianceReport, setComplianceReport] =
    useState<JAWDAComplianceReport | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [dataQualityIssues, setDataQualityIssues] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newKPIRecord, setNewKPIRecord] = useState({
    kpi_name: "",
    kpi_category: "patient_safety" as const,
    kpi_description: "",
    measurement_period: new Date().toISOString().split("T")[0],
    target_value: 0,
    actual_value: 0,
    numerator: 0,
    denominator: 0,
    data_source: "",
    collection_method: "manual" as const,
    responsible_department: "",
    responsible_person: "",
    reporting_frequency: "quarterly" as const,
    jawda_kpi_id: "",
    case_mix_data: {
      simple_visit_nurse: 0,
      simple_visit_supportive: 0,
      specialized_visit: 0,
      routine_nursing_care: 0,
      advanced_nursing_care: 0,
      self_pay: 0,
    },
  });
  const { isOnline, saveFormData } = useOfflineSync();

  useEffect(() => {
    loadKPIData();
    initializeMandatoryKPIs();
  }, [selectedCategory]);

  useEffect(() => {
    if (kpiRecords.length > 0) {
      // Validate all KPI data
      const validationResults: Record<string, KPIValidationResult> = {};
      kpiRecords.forEach((kpi) => {
        const kpiDef = mandatoryKPIs.find((def) => def.id === kpi.jawda_kpi_id);
        if (kpiDef) {
          validationResults[kpi.kpi_id || kpi._id?.toString() || ""] =
            validateKPIData(kpi, kpiDef);
        }
      });
      setValidationResults(validationResults);

      // Perform data quality check
      performDataQualityCheck();

      // Log data load event
      logAuditEvent("KPI_DATA_LOADED", {
        recordCount: kpiRecords.length,
        category: selectedCategory,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    kpiRecords,
    validateKPIData,
    performDataQualityCheck,
    logAuditEvent,
    selectedCategory,
  ]);

  const initializeMandatoryKPIs = async () => {
    try {
      const existingRecords = await getJAWDAKPIRecords();
      const existingKPIIds = existingRecords.map(
        (record) => record.jawda_kpi_id,
      );

      // Create missing mandatory KPIs
      for (const mandatoryKPI of mandatoryKPIs) {
        if (!existingKPIIds.includes(mandatoryKPI.id)) {
          await createJAWDAKPIRecord({
            kpi_id: `KPI-${mandatoryKPI.id}-${Date.now()}`,
            jawda_kpi_id: mandatoryKPI.id,
            kpi_name: mandatoryKPI.name,
            kpi_category: mandatoryKPI.category as any,
            kpi_description: mandatoryKPI.description,
            measurement_period: new Date().toISOString().split("T")[0],
            target_value: mandatoryKPI.direction === "Lower is better" ? 5 : 85, // Default targets
            actual_value: 0,
            numerator: 0,
            denominator: 0,
            variance: 0,
            variance_percentage: 0,
            performance_status: "below" as const,
            data_source: "Electronic Medical Records",
            collection_method: "automated" as const,
            responsible_department: "Quality Management",
            responsible_person: "Quality Manager",
            reporting_frequency: "quarterly" as const,
            last_updated: new Date().toISOString(),
            next_update_due: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            trend_analysis: {
              previous_period_value: 0,
              trend_direction: "stable" as const,
              trend_percentage: 0,
            },
            action_required: true,
            improvement_actions: [],
            regulatory_requirement: {
              regulation: "JAWDA",
              requirement_code: mandatoryKPI.id,
              mandatory: true,
            },
            benchmarking: {},
            case_mix_data: {
              simple_visit_nurse: 0,
              simple_visit_supportive: 0,
              specialized_visit: 0,
              routine_nursing_care: 0,
              advanced_nursing_care: 0,
              self_pay: 0,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error initializing mandatory KPIs:", error);
    }
  };

  const loadKPIData = async () => {
    try {
      setLoading(true);
      const records = await getJAWDAKPIRecords();

      // Filter by category if selected
      const filteredRecords =
        selectedCategory === "all"
          ? records
          : records.filter(
              (record) => record.kpi_category === selectedCategory,
            );

      setKpiRecords(filteredRecords);
    } catch (error) {
      console.error("Error loading KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKPIRecord = async () => {
    try {
      setLoading(true);
      const kpiId = `KPI-${Date.now()}`;

      // Find KPI definition for validation
      const kpiDefinition = mandatoryKPIs.find(
        (def) => def.id === newKPIRecord.jawda_kpi_id,
      );
      if (!kpiDefinition) {
        throw new Error("Invalid JAWDA KPI ID selected");
      }

      // Validate KPI data before creation
      const validation = validateKPIData(newKPIRecord, kpiDefinition);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Calculate based on numerator/denominator for JAWDA compliance
      const calculatedValue =
        newKPIRecord.denominator !== 0
          ? (newKPIRecord.numerator / newKPIRecord.denominator) *
            (newKPIRecord.jawda_kpi_id?.includes("HC004") ||
            newKPIRecord.jawda_kpi_id?.includes("HC005")
              ? 1000
              : 100)
          : 0;

      const variance = calculatedValue - newKPIRecord.target_value;
      const variancePercentage =
        newKPIRecord.target_value !== 0
          ? (variance / newKPIRecord.target_value) * 100
          : 0;

      // Enhanced performance status calculation based on KPI direction
      let performanceStatus: "exceeds" | "meets" | "below" | "critical";
      const isLowerBetter = kpiDefinition.direction === "Lower is better";

      if (isLowerBetter) {
        if (calculatedValue <= newKPIRecord.target_value * 0.8)
          performanceStatus = "exceeds";
        else if (calculatedValue <= newKPIRecord.target_value)
          performanceStatus = "meets";
        else if (calculatedValue <= newKPIRecord.target_value * 1.2)
          performanceStatus = "below";
        else performanceStatus = "critical";
      } else {
        if (calculatedValue >= newKPIRecord.target_value * 1.1)
          performanceStatus = "exceeds";
        else if (calculatedValue >= newKPIRecord.target_value)
          performanceStatus = "meets";
        else if (calculatedValue >= newKPIRecord.target_value * 0.8)
          performanceStatus = "below";
        else performanceStatus = "critical";
      }

      const kpiRecord = {
        ...newKPIRecord,
        kpi_id: kpiId,
        actual_value: calculatedValue,
        variance,
        variance_percentage: variancePercentage,
        performance_status: performanceStatus,
        last_updated: new Date().toISOString(),
        next_update_due: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        trend_analysis: {
          previous_period_value: 0,
          trend_direction: "stable" as const,
          trend_percentage: 0,
        },
        action_required:
          performanceStatus === "below" || performanceStatus === "critical",
        improvement_actions: validation.warnings.map((warning) => ({
          action: `Address: ${warning}`,
          priority: "Medium",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          responsible: userId,
        })),
        regulatory_requirement: {
          regulation: "JAWDA",
          requirement_code: kpiDefinition.id,
          mandatory: true,
          version: "8.3",
        },
        benchmarking: {
          nationalBenchmark: kpiDefinition.targetBenchmark,
          facilityPerformance: calculatedValue,
          benchmarkComparison:
            calculatedValue <=
            parseFloat(
              kpiDefinition.targetBenchmark?.replace(/[^0-9.]/g, "") || "0",
            )
              ? "Above"
              : "Below",
        },
        validation_status: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          validatedBy: userId,
          validatedAt: new Date().toISOString(),
        },
        audit_info: {
          createdBy: userId,
          createdAt: new Date().toISOString(),
          facilityId,
          reportingPeriod,
        },
      };

      await createJAWDAKPIRecord(kpiRecord);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("jawda_kpi", {
          ...kpiRecord,
          timestamp: new Date().toISOString(),
        });
      }

      // Log audit event
      logAuditEvent("KPI_CREATED", {
        kpiId,
        jawdaKpiId: newKPIRecord.jawda_kpi_id,
        performanceStatus,
        validationStatus: validation.isValid ? "Valid" : "Invalid",
        calculatedValue,
      });

      setShowKPIDialog(false);
      resetKPIForm();
      await loadKPIData();
    } catch (error) {
      console.error("Error creating KPI record:", error);

      // Log error event
      logAuditEvent("KPI_CREATION_ERROR", {
        error: error instanceof Error ? error.message : "Unknown error",
        kpiData: newKPIRecord,
      });

      alert(
        error instanceof Error ? error.message : "Failed to create KPI record",
      );
    } finally {
      setLoading(false);
    }
  };

  // Export compliance report
  const handleExportReport = async () => {
    try {
      const report = await generateComplianceReport();
      setComplianceReport(report);

      // Create downloadable report
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JAWDA-Compliance-Report-${report.reportId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logAuditEvent("REPORT_EXPORTED", {
        reportId: report.reportId,
        reportType: "JAWDA_COMPLIANCE",
        recordCount: report.kpiSummary.totalKPIs,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate compliance report");
    }
  };

  // Validate all KPIs
  const handleValidateAllKPIs = async () => {
    try {
      setLoading(true);
      const results: Record<string, KPIValidationResult> = {};

      for (const kpi of kpiRecords) {
        const kpiDef = mandatoryKPIs.find((def) => def.id === kpi.jawda_kpi_id);
        if (kpiDef) {
          results[kpi.kpi_id || kpi._id?.toString() || ""] = validateKPIData(
            kpi,
            kpiDef,
          );
        }
      }

      setValidationResults(results);
      setShowValidationDialog(true);

      logAuditEvent("BULK_VALIDATION", {
        totalKPIs: kpiRecords.length,
        validKPIs: Object.values(results).filter((r) => r.isValid).length,
        invalidKPIs: Object.values(results).filter((r) => !r.isValid).length,
      });
    } catch (error) {
      console.error("Error validating KPIs:", error);
      alert("Failed to validate KPIs");
    } finally {
      setLoading(false);
    }
  };

  const resetKPIForm = () => {
    setNewKPIRecord({
      kpi_name: "",
      kpi_category: "patient_safety",
      kpi_description: "",
      measurement_period: new Date().toISOString().split("T")[0],
      target_value: 0,
      actual_value: 0,
      numerator: 0,
      denominator: 0,
      data_source: "",
      collection_method: "manual",
      responsible_department: "",
      responsible_person: "",
      reporting_frequency: "quarterly",
      jawda_kpi_id: "",
      case_mix_data: {
        simple_visit_nurse: 0,
        simple_visit_supportive: 0,
        specialized_visit: 0,
        routine_nursing_care: 0,
        advanced_nursing_care: 0,
        self_pay: 0,
      },
    });
  };

  const getPerformanceBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      exceeds: "default",
      meets: "secondary",
      below: "destructive",
      critical: "destructive",
    };
    const icons = {
      exceeds: <TrendingUp className="w-3 h-3" />,
      meets: <Target className="w-3 h-3" />,
      below: <TrendingDown className="w-3 h-3" />,
      critical: <AlertTriangle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTrendBadge = (direction: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      improving: "default",
      stable: "secondary",
      declining: "destructive",
    };
    const icons = {
      improving: <TrendingUp className="w-3 h-3" />,
      stable: <Target className="w-3 h-3" />,
      declining: <TrendingDown className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[direction] || "secondary"}
        className="flex items-center gap-1"
      >
        {icons[direction as keyof typeof icons]}
        {direction.toUpperCase()}
      </Badge>
    );
  };

  const categories = [
    "all",
    "patient_safety",
    "clinical_effectiveness",
    "patient_experience",
    "operational_efficiency",
    "staff_satisfaction",
  ];

  // Enhanced KPI Validation with Inclusion/Exclusion Criteria
  const validateKPIData = useCallback(
    (kpi: any, kpiDefinition: any): KPIValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];
      let inclusionCriteriaMet = true;
      let exclusionCriteriaViolated = false;

      // Basic data validation
      if (!kpi.numerator && kpi.numerator !== 0)
        errors.push("Numerator is required");
      if (!kpi.denominator && kpi.denominator !== 0)
        errors.push("Denominator is required");
      if (kpi.denominator === 0) errors.push("Denominator cannot be zero");
      if (kpi.numerator < 0) errors.push("Numerator cannot be negative");
      if (kpi.denominator < 0) errors.push("Denominator cannot be negative");

      // KPI-specific validation based on JAWDA definitions
      switch (kpiDefinition.id) {
        case "HC001": // ED visits without hospitalization
          // Inclusion: All homecare patients with ED/urgent care visits
          // Exclusion: Visits that resulted in hospitalization
          if (kpi.numerator > kpi.denominator) {
            errors.push("ED visits cannot exceed total patient days");
          }
          if (kpi.denominator < 30) {
            warnings.push(
              "Low denominator may affect statistical significance",
            );
          }
          break;

        case "HC002": // Unplanned hospitalizations
          // Inclusion: All unplanned acute care admissions
          // Exclusion: Planned admissions, transfers for higher level of care
          if (kpi.numerator > kpi.denominator) {
            errors.push("Hospitalizations cannot exceed total patient days");
          }
          break;

        case "HC003": // Ambulation improvement
          // Inclusion: Patients who received physiotherapy
          // Exclusion: Patients without physiotherapy, those with contraindications
          if (!kpi.case_mix_data?.specialized_visit) {
            warnings.push(
              "Specialized visit data missing for physiotherapy validation",
            );
          }
          break;

        case "HC004": // Pressure injuries
          // Inclusion: Stage 2+ pressure injuries that developed or worsened
          // Exclusion: Stage 1 injuries, pre-existing stable injuries
          const pressureInjuryRate = (kpi.numerator / kpi.denominator) * 1000;
          if (pressureInjuryRate > 10) {
            warnings.push("High pressure injury rate requires investigation");
          }
          break;

        case "HC005": // Patient falls with injury
          // Inclusion: All falls resulting in any level of injury
          // Exclusion: Falls without injury, near-miss events
          const fallRate = (kpi.numerator / kpi.denominator) * 1000;
          if (fallRate > 15) {
            warnings.push("High fall rate requires immediate intervention");
          }
          break;

        case "HC006": // Discharge to community
          // Inclusion: All discharges to community settings
          // Exclusion: Deaths, transfers to higher level of care
          if (kpi.numerator > kpi.denominator) {
            errors.push("Community discharges cannot exceed total discharges");
          }
          break;
      }

      // Data quality checks
      const calculatedValue =
        kpi.denominator > 0
          ? (kpi.numerator / kpi.denominator) *
            (kpiDefinition.id.includes("HC004") ||
            kpiDefinition.id.includes("HC005")
              ? 1000
              : 100)
          : 0;

      if (Math.abs(calculatedValue - (kpi.actual_value || 0)) > 0.01) {
        warnings.push("Calculated value differs from recorded actual value");
      }

      // Temporal validation
      const lastUpdate = new Date(kpi.last_updated);
      const daysSinceUpdate =
        (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 30) {
        warnings.push("Data is more than 30 days old");
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        inclusionCriteriaMet,
        exclusionCriteriaViolated,
      };
    },
    [],
  );

  // Generate comprehensive compliance report
  const generateComplianceReport =
    useCallback(async (): Promise<JAWDAComplianceReport> => {
      const reportId = `JAWDA-RPT-${Date.now()}`;
      const generatedAt = new Date().toISOString();

      const detailedResults = kpiRecords.map((kpi) => {
        const kpiDef = mandatoryKPIs.find((def) => def.id === kpi.jawda_kpi_id);
        const validation = kpiDef ? validateKPIData(kpi, kpiDef) : null;

        return {
          kpiId: kpi.jawda_kpi_id,
          kpiName: kpi.kpi_name,
          category: kpi.kpi_category,
          numerator: kpi.numerator,
          denominator: kpi.denominator,
          calculatedValue:
            kpi.denominator > 0
              ? (kpi.numerator / kpi.denominator) *
                (kpi.jawda_kpi_id?.includes("HC004") ||
                kpi.jawda_kpi_id?.includes("HC005")
                  ? 1000
                  : 100)
              : 0,
          targetValue: kpi.target_value,
          performanceStatus: kpi.performance_status,
          isCompliant: validation?.isValid || false,
          validationErrors: validation?.errors || [],
          validationWarnings: validation?.warnings || [],
          lastUpdated: kpi.last_updated,
          dataQuality: validation?.warnings.length === 0 ? "High" : "Medium",
        };
      });

      const compliantKPIs = detailedResults.filter((r) => r.isCompliant).length;
      const overallComplianceRate =
        kpiRecords.length > 0
          ? Math.round((compliantKPIs / kpiRecords.length) * 100)
          : 0;

      const recommendations = [];
      if (overallComplianceRate < 90) {
        recommendations.push("Implement data quality improvement measures");
      }
      if (detailedResults.some((r) => r.validationErrors.length > 0)) {
        recommendations.push("Address critical data validation errors");
      }
      if (detailedResults.some((r) => r.dataQuality === "Medium")) {
        recommendations.push(
          "Review data collection processes for consistency",
        );
      }

      return {
        reportId,
        generatedAt,
        reportingPeriod,
        facilityInfo: {
          name: "Reyada Homecare Services",
          license: facilityId,
          jawdaId: "JWD-" + facilityId,
        },
        kpiSummary: {
          totalKPIs: kpiRecords.length,
          compliantKPIs,
          nonCompliantKPIs: kpiRecords.length - compliantKPIs,
          overallComplianceRate,
        },
        detailedResults,
        recommendations,
        auditTrail: auditTrail.slice(-50), // Last 50 audit entries
      };
    }, [kpiRecords, validateKPIData, reportingPeriod, facilityId, auditTrail]);

  // Audit trail logging
  const logAuditEvent = useCallback(
    (action: string, details: any) => {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId,
        userRole,
        action,
        details,
        sessionId: `session-${Date.now()}`,
      };
      setAuditTrail((prev) => [...prev, auditEntry].slice(-100)); // Keep last 100 entries
    },
    [userId, userRole],
  );

  // Data quality monitoring
  const performDataQualityCheck = useCallback(() => {
    const issues: any[] = [];

    kpiRecords.forEach((kpi) => {
      const kpiDef = mandatoryKPIs.find((def) => def.id === kpi.jawda_kpi_id);
      if (kpiDef) {
        const validation = validateKPIData(kpi, kpiDef);
        if (!validation.isValid || validation.warnings.length > 0) {
          issues.push({
            kpiId: kpi.jawda_kpi_id,
            kpiName: kpi.kpi_name,
            severity: validation.errors.length > 0 ? "Critical" : "Warning",
            issues: [...validation.errors, ...validation.warnings],
            lastUpdated: kpi.last_updated,
          });
        }
      }
    });

    setDataQualityIssues(issues);
    return issues;
  }, [kpiRecords, validateKPIData]);

  // Mandatory JAWDA KPIs as per Version 8.3 Guidelines with Enhanced Definitions
  const mandatoryKPIs = [
    {
      id: "HC001",
      name: "All-cause Emergency Department / Urgent Care Visit without Hospitalization",
      category: "clinical_effectiveness",
      description:
        "Percentage of homecare patient days in which patients used the emergency department or urgent care but were not admitted to the hospital during the measurement Quarter.",
      calculation: "[numerator / denominator] x 100",
      unit: "Percentage (per 100 homecare patient days)",
      frequency: "Quarterly",
      direction: "Lower is better",
      inclusionCriteria: [
        "All homecare patients during the measurement period",
        "Emergency department visits during homecare episode",
        "Urgent care visits during homecare episode",
        "Visits that did not result in hospital admission",
      ],
      exclusionCriteria: [
        "Visits that resulted in hospital admission",
        "Planned emergency department visits",
        "Visits for routine procedures or tests",
        "Patients not under active homecare during visit",
      ],
      dataValidationRules: [
        "Numerator must be ≤ denominator",
        "Denominator must include all homecare patient days",
        "Cross-reference with hospital admission records",
      ],
      targetBenchmark: "≤ 5% (National benchmark)",
      reportingRequirements: "Quarterly submission to JAWDA portal",
    },
    {
      id: "HC002",
      name: "All-cause Unplanned Acute Care Hospitalization",
      category: "clinical_effectiveness",
      description:
        "Percentage of days in which homecare patients were admitted to an acute care hospital",
      calculation: "[numerator / denominator] x 100",
      unit: "Percentage per home health day",
      frequency: "Quarterly",
      direction: "Lower is better",
      inclusionCriteria: [
        "All unplanned acute care hospital admissions",
        "Admissions during active homecare episode",
        "Emergency admissions through ED",
        "Direct admissions from homecare",
      ],
      exclusionCriteria: [
        "Planned admissions for elective procedures",
        "Admissions for routine diagnostic procedures",
        "Transfers for higher level of care (planned)",
        "Admissions after homecare discharge",
      ],
      dataValidationRules: [
        "Verify admission was unplanned",
        "Confirm patient was under active homecare",
        "Cross-reference with hospital records",
      ],
      targetBenchmark: "≤ 3% (National benchmark)",
      reportingRequirements: "Quarterly submission with root cause analysis",
    },
    {
      id: "HC003",
      name: "Managing daily activities – Improvement in Ambulation for patients who received physiotherapy",
      category: "clinical_effectiveness",
      description:
        "Percentage of home health care patients during which the patient improved in ability to ambulate.",
      calculation: "Numerator/Denominator * 100",
      unit: "Percentage per home care patients",
      frequency: "Quarterly",
      direction: "Higher is better",
      inclusionCriteria: [
        "Patients who received physiotherapy services",
        "Patients with documented ambulation goals",
        "Patients with baseline ambulation assessment",
        "Patients with follow-up ambulation assessment",
      ],
      exclusionCriteria: [
        "Patients without physiotherapy services",
        "Patients with contraindications to ambulation",
        "Patients who died during episode",
        "Patients with incomplete assessments",
      ],
      dataValidationRules: [
        "Baseline and follow-up assessments required",
        "Physiotherapy service documentation required",
        "Standardized ambulation measurement tools",
      ],
      targetBenchmark: "≥ 75% (National benchmark)",
      reportingRequirements: "Quarterly with assessment documentation",
    },
    {
      id: "HC004",
      name: "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
      category: "patient_safety",
      description:
        "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
      calculation: "[numerator / denominator] x 1000",
      unit: "Rate per 1000 home health days",
      frequency: "Quarterly",
      direction: "Lower is better",
      inclusionCriteria: [
        "Stage 2, 3, 4, or unstageable pressure injuries",
        "New pressure injuries developed during homecare",
        "Existing pressure injuries that worsened",
        "Injuries documented by qualified clinician",
      ],
      exclusionCriteria: [
        "Stage 1 pressure injuries",
        "Pre-existing stable pressure injuries",
        "Injuries present before homecare admission",
        "Injuries not related to pressure",
      ],
      dataValidationRules: [
        "Staging must follow NPUAP guidelines",
        "Documentation by wound care specialist",
        "Photo documentation when possible",
      ],
      targetBenchmark: "≤ 2.5 per 1000 patient days",
      reportingRequirements: "Quarterly with incident reports",
    },
    {
      id: "HC005",
      name: "Rate of homecare patient falls resulting in any injury per 1000 homecare patient days",
      category: "patient_safety",
      description:
        "Homecare patients falls resulting in any injury per 1000 home care patient days.",
      calculation: "[numerator / denominator] x 1000",
      unit: "Rate per 1000 home care patient days",
      frequency: "Quarterly",
      direction: "Lower is better",
      inclusionCriteria: [
        "All patient falls during homecare episode",
        "Falls resulting in any level of injury",
        "Falls witnessed or reported by patient/family",
        "Falls documented within 24 hours",
      ],
      exclusionCriteria: [
        "Falls without any injury",
        "Near-miss events (no actual fall)",
        "Falls occurring outside homecare setting",
        "Falls before homecare admission",
      ],
      dataValidationRules: [
        "Injury assessment by qualified clinician",
        "Fall circumstances documentation",
        "Risk factor assessment completed",
      ],
      targetBenchmark: "≤ 5.0 per 1000 patient days",
      reportingRequirements: "Quarterly with fall prevention measures",
    },
    {
      id: "HC006",
      name: "Discharge to Community",
      category: "patient_experience",
      description:
        "Percentage of days in which homecare patients were discharged to the community.",
      calculation: "Numerator/Denominator * 100",
      unit: "Percentage per home care patient days",
      frequency: "Quarterly",
      direction: "Higher is better",
      inclusionCriteria: [
        "All patients discharged from homecare",
        "Discharges to home/community settings",
        "Successful goal achievement discharges",
        "Patient/family choice discharges to community",
      ],
      exclusionCriteria: [
        "Patient deaths during episode",
        "Transfers to higher level of care",
        "Discharges to institutional care",
        "Involuntary discharges",
      ],
      dataValidationRules: [
        "Discharge destination verification",
        "Goal achievement documentation",
        "Patient satisfaction assessment",
      ],
      targetBenchmark: "≥ 85% (National benchmark)",
      reportingRequirements: "Quarterly with discharge planning documentation",
    },
  ];

  // Calculate summary statistics
  const totalKPIs = kpiRecords.length;
  const meetingTargets = kpiRecords.filter(
    (kpi) =>
      kpi.performance_status === "meets" ||
      kpi.performance_status === "exceeds",
  ).length;
  const belowTargets = kpiRecords.filter(
    (kpi) =>
      kpi.performance_status === "below" ||
      kpi.performance_status === "critical",
  ).length;
  const averagePerformance =
    totalKPIs > 0 ? Math.round((meetingTargets / totalKPIs) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                JAWDA KPI Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                UAE Quality Framework Key Performance Indicators Monitoring v8.3
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Facility: {facilityId}</span>
                <span>Period: {reportingPeriod}</span>
                <span>User: {userId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Offline Mode
                </Badge>
              )}
              {dataQualityIssues.length > 0 && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {dataQualityIssues.length} Issues
                </Badge>
              )}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleValidateAllKPIs}
                disabled={loading}
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Validate All
              </Button>
              <Button
                onClick={handleExportReport}
                disabled={loading}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={loadKPIData} disabled={loading}>
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Dialog open={showKPIDialog} onOpenChange={setShowKPIDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add KPI
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add JAWDA KPI</DialogTitle>
                    <DialogDescription>
                      Add a new Key Performance Indicator for UAE Quality
                      Framework tracking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kpiName">KPI Name</Label>
                        <Input
                          id="kpiName"
                          value={newKPIRecord.kpi_name}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              kpi_name: e.target.value,
                            })
                          }
                          placeholder="Enter KPI name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kpiCategory">Category</Label>
                        <Select
                          value={newKPIRecord.kpi_category}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              kpi_category: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient_safety">
                              Patient Safety
                            </SelectItem>
                            <SelectItem value="clinical_effectiveness">
                              Clinical Effectiveness
                            </SelectItem>
                            <SelectItem value="patient_experience">
                              Patient Experience
                            </SelectItem>
                            <SelectItem value="operational_efficiency">
                              Operational Efficiency
                            </SelectItem>
                            <SelectItem value="staff_satisfaction">
                              Staff Satisfaction
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="kpiDescription">Description</Label>
                      <Textarea
                        id="kpiDescription"
                        value={newKPIRecord.kpi_description}
                        onChange={(e) =>
                          setNewKPIRecord({
                            ...newKPIRecord,
                            kpi_description: e.target.value,
                          })
                        }
                        placeholder="Describe the KPI and its measurement criteria"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jawdaKpiId">JAWDA KPI ID</Label>
                        <Select
                          value={newKPIRecord.jawda_kpi_id}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              jawda_kpi_id: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select JAWDA KPI" />
                          </SelectTrigger>
                          <SelectContent>
                            {mandatoryKPIs.map((kpi) => (
                              <SelectItem key={kpi.id} value={kpi.id}>
                                {kpi.id} - {kpi.name.substring(0, 50)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reportingFrequency">
                          Reporting Frequency
                        </Label>
                        <Select
                          value={newKPIRecord.reporting_frequency}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              reporting_frequency: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="numerator">Numerator</Label>
                        <Input
                          id="numerator"
                          type="number"
                          value={newKPIRecord.numerator}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              numerator: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter numerator"
                        />
                      </div>
                      <div>
                        <Label htmlFor="denominator">Denominator</Label>
                        <Input
                          id="denominator"
                          type="number"
                          value={newKPIRecord.denominator}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              denominator: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter denominator"
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetValue">Target Value</Label>
                        <Input
                          id="targetValue"
                          type="number"
                          value={newKPIRecord.target_value}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              target_value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Enter target value"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataSource">Data Source</Label>
                        <Input
                          id="dataSource"
                          value={newKPIRecord.data_source}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              data_source: e.target.value,
                            })
                          }
                          placeholder="Enter data source"
                        />
                      </div>
                      <div>
                        <Label htmlFor="collectionMethod">
                          Collection Method
                        </Label>
                        <Select
                          value={newKPIRecord.collection_method}
                          onValueChange={(value) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              collection_method: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automated">Automated</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="responsibleDepartment">
                          Responsible Department
                        </Label>
                        <Input
                          id="responsibleDepartment"
                          value={newKPIRecord.responsible_department}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              responsible_department: e.target.value,
                            })
                          }
                          placeholder="Enter responsible department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsiblePerson">
                          Responsible Person
                        </Label>
                        <Input
                          id="responsiblePerson"
                          value={newKPIRecord.responsible_person}
                          onChange={(e) =>
                            setNewKPIRecord({
                              ...newKPIRecord,
                              responsible_person: e.target.value,
                            })
                          }
                          placeholder="Enter responsible person"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowKPIDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKPIRecord} disabled={loading}>
                      Add KPI
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Total KPIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {totalKPIs}
                  </div>
                  <p className="text-xs text-blue-600">Active indicators</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Meeting Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {meetingTargets}
                  </div>
                  <p className="text-xs text-green-600">of {totalKPIs} KPIs</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Below Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {belowTargets}
                  </div>
                  <p className="text-xs text-red-600">Require attention</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {averagePerformance}%
                  </div>
                  <Progress value={averagePerformance} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Critical KPIs Alert */}
            {belowTargets > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Critical KPI Performance
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {belowTargets} KPI{belowTargets > 1 ? "s are" : " is"}{" "}
                  performing below target. Review and implement improvement
                  actions to maintain quality standards.
                </AlertDescription>
              </Alert>
            )}

            {/* KPI Table */}
            <Card>
              <CardHeader>
                <CardTitle>JAWDA KPI Performance Dashboard</CardTitle>
                <CardDescription>
                  Monitor and track UAE Quality Framework Key Performance
                  Indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>JAWDA ID</TableHead>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Numerator</TableHead>
                        <TableHead>Denominator</TableHead>
                        <TableHead>Calculated Value</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            Loading KPI data...
                          </TableCell>
                        </TableRow>
                      ) : kpiRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-4 text-gray-500"
                          >
                            No KPI records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        kpiRecords.map((kpi) => {
                          const calculatedValue =
                            kpi.denominator && kpi.denominator > 0
                              ? (kpi.numerator / kpi.denominator) *
                                (kpi.jawda_kpi_id?.includes("HC004") ||
                                kpi.jawda_kpi_id?.includes("HC005")
                                  ? 1000
                                  : 100)
                              : 0;

                          return (
                            <TableRow key={kpi._id?.toString()}>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {kpi.jawda_kpi_id || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium max-w-xs">
                                <div className="truncate" title={kpi.kpi_name}>
                                  {kpi.kpi_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {kpi.kpi_category
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {kpi.numerator || 0}
                              </TableCell>
                              <TableCell className="text-center">
                                {kpi.denominator || 0}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {calculatedValue.toFixed(2)}
                                {kpi.jawda_kpi_id?.includes("HC004") ||
                                kpi.jawda_kpi_id?.includes("HC005")
                                  ? "/1000"
                                  : "%"}
                              </TableCell>
                              <TableCell className="text-center">
                                {kpi.target_value}
                              </TableCell>
                              <TableCell>
                                {getPerformanceBadge(kpi.performance_status)}
                              </TableCell>
                              <TableCell>
                                {getTrendBadge(
                                  kpi.trend_analysis.trend_direction,
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(
                                  kpi.last_updated,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Case Mix Submission Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Case-Mix Submission</CardTitle>
                <CardDescription>
                  Track patient days by service category as per JAWDA
                  requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Simple Visit-Nurse (17-25-1)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Simple Visit-Supportive (17-25-2)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Specialized Visit (17-25-3)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Routine Nursing Care (17-25-4)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Advanced Nursing Care (17-25-5)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Self-pay/Reimbursement (XXXX)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Patient days"
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Case-mix data is required for
                    quarterly JAWDA submissions. Patient days should reflect the
                    highest level of care provided per day.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mandatory JAWDA KPIs Status */}
            <Card>
              <CardHeader>
                <CardTitle>Mandatory JAWDA KPIs Status</CardTitle>
                <CardDescription>
                  Track compliance with the 6 mandatory home care performance
                  indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mandatoryKPIs.map((kpi) => {
                    const kpiRecord = kpiRecords.find(
                      (record) => record.jawda_kpi_id === kpi.id,
                    );
                    const isImplemented = !!kpiRecord;
                    const hasData =
                      kpiRecord &&
                      (kpiRecord.numerator > 0 || kpiRecord.denominator > 0);

                    return (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {kpi.id}
                            </Badge>
                            <span className="font-medium text-sm">
                              {kpi.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {kpi.category.replace("_", " ").toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isImplemented ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Implemented
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                          {hasData ? (
                            <Badge variant="secondary" className="text-xs">
                              Data Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No Data
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* KPI Categories Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(1).map((category) => {
                const categoryKPIs = kpiRecords.filter(
                  (kpi) => kpi.kpi_category === category,
                );
                const categoryMeeting = categoryKPIs.filter(
                  (kpi) =>
                    kpi.performance_status === "meets" ||
                    kpi.performance_status === "exceeds",
                ).length;
                const categoryPerformance =
                  categoryKPIs.length > 0
                    ? Math.round((categoryMeeting / categoryKPIs.length) * 100)
                    : 0;

                return (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total KPIs:</span>
                          <span className="font-medium">
                            {categoryKPIs.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Meeting Targets:</span>
                          <span className="font-medium">{categoryMeeting}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Performance:</span>
                          <span className="font-medium">
                            {categoryPerformance}%
                          </span>
                        </div>
                        <Progress
                          value={categoryPerformance}
                          className="h-2 mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  KPI Validation Results
                </CardTitle>
                <CardDescription>
                  Comprehensive validation of all JAWDA KPIs with
                  inclusion/exclusion criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(validationResults).map(([kpiId, result]) => {
                    const kpi = kpiRecords.find(
                      (k) => k.kpi_id === kpiId || k._id?.toString() === kpiId,
                    );
                    if (!kpi) return null;

                    return (
                      <div key={kpiId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{kpi.jawda_kpi_id}</Badge>
                            <span className="font-medium">{kpi.kpi_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.isValid ? (
                              <Badge
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Valid
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Invalid
                              </Badge>
                            )}
                          </div>
                        </div>

                        {result.errors.length > 0 && (
                          <Alert className="mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Validation Errors</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc list-inside">
                                {result.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.warnings.length > 0 && (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Warnings</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc list-inside">
                                {result.warnings.map((warning, idx) => (
                                  <li key={idx}>{warning}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  JAWDA Compliance Status
                </CardTitle>
                <CardDescription>
                  Detailed compliance analysis for all mandatory KPIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {Math.round(
                          (Object.values(validationResults).filter(
                            (r) => r.isValid,
                          ).length /
                            Math.max(
                              Object.keys(validationResults).length,
                              1,
                            )) *
                            100,
                        )}
                        %
                      </div>
                      <p className="text-sm text-blue-600">
                        Overall Compliance
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-900">
                        {
                          Object.values(validationResults).filter(
                            (r) => r.isValid,
                          ).length
                        }
                      </div>
                      <p className="text-sm text-green-600">Compliant KPIs</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-900">
                        {
                          Object.values(validationResults).filter(
                            (r) => !r.isValid,
                          ).length
                        }
                      </div>
                      <p className="text-sm text-red-600">Non-Compliant KPIs</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {mandatoryKPIs.map((kpiDef) => {
                    const kpiRecord = kpiRecords.find(
                      (r) => r.jawda_kpi_id === kpiDef.id,
                    );
                    const validation = kpiRecord
                      ? validationResults[
                          kpiRecord.kpi_id || kpiRecord._id?.toString() || ""
                        ]
                      : null;

                    return (
                      <div key={kpiDef.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{kpiDef.id}</Badge>
                              <span className="font-medium">{kpiDef.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {kpiDef.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {kpiRecord ? (
                              validation?.isValid ? (
                                <Badge variant="default">Compliant</Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Non-Compliant
                                </Badge>
                              )
                            ) : (
                              <Badge variant="secondary">Not Implemented</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">
                              Inclusion Criteria:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-green-600">
                              {kpiDef.inclusionCriteria?.map(
                                (criteria, idx) => (
                                  <li key={idx}>{criteria}</li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">
                              Exclusion Criteria:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-red-600">
                              {kpiDef.exclusionCriteria?.map(
                                (criteria, idx) => (
                                  <li key={idx}>{criteria}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">
                                Target Benchmark:
                              </span>
                              <p className="text-gray-600">
                                {kpiDef.targetBenchmark}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span>
                              <p className="text-gray-600">
                                {kpiDef.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Direction:</span>
                              <p className="text-gray-600">
                                {kpiDef.direction}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete audit log of all KPI-related activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditTrail
                    .slice(-20)
                    .reverse()
                    .map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-sm text-gray-600">
                            {entry.userId} •{" "}
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          {entry.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {JSON.stringify(entry.details, null, 2).substring(
                                0,
                                100,
                              )}
                              ...
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">{entry.userRole}</Badge>
                      </div>
                    ))}
                  {auditTrail.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No audit entries found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Quality Monitor
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of data quality issues and
                  recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataQualityIssues.length > 0 ? (
                    dataQualityIssues.map((issue, idx) => (
                      <Alert
                        key={idx}
                        className={
                          issue.severity === "Critical"
                            ? "border-red-200 bg-red-50"
                            : "border-yellow-200 bg-yellow-50"
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="flex items-center justify-between">
                          <span>
                            {issue.kpiName} ({issue.kpiId})
                          </span>
                          <Badge
                            variant={
                              issue.severity === "Critical"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside mt-2">
                            {issue.issues.map(
                              (item: string, itemIdx: number) => (
                                <li key={itemIdx}>{item}</li>
                              ),
                            )}
                          </ul>
                          <p className="text-xs mt-2 text-gray-500">
                            Last Updated:{" "}
                            {new Date(issue.lastUpdated).toLocaleString()}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Data Quality Status: Excellent</AlertTitle>
                      <AlertDescription>
                        All KPI data meets quality standards with no critical
                        issues detected.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Compliance Reports
                </CardTitle>
                <CardDescription>
                  Generate and export comprehensive JAWDA compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        JAWDA Quarterly Compliance Report
                      </h3>
                      <p className="text-sm text-gray-600">
                        Complete compliance analysis for {reportingPeriod}
                      </p>
                    </div>
                    <Button onClick={handleExportReport} disabled={loading}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>

                  {complianceReport && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-medium mb-3">
                        Latest Report Summary
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Report ID:</span>
                          <p className="text-gray-600">
                            {complianceReport.reportId}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Generated:</span>
                          <p className="text-gray-600">
                            {new Date(
                              complianceReport.generatedAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Total KPIs:</span>
                          <p className="text-gray-600">
                            {complianceReport.kpiSummary.totalKPIs}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Compliance Rate:</span>
                          <p className="text-gray-600">
                            {complianceReport.kpiSummary.overallComplianceRate}%
                          </p>
                        </div>
                      </div>

                      {complianceReport.recommendations.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Recommendations:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {complianceReport.recommendations.map(
                              (rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
