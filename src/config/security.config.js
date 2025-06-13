// Security Configuration
// Centralized security settings and policies
export const ENCRYPTION_CONFIG = {
    algorithm: "AES-GCM",
    keyLength: 256,
    ivLength: 12,
    saltLength: 16,
};
export const CSRF_CONFIG = {
    tokenHeader: "X-CSRF-Token",
    tokenStorageKey: "csrf_token",
    tokenExpiryKey: "csrf_token_expiry",
    tokenLifetime: 3600000, // 1 hour in milliseconds
};
export const CSP_CONFIG = {
    directives: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://api.tempo.new",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://images.unsplash.com https://api.dicebear.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' ws: wss: https://api.reyada-homecare.ae wss://ws.reyada-homecare.ae https://api.tempo.new",
        "media-src 'self' blob:",
        "worker-src 'self' blob:",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ],
    reportUri: "/api/csp-report",
    reportOnly: false,
};
export const DATA_PROTECTION_CONFIG = {
    pii: {
        fields: [
            "name",
            "firstName",
            "lastName",
            "email",
            "phone",
            "address",
            "emiratesId",
            "nationalId",
            "passport",
            "dateOfBirth",
            "birthDate",
        ],
        encryptionRequired: true,
        auditRequired: true,
    },
    phi: {
        fields: [
            "medicalRecord",
            "diagnosis",
            "treatment",
            "medication",
            "allergies",
            "symptoms",
            "vitals",
            "labResults",
            "imaging",
            "clinicalNotes",
            "patientHistory",
            "insuranceNumber",
            "membershipNumber",
        ],
        encryptionRequired: true,
        auditRequired: true,
        accessControlRequired: true,
    },
    retention: {
        defaultPeriod: 2555, // 7 years in days
        auditLogPeriod: 365, // 1 year in days
        errorLogPeriod: 90, // 3 months in days
    },
};
export const INPUT_VALIDATION_CONFIG = {
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 10,
    allowedFileTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxFileSize: 10485760, // 10MB in bytes
};
export const RATE_LIMITING_CONFIG = {
    api: {
        windowMs: 900000, // 15 minutes
        maxRequests: 100,
    },
    auth: {
        windowMs: 900000, // 15 minutes
        maxRequests: 5,
    },
    upload: {
        windowMs: 3600000, // 1 hour
        maxRequests: 10,
    },
};
export const SESSION_CONFIG = {
    timeout: 1800000, // 30 minutes in milliseconds
    warningTime: 300000, // 5 minutes before timeout
    maxConcurrentSessions: 3,
    requireReauth: [
        "password-change",
        "sensitive-data-access",
        "admin-functions",
    ],
};
export const AUDIT_CONFIG = {
    events: [
        "login",
        "logout",
        "password-change",
        "data-access",
        "data-modification",
        "file-upload",
        "file-download",
        "admin-action",
        "security-violation",
        "error-occurrence",
    ],
    retention: 2555, // 7 years in days
    realTimeAlerts: [
        "security-violation",
        "multiple-failed-logins",
        "suspicious-activity",
    ],
};
export const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
};
export const COMPLIANCE_CONFIG = {
    // DOH Tasneef Audit Checklist JDC 2024 Configuration
    doh_tasneef_2024: {
        version: "JDC-2024",
        auditDate: "2024-12-18",
        checklist: {
            claims_management: {
                evidence_preparation: {
                    required: true,
                    responsible_parties: {
                        insurance: "Maria Lyn Ureta",
                        mrd: "Mohammed Shafi",
                        clinical: "Ghiwa",
                    },
                    deadline: "2024-12-17",
                },
                emr_lock_24h: {
                    required: true,
                    responsible: "Mohammed Shafi, Mohamed Ashik",
                    implementation_date: "2024-12-12",
                    validation_date: "2024-12-17",
                },
                audit_logistics: {
                    rooms_required: 3,
                    computers_required: 4,
                    refreshments: true,
                    responsible: "Office Manager, Ashik & Ajin",
                },
            },
            policies_procedures: {
                clinical_coding_claims: {
                    status: "needs_revision",
                    responsible: "Maria Lyn Ureta, Cecil, Abinaya",
                    upload_location: "dropbox",
                },
                clinician_coder_query: {
                    status: "non_compliant",
                    issue: "not_complying_with_process",
                    changes_required: true,
                    responsible: "Maria Lyn Ureta, Abinaya Selvaraj",
                },
                code_of_ethics: {
                    status: "verified",
                    flowchart_verified: true,
                    hr_implementation_check: "pending",
                },
                coding_resources: {
                    icd10_2021: "available_hardcopy",
                    certificates: {
                        lyn: "completed",
                        rubeena: "completed",
                        priya: "completed",
                    },
                },
                consent_policy: {
                    new_standard: "november_2024",
                    effective_date: "february_2025",
                    update_required: true,
                },
                continuing_education: {
                    status: "missing",
                    note: "Not Found Pls Provide the Link",
                },
            },
            kpi_management: {
                jawda_kpi_training: {
                    policy_uploaded: true,
                    changes_required: true,
                    attendance_forms: "pending",
                    responsible: "Ghiwa Nasr",
                },
                emr_audit_log: {
                    status: "pending_vision_technology",
                    follow_up_required: true,
                    last_contact: "2024-12-11",
                },
                kpi_statistics_report: {
                    generated_tracker: true,
                    admission_discharge_log: true,
                    patient_demographic_update_required: false, // Completed
                    jawda_non_jawda_tracking: true,
                    automated_data_collection: true,
                    real_time_dashboard: true,
                    trend_analysis: true,
                    predictive_analytics: true,
                },
            },
        },
    },
    adhics: {
        version: "V2",
        effectiveDate: "2024-08-01",
        revisionDate: "2027-05-01",
        sectionA: {
            governance: {
                isgc: {
                    required: true,
                    quorum: 0.6,
                    meetingFrequency: "quarterly",
                    documentation: ["minutes", "action-plans", "compliance-reports"],
                },
                hiip: {
                    required: true,
                    leadership: "CISO",
                    representatives: ["business", "support", "clinical", "it"],
                },
                ciso: {
                    required: true,
                    responsibilities: [
                        "security-architecture",
                        "policy-management",
                        "incident-coordination",
                        "compliance-reporting",
                    ],
                },
            },
            riskManagement: {
                assessmentFrequency: "annual",
                treatmentRequired: true,
                monitoringRequired: true,
                documentationRequired: true,
            },
            assetClassification: {
                scheme: ["Public", "Restricted", "Confidential", "Secret"],
                labelingRequired: true,
                handlingProcedures: true,
            },
        },
        sectionB: {
            humanResources: {
                policies: ["HR1.1"],
                backgroundVerification: "HR2.1",
                termsAndConditions: "HR2.2",
                trainingAwareness: "HR3.1-3.5",
                terminationProcess: "HR4.1-4.4",
            },
            assetManagement: {
                policies: ["AM1.1", "AM1.2"],
                inventory: "AM2.1",
                classification: "AM3.1",
                handling: "AM4.1-4.10",
                disposal: "AM5.1-5.7",
            },
            physicalSecurity: {
                policies: ["PE1.1"],
                secureAreas: "PE2.1-2.10",
                equipmentSecurity: "PE3.1-3.7",
            },
            accessControl: {
                policies: ["AC1.1"],
                userManagement: "AC2.1-2.3",
                deviceControl: "AC3.1-3.3",
                accessReviews: "AC4.1",
                networkControl: "AC5.1-5.7",
                systemControl: "AC6.1-6.3",
                applicationControl: "AC7.1-7.3",
            },
            communications: {
                policies: ["CO1.1"],
                operations: "CO2.1-2.6",
                planning: "CO3.1-3.2",
                malwareProtection: "CO4.1-4.2",
                backup: "CO5.1-5.2",
                monitoring: "CO6.1-6.4",
                vulnerability: "CO7.1-7.2",
                patchManagement: "CO8.1-8.2",
                informationExchange: "CO9.1-9.7",
                ecommerce: "CO10.1-10.3",
                networkSecurity: "CO12.1-12.3",
            },
            dataPrivacy: {
                policies: ["DP1.1"],
                practices: "DP1.1-1.7",
                dpo: "DP2.1",
                subjectRights: "DP3.1",
            },
            cloudSecurity: {
                policies: ["CS1.1"],
                controls: "CS1.2",
            },
            thirdPartySecurity: {
                policies: ["TP1.1"],
                serviceDelivery: "TP2.1-2.3",
            },
            systemAcquisition: {
                policies: ["SA1.1"],
                requirements: "SA2.1-2.4",
                cryptography: "SA3.1",
                systemFiles: "SA4.1-4.2",
                outsourcing: "SA5.1",
                supplyChain: "SA6.1-6.4",
            },
            incidentManagement: {
                policies: ["IM1.1"],
                procedures: "IM2.1-2.6",
                reporting: "IM3.1-3.3",
            },
            systemContinuity: {
                policies: ["SC1.1"],
                planning: "SC2.1-2.3",
            },
        },
        controlCategories: {
            basic: {
                timeline: "6 months",
                applicability: "all entities",
                priority: "high",
            },
            transitional: {
                timeline: "6 months",
                applicability: "hospitals 1-20 beds, centers",
                priority: "high",
            },
            advanced: {
                timeline: "6 months",
                applicability: "hospitals 21+ beds, HIE, payers",
                priority: "high",
            },
            serviceProvider: {
                timeline: "6 months",
                applicability: "external technology providers",
                priority: "high",
            },
        },
    },
    doh: {
        requiredFields: [
            "patientId",
            "emiratesId",
            "serviceType",
            "providerLicense",
            "clinicalJustification",
            "serviceDate",
        ],
        documentationStandards: [
            "patient-assessment",
            "care-plan",
            "progress-notes",
            "discharge-summary",
        ],
        auditFrequency: "monthly",
    },
    daman: {
        requiredFields: [
            "priorAuthorizationNumber",
            "membershipNumber",
            "serviceCode",
            "diagnosisCode",
            "providerSignature",
            "patientSignature",
            "letterOfAppointment",
            "contactPersonDetails",
            "clinicalJustification",
            "faceToFaceAssessment",
        ],
        submissionDeadline: 30, // days
        appealDeadline: 60, // days
        mscGuidelines: {
            initialVisitNotification: true,
            atcValidityRevision: true,
            treatmentPeriodCompliance: true,
            ninetyDayRule: true,
            monthlyBilling: true,
        },
        homecareStandards: {
            serviceCodes: {
                "17-25-1": {
                    description: "Simple Home Visit - Nursing Service",
                    price: 300,
                    effectiveDate: "2025-01-01",
                    replacesCode: "17-26-1",
                },
                "17-25-2": {
                    description: "Simple Home Visit - Supportive Service",
                    price: 300,
                    effectiveDate: "2025-01-01",
                    replacesCode: "17-26-2",
                },
                "17-25-3": {
                    description: "Specialized Home Visit - Consultation",
                    price: 800,
                    effectiveDate: "2025-01-01",
                    replacesCode: "17-26-3",
                },
                "17-25-4": {
                    description: "Routine Home Nursing Care",
                    price: 900,
                    effectiveDate: "2025-01-01",
                    replacesCode: "17-26-4",
                },
                "17-25-5": {
                    description: "Advanced Home Nursing Care",
                    price: 1800,
                    effectiveDate: "2025-01-01",
                    newCode: true,
                },
            },
            deprecatedCodes: {
                "17-26-1": {
                    description: "Legacy Home Nursing",
                    deprecatedDate: "2024-06-01",
                    replacementCode: "17-25-1",
                    billable: false,
                },
                "17-26-2": {
                    description: "Legacy Physiotherapy",
                    deprecatedDate: "2024-06-01",
                    replacementCode: "17-25-2",
                    billable: false,
                },
                "17-26-3": {
                    description: "Legacy Medical Equipment",
                    deprecatedDate: "2024-06-01",
                    replacementCode: "17-25-3",
                    billable: false,
                },
                "17-26-4": {
                    description: "Legacy Wound Care",
                    deprecatedDate: "2024-06-01",
                    replacementCode: "17-25-4",
                    billable: false,
                },
            },
            documentationRequirements: [
                "assessment-form",
                "care-plan-consent",
                "patient-monitoring-form",
                "service-confirmation",
                "daily-schedule",
            ],
            submissionTimelines: {
                dailyDeadline: "08:00", // UAE time
                timeZone: "Asia/Dubai",
                monthly: true,
                gracePeriod: "14th Feb 2025",
                finalReconciliation: "01st March 2025",
                lateSubmissionThreshold: 4, // hours after deadline for critical status
                escalationRequired: true,
            },
            faceToFaceAssessment: {
                effectiveDate: "2025-02-24",
                preparationPeriodStart: "2025-02-01",
                mandatory: true,
                openJetIntegrationRequired: true,
                manualAssessmentsDeprecated: true,
                automatedAllocation: true,
            },
        },
        wheelchairPreApproval: {
            effectiveDate: "1st May 2025",
            requiredDocuments: [
                "wheelchair-pre-approval-form",
                "brand-warranty",
                "medical-report",
            ],
            formValidityPeriod: 30, // days
            medicalReportValidityPeriod: 90, // days
        },
        providerAuthentication: {
            letterOfAppointmentRequired: true,
            uaeEmailDomainRequired: true,
            contactPersonValidation: true,
            digitalSignatureRequired: true,
            roleBasedAccess: true,
        },
        integrationRequirements: {
            openJetIntegration: true,
            homecareAllocationAutomation: true,
            realTimeEligibilityVerification: true,
            webhookNotifications: true,
            automatedStatusSync: true,
        },
    },
    hipaa: {
        dataMinimization: true,
        accessLogging: true,
        encryptionAtRest: true,
        encryptionInTransit: true,
        regularAudits: true,
    },
};
export const DAMAN_SPECIFIC_CONFIG = {
    encryption: {
        algorithm: "AES-256-GCM",
        keyRotation: true,
        doubleEncryption: true,
        dataAnonymization: true,
        quantumResistant: true,
        keyManagement: {
            rotationInterval: 86400000, // 24 hours
            keyDerivationRounds: 100000,
            saltLength: 32,
            hsm: true, // Hardware Security Module
            keyEscrow: true,
            multiPartyComputation: true,
        },
        adhicsCompliance: {
            sectionA: {
                governance: true,
                riskManagement: true,
                assetClassification: true,
                controlAdoption: true,
                complianceAudit: true,
            },
            sectionB: {
                humanResources: true,
                assetManagement: true,
                physicalSecurity: true,
                accessControl: true,
                communications: true,
                dataPrivacy: true,
                cloudSecurity: true,
                thirdPartySecurity: true,
                systemAcquisition: true,
                incidentManagement: true,
                systemContinuity: true,
            },
        },
    },
    auditTrail: {
        comprehensiveLogging: true,
        userActionTracking: true,
        complianceVerification: true,
        retentionPeriod: 2555, // 7 years in days
        realTimeMonitoring: true,
        eventTypes: [
            "authorization_submission",
            "eligibility_check",
            "document_upload",
            "status_update",
            "provider_authentication",
            "data_access",
            "compliance_violation",
        ],
        alertThresholds: {
            failedAttempts: 5,
            suspiciousActivity: 3,
            complianceViolations: 1,
        },
    },
    apiIntegration: {
        damanApiEndpoint: "/api/daman",
        openJetEndpoint: "/api/openjet",
        webhookEndpoint: "/api/webhooks/daman",
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        circuitBreakerThreshold: 5,
        rateLimiting: {
            requestsPerMinute: 100,
            burstLimit: 20,
            windowSize: 60000,
        },
        healthCheck: {
            interval: 30000, // 30 seconds
            timeout: 5000, // 5 seconds
            retries: 3,
        },
    },
    complianceScoring: {
        authorizationSuccessWeight: 0.25,
        processingTimeWeight: 0.2,
        documentationWeight: 0.2,
        integrationHealthWeight: 0.15,
        securityComplianceWeight: 0.2,
        thresholds: {
            excellent: 95,
            good: 85,
            acceptable: 75,
            needsImprovement: 60,
        },
        realTimeCalculation: true,
        historicalTrending: true,
    },
    dataProtection: {
        piiFields: [
            "emiratesId",
            "passportNumber",
            "medicalRecordNumber",
            "insuranceId",
            "membershipNumber",
            "contactDetails",
            "damanMemberId",
            "authorizationReference",
            "providerContractNumber",
            "priorAuthorizationNumber",
            "serviceCode",
            "diagnosisCode",
        ],
        phiFields: [
            "diagnosis",
            "treatment",
            "medication",
            "clinicalNotes",
            "assessmentResults",
            "careplan",
            "diagnosisCodes",
            "mscPlanDetails",
            "wheelchairApprovalData",
            "homecareAllocationInfo",
            "clinicalJustification",
            "faceToFaceAssessment",
            "periodicAssessment",
        ],
        anonymizationRules: {
            emiratesId: "mask-middle-7",
            phone: "mask-last-7",
            email: "mask-local-part",
            medicalRecord: "hash-with-salt",
            damanMemberId: "mask-middle-4",
            authorizationReference: "hash-with-timestamp",
            priorAuthorizationNumber: "mask-middle-6",
            serviceCode: "preserve-format",
            diagnosisCode: "hash-with-salt",
        },
        encryptionLevels: {
            standard: ["contactDetails", "membershipNumber", "serviceCode"],
            enhanced: [
                "emiratesId",
                "medicalRecordNumber",
                "insuranceId",
                "priorAuthorizationNumber",
                "diagnosisCode",
                "providerLicense",
                "letterOfAppointment",
                "contactPersonDetails",
            ],
            maximum: [
                "clinicalNotes",
                "diagnosisCodes",
                "assessmentResults",
                "clinicalJustification",
                "faceToFaceAssessment",
                "periodicAssessment",
                "wheelchairApprovalData",
                "mscPlanDetails",
                "providerSignature",
                "patientSignature",
                "biometricData",
                "sensitiveHealthData",
            ],
            ultraSecure: [
                "geneticInformation",
                "mentalHealthRecords",
                "substanceAbuseRecords",
                "hivAidsRecords",
                "reproductiveHealthData",
            ],
        },
        newDataFieldProtection: {
            doh2025Fields: [
                "enhancedClinicalJustification",
                "extendedFaceToFaceAssessment",
                "comprehensivePeriodicAssessment",
                "advancedWheelchairApprovalData",
                "detailedMscPlanInformation",
                "providerAuthenticationData",
                "patientConsentDocuments",
                "digitalSignatureMetadata",
            ],
            encryptionLevel: "maximum",
            accessControl: "role-based-enhanced",
            auditTrail: "comprehensive",
            dataMinimization: true,
        },
        enhancedProtection: {
            doubleEncryption: true,
            keyRotation: true,
            accessLogging: true,
            dataMinimization: true,
            retentionPolicies: {
                clinical: 2555, // 7 years
                administrative: 1825, // 5 years
                audit: 2555, // 7 years
            },
            complianceValidation: {
                dohCompliance: true,
                damanStandards: true,
                hipaaAlignment: true,
                gdprAlignment: true,
            },
        },
    },
    webhookSecurity: {
        signatureValidation: true,
        timestampValidation: true,
        maxAge: 300000, // 5 minutes
        allowedOrigins: [
            "https://api.damanhealth.ae",
            "https://provider.damanhealth.ae",
            "https://openjet.ae",
        ],
        retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000,
        },
    },
    realTimeCompliance: {
        enabled: true,
        monitoringInterval: 10000, // 10 seconds
        alertingEnabled: true,
        autoRemediation: {
            enabled: true,
            actions: [
                "suspend_non_compliant_requests",
                "escalate_critical_violations",
                "auto_correct_data_format",
            ],
        },
    },
    mscGuidelines2025: {
        planExtensionDeadline: {
            finalDeadline: "2025-05-14",
            gracePeriodStart: "2025-04-14",
            noFurtherExtensions: true,
            automaticValidation: true,
            realTimeMonitoring: true,
            escalationRequired: true,
            complianceScoring: true,
            enhancedValidation: {
                preSubmissionCheck: true,
                realTimeCompliance: true,
                automaticRejection: true,
                escalationMatrix: {
                    level1: "supervisor_notification",
                    level2: "management_escalation",
                    level3: "regulatory_reporting",
                },
            },
        },
        enhancedDataProtection: {
            doubleEncryption: true,
            keyRotation: true,
            accessLogging: true,
            dataMinimization: true,
            retentionPolicies: {
                clinical: 2555, // 7 years
                administrative: 1825, // 5 years
                audit: 2555, // 7 years
            },
            complianceValidation: {
                dohCompliance: true,
                damanStandards: true,
                hipaaAlignment: true,
                gdprAlignment: true,
            },
        },
        apiEnhancements: {
            comprehensiveValidation: true,
            realTimeComplianceCheck: true,
            providerAuthentication: {
                letterOfAppointmentRequired: true,
                uaeEmailDomainRequired: true,
                contactPersonValidation: true,
                digitalSignatureRequired: true,
                roleBasedAccess: true,
            },
            enhancedErrorHandling: {
                structuredLogging: true,
                errorCategorization: true,
                automaticRecovery: true,
                escalationPaths: true,
            },
        },
        initialVisitNotification: {
            required: true,
            timeframe: 90, // days from ATC effective date
            automaticReminders: true,
            realTimeTracking: true,
            complianceAlerts: true,
        },
        atcValidityRevision: {
            required: true,
            automaticCheck: true,
            validityPeriod: 90, // days
            renewalAlerts: true,
            expirationWarnings: [30, 14, 7, 1], // days before expiration
        },
        treatmentPeriodCompliance: {
            maxPeriod: 90, // days
            renewalRequired: true,
            strictEnforcement: true,
            automaticTermination: true,
            complianceReporting: true,
        },
        ninetyDayRule: {
            enforced: true,
            automaticValidation: true,
            noExceptions: true,
            realTimeEnforcement: true,
            violationAlerts: true,
        },
        monthlyBilling: {
            required: true,
            validationEnabled: true,
            maxBillingPeriod: 30, // days
            automaticReconciliation: true,
            complianceTracking: true,
        },
        paymentTerms: {
            standardTerms: 30, // days for CN_2025
            automaticValidation: true,
            complianceRequired: true,
            realTimeVerification: true,
            nonComplianceAlerts: true,
        },
        serviceConfirmation: {
            patientSignatureRequired: true,
            bluePenRequired: true,
            digitalSignatureAccepted: false,
            signatureValidation: true,
            documentIntegrity: true,
        },
        dailySchedule: {
            signatureRequired: true,
            patientOrRelativeSignature: true,
            timeStampValidation: true,
            complianceTracking: true,
        },
        enhancedValidation: {
            realTimeCompliance: true,
            automaticRejection: true,
            escalationMatrix: {
                level1: "supervisor_notification",
                level2: "management_escalation",
                level3: "regulatory_reporting",
            },
            auditTrail: {
                comprehensive: true,
                realTime: true,
                retention: 2555, // 7 years
            },
        },
    },
    homecareStandards2025: {
        serviceCodes: {
            "17-25-1": {
                description: "Simple Home Visit - Nursing Service",
                price: 300,
                authorizationRequired: true,
                documentationLevel: "standard",
                effectiveDate: "2025-01-01",
                replacesCode: "17-26-1",
                complianceRequired: true,
                realTimeValidation: true,
            },
            "17-25-2": {
                description: "Simple Home Visit - Supportive Service",
                price: 300,
                authorizationRequired: true,
                documentationLevel: "standard",
                effectiveDate: "2025-01-01",
                replacesCode: "17-26-2",
                complianceRequired: true,
                realTimeValidation: true,
            },
            "17-25-3": {
                description: "Specialized Home Visit - Consultation",
                price: 800,
                authorizationRequired: true,
                documentationLevel: "enhanced",
                effectiveDate: "2025-01-01",
                replacesCode: "17-26-3",
                complianceRequired: true,
                realTimeValidation: true,
            },
            "17-25-4": {
                description: "Routine Home Nursing Care",
                price: 900,
                authorizationRequired: true,
                documentationLevel: "comprehensive",
                effectiveDate: "2025-01-01",
                replacesCode: "17-26-4",
                complianceRequired: true,
                realTimeValidation: true,
            },
            "17-25-5": {
                description: "Advanced Home Nursing Care",
                price: 1800,
                authorizationRequired: true,
                documentationLevel: "comprehensive",
                effectiveDate: "2025-01-01",
                newCode: true,
                complianceRequired: true,
                realTimeValidation: true,
            },
        },
        deprecatedCodes: {
            "17-26-1": {
                description: "Legacy Home Nursing",
                deprecatedDate: "2024-06-01",
                replacementCode: "17-25-1",
                billable: false,
                automaticRejection: true,
                complianceViolation: true,
            },
            "17-26-2": {
                description: "Legacy Physiotherapy",
                deprecatedDate: "2024-06-01",
                replacementCode: "17-25-2",
                billable: false,
                automaticRejection: true,
                complianceViolation: true,
            },
            "17-26-3": {
                description: "Legacy Medical Equipment",
                deprecatedDate: "2024-06-01",
                replacementCode: "17-25-3",
                billable: false,
                automaticRejection: true,
                complianceViolation: true,
            },
            "17-26-4": {
                description: "Legacy Wound Care",
                deprecatedDate: "2024-06-01",
                replacementCode: "17-25-4",
                billable: false,
                automaticRejection: true,
                complianceViolation: true,
            },
        },
        documentationRequirements: {
            standard: [
                "assessment-form",
                "care-plan-consent",
                "patient-monitoring-form",
                "provider-signature",
                "patient-signature",
            ],
            enhanced: [
                "assessment-form",
                "care-plan-consent",
                "patient-monitoring-form",
                "service-confirmation",
                "clinical-justification",
                "provider-signature",
                "patient-signature",
                "letter-of-appointment",
            ],
            comprehensive: [
                "assessment-form",
                "care-plan-consent",
                "patient-monitoring-form",
                "service-confirmation",
                "daily-schedule",
                "clinical-justification",
                "face-to-face-assessment",
                "periodic-assessment",
                "provider-signature",
                "patient-signature",
                "letter-of-appointment",
                "contact-person-details",
            ],
        },
        submissionTimelines: {
            monthly: true,
            dailyDeadline: "08:00", // UAE time
            timeZone: "Asia/Dubai",
            gracePeriod: "14th Feb 2025",
            finalReconciliation: "01st March 2025",
            lateSubmissionPenalty: true,
            criticalDelayThreshold: 4, // hours
            escalationRequired: true,
            realTimeMonitoring: true,
        },
        qualityMetrics: {
            responseTimeTarget: 48, // hours
            documentationCompleteness: 98, // percentage
            authorizationSuccessRate: 95, // percentage
            complianceScore: 90, // percentage
            realTimeTracking: true,
            automaticReporting: true,
        },
        enhancedCompliance: {
            realTimeValidation: true,
            automaticRejection: true,
            complianceScoring: true,
            auditTrail: true,
            escalationMatrix: {
                level1: "warning_notification",
                level2: "supervisor_escalation",
                level3: "regulatory_reporting",
            },
        },
    },
    wheelchairPreApproval2025: {
        effectiveDate: "2025-05-01",
        transitionPeriodStart: "2025-04-01",
        mandatory: true,
        replacesForm: "PT Form",
        validityPeriod: 30, // days
        strictEnforcement: true,
        requiredDocuments: [
            "wheelchair-pre-approval-form",
            "brand-warranty",
            "medical-report",
            "technical-specifications",
            "physician-recommendation",
            "updated-medical-report",
        ],
        deprecatedForms: [
            "PT Form",
            "Physiotherapy Form",
            "Physical Therapy Assessment",
        ],
        formValidityPeriod: 30, // days
        medicalReportValidityPeriod: 90, // days
        automaticRejection: true, // for deprecated forms after effective date
        professionalSignatures: {
            required: true,
            acceptedProfessionals: [
                "physiotherapist",
                "occupational_therapist",
                "rehabilitation_specialist",
                "consultant",
            ],
            physicianApprovalRequired: true,
            digitalSignatureSupported: true,
            signatureValidation: true,
        },
        complianceChecks: {
            automaticValidation: true,
            realTimeVerification: true,
            documentIntegrity: true,
            formAuthenticity: true,
            professionalLicenseVerification: true,
        },
        enhancedSecurity: {
            encryptionLevel: "maximum",
            auditTrail: true,
            accessControl: "role-based",
            dataRetention: 2555, // 7 years
            complianceReporting: true,
        },
        transitionManagement: {
            warningPeriod: 30, // days before effective date
            automaticNotifications: true,
            providerTraining: true,
            systemUpdates: true,
        },
        qualityAssurance: {
            documentReview: "mandatory",
            clinicalValidation: true,
            technicalSpecsVerification: true,
            warrantyValidation: true,
        },
    },
    providerAuthentication2025: {
        letterOfAppointmentRequired: true,
        uaeEmailDomainRequired: true,
        contactPersonValidation: true,
        digitalSignatureRequired: true,
        roleBasedAccess: true,
        enhancedVerification: {
            enabled: true,
            biometricSupport: false,
            twoFactorAuthentication: true,
            sessionTimeout: 1800000, // 30 minutes
        },
        accessControl: {
            granularPermissions: true,
            resourceBasedAccess: true,
            auditLogging: true,
        },
    },
    integrationIntelligence: {
        enabled: true,
        aiPoweredInsights: true,
        predictiveAnalytics: true,
        anomalyDetection: true,
        performanceOptimization: true,
        realTimeMonitoring: true,
        alerting: {
            enabled: true,
            channels: ["email", "sms", "webhook"],
            escalationLevels: 3,
        },
    },
};
