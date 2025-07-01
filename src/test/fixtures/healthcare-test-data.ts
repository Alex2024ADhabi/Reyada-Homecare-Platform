/**
 * Healthcare Test Data Fixtures
 * Comprehensive test data for healthcare platform testing
 * Provides realistic mock data for all healthcare scenarios and compliance testing
 */
/**
 * Healthcare Test Data Fixtures
 * Comprehensive test data for healthcare platform testing
 * Provides realistic mock data for all healthcare scenarios and compliance testing
 */

// Define types for healthcare test data
export interface PatientTestData {
  id: string;
  emiratesId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    postalCode: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
}

export interface ClinicalTestData {
  assessmentId: string;
  patientId: string;
  assessmentType: string;
  clinicianId: string;
  date: string;
  vitalSigns: {
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  assessmentData: {
    mobility: number;
    cognition: number;
    pain: number;
    nutrition: number;
    skinIntegrity: number;
    medication: number;
    safety: number;
    psychosocial: number;
    communication: number;
  };
  planOfCare: {
    goals: string[];
    interventions: string[];
    frequency: string;
    duration: string;
  };
}

export interface ComplianceTestData {
  standard: "DOH" | "DAMAN" | "JAWDA" | "HIPAA";
  requirement: string;
  testCase: string;
  expectedResult: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  category: string;
}

// Mock data generator class
export class MockDataGenerator {
  static generatePatientData(
    overrides: Partial<PatientTestData> = {},
  ): PatientTestData {
    return {
      id: `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      emiratesId: `784-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 10)}`,
      name: "Test Patient",
      dateOfBirth: "1990-01-01",
      gender: "male",
      phoneNumber: "+971-050-1234567",
      email: "test@example.com",
      address: {
        street: "Test Street",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
      },
      insurance: {
        provider: "DAMAN",
        policyNumber: "POL-TEST-001",
        expiryDate: "2025-12-31",
      },
      medicalHistory: {
        conditions: [],
        allergies: [],
        medications: [],
      },
      ...overrides,
    };
  }

  static generateClinicalData(
    patientId?: string,
    overrides: Partial<ClinicalTestData> = {},
  ): ClinicalTestData {
    return {
      assessmentId: `ASS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      patientId: patientId || "PAT-TEST-001",
      assessmentType: "initial",
      clinicianId: "CLI-TEST-001",
      date: new Date().toISOString(),
      vitalSigns: {
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 72,
        temperature: 36.5,
        respiratoryRate: 16,
        oxygenSaturation: 98,
      },
      assessmentData: {
        mobility: 4,
        cognition: 5,
        pain: 1,
        nutrition: 4,
        skinIntegrity: 5,
        medication: 4,
        safety: 5,
        psychosocial: 4,
        communication: 5,
      },
      planOfCare: {
        goals: ["Maintain current health status"],
        interventions: ["Regular monitoring"],
        frequency: "Weekly",
        duration: "4 weeks",
      },
      ...overrides,
    };
  }

  static generateComplianceTestData(
    standard?: "DOH" | "DAMAN" | "JAWDA" | "HIPAA",
  ): ComplianceTestData {
    const standards = ["DOH", "DAMAN", "JAWDA", "HIPAA"] as const;
    const selectedStandard =
      standard || standards[Math.floor(Math.random() * standards.length)];

    return {
      standard: selectedStandard,
      requirement: "Test requirement",
      testCase: "Test case description",
      expectedResult: "Expected test result",
      riskLevel: "medium",
      category: "testing",
    };
  }
}

