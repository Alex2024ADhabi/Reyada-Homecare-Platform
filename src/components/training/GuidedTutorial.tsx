import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Target,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  X,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  Sparkles,
  MessageSquare,
  BookOpen,
  Camera,
  FileText,
  Clock,
  Star,
  Zap,
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  highlight?: string;
  videoUrl?: string;
  aiAssistance?: {
    enabled: boolean;
    suggestions: string[];
    contextualHelp: string;
  };
  voiceNarration?: {
    enabled: boolean;
    audioUrl: string;
    transcript: string;
  };
  checkpoint?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    aiHint?: string;
  };
  practiceActivity?: {
    instruction: string;
    aiGuidance?: string;
    fields: Array<{
      name: string;
      type: "text" | "select" | "textarea" | "file" | "camera";
      label: string;
      options?: string[];
      required: boolean;
      aiValidation?: boolean;
      placeholder?: string;
    }>;
  };
  competencyMapping?: {
    skills: string[];
    level: "beginner" | "intermediate" | "advanced";
    prerequisites?: string[];
  };
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  steps: TutorialStep[];
  badge?: {
    name: string;
    icon: string;
    level: "bronze" | "silver" | "gold" | "platinum";
  };
  aiFeatures?: {
    personalizedPath: boolean;
    adaptiveLearning: boolean;
    intelligentAssessment: boolean;
    contextualHelp: boolean;
  };
  videoLibrary?: {
    introVideo: string;
    stepVideos: Record<string, string>;
    summaryVideo: string;
  };
  competencyFramework?: {
    targetRole: string;
    skillsAssessed: string[];
    certificationLevel: string;
    validityPeriod: number;
  };
  accessibility?: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    voiceNavigation: boolean;
  };
}

