import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  CameraOff,
  RotateCcw,
  Download,
  Trash2,
  ScanLine,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface MobileCameraProps {
  onCapture: (imageData: string, metadata?: any) => void;
  onEmiratesIdDetected?: (data: EmiratesIdData) => void;
  captureMode?: "photo" | "emirates-id" | "document";
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface EmiratesIdData {
  idNumber: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  expiryDate: string;
  confidence: number;
}

export function MobileCamera({
  onCapture,
  onEmiratesIdDetected,
  captureMode = "photo",
  className = "",
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
}: MobileCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [emiratesIdData, setEmiratesIdData] = useState<EmiratesIdData | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Check camera support
  const isCameraSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!isCameraSupported()) {
      setError("Camera is not supported on this device");
      return;
    }

    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        // Start Emirates ID scanning if in that mode
        if (captureMode === "emirates-id") {
          startEmiratesIdScanning();
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please check permissions.");
    }
  }, [facingMode, maxWidth, maxHeight, captureMode, isCameraSupported]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setIsScanning(false);
  }, []);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    // startCamera will be called by useEffect when facingMode changes
  }, [stopCamera]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 with specified quality
      const imageData = canvas.toDataURL("image/jpeg", quality);

      setCapturedImage(imageData);

      // Create metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        dimensions: {
          width: canvas.width,
          height: canvas.height,
        },
        captureMode,
        facingMode,
        quality,
      };

      // Process Emirates ID if in that mode
      if (captureMode === "emirates-id") {
        await processEmiratesId(imageData);
      }

      onCapture(imageData, metadata);
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("Failed to capture photo");
    } finally {
      setIsProcessing(false);
    }
  }, [onCapture, quality, captureMode, facingMode]);

  // Start Emirates ID scanning
  const startEmiratesIdScanning = useCallback(() => {
    setIsScanning(true);

    // Simulate continuous scanning (in production, this would use OCR/ML)
    const scanInterval = setInterval(() => {
      if (videoRef.current && isStreaming) {
        // Simulate Emirates ID detection
        const mockDetection = Math.random() > 0.95; // 5% chance per scan

        if (mockDetection) {
          const mockData: EmiratesIdData = {
            idNumber: "784-1234-5678901-2",
            name: "Ahmed Al-Mansouri",
            nationality: "United Arab Emirates",
            dateOfBirth: "1985-03-15",
            expiryDate: "2025-03-15",
            confidence: 0.95,
          };

          setEmiratesIdData(mockData);
          setIsScanning(false);
          clearInterval(scanInterval);

          if (onEmiratesIdDetected) {
            onEmiratesIdDetected(mockData);
          }
        }
      }
    }, 1000);

    // Cleanup after 30 seconds
    setTimeout(() => {
      clearInterval(scanInterval);
      setIsScanning(false);
    }, 30000);
  }, [isStreaming, onEmiratesIdDetected]);

  // Process Emirates ID image
  const processEmiratesId = useCallback(
    async (imageData: string) => {
      try {
        // In production, this would send to OCR service
        // For now, simulate processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockData: EmiratesIdData = {
          idNumber: "784-1234-5678901-2",
          name: "Ahmed Al-Mansouri",
          nationality: "United Arab Emirates",
          dateOfBirth: "1985-03-15",
          expiryDate: "2025-03-15",
          confidence: 0.92,
        };

        setEmiratesIdData(mockData);

        if (onEmiratesIdDetected) {
          onEmiratesIdDetected(mockData);
        }
      } catch (error) {
        console.error("Emirates ID processing failed:", error);
        setError("Failed to process Emirates ID");
      }
    },
    [onEmiratesIdDetected],
  );

  // Clear captured image
  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setEmiratesIdData(null);
  }, []);

  // Download captured image
  const downloadImage = useCallback(() => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.download = `reyada-capture-${Date.now()}.jpg`;
    link.href = capturedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [capturedImage]);

  // Start camera when component mounts or facingMode changes
  useEffect(() => {
    if (isStreaming || capturedImage) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isCameraSupported()) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Camera is not supported on this device
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Mobile Camera
            {captureMode === "emirates-id" && (
              <Badge variant="secondary" className="ml-2">
                Emirates ID Scanner
              </Badge>
            )}
          </span>
          {isStreaming && (
            <Button
              variant="outline"
              size="sm"
              onClick={switchCamera}
              className="flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Switch
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />

              {/* Scanning Overlay for Emirates ID */}
              {captureMode === "emirates-id" && isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-500 border-dashed rounded-lg w-80 h-48 flex items-center justify-center">
                    <div className="text-center text-white">
                      <ScanLine className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">
                        Position Emirates ID within frame
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <CameraOff className="h-12 w-12 mx-auto mb-4" />
                    <p>Camera not active</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-64 object-cover"
            />
          )}
        </div>

        {/* Emirates ID Data Display */}
        {emiratesIdData && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>ID:</strong> {emiratesIdData.idNumber}
                </p>
                <p>
                  <strong>Name:</strong> {emiratesIdData.name}
                </p>
                <p>
                  <strong>DOB:</strong> {emiratesIdData.dateOfBirth}
                </p>
                <p>
                  <strong>Confidence:</strong>{" "}
                  {Math.round(emiratesIdData.confidence * 100)}%
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-2">
          {!isStreaming && !capturedImage && (
            <Button onClick={startCamera} className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}

          {isStreaming && !capturedImage && (
            <>
              <Button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="flex items-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {captureMode === "emirates-id" ? "Scan ID" : "Capture"}
              </Button>

              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex items-center"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {capturedImage && (
            <>
              <Button
                onClick={downloadImage}
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={clearImage}
                variant="outline"
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <Button onClick={startCamera} className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Take Another
              </Button>
            </>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

export default MobileCamera;
