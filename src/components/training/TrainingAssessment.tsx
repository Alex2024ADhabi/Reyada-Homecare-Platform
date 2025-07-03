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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  Target,
  BookOpen,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

interface Question {
  id: string;
  type:
    | "multiple_choice"
    | "true_false"
    | "short_answer"
    | "drag_drop"
    | "scenario";
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  points: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  scenario?: {
    background: string;
    situation: string;
  };
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: Question[];
  certification?: {
    name: string;
    level: "basic" | "proficient" | "expert";
    validityPeriod: number; // in months
  };
}

interface AssessmentResult {
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  categoryScores: Record<string, { correct: number; total: number }>;
}

const TrainingAssessment: React.FC<{
  assessmentId: string;
  onComplete?: (result: AssessmentResult) => void;
  onClose?: () => void;
}> = ({ assessmentId, onComplete, onClose }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Mock assessment data
  useEffect(() => {
    const mockAssessments: Record<string, Assessment> = {
      "doh-compliance": {
        id: "doh-compliance",
        title: "DOH Compliance Assessment",
        description:
          "Test your knowledge of DOH Nine Domains and compliance requirements",
        category: "Compliance",
        timeLimit: 30,
        passingScore: 80,
        certification: {
          name: "DOH Compliance Expert",
          level: "expert",
          validityPeriod: 12,
        },
        questions: [
          {
            id: "q1",
            type: "multiple_choice",
            question:
              "Which of the following is NOT one of the DOH Nine Domains for homecare quality?",
            options: [
              "Patient Safety",
              "Clinical Effectiveness",
              "Financial Performance",
              "Patient Experience",
            ],
            correctAnswer: 2,
            explanation:
              "The DOH Nine Domains focus on quality of care, not financial metrics. Financial Performance is not one of the nine domains.",
            points: 10,
            category: "DOH Domains",
            difficulty: "easy",
          },
          {
            id: "q2",
            type: "multiple_choice",
            question: "What is the minimum frequency for JAWDA KPI reporting?",
            options: ["Weekly", "Monthly", "Quarterly", "Annually"],
            correctAnswer: 1,
            explanation:
              "JAWDA KPI reports must be submitted monthly to the DOH portal to maintain compliance.",
            points: 10,
            category: "JAWDA KPIs",
            difficulty: "medium",
          },
          {
            id: "q3",
            type: "scenario",
            question:
              "A patient reports dissatisfaction with communication from the care team. Which domain does this impact and what immediate actions should be taken?",
            scenario: {
              background:
                "Mrs. Sarah Ahmed, a 72-year-old patient receiving post-surgical care, calls to complain that nurses are not explaining procedures clearly and she feels confused about her medication schedule.",
              situation:
                "The patient is frustrated and considering switching to another provider. Her family is also concerned about the quality of care.",
            },
            correctAnswer:
              "This impacts the Patient Experience Domain. Immediate actions: 1) Document the complaint, 2) Assign a care coordinator for better communication, 3) Provide clear medication schedule in Arabic/English, 4) Schedule family meeting, 5) Follow up within 24 hours.",
            explanation:
              "Patient communication issues directly impact the Patient Experience Domain. Immediate response and clear action plan are essential for patient retention and compliance.",
            points: 20,
            category: "Patient Experience",
            difficulty: "hard",
          },
          {
            id: "q4",
            type: "true_false",
            question:
              "Digital signatures are legally binding for all clinical documentation in the UAE.",
            correctAnswer: 0, // true
            explanation:
              "Yes, digital signatures are legally recognized in the UAE under the Electronic Transactions Law and are required for clinical documentation.",
            points: 10,
            category: "Documentation",
            difficulty: "medium",
          },
          {
            id: "q5",
            type: "multiple_choice",
            question:
              "Which medication administration principle is most critical for patient safety?",
            options: [
              "Right patient identification",
              "Proper documentation timing",
              "Cost-effective prescribing",
              "Family involvement",
            ],
            correctAnswer: 0,
            explanation:
              "Right patient identification is the most critical safety principle to prevent medication errors and ensure patient safety.",
            points: 15,
            category: "Patient Safety",
            difficulty: "medium",
          },
        ],
      },
    };

    const selectedAssessment = mockAssessments[assessmentId];
    if (selectedAssessment) {
      setAssessment(selectedAssessment);
      setTimeRemaining(selectedAssessment.timeLimit * 60); // Convert to seconds
    }
  }, [assessmentId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isCompleted, timeRemaining]);

  const startAssessment = () => {
    setIsStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateResult = (): AssessmentResult => {
    if (!assessment) {
      return {
        score: 0,
        percentage: 0,
        passed: false,
        timeSpent: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        categoryScores: {},
      };
    }

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    const categoryScores: Record<string, { correct: number; total: number }> =
      {};

    assessment.questions.forEach((question) => {
      maxScore += question.points;
      const userAnswer = answers[question.id];

      // Initialize category if not exists
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;

      // Check if answer is correct
      let isCorrect = false;
      if (question.type === "scenario" || question.type === "short_answer") {
        // For text answers, we'll consider any non-empty answer as attempted
        // In real implementation, this would need manual grading or AI evaluation
        isCorrect = userAnswer && String(userAnswer).trim().length > 10;
      } else {
        isCorrect = userAnswer === question.correctAnswer;
      }

      if (isCorrect) {
        totalScore += question.points;
        correctCount++;
        categoryScores[question.category].correct++;
      }
    });

    const percentage = (totalScore / maxScore) * 100;
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
      : 0;

    return {
      score: totalScore,
      percentage: Math.round(percentage),
      passed: percentage >= assessment.passingScore,
      timeSpent,
      correctAnswers: correctCount,
      totalQuestions: assessment.questions.length,
      categoryScores,
    };
  };

  const handleSubmit = () => {
    const assessmentResult = calculateResult();
    setResult(assessmentResult);
    setIsCompleted(true);
    onComplete?.(assessmentResult);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 300) return "text-green-600"; // > 5 minutes
    if (timeRemaining > 60) return "text-yellow-600"; // > 1 minute
    return "text-red-600"; // < 1 minute
  };

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Assessment not found</p>
      </div>
    );
  }

  // Pre-start screen
  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
            <CardDescription className="text-lg">
              {assessment.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Time Limit</p>
                <p className="text-sm text-gray-600">
                  {assessment.timeLimit} minutes
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Passing Score</p>
                <p className="text-sm text-gray-600">
                  {assessment.passingScore}%
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">Questions</p>
                <p className="text-sm text-gray-600">
                  {assessment.questions.length} questions
                </p>
              </div>
            </div>

            {assessment.certification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">
                    Certification Available
                  </span>
                </div>
                <p className="text-yellow-700">
                  Pass this assessment to earn the{" "}
                  <strong>{assessment.certification.name}</strong>{" "}
                  certification, valid for{" "}
                  {assessment.certification.validityPeriod} months.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Instructions
                </span>
              </div>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Read each question carefully before answering</li>
                <li>
                  • You can navigate between questions using the Next/Previous
                  buttons
                </li>
                <li>• Your progress is automatically saved</li>
                <li>• Submit your assessment before time runs out</li>
                <li>• You can review explanations after completion</li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={startAssessment} className="px-8">
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (isCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`text-6xl mb-4`}>{result.passed ? "🎉" : "📚"}</div>
            <CardTitle
              className={`text-2xl ${result.passed ? "text-green-600" : "text-orange-600"}`}
            >
              {result.passed ? "Congratulations!" : "Keep Learning!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {result.passed
                ? "You have successfully passed the assessment"
                : "You can retake the assessment after reviewing the material"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {result.percentage}%
                </p>
                <p className="text-sm text-gray-600">Final Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {result.timeSpent}m
                </p>
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p
                  className={`text-2xl font-bold ${result.passed ? "text-green-600" : "text-red-600"}`}
                >
                  {result.passed ? "PASS" : "FAIL"}
                </p>
                <p className="text-sm text-gray-600">Result</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.categoryScores).map(
                    ([category, scores]) => {
                      const percentage = (scores.correct / scores.total) * 100;
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span>
                              {scores.correct}/{scores.total} (
                              {Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certification */}
            {result.passed && assessment.certification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                  Certification Earned!
                </h3>
                <p className="text-yellow-700 mb-4">
                  You have earned the{" "}
                  <strong>{assessment.certification.name}</strong>{" "}
                  certification.
                </p>
                <Badge className="bg-yellow-600 text-white px-4 py-2">
                  Valid for {assessment.certification.validityPeriod} months
                </Badge>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!result.passed && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStarted(false);
                    setIsCompleted(false);
                    setCurrentQuestion(0);
                    setAnswers({});
                    setResult(null);
                    setTimeRemaining(assessment.timeLimit * 60);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              )}
              <Button onClick={onClose}>Continue Learning</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment in progress
  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{assessment.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {assessment.questions.length}
            </p>
          </div>
          <div className={`text-right ${getTimeColor()}`}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-xs">Time Remaining</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge
              className={`${
                question.difficulty === "easy"
                  ? "bg-green-100 text-green-800"
                  : question.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {question.difficulty} • {question.points} points
            </Badge>
            <Badge variant="outline">{question.category}</Badge>
          </div>
          {question.scenario && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-800 mb-2">Scenario</h4>
              <p className="text-blue-700 text-sm mb-2">
                <strong>Background:</strong> {question.scenario.background}
              </p>
              <p className="text-blue-700 text-sm">
                <strong>Situation:</strong> {question.scenario.situation}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">{question.question}</h2>

            {question.type === "multiple_choice" && question.options && (
              <RadioGroup
                value={String(answers[question.id] || "")}
                onValueChange={(value) =>
                  handleAnswerChange(question.id, parseInt(value))
                }
              >
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <RadioGroupItem
                      value={String(index)}
                      id={`option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="mr-2 font-medium">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === "true_false" && (
              <RadioGroup
                value={String(answers[question.id] || "")}
                onValueChange={(value) =>
                  handleAnswerChange(question.id, parseInt(value))
                }
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="0" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="1" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {(question.type === "short_answer" ||
              question.type === "scenario") && (
              <Textarea
                value={String(answers[question.id] || "")}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                placeholder="Enter your answer here..."
                className="min-h-32"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {assessment.questions.map((_, index) => (
            <Button
              key={index}
              variant={
                index === currentQuestion
                  ? "default"
                  : answers[assessment.questions[index].id]
                    ? "secondary"
                    : "outline"
              }
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestion === assessment.questions.length - 1 ? (
          <Button onClick={handleSubmit}>Submit Assessment</Button>
        ) : (
          <Button
            onClick={() =>
              setCurrentQuestion(
                Math.min(assessment.questions.length - 1, currentQuestion + 1),
              )
            }
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default TrainingAssessment;
