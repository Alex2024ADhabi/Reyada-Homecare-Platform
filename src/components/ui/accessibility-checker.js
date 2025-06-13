import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, AlertTriangle, CheckCircle, XCircle, Keyboard, Palette, Type, MousePointer, Volume2, } from "lucide-react";
import { cn } from "@/lib/utils";
export const AccessibilityChecker = ({ className, autoCheck = false, }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
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
            const mockIssues = [
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
                    suggestion: "Ensure text can be resized up to 200% without loss of functionality",
                },
                {
                    id: "5",
                    type: "info",
                    category: "structure",
                    title: "Missing heading hierarchy",
                    description: "Page structure could benefit from proper heading levels",
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
        }
        catch (error) {
            console.error("Accessibility check failed:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getIssuesByCategory = (category) => {
        if (!report)
            return [];
        if (category === "all")
            return report.issues;
        return report.issues.filter((issue) => issue.category === category);
    };
    const getIssueIcon = (type) => {
        switch (type) {
            case "error":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case "warning":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "info":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-blue-500" });
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "keyboard":
                return _jsx(Keyboard, { className: "h-4 w-4" });
            case "color":
                return _jsx(Palette, { className: "h-4 w-4" });
            case "text":
                return _jsx(Type, { className: "h-4 w-4" });
            case "structure":
                return _jsx(Eye, { className: "h-4 w-4" });
            case "aria":
                return _jsx(Volume2, { className: "h-4 w-4" });
            case "focus":
                return _jsx(MousePointer, { className: "h-4 w-4" });
        }
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getScoreBadgeVariant = (score) => {
        if (score >= 90)
            return "default";
        if (score >= 70)
            return "secondary";
        return "destructive";
    };
    const getWcagBadgeColor = (level) => {
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
    return (_jsx("div", { className: cn("space-y-6", className), children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "h-5 w-5" }), "Accessibility Checker"] }), _jsx(CardDescription, { children: "WCAG compliance analysis and accessibility recommendations" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [report && (_jsxs(_Fragment, { children: [_jsxs(Badge, { className: getWcagBadgeColor(report.wcagLevel), children: ["WCAG ", report.wcagLevel] }), _jsxs(Badge, { variant: getScoreBadgeVariant(report.score), children: ["Score: ", report.score, "/100"] })] })), _jsx(Button, { variant: "outline", size: "sm", onClick: runAccessibilityCheck, disabled: loading, children: loading ? "Checking..." : "Run Check" })] })] }) }), _jsx(CardContent, { children: loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { children: "Running accessibility audit..." })] })) : report ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: cn("text-3xl font-bold", getScoreColor(report.score)), children: report.score }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Score" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: report.passedChecks }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Passed" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-3xl font-bold text-red-600", children: report.issues.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Issues" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-3xl font-bold", children: report.wcagLevel }), _jsx("div", { className: "text-sm text-muted-foreground", children: "WCAG Level" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Accessibility Score" }), _jsxs("span", { className: cn("text-sm font-bold", getScoreColor(report.score)), children: [report.score, "/100"] })] }), _jsx(Progress, { value: report.score, className: "h-3" }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [report.passedChecks, " of ", report.totalChecks, " checks passed"] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => {
                                    const Icon = category.icon;
                                    const count = category.id === "all"
                                        ? report.issues.length
                                        : report.issues.filter((issue) => issue.category === category.id).length;
                                    return (_jsxs(Button, { variant: selectedCategory === category.id ? "default" : "outline", size: "sm", onClick: () => setSelectedCategory(category.id), className: "flex items-center gap-2", children: [_jsx(Icon, { className: "h-4 w-4" }), category.label, count > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-1", children: count }))] }, category.id));
                                }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium", children: [selectedCategory === "all"
                                                ? "All Issues"
                                                : `${selectedCategory} Issues`, filteredIssues.length > 0 && (_jsxs("span", { className: "ml-2 text-muted-foreground", children: ["(", filteredIssues.length, ")"] }))] }), filteredIssues.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" }), _jsx("p", { children: "No issues found in this category! \uD83C\uDF89" })] })) : (_jsx("div", { className: "space-y-3", children: filteredIssues.map((issue) => (_jsx("div", { className: "border rounded-lg p-4 hover:bg-muted/50 transition-colors", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: getIssueIcon(issue.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h5", { className: "font-medium", children: issue.title }), _jsxs(Badge, { variant: "outline", className: getWcagBadgeColor(issue.wcagLevel), children: ["WCAG ", issue.wcagLevel] }), _jsxs("div", { className: "flex items-center gap-1", children: [getCategoryIcon(issue.category), _jsx("span", { className: "text-xs text-muted-foreground capitalize", children: issue.category })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: issue.description }), issue.element && (_jsx("div", { className: "text-xs font-mono bg-muted px-2 py-1 rounded mb-2", children: issue.element })), _jsxs("div", { className: "text-xs text-muted-foreground mb-2", children: [_jsx("strong", { children: "WCAG Criterion:" }), " ", issue.wcagCriterion] }), _jsxs("div", { className: "text-sm bg-blue-50 border-l-4 border-blue-400 p-3 rounded", children: [_jsx("strong", { className: "text-blue-800", children: "Suggestion:" }), _jsx("span", { className: "text-blue-700 ml-2", children: issue.suggestion })] })] })] }) }, issue.id))) }))] })] })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Eye, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Click \"Run Check\" to start accessibility audit" })] })) })] }) }));
};
export default AccessibilityChecker;
