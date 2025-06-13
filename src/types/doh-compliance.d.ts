// DOH Compliance Database Schema Type Definitions

// ===== 9-DOMAIN ASSESSMENT TYPES =====

export interface DOHNineDomainsAssessment {
  id: string;
  patientId: string;
  episodeId: string;
  assessmentDate: string;
  assessedBy: string;
  assessorLicense: string;
  assessorRole: string;
  physicalHealth: DOHAssessmentDomain;
  mentalHealth: DOHAssessmentDomain;
  socialSupport: DOHAssessmentDomain;
  environmentalSafety: DOHAssessmentDomain;
  functionalStatus: DOHAssessmentDomain;
  cognitiveStatus: DOHAssessmentDomain;
  nutritionalStatus: DOHAssessmentDomain;
  medicationManagement: DOHAssessmentDomain;
  careCoordination: DOHAssessmentDomain;
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  completionStatus: "incomplete" | "complete" | "validated" | "approved";
  validationResults: DOHNineDomainsValidationResult;
  nextReviewDate: string;
  complianceScore: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DOHAssessmentDomain {
  domainName: string;
  completed: boolean;
  score: number; // 0-5 scale
  maxScore: number;
  findings: string;
  interventions: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  lastAssessed: string;
  assessedBy?: string;
  reviewDate?: string;
  clinicalJustification?: string;
  outcomeGoals?: string[];
  monitoringPlan?: string;
  evidenceDocuments?: string[];
  complianceStatus:
    | "compliant"
    | "non-compliant"
    | "partially-compliant"
    | "pending";
  validationErrors: string[];
  recommendations: string[];
  priorityLevel: "low" | "medium" | "high" | "urgent";
  timeframe: string;
  resourcesRequired: string[];
}

export interface DOHNineDomainsValidationResult {
  isValid: boolean;
  validationDate: string;
  validatedBy: string;
  completionRate: number;
  overallScore: number;
  maxPossibleScore: number;
  domainScores: {
    [domain: string]: {
      score: number;
      maxScore: number;
      completionPercentage: number;
      riskLevel: string;
      completed: boolean;
      issues: string[];
      recommendations: string[];
      complianceStatus: string;
      validationErrors: string[];
      criticalFindings: string[];
    };
  };
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  criticalFindings: string[];
  recommendedInterventions: string[];
  nextReviewDate: string;
  complianceStatus:
    | "compliant"
    | "non-compliant"
    | "partially-compliant"
    | "pending";
  validationErrors: string[];
  qualityIndicators: {
    dataCompleteness: number;
    assessmentAccuracy: number;
    timelinessScore: number;
    clinicalRelevance: number;
  };
  riskMitigationPlan: {
    immediateActions: string[];
    shortTermGoals: string[];
    longTermObjectives: string[];
    monitoringSchedule: string;
  };
  complianceGaps: {
    domain: string;
    gap: string;
    severity: "low" | "medium" | "high" | "critical";
    remediation: string;
    timeline: string;
  }[];
}

export interface DOHAssessmentTemplate {
  domainKey: string;
  domainName: string;
  description: string;
  assessmentCriteria: {
    criterion: string;
    weight: number;
    scoringGuideline: string;
    validationRules: string[];
    requiredEvidence: string[];
  }[];
  riskFactors: string[];
  interventionOptions: string[];
  documentationRequirements: string[];
  regulatoryReferences: string[];
  qualityStandards: {
    minimumScore: number;
    targetScore: number;
    excellenceThreshold: number;
  };
  validationRules: {
    mandatory: string[];
    conditional: string[];
    businessRules: string[];
  };
}

export interface DOHComplianceEntity {
  id: string;
  facilityId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  status: "active" | "inactive" | "archived";
}

// ===== CORE COMPLIANCE ENTITIES =====

export interface DOHFacility extends DOHComplianceEntity {
  facilityName: string;
  facilityType: "homecare" | "clinic" | "hospital" | "rehabilitation";
  licenseNumber: string;
  licenseExpiryDate: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
  operatingHours: {
    [day: string]: {
      open: string;
      close: string;
      is24Hours: boolean;
    };
  };
  capacity: {
    maxPatients: number;
    currentPatients: number;
    staffCount: number;
  };
  accreditation: {
    jawdaStatus: "certified" | "pending" | "expired";
    jawdaExpiryDate: string;
    dohApprovalDate: string;
    complianceScore: number;
  };
}

export interface DOHStaffCredentials extends DOHComplianceEntity {
  staffId: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    emiratesId: string;
    nationality: string;
    dateOfBirth: string;
    gender: "male" | "female";
  };
  professionalInfo: {
    position: string;
    department: string;
    specialization: string[];
    yearsOfExperience: number;
    employmentType: "full-time" | "part-time" | "contract";
    startDate: string;
  };
  licensing: {
    dohLicenseNumber: string;
    licenseType: string;
    licenseStatus: "active" | "expired" | "suspended";
    issueDate: string;
    expiryDate: string;
    renewalHistory: {
      date: string;
      previousExpiryDate: string;
      newExpiryDate: string;
    }[];
  };
  qualifications: {
    degree: string;
    institution: string;
    graduationYear: number;
    certifications: {
      name: string;
      issuingBody: string;
      issueDate: string;
      expiryDate?: string;
      certificateNumber: string;
    }[];
  };
  continuingEducation: {
    requiredHours: number;
    completedHours: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    courses: {
      courseName: string;
      provider: string;
      completionDate: string;
      hours: number;
      certificateNumber: string;
    }[];
  };
  performanceMetrics: {
    lastEvaluationDate: string;
    overallRating: number;
    competencyScores: {
      [competency: string]: number;
    };
    trainingNeeds: string[];
  };
}

