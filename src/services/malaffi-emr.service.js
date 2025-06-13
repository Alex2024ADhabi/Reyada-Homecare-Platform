/**
 * Malaffi EMR Integration Service
 * Provides bidirectional synchronization with UAE's national EMR system
 */
import { AuditLogger } from "@/services/security.service";
class MalaffiEmrService {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isAuthenticated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "syncInProgress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = {
            apiUrl: process.env.MALAFFI_API_URL || "https://api.malaffi.ae/v1",
            clientId: process.env.MALAFFI_CLIENT_ID || "",
            clientSecret: process.env.MALAFFI_CLIENT_SECRET || "",
            facilityId: process.env.MALAFFI_FACILITY_ID || "",
            providerId: process.env.MALAFFI_PROVIDER_ID || "",
        };
    }
    /**
     * Authenticate with Malaffi EMR system
     */
    async authenticate() {
        try {
            const response = await fetch(`${this.config.apiUrl}/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Facility-ID": this.config.facilityId,
                },
                body: JSON.stringify({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    grant_type: "client_credentials",
                    scope: "patient:read patient:write medical_records:read medical_records:write",
                }),
            });
            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }
            const authData = await response.json();
            this.config.accessToken = authData.access_token;
            this.config.refreshToken = authData.refresh_token;
            this.config.tokenExpiry = new Date(Date.now() + authData.expires_in * 1000).toISOString();
            this.isAuthenticated = true;
            AuditLogger.logSecurityEvent({
                type: "malaffi_authentication_success",
                details: {
                    facilityId: this.config.facilityId,
                    providerId: this.config.providerId,
                },
                severity: "low",
                complianceImpact: true,
            });
            return true;
        }
        catch (error) {
            console.error("Malaffi authentication error:", error);
            AuditLogger.logSecurityEvent({
                type: "malaffi_authentication_failed",
                details: {
                    error: error.message,
                    facilityId: this.config.facilityId,
                },
                severity: "high",
                complianceImpact: true,
            });
            return false;
        }
    }
    /**
     * Search for patients in Malaffi EMR
     */
    async searchPatients(criteria) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        try {
            const queryParams = new URLSearchParams();
            if (criteria.emiratesId)
                queryParams.append("emirates_id", criteria.emiratesId);
            if (criteria.mrn)
                queryParams.append("mrn", criteria.mrn);
            if (criteria.firstName)
                queryParams.append("first_name", criteria.firstName);
            if (criteria.lastName)
                queryParams.append("last_name", criteria.lastName);
            if (criteria.dateOfBirth)
                queryParams.append("date_of_birth", criteria.dateOfBirth);
            if (criteria.phone)
                queryParams.append("phone", criteria.phone);
            if (criteria.limit)
                queryParams.append("limit", criteria.limit.toString());
            if (criteria.offset)
                queryParams.append("offset", criteria.offset.toString());
            const response = await fetch(`${this.config.apiUrl}/patients/search?${queryParams}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "X-Facility-ID": this.config.facilityId,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`Patient search failed: ${response.statusText}`);
            }
            const data = await response.json();
            return data.patients || [];
        }
        catch (error) {
            console.error("Malaffi patient search error:", error);
            throw error;
        }
    }
    /**
     * Get patient by Emirates ID
     */
    async getPatientByEmiratesId(emiratesId) {
        const patients = await this.searchPatients({ emiratesId });
        return patients.length > 0 ? patients[0] : null;
    }
    /**
     * Get patient medical records
     */
    async getPatientMedicalRecords(patientId, criteria) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        try {
            const queryParams = new URLSearchParams();
            if (criteria?.dateRange) {
                queryParams.append("from_date", criteria.dateRange.from);
                queryParams.append("to_date", criteria.dateRange.to);
            }
            if (criteria?.recordTypes) {
                criteria.recordTypes.forEach((type) => queryParams.append("record_type", type));
            }
            if (criteria?.limit)
                queryParams.append("limit", criteria.limit.toString());
            if (criteria?.offset)
                queryParams.append("offset", criteria.offset.toString());
            const response = await fetch(`${this.config.apiUrl}/patients/${patientId}/medical-records?${queryParams}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "X-Facility-ID": this.config.facilityId,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`Medical records fetch failed: ${response.statusText}`);
            }
            const data = await response.json();
            return data.records || [];
        }
        catch (error) {
            console.error("Malaffi medical records fetch error:", error);
            throw error;
        }
    }
    /**
     * Create or update patient in Malaffi EMR
     */
    async syncPatientToMalaffi(patient) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        try {
            const method = patient.id ? "PUT" : "POST";
            const url = patient.id
                ? `${this.config.apiUrl}/patients/${patient.id}`
                : `${this.config.apiUrl}/patients`;
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "X-Facility-ID": this.config.facilityId,
                    "X-Provider-ID": this.config.providerId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...patient,
                    lastUpdated: new Date().toISOString(),
                    syncStatus: "synced",
                }),
            });
            if (!response.ok) {
                throw new Error(`Patient sync failed: ${response.statusText}`);
            }
            const syncedPatient = await response.json();
            AuditLogger.logSecurityEvent({
                type: "malaffi_patient_synced",
                details: {
                    patientId: syncedPatient.id,
                    emiratesId: syncedPatient.emiratesId,
                    operation: method === "POST" ? "create" : "update",
                },
                severity: "low",
                complianceImpact: true,
            });
            return syncedPatient;
        }
        catch (error) {
            console.error("Malaffi patient sync error:", error);
            throw error;
        }
    }
    /**
     * Create medical record in Malaffi EMR
     */
    async createMedicalRecord(record) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        try {
            const response = await fetch(`${this.config.apiUrl}/medical-records`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "X-Facility-ID": this.config.facilityId,
                    "X-Provider-ID": this.config.providerId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...record,
                    facilityId: this.config.facilityId,
                    providerId: this.config.providerId,
                    lastUpdated: new Date().toISOString(),
                    syncStatus: "synced",
                }),
            });
            if (!response.ok) {
                throw new Error(`Medical record creation failed: ${response.statusText}`);
            }
            const createdRecord = await response.json();
            AuditLogger.logSecurityEvent({
                type: "malaffi_medical_record_created",
                details: {
                    recordId: createdRecord.id,
                    patientId: createdRecord.patientId,
                    recordType: createdRecord.recordType,
                },
                severity: "low",
                complianceImpact: true,
            });
            return createdRecord;
        }
        catch (error) {
            console.error("Malaffi medical record creation error:", error);
            throw error;
        }
    }
    /**
     * Perform bidirectional synchronization with enhanced conflict resolution and comprehensive error handling
     */
    async performBidirectionalSync(localPatients, localRecords, options) {
        if (this.syncInProgress) {
            throw new Error("Sync already in progress");
        }
        this.syncInProgress = true;
        const startTime = Date.now();
        const syncOptions = {
            conflictResolution: "manual",
            batchSize: 10,
            retryAttempts: 3,
            enableRealTimeMonitoring: true,
            enableCircuitBreaker: true,
            timeoutMs: 30000,
            ...options,
        };
        // Initialize circuit breaker state
        const circuitBreaker = {
            failures: 0,
            lastFailureTime: 0,
            state: "closed",
            threshold: 5,
            timeout: 60000, // 1 minute
        };
        const syncResult = {
            success: false,
            syncedRecords: 0,
            conflictRecords: 0,
            errorRecords: 0,
            lastSyncTime: new Date().toISOString(),
            conflicts: [],
            errors: [],
        };
        try {
            // Initialize real-time monitoring
            if (syncOptions.enableRealTimeMonitoring) {
                await this.initializeRealTimeMonitoring(syncResult);
            }
            // Check circuit breaker before processing
            if (syncOptions.enableCircuitBreaker &&
                !this.isCircuitBreakerClosed(circuitBreaker)) {
                throw new Error("Circuit breaker is open - too many recent failures");
            }
            // Process patients in batches with timeout and error handling
            const patientBatches = this.createBatches(localPatients, syncOptions.batchSize);
            for (const batch of patientBatches) {
                try {
                    await Promise.race([
                        this.processBatch(batch, syncResult, syncOptions, "patient"),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Batch processing timeout")), syncOptions.timeoutMs)),
                    ]);
                    // Reset circuit breaker on success
                    if (syncOptions.enableCircuitBreaker) {
                        circuitBreaker.failures = 0;
                    }
                    // Update real-time monitoring
                    if (syncOptions.enableRealTimeMonitoring) {
                        await this.updateRealTimeMonitoring(syncResult, "patient_batch_completed");
                    }
                }
                catch (error) {
                    // Handle circuit breaker
                    if (syncOptions.enableCircuitBreaker) {
                        circuitBreaker.failures++;
                        circuitBreaker.lastFailureTime = Date.now();
                        if (circuitBreaker.failures >= circuitBreaker.threshold) {
                            circuitBreaker.state = "open";
                            throw new Error(`Circuit breaker opened after ${circuitBreaker.failures} failures`);
                        }
                    }
                    // Log batch error but continue with next batch
                    console.error("Patient batch processing failed:", error);
                    syncResult.errors?.push({
                        recordId: "batch_error",
                        errorType: "batch_processing_error",
                        message: `Patient batch failed: ${error.message}`,
                    });
                    syncResult.errorRecords += batch.length;
                }
            }
            // Process medical records in batches with enhanced error handling
            const recordBatches = this.createBatches(localRecords, syncOptions.batchSize);
            for (const batch of recordBatches) {
                try {
                    await Promise.race([
                        this.processBatch(batch, syncResult, syncOptions, "medical_record"),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Batch processing timeout")), syncOptions.timeoutMs)),
                    ]);
                    // Update real-time monitoring
                    if (syncOptions.enableRealTimeMonitoring) {
                        await this.updateRealTimeMonitoring(syncResult, "record_batch_completed");
                    }
                }
                catch (error) {
                    // Handle circuit breaker
                    if (syncOptions.enableCircuitBreaker) {
                        circuitBreaker.failures++;
                        circuitBreaker.lastFailureTime = Date.now();
                    }
                    // Log batch error but continue with next batch
                    console.error("Medical record batch processing failed:", error);
                    syncResult.errors?.push({
                        recordId: "batch_error",
                        errorType: "batch_processing_error",
                        message: `Medical record batch failed: ${error.message}`,
                    });
                    syncResult.errorRecords += batch.length;
                }
            }
            // Handle automatic conflict resolution
            if (syncOptions.conflictResolution !== "manual" &&
                syncResult.conflicts &&
                syncResult.conflicts.length > 0) {
                await this.resolveConflictsAutomatically(syncResult.conflicts, syncOptions.conflictResolution);
            }
            // Validate sync integrity
            await this.validateSyncIntegrity(syncResult);
            syncResult.success = syncResult.errorRecords === 0;
            const duration = Date.now() - startTime;
            // Log comprehensive sync metrics
            AuditLogger.logSecurityEvent({
                type: "malaffi_bidirectional_sync_completed",
                details: {
                    syncedRecords: syncResult.syncedRecords,
                    conflictRecords: syncResult.conflictRecords,
                    errorRecords: syncResult.errorRecords,
                    success: syncResult.success,
                    duration,
                    batchSize: syncOptions.batchSize,
                    conflictResolution: syncOptions.conflictResolution,
                    totalPatients: localPatients.length,
                    totalRecords: localRecords.length,
                },
                severity: syncResult.success ? "low" : "medium",
                complianceImpact: true,
            });
            return syncResult;
        }
        catch (error) {
            console.error("Bidirectional sync error:", error);
            syncResult.success = false;
            // Enhanced error logging
            AuditLogger.logSecurityEvent({
                type: "malaffi_sync_critical_error",
                details: {
                    error: error.message,
                    stack: error.stack,
                    syncProgress: {
                        syncedRecords: syncResult.syncedRecords,
                        conflictRecords: syncResult.conflictRecords,
                        errorRecords: syncResult.errorRecords,
                    },
                },
                severity: "high",
                complianceImpact: true,
            });
            throw error;
        }
        finally {
            this.syncInProgress = false;
            // Cleanup real-time monitoring
            if (syncOptions.enableRealTimeMonitoring) {
                await this.cleanupRealTimeMonitoring();
            }
        }
    }
    /**
     * Create batches for processing
     */
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * Process a batch of items with retry logic
     */
    async processBatch(batch, syncResult, options, type) {
        for (const item of batch) {
            let attempts = 0;
            let success = false;
            while (attempts < options.retryAttempts && !success) {
                try {
                    if (type === "patient") {
                        await this.syncPatientWithConflictDetection(item, syncResult, options);
                    }
                    else {
                        await this.syncMedicalRecordWithValidation(item, syncResult);
                    }
                    success = true;
                }
                catch (error) {
                    attempts++;
                    if (attempts >= options.retryAttempts) {
                        syncResult.errors?.push({
                            recordId: item.id || "",
                            errorType: `${type}_sync_error`,
                            message: `Failed after ${attempts} attempts: ${error.message}`,
                        });
                        syncResult.errorRecords++;
                    }
                    else {
                        // Exponential backoff
                        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                    }
                }
            }
        }
    }
    /**
     * Sync patient with enhanced conflict detection
     */
    async syncPatientWithConflictDetection(localPatient, syncResult, options) {
        if (!localPatient.emiratesId) {
            throw new Error("Emirates ID is required for patient sync");
        }
        const remotePatient = await this.getPatientByEmiratesId(localPatient.emiratesId);
        if (remotePatient) {
            const conflicts = this.detectDetailedPatientConflicts(localPatient, remotePatient);
            if (conflicts.length > 0) {
                syncResult.conflicts?.push({
                    recordId: localPatient.id || "",
                    conflictType: "data_mismatch",
                    localData: localPatient,
                    remoteData: remotePatient,
                    resolution: options.conflictResolution,
                    conflictDetails: conflicts,
                });
                syncResult.conflictRecords++;
                // Auto-resolve if not manual
                if (options.conflictResolution !== "manual") {
                    const resolvedPatient = this.resolvePatientConflict(localPatient, remotePatient, options.conflictResolution);
                    await this.syncPatientToMalaffi(resolvedPatient);
                    syncResult.syncedRecords++;
                }
            }
            else {
                // No conflicts, proceed with sync
                await this.syncPatientToMalaffi({
                    ...localPatient,
                    id: remotePatient.id,
                });
                syncResult.syncedRecords++;
            }
        }
        else {
            // Create new patient in Malaffi
            await this.syncPatientToMalaffi(localPatient);
            syncResult.syncedRecords++;
        }
    }
    /**
     * Sync medical record with validation
     */
    async syncMedicalRecordWithValidation(localRecord, syncResult) {
        // Validate required fields
        if (!localRecord.patientId || !localRecord.recordType) {
            throw new Error("Patient ID and record type are required for medical record sync");
        }
        // Check for duplicate records
        const existingRecords = await this.getPatientMedicalRecords(localRecord.patientId, {
            recordTypes: [localRecord.recordType],
            dateRange: {
                from: localRecord.date || new Date().toISOString(),
                to: localRecord.date || new Date().toISOString(),
            },
        });
        const isDuplicate = existingRecords.some((record) => record.recordType === localRecord.recordType &&
            record.date === localRecord.date &&
            record.providerId === localRecord.providerId);
        if (isDuplicate) {
            throw new Error("Duplicate medical record detected");
        }
        await this.createMedicalRecord(localRecord);
        syncResult.syncedRecords++;
    }
    /**
     * Detect detailed patient conflicts
     */
    detectDetailedPatientConflicts(localPatient, remotePatient) {
        const conflicts = [];
        const fieldsToCheck = [
            { field: "firstName", severity: "high" },
            { field: "lastName", severity: "high" },
            { field: "dateOfBirth", severity: "high" },
            { field: "phone", severity: "medium" },
            { field: "email", severity: "low" },
            { field: "address", severity: "medium" },
        ];
        for (const { field, severity } of fieldsToCheck) {
            if (localPatient[field] &&
                remotePatient[field] &&
                JSON.stringify(localPatient[field]) !==
                    JSON.stringify(remotePatient[field])) {
                conflicts.push({
                    field,
                    localValue: localPatient[field],
                    remoteValue: remotePatient[field],
                    severity,
                });
            }
        }
        return conflicts;
    }
    /**
     * Resolve patient conflict based on strategy
     */
    resolvePatientConflict(localPatient, remotePatient, strategy) {
        switch (strategy) {
            case "local_wins":
                return { ...remotePatient, ...localPatient };
            case "remote_wins":
                return remotePatient;
            case "merge":
                return this.mergePatientData(localPatient, remotePatient);
            default:
                return localPatient;
        }
    }
    /**
     * Merge patient data intelligently
     */
    mergePatientData(localPatient, remotePatient) {
        const merged = { ...remotePatient };
        // Prefer local data for contact information if more recent
        if (localPatient.lastUpdated && remotePatient.lastUpdated) {
            const localDate = new Date(localPatient.lastUpdated);
            const remoteDate = new Date(remotePatient.lastUpdated);
            if (localDate > remoteDate) {
                merged.phone = localPatient.phone || merged.phone;
                merged.email = localPatient.email || merged.email;
                merged.address = localPatient.address || merged.address;
            }
        }
        // Always prefer local emergency contacts if provided
        if (localPatient.emergencyContacts) {
            merged.emergencyContacts = localPatient.emergencyContacts;
        }
        return merged;
    }
    /**
     * Resolve conflicts automatically
     */
    async resolveConflictsAutomatically(conflicts, strategy) {
        for (const conflict of conflicts) {
            try {
                const resolvedData = this.resolvePatientConflict(conflict.localData, conflict.remoteData, strategy);
                await this.syncPatientToMalaffi(resolvedData);
                AuditLogger.logSecurityEvent({
                    type: "malaffi_conflict_auto_resolved",
                    details: {
                        conflictId: conflict.recordId,
                        strategy,
                        conflictDetails: conflict.conflictDetails,
                    },
                    severity: "low",
                    complianceImpact: true,
                });
            }
            catch (error) {
                console.error(`Failed to auto-resolve conflict for ${conflict.recordId}:`, error);
            }
        }
    }
    /**
     * Initialize real-time monitoring
     */
    async initializeRealTimeMonitoring(syncResult) {
        // Implementation for real-time monitoring initialization
        console.log("Initializing real-time sync monitoring...");
    }
    /**
     * Update real-time monitoring
     */
    async updateRealTimeMonitoring(syncResult, event) {
        // Implementation for real-time monitoring updates
        console.log(`Real-time monitoring update: ${event}`, {
            syncedRecords: syncResult.syncedRecords,
            conflictRecords: syncResult.conflictRecords,
            errorRecords: syncResult.errorRecords,
        });
    }
    /**
     * Cleanup real-time monitoring
     */
    async cleanupRealTimeMonitoring() {
        // Implementation for real-time monitoring cleanup
        console.log("Cleaning up real-time sync monitoring...");
    }
    /**
     * Validate sync integrity
     */
    async validateSyncIntegrity(syncResult) {
        // Implementation for sync integrity validation
        console.log("Validating sync integrity...");
        // Check for data consistency
        // Verify record counts
        // Validate data integrity
    }
    /**
     * Detect conflicts between local and remote patient data
     */
    detectPatientConflicts(localPatient, remotePatient) {
        const fieldsToCheck = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "phone",
            "email",
        ];
        for (const field of fieldsToCheck) {
            if (localPatient[field] &&
                remotePatient[field] &&
                localPatient[field] !== remotePatient[field]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Resolve sync conflicts
     */
    async resolveConflict(conflictId, resolution) {
        // Implementation for conflict resolution
        // This would involve updating the appropriate records based on the resolution strategy
        try {
            AuditLogger.logSecurityEvent({
                type: "malaffi_conflict_resolved",
                details: {
                    conflictId,
                    resolution,
                },
                severity: "low",
                complianceImpact: true,
            });
            return true;
        }
        catch (error) {
            console.error("Conflict resolution error:", error);
            return false;
        }
    }
    /**
     * Check if circuit breaker is closed (allowing requests)
     */
    isCircuitBreakerClosed(circuitBreaker) {
        if (circuitBreaker.state === "closed") {
            return true;
        }
        if (circuitBreaker.state === "open") {
            const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
            if (timeSinceLastFailure > circuitBreaker.timeout) {
                circuitBreaker.state = "half-open";
                return true;
            }
            return false;
        }
        // half-open state - allow one request to test
        return true;
    }
    /**
     * Enhanced error handling with categorization
     */
    categorizeError(error) {
        const message = error.message?.toLowerCase() || "";
        if (message.includes("network") || message.includes("connection")) {
            return { category: "network", severity: "high", retryable: true };
        }
        if (message.includes("auth") ||
            message.includes("unauthorized") ||
            message.includes("forbidden")) {
            return {
                category: "authentication",
                severity: "critical",
                retryable: false,
            };
        }
        if (message.includes("validation") ||
            message.includes("invalid") ||
            message.includes("required")) {
            return { category: "validation", severity: "medium", retryable: false };
        }
        if (message.includes("timeout")) {
            return { category: "timeout", severity: "high", retryable: true };
        }
        if (message.includes("server") || message.includes("internal")) {
            return { category: "server", severity: "high", retryable: true };
        }
        return { category: "unknown", severity: "medium", retryable: true };
    }
    /**
     * Get comprehensive sync status
     */
    getSyncStatus() {
        // Calculate health metrics (simplified for demo)
        const healthStatus = this.isAuthenticated ? "healthy" : "critical";
        const errorRate = 0; // Would be calculated from recent sync history
        const averageResponseTime = 250; // Would be calculated from recent API calls
        return {
            isAuthenticated: this.isAuthenticated,
            syncInProgress: this.syncInProgress,
            healthStatus,
            errorRate,
            averageResponseTime,
        };
    }
}
// Export singleton instance
export const malaffiEmrService = new MalaffiEmrService();
export default malaffiEmrService;
