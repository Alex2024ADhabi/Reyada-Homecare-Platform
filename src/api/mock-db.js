// In-memory collections storage
const collections = {};
// Mock ObjectId generator
class MockObjectId {
    constructor() {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        MockObjectId.counter++;
        this.id = MockObjectId.counter.toString().padStart(24, "0");
    }
    toString() {
        return this.id;
    }
    toHexString() {
        return this.id;
    }
}
Object.defineProperty(MockObjectId, "counter", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
// Export ObjectId for compatibility
export { MockObjectId as ObjectId };
// Create mock collection
function createMockCollection(name) {
    return {
        find: async (query = {}) => {
            if (!collections[name])
                collections[name] = [];
            if (Object.keys(query).length === 0) {
                return collections[name];
            }
            return collections[name].filter((item) => {
                for (const [key, value] of Object.entries(query)) {
                    if (key === "_id") {
                        const idStr = typeof value === "string" ? value : value.toString();
                        const itemIdStr = typeof item._id === "string" ? item._id : item._id.toString();
                        if (itemIdStr !== idStr)
                            return false;
                    }
                    else if (item[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        },
        findOne: async (query) => {
            if (!collections[name])
                collections[name] = [];
            const result = collections[name].find((item) => {
                for (const [key, value] of Object.entries(query)) {
                    if (key === "_id") {
                        const idStr = typeof value === "string" ? value : value.toString();
                        const itemIdStr = typeof item._id === "string" ? item._id : item._id.toString();
                        if (itemIdStr !== idStr)
                            return false;
                    }
                    else if (item[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
            return result || null;
        },
        insertOne: async (doc) => {
            if (!collections[name])
                collections[name] = [];
            const id = new MockObjectId();
            const newDoc = { ...doc, _id: id };
            collections[name].push(newDoc);
            return { insertedId: id };
        },
        insertMany: async (docs) => {
            if (!collections[name])
                collections[name] = [];
            const insertedIds = [];
            docs.forEach((doc) => {
                const id = new MockObjectId();
                const newDoc = { ...doc, _id: id };
                collections[name].push(newDoc);
                insertedIds.push(id);
            });
            return { insertedIds };
        },
        updateOne: async (query, update, options = {}) => {
            if (!collections[name])
                collections[name] = [];
            let index = -1;
            if (query._id) {
                const idStr = typeof query._id === "string" ? query._id : query._id.toString();
                index = collections[name].findIndex((item) => {
                    const itemIdStr = typeof item._id === "string" ? item._id : item._id.toString();
                    return itemIdStr === idStr;
                });
            }
            else {
                // Find by other fields
                index = collections[name].findIndex((item) => {
                    for (const [key, value] of Object.entries(query)) {
                        if (item[key] !== value)
                            return false;
                    }
                    return true;
                });
            }
            if (index !== -1) {
                const updatedDoc = { ...collections[name][index] };
                if (update.$set) {
                    Object.assign(updatedDoc, update.$set);
                }
                if (update.$push) {
                    for (const [key, value] of Object.entries(update.$push)) {
                        if (!updatedDoc[key])
                            updatedDoc[key] = [];
                        if (Array.isArray(updatedDoc[key])) {
                            updatedDoc[key].push(value);
                        }
                    }
                }
                if (update.$pull) {
                    for (const [key, condition] of Object.entries(update.$pull)) {
                        if (Array.isArray(updatedDoc[key])) {
                            updatedDoc[key] = updatedDoc[key].filter((item) => {
                                for (const [condKey, condValue] of Object.entries(condition)) {
                                    if (item[condKey] === condValue)
                                        return false;
                                }
                                return true;
                            });
                        }
                    }
                }
                if (update.$inc) {
                    for (const [key, value] of Object.entries(update.$inc)) {
                        if (typeof updatedDoc[key] === "number") {
                            updatedDoc[key] += value;
                        }
                    }
                }
                collections[name][index] = updatedDoc;
                return { matchedCount: 1, modifiedCount: 1 };
            }
            else if (options.upsert) {
                // Create new document if upsert is true
                const id = new MockObjectId();
                const newDoc = { ...query, _id: id };
                if (update.$set) {
                    Object.assign(newDoc, update.$set);
                }
                collections[name].push(newDoc);
                return {
                    matchedCount: 0,
                    modifiedCount: 0,
                    upsertedCount: 1,
                    upsertedId: id,
                };
            }
            return { matchedCount: 0, modifiedCount: 0 };
        },
        updateMany: async (query, update) => {
            if (!collections[name])
                collections[name] = [];
            let modifiedCount = 0;
            collections[name] = collections[name].map((item) => {
                let matches = true;
                for (const [key, value] of Object.entries(query)) {
                    if (item[key] !== value) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    modifiedCount++;
                    const updatedDoc = { ...item };
                    if (update.$set) {
                        Object.assign(updatedDoc, update.$set);
                    }
                    return updatedDoc;
                }
                return item;
            });
            return { matchedCount: modifiedCount, modifiedCount };
        },
        deleteOne: async (query) => {
            if (!collections[name])
                collections[name] = [];
            const initialLength = collections[name].length;
            collections[name] = collections[name].filter((item) => {
                for (const [key, value] of Object.entries(query)) {
                    if (key === "_id") {
                        const idStr = typeof value === "string" ? value : value.toString();
                        const itemIdStr = typeof item._id === "string" ? item._id : item._id.toString();
                        if (itemIdStr === idStr)
                            return false;
                    }
                    else if (item[key] === value) {
                        return false;
                    }
                }
                return true;
            });
            const deletedCount = initialLength - collections[name].length;
            return { deletedCount: Math.min(deletedCount, 1) };
        },
        deleteMany: async (query) => {
            if (!collections[name])
                collections[name] = [];
            const initialLength = collections[name].length;
            collections[name] = collections[name].filter((item) => {
                for (const [key, value] of Object.entries(query)) {
                    if (item[key] === value)
                        return false;
                }
                return true;
            });
            const deletedCount = initialLength - collections[name].length;
            return { deletedCount };
        },
        countDocuments: async (query = {}) => {
            if (!collections[name])
                collections[name] = [];
            if (Object.keys(query).length === 0) {
                return collections[name].length;
            }
            return collections[name].filter((item) => {
                for (const [key, value] of Object.entries(query)) {
                    if (item[key] !== value)
                        return false;
                }
                return true;
            }).length;
        },
        createIndexes: async (indexes) => {
            // Mock implementation - just log the indexes
            console.log(`Creating indexes for ${name}:`, indexes);
        },
    };
}
// Mock database interface
export const mockDb = {
    collection: (name) => createMockCollection(name),
    createCollection: async (name, options) => {
        if (!collections[name]) {
            collections[name] = [];
        }
        return createMockCollection(name);
    },
    listCollections: async () => {
        return Object.keys(collections).map((name) => ({ name }));
    },
    dropCollection: async (name) => {
        delete collections[name];
        return true;
    },
};
// Initialize sample data
export const initializeSampleData = async () => {
    // Clear existing data
    Object.keys(collections).forEach((key) => {
        collections[key] = [];
    });
    // Patient referrals sample data
    const referralsCollection = mockDb.collection("patient_referrals");
    await referralsCollection.insertMany([
        {
            patient_id: "PAT001",
            patient_name: "Ahmed Al Mansouri",
            emirates_id: "784-1985-1234567-8",
            referral_source: "Dubai Hospital",
            referring_physician: "Dr. Sarah Ahmed",
            referral_date: "2024-01-15",
            medical_condition: "Post-surgical wound care",
            urgency_level: "high",
            insurance_provider: "DAMAN",
            policy_number: "DM-2024-001234",
            status: "active",
            care_plan_id: "CP001",
            assigned_nurse: "Nurse Fatima Al Zahra",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            patient_id: "PAT002",
            patient_name: "Mariam Hassan",
            emirates_id: "784-1990-2345678-9",
            referral_source: "American Hospital Dubai",
            referring_physician: "Dr. Mohammed Ali",
            referral_date: "2024-01-16",
            medical_condition: "Diabetes management and monitoring",
            urgency_level: "medium",
            insurance_provider: "ADNIC",
            policy_number: "AD-2024-005678",
            status: "pending_assessment",
            care_plan_id: "CP002",
            assigned_nurse: "Nurse Aisha Mohammed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Daman authorizations sample data
    const damanCollection = mockDb.collection("daman_authorizations");
    await damanCollection.insertMany([
        {
            authorization_id: "AUTH001",
            patient_id: "PAT001",
            patient_name: "Ahmed Al Mansouri",
            policy_number: "DM-2024-001234",
            service_type: "Home Nursing Care",
            requested_sessions: 10,
            approved_sessions: 8,
            authorization_period: {
                start_date: "2024-01-15",
                end_date: "2024-02-15",
            },
            status: "approved",
            approval_date: "2024-01-16",
            remaining_sessions: 6,
            clinical_notes: "Post-surgical wound care required",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // ICD/CPT coding sample data
    const codingCollection = mockDb.collection("icd_cpt_coding");
    await codingCollection.insertMany([
        {
            coding_id: "CODE001",
            patient_id: "PAT001",
            service_date: "2024-01-17",
            icd_codes: [
                {
                    code: "Z48.00",
                    description: "Encounter for change or removal of surgical wound dressing",
                    type: "primary",
                },
            ],
            cpt_codes: [
                {
                    code: "99505",
                    description: "Home visit for the evaluation and management of an established patient",
                    units: 1,
                    modifier: null,
                },
            ],
            diagnosis: "Post-surgical wound care",
            procedures_performed: ["Wound assessment", "Dressing change"],
            clinical_notes: "Wound healing well, no signs of infection",
            coded_by: "Nurse Fatima Al Zahra",
            reviewed_by: "Dr. Sarah Ahmed",
            status: "completed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Claims processing sample data
    const claimsCollection = mockDb.collection("claims_processing");
    await claimsCollection.insertMany([
        {
            claim_id: "CLM001",
            patient_id: "PAT001",
            patient_name: "Ahmed Al Mansouri",
            claim_number: "RHC-2024-001",
            service_month: "January",
            service_year: 2024,
            primary_clinician: "Nurse Fatima Al Zahra",
            services_provided: [
                {
                    service_date: "2024-01-17",
                    service_type: "Home Nursing Visit",
                    duration_minutes: 60,
                    icd_codes: ["Z48.00"],
                    cpt_codes: ["99505"],
                    notes: "Wound care and assessment",
                },
            ],
            total_amount: 250.0,
            claim_status: "submitted",
            submission_date: "2024-01-18",
            insurance_provider: "DAMAN",
            authorization_number: "AUTH001",
            documentation_audit_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Clinician licenses sample data
    const licensesCollection = mockDb.collection("clinician_licenses");
    await licensesCollection.insertMany([
        {
            license_id: "LIC001",
            clinician_name: "Nurse Fatima Al Zahra",
            employee_id: "EMP001",
            license_number: "RN-UAE-2024-001",
            license_type: "Registered Nurse",
            issuing_authority: "Dubai Health Authority",
            issue_date: "2023-01-15",
            expiry_date: "2025-01-15",
            license_status: "active",
            compliance_status: "compliant",
            role: "Senior Nurse",
            department: "Home Care Services",
            specializations: ["Wound Care", "Diabetes Management"],
            continuing_education: {
                required_hours: 40,
                completed_hours: 35,
                deadline: "2024-12-31",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Revenue cycle metrics sample data
    const revenueCollection = mockDb.collection("revenue_cycle_metrics");
    await revenueCollection.insertOne({
        metric_date: "2024-01-18",
        total_claims_submitted: 15,
        total_revenue_billed: 3750.0,
        average_claim_value: 250.0,
        claims_by_status: {
            submitted: 8,
            approved: 5,
            denied: 1,
            pending: 1,
        },
        revenue_by_service: {
            "Home Nursing": 2000.0,
            Physiotherapy: 1000.0,
            "Wound Care": 750.0,
        },
        top_performing_clinicians: [
            {
                name: "Nurse Fatima Al Zahra",
                claims_count: 6,
                revenue_generated: 1500.0,
            },
        ],
        compliance_metrics: {
            documentation_completion_rate: 95.5,
            coding_accuracy_rate: 98.2,
            authorization_compliance_rate: 100.0,
        },
        created_at: new Date().toISOString(),
    });
    // Manpower capacity sample data
    const manpowerCollection = mockDb.collection("manpower_capacity");
    await manpowerCollection.insertMany([
        {
            staff_member: "Nurse Fatima Al Zahra",
            employee_id: "EMP001",
            date: "2024-01-18",
            shift: "morning",
            role: "Senior Nurse",
            specializations: ["Wound Care", "Diabetes Management"],
            availability_status: "available",
            current_patient_load: 4,
            maximum_patient_capacity: 6,
            geographic_zones: ["Dubai Marina", "JBR", "Downtown Dubai"],
            scheduled_visits: [
                {
                    patient_id: "PAT001",
                    visit_time: "09:00",
                    estimated_duration: 60,
                    service_type: "Wound Care",
                },
            ],
            travel_time_buffer: 30,
            emergency_availability: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Therapy sessions sample data
    const therapyCollection = mockDb.collection("therapy_sessions");
    await therapyCollection.insertMany([
        {
            session_id: "THER001",
            patient_id: "PAT002",
            patient_name: "Mariam Hassan",
            therapist: "Dr. Ahmed Physiotherapist",
            therapy_type: "Physical Therapy",
            session_date: "2024-01-18",
            session_time: "14:00",
            duration_minutes: 45,
            session_notes: "Mobility exercises for post-surgery recovery",
            progress_assessment: "Good improvement in range of motion",
            next_session_scheduled: "2024-01-20",
            status: "completed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);
    // Communication & Collaboration Systems Data
    // Platform Patient Chat Groups
    const chatGroupsCollection = mockDb.collection("platform_patient_chat_groups");
    await chatGroupsCollection.insertMany([
        {
            group_id: "GRP001",
            group_name: "Ahmed Al Mansouri - Care Team",
            patient_id: "PAT001",
            patient_name: "Ahmed Al Mansouri",
            group_type: "patient_care",
            participants: [
                {
                    user_id: "EMP001",
                    user_name: "Nurse Fatima Al Zahra",
                    role: "Primary Nurse",
                    user_type: "staff",
                    permissions: ["read", "write", "admin"],
                    joined_at: "2024-01-15T08:00:00Z",
                },
                {
                    user_id: "DOC001",
                    user_name: "Dr. Sarah Ahmed",
                    role: "Attending Physician",
                    user_type: "staff",
                    permissions: ["read", "write"],
                    joined_at: "2024-01-15T08:00:00Z",
                },
                {
                    user_id: "FAM001",
                    user_name: "Omar Al Mansouri",
                    role: "Son",
                    user_type: "family",
                    permissions: ["read"],
                    joined_at: "2024-01-15T10:00:00Z",
                },
            ],
            group_settings: {
                allow_file_sharing: true,
                allow_voice_messages: true,
                notification_enabled: true,
                auto_archive_days: 90,
                privacy_level: "restricted",
            },
            status: "active",
            created_by: "Nurse Fatima Al Zahra",
            created_at: "2024-01-15T08:00:00Z",
            updated_at: "2024-01-18T14:30:00Z",
        },
        {
            group_id: "GRP002",
            group_name: "Mariam Hassan - Diabetes Care",
            patient_id: "PAT002",
            patient_name: "Mariam Hassan",
            group_type: "therapy_coordination",
            participants: [
                {
                    user_id: "EMP002",
                    user_name: "Nurse Aisha Mohammed",
                    role: "Diabetes Specialist",
                    user_type: "staff",
                    permissions: ["read", "write", "admin"],
                    joined_at: "2024-01-16T09:00:00Z",
                },
                {
                    user_id: "THER001",
                    user_name: "Dr. Ahmed Physiotherapist",
                    role: "Physical Therapist",
                    user_type: "staff",
                    permissions: ["read", "write"],
                    joined_at: "2024-01-16T09:00:00Z",
                },
            ],
            group_settings: {
                allow_file_sharing: true,
                allow_voice_messages: false,
                notification_enabled: true,
                auto_archive_days: 60,
                privacy_level: "restricted",
            },
            status: "active",
            created_by: "Nurse Aisha Mohammed",
            created_at: "2024-01-16T09:00:00Z",
            updated_at: "2024-01-18T11:15:00Z",
        },
    ]);
    // Platform Patient Chat Messages
    const chatMessagesCollection = mockDb.collection("platform_patient_chat_messages");
    await chatMessagesCollection.insertMany([
        {
            message_id: "MSG001",
            group_id: "GRP001",
            sender_id: "EMP001",
            sender_name: "Nurse Fatima Al Zahra",
            sender_type: "staff",
            message_type: "text",
            content: "Good morning! I'll be visiting Ahmed today at 9 AM for wound care. The healing progress has been excellent.",
            attachments: [],
            reply_to_message_id: null,
            message_status: "delivered",
            read_by: [
                {
                    user_id: "DOC001",
                    read_at: "2024-01-18T08:15:00Z",
                },
                {
                    user_id: "FAM001",
                    read_at: "2024-01-18T08:30:00Z",
                },
            ],
            reactions: [
                {
                    user_id: "FAM001",
                    reaction_type: "thumbs_up",
                    created_at: "2024-01-18T08:31:00Z",
                },
            ],
            priority: "normal",
            created_at: "2024-01-18T08:00:00Z",
            updated_at: "2024-01-18T08:31:00Z",
        },
        {
            message_id: "MSG002",
            group_id: "GRP001",
            sender_id: "FAM001",
            sender_name: "Omar Al Mansouri",
            sender_type: "family",
            message_type: "text",
            content: "Thank you for the update! Dad is feeling much better today. Should we prepare anything special for the visit?",
            attachments: [],
            reply_to_message_id: "MSG001",
            message_status: "delivered",
            read_by: [
                {
                    user_id: "EMP001",
                    read_at: "2024-01-18T08:35:00Z",
                },
            ],
            reactions: [],
            priority: "normal",
            created_at: "2024-01-18T08:32:00Z",
            updated_at: "2024-01-18T08:35:00Z",
        },
    ]);
    // Email Templates
    const emailTemplatesCollection = mockDb.collection("email_templates");
    await emailTemplatesCollection.insertMany([
        {
            template_id: "TMPL001",
            template_name: "Care Plan Update Notification",
            template_category: "patient_communication",
            subject_template: "Care Plan Update for {{patient_name}}",
            body_template: "Dear {{recipient_name}},\n\nWe wanted to update you on the care plan for {{patient_name}}.\n\n{{care_updates}}\n\nNext scheduled visit: {{next_visit_date}}\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\n{{nurse_name}}\nReyada Home Care",
            template_variables: [
                {
                    variable_name: "patient_name",
                    variable_type: "text",
                    required: true,
                    description: "Patient's full name",
                },
                {
                    variable_name: "recipient_name",
                    variable_type: "text",
                    required: true,
                    description: "Recipient's name",
                },
                {
                    variable_name: "care_updates",
                    variable_type: "textarea",
                    required: true,
                    description: "Detailed care updates",
                },
                {
                    variable_name: "next_visit_date",
                    variable_type: "date",
                    required: false,
                    description: "Next scheduled visit date",
                },
                {
                    variable_name: "nurse_name",
                    variable_type: "text",
                    required: true,
                    description: "Nurse's full name",
                },
            ],
            workflow_triggers: [
                {
                    trigger_type: "care_plan_update",
                    auto_send: false,
                    approval_required: true,
                },
            ],
            template_settings: {
                allow_customization: true,
                require_approval: true,
                track_opens: true,
                track_clicks: true,
                priority: "normal",
            },
            status: "active",
            created_by: "Dr. Sarah Ahmed",
            created_at: "2024-01-10T10:00:00Z",
            updated_at: "2024-01-15T14:30:00Z",
        },
        {
            template_id: "TMPL002",
            template_name: "Incident Report Notification",
            template_category: "incident_management",
            subject_template: "URGENT: Incident Report - {{incident_type}}",
            body_template: "INCIDENT ALERT\n\nIncident Type: {{incident_type}}\nSeverity: {{severity}}\nPatient: {{patient_name}}\nLocation: {{location}}\nReported By: {{reported_by}}\nDate/Time: {{incident_datetime}}\n\nDescription:\n{{description}}\n\nImmediate Actions Taken:\n{{immediate_actions}}\n\nThis incident requires immediate attention and review.\n\nIncident ID: {{incident_id}}",
            template_variables: [
                {
                    variable_name: "incident_type",
                    variable_type: "text",
                    required: true,
                    description: "Type of incident",
                },
                {
                    variable_name: "severity",
                    variable_type: "text",
                    required: true,
                    description: "Incident severity level",
                },
                {
                    variable_name: "patient_name",
                    variable_type: "text",
                    required: false,
                    description: "Patient name if applicable",
                },
            ],
            workflow_triggers: [
                {
                    trigger_type: "incident_reported",
                    auto_send: true,
                    approval_required: false,
                },
            ],
            template_settings: {
                allow_customization: false,
                require_approval: false,
                track_opens: true,
                track_clicks: false,
                priority: "high",
            },
            status: "active",
            created_by: "Quality Manager",
            created_at: "2024-01-05T09:00:00Z",
            updated_at: "2024-01-10T16:00:00Z",
        },
    ]);
    // Email Communications
    const emailCommunicationsCollection = mockDb.collection("email_communications");
    await emailCommunicationsCollection.insertMany([
        {
            communication_id: "COMM001",
            template_id: "TMPL001",
            template_name: "Care Plan Update Notification",
            sender: {
                user_id: "EMP001",
                name: "Nurse Fatima Al Zahra",
                email: "fatima.alzahra@reyada.ae",
                role: "Senior Nurse",
            },
            recipients: [
                {
                    recipient_type: "family",
                    name: "Omar Al Mansouri",
                    email: "omar.almansouri@email.com",
                    patient_id: "PAT001",
                    relationship: "Son",
                },
                {
                    recipient_type: "staff",
                    name: "Dr. Sarah Ahmed",
                    email: "sarah.ahmed@reyada.ae",
                    role: "Attending Physician",
                },
            ],
            subject: "Care Plan Update for Ahmed Al Mansouri",
            body: "Dear Omar Al Mansouri,\n\nWe wanted to update you on the care plan for Ahmed Al Mansouri.\n\nYour father's wound is healing excellently. We've reduced the frequency of dressing changes from daily to every other day. His mobility has improved significantly, and he's been following the prescribed exercises.\n\nNext scheduled visit: January 20, 2024\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nNurse Fatima Al Zahra\nReyada Home Care",
            priority: "normal",
            status: "sent",
            sent_at: "2024-01-18T10:30:00Z",
            delivery_status: {
                delivered: 2,
                failed: 0,
                pending: 0,
            },
            tracking: {
                opened: true,
                open_count: 3,
                first_opened_at: "2024-01-18T11:15:00Z",
                last_opened_at: "2024-01-18T14:22:00Z",
                clicked: false,
                click_count: 0,
            },
            workflow_context: {
                trigger_type: "manual_send",
                patient_id: "PAT001",
                care_plan_id: "CP001",
            },
            created_at: "2024-01-18T10:25:00Z",
            updated_at: "2024-01-18T14:22:00Z",
        },
    ]);
    // Committees
    const committeesCollection = mockDb.collection("committees");
    await committeesCollection.insertMany([
        {
            committee_id: "COMM001",
            committee_name: "Quality Assurance Committee",
            committee_type: "quality_management",
            description: "Oversees quality improvement initiatives and patient safety measures",
            members: [
                {
                    user_id: "QM001",
                    name: "Dr. Amina Quality Manager",
                    role: "Committee Chair",
                    department: "Quality Assurance",
                    email: "amina.qm@reyada.ae",
                    joined_date: "2024-01-01",
                    status: "active",
                },
                {
                    user_id: "EMP001",
                    name: "Nurse Fatima Al Zahra",
                    role: "Clinical Representative",
                    department: "Home Care Services",
                    email: "fatima.alzahra@reyada.ae",
                    joined_date: "2024-01-01",
                    status: "active",
                },
                {
                    user_id: "DOC001",
                    name: "Dr. Sarah Ahmed",
                    role: "Medical Director",
                    department: "Medical Services",
                    email: "sarah.ahmed@reyada.ae",
                    joined_date: "2024-01-01",
                    status: "active",
                },
            ],
            meeting_schedule: {
                frequency: "monthly",
                day_of_month: 15,
                time: "14:00",
                duration_minutes: 120,
                location: "Conference Room A",
            },
            governance_structure: {
                reporting_to: "Executive Committee",
                authority_level: "operational",
                decision_making_process: "consensus",
                quorum_requirement: 3,
            },
            status: "active",
            created_by: "Dr. Amina Quality Manager",
            created_at: "2024-01-01T08:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
        },
        {
            committee_id: "COMM002",
            committee_name: "Patient Safety Committee",
            committee_type: "patient_safety",
            description: "Focuses on patient safety initiatives and incident prevention",
            members: [
                {
                    user_id: "PS001",
                    name: "Dr. Hassan Patient Safety Officer",
                    role: "Committee Chair",
                    department: "Patient Safety",
                    email: "hassan.pso@reyada.ae",
                    joined_date: "2024-01-01",
                    status: "active",
                },
                {
                    user_id: "EMP002",
                    name: "Nurse Aisha Mohammed",
                    role: "Clinical Representative",
                    department: "Home Care Services",
                    email: "aisha.mohammed@reyada.ae",
                    joined_date: "2024-01-01",
                    status: "active",
                },
            ],
            meeting_schedule: {
                frequency: "bi-weekly",
                day_of_week: "Tuesday",
                time: "10:00",
                duration_minutes: 90,
                location: "Virtual Meeting",
            },
            governance_structure: {
                reporting_to: "Quality Assurance Committee",
                authority_level: "advisory",
                decision_making_process: "majority_vote",
                quorum_requirement: 2,
            },
            status: "active",
            created_by: "Dr. Hassan Patient Safety Officer",
            created_at: "2024-01-01T08:00:00Z",
            updated_at: "2024-01-10T14:30:00Z",
        },
    ]);
    // Committee Meetings
    const committeeMeetingsCollection = mockDb.collection("committee_meetings");
    await committeeMeetingsCollection.insertMany([
        {
            meeting_id: "MEET001",
            committee_id: "COMM001",
            committee_name: "Quality Assurance Committee",
            meeting_title: "Monthly Quality Review - January 2024",
            meeting_date: "2024-01-15",
            meeting_time: "14:00",
            duration_minutes: 120,
            location: "Conference Room A",
            meeting_type: "regular",
            agenda: [
                {
                    item_id: "AGD001",
                    title: "Review of Patient Satisfaction Scores",
                    presenter: "Dr. Amina Quality Manager",
                    duration_minutes: 20,
                    documents: ["patient_satisfaction_q4_2023.pdf"],
                },
                {
                    item_id: "AGD002",
                    title: "Incident Reports Analysis",
                    presenter: "Dr. Hassan Patient Safety Officer",
                    duration_minutes: 30,
                    documents: ["incident_analysis_jan_2024.pdf"],
                },
                {
                    item_id: "AGD003",
                    title: "New Quality Improvement Initiatives",
                    presenter: "Nurse Fatima Al Zahra",
                    duration_minutes: 25,
                    documents: [],
                },
            ],
            attendees: [
                {
                    user_id: "QM001",
                    name: "Dr. Amina Quality Manager",
                    attendance_status: "present",
                    joined_at: "14:00",
                    left_at: "16:00",
                },
                {
                    user_id: "EMP001",
                    name: "Nurse Fatima Al Zahra",
                    attendance_status: "present",
                    joined_at: "14:05",
                    left_at: "16:00",
                },
                {
                    user_id: "DOC001",
                    name: "Dr. Sarah Ahmed",
                    attendance_status: "absent",
                    reason: "Patient emergency",
                },
            ],
            minutes: {
                key_discussions: [
                    "Patient satisfaction scores have improved by 12% compared to Q3 2023",
                    "Three minor incidents reported in January, all resolved without patient harm",
                    "Proposed implementation of new wound care protocols",
                ],
                decisions_made: [
                    {
                        decision_id: "DEC001",
                        description: "Approve new wound care protocol implementation",
                        decision_type: "approval",
                        voting_result: "unanimous",
                        effective_date: "2024-02-01",
                    },
                ],
                action_items: [
                    {
                        action_id: "ACT001",
                        description: "Develop training materials for new wound care protocols",
                        assigned_to: "Nurse Fatima Al Zahra",
                        due_date: "2024-01-30",
                        priority: "high",
                        status: "assigned",
                    },
                    {
                        action_id: "ACT002",
                        description: "Schedule staff training sessions for February",
                        assigned_to: "Dr. Amina Quality Manager",
                        due_date: "2024-01-25",
                        priority: "medium",
                        status: "assigned",
                    },
                ],
            },
            meeting_status: "completed",
            created_by: "Dr. Amina Quality Manager",
            created_at: "2024-01-10T09:00:00Z",
            updated_at: "2024-01-15T16:30:00Z",
        },
    ]);
    // Governance Documents
    const governanceDocumentsCollection = mockDb.collection("governance_documents");
    await governanceDocumentsCollection.insertMany([
        {
            document_id: "DOC001",
            document_title: "Patient Communication Policy",
            document_type: "policy",
            document_category: "patient_care",
            version: "2.1",
            document_content: {
                file_path: "/documents/policies/patient_communication_policy_v2.1.pdf",
                file_size: 2048576,
                file_type: "pdf",
                page_count: 12,
            },
            document_summary: "Comprehensive policy outlining standards for patient and family communication, including emergency notifications, care updates, and privacy considerations.",
            approval_workflow: {
                current_stage: "approved",
                approval_history: [
                    {
                        stage: "draft",
                        approver: "Dr. Amina Quality Manager",
                        approved_at: "2024-01-05T10:00:00Z",
                        comments: "Initial draft reviewed and approved for circulation",
                    },
                    {
                        stage: "review",
                        approver: "Dr. Sarah Ahmed",
                        approved_at: "2024-01-08T14:30:00Z",
                        comments: "Medical review completed, minor revisions suggested",
                    },
                    {
                        stage: "final_approval",
                        approver: "Executive Director",
                        approved_at: "2024-01-10T16:00:00Z",
                        comments: "Final approval granted, effective immediately",
                    },
                ],
            },
            distribution_list: [
                {
                    recipient_type: "department",
                    department: "Home Care Services",
                    mandatory: true,
                },
                {
                    recipient_type: "role",
                    role: "Registered Nurse",
                    mandatory: true,
                },
                {
                    recipient_type: "committee",
                    committee_id: "COMM001",
                    mandatory: false,
                },
            ],
            compliance_requirements: {
                acknowledgment_required: true,
                acknowledgment_deadline: "2024-01-25",
                training_required: true,
                training_deadline: "2024-02-10",
                assessment_required: false,
            },
            document_status: "active",
            effective_date: "2024-01-10",
            review_date: "2024-07-10",
            expiry_date: "2025-01-10",
            created_by: "Dr. Amina Quality Manager",
            created_at: "2024-01-05T09:00:00Z",
            updated_at: "2024-01-10T16:00:00Z",
        },
        {
            document_id: "DOC002",
            document_title: "Incident Reporting Procedures",
            document_type: "procedure",
            document_category: "quality_management",
            version: "1.3",
            document_content: {
                file_path: "/documents/procedures/incident_reporting_v1.3.pdf",
                file_size: 1536000,
                file_type: "pdf",
                page_count: 8,
            },
            document_summary: "Step-by-step procedures for reporting, investigating, and managing patient safety incidents and near-miss events.",
            approval_workflow: {
                current_stage: "approved",
                approval_history: [
                    {
                        stage: "draft",
                        approver: "Dr. Hassan Patient Safety Officer",
                        approved_at: "2024-01-03T11:00:00Z",
                        comments: "Initial procedure draft completed",
                    },
                    {
                        stage: "final_approval",
                        approver: "Dr. Amina Quality Manager",
                        approved_at: "2024-01-06T15:00:00Z",
                        comments: "Approved with minor formatting changes",
                    },
                ],
            },
            distribution_list: [
                {
                    recipient_type: "all_staff",
                    mandatory: true,
                },
            ],
            compliance_requirements: {
                acknowledgment_required: true,
                acknowledgment_deadline: "2024-01-20",
                training_required: true,
                training_deadline: "2024-02-05",
                assessment_required: true,
            },
            document_status: "active",
            effective_date: "2024-01-06",
            review_date: "2024-04-06",
            expiry_date: "2024-10-06",
            created_by: "Dr. Hassan Patient Safety Officer",
            created_at: "2024-01-03T10:00:00Z",
            updated_at: "2024-01-06T15:00:00Z",
        },
    ]);
    // Staff Acknowledgments
    const staffAcknowledgmentsCollection = mockDb.collection("staff_acknowledgments");
    await staffAcknowledgmentsCollection.insertMany([
        {
            acknowledgment_id: "ACK001",
            document_id: "DOC001",
            document_title: "Patient Communication Policy",
            staff_member: {
                employee_id: "EMP001",
                name: "Nurse Fatima Al Zahra",
                department: "Home Care Services",
                role: "Senior Nurse",
                email: "fatima.alzahra@reyada.ae",
            },
            acknowledgment_status: "completed",
            acknowledged_at: "2024-01-12T09:30:00Z",
            acknowledgment_method: "digital_signature",
            training_status: "completed",
            training_completed_at: "2024-01-15T14:00:00Z",
            assessment_status: "not_required",
            compliance_score: 100,
            deadline_date: "2024-01-25",
            reminder_sent: [
                {
                    reminder_date: "2024-01-11T08:00:00Z",
                    reminder_type: "email",
                    status: "delivered",
                },
            ],
            created_at: "2024-01-10T16:30:00Z",
            updated_at: "2024-01-15T14:00:00Z",
        },
        {
            acknowledgment_id: "ACK002",
            document_id: "DOC001",
            document_title: "Patient Communication Policy",
            staff_member: {
                employee_id: "EMP002",
                name: "Nurse Aisha Mohammed",
                department: "Home Care Services",
                role: "Diabetes Specialist",
                email: "aisha.mohammed@reyada.ae",
            },
            acknowledgment_status: "pending",
            acknowledged_at: null,
            acknowledgment_method: null,
            training_status: "pending",
            training_completed_at: null,
            assessment_status: "not_required",
            compliance_score: 0,
            deadline_date: "2024-01-25",
            reminder_sent: [
                {
                    reminder_date: "2024-01-11T08:00:00Z",
                    reminder_type: "email",
                    status: "delivered",
                },
                {
                    reminder_date: "2024-01-16T08:00:00Z",
                    reminder_type: "email",
                    status: "delivered",
                },
            ],
            created_at: "2024-01-10T16:30:00Z",
            updated_at: "2024-01-16T08:00:00Z",
        },
    ]);
    // Communication Dashboard
    const communicationDashboardCollection = mockDb.collection("communication_dashboard");
    await communicationDashboardCollection.insertOne({
        dashboard_date: "2024-01-18",
        real_time_metrics: {
            active_chat_groups: 15,
            messages_today: 47,
            emails_sent_today: 8,
            pending_responses: 3,
            overdue_responses: 1,
            active_meetings_today: 2,
            pending_acknowledgments: 8,
        },
        communication_channels: {
            platform_chat: {
                total_groups: 15,
                active_groups: 12,
                messages_sent: 234,
                average_response_time_minutes: 12,
                user_engagement_rate: 87.5,
            },
            email_workflow: {
                templates_active: 12,
                emails_sent: 156,
                delivery_rate: 98.7,
                open_rate: 77.1,
                click_rate: 19.1,
            },
            committee_management: {
                active_committees: 5,
                meetings_this_month: 8,
                action_items_pending: 15,
                completion_rate: 82.3,
            },
            governance_documents: {
                active_documents: 45,
                pending_approvals: 3,
                acknowledgment_rate: 94.2,
                compliance_score: 96.8,
            },
        },
        performance_metrics: {
            system_uptime: 99.9,
            average_response_time_ms: 145,
            error_rate: 0.1,
            user_satisfaction_score: 4.6,
        },
        alerts_and_notifications: {
            critical_alerts: 0,
            high_priority_alerts: 2,
            medium_priority_alerts: 5,
            system_notifications: 12,
        },
        created_at: "2024-01-18T23:59:59Z",
    });
    // Communication Analytics
    const communicationAnalyticsCollection = mockDb.collection("communication_analytics");
    await communicationAnalyticsCollection.insertOne({
        analytics_id: "ANALYTICS001",
        report_period: {
            start_date: "2024-01-01",
            end_date: "2024-01-18",
            period_type: "monthly_to_date",
        },
        communication_volume: {
            total_messages: 1247,
            total_emails: 234,
            total_meetings: 12,
            total_documents_distributed: 89,
            daily_average_messages: 69.3,
            peak_communication_hour: "10:00-11:00",
        },
        engagement_metrics: {
            chat_participation_rate: 89.2,
            email_response_rate: 76.8,
            meeting_attendance_rate: 91.7,
            document_acknowledgment_rate: 94.2,
        },
        response_time_analysis: {
            average_chat_response_minutes: 12,
            average_email_response_hours: 4.2,
            fastest_response_time_minutes: 2,
            slowest_response_time_hours: 24,
        },
        quality_metrics: {
            communication_effectiveness_score: 4.3,
            user_satisfaction_rating: 4.6,
            error_resolution_time_hours: 2.1,
            system_reliability_percentage: 99.9,
        },
        trend_analysis: {
            communication_volume_trend: "increasing",
            volume_change_percentage: 12.5,
            engagement_trend: "stable",
            response_time_trend: "improving",
        },
        top_performers: {
            most_active_communicators: [
                {
                    name: "Nurse Fatima Al Zahra",
                    messages_sent: 89,
                    response_rate: 98.2,
                },
                {
                    name: "Dr. Sarah Ahmed",
                    messages_sent: 67,
                    response_rate: 94.1,
                },
            ],
            best_response_times: [
                {
                    name: "Nurse Aisha Mohammed",
                    average_response_minutes: 8,
                },
            ],
        },
        created_at: "2024-01-18T23:59:59Z",
    });
    console.log("Sample data initialized successfully!");
};
// Initialize sample data on module load
initializeSampleData().catch(console.error);
export default mockDb;
