import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Server,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Smartphone,
  Wifi,
  UserCheck,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { zeroTrustSecurityService } from "@/services/zero-trust-security.service";

interface SecurityMetrics {
  totalPolicies: number;
  activePolicies: number;
  microSegments: number;
  threatIndicators: number;
  recentAuthEvents: number;
  averageTrustScore: number;
  highRiskSessions: number;
}

interface SecurityEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: string;
  resource: string;
  action: string;
  decision: "allow" | "deny" | "challenge";
  riskScore: number;
  timestamp: string;
  responseTime: number;
}

interface TrustScoreData {
  overall: number;
  device: number;
  network: number;
  behavior: number;
}

const ZeroTrustDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalPolicies: 0,
    activePolicies: 0,
    microSegments: 0,
    threatIndicators: 0,
    recentAuthEvents: 0,
    averageTrustScore: 0,
    highRiskSessions: 0,
  });

  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [trustScores, setTrustScores] = useState<TrustScoreData>({
    overall: 85,
    device: 82,
    network: 88,
    behavior: 85,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load security metrics
      const securityMetrics = zeroTrustSecurityService.getSecurityMetrics();
      setMetrics(securityMetrics);

      // Load recent security events
      const events = zeroTrustSecurityService.getRecentSecurityEvents(20);
      setRecentEvents(events);

      // Simulate trust score updates (in production, this would come from the service)
      setTrustScores({
        overall: securityMetrics.averageTrustScore || 85,
        device: Math.max(0, securityMetrics.averageTrustScore - 3),
        network: Math.min(100, securityMetrics.averageTrustScore + 3),
        behavior: securityMetrics.averageTrustScore,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getTrustScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "allow":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "deny":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "challenge":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatResponseTime = (ms: number) => {
    return `${ms}ms`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Zero Trust Security Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive security monitoring with "Never Trust, Always
              Verify" principles
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Last Updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button onClick={loadDashboardData} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Security Status Alert */}
        {metrics.highRiskSessions > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              High Risk Sessions Detected
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {metrics.highRiskSessions} active sessions have been flagged as
              high risk. Immediate review recommended.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <Shield
                className={`h-4 w-4 ${getTrustScoreColor(trustScores.overall)}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trustScores.overall}%</div>
              <Progress value={trustScores.overall} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Average across all active sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Policies
              </CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activePolicies}</div>
              <p className="text-xs text-muted-foreground">
                of {metrics.totalPolicies} total policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Micro Segments
              </CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.microSegments}</div>
              <p className="text-xs text-muted-foreground">
                Network isolation segments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Threat Indicators
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.threatIndicators}
              </div>
              <p className="text-xs text-muted-foreground">
                Active threat intelligence
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trust-scores">Trust Scores</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trust Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Trust Score Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of trust factors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Device Trust
                        </span>
                      </div>
                      <Badge
                        variant={getTrustScoreBadgeVariant(trustScores.device)}
                      >
                        {trustScores.device}%
                      </Badge>
                    </div>
                    <Progress value={trustScores.device} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Network Trust
                        </span>
                      </div>
                      <Badge
                        variant={getTrustScoreBadgeVariant(trustScores.network)}
                      >
                        {trustScores.network}%
                      </Badge>
                    </div>
                    <Progress value={trustScores.network} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Behavior Trust
                        </span>
                      </div>
                      <Badge
                        variant={getTrustScoreBadgeVariant(
                          trustScores.behavior,
                        )}
                      >
                        {trustScores.behavior}%
                      </Badge>
                    </div>
                    <Progress value={trustScores.behavior} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest security events and decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getDecisionIcon(event.decision)}
                          <div>
                            <p className="text-sm font-medium">
                              {event.resource}
                            </p>
                            <p className="text-xs text-gray-600">
                              {event.action}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              event.decision === "allow"
                                ? "default"
                                : event.decision === "deny"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {event.decision}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatResponseTime(event.responseTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Access Decisions (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Allowed</span>
                      <span className="text-sm font-medium text-green-600">
                        {
                          recentEvents.filter((e) => e.decision === "allow")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Denied</span>
                      <span className="text-sm font-medium text-red-600">
                        {
                          recentEvents.filter((e) => e.decision === "deny")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Challenged</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {
                          recentEvents.filter((e) => e.decision === "challenge")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Low Risk</span>
                      <span className="text-sm font-medium text-green-600">
                        {recentEvents.filter((e) => e.riskScore < 30).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Medium Risk</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {
                          recentEvents.filter(
                            (e) => e.riskScore >= 30 && e.riskScore < 70,
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">High Risk</span>
                      <span className="text-sm font-medium text-red-600">
                        {recentEvents.filter((e) => e.riskScore >= 70).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Avg Response
                      </span>
                      <span className="text-sm font-medium">
                        {recentEvents.length > 0
                          ? Math.round(
                              recentEvents.reduce(
                                (sum, e) => sum + e.responseTime,
                                0,
                              ) / recentEvents.length,
                            )
                          : 0}
                        ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Events
                      </span>
                      <span className="text-sm font-medium">
                        {metrics.recentAuthEvents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Success Rate
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {recentEvents.length > 0
                          ? Math.round(
                              (recentEvents.filter(
                                (e) => e.decision === "allow",
                              ).length /
                                recentEvents.length) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trust Scores Tab */}
          <TabsContent value="trust-scores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trust Score Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of trust factors and scoring methodology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Current Scores</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Overall Trust Score
                          </span>
                          <Badge
                            variant={getTrustScoreBadgeVariant(
                              trustScores.overall,
                            )}
                            className="text-lg px-3 py-1"
                          >
                            {trustScores.overall}%
                          </Badge>
                        </div>
                        <Progress value={trustScores.overall} className="h-3" />
                        <p className="text-sm text-gray-600 mt-2">
                          Weighted average of all trust factors
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Trust Factors</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            Device Trust
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {trustScores.device}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            Network Trust
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {trustScores.network}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            Behavior Trust
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {trustScores.behavior}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Events Log</CardTitle>
                <CardDescription>
                  Comprehensive log of all security-related events and decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDecisionIcon(event.decision)}
                          <div>
                            <p className="font-medium">{event.resource}</p>
                            <p className="text-sm text-gray-600">
                              {event.action} by User {event.userId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              event.decision === "allow"
                                ? "default"
                                : event.decision === "deny"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {event.decision.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            Risk: {event.riskScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Session: {event.sessionId.substring(0, 8)}...
                        </span>
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span>
                          Response: {formatResponseTime(event.responseTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zero Trust Policies</CardTitle>
                <CardDescription>
                  Active security policies governing access decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          Healthcare Data Access
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Strict access control for patient health information
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="outline">High</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>MFA Required:</span>
                          <Badge variant="default">Yes</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">
                          Administrative Access
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Enhanced security for administrative functions
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="outline">Critical</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Re-auth Required:</span>
                          <Badge variant="default">Yes</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldX className="h-4 w-4 text-red-600" />
                        <span className="font-medium">High Risk Block</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Block access for high-risk contexts
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="destructive">Critical</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Action:</span>
                          <Badge variant="destructive">Block</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <CardDescription>
                  Active threat indicators and security intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">
                          Malware Detection
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Known malware signature detected in system
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge variant="destructive">High</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span className="text-red-700">
                            Internal Detection
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="destructive">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          Brute Force Pattern
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        Brute force attack pattern detected
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge variant="secondary">Medium</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span className="text-yellow-700">
                            Behavioral Analysis
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="secondary">Monitoring</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Threat Mitigation Actions
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Automated IP blocking enabled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Enhanced monitoring activated
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Security team notifications sent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ZeroTrustDashboard;
