// Authentication & Authorization Configuration
// Centralized authentication system configuration for Reyada Homecare Platform
// P1-003: Multi-Factor Authentication Implementation - IMPLEMENTED

export interface AuthConfig {
  provider: "supabase" | "custom" | "oauth";
  sessionTimeout: number;
  refreshThreshold: number;
  maxConcurrentSessions: number;
  passwordPolicy: PasswordPolicy;
  mfaRequired: boolean;
  ssoEnabled: boolean;
  roleBasedAccess: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expiryDays: number;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchy: number;
  description: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "execute";
  conditions?: Record<string, any>;
  description: string;
}

// Healthcare-specific roles for DOH compliance
export const HEALTHCARE_ROLES: UserRole[] = [
  {
    id: "super_admin",
    name: "Super Administrator",
    hierarchy: 100,
    description: "Full system access with all administrative privileges",
    isActive: true,
    permissions: [
      {
        id: "system.admin",
        resource: "*",
        action: "execute",
        description: "Full system administration",
      },
      {
        id: "user.manage",
        resource: "users",
        action: "create",
        description: "Manage all users",
      },
      {
        id: "audit.view",
        resource: "audit_logs",
        action: "read",
        description: "View all audit logs",
      },
      {
        id: "compliance.manage",
        resource: "compliance",
        action: "execute",
        description: "Manage compliance settings",
      },
    ],
  },
  {
    id: "clinical_director",
    name: "Clinical Director",
    hierarchy: 90,
    description: "Senior clinical oversight and management",
    isActive: true,
    permissions: [
      {
        id: "patient.manage",
        resource: "patients",
        action: "create",
        description: "Manage patient records",
      },
      {
        id: "episode.manage",
        resource: "episodes",
        action: "create",
        description: "Manage care episodes",
      },
      {
        id: "clinical.approve",
        resource: "clinical_forms",
        action: "update",
        description: "Approve clinical documentation",
      },
      {
        id: "staff.supervise",
        resource: "user_profiles",
        action: "read",
        description: "Supervise clinical staff",
      },
      {
        id: "quality.review",
        resource: "quality_metrics",
        action: "read",
        description: "Review quality indicators",
      },
    ],
  },
  {
    id: "physician",
    name: "Physician",
    hierarchy: 80,
    description: "Licensed physician with full clinical privileges",
    isActive: true,
    permissions: [
      {
        id: "patient.clinical",
        resource: "patients",
        action: "update",
        description: "Clinical patient management",
      },
      {
        id: "diagnosis.create",
        resource: "clinical_forms",
        action: "create",
        description: "Create diagnoses and treatment plans",
      },
      {
        id: "prescription.manage",
        resource: "medications",
        action: "create",
        description: "Prescribe medications",
      },
      {
        id: "orders.create",
        resource: "medical_orders",
        action: "create",
        description: "Create medical orders",
      },
    ],
  },
  {
    id: "registered_nurse",
    name: "Registered Nurse",
    hierarchy: 70,
    description:
      "Licensed registered nurse with clinical documentation privileges",
    isActive: true,
    permissions: [
      {
        id: "patient.assess",
        resource: "patients",
        action: "read",
        description: "Patient assessment and monitoring",
      },
      {
        id: "vitals.record",
        resource: "vital_signs",
        action: "create",
        description: "Record vital signs",
      },
      {
        id: "nursing.document",
        resource: "clinical_forms",
        action: "create",
        description: "Nursing documentation",
      },
      {
        id: "medication.administer",
        resource: "medications",
        action: "update",
        description: "Administer medications",
      },
    ],
  },
  {
    id: "therapist",
    name: "Therapist",
    hierarchy: 65,
    description:
      "Licensed therapist (PT/OT/ST) with therapy-specific privileges",
    isActive: true,
    permissions: [
      {
        id: "therapy.assess",
        resource: "therapy_assessments",
        action: "create",
        description: "Therapy assessments",
      },
      {
        id: "therapy.plan",
        resource: "therapy_plans",
        action: "create",
        description: "Create therapy plans",
      },
      {
        id: "therapy.document",
        resource: "therapy_sessions",
        action: "create",
        description: "Document therapy sessions",
      },
      {
        id: "patient.therapy",
        resource: "patients",
        action: "read",
        description: "Access therapy-related patient data",
      },
    ],
  },
  {
    id: "care_coordinator",
    name: "Care Coordinator",
    hierarchy: 60,
    description: "Care coordination and case management",
    isActive: true,
    permissions: [
      {
        id: "care.coordinate",
        resource: "care_plans",
        action: "update",
        description: "Coordinate care plans",
      },
      {
        id: "scheduling.manage",
        resource: "appointments",
        action: "create",
        description: "Manage appointments",
      },
      {
        id: "communication.facilitate",
        resource: "communications",
        action: "create",
        description: "Facilitate care team communication",
      },
      {
        id: "referrals.manage",
        resource: "referrals",
        action: "create",
        description: "Manage referrals",
      },
    ],
  },
  {
    id: "administrative_staff",
    name: "Administrative Staff",
    hierarchy: 50,
    description: "Administrative and clerical support",
    isActive: true,
    permissions: [
      {
        id: "patient.register",
        resource: "patients",
        action: "create",
        description: "Patient registration",
      },
      {
        id: "insurance.verify",
        resource: "insurance",
        action: "read",
        description: "Insurance verification",
      },
      {
        id: "scheduling.basic",
        resource: "appointments",
        action: "read",
        description: "Basic scheduling access",
      },
      {
        id: "reports.basic",
        resource: "reports",
        action: "read",
        description: "Basic reporting access",
      },
    ],
  },
  {
    id: "quality_manager",
    name: "Quality Manager",
    hierarchy: 75,
    description: "Quality assurance and compliance management",
    isActive: true,
    permissions: [
      {
        id: "quality.audit",
        resource: "quality_metrics",
        action: "read",
        description: "Quality auditing",
      },
      {
        id: "compliance.monitor",
        resource: "compliance",
        action: "read",
        description: "Compliance monitoring",
      },
      {
        id: "incidents.investigate",
        resource: "incidents",
        action: "update",
        description: "Incident investigation",
      },
      {
        id: "policies.review",
        resource: "policies",
        action: "read",
        description: "Policy review",
      },
    ],
  },
];

