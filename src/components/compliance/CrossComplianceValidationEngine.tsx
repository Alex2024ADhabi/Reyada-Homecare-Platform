import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  GitMerge,
  Shield,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Eye,
  Settings,
  BarChart3,
  FileText,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";

interface CrossValidationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  sources: string[];
  validationFunction: (data: any) => Promise<CrossValidationResult>;
}

interface CrossValidationResult {
  passed: boolean;
  score: number;
  issues: CrossValidationIssue[];
  recommendations: string[];
  dataConsistency: {
    dohCompliant: boolean;
    damanCompliant: boolean;
    jawdaCompliant: boolean;
    crossSystemConsistency: number;
  };
}

interface CrossValidationIssue {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  sources: string[];
  field?: string;
  impactsCompliance: boolean;
  resolution: string;
}

interface ValidationMetrics {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  averageScore: number;
  dataConsistencyScore: number;
  crossSystemAlignment: number;
  lastValidationTime: string;
}

interface CrossComplianceValidationEngineProps {
  data?: any;
  onValidationComplete?: (result: CrossValidationResult) => void;
  className?: string;
  autoValidate?: boolean;
}

const CROSS_VALIDATION_RULES: CrossValidationRule[] = [
  {
    id: "cross-001",
    name: "Patient Data Consistency Validation",
    description:
      "Validates patient data consistency across DOH, DAMAN, and JAWDA systems",
    category: "Data Consistency",
    severity: "critical",
    sources: ["DOH", "DAMAN", "JAWDA"],
    validationFunction: async (data) => {
      const issues: CrossValidationIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Patient ID consistency check
      const patientIds = {
        doh: data.doh?.patientId,
        daman: data.daman?.memberId,
        jawda: data.jawda?.patientId,
      };

      if (!patientIds.doh || !patientIds.daman || !patientIds.jawda) {
        issues.push({
          id: "missing-patient-ids",
          severity: "critical",
          message: "Patient identifiers missing in one or more systems",
          sources: ["DOH", "DAMAN", "JAWDA"],
          field: "patientId",
          impactsCompliance: true,
          resolution:
            "Ensure patient is registered in all three compliance systems",
        });
        score -= 50;
      }

      // Demographics consistency
      const demographics = {
        doh: data.doh?.demographics,
        daman: data.daman?.memberDetails,
        jawda: data.jawda?.patientInfo,
      };

      if (demographics.doh && demographics.daman && demographics.jawda) {
        // Name consistency
        if (
          demographics.doh.name !== demographics.daman.name ||
          demographics.doh.name !== demographics.jawda.name
        ) {
          issues.push({
            id: "name-inconsistency",
            severity: "high",
            message: "Patient name inconsistent across systems",
            sources: ["DOH", "DAMAN", "JAWDA"],
            field: "name",
            impactsCompliance: true,
            resolution: "Standardize patient name across all systems",
          });
          score -= 25;
        }

        // Date of birth consistency
        if (
          demographics.doh.dateOfBirth !== demographics.daman.dateOfBirth ||
          demographics.doh.dateOfBirth !== demographics.jawda.dateOfBirth
        ) {
          issues.push({
            id: "dob-inconsistency",
            severity: "high",
            message: "Date of birth inconsistent across systems",
            sources: ["DOH", "DAMAN", "JAWDA"],
            field: "dateOfBirth",
            impactsCompliance: true,
            resolution: "Verify and update date of birth in all systems",
          });
          score -= 25;
        }

        // Emirates ID consistency
        if (
          demographics.doh.emiratesId !== demographics.daman.emiratesId ||
          demographics.doh.emiratesId !== demographics.jawda.emiratesId
        ) {
          issues.push({
            id: "emirates-id-inconsistency",
            severity: "critical",
            message: "Emirates ID inconsistent across systems",
            sources: ["DOH", "DAMAN", "JAWDA"],
            field: "emiratesId",
            impactsCompliance: true,
            resolution:
              "Validate and synchronize Emirates ID across all systems",
          });
          score -= 40;
        }
      }

      if (score < 100) {
        recommendations.push(
          "Implement automated data synchronization across systems",
        );
        recommendations.push(
          "Establish master data management for patient information",
        );
        recommendations.push(
          "Create data validation rules for cross-system consistency",
        );
      }

      return {
        passed: issues.filter((i) => i.severity === "critical").length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        dataConsistency: {
          dohCompliant: demographics.doh ? true : false,
          damanCompliant: demographics.daman ? true : false,
          jawdaCompliant: demographics.jawda ? true : false,
          crossSystemConsistency: score,
        },
      };
    },
  },
  {
    id: "cross-002",
    name: "Service Authorization Cross-Validation",
    description:
      "Validates service authorizations across DOH clinical requirements and DAMAN coverage",
    category: "Authorization Alignment",
    severity: "critical",
    sources: ["DOH", "DAMAN"],
    validationFunction: async (data) => {
      const issues: CrossValidationIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const dohServices = data.doh?.authorizedServices || [];
      const damanServices = data.daman?.approvedServices || [];

      // Service code alignment
      const dohServiceCodes = dohServices.map((s: any) => s.serviceCode);
      const damanServiceCodes = damanServices.map((s: any) => s.serviceCode);

      const misalignedServices = dohServiceCodes.filter(
        (code: string) => !damanServiceCodes.includes(code),
      );

      if (misalignedServices.length > 0) {
        issues.push({
          id: "service-code-misalignment",
          severity: "critical",
          message: `${misalignedServices.length} DOH authorized services not covered by DAMAN: ${misalignedServices.join(", ")}`,
          sources: ["DOH", "DAMAN"],
          field: "serviceCodes",
          impactsCompliance: true,
          resolution:
            "Align service authorizations between DOH clinical requirements and DAMAN coverage",
        });
        score -= 30;
      }

      // Duration alignment
      dohServices.forEach((dohService: any) => {
        const matchingDamanService = damanServices.find(
          (ds: any) => ds.serviceCode === dohService.serviceCode,
        );

        if (
          matchingDamanService &&
          dohService.duration !== matchingDamanService.duration
        ) {
          issues.push({
            id: `duration-mismatch-${dohService.serviceCode}`,
            severity: "high",
            message: `Service duration mismatch for ${dohService.serviceCode}: DOH (${dohService.duration}) vs DAMAN (${matchingDamanService.duration})`,
            sources: ["DOH", "DAMAN"],
            field: "serviceDuration",
            impactsCompliance: true,
            resolution:
              "Reconcile service duration between DOH clinical plan and DAMAN authorization",
          });
          score -= 15;
        }
      });

      // Frequency alignment
      dohServices.forEach((dohService: any) => {
        const matchingDamanService = damanServices.find(
          (ds: any) => ds.serviceCode === dohService.serviceCode,
        );

        if (
          matchingDamanService &&
          dohService.frequency !== matchingDamanService.frequency
        ) {
          issues.push({
            id: `frequency-mismatch-${dohService.serviceCode}`,
            severity: "medium",
            message: `Service frequency mismatch for ${dohService.serviceCode}: DOH (${dohService.frequency}) vs DAMAN (${matchingDamanService.frequency})`,
            sources: ["DOH", "DAMAN"],
            field: "serviceFrequency",
            impactsCompliance: false,
            resolution:
              "Align service frequency between clinical requirements and insurance authorization",
          });
          score -= 10;
        }
      });

      if (score < 100) {
        recommendations.push(
          "Implement real-time service authorization validation",
        );
        recommendations.push(
          "Create unified service catalog across DOH and DAMAN systems",
        );
        recommendations.push(
          "Establish automated alerts for authorization misalignments",
        );
      }

      return {
        passed: issues.filter((i) => i.severity === "critical").length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        dataConsistency: {
          dohCompliant: dohServices.length > 0,
          damanCompliant: damanServices.length > 0,
          jawdaCompliant: true, // JAWDA doesn't directly handle service authorizations
          crossSystemConsistency: score,
        },
      };
    },
  },
  {
    id: "cross-003",
    name: "Quality Metrics Cross-Validation",
    description:
      "Validates quality metrics consistency between DOH standards and JAWDA KPIs",
    category: "Quality Alignment",
    severity: "high",
    sources: ["DOH", "JAWDA"],
    validationFunction: async (data) => {
      const issues: CrossValidationIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const dohMetrics = data.doh?.qualityMetrics || {};
      const jawdaMetrics = data.jawda?.kpiMetrics || {};

      // Patient safety metrics alignment
      if (dohMetrics.patientSafetyScore && jawdaMetrics.patientSafetyKPI) {
        const scoreDifference = Math.abs(
          dohMetrics.patientSafetyScore - jawdaMetrics.patientSafetyKPI,
        );

        if (scoreDifference > 10) {
          issues.push({
            id: "patient-safety-score-mismatch",
            severity: "high",
            message: `Patient safety scores differ significantly: DOH (${dohMetrics.patientSafetyScore}) vs JAWDA (${jawdaMetrics.patientSafetyKPI})`,
            sources: ["DOH", "JAWDA"],
            field: "patientSafetyScore",
            impactsCompliance: true,
            resolution:
              "Reconcile patient safety scoring methodologies between DOH and JAWDA",
          });
          score -= 20;
        }
      }

      // Clinical outcome metrics
      if (dohMetrics.clinicalOutcomes && jawdaMetrics.outcomeIndicators) {
        const dohOutcomes = Object.keys(dohMetrics.clinicalOutcomes);
        const jawdaOutcomes = Object.keys(jawdaMetrics.outcomeIndicators);

        const missingInJawda = dohOutcomes.filter(
          (outcome) => !jawdaOutcomes.includes(outcome),
        );

        if (missingInJawda.length > 0) {
          issues.push({
            id: "missing-outcome-metrics",
            severity: "medium",
            message: `${missingInJawda.length} DOH clinical outcomes not tracked in JAWDA: ${missingInJawda.join(", ")}`,
            sources: ["DOH", "JAWDA"],
            field: "clinicalOutcomes",
            impactsCompliance: false,
            resolution:
              "Align clinical outcome tracking between DOH standards and JAWDA KPIs",
          });
          score -= 15;
        }
      }

      // Training compliance metrics
      if (dohMetrics.trainingCompliance && jawdaMetrics.trainingKPI) {
        if (dohMetrics.trainingCompliance !== jawdaMetrics.trainingKPI) {
          issues.push({
            id: "training-compliance-mismatch",
            severity: "medium",
            message: `Training compliance metrics differ: DOH (${dohMetrics.trainingCompliance}%) vs JAWDA (${jawdaMetrics.trainingKPI}%)`,
            sources: ["DOH", "JAWDA"],
            field: "trainingCompliance",
            impactsCompliance: false,
            resolution:
              "Standardize training compliance reporting across DOH and JAWDA systems",
          });
          score -= 10;
        }
      }

      if (score < 100) {
        recommendations.push("Establish unified quality metrics framework");
        recommendations.push(
          "Implement automated quality data synchronization",
        );
        recommendations.push(
          "Create cross-system quality dashboards for real-time monitoring",
        );
      }

      return {
        passed: issues.filter((i) => i.severity === "critical").length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        dataConsistency: {
          dohCompliant: Object.keys(dohMetrics).length > 0,
          damanCompliant: true, // DAMAN doesn't directly handle quality metrics
          jawdaCompliant: Object.keys(jawdaMetrics).length > 0,
          crossSystemConsistency: score,
        },
      };
    },
  },
  {
    id: "cross-004",
    name: "Documentation Standards Cross-Validation",
    description:
      "Validates documentation standards compliance across all three systems",
    category: "Documentation Alignment",
    severity: "high",
    sources: ["DOH", "DAMAN", "JAWDA"],
    validationFunction: async (data) => {
      const issues: CrossValidationIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const dohDocs = data.doh?.requiredDocuments || [];
      const damanDocs = data.daman?.submittedDocuments || [];
      const jawdaDocs = data.jawda?.qualityDocuments || [];

      // Required document completeness
      const allRequiredDocs = [
        "9-Domain Assessment",
        "Clinical Justification",
        "Treatment Plan",
        "Progress Notes",
        "Medication List",
      ];

      allRequiredDocs.forEach((docType) => {
        const inDoh = dohDocs.some((doc: any) => doc.type === docType);
        const inDaman = damanDocs.some((doc: any) => doc.type === docType);
        const inJawda = jawdaDocs.some((doc: any) => doc.type === docType);

        if (!inDoh || !inDaman || !inJawda) {
          const missingSystems = [];
          if (!inDoh) missingSystems.push("DOH");
          if (!inDaman) missingSystems.push("DAMAN");
          if (!inJawda) missingSystems.push("JAWDA");

          issues.push({
            id: `missing-document-${docType.toLowerCase().replace(/\s+/g, "-")}`,
            severity: "high",
            message: `${docType} missing in ${missingSystems.join(", ")} system(s)`,
            sources: missingSystems,
            field: "requiredDocuments",
            impactsCompliance: true,
            resolution: `Ensure ${docType} is properly documented and submitted to all systems`,
          });
          score -= 15;
        }
      });

      // Document version consistency
      const commonDocs = dohDocs.filter(
        (dohDoc: any) =>
          damanDocs.some((damanDoc: any) => damanDoc.type === dohDoc.type) &&
          jawdaDocs.some((jawdaDoc: any) => jawdaDoc.type === dohDoc.type),
      );

      commonDocs.forEach((doc: any) => {
        const damanDoc = damanDocs.find((d: any) => d.type === doc.type);
        const jawdaDoc = jawdaDocs.find((d: any) => d.type === doc.type);

        if (
          doc.version !== damanDoc?.version ||
          doc.version !== jawdaDoc?.version
        ) {
          issues.push({
            id: `version-mismatch-${doc.type.toLowerCase().replace(/\s+/g, "-")}`,
            severity: "medium",
            message: `Document version mismatch for ${doc.type}: DOH (v${doc.version}), DAMAN (v${damanDoc?.version}), JAWDA (v${jawdaDoc?.version})`,
            sources: ["DOH", "DAMAN", "JAWDA"],
            field: "documentVersion",
            impactsCompliance: false,
            resolution: "Synchronize document versions across all systems",
          });
          score -= 10;
        }
      });

      if (score < 100) {
        recommendations.push(
          "Implement centralized document management system",
        );
        recommendations.push("Establish automated document synchronization");
        recommendations.push(
          "Create unified document templates across all systems",
        );
        recommendations.push(
          "Implement version control for cross-system documents",
        );
      }

      return {
        passed: issues.filter((i) => i.severity === "critical").length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        dataConsistency: {
          dohCompliant: dohDocs.length > 0,
          damanCompliant: damanDocs.length > 0,
          jawdaCompliant: jawdaDocs.length > 0,
          crossSystemConsistency: score,
        },
      };
    },
  },
  {
    id: "cross-005",
    name: "Reporting Timeline Cross-Validation",
    description:
      "Validates reporting timelines and submission schedules across all systems",
    category: "Timeline Alignment",
    severity: "medium",
    sources: ["DOH", "DAMAN", "JAWDA"],
    validationFunction: async (data) => {
      const issues: CrossValidationIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const dohTimelines = data.doh?.reportingTimelines || {};
      const damanTimelines = data.daman?.submissionSchedule || {};
      const jawdaTimelines = data.jawda?.reportingSchedule || {};

      // Monthly reporting alignment
      const monthlyReports = [
        "Clinical Summary",
        "Quality Metrics",
        "Patient Outcomes",
      ];

      monthlyReports.forEach((reportType) => {
        const dohDeadline = dohTimelines[reportType]?.deadline;
        const damanDeadline = damanTimelines[reportType]?.deadline;
        const jawdaDeadline = jawdaTimelines[reportType]?.deadline;

        if (dohDeadline && damanDeadline && jawdaDeadline) {
          const deadlines = [dohDeadline, damanDeadline, jawdaDeadline];
          const uniqueDeadlines = [...new Set(deadlines)];

          if (uniqueDeadlines.length > 1) {
            issues.push({
              id: `timeline-mismatch-${reportType.toLowerCase().replace(/\s+/g, "-")}`,
              severity: "medium",
              message: `${reportType} reporting deadlines differ: DOH (${dohDeadline}), DAMAN (${damanDeadline}), JAWDA (${jawdaDeadline})`,
              sources: ["DOH", "DAMAN", "JAWDA"],
              field: "reportingDeadlines",
              impactsCompliance: false,
              resolution:
                "Align reporting deadlines across all systems or establish master calendar",
            });
            score -= 10;
          }
        }
      });

      // Submission frequency alignment
      const frequencies = {
        doh: dohTimelines.frequency,
        daman: damanTimelines.frequency,
        jawda: jawdaTimelines.frequency,
      };

      const uniqueFrequencies = [
        ...new Set(Object.values(frequencies).filter(Boolean)),
      ];
      if (uniqueFrequencies.length > 1) {
        issues.push({
          id: "frequency-mismatch",
          severity: "low",
          message: `Reporting frequencies differ across systems: ${Object.entries(
            frequencies,
          )
            .filter(([_, freq]) => freq)
            .map(([system, freq]) => `${system.toUpperCase()} (${freq})`)
            .join(", ")}`,
          sources: ["DOH", "DAMAN", "JAWDA"],
          field: "reportingFrequency",
          impactsCompliance: false,
          resolution:
            "Standardize reporting frequencies or create unified reporting schedule",
        });
        score -= 5;
      }

      if (score < 100) {
        recommendations.push(
          "Create unified reporting calendar across all systems",
        );
        recommendations.push("Implement automated deadline reminders");
        recommendations.push(
          "Establish master reporting schedule with system-specific requirements",
        );
      }

      return {
        passed: issues.filter((i) => i.severity === "critical").length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        dataConsistency: {
          dohCompliant: Object.keys(dohTimelines).length > 0,
          damanCompliant: Object.keys(damanTimelines).length > 0,
          jawdaCompliant: Object.keys(jawdaTimelines).length > 0,
          crossSystemConsistency: score,
        },
      };
    },
  },
];

