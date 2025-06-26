/**
 * Signature Preview and Confirmation Component
 * P3-002.2.4: Signature Preview and Confirmation System
 *
 * Advanced signature preview with security watermarks, verification interface,
 * comparison tools, and compliance confirmation dialogs.
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  Shield,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  Zap,
  FileText,
  Clock,
  User,
  Fingerprint,
  Lock,
  Verified,
  Compare,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignatureData } from "./signature-capture";

export interface SignaturePreviewProps {
  signature: SignatureData;
  referenceSignature?: SignatureData;
  documentInfo?: {
    id: string;
    type: string;
    title: string;
    createdAt: string;
  };
  signerInfo?: {
    name: string;
    role: string;
    id: string;
    email?: string;
  };
  securityLevel?: "standard" | "high" | "maximum";
  showWatermark?: boolean;
  showComparison?: boolean;
  onConfirm?: (confirmed: boolean, metadata?: any) => void;
  onExport?: (format: "pdf" | "png" | "svg") => void;
  complianceChecks?: {
    id: string;
    label: string;
    required: boolean;
    checked: boolean;
  }[];
  className?: string;
}

const SignaturePreviewConfirmation: React.FC<SignaturePreviewProps> = ({
  signature,
  referenceSignature,
  documentInfo,
  signerInfo,
  securityLevel = "standard",
  showWatermark = true,
  showComparison = false,
  onConfirm,
  onExport,
  complianceChecks = [],
  className,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [complianceState, setComplianceState] = useState<
    Record<string, boolean>
  >({});
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [comparisonScore, setComparisonScore] = useState<number | null>(null);
  const [watermarkCanvas, setWatermarkCanvas] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkRef = useRef<HTMLCanvasElement>(null);

  // Initialize compliance state
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    complianceChecks.forEach((check) => {
      initialState[check.id] = check.checked;
    });
    setComplianceState(initialState);
  }, [complianceChecks]);

  // Generate watermarked signature
  useEffect(() => {
    if (!showWatermark || !signature.imageData) return;

    const canvas = watermarkRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original signature
      ctx.drawImage(img, 0, 0);

      // Add security watermark
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#ff0000";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.rotate(-Math.PI / 6);

      const watermarkText = `VERIFIED • ${new Date().toISOString().split("T")[0]} • ${signerInfo?.name || "SIGNED"}`;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.fillText(
            watermarkText,
            (canvas.width / 3) * (i + 0.5),
            (canvas.height / 2) * (j + 0.5),
          );
        }
      }
      ctx.restore();

      // Add security border
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      setWatermarkCanvas(canvas.toDataURL());
    };
    img.src = signature.imageData;
  }, [signature.imageData, showWatermark, signerInfo?.name]);

  // Calculate signature comparison score
  useEffect(() => {
    if (!referenceSignature || !showComparison) return;

    // Simplified comparison algorithm
    const calculateSimilarity = () => {
      const sig1 = signature.strokes;
      const sig2 = referenceSignature.strokes;

      if (!sig1.length || !sig2.length) return 0;

      // Compare stroke counts
      const strokeCountSimilarity =
        1 -
        Math.abs(sig1.length - sig2.length) /
          Math.max(sig1.length, sig2.length);

      // Compare average pressure
      const avgPressure1 =
        sig1.reduce((sum, s) => sum + s.pressure, 0) / sig1.length;
      const avgPressure2 =
        sig2.reduce((sum, s) => sum + s.pressure, 0) / sig2.length;
      const pressureSimilarity = 1 - Math.abs(avgPressure1 - avgPressure2);

      // Compare bounding box ratios
      const bb1 = signature.boundingBox;
      const bb2 = referenceSignature.boundingBox;
      const ratio1 = (bb1.maxX - bb1.minX) / (bb1.maxY - bb1.minY);
      const ratio2 = (bb2.maxX - bb2.minX) / (bb2.maxY - bb2.minY);
      const ratioSimilarity =
        1 - Math.abs(ratio1 - ratio2) / Math.max(ratio1, ratio2);

      // Weighted average
      const score =
        (strokeCountSimilarity * 0.3 +
          pressureSimilarity * 0.3 +
          ratioSimilarity * 0.4) *
        100;
      return Math.round(Math.max(0, Math.min(100, score)));
    };

    setComparisonScore(calculateSimilarity());
  }, [signature, referenceSignature, showComparison]);

  const handleComplianceChange = (checkId: string, checked: boolean) => {
    setComplianceState((prev) => ({ ...prev, [checkId]: checked }));
  };

  const canConfirm = () => {
    const requiredChecks = complianceChecks.filter((check) => check.required);
    return requiredChecks.every((check) => complianceState[check.id]);
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;

    const metadata = {
      confirmedAt: new Date().toISOString(),
      complianceChecks: complianceState,
      securityLevel,
      watermarkApplied: showWatermark,
      comparisonScore,
      deviceInfo: signature.metadata.deviceInfo,
    };

    setIsConfirmed(true);
    onConfirm?.(true, metadata);
  };

  const getSecurityLevelColor = () => {
    switch (securityLevel) {
      case "maximum":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getComparisonColor = () => {
    if (comparisonScore === null) return "text-gray-600";
    if (comparisonScore >= 80) return "text-green-600";
    if (comparisonScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Signature Preview & Confirmation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", getSecurityLevelColor())}>
                <Shield className="h-3 w-3 mr-1" />
                {securityLevel.toUpperCase()}
              </Badge>
              {isConfirmed && (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  CONFIRMED
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signature Preview */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Signature Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="watermarked" disabled={!showWatermark}>
                  Watermarked
                </TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={signature.imageData}
                    alt="Original signature"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="watermarked" className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  {watermarkCanvas ? (
                    <img
                      src={watermarkCanvas}
                      alt="Watermarked signature"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: "200px" }}
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-500">
                      Generating watermark...
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Signature Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Strokes:</span>
                  <span>{signature.metadata.strokeCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Duration:</span>
                  <span>
                    {(signature.metadata.totalTime / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Complexity:</span>
                  <span>
                    {signature.metadata.signatureComplexity.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Method:</span>
                  <span className="capitalize">
                    {signature.metadata.captureMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("png")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("pdf")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("svg")}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                SVG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification & Compliance */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Verification & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Information */}
            {documentInfo && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Document Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {documentInfo.id}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {documentInfo.type}
                  </div>
                  <div>
                    <span className="font-medium">Title:</span>{" "}
                    {documentInfo.title}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(documentInfo.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Signer Information */}
            {signerInfo && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Signer Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {signerInfo.name}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {signerInfo.role}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {signerInfo.id}
                  </div>
                  {signerInfo.email && (
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {signerInfo.email}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature Comparison */}
            {showComparison && referenceSignature && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Compare className="h-4 w-4" />
                  Signature Comparison
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Similarity Score</span>
                    <span
                      className={cn("font-bold text-lg", getComparisonColor())}
                    >
                      {comparisonScore !== null
                        ? `${comparisonScore}%`
                        : "Calculating..."}
                    </span>
                  </div>
                  {comparisonScore !== null && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-500",
                            comparisonScore >= 80
                              ? "bg-green-500"
                              : comparisonScore >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${comparisonScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {comparisonScore >= 80
                          ? "High similarity"
                          : comparisonScore >= 60
                            ? "Moderate similarity"
                            : "Low similarity"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Checks */}
            {complianceChecks.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Compliance Verification</h4>
                <div className="space-y-2">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={check.id}
                        checked={complianceState[check.id] || false}
                        onCheckedChange={(checked) =>
                          handleComplianceChange(check.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={check.id}
                        className="text-sm leading-5 cursor-pointer"
                      >
                        {check.label}
                        {check.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Details */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                className="flex items-center gap-2 p-0 h-auto"
              >
                <Lock className="h-4 w-4" />
                Security Details
              </Button>
              {showSecurityDetails && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                  <div>
                    <span className="font-medium">Security Level:</span>{" "}
                    {securityLevel}
                  </div>
                  <div>
                    <span className="font-medium">Watermark:</span>{" "}
                    {showWatermark ? "Applied" : "Not applied"}
                  </div>
                  <div>
                    <span className="font-medium">Device:</span>{" "}
                    {signature.metadata.deviceType}
                  </div>
                  <div>
                    <span className="font-medium">Platform:</span>{" "}
                    {signature.metadata.deviceInfo.platform}
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>{" "}
                    {new Date().toISOString()}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <Separator />
            <div className="space-y-3">
              {!canConfirm() && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete all required compliance checks before
                    confirming.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!canConfirm() || isConfirmed}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                {isConfirmed ? (
                  <>
                    <Verified className="h-5 w-5" />
                    Signature Confirmed
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm Signature
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for watermark generation */}
      <canvas ref={watermarkRef} style={{ display: "none" }} />
    </div>
  );
};

export default SignaturePreviewConfirmation;
