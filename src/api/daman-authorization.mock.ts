import { ObjectId } from "./browser-mongodb";

// Define interfaces for Daman authorization
export interface DamanAuthorization {
  _id?: string | ObjectId;
  referenceNumber: string;
  patientDetails: {
    name: string;
    emiratesId: string;
    dob: string;
    gender: string;
    insuranceDetails: {
      policyNumber: string;
      insuranceProvider: string;
      validFrom: string;
      validTo: string;
    };
  };
  requestedServices: Array<{
    serviceCode: string;
    serviceDescription: string;
    quantity: number;
    frequency: string;
    duration: number;
  }>;
  requestedDuration: number;
  documents: Array<{
    documentType: string;
    fileName: string;
    uploadDate: string;
    status: string;
    validationMessage?: string;
  }>;
  documents_complete: boolean;
  documents_completion_date?: string;
  submission_date: string;
  authorization_status: string;
  status_notes?: string;
  status_history: Array<{
    status: string;
    timestamp: string;
    comments?: string;
  }>;
  qa_review_assigned_to?: string;
  qa_review_date?: string;
  qa_review_started: boolean;
  qa_review_completed: boolean;
  pm_review_completed: boolean;
  ready_for_submission: boolean;
  insurance_response_received: boolean;
  processing_stage: string;
  estimated_completion_date: string;
  review_timeline: Array<{
    timestamp: string;
    action: string;
    comment: string;
  }>;
  required_additional_documents?: string[];
  approval_code?: string;
  approval_date?: string;
  approval_effective_date?: string;
  approval_expiration_date?: string;
  rejection_code?: string;
  rejection_date?: string;
  rejection_reasons?: string[];
  alternative_recommendations?: string[];
  created_at: string;
  updated_at: string;
}

