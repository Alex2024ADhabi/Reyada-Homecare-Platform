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
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  FileText,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: {
    name: string;
    size: number;
    gzippedSize: number;
    modules: number;
  }[];
  assets: {
    name: string;
    size: number;
    type: string;
  }[];
  dependencies: {
    name: string;
    size: number;
    version: string;
    treeshakeable: boolean;
  }[];
}

interface BundleAnalyzerProps {
  className?: string;
  showDetails?: boolean;
}

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  className,
  showDetails = false,
}) => {
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    analyzeBundleSize();
  }, []);

  const analyzeBundleSize = async () => {
    setLoading(true);
    try {
      // Simulate bundle analysis with realistic data
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockStats: BundleStats = {
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
    } catch (error) {
      console.error("Bundle analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (stats: BundleStats) => {
    const recs: string[] = [];

    // Check total bundle size
    if (stats.totalSize > 3 * 1024 * 1024) {
      recs.push("Bundle size is large (>3MB). Consider code splitting.");
    }

    // Check gzip ratio
    const gzipRatio = stats.gzippedSize / stats.totalSize;
    if (gzipRatio > 0.4) {
      recs.push(
        "Poor gzip compression ratio. Consider optimizing text-based assets.",
      );
    }

    // Check for large dependencies
    const largeDeps = stats.dependencies.filter(
      (dep) => dep.size > 0.2 * 1024 * 1024,
    );
    if (largeDeps.length > 0) {
      recs.push(
        `Large dependencies detected: ${largeDeps.map((d) => d.name).join(", ")}`,
      );
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

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPerformanceScore = (): number => {
    if (!stats) return 0;
    let score = 100;

    // Penalize large bundle size
    if (stats.totalSize > 3 * 1024 * 1024) score -= 30;
    else if (stats.totalSize > 2 * 1024 * 1024) score -= 15;
    else if (stats.totalSize > 1 * 1024 * 1024) score -= 5;

    // Penalize poor gzip ratio
    const gzipRatio = stats.gzippedSize / stats.totalSize;
    if (gzipRatio > 0.5) score -= 20;
    else if (gzipRatio > 0.4) score -= 10;

    // Penalize large chunks
    const largeChunks = stats.chunks.filter(
      (chunk) => chunk.size > 1 * 1024 * 1024,
    );
    score -= largeChunks.length * 10;

    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bundle Analyzer
              </CardTitle>
              <CardDescription>
                Analyze bundle size and performance optimization opportunities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadgeVariant(performanceScore)}>
                Score: {performanceScore}/100
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeBundleSize}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Re-analyze"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Analyzing bundle size and dependencies...</p>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatSize(stats.totalSize)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Size
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatSize(stats.gzippedSize)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gzipped Size
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.chunks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Chunks</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      getScoreColor(performanceScore),
                    )}
                  >
                    {performanceScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>

              {/* Performance Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      getScoreColor(performanceScore),
                    )}
                  >
                    {performanceScore}/100
                  </span>
                </div>
                <Progress value={performanceScore} className="h-2" />
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimization Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                    >
                      {rec.includes("🎉") ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      )}
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {showDetails && (
                <>
                  {/* Chunks Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Chunks Breakdown
                    </h4>
                    <div className="space-y-2">
                      {stats.chunks.map((chunk) => (
                        <div
                          key={chunk.name}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{chunk.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {chunk.modules} modules
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatSize(chunk.size)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatSize(chunk.gzippedSize)} gzipped
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Dependencies */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Top Dependencies
                    </h4>
                    <div className="space-y-2">
                      {stats.dependencies
                        .sort((a, b) => b.size - a.size)
                        .slice(0, 10)
                        .map((dep) => (
                          <div
                            key={dep.name}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{dep.name}</div>
                              <div className="text-sm text-muted-foreground">
                                v{dep.version}
                                {dep.treeshakeable && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs"
                                  >
                                    Tree-shakeable
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatSize(dep.size)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {((dep.size / stats.totalSize) * 100).toFixed(
                                  1,
                                )}
                                %
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Analyze" to start bundle analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BundleAnalyzer;