export interface DOHPatientRecord extends DOHComplianceEntity {
  patientId: string;
  demographics: {
    firstName: string;
    lastName: string;
    emiratesId: string;
    dateOfBirth: string;
    gender: "male" | "female";
    nationality: string;
    maritalStatus: string;
    occupation: string;
  };
  contactInfo: {
    phone: string;
    email: string;
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
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    membershipNumber: string;
    expiryDate: string;
    coverageType: string;
    approvalStatus: "approved" | "pending" | "rejected";
  };
  medicalHistory: {
    chronicConditions: string[];
    allergies: string[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      startDate: string;
      endDate?: string;
    }[];
    previousHospitalizations: {
      facility: string;
      admissionDate: string;
      dischargeDate: string;
      diagnosis: string;
    }[];
  };
  careEpisodes: string[]; // References to DOHCareEpisode IDs
  consentForms: {
    treatmentConsent: boolean;
    dataProcessingConsent: boolean;
    researchParticipationConsent: boolean;
    consentDate: string;
    witnessSignature?: string;
  };
}

export interface DOHCareEpisode extends DOHComplianceEntity {
  episodeId: string;
  patientId: string;
  episodeType:
    | "acute"
    | "chronic"
    | "rehabilitation"
    | "palliative"
    | "preventive";
  startDate: string;
  endDate?: string;
  referralSource: {
    type: "hospital" | "clinic" | "physician" | "self" | "family";
    referringFacility?: string;
    referringPhysician?: string;
    referralDate: string;
    referralReason: string;
  };
  clinicalAssessment: {
    primaryDiagnosis: {
      icdCode: string;
      description: string;
      severity: "mild" | "moderate" | "severe";
    };
    secondaryDiagnoses: {
      icdCode: string;
      description: string;
    }[];
    functionalStatus: {
      adlScore: number;
      iadlScore: number;
      mobilityLevel: string;
      cognitiveStatus: string;
    };
    riskAssessment: {
      fallRisk: "low" | "medium" | "high";
      infectionRisk: "low" | "medium" | "high";
      nutritionalRisk: "low" | "medium" | "high";
      medicationRisk: "low" | "medium" | "high";
    };
  };
  careTeam: {
    primaryPhysician: string;
    primaryNurse: string;
    specialists: string[];
    therapists: string[];
    socialWorker?: string;
    careCoordinator: string;
  };
  carePlan: {
    goals: {
      shortTerm: string[];
      longTerm: string[];
    };
    interventions: {
      type: string;
      frequency: string;
      duration: string;
      provider: string;
    }[];
    medications: {
      name: string;
      dosage: string;
      route: string;
      frequency: string;
      prescribedBy: string;
    }[];
    equipmentNeeds: string[];
  };
  serviceAuthorization: {
    authorizationNumber: string;
    approvedServices: string[];
    approvedFrequency: {
      [service: string]: string;
    };
    authorizationPeriod: {
      startDate: string;
      endDate: string;
    };
    insuranceApproval: boolean;
    dohApproval: boolean;
  };
  qualityMetrics: {
    patientSatisfactionScore?: number;
    clinicalOutcomes: {
      [metric: string]: number;
    };
    safetyIncidents: number;
    readmissionRate?: number;
  };
}

