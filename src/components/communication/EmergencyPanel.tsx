import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Heart,
  Flame,
  Building,
} from "lucide-react";
import {
  communicationService,
  EmergencyAlert,
} from "@/services/communication.service";
import { format, formatDistanceToNow } from "date-fns";

interface EmergencyPanelProps {
  userId: string;
  className?: string;
}

const EmergencyPanel: React.FC<EmergencyPanelProps> = ({
  userId,
  className = "",
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [showPanicButton, setShowPanicButton] = useState(true);
  const [isActivatingPanic, setIsActivatingPanic] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(
    null,
  );
  const [resolution, setResolution] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { timeout: 5000 },
      );
    }
  };

  const activatePanicButton = async () => {
    if (isActivatingPanic) return;

    setIsActivatingPanic(true);
    try {
      await communicationService.activatePanicButton(
        userId,
        currentLocation || undefined,
      );
      loadEmergencyAlerts();
    } catch (error) {
      console.error("Failed to activate panic button:", error);
    } finally {
      setIsActivatingPanic(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await communicationService.acknowledgeEmergencyAlert(alertId, userId);
      loadEmergencyAlerts();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!resolution.trim()) return;

    try {
      await communicationService.resolveEmergencyAlert(
        alertId,
        userId,
        resolution,
      );
      setSelectedAlert(null);
      setResolution("");
      loadEmergencyAlerts();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const getEmergencyIcon = (type: EmergencyAlert["type"]) => {
    switch (type) {
      case "medical":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "fire":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "security":
        return <Shield className="h-5 w-5 text-blue-500" />;
      case "evacuation":
        return <Building className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: EmergencyAlert["severity"]) => {
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

  const getStatusColor = (status: EmergencyAlert["status"]) => {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Panic Button */}
      {showPanicButton && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">
                    Emergency Assistance
                  </h3>
                  <p className="text-sm text-red-700">
                    Press for immediate help in case of emergency
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="lg"
                onClick={activatePanicButton}
                disabled={isActivatingPanic}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4"
              >
                {isActivatingPanic ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Activating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>PANIC</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Active Emergency Alerts</span>
            </CardTitle>
            <Badge variant="outline" className="text-red-600 border-red-200">
              {alerts.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No Active Emergencies</p>
              <p className="text-sm">All systems normal</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${
                      alert.severity === "critical"
                        ? "border-l-red-500 bg-red-50"
                        : alert.severity === "high"
                          ? "border-l-orange-500 bg-orange-50"
                          : "border-l-yellow-500 bg-yellow-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getEmergencyIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {alert.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={getSeverityColor(alert.severity)}
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <div
                                  className={`h-2 w-2 rounded-full ${getStatusColor(alert.status)}`}
                                />
                                <span className="text-xs text-gray-600 capitalize">
                                  {alert.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3">
                              {alert.message}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(alert.timestamp),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
                                </span>
                              </div>

                              {alert.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {alert.location.address ||
                                      `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{alert.recipients.length} notified</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <span>Level {alert.escalationLevel}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {alert.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}

                          {(alert.status === "active" ||
                            alert.status === "acknowledged") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAlert(alert)}
                              className="text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}

                          {alert.responseRequired && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-blue-600 border-blue-200"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Resolution Modal */}
      {selectedAlert && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span>Resolve Emergency Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-1">
                {selectedAlert.title}
              </h4>
              <p className="text-sm text-gray-600">{selectedAlert.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Details
              </label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the emergency was resolved..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAlert(null);
                  setResolution("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => resolveAlert(selectedAlert.id)}
                disabled={!resolution.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Resolve Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyPanel;
