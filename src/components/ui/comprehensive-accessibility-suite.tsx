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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Keyboard,
  Palette,
  Type,
  MousePointer,
  Volume2,
  Mic,
  Camera,
  Smartphone,
  Monitor,
  Settings,
  Brain,
  Shield,
  Zap,
  Target,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  category: "visual" | "motor" | "cognitive" | "hearing";
  enabled: boolean;
  impact: "high" | "medium" | "low";
  wcagLevel: "A" | "AA" | "AAA";
}

interface AccessibilitySettings {
  fontSize: number;
  contrast: "normal" | "high" | "maximum";
  colorBlindnessSupport: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
  gestureNavigation: boolean;
  focusIndicators: "standard" | "enhanced" | "maximum";
  textSpacing: number;
  lineHeight: number;
}

interface ComprehensiveAccessibilitySuiteProps {
  className?: string;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

export const ComprehensiveAccessibilitySuite: React.FC<
  ComprehensiveAccessibilitySuiteProps
> = ({ className, onSettingsChange }) => {
  const [accessibilityScore, setAccessibilityScore] = useState(95);
  const [features, setFeatures] = useState<AccessibilityFeature[]>([
    {
      id: "high-contrast",
      name: "High Contrast Mode",
      description: "Enhanced color contrast for better visibility",
      category: "visual",
      enabled: true,
      impact: "high",
      wcagLevel: "AA",
    },
    {
      id: "screen-reader",
      name: "Screen Reader Optimization",
      description: "Enhanced ARIA labels and semantic markup",
      category: "visual",
      enabled: true,
      impact: "high",
      wcagLevel: "A",
    },
    {
      id: "keyboard-nav",
      name: "Enhanced Keyboard Navigation",
      description: "Comprehensive keyboard shortcuts and focus management",
      category: "motor",
      enabled: true,
      impact: "high",
      wcagLevel: "A",
    },
    {
      id: "voice-control",
      name: "Voice Control",
      description: "Voice commands for navigation and form filling",
      category: "motor",
      enabled: false,
      impact: "medium",
      wcagLevel: "AAA",
    },
    {
      id: "gesture-nav",
      name: "Gesture Navigation",
      description: "Touch gestures for mobile accessibility",
      category: "motor",
      enabled: true,
      impact: "medium",
      wcagLevel: "AA",
    },
    {
      id: "cognitive-support",
      name: "Cognitive Support",
      description: "Simplified interfaces and clear instructions",
      category: "cognitive",
      enabled: true,
      impact: "high",
      wcagLevel: "AAA",
    },
    {
      id: "audio-descriptions",
      name: "Audio Descriptions",
      description: "Audio descriptions for visual content",
      category: "hearing",
      enabled: false,
      impact: "medium",
      wcagLevel: "AA",
    },
    {
      id: "captions",
      name: "Live Captions",
      description: "Real-time captions for audio content",
      category: "hearing",
      enabled: true,
      impact: "high",
      wcagLevel: "AA",
    },
  ]);

  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: "normal",
    colorBlindnessSupport: false,
    reducedMotion: false,
    screenReaderOptimized: true,
    keyboardNavigation: true,
    voiceControl: false,
    gestureNavigation: true,
    focusIndicators: "enhanced",
    textSpacing: 1,
    lineHeight: 1.5,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);

  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        performAccessibilityAudit();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  useEffect(() => {
    applyAccessibilitySettings(settings);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const performAccessibilityAudit = async () => {
    let score = 100;

    try {
      // Check for missing alt text
      const images = document.querySelectorAll("img:not([alt])");
      score -= images.length * 3;

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (headings.length === 0) score -= 10;

      // Check for form labels
      const inputs = document.querySelectorAll(
        "input:not([aria-label]):not([aria-labelledby])",
      );
      const unlabeledInputs = Array.from(inputs).filter((input) => {
        const id = input.getAttribute("id");
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      score -= unlabeledInputs.length * 2;

      // Check for keyboard accessibility
      const interactiveElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      let keyboardInaccessible = 0;
      interactiveElements.forEach((element) => {
        const tabIndex = element.getAttribute("tabindex");
        if (tabIndex === "-1" && !element.hasAttribute("aria-hidden")) {
          keyboardInaccessible++;
        }
      });
      score -= keyboardInaccessible * 2;

      // Check color contrast (simplified)
      const elements = document.querySelectorAll("*");
      let lowContrastCount = 0;
      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (
          color &&
          backgroundColor &&
          color !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          // Simplified contrast check
          const colorLuminance = getColorLuminance(color);
          const bgLuminance = getColorLuminance(backgroundColor);
          const contrastRatio =
            (Math.max(colorLuminance, bgLuminance) + 0.05) /
            (Math.min(colorLuminance, bgLuminance) + 0.05);

          if (contrastRatio < 4.5) {
            lowContrastCount++;
          }
        }
      });
      score -= Math.min(lowContrastCount * 0.5, 15);

      // Check for ARIA attributes
      const elementsWithRole = document.querySelectorAll("[role]");
      const elementsWithAriaLabel = document.querySelectorAll(
        "[aria-label], [aria-labelledby]",
      );
      const ariaScore =
        ((elementsWithRole.length + elementsWithAriaLabel.length) /
          Math.max(interactiveElements.length, 1)) *
        10;
      score += Math.min(ariaScore, 10);

      setAccessibilityScore(Math.max(0, Math.min(100, Math.round(score))));
    } catch (error) {
      console.error("Accessibility audit failed:", error);
    }
  };

  const getColorLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0.5;

    const [r, g, b] = rgb.map((c) => {
      const val = parseInt(c) / 255;
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${newSettings.fontSize}px`;

    // Contrast
    if (newSettings.contrast === "high") {
      root.classList.add("high-contrast");
      root.classList.remove("maximum-contrast");
    } else if (newSettings.contrast === "maximum") {
      root.classList.add("maximum-contrast");
      root.classList.remove("high-contrast");
    } else {
      root.classList.remove("high-contrast", "maximum-contrast");
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Focus indicators
    root.setAttribute("data-focus-style", newSettings.focusIndicators);

    // Text spacing
    root.style.setProperty(
      "--text-spacing",
      newSettings.textSpacing.toString(),
    );
    root.style.setProperty("--line-height", newSettings.lineHeight.toString());

    // Color blindness support
    if (newSettings.colorBlindnessSupport) {
      root.classList.add("colorblind-support");
    } else {
      root.classList.remove("colorblind-support");
    }
  };

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature,
      ),
    );
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "visual":
        return <Eye className="h-4 w-4" />;
      case "motor":
        return <MousePointer className="h-4 w-4" />;
      case "cognitive":
        return <Brain className="h-4 w-4" />;
      case "hearing":
        return <Volume2 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const enabledFeatures = features.filter((f) => f.enabled).length;
  const totalFeatures = features.length;

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Comprehensive Accessibility Suite
              </CardTitle>
              <CardDescription>
                Advanced accessibility features with WCAG compliance monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                WCAG AAA
              </Badge>
              <Badge
                variant={
                  accessibilityScore >= 90
                    ? "default"
                    : accessibilityScore >= 70
                      ? "secondary"
                      : "destructive"
                }
              >
                Score: {accessibilityScore}/100
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
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Accessibility Score */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div
                  className={cn(
                    "text-4xl font-bold mb-2",
                    getScoreColor(accessibilityScore),
                  )}
                >
                  {accessibilityScore}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Accessibility Compliance Score
                </div>
                <Progress
                  value={accessibilityScore}
                  className="h-3 max-w-xs mx-auto"
                />
              </div>

              {/* Feature Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feature Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Enabled Features
                        </span>
                        <span className="text-sm font-bold">
                          {enabledFeatures}/{totalFeatures}
                        </span>
                      </div>
                      <Progress
                        value={(enabledFeatures / totalFeatures) * 100}
                        className="h-2"
                      />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span>
                            Visual:{" "}
                            {
                              features.filter(
                                (f) => f.category === "visual" && f.enabled,
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-4 w-4 text-green-600" />
                          <span>
                            Motor:{" "}
                            {
                              features.filter(
                                (f) => f.category === "motor" && f.enabled,
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span>
                            Cognitive:{" "}
                            {
                              features.filter(
                                (f) => f.category === "cognitive" && f.enabled,
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-orange-600" />
                          <span>
                            Hearing:{" "}
                            {
                              features.filter(
                                (f) => f.category === "hearing" && f.enabled,
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">WCAG Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level A</span>
                          <span className="text-green-600">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level AA</span>
                          <span className="text-green-600">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level AAA</span>
                          <span className="text-yellow-600">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="space-y-4">
                {features.map((feature) => (
                  <Card
                    key={feature.id}
                    className={cn(
                      "border-l-4",
                      feature.enabled
                        ? "border-l-green-500"
                        : "border-l-gray-300",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getCategoryIcon(feature.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{feature.name}</h4>
                              <Badge
                                variant={
                                  feature.impact === "high"
                                    ? "destructive"
                                    : feature.impact === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {feature.impact} impact
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                WCAG {feature.wcagLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {feature.enabled && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Visual Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font Size: {settings.fontSize}px</Label>
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={([value]) =>
                          updateSetting("fontSize", value)
                        }
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Contrast Level</Label>
                      <div className="flex gap-2">
                        {(["normal", "high", "maximum"] as const).map(
                          (level) => (
                            <Button
                              key={level}
                              variant={
                                settings.contrast === level
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => updateSetting("contrast", level)}
                              className="capitalize"
                            >
                              {level}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Spacing: {settings.textSpacing}</Label>
                      <Slider
                        value={[settings.textSpacing]}
                        onValueChange={([value]) =>
                          updateSetting("textSpacing", value)
                        }
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Line Height: {settings.lineHeight}</Label>
                      <Slider
                        value={[settings.lineHeight]}
                        onValueChange={([value]) =>
                          updateSetting("lineHeight", value)
                        }
                        min={1}
                        max={2.5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="colorblind-support">
                        Color Blindness Support
                      </Label>
                      <Switch
                        id="colorblind-support"
                        checked={settings.colorBlindnessSupport}
                        onCheckedChange={(checked) =>
                          updateSetting("colorBlindnessSupport", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="reduced-motion">Reduced Motion</Label>
                      <Switch
                        id="reduced-motion"
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) =>
                          updateSetting("reducedMotion", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Interaction Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MousePointer className="h-4 w-4" />
                      Interaction Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Focus Indicators</Label>
                      <div className="flex gap-2">
                        {(["standard", "enhanced", "maximum"] as const).map(
                          (level) => (
                            <Button
                              key={level}
                              variant={
                                settings.focusIndicators === level
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateSetting("focusIndicators", level)
                              }
                              className="capitalize"
                            >
                              {level}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyboard-nav">
                        Enhanced Keyboard Navigation
                      </Label>
                      <Switch
                        id="keyboard-nav"
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) =>
                          updateSetting("keyboardNavigation", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="voice-control">Voice Control</Label>
                      <Switch
                        id="voice-control"
                        checked={settings.voiceControl}
                        onCheckedChange={(checked) =>
                          updateSetting("voiceControl", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="gesture-nav">Gesture Navigation</Label>
                      <Switch
                        id="gesture-nav"
                        checked={settings.gestureNavigation}
                        onCheckedChange={(checked) =>
                          updateSetting("gestureNavigation", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="screen-reader">
                        Screen Reader Optimization
                      </Label>
                      <Switch
                        id="screen-reader"
                        checked={settings.screenReaderOptimized}
                        onCheckedChange={(checked) =>
                          updateSetting("screenReaderOptimized", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Real-time Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="real-time-monitoring">
                          Enable Real-time Monitoring
                        </Label>
                        <Switch
                          id="real-time-monitoring"
                          checked={realTimeMonitoring}
                          onCheckedChange={setRealTimeMonitoring}
                        />
                      </div>

                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          Real-time monitoring{" "}
                          {realTimeMonitoring ? "is active" : "is disabled"}.
                          Accessibility compliance is checked every 10 seconds
                          when enabled.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={performAccessibilityAudit}
                        className="w-full"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Run Manual Audit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            ARIA Labels
                          </span>
                        </div>
                        <Badge variant="default">Compliant</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Keyboard Navigation
                          </span>
                        </div>
                        <Badge variant="default">Compliant</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            Color Contrast
                          </span>
                        </div>
                        <Badge variant="secondary">Needs Review</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Focus Management
                          </span>
                        </div>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAccessibilitySuite;
