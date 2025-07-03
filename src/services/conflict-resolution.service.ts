/**
 * Enhanced Conflict Resolution Service
 * Handles data conflicts during real-time synchronization with healthcare-specific logic
 */

import { errorHandlerService } from "./error-handler.service";

export interface ConflictData {
  id: string;
  entity: string;
  clientData: any;
  serverData: any;
  clientTimestamp: Date;
  serverTimestamp: Date;
  conflictType: "version" | "timestamp" | "checksum" | "content";
  severity: "low" | "medium" | "high" | "critical";
  metadata: Record<string, any>;
}

export interface ConflictResolution {
  strategy: "client_wins" | "server_wins" | "merge" | "manual" | "ai_resolve";
  resolvedData: any;
  confidence: number;
  reasoning: string;
  requiresReview: boolean;
  metadata: Record<string, any>;
}

export interface ConflictResolver {
  canResolve: (conflict: ConflictData) => boolean;
  resolve: (conflict: ConflictData) => Promise<ConflictResolution>;
  priority: number;
}

class ConflictResolutionService {
  private static instance: ConflictResolutionService;
  private resolvers: Map<string, ConflictResolver[]> = new Map();
  private conflictHistory: ConflictData[] = [];
  private resolutionStats = {
    totalConflicts: 0,
    resolvedConflicts: 0,
    manualReviewRequired: 0,
    averageResolutionTime: 0,
  };