export default function CrossComplianceValidationEngine({
  data = {},
  onValidationComplete,
  className,
  autoValidate = false,
}: CrossComplianceValidationEngineProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<CrossValidationResult | null>(null);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  useEffect(() => {
    if (autoValidate && data && Object.keys(data).length > 0) {
      runCrossValidation();
    }
  }, [data, autoValidate]);

  const runCrossValidation = useCallback(async () => {
    setIsValidating(true);

    try {
      const results: CrossValidationResult[] = [];

      // Run all cross-validation rules
      for (const rule of CROSS_VALIDATION_RULES) {
        try {
          const result = await rule.validationFunction(data);
          results.push(result);
        } catch (error) {
          console.error(`Cross-validation rule ${rule.id} failed:`, error);
          results.push({
            passed: false,
            score: 0,
            issues: [
              {
                id: `rule-error-${rule.id}`,
                severity: "critical",
                message: `Cross-validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                sources: rule.sources,
                impactsCompliance: true,
                resolution:
                  "Contact system administrator to resolve validation error",
              },
            ],
            recommendations: [],
            dataConsistency: {
              dohCompliant: false,
              damanCompliant: false,
              jawdaCompliant: false,
              crossSystemConsistency: 0,
            },
          });
        }
      }

      // Aggregate results
      const allIssues: CrossValidationIssue[] = [];
      const allRecommendations: string[] = [];
      let totalScore = 0;
      let dohCompliantCount = 0;
      let damanCompliantCount = 0;
      let jawdaCompliantCount = 0;
      let totalConsistency = 0;

      results.forEach((result) => {
        allIssues.push(...result.issues);
        allRecommendations.push(...result.recommendations);
        totalScore += result.score;
        if (result.dataConsistency.dohCompliant) dohCompliantCount++;
        if (result.dataConsistency.damanCompliant) damanCompliantCount++;
        if (result.dataConsistency.jawdaCompliant) jawdaCompliantCount++;
        totalConsistency += result.dataConsistency.crossSystemConsistency;
      });

      const averageScore = results.length > 0 ? totalScore / results.length : 0;
      const criticalIssues = allIssues.filter(
        (issue) => issue.severity === "critical",
      );
      const overallPassed = criticalIssues.length === 0;

      const finalResult: CrossValidationResult = {
        passed: overallPassed,
        score: Math.round(averageScore),
        issues: allIssues,
        recommendations: [...new Set(allRecommendations)],
        dataConsistency: {
          dohCompliant: dohCompliantCount / results.length >= 0.8,
          damanCompliant: damanCompliantCount / results.length >= 0.8,
          jawdaCompliant: jawdaCompliantCount / results.length >= 0.8,
          crossSystemConsistency: Math.round(totalConsistency / results.length),
        },
      };

      setValidationResult(finalResult);
      setLastValidation(new Date());

      // Update metrics
      const newMetrics: ValidationMetrics = {
        totalValidations: results.length,
        passedValidations: results.filter((r) => r.passed).length,
        failedValidations: results.filter((r) => !r.passed).length,
        averageScore: averageScore,
        dataConsistencyScore:
          finalResult.dataConsistency.crossSystemConsistency,
        crossSystemAlignment: Math.round(
          ((dohCompliantCount + damanCompliantCount + jawdaCompliantCount) /
            (results.length * 3)) *
            100,
        ),
        lastValidationTime: new Date().toISOString(),
      };
      setMetrics(newMetrics);

      if (onValidationComplete) {
        onValidationComplete(finalResult);
      }
    } catch (error) {
      console.error("Cross-validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  }, [data, onValidationComplete]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const exportValidationReport = async () => {
    if (!validationResult || !metrics) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      reportType: "cross_compliance_validation",
      version: "1.0",
      validationResult,
      metrics,
      summary: {
        overallScore: validationResult.score,
        totalIssues: validationResult.issues.length,
        criticalIssues: validationResult.issues.filter(
          (i) => i.severity === "critical",
        ).length,
        systemAlignment: metrics.crossSystemAlignment,
        dataConsistency: validationResult.dataConsistency,
      },
      recommendations: validationResult.recommendations,
      rulesExecuted: CROSS_VALIDATION_RULES.map((rule) => ({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        sources: rule.sources,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cross-compliance-validation-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!validationResult && !isValidating) {
    return (
      <div className={`bg-white p-6 ${className}`}>
        <div className="text-center">
          <GitMerge className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cross-Compliance Validation Engine
          </h3>
          <p className="text-gray-600 mb-4">
            Validate data consistency and compliance alignment across DOH,
            DAMAN, and JAWDA systems
          </p>
          <Button onClick={runCrossValidation} className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Run Cross-Validation
          </Button>
        </div>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className={`bg-white p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Running cross-compliance validation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <GitMerge className="h-6 w-6 mr-2 text-blue-600" />
            Cross-Compliance Validation Engine
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time validation and alignment across DOH, DAMAN, and JAWDA
            compliance frameworks
          </p>
          {lastValidation && (
            <p className="text-sm text-gray-500 mt-1">
              Last validation: {lastValidation.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {validationResult && (
            <Badge
              className={
                validationResult.passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {validationResult.passed ? "ALIGNED" : "MISALIGNED"}
            </Badge>
          )}
          <Button variant="outline" onClick={exportValidationReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={runCrossValidation} disabled={isValidating}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
            />
            Re-validate
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {validationResult && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Overall Score
                  </p>
                  <p
                    className={`text-3xl font-bold ${getScoreColor(validationResult.score)}`}
                  >
                    {validationResult.score}%
                  </p>
                  <Progress
                    value={validationResult.score}
                    className="mt-2 h-2"
                  />
                </div>
                <BarChart3 className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    System Alignment
                  </p>
                  <p
                    className={`text-3xl font-bold ${getScoreColor(metrics.crossSystemAlignment)}`}
                  >
                    {metrics.crossSystemAlignment}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Cross-System Sync
                  </p>
                </div>
                <Target className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Data Consistency
                  </p>
                  <p
                    className={`text-3xl font-bold ${getScoreColor(validationResult.dataConsistency.crossSystemConsistency)}`}
                  >
                    {validationResult.dataConsistency.crossSystemConsistency}%
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Field Alignment
                  </p>
                </div>
                <Database className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Active Issues
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {validationResult.issues.length}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {
                      validationResult.issues.filter(
                        (i) => i.severity === "critical",
                      ).length
                    }{" "}
                    Critical
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="consistency">Data Consistency</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">DOH Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {validationResult?.dataConsistency.dohCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={
                          validationResult?.dataConsistency.dohCompliant
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {validationResult?.dataConsistency.dohCompliant
                          ? "Compliant"
                          : "Non-Compliant"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">DAMAN Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {validationResult?.dataConsistency.damanCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={
                          validationResult?.dataConsistency.damanCompliant
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {validationResult?.dataConsistency.damanCompliant
                          ? "Compliant"
                          : "Non-Compliant"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">JAWDA Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {validationResult?.dataConsistency.jawdaCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={
                          validationResult?.dataConsistency.jawdaCompliant
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {validationResult?.dataConsistency.jawdaCompliant
                          ? "Compliant"
                          : "Non-Compliant"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Validations
                      </span>
                      <span className="text-lg font-bold">
                        {metrics.totalValidations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Passed Validations
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {metrics.passedValidations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Failed Validations
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {metrics.failedValidations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Score</span>
                      <span
                        className={`text-lg font-bold ${getScoreColor(metrics.averageScore)}`}
                      >
                        {metrics.averageScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Validation Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult?.issues.length === 0 ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    No Issues Found
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    All cross-compliance validations passed successfully.
                    Systems are properly aligned.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {validationResult?.issues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(issue.severity)}
                            <span className="font-medium">{issue.message}</span>
                          </div>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Sources:</strong> {issue.sources.join(", ")}
                          </p>
                          {issue.field && (
                            <p>
                              <strong>Field:</strong> {issue.field}
                            </p>
                          )}
                          <p>
                            <strong>Resolution:</strong> {issue.resolution}
                          </p>
                          {issue.impactsCompliance && (
                            <Badge
                              variant="outline"
                              className="text-xs text-red-600"
                            >
                              Impacts Compliance
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  DOH System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${validationResult?.dataConsistency.dohCompliant ? "text-green-600" : "text-red-600"}`}
                  >
                    {validationResult?.dataConsistency.dohCompliant ? "✓" : "✗"}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {validationResult?.dataConsistency.dohCompliant
                      ? "Data Consistent"
                      : "Issues Found"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  DAMAN System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${validationResult?.dataConsistency.damanCompliant ? "text-green-600" : "text-red-600"}`}
                  >
                    {validationResult?.dataConsistency.damanCompliant
                      ? "✓"
                      : "✗"}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {validationResult?.dataConsistency.damanCompliant
                      ? "Data Consistent"
                      : "Issues Found"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  JAWDA System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${validationResult?.dataConsistency.jawdaCompliant ? "text-green-600" : "text-red-600"}`}
                  >
                    {validationResult?.dataConsistency.jawdaCompliant
                      ? "✓"
                      : "✗"}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {validationResult?.dataConsistency.jawdaCompliant
                      ? "Data Consistent"
                      : "Issues Found"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult?.recommendations.length === 0 ? (
                <p className="text-gray-600">
                  No recommendations at this time. All systems are properly
                  aligned.
                </p>
              ) : (
                <ul className="space-y-3">
                  {validationResult?.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CROSS_VALIDATION_RULES.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <GitMerge className="h-4 w-4 mr-2" />
                    {rule.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2">
                    {rule.description}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {rule.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rule.sources.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
