import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
// Get all claims processing records
export async function getAllClaimsProcessing() {
    const db = getDb();
    return db.collection("claims_processing").find().toArray();
}
// Get claims processing by ID
export async function getClaimsProcessingById(id) {
    const db = getDb();
    return db.collection("claims_processing").findOne({ _id: new ObjectId(id) });
}
// Get claims processing by patient ID
export async function getClaimsProcessingByPatientId(patientId) {
    const db = getDb();
    return db
        .collection("claims_processing")
        .find({ patient_id: patientId })
        .toArray();
}
// Get claims processing by claim number
export async function getClaimsProcessingByClaimNumber(claimNumber) {
    const db = getDb();
    return db
        .collection("claims_processing")
        .findOne({ claim_number: claimNumber });
}
// Get claims processing by status
export async function getClaimsProcessingByStatus(status) {
    const db = getDb();
    return db
        .collection("claims_processing")
        .find({ claim_status: status })
        .toArray();
}
// Get claims processing by service month/year
export async function getClaimsProcessingByServicePeriod(month, year) {
    const db = getDb();
    return db
        .collection("claims_processing")
        .find({
        service_month: month,
        service_year: year,
    })
        .toArray();
}
// Create a new claims processing record
export async function createClaimsProcessing(claimsData) {
    const db = getDb();
    const now = new Date().toISOString();
    return db.collection("claims_processing").insertOne({
        ...claimsData,
        created_at: now,
        updated_at: now,
    });
}
// Update a claims processing record
export async function updateClaimsProcessing(id, claimsData) {
    const db = getDb();
    return db.collection("claims_processing").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            ...claimsData,
            updated_at: new Date().toISOString(),
        },
    });
}
// Delete a claims processing record
export async function deleteClaimsProcessing(id) {
    const db = getDb();
    return db
        .collection("claims_processing")
        .deleteOne({ _id: new ObjectId(id) });
}
// Update claim status
export async function updateClaimStatus(id, status, notes) {
    const db = getDb();
    const updateData = {
        claim_status: status,
        updated_at: new Date().toISOString(),
    };
    if (notes) {
        updateData.coder_notes = notes;
    }
    return db
        .collection("claims_processing")
        .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}
