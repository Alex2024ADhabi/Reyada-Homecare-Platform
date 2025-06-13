/**
 * Daman Compliance Validator Service
 * Comprehensive validation service for Daman 2025 standards compliance
 */
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "./input-sanitization.service";
import { DAMAN_SPECIFIC_CONFIG } from "@/config/security.config";
class DamanComplianceValidatorService {
  constructor() {}
  static getInstance() {
    if (!DamanComplianceValidatorService.instance) {
      DamanComplianceValidatorService.instance =
        new DamanComplianceValidatorService();
    }
    return DamanComplianceValidatorService.instance;
  }
  /**
   * Comprehensive Daman authorization validation with ADHICS V2 compliance
   */
  validateDamanAuthorization(data) {
    const errors = [];
    const warnings = [];
    let complianceScore = 0;
    const maxScore = 100;
    const validationDetails = {
      jsonStructure: false,
      requiredFields: false,
      dataTypes: false,
      businessRules: false,
      securityCompliance: false,
      mscGuidelines: false,
      documentationStandards: false,
      adhicsCompliance: false,
    };
    // Enhanced ADHICS compliance validation
    this.validateADHICSCompliance(data, errors, warnings);
    // Enhanced mobile & offline validation
    this.validateMobileOfflineCapabilities(data, errors, warnings);
    // Enhanced analytics & intelligence validation
    this.validateAnalyticsIntelligence(data, errors, warnings);
    // Enhanced training & support validation
    this.validateTrainingSupport(data, errors, warnings);
    // Enhanced quality assurance validation
    this.validateQualityAssurance(data, errors, warnings);
    try {
      // 1. JSON Structure Validation with ADHICS compliance (15 points)
      const jsonValidation = this.validateJsonStructure(data);
      if (jsonValidation.isValid) {
        validationDetails.jsonStructure = true;
        complianceScore += 15;
      } else {
        errors.push(...jsonValidation.errors);
      }
      // 2. Required Fields Validation with ADHICS mapping (20 points)
      const fieldsValidation = this.validateRequiredFields(data);
      if (fieldsValidation.isValid) {
        validationDetails.requiredFields = true;
        complianceScore += 20;
      } else {
        errors.push(...fieldsValidation.errors);
      }
      // 3. Data Types Validation with ADHICS standards (10 points)
      const typesValidation = this.validateDataTypes(data);
      if (typesValidation.isValid) {
        validationDetails.dataTypes = true;
        complianceScore += 10;
      } else {
        errors.push(...typesValidation.errors);
      }
      // 4. Business Rules Validation with ADHICS controls (20 points)
      const businessValidation = this.validateBusinessRules(data);
      if (businessValidation.isValid) {
        validationDetails.businessRules = true;
        complianceScore += 20;
      } else {
        errors.push(...businessValidation.errors);
        warnings.push(...businessValidation.warnings);
      }
      // 5. Security Compliance with ADHICS requirements (10 points)
      const securityValidation = this.validateSecurityCompliance(data);
      if (securityValidation.isValid) {
        validationDetails.securityCompliance = true;
        complianceScore += 10;
      } else {
        errors.push(...securityValidation.errors);
      }
      // 6. MSC Guidelines with ADHICS TP controls (15 points)
      const mscValidation = this.validateMSCGuidelines(data);
      if (mscValidation.isValid) {
        validationDetails.mscGuidelines = true;
        complianceScore += 15;
      } else {
        if (data.policyType === "MSC") {
          errors.push(...mscValidation.errors);
        } else {
          warnings.push(...mscValidation.errors);
          complianceScore += 10; // Partial credit for non-MSC
        }
      }
      // 7. Documentation Standards with ADHICS AM controls (10 points)
      const docValidation = this.validateDocumentationStandards(data);
      if (docValidation.isValid) {
        validationDetails.documentationStandards = true;
        complianceScore += 10;
      } else {
        errors.push(...docValidation.errors);
      }
      // 8. ADHICS V2 Comprehensive Compliance (Additional validation)
      const adhicsValidation = this.validateComprehensiveADHICS(data);
      if (adhicsValidation.isValid) {
        validationDetails.adhicsCompliance = true;
      } else {
        errors.push(...adhicsValidation.errors);
        warnings.push(...adhicsValidation.warnings);
      }
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        complianceScore: Math.min(complianceScore, maxScore),
        validationDetails,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation process failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings: [],
        complianceScore: 0,
        validationDetails,
      };
    }
  }
  /**
   * Validate comprehensive ADHICS V2 compliance
   */
  validateComprehensiveADHICS(data) {
    const errors = [];
    const warnings = [];
    // ADHICS Section A - Governance Requirements
    if (!data.informationSecurityGovernance) {
      errors.push(
        "Missing Information Security Governance Committee (ADHICS 2.1.1)",
      );
    }
    if (!data.hiipWorkgroup) {
      errors.push("Missing HIIP Workgroup (ADHICS 2.1.2)");
    }
    if (!data.cisoDesignated) {
      errors.push(
        "Missing Chief Information Security Officer designation (ADHICS 2.1.3)",
      );
    }
    if (!data.riskManagementProcess) {
      errors.push("Missing Risk Management Process (ADHICS 3.1)");
    }
    if (!data.statementOfApplicability) {
      warnings.push(
        "Statement of Applicability should be documented (ADHICS 4)",
      );
    }
    if (!data.assetClassificationScheme) {
      errors.push("Missing Asset Classification Scheme (ADHICS 5)");
    }
    // ADHICS Section B - Control Requirements
    const requiredPolicies = [
      { policy: "hrSecurityPolicy", ref: "HR 1.1" },
      { policy: "assetManagementPolicy", ref: "AM 1.1" },
      { policy: "physicalSecurityPolicy", ref: "PE 1.1" },
      { policy: "accessControlPolicy", ref: "AC 1.1" },
      { policy: "communicationsPolicy", ref: "CO 1.1" },
      { policy: "dataPrivacyPolicy", ref: "DP 1.1" },
      { policy: "cloudSecurityPolicy", ref: "CS 1.1" },
      { policy: "thirdPartySecurityPolicy", ref: "TP 1.1" },
      { policy: "systemAcquisitionPolicy", ref: "SA 1.1" },
      { policy: "incidentManagementPolicy", ref: "IM 1.1" },
      { policy: "systemContinuityPolicy", ref: "SC 1.1" },
    ];
    requiredPolicies.forEach(({ policy, ref }) => {
      if (!data[policy]) {
        errors.push(
          `Missing ${policy.replace(/([A-Z])/g, " $1").toLowerCase()} (ADHICS ${ref})`,
        );
      }
    });
    // Specific ADHICS control validations
    if (!data.backgroundVerification) {
      errors.push("Missing background verification process (ADHICS HR 2.1)");
    }
    if (!data.assetInventory) {
      errors.push("Missing comprehensive asset inventory (ADHICS AM 2.1)");
    }
    if (!data.secureAreas) {
      errors.push("Missing secure areas definition (ADHICS PE 2.1)");
    }
    if (!data.userAccessManagement) {
      errors.push("Missing user access management process (ADHICS AC 2.1)");
    }
    if (!data.malwareProtection) {
      errors.push("Missing malware protection controls (ADHICS CO 4.1)");
    }
    if (!data.backupManagement) {
      errors.push("Missing backup management process (ADHICS CO 5.1)");
    }
    if (!data.loggingMonitoring) {
      errors.push("Missing logging and monitoring procedures (ADHICS CO 6.1)");
    }
    if (!data.vulnerabilityManagement) {
      errors.push("Missing vulnerability management process (ADHICS CO 7.1)");
    }
    if (!data.patchManagement) {
      errors.push("Missing patch management procedures (ADHICS CO 8.1)");
    }
    if (!data.dataProtectionOfficer && data.requiresDPO) {
      warnings.push(
        "Consider appointing Data Protection Officer (ADHICS DP 2.1)",
      );
    }
    if (!data.cryptographicControls) {
      errors.push("Missing cryptographic controls (ADHICS SA 3.1)");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
  /**
   * Enhanced ADHICS compliance validation
   */
  validateADHICSCompliance(data, errors, warnings) {
    // ADHICS Governance Structure Validation
    if (!data.adhicsGovernance) {
      errors.push("ADHICS governance structure not implemented");
    } else {
      if (!data.adhicsGovernance.isgc) {
        errors.push(
          "Information Security Governance Committee not established (ADHICS 2.1.1)",
        );
      }
      if (!data.adhicsGovernance.hiip) {
        errors.push("HIIP Workgroup not established (ADHICS 2.1.2)");
      }
      if (!data.adhicsGovernance.ciso) {
        errors.push("CISO not designated (ADHICS 2.1.3)");
      }
    }
    // Risk Management Validation
    if (!data.riskAssessment) {
      errors.push("Risk assessment process not implemented (ADHICS 3.1)");
    }
    if (!data.riskTreatment) {
      errors.push("Risk treatment measures not implemented (ADHICS 3.1)");
    }
    // Asset Classification Validation
    if (!data.assetClassification || !data.assetClassification.scheme) {
      errors.push("Asset classification scheme not implemented (ADHICS 5)");
    } else {
      const validClassifications = [
        "Public",
        "Restricted",
        "Confidential",
        "Secret",
      ];
      if (!validClassifications.includes(data.assetClassification.level)) {
        errors.push("Invalid asset classification level (ADHICS 5)");
      }
    }
    // Control Adoption Validation
    const requiredControlCategories = [
      "Basic",
      "Transitional",
      "Advanced",
      "Service Provider",
    ];
    if (
      !data.controlCategory ||
      !requiredControlCategories.includes(data.controlCategory)
    ) {
      warnings.push("Control category should be properly defined (ADHICS 6)");
    }
    // Compliance and Audit Validation
    if (!data.complianceMonitoring) {
      errors.push("Compliance monitoring not implemented (ADHICS 6.1)");
    }
    if (!data.auditProgram) {
      errors.push("Annual audit program not established (ADHICS 6.2)");
    }
    // Healthcare-specific validations
    if (data.entityType === "healthcare") {
      if (!data.medicalDeviceSecurity) {
        errors.push(
          "Medical device security controls not implemented (ADHICS AM 1.2)",
        );
      }
      if (!data.healthInformationProtection) {
        errors.push(
          "Health information protection policy not implemented (ADHICS HI 1.1)",
        );
      }
      if (!data.patientSafetyTaxonomy) {
        warnings.push(
          "Patient safety taxonomy should be implemented for quality monitoring",
        );
      }
    }
  }
  /**
   * Validate JSON structure and fix common issues
   */
  validateJsonStructure(data) {
    const errors = [];
    try {
      // Test JSON serialization
      const jsonString = JsonValidator.safeStringify(data);
      const validation = JsonValidator.validate(jsonString);
      if (!validation.isValid) {
        errors.push("JSON structure is invalid");
        errors.push(...(validation.errors || []));
      }
      // Check for circular references
      try {
        JSON.stringify(data);
      } catch (circularError) {
        errors.push("Data contains circular references");
      }
      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `JSON validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }
  /**
   * Validate required fields per Daman 2025 standards
   */
  validateRequiredFields(data) {
    const errors = [];
    const requiredFields = [
      "patientId",
      "emiratesId",
      "membershipNumber",
      "providerId",
      "serviceType",
      "requestedServices",
      "clinicalJustification",
      "documents",
      "digitalSignatures",
      "letterOfAppointment",
      "contactPersonDetails",
      "faceToFaceAssessment",
      "serviceConfirmation",
      "dailySchedule",
      "periodicAssessment",
    ];
    requiredFields.forEach((field) => {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        errors.push(`Required field missing: ${field}`);
      }
    });
    // Validate nested required fields
    if (data.digitalSignatures) {
      const requiredSignatures = [
        "patientSignature",
        "providerSignature",
        "contactPersonSignature",
      ];
      requiredSignatures.forEach((sig) => {
        if (!data.digitalSignatures[sig]) {
          errors.push(`Required signature missing: ${sig}`);
        }
      });
    }
    if (data.letterOfAppointment && !data.letterOfAppointment.isValid) {
      errors.push("Letter of appointment is not valid");
    }
    if (
      data.contactPersonDetails &&
      !data.contactPersonDetails.email?.endsWith(".ae")
    ) {
      errors.push("Contact person email must use UAE domain (.ae)");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  /**
   * Validate data types and formats
   */
  validateDataTypes(data) {
    const errors = [];
    // Validate string fields
    const stringFields = [
      "patientId",
      "emiratesId",
      "membershipNumber",
      "providerId",
      "serviceType",
      "clinicalJustification",
    ];
    stringFields.forEach((field) => {
      if (data[field] && typeof data[field] !== "string") {
        errors.push(`Field ${field} must be a string`);
      }
    });
    // Validate array fields
    const arrayFields = ["requestedServices", "documents"];
    arrayFields.forEach((field) => {
      if (data[field] && !Array.isArray(data[field])) {
        errors.push(`Field ${field} must be an array`);
      }
    });
    // Validate number fields
    if (data.requestedDuration && typeof data.requestedDuration !== "number") {
      errors.push("requestedDuration must be a number");
    }
    // Validate boolean fields
    const booleanFields = [
      "digitalSignatures.patientSignature",
      "digitalSignatures.providerSignature",
      "letterOfAppointment.isValid",
      "faceToFaceAssessment.completed",
    ];
    booleanFields.forEach((field) => {
      const fieldPath = field.split(".");
      let value = data;
      for (const path of fieldPath) {
        value = value?.[path];
      }
      if (value !== undefined && typeof value !== "boolean") {
        errors.push(`Field ${field} must be a boolean`);
      }
    });
    // Validate Emirates ID format
    if (data.emiratesId) {
      const emiratesIdPattern = /^784-\d{4}-\d{7}-\d{1}$/;
      if (!emiratesIdPattern.test(data.emiratesId)) {
        errors.push(
          "Emirates ID format is invalid (expected: 784-YYYY-NNNNNNN-N)",
        );
      }
    }
    // Validate email formats
    if (data.contactPersonDetails?.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.contactPersonDetails.email)) {
        errors.push("Contact person email format is invalid");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  /**
   * Validate business rules and logic
   */
  validateBusinessRules(data) {
    const errors = [];
    const warnings = [];
    // Validate service codes
    if (data.requestedServices) {
      data.requestedServices.forEach((service, index) => {
        const validServiceCodes = Object.keys(
          DAMAN_SPECIFIC_CONFIG.homecareStandards2025.serviceCodes,
        );
        if (!validServiceCodes.includes(service.serviceCode)) {
          errors.push(
            `Invalid service code at index ${index}: ${service.serviceCode}`,
          );
        }
        if (service.quantity <= 0) {
          errors.push(
            `Service quantity must be greater than 0 at index ${index}`,
          );
        }
        if (service.unitCost < 0) {
          errors.push(`Service unit cost cannot be negative at index ${index}`);
        }
      });
    }
    // Validate clinical justification length
    if (data.clinicalJustification && data.clinicalJustification.length < 100) {
      errors.push(
        "Clinical justification must be at least 100 characters long",
      );
    }
    // Validate face-to-face assessment timing
    if (data.faceToFaceAssessment?.assessmentDate) {
      const assessmentDate = new Date(data.faceToFaceAssessment.assessmentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (assessmentDate < thirtyDaysAgo) {
        warnings.push(
          "Face-to-face assessment is older than 30 days and may need renewal",
        );
      }
    }
    // Validate document completeness
    if (data.documents) {
      const requiredDocTypes = [
        "assessment-form",
        "care-plan-consent",
        "patient-monitoring-form",
        "service-confirmation",
        "daily-schedule",
      ];
      const providedDocTypes = data.documents.map((doc) => doc.type);
      const missingDocs = requiredDocTypes.filter(
        (type) => !providedDocTypes.includes(type),
      );
      if (missingDocs.length > 0) {
        errors.push(`Missing required documents: ${missingDocs.join(", ")}`);
      }
    }
    // Validate urgency level consistency
    if (data.urgencyLevel === "emergency" && data.requestedDuration > 7) {
      warnings.push(
        "Emergency requests typically have shorter durations (≤7 days)",
      );
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
  /**
   * Validate security compliance requirements
   */
  validateSecurityCompliance(data) {
    const errors = [];
    // Validate data sanitization
    try {
      const sanitizedPatientId = inputSanitizer.sanitizeText(
        data.patientId || "",
        50,
      );
      if (!sanitizedPatientId.isValid) {
        errors.push("Patient ID contains invalid characters");
      }
      const sanitizedClinicalJustification = inputSanitizer.sanitizeText(
        data.clinicalJustification || "",
        2000,
      );
      if (!sanitizedClinicalJustification.isValid) {
        errors.push("Clinical justification contains invalid characters");
      }
    } catch (sanitizationError) {
      errors.push("Data sanitization failed");
    }
    // Validate encryption requirements for sensitive fields
    const sensitiveFields = [
      "emiratesId",
      "membershipNumber",
      "clinicalJustification",
    ];
    sensitiveFields.forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        // Check if field appears to be encrypted (basic check)
        if (
          data[field].length < 10 ||
          /^[a-zA-Z0-9+/=]+$/.test(data[field]) === false
        ) {
          // This is a simplified check - in production, use proper encryption validation
          // For now, we'll just warn about potentially unencrypted sensitive data
        }
      }
    });
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  /**
   * Validate MSC-specific guidelines
   */
  validateMSCGuidelines(data) {
    const errors = [];
    if (data.policyType !== "MSC") {
      return { isValid: true, errors: [] };
    }
    // Validate initial visit notification
    if (data.initialVisitDate && data.atcEffectiveDate) {
      const initialVisit = new Date(data.initialVisitDate);
      const atcEffective = new Date(data.atcEffectiveDate);
      const daysDiff = Math.abs(
        (initialVisit.getTime() - atcEffective.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysDiff > 90) {
        errors.push(
          "Initial visit must be within 90 days of ATC effective date (MSC requirement)",
        );
      }
    }
    // Validate treatment period
    if (data.requestedDuration > 90) {
      errors.push(
        "MSC treatment period cannot exceed 90 days per authorization",
      );
    }
    // Validate monthly billing confirmation
    if (!data.monthlyBillingConfirmed) {
      errors.push("MSC requires monthly billing confirmation");
    }
    // Validate service confirmation with patient signature
    if (!data.serviceConfirmation?.patientSignature) {
      errors.push(
        "MSC requires service confirmation with patient signature in blue pen",
      );
    }
    if (!data.serviceConfirmation?.bluePenUsed) {
      errors.push("MSC requires patient signature in blue pen");
    }
    // Validate daily schedule signature
    if (!data.dailySchedule?.signed) {
      errors.push("MSC requires signed daily schedule by patient/relative");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  /**
   * Validate documentation standards
   */
  validateDocumentationStandards(data) {
    const errors = [];
    // Validate document verification status
    if (data.documents) {
      data.documents.forEach((doc, index) => {
        if (!doc.verified) {
          errors.push(`Document at index ${index} is not verified`);
        }
        if (doc.validUntil) {
          const expiryDate = new Date(doc.validUntil);
          if (expiryDate < new Date()) {
            errors.push(`Document at index ${index} has expired`);
          }
        }
      });
    }
    // Validate assessment documentation
    if (data.faceToFaceAssessment) {
      if (!data.faceToFaceAssessment.assessorLicense) {
        errors.push("Face-to-face assessor license number is required");
      }
      if (
        !data.faceToFaceAssessment.findings ||
        data.faceToFaceAssessment.findings.length < 50
      ) {
        errors.push(
          "Face-to-face assessment findings must be at least 50 characters",
        );
      }
    }
    // Validate periodic assessment requirements
    if (data.periodicAssessment) {
      if (!data.periodicAssessment.nextAssessmentDue) {
        errors.push("Next periodic assessment due date is required");
      } else {
        const nextAssessment = new Date(
          data.periodicAssessment.nextAssessmentDue,
        );
        const maxInterval = new Date();
        maxInterval.setMonth(maxInterval.getMonth() + 3); // 3 months max
        if (nextAssessment > maxInterval) {
          errors.push(
            "Next periodic assessment cannot be more than 3 months away",
          );
        }
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  /**
   * Validate mobile & offline capabilities with ADHICS V2 compliance
   */
  validateMobileOfflineCapabilities(data, errors, warnings) {
    // Mobile-first validation (ADHICS AM 4.1 - Mobile Device Management)
    if (!data.mobileOptimized) {
      warnings.push(
        "Form should be optimized for mobile devices (ADHICS AM 4.1)",
      );
    }
    // Offline capability validation (ADHICS SC 2.1 - Business Continuity)
    if (!data.offlineCapable) {
      warnings.push(
        "Offline submission capability should be enabled (ADHICS SC 2.1)",
      );
    }
    // Mobile document capture validation (ADHICS AM 4.2 - Mobile Security)
    if (data.documents && !data.mobileDocumentCapture) {
      warnings.push(
        "Mobile document capture should be available (ADHICS AM 4.2)",
      );
    }
    // Voice-to-text validation (ADHICS AC 6.2 - User Authentication)
    if (data.clinicalJustification && !data.voiceToTextUsed) {
      warnings.push(
        "Voice-to-text input can improve mobile experience (ADHICS AC 6.2)",
      );
    }
    // Enhanced mobile security validation
    if (data.mobileOptimized && !data.mobileSecurityControls) {
      errors.push(
        "Mobile security controls required for mobile-optimized forms (ADHICS AM 4.3)",
      );
    }
    // Biometric authentication validation for mobile
    if (data.mobileOptimized && !data.biometricAuthSupport) {
      warnings.push(
        "Consider biometric authentication for enhanced mobile security (ADHICS AC 2.4)",
      );
    }
    // Mobile data encryption validation
    if (data.mobileOptimized && !data.mobileDataEncryption) {
      errors.push("Mobile data encryption is mandatory (ADHICS DP 1.5)");
    }
  }
  /**
   * Validate analytics & intelligence features
   */
  validateAnalyticsIntelligence(data, errors, warnings) {
    // Predictive analytics validation
    if (!data.predictiveAnalyticsEnabled) {
      warnings.push(
        "Predictive analytics can improve authorization success rates",
      );
    }
    // Performance monitoring validation
    if (!data.performanceMonitoring) {
      warnings.push("Real-time performance monitoring should be enabled");
    }
    // SLA compliance validation
    if (data.processingTime && data.processingTime > 48) {
      errors.push("Processing time exceeds 48-hour SLA requirement");
    }
  }
  /**
   * Validate training & support integration
   */
  validateTrainingSupport(data, errors, warnings) {
    // Contextual help validation
    if (!data.contextualHelpEnabled) {
      warnings.push("Contextual help should be available for complex fields");
    }
    // Step-by-step guidance validation
    if (!data.stepByStepGuidance) {
      warnings.push("Step-by-step submission guidance improves compliance");
    }
    // Knowledge base integration validation
    if (!data.knowledgeBaseIntegrated) {
      warnings.push("Knowledge base integration enhances user experience");
    }
  }
  /**
   * Validate quality assurance enhancements
   */
  validateQualityAssurance(data, errors, warnings) {
    // Pre-submission validation
    if (!data.preSubmissionValidation) {
      errors.push("Pre-submission quality validation is required");
    }
    // Completeness checking
    if (!data.completenessChecking) {
      errors.push("Automated completeness checking must be enabled");
    }
    // Consistency verification
    if (!data.consistencyVerification) {
      warnings.push("Document consistency verification improves quality");
    }
    // Automated error detection
    if (!data.automatedErrorDetection) {
      errors.push("Automated error detection and correction is required");
    }
  }

  /**
   * Comprehensive Tawteen Compliance Automation Validation
   * Validates CN_13_2025 Tawteen Initiative requirements
   */
  validateTawteenCompliance(data) {
    const errors = [];
    const warnings = [];
    let complianceScore = 0;
    const maxScore = 100;

    const validationDetails = {
      workforceTargets: false,
      tammIntegration: false,
      reportingCompliance: false,
      penaltyAssessment: false,
      networkEligibility: false,
      automationReadiness: false,
    };

    try {
      // 1. Workforce Target Validation (25 points)
      const workforceValidation = this.validateWorkforceTargets(data);
      if (workforceValidation.isValid) {
        validationDetails.workforceTargets = true;
        complianceScore += 25;
      } else {
        errors.push(...workforceValidation.errors);
        warnings.push(...workforceValidation.warnings);
      }

      // 2. TAMM Platform Integration (20 points)
      const tammValidation = this.validateTAMMIntegration(data);
      if (tammValidation.isValid) {
        validationDetails.tammIntegration = true;
        complianceScore += 20;
      } else {
        errors.push(...tammValidation.errors);
      }

      // 3. Reporting Compliance (15 points)
      const reportingValidation = this.validateTawteenReporting(data);
      if (reportingValidation.isValid) {
        validationDetails.reportingCompliance = true;
        complianceScore += 15;
      } else {
        errors.push(...reportingValidation.errors);
      }

      // 4. Penalty Assessment (15 points)
      const penaltyValidation = this.validatePenaltyCompliance(data);
      if (penaltyValidation.isValid) {
        validationDetails.penaltyAssessment = true;
        complianceScore += 15;
      } else {
        warnings.push(...penaltyValidation.warnings);
      }

      // 5. Network Eligibility (15 points)
      const networkValidation = this.validateNetworkEligibility(data);
      if (networkValidation.isValid) {
        validationDetails.networkEligibility = true;
        complianceScore += 15;
      } else {
        errors.push(...networkValidation.errors);
      }

      // 6. Automation Readiness (10 points)
      const automationValidation = this.validateTawteenAutomation(data);
      if (automationValidation.isValid) {
        validationDetails.automationReadiness = true;
        complianceScore += 10;
      } else {
        warnings.push(...automationValidation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        complianceScore: Math.min(complianceScore, maxScore),
        validationDetails,
        tawteenPhase: this.determineTawteenPhase(complianceScore, errors),
        networkEligibility: this.assessNetworkEligibility(data, errors),
        penaltyRisk: this.assessPenaltyRisk(data, errors),
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Tawteen validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings: [],
        complianceScore: 0,
        validationDetails,
        tawteenPhase: "Non-Compliant",
        networkEligibility: "Excluded",
        penaltyRisk: "High",
      };
    }
  }

  /**
   * Validate workforce targets based on CN_13_2025 requirements
   */
  validateWorkforceTargets(data) {
    const errors = [];
    const warnings = [];

    if (!data.facilityType) {
      errors.push("Facility type must be specified for Tawteen compliance");
    }

    if (
      !data.region ||
      !["Abu Dhabi", "Al Ain", "Al Dhafra"].includes(data.region)
    ) {
      errors.push(
        "Valid region (Abu Dhabi, Al Ain, Al Dhafra) must be specified",
      );
    }

    if (
      !data.networkType ||
      !["Thiqa", "Basic", "Non-Network"].includes(data.networkType)
    ) {
      errors.push("Network type (Thiqa, Basic, Non-Network) must be specified");
    }

    if (!data.totalLicensedStaff || data.totalLicensedStaff < 1) {
      errors.push("Total licensed staff count is required");
    }

    if (!data.totalNationalStaff || data.totalNationalStaff < 0) {
      errors.push("Total UAE national staff count is required");
    }

    // Region-specific validation
    if (data.region === "Al Ain" && data.networkType === "Thiqa") {
      const requiredNationals = this.calculateAlAinThiqaRequirement(
        data.totalLicensedStaff,
      );
      if (data.totalNationalStaff < requiredNationals) {
        errors.push(
          `Al Ain Thiqa network requires ${requiredNationals} UAE nationals for ${data.totalLicensedStaff} licensed staff`,
        );
      }
    } else {
      const requiredNationals = this.calculateStandardTawteenRequirement(data);
      if (data.totalNationalStaff < requiredNationals) {
        errors.push(
          `Facility requires ${requiredNationals} UAE nationals for compliance`,
        );
      }
    }

    // Workforce composition validation
    if (data.healthcareStaff && data.administrativeStaff) {
      const totalStaff =
        data.healthcareStaff.total + data.administrativeStaff.total;
      if (Math.abs(totalStaff - data.totalLicensedStaff) > 5) {
        warnings.push(
          "Workforce breakdown does not match total licensed staff count",
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate Al Ain Thiqa network requirements
   */
  calculateAlAinThiqaRequirement(totalStaff) {
    if (totalStaff <= 50) return 1;
    if (totalStaff <= 100) return 2;
    if (totalStaff <= 150) return 3;
    return Math.ceil(totalStaff / 50); // 2 per 100 or part thereof
  }

  /**
   * Calculate standard Tawteen requirements
   */
  calculateStandardTawteenRequirement(data) {
    const { facilityType, totalLicensedStaff } = data;

    if (facilityType === "IVF Centers" || facilityType === "Pharmacies") {
      return totalLicensedStaff >= 10 ? 1 : 0;
    }

    if (facilityType === "School Clinics") {
      return totalLicensedStaff >= 5 ? 1 : 0;
    }

    // General facilities
    if (totalLicensedStaff >= 20 && totalLicensedStaff <= 100) return 1;
    if (totalLicensedStaff >= 101 && totalLicensedStaff <= 200) return 2;
    if (totalLicensedStaff >= 201) return Math.ceil(totalLicensedStaff / 100);

    return 0;
  }

  /**
   * Validate TAMM platform integration
   */
  validateTAMMIntegration(data) {
    const errors = [];

    if (!data.tammIntegration) {
      errors.push(
        "TAMM platform integration is mandatory for Tawteen compliance",
      );
      return { isValid: false, errors };
    }

    if (!data.tammIntegration.connected) {
      errors.push("TAMM platform connection must be established");
    }

    if (!data.tammIntegration.lastSync) {
      errors.push("TAMM platform synchronization is required");
    } else {
      const lastSync = new Date(data.tammIntegration.lastSync);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (lastSync < thirtyDaysAgo) {
        errors.push("TAMM platform data must be synchronized within 30 days");
      }
    }

    if (
      !data.tammIntegration.dataAccuracy ||
      data.tammIntegration.dataAccuracy < 95
    ) {
      errors.push("TAMM platform data accuracy must be at least 95%");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Tawteen reporting compliance
   */
  validateTawteenReporting(data) {
    const errors = [];

    if (!data.reportingPeriod) {
      errors.push("Reporting period must be specified");
    }

    if (!data.monthlyReportSubmitted) {
      errors.push("Monthly workforce reports must be submitted");
    }

    if (!data.quarterlyReviewCompleted) {
      errors.push("Quarterly compliance reviews must be completed");
    }

    if (!data.annualAssessmentScheduled) {
      errors.push("Annual Tawteen assessment must be scheduled");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate penalty compliance status
   */
  validatePenaltyCompliance(data) {
    const warnings = [];

    if (data.penalties && data.penalties.financial > 0) {
      warnings.push(
        `Outstanding financial penalties: AED ${data.penalties.financial.toLocaleString()}`,
      );
    }

    if (data.penalties && data.penalties.networkExclusion) {
      warnings.push("Network exclusion penalty is active");
    }

    if (data.previousViolations && data.previousViolations.length > 0) {
      warnings.push(
        `${data.previousViolations.length} previous Tawteen violations on record`,
      );
    }

    return {
      isValid: true,
      warnings,
    };
  }

  /**
   * Validate network eligibility
   */
  validateNetworkEligibility(data) {
    const errors = [];

    if (!data.networkType) {
      errors.push("Network type must be specified for eligibility assessment");
    }

    if (data.networkType === "Thiqa" || data.networkType === "Basic") {
      if (!data.networkCertification || !data.networkCertification.valid) {
        errors.push(`${data.networkType} network certification is required`);
      }

      if (data.networkCertification && data.networkCertification.expiryDate) {
        const expiryDate = new Date(data.networkCertification.expiryDate);
        if (expiryDate < new Date()) {
          errors.push(`${data.networkType} network certification has expired`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Tawteen automation readiness
   */
  validateTawteenAutomation(data) {
    const warnings = [];

    if (!data.automatedReporting) {
      warnings.push("Automated reporting system should be implemented");
    }

    if (!data.realTimeMonitoring) {
      warnings.push("Real-time workforce monitoring should be enabled");
    }

    if (!data.alertSystem) {
      warnings.push("Compliance alert system should be configured");
    }

    if (!data.dashboardIntegration) {
      warnings.push("Management dashboard integration recommended");
    }

    return {
      isValid: true,
      warnings,
    };
  }

  /**
   * Determine Tawteen compliance phase
   */
  determineTawteenPhase(score, errors) {
    const criticalErrors = errors.filter(
      (error) =>
        error.includes("required") ||
        error.includes("mandatory") ||
        error.includes("must"),
    ).length;

    if (criticalErrors > 0) return "Non-Compliant";
    if (score >= 90) return "Phase 2";
    if (score >= 70) return "Phase 1";
    return "Non-Compliant";
  }

  /**
   * Assess network eligibility status
   */
  assessNetworkEligibility(data, errors) {
    const networkErrors = errors.filter(
      (error) => error.includes("network") || error.includes("certification"),
    ).length;

    if (networkErrors > 0) return "Excluded";
    if (data.networkType === "Thiqa") return "Thiqa Eligible";
    if (data.networkType === "Basic") return "Basic Eligible";
    return "Non-Network";
  }

  /**
   * Assess penalty risk level
   */
  assessPenaltyRisk(data, errors) {
    const criticalErrors = errors.filter(
      (error) =>
        error.includes("UAE nationals") ||
        error.includes("workforce") ||
        error.includes("TAMM"),
    ).length;

    if (criticalErrors >= 3) return "Critical";
    if (criticalErrors >= 2) return "High";
    if (criticalErrors >= 1) return "Medium";
    return "Low";
  }
  /**
   * Generate enhanced compliance report with 2025 standards
   */
  generateComplianceReport(validationResult) {
    const { complianceScore, errors, warnings } = validationResult;
    const criticalIssues = errors.filter(
      (error) =>
        error.includes("required") ||
        error.includes("missing") ||
        error.includes("invalid"),
    );
    let complianceLevel;
    if (complianceScore >= 95) complianceLevel = "excellent";
    else if (complianceScore >= 85) complianceLevel = "good";
    else if (complianceScore >= 75) complianceLevel = "acceptable";
    else complianceLevel = "needs-improvement";
    const recommendations = [];
    if (errors.length > 0) {
      recommendations.push(
        "Address all validation errors before resubmitting authorization",
      );
    }
    if (warnings.length > 0) {
      recommendations.push(
        "Review and address warnings to improve compliance score",
      );
    }
    if (complianceScore < 90) {
      recommendations.push(
        "Consider additional documentation to improve compliance score",
      );
    }
    const summary = `Compliance validation completed with a score of ${complianceScore}/100. ${errors.length} errors and ${warnings.length} warnings identified. Compliance level: ${complianceLevel}.`;
    // Enhanced recommendations for 2025 standards
    const enhancementAreas = {
      mobileOffline: [
        "Implement mobile-first form design",
        "Enable offline submission capabilities",
        "Add mobile document capture with validation",
        "Integrate voice-to-text for clinical justification",
      ],
      analyticsIntelligence: [
        "Deploy predictive analytics for authorization success",
        "Implement real-time performance monitoring",
        "Add SLA monitoring and alerting",
        "Enable capacity planning analytics",
      ],
      trainingSupport: [
        "Add contextual help for Daman requirements",
        "Implement step-by-step submission guidance",
        "Integrate searchable compliance documentation",
        "Enable update notification system",
      ],
      qualityAssurance: [
        "Implement pre-submission quality validation",
        "Add automated completeness checking",
        "Enable consistency verification across documents",
        "Deploy automated error detection and correction",
      ],
    };
    return {
      summary,
      recommendations,
      criticalIssues,
      complianceLevel,
      enhancementAreas,
    };
  }
}
export const damanComplianceValidator =
  DamanComplianceValidatorService.getInstance();
export default DamanComplianceValidatorService;
