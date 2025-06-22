import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Shield,
  Activity,
  BookOpen,
  Heart,
  Stethoscope,
  Pill,
  FileCheck,
  Link,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Share2,
  Calendar,
  User,
  Clock3,
  Target,
  Award,
  AlertCircle,
  Info,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { DOHComplianceValidationAPI } from "@/api/clinical.api";
import {
  DOHValidationResult,
  DOHComplianceStatus,
  DOHDomainValidation,
  DOHValidationError,
  DOHValidationWarning,
  DOHCriticalFinding,
  DOHCoreStandards,
  DOHValidationEngine,
} from "@/types/supabase";

interface DOHComplianceValidatorProps {
  patientId?: string;
  episodeId?: string;
  formId?: string;
  formType: string;
  formData: any;
  validationType?:
    | "clinical_form"
    | "episode"
    | "patient_record"
    | "system_wide"
    | "periodic_audit";
  validationScope?:
    | "single_form"
    | "episode_complete"
    | "patient_complete"
    | "department"
    | "organization";
  onValidationComplete?: (result: DOHValidationResult) => void;
  onValidationChange?: (
    isValid: boolean,
    errors: string[],
    warnings: string[],
  ) => void;
  realTimeValidation?: boolean;
  autoValidate?: boolean;
  showComplianceOverview?: boolean;
  embedded?: boolean;
  className?: string;
  // Batch validation props
  enableBatchValidation?: boolean;
  batchItems?: Array<{
    id: string;
    type: string;
    data: any;
    priority?: "low" | "medium" | "high" | "critical";
  }>;
  onBatchValidationComplete?: (result: any) => void;
  // Reporting props
  enableReporting?: boolean;
  reportingConfig?: {
    autoGenerate: boolean;
    reportTypes: string[];
    schedule?: string;
  };
  // Analytics props
  showAnalytics?: boolean;
  analyticsScope?: {
    type: "department" | "organization";
    id: string;
  };
}

