import express from "express";
import { getDailyPlans, getDailyPlanById, getDailyPlanByPlanId, createDailyPlan, updateDailyPlan, deleteDailyPlan, approveDailyPlan, getDailyUpdates, createDailyUpdate, updateDailyUpdate, getPlanPerformanceAnalytics, getResourceUtilizationAnalytics, getTodaysActivePlans, validateSubmissionTime, sendLateSubmissionAlert, integratePatientPriorityClassification, checkEquipmentAvailability, optimizeResourceAllocation, getPlansRequiringAttention, getDailyPlanningComplianceReport, } from "../daily-planning.api";
const router = express.Router();
// Daily Plans
router.get("/", async (req, res) => {
    try {
        const filters = req.query;
        const plans = await getDailyPlans(filters);
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/today", async (req, res) => {
    try {
        const plans = await getTodaysActivePlans();
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/requiring-attention", async (req, res) => {
    try {
        const attention = await getPlansRequiringAttention();
        res.json(attention);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const plan = await getDailyPlanById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: "Daily plan not found" });
        }
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/plan/:planId", async (req, res) => {
    try {
        const plan = await getDailyPlanByPlanId(req.params.planId);
        if (!plan) {
            return res.status(404).json({ error: "Daily plan not found" });
        }
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const plan = await createDailyPlan(req.body);
        res.status(201).json(plan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const plan = await updateDailyPlan(req.params.id, req.body);
        if (!plan) {
            return res.status(404).json({ error: "Daily plan not found" });
        }
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const success = await deleteDailyPlan(req.params.id);
        if (!success) {
            return res.status(404).json({ error: "Daily plan not found" });
        }
        res.json({ message: "Daily plan deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/:id/approve", async (req, res) => {
    try {
        const { approved_by } = req.body;
        const plan = await approveDailyPlan(req.params.id, approved_by);
        if (!plan) {
            return res.status(404).json({ error: "Daily plan not found" });
        }
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Daily Updates
router.get("/updates/:planId?", async (req, res) => {
    try {
        const filters = req.query;
        const updates = await getDailyUpdates(req.params.planId, filters);
        res.json(updates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/updates", async (req, res) => {
    try {
        const update = await createDailyUpdate(req.body);
        res.status(201).json(update);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/updates/:id", async (req, res) => {
    try {
        const update = await updateDailyUpdate(req.params.id, req.body);
        if (!update) {
            return res.status(404).json({ error: "Daily update not found" });
        }
        res.json(update);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: 8:00 AM Submission Validation
router.post("/validate-submission-time", async (req, res) => {
    try {
        const { plan_date } = req.body;
        const validation = await validateSubmissionTime(plan_date);
        res.json(validation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/late-submission-alert", async (req, res) => {
    try {
        const { plan_date, submission_time } = req.body;
        await sendLateSubmissionAlert(plan_date, submission_time);
        res.json({ message: "Late submission alert sent successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: Patient Priority Classification Integration
router.post("/integrate-patient-priorities", async (req, res) => {
    try {
        const { patient_ids } = req.body;
        const classifications = await integratePatientPriorityClassification(patient_ids);
        res.json(classifications);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: Equipment Availability Checking
router.post("/check-equipment-availability", async (req, res) => {
    try {
        const { required_equipment, plan_date, shift } = req.body;
        const availability = await checkEquipmentAvailability(required_equipment, plan_date, shift);
        res.json(availability);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CRITICAL: Resource Optimization
router.post("/optimize-resources", async (req, res) => {
    try {
        const { staff_assigned, patient_priorities, equipment_availability } = req.body;
        const optimization = await optimizeResourceAllocation(staff_assigned, patient_priorities, equipment_availability);
        res.json(optimization);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Analytics and Reports
router.get("/analytics/performance", async (req, res) => {
    try {
        const filters = req.query;
        const analytics = await getPlanPerformanceAnalytics(filters);
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/analytics/resource-utilization", async (req, res) => {
    try {
        const filters = req.query;
        const analytics = await getResourceUtilizationAnalytics(filters);
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/compliance-report", async (req, res) => {
    try {
        const filters = req.query;
        const report = await getDailyPlanningComplianceReport(filters);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
