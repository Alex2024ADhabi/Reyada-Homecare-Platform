import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Trophy,
  Zap,
  Brain,
  Shield,
  Stethoscope,
  FileText,
  Smartphone,
} from "lucide-react";

interface CompetencyArea {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "clinical" | "technical" | "compliance" | "communication";
  requiredLevel: "basic" | "proficient" | "expert";
  currentLevel: "none" | "basic" | "proficient" | "expert";
  progress: number;
  skills: Skill[];
  assessments: Assessment[];
  certifications: Certification[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  level: "basic" | "proficient" | "expert";
  status: "not_started" | "in_progress" | "completed" | "certified";
  lastAssessed: Date | null;
  validUntil: Date | null;
  evidence: Evidence[];
}

interface Assessment {
  id: string;
  name: string;
  type: "knowledge" | "practical" | "simulation" | "observation";
  score: number | null;
  maxScore: number;
  completedDate: Date | null;
  validUntil: Date | null;
  status: "pending" | "completed" | "expired" | "failed";
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  level: "basic" | "proficient" | "expert";
  earnedDate: Date | null;
  expiryDate: Date | null;
  status: "active" | "expired" | "pending" | "revoked";
  requirements: string[];
}

interface Evidence {
  id: string;
  type: "assessment" | "observation" | "project" | "training";
  title: string;
  date: Date;
  score?: number;
  notes?: string;
  verifiedBy?: string;
}

interface CompetencyTrackerProps {
  userId: string;
  userRole: "physician" | "nurse" | "administrator";
  onCompetencyUpdate?: (competencyId: string, progress: number) => void;
}

const CompetencyTracker: React.FC<CompetencyTrackerProps> = ({
  userId,
  userRole,
  onCompetencyUpdate,
}) => {
  const [competencyAreas, setCompetencyAreas] = useState<CompetencyArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [viewMode, setViewMode] = useState<
    "overview" | "detailed" | "analytics"
  >("overview");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [overallProgress, setOverallProgress] = useState(0);
  const [competencyGaps, setCompetencyGaps] = useState<string[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    Array<{
      type: string;
      name: string;
      date: Date;
      priority: "high" | "medium" | "low";
    }>
  >([]);

  // Initialize competency data based on user role
  useEffect(() => {
    const initializeCompetencies = () => {
      const baseCompetencies: CompetencyArea[] = [
        {
          id: "patient-management",
          name: "Patient Management",
          description:
            "Patient registration, episode management, and care coordination",
          icon: <Users className="h-5 w-5" />,
          category: "clinical",
          requiredLevel: "proficient",
          currentLevel: "basic",
          progress: 65,
          skills: [
            {
              id: "patient-registration",
              name: "Patient Registration",
              description: "Register new patients with Emirates ID integration",
              level: "proficient",
              status: "completed",
              lastAssessed: new Date("2024-01-15"),
              validUntil: new Date("2024-07-15"),
              evidence: [
                {
                  id: "reg-001",
                  type: "training",
                  title: "Patient Registration Tutorial",
                  date: new Date("2024-01-10"),
                  score: 95,
                },
                {
                  id: "reg-002",
                  type: "assessment",
                  title: "Registration Competency Test",
                  date: new Date("2024-01-15"),
                  score: 88,
                  verifiedBy: "Dr. Sarah Ahmed",
                },
              ],
            },
            {
              id: "episode-management",
              name: "Episode Management",
              description: "Create and manage patient care episodes",
              level: "basic",
              status: "in_progress",
              lastAssessed: null,
              validUntil: null,
              evidence: [],
            },
          ],
          assessments: [
            {
              id: "pm-assessment-1",
              name: "Patient Management Fundamentals",
              type: "knowledge",
              score: 85,
              maxScore: 100,
              completedDate: new Date("2024-01-15"),
              validUntil: new Date("2024-07-15"),
              status: "completed",
            },
          ],
          certifications: [
            {
              id: "pm-cert-1",
              name: "Patient Management Specialist",
              issuer: "Reyada Training Center",
              level: "basic",
              earnedDate: new Date("2024-01-16"),
              expiryDate: new Date("2025-01-16"),
              status: "active",
              requirements: [
                "Complete Patient Registration Tutorial",
                "Pass Assessment with 80% or higher",
                "Demonstrate practical skills",
              ],
            },
          ],
        },
        {
          id: "clinical-documentation",
          name: "Clinical Documentation",
          description:
            "Electronic health records, assessments, and digital signatures",
          icon: <FileText className="h-5 w-5" />,
          category: "clinical",
          requiredLevel: "expert",
          currentLevel: "proficient",
          progress: 80,
          skills: [
            {
              id: "digital-signatures",
              name: "Digital Signatures",
              description: "Electronic signature workflows and compliance",
              level: "expert",
              status: "completed",
              lastAssessed: new Date("2024-01-20"),
              validUntil: new Date("2024-07-20"),
              evidence: [
                {
                  id: "sig-001",
                  type: "training",
                  title: "Digital Signature Mastery",
                  date: new Date("2024-01-18"),
                  score: 92,
                },
              ],
            },
            {
              id: "voice-documentation",
              name: "Voice-to-Text Documentation",
              description: "Efficient documentation using voice recognition",
              level: "proficient",
              status: "in_progress",
              lastAssessed: null,
              validUntil: null,
              evidence: [],
            },
          ],
          assessments: [],
          certifications: [],
        },
        {
          id: "mobile-proficiency",
          name: "Mobile App Proficiency",
          description:
            "Mobile application usage, offline capabilities, and synchronization",
          icon: <Smartphone className="h-5 w-5" />,
          category: "technical",
          requiredLevel: "proficient",
          currentLevel: "expert",
          progress: 95,
          skills: [
            {
              id: "offline-usage",
              name: "Offline Usage",
              description: "Work efficiently without internet connectivity",
              level: "expert",
              status: "certified",
              lastAssessed: new Date("2024-01-12"),
              validUntil: new Date("2024-07-12"),
              evidence: [
                {
                  id: "off-001",
                  type: "simulation",
                  title: "Offline Scenario Test",
                  date: new Date("2024-01-12"),
                  score: 98,
                  verifiedBy: "Tech Lead Ahmad",
                },
              ],
            },
          ],
          assessments: [],
          certifications: [
            {
              id: "mobile-cert-1",
              name: "Mobile Expert Certification",
              issuer: "Reyada Technical Team",
              level: "expert",
              earnedDate: new Date("2024-01-13"),
              expiryDate: new Date("2025-01-13"),
              status: "active",
              requirements: [
                "Master offline functionality",
                "Demonstrate camera integration",
                "Complete synchronization training",
              ],
            },
          ],
        },
        {
          id: "doh-compliance",
          name: "DOH Compliance",
          description:
            "Nine Domains assessment, JAWDA KPIs, and regulatory requirements",
          icon: <Shield className="h-5 w-5" />,
          category: "compliance",
          requiredLevel: "expert",
          currentLevel: "basic",
          progress: 40,
          skills: [
            {
              id: "nine-domains",
              name: "Nine Domains Assessment",
              description: "DOH quality framework implementation",
              level: "proficient",
              status: "in_progress",
              lastAssessed: null,
              validUntil: null,
              evidence: [],
            },
            {
              id: "jawda-kpis",
              name: "JAWDA KPI Reporting",
              description: "Key performance indicator tracking and reporting",
              level: "basic",
              status: "not_started",
              lastAssessed: null,
              validUntil: null,
              evidence: [],
            },
          ],
          assessments: [],
          certifications: [],
        },
      ];

      // Filter competencies based on user role
      const roleSpecificCompetencies = baseCompetencies.filter((comp) => {
        if (userRole === "physician") {
          return [
            "patient-management",
            "clinical-documentation",
            "doh-compliance",
          ].includes(comp.id);
        } else if (userRole === "nurse") {
          return [
            "clinical-documentation",
            "mobile-proficiency",
            "doh-compliance",
          ].includes(comp.id);
        } else {
          return true; // Administrators see all competencies
        }
      });

      setCompetencyAreas(roleSpecificCompetencies);
      if (roleSpecificCompetencies.length > 0) {
        setSelectedArea(roleSpecificCompetencies[0].id);
      }

      // Calculate overall progress
      const totalProgress = roleSpecificCompetencies.reduce(
        (sum, comp) => sum + comp.progress,
        0,
      );
      setOverallProgress(
        Math.round(totalProgress / roleSpecificCompetencies.length),
      );

      // Identify competency gaps
      const gaps = roleSpecificCompetencies
        .filter((comp) => comp.currentLevel !== comp.requiredLevel)
        .map((comp) => comp.name);
      setCompetencyGaps(gaps);

      // Set upcoming deadlines
      const deadlines = roleSpecificCompetencies.flatMap((comp) =>
        comp.skills
          .filter((skill) => skill.validUntil && skill.validUntil > new Date())
          .map((skill) => ({
            type: "skill",
            name: `${comp.name} - ${skill.name}`,
            date: skill.validUntil!,
            priority:
              getDaysUntil(skill.validUntil!) < 30
                ? ("high" as const)
                : ("medium" as const),
          })),
      );
      setUpcomingDeadlines(deadlines.slice(0, 5));
    };

    initializeCompetencies();
  }, [userId, userRole]);

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCompetencyLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-purple-100 text-purple-800";
      case "proficient":
        return "bg-blue-100 text-blue-800";
      case "basic":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "certified":
      case "active":
        return "text-green-600";
      case "in_progress":
      case "pending":
        return "text-blue-600";
      case "not_started":
        return "text-gray-600";
      case "expired":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const selectedCompetency = competencyAreas.find(
    (comp) => comp.id === selectedArea,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Competency Tracker
          </h1>
          <p className="text-gray-600">
            Track your professional development and certification progress
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallProgress}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={overallProgress} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Certifications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competencyAreas.reduce(
                      (sum, comp) =>
                        sum +
                        comp.certifications.filter(
                          (cert) => cert.status === "active",
                        ).length,
                      0,
                    )}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Competency Gaps
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competencyGaps.length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Upcoming Deadlines
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingDeadlines.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Competency Areas List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Competency Areas
                </CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="communication">
                        Communication
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {competencyAreas
                    .filter(
                      (comp) =>
                        filterCategory === "all" ||
                        comp.category === filterCategory,
                    )
                    .map((competency) => (
                      <button
                        key={competency.id}
                        onClick={() => setSelectedArea(competency.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedArea === competency.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {competency.icon}
                          <span className="font-medium">{competency.name}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={getCompetencyLevelColor(
                              competency.currentLevel,
                            )}
                          >
                            {competency.currentLevel}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {competency.progress}%
                          </span>
                        </div>
                        <Progress value={competency.progress} className="h-2" />
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <AlertCircle
                        className={`h-4 w-4 ${
                          deadline.priority === "high"
                            ? "text-red-500"
                            : "text-orange-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{deadline.name}</p>
                        <p className="text-xs text-gray-600">
                          {getDaysUntil(deadline.date)} days remaining
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingDeadlines.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No upcoming deadlines
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed View */}
          <div className="lg:col-span-2">
            {selectedCompetency && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedCompetency.icon}
                      <div>
                        <CardTitle>{selectedCompetency.name}</CardTitle>
                        <CardDescription>
                          {selectedCompetency.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getCompetencyLevelColor(
                          selectedCompetency.currentLevel,
                        )}
                      >
                        Current: {selectedCompetency.currentLevel}
                      </Badge>
                      <Badge variant="outline">
                        Target: {selectedCompetency.requiredLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="skills" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="skills">Skills</TabsTrigger>
                      <TabsTrigger value="assessments">Assessments</TabsTrigger>
                      <TabsTrigger value="certifications">
                        Certifications
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="skills" className="space-y-4">
                      {selectedCompetency.skills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{skill.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getCompetencyLevelColor(skill.level)}
                              >
                                {skill.level}
                              </Badge>
                              <CheckCircle
                                className={`h-4 w-4 ${getStatusColor(skill.status)}`}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {skill.description}
                          </p>

                          {skill.evidence.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">
                                Evidence:
                              </h5>
                              <div className="space-y-2">
                                {skill.evidence.map((evidence) => (
                                  <div
                                    key={evidence.id}
                                    className="bg-gray-50 p-2 rounded text-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {evidence.title}
                                      </span>
                                      {evidence.score && (
                                        <Badge variant="secondary">
                                          {evidence.score}%
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {evidence.date.toLocaleDateString()}
                                      {evidence.verifiedBy &&
                                        ` • Verified by ${evidence.verifiedBy}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {skill.validUntil && (
                            <div className="mt-3 text-xs text-gray-600">
                              Valid until:{" "}
                              {skill.validUntil.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="assessments" className="space-y-4">
                      {selectedCompetency.assessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{assessment.name}</h4>
                            <Badge
                              className={getStatusColor(assessment.status)}
                            >
                              {assessment.status}
                            </Badge>
                          </div>
                          {assessment.score !== null && (
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-sm">
                                Score: {assessment.score}/{assessment.maxScore}
                              </span>
                              <Progress
                                value={
                                  (assessment.score / assessment.maxScore) * 100
                                }
                                className="flex-1 h-2"
                              />
                            </div>
                          )}
                          {assessment.completedDate && (
                            <p className="text-sm text-gray-600">
                              Completed:{" "}
                              {assessment.completedDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      {selectedCompetency.assessments.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No assessments available for this competency
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="certifications" className="space-y-4">
                      {selectedCompetency.certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{cert.name}</h4>
                              <p className="text-sm text-gray-600">
                                Issued by {cert.issuer}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getCompetencyLevelColor(cert.level)}
                              >
                                {cert.level}
                              </Badge>
                              <Trophy
                                className={`h-4 w-4 ${getStatusColor(cert.status)}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            {cert.earnedDate && (
                              <div>
                                <span className="font-medium">Earned: </span>
                                {cert.earnedDate.toLocaleDateString()}
                              </div>
                            )}
                            {cert.expiryDate && (
                              <div>
                                <span className="font-medium">Expires: </span>
                                {cert.expiryDate.toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              Requirements:
                            </h5>
                            <ul className="text-sm space-y-1">
                              {cert.requirements.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                      {selectedCompetency.certifications.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No certifications available for this competency
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyTracker;
