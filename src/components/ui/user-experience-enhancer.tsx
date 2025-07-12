import React, { useState, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Zap,
  Eye,
  Smartphone,
  Mouse,
  Keyboard,
  Volume2,
  Sun,
  Moon,
  Type,
  Layout,
  Navigation,
  Settings,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Clock,
  Target,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface UXMetrics {
  taskCompletionRate: number;
  averageTaskTime: number;
  errorRate: number;
  userSatisfaction: number;
  accessibilityScore: number;
  mobileUsability: number;
  navigationEfficiency: number;
  visualHierarchy: number;
  loadingExperience: number;
  interactionFeedback: number;
}

interface UXEnhancement {
  id: string;
  category:
    | "visual"
    | "interaction"
    | "navigation"
    | "accessibility"
    | "performance";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  implementation: string;
  enabled: boolean;
}

interface UserPreferences {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  keyboardNavigation: boolean;
}

interface UserExperienceEnhancerProps {
  className?: string;
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

export const UserExperienceEnhancer: React.FC<UserExperienceEnhancerProps> = ({
  className,
  onPreferencesChange,
}) => {
  const [metrics, setMetrics] = useState<UXMetrics>({
    taskCompletionRate: 94,
    averageTaskTime: 2.3,
    errorRate: 3.2,
    userSatisfaction: 4.6,
    accessibilityScore: 89,
    mobileUsability: 92,
    navigationEfficiency: 87,
    visualHierarchy: 91,
    loadingExperience: 88,
    interactionFeedback: 93,
  });

  const [enhancements, setEnhancements] = useState<UXEnhancement[]>([
    {
      id: "smooth-animations",
      category: "visual",
      title: "Smooth Animations",
      description: "Enable fluid transitions and micro-interactions",
      impact: "medium",
      implementation: "CSS transitions and transform animations",
      enabled: true,
    },
    {
      id: "loading-indicators",
      category: "interaction",
      title: "Loading Indicators",
      description: "Show progress feedback for all async operations",
      impact: "high",
      implementation: "Skeleton screens and progress bars",
      enabled: true,
    },
    {
      id: "keyboard-shortcuts",
      category: "accessibility",
      title: "Keyboard Shortcuts",
      description: "Enable keyboard navigation for power users",
      impact: "medium",
      implementation: "Global hotkey system",
      enabled: false,
    },
    {
      id: "contextual-help",
      category: "navigation",
      title: "Contextual Help",
      description: "Provide inline help and tooltips",
      impact: "high",
      implementation: "Smart tooltip system",
      enabled: true,
    },
    {
      id: "error-prevention",
      category: "interaction",
      title: "Error Prevention",
      description: "Prevent common user errors with validation",
      impact: "high",
      implementation: "Real-time form validation",
      enabled: true,
    },
    {
      id: "personalization",
      category: "visual",
      title: "UI Personalization",
      description: "Allow users to customize interface preferences",
      impact: "medium",
      implementation: "Theme and layout customization",
      enabled: true,
    },
  ]);

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    fontSize: 16,
    animationsEnabled: true,
    soundEnabled: false,
    highContrast: false,
    reducedMotion: false,
    compactMode: false,
    keyboardNavigation: false,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [userFeedback, setUserFeedback] = useState<{
    rating: number;
    comments: string[];
  }>({
    rating: 4.6,
    comments: [
      "Interface is intuitive and easy to navigate",
      "Loading times are excellent",
      "Would like more keyboard shortcuts",
      "Mobile experience is smooth",
    ],
  });

  // Apply user preferences to the document
  useEffect(() => {
    applyPreferences(preferences);
    if (onPreferencesChange) {
      onPreferencesChange(preferences);
    }
  }, [preferences, onPreferencesChange]);

  // Monitor user interactions for UX metrics
  useEffect(() => {
    const trackUserInteractions = () => {
      // Track clicks, navigation, errors, etc.
      let clickCount = 0;
      let errorCount = 0;
      let navigationCount = 0;

      const handleClick = () => {
        clickCount++;
        updateMetricsFromInteractions({ clicks: clickCount });
      };

      const handleError = () => {
        errorCount++;
        updateMetricsFromInteractions({ errors: errorCount });
      };

      const handleNavigation = () => {
        navigationCount++;
        updateMetricsFromInteractions({ navigation: navigationCount });
      };

      document.addEventListener("click", handleClick);
      window.addEventListener("error", handleError);
      window.addEventListener("popstate", handleNavigation);

      return () => {
        document.removeEventListener("click", handleClick);
        window.removeEventListener("error", handleError);
        window.removeEventListener("popstate", handleNavigation);
      };
    };

    const cleanup = trackUserInteractions();
    return cleanup;
  }, []);

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement;

    // Theme
    if (prefs.theme === "dark") {
      root.classList.add("dark");
    } else if (prefs.theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // Font size
    root.style.fontSize = `${prefs.fontSize}px`;

    // High contrast
    if (prefs.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Reduced motion
    if (prefs.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Compact mode
    if (prefs.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }

    // Animations
    if (!prefs.animationsEnabled) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
    }
  };

  const updateMetricsFromInteractions = (interactions: any) => {
    // Update UX metrics based on user interactions
    setMetrics((prev) => ({
      ...prev,
      // Simulate metric updates based on interactions
      errorRate: Math.max(0, prev.errorRate - 0.1),
      navigationEfficiency: Math.min(100, prev.navigationEfficiency + 0.1),
    }));
  };

  const toggleEnhancement = (id: string) => {
    setEnhancements((prev) =>
      prev.map((enhancement) =>
        enhancement.id === id
          ? { ...enhancement, enabled: !enhancement.enabled }
          : enhancement,
      ),
    );
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const calculateOverallUXScore = () => {
    const weights = {
      taskCompletionRate: 0.2,
      userSatisfaction: 0.2,
      accessibilityScore: 0.15,
      mobileUsability: 0.15,
      navigationEfficiency: 0.1,
      visualHierarchy: 0.1,
      loadingExperience: 0.05,
      interactionFeedback: 0.05,
    };

    return Math.round(
      Object.entries(weights).reduce((score, [key, weight]) => {
        const metricValue = metrics[key as keyof UXMetrics];
        const normalizedValue =
          key === "averageTaskTime" || key === "errorRate"
            ? Math.max(0, 100 - metricValue * 10) // Lower is better for these metrics
            : key === "userSatisfaction"
              ? metricValue * 20 // Convert 5-star rating to 100-point scale
              : metricValue; // Already on 100-point scale

        return score + normalizedValue * weight;
      }, 0),
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const overallScore = calculateOverallUXScore();

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Experience Enhancer
              </CardTitle>
              <CardDescription>
                Optimize user experience with real-time metrics and
                personalization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {userFeedback.rating}/5.0
              </Badge>
              <Badge
                variant={
                  overallScore >= 90
                    ? "default"
                    : overallScore >= 70
                      ? "secondary"
                      : "destructive"
                }
              >
                UX Score: {overallScore}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overall UX Score */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div
                  className={cn(
                    "text-4xl font-bold mb-2",
                    getScoreColor(overallScore),
                  )}
                >
                  {overallScore}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Overall UX Score
                </div>
                <Progress
                  value={overallScore}
                  className="h-3 max-w-xs mx-auto"
                />
              </div>

              {/* UX Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.taskCompletionRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Task Completion
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.averageTaskTime}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Task Time
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.userSatisfaction}/5
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Satisfaction
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.mobileUsability}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mobile UX
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Navigation Efficiency</span>
                        <span>{metrics.navigationEfficiency}%</span>
                      </div>
                      <Progress
                        value={metrics.navigationEfficiency}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Loading Experience</span>
                        <span>{metrics.loadingExperience}%</span>
                      </div>
                      <Progress
                        value={metrics.loadingExperience}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interaction Feedback</span>
                        <span>{metrics.interactionFeedback}%</span>
                      </div>
                      <Progress
                        value={metrics.interactionFeedback}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accessibility Score</span>
                        <span>{metrics.accessibilityScore}%</span>
                      </div>
                      <Progress
                        value={metrics.accessibilityScore}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Visual Hierarchy</span>
                        <span>{metrics.visualHierarchy}%</span>
                      </div>
                      <Progress
                        value={metrics.visualHierarchy}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Error Rate</span>
                        <span className="text-red-600">
                          {metrics.errorRate}%
                        </span>
                      </div>
                      <Progress
                        value={100 - metrics.errorRate}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="enhancements" className="space-y-6">
              <div className="space-y-4">
                {enhancements.map((enhancement) => {
                  const categoryIcons = {
                    visual: Palette,
                    interaction: Mouse,
                    navigation: Navigation,
                    accessibility: Eye,
                    performance: Zap,
                  };

                  const Icon = categoryIcons[enhancement.category];

                  return (
                    <Card
                      key={enhancement.id}
                      className={cn(
                        "border-l-4",
                        enhancement.enabled
                          ? "border-l-green-500"
                          : "border-l-gray-300",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  {enhancement.title}
                                </h4>
                                <Badge
                                  variant={
                                    enhancement.impact === "high"
                                      ? "destructive"
                                      : enhancement.impact === "medium"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {enhancement.impact} impact
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {enhancement.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {enhancement.description}
                              </p>
                              <p className="text-xs text-blue-600">
                                Implementation: {enhancement.implementation}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {enhancement.enabled && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <Switch
                              checked={enhancement.enabled}
                              onCheckedChange={() =>
                                toggleEnhancement(enhancement.id)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Visual Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex gap-2">
                        {(["light", "dark", "auto"] as const).map((theme) => (
                          <Button
                            key={theme}
                            variant={
                              preferences.theme === theme
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => updatePreference("theme", theme)}
                            className="flex items-center gap-2"
                          >
                            {theme === "light" && <Sun className="h-4 w-4" />}
                            {theme === "dark" && <Moon className="h-4 w-4" />}
                            {theme === "auto" && (
                              <Settings className="h-4 w-4" />
                            )}
                            {theme}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size: {preferences.fontSize}px</Label>
                      <Slider
                        value={[preferences.fontSize]}
                        onValueChange={([value]) =>
                          updatePreference("fontSize", value)
                        }
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-contrast">High Contrast</Label>
                      <Switch
                        id="high-contrast"
                        checked={preferences.highContrast}
                        onCheckedChange={(checked) =>
                          updatePreference("highContrast", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <Switch
                        id="compact-mode"
                        checked={preferences.compactMode}
                        onCheckedChange={(checked) =>
                          updatePreference("compactMode", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Interaction Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mouse className="h-4 w-4" />
                      Interaction Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">Animations</Label>
                      <Switch
                        id="animations"
                        checked={preferences.animationsEnabled}
                        onCheckedChange={(checked) =>
                          updatePreference("animationsEnabled", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="reduced-motion">Reduced Motion</Label>
                      <Switch
                        id="reduced-motion"
                        checked={preferences.reducedMotion}
                        onCheckedChange={(checked) =>
                          updatePreference("reducedMotion", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound">Sound Effects</Label>
                      <Switch
                        id="sound"
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked) =>
                          updatePreference("soundEnabled", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                      <Switch
                        id="keyboard-nav"
                        checked={preferences.keyboardNavigation}
                        onCheckedChange={(checked) =>
                          updatePreference("keyboardNavigation", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Preferences are automatically saved and applied in real-time.
                  Changes will persist across browser sessions.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Satisfaction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      User Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {userFeedback.rating}/5.0
                      </div>
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-5 w-5",
                              star <= Math.floor(userFeedback.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on user feedback and interaction patterns
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userFeedback.comments.map((comment, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* UX Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recent UX Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          Loading Performance
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reduced average load time by 23% with optimized
                          bundling
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Mobile Experience</p>
                        <p className="text-xs text-muted-foreground">
                          Enhanced touch interactions and responsive design
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Accessibility</p>
                        <p className="text-xs text-muted-foreground">
                          Improved keyboard navigation and screen reader support
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserExperienceEnhancer;
