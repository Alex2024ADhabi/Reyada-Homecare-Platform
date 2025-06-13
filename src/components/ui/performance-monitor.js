import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, BarChart3, } from "lucide-react";
import { useBundleOptimization } from "@/services/bundle-optimization.service";
import { useMemoryLeakDetection } from "@/hooks/useMemoryLeakPrevention";
export const PerformanceMonitor = ({ className = "", showDetails = true, }) => {
    const { getPerformanceMetrics, generatePerformanceReport, analyzeBundleSize, } = useBundleOptimization();
    const { checkLeaks, getMemoryUsage } = useMemoryLeakDetection("PerformanceMonitor");
    const [metrics, setMetrics] = useState(null);
    const [report, setReport] = useState(null);
    const [bundleAnalysis, setBundleAnalysis] = useState(null);
    const [memoryLeaks, setMemoryLeaks] = useState([]);
    const [memoryUsage, setMemoryUsage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [metricsData, reportData, bundleData, leaksData, memoryData] = await Promise.all([
                getPerformanceMetrics(),
                generatePerformanceReport(),
                analyzeBundleSize(),
                checkLeaks(),
                getMemoryUsage(),
            ]);
            setMetrics(metricsData);
            setReport(reportData);
            setBundleAnalysis(bundleData);
            setMemoryLeaks(leaksData);
            setMemoryUsage(memoryData);
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error("Failed to refresh performance data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        refreshData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);
    const getScoreColor = (rating) => {
        switch (rating) {
            case "good":
                return "text-green-600 bg-green-100";
            case "needs-improvement":
                return "text-yellow-600 bg-yellow-100";
            case "poor":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const formatTime = (ms) => {
        if (ms < 1000)
            return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };
    if (!showDetails) {
        return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsx(Activity, { className: "h-4 w-4 text-green-500" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Performance: ", report?.scores?.lcp?.rating || "monitoring"] }), memoryLeaks.length > 0 && (_jsxs(Badge, { variant: "destructive", className: "text-xs", children: [memoryLeaks.length, " leaks"] }))] }));
    }
    return (_jsx("div", { className: `bg-white ${className}`, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: "Performance Monitor" }), _jsx(CardDescription, { children: "Real-time application performance and optimization insights" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Updated: ", lastUpdated.toLocaleTimeString()] }), _jsx(Button, { variant: "outline", size: "sm", onClick: refreshData, disabled: isLoading, children: _jsx(RefreshCw, { className: `h-4 w-4 ${isLoading ? "animate-spin" : ""}` }) })] })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "metrics", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "metrics", children: "Core Metrics" }), _jsx(TabsTrigger, { value: "bundle", children: "Bundle Analysis" }), _jsx(TabsTrigger, { value: "memory", children: "Memory Usage" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" })] }), _jsx(TabsContent, { value: "metrics", className: "space-y-4", children: report && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "First Contentful Paint" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatTime(report.scores.fcp.score) }), _jsx(Badge, { className: `text-xs ${getScoreColor(report.scores.fcp.rating)}`, children: report.scores.fcp.rating })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Largest Contentful Paint" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatTime(report.scores.lcp.score) }), _jsx(Badge, { className: `text-xs ${getScoreColor(report.scores.lcp.rating)}`, children: report.scores.lcp.rating })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "First Input Delay" }), _jsx(Zap, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatTime(report.scores.fid.score) }), _jsx(Badge, { className: `text-xs ${getScoreColor(report.scores.fid.rating)}`, children: report.scores.fid.rating })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Cumulative Layout Shift" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: report.scores.cls.score.toFixed(3) }), _jsx(Badge, { className: `text-xs ${getScoreColor(report.scores.cls.rating)}`, children: report.scores.cls.rating })] })] })] })) }), _jsx(TabsContent, { value: "bundle", className: "space-y-4", children: bundleAnalysis && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Total Bundle Size" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatBytes(bundleAnalysis.totalSize) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Gzipped: ", formatBytes(bundleAnalysis.gzippedSize)] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Chunks" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: bundleAnalysis.chunks.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [bundleAnalysis.chunks.filter((c) => c.isAsync)
                                                                            .length, " ", "async"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Dependencies" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: bundleAnalysis.dependencies.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [bundleAnalysis.dependencies.filter((d) => d.usage === "partial").length, " ", "partially used"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Chunk Breakdown" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: bundleAnalysis.chunks.map((chunk) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: chunk.name }), chunk.isAsync && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "async" }))] }), _jsx("div", { className: "text-sm text-muted-foreground", children: formatBytes(chunk.size) })] }, chunk.name))) }) })] })] })) }), _jsxs(TabsContent, { value: "memory", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [memoryUsage && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Memory Usage" }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Used Heap:" }), _jsx("span", { children: formatBytes(memoryUsage.usedJSHeapSize) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Total Heap:" }), _jsx("span", { children: formatBytes(memoryUsage.totalJSHeapSize) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Heap Limit:" }), _jsx("span", { children: formatBytes(memoryUsage.jsHeapSizeLimit) })] }), _jsx(Progress, { value: (memoryUsage.usedJSHeapSize /
                                                                    memoryUsage.totalJSHeapSize) *
                                                                    100, className: "mt-2" })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Resource Tracking" }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Components:" }), _jsx("span", { children: memoryUsage?.trackedComponents || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Event Listeners:" }), _jsx("span", { children: memoryUsage?.activeEventListeners || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Timers:" }), _jsx("span", { children: memoryUsage?.activeTimers || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subscriptions:" }), _jsx("span", { children: memoryUsage?.activeSubscriptions || 0 })] })] })] })] }), memoryLeaks.length > 0 && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsxs("strong", { children: [memoryLeaks.length, " memory leak(s) detected:"] }), _jsx("ul", { className: "mt-2 space-y-1", children: memoryLeaks.slice(0, 3).map((leak, index) => (_jsxs("li", { className: "text-sm", children: ["\u2022 ", leak.componentName, ": ", leak.description] }, index))) }), memoryLeaks.length > 3 && (_jsxs("p", { className: "text-sm mt-1", children: ["...and ", memoryLeaks.length - 3, " more"] }))] })] }))] }), _jsxs(TabsContent, { value: "recommendations", className: "space-y-4", children: [bundleAnalysis?.recommendations && (_jsx("div", { className: "space-y-3", children: bundleAnalysis.recommendations
                                            .slice(0, 10)
                                            .map((rec, index) => (_jsx(Alert, { className: rec.priority === "critical" ? "border-red-200" : "", children: _jsxs("div", { className: "flex items-start gap-2", children: [rec.priority === "critical" ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-500 mt-0.5" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-blue-500 mt-0.5" })), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { variant: rec.priority === "critical"
                                                                            ? "destructive"
                                                                            : "secondary", className: "text-xs", children: rec.priority }), _jsx(Badge, { variant: "outline", className: "text-xs", children: rec.type })] }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: rec.description }), _jsx("p", { className: "text-sm mt-1", children: rec.implementation }), rec.estimatedSavings > 0 && (_jsxs("p", { className: "text-xs text-green-600 mt-1", children: ["Potential savings:", " ", formatBytes(rec.estimatedSavings)] }))] })] })] }) }, index))) })), report?.recommendations && report.recommendations.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Performance Recommendations:" }), _jsx("ul", { className: "space-y-1", children: report.recommendations.map((rec, index) => (_jsxs("li", { className: "text-sm flex items-start gap-2", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-blue-500 mt-1 flex-shrink-0" }), rec] }, index))) })] }))] })] }) })] }) }));
};
export default PerformanceMonitor;
