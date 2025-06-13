import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";

// Interface for Therapy Sessions based on the Technical Requirements Document
export interface TherapySession {
  _id?: string | ObjectId;
  patient_id: number | string;
  therapy_type: string; // 'PT', 'OT', 'ST', 'RT'
  therapist: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  session_notes: string;
  progress_rating: number; // 1-10 scale
  goals_addressed: string;
  home_exercises_assigned: string;
  next_session_scheduled: string;
  status?: "scheduled" | "completed" | "cancelled" | "no-show";
  completion_date?: string;
}

// Get all therapy sessions
export async function getAllTherapySessions() {
  const db = getDb();
  return db.collection("therapy_sessions").find().toArray();
}

// Get therapy session by ID
export async function getTherapySessionById(id: string) {
  const db = getDb();
  return db.collection("therapy_sessions").findOne({ _id: new ObjectId(id) });
}

// Get therapy sessions by patient ID
export async function getTherapySessionsByPatientId(
  patientId: string | number,
) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .find({ patient_id: patientId })
    .toArray();
}

// Get therapy sessions by therapist
export async function getTherapySessionsByTherapist(therapist: string) {
  const db = getDb();
  return db.collection("therapy_sessions").find({ therapist }).toArray();
}

// Get therapy sessions by date
export async function getTherapySessionsByDate(date: string) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .find({ session_date: date })
    .toArray();
}

// Get therapy sessions by therapy type
export async function getTherapySessionsByType(therapyType: string) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .find({ therapy_type: therapyType })
    .toArray();
}

// Create a new therapy session
export async function createTherapySession(sessionData: TherapySession) {
  const db = getDb();
  // Set default status if not provided
  if (!sessionData.status) {
    sessionData.status = "scheduled";
  }
  return db.collection("therapy_sessions").insertOne(sessionData);
}

// Update a therapy session
export async function updateTherapySession(
  id: string,
  sessionData: Partial<TherapySession>,
) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .updateOne({ _id: new ObjectId(id) }, { $set: sessionData });
}

// Delete a therapy session
export async function deleteTherapySession(id: string) {
  const db = getDb();
  return db.collection("therapy_sessions").deleteOne({ _id: new ObjectId(id) });
}

// Schedule next therapy session
export async function scheduleNextSession(id: string, nextSessionDate: string) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { next_session_scheduled: nextSessionDate } },
    );
}

// Update therapy session progress rating
export async function updateProgressRating(id: string, progressRating: number) {
  if (progressRating < 1 || progressRating > 10) {
    throw new Error("Progress rating must be between 1 and 10");
  }

  const db = getDb();
  return db
    .collection("therapy_sessions")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { progress_rating: progressRating } },
    );
}

// Get upcoming therapy sessions
export async function getUpcomingTherapySessions(days: number = 7) {
  const db = getDb();
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + days);

  const todayStr = today.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  return db
    .collection("therapy_sessions")
    .find({
      session_date: { $gte: todayStr, $lte: endDateStr },
      status: { $ne: "cancelled" },
    })
    .toArray();
}

// Get patient therapy history
export async function getPatientTherapyHistory(
  patientId: string | number,
  therapyType?: string,
) {
  const db = getDb();
  const query: any = { patient_id: patientId };

  if (therapyType) {
    query.therapy_type = therapyType;
  }

  return db.collection("therapy_sessions").find(query).toArray();
}

// Mark therapy session as completed
export async function completeTherapySession(
  id: string,
  notes: string,
  progressRating: number,
  homeExercises?: string,
) {
  if (progressRating < 1 || progressRating > 10) {
    throw new Error("Progress rating must be between 1 and 10");
  }

  const db = getDb();
  const updateData: Partial<TherapySession> = {
    status: "completed",
    completion_date: new Date().toISOString().split("T")[0],
    session_notes: notes,
    progress_rating: progressRating,
  };

  if (homeExercises) {
    updateData.home_exercises_assigned = homeExercises;
  }

  return db
    .collection("therapy_sessions")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

// Cancel therapy session
export async function cancelTherapySession(id: string, reason: string) {
  const db = getDb();
  return db.collection("therapy_sessions").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "cancelled",
        session_notes: reason,
      },
    },
  );
}

// Mark therapy session as no-show
export async function markNoShowTherapySession(id: string, notes?: string) {
  const db = getDb();
  const updateData: Partial<TherapySession> = {
    status: "no-show",
  };

  if (notes) {
    updateData.session_notes = notes;
  }

  return db
    .collection("therapy_sessions")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

// Get therapy sessions by status
export async function getTherapySessionsByStatus(status: string) {
  const db = getDb();
  return db.collection("therapy_sessions").find({ status }).toArray();
}

// Get therapy sessions by date range
export async function getTherapySessionsByDateRange(
  startDate: string,
  endDate: string,
) {
  const db = getDb();
  return db
    .collection("therapy_sessions")
    .find({
      session_date: { $gte: startDate, $lte: endDate },
    })
    .toArray();
}

// Get therapy sessions count by type
export async function getTherapySessionsCountByType() {
  const db = getDb();
  const sessions = await db.collection("therapy_sessions").find().toArray();

  const counts: Record<string, number> = {
    PT: 0,
    OT: 0,
    ST: 0,
    RT: 0,
  };

  sessions.forEach((session) => {
    if (counts[session.therapy_type]) {
      counts[session.therapy_type]++;
    }
  });

  return counts;
}

// Batch create therapy sessions
export async function batchCreateTherapySessions(sessions: TherapySession[]) {
  const db = getDb();
  // Set default status if not provided
  const sessionsWithDefaults = sessions.map((session) => ({
    ...session,
    status: session.status || "scheduled",
  }));
  return db.collection("therapy_sessions").insertMany(sessionsWithDefaults);
}
