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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilityIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: "keyboard" | "color" | "text" | "structure" | "aria" | "focus";
  title: string;
  description: string;
  element?: string;
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriterion: string;
  suggestion: string;
}

interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: number;
  totalChecks: number;
  wcagLevel: "A" | "AA" | "AAA";
}

interface AccessibilityCheckerProps {
  className?: string;
  autoCheck?: boolean;
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  className,
  autoCheck = false,
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (autoCheck) {
      runAccessibilityCheck();
    }
  }, [autoCheck]);

  const runAccessibilityCheck = async () => {
    setLoading(true);
    try {
      // Simulate accessibility audit
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockIssues: AccessibilityIssue[] = [
        {
          id: "1",
          type: "error",
          category: "aria",
          title: "Missing ARIA labels",
          description: "Interactive elements lack proper ARIA labels",
          element: "button.submit-btn",
          wcagLevel: "A",
          wcagCriterion: "4.1.2 Name, Role, Value",
          suggestion: "Add aria-label or aria-labelledby attributes",
        },
        {
          id: "2",
          type: "warning",
          category: "color",
          title: "Low color contrast",
          description: "Text color contrast ratio is below WCAG AA standards",
          element: ".text-muted",
          wcagLevel: "AA",
          wcagCriterion: "1.4.3 Contrast (Minimum)",
          suggestion: "Increase contrast ratio to at least 4.5:1",
        },
        {
          id: "3",
          type: "error",
          category: "keyboard",
          title: "Keyboard trap detected",
          description: "Focus gets trapped in modal dialog",
          element: ".modal-dialog",
          wcagLevel: "A",
          wcagCriterion: "2.1.2 No Keyboard Trap",
          suggestion: "Implement proper focus management with escape key",
        },
        {
          id: "4",
          type: "warning",
          category: "text",
          title: "Small text size",
          description: "Text is smaller than recommended minimum size",
          element: ".text-xs",
          wcagLevel: "AA",
          wcagCriterion: "1.4.4 Resize text",
          suggestion:
            "Ensure text can be resized up to 200% without loss of functionality",
        },
        {
          id: "5",
          type: "info",
          category: "structure",
          title: "Missing heading hierarchy",
          description:
            "Page structure could benefit from proper heading levels",
          element: "main",
          wcagLevel: "AAA",
          wcagCriterion: "2.4.10 Section Headings",
          suggestion: "Use proper heading hierarchy (h1, h2, h3, etc.)",
        },
        {
          id: "6",
          type: "warning",
          category: "focus",
          title: "Insufficient focus indicators",
          description: "Focus indicators are not clearly visible",
          element: "input, button",
          wcagLevel: "AA",
          wcagCriterion: "2.4.7 Focus Visible",
          suggestion: "Enhance focus ring visibility with better contrast",
        },
      ];

      const totalChecks = 25;
      const passedChecks = totalChecks - mockIssues.length;
      const score = Math.round((passedChecks / totalChecks) * 100);
      const wcagLevel = score >= 95 ? "AAA" : score >= 80 ? "AA" : "A";

      setReport({
        score,
        issues: mockIssues,
        passedChecks,
        totalChecks,
        wcagLevel,
      });
    } catch (error) {
      console.error("Accessibility check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIssuesByCategory = (category: string) => {
    if (!report) return [];
    if (category === "all") return report.issues;
    return report.issues.filter((issue) => issue.category === category);
  };

  const getIssueIcon = (type: AccessibilityIssue["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue["category"]) => {
    switch (category) {
      case "keyboard":
        return <Keyboard className="h-4 w-4" />;
      case "color":
        return <Palette className="h-4 w-4" />;
      case "text":
        return <Type className="h-4 w-4" />;
      case "structure":
        return <Eye className="h-4 w-4" />;
      case "aria":
        return <Volume2 className="h-4 w-4" />;
      case "focus":
        return <MousePointer className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const getWcagBadgeColor = (level: "A" | "AA" | "AAA") => {
    switch (level) {
      case "AAA":
        return "bg-green-100 text-green-800";
      case "AA":
        return "bg-blue-100 text-blue-800";
      case "A":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const categories = [
    { id: "all", label: "All Issues", icon: Eye },
    { id: "keyboard", label: "Keyboard", icon: Keyboard },
    { id: "color", label: "Color", icon: Palette },
    { id: "text", label: "Text", icon: Type },
    { id: "structure", label: "Structure", icon: Eye },
    { id: "aria", label: "ARIA", icon: Volume2 },
    { id: "focus", label: "Focus", icon: MousePointer },
  ];

  const filteredIssues = getIssuesByCategory(selectedCategory);

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Checker
              </CardTitle>
              <CardDescription>
                WCAG compliance analysis and accessibility recommendations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {report && (
                <>
                  <Badge className={getWcagBadgeColor(report.wcagLevel)}>
                    WCAG {report.wcagLevel}
                  </Badge>
                  <Badge variant={getScoreBadgeVariant(report.score)}>
                    Score: {report.score}/100
                  </Badge>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={runAccessibilityCheck}
                disabled={loading}
              >
                {loading ? "Checking..." : "Run Check"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Running accessibility audit...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(report.score),
                    )}
                  >
                    {report.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {report.passedChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {report.issues.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{report.wcagLevel}</div>
                  <div className="text-sm text-muted-foreground">
                    WCAG Level
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Accessibility Score
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      getScoreColor(report.score),
                    )}
                  >
                    {report.score}/100
                  </span>
                </div>
                <Progress value={report.score} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {report.passedChecks} of {report.totalChecks} checks passed
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const count =
                    category.id === "all"
                      ? report.issues.length
                      : report.issues.filter(
                          (issue) => issue.category === category.id,
                        ).length;
                  return (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Issues List */}
              <div className="space-y-3">
                <h4 className="font-medium">
                  {selectedCategory === "all"
                    ? "All Issues"
                    : `${selectedCategory} Issues`}
                  {filteredIssues.length > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({filteredIssues.length})
                    </span>
                  )}
                </h4>
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <p>No issues found in this category! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getIssueIcon(issue.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium">{issue.title}</h5>
                              <Badge
                                variant="outline"
                                className={getWcagBadgeColor(issue.wcagLevel)}
                              >
                                WCAG {issue.wcagLevel}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(issue.category)}
                                <span className="text-xs text-muted-foreground capitalize">
                                  {issue.category}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {issue.description}
                            </p>
                            {issue.element && (
                              <div className="text-xs font-mono bg-muted px-2 py-1 rounded mb-2">
                                {issue.element}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mb-2">
                              <strong>WCAG Criterion:</strong>{" "}
                              {issue.wcagCriterion}
                            </div>
                            <div className="text-sm bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                              <strong className="text-blue-800">
                                Suggestion:
                              </strong>
                              <span className="text-blue-700 ml-2">
                                {issue.suggestion}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Run Check" to start accessibility audit</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityChecker;
