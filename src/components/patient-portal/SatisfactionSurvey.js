import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Star, Send, Clock, CheckCircle, X, AlertCircle, ThumbsUp, ThumbsDown, } from "lucide-react";
import { useSatisfactionSurveys } from "@/hooks/useSatisfactionSurveys";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
export const SatisfactionSurveyComponent = ({ survey, onComplete, onDismiss, className = "", }) => {
    const { toast } = useToast();
    const { submitSurvey, dismissSurvey, isLoading } = useSatisfactionSurveys(survey.patientId);
    const [responses, setResponses] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFullSurvey, setShowFullSurvey] = useState(false);
    const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
    const handleResponseChange = (questionId, value) => {
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
            const missingResponses = requiredQuestions.filter((q) => !responses[q.id] || responses[q.id] === "");
            if (missingResponses.length > 0) {
                toast({
                    title: "Incomplete Survey",
                    description: "Please answer all required questions before submitting.",
                    variant: "destructive",
                });
                return;
            }
            // Analyze sentiment of text responses before submission
            const textResponses = Object.values(responses)
                .filter((response) => typeof response === "string" && response.length > 10)
                .join(" ");
            if (textResponses) {
                try {
                    const sentiment = await naturalLanguageProcessingService.analyzeSentimentForSatisfaction(textResponses);
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
                }
                catch (error) {
                    console.error("Sentiment analysis failed:", error);
                    await submitSurvey(survey.id, responses);
                }
            }
            else {
                await submitSurvey(survey.id, responses);
            }
            toast({
                title: "Survey Submitted",
                description: "Thank you for your feedback!",
            });
            setShowFullSurvey(false);
            onComplete?.();
        }
        catch (error) {
            toast({
                title: "Submission Failed",
                description: "Failed to submit survey. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDismiss = async () => {
        try {
            await dismissSurvey(survey.id);
            onDismiss?.();
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to dismiss survey.",
                variant: "destructive",
            });
        }
    };
    const renderQuestion = (question) => {
        const value = responses[question.id];
        switch (question.type) {
            case "rating":
                return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: question.scale.max }, (_, i) => {
                                const rating = i + 1;
                                return (_jsx("button", { onClick: () => handleResponseChange(question.id, rating), className: `p-1 rounded transition-colors ${value === rating
                                        ? "text-yellow-500"
                                        : "text-gray-300 hover:text-yellow-400"}`, children: _jsx(Star, { className: `h-6 w-6 ${value === rating ? "fill-current" : ""}` }) }, rating));
                            }) }), question.scale.labels && (_jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [_jsx("span", { children: question.scale.labels[0] }), _jsx("span", { children: question.scale.labels[question.scale.labels.length - 1] })] }))] }));
            case "multiple-choice":
                return (_jsx(RadioGroup, { value: value || "", onValueChange: (newValue) => handleResponseChange(question.id, newValue), children: question.options.map((option, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: option, id: `${question.id}-${index}` }), _jsx(Label, { htmlFor: `${question.id}-${index}`, children: option })] }, index))) }));
            case "yes-no":
                return (_jsxs("div", { className: "flex space-x-4", children: [_jsxs("button", { onClick: () => handleResponseChange(question.id, true), className: `flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${value === true
                                ? "bg-green-50 border-green-500 text-green-700"
                                : "border-gray-300 hover:border-green-400"}`, children: [_jsx(ThumbsUp, { className: "h-4 w-4" }), _jsx("span", { children: "Yes" })] }), _jsxs("button", { onClick: () => handleResponseChange(question.id, false), className: `flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${value === false
                                ? "bg-red-50 border-red-500 text-red-700"
                                : "border-gray-300 hover:border-red-400"}`, children: [_jsx(ThumbsDown, { className: "h-4 w-4" }), _jsx("span", { children: "No" })] })] }));
            case "text":
                return (_jsx(Textarea, { value: value || "", onChange: async (e) => {
                        const text = e.target.value;
                        handleResponseChange(question.id, text);
                        // Perform real-time sentiment analysis for longer responses
                        if (text.length > 20) {
                            try {
                                const sentiment = await naturalLanguageProcessingService.analyzeSentimentForSatisfaction(text);
                                // Could show real-time sentiment feedback to user
                            }
                            catch (error) {
                                console.error("Real-time sentiment analysis failed:", error);
                            }
                        }
                    }, placeholder: "Enter your response...", rows: 3, maxLength: question.maxLength }));
            case "checkbox":
                return (_jsx("div", { className: "space-y-2", children: question.options.map((option, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `${question.id}-${index}`, checked: (value || []).includes(option), onCheckedChange: (checked) => {
                                    const currentValues = value || [];
                                    if (checked) {
                                        handleResponseChange(question.id, [
                                            ...currentValues,
                                            option,
                                        ]);
                                    }
                                    else {
                                        handleResponseChange(question.id, currentValues.filter((v) => v !== option));
                                    }
                                } }), _jsx(Label, { htmlFor: `${question.id}-${index}`, children: option })] }, index))) }));
            default:
                return (_jsx(Input, { value: value || "", onChange: (e) => handleResponseChange(question.id, e.target.value), placeholder: "Enter your response..." }));
        }
    };
    const getSurveyTypeColor = (type) => {
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
        return (_jsx(Card, { className: `border-green-200 ${className}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: survey.title }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Completed on", " ", format(new Date(survey.completedAt), "MMM dd, yyyy")] })] })] }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Completed" })] }) }) }));
    }
    return (_jsx(_Fragment, { children: _jsx(Card, { className: `border-yellow-200 bg-yellow-50 ${className}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-yellow-600 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: survey.title }), _jsx(Badge, { className: getSurveyTypeColor(survey.type), children: survey.type.replace("-", " ") })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: survey.description }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: ["Expires ", format(new Date(survey.expiresAt), "MMM dd")] })] }), _jsxs("span", { children: [survey.questions.length, " questions"] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Dialog, { open: showFullSurvey, onOpenChange: setShowFullSurvey, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { size: "sm", children: "Complete Survey" }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center space-x-2", children: [_jsx("span", { children: survey.title }), _jsx(Badge, { className: getSurveyTypeColor(survey.type), children: survey.type.replace("-", " ") })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsx("p", { className: "text-gray-600", children: survey.description }), survey.questions.map((question, index) => (_jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-500 mt-1", children: [index + 1, "."] }), _jsxs("div", { className: "flex-1", children: [_jsxs(Label, { className: "text-sm font-medium text-gray-900", children: [question.question, question.required && (_jsx("span", { className: "text-red-500 ml-1", children: "*" }))] }), _jsx("div", { className: "mt-2", children: renderQuestion(question) })] })] }) }, question.id))), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setShowFullSurvey(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSubmit, disabled: isSubmitting, children: [isSubmitting ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" })) : (_jsx(Send, { className: "h-4 w-4 mr-2" })), "Submit Survey"] })] })] })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleDismiss, disabled: isLoading, children: _jsx(X, { className: "h-4 w-4" }) })] })] }) }) }) }));
};
export default SatisfactionSurveyComponent;
