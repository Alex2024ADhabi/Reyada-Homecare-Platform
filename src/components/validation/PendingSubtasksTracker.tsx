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
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  ArrowRight,
  FileText,
  Database,
  Shield,
  Smartphone,
  Zap,
  BarChart,
} from "lucide-react";

interface SubTask {
  id: string;
  title: string;
  description: string;
  phase: number;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status:
    | "Not Started"
    | "In Progress"
    | "Partially Complete"
    | "Complete"
    | "Blocked";
  estimatedHours: number;
  dependencies: string[];
  technicalDebt: boolean;
  complianceImpact: boolean;
}

interface PhaseData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completionRate: number;
  criticalTasks: number;
  totalTasks: number;
}

const PendingSubtasksTracker: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("Pending");

  const phases: PhaseData[] = [
    {
      id: 1,
      title: "Foundation & Core Infrastructure",
      description: "Database schema, authentication, and core platform setup",
      icon: <Database className="h-5 w-5" />,
      completionRate: 65,
      criticalTasks: 8,
      totalTasks: 23,
    },
    {
      id: 2,
      title: "Patient Management & Episodes",
      description:
        "Patient registration, episode management, and care coordination",
      icon: <FileText className="h-5 w-5" />,
      completionRate: 45,
      criticalTasks: 12,
      totalTasks: 28,
    },
    {
      id: 3,
      title: "Clinical Documentation System",
      description:
        "16 clinical forms, electronic signatures, and documentation workflows",
      icon: <FileText className="h-5 w-5" />,
      completionRate: 35,
      criticalTasks: 18,
      totalTasks: 42,
    },
    {
      id: 4,
      title: "DOH Compliance & Validation",
      description:
        "9-domain assessment, compliance monitoring, and regulatory reporting",
      icon: <Shield className="h-5 w-5" />,
      completionRate: 25,
      criticalTasks: 22,
      totalTasks: 35,
    },
    {
      id: 5,
      title: "Mobile & Offline Capabilities",
      description:
        "Mobile optimization, offline sync, voice-to-text, and camera integration",
      icon: <Smartphone className="h-5 w-5" />,
      completionRate: 15,
      criticalTasks: 28,
      totalTasks: 38,
    },
    {
      id: 6,
      title: "Performance & Scalability",
      description:
        "Performance optimization, scalability testing, and production readiness",
      icon: <Zap className="h-5 w-5" />,
      completionRate: 10,
      criticalTasks: 31,
      totalTasks: 45,
    },
  ];

  const pendingSubtasks: SubTask[] = [
    // Phase 1: Foundation & Core Infrastructure
    {
      id: "P1-001",
      title: "Complete Database Schema Migration",
      description:
        "Implement missing tables: medical_records, medications, appointments with proper indexes and constraints",
      phase: 1,
      category: "Database",
      priority: "Critical",
      status: "Partially Complete",
      estimatedHours: 16,
      dependencies: [],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P1-002",
      title: "Row Level Security (RLS) Implementation",
      description:
        "Complete RLS policies for all tables with proper user role-based access control",
      phase: 1,
      category: "Security",
      priority: "Critical",
      status: "In Progress",
      estimatedHours: 24,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P1-003",
      title: "Multi-Factor Authentication (MFA)",
      description:
        "Implement TOTP-based MFA with backup codes and recovery options",
      phase: 1,
      category: "Authentication",
      priority: "High",
      status: "Not Started",
      estimatedHours: 32,
      dependencies: ["P1-002"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P1-004",
      title: "Audit Trail System",
      description:
        "Complete audit logging for all CRUD operations with tamper-proof storage",
      phase: 1,
      category: "Compliance",
      priority: "Critical",
      status: "Partially Complete",
      estimatedHours: 20,
      dependencies: ["P1-001"],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P1-005",
      title: "Data Encryption at Rest",
      description:
        "Implement AES-256 encryption for sensitive patient data fields",
      phase: 1,
      category: "Security",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 28,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P1-006",
      title: "API Rate Limiting & Throttling",
      description:
        "Implement rate limiting to prevent abuse and ensure system stability",
      phase: 1,
      category: "Performance",
      priority: "High",
      status: "Not Started",
      estimatedHours: 12,
      dependencies: [],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P1-007",
      title: "Error Handling & Logging Framework",
      description:
        "Comprehensive error handling with structured logging and alerting",
      phase: 1,
      category: "Infrastructure",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 16,
      dependencies: [],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P1-008",
      title: "Backup & Disaster Recovery",
      description:
        "Automated backup system with point-in-time recovery capabilities",
      phase: 1,
      category: "Infrastructure",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 40,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },

    // Phase 2: Patient Management & Episodes
    {
      id: "P2-001",
      title: "Emirates ID Integration",
      description:
        "Complete integration with UAE Pass and Emirates ID verification system",
      phase: 2,
      category: "Integration",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 48,
      dependencies: ["P1-002"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P2-002",
      title: "Insurance Verification System",
      description:
        "Real-time insurance eligibility verification with DAMAN, ADNIC, and other providers",
      phase: 2,
      category: "Integration",
      priority: "Critical",
      status: "Partially Complete",
      estimatedHours: 56,
      dependencies: [],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P2-003",
      title: "Episode Management Workflow",
      description:
        "Complete episode lifecycle management with care team assignment and tracking",
      phase: 2,
      category: "Workflow",
      priority: "High",
      status: "In Progress",
      estimatedHours: 32,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P2-004",
      title: "Patient Search & Filtering",
      description:
        "Advanced search capabilities with fuzzy matching and multiple criteria",
      phase: 2,
      category: "UI/UX",
      priority: "Medium",
      status: "Partially Complete",
      estimatedHours: 20,
      dependencies: ["P1-001"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P2-005",
      title: "Care Team Management",
      description:
        "Dynamic care team assignment with role-based permissions and notifications",
      phase: 2,
      category: "Workflow",
      priority: "High",
      status: "Not Started",
      estimatedHours: 28,
      dependencies: ["P1-002", "P2-003"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P2-006",
      title: "Patient Demographics Validation",
      description:
        "Comprehensive validation rules for patient data with duplicate detection",
      phase: 2,
      category: "Validation",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 24,
      dependencies: ["P2-001"],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P2-007",
      title: "Emergency Contact Management",
      description:
        "Emergency contact system with automated notifications and escalation",
      phase: 2,
      category: "Communication",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 16,
      dependencies: ["P2-003"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P2-008",
      title: "Patient Consent Management",
      description: "Digital consent forms with version control and audit trail",
      phase: 2,
      category: "Compliance",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 36,
      dependencies: ["P1-004"],
      technicalDebt: false,
      complianceImpact: true,
    },

    // Phase 3: Clinical Documentation System
    {
      id: "P3-001",
      title: "16 Clinical Forms Implementation",
      description:
        "Complete implementation of all 16 DOH-required clinical forms with validation",
      phase: 3,
      category: "Forms",
      priority: "Critical",
      status: "Partially Complete",
      estimatedHours: 120,
      dependencies: ["P1-001", "P4-001"],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P3-002",
      title: "Electronic Signature System",
      description:
        "Digital signature implementation with PKI and non-repudiation",
      phase: 3,
      category: "Security",
      priority: "Critical",
      status: "In Progress",
      estimatedHours: 48,
      dependencies: ["P1-005"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P3-003",
      title: "Form Versioning & History",
      description:
        "Version control system for clinical forms with change tracking",
      phase: 3,
      category: "Data Management",
      priority: "High",
      status: "Not Started",
      estimatedHours: 32,
      dependencies: ["P1-004"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P3-004",
      title: "Clinical Decision Support",
      description:
        "Rule-based clinical decision support with alerts and recommendations",
      phase: 3,
      category: "Intelligence",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 64,
      dependencies: ["P3-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P3-005",
      title: "Form Auto-Save & Recovery",
      description:
        "Automatic form saving with crash recovery and data loss prevention",
      phase: 3,
      category: "UI/UX",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 20,
      dependencies: ["P3-001"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P3-006",
      title: "Clinical Templates & Macros",
      description:
        "Customizable templates and text macros for efficient documentation",
      phase: 3,
      category: "Productivity",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 28,
      dependencies: ["P3-001"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P3-007",
      title: "Medication Management Integration",
      description:
        "Integration with medication databases and drug interaction checking",
      phase: 3,
      category: "Integration",
      priority: "High",
      status: "Not Started",
      estimatedHours: 40,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P3-008",
      title: "Clinical Workflow Automation",
      description:
        "Automated workflows for common clinical processes and notifications",
      phase: 3,
      category: "Automation",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 36,
      dependencies: ["P3-001", "P2-005"],
      technicalDebt: false,
      complianceImpact: false,
    },

    // Phase 4: DOH Compliance & Validation
    {
      id: "P4-001",
      title: "9-Domain Assessment Framework",
      description:
        "Complete implementation of DOH 9-domain assessment with scoring algorithms",
      phase: 4,
      category: "Compliance",
      priority: "Critical",
      status: "Partially Complete",
      estimatedHours: 80,
      dependencies: ["P1-001"],
      technicalDebt: true,
      complianceImpact: true,
    },
    {
      id: "P4-002",
      title: "Real-time Compliance Monitoring",
      description:
        "Continuous monitoring system for DOH compliance with automated alerts",
      phase: 4,
      category: "Monitoring",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 56,
      dependencies: ["P4-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P4-003",
      title: "Patient Safety Taxonomy",
      description:
        "Implementation of WHO patient safety taxonomy with incident reporting",
      phase: 4,
      category: "Safety",
      priority: "Critical",
      status: "In Progress",
      estimatedHours: 48,
      dependencies: ["P1-004"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P4-004",
      title: "DOH Reporting Engine",
      description:
        "Automated generation of DOH-required reports with scheduling and delivery",
      phase: 4,
      category: "Reporting",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 64,
      dependencies: ["P4-001", "P4-002"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P4-005",
      title: "Compliance Dashboard",
      description:
        "Executive dashboard for compliance status with drill-down capabilities",
      phase: 4,
      category: "Analytics",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 32,
      dependencies: ["P4-002"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P4-006",
      title: "Quality Indicators Tracking",
      description:
        "Automated tracking and calculation of healthcare quality indicators",
      phase: 4,
      category: "Quality",
      priority: "High",
      status: "Not Started",
      estimatedHours: 40,
      dependencies: ["P4-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P4-007",
      title: "Regulatory Change Management",
      description:
        "System to track and implement regulatory changes with impact assessment",
      phase: 4,
      category: "Governance",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 36,
      dependencies: ["P4-002"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P4-008",
      title: "Compliance Training Module",
      description:
        "Interactive training modules for staff on DOH compliance requirements",
      phase: 4,
      category: "Training",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 48,
      dependencies: ["P4-001"],
      technicalDebt: false,
      complianceImpact: false,
    },

    // Phase 5: Mobile & Offline Capabilities
    {
      id: "P5-001",
      title: "Progressive Web App (PWA)",
      description:
        "Convert platform to PWA with offline capabilities and app-like experience",
      phase: 5,
      category: "Mobile",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 72,
      dependencies: [],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P5-002",
      title: "Offline Data Synchronization",
      description:
        "Robust offline sync with conflict resolution and data integrity checks",
      phase: 5,
      category: "Sync",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 96,
      dependencies: ["P5-001", "P1-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P5-003",
      title: "Voice-to-Text Integration",
      description:
        "Medical terminology-aware voice recognition with accuracy optimization",
      phase: 5,
      category: "AI/ML",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 48,
      dependencies: ["P3-001"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P5-004",
      title: "Camera Integration for Wound Documentation",
      description:
        "Secure photo capture with HIPAA-compliant storage and annotation tools",
      phase: 5,
      category: "Media",
      priority: "High",
      status: "In Progress",
      estimatedHours: 40,
      dependencies: ["P1-005"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P5-005",
      title: "Mobile-Optimized UI/UX",
      description: "Responsive design optimization for tablets and smartphones",
      phase: 5,
      category: "UI/UX",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 56,
      dependencies: ["P5-001"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P5-006",
      title: "Biometric Authentication",
      description:
        "Fingerprint and face recognition for mobile device authentication",
      phase: 5,
      category: "Security",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 32,
      dependencies: ["P1-003", "P5-001"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P5-007",
      title: "GPS Location Services",
      description:
        "Location tracking for home visits with privacy controls and audit trail",
      phase: 5,
      category: "Location",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 28,
      dependencies: ["P5-001", "P1-004"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P5-008",
      title: "Push Notifications System",
      description:
        "Real-time notifications for critical alerts and workflow updates",
      phase: 5,
      category: "Communication",
      priority: "High",
      status: "Not Started",
      estimatedHours: 24,
      dependencies: ["P5-001"],
      technicalDebt: false,
      complianceImpact: false,
    },

    // Phase 6: Performance & Scalability
    {
      id: "P6-001",
      title: "Database Performance Optimization",
      description:
        "Query optimization, indexing strategy, and connection pooling",
      phase: 6,
      category: "Performance",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 48,
      dependencies: ["P1-001"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P6-002",
      title: "Caching Strategy Implementation",
      description:
        "Multi-level caching with Redis and application-level caching",
      phase: 6,
      category: "Performance",
      priority: "High",
      status: "Not Started",
      estimatedHours: 40,
      dependencies: ["P6-001"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P6-003",
      title: "Load Testing & Stress Testing",
      description:
        "Comprehensive performance testing with realistic load scenarios",
      phase: 6,
      category: "Testing",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 56,
      dependencies: ["P6-001", "P6-002"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P6-004",
      title: "Auto-scaling Infrastructure",
      description:
        "Kubernetes-based auto-scaling with resource monitoring and alerting",
      phase: 6,
      category: "Infrastructure",
      priority: "High",
      status: "Not Started",
      estimatedHours: 64,
      dependencies: ["P6-003"],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P6-005",
      title: "CDN Implementation",
      description: "Content delivery network for static assets and media files",
      phase: 6,
      category: "Performance",
      priority: "Medium",
      status: "Not Started",
      estimatedHours: 24,
      dependencies: [],
      technicalDebt: false,
      complianceImpact: false,
    },
    {
      id: "P6-006",
      title: "Application Performance Monitoring",
      description:
        "Real-time performance monitoring with alerting and analytics",
      phase: 6,
      category: "Monitoring",
      priority: "High",
      status: "Partially Complete",
      estimatedHours: 32,
      dependencies: ["P6-001"],
      technicalDebt: true,
      complianceImpact: false,
    },
    {
      id: "P6-007",
      title: "Security Performance Testing",
      description:
        "Performance impact assessment of security measures and optimization",
      phase: 6,
      category: "Security",
      priority: "High",
      status: "Not Started",
      estimatedHours: 40,
      dependencies: ["P1-005", "P6-003"],
      technicalDebt: false,
      complianceImpact: true,
    },
    {
      id: "P6-008",
      title: "Disaster Recovery Testing",
      description:
        "Regular DR testing with RTO/RPO validation and documentation",
      phase: 6,
      category: "Reliability",
      priority: "Critical",
      status: "Not Started",
      estimatedHours: 48,
      dependencies: ["P1-008"],
      technicalDebt: false,
      complianceImpact: true,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "Partially Complete":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "Blocked":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTasks = pendingSubtasks.filter((task) => {
    const phaseMatch = selectedPhase === 0 || task.phase === selectedPhase;
    const priorityMatch =
      filterPriority === "All" || task.priority === filterPriority;
    const statusMatch =
      filterStatus === "All" ||
      (filterStatus === "Pending" && task.status !== "Complete") ||
      task.status === filterStatus;
    return phaseMatch && priorityMatch && statusMatch;
  });

  const totalEstimatedHours = filteredTasks.reduce(
    (sum, task) => sum + task.estimatedHours,
    0,
  );
  const criticalTasks = filteredTasks.filter(
    (task) => task.priority === "Critical",
  ).length;
  const technicalDebtTasks = filteredTasks.filter(
    (task) => task.technicalDebt,
  ).length;
  const complianceImpactTasks = filteredTasks.filter(
    (task) => task.complianceImpact,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Reyada Homecare Platform - Pending Subtasks Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tracking of all pending implementation tasks across
            the 6 development phases
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {filteredTasks.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Across all phases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Critical Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {criticalTasks}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estimated Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalEstimatedHours}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total development time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Compliance Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {complianceImpactTasks}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Affect regulatory compliance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Phase Completion Overview
            </CardTitle>
            <CardDescription>
              Progress tracking across all 6 development phases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {phase.icon}
                    <div>
                      <h3 className="font-semibold text-sm">{phase.title}</h3>
                      <p className="text-xs text-gray-500">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{phase.completionRate}%</span>
                    </div>
                    <Progress value={phase.completionRate} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{phase.criticalTasks} critical tasks</span>
                      <span>{phase.totalTasks} total tasks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value={0}>All Phases</option>
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      Phase {phase.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Partially Complete">Partially Complete</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.technicalDebt && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          Technical Debt
                        </Badge>
                      )}
                      {task.complianceImpact && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          Compliance Impact
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Phase {task.phase}</span>
                      <span>•</span>
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>{task.estimatedHours} hours</span>
                      <span>•</span>
                      <span>Status: {task.status}</span>
                    </div>

                    {task.dependencies.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">
                          Dependencies:{" "}
                        </span>
                        <span className="text-sm text-gray-600">
                          {task.dependencies.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Critical Alerts */}
        {criticalTasks > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Critical Tasks Require Immediate Attention
            </AlertTitle>
            <AlertDescription className="text-red-700">
              There are {criticalTasks} critical priority tasks that need
              immediate implementation to ensure platform stability, security,
              and regulatory compliance.
            </AlertDescription>
          </Alert>
        )}

        {technicalDebtTasks > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              Technical Debt Identified
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              {technicalDebtTasks} tasks have been identified as technical debt
              that should be addressed to maintain code quality and system
              maintainability.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PendingSubtasksTracker;
