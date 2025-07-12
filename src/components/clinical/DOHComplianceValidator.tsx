import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  Users,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  Database,
  Mail,
  Bell,
} from "lucide-react";
import { dohAuditAPI } from "@/api/doh-audit.api";
import {
  getComplianceMonitoringDashboard,
  createComplianceMonitoringRule,
  executeComplianceMonitoring,
  getUpcomingComplianceAudits,
  exportReport,
  generateReport,
  getReportAnalytics,
} from "@/api/reporting.api";

interface ComplianceRule {
  id: string;
  category: string;
  title: string;
  description: string;
  status: "compliant" | "non-compliant" | "partially-compliant" | "pending";
  severity: "critical" | "high" | "medium" | "low";
  lastChecked: string;
  evidence?: string[];
  recommendations?: string[];
}

interface AuditCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  rules: ComplianceRule[];
  status: "compliant" | "non-compliant" | "partially-compliant";
}

interface PatientSafetyIncident {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  category: string;
  reportedDate: string;
  status: "open" | "investigating" | "resolved";
  severity: "low" | "moderate" | "high" | "severe" | "catastrophic";
}

interface NineDomainAssessment {
  id: string;
  patientId: string;
  clinicianId: string;
  assessmentDate: string;
  domains: {
    cardiovascular: DomainData;
    respiratory: DomainData;
    neurological: DomainData;
    musculoskeletal: DomainData;
    integumentary: DomainData;
    genitourinary: DomainData;
    gastrointestinal: DomainData;
    psychosocial: DomainData;
    environmental: DomainData;
  };
  completionPercentage: number;
  overallRiskLevel: "low" | "medium" | "high";
  dohCompliant: boolean;
}

interface DomainData {
  completed: boolean;
  score: number;
  findings: string[];
  riskLevel: "low" | "medium" | "high";
  interventions: string[];
  validated: boolean;
}

interface JAWDAKPIData {
  facilityId: string;
  reportingPeriod: string;
  overallScore: number;
  clinicalQuality: number;
  patientSafety: number;
  operationalEfficiency: number;
  staffPerformance: number;
  technologyInnovation: number;
  financialPerformance: number;
  complianceStatus: "meeting_target" | "needs_improvement" | "critical";
}

interface TawteenComplianceData {
  facilityId: string;
  emiratizationPercentage: number;
  targetPercentage: number;
  complianceStatus: "compliant" | "non_compliant";
  gapAnalysis: number;
  trainingCompliance: boolean;
  reportingCompliance: boolean;
}

interface ADHICSValidationData {
  facilityId: string;
  overallScore: number;
  governanceCompliance: number;
  technicalControls: number;
  assetManagement: number;
  informationSecurity: number;
  certificationStatus: "certified" | "improvement_required";
  complianceGaps: string[];
}

