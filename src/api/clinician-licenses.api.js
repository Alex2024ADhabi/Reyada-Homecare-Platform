import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
// Get all clinician licenses
export async function getAllClinicianLicenses() {
    const db = getDb();
    return db.collection("clinician_licenses").find().toArray();
}
// Get clinician license by ID
export async function getClinicianLicenseById(id) {
    const db = getDb();
    return db.collection("clinician_licenses").findOne({ _id: new ObjectId(id) });
}
// Get clinician licenses by employee ID
export async function getClinicianLicensesByEmployeeId(employeeId) {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .find({ employee_id: employeeId })
        .toArray();
}
// Get clinician licenses by status
export async function getClinicianLicensesByStatus(status) {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .find({ license_status: status })
        .toArray();
}
// Get clinician licenses by department
export async function getClinicianLicensesByDepartment(department) {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .find({ department: department })
        .toArray();
}
// Get clinician licenses by role
export async function getClinicianLicensesByRole(role) {
    const db = getDb();
    return db.collection("clinician_licenses").find({ role: role }).toArray();
}
// Create a new clinician license
export async function createClinicianLicense(licenseData) {
    const db = getDb();
    const now = new Date().toISOString();
    return db.collection("clinician_licenses").insertOne({
        ...licenseData,
        created_at: now,
        updated_at: now,
    });
}
// Update a clinician license
export async function updateClinicianLicense(id, licenseData) {
    const db = getDb();
    return db.collection("clinician_licenses").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            ...licenseData,
            updated_at: new Date().toISOString(),
        },
    });
}
// Delete a clinician license
export async function deleteClinicianLicense(id) {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .deleteOne({ _id: new ObjectId(id) });
}
// Get licenses expiring within specified days
export async function getLicensesExpiringWithinDays(days) {
    const db = getDb();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return db
        .collection("clinician_licenses")
        .find({
        expiry_date: { $lte: futureDate.toISOString().split("T")[0] },
        license_status: { $in: ["Active", "Pending Renewal"] },
    })
        .toArray();
}
// Get expired licenses
export async function getExpiredLicenses() {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    return db
        .collection("clinician_licenses")
        .find({
        expiry_date: { $lt: today },
        license_status: { $ne: "Expired" },
    })
        .toArray();
}
// Get licenses pending renewal
export async function getLicensesPendingRenewal() {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .find({
        license_status: "Pending Renewal",
        renewal_initiated: true,
        renewal_completed: false,
    })
        .toArray();
}
// Get non-compliant licenses
export async function getNonCompliantLicenses() {
    const db = getDb();
    return db
        .collection("clinician_licenses")
        .find({
        compliance_status: { $in: ["Non-Compliant", "Under Review"] },
    })
        .toArray();
}
// Initiate license renewal
export async function initiateLicenseRenewal(id) {
    const db = getDb();
    const now = new Date().toISOString();
    return db.collection("clinician_licenses").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            renewal_initiated: true,
            renewal_notification_date: now,
            license_status: "Pending Renewal",
            updated_at: now,
        },
    });
}
// Complete license renewal
export async function completeLicenseRenewal(id, newExpiryDate) {
    const db = getDb();
    const now = new Date().toISOString();
    return db.collection("clinician_licenses").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            renewal_completed: true,
            renewal_completion_date: now,
            license_status: "Active",
            expiry_date: newExpiryDate,
            updated_at: now,
        },
    });
}
// Update compliance status
export async function updateComplianceStatus(id, complianceStatus, ceCompleted, ceHours) {
    const db = getDb();
    return db.collection("clinician_licenses").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            compliance_status: complianceStatus,
            continuing_education_completed: ceCompleted,
            continuing_education_hours: ceHours,
            updated_at: new Date().toISOString(),
        },
    });
}
// Update license usage for claims
export async function updateLicenseUsageForClaims(licenseNumber, claimDate) {
    const db = getDb();
    return db.collection("clinician_licenses").updateOne({ license_number: licenseNumber }, {
        $set: {
            last_used_for_claim: claimDate,
            updated_at: new Date().toISOString(),
        },
        $inc: {
            total_claims_associated: 1,
        },
    });
}
// Get license statistics
export async function getLicenseStatistics() {
    const db = getDb();
    const pipeline = [
        {
            $group: {
                _id: "$license_status",
                count: { $sum: 1 },
                departments: { $addToSet: "$department" },
                roles: { $addToSet: "$role" },
            },
        },
    ];
    return db.collection("clinician_licenses").aggregate(pipeline).toArray();
}
// Get compliance summary
export async function getComplianceSummary() {
    const db = getDb();
    const pipeline = [
        {
            $group: {
                _id: "$compliance_status",
                count: { $sum: 1 },
                avgCEHours: { $avg: "$continuing_education_hours" },
                totalClaims: { $sum: "$total_claims_associated" },
            },
        },
    ];
    return db.collection("clinician_licenses").aggregate(pipeline).toArray();
}
// Get renewal summary
export async function getRenewalSummary() {
    const db = getDb();
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    const next90Days = new Date(today);
    next90Days.setDate(today.getDate() + 90);
    const todayStr = today.toISOString().split("T")[0];
    const next30DaysStr = next30Days.toISOString().split("T")[0];
    const next90DaysStr = next90Days.toISOString().split("T")[0];
    const pipeline = [
        {
            $facet: {
                expiringNext30Days: [
                    {
                        $match: {
                            expiry_date: { $gte: todayStr, $lte: next30DaysStr },
                            license_status: "Active",
                        },
                    },
                    { $count: "count" },
                ],
                expiringNext90Days: [
                    {
                        $match: {
                            expiry_date: { $gte: todayStr, $lte: next90DaysStr },
                            license_status: "Active",
                        },
                    },
                    { $count: "count" },
                ],
                pendingRenewal: [
                    {
                        $match: {
                            license_status: "Pending Renewal",
                        },
                    },
                    { $count: "count" },
                ],
                expired: [
                    {
                        $match: {
                            expiry_date: { $lt: todayStr },
                            license_status: { $ne: "Expired" },
                        },
                    },
                    { $count: "count" },
                ],
            },
        },
    ];
    return db.collection("clinician_licenses").aggregate(pipeline).toArray();
}
// Batch update license statuses (for expired licenses)
export async function batchUpdateExpiredLicenses() {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    return db.collection("clinician_licenses").updateMany({
        expiry_date: { $lt: today },
        license_status: { $ne: "Expired" },
    }, {
        $set: {
            license_status: "Expired",
            currently_active_for_claims: false,
            updated_at: new Date().toISOString(),
        },
    });
}
// Get licenses by clinician name (for claims processing integration)
export async function getLicenseByClinicianName(clinicianName) {
    const db = getDb();
    return db.collection("clinician_licenses").findOne({
        clinician_name: clinicianName,
        license_status: "Active",
        currently_active_for_claims: true,
    });
}
// Validate license for claims processing
export async function validateLicenseForClaims(licenseNumber) {
    const db = getDb();
    const license = await db
        .collection("clinician_licenses")
        .findOne({ license_number: licenseNumber });
    if (!license) {
        return {
            valid: false,
            reason: "License not found",
        };
    }
    const today = new Date().toISOString().split("T")[0];
    if (license.expiry_date < today) {
        return {
            valid: false,
            reason: "License expired",
            expiryDate: license.expiry_date,
        };
    }
    if (license.license_status !== "Active") {
        return {
            valid: false,
            reason: `License status is ${license.license_status}`,
        };
    }
    if (!license.currently_active_for_claims) {
        return {
            valid: false,
            reason: "License not active for claims processing",
        };
    }
    if (license.compliance_status === "Non-Compliant") {
        return {
            valid: false,
            reason: "License is non-compliant",
        };
    }
    return {
        valid: true,
        license: license,
    };
}
