import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, RefreshCw, Copy, Download, Wrench, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
export const JsonErrorHandler = ({ data, onDataFixed, onError, className = "", showPreview = true, autoFix = true, }) => {
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [rawJson, setRawJson] = useState("");
    const [showRawEditor, setShowRawEditor] = useState(false);
    useEffect(() => {
        if (data) {
            validateData(data);
        }
    }, [data]);
    const validateData = async (inputData) => {
        setIsValidating(true);
        try {
            const jsonString = JsonValidator.safeStringify(inputData);
            const result = JsonValidator.validate(jsonString);
            setValidationResult(result);
            setRawJson(jsonString);
            if (!result.isValid && onError) {
                onError(result.errors?.join(", ") || "Validation failed");
            }
            if (result.isValid && result.data && onDataFixed) {
                onDataFixed(result.data);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
            setValidationResult({
                isValid: false,
                errors: [errorMessage],
                data: null,
            });
            if (onError) {
                onError(errorMessage);
            }
        }
        finally {
            setIsValidating(false);
        }
    };
    const handleAutoFix = async () => {
        if (!rawJson)
            return;
        setIsValidating(true);
        try {
            const fixedJson = JsonValidator.attemptAutoFix(rawJson);
            if (fixedJson) {
                const validation = JsonValidator.validate(fixedJson);
                if (validation.isValid) {
                    setValidationResult(validation);
                    setRawJson(fixedJson);
                    if (validation.data && onDataFixed) {
                        onDataFixed(validation.data);
                    }
                }
                else {
                    setValidationResult({
                        isValid: false,
                        errors: ["Auto-fix failed to resolve all issues"],
                        autoFixed: false,
                    });
                }
            }
            else {
                setValidationResult({
                    isValid: false,
                    errors: ["Auto-fix could not repair the JSON structure"],
                    autoFixed: false,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Auto-fix failed";
            setValidationResult({
                isValid: false,
                errors: [errorMessage],
                autoFixed: false,
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    const handleManualEdit = () => {
        setShowRawEditor(!showRawEditor);
    };
    const handleRawJsonChange = (value) => {
        setRawJson(value);
    };
    const handleValidateManual = () => {
        try {
            const parsedData = JSON.parse(rawJson);
            validateData(parsedData);
        }
        catch (error) {
            setValidationResult({
                isValid: false,
                errors: ["Invalid JSON syntax"],
                data: null,
            });
        }
    };
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        }
        catch (error) {
            console.error("Failed to copy to clipboard:", error);
        }
    };
    const downloadJson = () => {
        const blob = new Blob([rawJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (!validationResult && !isValidating) {
        return null;
    }
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [isValidating ? (_jsx(RefreshCw, { className: "h-5 w-5 animate-spin" })) : validationResult?.isValid ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" })), "JSON Validation Status"] }) }), _jsx(CardContent, { className: "space-y-4", children: isValidating ? (_jsxs("div", { className: "text-center py-4", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-2" }), _jsx("p", { children: "Validating data structure..." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: validationResult?.isValid ? "default" : "destructive", children: validationResult?.isValid ? "Valid" : "Invalid" }), validationResult?.sanitized && (_jsx(Badge, { variant: "secondary", children: "Sanitized" })), validationResult?.autoFixed && (_jsx(Badge, { variant: "outline", children: "Auto-Fixed" })), validationResult?.damanCompliant && (_jsx(Badge, { variant: "default", children: "Daman Compliant" }))] }), validationResult?.errors &&
                                    validationResult.errors.length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("strong", { children: "Validation Errors:" }), _jsx("ul", { className: "list-disc list-inside", children: validationResult.errors.map((error, index) => (_jsx("li", { children: error }, index))) })] }) })] })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [!validationResult?.isValid && autoFix && (_jsxs(Button, { onClick: handleAutoFix, variant: "outline", children: [_jsx(Wrench, { className: "h-4 w-4 mr-2" }), "Auto-Fix"] })), _jsxs(Button, { onClick: handleManualEdit, variant: "outline", children: [showRawEditor ? "Hide" : "Show", " Raw JSON"] }), rawJson && (_jsxs(_Fragment, { children: [_jsxs(Button, { onClick: () => copyToClipboard(rawJson), variant: "outline", size: "sm", children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { onClick: downloadJson, variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] })] }))] })] })) })] }), showRawEditor && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Raw JSON Editor" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Textarea, { value: rawJson, onChange: (e) => handleRawJsonChange(e.target.value), className: "font-mono text-sm min-h-64", placeholder: "Enter or edit JSON data..." }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleValidateManual, children: "Validate" }), _jsx(Button, { onClick: () => {
                                            try {
                                                const formatted = JSON.stringify(JSON.parse(rawJson), null, 2);
                                                setRawJson(formatted);
                                            }
                                            catch (error) {
                                                // Invalid JSON, can't format
                                            }
                                        }, variant: "outline", children: "Format" })] })] })] })), showPreview && validationResult?.isValid && validationResult.data && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Data Preview" }) }), _jsx(CardContent, { children: _jsx("pre", { className: "bg-gray-50 p-4 rounded-lg overflow-auto text-sm", children: JSON.stringify(validationResult.data, null, 2) }) })] }))] }));
};
export default JsonErrorHandler;
