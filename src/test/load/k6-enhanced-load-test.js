import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

/**
 * Enhanced K6 Load Testing Configuration for Healthcare Platform
 * Comprehensive load testing for healthcare workflows with DOH compliance
 */

// Custom metrics for healthcare-specific monitoring
const errorRate = new Rate("healthcare_errors");
const responseTime = new Trend("healthcare_response_time");
const patientOperations = new Counter("patient_operations");
const clinicalOperations = new Counter("clinical_operations");
const damanOperations = new Counter("daman_operations");
const dohComplianceChecks = new Counter("doh_compliance_checks");
const emiratesIdLookups = new Counter("emirates_id_lookups");

// Enhanced test configuration for healthcare platform
export const options = {
  stages: [
    // Warm-up phase
    { duration: "2m", target: 10 },
    // Ramp-up to normal load
    { duration: "5m", target: 50 },
    // Sustained normal load
    { duration: "10m", target: 50 },
    // Peak load simulation (clinic hours)
    { duration: "5m", target: 100 },
    // Stress test (emergency scenarios)
    { duration: "3m", target: 150 },
    // Cool down
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    // Healthcare-specific performance requirements
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    http_req_failed: ["rate<0.01"], // Error rate under 1%
    healthcare_errors: ["rate<0.005"], // Healthcare errors under 0.5%
    healthcare_response_time: ["p(99)<5000"], // 99% under 5s
    patient_operations: ["count>1000"], // Minimum patient operations
    clinical_operations: ["count>500"], // Minimum clinical operations
    daman_operations: ["count>200"], // Minimum DAMAN operations
    doh_compliance_checks: ["count>100"], // DOH compliance validations
    emirates_id_lookups: ["count>300"], // Emirates ID validations
  },
};

// Enhanced test data for healthcare scenarios
const testData = {
  patients: [
    {
      id: "patient-001",
      emiratesId: "784-1990-1234567-8",
      name: "Ahmed Al Mansouri",
    },
    {
      id: "patient-002",
      emiratesId: "784-1985-2345678-9",
      name: "Fatima Al Zahra",
    },
    {
      id: "patient-003",
      emiratesId: "784-1992-3456789-0",
      name: "Mohammed Al Rashid",
    },
    {
      id: "patient-004",
      emiratesId: "784-1988-4567890-1",
      name: "Aisha Al Maktoum",
    },
    {
      id: "patient-005",
      emiratesId: "784-1995-5678901-2",
      name: "Omar Al Nahyan",
    },
  ],
  clinicians: [
    { id: "clinician-001", license: "DOH-12345", specialty: "nursing" },
    { id: "clinician-002", license: "DOH-23456", specialty: "physiotherapy" },
    {
      id: "clinician-003",
      license: "DOH-34567",
      specialty: "occupational-therapy",
    },
  ],
  serviceTypes: [
    "nursing-care",
    "physiotherapy",
    "occupational-therapy",
    "wound-care",
    "medication-management",
    "chronic-disease-management",
    "post-surgical-care",
    "palliative-care",
  ],
  insuranceProviders: ["DAMAN", "ADNIC", "AXA", "MetLife", "Oman Insurance"],
};

// Authentication helper with enhanced error handling
function authenticate() {
  const loginResponse = http.post(`${__ENV.BASE_URL}/api/auth/login`, {
    email: "loadtest@reyada.com",
    password: "LoadTest2024!",
    deviceInfo: {
      type: "web",
      userAgent: "K6LoadTest/1.0",
      ipAddress: "192.168.1.100",
    },
  });

  const authSuccess = check(loginResponse, {
    "authentication successful": (r) => r.status === 200,
    "token received": (r) => r.json("token") !== undefined,
    "user permissions valid": (r) => {
      const data = r.json();
      return data.permissions && data.permissions.length > 0;
    },
  });

  if (!authSuccess) {
    console.error("Authentication failed:", loginResponse.body);
    return null;
  }

  return loginResponse.json("token");
}

