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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface AIAssistantProps {
  userId: string;
  currentModule: string;
  learningContext: {
    role: string;
    experience: string;
    completedModules: string[];
    currentProgress: number;
    strugglingAreas: string[];
  };
  onSuggestion: (suggestion: string) => void;
  onHelpRequest: (query: string) => void;
}

interface AIResponse {
  type: "suggestion" | "explanation" | "encouragement" | "correction";
  content: string;
  confidence: number;
  resources?: {
    title: string;
    url: string;
    type: "video" | "document" | "tutorial";
  }[];
}

const AITrainingAssistant: React.FC<AIAssistantProps> = ({
  userId,
  currentModule,
  learningContext,
  onSuggestion,
  onHelpRequest,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>
  >([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [personalizedInsights, setPersonalizedInsights] = useState<
    AIResponse[]
  >([]);
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState<string[]>([]);

  // Initialize AI assistant with personalized welcome
  useEffect(() => {
    const initializeAssistant = () => {
      const welcomeMessage = generatePersonalizedWelcome();
      setChatHistory([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
      generateAdaptiveSuggestions();
    };

    initializeAssistant();
  }, [currentModule, learningContext]);

  const generatePersonalizedWelcome = (): string => {
    const { role, experience, completedModules } = learningContext;

    if (completedModules.length === 0) {
      return `Hello! I'm your AI Training Assistant. As a ${role}, I'll help you master the Reyada platform with personalized guidance. Let's start your learning journey!`;
    } else {
      return `Welcome back! I see you've completed ${completedModules.length} modules. Based on your progress as a ${role}, I have some targeted suggestions for ${currentModule}.`;
    }
  };

  const generateAdaptiveSuggestions = () => {
    const suggestions = [];
    const { role, strugglingAreas, currentProgress } = learningContext;

    // Role-based suggestions
    if (role === "physician") {
      suggestions.push(
        "Focus on clinical documentation workflows",
        "Practice digital signature processes",
        "Review DOH compliance requirements",
      );
    } else if (role === "nurse") {
      suggestions.push(
        "Master mobile app offline features",
        "Practice vital signs documentation",
        "Learn medication administration protocols",
      );
    }

    // Progress-based suggestions
    if (currentProgress < 30) {
      suggestions.push("Take your time with foundational concepts");
    } else if (currentProgress > 70) {
      suggestions.push("You're doing great! Focus on advanced features");
    }

    // Struggling areas support
    if (strugglingAreas.includes("documentation")) {
      suggestions.push("Let's practice documentation with guided examples");
    }

    setAdaptiveSuggestions(suggestions.slice(0, 3));
  };

  const processAIQuery = async (query: string): Promise<AIResponse> => {
    // Simulate AI processing with contextual responses
    setIsProcessing(true);

    // Mock AI response generation based on context
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, AIResponse> = {
      "help with documentation": {
        type: "explanation",
        content:
          "For clinical documentation, always start with patient identification, then follow the SOAP format (Subjective, Objective, Assessment, Plan). Use voice-to-text for efficiency, but always review for accuracy.",
        confidence: 95,
        resources: [
          {
            title: "Clinical Documentation Best Practices",
            url: "/videos/clinical-documentation.mp4",
            type: "video",
          },
          {
            title: "SOAP Format Guide",
            url: "/docs/soap-format-guide.pdf",
            type: "document",
          },
        ],
      },
      "patient registration": {
        type: "suggestion",
        content:
          "Start with Emirates ID verification - this auto-populates most fields. Always verify insurance information and check for any existing episodes before creating new ones.",
        confidence: 92,
        resources: [
          {
            title: "Patient Registration Tutorial",
            url: "/tutorials/patient-registration",
            type: "tutorial",
          },
        ],
      },
      "mobile app": {
        type: "explanation",
        content:
          "The mobile app works offline for most functions. Sync regularly when you have connectivity. Use the camera feature for wound documentation with proper lighting and scale references.",
        confidence: 88,
      },
    };

    // Find best matching response
    const matchingKey = Object.keys(responses).find((key) =>
      query.toLowerCase().includes(key),
    );

    const response = matchingKey
      ? responses[matchingKey]
      : {
          type: "suggestion" as const,
          content:
            "I understand you need help. Could you be more specific about what you'd like to learn? I can assist with patient registration, clinical documentation, mobile app usage, or compliance requirements.",
          confidence: 70,
        };

    setIsProcessing(false);
    return response;
  };

  const handleSendQuery = async () => {
    if (!currentQuery.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: currentQuery,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    onHelpRequest(currentQuery);

    const aiResponse = await processAIQuery(currentQuery);

    const assistantMessage = {
      role: "assistant" as const,
      content: aiResponse.content,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, assistantMessage]);
    setCurrentQuery("");
  };

  const startVoiceInput = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuery(transcript);
      };

      recognition.start();
    }
  };

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isActive) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsActive(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle className="text-lg">AI Training Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="text-white hover:bg-white/20"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsActive(false)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription className="text-blue-100">
            Personalized guidance for {learningContext.role}s
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 max-h-96 overflow-y-auto">
          {/* Adaptive Suggestions */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              Smart Suggestions
            </h4>
            <div className="space-y-1">
              {adaptiveSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start text-xs h-auto py-2"
                  onClick={() => onSuggestion(suggestion)}
                >
                  <Lightbulb className="h-3 w-3 mr-1 text-yellow-500" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="space-y-3 mb-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                  {message.role === "assistant" && voiceEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 p-1"
                      onClick={() => speakResponse(message.content)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Ask me anything about the training..."
                onKeyPress={(e) => e.key === "Enter" && handleSendQuery()}
                className="text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startVoiceInput}
              disabled={isListening}
              className={isListening ? "bg-red-100" : ""}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSendQuery}
              disabled={!currentQuery.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITrainingAssistant;
