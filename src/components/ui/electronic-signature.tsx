/**
 * Electronic Signature Component
 * DOH compliance requirement for clinical documentation
 */

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  PenTool,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Shield,
  Clock,
  User,
  FileText,
  Smartphone,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface ElectronicSignatureProps {
  documentId: string;
  documentType: string;
  onSignatureComplete: (signatureData: SignatureData) => void;
  onCancel?: () => void;
  className?: string;
  required?: boolean;
  biometricEnabled?: boolean;
}

interface SignatureData {
  signatureImage: string;
  timestamp: string;
  userId: string;
  userFullName: string;
  userRole: string;
  licenseNumber?: string;
  documentId: string;
  documentType: string;
  ipAddress?: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
    touchSupported: boolean;
  };
  biometricData?: {
    verified: boolean;
    method: string;
    confidence: number;
  };
  signatureMetadata: {
    strokeCount: number;
    totalTime: number;
    averagePressure: number;
    signatureComplexity: number;
  };
  complianceFlags: string[];
  auditTrail: any[];
}

interface SignatureStroke {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export const ElectronicSignature: React.FC<ElectronicSignatureProps> = ({
  documentId,
  documentType,
  onSignatureComplete,
  onCancel,
  className,
  required = true,
  biometricEnabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureStrokes, setSignatureStrokes] = useState<SignatureStroke[]>(
    [],
  );
  const [signatureStartTime, setSignatureStartTime] = useState<number>(0);
  const [currentStroke, setCurrentStroke] = useState<SignatureStroke[]>([]);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureReason, setSignatureReason] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [complianceChecks, setComplianceChecks] = useState<string[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  const { userProfile } = useSupabaseAuth();

  useEffect(() => {
    initializeSignatureEnvironment();
    addAuditEntry("signature_initiated", {
      documentId,
      documentType,
      userId: userProfile?.id,
    });
  }, []);

  const initializeSignatureEnvironment = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ),
      touchSupported: "ontouchstart" in window,
      timestamp: new Date().toISOString(),
    };

    setDeviceInfo(info);

    const checks = [];
    if (!userProfile) checks.push("NO_USER_AUTHENTICATION");
    if (!userProfile?.license_number) checks.push("NO_LICENSE_NUMBER");
    if (info.isMobile && !info.touchSupported)
      checks.push("MOBILE_NO_TOUCH_SUPPORT");

    setComplianceChecks(checks);
    addAuditEntry("environment_initialized", {
      deviceInfo: info,
      complianceChecks: checks,
    });
  };

  const addAuditEntry = (action: string, details: any) => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: userProfile?.id,
    };
    setAuditTrail((prev) => [...prev, entry]);
  };

  const startDrawing = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!canvasRef.current) return;

    setIsDrawing(true);
    setSignatureStartTime(Date.now());

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX,
      clientY,
      pressure = 0.5;

    if ("touches" in event) {
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      pressure = (touch as any).force || 0.5;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
      pressure = (event as any).pressure || 0.5;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const stroke: SignatureStroke = { x, y, pressure, timestamp: Date.now() };
    setCurrentStroke([stroke]);

    addAuditEntry("signature_drawing_started", {
      startPoint: { x, y },
      pressure,
      device: deviceInfo?.isMobile ? "mobile" : "desktop",
    });
  };

  const draw = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || !canvasRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX,
      clientY,
      pressure = 0.5;

    if ("touches" in event) {
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      pressure = (touch as any).force || 0.5;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
      pressure = (event as any).pressure || 0.5;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const stroke: SignatureStroke = { x, y, pressure, timestamp: Date.now() };
    setCurrentStroke((prev) => [...prev, stroke]);

    ctx.lineWidth = Math.max(1, pressure * 3);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";

    if (currentStroke.length > 0) {
      const lastStroke = currentStroke[currentStroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastStroke.x, lastStroke.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setSignatureStrokes((prev) => [...prev, ...currentStroke]);
    setCurrentStroke([]);
    addAuditEntry("signature_stroke_completed", {
      strokeLength: currentStroke.length,
      duration: Date.now() - signatureStartTime,
    });
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureStrokes([]);
    setCurrentStroke([]);
    setSignatureComplete(false);

    addAuditEntry("signature_cleared", {
      previousStrokeCount: signatureStrokes.length,
    });
  };

  const calculateSignatureMetadata = () => {
    const totalStrokes = signatureStrokes.length;
    const totalTime =
      signatureStrokes.length > 0
        ? Math.max(...signatureStrokes.map((s) => s.timestamp)) -
          Math.min(...signatureStrokes.map((s) => s.timestamp))
        : 0;

    const averagePressure =
      signatureStrokes.length > 0
        ? signatureStrokes.reduce((sum, stroke) => sum + stroke.pressure, 0) /
          signatureStrokes.length
        : 0;

    const uniquePoints = new Set(
      signatureStrokes.map((s) => `${Math.round(s.x)},${Math.round(s.y)}`),
    ).size;
    const signatureComplexity =
      (uniquePoints / Math.max(1, totalStrokes)) * 100;

    return {
      strokeCount: totalStrokes,
      totalTime,
      averagePressure,
      signatureComplexity,
    };
  };

  const performBiometricVerification = async (): Promise<{
    verified: boolean;
    method: string;
    confidence: number;
  }> => {
    if (!biometricEnabled)
      return { verified: false, method: "none", confidence: 0 };

    try {
      if ("credentials" in navigator) {
        const credential = await (navigator as any).credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Reyada Homecare" },
            user: {
              id: new TextEncoder().encode(userProfile?.id || "unknown"),
              name: userProfile?.email || "unknown",
              displayName: userProfile?.full_name || "Unknown User",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        if (credential)
          return { verified: true, method: "webauthn", confidence: 95 };
      }

      return { verified: false, method: "unavailable", confidence: 0 };
    } catch (error) {
      console.error("Biometric verification failed:", error);
      return { verified: false, method: "failed", confidence: 0 };
    }
  };

  const completeSignature = async () => {
    if (signatureStrokes.length === 0) {
      alert("Please provide a signature before completing.");
      return;
    }

    if (!userProfile) {
      alert("User authentication required for electronic signature.");
      return;
    }

    setIsProcessing(true);

    try {
      let biometricData;
      if (biometricEnabled) {
        biometricData = await performBiometricVerification();
        setBiometricVerified(biometricData.verified);
      }

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");

      const signatureImage = canvas.toDataURL("image/png");
      const metadata = calculateSignatureMetadata();

      const finalComplianceFlags = [...complianceChecks];
      if (metadata.strokeCount < 10)
        finalComplianceFlags.push("SIMPLE_SIGNATURE");
      if (metadata.totalTime < 1000)
        finalComplianceFlags.push("FAST_SIGNATURE");
      if (biometricEnabled && !biometricData?.verified)
        finalComplianceFlags.push("BIOMETRIC_NOT_VERIFIED");

      const signatureData: SignatureData = {
        signatureImage,
        timestamp: new Date().toISOString(),
        userId: userProfile.id,
        userFullName: userProfile.full_name,
        userRole: userProfile.role,
        licenseNumber: userProfile.license_number,
        documentId,
        documentType,
        deviceInfo: deviceInfo || {},
        biometricData,
        signatureMetadata: metadata,
        complianceFlags: finalComplianceFlags,
        auditTrail: [
          ...auditTrail,
          {
            timestamp: new Date().toISOString(),
            action: "signature_completed",
            details: { metadata, complianceFlags: finalComplianceFlags },
          },
        ],
      };

      setSignatureComplete(true);
      addAuditEntry("signature_completed", { signatureData });

      onSignatureComplete(signatureData);
    } catch (error) {
      console.error("Signature completion failed:", error);
      alert("Failed to complete signature. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto bg-white", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Electronic Signature - DOH Compliant
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant={userProfile ? "default" : "destructive"}>
              <User className="h-3 w-3 mr-1" />
              {userProfile ? "Authenticated" : "Not Authenticated"}
            </Badge>
            <Badge variant={deviceInfo?.isMobile ? "secondary" : "default"}>
              {deviceInfo?.isMobile ? (
                <Smartphone className="h-3 w-3 mr-1" />
              ) : (
                <Monitor className="h-3 w-3 mr-1" />
              )}
              {deviceInfo?.isMobile ? "Mobile" : "Desktop"}
            </Badge>
            {biometricEnabled && (
              <Badge variant={biometricVerified ? "default" : "outline"}>
                <Shield className="h-3 w-3 mr-1" />
                Biometric {biometricVerified ? "Verified" : "Pending"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {complianceChecks.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Compliance Issues: {complianceChecks.join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signatureReason">Signature Purpose *</Label>
              <Textarea
                id="signatureReason"
                placeholder="Enter the reason for this signature..."
                value={signatureReason}
                onChange={(e) => setSignatureReason(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="witnessName">Witness Name (Optional)</Label>
              <Input
                id="witnessName"
                placeholder="Enter witness name if applicable"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                Digital Signature Pad
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  disabled={signatureStrokes.length === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                className="w-full h-48 border border-gray-200 rounded cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: "none" }}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                {deviceInfo?.isMobile
                  ? "Use your finger to sign above"
                  : "Click and drag to sign above"}
              </p>
            </div>
          </div>

          {signatureStrokes.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Signature Metadata</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Strokes:</span>
                  <span className="ml-2 font-medium">
                    {signatureStrokes.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Complexity:</span>
                  <span className="ml-2 font-medium">
                    {calculateSignatureMetadata().signatureComplexity.toFixed(
                      1,
                    )}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="ml-2 font-medium">
                    {(calculateSignatureMetadata().totalTime / 1000).toFixed(1)}
                    s
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pressure:</span>
                  <span className="ml-2 font-medium">
                    {(
                      calculateSignatureMetadata().averagePressure * 100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Timestamp: {new Date().toLocaleString()}</span>
            </div>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={completeSignature}
                disabled={
                  signatureStrokes.length === 0 ||
                  !signatureReason.trim() ||
                  isProcessing
                }
                className="min-w-32"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Complete Signature
                  </>
                )}
              </Button>
            </div>
          </div>

          {signatureComplete && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Electronic signature completed successfully and recorded for DOH
                compliance.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectronicSignature;
