import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, CreditCard, FileText, Clock, Activity, Shield, Mail, Target, Zap, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const DAMAN_COMPLIANCE_RULES = [
    {
        id: "daman-001",
        name: "MSC Plan Extension Compliance",
        description: "Validates MSC plan extension requirements and 90-day duration limits with enhanced validation",
        category: "Authorization",
        severity: "critical",
        validationFunction: async (data) => {
            const issues = [];
            const recommendations = [];
            let score = 100;
            // MSC Plan Extension validation (Extended until May 14, 2025)
            const mscDeadline = new Date("2025-05-14");
            const currentDate = new Date();
            // Enhanced MSC deadline validation with grace period check
            if (data.mscPlanExtension && currentDate > mscDeadline) {
                issues.push({
                    id: "msc-extension-expired",
                    severity: "critical",
                    message: "MSC plan extension has expired (deadline: May 14, 2025). No further extensions available.",
                    policy: "Defense Health Organization (MSC) Plan Extension - Final Deadline",
                    impactsReimbursement: true,
                });
                score -= 50;
            }
            // MSC grace period warning (30 days before deadline)
            const gracePeriodStart = new Date("2025-04-14");
            if (data.mscPlanExtension &&
                currentDate >= gracePeriodStart &&
                currentDate <= mscDeadline) {
                issues.push({
                    id: "msc-extension-grace-period",
                    severity: "high",
                    message: "MSC plan extension is in final grace period. Deadline: May 14, 2025",
                    policy: "MSC Final Grace Period Warning",
                    impactsReimbursement: false,
                });
                score -= 20;
            }
            // 90-day duration limit validation
            if (data.mscPlanExtension && data.requestedDuration > 90) {
                issues.push({
                    id: "msc-duration-exceeded",
                    severity: "critical",
                    message: "MSC plan extension cannot exceed 90 days duration",
                    policy: "MSC Guidelines - 90 Day Duration Limit",
                    impactsReimbursement: true,
                });
                score -= 40;
            }
            // Initial visit date validation
            if (data.mscPlanExtension && data.initialVisitDate) {
                const initialVisit = new Date(data.initialVisitDate);
                const atcEffectiveDate = new Date(data.atcEffectiveDate || new Date());
                const daysDiff = Math.floor((initialVisit.getTime() - atcEffectiveDate.getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysDiff > 90) {
                    issues.push({
                        id: "initial-visit-late",
                        severity: "high",
                        message: "Initial visit must be within 90 days of ATC effective date",
                        policy: "ATC Initial Visit Requirements",
                        impactsReimbursement: true,
                    });
                    score -= 30;
                }
            }
            // Payment terms validation (30 days as per CN_2025)
            if (data.paymentTerms && data.paymentTerms !== "30_days") {
                issues.push({
                    id: "incorrect-payment-terms",
                    severity: "high",
                    message: "Payment terms must be 30 days as per CN_2025 requirements",
                    policy: "Daman Payment Terms Update 2025",
                    impactsReimbursement: true,
                });
                score -= 25;
            }
            if (score < 100) {
                recommendations.push("Ensure MSC plan extensions are submitted before May 14, 2025 deadline");
                recommendations.push("Limit MSC extension duration to maximum 90 days");
                recommendations.push("Schedule initial visit within 90 days of ATC effective date");
                recommendations.push("Update payment terms to 30 days for CN_2025 compliance");
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
                recommendations,
            };
        },
    },
    {
        id: "daman-002",
        name: "Homecare Service Code Compliance",
        description: "Validates new homecare service codes (17-25-x) and deprecated codes removal",
        category: "Service Codes",
        severity: "critical",
        validationFunction: async (data) => {
            const issues = [];
            const recommendations = [];
            let score = 100;
            const validCodes = [
                "17-25-1",
                "17-25-2",
                "17-25-3",
                "17-25-4",
                "17-25-5",
            ];
            const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];
            const serviceCodes = data.serviceCodes || [];
            // Enhanced deprecated codes detection with detailed impact analysis
            const usedDeprecatedCodes = serviceCodes.filter((code) => deprecatedCodes.includes(code));
            if (usedDeprecatedCodes.length > 0) {
                const deprecatedCodeDetails = {
                    "17-26-1": "Legacy Home Nursing - Replaced by 17-25-1",
                    "17-26-2": "Legacy Physiotherapy - Replaced by 17-25-2",
                    "17-26-3": "Legacy Medical Equipment - Replaced by 17-25-3",
                    "17-26-4": "Legacy Wound Care - Replaced by 17-25-4",
                };
                const detailedMessage = usedDeprecatedCodes
                    .map((code) => `${code}: ${deprecatedCodeDetails[code] || "Unknown deprecated code"}`)
                    .join("; ");
                issues.push({
                    id: "deprecated-service-codes",
                    severity: "critical",
                    message: `Deprecated service codes detected: ${detailedMessage}. These codes are not billable since June 1, 2024`,
                    policy: "New Homecare Standard - Service Code Update V2025",
                    field: "serviceCodes",
                    impactsReimbursement: true,
                });
                score -= 50;
            }
            // Validate new service codes usage
            const validCodesUsed = serviceCodes.filter((code) => validCodes.includes(code));
            if (serviceCodes.length > 0 && validCodesUsed.length === 0) {
                issues.push({
                    id: "no-valid-service-codes",
                    severity: "critical",
                    message: "No valid service codes (17-25-1 to 17-25-5) found in submission",
                    policy: "New Homecare Standard - Required Service Codes",
                    field: "serviceCodes",
                    impactsReimbursement: true,
                });
                score -= 40;
            }
            // Service code pricing validation
            const servicePricing = {
                "17-25-1": 300, // Simple Home Visit - Nursing Service
                "17-25-2": 300, // Simple Home Visit - Supportive Service
                "17-25-3": 800, // Specialized Home Visit - Consultation
                "17-25-4": 900, // Routine Home Nursing Care
                "17-25-5": 1800, // Advanced Home Nursing Care
            };
            serviceCodes.forEach((code) => {
                if (validCodes.includes(code) &&
                    data.servicePricing &&
                    data.servicePricing[code]) {
                    const expectedPrice = servicePricing[code];
                    const actualPrice = data.servicePricing[code];
                    if (actualPrice !== expectedPrice) {
                        issues.push({
                            id: `incorrect-pricing-${code}`,
                            severity: "medium",
                            message: `Incorrect pricing for service code ${code}. Expected: ${expectedPrice} AED, Found: ${actualPrice} AED`,
                            policy: "New Homecare Standard - Service Pricing",
                            field: "servicePricing",
                            impactsReimbursement: false,
                        });
                        score -= 10;
                    }
                }
            });
            if (score < 100) {
                recommendations.push("Remove all deprecated service codes (17-26-1 to 17-26-4) from submissions");
                recommendations.push("Use only valid service codes (17-25-1 to 17-25-5) for homecare services");
                recommendations.push("Verify service code pricing matches Daman approved rates");
                recommendations.push("Update service selection dropdowns to reflect new codes only");
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
                recommendations,
            };
        },
    },
    {
        id: "daman-003",
        name: "Submission Timeline Compliance",
        description: "Validates 8:00 AM daily submission deadline and grace periods",
        category: "Timeline",
        severity: "high",
        validationFunction: async (data) => {
            const issues = [];
            const recommendations = [];
            let score = 100;
            const currentTime = new Date();
            const submissionDeadline = new Date();
            submissionDeadline.setHours(8, 0, 0, 0);
            // Enhanced 8:00 AM daily submission deadline with timezone handling
            const uaeTime = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Dubai",
            });
            const currentUAETime = new Date(uaeTime);
            const submissionDeadlineUAE = new Date(uaeTime);
            submissionDeadlineUAE.setHours(8, 0, 0, 0);
            if (currentUAETime > submissionDeadlineUAE &&
                currentUAETime.getDate() === submissionDeadlineUAE.getDate()) {
                const hoursLate = Math.floor((currentUAETime.getTime() - submissionDeadlineUAE.getTime()) /
                    (1000 * 60 * 60));
                const minutesLate = Math.floor(((currentUAETime.getTime() - submissionDeadlineUAE.getTime()) %
                    (1000 * 60 * 60)) /
                    (1000 * 60));
                issues.push({
                    id: "late-daily-submission",
                    severity: hoursLate >= 4 ? "critical" : "high",
                    message: `Submission after 8:00 AM UAE time daily deadline (${hoursLate}h ${minutesLate}m late). ${hoursLate >= 4 ? "Critical delay - immediate escalation required" : "Escalation approval required"}`,
                    policy: "Daily Submission Timeline Requirements - UAE Time Zone",
                    impactsReimbursement: hoursLate >= 4,
                });
                score -= hoursLate >= 4 ? 50 : 30;
            }
            // MSC submission grace period validation (until March 1, 2025)
            const mscGracePeriod = new Date("2025-03-01");
            if (data.mscClaim && currentTime > mscGracePeriod) {
                issues.push({
                    id: "msc-grace-period-expired",
                    severity: "critical",
                    message: "MSC claims grace period expired (March 1, 2025). Final reconciliation deadline passed",
                    policy: "MSC Submission Timeline Circular",
                    impactsReimbursement: true,
                });
                score -= 50;
            }
            // Service period validation for MSC claims
            if (data.mscClaim && data.serviceDate) {
                const serviceDate = new Date(data.serviceDate);
                const mscServiceDeadline = new Date("2025-02-14");
                if (serviceDate > mscServiceDeadline) {
                    issues.push({
                        id: "msc-service-date-invalid",
                        severity: "critical",
                        message: "MSC service dates must be before February 14, 2025",
                        policy: "MSC Service Period Limitations",
                        impactsReimbursement: true,
                    });
                    score -= 40;
                }
            }
            // Monthly submission requirement for homecare
            if (data.homecareService && data.lastSubmissionDate) {
                const lastSubmission = new Date(data.lastSubmissionDate);
                const daysSinceLastSubmission = Math.floor((currentTime.getTime() - lastSubmission.getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysSinceLastSubmission > 30) {
                    issues.push({
                        id: "homecare-monthly-submission-overdue",
                        severity: "medium",
                        message: "Homecare services must be submitted monthly (30-day service period)",
                        policy: "MSC Homecare Services - Monthly Submission",
                        impactsReimbursement: false,
                    });
                    score -= 20;
                }
            }
            if (score < 100) {
                recommendations.push("Submit claims before 8:00 AM daily deadline to avoid escalation");
                recommendations.push("Complete MSC final reconciliation before March 1, 2025");
                recommendations.push("Ensure homecare invoices are submitted monthly (30-day periods)");
                recommendations.push("Set up automated reminders for submission deadlines");
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
                recommendations,
            };
        },
    },
    {
        id: "daman-004",
        name: "Document Management Compliance",
        description: "Validates wheelchair pre-approval forms and homecare allocation documents",
        category: "Documentation",
        severity: "critical",
        validationFunction: async (data) => {
            const issues = [];
            const recommendations = [];
            let score = 100;
            // Enhanced wheelchair pre-approval form validation (effective May 1, 2025)
            const wheelchairFormDeadline = new Date("2025-05-01");
            const currentDate = new Date();
            const transitionPeriod = new Date("2025-04-01"); // 30-day transition period
            if (data.wheelchairRequest) {
                // Check if we're in transition period
                if (currentDate >= transitionPeriod &&
                    currentDate < wheelchairFormDeadline) {
                    if (!data.documents?.includes("Wheelchair Pre-approval Form")) {
                        issues.push({
                            id: "wheelchair-transition-warning",
                            severity: "high",
                            message: "Wheelchair pre-approval form will be mandatory from May 1, 2025. PT form will no longer be accepted. Please update your documentation.",
                            policy: "Wheelchair Pre-approval Form Transition Period",
                            field: "documents",
                            impactsReimbursement: false,
                        });
                        score -= 25;
                    }
                }
                // Mandatory after May 1, 2025
                if (currentDate >= wheelchairFormDeadline) {
                    if (!data.documents?.includes("Wheelchair Pre-approval Form")) {
                        issues.push({
                            id: "missing-wheelchair-preapproval",
                            severity: "critical",
                            message: "Wheelchair pre-approval form is mandatory (effective May 1, 2025). PT form no longer accepted. Claims will be rejected without proper documentation.",
                            policy: "New Wheelchair Pre-approval Form Requirements V2025",
                            field: "documents",
                            impactsReimbursement: true,
                        });
                        score -= 50;
                    }
                    // Check for deprecated PT form usage
                    if (data.documents?.includes("PT Form") ||
                        data.documents?.includes("Physiotherapy Form")) {
                        issues.push({
                            id: "deprecated-pt-form",
                            severity: "critical",
                            message: "PT/Physiotherapy forms are no longer accepted for wheelchair requests (effective May 1, 2025). Use Wheelchair Pre-approval Form only.",
                            policy: "Wheelchair Documentation Update V2025",
                            field: "documents",
                            impactsReimbursement: true,
                        });
                        score -= 40;
                    }
                }
                // Wheelchair form validity (1 month)
                if (data.wheelchairFormDate) {
                    const formDate = new Date(data.wheelchairFormDate);
                    const daysSinceForm = Math.floor((currentDate.getTime() - formDate.getTime()) /
                        (1000 * 60 * 60 * 24));
                    if (daysSinceForm > 30) {
                        issues.push({
                            id: "wheelchair-form-expired",
                            severity: "high",
                            message: "Wheelchair pre-approval form is older than 1 month and must be renewed",
                            policy: "Wheelchair Form Validity Period",
                            impactsReimbursement: true,
                        });
                        score -= 30;
                    }
                }
                // Required wheelchair documentation
                const requiredWheelchairDocs = [
                    "Wheelchair Brand Warranty",
                    "Updated Medical Report",
                ];
                const missingWheelchairDocs = requiredWheelchairDocs.filter((doc) => !data.documents?.includes(doc));
                if (missingWheelchairDocs.length > 0) {
                    issues.push({
                        id: "missing-wheelchair-docs",
                        severity: "high",
                        message: `Missing required wheelchair documents: ${missingWheelchairDocs.join(", ")}`,
                        policy: "Wheelchair Authorization Documentation Requirements",
                        field: "documents",
                        impactsReimbursement: true,
                    });
                    score -= 25;
                }
            }
            // Enhanced homecare allocation automation (effective February 24, 2025)
            const homecareAutomationDate = new Date("2025-02-24");
            const homecarePreparationDate = new Date("2025-02-01"); // 24-day preparation period
            if (data.homecareAllocation) {
                // Preparation period warning
                if (currentDate >= homecarePreparationDate &&
                    currentDate < homecareAutomationDate) {
                    if (!data.documents?.includes("Face-to-Face Assessment (OpenJet)")) {
                        issues.push({
                            id: "homecare-preparation-warning",
                            severity: "medium",
                            message: "Face-to-face assessment through OpenJet will be mandatory from Feb 24, 2025. Please prepare documentation.",
                            policy: "Homecare Allocation Preparation Period",
                            field: "documents",
                            impactsReimbursement: false,
                        });
                        score -= 15;
                    }
                }
                // Mandatory after February 24, 2025
                if (currentDate >= homecareAutomationDate) {
                    if (!data.documents?.includes("Face-to-Face Assessment (OpenJet)")) {
                        issues.push({
                            id: "missing-face-to-face-assessment",
                            severity: "critical",
                            message: "Face-to-face assessment form completion through OpenJet is mandatory for homecare allocation (effective Feb 24, 2025). Manual assessments no longer accepted.",
                            policy: "Homecare Allocation Automation Requirements V2025",
                            field: "documents",
                            impactsReimbursement: true,
                        });
                        score -= 40;
                    }
                    // Check for OpenJet integration
                    if (!data.openJetIntegration) {
                        issues.push({
                            id: "missing-openjet-integration",
                            severity: "critical",
                            message: "OpenJet system integration is required for automated homecare allocation (effective Feb 24, 2025)",
                            policy: "OpenJet Integration Requirement V2025",
                            impactsReimbursement: true,
                        });
                        score -= 35;
                    }
                }
                // Required homecare documents
                const requiredHomecareDocs = [
                    "Updated Periodic Assessment Form",
                    "Updated Medical Report",
                ];
                const missingHomecareDocs = requiredHomecareDocs.filter((doc) => !data.documents?.includes(doc));
                if (missingHomecareDocs.length > 0) {
                    issues.push({
                        id: "missing-homecare-docs",
                        severity: "high",
                        message: `Missing required homecare documents: ${missingHomecareDocs.join(", ")}`,
                        policy: "Homecare Allocation Documentation Requirements",
                        field: "documents",
                        impactsReimbursement: true,
                    });
                    score -= 30;
                }
                // Medical report age validation (not older than 3 months)
                if (data.medicalReportDate) {
                    const reportDate = new Date(data.medicalReportDate);
                    const daysSinceReport = Math.floor((currentDate.getTime() - reportDate.getTime()) /
                        (1000 * 60 * 60 * 24));
                    if (daysSinceReport > 90) {
                        issues.push({
                            id: "medical-report-outdated",
                            severity: "medium",
                            message: "Medical report is older than 3 months and should be updated",
                            policy: "Medical Report Validity Requirements",
                            impactsReimbursement: false,
                        });
                        score -= 15;
                    }
                }
            }
            if (score < 100) {
                recommendations.push("Use new wheelchair pre-approval form (effective May 1, 2025) - PT form no longer accepted");
                recommendations.push("Complete face-to-face assessment through OpenJet for homecare allocation");
                recommendations.push("Ensure all required documents are attached before submission");
                recommendations.push("Keep medical reports updated (not older than 3 months)");
                recommendations.push("Maintain wheelchair form validity within 1-month period");
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
                recommendations,
            };
        },
    },
    {
        id: "daman-005",
        name: "Communication Channel Compliance",
        description: "Validates official UAE email domains and OpenJet integration",
        category: "Communication",
        severity: "medium",
        validationFunction: async (data) => {
            const issues = [];
            const recommendations = [];
            let score = 100;
            // Official UAE email domain validation
            if (data.providerEmail && !data.providerEmail.includes(".ae")) {
                issues.push({
                    id: "non-uae-email-domain",
                    severity: "medium",
                    message: "Provider email must use official UAE-hosted domain (.ae)",
                    policy: "Official Email Address Requirements",
                    field: "providerEmail",
                    impactsReimbursement: false,
                });
                score -= 25;
            }
            // OpenJet integration validation
            if (!data.openJetIntegration) {
                issues.push({
                    id: "missing-openjet-integration",
                    severity: "medium",
                    message: "OpenJet integration required for provider services and queries",
                    policy: "OpenJet System Integration Requirements",
                    impactsReimbursement: false,
                });
                score -= 20;
            }
            // MSC communication channel validation
            if (data.mscCommunication && !data.mscDesignatedChannel) {
                issues.push({
                    id: "missing-msc-channel",
                    severity: "medium",
                    message: "MSC communications must use designated channel (MSC@damanhealth.ae)",
                    policy: "MSC Communication Channel Requirements",
                    impactsReimbursement: false,
                });
                score -= 15;
            }
            // ABM enrollment communication (effective March 21, 2025)
            const abmChannelDate = new Date("2025-03-21");
            const currentDate = new Date();
            if (data.abmEnrollment &&
                currentDate >= abmChannelDate &&
                !data.abmOpenJetChannel) {
                issues.push({
                    id: "missing-abm-openjet-channel",
                    severity: "medium",
                    message: "ABM enrollment queries must use OpenJet channel (effective March 21, 2025)",
                    policy: "ABM Enrollment Communication Channel",
                    impactsReimbursement: false,
                });
                score -= 20;
            }
            if (score < 100) {
                recommendations.push("Use official UAE-hosted email domains for all communications");
                recommendations.push("Integrate with OpenJet system for provider services and queries");
                recommendations.push("Use designated MSC communication channel for MSC-related matters");
                recommendations.push("Utilize OpenJet for ABM enrollment queries and escalations");
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
                recommendations,
            };
        },
    },
];
export default function DamanComplianceValidator({ data = {}, onValidationComplete, className, }) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [lastValidation, setLastValidation] = useState(null);
    const runDamanValidation = useCallback(async () => {
        setIsValidating(true);
        try {
            const results = [];
            // Enhanced data validation to prevent JSON errors with comprehensive null safety
            const sanitizedData = {
                ...data,
                // Ensure all required fields are properly typed with null checks
                mscPlanExtension: data && typeof data === "object" && data.mscPlanExtension
                    ? Boolean(data.mscPlanExtension)
                    : false,
                requestedDuration: data && typeof data === "object" && data.requestedDuration
                    ? typeof data.requestedDuration === "number"
                        ? data.requestedDuration
                        : Number(data.requestedDuration) || 0
                    : 0,
                initialVisitDate: data && typeof data === "object" && data.initialVisitDate
                    ? String(data.initialVisitDate)
                    : null,
                atcEffectiveDate: data && typeof data === "object" && data.atcEffectiveDate
                    ? String(data.atcEffectiveDate)
                    : null,
                paymentTerms: data && typeof data === "object" && data.paymentTerms
                    ? String(data.paymentTerms)
                    : "30_days",
                serviceCodes: data && typeof data === "object" && Array.isArray(data.serviceCodes)
                    ? data.serviceCodes.filter((code) => code && typeof code === "string")
                    : [],
                servicePricing: data &&
                    typeof data === "object" &&
                    data.servicePricing &&
                    typeof data.servicePricing === "object" &&
                    data.servicePricing !== null
                    ? data.servicePricing
                    : {},
                mscClaim: data && typeof data === "object" && data.mscClaim
                    ? Boolean(data.mscClaim)
                    : false,
                serviceDate: data && typeof data === "object" && data.serviceDate
                    ? String(data.serviceDate)
                    : null,
                homecareService: data && typeof data === "object" && data.homecareService
                    ? Boolean(data.homecareService)
                    : false,
                lastSubmissionDate: data && typeof data === "object" && data.lastSubmissionDate
                    ? String(data.lastSubmissionDate)
                    : null,
                wheelchairRequest: data && typeof data === "object" && data.wheelchairRequest
                    ? Boolean(data.wheelchairRequest)
                    : false,
                documents: data && typeof data === "object" && Array.isArray(data.documents)
                    ? data.documents.filter((doc) => doc && typeof doc === "string")
                    : [],
                wheelchairFormDate: data && typeof data === "object" && data.wheelchairFormDate
                    ? String(data.wheelchairFormDate)
                    : null,
                medicalReportDate: data && typeof data === "object" && data.medicalReportDate
                    ? String(data.medicalReportDate)
                    : null,
                homecareAllocation: data && typeof data === "object" && data.homecareAllocation
                    ? Boolean(data.homecareAllocation)
                    : false,
                providerEmail: data && typeof data === "object" && data.providerEmail
                    ? String(data.providerEmail)
                    : "",
                openJetIntegration: data && typeof data === "object" && data.openJetIntegration
                    ? Boolean(data.openJetIntegration)
                    : false,
                mscCommunication: data && typeof data === "object" && data.mscCommunication
                    ? Boolean(data.mscCommunication)
                    : false,
                mscDesignatedChannel: data && typeof data === "object" && data.mscDesignatedChannel
                    ? Boolean(data.mscDesignatedChannel)
                    : false,
                abmEnrollment: data && typeof data === "object" && data.abmEnrollment
                    ? Boolean(data.abmEnrollment)
                    : false,
                abmOpenJetChannel: data && typeof data === "object" && data.abmOpenJetChannel
                    ? Boolean(data.abmOpenJetChannel)
                    : false,
            };
            // Run all Daman compliance rules with sanitized data
            for (const rule of DAMAN_COMPLIANCE_RULES) {
                try {
                    const result = await rule.validationFunction(sanitizedData);
                    // Enhanced result validation to prevent JSON serialization errors
                    const validatedResult = {
                        passed: Boolean(result?.passed ?? false),
                        score: Math.max(0, Math.min(100, Number(result?.score) || 0)),
                        issues: Array.isArray(result?.issues)
                            ? result.issues.map((issue) => ({
                                id: String(issue?.id || `issue-${Date.now()}`),
                                severity: ["critical", "high", "medium", "low"].includes(issue?.severity)
                                    ? issue.severity
                                    : "medium",
                                message: String(issue?.message || "Unknown compliance issue"),
                                policy: String(issue?.policy || "Unknown Policy"),
                                field: issue?.field ? String(issue.field) : undefined,
                                impactsReimbursement: Boolean(issue?.impactsReimbursement ?? false),
                            }))
                            : [],
                        recommendations: Array.isArray(result?.recommendations)
                            ? result.recommendations
                                .map((rec) => String(rec))
                                .filter((rec) => rec.length > 0)
                            : [],
                    };
                    results.push(validatedResult);
                }
                catch (error) {
                    console.error(`Daman compliance rule ${rule.id} failed:`, error);
                    results.push({
                        passed: false,
                        score: 0,
                        issues: [
                            {
                                id: `rule-error-${rule.id}`,
                                severity: "critical",
                                message: `${rule.name} validation failed`,
                                policy: "System Error",
                                impactsReimbursement: true,
                            },
                        ],
                        recommendations: [
                            "Please contact system administrator to resolve validation error",
                        ],
                    });
                }
            }
            // Enhanced result aggregation with comprehensive error handling
            const allIssues = [];
            const allRecommendations = [];
            let totalScore = 0;
            let validResults = 0;
            results.forEach((result) => {
                if (result && typeof result === "object") {
                    if (Array.isArray(result.issues)) {
                        // Validate each issue before adding
                        result.issues.forEach((issue) => {
                            if (issue &&
                                typeof issue === "object" &&
                                issue.id &&
                                issue.message) {
                                allIssues.push({
                                    id: String(issue.id),
                                    severity: ["critical", "high", "medium", "low"].includes(issue.severity)
                                        ? issue.severity
                                        : "medium",
                                    message: String(issue.message),
                                    policy: String(issue.policy || "Unknown Policy"),
                                    field: issue.field ? String(issue.field) : undefined,
                                    impactsReimbursement: Boolean(issue.impactsReimbursement),
                                });
                            }
                        });
                    }
                    if (Array.isArray(result.recommendations)) {
                        result.recommendations.forEach((rec) => {
                            if (rec && typeof rec === "string" && rec.trim().length > 0) {
                                allRecommendations.push(rec.trim());
                            }
                        });
                    }
                    if (typeof result.score === "number" && !isNaN(result.score)) {
                        totalScore += Math.max(0, Math.min(100, result.score));
                        validResults++;
                    }
                }
            });
            const averageScore = validResults > 0 ? totalScore / validResults : 0;
            const criticalIssues = allIssues.filter((issue) => issue.severity === "critical");
            const reimbursementImpactingIssues = allIssues.filter((issue) => issue.impactsReimbursement);
            const overallPassed = criticalIssues.length === 0;
            // Create final result with comprehensive validation
            const finalResult = {
                passed: Boolean(overallPassed),
                score: Math.round(Math.max(0, Math.min(100, averageScore))),
                issues: allIssues,
                recommendations: [
                    ...new Set(allRecommendations.filter((rec) => rec.length > 0)),
                ], // Remove duplicates and empty strings
            };
            setValidationResult(finalResult);
            setLastValidation(new Date());
            if (onValidationComplete) {
                onValidationComplete(finalResult);
            }
            // Show notification with proper error handling and fallback
            try {
                if (overallPassed) {
                    if (typeof toast === "function") {
                        toast({
                            title: "Daman Compliance Validated",
                            description: `Score: ${averageScore.toFixed(1)}% - Ready for claim submission`,
                        });
                    }
                    else {
                        console.log(`✅ Daman Compliance Validated - Score: ${averageScore.toFixed(1)}%`);
                    }
                }
                else {
                    if (typeof toast === "function") {
                        toast({
                            title: "Daman Compliance Issues",
                            description: `${reimbursementImpactingIssues.length} issues may impact reimbursement`,
                            variant: "destructive",
                        });
                    }
                    else {
                        console.warn(`⚠️ Daman Compliance Issues - ${reimbursementImpactingIssues.length} issues may impact reimbursement`);
                    }
                }
            }
            catch (toastError) {
                console.error("Toast notification failed:", toastError);
                // Fallback notification
                try {
                    if (overallPassed) {
                        alert(`Daman Compliance Validated - Score: ${averageScore.toFixed(1)}%`);
                    }
                    else {
                        alert(`Daman Compliance Issues - ${reimbursementImpactingIssues.length} issues may impact reimbursement`);
                    }
                }
                catch (alertError) {
                    console.error("Alert fallback failed:", alertError);
                }
            }
        }
        catch (error) {
            console.error("Daman validation failed:", error);
            try {
                if (typeof toast === "function") {
                    toast({
                        title: "Validation Error",
                        description: "Failed to complete Daman compliance validation",
                        variant: "destructive",
                    });
                }
                else {
                    console.error("❌ Failed to complete Daman compliance validation");
                    alert("Failed to complete Daman compliance validation. Please try again.");
                }
            }
            catch (toastError) {
                console.error("Error toast notification failed:", toastError);
                try {
                    alert("Validation error occurred. Please check the console for details.");
                }
                catch (alertError) {
                    console.error("Alert fallback failed:", alertError);
                }
            }
        }
        finally {
            setIsValidating(false);
        }
    }, [data, onValidationComplete]);
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "critical":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case "high":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" });
            case "medium":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "low":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-blue-500" });
            default:
                return _jsx(CheckCircle, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "text-red-600 bg-red-100";
            case "high":
                return "text-orange-600 bg-orange-100";
            case "medium":
                return "text-yellow-600 bg-yellow-100";
            case "low":
                return "text-blue-600 bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getScoreBadgeColor = (score) => {
        if (score >= 90)
            return "bg-green-100 text-green-800";
        if (score >= 70)
            return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(CreditCard, { className: "w-6 h-6 mr-2 text-blue-600" }), "Daman Compliance Validator"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive Daman insurance compliance validation and reimbursement optimization" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [validationResult && (_jsxs(Badge, { className: getScoreBadgeColor(validationResult.score), children: [validationResult.passed ? "COMPLIANT" : "NON-COMPLIANT", " (", validationResult.score, "%)"] })), _jsxs(Button, { onClick: runDamanValidation, disabled: isValidating, className: "flex items-center", children: [isValidating ? (_jsx(Activity, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(CreditCard, { className: "w-4 h-4 mr-2" })), isValidating ? "Validating..." : "Validate Daman Compliance"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: DAMAN_COMPLIANCE_RULES.map((rule) => {
                    const icons = {
                        Authorization: Shield,
                        "Service Codes": Target,
                        Timeline: Clock,
                        Documentation: FileText,
                        Communication: Mail,
                    };
                    const Icon = icons[rule.category] || Activity;
                    return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Icon, { className: "w-4 h-4 mr-2" }), rule.name] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-xs text-gray-600 mb-2", children: rule.description }), _jsx(Badge, { className: getSeverityColor(rule.severity), children: rule.severity.toUpperCase() })] })] }, rule.id));
                }) }), validationResult && (_jsxs("div", { className: "space-y-4", children: [_jsx(Card, { className: "border-l-4 border-l-blue-500", children: _jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "w-6 h-6 mr-2 text-blue-600" }), "Overall Compliance Score"] }), _jsxs(Badge, { className: getScoreBadgeColor(validationResult.score), children: [validationResult.score, "%"] })] }), _jsxs(CardDescription, { children: ["Last validated: ", lastValidation?.toLocaleString(), " | Issues Found: ", validationResult.issues.length, " | Reimbursement Impact:", " ", validationResult.issues.filter((i) => i.impactsReimbursement)
                                            .length, " ", "issues"] })] }) }), validationResult.issues.filter((i) => i.severity === "critical")
                        .length > 0 && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(XCircle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: ["Critical Issues (", validationResult.issues.filter((i) => i.severity === "critical").length, ")"] }), _jsx(AlertDescription, { className: "text-red-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationResult.issues
                                        .filter((i) => i.severity === "critical")
                                        .map((issue, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("strong", { children: issue.message }), _jsx("br", {}), _jsxs("span", { className: "text-xs", children: ["Policy: ", issue.policy] })] }, index))) }) })] })), validationResult.issues.filter((i) => i.severity === "high").length >
                        0 && (_jsxs(Alert, { className: "bg-orange-50 border-orange-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-orange-600" }), _jsxs(AlertTitle, { className: "text-orange-800", children: ["High Priority Issues (", validationResult.issues.filter((i) => i.severity === "high")
                                        .length, ")"] }), _jsx(AlertDescription, { className: "text-orange-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationResult.issues
                                        .filter((i) => i.severity === "high")
                                        .map((issue, index) => (_jsxs("li", { className: "text-sm", children: [_jsx("strong", { children: issue.message }), _jsx("br", {}), _jsxs("span", { className: "text-xs", children: ["Policy: ", issue.policy] })] }, index))) }) })] })), validationResult.issues.filter((i) => i.severity === "medium")
                        .length > 0 && (_jsxs(Alert, { className: "bg-yellow-50 border-yellow-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsxs(AlertTitle, { className: "text-yellow-800", children: ["Medium Priority Issues (", validationResult.issues.filter((i) => i.severity === "medium")
                                        .length, ")"] }), _jsx(AlertDescription, { className: "text-yellow-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationResult.issues
                                        .filter((i) => i.severity === "medium")
                                        .map((issue, index) => (_jsxs("li", { className: "text-sm", children: [issue.message, _jsx("br", {}), _jsxs("span", { className: "text-xs", children: ["Policy: ", issue.policy] })] }, index))) }) })] })), validationResult.issues.length === 0 && (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Full Daman Compliance Achieved" }), _jsx(AlertDescription, { className: "text-green-700", children: "All Daman insurance requirements have been met. Claim is ready for submission with optimal reimbursement potential." })] })), validationResult.recommendations.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-blue-600" }), "Optimization Recommendations"] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: validationResult.recommendations.map((rec, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" }), _jsx("span", { className: "text-sm text-gray-700", children: rec })] }, index))) }) })] }))] }))] }));
}
