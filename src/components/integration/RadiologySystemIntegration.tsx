/**
 * Radiology System Integration Component
 * DICOM image viewing, radiology reports, and PACS system integration
 */

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileImage,
  Monitor,
  Zap,
  Activity,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings,
} from "lucide-react";

import { healthcareIntegrationService } from "@/services/healthcare-integration.service";

interface RadiologySystemIntegrationProps {
  patientId?: string;
  className?: string;
}

const RadiologySystemIntegration: React.FC<RadiologySystemIntegrationProps> = ({
  patientId = "PAT-001",
  className = "",
}) => {
  const [radiologyIntegration, setRadiologyIntegration] = useState<any>(null);
  const [imagingStudies, setImagingStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    studyType: "",
    modality: "" as "CT" | "MRI" | "X-RAY" | "ULTRASOUND" | "MAMMOGRAPHY" | "",
    bodyPart: "",
    priority: "routine" as "routine" | "urgent" | "stat",
    orderedBy: "",
    clinicalIndication: "",
    contrast: false,
    specialInstructions: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    startDate: "",
    endDate: "",
    modality: "",
    studyType: "",
  });
  const [dicomViewer, setDicomViewer] = useState({
    zoom: 100,
    rotation: 0,
    brightness: 50,
    contrast: 50,
    windowLevel: 50,
    windowWidth: 50,
  });

  useEffect(() => {
    loadRadiologyData();
    initializeRadiologyIntegration();
  }, [patientId]);

  const initializeRadiologyIntegration = async () => {
    try {
      const integration =
        await healthcareIntegrationService.createRadiologyIntegration(
          patientId,
          `episode-${patientId}`,
          "Dubai Radiology Center",
        );
      setRadiologyIntegration(integration);
    } catch (error) {
      console.error("Error initializing radiology integration:", error);
    }
  };

  const loadRadiologyData = async () => {
    setLoading(true);
    try {
      const results = await healthcareIntegrationService.getImagingResults(
        patientId,
        {
          includeImages: true,
          includeDICOM: true,
          ...filterOptions,
        },
      );

      if (results) {
        setImagingStudies(results.studies || []);
      }
    } catch (error) {
      console.error("Error loading radiology data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStudy = async () => {
    if (!orderForm.studyType || !orderForm.modality || !orderForm.orderedBy) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await healthcareIntegrationService.orderImagingStudy(
        patientId,
        orderForm,
      );

      if (result.success) {
        alert(
          `Imaging study ordered successfully. Order ID: ${result.orderId}`,
        );
        setOrderForm({
          studyType: "",
          modality: "" as any,
          bodyPart: "",
          priority: "routine",
          orderedBy: "",
          clinicalIndication: "",
          contrast: false,
          specialInstructions: "",
        });
        await loadRadiologyData();
      } else {
        alert("Failed to order imaging study. Please try again.");
      }
    } catch (error) {
      console.error("Error ordering imaging study:", error);
      alert("Error ordering imaging study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (study: any, image: any) => {
    setSelectedStudy(study);
    setSelectedImage(image);

    if (image.sopInstanceUID) {
      try {
        const dicomData = await healthcareIntegrationService.getDICOMImage(
          study.studyInstanceUID,
          image.sopInstanceUID,
        );
        if (dicomData.success) {
          setSelectedImage({ ...image, ...dicomData });
        }
      } catch (error) {
        console.error("Error loading DICOM image:", error);
      }
    }
  };

  const adjustDicomViewer = (property: string, value: number) => {
    setDicomViewer((prev) => ({ ...prev, [property]: value }));
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "CT":
        return <Monitor className="h-5 w-5 text-blue-600" />;
      case "MRI":
        return <Activity className="h-5 w-5 text-purple-600" />;
      case "X-RAY":
        return <Camera className="h-5 w-5 text-gray-600" />;
      case "ULTRASOUND":
        return <Zap className="h-5 w-5 text-green-600" />;
      case "MAMMOGRAPHY":
        return <ImageIcon className="h-5 w-5 text-pink-600" />;
      default:
        return <FileImage className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "text-red-600 bg-red-100";
      case "urgent":
        return "text-orange-600 bg-orange-100";
      case "routine":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return "text-green-600 bg-green-100";
      case "preliminary":
        return "text-blue-600 bg-blue-100";
      case "amended":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={`bg-white min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="h-8 w-8 text-blue-600" />
              Radiology System Integration
            </h1>
            <p className="text-gray-600 mt-2">
              DICOM imaging, radiology reports, and PACS integration for Patient{" "}
              {patientId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadRadiologyData}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              PACS Settings
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Studies
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {imagingStudies.length}
                  </p>
                </div>
                <FileImage className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Reports
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      imagingStudies.filter(
                        (study) => study.report?.status === "preliminary",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Critical Findings
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      imagingStudies.filter(
                        (study) =>
                          study.report?.findings
                            ?.toLowerCase()
                            .includes("critical") ||
                          study.report?.findings
                            ?.toLowerCase()
                            .includes("urgent"),
                      ).length
                    }
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      imagingStudies.filter(
                        (study) =>
                          new Date(study.studyDate).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="studies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="studies">Imaging Studies</TabsTrigger>
            <TabsTrigger value="order">Order Study</TabsTrigger>
            <TabsTrigger value="viewer">DICOM Viewer</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Imaging Studies Tab */}
          <TabsContent value="studies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Imaging Studies</CardTitle>
                    <CardDescription>
                      Patient imaging studies from connected radiology systems
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagingStudies.map((study, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getModalityIcon(study.modality)}
                            <div>
                              <CardTitle className="text-lg">
                                {study.description}
                              </CardTitle>
                              <CardDescription>
                                {study.modality} - {study.bodyPart} |{" "}
                                {new Date(study.studyDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getReportStatusColor(
                                study.report?.status || "pending",
                              )}
                            >
                              {study.report?.status || "pending"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {study.images?.length || 0} images
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Images Grid */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Images ({study.images?.length || 0})
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {study.images
                                ?.slice(0, 6)
                                .map((image: any, imgIndex: number) => (
                                  <div
                                    key={imgIndex}
                                    className="relative aspect-square bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() =>
                                      handleImageSelect(study, image)
                                    }
                                  >
                                    {image.thumbnailUrl ? (
                                      <img
                                        src={image.thumbnailUrl}
                                        alt={`Image ${image.imageNumber}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                                      {image.imageNumber}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="absolute top-1 right-1 h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageSelect(study, image);
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                            {study.images?.length > 6 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                              >
                                View All {study.images.length} Images
                              </Button>
                            )}
                          </div>

                          {/* Report Summary */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Radiology Report
                            </h4>
                            {study.report ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Radiologist:
                                  </span>
                                  <span className="text-sm">
                                    {study.report.radiologist}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Report Date:
                                  </span>
                                  <span className="text-sm">
                                    {new Date(
                                      study.report.reportDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">
                                    Findings:
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                    {study.report.findings}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">
                                    Impression:
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {study.report.impression}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <FileImage className="h-4 w-4 mr-2" />
                                  View Full Report
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <FileImage className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Report pending</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Study Tab */}
          <TabsContent value="order" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Imaging Study</CardTitle>
                <CardDescription>
                  Request new imaging studies for the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="study-type">Study Type *</Label>
                      <Input
                        id="study-type"
                        value={orderForm.studyType}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            studyType: e.target.value,
                          }))
                        }
                        placeholder="e.g., Chest CT, Brain MRI"
                      />
                    </div>

                    <div>
                      <Label htmlFor="modality">Modality *</Label>
                      <Select
                        value={orderForm.modality}
                        onValueChange={(value: any) =>
                          setOrderForm((prev) => ({ ...prev, modality: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select modality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CT">CT Scan</SelectItem>
                          <SelectItem value="MRI">MRI</SelectItem>
                          <SelectItem value="X-RAY">X-Ray</SelectItem>
                          <SelectItem value="ULTRASOUND">Ultrasound</SelectItem>
                          <SelectItem value="MAMMOGRAPHY">
                            Mammography
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="body-part">Body Part</Label>
                      <Input
                        id="body-part"
                        value={orderForm.bodyPart}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            bodyPart: e.target.value,
                          }))
                        }
                        placeholder="e.g., Chest, Head, Abdomen"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={orderForm.priority}
                        onValueChange={(value: any) =>
                          setOrderForm((prev) => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ordered-by">Ordered By *</Label>
                      <Input
                        id="ordered-by"
                        value={orderForm.orderedBy}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            orderedBy: e.target.value,
                          }))
                        }
                        placeholder="Dr. Smith"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinical-indication">
                        Clinical Indication
                      </Label>
                      <Textarea
                        id="clinical-indication"
                        value={orderForm.clinicalIndication}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            clinicalIndication: e.target.value,
                          }))
                        }
                        placeholder="Clinical reason for the study..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="contrast"
                        checked={orderForm.contrast}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            contrast: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="contrast">Contrast Required</Label>
                    </div>

                    <div>
                      <Label htmlFor="special-instructions">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="special-instructions"
                        value={orderForm.specialInstructions}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            specialInstructions: e.target.value,
                          }))
                        }
                        placeholder="Any special instructions..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleOrderStudy}
                      disabled={
                        loading ||
                        !orderForm.studyType ||
                        !orderForm.modality ||
                        !orderForm.orderedBy
                      }
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Order Study
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DICOM Viewer Tab */}
          <TabsContent value="viewer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DICOM Image Viewer</CardTitle>
                <CardDescription>
                  Advanced medical image viewing with DICOM support
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedImage ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Image Viewer */}
                    <div className="lg:col-span-3">
                      <div className="bg-black rounded-lg aspect-square flex items-center justify-center relative">
                        {selectedImage.imageUrl || selectedImage.dicomUrl ? (
                          <img
                            src={
                              selectedImage.imageUrl || selectedImage.dicomUrl
                            }
                            alt="DICOM Image"
                            className="max-w-full max-h-full object-contain"
                            style={{
                              transform: `scale(${dicomViewer.zoom / 100}) rotate(${dicomViewer.rotation}deg)`,
                              filter: `brightness(${dicomViewer.brightness}%) contrast(${dicomViewer.contrast}%)`,
                            }}
                          />
                        ) : (
                          <div className="text-white text-center">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p>DICOM image loading...</p>
                          </div>
                        )}

                        {/* Image Controls Overlay */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-black/50 text-white border-gray-600"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-black/50 text-white border-gray-600"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-black/50 text-white border-gray-600"
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-black/50 text-white border-gray-600"
                          >
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Viewer Controls */}
                    <div className="space-y-4">
                      <div>
                        <Label>Zoom: {dicomViewer.zoom}%</Label>
                        <input
                          type="range"
                          min="25"
                          max="400"
                          value={dicomViewer.zoom}
                          onChange={(e) =>
                            adjustDicomViewer("zoom", parseInt(e.target.value))
                          }
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Brightness: {dicomViewer.brightness}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={dicomViewer.brightness}
                          onChange={(e) =>
                            adjustDicomViewer(
                              "brightness",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Contrast: {dicomViewer.contrast}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={dicomViewer.contrast}
                          onChange={(e) =>
                            adjustDicomViewer(
                              "contrast",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Window Level</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dicomViewer.windowLevel}
                          onChange={(e) =>
                            adjustDicomViewer(
                              "windowLevel",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Window Width</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dicomViewer.windowWidth}
                          onChange={(e) =>
                            adjustDicomViewer(
                              "windowWidth",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full mt-2"
                        />
                      </div>

                      {selectedImage.metadata && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">DICOM Metadata</h4>
                          <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                            <div>
                              Study UID: {selectedStudy?.studyInstanceUID}
                            </div>
                            <div>SOP UID: {selectedImage.sopInstanceUID}</div>
                            <div>Image #: {selectedImage.imageNumber}</div>
                            {selectedImage.dicomTags && (
                              <div className="mt-2">
                                <strong>DICOM Tags:</strong>
                                <pre className="text-xs mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(
                                    selectedImage.dicomTags,
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Image Selected
                    </h3>
                    <p className="text-gray-600">
                      Select an image from the studies tab to view it here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Radiology Reports</CardTitle>
                <CardDescription>
                  Detailed radiology reports and findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagingStudies
                    .filter((study) => study.report)
                    .map((study, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {study.description}
                              </CardTitle>
                              <CardDescription>
                                {study.modality} |{" "}
                                {new Date(study.studyDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge
                              className={getReportStatusColor(
                                study.report.status,
                              )}
                            >
                              {study.report.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">
                                Report Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Radiologist:</strong>{" "}
                                  {study.report.radiologist}
                                </div>
                                <div>
                                  <strong>Report Date:</strong>{" "}
                                  {new Date(
                                    study.report.reportDate,
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  <strong>Report ID:</strong>{" "}
                                  {study.report.reportId}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Study Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Study UID:</strong>{" "}
                                  {study.studyInstanceUID}
                                </div>
                                <div>
                                  <strong>Body Part:</strong> {study.bodyPart}
                                </div>
                                <div>
                                  <strong>Images:</strong>{" "}
                                  {study.images?.length || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Findings</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                {study.report.findings}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Impression</h4>
                              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                {study.report.impression}
                              </p>
                            </div>

                            {study.report.recommendations && (
                              <div>
                                <h4 className="font-medium mb-2">
                                  Recommendations
                                </h4>
                                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                                  {study.report.recommendations}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Report
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Images
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Distribution</CardTitle>
                  <CardDescription>Breakdown by modality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { modality: "CT", count: 8, percentage: 40 },
                      { modality: "MRI", count: 5, percentage: 25 },
                      { modality: "X-RAY", count: 4, percentage: 20 },
                      { modality: "ULTRASOUND", count: 2, percentage: 10 },
                      { modality: "MAMMOGRAPHY", count: 1, percentage: 5 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getModalityIcon(item.modality)}
                          <span className="text-sm font-medium">
                            {item.modality}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Turnaround Time</CardTitle>
                  <CardDescription>
                    Average time to report completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        modality: "X-RAY",
                        avgTime: "2.5 hours",
                        status: "excellent",
                      },
                      { modality: "CT", avgTime: "4.2 hours", status: "good" },
                      {
                        modality: "ULTRASOUND",
                        avgTime: "3.1 hours",
                        status: "good",
                      },
                      { modality: "MRI", avgTime: "8.7 hours", status: "fair" },
                      {
                        modality: "MAMMOGRAPHY",
                        avgTime: "24 hours",
                        status: "fair",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {getModalityIcon(item.modality)}
                          <span className="font-medium">{item.modality}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {item.avgTime}
                          </div>
                          <div
                            className={`text-xs ${
                              item.status === "excellent"
                                ? "text-green-600"
                                : item.status === "good"
                                  ? "text-blue-600"
                                  : "text-yellow-600"
                            }`}
                          >
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RadiologySystemIntegration;
