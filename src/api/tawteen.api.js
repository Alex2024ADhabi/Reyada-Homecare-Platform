import express from "express";
import { ObjectId } from "./browser-mongodb";
import { mockDb as db } from "./mock-db";
import { inputSanitizer } from "@/services/input-sanitization.service";
const router = express.Router();
// Tawteen Initiative API Endpoints
// Get Tawteen compliance status
router.get("/compliance-status", async (req, res) => {
    try {
        const { region, facilityId } = req.query;
        const complianceData = {
            facilityId: facilityId || "facility-001",
            region: region || "abu-dhabi",
            reportingPeriod: {
                quarter: "Q4-2024",
                year: 2024,
            },
            emiratizationMetrics: {
                totalPositions: 150,
                emiratiEmployees: 45,
                currentPercentage: 30.0,
                targetPercentage: 35.0,
                complianceStatus: "below-target",
                gap: 8, // positions needed to meet target
                trend: "improving",
            },
            categoryBreakdown: {
                healthcare: {
                    total: 80,
                    emirati: 28,
                    percentage: 35.0,
                    target: 40.0,
                    status: "below-target",
                },
                administrative: {
                    total: 45,
                    emirati: 12,
                    percentage: 26.7,
                    target: 30.0,
                    status: "below-target",
                },
                support: {
                    total: 25,
                    emirati: 5,
                    percentage: 20.0,
                    target: 25.0,
                    status: "below-target",
                },
            },
            penalties: {
                currentQuarter: 0,
                yearToDate: 15000, // AED
                riskLevel: "medium",
            },
            initiatives: [
                {
                    id: "INIT-001",
                    title: "Graduate Nurse Program",
                    description: "Recruitment and training program for Emirati nursing graduates",
                    status: "active",
                    expectedHires: 8,
                    timeline: "6 months",
                },
                {
                    id: "INIT-002",
                    title: "Administrative Internship Program",
                    description: "Structured internship for Emirati administrative staff",
                    status: "planning",
                    expectedHires: 5,
                    timeline: "3 months",
                },
            ],
            nextReportDue: "2025-01-31",
        };
        res.json(complianceData);
    }
    catch (error) {
        console.error("Error fetching Tawteen compliance status:", error);
        res
            .status(500)
            .json({ error: "Failed to fetch Tawteen compliance status" });
    }
});
// Submit Tawteen report
router.post("/submit-report", async (req, res) => {
    try {
        const reportData = req.body;
        // Validate required fields
        const requiredFields = [
            "facilityId",
            "reportingPeriod",
            "emiratizationData",
            "submittedBy",
        ];
        const missingFields = requiredFields.filter((field) => !reportData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields,
            });
        }
        // Validate Emirates ID format for Emirati employees
        if (reportData.emiratiEmployees) {
            for (const employee of reportData.emiratiEmployees) {
                if (employee.emiratesId &&
                    !ValidationUtils.validateEmiratesId(employee.emiratesId)) {
                    return res.status(400).json({
                        error: `Invalid Emirates ID format for employee: ${employee.name}`,
                        field: "emiratesId",
                    });
                }
            }
        }
        const report = {
            _id: new ObjectId(),
            reportId: `TWN-${Date.now()}`,
            ...reportData,
            submissionDate: new Date().toISOString(),
            status: "submitted",
            reviewStatus: "pending",
            complianceCalculation: {
                totalPositions: reportData.emiratizationData.totalPositions,
                emiratiEmployees: reportData.emiratizationData.emiratiEmployees,
                percentage: ((reportData.emiratizationData.emiratiEmployees /
                    reportData.emiratizationData.totalPositions) *
                    100).toFixed(2),
                targetMet: reportData.emiratizationData.emiratiEmployees /
                    reportData.emiratizationData.totalPositions >=
                    0.35,
            },
        };
        // Store in mock database
        if (!db.tawteenReports) {
            db.tawteenReports = { data: [] };
        }
        db.tawteenReports.data.push(report);
        res.status(201).json({
            success: true,
            reportId: report.reportId,
            submissionDate: report.submissionDate,
            complianceStatus: report.complianceCalculation.targetMet
                ? "compliant"
                : "non-compliant",
            emiratizationPercentage: report.complianceCalculation.percentage,
        });
    }
    catch (error) {
        console.error("Error submitting Tawteen report:", error);
        res.status(500).json({ error: "Failed to submit Tawteen report" });
    }
});
// Get regional targets
router.get("/targets/:region", async (req, res) => {
    try {
        const { region } = req.params;
        const regionalTargets = {
            "abu-dhabi": {
                region: "Abu Dhabi",
                emiratizationTarget: 35.0,
                effectiveDate: "2024-01-01",
                categoryTargets: {
                    healthcare: 40.0,
                    administrative: 30.0,
                    support: 25.0,
                    management: 50.0,
                },
                penalties: {
                    belowTarget: {
                        "25-30%": 5000, // AED per quarter
                        "20-25%": 10000,
                        "15-20%": 15000,
                        "below-15%": 25000,
                    },
                },
                incentives: {
                    aboveTarget: {
                        "35-40%": "recognition_certificate",
                        "40-45%": "performance_bonus",
                        "above-45%": "excellence_award",
                    },
                },
                reportingFrequency: "quarterly",
                nextDeadline: "2025-01-31",
            },
            dubai: {
                region: "Dubai",
                emiratizationTarget: 30.0,
                effectiveDate: "2024-01-01",
                categoryTargets: {
                    healthcare: 35.0,
                    administrative: 25.0,
                    support: 20.0,
                    management: 45.0,
                },
                penalties: {
                    belowTarget: {
                        "20-25%": 3000,
                        "15-20%": 8000,
                        "10-15%": 12000,
                        "below-10%": 20000,
                    },
                },
                reportingFrequency: "quarterly",
                nextDeadline: "2025-01-31",
            },
        };
        const targets = regionalTargets[region.toLowerCase()];
        if (!targets) {
            return res.status(404).json({ error: "Regional targets not found" });
        }
        res.json(targets);
    }
    catch (error) {
        console.error("Error fetching regional targets:", error);
        res.status(500).json({ error: "Failed to fetch regional targets" });
    }
});
// Update workforce data
router.put("/update-workforce-data", async (req, res) => {
    try {
        const workforceData = req.body;
        // Validate required fields
        const requiredFields = ["facilityId", "employees"];
        const missingFields = requiredFields.filter((field) => !workforceData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields,
            });
        }
        // Validate employee data
        for (const employee of workforceData.employees) {
            if (!employee.employeeId || !employee.nationality || !employee.category) {
                return res.status(400).json({
                    error: "Each employee must have employeeId, nationality, and category",
                });
            }
            // Validate Emirates ID for Emirati employees
            if (employee.nationality === "UAE" && employee.emiratesId) {
                if (!ValidationUtils.validateEmiratesId(employee.emiratesId)) {
                    return res.status(400).json({
                        error: `Invalid Emirates ID format for employee: ${employee.employeeId}`,
                        field: "emiratesId",
                    });
                }
            }
        }
        // Calculate Tawteen metrics
        const totalEmployees = workforceData.employees.length;
        const emiratiEmployees = workforceData.employees.filter((emp) => emp.nationality === "UAE").length;
        const emiratizationPercentage = ((emiratiEmployees / totalEmployees) *
            100).toFixed(2);
        const categoryBreakdown = {};
        const categories = [
            "healthcare",
            "administrative",
            "support",
            "management",
        ];
        categories.forEach((category) => {
            const categoryEmployees = workforceData.employees.filter((emp) => emp.category === category);
            const categoryEmiratis = categoryEmployees.filter((emp) => emp.nationality === "UAE");
            categoryBreakdown[category] = {
                total: categoryEmployees.length,
                emirati: categoryEmiratis.length,
                percentage: categoryEmployees.length > 0
                    ? ((categoryEmiratis.length / categoryEmployees.length) *
                        100).toFixed(2)
                    : 0,
            };
        });
        const updateRecord = {
            _id: new ObjectId(),
            facilityId: workforceData.facilityId,
            updateDate: new Date().toISOString(),
            totalEmployees,
            emiratiEmployees,
            emiratizationPercentage: parseFloat(emiratizationPercentage),
            categoryBreakdown,
            updatedBy: workforceData.updatedBy || "system",
            employees: workforceData.employees.map((emp) => ({
                ...emp,
                // Sanitize sensitive data
                emiratesId: emp.emiratesId
                    ? inputSanitizer.sanitizeText(emp.emiratesId, 20).value
                    : null,
            })),
        };
        // Store in mock database
        if (!db.tawteenWorkforceData) {
            db.tawteenWorkforceData = { data: [] };
        }
        db.tawteenWorkforceData.data.push(updateRecord);
        res.json({
            success: true,
            updateId: updateRecord._id.toString(),
            metrics: {
                totalEmployees,
                emiratiEmployees,
                emiratizationPercentage: parseFloat(emiratizationPercentage),
                categoryBreakdown,
            },
            complianceStatus: parseFloat(emiratizationPercentage) >= 35
                ? "compliant"
                : "non-compliant",
        });
    }
    catch (error) {
        console.error("Error updating workforce data:", error);
        res.status(500).json({ error: "Failed to update workforce data" });
    }
});
export default router;