// Mock data for Daman authorizations
const mockAuthorizations: DamanAuthorization[] = [
  {
    _id: "1",
    referenceNumber: "DAMAN-PA-2023-12345",
    patientDetails: {
      name: "Ahmed Al Mansoori",
      emiratesId: "784-1985-1234567-8",
      dob: "1985-06-15",
      gender: "Male",
      insuranceDetails: {
        policyNumber: "THQ-12345678",
        insuranceProvider: "Daman - Thiqa",
        validFrom: "2023-01-01",
        validTo: "2023-12-31",
      },
    },
    requestedServices: [
      {
        serviceCode: "97110",
        serviceDescription: "Therapeutic Exercises",
        quantity: 12,
        frequency: "3 times per week",
        duration: 4,
      },
      {
        serviceCode: "97112",
        serviceDescription: "Neuromuscular Re-education",
        quantity: 8,
        frequency: "2 times per week",
        duration: 4,
      },
    ],
    requestedDuration: 30,
    documents: [
      {
        documentType: "Medical Report",
        fileName: "medical_report.pdf",
        uploadDate: "2023-10-01T10:30:00Z",
        status: "Valid",
      },
      {
        documentType: "Emirates ID",
        fileName: "emirates_id.pdf",
        uploadDate: "2023-10-01T10:32:00Z",
        status: "Valid",
      },
      {
        documentType: "Insurance Card",
        fileName: "insurance_card.pdf",
        uploadDate: "2023-10-01T10:35:00Z",
        status: "Valid",
      },
    ],
    documents_complete: false,
    submission_date: "2023-10-02T09:15:00Z",
    authorization_status: "In Review",
    status_notes: "Pending additional clinical documentation",
    status_history: [
      {
        status: "Submitted",
        timestamp: "2023-10-02T09:15:00Z",
      },
      {
        status: "In Review",
        timestamp: "2023-10-03T14:20:00Z",
        comments: "Initial review completed, pending additional documentation",
      },
    ],
    qa_review_assigned_to: "Dr. Fatima Al Zaabi",
    qa_review_date: "2023-10-03T14:20:00Z",
    qa_review_started: true,
    qa_review_completed: false,
    pm_review_completed: false,
    ready_for_submission: true,
    insurance_response_received: false,
    processing_stage: "Clinical Review",
    estimated_completion_date: "2023-10-09T00:00:00Z",
    review_timeline: [
      {
        timestamp: "2023-10-02T09:15:00Z",
        action: "Submission Received",
        comment: "Authorization request received and queued for review",
      },
      {
        timestamp: "2023-10-03T14:20:00Z",
        action: "Initial Review",
        comment: "Initial review completed, assigned to clinical reviewer",
      },
    ],
    required_additional_documents: [
      "Recent Diagnostic Reports",
      "Detailed Treatment Plan",
    ],
    created_at: "2023-10-02T09:15:00Z",
    updated_at: "2023-10-03T14:20:00Z",
  },
  {
    _id: "2",
    referenceNumber: "DAMAN-PA-2023-67890",
    patientDetails: {
      name: "Fatima Al Hashemi",
      emiratesId: "784-1990-7654321-0",
      dob: "1990-03-22",
      gender: "Female",
      insuranceDetails: {
        policyNumber: "ENH-87654321",
        insuranceProvider: "Daman - Enhanced",
        validFrom: "2023-01-01",
        validTo: "2023-12-31",
      },
    },
    requestedServices: [
      {
        serviceCode: "99347",
        serviceDescription: "Home Visit",
        quantity: 30,
        frequency: "Daily",
        duration: 30,
      },
    ],
    requestedDuration: 30,
    documents: [
      {
        documentType: "Medical Report",
        fileName: "medical_report.pdf",
        uploadDate: "2023-09-15T11:20:00Z",
        status: "Valid",
      },
      {
        documentType: "Emirates ID",
        fileName: "emirates_id.pdf",
        uploadDate: "2023-09-15T11:22:00Z",
        status: "Valid",
      },
      {
        documentType: "Insurance Card",
        fileName: "insurance_card.pdf",
        uploadDate: "2023-09-15T11:25:00Z",
        status: "Valid",
      },
      {
        documentType: "Physician Order",
        fileName: "physician_order.pdf",
        uploadDate: "2023-09-15T11:28:00Z",
        status: "Valid",
      },
      {
        documentType: "Care Plan",
        fileName: "care_plan.pdf",
        uploadDate: "2023-09-15T11:30:00Z",
        status: "Valid",
      },
    ],
    documents_complete: true,
    documents_completion_date: "2023-09-15T11:30:00Z",
    submission_date: "2023-09-16T10:00:00Z",
    authorization_status: "Approved",
    status_notes: "All services approved as requested",
    status_history: [
      {
        status: "Submitted",
        timestamp: "2023-09-16T10:00:00Z",
      },
      {
        status: "In Review",
        timestamp: "2023-09-17T09:30:00Z",
        comments: "Under clinical review",
      },
      {
        status: "Approved",
        timestamp: "2023-09-20T14:15:00Z",
        comments: "All services approved as requested",
      },
    ],
    qa_review_assigned_to: "Dr. Mohammed Al Zaabi",
    qa_review_date: "2023-09-17T09:30:00Z",
    qa_review_started: true,
    qa_review_completed: true,
    pm_review_completed: true,
    ready_for_submission: true,
    insurance_response_received: true,
    processing_stage: "Completed",
    estimated_completion_date: "2023-09-23T00:00:00Z",
    review_timeline: [
      {
        timestamp: "2023-09-16T10:00:00Z",
        action: "Submission Received",
        comment: "Authorization request received and queued for review",
      },
      {
        timestamp: "2023-09-17T09:30:00Z",
        action: "Clinical Review",
        comment: "Clinical review in progress",
      },
      {
        timestamp: "2023-09-19T11:45:00Z",
        action: "Clinical Review Completed",
        comment: "Clinical review completed, recommended for approval",
      },
      {
        timestamp: "2023-09-20T14:15:00Z",
        action: "Approval Received",
        comment: "Approval received from Daman",
      },
    ],
    approval_code: "AUTH-DAMAN-123456",
    approval_date: "2023-09-20T14:15:00Z",
    approval_effective_date: "2023-09-22T00:00:00Z",
    approval_expiration_date: "2023-10-22T00:00:00Z",
    created_at: "2023-09-16T10:00:00Z",
    updated_at: "2023-09-20T14:15:00Z",
  },
  {
    _id: "3",
    referenceNumber: "DAMAN-PA-2023-24680",
    patientDetails: {
      name: "Khalid Al Mazrouei",
      emiratesId: "784-1975-9876543-2",
      dob: "1975-11-08",
      gender: "Male",
      insuranceDetails: {
        policyNumber: "THQ-87654321",
        insuranceProvider: "Daman - Thiqa",
        validFrom: "2023-01-01",
        validTo: "2023-12-31",
      },
    },
    requestedServices: [
      {
        serviceCode: "97116",
        serviceDescription: "Gait Training",
        quantity: 12,
        frequency: "3 times per week",
        duration: 4,
      },
    ],
    requestedDuration: 30,
    documents: [
      {
        documentType: "Medical Report",
        fileName: "medical_report.pdf",
        uploadDate: "2023-09-28T13:10:00Z",
        status: "Valid",
      },
      {
        documentType: "Emirates ID",
        fileName: "emirates_id.pdf",
        uploadDate: "2023-09-28T13:12:00Z",
        status: "Invalid",
        validationMessage: "Document expired",
      },
    ],
    documents_complete: false,
    submission_date: "2023-09-29T09:45:00Z",
    authorization_status: "Additional Info Required",
    status_notes: "Updated Emirates ID required",
    status_history: [
      {
        status: "Submitted",
        timestamp: "2023-09-29T09:45:00Z",
      },
      {
        status: "In Review",
        timestamp: "2023-09-30T10:30:00Z",
        comments: "Initial document review",
      },
      {
        status: "Additional Info Required",
        timestamp: "2023-10-01T11:20:00Z",
        comments: "Updated Emirates ID required",
      },
    ],
    qa_review_assigned_to: "Dr. Aisha Al Dhaheri",
    qa_review_date: "2023-09-30T10:30:00Z",
    qa_review_started: true,
    qa_review_completed: false,
    pm_review_completed: false,
    ready_for_submission: false,
    insurance_response_received: false,
    processing_stage: "Document Validation",
    estimated_completion_date: "2023-10-08T00:00:00Z",
    review_timeline: [
      {
        timestamp: "2023-09-29T09:45:00Z",
        action: "Submission Received",
        comment: "Authorization request received and queued for review",
      },
      {
        timestamp: "2023-09-30T10:30:00Z",
        action: "Document Review",
        comment: "Document review in progress",
      },
      {
        timestamp: "2023-10-01T11:20:00Z",
        action: "Additional Information Requested",
        comment: "Updated Emirates ID required",
      },
    ],
    required_additional_documents: ["Updated Emirates ID"],
    created_at: "2023-09-29T09:45:00Z",
    updated_at: "2023-10-01T11:20:00Z",
  },
];