// Authentication configuration with enhanced MFA
export const AUTH_CONFIG: AuthConfig = {
  provider: "supabase",
  sessionTimeout: 1800000, // 30 minutes
  refreshThreshold: 300000, // 5 minutes before expiry
  maxConcurrentSessions: 3,
  mfaRequired: true,
  ssoEnabled: true,
  roleBasedAccess: true,
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    expiryDays: 90,
  },
};

// Enhanced MFA Configuration
export const MFA_CONFIG = {
  enabled: true,
  methods: {
    totp: {
      enabled: true,
      issuer: "Reyada Homecare Platform",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      window: 1,
    },
    sms: {
      enabled: true,
      provider: "twilio",
      codeLength: 6,
      expiryMinutes: 5,
      maxAttempts: 3,
    },
    email: {
      enabled: true,
      codeLength: 8,
      expiryMinutes: 10,
      maxAttempts: 3,
    },
    backup_codes: {
      enabled: true,
      count: 10,
      length: 8,
      oneTimeUse: true,
    },
  },
  enforcement: {
    adminRoles: ["super_admin", "clinical_director", "quality_manager"],
    clinicalRoles: ["physician", "registered_nurse", "therapist"],
    gracePeriodDays: 7,
    bypassEmergency: true,
  },
  riskBasedAuth: {
    enabled: true,
    factors: {
      location: { weight: 0.3, enabled: true },
      device: { weight: 0.2, enabled: true },
      timeOfDay: { weight: 0.1, enabled: true },
      accessPattern: { weight: 0.4, enabled: true },
    },
    thresholds: {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
    },
  },
} as const;

