import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Brain,
  Shield,
  Database,
  Users,
  Settings,
  FileText,
  Activity,
  Lightbulb,
  Star,
  ArrowRight,
  Calendar,
  Flag,
} from "lucide-react";

interface GapItem {
  id: string;
  title: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "missing" | "partial" | "planned" | "in_progress" | "completed";
  description: string;
  impact: string;
  effort: string;
  dependencies: string[];
  dueDate?: string;
  completionPercentage: number;
  recommendations: string[];
}

interface GapCategory {
  name: string;
  icon: React.ReactNode;
  totalItems: number;
  completedItems: number;
  criticalGaps: number;
  overallProgress: number;
}

const PlatformGapAnalysis: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("overview");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date>(new Date());

  const gapItems: GapItem[] = [
    // Critical Infrastructure Gaps
    {
      id: "infra_001",
      title: "Advanced Performance Monitoring Dashboard",
      category: "Infrastructure",
      priority: "high",
      status: "missing",
      description:
        "Real-time performance monitoring with predictive analytics and automated optimization",
      impact: "System performance optimization and proactive issue detection",
      effort: "2-3 weeks",
      dependencies: ["Performance metrics collection", "Analytics engine"],
      completionPercentage: 0,
      recommendations: [
        "Implement real-time metrics collection",
        "Add predictive performance analytics",
        "Create automated optimization triggers",
      ],
    },
    {
      id: "infra_002",
      title: "Comprehensive Error Tracking System",
      category: "Infrastructure",
      priority: "high",
      status: "partial",
      description:
        "Enhanced error tracking with root cause analysis and automated resolution",
      impact: "Improved system reliability and faster issue resolution",
      effort: "1-2 weeks",
      dependencies: ["Error boundary implementation", "Logging infrastructure"],
      completionPercentage: 60,
      recommendations: [
        "Enhance error categorization",
        "Add automated error resolution",
        "Implement error trend analysis",
      ],
    },
    {
      id: "infra_003",
      title: "Advanced Caching Strategy",
      category: "Infrastructure",
      priority: "medium",
      status: "planned",
      description:
        "Multi-layer caching with intelligent cache invalidation and optimization",
      impact: "Significant performance improvement and reduced server load",
      effort: "2-3 weeks",
      dependencies: ["Cache infrastructure", "Performance monitoring"],
      completionPercentage: 20,
      recommendations: [
        "Implement Redis caching layer",
        "Add intelligent cache invalidation",
        "Create cache performance metrics",
      ],
    },

    // Clinical Enhancement Gaps
    {
      id: "clinical_001",
      title: "AI-Powered Clinical Decision Support",
      category: "Clinical",
      priority: "high",
      status: "partial",
      description:
        "Machine learning-based clinical recommendations, drug interaction checking, and predictive risk assessment integrated with Plan of Care workflows",
      impact:
        "Enhanced clinical outcomes, reduced medical errors, and intelligent decision-making support for care planning",
      effort: "4-6 weeks",
      dependencies: [
        "ML infrastructure",
        "Clinical data models",
        "EMR integration",
        "Plan of Care system",
      ],
      completionPercentage: 35,
      recommendations: [
        "Integrate AI recommendations into Plan of Care workflow",
        "Implement real-time drug interaction checking",
        "Develop predictive risk models for patient deterioration",
        "Create clinical alert system with smart notifications",
        "Add medication adherence prediction algorithms",
        "Implement evidence-based care pathway suggestions",
      ],
    },
    {
      id: "clinical_002",
      title: "Advanced Patient Analytics Dashboard",
      category: "Clinical",
      priority: "medium",
      status: "in_progress",
      description:
        "Comprehensive patient analytics with predictive health insights, medication adherence tracking, and care plan effectiveness monitoring",
      impact:
        "Better patient outcomes through data-driven insights and proactive care management",
      effort: "3-4 weeks",
      dependencies: [
        "Patient data aggregation",
        "Analytics engine",
        "EMR integration",
      ],
      completionPercentage: 65,
      recommendations: [
        "Complete medication adherence analytics integration",
        "Add care plan outcome prediction models",
        "Implement real-time patient risk scoring",
        "Create comprehensive patient summary views",
        "Add clinical quality metrics dashboard",
      ],
    },
    {
      id: "clinical_003",
      title: "Enhanced Plan of Care Intelligence",
      category: "Clinical",
      priority: "high",
      status: "in_progress",
      description:
        "AI-enhanced Plan of Care with smart recommendations, automated compliance checking, and predictive care planning",
      impact:
        "Improved care coordination, reduced planning time, and enhanced compliance with clinical standards",
      effort: "2-3 weeks",
      dependencies: [
        "Plan of Care system",
        "AI decision support",
        "EMR integration",
      ],
      completionPercentage: 70,
      recommendations: [
        "Complete AI-powered care plan suggestions",
        "Implement automated DOH compliance validation",
        "Add predictive care pathway recommendations",
        "Create smart goal setting with outcome prediction",
        "Integrate medication management workflows",
      ],
    },
    {
      id: "clinical_004",
      title: "Telemedicine Integration",
      category: "Clinical",
      priority: "medium",
      status: "planned",
      description: "Video consultation and remote monitoring capabilities",
      impact: "Extended care delivery options and improved accessibility",
      effort: "3-5 weeks",
      dependencies: ["Video infrastructure", "Security compliance"],
      completionPercentage: 10,
      recommendations: [
        "Implement secure video calling",
        "Add remote monitoring tools",
        "Create virtual care workflows",
      ],
    },

    // Compliance & Security Gaps
    {
      id: "compliance_001",
      title: "Advanced Audit Trail Analytics",
      category: "Compliance",
      priority: "high",
      status: "partial",
      description:
        "Enhanced audit trail with pattern analysis and anomaly detection",
      impact: "Improved compliance monitoring and security threat detection",
      effort: "2-3 weeks",
      dependencies: ["Audit logging", "Analytics engine"],
      completionPercentage: 70,
      recommendations: [
        "Add audit pattern analysis",
        "Implement anomaly detection",
        "Create compliance dashboards",
      ],
    },
    {
      id: "compliance_002",
      title: "Automated Compliance Reporting",
      category: "Compliance",
      priority: "medium",
      status: "in_progress",
      description: "Automated generation and submission of regulatory reports",
      impact: "Reduced manual effort and improved compliance accuracy",
      effort: "2-4 weeks",
      dependencies: ["Compliance data models", "Reporting engine"],
      completionPercentage: 80,
      recommendations: [
        "Complete report automation",
        "Add regulatory submission APIs",
        "Implement compliance validation",
      ],
    },

    // Integration & Interoperability Gaps
    {
      id: "integration_001",
      title: "FHIR R4 Full Implementation",
      category: "Integration",
      priority: "high",
      status: "partial",
      description:
        "Complete FHIR R4 standard implementation for healthcare interoperability",
      impact: "Enhanced healthcare system integration and data exchange",
      effort: "4-6 weeks",
      dependencies: ["FHIR infrastructure", "Data mapping"],
      completionPercentage: 50,
      recommendations: [
        "Complete FHIR resource implementation",
        "Add FHIR validation",
        "Implement FHIR search capabilities",
      ],
    },
    {
      id: "integration_002",
      title: "Advanced API Gateway",
      category: "Integration",
      priority: "medium",
      status: "planned",
      description:
        "Enterprise-grade API gateway with rate limiting, monitoring, and security",
      impact: "Improved API management and security",
      effort: "3-4 weeks",
      dependencies: ["API infrastructure", "Security framework"],
      completionPercentage: 25,
      recommendations: [
        "Implement API gateway",
        "Add rate limiting and throttling",
        "Create API monitoring dashboard",
      ],
    },

    // User Experience Gaps
    {
      id: "ux_001",
      title: "Advanced Mobile PWA Features",
      category: "User Experience",
      priority: "medium",
      status: "partial",
      description: "Enhanced PWA capabilities with offline-first architecture",
      impact: "Improved mobile user experience and offline functionality",
      effort: "2-3 weeks",
      dependencies: ["PWA infrastructure", "Offline sync"],
      completionPercentage: 60,
      recommendations: [
        "Enhance offline capabilities",
        "Add push notifications",
        "Implement background sync",
      ],
    },
    {
      id: "ux_002",
      title: "Accessibility Compliance (WCAG 2.1)",
      category: "User Experience",
      priority: "high",
      status: "partial",
      description: "Full WCAG 2.1 AA compliance for accessibility",
      impact: "Improved accessibility and regulatory compliance",
      effort: "2-3 weeks",
      dependencies: ["UI components", "Testing framework"],
      completionPercentage: 75,
      recommendations: [
        "Complete accessibility audit",
        "Fix remaining WCAG issues",
        "Add accessibility testing",
      ],
    },

    // Analytics & Reporting Gaps
    {
      id: "analytics_001",
      title: "Advanced Business Intelligence Dashboard",
      category: "Analytics",
      priority: "medium",
      status: "missing",
      description: "Executive-level BI dashboard with predictive analytics",
      impact: "Enhanced business insights and strategic decision-making",
      effort: "4-5 weeks",
      dependencies: ["Data warehouse", "BI tools"],
      completionPercentage: 0,
      recommendations: [
        "Implement data warehouse",
        "Create executive dashboards",
        "Add predictive analytics",
      ],
    },
    {
      id: "analytics_002",
      title: "Real-time Operational Analytics",
      category: "Analytics",
      priority: "high",
      status: "partial",
      description: "Real-time operational metrics and performance indicators",
      impact: "Improved operational efficiency and real-time decision-making",
      effort: "2-3 weeks",
      dependencies: ["Real-time data pipeline", "Analytics engine"],
      completionPercentage: 45,
      recommendations: [
        "Complete real-time data pipeline",
        "Add operational KPI tracking",
        "Implement alert system",
      ],
    },

    // Testing & Quality Assurance Gaps
    {
      id: "qa_001",
      title: "Comprehensive Automated Testing Suite",
      category: "Quality Assurance",
      priority: "critical",
      status: "partial",
      description:
        "Complete automated testing framework with CI/CD integration",
      impact: "Improved code quality and deployment reliability",
      effort: "3-4 weeks",
      dependencies: ["Testing infrastructure", "CI/CD pipeline"],
      completionPercentage: 65,
      recommendations: [
        "Complete test coverage",
        "Add performance testing",
        "Implement automated regression testing",
      ],
    },
    {
      id: "qa_002",
      title: "Load Testing and Performance Benchmarking",
      category: "Quality Assurance",
      priority: "high",
      status: "missing",
      description:
        "Comprehensive load testing and performance benchmarking suite",
      impact: "Ensured system performance under load",
      effort: "2-3 weeks",
      dependencies: ["Load testing tools", "Performance metrics"],
      completionPercentage: 0,
      recommendations: [
        "Implement load testing framework",
        "Create performance benchmarks",
        "Add stress testing scenarios",
      ],
    },
  ];

  const categories: GapCategory[] = [
    {
      name: "Infrastructure",
      icon: <Settings className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "Infrastructure")
        .length,
      completedItems: gapItems.filter(
        (item) =>
          item.category === "Infrastructure" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) =>
          item.category === "Infrastructure" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Infrastructure")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Infrastructure").length,
      ),
    },
    {
      name: "Clinical",
      icon: <Users className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "Clinical")
        .length,
      completedItems: gapItems.filter(
        (item) => item.category === "Clinical" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) => item.category === "Clinical" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Clinical")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Clinical").length,
      ),
    },
    {
      name: "Compliance",
      icon: <Shield className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "Compliance")
        .length,
      completedItems: gapItems.filter(
        (item) => item.category === "Compliance" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) =>
          item.category === "Compliance" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Compliance")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Compliance").length,
      ),
    },
    {
      name: "Integration",
      icon: <Database className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "Integration")
        .length,
      completedItems: gapItems.filter(
        (item) =>
          item.category === "Integration" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) =>
          item.category === "Integration" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Integration")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Integration").length,
      ),
    },
    {
      name: "User Experience",
      icon: <Activity className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "User Experience")
        .length,
      completedItems: gapItems.filter(
        (item) =>
          item.category === "User Experience" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) =>
          item.category === "User Experience" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "User Experience")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "User Experience").length,
      ),
    },
    {
      name: "Analytics",
      icon: <TrendingUp className="h-5 w-5" />,
      totalItems: gapItems.filter((item) => item.category === "Analytics")
        .length,
      completedItems: gapItems.filter(
        (item) => item.category === "Analytics" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) => item.category === "Analytics" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Analytics")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Analytics").length,
      ),
    },
    {
      name: "Quality Assurance",
      icon: <CheckCircle className="h-5 w-5" />,
      totalItems: gapItems.filter(
        (item) => item.category === "Quality Assurance",
      ).length,
      completedItems: gapItems.filter(
        (item) =>
          item.category === "Quality Assurance" && item.status === "completed",
      ).length,
      criticalGaps: gapItems.filter(
        (item) =>
          item.category === "Quality Assurance" && item.priority === "critical",
      ).length,
      overallProgress: Math.round(
        gapItems
          .filter((item) => item.category === "Quality Assurance")
          .reduce((sum, item) => sum + item.completionPercentage, 0) /
          gapItems.filter((item) => item.category === "Quality Assurance")
            .length,
      ),
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-purple-100 text-purple-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "missing":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planned":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "missing":
        return <Flag className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredGaps = gapItems.filter((item) => {
    if (selectedCategory !== "overview" && item.category !== selectedCategory)
      return false;
    if (selectedPriority !== "all" && item.priority !== selectedPriority)
      return false;
    return true;
  });

  const overallProgress = Math.round(
    gapItems.reduce((sum, item) => sum + item.completionPercentage, 0) /
      gapItems.length,
  );

  const criticalGaps = gapItems.filter(
    (item) => item.priority === "critical" && item.status !== "completed",
  ).length;
  const highPriorityGaps = gapItems.filter(
    (item) => item.priority === "high" && item.status !== "completed",
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Platform Gap Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of remaining implementation gaps and
            enhancement opportunities
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last analysis: {lastAnalysis.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {overallProgress}% Complete
          </Badge>
          <Button
            onClick={() => setIsAnalyzing(true)}
            disabled={isAnalyzing}
            variant="outline"
          >
            <Brain
              className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            Re-analyze
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {gapItems.length}
                </p>
                <p className="text-sm text-blue-600">Total Items</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {criticalGaps}
                </p>
                <p className="text-sm text-red-600">Critical Gaps</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {highPriorityGaps}
                </p>
                <p className="text-sm text-orange-600">High Priority</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {overallProgress}%
                </p>
                <p className="text-sm text-green-600">Overall Progress</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalGaps > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Gaps Detected
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalGaps} critical gap{criticalGaps > 1 ? "s" : ""} require
            immediate attention to ensure platform robustness and production
            readiness.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {categories.map((category, index) => (
            <TabsTrigger key={index} value={category.name}>
              {category.name.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.name)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {category.overallProgress}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {category.completedItems}/{category.totalItems}
                      </Badge>
                    </div>
                    <Progress
                      value={category.overallProgress}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{category.totalItems} items</span>
                      {category.criticalGaps > 0 && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          {category.criticalGaps} critical
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Priority Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Priority-Based View</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={selectedPriority === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriority("all")}
                >
                  All
                </Button>
                <Button
                  variant={
                    selectedPriority === "critical" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPriority("critical")}
                >
                  Critical
                </Button>
                <Button
                  variant={selectedPriority === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriority("high")}
                >
                  High
                </Button>
                <Button
                  variant={
                    selectedPriority === "medium" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPriority("medium")}
                >
                  Medium
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGaps.slice(0, 5).map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(gap.status)}
                      <div>
                        <h4 className="font-medium text-sm">{gap.title}</h4>
                        <p className="text-xs text-gray-600">{gap.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(gap.priority)}>
                        {gap.priority}
                      </Badge>
                      <Badge className={getStatusColor(gap.status)}>
                        {gap.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map((category, categoryIndex) => (
          <TabsContent
            key={categoryIndex}
            value={category.name}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.name} Gaps - {category.overallProgress}% Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gapItems
                    .filter((item) => item.category === category.name)
                    .map((gap, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(gap.status)}
                            <h4 className="font-medium">{gap.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(gap.priority)}>
                              {gap.priority}
                            </Badge>
                            <Badge className={getStatusColor(gap.status)}>
                              {gap.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          {gap.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Impact:
                            </span>
                            <p className="text-gray-600">{gap.impact}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Effort:
                            </span>
                            <p className="text-gray-600">{gap.effort}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">
                              Progress:
                            </span>
                            <span className="text-gray-600">
                              {gap.completionPercentage}%
                            </span>
                          </div>
                          <Progress
                            value={gap.completionPercentage}
                            className="h-2"
                          />
                        </div>

                        {gap.dependencies.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 text-sm">
                              Dependencies:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {gap.dependencies.map((dep, depIndex) => (
                                <Badge
                                  key={depIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-medium text-gray-700 text-sm">
                            Recommendations:
                          </span>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                            {gap.recommendations.map((rec, recIndex) => (
                              <li
                                key={recIndex}
                                className="flex items-start gap-2"
                              >
                                <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Immediate (1-2 weeks)
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {gapItems
                    .filter(
                      (item) =>
                        item.priority === "critical" &&
                        item.status !== "completed",
                    )
                    .slice(0, 3)
                    .map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {item.title}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Short-term (2-6 weeks)
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {gapItems
                    .filter(
                      (item) =>
                        item.priority === "high" && item.status !== "completed",
                    )
                    .slice(0, 3)
                    .map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {item.title}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Medium-term (6+ weeks)
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {gapItems
                    .filter(
                      (item) =>
                        item.priority === "medium" &&
                        item.status !== "completed",
                    )
                    .slice(0, 3)
                    .map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {item.title}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformGapAnalysis;