// Healthcare Test Data Collections
export class HealthcareTestDataFixtures {
  // Patient Test Data
  static readonly SAMPLE_PATIENTS: PatientTestData[] = [
    {
      id: "PAT-001",
      emiratesId: "784-1985-1234567-1",
      name: "Ahmed Al Mansouri",
      dateOfBirth: "1985-03-15",
      gender: "male",
      phoneNumber: "+971-050-1234567",
      email: "ahmed.almansouri@email.com",
      address: {
        street: "123 Sheikh Zayed Road",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
      },
      insurance: {
        provider: "DAMAN",
        policyNumber: "POL-DAMAN-001",
        expiryDate: "2025-12-31",
      },
      medicalHistory: {
        conditions: ["Diabetes Type 2", "Hypertension"],
        allergies: ["Penicillin"],
        medications: ["Metformin", "Lisinopril"],
      },
    },
    {
      id: "PAT-002",
      emiratesId: "784-1990-2345678-2",
      name: "Fatima Al Zaabi",
      dateOfBirth: "1990-07-22",
      gender: "female",
      phoneNumber: "+971-052-2345678",
      email: "fatima.alzaabi@email.com",
      address: {
        street: "456 Corniche Street",
        city: "Abu Dhabi",
        emirate: "Abu Dhabi",
        postalCode: "23456",
      },
      insurance: {
        provider: "THIQA",
        policyNumber: "POL-THIQA-002",
        expiryDate: "2025-06-30",
      },
      medicalHistory: {
        conditions: ["Asthma"],
        allergies: ["Shellfish", "Nuts"],
        medications: ["Albuterol"],
      },
    },
    {
      id: "PAT-003",
      emiratesId: "784-1975-3456789-3",
      name: "Mohammed Al Shamsi",
      dateOfBirth: "1975-11-08",
      gender: "male",
      phoneNumber: "+971-054-3456789",
      email: "mohammed.alshamsi@email.com",
      address: {
        street: "789 Al Wasl Road",
        city: "Sharjah",
        emirate: "Sharjah",
        postalCode: "34567",
      },
      insurance: {
        provider: "ADNIC",
        policyNumber: "POL-ADNIC-003",
        expiryDate: "2025-09-15",
      },
      medicalHistory: {
        conditions: ["Heart Disease", "Arthritis"],
        allergies: ["Latex"],
        medications: ["Atorvastatin", "Aspirin"],
      },
    },
  ];

  // Clinical Assessment Test Data
  static readonly SAMPLE_CLINICAL_ASSESSMENTS: ClinicalTestData[] = [
    {
      assessmentId: "ASS-001",
      patientId: "PAT-001",
      assessmentType: "initial",
      clinicianId: "CLI-001",
      date: "2024-01-15T10:00:00Z",
      vitalSigns: {
        bloodPressure: { systolic: 140, diastolic: 90 },
        heartRate: 78,
        temperature: 36.8,
        respiratoryRate: 16,
        oxygenSaturation: 98,
      },
      assessmentData: {
        mobility: 3,
        cognition: 4,
        pain: 2,
        nutrition: 3,
        skinIntegrity: 4,
        medication: 3,
        safety: 4,
        psychosocial: 3,
        communication: 4,
      },
      planOfCare: {
        goals: [
          "Improve blood pressure control",
          "Maintain current mobility level",
          "Monitor blood glucose levels",
        ],
        interventions: [
          "Medication management",
          "Blood pressure monitoring",
          "Dietary counseling",
        ],
        frequency: "Weekly",
        duration: "8 weeks",
      },
    },
    {
      assessmentId: "ASS-002",
      patientId: "PAT-002",
      assessmentType: "followup",
      clinicianId: "CLI-002",
      date: "2024-01-16T14:30:00Z",
      vitalSigns: {
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 72,
        temperature: 36.5,
        respiratoryRate: 18,
        oxygenSaturation: 99,
      },
      assessmentData: {
        mobility: 4,
        cognition: 5,
        pain: 1,
        nutrition: 4,
        skinIntegrity: 5,
        medication: 4,
        safety: 5,
        psychosocial: 4,
        communication: 5,
      },
      planOfCare: {
        goals: [
          "Maintain asthma control",
          "Continue current exercise routine",
          "Monitor peak flow readings",
        ],
        interventions: [
          "Inhaler technique review",
          "Peak flow monitoring",
          "Allergy avoidance education",
        ],
        frequency: "Monthly",
        duration: "6 months",
      },
    },
  ];

