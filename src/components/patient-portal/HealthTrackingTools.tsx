import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Activity,
  Thermometer,
  Scale,
  Droplets,
  Zap,
  Brain,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react";
import { HealthMetric } from "@/types/patient-portal";
import { useHealthTracking } from "@/hooks/useHealthTracking";
import { useToast } from "@/hooks/useToast";
import { format, subDays, isToday } from "date-fns";

interface HealthTrackingToolsProps {
  patientId: string;
  healthMetrics?: {
    recent: HealthMetric[];
    trends: {
      type: string;
      trend: "improving" | "stable" | "declining";
      change: number;
    }[];
  };
  className?: string;
}

export const HealthTrackingTools: React.FC<HealthTrackingToolsProps> = ({
  patientId,
  healthMetrics,
  className = "",
}) => {
  const { toast } = useToast();
  const {
    metrics,
    goals,
    isLoading,
    recordMetric,
    updateGoal,
    getMetricTrends,
  } = useHealthTracking(patientId);

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

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricIcon = (type: string) => {
    const metricType = metricTypes.find((m) => m.type === type);
    if (!metricType) return Heart;
    return metricType.icon;
  };

  const getMetricColor = (type: string) => {
    const metricType = metricTypes.find((m) => m.type === type);
    return metricType?.color || "text-gray-600";
  };

  const handleRecordMetric = async () => {
    if (!recordForm.type || !recordForm.value) return;

    try {
      await recordMetric({
        type: recordForm.type as any,
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
    } catch (error) {
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

  const getMetricTrend = (type: string) => {
    return healthMetrics?.trends?.find((t) => t.type === type);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Health Tracking Tools
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor your health metrics and track your progress
          </p>
        </div>
        <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Record Metric
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Health Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Metric Type</Label>
                <Select
                  value={recordForm.type}
                  onValueChange={(value) => {
                    const metricType = metricTypes.find(
                      (m) => m.type === value,
                    );
                    setRecordForm((prev) => ({
                      ...prev,
                      type: value,
                      unit: metricType?.unit || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <SelectItem key={metric.type} value={metric.type}>
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${metric.color}`} />
                            <span>{metric.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Value</Label>
                  <Input
                    value={recordForm.value}
                    onChange={(e) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Unit</Label>
                  <Input
                    value={recordForm.unit}
                    onChange={(e) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    placeholder="Unit"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={recordForm.recordedAt}
                  onChange={(e) =>
                    setRecordForm((prev) => ({
                      ...prev,
                      recordedAt: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Notes (Optional)</Label>
                <Textarea
                  value={recordForm.notes}
                  onChange={(e) =>
                    setRecordForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Add any notes about this reading..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsRecordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordMetric}
                  disabled={!recordForm.type || !recordForm.value}
                >
                  Record Metric
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricTypes.slice(0, 4).map((metric) => {
              const Icon = metric.icon;
              const recentMetric = getRecentMetrics().find(
                (m) => m.type === metric.type,
              );
              const trend = getMetricTrend(metric.type);

              return (
                <Card key={metric.type}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {recentMetric ? recentMetric.value : "--"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {metric.unit}
                          </span>
                        </p>
                        {trend && (
                          <div className="flex items-center space-x-1 mt-1">
                            {getTrendIcon(trend.trend)}
                            <span
                              className={`text-xs ${
                                trend.trend === "improving"
                                  ? "text-green-600"
                                  : trend.trend === "declining"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {trend.change > 0 ? "+" : ""}
                              {trend.change}%
                            </span>
                          </div>
                        )}
                      </div>
                      <Icon className={`h-8 w-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getRecentMetrics().length > 0 ? (
                <div className="space-y-3">
                  {getRecentMetrics()
                    .slice(0, 5)
                    .map((metric) => {
                      const Icon = getMetricIcon(metric.type);
                      const metricType = metricTypes.find(
                        (m) => m.type === metric.type,
                      );

                      return (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon
                              className={`h-5 w-5 ${getMetricColor(metric.type)}`}
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {metricType?.label || metric.type}
                              </p>
                              <p className="text-sm text-gray-600">
                                {isToday(new Date(metric.recordedAt))
                                  ? "Today"
                                  : format(
                                      new Date(metric.recordedAt),
                                      "MMM dd",
                                    )}{" "}
                                at{" "}
                                {format(new Date(metric.recordedAt), "HH:mm")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {metric.value} {metric.unit}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {metric.recordedBy}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No health metrics recorded yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsRecordDialogOpen(true)}
                  >
                    Record Your First Metric
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricTypes.map((metric) => {
              const Icon = metric.icon;
              const recentMetrics = getRecentMetrics().filter(
                (m) => m.type === metric.type,
              );

              return (
                <Card key={metric.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Icon className={`h-5 w-5 mr-2 ${metric.color}`} />
                      {metric.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Normal Range:</span>
                        <span className="font-medium">
                          {metric.normalRange}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Latest Reading:</span>
                        <span className="font-medium">
                          {recentMetrics.length > 0
                            ? `${recentMetrics[0].value} ${metric.unit}`
                            : "No data"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Readings:</span>
                        <span className="font-medium">
                          {recentMetrics.length}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setRecordForm((prev) => ({
                            ...prev,
                            type: metric.type,
                            unit: metric.unit,
                          }));
                          setIsRecordDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record {metric.label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthMetrics?.trends && healthMetrics.trends.length > 0 ? (
                <div className="space-y-4">
                  {healthMetrics.trends.map((trend, index) => {
                    const metricType = metricTypes.find(
                      (m) => m.type === trend.type,
                    );
                    const Icon = metricType?.icon || Activity;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            className={`h-6 w-6 ${metricType?.color || "text-gray-600"}`}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {metricType?.label || trend.type}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {trend.trend === "improving"
                                ? "Improving trend"
                                : trend.trend === "declining"
                                  ? "Declining trend"
                                  : "Stable trend"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(trend.trend)}
                          <span
                            className={`font-medium ${
                              trend.trend === "improving"
                                ? "text-green-600"
                                : trend.trend === "declining"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {trend.change > 0 ? "+" : ""}
                            {trend.change}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Not enough data to show trends yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Record more metrics to see your health trends
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Health Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Health goals feature coming soon
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Set and track your personal health goals
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthTrackingTools;
