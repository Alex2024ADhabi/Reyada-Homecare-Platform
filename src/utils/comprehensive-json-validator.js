// Comprehensive JSON Validator with Enhanced Error Handling and Recovery
// Addresses systematic JSON/JSX validation issues across the platform
export class ComprehensiveJsonValidator {
    /**
     * Comprehensive JSON validation with automatic error recovery
     */
    static validateAndFix(jsonData, options = {
        autoFix: true,
        preserveStructure: true,
        sanitizeStrings: true,
        validateDates: true,
    }) {
        const startTime = Date.now();
        const errors = [];
        const warnings = [];
        let fixedJson;
        try {
            // Step 1: Basic validation
            const basicValidation = this.performBasicValidation(jsonData);
            errors.push(...basicValidation.errors);
            warnings.push(...basicValidation.warnings);
            if (!basicValidation.isValid && !options.autoFix) {
                return this.createResult(false, errors, warnings, undefined, jsonData);
            }
            // Step 2: Structure validation
            const structureValidation = this.validateStructure(jsonData, options);
            errors.push(...structureValidation.errors);
            warnings.push(...structureValidation.warnings);
            // Step 3: Content validation
            const contentValidation = this.validateContent(jsonData, options);
            errors.push(...contentValidation.errors);
            warnings.push(...contentValidation.warnings);
            // Step 4: Auto-fix if enabled and errors found
            if (options.autoFix && (errors.length > 0 || warnings.length > 0)) {
                const fixResult = this.attemptAutoFix(jsonData, options);
                if (fixResult.success) {
                    fixedJson = fixResult.fixedJson;
                    warnings.push("JSON automatically fixed");
                }
                else {
                    errors.push("Auto-fix failed: " + fixResult.error);
                }
            }
            const isValid = errors.length === 0;
            return this.createResult(isValid, errors, warnings, fixedJson, jsonData);
        }
        catch (error) {
            errors.push(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return this.createResult(false, errors, warnings, undefined, jsonData);
        }
    }
    /**
     * Safe JSON stringify with enhanced circular reference handling and error recovery
     */
    static safeStringify(data, space) {
        const seen = new WeakSet();
        let circularCount = 0;
        try {
            return JSON.stringify(data, (key, value) => {
                // Handle circular references with enhanced tracking
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        circularCount++;
                        return `[Circular Reference #${circularCount}]`;
                    }
                    seen.add(value);
                }
                // Enhanced special value handling
                if (value === undefined)
                    return null;
                if (typeof value === "function")
                    return `[Function: ${value.name || "anonymous"}]`;
                if (typeof value === "symbol")
                    return `[Symbol: ${value.toString()}]`;
                if (value instanceof Date) {
                    // Validate date before converting
                    return isNaN(value.getTime())
                        ? "[Invalid Date]"
                        : value.toISOString();
                }
                if (value instanceof RegExp)
                    return `[RegExp: ${value.toString()}]`;
                if (value instanceof Error) {
                    return {
                        _errorType: value.constructor.name,
                        message: value.message,
                        stack: value.stack?.split("\n").slice(0, 3).join("\n"), // Limit stack trace
                    };
                }
                // Handle BigInt
                if (typeof value === "bigint")
                    return `[BigInt: ${value.toString()}]`;
                // Handle NaN and Infinity
                if (typeof value === "number") {
                    if (isNaN(value))
                        return null;
                    if (!isFinite(value))
                        return null;
                }
                return value;
            }, space);
        }
        catch (error) {
            // Simplified fallback to avoid complex serialization
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return `{"_error":"JSON serialization failed","_message":"${errorMessage.replace(/"/g, "'")}","_timestamp":"${new Date().toISOString()}"}`;
        }
    }
    /**
     * Safe JSON parse with enhanced error recovery and validation
     */
    static safeParse(jsonString) {
        const warnings = [];
        const fixedIssues = [];
        if (typeof jsonString !== "string") {
            return {
                success: false,
                error: "Input is not a string - received: " + typeof jsonString,
                warnings,
                fixedIssues,
            };
        }
        if (jsonString.trim() === "") {
            return {
                success: false,
                error: "Input is empty string",
                warnings,
                fixedIssues,
            };
        }
        try {
            const data = JSON.parse(jsonString);
            return { success: true, data, warnings, fixedIssues };
        }
        catch (error) {
            const originalError = error instanceof Error ? error.message : "Unknown error";
            // Attempt to fix common JSON issues with detailed tracking
            const fixResult = this.fixCommonJsonIssuesEnhanced(jsonString);
            if (fixResult.fixedIssues.length > 0) {
                fixedIssues.push(...fixResult.fixedIssues);
                warnings.push("JSON was automatically repaired");
            }
            try {
                const data = JSON.parse(fixResult.fixedString);
                return {
                    success: true,
                    data,
                    warnings: [
                        ...warnings,
                        "Original JSON had issues but was successfully repaired",
                    ],
                    fixedIssues,
                };
            }
            catch (secondError) {
                const secondErrorMsg = secondError instanceof Error ? secondError.message : "Unknown error";
                // Try one more aggressive fix
                const aggressiveFixResult = this.aggressiveJsonFix(jsonString);
                if (aggressiveFixResult.success) {
                    return {
                        success: true,
                        data: aggressiveFixResult.data,
                        warnings: [...warnings, "JSON required aggressive repair"],
                        fixedIssues: [...fixedIssues, ...aggressiveFixResult.fixedIssues],
                    };
                }
                return {
                    success: false,
                    error: `Parse failed after repair attempts. Original: ${originalError}. After repair: ${secondErrorMsg}`,
                    warnings,
                    fixedIssues,
                };
            }
        }
    }
    /**
     * Validate complaint-specific data structure with enhanced Tasneef audit requirements
     */
    static validateComplaintData(complaintData) {
        const errors = [];
        const warnings = [];
        try {
            // Enhanced required fields validation for Tasneef audit
            const requiredFields = [
                "complaint_id",
                "complaint_type",
                "patient_id",
                "patient_name",
                "complaint_date",
                "complaint_time",
                "description",
                "received_by",
                "received_date",
                "severity",
                "priority",
                "status",
            ];
            requiredFields.forEach((field) => {
                if (!complaintData[field] ||
                    (typeof complaintData[field] === "string" &&
                        complaintData[field].trim() === "")) {
                    errors.push(`Missing required field for Tasneef audit: ${field}`);
                }
            });
            // Enhanced data type validation
            if (complaintData.complaint_date &&
                !this.isValidDate(complaintData.complaint_date)) {
                errors.push("Invalid complaint_date format - must be valid ISO date");
            }
            if (complaintData.received_date &&
                !this.isValidDate(complaintData.received_date)) {
                errors.push("Invalid received_date format - must be valid ISO date");
            }
            // Enhanced severity validation
            if (complaintData.severity &&
                !["low", "medium", "high", "critical"].includes(complaintData.severity)) {
                errors.push("Invalid severity value - must be low, medium, high, or critical");
            }
            // Enhanced priority validation
            if (complaintData.priority &&
                !["routine", "urgent", "immediate"].includes(complaintData.priority)) {
                errors.push("Invalid priority value - must be routine, urgent, or immediate");
            }
            // Enhanced status validation
            if (complaintData.status &&
                ![
                    "received",
                    "acknowledged",
                    "investigating",
                    "resolved",
                    "closed",
                ].includes(complaintData.status)) {
                errors.push("Invalid status value - must be received, acknowledged, investigating, resolved, or closed");
            }
            // Enhanced complaint type validation
            const validComplaintTypes = [
                "service_quality",
                "staff_behavior",
                "billing_issues",
                "appointment_scheduling",
                "communication",
                "facility_issues",
                "treatment_concerns",
                "privacy_breach",
                "accessibility",
                "other",
            ];
            if (complaintData.complaint_type &&
                !validComplaintTypes.includes(complaintData.complaint_type)) {
                errors.push(`Invalid complaint_type - must be one of: ${validComplaintTypes.join(", ")}`);
            }
            // Enhanced Daman compliance validation
            if (complaintData.patient_contact) {
                if (!complaintData.patient_contact.phone &&
                    !complaintData.patient_contact.email) {
                    errors.push("Patient contact information incomplete - phone or email required for Tasneef audit");
                }
                // UAE phone number validation
                if (complaintData.patient_contact.phone &&
                    !/^\+971[0-9]{8,9}$/.test(complaintData.patient_contact.phone)) {
                    warnings.push("Phone number should follow UAE format (+971XXXXXXXXX)");
                }
                // Email format validation
                if (complaintData.patient_contact.email &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complaintData.patient_contact.email)) {
                    errors.push("Invalid email format");
                }
            }
            else {
                errors.push("Patient contact information is required for Tasneef audit compliance");
            }
            // Description quality validation
            if (complaintData.description && complaintData.description.length < 20) {
                warnings.push("Complaint description should be at least 20 characters for proper documentation");
            }
            // SLA tracking validation
            if (complaintData.sla_tracking) {
                if (!complaintData.sla_tracking.acknowledgment_sla ||
                    !complaintData.sla_tracking.resolution_sla) {
                    errors.push("SLA tracking requirements missing - acknowledgment and resolution SLA required");
                }
            }
            // Escalation validation for critical complaints
            if (complaintData.severity === "critical" &&
                complaintData.priority !== "immediate") {
                errors.push("Critical complaints must have immediate priority per Tasneef audit requirements");
            }
            // Timeline compliance validation
            if (complaintData.daman_timeline_compliance) {
                const timelineValidation = this.validateDamanTimelineData(complaintData.daman_timeline_compliance);
                if (!timelineValidation.isValid) {
                    errors.push(...timelineValidation.errors.map((err) => `Timeline compliance: ${err}`));
                    warnings.push(...timelineValidation.warnings.map((warn) => `Timeline compliance: ${warn}`));
                }
            }
            const isValid = errors.length === 0;
            return this.createResult(isValid, errors, warnings, undefined, complaintData);
        }
        catch (error) {
            errors.push(`Complaint validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return this.createResult(false, errors, warnings, undefined, complaintData);
        }
    }
    /**
     * Validate Daman timeline compliance data with enhanced Tasneef audit requirements
     */
    static validateDamanTimelineData(timelineData) {
        const errors = [];
        const warnings = [];
        try {
            // Enhanced timeline-specific validation based on Tasneef audit requirements
            if (timelineData.submission_type &&
                ![
                    "initial",
                    "renewal",
                    "extension",
                    "revision",
                    "acute_care_notification",
                ].includes(timelineData.submission_type)) {
                errors.push("Invalid submission_type - must be initial, renewal, extension, revision, or acute_care_notification");
            }
            if (timelineData.submission_deadline &&
                !this.isValidDate(timelineData.submission_deadline)) {
                errors.push("Invalid submission_deadline format - must be valid ISO date");
            }
            // Critical: Backdated requests validation
            if (timelineData.backdated_request === true) {
                errors.push("CRITICAL: Backdated requests are strictly prohibited per Daman SPC guidelines and Tasneef audit requirements");
            }
            // Enhanced extension timeline validation (7-day rule)
            if (timelineData.submission_type === "extension" &&
                timelineData.days_remaining > 7) {
                errors.push("Extension requests must be submitted within 7 days - Tasneef audit requirement");
            }
            // Enhanced revision timeline validation (30-day rule)
            if (timelineData.submission_type === "revision" &&
                timelineData.days_remaining > 30) {
                errors.push("Revision requests can only be accepted within 30 days - Tasneef audit requirement");
            }
            // Acute care notification validation (10-day rule)
            if (timelineData.submission_type === "acute_care_notification" &&
                timelineData.days_remaining > 10) {
                errors.push("Acute care notifications must be submitted within 10 days - Tasneef audit requirement");
            }
            // Prior approval requirement validation
            if (timelineData.submission_type === "initial" &&
                timelineData.service_start_date &&
                timelineData.submission_date) {
                const serviceStart = new Date(timelineData.service_start_date);
                const submissionDate = new Date(timelineData.submission_date);
                if (submissionDate >= serviceStart) {
                    errors.push("CRITICAL: Prior approval required - submission must be before service initiation");
                }
            }
            // Documentation completeness validation
            if (!timelineData.documentation_complete) {
                errors.push("Complete documentation is mandatory per Tasneef audit requirements");
            }
            // Provider responsibility validation
            if (!timelineData.provider_responsibility_acknowledged) {
                warnings.push("Provider responsibility must be acknowledged for full compliance");
            }
            // SPC guidelines adherence validation
            if (!timelineData.spc_guidelines_adherence) {
                errors.push("SPC guidelines adherence is mandatory for Tasneef audit compliance");
            }
            const isValid = errors.length === 0;
            return this.createResult(isValid, errors, warnings, undefined, timelineData);
        }
        catch (error) {
            errors.push(`Timeline validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return this.createResult(false, errors, warnings, undefined, timelineData);
        }
    }
    // Private helper methods
    static performBasicValidation(data) {
        const errors = [];
        const warnings = [];
        // Check for null/undefined
        if (data === null || data === undefined) {
            errors.push("Data is null or undefined");
            return { isValid: false, errors, warnings };
        }
        // Check size limits
        try {
            const jsonString = this.safeStringify(data);
            if (jsonString.length > this.MAX_SIZE) {
                warnings.push(`Data size (${jsonString.length}) exceeds recommended limit (${this.MAX_SIZE})`);
            }
        }
        catch (error) {
            errors.push("Failed to serialize data for size check");
        }
        // Check depth
        const depth = this.calculateDepth(data);
        if (depth > this.MAX_DEPTH) {
            warnings.push(`Data depth (${depth}) exceeds recommended limit (${this.MAX_DEPTH})`);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    static validateStructure(data, options) {
        const errors = [];
        const warnings = [];
        try {
            // Check for circular references
            const seen = new WeakSet();
            this.checkCircularReferences(data, seen, errors);
            // Validate against schema if provided
            if (options.enforceSchema) {
                const schemaValidation = this.validateAgainstSchema(data, options.enforceSchema);
                errors.push(...schemaValidation.errors);
                warnings.push(...schemaValidation.warnings);
            }
        }
        catch (error) {
            errors.push(`Structure validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return { errors, warnings };
    }
    static validateContent(data, options) {
        const errors = [];
        const warnings = [];
        try {
            this.validateContentRecursive(data, options, errors, warnings, "");
        }
        catch (error) {
            errors.push(`Content validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return { errors, warnings };
    }
    static validateContentRecursive(data, options, errors, warnings, path) {
        if (typeof data === "object" && data !== null) {
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    this.validateContentRecursive(item, options, errors, warnings, `${path}[${index}]`);
                });
            }
            else {
                Object.keys(data).forEach((key) => {
                    const newPath = path ? `${path}.${key}` : key;
                    // Validate dates if enabled
                    if (options.validateDates &&
                        (key.includes("date") || key.includes("time"))) {
                        if (typeof data[key] === "string" && !this.isValidDate(data[key])) {
                            errors.push(`Invalid date format at ${newPath}: ${data[key]}`);
                        }
                    }
                    // Validate strings if sanitization is enabled
                    if (options.sanitizeStrings && typeof data[key] === "string") {
                        if (this.containsUnsafeContent(data[key])) {
                            warnings.push(`Potentially unsafe content detected at ${newPath}`);
                        }
                    }
                    this.validateContentRecursive(data[key], options, errors, warnings, newPath);
                });
            }
        }
    }
    static attemptAutoFix(data, options) {
        try {
            const fixed = this.deepClone(data);
            // Apply fixes recursively
            this.applyFixesRecursive(fixed, options);
            // Validate the fixed data
            const fixedJsonString = this.safeStringify(fixed);
            const parseResult = this.safeParse(fixedJsonString);
            if (parseResult.success) {
                return { success: true, fixedJson: fixedJsonString };
            }
            else {
                return { success: false, error: parseResult.error };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    static applyFixesRecursive(data, options) {
        if (typeof data === "object" && data !== null) {
            if (Array.isArray(data)) {
                data.forEach((item) => this.applyFixesRecursive(item, options));
            }
            else {
                Object.keys(data).forEach((key) => {
                    // Fix date formats
                    if (options.validateDates &&
                        (key.includes("date") || key.includes("time"))) {
                        if (typeof data[key] === "string" && !this.isValidDate(data[key])) {
                            // Attempt to fix common date format issues
                            data[key] = this.fixDateFormat(data[key]);
                        }
                    }
                    // Sanitize strings
                    if (options.sanitizeStrings && typeof data[key] === "string") {
                        data[key] = this.sanitizeString(data[key]);
                    }
                    // Handle undefined values
                    if (data[key] === undefined) {
                        data[key] = null;
                    }
                    this.applyFixesRecursive(data[key], options);
                });
            }
        }
    }
    static fixCommonJsonIssues(jsonString) {
        let fixed = jsonString;
        // Fix trailing commas
        fixed = fixed.replace(/,\s*([}\]])/g, "$1");
        // Fix single quotes to double quotes (but not inside strings)
        fixed = fixed.replace(/'/g, '"');
        // Fix unquoted keys
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
        // Fix undefined values
        fixed = fixed.replace(/:\s*undefined/g, ": null");
        return fixed;
    }
    /**
     * Enhanced JSON issue fixing with detailed tracking and AI-specific fixes
     */
    static fixCommonJsonIssuesEnhanced(jsonString) {
        let fixed = jsonString;
        const fixedIssues = [];
        // Pre-processing: Remove common AI-generated artifacts
        const aiArtifactRegex = /```json\s*|\s*```/g;
        if (aiArtifactRegex.test(fixed)) {
            fixed = fixed.replace(aiArtifactRegex, "");
            fixedIssues.push("Removed AI-generated code block markers");
        }
        // Fix trailing commas
        const trailingCommaRegex = /,\s*([}\]])/g;
        if (trailingCommaRegex.test(fixed)) {
            fixed = fixed.replace(trailingCommaRegex, "$1");
            fixedIssues.push("Removed trailing commas");
        }
        // Fix single quotes to double quotes (more careful approach)
        const singleQuoteRegex = /(?<!\\)'/g;
        if (singleQuoteRegex.test(fixed)) {
            fixed = fixed.replace(singleQuoteRegex, '"');
            fixedIssues.push("Converted single quotes to double quotes");
        }
        // Fix unquoted keys
        const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
        if (unquotedKeyRegex.test(fixed)) {
            fixed = fixed.replace(unquotedKeyRegex, '$1"$2":');
            fixedIssues.push("Added quotes to unquoted keys");
        }
        // Fix undefined values
        const undefinedRegex = /:\s*undefined/g;
        if (undefinedRegex.test(fixed)) {
            fixed = fixed.replace(undefinedRegex, ": null");
            fixedIssues.push("Converted undefined to null");
        }
        // Fix NaN values
        const nanRegex = /:\s*NaN/g;
        if (nanRegex.test(fixed)) {
            fixed = fixed.replace(nanRegex, ": null");
            fixedIssues.push("Converted NaN to null");
        }
        // Fix Infinity values
        const infinityRegex = /:\s*Infinity/g;
        if (infinityRegex.test(fixed)) {
            fixed = fixed.replace(infinityRegex, ": null");
            fixedIssues.push("Converted Infinity to null");
        }
        // Fix function values
        const functionRegex = /:\s*function[^,}\]]+/g;
        if (functionRegex.test(fixed)) {
            fixed = fixed.replace(functionRegex, ': "[Function]"');
            fixedIssues.push("Converted functions to string representation");
        }
        // Fix comments (// and /* */)
        const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
        if (commentRegex.test(fixed)) {
            fixed = fixed.replace(commentRegex, "");
            fixedIssues.push("Removed comments");
        }
        // Fix escaped quotes in strings
        const escapedQuoteRegex = /"([^"]*\\"[^"]*)"/g;
        if (escapedQuoteRegex.test(fixed)) {
            fixed = fixed.replace(escapedQuoteRegex, (match, content) => {
                return '"' + content.replace(/\\"/g, "&quot;") + '"';
            });
            fixedIssues.push("Fixed escaped quotes in strings");
        }
        // Fix malformed arrays and objects
        const malformedArrayRegex = /\[\s*,/g;
        if (malformedArrayRegex.test(fixed)) {
            fixed = fixed.replace(malformedArrayRegex, "[");
            fixedIssues.push("Fixed malformed arrays");
        }
        const malformedObjectRegex = /\{\s*,/g;
        if (malformedObjectRegex.test(fixed)) {
            fixed = fixed.replace(malformedObjectRegex, "{");
            fixedIssues.push("Fixed malformed objects");
        }
        return { fixedString: fixed, fixedIssues };
    }
    /**
     * Aggressive JSON fixing for severely malformed JSON
     */
    static aggressiveJsonFix(jsonString) {
        const fixedIssues = [];
        try {
            // Try to extract what looks like JSON from the string
            let fixed = jsonString.trim();
            // Remove any leading/trailing non-JSON characters
            const jsonStart = fixed.search(/[{\[]/);
            const jsonEnd = fixed.lastIndexOf("}") !== -1
                ? fixed.lastIndexOf("}") + 1
                : fixed.lastIndexOf("]") !== -1
                    ? fixed.lastIndexOf("]") + 1
                    : fixed.length;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                fixed = fixed.substring(jsonStart, jsonEnd);
                fixedIssues.push("Extracted JSON from surrounding text");
            }
            // Try to balance braces and brackets
            const openBraces = (fixed.match(/{/g) || []).length;
            const closeBraces = (fixed.match(/}/g) || []).length;
            const openBrackets = (fixed.match(/\[/g) || []).length;
            const closeBrackets = (fixed.match(/\]/g) || []).length;
            if (openBraces > closeBraces) {
                fixed += "}".repeat(openBraces - closeBraces);
                fixedIssues.push("Added missing closing braces");
            }
            if (openBrackets > closeBrackets) {
                fixed += "]".repeat(openBrackets - closeBrackets);
                fixedIssues.push("Added missing closing brackets");
            }
            // Apply standard fixes
            const standardFix = this.fixCommonJsonIssuesEnhanced(fixed);
            fixed = standardFix.fixedString;
            fixedIssues.push(...standardFix.fixedIssues);
            const data = JSON.parse(fixed);
            return { success: true, data, fixedIssues };
        }
        catch (error) {
            return { success: false, fixedIssues };
        }
    }
    static calculateDepth(obj, depth = 0) {
        if (depth > this.MAX_DEPTH)
            return depth;
        if (typeof obj !== "object" || obj === null) {
            return depth;
        }
        let maxDepth = depth;
        if (Array.isArray(obj)) {
            for (const item of obj) {
                maxDepth = Math.max(maxDepth, this.calculateDepth(item, depth + 1));
            }
        }
        else {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    maxDepth = Math.max(maxDepth, this.calculateDepth(obj[key], depth + 1));
                }
            }
        }
        return maxDepth;
    }
    static checkCircularReferences(obj, seen, errors) {
        if (typeof obj === "object" && obj !== null) {
            if (seen.has(obj)) {
                errors.push("Circular reference detected");
                return;
            }
            seen.add(obj);
            if (Array.isArray(obj)) {
                obj.forEach((item) => this.checkCircularReferences(item, seen, errors));
            }
            else {
                Object.values(obj).forEach((value) => this.checkCircularReferences(value, seen, errors));
            }
        }
    }
    static validateAgainstSchema(data, schema) {
        // Basic schema validation - can be extended with a proper schema validator
        const errors = [];
        const warnings = [];
        // This is a simplified implementation - in production, use a library like Ajv
        if (schema.required && Array.isArray(schema.required)) {
            schema.required.forEach((field) => {
                if (!(field in data)) {
                    errors.push(`Required field missing: ${field}`);
                }
            });
        }
        return { errors, warnings };
    }
    static isValidDate(dateString) {
        if (typeof dateString !== "string")
            return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && dateString.includes("-");
    }
    static containsUnsafeContent(str) {
        const unsafePatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
        ];
        return unsafePatterns.some((pattern) => pattern.test(str));
    }
    static fixDateFormat(dateString) {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        }
        catch {
            // If parsing fails, return original string
        }
        return dateString;
    }
    static sanitizeString(str) {
        return str
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "")
            .trim();
    }
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.deepClone(item));
        }
        const cloned = {};
        Object.keys(obj).forEach((key) => {
            cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
    }
    static createResult(isValid, errors, warnings, fixedJson, originalData) {
        return {
            isValid,
            errors,
            warnings,
            fixedJson,
            metadata: {
                validationTimestamp: new Date().toISOString(),
                validatorVersion: this.VERSION,
                dataType: typeof originalData,
                size: this.safeStringify(originalData).length,
            },
        };
    }
}
Object.defineProperty(ComprehensiveJsonValidator, "VERSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "2.1.0"
});
Object.defineProperty(ComprehensiveJsonValidator, "MAX_DEPTH", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 50
});
Object.defineProperty(ComprehensiveJsonValidator, "MAX_SIZE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 10 * 1024 * 1024
}); // 10MB
// Export utility functions for backward compatibility
export const validateJson = ComprehensiveJsonValidator.validateAndFix;
export const safeStringify = ComprehensiveJsonValidator.safeStringify;
export const safeParse = ComprehensiveJsonValidator.safeParse;
export const validateComplaintData = ComprehensiveJsonValidator.validateComplaintData;
export const validateDamanTimelineData = ComprehensiveJsonValidator.validateDamanTimelineData;
// Default export
export default ComprehensiveJsonValidator;
