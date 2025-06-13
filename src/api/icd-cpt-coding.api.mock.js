// Mock data for ICD & CPT coding records
const mockRecords = [
    {
        id: "1",
        patient_id: "P12345",
        mrn: "MRN12345",
        service_date: "2023-10-15",
        authorization_number: "AUTH-98765",
        icd_codes_assigned: ["I10", "E11.9"],
        icd_descriptions: [
            "Essential (primary) hypertension",
            "Type 2 diabetes mellitus without complications",
        ],
        cpt_codes_assigned: ["99347", "97110"],
        cpt_descriptions: [
            "Home visit, established patient (15 min)",
            "Therapeutic exercises",
        ],
        physician_query_required: true,
        physician_query_sent: true,
        physician_response_received: false,
        qa_audit_completed: false,
        peer_review_completed: false,
        authorization_code_alignment_checked: false,
        coding_status: "In Progress",
        created_at: "2023-10-14T08:00:00Z",
        updated_at: "2023-10-15T10:30:00Z",
    },
    {
        id: "2",
        patient_id: "P12345",
        mrn: "MRN12345",
        service_date: "2023-10-10",
        authorization_number: "AUTH-98765",
        icd_codes_assigned: ["J44.9"],
        icd_descriptions: ["Chronic obstructive pulmonary disease, unspecified"],
        cpt_codes_assigned: ["99348", "97112"],
        cpt_descriptions: [
            "Home visit, established patient (25 min)",
            "Neuromuscular reeducation",
        ],
        physician_query_required: false,
        physician_query_sent: false,
        physician_response_received: false,
        qa_audit_completed: true,
        peer_review_completed: true,
        authorization_code_alignment_checked: true,
        coding_status: "Completed",
        created_at: "2023-10-09T08:00:00Z",
        updated_at: "2023-10-11T14:45:00Z",
    },
];
// Mock implementation of the ICDCPTCodingAPI
export const mockICDCPTCodingAPI = {
    getRecords: async () => Promise.resolve(mockRecords),
    getRecordsByPatientId: async (patientId) => Promise.resolve(mockRecords.filter((record) => record.patient_id === patientId)),
    getRecord: async (id) => {
        const record = mockRecords.find((record) => record.id === id);
        if (!record)
            throw new Error(`Record with ID ${id} not found`);
        return Promise.resolve(record);
    },
    createRecord: async (recordData) => {
        const newRecord = {
            id: `${Date.now()}`,
            patient_id: recordData.patient_id || "",
            mrn: recordData.mrn || "",
            service_date: recordData.service_date || new Date().toISOString().split("T")[0],
            authorization_number: recordData.authorization_number || "",
            icd_codes_assigned: recordData.icd_codes_assigned || [],
            icd_descriptions: recordData.icd_descriptions || [],
            cpt_codes_assigned: recordData.cpt_codes_assigned || [],
            cpt_descriptions: recordData.cpt_descriptions || [],
            physician_query_required: recordData.physician_query_required || false,
            physician_query_sent: recordData.physician_query_sent || false,
            physician_response_received: recordData.physician_response_received || false,
            qa_audit_completed: recordData.qa_audit_completed || false,
            peer_review_completed: recordData.peer_review_completed || false,
            authorization_code_alignment_checked: recordData.authorization_code_alignment_checked || false,
            coding_status: recordData.coding_status || "In Progress",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords.push(newRecord);
        return Promise.resolve(newRecord);
    },
    updateRecord: async (id, recordData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            ...recordData,
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    deleteRecord: async (id) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        mockRecords.splice(index, 1);
        return Promise.resolve();
    },
    submitPhysicianQuery: async (id, queryData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            physician_query_sent: true,
            physician_query_content: queryData.queryContent,
            physician_query_from: queryData.queryFrom,
            physician_query_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    submitQualityAudit: async (id, auditData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            qa_audit_completed: true,
            qa_audit_findings: auditData.findings,
            qa_audit_actions: auditData.actionsRequired,
            qa_audit_status: auditData.status,
            qa_audit_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    submitPeerReview: async (id, reviewData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            peer_review_completed: true,
            peer_reviewer: reviewData.reviewer,
            peer_review_comments: reviewData.comments,
            peer_review_approval: reviewData.approval,
            peer_review_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    submitAuthorizationCheck: async (id, checkData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            authorization_code_alignment_checked: true,
            authorization_discrepancies: checkData.discrepancies,
            authorization_resolution_required: checkData.resolutionRequired,
            authorization_check_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    resolveDiscrepancy: async (id) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            authorization_resolution_required: false,
            authorization_discrepancies_resolved: true,
            authorization_resolution_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    // New methods for enhanced functionality
    performGapAnalysis: async (patientId) => {
        const records = mockRecords.filter((record) => record.patient_id === patientId);
        const gapAnalysis = {
            totalRecords: records.length,
            completedRecords: records.filter((r) => r.coding_status === "Completed")
                .length,
            pendingPhysicianQueries: records.filter((r) => r.physician_query_sent && !r.physician_response_received).length,
            pendingQualityAudits: records.filter((r) => !r.qa_audit_completed).length,
            pendingPeerReviews: records.filter((r) => !r.peer_review_completed)
                .length,
            pendingAuthorizationChecks: records.filter((r) => !r.authorization_code_alignment_checked).length,
            complianceRate: records.length > 0
                ? (records.filter((r) => r.qa_audit_completed &&
                    r.peer_review_completed &&
                    r.authorization_code_alignment_checked).length /
                    records.length) *
                    100
                : 0,
            commonIssues: [
                "Missing specificity in ICD-10 codes",
                "CPT code and documentation mismatch",
                "Authorization code misalignment",
            ],
            recommendations: [
                "Schedule additional coder training on ICD-10 specificity",
                "Implement pre-submission documentation review",
                "Enhance authorization verification process",
            ],
        };
        return Promise.resolve(gapAnalysis);
    },
    verifyCodeAssignment: async (id, verificationData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            code_verification_completed: true,
            code_verifier: verificationData.verifier,
            code_verification_comments: verificationData.comments,
            code_verification_status: verificationData.status,
            code_verification_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    enhancedMedicalRecordReview: async (id, reviewData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            medical_record_review_completed: true,
            medical_record_reviewer: reviewData.reviewer,
            medical_record_findings: reviewData.findings,
            medical_record_recommendations: reviewData.recommendations,
            medical_record_review_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
    // Get coding performance metrics
    getCodingMetrics: async (patientId) => {
        const filteredRecords = patientId
            ? mockRecords.filter((record) => record.patient_id === patientId)
            : mockRecords;
        const metrics = {
            totalRecords: filteredRecords.length,
            completedRecords: filteredRecords.filter((r) => r.coding_status === "Completed").length,
            averageAccuracyScore: 95.5,
            averageCompletionTime: 2.5,
            queryResponseTime: 24.0,
            complianceRate: 98.2,
            topIssues: [
                "Missing specificity in ICD-10 codes",
                "CPT code documentation mismatch",
                "Authorization alignment issues",
            ],
            monthlyTrends: {
                accuracy: [94.2, 95.1, 95.5, 96.0],
                completionTime: [3.2, 2.8, 2.5, 2.3],
                complianceRate: [96.5, 97.2, 98.2, 98.5],
            },
        };
        return Promise.resolve(metrics);
    },
    // Update coding performance score
    updateCodingScore: async (id, scoreData) => {
        const index = mockRecords.findIndex((record) => record.id === id);
        if (index === -1)
            throw new Error(`Record with ID ${id} not found`);
        const updatedRecord = {
            ...mockRecords[index],
            coding_accuracy_score: scoreData.accuracy_score,
            coding_completion_time_hours: scoreData.completion_time,
            updated_at: new Date().toISOString(),
        };
        mockRecords[index] = updatedRecord;
        return Promise.resolve(updatedRecord);
    },
};
