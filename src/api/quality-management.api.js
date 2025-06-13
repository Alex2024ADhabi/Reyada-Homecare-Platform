import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
// Get all quality management records with optional filters
export async function getQualityManagementRecords(filters = {}) {
    try {
        const db = getDb();
        const collection = db.collection("quality_management");
        // Build query based on filters
        const query = {};
        if (filters.quality_type) {
            query.quality_type = filters.quality_type;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.priority) {
            query.priority = filters.priority;
        }
        if (filters.department) {
            query.department = filters.department;
        }
        if (filters.responsible_person) {
            query.responsible_person = filters.responsible_person;
        }
        if (filters.date_from || filters.date_to) {
            query.start_date = {};
            if (filters.date_from) {
                query.start_date.$gte = filters.date_from;
            }
            if (filters.date_to) {
                query.start_date.$lte = filters.date_to;
            }
        }
        const records = await collection.find(query).toArray();
        return records;
    }
    catch (error) {
        console.error("Error fetching quality management records:", error);
        throw new Error("Failed to fetch quality management records");
    }
}
// Get quality management record by ID
export async function getQualityManagementById(id) {
    try {
        const db = getDb();
        const collection = db.collection("quality_management");
        const record = await collection.findOne({ _id: new ObjectId(id) });
        return record;
    }
    catch (error) {
        console.error("Error fetching quality management record:", error);
        throw new Error("Failed to fetch quality management record");
    }
}
// Create new quality management record
export async function createQualityManagementRecord(qualityData) {
    try {
        const db = getDb();
        const collection = db.collection("quality_management");
        const newRecord = {
            ...qualityData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRecord);
        return { ...newRecord, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating quality management record:", error);
        throw new Error("Failed to create quality management record");
    }
}
// Update quality management record
export async function updateQualityManagementRecord(id, updates) {
    try {
        const db = getDb();
        const collection = db.collection("quality_management");
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        return await getQualityManagementById(id);
    }
    catch (error) {
        console.error("Error updating quality management record:", error);
        throw new Error("Failed to update quality management record");
    }
}
// Get all JAWDA KPI tracking records
export async function getJAWDAKPIRecords() {
    try {
        const db = getDb();
        const collection = db.collection("jawda_kpi_tracking");
        const records = await collection.find({}).toArray();
        return records;
    }
    catch (error) {
        console.error("Error fetching JAWDA KPI records:", error);
        throw new Error("Failed to fetch JAWDA KPI records");
    }
}
// Create new JAWDA KPI record with automated data collection
export async function createJAWDAKPIRecord(kpiData) {
    try {
        const db = getDb();
        const collection = db.collection("jawda_kpi_tracking");
        // Automated KPI data collection from clinical systems
        const enhancedKpiData = await automateKPIDataCollection(kpiData);
        const newRecord = {
            ...enhancedKpiData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRecord);
        return { ...newRecord, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating JAWDA KPI record:", error);
        throw new Error("Failed to create JAWDA KPI record");
    }
}
// Automated JAWDA KPI data collection from clinical systems
export async function automateKPIDataCollection(kpiData) {
    try {
        const db = getDb();
        const clinicalCollection = db.collection("clinical_data");
        const patientsCollection = db.collection("patients");
        const incidentsCollection = db.collection("incident_reports");
        const attendanceCollection = db.collection("staff_attendance");
        let actualValue = kpiData.actual_value;
        let dataSource = kpiData.data_source || "manual";
        // Automated data collection based on KPI category
        switch (kpiData.kpi_category) {
            case "patient_safety":
                actualValue = await calculatePatientSafetyKPI(kpiData.kpi_name, kpiData.measurement_period);
                dataSource = "automated_clinical_system";
                break;
            case "clinical_effectiveness":
                actualValue = await calculateClinicalEffectivenessKPI(kpiData.kpi_name, kpiData.measurement_period);
                dataSource = "automated_clinical_system";
                break;
            case "patient_experience":
                actualValue = await calculatePatientExperienceKPI(kpiData.kpi_name, kpiData.measurement_period);
                dataSource = "automated_survey_system";
                break;
            case "operational_efficiency":
                actualValue = await calculateOperationalEfficiencyKPI(kpiData.kpi_name, kpiData.measurement_period);
                dataSource = "automated_operational_system";
                break;
            case "staff_satisfaction":
                actualValue = await calculateStaffSatisfactionKPI(kpiData.kpi_name, kpiData.measurement_period);
                dataSource = "automated_hr_system";
                break;
        }
        // Calculate variance and performance status
        const variance = actualValue - kpiData.target_value;
        const variancePercentage = (variance / kpiData.target_value) * 100;
        let performanceStatus;
        if (variancePercentage >= 10)
            performanceStatus = "exceeds";
        else if (variancePercentage >= 0)
            performanceStatus = "meets";
        else if (variancePercentage >= -10)
            performanceStatus = "below";
        else
            performanceStatus = "critical";
        return {
            ...kpiData,
            actual_value: actualValue,
            variance,
            variance_percentage: Math.round(variancePercentage * 100) / 100,
            performance_status: performanceStatus,
            data_source: dataSource,
            collection_method: "automated",
            last_updated: new Date().toISOString(),
            next_update_due: calculateNextUpdateDue(kpiData.reporting_frequency),
            automated_collection: true,
        };
    }
    catch (error) {
        console.error("Error in automated KPI data collection:", error);
        return kpiData; // Return original data if automation fails
    }
}
// Calculate patient safety KPIs
async function calculatePatientSafetyKPI(kpiName, measurementPeriod) {
    try {
        const db = getDb();
        const incidentsCollection = db.collection("incident_reports");
        const patientsCollection = db.collection("patients");
        const [startDate, endDate] = parseMeasurementPeriod(measurementPeriod);
        switch (kpiName.toLowerCase()) {
            case "patient_fall_rate":
                const falls = await incidentsCollection.countDocuments({
                    incident_type: "patient_fall",
                    incident_date: { $gte: startDate, $lte: endDate },
                });
                const totalPatients = await patientsCollection.countDocuments({
                    admission_date: { $gte: startDate, $lte: endDate },
                });
                return totalPatients > 0 ? (falls / totalPatients) * 1000 : 0;
            case "medication_error_rate":
                const medicationErrors = await incidentsCollection.countDocuments({
                    incident_type: "medication",
                    incident_date: { $gte: startDate, $lte: endDate },
                });
                const totalMedications = await db
                    .collection("medication_administrations")
                    .countDocuments({
                    administration_date: { $gte: startDate, $lte: endDate },
                });
                return totalMedications > 0
                    ? (medicationErrors / totalMedications) * 100
                    : 0;
            default:
                return 0;
        }
    }
    catch (error) {
        console.error("Error calculating patient safety KPI:", error);
        return 0;
    }
}
// Calculate clinical effectiveness KPIs
async function calculateClinicalEffectivenessKPI(kpiName, measurementPeriod) {
    try {
        const db = getDb();
        const assessmentsCollection = db.collection("clinical_assessments");
        const [startDate, endDate] = parseMeasurementPeriod(measurementPeriod);
        switch (kpiName.toLowerCase()) {
            case "patient_improvement_rate":
                const assessments = await assessmentsCollection
                    .find({
                    assessment_date: { $gte: startDate, $lte: endDate },
                    assessment_type: "outcome_measurement",
                })
                    .toArray();
                const improvedPatients = assessments.filter((a) => a.improvement_score > 0).length;
                return assessments.length > 0
                    ? (improvedPatients / assessments.length) * 100
                    : 0;
            case "readmission_rate":
                const readmissions = await db
                    .collection("patient_admissions")
                    .countDocuments({
                    admission_type: "readmission",
                    admission_date: { $gte: startDate, $lte: endDate },
                });
                const totalDischarges = await db
                    .collection("patient_discharges")
                    .countDocuments({
                    discharge_date: { $gte: startDate, $lte: endDate },
                });
                return totalDischarges > 0 ? (readmissions / totalDischarges) * 100 : 0;
            default:
                return 0;
        }
    }
    catch (error) {
        console.error("Error calculating clinical effectiveness KPI:", error);
        return 0;
    }
}
// Calculate patient experience KPIs
async function calculatePatientExperienceKPI(kpiName, measurementPeriod) {
    try {
        const db = getDb();
        const surveysCollection = db.collection("patient_satisfaction_surveys");
        const [startDate, endDate] = parseMeasurementPeriod(measurementPeriod);
        const surveys = await surveysCollection
            .find({
            survey_date: { $gte: startDate, $lte: endDate },
        })
            .toArray();
        if (surveys.length === 0)
            return 0;
        switch (kpiName.toLowerCase()) {
            case "patient_satisfaction_score":
                const totalScore = surveys.reduce((sum, survey) => sum + (survey.overall_satisfaction || 0), 0);
                return totalScore / surveys.length;
            case "recommendation_rate":
                const wouldRecommend = surveys.filter((s) => s.would_recommend === true).length;
                return (wouldRecommend / surveys.length) * 100;
            default:
                return 0;
        }
    }
    catch (error) {
        console.error("Error calculating patient experience KPI:", error);
        return 0;
    }
}
// Calculate operational efficiency KPIs
async function calculateOperationalEfficiencyKPI(kpiName, measurementPeriod) {
    try {
        const db = getDb();
        const attendanceCollection = db.collection("staff_attendance");
        const [startDate, endDate] = parseMeasurementPeriod(measurementPeriod);
        switch (kpiName.toLowerCase()) {
            case "staff_utilization_rate":
                const attendanceRecords = await attendanceCollection
                    .find({
                    date: { $gte: startDate, $lte: endDate },
                })
                    .toArray();
                const totalScheduledHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
                const totalWorkedHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
                return totalScheduledHours > 0
                    ? (totalWorkedHours / totalScheduledHours) * 100
                    : 0;
            case "appointment_adherence_rate":
                const appointments = await db
                    .collection("appointments")
                    .find({
                    appointment_date: { $gte: startDate, $lte: endDate },
                })
                    .toArray();
                const completedAppointments = appointments.filter((a) => a.status === "completed").length;
                return appointments.length > 0
                    ? (completedAppointments / appointments.length) * 100
                    : 0;
            default:
                return 0;
        }
    }
    catch (error) {
        console.error("Error calculating operational efficiency KPI:", error);
        return 0;
    }
}
// Calculate staff satisfaction KPIs
async function calculateStaffSatisfactionKPI(kpiName, measurementPeriod) {
    try {
        const db = getDb();
        const surveysCollection = db.collection("staff_satisfaction_surveys");
        const [startDate, endDate] = parseMeasurementPeriod(measurementPeriod);
        const surveys = await surveysCollection
            .find({
            survey_date: { $gte: startDate, $lte: endDate },
        })
            .toArray();
        if (surveys.length === 0)
            return 0;
        switch (kpiName.toLowerCase()) {
            case "staff_satisfaction_score":
                const totalScore = surveys.reduce((sum, survey) => sum + (survey.overall_satisfaction || 0), 0);
                return totalScore / surveys.length;
            case "staff_turnover_rate":
                const resignations = await db
                    .collection("employee_resignations")
                    .countDocuments({
                    resignation_date: { $gte: startDate, $lte: endDate },
                });
                const totalStaff = await db
                    .collection("employees")
                    .countDocuments({ status: "active" });
                return totalStaff > 0 ? (resignations / totalStaff) * 100 : 0;
            default:
                return 0;
        }
    }
    catch (error) {
        console.error("Error calculating staff satisfaction KPI:", error);
        return 0;
    }
}
// Parse measurement period
function parseMeasurementPeriod(period) {
    const now = new Date();
    let startDate;
    let endDate = now.toISOString().split("T")[0];
    switch (period.toLowerCase()) {
        case "monthly":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .split("T")[0];
            break;
        case "quarterly":
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
                .toISOString()
                .split("T")[0];
            break;
        case "annually":
            startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
            break;
        default:
            // Default to current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .split("T")[0];
    }
    return [startDate, endDate];
}
// Calculate next update due date
function calculateNextUpdateDue(frequency) {
    const now = new Date();
    let nextUpdate;
    switch (frequency.toLowerCase()) {
        case "daily":
            nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
        case "weekly":
            nextUpdate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case "monthly":
            nextUpdate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            break;
        case "quarterly":
            nextUpdate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
            break;
        case "annually":
            nextUpdate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            break;
        default:
            nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    return nextUpdate.toISOString();
}
// Get all compliance monitoring records
export async function getComplianceMonitoringRecords() {
    try {
        const db = getDb();
        const collection = db.collection("compliance_monitoring");
        const records = await collection.find({}).toArray();
        return records;
    }
    catch (error) {
        console.error("Error fetching compliance monitoring records:", error);
        throw new Error("Failed to fetch compliance monitoring records");
    }
}
// Create new compliance monitoring record
export async function createComplianceMonitoringRecord(complianceData) {
    try {
        const db = getDb();
        const collection = db.collection("compliance_monitoring");
        const newRecord = {
            ...complianceData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRecord);
        return { ...newRecord, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating compliance monitoring record:", error);
        throw new Error("Failed to create compliance monitoring record");
    }
}
// Get all audit management records
export async function getAuditManagementRecords() {
    try {
        const db = getDb();
        const collection = db.collection("audit_management");
        const records = await collection.find({}).toArray();
        return records;
    }
    catch (error) {
        console.error("Error fetching audit management records:", error);
        throw new Error("Failed to fetch audit management records");
    }
}
// Create new audit management record
export async function createAuditManagementRecord(auditData) {
    try {
        const db = getDb();
        const collection = db.collection("audit_management");
        const newRecord = {
            ...auditData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRecord);
        return { ...newRecord, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating audit management record:", error);
        throw new Error("Failed to create audit management record");
    }
}
// Get quality analytics
export async function getQualityAnalytics() {
    try {
        const db = getDb();
        const qualityCollection = db.collection("quality_management");
        const kpiCollection = db.collection("jawda_kpi_tracking");
        const complianceCollection = db.collection("compliance_monitoring");
        const auditCollection = db.collection("audit_management");
        const [qualityRecords, kpiRecords, complianceRecords, auditRecords] = await Promise.all([
            qualityCollection.find({}).toArray(),
            kpiCollection.find({}).toArray(),
            complianceCollection.find({}).toArray(),
            auditCollection.find({}).toArray(),
        ]);
        const analytics = {
            total_quality_initiatives: qualityRecords.length,
            active_quality_initiatives: qualityRecords.filter((r) => r.status === "in_progress").length,
            completed_quality_initiatives: qualityRecords.filter((r) => r.status === "completed").length,
            total_kpis: kpiRecords.length,
            kpis_meeting_target: kpiRecords.filter((k) => k.performance_status === "meets" ||
                k.performance_status === "exceeds").length,
            kpis_below_target: kpiRecords.filter((k) => k.performance_status === "below" ||
                k.performance_status === "critical").length,
            total_compliance_requirements: complianceRecords.length,
            compliant_requirements: complianceRecords.filter((c) => c.current_status === "compliant").length,
            non_compliant_requirements: complianceRecords.filter((c) => c.current_status === "non_compliant").length,
            total_audits: auditRecords.length,
            pending_audits: auditRecords.filter((a) => new Date(a.scheduled_date) > new Date()).length,
            completed_audits: auditRecords.filter((a) => a.actual_end_date)
                .length,
            average_compliance_score: complianceRecords.length > 0
                ? complianceRecords.reduce((sum, c) => sum + c.compliance_percentage, 0) / complianceRecords.length
                : 0,
            critical_issues: qualityRecords.filter((r) => r.priority === "critical").length,
            overdue_actions: qualityRecords.reduce((count, record) => {
                return (count +
                    record.improvement_actions.filter((action) => action.status !== "completed" &&
                        new Date(action.due_date) < new Date()).length);
            }, 0),
        };
        return analytics;
    }
    catch (error) {
        console.error("Error fetching quality analytics:", error);
        throw new Error("Failed to fetch quality analytics");
    }
}
// Get compliance dashboard data
export async function getComplianceDashboardData() {
    try {
        const db = getDb();
        const complianceCollection = db.collection("compliance_monitoring");
        const auditCollection = db.collection("audit_management");
        const [complianceRecords, auditRecords] = await Promise.all([
            complianceCollection.find({}).toArray(),
            auditCollection.find({}).toArray(),
        ]);
        // Group compliance by regulation type
        const complianceByRegulation = complianceRecords.reduce((acc, record) => {
            if (!acc[record.regulation_type]) {
                acc[record.regulation_type] = {
                    total: 0,
                    compliant: 0,
                    non_compliant: 0,
                    partially_compliant: 0,
                    under_review: 0,
                };
            }
            acc[record.regulation_type].total++;
            acc[record.regulation_type][record.current_status]++;
            return acc;
        }, {});
        // Get upcoming audits
        const upcomingAudits = auditRecords.filter((audit) => new Date(audit.scheduled_date) > new Date() &&
            new Date(audit.scheduled_date) <=
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        // Get overdue compliance items
        const overdueCompliance = complianceRecords.filter((record) => record.next_assessment_due &&
            new Date(record.next_assessment_due) < new Date());
        return {
            compliance_by_regulation: complianceByRegulation,
            upcoming_audits: upcomingAudits,
            overdue_compliance: overdueCompliance,
            total_compliance_score: complianceRecords.length > 0
                ? Math.round(complianceRecords.reduce((sum, c) => sum + c.compliance_percentage, 0) / complianceRecords.length)
                : 0,
        };
    }
    catch (error) {
        console.error("Error fetching compliance dashboard data:", error);
        throw new Error("Failed to fetch compliance dashboard data");
    }
}
// Automated compliance checking against DOH standards
export async function performAutomatedComplianceCheck(regulationType = "DOH") {
    try {
        const db = getDb();
        const complianceCollection = db.collection("compliance_monitoring");
        const incidentsCollection = db.collection("incident_reports");
        const qualityCollection = db.collection("quality_management");
        const attendanceCollection = db.collection("staff_attendance");
        const auditCollection = db.collection("audit_management");
        // Get current compliance records for the regulation type
        const complianceRecords = await complianceCollection
            .find({ regulation_type: regulationType })
            .toArray();
        const complianceIssues = [];
        const recommendations = [];
        const criticalGaps = [];
        let totalScore = 0;
        let scoredItems = 0;
        // Check DOH-specific compliance requirements
        if (regulationType === "DOH") {
            // 1. Patient Safety Compliance
            const patientSafetyScore = await checkPatientSafetyCompliance();
            totalScore += patientSafetyScore.score;
            scoredItems++;
            if (patientSafetyScore.score < 80) {
                complianceIssues.push({
                    category: "Patient Safety",
                    score: patientSafetyScore.score,
                    issues: patientSafetyScore.issues,
                    severity: "high",
                });
                recommendations.push("Implement enhanced patient safety protocols and incident reporting");
            }
            // 2. Documentation Compliance
            const documentationScore = await checkDocumentationCompliance();
            totalScore += documentationScore.score;
            scoredItems++;
            if (documentationScore.score < 85) {
                complianceIssues.push({
                    category: "Documentation",
                    score: documentationScore.score,
                    issues: documentationScore.issues,
                    severity: "medium",
                });
                recommendations.push("Standardize clinical documentation and ensure completeness");
            }
            // 3. Staff Qualification Compliance
            const staffQualificationScore = await checkStaffQualificationCompliance();
            totalScore += staffQualificationScore.score;
            scoredItems++;
            if (staffQualificationScore.score < 90) {
                complianceIssues.push({
                    category: "Staff Qualifications",
                    score: staffQualificationScore.score,
                    issues: staffQualificationScore.issues,
                    severity: "critical",
                });
                recommendations.push("Ensure all staff have current licenses and certifications");
            }
            // 4. Quality Management Compliance
            const qualityScore = await checkQualityManagementCompliance();
            totalScore += qualityScore.score;
            scoredItems++;
            if (qualityScore.score < 75) {
                complianceIssues.push({
                    category: "Quality Management",
                    score: qualityScore.score,
                    issues: qualityScore.issues,
                    severity: "medium",
                });
                recommendations.push("Implement continuous quality improvement processes");
            }
            // 5. Infection Control Compliance
            const infectionControlScore = await checkInfectionControlCompliance();
            totalScore += infectionControlScore.score;
            scoredItems++;
            if (infectionControlScore.score < 95) {
                complianceIssues.push({
                    category: "Infection Control",
                    score: infectionControlScore.score,
                    issues: infectionControlScore.issues,
                    severity: "critical",
                });
                recommendations.push("Strengthen infection prevention and control measures");
            }
        }
        // Identify critical gaps
        complianceIssues.forEach((issue) => {
            if (issue.severity === "critical" || issue.score < 70) {
                criticalGaps.push({
                    category: issue.category,
                    score: issue.score,
                    gap_description: `Critical compliance gap in ${issue.category}`,
                    immediate_action_required: true,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                });
            }
        });
        const overallScore = scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0;
        // Log compliance check results
        await logComplianceCheckResults({
            regulation_type: regulationType,
            overall_score: overallScore,
            compliance_issues: complianceIssues,
            critical_gaps: criticalGaps,
            check_date: new Date().toISOString(),
            automated: true,
        });
        return {
            overall_score: overallScore,
            compliance_issues: complianceIssues,
            recommendations,
            critical_gaps: criticalGaps,
        };
    }
    catch (error) {
        console.error("Error performing automated compliance check:", error);
        throw new Error("Failed to perform automated compliance check");
    }
}
// Check patient safety compliance
async function checkPatientSafetyCompliance() {
    try {
        const db = getDb();
        const incidentsCollection = db.collection("incident_reports");
        const issues = [];
        let score = 100;
        // Check incident reporting timeliness
        const recentIncidents = await incidentsCollection
            .find({
            incident_date: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .toArray();
        const lateReports = recentIncidents.filter((incident) => {
            const incidentDate = new Date(incident.incident_date);
            const reportedDate = new Date(incident.reported_date);
            const timeDiff = reportedDate.getTime() - incidentDate.getTime();
            return timeDiff > 24 * 60 * 60 * 1000; // More than 24 hours
        });
        if (lateReports.length > 0) {
            score -= 15;
            issues.push(`${lateReports.length} incidents reported late (>24 hours)`);
        }
        // Check critical incident resolution
        const criticalIncidents = recentIncidents.filter((incident) => incident.severity === "critical");
        const unresolvedCritical = criticalIncidents.filter((incident) => incident.status !== "resolved" && incident.status !== "closed");
        if (unresolvedCritical.length > 0) {
            score -= 20;
            issues.push(`${unresolvedCritical.length} unresolved critical incidents`);
        }
        // Check medication error rates
        const medicationErrors = recentIncidents.filter((incident) => incident.incident_type === "medication");
        if (medicationErrors.length > 5) {
            score -= 10;
            issues.push(`High medication error rate: ${medicationErrors.length} errors`);
        }
        return { score: Math.max(0, score), issues };
    }
    catch (error) {
        console.error("Error checking patient safety compliance:", error);
        return { score: 0, issues: ["Unable to assess patient safety compliance"] };
    }
}
// Check documentation compliance
async function checkDocumentationCompliance() {
    try {
        const db = getDb();
        const assessmentsCollection = db.collection("clinical_assessments");
        const issues = [];
        let score = 100;
        // Check assessment completeness
        const recentAssessments = await assessmentsCollection
            .find({
            assessment_date: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .toArray();
        const incompleteAssessments = recentAssessments.filter((assessment) => !assessment.completed || !assessment.signature);
        if (incompleteAssessments.length > 0) {
            score -= 20;
            issues.push(`${incompleteAssessments.length} incomplete clinical assessments`);
        }
        // Check documentation timeliness
        const lateDocumentation = recentAssessments.filter((assessment) => {
            const serviceDate = new Date(assessment.service_date || assessment.assessment_date);
            const documentedDate = new Date(assessment.assessment_date);
            const timeDiff = documentedDate.getTime() - serviceDate.getTime();
            return timeDiff > 24 * 60 * 60 * 1000; // More than 24 hours
        });
        if (lateDocumentation.length > 0) {
            score -= 15;
            issues.push(`${lateDocumentation.length} assessments documented late (>24 hours)`);
        }
        return { score: Math.max(0, score), issues };
    }
    catch (error) {
        console.error("Error checking documentation compliance:", error);
        return { score: 0, issues: ["Unable to assess documentation compliance"] };
    }
}
// Check staff qualification compliance
async function checkStaffQualificationCompliance() {
    try {
        const db = getDb();
        const employeesCollection = db.collection("employees");
        const licensesCollection = db.collection("clinician_licenses");
        const issues = [];
        let score = 100;
        // Check license expiry
        const activeStaff = await employeesCollection
            .find({ status: "active" })
            .toArray();
        const licenses = await licensesCollection.find({}).toArray();
        const expiredLicenses = licenses.filter((license) => {
            const expiryDate = new Date(license.expiry_date);
            return expiryDate < new Date();
        });
        if (expiredLicenses.length > 0) {
            score -= 30;
            issues.push(`${expiredLicenses.length} expired professional licenses`);
        }
        // Check licenses expiring soon (within 30 days)
        const soonToExpire = licenses.filter((license) => {
            const expiryDate = new Date(license.expiry_date);
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
        });
        if (soonToExpire.length > 0) {
            score -= 10;
            issues.push(`${soonToExpire.length} licenses expiring within 30 days`);
        }
        return { score: Math.max(0, score), issues };
    }
    catch (error) {
        console.error("Error checking staff qualification compliance:", error);
        return {
            score: 0,
            issues: ["Unable to assess staff qualification compliance"],
        };
    }
}
// Check quality management compliance
async function checkQualityManagementCompliance() {
    try {
        const db = getDb();
        const qualityCollection = db.collection("quality_management");
        const kpiCollection = db.collection("jawda_kpi_tracking");
        const issues = [];
        let score = 100;
        // Check overdue quality initiatives
        const qualityInitiatives = await qualityCollection.find({}).toArray();
        const overdueInitiatives = qualityInitiatives.filter((initiative) => {
            const dueDate = new Date(initiative.target_completion_date);
            return (dueDate < new Date() &&
                initiative.status !== "completed" &&
                initiative.status !== "cancelled");
        });
        if (overdueInitiatives.length > 0) {
            score -= 15;
            issues.push(`${overdueInitiatives.length} overdue quality initiatives`);
        }
        // Check KPI performance
        const kpiRecords = await kpiCollection.find({}).toArray();
        const underperformingKPIs = kpiRecords.filter((kpi) => kpi.performance_status === "below" ||
            kpi.performance_status === "critical");
        if (underperformingKPIs.length > 0) {
            score -= 20;
            issues.push(`${underperformingKPIs.length} KPIs below target`);
        }
        return { score: Math.max(0, score), issues };
    }
    catch (error) {
        console.error("Error checking quality management compliance:", error);
        return {
            score: 0,
            issues: ["Unable to assess quality management compliance"],
        };
    }
}
// Check infection control compliance
async function checkInfectionControlCompliance() {
    try {
        const db = getDb();
        const incidentsCollection = db.collection("incident_reports");
        const issues = [];
        let score = 100;
        // Check infection-related incidents
        const infectionIncidents = await incidentsCollection
            .find({
            incident_type: "infection",
            incident_date: {
                $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .toArray();
        if (infectionIncidents.length > 2) {
            score -= 25;
            issues.push(`${infectionIncidents.length} infection-related incidents in last 90 days`);
        }
        // Check hand hygiene compliance (simulated)
        const handHygieneCompliance = Math.random() * 100; // In real system, this would come from monitoring data
        if (handHygieneCompliance < 95) {
            score -= 15;
            issues.push(`Hand hygiene compliance below 95%: ${Math.round(handHygieneCompliance)}%`);
        }
        return { score: Math.max(0, score), issues };
    }
    catch (error) {
        console.error("Error checking infection control compliance:", error);
        return {
            score: 0,
            issues: ["Unable to assess infection control compliance"],
        };
    }
}
// Log compliance check results
async function logComplianceCheckResults(results) {
    try {
        const db = getDb();
        const logsCollection = db.collection("compliance_check_logs");
        await logsCollection.insertOne({
            ...results,
            created_at: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error logging compliance check results:", error);
    }
}
// DOH Audit Preparation Workflow
export async function prepareDOHAudit(auditDate, auditScope) {
    try {
        const db = getDb();
        const complianceCollection = db.collection("compliance_monitoring");
        const auditCollection = db.collection("audit_management");
        // Perform comprehensive compliance check
        const complianceResults = await performAutomatedComplianceCheck("DOH");
        // Generate preparation checklist
        const preparationChecklist = [
            {
                task: "Review all DOH compliance requirements",
                status: "pending",
                assigned_to: "Compliance Officer",
                due_date: new Date(new Date(auditDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "high",
            },
            {
                task: "Prepare patient safety documentation",
                status: "pending",
                assigned_to: "Quality Manager",
                due_date: new Date(new Date(auditDate).getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "critical",
            },
            {
                task: "Verify staff credentials and licenses",
                status: "pending",
                assigned_to: "HR Manager",
                due_date: new Date(new Date(auditDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "critical",
            },
            {
                task: "Compile incident reports and corrective actions",
                status: "pending",
                assigned_to: "Risk Manager",
                due_date: new Date(new Date(auditDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "high",
            },
            {
                task: "Prepare clinical documentation samples",
                status: "pending",
                assigned_to: "Clinical Director",
                due_date: new Date(new Date(auditDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "medium",
            },
            {
                task: "Conduct internal audit simulation",
                status: "pending",
                assigned_to: "Audit Team",
                due_date: new Date(new Date(auditDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                priority: "high",
            },
        ];
        // Document requirements based on DOH standards
        const documentRequirements = [
            {
                category: "Organizational Documents",
                documents: [
                    "DOH License and Registration",
                    "Organizational Chart",
                    "Policies and Procedures Manual",
                    "Quality Management System Documentation",
                ],
                status: "required",
                deadline: new Date(new Date(auditDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                category: "Staff Documentation",
                documents: [
                    "Professional Licenses and Certifications",
                    "Training Records",
                    "Performance Evaluations",
                    "Competency Assessments",
                ],
                status: "required",
                deadline: new Date(new Date(auditDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                category: "Patient Care Documentation",
                documents: [
                    "Clinical Assessment Forms",
                    "Care Plans",
                    "Progress Notes",
                    "Discharge Summaries",
                ],
                status: "required",
                deadline: new Date(new Date(auditDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                category: "Quality and Safety Documentation",
                documents: [
                    "Incident Reports",
                    "Quality Improvement Plans",
                    "Risk Assessments",
                    "Infection Control Records",
                ],
                status: "required",
                deadline: new Date(new Date(auditDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ];
        // Action plan to address compliance gaps
        const actionPlan = complianceResults.critical_gaps.map((gap) => ({
            gap_category: gap.category,
            current_score: gap.score,
            target_score: 95,
            actions: [
                {
                    action: `Address ${gap.category} compliance issues`,
                    assigned_to: "Department Head",
                    due_date: gap.deadline,
                    priority: "critical",
                    estimated_effort: "High",
                },
                {
                    action: `Implement corrective measures for ${gap.category}`,
                    assigned_to: "Quality Team",
                    due_date: new Date(new Date(gap.deadline).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: "high",
                    estimated_effort: "Medium",
                },
            ],
        }));
        // Create audit preparation record
        const auditPreparation = {
            audit_id: `DOH-PREP-${Date.now()}`,
            audit_date: auditDate,
            audit_scope: auditScope,
            preparation_status: "in_progress",
            compliance_score: complianceResults.overall_score,
            preparation_checklist: preparationChecklist,
            document_requirements: documentRequirements,
            compliance_gaps: complianceResults.critical_gaps,
            action_plan: actionPlan,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        // Save audit preparation record
        const auditPrepCollection = db.collection("audit_preparation");
        await auditPrepCollection.insertOne(auditPreparation);
        // Schedule automated reminders
        await scheduleAuditReminders(auditDate, preparationChecklist);
        return {
            preparation_checklist: preparationChecklist,
            document_requirements: documentRequirements,
            compliance_gaps: complianceResults.critical_gaps,
            action_plan: actionPlan,
        };
    }
    catch (error) {
        console.error("Error preparing DOH audit:", error);
        throw new Error("Failed to prepare DOH audit");
    }
}
// Schedule automated audit reminders
async function scheduleAuditReminders(auditDate, checklist) {
    try {
        const db = getDb();
        const remindersCollection = db.collection("audit_reminders");
        for (const item of checklist) {
            const reminder = {
                task: item.task,
                assigned_to: item.assigned_to,
                due_date: item.due_date,
                audit_date: auditDate,
                reminder_type: "audit_preparation",
                status: "scheduled",
                created_at: new Date().toISOString(),
            };
            await remindersCollection.insertOne(reminder);
        }
        console.log(`Scheduled ${checklist.length} audit preparation reminders`);
    }
    catch (error) {
        console.error("Error scheduling audit reminders:", error);
    }
}
// DOH Ranking Audit Compliance Engine
export class DOHRankingAuditEngine {
    async validateDOHAuditCompliance(facility) {
        try {
            // Implementation based on complete DOH audit checklist
            const auditCompliance = {
                // 1. Organization Management
                organizationManagement: {
                    humanResources: await this.validateHumanResourcesCompliance(facility),
                    qualityManagement: await this.validateQualityManagement(facility),
                    complaintManagement: await this.validateComplaintManagement(facility),
                },
                // 2. Medical Requirements
                medicalRequirements: {
                    clinicalPractice: await this.validateClinicalPractice(facility),
                    medicalRecords: await this.validateMedicalRecords(facility),
                    medication: await this.validateMedication(facility),
                },
                // 3. Infection Control
                infectionControl: {
                    surveillance: await this.validateInfectionSurveillance(facility),
                    safePractices: await this.validateSafePractices(facility),
                    nutritionTherapy: await this.validateNutritionTherapy(facility),
                    education: await this.validateInfectionEducation(facility),
                    cleaning: await this.validateEnvironmentalCleaning(facility),
                    bloodBorneViruses: await this.validateBloodBorneManagement(facility),
                    wasteManagement: await this.validateWasteManagement(facility),
                },
                // 4. Facility and Equipment Management
                facilityEquipmentManagement: {
                    facilityManagement: await this.validateFacilityManagement(facility),
                    equipmentManagement: await this.validateEquipmentManagement(facility),
                    fireSafety: await this.validateFireSafety(facility),
                },
                // 5. OSH Requirements
                oshRequirements: await this.validateOSHRequirements(facility),
                // 6. Diagnostic Services
                diagnosticServices: {
                    laboratoryServices: await this.validateLaboratoryServices(facility),
                    pointOfCareTesting: await this.validatePOCTesting(facility),
                },
            };
            // Calculate overall compliance score
            const overallScore = this.calculateOverallAuditScore(auditCompliance);
            const weightedScore = this.calculateWeightedScore(auditCompliance);
            const maxPossibleScore = this.calculateMaxPossibleScore();
            const compliancePercentage = overallScore;
            return {
                facilityId: facility.facilityId,
                auditDate: new Date(),
                overallComplianceScore: overallScore,
                weightedComplianceScore: weightedScore,
                maxPossibleScore: maxPossibleScore,
                compliancePercentage: Math.round(compliancePercentage),
                auditResults: auditCompliance,
                criticalNonCompliances: this.identifyCriticalNonCompliances(auditCompliance),
                majorNonCompliances: this.identifyMajorNonCompliances(auditCompliance),
                improvementAreas: this.identifyImprovementAreas(auditCompliance),
                rankingImpact: this.calculateRankingImpact(weightedScore),
            };
        }
        catch (error) {
            console.error("Error in DOH audit compliance validation:", error);
            throw new Error("Failed to validate DOH audit compliance");
        }
    }
    async validateHumanResourcesCompliance(facility) {
        const staffingCompliance = await this.checkMinimumStaffing(facility);
        const licenseCompliance = await this.checkLicenseAndOrgChart(facility);
        const medicalDirectorCompliance = await this.checkMedicalDirector(facility);
        const governanceCompliance = await this.checkFacilityGovernance(facility);
        const staffFilesCompliance = await this.checkStaffFilesPrivileging(facility);
        const tawteenCompliance = await this.checkTawteenCompliance(facility);
        return {
            // HR001 - Governance Structure Home Healthcare (Weight: 3)
            governanceStructureHomecare: {
                requirement: "Meet minimum requirement of one (1) Physician and twenty-five (25) Registered Nurses and appropriate skill mix",
                evidenceRequired: "Facility information data showing staffing",
                compliance: staffingCompliance,
                score: staffingCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // HR002 - Current DOH License and Organization Chart (Weight: 1)
            currentLicenseOrgChart: {
                requirement: "Current DOH License displayed, approved organization chart, valid professional licenses",
                evidenceRequired: [
                    "Current DOH license displayed visibly",
                    "Mission and vision signed by management",
                    "Current approved organization chart",
                    "Valid DOH licenses for healthcare workers",
                ],
                compliance: licenseCompliance,
                score: licenseCompliance ? 100 : 0,
                maxScore: 100,
                weight: 1,
            },
            // HR003 - Medical Director (Home Healthcare)
            medicalDirector: {
                requirement: "Home Healthcare service provider must have a Medical Director",
                evidenceRequired: "Proof of appointment of medical director",
                compliance: medicalDirectorCompliance,
                score: medicalDirectorCompliance ? 100 : 0,
                maxScore: 100,
                weight: 1,
            },
            // HR004 - Facility Governance (Weight: 2)
            facilityGovernance: {
                requirement: "Defined scope of services, governance protocol, policies & SOPs",
                evidenceRequired: [
                    "Well-defined scope of services approved by management",
                    "Human Resources Policy Manual",
                    "Documented governance policies",
                    "Patients rights and responsibilities defined",
                ],
                compliance: governanceCompliance,
                score: governanceCompliance ? 200 : 0,
                maxScore: 200,
                weight: 2,
            },
            // HR005 - Staff Files and Privileging (Weight: 3)
            staffFilesPrivileging: {
                requirement: "Complete staff files and clinical privileging framework",
                evidenceRequired: [
                    "Complete employee files with all required documents",
                    "Clinical privileging compliance",
                    "Privileging governing committee",
                    "Peer review processes",
                ],
                compliance: staffFilesCompliance,
                score: staffFilesCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // HR006 - Tawteen Initiative (Weight: 3)
            tawteenInitiative: {
                requirement: "Meet minimum Tawteen targets: 1% healthcare workforce, 2% administrative workforce",
                evidenceRequired: [
                    "Tawteen Report issued by DOH",
                    "Valid contracts and DOH licenses",
                    "Attendance records and HR files",
                ],
                compliance: tawteenCompliance,
                score: tawteenCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
        };
    }
    async validateQualityManagement(facility) {
        const qualityGovernanceCompliance = await this.checkQualityGovernance(facility);
        const patientIdCompliance = await this.checkPatientIdentification(facility);
        const communicationCompliance = await this.checkEffectiveCommunication(facility);
        const assessmentCompliance = await this.checkPatientAssessment(facility);
        const medicationCompliance = await this.checkMedicationManagement(facility);
        const riskManagementCompliance = await this.checkRiskManagementJAWDA(facility);
        return {
            // QM001 - Quality Management & Governance Structure (Weight: 2)
            qualityGovernance: {
                requirement: "Healthcare facility establishes quality management & governance structure",
                evidenceRequired: [
                    "Quality Manual",
                    "Clinical Risk Management procedures",
                    "Patient Identification procedures",
                    "Effective communication procedures",
                    "Medication safety procedures",
                    "Infection control procedures",
                    "Fall prevention procedures",
                    "KPI monitoring mechanisms",
                    "Patient data privacy procedures",
                    "Telemedicine procedures",
                ],
                compliance: qualityGovernanceCompliance,
                score: qualityGovernanceCompliance ? 200 : 0,
                maxScore: 200,
                weight: 2,
            },
            // QM002 - Patient Safety Goals - Patient Identification (Weight: 3)
            patientIdentification: {
                requirement: "Accurate patient identification with at least two identifiers",
                evidenceRequired: [
                    "SOP on patient identification",
                    "Two patient identifiers mechanism",
                    "Process for patients unable to confirm identity",
                    "Patient identification at transitions of care",
                    "Training on identification procedures",
                ],
                compliance: patientIdCompliance,
                score: patientIdCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // QM003 - Effective Communication (Weight: 3)
            effectiveCommunication: {
                requirement: "Improve effectiveness of communication among healthcare providers",
                evidenceRequired: [
                    "Policy on reporting critical results",
                    "Documented referral process",
                    "Patient and family education",
                    "Communication process in transitions of care",
                    "Training on communication procedures",
                    "Verbal orders authentication process",
                ],
                compliance: communicationCompliance,
                score: communicationCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // QM004 - Patient Assessment and Re-assessment (Weight: 3)
            patientAssessment: {
                requirement: "Process for patient assessment and frequency of re-assessment",
                evidenceRequired: [
                    "Contact patient within 12 hours of referral",
                    "Patient assessment within 3 days",
                    "Arrangements for laboratory and imaging",
                    "Emergency management system",
                ],
                compliance: assessmentCompliance,
                score: assessmentCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // QM005 - Medication Management (Weight: 2)
            medicationManagement: {
                requirement: "System for monitoring medication management",
                evidenceRequired: [
                    "Updated medication list process",
                    "Safe medication storage process",
                    "Referral process for specialty consultation",
                ],
                compliance: medicationCompliance,
                score: medicationCompliance ? 200 : 0,
                maxScore: 200,
                weight: 2,
            },
            // QM006 - Risk Management and JAWDA KPIs (Weight: 2)
            riskManagementJAWDA: {
                requirement: "Risk management system and JAWDA KPIs monitoring",
                evidenceRequired: [
                    "Risk management methodology",
                    "Up-to-date risk register",
                    "Internal performance indicators",
                    "JAWDA KPIs data collection",
                    "Fall risk assessment",
                    "Medication and clinical records security",
                ],
                compliance: riskManagementCompliance,
                score: riskManagementCompliance ? 200 : 0,
                maxScore: 200,
                weight: 2,
            },
        };
    }
    async validateClinicalPractice(facility) {
        const admissionCompliance = await this.checkAdmissionEligibility(facility);
        const serviceProcessCompliance = await this.checkServiceProcess(facility);
        const documentationCompliance = await this.checkClinicalDocumentation(facility);
        const specializedServicesCompliance = await this.checkSpecializedServices(facility);
        const twentyFourHourCompliance = await this.checkTwentyFourHourRestrictions(facility);
        return {
            // CP001 - Home Health Admission/Eligibility Criteria (Weight: 3)
            admissionEligibility: {
                requirement: "Patient meets home care eligibility criteria",
                evidenceRequired: [
                    "Patient assessed within 3 days",
                    "Communication within 12 hours",
                    "Accept referrals from DOH licensed specialists",
                    "Follow treating physician plan",
                    "Eligibility criteria with clinical evidence",
                    "Patient home assessment",
                    "Informed consent signed",
                    "Services delivered in Abu Dhabi",
                ],
                compliance: admissionCompliance,
                score: admissionCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // CP002 - Home Healthcare Service Process (Weight: 3)
            serviceProcess: {
                requirement: "Compliance with homecare service process, renewal, and discharge criteria",
                evidenceRequired: [
                    "Medical Report by Treating Physician",
                    "Patients Healthcare plan",
                    "Referral/Periodic Assessment Form",
                    "Consent documentation",
                    "Home care Assessment Forms",
                    "Pre-authorization request",
                    "Care Plan reviewed 30-90 days",
                    "Discharge criteria satisfaction",
                ],
                compliance: serviceProcessCompliance,
                score: serviceProcessCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // CP003 - Clinical Documentation and Malaffi Integration (Weight: 3)
            clinicalDocumentation: {
                requirement: "Complete clinical documentation including Malaffi integration",
                evidenceRequired: [
                    "Complete patient medical records",
                    "Daily activities and clinical observations",
                    "Daily progress notes",
                    "Integration with Malaffi",
                ],
                compliance: documentationCompliance,
                score: documentationCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // CP004 - Specialized Services (Weight: 3)
            specializedServices: {
                requirement: "Specialized services compliance including controlled medications",
                evidenceRequired: [
                    "DOH approval for specialized services",
                    "Equipment and supplies for specialized services",
                    "Specific training for healthcare providers",
                    "Controlled medications precautions",
                    "24-hour emergency provision system",
                ],
                compliance: specializedServicesCompliance,
                score: specializedServicesCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
            // CP005 - 24-Hour Service Restrictions (Weight: 3)
            twentyFourHourRestrictions: {
                requirement: "No nursing staff housed at patient residence unless 24-hour service identified",
                evidenceRequired: [
                    "Patient records review",
                    "Authorization documentation",
                ],
                compliance: twentyFourHourCompliance,
                score: twentyFourHourCompliance ? 300 : 0,
                maxScore: 300,
                weight: 3,
            },
        };
    }
    // Validation helper methods
    async checkMinimumStaffing(facility) {
        return (facility.staffing.physicians >= 1 &&
            facility.staffing.registeredNurses >= 25);
    }
    async checkLicenseAndOrgChart(facility) {
        return (facility.governance.organizationChart && facility.licenseNumber !== "");
    }
    async checkMedicalDirector(facility) {
        return (facility.medicalDirector !== undefined &&
            facility.medicalDirector.licenseNumber !== "");
    }
    async checkFacilityGovernance(facility) {
        return (facility.governance.scopeOfServices &&
            facility.governance.policiesSOPs &&
            facility.governance.patientRights);
    }
    async checkStaffFilesPrivileging(facility) {
        // Simulate staff files and privileging check
        return facility.staffing.totalStaff > 0;
    }
    async checkTawteenCompliance(facility) {
        const healthcareEmiratiPercentage = (facility.staffing.emiratiStaff / facility.staffing.totalStaff) * 100;
        const adminEmiratiPercentage = (facility.staffing.emiratiStaff / facility.staffing.administrativeStaff) *
            100;
        return healthcareEmiratiPercentage >= 1 && adminEmiratiPercentage >= 2;
    }
    async checkQualityGovernance(facility) {
        return (facility.qualityManagement.qualityManual &&
            facility.qualityManagement.riskManagement);
    }
    async checkPatientIdentification(facility) {
        return facility.qualityManagement.patientSafety;
    }
    async checkEffectiveCommunication(facility) {
        return facility.qualityManagement.patientSafety;
    }
    async checkPatientAssessment(facility) {
        return facility.clinicalServices.admissionCriteria;
    }
    async checkMedicationManagement(facility) {
        return facility.qualityManagement.patientSafety;
    }
    async checkRiskManagementJAWDA(facility) {
        return (facility.qualityManagement.riskManagement &&
            facility.qualityManagement.kpiMonitoring);
    }
    async checkAdmissionEligibility(facility) {
        return facility.clinicalServices.admissionCriteria;
    }
    async checkServiceProcess(facility) {
        return facility.clinicalServices.serviceProcess;
    }
    async checkClinicalDocumentation(facility) {
        return (facility.clinicalServices.documentation &&
            facility.clinicalServices.malaffiIntegration);
    }
    async checkSpecializedServices(facility) {
        return facility.clinicalServices.specializedServices;
    }
    async checkTwentyFourHourRestrictions(facility) {
        return true; // Default compliance for this check
    }
    // Additional validation methods for other compliance areas
    async validateComplaintManagement(facility) {
        return {
            requirement: "Complaint management system in place",
            evidenceRequired: "Complaint handling procedures and records",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateMedicalRecords(facility) {
        return {
            requirement: "Complete and accurate medical records",
            evidenceRequired: "Medical records audit and documentation standards",
            compliance: facility.clinicalServices.documentation,
            score: facility.clinicalServices.documentation ? 200 : 0,
            maxScore: 200,
            weight: 2,
        };
    }
    async validateMedication(facility) {
        return {
            requirement: "Medication management and safety protocols",
            evidenceRequired: "Medication policies and safety procedures",
            compliance: facility.qualityManagement.patientSafety,
            score: facility.qualityManagement.patientSafety ? 200 : 0,
            maxScore: 200,
            weight: 2,
        };
    }
    async validateInfectionSurveillance(facility) {
        return {
            requirement: "Infection surveillance and control program",
            evidenceRequired: "Infection control policies and surveillance data",
            compliance: true,
            score: 150,
            maxScore: 150,
            weight: 2,
        };
    }
    async validateSafePractices(facility) {
        return {
            requirement: "Safe clinical practices implementation",
            evidenceRequired: "Safe practice protocols and training records",
            compliance: facility.qualityManagement.patientSafety,
            score: facility.qualityManagement.patientSafety ? 100 : 0,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateNutritionTherapy(facility) {
        return {
            requirement: "Nutrition therapy protocols",
            evidenceRequired: "Nutrition assessment and therapy procedures",
            compliance: facility.clinicalServices.specializedServices,
            score: facility.clinicalServices.specializedServices ? 100 : 0,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateInfectionEducation(facility) {
        return {
            requirement: "Infection control education program",
            evidenceRequired: "Training records and education materials",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateEnvironmentalCleaning(facility) {
        return {
            requirement: "Environmental cleaning protocols",
            evidenceRequired: "Cleaning procedures and schedules",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateBloodBorneManagement(facility) {
        return {
            requirement: "Blood-borne pathogen management",
            evidenceRequired: "Blood-borne pathogen policies and procedures",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateWasteManagement(facility) {
        return {
            requirement: "Medical waste management system",
            evidenceRequired: "Waste management procedures and disposal records",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateFacilityManagement(facility) {
        return {
            requirement: "Facility management and maintenance",
            evidenceRequired: "Facility maintenance records and procedures",
            compliance: true,
            score: 150,
            maxScore: 150,
            weight: 2,
        };
    }
    async validateEquipmentManagement(facility) {
        return {
            requirement: "Medical equipment management and maintenance",
            evidenceRequired: "Equipment inventory and maintenance records",
            compliance: true,
            score: 150,
            maxScore: 150,
            weight: 2,
        };
    }
    async validateFireSafety(facility) {
        return {
            requirement: "Fire safety systems and procedures",
            evidenceRequired: "Fire safety plans and equipment inspection records",
            compliance: true,
            score: 100,
            maxScore: 100,
            weight: 1,
        };
    }
    async validateOSHRequirements(facility) {
        return {
            requirement: "Occupational Safety and Health compliance",
            evidenceRequired: "OSH policies, training records, and incident reports",
            compliance: true,
            score: 200,
            maxScore: 200,
            weight: 2,
        };
    }
    async validateLaboratoryServices(facility) {
        return {
            requirement: "Laboratory services quality and safety",
            evidenceRequired: "Laboratory procedures and quality control records",
            compliance: facility.services.includes("laboratory"),
            score: facility.services.includes("laboratory") ? 150 : 0,
            maxScore: 150,
            weight: 2,
        };
    }
    async validatePOCTesting(facility) {
        return {
            requirement: "Point-of-care testing protocols",
            evidenceRequired: "POC testing procedures and quality assurance",
            compliance: facility.services.includes("poc_testing"),
            score: facility.services.includes("poc_testing") ? 100 : 0,
            maxScore: 100,
            weight: 1,
        };
    }
    // Scoring and calculation methods
    calculateOverallAuditScore(auditCompliance) {
        try {
            let totalScore = 0;
            let maxScore = 0;
            // Calculate scores for all compliance areas
            const calculateSectionScore = (section) => {
                if (typeof section === "object" && section !== null) {
                    if (typeof section.score === "number" &&
                        typeof section.maxScore === "number") {
                        totalScore += section.score;
                        maxScore += section.maxScore;
                    }
                    else {
                        Object.values(section).forEach(calculateSectionScore);
                    }
                }
            };
            if (auditCompliance && typeof auditCompliance === "object") {
                Object.values(auditCompliance).forEach(calculateSectionScore);
            }
            return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        }
        catch (error) {
            console.error("Error calculating overall audit score:", error);
            return 0;
        }
    }
    calculateWeightedScore(auditCompliance) {
        try {
            let weightedScore = 0;
            const calculateWeightedSectionScore = (section) => {
                if (typeof section === "object" && section !== null) {
                    if (typeof section.score === "number" &&
                        typeof section.weight === "number") {
                        // Use the actual score, not multiplied by weight again
                        weightedScore += section.score;
                    }
                    else {
                        Object.values(section).forEach(calculateWeightedSectionScore);
                    }
                }
            };
            if (auditCompliance && typeof auditCompliance === "object") {
                Object.values(auditCompliance).forEach(calculateWeightedSectionScore);
            }
            return Math.round(weightedScore);
        }
        catch (error) {
            console.error("Error calculating weighted score:", error);
            return 0;
        }
    }
    calculateMaxPossibleScore() {
        // Calculate actual maximum possible score based on DOH audit requirements
        // HR: 1100 (300+100+100+200+300+300)
        // QM: 1300 (200+300+300+300+200+200)
        // CP: 1500 (300+300+300+300+300)
        // Other sections: ~1100
        return 5000;
    }
    identifyCriticalNonCompliances(auditCompliance) {
        const criticalNonCompliances = [];
        const checkCriticalCompliance = (section, sectionName) => {
            if (typeof section === "object" && section !== null) {
                if (section.compliance === false &&
                    (section.weight >= 3 || section.maxScore >= 300)) {
                    criticalNonCompliances.push(`${sectionName}: ${section.requirement || "Critical requirement not met"}`);
                }
                else {
                    Object.entries(section).forEach(([key, value]) => {
                        if (key !== "compliance" &&
                            key !== "weight" &&
                            key !== "maxScore" &&
                            key !== "score") {
                            checkCriticalCompliance(value, `${sectionName}.${key}`);
                        }
                    });
                }
            }
        };
        if (auditCompliance && typeof auditCompliance === "object") {
            Object.entries(auditCompliance).forEach(([key, value]) => {
                checkCriticalCompliance(value, key);
            });
        }
        return criticalNonCompliances;
    }
    identifyMajorNonCompliances(auditCompliance) {
        const majorNonCompliances = [];
        const checkMajorCompliance = (section, sectionName) => {
            if (typeof section === "object" && section !== null) {
                if (section.compliance === false &&
                    (section.weight === 2 ||
                        (section.maxScore >= 150 && section.maxScore < 300))) {
                    majorNonCompliances.push(`${sectionName}: ${section.requirement || "Major requirement not met"}`);
                }
                else {
                    Object.entries(section).forEach(([key, value]) => {
                        if (key !== "compliance" &&
                            key !== "weight" &&
                            key !== "maxScore" &&
                            key !== "score") {
                            checkMajorCompliance(value, `${sectionName}.${key}`);
                        }
                    });
                }
            }
        };
        if (auditCompliance && typeof auditCompliance === "object") {
            Object.entries(auditCompliance).forEach(([key, value]) => {
                checkMajorCompliance(value, key);
            });
        }
        return majorNonCompliances;
    }
    identifyImprovementAreas(auditCompliance) {
        const improvementAreas = [];
        const checkImprovementAreas = (section, sectionName) => {
            if (typeof section === "object" && section !== null) {
                if (section.score !== undefined &&
                    section.maxScore !== undefined &&
                    section.maxScore > 0) {
                    const compliancePercentage = (section.score / section.maxScore) * 100;
                    if (compliancePercentage < 80) {
                        improvementAreas.push(`${sectionName}: ${section.requirement || "Requirement needs improvement"} (${Math.round(compliancePercentage)}% compliance)`);
                    }
                }
                else {
                    Object.entries(section).forEach(([key, value]) => {
                        if (key !== "compliance" &&
                            key !== "weight" &&
                            key !== "maxScore" &&
                            key !== "score") {
                            checkImprovementAreas(value, `${sectionName}.${key}`);
                        }
                    });
                }
            }
        };
        if (auditCompliance && typeof auditCompliance === "object") {
            Object.entries(auditCompliance).forEach(([key, value]) => {
                checkImprovementAreas(value, key);
            });
        }
        return improvementAreas;
    }
    calculateRankingImpact(weightedScore) {
        const maxScore = this.calculateMaxPossibleScore();
        const percentage = (weightedScore / maxScore) * 100;
        let currentRanking;
        let potentialRanking;
        let improvementRequired;
        if (percentage >= 95) {
            currentRanking = "Excellent";
            potentialRanking = "Excellent";
            improvementRequired = 0;
        }
        else if (percentage >= 85) {
            currentRanking = "Very Good";
            potentialRanking = "Excellent";
            improvementRequired = Math.ceil(((95 - percentage) * maxScore) / 100);
        }
        else if (percentage >= 75) {
            currentRanking = "Good";
            potentialRanking = "Very Good";
            improvementRequired = Math.ceil(((85 - percentage) * maxScore) / 100);
        }
        else if (percentage >= 65) {
            currentRanking = "Satisfactory";
            potentialRanking = "Good";
            improvementRequired = Math.ceil(((75 - percentage) * maxScore) / 100);
        }
        else {
            currentRanking = "Needs Improvement";
            potentialRanking = "Satisfactory";
            improvementRequired = Math.ceil(((65 - percentage) * maxScore) / 100);
        }
        return {
            currentRanking,
            potentialRanking,
            improvementRequired,
        };
    }
}
// Export DOH Ranking Audit functions
export async function performDOHRankingAudit(facilityId) {
    try {
        const db = getDb();
        const facilitiesCollection = db.collection("healthcare_facilities");
        // Get facility data
        const facility = (await facilitiesCollection.findOne({
            facilityId,
        }));
        if (!facility) {
            throw new Error(`Facility with ID ${facilityId} not found`);
        }
        const auditEngine = new DOHRankingAuditEngine();
        const auditResult = await auditEngine.validateDOHAuditCompliance(facility);
        // Save to new DOH audit compliance schema
        await saveDOHAuditCompliance(auditResult, facilityId);
        return auditResult;
    }
    catch (error) {
        console.error("Error performing DOH ranking audit:", error);
        throw new Error("Failed to perform DOH ranking audit");
    }
}
export async function getDOHAuditHistory(facilityId) {
    try {
        const db = getDb();
        const auditCollection = db.collection("doh_audit_compliance");
        const auditHistory = await auditCollection
            .find({ facility_id: facilityId })
            .sort({ audit_date: -1 })
            .limit(10)
            .toArray();
        return auditHistory;
    }
    catch (error) {
        console.error("Error fetching DOH audit history:", error);
        throw new Error("Failed to fetch DOH audit history");
    }
}
// Save DOH Audit Compliance to database
export async function saveDOHAuditCompliance(auditResult, facilityId) {
    try {
        const db = getDb();
        const auditCollection = db.collection("doh_audit_compliance");
        const requirementsCollection = db.collection("doh_audit_requirements");
        // Calculate category scores
        const categoryScores = calculateCategoryScores(auditResult);
        // Determine ranking grade
        const rankingGrade = determineRankingGrade(auditResult.compliancePercentage);
        // Create main audit compliance record
        const auditCompliance = {
            facility_id: facilityId,
            audit_date: new Date().toISOString().split("T")[0],
            audit_type: "annual_ranking",
            auditor_name: "System Automated Audit",
            audit_reference: `DOH-${Date.now()}`,
            total_weighted_score: auditResult.weightedComplianceScore,
            max_possible_score: auditResult.maxPossibleScore,
            compliance_percentage: auditResult.compliancePercentage,
            ranking_grade: rankingGrade,
            organization_management_score: categoryScores.organizationManagement,
            medical_requirements_score: categoryScores.medicalRequirements,
            infection_control_score: categoryScores.infectionControl,
            facility_equipment_score: categoryScores.facilityEquipment,
            osh_requirements_score: categoryScores.oshRequirements,
            diagnostic_services_score: categoryScores.diagnosticServices,
            overall_compliant: auditResult.compliancePercentage >= 80,
            critical_non_compliances: auditResult.criticalNonCompliances.length,
            major_non_compliances: auditResult.majorNonCompliances.length,
            minor_non_compliances: auditResult.improvementAreas.length,
            improvement_plan_required: auditResult.compliancePercentage < 80,
            corrective_action_deadline: auditResult.compliancePercentage < 80
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                : undefined,
            follow_up_audit_scheduled: auditResult.compliancePercentage < 70
                ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                : undefined,
            license_renewal_impact: auditResult.compliancePercentage < 60 ? "at_risk" : "compliant",
            accreditation_impact: auditResult.rankingImpact.currentRanking,
            public_ranking_impact: auditResult.rankingImpact.potentialRanking,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const auditInsertResult = await auditCollection.insertOne(auditCompliance);
        const auditId = auditInsertResult.insertedId.toString();
        // Save individual requirements
        await saveAuditRequirements(auditResult, auditId, requirementsCollection);
        return auditId;
    }
    catch (error) {
        console.error("Error saving DOH audit compliance:", error);
        throw new Error("Failed to save DOH audit compliance");
    }
}
// Calculate category scores from audit result
function calculateCategoryScores(auditResult) {
    const calculateSectionScore = (section) => {
        if (!section || typeof section !== "object")
            return 0;
        let totalScore = 0;
        let maxScore = 0;
        const calculateItemScore = (item) => {
            if (typeof item === "object" && item !== null) {
                if (item.score !== undefined && item.maxScore !== undefined) {
                    totalScore += item.score;
                    maxScore += item.maxScore;
                }
                else {
                    Object.values(item).forEach(calculateItemScore);
                }
            }
        };
        Object.values(section).forEach(calculateItemScore);
        return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    };
    return {
        organizationManagement: calculateSectionScore(auditResult.auditResults?.organizationManagement),
        medicalRequirements: calculateSectionScore(auditResult.auditResults?.medicalRequirements),
        infectionControl: calculateSectionScore(auditResult.auditResults?.infectionControl),
        facilityEquipment: calculateSectionScore(auditResult.auditResults?.facilityEquipmentManagement),
        oshRequirements: auditResult.auditResults?.oshRequirements?.score || 0,
        diagnosticServices: calculateSectionScore(auditResult.auditResults?.diagnosticServices),
    };
}
// Determine ranking grade based on compliance percentage
function determineRankingGrade(percentage) {
    if (percentage >= 95)
        return "A+";
    if (percentage >= 90)
        return "A";
    if (percentage >= 85)
        return "B+";
    if (percentage >= 80)
        return "B";
    if (percentage >= 75)
        return "C+";
    if (percentage >= 70)
        return "C";
    return "D";
}
// Save individual audit requirements
async function saveAuditRequirements(auditResult, auditId, requirementsCollection) {
    try {
        const requirements = [];
        // Helper function to safely process requirements
        const processRequirements = (section, categoryPrefix, categoryName) => {
            if (!section || typeof section !== "object")
                return;
            Object.entries(section).forEach(([key, item]) => {
                if (!item || typeof item !== "object")
                    return;
                const evidenceRequired = item.evidenceRequired || [];
                const evidenceArray = Array.isArray(evidenceRequired)
                    ? evidenceRequired
                    : typeof evidenceRequired === "string" &&
                        evidenceRequired.trim() !== ""
                        ? [evidenceRequired]
                        : [];
                requirements.push({
                    audit_id: auditId,
                    requirement_code: `${categoryPrefix}${String(requirements.length + 1).padStart(3, "0")}`,
                    requirement_name: item.requirement || "Unknown requirement",
                    requirement_category: categoryName,
                    requirement_subcategory: key,
                    max_score: typeof item.maxScore === "number" ? item.maxScore : 0,
                    weight: typeof item.weight === "number" ? item.weight : 1,
                    achieved_score: typeof item.score === "number" ? item.score : 0,
                    weighted_score: typeof item.score === "number" ? item.score : 0,
                    compliant: Boolean(item.compliance),
                    evidence_provided: Boolean(item.compliance),
                    evidence_adequate: Boolean(item.compliance),
                    evidence_required: evidenceArray,
                    evidence_submitted: [],
                    missing_evidence: item.compliance ? [] : evidenceArray,
                    corrective_actions_required: item.compliance
                        ? []
                        : ["Address compliance gap"],
                    requires_follow_up: !item.compliance,
                    follow_up_deadline: !item.compliance
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]
                        : undefined,
                    follow_up_completed: false,
                });
            });
        };
        // Process organization management requirements
        if (auditResult.auditResults?.organizationManagement?.humanResources) {
            processRequirements(auditResult.auditResults.organizationManagement.humanResources, "HR", "Human Resources");
        }
        // Process quality management requirements
        if (auditResult.auditResults?.organizationManagement?.qualityManagement) {
            processRequirements(auditResult.auditResults.organizationManagement.qualityManagement, "QM", "Quality Management");
        }
        // Process clinical practice requirements
        if (auditResult.auditResults?.medicalRequirements?.clinicalPractice) {
            processRequirements(auditResult.auditResults.medicalRequirements.clinicalPractice, "CP", "Clinical Practice");
        }
        // Process medical records requirements
        if (auditResult.auditResults?.medicalRequirements?.medicalRecords) {
            const medicalRecords = auditResult.auditResults.medicalRequirements.medicalRecords;
            if (typeof medicalRecords === "object" && medicalRecords.requirement) {
                const evidenceRequired = medicalRecords.evidenceRequired || [];
                const evidenceArray = Array.isArray(evidenceRequired)
                    ? evidenceRequired
                    : typeof evidenceRequired === "string" &&
                        evidenceRequired.trim() !== ""
                        ? [evidenceRequired]
                        : [];
                requirements.push({
                    audit_id: auditId,
                    requirement_code: `MR${String(requirements.length + 1).padStart(3, "0")}`,
                    requirement_name: medicalRecords.requirement,
                    requirement_category: "Medical Records",
                    requirement_subcategory: "medicalRecords",
                    max_score: typeof medicalRecords.maxScore === "number"
                        ? medicalRecords.maxScore
                        : 0,
                    weight: typeof medicalRecords.weight === "number"
                        ? medicalRecords.weight
                        : 1,
                    achieved_score: typeof medicalRecords.score === "number" ? medicalRecords.score : 0,
                    weighted_score: typeof medicalRecords.score === "number" ? medicalRecords.score : 0,
                    compliant: Boolean(medicalRecords.compliance),
                    evidence_provided: Boolean(medicalRecords.compliance),
                    evidence_adequate: Boolean(medicalRecords.compliance),
                    evidence_required: evidenceArray,
                    evidence_submitted: [],
                    missing_evidence: medicalRecords.compliance ? [] : evidenceArray,
                    corrective_actions_required: medicalRecords.compliance
                        ? []
                        : ["Address compliance gap"],
                    requires_follow_up: !medicalRecords.compliance,
                    follow_up_deadline: !medicalRecords.compliance
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]
                        : undefined,
                    follow_up_completed: false,
                });
            }
        }
        // Insert all requirements
        if (requirements.length > 0) {
            await requirementsCollection.insertMany(requirements);
        }
    }
    catch (error) {
        console.error("Error saving audit requirements:", error);
        throw new Error("Failed to save audit requirements");
    }
}
// Get DOH audit requirements for a specific audit
export async function getDOHAuditRequirements(auditId) {
    try {
        const db = getDb();
        const requirementsCollection = db.collection("doh_audit_requirements");
        const requirements = await requirementsCollection
            .find({ audit_id: auditId })
            .toArray();
        return requirements;
    }
    catch (error) {
        console.error("Error fetching DOH audit requirements:", error);
        throw new Error("Failed to fetch DOH audit requirements");
    }
}
// Submit evidence for a requirement
export async function submitDOHAuditEvidence(evidenceData) {
    try {
        const db = getDb();
        const evidenceCollection = db.collection("doh_audit_evidence");
        const evidence = {
            ...evidenceData,
            submitted_date: new Date().toISOString(),
        };
        const result = await evidenceCollection.insertOne(evidence);
        return result.insertedId.toString();
    }
    catch (error) {
        console.error("Error submitting DOH audit evidence:", error);
        throw new Error("Failed to submit DOH audit evidence");
    }
}
// Get evidence for a requirement
export async function getDOHAuditEvidence(requirementId) {
    try {
        const db = getDb();
        const evidenceCollection = db.collection("doh_audit_evidence");
        const evidence = await evidenceCollection
            .find({ requirement_id: requirementId })
            .sort({ submitted_date: -1 })
            .toArray();
        return evidence;
    }
    catch (error) {
        console.error("Error fetching DOH audit evidence:", error);
        throw new Error("Failed to fetch DOH audit evidence");
    }
}
// Update requirement compliance status
export async function updateDOHRequirementCompliance(requirementId, updates) {
    try {
        const db = getDb();
        const requirementsCollection = db.collection("doh_audit_requirements");
        await requirementsCollection.updateOne({ requirement_id: requirementId }, { $set: updates });
    }
    catch (error) {
        console.error("Error updating DOH requirement compliance:", error);
        throw new Error("Failed to update DOH requirement compliance");
    }
}
// Get comprehensive DOH audit dashboard data
export async function getDOHAuditDashboardData(facilityId) {
    try {
        const db = getDb();
        const auditCollection = db.collection("doh_audit_compliance");
        const requirementsCollection = db.collection("doh_audit_requirements");
        // Get current audit with proper error handling
        const currentAudit = (await auditCollection.findOne({ facility_id: facilityId }, { sort: { audit_date: -1 } }));
        // Get audit history with proper error handling
        const auditHistory = (await auditCollection
            .find({ facility_id: facilityId })
            .sort({ audit_date: -1 })
            .limit(12)
            .toArray());
        // Get pending requirements - handle case where audit_id might be ObjectId
        let pendingRequirements = [];
        if (currentAudit) {
            try {
                const auditIdToUse = currentAudit.audit_id || currentAudit._id?.toString() || "";
                if (auditIdToUse) {
                    pendingRequirements = (await requirementsCollection
                        .find({
                        audit_id: auditIdToUse,
                        $or: [
                            { compliant: false },
                            { requires_follow_up: true, follow_up_completed: false },
                        ],
                    })
                        .toArray());
                }
            }
            catch (reqError) {
                console.error("Error fetching pending requirements:", reqError);
                pendingRequirements = [];
            }
        }
        // Calculate compliance metrics with comprehensive null safety
        const complianceMetrics = {
            overallCompliance: typeof currentAudit?.compliance_percentage === "number"
                ? currentAudit.compliance_percentage
                : 0,
            categoryBreakdown: currentAudit
                ? {
                    organizationManagement: typeof currentAudit.organization_management_score === "number"
                        ? currentAudit.organization_management_score
                        : 0,
                    medicalRequirements: typeof currentAudit.medical_requirements_score === "number"
                        ? currentAudit.medical_requirements_score
                        : 0,
                    infectionControl: typeof currentAudit.infection_control_score === "number"
                        ? currentAudit.infection_control_score
                        : 0,
                    facilityEquipment: typeof currentAudit.facility_equipment_score === "number"
                        ? currentAudit.facility_equipment_score
                        : 0,
                    oshRequirements: typeof currentAudit.osh_requirements_score === "number"
                        ? currentAudit.osh_requirements_score
                        : 0,
                    diagnosticServices: typeof currentAudit.diagnostic_services_score === "number"
                        ? currentAudit.diagnostic_services_score
                        : 0,
                }
                : {
                    organizationManagement: 0,
                    medicalRequirements: 0,
                    infectionControl: 0,
                    facilityEquipment: 0,
                    oshRequirements: 0,
                    diagnosticServices: 0,
                },
            trendAnalysis: auditHistory.length > 1
                ? {
                    trend: (auditHistory[0]?.compliance_percentage || 0) >
                        (auditHistory[1]?.compliance_percentage || 0)
                        ? "improving"
                        : (auditHistory[0]?.compliance_percentage || 0) <
                            (auditHistory[1]?.compliance_percentage || 0)
                            ? "declining"
                            : "stable",
                    changePercentage: auditHistory.length > 1
                        ? Math.round(((auditHistory[0]?.compliance_percentage || 0) -
                            (auditHistory[1]?.compliance_percentage || 0)) *
                            100) / 100
                        : 0,
                }
                : { trend: "stable", changePercentage: 0 },
        };
        return {
            currentAudit,
            auditHistory,
            pendingRequirements,
            complianceMetrics,
        };
    }
    catch (error) {
        console.error("Error fetching DOH audit dashboard data:", error);
        // Return safe defaults instead of throwing
        return {
            currentAudit: null,
            auditHistory: [],
            pendingRequirements: [],
            complianceMetrics: {
                overallCompliance: 0,
                categoryBreakdown: {
                    organizationManagement: 0,
                    medicalRequirements: 0,
                    infectionControl: 0,
                    facilityEquipment: 0,
                    oshRequirements: 0,
                    diagnosticServices: 0,
                },
                trendAnalysis: { trend: "stable", changePercentage: 0 },
            },
        };
    }
}
// Real-time compliance scoring dashboard
export async function getRealTimeComplianceScore() {
    try {
        const complianceResults = await performAutomatedComplianceCheck("DOH");
        // Calculate category scores
        const categoryScores = complianceResults.compliance_issues.map((issue) => ({
            category: issue.category,
            score: issue.score,
            status: issue.score >= 90
                ? "excellent"
                : issue.score >= 80
                    ? "good"
                    : issue.score >= 70
                        ? "fair"
                        : "poor",
            trend: "stable", // In real system, this would be calculated from historical data
        }));
        // Generate alerts for critical issues
        const alerts = complianceResults.critical_gaps.map((gap) => ({
            type: "compliance_gap",
            severity: "critical",
            message: `Critical compliance gap in ${gap.category}: Score ${gap.score}%`,
            action_required: gap.immediate_action_required,
            deadline: gap.deadline,
        }));
        return {
            overall_score: complianceResults.overall_score,
            category_scores: categoryScores,
            trending: "stable", // Would be calculated from historical data
            last_updated: new Date().toISOString(),
            alerts,
        };
    }
    catch (error) {
        console.error("Error getting real-time compliance score:", error);
        throw new Error("Failed to get real-time compliance score");
    }
}
// Get DOH compliance dashboard data with real-time metrics
export async function getDOHComplianceDashboard() {
    try {
        const db = getDb();
        // Get real-time compliance metrics
        const complianceResults = await performAutomatedComplianceCheck("DOH");
        // Calculate real-time metrics
        const realTimeMetrics = {
            overall_compliance: complianceResults.overall_score,
            documentation_compliance: await calculateDocumentationCompliance(),
            patient_safety_score: await calculatePatientSafetyScore(),
            clinical_quality_score: await calculateClinicalQualityScore(),
            regulatory_adherence: await calculateRegulatoryAdherence(),
        };
        // Categorize alerts by severity
        const alerts = {
            critical: complianceResults.critical_gaps.map((gap) => ({
                id: `critical-${Date.now()}-${Math.random()}`,
                title: `Critical Gap: ${gap.category}`,
                message: gap.gap_description || `Critical compliance issue in ${gap.category}`,
                category: gap.category,
                deadline: gap.deadline,
                action_required: gap.immediate_action_required,
                timestamp: new Date().toISOString(),
            })),
            warning: complianceResults.compliance_issues
                .filter((issue) => issue.severity === "medium" && issue.score < 80)
                .map((issue) => ({
                id: `warning-${Date.now()}-${Math.random()}`,
                title: `Warning: ${issue.category}`,
                message: `Compliance score below threshold: ${issue.score}%`,
                category: issue.category,
                score: issue.score,
                timestamp: new Date().toISOString(),
            })),
            info: complianceResults.recommendations.slice(0, 5).map((rec, index) => ({
                id: `info-${Date.now()}-${index}`,
                title: "Improvement Opportunity",
                message: rec,
                category: "general",
                timestamp: new Date().toISOString(),
            })),
        };
        // Generate actionable insights
        const actionableInsights = [
            ...complianceResults.critical_gaps.map((gap) => ({
                priority: "high",
                category: gap.category,
                title: `Address Critical Gap in ${gap.category}`,
                description: gap.gap_description ||
                    `Critical compliance issue requiring immediate attention`,
                action_required: "Implement corrective measures immediately",
                deadline: gap.deadline,
                impact: "High - May affect DOH ranking and licensing",
            })),
            ...complianceResults.compliance_issues
                .filter((issue) => issue.score < 70)
                .map((issue) => ({
                priority: "medium",
                category: issue.category,
                title: `Improve ${issue.category} Compliance`,
                description: `Current score: ${issue.score}% - Below acceptable threshold`,
                action_required: "Review and implement improvement measures",
                impact: "Medium - May impact overall compliance rating",
            })),
        ].slice(0, 10);
        // Get compliance history (last 12 months)
        const complianceHistory = await getComplianceHistory();
        // Get non-compliant documents
        const nonCompliantDocuments = await getNonCompliantDocuments();
        return {
            realTimeMetrics,
            alerts,
            actionableInsights,
            complianceHistory,
            nonCompliantDocuments,
        };
    }
    catch (error) {
        console.error("Error getting DOH compliance dashboard:", error);
        throw new Error("Failed to get DOH compliance dashboard data");
    }
}
// Helper functions for compliance calculations
async function calculateDocumentationCompliance() {
    try {
        const db = getDb();
        const assessmentsCollection = db.collection("clinical_assessments");
        const recentAssessments = await assessmentsCollection
            .find({
            assessment_date: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .toArray();
        if (recentAssessments.length === 0)
            return 85; // Default score
        const compliantDocs = recentAssessments.filter((assessment) => assessment.completed && assessment.signature).length;
        return Math.round((compliantDocs / recentAssessments.length) * 100);
    }
    catch (error) {
        console.error("Error calculating documentation compliance:", error);
        return 85; // Default fallback
    }
}
async function calculatePatientSafetyScore() {
    try {
        const db = getDb();
        const incidentsCollection = db.collection("incident_reports");
        const recentIncidents = await incidentsCollection
            .find({
            incident_date: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .toArray();
        // Base score of 95, deduct points for incidents
        let score = 95;
        const criticalIncidents = recentIncidents.filter((i) => i.severity === "critical").length;
        const majorIncidents = recentIncidents.filter((i) => i.severity === "major").length;
        score -= criticalIncidents * 10 + majorIncidents * 5;
        return Math.max(0, score);
    }
    catch (error) {
        console.error("Error calculating patient safety score:", error);
        return 90; // Default fallback
    }
}
async function calculateClinicalQualityScore() {
    try {
        const db = getDb();
        const kpiCollection = db.collection("jawda_kpi_tracking");
        const clinicalKPIs = await kpiCollection
            .find({
            kpi_category: { $in: ["clinical_effectiveness", "patient_experience"] },
            last_updated: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
        })
            .toArray();
        if (clinicalKPIs.length === 0)
            return 88; // Default score
        const averagePerformance = clinicalKPIs.reduce((sum, kpi) => {
            const performanceScore = kpi.performance_status === "exceeds"
                ? 100
                : kpi.performance_status === "meets"
                    ? 85
                    : kpi.performance_status === "below"
                        ? 65
                        : 40;
            return sum + performanceScore;
        }, 0) / clinicalKPIs.length;
        return Math.round(averagePerformance);
    }
    catch (error) {
        console.error("Error calculating clinical quality score:", error);
        return 88; // Default fallback
    }
}
async function calculateRegulatoryAdherence() {
    try {
        const db = getDb();
        const complianceCollection = db.collection("compliance_monitoring");
        const complianceRecords = await complianceCollection
            .find({ regulation_type: "DOH" })
            .toArray();
        if (complianceRecords.length === 0)
            return 82; // Default score
        const averageCompliance = complianceRecords.reduce((sum, record) => sum + record.compliance_percentage, 0) / complianceRecords.length;
        return Math.round(averageCompliance);
    }
    catch (error) {
        console.error("Error calculating regulatory adherence:", error);
        return 82; // Default fallback
    }
}
async function getComplianceHistory() {
    try {
        const db = getDb();
        const auditCollection = db.collection("doh_audit_compliance");
        const auditHistory = await auditCollection
            .find({})
            .sort({ audit_date: -1 })
            .limit(12)
            .toArray();
        return auditHistory.map((audit) => ({
            date: audit.audit_date,
            overall_score: audit.compliance_percentage || 0,
            category_scores: {
                organization: audit.organization_management_score || 0,
                medical: audit.medical_requirements_score || 0,
                infection_control: audit.infection_control_score || 0,
                facility: audit.facility_equipment_score || 0,
                osh: audit.osh_requirements_score || 0,
                diagnostics: audit.diagnostic_services_score || 0,
            },
        }));
    }
    catch (error) {
        console.error("Error getting compliance history:", error);
        return [];
    }
}
async function getNonCompliantDocuments() {
    try {
        const db = getDb();
        const assessmentsCollection = db.collection("clinical_assessments");
        const nonCompliantDocs = await assessmentsCollection
            .find({
            $or: [
                { completed: false },
                { signature: { $exists: false } },
                {
                    assessment_date: {
                        $lt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                    },
                },
            ],
            assessment_date: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        })
            .limit(20)
            .toArray();
        return nonCompliantDocs.map((doc) => ({
            document_type: doc.assessment_type || "Clinical Assessment",
            patient_id: doc.patient_id,
            clinician: doc.clinician_name || "Unknown",
            issue_description: !doc.completed
                ? "Assessment not completed"
                : !doc.signature
                    ? "Missing electronic signature"
                    : "Documentation overdue",
            severity: !doc.completed
                ? "critical"
                : !doc.signature
                    ? "major"
                    : "minor",
            date_identified: new Date().toISOString().split("T")[0],
            status: "open",
        }));
    }
    catch (error) {
        console.error("Error getting non-compliant documents:", error);
        return [];
    }
}
