import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, Clock, Shield, FileText, Users, Settings, TrendingUp, Zap, RefreshCw, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
export const DamanStandardsValidator = ({ formData, onValidationComplete, realTimeValidation = true }) => {
    const [validationResults, setValidationResults] = useState(null);
    const [complianceScore, setComplianceScore] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [lastValidation, setLastValidation] = useState(null);
    const damanStandards2025 = {
        authorization: {
            serviceCodes: ["17-25-1", "17-25-2", "17-25-3", "17-25-4", "17-25-5"],
            deprecatedCodes: ["17-26-1", "17-26-2", "17-26-3", "17-26-4"],
            paymentTerms: 30, // Updated from 45 to 30 days
            submissionDeadline: "08:00", // Daily 8:00 AM deadline
            mscDurationLimit: 90, // 90-day limit for MSC extensions
        },
        documents: {
            required: [
                "auth-request-form",
                "medical-report",
                "face-to-face-assessment",
                "daman-consent",
                "doh-assessment",
                "service-confirmation",
                "daily-schedule",
                "patient-monitoring-form",
            ],
            wheelchairSpecific: ["wheelchair-pre-approval", "warranty-documentation"],
        },
        communication: {
            emailDomain: ".ae", // UAE-hosted email requirement
            notificationChannels: ["email", "sms", "app"],
        },
        compliance: {
            auditRetention: 7, // 7 years
            encryptionStandard: "AES-256",
            mfaRequired: true,
        },
    };
    useEffect(() => {
        if (realTimeValidation && formData) {
            validateDamanCompliance();
        }
    }, [formData, realTimeValidation]);
    const validateDamanCompliance = async () => {
        setIsValidating(true);
        try {
            const results = await performComprehensiveValidation(formData);
            setValidationResults(results);
            setComplianceScore(calculateComplianceScore(results));
            setLastValidation(new Date());
            if (onValidationComplete) {
                onValidationComplete(results);
            }
        }
        catch (error) {
            console.error("Validation failed:", error);
            setValidationResults({
                isValid: false,
                errors: [error instanceof Error ? error.message : "Validation failed"],
                warnings: [],
                categories: {},
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    const performComprehensiveValidation = async (data) => {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            categories: {
                authorization: {
                    score: 0,
                    issues: [],
                    passed: [],
                },
                documents: { score: 0, issues: [], passed: [] },
                communication: {
                    score: 0,
                    issues: [],
                    passed: [],
                },
                security: { score: 0, issues: [], passed: [] },
                mobile: { score: 0, issues: [], passed: [] },
                integration: {
                    score: 0,
                    issues: [],
                    passed: [],
                },
            },
        };
        if (!data) {
            results.errors.push("No data provided for validation");
            results.isValid = false;
            return results;
        }
        // JSON Structure Validation
        try {
            const jsonString = JsonValidator.safeStringify(data);
            const jsonValidation = JsonValidator.validate(jsonString);
            if (!jsonValidation.isValid) {
                results.errors.push("Invalid JSON structure in form data");
                jsonValidation.errors?.forEach((error) => results.errors.push(error));
                results.isValid = false;
            }
            else {
                results.categories.authorization.passed.push("Valid JSON structure");
            }
        }
        catch (error) {
            results.errors.push("JSON validation failed");
            results.isValid = false;
        }
        // Authorization Workflow Validation
        await validateAuthorizationWorkflow(data, results);
        // Document Management Validation
        await validateDocumentManagement(data, results);
        // Communication Standards Validation
        await validateCommunicationStandards(data, results);
        // Security & Authentication Validation
        await validateSecurityStandards(data, results);
        // Mobile Capabilities Validation
        await validateMobileCapabilities(data, results);
        // Integration Intelligence Validation
        await validateIntegrationStandards(data, results);
        // Calculate category scores
        Object.keys(results.categories).forEach((category) => {
            const cat = results.categories[category];
            const totalChecks = cat.issues.length + cat.passed.length;
            cat.score = totalChecks > 0 ? (cat.passed.length / totalChecks) * 100 : 0;
        });
        return results;
    };
    const validateAuthorizationWorkflow = async (data, results) => {
        const auth = results.categories.authorization;
        // Service Code Validation
        if (data.serviceType || data.requestedServices) {
            const serviceCodes = data.requestedServices?.map((s) => s.serviceCode) || [data.serviceType];
            serviceCodes.forEach((code) => {
                if (damanStandards2025.authorization.deprecatedCodes.includes(code)) {
                    auth.issues.push(`Deprecated service code: ${code}`);
                    results.errors.push(`Service code ${code} is deprecated. Use codes 17-25-1 to 17-25-5`);
                }
                else if (damanStandards2025.authorization.serviceCodes.includes(code)) {
                    auth.passed.push(`Valid service code: ${code}`);
                }
                else {
                    auth.issues.push(`Invalid service code: ${code}`);
                    results.warnings.push(`Service code ${code} may not be valid`);
                }
            });
        }
        // MSC Compliance Validation
        if (data.policyType === "MSC") {
            if (data.treatmentDuration >
                damanStandards2025.authorization.mscDurationLimit) {
                auth.issues.push("MSC duration exceeds 90-day limit");
                results.errors.push("MSC treatment duration cannot exceed 90 days");
            }
            else {
                auth.passed.push("MSC duration within limits");
            }
            if (data.clinicalJustification?.length < 100) {
                auth.issues.push("MSC clinical justification too short");
                results.errors.push("MSC clinical justification must be at least 100 characters");
            }
            else {
                auth.passed.push("MSC clinical justification adequate");
            }
        }
        // Submission Deadline Validation
        const now = new Date();
        const deadline = new Date();
        deadline.setHours(8, 0, 0, 0);
        if (now > deadline) {
            auth.issues.push("Submission after 8:00 AM deadline");
            results.warnings.push("Submission after daily deadline - will be processed next business day");
        }
        else {
            auth.passed.push("Submission within deadline");
        }
    };
    const validateDocumentManagement = async (data, results) => {
        const docs = results.categories.documents;
        if (data.documents && Array.isArray(data.documents)) {
            const providedDocs = data.documents.map((d) => d.type || d);
            damanStandards2025.documents.required.forEach((requiredDoc) => {
                if (providedDocs.includes(requiredDoc)) {
                    docs.passed.push(`Required document present: ${requiredDoc}`);
                }
                else {
                    docs.issues.push(`Missing required document: ${requiredDoc}`);
                    results.errors.push(`Missing required document: ${requiredDoc}`);
                }
            });
            // Wheelchair-specific validation
            if (data.serviceType?.includes("wheelchair") ||
                data.requestedServices?.some((s) => s.description?.toLowerCase().includes("wheelchair"))) {
                damanStandards2025.documents.wheelchairSpecific.forEach((wheelchairDoc) => {
                    if (providedDocs.includes(wheelchairDoc)) {
                        docs.passed.push(`Wheelchair document present: ${wheelchairDoc}`);
                    }
                    else {
                        docs.issues.push(`Missing wheelchair document: ${wheelchairDoc}`);
                        results.errors.push(`Missing wheelchair-specific document: ${wheelchairDoc}`);
                    }
                });
            }
        }
        else {
            docs.issues.push("No documents provided");
            results.errors.push("At least one document is required");
        }
    };
    const validateCommunicationStandards = async (data, results) => {
        const comm = results.categories.communication;
        // UAE Email Domain Validation
        const emailFields = ["contactPersonEmail", "providerEmail", "primaryEmail"];
        emailFields.forEach((field) => {
            if (data[field]) {
                if (data[field].endsWith(damanStandards2025.communication.emailDomain)) {
                    comm.passed.push(`Valid UAE email domain: ${field}`);
                }
                else {
                    comm.issues.push(`Invalid email domain: ${field}`);
                    results.errors.push(`${field} must use UAE-hosted domain (.ae)`);
                }
            }
        });
        // Notification Preferences
        if (data.notificationPreferences) {
            const validChannels = damanStandards2025.communication.notificationChannels;
            const userChannels = data.notificationPreferences;
            if (userChannels.some((channel) => validChannels.includes(channel))) {
                comm.passed.push("Valid notification channels selected");
            }
            else {
                comm.issues.push("No valid notification channels");
                results.warnings.push("Please select valid notification channels");
            }
        }
    };
    const validateSecurityStandards = async (data, results) => {
        const security = results.categories.security;
        // Digital Signatures Validation
        if (data.digitalSignatures) {
            const requiredSignatures = [
                "patientSignature",
                "providerSignature",
                "contactPersonSignature",
            ];
            requiredSignatures.forEach((sig) => {
                if (data.digitalSignatures[sig]) {
                    security.passed.push(`Digital signature present: ${sig}`);
                }
                else {
                    security.issues.push(`Missing digital signature: ${sig}`);
                    results.errors.push(`Missing required signature: ${sig}`);
                }
            });
        }
        else {
            security.issues.push("No digital signatures provided");
            results.errors.push("Digital signatures are required");
        }
        // Provider Authentication
        if (data.letterOfAppointment?.valid) {
            security.passed.push("Valid letter of appointment");
        }
        else {
            security.issues.push("Invalid letter of appointment");
            results.errors.push("Valid letter of appointment is required");
        }
    };
    const validateMobileCapabilities = async (data, results) => {
        const mobile = results.categories.mobile;
        // Mobile Submission Validation
        if (data.mobileSubmission) {
            mobile.passed.push("Mobile submission detected");
            if (data.deviceInfo) {
                mobile.passed.push("Device information captured");
            }
            else {
                mobile.issues.push("Missing device information");
                results.warnings.push("Device information not captured");
            }
            if (data.location) {
                mobile.passed.push("Location data captured");
            }
            else {
                mobile.issues.push("Missing location data");
                results.warnings.push("Location data not captured");
            }
        }
        // Offline Capability Check
        if (data.offlineCapable !== undefined) {
            if (data.offlineCapable) {
                mobile.passed.push("Offline submission capability");
            }
            else {
                mobile.issues.push("No offline capability");
                results.warnings.push("Form not optimized for offline submission");
            }
        }
    };
    const validateIntegrationStandards = async (data, results) => {
        const integration = results.categories.integration;
        // API Integration Validation
        if (data.apiVersion) {
            integration.passed.push(`API version: ${data.apiVersion}`);
        }
        else {
            integration.issues.push("No API version specified");
            results.warnings.push("API version not specified");
        }
        // Real-time Sync Validation
        if (data.realTimeSync) {
            integration.passed.push("Real-time synchronization enabled");
        }
        else {
            integration.issues.push("No real-time synchronization");
            results.warnings.push("Real-time sync not enabled");
        }
        // Webhook Configuration
        if (data.webhookConfig) {
            integration.passed.push("Webhook configuration present");
        }
        else {
            integration.issues.push("No webhook configuration");
            results.warnings.push("Webhook notifications not configured");
        }
    };
    const calculateComplianceScore = (results) => {
        if (!results.categories)
            return 0;
        const categoryScores = Object.values(results.categories).map((cat) => cat.score);
        const averageScore = categoryScores.reduce((sum, score) => sum + score, 0) /
            categoryScores.length;
        return Math.round(averageScore);
    };
    const getComplianceLevel = (score) => {
        if (score >= 90)
            return {
                level: "Excellent",
                color: "text-green-600 bg-green-100",
                icon: CheckCircle,
            };
        if (score >= 75)
            return {
                level: "Good",
                color: "text-blue-600 bg-blue-100",
                icon: TrendingUp,
            };
        if (score >= 60)
            return {
                level: "Acceptable",
                color: "text-yellow-600 bg-yellow-100",
                icon: Clock,
            };
        return {
            level: "Needs Improvement",
            color: "text-red-600 bg-red-100",
            icon: AlertTriangle,
        };
    };
    const renderValidationSummary = () => {
        if (!validationResults)
            return null;
        const compliance = getComplianceLevel(complianceScore);
        const Icon = compliance.icon;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-6 w-6 text-blue-600" }), _jsx(CardTitle, { children: "Daman Standards Compliance" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { className: compliance.color, children: [_jsx(Icon, { className: "h-4 w-4 mr-1" }), compliance.level] }), _jsx(Button, { variant: "outline", size: "sm", onClick: validateDamanCompliance, disabled: isValidating, children: _jsx(RefreshCw, { className: `h-4 w-4 ${isValidating ? "animate-spin" : ""}` }) })] })] }), _jsx(CardDescription, { children: "Comprehensive validation against Daman 2025 standards" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Overall Compliance Score" }), _jsxs("span", { className: "font-medium", children: [complianceScore, "%"] })] }), _jsx(Progress, { value: complianceScore, className: "h-3" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: validationResults.errors.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Errors" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: validationResults.warnings.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Warnings" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: Object.values(validationResults.categories).reduce((sum, cat) => sum + cat.passed.length, 0) }), _jsx("div", { className: "text-sm text-gray-600", children: "Passed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: Object.keys(validationResults.categories).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Categories" })] })] }), lastValidation && (_jsxs("div", { className: "text-xs text-gray-500 text-center", children: ["Last validated: ", lastValidation.toLocaleString()] }))] })] }));
    };
    const renderCategoryDetails = () => {
        if (!validationResults?.categories)
            return null;
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(validationResults.categories).map(([categoryName, category]) => {
                const categoryIcons = {
                    authorization: Zap,
                    documents: FileText,
                    communication: Users,
                    security: Shield,
                    mobile: Settings,
                    integration: TrendingUp,
                };
                const Icon = categoryIcons[categoryName] ||
                    Settings;
                return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-lg capitalize", children: [_jsx(Icon, { className: "h-5 w-5" }), categoryName] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Score" }), _jsxs("span", { className: "font-medium", children: [Math.round(category.score), "%"] })] }), _jsx(Progress, { value: category.score, className: "h-2" })] }), _jsxs(CardContent, { className: "space-y-3", children: [category.issues.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-red-600 mb-2", children: "Issues" }), _jsx("div", { className: "space-y-1", children: category.issues.map((issue, index) => (_jsxs("div", { className: "text-xs text-red-600 flex items-start gap-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mt-0.5 flex-shrink-0" }), issue] }, index))) })] })), category.passed.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-green-600 mb-2", children: "Passed" }), _jsxs("div", { className: "space-y-1", children: [category.passed
                                                    .slice(0, 3)
                                                    .map((passed, index) => (_jsxs("div", { className: "text-xs text-green-600 flex items-start gap-1", children: [_jsx(CheckCircle, { className: "h-3 w-3 mt-0.5 flex-shrink-0" }), passed] }, index))), category.passed.length > 3 && (_jsxs("div", { className: "text-xs text-gray-500", children: ["+", category.passed.length - 3, " more"] }))] })] }))] })] }, categoryName));
            }) }));
    };
    const renderErrorsAndWarnings = () => {
        if (!validationResults ||
            (validationResults.errors.length === 0 &&
                validationResults.warnings.length === 0)) {
            return null;
        }
        return (_jsxs("div", { className: "space-y-4", children: [validationResults.errors.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-red-600", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "Critical Issues (", validationResults.errors.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: validationResults.errors.map((error, index) => (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] }, index))) }) })] })), validationResults.warnings.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-yellow-600", children: [_jsx(Clock, { className: "h-5 w-5" }), "Warnings (", validationResults.warnings.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: validationResults.warnings.map((warning, index) => (_jsxs(Alert, { children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: warning })] }, index))) }) })] }))] }));
    };
    return (_jsxs("div", { className: "space-y-6 bg-white min-h-screen p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Daman Standards Validator" }), _jsx("p", { className: "text-gray-600", children: "Comprehensive compliance validation for Daman 2025 standards" })] }), _jsxs(Button, { onClick: validateDamanCompliance, disabled: isValidating, children: [isValidating ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Shield, { className: "h-4 w-4 mr-2" })), "Validate Compliance"] })] }), renderValidationSummary(), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "categories", children: "Categories" }), _jsx(TabsTrigger, { value: "issues", children: "Issues & Warnings" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: renderValidationSummary() }), _jsx(TabsContent, { value: "categories", className: "space-y-4", children: renderCategoryDetails() }), _jsx(TabsContent, { value: "issues", className: "space-y-4", children: renderErrorsAndWarnings() })] })] }));
};
export default DamanStandardsValidator;
