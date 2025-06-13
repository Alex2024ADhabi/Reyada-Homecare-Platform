import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Phone, MapPin, Clock, Users, CheckCircle, XCircle, Zap, Shield, Heart, Flame, Building, } from "lucide-react";
import { communicationService, } from "@/services/communication.service";
import { formatDistanceToNow } from "date-fns";
const EmergencyPanel = ({ userId, className = "", }) => {
    const [alerts, setAlerts] = useState([]);
    const [showPanicButton, setShowPanicButton] = useState(true);
    const [isActivatingPanic, setIsActivatingPanic] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [resolution, setResolution] = useState("");
    const [currentLocation, setCurrentLocation] = useState(null);
    useEffect(() => {
        loadEmergencyAlerts();
        getCurrentLocation();
        const interval = setInterval(loadEmergencyAlerts, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);
    const loadEmergencyAlerts = () => {
        const activeAlerts = communicationService.getActiveEmergencyAlerts();
        setAlerts(activeAlerts);
    };
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            }, (error) => {
                console.error("Error getting location:", error);
            }, { timeout: 5000 });
        }
    };
    const activatePanicButton = async () => {
        if (isActivatingPanic)
            return;
        setIsActivatingPanic(true);
        try {
            await communicationService.activatePanicButton(userId, currentLocation || undefined);
            loadEmergencyAlerts();
        }
        catch (error) {
            console.error("Failed to activate panic button:", error);
        }
        finally {
            setIsActivatingPanic(false);
        }
    };
    const acknowledgeAlert = async (alertId) => {
        try {
            await communicationService.acknowledgeEmergencyAlert(alertId, userId);
            loadEmergencyAlerts();
        }
        catch (error) {
            console.error("Failed to acknowledge alert:", error);
        }
    };
    const resolveAlert = async (alertId) => {
        if (!resolution.trim())
            return;
        try {
            await communicationService.resolveEmergencyAlert(alertId, userId, resolution);
            setSelectedAlert(null);
            setResolution("");
            loadEmergencyAlerts();
        }
        catch (error) {
            console.error("Failed to resolve alert:", error);
        }
    };
    const getEmergencyIcon = (type) => {
        switch (type) {
            case "medical":
                return _jsx(Heart, { className: "h-5 w-5 text-red-500" });
            case "fire":
                return _jsx(Flame, { className: "h-5 w-5 text-orange-500" });
            case "security":
                return _jsx(Shield, { className: "h-5 w-5 text-blue-500" });
            case "evacuation":
                return _jsx(Building, { className: "h-5 w-5 text-purple-500" });
            default:
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-red-500";
            case "acknowledged":
                return "bg-yellow-500";
            case "resolved":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [showPanicButton && (_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-full", children: _jsx(Zap, { className: "h-6 w-6 text-red-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-red-900", children: "Emergency Assistance" }), _jsx("p", { className: "text-sm text-red-700", children: "Press for immediate help in case of emergency" })] })] }), _jsx(Button, { variant: "destructive", size: "lg", onClick: activatePanicButton, disabled: isActivatingPanic, className: "bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4", children: isActivatingPanic ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { children: "Activating..." })] })) : (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), _jsx("span", { children: "PANIC" })] })) })] }) }) })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" }), _jsx("span", { children: "Active Emergency Alerts" })] }), _jsxs(Badge, { variant: "outline", className: "text-red-600 border-red-200", children: [alerts.length, " Active"] })] }) }), _jsx(CardContent, { children: alerts.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 text-green-500" }), _jsx("p", { className: "text-lg font-medium", children: "No Active Emergencies" }), _jsx("p", { className: "text-sm", children: "All systems normal" })] })) : (_jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-4", children: alerts.map((alert) => (_jsx(Card, { className: `border-l-4 ${alert.severity === "critical"
                                        ? "border-l-red-500 bg-red-50"
                                        : alert.severity === "high"
                                            ? "border-l-orange-500 bg-orange-50"
                                            : "border-l-yellow-500 bg-yellow-50"}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "mt-1", children: getEmergencyIcon(alert.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: alert.title }), _jsx(Badge, { variant: "outline", className: getSeverityColor(alert.severity), children: alert.severity.toUpperCase() }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: `h-2 w-2 rounded-full ${getStatusColor(alert.status)}` }), _jsx("span", { className: "text-xs text-gray-600 capitalize", children: alert.status })] })] }), _jsx("p", { className: "text-sm text-gray-700 mb-3", children: alert.message }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsx("span", { children: formatDistanceToNow(new Date(alert.timestamp), {
                                                                                        addSuffix: true,
                                                                                    }) })] }), alert.location && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(MapPin, { className: "h-3 w-3" }), _jsx("span", { children: alert.location.address ||
                                                                                        `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}` })] })), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Users, { className: "h-3 w-3" }), _jsxs("span", { children: [alert.recipients.length, " notified"] })] }), _jsx("div", { className: "flex items-center space-x-1", children: _jsxs("span", { children: ["Level ", alert.escalationLevel] }) })] })] })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [alert.status === "active" && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => acknowledgeAlert(alert.id), className: "text-xs", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Acknowledge"] })), (alert.status === "active" ||
                                                            alert.status === "acknowledged") && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSelectedAlert(alert), className: "text-xs", children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "Resolve"] })), alert.responseRequired && (_jsxs(Button, { variant: "outline", size: "sm", className: "text-xs text-blue-600 border-blue-200", children: [_jsx(Phone, { className: "h-3 w-3 mr-1" }), "Respond"] }))] })] }) }) }, alert.id))) }) })) })] }), selectedAlert && (_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2 text-green-800", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), _jsx("span", { children: "Resolve Emergency Alert" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-white rounded border", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-1", children: selectedAlert.title }), _jsx("p", { className: "text-sm text-gray-600", children: selectedAlert.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Resolution Details" }), _jsx(Textarea, { value: resolution, onChange: (e) => setResolution(e.target.value), placeholder: "Describe how the emergency was resolved...", rows: 3, className: "w-full" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                            setSelectedAlert(null);
                                            setResolution("");
                                        }, children: "Cancel" }), _jsx(Button, { onClick: () => resolveAlert(selectedAlert.id), disabled: !resolution.trim(), className: "bg-green-600 hover:bg-green-700", children: "Resolve Alert" })] })] })] }))] }));
};
export default EmergencyPanel;
