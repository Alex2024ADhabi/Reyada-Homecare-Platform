import { supabase } from "./supabase.api";
import {
  UnifiedPatient,
  UnifiedEpisode,
  UnifiedClinicalForm,
} from "./unified-schema.api";
import { EventEmitter } from "eventemitter3";

// Import messaging service for event-driven architecture
let messagingService: any = null;

// Lazy load messaging service to avoid circular dependencies
const getMessagingService = async () => {
  if (!messagingService) {
    const { messagingService: ms } = await import(
      "../services/messaging.service"
    );
    messagingService = ms;
    await messagingService.initialize();
  }
  return messagingService;
};

// CROSS-MODULE DATA SYNCHRONIZATION
// Real-time data sync between Patient Management and Clinical Documentation
// Unified patient episode tracking across all services

interface SyncEvent {
  id: string;
  type: "patient" | "episode" | "clinical_form" | "workflow_transition";
  action: "create" | "update" | "delete" | "transition";
  entityId: string;
  data: any;
  timestamp: string;
  source: string;
  userId: string;
}

interface PatientJourneyStage {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredActions: string[];
  completionCriteria: {
    field: string;
    value: any;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "exists";
  }[];
  nextStages: string[];
  automatedTransitions: {
    targetStage: string;
    conditions: {
      field: string;
      value: any;
      operator:
        | "equals"
        | "not_equals"
        | "greater_than"
        | "less_than"
        | "exists";
    }[];
    delay?: number; // in milliseconds
  }[];
}

interface PatientJourney {
  id: string;
  patientId: string;
  currentStage: string;
  stages: {
    stageId: string;
    status: "pending" | "in_progress" | "completed" | "skipped";
    startedAt?: string;
    completedAt?: string;
    assignedTo?: string;
    notes?: string;
    metadata?: any;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata: {
    referralSource?: string;
    priority: "low" | "medium" | "high" | "urgent";
    estimatedDuration?: number;
    actualDuration?: number;
    complications?: string[];
    outcomes?: any;
  };
}

interface SyncConflict {
  id: string;
  entityType: "patient" | "episode" | "clinical_form";
  entityId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "resolved" | "ignored";
  resolution?: {
    strategy: "use_local" | "use_remote" | "merge" | "manual";
    resolvedBy: string;
    resolvedAt: string;
    notes: string;
  };
}

interface SyncStatus {
  entityType: "patient" | "episode" | "clinical_form";
  entityId: string;
  lastSyncTime: string;
  syncStatus: "synced" | "pending" | "error" | "conflict";
  version: number;
  conflicts: SyncConflict[];
  retryCount: number;
  nextRetryTime?: string;
}

// Real-time synchronization service
export class CrossModuleSyncService extends EventEmitter {
  private static instance: CrossModuleSyncService;
  private syncQueue: SyncEvent[] = [];
  private isProcessing = false;
  private syncStatuses = new Map<string, RefreshCwStatus>();
  private conflictResolutionStrategies = new Map<
    string,
    (conflict: SyncConflict) => Promise<any>
  >();
  private patientJourneys = new Map<string, PatientJourney>();
  private journeyStages = new Map<string, PatientJourneyStage>();
  private workflowTransitionQueue: SyncEvent[] = [];
  private isProcessingWorkflows = false;

  private constructor() {
    super();
    this.initializeConflictResolutionStrategies();
    this.initializePatientJourneyStages();
    this.startSyncProcessor();
    this.startWorkflowProcessor();
    this.setupRealtimeSubscriptions();
    this.loadExistingJourneys();
  }

  static getInstance(): CrossModuleSyncService {
    if (!CrossModuleSyncService.instance) {
      CrossModuleSyncService.instance = new CrossModuleSyncService();
    }
    return CrossModuleSyncService.instance;
  }

  /**
   * Initialize conflict resolution strategies
   */
  private initializeConflictResolutionStrategies(): void {
    // Strategy for patient data conflicts
    this.conflictResolutionStrategies.set(
      "patient_timestamp",
      async (conflict: SyncConflict) => {
        // Use most recent timestamp
        const localTime = new Date(
          conflict.localValue?.metadata?.updatedAt || 0,
        ).getTime();
        const remoteTime = new Date(
          conflict.remoteValue?.metadata?.updatedAt || 0,
        ).getTime();
        return localTime > remoteTime
          ? conflict.localValue
          : conflict.remoteValue;
      },
    );

    // Strategy for episode data conflicts
    this.conflictResolutionStrategies.set(
      "episode_priority",
      async (conflict: SyncConflict) => {
        // Prioritize active episodes over completed ones
        if (conflict.field === "status") {
          if (
            conflict.localValue === "active" ||
            conflict.remoteValue === "active"
          ) {
            return conflict.localValue === "active"
              ? conflict.localValue
              : conflict.remoteValue;
          }
        }
        return conflict.remoteValue; // Default to remote
      },
    );

    // Strategy for clinical form conflicts
    this.conflictResolutionStrategies.set(
      "clinical_form_completion",
      async (conflict: SyncConflict) => {
        // Prioritize completed forms over drafts
        if (conflict.field === "status") {
          const statusPriority = {
            completed: 4,
            submitted: 3,
            approved: 5,
            draft: 1,
          };
          const localPriority =
            statusPriority[
              conflict.localValue as keyof typeof statusPriority
            ] || 0;
          const remotePriority =
            statusPriority[
              conflict.remoteValue as keyof typeof statusPriority
            ] || 0;
          return localPriority > remotePriority
            ? conflict.localValue
            : conflict.remoteValue;
        }
        return conflict.remoteValue;
      },
    );
  }

