/**
 * Mobile Camera Component for Wound Documentation
 * Clinical requirement for visual documentation with metadata
 */

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  RotateCcw,
  Download,
  Upload,
  Zap,
  ZapOff,
  RotateCw,
  Square,
  Circle,
  AlertCircle,
  Check,
  Ruler,
  MapPin,
  Clock,
  Eye,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { offlineService } from "@/services/offline.service";

interface MobileCameraProps {
  onPhotoCapture: (photoData: PhotoData) => void;
  onPhotosComplete?: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  className?: string;
  patientId?: string;
  episodeId?: string;
  documentationType: "wound" | "general" | "identification" | "medication";
  required?: boolean;
}

interface PhotoData {
  id: string;
  imageData: string;
  thumbnail: string;
  metadata: PhotoMetadata;
  annotations: PhotoAnnotation[];
  measurements: PhotoMeasurement[];
  timestamp: string;
  location?: GeolocationCoordinates;
  deviceInfo: DeviceInfo;
  qualityScore: number;
  complianceFlags: string[];
}

interface PhotoMetadata {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  compression: number;
  flash: boolean;
  orientation: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  whiteBalance?: string;
  colorSpace: string;
  timestamp: string;
  cameraSettings: {
    facing: "user" | "environment";
    resolution: string;
    zoom: number;
    focus: string;
  };
}

interface PhotoAnnotation {
  id: string;
  type: "arrow" | "circle" | "text" | "measurement";
  position: { x: number; y: number };
  size?: { width: number; height: number };
  text?: string;
  color: string;
  timestamp: string;
}

interface PhotoMeasurement {
  id: string;
  type: "length" | "area" | "angle";
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  calibration?: {
    referenceObject: string;
    knownSize: number;
    pixelRatio: number;
  };
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  hasCamera: boolean;
  cameraCount: number;
  supportedFormats: string[];
  maxResolution: string;
  hasFlash: boolean;
  hasAutofocus: boolean;
}

