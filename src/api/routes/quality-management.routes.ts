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
} from "../quality-management.api";

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

export default router;
