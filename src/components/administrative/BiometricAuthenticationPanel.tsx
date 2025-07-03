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
  Fingerprint,
  Camera,
  Mic,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Smartphone,
  Lock,
  Unlock,
  Activity,
  Clock,
  User,
  Settings,
} from "lucide-react";

interface BiometricAuthenticationPanelProps {
  employeeId?: string;
  onAuthenticationSuccess?: (authData: any) => void;
  onAuthenticationFailure?: (error: string) => void;
}

interface BiometricMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  accuracy: number;
  lastUsed?: string;
  failureCount: number;
  status: "active" | "inactive" | "error" | "calibrating";
}

interface AuthenticationAttempt {
  id: string;
  method: string;
  timestamp: string;
  success: boolean;
  confidence: number;
  duration: number;
  location: string;
}

export default function BiometricAuthenticationPanel({
  employeeId = "EMP001",
  onAuthenticationSuccess,
  onAuthenticationFailure,
}: BiometricAuthenticationPanelProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticationProgress, setAuthenticationProgress] = useState(0);
  const [currentMethod, setCurrentMethod] = useState<string | null>(null);
  const [authenticationHistory, setAuthenticationHistory] = useState<
    AuthenticationAttempt[]
  >([
    {
      id: "AUTH-001",
      method: "Fingerprint",
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      success: true,
      confidence: 98.5,
      duration: 1.2,
      location: "Dubai Healthcare City",
    },
    {
      id: "AUTH-002",
      method: "Face Recognition",
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
      success: true,
      confidence: 96.8,
      duration: 2.1,
      location: "Dubai Healthcare City",
    },
    {
      id: "AUTH-003",
      method: "Fingerprint",
      timestamp: new Date(Date.now() - 900000).toLocaleTimeString(),
      success: false,
      confidence: 45.2,
      duration: 3.5,
      location: "Dubai Healthcare City",
    },
  ]);

  const [biometricMethods, setBiometricMethods] = useState<BiometricMethod[]>([
    {
      id: "fingerprint",
      name: "Fingerprint Scanner",
      icon: <Fingerprint className="w-5 h-5" />,
      enabled: true,
      accuracy: 99.2,
      lastUsed: new Date(Date.now() - 300000).toLocaleTimeString(),
      failureCount: 0,
      status: "active",
    },
    {
      id: "face",
      name: "Face Recognition",
      icon: <Camera className="w-5 h-5" />,
      enabled: true,
      accuracy: 97.8,
      lastUsed: new Date(Date.now() - 600000).toLocaleTimeString(),
      failureCount: 0,
      status: "active",
    },
    {
      id: "voice",
      name: "Voice Recognition",
      icon: <Mic className="w-5 h-5" />,
      enabled: false,
      accuracy: 94.5,
      lastUsed: undefined,
      failureCount: 0,
      status: "inactive",
    },
    {
      id: "iris",
      name: "Iris Scanner",
      icon: <Eye className="w-5 h-5" />,
      enabled: false,
      accuracy: 99.8,
      lastUsed: undefined,
      failureCount: 0,
      status: "inactive",
    },
  ]);

  const [securityMetrics, setSecurityMetrics] = useState({
    overallSecurityScore: 96.5,
    antiSpoofingActive: true,
    livelinessDetection: true,
    encryptionLevel: "AES-256",
    templateSecurity: "Encrypted",
    multiFactorEnabled: true,
    riskAssessment: "Low",
    complianceStatus: "DOH Compliant",
  });

  const handleBiometricAuthentication = async (methodId: string) => {
    setIsAuthenticating(true);
    setCurrentMethod(methodId);
    setAuthenticationProgress(0);

    const method = biometricMethods.find((m) => m.id === methodId);
    if (!method) return;

    // Simulate authentication progress
    const progressInterval = setInterval(() => {
      setAuthenticationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      const confidence = success
        ? 95 + Math.random() * 5
        : 30 + Math.random() * 40;

      const newAttempt: AuthenticationAttempt = {
        id: `AUTH-${Date.now()}`,
        method: method.name,
        timestamp: new Date().toLocaleTimeString(),
        success,
        confidence,
        duration: 1.5 + Math.random() * 2,
        location: "Dubai Healthcare City",
      };

      setAuthenticationHistory((prev) => [newAttempt, ...prev.slice(0, 9)]);

      if (success) {
        // Update method last used
        setBiometricMethods((prev) =>
          prev.map((m) =>
            m.id === methodId
              ? {
                  ...m,
                  lastUsed: new Date().toLocaleTimeString(),
                  failureCount: 0,
                }
              : m,
          ),
        );

        onAuthenticationSuccess?.({
          method: method.name,
          confidence,
          timestamp: new Date().toISOString(),
          employeeId,
        });
      } else {
        // Update failure count
        setBiometricMethods((prev) =>
          prev.map((m) =>
            m.id === methodId ? { ...m, failureCount: m.failureCount + 1 } : m,
          ),
        );

        onAuthenticationFailure?.(
          `${method.name} authentication failed. Confidence: ${confidence.toFixed(1)}%`,
        );
      }
    } catch (error) {
      onAuthenticationFailure?.(`Authentication error: ${error}`);
    } finally {
      setIsAuthenticating(false);
      setCurrentMethod(null);
      setAuthenticationProgress(0);
    }
  };

  const getMethodStatusBadge = (method: BiometricMethod) => {
    const variants = {
      active: "default" as const,
      inactive: "secondary" as const,
      error: "destructive" as const,
      calibrating: "outline" as const,
    };

    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
      error: <AlertTriangle className="w-3 h-3" />,
      calibrating: <Loader2 className="w-3 h-3 animate-spin" />,
    };

    return (
      <Badge
        variant={variants[method.status]}
        className="flex items-center gap-1"
      >
        {icons[method.status]}
        {method.status.charAt(0).toUpperCase() + method.status.slice(1)}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return <Badge variant="default">High</Badge>;
    if (confidence >= 80) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              TrueIn Biometric Authentication
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced biometric authentication with multi-factor security
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Security Score: {securityMetrics.overallSecurityScore}%
            </Badge>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {securityMetrics.overallSecurityScore}%
              </div>
              <p className="text-xs text-green-600">Overall Score</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Encryption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-900">
                {securityMetrics.encryptionLevel}
              </div>
              <p className="text-xs text-blue-600">Template Security</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-900">
                {securityMetrics.riskAssessment}
              </div>
              <p className="text-xs text-purple-600">Current Risk</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-orange-900">
                {securityMetrics.complianceStatus}
              </div>
              <p className="text-xs text-orange-600">Regulatory Status</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biometric Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                Available Biometric Methods
              </CardTitle>
              <CardDescription>
                Select a biometric method for authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {biometricMethods.map((method) => (
                <div key={method.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {method.icon}
                      </div>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-600">
                          Accuracy: {method.accuracy}%
                        </div>
                      </div>
                    </div>
                    {getMethodStatusBadge(method)}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Last Used:</span>
                    <span className="text-sm font-medium">
                      {method.lastUsed || "Never"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Failed Attempts:
                    </span>
                    <Badge
                      variant={
                        method.failureCount > 0 ? "destructive" : "default"
                      }
                    >
                      {method.failureCount}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleBiometricAuthentication(method.id)}
                    disabled={!method.enabled || isAuthenticating}
                    className="w-full"
                    variant={method.enabled ? "default" : "outline"}
                  >
                    {isAuthenticating && currentMethod === method.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        {method.icon}
                        <span className="ml-2">
                          {method.enabled ? "Authenticate" : "Disabled"}
                        </span>
                      </>
                    )}
                  </Button>

                  {isAuthenticating && currentMethod === method.id && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{authenticationProgress}%</span>
                      </div>
                      <Progress
                        value={authenticationProgress}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Authentication History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Authentication History
              </CardTitle>
              <CardDescription>
                Recent biometric authentication attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authenticationHistory.map((attempt) => (
                  <div key={attempt.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm">
                          {attempt.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {attempt.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        {getConfidenceBadge(attempt.confidence)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Time: {attempt.timestamp}</div>
                      <div>Duration: {attempt.duration}s</div>
                      <div>Confidence: {attempt.confidence.toFixed(1)}%</div>
                      <div>Location: {attempt.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Security Features
            </CardTitle>
            <CardDescription>
              Enhanced security and anti-spoofing measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Anti-Spoofing</span>
                  <Badge
                    variant={
                      securityMetrics.antiSpoofingActive
                        ? "default"
                        : "secondary"
                    }
                  >
                    {securityMetrics.antiSpoofingActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Prevents fake biometric attempts
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Liveliness Detection
                  </span>
                  <Badge
                    variant={
                      securityMetrics.livelinessDetection
                        ? "default"
                        : "secondary"
                    }
                  >
                    {securityMetrics.livelinessDetection
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Ensures live biometric samples
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Multi-Factor Auth</span>
                  <Badge
                    variant={
                      securityMetrics.multiFactorEnabled
                        ? "default"
                        : "secondary"
                    }
                  >
                    {securityMetrics.multiFactorEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Combines multiple authentication methods
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Template Security</span>
                  <Badge variant="default">
                    {securityMetrics.templateSecurity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Biometric templates are encrypted
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
