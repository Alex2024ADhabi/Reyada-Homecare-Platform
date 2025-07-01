/**
 * Artillery Load Test Processor
 * Custom metrics and processing for healthcare platform load testing
 */

const fs = require("fs");
const path = require("path");

class HealthcareMetricsProcessor {
  constructor() {
    this.healthcareMetrics = {
      patientOperations: 0,
      clinicalAssessments: 0,
      damanAuthorizations: 0,
      authenticationAttempts: 0,
      errors: {
        authentication: 0,
        patientManagement: 0,
        clinical: 0,
        daman: 0,
      },
      responseTimes: {
        authentication: [],
        patientSearch: [],
        clinicalAssessment: [],
        damanSubmission: [],
      },
    };
  }

  // Called before each scenario
  beforeScenario(userContext, events, done) {
    userContext.vars.startTime = Date.now();
    return done();
  }

  // Called after each scenario
  afterScenario(userContext, events, done) {
    const duration = Date.now() - userContext.vars.startTime;

    // Track scenario completion time
    if (userContext.scenario && userContext.scenario.name) {
      const scenarioName = userContext.scenario.name
        .toLowerCase()
        .replace(/\s+/g, "");

      if (!this.healthcareMetrics.scenarioDurations) {
        this.healthcareMetrics.scenarioDurations = {};
      }

      if (!this.healthcareMetrics.scenarioDurations[scenarioName]) {
        this.healthcareMetrics.scenarioDurations[scenarioName] = [];
      }

      this.healthcareMetrics.scenarioDurations[scenarioName].push(duration);
    }

    return done();
  }

  // Called before each request
  beforeRequest(requestParams, userContext, events, done) {
    requestParams.startTime = Date.now();
    return done();
  }

  // Called after each request
  afterResponse(requestParams, response, userContext, events, done) {
    const responseTime = Date.now() - requestParams.startTime;
    const url = requestParams.url;
    const method = requestParams.method || "GET";
    const statusCode = response.statusCode;

    // Track healthcare-specific metrics
    this.trackHealthcareMetrics(url, method, statusCode, responseTime);

    // Track errors
    if (statusCode >= 400) {
      this.trackErrors(url, statusCode);
    }

    // Emit custom metrics
    events.emit("counter", "healthcare.requests.total", 1);
    events.emit("histogram", "healthcare.response_time", responseTime);

    if (statusCode >= 400) {
      events.emit("counter", "healthcare.errors.total", 1);
    }

    return done();
  }

  trackHealthcareMetrics(url, method, statusCode, responseTime) {
    // Authentication metrics
    if (url.includes("/auth/login")) {
      this.healthcareMetrics.authenticationAttempts++;
      this.healthcareMetrics.responseTimes.authentication.push(responseTime);
    }

    // Patient management metrics
    if (url.includes("/patients")) {
      this.healthcareMetrics.patientOperations++;
      if (url.includes("/search")) {
        this.healthcareMetrics.responseTimes.patientSearch.push(responseTime);
      }
    }

    // Clinical assessment metrics
    if (url.includes("/clinical/assessments") && method === "POST") {
      this.healthcareMetrics.clinicalAssessments++;
      this.healthcareMetrics.responseTimes.clinicalAssessment.push(
        responseTime,
      );
    }

    // DAMAN authorization metrics
    if (url.includes("/daman/authorizations") && method === "POST") {
      this.healthcareMetrics.damanAuthorizations++;
      this.healthcareMetrics.responseTimes.damanSubmission.push(responseTime);
    }
  }

  trackErrors(url, statusCode) {
    if (url.includes("/auth/")) {
      this.healthcareMetrics.errors.authentication++;
    } else if (url.includes("/patients")) {
      this.healthcareMetrics.errors.patientManagement++;
    } else if (url.includes("/clinical/")) {
      this.healthcareMetrics.errors.clinical++;
    } else if (url.includes("/daman/")) {
      this.healthcareMetrics.errors.daman++;
    }
  }

  // Calculate statistics
  calculateStats(values) {
    if (values.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };

    const sorted = values.sort((a, b) => a - b);
    const len = sorted.length;

    return {
      min: sorted[0],
      max: sorted[len - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / len,
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
    };
  }

  // Generate healthcare-specific report
  generateHealthcareReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPatientOperations: this.healthcareMetrics.patientOperations,
        totalClinicalAssessments: this.healthcareMetrics.clinicalAssessments,
        totalDamanAuthorizations: this.healthcareMetrics.damanAuthorizations,
        totalAuthenticationAttempts:
          this.healthcareMetrics.authenticationAttempts,
      },
      responseTimeStats: {
        authentication: this.calculateStats(
          this.healthcareMetrics.responseTimes.authentication,
        ),
        patientSearch: this.calculateStats(
          this.healthcareMetrics.responseTimes.patientSearch,
        ),
        clinicalAssessment: this.calculateStats(
          this.healthcareMetrics.responseTimes.clinicalAssessment,
        ),
        damanSubmission: this.calculateStats(
          this.healthcareMetrics.responseTimes.damanSubmission,
        ),
      },
      errorSummary: this.healthcareMetrics.errors,
      scenarioPerformance: {},
    };

    // Calculate scenario performance
    if (this.healthcareMetrics.scenarioDurations) {
      Object.keys(this.healthcareMetrics.scenarioDurations).forEach(
        (scenario) => {
          report.scenarioPerformance[scenario] = this.calculateStats(
            this.healthcareMetrics.scenarioDurations[scenario],
          );
        },
      );
    }

    return report;
  }

  // Called at the end of the test
  afterTest(summary, done) {
    const healthcareReport = this.generateHealthcareReport();

    // Save healthcare-specific report
    const reportPath = path.join(
      "test-results",
      "artillery-healthcare-report.json",
    );

    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(healthcareReport, null, 2));

    console.log("\n=== Healthcare Load Test Summary ===");
    console.log(
      `Patient Operations: ${healthcareReport.summary.totalPatientOperations}`,
    );
    console.log(
      `Clinical Assessments: ${healthcareReport.summary.totalClinicalAssessments}`,
    );
    console.log(
      `DAMAN Authorizations: ${healthcareReport.summary.totalDamanAuthorizations}`,
    );
    console.log(
      `Authentication Attempts: ${healthcareReport.summary.totalAuthenticationAttempts}`,
    );

    console.log("\n=== Response Time Performance ===");
    Object.keys(healthcareReport.responseTimeStats).forEach((operation) => {
      const stats = healthcareReport.responseTimeStats[operation];
      if (stats.avg > 0) {
        console.log(
          `${operation}: avg=${stats.avg.toFixed(0)}ms, p95=${stats.p95}ms, p99=${stats.p99}ms`,
        );
      }
    });

    console.log("\n=== Error Summary ===");
    Object.keys(healthcareReport.errorSummary).forEach((category) => {
      const errorCount = healthcareReport.errorSummary[category];
      if (errorCount > 0) {
        console.log(`${category}: ${errorCount} errors`);
      }
    });

    console.log(`\nDetailed report saved to: ${reportPath}`);
    console.log("=====================================\n");

    return done();
  }
}

// Create global instance
const processor = new HealthcareMetricsProcessor();

// Export functions for Artillery
module.exports = {
  beforeScenario: processor.beforeScenario.bind(processor),
  afterScenario: processor.afterScenario.bind(processor),
  beforeRequest: processor.beforeRequest.bind(processor),
  afterResponse: processor.afterResponse.bind(processor),
  afterTest: processor.afterTest.bind(processor),
};