// Enhanced healthcare workflow scenarios
export default function () {
  const token = authenticate();
  if (!token) {
    console.error("Skipping test due to authentication failure");
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Request-ID": `k6-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  // Randomly select test scenario with weighted distribution
  const scenario = Math.random();

  if (scenario < 0.25) {
    patientManagementWorkflow(headers);
  } else if (scenario < 0.45) {
    clinicalDocumentationWorkflow(headers);
  } else if (scenario < 0.65) {
    damanAuthorizationWorkflow(headers);
  } else if (scenario < 0.8) {
    dashboardAnalyticsWorkflow(headers);
  } else {
    dohComplianceWorkflow(headers);
  }

  sleep(1 + Math.random() * 2); // Variable sleep between 1-3 seconds
}

// Enhanced Patient Management Workflow
function patientManagementWorkflow(headers) {
  const patient =
    testData.patients[Math.floor(Math.random() * testData.patients.length)];

  // Emirates ID lookup and validation
  const emiratesIdResponse = http.get(
    `${__ENV.BASE_URL}/api/patients/emirates-id/${patient.emiratesId}`,
    { headers },
  );

  const emiratesIdSuccess = check(emiratesIdResponse, {
    "Emirates ID lookup successful": (r) => r.status === 200,
    "Emirates ID validation time acceptable": (r) => r.timings.duration < 1500,
    "Patient data integrity verified": (r) => {
      const data = r.json();
      return data.emiratesId && data.name && data.dateOfBirth;
    },
  });

  emiratesIdLookups.add(1);
  patientOperations.add(1);
  responseTime.add(emiratesIdResponse.timings.duration);
  errorRate.add(!emiratesIdSuccess);

  // Advanced patient search with filters
  const searchResponse = http.post(
    `${__ENV.BASE_URL}/api/patients/search`,
    JSON.stringify({
      query: patient.name.split(" ")[0],
      filters: {
        ageRange: { min: 18, max: 80 },
        gender: Math.random() > 0.5 ? "male" : "female",
        insuranceProvider:
          testData.insuranceProviders[
            Math.floor(Math.random() * testData.insuranceProviders.length)
          ],
        activeStatus: true,
      },
      pagination: { page: 1, limit: 20 },
      sortBy: "lastVisit",
      sortOrder: "desc",
    }),
    { headers },
  );

  const searchSuccess = check(searchResponse, {
    "patient search successful": (r) => r.status === 200,
    "search response time acceptable": (r) => r.timings.duration < 2000,
    "search results paginated": (r) => {
      const data = r.json();
      return data.results && data.pagination && data.totalCount !== undefined;
    },
  });

  patientOperations.add(1);
  responseTime.add(searchResponse.timings.duration);
  errorRate.add(!searchSuccess);

  // Get comprehensive patient details
  const detailsResponse = http.get(
    `${__ENV.BASE_URL}/api/patients/${patient.id}?include=medical-history,insurance,episodes,assessments`,
    { headers },
  );

  const detailsSuccess = check(detailsResponse, {
    "patient details retrieved": (r) => r.status === 200,
    "patient data complete": (r) => {
      const data = r.json();
      return (
        data.emiratesId && data.name && data.contact && data.medicalHistory
      );
    },
    "HIPAA compliance verified": (r) => {
      const data = r.json();
      return data.privacyConsent && data.dataProcessingConsent;
    },
  });

  patientOperations.add(1);
  responseTime.add(detailsResponse.timings.duration);
  errorRate.add(!detailsSuccess);

  // Update patient information (occasionally)
  if (Math.random() < 0.15) {
    const updateResponse = http.put(
      `${__ENV.BASE_URL}/api/patients/${patient.id}`,
      JSON.stringify({
        contact: {
          phone: `+971${Math.floor(Math.random() * 1000000000)}`,
          email: `updated${Date.now()}@example.com`,
          emergencyContact: {
            name: "Emergency Contact",
            phone: `+971${Math.floor(Math.random() * 1000000000)}`,
            relationship: "spouse",
          },
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: "loadtest-user",
      }),
      { headers },
    );

    const updateSuccess = check(updateResponse, {
      "patient update successful": (r) => r.status === 200,
      "audit trail created": (r) => {
        const data = r.json();
        return data.auditTrail && data.auditTrail.length > 0;
      },
    });

    patientOperations.add(1);
    responseTime.add(updateResponse.timings.duration);
    errorRate.add(!updateSuccess);
  }
}

// Enhanced Clinical Documentation Workflow
function clinicalDocumentationWorkflow(headers) {
  const patient =
    testData.patients[Math.floor(Math.random() * testData.patients.length)];
  const clinician =
    testData.clinicians[Math.floor(Math.random() * testData.clinicians.length)];

  // Create comprehensive clinical assessment
  const assessmentData = {
    patientId: patient.id,
    clinicianId: clinician.id,
    assessmentType: "comprehensive-assessment",
    assessmentDate: new Date().toISOString(),
    visitType: "home-visit",
    domains: {
      domain1: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Cognitive function assessment",
        riskLevel: "low",
      },
      domain2: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Physical mobility evaluation",
        riskLevel: "medium",
      },
      domain3: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Activities of daily living",
        riskLevel: "low",
      },
      domain4: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Medication management",
        riskLevel: "high",
      },
      domain5: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Social support system",
        riskLevel: "medium",
      },
      domain6: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Environmental safety",
        riskLevel: "low",
      },
      domain7: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Nutritional status",
        riskLevel: "medium",
      },
      domain8: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Pain management",
        riskLevel: "high",
      },
      domain9: {
        score: Math.floor(Math.random() * 5) + 1,
        notes: "Psychological wellbeing",
        riskLevel: "low",
      },
    },
    clinicalNotes:
      "Comprehensive clinical assessment completed during load test. Patient shows good progress in rehabilitation.",
    vitalSigns: {
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      temperature: 36.5,
      oxygenSaturation: 98,
      respiratoryRate: 16,
    },
    medications: [
      { name: "Medication A", dosage: "10mg", frequency: "twice daily" },
      { name: "Medication B", dosage: "5mg", frequency: "once daily" },
    ],
    careplan: {
      goals: ["Improve mobility", "Pain management", "Medication compliance"],
      interventions: [
        "Physical therapy",
        "Pain medication",
        "Patient education",
      ],
      timeline: "4 weeks",
    },
  };

  const assessmentResponse = http.post(
    `${__ENV.BASE_URL}/api/clinical/assessments`,
    JSON.stringify(assessmentData),
    { headers },
  );

  const assessmentSuccess = check(assessmentResponse, {
    "clinical assessment created": (r) => r.status === 201,
    "assessment response time acceptable": (r) => r.timings.duration < 3000,
    "DOH compliance validated": (r) => {
      const data = r.json();
      return data.dohCompliant === true && data.complianceScore >= 0.95;
    },
    "clinical data integrity verified": (r) => {
      const data = r.json();
      return (
        data.assessmentId &&
        data.domains &&
        Object.keys(data.domains).length === 9
      );
    },
  });

  clinicalOperations.add(1);
  dohComplianceChecks.add(1);
  responseTime.add(assessmentResponse.timings.duration);
  errorRate.add(!assessmentSuccess);

  // Retrieve and validate assessments
  const retrieveResponse = http.get(
    `${__ENV.BASE_URL}/api/clinical/assessments?patientId=${patient.id}&includeHistory=true`,
    { headers },
  );

  const retrieveSuccess = check(retrieveResponse, {
    "assessments retrieved": (r) => r.status === 200,
    "assessment data valid": (r) => {
      const data = r.json();
      return Array.isArray(data.results) && data.results.length >= 0;
    },
    "historical data included": (r) => {
      const data = r.json();
      return data.history && Array.isArray(data.history);
    },
  });

  clinicalOperations.add(1);
  responseTime.add(retrieveResponse.timings.duration);
  errorRate.add(!retrieveSuccess);

  // Generate clinical report
  if (Math.random() < 0.2) {
    const reportResponse = http.post(
      `${__ENV.BASE_URL}/api/clinical/reports/generate`,
      JSON.stringify({
        patientId: patient.id,
        reportType: "progress-report",
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
        includeAssessments: true,
        includeMedications: true,
        includeVitalSigns: true,
      }),
      { headers },
    );

    const reportSuccess = check(reportResponse, {
      "clinical report generated": (r) => r.status === 200,
      "report generation time acceptable": (r) => r.timings.duration < 5000,
    });

    clinicalOperations.add(1);
    responseTime.add(reportResponse.timings.duration);
    errorRate.add(!reportSuccess);
  }
}

