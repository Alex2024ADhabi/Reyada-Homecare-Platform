// Patient Portal Type Definitions

export interface PatientUser {
  id: string;
  emiratesId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female";
  address: {
    street: string;
    city: string;
    emirate: string;
    postalCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    membershipNumber: string;
    expiryDate: string;
  };
  preferences: {
    language: "en" | "ar";
    notifications: NotificationPreferences;
  };
  // Patient Lifecycle Management Fields
  lifecycleStatus:
    | "referral"
    | "assessment"
    | "admission"
    | "active_care"
    | "discharge_planning"
    | "discharged"
    | "readmission";
  admissionDate?: string;
  dischargeDate?: string;
  dischargePlannedDate?: string;
  dischargeReason?: string;
  dischargeDestination?: "home" | "hospital" | "ltc_facility" | "other";
  // Homebound Status Assessment
  homeboundStatus: {
    status:
      | "qualified"
      | "not_qualified"
      | "pending_assessment"
      | "reassessment_required";
    assessmentDate: string;
    assessedBy: string;
    clinicalJustification: string;
    nextReassessmentDate: string;
    criteria: {
      confinedToHome: boolean;
      considerableEffortToLeave: boolean;
      medicallyJustified: boolean;
      physicianOrders: boolean;
    };
  };
  // Patient Complexity Scoring
  complexityScore: {
    medical: number; // 0-100
    functional: number; // 0-100
    social: number; // 0-100
    care: number; // 0-100
    overall: number; // 0-100
    lastAssessmentDate: string;
    assessedBy: string;
    factors: {
      chronicConditions: number;
      medications: number;
      adlDependency: number;
      cognitiveImpairment: number;
      socialSupport: number;
      careComplexity: number;
    };
  };
  // Risk Stratification
  riskAssessment: {
    fallRisk: {
      level: "low" | "medium" | "high" | "critical";
      score: number;
      factors: string[];
      interventions: string[];
      lastAssessment: string;
    };
    pressureInjuryRisk: {
      level: "low" | "medium" | "high" | "critical";
      bradenScore: number;
      factors: string[];
      interventions: string[];
      lastAssessment: string;
    };
    hospitalizationRisk: {
      level: "low" | "medium" | "high" | "critical";
      score: number;
      factors: string[];
      interventions: string[];
      lastAssessment: string;
    };
    infectionRisk: {
      level: "low" | "medium" | "high" | "critical";
      factors: string[];
      interventions: string[];
      lastAssessment: string;
    };
  };
  // Family and Caregiver Management
  familyCaregivers: FamilyCaregiver[];
  // Insurance and Eligibility
  insuranceVerification: {
    status: "verified" | "pending" | "expired" | "denied";
    verificationDate: string;
    eligibilityPeriod: {
      startDate: string;
      endDate: string;
    };
    authorizedServices: string[];
    copayAmount?: number;
    deductibleMet: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  careUpdates: boolean;
  educationalContent: boolean;
}

export interface CarePlan {
  id: string;
  patientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  goals: CareGoal[];
  interventions: CareIntervention[];
  medications: Medication[];
  appointments: Appointment[];
  progress: ProgressNote[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "not-started" | "in-progress" | "achieved" | "modified";
  progress: number; // 0-100
  metrics: {
    name: string;
    target: string;
    current: string;
    unit: string;
  }[];
}

export interface CareIntervention {
  id: string;
  type: "nursing" | "therapy" | "medication" | "education" | "monitoring";
  title: string;
  description: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
  status: "active" | "discontinued" | "completed";
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  type: "consultation" | "follow-up" | "procedure" | "therapy" | "assessment";
  title: string;
  description: string;
  scheduledDate: string;
  duration: number; // minutes
  location: {
    type: "home" | "clinic" | "virtual";
    address?: string;
    meetingLink?: string;
  };
  status:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressNote {
  id: string;
  date: string;
  type: "assessment" | "intervention" | "observation" | "education";
  title: string;
  content: string;
  author: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

export interface SecureMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "patient" | "provider" | "admin";
  recipientId: string;
  recipientName: string;
  recipientType: "patient" | "provider" | "admin";
  subject: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "sent" | "delivered" | "read" | "archived";
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  sentAt: string;
  readAt?: string;
}

export interface MessageConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    type: "patient" | "provider" | "admin";
    avatar?: string;
  }[];
  subject: string;
  lastMessage: SecureMessage;
  unreadCount: number;
  status: "active" | "archived" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  accessLevel: "view" | "limited" | "full";
  permissions: {
    viewCarePlan: boolean;
    viewAppointments: boolean;
    viewMedications: boolean;
    viewProgress: boolean;
    receiveNotifications: boolean;
    communicateWithProviders: boolean;
  };
  status: "pending" | "active" | "suspended";
  invitedAt: string;
  activatedAt?: string;
}

export interface FamilyCaregiver {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  contactInfo: {
    phone: string;
    email?: string;
    address?: {
      street: string;
      city: string;
      emirate: string;
    };
  };
  caregiverType: "primary" | "secondary" | "emergency" | "professional";
  availability: {
    schedule: {
      [day: string]: {
        available: boolean;
        timeSlots: { start: string; end: string }[];
      };
    };
    emergencyAvailable: boolean;
    overnightAvailable: boolean;
  };
  capabilities: {
    medicalTasks: string[];
    personalCare: string[];
    householdTasks: string[];
    transportation: boolean;
    languagesSpoken: string[];
  };
  training: {
    completed: string[];
    required: string[];
    certifications: {
      name: string;
      issueDate: string;
      expiryDate: string;
    }[];
  };
  contactHierarchy: {
    priority: number;
    notificationPreferences: {
      emergency: boolean;
      routine: boolean;
      careUpdates: boolean;
      appointmentReminders: boolean;
    };
  };
  status: "active" | "inactive" | "unavailable";
  createdAt: string;
  updatedAt: string;
}

export interface PatientLifecycleEvent {
  id: string;
  patientId: string;
  eventType:
    | "referral_received"
    | "assessment_scheduled"
    | "assessment_completed"
    | "admission"
    | "care_plan_created"
    | "service_started"
    | "status_change"
    | "discharge_planning"
    | "discharge"
    | "readmission";
  eventDate: string;
  description: string;
  performedBy: string;
  details: {
    [key: string]: any;
  };
  nextActions?: string[];
  createdAt: string;
}

export interface DischargeAssessment {
  id: string;
  patientId: string;
  assessmentDate: string;
  assessedBy: string;
  dischargeReadiness: {
    medicalStability: boolean;
    functionalStatus: "improved" | "stable" | "declined";
    caregiverSupport: boolean;
    homeEnvironment: boolean;
    equipmentAvailable: boolean;
    followUpArranged: boolean;
  };
  dischargeBarriers: string[];
  recommendedDischargeDate: string;
  dischargeDestination: "home" | "hospital" | "ltc_facility" | "other";
  followUpPlan: {
    appointments: {
      provider: string;
      date: string;
      type: string;
    }[];
    homeServices: string[];
    equipmentNeeds: string[];
    medicationChanges: string[];
  };
  familyEducation: {
    completed: boolean;
    topics: string[];
    materials: string[];
    comprehensionLevel: "good" | "fair" | "poor";
  };
  status: "in_progress" | "completed" | "approved";
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  type:
    | "blood-pressure"
    | "heart-rate"
    | "weight"
    | "blood-sugar"
    | "temperature"
    | "oxygen-saturation"
    | "pain-level"
    | "mood";
  value: string;
  unit: string;
  recordedAt: string;
  recordedBy: "patient" | "provider" | "device";
  notes?: string;
  deviceId?: string;
}

export interface EducationalResource {
  id: string;
  type: "article" | "video" | "infographic" | "interactive" | "pdf";
  title: string;
  description: string;
  content?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number; // for videos, in seconds
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  language: "en" | "ar";
  personalizedFor?: string[]; // conditions or medications
  createdAt: string;
  updatedAt: string;
}

export interface SatisfactionSurvey {
  id: string;
  patientId: string;
  type: "post-appointment" | "care-experience" | "service-quality" | "general";
  title: string;
  questions: SurveyQuestion[];
  status: "pending" | "in-progress" | "completed" | "expired";
  responses?: SurveyResponse[];
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface SurveyQuestion {
  id: string;
  type: "rating" | "multiple-choice" | "text" | "yes-no";
  question: string;
  required: boolean;
  options?: string[]; // for multiple-choice
  scale?: {
    min: number;
    max: number;
    labels: string[];
  }; // for rating
}

export interface SurveyResponse {
  questionId: string;
  answer: string | number;
  comment?: string;
}

export interface PatientDashboardData {
  patient: PatientUser;
  upcomingAppointments: Appointment[];
  activeCarePlans: CarePlan[];
  recentMessages: SecureMessage[];
  pendingSurveys: SatisfactionSurvey[];
  healthMetrics: {
    recent: HealthMetric[];
    trends: {
      type: string;
      trend: "improving" | "stable" | "declining";
      change: number;
    }[];
  };
  notifications: {
    unread: number;
    recent: {
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
      read: boolean;
    }[];
  };
  educationalRecommendations: EducationalResource[];
}

export interface AppointmentSlot {
  id: string;
  providerId: string;
  providerName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: string[];
  available: boolean;
  location: {
    type: "home" | "clinic" | "virtual";
    address?: string;
  };
}

export interface PatientPortalSettings {
  theme: "light" | "dark" | "auto";
  language: "en" | "ar";
  notifications: NotificationPreferences;
  privacy: {
    shareDataForResearch: boolean;
    allowFamilyAccess: boolean;
    showProgressToFamily: boolean;
  };
  accessibility: {
    fontSize: "small" | "medium" | "large";
    highContrast: boolean;
    screenReader: boolean;
  };
}
