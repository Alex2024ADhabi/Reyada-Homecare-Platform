import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Activity, Thermometer, Scale, Droplets, Zap, Brain, Plus, TrendingUp, TrendingDown, Minus, Clock, Target, Award, AlertTriangle, } from "lucide-react";
import { useHealthTracking } from "@/hooks/useHealthTracking";
import { useToast } from "@/hooks/useToast";
import { format, isToday } from "date-fns";
export const HealthTrackingTools = ({ patientId, healthMetrics, className = "", }) => {
    const { toast } = useToast();
    const { metrics, goals, isLoading, recordMetric, updateGoal, getMetricTrends, } = useHealthTracking(patientId);
    const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
    const [selectedMetricType, setSelectedMetricType] = useState("");
    const [recordForm, setRecordForm] = useState({
        type: "",
        value: "",
        unit: "",
        notes: "",
        recordedAt: new Date().toISOString().slice(0, 16),
    });
    const [activeTab, setActiveTab] = useState("overview");
    const metricTypes = [
        {
            type: "blood-pressure",
            label: "Blood Pressure",
            icon: Heart,
            unit: "mmHg",
            color: "text-red-600",
            normalRange: "120/80",
        },
        {
            type: "heart-rate",
            label: "Heart Rate",
            icon: Activity,
            unit: "bpm",
            color: "text-pink-600",
            normalRange: "60-100",
        },
        {
            type: "weight",
            label: "Weight",
            icon: Scale,
            unit: "kg",
            color: "text-blue-600",
            normalRange: "Varies",
        },
        {
            type: "blood-sugar",
            label: "Blood Sugar",
            icon: Droplets,
            unit: "mg/dL",
            color: "text-orange-600",
            normalRange: "70-140",
        },
        {
            type: "temperature",
            label: "Temperature",
            icon: Thermometer,
            unit: "°C",
            color: "text-yellow-600",
            normalRange: "36.1-37.2",
        },
        {
            type: "oxygen-saturation",
            label: "Oxygen Saturation",
            icon: Zap,
            unit: "%",
            color: "text-green-600",
            normalRange: "95-100",
        },
        {
            type: "pain-level",
            label: "Pain Level",
            icon: AlertTriangle,
            unit: "/10",
            color: "text-red-500",
            normalRange: "0-3",
        },
        {
            type: "mood",
            label: "Mood",
            icon: Brain,
            unit: "/10",
            color: "text-purple-600",
            normalRange: "7-10",
        },
    ];
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" });
            case "declining":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(Minus, { className: "h-4 w-4 text-gray-600" });
        }
    };
    const getMetricIcon = (type) => {
        const metricType = metricTypes.find((m) => m.type === type);
        if (!metricType)
            return Heart;
        return metricType.icon;
    };
    const getMetricColor = (type) => {
        const metricType = metricTypes.find((m) => m.type === type);
        return metricType?.color || "text-gray-600";
    };
    const handleRecordMetric = async () => {
        if (!recordForm.type || !recordForm.value)
            return;
        try {
            await recordMetric({
                type: recordForm.type,
                value: recordForm.value,
                unit: recordForm.unit,
                notes: recordForm.notes,
                recordedAt: recordForm.recordedAt,
                recordedBy: "patient",
            });
            setIsRecordDialogOpen(false);
            setRecordForm({
                type: "",
                value: "",
                unit: "",
                notes: "",
                recordedAt: new Date().toISOString().slice(0, 16),
            });
            toast({
                title: "Metric Recorded",
                description: "Your health metric has been recorded successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to record health metric.",
                variant: "destructive",
            });
        }
    };
    const getRecentMetrics = () => {
        return healthMetrics?.recent || metrics.slice(0, 10);
    };
    const getMetricTrend = (type) => {
        return healthMetrics?.trends?.find((t) => t.type === type);
    };
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Health Tracking Tools" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monitor your health metrics and track your progress" })] }), _jsxs(Dialog, { open: isRecordDialogOpen, onOpenChange: setIsRecordDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "mt-4 sm:mt-0", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Record Metric"] }) }), _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Record Health Metric" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Metric Type" }), _jsxs(Select, { value: recordForm.type, onValueChange: (value) => {
                                                            const metricType = metricTypes.find((m) => m.type === value);
                                                            setRecordForm((prev) => ({
                                                                ...prev,
                                                                type: value,
                                                                unit: metricType?.unit || "",
                                                            }));
                                                        }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select metric type" }) }), _jsx(SelectContent, { children: metricTypes.map((metric) => {
                                                                    const Icon = metric.icon;
                                                                    return (_jsx(SelectItem, { value: metric.type, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Icon, { className: `h-4 w-4 ${metric.color}` }), _jsx("span", { children: metric.label })] }) }, metric.type));
                                                                }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Value" }), _jsx(Input, { value: recordForm.value, onChange: (e) => setRecordForm((prev) => ({
                                                                    ...prev,
                                                                    value: e.target.value,
                                                                })), placeholder: "Enter value" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Unit" }), _jsx(Input, { value: recordForm.unit, onChange: (e) => setRecordForm((prev) => ({
                                                                    ...prev,
                                                                    unit: e.target.value,
                                                                })), placeholder: "Unit", readOnly: true })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Date & Time" }), _jsx(Input, { type: "datetime-local", value: recordForm.recordedAt, onChange: (e) => setRecordForm((prev) => ({
                                                            ...prev,
                                                            recordedAt: e.target.value,
                                                        })) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Notes (Optional)" }), _jsx(Textarea, { value: recordForm.notes, onChange: (e) => setRecordForm((prev) => ({
                                                            ...prev,
                                                            notes: e.target.value,
                                                        })), placeholder: "Add any notes about this reading...", rows: 3 })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setIsRecordDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleRecordMetric, disabled: !recordForm.type || !recordForm.value, children: "Record Metric" })] })] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "metrics", children: "Metrics" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" }), _jsx(TabsTrigger, { value: "goals", children: "Goals" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: metricTypes.slice(0, 4).map((metric) => {
                                    const Icon = metric.icon;
                                    const recentMetric = getRecentMetrics().find((m) => m.type === metric.type);
                                    const trend = getMetricTrend(metric.type);
                                    return (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: metric.label }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [recentMetric ? recentMetric.value : "--", _jsx("span", { className: "text-sm font-normal text-gray-500 ml-1", children: metric.unit })] }), trend && (_jsxs("div", { className: "flex items-center space-x-1 mt-1", children: [getTrendIcon(trend.trend), _jsxs("span", { className: `text-xs ${trend.trend === "improving"
                                                                            ? "text-green-600"
                                                                            : trend.trend === "declining"
                                                                                ? "text-red-600"
                                                                                : "text-gray-600"}`, children: [trend.change > 0 ? "+" : "", trend.change, "%"] })] }))] }), _jsx(Icon, { className: `h-8 w-8 ${metric.color}` })] }) }) }, metric.type));
                                }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Clock, { className: "h-5 w-5 mr-2" }), "Recent Readings"] }) }), _jsx(CardContent, { children: getRecentMetrics().length > 0 ? (_jsx("div", { className: "space-y-3", children: getRecentMetrics()
                                                .slice(0, 5)
                                                .map((metric) => {
                                                const Icon = getMetricIcon(metric.type);
                                                const metricType = metricTypes.find((m) => m.type === metric.type);
                                                return (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: `h-5 w-5 ${getMetricColor(metric.type)}` }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: metricType?.label || metric.type }), _jsxs("p", { className: "text-sm text-gray-600", children: [isToday(new Date(metric.recordedAt))
                                                                                    ? "Today"
                                                                                    : format(new Date(metric.recordedAt), "MMM dd"), " ", "at", " ", format(new Date(metric.recordedAt), "HH:mm")] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium text-gray-900", children: [metric.value, " ", metric.unit] }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: metric.recordedBy })] })] }, metric.id));
                                            }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No health metrics recorded yet" }), _jsx(Button, { className: "mt-4", onClick: () => setIsRecordDialogOpen(true), children: "Record Your First Metric" })] })) })] })] }), _jsx(TabsContent, { value: "metrics", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: metricTypes.map((metric) => {
                                const Icon = metric.icon;
                                const recentMetrics = getRecentMetrics().filter((m) => m.type === metric.type);
                                return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center text-lg", children: [_jsx(Icon, { className: `h-5 w-5 mr-2 ${metric.color}` }), metric.label] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Normal Range:" }), _jsx("span", { className: "font-medium", children: metric.normalRange })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Latest Reading:" }), _jsx("span", { className: "font-medium", children: recentMetrics.length > 0
                                                                    ? `${recentMetrics[0].value} ${metric.unit}`
                                                                    : "No data" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Total Readings:" }), _jsx("span", { className: "font-medium", children: recentMetrics.length })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
                                                            setRecordForm((prev) => ({
                                                                ...prev,
                                                                type: metric.type,
                                                                unit: metric.unit,
                                                            }));
                                                            setIsRecordDialogOpen(true);
                                                        }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Record ", metric.label] })] }) })] }, metric.type));
                            }) }) }), _jsx(TabsContent, { value: "trends", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "Health Trends"] }) }), _jsx(CardContent, { children: healthMetrics?.trends && healthMetrics.trends.length > 0 ? (_jsx("div", { className: "space-y-4", children: healthMetrics.trends.map((trend, index) => {
                                            const metricType = metricTypes.find((m) => m.type === trend.type);
                                            const Icon = metricType?.icon || Activity;
                                            return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: `h-6 w-6 ${metricType?.color || "text-gray-600"}` }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: metricType?.label || trend.type }), _jsx("p", { className: "text-sm text-gray-600", children: trend.trend === "improving"
                                                                            ? "Improving trend"
                                                                            : trend.trend === "declining"
                                                                                ? "Declining trend"
                                                                                : "Stable trend" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [getTrendIcon(trend.trend), _jsxs("span", { className: `font-medium ${trend.trend === "improving"
                                                                    ? "text-green-600"
                                                                    : trend.trend === "declining"
                                                                        ? "text-red-600"
                                                                        : "text-gray-600"}`, children: [trend.change > 0 ? "+" : "", trend.change, "%"] })] })] }, index));
                                        }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(TrendingUp, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Not enough data to show trends yet" }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Record more metrics to see your health trends" })] })) })] }) }), _jsx(TabsContent, { value: "goals", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Target, { className: "h-5 w-5 mr-2" }), "Health Goals"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Award, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Health goals feature coming soon" }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Set and track your personal health goals" })] }) })] }) })] })] }));
};
export default HealthTrackingTools;
