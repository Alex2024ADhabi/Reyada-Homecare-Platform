import axios from "axios";
export class ICDCPTCodingAPI {
    // Get all records
    static async getRecords() {
        try {
            const response = await axios.get(this.baseUrl);
            return response.data;
        }
        catch (error) {
            console.error("Error fetching ICD & CPT coding records:", error);
            throw error;
        }
    }
    // Get records by patient ID
    static async getRecordsByPatientId(patientId) {
        try {
            const response = await axios.get(`${this.baseUrl}/patient/${patientId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching ICD & CPT coding records for patient ${patientId}:`, error);
            throw error;
        }
    }
    // Get record by ID
    static async getRecord(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching ICD & CPT coding record ${id}:`, error);
            throw error;
        }
    }
    // Create a new record
    static async createRecord(recordData) {
        try {
            const response = await axios.post(this.baseUrl, recordData);
            return response.data;
        }
        catch (error) {
            console.error("Error creating ICD & CPT coding record:", error);
            throw error;
        }
    }
    // Update a record
    static async updateRecord(id, recordData) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, recordData);
            return response.data;
        }
        catch (error) {
            console.error(`Error updating ICD & CPT coding record ${id}:`, error);
            throw error;
        }
    }
    // Delete a record
    static async deleteRecord(id) {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
        }
        catch (error) {
            console.error(`Error deleting ICD & CPT coding record ${id}:`, error);
            throw error;
        }
    }
    // Submit physician query
    static async submitPhysicianQuery(id, queryData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/physician-query`, queryData);
            return response.data;
        }
        catch (error) {
            console.error(`Error submitting physician query for record ${id}:`, error);
            throw error;
        }
    }
    // Submit quality audit
    static async submitQualityAudit(id, auditData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/quality-audit`, auditData);
            return response.data;
        }
        catch (error) {
            console.error(`Error submitting quality audit for record ${id}:`, error);
            throw error;
        }
    }
    // Submit peer review
    static async submitPeerReview(id, reviewData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/peer-review`, reviewData);
            return response.data;
        }
        catch (error) {
            console.error(`Error submitting peer review for record ${id}:`, error);
            throw error;
        }
    }
    // Submit authorization check
    static async submitAuthorizationCheck(id, checkData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/check-authorization`, checkData);
            return response.data;
        }
        catch (error) {
            console.error(`Error submitting authorization check for record ${id}:`, error);
            throw error;
        }
    }
    // Resolve discrepancy
    static async resolveDiscrepancy(id) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/resolve-discrepancy`, {});
            return response.data;
        }
        catch (error) {
            console.error(`Error resolving discrepancy for record ${id}:`, error);
            throw error;
        }
    }
    // Enhanced Medical Record Review
    static async enhancedMedicalRecordReview(id, reviewData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/medical-record-review`, reviewData);
            return response.data;
        }
        catch (error) {
            console.error(`Error submitting medical record review for record ${id}:`, error);
            throw error;
        }
    }
    // Code Assignment Verification
    static async verifyCodeAssignment(id, verificationData) {
        try {
            const response = await axios.post(`${this.baseUrl}/${id}/verify-codes`, verificationData);
            return response.data;
        }
        catch (error) {
            console.error(`Error verifying code assignment for record ${id}:`, error);
            throw error;
        }
    }
    // Gap Analysis
    static async performGapAnalysis(patientId) {
        try {
            const response = await axios.get(`${this.baseUrl}/gap-analysis/${patientId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error performing gap analysis for patient ${patientId}:`, error);
            throw error;
        }
    }
    // Get coding performance metrics
    static async getCodingMetrics(patientId) {
        try {
            const url = patientId
                ? `${this.baseUrl}/metrics/${patientId}`
                : `${this.baseUrl}/metrics`;
            const response = await axios.get(url);
            return response.data;
        }
        catch (error) {
            console.error("Error fetching coding metrics:", error);
            throw error;
        }
    }
    // Update coding performance score
    static async updateCodingScore(id, scoreData) {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}/score`, scoreData);
            return response.data;
        }
        catch (error) {
            console.error(`Error updating coding score for record ${id}:`, error);
            throw error;
        }
    }
}
Object.defineProperty(ICDCPTCodingAPI, "baseUrl", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "/api/icd-cpt-coding"
});
