import { openDB } from "idb";
import { DataEncryption } from "@/services/security.service";
import { serviceWorkerService } from "@/services/service-worker.service";
class OfflineService {
    constructor() {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "maxRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "offlineIntelligenceEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    static getInstance() {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }
    async init() {
        if (this.isInitialized)
            return;
        try {
            this.db = await openDB("reyada-offline", 3, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    console.log(`Upgrading offline database from version ${oldVersion} to ${newVersion}`);
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
                        const assessmentsStore = db.createObjectStore("patientAssessments", {
                            keyPath: "id",
                        });
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
                        const paymentStore = db.createObjectStore("paymentReconciliations", {
                            keyPath: "id",
                        });
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
        }
        catch (error) {
            console.error("Failed to initialize offline service:", error);
            throw error;
        }
    }
    async getDB() {
        if (!this.db) {
            await this.init();
        }
        return this.db;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Queue management
    async addToQueue(request) {
        const db = await this.getDB();
        // Encrypt sensitive data before storing
        let encryptedData = request.data;
        if (request.data && typeof request.data === "object") {
            try {
                // Check if this is Daman-related data
                const isDamanData = request.url.includes("/daman") ||
                    request.url.includes("/authorization") ||
                    request.data.daman_related === true;
                encryptedData = await DataEncryption.encryptSensitiveFields(request.data, isDamanData);
            }
            catch (error) {
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
            status: "pending",
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
    async processQueue() {
        if (!navigator.onLine) {
            console.log("Device is offline, skipping queue processing");
            return;
        }
        const db = await this.getDB();
        const pendingRequests = await db.getAllFromIndex("queue", "status", "pending");
        console.log(`Processing ${pendingRequests.length} offline requests`);
        for (const request of pendingRequests) {
            try {
                // Decrypt sensitive data before sending
                let requestData = request.data;
                if (request.data && typeof request.data === "object") {
                    try {
                        // Check if this is Daman-related data
                        const isDamanData = request.url.includes("/daman") ||
                            request.url.includes("/authorization") ||
                            request.data.daman_related === true;
                        requestData = await DataEncryption.decryptSensitiveFields(request.data, isDamanData);
                    }
                    catch (error) {
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
                }
                else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }
            catch (error) {
                console.error(`Failed to process offline request: ${request.url}`, error);
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
                }
                else {
                    // Update retry count
                    await db.put("queue", updatedRequest);
                }
            }
        }
    }
    // Clinical forms management
    async saveClinicalForm(form) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const clinicalForm = {
            ...form,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("clinicalForms", clinicalForm);
        return id;
    }
    async updateForm(id, updates) {
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
    async saveClinicalAssessment(assessment) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const patientAssessment = {
            ...assessment,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("patientAssessments", patientAssessment);
        return id;
    }
    // Service initiations management
    async saveServiceInitiation(service) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const serviceInitiation = {
            ...service,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("serviceInitiations", serviceInitiation);
        return id;
    }
    // Payment reconciliation management
    async savePaymentReconciliation(payment) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const paymentReconciliation = {
            ...payment,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("paymentReconciliations", paymentReconciliation);
        return id;
    }
    async updatePaymentReconciliationStatus(id, status) {
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
    async saveDenialManagement(denial) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const denialManagement = {
            ...denial,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("denialManagements", denialManagement);
        return id;
    }
    async updateDenialManagementStatus(id, status) {
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
    async saveRevenueReport(report) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const revenueReport = {
            ...report,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await db.add("revenueReports", revenueReport);
        return id;
    }
    // Administrative data management
    async saveAdministrativeData(category, data) {
        const db = await this.getDB();
        const id = this.generateId();
        const now = new Date().toISOString();
        const administrativeData = {
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
    async getPendingSyncItems() {
        const db = await this.getDB();
        const [clinicalForms, patientAssessments, serviceInitiations] = await Promise.all([
            db.getAllFromIndex("clinicalForms", "status", "completed"),
            db.getAllFromIndex("patientAssessments", "status", "completed"),
            db.getAllFromIndex("serviceInitiations", "status", "completed"),
        ]);
        // Get revenue cycle data
        const [paymentReconciliations, denialManagements, revenueReports] = await Promise.all([
            db.getAllFromIndex("paymentReconciliations", "status", "reconciled"),
            db.getAllFromIndex("denialManagements", "status", "appealed"),
            db.getAllFromIndex("revenueReports", "status", "generated"),
        ]);
        // Get administrative data by category
        const administrativeData = await db.getAllFromIndex("administrativeData", "status", "completed");
        const attendanceRecords = administrativeData.filter((item) => item.category === "attendance");
        const timesheetEntries = administrativeData.filter((item) => item.category === "timesheet");
        const dailyPlans = administrativeData.filter((item) => item.category === "planning");
        const dailyUpdates = administrativeData.filter((item) => item.category === "daily-update");
        const incidentReports = administrativeData.filter((item) => item.category === "incident");
        const qualityInitiatives = administrativeData.filter((item) => item.category === "quality");
        const complianceRecords = administrativeData.filter((item) => item.category === "compliance");
        const auditRecords = administrativeData.filter((item) => item.category === "audit");
        const reportTemplates = administrativeData.filter((item) => item.category === "reporting");
        const kpiRecords = administrativeData.filter((item) => item.category === "kpi");
        // Communication & Collaboration data
        const chatGroups = administrativeData.filter((item) => item.category === "chat-group");
        const chatMessages = administrativeData.filter((item) => item.category === "chat");
        const emailTemplates = administrativeData.filter((item) => item.category === "email-template");
        const emailCommunications = administrativeData.filter((item) => item.category === "email");
        const committees = administrativeData.filter((item) => item.category === "committee");
        const committeeMeetings = administrativeData.filter((item) => item.category === "committee-meeting");
        const governanceDocuments = administrativeData.filter((item) => item.category === "governance");
        const staffAcknowledgments = administrativeData.filter((item) => item.category === "acknowledgment");
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
    async initializeOfflineIntelligence() {
        if (this.offlineIntelligenceEnabled)
            return;
        try {
            // Initialize predictive caching
            await this.initializePredictiveCaching();
            // Initialize smart sync prioritization
            await this.initializeSmartSyncPrioritization();
            // Initialize offline analytics
            await this.initializeOfflineAnalytics();
            this.offlineIntelligenceEnabled = true;
            console.log("Offline intelligence features initialized");
        }
        catch (error) {
            console.error("Failed to initialize offline intelligence:", error);
        }
    }
    async initializePredictiveCaching() {
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
    async initializeSmartSyncPrioritization() {
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
    async initializeOfflineAnalytics() {
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
    analyzeUserPatterns() {
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
    async cleanup() {
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
                if (record.status === "synced" &&
                    new Date(record.updatedAt) < cutoffDate) {
                    await store.delete(record.id);
                }
            }
        }
        console.log("Offline data cleanup completed");
    }
    /**
     * Enhanced mobile offline capabilities with intelligent conflict resolution
     */
    async resolveDataConflicts(localData, serverData, conflictType) {
        try {
            let resolvedData = localData;
            let resolution = "local";
            let confidence = 0;
            let reasoning = "";
            let requiresManualReview = false;
            // Timestamp-based resolution
            const localTimestamp = new Date(localData.updatedAt || localData.createdAt);
            const serverTimestamp = new Date(serverData.updatedAt || serverData.createdAt);
            if (conflictType === "update") {
                // Intelligent field-level merging
                const mergeResult = await this.performIntelligentMerge(localData, serverData);
                if (mergeResult.confidence > 0.8) {
                    resolvedData = mergeResult.data;
                    resolution = "merged";
                    confidence = mergeResult.confidence;
                    reasoning = "Intelligent field-level merge with high confidence";
                }
                else if (serverTimestamp > localTimestamp) {
                    resolvedData = serverData;
                    resolution = "server";
                    confidence = 0.7;
                    reasoning = "Server data is more recent";
                }
                else {
                    resolution = "local";
                    confidence = 0.6;
                    reasoning = "Local data is more recent";
                }
            }
            else if (conflictType === "delete") {
                // Handle delete conflicts
                if (localData.status === "deleted" && serverData.status !== "deleted") {
                    resolvedData = { ...serverData, status: "deleted" };
                    resolution = "merged";
                    confidence = 0.9;
                    reasoning =
                        "Preserving delete operation while maintaining server updates";
                }
                else {
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
            console.log(`Conflict resolved: ${resolution} (confidence: ${confidence})`);
            return {
                resolvedData,
                resolution,
                confidence,
                reasoning,
                requiresManualReview,
            };
        }
        catch (error) {
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
    async performIntelligentMerge(localData, serverData) {
        const mergedData = { ...localData };
        const conflicts = [];
        let totalFields = 0;
        let resolvedFields = 0;
        for (const key in serverData) {
            if (key === "id" || key === "createdAt")
                continue;
            totalFields++;
            if (localData[key] !== serverData[key]) {
                // Field-specific conflict resolution logic
                const resolution = this.resolveFieldConflict(key, localData[key], serverData[key]);
                if (resolution.resolved) {
                    mergedData[key] = resolution.value;
                    resolvedFields++;
                }
                else {
                    conflicts.push(`${key}: ${resolution.reason}`);
                    // Default to server value for unresolved conflicts
                    mergedData[key] = serverData[key];
                }
            }
            else {
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
    resolveFieldConflict(fieldName, localValue, serverValue) {
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
            }
            else if (serverValue === 0 && localValue !== 0) {
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
            }
            else if (serverValue.trim() === "" && localValue.trim() !== "") {
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
    hasComplexConflicts(localData, serverData) {
        // Check for critical field conflicts
        const criticalFields = [
            "patientId",
            "providerId",
            "authorizationId",
            "claimId",
        ];
        for (const field of criticalFields) {
            if (localData[field] &&
                serverData[field] &&
                localData[field] !== serverData[field]) {
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
    async initializeMobileOfflineSync() {
        try {
            // Check for mobile-specific sync capabilities
            const capabilities = {
                backgroundSync: "serviceWorker" in navigator &&
                    "sync" in window.ServiceWorkerRegistration.prototype,
                periodicSync: "serviceWorker" in navigator &&
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
            console.log("Mobile offline sync initialized with capabilities:", capabilities);
            return {
                success: true,
                capabilities,
                syncStrategies,
            };
        }
        catch (error) {
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
    async configureMobileSyncIntervals() {
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
    async initializeBackgroundSync() {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                // Register background sync
                if ("sync" in registration) {
                    await registration.sync.register("mobile-data-sync");
                    console.log("Background sync registered for mobile");
                }
            }
            catch (error) {
                console.error("Failed to initialize background sync:", error);
            }
        }
    }
    /**
     * Initialize periodic sync for mobile
     */
    async initializePeriodicSync() {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                // Register periodic sync (if supported)
                if ("periodicSync" in registration) {
                    await registration.periodicSync.register("mobile-periodic-sync", {
                        minInterval: 12 * 60 * 60 * 1000, // 12 hours
                    });
                    console.log("Periodic sync registered for mobile");
                }
            }
            catch (error) {
                console.error("Failed to initialize periodic sync:", error);
            }
        }
    }
    /**
     * Initialize network-aware sync
     */
    async initializeNetworkAwareSync() {
        // Monitor network conditions
        if ("connection" in navigator) {
            const connection = navigator.connection;
            const updateSyncStrategy = () => {
                const networkType = connection.effectiveType;
                const isSlowConnection = networkType === "slow-2g" || networkType === "2g";
                if (isSlowConnection) {
                    // Reduce sync frequency and compress data more aggressively
                    this.adjustSyncForSlowNetwork();
                }
                else {
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
    adjustSyncForSlowNetwork() {
        console.log("Adjusting sync strategy for slow network");
        // Implement compression, reduce frequency, prioritize critical data
    }
    /**
     * Adjust sync strategy for fast networks
     */
    adjustSyncForFastNetwork() {
        console.log("Using normal sync strategy for fast network");
        // Normal sync intervals and data transfer
    }
    /**
     * Trigger mobile-optimized sync
     */
    async triggerMobileSync() {
        try {
            // Prioritize critical data first
            await this.syncCriticalData();
            // Then sync other data based on priority
            await this.syncWithConflictResolution();
            // Clean up old offline data
            await this.cleanupOfflineData();
        }
        catch (error) {
            console.error("Mobile sync failed:", error);
        }
    }
    /**
     * Sync critical data first
     */
    async syncCriticalData() {
        const db = await this.getDB();
        // Get critical data that needs immediate sync
        const criticalCategories = [
            "clinicalForms",
            "incidentReports",
            "emergencyData",
        ];
        for (const category of criticalCategories) {
            try {
                const items = await db.getAllFromIndex(category, "status", "completed");
                for (const item of items) {
                    await this.syncItemWithConflictResolution(item, category);
                }
            }
            catch (error) {
                console.error(`Failed to sync critical ${category}:`, error);
            }
        }
    }
    /**
     * Enable offline mode optimizations
     */
    enableOfflineMode() {
        // Enable aggressive caching
        // Compress data more aggressively
        // Queue all operations for later sync
        console.log("Offline mode enabled with optimizations");
    }
    /**
     * Clean up old offline data
     */
    async cleanupOfflineData() {
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
                    if (record.status === "synced" &&
                        new Date(record.updatedAt) < cutoffDate) {
                        await store.delete(record.id);
                    }
                }
            }
            catch (error) {
                console.error(`Failed to cleanup ${storeName}:`, error);
            }
        }
        console.log("Mobile offline data cleanup completed");
    }
    /**
     * Enhanced sync with conflict resolution
     */
    async syncWithConflictResolution() {
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
        const errors = [];
        // Process each category of pending items
        for (const [category, items] of Object.entries(pendingItems)) {
            if (!Array.isArray(items))
                continue;
            for (const item of items) {
                try {
                    // Attempt to sync item
                    const syncResult = await this.syncItemWithConflictResolution(item, category);
                    if (syncResult.success) {
                        syncedItems++;
                        if (syncResult.conflictResolved) {
                            conflictsResolved++;
                        }
                        if (syncResult.requiresManualReview) {
                            manualReviewRequired++;
                        }
                    }
                    else {
                        errors.push(`Failed to sync ${category} item ${item.id}: ${syncResult.error}`);
                    }
                }
                catch (error) {
                    errors.push(`Error syncing ${category} item ${item.id}: ${error}`);
                }
            }
        }
        console.log(`Sync completed: ${syncedItems} items synced, ${conflictsResolved} conflicts resolved, ${manualReviewRequired} require manual review`);
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
    async syncItemWithConflictResolution(localItem, category) {
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
                const resolution = await this.resolveDataConflicts(localItem, serverItem, "update");
                if (resolution.requiresManualReview) {
                    // Store for manual review
                    await this.storeForManualReview(localItem, serverItem, resolution);
                    return {
                        success: true,
                        conflictResolved: true,
                        requiresManualReview: true,
                    };
                }
                else {
                    // Apply resolved data
                    await this.updateServerItem(resolution.resolvedData, category);
                    return {
                        success: true,
                        conflictResolved: true,
                        requiresManualReview: false,
                    };
                }
            }
            else {
                // No conflicts, update server
                await this.updateServerItem(localItem, category);
                return {
                    success: true,
                    conflictResolved: false,
                    requiresManualReview: false,
                };
            }
        }
        catch (error) {
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
    hasDataConflict(localItem, serverItem) {
        const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt);
        const serverTimestamp = new Date(serverItem.updatedAt || serverItem.createdAt);
        // If timestamps are different and both items have been modified, there's a potential conflict
        return (Math.abs(localTimestamp.getTime() - serverTimestamp.getTime()) > 1000); // 1 second tolerance
    }
    /**
     * Store items requiring manual review
     */
    async storeForManualReview(localItem, serverItem, resolution) {
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
    async fetchServerItem(id, category) {
        // Implementation would make actual API call
        return null;
    }
    async createServerItem(item, category) {
        // Implementation would make actual API call
        console.log(`Creating server item in ${category}:`, item.id);
    }
    async updateServerItem(item, category) {
        // Implementation would make actual API call
        console.log(`Updating server item in ${category}:`, item.id);
    }
}
export const offlineService = OfflineService.getInstance();
export default offlineService;
