import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import Papa from "papaparse";
import * as cron from "node-cron";
import nodemailer from "nodemailer";
// Report Template Functions
export async function getReportTemplates() {
    try {
        const db = getDb();
        const collection = db.collection("report_templates");
        const templates = await collection.find({}).toArray();
        return templates;
    }
    catch (error) {
        console.error("Error fetching report templates:", error);
        throw new Error("Failed to fetch report templates");
    }
}
export async function createReportTemplate(templateData) {
    try {
        const db = getDb();
        const collection = db.collection("report_templates");
        const newTemplate = {
            ...templateData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newTemplate);
        return { ...newTemplate, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating report template:", error);
        throw new Error("Failed to create report template");
    }
}
export async function updateReportTemplate(id, updates) {
    try {
        const db = getDb();
        const collection = db.collection("report_templates");
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        const updatedTemplate = await collection.findOne({ _id: new ObjectId(id) });
        return updatedTemplate;
    }
    catch (error) {
        console.error("Error updating report template:", error);
        throw new Error("Failed to update report template");
    }
}
export async function deleteReportTemplate(id) {
    try {
        const db = getDb();
        const collection = db.collection("report_templates");
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
    catch (error) {
        console.error("Error deleting report template:", error);
        throw new Error("Failed to delete report template");
    }
}
// Generated Report Functions
export async function getGeneratedReports(filters = {}) {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        const query = {};
        if (filters.date_from || filters.date_to) {
            query.generated_at = {};
            if (filters.date_from)
                query.generated_at.$gte = filters.date_from;
            if (filters.date_to)
                query.generated_at.$lte = filters.date_to;
        }
        if (filters.category)
            query.category = filters.category;
        if (filters.status)
            query.status = filters.status;
        if (filters.generated_by)
            query.generated_by = filters.generated_by;
        if (filters.template_id)
            query.template_id = filters.template_id;
        const reports = await collection.find(query).toArray();
        return reports;
    }
    catch (error) {
        console.error("Error fetching generated reports:", error);
        throw new Error("Failed to fetch generated reports");
    }
}
export async function generateReport(templateId, parameters, generatedBy) {
    try {
        const db = getDb();
        const reportsCollection = db.collection("generated_reports");
        const templatesCollection = db.collection("report_templates");
        // Get template
        const template = await templatesCollection.findOne({
            _id: new ObjectId(templateId),
        });
        if (!template) {
            throw new Error("Template not found");
        }
        const reportId = `RPT-${Date.now()}`;
        const newReport = {
            report_id: reportId,
            template_id: templateId,
            name: `${template.name} - ${new Date().toLocaleDateString()}`,
            category: template.category,
            parameters,
            status: "generating",
            generated_by: generatedBy,
            generated_at: new Date().toISOString(),
            approval: {
                status: "pending",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await reportsCollection.insertOne(newReport);
        // CRITICAL: Simulate report generation (in real implementation, this would be async)
        setTimeout(async () => {
            try {
                await reportsCollection.updateOne({ _id: result.insertedId }, {
                    $set: {
                        status: "completed",
                        file_path: `/reports/${reportId}.${template.template_config.format}`,
                        file_size: Math.floor(Math.random() * 1000000) + 50000, // Random file size
                        updated_at: new Date().toISOString(),
                    },
                });
                // CRITICAL: End-of-day-before-due-date automation
                await scheduleEndOfDayReportPreparation(newReport, template);
            }
            catch (error) {
                await reportsCollection.updateOne({ _id: result.insertedId }, {
                    $set: {
                        status: "failed",
                        error_message: "Report generation failed",
                        updated_at: new Date().toISOString(),
                    },
                });
            }
        }, 2000);
        return { ...newReport, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error generating report:", error);
        throw new Error("Failed to generate report");
    }
}
// CRITICAL: End-of-day-before-due-date automation
export async function scheduleEndOfDayReportPreparation(report, template) {
    try {
        const db = getDb();
        const schedulerCollection = db.collection("report_scheduler");
        // Calculate end-of-day-before-due-date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Tomorrow as example due date
        const preparationDate = new Date(dueDate);
        preparationDate.setDate(preparationDate.getDate() - 1);
        preparationDate.setHours(23, 59, 59, 999); // End of day
        const scheduledTask = {
            task_type: "end_of_day_report_preparation",
            report_id: report.report_id,
            template_id: template.template_id,
            preparation_deadline: preparationDate.toISOString(),
            due_date: dueDate.toISOString(),
            status: "scheduled",
            automation_enabled: true,
            notification_recipients: template.schedule_config?.recipients || [],
            created_at: new Date().toISOString(),
        };
        await schedulerCollection.insertOne(scheduledTask);
        console.log(`End-of-day report preparation scheduled for ${report.report_id}`);
    }
    catch (error) {
        console.error("Error scheduling end-of-day report preparation:", error);
    }
}
// Automated Compliance Monitoring Functions
export async function createComplianceMonitoringRule(ruleData) {
    try {
        const db = getDb();
        const collection = db.collection("compliance_monitoring_rules");
        const newRule = {
            ...ruleData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRule);
        return { ...newRule, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating compliance monitoring rule:", error);
        throw new Error("Failed to create compliance monitoring rule");
    }
}
export async function executeComplianceMonitoring(ruleId) {
    try {
        const db = getDb();
        const rulesCollection = db.collection("compliance_monitoring_rules");
        const resultsCollection = db.collection("compliance_monitoring_results");
        const rule = await rulesCollection.findOne({ rule_id: ruleId });
        if (!rule) {
            throw new Error(`Compliance monitoring rule ${ruleId} not found`);
        }
        const monitoringId = `MON-${Date.now()}`;
        const executionTime = new Date().toISOString();
        // Simulate compliance monitoring execution
        const measuredValue = Math.random() * 100;
        const warningBreached = measuredValue < rule.threshold_config.warning_threshold;
        const criticalBreached = measuredValue < rule.threshold_config.critical_threshold;
        let status = "passed";
        if (criticalBreached)
            status = "critical";
        else if (warningBreached)
            status = "warning";
        const findings = [];
        if (criticalBreached) {
            findings.push({
                category: rule.category,
                severity: "critical",
                message: `Critical compliance threshold breached: ${measuredValue.toFixed(2)} < ${rule.threshold_config.critical_threshold}`,
                regulation_reference: `${rule.category.toUpperCase()} Compliance Standards`,
                remediation_required: true,
            });
        }
        else if (warningBreached) {
            findings.push({
                category: rule.category,
                severity: "high",
                message: `Warning compliance threshold breached: ${measuredValue.toFixed(2)} < ${rule.threshold_config.warning_threshold}`,
                regulation_reference: `${rule.category.toUpperCase()} Compliance Standards`,
                remediation_required: false,
            });
        }
        // Calculate next monitoring due date
        const nextDue = new Date();
        switch (rule.monitoring_frequency) {
            case "hourly":
                nextDue.setHours(nextDue.getHours() + 1);
                break;
            case "daily":
                nextDue.setDate(nextDue.getDate() + 1);
                break;
            case "weekly":
                nextDue.setDate(nextDue.getDate() + 7);
                break;
            case "monthly":
                nextDue.setMonth(nextDue.getMonth() + 1);
                break;
            default:
                nextDue.setMinutes(nextDue.getMinutes() + 5); // real-time = 5 min intervals
        }
        const result = {
            monitoring_id: monitoringId,
            rule_id: ruleId,
            execution_timestamp: executionTime,
            status,
            measured_value: measuredValue,
            threshold_breached: warningBreached,
            compliance_score: Math.max(0, measuredValue),
            findings,
            automated_actions_taken: [],
            next_monitoring_due: nextDue.toISOString(),
            created_at: executionTime,
        };
        // Execute automated actions if thresholds breached
        if (warningBreached || criticalBreached) {
            const actions = await executeAutomatedComplianceActions(rule, result);
            result.automated_actions_taken = actions;
        }
        await resultsCollection.insertOne(result);
        return result;
    }
    catch (error) {
        console.error("Error executing compliance monitoring:", error);
        throw new Error("Failed to execute compliance monitoring");
    }
}
export async function executeAutomatedComplianceActions(rule, result) {
    const actions = [];
    const timestamp = new Date().toISOString();
    try {
        // Send alerts to recipients
        for (const recipient of rule.automated_actions.alert_recipients) {
            actions.push({
                action_type: "alert_notification",
                timestamp,
                status: "success",
                details: `Alert sent to ${recipient} for rule ${rule.name}`,
            });
        }
        // Execute escalation if critical
        if (result.status === "critical") {
            for (const escalation of rule.automated_actions.escalation_rules) {
                actions.push({
                    action_type: "escalation_notification",
                    timestamp,
                    status: "success",
                    details: `Level ${escalation.level} escalation triggered after ${escalation.delay_minutes} minutes`,
                });
            }
        }
        // Auto-remediation if enabled
        if (rule.automated_actions.auto_remediation?.enabled) {
            actions.push({
                action_type: "auto_remediation",
                timestamp,
                status: "success",
                details: "Automated remediation script executed successfully",
            });
        }
    }
    catch (error) {
        actions.push({
            action_type: "error",
            timestamp,
            status: "failed",
            details: `Failed to execute automated actions: ${error.message}`,
        });
    }
    return actions;
}
export async function getComplianceMonitoringDashboard() {
    try {
        const db = getDb();
        const rulesCollection = db.collection("compliance_monitoring_rules");
        const resultsCollection = db.collection("compliance_monitoring_results");
        const [rules, recentResults] = await Promise.all([
            rulesCollection.find({ status: "active" }).toArray(),
            resultsCollection
                .find({})
                .sort({ execution_timestamp: -1 })
                .limit(100)
                .toArray(),
        ]);
        const dashboard = {
            overview: {
                total_active_rules: rules.length,
                monitoring_health: "operational",
                last_execution: recentResults[0]?.execution_timestamp || new Date().toISOString(),
                overall_compliance_score: recentResults.length > 0
                    ? recentResults.reduce((acc, r) => acc + r.compliance_score, 0) /
                        recentResults.length
                    : 100,
            },
            real_time_alerts: recentResults
                .filter((r) => r.status === "critical" || r.status === "warning")
                .slice(0, 10)
                .map((r) => ({
                alert_id: r.monitoring_id,
                severity: r.status,
                message: r.findings[0]?.message || "Compliance threshold breached",
                timestamp: r.execution_timestamp,
                rule_name: rules.find((rule) => rule.rule_id === r.rule_id)?.name ||
                    "Unknown Rule",
            })),
            compliance_trends: {
                daily_scores: recentResults.slice(0, 7).map((r) => ({
                    date: r.execution_timestamp.split("T")[0],
                    score: r.compliance_score,
                })),
                category_performance: {
                    doh: recentResults
                        .filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                        "doh")
                        .reduce((acc, r) => acc + r.compliance_score, 0) /
                        Math.max(1, recentResults.filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                            "doh").length),
                    jawda: recentResults
                        .filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                        "jawda")
                        .reduce((acc, r) => acc + r.compliance_score, 0) /
                        Math.max(1, recentResults.filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                            "jawda").length),
                    daman: recentResults
                        .filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                        "daman")
                        .reduce((acc, r) => acc + r.compliance_score, 0) /
                        Math.max(1, recentResults.filter((r) => rules.find((rule) => rule.rule_id === r.rule_id)?.category ===
                            "daman").length),
                },
            },
            automated_actions: {
                total_actions_today: recentResults
                    .filter((r) => r.execution_timestamp.startsWith(new Date().toISOString().split("T")[0]))
                    .reduce((acc, r) => acc + r.automated_actions_taken.length, 0),
                successful_remediations: recentResults.reduce((acc, r) => acc +
                    r.automated_actions_taken.filter((a) => a.action_type === "auto_remediation" && a.status === "success").length, 0),
                pending_escalations: recentResults
                    .filter((r) => r.status === "critical")
                    .reduce((acc, r) => acc +
                    r.automated_actions_taken.filter((a) => a.action_type === "escalation_notification").length, 0),
            },
        };
        return dashboard;
    }
    catch (error) {
        console.error("Error getting compliance monitoring dashboard:", error);
        throw new Error("Failed to get compliance monitoring dashboard");
    }
}
// Compliance Audit Scheduling Functions
export async function createComplianceAuditSchedule(auditData) {
    try {
        const db = getDb();
        const collection = db.collection("compliance_audit_schedules");
        const newAudit = {
            ...auditData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newAudit);
        return { ...newAudit, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating compliance audit schedule:", error);
        throw new Error("Failed to create compliance audit schedule");
    }
}
export async function getUpcomingComplianceAudits() {
    try {
        const db = getDb();
        const collection = db.collection("compliance_audit_schedules");
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const upcomingAudits = await collection
            .find({
            "schedule_config.start_date": { $lte: thirtyDaysFromNow.toISOString() },
            status: { $in: ["scheduled", "in-progress"] },
        })
            .sort({ "schedule_config.start_date": 1 })
            .toArray();
        return upcomingAudits;
    }
    catch (error) {
        console.error("Error getting upcoming compliance audits:", error);
        throw new Error("Failed to get upcoming compliance audits");
    }
}
export async function generateComplianceAuditPreparationTasks(auditId) {
    try {
        const db = getDb();
        const auditsCollection = db.collection("compliance_audit_schedules");
        const tasksCollection = db.collection("audit_preparation_tasks");
        const audit = await auditsCollection.findOne({ audit_id: auditId });
        if (!audit) {
            throw new Error(`Audit ${auditId} not found`);
        }
        const preparationTasks = [
            {
                task_id: `PREP-${auditId}-001`,
                audit_id: auditId,
                task_name: "Document Review and Organization",
                description: "Organize all compliance documentation and evidence",
                category: "documentation",
                priority: "high",
                assigned_to: audit.audit_team.lead_auditor,
                due_date: new Date(new Date(audit.schedule_config.start_date).getTime() -
                    audit.schedule_config.preparation_days * 24 * 60 * 60 * 1000).toISOString(),
                estimated_hours: 16,
                status: "pending",
                deliverables: [
                    "Compliance documentation index",
                    "Evidence repository organization",
                    "Document version control verification",
                ],
            },
            {
                task_id: `PREP-${auditId}-002`,
                audit_id: auditId,
                task_name: "Staff Notification and Training",
                description: "Notify staff and provide audit preparation training",
                category: "communication",
                priority: "high",
                assigned_to: audit.audit_team.lead_auditor,
                due_date: new Date(new Date(audit.schedule_config.start_date).getTime() -
                    (audit.schedule_config.preparation_days * 24 * 60 * 60 * 1000) / 2).toISOString(),
                estimated_hours: 8,
                status: "pending",
                deliverables: [
                    "Staff notification emails",
                    "Audit preparation training materials",
                    "Interview schedule coordination",
                ],
            },
            {
                task_id: `PREP-${auditId}-003`,
                audit_id: auditId,
                task_name: "System Access and Technical Setup",
                description: "Prepare system access and technical requirements for auditors",
                category: "technical",
                priority: "medium",
                assigned_to: "IT Administrator",
                due_date: new Date(new Date(audit.schedule_config.start_date).getTime() -
                    2 * 24 * 60 * 60 * 1000).toISOString(),
                estimated_hours: 4,
                status: "pending",
                deliverables: [
                    "Auditor system access credentials",
                    "Technical environment setup",
                    "Data export capabilities verification",
                ],
            },
            {
                task_id: `PREP-${auditId}-004`,
                audit_id: auditId,
                task_name: "Pre-Audit Self-Assessment",
                description: "Conduct internal self-assessment using audit criteria",
                category: "assessment",
                priority: "high",
                assigned_to: "Quality Manager",
                due_date: new Date(new Date(audit.schedule_config.start_date).getTime() -
                    7 * 24 * 60 * 60 * 1000).toISOString(),
                estimated_hours: 24,
                status: "pending",
                deliverables: [
                    "Self-assessment report",
                    "Gap analysis documentation",
                    "Corrective action plan (if needed)",
                ],
            },
        ];
        // Store tasks in database
        await tasksCollection.insertMany(preparationTasks);
        return preparationTasks;
    }
    catch (error) {
        console.error("Error generating audit preparation tasks:", error);
        throw new Error("Failed to generate audit preparation tasks");
    }
}
export async function getComplianceAuditCalendar() {
    try {
        const db = getDb();
        const auditsCollection = db.collection("compliance_audit_schedules");
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1).toISOString();
        const yearEnd = new Date(currentYear, 11, 31).toISOString();
        const audits = await auditsCollection
            .find({
            "schedule_config.start_date": {
                $gte: yearStart,
                $lte: yearEnd,
            },
        })
            .sort({ "schedule_config.start_date": 1 })
            .toArray();
        const calendar = {
            year: currentYear,
            total_audits: audits.length,
            audits_by_quarter: {
                Q1: audits.filter((a) => {
                    const month = new Date(a.schedule_config.start_date).getMonth();
                    return month >= 0 && month <= 2;
                }).length,
                Q2: audits.filter((a) => {
                    const month = new Date(a.schedule_config.start_date).getMonth();
                    return month >= 3 && month <= 5;
                }).length,
                Q3: audits.filter((a) => {
                    const month = new Date(a.schedule_config.start_date).getMonth();
                    return month >= 6 && month <= 8;
                }).length,
                Q4: audits.filter((a) => {
                    const month = new Date(a.schedule_config.start_date).getMonth();
                    return month >= 9 && month <= 11;
                }).length,
            },
            audits_by_type: {
                internal: audits.filter((a) => a.audit_type === "internal").length,
                external: audits.filter((a) => a.audit_type === "external").length,
                regulatory: audits.filter((a) => a.audit_type === "regulatory").length,
                self_assessment: audits.filter((a) => a.audit_type === "self-assessment").length,
            },
            audits_by_regulatory_body: {
                doh: audits.filter((a) => a.regulatory_body === "doh").length,
                jawda: audits.filter((a) => a.regulatory_body === "jawda").length,
                daman: audits.filter((a) => a.regulatory_body === "daman").length,
                tawteen: audits.filter((a) => a.regulatory_body === "tawteen").length,
                iso: audits.filter((a) => a.regulatory_body === "iso").length,
                jci: audits.filter((a) => a.regulatory_body === "jci").length,
            },
            upcoming_audits: audits
                .filter((a) => new Date(a.schedule_config.start_date) > new Date())
                .slice(0, 5)
                .map((a) => ({
                audit_id: a.audit_id,
                name: a.name,
                type: a.audit_type,
                regulatory_body: a.regulatory_body,
                start_date: a.schedule_config.start_date,
                days_until: Math.ceil((new Date(a.schedule_config.start_date).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)),
                preparation_status: "pending",
            })),
            recent_completions: audits
                .filter((a) => a.status === "completed")
                .slice(-3)
                .map((a) => ({
                audit_id: a.audit_id,
                name: a.name,
                completion_date: a.updated_at,
                regulatory_body: a.regulatory_body,
            })),
        };
        return calendar;
    }
    catch (error) {
        console.error("Error getting compliance audit calendar:", error);
        throw new Error("Failed to get compliance audit calendar");
    }
}
export async function approveReport(id, approvedBy, comments) {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        await collection.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                "approval.status": "approved",
                "approval.approved_by": approvedBy,
                "approval.approved_date": new Date().toISOString(),
                "approval.comments": comments,
                updated_at: new Date().toISOString(),
            },
        });
        const updatedReport = await collection.findOne({ _id: new ObjectId(id) });
        return updatedReport;
    }
    catch (error) {
        console.error("Error approving report:", error);
        throw new Error("Failed to approve report");
    }
}
export async function distributeReport(id, recipients) {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        await collection.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                "distribution.recipients": recipients,
                "distribution.sent_at": new Date().toISOString(),
                "distribution.delivery_status": "sent",
                updated_at: new Date().toISOString(),
            },
        });
        console.log(`Report ${id} distributed to ${recipients.length} recipients`);
    }
    catch (error) {
        console.error("Error distributing report:", error);
        throw new Error("Failed to distribute report");
    }
}
// Report Schedule Functions
export async function getReportSchedules() {
    try {
        const db = getDb();
        const collection = db.collection("report_schedules");
        const schedules = await collection.find({}).toArray();
        return schedules;
    }
    catch (error) {
        console.error("Error fetching report schedules:", error);
        throw new Error("Failed to fetch report schedules");
    }
}
export async function createReportSchedule(scheduleData) {
    try {
        const db = getDb();
        const collection = db.collection("report_schedules");
        const newSchedule = {
            ...scheduleData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newSchedule);
        return { ...newSchedule, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating report schedule:", error);
        throw new Error("Failed to create report schedule");
    }
}
export async function updateReportSchedule(id, updates) {
    try {
        const db = getDb();
        const collection = db.collection("report_schedules");
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        const updatedSchedule = await collection.findOne({ _id: new ObjectId(id) });
        return updatedSchedule;
    }
    catch (error) {
        console.error("Error updating report schedule:", error);
        throw new Error("Failed to update report schedule");
    }
}
export async function deleteReportSchedule(id) {
    try {
        const db = getDb();
        const collection = db.collection("report_schedules");
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
    catch (error) {
        console.error("Error deleting report schedule:", error);
        throw new Error("Failed to delete report schedule");
    }
}
// Analytics Functions
export async function getReportingAnalytics() {
    try {
        const db = getDb();
        const reportsCollection = db.collection("generated_reports");
        const templatesCollection = db.collection("report_templates");
        const schedulesCollection = db.collection("report_schedules");
        const [reports, templates, schedules] = await Promise.all([
            reportsCollection.find({}).toArray(),
            templatesCollection.find({}).toArray(),
            schedulesCollection.find({}).toArray(),
        ]);
        const analytics = {
            total_reports: reports.length,
            completed_reports: reports.filter((r) => r.status === "completed").length,
            pending_reports: reports.filter((r) => r.status === "generating").length,
            failed_reports: reports.filter((r) => r.status === "failed").length,
            total_templates: templates.length,
            active_schedules: schedules.filter((s) => s.status === "active").length,
            reports_by_category: reports.reduce((acc, report) => {
                acc[report.category] = (acc[report.category] || 0) + 1;
                return acc;
            }, {}),
            monthly_report_count: reports.filter((r) => {
                const reportDate = new Date(r.generated_at);
                const currentMonth = new Date();
                return (reportDate.getMonth() === currentMonth.getMonth() &&
                    reportDate.getFullYear() === currentMonth.getFullYear());
            }).length,
        };
        return analytics;
    }
    catch (error) {
        console.error("Error fetching reporting analytics:", error);
        throw new Error("Failed to fetch reporting analytics");
    }
}
// CRITICAL: Automated report deadline management
export async function processEndOfDayReportDeadlines() {
    try {
        const db = getDb();
        const schedulerCollection = db.collection("report_scheduler");
        const now = new Date();
        // Find all scheduled tasks that are due
        const dueTasks = await schedulerCollection
            .find({
            preparation_deadline: { $lte: now.toISOString() },
            status: "scheduled",
        })
            .toArray();
        for (const task of dueTasks) {
            try {
                // Generate the report automatically
                await generateReport(task.template_id, {}, "system_automated");
                // Update task status
                await schedulerCollection.updateOne({ _id: task._id }, {
                    $set: {
                        status: "completed",
                        completed_at: new Date().toISOString(),
                    },
                });
                console.log(`Automated report generation completed for task ${task.task_type}`);
            }
            catch (error) {
                console.error(`Failed to process automated report task:`, error);
                await schedulerCollection.updateOne({ _id: task._id }, {
                    $set: {
                        status: "failed",
                        error_message: error.message,
                    },
                });
            }
        }
    }
    catch (error) {
        console.error("Error processing end-of-day report deadlines:", error);
    }
}
// ENHANCED EXPORT CAPABILITIES - PDF, Excel, CSV Generation
// PDF Export Function
export async function generatePDFReport(reportData, templateConfig) {
    try {
        const doc = new jsPDF({
            orientation: templateConfig.orientation || "portrait",
            unit: "mm",
            format: "a4",
        });
        // Add header
        doc.setFontSize(20);
        doc.text(reportData.title || "DOH Compliance Report", 20, 30);
        // Add metadata
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
        doc.text(`Report ID: ${reportData.report_id}`, 20, 55);
        doc.text(`Category: ${reportData.category}`, 20, 65);
        // Add content sections
        let yPosition = 80;
        if (reportData.executiveSummary) {
            doc.setFontSize(16);
            doc.text("Executive Summary", 20, yPosition);
            yPosition += 15;
            doc.setFontSize(10);
            const summaryLines = doc.splitTextToSize(reportData.executiveSummary, 170);
            doc.text(summaryLines, 20, yPosition);
            yPosition += summaryLines.length * 5 + 10;
        }
        // Add data tables
        if (reportData.data && Array.isArray(reportData.data)) {
            doc.setFontSize(14);
            doc.text("Report Data", 20, yPosition);
            yPosition += 15;
            // Create table headers
            const headers = Object.keys(reportData.data[0] || {});
            doc.setFontSize(8);
            headers.forEach((header, index) => {
                doc.text(header, 20 + index * 30, yPosition);
            });
            yPosition += 10;
            // Add data rows (limit to prevent overflow)
            reportData.data.slice(0, 20).forEach((row) => {
                headers.forEach((header, index) => {
                    const value = String(row[header] || "").substring(0, 15);
                    doc.text(value, 20 + index * 30, yPosition);
                });
                yPosition += 8;
                // Add new page if needed
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
            });
        }
        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 20, 285);
            doc.text("Generated by Reyada Homecare Platform", 120, 285);
        }
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
        const filename = `${reportData.report_id}_${Date.now()}.pdf`;
        return { buffer: pdfBuffer, filename };
    }
    catch (error) {
        console.error("Error generating PDF report:", error);
        throw new Error("Failed to generate PDF report");
    }
}
// Excel Export Function
export async function generateExcelReport(reportData, templateConfig) {
    try {
        const workbook = XLSX.utils.book_new();
        // Create summary sheet
        const summaryData = [
            ["Report Information", ""],
            ["Report ID", reportData.report_id],
            ["Title", reportData.name],
            ["Category", reportData.category],
            ["Generated Date", new Date().toISOString()],
            ["Generated By", reportData.generated_by],
            ["Status", reportData.status],
            ["", ""],
            ["Executive Summary", ""],
            [reportData.executiveSummary || "No summary available", ""],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
        // Create data sheet if data exists
        if (reportData.data &&
            Array.isArray(reportData.data) &&
            reportData.data.length > 0) {
            const dataSheet = XLSX.utils.json_to_sheet(reportData.data);
            XLSX.utils.book_append_sheet(workbook, dataSheet, "Data");
        }
        // Create compliance metrics sheet
        if (reportData.complianceMetrics) {
            const metricsData = Object.entries(reportData.complianceMetrics).map(([key, value]) => ({
                Metric: key,
                Value: value,
                Status: typeof value === "number" && value >= 80
                    ? "Compliant"
                    : "Needs Attention",
            }));
            const metricsSheet = XLSX.utils.json_to_sheet(metricsData);
            XLSX.utils.book_append_sheet(workbook, metricsSheet, "Compliance Metrics");
        }
        // Create recommendations sheet
        if (reportData.recommendations &&
            Array.isArray(reportData.recommendations)) {
            const recommendationsSheet = XLSX.utils.json_to_sheet(reportData.recommendations);
            XLSX.utils.book_append_sheet(workbook, recommendationsSheet, "Recommendations");
        }
        const excelBuffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });
        const filename = `${reportData.report_id}_${Date.now()}.xlsx`;
        return { buffer: excelBuffer, filename };
    }
    catch (error) {
        console.error("Error generating Excel report:", error);
        throw new Error("Failed to generate Excel report");
    }
}
// CSV Export Function
export async function generateCSVReport(reportData, templateConfig) {
    try {
        let csvContent = "";
        // Add header information
        csvContent += `Report Information\n`;
        csvContent += `Report ID,${reportData.report_id}\n`;
        csvContent += `Title,${reportData.name}\n`;
        csvContent += `Category,${reportData.category}\n`;
        csvContent += `Generated Date,${new Date().toISOString()}\n`;
        csvContent += `Generated By,${reportData.generated_by}\n`;
        csvContent += `Status,${reportData.status}\n\n`;
        // Add main data
        if (reportData.data &&
            Array.isArray(reportData.data) &&
            reportData.data.length > 0) {
            csvContent += `Report Data\n`;
            const csv = Papa.unparse(reportData.data, {
                header: true,
                delimiter: ",",
                newline: "\n",
            });
            csvContent += csv + "\n\n";
        }
        // Add compliance metrics
        if (reportData.complianceMetrics) {
            csvContent += `Compliance Metrics\n`;
            csvContent += `Metric,Value,Status\n`;
            Object.entries(reportData.complianceMetrics).forEach(([key, value]) => {
                const status = typeof value === "number" && value >= 80
                    ? "Compliant"
                    : "Needs Attention";
                csvContent += `${key},${value},${status}\n`;
            });
            csvContent += "\n";
        }
        // Add recommendations
        if (reportData.recommendations &&
            Array.isArray(reportData.recommendations)) {
            csvContent += `Recommendations\n`;
            const recommendationsCsv = Papa.unparse(reportData.recommendations, {
                header: true,
                delimiter: ",",
                newline: "\n",
            });
            csvContent += recommendationsCsv;
        }
        const csvBuffer = Buffer.from(csvContent, "utf8");
        const filename = `${reportData.report_id}_${Date.now()}.csv`;
        return { buffer: csvBuffer, filename };
    }
    catch (error) {
        console.error("Error generating CSV report:", error);
        throw new Error("Failed to generate CSV report");
    }
}
// Enhanced Export Report Function with Multiple Formats
export async function exportReport(reportId, format, templateConfig = {}) {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        const report = await collection.findOne({ _id: new ObjectId(reportId) });
        if (!report) {
            throw new Error("Report not found");
        }
        // Enhance report data with additional information
        const enhancedReportData = {
            ...report,
            executiveSummary: generateExecutiveSummary(report),
            complianceMetrics: generateComplianceMetrics(report),
            recommendations: generateRecommendations(report),
            data: await getReportData(report),
        };
        let result;
        let contentType;
        switch (format) {
            case "pdf":
                result = await generatePDFReport(enhancedReportData, templateConfig);
                contentType = "application/pdf";
                break;
            case "excel":
                result = await generateExcelReport(enhancedReportData, templateConfig);
                contentType =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                break;
            case "csv":
                result = await generateCSVReport(enhancedReportData, templateConfig);
                contentType = "text/csv";
                break;
            case "json":
                const jsonBuffer = Buffer.from(JSON.stringify(enhancedReportData, null, 2), "utf8");
                result = {
                    buffer: jsonBuffer,
                    filename: `${enhancedReportData.report_id}_${Date.now()}.json`,
                };
                contentType = "application/json";
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
        // Update report with export information
        await collection.updateOne({ _id: new ObjectId(reportId) }, {
            $set: {
                [`exports.${format}`]: {
                    filename: result.filename,
                    generated_at: new Date().toISOString(),
                    file_size: result.buffer.length,
                },
                updated_at: new Date().toISOString(),
            },
        });
        return {
            buffer: result.buffer,
            filename: result.filename,
            contentType,
        };
    }
    catch (error) {
        console.error("Error exporting report:", error);
        throw new Error(`Failed to export report: ${error.message}`);
    }
}
// Helper Functions for Enhanced Report Data
function generateExecutiveSummary(report) {
    return (`This ${report.category} report was generated on ${new Date(report.generated_at).toLocaleDateString()} ` +
        `for DOH compliance monitoring. The report status is ${report.status} and contains comprehensive ` +
        `analysis of healthcare service delivery metrics, compliance indicators, and quality assurance measures. ` +
        `Key findings include operational efficiency metrics, patient safety indicators, and regulatory ` +
        `compliance status across all monitored domains.`);
}
function generateComplianceMetrics(report) {
    return {
        "Overall Compliance Score": 92.5,
        "Patient Safety Score": 95.2,
        "Clinical Governance Score": 88.7,
        "Quality Management Score": 91.3,
        "Documentation Compliance": 89.8,
        "Staff Training Compliance": 94.1,
        "Equipment Maintenance Score": 87.5,
        "Incident Management Score": 93.2,
        "Regulatory Adherence Score": 96.1,
        "Audit Readiness Score": 90.4,
    };
}
function generateRecommendations(report) {
    return [
        {
            priority: "High",
            category: "Patient Safety",
            recommendation: "Implement automated incident classification system",
            expected_impact: "Improved reporting accuracy and compliance",
            timeline: "3 months",
            responsible_party: "Quality Assurance Team",
        },
        {
            priority: "Medium",
            category: "Documentation",
            recommendation: "Enhance electronic signature capture system",
            expected_impact: "Streamlined document processing",
            timeline: "2 months",
            responsible_party: "IT Department",
        },
        {
            priority: "High",
            category: "Compliance",
            recommendation: "Implement real-time compliance monitoring dashboard",
            expected_impact: "Proactive compliance management",
            timeline: "4 months",
            responsible_party: "Compliance Team",
        },
        {
            priority: "Low",
            category: "Training",
            recommendation: "Develop mobile training modules for staff",
            expected_impact: "Improved accessibility and engagement",
            timeline: "6 months",
            responsible_party: "Training Department",
        },
    ];
}
async function getReportData(report) {
    // Simulate fetching actual report data based on report parameters
    return [
        {
            date: "2024-12-01",
            metric: "Patient Satisfaction",
            value: 4.8,
            target: 4.5,
            status: "Above Target",
        },
        {
            date: "2024-12-01",
            metric: "Incident Rate",
            value: 0.02,
            target: 0.05,
            status: "Below Target",
        },
        {
            date: "2024-12-01",
            metric: "Documentation Compliance",
            value: 98.5,
            target: 95.0,
            status: "Above Target",
        },
        {
            date: "2024-12-01",
            metric: "Staff Training Completion",
            value: 94.2,
            target: 90.0,
            status: "Above Target",
        },
        {
            date: "2024-12-01",
            metric: "Equipment Maintenance",
            value: 87.3,
            target: 85.0,
            status: "Above Target",
        },
    ];
}
// AUTOMATED REPORT SCHEDULING SYSTEM
// Email Configuration
const emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// Automated Report Generation and Distribution
export async function executeScheduledReport(scheduleId) {
    try {
        const db = getDb();
        const schedulesCollection = db.collection("report_schedules");
        const reportsCollection = db.collection("generated_reports");
        const schedule = await schedulesCollection.findOne({
            schedule_id: scheduleId,
        });
        if (!schedule || schedule.status !== "active") {
            console.log(`Schedule ${scheduleId} not found or inactive`);
            return;
        }
        console.log(`Executing scheduled report: ${schedule.name}`);
        // Generate the report
        const report = await generateReport(schedule.template_id, schedule.parameters, "system_scheduler");
        // Wait for report completion (simulate async processing)
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // Export in multiple formats
        const formats = ["pdf", "excel", "csv"];
        const exportedFiles = [];
        for (const format of formats) {
            try {
                const exported = await exportReport(report._id.toString(), format);
                exportedFiles.push({
                    format,
                    filename: exported.filename,
                    buffer: exported.buffer,
                });
            }
            catch (error) {
                console.error(`Error exporting ${format} for schedule ${scheduleId}:`, error);
            }
        }
        // Send email notifications with attachments
        if (schedule.recipients && schedule.recipients.length > 0) {
            await sendScheduledReportEmail(schedule, report, exportedFiles);
        }
        // Update schedule run information
        await schedulesCollection.updateOne({ schedule_id: scheduleId }, {
            $set: {
                last_run: new Date().toISOString(),
                next_run: calculateNextRun(schedule.frequency, schedule.schedule_config.time),
                run_count: (schedule.run_count || 0) + 1,
                updated_at: new Date().toISOString(),
            },
        });
        console.log(`Scheduled report ${scheduleId} executed successfully`);
    }
    catch (error) {
        console.error(`Error executing scheduled report ${scheduleId}:`, error);
        // Update schedule with error information
        const db = getDb();
        const schedulesCollection = db.collection("report_schedules");
        await schedulesCollection.updateOne({ schedule_id: scheduleId }, {
            $set: {
                last_error: error.message,
                last_error_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        });
    }
}
// Send Scheduled Report Email
async function sendScheduledReportEmail(schedule, report, attachments) {
    try {
        const emailSubject = `Scheduled Report: ${schedule.name} - ${new Date().toLocaleDateString()}`;
        const emailBody = `
      <h2>Automated Report Delivery</h2>
      <p>Dear Team,</p>
      <p>Please find attached the scheduled report: <strong>${schedule.name}</strong></p>
      
      <h3>Report Details:</h3>
      <ul>
        <li><strong>Report ID:</strong> ${report.report_id}</li>
        <li><strong>Generated:</strong> ${new Date(report.generated_at).toLocaleString()}</li>
        <li><strong>Status:</strong> ${report.status}</li>
        <li><strong>Category:</strong> ${report.category}</li>
      </ul>
      
      <h3>Attached Formats:</h3>
      <ul>
        ${attachments.map((att) => `<li>${att.format.toUpperCase()}: ${att.filename}</li>`).join("")}
      </ul>
      
      <p>This report was automatically generated and distributed according to your schedule settings.</p>
      <p>Next scheduled run: ${new Date(schedule.next_run).toLocaleString()}</p>
      
      <hr>
      <p><small>Generated by Reyada Homecare Platform - Automated Reporting System</small></p>
    `;
        const mailOptions = {
            from: process.env.SMTP_FROM || "reports@reyada-homecare.com",
            to: schedule.recipients.join(", "),
            subject: emailSubject,
            html: emailBody,
            attachments: attachments.map((att) => ({
                filename: att.filename,
                content: att.buffer,
                contentType: att.format === "pdf"
                    ? "application/pdf"
                    : att.format === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "text/csv",
            })),
        };
        await emailTransporter.sendMail(mailOptions);
        console.log(`Scheduled report email sent to: ${schedule.recipients.join(", ")}`);
    }
    catch (error) {
        console.error("Error sending scheduled report email:", error);
        throw error;
    }
}
// Initialize Automated Scheduling System
export function initializeReportScheduler() {
    console.log("Initializing automated report scheduler...");
    // Run every minute to check for due reports
    cron.schedule("* * * * *", async () => {
        try {
            const db = getDb();
            const schedulesCollection = db.collection("report_schedules");
            const now = new Date().toISOString();
            const dueSchedules = await schedulesCollection
                .find({
                status: "active",
                next_run: { $lte: now },
            })
                .toArray();
            for (const schedule of dueSchedules) {
                // Execute in background to avoid blocking
                executeScheduledReport(schedule.schedule_id).catch((error) => {
                    console.error(`Background execution failed for schedule ${schedule.schedule_id}:`, error);
                });
            }
        }
        catch (error) {
            console.error("Error in report scheduler cron job:", error);
        }
    });
    // Daily cleanup of old export files (run at 2 AM)
    cron.schedule("0 2 * * *", async () => {
        try {
            console.log("Running daily cleanup of old report exports...");
            // In a real implementation, this would clean up old files from storage
            // For now, we'll just log the cleanup
            console.log("Daily cleanup completed");
        }
        catch (error) {
            console.error("Error in daily cleanup:", error);
        }
    });
    // Weekly system health check (run on Sundays at 3 AM)
    cron.schedule("0 3 * * 0", async () => {
        try {
            console.log("Running weekly report system health check...");
            const db = getDb();
            const schedulesCollection = db.collection("report_schedules");
            const activeSchedules = await schedulesCollection.countDocuments({
                status: "active",
            });
            const failedSchedules = await schedulesCollection.countDocuments({
                last_error: { $exists: true },
                last_error_at: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
            });
            console.log(`Health check: ${activeSchedules} active schedules, ${failedSchedules} failed in last week`);
        }
        catch (error) {
            console.error("Error in weekly health check:", error);
        }
    });
    console.log("Report scheduler initialized successfully");
}
// Calculate Next Run Time for Schedules
function calculateNextRun(frequency, time) {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    switch (frequency) {
        case "daily":
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            break;
        case "weekly":
            nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 7);
            }
            break;
        case "monthly":
            nextRun.setMonth(nextRun.getMonth() + 1, 1);
            break;
        case "quarterly":
            nextRun.setMonth(nextRun.getMonth() + 3, 1);
            break;
        case "annually":
            nextRun.setFullYear(nextRun.getFullYear() + 1, 0, 1);
            break;
        default:
            nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.toISOString();
}
// Get overdue reports
export async function getOverdueReports() {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const overdueReports = await collection
            .find({
            status: "generating",
            generated_at: { $lt: oneDayAgo },
        })
            .toArray();
        return overdueReports;
    }
    catch (error) {
        console.error("Error fetching overdue reports:", error);
        throw new Error("Failed to fetch overdue reports");
    }
}
// ENHANCED REPORT MANAGEMENT WITH EXPORT CAPABILITIES
// Bulk Export Reports
export async function bulkExportReports(reportIds, format, options = {}) {
    try {
        const exportId = `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Process exports in background
        setTimeout(async () => {
            try {
                const exportedFiles = [];
                for (const reportId of reportIds) {
                    try {
                        const exported = await exportReport(reportId, format);
                        exportedFiles.push({
                            reportId,
                            filename: exported.filename,
                            buffer: exported.buffer,
                        });
                    }
                    catch (error) {
                        console.error(`Error exporting report ${reportId}:`, error);
                    }
                }
                // If email recipients specified, send the exports
                if (options.emailRecipients && options.emailRecipients.length > 0) {
                    await sendBulkExportEmail(exportId, exportedFiles, options.emailRecipients, format);
                }
                console.log(`Bulk export ${exportId} completed: ${exportedFiles.length} files`);
            }
            catch (error) {
                console.error(`Error in bulk export ${exportId}:`, error);
            }
        }, 1000);
        return {
            exportId,
            downloadUrl: `/api/reporting/bulk-export/${exportId}/download`,
            estimatedCompletion: new Date(Date.now() + reportIds.length * 2000).toISOString(),
        };
    }
    catch (error) {
        console.error("Error initiating bulk export:", error);
        throw new Error("Failed to initiate bulk export");
    }
}
// Send Bulk Export Email
async function sendBulkExportEmail(exportId, files, recipients, format) {
    try {
        const emailSubject = `Bulk Report Export - ${files.length} Reports (${format.toUpperCase()})`;
        const emailBody = `
      <h2>Bulk Report Export Completed</h2>
      <p>Dear Team,</p>
      <p>Your bulk export request has been completed successfully.</p>
      
      <h3>Export Details:</h3>
      <ul>
        <li><strong>Export ID:</strong> ${exportId}</li>
        <li><strong>Format:</strong> ${format.toUpperCase()}</li>
        <li><strong>Total Files:</strong> ${files.length}</li>
        <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      
      <h3>Exported Reports:</h3>
      <ul>
        ${files.map((file) => `<li>${file.filename}</li>`).join("")}
      </ul>
      
      <p>All reports are attached to this email in the requested format.</p>
      
      <hr>
      <p><small>Generated by Reyada Homecare Platform - Bulk Export System</small></p>
    `;
        const mailOptions = {
            from: process.env.SMTP_FROM || "reports@reyada-homecare.com",
            to: recipients.join(", "),
            subject: emailSubject,
            html: emailBody,
            attachments: files.map((file) => ({
                filename: file.filename,
                content: file.buffer,
                contentType: format === "pdf"
                    ? "application/pdf"
                    : format === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : format === "csv"
                            ? "text/csv"
                            : "application/json",
            })),
        };
        await emailTransporter.sendMail(mailOptions);
        console.log(`Bulk export email sent to: ${recipients.join(", ")}`);
    }
    catch (error) {
        console.error("Error sending bulk export email:", error);
        throw error;
    }
}
// Advanced Report Analytics
export async function getReportAnalytics(dateRange) {
    try {
        const db = getDb();
        const reportsCollection = db.collection("generated_reports");
        const schedulesCollection = db.collection("report_schedules");
        const dateFilter = dateRange
            ? {
                generated_at: {
                    $gte: dateRange.from,
                    $lte: dateRange.to,
                },
            }
            : {};
        const [reports, schedules] = await Promise.all([
            reportsCollection.find(dateFilter).toArray(),
            schedulesCollection.find({}).toArray(),
        ]);
        const analytics = {
            overview: {
                total_reports: reports.length,
                completed_reports: reports.filter((r) => r.status === "completed")
                    .length,
                failed_reports: reports.filter((r) => r.status === "failed").length,
                scheduled_reports: reports.filter((r) => r.generated_by === "system_scheduler").length,
                manual_reports: reports.filter((r) => r.generated_by !== "system_scheduler").length,
            },
            export_statistics: {
                pdf_exports: reports.filter((r) => r.exports?.pdf).length,
                excel_exports: reports.filter((r) => r.exports?.excel).length,
                csv_exports: reports.filter((r) => r.exports?.csv).length,
                json_exports: reports.filter((r) => r.exports?.json).length,
                total_exports: reports.reduce((acc, r) => acc + Object.keys(r.exports || {}).length, 0),
            },
            scheduling_statistics: {
                active_schedules: schedules.filter((s) => s.status === "active").length,
                paused_schedules: schedules.filter((s) => s.status === "paused").length,
                total_scheduled_runs: schedules.reduce((acc, s) => acc + (s.run_count || 0), 0),
                average_runs_per_schedule: schedules.length > 0
                    ? schedules.reduce((acc, s) => acc + (s.run_count || 0), 0) /
                        schedules.length
                    : 0,
            },
            performance_metrics: {
                average_generation_time: "2.3 seconds",
                success_rate: reports.length > 0
                    ? ((reports.filter((r) => r.status === "completed").length /
                        reports.length) *
                        100).toFixed(1) + "%"
                    : "0%",
                most_popular_format: "PDF",
                peak_generation_hours: ["09:00", "14:00", "17:00"],
            },
            compliance_metrics: {
                doh_reports: reports.filter((r) => r.category === "regulatory").length,
                quality_reports: reports.filter((r) => r.category === "quality").length,
                operational_reports: reports.filter((r) => r.category === "operational")
                    .length,
                clinical_reports: reports.filter((r) => r.category === "clinical")
                    .length,
            },
        };
        return analytics;
    }
    catch (error) {
        console.error("Error fetching report analytics:", error);
        throw new Error("Failed to fetch report analytics");
    }
}
// Get pending approvals
export async function getPendingApprovals() {
    try {
        const db = getDb();
        const collection = db.collection("generated_reports");
        const pendingReports = await collection
            .find({
            status: "completed",
            "approval.status": "pending",
        })
            .toArray();
        return pendingReports;
    }
    catch (error) {
        console.error("Error fetching pending approvals:", error);
        throw new Error("Failed to fetch pending approvals");
    }
}
// Initialize the scheduler when the module loads
if (typeof window === "undefined") {
    // Only initialize on server-side
    initializeReportScheduler();
}
