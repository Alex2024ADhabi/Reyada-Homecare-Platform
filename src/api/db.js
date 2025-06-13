// Re-export from mock-db for browser environment
import mockDb, { initializeSampleData, ObjectId } from "./mock-db";
// Mock database connection functions
export const connectToDatabase = async () => {
    console.log("Connected to mock database");
    return mockDb;
};
export const getDb = () => {
    return mockDb;
};
export const closeDatabase = async () => {
    console.log("Mock database connection closed");
};
export const createIndexes = async () => {
    console.log("Mock indexes created");
};
export const initializeSchema = async () => {
    console.log("Mock schema initialized");
};
export const resetDatabase = () => {
    console.log("Mock database reset");
    // Clear existing data
    if (mockDb.referrals) {
        mockDb.referrals.data = [];
    }
    // Re-initialize with fresh data
    initializeSampleData().catch(console.error);
    initializeEdgeDeviceSchema().catch(console.error);
    initializeEnhancedSchema().catch(console.error);
};
// Edge Device Intelligence Database Schema
export const initializeEdgeDeviceSchema = async () => {
    console.log("Initializing Edge Device Intelligence Database Schema");
    // Edge Devices Collection
    mockDb.edgeDevices = {
        indexes: {
            deviceId: {},
            deviceType: {},
            status: {},
            location: {},
            capabilities: {},
        },
        data: [],
    };
    // Edge Workloads Collection
    mockDb.edgeWorkloads = {
        indexes: {
            workloadId: {},
            assignedDevice: {},
            priority: {},
            status: {},
            type: {},
        },
        data: [],
    };
    // Edge Analytics Collection
    mockDb.edgeAnalytics = {
        indexes: {
            timestamp: {},
            deviceId: {},
            metricType: {},
            aggregationLevel: {},
        },
        data: [],
    };
    // Edge Conflicts Collection
    mockDb.edgeConflicts = {
        indexes: {
            conflictId: {},
            conflictType: {},
            severity: {},
            status: {},
            affectedEntities: {},
        },
        data: [],
    };
    // Edge Cache Entries Collection
    mockDb.edgeCacheEntries = {
        indexes: {
            cacheKey: {},
            dataType: {},
            priority: {},
            tags: {},
            createdAt: {},
        },
        data: [],
    };
    // Edge Sync Operations Collection
    mockDb.edgeSyncOperations = {
        indexes: {
            operationId: {},
            deviceId: {},
            syncType: {},
            status: {},
            timestamp: {},
        },
        data: [],
    };
    // Edge Performance Metrics Collection
    mockDb.edgePerformanceMetrics = {
        indexes: {
            deviceId: {},
            metricName: {},
            timestamp: {},
            aggregationPeriod: {},
        },
        data: [],
    };
    // Edge Security Events Collection
    mockDb.edgeSecurityEvents = {
        indexes: {
            eventId: {},
            deviceId: {},
            eventType: {},
            severity: {},
            timestamp: {},
        },
        data: [],
    };
    // Edge Network Topology Collection
    mockDb.edgeNetworkTopology = {
        indexes: {
            nodeId: {},
            nodeType: {},
            parentNode: {},
            networkZone: {},
        },
        data: [],
    };
    // Edge Resource Utilization Collection
    mockDb.edgeResourceUtilization = {
        indexes: {
            deviceId: {},
            resourceType: {},
            timestamp: {},
            utilizationLevel: {},
        },
        data: [],
    };
    console.log("Edge Device Intelligence Database Schema initialized successfully");
};
// Enhanced Database Schema Extensions
export const initializeEnhancedSchema = async () => {
    console.log("Initializing Enhanced Database Schema Extensions");
    // ML Model Performance Tables
    mockDb.mlModelPerformance = {
        indexes: {
            modelId: {},
            modelType: {},
            version: {},
            timestamp: {},
            accuracy: {},
            environment: {},
        },
        data: [],
    };
    mockDb.mlModelMetrics = {
        indexes: {
            modelId: {},
            metricType: {},
            timestamp: {},
            value: {},
        },
        data: [],
    };
    mockDb.mlModelTraining = {
        indexes: {
            trainingId: {},
            modelId: {},
            status: {},
            startTime: {},
            endTime: {},
        },
        data: [],
    };
    // Analytics Workloads Schema
    mockDb.analyticsWorkloads = {
        indexes: {
            workloadId: {},
            workloadType: {},
            status: {},
            priority: {},
            scheduledTime: {},
            executionTime: {},
        },
        data: [],
    };
    mockDb.analyticsJobs = {
        indexes: {
            jobId: {},
            workloadId: {},
            jobType: {},
            status: {},
            createdAt: {},
            completedAt: {},
        },
        data: [],
    };
    mockDb.analyticsResults = {
        indexes: {
            resultId: {},
            jobId: {},
            resultType: {},
            timestamp: {},
            dataSize: {},
        },
        data: [],
    };
    // Edge Device Intelligence Tables (Enhanced)
    mockDb.edgeDeviceProfiles = {
        indexes: {
            deviceId: {},
            profileType: {},
            lastUpdated: {},
            capabilities: {},
            performance: {},
        },
        data: [],
    };
    mockDb.edgeWorkloadOptimization = {
        indexes: {
            optimizationId: {},
            deviceId: {},
            workloadType: {},
            optimizationStrategy: {},
            timestamp: {},
        },
        data: [],
    };
    mockDb.edgeNetworkTopologyEnhanced = {
        indexes: {
            nodeId: {},
            parentNodeId: {},
            nodeType: {},
            networkZone: {},
            connectionQuality: {},
        },
        data: [],
    };
    // Offline Operations Schema
    mockDb.offlineOperations = {
        indexes: {
            operationId: {},
            deviceId: {},
            operationType: {},
            syncStatus: {},
            priority: {},
            timestamp: {},
        },
        data: [],
    };
    mockDb.offlineSyncQueue = {
        indexes: {
            queueId: {},
            deviceId: {},
            dataType: {},
            syncPriority: {},
            queuedAt: {},
            attempts: {},
        },
        data: [],
    };
    mockDb.offlineConflictResolution = {
        indexes: {
            conflictId: {},
            deviceId: {},
            conflictType: {},
            resolutionStrategy: {},
            status: {},
            detectedAt: {},
        },
        data: [],
    };
    mockDb.offlineDataIntegrity = {
        indexes: {
            integrityId: {},
            deviceId: {},
            dataType: {},
            checksumType: {},
            validationStatus: {},
            timestamp: {},
        },
        data: [],
    };
    // Security Intelligence Tables
    mockDb.securityEvents = {
        indexes: {
            eventId: {},
            eventType: {},
            severity: {},
            sourceIp: {},
            userId: {},
            timestamp: {},
            resolved: {},
        },
        data: [],
    };
    mockDb.securityThreats = {
        indexes: {
            threatId: {},
            threatType: {},
            riskLevel: {},
            detectionMethod: {},
            status: {},
            firstDetected: {},
            lastSeen: {},
        },
        data: [],
    };
    mockDb.securityAnomalies = {
        indexes: {
            anomalyId: {},
            anomalyType: {},
            confidence: {},
            deviceId: {},
            userId: {},
            detectedAt: {},
            investigated: {},
        },
        data: [],
    };
    mockDb.securityCompliance = {
        indexes: {
            complianceId: {},
            complianceType: {},
            status: {},
            lastAudit: {},
            nextAudit: {},
            riskScore: {},
        },
        data: [],
    };
    mockDb.securityIncidents = {
        indexes: {
            incidentId: {},
            incidentType: {},
            severity: {},
            status: {},
            reportedBy: {},
            assignedTo: {},
            createdAt: {},
            resolvedAt: {},
        },
        data: [],
    };
    // Cache Performance Tables
    mockDb.cachePerformanceMetrics = {
        indexes: {
            metricId: {},
            cacheLayer: {},
            metricType: {},
            timestamp: {},
            value: {},
        },
        data: [],
    };
    mockDb.cacheAnalytics = {
        indexes: {
            analyticsId: {},
            cacheLayer: {},
            timeWindow: {},
            aggregationType: {},
            timestamp: {},
        },
        data: [],
    };
    mockDb.cachePredictions = {
        indexes: {
            predictionId: {},
            cacheKey: {},
            predictionType: {},
            confidence: {},
            predictedTime: {},
            actualTime: {},
        },
        data: [],
    };
    // Integration Intelligence Tables
    mockDb.integrationHealth = {
        indexes: {
            healthId: {},
            systemId: {},
            healthScore: {},
            status: {},
            lastCheck: {},
            issues: {},
        },
        data: [],
    };
    mockDb.integrationPerformance = {
        indexes: {
            performanceId: {},
            systemId: {},
            metricType: {},
            value: {},
            timestamp: {},
            threshold: {},
        },
        data: [],
    };
    mockDb.integrationAlerts = {
        indexes: {
            alertId: {},
            systemId: {},
            alertType: {},
            severity: {},
            status: {},
            createdAt: {},
            acknowledgedAt: {},
        },
        data: [],
    };
    // Populate sample data for enhanced schema
    await populateEnhancedSampleData();
    console.log("Enhanced Database Schema Extensions initialized successfully");
};
// Populate Enhanced Sample Data
const populateEnhancedSampleData = async () => {
    // ML Model Performance Sample Data
    const mlModelPerformanceData = [
        {
            _id: new ObjectId(),
            modelId: "model_001",
            modelName: "Patient Risk Prediction",
            modelType: "classification",
            version: "1.2.3",
            accuracy: 0.94,
            precision: 0.92,
            recall: 0.89,
            f1Score: 0.905,
            environment: "production",
            trainingDataSize: 50000,
            lastTrained: "2024-01-15T10:00:00Z",
            deployedAt: "2024-01-16T08:00:00Z",
            status: "active",
            performanceMetrics: {
                inferenceTime: 45,
                throughput: 1200,
                memoryUsage: 512,
                cpuUsage: 25,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            _id: new ObjectId(),
            modelId: "model_002",
            modelName: "Cache Access Prediction",
            modelType: "regression",
            version: "2.1.0",
            accuracy: 0.87,
            mse: 0.023,
            mae: 0.15,
            r2Score: 0.91,
            environment: "production",
            trainingDataSize: 100000,
            lastTrained: "2024-01-17T14:00:00Z",
            deployedAt: "2024-01-17T16:00:00Z",
            status: "active",
            performanceMetrics: {
                inferenceTime: 12,
                throughput: 5000,
                memoryUsage: 256,
                cpuUsage: 15,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];
    mockDb.mlModelPerformance.data = mlModelPerformanceData;
    // Analytics Workloads Sample Data
    const analyticsWorkloadsData = [
        {
            _id: new ObjectId(),
            workloadId: "workload_001",
            workloadName: "Daily Patient Analytics",
            workloadType: "batch_processing",
            description: "Daily aggregation of patient care metrics",
            schedule: "0 2 * * *",
            priority: "high",
            status: "scheduled",
            estimatedDuration: 1800,
            resourceRequirements: {
                cpu: 4,
                memory: 8192,
                storage: 50000,
                networkBandwidth: 100,
            },
            dataInputs: ["patient_visits", "clinical_assessments", "care_plans"],
            dataOutputs: [
                "patient_analytics_summary",
                "care_quality_metrics",
                "utilization_reports",
            ],
            lastExecution: "2024-01-18T02:00:00Z",
            nextExecution: "2024-01-19T02:00:00Z",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];
    mockDb.analyticsWorkloads.data = analyticsWorkloadsData;
    // Security Intelligence Sample Data
    const securityEventsData = [
        {
            _id: new ObjectId(),
            eventId: "sec_event_001",
            eventType: "authentication_failure",
            severity: "medium",
            description: "Multiple failed login attempts detected",
            sourceIp: "192.168.1.45",
            userId: "user_123",
            deviceId: "device_456",
            attemptCount: 5,
            timeWindow: "2024-01-18T10:15:00Z to 2024-01-18T10:20:00Z",
            resolved: false,
            investigationStatus: "pending",
            riskScore: 65,
            timestamp: "2024-01-18T10:20:00Z",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];
    mockDb.securityEvents.data = securityEventsData;
    // Cache Performance Sample Data
    const cachePerformanceData = [
        {
            _id: new ObjectId(),
            metricId: "cache_metric_001",
            cacheLayer: "redis_cluster",
            metricType: "hit_ratio",
            value: 87.5,
            unit: "percentage",
            threshold: {
                target: 85,
                warning: 75,
                critical: 65,
            },
            status: "healthy",
            timestamp: "2024-01-18T15:00:00Z",
            aggregationPeriod: "5m",
            created_at: new Date().toISOString(),
        },
    ];
    mockDb.cachePerformanceMetrics.data = cachePerformanceData;
    console.log("Enhanced sample data populated successfully!");
};
// Re-export other utilities
export { initializeSampleData, ObjectId };
// Initialize DOH Compliance Schema
export const initializeDOHComplianceSchema = async () => {
    console.log("Initializing DOH Compliance Database Schema");
    // DOH Audit Compliance Collection
    mockDb.dohAuditCompliance = {
        indexes: {
            facilityId: {},
            auditType: {},
            complianceScore: {},
            auditDate: {},
            status: {},
        },
        data: [],
    };
    // DOH Audit Requirements Collection
    mockDb.dohAuditRequirements = {
        indexes: {
            requirementCode: {},
            category: {},
            priority: {},
            complianceLevel: {},
            status: {},
        },
        data: [],
    };
    // Tawteen Compliance Collection
    mockDb.tawteenCompliance = {
        indexes: {
            facilityId: {},
            reportingPeriod: {},
            emiratizationPercentage: {},
            complianceStatus: {},
            region: {},
        },
        data: [],
    };
    // Patient Safety Incidents Collection (Enhanced)
    mockDb.patientSafetyIncidents = {
        indexes: {
            incidentId: {},
            taxonomyCategory: {},
            levelOfHarm: {},
            dohReportable: {},
            preventable: {},
            incidentDate: {},
        },
        data: [],
    };
    // Home Healthcare Referrals Collection
    mockDb.homecareReferrals = {
        indexes: {
            referralId: {},
            patientId: {},
            status: {},
            eligibilityStatus: {},
            createdDate: {},
            referringFacility: {},
        },
        data: [],
    };
    // DOH Service Codes 2024 Collection
    mockDb.dohServiceCodes2024 = {
        indexes: {
            serviceCode: {},
            category: {},
            effectiveDate: {},
            deprecated: {},
            price: {},
        },
        data: [],
    };
    // Patient Complaint Management Collection
    mockDb.patientComplaints = {
        indexes: {
            complaintId: {},
            patientName: {},
            complaintType: {},
            status: {},
            severity: {},
            dateReceived: {},
            assignedTo: {},
            channelOfCommunication: {},
        },
        data: [],
    };
    // Complaint Actions Collection
    mockDb.complaintActions = {
        indexes: {
            actionId: {},
            complaintId: {},
            actionType: {},
            performedBy: {},
            actionDate: {},
            status: {},
        },
        data: [],
    };
    // Complaint Approvals Collection
    mockDb.complaintApprovals = {
        indexes: {
            approvalId: {},
            complaintId: {},
            approverRole: {},
            approvedBy: {},
            approvalDate: {},
            status: {},
        },
        data: [],
    };
    console.log("DOH Compliance Database Schema initialized successfully");
};
// Initialize Patient Complaint Sample Data
const initializePatientComplaintData = async () => {
    console.log("Initializing Patient Complaint Sample Data");
    const sampleComplaints = [
        {
            _id: new ObjectId(),
            complaintId: "RH-2025-001",
            serialNumber: 1,
            complaintDate: "2025-01-01T00:00:00Z",
            patientName: "Abdulrahman Al Hosani",
            complaintType: "Verbal",
            description: "The patient's mother is dissatisfied because a new nurse was assigned who is not familiar with the plan of care for the night shift.",
            channelOfCommunication: "Phone Call",
            communicatedBy: "Case Coordinator",
            dateOfCommunication: "2025-01-01T00:00:00Z",
            immediateActionPlan: "Charge nurse has been informed",
            caseCoordinator: "Case Coordinator",
            nurseSupervisorActionPlan: "Instructed charge nurse to always brief new nurses about the plan of care and don't send without shadowing",
            nurseSupervisorApproval1: "Approved",
            nurseSupervisorApproval2: "Approved",
            qaoApproval: "Approved",
            status: "Closed",
            dateSubmitted: "2025-01-04T00:00:00Z",
            submittedBy: "Case Coordinator",
            reviewedBy: "Dr Abinaya Karthikayani",
            validatedBy: "Ali Alahmad",
            severity: "Medium",
            resolutionTime: 72,
            followUpRequired: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];
    const sampleActions = [
        {
            _id: new ObjectId(),
            actionId: "ACT-2025-001",
            complaintId: "RH-2025-001",
            actionType: "Immediate Action",
            description: "Charge nurse has been informed",
            performedBy: "Case Coordinator",
            actionDate: "2025-01-01T00:00:00Z",
            status: "Completed",
            created_at: new Date().toISOString(),
        },
        {
            _id: new ObjectId(),
            actionId: "ACT-2025-002",
            complaintId: "RH-2025-001",
            actionType: "Corrective Action",
            description: "Instructed charge nurse to always brief new nurses about the plan of care and don't send without shadowing",
            performedBy: "Nurse Supervisor",
            actionDate: "2025-01-02T00:00:00Z",
            status: "Completed",
            created_at: new Date().toISOString(),
        },
    ];
    const sampleApprovals = [
        {
            _id: new ObjectId(),
            approvalId: "APP-2025-001",
            complaintId: "RH-2025-001",
            approverRole: "Nurse Supervisor 1",
            approvedBy: "Nurse Supervisor",
            approvalDate: "2025-01-02T00:00:00Z",
            status: "Approved",
            created_at: new Date().toISOString(),
        },
        {
            _id: new ObjectId(),
            approvalId: "APP-2025-002",
            complaintId: "RH-2025-001",
            approverRole: "Nurse Supervisor 2",
            approvedBy: "Nurse Supervisor",
            approvalDate: "2025-01-02T00:00:00Z",
            status: "Approved",
            created_at: new Date().toISOString(),
        },
        {
            _id: new ObjectId(),
            approvalId: "APP-2025-003",
            complaintId: "RH-2025-001",
            approverRole: "QAO",
            approvedBy: "Ali Alahmad",
            approvalDate: "2025-01-04T00:00:00Z",
            status: "Approved",
            created_at: new Date().toISOString(),
        },
    ];
    mockDb.patientComplaints.data = sampleComplaints;
    mockDb.complaintActions.data = sampleActions;
    mockDb.complaintApprovals.data = sampleApprovals;
    console.log("Patient Complaint Sample Data initialized successfully");
};
// Initialize sample data on module load
initializeSampleData().catch(console.error);
initializeEdgeDeviceSchema().catch(console.error);
initializeEnhancedSchema().catch(console.error);
initializeDOHComplianceSchema().catch(console.error);
initializePatientComplaintData().catch(console.error);
export default mockDb;
