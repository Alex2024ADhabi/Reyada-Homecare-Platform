import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Code,
  Database,
  Shield,
  Smartphone,
  Globe,
  Settings,
  FileCheck,
  Users,
  Activity,
  Zap,
  Bug,
  Wrench,
  RefreshCw,
  Download,
  Play,
  Pause,
  CheckSquare,
  Square,
  ArrowRight,
  Calendar,
  GitBranch,
  Layers,
} from "lucide-react";

interface PendingSubtask {
  id: string;
  phase: string;
  category: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "not_started" | "in_progress" | "blocked" | "testing" | "complete";
  estimatedHours: number;
  dependencies: string[];
  blockers: string[];
  technicalRequirements: string[];
  acceptanceCriteria: string[];
  assignedTo?: string;
  dueDate?: string;
  completionPercentage: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  businessImpact: string;
  technicalDebt: number;
}

interface PhaseStatus {
  phase: string;
  title: string;
  description: string;
  overallCompletion: number;
  criticalSubtasks: number;
  totalSubtasks: number;
  completedSubtasks: number;
  blockedSubtasks: number;
  estimatedDaysRemaining: number;
  riskScore: number;
  qualityScore: number;
}

interface ImplementationMetrics {
  totalSubtasks: number;
  completedSubtasks: number;
  criticalPendingSubtasks: number;
  highPriorityPendingSubtasks: number;
  blockedSubtasks: number;
  overallCompletionPercentage: number;
  estimatedCompletionDate: string;
  totalEstimatedHours: number;
  remainingEstimatedHours: number;
  averageQualityScore: number;
  riskAssessment: string;
  technicalDebtScore: number;
}

