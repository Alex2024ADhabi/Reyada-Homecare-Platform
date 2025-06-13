import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { Calendar, Send, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
export default function PatientSafetyCultureSurvey({ facilityId = "facility-001", surveyPeriod = "2025-Q1", isAdmin = false, }) {
    const [surveyQuestions] = useState([
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
            question: "Our procedures and systems are good at preventing errors from happening",
            type: "likert",
            required: true,
        },
        {
            id: "teamwork_1",
            category: "Teamwork Within Units",
            question: "When a lot of work needs to be done quickly, we work together as a team to get the work done",
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
            question: "Staff will freely speak up if they see something that may negatively affect patient care",
            type: "likert",
            required: true,
        },
        {
            id: "communication_2",
            category: "Communication Openness",
            question: "Staff feel free to question the decisions or actions of those with more authority",
            type: "likert",
            required: true,
        },
        {
            id: "feedback_1",
            category: "Feedback & Communication About Error",
            question: "We are given feedback about changes put into place based on event reports",
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
            question: "When an event is reported, it feels like the person is being written up, not the problem",
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
            question: "Staff in this unit work longer hours than is best for patient care",
            type: "likert",
            required: true,
        },
        {
            id: "management_1",
            category: "Management Support for Patient Safety",
            question: "Hospital management provides a work climate that promotes patient safety",
            type: "likert",
            required: true,
        },
        {
            id: "management_2",
            category: "Management Support for Patient Safety",
            question: "The actions of hospital management show that patient safety is a top priority",
            type: "likert",
            required: true,
        },
        {
            id: "overall_rating",
            category: "Overall Perceptions",
            question: "Please give your work area/unit an overall grade on patient safety",
            type: "multiple_choice",
            options: ["Excellent", "Very Good", "Acceptable", "Poor", "Failing"],
            required: true,
        },
        {
            id: "improvement_suggestions",
            category: "Improvement Suggestions",
            question: "What specific suggestions do you have for improving patient safety in your work area?",
            type: "text",
            required: false,
        },
    ]);
    const [currentResponses, setCurrentResponses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [surveyMode, setSurveyMode] = useState(isAdmin ? "view" : "take");
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
    const generateMockAnalytics = () => {
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
    const handleResponseChange = (questionId, response) => {
        setCurrentResponses((prev) => {
            const existing = prev.find((r) => r.questionId === questionId);
            const newResponses = existing
                ? prev.map((r) => r.questionId === questionId ? { ...r, response } : r)
                : [...prev, { questionId, response }];
            // Update progress
            const requiredQuestions = surveyQuestions.filter(q => q.required);
            const answeredRequired = requiredQuestions.filter(q => newResponses.some(r => r.questionId === q.id));
            setSurveyProgress((answeredRequired.length / requiredQuestions.length) * 100);
            return newResponses;
        });
    };
    // Helper functions for enhanced analytics
    const calculateResponseConsistency = (responses) => {
        // Simple consistency check - in real implementation would be more sophisticated
        const likertResponses = responses.filter(r => typeof r.response === 'number');
        if (likertResponses.length < 2)
            return 100;
        const values = likertResponses.map(r => r.response);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        return Math.max(0, 100 - (variance * 20)); // Convert to percentage
    };
    const calculateEngagementLevel = (responses) => {
        const textResponses = responses.filter(r => typeof r.response === 'string' && r.response.length > 10);
        const totalTextQuestions = surveyQuestions.filter(q => q.type === 'text').length;
        if (totalTextQuestions === 0)
            return 100;
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
        const answeredRequired = requiredQuestions.filter((q) => currentResponses.some((r) => r.questionId === q.id));
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
            const submission = {
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
                description: "Thank you for participating in the Patient Safety Culture Survey. Your responses are confidential and will help improve patient safety.",
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
        }
        catch (error) {
            toast({
                title: "Submission Failed",
                description: "Failed to submit survey. Please try again.",
                variant: "destructive",
            });
        }
        finally {
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
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Patient Safety Culture Survey" }), _jsx("p", { className: "text-gray-600 mt-1", children: "CN_67_2025 - Mandatory Participation for Muashir Hospital Ranking 2025" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700", children: surveyPeriod }), isAdmin && (_jsx(Button, { variant: surveyMode === "take" ? "outline" : "default", onClick: () => setSurveyMode(surveyMode === "take" ? "view" : "take"), children: surveyMode === "take" ? "View Analytics" : "Take Survey" }))] })] }), _jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Calendar, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Survey Schedule - Every 18 Months" }), _jsx(AlertDescription, { className: "text-blue-700", children: "This survey is conducted every 18 months as part of the Muashir hospital ranking system. Your participation is mandatory and responses are confidential. Survey takes approximately 10-15 minutes." })] }), surveyMode === "take" ? (
                /* Survey Form */
                _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Respondent Information" }), _jsx(CardDescription, { children: "This information helps us analyze responses by department and role (confidential)" })] }), _jsxs(CardContent, { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsxs(Select, { value: respondentInfo.department, onValueChange: (value) => setRespondentInfo({
                                                        ...respondentInfo,
                                                        department: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select your department" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Emergency", children: "Emergency" }), _jsx(SelectItem, { value: "ICU", children: "ICU" }), _jsx(SelectItem, { value: "Medical/Surgical", children: "Medical/Surgical" }), _jsx(SelectItem, { value: "Pediatrics", children: "Pediatrics" }), _jsx(SelectItem, { value: "Pharmacy", children: "Pharmacy" }), _jsx(SelectItem, { value: "Laboratory", children: "Laboratory" }), _jsx(SelectItem, { value: "Radiology", children: "Radiology" }), _jsx(SelectItem, { value: "Administration", children: "Administration" }), _jsx(SelectItem, { value: "Other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: respondentInfo.role, onValueChange: (value) => setRespondentInfo({ ...respondentInfo, role: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select your role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Physician", children: "Physician" }), _jsx(SelectItem, { value: "Nurse", children: "Nurse" }), _jsx(SelectItem, { value: "Pharmacist", children: "Pharmacist" }), _jsx(SelectItem, { value: "Technician", children: "Technician" }), _jsx(SelectItem, { value: "Administrator", children: "Administrator" }), _jsx(SelectItem, { value: "Support Staff", children: "Support Staff" }), _jsx(SelectItem, { value: "Other", children: "Other" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "yearsOfExperience", children: "Years of Experience" }), _jsxs(Select, { value: respondentInfo.yearsOfExperience, onValueChange: (value) => setRespondentInfo({ ...respondentInfo, yearsOfExperience: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select experience" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "<1", children: "Less than 1 year" }), _jsx(SelectItem, { value: "1-2", children: "1-2 years" }), _jsx(SelectItem, { value: "3-5", children: "3-5 years" }), _jsx(SelectItem, { value: "6-10", children: "6-10 years" }), _jsx(SelectItem, { value: "11-15", children: "11-15 years" }), _jsx(SelectItem, { value: "16-20", children: "16-20 years" }), _jsx(SelectItem, { value: ">20", children: "More than 20 years" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "workShift", children: "Work Shift" }), _jsxs(Select, { value: respondentInfo.workShift, onValueChange: (value) => setRespondentInfo({ ...respondentInfo, workShift: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select shift" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "day", children: "Day Shift" }), _jsx(SelectItem, { value: "evening", children: "Evening Shift" }), _jsx(SelectItem, { value: "night", children: "Night Shift" }), _jsx(SelectItem, { value: "rotating", children: "Rotating Shifts" }), _jsx(SelectItem, { value: "on-call", children: "On-Call" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "employmentType", children: "Employment Type" }), _jsxs(Select, { value: respondentInfo.employmentType, onValueChange: (value) => setRespondentInfo({ ...respondentInfo, employmentType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "full-time", children: "Full-time" }), _jsx(SelectItem, { value: "part-time", children: "Part-time" }), _jsx(SelectItem, { value: "contract", children: "Contract" }), _jsx(SelectItem, { value: "temporary", children: "Temporary" })] })] })] })] })] }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Survey Progress" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round(surveyProgress), "% Complete"] })] }), _jsx(Progress, { value: surveyProgress, className: "h-2" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Estimated time remaining: ", Math.max(0, 15 - Math.round((Date.now() - startTime) / 60000)), " minutes"] })] }) }), /* Survey Questions */ { Object, : .entries(surveyQuestions.reduce((acc, question) => {
                                if (!acc[question.category]) {
                                    acc[question.category] = [];
                                }
                                acc[question.category].push(question);
                                return acc;
                            }, {})).map(([category, questions]) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: category }) }), _jsx(CardContent, { className: "space-y-6", children: questions.map((question) => {
                                            const currentResponse = currentResponses.find((r) => r.questionId === question.id);
                                            return (_jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { className: "text-sm font-medium leading-relaxed", children: [question.question, question.required && (_jsx("span", { className: "text-red-500 ml-1", children: "*" }))] }), question.type === "likert" && (_jsx("div", { className: "grid grid-cols-5 gap-2", children: likertOptions.map((option) => (_jsx(Button, { variant: currentResponse?.response === option.value
                                                                ? "default"
                                                                : "outline", size: "sm", onClick: () => handleResponseChange(question.id, option.value), className: "text-xs p-2 h-auto", children: option.label }, option.value))) })), question.type === "multiple_choice" &&
                                                        question.options && (_jsxs(Select, { value: currentResponse?.response || "", onValueChange: (value) => handleResponseChange(question.id, value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select an option" }) }), _jsx(SelectContent, { children: question.options.map((option) => (_jsx(SelectItem, { value: option, children: option }, option))) })] })), question.type === "text" && (_jsx(Textarea, { value: currentResponse?.response || "", onChange: (e) => handleResponseChange(question.id, e.target.value), placeholder: "Enter your response...", rows: 3 }))] }, question.id));
                                        }) })] }, category))) }, _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleSubmitSurvey, disabled: loading, size: "lg", children: loading ? ("Submitting...") : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Submit Survey"] })) }) })] })) : (
                /* Analytics View */
                analytics && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Responses" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: analytics.totalResponses }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [analytics.responseRate, "% response rate"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Average Score" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: analytics.averageScore.toFixed(1) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "out of 5.0" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Highest Category" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: Math.max(...analytics.categoryScores.map((c) => c.score)).toFixed(1) }), _jsx("p", { className: "text-xs text-muted-foreground", children: analytics.categoryScores.find((c) => c.score ===
                                                        Math.max(...analytics.categoryScores.map((s) => s.score)))?.category })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Lowest Category" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: Math.min(...analytics.categoryScores.map((c) => c.score)).toFixed(1) }), _jsx("p", { className: "text-xs text-muted-foreground", children: analytics.categoryScores.find((c) => c.score ===
                                                        Math.min(...analytics.categoryScores.map((s) => s.score)))?.category })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Safety Culture Scores by Category" }), _jsx(CardDescription, { children: "Average scores across different patient safety culture dimensions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: analytics.categoryScores, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "category", angle: -45, textAnchor: "end", height: 100, fontSize: 12 }), _jsx(YAxis, { domain: [0, 5] }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "score", fill: "#3B82F6" })] }) }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Department Response Breakdown" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: analytics.departmentBreakdown, cx: "50%", cy: "50%", labelLine: false, label: ({ department, responses }) => `${department}: ${responses}`, outerRadius: 80, fill: "#8884d8", dataKey: "responses", children: analytics.departmentBreakdown.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Trend Analysis" }), _jsx(CardDescription, { children: "Patient safety culture scores over time" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: analytics.trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "period" }), _jsx(YAxis, { domain: [0, 5] }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "score", fill: "#10B981" })] }) }) }) })] })] })] })))] }) }));
}