// Enhanced DAMAN Authorization Workflow
function damanAuthorizationWorkflow(headers) {
  const patient =
    testData.patients[Math.floor(Math.random() * testData.patients.length)];
  const serviceType =
    testData.serviceTypes[
      Math.floor(Math.random() * testData.serviceTypes.length)
    ];

  // Check existing authorizations with detailed filters
  const checkResponse = http.get(
    `${__ENV.BASE_URL}/api/revenue/daman/authorizations?patientId=${patient.id}&status=active&serviceType=${serviceType}`,
    { headers },
  );

  const checkSuccess = check(checkResponse, {
    "authorization check successful": (r) => r.status === 200,
    "authorization data complete": (r) => {
      const data = r.json();
      return data.authorizations && Array.isArray(data.authorizations);
    },
  });

  damanOperations.add(1);
  responseTime.add(checkResponse.timings.duration);
  errorRate.add(!checkSuccess);

  // Submit new authorization (occasionally)
  if (Math.random() < 0.3) {
    const authorizationData = {
      patientId: patient.id,
      serviceType: serviceType,
      requestedDuration: "30-days",
      clinicalJustification:
        "Load test authorization request for comprehensive healthcare platform testing and validation",
      urgencyLevel: Math.random() > 0.8 ? "urgent" : "routine",
      requestedServices: [
        {
          serviceCode: "NURSE-001",
          description: "Skilled Nursing Visit",
          frequency: "daily",
          duration: "30-days",
          unitPrice: 300,
          quantity: 30,
        },
        {
          serviceCode: "PHYSIO-001",
          description: "Physiotherapy Session",
          frequency: "twice-weekly",
          duration: "30-days",
          unitPrice: 250,
          quantity: 8,
        },
      ],
      clinicalDocuments: [
        {
          type: "medical-report",
          description: "Initial assessment report",
          uploadDate: new Date().toISOString(),
        },
      ],
      estimatedCost: 11400,
      requestingClinician: {
        id: "clinician-001",
        license: "DOH-12345",
        specialty: "nursing",
      },
    };

    const submitResponse = http.post(
      `${__ENV.BASE_URL}/api/revenue/daman/authorizations`,
      JSON.stringify(authorizationData),
      { headers },
    );

    const submitSuccess = check(submitResponse, {
      "authorization submitted": (r) => r.status === 201,
      "authorization response time acceptable": (r) =>
        r.timings.duration < 5000,
      "reference number provided": (r) => {
        const data = r.json();
        return data.referenceNumber && data.authorizationId;
      },
      "cost estimation accurate": (r) => {
        const data = r.json();
        return data.estimatedCost && data.estimatedCost > 0;
      },
    });

    damanOperations.add(1);
    responseTime.add(submitResponse.timings.duration);
    errorRate.add(!submitSuccess);
  }

  // Check authorization status
  if (Math.random() < 0.4) {
    const statusResponse = http.get(
      `${__ENV.BASE_URL}/api/revenue/daman/authorizations/status?patientId=${patient.id}`,
      { headers },
    );

    const statusSuccess = check(statusResponse, {
      "authorization status retrieved": (r) => r.status === 200,
      "status data valid": (r) => {
        const data = r.json();
        return data.authorizations && data.authorizations.length >= 0;
      },
    });

    damanOperations.add(1);
    responseTime.add(statusResponse.timings.duration);
    errorRate.add(!statusSuccess);
  }
}

