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
import { Input } from "@/components/ui/input";
import {
  Brain,
  BookOpen,
  Video,
  Target,
  Trophy,
  Clock,
  Users,
  TrendingUp,
  Star,
  Play,
  CheckCircle,
  AlertCircle,
  Zap,
  Calendar,
  BarChart3,
  Award,
  Lightbulb,
  MessageSquare,
  Search,
  Filter,
  Download,
  Share,
  Settings,
  Bell,
  Bookmark,
  FileText,
  Headphones,
  Camera,
  Globe,
  Shield,
  Stethoscope,
  Smartphone,
} from "lucide-react";
import AITrainingAssistant from "./AITrainingAssistant";
import CompetencyTracker from "./CompetencyTracker";
import GuidedTutorial from "./GuidedTutorial";
import VideoTrainingPlayer from "./VideoTrainingPlayer";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: "clinical" | "technical" | "compliance" | "administrative";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  modules: TrainingModule[];
  prerequisites: string[];
  certificationLevel: string;
  aiPersonalized: boolean;
  completionRate: number;
  enrolledUsers: number;
  rating: number;
  lastUpdated: Date;
}

interface TrainingModule {
  id: string;
  title: string;
  type: "video" | "tutorial" | "assessment" | "simulation" | "reading";
  duration: number;
  status: "not_started" | "in_progress" | "completed" | "locked";
  progress: number;
  aiEnhanced: boolean;
  interactiveElements: number;
  competencyMapped: boolean;
  videoUrl?: string;
  tutorialId?: string;
  assessmentId?: string;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
}

interface UserProgress {
  totalModulesCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  certificationsEarned: number;
  competencyLevel: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendedNextSteps: string[];
  aiInsights: {
    learningStyle: string;
    optimalStudyTime: string;
    preferredContentType: string;
    adaptationSuggestions: string[];
  };
}

interface TrainingAnalytics {
  organizationStats: {
    totalUsers: number;
    activeUsers: number;
    completionRate: number;
    averageScore: number;
    complianceRate: number;
  };
  popularContent: {
    mostWatchedVideos: string[];
    topRatedTutorials: string[];
    frequentlyAccessedModules: string[];
  };
  performanceMetrics: {
    averageCompletionTime: number;
    retentionRate: number;
    engagementScore: number;
    satisfactionRating: number;
  };
}

interface TrainingDashboardProps {
  userId: string;
  userRole: "physician" | "nurse" | "administrator";
  organizationId: string;
  onModuleStart?: (moduleId: string) => void;
  onModuleComplete?: (moduleId: string, score?: number) => void;
  onCertificationEarned?: (certificationId: string) => void;
}

