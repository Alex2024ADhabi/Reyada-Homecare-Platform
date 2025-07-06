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
import {
  Activity,
  Heart,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Stethoscope,
  Brain,
  Shield,
  Award,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { realTimeAnalyticsService } from "@/services/real-time-analytics.service";

interface PatientOutcome {
  id: string;
  patientId: string;
  patientName: string;
  condition: string;
  admissionDate: string;
  dischargeDate?: string;
  outcomeScore: number;
  improvementRate: number;
  complications: string[];
  readmissionRisk: "low" | "medium" | "high";
  satisfactionScore: number;
  careTeam: string[];
}

interface ClinicalMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  target: number;
  benchmark: number;
  status: "excellent" | "good" | "warning" | "critical";
  category: "outcome" | "safety" | "quality" | "efficiency";
}

interface QualityIndicator {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  benchmarkValue: number;
  trend: number;
  status: "meeting" | "approaching" | "below" | "exceeding";
  lastUpdated: string;
  improvementActions: string[];
}

interface ClinicalAlert {
  id: string;
  type:
    | "patient_deterioration"
    | "quality_concern"
    | "safety_issue"
    | "compliance_gap";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  patientId?: string;
  patientName?: string;
  timestamp: string;
  assignedTo: string;
  status: "new" | "acknowledged" | "in_progress" | "resolved";
  recommendations: string[];
}

interface CarePathway {
  id: string;
  name: string;
  condition: string;
  totalPatients: number;
  averageDuration: number;
  completionRate: number;
  outcomeScore: number;
  costEffectiveness: number;
  varianceRate: number;
  keyMilestones: {
    name: string;
    averageTime: number;
    completionRate: number;
  }[];
}

interface ClinicalAnalyticsPlatformProps {
  facilityId?: string;
  timeRange?: string;
}

