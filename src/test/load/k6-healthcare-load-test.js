/**
 * K6 Load Testing for Reyada Healthcare Platform
 * Comprehensive performance testing with healthcare-specific scenarios
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// Custom metrics for healthcare scenarios
const patientRegistrationRate = new Rate("patient_registration_success_rate");
const clinicalFormSubmissionRate = new Rate(
  "clinical_form_submission_success_rate",
);
const damanAuthorizationRate = new Rate("daman_authorization_success_rate");
const dohComplianceRate = new Rate("doh_compliance_success_rate");
const responseTimeP95 = new Trend("response_time_p95");
const errorCount = new Counter("errors_total");
const healthcareWorkflowDuration = new Trend("healthcare_workflow_duration");

// Test configuration
export const options = {
  scenarios: {
    // Baseline load - normal healthcare operations
    baseline_load: {
      executor: "constant-vus",
      vus: 10,
      duration: "5m",
      tags: { scenario: "baseline" },
    },

    // Peak hours simulation - high patient load
    peak_hours: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 20 }, // Ramp up
        { duration: "5m", target: 50 }, // Peak load
        { duration: "2m", target: 20 }, // Ramp down
        { duration: "1m", target: 0 }, // Cool down
      ],
      tags: { scenario: "peak_hours" },
    },

    // Emergency scenario - sudden spike in registrations
    emergency_spike: {
      executor: "ramping-arrival-rate",
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 100,
      maxVUs: 200,
      stages: [
        { duration: "30s", target: 5 }, // Normal
        { duration: "1m", target: 50 }, // Sudden spike
        { duration: "2m", target: 100 }, // Emergency load
        { duration: "1m", target: 10 }, // Recovery
      ],
      tags: { scenario: "emergency" },
    },

    // DAMAN integration stress test
    daman_stress: {
      executor: "constant-arrival-rate",
      rate: 30,
      timeUnit: "1m",
      duration: "3m",
      preAllocatedVUs: 20,
      maxVUs: 50,
      tags: { scenario: "daman_stress" },
    },

    // Clinical workflow endurance test
    clinical_endurance: {
      executor: "constant-vus",
      vus: 15,
      duration: "10m",
      tags: { scenario: "clinical_endurance" },
    },
  },

  thresholds: {
    // Overall performance thresholds
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"], // Less than 5% error rate

    // Healthcare-specific thresholds
    patient_registration_success_rate: ["rate>0.95"],
    clinical_form_submission_success_rate: ["rate>0.98"],
    daman_authorization_success_rate: ["rate>0.90"],
    doh_compliance_success_rate: ["rate>0.99"],

    // Scenario-specific thresholds
    "http_req_duration{scenario:baseline}": ["p(95)<1500"],
    "http_req_duration{scenario:peak_hours}": ["p(95)<3000"],
    "http_req_duration{scenario:emergency}": ["p(95)<5000"],
    "http_req_duration{scenario:daman_stress}": ["p(95)<2500"],
    "http_req_duration{scenario:clinical_endurance}": ["p(95)<2000"],
  },
};

// Test data generators
const generateEmiratesId = () => {
  const year = Math.floor(Math.random() * 30) + 1990;
  const sequence = Math.floor(Math.random() * 9999999)
    .toString()
    .padStart(7, "0");
  const checkDigit = Math.floor(Math.random() * 10);
  return `784-${year}-${sequence}-${checkDigit}`;
};

const generatePatientData = () => ({
  emiratesId: generateEmiratesId(),
  name: `Patient ${Math.floor(Math.random() * 10000)}`,
  email: `patient${Math.floor(Math.random() * 10000)}@example.com`,
  phone: `+9715${Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0")}`,
  insuranceProvider: ["DAMAN", "ADNIC", "AXA", "MetLife"][
    Math.floor(Math.random() * 4)
  ],
  insuranceNumber: `INS${Math.floor(Math.random() * 1000000000)}`,
});

const generateClinicalAssessment = () => ({
  patientId: `PAT-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`,
  assessmentType: ["initial", "follow-up", "discharge", "emergency"][
    Math.floor(Math.random() * 4)
  ],
  domains: {
    cognitive: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Cognitive assessment completed",
    },
    mobility: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Mobility assessment completed",
    },
    adl: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "ADL assessment completed",
    },
    medication: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Medication assessment completed",
    },
    social: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Social assessment completed",
    },
    environment: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Environment assessment completed",
    },
    nutrition: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Nutrition assessment completed",
    },
    pain: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Pain assessment completed",
    },
    psychological: {
      score: Math.floor(Math.random() * 5) + 1,
      notes: "Psychological assessment completed",
    },
  },
  clinicianName: "Dr. Test Clinician",
  licenseNumber: "DOH-TEST-123",
});

const generateDamanRequest = () => ({
  patientId: `PAT-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`,
  serviceType: [
    "nursing-care",
    "physiotherapy",
    "medical-equipment",
    "home-visits",
  ][Math.floor(Math.random() * 4)],
  duration: Math.floor(Math.random() * 90) + 7, // 7-90 days
  frequency: ["daily", "twice-daily", "weekly", "as-needed"][
    Math.floor(Math.random() * 4)
  ],
  clinicalJustification: "Medical necessity documented for healthcare services",
  estimatedCost: Math.floor(Math.random() * 50000) + 1000, // 1000-50000 AED
});

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Authentication helper
function authenticate() {
  const loginData = {
    email: "test@reyada.ae",
    password: "TestPassword123!",
  };

  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(loginData),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Healthcare-Test": "true",
      },
    },
  );

  check(response, {
    "authentication successful": (r) => r.status === 200,
    "auth token received": (r) => r.json("token") !== undefined,
  });

  return response.json("token");
}

// Healthcare workflow tests
export default function () {
  const token = authenticate();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Healthcare-Test": "true",
    "X-DOH-Compliance": "enabled",
  };

  // Patient Registration Workflow
  group("Patient Registration Workflow", () => {
    const startTime = Date.now();
    const patientData = generatePatientData();

    const response = http.post(
      `${BASE_URL}/api/patients/register`,
      JSON.stringify(patientData),
      { headers },
    );

    const success = check(response, {
      "patient registration status 201": (r) => r.status === 201,
      "patient ID returned": (r) => r.json("patientId") !== undefined,
      "emirates ID validated": (r) => r.json("emiratesIdValid") === true,
      "DOH compliance confirmed": (r) => r.json("dohCompliant") === true,
      "response time < 3s": (r) => r.timings.duration < 3000,
    });

    patientRegistrationRate.add(success);
    responseTimeP95.add(response.timings.duration);

    if (!success) {
      errorCount.add(1);
    }

    const workflowDuration = Date.now() - startTime;
    healthcareWorkflowDuration.add(workflowDuration);
  });

  sleep(1);

  // Clinical Assessment Workflow
  group("Clinical Assessment Workflow", () => {
    const startTime = Date.now();
    const assessmentData = generateClinicalAssessment();

    const response = http.post(
      `${BASE_URL}/api/clinical/assessments`,
      JSON.stringify(assessmentData),
      { headers },
    );

    const success = check(response, {
      "clinical assessment status 201": (r) => r.status === 201,
      "assessment ID returned": (r) => r.json("assessmentId") !== undefined,
      "9 domains validated": (r) =>
        Object.keys(r.json("domains") || {}).length === 9,
      "DOH compliance score calculated": (r) =>
        r.json("complianceScore") !== undefined,
      "compliance score > 0.8": (r) => r.json("complianceScore") > 0.8,
      "response time < 5s": (r) => r.timings.duration < 5000,
    });

    clinicalFormSubmissionRate.add(success);
    dohComplianceRate.add(response.json("dohCompliant") === true);

    if (!success) {
      errorCount.add(1);
    }

    const workflowDuration = Date.now() - startTime;
    healthcareWorkflowDuration.add(workflowDuration);
  });

  sleep(1);

  // DAMAN Authorization Workflow
  group("DAMAN Authorization Workflow", () => {
    const startTime = Date.now();
    const damanData = generateDamanRequest();

    const response = http.post(
      `${BASE_URL}/api/revenue/daman/authorization`,
      JSON.stringify(damanData),
      { headers },
    );

    const success = check(response, {
      "DAMAN authorization status 201": (r) => r.status === 201,
      "reference number generated": (r) =>
        r.json("referenceNumber") !== undefined,
      "reference format valid": (r) =>
        /^DAMAN-\d{10}$/.test(r.json("referenceNumber") || ""),
      "estimated approval time provided": (r) =>
        r.json("estimatedApprovalTime") !== undefined,
      "response time < 4s": (r) => r.timings.duration < 4000,
    });

    damanAuthorizationRate.add(success);

    if (!success) {
      errorCount.add(1);
    }

    const workflowDuration = Date.now() - startTime;
    healthcareWorkflowDuration.add(workflowDuration);
  });

  sleep(1);

  // Health Check and Monitoring
  group("System Health Checks", () => {
    const healthResponse = http.get(`${BASE_URL}/api/health`, { headers });

    check(healthResponse, {
      "health check status 200": (r) => r.status === 200,
      "system status healthy": (r) => r.json("status") === "healthy",
      "database connected": (r) => r.json("database") === "connected",
      "DOH compliance active": (r) => r.json("dohCompliance") === "active",
      "DAMAN integration active": (r) =>
        r.json("damanIntegration") === "active",
    });

    // Check specific healthcare metrics
    const metricsResponse = http.get(`${BASE_URL}/api/metrics/healthcare`, {
      headers,
    });

    check(metricsResponse, {
      "metrics endpoint accessible": (r) => r.status === 200,
      "patient load within limits": (r) =>
        r.json("activePatientSessions") < 1000,
      "clinical forms processing": (r) => r.json("clinicalFormsPerSecond") >= 0,
      "DAMAN requests processing": (r) => r.json("damanRequestsPerSecond") >= 0,
    });
  });

  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

// Setup function - runs once before all VUs
export function setup() {
  console.log("🏥 Starting Reyada Healthcare Platform Load Test");
  console.log(`Target URL: ${BASE_URL}`);
  console.log(
    "Test scenarios: baseline, peak_hours, emergency, daman_stress, clinical_endurance",
  );

  // Verify system is ready
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`System health check failed: ${healthCheck.status}`);
  }

  return { startTime: Date.now() };
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 Load test completed in ${duration}s`);
}

// Custom summary report
export function handleSummary(data) {
  const htmlReportPath = "test-results/performance/k6-healthcare-report.html";
  const jsonReportPath = "test-results/performance/k6-healthcare-results.json";

  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    [htmlReportPath]: htmlReport(data),
    [jsonReportPath]: JSON.stringify(data, null, 2),
    "test-results/performance/k6-summary.txt": textSummary(data, {
      indent: " ",
      enableColors: false,
    }),
  };
}
