import express from "express";
import {
  getAttendanceRecords,
  getAttendanceById,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  clockIn,
  clockOut,
  getTimesheetSummaries,
  generateTimesheetSummary,
  approveTimesheet,
  getAttendanceAnalytics,
  sendLateArrivalNotification,
  sendDOHNotification,
  escalateLateArrival,
  flagAttendanceForReview,
  createStaffCategoryTimesheet,
  getStaffCategoryTimesheets,
  createEtihadVaccinationTimesheet,
  createICONTimesheet,
  createRHHCSAdminTimesheet,
  createRHHCSNurseTimesheet,
  createRHHCSSMOTimesheet,
  createRHHCSTherapistDriverTimesheet,
  getAttendanceComplianceReport,
} from "../attendance.api";

const router = express.Router();

// Attendance Records
router.get("/", async (req, res) => {
  try {
    const filters = req.query;
    const records = await getAttendanceRecords(filters);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const record = await getAttendanceById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const record = await createAttendanceRecord(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const record = await updateAttendanceRecord(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const success = await deleteAttendanceRecord(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clock In/Out
router.post("/clock-in", async (req, res) => {
  try {
    const { employee_id, location, notes } = req.body;
    const record = await clockIn(employee_id, location, notes);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/clock-out", async (req, res) => {
  try {
    const { employee_id, notes } = req.body;
    const record = await clockOut(employee_id, notes);
    if (!record) {
      return res.status(404).json({ error: "No clock-in record found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Timesheet Management
router.get("/timesheets/summaries", async (req, res) => {
  try {
    const filters = req.query;
    const summaries = await getTimesheetSummaries(filters);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/generate", async (req, res) => {
  try {
    const { employee_id, pay_period_start, pay_period_end } = req.body;
    const summary = await generateTimesheetSummary(
      employee_id,
      pay_period_start,
      pay_period_end,
    );
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/:id/approve", async (req, res) => {
  try {
    const { approved_by } = req.body;
    const timesheet = await approveTimesheet(req.params.id, approved_by);
    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }
    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staff Category Timesheets
router.get("/category-timesheets", async (req, res) => {
  try {
    const filters = req.query;
    const timesheets = await getStaffCategoryTimesheets(filters);
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/category-timesheets", async (req, res) => {
  try {
    const timesheet = await createStaffCategoryTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specialized Timesheet Systems
router.post("/timesheets/etihad-vaccination", async (req, res) => {
  try {
    const timesheet = await createEtihadVaccinationTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/icon", async (req, res) => {
  try {
    const timesheet = await createICONTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/rhhcs-admin", async (req, res) => {
  try {
    const timesheet = await createRHHCSAdminTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/rhhcs-nurse", async (req, res) => {
  try {
    const timesheet = await createRHHCSNurseTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/rhhcs-smo", async (req, res) => {
  try {
    const timesheet = await createRHHCSSMOTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/timesheets/rhhcs-therapist-driver", async (req, res) => {
  try {
    const timesheet = await createRHHCSTherapistDriverTimesheet(req.body);
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics and Reports
router.get("/analytics", async (req, res) => {
  try {
    const filters = req.query;
    const analytics = await getAttendanceAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/compliance-report", async (req, res) => {
  try {
    const filters = req.query;
    const report = await getAttendanceComplianceReport(filters);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Notification and Escalation Endpoints
router.post("/notifications/late-arrival", async (req, res) => {
  try {
    const { employee_id, late_minutes, employee_info } = req.body;
    await sendLateArrivalNotification(employee_id, late_minutes, employee_info);
    res.json({ message: "Late arrival notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/notifications/doh", async (req, res) => {
  try {
    const { employee_id, late_minutes, employee_info } = req.body;
    await sendDOHNotification(employee_id, late_minutes, employee_info);
    res.json({ message: "DOH notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/escalations/late-arrival", async (req, res) => {
  try {
    const { employee_id, late_minutes, employee_info, supervisor_id } =
      req.body;
    await escalateLateArrival(
      employee_id,
      late_minutes,
      employee_info,
      supervisor_id,
    );
    res.json({ message: "Late arrival escalated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/flag-for-review", async (req, res) => {
  try {
    const { employee_id, late_minutes } = req.body;
    await flagAttendanceForReview(employee_id, late_minutes);
    res.json({ message: "Attendance flagged for review successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
