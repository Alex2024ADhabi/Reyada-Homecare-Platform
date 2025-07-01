import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

/**
 * Healthcare Platform Load Testing Suite
 * Tests system performance under various load conditions
 * Ensures the platform can handle healthcare workloads
 */

// Custom metrics for healthcare-specific monitoring
const errorRate = new Rate("healthcare_errors");
const responseTime = new Trend("healthcare_response_time");
const patientOperations = new Counter("patient_operations");
const clinicalOperations = new Counter("clinical_operations");
const revenueOperations = new Counter("revenue_operations");
const complianceOperations = new Counter("compliance_operations");

// Load test configuration
export const options = {
  stages: [
    // Ramp-up: Simulate gradual increase in users
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 20 }, // Ramp up to 20 users
    { duration: "5m", target: 20 }, // Stay at 20 users
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "5m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    // Healthcare-specific performance requirements
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    http_req_failed: ["rate<0.01"], // Error rate under 1%
    healthcare_errors: ["rate<0.005"], // Healthcare errors under 0.5%
    healthcare_response_time: ["p(90)<1500"], // 90% under 1.5s
  },
  ext: {
    loadimpact: {
      projectID: 3595341,
      name: "Healthcare Platform Load Test",
    },
  },
};

// Test data for healthcare scenarios
const testData = {
  patients: [
    {
      emiratesId: "784-1990-1234567-8",
      name: "Ahmed Al Mansouri",
      phone: "+971501234567",
      email: "ahmed.almansouri@email.com",
    },
    {
      emiratesId: "784-1985-2345678-9",
      name: "Fatima Al Zahra",
      phone: "+971509876543",
      email: "fatima.alzahra@email.com",
    },
    {
      emiratesId: "784-1992-3456789-0",
      name: "Mohammed Al Rashid",
      phone: "+971505555555",
      email: "mohammed.alrashid@email.com",
    },
  ],
  clinicians: [
    {
      email: "nurse1@reyada.com",
      password: "TestPassword123!",
      role: "nurse",
    },
    {
      email: "doctor1@reyada.com",
      password: "TestPassword123!",
      role: "doctor",
    },
    {
      email: "therapist1@reyada.com",
      password: "TestPassword123!",
      role: "therapist",
    },
  ],
  assessmentTypes: [
    "initial-assessment",
    "follow-up-assessment",
    "discharge-assessment",
    "emergency-assessment",
  ],
  serviceTypes: [
    "nursing-care",
    "physiotherapy",
    "occupational-therapy",
    "medical-equipment",
    "wound-care",
  ],
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

// Authentication helper
function authenticate(credentials) {
  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    {
      email: credentials.email,
      password: credentials.password,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  check(loginResponse, {
    "login successful": (r) => r.status === 200,
    "login response time OK": (r) => r.timings.duration < 1000,
  });

  if (loginResponse.status === 200) {
    const authData = JSON.parse(loginResponse.body);
    return authData.token;
  }

  return null;
}

// Main test scenario
export default function () {
  // Select random test data
  const patient =
    testData.patients[Math.floor(Math.random() * testData.patients.length)];
  const clinician =
    testData.clinicians[Math.floor(Math.random() * testData.clinicians.length)];

  group("Healthcare Platform Load Test", () => {
    // Authentication flow
    group("Authentication", () => {
      const token = authenticate(clinician);

      if (!token) {
        errorRate.add(1);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Patient Management Operations
      group("Patient Management", () => {
        // Search patients
        const searchResponse = http.get(
          `${BASE_URL}/api/patients/search?q=${patient.name}`,
          { headers },
        );

        const searchSuccess = check(searchResponse, {
          "patient search successful": (r) => r.status === 200,
          "patient search response time OK": (r) => r.timings.duration < 1000,
        });

        if (searchSuccess) {
          patientOperations.add(1);
          responseTime.add(searchResponse.timings.duration);
        } else {
          errorRate.add(1);
        }

        // Get patient details
        const patientResponse = http.get(`${BASE_URL}/api/patients/123`, {
          headers,
        });

        check(patientResponse, {
          "patient details retrieved": (r) =>
            r.status === 200 || r.status === 404,
          "patient details response time OK": (r) => r.timings.duration < 800,
        });

        patientOperations.add(1);
      });

      // Clinical Documentation Operations
      group("Clinical Documentation", () => {
        // Create assessment
        const assessmentData = {
          patientId: "patient-123",
          assessmentType:
            testData.assessmentTypes[
              Math.floor(Math.random() * testData.assessmentTypes.length)
            ],
          assessmentDate: new Date().toISOString(),
          clinicianId: "clinician-456",
          domains: {
            domain1: {
              score: Math.floor(Math.random() * 5) + 1,
              notes: "Test assessment notes",
            },
            domain2: {
              score: Math.floor(Math.random() * 5) + 1,
              notes: "Test assessment notes",
            },
            domain3: {
              score: Math.floor(Math.random() * 5) + 1,
              notes: "Test assessment notes",
            },
          },
        };

        const assessmentResponse = http.post(
          `${BASE_URL}/api/clinical/assessments`,
          JSON.stringify(assessmentData),
          { headers },
        );

        const assessmentSuccess = check(assessmentResponse, {
          "assessment created": (r) => r.status === 201 || r.status === 200,
          "assessment response time OK": (r) => r.timings.duration < 1500,
        });

        if (assessmentSuccess) {
          clinicalOperations.add(1);
          responseTime.add(assessmentResponse.timings.duration);
        } else {
          errorRate.add(1);
        }

        // Get assessments list
        const assessmentsResponse = http.get(
          `${BASE_URL}/api/clinical/assessments?patientId=patient-123`,
          { headers },
        );

        check(assessmentsResponse, {
          "assessments list retrieved": (r) => r.status === 200,
          "assessments list response time OK": (r) => r.timings.duration < 1000,
        });

        clinicalOperations.add(1);
      });

      // Revenue Management Operations
      group("Revenue Management", () => {
        // Create claim
        const claimData = {
          patientId: "patient-123",
          claimType: "homecare",
          serviceLines: [
            {
              serviceCode: "NURSE-001",
              serviceDescription: "Skilled Nursing Care",
              dateOfService: new Date().toISOString().split("T")[0],
              quantity: 1,
              unitPrice: 150.0,
            },
          ],
          billingPeriod: {
            startDate: "2024-01-01",
            endDate: "2024-01-31",
          },
        };

        const claimResponse = http.post(
          `${BASE_URL}/api/revenue/claims`,
          JSON.stringify(claimData),
          { headers },
        );

        const claimSuccess = check(claimResponse, {
          "claim created": (r) => r.status === 201 || r.status === 200,
          "claim response time OK": (r) => r.timings.duration < 2000,
        });

        if (claimSuccess) {
          revenueOperations.add(1);
          responseTime.add(claimResponse.timings.duration);
        } else {
          errorRate.add(1);
        }

        // Get claims list
        const claimsResponse = http.get(
          `${BASE_URL}/api/revenue/claims?status=submitted`,
          { headers },
        );

        check(claimsResponse, {
          "claims list retrieved": (r) => r.status === 200,
          "claims list response time OK": (r) => r.timings.duration < 1200,
        });

        revenueOperations.add(1);
      });

      // Compliance Operations
      group("Compliance Operations", () => {
        // DOH reporting
        const dohReportResponse = http.get(
          `${BASE_URL}/api/compliance/doh/reports?month=2024-01`,
          { headers },
        );

        const dohSuccess = check(dohReportResponse, {
          "DOH report retrieved": (r) => r.status === 200,
          "DOH report response time OK": (r) => r.timings.duration < 3000,
        });

        if (dohSuccess) {
          complianceOperations.add(1);
          responseTime.add(dohReportResponse.timings.duration);
        } else {
          errorRate.add(1);
        }

        // DAMAN authorization check
        const damanAuthResponse = http.get(
          `${BASE_URL}/api/compliance/daman/authorizations/patient-123`,
          { headers },
        );

        check(damanAuthResponse, {
          "DAMAN authorization checked": (r) =>
            r.status === 200 || r.status === 404,
          "DAMAN authorization response time OK": (r) =>
            r.timings.duration < 2000,
        });

        complianceOperations.add(1);
      });

      // Dashboard and Analytics
      group("Dashboard Operations", () => {
        // Load dashboard data
        const dashboardResponse = http.get(
          `${BASE_URL}/api/dashboard/summary`,
          { headers },
        );

        check(dashboardResponse, {
          "dashboard loaded": (r) => r.status === 200,
          "dashboard response time OK": (r) => r.timings.duration < 1500,
        });

        // Load analytics data
        const analyticsResponse = http.get(
          `${BASE_URL}/api/analytics/performance?period=30d`,
          { headers },
        );

        check(analyticsResponse, {
          "analytics loaded": (r) => r.status === 200,
          "analytics response time OK": (r) => r.timings.duration < 2000,
        });
      });
    });
  });

  // Simulate realistic user behavior with pauses
  sleep(Math.random() * 3 + 1); // 1-4 seconds pause
}

// Stress test scenario
export function stressTest() {
  const stressOptions = {
    stages: [
      { duration: "1m", target: 100 }, // Ramp up to 100 users
      { duration: "5m", target: 100 }, // Stay at 100 users
      { duration: "1m", target: 200 }, // Ramp up to 200 users
      { duration: "5m", target: 200 }, // Stay at 200 users
      { duration: "2m", target: 0 }, // Ramp down
    ],
    thresholds: {
      http_req_duration: ["p(95)<5000"], // More lenient under stress
      http_req_failed: ["rate<0.05"], // Allow 5% error rate under stress
    },
  };

  // Run the same test scenarios but with higher load
  return stressOptions;
}

// Spike test scenario
export function spikeTest() {
  const spikeOptions = {
    stages: [
      { duration: "30s", target: 10 }, // Normal load
      { duration: "30s", target: 500 }, // Sudden spike
      { duration: "1m", target: 500 }, // Maintain spike
      { duration: "30s", target: 10 }, // Return to normal
      { duration: "30s", target: 0 }, // Ramp down
    ],
    thresholds: {
      http_req_duration: ["p(95)<10000"], // Very lenient during spike
      http_req_failed: ["rate<0.1"], // Allow 10% error rate during spike
    },
  };

  return spikeOptions;
}

// Generate HTML report
export function handleSummary(data) {
  return {
    "test-results/load-test-report.html": htmlReport(data),
    "test-results/load-test-results.json": JSON.stringify(data, null, 2),
  };
}

// Teardown function
export function teardown(data) {
  console.log("\n=== Healthcare Load Test Summary ===");
  console.log(
    `Total Patient Operations: ${data.metrics.patient_operations.values.count}`,
  );
  console.log(
    `Total Clinical Operations: ${data.metrics.clinical_operations.values.count}`,
  );
  console.log(
    `Total Revenue Operations: ${data.metrics.revenue_operations.values.count}`,
  );
  console.log(
    `Total Compliance Operations: ${data.metrics.compliance_operations.values.count}`,
  );
  console.log(
    `Average Response Time: ${data.metrics.healthcare_response_time.values.avg.toFixed(2)}ms`,
  );
  console.log(
    `Error Rate: ${(data.metrics.healthcare_errors.values.rate * 100).toFixed(2)}%`,
  );
  console.log("=====================================\n");
}
