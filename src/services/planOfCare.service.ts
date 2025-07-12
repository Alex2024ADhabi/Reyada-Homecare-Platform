// Plan of Care Service for managing plan of care data
import { offlineService } from "./offline.service";

export interface PlanOfCareData {
  id?: string;
  patientId: string;

  // Plan Identification
  planType: "Initial" | "Revised" | "Updated";
  planVersion: number;
  effectiveDate?: string;
  reviewDate?: string;
  expirationDate?: string;

  // Development Process
  developmentInitiatedDate: string;
  developmentInitiatedBy: string;

  // Multi-Disciplinary Input
  nursingInputCompleted: boolean;
  nursingInputDate?: string;
  nursingInputBy?: string;

  ptInputRequired: boolean;
  ptInputCompleted: boolean;
  ptInputDate?: string;
  ptInputBy?: string;

  otInputRequired: boolean;
  otInputCompleted: boolean;
  otInputDate?: string;
  otInputBy?: string;

  stInputRequired: boolean;
  stInputCompleted: boolean;
  stInputDate?: string;
  stInputBy?: string;

  rtInputRequired: boolean;
  rtInputCompleted: boolean;
  rtInputDate?: string;
  rtInputBy?: string;

  socialWorkInputRequired: boolean;
  socialWorkInputCompleted: boolean;
  socialWorkInputDate?: string;
  socialWorkInputBy?: string;

  // Physician Review Process
  submittedForPhysicianReview: boolean;
  submissionDate?: string;
  physicianReviewer?: string;
  physicianReviewCompleted: boolean;
  physicianReviewDate?: string;
  physicianApprovalStatus?: "Approved" | "Modifications Required" | "Rejected";
  physicianComments?: string;

  // Medical Orders
  prescriptionOrdersCompleted: boolean;
  treatmentOrdersCompleted: boolean;
  diagnosticOrdersCompleted: boolean;

  // Family Education and Consent
  familyEducationScheduled: boolean;
  familyEducationDate?: string;
  familyEducationCompleted: boolean;
  familyEducationBy?: string;
  familyConsentObtained: boolean;
  familyConsentDate?: string;
  familyQuestionsAddressed: boolean;

  // Staff Communication
  staffCommunicationCompleted: boolean;
  staffTrainingRequired: boolean;
  staffTrainingCompleted: boolean;
  communicationProtocolsEstablished: boolean;

  // Implementation
  implementationStarted: boolean;
  implementationStartDate?: string;
  monitoringProtocolsActive: boolean;

  // Goals and Outcomes
  shortTermGoals?: string;
  longTermGoals?: string;
  measurableOutcomes?: string;
  goalTargetDates?: string;

  // Resource Requirements
  equipmentRequirements?: string;
  supplyRequirements?: string;
  staffingRequirements?: string;
  familyCaregiverRequirements?: string;

  // Quality and Safety
  safetyConsiderations?: string;
  riskMitigationStrategies?: string;
  qualityIndicators?: string;

  // Plan Status
  planStatus:
    | "Developing"
    | "Under Review"
    | "Approved"
    | "Active"
    | "Revised"
    | "Discontinued";
  statusNotes?: string;

  createdAt?: string;
  updatedAt?: string;
}

class PlanOfCareService {
  private apiUrl = "/api/plans-of-care";
  private isOnline = navigator.onLine;

