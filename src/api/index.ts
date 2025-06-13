import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import referralRoutes from "./referral.api";
import damanAuthorizationRoutes from "./daman-authorization.api";
import icdCptCodingRoutes from "./icd-cpt-coding.api";
import attendanceRoutes from "./routes/attendance.routes";
import dailyPlanningRoutes from "./routes/daily-planning.routes";
import incidentManagementRoutes from "./routes/incident-management.routes";
import qualityManagementRoutes from "./routes/quality-management.routes";
import reportingRoutes from "./routes/reporting.routes";
import administrativeIntegrationRoutes from "./routes/administrative-integration.routes";
import nlpRoutes from "./routes/nlp.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Routes
app.use("/api/referrals", referralRoutes);
app.use("/api/authorizations/daman", damanAuthorizationRoutes);
app.use("/api/icd-cpt-coding", icdCptCodingRoutes);
app.use("/api/claims-processing", require("./claims-processing.api"));
app.use("/api/clinician-licenses", require("./clinician-licenses.api"));

// CRITICAL: Administrative module routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/daily-planning", dailyPlanningRoutes);
app.use("/api/incidents", incidentManagementRoutes);
app.use("/api/quality", qualityManagementRoutes);
app.use("/api/reporting", reportingRoutes);
app.use("/api/administrative", administrativeIntegrationRoutes);
app.use("/api/nlp", nlpRoutes);

// CRITICAL: Communication & Collaboration Systems routes
app.use("/api/communication/chat", require("./communication.api").chatAPI);
app.use("/api/communication/email", require("./communication.api").emailAPI);
app.use(
  "/api/communication/committee",
  require("./communication.api").committeeAPI,
);
app.use(
  "/api/communication/dashboard",
  require("./communication.api").dashboardAPI,
);
app.use(
  "/api/communication/governance",
  require("./communication.api").governanceAPI,
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// CRITICAL: DOH Compliance endpoint
app.get("/api/compliance/status", async (req, res) => {
  try {
    const { performRealTimeComplianceCheck } = await import(
      "./administrative-integration.api"
    );
    const complianceStatus = await performRealTimeComplianceCheck();
    res.json(complianceStatus);
  } catch (error) {
    console.error("Compliance check error:", error);
    res.status(500).json({ error: "Failed to check compliance status" });
  }
});

// CRITICAL: Emergency notification endpoint
app.post("/api/emergency/notify", async (req, res) => {
  try {
    const { incident_type, severity, description, location } = req.body;

    if (severity === "critical" || incident_type === "patient_safety") {
      // Immediate DOH notification for critical incidents
      const { createIncidentReport } = await import(
        "./incident-management.api"
      );
      const incident = await createIncidentReport({
        incident_type,
        severity,
        description,
        location,
        reported_by: req.body.reported_by || "system",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        status: "open",
        priority: "critical",
        doh_reportable: true,
        patient_safety_impact: incident_type === "patient_safety",
      });

      res.json({
        success: true,
        incident_id: incident.incident_id,
        message: "Critical incident reported and DOH notification triggered",
      });
    } else {
      res.json({ success: true, message: "Incident logged" });
    }
  } catch (error) {
    console.error("Emergency notification error:", error);
    res.status(500).json({ error: "Failed to process emergency notification" });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DOH Compliance monitoring active`);
    console.log(`Emergency notification system ready`);
  });
}

export default app;