export interface DOHClinicalDocumentation extends DOHComplianceEntity {
  documentId: string;
  patientId: string;
  episodeId: string;
  documentType:
    | "assessment"
    | "progress_note"
    | "care_plan"
    | "discharge_summary"
    | "incident_report";
  serviceDate: string;
  serviceTime: string;
  serviceLocation: {
    type: "home" | "clinic" | "facility";
    address?: string;
  };
  providerId: string;
  providerName: string;
  providerLicense: string;
  clinicalFindings: {
    vitalSigns: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
    };
    physicalExamination: string;
    mentalStatusExam?: string;
    painAssessment?: {
      scale: string;
      score: number;
      location: string;
      quality: string;
    };
  };
  interventionsProvided: {
    type: string;
    description: string;
    duration: number;
    outcome: string;
    complications?: string;
  }[];
  medicationAdministration: {
    medication: string;
    dosage: string;
    route: string;
    time: string;
    administeredBy: string;
    patientResponse: string;
  }[];
  patientEducation: {
    topics: string[];
    materials: string[];
    comprehensionLevel: "good" | "fair" | "poor";
    followUpNeeded: boolean;
  };
  nextVisitPlan: {
    scheduledDate?: string;
    frequency: string;
    focusAreas: string[];
    specialInstructions: string;
  };
  electronicSignature: {
    providerId: string;
    timestamp: string;
    ipAddress: string;
    deviceInfo: string;
  };
  witnessSignature?: {
    witnessId: string;
    witnessName: string;
    timestamp: string;
  };
}

export interface DOHQualityMetrics extends DOHComplianceEntity {
  metricId: string;
  metricType: "clinical" | "operational" | "financial" | "patient_satisfaction";
  measurementPeriod: {
    startDate: string;
    endDate: string;
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  };
  kpiDefinition: {
    name: string;
    description: string;
    numerator: string;
    denominator: string;
    targetValue: number;
    benchmarkValue?: number;
  };
  dataPoints: {
    date: string;
    value: number;
    numeratorCount: number;
    denominatorCount: number;
    notes?: string;
  }[];
  performanceAnalysis: {
    currentValue: number;
    targetAchieved: boolean;
    trend: "improving" | "stable" | "declining";
    varianceFromTarget: number;
    varianceFromBenchmark?: number;
  };
  improvementActions: {
    actionId: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    expectedImpact: string;
  }[];
}

