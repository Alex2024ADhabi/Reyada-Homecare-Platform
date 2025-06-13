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
} from "lucide-react";
import { damanTrainingSupport } from "@/services/daman-training-support.service";

interface DamanTrainingInterfaceProps {
  currentField?: string;
  formData?: any;
  onGuidanceApply?: (guidance: string) => void;
}

export const DamanTrainingInterface: React.FC<DamanTrainingInterfaceProps> = ({
  currentField,
  formData,
  onGuidanceApply,
}) => {
  const [contextualHelp, setContextualHelp] = useState<any>(null);
  const [guidanceSteps, setGuidanceSteps] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [updateNotifications, setUpdateNotifications] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any>(null);
  const [errorResolution, setErrorResolution] = useState<any>(null);

  useEffect(() => {
    loadTrainingData();
  }, []);

  useEffect(() => {
    if (currentField) {
      loadContextualHelp(currentField);
    }
  }, [currentField]);

  useEffect(() => {
    if (formData) {
      loadGuidanceSteps(formData);
    }
  }, [formData]);

  const loadTrainingData = async () => {
    try {
      // Load training modules
      const modules = damanTrainingSupport.getTrainingModules();
      setTrainingModules(modules);

      // Load user progress
      const progress = damanTrainingSupport.getUserProgress("current-user");
      setUserProgress(progress);

      // Load update notifications
      const notifications = damanTrainingSupport.getUpdateNotifications();
      setUpdateNotifications(notifications);

      // Load best practices
      const practices = damanTrainingSupport.getBestPractices("submission");
      setBestPractices(practices);

      // Search knowledge base
      const articles = damanTrainingSupport.searchKnowledgeBase("");
      setKnowledgeBase(articles.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error("Failed to load training data:", error);
    }
  };

  const loadContextualHelp = (fieldName: string) => {
    const help = damanTrainingSupport.getContextualHelp(fieldName);
    setContextualHelp(help);
  };

  const loadGuidanceSteps = (data: any) => {
    const steps = damanTrainingSupport.generateSubmissionGuidance(
      data,
      "beginner",
    );
    setGuidanceSteps(steps);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = damanTrainingSupport.searchKnowledgeBase(query);
      setKnowledgeBase(results);
    } else {
      const articles = damanTrainingSupport.searchKnowledgeBase("");
      setKnowledgeBase(articles.slice(0, 5));
    }
  };

  const handleModuleStart = (module: any) => {
    setSelectedModule(module);
    setCurrentSection(0);
    setModuleProgress(0);
  };

  const handleSectionComplete = () => {
    if (selectedModule && currentSection < selectedModule.sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      const newProgress =
        ((currentSection + 1) / selectedModule.sections.length) * 100;
      setModuleProgress(newProgress);

      // Track progress
      damanTrainingSupport.trackProgress("current-user", selectedModule.id, {
        completed: newProgress === 100,
        timeSpent: 0,
        completedSections: selectedModule.sections
          .slice(0, currentSection + 1)
          .map((s: any) => s.title),
      });
    }
  };

  const handleErrorHelp = (errorType: string, errorMessage: string) => {
    const help = damanTrainingSupport.getErrorResolutionHelp(
      errorType,
      errorMessage,
    );
    setErrorResolution(help);
  };

  const renderContextualHelp = () => {
    if (!contextualHelp) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {contextualHelp.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{contextualHelp.content}</p>

          {contextualHelp.examples && contextualHelp.examples.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Examples:</h4>
              <ul className="text-sm space-y-1">
                {contextualHelp.examples.map(
                  (example: string, index: number) => (
                    <li key={index} className="text-green-600">
                      • {example}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {contextualHelp.commonMistakes &&
            contextualHelp.commonMistakes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Common Mistakes:</h4>
                <ul className="text-sm space-y-1">
                  {contextualHelp.commonMistakes.map(
                    (mistake: string, index: number) => (
                      <li key={index} className="text-red-600">
                        • {mistake}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {contextualHelp.smartSuggestions &&
            contextualHelp.smartSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Smart Suggestions:
                </h4>
                <div className="space-y-2">
                  {contextualHelp.smartSuggestions.map(
                    (suggestion: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <span className="text-sm">{suggestion}</span>
                        {onGuidanceApply && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onGuidanceApply(suggestion)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {contextualHelp.complianceUpdates &&
            contextualHelp.complianceUpdates.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Latest Updates:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {contextualHelp.complianceUpdates.map(
                      (update: string, index: number) => (
                        <li key={index}>{update}</li>
                      ),
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    );
  };

  const renderGuidanceSteps = () => {
    if (guidanceSteps.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Step-by-Step Guidance
          </CardTitle>
          <CardDescription>
            Follow these steps for successful Daman submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guidanceSteps.map((step, index) => {
              const isCompleted = step.type === "success";
              const hasWarning = step.type === "warning";
              const hasError = step.type === "error";

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : hasWarning
                          ? "bg-yellow-100 text-yellow-700"
                          : hasError
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : hasError ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {step.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedTime}
                        </div>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {step.difficulty}
                      </Badge>
                    </div>

                    {step.prerequisites && step.prerequisites.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Prerequisites:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {step.prerequisites.map(
                            (prereq: string, i: number) => (
                              <li key={i}>{prereq}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderKnowledgeBase = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Search Daman guidelines and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search guidelines, procedures, FAQs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {knowledgeBase.map((article) => (
                <div
                  key={article.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{article.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {article.content}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {article.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {article.estimatedReadTime}min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderTrainingModules = () => {
    return (
      <div className="space-y-4">
        {!selectedModule ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((module) => {
              const progress = userProgress[module.id];
              const isCompleted = progress?.completed || false;

              return (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {module.duration}min
                      </div>
                      <Badge variant="outline">{module.difficulty}</Badge>
                    </div>

                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>
                            {progress.completedSections?.length || 0}/
                            {module.sections.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            ((progress.completedSections?.length || 0) /
                              module.sections.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => handleModuleStart(module)}
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? "Review" : "Start"} Module
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedModule.title}</CardTitle>
                  <CardDescription>
                    Section {currentSection + 1} of{" "}
                    {selectedModule.sections.length}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedModule(null)}
                >
                  Back to Modules
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(moduleProgress)}%</span>
                </div>
                <Progress value={moduleProgress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {selectedModule.sections[currentSection].title}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p>{selectedModule.sections[currentSection].content}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentSection((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>

                <Button
                  onClick={handleSectionComplete}
                  disabled={
                    currentSection >= selectedModule.sections.length - 1
                  }
                >
                  {currentSection >= selectedModule.sections.length - 1
                    ? "Complete"
                    : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderUpdateNotifications = () => {
    if (updateNotifications.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Latest Updates
          </CardTitle>
          <CardDescription>
            Important Daman guideline updates and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {updateNotifications.map((notification) => (
              <Alert
                key={notification.id}
                className={`${
                  notification.priority === "critical"
                    ? "border-red-200 bg-red-50"
                    : notification.priority === "high"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  {notification.priority === "critical" ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">
                        {notification.title}
                      </h4>
                      <Badge
                        variant={
                          notification.priority === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {notification.description}
                    </p>
                    {notification.effectiveDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Effective:{" "}
                        {new Date(
                          notification.effectiveDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBestPractices = () => {
    if (!bestPractices) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {bestPractices.title}
          </CardTitle>
          <CardDescription>
            Proven strategies for successful Daman submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bestPractices.practices.map((practice: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{practice.practice}</h4>
                  <div className="flex gap-1">
                    <Badge
                      variant={
                        practice.impact === "high" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {practice.impact} impact
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {practice.difficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{practice.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daman Training & Support</h2>
          <p className="text-gray-600">Built-in guidance and knowledge base</p>
        </div>
      </div>

      <Tabs defaultValue="help" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="help">Contextual Help</TabsTrigger>
          <TabsTrigger value="guidance">Step Guidance</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-4">
          {renderContextualHelp()}
          {renderBestPractices()}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          {renderGuidanceSteps()}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {renderKnowledgeBase()}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {renderTrainingModules()}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          {renderUpdateNotifications()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DamanTrainingInterface;