// Enhanced Dashboard Analytics Workflow
function dashboardAnalyticsWorkflow(headers) {
  // Load comprehensive dashboard summary
  const summaryResponse = http.get(
    `${__ENV.BASE_URL}/api/dashboard/summary?period=30d&includeMetrics=true`,
    { headers },
  );

  const summarySuccess = check(summaryResponse, {
    "dashboard summary loaded": (r) => r.status === 200,
    "summary data complete": (r) => {
      const data = r.json();
      return (
        data.totalPatients !== undefined &&
        data.activeAssessments !== undefined &&
        data.metrics
      );
    },
    "performance metrics included": (r) => {
      const data = r.json();
      return data.metrics.responseTime && data.metrics.errorRate !== undefined;
    },
  });

  responseTime.add(summaryResponse.timings.duration);
  errorRate.add(!summarySuccess);

  // Load detailed analytics data
  const analyticsResponse = http.get(
    `${__ENV.BASE_URL}/api/analytics/performance?period=30d&breakdown=daily&includeComparisons=true`,
    { headers },
  );

  const analyticsSuccess = check(analyticsResponse, {
    "analytics data loaded": (r) => r.status === 200,
    "analytics response time acceptable": (r) => r.timings.duration < 4000,
    "trend data included": (r) => {
      const data = r.json();
      return data.trends && data.comparisons;
    },
  });

  responseTime.add(analyticsResponse.timings.duration);
  errorRate.add(!analyticsSuccess);

  // Load compliance reports
  const complianceResponse = http.get(
    `${__ENV.BASE_URL}/api/compliance/doh/reports?month=2024-01&includeDetails=true`,
    { headers },
  );

  const complianceSuccess = check(complianceResponse, {
    "compliance reports loaded": (r) => r.status === 200,
    "DOH compliance data valid": (r) => {
      const data = r.json();
      return (
        data.complianceScore !== undefined && data.violations !== undefined
      );
    },
    "detailed compliance metrics": (r) => {
      const data = r.json();
      return data.domainScores && Object.keys(data.domainScores).length === 9;
    },
  });

  dohComplianceChecks.add(1);
  responseTime.add(complianceResponse.timings.duration);
  errorRate.add(!complianceSuccess);

  // Load financial analytics
  const financialResponse = http.get(
    `${__ENV.BASE_URL}/api/analytics/financial?period=30d&includeProjections=true`,
    { headers },
  );

  const financialSuccess = check(financialResponse, {
    "financial analytics loaded": (r) => r.status === 200,
    "revenue data complete": (r) => {
      const data = r.json();
      return data.totalRevenue !== undefined && data.projections;
    },
  });

  responseTime.add(financialResponse.timings.duration);
  errorRate.add(!financialSuccess);
}

