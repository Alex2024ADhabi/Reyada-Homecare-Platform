import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Battery,
  MapPin,
  Bell,
  Download,
  Smartphone,
  Activity,
  Heart,
  Thermometer,
  User,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload,
  Save,
  Send,
  Image,
  Volume2,
  VolumeX,
  Loader2,
  Shield,
  Sync,
  SyncOff,
  Navigation,
  Settings,
  HelpCircle,
  Star,
  Stethoscope,
  Pill,
  Clipboard,
  Calendar,
  Users,
  Phone,
  MessageSquare,
  Video,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  mobilePWAService,
  CameraCapture,
  VoiceRecording,
} from "@/services/mobile-pwa.service";
import { offlineService } from "@/services/offline.service";
import { performanceMonitoringService } from "@/services/performance-monitoring.service";

interface MobileOptimizedComponentsProps {
  patientId?: string;
  formType?: string;
  isOffline?: boolean;
  onFormSubmit?: (data: any) => void;
  onCameraCapture?: (capture: CameraCapture) => void;
  onVoiceRecording?: (recording: VoiceRecording) => void;
}

const MobileOptimizedComponents: React.FC<MobileOptimizedComponentsProps> = ({
  patientId = "PAT-001",
  formType = "assessment",
  isOffline = false,
  onFormSubmit,
  onCameraCapture,
  onVoiceRecording,
}) => {
  // Enhanced state management
  const [isRecording, setIsRecording] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [networkStatus, setNetworkStatus] = useState("online");
  const [location, setLocation] = useState({
    lat: 25.2048,
    lng: 55.2708,
    accuracy: 0,
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pwaCapabilities, setPwaCapabilities] = useState(
    mobilePWAService.getCapabilities(),
  );
  const [syncStatus, setSyncStatus] = useState("synced");
  const [formData, setFormData] = useState({
    patientName: "John Doe",
    assessmentType: "Initial Assessment",
    temperature: "98.6",
    heartRate: "72",
    bloodPressure: "120/80",
    oxygenSat: "98",
    clinicalNotes: "Patient appears stable. No acute distress noted.",
    voiceNotes: "",
    images: [] as CameraCapture[],
    recordings: [] as VoiceRecording[],
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "urgent",
      message: "Patient vitals require immediate attention",
      time: "2 min ago",
      priority: "critical" as const,
      read: false,
    },
    {
      id: 2,
      type: "info",
      message: "Daily assessment form completed",
      time: "15 min ago",
      priority: "normal" as const,
      read: false,
    },
    {
      id: 3,
      type: "warning",
      message: "Medication reminder for Patient PAT-002",
      time: "30 min ago",
      priority: "high" as const,
      read: true,
    },
  ]);

  const [vitalSigns, setVitalSigns] = useState({
    temperature: "98.6°F",
    heartRate: "72 bpm",
    bloodPressure: "120/80",
    oxygenSat: "98%",
    respiratoryRate: "16/min",
    painScale: "2/10",
    lastUpdated: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    // Initialize PWA service and capabilities
    const initializeMobile = async () => {
      try {
        const capabilities = mobilePWAService.getCapabilities();
        setPwaCapabilities(capabilities);
        setBatteryLevel(capabilities.batteryLevel || 85);
        setNetworkStatus(capabilities.isOnline ? "online" : "offline");

        // Request permissions
        if (!capabilities.hasNotifications) {
          await mobilePWAService.requestNotificationPermission();
        }

        // Get current location
        if (capabilities.hasGeolocation) {
          try {
            const position = await mobilePWAService.getCurrentLocation();
            setLocation({
              lat: position.latitude,
              lng: position.longitude,
              accuracy: position.accuracy,
            });
          } catch (error) {
            console.log("Location access denied or unavailable");
          }
        }
      } catch (error) {
        console.error("Failed to initialize mobile capabilities:", error);
      }
    };

    initializeMobile();

    // Set up event listeners
    const handleCapabilitiesChange = (capabilities: any) => {
      setPwaCapabilities(capabilities);
      setBatteryLevel(capabilities.batteryLevel || batteryLevel);
    };

    const handleNetworkChange = (status: any) => {
      setNetworkStatus(status.isOnline ? "online" : "offline");
    };

    const handleBatteryChange = (battery: any) => {
      setBatteryLevel(battery.level);
    };

    mobilePWAService.on("capabilities-detected", handleCapabilitiesChange);
    mobilePWAService.on("network-status-changed", handleNetworkChange);
    mobilePWAService.on("battery-changed", handleBatteryChange);

    // Sync status monitoring
    const syncInterval = setInterval(() => {
      const queueSize = offlineService.getQueueSize();
      setSyncStatus(queueSize > 0 ? "pending" : "synced");
      if (queueSize === 0) {
        setLastSync(new Date());
      }
    }, 5000);

    // Performance monitoring
    const perfInterval = setInterval(() => {
      performanceMonitoringService.recordMetric({
        type: "mobile",
        name: "Mobile_Session_Active",
        value: 1,
        unit: "status",
        metadata: {
          patientId,
          formType,
          batteryLevel,
          networkStatus,
        },
      });
    }, 30000);

    return () => {
      mobilePWAService.off("capabilities-detected", handleCapabilitiesChange);
      mobilePWAService.off("network-status-changed", handleNetworkChange);
      mobilePWAService.off("battery-changed", handleBatteryChange);
      clearInterval(syncInterval);
      clearInterval(perfInterval);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [patientId, formType, batteryLevel, networkStatus]);

  const handleVoiceRecording = async () => {
    try {
      if (!isRecording) {
        // Start recording
        setIsRecording(true);
        setRecordingDuration(0);

        // Start timer
        recordingTimer.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        const recording = await mobilePWAService.startVoiceRecording({
          patientId,
          formField: activeTab,
          medicalContext: true,
        });

        // Handle recording completion
        setFormData((prev) => ({
          ...prev,
          recordings: [...prev.recordings, recording],
          voiceNotes: prev.voiceNotes + (recording.transcription || "") + " ",
        }));

        if (onVoiceRecording) {
          onVoiceRecording(recording);
        }

        // Show notification for medical terms detected
        if (recording.medicalTerms && recording.medicalTerms.length > 0) {
          await mobilePWAService.showNotification("Medical Terms Detected", {
            body: `Detected: ${recording.medicalTerms.join(", ")}`,
            tag: "medical-terms",
            priority: "normal",
          });
        }
      } else {
        // Stop recording
        mobilePWAService.stopVoiceRecording();
        setIsRecording(false);
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
      }
    } catch (error) {
      console.error("Voice recording failed:", error);
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      await mobilePWAService.showNotification("Recording Failed", {
        body: "Unable to access microphone. Please check permissions.",
        tag: "recording-error",
        priority: "high",
      });
    }
  };

  const handleCameraCapture = async () => {
    try {
      if (!cameraActive) {
        setCameraActive(true);
        setIsCapturing(true);

        const capture = await mobilePWAService.captureImage("wound", {
          patientId,
          location: `${location.lat}, ${location.lng}`,
          notes: `Captured during ${formType} assessment`,
        });

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, capture],
        }));

        if (onCameraCapture) {
          onCameraCapture(capture);
        }

        await mobilePWAService.showNotification("Image Captured", {
          body: "Wound documentation image saved successfully",
          tag: "image-captured",
          priority: "normal",
        });
      }

      setCameraActive(false);
      setIsCapturing(false);
    } catch (error) {
      console.error("Camera capture failed:", error);
      setCameraActive(false);
      setIsCapturing(false);

      await mobilePWAService.showNotification("Camera Error", {
        body: "Unable to access camera. Please check permissions.",
        tag: "camera-error",
        priority: "high",
      });
    }
  };

  const handleInstallPWA = async () => {
    try {
      const installed = await mobilePWAService.promptInstall();
      if (installed) {
        await mobilePWAService.showNotification("App Installed", {
          body: "Reyada Homecare app installed successfully!",
          tag: "app-installed",
          priority: "normal",
        });
      }
    } catch (error) {
      console.error("PWA installation failed:", error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true);

      const submissionData = {
        ...formData,
        patientId,
        formType,
        timestamp: new Date().toISOString(),
        location,
        deviceInfo: {
          batteryLevel,
          networkStatus,
          capabilities: pwaCapabilities,
        },
      };

      if (networkStatus === "online") {
        // Submit directly
        if (onFormSubmit) {
          await onFormSubmit(submissionData);
        }

        await mobilePWAService.showNotification("Form Submitted", {
          body: "Clinical assessment submitted successfully",
          tag: "form-submitted",
          priority: "normal",
        });
      } else {
        // Queue for offline sync
        await offlineService.queueRequest({
          url: "/api/clinical/assessments",
          method: "POST",
          data: submissionData,
        });

        await mobilePWAService.showNotification("Form Queued", {
          body: "Form saved offline. Will sync when connection is restored.",
          tag: "form-queued",
          priority: "normal",
        });
      }

      // Reset form
      setFormData({
        patientName: "",
        assessmentType: "",
        temperature: "",
        heartRate: "",
        bloodPressure: "",
        oxygenSat: "",
        clinicalNotes: "",
        voiceNotes: "",
        images: [],
        recordings: [],
      });
    } catch (error) {
      console.error("Form submission failed:", error);
      await mobilePWAService.showNotification("Submission Failed", {
        body: "Unable to submit form. Please try again.",
        tag: "submission-error",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationDismiss = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case "synced":
        return <Sync className="h-4 w-4 text-green-600" />;
      case "pending":
        return <SyncOff className="h-4 w-4 text-yellow-600" />;
      default:
        return <SyncOff className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Enhanced Mobile Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">Reyada Mobile</h1>
          <div className="flex items-center space-x-2">
            {/* Network Status */}
            {networkStatus === "online" ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            {/* Sync Status */}
            {getSyncStatusIcon()}
            {/* Battery Level */}
            <div className="flex items-center space-x-1">
              <Battery className={`h-4 w-4 ${getBatteryColor(batteryLevel)}`} />
              <span className={`text-xs ${getBatteryColor(batteryLevel)}`}>
                {batteryLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Status Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-600">Location</div>
            <div className="text-xs font-semibold">
              {location.accuracy > 0
                ? `±${Math.round(location.accuracy)}m`
                : "Unknown"}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-600">Sync</div>
            <div className="text-xs font-semibold capitalize">{syncStatus}</div>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-600">Mode</div>
            <div className="text-xs font-semibold">
              {pwaCapabilities.isStandalone ? "App" : "Web"}
            </div>
          </div>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <Alert className="mb-3">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Working offline. Data will sync when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* PWA Install Prompt */}
        {pwaCapabilities.canInstall && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Install app for better experience
                </span>
              </div>
              <Button size="sm" onClick={handleInstallPWA}>
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Quick Actions</span>
            <Badge variant="outline">{formType}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={cameraActive ? "default" : "outline"}
              className="h-16 flex-col space-y-1"
              onClick={handleCameraCapture}
              disabled={isCapturing || !pwaCapabilities.hasCamera}
            >
              {isCapturing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
              <span className="text-xs">
                {isCapturing ? "Capturing..." : "Camera"}
              </span>
            </Button>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              className="h-16 flex-col space-y-1"
              onClick={handleVoiceRecording}
              disabled={!pwaCapabilities.hasMicrophone}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  <span className="text-xs">
                    {formatRecordingDuration(recordingDuration)}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span className="text-xs">Record</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-1"
              disabled={!pwaCapabilities.hasGeolocation}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Location</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1">
              <Bell className="h-5 w-5" />
              <span className="text-xs">Alerts</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Patient Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Current Patient</span>
            <Badge
              variant={networkStatus === "online" ? "default" : "secondary"}
            >
              {networkStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Patient ID:</span>
              <span className="text-sm font-medium">{patientId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Form Type:</span>
              <Badge variant="outline">{formType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Visit:</span>
              <span className="text-sm text-gray-600">2 days ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="text-sm text-gray-600">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Vital Signs */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Vital Signs</span>
            </div>
            <span className="text-xs text-gray-500">
              {vitalSigns.lastUpdated}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Thermometer className="h-4 w-4 mx-auto mb-1 text-red-500" />
              <div className="text-xs text-gray-600">Temperature</div>
              <div className="text-sm font-semibold">
                {vitalSigns.temperature}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
              <div className="text-xs text-gray-600">Heart Rate</div>
              <div className="text-sm font-semibold">
                {vitalSigns.heartRate}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <div className="text-xs text-gray-600">Blood Pressure</div>
              <div className="text-sm font-semibold">
                {vitalSigns.bloodPressure}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <div className="text-xs text-gray-600">Oxygen Sat</div>
              <div className="text-sm font-semibold">
                {vitalSigns.oxygenSat}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Stethoscope className="h-4 w-4 mx-auto mb-1 text-purple-500" />
              <div className="text-xs text-gray-600">Respiratory</div>
              <div className="text-sm font-semibold">
                {vitalSigns.respiratoryRate}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Star className="h-4 w-4 mx-auto mb-1 text-orange-500" />
              <div className="text-xs text-gray-600">Pain Scale</div>
              <div className="text-sm font-semibold">
                {vitalSigns.painScale}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Notifications */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            <Badge variant="destructive">
              {notifications.filter((n) => !n.read).length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  notification.read
                    ? "bg-gray-50"
                    : "bg-blue-50 border border-blue-200"
                }`}
                onClick={() => handleNotificationDismiss(notification.id)}
              >
                {notification.type === "urgent" ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                ) : notification.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-medium"}`}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {notification.time}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Mobile Form Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Clinical Form</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Advanced</span>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
                size="sm"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Patient Name
                </label>
                <Input
                  placeholder="Enter patient name"
                  className="mt-1"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      patientName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Assessment Type
                </label>
                <Input
                  placeholder="Enter assessment type"
                  className="mt-1"
                  value={formData.assessmentType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assessmentType: e.target.value,
                    }))
                  }
                />
              </div>
              {showAdvanced && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="text-sm font-medium text-gray-700">
                    Captured Media
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <Image className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs">
                        {formData.images.length} Images
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <Mic className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs">
                        {formData.recordings.length} Recordings
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="vitals" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Temperature
                  </label>
                  <Input
                    placeholder="°F"
                    className="mt-1"
                    value={formData.temperature}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        temperature: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Heart Rate
                  </label>
                  <Input
                    placeholder="bpm"
                    className="mt-1"
                    value={formData.heartRate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        heartRate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Blood Pressure
                  </label>
                  <Input
                    placeholder="120/80"
                    className="mt-1"
                    value={formData.bloodPressure}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bloodPressure: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Oxygen Sat
                  </label>
                  <Input
                    placeholder="%"
                    className="mt-1"
                    value={formData.oxygenSat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        oxygenSat: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              {showAdvanced && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Vital Signs Trend
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-600 text-center">
                      Trend analysis would appear here
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-3 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Clinical Notes
                </label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  placeholder="Enter clinical observations and notes..."
                  value={formData.clinicalNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicalNotes: e.target.value,
                    }))
                  }
                />
              </div>

              {formData.voiceNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Voice Transcription
                  </label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    {formData.voiceNotes}
                  </div>
                </div>
              )}

              <Button
                variant={isRecording ? "destructive" : "outline"}
                className="w-full"
                onClick={handleVoiceRecording}
                disabled={!pwaCapabilities.hasMicrophone}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording ({formatRecordingDuration(recordingDuration)}
                    )
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice to Text
                  </>
                )}
              </Button>

              {showAdvanced && (
                <div className="pt-3 border-t space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    AI Assistance
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Zap className="h-3 w-3 mr-2" />
                    Suggest Clinical Terms
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Shield className="h-3 w-3 mr-2" />
                    Check DOH Compliance
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex space-x-2 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              className="flex-1"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Form
                </>
              )}
            </Button>
          </div>

          {/* Sync Status Footer */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                {getSyncStatusIcon()}
                <span>Last sync: {lastSync.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{networkStatus}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedComponents;
