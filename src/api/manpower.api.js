import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
// Get all manpower capacity records
export async function getAllManpowerCapacity() {
    const db = getDb();
    return db.collection("manpower_capacity").find().toArray();
}
// Get manpower capacity by ID
export async function getManpowerCapacityById(id) {
    const db = getDb();
    return db.collection("manpower_capacity").findOne({ _id: new ObjectId(id) });
}
// Get manpower capacity by staff member
export async function getManpowerCapacityByStaffMember(staffMember) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({ staff_member: staffMember })
        .toArray();
}
// Get manpower capacity by date
export async function getManpowerCapacityByDate(date) {
    const db = getDb();
    return db.collection("manpower_capacity").find({ date }).toArray();
}
// Get available staff for a specific date and shift
export async function getAvailableStaff(date, shift) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        date,
        shift,
        availability_status: "Available",
    })
        .toArray();
}
// Create a new manpower capacity record
export async function createManpowerCapacity(manpowerData) {
    const db = getDb();
    return db.collection("manpower_capacity").insertOne(manpowerData);
}
// Update a manpower capacity record
export async function updateManpowerCapacity(id, manpowerData) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .updateOne({ _id: new ObjectId(id) }, { $set: manpowerData });
}
// Delete a manpower capacity record
export async function deleteManpowerCapacity(id) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .deleteOne({ _id: new ObjectId(id) });
}
// Update staff availability status
export async function updateStaffAvailability(id, availabilityStatus) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .updateOne({ _id: new ObjectId(id) }, { $set: { availability_status: availabilityStatus } });
}
// Increment current daily patients for a staff member
export async function incrementCurrentDailyPatients(id) {
    const db = getDb();
    const record = await db
        .collection("manpower_capacity")
        .findOne({ _id: new ObjectId(id) });
    if (record && record.current_daily_patients < record.max_daily_patients) {
        return db
            .collection("manpower_capacity")
            .updateOne({ _id: new ObjectId(id) }, { $set: { current_daily_patients: record.current_daily_patients + 1 } });
    }
    return { matchedCount: 0, modifiedCount: 0 };
}
// Decrement current daily patients for a staff member
export async function decrementCurrentDailyPatients(id) {
    const db = getDb();
    const record = await db
        .collection("manpower_capacity")
        .findOne({ _id: new ObjectId(id) });
    if (record && record.current_daily_patients > 0) {
        return db
            .collection("manpower_capacity")
            .updateOne({ _id: new ObjectId(id) }, { $set: { current_daily_patients: record.current_daily_patients - 1 } });
    }
    return { matchedCount: 0, modifiedCount: 0 };
}
// Update staff hours
export async function updateStaffHours(id, committedHours, availableHours) {
    const db = getDb();
    return db.collection("manpower_capacity").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            committed_hours_per_day: committedHours,
            available_hours_per_day: availableHours,
        },
    });
}
// Get staff by specialization
export async function getStaffBySpecialization(specialization) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        specializations: { $regex: specialization, $options: "i" },
    })
        .toArray();
}
// Get staff by geographic zone
export async function getStaffByGeographicZone(zone) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        geographic_zones: { $regex: zone, $options: "i" },
    })
        .toArray();
}
// Get staff by role
export async function getStaffByRole(role) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        role: { $regex: role, $options: "i" },
    })
        .toArray();
}
// Get staff with available capacity
export async function getStaffWithAvailableCapacity() {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        $expr: { $lt: ["$current_daily_patients", "$max_daily_patients"] },
        availability_status: "Available",
    })
        .toArray();
}
// Get staff with specific certification
export async function getStaffWithCertification(certification) {
    const db = getDb();
    return db
        .collection("manpower_capacity")
        .find({
        equipment_certifications: { $regex: certification, $options: "i" },
    })
        .toArray();
}
// Batch update staff availability
export async function batchUpdateStaffAvailability(staffIds, availabilityStatus) {
    const db = getDb();
    const objectIds = staffIds.map((id) => new ObjectId(id));
    return db
        .collection("manpower_capacity")
        .updateMany({ _id: { $in: objectIds } }, { $set: { availability_status: availabilityStatus } });
}
