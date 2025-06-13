import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
// Get all attendance records with optional filters
export async function getAttendanceRecords(filters = {}) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        // Build query based on filters
        const query = {};
        if (filters.employee_id) {
            query.employee_id = filters.employee_id;
        }
        if (filters.department) {
            query.department = filters.department;
        }
        if (filters.date_from || filters.date_to) {
            query.date = {};
            if (filters.date_from) {
                query.date.$gte = filters.date_from;
            }
            if (filters.date_to) {
                query.date.$lte = filters.date_to;
            }
        }
        if (filters.shift) {
            query.shift = filters.shift;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.supervisor_approval) {
            query.supervisor_approval = filters.supervisor_approval;
        }
        const records = await collection.find(query).toArray();
        return records;
    }
    catch (error) {
        console.error("Error fetching attendance records:", error);
        throw new Error("Failed to fetch attendance records");
    }
}
// Get attendance record by ID
export async function getAttendanceById(id) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const record = await collection.findOne({ _id: new ObjectId(id) });
        return record;
    }
    catch (error) {
        console.error("Error fetching attendance record:", error);
        throw new Error("Failed to fetch attendance record");
    }
}
// Create new attendance record
export async function createAttendanceRecord(attendanceData) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const newRecord = {
            ...attendanceData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newRecord);
        return { ...newRecord, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating attendance record:", error);
        throw new Error("Failed to create attendance record");
    }
}
// Update attendance record
export async function updateAttendanceRecord(id, updates) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        return await getAttendanceById(id);
    }
    catch (error) {
        console.error("Error updating attendance record:", error);
        throw new Error("Failed to update attendance record");
    }
}
// Delete attendance record
export async function deleteAttendanceRecord(id) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
    catch (error) {
        console.error("Error deleting attendance record:", error);
        throw new Error("Failed to delete attendance record");
    }
}
// Clock in/out functionality with 15-minute grace period enforcement
export async function clockIn(employee_id, location, notes) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const today = new Date().toISOString().split("T")[0];
        const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);
        // Check if already clocked in today
        const existingRecord = await collection.findOne({
            employee_id,
            date: today,
        });
        if (existingRecord && existingRecord.actual_start) {
            throw new Error("Already clocked in today");
        }
        // Get employee info (in real app, this would come from employee database)
        const employeeInfo = {
            employee_name: "Employee Name", // This should be fetched from employee database
            role: "Staff",
            department: "General",
            scheduled_start: "08:00",
            scheduled_end: "16:00",
            shift: "Morning",
        };
        // Calculate if late with 15-minute grace period enforcement
        const scheduledStart = new Date(`${today}T${employeeInfo.scheduled_start}:00`);
        const actualStart = new Date(`${today}T${currentTime}:00`);
        const gracePeriodEnd = new Date(scheduledStart.getTime() + 15 * 60 * 1000); // 15 minutes grace period
        const isLate = actualStart > gracePeriodEnd;
        const lateMinutes = isLate
            ? Math.floor((actualStart.getTime() - gracePeriodEnd.getTime()) / (1000 * 60))
            : 0;
        // Automatic enforcement: Generate notification if late
        if (isLate) {
            await sendLateArrivalNotification(employee_id, lateMinutes, employeeInfo);
        }
        const attendanceData = {
            employee_id,
            employee_name: employeeInfo.employee_name,
            role: employeeInfo.role,
            department: employeeInfo.department,
            date: today,
            shift: employeeInfo.shift,
            scheduled_start: employeeInfo.scheduled_start,
            scheduled_end: employeeInfo.scheduled_end,
            actual_start: currentTime,
            total_hours: 0,
            overtime_hours: 0,
            status: "present",
            late_arrival: isLate,
            late_minutes: lateMinutes,
            early_departure: false,
            location,
            supervisor_approval: "pending",
            notes,
        };
        if (existingRecord) {
            // Update existing record
            await collection.updateOne({ _id: existingRecord._id }, {
                $set: {
                    ...attendanceData,
                    updated_at: new Date().toISOString(),
                },
            });
            return { ...attendanceData, _id: existingRecord._id };
        }
        else {
            // Create new record
            return await createAttendanceRecord(attendanceData);
        }
    }
    catch (error) {
        console.error("Error clocking in:", error);
        throw error;
    }
}
// Clock out functionality
export async function clockOut(employee_id, notes) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const today = new Date().toISOString().split("T")[0];
        const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);
        // Find today's attendance record
        const record = await collection.findOne({
            employee_id,
            date: today,
        });
        if (!record || !record.actual_start) {
            throw new Error("No clock-in record found for today");
        }
        if (record.actual_end) {
            throw new Error("Already clocked out today");
        }
        // Calculate total hours
        const startTime = new Date(`${today}T${record.actual_start}:00`);
        const endTime = new Date(`${today}T${currentTime}:00`);
        const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        // Calculate overtime (assuming 8 hours is standard)
        const standardHours = 8;
        const overtimeHours = Math.max(0, totalHours - standardHours);
        // Check if early departure
        const scheduledEnd = new Date(`${today}T${record.scheduled_end}:00`);
        const isEarlyDeparture = endTime < scheduledEnd;
        const updates = {
            actual_end: currentTime,
            total_hours: Math.round(totalHours * 100) / 100,
            overtime_hours: Math.round(overtimeHours * 100) / 100,
            early_departure: isEarlyDeparture,
            notes: notes || record.notes,
            updated_at: new Date().toISOString(),
        };
        await collection.updateOne({ _id: record._id }, { $set: updates });
        return await getAttendanceById(record._id.toString());
    }
    catch (error) {
        console.error("Error clocking out:", error);
        throw error;
    }
}
// Get timesheet summaries
export async function getTimesheetSummaries(filters = {}) {
    try {
        const db = getDb();
        const collection = db.collection("timesheet_summary");
        const query = {};
        if (filters.employee_id) {
            query.employee_id = filters.employee_id;
        }
        if (filters.department) {
            query.department = filters.department;
        }
        if (filters.pay_period_start) {
            query.pay_period_start = { $gte: filters.pay_period_start };
        }
        if (filters.pay_period_end) {
            query.pay_period_end = { $lte: filters.pay_period_end };
        }
        const summaries = await collection.find(query).toArray();
        return summaries;
    }
    catch (error) {
        console.error("Error fetching timesheet summaries:", error);
        throw new Error("Failed to fetch timesheet summaries");
    }
}
// Generate timesheet summary for a pay period
export async function generateTimesheetSummary(employee_id, pay_period_start, pay_period_end) {
    try {
        const db = getDb();
        const attendanceCollection = db.collection("staff_attendance");
        const timesheetCollection = db.collection("timesheet_summary");
        // Get all attendance records for the pay period
        const attendanceRecords = await attendanceCollection
            .find({
            employee_id,
            date: { $gte: pay_period_start, $lte: pay_period_end },
        })
            .toArray();
        if (attendanceRecords.length === 0) {
            throw new Error("No attendance records found for the specified period");
        }
        // Calculate summary statistics
        const totalWorkedHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
        const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
        const daysPresent = attendanceRecords.filter((record) => record.status === "present").length;
        const daysAbsent = attendanceRecords.filter((record) => record.status === "absent").length;
        const daysLate = attendanceRecords.filter((record) => record.late_arrival).length;
        const totalLateMinutes = attendanceRecords.reduce((sum, record) => sum + (record.late_minutes || 0), 0);
        const sickDays = attendanceRecords.filter((record) => record.status === "sick_leave").length;
        const vacationDays = attendanceRecords.filter((record) => record.status === "vacation").length;
        // Get employee info from first record
        const firstRecord = attendanceRecords[0];
        const hourlyRate = 50; // This should come from employee database
        const regularPay = totalWorkedHours * hourlyRate;
        const overtimePay = totalOvertimeHours * hourlyRate * 1.5;
        const totalPay = regularPay + overtimePay;
        const deductions = 0; // Calculate based on business rules
        const netPay = totalPay - deductions;
        const summary = {
            employee_id,
            employee_name: firstRecord.employee_name,
            role: firstRecord.role,
            department: firstRecord.department,
            pay_period_start,
            pay_period_end,
            total_scheduled_hours: attendanceRecords.length * 8, // Assuming 8 hours per day
            total_worked_hours: Math.round(totalWorkedHours * 100) / 100,
            total_overtime_hours: Math.round(totalOvertimeHours * 100) / 100,
            total_break_hours: attendanceRecords.length * 1, // Assuming 1 hour break per day
            days_present: daysPresent,
            days_absent: daysAbsent,
            days_late: daysLate,
            total_late_minutes: totalLateMinutes,
            sick_days: sickDays,
            vacation_days: vacationDays,
            hourly_rate,
            regular_pay: Math.round(regularPay * 100) / 100,
            overtime_pay: Math.round(overtimePay * 100) / 100,
            total_pay: Math.round(totalPay * 100) / 100,
            deductions,
            net_pay: Math.round(netPay * 100) / 100,
            approval_status: "draft",
        };
        // Check if summary already exists
        const existingSummary = await timesheetCollection.findOne({
            employee_id,
            pay_period_start,
            pay_period_end,
        });
        if (existingSummary) {
            // Update existing summary
            await timesheetCollection.updateOne({ _id: existingSummary._id }, {
                $set: {
                    ...summary,
                    updated_at: new Date().toISOString(),
                },
            });
            return { ...summary, _id: existingSummary._id };
        }
        else {
            // Create new summary
            const result = await timesheetCollection.insertOne({
                ...summary,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            return { ...summary, _id: result.insertedId };
        }
    }
    catch (error) {
        console.error("Error generating timesheet summary:", error);
        throw error;
    }
}
// Approve timesheet
export async function approveTimesheet(id, approved_by) {
    try {
        const db = getDb();
        const collection = db.collection("timesheet_summary");
        await collection.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                approval_status: "approved",
                approved_by,
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        });
        const updatedSummary = await collection.findOne({ _id: new ObjectId(id) });
        return updatedSummary;
    }
    catch (error) {
        console.error("Error approving timesheet:", error);
        throw new Error("Failed to approve timesheet");
    }
}
// Get attendance analytics
export async function getAttendanceAnalytics(filters) {
    try {
        const db = getDb();
        const collection = db.collection("staff_attendance");
        const query = {};
        if (filters.department)
            query.department = filters.department;
        if (filters.date_from || filters.date_to) {
            query.date = {};
            if (filters.date_from)
                query.date.$gte = filters.date_from;
            if (filters.date_to)
                query.date.$lte = filters.date_to;
        }
        const records = await collection.find(query).toArray();
        const analytics = {
            total_records: records.length,
            present_count: records.filter((r) => r.status === "present").length,
            absent_count: records.filter((r) => r.status === "absent").length,
            late_count: records.filter((r) => r.late_arrival).length,
            average_hours: records.length > 0
                ? records.reduce((sum, r) => sum + (r.total_hours || 0), 0) /
                    records.length
                : 0,
            total_overtime: records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0),
            attendance_rate: records.length > 0
                ? (records.filter((r) => r.status === "present").length /
                    records.length) *
                    100
                : 0,
            punctuality_rate: records.length > 0
                ? (records.filter((r) => !r.late_arrival).length / records.length) *
                    100
                : 0,
        };
        return analytics;
    }
    catch (error) {
        console.error("Error fetching attendance analytics:", error);
        throw new Error("Failed to fetch attendance analytics");
    }
}
// CRITICAL: Enhanced 15-minute grace period enforcement with automatic notifications
export async function sendLateArrivalNotification(employee_id, lateMinutes, employeeInfo) {
    try {
        const db = getDb();
        const notificationsCollection = db.collection("attendance_notifications");
        const employeesCollection = db.collection("employees");
        // Get employee's supervisor information
        const employee = await employeesCollection.findOne({ employee_id });
        const supervisorId = employee?.supervisor_id || "default_supervisor";
        // CRITICAL: Immediate notification to supervisor within 15 minutes
        const notification = {
            employee_id,
            employee_name: employeeInfo.employee_name,
            notification_type: "late_arrival_alert",
            late_minutes: lateMinutes,
            severity: lateMinutes > 30 ? "critical" : lateMinutes > 15 ? "high" : "medium",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().split(" ")[0].substring(0, 5),
            supervisor_id: supervisorId,
            notification_methods: ["email", "sms", "system_alert", "mobile_push"],
            status: "sent",
            requires_action: lateMinutes > 15,
            escalation_required: lateMinutes > 30,
            // CRITICAL: 15-minute notification requirement
            notification_deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            auto_escalation_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            doh_reportable: lateMinutes > 60, // Report excessive lateness to DOH
            created_at: new Date().toISOString(),
        };
        await notificationsCollection.insertOne(notification);
        // CRITICAL: Automatic escalation for excessive lateness (>30 minutes)
        if (lateMinutes > 30) {
            await escalateLateArrival(employee_id, lateMinutes, employeeInfo, supervisorId);
        }
        // CRITICAL: Update employee's attendance record with disciplinary flag
        if (lateMinutes > 15) {
            await flagAttendanceForReview(employee_id, lateMinutes);
        }
        // CRITICAL: DOH notification for excessive lateness
        if (lateMinutes > 60) {
            await sendDOHNotification(employee_id, lateMinutes, employeeInfo);
        }
        console.log(`CRITICAL LATE ARRIVAL ALERT: Employee ${employee_id} (${employeeInfo.employee_name}) is ${lateMinutes} minutes late - Supervisor ${supervisorId} notified within 15-minute requirement`);
    }
    catch (error) {
        console.error("Error sending late arrival notification:", error);
    }
}
// CRITICAL: DOH notification for excessive lateness
export async function sendDOHNotification(employee_id, lateMinutes, employeeInfo) {
    try {
        const db = getDb();
        const dohNotificationsCollection = db.collection("doh_notifications");
        const dohNotification = {
            notification_type: "staff_attendance_violation",
            employee_id,
            employee_name: employeeInfo.employee_name,
            violation_type: "excessive_lateness",
            late_minutes: lateMinutes,
            severity: "critical",
            regulatory_requirement: "DOH Staff Attendance Standards",
            notification_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "pending_submission",
            created_at: new Date().toISOString(),
        };
        await dohNotificationsCollection.insertOne(dohNotification);
        console.log(`DOH notification queued for employee ${employee_id} - ${lateMinutes} minutes late`);
    }
    catch (error) {
        console.error("Error sending DOH notification:", error);
    }
}
// CRITICAL: Escalate excessive late arrivals
export async function escalateLateArrival(employee_id, lateMinutes, employeeInfo, supervisorId) {
    try {
        const db = getDb();
        const escalationsCollection = db.collection("attendance_escalations");
        const escalation = {
            employee_id,
            employee_name: employeeInfo.employee_name,
            escalation_type: "excessive_lateness",
            late_minutes: lateMinutes,
            supervisor_id: supervisorId,
            escalated_to: "hr_manager",
            escalation_reason: `Employee late by ${lateMinutes} minutes - exceeds 30-minute threshold`,
            action_required: true,
            disciplinary_action_recommended: lateMinutes > 60,
            created_at: new Date().toISOString(),
            status: "pending_review",
        };
        await escalationsCollection.insertOne(escalation);
        // Send notification to HR
        const hrNotification = {
            type: "attendance_escalation",
            employee_id,
            late_minutes: lateMinutes,
            message: `URGENT: Employee ${employeeInfo.employee_name} is ${lateMinutes} minutes late - Disciplinary action may be required`,
            recipients: ["hr_manager", "department_head"],
            priority: "high",
            created_at: new Date().toISOString(),
        };
        await db.collection("hr_notifications").insertOne(hrNotification);
    }
    catch (error) {
        console.error("Error escalating late arrival:", error);
    }
}
// CRITICAL: Flag attendance for review
export async function flagAttendanceForReview(employee_id, lateMinutes) {
    try {
        const db = getDb();
        const attendanceCollection = db.collection("staff_attendance");
        const today = new Date().toISOString().split("T")[0];
        await attendanceCollection.updateOne({ employee_id, date: today }, {
            $set: {
                flagged_for_review: true,
                review_reason: `Late arrival: ${lateMinutes} minutes`,
                disciplinary_flag: lateMinutes > 30,
                review_priority: lateMinutes > 30 ? "high" : "medium",
                flagged_at: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Error flagging attendance for review:", error);
    }
}
// Create staff category-specific timesheet
export async function createStaffCategoryTimesheet(timesheetData) {
    try {
        const db = getDb();
        const collection = db.collection("staff_category_timesheets");
        const newTimesheet = {
            ...timesheetData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = await collection.insertOne(newTimesheet);
        return { ...newTimesheet, _id: result.insertedId };
    }
    catch (error) {
        console.error("Error creating staff category timesheet:", error);
        throw new Error("Failed to create staff category timesheet");
    }
}
// Get staff category timesheets
export async function getStaffCategoryTimesheets(filters = {}) {
    try {
        const db = getDb();
        const collection = db.collection("staff_category_timesheets");
        const query = {};
        if (filters.employee_id)
            query.employee_id = filters.employee_id;
        if (filters.staff_category)
            query.staff_category = filters.staff_category;
        if (filters.date_from || filters.date_to) {
            query.date = {};
            if (filters.date_from)
                query.date.$gte = filters.date_from;
            if (filters.date_to)
                query.date.$lte = filters.date_to;
        }
        const timesheets = await collection.find(query).toArray();
        return timesheets;
    }
    catch (error) {
        console.error("Error fetching staff category timesheets:", error);
        throw new Error("Failed to fetch staff category timesheets");
    }
}
// CRITICAL: Create specialized timesheet systems for each staff category
// 1. Etihad Vaccination Timesheet System
export async function createEtihadVaccinationTimesheet(timesheetData) {
    try {
        const totalVaccinations = timesheetData.vaccination_sessions.reduce((sum, session) => sum + session.vaccines_administered, 0);
        const totalSessionTime = timesheetData.vaccination_sessions.reduce((sum, session) => {
            const start = new Date(`${timesheetData.date}T${session.session_start}`);
            const end = new Date(`${timesheetData.date}T${session.session_end}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "Etihad_Vaccination",
            date: timesheetData.date,
            patient_visit_time: totalSessionTime,
            travel_time: timesheetData.travel_time,
            equipment_setup_time: timesheetData.setup_time,
            equipment_breakdown_time: timesheetData.cleanup_time,
            break_time: timesheetData.break_time,
            vaccination_count: totalVaccinations,
            admin_tasks_completed: timesheetData.administrative_tasks,
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating Etihad vaccination timesheet:", error);
        throw new Error("Failed to create Etihad vaccination timesheet");
    }
}
// 2. ICON Timesheet System
export async function createICONTimesheet(timesheetData) {
    try {
        const totalPatientTime = timesheetData.patient_visits.reduce((sum, visit) => {
            const start = new Date(`${timesheetData.date}T${visit.visit_start}`);
            const end = new Date(`${timesheetData.date}T${visit.visit_end}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "ICON",
            date: timesheetData.date,
            patient_visit_time: totalPatientTime,
            travel_time: timesheetData.travel_between_visits,
            equipment_setup_time: timesheetData.equipment_maintenance_time,
            break_time: timesheetData.break_time,
            admin_tasks_completed: [
                `Administrative time: ${timesheetData.administrative_time} minutes`,
            ],
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating ICON timesheet:", error);
        throw new Error("Failed to create ICON timesheet");
    }
}
// 3. RHHCS Admin Timesheet System
export async function createRHHCSAdminTimesheet(timesheetData) {
    try {
        const totalAdminTime = timesheetData.administrative_tasks.reduce((sum, task) => {
            const start = new Date(`${timesheetData.date}T${task.start_time}`);
            const end = new Date(`${timesheetData.date}T${task.end_time}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        const totalMeetingTime = timesheetData.meetings_attended.reduce((sum, meeting) => sum + meeting.duration, 0);
        const taskSummary = timesheetData.administrative_tasks.map((task) => `${task.task_name} (${task.task_category})`);
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "RHHCS_Admin",
            date: timesheetData.date,
            break_time: timesheetData.break_time,
            admin_tasks_completed: [
                ...taskSummary,
                `Meetings: ${totalMeetingTime} minutes`,
            ],
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating RHHCS Admin timesheet:", error);
        throw new Error("Failed to create RHHCS Admin timesheet");
    }
}
// 4. RHHCS Nurse Timesheet System
export async function createRHHCSNurseTimesheet(timesheetData) {
    try {
        const totalPatientTime = timesheetData.patient_visits.reduce((sum, visit) => {
            const start = new Date(`${timesheetData.date}T${visit.visit_start}`);
            const end = new Date(`${timesheetData.date}T${visit.visit_end}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        const proceduresSummary = timesheetData.patient_visits.flatMap((visit) => visit.nursing_procedures);
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "RHHCS_Nurse",
            date: timesheetData.date,
            patient_visit_time: totalPatientTime,
            travel_time: timesheetData.travel_time,
            equipment_setup_time: timesheetData.equipment_setup_time,
            break_time: timesheetData.break_time,
            admin_tasks_completed: [
                `Procedures: ${proceduresSummary.join(", ")}`,
                `Emergency calls: ${timesheetData.emergency_calls || 0}`,
            ],
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating RHHCS Nurse timesheet:", error);
        throw new Error("Failed to create RHHCS Nurse timesheet");
    }
}
// 5. RHHCS SMO (Senior Medical Officer) Timesheet System
export async function createRHHCSSMOTimesheet(timesheetData) {
    try {
        const totalConsultationTime = timesheetData.patient_consultations.reduce((sum, consultation) => {
            const start = new Date(`${timesheetData.date}T${consultation.consultation_start}`);
            const end = new Date(`${timesheetData.date}T${consultation.consultation_end}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        const totalAdminTime = timesheetData.administrative_duties.reduce((sum, duty) => sum + duty.duration, 0);
        const adminTasks = timesheetData.administrative_duties.map((duty) => duty.task);
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "RHHCS_SMO",
            date: timesheetData.date,
            patient_visit_time: totalConsultationTime,
            travel_time: timesheetData.travel_time,
            break_time: timesheetData.break_time,
            admin_tasks_completed: [
                ...adminTasks,
                `Supervision: ${timesheetData.supervision_time} minutes`,
                `Admin duties: ${totalAdminTime} minutes`,
            ],
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating RHHCS SMO timesheet:", error);
        throw new Error("Failed to create RHHCS SMO timesheet");
    }
}
// 6. RHHCS Therapist & Drivers Timesheet System
export async function createRHHCSTherapistDriverTimesheet(timesheetData) {
    try {
        let patientVisitTime = 0;
        let equipmentSetupTime = 0;
        let equipmentBreakdownTime = 0;
        let drivingDistance = 0;
        let vehicleInspectionTime = 0;
        let adminTasks = [];
        if (timesheetData.role === "Therapist" && timesheetData.therapy_sessions) {
            patientVisitTime = timesheetData.therapy_sessions.reduce((sum, session) => {
                const start = new Date(`${timesheetData.date}T${session.session_start}`);
                const end = new Date(`${timesheetData.date}T${session.session_end}`);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60);
            }, 0);
            equipmentSetupTime = timesheetData.therapy_sessions.reduce((sum, session) => sum + session.setup_time, 0);
            equipmentBreakdownTime = timesheetData.therapy_sessions.reduce((sum, session) => sum + session.breakdown_time, 0);
            adminTasks = [
                `Therapy sessions: ${timesheetData.therapy_sessions.length}`,
                `Equipment maintenance: ${timesheetData.equipment_maintenance_time || 0} minutes`,
            ];
        }
        if (timesheetData.role === "Driver" && timesheetData.driving_assignments) {
            drivingDistance = timesheetData.driving_assignments.reduce((sum, assignment) => sum + assignment.distance_km, 0);
            vehicleInspectionTime = timesheetData.driving_assignments.reduce((sum, assignment) => sum + assignment.vehicle_inspection_time, 0);
            adminTasks = [
                `Driving assignments: ${timesheetData.driving_assignments.length}`,
                `Total distance: ${drivingDistance} km`,
                `Vehicle inspections: ${vehicleInspectionTime} minutes`,
            ];
        }
        const categoryTimesheet = {
            employee_id: timesheetData.employee_id,
            employee_name: timesheetData.employee_name,
            staff_category: "RHHCS_Therapist",
            date: timesheetData.date,
            patient_visit_time: patientVisitTime,
            travel_time: timesheetData.travel_time,
            equipment_setup_time: equipmentSetupTime,
            equipment_breakdown_time: equipmentBreakdownTime,
            break_time: timesheetData.break_time,
            driving_distance_km: drivingDistance,
            vehicle_inspection_time: vehicleInspectionTime,
            admin_tasks_completed: adminTasks,
        };
        return await createStaffCategoryTimesheet(categoryTimesheet);
    }
    catch (error) {
        console.error("Error creating RHHCS Therapist/Driver timesheet:", error);
        throw new Error("Failed to create RHHCS Therapist/Driver timesheet");
    }
}
// CRITICAL: Get attendance compliance report with 15-minute grace period tracking
export async function getAttendanceComplianceReport(filters) {
    try {
        const db = getDb();
        const attendanceCollection = db.collection("staff_attendance");
        const categoryTimesheetsCollection = db.collection("staff_category_timesheets");
        const escalationsCollection = db.collection("attendance_escalations");
        const query = {};
        if (filters.date_from || filters.date_to) {
            query.date = {};
            if (filters.date_from)
                query.date.$gte = filters.date_from;
            if (filters.date_to)
                query.date.$lte = filters.date_to;
        }
        if (filters.department)
            query.department = filters.department;
        if (filters.employee_id)
            query.employee_id = filters.employee_id;
        const attendanceRecords = await attendanceCollection.find(query).toArray();
        const categoryTimesheets = await categoryTimesheetsCollection
            .find(query)
            .toArray();
        const escalations = await escalationsCollection.find(query).toArray();
        // Calculate grace period compliance
        const totalClockIns = attendanceRecords.filter((r) => r.actual_start).length;
        const onTimeArrivals = attendanceRecords.filter((r) => !r.late_arrival).length;
        const withinGracePeriod = attendanceRecords.filter((r) => r.late_arrival && r.late_minutes <= 15).length;
        const lateArrivals = attendanceRecords.filter((r) => r.late_arrival && r.late_minutes > 15).length;
        const complianceRate = totalClockIns > 0
            ? ((onTimeArrivals + withinGracePeriod) / totalClockIns) * 100
            : 0;
        // Calculate disciplinary actions
        const flaggedForReview = attendanceRecords.filter((r) => r.flagged_for_review).length;
        const escalatedCases = escalations.length;
        const disciplinaryActions = escalations.filter((e) => e.disciplinary_action_recommended).length;
        // Calculate staff category breakdown
        const categoryBreakdown = {};
        const categories = [
            ...new Set(categoryTimesheets.map((t) => t.staff_category)),
        ];
        categories.forEach((category) => {
            const categoryData = categoryTimesheets.filter((t) => t.staff_category === category);
            const totalTimesheets = categoryData.length;
            const avgPatientVisitTime = totalTimesheets > 0
                ? categoryData.reduce((sum, t) => sum + (t.patient_visit_time || 0), 0) / totalTimesheets
                : 0;
            const avgTravelTime = totalTimesheets > 0
                ? categoryData.reduce((sum, t) => sum + (t.travel_time || 0), 0) /
                    totalTimesheets
                : 0;
            categoryBreakdown[category] = {
                total_timesheets: totalTimesheets,
                average_patient_visit_time: Math.round(avgPatientVisitTime * 100) / 100,
                average_travel_time: Math.round(avgTravelTime * 100) / 100,
                compliance_score: 85, // This would be calculated based on specific business rules
            };
        });
        // Calculate overall compliance score
        const overallComplianceScore = complianceRate * 0.6 +
            (totalClockIns > 0
                ? ((totalClockIns - flaggedForReview) / totalClockIns) * 100 * 0.4
                : 0);
        return {
            grace_period_compliance: {
                total_clock_ins: totalClockIns,
                on_time_arrivals: onTimeArrivals,
                within_grace_period: withinGracePeriod,
                late_arrivals: lateArrivals,
                compliance_rate: Math.round(complianceRate * 100) / 100,
            },
            disciplinary_actions: {
                flagged_for_review: flaggedForReview,
                escalated_cases: escalatedCases,
                disciplinary_actions_taken: disciplinaryActions,
            },
            staff_category_breakdown: categoryBreakdown,
            overall_compliance_score: Math.round(overallComplianceScore * 100) / 100,
        };
    }
    catch (error) {
        console.error("Error generating attendance compliance report:", error);
        throw new Error("Failed to generate attendance compliance report");
    }
}
