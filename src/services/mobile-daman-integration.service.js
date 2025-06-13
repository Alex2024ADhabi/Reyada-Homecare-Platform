/**
 * Mobile-First Daman Integration Service
 * Enhanced mobile capabilities for Daman compliance and offline functionality
 */
import { damanIntegrationAPI } from "@/api/daman-integration.api";
import { inputSanitizer } from "./input-sanitization.service";
import { JsonValidator } from "@/utils/json-validator";
class MobileDamanIntegrationService {
    constructor() {
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        Object.defineProperty(this, "syncQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxOfflineStorage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        }); // Maximum offline submissions
        this.initializeNetworkListeners();
        this.loadOfflineQueue();
    }
    static getInstance() {
        if (!MobileDamanIntegrationService.instance) {
            MobileDamanIntegrationService.instance =
                new MobileDamanIntegrationService();
        }
        return MobileDamanIntegrationService.instance;
    }
    initializeNetworkListeners() {
        window.addEventListener("online", () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        window.addEventListener("offline", () => {
            this.isOnline = false;
        });
    }
    /**
     * Mobile-optimized Daman form submission
     */
    async submitMobileDamanForm(formData, attachments = [], options = {}) {
        try {
            // Generate submission ID
            const submissionId = `mobile-daman-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Get device information
            const deviceInfo = this.getDeviceInfo();
            // Create mobile submission object
            const submission = {
                id: submissionId,
                patientId: formData.patientId || "",
                serviceType: formData.serviceType || "",
                formData: this.sanitizeFormData(formData),
                attachments: options.compressImages
                    ? await this.compressAttachments(attachments)
                    : attachments,
                location: await this.getCurrentLocation(),
                timestamp: new Date().toISOString(),
                status: "draft",
                mobileMetadata: deviceInfo,
            };
            // Validate submission if requested
            if (options.validateBeforeSubmit) {
                const validation = this.validateMobileSubmission(submission);
                if (!validation.isValid) {
                    return {
                        success: false,
                        errors: validation.errors,
                    };
                }
            }
            // Try online submission first
            if (this.isOnline) {
                try {
                    const result = await this.submitOnline(submission);
                    return {
                        success: true,
                        submissionId: result.authorizationId,
                    };
                }
                catch (error) {
                    console.warn("Online submission failed, falling back to offline:", error);
                }
            }
            // Store offline if allowed
            if (options.allowOffline !== false) {
                await this.storeOfflineSubmission(submission);
                return {
                    success: true,
                    submissionId,
                    offlineStored: true,
                };
            }
            return {
                success: false,
                errors: ["Unable to submit online and offline storage not allowed"],
            };
        }
        catch (error) {
            console.error("Mobile Daman submission failed:", error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : "Unknown error"],
            };
        }
    }
    /**
     * Capture and process mobile document/photo
     */
    async captureDocument(type, options = {}) {
        try {
            // Check if we're in a mobile environment
            if (!this.isMobileDevice()) {
                throw new Error("Document capture is only available on mobile devices");
            }
            // Create file input for web-based capture
            const input = document.createElement("input");
            input.type = "file";
            input.accept =
                type === "document" ? ".pdf,.doc,.docx,image/*" : "image/*";
            input.capture = type === "camera" ? "environment" : undefined;
            return new Promise((resolve, reject) => {
                input.onchange = async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                        resolve(null);
                        return;
                    }
                    try {
                        const attachment = await this.processFile(file, options);
                        resolve(attachment);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                input.oncancel = () => resolve(null);
                input.click();
            });
        }
        catch (error) {
            console.error("Document capture failed:", error);
            return null;
        }
    }
    /**
     * Voice-to-text for clinical notes
     */
    async startVoiceInput(language = "en-US", medicalTerminology = true) {
        const isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
        if (!isSupported) {
            return {
                startRecording: () => { },
                stopRecording: () => { },
                getText: () => "",
                isSupported: false,
            };
        }
        const SpeechRecognition = window.webkitSpeechRecognition ||
            window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        let finalTranscript = "";
        let isRecording = false;
        recognition.onresult = (event) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + " ";
                }
                else {
                    interimTranscript += transcript;
                }
            }
            // Apply medical terminology corrections if enabled
            if (medicalTerminology) {
                finalTranscript = this.correctMedicalTerminology(finalTranscript);
            }
        };
        return {
            startRecording: () => {
                if (!isRecording) {
                    recognition.start();
                    isRecording = true;
                }
            },
            stopRecording: () => {
                if (isRecording) {
                    recognition.stop();
                    isRecording = false;
                }
            },
            getText: () => finalTranscript.trim(),
            isSupported: true,
        };
    }
    /**
     * Offline sync management
     */
    async syncOfflineSubmissions() {
        if (!this.isOnline) {
            return { synced: 0, failed: 0, errors: ["Device is offline"] };
        }
        const results = { synced: 0, failed: 0, errors: [] };
        for (const submission of this.syncQueue) {
            try {
                await this.submitOnline(submission);
                submission.status = "submitted";
                results.synced++;
            }
            catch (error) {
                submission.status = "offline";
                results.failed++;
                results.errors.push(`Failed to sync ${submission.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }
        // Remove successfully synced submissions
        this.syncQueue = this.syncQueue.filter((s) => s.status !== "submitted");
        await this.saveOfflineQueue();
        return results;
    }
    /**
     * Get offline submission status
     */
    getOfflineStatus() {
        const totalSize = this.syncQueue.reduce((sum, submission) => {
            return sum + JSON.stringify(submission).length;
        }, 0);
        return {
            pendingSubmissions: this.syncQueue.length,
            totalStorageUsed: totalSize,
            maxStorage: this.maxOfflineStorage,
            canStoreMore: this.syncQueue.length < this.maxOfflineStorage,
        };
    }
    // Private helper methods
    sanitizeFormData(formData) {
        try {
            // First, validate the JSON structure
            const jsonString = JsonValidator.safeStringify(formData);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                console.error("Form data JSON validation failed:", validation.errors);
                // Try auto-fix before throwing error
                const fixedJson = JsonValidator.attemptAutoFix(jsonString);
                if (fixedJson) {
                    const fixedValidation = JsonValidator.validate(fixedJson);
                    if (fixedValidation.isValid) {
                        console.log("Form data auto-fixed successfully");
                        return this.sanitizeFormData(fixedValidation.data);
                    }
                }
                throw new Error(`Invalid form data structure: ${validation.errors?.join(", ")}`);
            }
            // Use validated data as base
            const baseData = validation.data || formData;
            const sanitized = {};
            // Enhanced Daman-specific validation
            this.validateDamanMobileFields(baseData);
            Object.keys(baseData).forEach((key) => {
                const value = baseData[key];
                if (value === null || value === undefined) {
                    sanitized[key] = null;
                }
                else if (typeof value === "string") {
                    // Enhanced string sanitization
                    const cleanedValue = value
                        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
                        .replace(/\r\n/g, "\n") // Normalize line endings
                        .replace(/\r/g, "\n")
                        .trim();
                    sanitized[key] = inputSanitizer.sanitizeText(cleanedValue, 2000).sanitized;
                }
                else if (typeof value === "number") {
                    // Ensure finite numbers
                    sanitized[key] = isFinite(value) ? value : null;
                }
                else if (typeof value === "boolean") {
                    sanitized[key] = value;
                }
                else if (Array.isArray(value)) {
                    sanitized[key] = value.map((item, index) => {
                        if (typeof item === "string") {
                            const cleanedItem = item
                                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
                                .trim();
                            return inputSanitizer.sanitizeText(cleanedItem, 500).sanitized;
                        }
                        else if (typeof item === "object" && item !== null) {
                            return this.sanitizeFormData(item);
                        }
                        else {
                            return item;
                        }
                    });
                }
                else if (value && typeof value === "object") {
                    sanitized[key] = this.sanitizeFormData(value);
                }
                else {
                    // Handle other types (functions, symbols, etc.)
                    sanitized[key] = null;
                }
            });
            // Final validation of sanitized data
            const finalJsonString = JsonValidator.safeStringify(sanitized);
            const finalValidation = JsonValidator.validate(finalJsonString);
            if (!finalValidation.isValid) {
                console.error("Sanitized data validation failed:", finalValidation.errors);
                throw new Error("Data sanitization produced invalid structure");
            }
            return sanitized;
        }
        catch (error) {
            console.error("Form data sanitization failed:", error);
            throw new Error(`Form data sanitization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Validates Daman-specific mobile form fields
     */
    validateDamanMobileFields(formData) {
        // Validate service codes against 2025 standards
        if (formData.serviceType) {
            const validServiceCodes = [
                "17-25-1",
                "17-25-2",
                "17-25-3",
                "17-25-4",
                "17-25-5",
            ];
            const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];
            if (deprecatedCodes.includes(formData.serviceType)) {
                throw new Error(`Service code ${formData.serviceType} is deprecated. Use codes 17-25-1 to 17-25-5`);
            }
            if (!validServiceCodes.includes(formData.serviceType)) {
                console.warn(`Service code ${formData.serviceType} may not be valid. Valid codes: ${validServiceCodes.join(", ")}`);
            }
        }
        // Validate clinical justification length (minimum 100 characters for MSC)
        if (formData.clinicalJustification && formData.policyType === "MSC") {
            if (formData.clinicalJustification.length < 100) {
                throw new Error("MSC clinical justification must be at least 100 characters");
            }
        }
        // Validate submission timing (before 8:00 AM)
        const now = new Date();
        const deadline = new Date();
        deadline.setHours(8, 0, 0, 0);
        if (now > deadline) {
            console.warn("Submission after 8:00 AM deadline - will be queued for next day");
        }
        // Validate UAE email domain for contact person
        if (formData.contactPersonEmail &&
            !formData.contactPersonEmail.endsWith(".ae")) {
            throw new Error("Contact person email must use UAE-hosted domain (.ae)");
        }
    }
    validateMobileSubmission(submission) {
        const errors = [];
        const warnings = [];
        const mobileSpecificIssues = [];
        try {
            // JSON structure validation first
            const jsonString = JsonValidator.safeStringify(submission);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                errors.push("Submission data contains invalid JSON structure");
                validation.errors?.forEach((error) => errors.push(error));
            }
            // Basic validation
            if (!submission.patientId)
                errors.push("Patient ID is required");
            if (!submission.serviceType)
                errors.push("Service type is required");
            if (!submission.formData)
                errors.push("Form data is required");
            // Form data validation
            if (submission.formData) {
                try {
                    const formJsonString = JsonValidator.safeStringify(submission.formData);
                    const formValidation = JsonValidator.validate(formJsonString);
                    if (!formValidation.isValid) {
                        errors.push("Form data contains invalid structure");
                        formValidation.errors?.forEach((error) => warnings.push(`Form data: ${error}`));
                    }
                }
                catch (formError) {
                    errors.push("Form data validation failed");
                }
            }
            // Mobile-specific validation
            if (!submission.mobileMetadata?.deviceInfo) {
                mobileSpecificIssues.push("Device information missing");
            }
            // Attachment validation
            if (submission.attachments) {
                try {
                    const attachmentsJsonString = JsonValidator.safeStringify(submission.attachments);
                    const attachmentsValidation = JsonValidator.validate(attachmentsJsonString);
                    if (!attachmentsValidation.isValid) {
                        warnings.push("Attachment data contains formatting issues");
                    }
                    // Check attachment sizes
                    const totalAttachmentSize = submission.attachments.reduce((sum, att) => {
                        if (typeof att.size === "number" && isFinite(att.size)) {
                            return sum + att.size;
                        }
                        warnings.push(`Invalid attachment size for ${att.filename || "unknown file"}`);
                        return sum;
                    }, 0);
                    if (totalAttachmentSize > 50 * 1024 * 1024) {
                        // 50MB limit
                        mobileSpecificIssues.push("Total attachment size exceeds 50MB limit");
                    }
                }
                catch (attachmentError) {
                    warnings.push("Attachment validation failed");
                }
            }
            // Estimate sync time based on data size
            let dataSize = 0;
            let estimatedSyncTime = 0;
            try {
                const dataString = JsonValidator.safeStringify(submission);
                dataSize = dataString.length;
                estimatedSyncTime = Math.ceil(dataSize / 1024 / 10); // Rough estimate: 10KB/sec
            }
            catch (sizeError) {
                warnings.push("Could not calculate data size");
                estimatedSyncTime = 30; // Default estimate
            }
            return {
                isValid: errors.length === 0 && mobileSpecificIssues.length === 0,
                errors,
                warnings,
                mobileSpecificIssues,
                offlineCapable: dataSize < 10 * 1024 * 1024, // 10MB offline limit
                estimatedSyncTime,
            };
        }
        catch (error) {
            console.error("Mobile submission validation failed:", error);
            return {
                isValid: false,
                errors: [
                    "Validation process failed",
                    error instanceof Error ? error.message : "Unknown error",
                ],
                warnings,
                mobileSpecificIssues,
                offlineCapable: false,
                estimatedSyncTime: 0,
            };
        }
    }
    async submitOnline(submission) {
        // Convert mobile submission to standard Daman format
        const damanRequest = {
            patientId: submission.patientId,
            serviceType: submission.serviceType,
            providerId: submission.formData.providerId || "mobile-provider",
            clinicalJustification: submission.formData.clinicalJustification || "",
            requestedServices: submission.formData.requestedServices || [],
            urgencyLevel: submission.formData.urgencyLevel || "routine",
            estimatedDuration: submission.formData.estimatedDuration || 30,
            diagnosisCodes: submission.formData.diagnosisCodes || [],
            treatmentPlan: submission.formData.treatmentPlan || "",
            mobileSubmission: true,
            deviceInfo: submission.mobileMetadata,
            attachments: submission.attachments.map((att) => ({
                type: att.type,
                filename: att.filename,
                size: att.size,
                uploaded: att.uploaded,
            })),
        };
        return await damanIntegrationAPI.submitAuthorization(damanRequest);
    }
    async storeOfflineSubmission(submission) {
        submission.status = "offline";
        this.syncQueue.push(submission);
        // Limit offline storage
        if (this.syncQueue.length > this.maxOfflineStorage) {
            this.syncQueue.shift(); // Remove oldest submission
        }
        await this.saveOfflineQueue();
    }
    async loadOfflineQueue() {
        try {
            const stored = localStorage.getItem("mobile-daman-sync-queue");
            if (stored) {
                this.syncQueue = JSON.parse(stored);
            }
        }
        catch (error) {
            console.error("Failed to load offline queue:", error);
            this.syncQueue = [];
        }
    }
    async saveOfflineQueue() {
        try {
            localStorage.setItem("mobile-daman-sync-queue", JSON.stringify(this.syncQueue));
        }
        catch (error) {
            console.error("Failed to save offline queue:", error);
        }
    }
    async processSyncQueue() {
        if (this.syncQueue.length > 0) {
            console.log(`Processing ${this.syncQueue.length} offline submissions`);
            await this.syncOfflineSubmissions();
        }
    }
    getDeviceInfo() {
        return {
            deviceInfo: navigator.userAgent,
            appVersion: "1.0.0", // Should be dynamic
            networkType: navigator.connection?.effectiveType || "unknown",
            batteryLevel: navigator.battery?.level || undefined,
        };
    }
    async getCurrentLocation() {
        if (!navigator.geolocation)
            return undefined;
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition((position) => resolve(position.coords), () => resolve(undefined), { timeout: 5000, enableHighAccuracy: false });
        });
    }
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    async processFile(file, options) {
        const id = `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Convert file to base64 for storage
        const base64Data = await this.fileToBase64(file);
        return {
            id,
            type: file.type.startsWith("image/") ? "photo" : "document",
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            base64Data,
            uploaded: false,
            compressionApplied: false,
        };
    }
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    async compressAttachments(attachments) {
        // Simple compression logic - in production, use proper image compression
        return attachments.map((att) => {
            if (att.type === "photo" && att.size > 1024 * 1024) {
                // 1MB
                return {
                    ...att,
                    compressionApplied: true,
                    size: Math.floor(att.size * 0.7), // Simulate 30% compression
                };
            }
            return att;
        });
    }
    correctMedicalTerminology(text) {
        // Basic medical terminology correction
        const corrections = {
            "high blood pressure": "hypertension",
            "sugar diabetes": "diabetes mellitus",
            "heart attack": "myocardial infarction",
            stroke: "cerebrovascular accident",
            "shortness of breath": "dyspnea",
            "chest pain": "chest pain",
            "difficulty swallowing": "dysphagia",
        };
        let corrected = text.toLowerCase();
        Object.entries(corrections).forEach(([incorrect, correct]) => {
            corrected = corrected.replace(new RegExp(incorrect, "gi"), correct);
        });
        return corrected;
    }
}
export const mobileDamanIntegration = MobileDamanIntegrationService.getInstance();
export default MobileDamanIntegrationService;
