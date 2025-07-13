import { useState, useCallback, useEffect } from "react";
import {
  malaffiEmrService,
  MalaffiPatient,
  MalaffiMedicalRecord,
  MalaffiSyncResult,
  MalaffiSearchCriteria,
} from "@/services/malaffi-emr.service";
import {
  executeIntegrationTestSuite,
  getIntegrationTestReports,
} from "@/api/integration-intelligence.api";

export interface RealTimeMonitoringData {
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  lastSyncTime: string | null;
  syncProgress: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
  activeConnections: number;
  queuedOperations: number;
}

export interface IntegrationHealthMetrics {
  overallHealth: "healthy" | "degraded" | "critical";
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  lastHealthCheck: string;
  issues: Array<{
    type: "warning" | "error" | "critical";
    message: string;
    timestamp: string;
  }>;
}

export interface UseMalaffiSyncReturn {
  // State
  isLoading: boolean;
  isSyncing: boolean;
  patient: MalaffiPatient | null;
  medicalRecords: MalaffiMedicalRecord[];
  syncResult: MalaffiSyncResult | null;
  error: string | null;

  // Real-time monitoring
  realTimeData: RealTimeMonitoringData;
  integrationHealth: IntegrationHealthMetrics;
  isMonitoring: boolean;

  // Actions
  searchPatients: (
    criteria: MalaffiSearchCriteria,
  ) => Promise<MalaffiPatient[]>;
  getPatientByEmiratesId: (emiratesId: string) => Promise<void>;
  getMedicalRecords: (
    patientId: string,
    criteria?: Partial<MalaffiSearchCriteria>,
  ) => Promise<void>;
  syncPatientToMalaffi: (patient: Partial<MalaffiPatient>) => Promise<void>;
  createMedicalRecord: (record: Partial<MalaffiMedicalRecord>) => Promise<void>;
  performBidirectionalSync: (
    localPatients: Partial<MalaffiPatient>[],
    localRecords: Partial<MalaffiMedicalRecord>[],
    options?: {
      conflictResolution?: "local_wins" | "remote_wins" | "merge" | "manual";
      batchSize?: number;
      retryAttempts?: number;
      enableRealTimeMonitoring?: boolean;
    },
  ) => Promise<void>;
  resolveConflict: (
    conflictId: string,
    resolution: "use_local" | "use_remote" | "merge",
  ) => Promise<void>;

  // Real-time monitoring actions
  startRealTimeMonitoring: () => void;
  stopRealTimeMonitoring: () => void;
  refreshIntegrationHealth: () => Promise<void>;

  // Integration testing actions
  runIntegrationTests: (suiteId?: string) => Promise<void>;
  getTestResults: () => Promise<any[]>;

  // Error handling
  clearError: () => void;
  resetSync: () => void;
  retryFailedOperations: () => Promise<void>;
}