export interface DOHIncidentReport extends DOHComplianceEntity {
  incidentId: string;
  reportingDate: string;
  incidentDate: string;
  incidentTime: string;
  reportedBy: {
    staffId: string;
    name: string;
    position: string;
    contactInfo: string;
  };
  incidentLocation: {
    type: "patient_home" | "facility" | "transport" | "other";
    specificLocation: string;
    address?: string;
  };
  personsInvolved: {
    patients: {
      patientId: string;
      name: string;
      injuryLevel: "none" | "minor" | "moderate" | "severe" | "fatal";
    }[];
    staff: {
      staffId: string;
      name: string;
      role: string;
      injuryLevel: "none" | "minor" | "moderate" | "severe";
    }[];
    visitors: {
      name: string;
      relationship: string;
      injuryLevel: "none" | "minor" | "moderate" | "severe";
    }[];
  };
  incidentClassification: {
    category:
      | "medication_error"
      | "fall"
      | "infection"
      | "equipment_failure"
      | "documentation_error"
      | "other";
    subcategory: string;
    severity: "low" | "moderate" | "high" | "catastrophic";
    preventability:
      | "preventable"
      | "potentially_preventable"
      | "not_preventable";
  };
  incidentDescription: {
    whatHappened: string;
    contributingFactors: string[];
    immediateActions: string;
    witnessAccounts: string[];
  };
  investigation: {
    investigatorId: string;
    investigationDate: string;
    rootCauseAnalysis: {
      primaryCause: string;
      contributingCauses: string[];
      systemFactors: string[];
      humanFactors: string[];
    };
    evidenceCollected: {
      type: string;
      description: string;
      collectedBy: string;
      collectionDate: string;
    }[];
  };
  correctiveActions: {
    actionId: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    completionDate?: string;
    status: "planned" | "in_progress" | "completed" | "overdue";
    effectiveness:
      | "effective"
      | "partially_effective"
      | "ineffective"
      | "pending_evaluation";
  }[];
  regulatoryReporting: {
    dohReportRequired: boolean;
    dohReportDate?: string;
    dohReportNumber?: string;
    otherAgenciesNotified: string[];
    familyNotified: boolean;
    familyNotificationDate?: string;
  };
  followUp: {
    reviewDate: string;
    reviewedBy: string;
    lessonsLearned: string[];
    policyChanges: string[];
    trainingNeeds: string[];
  };
}

export interface DOHAuditTrail extends DOHComplianceEntity {
  auditId: string;
  entityType: string;
  entityId: string;
  action: "create" | "read" | "update" | "delete" | "export" | "print";
  userId: string;
  userRole: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: {
    userAgent: string;
    deviceType: "desktop" | "tablet" | "mobile";
    operatingSystem: string;
    browser: string;
  };
  sessionInfo: {
    sessionId: string;
    loginTime: string;
    lastActivity: string;
  };
  dataChanges: {
    fieldName: string;
    oldValue: any;
    newValue: any;
    changeReason?: string;
  }[];
  accessContext: {
    accessReason: string;
    patientConsent: boolean;
    supervisorApproval?: boolean;
    emergencyAccess: boolean;
  };
  complianceFlags: {
    hipaaCompliant: boolean;
    dohCompliant: boolean;
    dataRetentionCompliant: boolean;
    accessControlCompliant: boolean;
  };
}

export interface DOHComplianceAssessment extends DOHComplianceEntity {
  assessmentId: string;
  assessmentType: "internal" | "external" | "regulatory" | "accreditation";
  assessmentDate: string;
  assessor: {
    name: string;
    organization: string;
    credentials: string;
    contactInfo: string;
  };
  scope: {
    departments: string[];
    processes: string[];
    timeframe: {
      startDate: string;
      endDate: string;
    };
  };
  standards: {
    standardId: string;
    standardName: string;
    version: string;
    requirements: {
      requirementId: string;
      description: string;
      category: string;
      priority: "critical" | "high" | "medium" | "low";
      complianceStatus:
        | "compliant"
        | "partially_compliant"
        | "non_compliant"
        | "not_applicable";
      evidence: {
        type: string;
        description: string;
        documentId?: string;
        verificationMethod: string;
      }[];
      findings: string[];
      recommendations: string[];
      score: number;
    }[];
  }[];
  overallResults: {
    totalRequirements: number;
    compliantRequirements: number;
    partiallyCompliantRequirements: number;
    nonCompliantRequirements: number;
    overallScore: number;
    complianceLevel:
      | "excellent"
      | "good"
      | "acceptable"
      | "needs_improvement"
      | "critical";
  };
  actionPlan: {
    actionId: string;
    priority: "critical" | "high" | "medium" | "low";
    description: string;
    assignedTo: string;
    dueDate: string;
    resources: string[];
    successCriteria: string[];
    status: "planned" | "in_progress" | "completed" | "overdue";
  }[];
  followUpSchedule: {
    nextAssessmentDate: string;
    interimReviewDates: string[];
    reportingRequirements: string[];
  };
}

// ===== SPECIALIZED COMPLIANCE ENTITIES =====

