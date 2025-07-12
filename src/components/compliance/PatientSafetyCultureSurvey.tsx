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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Send,
  BarChart3,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  type: "likert" | "multiple_choice" | "text";
  options?: string[];
  required: boolean;
}

interface SurveyResponse {
  questionId: string;
  response: string | number;
  comment?: string;
}

interface SurveySubmission {
  id: string;
  respondentId: string;
  department: string;
  role: string;
  responses: SurveyResponse[];
  submittedAt: string;
  completionTime: number; // in minutes
}

interface SurveyAnalytics {
  totalResponses: number;
  responseRate: number;
  averageScore: number;
  categoryScores: {
    category: string;
    score: number;
    responses: number;
  }[];
  departmentBreakdown: {
    department: string;
    responses: number;
    averageScore: number;
  }[];
  trendData: {
    period: string;
    score: number;
  }[];
}

interface PatientSafetyCultureSurveyProps {
  facilityId?: string;
  surveyPeriod?: string;
  isAdmin?: boolean;
}

export default function PatientSafetyCultureSurvey({
  facilityId = "facility-001",
  surveyPeriod = "2025-Q1",
  isAdmin = false,
}: PatientSafetyCultureSurveyProps) {
  const [surveyQuestions] = useState<SurveyQuestion[]>([
    {
      id: "safety_climate_1",
      category: "Safety Climate",
      question: "Patient safety is never sacrificed to get more work done",
      type: "likert",
      required: true,
    },
    {
      id: "safety_climate_2",
      category: "Safety Climate",
      question:
        "Our procedures and systems are good at preventing errors from happening",
      type: "likert",
      required: true,
    },
    {
      id: "teamwork_1",
      category: "Teamwork Within Units",
      question:
        "When a lot of work needs to be done quickly, we work together as a team to get the work done",
      type: "likert",
      required: true,
    },
    {
      id: "teamwork_2",
      category: "Teamwork Within Units",
      question: "In this unit, people treat each other with respect",
      type: "likert",
      required: true,
    },
    {
      id: "communication_1",
      category: "Communication Openness",
      question:
        "Staff will freely speak up if they see something that may negatively affect patient care",
      type: "likert",
      required: true,
    },
    {
      id: "communication_2",
      category: "Communication Openness",
      question:
        "Staff feel free to question the decisions or actions of those with more authority",
      type: "likert",
      required: true,
    },
    {
      id: "feedback_1",
      category: "Feedback & Communication About Error",
      question:
        "We are given feedback about changes put into place based on event reports",
      type: "likert",
      required: true,
    },
    {
      id: "feedback_2",
      category: "Feedback & Communication About Error",
      question: "We are informed about errors that happen in this unit",
      type: "likert",
      required: true,
    },
    {
      id: "nonpunitive_1",
      category: "Non-punitive Response to Error",
      question: "Staff feel like their mistakes are held against them",
      type: "likert",
      required: true,
    },
    {
      id: "nonpunitive_2",
      category: "Non-punitive Response to Error",
      question:
        "When an event is reported, it feels like the person is being written up, not the problem",
      type: "likert",
      required: true,
    },
    {
      id: "staffing_1",
      category: "Staffing",
      question: "We have enough staff to handle the workload",
      type: "likert",
      required: true,
    },
    {
      id: "staffing_2",
      category: "Staffing",
      question:
        "Staff in this unit work longer hours than is best for patient care",
      type: "likert",
      required: true,
    },
    {
      id: "management_1",
      category: "Management Support for Patient Safety",
      question:
        "Hospital management provides a work climate that promotes patient safety",
      type: "likert",
      required: true,
    },
    {
      id: "management_2",
      category: "Management Support for Patient Safety",
      question:
        "The actions of hospital management show that patient safety is a top priority",
      type: "likert",
      required: true,
    },
    {
      id: "overall_rating",
      category: "Overall Perceptions",
      question:
        "Please give your work area/unit an overall grade on patient safety",
      type: "multiple_choice",
      options: ["Excellent", "Very Good", "Acceptable", "Poor", "Failing"],
      required: true,
    },
    {
      id: "improvement_suggestions",
      category: "Improvement Suggestions",
      question:
        "What specific suggestions do you have for improving patient safety in your work area?",
      type: "text",
      required: false,
    },
  ]);

  const [currentResponses, setCurrentResponses] = useState<SurveyResponse[]>(
    [],
  );
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [surveyMode, setSurveyMode] = useState<"take" | "view">(
    isAdmin ? "view" : "take",
  );
  const [respondentInfo, setRespondentInfo] = useState({
    department: "",
    role: "",
    yearsOfExperience: "",
    workShift: "",
    employmentType: "",
  });
  const [surveyProgress, setSurveyProgress] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [startTime] = useState(Date.now());

  const likertOptions = [
    { value: 5, label: "Strongly Agree" },
    { value: 4, label: "Agree" },
    { value: 3, label: "Neither" },
    { value: 2, label: "Disagree" },
    { value: 1, label: "Strongly Disagree" },
  ];

  const generateMockAnalytics = (): SurveyAnalytics => {
    return {
      totalResponses: 156,
      responseRate: 78.4,
      averageScore: 3.8,
      categoryScores: [
        { category: "Safety Climate", score: 4.1, responses: 156 },
        { category: "Teamwork Within Units", score: 4.3, responses: 156 },
        { category: "Communication Openness", score: 3.6, responses: 156 },
        {
          category: "Feedback & Communication About Error",
          score: 3.4,
          responses: 156,
        },
        {
          category: "Non-punitive Response to Error",
          score: 3.2,
          responses: 156,
        },
        { category: "Staffing", score: 3.1, responses: 156 },
        {
          category: "Management Support for Patient Safety",
          score: 4.0,
          responses: 156,
        },
      ],
      departmentBreakdown: [
        { department: "Emergency", responses: 24, averageScore: 3.9 },
        { department: "ICU", responses: 18, averageScore: 4.2 },
        { department: "Medical/Surgical", responses: 32, averageScore: 3.7 },
        { department: "Pediatrics", responses: 16, averageScore: 4.1 },
        { department: "Pharmacy", responses: 12, averageScore: 3.8 },
        { department: "Laboratory", responses: 14, averageScore: 3.6 },
        { department: "Radiology", responses: 10, averageScore: 3.9 },
        { department: "Administration", responses: 8, averageScore: 3.5 },
        { department: "Other", responses: 22, averageScore: 3.8 },
      ],
      trendData: [
        { period: "2023-Q4", score: 3.5 },
        { period: "2024-Q1", score: 3.6 },
        { period: "2024-Q2", score: 3.7 },
        { period: "2024-Q3", score: 3.8 },
        { period: "2024-Q4", score: 3.8 },
        { period: "2025-Q1", score: 3.8 },
      ],
    };
  };

  useEffect(() => {
    if (isAdmin) {
      setAnalytics(generateMockAnalytics());
    }
  }, [isAdmin]);

  const handleResponseChange = (
    questionId: string,
    response: string | number,
  ) => {
    setCurrentResponses((prev) => {
      const existing = prev.find((r) => r.questionId === questionId);
      const newResponses = existing
        ? prev.map((r) =>
            r.questionId === questionId ? { ...r, response } : r,
          )
        : [...prev, { questionId, response }];
      
      // Update progress
      const requiredQuestions = surveyQuestions.filter(q => q.required);
      const answeredRequired = requiredQuestions.filter(q =>
        newResponses.some(r => r.questionId === q.id)
      );
      setSurveyProgress((answeredRequired.length / requiredQuestions.length) * 100);
      
      return newResponses;
    });
  };
  
  // Helper functions for enhanced analytics
  const calculateResponseConsistency = (responses: SurveyResponse[]): number => {
    // Simple consistency check - in real implementation would be more sophisticated
    const likertResponses = responses.filter(r => typeof r.response === 'number');
    if (likertResponses.length < 2) return 100;
    
    const values = likertResponses.map(r => r.response as number);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.max(0, 100 - (variance * 20)); // Convert to percentage
  };
  
  const calculateEngagementLevel = (responses: SurveyResponse[]): number => {
    const textResponses = responses.filter(r => typeof r.response === 'string' && r.response.length > 10);
    const totalTextQuestions = surveyQuestions.filter(q => q.type === 'text').length;
    
    if (totalTextQuestions === 0) return 100;
    return (textResponses.length / totalTextQuestions) * 100;
  };

  const handleSubmitSurvey = async () => {
    if (!respondentInfo.department || !respondentInfo.role || !respondentInfo.yearsOfExperience) {
      toast({
        title: "Missing Information",
        description: "Please provide your department, role, and years of experience",
        variant: "destructive",
      });
      return;
    }

    const requiredQuestions = surveyQuestions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter((q) =>
      currentResponses.some((r) => r.questionId === q.id),
    );

    if (answeredRequired.length < requiredQuestions.length) {
      toast({
        title: "Incomplete Survey",
        description: `Please answer all required questions (${answeredRequired.length}/${requiredQuestions.length} completed)`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate survey submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const actualCompletionTime = Math.round((Date.now() - startTime) / 60000); // in minutes
      
      const submission: SurveySubmission = {
        id: `survey-${Date.now()}`,
        respondentId: `user-${Math.random().toString(36).substr(2, 9)}`,
        department: respondentInfo.department,
        role: respondentInfo.role,
        responses: currentResponses,
        submittedAt: new Date().toISOString(),
        completionTime: actualCompletionTime,
      };
      
      // Enhanced submission with DOH compliance tracking
      const enhancedSubmission = {
        ...submission,
        respondentProfile: {
          ...respondentInfo,
          surveyPeriod,
          facilityId,
        },
        complianceMetrics: {
          cn_67_2025_compliant: true,
          muashirRankingEligible: true,
          mandatoryParticipation: true,
          responseCompleteness: (currentResponses.length / surveyQuestions.filter(q => q.required).length) * 100,
        },
        qualityIndicators: {
          responseTime: actualCompletionTime,
          responseConsistency: calculateResponseConsistency(currentResponses),
          engagementLevel: calculateEngagementLevel(currentResponses),
        },
      };

      toast({
        title: "Survey Submitted Successfully",
        description:
          "Thank you for participating in the Patient Safety Culture Survey. Your responses are confidential and will help improve patient safety.",
      });

      // Reset form
      setCurrentResponses([]);
      setRespondentInfo({ 
        department: "", 
        role: "", 
        yearsOfExperience: "",
        workShift: "",
        employmentType: "",
      });
      setSurveyProgress(0);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Safety Culture Survey
            </h1>
            <p className="text-gray-600 mt-1">
              CN_67_2025 - Mandatory Participation for Muashir Hospital Ranking
              2025
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {surveyPeriod}
            </Badge>
            {isAdmin && (
              <Button
                variant={surveyMode === "take" ? "outline" : "default"}
                onClick={() =>
                  setSurveyMode(surveyMode === "take" ? "view" : "take")
                }
              >
                {surveyMode === "take" ? "View Analytics" : "Take Survey"}
              </Button>
            )}
          </div>
        </div>

        {/* Survey Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Survey Schedule - Every 18 Months
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            This survey is conducted every 18 months as part of the Muashir
            hospital ranking system. Your participation is mandatory and
            responses are confidential. Survey takes approximately 10-15
            minutes.
          </AlertDescription>
        </Alert>

        {surveyMode === "take" ? (
          /* Survey Form */
          <div className="space-y-6">
            {/* Respondent Information */}
            <Card>
              <CardHeader>
                <CardTitle>Respondent Information</CardTitle>
                <CardDescription>
                  This information helps us analyze responses by department and
                  role (confidential)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={respondentInfo.department}
                    onValueChange={(value) =>
                      setRespondentInfo({
                        ...respondentInfo,
                        department: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Medical/Surgical">
                        Medical/Surgical
                      </SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Administration">
                        Administration
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={respondentInfo.role}
                    onValueChange={(value) =>
                      setRespondentInfo({ ...respondentInfo, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physician">Physician</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Technician">Technician</SelectItem>
                      <SelectItem value="Administrator">
                        Administrator
                      </SelectItem>
                      <SelectItem value="Support Staff">
                        Support Staff
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Select
                    value={respondentInfo.yearsOfExperience}
                    onValueChange={(value) =>
                      setRespondentInfo({ ...respondentInfo, yearsOfExperience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1">Less than 1 year</SelectItem>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="16-20">16-20 years</SelectItem>
                      <SelectItem value=">20">More than 20 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="workShift">Work Shift</Label>
                  <Select
                    value={respondentInfo.workShift}
                    onValueChange={(value) =>
                      setRespondentInfo({ ...respondentInfo, workShift: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift</SelectItem>
                      <SelectItem value="evening">Evening Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                      <SelectItem value="rotating">Rotating Shifts</SelectItem>
                      <SelectItem value="on-call">On-Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={respondentInfo.employmentType}
                    onValueChange={(value) =>
                      setRespondentInfo({ ...respondentInfo, employmentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Survey Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Survey Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(surveyProgress)}% Complete</span>
                </div>
                <Progress value={surveyProgress} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  Estimated time remaining: {Math.max(0, 15 - Math.round((Date.now() - startTime) / 60000))} minutes
                </div>
              </CardContent>
            </Card>

            {/* Survey Questions */
            {Object.entries(
              surveyQuestions.reduce(
                (acc, question) => {
                  if (!acc[question.category]) {
                    acc[question.category] = [];
                  }
                  acc[question.category].push(question);
                  return acc;
                },
                {} as Record<string, SurveyQuestion[]>,
              ),
            ).map(([category, questions]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question) => {
                    const currentResponse = currentResponses.find(
                      (r) => r.questionId === question.id,
                    );

                    return (
                      <div key={question.id} className="space-y-3">
                        <Label className="text-sm font-medium leading-relaxed">
                          {question.question}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>

                        {question.type === "likert" && (
                          <div className="grid grid-cols-5 gap-2">
                            {likertOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant={
                                  currentResponse?.response === option.value
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleResponseChange(
                                    question.id,
                                    option.value,
                                  )
                                }
                                className="text-xs p-2 h-auto"
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {question.type === "multiple_choice" &&
                          question.options && (
                            <Select
                              value={
                                (currentResponse?.response as string) || ""
                              }
                              onValueChange={(value) =>
                                handleResponseChange(question.id, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {question.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                        {question.type === "text" && (
                          <Textarea
                            value={(currentResponse?.response as string) || ""}
                            onChange={(e) =>
                              handleResponseChange(question.id, e.target.value)
                            }
                            placeholder="Enter your response..."
                            rows={3}
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button onClick={handleSubmitSurvey} disabled={loading} size="lg">
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Survey
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Analytics View */
          analytics && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalResponses}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.responseRate}% response rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.averageScore.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">out of 5.0</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Highest Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.max(
                        ...analytics.categoryScores.map((c) => c.score),
                      ).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        analytics.categoryScores.find(
                          (c) =>
                            c.score ===
                            Math.max(
                              ...analytics.categoryScores.map((s) => s.score),
                            ),
                        )?.category
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Lowest Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {Math.min(
                        ...analytics.categoryScores.map((c) => c.score),
                      ).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        analytics.categoryScores.find(
                          (c) =>
                            c.score ===
                            Math.min(
                              ...analytics.categoryScores.map((s) => s.score),
                            ),
                        )?.category
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Scores Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Safety Culture Scores by Category</CardTitle>
                  <CardDescription>
                    Average scores across different patient safety culture
                    dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoryScores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Response Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.departmentBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ department, responses }) =>
                              `${department}: ${responses}`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="responses"
                          >
                            {analytics.departmentBreakdown.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                    <CardDescription>
                      Patient safety culture scores over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