// DOH Compliance Workflow
function dohComplianceWorkflow(headers) {
  // Run comprehensive DOH compliance check
  const complianceCheckResponse = http.post(
    `${__ENV.BASE_URL}/api/compliance/doh/validate`,
    JSON.stringify({
      scope: "comprehensive",
      includeHistorical: true,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    }),
    { headers },
  );

  const complianceSuccess = check(complianceCheckResponse, {
    "DOH compliance check completed": (r) => r.status === 200,
    "compliance score acceptable": (r) => {
      const data = r.json();
      return data.overallScore >= 0.95;
    },
    "all domains validated": (r) => {
      const data = r.json();
      return data.domainScores && Object.keys(data.domainScores).length === 9;
    },
  });

  dohComplianceChecks.add(1);
  responseTime.add(complianceCheckResponse.timings.duration);
  errorRate.add(!complianceSuccess);

  // Generate compliance report
  const reportResponse = http.post(
    `${__ENV.BASE_URL}/api/compliance/doh/reports/generate`,
    JSON.stringify({
      reportType: "monthly",
      month: "2024-01",
      includeRecommendations: true,
      format: "json",
    }),
    { headers },
  );

  const reportSuccess = check(reportResponse, {
    "compliance report generated": (r) => r.status === 200,
    "report generation time acceptable": (r) => r.timings.duration < 10000,
    "recommendations included": (r) => {
      const data = r.json();
      return data.recommendations && Array.isArray(data.recommendations);
    },
  });

  dohComplianceChecks.add(1);
  responseTime.add(reportResponse.timings.duration);
  errorRate.add(!reportSuccess);
}

// Enhanced teardown function for comprehensive reporting
export function teardown(data) {
  console.log("\n=== Healthcare Platform Load Test Results ===");
  console.log(`Patient operations: ${patientOperations.count}`);
  console.log(`Clinical operations: ${clinicalOperations.count}`);
  console.log(`DAMAN operations: ${damanOperations.count}`);
  console.log(`DOH compliance checks: ${dohComplianceChecks.count}`);
  console.log(`Emirates ID lookups: ${emiratesIdLookups.count}`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
  console.log(
    `95th percentile response time: ${responseTime.p95.toFixed(2)}ms`,
  );
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log("===============================================\n");

  // Performance thresholds validation
  const performanceReport = {
    patientOperationsTarget: patientOperations.count >= 1000,
    clinicalOperationsTarget: clinicalOperations.count >= 500,
    damanOperationsTarget: damanOperations.count >= 200,
    dohComplianceTarget: dohComplianceChecks.count >= 100,
    responseTimeTarget: responseTime.p95 < 5000,
    errorRateTarget: errorRate.rate < 0.01,
  };

  console.log("Performance Targets Achievement:");
  Object.entries(performanceReport).forEach(([key, achieved]) => {
    console.log(`${key}: ${achieved ? "✅ PASSED" : "❌ FAILED"}`);
  });

  const overallSuccess = Object.values(performanceReport).every(Boolean);
  console.log(
    `\nOverall Test Result: ${overallSuccess ? "✅ SUCCESS" : "❌ FAILURE"}`,
  );
}
