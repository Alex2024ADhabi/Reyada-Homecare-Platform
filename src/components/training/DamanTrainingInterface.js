import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, HelpCircle, Lightbulb, Search, Play, CheckCircle, Clock, AlertTriangle, Info, FileText, Award, TrendingUp, } from "lucide-react";
import { damanTrainingSupport } from "@/services/daman-training-support.service";
export const DamanTrainingInterface = ({ currentField, formData, onGuidanceApply, }) => {
    const [contextualHelp, setContextualHelp] = useState(null);
    const [guidanceSteps, setGuidanceSteps] = useState([]);
    const [knowledgeBase, setKnowledgeBase] = useState([]);
    const [trainingModules, setTrainingModules] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModule, setSelectedModule] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [moduleProgress, setModuleProgress] = useState(0);
    const [updateNotifications, setUpdateNotifications] = useState([]);
    const [bestPractices, setBestPractices] = useState(null);
    const [errorResolution, setErrorResolution] = useState(null);
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
        }
        catch (error) {
            console.error("Failed to load training data:", error);
        }
    };
    const loadContextualHelp = (fieldName) => {
        const help = damanTrainingSupport.getContextualHelp(fieldName);
        setContextualHelp(help);
    };
    const loadGuidanceSteps = (data) => {
        const steps = damanTrainingSupport.generateSubmissionGuidance(data, "beginner");
        setGuidanceSteps(steps);
    };
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = damanTrainingSupport.searchKnowledgeBase(query);
            setKnowledgeBase(results);
        }
        else {
            const articles = damanTrainingSupport.searchKnowledgeBase("");
            setKnowledgeBase(articles.slice(0, 5));
        }
    };
    const handleModuleStart = (module) => {
        setSelectedModule(module);
        setCurrentSection(0);
        setModuleProgress(0);
    };
    const handleSectionComplete = () => {
        if (selectedModule && currentSection < selectedModule.sections.length - 1) {
            setCurrentSection((prev) => prev + 1);
            const newProgress = ((currentSection + 1) / selectedModule.sections.length) * 100;
            setModuleProgress(newProgress);
            // Track progress
            damanTrainingSupport.trackProgress("current-user", selectedModule.id, {
                completed: newProgress === 100,
                timeSpent: 0,
                completedSections: selectedModule.sections
                    .slice(0, currentSection + 1)
                    .map((s) => s.title),
            });
        }
    };
    const handleErrorHelp = (errorType, errorMessage) => {
        const help = damanTrainingSupport.getErrorResolutionHelp(errorType, errorMessage);
        setErrorResolution(help);
    };
    const renderContextualHelp = () => {
        if (!contextualHelp)
            return null;
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(HelpCircle, { className: "h-5 w-5" }), contextualHelp.title] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-gray-700", children: contextualHelp.content }), contextualHelp.examples && contextualHelp.examples.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Examples:" }), _jsx("ul", { className: "text-sm space-y-1", children: contextualHelp.examples.map((example, index) => (_jsxs("li", { className: "text-green-600", children: ["\u2022 ", example] }, index))) })] })), contextualHelp.commonMistakes &&
                            contextualHelp.commonMistakes.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Common Mistakes:" }), _jsx("ul", { className: "text-sm space-y-1", children: contextualHelp.commonMistakes.map((mistake, index) => (_jsxs("li", { className: "text-red-600", children: ["\u2022 ", mistake] }, index))) })] })), contextualHelp.smartSuggestions &&
                            contextualHelp.smartSuggestions.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-1", children: [_jsx(Lightbulb, { className: "h-4 w-4" }), "Smart Suggestions:"] }), _jsx("div", { className: "space-y-2", children: contextualHelp.smartSuggestions.map((suggestion, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded", children: [_jsx("span", { className: "text-sm", children: suggestion }), onGuidanceApply && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => onGuidanceApply(suggestion), children: "Apply" }))] }, index))) })] })), contextualHelp.complianceUpdates &&
                            contextualHelp.complianceUpdates.length > 0 && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Latest Updates:" }), _jsx("ul", { className: "mt-1 list-disc list-inside", children: contextualHelp.complianceUpdates.map((update, index) => (_jsx("li", { children: update }, index))) })] })] }))] })] }));
    };
    const renderGuidanceSteps = () => {
        if (guidanceSteps.length === 0)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "h-5 w-5" }), "Step-by-Step Guidance"] }), _jsx(CardDescription, { children: "Follow these steps for successful Daman submission" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: guidanceSteps.map((step, index) => {
                            const isCompleted = step.type === "success";
                            const hasWarning = step.type === "warning";
                            const hasError = step.type === "error";
                            return (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                                            ? "bg-green-100 text-green-700"
                                            : hasWarning
                                                ? "bg-yellow-100 text-yellow-700"
                                                : hasError
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-700"}`, children: isCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4" })) : hasError ? (_jsx(AlertTriangle, { className: "h-4 w-4" })) : (index + 1) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium", children: step.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: step.description }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [step.estimatedTime && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), step.estimatedTime] })), _jsx(Badge, { variant: "outline", className: "text-xs", children: step.difficulty })] }), step.prerequisites && step.prerequisites.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Prerequisites:" }), _jsx("ul", { className: "text-xs text-gray-600 list-disc list-inside", children: step.prerequisites.map((prereq, i) => (_jsx("li", { children: prereq }, i))) })] }))] })] }, step.id));
                        }) }) })] }));
    };
    const renderKnowledgeBase = () => {
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Knowledge Base"] }), _jsx(CardDescription, { children: "Search Daman guidelines and documentation" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Search guidelines, procedures, FAQs...", value: searchQuery, onChange: (e) => handleSearch(e.target.value), className: "flex-1" }), _jsx(Button, { variant: "outline", children: _jsx(Search, { className: "h-4 w-4" }) })] }), _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: knowledgeBase.map((article) => (_jsx("div", { className: "p-3 border rounded-lg hover:bg-gray-50 cursor-pointer", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium", children: article.title }), _jsx("p", { className: "text-xs text-gray-600 mt-1 line-clamp-2", children: article.content }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: article.category }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: article.difficulty }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500", children: [_jsx(Clock, { className: "h-3 w-3" }), article.estimatedReadTime, "min"] })] })] }) }) }, article.id))) }) })] })] }));
    };
    const renderTrainingModules = () => {
        return (_jsx("div", { className: "space-y-4", children: !selectedModule ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: trainingModules.map((module) => {
                    const progress = userProgress[module.id];
                    const isCompleted = progress?.completed || false;
                    return (_jsxs(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-lg", children: module.title }), _jsx(CardDescription, { className: "mt-1", children: module.description })] }), isCompleted && (_jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }))] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-4 w-4" }), module.duration, "min"] }), _jsx(Badge, { variant: "outline", children: module.difficulty })] }), progress && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [progress.completedSections?.length || 0, "/", module.sections.length] })] }), _jsx(Progress, { value: ((progress.completedSections?.length || 0) /
                                                    module.sections.length) *
                                                    100, className: "h-2" })] })), _jsxs(Button, { onClick: () => handleModuleStart(module), className: "w-full", variant: isCompleted ? "outline" : "default", children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), isCompleted ? "Review" : "Start", " Module"] })] })] }, module.id));
                }) })) : (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: selectedModule.title }), _jsxs(CardDescription, { children: ["Section ", currentSection + 1, " of", " ", selectedModule.sections.length] })] }), _jsx(Button, { variant: "outline", onClick: () => setSelectedModule(null), children: "Back to Modules" })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [Math.round(moduleProgress), "%"] })] }), _jsx(Progress, { value: moduleProgress, className: "h-2" })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: selectedModule.sections[currentSection].title }), _jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("p", { children: selectedModule.sections[currentSection].content }) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentSection((prev) => Math.max(0, prev - 1)), disabled: currentSection === 0, children: "Previous" }), _jsx(Button, { onClick: handleSectionComplete, disabled: currentSection >= selectedModule.sections.length - 1, children: currentSection >= selectedModule.sections.length - 1
                                            ? "Complete"
                                            : "Next" })] })] })] })) }));
    };
    const renderUpdateNotifications = () => {
        if (updateNotifications.length === 0)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Latest Updates"] }), _jsx(CardDescription, { children: "Important Daman guideline updates and changes" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: updateNotifications.map((notification) => (_jsx(Alert, { className: `${notification.priority === "critical"
                                ? "border-red-200 bg-red-50"
                                : notification.priority === "high"
                                    ? "border-yellow-200 bg-yellow-50"
                                    : "border-blue-200 bg-blue-50"}`, children: _jsxs("div", { className: "flex items-start gap-2", children: [notification.priority === "critical" ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600 mt-0.5" })) : (_jsx(Info, { className: "h-4 w-4 text-blue-600 mt-0.5" })), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "text-sm font-medium", children: notification.title }), _jsx(Badge, { variant: notification.priority === "critical"
                                                            ? "destructive"
                                                            : "secondary", className: "text-xs", children: notification.priority })] }), _jsx("p", { className: "text-sm text-gray-700", children: notification.description }), notification.effectiveDate && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Effective:", " ", new Date(notification.effectiveDate).toLocaleDateString()] }))] })] }) }, notification.id))) }) })] }));
    };
    const renderBestPractices = () => {
        if (!bestPractices)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Award, { className: "h-5 w-5" }), bestPractices.title] }), _jsx(CardDescription, { children: "Proven strategies for successful Daman submissions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: bestPractices.practices.map((practice, index) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium", children: practice.practice }), _jsxs("div", { className: "flex gap-1", children: [_jsxs(Badge, { variant: practice.impact === "high" ? "default" : "secondary", className: "text-xs", children: [practice.impact, " impact"] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: practice.difficulty })] })] }), _jsx("p", { className: "text-sm text-gray-600", children: practice.description })] }, index))) }) })] }));
    };
    return (_jsxs("div", { className: "space-y-6 bg-white min-h-screen", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Daman Training & Support" }), _jsx("p", { className: "text-gray-600", children: "Built-in guidance and knowledge base" })] }) }), _jsxs(Tabs, { defaultValue: "help", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "help", children: "Contextual Help" }), _jsx(TabsTrigger, { value: "guidance", children: "Step Guidance" }), _jsx(TabsTrigger, { value: "knowledge", children: "Knowledge Base" }), _jsx(TabsTrigger, { value: "training", children: "Training" }), _jsx(TabsTrigger, { value: "updates", children: "Updates" })] }), _jsxs(TabsContent, { value: "help", className: "space-y-4", children: [renderContextualHelp(), renderBestPractices()] }), _jsx(TabsContent, { value: "guidance", className: "space-y-4", children: renderGuidanceSteps() }), _jsx(TabsContent, { value: "knowledge", className: "space-y-4", children: renderKnowledgeBase() }), _jsx(TabsContent, { value: "training", className: "space-y-4", children: renderTrainingModules() }), _jsx(TabsContent, { value: "updates", className: "space-y-4", children: renderUpdateNotifications() })] })] }));
};
export default DamanTrainingInterface;