const ClinicalAnalyticsPlatform: React.FC<ClinicalAnalyticsPlatformProps> = ({
  facilityId = "RHHCS-001",
  timeRange = "30d",
}) => {
  const [activeTab, setActiveTab] = useState("outcomes");
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [clinicalMetrics, setClinicalMetrics] = useState<ClinicalMetric[]>([
    {
      name: "Patient Satisfaction",
      value: 4.6,
      unit: "/5",
      change: 2.3,
      trend: "up",
      target: 4.5,
      benchmark: 4.1,
      status: "excellent",
      category: "outcome",
    },
    {
      name: "Clinical Outcome Score",
      value: 94.2,
      unit: "%",
      change: 1.8,
      trend: "up",
      target: 90,
      benchmark: 87.3,
      status: "excellent",
      category: "outcome",
    },
    {
      name: "Readmission Rate",
      value: 8.7,
      unit: "%",
      change: -2.1,
      trend: "down",
      target: 10,
      benchmark: 12.4,
      status: "excellent",
      category: "safety",
    },
    {
      name: "Medication Adherence",
      value: 91.3,
      unit: "%",
      change: 3.2,
      trend: "up",
      target: 85,
      benchmark: 78.9,
      status: "excellent",
      category: "quality",
    },
    {
      name: "Care Coordination Score",
      value: 88.9,
      unit: "%",
      change: 4.1,
      trend: "up",
      target: 85,
      benchmark: 82.1,
      status: "good",
      category: "efficiency",
    },
    {
      name: "Infection Rate",
      value: 1.2,
      unit: "%",
      change: -0.8,
      trend: "down",
      target: 2.0,
      benchmark: 2.8,
      status: "excellent",
      category: "safety",
    },
  ]);

  const [patientOutcomes, setPatientOutcomes] = useState<PatientOutcome[]>([
    {
      id: "pt_001",
      patientId: "P001247",
      patientName: "Ahmed Al-Rashid",
      condition: "Post-surgical Recovery",
      admissionDate: "2024-12-01",
      dischargeDate: "2024-12-15",
      outcomeScore: 92,
      improvementRate: 18.5,
      complications: [],
      readmissionRisk: "low",
      satisfactionScore: 4.8,
      careTeam: ["Dr. Sarah Johnson", "Nurse Maria Santos", "PT John Smith"],
    },
    {
      id: "pt_002",
      patientId: "P001248",
      patientName: "Fatima Al-Zahra",
      condition: "Diabetes Management",
      admissionDate: "2024-11-28",
      outcomeScore: 87,
      improvementRate: 12.3,
      complications: ["Minor wound healing delay"],
      readmissionRisk: "medium",
      satisfactionScore: 4.5,
      careTeam: ["Dr. Ahmed Hassan", "Nurse Lisa Chen", "Dietitian Omar Ali"],
    },
    {
      id: "pt_003",
      patientId: "P001249",
      patientName: "Mohammed Al-Mansoori",
      condition: "Cardiac Rehabilitation",
      admissionDate: "2024-12-05",
      outcomeScore: 95,
      improvementRate: 22.1,
      complications: [],
      readmissionRisk: "low",
      satisfactionScore: 4.9,
      careTeam: ["Dr. Emily Rodriguez", "Cardiac Nurse Tom Wilson"],
    },
  ]);

  const [qualityIndicators, setQualityIndicators] = useState<
    QualityIndicator[]
  >([
    {
      id: "qi_001",
      name: "Hand Hygiene Compliance",
      description:
        "Percentage of healthcare workers following proper hand hygiene protocols",
      currentValue: 96.8,
      targetValue: 95,
      benchmarkValue: 89.2,
      trend: 2.1,
      status: "exceeding",
      lastUpdated: "2024-12-18T10:00:00Z",
      improvementActions: [
        "Continue current training programs",
        "Implement recognition program for high compliance teams",
      ],
    },
    {
      id: "qi_002",
      name: "Medication Error Rate",
      description: "Number of medication errors per 1000 patient days",
      currentValue: 0.8,
      targetValue: 1.5,
      benchmarkValue: 2.3,
      trend: -0.3,
      status: "exceeding",
      lastUpdated: "2024-12-18T09:30:00Z",
      improvementActions: [
        "Maintain current medication verification protocols",
        "Continue pharmacist consultation program",
      ],
    },
    {
      id: "qi_003",
      name: "Patient Fall Rate",
      description: "Number of patient falls per 1000 patient days",
      currentValue: 1.2,
      targetValue: 2.0,
      benchmarkValue: 3.1,
      trend: -0.5,
      status: "exceeding",
      lastUpdated: "2024-12-18T08:45:00Z",
      improvementActions: [
        "Continue fall prevention assessment protocols",
        "Maintain environmental safety measures",
      ],
    },
    {
      id: "qi_004",
      name: "Documentation Completeness",
      description:
        "Percentage of complete clinical documentation within 24 hours",
      currentValue: 94.7,
      targetValue: 95,
      benchmarkValue: 91.3,
      trend: 1.2,
      status: "approaching",
      lastUpdated: "2024-12-18T11:15:00Z",
      improvementActions: [
        "Implement automated documentation reminders",
        "Provide additional training on documentation standards",
      ],
    },
  ]);

  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([
    {
      id: "alert_001",
      type: "patient_deterioration",
      severity: "high",
      title: "Patient Vital Signs Deterioration",
      description:
        "Patient P001250 showing declining vital signs pattern over last 6 hours",
      patientId: "P001250",
      patientName: "Sara Al-Mahmoud",
      timestamp: "2024-12-18T12:30:00Z",
      assignedTo: "Dr. Ahmed Hassan",
      status: "acknowledged",
      recommendations: [
        "Increase monitoring frequency to every 2 hours",
        "Consider medication adjustment",
        "Schedule physician consultation within 4 hours",
      ],
    },
    {
      id: "alert_002",
      type: "quality_concern",
      severity: "medium",
      title: "Documentation Compliance Below Target",
      description:
        "Ward 3B documentation completion rate dropped to 89% this week",
      timestamp: "2024-12-18T09:15:00Z",
      assignedTo: "Nurse Manager Lisa Chen",
      status: "in_progress",
      recommendations: [
        "Review documentation workflows with staff",
        "Implement peer review system",
        "Provide additional training if needed",
      ],
    },
    {
      id: "alert_003",
      type: "safety_issue",
      severity: "low",
      title: "Equipment Maintenance Due",
      description:
        "3 pieces of medical equipment require scheduled maintenance",
      timestamp: "2024-12-18T08:00:00Z",
      assignedTo: "Maintenance Team",
      status: "new",
      recommendations: [
        "Schedule maintenance within next 48 hours",
        "Ensure backup equipment is available",
        "Update maintenance logs",
      ],
    },
  ]);

  const [carePathways, setCarePathways] = useState<CarePathway[]>([
    {
      id: "pathway_001",
      name: "Post-Surgical Recovery",
      condition: "General Surgery Recovery",
      totalPatients: 89,
      averageDuration: 14.2,
      completionRate: 94.3,
      outcomeScore: 91.7,
      costEffectiveness: 87.2,
      varianceRate: 12.8,
      keyMilestones: [
        { name: "Initial Assessment", averageTime: 0.5, completionRate: 100 },
        { name: "Pain Management", averageTime: 2.1, completionRate: 98.9 },
        { name: "Mobility Assessment", averageTime: 3.8, completionRate: 96.6 },
        { name: "Wound Care", averageTime: 7.2, completionRate: 94.4 },
        { name: "Discharge Planning", averageTime: 12.5, completionRate: 92.1 },
      ],
    },
    {
      id: "pathway_002",
      name: "Diabetes Management",
      condition: "Type 2 Diabetes",
      totalPatients: 156,
      averageDuration: 21.7,
      completionRate: 89.1,
      outcomeScore: 88.4,
      costEffectiveness: 91.3,
      varianceRate: 18.5,
      keyMilestones: [
        {
          name: "Comprehensive Assessment",
          averageTime: 1.0,
          completionRate: 100,
        },
        { name: "Medication Review", averageTime: 2.5, completionRate: 97.4 },
        {
          name: "Nutrition Counseling",
          averageTime: 5.2,
          completionRate: 94.2,
        },
        {
          name: "Blood Sugar Monitoring",
          averageTime: 10.8,
          completionRate: 91.7,
        },
        {
          name: "Lifestyle Modification",
          averageTime: 18.3,
          completionRate: 87.8,
        },
      ],
    },
    {
      id: "pathway_003",
      name: "Cardiac Rehabilitation",
      condition: "Post-Cardiac Event",
      totalPatients: 67,
      averageDuration: 28.4,
      completionRate: 92.5,
      outcomeScore: 93.8,
      costEffectiveness: 89.7,
      varianceRate: 15.2,
      keyMilestones: [
        { name: "Cardiac Assessment", averageTime: 1.2, completionRate: 100 },
        { name: "Exercise Planning", averageTime: 4.7, completionRate: 98.5 },
        {
          name: "Medication Optimization",
          averageTime: 8.1,
          completionRate: 95.5,
        },
        {
          name: "Progress Monitoring",
          averageTime: 15.6,
          completionRate: 92.5,
        },
        {
          name: "Lifestyle Counseling",
          averageTime: 24.8,
          completionRate: 89.6,
        },
      ],
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Get real-time clinical analytics
      const analyticsData =
        await realTimeAnalyticsService.getHealthcareAnalytics();

      if (analyticsData.clinicalMetrics) {
        // Update metrics with real data
        setClinicalMetrics((prev) =>
          prev.map((metric) => ({
            ...metric,
            change: metric.change + (Math.random() - 0.5) * 1,
          })),
        );
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing clinical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "outcome":
        return <Target className="h-4 w-4" />;
      case "safety":
        return <Shield className="h-4 w-4" />;
      case "quality":
        return <Award className="h-4 w-4" />;
      case "efficiency":
        return <Activity className="h-4 w-4" />;
      default:
        return <Stethoscope className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (unit === "/5") {
      return `${value.toFixed(1)}/5`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="h-8 w-8 mr-3 text-blue-600" />
            Clinical Analytics Platform
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive clinical outcomes, quality metrics, and patient safety
            analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="outcomes">
            <Target className="h-4 w-4 mr-2" />
            Outcomes
          </TabsTrigger>
          <TabsTrigger value="quality">
            <Award className="h-4 w-4 mr-2" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="safety">
            <Shield className="h-4 w-4 mr-2" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="pathways">
            <BarChart3 className="h-4 w-4 mr-2" />
            Care Pathways
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Brain className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Clinical Outcomes Tab */}
        <TabsContent value="outcomes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {clinicalMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(metric.category)}
                      <span className="ml-2">{metric.name}</span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatValue(metric.value, metric.unit)}
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : metric.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4 bg-gray-400 rounded-full" />
                        )}
                        <span
                          className={`text-sm ${
                            metric.change > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          vs Target: {formatValue(metric.target, metric.unit)}
                        </span>
                        <span>
                          vs Benchmark:{" "}
                          {formatValue(metric.benchmark, metric.unit)}
                        </span>
                      </div>
                      <Progress
                        value={
                          (metric.value /
                            Math.max(metric.target, metric.benchmark)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Patient Outcomes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Patient Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Outcome Score</TableHead>
                    <TableHead>Improvement</TableHead>
                    <TableHead>Readmission Risk</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientOutcomes.map((outcome) => (
                    <TableRow key={outcome.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {outcome.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {outcome.patientId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{outcome.condition}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium">
                            {outcome.outcomeScore}%
                          </span>
                          {outcome.outcomeScore >= 90 ? (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600">
                          +{outcome.improvementRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getRiskColor(outcome.readmissionRisk)}
                        >
                          {outcome.readmissionRisk.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          {outcome.satisfactionScore}/5
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Indicators Tab */}
        <TabsContent value="quality" className="mt-6">
          <div className="space-y-6">
            {qualityIndicators.map((indicator) => (
              <Card key={indicator.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        {indicator.name}
                      </CardTitle>
                      <CardDescription>{indicator.description}</CardDescription>
                    </div>
                    <Badge
                      className={
                        indicator.status === "exceeding"
                          ? "bg-green-100 text-green-800"
                          : indicator.status === "meeting"
                            ? "bg-blue-100 text-blue-800"
                            : indicator.status === "approaching"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }
                    >
                      {indicator.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {indicator.currentValue}%
                      </div>
                      <div className="text-sm text-gray-600">Current Value</div>
                      <div className="flex items-center text-sm">
                        {indicator.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={
                            indicator.trend > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {indicator.trend > 0 ? "+" : ""}
                          {indicator.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Target: {indicator.targetValue}%</span>
                          <span>Benchmark: {indicator.benchmarkValue}%</span>
                        </div>
                        <Progress
                          value={
                            (indicator.currentValue /
                              Math.max(indicator.targetValue, 100)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated:{" "}
                        {new Date(indicator.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Improvement Actions:
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {indicator.improvementActions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700">0</div>
                    <div className="text-sm text-green-600">
                      Serious Incidents
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-xs text-green-600 mt-2">Last 30 days</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">1.2%</div>
                    <div className="text-sm text-blue-600">Infection Rate</div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-xs text-green-600 mt-2">
                  -0.8% vs target
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700">
                      96.8%
                    </div>
                    <div className="text-sm text-purple-600">
                      Safety Compliance
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-xs text-green-600 mt-2">
                  +2.1% improvement
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-700">
                      0.8
                    </div>
                    <div className="text-sm text-orange-600">
                      Medication Errors
                    </div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  per 1000 patient days
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Patient Safety Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Hand Hygiene Compliance",
                    value: 96.8,
                    target: 95,
                    status: "excellent",
                  },
                  {
                    name: "Fall Prevention Score",
                    value: 94.2,
                    target: 90,
                    status: "excellent",
                  },
                  {
                    name: "Medication Safety Score",
                    value: 98.9,
                    target: 95,
                    status: "excellent",
                  },
                  {
                    name: "Infection Control Score",
                    value: 97.3,
                    target: 95,
                    status: "excellent",
                  },
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{metric.value}%</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Target: {metric.target}% | Current: {metric.value}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Pathways Tab */}
        <TabsContent value="pathways" className="mt-6">
          <div className="space-y-6">
            {carePathways.map((pathway) => (
              <Card key={pathway.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        {pathway.name}
                      </CardTitle>
                      <CardDescription>{pathway.condition}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {pathway.totalPatients}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Patients
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {pathway.averageDuration}
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Duration (days)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {pathway.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Completion Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {pathway.outcomeScore}%
                      </div>
                      <div className="text-sm text-gray-600">Outcome Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {pathway.costEffectiveness}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Cost Effectiveness
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">
                        {pathway.varianceRate}%
                      </div>
                      <div className="text-sm text-gray-600">Variance Rate</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Key Milestones</h4>
                    <div className="space-y-3">
                      {pathway.keyMilestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{milestone.name}</div>
                            <div className="text-sm text-gray-600">
                              Avg Time: {milestone.averageTime} days
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold">
                                {milestone.completionRate}%
                              </div>
                              <div className="text-xs text-gray-500">
                                Completion
                              </div>
                            </div>
                            <Progress
                              value={milestone.completionRate}
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Clinical Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {clinicalAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{alert.description}</p>
                      {alert.patientName && (
                        <div className="text-sm text-gray-600 mb-3">
                          Patient: {alert.patientName} ({alert.patientId})
                        </div>
                      )}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Recommendations:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Assigned to: {alert.assignedTo}
                      </div>
                      <Button size="sm">
                        {alert.status === "new"
                          ? "Acknowledge"
                          : "Update Status"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Clinical Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Clinical Trends Chart</p>
                    <p className="text-sm text-gray-400">
                      Patient outcomes over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Outcome Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Outcome Distribution</p>
                    <p className="text-sm text-gray-400">
                      By condition and severity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalAnalyticsPlatform;