export interface DOHTawteenCompliance extends DOHComplianceEntity {
  reportingPeriod: {
    year: number;
    quarter: number;
    month?: number;
  };
  emiratizationData: {
    totalPositions: number;
    emiratiPositions: number;
    emiratizationRate: number;
    targetRate: number;
    variance: number;
  };
  trainingMetrics: {
    totalTrainingHours: number;
    emiratiTrainingHours: number;
    nonEmiratiTrainingHours: number;
    complianceRate: number;
  };
  careerDevelopment: {
    promotions: {
      emiratiPromotions: number;
      totalPromotions: number;
    };
    mentorshipPrograms: {
      emiratiMentees: number;
      emiratiMentors: number;
    };
  };
  reportingStatus: "compliant" | "non_compliant" | "pending";
  submissionDate?: string;
  approvalStatus: "approved" | "rejected" | "pending_review";
}

export interface DOHJAWDACompliance extends DOHComplianceEntity {
  certificationLevel: "bronze" | "silver" | "gold" | "platinum";
  certificationDate: string;
  expiryDate: string;
  assessmentAreas: {
    patientSafety: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
    clinicalEffectiveness: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
    patientExperience: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
    leadership: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
    workforce: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
    resourceManagement: {
      score: number;
      maxScore: number;
      findings: string[];
      improvements: string[];
    };
  };
  overallScore: number;
  improvementPlan: {
    actionItems: {
      area: string;
      description: string;
      timeline: string;
      responsible: string;
      status: string;
    }[];
    nextReviewDate: string;
  };
}

// ===== INTEGRATION AND WORKFLOW ENTITIES =====

export interface DOHDataIntegration extends DOHComplianceEntity {
  integrationId: string;
  sourceSystem: string;
  targetSystem: string;
  integrationType: "real_time" | "batch" | "on_demand";
  dataMapping: {
    sourceField: string;
    targetField: string;
    transformation?: string;
    validationRules: string[];
  }[];
  syncStatus: {
    lastSyncDate: string;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    errorLog: {
      timestamp: string;
      errorType: string;
      errorMessage: string;
      recordId?: string;
    }[];
  };
  complianceValidation: {
    validationRules: string[];
    validationResults: {
      ruleId: string;
      passed: boolean;
      details: string;
    }[];
  };
}

export interface DOHWorkflowAutomation extends DOHComplianceEntity {
  workflowId: string;
  workflowName: string;
  workflowType:
    | "compliance_monitoring"
    | "incident_response"
    | "quality_assurance"
    | "reporting";
  triggers: {
    type: "schedule" | "event" | "manual";
    configuration: any;
  }[];
  steps: {
    stepId: string;
    stepName: string;
    stepType:
      | "validation"
      | "notification"
      | "calculation"
      | "integration"
      | "approval";
    configuration: any;
    dependencies: string[];
  }[];
  executionHistory: {
    executionId: string;
    startTime: string;
    endTime?: string;
    status: "running" | "completed" | "failed" | "cancelled";
    results: {
      stepId: string;
      status: "completed" | "failed" | "skipped";
      output: any;
      errorMessage?: string;
    }[];
  }[];
}

// ===== VALIDATION AND UTILITY TYPES =====

export interface DOHValidationRule {
  ruleId: string;
  ruleName: string;
  ruleType: "required" | "format" | "range" | "custom";
  entityType: string;
  fieldPath: string;
  validationLogic: string;
  errorMessage: string;
  severity: "error" | "warning" | "info";
  isActive: boolean;
}

export interface DOHComplianceReport {
  reportId: string;
  reportType: string;
  generatedDate: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  parameters: {
    [key: string]: any;
  };
  data: any;
  format: "pdf" | "excel" | "csv" | "json";
  fileSize: number;
  downloadUrl?: string;
  expiryDate: string;
}

export interface DOHSystemConfiguration {
  configId: string;
  configCategory: string;
  configKey: string;
  configValue: any;
  dataType: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  isEncrypted: boolean;
  lastModified: string;
  modifiedBy: string;
}

// ===== DAMAN INSURANCE INTEGRATION TYPES =====

