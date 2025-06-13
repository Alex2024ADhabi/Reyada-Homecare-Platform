import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Send,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { SatisfactionSurvey } from "@/types/patient-portal";
import { useSatisfactionSurveys } from "@/hooks/useSatisfactionSurveys";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";

interface SatisfactionSurveyProps {
  survey: SatisfactionSurvey;
  onComplete?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const SatisfactionSurveyComponent: React.FC<SatisfactionSurveyProps> = ({
  survey,
  onComplete,
  onDismiss,
  className = "",
}) => {
  const { toast } = useToast();
  const { submitSurvey, dismissSurvey, isLoading } = useSatisfactionSurveys(
    survey.patientId,
  );
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullSurvey, setShowFullSurvey] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required questions
      const requiredQuestions = survey.questions.filter((q) => q.required);
      const missingResponses = requiredQuestions.filter(
        (q) => !responses[q.id] || responses[q.id] === "",
      );

      if (missingResponses.length > 0) {
        toast({
          title: "Incomplete Survey",
          description:
            "Please answer all required questions before submitting.",
          variant: "destructive",
        });
        return;
      }

      // Analyze sentiment of text responses before submission
      const textResponses = Object.values(responses)
        .filter(
          (response) => typeof response === "string" && response.length > 10,
        )
        .join(" ");

      if (textResponses) {
        try {
          const sentiment =
            await naturalLanguageProcessingService.analyzeSentimentForSatisfaction(
              textResponses,
            );
          setSentimentAnalysis(sentiment);

          // Include sentiment analysis in submission
          await submitSurvey(survey.id, {
            ...responses,
            _sentimentAnalysis: {
              overallSentiment: sentiment.overallSentiment,
              satisfactionScore: sentiment.satisfactionScore,
              urgencyLevel: sentiment.urgencyLevel,
              keyPhrases: sentiment.keyPhrases,
            },
          });
        } catch (error) {
          console.error("Sentiment analysis failed:", error);
          await submitSurvey(survey.id, responses);
        }
      } else {
        await submitSurvey(survey.id, responses);
      }

      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback!",
      });
      setShowFullSurvey(false);
      onComplete?.();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissSurvey(survey.id);
      onDismiss?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss survey.",
        variant: "destructive",
      });
    }
  };

  const renderQuestion = (question: any) => {
    const value = responses[question.id];

    switch (question.type) {
      case "rating":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-1">
              {Array.from({ length: question.scale.max }, (_, i) => {
                const rating = i + 1;
                return (
                  <button
                    key={rating}
                    onClick={() => handleResponseChange(question.id, rating)}
                    className={`p-1 rounded transition-colors ${
                      value === rating
                        ? "text-yellow-500"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value === rating ? "fill-current" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {question.scale.labels && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>{question.scale.labels[0]}</span>
                <span>
                  {question.scale.labels[question.scale.labels.length - 1]}
                </span>
              </div>
            )}
          </div>
        );

      case "multiple-choice":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={(newValue) =>
              handleResponseChange(question.id, newValue)
            }
          >
            {question.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "yes-no":
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleResponseChange(question.id, true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                value === true
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-gray-300 hover:border-green-400"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => handleResponseChange(question.id, false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                value === false
                  ? "bg-red-50 border-red-500 text-red-700"
                  : "border-gray-300 hover:border-red-400"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>No</span>
            </button>
          </div>
        );

      case "text":
        return (
          <Textarea
            value={value || ""}
            onChange={async (e) => {
              const text = e.target.value;
              handleResponseChange(question.id, text);

              // Perform real-time sentiment analysis for longer responses
              if (text.length > 20) {
                try {
                  const sentiment =
                    await naturalLanguageProcessingService.analyzeSentimentForSatisfaction(
                      text,
                    );
                  // Could show real-time sentiment feedback to user
                } catch (error) {
                  console.error("Real-time sentiment analysis failed:", error);
                }
              }
            }}
            placeholder="Enter your response..."
            rows={3}
            maxLength={question.maxLength}
          />
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      handleResponseChange(question.id, [
                        ...currentValues,
                        option,
                      ]);
                    } else {
                      handleResponseChange(
                        question.id,
                        currentValues.filter((v: string) => v !== option),
                      );
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your response..."
          />
        );
    }
  };

  const getSurveyTypeColor = (type: string) => {
    switch (type) {
      case "post-appointment":
        return "bg-blue-100 text-blue-800";
      case "care-plan-feedback":
        return "bg-green-100 text-green-800";
      case "general-satisfaction":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (survey.status === "completed") {
    return (
      <Card className={`border-green-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">{survey.title}</h4>
                <p className="text-sm text-gray-600">
                  Completed on{" "}
                  {format(new Date(survey.completedAt!), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Compact Survey Card */}
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">{survey.title}</h4>
                  <Badge className={getSurveyTypeColor(survey.type)}>
                    {survey.type.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {survey.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Expires {format(new Date(survey.expiresAt), "MMM dd")}
                    </span>
                  </div>
                  <span>{survey.questions.length} questions</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showFullSurvey} onOpenChange={setShowFullSurvey}>
                <DialogTrigger asChild>
                  <Button size="sm">Complete Survey</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <span>{survey.title}</span>
                      <Badge className={getSurveyTypeColor(survey.type)}>
                        {survey.type.replace("-", " ")}
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <p className="text-gray-600">{survey.description}</p>

                    {survey.questions.map((question, index) => (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-sm font-medium text-gray-500 mt-1">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-900">
                              {question.question}
                              {question.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            <div className="mt-2">
                              {renderQuestion(question)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowFullSurvey(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Survey
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SatisfactionSurveyComponent;
