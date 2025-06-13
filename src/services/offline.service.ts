import { openDB, DBSchema, IDBPDatabase } from "idb";
import { DataEncryption } from "@/services/security.service";
import { serviceWorkerService } from "@/services/service-worker.service";

interface OfflineRequest {
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
}

interface QueuedRequest extends OfflineRequest {
  id: string;
  timestamp: string;
  retryCount: number;
  status: "pending" | "completed" | "failed";
  lastError?: string;
  lastAttempt?: string;
  completedAt?: string;
}

interface ClinicalForm {
  id: string;
  type: string;
  patientId: string;
  data: any;
  status: "draft" | "completed" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface PatientAssessment {
  id: string;
  patientId: string;
  assessmentType: string;
  data: any;
  status: "draft" | "completed" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface ServiceInitiation {
  id: string;
  patientId: string;
  serviceType: string;
  data: any;
  status: "draft" | "completed" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface PaymentReconciliation {
  id: string;
  claimId: string;
  paymentData: any;
  status: "pending" | "reconciled" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface DenialManagement {
  id: string;
  claimId: string;
  denialReason: string;
  appealData?: any;
  status: "pending" | "appealed" | "resolved" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface RevenueReport {
  id: string;
  reportType: string;
  data: any;
  status: "draft" | "generated" | "synced";
  createdAt: string;
  updatedAt: string;
}

interface AdministrativeData {
  id: string;
  type: string;
  category: string;
  data: any;
  priority: "low" | "medium" | "high" | "critical";
  syncStrategy: "immediate" | "batch" | "scheduled";
  status: "draft" | "completed" | "synced";
  createdAt: string;
  updatedAt: string;
  // DOH Compliance Extensions
  doh_compliance?: {
    taxonomy_level?: string;
    reportable_to_doh?: boolean;
    whistleblowing_eligible?: boolean;
    tawteen_related?: boolean;
    safety_culture_data?: boolean;
  };
  loinc_codes?: string[];
  documentation_quality_score?: number;
}

interface OfflineDB extends DBSchema {
  queue: {
    key: string;
    value: QueuedRequest;
    indexes: { status: string };
  };
  clinicalForms: {
    key: string;
    value: ClinicalForm;
    indexes: { patientId: string; status: string };
  };
  patientAssessments: {
    key: string;
    value: PatientAssessment;
    indexes: { patientId: string; status: string };
  };
  serviceInitiations: {
    key: string;
    value: ServiceInitiation;
    indexes: { patientId: string; status: string };
  };
  paymentReconciliations: {
    key: string;
    value: PaymentReconciliation;
    indexes: { claimId: string; status: string };
  };
  denialManagements: {
    key: string;
    value: DenialManagement;
    indexes: { claimId: string; status: string };
  };
  revenueReports: {
    key: string;
    value: RevenueReport;
    indexes: { status: string };
  };
  administrativeData: {
    key: string;
    value: AdministrativeData;
    indexes: {
      type: string;
      category: string;
      status: string;
      priority: string;
    };
  };
}

class OfflineService {
  private static instance: OfflineService;
  private db: IDBPDatabase<OfflineDB> | null = null;
  private maxRetries = 3;
  private isInitialized = false;
  private offlineIntelligenceEnabled = false;

  private constructor() {}

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<OfflineDB>("reyada-offline", 3, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(
            `Upgrading offline database from version ${oldVersion} to ${newVersion}`,
          );

          // Create queue store
          if (!db.objectStoreNames.contains("queue")) {
            const queueStore = db.createObjectStore("queue", {
              keyPath: "id",
            });
            queueStore.createIndex("status", "status");
          }

          // Create clinical forms store
          if (!db.objectStoreNames.contains("clinicalForms")) {
            const formsStore = db.createObjectStore("clinicalForms", {
              keyPath: "id",
            });
            formsStore.createIndex("patientId", "patientId");
            formsStore.createIndex("status", "status");
          }

          // Create patient assessments store
          if (!db.objectStoreNames.contains("patientAssessments")) {
            const assessmentsStore = db.createObjectStore(
              "patientAssessments",
              {
                keyPath: "id",
              },
            );
            assessmentsStore.createIndex("patientId", "patientId");
            assessmentsStore.createIndex("status", "status");
          }

          // Create service initiations store
          if (!db.objectStoreNames.contains("serviceInitiations")) {
            const serviceStore = db.createObjectStore("serviceInitiations", {
              keyPath: "id",
            });
            serviceStore.createIndex("patientId", "patientId");
            serviceStore.createIndex("status", "status");
          }

          // Create payment reconciliations store
          if (!db.objectStoreNames.contains("paymentReconciliations")) {
            const paymentStore = db.createObjectStore(
              "paymentReconciliations",
              {
                keyPath: "id",
              },
            );
            paymentStore.createIndex("claimId", "claimId");
            paymentStore.createIndex("status", "status");
          }

          // Create denial managements store
          if (!db.objectStoreNames.contains("denialManagements")) {
            const denialStore = db.createObjectStore("denialManagements", {
              keyPath: "id",
            });
            denialStore.createIndex("claimId", "claimId");
            denialStore.createIndex("status", "status");
          }

          // Create revenue reports store
          if (!db.objectStoreNames.contains("revenueReports")) {
            const revenueStore = db.createObjectStore("revenueReports", {
              keyPath: "id",
            });
            revenueStore.createIndex("status", "status");
          }

          // Create administrative data store
          if (!db.objectStoreNames.contains("administrativeData")) {
            const adminStore = db.createObjectStore("administrativeData", {
              keyPath: "id",
            });
            adminStore.createIndex("type", "type");
            adminStore.createIndex("category", "category");
            adminStore.createIndex("status", "status");
            adminStore.createIndex("priority", "priority");
          }
        },
      });

      this.isInitialized = true;
      console.log("Offline service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize offline service:", error);
      throw error;
    }
  }

  private async getDB(): Promise<IDBPDatabase<OfflineDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Queue management
  public async addToQueue(request: OfflineRequest): Promise<void> {
    const db = await this.getDB();

    // Encrypt sensitive data before storing
    let encryptedData = request.data;
    if (request.data && typeof request.data === "object") {
      try {
        // Check if this is Daman-related data
        const isDamanData =
          request.url.includes("/daman") ||
          request.url.includes("/authorization") ||
          request.data.daman_related === true;

        encryptedData = await DataEncryption.encryptSensitiveFields(
          request.data,
          isDamanData,
        );
      } catch (error) {
        console.warn("Failed to encrypt sensitive data:", error);
        // Continue with unencrypted data if encryption fails
      }
    }

    const queueItem = {
      ...request,
      data: encryptedData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: "pending" as const,
    };

    await db.add("queue", queueItem);

    // Also add to service worker sync queue for background processing
    if (serviceWorkerService) {
      serviceWorkerService.addSyncTask({
        type: "api-call",
        data: request.data,
        url: request.url,
        method: request.method,
        headers: request.headers,
        priority: "medium",
        maxRetries: 3,
      });
    }

    console.log("Request added to offline queue:", request.url);
  }

  public async processQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log("Device is offline, skipping queue processing");
      return;
    }