export interface DamanServiceCode {
  code: string;
  description: string;
  category:
    | "nursing"
    | "physiotherapy"
    | "medical-equipment"
    | "wound-care"
    | "specialized";
  pricing: {
    amount: number;
    currency: "AED";
    billingUnit: "visit" | "hour" | "day" | "session";
  };
  authorizationRequired: boolean;
  deprecated: boolean;
  replacementCode?: string;
  effectiveDate: string;
  expiryDate?: string;
}

export interface DamanMSCPlanExtension {
  extensionId: string;
  patientId: string;
  originalPlanId: string;
  requestedDuration: number; // in days, max 90
  clinicalJustification: string; // min 100 characters
  submissionDate: string;
  deadline: "2025-05-14"; // Fixed deadline
  gracePeriodStart: "2025-04-14"; // 30 days before deadline
  paymentTerms: "30_days"; // As per CN_2025
  status: "pending" | "approved" | "rejected" | "expired";
  approvalCode?: string;
  rejectionReason?: string;
}

export interface DamanSubmissionTimeline {
  submissionId: string;
  dailyDeadline: "08:00"; // UAE timezone
  submissionTime: string;
  timezone: "Asia/Dubai";
  delayStatus:
    | "on-time"
    | "standard-delay"
    | "urgent-escalation"
    | "critical-escalation";
  escalationLevel: 0 | 1 | 2 | 3;
  gracePeriodActive: boolean;
  complianceScore: number; // 0-100
}

export interface DamanDocumentManagement {
  documentId: string;
  documentType:
    | "wheelchair-preapproval"
    | "pt-form-deprecated"
    | "face-to-face-assessment"
    | "homecare-allocation";
  mandatoryFrom?: string; // ISO date
  deprecatedFrom?: string; // ISO date
  validityPeriod?: number; // in days
  openJetRequired: boolean;
  automationEnabled: boolean;
  complianceStatus: "compliant" | "non-compliant" | "transitional";
}

export interface DamanCommunicationChannel {
  channelId: string;
  channelType: "email" | "openjet" | "msc-designated" | "abm-enrollment";
  requirements: {
    uaeEmailDomain: boolean; // .ae domain required
    openJetIntegration: boolean;
    effectiveDate?: string;
  };
  validationRules: {
    domainValidation: RegExp;
    integrationCheck: boolean;
    complianceLevel: "mandatory" | "recommended" | "optional";
  };
}

export interface DamanComplianceValidation {
  validationId: string;
  timestamp: string;
  overallScore: number; // 0-100
  categories: {
    serviceCodeCompliance: {
      score: number;
      validCodes: string[];
      deprecatedCodes: string[];
      pricingAccuracy: boolean;
    };
    mscPlanExtension: {
      score: number;
      deadlineCompliance: boolean;
      durationCompliance: boolean;
      justificationAdequate: boolean;
    };
    submissionTimeline: {
      score: number;
      onTimeSubmission: boolean;
      escalationRequired: boolean;
      gracePeriodStatus: string;
    };
    documentManagement: {
      score: number;
      wheelchairFormCompliance: boolean;
      homecareAllocationReady: boolean;
      openJetIntegration: boolean;
    };
    communicationChannels: {
      score: number;
      uaeEmailCompliance: boolean;
      openJetReady: boolean;
      channelValidation: boolean;
    };
  };
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  nextReviewDate: string;
}

// ===== ENHANCED EXPORT AND INTEGRATION TYPES =====

export interface DOHExportRequest {
  requestId: string;
  requestedBy: string;
  requestDate: string;
  dataType:
    | "patient-records"
    | "clinical-documentation"
    | "audit-trails"
    | "quality-metrics";
  format: "pdf" | "excel" | "csv" | "json" | "xml";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    patientIds?: string[];
    facilityIds?: string[];
    documentTypes?: string[];
    complianceLevel?: string[];
  };
  includeAttachments: boolean;
  encryptionRequired: boolean;
  dohCompliant: boolean;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  expiryDate?: string;
  fileSize?: number;
  checksum?: string;
}

