/**
 * Comprehensive Testing Dashboard
 * Real-time testing dashboard with healthcare compliance monitoring
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Shield,
  FileText,
  BarChart3,
  Clock,
  Users,
  Database,
  Zap,
} from "lucide-react";

interface TestExecutionStatus {
  isRunning: boolean;
  currentSuite?: string;
  progress: number;
  startTime?: number;
  estimatedCompletion?: number;
}

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    averageDuration: number;
    slowestTest: { name: string; duration: number };
    fastestTest: { name: string; duration: number };
  };
}

interface ComplianceStatus {
  doh: { passed: boolean; score: number; issues: string[] };
  daman: { passed: boolean; score: number; issues: string[] };
  jawda: { passed: boolean; score: number; issues: string[] };
  hipaa: { passed: boolean; score: number; issues: string[] };
  overall: boolean;
}

interface QualityGateStatus {
  id: string;
  name: string;
  passed: boolean;
  criteria: {
    metric: string;
    threshold: number;
    actual: number;
    passed: boolean;
  }[];
}

const ComprehensiveTestingDashboard: React.FC = () => {
  const [executionStatus, setExecutionStatus] = useState<TestExecutionStatus>({
    isRunning: false,
    progress: 0,
  });

  const [testMetrics, setTestMetrics] = useState<TestMetrics>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    coverage: { lines: 0, functions: 0, branches: 0, statements: 0 },
    performance: {
      averageDuration: 0,
      slowestTest: { name: "", duration: 0 },
      fastestTest: { name: "", duration: 0 },
    },
  });

  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    doh: { passed: false, score: 0, issues: [] },
    daman: { passed: false, score: 0, issues: [] },
    jawda: { passed: false, score: 0, issues: [] },
    hipaa: { passed: false, score: 0, issues: [] },
    overall: false,
  });

  const [qualityGates, setQualityGates] = useState<QualityGateStatus[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    setTestMetrics({
      totalTests: 156,
      passedTests: 142,
      failedTests: 8,
      skippedTests: 6,
      coverage: { lines: 85, functions: 82, branches: 78, statements: 84 },
      performance: {
        averageDuration: 245,
        slowestTest: {
          name: "DOH Compliance Integration Test",
          duration: 1250,
        },
        fastestTest: { name: "Unit Test - Patient Validation", duration: 15 },
      },
    });

    setComplianceStatus({
      doh: { passed: true, score: 95, issues: [] },
      daman: { passed: true, score: 92, issues: [] },
      jawda: {
        passed: false,
        score: 78,
        issues: ["Quality indicator KPI-003 below threshold"],
      },
      hipaa: { passed: true, score: 98, issues: [] },
      overall: false,
    });

    setQualityGates([
      {
        id: "coverage",
        name: "Test Coverage",
        passed: true,
        criteria: [
          { metric: "Line Coverage", threshold: 80, actual: 85, passed: true },
          {
            metric: "Function Coverage",
            threshold: 80,
            actual: 82,
            passed: true,
          },
          {
            metric: "Branch Coverage",
            threshold: 75,
            actual: 78,
            passed: true,
          },
        ],
      },
      {
        id: "success-rate",
        name: "Test Success Rate",
        passed: false,
        criteria: [
          { metric: "Success Rate", threshold: 95, actual: 91, passed: false },
          { metric: "Failed Tests", threshold: 5, actual: 8, passed: false },
        ],
      },
      {
        id: "compliance",
        name: "Healthcare Compliance",
        passed: false,
        criteria: [
          {
            metric: "DOH Compliance",
            threshold: 100,
            actual: 95,
            passed: false,
          },
          {
            metric: "DAMAN Compliance",
            threshold: 100,
            actual: 92,
            passed: false,
          },
          {
            metric: "JAWDA Compliance",
            threshold: 100,
            actual: 78,
            passed: false,
          },
          {
            metric: "HIPAA Compliance",
            threshold: 100,
            actual: 98,
            passed: false,
          },
        ],
      },
    ]);
  }, []);

  const handleStartTests = () => {
    setExecutionStatus({
      isRunning: true,
      currentSuite: "DOH Compliance Tests",
      progress: 0,
      startTime: Date.now(),
      estimatedCompletion: Date.now() + 300000, // 5 minutes
    });

    // Simulate test execution progress
    const interval = setInterval(() => {
      setExecutionStatus((prev) => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, isRunning: false, progress: 100 };
        }
        return { ...prev, progress: prev.progress + 2 };
      });
    }, 1000);
  };

  const handleStopTests = () => {
    setExecutionStatus((prev) => ({ ...prev, isRunning: false }));
  };

  const handleRefreshData = () => {
    setLastUpdate(new Date());
    // Simulate data refresh
    console.log("Refreshing test data...");
  };

  const getSuccessRate = () => {
    if (testMetrics.totalTests === 0) return 0;
    return Math.round((testMetrics.passedTests / testMetrics.totalTests) * 100);
  };

  const getComplianceColor = (passed: boolean) => {
    return passed ? "text-green-600" : "text-red-600";
  };

  const getQualityGateColor = (passed: boolean) => {
    return passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Healthcare Testing Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive testing with DOH, DAMAN, JAWDA & HIPAA compliance
              monitoring
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              Last Updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Execution Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Test Execution Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={
                    executionStatus.isRunning
                      ? handleStopTests
                      : handleStartTests
                  }
                  className={`flex items-center space-x-2 ${
                    executionStatus.isRunning
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {executionStatus.isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Stop Tests</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Tests</span>
                    </>
                  )}
                </Button>

                {executionStatus.isRunning && (
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="animate-pulse">
                      Running: {executionStatus.currentSuite}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {executionStatus.estimatedCompletion &&
                          `ETA: ${Math.ceil((executionStatus.estimatedCompletion - Date.now()) / 60000)}m`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {executionStatus.isRunning && (
                <div className="w-64">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">
                      {executionStatus.progress}%
                    </span>
                  </div>
                  <Progress value={executionStatus.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="quality-gates">Quality Gates</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tests
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {testMetrics.totalTests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all test suites
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Success Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {getSuccessRate()}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {testMetrics.passedTests} passed, {testMetrics.failedTests}{" "}
                    failed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliance
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${complianceStatus.overall ? "text-green-600" : "text-red-600"}`}
                  >
                    {complianceStatus.overall ? "PASSED" : "FAILED"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Healthcare regulatory compliance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Duration
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {testMetrics.performance.averageDuration}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per test execution
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Test Results Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of test outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Passed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {testMetrics.passedTests}
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(testMetrics.passedTests / testMetrics.totalTests) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Failed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {testMetrics.failedTests}
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${(testMetrics.failedTests / testMetrics.totalTests) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Skipped</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {testMetrics.skippedTests}
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${(testMetrics.skippedTests / testMetrics.totalTests) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Test execution performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Fastest Test
                        </p>
                        <p className="text-xs text-green-600">
                          {testMetrics.performance.fastestTest.name}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {testMetrics.performance.fastestTest.duration}ms
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Slowest Test
                        </p>
                        <p className="text-xs text-red-600">
                          {testMetrics.performance.slowestTest.name}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        {testMetrics.performance.slowestTest.duration}ms
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Average Duration
                        </p>
                        <p className="text-xs text-blue-600">
                          Across all tests
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {testMetrics.performance.averageDuration}ms
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DOH Compliance */}
              <Card
                className={getQualityGateColor(complianceStatus.doh.passed)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>DOH Compliance</span>
                    {complianceStatus.doh.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    UAE Department of Health standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Score</span>
                      <Badge
                        className={
                          complianceStatus.doh.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {complianceStatus.doh.score}%
                      </Badge>
                    </div>
                    <Progress
                      value={complianceStatus.doh.score}
                      className="h-2"
                    />
                    {complianceStatus.doh.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800 mb-2">
                          Issues:
                        </p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {complianceStatus.doh.issues.map((issue, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span>•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* DAMAN Compliance */}
              <Card
                className={getQualityGateColor(complianceStatus.daman.passed)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>DAMAN Compliance</span>
                    {complianceStatus.daman.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    DAMAN insurance integration standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Score</span>
                      <Badge
                        className={
                          complianceStatus.daman.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {complianceStatus.daman.score}%
                      </Badge>
                    </div>
                    <Progress
                      value={complianceStatus.daman.score}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* JAWDA Compliance */}
              <Card
                className={getQualityGateColor(complianceStatus.jawda.passed)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>JAWDA Compliance</span>
                    {complianceStatus.jawda.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    JAWDA quality accreditation standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Score</span>
                      <Badge
                        className={
                          complianceStatus.jawda.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {complianceStatus.jawda.score}%
                      </Badge>
                    </div>
                    <Progress
                      value={complianceStatus.jawda.score}
                      className="h-2"
                    />
                    {complianceStatus.jawda.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800 mb-2">
                          Issues:
                        </p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {complianceStatus.jawda.issues.map((issue, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span>•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* HIPAA Compliance */}
              <Card
                className={getQualityGateColor(complianceStatus.hipaa.passed)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>HIPAA Compliance</span>
                    {complianceStatus.hipaa.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Healthcare data privacy standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Score</span>
                      <Badge
                        className={
                          complianceStatus.hipaa.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {complianceStatus.hipaa.score}%
                      </Badge>
                    </div>
                    <Progress
                      value={complianceStatus.hipaa.score}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quality Gates Tab */}
          <TabsContent value="quality-gates" className="space-y-6">
            <div className="space-y-4">
              {qualityGates.map((gate) => (
                <Card
                  key={gate.id}
                  className={getQualityGateColor(gate.passed)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{gate.name}</span>
                      {gate.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gate.criteria.map((criteria, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <span className="text-sm">{criteria.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {criteria.actual} / {criteria.threshold}
                            </span>
                            {criteria.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Execution Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Test Duration</span>
                      <Badge variant="outline">
                        {testMetrics.performance.averageDuration}ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tests per Second</span>
                      <Badge variant="outline">
                        {(
                          1000 / testMetrics.performance.averageDuration
                        ).toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Execution Time</span>
                      <Badge variant="outline">
                        {Math.round(
                          (testMetrics.totalTests *
                            testMetrics.performance.averageDuration) /
                            1000,
                        )}
                        s
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">245 MB</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Network I/O</span>
                        <span className="text-sm font-medium">12 MB/s</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(testMetrics.coverage).map(([type, value]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {type} Coverage
                    </CardTitle>
                    <CardDescription>Code coverage for {type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{value}%</span>
                        <Badge
                          variant={value >= 80 ? "default" : "destructive"}
                          className={
                            value >= 80 ? "bg-green-100 text-green-800" : ""
                          }
                        >
                          {value >= 80 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                      <Progress value={value} className="h-3" />
                      <p className="text-xs text-gray-600">
                        Target: 80% minimum for healthcare components
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Alerts */}
        {!complianceStatus.overall && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Healthcare Compliance Issues Detected
            </AlertTitle>
            <AlertDescription className="text-red-700">
              Some healthcare compliance standards are not met. Please review
              the compliance tab for detailed information.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveTestingDashboard;
