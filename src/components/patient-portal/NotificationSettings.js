import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Calendar, Pill, Heart, BookOpen, AlertCircle, CheckCircle, Settings, Volume2, VolumeX, } from "lucide-react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useToast } from "@/hooks/useToast";
export const NotificationSettings = ({ patientId, className = "", }) => {
    const { toast } = useToast();
    const { preferences, isLoading, updatePreferences, testNotification } = useNotificationSettings(patientId);
    const [localPreferences, setLocalPreferences] = useState({
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
    const handlePreferenceChange = (key, value) => {
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
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to save notification settings.",
                variant: "destructive",
            });
        }
    };
    const handleTestNotification = async (type) => {
        try {
            await testNotification(type);
            toast({
                title: "Test Notification Sent",
                description: `A test ${type} notification has been sent.`,
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to send test notification.",
                variant: "destructive",
            });
        }
    };
    const notificationChannels = [
        {
            key: "email",
            label: "Email Notifications",
            description: "Receive notifications via email",
            icon: Mail,
        },
        {
            key: "sms",
            label: "SMS Notifications",
            description: "Receive notifications via text message",
            icon: MessageSquare,
        },
        {
            key: "push",
            label: "Push Notifications",
            description: "Receive notifications on your device",
            icon: Bell,
        },
    ];
    const notificationTypes = [
        {
            key: "appointmentReminders",
            label: "Appointment Reminders",
            description: "Get reminded about upcoming appointments",
            icon: Calendar,
            testType: "appointment",
        },
        {
            key: "medicationReminders",
            label: "Medication Reminders",
            description: "Get reminded to take your medications",
            icon: Pill,
            testType: "medication",
        },
        {
            key: "careUpdates",
            label: "Care Updates",
            description: "Receive updates about your care plan",
            icon: Heart,
            testType: "care",
        },
        {
            key: "educationalContent",
            label: "Educational Content",
            description: "Get notified about new health education materials",
            icon: BookOpen,
            testType: "education",
        },
    ];
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Notification Settings" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Customize how and when you receive notifications" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Settings, { className: "h-5 w-5 mr-2" }), "Notification Channels"] }) }), _jsx(CardContent, { className: "space-y-6", children: notificationChannels.map((channel) => {
                                    const Icon = channel.icon;
                                    return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: channel.label }), _jsx("p", { className: "text-sm text-gray-600", children: channel.description })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: localPreferences[channel.key], onCheckedChange: (checked) => handlePreferenceChange(channel.key, checked) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleTestNotification(channel.key), disabled: !localPreferences[channel.key], children: "Test" })] })] }, channel.key));
                                }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Bell, { className: "h-5 w-5 mr-2" }), "Notification Types"] }) }), _jsx(CardContent, { className: "space-y-6", children: notificationTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: type.label }), _jsx("p", { className: "text-sm text-gray-600", children: type.description })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: localPreferences[type.key], onCheckedChange: (checked) => handlePreferenceChange(type.key, checked) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleTestNotification(type.testType), disabled: !localPreferences[type.key], children: "Test" })] })] }, type.key));
                                }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [quietHours.enabled ? (_jsx(VolumeX, { className: "h-5 w-5 mr-2" })) : (_jsx(Volume2, { className: "h-5 w-5 mr-2" })), "Quiet Hours"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Enable Quiet Hours" }), _jsx("p", { className: "text-sm text-gray-600", children: "Pause non-urgent notifications during specified hours" })] }), _jsx(Switch, { checked: quietHours.enabled, onCheckedChange: (checked) => setQuietHours((prev) => ({ ...prev, enabled: checked })) })] }), quietHours.enabled && (_jsx("div", { className: "space-y-4 pt-4 border-t", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Start Time" }), _jsxs(Select, { value: quietHours.start, onValueChange: (value) => setQuietHours((prev) => ({ ...prev, start: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Array.from({ length: 24 }, (_, i) => {
                                                                        const hour = i.toString().padStart(2, "0");
                                                                        return (_jsxs(SelectItem, { value: `${hour}:00`, children: [hour, ":00"] }, hour));
                                                                    }) })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "End Time" }), _jsxs(Select, { value: quietHours.end, onValueChange: (value) => setQuietHours((prev) => ({ ...prev, end: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Array.from({ length: 24 }, (_, i) => {
                                                                        const hour = i.toString().padStart(2, "0");
                                                                        return (_jsxs(SelectItem, { value: `${hour}:00`, children: [hour, ":00"] }, hour));
                                                                    }) })] })] })] }) }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2" }), "Reminder Timing"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx(Label, { className: "text-sm font-medium", children: "Appointment Reminders" }), _jsxs(Badge, { variant: "outline", children: [reminderTiming.appointments, " hours"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "How many hours before your appointment should we remind you?" }), _jsx(Slider, { value: [reminderTiming.appointments], onValueChange: ([value]) => setReminderTiming((prev) => ({
                                                    ...prev,
                                                    appointments: value,
                                                })), max: 72, min: 1, step: 1, className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [_jsx("span", { children: "1 hour" }), _jsx("span", { children: "72 hours" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx(Label, { className: "text-sm font-medium", children: "Medication Reminders" }), _jsxs(Badge, { variant: "outline", children: [reminderTiming.medications, " minutes"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "How many minutes before medication time should we remind you?" }), _jsx(Slider, { value: [reminderTiming.medications], onValueChange: ([value]) => setReminderTiming((prev) => ({
                                                    ...prev,
                                                    medications: value,
                                                })), max: 120, min: 5, step: 5, className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [_jsx("span", { children: "5 minutes" }), _jsx("span", { children: "2 hours" })] })] })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSaveSettings, disabled: isLoading, children: [isLoading ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" })) : (_jsx(CheckCircle, { className: "h-4 w-4 mr-2" })), "Save Settings"] }) })] }));
};
export default NotificationSettings;
