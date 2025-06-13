import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { TherapySession } from "@/api/therapy.api";

interface TherapySessionCalendarProps {
  sessions: TherapySession[];
  onEditSession?: (session: TherapySession) => void;
}

export default function TherapySessionCalendar({
  sessions,
  onEditSession,
}: TherapySessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(
    null,
  );

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, TherapySession[]> = {};

    sessions.forEach((session) => {
      const dateKey = session.session_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return grouped;
  }, [sessions]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleSessionClick = (session: TherapySession) => {
    setSelectedSession(session);
  };

  const handleEditClick = () => {
    if (selectedSession && onEditSession) {
      onEditSession(selectedSession);
      setSelectedSession(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-500 text-green-800";
      case "scheduled":
        return "bg-blue-100 border-blue-500 text-blue-800";
      case "cancelled":
        return "bg-red-100 border-red-500 text-red-800";
      case "no-show":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  const getStatusBadgeVariant = (
    status?: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "scheduled":
        return "default";
      case "cancelled":
        return "destructive";
      case "no-show":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Therapy Sessions Calendar</CardTitle>
              <CardDescription>
                View and manage scheduled therapy sessions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const daySessions = sessionsByDate[dateStr] || [];
              const hasCompletedSessions = daySessions.some(
                (s) => s.status === "completed",
              );
              const hasScheduledSessions = daySessions.some(
                (s) => s.status === "scheduled",
              );
              const hasCancelledSessions = daySessions.some(
                (s) => s.status === "cancelled",
              );
              const hasNoShowSessions = daySessions.some(
                (s) => s.status === "no-show",
              );

              return (
                <div
                  key={dateStr}
                  className={`min-h-24 p-1 border rounded-md ${daySessions.length > 0 ? "border-gray-300" : "border-gray-100"}`}
                >
                  <div className="font-medium text-sm mb-1">
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {daySessions.map((session) => (
                      <div
                        key={session._id?.toString()}
                        className={`text-xs p-1 rounded border cursor-pointer ${getStatusColor(session.status)}`}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="font-medium truncate">
                          {session.therapy_type} - {session.session_time}
                        </div>
                        <div className="truncate">{session.therapist}</div>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{daySessions.length - 3} more
                      </div>
                    )}
                  </div>
                  {(hasCompletedSessions ||
                    hasScheduledSessions ||
                    hasCancelledSessions ||
                    hasNoShowSessions) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hasCompletedSessions && (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      )}
                      {hasScheduledSessions && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                      {hasCancelledSessions && (
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      )}
                      {hasNoShowSessions && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendar Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Cancelled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>No Show</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      {selectedSession && (
        <Dialog
          open={!!selectedSession}
          onOpenChange={(open) => !open && setSelectedSession(null)}
        >
          <DialogContent>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Session Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Patient ID
                    </p>
                    <p>{selectedSession.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Therapist
                    </p>
                    <p>{selectedSession.therapist}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Therapy Type
                    </p>
                    <p>
                      {selectedSession.therapy_type === "PT"
                        ? "Physical Therapy"
                        : selectedSession.therapy_type === "OT"
                          ? "Occupational Therapy"
                          : selectedSession.therapy_type === "ST"
                            ? "Speech Therapy"
                            : selectedSession.therapy_type === "RT"
                              ? "Respiratory Therapy"
                              : selectedSession.therapy_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge
                      variant={getStatusBadgeVariant(selectedSession.status)}
                    >
                      {selectedSession.status?.charAt(0).toUpperCase() +
                        selectedSession.status?.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date & Time
                    </p>
                    <p>
                      {selectedSession.session_date} at{" "}
                      {selectedSession.session_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p>{selectedSession.duration_minutes} minutes</p>
                  </div>
                </div>

                {selectedSession.progress_rating && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Progress Rating
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">
                        {selectedSession.progress_rating}/10
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(selectedSession.progress_rating / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSession.goals_addressed && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Goals Addressed
                    </p>
                    <p className="mt-1">{selectedSession.goals_addressed}</p>
                  </div>
                )}

                {selectedSession.session_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Session Notes
                    </p>
                    <p className="mt-1">{selectedSession.session_notes}</p>
                  </div>
                )}

                {selectedSession.home_exercises_assigned && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Home Exercises
                    </p>
                    <p className="mt-1">
                      {selectedSession.home_exercises_assigned}
                    </p>
                  </div>
                )}

                {selectedSession.next_session_scheduled && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Next Session
                    </p>
                    <p className="mt-1">
                      {selectedSession.next_session_scheduled}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSession(null)}
                  >
                    Close
                  </Button>
                  {onEditSession && (
                    <Button onClick={handleEditClick}>Edit Session</Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