const ComprehensiveImplementationTracker: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Comprehensive pending subtasks across all phases
  const pendingSubtasks: PendingSubtask[] = [
    // PHASE 1: Core Patient Management & Clinical Documentation
    {
      id: "p1-patient-registration-enhancement",
      phase: "Phase 1",
      category: "Patient Management",
      title: "Enhanced Patient Registration with Emirates ID Integration",
      description:
        "Complete integration with Emirates ID verification system and enhanced demographic data collection",
      priority: "critical",
      status: "in_progress",
      estimatedHours: 32,
      dependencies: ["Emirates ID API Access", "Security Framework"],
      blockers: [],
      technicalRequirements: [
        "Emirates ID SDK integration",
        "Real-time verification API",
        "Biometric data handling",
        "Multi-language support (Arabic/English)",
        "Offline verification fallback",
      ],
      acceptanceCriteria: [
        "Emirates ID verification works in real-time",
        "Demographic data auto-populates accurately",
        "Biometric verification functions correctly",
        "Offline mode handles verification gracefully",
        "Multi-language interface works seamlessly",
      ],
      completionPercentage: 65,
      riskLevel: "medium",
      businessImpact: "High - Core functionality for patient onboarding",
      technicalDebt: 2,
    },
    {
      id: "p1-clinical-forms-mobile-optimization",
      phase: "Phase 1",
      category: "Clinical Documentation",
      title: "Mobile-Optimized Clinical Forms with Offline Capability",
      description:
        "Complete mobile optimization of all 16 clinical forms with offline data collection and sync",
      priority: "critical",
      status: "not_started",
      estimatedHours: 48,
      dependencies: ["PWA Infrastructure", "Offline Sync Service"],
      blockers: ["PWA Service Worker Implementation"],
      technicalRequirements: [
        "Responsive form layouts for mobile devices",
        "Touch-optimized input controls",
        "Offline data storage with IndexedDB",
        "Background sync when connection restored",
        "Voice-to-text input for clinical notes",
      ],
      acceptanceCriteria: [
        "All forms work seamlessly on mobile devices",
        "Offline data collection functions correctly",
        "Data syncs automatically when online",
        "Voice input recognizes medical terminology",
        "Form validation works offline",
      ],
      completionPercentage: 0,
      riskLevel: "high",
      businessImpact: "Critical - Mobile workforce depends on this",
      technicalDebt: 4,
    },
    {
      id: "p1-digital-signature-integration",
      phase: "Phase 1",
      category: "Clinical Documentation",
      title: "Advanced Digital Signature Framework",
      description:
        "Complete digital signature implementation with biometric authentication and legal compliance",
      priority: "high",
      status: "testing",
      estimatedHours: 24,
      dependencies: ["Security Framework", "Biometric Authentication"],
      blockers: [],
      technicalRequirements: [
        "Biometric signature capture",
        "PKI certificate management",
        "Timestamp authority integration",
        "Signature verification system",
        "Legal compliance validation",
      ],
      acceptanceCriteria: [
        "Biometric signatures capture correctly",
        "Signatures are legally compliant",
        "Verification system works accurately",
        "Timestamp validation functions",
        "Certificate management is automated",
      ],
      completionPercentage: 85,
      riskLevel: "medium",
      businessImpact: "High - Required for legal document validity",
      technicalDebt: 1,
    },

    // PHASE 2: DOH Compliance & Regulatory Integration
    {
      id: "p2-doh-nine-domains-automation",
      phase: "Phase 2",
      category: "DOH Compliance",
      title: "Automated DOH Nine Domains Assessment",
      description:
        "Complete automation of DOH nine domains assessment with real-time scoring and recommendations",
      priority: "critical",
      status: "in_progress",
      estimatedHours: 40,
      dependencies: ["Clinical Documentation", "AI Analytics Engine"],
      blockers: [],
      technicalRequirements: [
        "Nine domains scoring algorithm",
        "Real-time assessment engine",
        "Automated recommendation system",
        "Compliance gap analysis",
        "DOH reporting integration",
      ],
      acceptanceCriteria: [
        "Nine domains assessment is fully automated",
        "Scoring algorithm matches DOH standards",
        "Recommendations are contextually relevant",
        "Gap analysis identifies specific issues",
        "Reports generate in DOH-required format",
      ],
      completionPercentage: 70,
      riskLevel: "high",
      businessImpact: "Critical - DOH compliance is mandatory",
      technicalDebt: 3,
    },
    {
      id: "p2-real-time-compliance-monitoring",
      phase: "Phase 2",
      category: "DOH Compliance",
      title: "Real-Time Compliance Monitoring Dashboard",
      description:
        "Live monitoring dashboard for DOH compliance with alerts and automated corrective actions",
      priority: "high",
      status: "not_started",
      estimatedHours: 32,
      dependencies: ["DOH Nine Domains Automation", "Alert System"],
      blockers: [],
      technicalRequirements: [
        "Real-time compliance scoring",
        "Automated alert system",
        "Corrective action workflows",
        "Compliance trend analysis",
        "Executive dashboard views",
      ],
      acceptanceCriteria: [
        "Real-time compliance scores display accurately",
        "Alerts trigger for compliance violations",
        "Corrective actions execute automatically",
        "Trend analysis provides insights",
        "Executive views show high-level status",
      ],
      completionPercentage: 0,
      riskLevel: "medium",
      businessImpact: "High - Proactive compliance management",
      technicalDebt: 2,
    },
    {
      id: "p2-jawda-kpi-automation",
      phase: "Phase 2",
      category: "JAWDA Compliance",
      title: "JAWDA KPI Automated Tracking and Reporting",
      description:
        "Automated JAWDA KPI calculation, tracking, and reporting with predictive analytics",
      priority: "high",
      status: "blocked",
      estimatedHours: 36,
      dependencies: ["Clinical Data Analytics", "Reporting Engine"],
      blockers: ["JAWDA API Access Pending"],
      technicalRequirements: [
        "JAWDA KPI calculation engine",
        "Automated data collection",
        "Predictive analytics for KPI trends",
        "Automated report generation",
        "JAWDA portal integration",
      ],
      acceptanceCriteria: [
        "All JAWDA KPIs calculate automatically",
        "Data collection is comprehensive",
        "Predictive analytics provide insights",
        "Reports generate in JAWDA format",
        "Portal integration works seamlessly",
      ],
      completionPercentage: 15,
      riskLevel: "high",
      businessImpact: "Critical - JAWDA accreditation requirement",
      technicalDebt: 5,
    },

    // PHASE 3: Revenue Management & Claims Processing
    {
      id: "p3-daman-real-time-integration",
      phase: "Phase 3",
      category: "Insurance Integration",
      title: "DAMAN Real-Time Authorization and Claims Processing",
      description:
        "Complete real-time integration with DAMAN for authorization, claims submission, and status tracking",
      priority: "critical",
      status: "in_progress",
      estimatedHours: 56,
      dependencies: ["Security Framework", "API Gateway"],
      blockers: [],
      technicalRequirements: [
        "DAMAN API integration",
        "Real-time authorization checking",
        "Automated claims submission",
        "Status tracking and updates",
        "Error handling and retry logic",
      ],
      acceptanceCriteria: [
        "Real-time authorization works correctly",
        "Claims submit automatically",
        "Status updates in real-time",
        "Error handling is robust",
        "Retry logic handles failures gracefully",
      ],
      completionPercentage: 60,
      riskLevel: "high",
      businessImpact: "Critical - Revenue generation depends on this",
      technicalDebt: 3,
    },
    {
      id: "p3-revenue-analytics-ai",
      phase: "Phase 3",
      category: "Revenue Analytics",
      title: "AI-Powered Revenue Analytics and Optimization",
      description:
        "Advanced AI analytics for revenue optimization, denial prediction, and financial forecasting",
      priority: "medium",
      status: "not_started",
      estimatedHours: 44,
      dependencies: ["AI Analytics Engine", "Revenue Data Pipeline"],
      blockers: ["AI Analytics Engine Not Implemented"],
      technicalRequirements: [
        "Machine learning models for denial prediction",
        "Revenue optimization algorithms",
        "Financial forecasting models",
        "Automated pricing recommendations",
        "Performance benchmarking",
      ],
      acceptanceCriteria: [
        "Denial prediction accuracy >85%",
        "Revenue optimization shows measurable improvement",
        "Financial forecasts are accurate within 10%",
        "Pricing recommendations are data-driven",
        "Benchmarking provides competitive insights",
      ],
      completionPercentage: 0,
      riskLevel: "medium",
      businessImpact: "High - Revenue optimization potential",
      technicalDebt: 4,
    },

    // PHASE 4: Performance & Security Optimization
    {
      id: "p4-advanced-caching-optimization",
      phase: "Phase 4",
      category: "Performance Optimization",
      title: "Advanced Multi-Layer Caching System",
      description:
        "Implement intelligent multi-layer caching with Redis, CDN, and application-level caching",
      priority: "high",
      status: "in_progress",
      estimatedHours: 28,
      dependencies: ["Redis Infrastructure", "CDN Setup"],
      blockers: [],
      technicalRequirements: [
        "Redis cluster configuration",
        "CDN integration for static assets",
        "Application-level caching strategies",
        "Cache invalidation mechanisms",
        "Performance monitoring integration",
      ],
      acceptanceCriteria: [
        "Multi-layer caching reduces response time by >50%",
        "Cache hit rate exceeds 90%",
        "Invalidation mechanisms work correctly",
        "Performance monitoring shows improvements",
        "System handles cache failures gracefully",
      ],
      completionPercentage: 75,
      riskLevel: "low",
      businessImpact: "Medium - Performance improvement",
      technicalDebt: 1,
    },
    {
      id: "p4-zero-trust-security",
      phase: "Phase 4",
      category: "Security Enhancement",
      title: "Zero Trust Security Architecture Implementation",
      description:
        "Complete Zero Trust security model with micro-segmentation and continuous verification",
      priority: "critical",
      status: "not_started",
      estimatedHours: 64,
      dependencies: ["Security Framework", "Network Infrastructure"],
      blockers: ["Network Segmentation Planning Required"],
      technicalRequirements: [
        "Micro-segmentation implementation",
        "Continuous authentication system",
        "Behavioral analytics for threat detection",
        "Automated incident response",
        "Compliance monitoring integration",
      ],
      acceptanceCriteria: [
        "Micro-segmentation isolates critical systems",
        "Continuous authentication works seamlessly",
        "Behavioral analytics detect anomalies",
        "Incident response is automated",
        "Compliance monitoring is continuous",
      ],
      completionPercentage: 0,
      riskLevel: "critical",
      businessImpact: "Critical - Healthcare data security",
      technicalDebt: 6,
    },

    // PHASE 5: Integration Testing & Validation
    {
      id: "p5-end-to-end-testing-automation",
      phase: "Phase 5",
      category: "Testing Framework",
      title: "Comprehensive End-to-End Testing Automation",
      description:
        "Complete E2E testing framework covering all healthcare workflows with automated execution",
      priority: "critical",
      status: "in_progress",
      estimatedHours: 52,
      dependencies: ["All Core Features", "Test Infrastructure"],
      blockers: [],
      technicalRequirements: [
        "Playwright/Cypress test framework setup",
        "Healthcare workflow test scenarios",
        "Automated test data generation",
        "CI/CD pipeline integration",
        "Test reporting and analytics",
      ],
      acceptanceCriteria: [
        "All critical workflows have E2E tests",
        "Tests run automatically in CI/CD",
        "Test data generation is automated",
        "Test reports provide actionable insights",
        "Test coverage exceeds 90% for critical paths",
      ],
      completionPercentage: 40,
      riskLevel: "medium",
      businessImpact: "High - Quality assurance",
      technicalDebt: 2,
    },
    {
      id: "p5-performance-load-testing",
      phase: "Phase 5",
      category: "Performance Testing",
      title: "Healthcare-Specific Load and Stress Testing",
      description:
        "Comprehensive load testing simulating real healthcare scenarios with peak load handling",
      priority: "high",
      status: "not_started",
      estimatedHours: 36,
      dependencies: ["Performance Monitoring", "Load Testing Tools"],
      blockers: [],
      technicalRequirements: [
        "K6/Artillery load testing setup",
        "Healthcare scenario simulation",
        "Peak load testing (10x normal load)",
        "Stress testing for breaking points",
        "Performance regression testing",
      ],
      acceptanceCriteria: [
        "System handles 10x normal load",
        "Response times remain <2s under load",
        "No data loss during stress tests",
        "Graceful degradation under extreme load",
        "Performance regression tests pass",
      ],
      completionPercentage: 0,
      riskLevel: "medium",
      businessImpact: "High - System reliability under load",
      technicalDebt: 3,
    },
    {
      id: "p5-security-penetration-testing",
      phase: "Phase 5",
      category: "Security Testing",
      title: "Automated Security and Penetration Testing",
      description:
        "Comprehensive security testing including automated penetration testing and vulnerability assessment",
      priority: "critical",
      status: "not_started",
      estimatedHours: 40,
      dependencies: ["Security Framework", "Testing Infrastructure"],
      blockers: ["Security Testing Tools Setup Required"],
      technicalRequirements: [
        "OWASP ZAP integration",
        "Automated vulnerability scanning",
        "Penetration testing automation",
        "Security compliance validation",
        "Threat modeling and assessment",
      ],
      acceptanceCriteria: [
        "Automated security scans run continuously",
        "Vulnerability assessment is comprehensive",
        "Penetration tests identify no critical issues",
        "Security compliance is validated",
        "Threat models are up-to-date",
      ],
      completionPercentage: 0,
      riskLevel: "critical",
      businessImpact: "Critical - Healthcare data protection",
      technicalDebt: 5,
    },

    // CROSS-CUTTING CONCERNS
    {
      id: "cc-ai-hub-implementation",
      phase: "Cross-Cutting",
      category: "AI & Machine Learning",
      title: "Comprehensive AI Hub Service Implementation",
      description:
        "Complete AI Hub with machine learning models, predictive analytics, and healthcare-specific AI capabilities",
      priority: "critical",
      status: "not_started",
      estimatedHours: 80,
      dependencies: ["Data Pipeline", "ML Infrastructure"],
      blockers: ["ML Infrastructure Not Set Up"],
      technicalRequirements: [
        "Machine learning model training pipeline",
        "Predictive analytics for patient outcomes",
        "Natural language processing for clinical notes",
        "Computer vision for wound assessment",
        "Manpower optimization algorithms",
      ],
      acceptanceCriteria: [
        "ML models achieve >90% accuracy",
        "Predictive analytics provide actionable insights",
        "NLP processes clinical notes correctly",
        "Computer vision accurately assesses wounds",
        "Manpower optimization improves efficiency by >20%",
      ],
      completionPercentage: 0,
      riskLevel: "high",
      businessImpact: "High - Competitive advantage through AI",
      technicalDebt: 7,
    },
    {
      id: "cc-comprehensive-documentation",
      phase: "Cross-Cutting",
      category: "Documentation & Training",
      title: "Complete Documentation and Training System",
      description:
        "Comprehensive documentation, training materials, and knowledge management system",
      priority: "medium",
      status: "not_started",
      estimatedHours: 48,
      dependencies: ["All Features Implemented"],
      blockers: [],
      technicalRequirements: [
        "API documentation with OpenAPI/Swagger",
        "User manuals for all roles",
        "Video training content",
        "Interactive tutorials",
        "Knowledge base system",
      ],
      acceptanceCriteria: [
        "All APIs are fully documented",
        "User manuals cover all workflows",
        "Training videos demonstrate key features",
        "Interactive tutorials guide new users",
        "Knowledge base is searchable and comprehensive",
      ],
      completionPercentage: 0,
      riskLevel: "low",
      businessImpact: "Medium - User adoption and support",
      technicalDebt: 2,
    },
  ];

  // Calculate phase statuses
  const phaseStatuses: PhaseStatus[] = [
    {
      phase: "Phase 1",
      title: "Core Patient Management & Clinical Documentation",
      description:
        "Foundation patient management and clinical documentation systems",
      overallCompletion: 50,
      criticalSubtasks: 2,
      totalSubtasks: 3,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 13,
      riskScore: 65,
      qualityScore: 78,
    },
    {
      phase: "Phase 2",
      title: "DOH Compliance & Regulatory Integration",
      description: "Comprehensive regulatory compliance and reporting systems",
      overallCompletion: 28,
      criticalSubtasks: 1,
      totalSubtasks: 3,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 18,
      riskScore: 72,
      qualityScore: 65,
    },
    {
      phase: "Phase 3",
      title: "Revenue Management & Claims Processing",
      description: "Advanced revenue management and insurance integration",
      overallCompletion: 30,
      criticalSubtasks: 1,
      totalSubtasks: 2,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 15,
      riskScore: 68,
      qualityScore: 70,
    },
    {
      phase: "Phase 4",
      title: "Performance & Security Optimization",
      description: "Advanced performance optimization and security hardening",
      overallCompletion: 38,
      criticalSubtasks: 1,
      totalSubtasks: 2,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 12,
      riskScore: 75,
      qualityScore: 82,
    },
    {
      phase: "Phase 5",
      title: "Integration Testing & Validation",
      description: "Comprehensive testing, validation, and quality assurance",
      overallCompletion: 13,
      criticalSubtasks: 2,
      totalSubtasks: 3,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 20,
      riskScore: 80,
      qualityScore: 60,
    },
    {
      phase: "Cross-Cutting",
      title: "Cross-Cutting Concerns",
      description: "AI, documentation, and platform-wide enhancements",
      overallCompletion: 0,
      criticalSubtasks: 1,
      totalSubtasks: 2,
      completedSubtasks: 0,
      blockedSubtasks: 1,
      estimatedDaysRemaining: 25,
      riskScore: 85,
      qualityScore: 50,
    },
  ];

  // Calculate overall metrics
  const implementationMetrics: ImplementationMetrics = {
    totalSubtasks: pendingSubtasks.length,
    completedSubtasks: pendingSubtasks.filter((t) => t.status === "complete")
      .length,
    criticalPendingSubtasks: pendingSubtasks.filter(
      (t) => t.priority === "critical" && t.status !== "complete",
    ).length,
    highPriorityPendingSubtasks: pendingSubtasks.filter(
      (t) => t.priority === "high" && t.status !== "complete",
    ).length,
    blockedSubtasks: pendingSubtasks.filter((t) => t.status === "blocked")
      .length,
    overallCompletionPercentage: Math.round(
      pendingSubtasks.reduce(
        (sum, task) => sum + task.completionPercentage,
        0,
      ) / pendingSubtasks.length,
    ),
    estimatedCompletionDate: "2024-04-15",
    totalEstimatedHours: pendingSubtasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0,
    ),
    remainingEstimatedHours: pendingSubtasks.reduce(
      (sum, task) =>
        sum + (task.estimatedHours * (100 - task.completionPercentage)) / 100,
      0,
    ),
    averageQualityScore: Math.round(
      phaseStatuses.reduce((sum, phase) => sum + phase.qualityScore, 0) /
        phaseStatuses.length,
    ),
    riskAssessment: "High",
    technicalDebtScore: Math.round(
      pendingSubtasks.reduce((sum, task) => sum + task.technicalDebt, 0) /
        pendingSubtasks.length,
    ),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "testing":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "not_started":
        return <Square className="h-4 w-4 text-gray-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredSubtasks = pendingSubtasks.filter((task) => {
    const phaseMatch = selectedPhase === "all" || task.phase === selectedPhase;
    const priorityMatch =
      selectedPriority === "all" || task.priority === selectedPriority;
    return phaseMatch && priorityMatch;
  });

  const phases = Array.from(new Set(pendingSubtasks.map((task) => task.phase)));
  const priorities = ["critical", "high", "medium", "low"];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Comprehensive Implementation Tracker
          </h1>
          <p className="text-gray-600 mt-2">
            Complete tracking of all pending subtasks across all phases for 100%
            platform robustness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-lg px-4 py-2 bg-blue-50 text-blue-700 border-blue-200"
          >
            {implementationMetrics.overallCompletionPercentage}% Complete
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastUpdated(new Date())}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subtasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {implementationMetrics.totalSubtasks}
                </p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  {implementationMetrics.criticalPendingSubtasks}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked Tasks</p>
                <p className="text-2xl font-bold text-orange-600">
                  {implementationMetrics.blockedSubtasks}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining Hours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(implementationMetrics.remainingEstimatedHours)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Implementation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Platform Completion</span>
                <span>
                  {implementationMetrics.overallCompletionPercentage}%
                </span>
              </div>
              <Progress
                value={implementationMetrics.overallCompletionPercentage}
                className="h-3"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(
                    implementationMetrics.remainingEstimatedHours / 8,
                  )}{" "}
                  days
                </div>
                <div className="text-gray-600">Est. Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {implementationMetrics.averageQualityScore}%
                </div>
                <div className="text-gray-600">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {implementationMetrics.riskAssessment}
                </div>
                <div className="text-gray-600">Risk Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {implementationMetrics.technicalDebtScore}/10
                </div>
                <div className="text-gray-600">Tech Debt</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Phase Overview</TabsTrigger>
          <TabsTrigger value="subtasks">Pending Subtasks</TabsTrigger>
          <TabsTrigger value="critical">Critical Path</TabsTrigger>
          <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phaseStatuses.map((phase) => (
              <Card key={phase.phase} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completion</span>
                        <span>{phase.overallCompletion}%</span>
                      </div>
                      <Progress
                        value={phase.overallCompletion}
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {phase.criticalSubtasks}
                        </div>
                        <div className="text-gray-600">Critical</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {phase.blockedSubtasks}
                        </div>
                        <div className="text-gray-600">Blocked</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Risk: {phase.riskScore}%</span>
                      <span>Quality: {phase.qualityScore}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subtasks" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPhase === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPhase("all")}
            >
              All Phases
            </Button>
            {phases.map((phase) => (
              <Button
                key={phase}
                variant={selectedPhase === phase ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPhase(phase)}
              >
                {phase}
              </Button>
            ))}
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant={selectedPriority === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPriority("all")}
            >
              All Priorities
            </Button>
            {priorities.map((priority) => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>

          {/* Subtasks List */}
          <div className="space-y-4">
            {filteredSubtasks.map((subtask) => (
              <Card key={subtask.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(subtask.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {subtask.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {subtask.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{subtask.phase}</Badge>
                          <Badge variant="outline">{subtask.category}</Badge>
                          <Badge className={getPriorityColor(subtask.priority)}>
                            {subtask.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-lg font-bold">
                        {subtask.completionPercentage}%
                      </div>
                      <Progress
                        value={subtask.completionPercentage}
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">
                        Technical Requirements
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {subtask.technicalRequirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Code className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                      <ul className="space-y-1 text-sm">
                        {subtask.acceptanceCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {subtask.blockers.length > 0 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Blockers</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {subtask.blockers.map((blocker, index) => (
                            <li key={index}>{blocker}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>Effort:</strong> {subtask.estimatedHours}h
                        </span>
                        <span>
                          <strong>Risk:</strong>
                          <span className={getRiskColor(subtask.riskLevel)}>
                            {subtask.riskLevel.charAt(0).toUpperCase() +
                              subtask.riskLevel.slice(1)}
                          </span>
                        </span>
                        <span>
                          <strong>Tech Debt:</strong> {subtask.technicalDebt}/10
                        </span>
                      </div>
                      <Badge variant="outline">
                        {subtask.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Business Impact:</strong> {subtask.businessImpact}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Path Analysis</AlertTitle>
            <AlertDescription>
              These are the critical subtasks that must be completed to achieve
              100% platform robustness. Focus on these items first to minimize
              project risk.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {pendingSubtasks
              .filter((task) => task.priority === "critical")
              .sort((a, b) => a.completionPercentage - b.completionPercentage)
              .map((subtask, index) => (
                <Card key={subtask.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{subtask.title}</h4>
                          <p className="text-sm text-gray-600">
                            {subtask.phase} • {subtask.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Progress</div>
                          <div className="font-bold">
                            {subtask.completionPercentage}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Effort</div>
                          <div className="font-bold">
                            {subtask.estimatedHours}h
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Risk</div>
                          <div
                            className={`font-bold ${getRiskColor(subtask.riskLevel)}`}
                          >
                            {subtask.riskLevel.charAt(0).toUpperCase() +
                              subtask.riskLevel.slice(1)}
                          </div>
                        </div>
                        {getStatusIcon(subtask.status)}
                      </div>
                    </div>
                    {subtask.blockers.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                        <strong className="text-red-700">Blockers:</strong>{" "}
                        {subtask.blockers.join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Implementation Roadmap</AlertTitle>
            <AlertDescription>
              Recommended implementation sequence to achieve 100% platform
              robustness efficiently. Follow this roadmap to minimize
              dependencies and maximize parallel development.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {phaseStatuses.map((phase, phaseIndex) => {
              const phaseSubtasks = pendingSubtasks.filter(
                (task) => task.phase === phase.phase,
              );
              return (
                <Card
                  key={phase.phase}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {phaseIndex + 1}
                          </div>
                          {phase.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {phase.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Est. Duration
                        </div>
                        <div className="font-bold">
                          {phase.estimatedDaysRemaining} days
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {phaseSubtasks
                        .sort((a, b) => {
                          const priorityOrder = {
                            critical: 4,
                            high: 3,
                            medium: 2,
                            low: 1,
                          };
                          return (
                            priorityOrder[b.priority] -
                            priorityOrder[a.priority]
                          );
                        })
                        .map((subtask, index) => (
                          <div
                            key={subtask.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-sm">
                                  {subtask.title}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {subtask.estimatedHours}h •{" "}
                                  {subtask.riskLevel} risk
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getPriorityColor(subtask.priority)}
                                size="sm"
                              >
                                {subtask.priority}
                              </Badge>
                              {getStatusIcon(subtask.status)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Items Summary */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Immediate Action Items for 100% Platform Robustness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-700">
                Critical Priority (Start Immediately)
              </h4>
              <ul className="space-y-2 text-sm">
                {pendingSubtasks
                  .filter(
                    (task) =>
                      task.priority === "critical" &&
                      task.status !== "complete",
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <li key={task.id} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-1 text-red-500 flex-shrink-0" />
                      <span>
                        {task.title} ({task.estimatedHours}h)
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-orange-700">
                Blocked Items (Resolve First)
              </h4>
              <ul className="space-y-2 text-sm">
                {pendingSubtasks
                  .filter((task) => task.status === "blocked")
                  .slice(0, 5)
                  .map((task) => (
                    <li key={task.id} className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 mt-1 text-orange-500 flex-shrink-0" />
                      <span>
                        {task.title} - {task.blockers[0]}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-2">Recommended Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Resolve all blocked items to unblock development</li>
              <li>Start critical priority items in parallel where possible</li>
              <li>
                Set up missing infrastructure (AI Hub, PWA, Testing Framework)
              </li>
              <li>Implement comprehensive testing for existing features</li>
              <li>Focus on security and compliance validation</li>
              <li>Complete documentation and training materials</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveImplementationTracker;
