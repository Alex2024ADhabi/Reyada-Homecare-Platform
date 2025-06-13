import express from "express";
import { ObjectId } from "./browser-mongodb";
import { mockDb as db } from "./mock-db";
const router = express.Router();
// Patient Safety API Endpoints
// Classify incident using Abu Dhabi Patient Safety Taxonomy
router.post("/classify-incident", async (req, res) => {
    try {
        const incidentData = req.body;
        // Validate required fields
        const requiredFields = [
            "incident_description",
            "incident_type",
            "patient_id",
        ];
        const missingFields = requiredFields.filter((field) => !incidentData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields,
            });
        }
        // AI-powered classification based on Abu Dhabi Patient Safety Taxonomy
        const classification = classifyIncidentByTaxonomy(incidentData.incident_description, incidentData.incident_type);
        const classifiedIncident = {
            _id: new ObjectId(),
            incident_id: `PSI-${Date.now()}`,
            ...incidentData,
            classification_date: new Date().toISOString(),
            taxonomy_classification: classification,
            level_of_harm: calculateLevelOfHarm(incidentData),
            preventable: assessPreventability(incidentData),
            doh_reportable: isDOHReportable(classification),
            investigation_required: requiresInvestigation(classification),
            rca_required: requiresRCA(classification),
            status: "classified",
            next_actions: generateNextActions(classification),
        };
        // Store in mock database
        if (!db.patientSafetyIncidents) {
            db.patientSafetyIncidents = { data: [] };
        }
        db.patientSafetyIncidents.data.push(classifiedIncident);
        res.status(201).json({
            success: true,
            incident_id: classifiedIncident.incident_id,
            classification: classifiedIncident.taxonomy_classification,
            level_of_harm: classifiedIncident.level_of_harm,
            doh_reportable: classifiedIncident.doh_reportable,
            next_actions: classifiedIncident.next_actions,
        });
    }
    catch (error) {
        console.error("Error classifying incident:", error);
        res.status(500).json({ error: "Failed to classify incident" });
    }
});
// Get taxonomy categories
router.get("/taxonomy-categories", async (req, res) => {
    try {
        const taxonomy = {
            version: "Abu Dhabi Patient Safety Taxonomy v2.1",
            effective_date: "2024-01-01",
            categories: {
                clinical_care: {
                    name: "Clinical Care",
                    subcategories: {
                        diagnosis: {
                            name: "Diagnosis",
                            types: [
                                "Delayed diagnosis",
                                "Missed diagnosis",
                                "Wrong diagnosis",
                                "Failure to act on results",
                            ],
                        },
                        treatment: {
                            name: "Treatment/Procedure",
                            types: [
                                "Wrong treatment",
                                "Delayed treatment",
                                "Inappropriate treatment",
                                "Treatment not given",
                            ],
                        },
                        medication: {
                            name: "Medication/IV Fluids",
                            types: [
                                "Wrong medication",
                                "Wrong dose",
                                "Wrong route",
                                "Wrong time",
                                "Omitted medication",
                                "Allergic reaction",
                            ],
                        },
                    },
                },
                patient_accidents: {
                    name: "Patient Accidents",
                    subcategories: {
                        falls: {
                            name: "Patient Falls",
                            types: [
                                "Fall from bed",
                                "Fall in bathroom",
                                "Fall while walking",
                                "Fall from chair/wheelchair",
                            ],
                        },
                        injuries: {
                            name: "Patient Injuries",
                            types: [
                                "Cuts/lacerations",
                                "Burns",
                                "Bruises/contusions",
                                "Fractures",
                            ],
                        },
                    },
                },
                healthcare_associated_infections: {
                    name: "Healthcare Associated Infections",
                    subcategories: {
                        surgical_site: {
                            name: "Surgical Site Infections",
                            types: ["Superficial SSI", "Deep SSI", "Organ/space SSI"],
                        },
                        device_related: {
                            name: "Device-Related Infections",
                            types: [
                                "Central line associated BSI",
                                "Catheter associated UTI",
                                "Ventilator associated pneumonia",
                            ],
                        },
                    },
                },
                documentation: {
                    name: "Documentation",
                    subcategories: {
                        medical_records: {
                            name: "Medical Records",
                            types: [
                                "Incomplete documentation",
                                "Illegible documentation",
                                "Missing documentation",
                                "Incorrect documentation",
                            ],
                        },
                    },
                },
                communication: {
                    name: "Communication",
                    subcategories: {
                        verbal: {
                            name: "Verbal Communication",
                            types: [
                                "Miscommunication between staff",
                                "Inadequate handoff",
                                "Language barriers",
                                "Failure to communicate critical information",
                            ],
                        },
                        written: {
                            name: "Written Communication",
                            types: [
                                "Unclear orders",
                                "Missing information",
                                "Delayed communication",
                            ],
                        },
                    },
                },
                behavioral: {
                    name: "Behavioral",
                    subcategories: {
                        patient_behavior: {
                            name: "Patient Behavior",
                            types: [
                                "Aggressive behavior",
                                "Self-harm",
                                "Elopement/wandering",
                                "Non-compliance",
                            ],
                        },
                        staff_behavior: {
                            name: "Staff Behavior",
                            types: [
                                "Unprofessional conduct",
                                "Breach of confidentiality",
                                "Inappropriate behavior",
                            ],
                        },
                    },
                },
            },
            harm_levels: {
                A: "Circumstances or events that have the capacity to cause error",
                B1: "An error occurred but the error did not reach the patient",
                B2: "An error occurred that reached the patient but did not cause patient harm",
                C: "An error occurred that reached the patient and required monitoring to confirm no harm",
                D: "An error occurred that reached the patient and required intervention to preclude harm",
                E: "An error occurred that may have contributed to or resulted in temporary harm",
                F: "An error occurred that may have contributed to or resulted in temporary harm requiring hospitalization",
                G: "An error occurred that may have contributed to or resulted in permanent patient harm",
                H: "An error occurred that required intervention to sustain life",
                I: "An error occurred that may have contributed to or resulted in the patient's death",
            },
        };
        res.json(taxonomy);
    }
    catch (error) {
        console.error("Error fetching taxonomy categories:", error);
        res.status(500).json({ error: "Failed to fetch taxonomy categories" });
    }
});
// Submit incident to DOH
router.post("/submit-to-doh", async (req, res) => {
    try {
        const { incident_id, submission_type } = req.body;
        if (!incident_id) {
            return res.status(400).json({ error: "Incident ID is required" });
        }
        // Mock DOH submission
        const submission = {
            _id: new ObjectId(),
            incident_id,
            submission_type: submission_type || "mandatory",
            submission_date: new Date().toISOString(),
            doh_reference: `DOH-${Date.now()}`,
            status: "submitted",
            acknowledgment_received: false,
            follow_up_required: true,
            submission_method: "electronic",
            submitted_by: "system",
            compliance_status: "compliant",
        };
        // Store submission record
        if (!db.dohSubmissions) {
            db.dohSubmissions = { data: [] };
        }
        db.dohSubmissions.data.push(submission);
        res.status(201).json({
            success: true,
            doh_reference: submission.doh_reference,
            submission_date: submission.submission_date,
            status: submission.status,
            follow_up_required: submission.follow_up_required,
        });
    }
    catch (error) {
        console.error("Error submitting to DOH:", error);
        res.status(500).json({ error: "Failed to submit to DOH" });
    }
});
// Get performance dashboard data
router.get("/performance-dashboard", async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const dashboardData = {
            reporting_period: {
                start_date: date_from || "2024-01-01",
                end_date: date_to || "2024-12-31",
            },
            incident_metrics: {
                total_incidents: 156,
                incidents_by_category: {
                    clinical_care: 45,
                    patient_accidents: 38,
                    healthcare_associated_infections: 12,
                    documentation: 28,
                    communication: 22,
                    behavioral: 11,
                },
                incidents_by_harm_level: {
                    A: 23,
                    B1: 31,
                    B2: 42,
                    C: 28,
                    D: 18,
                    E: 10,
                    F: 3,
                    G: 1,
                    H: 0,
                    I: 0,
                },
                preventable_incidents: 89,
                preventability_rate: 57.1,
            },
            safety_metrics: {
                patient_safety_index: 87.5,
                incident_rate_per_1000_patient_days: 2.3,
                serious_safety_events: 4,
                never_events: 0,
                mortality_review_cases: 2,
            },
            reporting_metrics: {
                incidents_reported_within_24h: 142,
                timely_reporting_rate: 91.0,
                doh_reportable_incidents: 15,
                doh_submissions_completed: 15,
                doh_compliance_rate: 100.0,
            },
            investigation_metrics: {
                investigations_completed: 67,
                rca_completed: 12,
                corrective_actions_implemented: 89,
                corrective_actions_effective: 76,
                effectiveness_rate: 85.4,
            },
            trending_data: {
                monthly_incidents: [
                    { month: "Jan", count: 12 },
                    { month: "Feb", count: 15 },
                    { month: "Mar", count: 13 },
                    { month: "Apr", count: 11 },
                    { month: "May", count: 14 },
                    { month: "Jun", count: 16 },
                    { month: "Jul", count: 12 },
                    { month: "Aug", count: 13 },
                    { month: "Sep", count: 15 },
                    { month: "Oct", count: 14 },
                    { month: "Nov", count: 13 },
                    { month: "Dec", count: 14 },
                ],
                top_incident_types: [
                    { type: "Medication errors", count: 28 },
                    { type: "Patient falls", count: 25 },
                    { type: "Documentation issues", count: 22 },
                    { type: "Communication failures", count: 18 },
                    { type: "Treatment delays", count: 15 },
                ],
            },
            improvement_initiatives: [
                {
                    initiative: "Medication Safety Program",
                    status: "active",
                    impact: "25% reduction in medication errors",
                    completion_date: "2025-03-31",
                },
                {
                    initiative: "Fall Prevention Protocol",
                    status: "completed",
                    impact: "18% reduction in patient falls",
                    completion_date: "2024-09-30",
                },
            ],
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error("Error fetching performance dashboard:", error);
        res.status(500).json({ error: "Failed to fetch performance dashboard" });
    }
});
// Helper functions for incident classification
function classifyIncidentByTaxonomy(description, type) {
    // Simplified AI classification logic
    const keywords = description.toLowerCase();
    if (keywords.includes("medication") ||
        keywords.includes("drug") ||
        keywords.includes("dose")) {
        return {
            category: "clinical_care",
            subcategory: "medication",
            detail_description: "Medication-related incident",
            confidence: 0.85,
        };
    }
    else if (keywords.includes("fall") || keywords.includes("fell")) {
        return {
            category: "patient_accidents",
            subcategory: "falls",
            detail_description: "Patient fall incident",
            confidence: 0.9,
        };
    }
    else if (keywords.includes("infection") ||
        keywords.includes("contamination")) {
        return {
            category: "healthcare_associated_infections",
            subcategory: "device_related",
            detail_description: "Healthcare-associated infection",
            confidence: 0.75,
        };
    }
    else if (keywords.includes("documentation") ||
        keywords.includes("record")) {
        return {
            category: "documentation",
            subcategory: "medical_records",
            detail_description: "Documentation-related incident",
            confidence: 0.8,
        };
    }
    else {
        return {
            category: "clinical_care",
            subcategory: "treatment",
            detail_description: "General clinical care incident",
            confidence: 0.6,
        };
    }
}
function calculateLevelOfHarm(incidentData) {
    // Simplified harm level calculation
    if (incidentData.patient_harm === "none")
        return "B2";
    if (incidentData.patient_harm === "minor")
        return "E";
    if (incidentData.patient_harm === "moderate")
        return "F";
    if (incidentData.patient_harm === "severe")
        return "G";
    if (incidentData.patient_harm === "death")
        return "I";
    return "C"; // Default to requiring monitoring
}
function assessPreventability(incidentData) {
    // Simplified preventability assessment
    const preventableKeywords = [
        "error",
        "mistake",
        "oversight",
        "failure",
        "missed",
    ];
    const description = incidentData.incident_description?.toLowerCase() || "";
    return preventableKeywords.some((keyword) => description.includes(keyword));
}
function isDOHReportable(classification) {
    // Determine if incident requires DOH reporting
    const reportableCategories = [
        "healthcare_associated_infections",
        "patient_accidents",
    ];
    return reportableCategories.includes(classification.category);
}
function requiresInvestigation(classification) {
    // Determine if incident requires formal investigation
    return (classification.confidence > 0.7 ||
        classification.category === "clinical_care");
}
function requiresRCA(classification) {
    // Determine if incident requires Root Cause Analysis
    const rcaCategories = ["clinical_care", "healthcare_associated_infections"];
    return rcaCategories.includes(classification.category);
}
function generateNextActions(classification) {
    const actions = [];
    if (classification.category === "clinical_care") {
        actions.push("Conduct clinical review");
        actions.push("Notify attending physician");
    }
    if (classification.category === "patient_accidents") {
        actions.push("Assess patient for injuries");
        actions.push("Review safety protocols");
    }
    if (classification.category === "healthcare_associated_infections") {
        actions.push("Implement infection control measures");
        actions.push("Notify infection control team");
    }
    actions.push("Document incident details");
    actions.push("Notify supervisor");
    return actions;
}
export default router;
