/**
 * Patient Record Type Definitions
 *
 * These types define the structure of patient records according to DOH requirements.
 */

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  emirate: string;
  postalCode?: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  expiryDate: string;
  coverageType: string;
  additionalInfo?: Record<string, any>;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
  alternateContactNumber?: string;
}

export interface Surgery {
  procedure: string;
  date: string;
  hospital: string;
  surgeon?: string;
  notes?: string;
}

export interface MedicalHistory {
  conditions: string[];
  allergies: string[];
  medications: string[];
  surgeries: Surgery[];
  familyHistory?: string[];
  immunizations?: Array<{ name: string; date: string }>;
}

export interface PatientRecord {
  id: string;
  emiratesId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  nationality: string;
  contactNumber: string;
  alternateContactNumber?: string;
  email?: string;
  address: Address;
  insuranceDetails: InsuranceDetails;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "archived";
  preferredLanguage?: string;
  occupation?: string;
  maritalStatus?: "single" | "married" | "divorced" | "widowed";
  notes?: string;
  tags?: string[];
}

export interface PatientEpisode {
  id: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  careType: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  referringPhysician: string;
  assignedCareTeam: string[];
  status: "active" | "completed" | "cancelled";
  visitFrequency?: string;
  goals?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientVisit {
  id: string;
  episodeId: string;
  patientId: string;
  visitDate: string;
  clinicianId: string;
  clinicianName: string;
  visitType: string;
  duration: number; // in minutes
  notes: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    pain?: number;
  };
  assessments?: string[];
  interventions?: string[];
  medications?: string[];
  nextVisitDate?: string;
  signature?: string;
  createdAt: string;
  updatedAt: string;
}