// API Rate Limiting Configuration - P1-006
export const RATE_LIMITING_CONFIG = {
  enabled: true,
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: "Too many requests from this IP",
  },
  endpoints: {
    "/api/auth/login": {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      skipSuccessfulRequests: true,
    },
    "/api/auth/mfa/verify": {
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
      skipSuccessfulRequests: true,
    },
    "/api/patients": {
      windowMs: 60 * 1000,
      maxRequests: 100,
      skipSuccessfulRequests: false,
    },
    "/api/clinical-forms": {
      windowMs: 60 * 1000,
      maxRequests: 50,
      skipSuccessfulRequests: false,
    },
  },
  bypassRoles: ["super_admin"],
  trustProxy: true,
} as const;

// DOH Compliance Requirements
export const DOH_AUTH_REQUIREMENTS = {
  auditLogging: {
    enabled: true,
    events: [
      "login_attempt",
      "login_success",
      "login_failure",
      "logout",
      "session_timeout",
      "password_change",
      "role_change",
      "permission_grant",
      "permission_revoke",
      "account_lock",
      "account_unlock",
    ],
    retention: 2555, // 7 years in days
  },
  sessionSecurity: {
    encryptionRequired: true,
    secureTransmission: true,
    sessionFixation: "prevent",
    concurrentSessionLimit: 3,
    idleTimeout: 1800, // 30 minutes
    absoluteTimeout: 28800, // 8 hours
  },
  accessControl: {
    principleOfLeastPrivilege: true,
    roleBasedAccess: true,
    resourceBasedAccess: true,
    contextualAccess: true,
    emergencyAccess: {
      enabled: true,
      approvalRequired: true,
      auditRequired: true,
      timeLimit: 3600, // 1 hour
    },
  },
  passwordSecurity: {
    complexity: {
      minLength: 12,
      characterTypes: 4, // uppercase, lowercase, numbers, special
      preventCommon: true,
      preventPersonal: true,
    },
    lifecycle: {
      expiryDays: 90,
      warningDays: 14,
      historyCount: 5,
      lockoutAttempts: 5,
      lockoutDuration: 1800, // 30 minutes
    },
  },
  multiFactorAuth: {
    required: true,
    methods: ["totp", "sms", "email"],
    backupCodes: true,
    deviceTrust: true,
    adaptiveAuth: true,
  },
} as const;

// ADHICS V2 Compliance Requirements
export const ADHICS_AUTH_REQUIREMENTS = {
  identityManagement: {
    uniqueIdentification: true,
    identityVerification: true,
    identityProofing: "level2", // NIST 800-63A Level 2
    credentialManagement: true,
  },
  accessManagement: {
    accessProvisioning: "automated",
    accessReview: {
      frequency: "quarterly",
      automated: true,
      managerApproval: true,
    },
    privilegedAccess: {
      justInTime: true,
      approvalWorkflow: true,
      sessionRecording: true,
      regularReview: true,
    },
  },
  authenticationMechanisms: {
    multiFactorAuth: {
      required: true,
      riskBased: true,
      adaptiveAuth: true,
    },
    singleSignOn: {
      enabled: true,
      federatedIdentity: true,
      samlSupport: true,
      oidcSupport: true,
    },
  },
  sessionManagement: {
    secureSessionHandling: true,
    sessionTimeout: true,
    concurrentSessionControl: true,
    sessionMonitoring: true,
  },
} as const;

// Security Headers for Authentication
export const AUTH_SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  algorithm: "RS256",
  issuer: "reyada-homecare-platform",
  audience: "reyada-users",
  expiresIn: "30m",
  refreshExpiresIn: "7d",
  clockTolerance: 30, // seconds
  secretRotation: {
    enabled: true,
    interval: 2592000000, // 30 days
    gracePeriod: 86400000, // 24 hours
  },
} as const;

export default {
  AUTH_CONFIG,
  HEALTHCARE_ROLES,
  DOH_AUTH_REQUIREMENTS,
  ADHICS_AUTH_REQUIREMENTS,
  AUTH_SECURITY_HEADERS,
  JWT_CONFIG,
};
