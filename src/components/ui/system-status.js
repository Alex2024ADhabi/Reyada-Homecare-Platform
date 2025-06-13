import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Database, Wifi, WifiOff, Server, Shield, Zap, AlertCircle, CheckCircle, Clock, RefreshCw, } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastContext } from "@/components/ui/toast-provider";
import { performanceMonitor } from "@/services/performance-monitor.service";
import { cacheOptimization } from "@/services/cache-optimization.service";
import { realTimeSyncService } from "@/services/real-time-sync.service";
export const SystemStatus = ({ className, showDetails = false, }) => {
    const { toast } = useToastContext();
    const [systemHealth, setSystemHealth] = useState({
        overall: "healthy",
        database: "connected",
        network: "online",
        cache: "optimal",
        sync: "active",
        performance: "good",
        security: "secure",
    });
    const [lastChecked, setLastChecked] = useState(new Date());
    const [isChecking, setIsChecking] = useState(false);
    const checkSystemHealth = async () => {
        setIsChecking(true);
        try {
            // Check network status
            const networkStatus = navigator.onLine ? "online" : "offline";
            // Check cache performance
            const cacheStats = cacheOptimization.getStats();
            const cacheStatus = cacheStats.hitRate > 80
                ? "optimal"
                : cacheStats.hitRate > 50
                    ? "degraded"
                    : "full";
            // Check sync service
            const syncStatus = realTimeSyncService.getConnectionStatus()
                ? "active"
                : "inactive";
            // Check performance metrics
            const performanceReport = performanceMonitor.getReport();
            const performanceStatus = performanceReport.alerts.length === 0
                ? "good"
                : performanceReport.alerts.length < 3
                    ? "fair"
                    : "poor";
            // Simulate database check
            const databaseStatus = "connected"; // In real app, this would be an actual check
            // Simulate security check
            const securityStatus = "secure"; // In real app, this would check for security issues
            // Determine overall health
            const criticalIssues = [
                networkStatus === "offline",
                databaseStatus === "error",
                syncStatus === "error",
                securityStatus === "vulnerable",
            ].filter(Boolean).length;
            const warningIssues = [
                networkStatus === "slow",
                cacheStatus === "degraded",
                performanceStatus === "fair",
                securityStatus === "warning",
            ].filter(Boolean).length;
            const overallStatus = criticalIssues > 0
                ? "critical"
                : warningIssues > 0
                    ? "warning"
                    : "healthy";
            setSystemHealth({
                overall: overallStatus,
                database: databaseStatus,
                network: networkStatus,
                cache: cacheStatus,
                sync: syncStatus,
                performance: performanceStatus,
                security: securityStatus,
            });
            setLastChecked(new Date());
            if (overallStatus === "critical") {
                toast({
                    title: "System Health Alert",
                    description: "Critical system issues detected. Please check system status.",
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            console.error("Error checking system health:", error);
            toast({
                title: "Health Check Failed",
                description: "Unable to check system health",
                variant: "destructive",
            });
        }
        finally {
            setIsChecking(false);
        }
    };
    useEffect(() => {
        checkSystemHealth();
        const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case "healthy":
            case "connected":
            case "online":
            case "optimal":
            case "active":
            case "good":
            case "secure":
                return "text-green-600 bg-green-100";
            case "warning":
            case "slow":
            case "degraded":
            case "fair":
                return "text-yellow-600 bg-yellow-100";
            case "critical":
            case "disconnected":
            case "offline":
            case "error":
            case "full":
            case "inactive":
            case "poor":
            case "vulnerable":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getStatusIcon = (component, status) => {
        const iconClass = "h-4 w-4";
        if (status.includes("error") ||
            status === "critical" ||
            status === "offline" ||
            status === "disconnected") {
            return _jsx(AlertCircle, { className: cn(iconClass, "text-red-500") });
        }
        if (status === "warning" ||
            status === "degraded" ||
            status === "fair" ||
            status === "slow") {
            return _jsx(AlertCircle, { className: cn(iconClass, "text-yellow-500") });
        }
        return _jsx(CheckCircle, { className: cn(iconClass, "text-green-500") });
    };
    const getComponentIcon = (component) => {
        const iconClass = "h-4 w-4";
        switch (component) {
            case "database":
                return _jsx(Database, { className: iconClass });
            case "network":
                return systemHealth.network === "online" ? (_jsx(Wifi, { className: iconClass })) : (_jsx(WifiOff, { className: iconClass }));
            case "cache":
                return _jsx(Zap, { className: iconClass });
            case "sync":
                return _jsx(RefreshCw, { className: iconClass });
            case "performance":
                return _jsx(Activity, { className: iconClass });
            case "security":
                return _jsx(Shield, { className: iconClass });
            default:
                return _jsx(Server, { className: iconClass });
        }
    };
    if (!showDetails) {
        return (_jsxs("div", { className: cn("flex items-center gap-2", className), children: [getStatusIcon("overall", systemHealth.overall), _jsxs(Badge, { className: getStatusColor(systemHealth.overall), children: ["System ", systemHealth.overall] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: checkSystemHealth, disabled: isChecking, children: isChecking ? (_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" })) : (_jsx(RefreshCw, { className: "h-4 w-4" })) })] }));
    }
    return (_jsxs(Card, { className: className, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [getStatusIcon("overall", systemHealth.overall), "System Health Status"] }), _jsxs(CardDescription, { children: ["Last checked: ", lastChecked.toLocaleTimeString()] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(systemHealth.overall), children: systemHealth.overall.toUpperCase() }), _jsxs(Button, { variant: "outline", size: "sm", onClick: checkSystemHealth, disabled: isChecking, children: [isChecking ? (_jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-2" })) : (_jsx(RefreshCw, { className: "h-4 w-4 mr-2" })), "Refresh"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(systemHealth)
                            .filter(([key]) => key !== "overall")
                            .map(([component, status]) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getComponentIcon(component), _jsx("span", { className: "font-medium capitalize", children: component.replace("_", " ") })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(component, status), _jsx(Badge, { className: getStatusColor(status), variant: "outline", children: status.toUpperCase() })] })] }, component))) }), _jsx("div", { className: "mt-4 p-3 bg-muted rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { children: "System monitoring active - checks every 30 seconds" })] }) })] })] }));
};
export default SystemStatus;
