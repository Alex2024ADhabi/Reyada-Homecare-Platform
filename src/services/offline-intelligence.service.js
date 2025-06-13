// Enhanced Offline Operations Intelligence Service
import { getDb } from "../api/db";
import { ObjectId } from "../api/browser-mongodb";
// Enhanced Offline Operations Intelligence Service
export class OfflineIntelligenceService {
    constructor() {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = getDb();
        this.metrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageOfflineDuration: 0,
            averageSyncDuration: 0,
            totalDataProcessed: 0,
            conflictResolutionRate: 0,
            userSatisfactionScore: 0,
            bandwidthSavings: 0,
            cacheEfficiency: 0,
            predictiveAccuracy: 0,
        };
        this.initializeSampleData();
    }
    // Create new offline operation
    async createOfflineOperation(operation) {
        const newOperation = {
            ...operation,
            operationId: new ObjectId().toString(),
            status: "pending",
            syncConflictsDetected: 0,
            conflictTypes: [],
            conflictResolutionMethods: [],
            manualResolutionRequired: 0,
            validationErrors: 0,
            correctionActionsTaken: [],
        };
        this.operations.set(newOperation.operationId, newOperation);
        await this.storeOperation(newOperation);
        return newOperation;
    }
    // Get offline operation by ID
    async getOfflineOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (operation) {
            return operation;
        }
        // Try to load from database
        try {
            const collection = this.db.collection("offline_operations_intelligence");
            const dbOperation = await collection.findOne({
                operation_id: operationId,
            });
            if (dbOperation) {
                const operation = this.mapDbToOperation(dbOperation);
                this.operations.set(operationId, operation);
                return operation;
            }
        }
        catch (error) {
            console.error("Error loading operation from database:", error);
        }
        return null;
    }
    // Get all offline operations
    async getAllOfflineOperations() {
        try {
            const collection = this.db.collection("offline_operations_intelligence");
            const dbOperations = await collection.find({}).toArray();
            return dbOperations.map((op) => this.mapDbToOperation(op));
        }
        catch (error) {
            console.error("Error loading operations from database:", error);
            return Array.from(this.operations.values());
        }
    }
    // Update offline operation
    async updateOfflineOperation(operationId, updates) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            return false;
        }
        const updatedOperation = { ...operation, ...updates };
        this.operations.set(operationId, updatedOperation);
        await this.storeOperation(updatedOperation);
        return true;
    }
    // Start offline operation
    async startOfflineOperation(operationId) {
        return this.updateOfflineOperation(operationId, {
            status: "in_progress",
            offlineStartTime: new Date(),
        });
    }
    // Complete offline operation
    async completeOfflineOperation(operationId, completionData) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            return false;
        }
        const offlineEndTime = new Date();
        const offlineDurationMinutes = operation.offlineStartTime
            ? (offlineEndTime.getTime() - operation.offlineStartTime.getTime()) /
                (1000 * 60)
            : 0;
        return this.updateOfflineOperation(operationId, {
            ...completionData,
            status: "completed",
            offlineEndTime,
            offlineDurationMinutes,
            operationSuccessRate: completionData.validationErrors
                ? Math.max(0, 100 - completionData.validationErrors * 10)
                : 95,
        });
    }
    // Sync offline operation
    async syncOfflineOperation(operationId, syncData) {
        return this.updateOfflineOperation(operationId, {
            syncTimestamp: new Date(),
            syncSuccess: syncData.syncSuccess,
            syncDurationSeconds: syncData.syncDurationSeconds,
            syncDataSizeMb: syncData.syncDataSizeMb,
            syncConflictsDetected: syncData.conflictsDetected || 0,
            conflictTypes: syncData.conflictTypes || [],
        });
    }
    // Assess offline capabilities for a device
    async assessOfflineCapabilities(deviceId) {
        const deviceOperations = Array.from(this.operations.values()).filter((op) => op.deviceId === deviceId);
        const successfulOps = deviceOperations.filter((op) => op.status === "completed");
        const avgUserRating = successfulOps.length > 0
            ? successfulOps.reduce((sum, op) => sum + op.userExperienceRating, 0) /
                successfulOps.length
            : 0;
        const avgCacheHitRate = successfulOps.length > 0
            ? successfulOps.reduce((sum, op) => sum + op.cacheHitRate, 0) /
                successfulOps.length
            : 0;
        const conflictResolutionRate = deviceOperations.length > 0
            ? (deviceOperations.filter((op) => op.syncConflictsDetected === 0)
                .length /
                deviceOperations.length) *
                100
            : 100;
        const offlineReadiness = (avgUserRating + avgCacheHitRate + conflictResolutionRate) / 3;
        return {
            deviceId,
            offlineReadiness,
            criticalWorkflowSupport: [
                "patient_assessment",
                "clinical_documentation",
                "medication_administration",
                "vital_signs_recording",
            ],
            dataPreCachingStrategy: offlineReadiness > 80 ? "aggressive" : "conservative",
            conflictResolutionCapability: conflictResolutionRate,
            syncOptimizationLevel: avgCacheHitRate,
            userExperienceScore: avgUserRating,
            recommendations: this.generateRecommendations(offlineReadiness, avgCacheHitRate, conflictResolutionRate),
        };
    }
    // Get offline intelligence metrics
    async getOfflineIntelligenceMetrics() {
        const operations = Array.from(this.operations.values());
        const completedOps = operations.filter((op) => op.status === "completed");
        const failedOps = operations.filter((op) => op.status === "failed");
        const totalDataProcessed = completedOps.reduce((sum, op) => sum + op.dataSizeProcessedMb, 0);
        const averageOfflineDuration = completedOps.length > 0
            ? completedOps.reduce((sum, op) => sum + (op.offlineDurationMinutes || 0), 0) / completedOps.length
            : 0;
        const averageSyncDuration = completedOps.filter((op) => op.syncDurationSeconds).length > 0
            ? completedOps
                .filter((op) => op.syncDurationSeconds)
                .reduce((sum, op) => sum + (op.syncDurationSeconds || 0), 0) /
                completedOps.filter((op) => op.syncDurationSeconds).length
            : 0;
        const conflictResolutionRate = operations.length > 0
            ? (operations.filter((op) => op.syncConflictsDetected === 0).length /
                operations.length) *
                100
            : 100;
        const userSatisfactionScore = completedOps.length > 0
            ? completedOps.reduce((sum, op) => sum + op.userExperienceRating, 0) /
                completedOps.length
            : 0;
        const bandwidthSavings = completedOps.reduce((sum, op) => sum + op.bandwidthOptimizationSavings, 0);
        const cacheEfficiency = completedOps.length > 0
            ? completedOps.reduce((sum, op) => sum + op.cacheHitRate, 0) /
                completedOps.length
            : 0;
        const predictiveAccuracy = completedOps.length > 0
            ? completedOps.reduce((sum, op) => sum + op.predictiveLoadingAccuracy, 0) / completedOps.length
            : 0;
        this.metrics = {
            totalOperations: operations.length,
            successfulOperations: completedOps.length,
            failedOperations: failedOps.length,
            averageOfflineDuration,
            averageSyncDuration,
            totalDataProcessed,
            conflictResolutionRate,
            userSatisfactionScore,
            bandwidthSavings,
            cacheEfficiency,
            predictiveAccuracy,
        };
        return this.metrics;
    }
    // Generate optimization recommendations
    generateRecommendations(offlineReadiness, cacheHitRate, conflictResolutionRate) {
        const recommendations = [];
        if (offlineReadiness < 70) {
            recommendations.push("Improve offline capability by enhancing local storage and processing");
        }
        if (cacheHitRate < 80) {
            recommendations.push("Implement predictive caching to improve cache hit rates");
        }
        if (conflictResolutionRate < 90) {
            recommendations.push("Enhance conflict resolution mechanisms for better sync reliability");
        }
        if (offlineReadiness > 90) {
            recommendations.push("Excellent offline capabilities - consider expanding offline workflows");
        }
        return recommendations;
    }
    // Store operation in database
    async storeOperation(operation) {
        try {
            const collection = this.db.collection("offline_operations_intelligence");
            await collection.replaceOne({ operation_id: operation.operationId }, {
                operation_id: operation.operationId,
                device_id: operation.deviceId,
                user_id: operation.userId,
                operation_type: operation.operationType,
                workflow_category: operation.workflowCategory,
                offline_start_time: operation.offlineStartTime,
                offline_end_time: operation.offlineEndTime,
                offline_duration_minutes: operation.offlineDurationMinutes,
                records_created: operation.recordsCreated,
                records_modified: operation.recordsModified,
                records_accessed: operation.recordsAccessed,
                data_size_processed_mb: operation.dataSizeProcessedMb,
                sync_conflicts_detected: operation.syncConflictsDetected,
                conflict_types: operation.conflictTypes,
                conflict_resolution_methods: operation.conflictResolutionMethods,
                manual_resolution_required: operation.manualResolutionRequired,
                local_processing_efficiency: operation.localProcessingEfficiency,
                user_experience_rating: operation.userExperienceRating,
                operation_success_rate: operation.operationSuccessRate,
                cache_hit_rate: operation.cacheHitRate,
                predictive_loading_accuracy: operation.predictiveLoadingAccuracy,
                bandwidth_optimization_savings: operation.bandwidthOptimizationSavings,
                data_integrity_score: operation.dataIntegrityScore,
                validation_errors: operation.validationErrors,
                correction_actions_taken: operation.correctionActionsTaken,
                sync_timestamp: operation.syncTimestamp,
                sync_success: operation.syncSuccess,
                sync_duration_seconds: operation.syncDurationSeconds,
                sync_data_size_mb: operation.syncDataSizeMb,
                status: operation.status,
                priority: operation.priority,
                metadata: operation.metadata,
                created_at: new Date().toISOString(),
            }, { upsert: true });
        }
        catch (error) {
            console.error("Error storing operation:", error);
        }
    }
    // Map database record to operation object
    mapDbToOperation(dbRecord) {
        return {
            operationId: dbRecord.operation_id,
            deviceId: dbRecord.device_id,
            userId: dbRecord.user_id,
            operationType: dbRecord.operation_type,
            workflowCategory: dbRecord.workflow_category,
            offlineStartTime: new Date(dbRecord.offline_start_time),
            offlineEndTime: dbRecord.offline_end_time
                ? new Date(dbRecord.offline_end_time)
                : undefined,
            offlineDurationMinutes: dbRecord.offline_duration_minutes,
            recordsCreated: dbRecord.records_created || 0,
            recordsModified: dbRecord.records_modified || 0,
            recordsAccessed: dbRecord.records_accessed || 0,
            dataSizeProcessedMb: dbRecord.data_size_processed_mb || 0,
            syncConflictsDetected: dbRecord.sync_conflicts_detected || 0,
            conflictTypes: dbRecord.conflict_types || [],
            conflictResolutionMethods: dbRecord.conflict_resolution_methods || [],
            manualResolutionRequired: dbRecord.manual_resolution_required || 0,
            localProcessingEfficiency: dbRecord.local_processing_efficiency || 0,
            userExperienceRating: dbRecord.user_experience_rating || 0,
            operationSuccessRate: dbRecord.operation_success_rate || 0,
            cacheHitRate: dbRecord.cache_hit_rate || 0,
            predictiveLoadingAccuracy: dbRecord.predictive_loading_accuracy || 0,
            bandwidthOptimizationSavings: dbRecord.bandwidth_optimization_savings || 0,
            dataIntegrityScore: dbRecord.data_integrity_score || 0,
            validationErrors: dbRecord.validation_errors || 0,
            correctionActionsTaken: dbRecord.correction_actions_taken || [],
            syncTimestamp: dbRecord.sync_timestamp
                ? new Date(dbRecord.sync_timestamp)
                : undefined,
            syncSuccess: dbRecord.sync_success,
            syncDurationSeconds: dbRecord.sync_duration_seconds,
            syncDataSizeMb: dbRecord.sync_data_size_mb,
            status: dbRecord.status || "pending",
            priority: dbRecord.priority || "medium",
            metadata: dbRecord.metadata || {},
        };
    }
    // Initialize sample data for testing
    initializeSampleData() {
        const sampleOperations = [
            {
                operationId: "offline_op_001",
                deviceId: "device-001",
                userId: "user-001",
                operationType: "clinical_assessment",
                workflowCategory: "patient_care",
                offlineStartTime: new Date(Date.now() - 3600000), // 1 hour ago
                offlineEndTime: new Date(Date.now() - 1800000), // 30 minutes ago
                offlineDurationMinutes: 30,
                recordsCreated: 5,
                recordsModified: 12,
                recordsAccessed: 45,
                dataSizeProcessedMb: 2.3,
                syncConflictsDetected: 0,
                conflictTypes: [],
                conflictResolutionMethods: [],
                manualResolutionRequired: 0,
                localProcessingEfficiency: 92.5,
                userExperienceRating: 4.2,
                operationSuccessRate: 98.5,
                cacheHitRate: 89.2,
                predictiveLoadingAccuracy: 85.7,
                bandwidthOptimizationSavings: 1.2,
                dataIntegrityScore: 99.1,
                validationErrors: 0,
                correctionActionsTaken: [],
                syncTimestamp: new Date(Date.now() - 1200000), // 20 minutes ago
                syncSuccess: true,
                syncDurationSeconds: 45,
                syncDataSizeMb: 2.1,
                status: "completed",
                priority: "high",
                metadata: {
                    patientCount: 3,
                    formsCompleted: 5,
                    assessmentType: "comprehensive",
                },
            },
            {
                operationId: "offline_op_002",
                deviceId: "device-002",
                userId: "user-002",
                operationType: "form_submission",
                workflowCategory: "documentation",
                offlineStartTime: new Date(Date.now() - 1800000), // 30 minutes ago
                recordsCreated: 8,
                recordsModified: 3,
                recordsAccessed: 15,
                dataSizeProcessedMb: 1.8,
                syncConflictsDetected: 1,
                conflictTypes: ["timestamp_conflict"],
                conflictResolutionMethods: ["latest_wins"],
                manualResolutionRequired: 0,
                localProcessingEfficiency: 87.3,
                userExperienceRating: 3.9,
                operationSuccessRate: 95.2,
                cacheHitRate: 76.4,
                predictiveLoadingAccuracy: 82.1,
                bandwidthOptimizationSavings: 0.8,
                dataIntegrityScore: 97.8,
                validationErrors: 1,
                correctionActionsTaken: ["auto_correction_applied"],
                status: "in_progress",
                priority: "medium",
                metadata: {
                    formType: "patient_assessment",
                    fieldsCompleted: 23,
                    validationsPassed: 22,
                },
            },
        ];
        sampleOperations.forEach((operation) => {
            this.operations.set(operation.operationId, operation);
        });
    }
}
// Export singleton instance
export const offlineIntelligenceService = new OfflineIntelligenceService();
export default offlineIntelligenceService;