const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  userId,
  userRole,
  organizationId,
  onModuleStart,
  onModuleComplete,
  onCertificationEarned,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showCompetencyTracker, setShowCompetencyTracker] = useState(false);
  const [aiAssistantContext, setAiAssistantContext] = useState({
    currentModule: "",
    strugglingAreas: [] as string[],
    completedModules: [] as string[],
    currentProgress: 0,
  });
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "reminder" | "achievement" | "update" | "deadline";
      title: string;
      message: string;
      timestamp: Date;
      read: boolean;
    }>
  >([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState<string[]>([]);

  // Initialize training data
  useEffect(() => {
    const initializeTrainingData = () => {
      // Mock learning paths based on user role
      const mockPaths: LearningPath[] = [
        {
          id: "patient-management-mastery",
          title: "Patient Management Mastery",
          description:
            "Comprehensive training on patient registration, episode management, and care coordination with AI-powered insights",
          category: "clinical",
          difficulty: "intermediate",
          estimatedTime: 180,
          aiPersonalized: true,
          completionRate: 78,
          enrolledUsers: 245,
          rating: 4.8,
          lastUpdated: new Date("2024-01-15"),
          prerequisites: ["Basic Platform Navigation"],
          certificationLevel: "Professional",
          modules: [
            {
              id: "patient-registration",
              title: "AI-Enhanced Patient Registration",
              type: "tutorial",
              duration: 45,
              status: "completed",
              progress: 100,
              aiEnhanced: true,
              interactiveElements: 8,
              competencyMapped: true,
              tutorialId: "patient-registration",
              priority: "high",
            },
            {
              id: "episode-management",
              title: "Episode Management & Care Planning",
              type: "video",
              duration: 35,
              status: "in_progress",
              progress: 65,
              aiEnhanced: true,
              interactiveElements: 12,
              competencyMapped: true,
              videoUrl: "/videos/training/episode-management.mp4",
              priority: "high",
            },
            {
              id: "patient-assessment",
              title: "Comprehensive Patient Assessment",
              type: "simulation",
              duration: 60,
              status: "not_started",
              progress: 0,
              aiEnhanced: true,
              interactiveElements: 15,
              competencyMapped: true,
              priority: "medium",
              dueDate: new Date("2024-02-15"),
            },
          ],
        },
        {
          id: "clinical-documentation-excellence",
          title: "Clinical Documentation Excellence",
          description:
            "Master digital signatures, voice-to-text, and DOH-compliant documentation with AI assistance",
          category: "clinical",
          difficulty: "advanced",
          estimatedTime: 240,
          aiPersonalized: true,
          completionRate: 85,
          enrolledUsers: 189,
          rating: 4.9,
          lastUpdated: new Date("2024-01-20"),
          prerequisites: ["Patient Management Mastery"],
          certificationLevel: "Expert",
          modules: [
            {
              id: "digital-signatures",
              title: "Digital Signature Workflows",
              type: "tutorial",
              duration: 30,
              status: "completed",
              progress: 100,
              aiEnhanced: true,
              interactiveElements: 6,
              competencyMapped: true,
              priority: "high",
            },
            {
              id: "voice-documentation",
              title: "Voice-to-Text Documentation",
              type: "video",
              duration: 25,
              status: "not_started",
              progress: 0,
              aiEnhanced: true,
              interactiveElements: 8,
              competencyMapped: true,
              priority: "medium",
            },
          ],
        },
        {
          id: "mobile-proficiency-program",
          title: "Mobile Proficiency Program",
          description:
            "Master offline capabilities, camera integration, and mobile workflows for field operations",
          category: "technical",
          difficulty: "intermediate",
          estimatedTime: 120,
          aiPersonalized: true,
          completionRate: 92,
          enrolledUsers: 312,
          rating: 4.7,
          lastUpdated: new Date("2024-01-18"),
          prerequisites: [],
          certificationLevel: "Specialist",
          modules: [
            {
              id: "offline-operations",
              title: "Offline Operations Mastery",
              type: "tutorial",
              duration: 40,
              status: "in_progress",
              progress: 45,
              aiEnhanced: true,
              interactiveElements: 10,
              competencyMapped: true,
              priority: "high",
            },
            {
              id: "camera-integration",
              title: "Camera & Media Integration",
              type: "video",
              duration: 30,
              status: "not_started",
              progress: 0,
              aiEnhanced: true,
              interactiveElements: 7,
              competencyMapped: true,
              priority: "medium",
            },
          ],
        },
        {
          id: "doh-compliance-certification",
          title: "DOH Compliance Certification",
          description:
            "Comprehensive training on Nine Domains, JAWDA KPIs, and regulatory compliance with AI-powered validation",
          category: "compliance",
          difficulty: "advanced",
          estimatedTime: 300,
          aiPersonalized: true,
          completionRate: 73,
          enrolledUsers: 156,
          rating: 4.6,
          lastUpdated: new Date("2024-01-22"),
          prerequisites: ["Clinical Documentation Excellence"],
          certificationLevel: "Certified Compliance Officer",
          modules: [
            {
              id: "nine-domains",
              title: "Nine Domains Assessment Framework",
              type: "tutorial",
              duration: 90,
              status: "not_started",
              progress: 0,
              aiEnhanced: true,
              interactiveElements: 20,
              competencyMapped: true,
              priority: "high",
              dueDate: new Date("2024-02-01"),
            },
            {
              id: "jawda-kpis",
              title: "JAWDA KPI Implementation",
              type: "assessment",
              duration: 60,
              status: "locked",
              progress: 0,
              aiEnhanced: true,
              interactiveElements: 15,
              competencyMapped: true,
              priority: "high",
            },
          ],
        },
      ];

      // Filter paths based on user role
      const rolePaths = mockPaths.filter((path) => {
        if (userRole === "physician") {
          return ["clinical", "compliance"].includes(path.category);
        } else if (userRole === "nurse") {
          return ["clinical", "technical"].includes(path.category);
        } else {
          return true; // Administrators see all paths
        }
      });

      setLearningPaths(rolePaths);

      // Mock user progress
      const mockProgress: UserProgress = {
        totalModulesCompleted: 12,
        totalTimeSpent: 1440, // 24 hours
        currentStreak: 7,
        longestStreak: 14,
        certificationsEarned: 3,
        competencyLevel: "Proficient",
        weakAreas: ["DOH Compliance", "Advanced Documentation"],
        strongAreas: ["Patient Registration", "Mobile Operations"],
        recommendedNextSteps: [
          "Complete Nine Domains Assessment",
          "Practice Voice Documentation",
          "Review JAWDA KPI Requirements",
        ],
        aiInsights: {
          learningStyle: "Visual + Interactive",
          optimalStudyTime: "Morning (9-11 AM)",
          preferredContentType: "Video with Practice Activities",
          adaptationSuggestions: [
            "Increase interactive elements in tutorials",
            "Provide more visual diagrams and flowcharts",
            "Schedule learning sessions during peak focus hours",
          ],
        },
      };

      setUserProgress(mockProgress);

      // Mock analytics for administrators
      if (userRole === "administrator") {
        const mockAnalytics: TrainingAnalytics = {
          organizationStats: {
            totalUsers: 450,
            activeUsers: 312,
            completionRate: 78,
            averageScore: 87,
            complianceRate: 94,
          },
          popularContent: {
            mostWatchedVideos: [
              "Patient Registration Basics",
              "Mobile App Navigation",
              "Digital Signatures",
            ],
            topRatedTutorials: [
              "AI-Enhanced Documentation",
              "Compliance Workflows",
              "Emergency Procedures",
            ],
            frequentlyAccessedModules: [
              "Patient Management",
              "Clinical Documentation",
              "Mobile Operations",
            ],
          },
          performanceMetrics: {
            averageCompletionTime: 45,
            retentionRate: 89,
            engagementScore: 8.2,
            satisfactionRating: 4.6,
          },
        };
        setAnalytics(mockAnalytics);
      }

      // Mock notifications
      const mockNotifications = [
        {
          id: "1",
          type: "reminder" as const,
          title: "Training Reminder",
          message: "Complete your Nine Domains Assessment by February 1st",
          timestamp: new Date(),
          read: false,
        },
        {
          id: "2",
          type: "achievement" as const,
          title: "Congratulations!",
          message: "You've earned the Mobile Proficiency certification",
          timestamp: new Date(Date.now() - 86400000),
          read: false,
        },
        {
          id: "3",
          type: "update" as const,
          title: "New Content Available",
          message: "Advanced DAMAN Integration tutorial is now available",
          timestamp: new Date(Date.now() - 172800000),
          read: true,
        },
      ];
      setNotifications(mockNotifications);

      // Set AI assistant context
      setAiAssistantContext({
        currentModule: "patient-registration",
        strugglingAreas: mockProgress.weakAreas,
        completedModules: ["patient-registration", "digital-signatures"],
        currentProgress: 65,
      });

      // Generate personalized recommendations
      setPersonalizedRecommendations([
        "Focus on DOH Compliance modules to strengthen weak areas",
        "Practice voice documentation during your optimal learning hours",
        "Complete interactive assessments to reinforce learning",
        "Join the advanced clinical documentation study group",
      ]);
    };

    initializeTrainingData();
  }, [userId, userRole, organizationId]);

  const handleModuleStart = (module: TrainingModule) => {
    setActiveModule(module);
    onModuleStart?.(module.id);

    if (module.type === "tutorial" && module.tutorialId) {
      setShowTutorial(true);
    } else if (module.type === "video" && module.videoUrl) {
      setShowVideoPlayer(true);
    }
  };

  const handleModuleComplete = (moduleId: string, score?: number) => {
    // Update module status
    setLearningPaths((prev) =>
      prev.map((path) => ({
        ...path,
        modules: path.modules.map((module) =>
          module.id === moduleId
            ? { ...module, status: "completed", progress: 100 }
            : module,
        ),
      })),
    );

    onModuleComplete?.(moduleId, score);
    setActiveModule(null);
    setShowTutorial(false);
    setShowVideoPlayer(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "locked":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Play className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "tutorial":
        return <BookOpen className="h-4 w-4" />;
      case "assessment":
        return <Target className="h-4 w-4" />;
      case "simulation":
        return <Brain className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "clinical":
        return "bg-blue-100 text-blue-800";
      case "technical":
        return "bg-green-100 text-green-800";
      case "compliance":
        return "bg-purple-100 text-purple-800";
      case "administrative":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPaths = learningPaths.filter((path) => {
    const matchesSearch = path.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || path.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Training Dashboard
            </h1>
            <p className="text-gray-600">
              AI-powered personalized learning for healthcare professionals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompetencyTracker(true)}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Competencies
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            {userRole === "administrator" && (
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Modules Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userProgress?.totalModulesCompleted || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Learning Streak
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userProgress?.currentStreak || 0} days
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Certifications
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userProgress?.certificationsEarned || 0}
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
                        Competency Level
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userProgress?.competencyLevel || "Beginner"}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions based on your learning patterns and
                  goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalizedRecommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningPaths
                    .flatMap((path) => path.modules)
                    .filter((module) => module.status === "in_progress")
                    .slice(0, 3)
                    .map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleModuleStart(module)}
                      >
                        <div className="flex items-center gap-3">
                          {getTypeIcon(module.type)}
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-sm text-gray-600">
                              {module.duration} minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={module.progress}
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-gray-600">
                            {module.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>
                    Don't miss these important dates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningPaths
                    .flatMap((path) => path.modules)
                    .filter((module) => module.dueDate)
                    .sort(
                      (a, b) =>
                        (a.dueDate?.getTime() || 0) -
                        (b.dueDate?.getTime() || 0),
                    )
                    .slice(0, 3)
                    .map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-sm text-gray-600">
                              Due: {module.dueDate?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${module.priority === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {module.priority}
                        </Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="learning-paths" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search learning paths..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Learning Paths Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPaths.map((path) => (
                <Card
                  key={path.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {path.title}
                          {path.aiPersonalized && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {path.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge className={getCategoryColor(path.category)}>
                        {path.category}
                      </Badge>
                      <Badge variant="outline">{path.difficulty}</Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {path.estimatedTime}m
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {path.modules.length} modules
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {path.enrolledUsers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {path.rating}
                          </span>
                        </div>
                      </div>

                      <Progress value={path.completionRate} className="h-2" />
                      <p className="text-sm text-gray-600">
                        {path.completionRate}% completed
                      </p>

                      <div className="space-y-2">
                        {path.modules.slice(0, 3).map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(module.status)}
                              {getTypeIcon(module.type)}
                              <span className="text-sm font-medium">
                                {module.title}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {module.duration}m
                            </span>
                          </div>
                        ))}
                        {path.modules.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{path.modules.length - 3} more modules
                          </p>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => setSelectedPath(path.id)}
                      >
                        {path.completionRate > 0 ? "Continue" : "Start"}{" "}
                        Learning Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {userProgress && (
              <>
                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Time Spent:</span>
                        <span className="font-medium">
                          {Math.floor(userProgress.totalTimeSpent / 60)}h{" "}
                          {userProgress.totalTimeSpent % 60}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Streak:</span>
                        <span className="font-medium">
                          {userProgress.currentStreak} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Longest Streak:</span>
                        <span className="font-medium">
                          {userProgress.longestStreak} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certifications:</span>
                        <span className="font-medium">
                          {userProgress.certificationsEarned}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Strengths & Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          Strong Areas:
                        </h4>
                        <div className="space-y-1">
                          {userProgress.strongAreas.map((area, index) => (
                            <Badge
                              key={index}
                              className="bg-green-100 text-green-800 mr-1"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                          Areas for Improvement:
                        </h4>
                        <div className="space-y-1">
                          {userProgress.weakAreas.map((area, index) => (
                            <Badge
                              key={index}
                              className="bg-red-100 text-red-800 mr-1"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Learning Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">
                          Learning Style:
                        </span>
                        <p className="font-medium">
                          {userProgress.aiInsights.learningStyle}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Optimal Study Time:
                        </span>
                        <p className="font-medium">
                          {userProgress.aiInsights.optimalStudyTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Preferred Content:
                        </span>
                        <p className="font-medium">
                          {userProgress.aiInsights.preferredContentType}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Next Steps</CardTitle>
                    <CardDescription>
                      AI-generated recommendations based on your progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProgress.recommendedNextSteps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{step}</p>
                            <Button size="sm" className="mt-2">
                              Start Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Analytics Tab (Admin Only) */}
          {userRole === "administrator" && analytics && (
            <TabsContent value="analytics" className="space-y-6">
              {/* Organization Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.organizationStats.totalUsers}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.organizationStats.activeUsers}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Completion Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.organizationStats.completionRate}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Compliance Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.organizationStats.complianceRate}%
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Watched Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.popularContent.mostWatchedVideos.map(
                        (video, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <Video className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{video}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Rated Tutorials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.popularContent.topRatedTutorials.map(
                        (tutorial, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <BookOpen className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{tutorial}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Accessed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.popularContent.frequentlyAccessedModules.map(
                        (module, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <Target className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{module}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.performanceMetrics.averageCompletionTime}m
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg. Completion Time
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.performanceMetrics.retentionRate}%
                      </p>
                      <p className="text-sm text-gray-600">Retention Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.performanceMetrics.engagementScore}/10
                      </p>
                      <p className="text-sm text-gray-600">Engagement Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {analytics.performanceMetrics.satisfactionRating}/5
                      </p>
                      <p className="text-sm text-gray-600">
                        Satisfaction Rating
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* AI Training Assistant */}
      <AITrainingAssistant
        userId={userId}
        currentModule={aiAssistantContext.currentModule}
        learningContext={{
          role: userRole,
          experience: userProgress?.competencyLevel || "Beginner",
          completedModules: aiAssistantContext.completedModules,
          currentProgress: aiAssistantContext.currentProgress,
          strugglingAreas: aiAssistantContext.strugglingAreas,
        }}
        onSuggestion={(suggestion) => {
          console.log("AI Suggestion:", suggestion);
        }}
        onHelpRequest={(query) => {
          console.log("Help Request:", query);
        }}
      />

      {/* Modals */}
      {showTutorial && activeModule?.tutorialId && (
        <GuidedTutorial
          tutorialId={activeModule.tutorialId}
          userId={userId}
          userRole={userRole}
          onComplete={() => handleModuleComplete(activeModule.id)}
          onClose={() => {
            setShowTutorial(false);
            setActiveModule(null);
          }}
        />
      )}

      {showVideoPlayer && activeModule?.videoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl">
            <VideoTrainingPlayer
              videoId={activeModule.id}
              title={activeModule.title}
              description={`Training module: ${activeModule.title}`}
              videoUrl={activeModule.videoUrl}
              duration={activeModule.duration * 60}
              chapters={[
                {
                  id: "intro",
                  title: "Introduction",
                  startTime: 0,
                  endTime: 300,
                  description: "Module introduction and objectives",
                  keyPoints: [
                    "Learning objectives",
                    "Prerequisites",
                    "Expected outcomes",
                  ],
                },
                {
                  id: "main",
                  title: "Main Content",
                  startTime: 300,
                  endTime: activeModule.duration * 60 - 300,
                  description: "Core training content",
                  keyPoints: [
                    "Key concepts",
                    "Practical examples",
                    "Best practices",
                  ],
                },
                {
                  id: "summary",
                  title: "Summary",
                  startTime: activeModule.duration * 60 - 300,
                  endTime: activeModule.duration * 60,
                  description: "Module summary and next steps",
                  keyPoints: [
                    "Key takeaways",
                    "Action items",
                    "Additional resources",
                  ],
                },
              ]}
              onComplete={() => handleModuleComplete(activeModule.id)}
              onProgress={(progress) => {
                console.log("Video progress:", progress);
              }}
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4 bg-white"
              onClick={() => {
                setShowVideoPlayer(false);
                setActiveModule(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showCompetencyTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <CompetencyTracker
              userId={userId}
              userRole={userRole}
              onCompetencyUpdate={(competencyId, progress) => {
                console.log("Competency updated:", competencyId, progress);
              }}
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4 bg-white"
              onClick={() => setShowCompetencyTracker(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDashboard;
