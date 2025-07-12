/**
 * Mobile Camera Capture Component
 * Healthcare-specific camera interface for wound documentation and medical imaging
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  RotateCcw,
  Download,
  Trash2,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import {
  MobileCameraService,
  CaptureOptions,
  CapturedImage,
} from "@/services/mobile-camera.service";

interface CameraCaptureProps {
  patientId?: string;
  episodeId?: string;
  onImageCaptured?: (image: CapturedImage) => void;
  defaultCaptureType?: CaptureOptions["type"];
}

const MobileCameraCapture: React.FC<CameraCaptureProps> = ({
  patientId,
  episodeId,
  onImageCaptured,
  defaultCaptureType = "general",
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(
    null,
  );
  const [captureType, setCaptureType] =
    useState<CaptureOptions["type"]>(defaultCaptureType);
  const [notes, setNotes] = useState("");
  const [quality, setQuality] = useState(0.9);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const cameraService = MobileCameraService.getInstance();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setError(null);
      await cameraService.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize camera:", error);
      setError(
        error instanceof Error ? error.message : "Camera initialization failed",
      );
    }
  };

  const captureImage = async () => {
    if (!isInitialized) {
      setError("Camera not initialized");
      return;
    }

    try {
      setIsCapturing(true);
      setProcessing(true);
      setError(null);

      const options: CaptureOptions = {
        type: captureType,
        quality,
        compress: true,
        enhance: captureType === "wound",
        metadata: {
          patientId,
          episodeId,
          timestamp: new Date(),
          notes: notes || undefined,
        },
      };

      const capturedImage = await cameraService.captureImage(options);

      setCapturedImages((prev) => [capturedImage, ...prev]);
      setSelectedImage(capturedImage);

      if (onImageCaptured) {
        onImageCaptured(capturedImage);
      }

      // Clear notes after successful capture
      setNotes("");
    } catch (error) {
      console.error("Failed to capture image:", error);
      setError(error instanceof Error ? error.message : "Image capture failed");
    } finally {
      setIsCapturing(false);
      setProcessing(false);
    }
  };

  const deleteImage = (imageId: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const downloadImage = (image: CapturedImage) => {
    try {
      cameraService.saveImage(image);
    } catch (error) {
      console.error("Failed to download image:", error);
      setError("Failed to download image");
    }
  };

  const compressImage = async (image: CapturedImage) => {
    try {
      setProcessing(true);
      const compressed = await cameraService.compressImage(image, 500); // 500KB target

      setCapturedImages((prev) =>
        prev.map((img) => (img.id === image.id ? compressed : img)),
      );

      if (selectedImage?.id === image.id) {
        setSelectedImage(compressed);
      }
    } catch (error) {
      console.error("Failed to compress image:", error);
      setError("Failed to compress image");
    } finally {
      setProcessing(false);
    }
  };

  const cleanup = () => {
    cameraService.cleanup();
  };

  const getCaptureTypeDescription = (type: CaptureOptions["type"]) => {
    switch (type) {
      case "wound":
        return "Optimized for wound documentation with medical enhancement";
      case "document":
        return "High contrast for medical documents and forms";
      case "vitals":
        return "Specialized for vital signs and medical device readings";
      case "general":
      default:
        return "General medical photography";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isInitialized && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing Camera
          </h2>
          <p className="text-gray-600">
            Setting up medical imaging capabilities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Camera
          </h1>
          <p className="text-gray-600">
            Healthcare-specific imaging for wound documentation and medical
            photography
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Camera Controls</span>
              </CardTitle>
              <CardDescription>
                Configure capture settings for medical imaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capture Type */}
              <div className="space-y-2">
                <Label htmlFor="capture-type">Capture Type</Label>
                <Select
                  value={captureType}
                  onValueChange={(value: CaptureOptions["type"]) =>
                    setCaptureType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capture type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wound">Wound Documentation</SelectItem>
                    <SelectItem value="document">Medical Document</SelectItem>
                    <SelectItem value="vitals">Vital Signs</SelectItem>
                    <SelectItem value="general">General Medical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {getCaptureTypeDescription(captureType)}
                </p>
              </div>

              {/* Quality Setting */}
              <div className="space-y-2">
                <Label htmlFor="quality">
                  Image Quality: {Math.round(quality * 100)}%
                </Label>
                <input
                  type="range"
                  id="quality"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add clinical observations or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Patient Context */}
              {(patientId || episodeId) && (
                <div className="space-y-2">
                  <Label>Patient Context</Label>
                  <div className="flex flex-wrap gap-2">
                    {patientId && (
                      <Badge variant="outline">Patient: {patientId}</Badge>
                    )}
                    {episodeId && (
                      <Badge variant="outline">Episode: {episodeId}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Capture Button */}
              <Button
                onClick={captureImage}
                disabled={isCapturing || processing || !isInitialized}
                className="w-full"
                size="lg"
              >
                {isCapturing || processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {processing ? "Processing..." : "Capturing..."}
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Captured Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Captured Images ({capturedImages.length})</span>
                </div>
                {capturedImages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCapturedImages([])}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Review and manage captured medical images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capturedImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images captured yet</p>
                  <p className="text-sm">
                    Use the camera controls to capture medical images
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capturedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedImage?.id === image.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">
                              {image.metadata.type}
                            </Badge>
                            {image.enhanced && (
                              <Badge className="bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Enhanced
                              </Badge>
                            )}
                            {image.processed && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Processed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {image.metadata.timestamp.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(image.metadata.size)} •
                            {image.metadata.dimensions.width}×
                            {image.metadata.dimensions.height} • Quality:{" "}
                            {Math.round(image.metadata.quality * 100)}%
                          </p>
                          {image.metadata.notes && (
                            <p className="text-sm text-gray-700 mt-1">
                              Notes: {image.metadata.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              compressImage(image);
                            }}
                            disabled={processing}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(image);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImage(image.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Image Preview */}
                      <div className="mt-2">
                        <img
                          src={image.dataUrl}
                          alt={`Medical image ${image.id}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Image Details */}
        {selectedImage && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Image Details</CardTitle>
              <CardDescription>
                Detailed information about the selected medical image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedImage.dataUrl}
                    alt={`Medical image ${selectedImage.id}`}
                    className="w-full rounded-lg border"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>ID:</strong> {selectedImage.id}
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedImage.metadata.type}
                      </p>
                      <p>
                        <strong>Timestamp:</strong>{" "}
                        {selectedImage.metadata.timestamp.toLocaleString()}
                      </p>
                      <p>
                        <strong>Size:</strong>{" "}
                        {formatFileSize(selectedImage.metadata.size)}
                      </p>
                      <p>
                        <strong>Dimensions:</strong>{" "}
                        {selectedImage.metadata.dimensions.width}×
                        {selectedImage.metadata.dimensions.height}
                      </p>
                      <p>
                        <strong>Quality:</strong>{" "}
                        {Math.round(selectedImage.metadata.quality * 100)}%
                      </p>
                      {selectedImage.metadata.patientId && (
                        <p>
                          <strong>Patient ID:</strong>{" "}
                          {selectedImage.metadata.patientId}
                        </p>
                      )}
                      {selectedImage.metadata.episodeId && (
                        <p>
                          <strong>Episode ID:</strong>{" "}
                          {selectedImage.metadata.episodeId}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedImage.metadata.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Clinical Notes</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedImage.metadata.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => downloadImage(selectedImage)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => compressImage(selectedImage)}
                      disabled={processing}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Compress
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileCameraCapture;