  // Compliance Test Data
  static readonly COMPLIANCE_TEST_SCENARIOS: ComplianceTestData[] = [
    {
      standard: "DOH",
      requirement: "Patient assessment within 24 hours",
      testCase:
        "Verify initial assessment completed within 24 hours of admission",
      expectedResult:
        "Assessment timestamp within 24 hours of admission timestamp",
      riskLevel: "critical",
      category: "documentation",
    },
    {
      standard: "DOH",
      requirement: "9-domain assessment completion",
      testCase: "Verify all 9 DOH domains are assessed and documented",
      expectedResult:
        "All domains (mobility, cognition, pain, nutrition, skin integrity, medication, safety, psychosocial, communication) have valid scores",
      riskLevel: "critical",
      category: "quality",
    },
    {
      standard: "DAMAN",
      requirement: "Prior authorization compliance",
      testCase: "Verify prior authorization obtained before service delivery",
      expectedResult:
        "Valid prior authorization number present before service start date",
      riskLevel: "high",
      category: "documentation",
    },
    {
      standard: "DAMAN",
      requirement: "Claims submission within timeframe",
      testCase: "Verify claims submitted within required timeframe",
      expectedResult: "Claim submission date within 30 days of service date",
      riskLevel: "medium",
      category: "documentation",
    },
    {
      standard: "JAWDA",
      requirement: "Quality indicators reporting",
      testCase: "Verify quality indicators are tracked and reported",
      expectedResult: "Quality metrics captured and available for reporting",
      riskLevel: "medium",
      category: "quality",
    },
    {
      standard: "JAWDA",
      requirement: "Patient safety measures",
      testCase: "Verify patient safety protocols are implemented",
      expectedResult: "Safety assessments completed and documented",
      riskLevel: "high",
      category: "safety",
    },
    {
      standard: "HIPAA",
      requirement: "Data encryption at rest",
      testCase: "Verify patient data is encrypted when stored",
      expectedResult: "All patient data fields encrypted using AES-256",
      riskLevel: "critical",
      category: "security",
    },
    {
      standard: "HIPAA",
      requirement: "Access controls and audit logging",
      testCase: "Verify access to patient data is controlled and logged",
      expectedResult:
        "User access logged with timestamp, user ID, and data accessed",
      riskLevel: "critical",
      category: "security",
    },
  ];