  /**
   * Setup real-time subscriptions for data changes
   */
  private setupRealtimeSubscriptions(): void {
    // Subscribe to patient changes
    supabase
      .channel("patients_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        (payload) => this.handleRealtimeChange("patient", payload),
      )
      .subscribe();

    // Subscribe to episode changes
    supabase
      .channel("episodes_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "episodes" },
        (payload) => this.handleRealtimeChange("episode", payload),
      )
      .subscribe();

    // Subscribe to clinical form changes
    supabase
      .channel("clinical_forms_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinical_forms" },
        (payload) => this.handleRealtimeChange("clinical_form", payload),
      )
      .subscribe();
  }

  /**
   * Handle real-time database changes
   */
  private handleRealtimeChange(
    type: "patient" | "episode" | "clinical_form",
    payload: any,
  ): void {
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action:
        payload.eventType === "INSERT"
          ? "create"
          : payload.eventType === "UPDATE"
            ? "update"
            : "delete",
      entityId: payload.new?.id || payload.old?.id,
      data: payload.new || payload.old,
      timestamp: new Date().toISOString(),
      source: "realtime",
      userId: payload.new?.created_by || payload.old?.created_by || "system",
    };

    this.queueSyncEvent(syncEvent);
    this.emit("sync_event", syncEvent);
  }

  /**
   * Queue sync event for processing
   */
  private queueSyncEvent(event: SyncEvent): void {
    this.syncQueue.push(event);
    this.emit("sync_queued", { queueLength: this.syncQueue.length });

    // Publish to messaging service for event-driven processing
    this.publishToMessageQueue(event);
  }

  /**
   * Publish sync event to message queue
   */
  private async publishToMessageQueue(event: SyncEvent): Promise<void> {
    try {
      const messaging = await getMessagingService();

      await messaging.publish(
        `${event.type}.events`,
        `sync.${event.action}`,
        {
          syncEventId: event.id,
          entityType: event.type,
          entityId: event.entityId,
          action: event.action,
          data: event.data,
          source: event.source,
          userId: event.userId,
          timestamp: event.timestamp,
        },
        {
          priority: "high",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            syncOperation: true,
          },
        },
      );
    } catch (error) {
      console.error("Failed to publish sync event to message queue:", error);
    }
  }

  /**
   * Start sync processor
   */
  private startSyncProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    }, 1000); // Process every second
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const event = this.syncQueue.shift();
        if (event) {
          await this.processSyncEvent(event);
        }
      }
    } catch (error) {
      console.error("Error processing sync queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    try {
      const syncKey = `${event.type}_${event.entityId}`;
      const currentStatus = this.syncStatuses.get(syncKey);

      // Check for conflicts
      const conflicts = await this.detectConflicts(event);

      if (conflicts.length > 0) {
        // Handle conflicts
        await this.handleConflicts(conflicts);

        // Update sync status
        this.syncStatuses.set(syncKey, {
          entityType: event.type,
          entityId: event.entityId,
          lastSyncTime: event.timestamp,
          syncStatus: "conflict",
          version: (currentStatus?.version || 0) + 1,
          conflicts,
          retryCount: (currentStatus?.retryCount || 0) + 1,
        });

        this.emit("sync_conflict", { event, conflicts });

        // Publish conflict event to message queue
        await this.publishConflictEvent(event, conflicts);
      } else {
        // No conflicts, proceed with sync
        await this.applySyncEvent(event);

        // Update sync status
        this.syncStatuses.set(syncKey, {
          entityType: event.type,
          entityId: event.entityId,
          lastSyncTime: event.timestamp,
          syncStatus: "synced",
          version: (currentStatus?.version || 0) + 1,
          conflicts: [],
          retryCount: 0,
        });

        this.emit("sync_completed", { event });

        // Publish completion event to message queue
        await this.publishCompletionEvent(event);
      }
    } catch (error) {
      console.error("Error processing sync event:", error);
      this.emit("sync_error", { event, error });

      // Update sync status with error
      const syncKey = `${event.type}_${event.entityId}`;
      const currentStatus = this.syncStatuses.get(syncKey);

      this.syncStatuses.set(syncKey, {
        entityType: event.type,
        entityId: event.entityId,
        lastSyncTime: event.timestamp,
        syncStatus: "error",
        version: currentStatus?.version || 1,
        conflicts: [],
        retryCount: (currentStatus?.retryCount || 0) + 1,
        nextRetryTime: new Date(
          Date.now() + Math.pow(2, currentStatus?.retryCount || 0) * 1000,
        ).toISOString(),
      });
    }
  }

  /**
   * Detect conflicts in sync event
   */
  private async detectConflicts(event: SyncEvent): Promise<RefreshCwConflict[]> {
    const conflicts: SyncConflict[] = [];

    try {
      // Get current data from database
      let currentData: any = null;

      switch (event.type) {
        case "patient":
          const { data: patientData } = await supabase
            .from("patients")
            .select("*")
            .eq("id", event.entityId)
            .single();
          currentData = patientData;
          break;

        case "episode":
          const { data: episodeData } = await supabase
            .from("episodes")
            .select("*")
            .eq("id", event.entityId)
            .single();
          currentData = episodeData;
          break;

        case "clinical_form":
          const { data: formData } = await supabase
            .from("clinical_forms")
            .select("*")
            .eq("id", event.entityId)
            .single();
          currentData = formData;
          break;
      }

      if (currentData && event.data) {
        // Compare timestamps
        const currentTimestamp = new Date(currentData.updated_at).getTime();
        const eventTimestamp = new Date(
          event.data.updated_at || event.timestamp,
        ).getTime();

        if (currentTimestamp > eventTimestamp) {
          // Current data is newer, potential conflict
          conflicts.push({
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entityType: event.type,
            entityId: event.entityId,
            field: "updated_at",
            localValue: currentData,
            remoteValue: event.data,
            timestamp: new Date().toISOString(),
            severity: "medium",
            status: "pending",
          });
        }

        // Check for specific field conflicts
        const criticalFields = this.getCriticalFields(event.type);
        criticalFields.forEach((field) => {
          if (currentData[field] !== event.data[field]) {
            conflicts.push({
              id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              entityType: event.type,
              entityId: event.entityId,
              field,
              localValue: currentData[field],
              remoteValue: event.data[field],
              timestamp: new Date().toISOString(),
              severity: this.getFieldSeverity(event.type, field),
              status: "pending",
            });
          }
        });
      }
    } catch (error) {
      console.error("Error detecting conflicts:", error);
    }

    return conflicts;
  }

  /**
   * Get critical fields for conflict detection
   */
  private getCriticalFields(
    entityType: "patient" | "episode" | "clinical_form",
  ): string[] {
    switch (entityType) {
      case "patient":
        return [
          "emirates_id",
          "first_name_en",
          "last_name_en",
          "phone_number",
          "status",
        ];
      case "episode":
        return ["status", "primary_diagnosis", "start_date", "end_date"];
      case "clinical_form":
        return ["status", "form_data", "signed_by", "signed_at"];
      default:
        return [];
    }
  }

  /**
   * Get field severity for conflicts
   */
  private getFieldSeverity(
    entityType: "patient" | "episode" | "clinical_form",
    field: string,
  ): "low" | "medium" | "high" | "critical" {
    const criticalFields = {
      patient: ["emirates_id", "status"],
      episode: ["status", "primary_diagnosis"],
      clinical_form: ["status", "signed_by", "signed_at"],
    };

    const highFields = {
      patient: ["first_name_en", "last_name_en", "phone_number"],
      episode: ["start_date", "end_date"],
      clinical_form: ["form_data"],
    };

    if (criticalFields[entityType].includes(field)) return "critical";
    if (highFields[entityType].includes(field)) return "high";
    return "medium";
  }

  /**
   * Handle conflicts using resolution strategies
   */
  private async handleConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      try {
        const strategyKey = `${conflict.entityType}_${this.getConflictStrategy(conflict)}`;
        const strategy = this.conflictResolutionStrategies.get(strategyKey);

        if (strategy) {
          const resolvedValue = await strategy(conflict);

          // Apply resolved value
          await this.applyConflictResolution(conflict, resolvedValue);

          // Mark conflict as resolved
          conflict.status = "resolved";
          conflict.resolution = {
            strategy: "use_remote", // This would be determined by the strategy
            resolvedBy: "system",
            resolvedAt: new Date().toISOString(),
            notes: `Auto-resolved using ${strategyKey} strategy`,
          };
        } else {
          // No automatic resolution strategy, mark for manual review
          conflict.status = "pending";
          this.emit("manual_resolution_required", conflict);
        }
      } catch (error) {
        console.error("Error handling conflict:", error);
        conflict.status = "pending";
      }
    }
  }

  /**
   * Get conflict resolution strategy name
   */
  private getConflictStrategy(conflict: SyncConflict): string {
    switch (conflict.entityType) {
      case "patient":
        return "timestamp";
      case "episode":
        return "priority";
      case "clinical_form":
        return "completion";
      default:
        return "timestamp";
    }
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(
    conflict: SyncConflict,
    resolvedValue: any,
  ): Promise<void> {
    try {
      switch (conflict.entityType) {
        case "patient":
          await supabase
            .from("patients")
            .update({ [conflict.field]: resolvedValue })
            .eq("id", conflict.entityId);
          break;

        case "episode":
          await supabase
            .from("episodes")
            .update({ [conflict.field]: resolvedValue })
            .eq("id", conflict.entityId);
          break;

        case "clinical_form":
          await supabase
            .from("clinical_forms")
            .update({ [conflict.field]: resolvedValue })
            .eq("id", conflict.entityId);
          break;
      }
    } catch (error) {
      console.error("Error applying conflict resolution:", error);
      throw error;
    }
  }

  /**
   * Apply sync event to database
   */
  private async applySyncEvent(event: SyncEvent): Promise<void> {
    try {
      switch (event.action) {
        case "create":
          await this.handleCreateEvent(event);
          break;
        case "update":
          await this.handleUpdateEvent(event);
          break;
        case "delete":
          await this.handleDeleteEvent(event);
          break;
      }
    } catch (error) {
      console.error("Error applying sync event:", error);
      throw error;
    }
  }

  /**
   * Handle create event
   */
  private async handleCreateEvent(event: SyncEvent): Promise<void> {
    // Create events are typically handled by the originating module
    // This is mainly for cross-module notifications
    this.emit("entity_created", {
      type: event.type,
      id: event.entityId,
      data: event.data,
    });
  }

  /**
   * Handle update event
   */
  private async handleUpdateEvent(event: SyncEvent): Promise<void> {
    // Update related entities in other modules
    switch (event.type) {
      case "patient":
        await this.syncPatientUpdate(event);
        break;
      case "episode":
        await this.syncEpisodeUpdate(event);
        break;
      case "clinical_form":
        await this.syncClinicalFormUpdate(event);
        break;
    }
  }

  /**
   * Handle delete event
   */
  private async handleDeleteEvent(event: SyncEvent): Promise<void> {
    // Handle cascading deletes and cleanup
    this.emit("entity_deleted", {
      type: event.type,
      id: event.entityId,
      data: event.data,
    });
  }

  /**
   * Sync patient updates across modules
   */
  private async syncPatientUpdate(event: SyncEvent): Promise<void> {
    // Update related episodes and clinical forms with patient changes
    const patientData = event.data;

    // Update episodes if patient status changed
    if (patientData.status === "discharged") {
      await supabase
        .from("episodes")
        .update({
          status: "completed",
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("patient_id", event.entityId)
        .eq("status", "active");
    }

    // Check for workflow transitions based on patient updates
    await this.checkPatientWorkflowTriggers(event.entityId, patientData);

    this.emit("patient_synced", {
      patientId: event.entityId,
      data: patientData,
    });
  }

  /**
   * Check for workflow triggers based on patient updates
   */
  private async checkPatientWorkflowTriggers(
    patientId: string,
    patientData: any,
  ): Promise<void> {
    const journey = this.patientJourneys.get(patientId);

    // Create journey if it doesn't exist and patient is new
    if (!journey && patientData.status === "active") {
      await this.createPatientJourney(patientId, "referral_received", {
        referralSource: patientData.referral_source,
        priority: patientData.priority || "medium",
      });
      return;
    }

    if (!journey) return;

    // Check for specific triggers
    const triggers = [
      {
        condition: () =>
          patientData.referral_status === "approved" &&
          patientData.insurance_verified,
        targetStage: "initial_assessment",
        currentStage: "referral_received",
      },
      {
        condition: () =>
          patientData.assessment_completed && patientData.care_plan_created,
        targetStage: "active_care",
        currentStage: "initial_assessment",
      },
      {
        condition: () =>
          patientData.care_goals_met && patientData.discharge_criteria_met,
        targetStage: "discharge_planning",
        currentStage: "active_care",
      },
      {
        condition: () => patientData.emergency_flag === true,
        targetStage: "care_escalation",
        currentStage: null, // Can transition from any stage
      },
      {
        condition: () => patientData.status === "discharged",
        targetStage: "discharged",
        currentStage: "discharge_planning",
      },
    ];

    for (const trigger of triggers) {
      if (
        trigger.condition() &&
        (trigger.currentStage === null ||
          journey.currentStage === trigger.currentStage)
      ) {
        await this.triggerWorkflowTransition(
          patientId,
          trigger.targetStage,
          "system",
          `Triggered by patient data update: ${JSON.stringify(patientData)}`,
        );
        break; // Only trigger one transition at a time
      }
    }
  }

  /**
   * Sync episode updates across modules
   */
  private async syncEpisodeUpdate(event: SyncEvent): Promise<void> {
    const episodeData = event.data;

    // Update clinical forms if episode status changed
    if (
      episodeData.status === "completed" ||
      episodeData.status === "cancelled"
    ) {
      await supabase
        .from("clinical_forms")
        .update({
          status:
            episodeData.status === "completed" ? "submitted" : "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("episode_id", event.entityId)
        .in("status", ["draft", "completed"]);
    }

    this.emit("episode_synced", {
      episodeId: event.entityId,
      data: episodeData,
    });
  }

  /**
   * Sync clinical form updates across modules
   */
  private async syncClinicalFormUpdate(event: SyncEvent): Promise<void> {
    const formData = event.data;

    // Update episode care plan if clinical form is completed
    if (formData.status === "completed" || formData.status === "approved") {
      // Extract care plan updates from form data
      if (formData.form_data && typeof formData.form_data === "object") {
        const carePlanUpdates = this.extractCarePlanUpdates(formData.form_data);

        if (Object.keys(carePlanUpdates).length > 0) {
          await supabase
            .from("episodes")
            .update({
              care_plan: carePlanUpdates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", formData.episode_id);
        }
      }
    }

    this.emit("clinical_form_synced", {
      formId: event.entityId,
      data: formData,
    });
  }

  /**
   * Extract care plan updates from clinical form data
   */
  private extractCarePlanUpdates(formData: any): any {
    const updates: any = {};

    // Extract goals from assessment data
    if (formData.nineDomainAssessment) {
      const goals: any[] = [];

      Object.entries(formData.nineDomainAssessment).forEach(
        ([domain, assessment]: [string, any]) => {
          if (assessment.riskFactors && assessment.riskFactors.length > 0) {
            goals.push({
              id: `goal_${domain}_${Date.now()}`,
              description: `Address ${domain} risk factors: ${assessment.riskFactors.join(", ")}`,
              targetDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(), // 30 days from now
              status: "active",
              priority: assessment.score < 50 ? "high" : "medium",
            });
          }
        },
      );

      if (goals.length > 0) {
        updates.goals = goals;
      }
    }

    return updates;
  }

  /**
   * Get sync status for entity
   */
  public getSyncStatus(
    entityType: "patient" | "episode" | "clinical_form",
    entityId: string,
  ): SyncStatus | null {
    const syncKey = `${entityType}_${entityId}`;
    return this.syncStatuses.get(syncKey) || null;
  }

  /**
   * Get all sync statuses
   */
  public getAllSyncStatuses(): SyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  /**
   * Get pending conflicts
   */
  public getPendingConflicts(): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    this.syncStatuses.forEach((status) => {
      conflicts.push(...status.conflicts.filter((c) => c.status === "pending"));
    });

    return conflicts;
  }

  /**
   * Manually resolve conflict
   */
  public async resolveConflict(
    conflictId: string,
    resolution: "use_local" | "use_remote" | "merge",
    userId: string,
    notes?: string,
  ): Promise<void> {
    // Find conflict
    let targetConflict: SyncConflict | null = null;
    let targetStatus: SyncStatus | null = null;

    for (const status of this.syncStatuses.values()) {
      const conflict = status.conflicts.find((c) => c.id === conflictId);
      if (conflict) {
        targetConflict = conflict;
        targetStatus = status;
        break;
      }
    }

    if (!targetConflict || !targetStatus) {
      throw new Error("Conflict not found");
    }

    // Apply resolution
    let resolvedValue: any;
    switch (resolution) {
      case "use_local":
        resolvedValue = targetConflict.localValue;
        break;
      case "use_remote":
        resolvedValue = targetConflict.remoteValue;
        break;
      case "merge":
        resolvedValue = this.mergeValues(
          targetConflict.localValue,
          targetConflict.remoteValue,
        );
        break;
    }

    await this.applyConflictResolution(targetConflict, resolvedValue);

    // Update conflict status
    targetConflict.status = "resolved";
    targetConflict.resolution = {
      strategy: resolution,
      resolvedBy: userId,
      resolvedAt: new Date().toISOString(),
      notes: notes || "",
    };

    // Update sync status
    const remainingConflicts = targetStatus.conflicts.filter(
      (c) => c.status === "pending",
    );
    if (remainingConflicts.length === 0) {
      targetStatus.syncStatus = "synced";
    }

    this.emit("conflict_resolved", { conflict: targetConflict, resolution });
  }

  /**
   * Publish conflict event to message queue
   */
  private async publishConflictEvent(
    event: SyncEvent,
    conflicts: SyncConflict[],
  ): Promise<void> {
    try {
      const messaging = await getMessagingService();

      await messaging.publish(
        "system.events",
        "sync.conflict.detected",
        {
          syncEventId: event.id,
          entityType: event.type,
          entityId: event.entityId,
          conflicts: conflicts.map((c) => ({
            id: c.id,
            field: c.field,
            severity: c.severity,
            status: c.status,
          })),
          timestamp: new Date().toISOString(),
        },
        {
          priority: "critical",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            conflictCount: conflicts.length,
          },
        },
      );
    } catch (error) {
      console.error("Failed to publish conflict event:", error);
    }
  }

  /**
   * Publish completion event to message queue
   */
  private async publishCompletionEvent(event: SyncEvent): Promise<void> {
    try {
      const messaging = await getMessagingService();

      await messaging.publish(
        `${event.type}.events`,
        `sync.${event.action}.completed`,
        {
          syncEventId: event.id,
          entityType: event.type,
          entityId: event.entityId,
          action: event.action,
          completedAt: new Date().toISOString(),
        },
        {
          priority: "medium",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            syncCompleted: true,
          },
        },
      );
    } catch (error) {
      console.error("Failed to publish completion event:", error);
    }
  }

  /**
   * Merge two values (simple merge strategy)
   */
  private mergeValues(localValue: any, remoteValue: any): any {
    if (typeof localValue === "object" && typeof remoteValue === "object") {
      return { ...localValue, ...remoteValue };
    }
    return remoteValue; // Default to remote value
  }

  /**
   * Initialize patient journey stages
   */
  private initializePatientJourneyStages(): void {
    const stages: PatientJourneyStage[] = [
      {
        id: "referral_received",
        name: "Referral Received",
        description: "Patient referral has been received and is pending review",
        order: 1,
        requiredActions: ["review_referral", "verify_insurance"],
        completionCriteria: [
          { field: "referral_status", value: "approved", operator: "equals" },
          { field: "insurance_verified", value: true, operator: "equals" },
        ],
        nextStages: ["initial_assessment", "referral_rejected"],
        automatedTransitions: [
          {
            targetStage: "initial_assessment",
            conditions: [
              {
                field: "referral_status",
                value: "approved",
                operator: "equals",
              },
              { field: "insurance_verified", value: true, operator: "equals" },
            ],
            delay: 0,
          },
        ],
      },
      {
        id: "initial_assessment",
        name: "Initial Assessment",
        description: "Patient initial assessment and care plan development",
        order: 2,
        requiredActions: ["conduct_assessment", "create_care_plan"],
        completionCriteria: [
          { field: "assessment_completed", value: true, operator: "equals" },
          { field: "care_plan_created", value: true, operator: "equals" },
        ],
        nextStages: ["active_care", "assessment_incomplete"],
        automatedTransitions: [
          {
            targetStage: "active_care",
            conditions: [
              {
                field: "assessment_completed",
                value: true,
                operator: "equals",
              },
              { field: "care_plan_approved", value: true, operator: "equals" },
            ],
            delay: 3600000, // 1 hour delay
          },
        ],
      },
      {
        id: "active_care",
        name: "Active Care",
        description: "Patient is receiving active homecare services",
        order: 3,
        requiredActions: [
          "deliver_services",
          "monitor_progress",
          "update_care_plan",
        ],
        completionCriteria: [
          { field: "care_goals_met", value: true, operator: "equals" },
          { field: "discharge_criteria_met", value: true, operator: "equals" },
        ],
        nextStages: ["discharge_planning", "care_escalation"],
        automatedTransitions: [
          {
            targetStage: "discharge_planning",
            conditions: [
              { field: "care_goals_met", value: true, operator: "equals" },
              { field: "physician_approval", value: true, operator: "equals" },
            ],
            delay: 86400000, // 24 hour delay
          },
          {
            targetStage: "care_escalation",
            conditions: [
              { field: "emergency_flag", value: true, operator: "equals" },
            ],
            delay: 0, // Immediate transition
          },
        ],
      },
      {
        id: "discharge_planning",
        name: "Discharge Planning",
        description: "Planning patient discharge and transition of care",
        order: 4,
        requiredActions: ["create_discharge_plan", "coordinate_followup"],
        completionCriteria: [
          {
            field: "discharge_plan_completed",
            value: true,
            operator: "equals",
          },
          { field: "followup_arranged", value: true, operator: "equals" },
        ],
        nextStages: ["discharged"],
        automatedTransitions: [
          {
            targetStage: "discharged",
            conditions: [
              { field: "discharge_approved", value: true, operator: "equals" },
              {
                field: "final_documentation_complete",
                value: true,
                operator: "equals",
              },
            ],
            delay: 7200000, // 2 hour delay
          },
        ],
      },
      {
        id: "discharged",
        name: "Discharged",
        description: "Patient has been successfully discharged",
        order: 5,
        requiredActions: ["complete_documentation", "send_summary"],
        completionCriteria: [
          { field: "final_summary_sent", value: true, operator: "equals" },
        ],
        nextStages: [],
        automatedTransitions: [],
      },
      {
        id: "care_escalation",
        name: "Care Escalation",
        description:
          "Patient requires escalated care or emergency intervention",
        order: 99,
        requiredActions: ["emergency_response", "notify_physician"],
        completionCriteria: [
          { field: "emergency_resolved", value: true, operator: "equals" },
        ],
        nextStages: ["active_care", "discharged"],
        automatedTransitions: [
          {
            targetStage: "active_care",
            conditions: [
              { field: "emergency_resolved", value: true, operator: "equals" },
              { field: "continue_care", value: true, operator: "equals" },
            ],
            delay: 1800000, // 30 minute delay
          },
        ],
      },
    ];

    stages.forEach((stage) => {
      this.journeyStages.set(stage.id, stage);
    });
  }

  /**
   * Load existing patient journeys from database
   */
  private async loadExistingJourneys(): Promise<void> {
    try {
      const { data: journeys } = await supabase
        .from("patient_journeys")
        .select("*")
        .neq("completed_at", null);

      if (journeys) {
        journeys.forEach((journey: any) => {
          this.patientJourneys.set(journey.patient_id, {
            id: journey.id,
            patientId: journey.patient_id,
            currentStage: journey.current_stage,
            stages: journey.stages || [],
            createdAt: journey.created_at,
            updatedAt: journey.updated_at,
            completedAt: journey.completed_at,
            metadata: journey.metadata || { priority: "medium" },
          });
        });
      }
    } catch (error) {
      console.error("Error loading existing patient journeys:", error);
    }
  }

  /**
   * Start workflow processor
   */
  private startWorkflowProcessor(): void {
    setInterval(async () => {
      if (
        !this.isProcessingWorkflows &&
        this.workflowTransitionQueue.length > 0
      ) {
        await this.processWorkflowQueue();
      }
      // Also check for automated transitions
      await this.checkAutomatedTransitions();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process workflow transition queue
   */
  private async processWorkflowQueue(): Promise<void> {
    if (this.isProcessingWorkflows) return;

    this.isProcessingWorkflows = true;

    try {
      while (this.workflowTransitionQueue.length > 0) {
        const event = this.workflowTransitionQueue.shift();
        if (event) {
          await this.processWorkflowTransition(event);
        }
      }
    } catch (error) {
      console.error("Error processing workflow queue:", error);
    } finally {
      this.isProcessingWorkflows = false;
    }
  }

  /**
   * Process workflow transition event
   */
  private async processWorkflowTransition(event: SyncEvent): Promise<void> {
    try {
      const journey = this.patientJourneys.get(event.entityId);
      if (!journey) {
        console.warn(`No journey found for patient ${event.entityId}`);
        return;
      }

      const targetStage = event.data.targetStage;
      const stage = this.journeyStages.get(targetStage);

      if (!stage) {
        console.warn(`Unknown stage: ${targetStage}`);
        return;
      }

      // Update journey
      await this.transitionPatientToStage(
        event.entityId,
        targetStage,
        event.userId,
      );

      // Emit workflow transition event
      this.emit("workflow_transition", {
        patientId: event.entityId,
        fromStage: journey.currentStage,
        toStage: targetStage,
        timestamp: event.timestamp,
        triggeredBy: event.source,
      });

      // Publish to message queue
      await this.publishWorkflowTransitionEvent(
        event,
        journey.currentStage,
        targetStage,
      );
    } catch (error) {
      console.error("Error processing workflow transition:", error);
    }
  }

  /**
   * Check for automated transitions
   */
  private async checkAutomatedTransitions(): Promise<void> {
    for (const [patientId, journey] of this.patientJourneys) {
      if (journey.completedAt) continue; // Skip completed journeys

      const currentStage = this.journeyStages.get(journey.currentStage);
      if (!currentStage || currentStage.automatedTransitions.length === 0)
        continue;

      // Get current patient data
      const patientData = await this.getPatientData(patientId);
      if (!patientData) continue;

      // Check each automated transition
      for (const transition of currentStage.automatedTransitions) {
        const shouldTransition = this.evaluateTransitionConditions(
          transition.conditions,
          patientData,
        );

        if (shouldTransition) {
          // Check if delay has passed
          const currentStageInfo = journey.stages.find(
            (s) => s.stageId === journey.currentStage,
          );
          const stageStartTime = currentStageInfo?.startedAt
            ? new Date(currentStageInfo.startedAt).getTime()
            : Date.now();
          const delayPassed =
            !transition.delay ||
            Date.now() - stageStartTime >= transition.delay;

          if (delayPassed) {
            // Queue transition
            const transitionEvent: SyncEvent = {
              id: `auto_transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: "workflow_transition",
              action: "transition",
              entityId: patientId,
              data: {
                targetStage: transition.targetStage,
                automated: true,
                conditions: transition.conditions,
              },
              timestamp: new Date().toISOString(),
              source: "automated",
              userId: "system",
            };

            this.workflowTransitionQueue.push(transitionEvent);
          }
        }
      }
    }
  }

  /**
   * Evaluate transition conditions
   */
  private evaluateTransitionConditions(
    conditions: { field: string; value: any; operator: string }[],
    data: any,
  ): boolean {
    return conditions.every((condition) => {
      const fieldValue = this.getNestedValue(data, condition.field);

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "greater_than":
          return fieldValue > condition.value;
        case "less_than":
          return fieldValue < condition.value;
        case "exists":
          return fieldValue !== undefined && fieldValue !== null;
        default:
          return false;
      }
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get patient data for workflow evaluation
   */
  private async getPatientData(patientId: string): Promise<any> {
    try {
      const { data: patient } = await supabase
        .from("patients")
        .select(
          `
          *,
          episodes(*),
          clinical_forms(*)
        `,
        )
        .eq("id", patientId)
        .single();

      return patient;
    } catch (error) {
      console.error("Error fetching patient data:", error);
      return null;
    }
  }

  /**
   * Create new patient journey
   */
  public async createPatientJourney(
    patientId: string,
    initialStage: string = "referral_received",
    metadata: any = {},
  ): Promise<PatientJourney> {
    const journey: PatientJourney = {
      id: `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      currentStage: initialStage,
      stages: [
        {
          stageId: initialStage,
          status: "in_progress",
          startedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        priority: "medium",
        ...metadata,
      },
    };

    // Save to database
    try {
      await supabase.from("patient_journeys").insert({
        id: journey.id,
        patient_id: journey.patientId,
        current_stage: journey.currentStage,
        stages: journey.stages,
        created_at: journey.createdAt,
        updated_at: journey.updatedAt,
        metadata: journey.metadata,
      });
    } catch (error) {
      console.error("Error saving patient journey:", error);
    }

    // Store in memory
    this.patientJourneys.set(patientId, journey);

    // Emit event
    this.emit("journey_created", { journey });

    return journey;
  }

  /**
   * Transition patient to new stage
   */
  public async transitionPatientToStage(
    patientId: string,
    targetStage: string,
    userId: string = "system",
  ): Promise<void> {
    const journey = this.patientJourneys.get(patientId);
    if (!journey) {
      throw new Error(`No journey found for patient ${patientId}`);
    }

    const stage = this.journeyStages.get(targetStage);
    if (!stage) {
      throw new Error(`Unknown stage: ${targetStage}`);
    }

    const previousStage = journey.currentStage;

    // Update current stage status to completed
    const currentStageIndex = journey.stages.findIndex(
      (s) => s.stageId === previousStage,
    );
    if (currentStageIndex >= 0) {
      journey.stages[currentStageIndex].status = "completed";
      journey.stages[currentStageIndex].completedAt = new Date().toISOString();
    }

    // Add new stage or update existing
    const existingStageIndex = journey.stages.findIndex(
      (s) => s.stageId === targetStage,
    );
    if (existingStageIndex >= 0) {
      journey.stages[existingStageIndex].status = "in_progress";
      journey.stages[existingStageIndex].startedAt = new Date().toISOString();
    } else {
      journey.stages.push({
        stageId: targetStage,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        assignedTo: userId,
      });
    }

    // Update journey
    journey.currentStage = targetStage;
    journey.updatedAt = new Date().toISOString();

    // Check if journey is complete
    if (targetStage === "discharged") {
      journey.completedAt = new Date().toISOString();
    }

    // Save to database
    try {
      await supabase
        .from("patient_journeys")
        .update({
          current_stage: journey.currentStage,
          stages: journey.stages,
          updated_at: journey.updatedAt,
          completed_at: journey.completedAt,
        })
        .eq("patient_id", patientId);
    } catch (error) {
      console.error("Error updating patient journey:", error);
    }

    // Emit transition event
    this.emit("stage_transition", {
      patientId,
      fromStage: previousStage,
      toStage: targetStage,
      journey,
      userId,
    });
  }

  /**
   * Get patient journey
   */
  public getPatientJourney(patientId: string): PatientJourney | null {
    return this.patientJourneys.get(patientId) || null;
  }

  /**
   * Get all active journeys
   */
  public getActiveJourneys(): PatientJourney[] {
    return Array.from(this.patientJourneys.values()).filter(
      (journey) => !journey.completedAt,
    );
  }

  /**
   * Get journey stages
   */
  public getJourneyStages(): PatientJourneyStage[] {
    return Array.from(this.journeyStages.values()).sort(
      (a, b) => a.order - b.order,
    );
  }

  /**
   * Publish workflow transition event to message queue
   */
  private async publishWorkflowTransitionEvent(
    event: SyncEvent,
    fromStage: string,
    toStage: string,
  ): Promise<void> {
    try {
      const messaging = await getMessagingService();

      await messaging.publish(
        "workflow.events",
        "patient.stage.transition",
        {
          patientId: event.entityId,
          fromStage,
          toStage,
          automated: event.data.automated || false,
          timestamp: event.timestamp,
          userId: event.userId,
        },
        {
          priority: "high",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            workflowTransition: true,
          },
        },
      );
    } catch (error) {
      console.error("Failed to publish workflow transition event:", error);
    }
  }

  /**
   * Force sync for entity
   */
  public async forceSync(
    entityType: "patient" | "episode" | "clinical_form",
    entityId: string,
  ): Promise<void> {
    const syncEvent: SyncEvent = {
      id: `force_sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: entityType,
      action: "update",
      entityId,
      data: null, // Will be fetched during processing
      timestamp: new Date().toISOString(),
      source: "manual",
      userId: "system",
    };

    this.queueSyncEvent(syncEvent);
  }

  /**
   * Trigger manual workflow transition
   */
  public async triggerWorkflowTransition(
    patientId: string,
    targetStage: string,
    userId: string,
    notes?: string,
  ): Promise<void> {
    const transitionEvent: SyncEvent = {
      id: `manual_transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "workflow_transition",
      action: "transition",
      entityId: patientId,
      data: {
        targetStage,
        automated: false,
        notes,
      },
      timestamp: new Date().toISOString(),
      source: "manual",
      userId,
    };

    this.workflowTransitionQueue.push(transitionEvent);
  }
}

// Export singleton instance
export const crossModuleSync = CrossModuleSyncService.getInstance();
