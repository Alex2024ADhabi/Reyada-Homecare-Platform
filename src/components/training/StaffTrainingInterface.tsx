import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ElectronicSignature } from "@/components/ui/electronic-signature";
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  Search,
  Play,
  CheckCircle,
  Clock,
  Star,
  AlertTriangle,
  Info,
  FileText,
  Video,
  Users,
  Award,
  TrendingUp,
  Certificate,
  Download,
  PenTool,
  Target,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Brain,
  Network,
  Layers,
} from "lucide-react";

interface StaffTrainingInterfaceProps {
  currentField?: string;
  formData?: any;
  onGuidanceApply?: (guidance: string) => void;
  userId?: string;
  userRole?: string;
}

interface UnifiedTrainingData {
  frameworks: DOHCompetencyFramework[];
  trainingModules: TrainingModule[];
  assessments: CompetencyAssessment[];
  educationalResources: any[];
  learningPaths: LearningPath[];
  certifications: CertificationRecord[];
  dashboardData: any;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  competencyLevel: string;
  estimatedDuration: number;
  prerequisites: string[];
  modules: {
    moduleId: string;
    order: number;
    required: boolean;
    estimatedHours: number;
  }[];
  assessments: {
    assessmentId: string;
    type: string;
    passingScore: number;
    attempts: number;
  }[];
  certification: {
    eligible: boolean;
    certificateType: string;
    validityPeriod: number;
  };
  progress: {
    completedModules: string[];
    currentModule?: string;
    overallProgress: number;
    timeSpent: number;
  };
  status: "not_started" | "in_progress" | "completed" | "certified";
  createdAt: string;
  updatedAt: string;
}

interface CertificationRecord {
  id: string;
  userId: string;
  learningPathId?: string;
  moduleId?: string;
  certificationType: string;
  title: string;
  issuedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "revoked";
  competencies: string[];
  assessmentScores: {
    assessmentId: string;
    score: number;
    maxScore: number;
    completedAt: string;
  }[];
  digitalSignature?: string;
  verificationCode: string;
  cpdPoints: number;
}

interface DOHCompetencyFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  competency_domains: any[];
  target_roles: string[];
  compliance_level: string;
  last_updated: string;
  status: string;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  role: string;
  difficulty: string;
  duration: number;
  content_type: string;
  learning_objectives: string[];
  assessment_criteria: any[];
  resources: any[];
  status: string;
}

interface CompetencyAssessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  target_role: string;
  competency_level: string;
  duration: number;
  passing_score: number;
  max_attempts: number;
  questions: any[];
  rubric: any;
  status: string;
}