  constructor() {
    // Set up online/offline event listeners
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncOfflinePlans();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  // Create a new plan of care
  async createPlanOfCare(
    planData: Omit<PlanOfCareData, "id">,
  ): Promise<PlanOfCareData> {
    try {
      if (this.isOnline) {
        // Online mode - send to API
        // In a real implementation, this would make an API call
        // For now, we'll simulate a successful API response
        const response = {
          ...planData,
          id: `POC${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return response;
      } else {
        // Offline mode - save locally
        const offlinePlanData = {
          ...planData,
          patientId: planData.patientId,
          planType: planData.planType,
          planStatus: planData.planStatus,
          status: "completed" as const,
        };

        const id = await offlineService.savePlanOfCare(offlinePlanData);

        return {
          ...planData,
          id: `offline_${id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("Failed to create plan of care:", error);
      throw new Error("Failed to create plan of care");
    }
  }

  // Get a plan of care by ID
  async getPlanOfCare(id: string): Promise<PlanOfCareData | null> {
    try {
      if (this.isOnline) {
        // Online mode - fetch from API
        // In a real implementation, this would make an API call
        // For now, we'll return a mock plan
        return this.getMockPlan(id);
      } else {
        // Offline mode - get from local storage
        // This is a simplified implementation
        // In a real app, you'd need to handle the offline ID format
        return null;
      }
    } catch (error) {
      console.error(`Failed to get plan of care with ID ${id}:`, error);
      return null;
    }
  }

  // Get all plans of care for a patient
  async getPatientPlansOfCare(patientId: string): Promise<PlanOfCareData[]> {
    try {
      if (this.isOnline) {
        // Online mode - fetch from API
        // In a real implementation, this would make an API call
        // For now, we'll return mock plans
        return this.getMockPatientPlans(patientId);
      } else {
        // Offline mode - get from local storage
        const offlinePlans =
          await offlineService.getPatientPlansOfCare(patientId);

        // Convert offline plans to PlanOfCareData format
        return offlinePlans.map((plan) => ({
          id: `offline_${plan.id}`,
          patientId: plan.patientId,
          planType: plan.planType as "Initial" | "Revised" | "Updated",
          planVersion: plan.planVersion,
          effectiveDate: plan.effectiveDate,
          reviewDate: plan.reviewDate,
          expirationDate: plan.expirationDate,
          developmentInitiatedDate: plan.developmentInitiatedDate,
          developmentInitiatedBy: plan.developmentInitiatedBy,
          nursingInputCompleted: plan.nursingInputCompleted,
          ptInputRequired: plan.ptInputRequired,
          ptInputCompleted: plan.ptInputCompleted,
          otInputRequired: plan.otInputRequired,
          otInputCompleted: plan.otInputCompleted,
          stInputRequired: plan.stInputRequired,
          stInputCompleted: plan.stInputCompleted,
          rtInputRequired: plan.rtInputRequired,
          rtInputCompleted: plan.rtInputCompleted,
          socialWorkInputRequired: plan.socialWorkInputRequired,
          socialWorkInputCompleted: plan.socialWorkInputCompleted,
          submittedForPhysicianReview: plan.submittedForPhysicianReview,
          physicianReviewCompleted: plan.physicianReviewCompleted,
          prescriptionOrdersCompleted: plan.prescriptionOrdersCompleted,
          treatmentOrdersCompleted: plan.treatmentOrdersCompleted,
          diagnosticOrdersCompleted: plan.diagnosticOrdersCompleted,
          familyEducationScheduled: plan.familyEducationScheduled,
          familyEducationCompleted: plan.familyEducationCompleted,
          familyConsentObtained: plan.familyConsentObtained,
          familyQuestionsAddressed: plan.familyQuestionsAddressed,
          staffCommunicationCompleted: plan.staffCommunicationCompleted,
          staffTrainingRequired: plan.staffTrainingRequired,
          staffTrainingCompleted: plan.staffTrainingCompleted,
          communicationProtocolsEstablished:
            plan.communicationProtocolsEstablished,
          implementationStarted: plan.implementationStarted,
          monitoringProtocolsActive: plan.monitoringProtocolsActive,
          planStatus: plan.planStatus as
            | "Developing"
            | "Under Review"
            | "Approved"
            | "Active"
            | "Revised"
            | "Discontinued",
          createdAt: plan.lastModified,
          updatedAt: plan.lastModified,
        }));
      }
    } catch (error) {
      console.error(
        `Failed to get plans of care for patient ${patientId}:`,
        error,
      );
      return [];
    }
  }

  // Update a plan of care
  async updatePlanOfCare(
    id: string,
    planData: Partial<PlanOfCareData>,
  ): Promise<PlanOfCareData | null> {
    try {
      if (this.isOnline) {
        // Online mode - send to API
        // In a real implementation, this would make an API call
        // For now, we'll simulate a successful API response
        const existingPlan = await this.getPlanOfCare(id);
        if (!existingPlan) return null;

        const updatedPlan = {
          ...existingPlan,
          ...planData,
          updatedAt: new Date().toISOString(),
        };

        return updatedPlan;
      } else {
        // Offline mode - update locally
        // Check if this is an offline ID
        if (id.startsWith("offline_")) {
          const offlineId = parseInt(id.replace("offline_", ""));

          await offlineService.updatePlanOfCare(offlineId, {
            ...planData,
            lastModified: new Date().toISOString(),
          });

          // Return the updated plan (would need to fetch it again in a real implementation)
          return {
            ...planData,
            id,
            updatedAt: new Date().toISOString(),
          } as PlanOfCareData;
        }

        // If it's not an offline ID, we can't update it while offline
        return null;
      }
    } catch (error) {
      console.error(`Failed to update plan of care with ID ${id}:`, error);
      return null;
    }
  }

  // Update plan status
  async updatePlanStatus(
    id: string,
    status: PlanOfCareData["planStatus"],
    notes?: string,
  ): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      planStatus: status,
      statusNotes: notes,
    });
  }

  // Mark nursing input as completed
  async markNursingInputCompleted(
    id: string,
    completedBy: string,
  ): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      nursingInputCompleted: true,
      nursingInputBy: completedBy,
      nursingInputDate: new Date().toISOString(),
    });
  }

  // Mark physician review as completed
  async markPhysicianReviewCompleted(
    id: string,
    physicianId: string,
    approvalStatus: PlanOfCareData["physicianApprovalStatus"],
    comments?: string,
  ): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      physicianReviewCompleted: true,
      physicianReviewer: physicianId,
      physicianReviewDate: new Date().toISOString(),
      physicianApprovalStatus: approvalStatus,
      physicianComments: comments,
    });
  }

  // Mark family education as completed
  async markFamilyEducationCompleted(
    id: string,
    educatedBy: string,
  ): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      familyEducationCompleted: true,
      familyEducationBy: educatedBy,
      familyEducationDate: new Date().toISOString(),
    });
  }

  // Mark family consent as obtained
  async markFamilyConsentObtained(id: string): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      familyConsentObtained: true,
      familyConsentDate: new Date().toISOString(),
    });
  }

  // Mark implementation as started
  async markImplementationStarted(id: string): Promise<PlanOfCareData | null> {
    return this.updatePlanOfCare(id, {
      implementationStarted: true,
      implementationStartDate: new Date().toISOString(),
    });
  }

  // Sync offline plans when back online
  private async syncOfflinePlans(): Promise<void> {
    try {
      // In a real implementation, this would sync offline plans with the server
      console.log("Syncing offline plans of care...");

      // This is a placeholder for the actual implementation
      // You would get all offline plans, send them to the server,
      // and then mark them as synced
    } catch (error) {
      console.error("Failed to sync offline plans:", error);
    }
  }

  // Helper method to get a mock plan of care
  private getMockPlan(id: string): PlanOfCareData {
    return {
      id,
      patientId: "P12345",
      planType: "Initial",
      planVersion: 1,
      effectiveDate: new Date().toISOString(),
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      developmentInitiatedDate: new Date().toISOString(),
      developmentInitiatedBy: "S002",
      nursingInputCompleted: true,
      nursingInputDate: new Date().toISOString(),
      nursingInputBy: "S002",
      ptInputRequired: true,
      ptInputCompleted: true,
      ptInputDate: new Date().toISOString(),
      ptInputBy: "S003",
      otInputRequired: false,
      otInputCompleted: false,
      stInputRequired: false,
      stInputCompleted: false,
      rtInputRequired: true,
      rtInputCompleted: false,
      socialWorkInputRequired: false,
      socialWorkInputCompleted: false,
      submittedForPhysicianReview: true,
      submissionDate: new Date().toISOString(),
      physicianReviewer: "S001",
      physicianReviewCompleted: true,
      physicianReviewDate: new Date().toISOString(),
      physicianApprovalStatus: "Approved",
      prescriptionOrdersCompleted: true,
      treatmentOrdersCompleted: true,
      diagnosticOrdersCompleted: false,
      familyEducationScheduled: true,
      familyEducationDate: new Date().toISOString(),
      familyEducationCompleted: true,
      familyEducationBy: "S002",
      familyConsentObtained: true,
      familyConsentDate: new Date().toISOString(),
      familyQuestionsAddressed: true,
      staffCommunicationCompleted: true,
      staffTrainingRequired: true,
      staffTrainingCompleted: false,
      communicationProtocolsEstablished: true,
      implementationStarted: false,
      monitoringProtocolsActive: false,
      shortTermGoals: "Improve wound healing within 2 weeks",
      longTermGoals:
        "Complete recovery and return to independent living within 3 months",
      measurableOutcomes: "Wound size reduction by 50% in 2 weeks",
      goalTargetDates: "Short-term: 2 weeks, Long-term: 3 months",
      equipmentRequirements: "Hospital bed, wheelchair, wound care supplies",
      supplyRequirements: "Dressings, antiseptic solutions, gloves",
      staffingRequirements: "Nurse visits 3x weekly, PT 2x weekly",
      familyCaregiverRequirements:
        "Daily dressing changes, mobility assistance",
      safetyConsiderations: "Fall prevention, infection control",
      riskMitigationStrategies: "Bed rails, proper hand hygiene",
      qualityIndicators:
        "Wound healing rate, infection rate, patient satisfaction",
      planStatus: "Active",
      statusNotes: "Plan implemented and progressing well",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Helper method to get mock plans for a patient
  private getMockPatientPlans(patientId: string): PlanOfCareData[] {
    return [
      this.getMockPlan(`POC001_${patientId}`),
      {
        id: `POC002_${patientId}`,
        patientId,
        planType: "Revised",
        planVersion: 2,
        effectiveDate: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        reviewDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expirationDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        developmentInitiatedDate: new Date(
          Date.now() - 65 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        developmentInitiatedBy: "S002",
        nursingInputCompleted: true,
        ptInputRequired: true,
        ptInputCompleted: true,
        otInputRequired: true,
        otInputCompleted: true,
        stInputRequired: false,
        stInputCompleted: false,
        rtInputRequired: false,
        rtInputCompleted: false,
        socialWorkInputRequired: true,
        socialWorkInputCompleted: true,
        submittedForPhysicianReview: true,
        physicianReviewCompleted: true,
        prescriptionOrdersCompleted: true,
        treatmentOrdersCompleted: true,
        diagnosticOrdersCompleted: true,
        familyEducationScheduled: true,
        familyEducationCompleted: true,
        familyConsentObtained: true,
        familyQuestionsAddressed: true,
        staffCommunicationCompleted: true,
        staffTrainingRequired: false,
        staffTrainingCompleted: false,
        communicationProtocolsEstablished: true,
        implementationStarted: true,
        implementationStartDate: new Date(
          Date.now() - 58 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        monitoringProtocolsActive: true,
        planStatus: "Discontinued",
        statusNotes: "Patient condition improved, transitioning to new plan",
        createdAt: new Date(
          Date.now() - 65 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
  }
}

// Create singleton instance
const planOfCareService = new PlanOfCareService();

export default planOfCareService;