// Mock implementation of the Daman Authorization API
export const mockDamanAuthorizationAPI = {
  getAllAuthorizations: async () => Promise.resolve(mockAuthorizations),

  getAuthorizationById: async (id: string) => {
    const authorization = mockAuthorizations.find((auth) => auth._id === id);
    if (!authorization)
      throw new Error(`Authorization with ID ${id} not found`);
    return Promise.resolve(authorization);
  },

  getAuthorizationByReferenceNumber: async (referenceNumber: string) => {
    const authorization = mockAuthorizations.find(
      (auth) => auth.referenceNumber === referenceNumber,
    );
    if (!authorization)
      throw new Error(
        `Authorization with reference number ${referenceNumber} not found`,
      );
    return Promise.resolve(authorization);
  },

  createAuthorization: async (authData: Partial<DamanAuthorization>) => {
    const referenceNumber = `DAMAN-PA-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 100000,
    )
      .toString()
      .padStart(5, "0")}`;

    const newAuthorization: DamanAuthorization = {
      _id: `${Date.now()}`,
      referenceNumber,
      patientDetails: authData.patientDetails || {
        name: "",
        emiratesId: "",
        dob: "",
        gender: "",
        insuranceDetails: {
          policyNumber: "",
          insuranceProvider: "",
          validFrom: "",
          validTo: "",
        },
      },
      requestedServices: authData.requestedServices || [],
      requestedDuration: authData.requestedDuration || 30,
      documents: authData.documents || [],
      documents_complete: authData.documents_complete || false,
      submission_date: new Date().toISOString(),
      authorization_status: "Pending",
      status_history: [
        {
          status: "Submitted",
          timestamp: new Date().toISOString(),
        },
      ],
      qa_review_started: false,
      qa_review_completed: false,
      pm_review_completed: false,
      ready_for_submission: authData.documents_complete || false,
      insurance_response_received: false,
      processing_stage: "Initial Review",
      estimated_completion_date: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      review_timeline: [
        {
          timestamp: new Date().toISOString(),
          action: "Submission Received",
          comment: "Authorization request received and queued for review",
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockAuthorizations.push(newAuthorization);
    return Promise.resolve(newAuthorization);
  },

  updateAuthorization: async (
    id: string,
    authData: Partial<DamanAuthorization>,
  ) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);

    const updatedAuthorization = {
      ...mockAuthorizations[index],
      ...authData,
      updated_at: new Date().toISOString(),
    };
    mockAuthorizations[index] = updatedAuthorization;
    return Promise.resolve(updatedAuthorization);
  },

  deleteAuthorization: async (id: string) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);
    mockAuthorizations.splice(index, 1);
    return Promise.resolve();
  },

  uploadDocuments: async (
    id: string,
    documents: Array<{
      documentType: string;
      fileName: string;
      status: string;
    }>,
  ) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);

    const uploadedDocuments = documents.map((doc) => ({
      ...doc,
      uploadDate: new Date().toISOString(),
    }));

    const updatedAuthorization = {
      ...mockAuthorizations[index],
      documents: [...mockAuthorizations[index].documents, ...uploadedDocuments],
      updated_at: new Date().toISOString(),
    };

    // Check if all required documents are now uploaded
    const requiredDocumentTypes = [
      "Medical Report",
      "Emirates ID",
      "Insurance Card",
      "Physician Order",
      "Care Plan",
    ];

    const uploadedDocumentTypes = updatedAuthorization.documents.map(
      (doc) => doc.documentType,
    );
    const allRequiredDocumentsUploaded = requiredDocumentTypes.every((type) =>
      uploadedDocumentTypes.includes(type),
    );

    if (allRequiredDocumentsUploaded) {
      updatedAuthorization.documents_complete = true;
      updatedAuthorization.documents_completion_date = new Date().toISOString();
      updatedAuthorization.ready_for_submission = true;

      updatedAuthorization.review_timeline.push({
        timestamp: new Date().toISOString(),
        action: "Documents Completed",
        comment: "All required documents uploaded and validated",
      });
    }

    mockAuthorizations[index] = updatedAuthorization;
    return Promise.resolve(updatedAuthorization);
  },

  validateDocument: async (
    id: string,
    documentIndex: number,
    validationResult: {
      status: string;
      validationMessage?: string;
    },
  ) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);

    if (documentIndex >= mockAuthorizations[index].documents.length) {
      throw new Error(`Document index ${documentIndex} out of bounds`);
    }

    const updatedAuthorization = {
      ...mockAuthorizations[index],
      updated_at: new Date().toISOString(),
    };

    updatedAuthorization.documents[documentIndex] = {
      ...updatedAuthorization.documents[documentIndex],
      status: validationResult.status,
      validationMessage: validationResult.validationMessage,
    };

    // Check if any documents are invalid
    const hasInvalidDocuments = updatedAuthorization.documents.some(
      (doc) => doc.status === "Invalid",
    );
    if (hasInvalidDocuments) {
      updatedAuthorization.documents_complete = false;
      updatedAuthorization.ready_for_submission = false;

      if (
        updatedAuthorization.authorization_status !== "Additional Info Required"
      ) {
        updatedAuthorization.authorization_status = "Additional Info Required";
        updatedAuthorization.status_history.push({
          status: "Additional Info Required",
          timestamp: new Date().toISOString(),
          comments: "One or more documents require correction",
        });

        updatedAuthorization.review_timeline.push({
          timestamp: new Date().toISOString(),
          action: "Document Validation Failed",
          comment: "One or more documents require correction",
        });
      }
    }

    mockAuthorizations[index] = updatedAuthorization;
    return Promise.resolve(updatedAuthorization);
  },

  startQAReview: async (id: string, reviewerName: string) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);

    const updatedAuthorization = {
      ...mockAuthorizations[index],
      qa_review_started: true,
      qa_review_assigned_to: reviewerName,
      qa_review_date: new Date().toISOString(),
      processing_stage: "Clinical Review",
      authorization_status: "In Review",
      updated_at: new Date().toISOString(),
    };

    updatedAuthorization.status_history.push({
      status: "In Review",
      timestamp: new Date().toISOString(),
      comments: `QA review started by ${reviewerName}`,
    });

    updatedAuthorization.review_timeline.push({
      timestamp: new Date().toISOString(),
      action: "QA Review Started",
      comment: `QA review assigned to ${reviewerName}`,
    });

    mockAuthorizations[index] = updatedAuthorization;
    return Promise.resolve(updatedAuthorization);
  },

  completeQAReview: async (
    id: string,
    reviewData: {
      status: string;
      notes: string;
      additionalDocumentsRequired?: string[];
    },
  ) => {
    const index = mockAuthorizations.findIndex((auth) => auth._id === id);
    if (index === -1) throw new Error(`Authorization with ID ${id} not found`);

    const updatedAuthorization = {
      ...mockAuthorizations[index],
      qa_review_completed: true,
      authorization_status: reviewData.status,
      status_notes: reviewData.notes,
      updated_at: new Date().toISOString(),
    };

    if (
      reviewData.additionalDocumentsRequired &&
      reviewData.additionalDocumentsRequired.length > 0
    ) {
      updatedAuthorization.required_additional_documents =
        reviewData.additionalDocumentsRequired;
      updatedAuthorization.authorization_status = "Additional Info Required";
    }

    updatedAuthorization.status_history.push({
      status: updatedAuthorization.authorization_status,
      timestamp: new Date().toISOString(),
      comments: reviewData.notes,
    });

    updatedAuthorization.review_timeline.push({
      timestamp: new Date().toISOString(),
      action: "QA Review Completed",
      comment: `QA review completed with status: ${updatedAuthorization.authorization_status}`,
    });

    if (updatedAuthorization.authorization_status === "Approved") {
      updatedAuthorization.approval_code = `AUTH-DAMAN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      updatedAuthorization.approval_date = new Date().toISOString();
      updatedAuthorization.approval_effective_date = new Date().toISOString();

      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + updatedAuthorization.requestedDuration,
      );
      updatedAuthorization.approval_expiration_date =
        expirationDate.toISOString();

      updatedAuthorization.processing_stage = "Completed";
      updatedAuthorization.insurance_response_received = true;
    } else if (updatedAuthorization.authorization_status === "Denied") {
      updatedAuthorization.rejection_code = `REJ-DAMAN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      updatedAuthorization.rejection_date = new Date().toISOString();
      updatedAuthorization.processing_stage = "Completed";
      updatedAuthorization.insurance_response_received = true;
    }

    mockAuthorizations[index] = updatedAuthorization;
    return Promise.resolve(updatedAuthorization);
  },

  registerWebhook: async (webhookData: {
    url: string;
    events: string[];
    secret: string;
  }) => {
    return Promise.resolve({
      webhookId: `webhook-${Date.now()}`,
      url: webhookData.url,
      events: webhookData.events,
      created: new Date().toISOString(),
    });
  },

  // New methods for enhanced functionality
  getRequiredDocumentsList: async () => {
    return Promise.resolve([
      {
        id: 1,
        name: "Medical Report",
        required: true,
        description: "Detailed medical report from the referring physician",
      },
      {
        id: 2,
        name: "Emirates ID",
        required: true,
        description: "Valid Emirates ID of the patient",
      },
      {
        id: 3,
        name: "Insurance Card",
        required: true,
        description: "Valid insurance card showing coverage details",
      },
      {
        id: 4,
        name: "Physician Order",
        required: true,
        description: "Detailed order from the physician specifying services",
      },
      {
        id: 5,
        name: "Care Plan",
        required: true,
        description: "Comprehensive care plan for the requested services",
      },
      {
        id: 6,
        name: "Previous Medical Records",
        required: false,
        description: "Relevant previous medical records if applicable",
      },
      {
        id: 7,
        name: "Diagnostic Reports",
        required: false,
        description: "Recent diagnostic reports supporting the request",
      },
      {
        id: 8,
        name: "Medication List",
        required: false,
        description: "Current medication list of the patient",
      },
      {
        id: 9,
        name: "Functional Assessment",
        required: false,
        description: "Recent functional assessment results",
      },
      {
        id: 10,
        name: "Hospital Discharge Summary",
        required: false,
        description: "If request follows a hospital stay",
      },
      {
        id: 11,
        name: "Specialist Consultation Notes",
        required: false,
        description: "Notes from relevant specialist consultations",
      },
      {
        id: 12,
        name: "Previous Authorization Documents",
        required: false,
        description: "If this is a renewal request",
      },
      {
        id: 13,
        name: "Progress Notes",
        required: false,
        description: "Recent progress notes if continuing care",
      },
      {
        id: 14,
        name: "Equipment Prescription",
        required: false,
        description: "For DME requests",
      },
      {
        id: 15,
        name: "Home Assessment",
        required: false,
        description: "For home care services",
      },
      {
        id: 16,
        name: "Wound Assessment",
        required: false,
        description: "For wound care services",
      },
      {
        id: 17,
        name: "Therapy Evaluation",
        required: false,
        description: "For therapy services",
      },
      {
        id: 18,
        name: "Nursing Assessment",
        required: false,
        description: "For nursing services",
      },
      {
        id: 19,
        name: "Nutritional Assessment",
        required: false,
        description: "For nutritional services",
      },
      {
        id: 20,
        name: "Pain Assessment",
        required: false,
        description: "For pain management services",
      },
      {
        id: 21,
        name: "Respiratory Assessment",
        required: false,
        description: "For respiratory services",
      },
      {
        id: 22,
        name: "Social Worker Assessment",
        required: false,
        description: "For social services",
      },
      {
        id: 23,
        name: "Psychological Assessment",
        required: false,
        description: "For psychological services",
      },
    ]);
  },

  getDocumentValidationCriteria: async () => {
    return Promise.resolve({
      "Medical Report": [
        "Must be dated within the last 30 days",
        "Must be signed by a licensed physician",
        "Must include diagnosis with ICD-10 codes",
        "Must include clinical justification for requested services",
        "Must specify frequency and duration of services",
      ],
      "Emirates ID": [
        "Must be valid (not expired)",
        "Must be clearly legible",
        "Must match patient information in the system",
      ],
      "Insurance Card": [
        "Must be valid for the service period",
        "Must clearly show coverage details",
        "Must match patient information in the system",
      ],
      "Physician Order": [
        "Must be dated within the last 30 days",
        "Must be signed by a licensed physician",
        "Must specify services ordered with CPT codes",
        "Must specify frequency and duration",
      ],
      "Care Plan": [
        "Must be comprehensive and individualized",
        "Must include measurable goals",
        "Must include interventions aligned with ordered services",
        "Must include expected outcomes",
      ],
    });
  },

  getSubmissionStatistics: async () => {
    return Promise.resolve({
      totalSubmissions: mockAuthorizations.length,
      approvalRate:
        (mockAuthorizations.filter((a) => a.authorization_status === "Approved")
          .length /
          mockAuthorizations.length) *
        100,
      averageProcessingTime: 5.2, // days
      commonRejectionReasons: [
        "Insufficient clinical justification",
        "Service can be provided in outpatient setting",
        "Documentation incomplete or inconsistent",
        "Requested duration exceeds guidelines",
      ],
      documentComplianceRate: 78.5, // percentage
      submissionsByStatus: {
        Pending: mockAuthorizations.filter(
          (a) => a.authorization_status === "Pending",
        ).length,
        InReview: mockAuthorizations.filter(
          (a) => a.authorization_status === "In Review",
        ).length,
        AdditionalInfoRequired: mockAuthorizations.filter(
          (a) => a.authorization_status === "Additional Info Required",
        ).length,
        Approved: mockAuthorizations.filter(
          (a) => a.authorization_status === "Approved",
        ).length,
        Denied: mockAuthorizations.filter(
          (a) => a.authorization_status === "Denied",
        ).length,
      },
    });
  },

  subscribeToNotifications: async (subscriptionData: {
    userId: string;
    channels: string[];
    notificationMethods: string[];
  }) => {
    return Promise.resolve({
      subscriptionId: `sub-${Date.now()}`,
      userId: subscriptionData.userId,
      channels: subscriptionData.channels,
      notificationMethods: subscriptionData.notificationMethods,
      created: new Date().toISOString(),
      active: true,
    });
  },
};