export const useMalaffiSync = (): UseMalaffiSyncReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [patient, setPatient] = useState<MalaffiPatient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MalaffiMedicalRecord[]>(
    [],
  );
  const [syncResult, setSyncResult] = useState<MalaffiSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time monitoring state
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeMonitoringData>({
    connectionStatus: "disconnected",
    lastSyncTime: null,
    syncProgress: {
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: 0,
    },
    performanceMetrics: {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    },
    activeConnections: 0,
    queuedOperations: 0,
  });

  const [integrationHealth, setIntegrationHealth] =
    useState<IntegrationHealthMetrics>({
      overallHealth: "healthy",
      apiResponseTime: 0,
      errorRate: 0,
      uptime: 100,
      lastHealthCheck: new Date().toISOString(),
      issues: [],
    });

  const [monitoringInterval, setMonitoringInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [failedOperations, setFailedOperations] = useState<
    Array<{
      id: string;
      operation: string;
      data: any;
      error: string;
      timestamp: string;
      retryCount: number;
    }>
  >([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Search patients in Malaffi EMR
  const searchPatients = useCallback(
    async (criteria: MalaffiSearchCriteria): Promise<MalaffiPatient[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const patients = await malaffiEmrService.searchPatients(criteria);
        return patients;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search patients";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Get patient by Emirates ID
  const getPatientByEmiratesId = useCallback(
    async (emiratesId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const foundPatient =
          await malaffiEmrService.getPatientByEmiratesId(emiratesId);
        setPatient(foundPatient);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get patient";
        setError(errorMessage);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Get medical records for a patient
  const getMedicalRecords = useCallback(
    async (
      patientId: string,
      criteria?: Partial<MalaffiSearchCriteria>,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const records = await malaffiEmrService.getPatientMedicalRecords(
          patientId,
          criteria,
        );
        setMedicalRecords(records);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get medical records";
        setError(errorMessage);
        setMedicalRecords([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Sync patient to Malaffi EMR
  const syncPatientToMalaffi = useCallback(
    async (patientData: Partial<MalaffiPatient>): Promise<void> => {
      setIsSyncing(true);
      setError(null);

      try {
        const syncedPatient =
          await malaffiEmrService.syncPatientToMalaffi(patientData);
        setPatient(syncedPatient);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to sync patient";
        setError(errorMessage);
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  // Create medical record in Malaffi EMR
  const createMedicalRecord = useCallback(
    async (recordData: Partial<MalaffiMedicalRecord>): Promise<void> => {
      setIsSyncing(true);
      setError(null);

      try {
        const createdRecord =
          await malaffiEmrService.createMedicalRecord(recordData);
        setMedicalRecords((prev) => [...prev, createdRecord]);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create medical record";
        setError(errorMessage);
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  // Perform bidirectional synchronization with enhanced options
  const performBidirectionalSync = useCallback(
    async (
      localPatients: Partial<MalaffiPatient>[],
      localRecords: Partial<MalaffiMedicalRecord>[],
      options?: {
        conflictResolution?: "local_wins" | "remote_wins" | "merge" | "manual";
        batchSize?: number;
        retryAttempts?: number;
        enableRealTimeMonitoring?: boolean;
      },
    ): Promise<void> => {
      setIsSyncing(true);
      setError(null);

      // Initialize real-time monitoring if enabled
      if (options?.enableRealTimeMonitoring && !isMonitoring) {
        startRealTimeMonitoring();
      }

      // Update sync progress
      setRealTimeData((prev) => ({
        ...prev,
        syncProgress: {
          total: localPatients.length + localRecords.length,
          completed: 0,
          failed: 0,
          inProgress: localPatients.length + localRecords.length,
        },
      }));

      try {
        const result = await malaffiEmrService.performBidirectionalSync(
          localPatients,
          localRecords,
          options,
        );
        setSyncResult(result);

        // Update real-time data with results
        setRealTimeData((prev) => ({
          ...prev,
          lastSyncTime: new Date().toISOString(),
          syncProgress: {
            total: localPatients.length + localRecords.length,
            completed: result.syncedRecords,
            failed: result.errorRecords,
            inProgress: 0,
          },
          performanceMetrics: {
            ...prev.performanceMetrics,
            successRate:
              (result.syncedRecords /
                (localPatients.length + localRecords.length)) *
              100,
            errorRate:
              (result.errorRecords /
                (localPatients.length + localRecords.length)) *
              100,
          },
        }));

        // Store failed operations for retry
        if (result.errors && result.errors.length > 0) {
          const newFailedOps = result.errors.map((error) => ({
            id: `${Date.now()}-${Math.random()}`,
            operation: "sync",
            data: { error },
            error: error.message,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          }));
          setFailedOperations((prev) => [...prev, ...newFailedOps]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to perform bidirectional sync";
        setError(errorMessage);

        // Update error metrics
        setRealTimeData((prev) => ({
          ...prev,
          syncProgress: {
            ...prev.syncProgress,
            failed: prev.syncProgress.total,
            inProgress: 0,
          },
        }));
      } finally {
        setIsSyncing(false);
      }
    },
    [isMonitoring],
  );

  // Resolve sync conflict
  const resolveConflict = useCallback(
    async (
      conflictId: string,
      resolution: "use_local" | "use_remote" | "merge",
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await malaffiEmrService.resolveConflict(conflictId, resolution);
        // Update sync result to remove resolved conflict
        setSyncResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            conflicts:
              prev.conflicts?.filter((c) => c.recordId !== conflictId) || [],
            conflictRecords: Math.max(0, prev.conflictRecords - 1),
          };
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to resolve conflict";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Start real-time monitoring
  const startRealTimeMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setRealTimeData((prev) => ({
      ...prev,
      connectionStatus: "connected",
    }));

    const interval = setInterval(async () => {
      try {
        // Simulate real-time data updates
        const healthData = await refreshIntegrationHealthData();
        setIntegrationHealth(healthData);

        setRealTimeData((prev) => ({
          ...prev,
          connectionStatus: "connected",
          activeConnections: Math.floor(Math.random() * 10) + 1,
          queuedOperations: failedOperations.length,
        }));
      } catch (error) {
        setRealTimeData((prev) => ({
          ...prev,
          connectionStatus: "reconnecting",
        }));
      }
    }, 5000); // Update every 5 seconds

    setMonitoringInterval(interval);
  }, [isMonitoring, failedOperations.length]);

  // Stop real-time monitoring
  const stopRealTimeMonitoring = useCallback(() => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }

    setIsMonitoring(false);
    setRealTimeData((prev) => ({
      ...prev,
      connectionStatus: "disconnected",
    }));
  }, [monitoringInterval]);

  // Refresh integration health
  const refreshIntegrationHealth = useCallback(async (): Promise<void> => {
    try {
      const healthData = await refreshIntegrationHealthData();
      setIntegrationHealth(healthData);
    } catch (error) {
      console.error("Failed to refresh integration health:", error);
    }
  }, []);

  // Helper function to get integration health data
  const refreshIntegrationHealthData =
    async (): Promise<IntegrationHealthMetrics> => {
      // Simulate API call to get health metrics
      const responseTime = 200 + Math.random() * 300;
      const errorRate = Math.random() * 5;
      const uptime = 95 + Math.random() * 5;

      const issues = [];
      if (responseTime > 400) {
        issues.push({
          type: "warning" as const,
          message: "High response time detected",
          timestamp: new Date().toISOString(),
        });
      }
      if (errorRate > 3) {
        issues.push({
          type: "error" as const,
          message: "Elevated error rate",
          timestamp: new Date().toISOString(),
        });
      }

      return {
        overallHealth:
          issues.length === 0
            ? "healthy"
            : issues.some((i) => i.type === "error")
              ? "degraded"
              : "healthy",
        apiResponseTime: responseTime,
        errorRate,
        uptime,
        lastHealthCheck: new Date().toISOString(),
        issues,
      };
    };

  // Run integration tests
  const runIntegrationTests = useCallback(
    async (suiteId?: string): Promise<void> => {
      setIsRunningTests(true);
      setError(null);

      try {
        if (suiteId) {
          await executeIntegrationTestSuite(suiteId);
        } else {
          // Run all available test suites
          const testSuites = [
            "malaffi_integration_tests",
            "daman_integration_tests",
          ];
          for (const suite of testSuites) {
            await executeIntegrationTestSuite(suite);
          }
        }

        // Refresh test results
        await getTestResults();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to run integration tests";
        setError(errorMessage);
      } finally {
        setIsRunningTests(false);
      }
    },
    [],
  );

  // Get test results
  const getTestResults = useCallback(async (): Promise<any[]> => {
    try {
      const results = await getIntegrationTestReports({
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dateTo: new Date().toISOString(),
      });
      setTestResults(results);
      return results;
    } catch (err) {
      console.error("Failed to get test results:", err);
      return [];
    }
  }, []);

  // Retry failed operations
  const retryFailedOperations = useCallback(async (): Promise<void> => {
    if (failedOperations.length === 0) return;

    setIsLoading(true);
    const retriedOperations = [];
    const stillFailedOperations = [];

    for (const operation of failedOperations) {
      try {
        // Retry the operation based on its type
        if (operation.operation === "sync") {
          // Implement retry logic for sync operations
          console.log(`Retrying operation ${operation.id}`);
        }
        retriedOperations.push(operation.id);
      } catch (error) {
        if (operation.retryCount < 3) {
          stillFailedOperations.push({
            ...operation,
            retryCount: operation.retryCount + 1,
          });
        }
      }
    }

    setFailedOperations(stillFailedOperations);
    setIsLoading(false);
  }, [failedOperations]);

  // Reset sync state
  const resetSync = useCallback(() => {
    setPatient(null);
    setMedicalRecords([]);
    setSyncResult(null);
    setError(null);
    setIsLoading(false);
    setIsSyncing(false);
    setFailedOperations([]);

    // Reset real-time data
    setRealTimeData({
      connectionStatus: "disconnected",
      lastSyncTime: null,
      syncProgress: {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: 0,
      },
      performanceMetrics: {
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
      },
      activeConnections: 0,
      queuedOperations: 0,
    });
  }, []);

  // Check authentication status on mount and initialize monitoring
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = malaffiEmrService.getSyncStatus();
        if (!status.isAuthenticated) {
          await malaffiEmrService.authenticate();
        }

        // Initialize integration health monitoring
        await refreshIntegrationHealth();
      } catch (err) {
        console.error("Failed to authenticate with Malaffi EMR:", err);
        setError("Failed to authenticate with Malaffi EMR system");

        setIntegrationHealth((prev) => ({
          ...prev,
          overallHealth: "critical",
          issues: [
            {
              type: "critical",
              message: "Authentication failed",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    };

    checkAuthStatus();

    // Cleanup monitoring on unmount
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval, refreshIntegrationHealth]);

  return {
    // State
    isLoading,
    isSyncing,
    patient,
    medicalRecords,
    syncResult,
    error,

    // Real-time monitoring
    realTimeData,
    integrationHealth,
    isMonitoring,

    // Actions
    searchPatients,
    getPatientByEmiratesId,
    getMedicalRecords,
    syncPatientToMalaffi,
    createMedicalRecord,
    performBidirectionalRefreshCw,
    resolveConflict,

    // Real-time monitoring actions
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    refreshIntegrationHealth,

    // Integration testing actions
    runIntegrationTests,
    getTestResults,

    // Error handling
    clearError,
    resetRefreshCw,
    retryFailedOperations,
  };
};

export default useMalaffiSync;
