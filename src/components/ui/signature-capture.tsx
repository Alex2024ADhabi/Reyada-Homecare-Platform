/**
 * Signature Capture Component
 * P3-002.2.1: Signature Capture Component
 *
 * Advanced signature capture with touch/stylus/mouse support,
 * mobile optimization, and real-time validation.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Pen,
  RotateCcw,
  Check,
  X,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignatureStroke {
  x: number;
  y: number;
  timestamp: number;
  pressure: number;
  velocity?: number;
  tiltX?: number;
  tiltY?: number;
}

export interface SignatureData {
  strokes: SignatureStroke[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  metadata: {
    totalTime: number;
    strokeCount: number;
    averagePressure: number;
    signatureComplexity: number;
    deviceType: string;
    touchSupported: boolean;
    captureMethod: "touch" | "mouse" | "stylus";
    deviceInfo: {
      userAgent: string;
      platform: string;
      screenResolution: string;
      pixelRatio: number;
    };
  };
  imageData: string; // Base64 encoded signature image
}

export interface SignatureCaptureProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onSignatureChange?: (signature: SignatureData | null) => void;
  onSignatureComplete?: (signature: SignatureData) => void;
  onValidationChange?: (isValid: boolean, issues: string[]) => void;
  validationRules?: {
    minStrokes?: number;
    minDuration?: number;
    minComplexity?: number;
    maxComplexity?: number;
    requirePressure?: boolean;
  };
  showPreview?: boolean;
  showValidation?: boolean;
  mobileOptimized?: boolean;
  className?: string;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  width = 400,
  height = 200,
  penColor = "#1e40af",
  penWidth = 2,
  backgroundColor = "#ffffff",
  placeholder = "Sign here",
  disabled = false,
  required = false,
  onSignatureChange,
  onSignatureComplete,
  onValidationChange,
  validationRules = {
    minStrokes: 3,
    minDuration: 500,
    minComplexity: 10,
    maxComplexity: 90,
    requirePressure: false,
  },
  showPreview = true,
  showValidation = true,
  mobileOptimized = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<SignatureStroke[]>([]);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(
    null,
  );
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
    score: number;
  }>({ isValid: false, issues: [], score: 0 });
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [captureMethod, setCaptureMethod] = useState<
    "touch" | "mouse" | "stylus"
  >("mouse");
  const [startTime, setStartTime] = useState<number>(0);
  const [lastPoint, setLastPoint] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    renderTime: number;
    strokeLatency: number;
    memoryUsage: number;
    frameRate: number;
  }>({ renderTime: 0, strokeLatency: 0, memoryUsage: 0, frameRate: 0 });
  const [offlineCapable, setOfflineCapable] = useState(false);
  const [offlineData, setOfflineData] = useState<SignatureData[]>([]);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  // Detect device capabilities and performance metrics
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupported: "ontouchstart" in window,
      pointerSupported: "onpointerdown" in window,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ),
      // Enhanced device metrics
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || "unknown",
      connection: (navigator as any).connection || null,
      // Pressure sensitivity detection
      pressureSensitive:
        "ontouchstart" in window && "force" in TouchEvent.prototype,
      stylusSupported: "onpointerdown" in window,
      // Performance capabilities
      webGL: !!document.createElement("canvas").getContext("webgl"),
      webGL2: !!document.createElement("canvas").getContext("webgl2"),
      // Offline capabilities
      serviceWorker: "serviceWorker" in navigator,
      indexedDB: "indexedDB" in window,
    };
    setDeviceInfo(info);

    // Check offline capabilities
    setOfflineCapable(info.serviceWorker && info.indexedDB);

    // Start performance monitoring
    const performanceInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastFrameTimeRef.current;
      const fps =
        frameCountRef.current > 0
          ? 1000 / (timeDiff / frameCountRef.current)
          : 0;

      setPerformanceMetrics((prev) => ({
        ...prev,
        frameRate: Math.round(fps),
        memoryUsage: (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0,
      }));

      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }, 1000);

    return () => clearInterval(performanceInterval);
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw placeholder if no signature
    if (strokes.length === 0 && !disabled) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(placeholder, rect.width / 2, rect.height / 2);
    }
  }, [
    width,
    height,
    penColor,
    penWidth,
    backgroundColor,
    placeholder,
    strokes.length,
    disabled,
  ]);

  // Enhanced point extraction with pressure sensitivity and performance tracking
  const getPointFromEvent = useCallback(
    (
      event: any,
    ): {
      x: number;
      y: number;
      pressure: number;
      tiltX?: number;
      tiltY?: number;
    } => {
      const startTime = performance.now();
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

      const rect = canvas.getBoundingClientRect();
      let clientX,
        clientY,
        pressure = 0.5,
        tiltX,
        tiltY;

      if (event.touches && event.touches.length > 0) {
        // Enhanced touch event handling
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;

        // Advanced pressure detection
        if ("force" in touch && touch.force > 0) {
          pressure = Math.min(Math.max(touch.force, 0.1), 1.0);
        } else if ("webkitForce" in touch) {
          pressure = Math.min(Math.max((touch as any).webkitForce, 0.1), 1.0);
        } else {
          // Estimate pressure from touch radius if available
          const radiusX = (touch as any).radiusX || 0;
          const radiusY = (touch as any).radiusY || 0;
          if (radiusX > 0 || radiusY > 0) {
            const avgRadius = (radiusX + radiusY) / 2;
            pressure = Math.min(Math.max(avgRadius / 20, 0.3), 1.0);
          }
        }
        setCaptureMethod("touch");
      } else if (event.pointerType === "pen") {
        // Enhanced stylus event handling
        clientX = event.clientX;
        clientY = event.clientY;
        pressure = event.pressure || 0.5;
        tiltX = event.tiltX || 0;
        tiltY = event.tiltY || 0;
        setCaptureMethod("stylus");
      } else {
        // Mouse event with simulated pressure
        clientX = event.clientX;
        clientY = event.clientY;
        // Simulate pressure based on mouse button state
        pressure = event.buttons === 1 ? 0.7 : 0.5;
        setCaptureMethod("mouse");
      }

      // Track performance metrics
      const endTime = performance.now();
      setPerformanceMetrics((prev) => ({
        ...prev,
        strokeLatency: endTime - startTime,
      }));

      frameCountRef.current++;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        pressure,
        tiltX,
        tiltY,
      };
    },
    [],
  );

  // Calculate velocity
  const calculateVelocity = useCallback(
    (
      current: { x: number; y: number; time: number },
      previous: { x: number; y: number; time: number } | null,
    ): number => {
      if (!previous) return 0;

      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const dt = current.time - previous.time;

      if (dt === 0) return 0;

      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance / dt;
    },
    [],
  );

  // Start drawing
  const startDrawing = useCallback(
    (event: any) => {
      if (disabled) return;

      event.preventDefault();
      setIsDrawing(true);
      setStartTime(Date.now());

      const point = getPointFromEvent(event);
      const timestamp = Date.now();

      const stroke: SignatureStroke = {
        x: point.x,
        y: point.y,
        timestamp,
        pressure: point.pressure,
        velocity: 0,
        tiltX: point.tiltX,
        tiltY: point.tiltY,
      };

      setCurrentStroke([stroke]);
      setLastPoint({ x: point.x, y: point.y, time: timestamp });

      // Draw point
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, penWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [disabled, getPointFromEvent, penWidth],
  );

  // Continue drawing
  const continueDrawing = useCallback(
    (event: any) => {
      if (!isDrawing || disabled) return;

      event.preventDefault();

      const point = getPointFromEvent(event);
      const timestamp = Date.now();
      const velocity = calculateVelocity(
        { x: point.x, y: point.y, time: timestamp },
        lastPoint,
      );

      const stroke: SignatureStroke = {
        x: point.x,
        y: point.y,
        timestamp,
        pressure: point.pressure,
        velocity,
        tiltX: point.tiltX,
        tiltY: point.tiltY,
      };

      setCurrentStroke((prev) => [...prev, stroke]);
      setLastPoint({ x: point.x, y: point.y, time: timestamp });

      // Draw line
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    },
    [
      isDrawing,
      disabled,
      getPointFromEvent,
      calculateVelocity,
      lastPoint,
      penWidth,
    ],
  );

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setStrokes((prev) => [...prev, ...currentStroke]);
    setCurrentStroke([]);
    setLastPoint(null);
  }, [isDrawing, currentStroke]);

  // Clear signature
  const clearSignature = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setSignatureData(null);
    setValidationResult({ isValid: false, issues: [], score: 0 });
    setIsDrawing(false);
    setLastPoint(null);

    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Redraw placeholder
      ctx.fillStyle = "#9ca3af";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(placeholder, rect.width / 2, rect.height / 2);
    }

    onSignatureChange?.(null);

    // Save to offline storage if available
    if (offlineCapable) {
      setOfflineData([]);
    }
  }, [backgroundColor, placeholder, onSignatureChange, offlineCapable]);

  // Generate signature data
  const generateSignatureData = useCallback((): SignatureData | null => {
    if (strokes.length === 0) return null;

    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Calculate bounding box
    const allStrokes = [...strokes, ...currentStroke];
    const xs = allStrokes.map((s) => s.x);
    const ys = allStrokes.map((s) => s.y);

    const boundingBox = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };

    // Calculate metadata
    const totalTime =
      allStrokes.length > 0
        ? allStrokes[allStrokes.length - 1].timestamp - allStrokes[0].timestamp
        : 0;
    const strokeCount = strokes.length;
    const averagePressure =
      allStrokes.reduce((sum, s) => sum + s.pressure, 0) / allStrokes.length;

    // Calculate complexity (based on stroke variation and coverage)
    const width = boundingBox.maxX - boundingBox.minX;
    const height = boundingBox.maxY - boundingBox.minY;
    const area = width * height;
    const canvasArea = canvas.width * canvas.height;
    const coverage = Math.min((area / canvasArea) * 100, 100);

    const velocities = allStrokes
      .map((s) => s.velocity || 0)
      .filter((v) => v > 0);
    const velocityVariation =
      velocities.length > 0
        ? Math.sqrt(
            velocities.reduce(
              (sum, v) =>
                sum +
                Math.pow(
                  v - velocities.reduce((s, v) => s + v, 0) / velocities.length,
                  2,
                ),
              0,
            ) / velocities.length,
          )
        : 0;

    const signatureComplexity = Math.min(
      coverage * 0.4 + velocityVariation * 0.3 + strokeCount * 2,
      100,
    );

    // Get image data
    const imageData = canvas.toDataURL("image/png");

    return {
      strokes: allStrokes,
      boundingBox,
      metadata: {
        totalTime,
        strokeCount,
        averagePressure,
        signatureComplexity,
        deviceType: deviceInfo?.isMobile ? "mobile" : "desktop",
        touchSupported: deviceInfo?.touchSupported || false,
        captureMethod,
        deviceInfo: deviceInfo || {},
        // Enhanced performance and device metrics
        performanceMetrics,
        pressureSensitive: deviceInfo?.pressureSensitive || false,
        maxTouchPoints: deviceInfo?.maxTouchPoints || 0,
        hardwareConcurrency: deviceInfo?.hardwareConcurrency || 1,
        deviceMemory: deviceInfo?.deviceMemory || "unknown",
        connectionType: deviceInfo?.connection?.effectiveType || "unknown",
        // Offline capability
        offlineCapable,
        capturedOffline: !navigator.onLine,
      },
      imageData,
    };
  }, [strokes, currentStroke, deviceInfo, captureMethod]);

  // Validate signature
  const validateSignature = useCallback(
    (
      data: SignatureData,
    ): { isValid: boolean; issues: string[]; score: number } => {
      const issues: string[] = [];
      let score = 100;

      // Check minimum strokes
      if (data.metadata.strokeCount < (validationRules.minStrokes || 3)) {
        issues.push(
          `Minimum ${validationRules.minStrokes || 3} strokes required`,
        );
        score -= 20;
      }

      // Check minimum duration
      if (data.metadata.totalTime < (validationRules.minDuration || 500)) {
        issues.push(
          `Signature too quick (minimum ${validationRules.minDuration || 500}ms)`,
        );
        score -= 15;
      }

      // Check complexity
      if (
        data.metadata.signatureComplexity <
        (validationRules.minComplexity || 10)
      ) {
        issues.push("Signature too simple");
        score -= 25;
      }

      if (
        validationRules.maxComplexity &&
        data.metadata.signatureComplexity > validationRules.maxComplexity
      ) {
        issues.push("Signature too complex");
        score -= 10;
      }

      // Check pressure if required
      if (
        validationRules.requirePressure &&
        data.metadata.averagePressure < 0.3
      ) {
        issues.push("Insufficient pressure detected");
        score -= 15;
      }

      // Check bounding box (signature should not be too small)
      const width = data.boundingBox.maxX - data.boundingBox.minX;
      const height = data.boundingBox.maxY - data.boundingBox.minY;

      if (width < 50 || height < 20) {
        issues.push("Signature too small");
        score -= 20;
      }

      return {
        isValid: issues.length === 0,
        issues,
        score: Math.max(0, score),
      };
    },
    [validationRules],
  );

  // Update signature data when strokes change
  useEffect(() => {
    if (strokes.length === 0) {
      setSignatureData(null);
      setValidationResult({ isValid: false, issues: [], score: 0 });
      return;
    }

    const data = generateSignatureData();
    if (data) {
      setSignatureData(data);
      const validation = validateSignature(data);
      setValidationResult(validation);

      onSignatureChange?.(data);
      onValidationChange?.(validation.isValid, validation.issues);

      // Save to offline storage if available and offline
      if (offlineCapable && !navigator.onLine) {
        setOfflineData((prev) => [...prev, data]);
        // Store in IndexedDB for persistence
        if ("indexedDB" in window) {
          const request = indexedDB.open("SignatureOfflineDB", 1);
          request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const transaction = db.transaction(["signatures"], "readwrite");
            const store = transaction.objectStore("signatures");
            store.add({
              id: `offline_${Date.now()}`,
              data,
              timestamp: new Date().toISOString(),
              synced: false,
            });
          };
        }
      }
    }
  }, [
    strokes,
    generateSignatureData,
    validateSignature,
    onSignatureChange,
    onValidationChange,
    offlineCapable,
  ]);

  // Complete signature
  const completeSignature = useCallback(() => {
    if (signatureData && validationResult.isValid) {
      onSignatureComplete?.(signatureData);
    }
  }, [signatureData, validationResult.isValid, onSignatureComplete]);

  // Event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => continueDrawing(e);
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => stopDrawing();

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => continueDrawing(e);
    const handleTouchEnd = () => stopDrawing();

    // Pointer events (for stylus)
    const handlePointerDown = (e: PointerEvent) => startDrawing(e);
    const handlePointerMove = (e: PointerEvent) => continueDrawing(e);
    const handlePointerUp = () => stopDrawing();

    if (deviceInfo?.touchSupported) {
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);
    }

    if (deviceInfo?.pointerSupported) {
      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);
    } else {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [deviceInfo, startDrawing, continueDrawing, stopDrawing]);

  const getDeviceIcon = () => {
    if (deviceInfo?.isMobile) {
      return <Smartphone className="h-4 w-4" />;
    } else if (captureMethod === "stylus") {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  const getValidationColor = () => {
    if (validationResult.score >= 80) return "text-green-600";
    if (validationResult.score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5" />
              Digital Signature Capture
              {required && <span className="text-red-500">*</span>}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <Badge variant="outline" className="text-xs">
                {captureMethod}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className={cn(
                "block cursor-crosshair touch-none",
                disabled && "cursor-not-allowed opacity-50",
                mobileOptimized && "w-full h-auto",
              )}
              style={{
                width: mobileOptimized ? "100%" : width,
                height: mobileOptimized ? "auto" : height,
                aspectRatio: mobileOptimized ? `${width}/${height}` : undefined,
              }}
            />
            {disabled && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  Signature Disabled
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={disabled || strokes.length === 0}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
              {signatureData && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={completeSignature}
                  disabled={!validationResult.isValid}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Complete
                </Button>
              )}
            </div>

            {signatureData && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Strokes: {signatureData.metadata.strokeCount}</span>
                <span>•</span>
                <span>
                  Time: {(signatureData.metadata.totalTime / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>

          {/* Validation */}
          {showValidation && signatureData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Signature Quality</span>
                <span
                  className={cn("text-sm font-medium", getValidationColor())}
                >
                  {validationResult.score}%
                </span>
              </div>
              <Progress value={validationResult.score} className="h-2" />

              {validationResult.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {validationResult.issues.map((issue, index) => (
                        <li key={index} className="text-sm">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Signature meets all validation requirements
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Preview */}
          {showPreview && signatureData && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Preview</h4>
              <div className="border rounded-lg p-2 bg-gray-50">
                <img
                  src={signatureData.imageData}
                  alt="Signature preview"
                  className="max-w-full h-auto"
                  style={{ maxHeight: "100px" }}
                />
              </div>
            </div>
          )}

          {/* Enhanced Device Info & Performance Metrics */}
          {deviceInfo && (
            <div className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-xs space-y-1">
                    <div>
                      Device: {deviceInfo.isMobile ? "Mobile" : "Desktop"} •
                      Method: {captureMethod}
                    </div>
                    <div>
                      Touch:{" "}
                      {deviceInfo.touchSupported
                        ? "Supported"
                        : "Not supported"}{" "}
                      • Pressure:{" "}
                      {deviceInfo.pressureSensitive ? "Sensitive" : "Standard"}
                    </div>
                    <div>
                      Resolution: {deviceInfo.screenResolution} • Ratio:{" "}
                      {deviceInfo.pixelRatio}x
                    </div>
                    <div>
                      Max Touch Points: {deviceInfo.maxTouchPoints} • CPU Cores:{" "}
                      {deviceInfo.hardwareConcurrency}
                    </div>
                    {deviceInfo.connection && (
                      <div>
                        Connection: {deviceInfo.connection.effectiveType} •
                        Downlink: {deviceInfo.connection.downlink}Mbps
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Performance Metrics */}
              <Alert className="border-blue-200 bg-blue-50">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="text-xs space-y-1 text-blue-800">
                    <div className="font-medium">Performance Metrics</div>
                    <div>
                      Frame Rate: {performanceMetrics.frameRate} FPS • Latency:{" "}
                      {performanceMetrics.strokeLatency.toFixed(1)}ms
                    </div>
                    <div>
                      Memory: {performanceMetrics.memoryUsage}MB • Render Time:{" "}
                      {performanceMetrics.renderTime.toFixed(1)}ms
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Offline Status */}
              {offlineCapable && (
                <Alert
                  className={cn(
                    navigator.onLine
                      ? "border-green-200 bg-green-50"
                      : "border-orange-200 bg-orange-50",
                  )}
                >
                  <Shield
                    className={cn(
                      "h-4 w-4",
                      navigator.onLine ? "text-green-600" : "text-orange-600",
                    )}
                  />
                  <AlertDescription
                    className={cn(
                      "text-xs",
                      navigator.onLine ? "text-green-800" : "text-orange-800",
                    )}
                  >
                    <div>
                      Status: {navigator.onLine ? "Online" : "Offline"} •
                      Offline Capable: {offlineCapable ? "Yes" : "No"}
                    </div>
                    {offlineData.length > 0 && (
                      <div>Offline Signatures: {offlineData.length}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureCapture;
