// Enhanced Database Configuration for Healthcare Platform
// Comprehensive schema definitions for all platform modules
export const DATABASE_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "healthcare_platform",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    ssl: process.env.NODE_ENV === "production",
    pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
    },
};
// ML Model Performance Schema
export const ML_MODEL_PERFORMANCE_SCHEMA = {
    mlModelPerformance: {
        tableName: "ml_model_performance",
        primaryKey: "model_id",
        indexes: {
            model_name_index: ["model_name"],
            deployment_date_index: ["deployment_date"],
            performance_score_index: ["performance_score"],
            created_at_index: ["created_at"],
        },
        schema: {
            model_id: { type: "string", required: true },
            model_name: { type: "string", required: true },
            model_version: { type: "string", required: true },
            deployment_date: { type: "date", required: true },
            performance_metrics: {
                type: "object",
                properties: {
                    accuracy: { type: "number", min: 0, max: 1 },
                    precision: { type: "number", min: 0, max: 1 },
                    recall: { type: "number", min: 0, max: 1 },
                    f1_score: { type: "number", min: 0, max: 1 },
                    auc_roc: { type: "number", min: 0, max: 1 },
                },
            },
            training_data_size: { type: "number", required: true },
            validation_data_size: { type: "number", required: true },
            test_data_size: { type: "number", required: true },
            feature_count: { type: "number", required: true },
            training_duration_minutes: { type: "number", required: true },
            inference_latency_ms: { type: "number", required: true },
            memory_usage_mb: { type: "number", required: true },
            cpu_usage_percent: { type: "number", min: 0, max: 100 },
            gpu_usage_percent: { type: "number", min: 0, max: 100 },
            model_size_mb: { type: "number", required: true },
            hyperparameters: { type: "object" },
            cross_validation_scores: { type: "array", items: { type: "number" } },
            feature_importance: { type: "object" },
            confusion_matrix: { type: "array" },
            classification_report: { type: "object" },
            performance_score: { type: "number", min: 0, max: 100, required: true },
            model_status: {
                type: "enum",
                values: ["training", "deployed", "deprecated", "failed"],
                required: true,
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            created_by: { type: "string", required: true },
        },
    },
};
// Analytics Workloads Schema
export const ANALYTICS_WORKLOADS_SCHEMA = {
    analyticsWorkloads: {
        tableName: "analytics_workloads",
        primaryKey: "workload_id",
        indexes: {
            workload_type_index: ["workload_type"],
            status_index: ["status"],
            priority_index: ["priority"],
            created_at_index: ["created_at"],
            scheduled_time_index: ["scheduled_time"],
        },
        schema: {
            workload_id: { type: "string", required: true },
            workload_name: { type: "string", required: true },
            workload_type: {
                type: "enum",
                values: [
                    "data_processing",
                    "model_training",
                    "batch_inference",
                    "real_time_analytics",
                    "report_generation",
                ],
                required: true,
            },
            description: { type: "string" },
            input_data_sources: { type: "array", items: { type: "string" } },
            output_destinations: { type: "array", items: { type: "string" } },
            resource_requirements: {
                type: "object",
                properties: {
                    cpu_cores: { type: "number", min: 1 },
                    memory_gb: { type: "number", min: 1 },
                    storage_gb: { type: "number", min: 1 },
                    gpu_count: { type: "number", min: 0 },
                    estimated_duration_minutes: { type: "number", min: 1 },
                },
            },
            scheduling: {
                type: "object",
                properties: {
                    schedule_type: {
                        type: "enum",
                        values: ["immediate", "scheduled", "recurring", "event_driven"],
                    },
                    scheduled_time: { type: "date" },
                    recurrence_pattern: { type: "string" },
                    timezone: { type: "string" },
                },
            },
            priority: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
                default: "medium",
            },
            status: {
                type: "enum",
                values: [
                    "pending",
                    "queued",
                    "running",
                    "completed",
                    "failed",
                    "cancelled",
                ],
                default: "pending",
            },
            execution_details: {
                type: "object",
                properties: {
                    start_time: { type: "date" },
                    end_time: { type: "date" },
                    duration_minutes: { type: "number" },
                    records_processed: { type: "number" },
                    error_count: { type: "number" },
                    warning_count: { type: "number" },
                    success_rate: { type: "number", min: 0, max: 100 },
                },
            },
            performance_metrics: {
                type: "object",
                properties: {
                    throughput_records_per_second: { type: "number" },
                    cpu_utilization_percent: { type: "number", min: 0, max: 100 },
                    memory_utilization_percent: { type: "number", min: 0, max: 100 },
                    io_operations_per_second: { type: "number" },
                    network_bandwidth_mbps: { type: "number" },
                },
            },
            dependencies: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            created_by: { type: "string", required: true },
            last_executed_by: { type: "string" },
        },
    },
};
// Edge Device Intelligence Schema
export const EDGE_DEVICE_INTELLIGENCE_SCHEMA = {
    edgeDevices: {
        tableName: "edge_devices",
        primaryKey: "device_id",
        indexes: {
            device_type_index: ["device_type"],
            location_index: ["location"],
            status_index: ["status"],
            last_heartbeat_index: ["last_heartbeat"],
            created_at_index: ["created_at"],
        },
        schema: {
            device_id: { type: "string", required: true },
            device_name: { type: "string", required: true },
            device_type: {
                type: "enum",
                values: [
                    "medical_sensor",
                    "monitoring_device",
                    "diagnostic_equipment",
                    "iot_gateway",
                    "edge_server",
                ],
                required: true,
            },
            manufacturer: { type: "string" },
            model: { type: "string" },
            serial_number: { type: "string" },
            firmware_version: { type: "string" },
            location: { type: "string", required: true },
            coordinates: {
                type: "object",
                properties: {
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                    altitude: { type: "number" },
                },
            },
            network_config: {
                type: "object",
                properties: {
                    ip_address: { type: "string" },
                    mac_address: { type: "string" },
                    network_type: {
                        type: "enum",
                        values: ["ethernet", "wifi", "cellular", "bluetooth", "zigbee"],
                    },
                    connection_quality: { type: "number", min: 0, max: 100 },
                },
            },
            hardware_specs: {
                type: "object",
                properties: {
                    cpu_model: { type: "string" },
                    cpu_cores: { type: "number" },
                    memory_gb: { type: "number" },
                    storage_gb: { type: "number" },
                    gpu_model: { type: "string" },
                    power_consumption_watts: { type: "number" },
                },
            },
            capabilities: {
                type: "object",
                properties: {
                    data_collection: { type: "boolean", default: false },
                    real_time_processing: { type: "boolean", default: false },
                    ml_inference: { type: "boolean", default: false },
                    data_storage: { type: "boolean", default: false },
                    remote_management: { type: "boolean", default: false },
                },
            },
            status: {
                type: "enum",
                values: ["online", "offline", "maintenance", "error", "unknown"],
                default: "unknown",
            },
            health_metrics: {
                type: "object",
                properties: {
                    cpu_usage_percent: { type: "number", min: 0, max: 100 },
                    memory_usage_percent: { type: "number", min: 0, max: 100 },
                    storage_usage_percent: { type: "number", min: 0, max: 100 },
                    temperature_celsius: { type: "number" },
                    uptime_hours: { type: "number" },
                    error_count: { type: "number", default: 0 },
                },
            },
            last_heartbeat: { type: "date" },
            data_sync_status: {
                type: "object",
                properties: {
                    last_sync: { type: "date" },
                    pending_records: { type: "number", default: 0 },
                    sync_errors: { type: "number", default: 0 },
                    bandwidth_usage_mb: { type: "number", default: 0 },
                },
            },
            security_config: {
                type: "object",
                properties: {
                    encryption_enabled: { type: "boolean", default: false },
                    certificate_expiry: { type: "date" },
                    last_security_scan: { type: "date" },
                    vulnerability_count: { type: "number", default: 0 },
                },
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            created_by: { type: "string", required: true },
            last_maintained_by: { type: "string" },
            last_maintenance_date: { type: "date" },
        },
    },
};
// Offline Operations Schema
export const OFFLINE_OPERATIONS_SCHEMA = {
    offlineOperations: {
        tableName: "offline_operations",
        primaryKey: "operation_id",
        indexes: {
            operation_type_index: ["operation_type"],
            status_index: ["status"],
            priority_index: ["priority"],
            created_at_index: ["created_at"],
            device_id_index: ["device_id"],
        },
        schema: {
            operation_id: { type: "string", required: true },
            operation_type: {
                type: "enum",
                values: [
                    "data_collection",
                    "form_submission",
                    "patient_assessment",
                    "clinical_documentation",
                    "incident_report",
                    "quality_check",
                ],
                required: true,
            },
            device_id: { type: "string", required: true },
            user_id: { type: "string", required: true },
            patient_id: { type: "string" },
            operation_data: { type: "object", required: true },
            metadata: {
                type: "object",
                properties: {
                    location: { type: "string" },
                    timestamp: { type: "date" },
                    app_version: { type: "string" },
                    device_info: { type: "object" },
                    network_status: { type: "string" },
                },
            },
            priority: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
                default: "medium",
            },
            status: {
                type: "enum",
                values: ["pending", "syncing", "synced", "failed", "conflict"],
                default: "pending",
            },
            sync_attempts: { type: "number", default: 0 },
            last_sync_attempt: { type: "date" },
            sync_error: { type: "string" },
            conflict_resolution: {
                type: "object",
                properties: {
                    conflict_type: { type: "string" },
                    resolution_strategy: { type: "string" },
                    resolved_by: { type: "string" },
                    resolved_at: { type: "date" },
                },
            },
            data_integrity: {
                type: "object",
                properties: {
                    checksum: { type: "string" },
                    validation_status: { type: "boolean" },
                    validation_errors: { type: "array", items: { type: "string" } },
                },
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            synced_at: { type: "date" },
        },
    },
};
// Security Intelligence Schema
export const SECURITY_INTELLIGENCE_SCHEMA = {
    securityEvents: {
        tableName: "security_events",
        primaryKey: "event_id",
        indexes: {
            event_type_index: ["event_type"],
            severity_index: ["severity"],
            status_index: ["status"],
            created_at_index: ["created_at"],
            user_id_index: ["user_id"],
            ip_address_index: ["ip_address"],
        },
        schema: {
            event_id: { type: "string", required: true },
            event_type: {
                type: "enum",
                values: [
                    "login_attempt",
                    "failed_authentication",
                    "unauthorized_access",
                    "data_access",
                    "data_modification",
                    "system_breach",
                    "malware_detection",
                    "suspicious_activity",
                ],
                required: true,
            },
            severity: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
                required: true,
            },
            description: { type: "string", required: true },
            user_id: { type: "string" },
            ip_address: { type: "string" },
            user_agent: { type: "string" },
            location: {
                type: "object",
                properties: {
                    country: { type: "string" },
                    region: { type: "string" },
                    city: { type: "string" },
                    coordinates: {
                        type: "object",
                        properties: {
                            latitude: { type: "number" },
                            longitude: { type: "number" },
                        },
                    },
                },
            },
            affected_resources: { type: "array", items: { type: "string" } },
            attack_vector: { type: "string" },
            indicators_of_compromise: { type: "array", items: { type: "string" } },
            mitigation_actions: { type: "array", items: { type: "string" } },
            status: {
                type: "enum",
                values: ["open", "investigating", "resolved", "false_positive"],
                default: "open",
            },
            investigation_notes: { type: "string" },
            resolved_by: { type: "string" },
            resolved_at: { type: "date" },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
        },
    },
};
// ADHICS V2 Compliance Framework Schema Configuration
export const ADHICS_V2_COMPLIANCE_SCHEMA = {
    // ADHICS V2 Governance Structure
    adhicsGovernanceStructure: {
        tableName: "adhics_governance_structure",
        primaryKey: "governance_id",
        indexes: {
            facility_id_index: ["facility_id"],
            compliance_level_index: ["adhics_v2_compliance_level"],
            ciso_index: ["ciso_staff_id"],
            compliance_deadline_index: ["compliance_deadline"],
            created_at_index: ["created_at"],
        },
        schema: {
            governance_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Information Security Governance Committee (ISGC)
            isgc_established: { type: "boolean", default: false },
            isgc_chairman_id: { type: "string" },
            isgc_charter_approved: { type: "boolean", default: false },
            isgc_meeting_frequency: { type: "string", default: "quarterly" },
            isgc_quorum_percentage: { type: "number", default: 60 },
            isgc_last_meeting_date: { type: "date" },
            isgc_minutes_documented: { type: "boolean", default: false },
            // Health Information Infrastructure Protection (HIIP) Workgroup
            hiip_established: { type: "boolean", default: false },
            hiip_chairperson_id: { type: "string" },
            hiip_members: { type: "array", items: { type: "object" }, default: [] },
            hiip_charter_approved: { type: "boolean", default: false },
            hiip_reporting_structure_defined: { type: "boolean", default: false },
            // Chief Information Security Officer (CISO)
            ciso_appointed: { type: "boolean", default: false },
            ciso_staff_id: { type: "string" },
            ciso_qualifications: { type: "object" },
            ciso_responsibilities_defined: { type: "boolean", default: false },
            ciso_reporting_line: { type: "string", default: "ISGC" },
            // Implementation Stakeholders
            implementation_team_established: { type: "boolean", default: false },
            implementation_team_members: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            roles_responsibilities_defined: { type: "boolean", default: false },
            // Policy Framework
            information_security_policy_approved: { type: "boolean", default: false },
            policy_review_cycle: { type: "string", default: "annual" },
            document_control_procedure: { type: "boolean", default: false },
            // Compliance Status
            adhics_v2_compliance_level: {
                type: "enum",
                values: ["basic", "transitional", "advanced", "service_provider"],
            },
            compliance_deadline: { type: "date" },
            compliance_percentage: { type: "number", min: 0, max: 100, default: 0 },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
        },
    },
    // ADHICS V2 Control Implementation Tracking
    adhicsControlImplementation: {
        tableName: "adhics_control_implementation",
        primaryKey: "control_id",
        indexes: {
            facility_id_index: ["facility_id"],
            control_reference_index: ["control_reference"],
            control_domain_index: ["control_domain"],
            control_category_index: ["control_category"],
            implementation_status_index: ["implementation_status"],
            compliant_index: ["compliant"],
            risk_level_index: ["risk_level"],
            created_at_index: ["created_at"],
        },
        schema: {
            control_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Control Details
            control_reference: { type: "string", required: true }, // HR1.1, AM2.3, etc.
            control_name: { type: "string", required: true },
            control_domain: { type: "string", required: true },
            control_category: {
                type: "enum",
                values: ["basic", "transitional", "advanced", "service_provider"],
                required: true,
            },
            // Implementation Status
            implementation_status: {
                type: "enum",
                values: ["not_started", "in_progress", "completed", "under_review"],
                default: "not_started",
            },
            implementation_start_date: { type: "date" },
            implementation_target_date: { type: "date" },
            implementation_completion_date: { type: "date" },
            implementation_percentage: {
                type: "number",
                min: 0,
                max: 100,
                default: 0,
            },
            // Evidence and Documentation
            evidence_provided: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            documentation_complete: { type: "boolean", default: false },
            policy_procedures_developed: { type: "boolean", default: false },
            staff_training_completed: { type: "boolean", default: false },
            technical_controls_implemented: { type: "boolean", default: false },
            // Validation and Assessment
            self_assessment_completed: { type: "boolean", default: false },
            self_assessment_score: { type: "number", min: 0, max: 100 },
            internal_audit_completed: { type: "boolean", default: false },
            internal_audit_score: { type: "number", min: 0, max: 100 },
            external_assessment_completed: { type: "boolean", default: false },
            external_assessment_score: { type: "number", min: 0, max: 100 },
            // Compliance Tracking
            compliant: { type: "boolean", default: false },
            compliance_date: { type: "date" },
            non_conformities: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            corrective_actions: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            improvement_opportunities: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            // Risk Assessment
            risk_level: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
            },
            risk_mitigation_measures: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            residual_risk_level: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
        },
    },
    // ADHICS V2 Asset Management Implementation
    adhicsAssetManagement: {
        tableName: "adhics_asset_management",
        primaryKey: "asset_id",
        indexes: {
            facility_id_index: ["facility_id"],
            asset_tag_index: ["asset_tag"],
            asset_type_index: ["asset_type"],
            classification_level_index: ["classification_level"],
            asset_owner_index: ["asset_owner_id"],
            adhics_compliant_index: ["adhics_compliant"],
            created_at_index: ["created_at"],
        },
        schema: {
            asset_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Asset Identification
            asset_tag: { type: "string", required: true },
            asset_name: { type: "string", required: true },
            asset_type: {
                type: "enum",
                values: ["IT", "biomedical", "infrastructure", "information"],
                required: true,
            },
            asset_category: { type: "string", required: true },
            // Asset Classification (ADHICS V2 Requirement)
            classification_level: {
                type: "enum",
                values: ["public", "restricted", "confidential", "secret"],
                required: true,
            },
            classification_rationale: { type: "string" },
            classification_date: { type: "date", required: true },
            classification_review_date: { type: "date" },
            // Asset Ownership and Custody
            asset_owner_id: { type: "string", required: true },
            asset_custodian_id: { type: "string" },
            business_owner_id: { type: "string" },
            owner_responsibilities_defined: { type: "boolean", default: false },
            // Asset Details
            manufacturer: { type: "string" },
            model: { type: "string" },
            serial_number: { type: "string" },
            acquisition_date: { type: "date" },
            warranty_expiry_date: { type: "date" },
            location: { type: "string" },
            // Security Controls
            security_controls_applied: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            access_restrictions: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            handling_procedures_defined: { type: "boolean", default: false },
            disposal_procedures_defined: { type: "boolean", default: false },
            // Medical Device Specific (ADHICS V2)
            is_medical_device: { type: "boolean", default: false },
            medical_device_classification: { type: "string" },
            fda_class: { type: "string" },
            connected_to_network: { type: "boolean", default: false },
            patient_data_storage: { type: "boolean", default: false },
            encryption_enabled: { type: "boolean", default: false },
            authentication_required: { type: "boolean", default: false },
            // Risk Assessment
            risk_assessment_completed: { type: "boolean", default: false },
            risk_level: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
            },
            risk_mitigation_measures: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            // Compliance Status
            adhics_compliant: { type: "boolean", default: false },
            compliance_gaps: {
                type: "array",
                items: { type: "string" },
                default: [],
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
        },
    },
    // ADHICS V2 Incident Management Integration
    adhicsSecurityIncidents: {
        tableName: "adhics_security_incidents",
        primaryKey: "incident_id",
        indexes: {
            facility_id_index: ["facility_id"],
            incident_category_index: ["incident_category"],
            incident_severity_index: ["incident_severity"],
            incident_date_index: ["incident_date"],
            doh_reportable_index: ["doh_reportable"],
            created_at_index: ["created_at"],
        },
        schema: {
            incident_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Incident Classification (ADHICS V2)
            incident_category: { type: "string", required: true },
            incident_subcategory: { type: "string" },
            incident_severity: {
                type: "enum",
                values: ["low", "medium", "high", "critical"],
                required: true,
            },
            // Incident Details
            incident_date: { type: "date", required: true },
            detection_date: { type: "date" },
            reported_date: { type: "date", default: "now" },
            incident_description: { type: "string", required: true },
            affected_systems: {
                type: "array",
                items: { type: "string" },
                default: [],
            },
            affected_data_types: {
                type: "array",
                items: { type: "string" },
                default: [],
            },
            // Impact Assessment
            confidentiality_impact: {
                type: "enum",
                values: ["none", "low", "medium", "high"],
            },
            integrity_impact: {
                type: "enum",
                values: ["none", "low", "medium", "high"],
            },
            availability_impact: {
                type: "enum",
                values: ["none", "low", "medium", "high"],
            },
            patient_safety_impact: {
                type: "enum",
                values: ["none", "low", "medium", "high"],
            },
            operational_impact: {
                type: "enum",
                values: ["none", "low", "medium", "high"],
            },
            financial_impact_estimated: { type: "number", min: 0 },
            // Response and Investigation
            incident_response_team_notified: { type: "boolean", default: false },
            investigation_started_date: { type: "date" },
            investigation_completed_date: { type: "date" },
            root_cause_identified: { type: "boolean", default: false },
            root_cause_description: { type: "string" },
            // Containment and Recovery
            containment_actions: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            recovery_actions: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            recovery_completed_date: { type: "date" },
            // DoH Reporting (ADHICS V2 Requirement)
            doh_reportable: { type: "boolean", default: false },
            doh_reported_date: { type: "date" },
            doh_report_reference: { type: "string" },
            reporting_timeline_met: { type: "boolean", default: false },
            // Lessons Learned and Improvement
            lessons_learned: { type: "string" },
            improvement_actions: {
                type: "array",
                items: { type: "object" },
                default: [],
            },
            policy_updates_required: { type: "boolean", default: false },
            training_updates_required: { type: "boolean", default: false },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
        },
    },
};
// ADHICS V2 Enhanced Implementation Schema
export const ADHICS_V2_ENHANCED_SCHEMA = {
    // ADHICS V2 Governance Structure with Enhanced Implementation
    adhicsGovernanceStructureEnhanced: {
        tableName: "adhics_governance_structure_enhanced",
        primaryKey: "governance_id",
        indexes: {
            facility_id_index: ["facility_id"],
            compliance_level_index: ["adhics_v2_compliance_level"],
            ciso_index: ["ciso_staff_id"],
            compliance_deadline_index: ["compliance_deadline"],
            implementation_status_index: ["implementation_status"],
            created_at_index: ["created_at"],
        },
        schema: {
            governance_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Enhanced Information Security Governance Committee (ISGC)
            isgc_structure: {
                type: "object",
                properties: {
                    established: { type: "boolean", default: false },
                    chairman_id: { type: "string" },
                    chairman_qualifications: { type: "object" },
                    charter_approved: { type: "boolean", default: false },
                    charter_document_id: { type: "string" },
                    meeting_frequency: { type: "string", default: "quarterly" },
                    quorum_percentage: { type: "number", default: 60 },
                    last_meeting_date: { type: "date" },
                    minutes_documented: { type: "boolean", default: false },
                    decision_authority: { type: "array", items: { type: "string" } },
                    reporting_structure: { type: "object" },
                    performance_metrics: { type: "object" },
                },
            },
            // Enhanced HIIP Workgroup Implementation
            hiip_workgroup: {
                type: "object",
                properties: {
                    established: { type: "boolean", default: false },
                    chairperson_id: { type: "string" },
                    chairperson_qualifications: { type: "object" },
                    members: { type: "array", items: { type: "object" } },
                    charter_approved: { type: "boolean", default: false },
                    reporting_structure_defined: { type: "boolean", default: false },
                    abu_dhabi_hiip_integration: { type: "boolean", default: false },
                    collaboration_framework: { type: "object" },
                    information_sharing_protocols: { type: "object" },
                },
            },
            // Enhanced CISO Implementation
            ciso_implementation: {
                type: "object",
                properties: {
                    appointed: { type: "boolean", default: false },
                    staff_id: { type: "string" },
                    appointment_date: { type: "date" },
                    qualifications: {
                        type: "object",
                        properties: {
                            healthcare_cybersecurity_experience: { type: "number" },
                            certifications: { type: "array", items: { type: "string" } },
                            education_background: { type: "string" },
                            previous_roles: { type: "array", items: { type: "object" } },
                        },
                    },
                    responsibilities_defined: { type: "boolean", default: false },
                    reporting_line: { type: "string", default: "ISGC" },
                    authority_level: { type: "string" },
                    resource_allocation: { type: "object" },
                    performance_objectives: { type: "array", items: { type: "object" } },
                },
            },
            // Enhanced Implementation Stakeholders
            implementation_stakeholders: {
                type: "object",
                properties: {
                    team_established: { type: "boolean", default: false },
                    team_members: { type: "array", items: { type: "object" } },
                    roles_responsibilities_matrix: { type: "object" },
                    training_program: { type: "object" },
                    communication_plan: { type: "object" },
                    escalation_procedures: { type: "object" },
                },
            },
            // Enhanced Policy Framework
            policy_framework: {
                type: "object",
                properties: {
                    information_security_policy_approved: {
                        type: "boolean",
                        default: false,
                    },
                    policy_document_id: { type: "string" },
                    policy_review_cycle: { type: "string", default: "annual" },
                    document_control_procedure: { type: "boolean", default: false },
                    policy_hierarchy: { type: "object" },
                    compliance_monitoring: { type: "object" },
                    exception_management: { type: "object" },
                },
            },
            // Enhanced Compliance Status Tracking
            compliance_status: {
                type: "object",
                properties: {
                    adhics_v2_compliance_level: {
                        type: "enum",
                        values: ["basic", "transitional", "advanced", "service_provider"],
                        required: true,
                    },
                    target_compliance_level: { type: "string" },
                    compliance_deadline: { type: "date" },
                    compliance_percentage: {
                        type: "number",
                        min: 0,
                        max: 100,
                        default: 0,
                    },
                    implementation_status: {
                        type: "enum",
                        values: [
                            "not_started",
                            "planning",
                            "in_progress",
                            "testing",
                            "completed",
                        ],
                        default: "not_started",
                    },
                    milestones: { type: "array", items: { type: "object" } },
                    risk_assessment: { type: "object" },
                    gap_analysis: { type: "object" },
                },
            },
            // Implementation Timeline and Monitoring
            implementation_timeline: {
                type: "object",
                properties: {
                    project_start_date: { type: "date" },
                    planned_completion_date: { type: "date" },
                    actual_completion_date: { type: "date" },
                    phase_milestones: { type: "array", items: { type: "object" } },
                    progress_tracking: { type: "object" },
                    resource_utilization: { type: "object" },
                },
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            created_by: { type: "string", required: true },
            last_reviewed_by: { type: "string" },
            last_reviewed_date: { type: "date" },
        },
    },
    // Enhanced ADHICS V2 Control Implementation with Detailed Tracking
    adhicsControlImplementationEnhanced: {
        tableName: "adhics_control_implementation_enhanced",
        primaryKey: "control_id",
        indexes: {
            facility_id_index: ["facility_id"],
            control_reference_index: ["control_reference"],
            control_domain_index: ["control_domain"],
            control_category_index: ["control_category"],
            implementation_status_index: ["implementation_status"],
            compliant_index: ["compliant"],
            risk_level_index: ["risk_level"],
            priority_index: ["implementation_priority"],
            created_at_index: ["created_at"],
        },
        schema: {
            control_id: { type: "string", required: true },
            facility_id: { type: "string", required: true },
            // Enhanced Control Details
            control_details: {
                type: "object",
                properties: {
                    control_reference: { type: "string", required: true },
                    control_name: { type: "string", required: true },
                    control_description: { type: "string" },
                    control_domain: { type: "string", required: true },
                    control_category: {
                        type: "enum",
                        values: ["basic", "transitional", "advanced", "service_provider"],
                        required: true,
                    },
                    control_type: {
                        type: "enum",
                        values: ["preventive", "detective", "corrective", "compensating"],
                    },
                    control_family: { type: "string" },
                    related_controls: { type: "array", items: { type: "string" } },
                },
            },
            // Enhanced Implementation Status with Detailed Tracking
            implementation_tracking: {
                type: "object",
                properties: {
                    implementation_status: {
                        type: "enum",
                        values: [
                            "not_started",
                            "planning",
                            "in_progress",
                            "testing",
                            "completed",
                            "under_review",
                        ],
                        default: "not_started",
                    },
                    implementation_priority: {
                        type: "enum",
                        values: ["low", "medium", "high", "critical"],
                        default: "medium",
                    },
                    start_date: { type: "date" },
                    target_date: { type: "date" },
                    completion_date: { type: "date" },
                    percentage_complete: { type: "number", min: 0, max: 100, default: 0 },
                    implementation_approach: { type: "string" },
                    resource_requirements: { type: "object" },
                    dependencies: { type: "array", items: { type: "string" } },
                },
            },
            // Enhanced Evidence and Documentation Management
            evidence_management: {
                type: "object",
                properties: {
                    evidence_provided: { type: "array", items: { type: "object" } },
                    documentation_complete: { type: "boolean", default: false },
                    policy_procedures_developed: { type: "boolean", default: false },
                    staff_training_completed: { type: "boolean", default: false },
                    technical_controls_implemented: { type: "boolean", default: false },
                    evidence_quality_score: { type: "number", min: 0, max: 100 },
                    documentation_gaps: { type: "array", items: { type: "string" } },
                    evidence_repository_links: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
            // Enhanced Validation and Assessment Framework
            assessment_framework: {
                type: "object",
                properties: {
                    self_assessment: {
                        type: "object",
                        properties: {
                            completed: { type: "boolean", default: false },
                            score: { type: "number", min: 0, max: 100 },
                            assessment_date: { type: "date" },
                            assessor: { type: "string" },
                            findings: { type: "array", items: { type: "object" } },
                        },
                    },
                    internal_audit: {
                        type: "object",
                        properties: {
                            completed: { type: "boolean", default: false },
                            score: { type: "number", min: 0, max: 100 },
                            audit_date: { type: "date" },
                            auditor: { type: "string" },
                            findings: { type: "array", items: { type: "object" } },
                        },
                    },
                    external_assessment: {
                        type: "object",
                        properties: {
                            completed: { type: "boolean", default: false },
                            score: { type: "number", min: 0, max: 100 },
                            assessment_date: { type: "date" },
                            assessor_organization: { type: "string" },
                            findings: { type: "array", items: { type: "object" } },
                        },
                    },
                },
            },
            // Enhanced Compliance Tracking and Monitoring
            compliance_monitoring: {
                type: "object",
                properties: {
                    compliant: { type: "boolean", default: false },
                    compliance_date: { type: "date" },
                    compliance_score: { type: "number", min: 0, max: 100 },
                    non_conformities: { type: "array", items: { type: "object" } },
                    corrective_actions: { type: "array", items: { type: "object" } },
                    improvement_opportunities: {
                        type: "array",
                        items: { type: "object" },
                    },
                    monitoring_frequency: { type: "string" },
                    next_review_date: { type: "date" },
                },
            },
            // Enhanced Risk Assessment and Management
            risk_management: {
                type: "object",
                properties: {
                    risk_level: {
                        type: "enum",
                        values: ["low", "medium", "high", "critical"],
                    },
                    risk_assessment_date: { type: "date" },
                    risk_description: { type: "string" },
                    risk_impact: { type: "string" },
                    risk_likelihood: { type: "string" },
                    risk_mitigation_measures: {
                        type: "array",
                        items: { type: "object" },
                    },
                    residual_risk_level: {
                        type: "enum",
                        values: ["low", "medium", "high", "critical"],
                    },
                    risk_owner: { type: "string" },
                    risk_review_date: { type: "date" },
                },
            },
            created_at: { type: "date", required: true },
            updated_at: { type: "date", required: true },
            created_by: { type: "string", required: true },
            last_updated_by: { type: "string" },
        },
    },
};
// Combined Schema Export
export const ENHANCED_DATABASE_SCHEMA = {
    ...ML_MODEL_PERFORMANCE_SCHEMA,
    ...ANALYTICS_WORKLOADS_SCHEMA,
    ...EDGE_DEVICE_INTELLIGENCE_SCHEMA,
    ...OFFLINE_OPERATIONS_SCHEMA,
    ...SECURITY_INTELLIGENCE_SCHEMA,
    ...ADHICS_V2_COMPLIANCE_SCHEMA,
    ...ADHICS_V2_ENHANCED_SCHEMA,
};
export default {
    DATABASE_CONFIG,
    ENHANCED_DATABASE_SCHEMA,
    ML_MODEL_PERFORMANCE_SCHEMA,
    ANALYTICS_WORKLOADS_SCHEMA,
    EDGE_DEVICE_INTELLIGENCE_SCHEMA,
    OFFLINE_OPERATIONS_SCHEMA,
    SECURITY_INTELLIGENCE_SCHEMA,
    ADHICS_V2_COMPLIANCE_SCHEMA,
    ADHICS_V2_ENHANCED_SCHEMA,
};
