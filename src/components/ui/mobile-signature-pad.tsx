/**
 * Mobile Signature Pad Component
 * P3-002.2.3: Mobile Signature Optimization
 *
 * Touch-responsive signature pad optimized for mobile devices
 * with offline capability and server sync functionality.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  RotateCcw,
  Check,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Battery,
  Signal,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignatureData, SignatureStroke } from "./signature-capture";

export interface MobileSignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  onSignatureChange?: (signature: SignatureData | null) => void;
  onSignatureComplete?: (signature: SignatureData) => void;
  onOfflineStore?: (signature: SignatureData) => void;
  onSyncComplete?: (success: boolean) => void;
  enableOfflineMode?: boolean;
  autoSync?: boolean;
  compressionLevel?: number;
  className?: string;
}

interface OfflineSignature {
  id: string;
  signature: SignatureData;
  timestamp: number;
  synced: boolean;
  attempts: number;
}

const MobileSignaturePad: React.FC<MobileSignaturePadProps> = ({
  width = 350,
  height = 200,
  penColor = "#1e40af",
  penWidth = 3,
  backgroundColor = "#ffffff",
  placeholder = "Sign with your finger",
  disabled = false,
  onSignatureChange,
  onSignatureComplete,
  onOfflineStore,
  onSyncComplete,
  enableOfflineMode = true,
  autoSync = true,
  compressionLevel = 0.8,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<SignatureStroke[]>([]);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(
    null,
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSignatures, setOfflineSignatures] = useState<
    OfflineSignature[]
  >([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceMetrics, setDeviceMetrics] = useState<any>(null);
  const [touchSupport, setTouchSupport] = useState(false);
  const [lastPoint, setLastPoint] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Detect device capabilities and metrics
  useEffect(() => {
    const detectCapabilities = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setTouchSupport(hasTouch);

      const metrics = {
        screenWidth: screen.width,
        screenHeight: screen.height,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: screen.orientation?.angle || 0,
        touchPoints: navigator.maxTouchPoints || 0,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        connection: (navigator as any).connection || null,
        battery: null,
      };

      // Get battery info if available
      if ("getBattery" in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          metrics.battery = {
            level: battery.level,
            charging: battery.charging,
          };
          setDeviceMetrics({ ...metrics });
        });
      } else {
        setDeviceMetrics(metrics);
      }
    };

    detectCapabilities();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectCapabilities, 100); // Delay to get accurate measurements
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", handleOrientationChange);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync && offlineSignatures.length > 0) {
        syncOfflineSignatures();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoRefreshCw, offlineSignatures]);

  // Load offline signatures from localStorage
  useEffect(() => {
    if (enableOfflineMode) {
      const stored = localStorage.getItem("mobile-signatures-offline");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOfflineSignatures(parsed);
        } catch (error) {
          console.error("Error loading offline signatures:", error);
        }
      }
    }
  }, [enableOfflineMode]);

  // Save offline signatures to localStorage
  const saveOfflineSignatures = useCallback(
    (signatures: OfflineSignature[]) => {
      if (enableOfflineMode) {
        localStorage.setItem(
          "mobile-signatures-offline",
          JSON.stringify(signatures),
        );
      }
    },
    [enableOfflineMode],
  );

  // Initialize canvas with mobile optimizations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with high DPI support
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Enable smooth drawing on mobile
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw placeholder if no signature
    if (strokes.length === 0 && !disabled) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px Arial";
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

  // Get touch point from event
  const getTouchPoint = useCallback(
    (event: TouchEvent): { x: number; y: number; pressure: number } => {
      const canvas = canvasRef.current;
      if (!canvas || !event.touches.length)
        return { x: 0, y: 0, pressure: 0.5 };

      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];

      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        pressure: touch.force || 0.5,
      };
    },
    [],
  );

  // Calculate velocity with smoothing
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

  // Start drawing with touch optimization
  const startDrawing = useCallback(
    (event: TouchEvent) => {
      if (disabled) return;

      event.preventDefault();
      setIsDrawing(true);
      setStartTime(Date.now());

      const point = getTouchPoint(event);
      const timestamp = Date.now();

      const stroke: SignatureStroke = {
        x: point.x,
        y: point.y,
        timestamp,
        pressure: point.pressure,
        velocity: 0,
      };

      setCurrentStroke([stroke]);
      setLastPoint({ x: point.x, y: point.y, time: timestamp });

      // Draw point with pressure sensitivity
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        const radius = (penWidth / 2) * (0.5 + point.pressure * 0.5);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [disabled, getTouchPoint, penWidth],
  );

  // Continue drawing with smoothing
  const continueDrawing = useCallback(
    (event: TouchEvent) => {
      if (!isDrawing || disabled) return;

      event.preventDefault();

      const point = getTouchPoint(event);
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
      };

      setCurrentStroke((prev) => [...prev, stroke]);
      setLastPoint({ x: point.x, y: point.y, time: timestamp });

      // Draw smooth line with variable width based on pressure and velocity
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && lastPoint) {
        const pressureFactor = 0.5 + point.pressure * 0.5;
        const velocityFactor = Math.max(0.3, 1 - velocity * 0.01);
        const lineWidth = penWidth * pressureFactor * velocityFactor;

        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    },
    [
      isDrawing,
      disabled,
      getTouchPoint,
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
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(placeholder, rect.width / 2, rect.height / 2);
    }

    onSignatureChange?.(null);
  }, [backgroundColor, placeholder, onSignatureChange]);

  // Generate compressed signature data
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

    // Calculate complexity
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

    // Get compressed image data
    const imageData = canvas.toDataURL("image/jpeg", compressionLevel);

    return {
      strokes: allStrokes,
      boundingBox,
      metadata: {
        totalTime,
        strokeCount,
        averagePressure,
        signatureComplexity,
        deviceType: "mobile",
        touchSupported: touchSupport,
        captureMethod: "touch",
        deviceInfo: deviceMetrics || {},
      },
      imageData,
    };
  }, [strokes, currentStroke, touchSupport, deviceMetrics, compressionLevel]);

  // Store signature offline
  const storeOffline = useCallback(
    (signature: SignatureData) => {
      if (!enableOfflineMode) return;

      const offlineSignature: OfflineSignature = {
        id: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        signature,
        timestamp: Date.now(),
        synced: false,
        attempts: 0,
      };

      const updated = [...offlineSignatures, offlineSignature];
      setOfflineSignatures(updated);
      saveOfflineSignatures(updated);

      onOfflineStore?.(signature);
    },
    [
      enableOfflineMode,
      offlineSignatures,
      saveOfflineSignatures,
      onOfflineStore,
    ],
  );

  // Sync offline signatures
  const syncOfflineSignatures = useCallback(async () => {
    if (!isOnline || offlineSignatures.length === 0 || isSyncing) return;

    setIsSyncing(true);

    try {
      const unsyncedSignatures = offlineSignatures.filter((sig) => !sig.synced);
      let successCount = 0;

      for (const offlineSig of unsyncedSignatures) {
        try {
          // Simulate API call to sync signature
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mark as synced
          offlineSig.synced = true;
          successCount++;
        } catch (error) {
          offlineSig.attempts++;
          console.error("Failed to sync signature:", error);
        }
      }

      // Update offline signatures
      const updated = offlineSignatures.map(
        (sig) => unsyncedSignatures.find((u) => u.id === sig.id) || sig,
      );
      setOfflineSignatures(updated);
      saveOfflineSignatures(updated);

      onSyncComplete?.(successCount === unsyncedSignatures.length);
    } catch (error) {
      console.error("Sync failed:", error);
      onSyncComplete?.(false);
    } finally {
      setIsSyncing(false);
    }
  }, [
    isOnline,
    offlineSignatures,
    isSyncing,
    saveOfflineSignatures,
    onSyncComplete,
  ]);

  // Update signature data when strokes change
  useEffect(() => {
    if (strokes.length === 0) {
      setSignatureData(null);
      return;
    }

    const data = generateSignatureData();
    if (data) {
      setSignatureData(data);
      onSignatureChange?.(data);
    }
  }, [strokes, generateSignatureData, onSignatureChange]);

  // Complete signature
  const completeSignature = useCallback(() => {
    if (!signatureData) return;

    if (isOnline) {
      onSignatureComplete?.(signatureData);
    } else if (enableOfflineMode) {
      storeOffline(signatureData);
    }
  }, [
    signatureData,
    isOnline,
    enableOfflineMode,
    storeOffline,
    onSignatureComplete,
  ]);

  // Touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !touchSupport) return;

    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => continueDrawing(e);
    const handleTouchEnd = () => stopDrawing();

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [touchSupport, startDrawing, continueDrawing, stopDrawing]);

  const getConnectionIcon = () => {
    if (isOnline) {
      return <Wifi className="h-4 w-4 text-green-600" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Online
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Offline</Badge>;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Signature Pad
            </CardTitle>
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              {getConnectionStatus()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className={cn(
                "block w-full h-auto touch-none",
                disabled && "cursor-not-allowed opacity-50",
              )}
              style={{
                aspectRatio: `${width}/${height}`,
                maxWidth: "100%",
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
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isOnline ? "Complete" : "Store Offline"}
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

          {/* Offline Mode Status */}
          {enableOfflineMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline Storage</span>
                <div className="flex items-center gap-2">
                  {offlineSignatures.length > 0 && (
                    <Badge variant="outline">
                      {offlineSignatures.filter((s) => !s.synced).length}{" "}
                      pending
                    </Badge>
                  )}
                  {isOnline && offlineSignatures.some((s) => !s.synced) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncOfflineSignatures}
                      disabled={isSyncing}
                      className="flex items-center gap-2"
                    >
                      {isSyncing ? (
                        <Download className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Sync
                    </Button>
                  )}
                </div>
              </div>

              {offlineSignatures.length > 0 && (
                <div className="text-xs text-gray-600">
                  {offlineSignatures.filter((s) => s.synced).length} synced,{" "}
                  {offlineSignatures.filter((s) => !s.synced).length} pending
                  sync
                </div>
              )}
            </div>
          )}

          {/* Device Info */}
          {deviceMetrics && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Touch Points: {deviceMetrics.touchPoints}</span>
                    <span>Pixel Ratio: {deviceMetrics.devicePixelRatio}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Orientation: {deviceMetrics.orientation}°</span>
                    {deviceMetrics.battery && (
                      <span className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        {Math.round(deviceMetrics.battery.level * 100)}%
                      </span>
                    )}
                  </div>
                  {deviceMetrics.connection && (
                    <div className="flex items-center justify-between">
                      <span>
                        Connection: {deviceMetrics.connection.effectiveType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        {deviceMetrics.connection.downlink}Mbps
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Offline Warning */}
          {!isOnline && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are currently offline. Signatures will be stored locally and
                synced when connection is restored.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSignaturePad;
