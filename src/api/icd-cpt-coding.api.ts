import axios from "axios";

export interface ICDCPTCodingRecord {
  id: string;
  _id?: string; // For compatibility with existing code
  patient_id: string;
  mrn: string;
  service_date: string;
  authorization_number: string;
  icd_codes_assigned: string[];
  icd_descriptions: string[];
  cpt_codes_assigned: string[];
  cpt_descriptions: string[];
  physician_query_required: boolean;
  physician_query_sent: boolean;
  physician_response_received: boolean;
  qa_audit_completed: boolean;
  peer_review_completed: boolean;
  authorization_code_alignment_checked: boolean;
  coding_status: string;
  created_at?: string;
  updated_at: string;
}

export class ICDCPTCodingAPI {
  private static baseUrl = "/api/icd-cpt-coding";

  // Get all records
  static async getRecords(): Promise<ICDCPTCodingRecord[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching ICD & CPT coding records:", error);
      throw error;
    }
  }

  // Get records by patient ID
  static async getRecordsByPatientId(
    patientId: string,
  ): Promise<ICDCPTCodingRecord[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ICD & CPT coding records for patient ${patientId}:`,
        error,
      );
      throw error;
    }
  }

  // Get record by ID
  static async getRecord(id: string): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ICD & CPT coding record ${id}:`, error);
      throw error;
    }
  }

  // Create a new record
  static async createRecord(
    recordData: Partial<ICDCPTCodingRecord>,
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(this.baseUrl, recordData);
      return response.data;
    } catch (error) {
      console.error("Error creating ICD & CPT coding record:", error);
      throw error;
    }
  }

  // Update a record
  static async updateRecord(
    id: string,
    recordData: Partial<ICDCPTCodingRecord>,
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ICD & CPT coding record ${id}:`, error);
      throw error;
    }
  }

  // Delete a record
  static async deleteRecord(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting ICD & CPT coding record ${id}:`, error);
      throw error;
    }
  }

  // Submit physician query
  static async submitPhysicianQuery(
    id: string,
    queryData: { queryContent: string; queryFrom: string },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/physician-query`,
        queryData,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error submitting physician query for record ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Submit quality audit
  static async submitQualityAudit(
    id: string,
    auditData: { findings: string; actionsRequired: string; status: string },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/quality-audit`,
        auditData,
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting quality audit for record ${id}:`, error);
      throw error;
    }
  }

  // Submit peer review
  static async submitPeerReview(
    id: string,
    reviewData: { reviewer: string; comments: string; approval: string },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/peer-review`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting peer review for record ${id}:`, error);
      throw error;
    }
  }

  // Submit authorization check
  static async submitAuthorizationCheck(
    id: string,
    checkData: { discrepancies: string; resolutionRequired: boolean },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/check-authorization`,
        checkData,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error submitting authorization check for record ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Resolve discrepancy
  static async resolveDiscrepancy(id: string): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/resolve-discrepancy`,
        {},
      );
      return response.data;
    } catch (error) {
      console.error(`Error resolving discrepancy for record ${id}:`, error);
      throw error;
    }
  }

  // Enhanced Medical Record Review
  static async enhancedMedicalRecordReview(
    id: string,
    reviewData: { reviewer: string; findings: string; recommendations: string },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/medical-record-review`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error submitting medical record review for record ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Code Assignment Verification
  static async verifyCodeAssignment(
    id: string,
    verificationData: { verifier: string; comments: string; status: string },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${id}/verify-codes`,
        verificationData,
      );
      return response.data;
    } catch (error) {
      console.error(`Error verifying code assignment for record ${id}:`, error);
      throw error;
    }
  }

  // Gap Analysis
  static async performGapAnalysis(patientId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/gap-analysis/${patientId}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error performing gap analysis for patient ${patientId}:`,
        error,
      );
      throw error;
    }
  }

  // Get coding performance metrics
  static async getCodingMetrics(patientId?: string): Promise<any> {
    try {
      const url = patientId
        ? `${this.baseUrl}/metrics/${patientId}`
        : `${this.baseUrl}/metrics`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching coding metrics:", error);
      throw error;
    }
  }

  // Update coding performance score
  static async updateCodingScore(
    id: string,
    scoreData: { accuracy_score: number; completion_time: number },
  ): Promise<ICDCPTCodingRecord> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/${id}/score`,
        scoreData,
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating coding score for record ${id}:`, error);
      throw error;
    }
  }
}