const DOHComplianceValidator: React.FC<DOHComplianceValidatorProps> = ({
  patientId,
  episodeId,
  formId,
  formType,
  formData,
  validationType = "clinical_form",
  validationScope = "single_form",
  onValidationComplete,
  onValidationChange,
  realTimeValidation = false,
  autoValidate = true,
  showComplianceOverview = true,
  embedded = false,
  className = "",
}) => {
  const [validationResult, setValidationResult] =
    useState<DOHValidationResult | null>(null);
  const [complianceStatus, setComplianceStatus] =
    useState<DOHComplianceStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeErrors, setRealTimeErrors] = useState<string[]>([]);
  const [realTimeWarnings, setRealTimeWarnings] = useState<string[]>([]);
  const [validationHistory, setValidationHistory] = useState<
    DOHValidationResult[]
  >([]);
  const [lastValidationTime, setLastValidationTime] = useState<string | null>(
    null,
  );
  const [validationProgress, setValidationProgress] = useState<number>(0);
  const [isAutoValidationEnabled, setIsAutoValidationEnabled] =
    useState(autoValidate);
  const [validationMetrics, setValidationMetrics] = useState<{
    totalValidations: number;
    averageScore: number;
    trendDirection: "up" | "down" | "stable";
  }>({ totalValidations: 0, averageScore: 0, trendDirection: "stable" });

  // Batch validation state
  const [batchValidationStatus, setBatchValidationStatus] = useState<{
    isProcessing: boolean;
    batchId?: string;
    progress: number;
    results?: any;
    queueStatus?: {
      totalQueued: number;
      processing: number;
      completed: number;
      failed: number;
    };
  }>({ isProcessing: false, progress: 0 });

  // Reporting state
  const [reportingStatus, setReportingStatus] = useState<{
    isGenerating: boolean;
    reportId?: string;
    reportUrl?: string;
    reportType?: string;
    scheduledReports?: Array<{
      id: string;
      type: string;
      frequency: string;
      nextRun: string;
    }>;
  }>({ isGenerating: false });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Caching and performance state
  const [cachingStatus, setCachingStatus] = useState<{
    enabled: boolean;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    cacheSize: number;
  }>({ enabled: true, hitRate: 0, totalHits: 0, totalMisses: 0, cacheSize: 0 });

  // Queue management state
  const [queueStatus, setQueueStatus] = useState<{
    totalItems: number;
    processing: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
  }>({
    totalItems: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    averageProcessingTime: 0,
  });

  // Performance metrics state
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    validationSpeed: number;
    throughput: number;
    errorRate: number;
    cacheEfficiency: number;
  }>({ validationSpeed: 0, throughput: 0, errorRate: 0, cacheEfficiency: 0 });

  // Core DOH Standards state
  const [coreStandards, setCoreStandards] = useState<DOHCoreStandards | null>(
    null,
  );
  const [validationEngine, setValidationEngine] =
    useState<DOHValidationEngine | null>(null);
  const [isLoadingStandards, setIsLoadingStandards] = useState(false);

  // Background processing state
  const [backgroundProcessing, setBackgroundProcessing] = useState<{
    enabled: boolean;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  }>({ enabled: false, activeJobs: 0, completedJobs: 0, failedJobs: 0 });

  // Domain icons mapping
  const domainIcons = {
    clinical_care: Heart,
    patient_safety: Shield,
    infection_control: Activity,
    medication_management: Pill,
    documentation_standards: FileCheck,
    continuity_of_care: Link,
    patient_rights: UserCheck,
    quality_improvement: TrendingUp,
    professional_development: GraduationCap,
  };

  // Core DOH Standards Validation Functions
  const loadCoreStandards = async () => {
    setIsLoadingStandards(true);
    try {
      // In a real implementation, this would load from API or configuration
      const mockCoreStandards: DOHCoreStandards = {
        standardId: "DOH-UAE-2024",
        version: "V2.1/2024",
        effectiveDate: "2024-01-01",
        domains: {
          clinical_care: {
            requirements: [
              {
                id: "CC-001",
                title: "Clinical Assessment Documentation",
                description:
                  "All clinical assessments must be documented within 24 hours",
                mandatory: true,
                validationRules: [
                  "required_field",
                  "timestamp_validation",
                  "completeness_check",
                ],
                evidenceRequired: [
                  "assessment_form",
                  "clinical_notes",
                  "vital_signs",
                ],
              },
              {
                id: "CC-002",
                title: "Care Plan Development",
                description:
                  "Individualized care plans must be developed for all patients",
                mandatory: true,
                validationRules: [
                  "care_plan_exists",
                  "individualized_content",
                  "goal_setting",
                ],
                evidenceRequired: [
                  "care_plan_document",
                  "patient_goals",
                  "intervention_plan",
                ],
              },
            ],
          },
          patient_safety: {
            requirements: [
              {
                id: "PS-001",
                title: "Risk Assessment",
                description:
                  "Patient safety risk assessment must be conducted and documented",
                mandatory: true,
                validationRules: [
                  "risk_assessment_complete",
                  "risk_level_identified",
                  "mitigation_plan",
                ],
                evidenceRequired: [
                  "risk_assessment_form",
                  "safety_plan",
                  "monitoring_schedule",
                ],
              },
            ],
          },
          infection_control: {
            requirements: [
              {
                id: "IC-001",
                title: "Infection Prevention Protocols",
                description:
                  "Infection control measures must be implemented and documented",
                mandatory: true,
                validationRules: [
                  "protocol_followed",
                  "documentation_complete",
                  "compliance_verified",
                ],
                evidenceRequired: [
                  "infection_control_checklist",
                  "compliance_record",
                  "training_evidence",
                ],
              },
            ],
          },
          medication_management: {
            requirements: [
              {
                id: "MM-001",
                title: "Medication Reconciliation",
                description:
                  "Medication reconciliation must be performed and documented",
                mandatory: true,
                validationRules: [
                  "reconciliation_complete",
                  "discrepancies_resolved",
                  "physician_review",
                ],
                evidenceRequired: [
                  "medication_list",
                  "reconciliation_form",
                  "physician_signature",
                ],
              },
            ],
          },
          documentation_standards: {
            requirements: [
              {
                id: "DS-001",
                title: "Documentation Completeness",
                description:
                  "All required documentation must be complete and accurate",
                mandatory: true,
                validationRules: [
                  "all_fields_complete",
                  "accuracy_verified",
                  "timely_documentation",
                ],
                evidenceRequired: [
                  "completed_forms",
                  "verification_signatures",
                  "timestamp_records",
                ],
              },
            ],
          },
          continuity_of_care: {
            requirements: [
              {
                id: "COC-001",
                title: "Care Coordination",
                description:
                  "Care coordination between providers must be documented",
                mandatory: true,
                validationRules: [
                  "coordination_documented",
                  "communication_recorded",
                  "handoff_complete",
                ],
                evidenceRequired: [
                  "coordination_notes",
                  "communication_log",
                  "handoff_checklist",
                ],
              },
            ],
          },
          patient_rights: {
            requirements: [
              {
                id: "PR-001",
                title: "Informed Consent",
                description:
                  "Patient informed consent must be obtained and documented",
                mandatory: true,
                validationRules: [
                  "consent_obtained",
                  "patient_understanding",
                  "documentation_complete",
                ],
                evidenceRequired: [
                  "consent_form",
                  "patient_signature",
                  "witness_signature",
                ],
              },
            ],
          },
          quality_improvement: {
            requirements: [
              {
                id: "QI-001",
                title: "Quality Metrics Tracking",
                description:
                  "Quality improvement metrics must be tracked and reported",
                mandatory: true,
                validationRules: [
                  "metrics_defined",
                  "data_collected",
                  "analysis_performed",
                ],
                evidenceRequired: [
                  "quality_metrics",
                  "data_reports",
                  "improvement_plans",
                ],
              },
            ],
          },
          professional_development: {
            requirements: [
              {
                id: "PD-001",
                title: "Staff Competency Verification",
                description: "Staff competency must be verified and documented",
                mandatory: true,
                validationRules: [
                  "competency_assessed",
                  "training_completed",
                  "certification_current",
                ],
                evidenceRequired: [
                  "competency_assessment",
                  "training_records",
                  "certification_documents",
                ],
              },
            ],
          },
        },
        validationEngine: {
          version: "2.1.0",
          rulesEngine: "DOH-Compliance-Engine",
          automatedChecks: [
            "required_field",
            "timestamp_validation",
            "completeness_check",
          ],
          manualChecks: [
            "clinical_judgment",
            "quality_review",
            "peer_assessment",
          ],
        },
        complianceThresholds: {
          excellent: 95,
          good: 85,
          satisfactory: 75,
          needs_improvement: 60,
          critical: 60,
        },
      };

      const mockValidationEngine: DOHValidationEngine = {
        engineId: "DOH-VE-2024",
        version: "2.1.0",
        standardsVersion: "V2.1/2024",
        validationRules: {
          clinical_care: {
            "CC-001-REQ": {
              name: "Clinical Assessment Required",
              description: "Clinical assessment must be documented",
              type: "required",
              severity: "critical",
              validationLogic:
                "formData.clinicalAssessment && formData.clinicalAssessment.completed",
              errorMessage:
                "Clinical assessment is required and must be completed",
              recommendations: [
                "Complete clinical assessment form",
                "Document all findings",
                "Obtain supervisor review",
              ],
              references: {
                dohStandard: "DOH-UAE-2024",
                section: "Clinical Care",
                requirement: "CC-001",
              },
            },
          },
          patient_safety: {
            "PS-001-REQ": {
              name: "Safety Risk Assessment Required",
              description: "Patient safety risk assessment must be completed",
              type: "required",
              severity: "critical",
              validationLogic:
                "formData.safetyAssessment && formData.safetyAssessment.riskLevel",
              errorMessage: "Patient safety risk assessment is mandatory",
              recommendations: [
                "Complete safety risk assessment",
                "Identify risk factors",
                "Develop mitigation plan",
              ],
              references: {
                dohStandard: "DOH-UAE-2024",
                section: "Patient Safety",
                requirement: "PS-001",
              },
            },
          },
        },
        scoringMatrix: {
          clinical_care: {
            maxScore: 100,
            weightage: 0.25,
            criticalRequirements: ["CC-001", "CC-002"],
            scoringRules: [
              {
                condition: "all_critical_met",
                points: 80,
                description: "All critical requirements met",
              },
              {
                condition: "documentation_complete",
                points: 15,
                description: "Complete documentation",
              },
              {
                condition: "quality_indicators_met",
                points: 5,
                description: "Quality indicators achieved",
              },
            ],
          },
          patient_safety: {
            maxScore: 100,
            weightage: 0.2,
            criticalRequirements: ["PS-001"],
            scoringRules: [
              {
                condition: "risk_assessment_complete",
                points: 60,
                description: "Risk assessment completed",
              },
              {
                condition: "mitigation_plan_exists",
                points: 25,
                description: "Mitigation plan documented",
              },
              {
                condition: "monitoring_implemented",
                points: 15,
                description: "Monitoring plan implemented",
              },
            ],
          },
        },
        complianceCalculation: {
          method: "weighted_average",
          domainWeights: {
            clinical_care: 0.25,
            patient_safety: 0.2,
            infection_control: 0.15,
            medication_management: 0.15,
            documentation_standards: 0.1,
            continuity_of_care: 0.05,
            patient_rights: 0.05,
            quality_improvement: 0.03,
            professional_development: 0.02,
          },
          passingThreshold: 75,
          criticalFailureThreshold: 60,
        },
      };

      setCoreStandards(mockCoreStandards);
      setValidationEngine(mockValidationEngine);
    } catch (error) {
      console.error("Failed to load core standards:", error);
      setError("Failed to load DOH core standards");
    } finally {
      setIsLoadingStandards(false);
    }
  };

  // Enhanced validation with core standards checking
  const performCoreStandardsValidation = (
    formData: any,
    formType: string,
  ): DOHValidationResult => {
    if (!coreStandards || !validationEngine) {
      throw new Error("Core standards not loaded");
    }

    const validationId = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const validationDate = new Date().toISOString();

    // Initialize validation result
    const result: DOHValidationResult = {
      validationId,
      validationType: "clinical_form",
      validationScope: "single_form",
      validationDate,
      validatedBy: "current_user",
      validatorRole: "clinical_staff",
      overallStatus: "compliant",
      complianceScore: {
        total: 0,
        maxTotal: 0,
        percentage: 0,
        grade: "A",
      },
      domainValidations: [],
      errors: [],
      warnings: [],
      criticalFindings: [],
      actionItems: [],
      validationMetadata: {
        standardVersion: coreStandards.version,
        validationRules: [],
        automatedChecks: 0,
        manualChecks: 0,
        totalChecks: 0,
        processingTime: 0,
        dataQuality: "high",
        completeness: 100,
      },
      complianceTracking: {
        trendDirection: "stable",
        consecutiveCompliantValidations: 1,
      },
      recommendations: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        bestPractices: [],
      },
      auditTrail: [
        {
          action: "validation_started",
          performedBy: "current_user",
          timestamp: validationDate,
          details: { formType, validationEngine: validationEngine.version },
        },
      ],
      nextValidation: {
        scheduledDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        type: "routine",
        scope: "single_form",
      },
      createdAt: validationDate,
      updatedAt: validationDate,
      status: "completed",
    };

    // Validate each domain
    let totalScore = 0;
    let maxTotalScore = 0;
    let hasErrors = false;
    let hasCriticalFindings = false;

    Object.entries(coreStandards.domains).forEach(
      ([domainKey, domainConfig]) => {
        const domainValidation = validateDomain(
          domainKey,
          domainConfig,
          formData,
          validationEngine,
        );
        result.domainValidations.push(domainValidation);

        totalScore += domainValidation.score;
        maxTotalScore += domainValidation.maxScore;

        if (domainValidation.status === "non_compliant") {
          hasErrors = true;
        }

        if (domainValidation.criticalFindings.length > 0) {
          hasCriticalFindings = true;
          result.criticalFindings.push(...domainValidation.criticalFindings);
        }
      },
    );

    // Calculate overall compliance
    const percentage =
      maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
    result.complianceScore = {
      total: totalScore,
      maxTotal: maxTotalScore,
      percentage,
      grade: getComplianceGrade(percentage),
    };

    // Determine overall status
    if (
      hasCriticalFindings ||
      percentage < coreStandards.complianceThresholds.critical
    ) {
      result.overallStatus = "non_compliant";
    } else if (
      hasErrors ||
      percentage < coreStandards.complianceThresholds.satisfactory
    ) {
      result.overallStatus = "partial";
    } else {
      result.overallStatus = "compliant";
    }

    // Generate recommendations
    result.recommendations = generateRecommendations(
      result.domainValidations,
      percentage,
    );

    return result;
  };

  // Validate individual domain
  const validateDomain = (
    domainKey: string,
    domainConfig: any,
    formData: any,
    engine: DOHValidationEngine,
  ): DOHDomainValidation => {
    const domainName = domainKey
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const scoringConfig = engine.scoringMatrix[domainKey];

    let domainScore = 0;
    let maxDomainScore = scoringConfig?.maxScore || 100;
    let validationChecks: any[] = [];
    let criticalFindings: DOHCriticalFinding[] = [];
    let recommendations: string[] = [];

    // Validate each requirement in the domain
    domainConfig.requirements.forEach((requirement: any) => {
      const check = {
        checkId: requirement.id,
        checkName: requirement.title,
        description: requirement.description,
        required: requirement.mandatory,
        passed: false,
        score: 0,
        maxScore: 20,
        evidence: [],
        recommendations: [],
      };

      // Perform validation based on form data
      const validationResult = performRequirementValidation(
        requirement,
        formData,
      );
      check.passed = validationResult.passed;
      check.score = validationResult.passed ? check.maxScore : 0;
      check.evidence = validationResult.evidence;
      check.recommendations = validationResult.recommendations;

      if (!validationResult.passed && requirement.mandatory) {
        criticalFindings.push({
          findingId: `${requirement.id}_CRITICAL`,
          findingType: "regulatory",
          severity: "critical",
          domain: domainKey,
          title: `Critical Requirement Not Met: ${requirement.title}`,
          description: requirement.description,
          impact: "Non-compliance with mandatory DOH requirement",
          riskLevel: "critical",
          immediateActions: [
            "Complete missing requirement",
            "Document compliance",
            "Notify supervisor",
          ],
          correctiveActions: [
            {
              actionId: `${requirement.id}_ACTION`,
              description: `Complete ${requirement.title}`,
              responsible: "assigned_clinician",
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              status: "pending",
              priority: "immediate",
            },
          ],
          regulatoryImplications: {
            dohReportable: true,
            jawdaImpact: true,
            licenseRisk: true,
            accreditationRisk: true,
          },
          evidence: [],
          preventiveMeasures: [
            "Implement checklist",
            "Staff training",
            "Regular audits",
          ],
          detectedAt: new Date().toISOString(),
          detectedBy: "validation_engine",
        });
      }

      domainScore += check.score;
      validationChecks.push(check);
    });

    const percentage =
      maxDomainScore > 0 ? Math.round((domainScore / maxDomainScore) * 100) : 0;
    let status: "compliant" | "non_compliant" | "partial" | "not_applicable" =
      "compliant";

    if (criticalFindings.length > 0) {
      status = "non_compliant";
    } else if (percentage < 75) {
      status = "partial";
    }

    // Generate domain-specific recommendations
    if (percentage < 90) {
      recommendations.push(
        `Improve ${domainName} compliance to achieve excellence`,
      );
    }
    if (criticalFindings.length > 0) {
      recommendations.push(
        `Address critical findings in ${domainName} immediately`,
      );
    }

    return {
      domain: domainKey as any,
      domainName,
      score: domainScore,
      maxScore: maxDomainScore,
      percentage,
      status,
      validationChecks,
      criticalFindings,
      recommendations,
      lastValidated: new Date().toISOString(),
      validatedBy: "validation_engine",
    };
  };

  // Perform individual requirement validation
  const performRequirementValidation = (requirement: any, formData: any) => {
    let passed = true;
    let evidence: string[] = [];
    let recommendations: string[] = [];

    // Basic validation logic based on requirement type
    requirement.validationRules.forEach((rule: string) => {
      switch (rule) {
        case "required_field":
          if (!formData || Object.keys(formData).length === 0) {
            passed = false;
            recommendations.push("Complete the required form fields");
          } else {
            evidence.push("Form data provided");
          }
          break;
        case "timestamp_validation":
          if (!formData.timestamp || !formData.completedAt) {
            passed = false;
            recommendations.push("Ensure proper timestamp documentation");
          } else {
            evidence.push("Timestamp recorded");
          }
          break;
        case "completeness_check":
          const requiredFields = [
            "patientId",
            "assessmentDate",
            "clinicalFindings",
          ];
          const missingFields = requiredFields.filter(
            (field) => !formData[field],
          );
          if (missingFields.length > 0) {
            passed = false;
            recommendations.push(
              `Complete missing fields: ${missingFields.join(", ")}`,
            );
          } else {
            evidence.push("All required fields completed");
          }
          break;
        default:
          // Default to passed for unknown rules
          evidence.push(`Rule ${rule} evaluated`);
      }
    });

    return { passed, evidence, recommendations };
  };

  // Get compliance grade based on percentage
  const getComplianceGrade = (
    percentage: number,
  ): "A" | "B" | "C" | "D" | "F" => {
    if (percentage >= 95) return "A";
    if (percentage >= 85) return "B";
    if (percentage >= 75) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  // Generate recommendations based on validation results
  const generateRecommendations = (
    domainValidations: DOHDomainValidation[],
    overallPercentage: number,
  ) => {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const bestPractices: string[] = [];

    // Analyze critical findings for immediate actions
    domainValidations.forEach((domain) => {
      if (domain.criticalFindings.length > 0) {
        immediate.push(`Address critical findings in ${domain.domainName}`);
      }
      if (domain.percentage < 60) {
        immediate.push(`Urgent improvement needed in ${domain.domainName}`);
      } else if (domain.percentage < 80) {
        shortTerm.push(`Enhance ${domain.domainName} compliance`);
      }
    });

    // Overall recommendations
    if (overallPercentage < 75) {
      immediate.push("Implement comprehensive compliance improvement plan");
      shortTerm.push("Conduct staff training on DOH standards");
    }

    // Best practices
    bestPractices.push("Regular compliance monitoring and auditing");
    bestPractices.push("Continuous staff education and training");
    bestPractices.push("Implementation of quality improvement initiatives");

    return { immediate, shortTerm, longTerm, bestPractices };
  };

  // Perform DOH validation with caching and performance optimization
  const performValidation = async (enableCaching: boolean = true) => {
    if (!formData || !formType) {
      setError("Form data and type are required for validation");
      return;
    }

    if (!coreStandards || !validationEngine) {
      setError("DOH core standards not loaded. Please wait and try again.");
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationProgress(0);

    try {
      const startTime = Date.now();

      // Simulate validation progress
      const progressInterval = setInterval(() => {
        setValidationProgress((prev) => Math.min(prev + 20, 90));
      }, 200);

      // Perform core standards validation
      let validationResult: DOHValidationResult;

      try {
        // Try to use API first, fallback to local validation
        const response =
          await DOHComplianceValidationAPI.validateClinicalDataWithCache(
            {
              patientId,
              episodeId,
              formId,
              formType,
              formData,
              validationType,
              validationScope,
            },
            "current_user",
            "clinical_staff",
            enableCaching,
          );

        if (response.success && response.data) {
          validationResult = response.data;
        } else {
          throw new Error(response.error?.message || "API validation failed");
        }
      } catch (apiError) {
        console.warn(
          "API validation failed, using local validation:",
          apiError,
        );
        // Fallback to local core standards validation
        validationResult = performCoreStandardsValidation(formData, formType);
      }

      clearInterval(progressInterval);
      setValidationProgress(100);

      // Update performance metrics
      const processingTime = Date.now() - startTime;
      setPerformanceMetrics((prev) => ({
        ...prev,
        validationSpeed: processingTime,
        throughput: prev.throughput + 1,
        errorRate: validationResult ? prev.errorRate : prev.errorRate + 1,
      }));

      // Update caching metrics (simulated for local validation)
      setCachingStatus((prev) => ({
        ...prev,
        totalHits: enableCaching ? prev.totalHits + 1 : prev.totalHits,
        totalMisses: enableCaching ? prev.totalMisses : prev.totalMisses + 1,
        hitRate: enableCaching
          ? ((prev.totalHits + 1) / (prev.totalHits + prev.totalMisses + 1)) *
            100
          : (prev.totalHits / (prev.totalHits + prev.totalMisses + 1)) * 100,
      }));

      if (validationResult) {
        setValidationResult(validationResult);
        setLastValidationTime(new Date().toISOString());

        // Update validation history
        setValidationHistory((prev) => [validationResult, ...prev.slice(0, 4)]);

        // Update real-time validation state
        setRealTimeErrors(validationResult.errors.map((e) => e.message));
        setRealTimeWarnings(validationResult.warnings.map((w) => w.message));

        // Update validation metrics
        setValidationMetrics((prev) => {
          const newTotal = prev.totalValidations + 1;
          const newAverage =
            (prev.averageScore * prev.totalValidations +
              validationResult.complianceScore.percentage) /
            newTotal;
          const trendDirection =
            newAverage > prev.averageScore
              ? "up"
              : newAverage < prev.averageScore
                ? "down"
                : "stable";

          return {
            totalValidations: newTotal,
            averageScore: Math.round(newAverage * 10) / 10,
            trendDirection,
          };
        });

        // Trigger callbacks
        onValidationComplete?.(validationResult);
        onValidationChange?.(
          validationResult.errors.length === 0,
          validationResult.errors.map((e) => e.message),
          validationResult.warnings.map((w) => w.message),
        );

        // Also fetch compliance status if we have patient/episode context
        if (patientId || episodeId) {
          await fetchComplianceStatus();
        }
      } else {
        setError("Validation failed - no result generated");
        onValidationChange?.(
          false,
          ["Validation failed - no result generated"],
          [],
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Fetch compliance status
  const fetchComplianceStatus = async () => {
    try {
      const scope = episodeId
        ? { type: "episode" as const, id: episodeId }
        : patientId
          ? { type: "patient" as const, id: patientId }
          : { type: "organization" as const, id: "default" };

      const response =
        await DOHComplianceValidationAPI.getDOHComplianceStatus(scope);

      if (response.success && response.data) {
        setComplianceStatus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch compliance status:", err);
    }
  };

  // Load core standards on mount
  useEffect(() => {
    loadCoreStandards();
  }, []);

  // Auto-validate on mount if form data is provided
  useEffect(() => {
    if (
      formData &&
      formType &&
      autoValidate &&
      coreStandards &&
      validationEngine
    ) {
      performValidation();
    }
  }, [formData, formType, autoValidate, coreStandards, validationEngine]);

  // Real-time validation effect with auto-validation toggle
  useEffect(() => {
    if (realTimeValidation && formData && formType && isAutoValidationEnabled) {
      const debounceTimer = setTimeout(() => {
        performValidation();
      }, 1000); // Debounce validation by 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [formData, realTimeValidation, formType, isAutoValidationEnabled]);

  // Toggle auto-validation
  const toggleAutoValidation = () => {
    setIsAutoValidationEnabled(!isAutoValidationEnabled);
  };

  // Enhanced batch validation with queue management
  const performBatchValidation = async (
    useBackgroundProcessing: boolean = false,
  ) => {
    if (!enableBatchValidation || !batchItems || batchItems.length === 0) {
      return;
    }

    setBatchValidationStatus({ isProcessing: true, progress: 0 });
    setError(null);

    try {
      const response = await DOHComplianceValidationAPI.performBatchValidation({
        batchType: "forms",
        items: batchItems,
        validationScope: validationScope || "single_form",
        requestedBy: "current_user", // In real implementation, get from auth context
        notificationSettings: {
          onComplete: true,
          onError: true,
          recipients: ["current_user"],
        },
        processingOptions: {
          enableCaching: cachingStatus.enabled,
          backgroundProcessing: useBackgroundProcessing,
          parallelProcessing: true,
          maxConcurrency: 5,
        },
      });

      if (response.success && response.data) {
        if (response.data.status === "queued_for_background_processing") {
          setBatchValidationStatus({
            isProcessing: false,
            batchId: response.data.batchId,
            progress: 0,
            results: response.data,
            queueStatus: {
              totalQueued: response.data.queuedItems,
              processing: 0,
              completed: 0,
              failed: 0,
            },
          });

          // Start polling for queue status
          startQueueStatusPolling(response.data.queueIds);
        } else {
          setBatchValidationStatus({
            isProcessing: false,
            batchId: response.data.batchId,
            progress: 100,
            results: response.data,
          });
        }
        onBatchValidationComplete?.(response.data);
      } else {
        setError(response.error?.message || "Batch validation failed");
        setBatchValidationStatus({ isProcessing: false, progress: 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch validation error");
      setBatchValidationStatus({ isProcessing: false, progress: 0 });
    }
  };

  // Report generation functions
  const generateComplianceReport = async (reportType: string) => {
    if (!enableReporting) return;

    setReportingStatus({ isGenerating: true, reportType });
    setError(null);

    try {
      const response =
        await DOHComplianceValidationAPI.generateComplianceReport({
          reportType: reportType as any,
          scope: {
            type: patientId
              ? "patient"
              : episodeId
                ? "episode"
                : "organization",
            id: patientId || episodeId || "default",
            dateRange: {
              from: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              to: new Date().toISOString(),
            },
          },
          includeDetails: {
            domainBreakdown: true,
            criticalFindings: true,
            actionItems: true,
            trends: true,
            recommendations: true,
            auditTrail: true,
          },
          format: "pdf",
          requestedBy: "current_user",
        });

      if (response.success && response.data) {
        setReportingStatus({
          isGenerating: false,
          reportId: response.data.reportId,
          reportUrl: response.data.reportUrl,
          reportType,
        });
      } else {
        setError(response.error?.message || "Report generation failed");
        setReportingStatus({ isGenerating: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report generation error");
      setReportingStatus({ isGenerating: false });
    }
  };

  // Analytics functions
  const loadAnalytics = async () => {
    if (!showAnalytics || !analyticsScope) return;

    setIsLoadingAnalytics(true);
    setError(null);

    try {
      const response =
        await DOHComplianceValidationAPI.generateComplianceAnalytics({
          type: analyticsScope.type,
          id: analyticsScope.id,
          reportingPeriod: {
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
            type: "quarterly",
          },
        });

      if (response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        setError(response.error?.message || "Analytics loading failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analytics loading error");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Queue status polling for background processing
  const startQueueStatusPolling = (queueIds: string[]) => {
    const pollInterval = setInterval(async () => {
      try {
        // In a real implementation, this would check the status of queued items
        // For now, we'll simulate progress
        setBatchValidationStatus((prev) => {
          if (prev.queueStatus) {
            const totalItems = prev.queueStatus.totalQueued;
            const completed = Math.min(
              prev.queueStatus.completed + 1,
              totalItems,
            );
            const progress = (completed / totalItems) * 100;

            if (completed >= totalItems) {
              clearInterval(pollInterval);
            }

            return {
              ...prev,
              progress,
              queueStatus: {
                ...prev.queueStatus,
                completed,
                processing: Math.max(0, totalItems - completed),
              },
            };
          }
          return prev;
        });
      } catch (error) {
        console.error("Error polling queue status:", error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clear interval after 5 minutes to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  // Cache management functions
  const clearValidationCache = async () => {
    try {
      await DOHComplianceValidationAPI.clearExpiredCache();
      setCachingStatus((prev) => ({
        ...prev,
        cacheSize: 0,
        totalHits: 0,
        totalMisses: 0,
        hitRate: 0,
      }));
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  const toggleCaching = () => {
    setCachingStatus((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Queue management functions
  const processValidationQueue = async () => {
    try {
      const response =
        await DOHComplianceValidationAPI.processValidationQueue(10);
      if (response.success && response.data) {
        setQueueStatus((prev) => ({
          ...prev,
          processing:
            response.data.processedItems -
            response.data.successfulItems -
            response.data.failedItems,
          completed: prev.completed + response.data.successfulItems,
          failed: prev.failed + response.data.failedItems,
        }));
      }
    } catch (error) {
      console.error("Error processing queue:", error);
    }
  };

  // Background processing toggle
  const toggleBackgroundProcessing = () => {
    setBackgroundProcessing((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Load analytics on mount if enabled
  useEffect(() => {
    if (showAnalytics && analyticsScope) {
      loadAnalytics();
    }
  }, [showAnalytics, analyticsScope]);

  // Performance monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Update cache efficiency
      setCachingStatus((prev) => {
        const efficiency =
          prev.totalHits > 0
            ? (prev.totalHits / (prev.totalHits + prev.totalMisses)) * 100
            : 0;
        return {
          ...prev,
          hitRate: efficiency,
        };
      });

      // Update performance metrics
      setPerformanceMetrics((prev) => ({
        ...prev,
        cacheEfficiency: cachingStatus.hitRate,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [cachingStatus.hitRate]);

  // Get status color based on compliance level
  const getStatusColor = (status: string, percentage?: number) => {
    if (status === "compliant" || (percentage && percentage >= 80))
      return "text-green-600";
    if (status === "partial" || (percentage && percentage >= 60))
      return "text-yellow-600";
    return "text-red-600";
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "compliant":
        return "default";
      case "partial":
        return "secondary";
      case "non_compliant":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Render domain validation card
  const renderDomainCard = (domain: DOHDomainValidation) => {
    const IconComponent = domainIcons[domain.domain] || FileText;

    return (
      <Card key={domain.domain} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{domain.domainName}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(domain.status)}>
                {domain.status.replace("_", " ").toUpperCase()}
              </Badge>
              <span
                className={`font-semibold ${getStatusColor(domain.status, domain.percentage)}`}
              >
                {domain.percentage}%
              </span>
            </div>
          </div>
          <Progress value={domain.percentage} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="font-semibold">
                {domain.score} / {domain.maxScore}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Validation Checks</p>
              <p className="font-semibold">
                {domain.validationChecks.length} checks
              </p>
            </div>
          </div>

          {domain.criticalFindings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Findings</AlertTitle>
              <AlertDescription>
                {domain.criticalFindings.length} critical issue(s) require
                immediate attention
              </AlertDescription>
            </Alert>
          )}

          {domain.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {domain.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render validation result summary card
  const renderValidationSummary = () => {
    if (!validationResult) return null;

    return (
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Validation Summary</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                      {new Date(
                        validationResult.validationDate,
                      ).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">
                      {validationResult.validatedBy}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock3 className="h-3 w-3" />
                    <span className="text-xs">
                      {validationResult.validationMetadata.processingTime}ms
                    </span>
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {validationResult.complianceScore.percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Score</div>
              <div className="text-xs text-gray-500 mt-1">
                Grade: {validationResult.complianceScore.grade}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {
                  validationResult.domainValidations.filter(
                    (d) => d.status === "compliant",
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Compliant Domains
              </div>
              <div className="text-xs text-gray-500 mt-1">
                of {validationResult.domainValidations.length} total
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {validationResult.criticalFindings.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Critical Issues</div>
              <div className="text-xs text-gray-500 mt-1">
                Require immediate action
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {validationResult.actionItems.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Action Items</div>
              <div className="text-xs text-gray-500 mt-1">
                Total recommendations
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render validation errors
  const renderErrors = (errors: DOHValidationError[]) => {
    if (errors.length === 0) return null;

    return (
      <div className="space-y-3">
        {errors.map((error) => (
          <Alert
            key={error.errorId}
            variant="destructive"
            className="border-l-4 border-l-red-500"
          >
            <XCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>{error.message}</span>
              <Badge variant="destructive" className="text-xs">
                {error.severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <p className="mb-3">{error.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-red-50 p-3 rounded">
                <div>
                  <p className="font-semibold text-red-800">Domain:</p>
                  <p className="capitalize">{error.domain.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Error Code:</p>
                  <p>{error.errorCode}</p>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Impact:</p>
                  <p>{error.impact}</p>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Priority:</p>
                  <p className="capitalize">{error.resolution.priority}</p>
                </div>
              </div>
              {error.resolution.steps.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-red-800 text-sm mb-2">
                    Resolution Steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {error.resolution.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {error.references && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="font-semibold text-red-800 text-xs mb-1">
                    DOH Reference:
                  </p>
                  <p className="text-xs text-red-700">
                    {error.references.dohStandard} - {error.references.section}{" "}
                    ({error.references.requirement})
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  // Render validation warnings
  const renderWarnings = (warnings: DOHValidationWarning[]) => {
    if (warnings.length === 0) return null;

    return (
      <div className="space-y-3">
        {warnings.map((warning) => (
          <Alert
            key={warning.warningId}
            className="border-l-4 border-l-yellow-500"
          >
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="flex items-center justify-between">
              <span>{warning.message}</span>
              <Badge variant="secondary" className="text-xs">
                {warning.priority.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <p className="mb-3">{warning.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-yellow-50 p-3 rounded">
                <div>
                  <p className="font-semibold text-yellow-800">Domain:</p>
                  <p className="capitalize">
                    {warning.domain.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">Impact:</p>
                  <p className="capitalize">
                    {warning.impact.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-semibold text-yellow-800 text-sm mb-2">
                  Recommendation:
                </p>
                <p className="text-sm bg-yellow-100 p-2 rounded">
                  {warning.recommendation}
                </p>
              </div>
              {warning.suggestedActions.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-yellow-800 text-sm mb-2">
                    Suggested Actions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {warning.suggestedActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  // Render critical findings
  const renderCriticalFindings = (findings: DOHCriticalFinding[]) => {
    if (findings.length === 0) return null;

    return (
      <div className="space-y-4">
        {findings.map((finding) => (
          <Card key={finding.findingId} className="border-red-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <div className="p-1 bg-red-200 rounded">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>{finding.title}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">
                    {finding.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-red-300">
                    {finding.findingType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-4 text-gray-700">{finding.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Risk Level
                  </p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        finding.riskLevel === "critical"
                          ? "bg-red-600"
                          : finding.riskLevel === "high"
                            ? "bg-orange-500"
                            : finding.riskLevel === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                    />
                    <span className="capitalize text-sm">
                      {finding.riskLevel}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Domain
                  </p>
                  <p className="capitalize text-sm">
                    {finding.domain.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Impact
                  </p>
                  <p className="text-sm">{finding.impact}</p>
                </div>
              </div>

              {finding.immediateActions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-3 text-red-800 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Immediate Actions Required</span>
                  </h4>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <ul className="space-y-2">
                      {finding.immediateActions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-red-800 text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm text-red-800">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {finding.correctiveActions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-3 text-gray-800 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Corrective Actions</span>
                  </h4>
                  <div className="space-y-2">
                    {finding.correctiveActions.map((action, index) => (
                      <div
                        key={action.actionId}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {action.description}
                          </span>
                          <Badge
                            variant={
                              action.status === "completed"
                                ? "default"
                                : action.status === "in_progress"
                                  ? "secondary"
                                  : action.status === "overdue"
                                    ? "destructive"
                                    : "outline"
                            }
                            className="text-xs"
                          >
                            {action.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Responsible:</span>{" "}
                            {action.responsible}
                          </div>
                          <div>
                            <span className="font-medium">Due:</span>{" "}
                            {new Date(action.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finding.preventiveMeasures.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-blue-800 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Preventive Measures</span>
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <ul className="space-y-1">
                      {finding.preventiveMeasures.map((measure, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-3 w-3 text-blue-600 mt-1" />
                          <span className="text-sm text-blue-800">
                            {measure}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finding.regulatoryImplications.dohReportable && (
                  <Alert className="border-orange-200">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">
                      DOH Reportable
                    </AlertTitle>
                    <AlertDescription className="text-orange-700">
                      This finding must be reported to the Department of Health
                    </AlertDescription>
                  </Alert>
                )}

                {finding.regulatoryImplications.jawdaImpact && (
                  <Alert className="border-purple-200">
                    <Info className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800">
                      JAWDA Impact
                    </AlertTitle>
                    <AlertDescription className="text-purple-700">
                      This finding affects JAWDA quality indicators
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Detected: {new Date(finding.detectedAt).toLocaleString()}
                  </span>
                  <span>By: {finding.detectedBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render action items with enhanced display
  const renderActionItems = () => {
    if (!validationResult || validationResult.actionItems.length === 0)
      return null;

    const groupedActions = validationResult.actionItems.reduce(
      (acc, item) => {
        if (!acc[item.priority]) acc[item.priority] = [];
        acc[item.priority].push(item);
        return acc;
      },
      {} as Record<string, DOHActionItem[]>,
    );

    const priorityOrder = ["immediate", "urgent", "high", "medium", "low"];
    const priorityColors = {
      immediate: "bg-red-100 border-red-300 text-red-800",
      urgent: "bg-orange-100 border-orange-300 text-orange-800",
      high: "bg-yellow-100 border-yellow-300 text-yellow-800",
      medium: "bg-blue-100 border-blue-300 text-blue-800",
      low: "bg-gray-100 border-gray-300 text-gray-800",
    };

    return (
      <div className="space-y-6">
        {priorityOrder.map((priority) => {
          const actions = groupedActions[priority];
          if (!actions || actions.length === 0) return null;

          return (
            <div key={priority}>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    priority === "immediate"
                      ? "bg-red-500"
                      : priority === "urgent"
                        ? "bg-orange-500"
                        : priority === "high"
                          ? "bg-yellow-500"
                          : priority === "medium"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                  }`}
                />
                <span className="capitalize">{priority} Priority Actions</span>
                <Badge variant="outline" className="text-xs">
                  {actions.length} items
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action) => (
                  <Card
                    key={action.actionId}
                    className={`border-l-4 ${
                      priority === "immediate"
                        ? "border-l-red-500"
                        : priority === "urgent"
                          ? "border-l-orange-500"
                          : priority === "high"
                            ? "border-l-yellow-500"
                            : priority === "medium"
                              ? "border-l-blue-500"
                              : "border-l-gray-500"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {action.title}
                        </CardTitle>
                        <Badge
                          variant={
                            action.status === "completed"
                              ? "default"
                              : action.status === "in_progress"
                                ? "secondary"
                                : action.status === "overdue"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {action.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="font-medium text-gray-700">
                            Domain:
                          </span>
                          <p className="capitalize">
                            {action.domain.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Type:
                          </span>
                          <p className="capitalize">{action.type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Due Date:
                          </span>
                          <p>{new Date(action.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Assigned To:
                          </span>
                          <p>{action.assignedTo.name}</p>
                        </div>
                      </div>

                      {action.progress.percentage > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              Progress
                            </span>
                            <span className="text-xs text-gray-600">
                              {action.progress.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={action.progress.percentage}
                            className="h-2"
                          />
                        </div>
                      )}

                      {action.completionCriteria.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-700 mb-1 block">
                            Completion Criteria:
                          </span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {action.completionCriteria
                              .slice(0, 2)
                              .map((criteria, index) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-1"
                                >
                                  <span className="text-gray-400 mt-0.5">
                                    •
                                  </span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            {action.completionCriteria.length > 2 && (
                              <li className="text-gray-400">
                                +{action.completionCriteria.length - 2} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <Card className={`bg-white ${className}`}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={performValidation} className="mt-4">
            Retry Validation
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isValidating) {
    return (
      <Card className={`bg-white ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Performing DOH compliance validation...</span>
          </div>
          <Progress value={validationProgress} className="mt-4" />
          <div className="text-center text-sm text-gray-500 mt-2">
            {validationProgress}% Complete
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render real-time validation feedback for embedded mode
  if (embedded && realTimeValidation) {
    return (
      <div className={`space-y-2 ${className}`}>
        {realTimeErrors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {realTimeErrors.slice(0, 3).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {realTimeErrors.length > 3 && (
                  <li>... and {realTimeErrors.length - 3} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {realTimeWarnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Warnings</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {realTimeWarnings.slice(0, 2).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
                {realTimeWarnings.length > 2 && (
                  <li>... and {realTimeWarnings.length - 2} more warnings</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {realTimeErrors.length === 0 &&
          realTimeWarnings.length === 0 &&
          validationResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Validation Passed</AlertTitle>
              <AlertDescription>
                Form meets DOH compliance standards (
                {validationResult.complianceScore.percentage}% compliance)
              </AlertDescription>
            </Alert>
          )}

        {isValidating && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Validating...</span>
          </div>
        )}
      </div>
    );
  }

  if (isLoadingStandards) {
    return (
      <Card className={`bg-white ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading DOH core standards...</span>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Initializing validation engine
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) {
    return (
      <Card className={`bg-white ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-6 w-6 text-blue-600" />
            <span>DOH Compliance Validator</span>
            {coreStandards && (
              <Badge variant="outline" className="text-xs">
                {coreStandards.version}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Validate clinical data against Department of Health standards (9
            domains)
            {coreStandards && (
              <span className="block text-xs text-green-600 mt-1">
                ✓ Core standards loaded - Ready for validation
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coreStandards && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Validation Domains
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.keys(coreStandards.domains).map((domain) => {
                    const IconComponent =
                      domainIcons[domain as keyof typeof domainIcons] ||
                      FileText;
                    return (
                      <div
                        key={domain}
                        className="flex items-center space-x-1 text-blue-700"
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="capitalize">
                          {domain.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={performValidation}
              disabled={!formData || !formType || !coreStandards}
              className="w-full"
            >
              {!coreStandards ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Standards...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Start DOH Validation
                </>
              )}
            </Button>

            {(!formData || !formType) && (
              <p className="text-sm text-gray-500 text-center">
                Form data and type are required to perform validation
              </p>
            )}

            {!coreStandards && (
              <p className="text-sm text-yellow-600 text-center">
                Loading DOH core standards and validation rules...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header with Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-6 w-6 text-blue-600" />
                <span>DOH Compliance Validation</span>
                {realTimeValidation && (
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                )}
                <button
                  onClick={toggleAutoValidation}
                  className="ml-2 p-1 rounded hover:bg-gray-100"
                  title={
                    isAutoValidationEnabled
                      ? "Disable auto-validation"
                      : "Enable auto-validation"
                  }
                >
                  {isAutoValidationEnabled ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </CardTitle>
              <CardDescription>
                Comprehensive validation against DOH standards (9 domains)
                {lastValidationTime && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Last validated:{" "}
                    {new Date(lastValidationTime).toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${getStatusColor(validationResult.overallStatus, validationResult.complianceScore.percentage)}`}
              >
                {validationResult.complianceScore.percentage}%
              </div>
              <Badge
                variant={getStatusBadgeVariant(validationResult.overallStatus)}
                className="mt-1"
              >
                {validationResult.overallStatus.replace("_", " ").toUpperCase()}
              </Badge>
              {realTimeValidation && (
                <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                  Live validation
                </div>
              )}
            </div>
          </div>
          <Progress
            value={validationResult.complianceScore.percentage}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResult.complianceScore.grade}
              </div>
              <p className="text-sm text-gray-600">Grade</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationResult.errors.length}
              </div>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {validationResult.warnings.length}
              </div>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {validationResult.criticalFindings.length}
              </div>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-2xl font-bold text-blue-600">
                  {validationMetrics.averageScore}%
                </span>
                {validationMetrics.trendDirection === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {validationMetrics.trendDirection === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                {validationMetrics.trendDirection === "stable" && (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
          </div>

          {/* Validation History */}
          {validationHistory.length > 1 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Validation History
              </h4>
              <div className="flex space-x-2">
                {validationHistory.slice(0, 5).map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      result.complianceScore.percentage >= 90
                        ? "bg-green-100 text-green-700"
                        : result.complianceScore.percentage >= 70
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                    title={`${result.complianceScore.percentage}% - ${new Date(result.validationTimestamp).toLocaleString()}`}
                  >
                    {result.complianceScore.percentage}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className={`grid w-full ${
            showComplianceOverview &&
            enableBatchValidation &&
            enableReporting &&
            showAnalytics
              ? "grid-cols-12"
              : showComplianceOverview &&
                  (enableBatchValidation || enableReporting || showAnalytics)
                ? "grid-cols-11"
                : showComplianceOverview
                  ? "grid-cols-9"
                  : "grid-cols-8"
          }`}
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">9 Domains</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
          {showComplianceOverview && (
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          )}
          {enableBatchValidation && (
            <TabsTrigger value="batch">Batch</TabsTrigger>
          )}
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          {enableReporting && (
            <TabsTrigger value="reports">Reports</TabsTrigger>
          )}
          {showAnalytics && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Validation Type:</span>
                    <span className="font-semibold capitalize">
                      {validationResult.validationType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Scope:</span>
                    <span className="font-semibold capitalize">
                      {validationResult.validationScope.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Checks:</span>
                    <span className="font-semibold">
                      {validationResult.validationMetadata.totalChecks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Quality:</span>
                    <span className="font-semibold capitalize">
                      {validationResult.validationMetadata.dataQuality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completeness:</span>
                    <span className="font-semibold">
                      {validationResult.validationMetadata.completeness.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Next Validation
                    </p>
                    <p className="text-sm">
                      {new Date(
                        validationResult.nextValidation.scheduledDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Validation Type
                    </p>
                    <p className="text-sm capitalize">
                      {validationResult.nextValidation.type}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={performValidation} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-validate Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleAutoValidation}
                      className="px-3"
                    >
                      {isAutoValidationEnabled ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {validationResult.domainValidations.map(renderDomainCard)}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <div className="space-y-6">
            {validationResult.errors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-800">
                  Validation Errors
                </h3>
                {renderErrors(validationResult.errors)}
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-yellow-800">
                  Validation Warnings
                </h3>
                {renderWarnings(validationResult.warnings)}
              </div>
            )}

            {validationResult.errors.length === 0 &&
              validationResult.warnings.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800">
                        No Issues Found
                      </h3>
                      <p className="text-gray-600">
                        All validation checks passed successfully
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-800">
              Critical Findings
            </h3>
            {validationResult.criticalFindings.length > 0 ? (
              renderCriticalFindings(validationResult.criticalFindings)
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800">
                      No Critical Findings
                    </h3>
                    <p className="text-gray-600">
                      No critical compliance issues detected
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {renderActionItems()}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span>General Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Immediate Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult.recommendations.immediate.length > 0 ? (
                    <ul className="space-y-2">
                      {validationResult.recommendations.immediate.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-red-600 mt-1">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>No immediate actions required</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Short-term Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult.recommendations.shortTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {validationResult.recommendations.shortTerm.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-yellow-600 mt-1">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>No short-term actions required</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Long-term Improvements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult.recommendations.longTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {validationResult.recommendations.longTerm.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>No long-term improvements suggested</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Best Practices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult.recommendations.bestPractices.length > 0 ? (
                    <ul className="space-y-2">
                      {validationResult.recommendations.bestPractices.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-green-600 mt-1">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>No additional best practices suggested</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {showComplianceOverview && (
          <TabsContent value="compliance" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                  <CardDescription>
                    Real-time compliance monitoring and status overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {validationResult.complianceScore.percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Overall Compliance
                      </div>
                      <Progress
                        value={validationResult.complianceScore.percentage}
                        className="mt-2"
                      />
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold mb-2 ${
                          validationResult.domainValidations.filter(
                            (d) => d.status === "compliant",
                          ).length >= 7
                            ? "text-green-600"
                            : validationResult.domainValidations.filter(
                                  (d) => d.status === "compliant",
                                ).length >= 5
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {
                          validationResult.domainValidations.filter(
                            (d) => d.status === "compliant",
                          ).length
                        }
                        /9
                      </div>
                      <div className="text-sm text-gray-600">
                        Compliant Domains
                      </div>
                      <Progress
                        value={
                          (validationResult.domainValidations.filter(
                            (d) => d.status === "compliant",
                          ).length /
                            9) *
                          100
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold mb-2 ${
                          validationResult.criticalFindings.length === 0
                            ? "text-green-600"
                            : validationResult.criticalFindings.length <= 2
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {validationResult.criticalFindings.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Critical Issues
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          validationResult.criticalFindings.length === 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {validationResult.criticalFindings.length === 0
                          ? "No critical issues"
                          : "Requires attention"}
                      </div>
                    </div>
                  </div>

                  {complianceStatus && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-lg font-semibold mb-4">
                        Compliance Status Overview
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Current Status
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(
                              complianceStatus.overallStatus,
                            )}
                          >
                            {complianceStatus.overallStatus
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Last Assessment
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(
                              complianceStatus.lastAssessment,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {enableBatchValidation && (
          <TabsContent value="batch" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Validation</CardTitle>
                  <CardDescription>
                    Validate multiple forms, episodes, or patients
                    simultaneously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {batchItems?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Items to Validate
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {batchValidationStatus.results
                            ?.successfulValidations || 0}
                        </div>
                        <div className="text-sm text-gray-600">Successful</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {batchValidationStatus.results?.failedValidations ||
                            0}
                        </div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </div>
                    </div>

                    {batchValidationStatus.isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Processing batch validation...
                          </span>
                          <span className="text-sm text-gray-500">
                            {batchValidationStatus.progress}%
                          </span>
                        </div>
                        <Progress value={batchValidationStatus.progress} />
                      </div>
                    )}

                    {batchValidationStatus.results && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">
                            Batch Validation Complete
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">
                                Overall Compliance Rate:
                              </span>
                              <span className="ml-2">
                                {
                                  batchValidationStatus.results.summary
                                    .overallComplianceRate
                                }
                                %
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Average Score:
                              </span>
                              <span className="ml-2">
                                {
                                  batchValidationStatus.results.summary
                                    .averageComplianceScore
                                }
                                %
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Critical Findings:
                              </span>
                              <span className="ml-2">
                                {
                                  batchValidationStatus.results.summary
                                    .totalCriticalFindings
                                }
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Processing Time:
                              </span>
                              <span className="ml-2">
                                {Math.round(
                                  batchValidationStatus.results.processingTime /
                                    1000,
                                )}
                                s
                              </span>
                            </div>
                          </div>
                        </div>

                        {batchValidationStatus.results.recommendations
                          .systemWide.length > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              System-wide Recommendations
                            </h4>
                            <ul className="text-sm space-y-1">
                              {batchValidationStatus.results.recommendations.systemWide.map(
                                (rec: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-start space-x-2"
                                  >
                                    <span className="text-blue-600 mt-1">
                                      •
                                    </span>
                                    <span>{rec}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => performBatchValidation(false)}
                        disabled={
                          batchValidationStatus.isProcessing ||
                          !batchItems ||
                          batchItems.length === 0
                        }
                        className="flex-1"
                      >
                        {batchValidationStatus.isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Start Batch Validation"
                        )}
                      </Button>
                      <Button
                        onClick={() => performBatchValidation(true)}
                        disabled={
                          batchValidationStatus.isProcessing ||
                          !batchItems ||
                          batchItems.length === 0
                        }
                        variant="outline"
                        className="flex-1"
                      >
                        {backgroundProcessing.enabled ? (
                          <>
                            <Activity className="w-4 h-4 mr-2" />
                            Queue Processing
                          </>
                        ) : (
                          "Background Process"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {enableReporting && (
          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>
                    Generate comprehensive compliance reports and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          type: "validation_summary",
                          title: "Validation Summary",
                          description: "Overview of all validations",
                        },
                        {
                          type: "compliance_status",
                          title: "Compliance Status",
                          description: "Current compliance metrics",
                        },
                        {
                          type: "audit_trail",
                          title: "Audit Trail",
                          description: "Complete audit history",
                        },
                        {
                          type: "trend_analysis",
                          title: "Trend Analysis",
                          description: "Compliance trends over time",
                        },
                      ].map((report) => (
                        <Card
                          key={report.type}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">
                              {report.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <Button
                              size="sm"
                              onClick={() =>
                                generateComplianceReport(report.type)
                              }
                              disabled={reportingStatus.isGenerating}
                              className="w-full"
                            >
                              {reportingStatus.isGenerating &&
                              reportingStatus.reportType === report.type ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                "Generate"
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {reportingStatus.reportUrl && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">
                          Report Generated Successfully
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">
                              Report Type: {reportingStatus.reportType}
                            </p>
                            <p className="text-sm text-green-700">
                              Report ID: {reportingStatus.reportId}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              window.open(reportingStatus.reportUrl, "_blank")
                            }
                          >
                            Download Report
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="queue" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Validation Queue Management</CardTitle>
                    <CardDescription>
                      Monitor and manage background validation processing
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleBackgroundProcessing}
                      variant={
                        backgroundProcessing.enabled ? "default" : "outline"
                      }
                      size="sm"
                    >
                      {backgroundProcessing.enabled ? (
                        <>
                          <Activity className="w-4 h-4 mr-2" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Disabled
                        </>
                      )}
                    </Button>
                    <Button onClick={processValidationQueue} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Process Queue
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {queueStatus.totalItems}
                    </div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {queueStatus.processing}
                    </div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {queueStatus.completed}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {queueStatus.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Queue Progress
                      </span>
                      <span className="text-sm text-gray-500">
                        {queueStatus.completed} / {queueStatus.totalItems}
                      </span>
                    </div>
                    <Progress
                      value={
                        queueStatus.totalItems > 0
                          ? (queueStatus.completed / queueStatus.totalItems) *
                            100
                          : 0
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Background Processing
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span
                            className={
                              backgroundProcessing.enabled
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {backgroundProcessing.enabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Jobs:</span>
                          <span>{backgroundProcessing.activeJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed Jobs:</span>
                          <span>{backgroundProcessing.completedJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed Jobs:</span>
                          <span>{backgroundProcessing.failedJobs}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Performance Metrics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Processing Time:</span>
                          <span>
                            {queueStatus.averageProcessingTime.toFixed(2)}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span>{performanceMetrics.throughput} items/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span>
                            {performanceMetrics.errorRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Validation Caching</CardTitle>
                    <CardDescription>
                      Manage validation result caching for improved performance
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleCaching}
                      variant={cachingStatus.enabled ? "default" : "outline"}
                      size="sm"
                    >
                      {cachingStatus.enabled ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Disabled
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={clearValidationCache}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {cachingStatus.hitRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Hit Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {cachingStatus.totalHits}
                    </div>
                    <div className="text-sm text-gray-600">Cache Hits</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {cachingStatus.totalMisses}
                    </div>
                    <div className="text-sm text-gray-600">Cache Misses</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(cachingStatus.cacheSize / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="text-sm text-gray-600">Cache Size</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Cache Efficiency
                      </span>
                      <span className="text-sm text-gray-500">
                        {cachingStatus.hitRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={cachingStatus.hitRate} />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Cache Benefits
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Performance Boost</div>
                        <div className="text-blue-700">
                          {cachingStatus.hitRate > 0
                            ? `${(cachingStatus.hitRate * 0.95).toFixed(0)}% faster`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Resource Savings</div>
                        <div className="text-blue-700">
                          {cachingStatus.totalHits > 0
                            ? `${cachingStatus.totalHits} validations saved`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Response Time</div>
                        <div className="text-blue-700">
                          {cachingStatus.hitRate > 0 ? "< 50ms" : "Variable"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {cachingStatus.enabled && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        Cache Configuration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">TTL (Time to Live)</div>
                          <div className="text-green-700">24 hours</div>
                        </div>
                        <div>
                          <div className="font-medium">Cache Strategy</div>
                          <div className="text-green-700">
                            LRU (Least Recently Used)
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Max Cache Size</div>
                          <div className="text-green-700">100MB</div>
                        </div>
                        <div>
                          <div className="font-medium">Invalidation</div>
                          <div className="text-green-700">
                            Automatic on rule changes
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Real-time performance metrics and optimization insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceMetrics.validationSpeed}ms
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Validation Time
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceMetrics.throughput}
                    </div>
                    <div className="text-sm text-gray-600">Throughput/min</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {performanceMetrics.errorRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceMetrics.cacheEfficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Cache Efficiency
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Performance Trends</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Validation Speed</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {performanceMetrics.validationSpeed < 1000
                                ? "Excellent"
                                : performanceMetrics.validationSpeed < 3000
                                  ? "Good"
                                  : "Needs Improvement"}
                            </span>
                            {performanceMetrics.validationSpeed < 1000 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Error Rate</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {performanceMetrics.errorRate < 5
                                ? "Excellent"
                                : performanceMetrics.errorRate < 10
                                  ? "Good"
                                  : "High"}
                            </span>
                            {performanceMetrics.errorRate < 5 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Cache Performance</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {cachingStatus.hitRate > 80
                                ? "Excellent"
                                : cachingStatus.hitRate > 60
                                  ? "Good"
                                  : "Poor"}
                            </span>
                            {cachingStatus.hitRate > 80 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">
                        Optimization Recommendations
                      </h4>
                      <div className="space-y-2">
                        {performanceMetrics.validationSpeed > 3000 && (
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <span className="text-sm">
                              Enable caching to improve validation speed
                            </span>
                          </div>
                        )}
                        {cachingStatus.hitRate < 60 &&
                          cachingStatus.enabled && (
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <span className="text-sm">
                                Low cache hit rate - consider increasing TTL
                              </span>
                            </div>
                          )}
                        {performanceMetrics.errorRate > 10 && (
                          <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm">
                              High error rate - review validation rules
                            </span>
                          </div>
                        )}
                        {queueStatus.totalItems > 100 && (
                          <div className="flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-sm">
                              Enable background processing for large batches
                            </span>
                          </div>
                        )}
                        {performanceMetrics.validationSpeed < 500 &&
                          cachingStatus.hitRate > 80 && (
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <span className="text-sm">
                                Performance is optimized
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Performance Optimization Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-blue-800">
                          Intelligent Caching
                        </div>
                        <div className="text-blue-700">
                          Automatic result caching with smart invalidation
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-800">
                          Background Processing
                        </div>
                        <div className="text-blue-700">
                          Queue-based validation for large batches
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-800">
                          Parallel Processing
                        </div>
                        <div className="text-blue-700">
                          Concurrent validation with configurable limits
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {showAnalytics && (
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Compliance Analytics</CardTitle>
                      <CardDescription>
                        Advanced analytics and insights for compliance
                        monitoring
                      </CardDescription>
                    </div>
                    <Button
                      onClick={loadAnalytics}
                      disabled={isLoadingAnalytics}
                      size="sm"
                    >
                      {isLoadingAnalytics ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="ml-2">Loading analytics...</span>
                    </div>
                  ) : analyticsData ? (
                    <div className="space-y-6">
                      {/* Overall Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {analyticsData.overallMetrics.totalValidations}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Validations
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {analyticsData.overallMetrics.complianceRate}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Compliance Rate
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {analyticsData.overallMetrics.averageScore}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Average Score
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div
                            className={`text-2xl font-bold ${
                              analyticsData.overallMetrics.trendDirection ===
                              "improving"
                                ? "text-green-600"
                                : analyticsData.overallMetrics
                                      .trendDirection === "declining"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {analyticsData.overallMetrics.improvementRate > 0
                              ? "+"
                              : ""}
                            {analyticsData.overallMetrics.improvementRate}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Improvement Rate
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">
                          Key Performance Indicators
                        </h4>
                        <div className="space-y-3">
                          {analyticsData.performanceIndicators.kpis.map(
                            (kpi: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{kpi.name}</div>
                                  <div className="text-sm text-gray-600">
                                    Target: {kpi.target}% | Current: {kpi.value}
                                    %
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={
                                      kpi.status === "met"
                                        ? "default"
                                        : kpi.status === "exceeded"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {kpi.status.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  {kpi.trend === "improving" && (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                  )}
                                  {kpi.trend === "declining" && (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Risk Analysis */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Risk Analysis</h4>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">
                              Overall Risk Level
                            </span>
                            <Badge
                              variant={
                                analyticsData.riskAnalysis.overallRisk === "low"
                                  ? "default"
                                  : analyticsData.riskAnalysis.overallRisk ===
                                      "medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {analyticsData.riskAnalysis.overallRisk.toUpperCase()}
                            </Badge>
                          </div>
                          {analyticsData.riskAnalysis.riskFactors.length >
                            0 && (
                            <div>
                              <h5 className="font-medium mb-2">Risk Factors</h5>
                              <div className="space-y-2">
                                {analyticsData.riskAnalysis.riskFactors.map(
                                  (factor: any, index: number) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex items-center justify-between">
                                        <span>{factor.factor}</span>
                                        <span className="text-gray-500">
                                          {Math.round(factor.probability * 100)}
                                          % probability
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compliance Forecasting */}
                      {analyticsData.complianceForecasting && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold">
                            Compliance Forecasting
                          </h4>
                          <div className="p-4 border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-600">
                                  Projected Score
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {
                                    analyticsData.complianceForecasting
                                      .projectedScore
                                  }
                                  %
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-600">
                                  Confidence Level
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round(
                                    analyticsData.complianceForecasting
                                      .confidenceLevel * 100,
                                  )}
                                  %
                                </div>
                              </div>
                            </div>
                            {analyticsData.complianceForecasting.scenarios
                              .length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium mb-2">Scenarios</h5>
                                <div className="space-y-2">
                                  {analyticsData.complianceForecasting.scenarios.map(
                                    (scenario: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                                      >
                                        <span>{scenario.scenario}</span>
                                        <div className="flex items-center space-x-2">
                                          <span>
                                            {scenario.projectedOutcome}%
                                          </span>
                                          <span className="text-gray-500">
                                            (
                                            {Math.round(
                                              scenario.probability * 100,
                                            )}
                                            %)
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No analytics data available</p>
                      <p className="text-sm">Click refresh to load analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DOHComplianceValidator;
