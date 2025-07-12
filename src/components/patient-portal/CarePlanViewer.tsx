import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Target,
  Activity,
  Pill,
  Calendar,
  TrendingUp,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Download,
  Share,
} from "lucide-react";
import {
  CarePlan,
  CareGoal,
  CareIntervention,
  Medication,
} from "@/types/patient-portal";
import { format, differenceInDays } from "date-fns";

interface CarePlanViewerProps {
  patientId: string;
  carePlans: CarePlan[];
  className?: string;
}

export const CarePlanViewer: React.FC<CarePlanViewerProps> = ({
  patientId,
  carePlans,
  className = "",
}) => {
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(
    carePlans.length > 0 ? carePlans[0] : null,
  );
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "not-started":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case "modified":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateOverallProgress = (goals: CareGoal[]) => {
    if (goals.length === 0) return 0;
    return goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length;
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
  };

  if (carePlans.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Care Plans Available
        </h3>
        <p className="text-gray-500 mb-6">
          You don't have any active care plans at the moment. Your healthcare
          provider will create care plans as needed.
        </p>
        <Button variant="outline">Contact Your Provider</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Care Plans</h2>
          <p className="text-gray-600 mt-1">
            Track your progress and view your personalized care plans
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Care Plans List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Care Plans</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {carePlans.map((plan) => {
                  const overallProgress = calculateOverallProgress(plan.goals);
                  const daysRemaining = getDaysRemaining(plan.endDate);

                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedPlan?.id === plan.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {plan.title}
                        </h4>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {plan.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{Math.round(overallProgress)}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-1" />
                        {daysRemaining !== null && (
                          <p className="text-xs text-gray-500">
                            {daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Care Plan Details */}
        <div className="lg:col-span-3">
          {selectedPlan ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {selectedPlan.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedPlan.status)}>
                    {selectedPlan.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(calculateOverallProgress(selectedPlan.goals))}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Overall Progress</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedPlan.goals.length}
                    </p>
                    <p className="text-sm text-gray-600">Goals</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedPlan.interventions.length}
                    </p>
                    <p className="text-sm text-gray-600">Interventions</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="interventions">
                      Interventions
                    </TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Plan Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">
                              {format(
                                new Date(selectedPlan.startDate),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          </div>
                          {selectedPlan.endDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">End Date:</span>
                              <span className="font-medium">
                                {format(
                                  new Date(selectedPlan.endDate),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created By:</span>
                            <span className="font-medium">
                              {selectedPlan.createdBy}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium">
                              {format(
                                new Date(selectedPlan.updatedAt),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Recent Progress
                        </h4>
                        <div className="space-y-3">
                          {selectedPlan.progress.slice(0, 3).map((note) => (
                            <div
                              key={note.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-sm font-medium text-gray-900">
                                  {note.title}
                                </h5>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(note.date), "MMM dd")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {note.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                By {note.author}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-4">
                    {selectedPlan.goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getGoalStatusIcon(goal.status)}
                              <h4 className="font-medium text-gray-900">
                                {goal.title}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {goal.progress}%
                              </span>
                              <Badge className={getStatusColor(goal.status)}>
                                {goal.status.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {goal.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {goal.progress}%
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>

                          {goal.metrics.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Metrics
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {goal.metrics.map((metric, index) => (
                                  <div
                                    key={index}
                                    className="p-2 bg-gray-50 rounded"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">
                                        {metric.name}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {metric.current} / {metric.target}{" "}
                                        {metric.unit}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                            <span>
                              Target Date:{" "}
                              {format(
                                new Date(goal.targetDate),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="interventions" className="space-y-4">
                    {selectedPlan.interventions.map((intervention) => (
                      <Card key={intervention.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">
                                {intervention.title}
                              </h4>
                            </div>
                            <Badge
                              className={getStatusColor(intervention.status)}
                            >
                              {intervention.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {intervention.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="font-medium capitalize">
                                {intervention.type}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Frequency:</span>
                              <p className="font-medium">
                                {intervention.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium">
                                {intervention.duration}
                              </p>
                            </div>
                          </div>

                          {intervention.instructions && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <h5 className="text-sm font-medium text-blue-900 mb-1">
                                Instructions
                              </h5>
                              <p className="text-sm text-blue-800">
                                {intervention.instructions}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4">
                    {selectedPlan.medications.map((medication) => (
                      <Card key={medication.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Pill className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-gray-900">
                                {medication.name}
                              </h4>
                            </div>
                            <Badge
                              className={getStatusColor(medication.status)}
                            >
                              {medication.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Dosage:</span>
                              <p className="font-medium">{medication.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Frequency:</span>
                              <p className="font-medium">
                                {medication.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Route:</span>
                              <p className="font-medium">{medication.route}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium">
                                {format(
                                  new Date(medication.startDate),
                                  "MMM dd",
                                )}{" "}
                                -
                                {medication.endDate
                                  ? format(
                                      new Date(medication.endDate),
                                      "MMM dd",
                                    )
                                  : "Ongoing"}
                              </p>
                            </div>
                          </div>

                          {medication.instructions && (
                            <div className="mb-3 p-3 bg-green-50 rounded-lg">
                              <h5 className="text-sm font-medium text-green-900 mb-1">
                                Instructions
                              </h5>
                              <p className="text-sm text-green-800">
                                {medication.instructions}
                              </p>
                            </div>
                          )}

                          {(medication.sideEffects.length > 0 ||
                            medication.interactions.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {medication.sideEffects.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                                    Side Effects
                                  </h5>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {medication.sideEffects.map(
                                      (effect, index) => (
                                        <li
                                          key={index}
                                          className="flex items-center"
                                        >
                                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                          {effect}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {medication.interactions.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                                    Interactions
                                  </h5>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {medication.interactions.map(
                                      (interaction, index) => (
                                        <li
                                          key={index}
                                          className="flex items-center"
                                        >
                                          <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                                          {interaction}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Care Plan
                </h3>
                <p className="text-gray-500">
                  Choose a care plan from the list to view its details, goals,
                  and progress.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarePlanViewer;
