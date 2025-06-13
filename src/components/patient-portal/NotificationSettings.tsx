import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Pill,
  Heart,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NotificationPreferences } from "@/types/patient-portal";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useToast } from "@/hooks/useToast";

interface NotificationSettingsProps {
  patientId: string;
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  patientId,
  className = "",
}) => {
  const { toast } = useToast();
  const { preferences, isLoading, updatePreferences, testNotification } =
    useNotificationSettings(patientId);

  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferences>({
      email: true,
      sms: true,
      push: true,
      appointmentReminders: true,
      medicationReminders: true,
      careUpdates: true,
      educationalContent: false,
      ...preferences,
    });

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: "22:00",
    end: "08:00",
  });

  const [reminderTiming, setReminderTiming] = useState({
    appointments: 24, // hours before
    medications: 30, // minutes before
  });

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updatePreferences(localPreferences);
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async (type: string) => {
    try {
      await testNotification(type);
      toast({
        title: "Test Notification Sent",
        description: `A test ${type} notification has been sent.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const notificationChannels = [
    {
      key: "email" as keyof NotificationPreferences,
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
    },
    {
      key: "sms" as keyof NotificationPreferences,
      label: "SMS Notifications",
      description: "Receive notifications via text message",
      icon: MessageSquare,
    },
    {
      key: "push" as keyof NotificationPreferences,
      label: "Push Notifications",
      description: "Receive notifications on your device",
      icon: Bell,
    },
  ];

  const notificationTypes = [
    {
      key: "appointmentReminders" as keyof NotificationPreferences,
      label: "Appointment Reminders",
      description: "Get reminded about upcoming appointments",
      icon: Calendar,
      testType: "appointment",
    },
    {
      key: "medicationReminders" as keyof NotificationPreferences,
      label: "Medication Reminders",
      description: "Get reminded to take your medications",
      icon: Pill,
      testType: "medication",
    },
    {
      key: "careUpdates" as keyof NotificationPreferences,
      label: "Care Updates",
      description: "Receive updates about your care plan",
      icon: Heart,
      testType: "care",
    },
    {
      key: "educationalContent" as keyof NotificationPreferences,
      label: "Educational Content",
      description: "Get notified about new health education materials",
      icon: BookOpen,
      testType: "education",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Notification Settings
        </h2>
        <p className="text-gray-600 mt-1">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.key}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium">
                        {channel.label}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localPreferences[channel.key]}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(channel.key, checked)
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification(channel.key)}
                      disabled={!localPreferences[channel.key]}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.key}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium">
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localPreferences[type.key]}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(type.key, checked)
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification(type.testType)}
                      disabled={!localPreferences[type.key]}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {quietHours.enabled ? (
                <VolumeX className="h-5 w-5 mr-2" />
              ) : (
                <Volume2 className="h-5 w-5 mr-2" />
              )}
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Enable Quiet Hours
                </Label>
                <p className="text-sm text-gray-600">
                  Pause non-urgent notifications during specified hours
                </p>
              </div>
              <Switch
                checked={quietHours.enabled}
                onCheckedChange={(checked) =>
                  setQuietHours((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {quietHours.enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Time</Label>
                    <Select
                      value={quietHours.start}
                      onValueChange={(value) =>
                        setQuietHours((prev) => ({ ...prev, start: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Time</Label>
                    <Select
                      value={quietHours.end}
                      onValueChange={(value) =>
                        setQuietHours((prev) => ({ ...prev, end: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Reminder Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">
                  Appointment Reminders
                </Label>
                <Badge variant="outline">
                  {reminderTiming.appointments} hours
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                How many hours before your appointment should we remind you?
              </p>
              <Slider
                value={[reminderTiming.appointments]}
                onValueChange={([value]) =>
                  setReminderTiming((prev) => ({
                    ...prev,
                    appointments: value,
                  }))
                }
                max={72}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 hour</span>
                <span>72 hours</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">
                  Medication Reminders
                </Label>
                <Badge variant="outline">
                  {reminderTiming.medications} minutes
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                How many minutes before medication time should we remind you?
              </p>
              <Slider
                value={[reminderTiming.medications]}
                onValueChange={([value]) =>
                  setReminderTiming((prev) => ({
                    ...prev,
                    medications: value,
                  }))
                }
                max={120}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 minutes</span>
                <span>2 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