const GuidedTutorial: React.FC<{
  tutorialId: string;
  onComplete?: () => void;
  onClose?: () => void;
  userId?: string;
  userRole?: string;
}> = ({ tutorialId, onComplete, onClose, userId, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkpointAnswer, setCheckpointAnswer] = useState<number | null>(null);
  const [showCheckpointResult, setShowCheckpointResult] = useState(false);
  const [practiceData, setPracticeData] = useState<Record<string, string>>({});
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [learningAnalytics, setLearningAnalytics] = useState({
    timeSpent: 0,
    interactionCount: 0,
    helpRequests: 0,
    completionRate: 0,
  });
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<
    string[]
  >([]);
  const [competencyProgress, setCompetencyProgress] = useState<
    Record<string, number>
  >({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startTimeRef = useRef<Date>(new Date());

  // Mock tutorial data
  useEffect(() => {
    const mockTutorials: Record<string, Tutorial> = {
      "patient-registration": {
        id: "patient-registration",
        title: "Patient Registration Tutorial",
        description: "Learn to register a new patient in 5 easy steps",
        estimatedTime: 15,
        badge: {
          name: "Patient Registration Expert",
          icon: "🏆",
        },
        steps: [
          {
            id: "welcome",
            title: "Welcome to Patient Registration!",
            description:
              "This AI-powered tutorial will guide you through registering a new patient in 5 easy steps.",
            videoUrl: "/videos/tutorials/patient-registration-intro.mp4",
            aiAssistance: {
              enabled: true,
              suggestions: [
                "Start with the video introduction for visual learners",
                "Use voice narration if you prefer audio learning",
                "Take notes using the built-in notepad feature",
              ],
              contextualHelp:
                "This tutorial adapts to your learning style and provides personalized guidance based on your role and experience.",
            },
            voiceNarration: {
              enabled: true,
              audioUrl: "/audio/tutorials/patient-registration-welcome.mp3",
              transcript:
                "Welcome to the Patient Registration tutorial. This comprehensive guide will teach you everything you need to know about registering patients efficiently and accurately.",
            },
            competencyMapping: {
              skills: [
                "Patient Data Management",
                "System Navigation",
                "Data Validation",
              ],
              level: "beginner",
            },
            content: (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to AI-Powered Patient Registration!
                </h2>
                <p className="text-gray-600 mb-6">
                  This intelligent tutorial adapts to your learning style and
                  provides personalized guidance. You'll master Emirates ID
                  integration, insurance verification, and quality assurance
                  processes.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI-Powered
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    15 minutes
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Beginner
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Video Enabled
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      AI Learning Assistant
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Your personal AI assistant will provide contextual help,
                    suggest best practices, and adapt the tutorial based on your
                    progress and learning preferences.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "emirates-id",
            title: "Emirates ID Entry",
            description:
              "Enter the patient's Emirates ID to auto-populate basic information",
            content: (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Focus Area: Emirates ID Field
                    </span>
                  </div>
                  <p className="text-blue-700">
                    Enter the patient's Emirates ID here. The system will
                    automatically populate basic information from the government
                    database.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emirates-id">Emirates ID *</Label>
                  <Input
                    id="emirates-id"
                    placeholder="784-1234-5678901-2"
                    className="border-2 border-blue-300 focus:border-blue-500"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Pro Tip</span>
                  </div>
                  <p className="text-yellow-700">
                    Click the sample ID above to auto-fill: 784-1234-5678901-2
                  </p>
                </div>
              </div>
            ),
            practiceActivity: {
              instruction: "Try entering a sample Emirates ID",
              fields: [
                {
                  name: "emirates_id",
                  type: "text",
                  label: "Emirates ID",
                  required: true,
                },
              ],
            },
          },
          {
            id: "information-verification",
            title: "Information Verification",
            description: "Review and verify the auto-populated information",
            content: (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Auto-populated Information
                    </span>
                  </div>
                  <p className="text-green-700">
                    Review and verify the information below. Correct any
                    discrepancies before proceeding.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name (English)</Label>
                    <Input
                      value="Ahmed Al Mansouri"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Full Name (Arabic)</Label>
                    <Input
                      value="أحمد المنصوري"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input value="1980-05-15" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Input value="UAE" readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            ),
            checkpoint: {
              question:
                "What should you do if you notice incorrect information in the auto-populated fields?",
              options: [
                "Proceed anyway, it will be corrected later",
                "Correct the information before proceeding",
                "Contact IT support immediately",
                "Skip the patient registration",
              ],
              correct: 1,
              explanation:
                "Always correct any discrepancies in patient information before proceeding to ensure accurate records.",
            },
          },
          {
            id: "insurance-details",
            title: "Insurance Details",
            description:
              "Add insurance information for authorization and billing",
            content: (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      Insurance Section
                    </span>
                  </div>
                  <p className="text-purple-700">
                    Add insurance information for authorization and billing
                    purposes. This is crucial for claim processing.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Insurance Provider *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daman">Daman</SelectItem>
                        <SelectItem value="adnic">ADNIC</SelectItem>
                        <SelectItem value="oman-insurance">
                          Oman Insurance
                        </SelectItem>
                        <SelectItem value="abu-dhabi-national">
                          Abu Dhabi National
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Policy Number *</Label>
                    <Input placeholder="POL-123456" />
                  </div>
                  <div>
                    <Label>Coverage Type *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">
                          Comprehensive
                        </SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" />
                  </div>
                </div>
              </div>
            ),
            practiceActivity: {
              instruction:
                "Complete the insurance information with the provided sample data",
              fields: [
                {
                  name: "provider",
                  type: "select",
                  label: "Insurance Provider",
                  options: ["Daman", "ADNIC", "Oman Insurance"],
                  required: true,
                },
                {
                  name: "policy_number",
                  type: "text",
                  label: "Policy Number",
                  required: true,
                },
                {
                  name: "coverage_type",
                  type: "select",
                  label: "Coverage Type",
                  options: ["Comprehensive", "Basic", "Premium"],
                  required: true,
                },
              ],
            },
          },
          {
            id: "completion",
            title: "Congratulations!",
            description:
              "You have successfully completed the patient registration tutorial",
            content: (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  You've successfully completed the Patient Registration
                  tutorial. You now know how to register patients efficiently
                  using the Reyada platform.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    <span className="font-bold text-yellow-800">
                      Badge Earned!
                    </span>
                  </div>
                  <p className="text-yellow-700 font-medium">
                    Patient Registration Expert
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">What you learned:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Emirates ID integration and verification</li>
                    <li>✓ Information validation and correction</li>
                    <li>✓ Insurance details management</li>
                    <li>✓ Quality checks and best practices</li>
                  </ul>
                </div>
              </div>
            ),
          },
        ],
      },
    };

    setTutorial(mockTutorials[tutorialId] || null);
  }, [tutorialId]);

  if (!tutorial) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Tutorial not found</p>
      </div>
    );
  }

  const currentStepData = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCheckpointAnswer(null);
      setShowCheckpointResult(false);
      setPracticeData({});
    } else {
      // Tutorial completed
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCheckpointAnswer(null);
      setShowCheckpointResult(false);
    }
  };

  const handleCheckpointAnswer = (answerIndex: number) => {
    setCheckpointAnswer(answerIndex);
    setShowCheckpointResult(true);
  };

  const handlePracticeFieldChange = (fieldName: string, value: string) => {
    setPracticeData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const isPracticeComplete = () => {
    if (!currentStepData.practiceActivity) return true;
    return currentStepData.practiceActivity.fields.every(
      (field) => !field.required || practiceData[field.name],
    );
  };

  const canProceed = () => {
    if (currentStepData.checkpoint) {
      return (
        showCheckpointResult &&
        checkpointAnswer === currentStepData.checkpoint.correct
      );
    }
    if (currentStepData.practiceActivity) {
      return isPracticeComplete();
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{tutorial.title}</h1>
              <p className="text-blue-100">{tutorial.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Step {currentStep + 1} of {tutorial.steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-white/20" />
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          {/* Step Content */}
          <div className="mb-6">{currentStepData.content}</div>

          {/* Practice Activity */}
          {currentStepData.practiceActivity && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Practice Activity
                </CardTitle>
                <CardDescription>
                  {currentStepData.practiceActivity.instruction}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStepData.practiceActivity.fields.map((field) => (
                  <div key={field.name}>
                    <Label>
                      {field.label} {field.required && "*"}
                    </Label>
                    {field.type === "text" ? (
                      <Input
                        value={practiceData[field.name] || ""}
                        onChange={(e) =>
                          handlePracticeFieldChange(field.name, e.target.value)
                        }
                        placeholder={field.label}
                      />
                    ) : (
                      <Select
                        value={practiceData[field.name] || ""}
                        onValueChange={(value) =>
                          handlePracticeFieldChange(field.name, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem
                              key={option}
                              value={option.toLowerCase()}
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Checkpoint */}
          {currentStepData.checkpoint && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Knowledge Check
                </CardTitle>
                <CardDescription>
                  {currentStepData.checkpoint.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentStepData.checkpoint.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={checkpointAnswer === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleCheckpointAnswer(index)}
                    disabled={showCheckpointResult}
                  >
                    <span className="mr-2">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </Button>
                ))}
                {showCheckpointResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      checkpointAnswer === currentStepData.checkpoint.correct
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle
                        className={`h-5 w-5 ${
                          checkpointAnswer ===
                          currentStepData.checkpoint.correct
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          checkpointAnswer ===
                          currentStepData.checkpoint.correct
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {checkpointAnswer === currentStepData.checkpoint.correct
                          ? "Correct!"
                          : "Incorrect"}
                      </span>
                    </div>
                    <p
                      className={
                        checkpointAnswer === currentStepData.checkpoint.correct
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      {currentStepData.checkpoint.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </div>

          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentStep === tutorial.steps.length - 1 ? "Complete" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTutorial;
