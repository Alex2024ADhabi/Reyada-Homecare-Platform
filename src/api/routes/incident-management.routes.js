import express from "express";
import { getIncidentReports, getIncidentById, createIncidentReport, updateIncidentReport, deleteIncidentReport, getIncidentsByStatus, getIncidentsByType, getIncidentsByDateRange, getIncidentAnalytics, sendLineManagerNotification, escalateIncident, sendDOHRegulatoryReport, processInvestigationWorkflow, getInvestigationsByIncident, createInvestigationStep, updateInvestigationStep, completeInvestigation, generateIncidentReport, getIncidentTrends, getCriticalIncidents, getOverdueIncidents, } from "../incident-management.api";
const router = express.Router();
// Incident Reports
router.get("/", async (req, res) => {
    try {
        const filters = req.query;
        const incidents = await getIncidentReports(filters);
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/critical", async (req, res) => {
    try {
        const incidents = await getCriticalIncidents();
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/overdue", async (req, res) => {
    try {
        const incidents = await getOverdueIncidents();
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/status/:status", async (req, res) => {
    try {
        const incidents = await getIncidentsByStatus(req.params.status);
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/type/:type", async (req, res) => {
    try {
        const incidents = await getIncidentsByType(req.params.type);
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/date-range", async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const incidents = await getIncidentsByDateRange(start_date, end_date);
        res.json(incidents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const incident = await getIncidentById(req.params.id);
        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }
        res.json(incident);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const incident = await createIncidentReport(req.body);
        res.status(201).json(incident);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const incident = await updateIncidentReport(req.params.id, req.body);
        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }
        res.json(incident);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const success = await deleteIncidentReport(req.params.id);
        if (!success) {
            return res.status(404).json({ error: "Incident not found" });
        }
        res.json({ message: "Incident deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: 15-Minute Line Manager Notification
router.post("/:id/notify-line-manager", async (req, res) => {
    try {
        const { severity, incident_type } = req.body;
        await sendLineManagerNotification(req.params.id, severity, incident_type);
        res.json({ message: "Line manager notification sent within 15 minutes" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: Incident Escalation
router.post("/:id/escalate", async (req, res) => {
    try {
        const { severity, escalation_reason } = req.body;
        await escalateIncident(req.params.id, severity, escalation_reason);
        res.json({ message: "Incident escalated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: DOH Regulatory Reporting
router.post("/:id/doh-report", async (req, res) => {
    try {
        const { incident_type, severity } = req.body;
        await sendDOHRegulatoryReport(req.params.id, incident_type, severity);
        res.json({ message: "DOH regulatory report submitted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Investigation Workflow
router.get("/:id/investigations", async (req, res) => {
    try {
        const investigations = await getInvestigationsByIncident(req.params.id);
        res.json(investigations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/:id/investigation", async (req, res) => {
    try {
        const investigation = await processInvestigationWorkflow(req.params.id, req.body);
        res.status(201).json(investigation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/investigation/:investigationId/step", async (req, res) => {
    try {
        const step = await createInvestigationStep(req.params.investigationId, req.body);
        res.status(201).json(step);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/investigation/step/:stepId", async (req, res) => {
    try {
        const step = await updateInvestigationStep(req.params.stepId, req.body);
        if (!step) {
            return res.status(404).json({ error: "Investigation step not found" });
        }
        res.json(step);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/investigation/:investigationId/complete", async (req, res) => {
    try {
        const { completed_by, findings, recommendations } = req.body;
        const investigation = await completeInvestigation(req.params.investigationId, completed_by, findings, recommendations);
        if (!investigation) {
            return res.status(404).json({ error: "Investigation not found" });
        }
        res.json(investigation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Reports and Analytics
router.get("/analytics/overview", async (req, res) => {
    try {
        const filters = req.query;
        const analytics = await getIncidentAnalytics(filters);
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/analytics/trends", async (req, res) => {
    try {
        const filters = req.query;
        const trends = await getIncidentTrends(filters);
        res.json(trends);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/:id/generate-report", async (req, res) => {
    try {
        const { report_type, include_investigation } = req.body;
        const report = await generateIncidentReport(req.params.id, report_type, include_investigation);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