  // Test Scenarios for Different Use Cases
  static readonly TEST_SCENARIOS = {
    // Patient Registration Scenarios
    PATIENT_REGISTRATION: {
      valid: {
        name: "Valid Patient Registration",
        data: HealthcareTestDataFixtures.SAMPLE_PATIENTS[0],
        expectedResult: "success",
      },
      invalidEmiratesId: {
        name: "Invalid Emirates ID Format",
        data: {
          ...HealthcareTestDataFixtures.SAMPLE_PATIENTS[0],
          emiratesId: "invalid-id",
        },
        expectedResult: "validation_error",
        expectedError: "Invalid Emirates ID format",
      },
      duplicatePatient: {
        name: "Duplicate Patient Registration",
        data: HealthcareTestDataFixtures.SAMPLE_PATIENTS[0],
        expectedResult: "conflict_error",
        expectedError: "Patient already exists",
      },
    },

    // Clinical Assessment Scenarios
    CLINICAL_ASSESSMENT: {
      completeAssessment: {
        name: "Complete DOH 9-Domain Assessment",
        data: HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0],
        expectedResult: "success",
      },
      incompleteAssessment: {
        name: "Incomplete Assessment - Missing Domains",
        data: {
          ...HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0],
          assessmentData: {
            mobility: 3,
            cognition: 4,
            // Missing other domains
          },
        },
        expectedResult: "validation_error",
        expectedError: "Missing required assessment domains",
      },
      invalidVitalSigns: {
        name: "Invalid Vital Signs",
        data: {
          ...HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0],
          vitalSigns: {
            bloodPressure: { systolic: 300, diastolic: 200 }, // Invalid values
            heartRate: 300,
            temperature: 50,
            respiratoryRate: 100,
            oxygenSaturation: 150,
          },
        },
        expectedResult: "validation_error",
        expectedError: "Invalid vital signs values",
      },
    },

    // Insurance and Billing Scenarios
    INSURANCE_VERIFICATION: {
      validInsurance: {
        name: "Valid Insurance Verification",
        data: {
          patientId: "PAT-001",
          insuranceProvider: "DAMAN",
          policyNumber: "POL-DAMAN-001",
          serviceDate: "2024-01-15",
        },
        expectedResult: "verified",
      },
      expiredInsurance: {
        name: "Expired Insurance Policy",
        data: {
          patientId: "PAT-001",
          insuranceProvider: "DAMAN",
          policyNumber: "POL-DAMAN-001",
          serviceDate: "2026-01-15", // After expiry
        },
        expectedResult: "expired",
        expectedError: "Insurance policy expired",
      },
      invalidProvider: {
        name: "Invalid Insurance Provider",
        data: {
          patientId: "PAT-001",
          insuranceProvider: "INVALID_PROVIDER",
          policyNumber: "POL-INVALID-001",
          serviceDate: "2024-01-15",
        },
        expectedResult: "invalid_provider",
        expectedError: "Insurance provider not recognized",
      },
    },

    // Compliance Testing Scenarios
    DOH_COMPLIANCE: {
      compliantAssessment: {
        name: "DOH Compliant Assessment",
        data: HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0],
        complianceChecks: [
          "assessment_within_24_hours",
          "nine_domains_complete",
          "clinician_signature",
          "care_plan_documented",
        ],
        expectedResult: "compliant",
      },
      nonCompliantTiming: {
        name: "Assessment Beyond 24 Hours",
        data: {
          ...HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0],
          date: "2024-01-17T10:00:00Z", // 48 hours after admission
        },
        admissionDate: "2024-01-15T10:00:00Z",
        expectedResult: "non_compliant",
        expectedError: "Assessment not completed within 24 hours",
      },
    },

    // Security and Privacy Scenarios
    DATA_SECURITY: {
      encryptedData: {
        name: "Patient Data Encryption",
        data: {
          patientId: "PAT-001",
          sensitiveData: {
            medicalRecord: "encrypted_medical_record_data",
            personalInfo: "encrypted_personal_info",
          },
        },
        expectedResult: "encrypted",
      },
      unauthorizedAccess: {
        name: "Unauthorized Data Access Attempt",
        data: {
          userId: "USER-UNAUTHORIZED",
          patientId: "PAT-001",
          requestedData: "medical_records",
        },
        expectedResult: "access_denied",
        expectedError: "Insufficient permissions",
      },
      auditLogging: {
        name: "Data Access Audit Logging",
        data: {
          userId: "USER-AUTHORIZED",
          patientId: "PAT-001",
          accessType: "read",
          timestamp: "2024-01-15T10:00:00Z",
        },
        expectedResult: "logged",
      },
    },
  };

  // Performance Test Data
  static readonly PERFORMANCE_TEST_DATA = {
    LOAD_TEST_PATIENTS: Array.from({ length: 1000 }, (_, index) =>
      MockDataGenerator.generatePatientData({
        id: `LOAD-PAT-${String(index + 1).padStart(4, "0")}`,
        name: `Load Test Patient ${index + 1}`,
      }),
    ),

    STRESS_TEST_ASSESSMENTS: Array.from({ length: 5000 }, (_, index) =>
      MockDataGenerator.generateClinicalData(
        `LOAD-PAT-${String((index % 1000) + 1).padStart(4, "0")}`,
        {
          assessmentId: `STRESS-ASS-${String(index + 1).padStart(5, "0")}`,
        },
      ),
    ),
  };

  // Error Scenarios for Negative Testing
  static readonly ERROR_SCENARIOS = {
    NETWORK_ERRORS: {
      timeout: {
        name: "Network Timeout",
        simulateError: "timeout",
        expectedBehavior: "retry_mechanism",
      },
      connectionLost: {
        name: "Connection Lost",
        simulateError: "connection_lost",
        expectedBehavior: "graceful_degradation",
      },
    },

    DATABASE_ERRORS: {
      connectionFailure: {
        name: "Database Connection Failure",
        simulateError: "db_connection_failure",
        expectedBehavior: "error_handling",
      },
      dataCorruption: {
        name: "Data Corruption",
        simulateError: "data_corruption",
        expectedBehavior: "data_validation",
      },
    },

    VALIDATION_ERRORS: {
      malformedData: {
        name: "Malformed Input Data",
        data: {
          invalidJson: "{ invalid json }",
          missingFields: {},
          wrongDataTypes: {
            age: "not_a_number",
            date: "invalid_date",
          },
        },
        expectedBehavior: "input_validation",
      },
    },
  };

  // Utility Methods
  static generateRandomPatient(): PatientTestData {
    return MockDataGenerator.generatePatientData();
  }

  static generateRandomClinicalAssessment(
    patientId?: string,
  ): ClinicalTestData {
    return MockDataGenerator.generateClinicalData(patientId);
  }

  static generateComplianceTestData(
    standard?: "DOH" | "DAMAN" | "JAWDA" | "HIPAA",
  ): ComplianceTestData {
    return MockDataGenerator.generateComplianceTestData(standard);
  }

  static getPatientById(id: string): PatientTestData | undefined {
    return this.SAMPLE_PATIENTS.find((patient) => patient.id === id);
  }

  static getAssessmentById(id: string): ClinicalTestData | undefined {
    return this.SAMPLE_CLINICAL_ASSESSMENTS.find(
      (assessment) => assessment.assessmentId === id,
    );
  }

  static getComplianceScenarios(
    standard: "DOH" | "DAMAN" | "JAWDA" | "HIPAA",
  ): ComplianceTestData[] {
    return this.COMPLIANCE_TEST_SCENARIOS.filter(
      (scenario) => scenario.standard === standard,
    );
  }

  static generateBulkTestData(count: number): {
    patients: PatientTestData[];
    assessments: ClinicalTestData[];
    complianceData: ComplianceTestData[];
  } {
    const patients = Array.from({ length: count }, () =>
      this.generateRandomPatient(),
    );
    const assessments = patients.map((patient) =>
      this.generateRandomClinicalAssessment(patient.id),
    );
    const complianceData = Array.from({ length: count }, () =>
      this.generateComplianceTestData(),
    );

    return {
      patients,
      assessments,
      complianceData,
    };
  }

  // Validation Helpers
  static validatePatientData(patient: PatientTestData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Emirates ID validation
    if (!/^784-\d{4}-\d{7}-\d$/.test(patient.emiratesId)) {
      errors.push("Invalid Emirates ID format");
    }

    // Phone number validation
    if (!/^\+971-(050|052|054|055|056|058)-\d{7}$/.test(patient.phoneNumber)) {
      errors.push("Invalid UAE phone number format");
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      errors.push("Invalid email format");
    }

    // Insurance provider validation
    if (
      !["DAMAN", "ADNIC", "THIQA", "OTHER"].includes(patient.insurance.provider)
    ) {
      errors.push("Invalid insurance provider");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateClinicalAssessment(assessment: ClinicalTestData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check all 9 DOH domains are present
    const requiredDomains = [
      "mobility",
      "cognition",
      "pain",
      "nutrition",
      "skinIntegrity",
      "medication",
      "safety",
      "psychosocial",
      "communication",
    ];

    for (const domain of requiredDomains) {
      if (!(domain in assessment.assessmentData)) {
        errors.push(`Missing required domain: ${domain}`);
      } else {
        const value =
          assessment.assessmentData[
            domain as keyof typeof assessment.assessmentData
          ];
        if (typeof value !== "number" || value < 1 || value > 5) {
          errors.push(`Invalid ${domain} score: must be 1-5`);
        }
      }
    }

    // Validate vital signs
    const {
      bloodPressure,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
    } = assessment.vitalSigns;

    if (bloodPressure.systolic < 70 || bloodPressure.systolic > 200) {
      errors.push("Invalid systolic blood pressure");
    }

    if (bloodPressure.diastolic < 40 || bloodPressure.diastolic > 120) {
      errors.push("Invalid diastolic blood pressure");
    }

    if (heartRate < 30 || heartRate > 200) {
      errors.push("Invalid heart rate");
    }

    if (temperature < 32 || temperature > 45) {
      errors.push("Invalid temperature");
    }

    if (respiratoryRate < 8 || respiratoryRate > 40) {
      errors.push("Invalid respiratory rate");
    }

    if (oxygenSaturation < 70 || oxygenSaturation > 100) {
      errors.push("Invalid oxygen saturation");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export default for convenience
export default HealthcareTestDataFixtures;

// CLI execution for testing fixtures
if (require.main === module) {
  console.log("🏥 Healthcare Test Data Fixtures - Demo Mode");

  console.log("\n👥 Sample Patients:");
  console.log(`   Total: ${HealthcareTestDataFixtures.SAMPLE_PATIENTS.length}`);
  HealthcareTestDataFixtures.SAMPLE_PATIENTS.forEach((patient) => {
    console.log(`   - ${patient.name} (${patient.id})`);
  });

  console.log("\n📋 Sample Clinical Assessments:");
  console.log(
    `   Total: ${HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS.length}`,
  );
  HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS.forEach(
    (assessment) => {
      console.log(
        `   - ${assessment.assessmentId} for ${assessment.patientId}`,
      );
    },
  );

  console.log("\n📊 Compliance Test Scenarios:");
  console.log(
    `   Total: ${HealthcareTestDataFixtures.COMPLIANCE_TEST_SCENARIOS.length}`,
  );
  ["DOH", "DAMAN", "JAWDA", "HIPAA"].forEach((standard) => {
    const scenarios = HealthcareTestDataFixtures.getComplianceScenarios(
      standard as any,
    );
    console.log(`   ${standard}: ${scenarios.length} scenarios`);
  });

  console.log("\n🧪 Test Scenarios:");
  Object.keys(HealthcareTestDataFixtures.TEST_SCENARIOS).forEach((category) => {
    const scenarios =
      HealthcareTestDataFixtures.TEST_SCENARIOS[
        category as keyof typeof HealthcareTestDataFixtures.TEST_SCENARIOS
      ];
    console.log(`   ${category}: ${Object.keys(scenarios).length} scenarios`);
  });

  // Generate bulk test data demo
  console.log("\n📈 Bulk Test Data Generation:");
  const bulkData = HealthcareTestDataFixtures.generateBulkTestData(10);
  console.log(`   Generated ${bulkData.patients.length} patients`);
  console.log(`   Generated ${bulkData.assessments.length} assessments`);
  console.log(
    `   Generated ${bulkData.complianceData.length} compliance test cases`,
  );

  // Validation demo
  console.log("\n✅ Validation Demo:");
  const samplePatient = HealthcareTestDataFixtures.SAMPLE_PATIENTS[0];
  const patientValidation =
    HealthcareTestDataFixtures.validatePatientData(samplePatient);
  console.log(
    `   Patient validation: ${patientValidation.valid ? "PASSED" : "FAILED"}`,
  );

  const sampleAssessment =
    HealthcareTestDataFixtures.SAMPLE_CLINICAL_ASSESSMENTS[0];
  const assessmentValidation =
    HealthcareTestDataFixtures.validateClinicalAssessment(sampleAssessment);
  console.log(
    `   Assessment validation: ${assessmentValidation.valid ? "PASSED" : "FAILED"}`,
  );
}
