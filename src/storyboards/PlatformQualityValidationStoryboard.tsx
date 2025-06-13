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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Shield,
  Database,
  Settings,
  Users,
  FileText,
  TrendingUp,
  Zap,
  RefreshCw,
  Download,
  Eye,
  Clock,
  Target,
  Workflow,
  BarChart3,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import {
  PlatformQualityValidator,
  PlatformQualityReport,
} from "@/utils/platform-quality-validator";
import StoryboardLoader from "@/utils/storyboard-loader";

export default function PlatformQualityValidationStoryboard() {
  const [report, setReport] = useState<PlatformQualityReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastValidation, setLastValidation] = useState<string>("");
  const [validationHistory, setValidationHistory] = useState<
    PlatformQualityReport[]
  >([]);
  const [storyboardStatus, setStoryboardStatus] = useState<any>(null);

  // Run validation on component mount
  useEffect(() => {
    runValidation();
    loadStoryboardStatus();
  }, []);

  const loadStoryboardStatus = async () => {
    try {
      // Register storyboards from canvas info (this would normally come from props or context)
      const mockStoryboards = [
        { id: "1", name: "PatientManagement", type: "COMPONENT" },
        { id: "2", name: "ClinicalDocumentation", type: "COMPONENT" },
        { id: "3", name: "ComplianceChecker", type: "COMPONENT" },
        { id: "4", name: "DamanSubmission", type: "COMPONENT" },
        { id: "5", name: "DOHCompliance", type: "COMPONENT" },
        { id: "6", name: "QualityControl", type: "COMPONENT" },
      ];

      StoryboardLoader.registerStoryboards(mockStoryboards);
      const status = StoryboardLoader.getStoryboardStatus();
      const validation = StoryboardLoader.validateStoryboardImplementation();

      setStoryboardStatus({ ...status, validation });
    } catch (error) {
      console.error("Failed to load storyboard status:", error);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && !isValidating) {
      interval = setInterval(() => {
        runValidation();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isValidating]);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const validationReport = await PlatformQualityValidator.validatePlatform({
        strict_mode: true,
        auto_fix: true,
        include_warnings: true,
        compliance_frameworks: ["Daman", "DOH", "Tasneef", "ADHICS"],
        performance_thresholds: {
          response_time_ms: 2000,
          memory_usage_mb: 512,
          cpu_usage_percent: 80,
        },
      });

      setReport(validationReport);
      setLastValidation(new Date().toLocaleString());

      // Add to validation history
      setValidationHistory((prev) => {
        const newHistory = [validationReport, ...prev.slice(0, 9)]; // Keep last 10 reports
        return newHistory;
      });
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = PlatformQualityValidator.generateQualityReport(report);
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-quality-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const ValidationMetricCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    details,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    description: string;
    trend?: "up" | "down" | "stable";
    details?: string;
  }) => (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={`text-xs px-2 py-1 rounded ${
                trend === "up"
                  ? "bg-green-100 text-green-700"
                  : trend === "down"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
            </div>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          <span className={getScoreColor(value)}>{value}/100</span>
        </div>
        <Progress value={value} className="mb-2" />
        <p className="text-xs text-muted-foreground mb-1">{description}</p>
        {details && <p className="text-xs text-blue-600">{details}</p>}
      </CardContent>
    </Card>
  );

  const ValidationResultCard = ({
    title,
    passed,
    tested,
    passedCount,
    issues,
    score,
    icon: Icon,
  }: {
    title: string;
    passed: boolean;
    tested: number;
    passedCount: number;
    issues: string[];
    score?: number;
    icon?: React.ElementType;
  }) => (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {passed ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          {title}
          {score && (
            <Badge variant={getScoreBadgeVariant(score)} className="ml-auto">
              {score}/100
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {passedCount}/{tested} tests passed
          {score && ` • Score: ${score}/100`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress
          value={(passedCount / Math.max(tested, 1)) * 100}
          className="mb-4"
        />
        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Issues Found ({issues.length}):
            </h4>
            <ScrollArea className="h-32">
              {issues.slice(0, 5).map((issue, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground mb-1 p-2 bg-red-50 rounded"
                >
                  • {issue}
                </div>
              ))}
              {issues.length > 5 && (
                <div className="text-xs text-muted-foreground italic">
                  ...and {issues.length - 5} more issues
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SystematicFixesCard = ({ fixes }: { fixes: string[] }) => (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckSquare className="h-5 w-5" />
          Systematic Fixes Applied
        </CardTitle>
        <CardDescription className="text-green-700">
          {fixes.length} automatic fixes have been applied to resolve issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
          {fixes.map((fix, index) => (
            <div
              key={index}
              className="text-sm text-green-800 mb-2 p-2 bg-green-100 rounded flex items-start gap-2"
            >
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              {fix}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw
                className={`h-8 w-8 mx-auto mb-4 text-blue-600 ${isValidating ? "animate-spin" : ""}`}
              />
              <p className="text-lg font-medium">
                {isValidating
                  ? "Running Comprehensive Platform Validation..."
                  : "Loading Platform Quality Report..."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Validating practices, tools, APIs, workflows, and compliance
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Platform Quality Validation Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive assessment of platform robustness, compliance, and
              implementation quality
            </p>
            {lastValidation && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Last validation: {lastValidation}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Auto Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={runValidation} disabled={isValidating} size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
              />
              {isValidating ? "Validating..." : "Run Validation"}
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                <span>Overall Platform Quality Score</span>
              </div>
              <Badge
                variant={getScoreBadgeVariant(report.overall_score)}
                className="text-lg px-3 py-1"
              >
                {report.overall_score}/100
              </Badge>
            </CardTitle>
            <CardDescription>
              Generated on {new Date(report.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={report.overall_score} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.quality_metrics.code_quality)}`}
                >
                  {report.quality_metrics.code_quality}
                </div>
                <div className="text-sm text-gray-600">Code Quality</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.quality_metrics.security)}`}
                >
                  {report.quality_metrics.security}
                </div>
                <div className="text-sm text-gray-600">Security</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.quality_metrics.performance)}`}
                >
                  {report.quality_metrics.performance}
                </div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.quality_metrics.reliability)}`}
                >
                  {report.quality_metrics.reliability}
                </div>
                <div className="text-sm text-gray-600">Reliability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues Alert */}
        {report.critical_issues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Issues Detected</AlertTitle>
            <AlertDescription>
              {report.critical_issues.length} critical issues require immediate
              attention.
              <div className="mt-2 space-y-1">
                {report.critical_issues.map((issue, index) => (
                  <div key={index} className="text-sm">
                    • {issue}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Systematic Fixes Applied */}
        {report.systematic_fixes_applied.length > 0 && (
          <SystematicFixesCard fixes={report.systematic_fixes_applied} />
        )}

        {/* Enhanced Quality Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ValidationMetricCard
            title="Practice Implementation"
            value={report.quality_metrics.practice_implementation}
            icon={Users}
            description="Clinical and administrative practices"
            details={`ADHICS Score: ${report.validation_results.practice_implementation.adhics_compliance_score}/100`}
            trend="up"
          />
          <ValidationMetricCard
            title="Tools Effectiveness"
            value={report.quality_metrics.tools_effectiveness}
            icon={Settings}
            description="Platform tools and utilities"
            details={`${report.validation_results.tools_utilization.tools_functional}/${report.validation_results.tools_utilization.tools_tested} tools functional`}
            trend="stable"
          />
          <ValidationMetricCard
            title="Workflow Efficiency"
            value={report.quality_metrics.workflow_efficiency}
            icon={Workflow}
            description="Process integration and automation"
            details={`Automation: ${report.validation_results.workflow_integration.automation_score}%`}
            trend="up"
          />
          <ValidationMetricCard
            title="Maintainability"
            value={report.quality_metrics.maintainability}
            icon={FileText}
            description="Code structure and documentation"
            trend="stable"
          />
        </div>

        {/* Detailed Results Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validation">Core Validation</TabsTrigger>
            <TabsTrigger value="practices">Practices</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="storyboards">Storyboards</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ValidationResultCard
                title="JSON Validation"
                passed={report.validation_results.json_validation.passed}
                tested={1}
                passedCount={
                  report.validation_results.json_validation.passed ? 1 : 0
                }
                issues={
                  report.validation_results.json_validation.critical_errors
                }
                icon={Database}
              />
              <ValidationResultCard
                title="API Validation"
                passed={report.validation_results.api_validation.passed}
                tested={
                  report.validation_results.api_validation.endpoints_tested
                }
                passedCount={
                  report.validation_results.api_validation.endpoints_passed
                }
                issues={
                  report.validation_results.api_validation.failed_endpoints
                }
                icon={Zap}
              />
              <ValidationResultCard
                title="Component Validation"
                passed={report.validation_results.component_validation.passed}
                tested={
                  report.validation_results.component_validation
                    .components_tested
                }
                passedCount={
                  report.validation_results.component_validation
                    .components_passed
                }
                issues={
                  report.validation_results.component_validation.jsx_errors
                }
                icon={Settings}
              />
              <ValidationResultCard
                title="Integration Validation"
                passed={report.validation_results.integration_validation.passed}
                tested={
                  report.validation_results.integration_validation
                    .integrations_tested
                }
                passedCount={
                  report.validation_results.integration_validation
                    .integrations_passed
                }
                issues={
                  report.validation_results.integration_validation
                    .integration_issues
                }
                icon={Workflow}
              />
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    JSON/JSX Systematic Fixes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Issues Found:</span>
                      <Badge variant="outline">
                        {report.validation_results.json_validation.issues_found}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Issues Fixed:</span>
                      <Badge variant="default">
                        {report.validation_results.json_validation.issues_fixed}
                      </Badge>
                    </div>
                    <Separator />
                    {report.validation_results.json_validation.systematic_fixes
                      .length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">
                          Systematic Fixes Applied:
                        </h4>
                        <ScrollArea className="h-32">
                          {report.validation_results.json_validation.systematic_fixes.map(
                            (fix, index) => (
                              <div
                                key={index}
                                className="text-xs text-green-700 mb-1 p-2 bg-green-50 rounded"
                              >
                                ✓ {fix}
                              </div>
                            ),
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Component Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Components Tested:</span>
                      <Badge variant="outline">
                        {
                          report.validation_results.component_validation
                            .components_tested
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Components Passed:</span>
                      <Badge variant="default">
                        {
                          report.validation_results.component_validation
                            .components_passed
                        }
                      </Badge>
                    </div>
                    <Progress
                      value={
                        (report.validation_results.component_validation
                          .components_passed /
                          report.validation_results.component_validation
                            .components_tested) *
                        100
                      }
                      className="mt-2"
                    />
                    {report.validation_results.component_validation.jsx_fixes
                      .length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">
                          JSX Fixes Applied:
                        </h4>
                        <ScrollArea className="h-32">
                          {report.validation_results.component_validation.jsx_fixes
                            .slice(0, 3)
                            .map((fix, index) => (
                              <div
                                key={index}
                                className="text-xs text-blue-700 mb-1 p-2 bg-blue-50 rounded"
                              >
                                ✓ {fix}
                              </div>
                            ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="practices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ValidationResultCard
                title="Practice Implementation"
                passed={
                  report.validation_results.practice_implementation.passed
                }
                tested={
                  report.validation_results.practice_implementation
                    .practices_tested
                }
                passedCount={
                  report.validation_results.practice_implementation
                    .practices_implemented
                }
                issues={
                  report.validation_results.practice_implementation
                    .implementation_gaps
                }
                score={
                  report.validation_results.practice_implementation
                    .adhics_compliance_score
                }
                icon={Users}
              />
              <ValidationResultCard
                title="Tools Utilization"
                passed={report.validation_results.tools_utilization.passed}
                tested={
                  report.validation_results.tools_utilization.tools_tested
                }
                passedCount={
                  report.validation_results.tools_utilization.tools_functional
                }
                issues={report.validation_results.tools_utilization.tool_issues}
                score={
                  report.validation_results.tools_utilization
                    .effectiveness_score
                }
                icon={Settings}
              />
              <ValidationResultCard
                title="Workflow Integration"
                passed={report.validation_results.workflow_integration.passed}
                tested={
                  report.validation_results.workflow_integration
                    .workflows_tested
                }
                passedCount={
                  report.validation_results.workflow_integration
                    .workflows_integrated
                }
                issues={
                  report.validation_results.workflow_integration.workflow_issues
                }
                score={
                  report.validation_results.workflow_integration
                    .automation_score
                }
                icon={Workflow}
              />
              <ValidationResultCard
                title="DOH Ranking Compliance"
                passed={report.validation_results.doh_ranking_compliance.passed}
                tested={
                  report.validation_results.doh_ranking_compliance
                    .total_requirements
                }
                passedCount={
                  report.validation_results.doh_ranking_compliance
                    .requirements_met
                }
                issues={
                  report.validation_results.doh_ranking_compliance
                    .compliance_issues
                }
                score={
                  report.validation_results.doh_ranking_compliance.ranking_score
                }
                icon={Target}
              />
            </div>
          </TabsContent>

          <TabsContent value="storyboards" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Storyboard Implementation Status
                </CardTitle>
                <CardDescription>
                  Complete assessment of all platform storyboards and their
                  loading status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storyboardStatus ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {storyboardStatus.total}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Storyboards
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {storyboardStatus.loaded}
                        </div>
                        <div className="text-sm text-green-700">
                          Successfully Loaded
                        </div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">
                          {storyboardStatus.loading}
                        </div>
                        <div className="text-sm text-yellow-700">Loading</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">
                          {storyboardStatus.error}
                        </div>
                        <div className="text-sm text-red-700">Errors</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          Implementation Progress:
                        </span>
                        <Badge
                          variant={
                            storyboardStatus.validation.isComplete
                              ? "default"
                              : "secondary"
                          }
                        >
                          {storyboardStatus.validation.isComplete
                            ? "Complete"
                            : "Incomplete"}
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (storyboardStatus.loaded / storyboardStatus.total) *
                          100
                        }
                        className="mb-4"
                      />
                      <div className="text-sm text-muted-foreground">
                        Success Rate:{" "}
                        {(
                          (storyboardStatus.loaded / storyboardStatus.total) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>

                    {storyboardStatus.validation.errorStoryboards.length >
                      0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Storyboards with Errors:
                        </h4>
                        <ScrollArea className="h-32">
                          {storyboardStatus.validation.errorStoryboards.map(
                            (error: string, index: number) => (
                              <div
                                key={index}
                                className="text-sm text-red-700 mb-1 p-2 bg-red-50 rounded"
                              >
                                • {error}
                              </div>
                            ),
                          )}
                        </ScrollArea>
                      </div>
                    )}

                    {storyboardStatus.validation.missingStoryboards.length >
                      0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Missing Required Storyboards:
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {storyboardStatus.validation.missingStoryboards.map(
                            (missing: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="justify-center"
                              >
                                {missing}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">All Storyboards:</h4>
                      <ScrollArea className="h-64">
                        {storyboardStatus.storyboards.map(
                          (storyboard: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded mb-1"
                            >
                              <div className="flex items-center gap-2">
                                {storyboard.status === "loaded" ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : storyboard.status === "loading" ? (
                                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">
                                  {storyboard.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {storyboard.type}
                                </Badge>
                                <Badge
                                  variant={
                                    storyboard.status === "loaded"
                                      ? "default"
                                      : storyboard.status === "loading"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {storyboard.status}
                                </Badge>
                              </div>
                            </div>
                          ),
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
                    <p className="text-muted-foreground">
                      Loading storyboard status...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {report.validation_results.compliance_validation
                      .daman_compliant ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Daman Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      report.validation_results.compliance_validation
                        .daman_compliant
                        ? "default"
                        : "destructive"
                    }
                    className="w-full justify-center"
                  >
                    {report.validation_results.compliance_validation
                      .daman_compliant
                      ? "Compliant"
                      : "Non-Compliant"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {report.validation_results.compliance_validation
                      .doh_compliant ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    DOH Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      report.validation_results.compliance_validation
                        .doh_compliant
                        ? "default"
                        : "destructive"
                    }
                    className="w-full justify-center"
                  >
                    {report.validation_results.compliance_validation
                      .doh_compliant
                      ? "Compliant"
                      : "Non-Compliant"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {report.validation_results.compliance_validation
                      .tasneef_compliant ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Tasneef Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      report.validation_results.compliance_validation
                        .tasneef_compliant
                        ? "default"
                        : "destructive"
                    }
                    className="w-full justify-center"
                  >
                    {report.validation_results.compliance_validation
                      .tasneef_compliant
                      ? "Compliant"
                      : "Non-Compliant"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {report.validation_results.compliance_validation
                      .adhics_compliant ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    ADHICS V2 Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      report.validation_results.compliance_validation
                        .adhics_compliant
                        ? "default"
                        : "destructive"
                    }
                    className="w-full justify-center"
                  >
                    {report.validation_results.compliance_validation
                      .adhics_compliant
                      ? "Compliant"
                      : "Non-Compliant"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* DOH Ranking Details */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  DOH Ranking Compliance Details
                </CardTitle>
                <CardDescription>
                  Comprehensive assessment against DOH audit checklist
                  requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        report.validation_results.doh_ranking_compliance
                          .ranking_score
                      }
                      /100
                    </div>
                    <div className="text-sm text-blue-700">
                      DOH Ranking Score
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        report.validation_results.doh_ranking_compliance
                          .requirements_met
                      }
                    </div>
                    <div className="text-sm text-green-700">
                      Requirements Met
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-600">
                      {
                        report.validation_results.doh_ranking_compliance
                          .total_requirements
                      }
                    </div>
                    <div className="text-sm text-gray-700">
                      Total Requirements
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      Audit Readiness:
                    </span>
                    <Badge
                      variant={
                        report.validation_results.doh_ranking_compliance
                          .audit_readiness
                          ? "default"
                          : "secondary"
                      }
                    >
                      {report.validation_results.doh_ranking_compliance
                        .audit_readiness
                        ? "Ready"
                        : "Needs Improvement"}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      (report.validation_results.doh_ranking_compliance
                        .requirements_met /
                        report.validation_results.doh_ranking_compliance
                          .total_requirements) *
                      100
                    }
                    className="mb-4"
                  />
                </div>

                {report.validation_results.doh_ranking_compliance
                  .compliance_issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Compliance Issues:
                    </h4>
                    <ScrollArea className="h-40">
                      {report.validation_results.doh_ranking_compliance.compliance_issues
                        .slice(0, 10)
                        .map((issue, index) => (
                          <div
                            key={index}
                            className="text-sm text-orange-700 mb-1 p-2 bg-orange-50 rounded"
                          >
                            • {issue}
                          </div>
                        ))}
                      {report.validation_results.doh_ranking_compliance
                        .compliance_issues.length > 10 && (
                        <div className="text-xs text-muted-foreground italic mt-2">
                          ...and{" "}
                          {report.validation_results.doh_ranking_compliance
                            .compliance_issues.length - 10}{" "}
                          more issues
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storyboards" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Storyboards
                </CardTitle>
                <CardDescription>
                  View and manage storyboards for the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockStoryboards.map((storyboard, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded flex items-center gap-2"
                    >
                      <div className="text-sm font-medium">
                        {storyboard.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {storyboard.type}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Improvement Recommendations
                </CardTitle>
                <CardDescription>
                  {report.recommendations.length} actionable recommendations to
                  enhance platform quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {report.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 mb-4 p-3 bg-blue-50 rounded"
                    >
                      <Badge variant="outline" className="mt-0.5 text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Validation History
                </CardTitle>
                <CardDescription>
                  Track quality score trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationHistory.length > 0 ? (
                  <ScrollArea className="h-96">
                    {validationHistory.map((historyReport, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded mb-2"
                      >
                        <div>
                          <div className="font-medium">
                            {new Date(historyReport.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {historyReport.critical_issues.length} critical
                            issues
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={getScoreBadgeVariant(
                              historyReport.overall_score,
                            )}
                          >
                            {historyReport.overall_score}/100
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No validation history available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
