import express from "express";
import {
  getQualityManagementRecords,
  getQualityManagementById,
  createQualityManagementRecord,
  updateQualityManagementRecord,
  getJAWDAKPIRecords,
  createJAWDAKPIRecord,
  automateKPIDataCollection,
  getComplianceMonitoringRecords,
  createComplianceMonitoringRecord,
  getAuditManagementRecords,
  createAuditManagementRecord,
  getQualityAnalytics,
  getComplianceDashboardData,
  performAutomatedComplianceCheck,
  prepareDOHAudit,
  getRealTimeComplianceScore,
  getQualityAssuranceData,
  getTestExecutionMetrics,
  getQualityGateStatus,
  getComplianceTestResults,
  getPerformanceTestMetrics,
  getQualityDashboard,
  getAdvancedPerformanceMetrics,
} from "../quality-management.api";
import { automatedTestingService } from "../../services/automated-testing.service";

const router = express.Router();

// Quality Management Records
router.get("/", async (req, res) => {
  try {
    const filters = req.query;
    const records = await getQualityManagementRecords(filters);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const record = await getQualityManagementById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ error: "Quality management record not found" });
    }
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const record = await createQualityManagementRecord(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const record = await updateQualityManagementRecord(req.params.id, req.body);
    if (!record) {
      return res
        .status(404)
        .json({ error: "Quality management record not found" });
    }
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// JAWDA KPI Management
router.get("/jawda-kpi", async (req, res) => {
  try {
    const records = await getJAWDAKPIRecords();
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/jawda-kpi", async (req, res) => {
  try {
    const record = await createJAWDAKPIRecord(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Automated KPI Data Collection
router.post("/jawda-kpi/automate", async (req, res) => {
  try {
    const kpiData = await automateKPIDataCollection(req.body);
    res.json(kpiData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance Monitoring
router.get("/compliance", async (req, res) => {
  try {
    const records = await getComplianceMonitoringRecords();
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/compliance", async (req, res) => {
  try {
    const record = await createComplianceMonitoringRecord(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Automated Compliance Checking
router.post("/compliance/automated-check", async (req, res) => {
  try {
    const { regulation_type } = req.body;
    const complianceResult =
      await performAutomatedComplianceCheck(regulation_type);
    res.json(complianceResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Real-time Compliance Scoring
router.get("/compliance/real-time-score", async (req, res) => {
  try {
    const score = await getRealTimeComplianceScore();
    res.json(score);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Management
router.get("/audits", async (req, res) => {
  try {
    const records = await getAuditManagementRecords();
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/audits", async (req, res) => {
  try {
    const record = await createAuditManagementRecord(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: DOH Audit Preparation
router.post("/audits/doh-preparation", async (req, res) => {
  try {
    const { audit_date, audit_scope } = req.body;
    const preparation = await prepareDOHAudit(audit_date, audit_scope);
    res.json(preparation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics and Dashboards
router.get("/analytics", async (req, res) => {
  try {
    const analytics = await getQualityAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/compliance/dashboard", async (req, res) => {
  try {
    const dashboard = await getComplianceDashboardData();
    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quality Assurance Integration Routes
router.get("/qa/dashboard", async (req, res) => {
  try {
    const qaData = await getQualityAssuranceData();
    res.json(qaData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/qa/test-metrics", async (req, res) => {
  try {
    const metrics = await getTestExecutionMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/qa/quality-gates", async (req, res) => {
  try {
    const gates = await getQualityGateStatus();
    res.json(gates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/qa/compliance-tests", async (req, res) => {
  try {
    const results = await getComplianceTestResults();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/qa/performance-tests", async (req, res) => {
  try {
    const metrics = await getPerformanceTestMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Load Testing & Performance Benchmarking Routes
router.post("/testing/load-test", async (req, res) => {
  try {
    const {
      maxUsers = 1000,
      duration = 1800,
      rampUpTime = 300,
      testScenario = "standard",
    } = req.body;
    const result = await triggerLoadTest({
      maxUsers,
      duration,
      rampUpTime,
      testScenario,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/testing/load-test/:testId", async (req, res) => {
  try {
    const results = await getLoadTestResults(req.params.testId);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/testing/performance-benchmarks", async (req, res) => {
  try {
    const benchmarks = await getPerformanceBenchmarks();
    res.json(benchmarks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Performance Monitoring Routes
router.get("/performance/advanced-metrics", async (req, res) => {
  try {
    const metrics = await getAdvancedPerformanceMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/performance/real-time", async (req, res) => {
  try {
    const realTimeData = await getAdvancedPerformanceMetrics();
    res.json({
      realTimeMetrics: realTimeData.realTimeMetrics,
      systemHealth: realTimeData.systemHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/performance/predictive-insights", async (req, res) => {
  try {
    const data = await getAdvancedPerformanceMetrics();
    res.json({
      insights: data.predictiveInsights,
      optimizationOpportunities: data.optimizationOpportunities,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/performance/system-health", async (req, res) => {
  try {
    const data = await getAdvancedPerformanceMetrics();
    res.json({
      systemHealth: data.systemHealth,
      overallHealth: Object.values(data.systemHealth).reduce(
        (acc: number, system: any) => {
          return (
            acc +
            (system.status === "healthy"
              ? 25
              : system.status === "degraded"
                ? 15
                : 0)
          );
        },
        0,
      ),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unified Testing Framework Routes
router.post("/testing/run-all", async (req, res) => {
  try {
    const {
      environment = "test",
      branch = "main",
      commit = "latest",
    } = req.body;
    const report = await automatedTestingService.runAllTests(
      environment,
      branch,
      commit,
    );
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/testing/status", async (req, res) => {
  try {
    const status = automatedTestingService.getTestStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/testing/metrics", async (req, res) => {
  try {
    const metrics = automatedTestingService.getTestMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/testing/latest-report", async (req, res) => {
  try {
    const report = automatedTestingService.getLatestTestReport();
    if (!report) {
      return res.status(404).json({ error: "No test reports found" });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Specialized Testing Routes
router.post("/testing/chaos", async (req, res) => {
  try {
    const results = await automatedTestingService.runChaosTests();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/testing/cross-module", async (req, res) => {
  try {
    const results = await automatedTestingService.runCrossModuleTests();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/testing/compliance", async (req, res) => {
  try {
    const results = await automatedTestingService.runComplianceTests();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/testing/performance-advanced", async (req, res) => {
  try {
    const results = await automatedTestingService.runAdvancedPerformanceTests();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/testing/ai-generate", async (req, res) => {
  try {
    const { codebase } = req.body;
    if (!codebase || !Array.isArray(codebase)) {
      return res.status(400).json({ error: "Codebase array is required" });
    }
    const results = await automatedTestingService.generateAITests(codebase);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
