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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  type: "video" | "interactive" | "assessment" | "simulation";
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: "beginner" | "intermediate" | "advanced" | "specialty";
}

interface LearningPath {
  id: string;
  title: string;
  role: "physician" | "nurse" | "administrator";
  totalHours: number;
  completedHours: number;
  modules: TrainingModule[];
}

const InteractiveTrainingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole] = useState<"physician" | "nurse" | "administrator">(
    "physician",
  );
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(
    null,
  );

  // Mock data initialization
  useEffect(() => {
    const mockLearningPaths: LearningPath[] = [
      {
        id: "physician-path",
        title: "Physician Learning Path",
        role: "physician",
        totalHours: 40,
        completedHours: 24,
        modules: [
          {
            id: "platform-orientation",
            title: "Platform Orientation",
            description:
              "System navigation, security, and emergency procedures",
            duration: 4,
            progress: 100,
            status: "completed",
            type: "interactive",
            difficulty: "beginner",
          },
          {
            id: "patient-management",
            title: "Patient Management",
            description:
              "Patient registration, Emirates ID integration, episode management",
            duration: 8,
            progress: 75,
            status: "in_progress",
            type: "video",
            difficulty: "intermediate",
          },
          {
            id: "clinical-documentation",
            title: "Clinical Documentation",
            description: "Assessment forms, digital signatures, voice-to-text",
            duration: 12,
            progress: 30,
            status: "in_progress",
            type: "simulation",
            difficulty: "intermediate",
          },
          {
            id: "care-planning",
            title: "Care Planning",
            description:
              "Care plan development, team coordination, progress monitoring",
            duration: 8,
            progress: 0,
            status: "not_started",
            type: "interactive",
            difficulty: "advanced",
            prerequisites: ["clinical-documentation"],
          },
          {
            id: "compliance-quality",
            title: "Compliance & Quality",
            description:
              "DOH Nine Domains, JAWDA KPI reporting, audit preparation",
            duration: 8,
            progress: 0,
            status: "not_started",
            type: "assessment",
            difficulty: "advanced",
            prerequisites: ["care-planning"],
          },
        ],
      },
    ];

    const mockAchievements: Achievement[] = [
      {
        id: "first-login",
        title: "Welcome Aboard",
        description: "Completed first login to the platform",
        icon: "🥉",
        earned: true,
        earnedDate: "2024-01-15",
        category: "beginner",
      },
      {
        id: "profile-complete",
        title: "Getting Started",
        description: "Completed user profile setup",
        icon: "🥉",
        earned: true,
        earnedDate: "2024-01-15",
        category: "beginner",
      },
      {
        id: "first-patient",
        title: "Patient Care Begins",
        description: "Registered first patient",
        icon: "🥉",
        earned: true,
        earnedDate: "2024-01-16",
        category: "beginner",
      },
      {
        id: "documentation-master",
        title: "Documentation Master",
        description: "Completed 50 clinical forms",
        icon: "🥈",
        earned: false,
        category: "intermediate",
      },
      {
        id: "mobile-expert",
        title: "Offline Sync Champion",
        description: "Successfully used offline functionality",
        icon: "🥈",
        earned: false,
        category: "intermediate",
      },
      {
        id: "clinical-excellence",
        title: "Clinical Excellence",
        description: "Outstanding care quality rating",
        icon: "🥇",
        earned: false,
        category: "advanced",
      },
      {
        id: "doh-compliance-expert",
        title: "DOH Compliance Expert",
        description: "Mastered DOH Nine Domains assessment",
        icon: "🏆",
        earned: false,
        category: "specialty",
      },
    ];

    setLearningPaths(mockLearningPaths);
    setAchievements(mockAchievements);
  }, []);

  const currentPath = learningPaths.find((path) => path.role === userRole);
  const overallProgress = currentPath
    ? (currentPath.completedHours / currentPath.totalHours) * 100
    : 0;
  const earnedAchievements = achievements.filter((a) => a.earned);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-5 w-5" />;
      case "interactive":
        return <Target className="h-5 w-5" />;
      case "assessment":
        return <CheckCircle className="h-5 w-5" />;
      case "simulation":
        return <Users className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "not_started":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startModule = (module: TrainingModule) => {
    setCurrentModule(module);
    // Navigate to module content
    console.log("Starting module:", module.title);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Training Dashboard
          </h1>
          <p className="text-gray-600">
            Master the Reyada Homecare Platform with personalized learning paths
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(overallProgress)}%
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
                    Time Invested
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentPath?.completedHours || 0}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                of {currentPath?.totalHours || 0} hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Achievements
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {earnedAchievements.length}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                of {achievements.length} earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Goal
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Complete Module 3
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Target: Jan 31, 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Learning Path</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {currentPath && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentPath.title}
                  </CardTitle>
                  <CardDescription>
                    {currentPath.totalHours} hours of comprehensive training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentPath.modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(module.status)}`}
                        >
                          {module.status === "completed" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {module.title}
                            </h3>
                            {getModuleIcon(module.type)}
                            <Badge
                              className={getDifficultyColor(module.difficulty)}
                            >
                              {module.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {module.duration}h
                            </div>
                            {module.progress > 0 && (
                              <div className="flex-1 max-w-xs">
                                <Progress
                                  value={module.progress}
                                  className="h-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {module.progress}% complete
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {module.status === "not_started" &&
                            module.prerequisites && (
                              <Badge variant="outline" className="text-xs">
                                Prerequisites required
                              </Badge>
                            )}
                          <Button
                            onClick={() => startModule(module)}
                            disabled={
                              module.status === "not_started" &&
                              module.prerequisites !== undefined
                            }
                            variant={
                              module.status === "completed"
                                ? "outline"
                                : "default"
                            }
                          >
                            {module.status === "completed"
                              ? "Review"
                              : module.status === "in_progress"
                                ? "Continue"
                                : "Start"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${achievement.earned ? "border-yellow-200 bg-yellow-50" : "border-gray-200"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${achievement.earned ? "text-yellow-800" : "text-gray-600"}`}
                        >
                          {achievement.title}
                        </h3>
                        <p
                          className={`text-sm ${achievement.earned ? "text-yellow-700" : "text-gray-500"} mb-2`}
                        >
                          {achievement.description}
                        </p>
                        <Badge
                          className={getDifficultyColor(achievement.category)}
                        >
                          {achievement.category}
                        </Badge>
                        {achievement.earned && achievement.earnedDate && (
                          <p className="text-xs text-yellow-600 mt-2">
                            Earned on{" "}
                            {new Date(
                              achievement.earnedDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <Award className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                  <CardDescription>
                    Track your progress across key competencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Patient Management</span>
                      <span>80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clinical Documentation</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliance</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mobile Proficiency</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <CardDescription>
                    Your next learning objectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Next Badge: Documentation Master
                      </p>
                      <p className="text-sm text-gray-600">
                        Complete 25 more forms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">
                        Recommended: Advanced Care Planning
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on your progress
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Peer Ranking: Top 25%</p>
                      <p className="text-sm text-gray-600">Among physicians</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion Forums</CardTitle>
                  <CardDescription>
                    Connect with peers and share knowledge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Clinical Documentation Best Practices
                      </p>
                      <p className="text-sm text-gray-600">24 new messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">DOH Compliance Q&A</p>
                      <p className="text-sm text-gray-600">12 new messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Mobile App Tips & Tricks</p>
                      <p className="text-sm text-gray-600">8 new messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study Groups</CardTitle>
                  <CardDescription>
                    Join collaborative learning sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">JAWDA KPI Workshop</p>
                      <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Care Planning Masterclass</p>
                      <p className="text-sm text-gray-600">Jan 25, 10:00 AM</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InteractiveTrainingDashboard;
