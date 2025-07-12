import {
  connectToDatabase,
  createIndexes,
  initializeSchema,
  closeDatabase,
  getDb,
} from "../api/db";

async function initializeDatabase() {
  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Create collections for manpower capacity and therapy sessions
    await db.createCollection("manpower_capacity", {});
    await db.createCollection("therapy_sessions", {});

    // Create collections for revenue cycle workflow
    await db.createCollection("claims_processing", {});
    await db.createCollection("clinician_licenses", {});
    await db.createCollection("revenue_cycle_metrics", {});

    // Create collections for administrative management
    await db.createCollection("staff_attendance", {});
    await db.createCollection("timesheet_summary", {});
    await db.createCollection("daily_plans", {});
    await db.createCollection("daily_updates", {});

    // Create collections for master workflow orchestration
    await db.createCollection("process_orchestration", {});
    await db.createCollection("master_patient_index", {});
    await db.createCollection("master_staff_index", {});
    await db.createCollection("system_integrations", {});
    await db.createCollection("event_processing_log", {});
    await db.createCollection("report_catalog", {});
    await db.createCollection("executive_dashboard", {});
    await db.createCollection("change_management", {});
    await db.createCollection("performance_monitoring", {});
    await db.createCollection("staff_category_timesheets", {});

    // Create collections for Advanced Clinical Operations Intelligence
    await db.createCollection("patient_risk_analytics", {});
    await db.createCollection("demand_forecasting", {});
    await db.createCollection("clinical_decision_support", {});
    await db.createCollection("form_intelligence_analytics", {});
    await db.createCollection("intelligent_form_templates", {});
    await db.createCollection("predictive_analytics_models", {});
    await db.createCollection("ml_training_data", {});
    await db.createCollection("clinical_nlp_cache", {});

    // Create collections for Advanced Administrative Intelligence
    await db.createCollection("performance_analytics", {});
    await db.createCollection("staffing_predictions", {});
    await db.createCollection("quality_monitoring_realtime", {});
    await db.createCollection("incident_pattern_analysis", {});
    await db.createCollection("workforce_intelligence_models", {});
    await db.createCollection("quality_prediction_models", {});

    // Create collections for Advanced Authorization & Revenue Intelligence
    await db.createCollection("authorization_intelligence", {});
    await db.createCollection("appeals_intelligence", {});
    await db.createCollection("optimized_authorization_requests", {});
    await db.createCollection("smart_claims_analytics", {});
    await db.createCollection("payment_predictions", {});
    await db.createCollection("service_mix_optimizations", {});
    await db.createCollection("revenue_forecasting_models", {});
    await db.createCollection("authorization_ml_models", {});
    await db.createCollection("revenue_analytics", {});
    await db.createCollection("authorization_requests", {});

    // Create collections for Edge Computing and Offline Intelligence
    await db.createCollection("edge_device_intelligence", {});
    await db.createCollection("offline_operations_intelligence", {});
    await db.createCollection("edge_workloads", {});
    await db.createCollection("edge_conflicts", {});
    await db.createCollection("edge_cache_entries", {});
    await db.createCollection("edge_performance_metrics", {});

    // Create collections for ML Model Performance Tracking
    await db.createCollection("ml_model_performance", {});
    await db.createCollection("analytics_workloads", {});
    await db.createCollection("security_intelligence_events", {});
    await db.createCollection("cache_performance_analytics", {});
    await db.createCollection("predictive_cache_warming", {});

    // Create collections for Part 5 Enhancement: Advanced System Integration Intelligence
    await db.createCollection("integration_performance_analytics", {});
    await db.createCollection("data_flow_intelligence", {});
    await db.createCollection("integration_health_reports", {});
    await db.createCollection("integration_optimization_plans", {});
    await db.createCollection("financial_analytics_models", {});
    await db.createCollection("predictive_revenue_forecasts", {});
    await db.createCollection("service_mix_optimization_results", {});
    await db.createCollection("revenue_opportunity_analysis", {});
    await db.createCollection("payment_prediction_analytics", {});

    // Create additional collections for enhanced revenue intelligence
    await db.createCollection("financial_analytics_models", {});
    await db.createCollection("predictive_revenue_forecasts", {});
    await db.createCollection("service_mix_optimization_results", {});
    await db.createCollection("revenue_opportunity_analysis", {});
    await db.createCollection("payment_prediction_analytics", {});

    // Create collections for incident management
    await db.createCollection("incident_reports", {});
    await db.createCollection("incident_analytics", {});

    // Create collections for reporting management
    await db.createCollection("report_templates", {});
    await db.createCollection("generated_reports", {});
    await db.createCollection("report_schedules", {});

    // Create indexes
    await createIndexes();

    // Create indexes for manpower capacity and therapy sessions
    await db
      .collection("manpower_capacity")
      .createIndexes([
        { key: { staff_member: 1 } },
        { key: { date: 1 } },
        { key: { role: 1 } },
        { key: { availability_status: 1 } },
        { key: { geographic_zones: 1 } },
        { key: { specializations: 1 } },
      ]);

    await db
      .collection("therapy_sessions")
      .createIndexes([
        { key: { patient_id: 1 } },
        { key: { therapist: 1 } },
        { key: { session_date: 1 } },
        { key: { therapy_type: 1 } },
        { key: { status: 1 } },
        { key: { next_session_scheduled: 1 } },
      ]);

    // Create indexes for claims processing
    await db
      .collection("claims_processing")
      .createIndexes([
        { key: { patient_id: 1 } },
        { key: { claim_number: 1 } },
        { key: { claim_status: 1 } },
        { key: { primary_clinician: 1 } },
        { key: { service_month: 1, service_year: 1 } },
        { key: { submission_date: 1 } },
        { key: { documentation_audit_status: 1 } },
      ]);

    // Create indexes for clinician licenses
    await db
      .collection("clinician_licenses")
      .createIndexes([
        { key: { clinician_name: 1 } },
        { key: { employee_id: 1 } },
        { key: { license_number: 1 } },
        { key: { license_status: 1 } },
        { key: { expiry_date: 1 } },
        { key: { compliance_status: 1 } },
        { key: { role: 1 } },
        { key: { department: 1 } },
      ]);

    // Create indexes for revenue cycle metrics
    await db
      .collection("revenue_cycle_metrics")
      .createIndexes([{ key: { metric_date: 1 } }, { key: { created_at: 1 } }]);

    // Create indexes for staff attendance
    await db
      .collection("staff_attendance")
      .createIndexes([
        { key: { employee_id: 1 } },
        { key: { date: 1 } },
        { key: { shift: 1 } },
        { key: { status: 1 } },
        { key: { department: 1 } },
        { key: { supervisor_approval: 1 } },
        { key: { late_arrival: 1 } },
      ]);

    // Create indexes for timesheet summary
    await db
      .collection("timesheet_summary")
      .createIndexes([
        { key: { employee_id: 1 } },
        { key: { pay_period_start: 1, pay_period_end: 1 } },
        { key: { department: 1 } },
        { key: { approval_status: 1 } },
      ]);

    // Create indexes for daily plans
    await db
      .collection("daily_plans")
      .createIndexes([
        { key: { date: 1 } },
        { key: { shift: 1 } },
        { key: { team_lead: 1 } },
        { key: { department: 1 } },
        { key: { status: 1 } },
        { key: { plan_id: 1 } },
      ]);

    // Create indexes for daily updates
    await db
      .collection("daily_updates")
      .createIndexes([
        { key: { plan_id: 1 } },
        { key: { date: 1 } },
        { key: { update_time: 1 } },
        { key: { updated_by: 1 } },
        { key: { status: 1 } },
      ]);

    // Create indexes for incident reports
    await db
      .collection("incident_reports")
      .createIndexes([
        { key: { incident_id: 1 } },
        { key: { incident_type: 1 } },
        { key: { severity: 1 } },
        { key: { status: 1 } },
        { key: { reported_by: 1 } },
        { key: { incident_date: 1 } },
        { key: { location: 1 } },
        { key: { patient_id: 1 } },
        { key: { "corrective_actions.status": 1 } },
        { key: { "regulatory_notification.required": 1 } },
      ]);

    // Create indexes for report templates
    await db
      .collection("report_templates")
      .createIndexes([
        { key: { template_id: 1 } },
        { key: { category: 1 } },
        { key: { created_by: 1 } },
        { key: { "schedule_config.enabled": 1 } },
      ]);

    // Create indexes for generated reports
    await db
      .collection("generated_reports")
      .createIndexes([
        { key: { report_id: 1 } },
        { key: { template_id: 1 } },
        { key: { category: 1 } },
        { key: { status: 1 } },
        { key: { generated_by: 1 } },
        { key: { generated_at: 1 } },
        { key: { "approval.status": 1 } },
      ]);

    // Create indexes for report schedules
    await db
      .collection("report_schedules")
      .createIndexes([
        { key: { schedule_id: 1 } },
        { key: { template_id: 1 } },
        { key: { status: 1 } },
        { key: { next_run: 1 } },
        { key: { created_by: 1 } },
      ]);

    // Create indexes for Master Workflow Orchestration
    await db
      .collection("process_orchestration")
      .createIndexes([
        { key: { process_instance_id: 1 } },
        { key: { master_process_type: 1 } },
        { key: { process_status: 1 } },
        { key: { current_stage: 1 } },
        { key: { process_owner: 1 } },
        { key: { current_assignee: 1 } },
        { key: { department: 1 } },
        { key: { patient_id: 1 } },
        { key: { staff_id: 1 } },
        { key: { process_start_time: 1 } },
        { key: { expected_completion_time: 1 } },
        { key: { escalation_triggered: 1 } },
      ]);

    await db
      .collection("master_patient_index")
      .createIndexes([
        { key: { universal_patient_id: 1 } },
        { key: { mrn_rhhcs: 1 } },
        { key: { mrn_emr: 1 } },
        { key: { thiqa_card_number: 1 } },
        { key: { emirates_id: 1 } },
        { key: { data_steward: 1 } },
        { key: { data_classification: 1 } },
        { key: { master_record_source: 1 } },
      ]);

    await db
      .collection("master_staff_index")
      .createIndexes([
        { key: { universal_staff_id: 1 } },
        { key: { employee_id: 1 } },
        { key: { primary_role: 1 } },
        { key: { department: 1 } },
        { key: { competency_level: 1 } },
        { key: { performance_rating: 1 } },
        { key: { specializations: 1 } },
      ]);

    await db
      .collection("system_integrations")
      .createIndexes([
        { key: { integration_name: 1 } },
        { key: { integration_type: 1 } },
        { key: { external_system: 1 } },
        { key: { integration_status: 1 } },
        { key: { data_direction: 1 } },
        { key: { last_successful_sync: 1 } },
        { key: { next_scheduled_sync: 1 } },
      ]);

    await db
      .collection("event_processing_log")
      .createIndexes([
        { key: { event_id: 1 } },
        { key: { event_type: 1 } },
        { key: { event_source: 1 } },
        { key: { event_timestamp: 1 } },
        { key: { processing_status: 1 } },
        { key: { processing_start_time: 1 } },
      ]);

    await db
      .collection("report_catalog")
      .createIndexes([
        { key: { report_code: 1 } },
        { key: { report_category: 1 } },
        { key: { report_type: 1 } },
        { key: { framework_function: 1 } },
        { key: { responsible_role: 1 } },
        { key: { generation_frequency: 1 } },
        { key: { report_status: 1 } },
      ]);

    await db
      .collection("executive_dashboard")
      .createIndexes([
        { key: { dashboard_date: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("change_management")
      .createIndexes([
        { key: { change_initiative: 1 } },
        { key: { implementation_phase: 1 } },
        { key: { change_status: 1 } },
        { key: { go_live_date: 1 } },
      ]);

    await db
      .collection("performance_monitoring")
      .createIndexes([
        { key: { monitoring_date: 1 } },
        { key: { monitoring_period: 1 } },
        { key: { function_name: 1 } },
        { key: { responsible_owner: 1 } },
      ]);

    await db
      .collection("staff_category_timesheets")
      .createIndexes([
        { key: { staff_category: 1 } },
        { key: { employee_id: 1 } },
        { key: { date: 1 } },
        { key: { shift: 1 } },
        { key: { approval_status: 1 } },
      ]);

    // Create indexes for Advanced Clinical Operations Intelligence
    await db
      .collection("patient_risk_analytics")
      .createIndexes([
        { key: { patient_id: 1 } },
        { key: { risk_assessment_date: 1 } },
        { key: { readmission_risk_score: 1 } },
        { key: { fall_risk_score: 1 } },
        { key: { clinical_deterioration_risk: 1 } },
        { key: { medication_adherence_risk: 1 } },
        { key: { risk_trend: 1 } },
        { key: { model_version: 1 } },
        { key: { next_assessment_due: 1 } },
      ]);

    await db
      .collection("demand_forecasting")
      .createIndexes([
        { key: { forecast_date: 1 } },
        { key: { forecast_horizon: 1 } },
        { key: { geographic_zone: 1 } },
        { key: { service_type: 1 } },
        { key: { model_version: 1 } },
        { key: { forecast_accuracy: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("clinical_decision_support")
      .createIndexes([
        { key: { patient_id: 1 } },
        { key: { encounter_id: 1 } },
        { key: { decision_point: 1 } },
        { key: { evidence_level: 1 } },
        { key: { confidence_score: 1 } },
        { key: { recommendation_accepted: 1 } },
        { key: { implemented_date: 1 } },
        { key: { outcome_measured: 1 } },
      ]);

    await db
      .collection("form_intelligence_analytics")
      .createIndexes([
        { key: { form_instance_id: 1 } },
        { key: { form_type: 1 } },
        { key: { data_quality_score: 1 } },
        { key: { completion_efficiency_score: 1 } },
        { key: { model_version: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("intelligent_form_templates")
      .createIndexes([
        { key: { form_type: 1 } },
        { key: { learning_enabled: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_metrics: 1 } },
        { key: { user_satisfaction_score: 1 } },
        { key: { last_training_date: 1 } },
      ]);

    await db
      .collection("predictive_analytics_models")
      .createIndexes([
        { key: { model_type: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { training_date: 1 } },
        { key: { status: 1 } },
      ]);

    await db
      .collection("ml_training_data")
      .createIndexes([
        { key: { data_type: 1 } },
        { key: { patient_id: 1 } },
        { key: { collection_date: 1 } },
        { key: { data_quality_score: 1 } },
        { key: { used_for_training: 1 } },
      ]);

    await db
      .collection("clinical_nlp_cache")
      .createIndexes([
        { key: { text_hash: 1 } },
        { key: { nlp_model_version: 1 } },
        { key: { created_at: 1 } },
        { key: { expires_at: 1 } },
      ]);

    // Create indexes for Advanced Administrative Intelligence
    await db
      .collection("performance_analytics")
      .createIndexes([
        { key: { analytics_id: 1 } },
        { key: { employee_id: 1 } },
        { key: { assessment_period_start: 1 } },
        { key: { assessment_period_end: 1 } },
        { key: { overall_performance_score: 1 } },
        { key: { performance_percentile: 1 } },
        { key: { retention_risk_score: 1 } },
        { key: { burnout_risk_score: 1 } },
        { key: { promotion_readiness_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("staffing_predictions")
      .createIndexes([
        { key: { prediction_id: 1 } },
        { key: { prediction_date: 1 } },
        { key: { forecast_start_date: 1 } },
        { key: { forecast_end_date: 1 } },
        { key: { department: 1 } },
        { key: { service_line: 1 } },
        { key: { capacity_gap: 1 } },
        { key: { prediction_accuracy: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("quality_monitoring_realtime")
      .createIndexes([
        { key: { monitoring_id: 1 } },
        { key: { monitoring_timestamp: 1 } },
        { key: { overall_quality_score: 1 } },
        { key: { anomalies_detected: 1 } },
        { key: { alerts_generated: 1 } },
        { key: { trend_direction: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("incident_pattern_analysis")
      .createIndexes([
        { key: { analysis_id: 1 } },
        { key: { analysis_date: 1 } },
        { key: { time_range_start: 1 } },
        { key: { time_range_end: 1 } },
        { key: { patterns_identified: 1 } },
        { key: { overall_risk_level: 1 } },
        { key: { risk_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("workforce_intelligence_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { training_date: 1 } },
        { key: { status: 1 } },
      ]);

    await db
      .collection("quality_prediction_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { training_date: 1 } },
        { key: { status: 1 } },
      ]);

    // Create indexes for Advanced Authorization & Revenue Intelligence
    await db
      .collection("authorization_intelligence")
      .createIndexes([
        { key: { intelligence_id: 1 } },
        { key: { authorization_request_id: 1 } },
        { key: { success_probability: 1 } },
        { key: { predicted_outcome: 1 } },
        { key: { confidence_score: 1 } },
        { key: { prediction_date: 1 } },
        { key: { actual_outcome: 1 } },
        { key: { prediction_accuracy: 1 } },
        { key: { model_version: 1 } },
      ]);

    // Create indexes for enhanced revenue analytics
    await db
      .collection("financial_analytics_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { algorithm: 1 } },
        { key: { accuracy_target: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("predictive_revenue_forecasts")
      .createIndexes([
        { key: { forecast_id: 1 } },
        { key: { forecast_date: 1 } },
        { key: { forecast_horizon: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("service_mix_optimization_results")
      .createIndexes([
        { key: { optimization_id: 1 } },
        { key: { optimization_date: 1 } },
        { key: { total_revenue_increase: 1 } },
        { key: { roi: 1 } },
        { key: { implementation_status: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("payment_prediction_analytics")
      .createIndexes([
        { key: { prediction_id: 1 } },
        { key: { claim_id: 1 } },
        { key: { payment_probability: 1 } },
        { key: { expected_payment_date: 1 } },
        { key: { confidence_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("appeals_intelligence")
      .createIndexes([
        { key: { appeal_intelligence_id: 1 } },
        { key: { original_authorization_id: 1 } },
        { key: { appeal_id: 1 } },
        { key: { appeal_success_probability: 1 } },
        { key: { appeal_submitted: 1 } },
        { key: { appeal_outcome: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("optimized_authorization_requests")
      .createIndexes([
        { key: { request_id: 1 } },
        { key: { original_request_id: 1 } },
        { key: { optimization_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("smart_claims_analytics")
      .createIndexes([
        { key: { claim_analytics_id: 1 } },
        { key: { claim_id: 1 } },
        { key: { clean_claim_probability: 1 } },
        { key: { denial_risk_score: 1 } },
        { key: { documentation_quality_score: 1 } },
        { key: { coding_accuracy_score: 1 } },
        { key: { authorization_alignment_score: 1 } },
        { key: { actual_outcome: 1 } },
        { key: { prediction_accuracy: 1 } },
      ]);

    await db
      .collection("payment_predictions")
      .createIndexes([
        { key: { prediction_id: 1 } },
        { key: { claim_id: 1 } },
        { key: { payer_id: 1 } },
        { key: { payment_probability: 1 } },
        { key: { expected_payment_date: 1 } },
        { key: { payment_risk: 1 } },
        { key: { confidence_score: 1 } },
        { key: { actual_payment_date: 1 } },
        { key: { prediction_accuracy: 1 } },
      ]);

    await db
      .collection("service_mix_optimizations")
      .createIndexes([
        { key: { optimization_id: 1 } },
        { key: { optimization_date: 1 } },
        { key: { expected_revenue_increase: 1 } },
        { key: { expected_margin_improvement: 1 } },
        { key: { implementation_status: 1 } },
        { key: { roi: 1 } },
      ]);

    await db
      .collection("revenue_forecasting_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { training_date: 1 } },
        { key: { status: 1 } },
      ]);

    await db
      .collection("authorization_ml_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { training_date: 1 } },
        { key: { status: 1 } },
      ]);

    await db
      .collection("revenue_analytics")
      .createIndexes([
        { key: { analytics_id: 1 } },
        { key: { forecast_date: 1 } },
        { key: { forecast_horizon: 1 } },
        { key: { service_line: 1 } },
        { key: { payer_segment: 1 } },
        { key: { model_version: 1 } },
        { key: { historical_accuracy: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("authorization_requests")
      .createIndexes([
        { key: { authorization_id: 1 } },
        { key: { patient_id: 1 } },
        { key: { service_type: 1 } },
        { key: { payer_id: 1 } },
        { key: { submission_date: 1 } },
        { key: { status: 1 } },
        { key: { urgency_level: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for Edge Computing Intelligence
    await db
      .collection("edge_device_intelligence")
      .createIndexes([
        { key: { device_id: 1 } },
        { key: { device_type: 1 } },
        { key: { status: 1 } },
        { key: { location: 1 } },
        { key: { last_seen: 1 } },
        { key: { health_score: 1 } },
        { key: { network_quality: 1 } },
        { key: { workload_capacity: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("offline_operations_intelligence")
      .createIndexes([
        { key: { operation_id: 1 } },
        { key: { device_id: 1 } },
        { key: { user_id: 1 } },
        { key: { operation_type: 1 } },
        { key: { offline_start_time: 1 } },
        { key: { sync_status: 1 } },
        { key: { conflict_count: 1 } },
        { key: { data_integrity_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("edge_workloads")
      .createIndexes([
        { key: { workload_id: 1 } },
        { key: { device_id: 1 } },
        { key: { workload_type: 1 } },
        { key: { priority: 1 } },
        { key: { status: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for ML Model Performance
    await db
      .collection("ml_model_performance")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_name: 1 } },
        { key: { model_version: 1 } },
        { key: { deployment_environment: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { evaluation_date: 1 } },
        { key: { performance_trend: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("analytics_workloads")
      .createIndexes([
        { key: { workload_id: 1 } },
        { key: { workload_type: 1 } },
        { key: { workload_category: 1 } },
        { key: { execution_time: 1 } },
        { key: { resource_utilization: 1 } },
        { key: { cost_efficiency: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for Security Intelligence
    await db
      .collection("security_intelligence_events")
      .createIndexes([
        { key: { event_id: 1 } },
        { key: { event_type: 1 } },
        { key: { severity: 1 } },
        { key: { threat_level: 1 } },
        { key: { affected_systems: 1 } },
        { key: { detection_time: 1 } },
        { key: { resolution_status: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for Cache Performance Analytics
    await db
      .collection("cache_performance_analytics")
      .createIndexes([
        { key: { cache_layer: 1 } },
        { key: { hit_ratio: 1 } },
        { key: { response_time: 1 } },
        { key: { throughput: 1 } },
        { key: { memory_usage: 1 } },
        { key: { measurement_time: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for Part 5 Enhancement: Advanced System Integration Intelligence
    await db
      .collection("integration_performance_analytics")
      .createIndexes([
        { key: { performance_id: 1 } },
        { key: { integration_name: 1 } },
        { key: { system_type: 1 } },
        { key: { measurement_timestamp: 1 } },
        { key: { overall_health_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("data_flow_intelligence")
      .createIndexes([
        { key: { flow_id: 1 } },
        { key: { source_system: 1 } },
        { key: { target_system: 1 } },
        { key: { data_type: 1 } },
        { key: { flow_date: 1 } },
        { key: { data_quality_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("integration_health_reports")
      .createIndexes([
        { key: { reportId: 1 } },
        { key: { timestamp: 1 } },
        { key: { overallHealthScore: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("integration_optimization_plans")
      .createIndexes([
        { key: { planId: 1 } },
        { key: { systemId: 1 } },
        { key: { totalCost: 1 } },
        { key: { expectedROI: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("financial_analytics_models")
      .createIndexes([
        { key: { model_id: 1 } },
        { key: { model_type: 1 } },
        { key: { algorithm: 1 } },
        { key: { accuracy_target: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("predictive_revenue_forecasts")
      .createIndexes([
        { key: { forecast_id: 1 } },
        { key: { forecast_date: 1 } },
        { key: { forecast_horizon: 1 } },
        { key: { model_version: 1 } },
        { key: { accuracy_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("service_mix_optimization_results")
      .createIndexes([
        { key: { optimization_id: 1 } },
        { key: { optimization_date: 1 } },
        { key: { total_revenue_increase: 1 } },
        { key: { roi: 1 } },
        { key: { implementation_status: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("payment_prediction_analytics")
      .createIndexes([
        { key: { prediction_id: 1 } },
        { key: { claim_id: 1 } },
        { key: { payment_probability: 1 } },
        { key: { expected_payment_date: 1 } },
        { key: { confidence_score: 1 } },
        { key: { created_at: 1 } },
      ]);

    // Create indexes for Communication & Collaboration Systems
    await db
      .collection("platform_patient_chat_groups")
      .createIndexes([
        { key: { group_id: 1 } },
        { key: { patient_id: 1 } },
        { key: { group_type: 1 } },
        { key: { status: 1 } },
        { key: { created_by: 1 } },
      ]);

    await db
      .collection("platform_patient_chat_messages")
      .createIndexes([
        { key: { message_id: 1 } },
        { key: { group_id: 1 } },
        { key: { sender_id: 1 } },
        { key: { message_type: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("email_templates")
      .createIndexes([
        { key: { template_id: 1 } },
        { key: { template_category: 1 } },
        { key: { status: 1 } },
        { key: { created_by: 1 } },
      ]);

    await db
      .collection("email_communications")
      .createIndexes([
        { key: { communication_id: 1 } },
        { key: { template_id: 1 } },
        { key: { "sender.user_id": 1 } },
        { key: { status: 1 } },
        { key: { sent_at: 1 } },
      ]);

    await db
      .collection("committees")
      .createIndexes([
        { key: { committee_id: 1 } },
        { key: { committee_type: 1 } },
        { key: { status: 1 } },
        { key: { created_by: 1 } },
      ]);

    await db
      .collection("committee_meetings")
      .createIndexes([
        { key: { meeting_id: 1 } },
        { key: { committee_id: 1 } },
        { key: { meeting_date: 1 } },
        { key: { meeting_status: 1 } },
        { key: { created_by: 1 } },
      ]);

    await db
      .collection("governance_documents")
      .createIndexes([
        { key: { document_id: 1 } },
        { key: { document_type: 1 } },
        { key: { document_category: 1 } },
        { key: { document_status: 1 } },
        { key: { effective_date: 1 } },
        { key: { expiry_date: 1 } },
      ]);

    await db
      .collection("staff_acknowledgments")
      .createIndexes([
        { key: { acknowledgment_id: 1 } },
        { key: { document_id: 1 } },
        { key: { "staff_member.employee_id": 1 } },
        { key: { acknowledgment_status: 1 } },
        { key: { deadline_date: 1 } },
      ]);

    await db
      .collection("communication_dashboard")
      .createIndexes([
        { key: { dashboard_date: 1 } },
        { key: { created_at: 1 } },
      ]);

    await db
      .collection("communication_analytics")
      .createIndexes([
        { key: { analytics_id: 1 } },
        { key: { "report_period.start_date": 1 } },
        { key: { "report_period.end_date": 1 } },
        { key: { created_at: 1 } },
      ]);

    // Initialize schema with sample data
    await initializeSchema();

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    // Close the database connection
    await closeDatabase();
  }
}

// Run the initialization
initializeDatabase();
