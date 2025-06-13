import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, Copy, Download, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { useToastContext } from "@/components/ui/toast-provider";
export default function JsonDebugger({ initialJson = "", onValidJson, className, }) {
    const { toast } = useToastContext();
    const [jsonInput, setJsonInput] = useState(initialJson);
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const validateJson = () => {
        setIsValidating(true);
        try {
            // Enhanced validation with better error handling
            if (!jsonInput || jsonInput.trim() === "") {
                setValidationResult({
                    isValid: false,
                    errors: ["JSON input is empty"],
                });
                toast({
                    title: "Empty Input",
                    description: "Please enter JSON content to validate",
                    variant: "warning",
                });
                return;
            }
            const result = JsonValidator.validate(jsonInput);
            setValidationResult(result);
            if (result.isValid && onValidJson) {
                onValidJson(jsonInput);
            }
            // Enhanced toast messages
            if (result.isValid) {
                toast({
                    title: "✅ Valid JSON",
                    description: "JSON is properly formatted and ready to use",
                    variant: "success",
                });
            }
            else {
                const errorCount = result.errors.length;
                toast({
                    title: `❌ Invalid JSON (${errorCount} issue${errorCount > 1 ? "s" : ""})`,
                    description: result.correctedJson
                        ? "Auto-fix suggestions available"
                        : "Please review and fix the errors",
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            console.error("JSON validation error:", error);
            setValidationResult({
                isValid: false,
                errors: [
                    `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                ],
            });
            toast({
                title: "Validation Error",
                description: "An unexpected error occurred during validation",
                variant: "destructive",
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    const formatJson = () => {
        try {
            if (!jsonInput || jsonInput.trim() === "") {
                toast({
                    title: "Empty Input",
                    description: "Please enter JSON content to format",
                    variant: "warning",
                });
                return;
            }
            // Try to format with different indentation levels
            let formatted;
            try {
                formatted = JsonValidator.format(jsonInput, 2);
            }
            catch (firstError) {
                // Try auto-fix first, then format
                const autoFixed = JsonValidator.validate(jsonInput);
                if (autoFixed.correctedJson) {
                    formatted = JsonValidator.format(autoFixed.correctedJson, 2);
                    toast({
                        title: "JSON Auto-Fixed & Formatted",
                        description: "JSON was automatically corrected and formatted",
                        variant: "success",
                    });
                }
                else {
                    throw firstError;
                }
            }
            setJsonInput(formatted);
            if (!toast.title?.includes("Auto-Fixed")) {
                toast({
                    title: "✨ JSON Formatted",
                    description: "JSON has been properly formatted with 2-space indentation",
                    variant: "success",
                });
            }
        }
        catch (error) {
            console.error("JSON formatting error:", error);
            toast({
                title: "Format Error",
                description: error instanceof Error ? error.message : "Cannot format invalid JSON",
                variant: "destructive",
            });
        }
    };
    const applyAutoFix = () => {
        if (validationResult?.correctedJson) {
            setJsonInput(validationResult.correctedJson);
            validateJson();
            toast({
                title: "Auto-fix Applied",
                description: "Common JSON issues have been corrected",
                variant: "success",
            });
        }
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonInput);
        toast({
            title: "Copied",
            description: "JSON copied to clipboard",
            variant: "success",
        });
    };
    const downloadJson = () => {
        try {
            // Validate JSON before download
            const validationResult = JsonValidator.validate(jsonInput);
            let jsonToDownload = jsonInput;
            if (!validationResult.isValid && validationResult.correctedJson) {
                jsonToDownload = validationResult.correctedJson;
                toast({
                    title: "Auto-corrected JSON",
                    description: "Downloaded JSON was automatically corrected",
                    variant: "warning",
                });
            }
            else if (!validationResult.isValid) {
                toast({
                    title: "Invalid JSON",
                    description: "Cannot download invalid JSON. Please fix errors first.",
                    variant: "destructive",
                });
                return;
            }
            // Safely create blob with validated JSON
            const safeJson = JsonValidator.safeStringify(JSON.parse(jsonToDownload), 2);
            const blob = new Blob([safeJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "validated.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({
                title: "Download Complete",
                description: "JSON file downloaded successfully",
                variant: "success",
            });
        }
        catch (error) {
            console.error("Download failed:", error);
            toast({
                title: "Download Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        }
    };
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(CheckCircle, { className: "w-6 h-6 mr-2 text-green-600" }), "JSON Debugger & Validator"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Validate, format, and fix JSON syntax issues" })] }), _jsx("div", { className: "flex items-center space-x-2", children: validationResult && (_jsx(Badge, { className: validationResult.isValid
                                ? "text-green-600 bg-green-100"
                                : "text-red-600 bg-red-100", children: validationResult.isValid ? "VALID" : "INVALID" })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JSON Input" }), _jsx(CardDescription, { children: "Paste your JSON here to validate and debug" })] }), _jsxs(CardContent, { children: [_jsx(Textarea, { value: jsonInput, onChange: (e) => setJsonInput(e.target.value), placeholder: "Paste your JSON here...", className: "min-h-[300px] font-mono text-sm" }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsx(Button, { onClick: validateJson, disabled: isValidating, children: isValidating ? "Validating..." : "Validate JSON" }), _jsx(Button, { variant: "outline", onClick: formatJson, children: "Format JSON" }), _jsxs(Button, { variant: "outline", onClick: copyToClipboard, children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", onClick: downloadJson, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] })] })] })] }), validationResult && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [validationResult.isValid ? (_jsx(CheckCircle, { className: "w-5 h-5 mr-2 text-green-600" })) : (_jsx(XCircle, { className: "w-5 h-5 mr-2 text-red-600" })), "Validation Results"] }) }), _jsx(CardContent, { children: validationResult.isValid ? (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Valid JSON" }), _jsx(AlertDescription, { className: "text-green-700", children: "Your JSON is properly formatted and valid." })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(XCircle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Invalid JSON" }), _jsxs(AlertDescription, { className: "text-red-700", children: [validationResult.errors.length, " error(s) found:", _jsx("ul", { className: "list-disc list-inside mt-2", children: validationResult.errors.map((error, index) => (_jsx("li", { className: "text-sm", children: error }, index))) })] })] }), validationResult.correctedJson && (_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Auto-fix Available" }), _jsxs(AlertDescription, { className: "text-blue-700", children: ["We found potential fixes for your JSON.", _jsx(Button, { variant: "outline", size: "sm", className: "ml-2", onClick: applyAutoFix, children: "Apply Auto-fix" })] })] }))] })) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JSON Formatting Rules" }), _jsx(CardDescription, { children: "Common rules to follow for valid JSON" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: JsonValidator.getFormattingRules().map((rule, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-gray-700", children: rule })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Common JSON Errors & Fixes" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-l-4 border-red-500 pl-4", children: [_jsx("h4", { className: "font-medium text-red-800", children: "Trailing Commas" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u274C ", `{"key": "value",}`] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u2705 ", `{"key": "value"}`] })] }), _jsxs("div", { className: "border-l-4 border-red-500 pl-4", children: [_jsx("h4", { className: "font-medium text-red-800", children: "Single Quotes" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u274C ", `{'key': 'value'}`] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u2705 ", `{"key": "value"}`] })] }), _jsxs("div", { className: "border-l-4 border-red-500 pl-4", children: [_jsx("h4", { className: "font-medium text-red-800", children: "Unquoted Keys" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u274C ", `{key: "value"}`] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u2705 ", `{"key": "value"}`] })] }), _jsxs("div", { className: "border-l-4 border-red-500 pl-4", children: [_jsx("h4", { className: "font-medium text-red-800", children: "Unescaped Quotes" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u274C ", `{"message": "He said "Hello""}`] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u2705 ", `{"message": "He said \"Hello\""}`] })] })] }) })] })] }));
}