export const MobileCamera: React.FC<MobileCameraProps> = ({
  onPhotoCapture,
  onPhotosComplete,
  maxPhotos = 10,
  className,
  patientId,
  episodeId,
  documentationType,
  required = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [currentFacing, setCurrentFacing] = useState<"user" | "environment">(
    "environment",
  );
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>([]);
  const [measurements, setMeasurements] = useState<PhotoMeasurement[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationMode, setAnnotationMode] = useState<
    "arrow" | "circle" | "text" | "measurement"
  >("arrow");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [measurementCalibration, setMeasurementCalibration] =
    useState<number>(1); // pixels per mm

  useEffect(() => {
    checkCameraSupport();
    getCurrentLocation();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraSupport = async () => {
    try {
      const hasMediaDevices =
        "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;

      if (!hasMediaDevices) {
        setError("Camera not supported in this browser");
        setIsSupported(false);
        return;
      }

      // Get device info
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile:
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ),
        hasCamera: videoDevices.length > 0,
        cameraCount: videoDevices.length,
        supportedFormats: ["image/jpeg", "image/png", "image/webp"],
        maxResolution: "1920x1080", // Default, would be detected in production
        hasFlash: false, // Would be detected from device capabilities
        hasAutofocus: true, // Would be detected from device capabilities
      };

      setDeviceInfo(info);
      setIsSupported(info.hasCamera);

      if (!info.hasCamera) {
        setError("No camera found on this device");
      }
    } catch (error) {
      console.error("Error checking camera support:", error);
      setError("Failed to check camera support");
      setIsSupported(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position.coords);
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    }
  };

  const startCamera = async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        // Check for flash capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();

        if (capabilities?.torch) {
          setHasFlash(true);
        }
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setError("Failed to start camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setCurrentFacing((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(startCamera, 100);
  };

  const toggleFlash = async () => {
    if (!hasFlash || !videoRef.current?.srcObject) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any],
      });

      setFlashEnabled(!flashEnabled);
    } catch (error) {
      console.error("Error toggling flash:", error);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      const thumbnail = createThumbnail(canvas);

      // Calculate quality score
      const qualityScore = calculateImageQuality(canvas, ctx);

      // Generate metadata
      const metadata: PhotoMetadata = {
        width: canvas.width,
        height: canvas.height,
        fileSize: Math.round(imageData.length * 0.75), // Approximate file size
        format: "image/jpeg",
        compression: 0.9,
        flash: flashEnabled,
        orientation: 1,
        colorSpace: "sRGB",
        timestamp: new Date().toISOString(),
        cameraSettings: {
          facing: currentFacing,
          resolution: `${canvas.width}x${canvas.height}`,
          zoom,
          focus: "auto",
        },
      };

      // Check compliance
      const complianceFlags = checkPhotoCompliance(metadata, qualityScore);

      const photoData: PhotoData = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageData,
        thumbnail,
        metadata,
        annotations: [],
        measurements: [],
        timestamp: new Date().toISOString(),
        location: currentLocation || undefined,
        deviceInfo: deviceInfo!,
        qualityScore,
        complianceFlags,
      };

      setPhotos((prev) => [...prev, photoData]);
      onPhotoCapture(photoData);

      // Store offline for sync
      await offlineService.storeMediaFile({
        id: photoData.id,
        type: "image",
        data: imageData,
        metadata: {
          patientId,
          episodeId,
          documentationType,
          ...metadata,
        },
      });
    } catch (error) {
      console.error("Error capturing photo:", error);
      setError("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const createThumbnail = (canvas: HTMLCanvasElement): string => {
    const thumbnailCanvas = document.createElement("canvas");
    const thumbnailCtx = thumbnailCanvas.getContext("2d");

    if (!thumbnailCtx) return "";

    const maxSize = 150;
    const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height);

    thumbnailCanvas.width = canvas.width * ratio;
    thumbnailCanvas.height = canvas.height * ratio;

    thumbnailCtx.drawImage(
      canvas,
      0,
      0,
      thumbnailCanvas.width,
      thumbnailCanvas.height,
    );

    return thumbnailCanvas.toDataURL("image/jpeg", 0.7);
  };

  const calculateImageQuality = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ): number => {
    // Simple quality assessment based on image properties
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brightness = 0;
    let contrast = 0;
    let sharpness = 0;

    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness += (r + g + b) / 3;
    }
    brightness /= data.length / 4;

    // Simple quality score (0-100)
    let score = 50; // Base score

    // Brightness scoring (optimal range 80-180)
    if (brightness >= 80 && brightness <= 180) {
      score += 20;
    } else if (brightness >= 60 && brightness <= 200) {
      score += 10;
    }

    // Resolution scoring
    const totalPixels = canvas.width * canvas.height;
    if (totalPixels >= 1920 * 1080) {
      score += 20;
    } else if (totalPixels >= 1280 * 720) {
      score += 15;
    } else if (totalPixels >= 640 * 480) {
      score += 10;
    }

    // Aspect ratio scoring (prefer 4:3 or 16:9)
    const aspectRatio = canvas.width / canvas.height;
    if (
      Math.abs(aspectRatio - 4 / 3) < 0.1 ||
      Math.abs(aspectRatio - 16 / 9) < 0.1
    ) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  };

  const checkPhotoCompliance = (
    metadata: PhotoMetadata,
    qualityScore: number,
  ): string[] => {
    const flags: string[] = [];

    if (qualityScore < 60) {
      flags.push("LOW_QUALITY");
    }

    if (metadata.width < 1280 || metadata.height < 720) {
      flags.push("LOW_RESOLUTION");
    }

    if (!currentLocation) {
      flags.push("NO_LOCATION_DATA");
    }

    if (documentationType === "wound" && measurements.length === 0) {
      flags.push("NO_MEASUREMENTS");
    }

    return flags;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length && photos.length < maxPhotos; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        continue;
      }

      try {
        const imageData = await fileToDataURL(file);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageData;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const thumbnail = createThumbnail(canvas);
        const qualityScore = ctx ? calculateImageQuality(canvas, ctx) : 50;

        const metadata: PhotoMetadata = {
          width: img.width,
          height: img.height,
          fileSize: file.size,
          format: file.type,
          compression: 1,
          flash: false,
          orientation: 1,
          colorSpace: "sRGB",
          timestamp: new Date(file.lastModified).toISOString(),
          cameraSettings: {
            facing: "environment",
            resolution: `${img.width}x${img.height}`,
            zoom: 1,
            focus: "unknown",
          },
        };

        const complianceFlags = checkPhotoCompliance(metadata, qualityScore);

        const photoData: PhotoData = {
          id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          imageData,
          thumbnail,
          metadata,
          annotations: [],
          measurements: [],
          timestamp: new Date().toISOString(),
          location: currentLocation || undefined,
          deviceInfo: deviceInfo!,
          qualityScore,
          complianceFlags,
        };

        setPhotos((prev) => [...prev, photoData]);
        onPhotoCapture(photoData);
      } catch (error) {
        console.error("Error processing uploaded file:", error);
      }
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const completePhotoSession = () => {
    if (onPhotosComplete) {
      onPhotosComplete(photos);
    }
    stopCamera();
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Camera not supported on this device. You can still upload photos
              using the upload button below.
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto bg-white", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Clinical Photography -{" "}
            {documentationType.charAt(0).toUpperCase() +
              documentationType.slice(1)}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Badge variant={deviceInfo?.isMobile ? "default" : "secondary"}>
              <Smartphone className="h-3 w-3 mr-1" />
              {deviceInfo?.isMobile ? "Mobile" : "Desktop"}
            </Badge>

            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              {currentFacing === "environment" ? "Back Camera" : "Front Camera"}
            </Badge>

            {currentLocation && (
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                Location Enabled
              </Badge>
            )}

            <Badge
              variant={photos.length >= maxPhotos ? "destructive" : "default"}
            >
              {photos.length}/{maxPhotos} Photos
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 md:h-96 object-cover"
                playsInline
                muted
              />

              <canvas ref={canvasRef} className="hidden" />

              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                  <Button onClick={startCamera} size="lg">
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>

            {isStreaming && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing || photos.length >= maxPhotos}
                  size="lg"
                  className="min-w-32"
                >
                  {isCapturing ? (
                    <>
                      <Circle className="h-5 w-5 mr-2 animate-pulse" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 mr-2" />
                      Capture
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={switchCamera}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Switch
                </Button>

                {hasFlash && (
                  <Button
                    variant={flashEnabled ? "default" : "outline"}
                    onClick={toggleFlash}
                  >
                    {flashEnabled ? (
                      <Zap className="h-4 w-4 mr-2" />
                    ) : (
                      <ZapOff className="h-4 w-4 mr-2" />
                    )}
                    Flash
                  </Button>
                )}

                <Button variant="outline" onClick={stopCamera}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= maxPhotos}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </div>

          {photos.length > 0 && (
            <div className="space-y-4">
              <Separator />

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Captured Photos ({photos.length})
                </h3>
                {photos.length > 0 && (
                  <Button onClick={completePhotoSession}>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Session
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          photo.qualityScore >= 80
                            ? "default"
                            : photo.qualityScore >= 60
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {photo.qualityScore}%
                      </Badge>
                    </div>

                    {photo.complianceFlags.length > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-2 w-2 mr-1" />
                          {photo.complianceFlags.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {required && photos.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                At least one photo is required for this documentation type.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileCamera;
