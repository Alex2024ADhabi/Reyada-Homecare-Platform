// API Gateway Configuration
export const API_GATEWAY_CONFIG = {
    baseUrl: process.env.API_GATEWAY_URL || "https://api.reyadahomecare.ae",
    version: "v1",
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};
// Service Endpoints
export const SERVICE_ENDPOINTS = {
    auth: `${API_GATEWAY_CONFIG.baseUrl}/auth`,
    patients: `${API_GATEWAY_CONFIG.baseUrl}/patients`,
    clinical: `${API_GATEWAY_CONFIG.baseUrl}/clinical`,
    compliance: `${API_GATEWAY_CONFIG.baseUrl}/compliance`,
    scheduling: `${API_GATEWAY_CONFIG.baseUrl}/scheduling`,
    reporting: `${API_GATEWAY_CONFIG.baseUrl}/reporting`,
    notifications: `${API_GATEWAY_CONFIG.baseUrl}/notifications`,
    referrals: `${API_GATEWAY_CONFIG.baseUrl}/referrals`,
    healthcheck: `${API_GATEWAY_CONFIG.baseUrl}/health`,
    daman: `${API_GATEWAY_CONFIG.baseUrl}/daman`,
    claims: `${API_GATEWAY_CONFIG.baseUrl}/claims`,
    revenue: `${API_GATEWAY_CONFIG.baseUrl}/revenue`,
    payments: `${API_GATEWAY_CONFIG.baseUrl}/payments`,
    denials: `${API_GATEWAY_CONFIG.baseUrl}/denials`,
    reconciliation: `${API_GATEWAY_CONFIG.baseUrl}/reconciliation`,
    authorizations: `${API_GATEWAY_CONFIG.baseUrl}/authorizations`,
    claimsProcessing: `${API_GATEWAY_CONFIG.baseUrl}/claims-processing`,
    clinicianLicenses: `${API_GATEWAY_CONFIG.baseUrl}/clinician-licenses`,
    revenueMetrics: `${API_GATEWAY_CONFIG.baseUrl}/revenue-metrics`,
    // Administrative Module Endpoints
    attendance: `${API_GATEWAY_CONFIG.baseUrl}/attendance`,
    timesheets: `${API_GATEWAY_CONFIG.baseUrl}/timesheets`,
    dailyPlanning: `${API_GATEWAY_CONFIG.baseUrl}/daily-planning`,
    incidentManagement: `${API_GATEWAY_CONFIG.baseUrl}/incident-management`,
    qualityManagement: `${API_GATEWAY_CONFIG.baseUrl}/quality-management`,
    complianceMonitoring: `${API_GATEWAY_CONFIG.baseUrl}/compliance-monitoring`,
    auditManagement: `${API_GATEWAY_CONFIG.baseUrl}/audit-management`,
    jawdaKpi: `${API_GATEWAY_CONFIG.baseUrl}/jawda-kpi`,
    reportTemplates: `${API_GATEWAY_CONFIG.baseUrl}/report-templates`,
    reportSchedules: `${API_GATEWAY_CONFIG.baseUrl}/report-schedules`,
    administrativeAnalytics: `${API_GATEWAY_CONFIG.baseUrl}/administrative-analytics`,
    // Master Workflow Orchestration Endpoints
    processOrchestration: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/workflow/orchestration`,
    masterDataPatients: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/master-data/patients`,
    masterDataStaff: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/master-data/staff`,
    systemIntegrations: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/integrations`,
    eventProcessing: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/events/log`,
    administrativeOverview: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/overview`,
    staffPerformance: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/staff-performance`,
    realTimeCompliance: `${API_GATEWAY_CONFIG.baseUrl}/administrative-integration/compliance/real-time-check`,
    // Advanced Clinical Operations Intelligence Endpoints
    predictiveAnalytics: `${API_GATEWAY_CONFIG.baseUrl}/predictive-analytics`,
    demandForecasting: `${API_GATEWAY_CONFIG.baseUrl}/predictive-analytics/demand-forecast`,
    patientRiskAssessment: `${API_GATEWAY_CONFIG.baseUrl}/predictive-analytics/patient-risk`,
    clinicalDecisionSupport: `${API_GATEWAY_CONFIG.baseUrl}/predictive-analytics/clinical-decision-support`,
    intelligentForms: `${API_GATEWAY_CONFIG.baseUrl}/intelligent-forms`,
    formProcessing: `${API_GATEWAY_CONFIG.baseUrl}/intelligent-forms/process`,
    formTemplates: `${API_GATEWAY_CONFIG.baseUrl}/intelligent-forms/templates`,
    mlModels: `${API_GATEWAY_CONFIG.baseUrl}/ml-models`,
    nlpEngine: `${API_GATEWAY_CONFIG.baseUrl}/nlp-engine`,
    // Communication & Collaboration Systems Endpoints
    communicationChat: `${API_GATEWAY_CONFIG.baseUrl}/communication/chat`,
    communicationEmail: `${API_GATEWAY_CONFIG.baseUrl}/communication/email`,
    communicationCommittee: `${API_GATEWAY_CONFIG.baseUrl}/communication/committee`,
    communicationDashboard: `${API_GATEWAY_CONFIG.baseUrl}/communication/dashboard`,
    communicationGovernance: `${API_GATEWAY_CONFIG.baseUrl}/communication/governance`,
    communicationAnalytics: `${API_GATEWAY_CONFIG.baseUrl}/communication/analytics`,
    websocketEndpoint: `${API_GATEWAY_CONFIG.baseUrl.replace("http", "ws")}/ws`,
};
// DOH API Configuration
export const DOH_API_CONFIG = {
    baseUrl: process.env.DOH_API_URL || "https://api.doh.gov.ae",
    version: "v1",
    timeout: 60000, // 60 seconds
};
// Daman API Configuration
export const DAMAN_API_CONFIG = {
    baseUrl: process.env.DAMAN_API_URL || "https://api.damanhealth.ae",
    version: "v1",
    timeout: 60000, // 60 seconds
};
// API Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    // Administrative endpoints with higher limits for real-time operations
    administrative: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 200, // Higher limit for attendance tracking and real-time updates
    },
    reporting: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // Lower limit for resource-intensive report generation
    },
};
// API Security Configuration
export const API_SECURITY_CONFIG = {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpiresIn: "1d", // 1 day
    refreshTokenExpiresIn: "7d", // 7 days
    bcryptSaltRounds: 10,
    // Role-based access control for administrative functions
    rolePermissions: {
        admin: ["*"], // Full access
        supervisor: [
            "attendance:read",
            "attendance:approve",
            "incidents:read",
            "incidents:approve",
            "reports:read",
            "reports:approve",
            "quality:read",
            "quality:write",
            "planning:read",
            "planning:write",
        ],
        manager: [
            "attendance:read",
            "incidents:read",
            "reports:read",
            "quality:read",
            "planning:read",
            "analytics:read",
        ],
        staff: ["attendance:self", "incidents:report", "planning:read"],
        quality_manager: [
            "quality:*",
            "compliance:*",
            "audit:*",
            "incidents:read",
            "reports:read",
        ],
    },
};
// API Logging Configuration
export const API_LOGGING_CONFIG = {
    level: process.env.LOG_LEVEL || "info",
    format: "json",
};
// API Monitoring Configuration
export const API_MONITORING_CONFIG = {
    enabled: true,
    interval: 60000, // 60 seconds
};
// API Cache Configuration
export const API_CACHE_CONFIG = {
    ttl: 60, // 60 seconds
    max: 1000, // 1000 items
};
// API Cors Configuration
export const API_CORS_CONFIG = {
    origin: ["https://reyadahomecare.ae", "https://admin.reyadahomecare.ae"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Total-Count"],
    credentials: true,
    maxAge: 86400, // 1 day
};
// API Compression Configuration
export const API_COMPRESSION_CONFIG = {
    level: 6,
    threshold: 1024, // 1KB
};
// API Helmet Configuration
export const API_HELMET_CONFIG = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
        },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
};
