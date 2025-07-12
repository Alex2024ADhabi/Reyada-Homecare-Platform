/**
 * Mobile PWA Dashboard
 * Main dashboard for mobile Progressive Web App features
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Camera,
  Mic,
  Fingerprint,
  MapPin,
  Wifi,
  WifiOff,
  Download,
  Bell,
  Shield,
  Activity,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

// Import mobile services
import { MobilePWAService } from "@/services/mobile-pwa.service";
import { MobileCameraService } from "@/services/mobile-camera.service";
import { VoiceToTextService } from "@/services/voice-to-text.service";
import { BiometricAuthService } from "@/services/biometric-auth.service";
import { GeolocationService } from "@/services/geolocation.service";

interface ServiceStatus {
  name: string;
  status: "active" | "inactive" | "error";
  description: string;
  icon: React.ReactNode;
  details?: any;
}

interface PWACapability {
  name: string;
  available: boolean;
  description: string;
  icon: React.ReactNode;
}

const MobilePWADashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [capabilities, setCapabilities] = useState<PWACapability[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);
  const [loading, setLoading] = useState(true);

  // Service instances
  const pwaService = MobilePWAService.getInstance();
  const cameraService = MobileCameraService.getInstance();
  const voiceService = VoiceToTextService.getInstance();
  const biometricService = BiometricAuthService.getInstance();
  const locationService = GeolocationService.getInstance();

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Initialize all services
      await Promise.all([
        pwaService.initialize(),
        cameraService.initialize(),
        voiceService.initialize(),
        biometricService.initialize(),
        locationService.initialize(),
      ]);

      // Update service statuses
      updateServiceStatuses();

      // Update capabilities
      updateCapabilities();

      // Check installation status
      checkInstallationStatus();

      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize PWA dashboard:", error);
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Install prompt event
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // App installed event
    window.addEventListener("appinstalled", handleAppInstalled);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
  };

  const handleOnline = () => {
    setIsOnline(true);
    updateServiceStatuses();
  };

  const handleOffline = () => {
    setIsOnline(false);
    updateServiceStatuses();
  };

  const handleInstallPrompt = (event: any) => {
    event.preventDefault();
    setInstallPrompt(event);
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    setInstallPrompt(null);
  };

  const updateServiceStatuses = () => {
    const serviceStatuses: ServiceStatus[] = [
      {
        name: "PWA Core",
        status: pwaService.getServiceStatus().isInitialized
          ? "active"
          : "inactive",
        description: "Progressive Web App core functionality",
        icon: <Smartphone className="h-5 w-5" />,
        details: pwaService.getServiceStatus(),
      },
      {
        name: "Camera",
        status: cameraService.getServiceStatus().isInitialized
          ? "active"
          : "inactive",
        description: "Medical imaging and wound documentation",
        icon: <Camera className="h-5 w-5" />,
        details: cameraService.getServiceStatus(),
      },
      {
        name: "Voice Input",
        status: voiceService.getServiceStatus().isInitialized
          ? "active"
          : "inactive",
        description: "Voice-to-text with medical terminology",
        icon: <Mic className="h-5 w-5" />,
        details: voiceService.getServiceStatus(),
      },
      {
        name: "Biometric Auth",
        status: biometricService.getServiceStatus().isInitialized
          ? "active"
          : "inactive",
        description: "Secure biometric authentication",
        icon: <Fingerprint className="h-5 w-5" />,
        details: biometricService.getServiceStatus(),
      },
      {
        name: "Geolocation",
        status: locationService.getServiceStatus().isInitialized
          ? "active"
          : "inactive",
        description: "Location services and geofencing",
        icon: <MapPin className="h-5 w-5" />,
        details: locationService.getServiceStatus(),
      },
    ];

    setServices(serviceStatuses);

    // Update offline queue size
    const pwaStatus = pwaService.getServiceStatus();
    setOfflineQueueSize(pwaStatus.offlineQueueSize || 0);
  };

  const updateCapabilities = () => {
    const pwaCapabilities: PWACapability[] = [
      {
        name: "Service Worker",
        available: "serviceWorker" in navigator,
        description: "Background processing and caching",
        icon: <Activity className="h-4 w-4" />,
      },
      {
        name: "Push Notifications",
        available: "Notification" in window,
        description: "Real-time notifications",
        icon: <Bell className="h-4 w-4" />,
      },
      {
        name: "Camera Access",
        available: "mediaDevices" in navigator,
        description: "Camera for medical imaging",
        icon: <Camera className="h-4 w-4" />,
      },
      {
        name: "Geolocation",
        available: "geolocation" in navigator,
        description: "Location tracking and geofencing",
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        name: "Web Authentication",
        available: "credentials" in navigator,
        description: "Biometric authentication",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        name: "Speech Recognition",
        available:
          "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
        description: "Voice-to-text input",
        icon: <Mic className="h-4 w-4" />,
      },
    ];

    setCapabilities(pwaCapabilities);
  };

  const checkInstallationStatus = () => {
    // Check if app is installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        console.log("PWA installation accepted");
      } else {
        console.log("PWA installation dismissed");
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error("PWA installation failed:", error);
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing Mobile PWA
          </h2>
          <p className="text-gray-600">Loading healthcare mobile features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mobile PWA Dashboard
              </h1>
              <p className="text-gray-600">
                Healthcare Progressive Web App Management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isOnline ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Install Button */}
              {!isInstalled && installPrompt && (
                <Button
                  onClick={handleInstallApp}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Install App</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    App Status
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isInstalled ? "Installed" : "Web App"}
                  </p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.filter((s) => s.status === "active").length}/
                    {services.length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Offline Queue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offlineQueueSize}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Connection
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
                {isOnline ? (
                  <Wifi className="h-8 w-8 text-green-500" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {service.icon}
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge
                          variant={
                            service.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            service.status === "active"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {service.status}
                        </Badge>
                      </div>
                      {service.details && (
                        <div className="text-xs text-gray-500">
                          <p>
                            Initialized:{" "}
                            {service.details.isInitialized ? "Yes" : "No"}
                          </p>
                          {service.details.productionReady && (
                            <p>Production Ready: Yes</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((capability, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {capability.icon}
                        <h3 className="font-medium">{capability.name}</h3>
                      </div>
                      {capability.available ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {capability.description}
                    </p>
                    <div className="mt-2">
                      <Badge
                        variant={capability.available ? "default" : "secondary"}
                        className={
                          capability.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {capability.available ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>PWA Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure Progressive Web App features and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Offline Features</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Offline form submission</p>
                      <p>• Background data sync</p>
                      <p>• Cached medical forms</p>
                      <p>• Offline image processing</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Security Features</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Biometric authentication</p>
                      <p>• Encrypted data storage</p>
                      <p>• HIPAA compliance</p>
                      <p>• Audit logging</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Service Worker Status</h4>
                      <p className="text-sm text-gray-600">
                        Background processing and caching
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobilePWADashboard;
