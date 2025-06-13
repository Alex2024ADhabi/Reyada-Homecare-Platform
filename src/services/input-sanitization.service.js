/**
 * Input Sanitization Service
 * Comprehensive XSS prevention and input validation
 */
import DOMPurify from "dompurify";
import React from "react";
class InputSanitizationService {
    constructor() {
        Object.defineProperty(this, "defaultOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                allowedTags: ["b", "i", "em", "strong", "p", "br"],
                allowedAttributes: [],
                stripTags: true,
                escapeHtml: true,
                maxLength: 10000,
                allowedProtocols: ["http", "https", "mailto"],
            }
        });
        this.configureDOMPurify();
    }
    static getInstance() {
        if (!InputSanitizationService.instance) {
            InputSanitizationService.instance = new InputSanitizationService();
        }
        return InputSanitizationService.instance;
    }
    configureDOMPurify() {
        // Configure DOMPurify with secure defaults
        DOMPurify.setConfig({
            ALLOWED_TAGS: this.defaultOptions.allowedTags,
            ALLOWED_ATTR: this.defaultOptions.allowedAttributes,
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            FORBID_TAGS: [
                "script",
                "object",
                "embed",
                "form",
                "input",
                "textarea",
                "select",
                "button",
            ],
            FORBID_ATTR: [
                "onerror",
                "onload",
                "onclick",
                "onmouseover",
                "onfocus",
                "onblur",
                "onchange",
                "onsubmit",
            ],
            USE_PROFILES: { html: true },
        });
    }
    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    sanitizeHtml(input, options) {
        const opts = { ...this.defaultOptions, ...options };
        const errors = [];
        const warnings = [];
        const originalLength = input.length;
        try {
            // Check input length
            if (opts.maxLength && input.length > opts.maxLength) {
                errors.push(`Input exceeds maximum length of ${opts.maxLength} characters`);
                input = input.substring(0, opts.maxLength);
                warnings.push("Input was truncated to maximum allowed length");
            }
            // Detect potential XSS patterns
            const xssPatterns = [
                /<script[^>]*>.*?<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /<iframe[^>]*>/gi,
                /<object[^>]*>/gi,
                /<embed[^>]*>/gi,
                /data:text\/html/gi,
            ];
            xssPatterns.forEach((pattern) => {
                if (pattern.test(input)) {
                    warnings.push("Potentially malicious content detected and removed");
                }
            });
            // Sanitize with DOMPurify
            let sanitized = DOMPurify.sanitize(input, {
                ALLOWED_TAGS: opts.allowedTags,
                ALLOWED_ATTR: opts.allowedAttributes,
                STRIP_TAGS: opts.stripTags,
            });
            // Additional HTML escaping if requested
            if (opts.escapeHtml) {
                sanitized = this.escapeHtml(sanitized);
            }
            return {
                sanitized,
                isValid: errors.length === 0,
                errors,
                warnings,
                originalLength,
                sanitizedLength: sanitized.length,
            };
        }
        catch (error) {
            errors.push(`Sanitization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                sanitized: "",
                isValid: false,
                errors,
                warnings,
                originalLength,
                sanitizedLength: 0,
            };
        }
    }
    /**
     * Sanitize plain text input
     */
    sanitizeText(input, maxLength) {
        const errors = [];
        const warnings = [];
        const originalLength = input.length;
        try {
            let sanitized = input;
            // Remove null bytes and control characters
            sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
            // Normalize whitespace
            sanitized = sanitized.replace(/\s+/g, " ").trim();
            // Check length
            if (maxLength && sanitized.length > maxLength) {
                sanitized = sanitized.substring(0, maxLength);
                warnings.push(`Text truncated to ${maxLength} characters`);
            }
            // Detect suspicious patterns
            const suspiciousPatterns = [/javascript:/gi, /<[^>]*>/g, /&[a-zA-Z]+;/g];
            suspiciousPatterns.forEach((pattern) => {
                if (pattern.test(sanitized)) {
                    warnings.push("Suspicious content detected");
                }
            });
            return {
                sanitized,
                isValid: errors.length === 0,
                errors,
                warnings,
                originalLength,
                sanitizedLength: sanitized.length,
            };
        }
        catch (error) {
            errors.push(`Text sanitization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                sanitized: "",
                isValid: false,
                errors,
                warnings,
                originalLength,
                sanitizedLength: 0,
            };
        }
    }
    /**
     * Validate and sanitize form data
     */
    validateFormData(data, rules) {
        const sanitizedData = {};
        const errors = {};
        const warnings = {};
        let isValid = true;
        Object.keys(data).forEach((key) => {
            const value = data[key];
            const fieldRules = rules[key] || [];
            const fieldErrors = [];
            const fieldWarnings = [];
            // Sanitize the value first
            let sanitizedValue = value;
            if (typeof value === "string") {
                const sanitizationResult = this.sanitizeText(value, 1000);
                sanitizedValue = sanitizationResult.sanitized;
                fieldWarnings.push(...sanitizationResult.warnings);
                fieldErrors.push(...sanitizationResult.errors);
            }
            // Apply validation rules
            fieldRules.forEach((rule) => {
                switch (rule.type) {
                    case "required":
                        if (!sanitizedValue ||
                            (typeof sanitizedValue === "string" &&
                                sanitizedValue.trim() === "")) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "email":
                        if (sanitizedValue && !this.isValidEmail(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "phone":
                        if (sanitizedValue && !this.isValidPhone(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "url":
                        if (sanitizedValue && !this.isValidUrl(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "pattern":
                        if (sanitizedValue &&
                            rule.value &&
                            !new RegExp(rule.value).test(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "length":
                        if (sanitizedValue && typeof sanitizedValue === "string") {
                            const length = sanitizedValue.length;
                            if (rule.value.min && length < rule.value.min) {
                                fieldErrors.push(rule.message);
                            }
                            if (rule.value.max && length > rule.value.max) {
                                fieldErrors.push(rule.message);
                            }
                        }
                        break;
                    case "custom":
                        if (rule.validator && !rule.validator(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "serviceCode":
                        if (sanitizedValue && !this.isValidServiceCode(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "doh2025Compliance":
                        if (sanitizedValue) {
                            const dohValidation = this.validateDOH2025Requirements(sanitizedValue);
                            if (!dohValidation.isValid) {
                                fieldErrors.push(...dohValidation.errors);
                                fieldWarnings.push(...dohValidation.warnings);
                            }
                        }
                        break;
                    case "serviceCodePricing":
                        if (sanitizedValue && rule.value) {
                            const pricingValidation = this.validateServiceCodePricing(sanitizedValue, rule.value.price);
                            if (!pricingValidation.isValid) {
                                fieldErrors.push(pricingValidation.error || rule.message);
                            }
                        }
                        break;
                    case "enhancedXSSPrevention":
                        if (sanitizedValue) {
                            const sanitizedData = this.sanitizeNewDataFields({
                                [key]: sanitizedValue,
                            });
                            sanitizedValue = sanitizedData[key];
                        }
                        break;
                    case "mscCompliance":
                        if (sanitizedValue && !this.isMSCCompliant(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "submissionDeadline":
                        if (sanitizedValue && !this.isWithinSubmissionDeadline()) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "wheelchairPreApproval":
                        if (sanitizedValue &&
                            !this.isWheelchairPreApprovalValid(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                    case "faceToFaceAssessment":
                        if (sanitizedValue &&
                            !this.isFaceToFaceAssessmentValid(sanitizedValue)) {
                            fieldErrors.push(rule.message);
                        }
                        break;
                }
            });
            sanitizedData[key] = sanitizedValue;
            if (fieldErrors.length > 0) {
                errors[key] = fieldErrors;
                isValid = false;
            }
            if (fieldWarnings.length > 0) {
                warnings[key] = fieldWarnings;
            }
        });
        return {
            sanitizedData,
            isValid,
            errors,
            warnings,
        };
    }
    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate phone number format (UAE format)
     */
    isValidPhone(phone) {
        const phoneRegex = /^(\+971|00971|971)?[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ""));
    }
    /**
     * Validate URL format
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return ["http:", "https:"].includes(urlObj.protocol);
        }
        catch {
            return false;
        }
    }
    /**
     * Enhanced validation rules for DOH 2025 requirements
     */
    validateDOH2025Requirements(data) {
        const errors = [];
        const warnings = [];
        // MSC Plan Extension validation
        if (data.mscPlanExtension) {
            const mscDeadline = new Date("2025-05-14");
            const currentDate = new Date();
            if (currentDate > mscDeadline) {
                errors.push("MSC plan extension deadline exceeded (May 14, 2025)");
            }
            if (data.requestedDuration > 90) {
                errors.push("MSC plan extension cannot exceed 90 days duration");
            }
        }
        // Wheelchair pre-approval validation
        if (data.wheelchairRequest) {
            const wheelchairEffectiveDate = new Date("2025-05-01");
            const currentDate = new Date();
            if (currentDate >= wheelchairEffectiveDate) {
                if (!data.documents?.includes("Wheelchair Pre-approval Form")) {
                    errors.push("Wheelchair pre-approval form is mandatory from May 1, 2025");
                }
                if (data.documents?.includes("PT Form") ||
                    data.documents?.includes("Physiotherapy Form")) {
                    errors.push("PT/Physiotherapy forms are no longer accepted for wheelchair requests");
                }
            }
        }
        // Face-to-face assessment validation
        if (data.homecareAllocation) {
            const faceToFaceEffectiveDate = new Date("2025-02-24");
            const currentDate = new Date();
            if (currentDate >= faceToFaceEffectiveDate) {
                if (!data.documents?.includes("Face-to-Face Assessment (OpenJet)")) {
                    errors.push("Face-to-face assessment through OpenJet is mandatory from February 24, 2025");
                }
                if (!data.openJetIntegration) {
                    errors.push("OpenJet system integration is required");
                }
            }
        }
        // Daily submission deadline validation
        const uaeTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dubai",
        });
        const currentUAETime = new Date(uaeTime);
        const submissionDeadline = new Date(uaeTime);
        submissionDeadline.setHours(8, 0, 0, 0);
        if (currentUAETime > submissionDeadline &&
            currentUAETime.getDate() === submissionDeadline.getDate()) {
            const hoursLate = Math.floor((currentUAETime.getTime() - submissionDeadline.getTime()) /
                (1000 * 60 * 60));
            if (hoursLate >= 4) {
                errors.push(`Critical submission delay: ${hoursLate} hours after 8:00 AM deadline`);
            }
            else {
                warnings.push(`Late submission: ${hoursLate} hours after 8:00 AM deadline`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Enhanced XSS prevention for new data fields
     */
    sanitizeNewDataFields(data) {
        const sensitiveFields = [
            "clinicalJustification",
            "faceToFaceAssessment",
            "periodicAssessment",
            "wheelchairApprovalData",
            "mscPlanDetails",
            "providerNotes",
            "patientComments",
            "serviceDescription",
            "treatmentPlan",
        ];
        const sanitizedData = { ...data };
        sensitiveFields.forEach((field) => {
            if (sanitizedData[field] && typeof sanitizedData[field] === "string") {
                // Enhanced XSS prevention
                sanitizedData[field] = this.sanitizeHtml(sanitizedData[field], {
                    allowedTags: [], // No HTML tags allowed in clinical data
                    stripTags: true,
                    escapeHtml: true,
                    maxLength: 5000,
                }).sanitized;
            }
        });
        return sanitizedData;
    }
    /**
     * Validate service code format (DOH 2025 standards) with enhanced logic
     */
    isValidServiceCode(serviceCode) {
        const validCodes = ["17-25-1", "17-25-2", "17-25-3", "17-25-4", "17-25-5"];
        const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];
        if (deprecatedCodes.includes(serviceCode)) {
            return false; // Deprecated codes are invalid
        }
        return validCodes.includes(serviceCode);
    }
    /**
     * Validate new service codes and pricing
     */
    validateServiceCodePricing(serviceCode, price) {
        const servicePricing = {
            "17-25-1": 300, // Simple Home Visit - Nursing Service
            "17-25-2": 300, // Simple Home Visit - Supportive Service
            "17-25-3": 800, // Specialized Home Visit - Consultation
            "17-25-4": 900, // Routine Home Nursing Care
            "17-25-5": 1800, // Advanced Home Nursing Care
        };
        const expectedPrice = servicePricing[serviceCode];
        if (!expectedPrice) {
            return {
                isValid: false,
                error: `Unknown service code: ${serviceCode}`,
            };
        }
        if (price !== expectedPrice) {
            return {
                isValid: false,
                error: `Incorrect pricing for ${serviceCode}. Expected: ${expectedPrice} AED, Found: ${price} AED`,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate MSC compliance requirements
     */
    isMSCCompliant(data) {
        const mscDeadline = new Date("2025-05-14");
        const currentDate = new Date();
        // Check MSC plan extension deadline
        if (data.mscPlanExtension && currentDate > mscDeadline) {
            return false;
        }
        // Check 90-day duration limit
        if (data.requestedDuration && data.requestedDuration > 90) {
            return false;
        }
        // Check payment terms (30 days for CN_2025)
        if (data.paymentTerms && data.paymentTerms !== "30_days") {
            return false;
        }
        return true;
    }
    /**
     * Validate submission deadline (8:00 AM UAE time)
     */
    isWithinSubmissionDeadline() {
        const uaeTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dubai",
        });
        const currentTime = new Date(uaeTime);
        const deadline = new Date(uaeTime);
        deadline.setHours(8, 0, 0, 0);
        // Allow submissions before 8:00 AM or if it's a different day
        return (currentTime <= deadline || currentTime.getDate() !== deadline.getDate());
    }
    /**
     * Validate wheelchair pre-approval requirements
     */
    isWheelchairPreApprovalValid(data) {
        const effectiveDate = new Date("2025-05-01");
        const currentDate = new Date();
        if (data.wheelchairRequest && currentDate >= effectiveDate) {
            // Check for required pre-approval form
            if (!data.documents?.includes("Wheelchair Pre-approval Form")) {
                return false;
            }
            // Check for deprecated PT forms
            const deprecatedForms = [
                "PT Form",
                "Physiotherapy Form",
                "Physical Therapy Assessment",
            ];
            if (data.documents?.some((doc) => deprecatedForms.includes(doc))) {
                return false;
            }
        }
        return true;
    }
    /**
     * Validate face-to-face assessment requirements
     */
    isFaceToFaceAssessmentValid(data) {
        const effectiveDate = new Date("2025-02-24");
        const currentDate = new Date();
        if (data.homecareAllocation && currentDate >= effectiveDate) {
            // Check for OpenJet face-to-face assessment
            if (!data.documents?.includes("Face-to-Face Assessment (OpenJet)")) {
                return false;
            }
            // Check for OpenJet integration
            if (!data.openJetIntegration) {
                return false;
            }
        }
        return true;
    }
    /**
     * Generate Content Security Policy header
     */
    generateCSPHeader() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' https:",
            "connect-src 'self' https:",
            "media-src 'self'",
            "object-src 'none'",
            "frame-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join("; ");
    }
}
// React Hook for Input Sanitization
export const useInputSanitization = () => {
    const sanitizer = InputSanitizationService.getInstance();
    const sanitizeHtml = React.useCallback((input, options) => {
        return sanitizer.sanitizeHtml(input, options);
    }, [sanitizer]);
    const sanitizeText = React.useCallback((input, maxLength) => {
        return sanitizer.sanitizeText(input, maxLength);
    }, [sanitizer]);
    const validateForm = React.useCallback((data, rules) => {
        return sanitizer.validateFormData(data, rules);
    }, [sanitizer]);
    return {
        sanitizeHtml,
        sanitizeText,
        validateForm,
    };
};
export const inputSanitizer = InputSanitizationService.getInstance();
export default InputSanitizationService;
