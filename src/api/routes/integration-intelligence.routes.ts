import express from "express";
import {
  monitorIntegrationHealth,
  optimizeIntegrationPerformance,
  getIntegrationAnalytics,
  initializeIntegrationIntelligenceData,
} from "../integration-intelligence.api";

const router = express.Router();

// Integration Health Monitoring
router.get("/health", async (req, res) => {
  try {
    const healthReport = await monitorIntegrationHealth();
    res.json(healthReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Integration Performance Optimization
router.post("/optimize/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const performanceData = req.body;
    const optimizationPlan = await optimizeIntegrationPerformance(
      systemId,
      performanceData,
    );
    res.json(optimizationPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Integration Analytics
router.get("/analytics", async (req, res) => {
  try {
    const { dateFrom, dateTo, systemId } = req.query;
    const analytics = await getIntegrationAnalytics({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      systemId: systemId as string,
    });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Integration Intelligence Data
router.post("/initialize", async (req, res) => {
  try {
    await initializeIntegrationIntelligenceData();
    res.json({
      message: "Integration intelligence data initialized successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get System Performance Metrics
router.get("/performance/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const { dateFrom, dateTo } = req.query;

    const analytics = await getIntegrationAnalytics({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      systemId,
    });

    res.json({
      systemId,
      performanceMetrics: analytics.performanceData.filter(
        (p: any) => p.system_type === systemId,
      ),
      dataFlowMetrics: analytics.dataFlowData.filter(
        (d: any) =>
          d.source_system === systemId || d.target_system === systemId,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Integration Alerts
router.get("/alerts", async (req, res) => {
  try {
    const { severity, systemId } = req.query;
    const healthReport = await monitorIntegrationHealth();

    let alerts = healthReport.alertsAndNotifications;

    if (severity) {
      alerts = alerts.filter((alert) => alert.severity === severity);
    }

    if (systemId) {
      alerts = alerts.filter((alert) => alert.systemId === systemId);
    }

    res.json({
      totalAlerts: alerts.length,
      alerts: alerts.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Optimization Opportunities
router.get("/opportunities", async (req, res) => {
  try {
    const { systemId, type } = req.query;
    const healthReport = await monitorIntegrationHealth();

    let opportunities = healthReport.optimizationOpportunities;

    if (systemId) {
      opportunities = opportunities.filter((opp) => opp.systemId === systemId);
    }

    if (type) {
      opportunities = opportunities.filter((opp) => opp.type === type);
    }

    res.json({
      totalOpportunities: opportunities.length,
      opportunities: opportunities.sort(
        (a, b) => b.estimatedROI - a.estimatedROI,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Predicted Issues
router.get("/predictions", async (req, res) => {
  try {
    const { systemId, severity, timeHorizon } = req.query;
    const healthReport = await monitorIntegrationHealth();

    let predictions = healthReport.predictedIssues;

    if (systemId) {
      predictions = predictions.filter((pred) => pred.systemId === systemId);
    }

    if (severity) {
      predictions = predictions.filter((pred) => pred.severity === severity);
    }

    if (timeHorizon) {
      const hours = parseInt(timeHorizon as string);
      predictions = predictions.filter(
        (pred) => pred.timeToOccurrence <= hours,
      );
    }

    res.json({
      totalPredictions: predictions.length,
      predictions: predictions.sort(
        (a, b) => a.timeToOccurrence - b.timeToOccurrence,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Integration Testing Routes

// Execute Integration Test Suite
router.post("/testing/execute/:suiteId", async (req, res) => {
  try {
    const { suiteId } = req.params;
    const { executeIntegrationTestSuite } = await import(
      "../integration-intelligence.api"
    );

    const report = await executeIntegrationTestSuite(suiteId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Integration Test Reports
router.get("/testing/reports", async (req, res) => {
  try {
    const { suiteId, dateFrom, dateTo, status } = req.query;
    const { getIntegrationTestReports } = await import(
      "../integration-intelligence.api"
    );

    const reports = await getIntegrationTestReports({
      suiteId: suiteId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      status: status as string,
    });

    res.json({
      totalReports: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule Integration Tests
router.post("/testing/schedule", async (req, res) => {
  try {
    const scheduleConfig = req.body;
    const { scheduleIntegrationTests } = await import(
      "../integration-intelligence.api"
    );

    const schedule = await scheduleIntegrationTests(scheduleConfig);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time Integration Monitoring
router.get("/monitoring/realtime/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;

    // Set up Server-Sent Events for real-time monitoring
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const sendUpdate = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial data
    const healthReport = await monitorIntegrationHealth();
    const systemHealth = healthReport.individualSystemHealth.find(
      (system) => system.systemId === systemId,
    );

    sendUpdate({
      type: "health_update",
      systemId,
      data: systemHealth,
      timestamp: new Date().toISOString(),
    });

    // Set up periodic updates
    const interval = setInterval(async () => {
      try {
        const updatedHealthReport = await monitorIntegrationHealth();
        const updatedSystemHealth =
          updatedHealthReport.individualSystemHealth.find(
            (system) => system.systemId === systemId,
          );

        sendUpdate({
          type: "health_update",
          systemId,
          data: updatedSystemHealth,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        sendUpdate({
          type: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }, 5000); // Update every 5 seconds

    // Clean up on client disconnect
    req.on("close", () => {
      clearInterval(interval);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Integration Error Handling and Recovery
router.post("/recovery/retry/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const { operationType, operationId } = req.body;

    // Implementation for retrying failed operations
    const recoveryResult = {
      systemId,
      operationType,
      operationId,
      status: "retry_initiated",
      retryAttempt: 1,
      timestamp: new Date().toISOString(),
    };

    res.json(recoveryResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Integration Error Logs
router.get("/errors/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const { severity, dateFrom, dateTo, limit } = req.query;

    // Mock error logs - in production, this would query actual error logs
    const errorLogs = [
      {
        errorId: "error_001",
        systemId,
        severity: "high",
        message: "Connection timeout to Malaffi EMR",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        resolved: false,
        retryCount: 2,
      },
      {
        errorId: "error_002",
        systemId,
        severity: "medium",
        message: "Rate limit exceeded",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        resolved: true,
        retryCount: 1,
      },
    ];

    let filteredLogs = errorLogs;

    if (severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === severity);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(0, parseInt(limit as string));
    }

    res.json({
      totalErrors: filteredLogs.length,
      errors: filteredLogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Integration Performance Benchmarking
router.get("/benchmarks/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const { metric, timeRange } = req.query;

    const benchmarks = {
      systemId,
      timeRange: timeRange || "24h",
      metrics: {
        responseTime: {
          current: 450,
          baseline: 300,
          target: 200,
          trend: "degrading",
        },
        throughput: {
          current: 120.5,
          baseline: 100,
          target: 150,
          trend: "improving",
        },
        errorRate: {
          current: 1.8,
          baseline: 2.5,
          target: 1.0,
          trend: "improving",
        },
        availability: {
          current: 99.8,
          baseline: 99.5,
          target: 99.9,
          trend: "stable",
        },
      },
      recommendations: [
        "Implement response caching to improve response times",
        "Add circuit breaker pattern for better error handling",
        "Consider horizontal scaling for increased throughput",
      ],
      lastUpdated: new Date().toISOString(),
    };

    res.json(benchmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Performance Trends
router.get("/trends/:systemId", async (req, res) => {
  try {
    const { systemId } = req.params;
    const { metricType } = req.query;
    const healthReport = await monitorIntegrationHealth();

    let trends = healthReport.performanceTrends.filter(
      (trend) => trend.systemId === systemId,
    );

    if (metricType) {
      trends = trends.filter((trend) => trend.metricType === metricType);
    }

    res.json({
      systemId,
      trends,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
