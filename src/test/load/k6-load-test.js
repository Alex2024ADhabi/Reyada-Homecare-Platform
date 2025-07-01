/**
 * K6 Load Testing Script for Healthcare Platform
 * Comprehensive load testing with healthcare-specific scenarios
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// Custom metrics for healthcare platform
const healthcareErrorRate = new Rate("healthcare_errors");
const patientApiResponseTime = new Trend("patient_api_response_time");
const clinicalApiResponseTime = new Trend("clinical_api_response_time");
const damanApiResponseTime = new Trend("daman_api_response_time");
const complianceValidationTime = new Trend("compliance_validation_time");
const authenticationFailures = new Counter("authentication_failures");
const dataValidationErrors = new Counter("data_validation_errors");

// Test configuration
export const options = {
  stages: [
    // Ramp-up phase
    { duration: "2m", target: 10 }, // Ramp up to 10 users over 2 minutes
    { duration: "5m", target: 10 }, // Stay at 10 users for 5 minutes
    { duration: "2m", target: 25 }, // Ramp up to 25 users over 2 minutes
    { duration: "5m", target: 25 }, // Stay at 25 users for 5 minutes
    { duration: "2m", target: 50 }, // Ramp up to 50 users over 2 minutes
    { duration: "10m", target: 50 }, // Stay at 50 users for 10 minutes (peak load)
    { duration: "5m", target: 25 }, // Ramp down to 25 users over 5 minutes
    { duration: "2m", target: 0 }, // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    // General performance thresholds
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.01"], // Error rate should be less than 1%

    // Healthcare-specific thresholds
    healthcare_errors: ["rate<0.005"], // Healthcare error rate should be less than 0.5%
    patient_api_response_time: ["p(95)<1500"], // Patient API should respond within 1.5s
    clinical_api_response_time: ["p(95)<2000"], // Clinical API should respond within 2s
    daman_api_response_time: ["p(95)<3000"], // DAMAN API can be slower (external dependency)
    compliance_validation_time: ["p(95)<1000"], // Compliance validation should be fast
    authentication_failures: ["count<10"], // Max 10 auth failures during test
    data_validation_errors: ["count<5"], // Max 5 data validation errors
  },
  ext: {
    loadimpact: {
      projectID: 3595341,
      name: "Healthcare Platform Load Test",
    },
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const API_BASE = `${BASE_URL}/api`;

// Test data generators
function generateEmiratesId() {
  const year = Math.floor(Math.random() * 30) + 1990;
  const serialNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const checkDigit = Math.floor(Math.random() * 9) + 1;
  return `784-${year}-${serialNumber}-${checkDigit}`;
}

function generateUAEPhone() {
  const operators = ["50", "52", "54", "55", "56", "58"];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+971${operator}${number}`;
}

function generatePatientData() {
  const firstNames = [
    "Ahmed",
    "Fatima",
    "Mohammed",
    "Aisha",
    "Omar",
    "Mariam",
    "Hassan",
    "Noura",
  ];
  const lastNames = [
    "Al Mansouri",
    "Al Zahra",
    "Al Rashid",
    "Al Hashimi",
    "Al Maktoum",
    "Al Nahyan",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    emiratesId: generateEmiratesId(),
    name: {
      first: firstName,
      middle: "Test",
      last: lastName,
    },
    dateOfBirth: `${Math.floor(Math.random() * 30) + 1990}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    gender: Math.random() > 0.5 ? "male" : "female",
    nationality: "UAE",
    contact: {
      phone: generateUAEPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(" ", "")}@test.com`,
      address: {
        street: "123 Test Street",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
      },
    },
    insurance: {
      provider: "Daman",
      policyNumber: `DAM${Math.floor(Math.random() * 900000000) + 100000000}`,
      expiryDate: "2024-12-31",
      membershipType: "Essential",
    },
  };
}

function generateAssessmentData(patientId) {
  const domains = {};
  let totalScore = 0;

  for (let i = 1; i <= 9; i++) {
    const score = Math.floor(Math.random() * 4) + 1;
    domains[`domain${i}`] = {
      score: score,
      notes: `Assessment notes for domain ${i} - load test data`,
    };
    totalScore += score;
  }

  return {
    patientId: patientId,
    assessmentType: "initial",
    assessmentDate: new Date().toISOString(),
    domains: domains,
    overallScore: totalScore,
    riskLevel: totalScore < 18 ? "high" : totalScore < 27 ? "moderate" : "low",
    clinicalNotes:
      "Comprehensive clinical assessment completed during load testing",
    recommendations: ["Recommendation 1", "Recommendation 2"],
  };
}

function generateDamanAuthorizationData(patientId) {
  const serviceTypes = [
    "nursing-care",
    "physiotherapy",
    "occupational-therapy",
    "wound-care",
  ];
  const durations = ["30-days", "60-days", "90-days"];

  return {
    patientId: patientId,
    serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
    requestedDuration: durations[Math.floor(Math.random() * durations.length)],
    estimatedCost: Math.floor(Math.random() * 20000) + 5000,
    clinicalJustification:
      "Load testing authorization request with comprehensive clinical justification for home healthcare services. Patient requires skilled nursing care and monitoring.",
    requestedServices: [
      {
        serviceCode: "17-25-1",
        description: "Skilled Nursing Visit",
        frequency: "daily",
        unitPrice: 300.0,
      },
    ],
    digitalSignatures: true,
  };
}

// Authentication helper
function authenticate() {
  const loginData = {
    email: "test@reyada.com",
    password: "testpassword123",
  };

  const response = http.post(
    `${API_BASE}/auth/login`,
    JSON.stringify(loginData),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const authSuccess = check(response, {
    "authentication successful": (r) => r.status === 200,
    "received auth token": (r) => r.json("token") !== undefined,
  });

  if (!authSuccess) {
    authenticationFailures.add(1);
    return null;
  }

  return response.json("token");
}

// Main test function
export default function () {
  // Authenticate user
  const authToken = authenticate();
  if (!authToken) {
    console.error("Authentication failed, skipping user session");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  // Simulate realistic user workflow
  const workflows = [
    patientManagementWorkflow,
    clinicalAssessmentWorkflow,
    damanAuthorizationWorkflow,
    claimsProcessingWorkflow,
    dashboardAnalyticsWorkflow,
  ];

  // Select random workflow (weighted towards patient management)
  const workflowWeights = [0.4, 0.25, 0.15, 0.1, 0.1];
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedWorkflow = 0;

  for (let i = 0; i < workflowWeights.length; i++) {
    cumulativeWeight += workflowWeights[i];
    if (random <= cumulativeWeight) {
      selectedWorkflow = i;
      break;
    }
  }

  // Execute selected workflow
  workflows[selectedWorkflow](headers);

  // Simulate user think time
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Patient Management Workflow
function patientManagementWorkflow(headers) {
  group("Patient Management Workflow", () => {
    // List patients
    group("List Patients", () => {
      const response = http.get(`${API_BASE}/patients`, { headers });

      const success = check(response, {
        "patients list loaded": (r) => r.status === 200,
        "response time acceptable": (r) => r.timings.duration < 2000,
        "has patient data": (r) => Array.isArray(r.json()),
      });

      patientApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });

    sleep(1);

    // Search patients
    group("Search Patients", () => {
      const searchQuery = "Ahmed";
      const response = http.get(
        `${API_BASE}/patients/search?q=${searchQuery}`,
        { headers },
      );

      const success = check(response, {
        "patient search successful": (r) => r.status === 200,
        "search results returned": (r) => Array.isArray(r.json()),
      });

      patientApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });

    sleep(1);

    // Create new patient (20% of the time)
    if (Math.random() < 0.2) {
      group("Create Patient", () => {
        const patientData = generatePatientData();
        const response = http.post(
          `${API_BASE}/patients`,
          JSON.stringify(patientData),
          { headers },
        );

        const success = check(response, {
          "patient created successfully": (r) => r.status === 201,
          "patient ID returned": (r) => r.json("id") !== undefined,
          "emirates ID validated": (r) => {
            const patient = r.json();
            return patient && patient.emiratesId === patientData.emiratesId;
          },
        });

        patientApiResponseTime.add(response.timings.duration);

        if (!success) {
          healthcareErrorRate.add(1);
          if (response.status === 400) {
            dataValidationErrors.add(1);
          }
        }
      });
    }
  });
}

// Clinical Assessment Workflow
function clinicalAssessmentWorkflow(headers) {
  group("Clinical Assessment Workflow", () => {
    // Get patient for assessment
    let patientId = "patient-001"; // Default test patient

    group("Get Patient for Assessment", () => {
      const response = http.get(`${API_BASE}/patients`, { headers });

      if (response.status === 200) {
        const patients = response.json();
        if (patients && patients.length > 0) {
          patientId = patients[0].id;
        }
      }

      patientApiResponseTime.add(response.timings.duration);
    });

    sleep(1);

    // Create clinical assessment
    group("Create DOH Assessment", () => {
      const assessmentData = generateAssessmentData(patientId);
      const response = http.post(
        `${API_BASE}/clinical/assessments`,
        JSON.stringify(assessmentData),
        { headers },
      );

      const success = check(response, {
        "assessment created successfully": (r) => r.status === 201,
        "DOH compliance validated": (r) => {
          const assessment = r.json();
          return (
            assessment && Object.keys(assessment.domains || {}).length === 9
          );
        },
        "risk level calculated": (r) => {
          const assessment = r.json();
          return (
            assessment &&
            ["low", "moderate", "high"].includes(assessment.riskLevel)
          );
        },
      });

      clinicalApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
        if (response.status === 400) {
          dataValidationErrors.add(1);
        }
      }
    });

    sleep(1);

    // Validate DOH compliance
    group("Validate DOH Compliance", () => {
      const response = http.get(
        `${API_BASE}/compliance/doh/validate/${patientId}`,
        { headers },
      );

      const success = check(response, {
        "DOH compliance check completed": (r) => r.status === 200,
        "compliance score calculated": (r) => {
          const compliance = r.json();
          return compliance && typeof compliance.overallScore === "number";
        },
      });

      complianceValidationTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });
  });
}

// DAMAN Authorization Workflow
function damanAuthorizationWorkflow(headers) {
  group("DAMAN Authorization Workflow", () => {
    let patientId = "patient-001";

    // Get patient
    group("Get Patient for Authorization", () => {
      const response = http.get(`${API_BASE}/patients`, { headers });

      if (response.status === 200) {
        const patients = response.json();
        if (patients && patients.length > 0) {
          patientId = patients[0].id;
        }
      }
    });

    sleep(1);

    // Create DAMAN authorization
    group("Create DAMAN Authorization", () => {
      const authorizationData = generateDamanAuthorizationData(patientId);
      const response = http.post(
        `${API_BASE}/revenue/daman/authorizations`,
        JSON.stringify(authorizationData),
        { headers },
      );

      const success = check(response, {
        "authorization created successfully": (r) => r.status === 201,
        "reference number generated": (r) => {
          const auth = r.json();
          return (
            auth &&
            auth.referenceNumber &&
            auth.referenceNumber.startsWith("DAM-")
          );
        },
        "clinical justification validated": (r) => {
          const auth = r.json();
          return (
            auth &&
            auth.clinicalJustification &&
            auth.clinicalJustification.length >= 50
          );
        },
      });

      damanApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
        if (response.status === 400) {
          dataValidationErrors.add(1);
        }
      }
    });

    sleep(1);

    // Check authorization status
    group("Check Authorization Status", () => {
      const response = http.get(
        `${API_BASE}/revenue/daman/authorizations/status`,
        { headers },
      );

      const success = check(response, {
        "authorization status retrieved": (r) => r.status === 200,
        "status data valid": (r) => Array.isArray(r.json()),
      });

      damanApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });
  });
}

// Claims Processing Workflow
function claimsProcessingWorkflow(headers) {
  group("Claims Processing Workflow", () => {
    // List claims
    group("List Claims", () => {
      const response = http.get(`${API_BASE}/revenue/claims`, { headers });

      const success = check(response, {
        "claims list loaded": (r) => r.status === 200,
        "claims data valid": (r) => Array.isArray(r.json()),
      });

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });

    sleep(1);

    // Get claims by status
    group("Filter Claims by Status", () => {
      const statuses = ["submitted", "approved", "rejected", "pending"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const response = http.get(`${API_BASE}/revenue/claims?status=${status}`, {
        headers,
      });

      const success = check(response, {
        "filtered claims retrieved": (r) => r.status === 200,
        "filter applied correctly": (r) => {
          const claims = r.json();
          return (
            Array.isArray(claims) &&
            (claims.length === 0 ||
              claims.every((claim) => claim.status === status))
          );
        },
      });

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });
  });
}

// Dashboard Analytics Workflow
function dashboardAnalyticsWorkflow(headers) {
  group("Dashboard Analytics Workflow", () => {
    // Get dashboard metrics
    group("Load Dashboard Metrics", () => {
      const response = http.get(`${API_BASE}/analytics/dashboard`, { headers });

      const success = check(response, {
        "dashboard metrics loaded": (r) => r.status === 200,
        "metrics data complete": (r) => {
          const metrics = r.json();
          return (
            metrics &&
            typeof metrics.totalPatients === "number" &&
            typeof metrics.activeAssessments === "number" &&
            typeof metrics.pendingAuthorizations === "number"
          );
        },
      });

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });

    sleep(1);

    // Get DOH compliance metrics
    group("Load DOH Compliance Metrics", () => {
      const response = http.get(`${API_BASE}/compliance/doh/metrics`, {
        headers,
      });

      const success = check(response, {
        "DOH metrics loaded": (r) => r.status === 200,
        "compliance score available": (r) => {
          const metrics = r.json();
          return metrics && typeof metrics.overallScore === "number";
        },
      });

      complianceValidationTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });

    sleep(1);

    // Get DAMAN integration status
    group("Load DAMAN Integration Status", () => {
      const response = http.get(
        `${API_BASE}/revenue/daman/integration-status`,
        { headers },
      );

      const success = check(response, {
        "DAMAN status loaded": (r) => r.status === 200,
        "integration status valid": (r) => {
          const status = r.json();
          return status && typeof status.isConnected === "boolean";
        },
      });

      damanApiResponseTime.add(response.timings.duration);

      if (!success) {
        healthcareErrorRate.add(1);
      }
    });
  });
}

// Custom summary report
export function handleSummary(data) {
  return {
    "test-results/load-test-results.json": JSON.stringify(data, null, 2),
    "test-results/load-test-report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

// Teardown function
export function teardown(data) {
  console.log("\n=== Healthcare Platform Load Test Summary ===");
  console.log(`Total requests: ${data.metrics.http_reqs.values.count}`);
  console.log(
    `Failed requests: ${data.metrics.http_req_failed.values.rate * 100}%`,
  );
  console.log(
    `Average response time: ${data.metrics.http_req_duration.values.avg}ms`,
  );
  console.log(
    `95th percentile response time: ${data.metrics.http_req_duration.values["p(95)"]}ms`,
  );

  // Healthcare-specific metrics
  if (data.metrics.healthcare_errors) {
    console.log(
      `Healthcare error rate: ${data.metrics.healthcare_errors.values.rate * 100}%`,
    );
  }

  if (data.metrics.patient_api_response_time) {
    console.log(
      `Patient API P95 response time: ${data.metrics.patient_api_response_time.values["p(95)"]}ms`,
    );
  }

  if (data.metrics.clinical_api_response_time) {
    console.log(
      `Clinical API P95 response time: ${data.metrics.clinical_api_response_time.values["p(95)"]}ms`,
    );
  }

  if (data.metrics.daman_api_response_time) {
    console.log(
      `DAMAN API P95 response time: ${data.metrics.daman_api_response_time.values["p(95)"]}ms`,
    );
  }

  console.log("============================================\n");
}
