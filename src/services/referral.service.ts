import { ApiService } from "./api.service";
import { SERVICE_ENDPOINTS } from "@/config/api.config";
import { getDb } from "../api/db";
import { ObjectId } from "../api/browser-mongodb";

export interface ReferralData {
  id?: string;
  referralDate: Date | string;
  referralSource: string;
  referralSourceContact: string;
  patientName: string;
  patientContact: string;
  preliminaryNeeds: string;
  insuranceInfo: string;
  geographicLocation: string;
  acknowledgmentStatus: "Pending" | "Acknowledged" | "Processed";
  acknowledgmentDate?: Date | string;
  acknowledgedBy?: string;
  assignedNurseSupervisor?: string;
  assignedChargeNurse?: string;
  assignedCaseCoordinator?: string;
  assessmentScheduledDate?: Date | string;
  initialContactCompleted: boolean;
  documentationPrepared: boolean;
  referralStatus: "New" | "In Progress" | "Accepted" | "Declined";
  statusNotes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class ReferralService {
  // Get all referrals
  static async getAllReferrals(): Promise<ReferralData[]> {
    try {
      // Online mode - use API
      return ApiService.get<ReferralData[]>(`${SERVICE_ENDPOINTS.referrals}`);
    } catch (error) {
      console.error(
        "Error fetching referrals from API, trying offline storage",
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const referrals = await db.collection("referrals").find({}).toArray();
        return referrals.map((ref: any) => ({
          ...ref,
          id: ref._id.toString(),
        }));
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error("Failed to fetch referrals: No connection available");
      }
    }
  }

  // Get referral by ID
  static async getReferralById(id: string): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.get<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}`,
      );
    } catch (error) {
      console.error(
        `Error fetching referral ${id} from API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const referral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        if (!referral) throw new Error("Referral not found");
        return { ...referral, id: referral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to fetch referral ${id}: No connection available`,
        );
      }
    }
  }

  // Create new referral
  static async createReferral(
    referral: Omit<ReferralData, "id">,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.post<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}`,
        referral,
      );
    } catch (error) {
      console.error(
        "Error creating referral via API, trying offline storage",
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const newReferral = {
          ...referral,
          createdAt: new Date(),
          updatedAt: new Date(),
          acknowledgmentStatus: referral.acknowledgmentStatus || "Pending",
          referralStatus: referral.referralStatus || "New",
          initialContactCompleted: referral.initialContactCompleted || false,
          documentationPrepared: referral.documentationPrepared || false,
        };

        const result = await db.collection("referrals").insertOne(newReferral);
        return { ...newReferral, id: result.insertedId.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error("Failed to create referral: No connection available");
      }
    }
  }

  // Update referral
  static async updateReferral(
    id: string,
    referral: Partial<ReferralData>,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.put<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}`,
        referral,
      );
    } catch (error) {
      console.error(
        `Error updating referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates = {
          ...referral,
          updatedAt: new Date(),
        };

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to update referral ${id}: No connection available`,
        );
      }
    }
  }

  // Delete referral
  static async deleteReferral(id: string): Promise<void> {
    try {
      // Online mode - use API
      return ApiService.delete<void>(`${SERVICE_ENDPOINTS.referrals}/${id}`);
    } catch (error) {
      console.error(
        `Error deleting referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const result = await db
          .collection("referrals")
          .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) throw new Error("Referral not found");

        return;
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to delete referral ${id}: No connection available`,
        );
      }
    }
  }

  // Acknowledge referral
  static async acknowledgeReferral(
    id: string,
    acknowledgedBy: string,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.patch<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}/acknowledge`,
        {
          acknowledgedBy,
          acknowledgmentStatus: "Acknowledged",
          acknowledgmentDate: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error(
        `Error acknowledging referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates = {
          acknowledgedBy,
          acknowledgmentStatus: "Acknowledged",
          acknowledgmentDate: new Date(),
          updatedAt: new Date(),
        };

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to acknowledge referral ${id}: No connection available`,
        );
      }
    }
  }

  // Assign staff to referral
  static async assignStaff(
    id: string,
    staffAssignment: {
      nurseSupervisor?: string;
      chargeNurse?: string;
      caseCoordinator?: string;
      assessmentDate?: Date | string;
    },
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.patch<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}/assign`,
        staffAssignment,
      );
    } catch (error) {
      console.error(
        `Error assigning staff to referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates: any = {
          updatedAt: new Date(),
        };

        if (staffAssignment.nurseSupervisor) {
          updates.assignedNurseSupervisor = staffAssignment.nurseSupervisor;
        }

        if (staffAssignment.chargeNurse) {
          updates.assignedChargeNurse = staffAssignment.chargeNurse;
        }

        if (staffAssignment.caseCoordinator) {
          updates.assignedCaseCoordinator = staffAssignment.caseCoordinator;
        }

        if (staffAssignment.assessmentDate) {
          updates.assessmentScheduledDate = staffAssignment.assessmentDate;
        }

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to assign staff to referral ${id}: No connection available`,
        );
      }
    }
  }

  // Update referral status
  static async updateStatus(
    id: string,
    status: "New" | "In Progress" | "Accepted" | "Declined",
    notes?: string,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.patch<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}/status`,
        {
          referralStatus: status,
          statusNotes: notes,
        },
      );
    } catch (error) {
      console.error(
        `Error updating status for referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates: any = {
          referralStatus: status,
          updatedAt: new Date(),
        };

        if (notes) {
          updates.statusNotes = notes;
        }

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to update status for referral ${id}: No connection available`,
        );
      }
    }
  }

  // Mark initial contact as completed
  static async markInitialContact(
    id: string,
    completed: boolean,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.patch<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}/contact`,
        {
          initialContactCompleted: completed,
        },
      );
    } catch (error) {
      console.error(
        `Error marking initial contact for referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates = {
          initialContactCompleted: completed,
          updatedAt: new Date(),
        };

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to mark initial contact for referral ${id}: No connection available`,
        );
      }
    }
  }

  // Mark documentation as prepared
  static async markDocumentationPrepared(
    id: string,
    prepared: boolean,
  ): Promise<ReferralData> {
    try {
      // Online mode - use API
      return ApiService.patch<ReferralData>(
        `${SERVICE_ENDPOINTS.referrals}/${id}/documentation`,
        {
          documentationPrepared: prepared,
        },
      );
    } catch (error) {
      console.error(
        `Error marking documentation for referral ${id} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const updates = {
          documentationPrepared: prepared,
          updatedAt: new Date(),
        };

        const result = await db
          .collection("referrals")
          .updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) throw new Error("Referral not found");

        const updatedReferral = await db
          .collection("referrals")
          .findOne({ _id: new ObjectId(id) });
        return { ...updatedReferral, id: updatedReferral._id.toString() };
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to mark documentation for referral ${id}: No connection available`,
        );
      }
    }
  }

  // Get referrals by status
  static async getReferralsByStatus(status: string): Promise<ReferralData[]> {
    try {
      // Online mode - use API
      return ApiService.get<ReferralData[]>(
        `${SERVICE_ENDPOINTS.referrals}/status/${status}`,
      );
    } catch (error) {
      console.error(
        `Error fetching referrals by status ${status} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const referrals = await db
          .collection("referrals")
          .find({ referralStatus: status })
          .toArray();

        return referrals.map((ref: any) => ({
          ...ref,
          id: ref._id.toString(),
        }));
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to fetch referrals by status ${status}: No connection available`,
        );
      }
    }
  }

  // Get referrals by source
  static async getReferralsBySource(source: string): Promise<ReferralData[]> {
    try {
      // Online mode - use API
      return ApiService.get<ReferralData[]>(
        `${SERVICE_ENDPOINTS.referrals}/source/${source}`,
      );
    } catch (error) {
      console.error(
        `Error fetching referrals by source ${source} via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const referrals = await db
          .collection("referrals")
          .find({ referralSource: source })
          .toArray();

        return referrals.map((ref: any) => ({
          ...ref,
          id: ref._id.toString(),
        }));
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to fetch referrals by source ${source}: No connection available`,
        );
      }
    }
  }

  // Get referrals by date range
  static async getReferralsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ReferralData[]> {
    try {
      // Online mode - use API
      return ApiService.get<ReferralData[]>(
        `${SERVICE_ENDPOINTS.referrals}/date-range`,
        { startDate, endDate },
      );
    } catch (error) {
      console.error(
        `Error fetching referrals by date range via API, trying offline storage`,
        error,
      );
      // Fallback to offline storage
      try {
        const db = getDb();
        const referrals = await db
          .collection("referrals")
          .find({
            referralDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          })
          .toArray();

        return referrals.map((ref: any) => ({
          ...ref,
          id: ref._id.toString(),
        }));
      } catch (offlineError) {
        console.error("Offline storage access failed", offlineError);
        throw new Error(
          `Failed to fetch referrals by date range: No connection available`,
        );
      }
    }
  }
}

export default ReferralService;