const DOHComplianceValidator: React.FC = () => {
  const [overallScore, setOverallScore] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeAlerts, setRealTimeAlerts] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nineDomainAssessments, setNineDomainAssessments] = useState<
    NineDomainAssessment[]
  >([]);
  const [jawdaKPIs, setJawdaKPIs] = useState<JAWDAKPIData | null>(null);
  const [tawteenCompliance, setTawteenCompliance] =
    useState<TawteenComplianceData | null>(null);
  const [adhicsValidation, setADHICSValidation] =
    useState<ADHICSValidationData | null>(null);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [complianceMonitoringData, setComplianceMonitoringData] = useState<any>(null);
  const [upcomingAudits, setUpcomingAudits] = useState<any[]>([]);
  const [reportAnalytics, setReportAnalytics] = useState<any>(null);
  const [automatedReports, setAutomatedReports] = useState<any[]>([]);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [exportInProgress, setExportInProgress] = useState(false);

  // 12 Comprehensive Compliance Rules
  const complianceRules: ComplianceRule[] = [
    {
      id: "HR-001",
      category: "HR",
      title: "Staff Licensing Verification",
      description: "All clinical staff must have valid DOH licenses",
      status: "compliant",
      severity: "critical",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: [
        "License verification system active",
        "All staff licenses current",
      ],
      recommendations: ["Implement automated renewal reminders"],
    },
    {
      id: "HR-002",
      category: "HR",
      title: "Continuing Education Compliance",
      description: "Staff must complete required CE hours annually",
      status: "partially-compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["85% staff compliant with CE requirements"],
      recommendations: ["Schedule CE sessions for remaining 15% of staff"],
    },
    {
      id: "QM-001",
      category: "Quality Management",
      title: "Quality Metrics Tracking",
      description: "Systematic tracking of quality indicators",
      status: "compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["Quality dashboard operational", "Monthly reports generated"],
      recommendations: ["Expand metrics to include patient satisfaction"],
    },
    {
      id: "QM-002",
      category: "Quality Management",
      title: "Incident Reporting System",
      description: "Comprehensive incident reporting and follow-up",
      status: "compliant",
      severity: "critical",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["24/7 reporting system active", "All incidents tracked"],
      recommendations: [
        "Implement predictive analytics for incident prevention",
      ],
    },
    {
      id: "CP-001",
      category: "Clinical Practices",
      title: "Evidence-Based Care Protocols",
      description: "All care follows evidence-based protocols",
      status: "compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["Protocols updated quarterly", "95% adherence rate"],
      recommendations: ["Develop specialty-specific protocols"],
    },
    {
      id: "CP-002",
      category: "Clinical Practices",
      title: "Patient Assessment Documentation",
      description: "Complete 9-domain assessments for all patients",
      status: "partially-compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["90% of assessments complete"],
      recommendations: ["Implement mandatory assessment completion alerts"],
    },
    {
      id: "IC-001",
      category: "Infection Control",
      title: "Hand Hygiene Compliance",
      description: "Staff hand hygiene compliance monitoring",
      status: "compliant",
      severity: "critical",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["95% compliance rate", "Regular audits conducted"],
      recommendations: ["Install additional hand sanitizer stations"],
    },
    {
      id: "IC-002",
      category: "Infection Control",
      title: "PPE Usage Protocols",
      description: "Proper PPE usage and disposal procedures",
      status: "compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["PPE training completed", "Adequate supply maintained"],
      recommendations: ["Quarterly PPE competency assessments"],
    },
    {
      id: "FS-001",
      category: "Facility Safety",
      title: "Emergency Preparedness",
      description: "Emergency response plans and drills",
      status: "compliant",
      severity: "critical",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["Emergency plans updated", "Quarterly drills conducted"],
      recommendations: ["Expand disaster recovery procedures"],
    },
    {
      id: "EM-001",
      category: "Equipment Management",
      title: "Medical Equipment Calibration",
      description: "Regular calibration and maintenance of medical equipment",
      status: "compliant",
      severity: "high",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["All equipment calibrated", "Maintenance logs current"],
      recommendations: ["Implement predictive maintenance system"],
    },
    {
      id: "IM-001",
      category: "Information Management",
      title: "Data Security and Privacy",
      description: "Patient data protection and privacy compliance",
      status: "compliant",
      severity: "critical",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["Encryption implemented", "Access controls active"],
      recommendations: ["Regular security penetration testing"],
    },
    {
      id: "GP-001",
      category: "Governance & Policies",
      title: "Policy Management System",
      description: "Current policies and procedures management",
      status: "partially-compliant",
      severity: "medium",
      lastChecked: "2024-01-15T10:00:00Z",
      evidence: ["80% of policies updated within last year"],
      recommendations: ["Accelerate policy review cycle"],
    },
  ];

  // 8-Category Audit Checklist
  const auditCategories: AuditCategory[] = [
    {
      id: "hr",
      name: "Human Resources",
      icon: <Users className="h-5 w-5" />,
      score: 85,
      maxScore: 100,
      rules: complianceRules.filter((rule) => rule.category === "HR"),
      status: "partially-compliant",
    },
    {
      id: "quality",
      name: "Quality Management",
      icon: <Shield className="h-5 w-5" />,
      score: 95,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Quality Management",
      ),
      status: "compliant",
    },
    {
      id: "clinical",
      name: "Clinical Practices",
      icon: <FileText className="h-5 w-5" />,
      score: 90,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Clinical Practices",
      ),
      status: "partially-compliant",
    },
    {
      id: "infection",
      name: "Infection Control",
      icon: <Shield className="h-5 w-5" />,
      score: 98,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Infection Control",
      ),
      status: "compliant",
    },
    {
      id: "facility",
      name: "Facility Safety",
      icon: <Settings className="h-5 w-5" />,
      score: 92,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Facility Safety",
      ),
      status: "compliant",
    },
    {
      id: "equipment",
      name: "Equipment Management",
      icon: <Settings className="h-5 w-5" />,
      score: 88,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Equipment Management",
      ),
      status: "compliant",
    },
    {
      id: "information",
      name: "Information Management",
      icon: <FileText className="h-5 w-5" />,
      score: 96,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Information Management",
      ),
      status: "compliant",
    },
    {
      id: "governance",
      name: "Governance & Policies",
      icon: <Users className="h-5 w-5" />,
      score: 80,
      maxScore: 100,
      rules: complianceRules.filter(
        (rule) => rule.category === "Governance & Policies",
      ),
      status: "partially-compliant",
    },
  ];

  // Enhanced DOH 5-Level Patient Safety Taxonomy with 8 comprehensive categories
  const patientSafetyIncidents: PatientSafetyIncident[] = [
    {
      id: "PSI-001",
      level: 1,
      description: "Near miss - medication error caught before administration",
      category: "Medication Safety",
      reportedDate: "2024-01-14T14:30:00Z",
      status: "resolved",
      severity: "low",
    },
    {
      id: "PSI-002",
      level: 2,
      description: "Minor patient fall with no injury",
      category: "Patient Falls",
      reportedDate: "2024-01-13T09:15:00Z",
      status: "investigating",
      severity: "moderate",
    },
    {
      id: "PSI-003",
      level: 3,
      description: "Equipment malfunction requiring intervention",
      category: "Equipment Failures",
      reportedDate: "2024-01-12T16:45:00Z",
      status: "resolved",
      severity: "high",
    },
    {
      id: "PSI-004",
      level: 2,
      description: "Healthcare-associated infection identified and contained",
      category: "Healthcare Associated Infections",
      reportedDate: "2024-01-11T11:20:00Z",
      status: "resolved",
      severity: "moderate",
    },
    {
      id: "PSI-005",
      level: 4,
      description: "Surgical complication requiring additional intervention",
      category: "Surgical Complications",
      reportedDate: "2024-01-10T08:45:00Z",
      status: "investigating",
      severity: "high",
    },
    {
      id: "PSI-006",
      level: 3,
      description: "Communication failure leading to delayed treatment",
      category: "Communication Failures",
      reportedDate: "2024-01-09T15:30:00Z",
      status: "resolved",
      severity: "medium",
    },
    {
      id: "PSI-007",
      level: 2,
      description: "Patient identification error caught during verification",
      category: "Patient Identification",
      reportedDate: "2024-01-08T13:15:00Z",
      status: "resolved",
      severity: "moderate",
    },
    {
      id: "PSI-008",
      level: 1,
      description: "Environmental hazard identified and corrected",
      category: "Environmental Hazards",
      reportedDate: "2024-01-07T10:00:00Z",
      status: "resolved",
      severity: "low",
    },
  ];

  // Load DOH compliance data and initialize automation
  useEffect(() => {
    loadDOHComplianceData();
    initializeComplianceAutomation();
  }, []);

  // Real-time monitoring effect
  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        refreshComplianceData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const initializeComplianceAutomation = async () => {
    try {
      // Initialize automated compliance monitoring rules
      await createComplianceMonitoringRule({
        rule_id: "DOH-AUTO-001",
        name: "DOH 9-Domain Assessment Compliance",
        description: "Automated monitoring of 9-domain assessment completion rates",
        category: "doh",
        severity: "critical",
        monitoring_frequency: "daily",
        validation_query: "SELECT COUNT(*) FROM assessments WHERE completion_percentage = 100",
        threshold_config: {
          warning_threshold: 85,
          critical_threshold: 70,
          measurement_unit: "percentage",
        },
        automated_actions: {
          alert_recipients: ["compliance@reyada-homecare.com", "quality@reyada-homecare.com"],
          escalation_rules: [
            {
              level: 1,
              delay_minutes: 60,
              recipients: ["manager@reyada-homecare.com"],
            },
            {
              level: 2,
              delay_minutes: 240,
              recipients: ["director@reyada-homecare.com"],
            },
          ],
          auto_remediation: {
            enabled: true,
            max_attempts: 3,
          },
        },
        status: "active",
        created_by: "system",
      });

      // Load compliance monitoring dashboard
      const monitoringData = await getComplianceMonitoringDashboard();
      setComplianceMonitoringData(monitoringData);

      // Load upcoming audits
      const audits = await getUpcomingComplianceAudits();
      setUpcomingAudits(audits);

      // Load report analytics
      const analytics = await getReportAnalytics();
      setReportAnalytics(analytics);

      console.log("DOH compliance automation initialized successfully");
    } catch (error) {
      console.error("Error initializing compliance automation:", error);
    }
  };

  const refreshComplianceData = async () => {
    try {
      const monitoringData = await getComplianceMonitoringDashboard();
      setComplianceMonitoringData(monitoringData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error refreshing compliance data:", error);
    }
  };

  const loadDOHComplianceData = async () => {
    try {
      // Load 9-Domain Assessment data
      const mockNineDomainData: NineDomainAssessment[] = [
        {
          id: "assessment-001",
          patientId: "patient-001",
          clinicianId: "clinician-001",
          assessmentDate: new Date().toISOString(),
          domains: {
            cardiovascular: {
              completed: true,
              score: 85,
              findings: ["Hypertension managed"],
              riskLevel: "medium",
              interventions: ["Medication adjustment"],
              validated: true,
            },
            respiratory: {
              completed: true,
              score: 90,
              findings: ["Clear lung sounds"],
              riskLevel: "low",
              interventions: [],
              validated: true,
            },
            neurological: {
              completed: true,
              score: 75,
              findings: ["Mild cognitive decline"],
              riskLevel: "medium",
              interventions: ["Cognitive assessment"],
              validated: true,
            },
            musculoskeletal: {
              completed: true,
              score: 80,
              findings: ["Joint stiffness"],
              riskLevel: "low",
              interventions: ["Physical therapy"],
              validated: true,
            },
            integumentary: {
              completed: true,
              score: 95,
              findings: ["Skin integrity intact"],
              riskLevel: "low",
              interventions: [],
              validated: true,
            },
            genitourinary: {
              completed: true,
              score: 88,
              findings: ["Normal function"],
              riskLevel: "low",
              interventions: [],
              validated: true,
            },
            gastrointestinal: {
              completed: true,
              score: 82,
              findings: ["Mild constipation"],
              riskLevel: "low",
              interventions: ["Dietary modification"],
              validated: true,
            },
            psychosocial: {
              completed: true,
              score: 70,
              findings: ["Mild depression"],
              riskLevel: "medium",
              interventions: ["Counseling referral"],
              validated: true,
            },
            environmental: {
              completed: true,
              score: 92,
              findings: ["Safe home environment"],
              riskLevel: "low",
              interventions: [],
              validated: true,
            },
          },
          completionPercentage: 100,
          overallRiskLevel: "medium",
          dohCompliant: true,
        },
      ];
      setNineDomainAssessments(mockNineDomainData);

      // Load JAWDA KPI data
      const mockJAWDAData: JAWDAKPIData = {
        facilityId: "facility-001",
        reportingPeriod: "2024-Q4",
        overallScore: 87,
        clinicalQuality: 90,
        patientSafety: 95,
        operationalEfficiency: 82,
        staffPerformance: 78,
        technologyInnovation: 85,
        financialPerformance: 88,
        complianceStatus: "meeting_target",
      };
      setJawdaKPIs(mockJAWDAData);

      // Load Tawteen compliance data
      const mockTawteenData: TawteenComplianceData = {
        facilityId: "facility-001",
        emiratizationPercentage: 28,
        targetPercentage: 30,
        complianceStatus: "non_compliant",
        gapAnalysis: 3,
        trainingCompliance: true,
        reportingCompliance: true,
      };
      setTawteenCompliance(mockTawteenData);

      // Load ADHICS validation data
      const mockADHICSData: ADHICSValidationData = {
        facilityId: "facility-001",
        overallScore: 91,
        governanceCompliance: 95,
        technicalControls: 88,
        assetManagement: 92,
        informationSecurity: 90,
        certificationStatus: "certified",
        complianceGaps: ["Backup recovery testing needed"],
      };
      setADHICSValidation(mockADHICSData);
    } catch (error) {
      console.error("Error loading DOH compliance data:", error);
    }
  };

  // Calculate overall compliance score
  useEffect(() => {
    const totalScore = auditCategories.reduce(
      (sum, category) => sum + category.score,
      0,
    );
    const maxTotalScore = auditCategories.reduce(
      (sum, category) => sum + category.maxScore,
      0,
    );
    setOverallScore(Math.round((totalScore / maxTotalScore) * 100));
  }, []);

  const runComprehensiveValidation = async () => {
    setValidationInProgress(true);
    try {
      // Execute real JAWDA KPI calculations
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const endDate = new Date().toISOString();

      const kpiResults = [
        dohAuditAPI.calculateHC001(startDate, endDate),
        dohAuditAPI.calculateHC002(startDate, endDate),
        dohAuditAPI.calculateHC003(startDate, endDate),
        dohAuditAPI.calculateHC004(startDate, endDate),
        dohAuditAPI.calculateHC005(startDate, endDate),
        dohAuditAPI.calculateHC006(startDate, endDate),
      ];

      // Execute compliance monitoring for all active rules
      await executeComplianceMonitoring("DOH-AUTO-001");

      // Generate automated compliance report
      const report = await generateReport(
        "doh-compliance-template",
        {
          period: "current-month",
          includeKPIs: true,
          includeTawteen: true,
          includeADHICS: true,
        },
        "automated-system"
      );

      setAutomatedReports(prev => [report, ...prev.slice(0, 4)]);

      // Update real-time alerts with actual data
      const newAlerts = [
        `JAWDA KPI HC001 (Emergency Visits): ${kpiResults[0].result.toFixed(2)}% - ${kpiResults[0].result < 5 ? 'Compliant' : 'Needs Attention'}`,
        `JAWDA KPI HC002 (Hospitalizations): ${kpiResults[1].result.toFixed(2)}% - ${kpiResults[1].result < 8 ? 'Compliant' : 'Needs Attention'}`,
        `9-Domain Assessment completion rate: ${nineDomainAssessments.length > 0 ? nineDomainAssessments[0].completionPercentage : 0}%`,
        `Automated compliance report generated: ${report.report_id}`,
        `Real-time monitoring active - ${complianceMonitoringData?.overview?.total_active_rules || 0} rules monitored`,
      ];
      setRealTimeAlerts(newAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Validation failed:", error);
      setRealTimeAlerts(["Validation failed - please check system logs"]);
    } finally {
      setValidationInProgress(false);
    }
  };

  const exportComplianceReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExportInProgress(true);
    try {
      if (automatedReports.length === 0) {
        throw new Error("No reports available for export");
      }

      const latestReport = automatedReports[0];
      const exported = await exportReport(latestReport._id, format);
      
      // Create download link
      const blob = new Blob([exported.buffer], { type: exported.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exported.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setRealTimeAlerts(prev => [`Report exported successfully: ${exported.filename}`, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("Export failed:", error);
      setRealTimeAlerts(prev => ["Export failed - please try again", ...prev.slice(0, 4)]);
    } finally {
      setExportInProgress(false);
    }
  };

  // Real-time monitoring simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const alerts = [];

      // Check for critical non-compliance
      const criticalIssues = complianceRules.filter(
        (rule) => rule.severity === "critical" && rule.status !== "compliant",
      );

      if (criticalIssues.length > 0) {
        alerts.push(
          `${criticalIssues.length} critical compliance issues require immediate attention`,
        );
      }

      // Check for overdue assessments
      const overdueRules = complianceRules.filter((rule) => {
        const lastChecked = new Date(rule.lastChecked);
        const daysSinceCheck =
          (Date.now() - lastChecked.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCheck > 30;
      });

      if (overdueRules.length > 0) {
        alerts.push(`${overdueRules.length} compliance checks are overdue`);
      }

      setRealTimeAlerts(alerts);
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "non-compliant":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "partially-compliant":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "non-compliant":
        return "bg-red-100 text-red-800";
      case "partially-compliant":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSafetyLevelColor = (level: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Real-time Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                DOH Compliance Automation System
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time compliance monitoring, automated reporting & regulatory validation
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {realTimeMonitoring ? 'Real-time Monitoring Active' : 'Monitoring Paused'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {complianceMonitoringData?.overview?.total_active_rules || 0} Active Rules
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {complianceMonitoringData?.overview?.overall_compliance_score?.toFixed(1) || '0.0'}% Avg Score
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {overallScore}%
              </div>
              <div className="text-sm text-gray-500">Overall Compliance</div>
              <div className="text-xs text-gray-400 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
                >
                  {realTimeMonitoring ? <Bell className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshComplianceData}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        {realTimeAlerts.length > 0 && (
          <div className="space-y-2">
            {realTimeAlerts.map((alert, index) => (
              <Alert key={index} className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-orange-800">
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="nine-domains">9-Domain</TabsTrigger>
            <TabsTrigger value="jawda-kpi">JAWDA KPIs</TabsTrigger>
            <TabsTrigger value="tawteen">Tawteen</TabsTrigger>
            <TabsTrigger value="adhics">ADHICS V2</TabsTrigger>
            <TabsTrigger value="safety">Patient Safety</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audits">Audits</TabsTrigger>
          </TabsList>

          {/* Automation Dashboard Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Monitoring Status */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Real-time Compliance Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {complianceMonitoringData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {complianceMonitoringData.overview.total_active_rules}
                          </div>
                          <div className="text-sm text-gray-600">Active Rules</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {complianceMonitoringData.overview.overall_compliance_score?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Avg Score</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Recent Alerts</h4>
                        {complianceMonitoringData.real_time_alerts?.slice(0, 3).map((alert: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Automated Actions */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Automated Actions Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {complianceMonitoringData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {complianceMonitoringData.automated_actions.total_actions_today}
                          </div>
                          <div className="text-xs text-gray-600">Total Actions</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {complianceMonitoringData.automated_actions.successful_remediations}
                          </div>
                          <div className="text-xs text-gray-600">Remediations</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-orange-600">
                            {complianceMonitoringData.automated_actions.pending_escalations}
                          </div>
                          <div className="text-xs text-gray-600">Escalations</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => executeComplianceMonitoring("DOH-AUTO-001")}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Run Manual Check
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Trends */}
            {complianceMonitoringData?.compliance_trends && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Compliance Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">DOH Compliance</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {complianceMonitoringData.compliance_trends.category_performance.doh?.toFixed(1)}%
                      </div>
                      <Progress value={complianceMonitoringData.compliance_trends.category_performance.doh} className="mt-2" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">JAWDA KPIs</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {complianceMonitoringData.compliance_trends.category_performance.jawda?.toFixed(1)}%
                      </div>
                      <Progress value={complianceMonitoringData.compliance_trends.category_performance.jawda} className="mt-2" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Daman Integration</h4>
                      <div className="text-2xl font-bold text-purple-600">
                        {complianceMonitoringData.compliance_trends.category_performance.daman?.toFixed(1)}%
                      </div>
                      <Progress value={complianceMonitoringData.compliance_trends.category_performance.daman} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {auditCategories.map((category) => (
                <Card key={category.id} className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle className="text-sm font-medium">
                          {category.name}
                        </CardTitle>
                      </div>
                      {getStatusIcon(category.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {category.score}%
                        </span>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <Progress value={category.score} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {category.rules.length} rules evaluated
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 8-Category Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {auditCategories.map((category) => (
                <Card key={category.id} className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(category.status)}>
                        {category.score}% Compliant
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={category.score} className="h-3" />
                      <div className="space-y-2">
                        {category.rules.map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(rule.status)}
                              <span className="text-sm font-medium">
                                {rule.title}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {rule.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Patient Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>DOH 5-Level Patient Safety Taxonomy</CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive classification system for patient safety
                  incidents across 8 categories
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Enhanced 5-Level Visualization */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const levelNames = {
                        1: "Near Miss",
                        2: "No Harm",
                        3: "Minimal Harm",
                        4: "Moderate Harm",
                        5: "Severe Harm",
                      };
                      const levelDescriptions = {
                        1: "Potential for harm but no harm occurred",
                        2: "Incident reached patient but no harm",
                        3: "Temporary harm requiring intervention",
                        4: "Temporary harm requiring hospitalization",
                        5: "Permanent harm or death",
                      };
                      const count = patientSafetyIncidents.filter(
                        (i) => i.level === level,
                      ).length;
                      const percentage = Math.round(
                        (count / patientSafetyIncidents.length) * 100,
                      );
                      return (
                        <div key={level} className="text-center">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${getSafetyLevelColor(level)}`}
                          >
                            <span className="font-bold text-lg">{level}</span>
                          </div>
                          <div className="text-sm font-medium mb-1">
                            {levelNames[level as keyof typeof levelNames]}
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {percentage}%
                          </div>
                          <div
                            className="text-xs text-gray-400 mt-1"
                            title={
                              levelDescriptions[
                                level as keyof typeof levelDescriptions
                              ]
                            }
                          >
                            {levelDescriptions[
                              level as keyof typeof levelDescriptions
                            ].substring(0, 30)}
                            ...
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 8-Category Analysis Grid */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">
                      8-Category Incident Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          name: "Medication Safety",
                          count: 2,
                          risk: "medium",
                          trend: "+5%",
                        },
                        {
                          name: "Patient Falls",
                          count: 1,
                          risk: "high",
                          trend: "-12%",
                        },
                        {
                          name: "Healthcare Associated Infections",
                          count: 1,
                          risk: "medium",
                          trend: "+2%",
                        },
                        {
                          name: "Surgical Complications",
                          count: 1,
                          risk: "high",
                          trend: "0%",
                        },
                        {
                          name: "Communication Failures",
                          count: 1,
                          risk: "high",
                          trend: "+8%",
                        },
                        {
                          name: "Equipment Failures",
                          count: 1,
                          risk: "low",
                          trend: "-3%",
                        },
                        {
                          name: "Patient Identification",
                          count: 1,
                          risk: "low",
                          trend: "0%",
                        },
                        {
                          name: "Environmental Hazards",
                          count: 1,
                          risk: "medium",
                          trend: "+1%",
                        },
                      ].map((category) => (
                        <div
                          key={category.name}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="text-sm font-medium mb-1">
                            {category.name}
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {category.count}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                category.risk === "high"
                                  ? "border-red-500 text-red-700"
                                  : category.risk === "medium"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-green-500 text-green-700"
                              }`}
                            >
                              {category.risk}
                            </Badge>
                            <span
                              className={`text-xs ${
                                category.trend.startsWith("+")
                                  ? "text-red-600"
                                  : category.trend.startsWith("-")
                                    ? "text-green-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {category.trend}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Incident List */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold mb-4">
                      Recent Incidents
                    </h4>
                    {patientSafetyIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={getSafetyLevelColor(incident.level)}
                            >
                              Level {incident.level}
                            </Badge>
                            <span className="font-medium text-lg">
                              {incident.category}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${
                                incident.status === "resolved"
                                  ? "border-green-500 text-green-700"
                                  : incident.status === "investigating"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-red-500 text-red-700"
                              }`}
                            >
                              {incident.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              ID: {incident.id}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(
                                incident.reportedDate,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {incident.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500">
                              Severity:{" "}
                              <span
                                className={`font-medium ${
                                  incident.severity === "high"
                                    ? "text-red-600"
                                    : incident.severity === "moderate" ||
                                        incident.severity === "medium"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                }`}
                              >
                                {incident.severity}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Reported:{" "}
                              {new Date(incident.reportedDate).toLocaleString()}
                            </span>
                          </div>
                          {incident.level >= 4 && (
                            <Badge variant="destructive" className="text-xs">
                              DOH Reportable
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compliance Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Patient Safety Taxonomy Compliance
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-blue-700">
                          Classification Accuracy
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          98.5%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700">
                          Reporting Timeline
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          100%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700">
                          Documentation Complete
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          94.4%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700">
                          Investigation Compliance
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          77.8%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9-Domain Assessment Tab */}
          <TabsContent value="nine-domains" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>DOH 9-Domain Assessment Validation</CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive patient assessment across all 9 clinical domains
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {nineDomainAssessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">
                            Patient Assessment {assessment.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed:{" "}
                            {new Date(
                              assessment.assessmentDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {assessment.completionPercentage}%
                          </div>
                          <Badge
                            className={`${
                              assessment.dohCompliant
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {assessment.dohCompliant
                              ? "DOH Compliant"
                              : "Non-Compliant"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(assessment.domains).map(
                          ([domainName, domainData]) => (
                            <div
                              key={domainName}
                              className="bg-gray-50 p-3 rounded"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium capitalize">
                                  {domainName.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                {domainData.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                Score: {domainData.score}/100
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  domainData.riskLevel === "high"
                                    ? "border-red-500 text-red-700"
                                    : domainData.riskLevel === "medium"
                                      ? "border-yellow-500 text-yellow-700"
                                      : "border-green-500 text-green-700"
                                }`}
                              >
                                {domainData.riskLevel} risk
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <strong>Overall Risk Level:</strong>
                        <Badge
                          variant="outline"
                          className={`ml-2 ${
                            assessment.overallRiskLevel === "high"
                              ? "border-red-500 text-red-700"
                              : assessment.overallRiskLevel === "medium"
                                ? "border-yellow-500 text-yellow-700"
                                : "border-green-500 text-green-700"
                          }`}
                        >
                          {assessment.overallRiskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced JAWDA KPI Tab with comprehensive analytics */}
          <TabsContent value="jawda-kpi" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>JAWDA Quality Indicators Tracking (Version 8.3)</span>
                  <Button
                    onClick={runComprehensiveValidation}
                    disabled={validationInProgress}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {validationInProgress ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Calculate KPIs
                  </Button>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  DOH-compliant JAWDA KPI calculations with quarterly reporting
                  and validation
                </p>
              </CardHeader>
              <CardContent>
                {jawdaKPIs && (
                  <div className="space-y-8">
                    {/* DOH Compliance Header */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {jawdaKPIs.overallScore}%
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Overall JAWDA Score
                          </div>
                          <Badge
                            className={`${
                              jawdaKPIs.complianceStatus === "meeting_target"
                                ? "bg-green-100 text-green-800"
                                : jawdaKPIs.complianceStatus ===
                                    "needs_improvement"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {jawdaKPIs.complianceStatus.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            Q4 2024
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Reporting Period
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            Quarterly
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            6/6
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            KPIs Calculated
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            Valid
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Data Quality
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Validated
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Case Mix Data Validation */}
                    <Card className="bg-gray-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Case Mix Submission (DOH Service Codes)
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Patient days distribution across DOH-approved service
                          codes
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">
                              Nursing Care Services
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Simple Visit-Nurse (17-25-1)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">125</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Routine Nursing Care (17-25-4)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">280</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Advanced Nursing Care (17-25-5)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">95</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">
                              Support Services
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Simple Visit-Supportive (17-25-2)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">85</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Specialized Visit (17-25-3)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">45</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Self-pay/Reimbursement (XXXX)
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold">20</div>
                                  <div className="text-xs text-gray-500">
                                    patient days
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">
                              Validation Summary
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  Total Patient Days
                                </span>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-blue-600">
                                    650
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Validated
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                                <strong>Validation Rules Applied:</strong>
                                <ul className="mt-1 space-y-1">
                                  <li>• Service code hierarchy validated</li>
                                  <li>• Patient day calculations verified</li>
                                  <li>• Daman-approved codes confirmed</li>
                                  <li>• Transition period rules applied</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KPI Performance Summary */}
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="bg-green-50">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-800 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Meeting DOH Targets
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                HC001: Emergency Visits
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                3.2% (&lt;5%)
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                HC002: Hospitalizations
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                6.8% (&lt;8%)
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">HC003: Ambulation</span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                78.5% (&gt;75%)
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                HC004: Pressure Injuries
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                1.6 (&lt;2.0)
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">HC005: Falls</span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                2.4 (&lt;3.0)
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                HC006: Community Discharge
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                87.3% (&gt;85%)
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-lg text-blue-800 flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Compliance Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                100%
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                KPIs Meeting Targets
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                Excellent Performance
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  0
                                </div>
                                <div className="text-gray-600">
                                  Critical Issues
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  6
                                </div>
                                <div className="text-gray-600">
                                  KPIs Tracked
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Next submission due: Q1 2025
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tawteen Compliance Tab */}
          <TabsContent value="tawteen" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Tawteen Compliance Automation</CardTitle>
                <p className="text-sm text-gray-600">
                  Emiratization targets and workforce development tracking
                </p>
              </CardHeader>
              <CardContent>
                {tawteenCompliance && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {tawteenCompliance.emiratizationPercentage}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Current Emiratization
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Target: {tawteenCompliance.targetPercentage}%
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge
                          className={`text-lg px-4 py-2 ${
                            tawteenCompliance.complianceStatus === "compliant"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tawteenCompliance.complianceStatus === "compliant"
                            ? "Compliant"
                            : "Non-Compliant"}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-2">
                          Compliance Status
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {tawteenCompliance.gapAnalysis}
                        </div>
                        <div className="text-sm text-gray-600">Staff Gap</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Additional Emirati staff needed
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-3">
                          Training Compliance
                        </h4>
                        <div className="flex items-center justify-between">
                          <span>Training Programs</span>
                          {tawteenCompliance.trainingCompliance ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-3">
                          Reporting Compliance
                        </h4>
                        <div className="flex items-center justify-between">
                          <span>Monthly Reports</span>
                          {tawteenCompliance.reportingCompliance ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADHICS V2 Tab */}
          <TabsContent value="adhics" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>ADHICS V2 Standards Validation</CardTitle>
                <p className="text-sm text-gray-600">
                  Abu Dhabi Healthcare Information and Cyber Security compliance
                </p>
              </CardHeader>
              <CardContent>
                {adhicsValidation && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {adhicsValidation.overallScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall ADHICS Score
                        </div>
                        <Badge
                          className={`mt-2 ${
                            adhicsValidation.certificationStatus === "certified"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {adhicsValidation.certificationStatus === "certified"
                            ? "Certified"
                            : "Improvement Required"}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          Compliance Gaps
                        </div>
                        <div className="text-3xl font-bold text-orange-600">
                          {adhicsValidation.complianceGaps.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Items to address
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Governance Compliance</span>
                          <span className="font-semibold">
                            {adhicsValidation.governanceCompliance}%
                          </span>
                        </div>
                        <Progress
                          value={adhicsValidation.governanceCompliance}
                          className="h-2"
                        />

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Technical Controls</span>
                          <span className="font-semibold">
                            {adhicsValidation.technicalControls}%
                          </span>
                        </div>
                        <Progress
                          value={adhicsValidation.technicalControls}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Asset Management</span>
                          <span className="font-semibold">
                            {adhicsValidation.assetManagement}%
                          </span>
                        </div>
                        <Progress
                          value={adhicsValidation.assetManagement}
                          className="h-2"
                        />

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Information Security</span>
                          <span className="font-semibold">
                            {adhicsValidation.informationSecurity}%
                          </span>
                        </div>
                        <Progress
                          value={adhicsValidation.informationSecurity}
                          className="h-2"
                        />
                      </div>
                    </div>

                    {adhicsValidation.complianceGaps.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded">
                        <h4 className="font-semibold mb-2 text-yellow-800">
                          Compliance Gaps
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {adhicsValidation.complianceGaps.map((gap, index) => (
                            <li key={index} className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automated Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Generation */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Automated Reports
                    </span>
                    <Button
                      size="sm"
                      onClick={runComprehensiveValidation}
                      disabled={validationInProgress}
                    >
                      {validationInProgress ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Generate Report
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automatedReports.length > 0 ? (
                      automatedReports.map((report, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{report.name}</div>
                              <div className="text-sm text-gray-600">
                                Generated: {new Date(report.generated_at).toLocaleString()}
                              </div>
                            </div>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportComplianceReport('pdf')}
                              disabled={exportInProgress}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportComplianceReport('excel')}
                              disabled={exportInProgress}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Excel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportComplianceReport('csv')}
                              disabled={exportInProgress}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No automated reports generated yet</p>
                        <p className="text-sm">Click "Generate Report" to create your first automated compliance report</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Report Analytics */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Report Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportAnalytics ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {reportAnalytics.overview.total_reports}
                          </div>
                          <div className="text-sm text-gray-600">Total Reports</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {reportAnalytics.performance_metrics.success_rate}
                          </div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Completed</span>
                          <span className="text-sm font-medium">{reportAnalytics.overview.completed_reports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Scheduled</span>
                          <span className="text-sm font-medium">{reportAnalytics.overview.scheduled_reports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Failed</span>
                          <span className="text-sm font-medium">{reportAnalytics.overview.failed_reports}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Export Statistics</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>PDF:</span>
                            <span>{reportAnalytics.export_statistics.pdf_exports}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Excel:</span>
                            <span>{reportAnalytics.export_statistics.excel_exports}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>CSV:</span>
                            <span>{reportAnalytics.export_statistics.csv_exports}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>JSON:</span>
                            <span>{reportAnalytics.export_statistics.json_exports}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Loading analytics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Management Tab */}
          <TabsContent value="audits" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Compliance Audits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAudits.length > 0 ? (
                    upcomingAudits.map((audit, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{audit.name}</h3>
                            <p className="text-sm text-gray-600">
                              {audit.audit_type} - {audit.regulatory_body.toUpperCase()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(audit.status)}>
                            {audit.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Start Date:</span>
                            <div>{new Date(audit.schedule_config.start_date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <div>{audit.schedule_config.duration_days} days</div>
                          </div>
                          <div>
                            <span className="font-medium">Lead Auditor:</span>
                            <div>{audit.audit_team.lead_auditor}</div>
                          </div>
                          <div>
                            <span className="font-medium">Preparation Days:</span>
                            <div>{audit.schedule_config.preparation_days} days</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2">Scope:</h4>
                          <div className="flex flex-wrap gap-1">
                            {audit.scope.compliance_domains.map((domain: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming audits scheduled</p>
                      <p className="text-sm">Audit schedules will appear here when configured</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>12 Comprehensive Compliance Rules</CardTitle>
                <p className="text-sm text-gray-600">
                  Automated validation rules ensuring DOH compliance standards
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(rule.status)}
                          <span className="font-medium">{rule.title}</span>
                          <Badge variant="outline">{rule.id}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${
                              rule.severity === "critical"
                                ? "border-red-500 text-red-700"
                                : rule.severity === "high"
                                  ? "border-orange-500 text-orange-700"
                                  : rule.severity === "medium"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-gray-500 text-gray-700"
                            }`}
                          >
                            {rule.severity}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {rule.description}
                      </p>

                      {rule.evidence && rule.evidence.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">
                            Evidence:
                          </h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rule.evidence.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-center space-x-1"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rule.recommendations &&
                        rule.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-1">
                              Recommendations:
                            </h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {rule.recommendations.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-center space-x-1"
                                >
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="text-xs text-gray-500 mt-3">
                        Last checked:{" "}
                        {new Date(rule.lastChecked).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={runComprehensiveValidation}
            disabled={validationInProgress}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {validationInProgress ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Automated Validation...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Comprehensive Automation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportComplianceReport('pdf')}
            disabled={exportInProgress || automatedReports.length === 0}
          >
            {exportInProgress ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF Report
          </Button>
          <Button
            variant="outline"
            onClick={() => exportComplianceReport('excel')}
            disabled={exportInProgress || automatedReports.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel Report
          </Button>
          <Button
            variant="outline"
            onClick={refreshComplianceData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
          >
            {realTimeMonitoring ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Pause Monitoring
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resume Monitoring
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DOHComplianceValidator;
