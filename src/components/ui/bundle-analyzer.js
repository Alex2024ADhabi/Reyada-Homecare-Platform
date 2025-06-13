import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Zap, AlertTriangle, CheckCircle, FileText, } from "lucide-react";
import { cn } from "@/lib/utils";
export const BundleAnalyzer = ({ className, showDetails = false, }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    useEffect(() => {
        analyzeBundleSize();
    }, []);
    const analyzeBundleSize = async () => {
        setLoading(true);
        try {
            // Simulate bundle analysis with realistic data
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockStats = {
                totalSize: 2.4 * 1024 * 1024, // 2.4MB
                gzippedSize: 0.8 * 1024 * 1024, // 800KB
                chunks: [
                    {
                        name: "vendor",
                        size: 1.2 * 1024 * 1024,
                        gzippedSize: 0.4 * 1024 * 1024,
                        modules: 45,
                    },
                    {
                        name: "main",
                        size: 0.8 * 1024 * 1024,
                        gzippedSize: 0.25 * 1024 * 1024,
                        modules: 120,
                    },
                    {
                        name: "ui",
                        size: 0.3 * 1024 * 1024,
                        gzippedSize: 0.1 * 1024 * 1024,
                        modules: 35,
                    },
                    {
                        name: "forms",
                        size: 0.1 * 1024 * 1024,
                        gzippedSize: 0.05 * 1024 * 1024,
                        modules: 15,
                    },
                ],
                assets: [
                    { name: "main.js", size: 0.8 * 1024 * 1024, type: "javascript" },
                    { name: "vendor.js", size: 1.2 * 1024 * 1024, type: "javascript" },
                    { name: "styles.css", size: 0.15 * 1024 * 1024, type: "stylesheet" },
                    { name: "fonts.woff2", size: 0.25 * 1024 * 1024, type: "font" },
                ],
                dependencies: [
                    {
                        name: "react",
                        size: 0.15 * 1024 * 1024,
                        version: "18.2.0",
                        treeshakeable: true,
                    },
                    {
                        name: "react-dom",
                        size: 0.25 * 1024 * 1024,
                        version: "18.2.0",
                        treeshakeable: true,
                    },
                    {
                        name: "@radix-ui/react-dialog",
                        size: 0.08 * 1024 * 1024,
                        version: "1.0.5",
                        treeshakeable: true,
                    },
                    {
                        name: "lucide-react",
                        size: 0.12 * 1024 * 1024,
                        version: "0.394.0",
                        treeshakeable: true,
                    },
                    {
                        name: "date-fns",
                        size: 0.18 * 1024 * 1024,
                        version: "3.6.0",
                        treeshakeable: true,
                    },
                ],
            };
            setStats(mockStats);
            generateRecommendations(mockStats);
        }
        catch (error) {
            console.error("Bundle analysis failed:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateRecommendations = (stats) => {
        const recs = [];
        // Check total bundle size
        if (stats.totalSize > 3 * 1024 * 1024) {
            recs.push("Bundle size is large (>3MB). Consider code splitting.");
        }
        // Check gzip ratio
        const gzipRatio = stats.gzippedSize / stats.totalSize;
        if (gzipRatio > 0.4) {
            recs.push("Poor gzip compression ratio. Consider optimizing text-based assets.");
        }
        // Check for large dependencies
        const largeDeps = stats.dependencies.filter((dep) => dep.size > 0.2 * 1024 * 1024);
        if (largeDeps.length > 0) {
            recs.push(`Large dependencies detected: ${largeDeps.map((d) => d.name).join(", ")}`);
        }
        // Check vendor chunk size
        const vendorChunk = stats.chunks.find((chunk) => chunk.name === "vendor");
        if (vendorChunk && vendorChunk.size > 1 * 1024 * 1024) {
            recs.push("Vendor chunk is large. Consider splitting vendor libraries.");
        }
        if (recs.length === 0) {
            recs.push("Bundle size is optimized! 🎉");
        }
        setRecommendations(recs);
    };
    const formatSize = (bytes) => {
        if (bytes === 0)
            return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const getPerformanceScore = () => {
        if (!stats)
            return 0;
        let score = 100;
        // Penalize large bundle size
        if (stats.totalSize > 3 * 1024 * 1024)
            score -= 30;
        else if (stats.totalSize > 2 * 1024 * 1024)
            score -= 15;
        else if (stats.totalSize > 1 * 1024 * 1024)
            score -= 5;
        // Penalize poor gzip ratio
        const gzipRatio = stats.gzippedSize / stats.totalSize;
        if (gzipRatio > 0.5)
            score -= 20;
        else if (gzipRatio > 0.4)
            score -= 10;
        // Penalize large chunks
        const largeChunks = stats.chunks.filter((chunk) => chunk.size > 1 * 1024 * 1024);
        score -= largeChunks.length * 10;
        return Math.max(0, score);
    };
    const performanceScore = getPerformanceScore();
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
    return (_jsx("div", { className: cn("space-y-6", className), children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-5 w-5" }), "Bundle Analyzer"] }), _jsx(CardDescription, { children: "Analyze bundle size and performance optimization opportunities" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: getScoreBadgeVariant(performanceScore), children: ["Score: ", performanceScore, "/100"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: analyzeBundleSize, disabled: loading, children: loading ? "Analyzing..." : "Re-analyze" })] })] }) }), _jsx(CardContent, { children: loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { children: "Analyzing bundle size and dependencies..." })] })) : stats ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: formatSize(stats.totalSize) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Size" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: formatSize(stats.gzippedSize) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Gzipped Size" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: stats.chunks.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Chunks" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: cn("text-2xl font-bold", getScoreColor(performanceScore)), children: performanceScore }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Score" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Performance Score" }), _jsxs("span", { className: cn("text-sm font-bold", getScoreColor(performanceScore)), children: [performanceScore, "/100"] })] }), _jsx(Progress, { value: performanceScore, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Optimization Recommendations"] }), _jsx("div", { className: "space-y-2", children: recommendations.map((rec, index) => (_jsxs("div", { className: "flex items-start gap-2 p-3 bg-muted rounded-lg", children: [rec.includes("🎉") ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" })) : (_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500 mt-0.5" })), _jsx("span", { className: "text-sm", children: rec })] }, index))) })] }), showDetails && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Chunks Breakdown"] }), _jsx("div", { className: "space-y-2", children: stats.chunks.map((chunk) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: chunk.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [chunk.modules, " modules"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatSize(chunk.size) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [formatSize(chunk.gzippedSize), " gzipped"] })] })] }, chunk.name))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Top Dependencies"] }), _jsx("div", { className: "space-y-2", children: stats.dependencies
                                                    .sort((a, b) => b.size - a.size)
                                                    .slice(0, 10)
                                                    .map((dep) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: dep.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["v", dep.version, dep.treeshakeable && (_jsx(Badge, { variant: "outline", className: "ml-2 text-xs", children: "Tree-shakeable" }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatSize(dep.size) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [((dep.size / stats.totalSize) * 100).toFixed(1), "%"] })] })] }, dep.name))) })] })] }))] })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Package, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Click \"Analyze\" to start bundle analysis" })] })) })] }) }));
};
export default BundleAnalyzer;
