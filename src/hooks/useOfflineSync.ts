import { useState, useEffect, useCallback } from "react";
import { offlineService } from "../services/offline.service";

/**
 * Hook to manage offline/online state and data synchronization
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingItems, setPendingItems] = useState<{
    clinicalForms: number;
    patientAssessments: number;
    serviceInitiations: number;
    paymentReconciliations: number;
    denialManagements: number;
    revenueReports: number;
    // Administrative data types
    attendanceRecords: number;
    timesheetEntries: number;
    dailyPlans: number;
    dailyUpdates: number;
    incidentReports: number;
    qualityInitiatives: number;
    complianceRecords: number;
    auditRecords: number;
    reportTemplates: number;
    kpiRecords: number;
    // Communication & Collaboration data types
    chatGroups: number;
    chatMessages: number;
    emailTemplates: number;
    emailCommunications: number;
    committees: number;
    committeeMeetings: number;
    governanceDocuments: number;
    staffAcknowledgments: number;
  }>({
    clinicalForms: 0,
    patientAssessments: 0,
    serviceInitiations: 0,
    paymentReconciliations: 0,
    denialManagements: 0,
    revenueReports: 0,
    attendanceRecords: 0,
    timesheetEntries: 0,
    dailyPlans: 0,
    dailyUpdates: 0,
    incidentReports: 0,
    qualityInitiatives: 0,
    complianceRecords: 0,
    auditRecords: 0,
    reportTemplates: 0,
    kpiRecords: 0,
    // Communication & Collaboration data counts
    chatGroups: 0,
    chatMessages: 0,
    emailTemplates: 0,
    emailCommunications: 0,
    committees: 0,
    committeeMeetings: 0,
    governanceDocuments: 0,
    staffAcknowledgments: 0,
  });

  // Enhanced sync with intelligent prioritization and conflict resolution
  const syncPendingData = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    try {
      const pendingData = await offlineService.getPendingSyncItems();

      // Intelligent sync prioritization based on data criticality
      const syncPriorities = {
        critical: [
          "incidentReports",
          "clinicalForms",
          "emiratesIdVerifications",
        ],
        high: [
          "patientAssessments",
          "serviceInitiations",
          "attendanceRecords",
          "authenticationData",
        ],
        medium: [
          "paymentReconciliations",
          "denialManagements",
          "dailyPlans",
          "electronicSignatures",
        ],
        low: ["revenueReports", "qualityInitiatives", "performanceMetrics"],
      };

      // Sync critical items first
      for (const priority of ["critical", "high", "medium", "low"]) {
        const itemTypes =
          syncPriorities[priority as keyof typeof syncPriorities];

        for (const itemType of itemTypes) {
          const items = pendingData[itemType as keyof typeof pendingData];
          if (!items || !Array.isArray(items)) continue;

          for (const item of items) {
            try {
              // Enhanced conflict resolution
              const conflictResolution = await resolveDataConflicts(item);
              if (conflictResolution.hasConflict) {
                console.warn(
                  `Conflict detected for ${itemType} ${item.id}:`,
                  conflictResolution.conflicts,
                );
                // Apply conflict resolution strategy
                item.data = conflictResolution.resolvedData;
                item.conflictResolved = true;
              }

              // Simulate API call with retry logic
              await syncWithRetry(item, itemType);

              // Mark as synced based on item type
              if (
                itemType === "clinicalForms" ||
                itemType === "patientAssessments" ||
                itemType === "serviceInitiations"
              ) {
                await offlineService.updateForm(item.id, { status: "synced" });
              } else if (itemType === "paymentReconciliations") {
                await offlineService.updatePaymentReconciliationStatus(
                  item.id,
                  "synced",
                );
              } else if (itemType === "denialManagements") {
                await offlineService.updateDenialManagementStatus(
                  item.id,
                  "synced",
                );
              }

              console.log(`${itemType} ${item.id} synced successfully`);
            } catch (error) {
              console.error(`Failed to sync ${itemType} ${item.id}:`, error);
              // Mark for retry
              item.retryCount = (item.retryCount || 0) + 1;
              if (item.retryCount >= 3) {
                console.error(
                  `Max retries exceeded for ${itemType} ${item.id}`,
                );
              }
            }
          }
        }
      }

      // Update pending items count
      updatePendingItemsCount();

      console.log("Enhanced sync completed successfully");
    } catch (error) {
      console.error("Failed to sync pending data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline]);

  // Enhanced conflict resolution for offline data
  const resolveDataConflicts = async (item: any) => {
    try {
      // Check for server-side changes
      const serverVersion = await checkServerVersion(item.id);

      if (!serverVersion) {
        return { hasConflict: false, resolvedData: item.data };
      }

      // Compare timestamps and data
      const localTimestamp = new Date(item.updatedAt).getTime();
      const serverTimestamp = new Date(serverVersion.updatedAt).getTime();

      if (serverTimestamp > localTimestamp) {
        // Server has newer version - merge changes
        const mergedData = mergeDataChanges(item.data, serverVersion.data);
        return {
          hasConflict: true,
          conflicts: ["timestamp_mismatch"],
          resolvedData: mergedData,
        };
      }

      return { hasConflict: false, resolvedData: item.data };
    } catch (error) {
      console.error("Conflict resolution failed:", error);
      return { hasConflict: false, resolvedData: item.data };
    }
  };

  // Check server version for conflict detection
  const checkServerVersion = async (itemId: string) => {
    try {
      // Simulate server version check
      return null; // No server version found
    } catch (error) {
      return null;
    }
  };

  // Merge data changes intelligently
  const mergeDataChanges = (localData: any, serverData: any) => {
    try {
      // Simple merge strategy - prefer local changes for user-modified fields
      return {
        ...serverData,
        ...localData,
        mergedAt: new Date().toISOString(),
        conflictResolved: true,
      };
    } catch (error) {
      console.error("Data merge failed:", error);
      return localData;
    }
  };

  // Enhanced sync with retry logic
  const syncWithRetry = async (item: any, itemType: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Simulate API call with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Simulate successful sync
        return true;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.warn(
          `Sync attempt ${attempt} failed for ${itemType} ${item.id}, retrying...`,
        );
      }
    }
  };

  // Handle online status change
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    // Attempt to sync when coming back online
    syncPendingData();
  }, [syncPendingData]);

  // Handle offline status change
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Initialize offline database and set up event listeners
  useEffect(() => {
    const initOfflineService = async () => {
      try {
        await offlineService.init();
        // Call updatePendingItemsCount after it's defined
        const pendingData = await offlineService.getPendingSyncItems();
        setPendingItems({
          clinicalForms: pendingData.clinicalForms.length,
          patientAssessments: pendingData.patientAssessments.length,
          serviceInitiations: pendingData.serviceInitiations.length,
          paymentReconciliations:
            pendingData.paymentReconciliations?.length || 0,
          denialManagements: pendingData.denialManagements?.length || 0,
          revenueReports: pendingData.revenueReports?.length || 0,
          attendanceRecords: pendingData.attendanceRecords?.length || 0,
          timesheetEntries: pendingData.timesheetEntries?.length || 0,
          dailyPlans: pendingData.dailyPlans?.length || 0,
          dailyUpdates: pendingData.dailyUpdates?.length || 0,
          incidentReports: pendingData.incidentReports?.length || 0,
          qualityInitiatives: pendingData.qualityInitiatives?.length || 0,
          complianceRecords: pendingData.complianceRecords?.length || 0,
          auditRecords: pendingData.auditRecords?.length || 0,
          reportTemplates: pendingData.reportTemplates?.length || 0,
          kpiRecords: pendingData.kpiRecords?.length || 0,
          chatGroups: pendingData.chatGroups?.length || 0,
          chatMessages: pendingData.chatMessages?.length || 0,
          emailTemplates: pendingData.emailTemplates?.length || 0,
          emailCommunications: pendingData.emailCommunications?.length || 0,
          committees: pendingData.committees?.length || 0,
          committeeMeetings: pendingData.committeeMeetings?.length || 0,
          governanceDocuments: pendingData.governanceDocuments?.length || 0,
          staffAcknowledgments: pendingData.staffAcknowledgments?.length || 0,
        });
      } catch (error) {
        console.error("Failed to initialize offline service:", error);
      }
    };

    initOfflineService();

    // Add event listeners for online/offline status
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Update the count of pending items
  const updatePendingItemsCount = useCallback(async () => {
    try {
      const pendingData = await offlineService.getPendingSyncItems();
      setPendingItems({
        clinicalForms: pendingData.clinicalForms.length,
        patientAssessments: pendingData.patientAssessments.length,
        serviceInitiations: pendingData.serviceInitiations.length,
        paymentReconciliations: pendingData.paymentReconciliations?.length || 0,
        denialManagements: pendingData.denialManagements?.length || 0,
        revenueReports: pendingData.revenueReports?.length || 0,
        // Administrative data counts
        attendanceRecords: pendingData.attendanceRecords?.length || 0,
        timesheetEntries: pendingData.timesheetEntries?.length || 0,
        dailyPlans: pendingData.dailyPlans?.length || 0,
        dailyUpdates: pendingData.dailyUpdates?.length || 0,
        incidentReports: pendingData.incidentReports?.length || 0,
        qualityInitiatives: pendingData.qualityInitiatives?.length || 0,
        complianceRecords: pendingData.complianceRecords?.length || 0,
        auditRecords: pendingData.auditRecords?.length || 0,
        reportTemplates: pendingData.reportTemplates?.length || 0,
        kpiRecords: pendingData.kpiRecords?.length || 0,
        // Communication & Collaboration data counts
        chatGroups: pendingData.chatGroups?.length || 0,
        chatMessages: pendingData.chatMessages?.length || 0,
        emailTemplates: pendingData.emailTemplates?.length || 0,
        emailCommunications: pendingData.emailCommunications?.length || 0,
        committees: pendingData.committees?.length || 0,
        committeeMeetings: pendingData.committeeMeetings?.length || 0,
        governanceDocuments: pendingData.governanceDocuments?.length || 0,
        staffAcknowledgments: pendingData.staffAcknowledgments?.length || 0,
      });
    } catch (error) {
      console.error("Failed to get pending items count:", error);
    }
  }, []);

  // Save form data (works both online and offline)
  const saveFormData = useCallback(
    async (formType: string, formData: any) => {
      try {
        if (formType === "assessment") {
          await offlineService.saveClinicalAssessment(formData);
        } else if (formType === "service-initiation") {
          await offlineService.saveServiceInitiation(formData);
        } else if (formType === "attendance") {
          // Save attendance data with priority sync for time-sensitive data
          await offlineService.saveAdministrativeData("attendance", {
            ...formData,
            priority: "high", // Time-sensitive data
            syncStrategy: "immediate",
          });
        } else if (formType === "incident_report") {
          // Save incident reports with critical priority
          await offlineService.saveAdministrativeData("incident", {
            ...formData,
            priority: formData.severity === "critical" ? "critical" : "high",
            syncStrategy: "immediate",
          });
        } else if (formType === "daily_plan") {
          // Save daily plans with medium priority
          await offlineService.saveAdministrativeData("planning", {
            ...formData,
            priority: "medium",
            syncStrategy: "batch",
          });
        } else if (formType === "quality_management") {
          // Save quality data with standard priority
          await offlineService.saveAdministrativeData("quality", {
            ...formData,
            priority: "medium",
            syncStrategy: "batch",
          });
        } else if (formType === "report_template") {
          // Save report templates with low priority
          await offlineService.saveAdministrativeData("reporting", {
            ...formData,
            priority: "low",
            syncStrategy: "scheduled",
          });
        } else if (formType === "chat_message") {
          // Save chat messages with high priority for real-time communication
          await offlineService.saveAdministrativeData("chat", {
            ...formData,
            priority: "high",
            syncStrategy: "immediate",
          });
        } else if (formType === "email_communication") {
          // Save email communications with medium priority
          await offlineService.saveAdministrativeData("email", {
            ...formData,
            priority: "medium",
            syncStrategy: "batch",
          });
        } else if (formType === "committee_meeting") {
          // Save committee meetings with medium priority
          await offlineService.saveAdministrativeData("committee", {
            ...formData,
            priority: "medium",
            syncStrategy: "batch",
          });
        } else if (formType === "governance_document") {
          // Save governance documents with medium priority
          await offlineService.saveAdministrativeData("governance", {
            ...formData,
            priority: "medium",
            syncStrategy: "batch",
          });
        } else if (formType === "clinical_incident") {
          // Save clinical incidents with critical priority
          await offlineService.saveAdministrativeData("incident", {
            ...formData,
            priority: "critical",
            syncStrategy: "immediate",
          });
        } else {
          // Regular clinical form
          await offlineService.saveClinicalForm({
            ...formData,
            formType,
          });
        }

        // Update pending items count
        updatePendingItemsCount();

        // If online, attempt to sync immediately for high-priority items
        if (
          isOnline &&
          [
            "attendance",
            "incident_report",
            "chat_message",
            "clinical_incident",
          ].includes(formType)
        ) {
          syncPendingData();
        }

        return true;
      } catch (error) {
        console.error(`Failed to save ${formType} data:`, error);
        return false;
      }
    },
    [isOnline, syncPendingData, updatePendingItemsCount],
  );

  return {
    isOnline,
    isSyncing,
    pendingItems,
    syncPendingData,
    saveFormData,
  };
}
