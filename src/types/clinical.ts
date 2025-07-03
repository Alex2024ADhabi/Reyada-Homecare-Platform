/**
 * Clinical Assessment Type Definitions
 *
 * These types define the structure of clinical assessments according to DOH requirements.
 */

export interface AssessmentDomain {
  domain:
    | "physical"
    | "functional"
    | "psychological"
    | "social"
    | "environmental"
    | "spiritual"
    | "nutritional"
    | "pain"
    | "medication";
  findings: string;
  score: number; // 1-5 scale
  notes?: string;
}

export interface CarePlan {
  goals: string[];
  interventions: string[];
  expectedOutcomes: string[];
  timeline?: string;
  reviewDate?: string;
}

export interface ClinicalAssessment {
  id: string;
  patientId: string;
  assessmentType: "initial" | "follow-up" | "discharge";
  assessmentDate: string;
  clinicianId: string;
  clinicianName: string;
  clinicianSignature: string;
  domains: AssessmentDomain[];
  totalScore: number;
  recommendations: string;
  careplan: CarePlan;
  createdAt: string;
  updatedAt: string;
  reviewDate?: string;
  previousAssessmentId?: string;
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route:
    | "oral"
    | "intravenous"
    | "intramuscular"
    | "subcutaneous"
    | "topical"
    | "inhalation"
    | "rectal"
    | "other";
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  prescriptionDate: string;
  instructions?: string;
  reason?: string;
  status: "active" | "completed" | "discontinued";
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAdministration {
  id: string;
  medicationOrderId: string;
  patientId: string;
  administeredBy: string;
  administrationDate: string;
  dosage: string;
  route: string;
  site?: string;
  notes?: string;
  patientResponse?: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedAt: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  pain?: number;
  bloodGlucose?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WoundAssessment {
  id: string;
  patientId: string;
  assessedBy: string;
  assessmentDate: string;
  location: string;
  size: {
    length: number;
    width: number;
    depth?: number;
  };
  woundBed: string;
  exudate: string;
  odor?: string;
  surroundingSkin: string;
  pain: number;
  stage?: string;
  treatment: string;
  images?: string[];
  notes?: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}
