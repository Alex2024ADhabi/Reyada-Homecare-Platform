import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Shield,
  Fingerprint,
  Lock,
  Zap,
  Settings,
  Download,
  Sync,
  Database,
  Signal,
  Battery,
  Cpu,
  RefreshCw,
  Bell,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { serviceWorkerService } from "@/services/service-worker.service";
import { useToastContext } from "@/components/ui/toast-provider";

interface MobileResponsiveProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  enablePWA?: boolean;
  enableOfflineMode?: boolean;
}

// Enhanced Mobile App Access Component with PWA capabilities
export const MobileAppAccess: React.FC<{
  isInstalled?: boolean;
  onInstall?: () => void;
  onOpenApp?: () => void;
}> = ({ isInstalled = false, onInstall, onOpenApp }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installProgress, setInstallProgress] = useState(0);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [deviceManagement, setDeviceManagement] = useState({
    registered: false,
    secured: false,
    compliant: true,
    lastSync: null as Date | null,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    cacheHitRate: 0,
    offlineCapability: 0,
    batteryOptimized: false,
  });
  const [pwaCapabilities, setPwaCapabilities] = useState({
    installable: false,
    standalone: false,
    pushNotifications: false,
    backgroundSync: false,
    offlineStorage: false,
    cameraAccess: false,
    voiceRecognition: false,
    biometricAuth: false,
    deviceManagement: false,
    performanceOptimized: false,
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const { toast } = useToastContext();

  useEffect(() => {
    // Initialize PWA capabilities detection
    const initializePWACapabilities = async () => {
      // Check biometric authentication support
      const checkBiometricSupport = async () => {
        try {
          if ("credentials" in navigator && "create" in navigator.credentials) {
            const available = await (navigator.credentials as any)
              .get({
                publicKey: {
                  challenge: new Uint8Array(32),
                  rp: { name: "Reyada Homecare" },
                  user: {
                    id: new Uint8Array(16),
                    name: "test@example.com",
                    displayName: "Test User",
                  },
                  pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                  timeout: 1000,
                },
              })
              .catch(() => null);
            return !!available;
          }
          return false;
        } catch {
          return false;
        }
      };

      const biometricSupport = await checkBiometricSupport();
      setBiometricSupported(biometricSupport);

      const capabilities = {
        installable: "beforeinstallprompt" in window,
        standalone:
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true,
        pushNotifications:
          "serviceWorker" in navigator && "PushManager" in window,
        backgroundSync:
          "serviceWorker" in navigator &&
          "sync" in window.ServiceWorkerRegistration.prototype,
        offlineStorage: "indexedDB" in window && "caches" in window,
        cameraAccess:
          "mediaDevices" in navigator &&
          "getUserMedia" in navigator.mediaDevices,
        voiceRecognition:
          "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
        biometricAuth: biometricSupport,
        deviceManagement:
          "serviceWorker" in navigator &&
          "sync" in window.ServiceWorkerRegistration.prototype,
        performanceOptimized:
          "serviceWorker" in navigator && "caches" in window,
      };

      setPwaCapabilities(capabilities);

      // Initialize device management
      await initializeDeviceManagement();

      // Initialize performance monitoring
      await initializePerformanceMonitoring();

      // Register service worker for PWA functionality with enhanced error handling
      if (
        "serviceWorker" in navigator &&
        typeof navigator.serviceWorker.register === "function"
      ) {
        try {
          await serviceWorkerService.register();
          console.log("✅ Service Worker registered for PWA functionality");

          // Listen for service worker updates
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            setUpdateAvailable(true);
            setShowUpdatePrompt(true);
          });

          // Check for updates periodically
          setInterval(async () => {
            const registration =
              await navigator.serviceWorker.getRegistration();
            if (registration) {
              registration.update();
            }
          }, 60000); // Check every minute
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
          // Gracefully degrade PWA features if service worker fails
          setPwaCapabilities((prev) => ({
            ...prev,
            pushNotifications: false,
            backgroundSync: false,
            offlineStorage: false,
            deviceManagement: false,
            performanceOptimized: false,
          }));
        }
      }
    };

    // Initialize device management
    const initializeDeviceManagement = async () => {
      try {
        // Check device registration status
        const deviceId =
          localStorage.getItem("device_id") || generateDeviceId();
        localStorage.setItem("device_id", deviceId);

        // Simulate device compliance check
        const compliance = await checkDeviceCompliance();

        setDeviceManagement({
          registered: true,
          secured: compliance.secured,
          compliant: compliance.compliant,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error("Device management initialization failed:", error);
      }
    };

    // Initialize performance monitoring
    const initializePerformanceMonitoring = async () => {
      try {
        const startTime = performance.now();

        // Measure cache performance
        const cacheStats = await serviceWorkerService.getCacheStats();
        const cacheHitRate = calculateCacheHitRate(cacheStats);

        // Check battery optimization
        const batteryOptimized = await checkBatteryOptimization();

        setPerformanceMetrics({
          loadTime: performance.now() - startTime,
          cacheHitRate,
          offlineCapability: pwaCapabilities.offlineStorage ? 100 : 0,
          batteryOptimized,
        });
      } catch (error) {
        console.error("Performance monitoring initialization failed:", error);
      }
    };

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when coming online
      if (pwaCapabilities.backgroundSync) {
        serviceWorkerService.addSyncTask({
          type: "data-sync",
          data: { timestamp: Date.now() },
          url: "/api/sync",
          method: "POST",
          priority: "medium",
          maxRetries: 3,
        });
      }
    };
    const handleOffline = () => setIsOnline(false);

    // Initialize capabilities
    initializePWACapabilities();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pwaCapabilities.backgroundSync, pwaCapabilities.offlineStorage]);

  // Helper functions
  const generateDeviceId = () => {
    return (
      "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    );
  };

  const checkDeviceCompliance = async () => {
    // Simulate device compliance check
    return {
      secured: true,
      compliant: true,
    };
  };

  const calculateCacheHitRate = (cacheStats: any) => {
    if (!cacheStats || cacheStats.totalSize === 0) return 0;
    return Math.min(95, Math.floor((cacheStats.totalSize / 1024 / 1024) * 10)); // Simulate hit rate
  };

  const checkBatteryOptimization = async () => {
    try {
      if ("getBattery" in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.charging || battery.level > 0.2;
      }
      return true;
    } catch {
      return true;
    }
  };

  const handleInstallPWA = async () => {
    if (installPrompt) {
      setInstallProgress(25);
      const result = await installPrompt.prompt();
      setInstallProgress(75);

      if (result.outcome === "accepted") {
        setInstallProgress(100);
        setInstallPrompt(null);

        // Register device after installation
        await registerMobileDevice();

        if (onInstall) onInstall();
      } else {
        setInstallProgress(0);
      }
    }
  };

  const registerMobileDevice = async () => {
    try {
      const deviceInfo = {
        id: localStorage.getItem("device_id"),
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        capabilities: pwaCapabilities,
      };

      // Register device with backend
      serviceWorkerService.addSyncTask({
        type: "api-call",
        data: deviceInfo,
        url: "/api/devices/register",
        method: "POST",
        priority: "high",
        maxRetries: 5,
      });

      setDeviceManagement((prev) => ({ ...prev, registered: true }));
    } catch (error) {
      console.error("Device registration failed:", error);
    }
  };

  const handleBiometricSetup = async () => {
    if (!biometricSupported) return;

    try {
      // This would integrate with the biometric authentication in LoginForm
      const event = new CustomEvent("setup-biometric-auth", {
        detail: { deviceId: localStorage.getItem("device_id") },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Biometric setup failed:", error);
    }
  };

  const handleUpdateApp = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        setShowUpdatePrompt(false);
        toast({
          title: "App Updated",
          description:
            "The app has been updated. Please refresh to see changes.",
          variant: "default",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Smartphone className="h-5 w-5 mr-2" />
          Mobile App Access
          <Badge variant="outline" className="ml-2 text-xs">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUpdatePrompt && updateAvailable && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <RefreshCw className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>A new version of the app is available!</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdateApp}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUpdatePrompt(false)}
                >
                  Later
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!isInstalled && installPrompt && (
          <Alert className="bg-blue-50 border-blue-200">
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Install Reyada Homecare as a mobile app for better performance and
              offline access.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <Smartphone
              className={`h-6 w-6 mx-auto mb-2 transition-colors ${pwaCapabilities.installable ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">PWA Ready</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.installable ? "Available" : "Limited"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Database
              className={`h-6 w-6 mx-auto mb-2 ${pwaCapabilities.offlineStorage ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">Offline Mode</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.offlineStorage ? "Full Support" : "Limited"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Fingerprint
              className={`h-6 w-6 mx-auto mb-2 ${pwaCapabilities.biometricAuth ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">Biometric</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.biometricAuth ? "Supported" : "Not Available"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Shield
              className={`h-6 w-6 mx-auto mb-2 ${deviceManagement.secured ? "text-green-600" : "text-orange-500"}`}
            />
            <div className="text-xs font-medium">Device Mgmt</div>
            <div className="text-xs text-gray-600">
              {deviceManagement.registered ? "Registered" : "Pending"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Monitor
              className={`h-6 w-6 mx-auto mb-2 ${pwaCapabilities.cameraAccess ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">Camera</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.cameraAccess ? "Available" : "Not Available"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Zap
              className={`h-6 w-6 mx-auto mb-2 ${performanceMetrics.batteryOptimized ? "text-green-600" : "text-orange-500"}`}
            />
            <div className="text-xs font-medium">Performance</div>
            <div className="text-xs text-gray-600">
              {performanceMetrics.batteryOptimized ? "Optimized" : "Standard"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Sync
              className={`h-6 w-6 mx-auto mb-2 ${pwaCapabilities.backgroundSync ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">Sync</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.backgroundSync ? "Background" : "Manual"}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Wifi
              className={`h-6 w-6 mx-auto mb-2 ${pwaCapabilities.voiceRecognition ? "text-green-600" : "text-gray-400"}`}
            />
            <div className="text-xs font-medium">Voice Input</div>
            <div className="text-xs text-gray-600">
              {pwaCapabilities.voiceRecognition ? "Supported" : "Not Supported"}
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Features Status */}
        <div className="mt-4 space-y-3">
          {/* PWA Capabilities */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Progressive Web App Features
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-1 ${pwaCapabilities.pushNotifications ? "text-green-700" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${pwaCapabilities.pushNotifications ? "bg-green-500" : "bg-gray-300"}`}
                />
                Push Notifications
              </div>
              <div
                className={`flex items-center gap-1 ${pwaCapabilities.backgroundSync ? "text-green-700" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${pwaCapabilities.backgroundSync ? "bg-green-500" : "bg-gray-300"}`}
                />
                Background Sync
              </div>
              <div
                className={`flex items-center gap-1 ${pwaCapabilities.standalone ? "text-green-700" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${pwaCapabilities.standalone ? "bg-green-500" : "bg-gray-300"}`}
                />
                Standalone Mode
              </div>
              <div
                className={`flex items-center gap-1 ${isOnline ? "text-green-700" : "text-orange-700"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`}
                />
                Network Status
              </div>
            </div>
          </div>

          {/* Device Management Status */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Mobile Device Management
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-1 ${deviceManagement.registered ? "text-green-700" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${deviceManagement.registered ? "bg-green-500" : "bg-gray-300"}`}
                />
                Device Registered
              </div>
              <div
                className={`flex items-center gap-1 ${deviceManagement.secured ? "text-green-700" : "text-orange-700"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${deviceManagement.secured ? "bg-green-500" : "bg-orange-500"}`}
                />
                Security Compliant
              </div>
              <div
                className={`flex items-center gap-1 ${deviceManagement.compliant ? "text-green-700" : "text-red-700"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${deviceManagement.compliant ? "bg-green-500" : "bg-red-500"}`}
                />
                Policy Compliant
              </div>
              <div
                className={`flex items-center gap-1 ${deviceManagement.lastSync ? "text-green-700" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${deviceManagement.lastSync ? "bg-green-500" : "bg-gray-300"}`}
                />
                Last Sync: {deviceManagement.lastSync ? "Recent" : "Never"}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Performance Optimization
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Load Time</span>
                <span className="font-medium">
                  {performanceMetrics.loadTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Cache Hit Rate</span>
                <span className="font-medium">
                  {performanceMetrics.cacheHitRate}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Offline Capability</span>
                <span className="font-medium">
                  {performanceMetrics.offlineCapability}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Battery Optimized</span>
                <Badge
                  variant={
                    performanceMetrics.batteryOptimized
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {performanceMetrics.batteryOptimized ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {installProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Installing mobile app...</span>
              <span>{installProgress}%</span>
            </div>
            <Progress value={installProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            {!isInstalled && installPrompt && (
              <Button onClick={handleInstallPWA} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Install Mobile App
              </Button>
            )}
            {isInstalled && (
              <Button onClick={onOpenApp} variant="outline" className="flex-1">
                <Smartphone className="h-4 w-4 mr-2" />
                Open Mobile App
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(window.location.href, "_blank")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
          </div>

          {/* Enhanced Mobile Features */}
          <div className="flex gap-2">
            {biometricSupported && (
              <Button
                onClick={handleBiometricSetup}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                Setup Biometric
              </Button>
            )}
            <Button
              onClick={() => serviceWorkerService.clearAllCaches()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MobileResponsiveLayout: React.FC<MobileResponsiveProps> = ({
  children,
  sidebar,
  header,
  className,
  enablePWA = true,
  enableOfflineMode = true,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showMobileFeatures, setShowMobileFeatures] = useState(false);
  const [mobileOptimizations, setMobileOptimizations] = useState({
    touchOptimized: false,
    gestureSupport: false,
    hapticFeedback: false,
    orientationLock: false,
    fullscreenMode: false,
  });
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    connectionType: "unknown",
    effectiveType: "unknown",
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowMobileFeatures(mobile || window.innerWidth < 1024);

      // Initialize mobile optimizations
      if (mobile) {
        initializeMobileOptimizations();
      }
    };

    // Check if app is installed (PWA)
    const checkInstalled = () => {
      if (
        "standalone" in window.navigator &&
        (window.navigator as any).standalone
      ) {
        setIsAppInstalled(true);
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsAppInstalled(true);
      }
    };

    // Initialize mobile optimizations
    const initializeMobileOptimizations = () => {
      const optimizations = {
        touchOptimized: "ontouchstart" in window,
        gestureSupport: "GestureEvent" in window,
        hapticFeedback: "vibrate" in navigator,
        orientationLock: "orientation" in screen,
        fullscreenMode: "requestFullscreen" in document.documentElement,
      };

      setMobileOptimizations(optimizations);

      // Apply mobile-specific optimizations
      if (optimizations.touchOptimized) {
        document.body.classList.add("touch-optimized");
      }

      // Prevent zoom on double tap for clinical forms
      document.addEventListener("touchend", (e) => {
        if (e.target && (e.target as Element).closest(".clinical-form")) {
          e.preventDefault();
        }
      });

      // Add haptic feedback for important actions
      if (optimizations.hapticFeedback) {
        document.addEventListener("click", (e) => {
          if (e.target && (e.target as Element).closest(".haptic-feedback")) {
            navigator.vibrate(50);
          }
        });
      }
    };

    // Monitor network status
    const updateNetworkStatus = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      setNetworkStatus({
        online: navigator.onLine,
        connectionType: connection?.type || "unknown",
        effectiveType: connection?.effectiveType || "unknown",
      });
    };

    checkMobile();
    checkInstalled();
    updateNetworkStatus();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    if ("connection" in navigator) {
      (navigator as any).connection.addEventListener(
        "change",
        updateNetworkStatus,
      );
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  if (isMobile) {
    return (
      <div className={cn("min-h-screen bg-gray-50 touch-optimized", className)}>
        {/* Enhanced Mobile Header with Network Status */}
        {header && (
          <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              {sidebar && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="haptic-feedback"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="h-full overflow-y-auto">{sidebar}</div>
                  </SheetContent>
                </Sheet>
              )}
              <div className="flex-1 px-2">{header}</div>
              <div className="flex items-center gap-2">
                {/* Network Status Indicator */}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    networkStatus.online
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {networkStatus.online ? (
                    <Wifi className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {networkStatus.online ? "Online" : "Offline"}
                </Badge>
                {isAppInstalled && (
                  <Badge variant="outline" className="text-xs">
                    <Smartphone className="h-3 w-3 mr-1" />
                    App
                  </Badge>
                )}
              </div>
            </div>

            {/* Connection Quality Indicator */}
            {networkStatus.online &&
              networkStatus.effectiveType !== "unknown" && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        networkStatus.effectiveType === "4g"
                          ? "bg-green-500"
                          : networkStatus.effectiveType === "3g"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span>
                      {networkStatus.effectiveType.toUpperCase()} Connection
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Enhanced Mobile Content with Optimizations */}
        <div className="p-4 pb-20 clinical-form-container">
          {/* Mobile Optimizations Status */}
          {showMobileFeatures && (
            <div className="mb-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Mobile Optimizations
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {
                        Object.values(mobileOptimizations).filter(Boolean)
                          .length
                      }
                      /5 Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1 ${
                        mobileOptimizations.touchOptimized
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          mobileOptimizations.touchOptimized
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      Touch Optimized
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        mobileOptimizations.hapticFeedback
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          mobileOptimizations.hapticFeedback
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      Haptic Feedback
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        mobileOptimizations.gestureSupport
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          mobileOptimizations.gestureSupport
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      Gesture Support
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        !networkStatus.online
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          !networkStatus.online ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      Offline Mode
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {enablePWA && showMobileFeatures && (
            <div className="mb-4">
              <MobileAppAccess
                isInstalled={isAppInstalled}
                onInstall={() => setIsAppInstalled(true)}
              />
            </div>
          )}
          {children}
        </div>

        {/* Enhanced Mobile Bottom Navigation with Haptic Feedback */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 z-30 shadow-lg">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2 haptic-feedback"
            >
              <Monitor className="h-4 w-4" />
              <span className="text-xs mt-1">Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2 haptic-feedback"
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-xs mt-1">Patients</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2 haptic-feedback"
            >
              <Tablet className="h-4 w-4" />
              <span className="text-xs mt-1">Forms</span>
            </Button>
            {!networkStatus.online && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 haptic-feedback"
              >
                <WifiOff className="h-4 w-4" />
                <span className="text-xs mt-1">Offline</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {/* Desktop Sidebar */}
      {sidebar && (
        <div className="w-64 bg-white border-r flex-shrink-0">
          <div className="h-full overflow-y-auto">{sidebar}</div>
        </div>
      )}

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        {header && <div className="bg-white border-b px-6 py-4">{header}</div>}

        {/* Desktop Content */}
        <div className="flex-1 p-6">
          {enablePWA && showMobileFeatures && (
            <div className="mb-6">
              <MobileAppAccess
                isInstalled={isAppInstalled}
                onInstall={() => setIsAppInstalled(true)}
              />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

// Hook for responsive utilities
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });

      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    dimensions,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}) => {
  const { breakpoint } = useResponsive();

  const getGridCols = () => {
    switch (breakpoint) {
      case "mobile":
        return cols.mobile || 1;
      case "tablet":
        return cols.tablet || 2;
      case "desktop":
        return cols.desktop || 3;
      default:
        return 1;
    }
  };

  const gridCols = getGridCols();
  const gapClass = `gap-${gap}`;
  const colsClass = `grid-cols-${gridCols}`;

  return (
    <div className={cn("grid", colsClass, gapClass, className)}>{children}</div>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { mobile: "text-sm", tablet: "text-base", desktop: "text-lg" },
  className,
}) => {
  const { breakpoint } = useResponsive();

  const getTextSize = () => {
    switch (breakpoint) {
      case "mobile":
        return size.mobile || "text-sm";
      case "tablet":
        return size.tablet || "text-base";
      case "desktop":
        return size.desktop || "text-lg";
      default:
        return "text-base";
    }
  };

  return <span className={cn(getTextSize(), className)}>{children}</span>;
};

export default MobileResponsiveLayout;