  public static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService();
    }
    return ConflictResolutionService.instance;
  }

  constructor() {
    this.initializeDefaultResolvers();
  }

  /**
   * Initialize default conflict resolvers for healthcare entities
   */
  private initializeDefaultResolvers(): void {
    // Patient data resolver
    this.addResolver("patient", {
      canResolve: (conflict) => conflict.entity === "patient",
      resolve: async (conflict) => this.resolvePatientConflict(conflict),
      priority: 1,
    });

    // Clinical data resolver
    this.addResolver("clinical", {
      canResolve: (conflict) =>
        ["clinical_assessments", "vital_signs", "lab_results"].includes(
          conflict.entity,
        ),
      resolve: async (conflict) => this.resolveClinicalConflict(conflict),
      priority: 1,
    });

    // Medication resolver
    this.addResolver("medications", {
      canResolve: (conflict) => conflict.entity === "medications",
      resolve: async (conflict) => this.resolveMedicationConflict(conflict),
      priority: 1,
    });

    // Administrative data resolver
    this.addResolver("administrative", {
      canResolve: (conflict) =>
        ["appointments", "scheduling", "billing"].includes(conflict.entity),
      resolve: async (conflict) => this.resolveAdministrativeConflict(conflict),
      priority: 2,
    });

    // Generic timestamp resolver (fallback)
    this.addResolver("timestamp", {
      canResolve: () => true,
      resolve: async (conflict) => this.resolveByTimestamp(conflict),
      priority: 10,
    });
  }

  /**
   * Add a custom conflict resolver
   */
  public addResolver(category: string, resolver: ConflictResolver): void {
    if (!this.resolvers.has(category)) {
      this.resolvers.set(category, []);
    }

    const resolvers = this.resolvers.get(category)!;
    resolvers.push(resolver);

    // Sort by priority (lower number = higher priority)
    resolvers.sort((a, b) => a.priority - b.priority);

    console.log(`🔧 Added conflict resolver for category: ${category}`);
  }

  /**
   * Detect and resolve conflicts
   */
  public async resolveConflict(
    conflictData: ConflictData,
  ): Promise<ConflictResolution> {
    const startTime = Date.now();
    this.resolutionStats.totalConflicts++;

    console.log(
      `🔧 Resolving conflict for ${conflictData.entity}:${conflictData.id}`,
    );

    try {
      // Find appropriate resolver
      const resolver = this.findResolver(conflictData);

      if (!resolver) {
        console.warn(
          `⚠️ No resolver found for conflict: ${conflictData.entity}`,
        );
        return this.createManualResolution(
          conflictData,
          "No suitable resolver found",
        );
      }

      // Resolve the conflict
      const resolution = await resolver.resolve(conflictData);

      // Update statistics
      const resolutionTime = Date.now() - startTime;
      this.updateResolutionStats(resolutionTime, resolution.requiresReview);

      // Store in history
      this.conflictHistory.push(conflictData);

      // Limit history size
      if (this.conflictHistory.length > 1000) {
        this.conflictHistory.shift();
      }

      console.log(
        `✅ Conflict resolved: ${resolution.strategy} (confidence: ${resolution.confidence})`,
      );

      return resolution;
    } catch (error) {
      console.error(
        `❌ Error resolving conflict for ${conflictData.id}:`,
        error,
      );
      errorHandlerService.handleError(error, {
        context: "ConflictResolutionService.resolveConflict",
        conflictData,
      });

      return this.createManualResolution(
        conflictData,
        `Resolution error: ${error.message}`,
      );
    }
  }

  /**
   * Find the best resolver for a conflict
   */
  private findResolver(conflict: ConflictData): ConflictResolver | null {
    // Check all resolver categories
    for (const [category, resolvers] of this.resolvers.entries()) {
      for (const resolver of resolvers) {
        if (resolver.canResolve(conflict)) {
          console.log(`🎯 Using ${category} resolver for conflict`);
          return resolver;
        }
      }
    }

    return null;
  }

  /**
   * Resolve patient data conflicts
   */
  private async resolvePatientConflict(
    conflict: ConflictData,
  ): Promise<ConflictResolution> {
    const { clientData, serverData } = conflict;

    // Patient safety takes priority
    const merged = {
      ...serverData,
      ...clientData,

      // Always use most recent vital signs
      vitalSigns: this.getMostRecentData(
        clientData.vitalSigns,
        serverData.vitalSigns,
        "timestamp",
      ),

      // Merge allergies (union of both)
      allergies: this.mergeArrays(
        clientData.allergies || [],
        serverData.allergies || [],
        "allergen",
      ),

      // Use most recent emergency contacts
      emergencyContacts: this.getMostRecentData(
        clientData.emergencyContacts,
        serverData.emergencyContacts,
        "lastUpdated",
      ),

      // Preserve all critical flags
      criticalFlags: [
        ...(clientData.criticalFlags || []),
        ...(serverData.criticalFlags || []),
      ].filter((flag, index, arr) => arr.indexOf(flag) === index),

      // Conflict resolution metadata
      _conflictResolved: true,
      _resolutionTimestamp: new Date(),
      _resolutionStrategy: "patient_safety_merge",
    };

    return {
      strategy: "merge",
      resolvedData: merged,
      confidence: 0.9,
      reasoning:
        "Patient safety-focused merge with preservation of critical data",
      requiresReview: this.hasHighRiskChanges(clientData, serverData),
      metadata: {
        mergedFields: [
          "vitalSigns",
          "allergies",
          "emergencyContacts",
          "criticalFlags",
        ],
        safetyPriority: true,
      },
    };
  }

  /**
   * Resolve clinical data conflicts
   */
  private async resolveClinicalConflict(
    conflict: ConflictData,
  ): Promise<ConflictResolution> {
    const { clientData, serverData, entity } = conflict;

    // Clinical data requires careful handling
    if (this.hasCriticalClinicalConflict(clientData, serverData)) {
      return {
        strategy: "manual",
        resolvedData: serverData, // Keep server data until manual review
        confidence: 0.0,
        reasoning:
          "Critical clinical data conflict requires manual clinician review",
        requiresReview: true,
        metadata: {
          conflictType: "critical_clinical",
          requiresClinicianReview: true,
          clientVersion: clientData,
          serverVersion: serverData,
        },
      };
    }

    // Use timestamp-based resolution for non-critical conflicts
    const clientTime = new Date(
      clientData.timestamp || clientData.createdAt || 0,
    );
    const serverTime = new Date(
      serverData.timestamp || serverData.createdAt || 0,
    );

    const useClient = clientTime > serverTime;

    return {
      strategy: useClient ? "client_wins" : "server_wins",
      resolvedData: useClient ? clientData : serverData,
      confidence: 0.8,
      reasoning: `Most recent clinical data selected based on timestamp (${useClient ? "client" : "server"})`,
      requiresReview: entity === "clinical_assessments", // Always review assessments
      metadata: {
        timestampBased: true,
        clientTimestamp: clientTime,
        serverTimestamp: serverTime,
      },
    };
  }

  /**
   * Resolve medication conflicts
   */
  private async resolveMedicationConflict(
    conflict: ConflictData,
  ): Promise<ConflictResolution> {
    const { clientData, serverData } = conflict;

    // Medication changes are critical - always require review
    const merged = this.mergeMedications(clientData, serverData);

    return {
      strategy: "merge",
      resolvedData: merged,
      confidence: 0.7,
      reasoning: "Medication data merged with safety checks",
      requiresReview: true, // Always review medication changes
      metadata: {
        medicationSafetyCheck: true,
        interactionCheck: this.checkMedicationInteractions(merged),
        allergyCheck: this.checkAllergyConflicts(merged),
      },
    };
  }

  /**
   * Resolve administrative conflicts
   */
  private async resolveAdministrativeConflict(
    conflict: ConflictData,
  ): Promise<ConflictResolution> {
    const { clientData, serverData } = conflict;

    // Administrative data can use client wins strategy
    return {
      strategy: "client_wins",
      resolvedData: {
        ...serverData,
        ...clientData,
        _lastModified: new Date(),
        _modifiedBy: clientData.userId || "system",
      },
      confidence: 0.85,
      reasoning: "Client data preferred for administrative updates",
      requiresReview: false,
      metadata: {
        administrativeUpdate: true,
      },
    };
  }

  /**
   * Fallback timestamp-based resolution
   */
  private async resolveByTimestamp(
    conflict: ConflictData,
  ): Promise<ConflictResolution> {
    const useClient = conflict.clientTimestamp > conflict.serverTimestamp;

    return {
      strategy: useClient ? "client_wins" : "server_wins",
      resolvedData: useClient ? conflict.clientData : conflict.serverData,
      confidence: 0.6,
      reasoning: `Timestamp-based resolution: ${useClient ? "client" : "server"} data is more recent`,
      requiresReview: conflict.severity === "critical",
      metadata: {
        fallbackResolution: true,
        timestampDifference: Math.abs(
          conflict.clientTimestamp.getTime() -
            conflict.serverTimestamp.getTime(),
        ),
      },
    };
  }

  /**
   * Create manual resolution when automatic resolution fails
   */
  private createManualResolution(
    conflict: ConflictData,
    reason: string,
  ): ConflictResolution {
    return {
      strategy: "manual",
      resolvedData: conflict.serverData, // Default to server data
      confidence: 0.0,
      reasoning: reason,
      requiresReview: true,
      metadata: {
        manualResolutionRequired: true,
        originalConflict: conflict,
      },
    };
  }

  /**
   * Helper methods
   */
  private getMostRecentData(
    clientData: any,
    serverData: any,
    timestampField: string,
  ): any {
    if (!clientData && !serverData) return null;
    if (!clientData) return serverData;
    if (!serverData) return clientData;

    const clientTime = new Date(clientData[timestampField] || 0);
    const serverTime = new Date(serverData[timestampField] || 0);

    return clientTime > serverTime ? clientData : serverData;
  }

  private mergeArrays(
    clientArray: any[],
    serverArray: any[],
    uniqueField: string,
  ): any[] {
    const merged = [...serverArray];

    clientArray.forEach((clientItem) => {
      const existingIndex = merged.findIndex(
        (item) => item[uniqueField] === clientItem[uniqueField],
      );

      if (existingIndex >= 0) {
        // Update existing item with newer data
        const clientTime = new Date(
          clientItem.lastModified || clientItem.timestamp || 0,
        );
        const serverTime = new Date(
          merged[existingIndex].lastModified ||
            merged[existingIndex].timestamp ||
            0,
        );

        if (clientTime > serverTime) {
          merged[existingIndex] = clientItem;
        }
      } else {
        // Add new item
        merged.push(clientItem);
      }
    });

    return merged;
  }

  private hasHighRiskChanges(clientData: any, serverData: any): boolean {
    const highRiskFields = [
      "allergies",
      "emergencyContacts",
      "criticalFlags",
      "medicalRecordNumber",
      "insuranceInfo",
    ];

    return highRiskFields.some((field) => {
      const clientValue = JSON.stringify(clientData[field] || null);
      const serverValue = JSON.stringify(serverData[field] || null);
      return clientValue !== serverValue;
    });
  }

  private hasCriticalClinicalConflict(
    clientData: any,
    serverData: any,
  ): boolean {
    const criticalFields = [
      "diagnosis",
      "treatmentPlan",
      "medications",
      "allergies",
      "vitalSigns",
    ];

    return criticalFields.some((field) => {
      const clientValue = clientData[field];
      const serverValue = serverData[field];

      if (!clientValue && !serverValue) return false;
      if (!clientValue || !serverValue) return true;

      return JSON.stringify(clientValue) !== JSON.stringify(serverValue);
    });
  }

  private mergeMedications(clientData: any, serverData: any): any {
    const clientMeds = Array.isArray(clientData) ? clientData : [clientData];
    const serverMeds = Array.isArray(serverData) ? serverData : [serverData];

    return this.mergeArrays(clientMeds, serverMeds, "medicationId");
  }

  private checkMedicationInteractions(medications: any[]): string[] {
    // Simplified interaction checking
    const interactions: string[] = [];
    const knownInteractions = {
      warfarin: ["aspirin", "ibuprofen"],
      metformin: ["alcohol"],
      digoxin: ["furosemide"],
    };

    medications.forEach((med1) => {
      medications.forEach((med2) => {
        if (med1.medicationId !== med2.medicationId) {
          const med1Interactions = knownInteractions[med1.name?.toLowerCase()];
          if (med1Interactions?.includes(med2.name?.toLowerCase())) {
            interactions.push(`${med1.name} + ${med2.name}`);
          }
        }
      });
    });

    return interactions;
  }

  private checkAllergyConflicts(medications: any[]): string[] {
    // This would check against patient allergies in a real implementation
    return [];
  }

  private updateResolutionStats(
    resolutionTime: number,
    requiresReview: boolean,
  ): void {
    this.resolutionStats.resolvedConflicts++;

    if (requiresReview) {
      this.resolutionStats.manualReviewRequired++;
    }

    // Update average resolution time
    const totalTime =
      this.resolutionStats.averageResolutionTime *
      (this.resolutionStats.resolvedConflicts - 1);
    this.resolutionStats.averageResolutionTime =
      (totalTime + resolutionTime) / this.resolutionStats.resolvedConflicts;
  }

  /**
   * Get conflict resolution statistics
   */
  public getStats(): typeof this.resolutionStats & {
    successRate: number;
    manualReviewRate: number;
  } {
    const successRate =
      this.resolutionStats.totalConflicts > 0
        ? (this.resolutionStats.resolvedConflicts /
            this.resolutionStats.totalConflicts) *
          100
        : 0;

    const manualReviewRate =
      this.resolutionStats.resolvedConflicts > 0
        ? (this.resolutionStats.manualReviewRequired /
            this.resolutionStats.resolvedConflicts) *
          100
        : 0;

    return {
      ...this.resolutionStats,
      successRate,
      manualReviewRate,
    };
  }

  /**
   * Get recent conflict history
   */
  public getConflictHistory(limit: number = 100): ConflictData[] {
    return this.conflictHistory.slice(-limit);
  }

  /**
   * Clear conflict history (for testing/maintenance)
   */
  public clearHistory(): void {
    this.conflictHistory = [];
    console.log("🧹 Conflict history cleared");
  }
}

export const conflictResolutionService =
  ConflictResolutionService.getInstance();
export default conflictResolutionService;
