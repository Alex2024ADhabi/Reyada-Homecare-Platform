import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TherapySession } from "@/api/therapy.api";

interface TherapySessionReportProps {
  data: TherapySession[];
}

export default function TherapySessionReport({
  data,
}: TherapySessionReportProps) {
  const [activeTab, setActiveTab] = useState("summary");

  // Calculate summary statistics
  const totalSessions = data.length;
  const completedSessions = data.filter(
    (session) => session.status === "completed",
  ).length;
  const scheduledSessions = data.filter(
    (session) => session.status === "scheduled",
  ).length;
  const cancelledSessions = data.filter(
    (session) => session.status === "cancelled",
  ).length;
  const noShowSessions = data.filter(
    (session) => session.status === "no-show",
  ).length;

  // Calculate completion rate
  const completionRate =
    totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calculate average progress rating
  const completedSessionsWithRating = data.filter(
    (session) => session.status === "completed" && session.progress_rating,
  );
  const averageProgressRating =
    completedSessionsWithRating.length > 0
      ? completedSessionsWithRating.reduce(
          (sum, session) => sum + (session.progress_rating || 0),
          0,
        ) / completedSessionsWithRating.length
      : 0;

  // Group by therapy type
  const sessionsByType = data.reduce(
    (acc, session) => {
      const type = session.therapy_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(session);
      return acc;
    },
    {} as Record<string, TherapySession[]>,
  );

  // Group by therapist
  const sessionsByTherapist = data.reduce(
    (acc, session) => {
      const therapist = session.therapist;
      if (!acc[therapist]) acc[therapist] = [];
      acc[therapist].push(session);
      return acc;
    },
    {} as Record<string, TherapySession[]>,
  );

  // Group by patient
  const sessionsByPatient = data.reduce(
    (acc, session) => {
      const patientId = session.patient_id.toString();
      if (!acc[patientId]) acc[patientId] = [];
      acc[patientId].push(session);
      return acc;
    },
    {} as Record<string, TherapySession[]>,
  );

  // Get top patients by number of sessions
  const topPatients = Object.entries(sessionsByPatient)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="byType">By Therapy Type</TabsTrigger>
          <TabsTrigger value="byTherapist">By Therapist</TabsTrigger>
          <TabsTrigger value="byPatient">By Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Sessions</CardTitle>
                <CardDescription>All therapy sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSessions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
                <CardDescription>Sessions completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {completedSessions}
                </div>
                <div className="text-sm text-gray-500">
                  {completionRate.toFixed(1)}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Scheduled</CardTitle>
                <CardDescription>Upcoming sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {scheduledSessions}
                </div>
                <div className="text-sm text-gray-500">
                  {totalSessions > 0
                    ? ((scheduledSessions / totalSessions) * 100).toFixed(1)
                    : 0}
                  % of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Progress</CardTitle>
                <CardDescription>Patient improvement rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {averageProgressRating.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-500">
                  Based on {completedSessionsWithRating.length} sessions
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Session Status Overview</CardTitle>
              <CardDescription>
                Distribution of therapy session statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="flex justify-between mb-2">
                      <span>Completed</span>
                      <span>
                        {completedSessions} (
                        {totalSessions > 0
                          ? ((completedSessions / totalSessions) * 100).toFixed(
                              1,
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{
                          width: `${totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between mb-2 mt-4">
                      <span>Scheduled</span>
                      <span>
                        {scheduledSessions} (
                        {totalSessions > 0
                          ? ((scheduledSessions / totalSessions) * 100).toFixed(
                              1,
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${totalSessions > 0 ? (scheduledSessions / totalSessions) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between mb-2 mt-4">
                      <span>Cancelled</span>
                      <span>
                        {cancelledSessions} (
                        {totalSessions > 0
                          ? ((cancelledSessions / totalSessions) * 100).toFixed(
                              1,
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-600 h-4 rounded-full"
                        style={{
                          width: `${totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between mb-2 mt-4">
                      <span>No Show</span>
                      <span>
                        {noShowSessions} (
                        {totalSessions > 0
                          ? ((noShowSessions / totalSessions) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-yellow-600 h-4 rounded-full"
                        style={{
                          width: `${totalSessions > 0 ? (noShowSessions / totalSessions) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byType">
          <Card>
            <CardHeader>
              <CardTitle>Sessions by Therapy Type</CardTitle>
              <CardDescription>
                Distribution of sessions across therapy types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(sessionsByType).map(([type, sessions]) => {
                  const typeLabel =
                    type === "PT"
                      ? "Physical Therapy"
                      : type === "OT"
                        ? "Occupational Therapy"
                        : type === "ST"
                          ? "Speech Therapy"
                          : type === "RT"
                            ? "Respiratory Therapy"
                            : type;

                  const completedCount = sessions.filter(
                    (s) => s.status === "completed",
                  ).length;
                  const avgRating =
                    sessions
                      .filter(
                        (s) => s.status === "completed" && s.progress_rating,
                      )
                      .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                    (sessions.filter(
                      (s) => s.status === "completed" && s.progress_rating,
                    ).length || 1);

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{typeLabel}</h3>
                        <span>{sessions.length} sessions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{
                            width: `${(sessions.length / totalSessions) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Completed: {completedCount} | Avg. Progress:{" "}
                        {avgRating.toFixed(1)}/10
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byTherapist">
          <Card>
            <CardHeader>
              <CardTitle>Sessions by Therapist</CardTitle>
              <CardDescription>
                Distribution of sessions by therapist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(sessionsByTherapist).map(
                  ([therapist, sessions]) => {
                    const completedCount = sessions.filter(
                      (s) => s.status === "completed",
                    ).length;
                    const avgRating =
                      sessions
                        .filter(
                          (s) => s.status === "completed" && s.progress_rating,
                        )
                        .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                      (sessions.filter(
                        (s) => s.status === "completed" && s.progress_rating,
                      ).length || 1);

                    const therapyTypes = [
                      ...new Set(sessions.map((s) => s.therapy_type)),
                    ];

                    return (
                      <div key={therapist} className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{therapist}</h3>
                          <span>{sessions.length} sessions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full"
                            style={{
                              width: `${(sessions.length / totalSessions) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Completed: {completedCount} | Avg. Progress:{" "}
                          {avgRating.toFixed(1)}/10 | Types:{" "}
                          {therapyTypes
                            .map((t) =>
                              t === "PT"
                                ? "Physical"
                                : t === "OT"
                                  ? "Occupational"
                                  : t === "ST"
                                    ? "Speech"
                                    : t === "RT"
                                      ? "Respiratory"
                                      : t,
                            )
                            .join(", ")}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byPatient">
          <Card>
            <CardHeader>
              <CardTitle>Top Patients by Session Count</CardTitle>
              <CardDescription>
                Patients with the most therapy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topPatients.map(([patientId, sessions]) => {
                  const completedCount = sessions.filter(
                    (s) => s.status === "completed",
                  ).length;
                  const avgRating =
                    sessions
                      .filter(
                        (s) => s.status === "completed" && s.progress_rating,
                      )
                      .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                    (sessions.filter(
                      (s) => s.status === "completed" && s.progress_rating,
                    ).length || 1);

                  const therapyTypes = [
                    ...new Set(sessions.map((s) => s.therapy_type)),
                  ];

                  return (
                    <div key={patientId} className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Patient ID: {patientId}</h3>
                        <span>{sessions.length} sessions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{
                            width: `${(sessions.length / totalSessions) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Completed: {completedCount} | Avg. Progress:{" "}
                        {avgRating.toFixed(1)}/10 | Types:{" "}
                        {therapyTypes
                          .map((t) =>
                            t === "PT"
                              ? "Physical"
                              : t === "OT"
                                ? "Occupational"
                                : t === "ST"
                                  ? "Speech"
                                  : t === "RT"
                                    ? "Respiratory"
                                    : t,
                          )
                          .join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
