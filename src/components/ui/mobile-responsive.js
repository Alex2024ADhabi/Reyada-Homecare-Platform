import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, Smartphone, Monitor, Tablet, Wifi, WifiOff, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Enhanced Mobile App Access Component with PWA capabilities
export const MobileAppAccess = ({ isInstalled = false, onInstall, onOpenApp }) => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installProgress, setInstallProgress] = useState(0);
    const [pwaCapabilities, setPwaCapabilities] = useState({
        installable: false,
        standalone: false,
        pushNotifications: false,
        backgroundSync: false,
        offlineStorage: false,
        cameraAccess: false,
        voiceRecognition: false,
    });
    useEffect(() => {
        // Initialize PWA capabilities detection
        const initializePWACapabilities = async () => {
            const capabilities = {
                installable: "beforeinstallprompt" in window,
                standalone: window.matchMedia("(display-mode: standalone)").matches ||
                    window.navigator.standalone === true,
                pushNotifications: "serviceWorker" in navigator && "PushManager" in window,
                backgroundSync: "serviceWorker" in navigator &&
                    "sync" in window.ServiceWorkerRegistration.prototype,
                offlineStorage: "indexedDB" in window && "caches" in window,
                cameraAccess: "mediaDevices" in navigator &&
                    "getUserMedia" in navigator.mediaDevices,
                voiceRecognition: "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
            };
            setPwaCapabilities(capabilities);
            // Register service worker for PWA functionality
            if ("serviceWorker" in navigator) {
                try {
                    await navigator.serviceWorker.register("/sw.js");
                    console.log("Service Worker registered for PWA functionality");
                }
                catch (error) {
                    console.error("Service Worker registration failed:", error);
                }
            }
        };
        // Listen for PWA install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        // Listen for online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        // Initialize capabilities
        initializePWACapabilities();
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    const handleInstallPWA = async () => {
        if (installPrompt) {
            setInstallProgress(25);
            const result = await installPrompt.prompt();
            setInstallProgress(75);
            if (result.outcome === "accepted") {
                setInstallProgress(100);
                setInstallPrompt(null);
                if (onInstall)
                    onInstall();
            }
            else {
                setInstallProgress(0);
            }
        }
    };
    return (_jsxs(Card, { className: "w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center text-blue-900", children: [_jsx(Smartphone, { className: "h-5 w-5 mr-2" }), "Mobile App Access", _jsx(Badge, { variant: "outline", className: "ml-2 text-xs", children: isOnline ? (_jsxs(_Fragment, { children: [_jsx(Wifi, { className: "h-3 w-3 mr-1" }), "Online"] })) : (_jsxs(_Fragment, { children: [_jsx(WifiOff, { className: "h-3 w-3 mr-1" }), "Offline"] })) })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [!isInstalled && installPrompt && (_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Smartphone, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Install Reyada Homecare as a mobile app for better performance and offline access." })] })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsx(Smartphone, { className: `h-6 w-6 mx-auto mb-2 ${pwaCapabilities.installable ? "text-green-600" : "text-gray-400"}` }), _jsx("div", { className: "text-xs font-medium", children: "PWA Ready" }), _jsx("div", { className: "text-xs text-gray-600", children: pwaCapabilities.installable ? "Available" : "Limited" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsx(WifiOff, { className: `h-6 w-6 mx-auto mb-2 ${pwaCapabilities.offlineStorage ? "text-green-600" : "text-gray-400"}` }), _jsx("div", { className: "text-xs font-medium", children: "Offline Mode" }), _jsx("div", { className: "text-xs text-gray-600", children: pwaCapabilities.offlineStorage ? "Full Support" : "Limited" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsx(Monitor, { className: `h-6 w-6 mx-auto mb-2 ${pwaCapabilities.cameraAccess ? "text-green-600" : "text-gray-400"}` }), _jsx("div", { className: "text-xs font-medium", children: "Camera" }), _jsx("div", { className: "text-xs text-gray-600", children: pwaCapabilities.cameraAccess ? "Available" : "Not Available" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsx(Wifi, { className: `h-6 w-6 mx-auto mb-2 ${pwaCapabilities.voiceRecognition ? "text-green-600" : "text-gray-400"}` }), _jsx("div", { className: "text-xs font-medium", children: "Voice Input" }), _jsx("div", { className: "text-xs text-gray-600", children: pwaCapabilities.voiceRecognition ? "Supported" : "Not Supported" })] })] }), _jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm font-medium text-blue-900 mb-2", children: "PWA Capabilities Status" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { className: `flex items-center gap-1 ${pwaCapabilities.pushNotifications ? "text-green-700" : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${pwaCapabilities.pushNotifications ? "bg-green-500" : "bg-gray-300"}` }), "Push Notifications"] }), _jsxs("div", { className: `flex items-center gap-1 ${pwaCapabilities.backgroundSync ? "text-green-700" : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${pwaCapabilities.backgroundSync ? "bg-green-500" : "bg-gray-300"}` }), "Background Sync"] }), _jsxs("div", { className: `flex items-center gap-1 ${pwaCapabilities.standalone ? "text-green-700" : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${pwaCapabilities.standalone ? "bg-green-500" : "bg-gray-300"}` }), "Standalone Mode"] }), _jsxs("div", { className: `flex items-center gap-1 ${isOnline ? "text-green-700" : "text-orange-700"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}` }), "Network Status"] })] })] }), installProgress > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Installing mobile app..." }), _jsxs("span", { children: [installProgress, "%"] })] }), _jsx(Progress, { value: installProgress, className: "h-2" })] })), _jsxs("div", { className: "flex gap-2", children: [!isInstalled && installPrompt && (_jsxs(Button, { onClick: handleInstallPWA, className: "flex-1", children: [_jsx(Smartphone, { className: "h-4 w-4 mr-2" }), "Install Mobile App"] })), isInstalled && (_jsxs(Button, { onClick: onOpenApp, variant: "outline", className: "flex-1", children: [_jsx(Smartphone, { className: "h-4 w-4 mr-2" }), "Open Mobile App"] })), _jsxs(Button, { variant: "outline", onClick: () => window.open(window.location.href, "_blank"), children: [_jsx(Monitor, { className: "h-4 w-4 mr-2" }), "Desktop View"] })] })] })] }));
};
export const MobileResponsiveLayout = ({ children, sidebar, header, className, enablePWA = true, enableOfflineMode = true, }) => {
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
            if ("standalone" in window.navigator &&
                window.navigator.standalone) {
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
                if (e.target && e.target.closest(".clinical-form")) {
                    e.preventDefault();
                }
            });
            // Add haptic feedback for important actions
            if (optimizations.hapticFeedback) {
                document.addEventListener("click", (e) => {
                    if (e.target && e.target.closest(".haptic-feedback")) {
                        navigator.vibrate(50);
                    }
                });
            }
        };
        // Monitor network status
        const updateNetworkStatus = () => {
            const connection = navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;
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
            navigator.connection.addEventListener("change", updateNetworkStatus);
        }
        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
        };
    }, []);
    if (isMobile) {
        return (_jsxs("div", { className: cn("min-h-screen bg-gray-50 touch-optimized", className), children: [header && (_jsxs("div", { className: "sticky top-0 z-40 bg-white border-b px-4 py-3 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [sidebar && (_jsxs(Sheet, { open: sidebarOpen, onOpenChange: setSidebarOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "haptic-feedback", children: _jsx(Menu, { className: "h-5 w-5" }) }) }), _jsx(SheetContent, { side: "left", className: "w-80 p-0", children: _jsx("div", { className: "h-full overflow-y-auto", children: sidebar }) })] })), _jsx("div", { className: "flex-1 px-2", children: header }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: `text-xs ${networkStatus.online
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-red-50 text-red-700 border-red-200"}`, children: [networkStatus.online ? (_jsx(Wifi, { className: "h-3 w-3 mr-1" })) : (_jsx(WifiOff, { className: "h-3 w-3 mr-1" })), networkStatus.online ? "Online" : "Offline"] }), isAppInstalled && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Smartphone, { className: "h-3 w-3 mr-1" }), "App"] }))] })] }), networkStatus.online &&
                            networkStatus.effectiveType !== "unknown" && (_jsx("div", { className: "mt-2 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${networkStatus.effectiveType === "4g"
                                            ? "bg-green-500"
                                            : networkStatus.effectiveType === "3g"
                                                ? "bg-yellow-500"
                                                : "bg-red-500"}` }), _jsxs("span", { children: [networkStatus.effectiveType.toUpperCase(), " Connection"] })] }) }))] })), _jsxs("div", { className: "p-4 pb-20 clinical-form-container", children: [showMobileFeatures && (_jsx("div", { className: "mb-4", children: _jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs(CardContent, { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-blue-900", children: "Mobile Optimizations" }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [Object.values(mobileOptimizations).filter(Boolean)
                                                            .length, "/5 Active"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { className: `flex items-center gap-1 ${mobileOptimizations.touchOptimized
                                                        ? "text-green-700"
                                                        : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${mobileOptimizations.touchOptimized
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"}` }), "Touch Optimized"] }), _jsxs("div", { className: `flex items-center gap-1 ${mobileOptimizations.hapticFeedback
                                                        ? "text-green-700"
                                                        : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${mobileOptimizations.hapticFeedback
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"}` }), "Haptic Feedback"] }), _jsxs("div", { className: `flex items-center gap-1 ${mobileOptimizations.gestureSupport
                                                        ? "text-green-700"
                                                        : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${mobileOptimizations.gestureSupport
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"}` }), "Gesture Support"] }), _jsxs("div", { className: `flex items-center gap-1 ${!networkStatus.online
                                                        ? "text-green-700"
                                                        : "text-gray-500"}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${!networkStatus.online ? "bg-green-500" : "bg-gray-300"}` }), "Offline Mode"] })] })] }) }) })), enablePWA && showMobileFeatures && (_jsx("div", { className: "mb-4", children: _jsx(MobileAppAccess, { isInstalled: isAppInstalled, onInstall: () => setIsAppInstalled(true) }) })), children] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 z-30 shadow-lg", children: _jsxs("div", { className: "flex justify-around items-center", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "flex-col h-auto py-2 haptic-feedback", children: [_jsx(Monitor, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs mt-1", children: "Dashboard" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex-col h-auto py-2 haptic-feedback", children: [_jsx(Smartphone, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs mt-1", children: "Patients" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex-col h-auto py-2 haptic-feedback", children: [_jsx(Tablet, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs mt-1", children: "Forms" })] }), !networkStatus.online && (_jsxs(Button, { variant: "ghost", size: "sm", className: "flex-col h-auto py-2 haptic-feedback", children: [_jsx(WifiOff, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs mt-1", children: "Offline" })] }))] }) })] }));
    }
    // Desktop Layout
    return (_jsxs("div", { className: cn("min-h-screen bg-gray-50 flex", className), children: [sidebar && (_jsx("div", { className: "w-64 bg-white border-r flex-shrink-0", children: _jsx("div", { className: "h-full overflow-y-auto", children: sidebar }) })), _jsxs("div", { className: "flex-1 flex flex-col", children: [header && _jsx("div", { className: "bg-white border-b px-6 py-4", children: header }), _jsxs("div", { className: "flex-1 p-6", children: [enablePWA && showMobileFeatures && (_jsx("div", { className: "mb-6", children: _jsx(MobileAppAccess, { isInstalled: isAppInstalled, onInstall: () => setIsAppInstalled(true) }) })), children] })] })] }));
};
// Hook for responsive utilities
export const useResponsive = () => {
    const [breakpoint, setBreakpoint] = useState("desktop");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setDimensions({ width, height });
            if (width < 768) {
                setBreakpoint("mobile");
            }
            else if (width < 1024) {
                setBreakpoint("tablet");
            }
            else {
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
export const ResponsiveGrid = ({ children, cols = { mobile: 1, tablet: 2, desktop: 3 }, gap = 4, className, }) => {
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
    return (_jsx("div", { className: cn("grid", colsClass, gapClass, className), children: children }));
};
export const ResponsiveText = ({ children, size = { mobile: "text-sm", tablet: "text-base", desktop: "text-lg" }, className, }) => {
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
    return _jsx("span", { className: cn(getTextSize(), className), children: children });
};
export default MobileResponsiveLayout;