export const StaffTrainingInterface: React.FC<StaffTrainingInterfaceProps> = ({
  currentField,
  formData,
  onGuidanceApply,
  userId = "current-user",
  userRole = "nurse",
}) => {
  const [unifiedTrainingData, setUnifiedTrainingData] =
    useState<UnifiedTrainingData>({
      frameworks: [],
      trainingModules: [],
      assessments: [],
      educationalResources: [],
      learningPaths: [],
      certifications: [],
      dashboardData: null,
    });

  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<any>(null);
  const [activeCompetencyTab, setActiveCompetencyTab] = useState("overview");
  const [showCompetencyBuilder, setShowCompetencyBuilder] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] =
    useState<LearningPath | null>(null);
  const [showPathBuilder, setShowPathBuilder] = useState(false);
  const [pathProgress, setPathProgress] = useState<{ [key: string]: number }>(
    {},
  );
  const [pendingCertification, setPendingCertification] =
    useState<CertificationRecord | null>(null);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock API functions
  const getCompetencyFrameworks = async (): Promise<
    DOHCompetencyFramework[]
  > => {
    return [
      {
        id: "doh-framework-2024",
        name: "DOH Healthcare Competency Framework 2024",
        version: "2.1",
        description:
          "Comprehensive competency framework aligned with DOH standards",
        competency_domains: [],
        target_roles: ["nurse", "assistant-nurse", "caregiver"],
        compliance_level: "mandatory",
        last_updated: "2024-01-15",
        status: "active",
      },
    ];
  };

  const getTrainingModules = async (
    filters: any,
  ): Promise<TrainingModule[]> => {
    return [
      {
        id: "nurse-basic-care",
        title: "Basic Nursing Care",
        description: "Fundamental nursing care principles",
        role: "nurse",
        difficulty: "beginner",
        duration: 120,
        content_type: "interactive",
        learning_objectives: ["Patient assessment", "Care planning"],
        assessment_criteria: [],
        resources: [],
        status: "active",
      },
    ];
  };

  const getCompetencyAssessments = async (): Promise<
    CompetencyAssessment[]
  > => {
    return [
      {
        id: "nurse-skills-assessment",
        title: "Nursing Skills Assessment",
        description: "Comprehensive skills evaluation",
        assessment_type: "skills",
        target_role: "nurse",
        competency_level: "beginner",
        duration: 60,
        passing_score: 80,
        max_attempts: 3,
        questions: [],
        rubric: {},
        status: "active",
      },
    ];
  };

  const getEducationalResources = async (filters: any) => {
    return [
      {
        id: "resource-001",
        title: "DOH Guidelines 2024",
        resource_type: "guideline",
        description: "Latest DOH healthcare guidelines",
      },
    ];
  };

  const getCompetencyDashboard = async () => {
    return {
      framework_overview: {
        active_frameworks: 3,
        total_competencies: 45,
      },
      training_statistics: {
        total_modules: 28,
        completion_rates: [
          { role: "nurse", completion_rate: 85 },
          { role: "assistant-nurse", completion_rate: 78 },
        ],
      },
      assessment_insights: {
        total_assessments: 15,
        competency_gaps: [
          { competency: "Patient Assessment", gap_percentage: 25 },
        ],
      },
      quality_metrics: {
        inter_rater_reliability: 0.92,
        assessment_validity: 0.88,
        training_effectiveness: 0.85,
        compliance_score: 0.94,
      },
      educational_resources: {
        recent_additions: [
          {
            title: "Updated DOH Guidelines",
            resource_type: "guideline",
            added_date: "2024-01-15",
          },
        ],
      },
    };
  };

  const loadUnifiedTrainingData = async () => {
    try {
      setIsLoading(true);
      const [frameworks, modules, assessments, resources, dashboard] =
        await Promise.all([
          getCompetencyFrameworks(),
          getTrainingModules({
            role: selectedRole === "all" ? undefined : selectedRole,
          }),
          getCompetencyAssessments(),
          getEducationalResources({
            target_role: selectedRole === "all" ? undefined : selectedRole,
          }),
          getCompetencyDashboard(),
        ]);

      // Generate unified learning paths
      const learningPaths = await generateUnifiedLearningPaths(
        frameworks,
        modules,
        assessments,
      );

      // Load user certifications
      const certifications = await loadUserCertifications(userId);

      setUnifiedTrainingData({
        frameworks,
        trainingModules: modules,
        assessments,
        educationalResources: resources,
        learningPaths,
        certifications,
        dashboardData: dashboard,
      });
    } catch (error) {
      console.error("Failed to load unified training data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadUnifiedTrainingData();
      } catch (error) {
        console.error("Error initializing training data:", error);
      }
    };

    initializeData();
  }, [selectedRole]);

  const saveCompetency = async (competencyData: any) => {
    try {
      console.log("Saving competency:", competencyData);
      alert("Competency saved successfully!");
      await loadUnifiedTrainingData();
    } catch (error) {
      console.error("Error saving competency:", error);
      alert("Error saving competency. Please try again.");
    }
  };

  // Unified Learning Path Management Functions
  const generateUnifiedLearningPaths = async (
    frameworks: any[],
    modules: any[],
    assessments: any[],
  ): Promise<LearningPath[]> => {
    const paths: LearningPath[] = [];

    // Generate role-based learning paths
    const roles = [
      "nurse",
      "assistant-nurse",
      "caregiver",
      "therapist",
      "supervisor",
    ];

    for (const role of roles) {
      const roleModules = modules.filter(
        (m) => m.role === role || m.role === "universal",
      );
      const roleAssessments = assessments.filter((a) => a.target_role === role);

      // Create beginner path
      const beginnerPath: LearningPath = {
        id: `${role}-beginner-path`,
        title: `${role.charAt(0).toUpperCase() + role.slice(1)} - Foundation Level`,
        description: `Comprehensive foundation training for ${role} role with DOH compliance`,
        targetRole: role,
        competencyLevel: "beginner",
        estimatedDuration: 40,
        prerequisites: [],
        modules: roleModules
          .filter(
            (m) =>
              m.difficulty === "beginner" || m.difficulty === "intermediate",
          )
          .map((m, index) => ({
            moduleId: m.id,
            order: index + 1,
            required: true,
            estimatedHours: m.duration / 60,
          })),
        assessments: roleAssessments
          .filter((a) => a.competency_level === "beginner")
          .map((a) => ({
            assessmentId: a.id,
            type: a.assessment_type,
            passingScore: 80,
            attempts: 3,
          })),
        certification: {
          eligible: true,
          certificateType: `${role}_foundation`,
          validityPeriod: 365,
        },
        progress: {
          completedModules: [],
          overallProgress: 0,
          timeSpent: 0,
        },
        status: "not_started",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create advanced path
      const advancedPath: LearningPath = {
        id: `${role}-advanced-path`,
        title: `${role.charAt(0).toUpperCase() + role.slice(1)} - Advanced Specialization`,
        description: `Advanced competency development for experienced ${role} professionals`,
        targetRole: role,
        competencyLevel: "advanced",
        estimatedDuration: 60,
        prerequisites: [`${role}-beginner-path`],
        modules: roleModules
          .filter((m) => m.difficulty === "advanced")
          .map((m, index) => ({
            moduleId: m.id,
            order: index + 1,
            required: true,
            estimatedHours: m.duration / 60,
          })),
        assessments: roleAssessments
          .filter((a) => a.competency_level === "advanced")
          .map((a) => ({
            assessmentId: a.id,
            type: a.assessment_type,
            passingScore: 85,
            attempts: 2,
          })),
        certification: {
          eligible: true,
          certificateType: `${role}_advanced`,
          validityPeriod: 730,
        },
        progress: {
          completedModules: [],
          overallProgress: 0,
          timeSpent: 0,
        },
        status: "not_started",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      paths.push(beginnerPath, advancedPath);
    }

    // Add specialized compliance paths
    const compliancePath: LearningPath = {
      id: "doh-compliance-path",
      title: "DOH Compliance & Regulatory Excellence",
      description:
        "Comprehensive DOH standards and regulatory compliance training",
      targetRole: "universal",
      competencyLevel: "intermediate",
      estimatedDuration: 30,
      prerequisites: [],
      modules: modules
        .filter((m) => m.id.includes("compliance") || m.id.includes("doh"))
        .map((m, index) => ({
          moduleId: m.id,
          order: index + 1,
          required: true,
          estimatedHours: m.duration / 60,
        })),
      assessments: assessments
        .filter((a) => a.assessment_type === "compliance")
        .map((a) => ({
          assessmentId: a.id,
          type: a.assessment_type,
          passingScore: 90,
          attempts: 2,
        })),
      certification: {
        eligible: true,
        certificateType: "doh_compliance",
        validityPeriod: 365,
      },
      progress: {
        completedModules: [],
        overallProgress: 0,
        timeSpent: 0,
      },
      status: "not_started",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    paths.push(compliancePath);

    return paths;
  };

  const loadUserCertifications = async (
    userId: string,
  ): Promise<CertificationRecord[]> => {
    // Mock implementation - in real app, this would fetch from API
    return [
      {
        id: "cert-001",
        userId,
        certificationType: "nurse_foundation",
        title: "Registered Nurse - Foundation Level",
        issuedDate: "2024-01-15",
        expiryDate: "2025-01-15",
        status: "active",
        competencies: [
          "Patient Assessment",
          "Medication Administration",
          "Documentation",
        ],
        assessmentScores: [
          {
            assessmentId: "assess-001",
            score: 92,
            maxScore: 100,
            completedAt: "2024-01-10",
          },
        ],
        verificationCode: "RN-FOUND-2024-001",
        cpdPoints: 25,
      },
    ];
  };

  const startLearningPath = async (pathId: string) => {
    const path = unifiedTrainingData.learningPaths.find((p) => p.id === pathId);
    if (!path) return;

    // Check prerequisites
    const unmetPrerequisites = path.prerequisites.filter((prereq) => {
      const prereqPath = unifiedTrainingData.learningPaths.find(
        (p) => p.id === prereq,
      );
      return !prereqPath || prereqPath.status !== "completed";
    });

    if (unmetPrerequisites.length > 0) {
      alert(
        `Please complete prerequisites first: ${unmetPrerequisites.join(", ")}`,
      );
      return;
    }

    // Start the learning path
    const updatedPath = {
      ...path,
      status: "in_progress" as const,
      progress: {
        ...path.progress,
        currentModule: path.modules[0]?.moduleId,
      },
    };

    setSelectedLearningPath(updatedPath);

    // Update the unified data
    setUnifiedTrainingData((prev) => ({
      ...prev,
      learningPaths: prev.learningPaths.map((p) =>
        p.id === pathId ? updatedPath : p,
      ),
    }));
  };

  const completePathModule = async (pathId: string, moduleId: string) => {
    const path = unifiedTrainingData.learningPaths.find((p) => p.id === pathId);
    if (!path) return;

    const updatedCompletedModules = [
      ...path.progress.completedModules,
      moduleId,
    ];
    const totalModules = path.modules.length;
    const overallProgress = Math.round(
      (updatedCompletedModules.length / totalModules) * 100,
    );

    const updatedPath = {
      ...path,
      progress: {
        ...path.progress,
        completedModules: updatedCompletedModules,
        overallProgress,
        timeSpent: path.progress.timeSpent + 2, // Add 2 hours
      },
      status: overallProgress === 100 ? ("completed" as const) : path.status,
    };

    setUnifiedTrainingData((prev) => ({
      ...prev,
      learningPaths: prev.learningPaths.map((p) =>
        p.id === pathId ? updatedPath : p,
      ),
    }));

    if (overallProgress === 100) {
      // Trigger certification process
      await issueLearningPathCertification(updatedPath);
    }
  };

  const issueLearningPathCertification = async (path: LearningPath) => {
    if (!path.certification.eligible) return;

    const certification: CertificationRecord = {
      id: `cert-${Date.now()}`,
      userId,
      learningPathId: path.id,
      certificationType: path.certification.certificateType,
      title: `${path.title} - Certification`,
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(
        Date.now() + path.certification.validityPeriod * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: "active",
      competencies: path.modules.map((m) => m.moduleId),
      assessmentScores: [],
      verificationCode: `${path.certification.certificateType.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      cpdPoints: Math.round(path.estimatedDuration * 0.5),
    };

    setUnifiedTrainingData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, certification],
    }));

    // Show certification dialog
    setPendingCertification(certification);
    setShowCertificationDialog(true);
  };

  const renderUnifiedLearningPaths = () => {
    return (
      <div className="space-y-6">
        {/* Learning Path Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Paths</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {unifiedTrainingData.learningPaths.length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      unifiedTrainingData.learningPaths.filter(
                        (p) => p.status === "in_progress",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      unifiedTrainingData.learningPaths.filter(
                        (p) => p.status === "completed",
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      unifiedTrainingData.certifications.filter(
                        (c) => c.status === "active",
                      ).length
                    }
                  </p>
                </div>
                <Certificate className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unifiedTrainingData.learningPaths
            .filter(
              (path) =>
                selectedRole === "all" ||
                path.targetRole === selectedRole ||
                path.targetRole === "universal",
            )
            .map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {path.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        path.status === "completed"
                          ? "default"
                          : path.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                      className="ml-2"
                    >
                      {path.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {path.estimatedDuration}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {path.competencyLevel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {path.targetRole}
                    </div>
                  </div>

                  {path.status !== "not_started" && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{path.progress.overallProgress}%</span>
                      </div>
                      <Progress
                        value={path.progress.overallProgress}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Modules:</span>{" "}
                      {path.modules.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Assessments:</span>{" "}
                      {path.assessments.length}
                    </div>
                    {path.prerequisites.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Prerequisites:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {path.prerequisites.map((prereq, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {path.status === "not_started" && (
                      <Button
                        onClick={() => startLearningPath(path.id)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Path
                      </Button>
                    )}
                    {path.status === "in_progress" && (
                      <Button
                        onClick={() => setSelectedLearningPath(path)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                    {path.status === "completed" && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLearningPath(path)}
                        className="flex-1"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Custom Path Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Custom Learning Path Builder
            </CardTitle>
            <CardDescription>
              Create personalized learning paths based on specific competency
              needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowPathBuilder(true)} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Build Custom Learning Path
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIntegratedAssessments = () => {
    return (
      <div className="space-y-6">
        {/* Assessment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {unifiedTrainingData.assessments.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      unifiedTrainingData.assessments.filter(
                        (a) => a.status === "completed",
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-purple-600">87%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-orange-600">94%</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              type: "Skills Assessment",
              description: "Practical demonstration of clinical skills",
              icon: <Users className="h-6 w-6 text-blue-600" />,
              count: 12,
              color: "blue",
            },
            {
              type: "Knowledge Test",
              description: "Theoretical knowledge evaluation",
              icon: <Brain className="h-6 w-6 text-green-600" />,
              count: 8,
              color: "green",
            },
            {
              type: "Simulation",
              description: "Scenario-based assessment",
              icon: <Play className="h-6 w-6 text-purple-600" />,
              count: 6,
              color: "purple",
            },
            {
              type: "Portfolio Review",
              description: "Comprehensive work portfolio",
              icon: <FileText className="h-6 w-6 text-orange-600" />,
              count: 4,
              color: "orange",
            },
            {
              type: "Peer Assessment",
              description: "360-degree feedback evaluation",
              icon: <Network className="h-6 w-6 text-red-600" />,
              count: 3,
              color: "red",
            },
            {
              type: "Compliance Audit",
              description: "DOH standards compliance check",
              icon: <Shield className="h-6 w-6 text-indigo-600" />,
              count: 5,
              color: "indigo",
            },
          ].map((assessmentType, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-lg bg-${assessmentType.color}-100`}
                  >
                    {assessmentType.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{assessmentType.type}</h3>
                    <p className="text-sm text-gray-600">
                      {assessmentType.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {assessmentType.count} available
                  </Badge>
                  <Button size="sm" variant="outline">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCompetencyFramework = () => {
    if (!unifiedTrainingData.dashboardData) {
      return (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading competency framework data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Framework Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Frameworks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      unifiedTrainingData.dashboardData.framework_overview
                        .active_frameworks
                    }
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Competencies</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      unifiedTrainingData.dashboardData.framework_overview
                        .total_competencies
                    }
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Training Modules</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      unifiedTrainingData.dashboardData.training_statistics
                        .total_modules
                    }
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assessments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      unifiedTrainingData.dashboardData.assessment_insights
                        .total_assessments
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {Math.round(
                    unifiedTrainingData.dashboardData.quality_metrics
                      .inter_rater_reliability * 100,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">
                  Inter-rater Reliability
                </div>
                <div className="text-xs text-gray-500">
                  Consistency across evaluators
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(
                    unifiedTrainingData.dashboardData.quality_metrics
                      .assessment_validity * 100,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Assessment Validity</div>
                <div className="text-xs text-gray-500">
                  Accuracy of measurements
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {Math.round(
                    unifiedTrainingData.dashboardData.quality_metrics
                      .training_effectiveness * 100,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">
                  Training Effectiveness
                </div>
                <div className="text-xs text-gray-500">
                  Learning outcome achievement
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {Math.round(
                    unifiedTrainingData.dashboardData.quality_metrics
                      .compliance_score * 100,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Compliance Score</div>
                <div className="text-xs text-gray-500">
                  DOH standards adherence
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Educational Resources
            </CardTitle>
            <CardDescription>
              Curated learning materials and reference documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                {
                  type: "DOH Guidelines",
                  icon: <FileText className="h-5 w-5 text-blue-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "guideline",
                  ).length,
                  color: "blue",
                },
                {
                  type: "Best Practices",
                  icon: <Star className="h-5 w-5 text-green-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "best_practice",
                  ).length,
                  color: "green",
                },
                {
                  type: "Case Studies",
                  icon: <Users className="h-5 w-5 text-purple-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "case_study",
                  ).length,
                  color: "purple",
                },
                {
                  type: "Research Papers",
                  icon: <BookOpen className="h-5 w-5 text-orange-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "research",
                  ).length,
                  color: "orange",
                },
                {
                  type: "Policies",
                  icon: <Shield className="h-5 w-5 text-red-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "policy",
                  ).length,
                  color: "red",
                },
                {
                  type: "Protocols",
                  icon: <CheckCircle className="h-5 w-5 text-indigo-600" />,
                  count: unifiedTrainingData.educationalResources.filter(
                    (r) => r.resource_type === "protocol",
                  ).length,
                  color: "indigo",
                },
              ].map((resource, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-${resource.color}-100`}
                        >
                          {resource.icon}
                        </div>
                        <div>
                          <div className="font-medium">{resource.type}</div>
                          <div className="text-sm text-gray-500">
                            {resource.count} available
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Additions */}
            <div>
              <h4 className="font-medium mb-3">Recent Additions</h4>
              <div className="space-y-2">
                {unifiedTrainingData.dashboardData?.educational_resources.recent_additions
                  .slice(0, 5)
                  .map((resource: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">
                            {resource.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {resource.resource_type} • Added{" "}
                            {new Date(resource.added_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading unified training system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Network className="h-8 w-8 text-blue-600" />
                Unified Training & Education System
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive competency development with integrated learning
                paths, assessments, and certifications
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="nurse">Nurse</option>
                <option value="assistant-nurse">Assistant Nurse</option>
                <option value="caregiver">Caregiver</option>
                <option value="therapist">Therapist</option>
                <option value="supervisor">Supervisor</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search training content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="paths" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="competency">DOH Framework</TabsTrigger>
            <TabsTrigger value="training">Training Modules</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="builder">AI Builder</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="jawda">JAWDA Integration</TabsTrigger>
            <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
            <TabsTrigger value="help">AI Support</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="unified">Unified View</TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="space-y-4">
            {renderUnifiedLearningPaths()}
          </TabsContent>

          <TabsContent value="competency" className="space-y-4">
            {renderCompetencyFramework()}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Training Modules
                </CardTitle>
                <CardDescription>
                  Interactive learning modules aligned with DOH competency
                  standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Training modules are being integrated
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Interactive content, simulations, and multimedia resources
                    coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            {renderIntegratedAssessments()}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Educational Resources
                </CardTitle>
                <CardDescription>
                  Comprehensive library of learning materials and references
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Educational resource library is being organized
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Guidelines, best practices, case studies, and research
                    papers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Training Builder
                </CardTitle>
                <CardDescription>
                  Intelligent system for creating personalized learning
                  experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    AI training builder is in development
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Automated content generation and personalized learning paths
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Certificate className="h-5 w-5" />
                  Certification Management
                </CardTitle>
                <CardDescription>
                  Digital certificates and professional development tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unifiedTrainingData.certifications.map((cert) => (
                    <Card
                      key={cert.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {cert.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {cert.certificationType
                                .replace("_", " ")
                                .toUpperCase()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              cert.status === "active" ? "default" : "secondary"
                            }
                            className={
                              cert.status === "active"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                          >
                            {cert.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Issued:</span>
                            <span>
                              {new Date(cert.issuedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expires:</span>
                            <span>
                              {new Date(cert.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CPD Points:</span>
                            <span className="font-medium">
                              {cert.cpdPoints}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Verification:</span>
                            <span className="font-mono text-xs">
                              {cert.verificationCode}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Verify
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jawda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  JAWDA Quality Integration
                </CardTitle>
                <CardDescription>
                  Integration with JAWDA quality indicators and standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    JAWDA integration is being configured
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Quality indicators and performance metrics alignment
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  DOH Compliance Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time compliance tracking and regulatory adherence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Compliance monitoring system is being implemented
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Automated compliance checks and reporting
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  AI Training Assistant
                </CardTitle>
                <CardDescription>
                  Intelligent support for training and competency development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">AI assistant is being trained</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Personalized guidance and learning recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Training Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive analytics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unifiedTrainingData.dashboardData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Completion Rates */}
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        Training Completion Rates by Role
                      </h4>
                      {unifiedTrainingData.dashboardData.training_statistics.completion_rates.map(
                        (rate: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm capitalize">
                              {rate.role.replace("-", " ")}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${rate.completion_rate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {rate.completion_rate}%
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Competency Gaps */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Top Competency Gaps</h4>
                      {unifiedTrainingData.dashboardData.assessment_insights.competency_gaps
                        .slice(0, 5)
                        .map((gap: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{gap.competency}</span>
                            <Badge
                              variant={
                                gap.gap_percentage > 30
                                  ? "destructive"
                                  : gap.gap_percentage > 15
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {gap.gap_percentage}% gap
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Loading analytics data...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unified" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Unified Training & Education Dashboard
                </CardTitle>
                <CardDescription>
                  Comprehensive view of all training, competency, and
                  certification activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Unified Metrics */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(
                        (unifiedTrainingData.learningPaths.filter(
                          (p) => p.status === "completed",
                        ).length /
                          Math.max(
                            unifiedTrainingData.learningPaths.length,
                            1,
                          )) *
                          100,
                      )}
                      %
                    </div>
                    <div className="text-sm text-blue-700">
                      Path Completion Rate
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {
                        unifiedTrainingData.certifications.filter(
                          (c) => c.status === "active",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-green-700">
                      Active Certifications
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {unifiedTrainingData.certifications.reduce(
                        (sum, cert) => sum + cert.cpdPoints,
                        0,
                      )}
                    </div>
                    <div className="text-sm text-purple-700">
                      Total CPD Points
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {Math.round(
                        unifiedTrainingData.learningPaths.reduce(
                          (sum, path) => sum + path.progress.timeSpent,
                          0,
                        ),
                      )}
                    </div>
                    <div className="text-sm text-orange-700">
                      Hours Completed
                    </div>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4">
                    System Integration Status
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        system: "DOH Compliance Framework",
                        status: "Connected",
                        color: "green",
                      },
                      {
                        system: "JAWDA Quality Indicators",
                        status: "Connected",
                        color: "green",
                      },
                      {
                        system: "Learning Path Engine",
                        status: "Active",
                        color: "blue",
                      },
                      {
                        system: "Assessment Integration",
                        status: "Active",
                        color: "blue",
                      },
                      {
                        system: "Certification System",
                        status: "Connected",
                        color: "green",
                      },
                      {
                        system: "CPD Tracking",
                        status: "Active",
                        color: "blue",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{item.system}</span>
                        <Badge
                          variant={
                            item.color === "green" ? "default" : "secondary"
                          }
                          className={
                            item.color === "green"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Certification Dialog */}
      <Dialog
        open={showCertificationDialog}
        onOpenChange={setShowCertificationDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Certificate className="h-6 w-6 text-green-600" />
              Certification Issued
            </DialogTitle>
          </DialogHeader>
          {pendingCertification && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Certificate className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Congratulations!
                </h3>
                <p className="text-green-700">
                  You have successfully earned your certification
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Certificate Title
                  </label>
                  <p className="text-lg font-semibold">
                    {pendingCertification.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Issued Date
                    </label>
                    <p>
                      {new Date(
                        pendingCertification.issuedDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <p>
                      {new Date(
                        pendingCertification.expiryDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {pendingCertification.verificationCode}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    CPD Points Earned
                  </label>
                  <p className="text-2xl font-bold text-purple-600">
                    {pendingCertification.cpdPoints}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline" className="flex-1">
                  <PenTool className="h-4 w-4 mr-2" />
                  Add Digital Signature
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffTrainingInterface;