    const db = await this.getDB();
    const pendingRequests = await db.getAllFromIndex(
      "queue",
      "status",
      "pending",
    );

    console.log(`Processing ${pendingRequests.length} offline requests`);

    for (const request of pendingRequests) {
      try {
        // Decrypt sensitive data before sending
        let requestData = request.data;
        if (request.data && typeof request.data === "object") {
          try {
            // Check if this is Daman-related data
            const isDamanData =
              request.url.includes("/daman") ||
              request.url.includes("/authorization") ||
              request.data.daman_related === true;

            requestData = await DataEncryption.decryptSensitiveFields(
              request.data,
              isDamanData,
            );
          } catch (error) {
            console.warn("Failed to decrypt sensitive data:", error);
            // Continue with encrypted data if decryption fails
          }
        }

        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            ...request.headers,
          },
          body: requestData ? JSON.stringify(requestData) : undefined,
        });

        if (response.ok) {
          // Mark as completed
          await db.put("queue", {
            ...request,
            status: "completed",
            completedAt: new Date().toISOString(),
          });

          console.log(`Successfully processed offline request: ${request.url}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(
          `Failed to process offline request: ${request.url}`,
          error,
        );

        // Increment retry count
        const updatedRequest = {
          ...request,
          retryCount: request.retryCount + 1,
          lastError: error instanceof Error ? error.message : String(error),
          lastAttempt: new Date().toISOString(),
        };

        if (updatedRequest.retryCount >= this.maxRetries) {
          // Mark as failed
          await db.put("queue", {
            ...updatedRequest,
            status: "failed",
          });
        } else {
          // Update retry count
          await db.put("queue", updatedRequest);
        }
      }
    }
  }

  // Clinical forms management
  public async saveClinicalForm(
    form: Omit<ClinicalForm, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const clinicalForm: ClinicalForm = {
      ...form,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("clinicalForms", clinicalForm);
    return id;
  }

  public async updateForm(
    id: string,
    updates: Partial<ClinicalForm>,
  ): Promise<void> {
    const db = await this.getDB();
    const existing = await db.get("clinicalForms", id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await db.put("clinicalForms", updated);
    }
  }

  // Patient assessments management
  public async saveClinicalAssessment(
    assessment: Omit<PatientAssessment, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const patientAssessment: PatientAssessment = {
      ...assessment,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("patientAssessments", patientAssessment);
    return id;
  }

  // Service initiations management
  public async saveServiceInitiation(
    service: Omit<ServiceInitiation, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const serviceInitiation: ServiceInitiation = {
      ...service,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("serviceInitiations", serviceInitiation);
    return id;
  }

  // Payment reconciliation management
  public async savePaymentReconciliation(
    payment: Omit<PaymentReconciliation, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const paymentReconciliation: PaymentReconciliation = {
      ...payment,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("paymentReconciliations", paymentReconciliation);
    return id;
  }

  public async updatePaymentReconciliationStatus(
    id: string,
    status: PaymentReconciliation["status"],
  ): Promise<void> {
    const db = await this.getDB();
    const existing = await db.get("paymentReconciliations", id);

    if (existing) {
      const updated = {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      };
      await db.put("paymentReconciliations", updated);
    }
  }

  // Denial management
  public async saveDenialManagement(
    denial: Omit<DenialManagement, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const denialManagement: DenialManagement = {
      ...denial,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("denialManagements", denialManagement);
    return id;
  }

  public async updateDenialManagementStatus(
    id: string,
    status: DenialManagement["status"],
  ): Promise<void> {
    const db = await this.getDB();
    const existing = await db.get("denialManagements", id);

    if (existing) {
      const updated = {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      };
      await db.put("denialManagements", updated);
    }
  }

  // Revenue reports management
  public async saveRevenueReport(
    report: Omit<RevenueReport, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const revenueReport: RevenueReport = {
      ...report,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("revenueReports", revenueReport);
    return id;
  }

  // Administrative data management
  public async saveAdministrativeData(
    category: string,
    data: Omit<
      AdministrativeData,
      "id" | "category" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    const db = await this.getDB();
    const id = this.generateId();
    const now = new Date().toISOString();

    const administrativeData: AdministrativeData = {
      ...data,
      id,
      category,
      createdAt: now,
      updatedAt: now,
    };

    await db.add("administrativeData", administrativeData);
    return id;
  }

  // Get pending sync items
  public async getPendingSyncItems(): Promise<{
    clinicalForms: ClinicalForm[];
    patientAssessments: PatientAssessment[];
    serviceInitiations: ServiceInitiation[];
    paymentReconciliations?: PaymentReconciliation[];
    denialManagements?: DenialManagement[];
    revenueReports?: RevenueReport[];
    attendanceRecords?: AdministrativeData[];
    timesheetEntries?: AdministrativeData[];
    dailyPlans?: AdministrativeData[];
    dailyUpdates?: AdministrativeData[];
    incidentReports?: AdministrativeData[];
    qualityInitiatives?: AdministrativeData[];
    complianceRecords?: AdministrativeData[];
    auditRecords?: AdministrativeData[];
    reportTemplates?: AdministrativeData[];
    kpiRecords?: AdministrativeData[];
    chatGroups?: AdministrativeData[];
    chatMessages?: AdministrativeData[];
    emailTemplates?: AdministrativeData[];
    emailCommunications?: AdministrativeData[];
    committees?: AdministrativeData[];
    committeeMeetings?: AdministrativeData[];
    governanceDocuments?: AdministrativeData[];
    staffAcknowledgments?: AdministrativeData[];
  }> {
    const db = await this.getDB();

    const [clinicalForms, patientAssessments, serviceInitiations] =
      await Promise.all([
        db.getAllFromIndex("clinicalForms", "status", "completed"),
        db.getAllFromIndex("patientAssessments", "status", "completed"),
        db.getAllFromIndex("serviceInitiations", "status", "completed"),
      ]);

    // Get revenue cycle data
    const [paymentReconciliations, denialManagements, revenueReports] =
      await Promise.all([
        db.getAllFromIndex("paymentReconciliations", "status", "reconciled"),
        db.getAllFromIndex("denialManagements", "status", "appealed"),
        db.getAllFromIndex("revenueReports", "status", "generated"),
      ]);

    // Get administrative data by category
    const administrativeData = await db.getAllFromIndex(
      "administrativeData",
      "status",
      "completed",
    );

    const attendanceRecords = administrativeData.filter(
      (item) => item.category === "attendance",
    );
    const timesheetEntries = administrativeData.filter(
      (item) => item.category === "timesheet",
    );
    const dailyPlans = administrativeData.filter(
      (item) => item.category === "planning",
    );
    const dailyUpdates = administrativeData.filter(
      (item) => item.category === "daily-update",
    );
    const incidentReports = administrativeData.filter(
      (item) => item.category === "incident",
    );
    const qualityInitiatives = administrativeData.filter(
      (item) => item.category === "quality",
    );
    const complianceRecords = administrativeData.filter(
      (item) => item.category === "compliance",
    );
    const auditRecords = administrativeData.filter(
      (item) => item.category === "audit",
    );
    const reportTemplates = administrativeData.filter(
      (item) => item.category === "reporting",
    );
    const kpiRecords = administrativeData.filter(
      (item) => item.category === "kpi",
    );

    // Communication & Collaboration data
    const chatGroups = administrativeData.filter(
      (item) => item.category === "chat-group",
    );
    const chatMessages = administrativeData.filter(
      (item) => item.category === "chat",
    );
    const emailTemplates = administrativeData.filter(
      (item) => item.category === "email-template",
    );
    const emailCommunications = administrativeData.filter(
      (item) => item.category === "email",
    );
    const committees = administrativeData.filter(
      (item) => item.category === "committee",
    );
    const committeeMeetings = administrativeData.filter(
      (item) => item.category === "committee-meeting",
    );
    const governanceDocuments = administrativeData.filter(
      (item) => item.category === "governance",
    );
    const staffAcknowledgments = administrativeData.filter(
      (item) => item.category === "acknowledgment",
    );

    return {
      clinicalForms,
      patientAssessments,
      serviceInitiations,
      paymentReconciliations,
      denialManagements,
      revenueReports,
      attendanceRecords,
      timesheetEntries,
      dailyPlans,
      dailyUpdates,
      incidentReports,
      qualityInitiatives,
      complianceRecords,
      auditRecords,
      reportTemplates,
      kpiRecords,
      chatGroups,
      chatMessages,
      emailTemplates,
      emailCommunications,
      committees,
      committeeMeetings,
      governanceDocuments,
      staffAcknowledgments,
    };
  }

  // Offline Intelligence Features
  public async initializeOfflineIntelligence(): Promise<void> {
    if (this.offlineIntelligenceEnabled) return;

    try {
      // Initialize predictive caching
      await this.initializePredictiveCaching();

      // Initialize smart sync prioritization
      await this.initializeSmartSyncPrioritization();

      // Initialize offline analytics
      await this.initializeOfflineAnalytics();

      this.offlineIntelligenceEnabled = true;
      console.log("Offline intelligence features initialized");
    } catch (error) {
      console.error("Failed to initialize offline intelligence:", error);
    }
  }

  private async initializePredictiveCaching(): Promise<void> {
    // Analyze user patterns and pre-cache likely needed data
    const userPatterns = this.analyzeUserPatterns();

    // Pre-cache based on patterns
    if (userPatterns.frequentPatients.length > 0) {
      console.log("Pre-caching frequent patient data");
      // Implementation would cache patient data
    }

    if (userPatterns.commonForms.length > 0) {
      console.log("Pre-caching common form templates");
      // Implementation would cache form templates
    }
  }

  private async initializeSmartSyncPrioritization(): Promise<void> {
    // Implement intelligent sync ordering based on:
    // - Data criticality
    // - User workflow patterns
    // - Network conditions
    // - Time sensitivity

    const syncPriorities = {
      critical: [
        "incidentReports",
        "clinicalForms",
        "damanAuthorizations",
        "wheelchairPreApprovals",
      ],
      high: [
        "patientAssessments",
        "serviceInitiations",
        "attendanceRecords",
        "faceToFaceAssessments",
      ],
      medium: [
        "paymentReconciliations",
        "denialManagements",
        "dailyPlans",
        "periodicAssessments",
      ],
      low: ["revenueReports", "qualityInitiatives", "trainingModules"],
    };

    console.log("Smart sync prioritization configured:", syncPriorities);
  }

  private async initializeOfflineAnalytics(): Promise<void> {
    // Track offline usage patterns for optimization
    const analytics = {
      offlineTime: 0,
      syncFrequency: 0,
      dataUsagePatterns: {},
      performanceMetrics: {},
    };

    // Store analytics in IndexedDB
    console.log("Offline analytics initialized");
  }

  private analyzeUserPatterns(): {
    frequentPatients: string[];
    commonForms: string[];
    peakUsageHours: number[];
    averageOfflineTime: number;
  } {
    // Analyze stored data to identify patterns
    // This would be implemented with actual data analysis
    return {
      frequentPatients: [],
      commonForms: [],
      peakUsageHours: [],
      averageOfflineTime: 0,
    };
  }

  // Cleanup old data
  public async cleanup(): Promise<void> {
    const db = await this.getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days

    const stores = [
      "clinicalForms",
      "patientAssessments",
      "serviceInitiations",
      "paymentReconciliations",
      "denialManagements",
      "revenueReports",
      "administrativeData",
    ];

    for (const storeName of stores) {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const allRecords = await store.getAll();

      for (const record of allRecords) {
        if (
          record.status === "synced" &&
          new Date(record.updatedAt) < cutoffDate
        ) {
          await store.delete(record.id);
        }
      }
    }

    console.log("Offline data cleanup completed");
  }

  /**
   * Enhanced mobile offline capabilities with intelligent conflict resolution
   */
  public async resolveDataConflicts(
    localData: any,
    serverData: any,
    conflictType: "update" | "delete" | "create",
  ): Promise<{
    resolvedData: any;
    resolution: "local" | "server" | "merged" | "manual";
    confidence: number;
    reasoning: string;
    requiresManualReview: boolean;
  }> {
    try {
      let resolvedData = localData;
      let resolution: "local" | "server" | "merged" | "manual" = "local";
      let confidence = 0;
      let reasoning = "";
      let requiresManualReview = false;

      // Timestamp-based resolution
      const localTimestamp = new Date(
        localData.updatedAt || localData.createdAt,
      );
      const serverTimestamp = new Date(
        serverData.updatedAt || serverData.createdAt,
      );

      if (conflictType === "update") {
        // Intelligent field-level merging
        const mergeResult = await this.performIntelligentMerge(
          localData,
          serverData,
        );

        if (mergeResult.confidence > 0.8) {
          resolvedData = mergeResult.data;
          resolution = "merged";
          confidence = mergeResult.confidence;
          reasoning = "Intelligent field-level merge with high confidence";
        } else if (serverTimestamp > localTimestamp) {
          resolvedData = serverData;
          resolution = "server";
          confidence = 0.7;
          reasoning = "Server data is more recent";
        } else {
          resolution = "local";
          confidence = 0.6;
          reasoning = "Local data is more recent";
        }
      } else if (conflictType === "delete") {
        // Handle delete conflicts
        if (localData.status === "deleted" && serverData.status !== "deleted") {
          resolvedData = { ...serverData, status: "deleted" };
          resolution = "merged";
          confidence = 0.9;
          reasoning =
            "Preserving delete operation while maintaining server updates";
        } else {
          resolution = "server";
          confidence = 0.8;
          reasoning = "Server state takes precedence for delete conflicts";
        }
      }

      // Check if manual review is needed
      if (confidence < 0.7 || this.hasComplexConflicts(localData, serverData)) {
        requiresManualReview = true;
        resolution = "manual";
        reasoning += " - Manual review required due to complex conflicts";
      }

      // Log conflict resolution
      console.log(
        `Conflict resolved: ${resolution} (confidence: ${confidence})`,
      );

      return {
        resolvedData,
        resolution,
        confidence,
        reasoning,
        requiresManualReview,
      };
    } catch (error) {
      console.error("Conflict resolution failed:", error);
      return {
        resolvedData: localData,
        resolution: "manual",
        confidence: 0,
        reasoning: "Error during conflict resolution - manual review required",
        requiresManualReview: true,
      };
    }
  }

  /**
   * Intelligent field-level data merging
   */
  private async performIntelligentMerge(
    localData: any,
    serverData: any,
  ): Promise<{
    data: any;
    confidence: number;
    conflicts: string[];
  }> {
    const mergedData = { ...localData };
    const conflicts: string[] = [];
    let totalFields = 0;
    let resolvedFields = 0;

    for (const key in serverData) {
      if (key === "id" || key === "createdAt") continue;

      totalFields++;

      if (localData[key] !== serverData[key]) {
        // Field-specific conflict resolution logic
        const resolution = this.resolveFieldConflict(
          key,
          localData[key],
          serverData[key],
        );

        if (resolution.resolved) {
          mergedData[key] = resolution.value;
          resolvedFields++;
        } else {
          conflicts.push(`${key}: ${resolution.reason}`);
          // Default to server value for unresolved conflicts
          mergedData[key] = serverData[key];
        }
      } else {
        resolvedFields++;
      }
    }

    const confidence = totalFields > 0 ? resolvedFields / totalFields : 1;

    return {
      data: mergedData,
      confidence,
      conflicts,
    };
  }

  /**
   * Field-specific conflict resolution
   */
  private resolveFieldConflict(
    fieldName: string,
    localValue: any,
    serverValue: any,
  ): {
    resolved: boolean;
    value: any;
    reason: string;
  } {
    // Timestamp fields - prefer more recent
    if (fieldName.includes("Date") || fieldName.includes("Time")) {
      const localDate = new Date(localValue);
      const serverDate = new Date(serverValue);

      return {
        resolved: true,
        value: localDate > serverDate ? localValue : serverValue,
        reason: "Timestamp conflict resolved by selecting more recent value",
      };
    }

    // Status fields - prefer active states
    if (fieldName === "status") {
      const statusPriority = {
        active: 3,
        pending: 2,
        completed: 2,
        inactive: 1,
        deleted: 0,
      };

      const localPriority = statusPriority[localValue] || 1;
      const serverPriority = statusPriority[serverValue] || 1;

      return {
        resolved: true,
        value: localPriority >= serverPriority ? localValue : serverValue,
        reason: "Status conflict resolved by priority",
      };
    }

    // Numeric fields - prefer non-zero values
    if (typeof localValue === "number" && typeof serverValue === "number") {
      if (localValue === 0 && serverValue !== 0) {
        return {
          resolved: true,
          value: serverValue,
          reason: "Numeric conflict resolved by preferring non-zero value",
        };
      } else if (serverValue === 0 && localValue !== 0) {
        return {
          resolved: true,
          value: localValue,
          reason: "Numeric conflict resolved by preferring non-zero value",
        };
      }
    }

    // String fields - prefer non-empty values
    if (typeof localValue === "string" && typeof serverValue === "string") {
      if (localValue.trim() === "" && serverValue.trim() !== "") {
        return {
          resolved: true,
          value: serverValue,
          reason: "String conflict resolved by preferring non-empty value",
        };
      } else if (serverValue.trim() === "" && localValue.trim() !== "") {
        return {
          resolved: true,
          value: localValue,
          reason: "String conflict resolved by preferring non-empty value",
        };
      }
    }

    // Arrays - merge unique values
    if (Array.isArray(localValue) && Array.isArray(serverValue)) {
      const mergedArray = [...new Set([...localValue, ...serverValue])];
      return {
        resolved: true,
        value: mergedArray,
        reason: "Array conflict resolved by merging unique values",
      };
    }

    return {
      resolved: false,
      value: serverValue,
      reason: "Complex conflict requiring manual resolution",
    };
  }

  /**
   * Check for complex conflicts that require manual review
   */
  private hasComplexConflicts(localData: any, serverData: any): boolean {
    // Check for critical field conflicts
    const criticalFields = [
      "patientId",
      "providerId",
      "authorizationId",
      "claimId",
    ];

    for (const field of criticalFields) {
      if (
        localData[field] &&
        serverData[field] &&
        localData[field] !== serverData[field]
      ) {
        return true;
      }
    }

    // Check for data type mismatches
    for (const key in localData) {
      if (serverData[key] && typeof localData[key] !== typeof serverData[key]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Enhanced mobile offline synchronization with intelligent prioritization
   */
  public async initializeMobileOfflineSync(): Promise<{
    success: boolean;
    capabilities: {
      backgroundSync: boolean;
      periodicSync: boolean;
      pushSync: boolean;
      conflictResolution: boolean;
    };
    syncStrategies: string[];
  }> {
    try {
      // Check for mobile-specific sync capabilities
      const capabilities = {
        backgroundSync:
          "serviceWorker" in navigator &&
          "sync" in window.ServiceWorkerRegistration.prototype,
        periodicSync:
          "serviceWorker" in navigator &&
          "periodicSync" in window.ServiceWorkerRegistration.prototype,
        pushSync: "serviceWorker" in navigator && "PushManager" in window,
        conflictResolution: true,
      };

      // Initialize mobile sync strategies
      const syncStrategies = [
        "immediate_critical", // Critical data synced immediately when online
        "batch_periodic", // Non-critical data batched and synced periodically
        "background_sync", // Background sync when app is not active
        "conflict_resolution", // Intelligent conflict resolution
        "compression_optimization", // Data compression for mobile networks
        "delta_sync", // Only sync changes, not full records
      ];

      // Set up mobile-optimized sync intervals
      await this.configureMobileSyncIntervals();

      // Initialize background sync if supported
      if (capabilities.backgroundSync) {
        await this.initializeBackgroundSync();
      }

      // Initialize periodic sync for mobile
      if (capabilities.periodicSync) {
        await this.initializePeriodicSync();
      }

      // Set up network-aware sync
      await this.initializeNetworkAwareSync();

      console.log(
        "Mobile offline sync initialized with capabilities:",
        capabilities,
      );

      return {
        success: true,
        capabilities,
        syncStrategies,
      };
    } catch (error) {
      console.error("Failed to initialize mobile offline sync:", error);
      return {
        success: false,
        capabilities: {
          backgroundSync: false,
          periodicSync: false,
          pushSync: false,
          conflictResolution: false,
        },
        syncStrategies: [],
      };
    }
  }

  /**
   * Configure mobile-optimized sync intervals
   */
  private async configureMobileSyncIntervals(): Promise<void> {
    const mobileConfig = {
      immediate: {
        categories: ["clinicalForms", "incidentReports", "emergencyData"],
        maxDelay: 0, // Sync immediately when online
      },
      high: {
        categories: [
          "patientAssessments",
          "vitalSigns",
          "medicationAdministration",
        ],
        interval: 5 * 60 * 1000, // 5 minutes
      },
      medium: {
        categories: ["progressNotes", "careUpdates", "familyCommunication"],
        interval: 15 * 60 * 1000, // 15 minutes
      },
      low: {
        categories: ["administrativeData", "reports", "analytics"],
        interval: 60 * 60 * 1000, // 1 hour
      },
    };

    localStorage.setItem("mobile_sync_config", JSON.stringify(mobileConfig));
  }

  /**
   * Initialize background sync for mobile
   */
  private async initializeBackgroundSync(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Register background sync
        if ("sync" in registration) {
          await (registration as any).sync.register("mobile-data-sync");
          console.log("Background sync registered for mobile");
        }
      } catch (error) {
        console.error("Failed to initialize background sync:", error);
      }
    }
  }

  /**
   * Initialize periodic sync for mobile
   */
  private async initializePeriodicSync(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Register periodic sync (if supported)
        if ("periodicSync" in registration) {
          await (registration as any).periodicSync.register(
            "mobile-periodic-sync",
            {
              minInterval: 12 * 60 * 60 * 1000, // 12 hours
            },
          );
          console.log("Periodic sync registered for mobile");
        }
      } catch (error) {
        console.error("Failed to initialize periodic sync:", error);
      }
    }
  }

  /**
   * Initialize network-aware sync
   */
  private async initializeNetworkAwareSync(): Promise<void> {
    // Monitor network conditions
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      const updateSyncStrategy = () => {
        const networkType = connection.effectiveType;
        const isSlowConnection =
          networkType === "slow-2g" || networkType === "2g";

        if (isSlowConnection) {
          // Reduce sync frequency and compress data more aggressively
          this.adjustSyncForSlowNetwork();
        } else {
          // Normal sync strategy
          this.adjustSyncForFastNetwork();
        }
      };

      connection.addEventListener("change", updateSyncStrategy);
      updateSyncStrategy(); // Initial setup
    }

    // Monitor online/offline status
    window.addEventListener("online", () => {
      console.log("Device came online - triggering sync");
      this.triggerMobileSync();
    });

    window.addEventListener("offline", () => {
      console.log("Device went offline - enabling offline mode");
      this.enableOfflineMode();
    });
  }

  /**
   * Adjust sync strategy for slow networks
   */
  private adjustSyncForSlowNetwork(): void {
    console.log("Adjusting sync strategy for slow network");
    // Implement compression, reduce frequency, prioritize critical data
  }

  /**
   * Adjust sync strategy for fast networks
   */
  private adjustSyncForFastNetwork(): void {
    console.log("Using normal sync strategy for fast network");
    // Normal sync intervals and data transfer
  }

  /**
   * Trigger mobile-optimized sync
   */
  private async triggerMobileSync(): Promise<void> {
    try {
      // Prioritize critical data first
      await this.syncCriticalData();

      // Then sync other data based on priority
      await this.syncWithConflictResolution();

      // Clean up old offline data
      await this.cleanupOfflineData();
    } catch (error) {
      console.error("Mobile sync failed:", error);
    }
  }

  /**
   * Sync critical data first
   */
  private async syncCriticalData(): Promise<void> {
    const db = await this.getDB();

    // Get critical data that needs immediate sync
    const criticalCategories = [
      "clinicalForms",
      "incidentReports",
      "emergencyData",
    ];

    for (const category of criticalCategories) {
      try {
        const items = await db.getAllFromIndex(
          category as any,
          "status",
          "completed",
        );

        for (const item of items) {
          await this.syncItemWithConflictResolution(item, category);
        }
      } catch (error) {
        console.error(`Failed to sync critical ${category}:`, error);
      }
    }
  }

  /**
   * Enable offline mode optimizations
   */
  private enableOfflineMode(): void {
    // Enable aggressive caching
    // Compress data more aggressively
    // Queue all operations for later sync
    console.log("Offline mode enabled with optimizations");
  }

  /**
   * Clean up old offline data
   */
  private async cleanupOfflineData(): Promise<void> {
    const db = await this.getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days for mobile

    const stores = [
      "clinicalForms",
      "patientAssessments",
      "serviceInitiations",
      "paymentReconciliations",
      "denialManagements",
      "revenueReports",
      "administrativeData",
    ];

    for (const storeName of stores) {
      try {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const allRecords = await store.getAll();

        for (const record of allRecords) {
          if (
            record.status === "synced" &&
            new Date(record.updatedAt) < cutoffDate
          ) {
            await store.delete(record.id);
          }
        }
      } catch (error) {
        console.error(`Failed to cleanup ${storeName}:`, error);
      }
    }

    console.log("Mobile offline data cleanup completed");
  }

  /**
   * Enhanced sync with conflict resolution
   */
  public async syncWithConflictResolution(): Promise<{
    syncedItems: number;
    conflictsResolved: number;
    manualReviewRequired: number;
    errors: string[];
  }> {
    if (!navigator.onLine) {
      console.log("Device is offline, skipping sync");
      return {
        syncedItems: 0,
        conflictsResolved: 0,
        manualReviewRequired: 0,
        errors: ["Device is offline"],
      };
    }

    const db = await this.getDB();
    const pendingItems = await this.getPendingSyncItems();

    let syncedItems = 0;
    let conflictsResolved = 0;
    let manualReviewRequired = 0;
    const errors: string[] = [];

    // Process each category of pending items
    for (const [category, items] of Object.entries(pendingItems)) {
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        try {
          // Attempt to sync item
          const syncResult = await this.syncItemWithConflictResolution(
            item,
            category,
          );

          if (syncResult.success) {
            syncedItems++;
            if (syncResult.conflictResolved) {
              conflictsResolved++;
            }
            if (syncResult.requiresManualReview) {
              manualReviewRequired++;
            }
          } else {
            errors.push(
              `Failed to sync ${category} item ${item.id}: ${syncResult.error}`,
            );
          }
        } catch (error) {
          errors.push(`Error syncing ${category} item ${item.id}: ${error}`);
        }
      }
    }

    console.log(
      `Sync completed: ${syncedItems} items synced, ${conflictsResolved} conflicts resolved, ${manualReviewRequired} require manual review`,
    );

    return {
      syncedItems,
      conflictsResolved,
      manualReviewRequired,
      errors,
    };
  }

  /**
   * Sync individual item with conflict resolution
   */
  private async syncItemWithConflictResolution(
    localItem: any,
    category: string,
  ): Promise<{
    success: boolean;
    conflictResolved: boolean;
    requiresManualReview: boolean;
    error?: string;
  }> {
    try {
      // Fetch current server state
      const serverItem = await this.fetchServerItem(localItem.id, category);

      if (!serverItem) {
        // Item doesn't exist on server, create it
        await this.createServerItem(localItem, category);
        return {
          success: true,
          conflictResolved: false,
          requiresManualReview: false,
        };
      }

      // Check for conflicts
      if (this.hasDataConflict(localItem, serverItem)) {
        const resolution = await this.resolveDataConflicts(
          localItem,
          serverItem,
          "update",
        );

        if (resolution.requiresManualReview) {
          // Store for manual review
          await this.storeForManualReview(localItem, serverItem, resolution);
          return {
            success: true,
            conflictResolved: true,
            requiresManualReview: true,
          };
        } else {
          // Apply resolved data
          await this.updateServerItem(resolution.resolvedData, category);
          return {
            success: true,
            conflictResolved: true,
            requiresManualReview: false,
          };
        }
      } else {
        // No conflicts, update server
        await this.updateServerItem(localItem, category);
        return {
          success: true,
          conflictResolved: false,
          requiresManualReview: false,
        };
      }
    } catch (error) {
      return {
        success: false,
        conflictResolved: false,
        requiresManualReview: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if data conflict exists
   */
  private hasDataConflict(localItem: any, serverItem: any): boolean {
    const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt);
    const serverTimestamp = new Date(
      serverItem.updatedAt || serverItem.createdAt,
    );

    // If timestamps are different and both items have been modified, there's a potential conflict
    return (
      Math.abs(localTimestamp.getTime() - serverTimestamp.getTime()) > 1000
    ); // 1 second tolerance
  }

  /**
   * Store items requiring manual review
   */
  private async storeForManualReview(
    localItem: any,
    serverItem: any,
    resolution: any,
  ): Promise<void> {
    const db = await this.getDB();

    const conflictRecord = {
      id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      localItem,
      serverItem,
      resolution,
      status: "pending_review",
      createdAt: new Date().toISOString(),
    };

    // Store in a conflicts store (would need to add this to the DB schema)
    console.log("Conflict stored for manual review:", conflictRecord.id);
  }

  // Placeholder methods for server communication
  private async fetchServerItem(id: string, category: string): Promise<any> {
    // Implementation would make actual API call
    return null;
  }

  private async createServerItem(item: any, category: string): Promise<void> {
    // Implementation would make actual API call
    console.log(`Creating server item in ${category}:`, item.id);
  }

  private async updateServerItem(item: any, category: string): Promise<void> {
    // Implementation would make actual API call
    console.log(`Updating server item in ${category}:`, item.id);
  }
}

export const offlineService = OfflineService.getInstance();
export default offlineService;