// Update service tracking for a specific day
export async function updateServiceTracking(id, day, serviceStatus, documentationStatus) {
    const db = getDb();
    const serviceField = `service_day_${day.toString().padStart(2, "0")}`;
    const docField = `doc_day_${day.toString().padStart(2, "0")}`;
    return db.collection("claims_processing").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            [serviceField]: serviceStatus,
            [docField]: documentationStatus,
            updated_at: new Date().toISOString(),
        },
    });
}
// Update audit status
export async function updateAuditStatus(id, auditStatus, auditRemarks) {
    const db = getDb();
    return db.collection("claims_processing").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            documentation_audit_status: auditStatus,
            documentation_audit_remarks: auditRemarks,
            updated_at: new Date().toISOString(),
        },
    });
}
// Get claims requiring validation
export async function getClaimsRequiringValidation() {
    const db = getDb();
    return db
        .collection("claims_processing")
        .find({
        claim_status: { $in: ["Draft", "Pending"] },
        documentation_audit_status: { $ne: "Pass" },
    })
        .toArray();
}
// Get claims ready for submission
export async function getClaimsReadyForSubmission() {
    const db = getDb();
    return db
        .collection("claims_processing")
        .find({
        claim_status: "Draft",
        documentation_audit_status: "Pass",
    })
        .toArray();
}
// Get claims with expired provider licenses
export async function getClaimsWithExpiredLicenses() {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    return db
        .collection("claims_processing")
        .find({
        primary_clinician_license_expiry: { $lt: today },
        claim_status: { $in: ["Draft", "Pending"] },
    })
        .toArray();
}
// Calculate service utilization rate
export async function calculateServiceUtilizationRate(id) {
    const db = getDb();
    const claim = await db
        .collection("claims_processing")
        .findOne({ _id: new ObjectId(id) });
    if (!claim)
        return null;
    const utilizationRate = claim.total_authorized_services > 0
        ? (claim.total_services_provided / claim.total_authorized_services) * 100
        : 0;
    await db.collection("claims_processing").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            service_utilization_rate: utilizationRate,
            updated_at: new Date().toISOString(),
        },
    });
    return utilizationRate;
}
// Get claims statistics
export async function getClaimsStatistics() {
    const db = getDb();
    const pipeline = [
        {
            $group: {
                _id: "$claim_status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$claim_amount" },
            },
        },
    ];
    return db.collection("claims_processing").aggregate(pipeline).toArray();
}
// Enhanced Revenue Cycle Management Functions
// Submit claim to insurance provider
export async function submitClaimToInsurance(claimId, insuranceProvider, submissionData) {
    const db = getDb();
    const collection = db.collection("claims_processing");
    try {
        // Update claim status to submitted
        await collection.updateOne({ _id: new ObjectId(claimId) }, {
            $set: {
                claim_status: "Submitted",
                submission_date: new Date().toISOString(),
                insurance_provider: insuranceProvider,
                submission_data: submissionData,
                updated_at: new Date().toISOString(),
            },
        });
        // Log submission
        await db.collection("claim_submissions").insertOne({
            claim_id: claimId,
            insurance_provider: insuranceProvider,
            submission_date: new Date().toISOString(),
            submission_data: submissionData,
            status: "submitted",
            created_at: new Date().toISOString(),
        });
        return {
            success: true,
            message: "Claim submitted successfully",
            submission_id: `SUB-${Date.now()}`,
        };
    }
    catch (error) {
        console.error("Error submitting claim to insurance:", error);
        throw new Error("Failed to submit claim to insurance");
    }
}
// Record payment for a claim
export async function recordClaimPayment(claimId, paymentData) {
    const db = getDb();
    try {
        // Record payment
        const paymentResult = await db.collection("claim_payments").insertOne({
            claim_id: claimId,
            payment_amount: paymentData.amount,
            payment_date: paymentData.payment_date,
            payment_method: paymentData.payment_method,
            reference_number: paymentData.reference_number,
            payer: paymentData.payer,
            status: "received",
            created_at: new Date().toISOString(),
        });
        // Update claim status
        await db.collection("claims_processing").updateOne({ _id: new ObjectId(claimId) }, {
            $set: {
                claim_status: "Paid",
                paid_amount: paymentData.amount,
                payment_date: paymentData.payment_date,
                updated_at: new Date().toISOString(),
            },
        });
        return {
            success: true,
            payment_id: paymentResult.insertedId,
            message: "Payment recorded successfully",
        };
    }
    catch (error) {
        console.error("Error recording claim payment:", error);
        throw new Error("Failed to record claim payment");
    }
}
// Record denial for a claim
export async function recordClaimDenial(claimId, denialData) {
    const db = getDb();
    try {
        // Record denial
        const denialResult = await db.collection("claim_denials").insertOne({
            claim_id: claimId,
            denial_reason: denialData.denial_reason,
            denial_code: denialData.denial_code,
            denial_date: denialData.denial_date,
            denial_amount: denialData.denial_amount,
            appeal_deadline: denialData.appeal_deadline,
            appeal_status: "not_started",
            status: "active",
            created_at: new Date().toISOString(),
        });
        // Update claim status
        await db.collection("claims_processing").updateOne({ _id: new ObjectId(claimId) }, {
            $set: {
                claim_status: "Denied",
                denied_amount: denialData.denial_amount,
                denial_date: denialData.denial_date,
                denial_reason: denialData.denial_reason,
                updated_at: new Date().toISOString(),
            },
        });
        return {
            success: true,
            denial_id: denialResult.insertedId,
            message: "Denial recorded successfully",
        };
    }
    catch (error) {
        console.error("Error recording claim denial:", error);
        throw new Error("Failed to record claim denial");
    }
}
// Submit appeal for denied claim
export async function submitClaimAppeal(claimId, appealData) {
    const db = getDb();
    try {
        // Create appeal record
        const appealResult = await db.collection("claim_appeals").insertOne({
            claim_id: claimId,
            appeal_reason: appealData.appeal_reason,
            supporting_documents: appealData.supporting_documents,
            additional_information: appealData.additional_information,
            appeal_date: new Date().toISOString(),
            appeal_status: "submitted",
            status: "active",
            created_at: new Date().toISOString(),
        });
        // Update denial record
        await db.collection("claim_denials").updateOne({ claim_id: claimId }, {
            $set: {
                appeal_status: "submitted",
                appeal_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        });
        return {
            success: true,
            appeal_id: appealResult.insertedId,
            message: "Appeal submitted successfully",
        };
    }
    catch (error) {
        console.error("Error submitting claim appeal:", error);
        throw new Error("Failed to submit claim appeal");
    }
}
// Get revenue analytics
export async function getRevenueAnalytics(timeframe = "month") {
    const db = getDb();
    try {
        let dateFilter = {};
        const now = new Date();
        switch (timeframe) {
            case "week":
                dateFilter = {
                    created_at: {
                        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                };
                break;
            case "month":
                dateFilter = {
                    created_at: {
                        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                };
                break;
            case "quarter":
                dateFilter = {
                    created_at: {
                        $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                };
                break;
            case "year":
                dateFilter = {
                    created_at: {
                        $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                };
                break;
        }
        const claims = await db
            .collection("claims_processing")
            .find(dateFilter)
            .toArray();
        const analytics = {
            totalClaims: claims.length,
            totalAmount: claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0),
            paidAmount: claims
                .filter((claim) => claim.claim_status === "Paid")
                .reduce((sum, claim) => sum + (claim.paid_amount || 0), 0),
            pendingAmount: claims
                .filter((claim) => claim.claim_status === "Pending")
                .reduce((sum, claim) => sum + (claim.claim_amount || 0), 0),
            deniedAmount: claims
                .filter((claim) => claim.claim_status === "Denied")
                .reduce((sum, claim) => sum + (claim.denied_amount || 0), 0),
            adjustmentAmount: claims.reduce((sum, claim) => sum + (claim.adjustment_amount || 0), 0),
        };
        analytics.collectionRate =
            analytics.totalAmount > 0
                ? (analytics.paidAmount / analytics.totalAmount) * 100
                : 0;
        // Calculate average days to payment
        const paidClaims = claims.filter((claim) => claim.claim_status === "Paid" &&
            claim.submission_date &&
            claim.payment_date);
        if (paidClaims.length > 0) {
            const totalDays = paidClaims.reduce((sum, claim) => {
                const submissionDate = new Date(claim.submission_date);
                const paymentDate = new Date(claim.payment_date);
                const daysDiff = (paymentDate.getTime() - submissionDate.getTime()) /
                    (1000 * 60 * 60 * 24);
                return sum + daysDiff;
            }, 0);
            analytics.averageDaysToPayment = totalDays / paidClaims.length;
        }
        else {
            analytics.averageDaysToPayment = 0;
        }
        return analytics;
    }
    catch (error) {
        console.error("Error getting revenue analytics:", error);
        throw new Error("Failed to get revenue analytics");
    }
}
// Get accounts receivable aging
export async function getAccountsReceivableAging() {
    const db = getDb();
    try {
        const pendingClaims = await db
            .collection("claims_processing")
            .find({ claim_status: { $in: ["Submitted", "Pending"] } })
            .toArray();
        const now = new Date();
        const buckets = {
            "0-30 days": { amount: 0, count: 0 },
            "31-60 days": { amount: 0, count: 0 },
            "61-90 days": { amount: 0, count: 0 },
            "91-120 days": { amount: 0, count: 0 },
            "> 120 days": { amount: 0, count: 0 },
        };
        pendingClaims.forEach((claim) => {
            if (!claim.submission_date)
                return;
            const submissionDate = new Date(claim.submission_date);
            const daysDiff = (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
            const amount = claim.claim_amount || 0;
            if (daysDiff <= 30) {
                buckets["0-30 days"].amount += amount;
                buckets["0-30 days"].count += 1;
            }
            else if (daysDiff <= 60) {
                buckets["31-60 days"].amount += amount;
                buckets["31-60 days"].count += 1;
            }
            else if (daysDiff <= 90) {
                buckets["61-90 days"].amount += amount;
                buckets["61-90 days"].count += 1;
            }
            else if (daysDiff <= 120) {
                buckets["91-120 days"].amount += amount;
                buckets["91-120 days"].count += 1;
            }
            else {
                buckets["> 120 days"].amount += amount;
                buckets["> 120 days"].count += 1;
            }
        });
        const totalAmount = Object.values(buckets).reduce((sum, bucket) => sum + bucket.amount, 0);
        const result = {
            total: totalAmount,
            buckets: Object.entries(buckets).map(([range, data]) => ({
                range,
                amount: data.amount,
                claimCount: data.count,
                percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
            })),
        };
        return result;
    }
    catch (error) {
        console.error("Error getting accounts receivable aging:", error);
        throw new Error("Failed to get accounts receivable aging");
    }
}
// Get denial analytics
export async function getDenialAnalytics() {
    const db = getDb();
    try {
        const denials = await db.collection("claim_denials").find({}).toArray();
        const appeals = await db.collection("claim_appeals").find({}).toArray();
        const totalClaims = await db
            .collection("claims_processing")
            .countDocuments();
        // Count denials by reason
        const denialReasons = {};
        denials.forEach((denial) => {
            const reason = denial.denial_reason || "Unknown";
            denialReasons[reason] = (denialReasons[reason] || 0) + 1;
        });
        const topDenialReasons = Object.entries(denialReasons)
            .map(([reason, count]) => ({
            reason,
            count: count,
            percentage: denials.length > 0 ? (count / denials.length) * 100 : 0,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // Calculate appeal success rate
        const successfulAppeals = appeals.filter((appeal) => appeal.appeal_status === "approved" ||
            appeal.appeal_status === "successful").length;
        const appealSuccessRate = appeals.length > 0 ? (successfulAppeals / appeals.length) * 100 : 0;
        // Calculate average appeal time
        const completedAppeals = appeals.filter((appeal) => appeal.appeal_status === "approved" ||
            appeal.appeal_status === "denied");
        let averageAppealTime = 0;
        if (completedAppeals.length > 0) {
            const totalAppealDays = completedAppeals.reduce((sum, appeal) => {
                if (appeal.appeal_date && appeal.resolution_date) {
                    const appealDate = new Date(appeal.appeal_date);
                    const resolutionDate = new Date(appeal.resolution_date);
                    const daysDiff = (resolutionDate.getTime() - appealDate.getTime()) /
                        (1000 * 60 * 60 * 24);
                    return sum + daysDiff;
                }
                return sum;
            }, 0);
            averageAppealTime = totalAppealDays / completedAppeals.length;
        }
        return {
            totalDenials: denials.length,
            denialRate: totalClaims > 0 ? (denials.length / totalClaims) * 100 : 0,
            topDenialReasons,
            averageAppealTime,
            appealSuccessRate,
        };
    }
    catch (error) {
        console.error("Error getting denial analytics:", error);
        throw new Error("Failed to get denial analytics");
    }
}
// Get monthly service delivery summary
export async function getMonthlyServiceDeliverySummary(month, year) {
    const db = getDb();
    const claims = await db
        .collection("claims_processing")
        .find({
        service_month: month,
        service_year: year,
    })
        .toArray();
    let totalServicesProvided = 0;
    let totalServicesAuthorized = 0;
    let daysWithService = 0;
    let daysWithDocumentation = 0;
    claims.forEach((claim) => {
        totalServicesProvided += claim.total_services_provided || 0;
        totalServicesAuthorized += claim.total_authorized_services || 0;
        // Count days with services and documentation
        for (let day = 1; day <= 31; day++) {
            const serviceField = `service_day_${day.toString().padStart(2, "0")}`;
            const docField = `doc_day_${day.toString().padStart(2, "0")}`;
            if (claim[serviceField] && claim[serviceField] !== "No Service") {
                daysWithService++;
            }
            if (claim[docField] && claim[docField] === "Complete") {
                daysWithDocumentation++;
            }
        }
    });
    return {
        totalClaims: claims.length,
        totalServicesProvided,
        totalServicesAuthorized,
        utilizationRate: totalServicesAuthorized > 0
            ? (totalServicesProvided / totalServicesAuthorized) * 100
            : 0,
        daysWithService,
        daysWithDocumentation,
        documentationComplianceRate: daysWithService > 0 ? (daysWithDocumentation / daysWithService) * 100 : 0,
    };
}
// Batch update claims status
export async function batchUpdateClaimsStatus(claimIds, status, notes) {
    const db = getDb();
    const objectIds = claimIds.map((id) => new ObjectId(id));
    const updateData = {
        claim_status: status,
        updated_at: new Date().toISOString(),
    };
    if (notes) {
        updateData.coder_notes = notes;
    }
    return db
        .collection("claims_processing")
        .updateMany({ _id: { $in: objectIds } }, { $set: updateData });
}