export interface DOHDocumentIntegration {
  documentId: string;
  documentType:
    | "clinical-form"
    | "assessment"
    | "care-plan"
    | "incident-report";
  patientId: string;
  episodeId?: string;
  facilityId: string;
  createdDate: string;
  createdBy: string;
  documentContent: {
    formData: any;
    metadata: {
      version: string;
      templateId: string;
      complianceVersion: string;
    };
    validationResults: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
  attachments?: {
    attachmentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: string;
    checksum: string;
    encryptionStatus: "encrypted" | "not-encrypted";
  }[];
  electronicSignature: {
    signerId: string;
    signerName: string;
    signerRole: string;
    timestamp: string;
    ipAddress: string;
    deviceInfo: string;
    signatureMethod: "digital" | "biometric" | "pin";
    certificateId?: string;
  };
  integrationStatus: "pending" | "processing" | "integrated" | "failed";
  dohCompliant: boolean;
  auditTrail: {
    action: string;
    timestamp: string;
    userId: string;
    details: any;
  }[];
}

export interface DOHMobileAppConfiguration {
  configId: string;
  appVersion: string;
  minimumSupportedVersion: string;
  features: {
    offlineMode: boolean;
    voiceRecognition: boolean;
    cameraIntegration: boolean;
    biometricAuth: boolean;
    pushNotifications: boolean;
    backgroundSync: boolean;
  };
  security: {
    encryptionLevel: "AES-128" | "AES-256";
    certificatePinning: boolean;
    jailbreakDetection: boolean;
    screenRecordingPrevention: boolean;
    sessionTimeout: number; // in minutes
  };
  syncConfiguration: {
    syncInterval: number; // in minutes
    maxOfflineStorage: number; // in MB
    priorityDataTypes: string[];
    conflictResolution: "server-wins" | "client-wins" | "manual";
  };
  complianceSettings: {
    dohCompliant: boolean;
    auditLogging: boolean;
    dataRetentionPeriod: number; // in days
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
  };
  lastUpdated: string;
  updatedBy: string;
}

export interface DOHMobileDataSync {
  syncId: string;
  deviceId: string;
  userId: string;
  syncTimestamp: string;
  lastSyncTimestamp: string;
  syncType: "full" | "incremental" | "priority";
  offlineData: {
    dataType: string;
    recordId: string;
    data: any;
    timestamp: string;
    priority: "high" | "medium" | "low";
    syncStatus: "pending" | "synced" | "conflict" | "failed";
  }[];
  syncResults: {
    totalRecords: number;
    syncedRecords: number;
    failedRecords: number;
    conflictRecords: number;
    errors: {
      recordId: string;
      errorType: string;
      errorMessage: string;
    }[];
  };
  dohCompliant: boolean;
  encryptionStatus: "encrypted" | "not-encrypted";
  compressionUsed: boolean;
  networkType: "wifi" | "cellular" | "offline";
  syncDuration: number; // in milliseconds
}

// ===== ENHANCED CLINICAL DECISION SUPPORT TYPES =====

export interface DOHClinicalDecisionSupport {
  supportId: string;
  patientId: string;
  episodeId?: string;
  assessmentType: string;
  decisionContext: {
    clinicalFindings: any;
    patientHistory: any;
    currentMedications: any;
    riskFactors: string[];
  };
  recommendations: {
    recommendationId: string;
    type: "medication" | "intervention" | "monitoring" | "referral";
    priority: "critical" | "high" | "medium" | "low";
    description: string;
    rationale: string;
    evidenceLevel: "A" | "B" | "C" | "D";
    contraindications?: string[];
    monitoring?: string[];
  }[];
  drugInteractions: {
    interactionId: string;
    drugs: string[];
    severity: "major" | "moderate" | "minor";
    description: string;
    clinicalEffect: string;
    recommendation: string;
    references: string[];
  }[];
  alerts: {
    alertId: string;
    type: "critical" | "warning" | "info";
    message: string;
    actionRequired: boolean;
    dismissible: boolean;
    expiryDate?: string;
  }[];
  guidelines: {
    guidelineId: string;
    title: string;
    organization: string;
    version: string;
    applicableConditions: string[];
    recommendations: string[];
    lastUpdated: string;
  }[];
  generatedDate: string;
  generatedBy: string;
  validUntil: string;
  dohCompliant: boolean;
}

// ===== ENHANCED EMERGENCY RESPONSE TYPES =====

export interface DOHEmergencyProtocol {
  protocolId: string;
  protocolName: string;
  triggerConditions: string[];
  careLevel: "simple" | "routine" | "advanced" | "specialized";
  responseTimeTarget: string; // e.g., "5 minutes"
  escalationLevels: {
    level: number;
    description: string;
    timeframe: string;
    responsibleRole: string;
    actions: string[];
  }[];
  emergencyContacts: {
    contactType: "primary" | "secondary" | "specialist" | "emergency-services";
    name: string;
    role: string;
    phone: string;
    email?: string;
    availability: "24/7" | "business-hours" | "on-call";
  }[];
  criticalAlerts: {
    alertType: string;
    message: string;
    notificationMethods: ("sms" | "email" | "push" | "call")[];
    recipients: string[];
  }[];
  equipmentRequired: string[];
  medicationProtocols: {
    medication: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    contraindications: string[];
  }[];
  documentationRequirements: string[];
  followUpProcedures: string[];
  lastReviewed: string;
  reviewedBy: string;
  nextReviewDate: string;
  dohApproved: boolean;
  effectiveDate: string;
}

// ===== ENHANCED OUTCOME TRACKING TYPES =====

export interface DOHOutcomeTracking {
  trackingId: string;
  patientId: string;
  episodeId?: string;
  careLevel: string;
  trackingPeriod: {
    startDate: string;
    endDate: string;
  };
  outcomeMetrics: {
    metricId: string;
    metricName: string;
    category: "clinical" | "functional" | "quality-of-life" | "satisfaction";
    target: number;
    current: number;
    unit: string;
    trend: "improving" | "stable" | "declining";
    lastMeasured: string;
    measurementFrequency: string;
  }[];
  patientReportedOutcomes: {
    outcomeId: string;
    instrument: string; // e.g., "SF-36", "EQ-5D"
    score: number;
    maxScore: number;
    domains: {
      domainName: string;
      score: number;
      interpretation: string;
    }[];
    assessmentDate: string;
  }[];
  functionalStatusTracking: {
    adlScore: number;
    iadlScore: number;
    mobilityLevel: string;
    cognitiveStatus: string;
    assessmentDate: string;
    assessedBy: string;
  }[];
  qualityOfLifeMeasures: {
    measureId: string;
    measureName: string;
    score: number;
    interpretation: string;
    assessmentDate: string;
  }[];
  benchmarkingData: {
    benchmarkType: "national" | "regional" | "facility";
    comparisonMetric: string;
    patientValue: number;
    benchmarkValue: number;
    percentile: number;
    interpretation: string;
  }[];
  predictiveAnalytics: {
    predictionType: "readmission" | "deterioration" | "recovery";
    riskScore: number;
    confidence: number;
    timeframe: string;
    contributingFactors: string[];
    recommendations: string[];
  }[];
  interventionEffectiveness: {
    interventionId: string;
    interventionType: string;
    startDate: string;
    endDate?: string;
    outcomeChange: {
      metric: string;
      beforeValue: number;
      afterValue: number;
      changePercentage: number;
      significance: "significant" | "not-significant";
    }[];
  }[];
  lastUpdated: string;
  updatedBy: string;
  dohCompliant: boolean;
}

// ===== DATABASE SCHEMA VALIDATION TYPES =====

export interface SchemaValidationResult {
  isValid: boolean;
  missingEntities: string[];
  missingFields: {
    entity: string;
    fields: string[];
  }[];
  invalidRelationships: {
    from: string;
    to: string;
    issue: string;
  }[];
  recommendations: string[];
}

export interface DatabaseSchemaMetadata {
  version: string;
  lastUpdated: string;
  entities: {
    name: string;
    fields: {
      name: string;
      type: string;
      required: boolean;
      indexed: boolean;
    }[];
    relationships: {
      type: "one-to-one" | "one-to-many" | "many-to-many";
      relatedEntity: string;
      foreignKey: string;
    }[];
  }[];
  indexes: {
    entityName: string;
    indexName: string;
    fields: string[];
    unique: boolean;
  }[];
  constraints: {
    entityName: string;
    constraintType: string;
    definition: string;
  }[];
}
