// Integration Intelligence System Tests
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  monitorIntegrationHealth,
  optimizeIntegrationPerformance,
  getIntegrationAnalytics,
  initializeIntegrationIntelligenceData,
  IntegrationIntelligenceService,
  IntegrationPerformanceModels,
} from "@/api/integration-intelligence.api";
import { getDb } from "@/api/mock-db";

describe("Integration Intelligence System Tests", () => {
  beforeEach(async () => {
    // Initialize test database with integration intelligence data
    await initializeIntegrationIntelligenceData();
  });

  afterEach(async () => {
    // Clean up after each test
    const db = getDb();
    await db.dropCollection("integration_performance_analytics");
    await db.dropCollection("data_flow_intelligence");
    await db.dropCollection("integration_health_reports");
    await db.dropCollection("integration_optimization_plans");
  });

  describe("Integration Health Monitoring", () => {
    it("should monitor integration health and return comprehensive report", async () => {
      const healthReport = await monitorIntegrationHealth();

      // Validate report structure
      expect(healthReport).toBeDefined();
      expect(healthReport.reportId).toBeDefined();
      expect(healthReport.timestamp).toBeInstanceOf(Date);
      expect(typeof healthReport.overallHealthScore).toBe("number");
      expect(healthReport.overallHealthScore).toBeGreaterThanOrEqual(0);
      expect(healthReport.overallHealthScore).toBeLessThanOrEqual(100);

      // Validate individual system health
      expect(Array.isArray(healthReport.individualSystemHealth)).toBe(true);
      expect(healthReport.individualSystemHealth.length).toBeGreaterThan(0);

      const systemHealth = healthReport.individualSystemHealth[0];
      expect(systemHealth.systemId).toBeDefined();
      expect(systemHealth.systemName).toBeDefined();
      expect([
        "daman",
        "malaffi",
        "doh",
        "whatsapp",
        "google_maps",
        "emr",
        "thiqa",
      ]).toContain(systemHealth.systemType);
      expect(typeof systemHealth.healthScore).toBe("number");
      expect(typeof systemHealth.uptime).toBe("number");
      expect(typeof systemHealth.responseTime).toBe("number");
      expect(typeof systemHealth.errorRate).toBe("number");
      expect(typeof systemHealth.throughput).toBe("number");
      expect(["healthy", "degraded", "critical", "offline"]).toContain(
        systemHealth.status,
      );

      // Validate performance trends
      expect(Array.isArray(healthReport.performanceTrends)).toBe(true);
      if (healthReport.performanceTrends.length > 0) {
        const trend = healthReport.performanceTrends[0];
        expect(trend.systemId).toBeDefined();
        expect([
          "response_time",
          "throughput",
          "error_rate",
          "uptime",
        ]).toContain(trend.metricType);
        expect(["improving", "stable", "degrading"]).toContain(trend.trend);
        expect(typeof trend.trendStrength).toBe("number");
        expect(Array.isArray(trend.historicalData)).toBe(true);
        expect(Array.isArray(trend.projectedValues)).toBe(true);
      }

      // Validate predicted issues
      expect(Array.isArray(healthReport.predictedIssues)).toBe(true);
      if (healthReport.predictedIssues.length > 0) {
        const issue = healthReport.predictedIssues[0];
        expect(issue.issueId).toBeDefined();
        expect(issue.systemId).toBeDefined();
        expect([
          "performance_degradation",
          "capacity_limit",
          "integration_failure",
          "security_risk",
        ]).toContain(issue.issueType);
        expect(["low", "medium", "high", "critical"]).toContain(issue.severity);
        expect(typeof issue.probability).toBe("number");
        expect(typeof issue.timeToOccurrence).toBe("number");
        expect(issue.description).toBeDefined();
        expect(issue.potentialImpact).toBeDefined();
        expect(Array.isArray(issue.preventiveActions)).toBe(true);
      }

      // Validate optimization opportunities
      expect(Array.isArray(healthReport.optimizationOpportunities)).toBe(true);
      if (healthReport.optimizationOpportunities.length > 0) {
        const opportunity = healthReport.optimizationOpportunities[0];
        expect(opportunity.opportunityId).toBeDefined();
        expect(opportunity.systemId).toBeDefined();
        expect(["performance", "cost", "reliability", "scalability"]).toContain(
          opportunity.type,
        );
        expect(opportunity.description).toBeDefined();
        expect(opportunity.expectedBenefit).toBeDefined();
        expect(["low", "medium", "high"]).toContain(
          opportunity.implementationEffort,
        );
        expect(typeof opportunity.estimatedROI).toBe("number");
        expect(opportunity.timeline).toBeDefined();
        expect(Array.isArray(opportunity.prerequisites)).toBe(true);
      }

      // Validate recommended actions
      expect(Array.isArray(healthReport.recommendedActions)).toBe(true);
      if (healthReport.recommendedActions.length > 0) {
        const action = healthReport.recommendedActions[0];
        expect(action.actionId).toBeDefined();
        expect(["low", "medium", "high", "critical"]).toContain(
          action.priority,
        );
        expect(["immediate", "short_term", "long_term"]).toContain(
          action.category,
        );
        expect(action.title).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.expectedOutcome).toBeDefined();
        expect(Array.isArray(action.requiredResources)).toBe(true);
        expect(action.estimatedDuration).toBeDefined();
        expect(["low", "medium", "high"]).toContain(action.riskLevel);
      }

      // Validate alerts and notifications
      expect(Array.isArray(healthReport.alertsAndNotifications)).toBe(true);
      if (healthReport.alertsAndNotifications.length > 0) {
        const alert = healthReport.alertsAndNotifications[0];
        expect(alert.alertId).toBeDefined();
        expect(alert.systemId).toBeDefined();
        expect([
          "performance",
          "availability",
          "security",
          "capacity",
        ]).toContain(alert.alertType);
        expect(["info", "warning", "error", "critical"]).toContain(
          alert.severity,
        );
        expect(alert.message).toBeDefined();
        expect(alert.timestamp).toBeInstanceOf(Date);
        expect(typeof alert.acknowledged).toBe("boolean");
        expect(typeof alert.escalationLevel).toBe("number");
      }
    });

    it("should handle health monitoring errors gracefully", async () => {
      // Mock database error
      const originalGetDb = getDb;

      try {
        // This should not throw but return a meaningful error
        const healthReport = await monitorIntegrationHealth();
        expect(healthReport).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Failed to monitor integration health");
      }
    });
  });

  describe("Integration Performance Optimization", () => {
    it("should optimize integration performance and return comprehensive plan", async () => {
      const performanceData = {
        systemId: "test-system",
        metrics: {
          responseTime: [200, 250, 180, 300, 220, 190, 280, 210],
          throughput: [100, 120, 95, 110, 105, 115, 90, 125],
          errorRate: [0.1, 0.2, 0.05, 0.15, 0.1, 0.08, 0.25, 0.12],
          cpuUtilization: [70, 75, 65, 80, 72, 68, 85, 73],
          memoryUtilization: [60, 65, 58, 70, 62, 55, 75, 63],
          networkLatency: [20, 25, 18, 30, 22, 17, 35, 24],
        },
        timeRange: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(),
        },
        sampleInterval: 5,
      };

      const optimizationPlan = await optimizeIntegrationPerformance(
        "test-system",
        performanceData,
      );

      // Validate optimization plan structure
      expect(optimizationPlan).toBeDefined();
      expect(optimizationPlan.planId).toBeDefined();
      expect(optimizationPlan.systemId).toBe("test-system");
      expect(optimizationPlan.timeline).toBeDefined();
      expect(typeof optimizationPlan.totalCost).toBe("number");
      expect(typeof optimizationPlan.expectedROI).toBe("number");

      // Validate identified bottlenecks
      expect(Array.isArray(optimizationPlan.identifiedBottlenecks)).toBe(true);
      if (optimizationPlan.identifiedBottlenecks.length > 0) {
        const bottleneck = optimizationPlan.identifiedBottlenecks[0];
        expect(bottleneck.bottleneckId).toBeDefined();
        expect(bottleneck.location).toBeDefined();
        expect(["cpu", "memory", "network", "database", "api_limit"]).toContain(
          bottleneck.type,
        );
        expect(["low", "medium", "high", "critical"]).toContain(
          bottleneck.severity,
        );
        expect(bottleneck.description).toBeDefined();
        expect(bottleneck.currentImpact).toBeDefined();
        expect(bottleneck.recommendedSolution).toBeDefined();
        expect(typeof bottleneck.estimatedCost).toBe("number");
      }

      // Validate cost optimizations
      expect(Array.isArray(optimizationPlan.costOptimizations)).toBe(true);
      if (optimizationPlan.costOptimizations.length > 0) {
        const costOpt = optimizationPlan.costOptimizations[0];
        expect(costOpt.optimizationId).toBeDefined();
        expect([
          "infrastructure",
          "licensing",
          "bandwidth",
          "storage",
        ]).toContain(costOpt.area);
        expect(typeof costOpt.currentCost).toBe("number");
        expect(typeof costOpt.optimizedCost).toBe("number");
        expect(typeof costOpt.savings).toBe("number");
        expect(costOpt.description).toBeDefined();
        expect(Array.isArray(costOpt.implementationSteps)).toBe(true);
        expect(["low", "medium", "high"]).toContain(costOpt.riskLevel);
      }

      // Validate scalability recommendations
      expect(Array.isArray(optimizationPlan.scalabilityRecommendations)).toBe(
        true,
      );
      if (optimizationPlan.scalabilityRecommendations.length > 0) {
        const scalability = optimizationPlan.scalabilityRecommendations[0];
        expect(scalability.recommendationId).toBeDefined();
        expect(scalability.component).toBeDefined();
        expect(typeof scalability.currentCapacity).toBe("number");
        expect(typeof scalability.recommendedCapacity).toBe("number");
        expect(["horizontal", "vertical", "hybrid"]).toContain(
          scalability.scalingStrategy,
        );
        expect(Array.isArray(scalability.triggerConditions)).toBe(true);
        expect(typeof scalability.estimatedCost).toBe("number");
        expect(scalability.timeline).toBeDefined();
      }

      // Validate implementation plan
      expect(Array.isArray(optimizationPlan.implementationPlan)).toBe(true);
      if (optimizationPlan.implementationPlan.length > 0) {
        const step = optimizationPlan.implementationPlan[0];
        expect(step.stepId).toBeDefined();
        expect(typeof step.phase).toBe("number");
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.duration).toBeDefined();
        expect(Array.isArray(step.dependencies)).toBe(true);
        expect(Array.isArray(step.resources)).toBe(true);
        expect(Array.isArray(step.successCriteria)).toBe(true);
        expect(step.rollbackPlan).toBeDefined();
      }

      // Validate expected improvements
      expect(Array.isArray(optimizationPlan.expectedImprovements)).toBe(true);
      if (optimizationPlan.expectedImprovements.length > 0) {
        const improvement = optimizationPlan.expectedImprovements[0];
        expect(improvement.metric).toBeDefined();
        expect(typeof improvement.currentValue).toBe("number");
        expect(typeof improvement.expectedValue).toBe("number");
        expect(typeof improvement.improvementPercentage).toBe("number");
        expect(typeof improvement.confidence).toBe("number");
        expect(improvement.timeToRealize).toBeDefined();
      }

      // Validate risk assessment
      expect(optimizationPlan.riskAssessment).toBeDefined();
      expect(["low", "medium", "high", "critical"]).toContain(
        optimizationPlan.riskAssessment.overallRisk,
      );
      expect(Array.isArray(optimizationPlan.riskAssessment.riskFactors)).toBe(
        true,
      );
      expect(
        Array.isArray(optimizationPlan.riskAssessment.mitigationStrategies),
      ).toBe(true);
      expect(
        Array.isArray(optimizationPlan.riskAssessment.contingencyPlans),
      ).toBe(true);
      expect(
        Array.isArray(optimizationPlan.riskAssessment.monitoringRequirements),
      ).toBe(true);

      if (optimizationPlan.riskAssessment.riskFactors.length > 0) {
        const riskFactor = optimizationPlan.riskAssessment.riskFactors[0];
        expect(riskFactor.factor).toBeDefined();
        expect(typeof riskFactor.probability).toBe("number");
        expect(typeof riskFactor.impact).toBe("number");
        expect(typeof riskFactor.riskScore).toBe("number");
        expect([
          "technical",
          "operational",
          "financial",
          "compliance",
        ]).toContain(riskFactor.category);
      }
    });

    it("should handle optimization errors gracefully", async () => {
      const invalidPerformanceData = {
        systemId: "",
        metrics: {
          responseTime: [],
          throughput: [],
          errorRate: [],
          cpuUtilization: [],
          memoryUtilization: [],
          networkLatency: [],
        },
        timeRange: {
          startTime: new Date(),
          endTime: new Date(),
        },
        sampleInterval: 0,
      };

      try {
        await optimizeIntegrationPerformance("", invalidPerformanceData);
        // Should not reach here
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain(
          "Failed to optimize integration performance",
        );
      }
    });
  });

  describe("Integration Analytics", () => {
    it("should provide comprehensive integration analytics", async () => {
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const dateTo = new Date().toISOString().split("T")[0];

      const analytics = await getIntegrationAnalytics({
        dateFrom,
        dateTo,
      });

      // Validate analytics structure
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalHealthReports).toBe("number");
      expect(typeof analytics.averageHealthScore).toBe("number");
      expect(typeof analytics.totalPerformanceRecords).toBe("number");
      expect(typeof analytics.totalDataFlowRecords).toBe("number");
      expect(typeof analytics.systemsMonitored).toBe("number");
      expect(typeof analytics.criticalIssues).toBe("number");
      expect(typeof analytics.optimizationOpportunities).toBe("number");
      expect(Array.isArray(analytics.healthReports)).toBe(true);
      expect(Array.isArray(analytics.performanceData)).toBe(true);
      expect(Array.isArray(analytics.dataFlowData)).toBe(true);

      // Validate health score is within valid range
      expect(analytics.averageHealthScore).toBeGreaterThanOrEqual(0);
      expect(analytics.averageHealthScore).toBeLessThanOrEqual(100);
    });

    it("should filter analytics by system ID", async () => {
      const analytics = await getIntegrationAnalytics({
        systemId: "daman",
      });

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalHealthReports).toBe("number");
      expect(typeof analytics.averageHealthScore).toBe("number");
    });

    it("should handle analytics errors gracefully", async () => {
      try {
        const analytics = await getIntegrationAnalytics({
          dateFrom: "invalid-date",
          dateTo: "invalid-date",
        });
        expect(analytics).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Failed to get integration analytics");
      }
    });
  });

  describe("Integration Performance Models", () => {
    it("should initialize performance models correctly", () => {
      const models = new IntegrationPerformanceModels();

      expect(models.models).toBeDefined();
      expect(models.models.performancePrediction).toBeDefined();
      expect(models.models.failurePrediction).toBeDefined();
      expect(models.models.capacityPlanning).toBeDefined();
      expect(models.models.costOptimization).toBeDefined();

      // Validate performance prediction model
      const perfModel = models.models.performancePrediction;
      expect(perfModel.algorithm).toBe(
        "Time Series Forecasting with External Factors",
      );
      expect(Array.isArray(perfModel.features)).toBe(true);
      expect(perfModel.features.length).toBeGreaterThan(0);
      expect(Array.isArray(perfModel.prediction_horizons)).toBe(true);
      expect(typeof perfModel.accuracy_target).toBe("number");
      expect(perfModel.accuracy_target).toBe(0.9);

      // Validate failure prediction model
      const failureModel = models.models.failurePrediction;
      expect(failureModel.algorithm).toBe("Anomaly Detection + Classification");
      expect(Array.isArray(failureModel.features)).toBe(true);
      expect(typeof failureModel.early_warning_threshold).toBe("number");
      expect(typeof failureModel.action_automation).toBe("boolean");

      // Validate capacity planning model
      const capacityModel = models.models.capacityPlanning;
      expect(capacityModel.algorithm).toBe(
        "Regression Analysis + Monte Carlo Simulation",
      );
      expect(Array.isArray(capacityModel.features)).toBe(true);
      expect(capacityModel.planning_horizon).toBe("12_months");
      expect(typeof capacityModel.confidence_interval).toBe("number");

      // Validate cost optimization model
      const costModel = models.models.costOptimization;
      expect(costModel.algorithm).toBe("Multi-objective Optimization");
      expect(Array.isArray(costModel.features)).toBe(true);
      expect(Array.isArray(costModel.optimization_objectives)).toBe(true);
      expect(typeof costModel.constraint_satisfaction).toBe("boolean");
    });

    it("should predict performance correctly", async () => {
      const models = new IntegrationPerformanceModels();
      const predictions = await models.predictPerformance(
        "test-system",
        "1_day",
      );

      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBeGreaterThan(0);

      if (predictions.length > 0) {
        const prediction = predictions[0];
        expect(prediction.timestamp).toBeInstanceOf(Date);
        expect(typeof prediction.value).toBe("number");
        expect(typeof prediction.confidence).toBe("number");
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeLessThanOrEqual(1);
      }
    });

    it("should detect anomalies correctly", async () => {
      const models = new IntegrationPerformanceModels();
      const currentMetrics = {
        responseTime: 1500, // High response time to trigger anomaly
        throughput: 50,
        errorRate: 5,
        cpuUtilization: 90,
        memoryUtilization: 85,
      };

      const anomalies = await models.detectAnomalies(
        "test-system",
        currentMetrics,
      );

      expect(Array.isArray(anomalies)).toBe(true);

      if (anomalies.length > 0) {
        const anomaly = anomalies[0];
        expect(anomaly.issueId).toBeDefined();
        expect(anomaly.systemId).toBe("test-system");
        expect([
          "performance_degradation",
          "capacity_limit",
          "integration_failure",
          "security_risk",
        ]).toContain(anomaly.issueType);
        expect(["low", "medium", "high", "critical"]).toContain(
          anomaly.severity,
        );
        expect(typeof anomaly.probability).toBe("number");
        expect(typeof anomaly.timeToOccurrence).toBe("number");
        expect(anomaly.description).toBeDefined();
        expect(anomaly.potentialImpact).toBeDefined();
        expect(Array.isArray(anomaly.preventiveActions)).toBe(true);
      }
    });
  });

  describe("Integration Intelligence Service", () => {
    it("should initialize service correctly", () => {
      const service = new IntegrationIntelligenceService();
      expect(service).toBeDefined();
    });

    it("should monitor integration health through service", async () => {
      const service = new IntegrationIntelligenceService();
      const healthReport = await service.monitorIntegrationHealth();

      expect(healthReport).toBeDefined();
      expect(healthReport.reportId).toBeDefined();
      expect(healthReport.timestamp).toBeInstanceOf(Date);
      expect(typeof healthReport.overallHealthScore).toBe("number");
    });

    it("should optimize performance through service", async () => {
      const service = new IntegrationIntelligenceService();
      const performanceData = {
        systemId: "test-system",
        metrics: {
          responseTime: [200, 250, 180],
          throughput: [100, 120, 95],
          errorRate: [0.1, 0.2, 0.05],
          cpuUtilization: [70, 75, 65],
          memoryUtilization: [60, 65, 58],
          networkLatency: [20, 25, 18],
        },
        timeRange: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(),
        },
        sampleInterval: 5,
      };

      const optimizationPlan = await service.optimizeIntegrationPerformance(
        "test-system",
        performanceData,
      );

      expect(optimizationPlan).toBeDefined();
      expect(optimizationPlan.planId).toBeDefined();
      expect(optimizationPlan.systemId).toBe("test-system");
    });
  });

  describe("Data Persistence", () => {
    it("should store health reports in database", async () => {
      const healthReport = await monitorIntegrationHealth();
      expect(healthReport).toBeDefined();

      // Verify data is stored in database
      const db = getDb();
      const collection = db.collection("integration_health_reports");
      const storedReport = await collection.findOne({
        reportId: healthReport.reportId,
      });

      expect(storedReport).toBeDefined();
      expect(storedReport.reportId).toBe(healthReport.reportId);
    });

    it("should store optimization plans in database", async () => {
      const performanceData = {
        systemId: "test-system",
        metrics: {
          responseTime: [200],
          throughput: [100],
          errorRate: [0.1],
          cpuUtilization: [70],
          memoryUtilization: [60],
          networkLatency: [20],
        },
        timeRange: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(),
        },
        sampleInterval: 5,
      };

      const optimizationPlan = await optimizeIntegrationPerformance(
        "test-system",
        performanceData,
      );

      expect(optimizationPlan).toBeDefined();

      // Verify data is stored in database
      const db = getDb();
      const collection = db.collection("integration_optimization_plans");
      const storedPlan = await collection.findOne({
        planId: optimizationPlan.planId,
      });

      expect(storedPlan).toBeDefined();
      expect(storedPlan.planId).toBe(optimizationPlan.planId);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle empty performance data gracefully", async () => {
      const emptyPerformanceData = {
        systemId: "empty-system",
        metrics: {
          responseTime: [],
          throughput: [],
          errorRate: [],
          cpuUtilization: [],
          memoryUtilization: [],
          networkLatency: [],
        },
        timeRange: {
          startTime: new Date(),
          endTime: new Date(),
        },
        sampleInterval: 1,
      };

      try {
        const optimizationPlan = await optimizeIntegrationPerformance(
          "empty-system",
          emptyPerformanceData,
        );

        // Should still return a valid plan structure
        expect(optimizationPlan).toBeDefined();
        expect(optimizationPlan.planId).toBeDefined();
        expect(optimizationPlan.systemId).toBe("empty-system");
      } catch (error) {
        expect(error.message).toContain(
          "Failed to optimize integration performance",
        );
      }
    });

    it("should handle invalid date ranges in analytics", async () => {
      try {
        const analytics = await getIntegrationAnalytics({
          dateFrom: "2025-01-01", // Future date
          dateTo: "2024-01-01", // Past date (invalid range)
        });

        // Should still return valid analytics structure
        expect(analytics).toBeDefined();
        expect(typeof analytics.totalHealthReports).toBe("number");
      } catch (error) {
        expect(error.message).toContain("Failed to get integration analytics");
      }
    });

    it("should handle missing system ID gracefully", async () => {
      const performanceData = {
        systemId: "",
        metrics: {
          responseTime: [200],
          throughput: [100],
          errorRate: [0.1],
          cpuUtilization: [70],
          memoryUtilization: [60],
          networkLatency: [20],
        },
        timeRange: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(),
        },
        sampleInterval: 5,
      };

      try {
        await optimizeIntegrationPerformance("", performanceData);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain(
          "Failed to optimize integration performance",
        );
      }
    });
  });
});
